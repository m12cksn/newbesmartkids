"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, practice, ready, correct, totalCells, type MeasurementQuestion } from "@/data/grade-four-measurement";

const topics = [
  { title: "Luas · Satuan Tidak Baku", intro: "Luas adalah ukuran permukaan. Kita bisa mengukurnya dengan petak atau potongan kertas yang sama besar.",
    steps: ["Tutupi daerah tanpa celah atau tumpang tindih.", "Hitung petaknya. Untuk persegi panjang, kalikan banyak kolom dengan banyak baris.", "Jika petaknya lebih kecil, permukaan yang sama memerlukan lebih banyak petak."],
    remember: "Bandingkan luas dua daerah memakai petak dengan ukuran yang sama.", demo: "Ubah baris dan kolom, lalu ketuk petak untuk menutup daerah." },
  { title: "Luas · Satuan Baku", intro: "Satuan baku punya ukuran tetap. Satu petak 1 cm × 1 cm mewakili 1 cm².",
    steps: ["Gunakan cm² untuk permukaan kecil dan m² untuk permukaan besar.", "Kalikan panjang dan lebar yang sudah dinyatakan dalam satuan yang sama.", "Karena 1 m = 100 cm, maka 1 m² = 100 cm × 100 cm = 10.000 cm²."],
    remember: "cm dan m mengukur panjang. cm² dan m² mengukur luas.", demo: "Ubah banyak petak berukuran 1 cm², lalu amati perubahan luasnya." },
  { title: "Volume · Satuan Tidak Baku", intro: "Isi wadah bisa diukur dengan menghitung berapa kali takaran seperti cangkir dituangkan.",
    steps: ["Gunakan satu jenis cangkir untuk setiap pengukuran.", "Tuang satu takaran penuh setiap kali, lalu hitung jumlah tuangannya.", "Cangkir yang lebih kecil perlu lebih banyak tuangan untuk memenuhi wadah yang sama."],
    remember: "Jumlah cangkir hanya bisa langsung dibandingkan jika ukuran cangkirnya sama.", demo: "Penuhi wadah dengan cangkir besar. Kosongkan, lalu ulangi dengan cangkir kecil." },
  { title: "Volume · Satuan Baku", intro: "Liter (L) dan mililiter (mL) mengukur volume cairan. Kubus satuan membantu mengukur volume benda pejal.",
    steps: ["1 L = 1.000 mL. Bagi angka dalam mL dengan 1.000 untuk mengubahnya ke L.", "Samakan satuan sebelum menjumlahkan atau mengurangi.", "Kubus dengan rusuk 1 cm volumenya 1 cm³. Kubus dengan rusuk 1 m volumenya 1 m³. 1 cm³ = 1 mL dan 1 m³ = 1.000 L."],
    remember: "Baca skala gelas ukur sejajar dengan permukaan cairan.", demo: "Tuang cairan dan baca skalanya. Buka peraga kubus satuan untuk menghitung volume dari jumlah lapisan." },
];

function CupLab() {
  const [small, setSmall] = useState(false);
  const [pours, setPours] = useState(0);
  const capacity = small ? 8 : 4;
  return <div className="space-y-3">
    <label className="block font-bold">Ukuran cangkir
      <select className="select select-bordered mt-1 block" value={small ? "small" : "large"} onChange={e => { setSmall(e.target.value === "small"); setPours(0); }}>
        <option value="large">Cangkir besar</option><option value="small">Cangkir kecil</option>
      </select>
    </label>
    <svg viewBox="0 0 120 130" className="mx-auto w-32" role="img" aria-label={`Wadah berisi ${pours} dari ${capacity} takaran`}>
      <path d="M20 12h80v107H20Z" fill="#f0f9ff" stroke="#075985" strokeWidth="3"/>
      <rect x="22" y={117 - 102 * pours / capacity} width="76" height={102 * pours / capacity} fill="#38bdf8"/>
    </svg>
    <p aria-live="polite">{pours} takaran dituang.{pours === capacity && " Wadah penuh!"}</p>
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-info btn-sm" disabled={pours === capacity} onClick={() => setPours(n => n + 1)}>Tuang satu cangkir</button>
      <button className="btn btn-outline btn-sm" onClick={() => setPours(0)}>Kosongkan wadah</button>
    </div>
  </div>;
}

