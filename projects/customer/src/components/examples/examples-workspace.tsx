
import {
    AlertTriangle,
    BookOpenCheck,
    Database,
    ExternalLink,
    FileCode2,
    Globe,
    Layers3,
    ListChecks
} from "lucide-react";

import { CodeEditor } from "@/components/editor/code-editor";

const colleagueCode = `function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("colleagueId");
    dataset.addColumn("colleagueName");
    dataset.addColumn("login");
    dataset.addColumn("mail");
    dataset.addColumn("active");

    try {
        var origem = DatasetFactory.getDataset(
            "colleague",
            null,
            constraints,
            sortFields
        );

        if (origem != null) {
            for (var i = 0; i < origem.rowsCount; i++) {
                var linha = [];
                linha.push(origem.getValue(i, "colleaguePK.colleagueId"));
                linha.push(origem.getValue(i, "colleagueName"));
                linha.push(origem.getValue(i, "login"));
                linha.push(origem.getValue(i, "mail"));
                linha.push(origem.getValue(i, "active"));
                dataset.addRow(linha);
            }
        }
    } catch (e) {
        log.error("Erro ao consultar o dataset colleague: " + e);
        throw e;
    }

    return dataset;
}`;

const manualCode = `function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("CODIGO");
    dataset.addColumn("DESCRICAO");

    // Exemplo ilustrativo de valores definidos manualmente.
    dataset.addRow(["1", "Aberto"]);
    dataset.addRow(["2", "Em andamento"]);
    dataset.addRow(["3", "Finalizado"]);

    return dataset;
}`;

const fluigCode = `var origem = DatasetFactory.getDataset(
    "colleague",
    null,
    constraints,
    sortFields
);

// O segundo parâmetro pode receber um array de campos.
// Use null para solicitar todos os campos disponíveis.
// Confirme os nomes das colunas no dataset do seu ambiente.`;

const restCode = `// Exemplo de contrato a informar no requisito:
// Método: GET
// Endpoint: https://api.suaempresa.com/v1/fornecedores
// Resposta esperada: { "items": [{ "id": 10, "name": "Fornecedor" }] }
//
// Informe também autenticação, paginação e mapeamento dos campos.
// Não coloque senhas, tokens ou chaves diretamente no requisito/código.
// O mecanismo HTTP deve ser compatível com o runtime da sua versão Fluig.`;

const sqlCode = `function createDataset(fields, constraints, sortFields) {
    var jndiName = "java:/jdbc/AppDS";
    var sql = "SELECT CODIGO, DESCRICAO FROM FORNE";

    return DatasetFactory.getDataset(
        "dsSQL",
        new Array(jndiName, sql),
        null,
        null
    );
}`;

function ExampleField({
    label,
    value,
    multiline = false
}: {
    label: string;
    value: string;
    multiline?: boolean;
}) {
    return (
        <label className="field-label example-field">
            {label}

            {multiline ? (
                <textarea
                    value={value}
                    readOnly
                    rows={3}
                />
            ) : (
                <input
                    value={value}
                    readOnly
                />
            )}
        </label>
    );
}

function ExampleSourceSelect() {
    return (
        <label className="field-label example-field">
            Tipo de origem

            <select
                value="fluig_dataset"
                disabled
                aria-label="Tipo de origem do exemplo"
            >
                <option value="manual">
                    Regra manual / estrutura inicial
                </option>

                <option value="fluig_dataset">
                    Outro dataset Fluig
                </option>

                <option value="rest_api">
                    API REST
                </option>

                <option value="sql">
                    Banco SQL externo
                </option>
            </select>
        </label>
    );
}

function GuideCard({
    icon: Icon,
    title,
    intro,
    values,
    code,
    note,
}: {
    icon: typeof Database;
    title: string;
    intro: string;
    values: Array<[string, string]>;
    code: string;
    note: string;
}) {
    return (
        <article className="panel example-guide-card">

            <div className="example-guide-title">
                <span className="example-guide-icon">
                    <Icon size={17} />
                </span>

                <div>
                    <h3>{title}</h3>
                    <p>{intro}</p>
                </div>
            </div>

            <div className="example-values">
                {values.map(([label, value]) => (
                    <div className="example-value" key={label}>
                        <span>{label}</span>
                        <code>{value}</code>
                    </div>
                ))}
            </div>

            <pre className="code-preview example-code">
                {code}
            </pre>

            <p className="example-note">
                <AlertTriangle size={14} />
                {note}
            </p>

        </article>
    );
}

