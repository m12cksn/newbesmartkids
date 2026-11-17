"use client";

import { ArrowLeft, ArrowRight, Divide, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { ThingIcon } from "./GradeOneCounting10Art";
import {
  assessment, cells, correct, fmt, formatAnswer, gcd, isHidden, practice, ready, SEP, simplify, splitParts, topics,
  type Goods, type Part, type RQuestion, type Scene,
} from "@/data/grade-six-ratio-v2";

const ink = "#2b2320";

/* ====================================================================== */
/* Gambar                                                                  */
/* ====================================================================== */
/** Bibit dalam polybag hitam. */
function Seedling({ size = 30 }: { size?: number }) {
  return <svg viewBox="0 0 30 34" width={size} height={size * 1.13} aria-hidden="true">
    <path d="M15 20V9" stroke="#3f7d2a" strokeWidth="1.8" /><path d="M15 12c-5-1-7-5-6-8 4 0 7 3 6 8zM15 14c4-1 7-4 7-8-4 0-7 3-7 8z" fill="#5fae3c" stroke="#2f5f1f" strokeWidth=".8" />
    <path d="M6 19h18l-2 13H8z" fill="#2d2d2d" stroke="#111" strokeWidth=".8" /><path d="M9 23h.01M14 26h.01M19 23h.01" stroke="#777" strokeWidth="1.4" strokeLinecap="round" />
  </svg>;
}
function Cemara({ size = 34 }: { size?: number }) {
  return <svg viewBox="0 0 30 40" width={size * 0.75} height={size} aria-hidden="true"><rect x="13.5" y="31" width="3" height="8" fill="#7a4a22" /><path d="M15 2L5 16h5L4 25h6L3 33h24l-7-8h6l-6-9h5z" fill="#2f8f5b" stroke="#1d5e3b" strokeWidth="1" strokeLinejoin="round" /></svg>;
}
function PucukMerah({ size = 34 }: { size?: number }) {
  return <svg viewBox="0 0 34 40" width={size * 0.85} height={size} aria-hidden="true"><rect x="15.5" y="28" width="3" height="11" fill="#7a4a22" /><circle cx="17" cy="18" r="13" fill="#3f9b45" stroke="#2a6b2f" strokeWidth="1" />{[[11, 9], [20, 7], [26, 13], [8, 16], [17, 13], [24, 20]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#d6283a" />)}</svg>;
}
function MilkBox({ size = 26 }: { size?: number }) {
  return <svg viewBox="0 0 24 32" width={size * 0.75} height={size} aria-hidden="true"><path d="M4 8l4-5h8l4 5v22H4z" fill="#fff" stroke={ink} strokeWidth="1" /><path d="M4 8h16" stroke={ink} strokeWidth=".8" /><rect x="4" y="16" width="16" height="8" fill="#5eb6e8" /><path d="M15 3V0" stroke="#e23d3d" strokeWidth="1.4" /></svg>;
}
function Pen({ size = 26 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><g transform="rotate(40 12 12)"><rect x="10" y="2" width="4" height="15" rx="1" fill="#2f86d6" stroke={ink} strokeWidth=".8" /><path d="M10 17h4l-2 5z" fill="#e8d3a8" stroke={ink} strokeWidth=".8" /><rect x="13.6" y="3" width="1.2" height="6" fill="#bbb" /></g></svg>;
}
function GoodsIcon({ goods, size = 26 }: { goods: Goods; size?: number }) {
  if (goods === "bibit") return <Seedling size={size} />;
  if (goods === "susu") return <MilkBox size={size} />;
  if (goods === "pena") return <Pen size={size} />;
  return <ThingIcon thing={goods} className={size > 24 ? "size-7" : "size-5"} />;
}
function Pack({ goods, name, count, price, small }: { goods: Goods; name: string; count: number; price: number; small?: boolean }) {
  const shown = Math.min(count, 10);
  return <figure className="flex flex-col items-center gap-0.5 rounded-xl border-2 border-amber-300 bg-amber-50 px-2 py-1" aria-label={`${name}: ${count} ${goods}, Rp${fmt(price)}`}>
    <figcaption className="text-xs font-extrabold">{name}</figcaption>
    <div className="flex max-w-36 flex-wrap justify-center">{Array.from({ length: shown }, (_, i) => <GoodsIcon key={i} goods={goods} size={small ? 20 : 26} />)}{count > shown && <span className="self-end text-xs font-bold">+{count - shown}</span>}</div>
    <span className="rounded bg-white px-1.5 text-sm font-extrabold">{count} isi, Rp{fmt(price)}</span>
  </figure>;
}
function Garden({ pucuk, cemara, size = 30 }: { pucuk: number; cemara: number; size?: number }) {
  return <div className="flex flex-wrap items-end justify-center gap-3 rounded-xl bg-lime-50 p-2" role="img" aria-label={`${pucuk} pohon pucuk merah dan ${cemara} pohon cemara`}>
    <div className="flex flex-col items-center"><div className="flex max-w-40 flex-wrap justify-center">{Array.from({ length: pucuk }, (_, i) => <PucukMerah key={i} size={size} />)}</div><span className="text-xs font-bold">Pucuk merah</span></div>
    <div className="flex flex-col items-center"><div className="flex max-w-40 flex-wrap justify-center">{Array.from({ length: cemara }, (_, i) => <Cemara key={i} size={size} />)}</div><span className="text-xs font-bold">Cemara</span></div>
  </div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Box({ value, onChange, label, disabled = false, wide = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; wide?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/[^\d.,]/g, "").slice(0, 7))}
    className={`h-10 ${wide ? "w-24" : "w-14"} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:h-11 sm:text-2xl`} />;
}
function Stepper({ label, value, set, min, max, step = 1, show }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; show?: string }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold">{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
      <span className="min-w-7 text-center text-lg font-extrabold tabular-nums">{show ?? value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button></span>
  </span>;
}
/** Tabel rasio tampilan (dipakai peraga). */
function ShowTable({ head, rows, ops, rowLabels }: { head: string[]; rows: (number | string)[][]; ops: string[]; rowLabels?: string[] }) {
  const cols = head.length + (rowLabels ? 1 : 0);
  return <div className="inline-grid overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
    {rowLabels && <span className="bg-sky-100 px-2 py-0.5 text-xs font-bold" />}{head.map(h => <span key={h} className="bg-sky-100 px-2 py-0.5 text-xs font-bold">{h}</span>)}
    {rows.map((r, i) => <div key={i} className="contents">
      {i > 0 && ops[i - 1] ? <span className="col-span-full border-t border-sky-100 bg-amber-50 py-0.5 text-sm font-extrabold text-amber-700">{ops[i - 1]}</span> : null}
      {rowLabels && <span className="border-t border-sky-200 px-2 py-1 text-left text-xs font-semibold">{rowLabels[i]}</span>}
      {r.map((c, j) => <span key={j} className="border-t border-s border-sky-200 px-2 py-1 text-xl font-extrabold">{typeof c === "number" ? fmt(c) : c}</span>)}
    </div>)}
  </div>;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function CompareLab() {
  const [na, setNa] = useState(6), [pa, setPa] = useState(54000), [nb, setNb] = useState(4), [pb, setPb] = useState(40000);
  const ua = pa / na, ub = pb / nb, better = ua < ub ? "A" : ua > ub ? "B" : "=";
  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">{[["A", na, setNa, pa, setPa], ["B", nb, setNb, pb, setPb]].map(([k, n, sn, p, sp]) => <div key={k as string} className="flex flex-col items-center gap-1.5 rounded-xl bg-base-100 p-2">
      <Pack goods="bibit" name={`Paket ${k}`} count={n as number} price={p as number} small />
      <Stepper label={`Bibit ${k}`} value={n as number} set={sn as (v: number) => void} min={1} max={10} />
      <Stepper label={`Harga ${k}`} value={p as number} set={sp as (v: number) => void} min={5000} max={100000} step={1000} show={fmt(p as number)} />
    </div>)}</div>
    <p className="text-center text-lg font-bold">Per bibit: A Rp{fmt(Math.round(ua))}, B Rp{fmt(Math.round(ub))}</p>
    <Result value={better}>{better === "=" ? "Harga per bibit sama. Kedua paket sama hematnya." : <>Paket <strong>{better}</strong> lebih hemat per bibit{(better === "A" ? pa > pb : pb > pa) ? ", walaupun harga totalnya lebih mahal" : ""}.</>}</Result>
  </div>;
}
function RatioLab() {
  const [p, setP] = useState(4), [c, setC] = useState(6);
  const [sp, sc] = simplify(p, c);
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Pucuk merah" value={p} set={setP} min={1} max={12} /><Stepper label="Cemara" value={c} set={setC} min={1} max={12} /></div>
    <div className="[@media(max-height:700px)]:[zoom:0.75] lg:[zoom:1.1]"><Garden pucuk={p} cemara={c} size={30} /></div>
    <p className="text-center text-2xl font-extrabold">{p} : {c}{gcd(p, c) > 1 && <> = <span className="text-success">{sp} : {sc}</span></>}</p>
    <Result value={`${sp}:${sc}`}>Rasio pucuk merah terhadap cemara <strong>{sp} : {sc}</strong>: setiap {sp} pucuk merah ada {sc} cemara.{gcd(p, c) > 1 && ` Kedua bilangan dibagi FPB-nya, ${gcd(p, c)}.`} Kebalikannya, cemara : pucuk merah = {sc} : {sp}.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function TableLab() {
  const base: [number, number] = [10, 12];
  const [rows, setRows] = useState<{ v: [number, number]; op: string }[]>([{ v: base, op: "" }]);
  const last = rows[rows.length - 1].v;
  const add = (op: "×" | ":", k: number) => { const v: [number, number] = op === "×" ? [last[0] * k, last[1] * k] : [last[0] / k, last[1] / k]; setRows([...rows, { v, op: `${op} ${k}` }].slice(-4)); };
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Lahan 10 m² untuk 12 bibit. Kalikan atau bagi kedua kolom dengan bilangan yang sama.</p>
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.15]"><ShowTable head={["Luas lahan (m²)", "Banyak bibit"]} rows={rows.map(r => r.v)} ops={rows.slice(1).map(r => r.op)} /></div>
    <div className="flex flex-wrap gap-1.5">{[2, 3, 5].map(k => <button key={k} type="button" className="btn btn-sm btn-success gap-0.5" aria-label={`Kali ${k}`} disabled={last[0] * k > 100} onClick={() => add("×", k)}><X className="size-3.5" aria-hidden="true" />{k}</button>)}
      {[2, 3].map(k => <button key={`d${k}`} type="button" className="btn btn-sm btn-outline gap-0.5" aria-label={`Bagi ${k}`} disabled={last[0] % k !== 0 || last[1] % k !== 0} onClick={() => add(":", k)}><Divide className="size-3.5" aria-hidden="true" />{k}</button>)}
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setRows([{ v: base, op: "" }])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <Result value={`${last[0]}:${last[1]}`}>{rows.map(r => `${r.v[0]} : ${r.v[1]}`).join(" = ")}. Semua rasio ini senilai.{last[0] === 5 && last[1] === 6 ? " 5 : 6 adalah bentuk paling sederhana (dibagi FPB 2)." : ""}</Result>
  </div>;
}
const jahe = [{ name: "Paket 5", count: 5, price: 58000 }, { name: "Paket 3", count: 3, price: 37500 }];
function UnitLab() {
  const [buy, setBuy] = useState(4);
  const unit = jahe.map(j => j.price / j.count), cheap = unit[0] <= unit[1] ? 0 : 1;
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-center gap-2 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.1]">{jahe.map(j => <Pack key={j.name} goods="bibit" {...j} small />)}</div>
    <div className="flex flex-wrap justify-center gap-2 [@media(max-height:700px)]:[zoom:0.8]">{jahe.map((j, i) => <ShowTable key={j.name} head={["Bibit", "Harga (Rp)"]} rows={[[j.count, j.price], [1, unit[i]]]} ops={[`: ${j.count}`]} />)}</div>
    <div className="flex justify-center"><Stepper label="Beli bibit" value={buy} set={setBuy} min={1} max={12} /></div>
    <Result value={`${buy}:${buy * unit[cheap]}`}>Harga satuan termurah ada di <strong>{jahe[cheap].name}</strong>: Rp{fmt(unit[cheap])} per bibit. Untuk {buy} bibit: {buy} × {fmt(unit[cheap])} = <strong>Rp{fmt(buy * unit[cheap])}</strong>.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function PartsLab() {
  const [a, setA] = useState(4), [b, setB] = useState(5), [k, setK] = useState(8);
  const s = a + b;
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Tanaman hias" value={a} set={setA} min={1} max={9} /><Stepper label="Tanaman obat" value={b} set={setB} min={1} max={9} /><Stepper label="Pengali" value={k} set={setK} min={1} max={12} /></div>
    <div className="space-y-1 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.85]" role="img" aria-label={`Model batang ${a} bagian hias dan ${b} bagian obat, setiap bagian ${k}`}>
      <div className="flex">{Array.from({ length: s }, (_, i) => <span key={i} className={`grid h-9 flex-1 place-items-center border border-white text-sm font-bold text-white ${i < a ? "bg-fuchsia-500" : "bg-emerald-600"}`}>{k}</span>)}</div>
      <div className="flex text-xs font-bold"><span style={{ flex: a }} className="text-center text-fuchsia-700">Hias {a * k}</span><span style={{ flex: b }} className="text-center text-emerald-700">Obat {b * k}</span></div>
    </div>
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.85]"><ShowTable head={["Hias", "Obat", "Total"]} rowLabels={["Rasio", "Jumlah"]} rows={[[a, b, s], [a * k, b * k, s * k]]} ops={[`× ${k}`]} /></div>
    <Result value={`${a * k}|${b * k}|${s * k}`}>Bagian terhadap bagian: hias : obat = {a} : {b}. Bagian terhadap keseluruhan: hias : total = {a} : {s}. Jika total {s * k}, setiap bagian {k}, jadi hias {a * k} dan obat {b * k}.</Result>
  </div>;
}
const plants = [{ name: "Kumis kucing", weeks: 12, text: "12 minggu" }, { name: "Lengkuas", weeks: 72, text: "1,5 tahun" }, { name: "Jahe merah", weeks: 12, text: "3 bulan" }, { name: "Kencur", weeks: 24, text: "6 bulan" }, { name: "Buah merah", weeks: 144, text: "3 tahun" }];
function TimeLab() {
  const [a, setA] = useState(2), [b, setB] = useState(1), [unit, setUnit] = useState<"minggu" | "bulan">("bulan");
  const conv = (w: number) => (unit === "bulan" ? w / 4 : w);
  const x = conv(plants[a].weeks), y = conv(plants[b].weeks), [sx, sy] = simplify(x, y);
  const pick = (label: string, v: number, set: (n: number) => void) => <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1"><span className="w-full text-xs font-bold">{label}</span>{plants.map((p, i) => <button key={p.name} type="button" role="radio" aria-checked={v === i} onClick={() => set(i)} className={`btn btn-xs ${v === i ? "btn-success" : "btn-outline"}`}>{p.name}</button>)}</div>;
  return <div className="space-y-2.5">
    {pick("Tanaman pertama", a, setA)}{pick("Tanaman kedua", b, setB)}
    <div role="radiogroup" aria-label="Satuan" className="flex items-center gap-1"><span className="text-xs font-bold">Satuan:</span>{(["minggu", "bulan"] as const).map(u => <button key={u} type="button" role="radio" aria-checked={unit === u} onClick={() => setUnit(u)} className={`btn btn-xs ${unit === u ? "btn-success" : "btn-outline"}`}>{u}</button>)}</div>
    <p className="rounded-xl bg-base-100 p-2 text-center text-lg font-bold">{plants[a].name} {plants[a].text} = {x} {unit}<br />{plants[b].name} {plants[b].text} = {y} {unit}</p>
    <p className="text-center text-2xl font-extrabold">{x} : {y}{gcd(x, y) > 1 && <> = <span className="text-success">{sx} : {sy}</span></>}</p>
    <Result value={`${sx}:${sy}`}>Setelah satuannya sama, rasio masa panen {plants[a].name.toLowerCase()} terhadap {plants[b].name.toLowerCase()} adalah <strong>{sx} : {sy}</strong>.</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { compare: CompareLab, ratio: RatioLab, table: TableLab, unit: UnitLab, parts: PartsLab, time: TimeLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "packs": return <div className="flex flex-wrap justify-center gap-2">{scene.items.map(it => <Pack key={it.name} goods={scene.goods} {...it} small={scene.items.length > 2} />)}</div>;
    case "garden": return <Garden pucuk={scene.pucuk} cemara={scene.cemara} size={28} />;
    case "table": return <table className="overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-left"><caption className="pb-1 text-sm font-bold">{scene.title}</caption><thead className="bg-sky-100 text-sm"><tr><th className="px-2">{scene.head[0]}</th><th className="px-2">{scene.head[1]}</th></tr></thead><tbody>{scene.rows.map(([k, v]) => <tr key={k} className="border-t border-sky-100"><td className="px-2 py-0.5 font-semibold">{k}</td><td className="px-2 font-extrabold">{v}</td></tr>)}</tbody></table>;
    case "bars": { const max = Math.max(...scene.rows.map(r => r.units)); const min = Math.min(...scene.rows.map(r => r.units));
      return <figure className="flex flex-col gap-1.5" aria-label={`Model batang: ${scene.rows.map(r => `${r.label} ${r.units} bagian`).join(", ")}, selisih ${scene.diff}`}>{scene.rows.map(r => <div key={r.label} className="flex items-center gap-2"><span className="w-24 text-right text-sm font-bold">{r.label}</span><div className="flex">{Array.from({ length: r.units }, (_, k) => <span key={k} className={`h-8 w-7 border-2 sm:w-9 ${r.units === max ? "border-emerald-600 bg-emerald-100" : "border-sky-600 bg-sky-100"}`} />)}</div></div>)}
        <div className="flex items-start gap-2"><span className="w-24" /><span style={{ width: `calc(${min} * var(--u))` }} className="[--u:1.75rem] sm:[--u:2.25rem]" /><span style={{ width: `calc(${max - min} * var(--u))` }} className="border-t-2 border-dashed border-rose-500 pt-0.5 text-center text-sm font-extrabold text-rose-700 [--u:1.75rem] sm:[--u:2.25rem]">selisih {scene.diff}</span></div></figure>; }
    case "recipe": return <figure className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-1.5"><figcaption className="text-sm font-extrabold">{scene.title}</figcaption><ul className="text-sm">{scene.lines.map(l => <li key={l}>{l}</li>)}</ul></figure>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function RTable({ p, x, put, checked, i }: { p: Extract<Part, { kind: "rtable" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean; i: number }) {
  let k = 0; const hiddenCells = p.hide.length;
  let o = hiddenCells; const cols = p.head.length + (p.rowLabels ? 1 : 0);
  return <div className="inline-grid overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }} role="group" aria-label={`Tabel rasio ${i + 1}`}>
    {p.rowLabels && <span className="bg-sky-100 px-1.5 py-0.5 text-[11px] font-bold" />}{p.head.map(h => <span key={h} className="bg-sky-100 px-1.5 py-0.5 text-[11px] font-bold leading-tight sm:text-xs">{h}</span>)}
    {p.rows.map((row, r) => <div key={r} className="contents">
      {r > 0 && p.ops[r - 1] && (() => { const op = p.ops[r - 1]; const idx = op.hide ? o++ : -1;
        return <span className="col-span-full flex items-center justify-center gap-1 border-t border-sky-100 bg-amber-50 py-0.5 text-base font-extrabold text-amber-700">{op.op}{op.hide ? <Box label={`Pengali baris ${r + 1}`} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} /> : op.k}<span className="text-xs font-semibold text-amber-700/80">(semua kolom)</span></span>; })()}
      {p.rowLabels && <span className="border-t border-sky-200 px-1.5 py-1 text-left text-xs font-semibold">{p.rowLabels[r]}</span>}
      {row.map((c, j) => { if (!isHidden(p, r, j)) return <span key={j} className="grid place-items-center border-t border-s border-sky-200 px-1.5 py-1 text-xl font-extrabold">{fmt(c)}</span>;
        const idx = k++; return <span key={j} className="grid place-items-center border-t border-s border-sky-200 p-1"><Box label={`Tabel ${p.head[j]} baris ${r + 1}`} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} wide={c >= 1000} /></span>; })}
    </div>)}
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      const lead = (k: number) => (k > 0 && /^[,.]/.test(bits[k]) ? bits[k][0] : ""), body = (k: number) => (lead(k) ? bits[k].slice(1) : bits[k]).trim();
      return <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-lg font-bold leading-10 sm:text-xl [@media(max-height:700px)]:gap-y-1 [@media(max-height:700px)]:leading-8">{bits.map((_, k) => <span key={k} className="contents">{body(k) && <span>{body(k)}</span>}{k < bits.length - 1 && <span className="inline-flex items-end"><Box label={`Bagian ${i + 1} kotak ${k + 1}`} wide={p.answers[k] >= 1000} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{lead(k + 1)}</span>}</span>)}</p>; }
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold [@media(max-height:700px)]:text-base">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-10 rounded-2xl border-4 px-3 text-base font-bold sm:text-lg ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={on.includes(op)} disabled={checked} onClick={() => set((on.includes(op) ? on.filter(o => o !== op) : [...on, op]).join("|"))} className={`min-h-10 rounded-full border-4 px-3 text-lg font-extrabold ${on.includes(op) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Boleh lebih dari satu. Ketuk lagi untuk membatalkan.</p></div>; }
    case "rtable": return <RTable p={p} x={x} put={put} checked={checked} i={i} />;
  }
}
function Answer({ q, value, record, checked }: { q: RQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeSixRatioV2() {
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
    <h1 className="text-3xl font-extrabold sm:text-5xl">Rasio</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bandingkan dua besaran dengan rasio, temukan rasio yang senilai dan rasio satuan, lalu pakai rasio untuk bagian, keseluruhan, dan durasi waktu.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-1"><PucukMerah size={40} /><PucukMerah size={40} /><Cemara size={40} /><Cemara size={40} /><Cemara size={40} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Gerakan menanam pohon</h2>
        <p className="mt-2 text-sm">Sekolah ikut menanam bibit pohon. Berapa bibit untuk lahan seluas ini? Paket bibit mana yang lebih hemat? Semua bisa dijawab dengan rasio.</p>
        <p className="mt-2 text-sm text-base-content/60">6 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-rasio">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-rasio" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.short}`} className="mb-3 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
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
      </> : <GradeFourQuiz<RQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.65]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
