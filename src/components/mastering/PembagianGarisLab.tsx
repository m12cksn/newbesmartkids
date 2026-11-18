"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { checkProblem, columns, lesson, MAX_LINES, type Column } from "@/lib/daily-pembagian-garis";

const INK = "#24407a", CARRY = "#d9822b", TIE = "#d6453b", GRID = "#e8a29b";
const EASE = "cubic-bezier(.22,.9,.25,1)";

/** Satu garis coretan tangan. */
function Stroke({ shown, delay, color, tilt }: { shown: boolean; delay: number; color: string; tilt: number }) {
  return <span aria-hidden="true" className="block h-8 w-[3px] origin-bottom rounded-full sm:h-9"
    style={{ background: color, transform: `rotate(${tilt}deg) scaleY(${shown ? 1 : 0})`, opacity: shown ? 1 : 0, transition: `transform .35s ${EASE} ${delay}ms, opacity .2s ease ${delay}ms, background-color .4s ease` }} />;
}
/** Isi satu kolom: garis dikelompokkan per pembagi; setiap kelompok penuh diikat dengan coretan miring. */
function Tally({ col, q, drawn, tied, colIndex }: { col: Column; q: number; drawn: boolean; tied: boolean; colIndex: number }) {
  const carried = col.carryIn * 10, step = Math.min(45, 1100 / Math.max(1, col.lines));
  const bundles = Array.from({ length: Math.ceil(col.lines / q) }, (_, b) => Array.from({ length: Math.min(q, col.lines - b * q) }, (_, k) => b * q + k));
  if (!col.lines) return <p className="py-3 text-center text-sm font-bold text-[#8a8a8a]">Tidak ada garis</p>;
  return <div className="flex flex-wrap content-start justify-center gap-x-3 gap-y-2 py-2">
    {bundles.map((ids, b) => {
      const full = ids.length === q, isRem = !full;
      return <span key={b} className="relative inline-flex items-end gap-[5px] px-1" data-bundle={full ? "full" : "rest"}>
        {ids.map(i => <Stroke key={i} shown={drawn} delay={drawn ? i * step : 0} tilt={(i * 37 + colIndex * 11) % 7 - 3} color={tied && isRem ? CARRY : i < carried ? CARRY : INK} />)}
        {full && <span aria-hidden="true" className="absolute left-[-3px] right-[-3px] top-1/2 h-[3px] origin-left rounded-full"
          style={{ background: TIE, transform: `rotate(-24deg) scaleX(${tied ? 1 : 0})`, transition: `transform .45s ${EASE} ${tied ? b * 260 : 0}ms` }} />}
      </span>;
    })}
  </div>;
}

