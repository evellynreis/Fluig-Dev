import { z } from "zod";
import { validateDatasetSource } from "@/server/validation";
import { addHistory } from "@/server/database";
import { InputError } from "@/server/errors";
import { toErrorResponse } from "@/server/http/response";
export async function POST(r:Request){try{const body=z.object({code:z.string().max(100000)}).safeParse(await r.json());if(!body.success)throw new InputError("Informe um código JavaScript de até 100 KB.");const result=validateDatasetSource(body.data.code);await addHistory({action:"validate",title:"Validação de dataset",inputSummary:body.data.code.slice(0,500),outputSummary:result.valid?"Sem erros críticos":`${result.findings.length} apontamento(s)`});return Response.json({result});}catch(e){return toErrorResponse(e);}}
