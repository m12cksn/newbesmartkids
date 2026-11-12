"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Question } from "@/data/grade-four-whole-numbers";
import { EvaluationGate } from "@/components/auth/EvaluationGate";

function isCorrect(question: Question, answer: string | undefined) {
  if (!answer) return false;
  if (question.mode === "multiple") {
    return answer.split("|").sort().join("|") === question.answer.split("|").sort().join("|");
  }
  if (!question.mode && /^\d+$/.test(question.answer)) return /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(answer) && Number(answer.replaceAll(".", "")) === Number(question.answer);
  return answer === question.answer;
}

type QuizProps<Q extends Question> = Parameters<typeof QuizBody<Q>>[0];

/** Evaluasi (bukan latihan) diperiksa aksesnya; latihan selalu terbuka. */
export default function GradeFourQuiz<Q extends Question>(props: QuizProps<Q>) {
  if (props.practiceMode) return <QuizBody {...props} />;
  return <EvaluationGate close={props.close}><QuizBody {...props} /></EvaluationGate>;
}

function QuizBody<Q extends Question>({ questions, title, practiceMode, close, renderVisual, renderAnswer, checkAnswer = isCorrect, isReady, formatAnswer, renderText = text => text, renderMeta, english = false }: {
  english?: boolean;
  questions: Q[]; title: string; practiceMode: boolean; close: () => void;
  renderVisual?: (question: Q) => ReactNode;
  renderAnswer?: (question: Q, answer: string, record: (value: string) => void, checked: boolean) => ReactNode;
  checkAnswer?: (question: Q, answer: string | undefined) => boolean;
  isReady?: (question: Q, answer: string) => boolean;
  formatAnswer?: (question: Q, answer: string) => string;
  /** Optional rich rendering for prompts, explanations and review text (e.g. stacked fractions). */
  renderText?: (text: string) => ReactNode;
  /** Optional small label shown above the prompt (e.g. difficulty). */
  renderMeta?: (question: Q) => ReactNode;
}) {
  const label = (id: string, en: string) => english ? en : id;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = questions[index];
  const answer = answers[index] ?? "";
  const selected = answer ? answer.split("|") : [];
  const ready = question && isReady ? isReady(question, answer) : question?.mode === "order" ? selected.length === question.options?.length : Boolean(answer.trim());
  const score = questions.filter((q, i) => checkAnswer(q, answers[i])).length;
  const record = (value: string) => setAnswers(old => ({ ...old, [index]: value }));
  const go = (i: number) => { setChecked(false); setIndex(i); };
  useEffect(() => { heading.current?.focus(); }, [index]);

  return <section className="mx-auto max-w-2xl space-y-3 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold text-success">{title}{question && ` · ${label("Soal", "Question")} ${index + 1}/${questions.length}`}</p>
      <button className="btn btn-ghost btn-sm" onClick={close}>{label('Tutup', 'Close')}</button>
    </div>
    <progress className="progress progress-success w-full" aria-label={label("Progres soal", "Question progress")} value={index} max={questions.length}/>
    {question ? <>
      {renderMeta?.(question)}
      <h2 ref={heading} tabIndex={-1} className="text-lg font-extrabold">{renderText(question.prompt)}</h2>
      {renderVisual?.(question)}
      {question.mode === "order" && <div className="flex flex-wrap items-center gap-2">
        <p aria-live="polite">{selected.join(" → ") || "Ketuk angka sesuai urutan."}</p>
        <button className="btn btn-ghost btn-sm" disabled={checked || !answer} onClick={() => record(selected.slice(0, -1).join("|"))}>Batalkan pilihan terakhir</button>
      </div>}
      {question.options ? <div className="flex flex-wrap gap-2">
        {question.options.map(option => <button key={option} className="btn btn-outline h-auto min-h-11 min-w-0 max-w-full whitespace-normal break-words"
          disabled={checked || (question.mode === "order" && selected.includes(option))}
          aria-pressed={selected.includes(option)} onClick={() => {
            if (question.mode === "order") record([...selected, option].join("|"));
            else if (question.mode === "multiple") record(selected.includes(option) ? selected.filter(item => item !== option).join("|") : [...selected, option].join("|"));
            else record(option);
          }}>{option}</button>)}
      </div> : renderAnswer ? renderAnswer(question, answer, record, checked) : <label className="flex flex-wrap items-center gap-2 font-bold">Jawaban
        <input className="input input-bordered w-36" inputMode="numeric" value={answer} disabled={checked}
          onChange={event => record(event.target.value.replace(/[^\d.]/g, ""))}/>
      </label>}
      {practiceMode && checked && <p role="status" className="rounded-lg bg-info/10 p-3">
        <strong>{checkAnswer(question, answer) ? label("Tepat! ", "Correct! ") : label("Belum tepat. ", "Not quite. ")}</strong>{renderText(question.explanation)}
      </p>}
      <div className="flex flex-wrap justify-between gap-2">
        {index > 0 && <button className="btn btn-ghost btn-sm" onClick={() => go(index - 1)}>{label('← Sebelumnya', '← Previous')}</button>}
        {practiceMode && !checked ? <button className="btn btn-success ms-auto" disabled={!ready} onClick={() => setChecked(true)}>{label('Periksa jawaban', 'Check answer')}</button>
          : ready && <button className="btn btn-success ms-auto" onClick={() => go(index + 1)}>{index + 1 === questions.length ? label("Lihat hasil", "View results") : label("Lanjut →", "Next →")}</button>}
      </div>
    </> : <>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-extrabold">{practiceMode ? label("Latihan selesai", "Practice complete") : label("Hasil evaluasi", "Assessment results")}</h2>
      <p className="font-bold">{label("Benar", "Correct")} {score} · {label("Salah", "Incorrect")} {questions.length - score} · {label("Skor", "Score")} {Math.round(score / questions.length * 100)}/100</p>
      {score < questions.length && <details className="rounded-lg bg-base-200 p-3">
        <summary className="cursor-pointer font-bold">{label('Bahas jawaban yang salah', 'Review incorrect answers')}</summary>
        <ol className="mt-2 space-y-3 text-sm">{questions.map((q, i) => !checkAnswer(q, answers[i]) &&
          <li key={i}><strong>{label("Soal", "Question")} {i + 1}. {renderText(q.prompt)}</strong>
            <p>{label('Jawabanmu ', 'Your answer: ')}{formatAnswer ? formatAnswer(q, answers[i] ?? "") : answers[i]?.replaceAll("|", ", ")}. {label("Jawaban benar ", "Correct answer: ")}{formatAnswer ? formatAnswer(q, q.answer) : q.answer.replaceAll("|", ", ")}.</p><p>{renderText(q.explanation)}</p>
          </li>)}</ol>
      </details>}
      <button className="btn btn-success" onClick={close}>{label('Kembali ke materi', 'Back to lesson')}</button>
    </>}
  </section>;
}
