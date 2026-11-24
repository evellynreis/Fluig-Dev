
import "server-only";
import { z } from "zod";
import { validateDatasetSource } from "@/server/validation";
import type { AiAction, AiRequest, DatasetAiResult, DatasetGenerationInput } from "@/types/dataset";

const aiResultSchema = z.object({
  summary: z.string().default("Resultado gerado"),
  code: z.string().default(""),
  explanation: z.string().default(""),
  fields: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  compatibilityNotes: z.string().default(""),
  findings: z.array(
    z.object({
      severity: z.enum(["error", "warning", "info"]),
      title: z.string(),
      detail: z.string(),
      line: z.number().optional(),
      column: z.number().optional(),
    }),
  ).default([]),
  recommendations: z.array(z.string()).default([]),
});

const fluigSystem = `Você é especialista em desenvolvimento de datasets TOTVS Fluig. Responda em português brasileiro. Gere somente JSON válido com as propriedades summary, code, explanation, fields, dependencies, warnings, compatibilityNotes, findings e recommendations. findings é uma lista de {severity,title,detail}, severity error|warning|info. Nunca invente APIs. Para dataset customizado clássico use function createDataset(fields, constraints, sortFields), DatasetBuilder.newDataset(), addColumn(), addRow() e return dataset. Quando consultar outro dataset Fluig, use DatasetFactory.getDataset(nome, campos, constraints, sortFields), preservando as constraints recebidas.

REGRA OBRIGATÓRIA PARA ORIGEM SQL EXTERNO: quando sourceType for "sql", não use DatasetBuilder.newDataset() nem declare colunas manualmente com addColumn(). Use o dataset dsSQL do ambiente Fluig. Declare jndiName com o JNDI informado em dataSource; se estiver vazio, use "java:/jdbc/AppDS" como padrão editável. Declare a consulta na variável sql e retorne exatamente por meio de:
return DatasetFactory.getDataset(
    "dsSQL",
    new Array(jndiName, sql),
    null,
    null
);
Não substitua essa chamada por JDBC, conexão Java, SQL direto ou outro mecanismo. Gere a consulta SQL a partir das informações fornecidas. Se tabela, colunas ou regra estiverem ausentes, deixe um TODO explícito na variável sql e informe a limitação em warnings; não invente nomes de tabelas nem campos.

Para outras origens, não invente datasets, tabelas, endpoints, credenciais, cliente HTTP ou mecanismo de integração. Se faltar origem ou contrato, deixe TODO claro e explique. Use JavaScript ES5 como padrão conservador. Nunca execute o código nem alegue teste real no servidor. Não inclua dados fictícios como se fossem reais.`;

function normalizeFields(input: DatasetGenerationInput): string[] {
  return (input.fields.length ? input.fields : ["CODIGO", "DESCRICAO"]).map(
    (value) => value.replace(/[^A-Za-z0-9_]/g, "_").replace(/^[^A-Za-z_$]+/, "").toUpperCase() || "CAMPO",
  );
}

