"use client";
import {ObjectArt,type ArtName} from "@/components/illustrations/ObjectArt";
import type { ReactNode } from "react";

export type MathVisualMode = "explore" | "practice" | "review";
type BaseProps = { mode?: MathVisualMode; className?: string };
const frame = "rounded-xl border border-emerald-100 bg-emerald-50 p-3 sm:p-4";
export function ObjectCounter({count,icon="apple",onCount,mode="explore",className=""}:BaseProps&{count:number;icon?:ArtName;onCount?:(value:number)=>void}) {
 const safe=Math.max(0,Math.min(100,Math.trunc(count)));
 return <div className={`${frame} ${className}`} role="group" aria-label={`${safe} benda`}><div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({length:safe},(_,i)=><button key={i} type="button" disabled={mode==="review"||!onCount} onClick={()=>onCount?.(i+1)} className="grid min-h-10 place-items-center rounded-lg bg-white shadow-sm disabled:cursor-default" aria-label={`Hitung benda ke-${i+1}`}><ObjectArt name={icon} className="size-8"/></button>)}</div></div>;
}
export function TenFrame({count,showNumber=true,className=""}:BaseProps&{count:number;showNumber?:boolean}) {
 const safe=Math.max(0,Math.min(20,Math.trunc(count)));
 return <div className={`space-y-3 ${className}`} role="img" aria-label={`${safe} benda dalam dua bingkai sepuluh`}>{[0,1].map(group=><div key={group} className="grid grid-cols-5 gap-1 rounded-xl border-2 border-emerald-300 bg-white p-2">{Array.from({length:10},(_,i)=>{const filled=group*10+i<safe;return <span key={i} className={`grid aspect-square min-h-8 place-items-center rounded-md ${filled?"bg-emerald-100":"bg-slate-50"}`}><span className={`h-4 w-4 rounded-full ${filled?"bg-emerald-600":"border border-slate-200"}`}/></span>})}</div>)}{showNumber?<p className="text-center text-sm font-semibold text-emerald-800">{safe} = 10 + {Math.max(0,safe-10)}</p>:null}</div>;
}
export function NumberSequence({sequence,className=""}:BaseProps&{sequence:(number|null)[]}) {
 return <div className={`flex flex-wrap justify-center gap-2 ${className}`} role="group" aria-label="Urutan bilangan">{sequence.map((n,i)=><span key={i} className={`grid h-12 w-12 place-items-center rounded-lg border-2 text-xl font-bold ${n===null?"border-amber-400 bg-amber-50 text-amber-800":"border-emerald-200 bg-white text-slate-900"}`}>{n??"?"}</span>)}</div>;
}
export function PlaceValue({value,className=""}:BaseProps&{value:number}) {
 const tens=Math.floor(value/10),ones=value%10;
 return <div className={`${frame} ${className}`}><div className="grid grid-cols-2 gap-3 text-center"><div className="rounded-lg bg-white p-3"><p className="text-sm font-semibold">Puluhan</p><p className="text-3xl font-extrabold text-emerald-700">{tens}</p><p className="text-xs">10 × {tens}</p></div><div className="rounded-lg bg-white p-3"><p className="text-sm font-semibold">Satuan</p><p className="text-3xl font-extrabold text-amber-600">{ones}</p><p className="text-xs">1 × {ones}</p></div></div></div>;
}
export function NumberComparison({left,right,selected,onSelect,disabled=false,className=""}:BaseProps&{left:number;right:number;selected?:number|null;onSelect?:(n:number)=>void;disabled?:boolean}) {
 return <div className={`grid grid-cols-2 gap-3 ${className}`}>{[left,right].map((n,i)=><button key={i} type="button" disabled={disabled||!onSelect} onClick={()=>onSelect?.(n)} aria-pressed={selected===n} className={`rounded-xl border-2 p-3 text-center transition ${selected===n?"border-emerald-600 bg-emerald-50":"border-slate-200 bg-white"}`}><span className="block text-sm font-semibold">Kelompok {i?"B":"A"}</span><span className="mt-2 block text-3xl font-bold">{n}</span><span className="mt-2 grid grid-cols-5 gap-1" aria-label={`${n} benda`}>{Array.from({length:n},(_,j)=><ObjectArt key={j} name="counter-green" className="size-4"/>)}</span></button>)}</div>;
}
export function MathVisualCard({children,title}: {children:ReactNode;title?:string}) {return <div className={frame}>{title?<p className="mb-3 text-sm font-bold text-emerald-800">{title}</p>:null}{children}</div>}
