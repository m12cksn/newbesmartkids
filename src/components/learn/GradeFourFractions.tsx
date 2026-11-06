"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, decimalLabel, fractionLabel, practice, topics, type Fraction, type FractionQuestion, type FractionShape } from "@/data/grade-four-fractions";

const shapeLabels: Record<FractionShape, string> = { circle: "Lingkaran", bar: "Batang", grid: "Kotak", line: "Garis bilangan" };
const point = (index: number, total: number) => {
  const angle = 2 * Math.PI * index / total - Math.PI / 2;
  return [50 + 46 * Math.cos(angle), 50 + 46 * Math.sin(angle)];
};

function Circle({ total, filled }: { total: number; filled: (index: number) => boolean }) {
  return <svg viewBox="0 0 100 100" className="mx-auto size-24 sm:size-28" aria-hidden="true">
    {total === 1 ? <circle cx="50" cy="50" r="46" fill={filled(0) ? "#0e7490" : "#e0f2fe"} stroke="#164e63"/> :
      Array.from({length: total}, (_, i) => {
        const [x, y] = point(i, total);
        const [nextX, nextY] = point(i + 1, total);
        return <path key={i} d={`M50 50 L${x} ${y} A46 46 0 0 1 ${nextX} ${nextY} Z`}
          fill={filled(i) ? "#0e7490" : "#e0f2fe"} stroke="#164e63" strokeWidth="0.8"/>;
      })}
  </svg>;
}

function FractionModel({ value, shape }: { value: Fraction; shape: FractionShape }) {
  const [n,d] = value;
  return <figure className="min-w-0 space-y-1 rounded-lg bg-base-100 p-2 text-center">
    <div role="img" aria-label={`${n} dari ${d} bagian pada ${shapeLabels[shape].toLowerCase()}`}>
      {shape === "circle" ? <Circle total={d} filled={i => i < n}/> :
      shape === "line" ? <svg viewBox="0 0 220 52" className="mx-auto w-full max-w-64" aria-hidden="true">
        <path d="M12 22H208" stroke="#164e63" strokeWidth="2"/>
        <path d={`M12 22H${12 + 196*n/d}`} stroke="#0891b2" strokeWidth="5"/>
        {Array.from({length:d+1}, (_, i) => <path key={i} d={`M${12+196*i/d} 17v10`} stroke="#164e63"/>)}
        <circle cx={12 + 196*n/d} cy="22" r="5" fill="#0e7490"/>
        <text x="9" y="43" fontSize="12">0</text><text x="205" y="43" fontSize="12">1</text>
      </svg> : <div className={`mx-auto grid w-full max-w-60 gap-px rounded border border-cyan-900 bg-cyan-900 ${shape === "grid" && d === 100 ? "grid-flow-col grid-rows-10" : ""}`}
        style={{gridTemplateColumns: `repeat(${shape === "grid" ? d === 100 ? 10 : 3 : d}, minmax(0,1fr))`}}>
        {Array.from({length:d}, (_, i) => <span key={i} className={`${shape === "grid" ? "aspect-square" : "h-8"} ${i<n ? "bg-cyan-700" : "bg-sky-100"}`}/>)}
      </div>}
    </div>
    <figcaption className="font-bold tabular-nums">{fractionLabel(value)}</figcaption>
  </figure>;
}

function ShadeAnswer({ question, answer, record, checked }: {
  question: FractionQuestion; answer: string; record: (value: string) => void; checked: boolean;
}) {
  const count = question.shade!;
  const selected = answer === "" || answer === "-" ? [] : answer.split(",").map(Number);
  return <div className="space-y-2">
    <p>Ketuk bagian untuk mengarsir atau menghapus arsirannya.</p>
    {question.shape === "circle" && <Circle total={count} filled={i => selected.includes(i)}/>}
    <div className={`grid gap-1 ${count === 100 ? "max-w-80" : "max-w-md"}`}
      style={{gridTemplateColumns: `repeat(${count === 100 ? 10 : Math.min(count,8)}, minmax(0,1fr))`}}>
      {Array.from({length:count}, (_, i) => <button key={i} type="button" aria-label={`Bagian ${i+1}`} aria-pressed={selected.includes(i)}
        className={`min-h-6 rounded border border-cyan-800 text-xs ${selected.includes(i) ? "bg-cyan-700 text-white" : "bg-sky-100 text-slate-900"}`}
        disabled={checked} onClick={() => {
          const next = selected.includes(i) ? selected.filter(value => value !== i) : [...selected,i];
          record(next.join(",") || "-");
        }}>{count === 100 ? <span aria-hidden="true">{selected.includes(i) ? "✓" : ""}</span> : i+1}</button>)}
    </div>
    <p aria-live="polite" className="text-sm font-semibold">{selected.length} dari {count} bagian diarsir</p>
  </div>;
}

