"use client";

import { ArrowLeft, ArrowRight, Eye, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Art, Many } from "./GradeOneSub10Art";
import { assessment, cells, correct, formatAnswer, practice, ready, SEP, splitParts, thingName, topics, type Part, type Scene, type SQuestion, type Thing } from "@/data/grade-one-sub10-v2";

const ink = "#2b2320";

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
const Box = ({ children, label, dashed = false }: { children: ReactNode; label?: string; dashed?: boolean }) => <div className={`flex min-h-24 min-w-24 flex-col items-center justify-center gap-1 rounded-2xl border-4 bg-white p-2 ${dashed ? "border-dashed border-rose-300" : "border-orange-300"}`}>{children}{label && <span className="text-sm font-bold text-base-content/70">{label}</span>}</div>;
const size = (n: number) => (n > 8 ? "size-7 sm:size-10" : n > 4 ? "size-8 sm:size-11" : "size-10 sm:size-12");
/** Bingkai 10 berisi `n` benda di petak awal. */
function Frame({ thing, n }: { thing: Thing; n: number }) {
  return <div role="img" aria-label={`bingkai 10 berisi ${n} ${thingName[thing]}`} className="grid grid-cols-5 gap-1 rounded-xl border-4 border-sky-400 bg-white p-1">
    {Array.from({ length: 10 }, (_, k) => <span key={k} className="grid size-12 place-items-center rounded-lg border-2 border-sky-200 bg-white sm:size-14">{k < n && <Art thing={thing} className="size-10" />}</span>)}
  </div>;
}
/** Garis bilangan 0–10. Lompatan digambar dari `start` ke `to` (maju atau mundur). */
function HopLine({ start, to, pick, disabled, showHops = true }: { start: number; to: number; pick?: (n: number) => void; disabled?: boolean; showHops?: boolean }) {
  const x = (n: number) => 15 + n * 30, dir = to < start ? -1 : 1, hops = Math.abs(to - start);
  return <div className="w-full max-w-xl">
    <svg viewBox="0 0 330 60" className="h-auto w-full" aria-hidden="true">
      <defs><marker id="backArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#dc2626" /></marker></defs>
      {showHops && Array.from({ length: hops }, (_, i) => { const a = x(start + dir * i), b = x(start + dir * (i + 1)); return <path key={i} d={`M${a} 50 Q${(a + b) / 2} 12 ${b} 50`} fill="none" stroke="#dc2626" strokeWidth="2.4" markerEnd="url(#backArrow)" />; })}
      <circle cx={x(start)} cy="50" r="7" fill="#f4a12f" stroke={ink} strokeWidth="1.2" />
    </svg>
    <div className="grid grid-cols-11 gap-0.5">{Array.from({ length: 11 }, (_, n) => <button key={n} type="button" disabled={disabled || !pick} aria-label={`Bilangan ${n}`} aria-pressed={to === n && n !== start} onClick={() => pick?.(n)}
      className={`grid h-11 place-items-center rounded-lg border-2 text-lg font-extrabold sm:text-xl ${n === start ? "border-orange-400 bg-orange-100" : to === n ? "border-error bg-error/15" : "border-base-300 bg-white"} disabled:opacity-100`}>{n}</button>)}</div>
  </div>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "gone": return <div className="flex w-full max-w-xl flex-wrap items-stretch justify-center gap-3">
      <Box><Many thing={scene.thing} n={scene.stay} size={size(scene.stay)} label={`${scene.stay} ${thingName[scene.thing]} tetap ada`} /></Box>
      {scene.away.map((a, i) => <Box key={i} dashed label={a.verb}><Many thing={scene.thing} n={a.n} gone size={size(a.n)} label={`${a.n} ${thingName[scene.thing]} ${a.verb}`} /></Box>)}</div>;
    case "boxes": return <div className="flex w-full max-w-lg gap-3"><div className="flex-1"><Box><Many thing={scene.thing} n={scene.a} size={size(scene.a)} /></Box></div><div className="flex-1"><Box><Many thing={scene.thing} n={scene.b} alt size={size(scene.b)} /></Box></div></div>;
    case "story": { const sz = (n: number) => (scene.away.length > 1 || scene.left !== undefined ? "size-5 sm:size-9" : size(n)), q = <span className="grid size-12 place-items-center rounded-full bg-base-200 text-3xl font-extrabold text-base-content/70" aria-label="belum diketahui">?</span>;
      return <div className="flex w-full max-w-2xl flex-wrap items-center justify-center gap-1 sm:gap-2">
        <Box label="mula-mula"><Many thing={scene.thing} n={scene.first} size={sz(scene.first)} /></Box>
        {scene.away.map((a, i) => <span key={i} className="flex items-center gap-2"><Minus className="size-6 shrink-0 text-error" strokeWidth={2.5} aria-hidden="true" /><Box dashed label={a.verb}>{a.n === null ? q : <Many thing={scene.thing} n={a.n} gone size={sz(a.n)} label={`${a.n} ${thingName[scene.thing]} ${a.verb}`} />}</Box></span>)}
        {scene.left !== undefined && <span className="flex items-center gap-2"><span className="text-3xl font-extrabold" aria-hidden="true">=</span><Box label="tersisa"><Many thing={scene.thing} n={scene.left} size={sz(scene.left)} /></Box></span>}
      </div>; }
    case "frame": return <Frame thing={scene.thing} n={scene.n} />;
    case "line": return <div role="img" aria-label={`garis bilangan, mulai di ${scene.from}, mendarat di ${scene.to}`} className="w-full max-w-xl"><HopLine start={scene.from} to={scene.to} showHops={false} /></div>;
  }
}

