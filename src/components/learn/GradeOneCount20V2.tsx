"use client";

import { ArrowLeft, ArrowRight, Eraser, Footprints, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Art } from "./GradeOneSub10Art";
import { CaterHead, Cone, Jar, numName, Objs, PvScene, TenFrames } from "./GradeOneCount20Art";
import { assessment, cells, correct, formatAnswer, practice, ready, SEP, splitParts, topics, type Part, type Scene, type SQuestion } from "@/data/grade-one-count20-v2";
import { thingName } from "@/data/grade-one-sub10-v2";

const ink = "#2b2320";
const sel = (on: boolean) => (on ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300");
const ids = (v: string) => (v ? v.split(",").filter(Boolean) : []);

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
const Box = ({ children, label }: { children: ReactNode; label?: string }) => <div className="flex flex-col items-center gap-1"><div className="flex min-h-20 items-center justify-center rounded-2xl border-4 border-orange-300 bg-white p-2">{children}</div>{label && <span className="rounded-full bg-orange-100 px-3 text-sm font-bold">{label}</span>}</div>;
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "objs": return <Box><Objs thing={scene.thing} n={scene.n} layout={scene.layout} size={scene.layout === "frames" ? 28 : 30} /></Box>;
    case "pv": return <PvScene bundle={scene.bundle} ones={scene.ones} />;
    case "jar": return <Jar thing={scene.thing} n={scene.n} />;
    case "groups": { const small = scene.ns.length > 2 || scene.layout === "frames";
      return <div className="flex flex-wrap items-start justify-center gap-2">{scene.ns.map((n, k) => <Box key={k} label={scene.labels[k]}><Objs thing={scene.thing} n={n} layout={scene.layout} size={small ? 15 : 19} spread={scene.spread?.[k] ?? 1} label={`${scene.labels[k]}: ${thingName[scene.thing]}`} /></Box>)}</div>; }
  }
}

