"use client";

import { ArrowLeft, ArrowRight, Check, Eraser, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Seed, ThingArt } from "./GradeFiveKpkFpbArt";
import {
  assessment, cells, correct, factorsOf, formatAnswer, gcd, isPrime, lcm, months, practice, ready, rowValues, SEP, splitParts, things, topics,
  type KQuestion, type Part, type Scene,
} from "@/data/grade-five-kpk-fpb";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-14" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <div role="group" aria-label={label} className="flex items-center gap-1.5"><span className="text-sm font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="w-8 text-center text-xl font-extrabold">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </div>;
}
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const toggle = (list: number[], x: number) => (list.includes(x) ? list.filter(y => y !== x) : [...list, x].sort((a, b) => a - b));
const csv = (v: string) => (v ? v.split(",").map(Number) : []);

/** Tabel bilangan 1..n, 10 kolom. */
function NumberGrid({ n, marked, onTap, label, tone, disabled }: { n: number; marked: number[]; onTap: (k: number) => void; label: string; tone?: (k: number) => string; disabled?: boolean }) {
  return <div role="group" aria-label={label} className="grid w-full max-w-md grid-cols-10 overflow-hidden rounded-lg border border-sky-700/40">
    {Array.from({ length: n }, (_, i) => i + 1).map(k => <button key={k} type="button" aria-label={String(k)} aria-pressed={marked.includes(k)} disabled={disabled} onClick={() => onTap(k)}
      className={`grid aspect-square place-items-center border-b border-r border-sky-700/20 text-[11px] font-bold sm:text-sm ${tone?.(k) ?? (marked.includes(k) ? "bg-orange-300" : "bg-white hover:bg-sky-50")}`}>{k}</button>)}
  </div>;
}

/** Potongan kertas berpetak. */
function Strip({ n, len }: { n: number; len: number }) {
  const full = Math.floor(n / len) * len;
  return <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }} role="img" aria-label={`Kertas ${n} petak dipotong setiap ${len} petak`}>
    {Array.from({ length: n }, (_, i) => <span key={i} className={`h-7 border-y border-l border-sky-800/50 last:border-r ${i >= full ? "bg-sky-600" : Math.floor(i / len) % 2 ? "bg-pink-300" : "bg-orange-300"} ${i % len === 0 && i > 0 && i <= full ? "border-l-2 border-l-red-600" : ""}`} />)}
  </div>;
}

/** Papan congklak lubang 1-28 seperti di buku. */
const boardRows = [[1, 2, 3, 4, 5, 6, 7], [14, 13, 12, 11, 10, 9, 8], [15, 16, 17, 18, 19, 20, 21], [22, 23, 24, 25, 26, 27, 28]];
function Congklak({ a, b, onTap, disabled }: { a: number[]; b: number[]; onTap?: (k: number) => void; disabled?: boolean }) {
  const hole = (k: number) => { const two = a.includes(k) && b.includes(k);
    return <button key={k} type="button" aria-label={`Lubang ${k}`} aria-pressed={a.includes(k) || b.includes(k)} disabled={disabled || !onTap} onClick={() => onTap?.(k)}
      className={`relative grid size-8 place-items-center rounded-full border text-[10px] font-bold shadow-inner sm:size-9 ${two ? "ring-2 ring-success ring-offset-1" : ""} ${k <= 14 ? "border-amber-700 bg-amber-200" : "border-blue-800 bg-blue-300"}`}>
      <span className="absolute top-0.5">{k}</span><span className="mt-2.5 flex gap-px">{a.includes(k) && <Seed color="#2f9e44" />}{b.includes(k) && <Seed color="#d6336c" />}</span>
    </button>; };
  const board = (rows: number[][], tone: string) => <div className={`flex items-center gap-1 rounded-full px-1.5 py-1 ${tone}`}><span className="size-6 rounded-full bg-black/15 sm:size-7" aria-hidden="true" /><div className="space-y-1">{rows.map((r, i) => <div key={i} className="flex gap-1">{r.map(hole)}</div>)}</div><span className="size-6 rounded-full bg-black/15 sm:size-7" aria-hidden="true" /></div>;
  return <div className="space-y-1.5">{board(boardRows.slice(0, 2), "bg-amber-500/80")}{board(boardRows.slice(2), "bg-blue-600/80")}</div>;
}

