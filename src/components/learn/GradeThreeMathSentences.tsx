"use client";

import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, checkRow, correct, formatAnswer, practice, ready, rows, topics,
  type Bar, type Icon, type MSQuestion, type Possibilities, type Sentence,
} from "@/data/grade-three-math-sentences";

/* ====================================================================== */
/* Ilustrasi benda (SVG buatan sendiri)                                    */
/* ====================================================================== */
export function ObjectIcon({ icon, className = "size-8" }: { icon: Icon; className?: string }) {
  const s = { stroke: "#17352a", strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    {icon === "marble" ? <><circle cx="20" cy="20" r="13" fill="#7dd3fc" {...s} /><path d="M11 17c5 4 13 4 18-1M13 27c4-3 10-3 14 0" fill="none" stroke="#e11d48" strokeWidth="2" /><circle cx="15" cy="14" r="3" fill="#fff" opacity=".8" /></>
      : icon === "candy" ? <><path d="M4 13l8 4-8 4zM36 13l-8 4 8 4z" fill="#a7f3d0" {...s} transform="translate(0 3)" /><rect x="11" y="13" width="18" height="14" rx="7" fill="#34d399" {...s} /><path d="M16 14v12M22 14v12" stroke="#fff" strokeWidth="1.6" /></>
      : icon === "durian" ? <><path d="M20 6c9 0 14 7 14 15s-6 13-14 13S6 29 6 21 11 6 20 6z" fill="#a3a635" {...s} /><path d="M12 14l2 2M20 11v3M28 14l-2 2M10 22h3M27 22h3M14 28l2-2M26 28l-2-2M20 30v-3" stroke="#17352a" strokeWidth="1.4" /><path d="M20 6V2" {...s} /></>
      : icon === "book" ? <><path d="M6 9h12c2 0 2 1 2 3v21c0-2-1-3-3-3H6z" fill="#fbbf24" {...s} /><path d="M34 9H22c-2 0-2 1-2 3v21c0-2 1-3 3-3h11z" fill="#fde68a" {...s} /><path d="M10 15h6M10 20h6M24 15h6M24 20h6" stroke="#92400e" strokeWidth="1.2" /></>
      : icon === "patient" ? <><rect x="4" y="22" width="32" height="6" rx="2" fill="#bae6fd" {...s} /><path d="M6 28v6M34 28v6" {...s} /><circle cx="11" cy="18" r="4" fill="#fcd34d" {...s} /><path d="M16 22v-5h16a3 3 0 0 1 3 3v2" fill="#f0f9ff" {...s} /></>
      : icon === "chicken" ? <><ellipse cx="19" cy="23" rx="12" ry="9" fill="#fff" {...s} /><circle cx="28" cy="13" r="6" fill="#fff" {...s} /><path d="M33 13l4 1-4 2z" fill="#f59e0b" {...s} /><path d="M26 7c1-3 4-3 4 0" fill="#ef4444" {...s} /><circle cx="29" cy="12" r="1" fill="#17352a" /><path d="M16 32v4M22 32v4" stroke="#f59e0b" strokeWidth="2" /></>
      : icon === "mangosteen" ? <><circle cx="20" cy="23" r="12" fill="#6b213f" {...s} /><path d="M14 11c2 2 4 2 6 0 2 2 4 2 6 0l-2 5h-8z" fill="#4d7c0f" {...s} /></>
      : icon === "egg" ? <path d="M20 5c7 0 12 11 12 19a12 12 0 0 1-24 0C8 16 13 5 20 5z" fill="#fde7c4" {...s} />
      : icon === "paper" ? <><path d="M9 4h16l7 7v25H9z" fill="#fff" {...s} /><path d="M25 4v7h7" fill="none" {...s} /><path d="M13 17h14M13 22h14M13 27h10" stroke="#94a3b8" strokeWidth="1.4" /></>
      : icon === "ticket" ? <><path d="M4 12h32v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6z" fill="#fde047" {...s} /><path d="M14 12v16" strokeDasharray="2 2" {...s} /></>
      : icon === "tv" ? <><rect x="5" y="9" width="30" height="20" rx="3" fill="#334155" {...s} /><rect x="8" y="12" width="24" height="14" rx="1" fill="#7dd3fc" /><path d="M14 34h12M20 29v5" {...s} /></>
      : icon === "bottle" ? <><path d="M16 4h8v6c4 2 5 4 5 8v16a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V18c0-4 1-6 5-8z" fill="#bae6fd" {...s} /><rect x="15" y="2" width="10" height="4" rx="1" fill="#0284c7" {...s} /></>
      : <><circle cx="20" cy="22" r="13" fill="#fb923c" {...s} /><path d="M20 9c0-3 3-5 6-5-1 3-3 5-6 5z" fill="#16a34a" {...s} /></>}
  </svg>;
}

/** Kelereng atau permen dalam bentuk puluhan (wadah berisi 10) dan satuan. */
function Counters({ value, kind, tone = "normal", label }: { value: number; kind: "marble" | "candy"; tone?: "normal" | "ghost" | "taken"; label?: string }) {
  const tens = Math.floor(value / 10), ones = value % 10;
  const fill = tone === "taken" ? "#fda4af" : kind === "marble" ? "#7dd3fc" : "#34d399";
  const one = (k: number) => <span key={`o${k}`} className={`inline-block size-4 rounded-full border border-neutral/60 ${tone === "ghost" ? "border-dashed opacity-40" : ""}`} style={{ background: fill }} />;
  return <div className="flex min-h-10 flex-wrap items-center gap-1" role="img" aria-label={label ?? `${value} ${kind === "marble" ? "kelereng" : "permen"}`}>
    {Array.from({ length: tens }, (_, t) => <span key={`t${t}`} className={`inline-flex items-center gap-px rounded-full border-2 border-neutral/60 bg-base-100 px-1 py-0.5 ${tone === "ghost" ? "border-dashed opacity-40" : ""}`} title="10">
      {Array.from({ length: 10 }, (_, k) => <span key={k} className="inline-block size-2 rounded-full" style={{ background: fill }} />)}
    </span>)}
    {Array.from({ length: ones }, (_, k) => one(k))}
    {value === 0 && <span className="text-xs text-base-content/40">kosong</span>}
  </div>;
}

/* ====================================================================== */
/* Kalimat matematika "awan" (seperti di buku)                             */
/* ====================================================================== */
function Cloud({ children }: { children: ReactNode }) {
  return <div className="relative mx-auto w-full max-w-sm px-4 py-8 sm:px-10 sm:py-10">
    <svg viewBox="0 0 300 140" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
      <path d="M48 118c-28 2-44-16-36-36-14-14-2-40 22-38 4-22 34-34 54-20 14-16 44-16 58 0 16-14 46-10 54 10 26-6 50 14 42 38 18 12 14 40-10 44 2 20-26 30-44 20-14 14-44 14-58 0-16 12-46 10-56-6-14 8-30 2-26-12z" fill="#fef3a0" stroke="#e7d85a" strokeWidth="2" />
    </svg>
    <div className="relative flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-2xl font-extrabold tabular-nums text-neutral sm:gap-x-3 sm:text-4xl">{children}</div>
  </div>;
}
function SentenceView({ s, slot }: { s: Sentence; slot: ReactNode }) {
  const v = [s.a, s.b, s.c];
  const cell = (i: number) => i === s.blank ? <span key={i}>{slot}</span> : <span key={i}>{v[i]}</span>;
  return <Cloud>{cell(0)}<span>{s.op}</span>{cell(1)}<span>=</span>{cell(2)}</Cloud>;
}
const blankInput = (value: string, record: (v: string) => void, disabled: boolean, label = "Isi titik-titik") =>
  <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} onChange={e => record(e.target.value.replace(/\D/g, "").slice(0, 4))}
    className="h-12 w-20 rounded-xl border-2 border-dashed border-neutral/50 bg-white text-center text-2xl font-extrabold text-success outline-none focus:border-success focus:ring-4 focus:ring-success/20 sm:h-14 sm:w-28 sm:text-3xl" placeholder="…" />;

