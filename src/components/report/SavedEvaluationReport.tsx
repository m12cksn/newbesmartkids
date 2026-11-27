"use client";

import { ArrowLeft, BookOpenCheck, Check, CircleCheck, CircleX, Lightbulb, Sparkles } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import type { EvaluationReviewItem, SavedResult } from "@/app/api/hasil/route";
import { EvaluationQuestionMap, EvaluationSummary, questionCircle, questionTone } from "./EvaluationSummary";

type ReviewItem = EvaluationReviewItem | { number: number; prompt: string; submitted: string; expected: string; explanation: string; correct?: boolean };

function ReviewCard({ item, number }: { item: ReviewItem; number: number }) {
  const isCorrect = "correct" in item && typeof item.correct === "boolean" ? item.correct : false;
  return <div key={number} className="bsk-report-review space-y-5 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className={`text-xs font-extrabold uppercase tracking-[.16em] ${isCorrect ? "text-success" : "text-error"}`}>Soal {number}</p>
        <h3 className="mt-2 break-words text-lg font-extrabold leading-7 text-base-content sm:text-xl">{item.prompt}</h3>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isCorrect ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
        {isCorrect ? <CircleCheck className="size-4" aria-hidden="true" /> : <CircleX className="size-4" aria-hidden="true" />}
        {isCorrect ? "Jawaban benar" : "Perlu dipelajari lagi"}
      </span>
    </div>
    {"options" in item && item.options?.length ? <ul className="flex flex-wrap gap-2" aria-label="Pilihan jawaban">{item.options.map(option => <li key={option} className="max-w-full break-words rounded-lg border border-base-300 bg-base-200 px-3 py-2 text-sm">{option}</li>)}</ul> : null}
    <div className="grid gap-3 md:grid-cols-2">
      <div className="min-w-0 rounded-xl border border-error/25 bg-error/5 p-4"><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-error"><CircleX className="size-4" aria-hidden="true" />Jawabanmu</p><p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6">{item.submitted || "Kosong"}</p></div>
      <div className="min-w-0 rounded-xl border border-success/25 bg-success/5 p-4"><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-success"><Check className="size-4" aria-hidden="true" />Jawaban benar</p><p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6">{item.expected}</p></div>
    </div>
    <div className="rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm leading-6"><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-base-content/70"><Lightbulb className="size-4 text-warning-content" aria-hidden="true" />Pembahasan</p><p className="mt-2 whitespace-pre-line">{item.explanation}</p></div>
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
  const title = result.title ? `${result.part || "Evaluasi"} — ${result.title}` : result.part || "Evaluasi";
  return <section className="bsk-report-shell space-y-6 overflow-hidden rounded-3xl border border-success/15 bg-base-100 p-4 shadow-[0_18px_60px_-36px_rgba(23,53,42,.55)] sm:p-7">
    <div className="bsk-report-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8f8f1] via-[#f7fcf9] to-[#fff8e8] p-5 sm:p-7">
      <div className="bsk-report-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <span className="bsk-report-orbit absolute -right-10 -top-16 size-44 rounded-full border-2 border-success/15" aria-hidden="true" />
      <span className="bsk-report-orbit bsk-report-orbit-reverse absolute -right-2 -top-8 size-28 rounded-full border border-warning/30" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-extrabold text-success"><Sparkles className="size-4" aria-hidden="true" />Laporan belajar tersimpan</div>
          <h1 className="max-w-2xl break-words text-2xl font-black leading-tight text-base-content sm:text-3xl">Kamu sudah menyelesaikan evaluasi!</h1>
          <p className="mt-2 max-w-xl break-words text-sm leading-6 text-base-content/70">Pilih nomor soal untuk melihat jawaban, kunci, dan pembahasannya secara bertahap.</p>
        </div>
        <div className="bsk-report-score-orb shrink-0"><span className="text-xs font-bold text-success">SKOR</span><strong>{result.score}</strong><span className="text-xs font-bold text-base-content/60">/100</span></div>
      </div>
    </div>
    <div className="bsk-report-summary"><EvaluationSummary title={title} correct={result.correct} total={result.total} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 text-sm">
      <p className="flex min-w-0 items-center gap-2 break-words text-base-content/70"><BookOpenCheck className="size-5 shrink-0 text-success" aria-hidden="true" />Dikerjakan pada {date}</p>
      <p className="font-bold text-success">{result.correct} dari {result.total} soal benar</p>
    </div>
    {known ? <div className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5"><EvaluationQuestionMap>
      {Array.from({ length: result.total }, (_, index) => {
        const number = index + 1, snapshot = snapshots.find(item => item.number === number), correct = snapshot ? snapshot.correct : !wrong.has(number);
        return <li key={number}><button type="button" aria-label={`Soal ${number}, ${correct ? "benar" : "salah"}`} aria-controls={reviewId} aria-pressed={number === selected} onClick={() => select(number === selected ? null : number)} className={`${questionCircle} bsk-report-question ${questionTone(correct)}`}>{number}</button></li>;
      })}
    </EvaluationQuestionMap><p className="mt-4 text-center text-sm text-base-content/60">Ketuk lingkaran untuk membuka pembahasan soal.</p></div> : <p className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6">Rincian jawaban belum tersedia untuk hasil ini.</p>}
    <div id={reviewId} aria-live="polite" hidden={selected === null} className="min-w-0 break-words">
      {selectedItem ? <ReviewCard item={selectedItem} number={selected!} /> : <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm leading-6"><p className="font-bold">Rincian soal ini belum tersimpan</p><p className="mt-1">Hasil lama hanya menyimpan jumlah benar dan salah. Soal lengkap tersedia mulai dari evaluasi yang dikerjakan setelah pembaruan ini.</p></div>}
    </div>
    <Link href={result.path} className="btn btn-outline inline-flex items-center gap-2"><ArrowLeft className="size-4" aria-hidden="true" />Kembali ke materi</Link>
  </section>;
}