/* ====================================================================== */
/* Bentuk jawaban                                                          */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled, round = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; round?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`h-12 w-14 border-4 border-orange-400 bg-white text-center text-2xl font-extrabold text-neutral focus:border-success focus:outline-none sm:h-14 sm:w-16 sm:text-3xl ${round ? "rounded-full" : "rounded-2xl"}`} />;
}
function Bond({ whole, parts, values, set, disabled }: { whole: number | null; parts: [number | null, number | null]; values?: string[]; set?: (k: number, v: string) => void; disabled?: boolean }) {
  let k = 0;
  const slot = (n: number | null, label: string, big = false) => { if (n !== null) return <span className={`grid place-items-center rounded-full border-4 bg-white font-extrabold ${big ? "size-20 border-purple-400 text-3xl" : "size-16 border-orange-400 text-2xl"}`}>{n}</span>;
    const i = k++; return <span className={`grid place-items-center rounded-full border-4 bg-orange-50 ${big ? "size-20 border-purple-400" : "size-16 border-orange-400"}`}><NumBox round label={label} value={values?.[i] ?? ""} onChange={v => set?.(i, v)} disabled={disabled} /></span>; };
  const w = slot(whole, "Gabungan", true), a = slot(parts[0], "Bagian pertama"), b = slot(parts[1], "Bagian kedua");
  return <div className="flex items-center justify-center gap-1" role="group" aria-label="Pasangan bilangan">{w}<svg viewBox="0 0 40 100" className="h-28 w-8" aria-hidden="true"><path d="M2 50L38 18M2 50l36 32" stroke="#a78bfa" strokeWidth="3" /></svg><div className="flex flex-col gap-2">{a}{b}</div></div>;
}
function Table({ value, put, disabled, i }: { value: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number }) {
  return <table className="mx-auto border-collapse text-center"><thead><tr>{["Puluhan", "Satuan"].map(h => <th key={h} className="border-2 border-purple-300 bg-purple-100 px-3 py-1 text-base font-bold">{h}</th>)}</tr></thead>
    <tbody><tr>{[0, 1].map(k => <td key={k} className="border-2 border-purple-300 bg-white p-1"><NumBox label={`Bagian ${i + 1} ${k ? "satuan" : "puluhan"}`} value={value[k]} onChange={v => put(k, v)} disabled={disabled} /></td>)}</tr></tbody></table>;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [pick, setPick] = useState<number | null>(null);
  const vals = cells(p, value), n = p.left.length, H = 1000;
  return <div className="space-y-1">
    <p className="text-sm text-base-content/70">{pick === null ? "Ketuk gambar di kiri, lalu ketuk bilangannya di kanan." : "Sekarang ketuk bilangannya."}</p>
    <div className="mx-auto grid max-w-md grid-cols-[auto_minmax(2rem,1fr)_4.5rem]" style={{ height: n * 74 }}>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih gambar ${"abcd"[k]}`} aria-pressed={pick === k} onClick={() => setPick(pick === k ? null : k)}
        className={`flex items-center gap-1 rounded-2xl border-4 px-1 ${pick === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-sky-300 bg-base-100" : "border-orange-200 bg-orange-50"}`}><span className="text-sm font-bold">{"abcd"[k]}</span><TenFrames n={l} thing={p.thing} cell={14} /></button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / n) * H} stroke="#0f766e" strokeWidth="3" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || pick === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (pick === null) return; const v = [...vals]; v[pick] = String(j); set(v.join("|")); setPick(null); }}
        className="rounded-2xl border-4 border-orange-400 bg-white text-3xl font-extrabold disabled:opacity-100">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
/** Benda yang bisa diketuk: dilingkari (ring) atau diwarnai (paint). */
function TapGrid({ p, value, set, checked }: { p: Extract<Part, { kind: "ring" | "paint" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const on = ids(value), ring = p.kind === "ring";
  const toggle = (k: number) => set((on.includes(String(k)) ? on.filter(x => x !== String(k)) : [...on, String(k)]).join(","));
  return <div className="space-y-1">
    <div className="mx-auto grid w-fit grid-cols-5 gap-1 rounded-2xl border-4 border-orange-300 bg-white p-1.5 sm:grid-cols-6">{Array.from({ length: p.n }, (_, k) => { const x = on.includes(String(k));
      return <button key={k} type="button" disabled={checked} aria-label={`${thingName[p.thing]} ${k + 1}`} aria-pressed={x} onClick={() => toggle(k)} className={`grid size-12 place-items-center rounded-full border-4 ${x ? (ring ? "border-orange-500 bg-orange-50" : "border-transparent") : "border-transparent"}`}>
        {ring ? <Art thing={p.thing} className="size-9" /> : <Ball red={x} />}</button>; })}</div>
    <p className="text-center text-base font-bold">{on.length} {ring ? "dilingkari" : "diwarnai merah"}</p>
  </div>;
}
const Ball = ({ red }: { red: boolean }) => <svg viewBox="0 0 24 24" className="size-10" aria-hidden="true"><circle cx="12" cy="12" r="10" fill={red ? "#ef4444" : "#fff"} stroke={ink} strokeWidth="1.2" /><path d="M2.6 9.4c6 1.4 12.6 1 19-1.4M3.6 16.4c5.4-.6 11-2.4 16.4-5.2M7 3.6c-2 4-2.4 10 1 17" stroke={ink} strokeWidth="1" fill="none" /></svg>;
function FramesPart({ value, set, checked }: { value: string; set: (v: string) => void; checked: boolean }) {
  const on = ids(value).map(Number);
  const toggle = (k: number) => set((on.includes(k) ? on.filter(x => x !== k) : [...on, k]).sort((a, b) => a - b).join(","));
  const frame = (f: number) => <div className="grid grid-cols-2 border-2 border-neutral/50 bg-white" role="group" aria-label={`Bingkai ${f + 1}`}>{Array.from({ length: 10 }, (_, j) => { const k = f * 10 + j;
    return <button key={k} type="button" disabled={checked} aria-label={`Lingkaran ${k + 1}`} aria-pressed={on.includes(k)} onClick={() => toggle(k)} className="grid size-10 place-items-center border border-neutral/20 sm:size-11"><span className={`size-7 rounded-full border-2 border-neutral/60 ${on.includes(k) ? "bg-red-500" : "bg-white"}`} /></button>; })}</div>;
  return <div className="flex flex-col items-center gap-1"><div className="flex gap-3">{frame(0)}{frame(1)}</div><p className="text-sm text-base-content/70">Penuhi bingkai pertama dulu, lalu bingkai kedua.</p></div>;
}
function SeqPart({ p, value, set, checked, i }: { p: Extract<Part, { kind: "seq" }>; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  let k = 0;
  const cell = (n: number | null) => { if (n !== null) return <span className="text-2xl font-extrabold sm:text-3xl">{n}</span>; const j = k++; return <NumBox label={`Bagian ${i + 1} kotak ${j + 1}`} value={x[j]} onChange={v => put(j, v)} disabled={checked} />; };
  if (p.look === "tabel") return <div className="mx-auto grid w-fit grid-cols-5 border-2 border-neutral/60">{p.items.map((n, j) => <span key={j} className="grid h-14 w-16 place-items-center border border-neutral/40 bg-white">{cell(n)}</span>)}</div>;
  if (p.look === "eskrim") return <div className="flex flex-wrap justify-center gap-1.5">{p.items.map((n, j) => <Cone key={j}>{cell(n)}</Cone>)}</div>;
  return <div className="flex items-center justify-center"><CaterHead />{p.items.map((n, j) => <span key={j} className="-ms-2 grid size-16 place-items-center rounded-full border-4 border-[#5aa83a] bg-white shadow-[0_6px_0_-2px_#e23d3d]">{cell(n)}</span>)}</div>;
}
function OrderPart({ p, value, set, checked }: { p: Extract<Part, { kind: "order" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const on = ids(value).map(Number);
  return <div role="group" aria-label={p.label} className="space-y-1.5"><p className="text-lg font-bold">{p.label}:</p>
    <div className="flex flex-wrap items-center gap-2">
      {p.nums.map((n, k) => <button key={k} type="button" aria-label={`Kartu ${n}`} disabled={checked || on.includes(k)} onClick={() => set([...on, k].join(","))} className="grid h-14 w-16 place-items-center rounded-2xl border-4 border-sky-400 bg-sky-50 text-2xl font-extrabold disabled:opacity-30">{n}</button>)}
      <span aria-hidden="true" className="px-1 text-base-content/40">|</span>
      {p.nums.map((_, k) => <span key={k} className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-dashed border-orange-400 bg-white text-2xl font-extrabold">{on[k] !== undefined ? p.nums[on[k]] : ""}</span>)}
      <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !on.length} onClick={() => set(on.slice(0, -1).join(","))}><Undo2 className="size-4" aria-hidden="true" />Hapus</button>
    </div></div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xl font-bold sm:text-2xl">{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => <span key={k} className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{b.trim() && <span>{b.trim()}</span>}</span>)}</p>; }
    case "table": return <Table value={x} put={put} disabled={checked} i={i} />;
    case "bond": return <Bond whole={p.whole} parts={p.parts} values={x} set={put} disabled={checked} />;
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "ring": case "paint": return <TapGrid p={p} value={value} set={set} checked={checked} />;
    case "frames": return <FramesPart value={value} set={set} checked={checked} />;
    case "seq": return <SeqPart p={p} value={value} set={set} checked={checked} i={i} />;
    case "pick": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-2"><p className="text-lg font-bold">{p.label}</p>
      {p.options.map(o => <button key={o} type="button" aria-pressed={value === o} disabled={checked} onClick={() => set(o)} className={`min-h-12 rounded-full border-4 px-4 text-xl font-extrabold ${sel(value === o)}`}>{o}</button>)}</div>;
    case "order": return <OrderPart p={p} value={value} set={set} checked={checked} />;
    case "guess": return <div className="flex flex-wrap items-center gap-4 text-xl font-bold"><label className="flex items-center gap-2">Tebakanku<NumBox label="Tebakanku" value={x[0]} onChange={v => put(0, v)} disabled={checked} /></label><label className="flex items-center gap-2">Hitunganku<NumBox label="Hitunganku" value={x[1]} onChange={v => put(1, v)} disabled={checked} /></label></div>;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1.5 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
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
function BilangLab() {
  const [n, setN] = useState(13);
  return <div className="space-y-3">
    <Stepper label="Kelereng" value={n} set={setN} min={0} max={20} />
    <div className="flex justify-center"><TenFrames n={n} cell={34} /></div>
    <p className="text-center text-5xl font-extrabold tabular-nums">{n}</p>
    <Result value={`bilang:${n}`}>{n > 10 ? `10 ditambah ${n - 10} menjadi ${n}, dibaca ${numName(n)}.` : `${n}, dibaca ${numName(n)}.`}</Result>
  </div>;
}
function MajuLab() {
  const [start, setStart] = useState(10), [dir, setDir] = useState<1 | -1>(1), [step, setStep] = useState(1), [k, setK] = useState(0);
  const path = Array.from({ length: k + 1 }, (_, j) => start + dir * step * j), pos = path[k], next = pos + dir * step;
  const reset = (f: () => void) => { f(); setK(0); };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      <div role="radiogroup" aria-label="Arah" className="flex gap-1">{([[1, "Maju"], [-1, "Mundur"]] as const).map(([d, n]) => <button key={n} type="button" role="radio" aria-checked={dir === d} onClick={() => reset(() => { setDir(d); setStart(d === 1 ? 10 : 20); })} className={`btn btn-sm ${dir === d ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>
      <div role="radiogroup" aria-label="Langkah" className="flex gap-1">{[1, 2].map(s => <button key={s} type="button" role="radio" aria-checked={step === s} onClick={() => reset(() => setStep(s))} className={`btn btn-sm ${step === s ? "btn-success" : "btn-outline"}`}>Langkah {s}</button>)}</div>
    </div>
    <Stepper label="Mulai dari" value={start} set={v => reset(() => setStart(v))} min={0} max={20} />
    <div className="grid grid-cols-7 gap-1 sm:grid-cols-[repeat(11,minmax(0,1fr))]">{Array.from({ length: 21 }, (_, j) => j).map(j => <span key={j} className={`grid h-11 place-items-center rounded-full border-2 text-lg font-extrabold ${j === pos ? "border-[#5aa83a] bg-[#8bd45a]" : path.includes(j) ? "border-[#5aa83a] bg-[#dff3cc]" : "border-base-300 bg-white"}`}>{j}</span>)}</div>
    <div className="flex gap-2"><button type="button" className="btn btn-success gap-2" disabled={next < 0 || next > 20} onClick={() => setK(k + 1)}><Footprints className="size-5" aria-hidden="true" />Langkah</button><button type="button" className="btn btn-ghost gap-1" onClick={() => setK(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    <Result value={`maju:${start}:${dir}:${step}:${pos}`}>{k === 0 ? `Mulai dari ${start}. Ketuk Langkah.` : `${dir === 1 ? "Menghitung maju" : "Menghitung mundur"}: ${path.join(", ")}.`}</Result>
  </div>;
}
function TempatLab() {
  const [n, setN] = useState(12), tens = Math.floor(n / 10), ones = n % 10;
  return <div className="space-y-3">
    <Stepper label="Kelereng" value={n} set={setN} min={0} max={20} />
    <div className="grid grid-cols-2 gap-2 text-center">
      <div className="rounded-2xl border-2 border-purple-300 bg-white p-2"><p className="font-bold">Puluhan</p><div className="flex min-h-24 items-center justify-center gap-1">{Array.from({ length: tens }, (_, k) => <PvScene key={k} bundle="kantong" ones={0} />)}</div><p className="text-4xl font-extrabold">{tens}</p></div>
      <div className="rounded-2xl border-2 border-purple-300 bg-white p-2"><p className="font-bold">Satuan</p><div className="flex min-h-24 flex-wrap items-center justify-center gap-0.5">{Array.from({ length: ones }, (_, k) => <Art key={k} thing="kelereng" className="size-7" />)}</div><p className="text-4xl font-extrabold">{ones}</p></div>
    </div>
    <Result value={`tempat:${n}`}>{tens} puluhan dan {ones} satuan = {n}.{n === 10 || n === 20 ? " Sepuluh kelereng masuk kantong menjadi 1 puluhan." : ""}</Result>
  </div>;
}
function BandingLab() {
  const [a, setA] = useState(15), [b, setB] = useState(11);
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Kira" value={a} set={setA} min={10} max={20} /><Stepper label="Tika" value={b} set={setB} min={10} max={20} /></div>
    <div className="flex flex-wrap justify-center gap-3">{[["Apel Kira", a], ["Apel Tika", b]].map(([l, n]) => <Box key={l as string} label={l as string}><TenFrames n={n as number} thing="apel" cell={22} /></Box>)}</div>
    <Result value={`banding:${a}:${b}`}>{a === b ? `Sama banyak: ${a} dan ${b}.` : a > b ? `${a} lebih banyak dari ${b}. Apel Kira lebih banyak.` : `${a} lebih sedikit dari ${b}. Apel Tika lebih banyak.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { bilang: BilangLab, maju: MajuLab, tempat: TempatLab, banding: BandingLab };

export default function GradeOneCount20V2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Ayo Membilang sampai dengan 20</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Hitung benda sampai 20, hitung maju dan mundur, kenali puluhan dan satuan, lalu bandingkan bilangan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><TenFrames n={15} cell={20} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Merapikan mainan</h2>
        <p className="mt-2">Halim dan Malosi selesai bermain kelereng. Halim menghitung kelereng: 9, 10, 11, … lalu menyimpannya di stoples. Berapa banyak kelereng Halim?</p>
        <p className="mt-2 text-sm text-base-content/60">4 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bilang-20">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bilang-20" ref={area} className="mt-8 scroll-mt-20">
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
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.72]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