/* ====================================================================== */
/* Diagram batang (seperti "Misalnya" di buku)                              */
/* ====================================================================== */
const barColor = { known: "bg-[#c8cc3a] text-neutral", missing: "bg-[#f17f86] text-neutral", whole: "bg-[#56aee0] text-neutral" };
function BarModel({ bar, missing, slot, topic }: { bar: Bar; missing: number; slot: ReactNode; topic: 0 | 1 }) {
  const parts = bar.parts.map(p => p ?? missing) as [number, number];
  const whole = bar.whole ?? missing;
  const block = (value: number | null, label: string, kind: "known" | "whole", grow: number) =>
    <div className={`flex min-w-0 flex-col items-center justify-center rounded-lg border-2 border-neutral/70 px-1 py-2 shadow-[3px_3px_0_0_rgb(23_53_42_/_.35)] ${value === null ? barColor.missing : barColor[kind]}`} style={{ flexGrow: grow, flexBasis: 0 }}>
      <span className="text-[11px] font-bold leading-tight">{label}</span>
      <span className="mt-1 text-xl font-extrabold tabular-nums">{value === null ? slot : value}</span>
    </div>;
  const partRow = <div className="flex gap-1.5">{block(bar.parts[0], bar.labels.parts[0], "known", Math.max(parts[0], whole * .22))}{block(bar.parts[1], bar.labels.parts[1], "known", Math.max(parts[1], whole * .22))}</div>;
  const wholeRow = <div className="flex">{block(bar.whole, bar.labels.whole, "whole", 1)}</div>;
  return <div className="space-y-1.5" aria-label="Diagram batang">{topic === 0 ? <>{partRow}{wholeRow}</> : <>{wholeRow}{partRow}</>}</div>;
}

