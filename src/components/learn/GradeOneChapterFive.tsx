"use client";
import {useState} from "react";
import {ObjectCounter,TenFrame,NumberSequence,PlaceValue,NumberComparison} from "@/components/math-visual";
type Topic="A"|"B"|"C"|"D"|"E";
type Item={topic:Topic;prompt:string;answer:string;count?:number;sequence?:string;choices?:string[];hint:string};
const titles:Record<Topic,string>={A:"Menghitung, Membaca, dan Menulis Bilangan",B:"Menghitung Maju dan Mundur",C:"Nilai Tempat",D:"Membandingkan Bilangan",E:"Evaluasi Bab 5"};
const lessons:Record<Topic,string>={A:"Bilangan 11–20 dapat dihitung dari sepuluh benda dan sisanya. Contoh: 13 = 10 + 3, dibaca tiga belas.",B:"Membilang maju berarti menambah satu, sedangkan membilang mundur berarti mengurangi satu.",C:"Sepuluh satuan membentuk satu puluhan. Contoh: 16 terdiri atas 1 puluhan dan 6 satuan.",D:"Bandingkan dua kelompok dengan menghitung benda. Kita juga bisa mengurutkan bilangan dari kecil ke besar.",E:"Kerjakan soal dari keempat materi untuk mengetahui pemahamanmu."};
const items:Item[]=[];
function add(topic:Topic,prompt:string,answer:string,extra:Partial<Item>={}){items.push({topic,prompt,answer,hint:"Perhatikan bilangan dan hitung dengan teliti.",...extra})}
for(let n=11;n<=20;n++)add("A","Ada berapa benda pada gambar?",String(n),{count:n,hint:"Hitung sepuluh benda pertama, lalu sisanya."});
add("A","10 + 5 = ...","15");add("A","10 + 8 = ...","18");
for(let i=0;i<12;i++){const n=11+i%9;const backwards=i%2===1;add("B","Isi bilangan yang hilang.",String(n),{sequence:backwards?`${n+2}, ${n+1}, ?, ${n-1}`:`${n-2}, ${n-1}, ?, ${n+1}`,hint:backwards?"Urutan mundur berkurang satu.":"Urutan maju bertambah satu."})}
for(let i=0;i<12;i++){const n=11+i%10;add("C",`Bilangan ${n} terdiri dari 1 puluhan dan berapa satuan?`,String(n-10),{count:n,hint:"Hitung benda yang tersisa setelah sepuluh."})}
const pairs:[[number,number],...Array<[number,number]>]=[[15,11],[10,14],[12,18],[19,16],[13,17],[20,15],[11,12],[18,14],[16,19],[17,13],[14,20],[19,15]];
for(const [a,b] of pairs)add("D",`Bilangan mana lebih besar: ${a} atau ${b}?`,String(Math.max(a,b)),{choices:[String(a),String(b)],hint:"Bilangan yang lebih jauh setelah 10 lebih besar."});
const evals:Item[]=[...items.filter(x=>x.topic==="A").slice(0,4),...items.filter(x=>x.topic==="B").slice(0,4),...items.filter(x=>x.topic==="C").slice(0,4),...items.filter(x=>x.topic==="D").slice(0,4)];
evals.forEach(x=>add("E",x.prompt,x.answer,{count:x.count,sequence:x.sequence,choices:x.choices,hint:x.hint}));
add("E","10 + 7 = ...","17");add("E","10 + 9 = ...","19");add("E","Bilangan setelah 18 adalah ...","19");add("E","Bilangan sebelum 12 adalah ...","11");

