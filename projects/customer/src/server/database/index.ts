import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DatasetRecord, DatasetVersionRecord, HistoryRecord } from "@/types/dataset";

type Store = { datasets: DatasetRecord[]; versions: DatasetVersionRecord[]; history: HistoryRecord[] };
const empty = (): Store => ({ datasets: [], versions: [], history: [] });
let queue: Promise<unknown> = Promise.resolve();
export function storageMode(): "local-json" { return "local-json"; }
function filePath() { return path.resolve(process.cwd(), process.env.FLUIG_DEV_DATA_DIR?.trim() || ".data", "fluig-dev-store.json"); }
async function readStore(): Promise<Store> {
  try {
    const value = JSON.parse(await readFile(filePath(), "utf8")) as Partial<Store>;
    return { datasets: Array.isArray(value.datasets)?value.datasets:[], versions:Array.isArray(value.versions)?value.versions:[], history:Array.isArray(value.history)?value.history:[] };
  } catch (e) { if ((e as NodeJS.ErrnoException).code === "ENOENT") return empty(); throw e; }
}
async function mutate<T>(fn:(store:Store)=>T|Promise<T>):Promise<T> {
  const job=queue.then(async()=>{ const store=await readStore(); const result=await fn(store); const target=filePath(); await mkdir(path.dirname(target),{recursive:true}); const temp=target+".tmp"; await writeFile(temp,JSON.stringify(store,null,2),"utf8"); await rename(temp,target); return result; });
  queue=job.then(()=>undefined,()=>undefined); return job;
}
export async function listDatasets(search="") { const s=await readStore(); const q=search.trim().toLowerCase(); return s.datasets.filter(x=>!q||`${x.name} ${x.description} ${x.dataSource}`.toLowerCase().includes(q)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); }
export async function getDataset(id:string) { return (await readStore()).datasets.find(x=>x.id===id)??null; }
export async function createDataset(input:Omit<DatasetRecord,"id"|"version"|"createdAt"|"updatedAt">) { return mutate(s=>{ const now=new Date().toISOString(); const record:DatasetRecord={...input,id:randomUUID(),version:1,createdAt:now,updatedAt:now}; s.datasets.unshift(record); s.versions.unshift({id:randomUUID(),datasetId:record.id,version:1,code:record.code,createdAt:now}); return record; }); }
export async function updateDataset(id:string,patch:Partial<Omit<DatasetRecord,"id"|"createdAt">>) { return mutate(s=>{ const i=s.datasets.findIndex(x=>x.id===id); if(i<0)return null; const current=s.datasets[i]; const updated={...current,...patch,id,createdAt:current.createdAt,version:current.version+1,updatedAt:new Date().toISOString()}; s.datasets[i]=updated; s.versions.unshift({id:randomUUID(),datasetId:id,version:updated.version,code:updated.code,createdAt:updated.updatedAt}); return updated; }); }
export async function deleteDataset(id:string) { return mutate(s=>{ const before=s.datasets.length; s.datasets=s.datasets.filter(x=>x.id!==id); s.versions=s.versions.filter(x=>x.datasetId!==id); s.history=s.history.filter(x=>x.datasetId!==id); return before!==s.datasets.length; }); }
export async function duplicateDataset(id:string) { const original=await getDataset(id); if(!original)return null; return createDataset({name:`${original.name} (cópia)`,description:original.description,fluigVersion:original.fluigVersion,sourceType:original.sourceType,dataSource:original.dataSource,fields:original.fields,rules:original.rules,code:original.code,explanation:original.explanation,warnings:original.warnings,dependencies:original.dependencies,compatibilityNotes:original.compatibilityNotes}); }
export async function listVersions(id:string) { return (await readStore()).versions.filter(x=>x.datasetId===id).sort((a,b)=>b.version-a.version); }
export async function addHistory(input:Omit<HistoryRecord,"id"|"createdAt">) { return mutate(s=>{ const record={...input,id:randomUUID(),createdAt:new Date().toISOString()}; s.history.unshift(record); s.history=s.history.slice(0,500); return record; }); }
export async function listHistory(limit=100) { return (await readStore()).history.slice(0,Math.max(1,Math.min(limit,500))); }
export async function getDashboardStats() { const s=await readStore(); return {datasetCount:s.datasets.length,generationCount:s.history.filter(x=>x.action==="generate").length,recentHistory:s.history.slice(0,6),recentDatasets:s.datasets.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5)}; }