const tableGrid = "grid grid-cols-[minmax(0,1fr)_1rem_minmax(0,1fr)_1rem_minmax(0,1fr)_1rem] items-center gap-1 text-center sm:gap-2";

/* ====================================================================== */
/* Tabel "Buatlah lima kemungkinan"                                         */
/* ====================================================================== */
function PossibilityTable({ p, value, record, checked }: { p: Possibilities; value: string; record?: (v: string) => void; checked: boolean }) {
  const grid = value ? rows(value) : Array.from({ length: 5 }, () => ["", "", ""]);
  const cells = grid.map(r => r.map((x, c) => p.fixed?.col === c ? String(p.fixed.value) : x));
  const set = (r: number, c: number, v: string) => record?.(cells.map((row, i) => row.map((x, j) => (i === r && j === c ? v.replace(/\D/g, "").slice(0, 4) : x)).join(",")).join(";"));
  const keys = cells.map(r => r.map(Number).join(","));
  return <div className="space-y-2">
    <div className={tableGrid}>
      {[0, 1, 2].map(c => <span key={c} className="contents"><span className="rounded-xl border-2 border-neutral/40 bg-warning/40 px-1 py-1 text-[11px] font-bold leading-tight sm:text-xs">{p.headers[c]}</span>{c < 2 && <span />}</span>)}<span />
    </div>
    {cells.map((row, r) => {
      const ok = checkRow(p, row) && keys.indexOf(keys[r]) === r;
      return <div key={r} className={tableGrid}>
        {[0, 1, 2].map(c => <span key={c} className="contents">
          <input aria-label={`Baris ${r + 1} ${p.headers[c]}`} inputMode="numeric" value={row[c]} disabled={checked || p.fixed?.col === c}
            onChange={e => set(r, c, e.target.value)}
            className={`h-11 w-full min-w-0 rounded-xl border-2 text-center text-lg font-bold tabular-nums ${p.fixed?.col === c ? "border-transparent bg-warning/30" : "border-neutral/30 bg-[#fbf9e6] focus:border-success focus:outline-none"}`} />
          {c < 2 && <span className="text-xl font-extrabold">{c === 0 ? p.op : "="}</span>}
        </span>)}
        <span aria-hidden="true" className={`text-sm font-bold ${checked ? (ok ? "text-success" : "text-error") : "text-transparent"}`}>{ok ? "✓" : "✗"}</span>
      </div>;
    })}
    {p.range && <p className="text-xs font-semibold text-base-content/60">Syarat: {p.headers[p.range.col].toLowerCase()} antara {p.range.min} dan {p.range.max}.</p>}
    <p className="text-xs text-base-content/60">Isi kelima baris dengan kemungkinan yang berbeda. Setiap baris harus benar.</p>
  </div>;
}

