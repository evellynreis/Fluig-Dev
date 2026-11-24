"use client";
import dynamic from "next/dynamic";
const Monaco=dynamic(()=>import("@monaco-editor/react"),{ssr:false,loading:()=> <div className="editor-loading">Carregando editor...</div>});
export function CodeEditor({value,onChange,height=420,readOnly=false}:{value:string;onChange?:(value:string)=>void;height?:number;readOnly?:boolean}){
 return <div className="monaco-wrap"><Monaco height={`${height}px`} language="javascript" theme="vs-dark" value={value} onChange={v=>onChange?.(v??"")} options={{readOnly, minimap:{enabled:false},fontSize:13,lineNumbers:"on",scrollBeyondLastLine:false,automaticLayout:true,tabSize:4,wordWrap:"on",padding:{top:14,bottom:14}}}/></div>;
}
