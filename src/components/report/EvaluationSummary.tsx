"use client";

import { useId, type ReactNode, type Ref } from "react";

export function EvaluationSummary({ title, correct, total, english = false, heading }: {
  title: string; correct: number; total: number; english?: boolean; heading?: Ref<HTMLHeadingElement>;
}) {
  const chartTitle = useId();
  const label = (id: string, en: string) => english ? en : id;
  const percent = new Intl.NumberFormat(english ? "en" : "id-ID", { style: "percent", maximumFractionDigits: 1 });
  const accuracy = total > 0 ? correct / total : 0;
  const series = [
    { title: label("Benar", "Correct"), value: correct, ratio: accuracy, colors: ["#208f6d", "#15694e", "#55b799"] },
    { title: label("Salah", "Incorrect"), value: total - correct, ratio: total > 0 ? (total - correct) / total : 0, colors: ["#c04447", "#952c36", "#e78586"] },
  ];

  return <div className="space-y-5">
    <header>
      <h2 ref={heading} tabIndex={-1} className="text-2xl font-extrabold sm:text-3xl">{label("Hasil evaluasi", "Assessment results")}</h2>
      <p className="mt-1 break-words text-sm text-base-content/75">{title}</p>
    </header>
    <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#174d3e] p-4 text-white sm:col-span-1">
        <div><p className="text-sm">{label("Nilai akhir", "Final score")}</p><p className="text-3xl font-extrabold tabular-nums">{Math.round(accuracy * 100)}<span className="text-sm font-medium">/100</span></p><p className="text-sm">{total} {label("soal", "questions")}</p></div>
        <svg aria-hidden="true" viewBox="0 0 44 44" className="size-12 shrink-0 -rotate-90">
          <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" opacity=".25" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" pathLength="100" fill="none" stroke="#8fe4c6" strokeWidth="4" strokeDasharray={`${accuracy * 100} 100`} />
        </svg>
      </div>
      {series.map(item => <div key={item.title} className="rounded-xl border border-base-300 p-3 sm:p-4">
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="text-xl font-extrabold tabular-nums sm:text-2xl">{percent.format(item.ratio)}</p>
        <p className="text-sm text-base-content/75">{item.value} {label("soal", "questions")}</p>
      </div>)}
    </div>
    <p className="text-sm text-base-content/80">{correct === total
      ? label("Bagus, semua jawabanmu benar!", "Well done! All your answers are correct.")
      : label("Evaluasi selesai. Pelajari kembali soal yang masih perlu dilatih.", "Assessment complete. Review the questions that need more practice.")}</p>
    <details className="rounded-xl border border-base-300">
      <summary className="cursor-pointer rounded-xl px-4 py-3 font-semibold">{label("Grafik ringkasan jawaban", "Answer breakdown chart")}</summary>
      <svg viewBox="0 0 320 170" className="mx-auto block w-full max-w-md px-3" role="img" aria-labelledby={chartTitle}>
        <title id={chartTitle}>{series.map(item => `${item.title} ${item.value}`).join(", ")}</title>
        {[0, 0.5, 1].map(fraction => <line key={fraction} x1="34" x2="300" y1={138 - fraction * 100} y2={138 - fraction * 100} stroke="currentColor" opacity=".16" />)}
        <g fill="currentColor" fontSize="11" textAnchor="end">
          <text x="29" y="42">{total}</text>
          <text x="29" y="142">0</text>
        </g>
        {series.map((item, i) => {
          const x = 68 + i * 134, top = 138 - item.ratio * 100;
          return <g key={item.title}>
            {item.value > 0 && <>
              <rect x={x} y={top} width="50" height={138 - top} fill={item.colors[0]} />
              <path d={`M${x} ${top} h50 l12 -8 h-50 Z`} fill={item.colors[2]} />
              <path d={`M${x + 50} ${top} l12 -8 V130 l-12 8 Z`} fill={item.colors[1]} />
            </>}
            <text x={x + 25} y={top - 13} textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700">{item.value}</text>
            <text x={x + 25} y="159" textAnchor="middle" fill="currentColor" fontSize="13">{item.title}</text>
          </g>;
        })}
      </svg>
    </details>
  </div>;
}

export function EvaluationQuestionMap({ children, english = false }: { children: ReactNode; english?: boolean }) {
  return <section className="space-y-3 border-t border-base-300 pt-4">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="font-extrabold">{english ? "Question map" : "Peta jawaban"}</h3>
      <p className="flex gap-3 text-sm"><span className="text-green-800">{english ? "Green: correct" : "Hijau benar"}</span><span className="text-red-800">{english ? "Red: incorrect" : "Merah salah"}</span></p>
    </div>
    <ol aria-label={english ? "Results by question" : "Hasil tiap soal"} className="flex flex-wrap gap-2">{children}</ol>
  </section>;
}

export const questionCircle = "grid size-11 place-items-center rounded-full border-2 text-base font-bold focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:ring-2";
export const questionTone = (correct: boolean) => correct
  ? "border-green-300 bg-green-100 text-green-900 aria-pressed:ring-green-700"
  : "border-red-300 bg-red-100 text-red-900 aria-pressed:ring-red-700";