/* ====================================================================== */
/* Lab A: kantong kelereng (penjumlahan)                                    */
/* ====================================================================== */
const addPresets = [{ a: 30, b: 20, blank: 1 }, { a: 8, b: 11, blank: 1 }, { a: 38, b: 16, blank: 0 }, { a: 23, b: 22, blank: 1 }, { a: 32, b: 36, blank: 0 }] as const;
const subPresets = [{ a: 80, b: 35, blank: 1 }, { a: 32, b: 17, blank: 1 }, { a: 71, b: 45, blank: 0 }, { a: 56, b: 32, blank: 1 }, { a: 53, b: 21, blank: 0 }] as const;
const tryAdd: Sentence[] = [{ a: 14, op: "+", b: 25, c: 39, blank: 1 }, { a: 47, op: "+", b: 26, c: 73, blank: 0 }, { a: 52, op: "+", b: 39, c: 91, blank: 1 }, { a: 18, op: "+", b: 65, c: 83, blank: 0 }];
const trySub: Sentence[] = [{ a: 48, op: "−", b: 23, c: 25, blank: 1 }, { a: 64, op: "−", b: 29, c: 35, blank: 0 }, { a: 90, op: "−", b: 47, c: 43, blank: 1 }, { a: 75, op: "−", b: 38, c: 37, blank: 0 }];

function Adjust({ label, value, set, max, verbs }: { label: string; value: number; set: (v: number) => void; max: number; verbs: [string, string] }) {
  return <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
    {[[-10, `${verbs[1]} 10`], [-1, `${verbs[1]} 1`], [1, `${verbs[0]} 1`], [10, `${verbs[0]} 10`]].map(([d, t]) =>
      <button key={t} type="button" className={`btn btn-sm ${Number(d) > 0 ? "btn-success" : "btn-outline"}`} disabled={value + Number(d) < 0 || value + Number(d) > max} onClick={() => set(value + Number(d))}>{t}</button>)}
  </div>;
}

function TrySentence({ items }: { items: Sentence[] }) {
  const [i, setI] = useState(0);
  const [v, setV] = useState("");
  const [state, setState] = useState<null | boolean>(null);
  const s = items[i], answer = [s.a, s.b, s.c][s.blank];
  return <div className="space-y-2 rounded-xl border border-dashed border-success/50 bg-base-100 p-3">
    <p className="text-sm font-bold text-success">Coba sendiri ({i + 1}/{items.length})</p>
    <SentenceView s={s} slot={blankInput(v, x => { setV(x); setState(null); }, false, "Coba isi titik-titik")} />
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-success btn-sm" disabled={!v} onClick={() => setState(Number(v) === answer)}>Periksa</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setI((i + 1) % items.length); setV(""); setState(null); }}>Soal lain</button>
    </div>
    {state !== null && <p role="status" className="text-sm"><strong>{state ? "Tepat!" : "Belum tepat."}</strong> {state
      ? <>{s.op === "+" ? `${s.c} − ${[s.a, s.b][1 - s.blank]} = ${answer}` : s.blank === 0 ? `${s.b} + ${s.c} = ${answer}` : `${s.a} − ${s.c} = ${answer}`}.</>
      : s.op === "+" ? "Kurangi jumlah dengan bagian yang diketahui." : s.blank === 0 ? "Jumlahkan yang diambil dengan sisa." : "Kurangi mula-mula dengan sisa."}</p>}
  </div>;
}

