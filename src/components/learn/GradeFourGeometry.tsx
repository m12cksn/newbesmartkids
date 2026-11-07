"use client";
import {useState} from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {assessment,practice,topics,shapes,layouts,regularPoints,correct,ready,type Point,type GeoQuestion} from "@/data/grade-four-geometry";
const colours=["#fbbf24","#38bdf8","#a78bfa","#34d399","#fb7185","#fb923c","#93c5fd"];
const pts=(points:Point[])=>points.map(p=>p.join(",")).join(" ");
function Drawing({id,rotate=0,edges=false}:{id:string;rotate?:number;edges?:boolean}) {
 const shape=shapes[id];
 return <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-44" role="img" aria-label={`Gambar ${shape.name}`}>
  <g transform={`rotate(${rotate} 100 100)`} fill="#a7f3d0" stroke="#065f46" strokeWidth="3" strokeLinejoin="round">
   {shape.curved?<circle cx="100" cy="100" r="70"/>:shape.open?<polyline points={pts(shape.points!)} fill="none"/>:<polygon points={pts(shape.points!)}/>}
   {edges&&shape.points?.map(([x,y],i)=>{const end=shape.points![(i+1)%shape.points!.length];return <g key={i}><line x1={x} y1={y} x2={end[0]} y2={end[1]} stroke={colours[i%7]} strokeWidth="6"/><circle cx={x} cy={y} r="5" fill="#064e3b"/><text x={(x+end[0])/2} y={(y+end[1])/2-8} fill="#0f172a" stroke="none" fontSize="15">{i+1}</text></g>})}
   {(id==="right"||id==="scalene")&&<path d="M40 145H55V160" fill="none"/>}
  </g>
 </svg>;
}
function Pieces({layout,values,click}:{layout:string;values?:string[];click?:(i:number)=>void}) {
 const parts=layouts[layout].pieces;
 return <svg viewBox="-10 -10 220 220" className="mx-auto w-full max-w-72" role="group" aria-label={layouts[layout].name}>
  {parts.map((piece,i)=>{
   const filled=values===undefined||Boolean(values[i]);
   // Slot outline always remains visible; a wrong selected piece is shown at the slot centroid at its original size.
   const selected=values?.[i]?parts[Number(values[i])-1]:undefined;
   const centre=(p:Point[])=>p.reduce((a,b)=>[a[0]+b[0]/p.length,a[1]+b[1]/p.length],[0,0]);
   const a=centre(piece.points),b=selected?centre(selected.points):a;
   return <g key={i} role={click?"button":undefined} tabIndex={click?0:undefined} aria-label={click?`Tempat ${i+1}`:undefined}
    onClick={()=>click?.(i)} onKeyDown={e=>{if(click&&(e.key==="Enter"||e.key===" ")){e.preventDefault();click(i)}}} className={click?"cursor-pointer focus:outline-2 focus:outline-success":""}>
    <polygon points={pts(piece.points)} fill={values===undefined?colours[i]:"#f1f5f9"} stroke="#334155" strokeWidth="2" strokeDasharray={filled?undefined:"5 3"}/>
    {selected&&<polygon pointerEvents="none" points={pts(selected.points)} transform={`translate(${a[0]-b[0]} ${a[1]-b[1]})`} fill={colours[Number(values![i])-1]} stroke="#334155" strokeWidth="2" opacity=".85"/>}
    {!click&&<text x={a[0]} y={a[1]+4} textAnchor="middle" fontSize="12" fill="#0f172a">{i+1}</text>}
   </g>
  })}
 </svg>;
}
function Assembly({layout,value,record,disabled=false}:{layout:string;value:string;record:(v:string)=>void;disabled?:boolean}) {
 const [selected,setSelected]=useState<number|null>(null);
 const parts=layouts[layout].pieces, values=Array.from({length:parts.length},(_,i)=>value.split("|")[i]||"");
 return <div className="space-y-3">
  <p className="text-sm">Pilih potongan berwarna, lalu ketuk tempat pada target. Ketuk tempat terisi tanpa memilih potongan untuk mengosongkannya.</p>
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{parts.map((part,i)=><button key={i} disabled={disabled||values.includes(String(i+1))} aria-pressed={selected===i} aria-label={`Potongan ${i+1}`} className={`rounded-lg border-2 p-1 ${selected===i?"border-success bg-success/10":"border-base-300"}`} onClick={()=>setSelected(i)}>
   <svg viewBox="-10 -10 220 220" className="h-16 w-full" aria-hidden="true"><polygon points={pts(part.points)} fill={colours[i]} stroke="#334155" strokeWidth="3"/></svg><span className="text-xs">Potongan {i+1}</span>
  </button>)}</div>
  <Pieces layout={layout} values={values} click={disabled?undefined:i=>{const next=[...values];next[i]=selected===null?"":String(selected+1);record(next.join("|"));setSelected(null)}}/>
  <p aria-live="polite" className="text-sm font-semibold">{values.filter(Boolean).length} dari {parts.length} potongan dipasang</p>
  <button className="btn btn-sm btn-outline" disabled={disabled} onClick={()=>{record("");setSelected(null)}}>Kosongkan susunan</button>
 </div>;
}
function Mapping({q,value,record,disabled}:{q:GeoQuestion;value:string;record:(v:string)=>void;disabled:boolean}) {
 const [selected,setSelected]=useState<number|null>(null);
 const values=Array.from({length:q.items!.length},(_,i)=>value.split("|")[i]??"");
 return <div>
  <p className="mb-2 text-sm">{q.task==="match"?"Ketuk gambar, lalu ketuk cirinya untuk membuat garis penghubung.":"Ketuk gambar, lalu ketuk kotak tujuan. Gambar akan masuk ke kelompok pilihanmu."} Pilih lagi untuk mengubah.</p>
  <div className="relative grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
   {q.task==="match"&&<svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Garis pasangan" role="img">{values.map((v,i)=>v!==""&&<line key={i} x1="40" y1={(i+.5)*100/values.length} x2="60" y2={(Number(v)+.5)*100/q.destinations!.length} stroke={colours[i]} strokeWidth="1"/>)}</svg>}
   <div className="flex flex-col justify-around gap-2">{q.items!.map((id,i)=><button key={i} disabled={disabled} aria-label={`Gambar ${String.fromCharCode(65+i)}`} aria-pressed={selected===i} onClick={()=>setSelected(i)} className={`rounded-lg border-2 p-1 ${selected===i?"border-success bg-success/10":"border-base-300"}`}>
    <span className="text-sm font-bold">{String.fromCharCode(65+i)}</span><Drawing id={id}/>{q.task==="match"&&values[i]!==""&&<span className="text-xs">Terhubung ke {Number(values[i])+1}</span>}
   </button>)}</div>
   <div className="flex flex-col justify-around gap-2">{q.destinations!.map((label,j)=><button key={label} disabled={disabled||selected===null} aria-label={`Tujuan ${j+1}: ${label}`} className="min-h-20 min-w-0 break-words rounded-lg border-2 border-dashed border-info bg-info/5 p-2 text-sm" onClick={()=>{if(selected!==null){values[selected]=String(j);record(values.join("|"));setSelected(null)}}}>
    <strong>{j+1}. {label}</strong>{q.task==="sort"&&values.map((v,i)=>v===String(j)&&<span className="mt-1 block rounded bg-base-100 p-1" key={i}>{String.fromCharCode(65+i)}<Drawing id={q.items![i]}/></span>)}
   </button>)}</div>
  </div>
 </div>;
}
function Construction({value,record,disabled}:{value:string;record:(v:string)=>void;disabled:boolean}){
 const [n,setN]=useState(value?Number(value.split(":")[0]):3),[closed,setClosed]=useState(Boolean(value)),[moved,setMoved]=useState(value.includes(":irregular"));
 const points=regularPoints(n).map(([x,y],i):Point=>i===0&&moved?[x+20,y+25]:[x,y]);
 return <div className="space-y-3"><label className="block font-bold">Banyak titik: {n}<input aria-label="Banyak titik" className="range range-success mt-3 w-full" type="range" min="3" max="12" value={n} disabled={disabled} onChange={e=>{setN(Number(e.target.value));setClosed(false);record("")}}/></label>
 <svg viewBox="0 0 200 200" role="img" aria-label={`${n} titik${closed?", terhubung tertutup":""}`} className="mx-auto w-full max-w-60">
 {closed&&<polygon points={pts(points)} fill="#a7f3d0" stroke="#065f46" strokeWidth="3"/>}{points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#0f766e"/>)}</svg>
 <div className="flex flex-wrap gap-2"><button disabled={disabled} className="btn btn-outline" onClick={()=>{setMoved(!moved);setClosed(false);record("")}}>{moved?"Kembalikan titik":"Geser satu titik"}</button><button disabled={disabled} className="btn btn-outline" onClick={()=>{setClosed(true);record(String(n)+(moved?":irregular":""))}}>Hubungkan semua titik</button></div><p aria-live="polite">{closed?`${n} sisi lurus membentuk bangun tertutup.`:"Titik-titik belum dihubungkan."}</p></div>;
}
function Visual({q}:{q:GeoQuestion}){return <>{q.figures&&q.figures.length>0&&<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{q.figures.map((id,i)=><figure key={i} className="rounded-lg bg-info/5 p-2"><Drawing id={id}/><figcaption className="text-center font-bold">{String.fromCharCode(65+i)}</figcaption></figure>)}</div>}{q.layout&&q.task!=="assemble"&&<Pieces layout={q.layout}/>}</>}
function Answer({q,value,record,disabled}:{q:GeoQuestion;value:string;record:(v:string)=>void;disabled:boolean}){
 if(q.task==="assemble")return <Assembly layout={q.layout!} value={value} record={record} disabled={disabled}/>;
 if(q.task==="sort"||q.task==="match")return <Mapping q={q} value={value} record={record} disabled={disabled}/>;
 if(q.task==="construct")return <Construction value={value} record={record} disabled={disabled}/>;
 return <label className="block font-bold">Jawaban<input className="input input-bordered mt-1 block w-36" inputMode="numeric" value={value} disabled={disabled} onChange={e=>record(e.target.value.replace(/\D/g,""))}/></label>;
}
function Lab({index}:{index:number}){
 const [shape,setShape]=useState(index===1?"right":"square"),[rotation,setRotation]=useState(0),[edges,setEdges]=useState(false),[n,setN]=useState(5),[open,setOpen]=useState(false),[layout,setLayout]=useState("square"),[answer,setAnswer]=useState(""),[cut,setCut]=useState("diagonal");
 if(index===0)return <div className="space-y-4"><label className="block font-bold">Banyak sisi: {n}<input aria-label="Banyak sisi" className="range range-success w-full" type="range" min="3" max="10" value={n} onChange={e=>setN(Number(e.target.value))}/></label><svg viewBox="0 0 200 200" className="mx-auto w-full max-w-64" role="img" aria-label={open?"Garis terbuka":"Segibanyak beraturan"}>{open?<polyline points={pts(regularPoints(n))} fill="none" stroke="#0f766e" strokeWidth="4"/>:<polygon points={pts(regularPoints(n))} fill="#a7f3d0" stroke="#0f766e" strokeWidth="4"/>}</svg><button className="btn btn-outline" onClick={()=>setOpen(!open)}>{open?"Tutup garis terakhir":"Buka garis terakhir"}</button><p aria-live="polite">{open?`Sekarang ada ${n-1} ruas garis. Bukan segibanyak karena belum tertutup.`:`Sekarang ada ${n} sisi sama panjang dan ${n} sudut sama besar: segibanyak beraturan.`}</p></div>;
 if(index===1||index===2)return <div className="space-y-4"><label className="block font-bold">Pilih bangun<select className="select select-bordered mt-2 w-full" value={shape} onChange={e=>setShape(e.target.value)}>{(index===1?["right","scalene","equilateral","isosceles","obtuse"]:["square","rectangle","rhombus","kite","parallelogram","trapezium","irregular"]).map(id=><option key={id} value={id}>{shapes[id].name}</option>)}</select></label><Drawing id={shape} rotate={rotation} edges={edges}/><div className="flex flex-wrap gap-2"><button className="btn btn-sm btn-outline" onClick={()=>setRotation((rotation+45)%360)}>Putar 45°</button><button className="btn btn-sm btn-outline" onClick={()=>setEdges(!edges)}>{edges?"Sembunyikan sisi":"Sorot sisi dan titik sudut"}</button></div><p aria-live="polite" className="rounded-lg bg-base-100 p-3">{shapes[shape].facts} Diputar {rotation}°: sifat tetap sama.</p></div>;
 if(index===3)return <div className="space-y-4"><label className="block font-bold">Target susunan<select className="select select-bordered w-full" value={layout} onChange={e=>{setLayout(e.target.value);setAnswer("")}}>{Object.entries(layouts).map(([id,l])=><option key={id} value={id}>{l.name}</option>)}</select></label><Assembly key={layout} layout={layout} value={answer} record={setAnswer}/>{answer.split("|").filter(Boolean).length===layouts[layout].pieces.length&&<p role="status">{correct({task:"assemble",layout,prompt:"",answer:"",explanation:""},answer)?"Tepat! Semua potongan mengisi target.":"Periksa lagi: ada potongan yang belum cocok dengan tempatnya."}</p>}</div>;
 const pieces:Point[][]=cut==="diagonal"?[[[30,30],[170,30],[30,170]],[[170,30],[170,170],[30,170]]]:[[[30,30],[100,30],[100,100],[30,100]],[[100,30],[170,30],[170,100],[100,100]],[[30,100],[100,100],[100,170],[30,170]],[[100,100],[170,100],[170,170],[100,170]]];
 return <div className="space-y-4"><div className="flex flex-wrap gap-2"><button className="btn btn-sm btn-outline" aria-pressed={cut==="diagonal"} onClick={()=>setCut("diagonal")}>Potong diagonal</button><button className="btn btn-sm btn-outline" aria-pressed={cut==="four"} onClick={()=>setCut("four")}>Potong menjadi empat</button><button className="btn btn-sm btn-outline" onClick={()=>setOpen(!open)}>{open?"Satukan kembali":"Pisahkan potongan"}</button></div><svg viewBox="0 0 200 200" className="mx-auto w-full max-w-64" role="img" aria-label={cut==="diagonal"?"2 segitiga siku-siku sama kaki":"4 persegi"}>{pieces.map((p,i)=><polygon key={i} points={pts(p)} transform={open?`translate(${i%2?8:-8} ${cut==="diagonal"?(i?8:-8):(i>1?8:-8)})`:undefined} fill={colours[i]} stroke="#334155" strokeWidth="2"/>)}</svg><p aria-live="polite">{cut==="diagonal"?"2 segitiga siku-siku sama kaki":"4 persegi kecil"}. Semua bagian dapat disatukan kembali menjadi persegi semula.</p></div>;
}
export default function GradeFourGeometry(){
 const [index,setIndex]=useState(0),[mode,setMode]=useState<"lesson"|"practice"|"assessment">("lesson");
 const go=(i:number)=>{setIndex(i);setMode("lesson")};
 return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 4 · Bab 5</p><h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Bangun Datar</h1><p className="mt-3">Amati cirinya, hubungkan sifatnya, lalu susun dan uraikan bentukmu.</p>
 <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2"><div className="grid min-h-36 place-items-center bg-info/10 p-5 font-bold">Video pembelajaran segera hadir</div><div className="p-5"><h2 className="text-xl font-bold">Studio Bangun Datar</h2><p className="mt-2 text-sm">5 materi · 25 latihan · 24 soal evaluasi</p><a className="btn btn-success btn-sm mt-3" href="#geometry-topics">Mulai belajar</a></div></div>
 <div id="geometry-topics" className="mt-6"><nav aria-label="Materi bangun datar" className="mb-4 flex flex-wrap gap-2">{topics.map((t,i)=><button key={t.title} aria-current={index===i?"step":undefined} className={`btn btn-sm h-auto min-h-10 max-w-full whitespace-normal ${index===i?"btn-success":"btn-outline"}`} onClick={()=>go(i)}>{t.title}</button>)}</nav>
 {mode==="lesson"?<><div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2"><div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={index} index={index}/></div><div className="min-w-0 p-5 sm:p-6"><p className="mb-2 text-sm font-bold text-success">{index<3?"A. Ciri-ciri bangun datar":"B. Komposisi dan dekomposisi"}</p><h2 className="text-2xl font-extrabold">{topics[index].title}</h2><ol className="mt-3 list-decimal space-y-3 pl-5">{topics[index].steps.map(s=><li key={s}>{s}</li>)}</ol></div></div><div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-ghost" disabled={index===0} onClick={()=>go(index-1)}>Materi sebelumnya</button><button className="btn btn-outline btn-success" onClick={()=>setMode("practice")}>Latihan materi</button>{index<4&&<button className="btn btn-success" onClick={()=>go(index+1)}>Materi berikutnya</button>}<button className="btn btn-success" onClick={()=>setMode("assessment")}>Evaluasi</button></div></>:<GradeFourQuiz key={`${index}-${mode}`} title={mode==="practice"?`Latihan · ${topics[index].title}`:"Evaluasi Bangun Datar"} questions={mode==="practice"?practice[index]:assessment} practiceMode={mode==="practice"} close={()=>go(index)} checkAnswer={(q,v)=>correct(q,v??"")} isReady={ready} renderVisual={q=><Visual q={q}/>} renderAnswer={(q,v,record,checked)=><Answer key={q.prompt} q={q} value={v} record={record} disabled={checked}/>}
 formatAnswer={(q,v)=>q.task==="sort"||q.task==="match"?v.split("|").map((x,i)=>`${String.fromCharCode(65+i)} → ${q.destinations?.[Number(x)]??"belum diisi"}`).join("; "):v.replaceAll("|",", ")}/>}</div></section>;
}
