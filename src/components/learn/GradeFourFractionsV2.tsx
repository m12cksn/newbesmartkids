"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, Undo2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, cells, correct, formatAnswer, plain, practice, ready, SEP, splitParts, topics,
  type Fig, type FQuestion, type Part, type Scene, type Thing,
} from "@/data/grade-four-fractions-v2";

const ink = "#2b2320";
/** Warna arsir seperti di buku: kuning hangat. */
const SH = "#f6c544";
const PAPER = "#ffffff";

/* ====================================================================== */
/* Pecahan bersusun di dalam teks                                          */
/* ====================================================================== */
export function Frac({ n, d, big = false }: { n: ReactNode; d: ReactNode; big?: boolean }) {
  return <span className={`mx-0.5 inline-flex flex-col items-center align-middle font-extrabold leading-none ${big ? "text-[1.05em]" : "text-[0.85em]"}`}>
    <span className="px-0.5">{n}</span><span className="my-[2px] h-[2px] w-full min-w-3 bg-current" aria-hidden="true" /><span className="sr-only">/</span><span className="px-0.5">{d}</span>
  </span>;
}
/** Teks dengan pecahan {a/b} yang ditampilkan bersusun. */
export function Rich({ text, big = false }: { text: string; big?: boolean }) {
  const out: ReactNode[] = [], re = /\{([^/}]*)\/([^}]*)\}/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) { if (m.index > last) out.push(text.slice(last, m.index)); out.push(<Frac key={k++} n={m[1]} d={m[2]} big={big} />); last = m.index + m[0].length; }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/* ====================================================================== */
