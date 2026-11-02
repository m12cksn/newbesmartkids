"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/data/questions";
import { QuestionVisual } from "./QuestionVisual";

export function PracticeExperience({ questions, title }: { questions: Question[]; title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isCorrect = selected === question?.answer;
  const progress = useMemo(() => ((currentIndex + 1) / questions.length) * 100, [currentIndex, questions.length]);

  function checkAnswer() {
    if (!selected || checked) return;
    setChecked(true);
    if (isCorrect) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (isLast) return;
    setCurrentIndex((value) => value + 1);
    setSelected("");
    setChecked(false);
  }

  if (!question) return <div className="alert">Soal belum tersedia.</div>;

  return <div className="question-shell flex min-h-[calc(100dvh-5rem)] flex-col"><div className="mx-auto mb-5 flex w-full max-w-4xl items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-success">Latihan interaktif</p><h1 className="mt-1 text-xl font-extrabold sm:text-2xl">{title}</h1></div><div className="text-right"><p className="text-xs text-base-content/50">Soal</p><p className="text-lg font-extrabold text-success">{currentIndex + 1} <span className="font-normal text-base-content/40">/ {questions.length}</span></p></div></div><progress className="progress progress-success mx-auto mb-6 w-full max-w-4xl" value={progress} max="100" /><div className="question-content flex flex-1 items-start justify-center"><div key={question.id} className="animate-question-enter card w-full max-w-4xl border border-base-300 bg-base-100 shadow-xl"><div className="card-body p-4 sm:p-7"><div className="flex items-center justify-between"><span className="badge badge-success badge-outline">Amati dan pikirkan</span><span className="badge badge-ghost capitalize">{question.difficulty}</span></div><div className="my-6 flex min-h-56 items-center justify-center rounded-box border border-success/10 bg-success/5 p-6 sm:min-h-72 sm:p-10"><QuestionVisual type={question.visualType} /></div><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-wider text-base-content/45">Pertanyaan {currentIndex + 1}</p><h2 className="mt-3 text-2xl font-extrabold leading-snug sm:text-4xl">{question.prompt}</h2></div><div className="mx-auto mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">{question.options?.map((option, index) => { const selectedStyle = checked && option === question.answer ? "border-success bg-success/10 ring-2 ring-success/20" : checked && option === selected ? "border-error bg-error/10 ring-2 ring-error/20" : selected === option ? "animate-answer-pop border-success bg-success/5 ring-2 ring-success/20" : "border-base-300"; return <button key={option} type="button" onClick={() => !checked && setSelected(option)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-box border-2 px-3 text-center font-semibold transition hover:-translate-y-0.5 hover:border-success ${selectedStyle}`}><span className="grid size-7 place-items-center rounded-full bg-base-200 text-xs font-bold">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>; })}</div>{checked && <div className={`alert mx-auto mt-6 w-full max-w-2xl ${isCorrect ? "alert-success" : "alert-error"}`}><span>{isCorrect ? "Jawabanmu benar." : "Jawabanmu belum tepat."} {question.explanation}</span></div>}<div className="mx-auto mt-7 flex w-full max-w-2xl flex-col items-center justify-between gap-4 border-t border-base-200 pt-6 sm:flex-row">{!checked ? <p className="text-center text-xs text-base-content/45 sm:text-left">Pilih satu jawaban untuk melanjutkan.</p> : <p className="text-center text-xs font-semibold text-base-content/50 sm:text-left">{isCorrect ? "Bagus, kamu menemukan jawabannya." : "Tidak apa-apa, pelajari pembahasannya."}</p>}{!checked ? <button type="button" className="btn btn-success w-full sm:w-auto" disabled={!selected} onClick={checkAnswer}>Periksa jawaban</button> : isLast ? <div className="flex items-center gap-3"><span className="text-xs font-bold text-success">Skor {score} / {questions.length}</span><button type="button" className="btn btn-success" onClick={() => window.location.reload()}>Ulangi</button></div> : <button type="button" className="btn btn-success w-full sm:w-auto" onClick={nextQuestion}>Soal berikutnya -&gt;</button>}</div></div></div></div></div>;
}
