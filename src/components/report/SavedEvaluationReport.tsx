"use client";

import { Check, CircleX, Lightbulb } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import type { EvaluationReviewItem, SavedResult } from "@/app/api/hasil/route";
import { EvaluationQuestionMap, EvaluationSummary, questionCircle, questionTone } from "./EvaluationSummary";

function ReviewCard({ item, number }: { item: EvaluationReviewItem | { number: number; prompt: string; submitted: string; expected: string; explanation: string }; number: number }) {
  return <div className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
    <div><p className="text-xs font-bold uppercase tracking-wide text-success">Soal {number}</p><h3 className="mt-1 break-words text-base font-extrabold leading-7 sm:text-lg">{item.prompt}</h3></div>
    {"options" in item && item.options?.length ? <ul className="flex flex-wrap gap-2" aria-label="Pilihan jawaban">{item.options.map(option => <li key={option} className="break-words rounded-lg border border-base-300 bg-base-200 px-3 py-2 text-sm">{option}</li>)}</ul> : null}
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl border border-error/25 bg-error/5 p-3"><p className="flex items-center gap-1.5 text-xs font-bold text-error"><CircleX className="size-4" aria-hidden="true" />Jawabanmu</p><p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6">{item.submitted || "Kosong"}</p></div>
      <div className="rounded-xl border border-success/25 bg-success/5 p-3"><p className="flex items-center gap-1.5 text-xs font-bold text-success"><Check className="size-4" aria-hidden="true" />Jawaban benar</p><p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6">{item.expected}</p></div>
    </div>
    <div className="rounded-xl border border-base-300 bg-base-200/60 p-3 text-sm leading-6"><p className="flex items-center gap-1.5 text-xs font-bold text-base-content/60"><Lightbulb className="size-4 text-warning-content" aria-hidden="true" />Pembahasan</p><p className="mt-1 whitespace-pre-line">{item.explanation}</p></div>
  </div>;
}

export function SavedEvaluationReport({ result }: { result: SavedResult }) {
  const reviewId = useId();
  const [selected, select] = useState<number | null>(null);
  const snapshots = Array.isArray(result.review) ? result.review : [];
  const wrong = new Map(result.incorrect?.map(item => [item.number, item]));
  const known = snapshots.length === result.total || Array.isArray(result.incorrect) || result.correct === result.total;
  const selectedItem = selected === null ? undefined : snapshots.find(item => item.number === selected) ?? wrong.get(selected);
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(result.at));
  return <section className="space-y-5 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6">
    <EvaluationSummary title={result.title ? `${result.part || "Evaluasi"} — ${result.title}` : result.part || "Evaluasi"} correct={result.correct} total={result.total} />
    <p className="text-sm text-base-content/75">{date}</p>
    {known ? <EvaluationQuestionMap>
      {Array.from({ length: result.total }, (_, index) => {
        const number = index + 1, snapshot = snapshots.find(item => item.number === number), correct = snapshot ? snapshot.correct : !wrong.has(number);
        return <li key={number}><button type="button" aria-label={`Soal ${number}, ${correct ? "benar" : "salah"}`} aria-controls={reviewId} aria-pressed={number === selected}
          onClick={() => select(number === selected ? null : number)} className={`${questionCircle} ${questionTone(correct)}`}>{number}</button></li>;
      })}
    </EvaluationQuestionMap> : <p className="text-sm">Rincian jawaban belum tersedia untuk hasil ini.</p>}
    <div id={reviewId} aria-live="polite" hidden={selected === null} className="space-y-3 break-words">
      {selectedItem ? <ReviewCard item={selectedItem} number={selected!} /> : <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6"><p className="font-bold">Rincian soal ini belum tersimpan</p><p className="mt-1">Hasil lama hanya menyimpan jumlah benar dan salah. Soal lengkap tersedia mulai dari evaluasi yang dikerjakan setelah pembaruan ini.</p></div>}
    </div>
    <Link href={result.path} className="btn btn-outline">Kembali ke materi</Link>
  </section>;
}
