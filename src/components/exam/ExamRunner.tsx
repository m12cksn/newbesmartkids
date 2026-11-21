"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Flag, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SaveResult } from "@/components/auth/SaveResult";
import { EXAM_SEP, describe, describeKey, isAnswered, isCorrect, optionText, splitAnswer, type ExamQuestion } from "@/exams/types";

type Attempt = { startedAt: number; answers: Record<string, string> };
type Done = { correct: number; total: number; timeUp: boolean; answers: Record<string, string> };

/* ---------- penyimpanan lokal (bisa gagal di mode privat; halaman tetap jalan) ---------- */
const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, v: string | null) => { try { if (v === null) localStorage.removeItem(key); else localStorage.setItem(key, v); window.dispatchEvent(new Event("bsk-exam-storage")); } catch { /* abaikan */ } };
const subscribe = (cb: () => void) => { window.addEventListener("bsk-exam-storage", cb); window.addEventListener("storage", cb); return () => { window.removeEventListener("bsk-exam-storage", cb); window.removeEventListener("storage", cb); }; };
const useStored = (key: string) => useSyncExternalStore(subscribe, () => read(key), () => null);

const mmss = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };

function NumBox({ label, unit, value, onChange }: { label: string; unit?: string; value: string; onChange: (v: string) => void }) {
  return <label className="flex flex-wrap items-center gap-3 text-lg font-bold">
    <span>{label}</span>
    <input aria-label={label} inputMode="numeric" autoComplete="off" value={value} onChange={e => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
      className="input input-bordered h-14 w-24 border-2 text-center text-2xl font-extrabold focus:border-success" />
    {unit && <span className="text-base font-semibold text-base-content/70">{unit}</span>}
  </label>;
}

export function ExamRunner<S>({ examKey, title, subtitle, questions, minutes, backHref, backLabel, renderScene, renderOptionArt }: {
  examKey: string; title: string; subtitle: string; questions: ExamQuestion<S>[]; minutes: number; backHref: string; backLabel: string;
  renderScene: (s: S) => ReactNode; renderOptionArt?: (art: string) => ReactNode;
}) {
  const attemptKey = `bsk-ujian:${examKey}`, bestKey = `bsk-ujian-terbaik:${examKey}`;
  const saved = useStored(attemptKey), best = useStored(bestKey);
  const limit = minutes * 60 * 1000;
  const [phase, setPhase] = useState<"intro" | "run" | "done">("intro");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);

  const resumable = (() => { if (!saved) return null; try { return JSON.parse(saved) as Attempt; } catch { return null; } })();

  const finish = useCallback((a: Attempt, timeUp: boolean) => {
    const correct = questions.filter(q => isCorrect(q, a.answers[q.id])).length;
    const score = Math.round((correct / questions.length) * 100);
    const prev = Number(read(bestKey) ?? "-1");
    if (score > prev) write(bestKey, String(score));
    write(attemptKey, null);
    setDone({ correct, total: questions.length, timeUp, answers: a.answers });
    setPhase("done");
  }, [questions, attemptKey, bestKey]);

  const start = (a: Attempt, resume = false) => { setAttempt(a); setNow(Date.now()); setIndex(resume ? Math.max(0, questions.findIndex(q => !isAnswered(q, a.answers[q.id]))) : 0); setDone(null); setPhase("run"); write(attemptKey, JSON.stringify(a)); };

  // Jam ujian: diperbarui setiap detik; waktu habis = jawaban dikumpulkan otomatis.
  useEffect(() => {
    if (phase !== "run" || !attempt) return;
    const t = window.setInterval(() => {
      const n = Date.now(); setNow(n);
      if (n - attempt.startedAt >= limit) { window.clearInterval(t); finish(attempt, true); }
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, attempt, limit, finish]);

  useEffect(() => { headRef.current?.focus({ preventScroll: false }); }, [index, phase]);

  if (phase === "intro") return <section className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8">
    <h2 ref={headRef} tabIndex={-1} className="text-2xl font-extrabold outline-none sm:text-3xl">{title}</h2>
    <p className="mt-2 max-w-2xl text-base-content/70">{subtitle}</p>
    <ul className="mt-5 grid gap-3 sm:grid-cols-3">
      <li className="rounded-xl bg-base-200 p-4"><p className="text-3xl font-extrabold text-success">{questions.length}</p><p className="text-sm">soal dari semua bab</p></li>
      <li className="rounded-xl bg-base-200 p-4"><p className="text-3xl font-extrabold text-success">{minutes} menit</p><p className="text-sm">jawaban dikumpulkan otomatis saat waktu habis</p></li>
      <li className="rounded-xl bg-base-200 p-4"><p className="text-3xl font-extrabold text-success">{best !== null ? `${best}/100` : "Belum ada"}</p><p className="text-sm">nilai terbaik di perangkat ini</p></li>
    </ul>
    <p className="mt-5 text-sm text-base-content/70">Setiap soal harus dijawab sebelum lanjut. Kamu boleh kembali ke soal sebelumnya. Ujian boleh diulang dengan soal yang sama.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      {resumable && <button type="button" className="btn btn-success" onClick={() => { if (Date.now() - resumable.startedAt >= limit) finish(resumable, true); else start(resumable, true); }}>Lanjutkan ujian yang belum selesai</button>}
      <button type="button" className={`btn ${resumable ? "btn-outline" : "btn-success"}`} onClick={() => start({ startedAt: Date.now(), answers: {} })}>{resumable ? "Mulai ulang dari awal" : "Mulai ujian"}</button>
      <Link href={backHref} className="btn btn-ghost"><ArrowLeft className="size-4" aria-hidden="true" />{backLabel}</Link>
    </div>
  </section>;

  if (phase === "done" && done) {
    const score = Math.round((done.correct / done.total) * 100);
    const wrong = questions.map((q, i) => ({ q, i })).filter(({ q }) => !isCorrect(q, done.answers[q.id]));
    return <section className="rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8">
      <h2 ref={headRef} tabIndex={-1} className="text-2xl font-extrabold outline-none sm:text-3xl">Hasil ujian</h2>
      {done.timeUp && <p className="mt-2 font-semibold text-warning-content"><Clock className="me-1 inline size-4 align-[-2px]" aria-hidden="true" />Waktu habis. Jawaban dikumpulkan otomatis.</p>}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center" data-testid="exam-result" data-correct={done.correct} data-total={done.total} data-score={score}>
        <div className="rounded-xl bg-success/10 p-4"><p className="text-3xl font-extrabold text-success">{done.correct}</p><p className="text-sm">benar</p></div>
        <div className="rounded-xl bg-error/10 p-4"><p className="text-3xl font-extrabold text-error">{done.total - done.correct}</p><p className="text-sm">salah</p></div>
        <div className="rounded-xl bg-base-200 p-4"><p className="text-3xl font-extrabold">{score}</p><p className="text-sm">skor dari 100</p></div>
      </div>
      <p className="mt-3 text-center text-sm text-base-content/70">Nilai terbaik di perangkat ini: {best ?? score}/100</p>
      <div className="mt-2"><SaveResult kind="evaluasi" part="Ujian Akhir Tahun (SAT)" correct={done.correct} total={done.total} /></div>
      <h3 className="mt-8 text-xl font-extrabold">{wrong.length ? `Pembahasan soal yang salah (${wrong.length})` : "Semua jawaban benar."}</h3>
      <ol className="mt-3 space-y-3">{wrong.map(({ q, i }) => <li key={q.id} className="rounded-xl border border-base-300 bg-base-200 p-4">
        <p className="font-bold">Soal {i + 1}. {q.prompt}</p>
        <p className="mt-2 flex items-start gap-2 text-error"><XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Jawabanmu: {describe(q, done.answers[q.id])}</p>
        <p className="mt-1 flex items-start gap-2 text-success"><CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Jawaban benar: {describeKey(q)}</p>
        <p className="mt-2 text-sm">{q.explanation}</p>
      </li>)}</ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="btn btn-success" onClick={() => start({ startedAt: Date.now(), answers: {} })}><RotateCcw className="size-4" aria-hidden="true" />Ulangi ujian</button>
        <Link href={backHref} className="btn btn-outline"><ArrowLeft className="size-4" aria-hidden="true" />{backLabel}</Link>
      </div>
    </section>;
  }

  if (!attempt) return null;
  const q = questions[index], raw = attempt.answers[q.id] ?? "", v = splitAnswer(raw, q.parts.length);
  const left = limit - (now - attempt.startedAt), low = left <= 5 * 60 * 1000;
  const answeredCount = questions.filter(x => isAnswered(x, attempt.answers[x.id])).length;
  const set = (i: number, val: string) => {
    const next = [...v]; next[i] = val;
    const a = { ...attempt, answers: { ...attempt.answers, [q.id]: next.join(EXAM_SEP) } };
    setAttempt(a); write(attemptKey, JSON.stringify(a));
  };
  const ok = isAnswered(q, raw), last = index === questions.length - 1, all = answeredCount === questions.length;

  return <section className="rounded-2xl border border-base-300 bg-base-100">
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur sm:px-6">
      <p className="font-bold text-success">Soal {index + 1} dari {questions.length}</p>
      <p role="timer" aria-label={`Sisa waktu ${mmss(left)}`} className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-extrabold tabular-nums ${low ? "bg-error/10 text-error" : "bg-base-200"}`}><Clock className="size-4" aria-hidden="true" />{mmss(left)}</p>
    </div>
    <nav aria-label="Nomor soal" className="flex gap-1.5 overflow-x-auto px-4 pt-4 pb-1 sm:flex-wrap sm:px-6">
      {questions.map((x, i) => { const has = isAnswered(x, attempt.answers[x.id]);
        return <button key={x.id} type="button" aria-label={`Soal ${i + 1}${has ? ", sudah dijawab" : ""}`} aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)}
          className={`btn btn-sm size-9 shrink-0 p-0 ${i === index ? "btn-success" : has ? "border-success/40 bg-success/10" : "btn-outline"}`}>{i + 1}</button>; })}
    </nav>
    <div className="p-4 sm:p-6">
      <h2 ref={headRef} tabIndex={-1} className="text-xl font-extrabold leading-snug outline-none sm:text-2xl">{q.prompt}</h2>
      {q.scene !== undefined && <div className="mt-5 flex justify-center">{renderScene(q.scene)}</div>}
      <div className="mt-6 space-y-5">{q.parts.map((p, i) => p.kind === "num"
        ? <NumBox key={i} label={p.label} unit={p.unit} value={v[i]} onChange={val => set(i, val)} />
        : <fieldset key={i}><legend className="mb-2 text-lg font-bold">{p.label}</legend>
            <div role="group" aria-label={p.label} className="grid gap-2 sm:grid-cols-3">{p.options.map(o => { const t = optionText(o), on = v[i] === t;
              return <button key={t} type="button" aria-pressed={on} onClick={() => set(i, t)} className={`flex min-h-14 items-center justify-center gap-3 rounded-xl border-2 px-4 py-3 text-lg font-bold transition ${on ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/60"}`}>
                {typeof o !== "string" && renderOptionArt?.(o.art)}<span>{t}</span></button>; })}</div>
          </fieldset>)}</div>
      {!ok && <p className="mt-4 text-sm text-base-content/60">Jawab soal ini dulu untuk lanjut.</p>}
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex(i => i - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
        {last
          ? <button type="button" className="btn btn-success" disabled={!all} onClick={() => finish(attempt, false)}><Flag className="size-4" aria-hidden="true" />Kumpulkan jawaban</button>
          : <button type="button" className="btn btn-success" disabled={!ok} onClick={() => setIndex(i => i + 1)}>Berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>}
      </div>
      {last && !all && <p className="mt-3 text-end text-sm text-base-content/60">Masih ada {questions.length - answeredCount} soal yang belum dijawab. Lihat nomor soal di atas.</p>}
    </div>
  </section>;
}
