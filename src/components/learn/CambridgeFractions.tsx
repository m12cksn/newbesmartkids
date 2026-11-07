"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, correct, fraction, practice, topics } from "@/data/cambridge-fractions";

const modelNames = ["Bar", "Circle", "Grid"] as const;
type Model = typeof modelNames[number];

function FractionModel({ parts, filled, share = 0, model }: {
  parts: number; filled: number; share?: number; model: Model;
}) {
  const label = `${filled} of ${parts} parts shaded${share ? `, ${share} highlighted as one share` : ""}`;
  const colour = (i: number) => i < share ? "#10b981" : i < filled ? "#7dd3fc" : "#fff";
  if (model === "Circle") {
    const point = (i: number) => {
      const angle = 2 * Math.PI * i / parts - Math.PI / 2;
      return `${50 + 47 * Math.cos(angle)} ${50 + 47 * Math.sin(angle)}`;
    };
    return <svg viewBox="0 0 100 100" className="mx-auto w-24" role="img" aria-label={label}>
      {Array.from({ length: parts }, (_, i) => <path key={i} fill={colour(i)} stroke="#0369a1" strokeWidth="0.8"
        d={`M50 50 L${point(i)} A47 47 0 0 1 ${point(i + 1)} Z`}/>)}
    </svg>;
  }
  let columns = parts;
  if (model === "Grid") {
    for (let n = Math.floor(Math.sqrt(parts)); n > 1; n--) {
      if (parts % n === 0) { columns = parts / n; break; }
    }
  }
  return <div role="img" aria-label={label}
    className={`grid gap-px overflow-hidden rounded-md border border-sky-700 bg-sky-700 ${model === "Bar" ? "h-9" : "mx-auto h-24 w-32"}`}
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${parts / columns}, minmax(0, 1fr))` }}>
    {Array.from({ length: parts }, (_, i) => <span key={i} style={{ backgroundColor: colour(i) }}/>)}
  </div>;
}

function FractionLab({ topic }: { topic: number }) {
  const [model, setModel] = useState<Model>("Bar");
  const [example, setExample] = useState(0);
  const [count, setCount] = useState(2);
  const [reveal, setReveal] = useState(false);
  const [subtract, setSubtract] = useState(false);
  const [a, b, c, d, denominator] = [[3, 4, 1, 6, 12], [2, 3, 1, 4, 12], [3, 5, 1, 2, 10]][example];
  const left = a * denominator / b;
  const right = c * denominator / d;
  const result = left + (subtract ? -right : right);
  const symbol = subtract ? "−" : "+";
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2" role="group" aria-label="Fraction model">
      {modelNames.map(name => <button key={name} className="btn btn-sm btn-outline"
        aria-pressed={model === name} onClick={() => setModel(name)}>{name}</button>)}
    </div>
    <p className="font-extrabold">{[`${a}/${b} ${symbol} ${c}/${d}`, "One whole = 24", "3/5 in each group", "3/4 shared equally"][topic]}</p>
    {topic === 0 ? <>
      <label className="block font-bold">Choose fractions
        <select className="select select-bordered mt-1 block max-w-full" value={example}
          onChange={e => { setExample(Number(e.target.value)); setReveal(false); }}>
          <option value={0}>3/4 and 1/6</option><option value={1}>2/3 and 1/4</option><option value={2}>3/5 and 1/2</option>
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-sm btn-outline h-auto min-h-8 max-w-full whitespace-normal" onClick={() => setReveal(!reveal)}>{reveal ? "Show original fractions" : "Show common denominator"}</button>
        <button className="btn btn-sm btn-outline" onClick={() => setSubtract(!subtract)}>{subtract ? "Switch to addition" : "Switch to subtraction"}</button>
      </div>
      <p className="text-sm font-semibold">{a}/{b}{reveal && ` = ${left}/${denominator}`}</p>
      <FractionModel model={model} parts={reveal ? denominator : b} filled={reveal ? left : a}/>
      <p className="text-sm font-semibold">{c}/{d}{reveal && ` = ${right}/${denominator}`}</p>
      <FractionModel model={model} parts={reveal ? denominator : d} filled={reveal ? right : c}/>
      <div aria-live="polite" className="space-y-2">
        {reveal ? <>
          <p>The shaded amounts stay the same. Now every piece is 1/{denominator} of the whole, so you can {subtract ? "subtract" : "add"} the number of pieces.</p>
          <p className="font-bold">{left}/{denominator} {symbol} {right}/{denominator} = {result}/{denominator}</p>
          <div className="space-y-2">
            <FractionModel model={model} parts={denominator} filled={Math.min(result, denominator)}/>
            {result > denominator && <FractionModel model={model} parts={denominator} filled={result - denominator}/>}
          </div>
        </> : <p>Both wholes are the same size, but a 1/{b} piece and a 1/{d} piece are different sizes. Can you count them as the same kind of piece? Repartition both wholes to find out.</p>}
      </div>
    </> : <>
      <label className="block font-bold">{["", "Groups taken (out of 4 per whole)", "Number of groups", "Number of equal shares"][topic]}: {count}
        <input className="range range-info w-full" type="range" min={topic === 3 ? 2 : 1} max={6} value={count} onChange={e => setCount(Number(e.target.value))}/>
      </label>
      {topic === 1 && <>
        <FractionModel model={model} parts={4} filled={Math.min(4, count)}/>
        {count > 4 && <FractionModel model={model} parts={4} filled={count - 4}/>}
        <p aria-live="polite">{count}/4 of 24 = {count} × 6 = {count * 6}</p>
      </>}
      {topic === 2 && <>
        {Array.from({length: count}, (_, i) => <FractionModel model={model} key={i} parts={5} filled={3}/>)}
        <p aria-live="polite">3/5 × {count} = {fraction(3 * count, 5)}</p>
      </>}
      {topic === 3 && <>
        <FractionModel model={model} parts={4 * count} filled={3 * count} share={3}/>
        <p aria-live="polite">One share (green): 3/4 ÷ {count} = {fraction(3, 4 * count)}</p>
      </>}
    </>}
  </div>;
}

export default function CambridgeFractions() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"lesson" | "practice" | "assessment">("lesson");
  const topic = topics[index];
  function go(next: number) { setIndex(next); setMode("lesson"); }

  return <section lang="en" className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Cambridge Curriculum · Grade 6</p>
    <h1 className="mt-2 break-words text-3xl font-extrabold sm:text-5xl">Calculation with Fractions</h1>
    <p className="mt-3">Estimate, model and calculate with fractions.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="grid min-h-36 place-items-center bg-info/10 p-5 font-bold">Video lesson coming soon</div>
      <div className="p-5">
        <p aria-hidden="true" className="mb-2 font-bold text-info">½ · + · − · × · ÷</p>
        <h2 className="text-xl font-bold">Fraction Lab</h2>
        <p className="text-sm">Four topics, 16 practice questions and a 24-question assessment.</p>
        <a href="#fraction-topics" className="btn btn-success btn-sm mt-3">Start learning</a>
      </div>
    </div>
    <div id="fraction-topics" className="mt-6">
      <nav aria-label="Fraction topics" className="mb-4 flex flex-wrap gap-2">
        {topics.map((t, i) => <button key={t.title} className={`btn btn-sm h-auto min-h-9 min-w-0 max-w-full whitespace-normal ${i === index ? "btn-success" : "btn-outline"}`}
          aria-current={i === index ? "step" : undefined} onClick={() => go(i)}>{t.title}</button>)}
      </nav>
      {mode === "lesson" ? <>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><FractionLab key={index} topic={index}/></div>
          <div className="p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{topic.title}</h2>
            <ol className="mt-3 list-decimal space-y-3 pl-5">{topic.steps.map(step => <li key={step}>{step}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm">{topic.demo}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-ghost" disabled={index === 0} onClick={() => go(index - 1)}>Previous topic</button>
          <button className="btn btn-outline btn-success" onClick={() => setMode("practice")}>Practise this topic</button>
          {index < topics.length - 1 && <button className="btn btn-success" onClick={() => go(index + 1)}>Next topic</button>}
          <button className="btn btn-success" onClick={() => setMode("assessment")}>Assessment</button>
        </div>
      </> : <GradeFourQuiz key={`${index}-${mode}`} english
        title={mode === "practice" ? "Let’s Practise" : "Assessment"}
        questions={mode === "practice" ? practice[index] : assessment} practiceMode={mode === "practice"}
        close={() => go(index)} checkAnswer={(q, answer) => correct(q, answer ?? "")}
        renderAnswer={(_, answer, record, checked) => <label className="block font-bold">Answer
          <input className="input input-bordered mt-1 block w-full max-w-xs" value={answer} maxLength={25} onChange={e => record(e.target.value)}
            disabled={checked} placeholder="e.g. 3/4 or 1 1/2"/>
        </label>}/>}
    </div>
  </section>;
}