/** Kalender sebulan, Minggu sampai Sabtu. */
const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
function Calendar({ month, marks, picked, onTap, label, disabled }: { month: keyof typeof months; marks: [number[], number[]]; picked?: number; onTap?: (d: number) => void; label: string; disabled?: boolean }) {
  const m = months[month];
  return <div role="group" aria-label={label} className="w-full max-w-sm">
    <p className="mb-1 flex justify-between text-sm font-extrabold tracking-wide"><span>{m.name.toUpperCase()}</span><span>2022</span></p>
    <div className="grid grid-cols-7 overflow-hidden rounded-md border border-sky-800/40 text-center">
      {dayNames.map((d, i) => <span key={d} className={`border-b border-sky-800/30 bg-sky-50 py-0.5 text-[9px] font-semibold sm:text-[10px] ${i === 0 ? "text-red-600" : ""}`}>{d}</span>)}
      {Array.from({ length: m.first }, (_, i) => <span key={`e${i}`} />)}
      {Array.from({ length: m.days }, (_, i) => i + 1).map(d => { const a = marks[0].includes(d), b = marks[1].includes(d), wd = (m.first + d - 1) % 7;
        return <button key={d} type="button" aria-label={`${d} ${m.name}`} aria-pressed={picked === d} disabled={disabled || !onTap} onClick={() => onTap?.(d)}
          className={`relative grid h-9 place-items-center border-b border-r border-sky-800/15 text-sm font-bold ${wd === 0 ? "text-red-600" : ""} ${picked === d ? "bg-success text-success-content" : ""}`}>
          {(a || b) && <span className={`absolute inset-1 rounded-full ${a && b ? "bg-gradient-to-r from-pink-300 to-orange-300" : a ? "bg-pink-300/80" : "bg-orange-300/80"}`} aria-hidden="true" />}<span className="relative">{d}</span></button>; })}
    </div>
  </div>;
}

/** Pohon faktor bertingkat: setiap tingkat memecah sisa dengan satu bilangan prima. */
function FactorTree({ n, primes, onSplit, onUndo, disabled }: { n: number; primes: number[]; onSplit: (p: number) => void; onUndo: () => void; disabled?: boolean }) {
  const [msg, setMsg] = useState("");
  const levels = primes.reduce<{ p: number; rest: number }[]>((acc, p) => [...acc, { p, rest: (acc.at(-1)?.rest ?? n) / p }], []);
  const cur = levels.at(-1)?.rest ?? n;
  const done = cur === 1 || isPrime(cur);
  return <div className="space-y-2">
    <div className="space-y-1" aria-live="polite">
      <span className="inline-block rounded bg-sky-700 px-2 py-0.5 font-bold text-white">{n}</span>
      {levels.map((l, i) => <div key={i} className="flex items-center gap-2" style={{ marginLeft: `${i * 1.25}rem` }}>
        <span className="rounded bg-sky-700 px-2 py-0.5 font-bold text-white">{l.p}</span><span className="text-xs text-base-content/50">×</span>
        <span className={`rounded px-2 py-0.5 font-bold ${l.rest > 1 && !isPrime(l.rest) ? "bg-sky-100 text-sky-900" : "bg-sky-700 text-white"}`}>{l.rest}</span></div>)}
    </div>
    {!done && <div role="group" aria-label={`Pecah ${cur}`} className="flex flex-wrap items-center gap-1.5"><span className="text-xs">Bagi {cur} dengan:</span>
      {[2, 3, 5, 7, 11, 13].map(p => <button key={p} type="button" aria-label={`Bagi dengan ${p}`} disabled={disabled} className="btn btn-sm btn-outline" onClick={() => { if (cur % p) setMsg(`${cur} tidak habis dibagi ${p}. Coba bilangan prima lain.`); else { setMsg(""); onSplit(p); } }}>{p}</button>)}</div>}
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {primes.length > 0 && <button type="button" className="btn btn-xs btn-ghost gap-1" disabled={disabled} onClick={() => { setMsg(""); onUndo(); }}><Undo2 className="size-3.5" aria-hidden="true" />Batalkan</button>}
      {msg && <span className="text-warning-content">{msg}</span>}
      {done && <span className="font-semibold">Faktorisasi prima: {n} = {[...primes, ...(cur > 1 ? [cur] : [])].join(" × ")}</span>}
    </div>
  </div>;
}

