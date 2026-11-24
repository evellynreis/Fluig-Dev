import { createDataset, listDatasets } from "@/server/database";
import { parseDatasetRequest } from "@/server/datasets";
import { readJsonObject } from "@/server/http/read-json";
import { toErrorResponse } from "@/server/http/response";
export async function GET(request:Request){try{const q=new URL(request.url).searchParams.get("q")??"";return Response.json({datasets:await listDatasets(q)});}catch(e){return toErrorResponse(e);}}
export async function POST(request:Request){try{const body=await readJsonObject(request) as Record<string,unknown>;const input=parseDatasetRequest(body);const record=await createDataset({...input,code:typeof body.code==="string"?body.code:"",explanation:typeof body.explanation==="string"?body.explanation:"",warnings:Array.isArray(body.warnings)?body.warnings.map(String):[],dependencies:Array.isArray(body.dependencies)?body.dependencies.map(String):[],compatibilityNotes:typeof body.compatibilityNotes==="string"?body.compatibilityNotes:""});return Response.json({dataset:record},{status:201});}catch(e){return toErrorResponse(e);}}
