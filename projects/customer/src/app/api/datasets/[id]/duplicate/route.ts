import { duplicateDataset } from "@/server/database";
import { InputError } from "@/server/errors";
import { toErrorResponse } from "@/server/http/response";
export async function POST(_r:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;const dataset=await duplicateDataset(id);if(!dataset)throw new InputError("Dataset não encontrado.",404);return Response.json({dataset},{status:201});}catch(e){return toErrorResponse(e);}}