function SplitExplorer({ op }: { op: "+" | "−" }) {
  const total = op === "+" ? 95 : 40;
  const [x, setX] = useState(op === "+" ? 40 : 12);
  const [saved, setSaved] = useState<number[]>([]);
  const other = total - x;
  const text = (n: number) => op === "+" ? `${n} + ${total - n} = ${total}` : `${total} − ${n} = ${total - n}`;
  return <div className="space-y-2 rounded-xl border border-base-300 bg-base-100 p-3">
    <p className="text-sm font-bold">Satu {op === "+" ? "jumlah" : "bilangan mula-mula"}, banyak kemungkinan</p>
    <label className="block text-xs font-semibold">{op === "+" ? `Penonton laki-laki (jumlah penonton ${total})` : `Televisi terjual (dari ${total} televisi)`}: {x}
      <input type="range" aria-label={op === "+" ? "Penonton laki-laki" : "Televisi terjual"} min={1} max={total - 1} value={x} onChange={e => setX(Number(e.target.value))} className="range range-success range-xs mt-1 w-full" />
    </label>
    <div className="flex h-7 overflow-hidden rounded-lg border-2 border-neutral/60 text-xs font-bold">
      <span className="grid place-items-center bg-[#c8cc3a]" style={{ width: `${x / total * 100}%` }}>{x}</span>
      <span className="grid place-items-center bg-[#f17f86]" style={{ width: `${other / total * 100}%` }}>{other}</span>
    </div>
    <p className="font-extrabold tabular-nums">{text(x)}</p>
    <button type="button" className="btn btn-outline btn-success btn-xs" disabled={saved.includes(x) || saved.length >= 5} onClick={() => setSaved(s => [...s, x])}>Simpan kemungkinan ({saved.length}/5)</button>
    {saved.length > 0 && <ol className="list-decimal ps-5 text-sm tabular-nums">{saved.map(n => <li key={n}>{text(n)}</li>)}</ol>}
  </div>;
}

function AdditionLab() {
  const [p, setP] = useState(0);
  const [fill, setFill] = useState(0);
  const preset = addPresets[p], c = preset.a + preset.b, known = preset.blank === 1 ? preset.a : preset.b, target = c - known;
  const s: Sentence = { a: preset.a, op: "+", b: preset.b, c, blank: preset.blank };
  const done = fill === target;
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih kalimat matematika" className="flex flex-wrap gap-1.5">
      {addPresets.map((x, i) => { const t = x.blank === 1 ? `${x.a} + … = ${x.a + x.b}` : `… + ${x.b} = ${x.a + x.b}`; return <button key={t} type="button" aria-pressed={i === p} className={`btn btn-sm ${i === p ? "btn-neutral" : "btn-outline"}`} onClick={() => { setP(i); setFill(0); }}>{t}</button>; })}
    </div>
    <SentenceView s={s} slot={<span className={`inline-grid min-w-16 place-items-center rounded-xl border-2 border-dashed px-2 ${done ? "border-success bg-success/15 text-success" : "border-neutral/40 bg-white"}`}>{fill || "…"}</span>} />
    <div className="grid gap-3 sm:grid-cols-2">
      {[0, 1].map(slot => { const isBlank = slot === preset.blank; return <div key={slot} className={`rounded-xl border-2 p-3 ${isBlank ? "border-dashed border-[#f17f86] bg-[#f17f86]/10" : "border-[#c8cc3a] bg-[#c8cc3a]/15"}`}>
        <p className="mb-1 text-xs font-bold">Kantong {slot + 1}: {isBlank ? `${fill} (dicari)` : known}</p>
        <Counters value={isBlank ? fill : known} kind="marble" />
      </div>; })}
    </div>
    <Adjust label="Isi kantong yang dicari" value={fill} set={setFill} max={99} verbs={["Tambah", "Kurangi"]} />
    <BarModel topic={0} missing={Math.max(fill, 1)} slot={fill || "?"} bar={{ whole: c, parts: preset.blank === 1 ? [known, null] : [null, known], labels: { whole: "Jumlah semua", parts: ["Kantong 1", "Kantong 2"] } }} />
    <output data-testid="lab-result" data-value={String(fill)} aria-live="polite" className={`block rounded-lg p-3 text-sm ${done ? "bg-success/10" : "bg-base-100"}`}>
      {done ? <><strong>Pas!</strong> {c} − {known} = {target}. Jadi kalimatnya {preset.blank === 1 ? `${preset.a} + ${target}` : `${target} + ${preset.b}`} = {c}.</>
        : fill < target ? <>Jumlahnya baru {known + fill}. Masih kurang {target - fill} kelereng.</> : <>Jumlahnya {known + fill}, kelebihan {fill - target} kelereng.</>}
    </output>
    <TrySentence items={tryAdd} />
    <SplitExplorer op="+" />
  </div>;
}