/** Deret faktor prima yang disusun dengan mengetuk bilangan prima. */
function PrimeChips({ n, value, set, disabled }: { n: number; value: string; set: (v: string) => void; disabled?: boolean }) {
  const xs = csv(value), prod = xs.reduce((a, b) => a * b, 1);
  return <div role="group" aria-label={`Faktor prima ${n}`} className="space-y-1">
    <p className="flex min-h-10 flex-wrap items-center gap-1 text-lg font-bold">{n} = {xs.length ? xs.map((p, i) => <span key={i} className="flex items-center gap-1">{i > 0 && "×"}<span className="rounded bg-sky-700 px-1.5 text-white">{p}</span></span>) : <span className="text-base-content/40">…</span>}
      {xs.length > 0 && <span className={`text-xs font-normal ${prod === n ? "text-success" : "text-base-content/60"}`}>(hasil kali {prod})</span>}</p>
    <div className="flex flex-wrap gap-1">{[2, 3, 5, 7, 11, 13].map(p => <button key={p} type="button" disabled={disabled} className="btn btn-xs btn-outline w-9" onClick={() => set([...xs, p].join(","))}>{p}</button>)}
      <button type="button" disabled={disabled || !xs.length} className="btn btn-xs btn-ghost gap-1" onClick={() => set(xs.slice(0, -1).join(","))}><Eraser className="size-3.5" aria-hidden="true" />Hapus</button></div>
  </div>;
}

