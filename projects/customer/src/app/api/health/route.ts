import { isOpenAiConfigured } from "@/server/ai";
import { storageMode } from "@/server/database";
export function GET(){return Response.json({status:"ok",service:"fluig-dev",openai:isOpenAiConfigured()?"configured":"not_configured",storage:storageMode(),datasetExecution:"disabled",timestamp:new Date().toISOString()});}