function Grid({ rows, value = "", onChange, disabled }: {
  rows: number[]; value?: string; onChange?: (value: string) => void; disabled?: boolean;
}) {
  const cols = Math.max(...rows);
  const selected = value ? value.split("|").map(Number) : [];
  return <div className="mx-auto grid w-full max-w-xs gap-px rounded-lg border border-base-300 bg-base-300 p-1"
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="group" aria-label="Kisi luas">
    {rows.flatMap((width, row) => Array.from({ length: cols }, (_, col) => {
      const id = row * cols + col;
      const inside = col < width;
      const marked = selected.includes(id);
      const style = `grid aspect-square min-w-0 place-items-center rounded-sm text-xs font-bold ${marked ? "bg-success text-success-content" : inside ? "bg-sky-200 text-sky-950" : "bg-base-100"}`;
      return onChange
        ? <button type="button" className={style} data-region={inside ? "inside" : "outside"} key={id} disabled={disabled}
            aria-label={`Petak baris ${row + 1} kolom ${col + 1}, ${inside ? "di dalam daerah" : "di luar daerah"}`} aria-pressed={marked}
            onClick={() => onChange((marked ? selected.filter(cell => cell !== id) : [...selected, id]).join("|"))}>{marked ? "✓" : ""}</button>
        : <span key={id} className={style} data-region={inside ? "inside" : "outside"} aria-label={inside ? "Petak daerah berwarna" : "Petak luar"}/>;
    }))}
  </div>;
}

function AreaLab({ standard = false }: { standard?: boolean }) {
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(3);
  const [value, setValue] = useState("");
  const count = value ? value.split("|").length : 0;
  const rows = Array<number>(height).fill(width);
  return <div className="space-y-3">
    <label className="block">Kolom: {width}<input className="range range-info w-full" type="range" min={2} max={7} value={width} aria-label="Kolom" onChange={e => { setWidth(+e.target.value); setValue(""); }}/></label>
    <label className="block">Baris: {height}<input className="range range-info w-full" type="range" min={2} max={6} value={height} aria-label="Baris" onChange={e => { setHeight(+e.target.value); setValue(""); }}/></label>
    <Grid rows={rows} value={value} onChange={setValue}/>
    <p aria-live="polite">{count} petak dipilih. Luas daerah: {width} × {height} = {totalCells(rows)} {standard ? "cm²" : "petak satuan"}.</p>
    {correct({ ...practice[0][0], rows }, value) && <p className="font-bold text-success">Daerah tertutup tepat!</p>}
    <button className="btn btn-outline btn-sm" onClick={() => setValue("")}>Kosongkan kisi</button>
  </div>;
}

function CubeLayers({ dimensions }: { dimensions: [number, number, number] }) {
  const [length, width, layers] = dimensions;
  return <div className="flex flex-wrap justify-center gap-2">
    {Array.from({ length: layers }, (_, layer) => <figure key={layer} className="rounded-lg border border-base-300 bg-base-100 p-2">
      <figcaption className="text-center text-xs font-bold">Lapisan {layer + 1}</figcaption>
      <svg viewBox={`0 0 ${(length + width) * 14 + 2} ${(length + width) * 7 + 18}`} className="mx-auto h-20 max-w-full"
        role="img" aria-label={`Lapisan ${layer + 1}, ${length} kolom dan ${width} baris kubus`}>
        {Array.from({ length: width }, (_, row) => Array.from({ length }, (_, col) => {
          const x = (width + col - row) * 14 + 1;
          const y = (row + col) * 7 + 1;
          return <g key={`${row}-${col}`} transform={`translate(${x} ${y})`} stroke="#075985" strokeWidth="0.7">
            <path d="M-14 7 0 14V28L-14 21Z" fill="#38bdf8"/>
            <path d="M0 14 14 7V21L0 28Z" fill="#0284c7"/>
            <path d="M0 0 14 7 0 14-14 7Z" fill="#bae6fd"/>
          </g>;
        }))}
      </svg>
    </figure>)}
  </div>;
}

function CubeLab() {
  const [layers, setLayers] = useState(1);
  return <div className="space-y-3">
    <CubeLayers dimensions={[3, 2, layers]}/>
    <label className="block font-bold">Banyak lapisan: {layers}
      <input aria-label="Banyak lapisan" className="range range-info w-full" type="range" min={1} max={4} value={layers} onChange={e => setLayers(+e.target.value)}/>
    </label>
    <p aria-live="polite">3 × 2 × {layers} = {6 * layers} cm³.</p>
  </div>;
}

