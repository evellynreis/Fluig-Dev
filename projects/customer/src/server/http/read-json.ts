import { InputError } from "@/server/errors";

export async function readJsonObject(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new InputError("O cabeçalho Content-Type deve ser application/json.", 415);
  }

  try {
    return await request.json();
  } catch {
    throw new InputError("O corpo da requisição não é um JSON válido.");
  }
}