/* Bangun yang dibagi sama besar                                            */
/* ====================================================================== */
type FigProps = { f: Fig; w?: number; on?: Set<number>; tap?: (i: number) => void; label?: string };
function cellProps(i: number, tap: FigProps["tap"], on: boolean) {
  return tap ? { role: "button", tabIndex: 0, "aria-label": `Arsir bagian ${i + 1}`, "aria-pressed": on, onClick: () => tap(i), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(i); } }, className: "cursor-pointer outline-none focus-visible:[stroke-width:4]" } : {};
}
/** Bangun (pita, persegi, lingkaran, segitiga, segi enam, cokelat, tongkat, semangka, roti) dengan sebagian diarsir. */
export function FigView({ f, w = 220, on, tap, label }: FigProps) {
  const isOn = (i: number) => (on ? on.has(i) : i < f.shaded);
  const name = label ?? `${f.caption ? plain(f.caption) + ": " : ""}${f.shape === "grid" ? "petak" : "bangun"} dibagi ${f.parts} bagian sama besar, ${on ? on.size : f.shaded} diarsir`;
  const wrap = (vw: number, vh: number, body: ReactNode, ww = w) => <svg viewBox={`-2 -2 ${vw + 4} ${vh + 4}`} width={ww} height={(ww * (vh + 4)) / (vw + 4)} className="h-auto max-w-full" role={tap ? "group" : "img"} aria-label={name}>{body}</svg>;
  const P = f.parts;
  switch (f.shape) {
    case "bar": case "choc": case "stick": case "bread": {
      const W = 240, H = f.shape === "stick" ? 20 : f.shape === "bread" ? 70 : 48, cw = W / P;
      const base = f.shape === "choc" ? "#6b3e26" : f.shape === "stick" ? "#c8925a" : f.shape === "bread" ? "#e9b872" : PAPER;
      return wrap(W, H, <>
        {f.shape === "bread" && <rect x="-1" y="-1" width={W + 2} height={H + 2} rx="22" fill="#b9772f" />}
        {Array.from({ length: P }, (_, i) => <rect key={i} x={i * cw} y={0} width={cw} height={H} rx={f.shape === "bread" ? 4 : f.shape === "stick" && (i === 0 || i === P - 1) ? 6 : 0}
          fill={isOn(i) ? SH : base} stroke={f.shape === "choc" ? "#3d2214" : ink} strokeWidth={f.shape === "stick" ? 1.4 : 2} {...cellProps(i, tap, isOn(i))} />)}
        {f.shape === "choc" && Array.from({ length: P }, (_, i) => <rect key={`b${i}`} x={i * cw + 5} y={5} width={cw - 10} height={H - 10} rx="3" fill="none" stroke="#8a5536" strokeWidth="1.5" pointerEvents="none" />)}
        {f.shape === "bread" && Array.from({ length: P }, (_, i) => <path key={`c${i}`} d={`M${i * cw + 6} ${H * 0.3}q${cw / 2 - 6} -8 ${cw - 12} 0`} fill="none" stroke="#c48a45" strokeWidth="1.5" pointerEvents="none" />)}
        {f.shape === "stick" && <path d={`M4 ${H * 0.35}h${W - 8}`} stroke="#9a6a3a" strokeWidth="1" opacity=".6" pointerEvents="none" />}
      </>, f.shape === "stick" ? Math.max(w, 230) : w);
    }
    case "grid": {
      const R = f.rows ?? 1, Cc = P / R, c = 16;
      return wrap(Cc * c, R * c, Array.from({ length: P }, (_, i) => <rect key={i} x={(i % Cc) * c} y={Math.floor(i / Cc) * c} width={c} height={c} fill={isOn(i) ? SH : PAPER} stroke={ink} strokeWidth={P > 50 ? 0.8 : 1.5} {...cellProps(i, tap, isOn(i))} />), Math.min(w, Cc * 22));
    }
    case "circle": case "melon": {
      const r = 50, cx = 52, cy = 52, melon = f.shape === "melon";
      const slice = (i: number, rr: number) => { const a0 = -Math.PI / 2 + (2 * Math.PI * i) / P, a1 = a0 + (2 * Math.PI) / P; return P === 1 ? `M${cx} ${cy - rr}a${rr} ${rr} 0 1 1 0 ${2 * rr}a${rr} ${rr} 0 1 1 0 ${-2 * rr}z` : `M${cx} ${cy}L${cx + rr * Math.cos(a0)} ${cy + rr * Math.sin(a0)}A${rr} ${rr} 0 0 1 ${cx + rr * Math.cos(a1)} ${cy + rr * Math.sin(a1)}z`; };
      return wrap(104, 104, <>
        {melon && <circle cx={cx} cy={cy} r={r + 1} fill="#3f8f3a" stroke={ink} strokeWidth="2" />}
        {Array.from({ length: P }, (_, i) => <path key={i} d={slice(i, melon ? r - 6 : r)} fill={isOn(i) ? SH : melon ? "#e8505b" : PAPER} stroke={ink} strokeWidth="2" strokeLinejoin="round" {...cellProps(i, tap, isOn(i))} />)}
        {melon && Array.from({ length: P }, (_, i) => { const a = -Math.PI / 2 + (2 * Math.PI * (i + 0.5)) / P; return [0.45, 0.68].map((t, k) => <ellipse key={`${i}${k}`} cx={cx + (r - 6) * t * Math.cos(a + (k ? 0.12 : -0.12))} cy={cy + (r - 6) * t * Math.sin(a + (k ? 0.12 : -0.12))} rx="1.6" ry="2.6" fill="#2b2320" transform={`rotate(${(a * 180) / Math.PI + 90} ${cx + (r - 6) * t * Math.cos(a)} ${cy + (r - 6) * t * Math.sin(a)})`} pointerEvents="none" />); })}
      </>, Math.min(w, 150));
    }
    case "triangle": {
      const ax = 60, ay = 4, by = 100;
      return wrap(120, 104, Array.from({ length: P }, (_, i) => <path key={i} d={`M${ax} ${ay}L${4 + (112 * i) / P} ${by}L${4 + (112 * (i + 1)) / P} ${by}z`} fill={isOn(i) ? SH : PAPER} stroke={ink} strokeWidth="2" strokeLinejoin="round" {...cellProps(i, tap, isOn(i))} />), Math.min(w, 150));
    }
    case "hexagon": {
      const cx = 52, cy = 50, r = 48, v = (k: number) => [cx + r * Math.cos((Math.PI / 3) * k), cy + r * Math.sin((Math.PI / 3) * k)];
      return wrap(104, 100, Array.from({ length: 6 }, (_, i) => { const [x0, y0] = v(i), [x1, y1] = v(i + 1); return <path key={i} d={`M${cx} ${cy}L${x0} ${y0}L${x1} ${y1}z`} fill={isOn(i) ? SH : PAPER} stroke={ink} strokeWidth="2" strokeLinejoin="round" {...cellProps(i, tap, isOn(i))} />; }), Math.min(w, 150));
    }
  }
}
function FigCard({ f, w }: { f: Fig; w?: number }) {
  return <figure className="flex flex-col items-center gap-1"><FigView f={f} w={w} />{f.caption && <figcaption className="text-base font-bold"><Rich text={f.caption} /></figcaption>}</figure>;
}