function VolumeLab() {
  const [showCubes, setShowCubes] = useState(false);
  const [size, setSize] = useState(250);
  const [amount, setAmount] = useState(0);
  const [pours, setPours] = useState(0);
  return <div className="space-y-3">
    <button className="btn btn-outline btn-sm" onClick={() => setShowCubes(!showCubes)}>{showCubes ? "Peraga cairan" : "Peraga kubus satuan"}</button>
    {showCubes ? <CubeLab/> : <>
    <label className="flex flex-wrap items-center gap-2 font-semibold">Ukuran takaran
      <select className="select select-bordered" value={size} onChange={e => { setSize(+e.target.value); setAmount(0); setPours(0); }}>
        {[100, 200, 250, 500].map(ml => <option key={ml} value={ml}>{ml} mL</option>)}
      </select>
    </label>
    <svg viewBox="0 0 220 180" role="img" aria-label={`Gelas ukur berisi ${amount} mL`} className="mx-auto w-full max-w-56">
      <path d="M49 20h100v134q0 9-9 9H58q-9 0-9-9Z" fill="#f0f9ff" stroke="#075985" strokeWidth="3"/>
      <rect x="51" y={160 - amount * .12} width="96" height={amount * .12} fill="#38bdf8"/>
      {[0, 250, 500, 750, 1000].map(ml => <g key={ml}><path d={`M120 ${160 - ml * .12}h27`} stroke="#075985" strokeWidth="2"/><text x="154" y={164 - ml * .12} fill="#075985" fontSize="12">{ml} mL</text></g>)}
    </svg>
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-info btn-sm" disabled={amount + size > 1000} onClick={() => { setAmount(amount + size); setPours(pours + 1); }}>Tuang satu takaran</button>
      <button className="btn btn-outline btn-sm" onClick={() => { setAmount(0); setPours(0); }}>Kosongkan wadah</button>
    </div>
    <p aria-live="polite">{pours} × {size} mL = {amount} mL = {String(amount / 1000).replace(".", ",")} L.</p>
    {amount === 1000 && <p className="font-bold text-success">Wadah penuh. Kapasitasnya 1 L.</p>}
    </>}
  </div>;
}

function VolumeQuestionVisual({ q }: { q: MeasurementQuestion }) {
  if (q.prompt.includes("5 cangkir")) {
    return <div className="mx-auto flex max-w-xs justify-between gap-1" role="img" aria-label="Lima takaran cangkir, tiga sudah dituang">
      {Array.from({ length: 5 }, (_, i) => <svg key={i} viewBox="0 0 50 42" className="w-1/5 min-w-0" aria-hidden="true">
        <path d="M32 12h6a7 7 0 0 1 0 14h-6" fill="none" stroke="#075985" strokeWidth="2"/>
        <path d="M6 7h29l-4 26H10Z" fill={i < 3 ? "#7dd3fc" : "#f0f9ff"} stroke="#075985" strokeWidth="2"/>
      </svg>)}
    </div>;
  }
  const readings = [...q.prompt.matchAll(/(\d[\d.]* L(?: \d[\d.]* mL)?|\d[\d.]* mL)/g)]
    .map(([label]) => {
      const units = [...label.matchAll(/([\d.]+) (mL|L)/g)];
      const amount = units.reduce((sum, [, digits, unit]) => sum + Number(digits.replaceAll(".", "")) * (unit === "L" ? 1000 : 1), 0);
      return { label, amount };
    });
  if (!readings.length) return null;
  const capacity = Math.ceil(Math.max(...readings.map(item => item.amount)) / 250) * 250;
  return <div className="flex flex-wrap justify-center gap-3 rounded-lg bg-info/5 p-2">
    {readings.map(({ label, amount }, index) => {
      const level = 58 * amount / capacity;
      return <figure key={index} className="min-w-0 flex-1 basis-16 max-w-32 text-center">
        <svg viewBox="0 0 70 76" className="mx-auto h-20" role="img" aria-label={`Gelas ukur berisi ${label}`}>
          <path d="M14 6h40v62H14Z" fill="#f0f9ff" stroke="#075985" strokeWidth="2"/>
          <rect x="15" y={67 - level} width="38" height={level} fill="#7dd3fc"/>
          {[19, 31, 43, 55].map(y => <path key={y} d={`M44 ${y}h10`} stroke="#075985" strokeWidth="2"/>)}
        </svg>
        <figcaption className="text-xs font-semibold">{label}</figcaption>
      </figure>;
    })}
  </div>;
}

