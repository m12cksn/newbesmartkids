"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { SavedResult } from "@/app/api/hasil/route";
import { EvaluationQuestionMap, EvaluationSummary, questionCircle, questionTone } from "./EvaluationSummary";

export function SavedEvaluationReport({ result }: { result: SavedResult }) {
  const reviewId = useId();
  const [selected, select] = useState<number | null>(null);
  const wrong = new Map(result.incorrect?.map(item => [item.number, item]));
  const known = Array.isArray(result.incorrect) || result.correct === result.total;
  const answer = selected === null ? undefined : wrong.get(selected);
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(result.at));
  return <section className="space-y-5 rounded-xl border border-base-300 bg-base-100 p-4 sm:p-6">
    <EvaluationSummary title={result.title ? `${result.part || "Evaluasi"} — ${result.title}` : result.part || "Evaluasi"}
      correct={result.correct} total={result.total} />
    <p className="text-sm text-base-content/75">{date}</p>
    {known ? <EvaluationQuestionMap>
      {Array.from({ length: result.total }, (_, index) => {
        const number = index + 1;
        const correct = !wrong.has(number);
        return <li key={number}>
          <button type="button" aria-label={`Soal ${number}, ${correct ? "benar" : "salah"}`} aria-controls={reviewId}
            aria-pressed={number === selected} onClick={() => select(number === selected ? null : number)}
            className={`${questionCircle} ${questionTone(correct)}`}>{number}</button>
        </li>;
      })}
    </EvaluationQuestionMap> : <p className="text-sm">Rincian jawaban belum tersedia untuk hasil ini.</p>}
    <div id={reviewId} aria-live="polite" hidden={selected === null} className="space-y-2 break-words rounded-xl bg-base-200 p-4 text-sm">
      <h3 className="font-bold">Soal {selected}</h3>
      {answer ? <>
        <p>{answer.prompt}</p>
        <p>Jawabanmu <strong className="text-red-800">{answer.submitted || "Kosong"}</strong></p>
        <p>Jawaban benar <strong className="text-green-800">{answer.expected}</strong></p>
        <p className="whitespace-pre-line">{answer.explanation}</p>
      </> : <p>Jawabanmu benar.</p>}
    </div>
    <Link href={result.path} className="btn btn-outline">Kembali ke materi</Link>
  </section>;
}
