import { listHistory } from "@/server/database";
import { toErrorResponse } from "@/server/http/response";
export async function GET(){try{return Response.json({history:await listHistory()});}catch(e){return toErrorResponse(e);}}
