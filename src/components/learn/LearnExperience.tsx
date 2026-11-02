"use client";

import Link from "next/link";
import { useState } from "react";
import type { LearnStep } from "@/data/learn-lessons";
import type { Question } from "@/data/questions";
import { PracticeExperience } from "@/components/practice/PracticeExperience";

function Tokens({ joined }: { joined: boolean }) {
  return <div className={`flex min-h-28 items-center justify-center gap-4 rounded-box border border-success/15 bg-base-100 p-5 transition-all duration-500 ${joined ? "flex-wrap" : "flex-col sm:flex-row"}`}><div className="flex gap-2">{[1, 2, 3].map((token) => <span key={token} className="grid size-10 place-items-center rounded-full bg-success shadow-sm transition-transform duration-500 sm:size-12"> </span>)}</div><span className="text-2xl font-bold text-base-content/40">+</span><div className="flex gap-2">{[1, 2].map((token) => <span key={token} className="grid size-10 place-items-center rounded-full bg-warning shadow-sm transition-transform duration-500 sm:size-12"> </span>)}</div></div>;
}

function CountingVisual({ counted }: { counted: boolean }) {
  return <div className="flex flex-wrap justify-center gap-3 rounded-box border border-success/15 bg-base-100 p-8">{[1, 2, 3, 4, 5].map((item) => <span key={item} className={`grid size-12 place-items-center rounded-full bg-success text-lg font-bold text-success-content shadow-sm transition duration-300 ${counted ? "translate-y-[-4px]" : ""}`}>{item}</span>)}</div>;
}

export function LearnExperience({ steps, materialTitle, questions = [] }: { steps: LearnStep[]; materialTitle: string; questions?: Question[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [activated, setActivated] = useState(false);
  const [phase, setPhase] = useState<"learn" | "practice">("learn");
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  if (phase === "practice") {
    return <div className="min-h-[calc(100dvh-8rem)]"><div className="mb-4 flex items-center justify-between gap-4"><button type="button" className="btn btn-ghost btn-sm px-0" onClick={() => setPhase("learn")}>&lt;- Kembali ke pembelajaran</button><span className="text-xs font-semibold uppercase tracking-wider text-success">Sekarang waktunya mencoba</span></div><PracticeExperience questions={questions} title={materialTitle} /></div>;
  }

  function next() {
    if (isLast) return;
    setStepIndex((value) => value + 1);
    setActivated(false);
  }

  return <div className="min-h-[calc(100dvh-8rem)]"><div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-success">Ruang belajar</p><h1 className="mt-1 text-xl font-extrabold sm:text-2xl">{materialTitle}</h1></div><span className="text-sm font-semibold text-base-content/55">Materi {stepIndex + 1} dari {steps.length}</span></div><div className="mb-8 grid gap-2 sm:grid-cols-3">{steps.map((item, index) => <button key={item.label} type="button" onClick={() => { setStepIndex(index); setActivated(false); }} className={`flex items-center gap-3 rounded-box border px-3 py-3 text-left text-sm transition ${index === stepIndex ? "border-success bg-success/10 font-bold text-success" : "border-base-300 bg-base-100 text-base-content/55 hover:border-success/40"}`}><span className="grid size-7 shrink-0 place-items-center rounded-full border text-xs">{index + 1}</span><span>{item.label}</span></button>)}</div><div className="card overflow-hidden border border-base-300 bg-base-100 shadow-xl"><div className="grid lg:grid-cols-[1fr_0.85fr]"><div className="flex min-h-80 items-center justify-center bg-success/5 p-6 sm:p-10 lg:min-h-[490px]"><div className="w-full max-w-lg">{step.kind === "addition" ? <><Tokens joined={activated} /><div className="mt-8 text-center text-5xl font-extrabold tracking-normal text-base-content sm:text-6xl"><span className="text-success">3</span><span className="mx-3 text-base-content/40">+</span><span className="text-warning-content">2</span><span className="mx-3 text-base-content/40">=</span><span className={activated ? "text-success" : "text-base-content/30"}>{activated ? "5" : "?"}</span></div></> : step.kind === "counting" ? <><CountingVisual counted={activated} /><p className="mt-7 text-center text-4xl font-extrabold text-success">{activated ? "1  2  3  4  5" : "?"}</p></> : <div className="grid place-items-center rounded-box border border-success/15 bg-base-100 p-10 text-center"><span className="text-6xl font-extrabold text-success">✓</span><p className="mt-4 text-lg font-bold">Konsep utama sudah dipahami</p></div>}</div></div><div className="flex flex-col justify-between p-6 sm:p-10"><div><p className="text-xs font-bold uppercase tracking-wider text-success">Amati, lalu coba</p><h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{step.title}</h2><p className="mt-5 leading-8 text-base-content/65">{step.description}</p>{step.action && <button type="button" onClick={() => setActivated(true)} className="btn btn-success mt-7 w-full">{activated ? "Sudah dilakukan" : step.action} <span aria-hidden="true">-&gt;</span></button>}</div>{activated || step.kind === "explanation" ? <div className="mt-8 border-t border-base-200 pt-6"><p className="text-sm font-extrabold">{step.kind === "addition" && activated ? "3 + 2 = 5" : "Pembahasan singkat"}</p><p className="mt-2 text-sm leading-7 text-base-content/60">{step.explanation}</p></div> : <p className="mt-8 text-center text-sm text-base-content/45">Coba peraganya sebelum melanjutkan.</p>}</div></div></div><div className="mt-5 flex flex-col items-center justify-between gap-4 sm:flex-row"><Link href="/#kelas" className="btn btn-ghost btn-sm">&lt;- Beranda</Link>{isLast ? <button type="button" onClick={() => setPhase("practice")} disabled={!questions.length} className="btn btn-success">Mulai latihan -&gt;</button> : <button type="button" onClick={next} disabled={Boolean(step.action) && !activated} className="btn btn-success">Materi berikutnya -&gt;</button>}</div></div>;
}
