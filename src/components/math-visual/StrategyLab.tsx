"use client";
import {ObjectArt} from "@/components/illustrations/ObjectArt";
import {useState} from "react";
type Strategy="compare"|"count"|"make10"|"place"|"back";
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function StrategyLab({strategy,a,b}:{strategy:Strategy;a:number;b:number}){
 const [steps,setSteps]=useState(0);
 const [part,setPart]=useState(0);
 const [matched,setMatched]=useState(0);
 const [show,setShow]=useState(false);
 const isMinus=strategy==="back"||strategy==="compare";
 const result=strategy==="compare"?Math.abs(a-b):isMinus?a-b:a+b;
 const maxSteps=strategy==="compare"?Math.min(a,b):b;
 const advance=()=>setSteps(s=>clamp(s+1,0,maxSteps));
 const reset=()=>{setSteps(0);setPart(0);setMatched(0);setShow(false)};
 return <div className="w-full max-w-lg space-y-3 rounded-2xl bg-emerald-50 p-3 text-slate-900 sm:p-4">
 {strategy==="compare"?<>
  <p className="text-sm font-bold">Pasangkan benda satu per satu</p>
  <div className="grid grid-cols-2 gap-3">{[a,b].map((n,k)=><div key={k} className="rounded-xl bg-white p-2"><p className="mb-2 text-center text-xs font-bold">Kelompok {k?"B":"A"} ({n})</p><div className="grid grid-cols-5 gap-1">{Array.from({length:n},(_,i)=><span key={i} className={`grid aspect-square place-items-center rounded-md text-base ${i<matched?"bg-emerald-200 opacity-50":"bg-slate-100"}`}><ObjectArt name={k?"marble-blue":"marble-red"} className="size-full p-0.5"/></span>)}</div></div>)}</div>
  <p className="text-center text-sm">Pasangan ditemukan: <strong>{matched}</strong></p>
  <button type="button" className="btn btn-success btn-sm w-full" disabled={matched>=Math.min(a,b)} onClick={()=>setMatched(v=>v+1)}>Pasangkan 1 benda</button>
  {matched===Math.min(a,b)?<p role="status" className="text-center font-bold">Selisih = {Math.abs(a-b)} benda</p>:null}
 </>:strategy==="make10"?<>
  <p className="text-sm font-bold">{a+b>=10&&a<=10?"Pecah "+b+" untuk membuat 10 dari "+a:"Pecah bilangan kedua menjadi dua bagian"}</p>
  <div className="flex flex-wrap items-center justify-center gap-2 text-xl font-extrabold"><span>{a}</span><span>+</span><span className="rounded-lg bg-white px-3 py-2">{part}</span><span>+</span><span className="rounded-lg bg-white px-3 py-2">{b-part}</span></div>
  <label className="block text-center text-sm font-semibold">Geser untuk memecah {b}<input className="range range-success mt-2 w-full" type="range" min={0} max={b} value={part} onChange={e=>setPart(Number(e.target.value))}/></label>
  <p role="status" className="text-center font-semibold">{a}+{part}={a+part}{a+part===10?`; lalu 10+${b-part}=${a+b} ✓` :a+b<10?" · Jumlahnya belum mencapai 10.":" · Coba buat 10!"}</p>
 </>:strategy==="place"?<>
  <p className="text-sm font-bold">Pisahkan puluhan dan satuan</p>
  <div className="grid grid-cols-2 gap-3 text-center"><div className="rounded-xl bg-white p-3"><p className="text-xs">Puluhan</p><p className="text-3xl font-bold">{Math.floor(a/10)}</p></div><div className="rounded-xl bg-white p-3"><p className="text-xs">Satuan</p><p className="text-3xl font-bold">{a%10}</p></div></div>
  <div className="grid grid-cols-5 gap-1 rounded-lg bg-white p-2">{Array.from({length:10},(_,i)=><span key={i} className="grid h-6 place-items-center rounded bg-emerald-200">●</span>)}</div>
  <p className="text-center text-sm font-semibold">{a} = 10 + {a-10}</p>
  <button type="button" className="btn btn-outline btn-success btn-sm w-full" onClick={()=>setShow(v=>!v)}>{show?"Sembunyikan langkah":"Tunjukkan langkah"}</button>
  {show?<p role="status" className="text-center font-bold">{isMinus?`${a-b} = 10 + (${a-10} − ${b})`:`${a+b} = 10 + (${a-10} + ${b})`}</p>:null}
 </>:<>
  <p className="text-sm font-bold">{strategy==="back"?"Hitung mundur":"Hitung maju"} satu langkah setiap ketukan</p>
  <div className="flex flex-wrap justify-center gap-1">{Array.from({length:21},(_,i)=><span key={i} className={`grid h-8 w-8 place-items-center rounded-md text-xs font-bold ${i===(strategy==="back"?a-steps:a+steps)?"bg-emerald-600 text-white":"bg-white"}`}>{i}</span>)}</div>
  <p className="text-center text-lg font-bold">{strategy==="back"?a-steps:a+steps} <span className="text-xs font-normal">({steps} dari {b} langkah)</span></p>
  <button type="button" className="btn btn-success btn-sm w-full" disabled={steps>=b} onClick={advance}>{strategy==="back"?"← Mundur 1":"Maju 1 →"}</button>
  {steps===b?<p role="status" className="text-center font-bold">Selesai! Hasilnya {result} ✓</p>:null}
 </>}
 <button type="button" className="btn btn-ghost btn-xs" onClick={reset}>↻ Ulangi peraga</button>
 </div>;
}
