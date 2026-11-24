import { z } from "zod";
import { runAi } from "@/server/ai";
import { parseDatasetRequest } from "@/server/datasets";
import { addHistory } from "@/server/database";
import { InputError } from "@/server/errors";
import { toErrorResponse } from "@/server/http/response";
import { readJsonObject } from "@/server/http/read-json";
const schema=z.object({action:z.enum(["generate","review","explain","repair"]),prompt:z.string().max(8000).optional(),code:z.string().max(100000).optional(),fluigVersion:z.string().max(80).optional(),dataset:z.unknown().optional()});
export async function POST(request:Request){try{const body=schema.safeParse(await readJsonObject(request));if(!body.success)throw new InputError(body.error.issues.map(x=>x.message).join(" "));const value=body.data;const input=value.action==="generate"?parseDatasetRequest(value.dataset??{name:"Novo dataset",description:value.prompt??"",fluigVersion:value.fluigVersion??"Não informada"}):undefined;if(value.action!=="generate"&&!value.code?.trim())throw new InputError("Informe o código JavaScript para análise.");const {result,aiUsed}=await runAi({action:value.action,prompt:value.prompt,code:value.code,fluigVersion:value.fluigVersion},input);await addHistory({action:value.action,title:input?.name??`Ação: ${value.action}`,inputSummary:input?.description??(value.code??"").slice(0,500),outputSummary:result.summary});return Response.json({result,aiUsed,provider:aiUsed?"openai":"local"});}catch(e){return toErrorResponse(e);}}
