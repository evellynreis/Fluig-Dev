"use client";

import { useState } from "react";

import {
  AlertCircle,
  Check,
  Clipboard,
  Code2,
  Download,
  Info,
  LoaderCircle,
  Save,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { CodeEditor } from "@/components/editor/code-editor";

import type {
  DatasetAiResult,
  DatasetGenerationInput,
  DatasetReferenceMode,
  DatasetSourceType,
} from "@/types/dataset";

const blank: DatasetGenerationInput = {
  name: "",
  description: "",
  fluigVersion: "",
  sourceType: "manual",
  dataSource: "",
  fields: ["CODIGO", "DESCRICAO"],
  rules: "",
  referenceMode: "adapt",
  referenceCode: "",
};

const referenceModeHelp: Record<DatasetReferenceMode, string> = {
  adapt:
    "Aproveita padrões compatíveis do código-base, como conexão, logs, funções auxiliares e mapeamentos. A lógica principal é adaptada aos novos requisitos.",

  structure:
    "Preserva a organização do código-base, o tratamento de erros, o logging e funções auxiliares seguras. Substitui a implementação específica pelos novos requisitos.",

  logic:
    "Aproveita regras identificáveis, filtros, constraints, mapeamentos e transformações pertinentes, sem copiar automaticamente toda a implementação.",
};

export function GeneratorWorkspace() {
  const [form, setForm] = useState<DatasetGenerationInput>(blank);

  const [fieldText, setFieldText] = useState("CODIGO, DESCRICAO");

  const [result, setResult] = useState<DatasetAiResult | null>(null);
  const [provider, setProvider] = useState("");

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function change<K extends keyof DatasetGenerationInput>(
    key: K,
    value: DatasetGenerationInput[K],
  ) {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));
  }

  async function generate() {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const payload: DatasetGenerationInput = {
        ...form,
        fields: fieldText
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        referenceCode: form.referenceCode ?? "",
        referenceMode: form.referenceMode ?? "adapt",
      };

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          dataset: payload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao gerar dataset.");
      }

      setResult(data.result);
      setProvider(data.provider);

      setMessage(
        data.provider === "openai"
          ? "Dataset gerado com OpenAI e orientado pelo código de referência."
          : "Dataset criado pelo mecanismo local. O código-base foi analisado sem utilizar a OpenAI.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Erro inesperado ao gerar dataset.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!result) return;

    setSaving(true);
    setError("");

    try {
      // Não salva referenceCode nem referenceMode.
      const datasetToSave = {
        name: form.name,
        description: form.description,
        fluigVersion: form.fluigVersion,
        sourceType: form.sourceType,
        dataSource: form.dataSource,
        fields: result.fields.length
          ? result.fields
          : fieldText
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
        rules: form.rules,
      };

      const response = await fetch("/api/datasets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...datasetToSave,
          ...result,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao salvar.");
      }

      setMessage(
        `Dataset salvo na biblioteca (versão ${data.dataset.version}). O código-base não foi armazenado.`,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function copy() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.code);
      setMessage("Código copiado.");
    } catch {
      setError("Não foi possível copiar o código.");
    }
  }

  function download() {
    if (!result) return;

    const blob = new Blob([result.code], {
      type: "text/javascript;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${(form.name || "dataset").replace(/[^a-z0-9_-]/gi, "_")}.js`;

    anchor.click();
    URL.revokeObjectURL(url);
  }

  const referenceCode = form.referenceCode ?? "";
  const referenceMode = form.referenceMode ?? "adapt";

  return (
    <div className="workspace-grid">
      <section className="panel form-panel">
        <div className="panel-heading">
          <div>
            <h2>Requisitos do dataset</h2>
            <p>Descreva o comportamento esperado e a origem dos dados.</p>
          </div>

          <WandSparkles size={19} />
        </div>

        <label className="field-label">
          Nome do dataset
          <input
            value={form.name}
            onChange={(event) => change("name", event.target.value)}
            placeholder="Ex.: ds_fornecedores"
            maxLength={100}
          />
        </label>

        <label className="field-label">
          O que o dataset deve fazer?
          <textarea
            value={form.description}
            onChange={(event) => change("description", event.target.value)}
            placeholder="Descreva a finalidade, os dados retornados e o comportamento esperado..."
            rows={5}
            maxLength={8000}
          />
        </label>

        <div className="form-row">
          <label className="field-label">
            Tipo de origem
            <select
              value={form.sourceType}
              onChange={(event) =>
                change("sourceType", event.target.value as DatasetSourceType)
              }
            >
              <option value="manual">Regra manual / estrutura inicial</option>

              <option value="fluig_dataset">Outro dataset Fluig</option>

              <option value="rest_api">API REST</option>

              <option value="sql">Banco SQL externo</option>
            </select>
          </label>

          <label className="field-label">
            Versão Fluig
            <input
              value={form.fluigVersion}
              onChange={(event) => change("fluigVersion", event.target.value)}
              placeholder="Não informada"
            />
          </label>
        </div>

        <label className="field-label">
          Dataset / origem (quando aplicável)
          <input
            value={form.dataSource}
            onChange={(event) => change("dataSource", event.target.value)}
            placeholder="Ex.: colleague"
          />
        </label>

        <label className="field-label">
          Colunas desejadas
          <input
            value={fieldText}
            onChange={(event) => setFieldText(event.target.value)}
            placeholder="CODIGO, NOME, STATUS"
          />
          <small>Separe os nomes por vírgula.</small>
        </label>

        <label className="field-label">
          Regras de negócio adicionais
          <textarea
            value={form.rules}
            onChange={(event) => change("rules", event.target.value)}
            placeholder="Filtros, validações, ordenação, regras específicas..."
            rows={3}
            maxLength={4000}
          />
        </label>

        <section className="reference-panel">
          <div className="reference-heading">
            <div className="reference-heading-icon">
              <Code2 size={17} />
            </div>

            <div>
              <h3>
                Código de referência
                <span>OPCIONAL</span>
              </h3>

              <p>
                Informe um dataset que já funciona no seu Fluig. O gerador vai
                utilizá-lo como base para o novo código.
              </p>
            </div>
          </div>

          <label className="field-label">
            Como deseja utilizar o código-base?
            <select
              value={referenceMode}
              onChange={(event) =>
                change(
                  "referenceMode",
                  event.target.value as DatasetReferenceMode,
                )
              }
            >
              <option value="adapt">Utilizar como referência</option>

              <option value="structure">Manter estrutura</option>

              <option value="logic">Utilizar apenas a lógica</option>
            </select>
          </label>

          <p className="reference-mode-help">
            {referenceModeHelp[referenceMode]}
          </p>

          <label className="field-label">
            Código-base
            <textarea
              className="reference-code-input"
              value={referenceCode}
              onChange={(event) => change("referenceCode", event.target.value)}
              placeholder={
                "Cole aqui o código completo de um dataset Fluig que já funciona...\n\nfunction createDataset(fields, constraints, sortFields) {\n    // Código de referência\n}"
              }
              rows={10}
              maxLength={40000}
              spellCheck={false}
            />
            <small>
              {referenceCode.length.toLocaleString("pt-BR")} / 40.000 caracteres
            </small>
          </label>

          <div className="reference-safety-note">
            <Info size={14} />

            <span>
              O código não será executado nem salvo na biblioteca. Sem OpenAI, o
              Fluig Dev analisará sua estrutura, funções auxiliares, mapeamentos
              e constraints reconhecíveis. Não cole senhas, tokens, chaves ou
              credenciais.
            </span>
          </div>
        </section>

        <button
          className="primary-button full-button"
          type="button"
          onClick={generate}
          disabled={
            busy || !form.name.trim() || form.description.trim().length < 5
          }
        >
          {busy ? (
            <LoaderCircle className="spin" size={16} />
          ) : (
            <Sparkles size={16} />
          )}

          {busy ? "Gerando..." : "Gerar dataset"}
        </button>

        {message && (
          <p className="success-message">
            <Check size={15} />
            {message}
          </p>
        )}

        {error && (
          <p className="error-message">
            <AlertCircle size={15} />
            {error}
          </p>
        )}
      </section>

      <section className="panel result-panel">
        <div className="panel-heading">
          <div>
            <h2>Resultado</h2>
            <p>{result ? result.summary : "O código gerado aparecerá aqui."}</p>
          </div>

          {result && (
            <span className={`mini-badge ${provider}`}>
              {provider === "openai" ? "OPENAI" : "LOCAL"}
            </span>
          )}
        </div>

        {result ? (
          <>
            <CodeEditor
              value={result.code}
              onChange={(code) =>
                setResult((old) => (old ? { ...old, code } : old))
              }
              height={470}
            />

            <div className="editor-actions">
              <button className="secondary-button" type="button" onClick={copy}>
                <Clipboard size={15} />
                Copiar
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={download}
              >
                <Download size={15} />
                Baixar .js
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={save}
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={15} />
                ) : (
                  <Save size={15} />
                )}
                Salvar na biblioteca
              </button>
            </div>

            <div className="result-details">
              <h3>Explicação</h3>
              <p>{result.explanation}</p>

              {result.warnings.length > 0 && (
                <>
                  <h3>Avisos</h3>
                  <ul>
                    {result.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </>
              )}

              {result.recommendations.length > 0 && (
                <>
                  <h3>Recomendações</h3>
                  <ul>
                    {result.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </>
              )}

              <h3>Compatibilidade</h3>
              <p>{result.compatibilityNotes}</p>

              <h3>Dependências</h3>
              <p>{result.dependencies.join(", ") || "Nenhuma identificada"}</p>
            </div>
          </>
        ) : (
          <div className="empty-result">
            <div className="empty-icon">
              <WandSparkles size={23} />
            </div>

            <strong>Seu dataset começará aqui</strong>

            <span>Preencha os requisitos e clique em Gerar dataset.</span>
          </div>
        )}
      </section>
    </div>
  );
}