/** Tabel garis seperti di buku tulis: angka di atas, garis di tengah, hasil di bawah. */
function Board({ n, q, step }: { n: number; q: number; step: number }) {
  const cols = columns(n, q);
  const drawn = (i: number) => step >= 1 + 2 * i, tied = (i: number) => step >= 2 + 2 * i;
  return <div className="overflow-hidden rounded-xl border-2 bg-white" style={{ borderColor: GRID, backgroundImage: "linear-gradient(#e6eef8 1px, transparent 1px), linear-gradient(90deg, #e6eef8 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
    <div className="grid" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
      {cols.map((c, i) => {
        const showCarry = drawn(i) && c.carryIn > 0;
        return <div key={i} className="flex flex-col border-r-2 last:border-r-0" style={{ borderColor: GRID }} data-testid={`kolom-${i}`}>
          <div className="flex min-h-16 flex-col items-center justify-center border-b-2 px-1 py-1 text-center" style={{ borderColor: GRID }}>
            <span className="text-3xl font-extrabold tabular-nums transition-colors duration-500 sm:text-4xl" style={{ color: showCarry ? CARRY : "#17352a" }} data-testid={`atas-${i}`}>{showCarry ? c.lines : c.digit}</span>
            <span className="text-[11px] font-bold leading-tight text-[#6b7a70] sm:text-xs">{showCarry ? `${c.carryIn * 10} + ${c.digit}` : c.place}</span>
          </div>
          <div className={`min-h-28 flex-1 px-1 transition-colors duration-500 ${drawn(i) && !tied(i) ? "bg-[#fff8e6]/70" : ""}`}>
            <Tally col={c} q={q} drawn={drawn(i)} tied={tied(i)} colIndex={i} />
            {tied(i) && c.rem > 0 && i < cols.length - 1 && <p className="mx-auto mb-2 w-fit rounded-full bg-[#fdf0dd] px-2 py-0.5 text-center text-xs font-bold text-[#a3561a] sm:text-sm">Sisa {c.rem}, pindah ke kanan jadi {c.rem * 10}</p>}
          </div>
          <div className="flex min-h-14 items-center justify-center border-t-2" style={{ borderColor: GRID }}>
            <span className="text-3xl font-extrabold tabular-nums sm:text-4xl" data-testid={`hasil-${i}`} style={{ color: tied(i) ? (i === 0 && c.groups === 0 ? "#9aa59e" : "#208f6d") : "transparent", transition: "color .4s ease .3s" }}>{tied(i) ? c.groups : "·"}</span>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const DIVISORS = [2, 3, 4, 5, 6, 7, 8, 9];
function randomProblem(q: number): number {
  const options: number[] = [];
  for (let n = 10; n <= 999; n++) if (!checkProblem(n, q) && n / q >= 10) options.push(n);
  return options[Math.floor(Math.random() * options.length)] ?? q * 12;
}
export default function PembagianGarisLab({ n, q, setProblem }: { n: number; q: number; setProblem: (n: number, q: number) => void }) {
  // Langkah dan isian kembali ke awal setiap kali soal berganti, termasuk dari tombol Peragakan.
  const key = `${n}:${q}`;
  const [st, setSt] = useState({ key, step: 0 }), [play, setPlay] = useState(false);
  const [dr, setDr] = useState({ key, text: String(n), q });
  const step = st.key === key ? st.step : 0, draft = dr.key === key ? dr.text : String(n), draftQ = dr.key === key ? dr.q : q;
  const setStep = (s: number) => setSt({ key, step: s });
  const all = lesson(n, q), last = all.length - 1, done = step >= last;
  const draftError = checkProblem(Number(draft), draftQ);
  useEffect(() => {
    if (!play) return;
    const t = setInterval(() => setSt(p => { const s = p.key === key ? p.step : 0; if (s >= last) { setPlay(false); return p; } return { key, step: s + 1 }; }), 2600);
    return () => clearInterval(t);
  }, [play, last, key]);
  const go = (s: number) => { setPlay(false); setStep(Math.max(0, Math.min(last, s))); };
  const tryProblem = (text: string, d: number) => {
    const valid = !checkProblem(Number(text), d), next = valid ? `${Number(text)}:${d}` : key;
    setDr({ key: next, text, q: d }); setPlay(false);
    if (valid) setProblem(Number(text), d);
  };
  return <section id="peraga" aria-label="Peraga pembagian garis" className="pg scroll-mt-4 rounded-[22px] border border-[#e0e9df] bg-white p-3 shadow-[0_12px_40px_#264e3010] sm:p-6">
    <style>{"@media (prefers-reduced-motion: reduce){.pg *{transition:none!important}}"}</style>
    <h2 className="text-xl font-extrabold text-[#17352a]">Peraga pembagian garis</h2>
    <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,12rem)_1fr_auto] sm:items-end">
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-[#56715c]">Bilangan yang dibagi</span>
        <input type="text" inputMode="numeric" maxLength={3} value={draft} aria-invalid={!!draftError} onChange={e => { if (/^\d{0,3}$/.test(e.target.value)) tryProblem(e.target.value, draftQ); }}
          className="input input-bordered h-11 w-full text-xl font-extrabold tabular-nums" />
      </label>
      <div role="radiogroup" aria-label="Pembagi">
        <span className="mb-1 block text-sm font-bold text-[#56715c]">Pembagi</span>
        <div className="grid grid-cols-8 gap-1">
          {DIVISORS.map(d => <button key={d} type="button" role="radio" aria-checked={draftQ === d} onClick={() => tryProblem(draft, d)}
            className={`h-11 rounded-lg text-lg font-extrabold transition-colors ${draftQ === d ? "bg-[#208f6d] text-white" : "border border-[#dbe5dc] bg-white text-[#33583e] hover:bg-[#edf6ef]"}`}>{d}</button>)}
        </div>
      </div>
      <button type="button" onClick={() => tryProblem(String(randomProblem(draftQ)), draftQ)} className="btn h-11 gap-1"><Shuffle className="size-5" aria-hidden="true" />Soal acak</button>
    </div>
    {draftError ? <p role="status" className="mt-2 rounded-lg bg-[#fdf0dd] px-3 py-2 text-sm font-bold text-[#8a4a14]">{draftError} Peraga masih menampilkan {n} : {q}. Garis per kolom paling banyak {MAX_LINES}.</p> : null}
    <p className="mt-3 text-center text-4xl font-extrabold tabular-nums text-[#17352a]">{n} : {q} = <span className="inline-block min-w-14 rounded-xl px-2 transition-colors duration-500" style={{ background: done ? "#e3f4e8" : "#fff8dc", color: done ? "#208f6d" : "#b8962e" }}>{done ? n / q : "?"}</span></p>
    <div className="mx-auto mt-3 max-w-2xl"><Board n={n} q={q} step={step} /></div>
    <output data-testid="lab-result" data-value={`${n}:${q}:${step}`} aria-live="polite" className="mt-3 block rounded-2xl bg-[#edf7ee] px-4 py-3 text-[#17352a]">
      <span className="flex items-center gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#208f6d] text-base font-extrabold text-white">{step + 1}</span><strong className="text-lg leading-tight sm:text-xl">{all[step].title}</strong></span>
      <span className="mt-1.5 block text-base leading-7 sm:text-lg sm:leading-8">{all[step].text}</span>
    </output>
    <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pilih langkah">
      {all.map((l, i) => <button key={i} type="button" onClick={() => go(i)} aria-label={`Langkah ${i + 1}: ${l.title}`} aria-current={i === step ? "step" : undefined}
        className={`h-2.5 rounded-full transition-all ${i === step ? "w-8 bg-[#208f6d]" : i < step ? "w-2.5 bg-[#8cc9a9]" : "w-2.5 bg-[#dbe5dc]"}`} />)}
    </div>
    <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 sm:flex sm:items-center">
      <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="btn btn-md gap-1"><ChevronLeft className="size-5" aria-hidden="true" />Kembali</button>
      <button type="button" onClick={() => go(step + 1)} disabled={done} className="btn btn-md btn-primary gap-1 text-base sm:min-w-44">Lanjut<ChevronRight className="size-5" aria-hidden="true" /></button>
      <button type="button" onClick={() => { if (done) setStep(0); setPlay(!play); }} className="btn btn-md btn-outline gap-1 sm:ms-auto" aria-pressed={play}>{play ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}{play ? "Jeda" : "Putar otomatis"}</button>
      <button type="button" onClick={() => go(0)} className="btn btn-md btn-ghost gap-1"><RotateCcw className="size-5" aria-hidden="true" />Ulangi</button>
    </div>
    <p className="mt-2 text-sm text-[#617367]">Garis biru dari angka di kolom itu. Garis oranye berasal dari sisa kolom sebelah kiri. Setiap ikatan merah berisi garis sebanyak pembagi.</p>
  </section>;
}
