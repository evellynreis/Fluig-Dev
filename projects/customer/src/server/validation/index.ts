import "server-only";
import { parse } from "acorn";
import type { ValidationFinding, ValidationResult } from "@/types/dataset";
export function validateDatasetSource(source:string):ValidationResult {
 const findings:ValidationFinding[]=[]; const code=source.trim(); if(!code)return {valid:false,syntaxValid:false,findings:[{severity:"error",title:"Código vazio",detail:"Cole ou gere um JavaScript para validar."}]};
 let syntaxValid=true; try{parse(code,{ecmaVersion:5,sourceType:"script",locations:true});}catch(e){syntaxValid=false;const x=e as SyntaxError&{loc?:{line:number;column:number}};findings.push({severity:"error",title:"Sintaxe JavaScript incompatível com ES5",detail:x.message,line:x.loc?.line,column:x.loc?.column});}
 const hasCreate=/function\s+createDataset\s*\(/.test(code); if(!hasCreate)findings.push({severity:"error",title:"createDataset não encontrada",detail:"Dataset customizado clássico deve declarar createDataset(fields, constraints, sortFields)."});
 if(!/DatasetBuilder\.newDataset\s*\(/.test(code))findings.push({severity:"warning",title:"DatasetBuilder.newDataset não identificado",detail:"Confirme a forma de criação do dataset para o tipo e versão escolhidos."});
 if(!/addColumn\s*\(/.test(code))findings.push({severity:"warning",title:"Colunas não identificadas",detail:"Não foi encontrada nenhuma chamada addColumn()."});
 if(/DatasetBuilder\.create\s*\(/.test(code))findings.push({severity:"error",title:"Método não documentado",detail:"DatasetBuilder.create() não consta na referência do projeto. Use newDataset() quando aplicável."});
 if(!/return\s+dataset\s*;?/.test(code))findings.push({severity:"error",title:"Retorno não identificado",detail:"A função deve retornar o dataset construído."});
 if(/(eval|Function)\s*\(/.test(code))findings.push({severity:"warning",title:"Execução dinâmica detectada",detail:"Evite eval ou Function: não são necessários em datasets comuns e dificultam auditoria."});
 if(/(const|let)\s+|=>|`/.test(code))findings.push({severity:"warning",title:"Sintaxe moderna detectada",detail:"O perfil conservador deste validador é ES5. Confirme suporte no runtime Fluig alvo."});
 if(/SELECT\s+.+FROM/i.test(code)&&/constraints/i.test(code))findings.push({severity:"warning",title:"SQL junto de constraints",detail:"Não concatene constraints em SQL. Use uma integração de banco externo documentada para sua versão."});
 if(/function\s+createDataset\s*\(\s*fields\s*,\s*constraints\s*,\s*sortFields\s*\)/.test(code)&&!code.includes("constraints"))findings.push({severity:"info",title:"Constraints não utilizadas",detail:"Verifique se o consumidor espera filtros."});
 return {valid:syntaxValid&&!findings.some(x=>x.severity==="error"),syntaxValid,findings};
}
