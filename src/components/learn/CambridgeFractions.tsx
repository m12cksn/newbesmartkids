"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, correct, fraction, practice, topics } from "@/data/cambridge-fractions";

function Strip({ parts, filled, share = 0 }: { parts: number; filled: number; share?: number }) {
  return <div role="img" aria-label={`${filled} of ${parts} parts shaded${share ? `, ${share} highlighted as one share` : ""}`}
    className="grid h-9 gap-px overflow-hidden rounded-md border border-sky-700 bg-sky-700"
    style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}>
    {Array.from({ length: parts }, (_, i) => <span key={i}
      className={i < share ? "bg-emerald-500" : i < filled ? "bg-sky-300" : "bg-white"}/>)}
  </div>;
}

function FractionLab({ topic }: { topic: number }) {
  const [count, setCount] = useState(2);
  const [reveal, setReveal] = useState(false);
  const [subtract, setSubtract] = useState(false);
  return <div className="space-y-4">
    <p className="font-extrabold">{["3/4 and 1/6", "One whole = 24", "3/5 in each group", "3/4 shared equally"][topic]}</p>
    {topic === 0 ? <>
      <button className="btn btn-sm btn-outline" onClick={() => setReveal(!reveal)}>{reveal ? "Show original fractions" : "Show common denominator"}</button>
      <button className="btn btn-sm btn-outline ms-2" onClick={() => setSubtract(!subtract)}>{subtract ? "Switch to addition" : "Switch to subtraction"}</button>
      <Strip parts={reveal ? 12 : 4} filled={reveal ? 9 : 3}/>
      <Strip parts={reveal ? 12 : 6} filled={reveal ? 2 : 1}/>
      <p aria-live="polite">{reveal ? `9/12 ${subtract ? "−" : "+"} 2/12 = ${subtract ? 7 : 11}/12` : "The strips represent the same-sized whole."}</p>
    </> : <>
      <label className="block font-bold">{["", "Groups taken (out of 4 per whole)", "Number of groups", "Number of equal shares"][topic]}: {count}
        <input className="range range-info w-full" type="range" min={topic === 3 ? 2 : 1} max={6} value={count} onChange={e => setCount(Number(e.target.value))}/>
      </label>
      {topic === 1 && <>
        <Strip parts={4} filled={Math.min(4, count)}/>
        {count > 4 && <Strip parts={4} filled={count - 4}/>}
        <p aria-live="polite">{count}/4 of 24 = {count} × 6 = {count * 6}</p>
      </>}
      {topic === 2 && <>
        {Array.from({length: count}, (_, i) => <Strip key={i} parts={5} filled={3}/>)}
        <p aria-live="polite">3/5 × {count} = {fraction(3 * count, 5)}</p>
      </>}
      {topic === 3 && <>
        <Strip parts={4 * count} filled={3 * count} share={3}/>
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

  return <section lang="en" className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Cambridge Curriculum · Grade 6</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Calculation with Fractions</h1>
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
        {topics.map((t, i) => <button key={t.title} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === index ? "btn-success" : "btn-outline"}`}
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
