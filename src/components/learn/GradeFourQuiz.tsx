"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Question } from "@/data/grade-four-whole-numbers";
import { EvaluationGate } from "@/components/auth/EvaluationGate";
import { SaveResult } from "@/components/auth/SaveResult";
import { EvaluationQuestionMap, EvaluationSummary, questionCircle, questionTone } from "@/components/report/EvaluationSummary";

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

function QuizBody<Q extends Question>({ questions, title, practiceMode, close, renderVisual, renderAnswer, checkAnswer = isCorrect, isReady, formatAnswer, renderText = text => text, renderMeta, english = false, expanded = false, retry = false }: {
  english?: boolean;
  expanded?: boolean;
  retry?: boolean;
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
  const [reviewNumber, setReviewNumber] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);
  const reviewId = useId();
  const review = useRef<HTMLDetailsElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = questions[index];
  const answer = answers[index] ?? "";
  const selected = answer ? answer.split("|") : [];
  const ready = question && isReady ? isReady(question, answer) : question?.mode === "order" ? selected.length === question.options?.length : Boolean(answer.trim());
  const results = question ? [] : questions.map((q, i) => ({
    number: i + 1,
    prompt: q.prompt,
    submitted: formatAnswer ? formatAnswer(q, answers[i] ?? "") : (answers[i] ?? "").replaceAll("|", ", "),
    expected: formatAnswer ? formatAnswer(q, q.answer) : q.answer.replaceAll("|", ", "),
    explanation: q.explanation,
    correct: checkAnswer(q, answers[i]),
  }));
  const incorrect = results.filter(item => !item.correct);
  const score = questions.length - incorrect.length;
  const selectedResult = reviewNumber === null ? undefined : results[reviewNumber - 1];
  const selectedQuestion = reviewNumber === null ? undefined : questions[reviewNumber - 1];
  const showReview = !practiceMode || incorrect.length > 0;
  const record = (value: string) => setAnswers(old => ({ ...old, [index]: value }));
  const go = (i: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setChecked(false);
    setIndex(i);
  };
  const checkEvaluation = () => {
    setChecked(true);
    advanceTimer.current = setTimeout(() => go(index + 1), 1200);
  };
  useEffect(() => { heading.current?.focus(); }, [index]);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const evaluationFinished = !question && !practiceMode;
  return <>
  <section hidden={retrying} className={`group/quiz mx-auto rounded-xl border border-base-300 bg-base-100 p-3 sm:p-6 ${evaluationFinished ? "max-w-3xl space-y-5" : expanded && !practiceMode ? "max-w-3xl space-y-4 text-base [&_.text-xs]:text-sm [&_.text-sm]:text-base" : "max-w-2xl space-y-3"}`} data-evaluation={!practiceMode || undefined}>
    {!evaluationFinished && <><div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold text-success">{title}{question && ` · ${label("Soal", "Question")} ${index + 1}/${questions.length}`}</p>
      <button className="btn btn-ghost btn-sm" onClick={close}>{label('Tutup', 'Close')}</button>
    </div>
    <progress className="progress progress-success w-full" aria-label={label("Progres soal", "Question progress")} value={index} max={questions.length}/></>}
    {question ? <>
      {renderMeta?.(question)}
      <h2 ref={heading} tabIndex={-1} className={expanded && !practiceMode ? "break-words text-xl leading-snug font-extrabold sm:text-2xl" : "text-lg font-extrabold"}>{renderText(question.prompt)}</h2>
      {renderVisual?.(question)}
      {question.mode === "order" && <div className="flex flex-wrap items-center gap-2">
        <p aria-live="polite">{selected.join(" → ") || "Ketuk angka sesuai urutan."}</p>
        <button className="btn btn-ghost btn-sm" disabled={checked || !answer} onClick={() => record(selected.slice(0, -1).join("|"))}>Batalkan pilihan terakhir</button>
      </div>}
      {question.options ? <div className="flex flex-wrap gap-2">
        {question.options.map(option => <button key={option} className={`btn btn-outline h-auto min-h-11 min-w-0 max-w-full whitespace-normal break-words ${expanded && !practiceMode ? "text-base" : ""}`}
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
      {!practiceMode && checked && <p role="status" className={`rounded-lg p-3 font-bold ${checkAnswer(question, answer) ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
        {checkAnswer(question, answer) ? label("Benar.", "Correct.") : label("Salah.", "Incorrect.")}
      </p>}
      <div className="flex flex-wrap justify-between gap-2">
        {practiceMode && index > 0 && <button className="btn btn-ghost btn-sm" onClick={() => go(index - 1)}>{label('← Sebelumnya', '← Previous')}</button>}
        {practiceMode && !checked ? <button className="btn btn-success ms-auto" disabled={!ready} onClick={() => setChecked(true)}>{label('Periksa jawaban', 'Check answer')}</button>
          : practiceMode && ready ? <button className="btn btn-success ms-auto" onClick={() => go(index + 1)}>{index + 1 === questions.length ? label("Lihat hasil", "View results") : label("Lanjut →", "Next →")}</button>
          : !checked && ready && <button className="btn btn-success ms-auto" onClick={checkEvaluation}>{index + 1 === questions.length ? label("Lihat hasil", "View results") : label("Lanjut →", "Next →")}</button>}
      </div>
    </> : <>
      {evaluationFinished
        ? <EvaluationSummary title={title} correct={score} total={questions.length} english={english} heading={heading} />
        : <h2 ref={heading} tabIndex={-1} className="text-xl font-extrabold">{label("Latihan selesai", "Practice complete")}</h2>}
      <p className={evaluationFinished ? "sr-only" : "font-bold"}>{label("Benar", "Correct")} {score} · {label("Salah", "Incorrect")} {questions.length - score} · {label("Skor", "Score")} {Math.round(score / questions.length * 100)}/100</p>
      {!practiceMode && <EvaluationQuestionMap english={english}>
          {results.map(({ number, correct }) => {
            const wrong = !correct;
            const name = label(`Soal ${number}, ${wrong ? "salah" : "benar"}`, `Question ${number}, ${wrong ? "incorrect" : "correct"}`);
            return <li key={number}><button type="button" aria-label={name} aria-controls={reviewId} aria-pressed={reviewNumber === number}
                  onClick={() => {
                    setReviewNumber(number);
                    if (review.current) {
                      review.current.open = true;
                      review.current.scrollIntoView({ block: "nearest" });
                    }
                  }}
                  className={`${questionCircle} ${questionTone(correct)}`}>{number}</button></li>;
          })}
      </EvaluationQuestionMap>}
      {!retry && <SaveResult kind={practiceMode ? "latihan" : "evaluasi"} part={title} correct={score} total={questions.length} incorrect={incorrect} />}
      {showReview && <details id={reviewId} ref={review} hidden={incorrect.length === 0 && !selectedResult} onToggle={event => {
        if (!event.currentTarget.open) setReviewNumber(null);
      }} className="scroll-mt-24 rounded-lg bg-base-200 p-3">
        <summary className="cursor-pointer font-bold">{selectedResult?.correct ? label("Pembahasan soal", "Question review") : label('Bahas jawaban yang salah', 'Review incorrect answers')}</summary>
        <ol aria-live="polite" className="mt-2 space-y-3 text-sm">{(selectedResult ? [selectedResult] : incorrect).map(item =>
          <li key={item.number}><strong>{label("Soal", "Question")} {item.number}. {renderText(item.prompt)}</strong>
            {selectedQuestion && <div className="my-3 space-y-2">
              {renderVisual?.(selectedQuestion)}
              {selectedQuestion.options ? <ul className="flex flex-wrap gap-2" aria-label={label("Pilihan jawaban", "Answer choices")}>
                {selectedQuestion.options.map(option => <li key={option} className="rounded-lg border border-base-300 bg-base-100 px-3 py-2">{option}</li>)}
              </ul> : renderAnswer && <div inert>{renderAnswer(selectedQuestion, selectedQuestion.answer, () => {}, true)}</div>}
            </div>}
            <p>{label('Jawabanmu ', 'Your answer: ')}{item.submitted}. {label("Jawaban benar ", "Correct answer: ")}{item.expected}.</p><p>{renderText(item.explanation)}</p>
          </li>)}</ol>
      </details>}
      <div className="flex flex-wrap gap-2">
        {evaluationFinished && incorrect.length > 0 && <button className="btn btn-success" onClick={() => setRetrying(true)}>{label("Ulangi soal yang salah", "Retry incorrect questions")}</button>}
        <button className={evaluationFinished && incorrect.length ? "btn btn-outline" : "btn btn-success"} onClick={close}>
          {retry ? label("Kembali ke hasil evaluasi", "Back to assessment results") : label("Kembali ke materi", "Back to lesson")}
        </button>
      </div>
    </>}
  </section>
  {retrying && <QuizBody questions={incorrect.map(item => questions[item.number - 1])} title={label("Ulangi soal yang salah", "Retry incorrect questions")}
    practiceMode retry close={() => { setRetrying(false); requestAnimationFrame(() => heading.current?.focus()); }}
    renderVisual={renderVisual} renderAnswer={renderAnswer} checkAnswer={checkAnswer} isReady={isReady} formatAnswer={formatAnswer}
    renderText={renderText} renderMeta={renderMeta} english={english} />}
  </>;
}
