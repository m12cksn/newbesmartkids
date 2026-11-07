"use client";

import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, correct, practice, topics } from "@/data/cambridge-ratio";

function RatioTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return <table className="table table-sm w-full rounded-lg bg-base-100">
    <thead><tr>{head.map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
    <tbody>{rows.map(([a,b], i) => <tr key={i}><td>{a}</td><td>{b}</td></tr>)}</tbody>
  </table>;
}

function Tape({ quantities, labels }: { quantities: [number, number]; labels: [string, string] }) {
  return <div className="space-y-2">
    {quantities.map((count, row) => <div key={row}>
      <p className="mb-1 text-sm font-semibold">{labels[row]}</p>
      <div className="flex flex-wrap gap-1" role="img" aria-label={`${labels[row]}: ${count} equal parts`}>
        {Array.from({length: count}, (_, i) => <span aria-hidden="true" key={i}
          className={`size-5 rounded border ${row ? "border-sky-700 bg-sky-300" : "border-amber-700 bg-amber-300"}`}/>)}
      </div>
    </div>)}
  </div>;
}

function RatioLab({ topic }: { topic: number }) {
  const [factor, setFactor] = useState(2);
  const [grouped, setGrouped] = useState(true);
  const [recipe, setRecipe] = useState(false);
  const label = topic === 0 ? "Scale factor" : "Number of batches";
  return <div className="space-y-4">
    {topic === 1 && <button className="btn btn-outline btn-sm" onClick={() => setRecipe(!recipe)}>
      {recipe ? "Switch to drink mix" : "Switch to recipe"}
    </button>}
    <label className="block font-bold">{label}: {factor}
      <input className="range range-info w-full" type="range" min={1} max={6} value={factor} onChange={e => setFactor(Number(e.target.value))}/>
    </label>
    {topic === 0 ? <>
      <button className="btn btn-outline btn-sm" onClick={() => setGrouped(!grouped)}>{grouped ? "Show individual counters" : "Group equal sets"}</button>
      {grouped ? <div className="grid grid-cols-2 gap-2">
        {Array.from({length:factor},(_,i) => <div key={i} className="rounded border border-base-300 bg-base-100 p-2">
          <p className="text-xs">Set {i+1}</p><Tape quantities={[2,3]} labels={["Yellow","Blue"]}/>
        </div>)}
      </div> : <Tape quantities={[2*factor,3*factor]} labels={["Yellow","Blue"]}/>}
      <p aria-live="polite">2 : 3 = {2*factor} : {3*factor}. Both terms are multiplied by {factor}.</p>
    </> : <>
      <RatioTable head={recipe ? ["People","Flour (g)"] : ["Syrup (L)","Water (L)"]}
        rows={recipe ? [["3","90"],[String(3*factor),String(90*factor)]] : [["1","4"],[String(factor),String(4*factor)]]}/>
      <p aria-live="polite">{recipe ? `${3*factor} people need ${90*factor} g of flour.` : `${factor} L of syrup needs ${4*factor} L of water.`} Both amounts scale by {factor}.</p>
    </>}
  </div>;
}

function RatioAnswer({ ratio, answer, record, checked }: { ratio: boolean; answer: string; record: (s:string)=>void; checked:boolean }) {
  if (!ratio) return <label className="block font-bold">Answer
    <input inputMode="decimal" className="input input-bordered mt-1 block max-w-full" value={answer} maxLength={12}
      onChange={e=>record(e.target.value)} disabled={checked}/>
  </label>;
  const [first="",second=""]=answer.split(":");
  return <div className="flex flex-wrap items-end gap-2">
    <label className="block text-sm font-bold">First term<input inputMode="numeric" className="input input-bordered block w-24"
      value={first} disabled={checked} maxLength={5} onChange={e=>record(e.target.value.replace(/\D/g,"")+":"+second)}/></label>
    <span aria-hidden="true" className="pb-2">:</span>
    <label className="block text-sm font-bold">Second term<input inputMode="numeric" className="input input-bordered block w-24"
      value={second} disabled={checked} maxLength={5} onChange={e=>record(first+":"+e.target.value.replace(/\D/g,""))}/></label>
  </div>;
}

export default function CambridgeRatio() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"lesson" | "practice" | "assessment">("lesson");
  const topic = topics[index];
  function go(next: number) { setIndex(next); setMode("lesson"); }

  return <section lang="en" className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Cambridge Curriculum · Grade 6</p>
    <h1 className="mt-2 break-words text-3xl font-extrabold sm:text-5xl">Ratio and Proportion</h1>
    <p className="mt-3">Explore equivalent ratios and solve problems in direct proportion.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="grid min-h-36 place-items-center bg-info/10 p-5 font-bold">Video lesson coming soon</div>
      <div className="p-5">
        <p aria-hidden="true" className="mb-2 font-bold text-info">2 : 3 = 4 : 6</p>
        <h2 className="text-xl font-bold">Ratio Lab</h2>
        <p className="text-sm">Two topics, 10 practice questions and a 24-question assessment.</p>
        <a href="#ratio-topics" className="btn btn-success btn-sm mt-3">Start learning</a>
      </div>
    </div>
    <div id="ratio-topics" className="mt-6">
      <nav aria-label="Ratio topics" className="mb-4 flex flex-wrap gap-2">
        {topics.map((t, i) => <button key={t.title} className={`btn btn-sm h-auto min-h-9 min-w-0 max-w-full whitespace-normal ${i === index ? "btn-success" : "btn-outline"}`}
          aria-current={i === index ? "step" : undefined} onClick={() => go(i)}>{t.title}</button>)}
      </nav>
      {mode === "lesson" ? <>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><RatioLab key={index} topic={index}/></div>
          <div className="p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{topic.title}</h2>
            <ol className="mt-3 list-decimal space-y-3 pl-5">{topic.steps.map(step => <li key={step}>{step}</li>)}</ol>
            
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
        isReady={(q, value) => !q.options && q.answer.includes(":") ? /^\d+:\d+$/.test(value) : Boolean(value.trim())}
        renderVisual={q => q.visual && ("tape" in q.visual
          ? <Tape quantities={q.visual.tape} labels={q.visual.labels}/>
          : <RatioTable head={q.visual.head} rows={q.visual.rows}/>)}
        renderAnswer={(q, answer, record, checked) => <RatioAnswer ratio={q.answer.includes(":")}
          answer={answer} record={record} checked={checked}/>}/>}
    </div>
  </section>;
}