function FractionLab({ topic }: { topic: number }) {
  const [shape, setShape] = useState<FractionShape>(topic === 0 ? "circle" : "bar");
  const [denominator, setDenominator] = useState(topic === 0 ? 4 : 6);
  const [numerator, setNumerator] = useState(4);
  const [factor, setFactor] = useState(2);
  const [hundredths, setHundredths] = useState(false);
  const [amount, setAmount] = useState(topic === 4 ? 35 : 4);
  const range = (label: string, value: number, min: number, max: number, change: (value: number) => void) =>
    <label className="block text-sm font-bold">{label} <output>{value}</output>
      <input type="range" className="range range-info range-sm mt-1 w-full" aria-label={label}
        value={value} min={min} max={max} onChange={event => change(Number(event.target.value))}/>
    </label>;

  if (topic < 2) {
    const a: Fraction = topic === 0 ? [1,2] : [2,denominator];
    const b: Fraction = topic === 0 ? [1,denominator] : [Math.min(numerator, denominator),denominator];
    const difference = a[0]*b[1]-b[0]*a[1];
    return <div className="space-y-3">
      <div className="flex flex-wrap gap-2">{(["circle","bar","line"] as const).map(item =>
        <button className={`btn btn-sm ${shape === item ? "btn-info" : "btn-outline"}`} aria-pressed={shape === item} key={item} onClick={() => setShape(item)}>{shapeLabels[item]}</button>)}</div>
      {range(topic === 0 ? "Penyebut kanan" : "Penyebut bersama", denominator, 2, 12, setDenominator)}
      {topic === 1 && range("Pembilang kanan", b[0], 0, denominator, setNumerator)}
      <div className="grid grid-cols-2 gap-2"><FractionModel value={a} shape={shape}/><FractionModel value={b} shape={shape}/></div>
      <p aria-live="polite" className="font-bold">{fractionLabel(a)} {difference < 0 ? "<" : difference > 0 ? ">" : "="} {fractionLabel(b)}</p>
    </div>;
  }
  if (topic === 2) return <div className="space-y-3">
    {range("Faktor pengali", factor, 1, 5, setFactor)}
    <FractionModel value={[2,3]} shape="bar"/>
    <FractionModel value={[2*factor,3*factor]} shape="bar"/>
    <p aria-live="polite" className="font-bold">(2 × {factor}) / (3 × {factor}) = {2*factor}/{3*factor}</p>
  </div>;

  if (topic === 3) {
    const divisor = hundredths ? 100 : 10;
    return <div className="space-y-3">
      <button className="btn btn-sm btn-outline" onClick={() => setHundredths(!hundredths)}>
        {hundredths ? "Tampilkan persepuluhan" : "Tampilkan perseratusan"}
      </button>
      {range("Banyak persepuluhan", amount, 0, 10, setAmount)}
      <FractionModel value={[hundredths ? amount*10 : amount, divisor]} shape={hundredths ? "grid" : "bar"}/>
      <p aria-live="polite" className="font-bold">{amount}/10 = {amount*10}/100 = {decimalLabel(amount,10)} = {decimalLabel(amount*10,100)}</p>
    </div>;
  }
  return <div className="space-y-3">
    {range("Persen", amount, 0, 200, setAmount)}
    <div className="grid grid-cols-2 gap-2">
      <FractionModel value={[Math.min(100,amount),100]} shape="grid"/>
      <FractionModel value={[Math.max(0,amount-100),100]} shape="grid"/>
    </div>
    <p aria-live="polite" className="font-bold">{amount}/100 = {decimalLabel(amount,100)} = {amount}%</p>
  </div>;
}

