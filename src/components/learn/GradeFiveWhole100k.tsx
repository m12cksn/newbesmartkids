"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw, Shuffle, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { ThingIcon } from "./GradeOneCounting10Art";
import {
  assessment, cells, columnResult, correct, digits5, fmt, formatAnswer, placeValue, places, practice, reading, ready, SEP, splitParts, topics,
  type Item, type NQuestion, type Note, type Part, type Scene,
} from "@/data/grade-five-whole-100k";

const placeColors = ["#7c3aed", "#3f9b45", "#2f86d6", "#d97706", "#e23d3d"];
const ink = "#2b2320";

/* ====================================================================== */
/* Gambar                                                                  */
/* ====================================================================== */
const noteStyle: Record<Note, { fill: string; dark: string }> = { 20000: { fill: "#9fd8b8", dark: "#2f7d55" }, 10000: { fill: "#c9b4ec", dark: "#6b45b0" }, 5000: { fill: "#e8cf9a", dark: "#946b1f" }, 2000: { fill: "#b9d3ee", dark: "#3d6b9e" }, 1000: { fill: "#bfe3e6", dark: "#3a8a91" }, 100: { fill: "#d7dbe0", dark: "#7a838c" } };
/** Uang kertas atau koin (gambar sederhana, bukan tiruan uang asli). */
export function Money({ value, w = 64 }: { value: Note; w?: number }) {
  const s = noteStyle[value];
  if (value === 100) return <svg viewBox="0 0 40 40" width={w * 0.5} height={w * 0.5} aria-hidden="true"><circle cx="20" cy="20" r="18" fill={s.fill} stroke={s.dark} strokeWidth="2" /><circle cx="20" cy="20" r="13.5" fill="none" stroke={s.dark} strokeWidth=".8" /><text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>100</text></svg>;
  return <svg viewBox="0 0 96 48" width={w} height={w / 2} aria-hidden="true">
    <rect x="1" y="1" width="94" height="46" rx="4" fill={s.fill} stroke={s.dark} strokeWidth="2" />
    <rect x="6" y="6" width="84" height="36" rx="2" fill="none" stroke={s.dark} strokeWidth=".8" />
    <circle cx="22" cy="24" r="10" fill="#fff" opacity=".55" stroke={s.dark} strokeWidth=".8" />
    <text x="60" y="30" textAnchor="middle" fontSize="16" fontWeight="800" fill={ink}>{fmt(value)}</text>
  </svg>;
}
function MoneyStack({ value, count, w = 56 }: { value: Note; count: number; w?: number }) {
  return <figure className="flex flex-col items-center gap-0.5" aria-label={`${count} ${value === 100 ? "keping" : "lembar"} ${fmt(value)}`}>
    <div className="relative" style={{ height: value === 100 ? w * 0.5 + Math.min(count, 6) * 3 : w / 2 + Math.min(count, 6) * 3, width: w + Math.min(count, 6) * 3 }}>
      {Array.from({ length: Math.min(count, 6) }, (_, i) => <span key={i} className="absolute" style={{ left: i * 3, top: i * 3 }}><Money value={value} w={w} /></span>)}
    </div>
    <figcaption className="text-xs font-bold">{count} {value === 100 ? "keping" : "lembar"}</figcaption>
  </figure>;
}
function Envelope({ value, size = 40 }: { value?: number; size?: number }) {
  return <svg viewBox="0 0 40 52" width={size * 0.77} height={size} aria-hidden="true">
    <rect x="2" y="2" width="36" height="48" rx="3" fill="#d6282d" stroke="#8f1418" strokeWidth="1.5" />
    <path d="M2 12l18 10 18-10" fill="none" stroke="#f2c230" strokeWidth="1.5" />
    <circle cx="20" cy="31" r="6" fill="#f2c230" />
    {value ? <text x="20" y="46" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff">{fmt(value)}</text> : null}
  </svg>;
}
function ItemArt({ item, size = 44 }: { item: Item; size?: number }) {
  if (item === "buku" || item === "pensil") return <ThingIcon thing={item} className="size-11" />;
  const art: Record<Exclude<Item, "buku" | "pensil">, ReactNode> = {
    obat: <><rect x="16" y="4" width="16" height="8" rx="1.5" fill="#2f86d6" stroke={ink} /><path d="M14 12h20l3 6v24a4 4 0 01-4 4H15a4 4 0 01-4-4V18z" fill="#8a4b20" stroke={ink} /><rect x="13" y="22" width="22" height="14" rx="1.5" fill="#fff" stroke={ink} strokeWidth=".8" /><path d="M18 29h12M24 25v8" stroke="#e23d3d" strokeWidth="2.4" /></>,
    termos: <><rect x="15" y="3" width="18" height="6" rx="2" fill="#555" stroke={ink} /><path d="M13 9h22v34a4 4 0 01-4 4H17a4 4 0 01-4-4z" fill="#d6282d" stroke={ink} /><rect x="13" y="18" width="22" height="3" fill="#fff" opacity=".6" /><path d="M35 15c5 0 5 14 0 14" fill="none" stroke={ink} strokeWidth="2" /></>,
    tas: <><path d="M15 16c0-8 18-8 18 0" fill="none" stroke={ink} strokeWidth="2.2" /><rect x="7" y="16" width="34" height="28" rx="5" fill="#2f8f5b" stroke={ink} /><rect x="14" y="27" width="20" height="10" rx="2" fill="#4caf7d" stroke={ink} strokeWidth=".8" /></>,
    dakon: <><ellipse cx="24" cy="24" rx="23" ry="12" fill="#a8672e" stroke={ink} />{[0, 1].map(r => [0, 1, 2, 3, 4].map(c => <circle key={`${r}${c}`} cx={10 + c * 7} cy={20 + r * 8} r="2.6" fill="#6b3d17" />))}<circle cx="4.5" cy="24" r="3" fill="#6b3d17" /><circle cx="43.5" cy="24" r="3" fill="#6b3d17" /></>,
  };
  return <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">{art[item]}</svg>;
}
function Tag({ item, price, name, small }: { item: Item; price: number; name: string; small?: boolean }) {
  return <figure className="flex flex-col items-center gap-0.5" aria-label={`${name} harga Rp${fmt(price)}`}>
    <ItemArt item={item} size={small ? 36 : 44} />
    <span className={`rounded-md border-2 border-amber-400 bg-amber-50 px-1.5 font-extrabold ${small ? "text-sm" : "text-base"}`}>Rp{fmt(price)}</span>
    <figcaption className="text-xs font-semibold">{name}</figcaption>
  </figure>;
}
const Card = ({ d }: { d: number }) => <span className="grid h-12 w-9 place-items-center rounded-lg border-2 border-sky-300 bg-sky-50 text-2xl font-extrabold">{d}</span>;

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Box({ value, onChange, label, disabled = false, size = 5 }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; size?: number }) {
  const w = size >= 5 ? "w-28" : size >= 3 ? "w-20" : "w-12";
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl`} />;
}
function Stepper({ label, value, set, min, max, color }: { label: string; value: number; set: (n: number) => void; min: number; max: number; color?: string }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold" style={color ? { color } : undefined}>{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
      <span className="min-w-6 text-center text-lg font-extrabold tabular-nums">{value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button></span>
  </span>;
}
/** Tabel nilai tempat lima kolom. */
function PvTable({ cell, mark }: { cell: (i: number) => ReactNode; mark?: number }) {
  return <div className="inline-grid grid-cols-5 overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center">
    {places.map((p, i) => <span key={p} className="border-b-2 border-sky-300 bg-sky-50 px-1 py-0.5 text-[10px] font-bold leading-tight sm:text-xs" style={{ color: placeColors[i] }}>{p}</span>)}
    {places.map((p, i) => <span key={p} className={`grid min-h-12 min-w-11 place-items-center px-0.5 text-2xl font-extrabold sm:min-w-14 ${mark === i ? "bg-error/10 text-error" : ""}`}>{cell(i)}</span>)}
  </div>;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function PlaceLab() {
  const [d, setD] = useState([1, 4, 5, 0, 0]), [pick, setPick] = useState<number | null>(null);
  const n = d.reduce((a, x, i) => a + x * placeValue[i], 0);
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-center gap-1.5 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.15]">{d.map((x, i) => <div key={i} className="flex flex-col items-center gap-0.5">
      <button type="button" aria-label={`${places[i]} tambah`} className="btn btn-xs btn-square btn-outline" disabled={x >= 9} onClick={() => setD(d.map((y, j) => (j === i ? y + 1 : y)))}><Plus className="size-3.5" aria-hidden="true" /></button>
      <button type="button" aria-label={`Pilih ${places[i]}`} aria-pressed={pick === i} onClick={() => setPick(i)} className={`grid h-16 w-12 place-items-center rounded-xl border-2 text-3xl font-extrabold sm:w-14 ${pick === i ? "border-error bg-error/10" : "border-sky-300 bg-sky-50"}`} style={{ color: placeColors[i] }}>{x}</button>
      <button type="button" aria-label={`${places[i]} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={x <= (i === 0 ? 1 : 0)} onClick={() => setD(d.map((y, j) => (j === i ? y - 1 : y)))}><Minus className="size-3.5" aria-hidden="true" /></button>
      <span className="max-w-14 text-center text-[10px] font-bold leading-tight" style={{ color: placeColors[i] }}>{places[i]}</span>
    </div>)}</div>
    <p className="text-center text-4xl font-extrabold text-success">{fmt(n)}</p>
    <Result value={pick === null ? String(n) : `${n}:${pick}`}>Dibaca <strong>{reading(n).toLowerCase()}</strong>.{pick !== null && <> Angka {d[pick]} di tempat {places[pick].toLowerCase()} bernilai <strong>{fmt(d[pick] * placeValue[pick])}</strong>.</>}</Result>
  </div>;
}
const priceTags: { item: Item; price: number; name: string }[] = [{ item: "obat", price: 66500, name: "Obat batuk" }, { item: "buku", price: 14500, name: "4 buku tulis" }, { item: "pensil", price: 44567, name: "Kotak pensil" }, { item: "termos", price: 15950, name: "Termos" }];
function PriceLab() {
  const [k, setK] = useState<number | null>(null);
  const t = k === null ? null : priceTags[k], left = t ? Math.floor(t.price / 1000) : 0, right = t ? t.price % 1000 : 0;
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Ketuk salah satu label harga.</p>
    <div className="flex flex-wrap justify-center gap-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]">{priceTags.map((p, i) => <button key={p.name} type="button" aria-label={`Harga ${p.name}`} aria-pressed={k === i} onClick={() => setK(i)} className={`rounded-xl border-2 p-1.5 ${k === i ? "border-success bg-success/10" : "border-transparent"}`}><Tag {...p} small /></button>)}</div>
    {t && <div className="flex flex-wrap items-center justify-center gap-1 text-3xl font-extrabold"><span className="rounded-lg bg-violet-100 px-2">{left}</span><span>.</span><span className="rounded-lg bg-amber-100 px-2">{String(right).padStart(3, "0")}</span></div>}
    {t && <p className="text-center text-lg font-bold"><span className="rounded bg-violet-100 px-1">{(left === 1 ? "seribu" : `${reading(left * 1000).toLowerCase()}`)}</span>{right ? <> <span className="rounded bg-amber-100 px-1">{reading(right).toLowerCase()}</span></> : null}</p>}
    <Result value={t ? String(t.price) : ""}>{t ? <>Rp{fmt(t.price)} dibaca <strong>{reading(t.price).toLowerCase()} rupiah</strong>. Bagian kiri titik dibaca dengan kata ribu.</> : "Pilih label untuk melihat cara membaca harganya."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const pairs: [number, number][] = [[56475, 43217], [78897, 87897], [86567, 86576], [13234, 13234], [97768, 89876]];
const sign = (a: number, b: number) => (a < b ? "<" : a > b ? ">" : "=");
function CompareLab() {
  const [k, setK] = useState(0), [pick, setPick] = useState<string | null>(null);
  const [a, b] = pairs[k], da = digits5(a), db = digits5(b), at = da.findIndex((x, i) => x !== db[i]), ok = pick === sign(a, b);
  const row = (n: number, d: number[]) => <div className="contents"><span className="grid place-items-center border-t border-sky-200 px-1.5 text-lg font-extrabold">{fmt(n)}</span>
    {d.map((x, i) => <span key={i} className={`grid min-h-11 place-items-center border-s border-t border-sky-200 text-2xl font-extrabold ${pick && i === at ? "bg-error/10 text-error" : ""}`}>{x}</span>)}</div>;
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Pasangan {k + 1} dari {pairs.length}. Pilih tanda yang tepat.</p>
    <div className="flex flex-col items-center gap-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.15]">
      <div className="grid grid-cols-[auto_repeat(5,minmax(2.2rem,1fr))] overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center">
        <span className="px-1 text-[10px] font-bold">Bilangan</span>{places.map((p, i) => <span key={p} className="border-s border-sky-200 px-0.5 text-[10px] font-bold leading-tight" style={{ color: placeColors[i] }}>{p}</span>)}
        {row(a, da)}{row(b, db)}
      </div>
      <p className="text-3xl font-extrabold">{fmt(a)} <span className="inline-grid size-11 place-items-center rounded-full border-4 border-orange-300 bg-white align-middle">{pick ?? "…"}</span> {fmt(b)}</p>
    </div>
    <div className="flex flex-wrap gap-2">{["<", ">", "="].map(x => <button key={x} type="button" aria-label={`Tanda ${x}`} aria-pressed={pick === x} onClick={() => setPick(x)} className={`btn w-14 text-3xl ${pick === x ? (ok ? "btn-success" : "btn-error") : "btn-outline"}`}>{x}</button>)}
      <button type="button" className="btn btn-outline gap-1 ms-auto" onClick={() => { setK((k + 1) % pairs.length); setPick(null); }}>Berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button></div>
    <Result value={pick ? `${k}|${ok ? "ok" : "no"}` : `${k}|`}>{!pick ? "Bandingkan dari puluh ribuan." : ok ? (at < 0 ? `Tepat. Semua angkanya sama, jadi ${fmt(a)} = ${fmt(b)}.` : `Tepat. Tempat pertama yang berbeda adalah ${places[at].toLowerCase()}: ${da[at]} dan ${db[at]}.`) : "Belum tepat. Cari kolom pertama dari kiri yang angkanya berbeda."}</Result>
  </div>;
}
const dakonPrices = [56560, 65750, 57000, 75360];
function OrderLab() {
  const [desc, setDesc] = useState(false), [seq, setSeq] = useState<number[]>([]);
  const want = [...dakonPrices].sort((x, y) => (desc ? y - x : x - y)), done = seq.length === dakonPrices.length, ok = done && seq.every((v, i) => v === want[i]);
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Ketuk papan dakon dari yang paling {desc ? "mahal" : "murah"}.</p>
    <div className="flex flex-wrap justify-center gap-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]">{dakonPrices.map((p, i) => <button key={p} type="button" aria-label={`Dakon ${"ABCD"[i]}`} disabled={seq.includes(p)} onClick={() => setSeq([...seq, p])} className="rounded-xl p-1 disabled:opacity-25"><Tag item="dakon" price={p} name={`Dakon ${"ABCD"[i]}`} small /></button>)}</div>
    <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold">Urutan:</span>{dakonPrices.map((_, i) => <span key={i} className="grid h-10 min-w-20 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1 font-extrabold">{seq[i] ? fmt(seq[i]) : ""}</span>)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!seq.length} onClick={() => setSeq(seq.slice(0, -1))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setDesc(!desc); setSeq([]); }}><Shuffle className="size-4" aria-hidden="true" />{desc ? "Dari termurah" : "Dari termahal"}</button></div>
    <Result value={done ? (ok ? "ok" : "no") : String(seq.length)}>{!done ? "Bandingkan puluh ribuannya dulu, lalu ribuannya." : ok ? `Tepat: ${want.map(fmt).join(desc ? " > " : " < ")}.` : `Belum tepat. Urutan yang benar ${want.map(fmt).join(", ")}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function MoneyLab() {
  const [t, setT] = useState(3), [r, setR] = useState(8), [h, setH] = useState(6), [ways, setWays] = useState<string[]>([]);
  const target = 45600, total = t * 10000 + r * 1000 + h * 100, key = `${t}-${r}-${h}`;
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Sepuluh ribuan" value={t} set={setT} min={0} max={5} color={placeColors[0]} /><Stepper label="Seribuan" value={r} set={setR} min={0} max={15} color={placeColors[1]} /><Stepper label="Seratusan" value={h} set={setH} min={0} max={16} color={placeColors[2]} /></div>
    <div className="flex flex-wrap items-end justify-center gap-3 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.2]">{t > 0 && <MoneyStack value={10000} count={t} />}{r > 0 && <MoneyStack value={1000} count={r} />}{h > 0 && <MoneyStack value={100} count={h} />}</div>
    <p className="text-center text-lg font-bold">{fmt(t * 10000)} + {fmt(r * 1000)} + {fmt(h * 100)} = <span className="text-2xl text-success">{fmt(total)}</span></p>
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold">Harga belanja Rp{fmt(target)}</span>
      <button type="button" className="btn btn-sm btn-success" disabled={total !== target || ways.includes(key)} onClick={() => setWays([...ways, key])}>Catat cara ini</button></div>
    <Result value={`${total}|${ways.length}`}>{total === target ? "Pas!" : total < target ? `Kurang Rp${fmt(target - total)}.` : `Lebih Rp${fmt(total - target)}.`} {ways.length ? `Cara yang sudah dicatat: ${ways.map(w => w.split("-").join(" + ")).join("; ")} (sepuluh ribuan + seribuan + seratusan).` : "Coba temukan beberapa cara membayar dengan pas."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D                                                                */
/* ====================================================================== */
const problems: { a: number; b: number; op: "+" | "−" }[] = [{ a: 57500, b: 22000, op: "+" }, { a: 76598, b: 12456, op: "+" }, { a: 47900, b: 45750, op: "−" }, { a: 67987, b: 13453, op: "−" }];
function columnSteps(a: number, b: number, op: "+" | "−") {
  const da = digits5(a), db = digits5(b), out: number[] = Array(5).fill(0), marks: string[] = Array(5).fill(""), notes: string[] = [];
  let carry = 0;
  for (let i = 4; i >= 0; i--) {
    if (op === "+") { const s = da[i] + db[i] + carry; out[i] = s % 10; notes.push(`${places[i]}: ${da[i]} + ${db[i]}${carry ? " + 1" : ""} = ${s}${s >= 10 ? ", tulis " + (s % 10) + " simpan 1" : ""}`); carry = s >= 10 ? 1 : 0; if (carry && i > 0) marks[i - 1] = "1"; }
    else { let top = da[i] - carry; carry = 0; if (top < db[i]) { top += 10; carry = 1; if (i > 0) marks[i - 1] = "−1"; } out[i] = top - db[i]; notes.push(`${places[i]}: ${top} − ${db[i]} = ${out[i]}${carry ? " (pinjam 1)" : ""}`); }
  }
  return { out, marks, notes };
}
function ColumnLab() {
  const [k, setK] = useState(0), [step, setStep] = useState(0);
  const p = problems[k], { out, marks, notes } = columnSteps(p.a, p.b, p.op), res = p.op === "+" ? p.a + p.b : p.a - p.b;
  const shown = (i: number) => 4 - i < step;
  return <div className="space-y-3">
    <div className="grid grid-cols-[repeat(5,2.6rem)_1.5rem] justify-center gap-x-1 rounded-xl bg-base-100 p-2 text-center font-mono text-3xl font-extrabold [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.15]" role="group" aria-label={`${fmt(p.a)} ${p.op} ${fmt(p.b)}`}>
      {places.map((pl, i) => <span key={pl} className="font-sans text-[9px] font-bold leading-tight" style={{ color: placeColors[i] }}>{pl}</span>)}<span />
      {marks.map((m, i) => <span key={i} className="h-5 text-sm leading-5 text-error">{m && shown(i + 1) ? m : ""}</span>)}<span />
      {digits5(p.a).map((x, i) => <span key={i}>{x}</span>)}<span />
      {digits5(p.b).map((x, i) => <span key={i}>{x}</span>)}<span>{p.op}</span>
      <span className="col-span-6 h-0.5 bg-neutral" />
      {out.map((x, i) => <span key={i} className={shown(i) ? "text-success" : "text-transparent"}>{x}</span>)}<span />
    </div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-success" disabled={step >= 5} onClick={() => setStep(step + 1)}>Langkah berikutnya</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setStep(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setK((k + 1) % problems.length); setStep(0); }}><Shuffle className="size-4" aria-hidden="true" />Soal lain</button></div>
    <Result value={step >= 5 ? String(res) : `l${step}`}>{step === 0 ? "Mulai dari satuan, kolom paling kanan." : step >= 5 ? <>Selesai: <strong>{fmt(p.a)} {p.op} {fmt(p.b)} = {fmt(res)}</strong>.</> : notes[step - 1]}</Result>
  </div>;
}
const envelopeValues = [2000, 5000, 10000];
function AngpauLab() {
  const [mode, setMode] = useState<"kali" | "bagi">("kali"), [n, setN] = useState(12), [v, setV] = useState(5000), [kids, setKids] = useState(4);
  const total = 64000, tens = Math.floor(n / 10) * 10, rest = n - tens;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Cara" className="flex gap-1.5">{(["kali", "bagi"] as const).map(m => <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`btn btn-sm ${mode === m ? "btn-success" : "btn-outline"}`}>{m === "kali" ? "Perkalian angpau" : "Membagi uang"}</button>)}</div>
    {mode === "kali" ? <>
      <div className="flex flex-wrap items-end justify-around gap-2"><Stepper label="Banyak angpau" value={n} set={setN} min={1} max={15} />
        <div role="radiogroup" aria-label="Isi angpau" className="flex gap-1">{envelopeValues.map(x => <button key={x} type="button" role="radio" aria-checked={v === x} onClick={() => setV(x)} className={`btn btn-xs ${v === x ? "btn-success" : "btn-outline"}`}>{fmt(x)}</button>)}</div></div>
      <div className="flex max-w-md flex-wrap justify-center gap-1 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.75] lg:[zoom:1.15]">{Array.from({ length: n }, (_, i) => <Envelope key={i} value={v} size={i < tens ? 40 : 40} />)}</div>
      <p className="text-center text-lg font-bold">{tens > 0 && rest > 0 ? `${tens} × ${fmt(v)} + ${rest} × ${fmt(v)} = ${fmt(tens * v)} + ${fmt(rest * v)} = ` : ""}<span className="text-2xl text-success">{fmt(n * v)}</span></p>
      <Result value={`k${n * v}`}><strong>{n} × {fmt(v)} = {fmt(n * v)}</strong>.{tens > 0 && rest > 0 ? ` Pengali ${n} dipisah menjadi ${tens} dan ${rest} agar mudah dihitung.` : ""}</Result>
    </> : <>
      <div className="flex flex-wrap justify-around gap-2"><Stepper label="Banyak anak" value={kids} set={setKids} min={2} max={8} /></div>
      <div className="flex flex-wrap justify-center gap-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]">{Array.from({ length: kids }, (_, i) => <figure key={i} className="flex flex-col items-center"><Envelope size={36} /><figcaption className="text-xs font-bold">Rp{fmt(Math.floor(total / kids))}</figcaption></figure>)}</div>
      <Result value={`b${total % kids === 0 ? total / kids : "sisa"}`}>{total % kids === 0 ? <><strong>{fmt(total)} : {kids} = {fmt(total / kids)}</strong>. Periksa: {fmt(total / kids)} × {kids} = {fmt(total)}.</> : `${fmt(total)} tidak habis dibagi ${kids}: setiap anak ${fmt(Math.floor(total / kids))}, sisa ${fmt(total % kids)}.`}</Result>
    </>}
  </div>;
}
const labs: Record<string, () => ReactNode> = { place: PlaceLab, price: PriceLab, compare: CompareLab, order: OrderLab, money: MoneyLab, column: ColumnLab, angpau: AngpauLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "tags": return <div className="flex flex-wrap justify-center gap-2">{scene.items.map(t => <Tag key={t.name} {...t} small={scene.items.length > 1} />)}</div>;
    case "money": return <div className="flex flex-wrap items-end justify-center gap-3">{scene.notes.map(n => <MoneyStack key={n.value} value={n.value} count={n.count} w={52} />)}</div>;
    case "board": return <figure className="w-full max-w-md"><figcaption className="pb-1 text-center text-sm font-bold">{scene.title}</figcaption><dl className="grid grid-cols-3 gap-1 sm:grid-cols-5">{scene.rows.map(([k, v]) => <div key={k} className="rounded-lg border-2 border-emerald-300 bg-white px-1 py-0.5 text-center"><dt className="text-xs font-semibold">{k}</dt><dd className="text-sm font-extrabold">Rp{fmt(v)}</dd></div>)}</dl></figure>;
    case "paket": return <div className="flex flex-wrap justify-center gap-2">{scene.pakets.map(p => <div key={p.name} className="rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-1.5 text-center"><p className="font-extrabold">{p.name}</p>{p.lines.map(l => <p key={l} className="text-xs">{l}</p>)}<p className="mt-0.5 font-extrabold">Rp{fmt(p.price)}</p></div>)}</div>;
    case "cards": return <div className="flex gap-1.5">{scene.digits.map(d => <Card key={d} d={d} />)}</div>;
    case "angpau": return <div className="flex max-w-xs flex-wrap justify-center gap-1">{Array.from({ length: scene.count }, (_, i) => <Envelope key={i} value={scene.value} size={34} />)}</div>;
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
    <div className="grid grid-cols-[minmax(0,1.3fr)_1.5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1.3fr)_3rem_minmax(0,1fr)]" style={{ minHeight: Math.max(n, m) * 40 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${l}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-1.5 py-1 text-sm font-bold leading-snug [@media(max-height:700px)]:py-0.5 [@media(max-height:700px)]:text-xs ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}>{l}</button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-sm font-bold leading-snug [@media(max-height:700px)]:py-0.5 [@media(max-height:700px)]:text-xs">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      const lead = (k: number) => (k > 0 && /^[,.]/.test(bits[k]) ? bits[k][0] : ""), body = (k: number) => (lead(k) ? bits[k].slice(1) : bits[k]).trim();
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
    case "pv": { let k = 0; const d = digits5(p.n);
      return <PvTable cell={j => { if (!p.hide[j]) return d[j]; const idx = k++; return <input aria-label={places[j]} inputMode="numeric" value={x[idx]} disabled={checked} placeholder="…" onChange={e => put(idx, e.target.value.replace(/\D/g, "").slice(-1))} className="h-10 w-9 rounded-lg border-2 border-orange-400 bg-white text-center text-2xl font-extrabold focus:border-success focus:outline-none" />; }} />; }
    case "column": { const w = 5, res = String(columnResult(p)), pad = w - res.length;
      return <div className="inline-grid gap-x-1 text-center font-mono text-2xl font-extrabold sm:text-3xl" style={{ gridTemplateColumns: `repeat(${w}, 2.6rem) 1.5rem` }} role="group" aria-label={`${fmt(p.a)} ${p.op} ${fmt(p.b)}`}>
        {places.map((pl, j) => <span key={pl} className="font-sans text-[9px] font-bold leading-tight" style={{ color: placeColors[j] }}>{pl}</span>)}<span />
        {digits5(p.a).map((c, j) => <span key={j}>{p.a >= placeValue[j] || j === 4 ? c : ""}</span>)}<span />
        {digits5(p.b).map((c, j) => <span key={j}>{p.b >= placeValue[j] || j === 4 ? c : ""}</span>)}<span>{p.op}</span>
        <span className="col-span-full h-0.5 bg-neutral" />
        {Array.from({ length: pad }, (_, j) => <span key={`p${j}`} />)}{x.map((c, j) => <input key={j} aria-label={`Hasil angka ${j + 1}`} inputMode="numeric" value={c} disabled={checked} placeholder="…" onChange={e => put(j, e.target.value.replace(/\D/g, "").slice(-1))} className="mx-auto h-11 w-10 rounded-lg border-2 border-orange-400 bg-white text-center text-2xl font-extrabold focus:border-success focus:outline-none" />)}<span />
      </div>; }
  }
}
function Answer({ q, value, record, checked }: { q: NQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFiveWhole100k() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); show(); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Bilangan Cacah sampai 100.000</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Baca dan tulis bilangan lima angka, tentukan nilai tempatnya, bandingkan dan urutkan harga, susun dan urai uang, lalu hitung penjumlahan, pengurangan, perkalian, dan pembagian.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-2"><Money value={10000} w={70} /><Money value={1000} w={56} /><Money value={100} w={56} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Belanja di Pasar Sukawati</h2>
        <p className="mt-2 text-sm">Di pasar, harga oleh-oleh ditulis dengan bilangan lima angka. Sebelum membeli, kita membaca harganya, membandingkan antarpedagang, lalu menyiapkan uang yang pas.</p>
        <p className="mt-2 text-sm text-base-content/60">7 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bilangan-100000">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bilangan-100000" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        {t.sections.length > 1 && <div role="tablist" aria-label={`Bagian ${t.short}`} className="mb-3 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>}
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <p className="mt-1 text-sm text-base-content/60">{t.title}</p>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0 && sec === 0} onClick={prev}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={next}>{sec < t.sections.length - 1 ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<NQuestion> key={`${mode}-${topic}`}
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