/* ====================================================================== */
/* Bagian interaktif bersama                                               */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled, round = false, small = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; round?: boolean; small?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`${small ? "h-12 w-12 text-2xl sm:h-14 sm:w-16 sm:text-3xl" : "h-14 w-16 text-3xl"} border-4 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none ${round ? "rounded-full" : "rounded-2xl"}`} />;
}
/** Pasangan bilangan: lingkaran gabungan di kiri, dua lingkaran sebagian di kanan. */
function BondView({ whole, parts, values, set, disabled }: { whole: number | null; parts: [number | null, number | null]; values?: string[]; set?: (k: number, v: string) => void; disabled?: boolean }) {
  let k = 0;
  const slot = (n: number | null, label: string, big = false) => { if (n !== null) return <span className={`grid place-items-center rounded-full border-4 bg-white font-extrabold ${big ? "size-20 border-purple-400 text-4xl" : "size-16 border-orange-400 text-3xl"}`}>{n}</span>;
    const i = k++; return <span className={`grid place-items-center rounded-full border-4 bg-orange-50 ${big ? "size-20 border-purple-400" : "size-16 border-orange-400"}`}><NumBox round label={label} value={values?.[i] ?? ""} onChange={v => set?.(i, v)} disabled={disabled} /></span>; };
  const w = slot(whole, "Gabungan", true), a = slot(parts[0], "Sebagian pertama"), b = slot(parts[1], "Sebagian kedua");
  return <div className="flex items-center gap-1" role="group" aria-label="Pasangan bilangan">
    <div className="flex flex-col items-center">{w}<span className="text-xs font-bold text-purple-700">Gabungan</span></div>
    <svg viewBox="0 0 40 100" className="h-28 w-8" aria-hidden="true"><path d="M2 50L38 18M2 50l36 32" stroke="#a78bfa" strokeWidth="3" /></svg>
    <div className="flex flex-col gap-2">{[a, b].map((x, i) => <div key={i} className="flex items-center gap-1">{x}<span className="text-xs font-bold text-orange-700">Sebagian</span></div>)}</div>
  </div>;
}
/** Benda yang bisa dicoret dengan diketuk. */
function CrossGrid({ thing, total, crossed, toggle, disabled }: { thing: Thing; total: number; crossed: boolean[]; toggle?: (k: number) => void; disabled?: boolean }) {
  return <div role="group" aria-label={`${total} ${thingName[thing]}, ketuk untuk mencoret`} className="grid grid-cols-5 gap-1 rounded-xl border-4 border-sky-400 bg-white p-1">
    {Array.from({ length: total }, (_, k) => <button key={k} type="button" disabled={disabled || !toggle} aria-label={`${thingName[thing]} ${k + 1}`} aria-pressed={crossed[k]} onClick={() => toggle?.(k)}
      className="relative grid size-12 place-items-center rounded-lg border-2 border-sky-200 bg-white disabled:opacity-100 sm:size-14">
      <span className={crossed[k] ? "opacity-35" : ""}><Art thing={thing} className="size-10" /></span>
      {crossed[k] && <svg viewBox="0 0 24 24" className="absolute inset-1" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" /></svg>}
    </button>)}
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-2xl bg-success/10 p-3 text-xl font-bold leading-8">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="flex items-center gap-2"><span className="text-base font-bold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-circle btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-5" aria-hidden="true" /></button>
    <span className="min-w-8 text-center text-3xl font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-circle btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-5" aria-hidden="true" /></button></span>;
}
const flip = (a: boolean[], i: number) => a.map((x, j) => (j === i ? !x : x));
const labThings: Thing[] = ["apel", "telur", "kupu"];
function AmbilLab() {
  const [thing, setThing] = useState<Thing>("apel"), [n, setN] = useState(6), [cr, setCr] = useState<boolean[]>(Array(10).fill(false));
  const k = cr.slice(0, n).filter(Boolean).length;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Benda" className="flex flex-wrap gap-2">{labThings.map(t => <button key={t} type="button" role="radio" aria-checked={thing === t} onClick={() => setThing(t)} className={`btn gap-1 ${thing === t ? "btn-success" : "btn-outline"}`}><Art thing={t} className="size-6" />{thingName[t]}</button>)}</div>
    <Stepper label="Mula-mula" value={n} set={v => { setN(v); setCr(Array(10).fill(false)); }} min={1} max={10} />
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.85]"><CrossGrid thing={thing} total={n} crossed={cr} toggle={i => setCr(flip(cr, i))} /></div>
    <button type="button" className="btn btn-ghost gap-1" onClick={() => setCr(Array(10).fill(false))}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    <Result value={`${n}-${k}`}>{k === 0 ? <>Ada {n} {thingName[thing]}. Ketuk benda yang diambil.</> : <>{n} − {k} = {n - k}. Tersisa {n - k} {thingName[thing]}.</>}</Result>
  </div>;
}
const caraTabs = [["pasangan", "Pasangan"], ["mundur", "Hitung mundur"], ["sepuluh", "Dari 10"]] as const;
function CaraLab() {
  const [tab, setTab] = useState<(typeof caraTabs)[number][0]>("pasangan");
  const [n, setN] = useState(6), [split, setSplit] = useState<boolean[]>(Array(10).fill(false));
  const [start, setStart] = useState(5), [hops, setHops] = useState(0);
  const [ten, setTen] = useState<boolean[]>(Array(10).fill(false));
  const k = split.slice(0, n).filter(Boolean).length, t = ten.filter(Boolean).length;
  return <div className="space-y-3">
    <div role="tablist" aria-label="Cara pengurangan" className="flex flex-wrap gap-1.5">{caraTabs.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`btn btn-sm ${tab === key ? "btn-success" : "btn-outline"}`}>{label}</button>)}</div>
    {tab === "pasangan" && <>
      <Stepper label="Banyak apel" value={n} set={v => { setN(v); setSplit(Array(10).fill(false)); }} min={2} max={10} />
      <div className="flex flex-wrap justify-center gap-1">{Array.from({ length: n }, (_, i) => <button key={i} type="button" aria-label={`Apel ${i + 1}`} aria-pressed={split[i]} onClick={() => setSplit(flip(split, i))} className="rounded-xl p-0.5 hover:bg-base-200"><Art thing="apel" alt={split[i]} className="size-11" /></button>)}</div>
      <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8]"><BondView whole={n} parts={[k, n - k]} /></div>
      <Result value={`pasangan:${n}:${k}`}>Ketuk apel untuk mengubahnya menjadi hijau. {n} − {k} = {n - k} dan {n} − {n - k} = {k}.</Result>
    </>}
    {tab === "mundur" && <>
      <Stepper label="Mulai dari" value={start} set={v => { setStart(v); setHops(0); }} min={1} max={10} />
      <HopLine start={start} to={start - hops} />
      <div className="flex gap-2"><button type="button" className="btn btn-success gap-2" disabled={start - hops <= 0} onClick={() => setHops(hops + 1)}><Undo2 className="size-5" aria-hidden="true" />Mundur</button><button type="button" className="btn btn-ghost gap-1" onClick={() => setHops(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
      <Result value={`mundur:${start}:${hops}`}>{hops === 0 ? `Katak di angka ${start}. Ketuk Mundur.` : `${start} − ${hops} = ${start - hops}. Hitung mundur: ${Array.from({ length: hops }, (_, i) => start - i - 1).join(", ")}.`}</Result>
    </>}
    {tab === "sepuluh" && <>
      <div className="flex justify-center"><CrossGrid thing="kelereng" total={10} crossed={ten} toggle={i => setTen(flip(ten, i))} /></div>
      <Result value={`sepuluh:${t}`}>{t === 0 ? "Ada 10 kelereng. Ketuk kelereng untuk mengambilnya." : `10 − ${t} = ${10 - t} dan 10 − ${10 - t} = ${t}.`}</Result>
    </>}
  </div>;
}
function KeluargaLab() {
  const [a, setA] = useState(4), [b, setB] = useState(3), [f, setF] = useState(0);
  const sum = a + b;
  const facts = [`${a} + ${b} = ${sum}`, `${b} + ${a} = ${sum}`, `${sum} − ${b} = ${a}`, `${sum} − ${a} = ${b}`];
  // Benda yang dicoret: kalimat ke-3 mengambil yang hijau, ke-4 mengambil yang merah.
  const gone = (i: number) => (f === 2 && i >= a) || (f === 3 && i < a);
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Merah" value={a} set={setA} min={1} max={5} /><Stepper label="Hijau" value={b} set={setB} min={1} max={5} /></div>
    <div className="flex flex-wrap justify-center gap-1 rounded-2xl border-4 border-orange-300 bg-white p-2 [@media(max-height:700px)]:[zoom:0.85]" role="img" aria-label={`${a} kelereng merah dan ${b} kelereng hijau`}>
      {Array.from({ length: sum }, (_, i) => <span key={i} className={`relative ${gone(i) ? "opacity-30" : ""}`}><Art thing="kelereng" alt={i >= a} className="size-11 sm:size-12" />{gone(i) && <svg viewBox="0 0 24 24" className="absolute inset-0" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" /></svg>}</span>)}
    </div>
    <div role="radiogroup" aria-label="Keluarga bilangan" className="grid grid-cols-2 gap-2">{facts.map((x, i) => <button key={i} type="button" role="radio" aria-checked={f === i} onClick={() => setF(i)} className={`btn h-auto min-h-12 whitespace-nowrap px-2 text-xl sm:text-2xl ${f === i ? "btn-success" : "btn-outline"}`}>{x}</button>)}</div>
    <Result value={`keluarga:${a}:${b}:${f}`}>{f < 2 ? `Merah dan hijau digabung: ${facts[f]}.` : f === 2 ? `Yang hijau diambil, tersisa merah: ${facts[2]}.` : `Yang merah diambil, tersisa hijau: ${facts[3]}.`}</Result>
  </div>;
}
const stories: [Thing, string, string][] = [["burung", "di pohon", "terbang"], ["ikan", "di kolam", "ditangkap"], ["siswa", "di kelas", "pulang"]];
function CeritaLab() {
  const [t, setT] = useState(0), [a, setA] = useState(8), [b, setB] = useState(2), [show, setShow] = useState(false);
  const [thing, where, verb] = stories[t], name = thingName[thing], bb = Math.min(b, a);
  const reset = (fn: () => void) => { fn(); setShow(false); };
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-2 [@media(max-height:700px)]:[zoom:0.82]">
    <div role="radiogroup" aria-label="Cerita" className="flex flex-wrap gap-2">{stories.map(([th], i) => <button key={th} type="button" role="radio" aria-checked={t === i} onClick={() => reset(() => setT(i))} className={`btn gap-1 ${t === i ? "btn-success" : "btn-outline"}`}><Art thing={th} className="size-6" />{thingName[th]}</button>)}</div>
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Mula-mula" value={a} set={n => reset(() => setA(n))} min={2} max={10} /><Stepper label={verb[0].toUpperCase() + verb.slice(1)} value={bb} set={n => reset(() => setB(n))} min={1} max={a - 1} /></div>
    <p className="rounded-2xl bg-base-100 p-3 text-xl font-bold leading-8">Ada {a} {name} {where}. Sebanyak {bb} {name} {verb}. Berapa {name} yang tersisa?</p>
    <div className="flex justify-center"><SceneView scene={{ type: "gone", thing, stay: a - bb, away: [{ n: bb, verb }] }} /></div>
    <button type="button" className="btn btn-success btn-lg gap-2" onClick={() => setShow(!show)}><Eye className="size-5" aria-hidden="true" />{show ? "Tutup jawaban" : "Lihat penyelesaian"}</button>
    <Result value={`${a}-${bb}:${show ? 1 : 0}`}>{show ? <>Penyelesaian: {a} − {bb} = {a - bb}. Tersisa {a - bb} {name}.</> : "Tebak dulu sisanya, lalu ketuk Lihat penyelesaian."}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { ambil: AmbilLab, cara: CaraLab, keluarga: KeluargaLab, cerita: CeritaLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
const ids = (v: string) => (v ? v.split(",").filter(Boolean) : []);
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□"), small = bits.length > 3;
      return <p className={`flex flex-wrap items-center gap-y-2 text-2xl font-bold sm:text-3xl ${small ? "gap-x-1 sm:gap-x-2" : "gap-x-2"}`}>{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => <span key={k} className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox small={small} label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{b.trim() && <span>{b.trim()}</span>}</span>)}</p>; }
    case "bond": return <div className="flex justify-center"><BondView whole={p.whole} parts={p.parts} values={x} set={put} disabled={checked} /></div>;
    case "back": return <div className="space-y-1"><p className="text-base text-base-content/70">Katak mulai di angka {p.start} (oranye). Ketuk angka tempat katak mendarat.</p><HopLine start={p.start} to={value ? Number(value) : p.start} pick={n => set(n === p.start ? "" : String(n))} disabled={checked} showHops={!!value && Number(value) < p.start} /><p className="text-2xl font-bold">{p.start} − {p.steps} = {value || "…"}</p></div>;
    case "cross": { const sel = ids(value), crossed = Array.from({ length: p.total }, (_, k) => sel.includes(String(k)));
      return <div className="flex flex-col items-center gap-1"><CrossGrid thing={p.thing} total={p.total} crossed={crossed} disabled={checked} toggle={k => { const s = crossed[k] ? sel.filter(y => y !== String(k)) : [...sel, String(k)]; set(s.join(",")); }} /><span className="text-base font-bold">{sel.length} dicoret</span></div>; }
    case "sign": return <div role="group" aria-label={`Kalimat ${i + 1}: ${p.a} □ ${p.b} = ${p.c}`} className="flex flex-wrap items-center gap-2 text-3xl font-extrabold"><span>{p.a}</span>
      {(["+", "−"] as const).map(o => <button key={o} type="button" aria-label={`Tanda ${o === "+" ? "tambah" : "kurang"}`} aria-pressed={value === o} disabled={checked} onClick={() => set(o)} className={`grid size-14 place-items-center rounded-2xl border-4 ${value === o ? "border-error bg-error/10" : "border-orange-300 bg-white"}`}>{o}</button>)}
      <span>{p.b} = {p.c}</span></div>;
    case "pick": { const long = p.options.some(o => o.length > 14);
      return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-xl font-bold">{p.label}</p>
        <div className={long ? "grid gap-2" : "flex flex-wrap gap-2"}>{p.options.map(o => <button key={o} type="button" aria-pressed={value === o} disabled={checked} onClick={() => set(o)} className={`min-h-14 rounded-2xl border-4 px-4 text-start font-extrabold ${long ? "text-xl" : "text-2xl"} ${value === o ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div></div>; }
    case "multi": { const sel = ids(value).map(Number);
      return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-xl font-bold">{p.label} <span className="text-base font-normal">(boleh lebih dari satu)</span></p>
        <div className="grid grid-cols-3 gap-2">{p.options.map((o, k) => <button key={o} type="button" aria-pressed={sel.includes(k)} disabled={checked} onClick={() => set((sel.includes(k) ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} className={`min-h-14 rounded-full border-4 px-2 text-2xl font-extrabold ${sel.includes(k) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div></div>; }
    case "build": { const sel = ids(value).map(Number), slot = (k: number) => (sel[k] !== undefined ? String(p.tiles[sel[k]]) : "");
      return <div className="space-y-2"><div className="flex flex-wrap gap-2">{p.tiles.map((t, k) => <button key={k} type="button" aria-label={`Kartu ${t}`} disabled={checked || sel.includes(k) || sel.length >= 3} onClick={() => set([...sel, k].join(","))} className="grid size-14 place-items-center rounded-xl border-4 border-sky-400 bg-sky-50 text-3xl font-extrabold disabled:opacity-30">{t}</button>)}
        <button type="button" className="btn btn-ghost gap-1" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join(","))}><Undo2 className="size-4" aria-hidden="true" />Hapus</button></div>
        <p aria-label="Operasi yang disusun" className="flex items-center gap-2 text-3xl font-extrabold">{[0, 1, 2].map(k => <span key={k} className="contents"><span className="grid h-14 w-16 place-items-center rounded-2xl border-4 border-orange-400 bg-white">{slot(k) || "…"}</span>{k === 0 && <span>{p.op}</span>}{k === 1 && <span>=</span>}</span>)}</p></div>; }
    case "pairs": return <div className="space-y-2">{Array.from({ length: p.count }, (_, k) => <p key={k} className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><NumBox label={`Operasi ${k + 1} bilangan pertama`} value={x[2 * k]} onChange={v => put(2 * k, v)} disabled={checked} />{p.op}<NumBox label={`Operasi ${k + 1} bilangan kedua`} value={x[2 * k + 1]} onChange={v => put(2 * k + 1, v)} disabled={checked} />= {p.result}</p>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.74]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeOneSub10V2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Pengurangan sampai dengan 10</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Ambil sebagian benda, tulis tanda kurang, hitung mundur, dan periksa dengan penjumlahan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-2"><Many thing="telur" n={4} size="size-9" /><Minus className="size-7 text-error" strokeWidth={2.5} /><Many thing="telur" n={2} gone size="size-9" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Waktunya pulang</h2>
        <p className="mt-2">Ada 6 anak bermain. Sebanyak 2 anak pulang. Berapa anak yang masih bermain? Ayo belajar mengurangi.</p>
        <p className="mt-2 text-sm text-base-content/60">4 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-kurang-1">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-kurang-1" ref={area} className="mt-8 scroll-mt-20">
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
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.66]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