function checkAnswer(q: FractionQuestion, answer: string | undefined) {
  if (!answer) return false;
  if (q.shade) return String(answer === "-" ? 0 : answer.split(",").length) === q.answer;
  if (q.notation === "decimal") return /^\d+(?:[.,]\d+)?$/.test(answer) && Number(answer.replace(",", ".")) === Number(q.answer.replace(",", "."));
  if (q.notation === "percent") return /^\d+%?$/.test(answer) && Number(answer.replace("%","")) === Number(q.answer.replace("%",""));
  return answer.replaceAll(" ", "") === q.answer.replaceAll(" ", "");
}

export default function GradeFourFractions() {
  const [index,setIndex] = useState(0);
  const [mode,setMode] = useState<"lesson" | "practice" | "assessment">("lesson");
  const topic = topics[index];
  const go = (next: number) => { setIndex(next); setMode("lesson"); };

  return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 4 / Bab 2</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Pecahan</h1>
    <p className="mt-3">Jelajahi bagian dari satu utuh, pecahan senilai, desimal, dan persen.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-36 flex-col items-center justify-center bg-info/10 p-5 text-center">
        <span aria-hidden="true" className="text-3xl font-bold text-info">▶</span>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
      </div>
      <div className="p-5">
        <div className="mb-2 flex flex-wrap gap-2 font-mono font-bold text-info" aria-hidden="true">
          {["1/4","25/100","0,25","25%"].map(value => <span key={value} className="rounded bg-info/10 px-2 py-1">{value}</span>)}
        </div>
        <h2 className="text-xl font-bold">Laboratorium Pecahan</h2>
        <p className="text-sm">Lima submateri, empat latihan per submateri, dan 24 soal evaluasi.</p>
        <a href="#materi-pecahan" className="btn btn-success btn-sm mt-3">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pecahan" className="mt-6">
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Submateri Pecahan">
        {topics.map((item,i) => <button key={item.title} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal ${i === index ? "btn-success" : "btn-outline"}`}
          aria-current={i === index ? "step" : undefined} onClick={() => go(i)}>{String.fromCharCode(65+i)}. {item.title}</button>)}
      </nav>
      {mode === "lesson" ? <>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><FractionLab key={index} topic={index}/></div>
          <div className="p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{topic.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">{topic.steps.map(step => <li key={step}>{step}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{topic.demo}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-ghost" disabled={index === 0} onClick={() => go(index-1)}>← Materi sebelumnya</button>
          <button className="btn btn-outline btn-success" onClick={() => setMode("practice")}>Latihan submateri →</button>
          {index < topics.length-1 ? <button className="btn btn-success" onClick={() => go(index+1)}>Materi berikutnya →</button>
            : <button className="btn btn-success" onClick={() => setMode("assessment")}>Evaluasi Bab 2 →</button>}
        </div>
      </> : <GradeFourQuiz key={`${index}-${mode}`} title={mode === "practice" ? `Latihan · ${topic.title}` : "Evaluasi Bab 2"}
        questions={mode === "practice" ? practice[index] : assessment} practiceMode={mode === "practice"} close={() => go(index)}
        checkAnswer={checkAnswer} formatAnswer={(q,value) => q.shade ? `${value === "-" ? 0 : value.split(",").length} bagian` : value.replaceAll("|", ", ")}
        renderVisual={q => q.models && <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-2 rounded-lg bg-info/10 p-2">
          {q.models.map((value,i) => <FractionModel key={i} value={value} shape={q.shape ?? "bar"}/>)}
        </div>}
        renderAnswer={(q,answer,record,checked) => q.shade ? <ShadeAnswer question={q} answer={answer} record={record} checked={checked}/> :
          <label className="flex flex-wrap items-center gap-2 font-bold">Jawaban
            <input className="input input-bordered w-36" inputMode={q.notation === "decimal" ? "decimal" : q.notation === "fraction" ? "text" : "numeric"}
              value={answer} disabled={checked} maxLength={12} onChange={event => record(event.target.value.replace(/[^\d.,/%]/g,""))}/>
          </label>}/>}
    </div>
  </section>;
}
