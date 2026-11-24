import { deleteDataset, getDataset, updateDataset } from "@/server/database";
import { parseDatasetPatch } from "@/server/datasets";
import { InputError } from "@/server/errors";
import { readJsonObject } from "@/server/http/read-json";
import { toErrorResponse } from "@/server/http/response";
type Context={params:Promise<{id:string}>};
export async function GET(_r:Request,{params}:Context){try{const {id}=await params;const dataset=await getDataset(id);if(!dataset)throw new InputError("Dataset não encontrado.",404);return Response.json({dataset});}catch(e){return toErrorResponse(e);}}
export async function PATCH(r:Request,{params}:Context){try{const {id}=await params;const patch=parseDatasetPatch(await readJsonObject(r));const dataset=await updateDataset(id,patch);if(!dataset)throw new InputError("Dataset não encontrado.",404);return Response.json({dataset});}catch(e){return toErrorResponse(e);}}
export async function DELETE(_r:Request,{params}:Context){try{const {id}=await params;const ok=await deleteDataset(id);if(!ok)throw new InputError("Dataset não encontrado.",404);return Response.json({success:true});}catch(e){return toErrorResponse(e);}}
