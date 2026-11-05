"use client";
import {useState} from "react";
import {NumberSequence,PlaceValue} from "@/components/math-visual";
type Topic="A"|"B1"|"B2"|"C";
type Question={text:string;answer:number;kind:"compare"|"add"|"subtract"|"story";a:number;b:number;icon?:string};
const topics:{id:Topic;label:string;title:string;description:string}[]=[
{id:"A",label:"A. Lebih, Kurang, Selisih",title:"Mengenal Konsep Lebih dari, Kurang dari, dan Selisih",description:"Bandingkan dua kelompok benda. Selisih adalah beda banyaknya benda: kurangkan jumlah yang lebih besar dengan jumlah yang lebih kecil."},
{id:"B1",label:"B1. Satuan + Satuan",title:"Penjumlahan Satuan dengan Satuan",description:"Penjumlahan dapat dilakukan dengan menghitung maju, membuat 10 lebih dulu, atau menggabungkan dua kelompok. Contoh: 7 + 6 = 13."},
{id:"B2",label:"B2. Puluhan + Satuan",title:"Penjumlahan Puluhan dengan Satuan",description:"Pisahkan puluhan dan satuan. Contoh: 12 + 3 = 10 + (2 + 3) = 15. Kita juga dapat menghitung maju dari 12."},
{id:"C",label:"C. Pengurangan",title:"Pengurangan yang Hasilnya Kurang dari 20",description:"Pengurangan dapat diselesaikan dengan menghitung mundur, pasangan bilangan, atau nilai tempat. Contoh: 15 − 3 = 12."}
];
const practice:Record<Topic,Question[]>={
A:[{text:"Ada 8 kelereng merah dan 7 kelereng biru. Berapa selisihnya?",answer:1,kind:"compare",a:8,b:7},{text:"Ada 6 mangga dan 8 apel. Berapa kurangnya mangga dari apel?",answer:2,kind:"compare",a:6,b:8}],
B1:[{text:"Hitung dengan cara menghitung maju: 7 + 6 = ...",answer:13,kind:"add",a:7,b:6},{text:"Gunakan cara membuat 10: 6 + 5 = ...",answer:11,kind:"add",a:6,b:5}],
B2:[{text:"Malosi mempunyai 12 pensil. Ia mendapat 3 pensil lagi. Berapa semuanya?",answer:15,kind:"add",a:12,b:3},{text:"Hitung: 14 + 3 = ...",answer:17,kind:"add",a:14,b:3}],
C:[{text:"Hitung mundur: 15 − 4 = ...",answer:11,kind:"subtract",a:15,b:4},{text:"Gunakan nilai tempat: 16 − 4 = ...",answer:12,kind:"subtract",a:16,b:4}]
};
const evaluation:Question[]=[
{text:"Ada 8 kue lapis dan 6 onde-onde. Berapa selisihnya?",answer:2,kind:"compare",a:8,b:6},
{text:"Tika mempunyai 8 gantungan kunci, Kira 6. Berapa selisihnya?",answer:2,kind:"compare",a:8,b:6},
{text:"Kelompok B memiliki 9 benda. Kelompok A memiliki 3 benda lebih sedikit. Berapa benda A?",answer:6,kind:"subtract",a:9,b:3},
{text:"15 + 3 = ...",answer:18,kind:"add",a:15,b:3},
{text:"16 + 3 = ...",answer:19,kind:"add",a:16,b:3},
{text:"12 + 5 = ...",answer:17,kind:"add",a:12,b:5},
{text:"14 + 5 = ...",answer:19,kind:"add",a:14,b:5},
{text:"18 − 5 = ...",answer:13,kind:"subtract",a:18,b:5},
{text:"17 − 6 = ...",answer:11,kind:"subtract",a:17,b:6},
{text:"13 − 2 = ...",answer:11,kind:"subtract",a:13,b:2},
{text:"15 − 4 = ...",answer:11,kind:"subtract",a:15,b:4},
{text:"Ada 12 anak ayam. Datang lagi 3 anak ayam. Berapa semuanya?",answer:15,kind:"add",a:12,b:3},
{text:"Ada 4 kepik merah. Kepik kuning 2 lebih sedikit. Berapa kepik kuning?",answer:2,kind:"subtract",a:4,b:2},
{text:"Ada 4 kepik merah dan 2 kepik kuning. Berapa semuanya?",answer:6,kind:"add",a:4,b:2},
{text:"7 + 6 = ...",answer:13,kind:"add",a:7,b:6},
{text:"6 + 5 = ...",answer:11,kind:"add",a:6,b:5},
{text:"12 + 3 = ...",answer:15,kind:"add",a:12,b:3},
{text:"13 + 4 = ...",answer:17,kind:"add",a:13,b:4},
{text:"15 − 3 = ...",answer:12,kind:"subtract",a:15,b:3},
{text:"17 − 4 = ...",answer:13,kind:"subtract",a:17,b:4},
{text:"19 − 6 = ...",answer:13,kind:"subtract",a:19,b:6},
{text:"Ibu mempunyai 13 bolu. Dimakan 2. Berapa sisa bolu?",answer:11,kind:"subtract",a:13,b:2},
{text:"Wei mempunyai 11 pensil. Pensil Kira 3 lebih sedikit. Berapa pensil Kira?",answer:8,kind:"subtract",a:11,b:3},
{text:"Wei mempunyai 11 pensil dan Kira 8 pensil. Berapa jumlahnya?",answer:19,kind:"add",a:11,b:8}
];
function Manipulative({a,b,kind}:{a:number;b:number;kind:Question["kind"]}){return <div className="w-full space-y-3"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-base-300 bg-white p-2 text-center"><p className="text-xs font-bold">Kelompok A · {a}</p><div className="mt-2 flex min-h-14 flex-wrap justify-center gap-1">{Array.from({length:a},(_,i)=><span key={i} className="text-lg" aria-hidden>🔴</span>)}</div></div><div className="rounded-xl border border-base-300 bg-white p-2 text-center"><p className="text-xs font-bold">Kelompok B · {b}</p><div className="mt-2 flex min-h-14 flex-wrap justify-center gap-1">{Array.from({length:b},(_,i)=><span key={i} className="text-lg" aria-hidden>🔵</span>)}</div></div></div><p className="text-center text-lg font-extrabold">{a} {kind==="add"?"+":kind==="compare"?"dan":"−"} {b} {kind==="compare"?"· cari selisih": "= ?"}</p></div>}
export default function GradeOneChapterSix(){
 const [tab,setTab]=useState(0),[a,setA]=useState(7),[b,setB]=useState(6),[mode,setMode]=useState<"learn"|"quiz"|"result">("learn"),[evaluationMode,setEvaluationMode]=useState(false),[step,setStep]=useState(0),[answer,setAnswer]=useState(""),[checked,setChecked]=useState(false),[score,setScore]=useState(0);
 const topic=topics[tab];const questions=evaluationMode?evaluation:practice[topic.id];const q=questions[step];
 const maxA=topic.id==="B2"?16:topic.id==="C"?19:12;const maxB=topic.id==="A"?10:6;
 function start(isEvaluation:boolean){setEvaluationMode(isEvaluation);setStep(0);setAnswer("");setChecked(false);setScore(0);setMode("quiz");}
 function next(){if(step===questions.length-1)setMode("result");else{setStep(s=>s+1);setAnswer("");setChecked(false)}}
 function chooseTab(index:number){setTab(index);setMode("learn");setA(index===2?12:index===3?15:7);setB(index===3?3:6)}
 return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
  <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 1 / Bab 6</p><h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Penjumlahan dan Pengurangan sampai dengan 20</h1><p className="mt-3 max-w-3xl text-base-content/65">Belajar membandingkan kelompok, mencari selisih, menjumlahkan, dan mengurangkan bilangan menggunakan benda dan nilai tempat.</p>
  <div className="mt-7 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2"><div className="flex min-h-44 flex-col items-center justify-center bg-base-200 p-7 text-center"><span className="text-5xl text-success" aria-hidden>▶</span><p className="mt-3 font-bold">Video pembelajaran segera hadir</p><p className="mt-1 text-sm text-base-content/60">Video pengajar akan tersedia di sini.</p></div><div className="flex flex-col justify-center p-7"><h2 className="text-xl font-bold">Tonton, praktikkan, lalu uji pemahaman</h2><p className="mt-2 text-sm leading-7 text-base-content/65">Empat bagian belajar, masing-masing 2 soal latihan, dan 24 soal evaluasi.</p><a href="#materi-bab-6" className="btn btn-success mt-5 self-start">Mulai belajar</a></div></div>
  <div id="materi-bab-6" className="mt-8"><div className="mb-5 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Materi Bab 6">{topics.map((t,i)=><button key={t.id} type="button" role="tab" aria-selected={tab===i} onClick={()=>chooseTab(i)} className={`btn btn-sm shrink-0 ${tab===i?"btn-success":"btn-outline"}`}>{t.label}</button>)}</div>
  <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2"><div className="flex min-h-64 flex-col items-center justify-center gap-3 bg-success/5 p-4 sm:p-6"><p className="text-sm font-semibold">{topic.id==="A"?"Bandingkan banyak benda":topic.id==="C"?"Kurangi benda dan hitung sisanya":"Gabungkan dua kelompok benda"}</p><Manipulative a={a} b={b} kind={topic.id==="A"?"compare":topic.id==="C"?"subtract":"add"}/><div className="flex flex-wrap items-center justify-center gap-3"><label className="text-xs font-bold">Bilangan 1 <input aria-label="Bilangan pertama" type="number" min={topic.id==="B2"?10:1} max={maxA} value={a} onChange={e=>setA(Math.max(topic.id==="B2"?10:1,Math.min(topic.id==="B2"?Math.min(maxA,19-b):maxA,Number(e.target.value)||1)))} className="input input-bordered ml-2 h-10 w-16 text-center"/></label><label className="text-xs font-bold">Bilangan 2 <input aria-label="Bilangan kedua" type="number" min={1} max={maxB} value={b} onChange={e=>setB(Math.max(1,Math.min(topic.id==="B2"?Math.min(maxB,19-a):maxB,Number(e.target.value)||1)))} className="input input-bordered ml-2 h-10 w-16 text-center"/></label></div><p className="text-xl font-extrabold">{topic.id==="A"?"Selisih = "+Math.abs(a-b):`${a} ${topic.id==="C"?"−":"+"} ${b} = ${topic.id==="C"?a-b:a+b}`}</p></div><div className="flex flex-col justify-center p-6 sm:p-7"><p className="text-xs font-bold uppercase tracking-widest text-success">Submateri {tab+1} dari 4</p><h2 className="mt-3 text-2xl font-extrabold">{topic.title}</h2><p className="mt-4 leading-8 text-base-content/70">{topic.description}</p>{topic.id==="B1"?<NumberSequence sequence={[7,8,9,10,11,12,13]}/>:null}{topic.id==="B2"||topic.id==="C"?<div className="mt-4"><PlaceValue value={a}/></div>:null}</div></div>
  <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button className="btn btn-ghost" disabled={tab===0} onClick={()=>chooseTab(tab-1)}>← Sebelumnya</button><div className="flex flex-wrap justify-end gap-2"><button className="btn btn-success" onClick={()=>start(false)}>Latihan {topic.title} →</button>{tab===3?<button className="btn btn-outline btn-success" onClick={()=>start(true)}>Evaluasi Bab 6 · 24 soal →</button>:null}</div></div>
  {mode==="quiz"?<div id="latihan-bab-6" className="mx-auto mt-6 max-w-2xl rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold text-success">{evaluationMode?"Evaluasi Bab 6":`Latihan ${topic.label}`} · Soal {step+1}/{questions.length}</p><button className="btn btn-ghost btn-sm" onClick={()=>setMode("learn")}>Tutup</button></div><progress className="progress progress-success my-3 w-full" value={step+1} max={questions.length}/><h3 className="text-lg font-extrabold">{q.text}</h3><div className="mx-auto my-3 max-w-md rounded-xl bg-success/5 p-3"><Manipulative a={q.a} b={q.b} kind={q.kind}/></div><label className="flex items-center justify-between gap-3 font-bold">Jawaban <input aria-label="Jawaban soal" type="number" inputMode="numeric" value={answer} disabled={checked} onChange={e=>setAnswer(e.target.value)} className="input input-bordered w-24 text-center text-lg"/></label>{checked?<p role="status" className="mt-3 rounded-lg bg-success/10 p-3 text-sm">{Number(answer)===q.answer?"Benar!":"Belum tepat."} Jawaban: {q.answer}.</p>:null}<button className="btn btn-success mt-3 w-full" disabled={!checked&&answer.trim()===""} onClick={()=>{if(checked)next();else{setChecked(true);if(Number(answer)===q.answer)setScore(s=>s+1)}}}>{checked?"Lanjut →":"Periksa jawaban"}</button></div>:mode==="result"?<div className="mx-auto mt-6 max-w-2xl rounded-xl border border-base-300 bg-base-100 p-7 text-center"><h3 className="text-2xl font-extrabold">Latihan selesai!</h3><p className="mt-3 text-4xl font-extrabold text-success">{score}/{questions.length}</p><p className="mt-2 text-sm text-base-content/60">Skor belum tersimpan ke akun siswa.</p><button className="btn btn-success mt-5" onClick={()=>setMode("learn")}>Kembali ke materi</button></div>:null}
  </div></section>;
}
