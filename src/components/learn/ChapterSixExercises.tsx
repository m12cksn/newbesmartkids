"use client";
import {useEffect,useState} from "react";
import {ObjectArt,type ArtName} from "@/components/illustrations/ObjectArt";
export type Exercise={prompt:string;type:"objects"|"choice"|"numberline"|"make10"|"bond"|"place"|"draw"|"story"|"equation";a:number;b:number;answer:number;emoji?:ArtName;secondEmoji?:ArtName;options?:number[];operation?:"+"|"-";detail?:string};
export const chapter6Practice:Record<"A"|"B1"|"B2"|"C",Exercise[]>={
 A:[{prompt:"Ada 8 kelereng merah dan 7 kelereng biru. Pasangkan benda, lalu tentukan selisihnya.",type:"objects",a:8,b:7,answer:1,emoji:"marble-red",secondEmoji:"marble-blue"},
 {prompt:"Kelompok B berisi 9 benda. Gambarlah kelompok A yang 3 lebih sedikit.",type:"draw",a:9,b:3,answer:6,emoji:"star"}],
 B1:[{prompt:"7 + 6. Hitung maju 6 langkah mulai dari 7.",type:"numberline",a:7,b:6,answer:13,operation:"+"},
 {prompt:"6 + 5. Pecah 5 untuk membuat 10, lalu tentukan hasilnya.",type:"make10",a:6,b:5,answer:11,operation:"+"}],
 B2:[{prompt:"Malosi memiliki 12 pensil dan mendapat 3 lagi. Lengkapi tabel puluhan dan satuan hasilnya.",type:"place",a:12,b:3,answer:15,operation:"+",emoji:"pencil"},
 {prompt:"14 + 3. Lengkapi pasangan bilangan untuk mendapatkan hasilnya.",type:"bond",a:14,b:3,answer:17,operation:"+"}],
 C:[{prompt:"15 − 4. Hitung mundur empat langkah dari 15.",type:"numberline",a:15,b:4,answer:11,operation:"-"},
 {prompt:"16 − 4. Gunakan tabel puluhan dan satuan untuk mencari sisanya.",type:"place",a:16,b:4,answer:12,operation:"-"}]
};
export const chapter6Evaluation:Exercise[]=[
 {prompt:"Ada 8 potong kue dan 6 donat. Berapa selisihnya?",type:"objects",a:8,b:6,answer:2,emoji:"cake",secondEmoji:"donut"},
 {prompt:"Tika memiliki 8 gantungan kunci dan Kira 6. Pilih selisih yang benar.",type:"choice",a:8,b:6,answer:2,options:[1,2,3,4]},
 {prompt:"Kelompok B berisi 9 benda. Gambarlah kelompok A yang 3 lebih sedikit.",type:"draw",a:9,b:3,answer:6,emoji:"star"},
 {prompt:"15 + 3 = ...",type:"numberline",a:15,b:3,answer:18,operation:"+"},
 {prompt:"16 + 3 = ...",type:"place",a:16,b:3,answer:19,operation:"+"},
 {prompt:"12 + 5 = ...",type:"bond",a:12,b:5,answer:17,operation:"+"},
 {prompt:"14 + 5 = ...",type:"choice",a:14,b:5,answer:19,options:[17,18,19,20],operation:"+"},
 {prompt:"18 − 5 = ...",type:"numberline",a:18,b:5,answer:13,operation:"-"},
 {prompt:"17 − 6 = ...",type:"place",a:17,b:6,answer:11,operation:"-"},
 {prompt:"13 − 2 = ...",type:"bond",a:13,b:2,answer:11,operation:"-"},
 {prompt:"15 − 4 = ...",type:"choice",a:15,b:4,answer:11,options:[10,11,12,13],operation:"-"},
 {prompt:"Ada 12 anak ayam. Datang lagi 3. Berapa semuanya?",type:"story",a:12,b:3,answer:15,operation:"+",emoji:"chick"},
 {prompt:"Ada 4 kepik merah. Kepik kuning 2 lebih sedikit. Berapa kepik kuning?",type:"objects",a:4,b:2,answer:2,emoji:"ladybug"},
 {prompt:"Ada 4 kepik merah dan 2 kepik kuning. Berapa semuanya?",type:"choice",a:4,b:2,answer:6,options:[4,5,6,7],operation:"+"},
 {prompt:"7 + 6. Gunakan strategi membuat 10.",type:"make10",a:7,b:6,answer:13,operation:"+"},
 {prompt:"6 + 5. Pilih hasil penjumlahan.",type:"choice",a:6,b:5,answer:11,options:[10,11,12,13],operation:"+"},
 {prompt:"12 + 3. Lengkapi nilai tempat.",type:"place",a:12,b:3,answer:15,operation:"+"},
 {prompt:"13 + 4. Hitung maju.",type:"numberline",a:13,b:4,answer:17,operation:"+"},
 {prompt:"15 − 3. Hitung mundur.",type:"numberline",a:15,b:3,answer:12,operation:"-"},
 {prompt:"17 − 4. Lengkapi pasangan bilangan.",type:"bond",a:17,b:4,answer:13,operation:"-"},
 {prompt:"19 − 6. Lengkapi tabel nilai tempat.",type:"place",a:19,b:6,answer:13,operation:"-"},
 {prompt:"Ibu memiliki 13 bolu. Dimakan 2. Berapa sisa bolu?",type:"story",a:13,b:2,answer:11,operation:"-",emoji:"cupcake"},
 {prompt:"Wei memiliki 11 pensil. Kira memiliki 3 lebih sedikit. Berapa pensil Kira?",type:"draw",a:11,b:3,answer:8,emoji:"pencil"},
 {prompt:"Wei memiliki 11 pensil dan Kira 8 pensil. Berapa jumlah semuanya?",type:"story",a:11,b:8,answer:19,operation:"+",emoji:"pencil"}
];
const range=(n:number)=>Array.from({length:Math.max(0,n)},(_,i)=>i);
export function ChapterSixExercise({question:q,onComplete}:{question:Exercise;onComplete:(correct:boolean)=>void}){
 const [value,setValue]=useState("");const [steps,setSteps]=useState(0);const [draw,setDraw]=useState(0);const [part,setPart]=useState(0);const [tens,setTens]=useState("");const [units,setUnits]=useState("");const [choice,setChoice]=useState<number|null>(null);const [checked,setChecked]=useState(false);
 useEffect(()=>{setValue("");setSteps(0);setDraw(0);setPart(0);setTens("");setUnits("");setChoice(null);setChecked(false)},[q]);
 const result=q.answer;
 const correct=q.type==="choice"?choice===result:q.type==="draw"?draw===result:q.type==="place"?Number(tens)===Math.floor(result/10)&&Number(units)===result%10:q.type==="numberline"?steps===q.b&&Number(value)===result:q.type==="make10"?part===10-q.a&&Number(value)===result:q.type==="bond"?Number(value)===result:Number(value)===result;
 const ready=q.type==="choice"?choice!==null:q.type==="draw"?draw>0:q.type==="place"?tens!==""&&units!=="":q.type==="numberline"?steps===q.b&&value.trim()!=="":q.type==="make10"?value.trim()!==""&&part>0:value.trim()!=="";
 const input=<input type="number" inputMode="numeric" aria-label="Jawaban" className="input input-bordered h-11 w-24 text-center text-lg" value={value} disabled={checked} onChange={e=>setValue(e.target.value)}/>;
 return <div className="w-full space-y-3">
 <p className="text-lg font-extrabold leading-snug">{q.prompt}</p>
 <div className="rounded-xl bg-emerald-50 p-3 text-slate-900">
 {q.type==="objects"?<><div className="grid grid-cols-2 gap-2">{[q.a,q.b].map((n,k)=><div key={k} className="rounded-xl bg-white p-2 text-center"><p className="text-xs font-bold">{k?"Kelompok B":"Kelompok A"}</p><div className="mt-2 flex flex-wrap justify-center gap-1">{range(q.prompt.includes("kepik kuning")&&k?1:n).map(i=>(q.prompt.includes("kepik kuning")&&k?<span key={i} className="grid size-7 place-items-center rounded-full border-2 border-dashed border-base-300 font-bold">?</span>:<ObjectArt key={i} name={k?(q.secondEmoji??"counter-yellow"):(q.emoji??"counter-green")} className="size-7"/>))}</div></div>)}</div><p className="mt-2 text-center text-xs">{q.prompt.includes("kepik kuning")?"Kurangi jumlah kepik merah sesuai petunjuk.":"Hitung selisih kedua kelompok."}</p></>:
 q.type==="choice"?<div className="grid grid-cols-2 gap-2">{(q.options||[]).map(n=><button key={n} type="button" disabled={checked} aria-pressed={choice===n} onClick={()=>setChoice(n)} className={`min-h-12 rounded-xl border-2 bg-white text-xl font-bold ${choice===n?"border-emerald-600":"border-slate-200"}`}>{n}</button>)}</div>:
 q.type==="draw"?<><p className="mb-2 text-sm">Ketuk + untuk menggambar benda A. Kelompok B berisi {q.a} benda; kelompok A harus {q.b} lebih sedikit.</p><div className="flex min-h-16 flex-wrap gap-1 rounded-lg bg-white p-2">{range(draw).map(i=><ObjectArt key={i} name={q.emoji??"star"} className="size-8"/>)}</div><div className="mt-2 flex justify-center gap-2"><button type="button" disabled={checked||draw===0} className="btn btn-outline btn-sm" onClick={()=>setDraw(n=>n-1)}>− Hapus</button><span className="grid min-w-10 place-items-center font-bold">{draw}</span><button type="button" disabled={checked||draw>=20} className="btn btn-success btn-sm" onClick={()=>setDraw(n=>n+1)}>+ Gambar</button></div></>:
 q.type==="numberline"?<><p className="mb-2 text-sm">Ketuk satu langkah setiap kali ({steps}/{q.b}), lalu tuliskan bilangan tempat kamu berhenti.</p><div className="grid grid-cols-7 gap-1 sm:grid-cols-11">{range(21).map(i=><span key={i} className={`grid h-8 place-items-center rounded text-xs font-bold ${i===(q.operation==="-"?q.a-steps:q.a+steps)?"bg-emerald-600 text-white":"bg-white"}`}>{i}</span>)}</div><div className="mt-3 flex items-center justify-center gap-2"><button type="button" disabled={checked||steps===0} className="btn btn-outline btn-sm" onClick={()=>setSteps(n=>n-1)}>↶</button><button type="button" disabled={checked||steps>=q.b} className="btn btn-success btn-sm" onClick={()=>setSteps(n=>n+1)}>{q.operation==="-"?"← Mundur":"Maju →"}</button></div></>:
 q.type==="make10"?<><p className="text-center text-sm">Pecah {q.b} agar {q.a} menjadi 10.</p><div className="my-3 flex items-center justify-center gap-3 text-2xl font-bold"><span>{q.a}</span><span>+</span><span className="rounded-lg bg-white px-4 py-2">{part}</span><span>+</span><span className="rounded-lg bg-white px-4 py-2">{q.b-part}</span></div><input aria-label="Bagian untuk membuat 10" type="range" min={0} max={q.b} value={part} disabled={checked} onChange={e=>setPart(Number(e.target.value))} className="range range-success w-full"/><p className="text-center text-sm">{q.a} + {part} = {q.a+part}</p></>:
 q.type==="place"?<><p className="mb-2 text-sm">Isi nilai tempat hasil {q.a} {q.operation==="-"?"−":"+"} {q.b}.</p><div className="grid grid-cols-2 gap-2">{[["Puluhan",tens,setTens],["Satuan",units,setUnits]].map(([label,v,set],i)=><label key={i} className="flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-sm font-bold">{label as string}<input aria-label={label as string} type="number" min={0} max={9} value={v as string} disabled={checked} onChange={e=>(set as (v:string)=>void)(e.target.value)} className="input input-bordered h-11 w-20 text-center text-lg"/></label>)}</div></>:
 q.type==="bond"?<><p className="mb-2 text-sm">Bilangan {q.a} terdiri dari 10 dan {q.a-10}. Hitung {q.a-10} {q.operation==="-"?"−":"+"} {q.b}, kemudian gabungkan kembali dengan 10.</p><div className="flex items-center justify-center gap-2 text-xl font-bold"><span className="rounded-lg bg-white p-3">10</span><span>+</span><span className="rounded-lg bg-white p-3">{q.a-10}</span><span>{q.operation==="-"?"−":"+"}</span><span className="rounded-lg bg-white p-3">{q.b}</span></div></>:
 <>{q.emoji&&<ObjectArt name={q.emoji} className="mx-auto mb-2 size-10"/>}<div className="flex flex-wrap justify-center gap-1">{range(Math.min(q.a,20)).map(i=><ObjectArt key={i} name={q.emoji??"counter-green"} className="size-6"/>)}</div><div className="mt-2 flex flex-wrap items-center justify-center gap-2">{q.operation==="+"?<><span className="rounded-lg bg-white px-2 py-1 text-sm font-bold">+ {q.b} lagi</span><div className="flex flex-wrap justify-center gap-1">{range(q.b).map(i=><ObjectArt key={i} name={q.emoji??"counter-green"} className="size-6"/>)}</div></>:<span className="rounded-lg bg-white px-2 py-1 text-sm font-bold">{q.b} benda diambil dari {q.a}</span>}</div><p className="mt-2 text-center font-bold">{q.a} {q.operation==="-"?"−":"+"} {q.b} = ?</p></>}
 </div>
 {q.type==="choice"||q.type==="draw"||q.type==="place"?null:<label className="flex items-center justify-between gap-3 text-sm font-bold">Jawaban {input}</label>}
 {checked?<p role="status" className={`rounded-lg p-3 text-sm font-semibold ${correct?"bg-emerald-100 text-emerald-900":"bg-amber-100 text-amber-950"}`}>{correct?"Bagus, jawabanmu tepat!":`Belum tepat. Jawaban yang benar: ${result}.`}</p>:null}
 <button type="button" className="btn btn-success w-full" disabled={!checked&&!ready} onClick={()=>checked?onComplete(correct):setChecked(true)}>{checked?"Soal berikutnya →":"Periksa jawaban"}</button>
 </div>;
}