/* ====================================================================== */
/* Benda, siswa, lembar jawaban, karung                                     */
/* ====================================================================== */
function ThingArt({ thing, size = 34 }: { thing: Thing; size?: number }) {
  switch (thing) {
    case "telur": return <svg viewBox="0 0 30 34" width={size * 0.85} height={size} aria-hidden="true"><path d="M15 2C7 2 2 14 2 21a13 12 0 0026 0C28 14 23 2 15 2z" fill="#f3dfc1" stroke={ink} strokeWidth="1.5" /><ellipse cx="10" cy="13" rx="3" ry="5" fill="#fff" opacity=".6" /></svg>;
    case "jeruk": return <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true"><circle cx="17" cy="17" r="15" fill="#f59e2b" stroke={ink} strokeWidth="1.5" /><circle cx="17" cy="17" r="11" fill="#fbc56b" stroke="#e07f12" strokeWidth="1" />{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M17 17L${17 + 11 * Math.cos((i * Math.PI) / 4)} ${17 + 11 * Math.sin((i * Math.PI) / 4)}`} stroke="#e07f12" strokeWidth="1" />)}</svg>;
    case "jam": return <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true"><rect x="2" y="2" width="30" height="30" rx="5" fill="#dfe7ee" stroke={ink} strokeWidth="1.5" /><circle cx="17" cy="17" r="11" fill="#fff" stroke={ink} strokeWidth="1.2" /><path d="M17 17V10M17 17l5 3" stroke={ink} strokeWidth="1.6" strokeLinecap="round" /></svg>;
    case "biskuit": return <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true"><rect x="3" y="3" width="28" height="28" rx="5" fill="#e3b26b" stroke={ink} strokeWidth="1.5" />{[10, 17, 24].flatMap(x => [10, 17, 24].map(y => <circle key={`${x}${y}`} cx={x} cy={y} r="1.3" fill="#a8742f" />))}</svg>;
  }
}
const thingName: Record<Thing, string> = { telur: "telur", jeruk: "jeruk", jam: "jam", biskuit: "biskuit" };
function Items({ thing, count, marked }: { thing: Thing; count: number; marked: number }) {
  return <figure className="flex flex-wrap items-center justify-center gap-2" aria-label={`${count} ${thingName[thing]}, ${marked} di dalam kotak`}>
    <span className="flex max-w-[11rem] flex-wrap justify-center gap-1 rounded-2xl border-[3px] border-sky-500 bg-sky-50 p-1.5">{Array.from({ length: marked }, (_, i) => <ThingArt key={i} thing={thing} />)}</span>
    <span className="flex max-w-[15rem] flex-wrap justify-center gap-1">{Array.from({ length: count - marked }, (_, i) => <ThingArt key={i} thing={thing} />)}</span>
  </figure>;
}
function Child({ on }: { on: boolean }) {
  return <svg viewBox="0 0 16 22" width="15" height="21" aria-hidden="true"><circle cx="8" cy="5" r="4" fill={on ? "#f2c9a0" : "#e5ddd3"} stroke={ink} strokeWidth=".8" /><path d="M2 21v-6a6 6 0 0112 0v6z" fill={on ? "#208f6d" : "#cfd6d2"} stroke={ink} strokeWidth=".8" /></svg>;
}
function People({ total, marked, caption }: { total: number; marked: number; caption: string }) {
  return <figure className="flex flex-col items-center gap-1" aria-label={caption}>
    <div className="grid grid-cols-10 gap-x-1 gap-y-0.5">{Array.from({ length: total }, (_, i) => <Child key={i} on={i < marked} />)}</div>
    <figcaption className="text-sm font-bold">{caption}</figcaption>
  </figure>;
}
function Sheet({ total, right, name }: { total: number; right: number; name: string }) {
  const wrong = new Set([3, 11, 16].slice(0, total - right));
  return <figure className="w-56 rounded-md border border-base-300 bg-white p-2 shadow-sm" aria-label={`Lembar jawaban ${name}: ${right} benar dari ${total} soal`}>
    <p className="text-center text-sm font-extrabold">Lembar jawaban {name}</p>
    <div className="mt-1 grid grid-cols-2 gap-x-3 text-xs font-bold">{Array.from({ length: total }, (_, i) => <span key={i} className="flex items-center justify-between border-b border-dashed border-base-300 py-px">{i + 1}.
      {wrong.has(i) ? <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" /></svg>
        : <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1.5 6.5l3 3 6-7" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" /></svg>}</span>)}</div>
  </figure>;
}
function Sacks({ items }: { items: { name: string; label: string }[] }) {
  return <div className="flex flex-wrap items-end justify-center gap-4">{items.map(it => <figure key={it.name} className="flex flex-col items-center" aria-label={`${it.name} ${plain(it.label)}`}>
    <svg viewBox="0 0 60 64" width="66" height="70" aria-hidden="true"><path d="M18 10c-6 4-12 14-12 28 0 14 8 22 24 22s24-8 24-22c0-14-6-24-12-28z" fill="#e7d3a8" stroke={ink} strokeWidth="2" /><path d="M16 8l6-5 8 4 8-4 6 5-6 4H22z" fill="#d6bd88" stroke={ink} strokeWidth="2" strokeLinejoin="round" /><path d="M20 12h20" stroke="#8a6a2e" strokeWidth="3" /></svg>
    <span className="-mt-9 rounded bg-white px-1 text-sm ring-1 ring-base-300"><Rich text={it.label} /></span>
    <figcaption className="mt-3 text-sm font-bold">{it.name}</figcaption>
  </figure>)}</div>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "figs": return <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-2">{scene.figs.map((f, i) => <FigCard key={i} f={f} w={scene.figs.length === 1 ? 220 : ["circle", "melon", "hexagon", "triangle"].includes(f.shape) ? 100 : 130} />)}</div>;
    case "items": return <Items {...scene} />;
    case "people": return <People {...scene} />;
    case "sheet": return <Sheet {...scene} />;
    case "sacks": return <Sacks items={scene.items} />;
  }
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold">{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-sm btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
      <span className="min-w-7 text-center text-xl font-extrabold tabular-nums">{value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-sm btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-4" aria-hidden="true" /></button></span>
  </span>;
}
const signOf = (a: number, b: number) => (Math.abs(a - b) < 1e-9 ? "=" : a < b ? "<" : ">");
function SignPick({ pick, setPick, ok }: { pick: string | null; setPick: (s: string) => void; ok: boolean }) {
  return <div role="group" aria-label="Pilih tanda" className="flex gap-2">{["<", "=", ">"].map(x => <button key={x} type="button" aria-label={`Tanda ${x}`} aria-pressed={pick === x} onClick={() => setPick(x)} className={`btn h-12 w-14 text-3xl ${pick === x ? (ok ? "btn-success" : "btn-error") : "btn-outline"}`}>{x}</button>)}</div>;
}
const dec = (n: number, places: number) => (n / 10 ** places).toFixed(places).replace(".", ",");

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function UnitLab() {
  const [d1, setD1] = useState(2), [d2, setD2] = useState(4), [shape, setShape] = useState<"bar" | "circle">("bar"), [pick, setPick] = useState<string | null>(null);
  const want = signOf(1 / d1, 1 / d2), ok = pick === want;
  const row = (d: number, set: (n: number) => void, k: number) => <div className="flex items-center justify-between gap-2">
    <FigView f={{ shape, parts: d, shaded: 1 }} w={shape === "bar" ? 210 : 104} label={`Bangun ${k}: dibagi ${d}, 1 diarsir`} />
    <span className="text-3xl"><Frac n={1} d={d} big /></span><Stepper label={`Penyebut ${k}`} value={d} set={x => { set(x); setPick(null); }} min={2} max={12} />
  </div>;
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Bentuk" className="flex gap-1.5">{(["bar", "circle"] as const).map(s => <button key={s} type="button" role="radio" aria-checked={shape === s} onClick={() => setShape(s)} className={`btn btn-sm ${shape === s ? "btn-success" : "btn-outline"}`}>{s === "bar" ? "Pita" : "Lingkaran"}</button>)}</div>
    <div className="space-y-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8]">{row(d1, setD1, 1)}{row(d2, setD2, 2)}</div>
    <div className="flex items-center gap-3"><span className="text-2xl"><Frac n={1} d={d1} big /></span><SignPick pick={pick} setPick={setPick} ok={ok} /><span className="text-2xl"><Frac n={1} d={d2} big /></span></div>
    <Result value={`${d1}:${d2}:${pick ? (ok ? "ok" : "no") : ""}`}>{!pick ? "Bandingkan daerah arsirnya, lalu pilih tanda." : ok ? <>Tepat. <Rich text={`{1/${d1}} ${want} {1/${d2}}`} />{d1 !== d2 && <>: penyebut {Math.min(d1, d2)} membuat potongan lebih besar.</>}</> : "Belum tepat. Potongan dari penyebut yang lebih kecil itu lebih besar."}</Result>
  </div>;
}
function SameLab() {
  const [d, setD] = useState(5), [a, setA] = useState(new Set([0, 1])), [b, setB] = useState(new Set([0, 1, 2, 3])), [pick, setPick] = useState<string | null>(null);
  const toggle = (s: Set<number>, set: (x: Set<number>) => void) => (i: number) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); set(n); setPick(null); };
  const want = signOf(a.size, b.size), ok = pick === want;
  const changeD = (x: number) => { setD(x); setA(new Set([...a].filter(i => i < x))); setB(new Set([...b].filter(i => i < x))); setPick(null); };
  return <div className="space-y-2.5">
    <div className="flex justify-center"><Stepper label="Penyebut" value={d} set={changeD} min={2} max={10} /></div>
    <div className="space-y-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8]">
      {[[a, setA, "pertama"], [b, setB, "kedua"]].map(([s, set, nm]) => <div key={nm as string} className="flex items-center justify-between gap-2"><FigView f={{ shape: "bar", parts: d, shaded: 0 }} w={230} on={s as Set<number>} tap={toggle(s as Set<number>, set as (x: Set<number>) => void)} label={`Pita ${nm}`} /><span className="text-3xl"><Frac n={(s as Set<number>).size} d={d} big /></span></div>)}
    </div>
    <div className="flex items-center gap-3"><span className="text-2xl"><Frac n={a.size} d={d} big /></span><SignPick pick={pick} setPick={setPick} ok={ok} /><span className="text-2xl"><Frac n={b.size} d={d} big /></span></div>
    <Result value={`${d}:${a.size}:${b.size}:${pick ? (ok ? "ok" : "no") : ""}`}>{!pick ? "Ketuk kotak untuk mengarsir, lalu pilih tandanya." : ok ? <>Tepat. Penyebutnya sama, jadi bandingkan pembilangnya: {a.size} {want} {b.size}.</> : "Belum tepat. Hitung kotak yang diarsir pada setiap pita."}</Result>
  </div>;
}
function EquivLab() {
  const [b, setB] = useState(3), [a, setA] = useState(1), [k, setK] = useState(2);
  return <div className="space-y-2.5">
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Pembilang" value={a} set={setA} min={1} max={b - 1} /><Stepper label="Penyebut" value={b} set={x => { setB(x); setA(Math.min(a, x - 1)); }} min={2} max={6} /><Stepper label="Dikali" value={k} set={setK} min={1} max={4} /></div>
    <div className="space-y-1 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.8]">
      <div className="flex items-center justify-between gap-2"><FigView f={{ shape: "choc", parts: b, shaded: a }} w={240} label={`Cokelat dibagi ${b}, ${a} bagian`} /><span className="text-3xl"><Frac n={a} d={b} big /></span></div>
      <div className="flex items-center justify-between gap-2"><FigView f={{ shape: "choc", parts: b * k, shaded: a * k }} w={240} label={`Cokelat dibagi ${b * k}, ${a * k} bagian`} /><span className="text-3xl"><Frac n={a * k} d={b * k} big /></span></div>
    </div>
    <p className="text-center text-2xl font-extrabold"><Frac n={a} d={b} big /> = <Frac n={`${a} × ${k}`} d={`${b} × ${k}`} big /> = <span className="text-success"><Frac n={a * k} d={b * k} big /></span></p>
    <Result value={`${a}/${b}=${a * k}/${b * k}`}>Daerah kuning kedua cokelat sama panjang. Pembilang dan penyebut dikali {k}, jadi <Rich text={`{${a}/${b}} = {${a * k}/${b * k}}`} />.{k > 1 && <> Sebaliknya, <Rich text={`{${a * k}/${b * k}}`} /> dibagi {k} kembali menjadi <Rich text={`{${a}/${b}}`} />.</>}</Result>
  </div>;
}
function DecimalLab() {
  const [mode, setMode] = useState<10 | 100>(10), [n, setN] = useState(3);
  const tap = (i: number) => setN(n === i + 1 ? i : i + 1), places = mode === 10 ? 1 : 2;
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Jenis" className="flex gap-1.5">{([10, 100] as const).map(m => <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => { setMode(m); setN(m === 10 ? 3 : 25); }} className={`btn btn-sm ${mode === m ? "btn-success" : "btn-outline"}`}>{m === 10 ? "Persepuluhan" : "Perseratusan"}</button>)}</div>
    <div className="flex justify-center rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.75]"><FigView f={{ shape: "grid", parts: mode, shaded: 0, rows: mode === 10 ? 1 : 10 }} w={mode === 10 ? 300 : 210} on={new Set(Array.from({ length: n }, (_, i) => i))} tap={tap} label={mode === 10 ? "Pita dibagi 10" : "Petak 10 × 10"} /></div>
    {mode === 100 && <div className="flex justify-center gap-1.5">{[-10, -1, 1, 10].map(s => <button key={s} type="button" className="btn btn-sm btn-outline" aria-label={`${s > 0 ? "Tambah" : "Kurangi"} ${Math.abs(s)}`} disabled={n + s < 0 || n + s > 100} onClick={() => setN(n + s)}>{s > 0 ? `+${s}` : s}</button>)}</div>}
    <p className="text-center text-3xl font-extrabold"><Frac n={n} d={mode} big /> = <span className="text-success">{dec(n, places)}</span></p>
    <Result value={`${mode}:${n}`}>{n} dari {mode} kotak diarsir. Penyebut {mode} berarti {places} angka di belakang koma: <strong>{dec(n, places)}</strong>.{mode === 100 && n < 10 && <> Angka 0 setelah koma jangan dilupakan.</>}</Result>
  </div>;
}
function PercentLab() {
  const [whole, setWhole] = useState(0), [n, setN] = useState(35);
  const total = whole * 100 + n, d = `${whole},${String(n).padStart(2, "0")}`;
  return <div className="space-y-2.5">
    <div className="flex flex-wrap items-end justify-around gap-2"><Stepper label="Utuh" value={whole} set={setWhole} min={0} max={3} />
      <div className="flex gap-1">{[-10, -1, 1, 10].map(s => <button key={s} type="button" className="btn btn-sm btn-outline" aria-label={`${s > 0 ? "Tambah" : "Kurangi"} ${Math.abs(s)}`} disabled={n + s < 0 || n + s > 99} onClick={() => setN(n + s)}>{s > 0 ? `+${s}` : s}</button>)}</div></div>
    <div className="flex items-center justify-center gap-2 rounded-xl bg-base-100 p-2 [@media(max-height:700px)]:[zoom:0.7]">
      {Array.from({ length: whole }, (_, i) => <span key={i} className="grid size-12 place-items-center rounded border-2 border-neutral bg-[#f6c544] text-xs font-extrabold" aria-hidden="true">100</span>)}
      <FigView f={{ shape: "grid", parts: 100, shaded: n, rows: 10 }} w={180} label={`Petak 100 kotak, ${n} diarsir`} />
    </div>
    <p className="text-center text-2xl font-extrabold sm:text-3xl">{d} = <Frac n={total} d={100} big /> = <span className="text-success">{total}%</span></p>
    <Result value={`${whole}:${n}`}>Cara langsung: {d} × 100% = {total}%. Koma digeser dua kali ke kanan.{whole > 0 && <> Setiap petak penuh bernilai 100%.</>}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { unit: UnitLab, same: SameLab, equiv: EquivLab, decimal: DecimalLab, percent: PercentLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function Box({ value, onChange, label, disabled, size }: { value: string; onChange: (v: string) => void; label: string; disabled: boolean; size: number }) {
  const w = size >= 4 ? "w-24" : size >= 3 ? "w-20" : size >= 2 ? "w-16" : "w-12";
  return <input aria-label={label} inputMode="decimal" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/[^\d,.]/g, "").slice(0, 6))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl`} />;
}
/** Isian: teks biasa, kotak □, dan pecahan {a/b} yang pembilang atau penyebutnya boleh berupa kotak. */
function FillPart({ p, x, put, checked, i }: { p: Extract<Part, { kind: "fill" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean; i: number }) {
  let k = 0;
  const box = () => { const idx = k++; return <Box key={`b${idx}`} label={`Bagian ${i + 1} kotak ${idx + 1}`} size={p.answers[idx].length} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} />; };
  const seg = (s: string) => s.split("□").flatMap((t, j, arr) => (j < arr.length - 1 ? [t, box()] : [t])).map((t, j) => (typeof t === "string" ? (t ? <span key={`t${j}`}>{t}</span> : null) : t));
  const out: ReactNode[] = [], re = /\{([^/}]*)\/([^}]*)\}/g;
  let last = 0, m: RegExpExecArray | null, n = 0;
  while ((m = re.exec(p.text))) {
    if (m.index > last) out.push(<span key={`s${n++}`} className="contents">{seg(p.text.slice(last, m.index))}</span>);
    out.push(<span key={`f${n++}`} className="mx-0.5 inline-flex flex-col items-center gap-1 align-middle"><span className="flex">{seg(m[1])}</span><span className="h-[3px] w-full min-w-8 rounded bg-neutral" aria-hidden="true" /><span className="flex">{seg(m[2])}</span></span>);
    last = m.index + m[0].length;
  }
  if (last < p.text.length) out.push(<span key={`s${n++}`} className="contents">{seg(p.text.slice(last))}</span>);
  return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xl font-bold sm:text-2xl">{out}</p>;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.left.length }, (_, k) => (value ? value.split("|") : [])[k] ?? ""), n = p.left.length, m = p.right.length, H = 1000;
  return <div className="space-y-1.5">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk kotak di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]" style={{ minHeight: Math.max(n, m) * 46 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${plain(l)}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-1.5 py-1 text-xl font-extrabold ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}><Rich text={l} /></button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${plain(r)}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-xl font-extrabold"><Rich text={r} /></button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": return <FillPart p={p} x={x} put={put} checked={checked} i={i} />;
    case "choice": { const sym = p.options[0] === "<";
      return <div role="group" aria-label={plain(p.label)} className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-xl font-bold sm:text-2xl"><Rich text={p.label} big /></p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-label={plain(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 font-bold ${sym ? "min-h-12 min-w-14 px-3 text-3xl" : "min-h-11 px-3 text-lg sm:text-xl"} ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><Rich text={op} big /></button>)}</div></div>; }
    case "rank": { const seq = value ? value.split("|").map(Number) : [];
      return <div className="space-y-1.5"><p className="text-lg font-bold">{plain(p.label)}</p>
        <div role="group" aria-label={plain(p.label)} className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={k} type="button" aria-label={`Pilih ${plain(it.label)}`} disabled={checked || seq.includes(k)} onClick={() => set([...seq, k].join("|"))} className="btn btn-outline h-auto min-h-12 px-3 text-xl"><Rich text={it.label} big /></button>)}</div>
        <div className="flex flex-wrap items-center gap-1">{p.items.map((_, k) => <span key={k} className="grid min-h-12 min-w-14 place-items-center rounded-lg border-2 border-dashed border-orange-300 bg-white px-1.5 text-lg font-extrabold">{seq[k] !== undefined ? <Rich text={p.items[seq[k]].label} big /> : k + 1}</span>)}
          <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join("|"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div>
      </div>; }
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={plain(p.label)} className="space-y-1"><p className="text-lg font-bold"><Rich text={p.label} /></p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-label={plain(o)} aria-pressed={on.includes(o)} disabled={checked} onClick={() => set((on.includes(o) ? on.filter(y => y !== o) : [...on, o]).join("|"))} className={`min-h-12 min-w-14 rounded-2xl border-4 px-2 text-xl ${on.includes(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><Rich text={o} big /></button>)}</div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Pilih semua yang benar. Ketuk lagi untuk membatalkan.</p></div>; }
    case "shade": { const on = new Set(value ? value.split("|").map(Number) : []);
      return <div className="space-y-1"><p className="text-lg font-bold">{p.label}: ketuk bagian untuk mengarsir.</p>
        <div className="flex flex-wrap items-center justify-center gap-3"><FigView f={p.fig} w={260} on={on} label={p.label} tap={checked ? undefined : k => { const n = new Set(on); if (n.has(k)) n.delete(k); else n.add(k); set([...n].sort((a, b) => a - b).join("|")); }} />
          <span className="text-lg font-bold">{on.size} dari {p.fig.parts} diarsir</span></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: FQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.74]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFourFractionsV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[0], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Pecahan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bandingkan dan urutkan pecahan, temukan pecahan senilai, lalu ubah pecahan menjadi desimal dan persen.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-4"><FigView f={{ shape: "circle", parts: 4, shaded: 1 }} w={90} /><span className="text-4xl"><Frac n={1} d={4} big /></span></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Satu pizza, empat anak</h2>
        <p className="mt-2 text-sm">Bu guru memotong pizza menjadi 4 bagian sama besar. Setiap anak mendapat <Rich text="{1/4}" /> pizza. Dari potongan pizza kita belajar membandingkan pecahan, mencari yang senilai, sampai mengubahnya menjadi desimal dan persen.</p>
        <p className="mt-2 text-sm text-base-content/60">5 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-pecahan-4">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pecahan-4" ref={area} className="mt-8 scroll-mt-20">
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
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-8">{s.steps.map(x => <li key={x}><Rich text={x} /></li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-8"><Rich text={s.example} /></p>}
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
      </> : <GradeFourQuiz<FQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderText={text => <Rich text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.62]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