function extractSqlTableName(sourceText: string): string | null {
  // Aceita formas como "tabela FORNE", "tabela de Fornecedores",
  // "tabela dos Fornecedores" e "tabela: FORNE".
  const tablePattern = /\btabela(?:\s*[:=]\s*|\s+)(?:(?:de|do|da|dos|das)\s+)?["'`]?([A-Za-z][A-Za-z0-9_$#]*(?:\.[A-Za-z][A-Za-z0-9_$#]*)?)/gi;
  const stopWords = new Set([
    "a", "as", "ao", "aos", "com", "como", "da", "das", "de", "do", "dos",
    "e", "em", "essa", "esse", "esta", "este", "na", "nas", "no", "nos",
    "o", "os", "para", "pela", "pelas", "pelo", "pelos", "por", "que",
    "um", "uma", "uns", "umas", "dados", "banco", "informacao", "informacoes",
  ]);

  for (const match of sourceText.matchAll(tablePattern)) {
    const candidate = match[1];
    if (!stopWords.has(candidate.toLocaleLowerCase("pt-BR"))) {
      return candidate;
    }
  }

  // Também aceita uma tabela indicada explicitamente em FROM ou JOIN.
  const sqlReference = sourceText.match(/\b(?:FROM|JOIN)\s+["'`]?([A-Za-z][A-Za-z0-9_$#]*(?:\.[A-Za-z][A-Za-z0-9_$#]*)?)/i);
  return sqlReference?.[1] ?? null;
}

function buildLocalSql(input: DatasetGenerationInput, fields: string[]): DatasetAiResult {
  const jndiName = input.dataSource.trim() || "java:/jdbc/AppDS";
  const sourceText = `${input.description}\n${input.rules}`;

  // Se o usuário já informou uma consulta SELECT completa, ela tem prioridade.
  const explicitSql = sourceText.match(/\bSELECT\b[\s\S]*?(?=;|$)/i)?.[0]?.trim();

  // Identifica o nome depois de expressões como "tabela de Fornecedores",
  // ignorando a preposição para não gerar incorretamente "FROM de".
  const tableName = extractSqlTableName(sourceText);
  const selectedColumns = fields.length > 0 ? fields.join(", ") : "*";
  const sql = explicitSql || (tableName ? `SELECT ${selectedColumns} FROM ${tableName}` : "");

  const code = `function createDataset(fields, constraints, sortFields) {
    var jndiName = ${JSON.stringify(jndiName)};
    var sql = ${JSON.stringify(sql)};

    try {
        if (sql == "") {
            throw "Informe uma consulta SELECT ou descreva a tabela de origem antes de executar o dataset.";
        }

        return DatasetFactory.getDataset(
            "dsSQL",
            new Array(jndiName, sql),
            null,
            null
        );
    } catch (e) {
        log.error("Fluig Dev - erro ao consultar o banco SQL: " + e);
        throw e;
    }
}
`;

  const warnings = [
    "Origem SQL externa: o código utiliza o dataset dsSQL com os parâmetros JNDI e consulta SQL.",
    "Confirme se o JNDI informado existe no ambiente Fluig e se o dataset dsSQL está configurado.",
    "A geração local identifica consultas SELECT simples; revise filtros, JOINs, ordenações e regras adicionais antes de publicar.",
    "Confirme a compatibilidade com a versão do Fluig instalada e teste em homologação.",
  ];

  if (!input.dataSource.trim()) {
    warnings.push("Foi utilizado o JNDI padrão java:/jdbc/AppDS, conforme o exemplo fornecido. Altere-o se sua conexão tiver outro nome.");
  }
  if (tableName && !explicitSql) {
    warnings.push(`Nome interpretado como tabela: ${tableName}. Confirme se esse é exatamente o identificador físico utilizado no banco de dados; o nome amigável "Fornecedores", por exemplo, pode corresponder a outro nome técnico, como FORNE.`);
  }
  if (!sql) {
    warnings.push("Não foi possível identificar uma consulta SQL completa nem o nome da tabela. O código contém uma validação para impedir a execução com SQL vazio.");
  }

  return {
    summary: "Estrutura SQL criada localmente com dsSQL.",
    code,
    explanation: sql
      ? `Como o tipo de origem é Banco SQL externo, o gerador encaminha a consulta à conexão ${jndiName} por meio de DatasetFactory.getDataset("dsSQL", new Array(jndiName, sql), null, null). A consulta foi montada com as colunas informadas e a tabela identificada no requisito.`
      : `Como o tipo de origem é Banco SQL externo, o gerador utiliza o padrão dsSQL. Não foi possível montar o SELECT porque o nome da tabela ou uma consulta completa não foi informado.`,
    fields,
    dependencies: ["DatasetFactory", "log"],
    warnings,
    compatibilityNotes: `Versão Fluig: ${input.fluigVersion || "não informada"}. JNDI configurado: ${jndiName}. Confirme a configuração do dataset dsSQL no ambiente.`,
    findings: [],
    recommendations: [
      "Confira o nome da conexão JNDI antes de executar.",
      "Revise a consulta SQL e inclua filtros, JOINs ou ordenações necessários.",
      "Teste o dataset em ambiente Fluig de homologação antes de publicar.",
    ],
  };
}

function localGenerate(input: DatasetGenerationInput): DatasetAiResult {
  const fields = normalizeFields(input);

  // SQL externo possui um fluxo próprio: o retorno vem do dsSQL, não do DatasetBuilder.
  if (input.sourceType === "sql") {
    return buildLocalSql(input, fields);
  }

  const columns = fields.map((field) => `    dataset.addColumn("${field}");`).join("\n");
  const dependencies = ["DatasetBuilder", "log"];
  let sourceBlock = "";

  if (input.sourceType === "fluig_dataset" && input.dataSource) {
    dependencies.push("DatasetFactory");
    const sourceName = input.dataSource.replace(/[^A-Za-z0-9_.-]/g, "");
    sourceBlock = `
        var origem = DatasetFactory.getDataset("${sourceName}", null, constraints, sortFields);
        if (origem != null) {
            for (var i = 0; i < origem.rowsCount; i++) {
                var linha = [];
${fields.map((field) => `                linha.push(origem.getValue(i, "${field}"));`).join("\n")}
                dataset.addRow(linha);
            }
        }`;
  } else if (input.sourceType === "fluig_dataset") {
    sourceBlock = `
        // TODO: informe o nome do dataset de origem e o mapeamento das colunas.
        // As constraints recebidas devem ser encaminhadas ou aplicadas conforme a regra de negócio.`;
  } else if (input.sourceType === "rest_api") {
    sourceBlock = `
        // TODO: informe URL, método, autenticação e contrato JSON da API.
        // O mecanismo HTTP deve ser confirmado na versão/runtime Fluig do ambiente.`;
  } else {
    sourceBlock = `
        // TODO: implemente a regra de negócio que popula as linhas com dataset.addRow([...]).
        // Nenhum dado fictício é inserido automaticamente.`;
  }

  const code = `function createDataset(fields, constraints, sortFields) {
    // Requisito: ${JSON.stringify(input.description)}
    // Regras adicionais: ${JSON.stringify(input.rules)}
    var dataset = DatasetBuilder.newDataset();
${columns}

    try {${sourceBlock}
    } catch (e) {
        log.error("Fluig Dev - erro ao criar dataset: " + e);
        throw e;
    }

    return dataset;
}
`;

  const warnings = [
    "Geração local por modelo: a OpenAI não foi utilizada.",
    "Confirme a compatibilidade com a versão do Fluig instalada e teste em homologação.",
  ];
  if (input.sourceType !== "fluig_dataset" || !input.dataSource) {
    warnings.push("A origem ainda exige configuração técnica; consulte os comentários TODO no código.");
  }
  if (input.sourceType === "fluig_dataset" && input.dataSource) {
    warnings.push("Confirme se os nomes das colunas informadas existem no dataset de origem.");
  }

  return {
    summary: "Estrutura de dataset criada localmente.",
    code,
    explanation: "O modelo cria o dataset e declara as colunas. A regra de origem está indicada por comentários TODO quando os dados ou integrações ainda não foram especificados.",
    fields,
    dependencies,
    warnings,
    compatibilityNotes: `Versão Fluig: ${input.fluigVersion || "não informada"}. Foi adotado JavaScript ES5 como perfil conservador; isso não comprova compatibilidade do servidor.`,
    findings: [],
    recommendations: [
      "Revise os TODOs e informe a origem real dos dados.",
      "Confirme as APIs na documentação da sua versão.",
      "Teste no Fluig de homologação antes de publicar.",
    ],
  };
}

function localAnalyse(action: AiAction, code: string): DatasetAiResult {
  const validation = validateDatasetSource(code);
  const fields = [...code.matchAll(/addColumn\s*\(\s*["']([^"']+)["']\s*\)/g)].map((match) => match[1]);
  const explanation = [
    "Análise estática local: o código não foi executado.",
    /function\s+createDataset/.test(code) ? "Foi encontrada a função createDataset." : "Não foi encontrada a função createDataset.",
    fields.length ? `Colunas declaradas: ${fields.join(", ")}.` : "Não foram detectadas colunas addColumn().",
    code.includes('DatasetFactory.getDataset("dsSQL"') || code.includes("DatasetFactory.getDataset('dsSQL'")
      ? "Foi encontrada uma chamada ao dataset dsSQL para consulta SQL externa."
      : code.includes("DatasetFactory.getDataset")
        ? "Há consulta a outro dataset Fluig."
        : "Não foi detectada consulta DatasetFactory.",
    /constraints/.test(code) ? "O parâmetro constraints aparece no código." : "Não foi detectado uso de constraints.",
  ].join("\n\n");

  return {
    summary: validation.valid ? "A análise estática não encontrou erros críticos." : "A análise encontrou pontos que precisam de correção.",
    code,
    explanation,
    fields,
    dependencies: [...(code.includes("DatasetBuilder") ? ["DatasetBuilder"] : []), ...(code.includes("DatasetFactory") ? ["DatasetFactory"] : []), ...(code.includes("log.") ? ["log"] : [])],
    warnings: validation.findings.filter((item) => item.severity !== "error").map((item) => item.detail),
    compatibilityNotes: "A análise estática não substitui teste no servidor Fluig.",
    findings: validation.findings,
    recommendations: [
      "Corrija todos os erros antes de publicar.",
      "Revise a origem e o tratamento das constraints.",
      "Teste em ambiente Fluig não produtivo.",
    ],
  };
}

function hasRequiredSqlDatasetCall(code: string): boolean {
  return /return\s+DatasetFactory\.getDataset\s*\(\s*["']dsSQL["']\s*,\s*new\s+Array\s*\(\s*jndiName\s*,\s*sql\s*\)\s*,\s*null\s*,\s*null\s*\)\s*;?/i.test(code);
}

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim() || null;
}

export function isOpenAiConfigured() {
  return Boolean(getApiKey());
}

export async function runAi(
  request: AiRequest,
  generation?: DatasetGenerationInput,
): Promise<{ result: DatasetAiResult; aiUsed: boolean }> {
  const code = request.code ?? "";
  const apiKey = getApiKey();

  if (!apiKey) {
    if (request.action === "generate" && generation) {
      return { result: localGenerate(generation), aiUsed: false };
    }
    if (["review", "explain"].includes(request.action) && code) {
      return { result: localAnalyse(request.action, code), aiUsed: false };
    }
    if (request.action === "repair" && code) {
      return {
        result: {
          ...localAnalyse("review", code),
          summary: "Correção automática indisponível sem OpenAI.",
          warnings: ["Configure OPENAI_API_KEY para solicitar uma correção gerada por IA."],
          recommendations: ["Edite o código manualmente ou configure a OpenAI API."],
        },
        aiUsed: false,
      };
    }
    throw new Error("Informe os dados necessários para esta operação.");
  }

  const tasks: Record<AiAction, string> = {
    generate: "Gere um dataset Fluig com base nos requisitos. Respeite obrigatoriamente o padrão específico da origem informado em sourceType. Não omita informações ausentes: use TODO e avisos.",
    review: "Revise o código, preserve-o sem alterações e liste problemas, riscos e melhorias.",
    explain: "Explique detalhadamente o código, seu fluxo, colunas, constraints e dependências.",
    repair: "Corrija o código preservando as regras de negócio. Não invente APIs; explique alterações e incertezas.",
  };

  const input = request.action === "generate"
    ? JSON.stringify(generation, null, 2)
    : JSON.stringify({ fluigVersion: request.fluigVersion, prompt: request.prompt, code });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
      instructions: `${fluigSystem}\nTarefa: ${tasks[request.action]}\nResponda em JSON com summary, code, explanation, fields (string[]), dependencies (string[]), warnings (string[]), compatibilityNotes, findings (severity/title/detail) e recommendations (string[]).`,
      input,
      text: { format: { type: "json_object" } },
    }),
    signal: AbortSignal.timeout(90_000),
  });

  const payload = await response.json() as {
    output_text?: string;
    error?: { message?: string };
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI API respondeu HTTP ${response.status}.`);
  }

  const outputText = payload.output_text ?? payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((part) => part.type === "output_text")?.text;
  if (!outputText?.trim()) {
    throw new Error("A OpenAI retornou uma resposta vazia. Tente novamente.");
  }

  const raw = JSON.parse(outputText) as unknown;
  const parsed = aiResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("A resposta da OpenAI não correspondeu ao formato esperado. Tente novamente.");
  }

  const result: DatasetAiResult = { ...parsed.data, code: parsed.data.code || code };

  // Mesmo com OpenAI configurada, impede que a origem SQL use um padrão diferente de dsSQL.
  if (request.action === "generate" && generation?.sourceType === "sql" && !hasRequiredSqlDatasetCall(result.code)) {
    const fallback = localGenerate(generation);
    fallback.warnings.unshift(
      "A resposta da OpenAI não utilizou a chamada dsSQL obrigatória. Foi aplicado o gerador local para preservar o padrão solicitado; a chamada à API ainda pode ter sido cobrada.",
    );
    return { result: fallback, aiUsed: false };
  }

  if (result.code) {
    const validation = validateDatasetSource(result.code);
    result.findings = [...result.findings, ...validation.findings];
  }
  return { result, aiUsed: true };
}