/* ====================================================================== */
/* Lab                                                                      */
/* ====================================================================== */
function MultLab() {
  const [k, setK] = useState(3), [marked, setMarked] = useState<number[]>([]);
  const right = marked.filter(x => x % k === 0).length, all = Math.floor(100 / k);
  return <div className="space-y-3">
    <Stepper label="Kelipatan" value={k} set={x => { setK(x); setMarked([]); }} min={2} max={12} />
    <NumberGrid n={100} label="Tabel 1 sampai 100" marked={marked} onTap={x => setMarked(toggle(marked, x))} tone={x => (marked.includes(x) ? (x % k === 0 ? "bg-success/40" : "bg-error/40") : "bg-white hover:bg-sky-50")} />
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline" onClick={() => setMarked(Array.from({ length: all }, (_, i) => (i + 1) * k))}>Tunjukkan semua</button><button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setMarked([])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <output data-testid="lab-result" data-value={String(right)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm">Ditemukan {right} dari {all} kelipatan {k}.{marked.length > right && ` ${marked.length - right} kotak merah bukan kelipatan ${k}.`} Kelipatan {k}: {k}, {2 * k}, {3 * k}, … (bilangan × {k}).</output>
  </div>;
}
function CommonLab() {
  const [a, setA] = useState(3), [b, setB] = useState(4);
  const L = lcm(a, b), ra = Array.from({ length: 12 }, (_, i) => (i + 1) * a), rb = Array.from({ length: 12 }, (_, i) => (i + 1) * b);
  const row = (n: number, xs: number[], other: number[]) => <p className="flex flex-wrap items-center gap-1 text-sm"><span className="w-24 shrink-0 font-semibold">Kelipatan {n}:</span>{xs.map(x => <span key={x} className={`rounded px-1.5 ${other.includes(x) ? (x === L ? "bg-pink-300 font-extrabold" : "bg-orange-200 font-bold") : ""}`}>{x}</span>)}</p>;
  const sched = (k: number) => Array.from({ length: 31 }, (_, i) => i + 1).filter(d => d >= 3 && (d - 3) % k === 0);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Bilangan A" value={a} set={setA} min={2} max={9} /><Stepper label="Bilangan B" value={b} set={setB} min={2} max={9} /></div>
    <div className="space-y-1 rounded-xl bg-base-100 p-3">{row(a, ra, rb)}{row(b, rb, ra)}</div>
    <output data-testid="lab-result" data-value={String(L)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm">Kelipatan persekutuan {a} dan {b}: {ra.filter(x => rb.includes(x)).join(", ") || "(belum terlihat)"}. KPK-nya <strong>{L}</strong>.</output>
    <div className="rounded-xl bg-base-100 p-3"><p className="mb-1 text-xs">Latihan bersama tanggal 3 Agustus: pink setiap {a} hari, jingga setiap {b} hari. Lingkaran dua warna berarti bersamaan.</p>
      <Calendar month="agustus" label="Jadwal bersama" marks={[sched(a), sched(b)]} /></div>
  </div>;
}
function CutLab() {
  const [n, setN] = useState(12), [len, setLen] = useState(2), [found, setFound] = useState<number[]>([]);
  const r = n % len;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Panjang kertas" value={n} set={x => { setN(x); setLen(Math.min(len, x)); setFound([]); }} min={6} max={24} /><Stepper label="Tiap bagian" value={len} set={setLen} min={1} max={n} /></div>
    <Strip n={n} len={len} />
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={r !== 0 || found.includes(len)} onClick={() => setFound([...found, len].sort((x, y) => x - y))}><Check className="size-4" aria-hidden="true" />Catat potongan</button>
      <span className="text-sm">{r === 0 ? `${n} : ${len} = ${n / len} potong tanpa sisa.` : `Sisa ${r} petak. Panjang ${len} tidak boleh dipakai.`}</span>
    </div>
    <output data-testid="lab-result" data-value={String(found.length)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm">Panjang yang sudah dicatat: {found.join(", ") || "belum ada"}. {found.length === factorsOf(n).length ? <>Lengkap. Faktor {n} adalah <strong>{found.join(", ")}</strong>.</> : `Masih ada ${factorsOf(n).length - found.length} panjang lagi.`}</output>
  </div>;
}
function CongklakLab() {
  const [a, setA] = useState(12), [b, setB] = useState(18), [p, setP] = useState<0 | 1>(0), [sa, setSa] = useState<number[]>([]), [sb, setSb] = useState<number[]>([]);
  const fa = factorsOf(a), fb = factorsOf(b), okA = sa.join() === fa.join(), okB = sb.join() === fb.join(), both = sa.filter(x => sb.includes(x));
  const reset = () => { setSa([]); setSb([]); };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Pemain 1" value={a} set={x => { setA(x); reset(); }} min={2} max={28} /><Stepper label="Pemain 2" value={b} set={x => { setB(x); reset(); }} min={2} max={28} /></div>
    <div role="radiogroup" aria-label="Biji yang diletakkan" className="flex flex-wrap gap-2">
      {(["Biji pemain 1", "Biji pemain 2"] as const).map((l, i) => <button key={l} type="button" role="radio" aria-checked={p === i} onClick={() => setP(i as 0 | 1)} className={`btn btn-sm gap-1 ${p === i ? "btn-success" : "btn-outline"}`}><Seed color={i ? "#d6336c" : "#2f9e44"} />{l}</button>)}
    </div>
    <Congklak a={sa} b={sb} onTap={k => (p === 0 ? setSa(toggle(sa, k)) : setSb(toggle(sb, k)))} />
    <output data-testid="lab-result" data-value={String(both.length)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      Pemain 1 (faktor {a}): {okA ? "lengkap" : `${sa.filter(x => a % x === 0).length} dari ${fa.length} benar${sa.some(x => a % x) ? ", ada biji di lubang yang bukan faktor" : ""}`}. Pemain 2 (faktor {b}): {okB ? "lengkap" : `${sb.filter(x => b % x === 0).length} dari ${fb.length} benar${sb.some(x => b % x) ? ", ada biji di lubang yang bukan faktor" : ""}`}.
      {okA && okB && <> Lubang berisi dua biji: {both.join(", ")}. FPB dari {a} dan {b} adalah <strong>{gcd(a, b)}</strong>.</>}
    </output>
  </div>;
}
const treeNums = [60, 72, 84, 90, 96, 120, 150, 196, 300];
function TreeLab() {
  const [i, setI] = useState(8), [ps, setPs] = useState<number[]>([]);
  const n = treeNums[i], rest = ps.reduce((m, p) => m / p, n), done = isPrime(rest) || rest === 1;
  return <div className="space-y-3">
    <div role="group" aria-label="Pilih bilangan" className="flex flex-wrap gap-1">{treeNums.map((x, k) => <button key={x} type="button" aria-pressed={k === i} className={`btn btn-xs ${k === i ? "btn-success" : "btn-outline"}`} onClick={() => { setI(k); setPs([]); }}>{x}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-3"><FactorTree n={n} primes={ps} onSplit={p => setPs([...ps, p])} onUndo={() => setPs(ps.slice(0, -1))} /></div>
    <output data-testid="lab-result" data-value={done ? [...ps, ...(rest > 1 ? [rest] : [])].join(",") : ""} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm">{done ? `Semua ujung pohon sudah bilangan prima.` : `Ketuk bilangan prima yang habis membagi ${rest}.`}</output>
  </div>;
}
/** Alur ringkas pembagian berulang. */
function LadderSteps() {
  return <ol className="grid gap-1.5 text-sm sm:grid-cols-3">
    {[["Tulis", "bilangan-bilangannya berdampingan."], ["Bagi", "dengan prima terkecil yang bisa. Yang tidak habis, tulis lagi."], ["Ulangi", "sampai semua menjadi 1."]].map(([a, b], i) =>
      <li key={a} className="flex gap-2 rounded-lg border border-sky-200 bg-white p-2"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-700 text-xs font-bold text-white">{i + 1}</span><span><strong>{a}</strong> {b}</span></li>)}
  </ol>;
}
const ladderSets = [[12, 18], [24, 36], [42, 60], [72, 150], [8, 12, 20], [12, 18, 30]];
function LadderLab() {
  const [set, setSet] = useState(0), [ds, setDs] = useState<number[]>([]), [msg, setMsg] = useState("");
  const nums = ladderSets[set];
  const rows = ds.reduce<{ d: number; before: number[]; after: number[] }[]>((acc, d) => { const before = acc.at(-1)?.after ?? nums; return [...acc, { d, before, after: before.map(x => (x % d === 0 ? x / d : x)) }]; }, []);
  const cur = rows.at(-1)?.after ?? nums, done = cur.every(x => x === 1);
  const allDiv = (r: { d: number; before: number[] }) => r.before.every(x => x % r.d === 0);
  const kpk = ds.reduce((a, b) => a * b, 1), fpbList = rows.filter(allDiv).map(r => r.d), fpb = fpbList.reduce((a, b) => a * b, 1);
  const tap = (p: number) => { if (!cur.some(x => x % p === 0)) { setMsg(`Tidak ada bilangan yang habis dibagi ${p}. Coba prima lain.`); return; } setMsg(""); setDs([...ds, p]); };
  return <div className="space-y-3">
    <LadderSteps />
    <div role="group" aria-label="Pilih bilangan" className="flex flex-wrap gap-1">{ladderSets.map((x, k) => <button key={k} type="button" aria-pressed={k === set} className={`btn btn-xs ${k === set ? "btn-success" : "btn-outline"}`} onClick={() => { setSet(k); setDs([]); setMsg(""); }}>{x.join(", ")}</button>)}</div>
    <div className="overflow-x-auto rounded-xl bg-base-100 p-2"><table className="w-full border-collapse text-center text-sm">
      <thead><tr className="bg-sky-700 text-white"><th className="px-2 py-1 text-xs">Pembagi</th>{nums.map((n, i) => <th key={i} className="px-2 py-1">{n}</th>)}<th className="px-1 py-1 text-xs">FPB?</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className={i % 2 ? "bg-orange-50" : "bg-orange-100"}><td className="py-1 font-extrabold text-sky-800">{r.d}</td>
        {r.after.map((x, j) => <td key={j} className={r.before[j] % r.d === 0 ? "font-bold" : "text-base-content/40"}>{x}</td>)}
        <td>{allDiv(r) && <span className="badge badge-success badge-sm">semua</span>}</td></tr>)}</tbody>
    </table></div>
    {!done ? <div role="group" aria-label="Bagi dengan" className="flex flex-wrap items-center gap-1.5"><span className="text-sm">Bagi {cur.join(", ")} dengan:</span>
      {[2, 3, 5, 7].map(p => <button key={p} type="button" aria-label={`Bagi dengan ${p}`} className="btn btn-sm btn-outline w-10" onClick={() => tap(p)}>{p}</button>)}
      {ds.length > 0 && <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => { setDs(ds.slice(0, -1)); setMsg(""); }}><Undo2 className="size-4" aria-hidden="true" />Batalkan</button>}</div>
      : <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setDs([])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>}
    {msg && <p className="text-sm text-warning-content">{msg}</p>}
    <output data-testid="lab-result" data-value={done ? `${kpk}|${fpb}` : ""} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {done ? <>Semua sudah 1.<br />KPK = kalikan semua pembagi = {ds.join(" × ")} = <strong>{kpk}</strong>.<br />FPB = kalikan pembagi bertanda &quot;semua&quot; = {fpbList.length ? `${fpbList.join(" × ")} = ` : ""}<strong>{fpb}</strong>{fpbList.length ? "" : " (tidak ada pembagi bersama)"}.</> : "Ketuk bilangan prima terkecil yang dapat membagi salah satu bilangan."}
    </output>
  </div>;
}
const labs = [MultLab, CommonLab, CutLab, CongklakLab, TreeLab, LadderLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  const [len, setLen] = useState(1);
  if (scene.type === "items") return <div className="w-full max-w-xl space-y-2">{scene.rows.map(r => <div key={r.thing}><p className="text-xs font-bold">{r.n} {things[r.thing]}</p>
    <span role="img" aria-label={`${r.n} ${things[r.thing]}`} className="flex flex-wrap gap-0.5">{Array.from({ length: r.n }, (_, i) => <ThingArt key={i} t={r.thing} className="size-5 sm:size-6" />)}</span></div>)}</div>;
  if (scene.type === "lights") return <div className="flex flex-wrap items-end justify-center gap-4">{scene.seconds.map((s, i) => <div key={s} className="flex flex-col items-center text-xs"><ThingArt t="lampu" className="h-16 w-12" /><span className="font-bold">Simpang {i + 1}</span><span>merah setiap {s} detik</span></div>)}<span className="text-sm font-bold">Bersamaan pukul {scene.start}</span></div>;
  return <div className="w-full space-y-2"><Strip n={scene.n} len={len} /><Stepper label="Coba panjang tiap bagian" value={len} set={setLen} min={1} max={scene.n} /><p className="text-xs">{scene.n % len ? `Sisa ${scene.n % len} petak.` : `${scene.n / len} potong tanpa sisa.`}</p></div>;
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const [mode, setMode] = useState(2), [marks, setMarks] = useState<[number[], number[]]>([[], []]), [tree, setTree] = useState<number[]>([]);
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} <Box label={p.label} value={value} onChange={set} disabled={checked} w="w-20" /></label>;
    case "grid": return <div className="space-y-1"><p className="text-sm font-bold">{p.label}: ketuk bilangannya.</p><NumberGrid n={p.n} label={p.label} marked={csv(value)} disabled={checked} onTap={k => set(toggle(csv(value), k).join(","))} /><p className="text-xs text-base-content/60">Sudah diketuk {csv(value).length} bilangan.</p></div>;
    case "list": return <div className="space-y-1"><p className="text-sm font-bold">{p.label}:</p><div className="flex flex-wrap gap-1.5">{x.map((v, k) => <Box key={k} label={`${p.label} ke-${k + 1}`} value={v} onChange={y => put(k, y)} disabled={checked} />)}</div></div>;
    case "rainbow": {
      const fs = factorsOf(p.n), m = fs.length, colors = ["border-orange-400", "border-sky-600", "border-pink-400", "border-emerald-500", "border-violet-500"];
      const ring = (k: number) => colors[Math.min(k, m - 1 - k) % colors.length];
      return <div className="space-y-1"><p className="text-sm font-bold">Faktor dari {p.n}:</p>
        <div className="flex flex-wrap items-center gap-1">{fs.map((_, k) => k === 0 || k === m - 1 ? <span key={k} className={`grid size-10 place-items-center rounded-full border-4 bg-white text-lg font-extrabold ${ring(k)}`}>{k === 0 ? 1 : p.n}</span>
          : <span key={k} className={`rounded-full border-4 p-0.5 ${ring(k)}`}><Box label={`Faktor ${p.n} ke-${k + 1}`} value={x[k - 1]} onChange={y => put(k - 1, y)} disabled={checked} w="w-12" /></span>)}</div>
        <p className="text-xs text-base-content/60">Warna lingkaran sama menunjukkan pasangan faktor.</p></div>;
    }
    case "cut": return <div className="w-full space-y-2"><Strip n={p.n} len={1} />
      <div className="overflow-hidden rounded-lg border border-sky-700/40 text-sm"><div className="grid" style={{ gridTemplateColumns: `8rem repeat(${p.lengths.length}, minmax(0,1fr))` }}>
        <span className="bg-sky-700 p-1.5 text-xs font-bold text-white">Panjang tiap bagian</span>{p.lengths.map(l => <span key={l} className="grid place-items-center border-l border-sky-200 bg-orange-50 font-bold">{l}</span>)}
        <span className="border-t border-sky-200 bg-sky-700 p-1.5 text-xs font-bold text-white">Banyak potongan</span>{p.lengths.map((l, k) => <span key={l} className="grid place-items-center border-l border-t border-sky-200 p-1"><Box label={`Potongan panjang ${l}`} value={x[k]} onChange={y => put(k, y)} disabled={checked} w="w-full max-w-12" /></span>)}
      </div></div></div>;
    case "congklak": {
      const sa = csv(x[0]), sb = csv(x[1]);
      return <div className="space-y-2">
        <div role="radiogroup" aria-label="Biji yang diletakkan" className="flex flex-wrap gap-2">{(["Biji pemain 1", "Biji pemain 2"] as const).map((l, k) => <button key={l} type="button" role="radio" aria-checked={mode % 2 === k} disabled={checked} onClick={() => setMode(k)} className={`btn btn-sm gap-1 ${mode % 2 === k ? "btn-success" : "btn-outline"}`}><Seed color={k ? "#d6336c" : "#2f9e44"} />{l}: faktor {k ? p.b : p.a}</button>)}</div>
        <Congklak a={sa} b={sb} disabled={checked} onTap={k => put(mode % 2 === 0 ? 0 : 1, toggle(mode % 2 === 0 ? sa : sb, k).join(","))} />
        <label className="flex flex-wrap items-center gap-2 font-bold">FPB dari {p.a} dan {p.b} = <Box label={`FPB dari ${p.a} dan ${p.b}`} value={x[2]} onChange={y => put(2, y)} disabled={checked} /></label>
      </div>;
    }
    case "rows": {
      const marked = csv(x[0]), rs = rowValues(p);
      return <div className="space-y-2">{p.nums.map((n, r) => <div key={n} role="group" aria-label={`Kelipatan ${n}`} className="flex flex-wrap items-center gap-1"><span className="w-24 shrink-0 text-sm font-semibold">Kelipatan {n}:</span>
        {rs[r].map(v => <button key={v} type="button" disabled={checked} aria-pressed={marked.includes(v)} onClick={() => put(0, toggle(marked, v).join(","))} className={`btn btn-xs min-w-9 ${marked.includes(v) ? "btn-warning" : "btn-ghost border-base-300"}`}>{v}</button>)}</div>)}
        <p className="text-xs text-base-content/60">Ketuk bilangan yang ada di kedua baris.</p>
        <label className="flex flex-wrap items-center gap-2 font-bold">KPK dari {p.nums.join(" dan ")} = <Box label={`KPK dari ${p.nums.join(" dan ")}`} value={x[1]} onChange={y => put(1, y)} disabled={checked} /></label>
      </div>;
    }
    case "calendar": {
      const modes = [`Tandai jadwal ${p.who[0]}`, `Tandai jadwal ${p.who[1]}`, "Pilih tanggal jawaban"];
      return <div className="space-y-2">
        <div role="radiogroup" aria-label="Alat kalender" className="flex flex-wrap gap-1.5">{modes.map((l, k) => <button key={l} type="button" role="radio" aria-checked={mode === k} disabled={checked} onClick={() => setMode(k)} className={`btn btn-xs ${mode === k ? "btn-success" : "btn-outline"}`}>{l}</button>)}</div>
        <Calendar month={p.month} label="Kalender" marks={marks} picked={value ? Number(value) : undefined} disabled={checked}
          onTap={d => { if (mode === 2) set(String(d)); else setMarks(m => (mode === 0 ? [toggle(m[0], d), m[1]] : [m[0], toggle(m[1], d)])); }} />
        <p className="text-sm">Jawaban: {value ? `${value} ${months[p.month].name}` : "ketuk tanggal pada mode Pilih tanggal jawaban."}</p>
      </div>;
    }
    case "tree": return <FactorTree n={p.n} primes={tree} disabled={checked}
      onSplit={pr => { const next = [...tree, pr], rest = next.reduce((m, y) => m / y, p.n); setTree(next); set(isPrime(rest) ? [...next, rest].join(",") : rest === 1 ? next.join(",") : ""); }}
      onUndo={() => { setTree(tree.slice(0, -1)); set(""); }} />;
    case "factorize": return <div className="space-y-3">
      <PrimeChips n={p.nums[0]} value={x[0]} set={y => put(0, y)} disabled={checked} /><PrimeChips n={p.nums[1]} value={x[1]} set={y => put(1, y)} disabled={checked} />
      <div className="flex flex-wrap gap-4 font-bold"><label className="flex items-center gap-2">KPK = <Box label="KPK" value={x[2]} onChange={y => put(2, y)} disabled={checked} w="w-20" /></label><label className="flex items-center gap-2">FPB = <Box label="FPB" value={x[3]} onChange={y => put(3, y)} disabled={checked} w="w-20" /></label></div>
    </div>;
    case "ladder": {
      const k = x.length - 2, cols = p.nums.length + 1;
      return <div className="space-y-2"><LadderSteps /><div className="overflow-x-auto"><table className="border-collapse text-center text-sm">
        <thead><tr className="bg-sky-700 text-white"><th className="px-2 py-1 text-xs">Pembagi prima</th>{p.nums.map(n => <th key={n} className="px-2 py-1">{n}</th>)}<th className="px-1 py-1 text-xs">FPB?</th></tr></thead>
        <tbody>{Array.from({ length: k }, (_, r) => { const row = (x[r] || "").split(","); const setCell = (c: number, v: string) => { const a = Array.from({ length: cols }, (_, j) => row[j] ?? ""); a[c] = v; put(r, a.join(",")); };
          return <tr key={r} className={r % 2 ? "bg-orange-50" : "bg-orange-100"}><td className="p-1"><Box label={`Baris ${r + 1} pembagi`} value={row[0] ?? ""} onChange={v => setCell(0, v)} disabled={checked} w="w-12" /></td>
            {p.nums.map((n, c) => <td key={n} className="p-1"><Box label={`Baris ${r + 1} hasil ${n}`} value={row[c + 1] ?? ""} onChange={v => setCell(c + 1, v)} disabled={checked} w="w-14" /></td>)}
            <td className="px-1">{(() => { const d = Number(row[0]), prev = r === 0 ? p.nums : (x[r - 1] || "").split(",").slice(1).map(Number); return d > 1 && prev.length === p.nums.length && prev.every(y => y > 0 && y % d === 0) ? <span className="badge badge-success badge-sm">semua</span> : null; })()}</td></tr>; })}</tbody>
      </table></div>
        <p className="text-xs text-base-content/60">KPK = kalikan semua pembagi. FPB = kalikan pembagi bertanda &quot;semua&quot;.</p>
        <div className="flex flex-wrap gap-4 font-bold"><label className="flex items-center gap-2">KPK = <Box label="KPK" value={x[k]} onChange={y => put(k, y)} disabled={checked} w="w-20" /></label><label className="flex items-center gap-2">FPB = <Box label="FPB" value={x[k + 1]} onChange={y => put(k + 1, y)} disabled={checked} w="w-20" /></label></div>
      </div>;
    }
    case "time": return <label className="flex items-center gap-2 text-lg font-bold">{p.label} <Box label="Jam" value={x[0]} onChange={y => put(0, y)} disabled={checked} /> . <Box label="Menit" value={x[1]} onChange={y => put(1, y)} disabled={checked} /></label>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{["i", "ii", "iii", "iv"][k]}. {s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-4 py-2 text-lg font-extrabold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: KQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeFiveKpkFpb() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  const hero: ReactNode = <div aria-hidden="true" className="flex items-center gap-2 text-2xl font-extrabold text-sky-800"><span className="rounded-lg bg-white px-2">KPK</span><span className="rounded-lg bg-white px-2">FPB</span></div>;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 5, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">KPK dan FPB</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Temukan kelipatan dan faktor, cari KPK dan FPB dengan tabel, congklak, pohon faktor, dan pembagian berulang, lalu pakai untuk jadwal dan pembagian benda.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">{hero}
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Latihan renang Nisa dan Yohana</h2>
        <p className="mt-2 text-sm text-base-content/60">{topics.length} peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-kpk">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-kpk" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={topic} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{t.demo}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi</button>
            {topic < topics.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<KQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