export function ExamplesWorkspace() {
    return (
        <div className="module-page">

            <div className="page-intro">
                <div className="eyebrow">
                    <span className="eyebrow-line" />
                    GUIA PRÁTICO
                </div>

                <h1>Exemplos de datasets</h1>

                <p>
                    Veja como preencher o Gerador de datasets para cada tipo
                    de origem e use o exemplo completo do dataset colleague
                    como referência.
                </p>
            </div>

            <div className="example-callout">
                <BookOpenCheck size={17} />

                <p>
                    <strong>Esta página é demonstrativa.</strong> Os campos
                    estão preenchidos como referência e o código é somente
                    para consulta. Para gerar, editar e salvar um dataset,
                    acesse <strong>Gerar dataset</strong>.
                </p>
            </div>

            <section
                className="workspace-grid examples-workspace-grid"
                aria-labelledby="colleague-example-title"
            >

                <div className="panel form-panel">

                    <div className="panel-heading">
                        <div>
                            <h2 id="colleague-example-title">
                                Requisitos do dataset
                            </h2>

                            <p>
                                Exemplo preenchido: consulta aos usuários
                                cadastrados no Fluig.
                            </p>
                        </div>

                        <span className="mini-badge">
                            EXEMPLO
                        </span>
                    </div>

                    <ExampleField
                        label="Nome do dataset"
                        value="dsConsultaColleague"
                    />

                    <ExampleField
                        label="O que o dataset deve fazer?"
                        multiline
                        value="Consultar os usuários cadastrados no Fluig por meio do dataset nativo colleague. Retornar identificador, nome, login, e-mail e status de ativação. Permitir que filtros recebidos por constraints sejam encaminhados à consulta."
                    />

                    <div className="form-row">
                        <ExampleSourceSelect />

                        <ExampleField
                            label="Versão Fluig"
                            value="Não informada"
                        />
                    </div>

                    <ExampleField
                        label="Dataset / origem (quando aplicável)"
                        value="colleague"
                    />

                    <ExampleField
                        label="Colunas desejadas"
                        value="colleagueId, colleagueName, login, mail, active"
                    />

                    <ExampleField
                        label="Regras de negócio adicionais"
                        multiline
                        value="Utilizar DatasetFactory.getDataset. Encaminhar constraints e sortFields recebidos. Percorrer os registros retornados e mapear somente as colunas solicitadas. Não retornar senhas ou informações confidenciais."
                    />

                    <div className="example-readonly-hint">
                        <ListChecks size={14} />
                        Campos somente para leitura — copie os valores
                        para experimentar no Gerador.
                    </div>

                </div>

                <div className="panel result-panel">

                    <div className="panel-heading">
                        <div>
                            <h2>Resultado esperado</h2>

                            <p>
                                Estrutura ilustrativa consultando o
                                dataset nativo colleague.
                            </p>
                        </div>

                        <span className="mini-badge local">
                            FLUIG
                        </span>
                    </div>

                    <CodeEditor
                        value={colleagueCode}
                        readOnly
                        height={470}
                    />

                    <div className="result-details">

                        <h3>Como funciona</h3>

                        <p>
                            O código cria um novo dataset de saída,
                            consulta o dataset nativo colleague com
                            DatasetFactory.getDataset e percorre os
                            registros para copiar os campos selecionados.
                            O identificador é lido da propriedade
                            colleaguePK.colleagueId e exposto na saída
                            como colleagueId.
                        </p>

                        <h3>Atenção aos campos</h3>

                        <p>
                            Os nomes e a disponibilidade dos campos podem
                            variar conforme a versão e a configuração do
                            ambiente. Confirme os campos no Dataset de
                            sua instalação antes de publicar.
                        </p>

                    </div>

                </div>

            </section>

            <section className="example-guides-section">

                <div className="example-section-heading">
                    <div>

                        <div className="eyebrow">
                            <span className="eyebrow-line" />
                            COMO PREENCHER
                        </div>

                        <h2>Guia por tipo de origem</h2>

                        <p>
                            Selecione no formulário o tipo correspondente
                            à fonte de dados e preencha os demais campos
                            conforme estes exemplos.
                        </p>

                    </div>
                </div>

                <div className="example-guide-grid">

                    <GuideCard
                        icon={Layers3}
                        title="Regra manual / estrutura inicial"
                        intro="Use quando os dados serão definidos no próprio código ou quando deseja começar somente com a estrutura do dataset."
                        values={[
                            ["Nome", "dsStatusSolicitacao"],
                            ["Tipo de origem", "Regra manual / estrutura inicial"],
                            ["Dataset / origem", "Deixe vazio"],
                            ["Colunas", "CODIGO, DESCRICAO"],
                            ["Descrição", "Retornar uma lista fixa de status da solicitação."],
                            ["Regras", "Adicionar uma linha por status e não consultar fonte externa."],
                        ]}
                        code={manualCode}
                        note="Os valores do trecho são apenas ilustrativos. Substitua-os pelas regras reais do processo."
                    />

                    <GuideCard
                        icon={Database}
                        title="Outro dataset Fluig"
                        intro="Use quando o dataset de saída consulta outro dataset já existente na plataforma."
                        values={[
                            ["Nome", "dsConsultaColleague"],
                            ["Tipo de origem", "Outro dataset Fluig"],
                            ["Dataset / origem", "colleague"],
                            ["Colunas", "colleagueId, colleagueName, login, mail, active"],
                            ["Descrição", "Consultar os usuários cadastrados no Fluig."],
                            ["Regras", "Encaminhar constraints e sortFields recebidos."],
                        ]}
                        code={fluigCode}
                        note="O primeiro parâmetro é o nome do dataset de origem. Confirme seus campos e constraints na instalação."
                    />

                    <GuideCard
                        icon={Globe}
                        title="API REST"
                        intro="Use quando os dados vêm de um serviço HTTP/REST externo ou de uma API autorizada."
                        values={[
                            ["Nome", "dsConsultaApiFornecedores"],
                            ["Tipo de origem", "API REST"],
                            ["Dataset / origem", "URL do endpoint autorizado"],
                            ["Colunas", "CODIGO, DESCRICAO"],
                            ["Descrição", "Consultar fornecedores retornados pela API."],
                            ["Regras", "Informar método, JSON, autenticação e paginação."],
                        ]}
                        code={restCode}
                        note="Use uma URL real do serviço e informe o contrato da resposta. Nunca cole senhas, tokens ou chaves nos campos."
                    />

                    <GuideCard
                        icon={FileCode2}
                        title="Banco SQL externo"
                        intro="Use quando a consulta será executada em uma conexão externa configurada no Fluig por meio do dataset dsSQL."
                        values={[
                            ["Nome", "dsFornecedoresSql"],
                            ["Tipo de origem", "Banco SQL externo"],
                            ["Dataset / origem", "java:/jdbc/AppDS (JNDI)"],
                            ["Colunas", "CODIGO, DESCRICAO"],
                            ["Descrição", "Consultar a tabela física FORNE."],
                            ["Regras", "SELECT CODIGO, DESCRICAO FROM FORNE"],
                        ]}
                        code={sqlCode}
                        note="Informe o JNDI cadastrado e o nome físico real da tabela. A conexão e o dataset dsSQL precisam existir no ambiente."
                    />

                </div>

            </section>

            <section className="panel example-checklist-panel">

                <div className="example-guide-title">

                    <span className="example-guide-icon">
                        <ListChecks size={17} />
                    </span>

                    <div>
                        <h2>Antes de clicar em “Gerar dataset”</h2>

                        <p>
                            Use esta conferência rápida para melhorar
                            a precisão do código produzido.
                        </p>
                    </div>

                </div>

                <ul className="example-checklist">
                    <li>
                        Escolha a origem correta: manual, dataset Fluig,
                        API REST ou SQL externo.
                    </li>

                    <li>
                        Informe o identificador técnico da origem,
                        não apenas o nome amigável.
                    </li>

                    <li>
                        Liste as colunas exatamente como existem
                        na fonte de dados.
                    </li>

                    <li>
                        Descreva filtros, ordenação, paginação e
                        comportamento para resultados vazios.
                    </li>

                    <li>
                        Não informe credenciais ou segredos nos requisitos.
                    </li>

                    <li>
                        Revise o código e teste em homologação antes
                        de publicar no Fluig.
                    </li>
                </ul>

                <a
                    className="example-doc-link"
                    href="https://tdn-homolog.totvs.com/display/public/fluig/Acessando+Datasets"
                    target="_blank"
                    rel="noreferrer"
                >
                    Documentação TOTVS: Acessando Datasets
                    <ExternalLink size={13} />
                </a>

            </section>

        </div>
    );
}
