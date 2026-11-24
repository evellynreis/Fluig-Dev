import { listVersions } from "@/server/database";
import { toErrorResponse } from "@/server/http/response";
export async function GET(_r:Request,{params}:{params:Promise<{id:string}>}){try{const {id}=await params;return Response.json({versions:await listVersions(id)});}catch(e){return toErrorResponse(e);}}