/* ====================================================================== */
/* Lab B: toples permen (pengurangan)                                       */
/* ====================================================================== */
function SubtractionLab() {
  const [p, setP] = useState(0);
  const [n, setN] = useState(0);
  const preset = subPresets[p], rest = preset.a - preset.b;
  const s: Sentence = { a: preset.a, op: "−", b: preset.b, c: rest, blank: preset.blank };
  // blank 1: ambil permen dari toples berisi a sampai sisa = rest. blank 0: bangun isi mula-mula sampai mula-mula − b = rest.
  const takeMode = preset.blank === 1;
  const done = takeMode ? n === preset.b : n === preset.a;
  const left = takeMode ? preset.a - n : n - preset.b;
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih kalimat matematika" className="flex flex-wrap gap-1.5">
      {subPresets.map((x, i) => { const t = x.blank === 1 ? `${x.a} − … = ${x.a - x.b}` : `… − ${x.b} = ${x.a - x.b}`; return <button key={t} type="button" aria-pressed={i === p} className={`btn btn-sm ${i === p ? "btn-neutral" : "btn-outline"}`} onClick={() => { setP(i); setN(0); }}>{t}</button>; })}
    </div>
    <SentenceView s={s} slot={<span className={`inline-grid min-w-16 place-items-center rounded-xl border-2 border-dashed px-2 ${done ? "border-success bg-success/15 text-success" : "border-neutral/40 bg-white"}`}>{n || "…"}</span>} />
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border-2 border-[#56aee0] bg-[#56aee0]/10 p-3">
        <p className="mb-1 text-xs font-bold">{takeMode ? `Toples mula-mula: ${preset.a}` : `Toples mula-mula: ${n} (dicari)`}</p>
        <p className="text-xs">Sisa di toples: <strong>{Math.max(left, 0)}</strong></p>
        <Counters value={Math.max(left, 0)} kind="candy" />
      </div>
      <div className="rounded-xl border-2 border-dashed border-[#f17f86] bg-[#f17f86]/10 p-3">
        <p className="mb-1 text-xs font-bold">{takeMode ? `Diambil: ${n} (dicari)` : `Diambil: ${preset.b}`}</p>
        <Counters value={takeMode ? n : Math.min(preset.b, n)} kind="candy" tone="taken" />
      </div>
    </div>
    <Adjust label={takeMode ? "Ambil permen dari toples" : "Isi toples mula-mula"} value={n} set={setN} max={takeMode ? preset.a : 150} verbs={takeMode ? ["Ambil", "Kembalikan"] : ["Tambah", "Kurangi"]} />
    <BarModel topic={1} missing={Math.max(n, 1)} slot={n || "?"} bar={{ whole: takeMode ? preset.a : null, parts: takeMode ? [null, rest] : [preset.b, rest], labels: { whole: "Mula-mula", parts: ["Diambil", "Sisa"] } }} />
    <output data-testid="lab-result" data-value={String(n)} aria-live="polite" className={`block rounded-lg p-3 text-sm ${done ? "bg-success/10" : "bg-base-100"}`}>
      {done ? <><strong>Pas!</strong> {takeMode ? `${preset.a} − ${rest} = ${preset.b}. Jadi ${preset.a} − ${preset.b} = ${rest}.` : `${preset.b} + ${rest} = ${preset.a}. Jadi ${preset.a} − ${preset.b} = ${rest}.`}</>
        : takeMode ? <>Sisa permen {left}. {left > rest ? `Ambil ${left - rest} lagi agar sisanya ${rest}.` : `Terlalu banyak diambil, kembalikan ${rest - left}.`}</>
        : <>Jika mula-mula {n}, sisanya {n - preset.b < 0 ? "tidak cukup" : n - preset.b}. {n < preset.a ? `Tambah ${preset.a - n} lagi.` : `Kurangi ${n - preset.a}.`}</>}
    </output>
    <TrySentence items={trySub} />
    <SplitExplorer op="−" />
  </div>;
}

/* ====================================================================== */
/* Cara menjawab di kuis                                                    */
/* ====================================================================== */
function Answer({ q, value, record, checked }: { q: MSQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  if (q.kind === "sentence") return <SentenceView s={q.sentence!} slot={blankInput(value, record, checked)} />;
  if (q.kind === "story") return <div className="space-y-3">
    <BarModel topic={q.topic} bar={q.bar!} missing={Number(q.answer)} slot={<input aria-label="Jawaban" inputMode="numeric" value={value} disabled={checked}
      onChange={e => record(e.target.value.replace(/\D/g, "").slice(0, 4))} className="h-10 w-20 rounded-lg border-2 border-dashed border-neutral/60 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none" placeholder="?" />} />
    <p className="text-xs text-base-content/60">Tulis jawabanmu pada kotak merah ({q.unit}).</p>
  </div>;
  return <PossibilityTable p={q.possibilities!} value={value} record={record} checked={checked} />;
}

export default function GradeThreeMathSentences() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 3 · Bab 2</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Kalimat Matematika</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Temukan bilangan yang belum diketahui pada kalimat penjumlahan dan pengurangan dengan kelereng, permen, dan diagram batang.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-gradient-to-br from-warning/20 to-success/10 p-6 text-center">
        <p aria-hidden="true" className="rounded-2xl bg-[#fef3a0] px-4 py-2 text-2xl font-extrabold text-neutral">30 + … = 50</p>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Isi titik-titiknya, lalu buktikan</h2>
        <p className="mt-2 text-sm text-base-content/60">2 materi interaktif, {practice.flat().length} latihan materi, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-kalimat">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-kalimat" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi · 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6">{topic === 0 ? <AdditionLab key="a" /> : <SubtractionLab key="b" />}</div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(s => <li key={s}>{s}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{t.demo}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost" disabled={topic === 0} onClick={() => go(topic - 1)}>← Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi →</button>
            {topic === 0 ? <button type="button" className="btn btn-outline" onClick={() => go(1)}>Materi berikutnya</button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<MSQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.kind === "story" ? <div className="flex items-center gap-2 rounded-xl bg-base-200/60 p-2"><ObjectIcon icon={q.icon!} className="size-10" /><ObjectIcon icon={q.icon!} className="size-8 -ms-4 opacity-80" /><ObjectIcon icon={q.icon!} className="size-7 -ms-4 opacity-60" /><span className="text-xs text-base-content/60">Gunakan diagram batang untuk menemukan bilangan yang belum diketahui.</span></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