const topics:Topic[]=["A","B","C","D"];
const descriptions:Record<Exclude<Topic,"E">,string>={
 A:"Hitung benda satu per satu dari 11 sampai 20. Sepuluh benda dapat dikelompokkan terlebih dahulu, kemudian hitung sisanya.",
 B:"Membilang maju berarti bertambah satu. Membilang mundur berarti berkurang satu. Perhatikan urutan dari 11 sampai 20.",
 C:"Sepuluh satuan sama dengan satu puluhan. Bilangan 16 terdiri atas satu puluhan dan enam satuan.",
 D:"Bandingkan dua bilangan dengan menghitung benda atau melihat urutannya. Bilangan yang lebih besar berada setelah bilangan yang lebih kecil."
};
const words=["nol","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas","dua belas","tiga belas","empat belas","lima belas","enam belas","tujuh belas","delapan belas","sembilan belas","dua puluh"];
const assessment=[...items.filter(q=>q.topic==="E"),...items.filter(q=>q.topic==="A").slice(4,6),...items.filter(q=>q.topic==="B").slice(4,6)];
function QuestionVisual({question,topic}:{question:Item;topic:Topic}){
 if(question.sequence)return <NumberSequence sequence={question.sequence.split(",").map(x=>x.trim()==="?"?null:Number(x.trim()))}/>;
 if(question.count)return <div className="mx-auto w-full max-w-xs"><ObjectCounter count={question.count}/></div>;
 if(topic==="D")return null;
 return <div className="mx-auto max-w-xs rounded-xl bg-success/5 p-3 text-center text-lg font-semibold">Hitung dengan teliti!</div>;
}
export default function GradeOneChapterFive(){
 const [tab,setTab]=useState(0),[count,setCount]=useState(11),[position,setPosition]=useState(15),[place,setPlace]=useState(16),[compare,setCompare]=useState<[number,number]>([14,18]);
 const [mode,setMode]=useState<"learn"|"quiz"|"result">("learn"),[quizTopic,setQuizTopic]=useState<Topic>("A"),[step,setStep]=useState(0),[answer,setAnswer]=useState(""),[checked,setChecked]=useState(false),[score,setScore]=useState(0);
 const current=topics[tab];const qs=quizTopic==="E"?assessment:items.filter(q=>q.topic===quizTopic).slice(0,2);const q=qs[step];
 function start(t:Topic){setQuizTopic(t);setStep(0);setAnswer("");setChecked(false);setScore(0);setMode("quiz")}
 function next(){if(step+1>=qs.length){setMode("result")}else{setStep(v=>v+1);setAnswer("");setChecked(false)}}
 const selectedTopic=topics[tab];
 return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
  <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 1 / Bab 5</p>
  <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Ayo Membilang sampai dengan 20</h1>
  <p className="mt-3 max-w-2xl text-base-content/65">Menghitung dan menulis bilangan, membilang maju dan mundur, mengenal nilai tempat, serta membandingkan bilangan sampai 20.</p>
  <div className="mt-7 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
   <div className="flex min-h-48 flex-col items-center justify-center bg-base-200 p-7 text-center"><span className="text-5xl text-success" aria-hidden="true">▶</span><p className="mt-3 font-bold">Video pembelajaran segera hadir</p><p className="mt-1 text-sm text-base-content/60">Video pengajar akan tersedia di sini.</p></div>
   <div className="flex flex-col justify-center p-7"><p className="text-xs font-bold uppercase tracking-wider text-success">Belajar bersama BeSmartKids</p><h2 className="mt-2 text-xl font-bold">Tonton, coba, lalu berlatih</h2><p className="mt-2 text-sm leading-7 text-base-content/65">Pelajari empat submateri dengan peraga interaktif, kerjakan dua latihan setiap materi, lalu selesaikan evaluasi 24 soal.</p><a href="#materi-bab-5" className="btn btn-success mt-5 self-start">Mulai belajar</a></div>
  </div>
  <div id="materi-bab-5" className="mt-8">
   <div className="mb-5 flex gap-2 overflow-x-auto pb-2">{topics.map((t,i)=><button key={t} type="button" onClick={()=>{setTab(i);setMode("learn")}} aria-current={tab===i?"step":undefined} className={`btn btn-sm shrink-0 ${tab===i?"btn-success":"btn-outline"}`}>{t}. {titles[t]}</button>)}</div>
   {mode==="learn"?<div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2">
    <div className="flex min-h-72 flex-col items-center justify-center gap-4 bg-success/5 p-5 text-center sm:p-6">
     {current==="A"?<><p className="font-semibold">Tambah atau kurangi apel, lalu baca bilangannya.</p><ObjectCounter count={count}/><div className="flex flex-wrap justify-center gap-2"><button className="btn btn-outline" onClick={()=>setCount(v=>Math.max(11,v-1))}>− Kurangi</button><button className="btn btn-success" onClick={()=>setCount(v=>Math.min(20,v+1))}>+ Tambah apel</button></div><p className="text-xl font-bold">{count} ({words[count]}) apel</p></>:
     current==="B"?<><p className="font-semibold">Langkahkan angka maju atau mundur.</p><div className="grid grid-cols-5 gap-2 sm:grid-cols-10">{Array.from({length:10},(_,i)=><span key={i} className={`grid size-10 place-items-center rounded-lg border font-bold ${position===i+11?"border-success bg-success text-success-content":"border-base-300 bg-base-100"}`}>{i+11}</span>)}</div><div className="flex gap-2"><button className="btn btn-outline" onClick={()=>setPosition(v=>Math.max(11,v-1))}>← Mundur</button><button className="btn btn-success" onClick={()=>setPosition(v=>Math.min(20,v+1))}>Maju →</button></div><p className="text-3xl font-extrabold">{position}</p></>:
     current==="C"?<><p className="font-semibold">Lihat puluhan dan satuannya.</p><TenFrame count={place}/><PlaceValue value={place}/><div className="flex gap-2"><button className="btn btn-outline" onClick={()=>setPlace(v=>Math.max(11,v-1))}>−</button><button className="btn btn-success" onClick={()=>setPlace(v=>Math.min(20,v+1))}>+</button></div></>:
     <><p className="font-semibold">Pilih kelompok yang lebih banyak.</p><NumberComparison left={compare[0]} right={compare[1]} onSelect={()=>{}}/><p className="font-bold">{Math.max(...compare)} lebih besar dari {Math.min(...compare)}</p><button className="btn btn-outline" onClick={()=>setCompare(v=>v[0]===14?[19,12]:[14,18])}>Coba contoh lain</button></>}
    </div>
    <div className="flex flex-col justify-between p-6 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-wider text-success">Submateri {tab+1} dari 4</p><h2 className="mt-3 text-2xl font-extrabold">{selectedTopic}. {titles[selectedTopic]}</h2><p className="mt-4 leading-8 text-base-content/70">{descriptions[selectedTopic]}</p></div><div className="mt-7 flex flex-wrap items-center justify-between gap-2"><button className="btn btn-ghost" disabled={tab===0} onClick={()=>setTab(v=>v-1)}>Sebelumnya</button><div className="flex flex-wrap gap-2"><button className="btn btn-outline btn-success" onClick={()=>start(current)}>Latihan 2 soal</button>{tab<3?<button className="btn btn-success" onClick={()=>setTab(v=>v+1)}>Materi berikutnya →</button>:<button className="btn btn-success" onClick={()=>start("E")}>Evaluasi 24 soal →</button>}</div></div></div>
   </div>:mode==="quiz"?<div className="fixed inset-0 z-50 flex h-[100dvh] flex-col overflow-hidden bg-base-200 p-2 text-base-content sm:p-5">
    <div className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-2 pb-2"><div className="min-w-0"><p className="text-xs font-bold text-success">{quizTopic==="E"?"Evaluasi Bab 5":`Latihan Materi ${quizTopic}`}</p><p className="text-sm font-semibold">Soal {step+1} dari {qs.length}</p></div><button className="btn btn-ghost btn-sm" onClick={()=>setMode("learn")}>✕ Kembali</button></div>
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-base-300 bg-base-100 p-3 shadow-sm sm:gap-3 sm:p-5">
     <progress className="progress progress-success w-full shrink-0" value={step+1} max={qs.length}/>
     <h2 className="shrink-0 text-base font-extrabold leading-snug sm:text-xl">{q.prompt}</h2>
     <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-success/5 p-1 sm:p-3"><div className="max-h-full w-full overflow-hidden"><QuestionVisual question={q} topic={quizTopic}/></div></div>
     {q.choices?<NumberComparison left={Number(q.choices[0])} right={Number(q.choices[1])} selected={answer?Number(answer):null} onSelect={n=>setAnswer(String(n))} disabled={checked} className="max-h-32 shrink-0 overflow-hidden"/>:<label className="flex shrink-0 items-center justify-between gap-3 text-sm font-bold">Jawaban <input aria-label="Jawaban" inputMode="numeric" type="number" disabled={checked} value={answer} onChange={e=>setAnswer(e.target.value)} className="input input-bordered w-28 text-center text-lg"/></label>}
     {checked?<p role="status" className={`shrink-0 rounded-lg p-2 text-xs sm:text-sm ${answer===q.answer?"bg-success/10":"bg-warning/20"}`}>{answer===q.answer?"Benar!":`Jawaban benar: ${q.answer}.`} {q.hint}</p>:null}
     <button className="btn btn-success w-full shrink-0" disabled={!checked&&!answer} onClick={()=>{if(checked)next();else{setChecked(true);if(answer===q.answer)setScore(v=>v+1)}}}>{checked?(step+1===qs.length?"Lihat hasil":"Soal berikutnya →"):"Periksa jawaban"}</button>
    </div>
   </div>:<div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center"><p className="text-xs font-bold uppercase tracking-widest text-success">{quizTopic==="E"?"Evaluasi selesai":"Latihan selesai"}</p><p className="mt-4 text-5xl font-extrabold">{score}/{qs.length}</p><p className="mt-3 text-sm text-base-content/60">Skor belum disimpan ke akun siswa.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button className="btn btn-outline" onClick={()=>start(quizTopic)}>Ulangi</button><button className="btn btn-success" onClick={()=>setMode("learn")}>Kembali ke materi</button>{quizTopic!=="E"?<button className="btn btn-success" onClick={()=>start("E")}>Evaluasi 24 soal</button>:null}</div></div>}
  </div>
 </section>;
}
