export type DatasetSourceType = "fluig_dataset" | "rest_api" | "sql" | "manual";
export type AiAction = "generate" | "review" | "explain" | "repair";
export type DatasetGenerationInput = {
  name: string; description: string; fluigVersion: string; sourceType: DatasetSourceType;
  dataSource: string; fields: string[]; rules: string;
};
export type DatasetRecord = DatasetGenerationInput & {
  id: string; code: string; explanation: string; warnings: string[]; dependencies: string[];
  compatibilityNotes: string; version: number; createdAt: string; updatedAt: string;
};
export type DatasetVersionRecord = { id: string; datasetId: string; version: number; code: string; createdAt: string };
export type HistoryRecord = { id: string; action: string; title: string; inputSummary: string; outputSummary: string; datasetId?: string; createdAt: string };
export type ValidationFinding = { severity: "error"|"warning"|"info"; title: string; detail: string; line?: number; column?: number };
export type ValidationResult = { valid: boolean; syntaxValid: boolean; findings: ValidationFinding[] };
export type DatasetAiResult = { summary: string; code: string; explanation: string; fields: string[]; dependencies: string[]; warnings: string[]; compatibilityNotes: string; findings: ValidationFinding[]; recommendations: string[] };
export type AiRequest = { action: AiAction; prompt?: string; code?: string; fluigVersion?: string; dataset?: Partial<DatasetGenerationInput> };
