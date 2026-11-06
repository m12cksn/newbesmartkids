"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, practice, topics, objectNames, sequence, ready, checkAnswer, type PatternObject, type PatternQuestion } from "@/data/grade-four-patterns";

export function PatternIcon({kind}:{kind:PatternObject}) {
  return <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
    {kind==="marble" ? <><circle cx="20" cy="20" r="16" fill="#bae6fd" stroke="#155e75" strokeWidth="2"/><path d="M9 10Q28 12 17 24T28 32Q11 32 9 10" fill="#0891b2"/><circle cx="14" cy="12" r="3" fill="white"/></> :
    kind==="flower" ? <><path d="M20 22V38M20 34Q7 33 9 27Q18 27 20 34M20 30Q31 28 31 23Q22 24 20 30" fill="#16a34a" stroke="#15803d" strokeWidth="2"/>{[0,72,144,216,288].map(a=><ellipse key={a} cx="20" cy="8" rx="5" ry="7" transform={`rotate(${a} 20 16)`} fill="#ec4899" stroke="#9d174d"/>)}<circle cx="20" cy="16" r="5" fill="#fde047" stroke="#a16207"/></> :
    kind==="tile" ? <path d="M11 3H29L38 20L29 37H11L2 20Z" fill="#38bdf8" stroke="#0369a1" strokeWidth="2"/> :
    kind==="can" ? <><path d="M7 9V32C7 39 33 39 33 32V9" fill="#fb7185" stroke="#9f1239" strokeWidth="2"/><path d="M9 18H31V27H9" fill="#ffe4e6"/><ellipse cx="20" cy="9" rx="13" ry="5" fill="#cbd5e1" stroke="#475569" strokeWidth="2"/><ellipse cx="20" cy="9" rx="4" ry="1.5" fill="#64748b"/></> :
    kind==="brick" ? <><path d="M3 13L12 6H37V26L28 34H3Z" fill="#f59e0b" stroke="#92400e" strokeWidth="2"/><path d="M3 13H28V34M28 13L37 6" fill="none" stroke="#92400e" strokeWidth="2"/><path d="M9 20H21M9 26H17" stroke="#fcd34d" strokeWidth="2"/></> :
    kind==="book" ? <><path d="M8 4H31V35H8Q3 32 8 29Z" fill="#818cf8" stroke="#3730a3" strokeWidth="2"/><path d="M8 29H31V35H8Q4 32 8 29" fill="#fff" stroke="#3730a3" strokeWidth="2"/><path d="M13 11H26M13 17H23" stroke="#e0e7ff" strokeWidth="2"/></> :
    <><rect x="8" y="3" width="24" height="20" rx="4" fill="#2dd4bf" stroke="#115e59" strokeWidth="2"/><path d="M6 23H34V29H6Z" fill="#0d9488"/><path d="M9 29V38M31 29V38" stroke="#115e59" strokeWidth="3"/></>}
  </svg>;
}
export function Picture({count,kind,highlightFrom}:{count:number;kind:PatternObject;highlightFrom?:number}) {
  return <div role="img" aria-label={`${count} ${objectNames[kind]}`} className="mx-auto grid w-full max-w-40 grid-cols-5 gap-0.5">
    {Array.from({length:count},(_,i)=><span key={i} data-object={kind} className={`aspect-square min-w-0 ${highlightFrom!==undefined && i>=highlightFrom?"rounded bg-amber-200 ring-1 ring-amber-600":""}`}><PatternIcon kind={kind}/></span>)}
    {count===0 && <span className="col-span-5 p-3 text-center">Kosong</span>}
  </div>;
}
function Pictures({q}:{q:PatternQuestion}) {
  return <div className="grid grid-cols-2 gap-2 rounded-lg bg-info/10 p-2 sm:grid-cols-4">
    {q.values.map((n,i)=><figure key={i} className="flex min-h-28 min-w-0 flex-col justify-between gap-2 rounded-lg bg-base-100 p-2">
      {q.blanks.includes(i)?<div className="grid flex-1 place-items-center rounded border-2 border-dashed border-info p-3 text-2xl font-bold" aria-label={`Kumpulan ${i+1} kosong`}>?</div>:<Picture count={n} kind={q.object!}/>}
      <figcaption className="text-center text-xs font-semibold">Kumpulan {i+1}</figcaption>
    </figure>)}
  </div>;
}
function Builder({kind,answer,record,disabled=false}:{kind:PatternObject;answer:string;record:(s:string)=>void;disabled?:boolean}) {
  const count=Number(answer || 0);
  return <div className="space-y-3 rounded-lg border border-base-300 p-3">
    <p className="text-sm">Tambahkan benda. Ketuk benda untuk mengambilnya kembali.</p>
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-sm btn-success" disabled={disabled || count>=40} onClick={()=>record(String(count+1))}>Tambah benda</button>
      <button className="btn btn-sm btn-outline" disabled={disabled || count===0} onClick={()=>record(String(count-1))}>Ambil satu</button>
      <button className="btn btn-sm btn-ghost" disabled={disabled || !answer} onClick={()=>record("")}>Kosongkan</button>
    </div>
    <div className="flex min-h-12 flex-wrap gap-1">{Array.from({length:count},(_,i)=><button key={i} className="size-10 rounded border border-base-300 p-1 focus-visible:outline-2 focus-visible:outline-success" aria-label={`Ambil benda ${i+1}`} disabled={disabled} onClick={()=>record(String(count-1))}><PatternIcon kind={kind}/></button>)}</div>
    <p aria-live="polite" className="font-bold">Susunanmu: {count} {objectNames[kind]}</p>
  </div>;
}
function PatternAnswer({q,answer,record,checked}:{q:PatternQuestion;answer:string;record:(s:string)=>void;checked:boolean}) {
  const parts=answer.split("|");
  const field=(i:number,label:string)=> <input aria-label={label} className="input input-bordered w-full max-w-24 text-center font-bold" inputMode="numeric" maxLength={5} value={parts[i]??""} disabled={checked} onChange={e=>{
    const next=Array.from({length:q.kind==="table"?q.target!.length:q.blanks.length},(_,n)=>parts[n]??"");next[i]=e.target.value.replace(/\D/g,"");record(next.join("|"));
  }}/>;
  if(q.kind==="number") return <div className="grid grid-cols-3 gap-2 rounded-lg bg-info/10 p-3 sm:grid-cols-6">{q.values.map((n,i)=><div key={i} className="min-w-0 space-y-2 text-center"><p className="text-xs">Posisi {i+1}</p>{q.blanks.includes(i)?field(q.blanks.indexOf(i),`Bilangan posisi ${i+1}`):<p className="grid h-10 place-items-center rounded-lg border border-info/30 bg-base-100 font-bold">{n}</p>}</div>)}</div>;
  if(q.kind==="table") return <div className="flex flex-wrap gap-3">{q.target!.map((n,i)=><label key={n} className="flex items-center gap-2 font-bold">{q.rowLabel} ke-{n}{field(i,`${q.rowLabel} ke-${n}`)}</label>)}</div>;
  if(q.kind==="build") return <Builder kind={q.object!} answer={answer} record={record} disabled={checked}/>;
  if(q.kind==="pick") return <div className="grid grid-cols-3 gap-2">{q.choices!.map((n,i)=><button key={n} aria-label={`Gambar ${String.fromCharCode(65+i)}: ${n} ${objectNames[q.object!]}`} aria-pressed={answer===String(n)} disabled={checked} onClick={()=>record(String(n))} className={`min-w-0 rounded-lg border-2 p-2 ${answer===String(n)?"border-success bg-success/10":"border-base-300 bg-base-100"}`}><span className="mb-2 block font-bold">{String.fromCharCode(65+i)}</span><Picture count={n} kind={q.object!}/></button>)}</div>;
  return <label className="flex items-center gap-3 font-bold">Jawaban{field(0,"Jawaban")}</label>;
}
function QuestionVisual({q}:{q:PatternQuestion}) {
  if(q.kind==="number") return null;
  if(q.kind!=="table") return <Pictures q={q}/>;
  return <div className="rounded-lg bg-info/10 p-3"><div className="mb-2 flex items-center gap-2 font-bold"><span className="size-9"><PatternIcon kind={q.object!}/></span>Data {objectNames[q.object!]}</div><table className="w-full text-left text-sm"><caption className="sr-only">Banyak {objectNames[q.object!]} pada empat {q.rowLabel!.toLowerCase()} pertama</caption><thead><tr><th className="p-2">{q.rowLabel}</th><th className="p-2">Banyak {objectNames[q.object!]}</th></tr></thead><tbody>{q.values.map((n,i)=><tr key={i} className="border-t border-base-300 bg-base-100"><th className="p-2 font-medium">{q.rowLabel} ke-{i+1}</th><td className="p-2">{n}</td></tr>)}</tbody></table></div>;
}
function PatternLab({topic}:{topic:number}) {
  const [decreasing,setDecreasing]=useState(false);
  const [step,setStep]=useState(3);
  const [first,setFirst]=useState(topic===0?3:12);
  const [stage,setStage]=useState(0);
  const [answer,setAnswer]=useState("");
  const [checked,setChecked]=useState(false);
  const [kind,setKind]=useState<PatternObject>("marble");
  const change=decreasing?-step:step;
  const start=decreasing?Math.max(first,step*(topic===0?3:7)+1):first;
  const values=sequence(start,change,topic===0?4:8);
  const reset=()=>{setStage(0);setAnswer("");setChecked(false);};
  const range=(label:string,value:number,min:number,max:number,update:(v:number)=>void)=><label className="block text-sm font-bold">{label}: {value}<input className="range range-info range-sm mt-2 w-full" type="range" aria-label={label} min={min} max={max} value={value} onChange={e=>{update(Number(e.target.value));reset();}}/></label>;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2">{[false,true].map(v=><button key={String(v)} aria-pressed={decreasing===v} className={`btn btn-sm ${decreasing===v?"btn-info":"btn-outline"}`} onClick={()=>{setDecreasing(v);reset();}}>Pola {v?"mengecil":"membesar"}</button>)}</div>
    {range("Bilangan awal",start,decreasing?step*(topic===0?3:7)+1:1,topic===0?20:200,setFirst)}
    {range("Besar perubahan",step,1,topic===0?5:20,setStep)}
    {topic===0?<>
      <label className="flex items-center gap-2 text-sm font-bold">Benda peraga<select className="select select-bordered min-w-0" value={kind} onChange={e=>setKind(e.target.value as PatternObject)}>{(["marble","flower","can","tile"] as const).map(k=><option value={k} key={k}>{objectNames[k]}</option>)}</select></label>
      <Pictures q={{...practice[0][0],values,object:kind}}/>
      <Builder kind={kind} answer={answer} record={s=>{setAnswer(s);setChecked(false);}}/>
      <button className="btn btn-success btn-sm" disabled={!answer} onClick={()=>setChecked(true)}>Periksa susunan</button>
      {checked&&<p role="status" className="rounded bg-info/10 p-3">{Number(answer)===values[3]?"Tepat!":"Belum tepat."} {values[2]} {decreasing?"−":"+"} {step} = {values[3]} {objectNames[kind]}.</p>}
    </>:<div className="grid grid-cols-4 gap-2">{values.map((n,i)=><div key={i} className={`rounded-lg border p-2 text-center ${i===stage?"border-info bg-info/15":"border-base-300 bg-base-100"}`}><p className="text-xs">Ke-{i+1}</p><p className="font-bold">{i<=stage?n:"?"}</p></div>)}</div>}
    <div className="rounded-lg bg-base-100 p-3 text-sm" aria-live="polite"><strong>Langkah {stage+1}. </strong>{stage===0?`Mulai dari ${start}. ${decreasing?"Ambil":"Tambahkan"} ${step} setiap langkah.`:`${values[stage-1]} ${decreasing?"−":"+"} ${step} = ${values[stage]}. ${stage} perubahan dari kumpulan pertama.`}</div>
    <div className="flex flex-wrap gap-2"><button className="btn btn-outline btn-sm" disabled={stage===0} onClick={()=>setStage(s=>s-1)}>Langkah sebelumnya</button><button className="btn btn-info btn-sm" disabled={stage===values.length-1} onClick={()=>setStage(s=>s+1)}>Langkah berikutnya</button><button className="btn btn-ghost btn-sm" onClick={reset}>Ulangi peraga</button></div>
    <table className="w-full text-left text-sm"><caption className="pb-2 text-left font-bold">Catatan pola</caption><thead><tr><th>Urutan</th><th>Banyak</th><th>Perubahan</th></tr></thead><tbody>{values.slice(0,stage+1).map((n,i)=><tr className="border-t border-base-300" key={i}><td className="py-2">{i+1}</td><td>{n}</td><td>{i===0?"Awal":`${decreasing?"−":"+"}${step}`}</td></tr>)}</tbody></table>
    {decreasing&&<p className="text-xs">Bilangan awal menyesuaikan agar semua kumpulan tetap berisi benda.</p>}
  </div>;
}
export default function GradeFourPatterns() {
  const [index,setIndex]=useState(0);
  const [mode,setMode]=useState<"lesson"|"practice"|"assessment">("lesson");
  const topic=topics[index];
  const go=(i:number)=>{setIndex(i);setMode("lesson");};
  return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 4 / Bab 3</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Pola Gambar dan Pola Bilangan</h1>
    <p className="mt-3">Amati, susun, temukan aturannya, lalu lanjutkan polanya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-36 flex-col items-center justify-center bg-info/10 p-5 text-center"><span aria-hidden="true" className="text-3xl font-bold text-info">▶</span><p className="mt-2 font-bold">Video pembelajaran segera hadir</p></div>
      <div className="p-5"><div className="mb-3 flex gap-2" aria-hidden="true">{[2,4,6].map(n=><div key={n} className="w-16 rounded-lg bg-info/10 p-1"><Picture count={n} kind="tile"/></div>)}</div><h2 className="text-xl font-bold">Laboratorium Pola</h2><p className="text-sm">Dua submateri, lima latihan per submateri, dan 24 soal evaluasi.</p><a href="#materi-pola" className="btn btn-success btn-sm mt-3">Mulai belajar</a></div>
    </div>
    <div id="materi-pola" className="mt-6">
      <nav aria-label="Submateri pola" className="mb-4 flex flex-wrap gap-2">{topics.map((t,i)=><button key={t.title} className={`btn btn-sm ${i===index?"btn-success":"btn-outline"}`} aria-current={i===index?"step":undefined} onClick={()=>go(i)}>{String.fromCharCode(65+i)}. {t.title}</button>)}</nav>
      {mode==="lesson"?<>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2"><div className="min-w-0 bg-info/5 p-4 sm:p-6"><PatternLab key={index} topic={index}/></div><div className="p-5 sm:p-6"><h2 className="text-2xl font-extrabold">{topic.title}</h2><p className="mt-3 leading-relaxed">{topic.intro}</p><ol className="mt-3 list-decimal space-y-3 pl-5 leading-relaxed">{topic.steps.map(s=><li key={s}>{s}</li>)}</ol><p className="mt-4 rounded-lg bg-warning/15 p-3 text-sm"><strong>Ingat. </strong>{topic.remember}</p><p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{topic.demo}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-ghost" disabled={index===0} onClick={()=>go(index-1)}>← Materi sebelumnya</button><button className="btn btn-outline btn-success" onClick={()=>setMode("practice")}>Latihan submateri →</button>{index===0?<button className="btn btn-success" onClick={()=>go(1)}>Materi berikutnya →</button>:<button className="btn btn-success" onClick={()=>setMode("assessment")}>Evaluasi Bab 3 →</button>}</div>
      </>:<GradeFourQuiz key={`${index}-${mode}`} title={mode==="practice"?`Latihan · ${topic.title}`:"Evaluasi Bab 3"} questions={mode==="practice"?practice[index]:assessment} practiceMode={mode==="practice"} close={()=>go(index)} isReady={ready} checkAnswer={checkAnswer} renderVisual={q=><QuestionVisual q={q}/>} renderAnswer={(q,answer,record,checked)=><PatternAnswer q={q} answer={answer} record={record} checked={checked}/>}/>}
    </div>
  </section>;
}
