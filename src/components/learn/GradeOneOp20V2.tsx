"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Art } from "./GradeOneSub10Art";
import { PvScene } from "./GradeOneCount20Art";
import { assessment, cells, columnValue, correct, formatAnswer, practice, ready, SEP, splitParts, topics, type Op, type Part, type Scene, type Slot, type SQuestion, type Thing } from "@/data/grade-one-op20-v2";
import { thingName } from "@/data/grade-one-sub10-v2";

const sel = (on: boolean) => (on ? "border-error bg-error/10" : "border-orange-300 bg-white");

/* ====================================================================== */
/* Gambar                                                                  */
/* ====================================================================== */
/** Benda tersusun 5 per baris. */
function Group({ thing, n, alt, size = 24 }: { thing: Thing; n: number; alt?: boolean; size?: number }) {
  return <span role="img" aria-label={`${n} ${thingName[thing]}`} className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(5, Math.max(1, n))}, ${size}px)` }}>{Array.from({ length: n }, (_, k) => <Art key={k} thing={thing} alt={alt} className="h-full w-full" />)}</span>;
}
const Box = ({ children, label }: { children: ReactNode; label?: string }) => <div className="flex flex-col items-center gap-1"><div className="flex min-h-16 min-w-20 items-center justify-center rounded-2xl border-4 border-orange-300 bg-white p-1.5">{children}</div>{label && <span className="rounded-full bg-orange-100 px-3 text-sm font-bold">{label}</span>}</div>;
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "objs") return <Box><Group thing={scene.thing} n={scene.n} size={26} /></Box>;
  const big = Math.max(...scene.items.map(i => i.n ?? 0)), size = big > 10 ? 20 : 24;
  return <div className="flex flex-wrap items-start justify-center gap-2">{scene.items.map((it, k) => <Box key={k} label={it.label}>{it.n === null ? <span aria-label={`${it.label}: belum diketahui`} className="grid h-14 w-16 place-items-center text-4xl font-extrabold text-base-content/50">?</span> : <Group thing={it.thing} n={it.n} alt={it.alt} size={size} />}</Box>)}</div>;
}

/* ====================================================================== */
/* Bentuk jawaban                                                          */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled, small = false, round = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; small?: boolean; round?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`${small ? "h-10 w-11 text-xl sm:h-12 sm:w-14 sm:text-2xl" : "h-12 w-14 text-2xl sm:h-14 sm:w-16 sm:text-3xl"} border-4 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none ${round ? "rounded-full" : "rounded-2xl"}`} />;
}
function Strip({ p, x, put, disabled, i }: { p: Extract<Part, { kind: "strip" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number }) {
  let k = 0;
  return <div className="mx-auto grid w-full max-w-md border-2 border-purple-300" style={{ gridTemplateColumns: `repeat(${p.items.length}, minmax(0, 1fr))` }}>{p.items.map((n, j) => { const c = n === null ? k++ : -1;
    return <span key={j} className={`grid h-14 min-w-0 place-items-center border border-purple-200 ${j % 2 ? "bg-purple-50" : "bg-purple-100"}`}>{n !== null ? <span className="text-2xl font-extrabold">{n}</span> : <NumBox small label={`Bagian ${i + 1} kotak ${c + 1}`} value={x[c]} onChange={v => put(c, v)} disabled={disabled} />}</span>; })}</div>;
}
function Hop({ p, value, set, checked }: { p: Extract<Part, { kind: "hop" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const lo = 10, hi = 20, pick = value ? Number(value) : null;
  const between = (n: number) => pick !== null && (p.op === "−" ? n < p.start && n >= pick : n > p.start && n <= pick);
  return <div className="space-y-1"><p className="text-sm text-base-content/70">Mulai di angka {p.start} (oranye). Ketuk angka tempat mendarat.</p>
    <div className="grid grid-cols-6 gap-1 sm:grid-cols-11">{Array.from({ length: hi - lo + 1 }, (_, j) => lo + j).map(n => <button key={n} type="button" disabled={checked || n === p.start} aria-label={`Bilangan ${n}`} aria-pressed={pick === n} onClick={() => set(String(n))}
      className={`grid h-12 place-items-center rounded-xl border-2 text-xl font-extrabold disabled:opacity-100 ${n === p.start ? "border-orange-400 bg-orange-100" : pick === n ? "border-success bg-success/25" : between(n) ? "border-success/40 bg-success/10" : "border-base-300 bg-white"}`}>{n}</button>)}</div>
    <p className="text-2xl font-bold">{p.start} {p.op} {p.steps} = {value || "…"}</p></div>;
}
function Split({ p, x, put, disabled }: { p: Extract<Part, { kind: "split" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean }) {
  let k = 0;
  const circle = (n: number | null, label: string) => { if (n !== null) return <span className="grid size-14 place-items-center rounded-full border-4 border-orange-300 bg-white text-2xl font-extrabold">{n}</span>; const j = k++; return <span className="grid size-14 place-items-center rounded-full border-4 border-orange-400 bg-orange-50"><NumBox round small label={label} value={x[j]} onChange={v => put(j, v)} disabled={disabled} /></span>; };
  const a = circle(p.parts[0], "Bagian pertama"), b = circle(p.parts[1], "Bagian kedua");
  const col = (c: number) => (c === (p.which ? 2 : 0) ? <div className="flex flex-col items-center"><svg viewBox="0 0 60 24" className="h-6 w-16" aria-hidden="true"><path d="M30 2L8 22M30 2l22 20" stroke="#2b2320" strokeWidth="2.4" fill="none" /></svg><div className="flex gap-1">{a}{b}</div></div> : <div />);
  return <div role="group" aria-label={`${p.which ? p.b : p.a} dipisah`} className="mx-auto grid w-fit grid-cols-[auto_2.5rem_auto] items-start text-center">
    <span className="text-4xl font-extrabold">{p.a}</span><span className="text-4xl font-extrabold">{p.op}</span><span className="text-4xl font-extrabold">{p.b}</span>
    {col(0)}{col(1)}{col(2)}</div>;
}
function Column({ p, x, put, disabled, i }: { p: Extract<Part, { kind: "column" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number }) {
  const at = (s: Slot) => { const k = p.blanks.indexOf(s); return k < 0 ? <span className="text-2xl font-extrabold">{columnValue(p, s)}</span> : <NumBox small label={`Bagian ${i + 1} ${{ at: "puluhan pertama", ao: "satuan pertama", b: "satuan kedua", rt: "puluhan hasil", ro: "satuan hasil" }[s]}`} value={x[k]} onChange={v => put(k, v)} disabled={disabled} />; };
  const td = "h-14 w-20 border-x-2 border-purple-300 text-center";
  return <div className="flex items-center justify-center gap-2"><table className="border-collapse"><thead><tr>{["Puluhan", "Satuan"].map(h => <th key={h} className="border-2 border-purple-300 bg-purple-100 px-2 text-sm font-bold">{h}</th>)}</tr></thead>
    <tbody><tr><td className={td}>{at("at")}</td><td className={td}>{at("ao")}</td></tr><tr><td className={td} /><td className={td}>{at("b")}</td></tr>
      <tr className="border-t-4 border-neutral"><td className={`${td} border-b-2`}>{at("rt")}</td><td className={`${td} border-b-2`}>{at("ro")}</td></tr></tbody></table>
    <span className="text-4xl font-extrabold" aria-label={p.op === "+" ? "ditambah" : "dikurangi"}>{p.op}</span></div>;
}
function Eq({ x, put, disabled, i, label }: { x: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number; label?: string }) {
  return <div className="space-y-1">{label && <p className="text-lg font-bold">{label}</p>}<div className="flex flex-wrap items-center gap-1.5 text-3xl font-extrabold">
    <NumBox label={`Bagian ${i + 1} bilangan pertama`} value={x[0]} onChange={v => put(0, v)} disabled={disabled} />
    <span role="radiogroup" aria-label={`Bagian ${i + 1} tanda`} className="flex gap-1 rounded-2xl border-4 border-orange-400 p-0.5">{(["+", "−"] as Op[]).map(o => <button key={o} type="button" role="radio" aria-checked={x[1] === o} aria-label={o === "+" ? "tambah" : "kurang"} disabled={disabled} onClick={() => put(1, o)} className={`grid size-10 place-items-center rounded-xl border-2 ${sel(x[1] === o)}`}>{o}</button>)}</span>
    <NumBox label={`Bagian ${i + 1} bilangan kedua`} value={x[2]} onChange={v => put(2, v)} disabled={disabled} /><span>=</span>
    <NumBox label={`Bagian ${i + 1} hasil`} value={x[3]} onChange={v => put(3, v)} disabled={disabled} /></div></div>;
}
function Draw({ p, x, put, disabled }: { p: Extract<Part, { kind: "draw" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean }) {
  return <div className="grid grid-cols-2 gap-2">{["A", "B"].map((g, k) => { const n = Number(x[k] || 0);
    return <div key={g} className="flex flex-col items-center gap-1 rounded-2xl border-4 border-orange-300 bg-white p-1.5">
      <span className="rounded-full bg-orange-100 px-3 text-sm font-bold">{g}</span>
      <div className="flex min-h-20 items-center"><Group thing={p.thing} n={n} size={22} /></div>
      <span role="group" aria-label={`Kelompok ${g}`} className="flex items-center gap-1.5"><button type="button" aria-label={`Kurangi benda ${g}`} className="btn btn-circle btn-sm btn-outline" disabled={disabled || n <= 0} onClick={() => put(k, n - 1 ? String(n - 1) : "")}><Minus className="size-4" aria-hidden="true" /></button>
        <span className="min-w-6 text-center text-2xl font-extrabold">{n}</span>
        <button type="button" aria-label={`Tambah benda ${g}`} className="btn btn-circle btn-sm btn-outline" disabled={disabled || n >= 12} onClick={() => put(k, String(n + 1))}><Plus className="size-4" aria-hidden="true" /></button></span>
    </div>; })}</div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xl font-bold sm:text-2xl">{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => { const [w, ...rest] = b.trim().split(" ");
        // Kotak tetap menempel pada kata sesudahnya; sisa kalimat boleh pindah baris.
        return <span key={k} className="contents"><span className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{w && <span>{w}</span>}</span>{rest.length > 0 && <span>{rest.join(" ")}</span>}</span>; })}</p>; }
    case "strip": return <Strip p={p} x={x} put={put} disabled={checked} i={i} />;
    case "hop": return <Hop p={p} value={value} set={set} checked={checked} />;
    case "split": return <Split p={p} x={x} put={put} disabled={checked} />;
    case "column": return <Column p={p} x={x} put={put} disabled={checked} i={i} />;
    case "eq": return <Eq x={x} put={put} disabled={checked} i={i} label={p.label} />;
    case "draw": return <Draw p={p} x={x} put={put} disabled={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  // Empat isian pendek ditata dua kolom agar muat di layar.
  const grid = q.parts.length === 4 && q.parts.every(p => p.kind === "fill");
  return <div className={`${grid ? "grid grid-cols-1 gap-2 min-[400px]:grid-cols-2" : "space-y-3"} [@media(max-height:700px)]:space-y-1.5 [@media(max-height:700px)]:[zoom:0.8]`}>{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-2xl bg-success/10 p-3 text-lg font-bold leading-7 sm:text-xl">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="flex items-center gap-2"><span className="text-base font-bold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-circle btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-3xl font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-circle btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-5" aria-hidden="true" /></button></span>;
}
const Tabs = <T extends string>({ tabs, tab, set, label }: { tabs: readonly (readonly [T, string])[]; tab: T; set: (t: T) => void; label: string }) => <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5">{tabs.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => set(k)} className={`btn btn-sm ${tab === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>;
/** Pita 0–20 dengan sorotan langkah. */
function Track({ from, to }: { from: number; to: number }) {
  const lo = Math.min(from, to), hi = Math.max(from, to);
  return <div className="grid grid-cols-7 gap-1 sm:grid-cols-[repeat(11,minmax(0,1fr))]">{Array.from({ length: 21 }, (_, j) => j).map(j => <span key={j} className={`grid h-10 place-items-center rounded-lg border-2 text-lg font-extrabold ${j === from ? "border-orange-400 bg-orange-100" : j === to ? "border-success bg-success/30" : j > lo && j < hi ? "border-success/40 bg-success/10" : "border-base-300 bg-white"}`}>{j}</span>)}</div>;
}
function SelisihLab() {
  const [a, setA] = useState(7), [b, setB] = useState(6), m = Math.max(a, b);
  const row = (n: number, label: string) => <div className="flex items-center gap-2"><span className="w-12 text-sm font-bold">{label}</span><div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${m}, minmax(0, 1.8rem))` }}>{Array.from({ length: m }, (_, k) => <span key={k} className={`grid aspect-square place-items-center rounded-full ${k >= Math.min(a, b) && k < n ? "ring-2 ring-error" : ""}`}>{k < n && <Art thing="donat" className="h-full w-full" />}</span>)}</div></div>;
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Ibu" value={a} set={setA} min={1} max={10} /><Stepper label="Tika" value={b} set={setB} min={1} max={10} /></div>
    <div className="space-y-1 overflow-x-auto rounded-2xl border-2 border-orange-200 bg-white p-2">{row(a, "Ibu")}{row(b, "Tika")}</div>
    <Result value={`selisih:${a}:${b}`}>{a === b ? `Sama banyak, selisihnya 0.` : `Donat ${a > b ? "Ibu" : "Tika"} ${Math.abs(a - b)} lebihnya. Selisihnya ${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)}.`}</Result>
  </div>;
}
const tambahTabs = [["maju", "Hitung maju"], ["sepuluh", "Dengan 10"], ["tempat", "Nilai tempat"]] as const;
function TambahLab() {
  const [tab, setTab] = useState<(typeof tambahTabs)[number][0]>("maju");
  const [a, setA] = useState(7), [b, setB] = useState(6);
  // Bingkai 10 punya angka sendiri: merah 5–9 dan biru cukup untuk melewati 10 (hasil 11–18).
  const [r, setR] = useState(7), [u, setU] = useState(6), [moved, setMoved] = useState(false);
  const [c, setC] = useState(12), [d, setD] = useState(3);
  const fill = 10 - r;
  return <div className="space-y-3"><Tabs tabs={tambahTabs} tab={tab} set={setTab} label="Cara penjumlahan" />
    {tab === "maju" && <><div className="flex flex-wrap gap-3"><Stepper label="Mulai" value={a} set={setA} min={1} max={14} /><Stepper label="Maju" value={b} set={setB} min={1} max={Math.min(9, 20 - a)} /></div>
      <Track from={a} to={a + b} /><Result value={`maju:${a}:${b}`}>Dari {a} maju {b} langkah: {Array.from({ length: b }, (_, k) => a + k + 1).join(", ")}. Jadi {a} + {b} = {a + b}.</Result></>}
    {tab === "sepuluh" && <><div className="flex flex-wrap gap-3"><Stepper label="Merah" value={r} set={v => { setR(v); setU(Math.max(u, 11 - v)); setMoved(false); }} min={5} max={9} /><Stepper label="Hijau" value={u} set={v => { setU(v); setMoved(false); }} min={11 - r} max={9} /></div>
      <div className="flex flex-wrap items-center justify-center gap-3"><MixedFrames red={r} blue={moved ? u : 0} />{!moved && <Group thing="kelereng" alt n={u} size={24} />}</div>
      <button type="button" className="btn btn-success gap-1" onClick={() => setMoved(!moved)}>{moved ? <><RotateCcw className="size-4" aria-hidden="true" />Pisahkan lagi</> : "Penuhi bingkai 10"}</button>
      <Result value={`sepuluh:${r}:${u}:${moved ? 1 : 0}`}>{moved ? `${u} dipisah menjadi ${fill} dan ${u - fill}. ${r} + ${fill} = 10, lalu 10 + ${u - fill} = ${r + u}.` : `${r} merah dan ${u} hijau. Ketuk Penuhi bingkai 10.`}</Result></>}
    {tab === "tempat" && <><div className="flex flex-wrap gap-3"><Stepper label="Bilangan" value={c} set={setC} min={11} max={15} /><Stepper label="Tambah" value={d} set={setD} min={1} max={4} /></div>
      <Column p={{ kind: "column", a: c, op: "+", b: d, blanks: [] }} x={[]} put={() => undefined} disabled i={0} />
      <Result value={`tempat:${c}:${d}`}>Satuan: {c % 10} + {d} = {(c % 10) + d}. Puluhan tetap 1. Jadi {c} + {d} = {c + d}.</Result></>}
  </div>;
}
/** Dua bingkai 10: merah dulu, lalu biru mengisi sisa bingkai pertama dan berlanjut ke bingkai kedua. */
function MixedFrames({ red, blue }: { red: number; blue: number }) {
  const cell = (k: number) => <span key={k} className="grid size-7 place-items-center border border-neutral/20 sm:size-8">{k < red ? <Art thing="kelereng" className="size-[85%]" /> : k < red + blue ? <Art thing="kelereng" alt className="size-[85%]" /> : null}</span>;
  return <span role="img" aria-label={`${red} kelereng merah dan ${blue} kelereng hijau dalam bingkai 10`} className="inline-flex flex-col gap-1">{[0, 1].map(f => <span key={f} className="grid grid-cols-5 border-2 border-neutral/40 bg-white">{Array.from({ length: 10 }, (_, j) => cell(f * 10 + j))}</span>)}</span>;
}
const kurangTabs = [["mundur", "Hitung mundur"], ["pasangan", "Pasangan bilangan"]] as const;
function KurangLab() {
  const [tab, setTab] = useState<(typeof kurangTabs)[number][0]>("mundur");
  const [a, setA] = useState(15), [b, setB] = useState(3), [crossed, setCrossed] = useState(0);
  const ones = a % 10;
  return <div className="space-y-3"><Tabs tabs={kurangTabs} tab={tab} set={setTab} label="Cara pengurangan" />
    {tab === "mundur" && <><div className="flex flex-wrap gap-3"><Stepper label="Mulai" value={a} set={setA} min={11} max={20} /><Stepper label="Mundur" value={b} set={setB} min={1} max={9} /></div>
      <Track from={a} to={a - b} /><Result value={`mundur:${a}:${b}`}>Dari {a} mundur {b} langkah: {Array.from({ length: b }, (_, k) => a - k - 1).join(", ")}. Jadi {a} − {b} = {a - b}.</Result></>}
    {tab === "pasangan" && <><Stepper label="Apel" value={a} set={v => { setA(Math.max(11, Math.min(19, v))); setCrossed(0); }} min={11} max={19} />
      <div className="flex flex-wrap items-end justify-center gap-4"><PvScene bundle="kantong" ones={0} /><div className="flex flex-wrap gap-1">{Array.from({ length: ones }, (_, k) => <button key={k} type="button" aria-label={`Apel satuan ${k + 1}`} aria-pressed={k < crossed} onClick={() => setCrossed(k < crossed ? k : k + 1)} className={`relative size-11 rounded-full ${k < crossed ? "opacity-35" : ""}`}><Art thing="apel" className="h-full w-full" />{k < crossed && <svg viewBox="0 0 24 24" className="absolute inset-0" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" /></svg>}</button>)}</div></div>
      <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setCrossed(0)}><Eraser className="size-4" aria-hidden="true" />Hapus coretan</button>
      <Result value={`pasangan:${a}:${crossed}`}>{a} dipisah menjadi 10 dan {ones}. {crossed ? `${ones} − ${crossed} = ${ones - crossed}, lalu 10 + ${ones - crossed} = ${a - crossed}. Jadi ${a} − ${crossed} = ${a - crossed}.` : "Ketuk apel satuan untuk mencoretnya."}</Result></>}
  </div>;
}
const labs: Record<string, () => ReactNode> = { selisih: SelisihLab, tambah: TambahLab, kurang: KurangLab };

export default function GradeOneOp20V2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Penjumlahan dan Pengurangan sampai dengan 20</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Bandingkan dua kelompok dengan kata lebih, kurang, dan selisih, lalu jumlahkan dan kurangkan bilangan sampai 20.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-3"><Group thing="donat" n={7} size={22} /><Group thing="donat" n={6} size={22} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Membantu Ibu</h2>
        <p className="mt-2">Hari Minggu Tika membantu Ibu menghias donat. Ibu menghias 7 donat, Tika menghias 6 donat. Siapa yang menghias lebih banyak, dan berapa semuanya?</p>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-operasi-20">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-operasi-20" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-lg leading-8">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-3 rounded-lg bg-info/10 p-3"><strong>Coba bersama. </strong>{t.demo}</p>
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
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 6"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.72]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
