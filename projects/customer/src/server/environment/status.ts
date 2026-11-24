import { isOpenAiConfigured } from "@/server/ai";
export function getEnvironmentStatus(){return {openai:isOpenAiConfigured()?"configured":"not_configured",storage:"local-json",datasetExecution:"disabled"} as const;}
