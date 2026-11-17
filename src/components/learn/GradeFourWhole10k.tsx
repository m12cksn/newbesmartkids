"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw, Shuffle, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, cells, columnResult, correct, digits4, fmt, formatAnswer, placeValue, places, practice, reading, ready, SEP, splitParts, topics,
  type Note, type Part, type Scene, type Thing, type WQuestion,
} from "@/data/grade-four-whole-10k";

/** Warna nilai tempat seperti kardus di buku: ribuan biru, ratusan oranye, puluhan hijau, satuan merah. */
const placeColors = ["#2f6fcf", "#d97706", "#3f9b45", "#dc2626"];
const ink = "#2b2320";

/* ====================================================================== */
/* Gambar                                                                  */
/* ====================================================================== */
const noteStyle: Record<Note, { fill: string; dark: string }> = { 2000: { fill: "#b9d3ee", dark: "#3d6b9e" }, 1000: { fill: "#bfe3e6", dark: "#3a8a91" }, 500: { fill: "#e9d48a", dark: "#9a7b1c" }, 100: { fill: "#d7dbe0", dark: "#7a838c" } };
/** Uang kertas atau koin (gambar sederhana, bukan tiruan uang asli). */
function Money({ value, w = 56 }: { value: Note; w?: number }) {
  const s = noteStyle[value];
  if (value <= 500) return <svg viewBox="0 0 40 40" width={w * 0.55} height={w * 0.55} aria-hidden="true"><circle cx="20" cy="20" r="18" fill={s.fill} stroke={s.dark} strokeWidth="2" /><circle cx="20" cy="20" r="13.5" fill="none" stroke={s.dark} strokeWidth=".8" /><text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>{value}</text></svg>;
  return <svg viewBox="0 0 96 48" width={w} height={w / 2} aria-hidden="true">
    <rect x="1" y="1" width="94" height="46" rx="4" fill={s.fill} stroke={s.dark} strokeWidth="2" /><rect x="6" y="6" width="84" height="36" rx="2" fill="none" stroke={s.dark} strokeWidth=".8" />
    <circle cx="22" cy="24" r="10" fill="#fff" opacity=".55" stroke={s.dark} strokeWidth=".8" /><text x="60" y="30" textAnchor="middle" fontSize="16" fontWeight="800" fill={ink}>{fmt(value)}</text>
  </svg>;
}
function MoneyStack({ value, count, w = 52 }: { value: Note; count: number; w?: number }) {
  const coin = value <= 500, n = Math.min(count, 6);
  return <figure className="flex flex-col items-center gap-0.5" aria-label={`${count} ${coin ? "keping" : "lembar"} Rp${fmt(value)}`}>
    <div className="relative" style={{ height: (coin ? w * 0.55 : w / 2) + n * 3, width: (coin ? w * 0.55 : w) + n * 3 }}>{Array.from({ length: n }, (_, i) => <span key={i} className="absolute" style={{ left: i * 3, top: i * 3 }}><Money value={value} w={w} /></span>)}</div>
    <figcaption className="text-xs font-bold">{count} {coin ? "keping" : "lembar"}</figcaption>
  </figure>;
}
/** Speedometer motor dengan angka odometer. */
function Gauge({ value }: { value: number }) {
  return <svg viewBox="0 0 200 120" width="220" height="132" role="img" aria-label={`Odometer motor menunjukkan ${fmt(value)}`}>
    <path d="M10 112a90 90 0 01180 0z" fill="#1f3f86" stroke={ink} strokeWidth="2" /><path d="M28 108a72 72 0 01144 0" fill="#f7f7f2" stroke={ink} strokeWidth="1.5" />
    {Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1 - i / 8), x1 = 100 + 64 * Math.cos(a), y1 = 108 - 64 * Math.sin(a), x2 = 100 + 56 * Math.cos(a), y2 = 108 - 56 * Math.sin(a); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="2" />; })}
    <path d="M100 108L62 66" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" /><circle cx="100" cy="108" r="6" fill={ink} />
    <rect x="62" y="78" width="76" height="22" rx="3" fill="#222" />
    {digits4(value).map((d, i) => <g key={i}><rect x={65 + i * 18} y="80" width="16" height="18" rx="2" fill="#fff" /><text x={73 + i * 18} y="95" textAnchor="middle" fontSize="15" fontWeight="800" fill={ink}>{d}</text></g>)}
  </svg>;
}
function Peak({ height, max, name, w = 90 }: { height: number; max: number; name: string; w?: number }) {
  const h = 30 + (height / max) * 80;
  return <figure className="flex flex-col items-center gap-0.5" aria-label={`${name} tingginya ${fmt(height)} mdpl`}>
    <span className="rounded bg-white px-1.5 text-sm font-extrabold ring-1 ring-base-300">{fmt(height)} mdpl</span>
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true"><path d={`M2 ${h}L${w / 2} 4L${w - 2} ${h}z`} fill="#6b8e4e" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" /><path d={`M${w / 2} 4L${w / 2 - 12} ${4 + h * 0.2}l6 -4 6 6 6 -6 6 4z`} fill="#fff" stroke={ink} strokeWidth="1" strokeLinejoin="round" /></svg>
    <figcaption className="text-xs font-bold">{name}</figcaption>
  </figure>;
}
function Receipt({ lines, total }: { lines: [string, number][]; total: number }) {
  return <figure className="w-48 rounded-sm border border-base-300 bg-white px-3 py-2 font-mono text-sm shadow-sm" aria-label={`Struk belanja, total Rp${fmt(total)}`}>
    <p className="text-center font-bold">MINIMARKET</p><hr className="my-1 border-dashed border-base-300" />
    {lines.map(([k, v]) => <p key={k} className="flex justify-between"><span>{k}</span><span>{fmt(v)}</span></p>)}
    <hr className="my-1 border-dashed border-base-300" /><p className="flex justify-between font-extrabold"><span>TOTAL</span><span>{fmt(total)}</span></p>
  </figure>;
}
/** Benda yang dikelompokkan atau dibagi. */
function ThingArt({ thing, size = 22 }: { thing: Thing; size?: number }) {
  switch (thing) {
    case "donat": return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="#d9a066" stroke={ink} /><path d="M3 9c1-5 13-6 14 0-2 2-4 0-5 2s-3 0-4 1-4-1-5-3z" fill="#e86aa0" /><circle cx="10" cy="10" r="2.6" fill="#fff" stroke={ink} strokeWidth=".8" /></svg>;
    case "pensil": return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true"><g transform="rotate(-45 10 10)"><rect x="2" y="8" width="12" height="4" fill="#f5c518" stroke={ink} strokeWidth=".8" /><path d="M14 8l4 2-4 2z" fill="#f1d6a8" stroke={ink} strokeWidth=".8" /><rect x="0" y="8" width="2.4" height="4" fill="#f08aa0" stroke={ink} strokeWidth=".8" /></g></svg>;
    case "botol": return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true"><rect x="8" y="1" width="4" height="3" fill="#2f6fcf" /><path d="M7 4h6l1 3v11a1 1 0 01-1 1H7a1 1 0 01-1-1V7z" fill="#cfe9f7" stroke={ink} strokeWidth=".8" /><rect x="6" y="9" width="8" height="4" fill="#2f6fcf" opacity=".7" /></svg>;
    case "permen": return <svg viewBox="0 0 24 14" width={size} height={size * 0.6} aria-hidden="true"><path d="M1 2l5 5-5 5zM23 2l-5 5 5 5z" fill="#e5484d" stroke={ink} strokeWidth=".7" /><ellipse cx="12" cy="7" rx="6.5" ry="5" fill="#e5484d" stroke={ink} strokeWidth=".7" /></svg>;
    case "gantungan": return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true"><circle cx="6" cy="5" r="3.5" fill="none" stroke="#7a838c" strokeWidth="1.4" /><path d="M8 7l3 3" stroke="#7a838c" strokeWidth="1.4" /><rect x="9" y="9" width="9" height="9" rx="2" fill="#3f9b45" stroke={ink} strokeWidth=".8" /></svg>;
  }
}
/** Wadah satu kelompok: kotak donat, pak pensil, karton botol, bungkus permen. */
function GroupBox({ thing, per }: { thing: Thing; per: number }) {
  const shown = Math.min(per, thing === "donat" ? per : 4);
  return <span className="inline-flex flex-col items-center rounded-md border-2 border-[#b07a3c] bg-[#f6e6c8] px-1 py-0.5" aria-hidden="true">
    <span className={`grid gap-0.5 ${per === 4 ? "grid-cols-2" : "grid-cols-2"}`}>{Array.from({ length: shown }, (_, i) => <ThingArt key={i} thing={thing} size={14} />)}</span>
    {per !== shown && <span className="text-[10px] font-extrabold leading-none">isi {per}</span>}
  </span>;
}
const thingName: Record<Thing, string> = { donat: "donat", pensil: "pensil", botol: "botol", permen: "permen", gantungan: "gantungan kunci" };
function Blocks({ d, size = 1 }: { d: number[]; size?: number }) {
  const s = (n: number) => n * size;
  const art = [
    (k: number) => <svg key={`r${k}`} viewBox="0 0 34 34" width={s(34)} height={s(34)} aria-hidden="true"><path d="M2 10l10-8h20v22l-10 8H2z" fill="#9cc0f0" stroke={ink} /><path d="M2 10h20v22M22 10l10-8" fill="none" stroke={ink} /></svg>,
    (k: number) => <svg key={`h${k}`} viewBox="0 0 30 30" width={s(28)} height={s(28)} aria-hidden="true"><rect x="1" y="1" width="28" height="28" fill="#f6c27c" stroke={ink} />{[1, 2, 3, 4].map(i => <path key={i} d={`M${1 + i * 5.6} 1v28M1 ${1 + i * 5.6}h28`} stroke={ink} strokeWidth=".4" />)}</svg>,
    (k: number) => <svg key={`t${k}`} viewBox="0 0 7 30" width={s(7)} height={s(28)} aria-hidden="true"><rect x=".5" y=".5" width="6" height="29" fill="#93d18a" stroke={ink} />{[1, 2, 3, 4].map(i => <path key={i} d={`M.5 ${i * 5.8}h6`} stroke={ink} strokeWidth=".4" />)}</svg>,
    (k: number) => <svg key={`o${k}`} viewBox="0 0 7 7" width={s(7)} height={s(7)} aria-hidden="true"><rect x=".5" y=".5" width="6" height="6" fill="#f28b8b" stroke={ink} /></svg>,
  ];
  return <div className="flex flex-wrap items-end justify-center gap-2" role="img" aria-label={`Balok: ${d.map((x, i) => `${x} ${places[i].toLowerCase()}`).join(", ")}`}>{d.map((x, i) => x > 0 && <span key={i} className="flex max-w-36 flex-wrap items-end gap-0.5">{Array.from({ length: x }, (_, k) => art[i](k))}</span>)}</div>;
}
const Card = ({ d }: { d: number }) => <span className="grid h-12 w-9 place-items-center rounded-lg border-2 border-sky-300 bg-sky-50 text-2xl font-extrabold">{d}</span>;

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Box({ value, onChange, label, disabled = false, size = 4 }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; size?: number }) {
  const w = size >= 4 ? "w-24" : size >= 3 ? "w-20" : "w-14";
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl`} />;
}
function Stepper({ label, value, set, min, max, color }: { label: string; value: number; set: (n: number) => void; min: number; max: number; color?: string }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold" style={color ? { color } : undefined}>{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
      <span className="min-w-6 text-center text-lg font-extrabold tabular-nums">{value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button></span>
  </span>;
}
function PvTable({ cell, mark }: { cell: (i: number) => ReactNode; mark?: number }) {
  return <div className="inline-grid grid-cols-4 overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center">
    {places.map((p, i) => <span key={p} className="border-b-2 border-sky-300 bg-sky-50 px-1.5 py-0.5 text-xs font-bold" style={{ color: placeColors[i] }}>{p}</span>)}
    {places.map((p, i) => <span key={p} className={`grid min-h-12 min-w-14 place-items-center px-0.5 text-2xl font-extrabold ${mark === i ? "bg-error/10 text-error" : ""}`}>{cell(i)}</span>)}
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function DigitDials({ d, setD, pick, setPick }: { d: number[]; setD: (d: number[]) => void; pick?: number | null; setPick?: (i: number) => void }) {
  return <div className="flex flex-wrap justify-center gap-2">{d.map((x, i) => <div key={i} className="flex flex-col items-center gap-0.5">
    <button type="button" aria-label={`${places[i]} tambah`} className="btn btn-xs btn-square btn-outline" disabled={x >= 9} onClick={() => setD(d.map((y, j) => (j === i ? y + 1 : y)))}><Plus className="size-3.5" aria-hidden="true" /></button>
    <button type="button" aria-label={`Pilih ${places[i]}`} aria-pressed={pick === i} onClick={() => setPick?.(i)} className={`grid h-16 w-14 place-items-center rounded-xl border-2 text-4xl font-extrabold ${pick === i ? "border-error bg-error/10" : "border-sky-300 bg-sky-50"}`} style={{ color: placeColors[i] }}>{x}</button>
    <button type="button" aria-label={`${places[i]} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={x <= (i === 0 ? 1 : 0)} onClick={() => setD(d.map((y, j) => (j === i ? y - 1 : y)))}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="text-[11px] font-bold" style={{ color: placeColors[i] }}>{places[i]}</span>
  </div>)}</div>;
}
const value4 = (d: number[]) => d.reduce((a, x, i) => a + x * placeValue[i], 0);
function ReadLab() {
  const [d, setD] = useState([3, 2, 8, 6]);
  const n = value4(d);
  return <div className="space-y-3">
    <div className="rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.15]"><DigitDials d={d} setD={setD} /></div>
    <p className="text-center text-4xl font-extrabold text-success">{fmt(n)}</p>
    <p className="text-center text-sm font-semibold">{d.map((x, i) => <span key={i} className="me-1 inline-block rounded px-1" style={{ background: `${placeColors[i]}22`, color: placeColors[i] }}>{x === 0 ? `${places[i].toLowerCase()} 0 tidak dibaca` : `${x} ${places[i].toLowerCase()}`}</span>)}</p>
    <Result value={String(n)}>Dibaca <strong>{reading(n).toLowerCase()}</strong>. Angka 0 tidak dibaca, dan angka 1 di ribuan dibaca seribu.</Result>
  </div>;
}
function BlocksLab() {
  const [d, setD] = useState([2, 1, 5, 0]), [pick, setPick] = useState<number | null>(null);
  const n = value4(d);
  return <div className="space-y-3">
    <div className="rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.1]"><DigitDials d={d} setD={setD} pick={pick} setPick={setPick} /></div>
    <div className="min-h-16 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.7]"><Blocks d={d} /></div>
    <Result value={pick === null ? String(n) : `${n}:${pick}`}><strong>{fmt(n)}</strong> = {d.map((x, i) => fmt(x * placeValue[i])).join(" + ")}.{pick !== null && <> Angka {d[pick]} di tempat {places[pick].toLowerCase()} bernilai <strong>{fmt(d[pick] * placeValue[pick])}</strong>.</>}</Result>
  </div>;
}
const pairs: [number, number][] = [[8750, 7500], [4352, 4365], [4352, 4355], [4352, 4352], [9999, 9998]];
const sign = (a: number, b: number) => (a < b ? "<" : a > b ? ">" : "=");
function CompareLab() {
  const [k, setK] = useState(0), [pick, setPick] = useState<string | null>(null);
  const [a, b] = pairs[k], da = digits4(a), db = digits4(b), at = da.findIndex((x, i) => x !== db[i]), ok = pick === sign(a, b);
  const row = (n: number, d: number[]) => <div className="contents"><span className="grid place-items-center border-t border-sky-200 px-1.5 text-lg font-extrabold">{fmt(n)}</span>
    {d.map((x, i) => <span key={i} className={`grid min-h-11 place-items-center border-s border-t border-sky-200 text-2xl font-extrabold ${pick && i === at ? "bg-error/10 text-error" : ""}`}>{x}</span>)}</div>;
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Pasangan {k + 1} dari {pairs.length}. Pilih tanda yang tepat.</p>
    <div className="flex flex-col items-center gap-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.15]">
      <div className="grid grid-cols-[auto_repeat(4,minmax(2.6rem,1fr))] overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center">
        <span className="px-1 text-[10px] font-bold">Bilangan</span>{places.map((p, i) => <span key={p} className="border-s border-sky-200 px-0.5 text-[10px] font-bold" style={{ color: placeColors[i] }}>{p}</span>)}
        {row(a, da)}{row(b, db)}
      </div>
      <p className="text-3xl font-extrabold">{fmt(a)} <span className="inline-grid size-11 place-items-center rounded-full border-4 border-orange-300 bg-white align-middle">{pick ?? "…"}</span> {fmt(b)}</p>
    </div>
    <div className="flex flex-wrap gap-2">{["<", ">", "="].map(x => <button key={x} type="button" aria-label={`Tanda ${x}`} aria-pressed={pick === x} onClick={() => setPick(x)} className={`btn w-14 text-3xl ${pick === x ? (ok ? "btn-success" : "btn-error") : "btn-outline"}`}>{x}</button>)}
      <button type="button" className="btn btn-outline gap-1 ms-auto" onClick={() => { setK((k + 1) % pairs.length); setPick(null); }}>Berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button></div>
    <Result value={pick ? `${k}|${ok ? "ok" : "no"}` : `${k}|`}>{!pick ? "Bandingkan mulai dari ribuan." : ok ? (at < 0 ? `Tepat. Semua angkanya sama, jadi ${fmt(a)} = ${fmt(b)}.` : `Tepat. Tempat pertama yang berbeda adalah ${places[at].toLowerCase()}: ${da[at]} dan ${db[at]}.`) : "Belum tepat. Cari kolom pertama dari kiri yang angkanya berbeda."}</Result>
  </div>;
}
const noteVals: Note[] = [2000, 1000, 500, 100];
function MoneyLab() {
  const [k, setK] = useState([3, 1, 0, 3]), [ways, setWays] = useState<string[]>([]);
  const target = 7300, total = k.reduce((a, x, i) => a + x * noteVals[i], 0), key = k.join("-");
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2">{noteVals.map((v, i) => <Stepper key={v} label={`Rp${fmt(v)}`} value={k[i]} set={x => setK(k.map((y, j) => (j === i ? x : y)))} min={0} max={8} />)}</div>
    <div className="flex min-h-16 flex-wrap items-end justify-center gap-3 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]">{noteVals.map((v, i) => k[i] > 0 && <MoneyStack key={v} value={v} count={k[i]} />)}</div>
    <p className="text-center text-lg font-bold">{noteVals.map((v, i) => fmt(k[i] * v)).join(" + ")} = <span className="text-2xl text-success">{fmt(total)}</span></p>
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold">Harga makanan ringan Rp{fmt(target)}</span>
      <button type="button" className="btn btn-sm btn-success" disabled={total !== target || ways.includes(key)} onClick={() => setWays([...ways, key])}>Catat cara ini</button></div>
    <Result value={`${total}|${ways.length}`}>{total === target ? "Pas!" : total < target ? `Kurang Rp${fmt(target - total)}.` : `Lebih Rp${fmt(total - target)}.`} {ways.length ? `Sudah ${ways.length} cara dicatat. Cara dengan uang paling sedikit memakai uang terbesar lebih dulu.` : "Coba temukan beberapa cara membayar dengan pas."}</Result>
  </div>;
}
function columnSteps(nums: number[], op: "+" | "−") {
  const ds = nums.map(digits4), out: number[] = Array(4).fill(0), marks: string[] = Array(4).fill(""), notes: string[] = [];
  let carry = 0;
  for (let i = 3; i >= 1; i--) {
    if (op === "+") { const s = ds.reduce((a, d) => a + d[i], 0) + carry; out[i] = s % 10; notes.push(`${places[i]}: ${ds.map(d => d[i]).join(" + ")}${carry ? ` + ${carry}` : ""} = ${s}${s >= 10 ? `, tulis ${s % 10} simpan ${Math.floor(s / 10)}` : ""}`); carry = Math.floor(s / 10); if (carry) marks[i - 1] = String(carry); }
    else { let top = ds[0][i] - carry; carry = 0; if (top < ds[1][i]) { top += 10; carry = 1; marks[i - 1] = "−1"; } out[i] = top - ds[1][i]; notes.push(`${places[i]}: ${top} − ${ds[1][i]} = ${out[i]}${carry ? " (ambil 1 dari kiri)" : ""}`); }
  }
  out[0] = carry;
  return { out, marks, notes };
}
function StepColumn({ problems }: { problems: { nums: number[]; op: "+" | "−" }[] }) {
  const [k, setK] = useState(0), [step, setStep] = useState(0);
  const p = problems[k], { out, marks, notes } = columnSteps(p.nums, p.op), res = p.op === "+" ? p.nums.reduce((a, b) => a + b, 0) : p.nums[0] - p.nums[1];
  const shown = (i: number) => 3 - i < step;
  return <div className="space-y-3">
    <div className="grid grid-cols-[repeat(3,2.8rem)_1.5rem] justify-center gap-x-1 rounded-xl bg-base-100 p-2 text-center font-mono text-3xl font-extrabold [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.2]" role="group" aria-label={p.nums.map(fmt).join(` ${p.op} `)}>
      {places.slice(1).map((pl, i) => <span key={pl} className="font-sans text-[10px] font-bold" style={{ color: placeColors[i + 1] }}>{pl}</span>)}<span />
      {marks.slice(1).map((m, i) => <span key={i} className="h-5 text-sm leading-5 text-error">{m && shown(i + 2) ? m : ""}</span>)}<span />
      {p.nums.map((n, r) => <div key={r} className="contents">{digits4(n).slice(1).map((x, i) => <span key={i}>{n >= [100, 10, 1][i] || i === 2 ? x : ""}</span>)}<span>{r === p.nums.length - 1 ? p.op : ""}</span></div>)}
      <span className="col-span-4 h-0.5 bg-neutral" />
      {out.slice(1).map((x, i) => <span key={i} className={shown(i + 1) ? "text-success" : "text-transparent"}>{x}</span>)}<span />
    </div>
    {out[0] > 0 && step >= 3 && <p className="text-center text-sm font-semibold">Simpanan terakhir menjadi ribuan: hasilnya {fmt(res)}.</p>}
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-success" disabled={step >= 3} onClick={() => setStep(step + 1)}>Langkah berikutnya</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setStep(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setK((k + 1) % problems.length); setStep(0); }}><Shuffle className="size-4" aria-hidden="true" />Soal lain</button></div>
    <Result value={step >= 3 ? String(res) : `l${step}`}>{step === 0 ? "Mulai dari satuan, kolom paling kanan." : step >= 3 ? <>Selesai: <strong>{p.nums.map(fmt).join(` ${p.op} `)} = {fmt(res)}</strong>. {notes[2]}.</> : notes[step - 1]}</Result>
  </div>;
}
const AddLab = () => <StepColumn problems={[{ nums: [189, 245], op: "+" }, { nums: [373, 208], op: "+" }, { nums: [124, 411, 363], op: "+" }]} />;
const SubLab = () => <StepColumn problems={[{ nums: [241, 175], op: "−" }, { nums: [253, 176], op: "−" }, { nums: [265, 132], op: "−" }]} />;
function MultLab() {
  const [g, setG] = useState(12), [per, setPer] = useState(4);
  const tens = Math.floor(g / 10) * 10, rest = g - tens;
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Banyak kotak" value={g} set={setG} min={1} max={15} /><Stepper label="Isi tiap kotak" value={per} set={setPer} min={2} max={6} /></div>
    <div className="flex max-w-md flex-wrap justify-center gap-1 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.7] lg:[zoom:1.1]" role="img" aria-label={`${g} kotak, masing-masing ${per} donat`}>{Array.from({ length: g }, (_, i) => <span key={i} className={i < tens ? "rounded ring-2 ring-sky-300" : "rounded ring-2 ring-orange-300"}><GroupBox thing="donat" per={per} /></span>)}</div>
    <p className="text-center text-lg font-bold">{tens && rest ? `${g} × ${per} = (${tens} × ${per}) + (${rest} × ${per}) = ${tens * per} + ${rest * per} = ` : `${g} × ${per} = `}<span className="text-2xl text-success">{g * per}</span></p>
    <Result value={String(g * per)}><strong>{g} kotak × {per} donat = {g * per} donat</strong>. {tens && rest ? `Kotak bergaris biru (${tens}) dihitung dulu, lalu kotak bergaris oranye (${rest}).` : "Sama dengan menjumlahkan isi kotak berulang-ulang."}</Result>
  </div>;
}
function ShareLab() {
  const [n, setN] = useState(48), [to, setTo] = useState(4);
  const q = Math.floor(n / to), r = n % to;
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Permen" value={n} set={setN} min={10} max={60} /><Stepper label="Wadah" value={to} set={setTo} min={2} max={8} /></div>
    <div className="flex flex-wrap justify-center gap-1.5 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.7] lg:[zoom:1.1]">{Array.from({ length: to }, (_, i) => <figure key={i} className="flex w-16 flex-col items-center rounded-lg border-2 border-sky-300 bg-sky-50 p-1"><div className="flex flex-wrap justify-center gap-px">{Array.from({ length: q }, (_, k) => <ThingArt key={k} thing="permen" size={12} />)}</div><figcaption className="text-xs font-extrabold">{q}</figcaption></figure>)}
      {r > 0 && <figure className="flex w-16 flex-col items-center rounded-lg border-2 border-dashed border-error/60 p-1"><div className="flex flex-wrap justify-center gap-px">{Array.from({ length: r }, (_, k) => <ThingArt key={k} thing="permen" size={12} />)}</div><figcaption className="text-xs font-extrabold text-error">sisa {r}</figcaption></figure>}</div>
    <Result value={`${q}|${r}`}><strong>{n} : {to} = {q}{r ? ` sisa ${r}` : ""}</strong>. Periksa: {q} × {to}{r ? ` + ${r}` : ""} = {n}.{r ? " Permen tidak habis dibagi." : " Permen habis dibagi, sisanya 0."}</Result>
  </div>;
}
function FactorLab() {
  const [mode, setMode] = useState<"faktor" | "kelipatan">("faktor"), [n, setN] = useState(12), [b, setB] = useState(3), [sel, setSel] = useState(1);
  const fs = Array.from({ length: n }, (_, i) => i + 1).filter(d => n % d === 0), pairsF = fs.filter(d => d * d <= n), mul = Array.from({ length: 50 }, (_, i) => i + 1).filter(x => x % b === 0);
  const a = pairsF[Math.min(sel, pairsF.length - 1)] ?? 1, c = n / a;
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Cara" className="flex gap-1.5">{(["faktor", "kelipatan"] as const).map(m => <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`btn btn-sm ${mode === m ? "btn-success" : "btn-outline"}`}>{m === "faktor" ? "Faktor" : "Kelipatan"}</button>)}</div>
    {mode === "faktor" ? <>
      <div className="flex flex-wrap items-end justify-around gap-2"><Stepper label="Bilangan" value={n} set={x => { setN(x); setSel(0); }} min={2} max={48} />
        <div role="radiogroup" aria-label="Pasangan faktor" className="flex flex-wrap gap-1">{pairsF.map((d, i) => <button key={d} type="button" role="radio" aria-checked={a === d} onClick={() => setSel(i)} className={`btn btn-xs ${a === d ? "btn-success" : "btn-outline"}`}>{d} × {n / d}</button>)}</div></div>
      <div className="flex justify-center rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.75]"><div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${c}, 0.9rem)` }} role="img" aria-label={`${a} baris, ${c} kolom`}>{Array.from({ length: n }, (_, i) => <span key={i} className="size-3.5 rounded-sm bg-sky-500" />)}</div></div>
      <Result value={`f:${n}:${fs.length}`}>Faktor {n}: <strong>{fs.join(", ")}</strong>. Susunan {a} baris × {c} kolom = {n}.{fs.length === 2 ? ` ${n} hanya punya dua faktor.` : ""}</Result>
    </> : <>
      <div className="flex justify-center"><Stepper label="Kelipatan dari" value={b} set={setB} min={2} max={9} /></div>
      <div className="mx-auto grid max-w-xs grid-cols-10 gap-0.5 [@media(max-height:700px)]:[zoom:0.8]">{Array.from({ length: 50 }, (_, i) => i + 1).map(x => <span key={x} className={`grid h-7 place-items-center rounded text-xs font-bold ${x % b === 0 ? "bg-success text-success-content" : "bg-base-100 text-base-content/50"}`}>{x}</span>)}</div>
      <Result value={`k:${b}:${mul.length}`}>Kelipatan {b} sampai 50: <strong>{mul.join(", ")}</strong>. Setiap bilangan bertambah {b}.</Result>
    </>}
  </div>;
}
const labs: Record<string, () => ReactNode> = { read: ReadLab, blocks: BlocksLab, compare: CompareLab, money: MoneyLab, add: AddLab, sub: SubLab, mult: MultLab, share: ShareLab, factor: FactorLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "gauge": return <Gauge value={scene.value} />;
    case "mountain": return <Peak height={scene.height} max={scene.height} name={scene.name} w={150} />;
    case "mountains": { const max = Math.max(...scene.peaks.map(p => p.height)); return <div className="flex items-end justify-center gap-2">{scene.peaks.map(p => <Peak key={p.name} {...p} max={max} />)}</div>; }
    case "receipt": return <Receipt lines={scene.lines} total={scene.total} />;
    case "money": return <div className="flex flex-wrap items-end justify-center gap-3">{scene.notes.map(n => <MoneyStack key={n.value} value={n.value} count={n.count} />)}</div>;
    case "groups": return <figure className="flex flex-col items-center gap-1" aria-label={`${scene.groups} ${scene.label}, masing-masing ${scene.per} ${thingName[scene.thing]}`}><div className="flex max-w-sm flex-wrap justify-center gap-1">{Array.from({ length: scene.groups }, (_, i) => <GroupBox key={i} thing={scene.thing} per={scene.per} />)}</div><figcaption className="text-sm font-bold">{scene.groups} {scene.label}, setiap {scene.label} berisi {scene.per} {thingName[scene.thing]}</figcaption></figure>;
    case "share": return <figure className="flex flex-col items-center gap-1" aria-label={`${scene.total} ${thingName[scene.thing]} untuk ${scene.to} ${scene.label}`}><div className="flex max-w-xs flex-wrap justify-center gap-0.5">{Array.from({ length: scene.total }, (_, i) => <ThingArt key={i} thing={scene.thing} size={16} />)}</div><figcaption className="text-sm font-bold">{scene.total} {thingName[scene.thing]} untuk {scene.to} {scene.label}</figcaption></figure>;
    case "days": return <div className="flex flex-wrap justify-center gap-1" role="img" aria-label={`${scene.name} membeli ${scene.per} kelereng setiap hari`}>{Array.from({ length: scene.days }, (_, i) => <figure key={i} className="flex w-11 flex-col items-center rounded-lg border-2 border-sky-200 bg-white p-0.5"><figcaption className="text-[10px] font-bold">Hari {i + 1}</figcaption><div className="flex min-h-8 flex-wrap justify-center gap-px">{i < scene.show ? Array.from({ length: (i + 1) * scene.per }, (_, k) => <span key={k} className="size-1.5 rounded-full bg-violet-500" />) : <span className="text-lg font-extrabold text-base-content/40">?</span>}</div><span className="text-xs font-extrabold">{i < scene.show ? (i + 1) * scene.per : "…"}</span></figure>)}</div>;
    case "cards": return <div className="flex gap-1.5">{scene.digits.map(d => <Card key={d} d={d} />)}</div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = cells(p, value), n = p.left.length, m = p.right.length, H = 1000;
  return <div className="space-y-1.5">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk kotak di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_1.5rem_minmax(0,1.3fr)] sm:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1.3fr)]" style={{ minHeight: Math.max(n, m) * 40 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${l}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-1.5 py-1 text-sm font-bold leading-snug [@media(max-height:700px)]:py-0.5 [@media(max-height:700px)]:text-xs ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}>{l}</button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-sm font-bold leading-snug [@media(max-height:700px)]:py-0.5 [@media(max-height:700px)]:text-xs">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
const digitInput = (label: string, value: string, onChange: (v: string) => void, disabled: boolean) => <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(-1))} className="mx-auto h-11 w-10 rounded-lg border-2 border-orange-400 bg-white text-center text-2xl font-extrabold focus:border-success focus:outline-none" />;
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      const lead = (k: number) => (k > 0 ? (bits[k].match(/^[,.)]+/)?.[0] ?? "") : ""), body = (k: number) => bits[k].slice(lead(k).length).trim();
      return <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-lg font-bold leading-10 sm:text-xl [@media(max-height:700px)]:gap-y-1 [@media(max-height:700px)]:leading-8">{bits.map((_, k) => <span key={k} className="contents">{body(k) && <span>{body(k)}</span>}{k < bits.length - 1 && <span className="inline-flex items-end"><Box label={`Bagian ${i + 1} kotak ${k + 1}`} size={String(p.answers[k]).length} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{lead(k + 1)}</span>}</span>)}</p>; }
    case "choice": { const sym = p.options[0] === "<";
      return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold [@media(max-height:700px)]:text-base">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 font-bold ${sym ? "min-h-11 min-w-14 px-3 text-3xl" : "min-h-10 px-3 text-base sm:text-lg"} ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>; }
    case "rank": { const seq = value ? value.split("|").map(Number) : [];
      return <div className="space-y-1.5"><p className="text-lg font-bold [@media(max-height:700px)]:text-base">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={k} type="button" aria-label={`Pilih ${it.label}`} disabled={checked || seq.includes(k)} onClick={() => set([...seq, k].join("|"))} className="btn btn-outline px-2.5 text-base sm:text-lg">{it.label}</button>)}</div>
        <div className="flex flex-wrap items-center gap-1">{p.items.map((_, k) => <span key={k} className="grid h-9 min-w-14 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1.5 text-sm font-extrabold">{seq[k] !== undefined ? p.items[seq[k]].label : k + 1}</span>)}
          <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join("|"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div>
      </div>; }
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "pv": { let k = 0; const d = digits4(p.n);
      return <PvTable cell={j => { if (!p.hide[j]) return d[j]; const idx = k++; return <input aria-label={places[j]} inputMode="numeric" value={x[idx]} disabled={checked} placeholder="…" onChange={e => put(idx, e.target.value.replace(/\D/g, "").slice(-1))} className="h-10 w-10 rounded-lg border-2 border-orange-400 bg-white text-center text-2xl font-extrabold focus:border-success focus:outline-none" />; }} />; }
    case "column": { const res = String(columnResult(p)), w = Math.max(res.length, ...p.nums.map(n => String(n).length)), pad = w - res.length, cols = places.slice(4 - w);
      return <div className="inline-grid gap-x-1 text-center font-mono text-2xl font-extrabold sm:text-3xl" style={{ gridTemplateColumns: `repeat(${w}, 2.6rem) 1.5rem` }} role="group" aria-label={p.nums.map(fmt).join(` ${p.op} `)}>
        {cols.map(pl => <span key={pl} className="font-sans text-[10px] font-bold" style={{ color: placeColors[places.indexOf(pl)] }}>{pl}</span>)}<span />
        {p.nums.map((n, r) => <div key={r} className="contents">{String(n).padStart(w, " ").split("").map((c, j) => <span key={j}>{c.trim()}</span>)}<span>{r === p.nums.length - 1 ? p.op : ""}</span></div>)}
        <span className="col-span-full h-0.5 bg-neutral" />
        {Array.from({ length: pad }, (_, j) => <span key={`p${j}`} />)}{x.map((c, j) => <span key={j}>{digitInput(`Hasil angka ${j + 1}`, c, v => put(j, v), checked)}</span>)}<span />
      </div>; }
    case "div": { const q = String(p.a / p.b), a = String(p.a), pad = a.length - q.length;
      return <div className="inline-grid gap-x-1 text-center font-mono text-2xl font-extrabold sm:text-3xl" style={{ gridTemplateColumns: `2.2rem 0.8rem repeat(${a.length}, 2.6rem)` }} role="group" aria-label={`${p.a} dibagi ${p.b}`}>
        <span /><span />{Array.from({ length: pad }, (_, j) => <span key={`p${j}`} />)}{x.map((c, j) => <span key={j}>{digitInput(`Hasil bagi angka ${j + 1}`, c, v => put(j, v), checked)}</span>)}
        <span className="self-center">{p.b}</span><span className="self-stretch border-e-4 border-neutral" style={{ borderTopRightRadius: 12 }} />{a.split("").map((c, j) => <span key={j} className="border-t-4 border-neutral pt-1">{c}</span>)}
        <span className="col-span-full pt-1 font-sans text-xs font-semibold text-base-content/60">pembagi di kiri, yang dibagi di dalam, hasil bagi di atas</span>
      </div>; }
    case "multi": { const on = value ? value.split("|").map(Number) : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-pressed={on.includes(o)} disabled={checked} onClick={() => set((on.includes(o) ? on.filter(y => y !== o) : [...on, o]).join("|"))} className={`min-h-10 min-w-12 rounded-full border-4 px-2 text-lg font-extrabold ${on.includes(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Pilih semua yang benar. Ketuk lagi untuk membatalkan.</p></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: WQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFourWhole10k() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[0], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Bilangan Cacah sampai 10.000</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Baca, tulis, bandingkan, susun, dan urai bilangan empat angka, lalu jumlahkan, kurangkan, kalikan, bagi, dan temukan faktor serta kelipatannya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><Blocks d={[1, 2, 3, 4]} size={1.1} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Belanja ke minimarket bersama Helen</h2>
        <p className="mt-2 text-sm">Harga minuman Rp6.750, jarak rumah ke minimarket 3.286 meter. Bilangan empat angka ada di mana-mana. Ayo membaca, membandingkan, dan menghitungnya.</p>
        <p className="mt-2 text-sm text-base-content/60">9 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bilangan-10000">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bilangan-10000" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {s.title}</h2>
            <p className="mt-1 text-sm text-base-content/60">{t.title}</p>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<WQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.65]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