function Answer({ q, answer, record, checked }: { q: MeasurementQuestion; answer: string; record: (s: string) => void; checked: boolean }) {
  if (q.action === "tiles") return <Grid rows={q.rows!} value={answer} onChange={record} disabled={checked}/>;
  return <label className="flex flex-wrap items-center gap-2 font-bold">Jawaban
    <input className="input input-bordered w-36" inputMode={q.action === "decimal" ? "decimal" : "numeric"}
      value={answer} disabled={checked} onChange={e => record(e.target.value.replace(q.action === "decimal" ? /[^\d,.]/g : /[^\d]/g, ""))}/>{q.unit}
  </label>;
}

export default function GradeFourMeasurement() {
  const [index,setIndex]=useState(0);
  const [mode,setMode]=useState<"lesson"|"practice"|"assessment">("lesson");
  const topic=topics[index];
  const go=(i:number)=>{setIndex(i);setMode("lesson");};
  return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 4 / Bab 4</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Pengukuran Luas &amp; Volume</h1>
    <p className="mt-3">Ukur permukaan dengan petak dan ukur isi wadah dengan takaran.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-36 flex-col items-center justify-center bg-info/10 p-5 text-center"><span aria-hidden="true" className="text-3xl font-bold text-info">▶</span><p className="mt-2 font-bold">Video pembelajaran segera hadir</p></div>
      <div className="p-5"><p aria-hidden="true" className="mb-2 font-bold text-info">cm² · m² · mL · L</p><h2 className="text-xl font-bold">Laboratorium Pengukuran</h2><p className="text-sm">Empat submateri, 13 latihan, dan 24 soal evaluasi.</p><a href="#materi-pengukuran" className="btn btn-success btn-sm mt-3">Mulai belajar</a></div>
    </div>
    <div id="materi-pengukuran" className="mt-6">
      <nav aria-label="Submateri pengukuran" className="mb-4 flex flex-wrap gap-2">{topics.map((t,i)=><button key={t.title} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i===index?"btn-success":"btn-outline"}`} aria-current={i===index?"step":undefined} onClick={()=>go(i)}>{String.fromCharCode(65+i)}. {t.title}</button>)}</nav>
      {mode==="lesson"?<>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2"><div className="min-w-0 bg-info/5 p-4 sm:p-6">{index < 2 ? <AreaLab key={index} standard={index === 1}/> : index === 2 ? <CupLab/> : <VolumeLab/>}</div><div className="p-5 sm:p-6"><h2 className="text-2xl font-extrabold">{topic.title}</h2><p className="mt-3 leading-relaxed">{topic.intro}</p><ol className="mt-3 list-decimal space-y-3 pl-5 leading-relaxed">{topic.steps.map(s=><li key={s}>{s}</li>)}</ol><p className="mt-4 rounded-lg bg-warning/15 p-3 text-sm"><strong>Ingat. </strong>{topic.remember}</p><p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{topic.demo}</p></div></div>
        <div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-ghost" disabled={index===0} onClick={()=>go(index-1)}>← Materi sebelumnya</button><button className="btn btn-outline btn-success" onClick={()=>setMode("practice")}>Latihan submateri →</button>{index<topics.length-1?<button className="btn btn-success" onClick={()=>go(index+1)}>Materi berikutnya →</button>:<button className="btn btn-success" onClick={()=>setMode("assessment")}>Evaluasi Bab 4 →</button>}</div>
      </>:<GradeFourQuiz key={`${index}-${mode}`} title={mode==="practice"?`Latihan · ${topic.title}`:"Evaluasi Bab 4"} questions={mode==="practice"?practice[index]:assessment} practiceMode={mode==="practice"} close={()=>go(index)} isReady={ready} checkAnswer={correct} formatAnswer={(q, answer) => q.action === "tiles" ? `${answer.split("|").length} petak dipilih` : answer.replaceAll("|", ", ")} renderVisual={q => q.cubes ? <CubeLayers dimensions={q.cubes}/> : q.rows ? q.action !== "tiles" && <><Grid rows={q.rows}/>{q.unit && q.unit !== "petak satuan" && <p className="text-center text-sm">Setiap petak mewakili 1 {q.unit}.</p>}</> : q.source >= 4 && <VolumeQuestionVisual q={q}/>} renderAnswer={(q,answer,record,checked)=><Answer q={q} answer={answer} record={record} checked={checked}/>}/>}
    </div>
  </section>;
}
