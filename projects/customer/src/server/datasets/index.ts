import "server-only";

import { z } from "zod";

import { InputError } from "@/server/errors";

import type { DatasetGenerationInput } from "@/types/dataset";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(100),

  description: z
    .string()
    .trim()
    .min(5, "Descreva o objetivo com pelo menos 5 caracteres.")
    .max(8000),

  fluigVersion: z.string().trim().max(80).default("Não informada"),

  sourceType: z
    .enum(["fluig_dataset", "rest_api", "sql", "manual"])
    .default("manual"),

  dataSource: z.string().trim().max(300).default(""),

  fields: z.array(z.string().trim().min(1).max(80)).max(80).default([]),

  rules: z.string().trim().max(4000).default(""),

  // Configurações do código de referência
  referenceMode: z.enum(["adapt", "structure", "logic"]).default("adapt"),

  referenceCode: z
    .string()
    .max(40000, "O código de referência deve ter no máximo 40.000 caracteres.")
    .default(""),
});

function normalizeInputFields(fields: string[]): string[] {
  return [
    ...new Set(
      fields
        .flatMap((field) => field.split(/[\r\n,;|]+/))
        .map((field) => field.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseDatasetRequest(body: unknown): DatasetGenerationInput {
  const r = schema.safeParse(body);

  if (!r.success) {
    throw new InputError(r.error.issues.map((x) => x.message).join(" "));
  }

  return {
    ...r.data,
    fields: normalizeInputFields(r.data.fields),
    referenceCode: r.data.referenceCode.trim(),
  };
}

export function parseDatasetPatch(body: unknown) {
  const patchSchema = schema
    .omit({
      referenceCode: true,
      referenceMode: true,
    })
    .partial()
    .extend({
      code: z.string().max(100000).optional(),
      explanation: z.string().max(12000).optional(),
      warnings: z.array(z.string().max(1000)).max(100).optional(),
      dependencies: z.array(z.string().max(200)).max(100).optional(),
      compatibilityNotes: z.string().max(8000).optional(),
    });

  const r = patchSchema.safeParse(body);

  if (!r.success) {
    throw new InputError(r.error.issues.map((x) => x.message).join(" "));
  }

  return {
    ...r.data,
    ...(r.data.fields ? { fields: normalizeInputFields(r.data.fields) } : {}),
  };
}
