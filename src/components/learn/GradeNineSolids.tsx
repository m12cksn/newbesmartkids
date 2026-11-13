"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { CircleView, CubesView, M, NetView, ObjectView, plainMath, SceneView, SolidView } from "./GradeNineSolidsArt";
import {
  assessment, cells, correct, formatAnswer, idn, isCubeNet, objectName, practice, ready, sections, SEP, splitParts, topics,
  type BQuestion, type ObjectKind, type Part, type SolidKind,
} from "@/data/grade-nine-solids";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, show = idn }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; show?: (n: number) => string }) {
  const go = (d: number) => { const v = Math.round((value + d) * 100) / 100; if (v >= min - 1e-9 && v <= max + 1e-9) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{show(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>;
}
const Steppers = ({ children }: { children: ReactNode }) => <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>;
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,15rem)_1fr]">{children}</div>;
const Steps = ({ lines }: { lines: string[] }) => <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">{lines.map(l => <li key={l}><M text={l} /></li>)}</ol>;
const r2 = (v: number) => Math.round(v * 100) / 100;
const key = (v: number) => String(Math.round(v * 1e4) / 1e4);
const PIS = ["3,14", "22/7"] as const;
type Pi = (typeof PIS)[number];
const piv = (p: Pi) => (p === "3,14" ? 3.14 : 22 / 7);
const piText = (p: Pi) => (p === "3,14" ? "3,14" : "{22/7}");
function Pour({ count, set, max, what }: { count: number; set: (n: number) => void; max: number; what: string }) {
  return <div className="flex flex-wrap items-center gap-2"><button type="button" className="btn btn-sm btn-success" disabled={count >= max} onClick={() => set(count + 1)}>Tuang isi {what}</button>
    <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!count} onClick={() => set(0)}><RotateCcw className="size-3.5" aria-hidden="true" />Kosongkan</button>
    <span className="text-sm">Tuangan: <strong>{count}</strong></span></div>;
}
const Fill = ({ part, label }: { part: number; label: string }) => <div className="space-y-1"><p className="text-sm font-semibold">{label}</p>
  <div className="h-24 w-24 overflow-hidden rounded border-2 border-neutral bg-base-100" role="img" aria-label={`${label} terisi ${Math.round(part * 100)} persen`}><div className="h-full w-full origin-bottom bg-[#e9c46a] transition-transform motion-reduce:transition-none" style={{ transform: `scaleY(${part})` }} /></div></div>;

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const kinds: { name: string; solid: SolidKind; obj: ObjectKind; S: string; T: string; R: string; note: string }[] = [
  { name: "Kubus", solid: "kubus", obj: "dadu", S: "6", T: "8", R: "12", note: "6 persegi yang sama" },
  { name: "Balok", solid: "balok", obj: "kardus", S: "6", T: "8", R: "12", note: "3 pasang persegi panjang yang berhadapan sama" },
  { name: "Prisma segitiga", solid: "prisma3", obj: "tenda", S: "5", T: "6", R: "9", note: "2 segitiga dan 3 persegi panjang" },
  { name: "Limas segi empat", solid: "limas4", obj: "piramida", S: "5", T: "5", R: "8", note: "1 persegi dan 4 segitiga" },
  { name: "Tabung", solid: "tabung", obj: "kaleng", S: "3", T: "-", R: "-", note: "2 lingkaran dan 1 sisi lengkung" },
  { name: "Kerucut", solid: "kerucut", obj: "topi", S: "2", T: "-", R: "-", note: "1 lingkaran dan 1 sisi lengkung" },
  { name: "Bola", solid: "bola", obj: "bola", S: "1", T: "-", R: "-", note: "1 sisi lengkung" },
  { name: "Kerucut terpotong", solid: "frustum", obj: "ember", S: "3", T: "-", R: "-", note: "2 lingkaran berbeda ukuran dan 1 sisi lengkung" },
];
function KindsLab() {
  const [name, setName] = useState("Kubus");
  const k = kinds.find(x => x.name === name)!, flat = k.T !== "-";
  return <div className="space-y-3">
    <Radios label="Bangun ruang" options={kinds.map(x => x.name)} value={name} set={setName} />
    <Pair><SolidView kind={k.solid} /><div className="space-y-2"><div className="flex items-center gap-3"><ObjectView kind={k.obj} cls="w-20 shrink-0" /><p className="text-sm">Contoh benda: <strong>{objectName[k.obj]}</strong></p></div>
      <table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-success text-success-content"><th className="py-1">Sisi</th><th>Titik sudut</th><th>Rusuk</th></tr></thead><tbody><tr><td className="py-1 font-bold">{k.S}</td><td>{k.T}</td><td>{k.R}</td></tr></tbody></table>
      <p className="text-sm">Sisinya: {k.note}.</p></div></Pair>
    <Result value={`${k.name}|${k.S}|${k.T}|${k.R}`}>{flat ? <>Bangun sisi datar. Euler: {k.S} + {k.T} − {k.R} = {Number(k.S) + Number(k.T) - Number(k.R)}.</> : "Bangun sisi lengkung: rumus Euler tidak dipakai."}</Result>
  </div>;
}

const presets: Record<string, [number, number][]> = { "Contoh salib": [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], "Contoh tangga": [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]], "Lima berjajar": [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 0]] };
function NetsLab() {
  const [on, setOn] = useState<[number, number][]>(presets["Contoh salib"]);
  const has = (x: number, y: number) => on.some(c => c[0] === x && c[1] === y), toggle = (x: number, y: number) => setOn(o => (has(x, y) ? o.filter(c => !(c[0] === x && c[1] === y)) : o.length < 6 ? [...o, [x, y]] : o));
  const ok = isCubeNet(on);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">{Object.keys(presets).map(p => <button key={p} type="button" className="btn btn-xs btn-outline" onClick={() => setOn(presets[p])}>{p}</button>)}<button type="button" className="btn btn-xs btn-ghost" onClick={() => setOn([])}>Kosongkan</button></div>
    <Pair>
      <svg viewBox="0 0 250 160" className="w-full max-w-xs" role="group" aria-label="Petak untuk menyusun jaring-jaring kubus">
        {Array.from({ length: 5 }, (_, x) => Array.from({ length: 3 }, (_, y) => { const act = () => toggle(x, y), here = has(x, y);
          return <g key={`${x},${y}`} role="button" tabIndex={0} aria-pressed={here} aria-label={`Petak (${x}, ${y})`} onClick={act} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }} className="cursor-pointer">
            <rect x={10 + x * 46} y={10 + y * 46} width="44" height="44" rx="2" fill={here ? "#b9d4f1" : "#ffffff"} stroke={here ? "#1f3b30" : "#c8d3ce"} strokeWidth={here ? 1.6 : 1} strokeDasharray={here ? undefined : "3 3"} /></g>; }))}
      </svg>
      <div className="space-y-2 text-sm"><p>Ketuk petak untuk menyusun enam persegi. Persegi terpilih: <strong>{on.length}</strong></p>
        <p>{on.length < 6 ? "Pilih sampai enam persegi." : ok ? "Dapat dilipat menjadi kubus: setiap persegi menjadi sisi yang berbeda." : "Tidak dapat dilipat menjadi kubus: ada persegi yang bertumpuk saat dilipat."}</p>
        <div className="flex flex-wrap gap-2">{(["prisma3", "limas4", "tabung", "kerucut"] as const).map(k => <NetView key={k} kind={k} cls="w-20" />)}</div>
        <p className="text-xs text-base-content/60">Jaring-jaring prisma segitiga, limas segi empat, tabung, dan kerucut.</p></div>
    </Pair>
    <Result value={`${on.length}|${on.length === 6 ? (ok ? "jaring" : "bukan") : "-"}`}>{on.length === 6 ? (ok ? "Jaring-jaring kubus." : "Bukan jaring-jaring kubus.") : `${on.length} dari 6 persegi.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B dan C (sisi datar)                                             */
/* ====================================================================== */
const shapesB = ["Kubus", "Balok", "Prisma segitiga"] as const;
function LpPrismLab() {
  const [sh, setSh] = useState<(typeof shapesB)[number]>("Balok");
  const [p, setP] = useState(4);
  const [l, setL] = useState(3);
  const [t, setT] = useState(5);
  const [k, setK] = useState(2);
  let faces: string[] = [], L = 0;
  if (sh === "Kubus") { L = 6 * p * p; faces = [`6 persegi × ${p} × ${p} = ${idn(L)}`]; }
  else if (sh === "Balok") { L = 2 * (p * l + p * t + l * t); faces = [`2 × (${p} × ${l}) = ${2 * p * l}`, `2 × (${p} × ${t}) = ${2 * p * t}`, `2 × (${l} × ${t}) = ${2 * l * t}`]; }
  else { const a = 3 * k, b = 4 * k, c = 5 * k, A = (a * b) / 2, K = a + b + c; L = 2 * A + K * t; faces = [`2 alas: 2 × {1/2} × ${a} × ${b} = ${2 * A}`, `Sisi tegak: (${a} + ${b} + ${c}) × ${t} = ${K * t}`]; }
  return <div className="space-y-3">
    <Radios label="Bangun" options={shapesB} value={sh} set={setSh} />
    <Steppers>{sh === "Prisma segitiga" ? <><Stepper label="Kelipatan segitiga 3-4-5" value={k} set={setK} min={1} max={4} /><Stepper label="Tinggi prisma" value={t} set={setT} min={1} max={12} /></>
      : <><Stepper label={sh === "Kubus" ? "Rusuk" : "Panjang"} value={p} set={setP} min={1} max={12} />{sh === "Balok" && <><Stepper label="Lebar" value={l} set={setL} min={1} max={12} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={12} /></>}</>}</Steppers>
    <Pair><SolidView kind={sh === "Kubus" ? "kubus" : sh === "Balok" ? "balok" : "prisma3"} labels={sh === "Kubus" ? { s: `${p}` } : sh === "Balok" ? { p: `${p}`, l: `${l}`, t: `${t}` } : { a: `${3 * k}`, b: `${4 * k}`, c: `${5 * k}`, t: `${t}` }} />
      <div className="space-y-2"><NetView kind={sh === "Kubus" ? "kubus" : sh === "Balok" ? "balok" : "prisma3"} cls="w-32" /><Steps lines={faces} /></div></Pair>
    <Result value={`${sh}|${L}`}>Luas permukaan {sh.toLowerCase()} = <strong>{idn(L)} satuan persegi</strong>.</Result>
  </div>;
}

function LpPyrLab() {
  const [n, setN] = useState(4);
  const [b, setB] = useState(10);
  const [l, setL] = useState(13);
  const a = r2(b / (2 * Math.tan(Math.PI / n))), K = n * b, tegak = r2((n * b * l) / 2), alas = r2((K * a) / 2), L = r2(tegak + alas);
  return <div className="space-y-3">
    <Steppers><Stepper label="Banyak sisi alas (n)" value={n} set={setN} min={3} max={8} /><Stepper label="Sisi alas (b)" value={b} set={setB} min={2} max={12} /><Stepper label="Tinggi sisi tegak (l)" value={l} set={setL} min={2} max={20} /></Steppers>
    <Pair><SolidView kind={n === 4 ? "limas4" : "limas6"} labels={n === 4 ? { b: `${b}`, l: `${l}` } : { b: `${b}`, l: `${l}`, a: `${idn(a)}` }} />
      <Steps lines={[`Apotema alas a ≈ ${idn(a)}`, `${n} segitiga: ${n} × {1/2} × ${b} × ${l} = ${idn(tegak)}`, `Alas: {1/2} × ${K} × ${idn(a)} ≈ ${idn(alas)}`, `L = {1/2} × ${K} × (${l} + ${idn(a)}) ≈ ${idn(L)}`]} /></Pair>
    <Result value={`${n}|${b}|${l}|${key(L)}`}>Luas permukaan limas segi-{n} ≈ <strong>{idn(L)}</strong>. Luas sisi tegak sendiri {idn(tegak)}, berguna untuk atap tanpa alas.</Result>
  </div>;
}

function ScaleALab() {
  const [s, setS] = useState(2);
  const [k, setK] = useState(2);
  const L1 = 6 * s * s, L2 = 6 * (s * k) ** 2, ratio = L2 / L1;
  return <div className="space-y-3">
    <Steppers><Stepper label="Rusuk kubus" value={s} set={setS} min={1} max={6} /><Stepper label="Faktor skala k" value={k} set={setK} min={0.5} max={3} step={0.5} /></Steppers>
    <div className="flex flex-wrap items-end gap-3 rounded-xl bg-base-100 p-3"><div style={{ width: `${5 + s * 1.2}rem` }} className="max-w-[45%]"><SolidView kind="kubus" labels={{ s: `${s}` }} cls="w-full" /><p className="text-center text-xs">Semula</p></div>
      <div style={{ width: `${5 + s * k * 1.2}rem` }} className="max-w-[50%]"><SolidView kind="kubus" labels={{ s: idn(s * k) }} cls="w-full" /><p className="text-center text-xs">Setelah skala {idn(k)}</p></div></div>
    <Steps lines={[`Semula: 6 × ${s}^{2} = ${idn(L1)}`, `Rusuk baru ${idn(s * k)}: 6 × ${idn(s * k)}^{2} = ${idn(L2)}`, `${idn(L2)} : ${idn(L1)} = ${idn(ratio)} = ${idn(k)}^{2}`]} />
    <Result value={`${key(L1)}|${key(L2)}|${key(ratio)}`}>Luas permukaan menjadi {idn(ratio)} kali, yaitu k^2 = {idn(k)} × {idn(k)}.</Result>
  </div>;
}

function VPrismLab() {
  const [p, setP] = useState(4);
  const [l, setL] = useState(3);
  const [t, setT] = useState(3);
  const [layers, setLayers] = useState(1);
  const ly = Math.min(layers, t);
  return <div className="space-y-3">
    <Steppers><Stepper label="Panjang" value={p} set={setP} min={1} max={6} /><Stepper label="Lebar" value={l} set={setL} min={1} max={5} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={5} /><Stepper label="Lapisan terisi" value={ly} set={setLayers} min={0} max={t} /></Steppers>
    <Pair><CubesView p={p} l={l} t={t} layers={ly} /><Steps lines={[`Satu lapisan: ${p} × ${l} = ${p * l} kubus satuan`, `${ly} lapisan: ${ly} × ${p * l} = ${ly * p * l}`, `Penuh (${t} lapisan): V = ${p} × ${l} × ${t} = ${p * l * t}`]} /></Pair>
    <Result value={`${ly * p * l}|${p * l * t}`}>{ly === t ? `Balok penuh: volume ${p * l * t} kubus satuan.` : `Terisi ${ly * p * l} dari ${p * l * t} kubus satuan.`}</Result>
  </div>;
}

function VPyrLab() {
  const [b, setB] = useState(6);
  const [t, setT] = useState(9);
  const [pour, setPour] = useState(0);
  const Vp = b * b * t, Vl = Vp / 3;
  return <div className="space-y-3">
    <Steppers><Stepper label="Sisi alas" value={b} set={setB} min={2} max={12} /><Stepper label="Tinggi" value={t} set={setT} min={3} max={15} step={3} /></Steppers>
    <Pour count={pour} set={setPour} max={3} what="limas" />
    <Pair><div className="flex items-end gap-4"><SolidView kind="limas4" labels={{ b: `${b}`, t: `${t}` }} cls="w-28" /><Fill part={pour / 3} label="Prisma" /></div>
      <Steps lines={[`V prisma = ${b} × ${b} × ${t} = ${Vp}`, `Satu tuangan limas = {1/3} × ${Vp} = ${idn(Vl)}`, `Isi prisma sekarang: ${pour} × ${idn(Vl)} = ${idn(pour * Vl)}`]} /></Pair>
    <Result value={`${pour}|${Vp}|${key(Vl)}`}>{pour === 3 ? `Prisma penuh setelah 3 tuangan, jadi V limas = 1/3 × V prisma = ${idn(Vl)}.` : `Prisma terisi ${pour} dari 3 bagian.`}</Result>
  </div>;
}

function ScaleVLab() {
  const [p, setP] = useState(5);
  const [l, setL] = useState(3);
  const [t, setT] = useState(7);
  const [k, setK] = useState(2);
  const V1 = p * l * t, V2 = V1 * k ** 3;
  return <div className="space-y-3">
    <Steppers><Stepper label="Panjang" value={p} set={setP} min={1} max={10} /><Stepper label="Lebar" value={l} set={setL} min={1} max={10} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={10} /><Stepper label="Faktor skala k" value={k} set={setK} min={0.5} max={4} step={0.5} /></Steppers>
    <Pair><SolidView kind="balok" labels={{ p: idn(p * k), l: idn(l * k), t: idn(t * k) }} />
      <Steps lines={[`Semula: ${p} × ${l} × ${t} = ${V1}`, `Baru: ${idn(p * k)} × ${idn(l * k)} × ${idn(t * k)} = ${idn(V2)}`, `${idn(V2)} : ${V1} = ${idn(V2 / V1)} = ${idn(k)}^{3}`]} /></Pair>
    <Result value={`${V1}|${key(V2)}|${key(k ** 3)}`}>Volume menjadi {idn(k ** 3)} kali, sedangkan luas permukaan hanya {idn(k * k)} kali.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D (lingkaran)                                                    */
/* ====================================================================== */
function CircLab() {
  const [r, setR] = useState(14);
  const [pi, setPi] = useState<Pi>("22/7");
  const K = 2 * piv(pi) * r, w = 300, scale = (w - 20) / (2 * 3.15 * 21);
  return <div className="space-y-3">
    <Radios label="Nilai π" options={PIS} value={pi} set={setPi} />
    <Stepper label="Jari-jari" value={r} set={setR} min={1} max={21} />
    <div className="rounded-xl bg-base-100 p-3"><svg viewBox={`0 0 ${w} 90`} className="w-full" role="img" aria-label={`Roda berjari-jari ${r} digelindingkan satu putaran sejauh ${idn(r2(K))}`}>
      <line x1="10" x2={10 + K * scale} y1="78" y2="78" stroke="#1c64b5" strokeWidth="4" /><line x1="10" x2={10 + 2 * r * scale} y1="86" y2="86" stroke="#c2410c" strokeWidth="3" />
      <circle cx={10 + K * scale} cy={78 - r * scale} r={r * scale} fill="#f6d9b8" stroke="#1f3b30" /><text x="12" y="70" fontSize="10" fill="#1c64b5">keliling</text></svg>
      <p className="text-xs text-base-content/70">Garis biru: lintasan satu putaran. Garis oranye: diameter. Lintasan ≈ 3,14 kali diameter.</p></div>
    <Steps lines={[`d = 2 × ${r} = ${2 * r}`, `K = π × d ≈ ${piText(pi)} × ${2 * r} = ${idn(r2(K))}`]} />
    <Result value={`${r}|${pi}|${key(r2(K))}`}>Keliling ≈ {idn(r2(K))}. Perbandingan K : d = {idn(r2(K / (2 * r)))}.</Result>
  </div>;
}

function CAreaLab() {
  const [r, setR] = useState(15);
  const [n, setN] = useState<"8" | "16" | "24">("16");
  const N = Number(n), L = 3.14 * r * r, w = 280, base = 3.14 * 6, sw = (w - 20) / (N / 2);
  return <div className="space-y-3">
    <Radios label="Banyak juring" options={["8", "16", "24"] as const} value={n} set={setN} />
    <Stepper label="Jari-jari" value={r} set={setR} min={1} max={30} />
    <div className="rounded-xl bg-base-100 p-3"><svg viewBox={`0 0 ${w} 80`} className="w-full" role="img" aria-label={`${N} juring disusun berselang-seling mendekati jajar genjang dengan alas πr dan tinggi r`}>
      {Array.from({ length: N }, (_, i) => { const x = 10 + Math.floor(i / 2) * sw + (i % 2 ? sw / 2 : 0), up = i % 2 === 0;
        return <path key={i} d={up ? `M${x} 70L${x + sw} 70A${base * 3} ${base * 3} 0 0 0 ${x + sw / 2} 14Z` : `M${x} 14L${x + sw} 14L${x + sw / 2} 70Z`} fill={up ? "#b2dfb8" : "#d0ebff"} stroke="#1f3b30" strokeWidth="0.8" />; })}
    </svg><p className="text-xs text-base-content/70">Makin banyak juring, susunannya makin mirip jajar genjang: alas πr, tinggi r.</p></div>
    <Steps lines={[`Alas ≈ π × r = 3,14 × ${r} = ${idn(r2(3.14 * r))}`, `Tinggi = r = ${r}`, `L = πr^{2} = 3,14 × ${r * r} = ${idn(r2(L))}`]} />
    <Result value={`${n}|${key(r2(L))}`}>Luas lingkaran ≈ {idn(r2(L))} satuan persegi.</Result>
  </div>;
}

function ArcLab({ juring = false }: { juring?: boolean }) {
  const [r, setR] = useState(21);
  const [th, setTh] = useState(60);
  const [pi, setPi] = useState<Pi>("22/7");
  const p = piv(pi), K = 2 * p * r, L = p * r * r, v = juring ? (th / 360) * L : (th / 360) * K;
  return <div className="space-y-3">
    <Radios label="Nilai π" options={PIS} value={pi} set={setPi} />
    <Steppers><Stepper label="Jari-jari" value={r} set={setR} min={1} max={28} /><Stepper label="Sudut pusat (°)" value={th} set={setTh} min={15} max={345} step={15} /></Steppers>
    <Pair><CircleView r={`${r}`} theta={th} mode={juring ? "juring" : "busur"} />
      <Steps lines={juring ? [`L lingkaran = ${piText(pi)} × ${r}^{2} = ${idn(r2(L))}`, `Bagian juring = {${th}/360}`, `Luas juring = {${th}/360} × ${idn(r2(L))} ≈ ${idn(r2(v))}`]
        : [`K = 2 × ${piText(pi)} × ${r} = ${idn(r2(K))}`, `Bagian busur = {${th}/360}`, `Panjang busur = {${th}/360} × ${idn(r2(K))} ≈ ${idn(r2(v))}`]} /></Pair>
    <Result value={`${r}|${th}|${pi}|${key(r2(v))}`}>{juring ? "Luas juring" : "Panjang busur"} ≈ <strong>{idn(r2(v))}</strong>. Sudut dua kali lipat, hasilnya juga dua kali lipat.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga E dan F (sisi lengkung)                                          */
/* ====================================================================== */
const cylKinds = ["Tertutup", "Tanpa tutup", "Pipa terbuka"] as const;
function LpCylLab() {
  const [r, setR] = useState(7);
  const [t, setT] = useState(10);
  const [kind, setKind] = useState<(typeof cylKinds)[number]>("Tertutup");
  const [pi, setPi] = useState<Pi>("22/7");
  const p = piv(pi), circ = p * r * r, sel = 2 * p * r * t, nCirc = kind === "Tertutup" ? 2 : kind === "Tanpa tutup" ? 1 : 0, L = nCirc * circ + sel;
  const W = 2 * p * r, sc = 200 / Math.max(W, 1);
  return <div className="space-y-3">
    <Radios label="Jenis tabung" options={cylKinds} value={kind} set={setKind} /><Radios label="Nilai π" options={PIS} value={pi} set={setPi} />
    <Steppers><Stepper label="Jari-jari" value={r} set={setR} min={1} max={14} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={30} /></Steppers>
    <div className="rounded-xl bg-base-100 p-3"><svg viewBox="0 0 230 200" className="mx-auto w-full max-w-xs" role="img" aria-label={`Jaring-jaring tabung ${kind.toLowerCase()}: persegi panjang ${idn(r2(W))} × ${t}${nCirc ? ` dan ${nCirc} lingkaran` : ""}`}>
      <rect x="15" y={100 - Math.min(t * sc, 80) / 2} width={W * sc} height={Math.min(t * sc, 80)} fill="#dbe8f5" stroke="#1f3b30" />
      {nCirc >= 1 && <circle cx={15 + (W * sc) / 2} cy={100 - Math.min(t * sc, 80) / 2 - r * sc} r={r * sc} fill="#c4d8ee" stroke="#1f3b30" />}
      {nCirc === 2 && <circle cx={15 + (W * sc) / 2} cy={100 + Math.min(t * sc, 80) / 2 + r * sc} r={r * sc} fill="#c4d8ee" stroke="#1f3b30" />}
      <text x={15 + (W * sc) / 2} y="104" textAnchor="middle" fontSize="10" fontWeight="700">selimut 2πr × t</text></svg></div>
    <Steps lines={[`Lingkaran: ${nCirc} × ${piText(pi)} × ${r}^{2} = ${idn(r2(nCirc * circ))}`, `Selimut: 2 × ${piText(pi)} × ${r} × ${t} = ${idn(r2(sel))}`, `Luas permukaan = ${idn(r2(L))}`]} />
    <Result value={`${kind}|${key(r2(L))}`}>Luas permukaan tabung {kind.toLowerCase()} ≈ <strong>{idn(r2(L))}</strong>.</Result>
  </div>;
}

function LpConeLab() {
  const [r, setR] = useState(5);
  const [t, setT] = useState(12);
  const s = Math.sqrt(r * r + t * t), ang = (r / s) * 360, L = 3.14 * r * (r + s), sc = 70 / s, a = (ang * Math.PI) / 180;
  const sx = 115, sy = 20, x1 = sx + s * sc * Math.sin(-a / 2), y1 = sy + s * sc * Math.cos(a / 2), x2 = sx + s * sc * Math.sin(a / 2);
  return <div className="space-y-3">
    <Steppers><Stepper label="Jari-jari alas" value={r} set={setR} min={1} max={12} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={24} /></Steppers>
    <Pair><SolidView kind="kerucut" labels={{ r: `${r}`, t: `${t}`, s: idn(r2(s)) }} />
      <svg viewBox={`0 0 230 ${Math.ceil(sy + s * sc + 2 * r * sc + 12)}`} className="w-full max-w-[14rem]" role="img" aria-label={`Jaring-jaring kerucut: juring bersudut ${idn(r2(ang))}° berjari-jari ${idn(r2(s))} dan lingkaran berjari-jari ${r}`}>
        <path d={`M${sx} ${sy}L${x1} ${y1}A${s * sc} ${s * sc} 0 ${ang > 180 ? 1 : 0} 0 ${x2} ${y1}Z`} fill="#dbe8f5" stroke="#1f3b30" />
        <circle cx={sx} cy={sy + s * sc + r * sc + 6} r={r * sc} fill="#c4d8ee" stroke="#1f3b30" />
        <text x={sx} y={sy + 26} textAnchor="middle" fontSize="10" fontWeight="700">{idn(r2(ang))}°</text></svg></Pair>
    <Steps lines={[`s = √{${r}^{2} + ${t}^{2}} ≈ ${idn(r2(s))}`, `Sudut juring = {${r}/${idn(r2(s))}} × 360° ≈ ${idn(r2(ang))}°`, `L = 3,14 × ${r} × (${r} + ${idn(r2(s))}) ≈ ${idn(r2(L))}`]} />
    <Result value={`${key(r2(s))}|${key(r2(L))}`}>Garis pelukis ≈ {idn(r2(s))}, luas permukaan ≈ <strong>{idn(r2(L))}</strong>.</Result>
  </div>;
}

function LpSphereLab() {
  const [r, setR] = useState(7);
  const [pi, setPi] = useState<Pi>("22/7");
  const c = piv(pi) * r * r;
  return <div className="space-y-3">
    <Radios label="Nilai π" options={PIS} value={pi} set={setPi} /><Stepper label="Jari-jari bola" value={r} set={setR} min={1} max={21} />
    <Pair><SolidView kind="bola" labels={{ r: `${r}` }} />
      <div><svg viewBox="0 0 200 60" className="w-full" role="img" aria-label="Kulit bola menutupi tepat empat lingkaran yang jari-jarinya sama">{[0, 1, 2, 3].map(i => <circle key={i} cx={28 + i * 48} cy="30" r="22" fill="#f6d9b8" stroke="#c2410c" />)}</svg>
        <p className="text-sm">Kulit bola menutupi tepat 4 lingkaran berjari-jari {r}.</p></div></Pair>
    <Steps lines={[`Satu lingkaran: ${piText(pi)} × ${r}^{2} = ${idn(r2(c))}`, `Luas bola = 4 × ${idn(r2(c))} = ${idn(r2(4 * c))}`]} />
    <Result value={`${r}|${pi}|${key(r2(4 * c))}`}>Luas permukaan bola ≈ <strong>{idn(r2(4 * c))}</strong>; setengah bola tertutup ≈ {idn(r2(3 * c))}.</Result>
  </div>;
}

const curved = ["Tabung", "Kerucut", "Bola"] as const;
/** Luas dan volume dalam π (koefisien π). */
const curvedLV = (sh: (typeof curved)[number], r: number, t: number) => sh === "Tabung" ? [2 * r * r + 2 * r * t, r * r * t] : sh === "Kerucut" ? [r * (r + Math.sqrt(r * r + t * t)), (r * r * t) / 3] : [4 * r * r, (4 * r ** 3) / 3];
function ScaleCLab({ volume = false }: { volume?: boolean }) {
  const [sh, setSh] = useState<(typeof curved)[number]>(volume ? "Bola" : "Tabung");
  const [r, setR] = useState(volume ? 10 : 5);
  const [t, setT] = useState(10);
  const [k, setK] = useState(volume ? 0.5 : 0.75);
  const [L1, V1] = curvedLV(sh, r, t), [L2, V2] = curvedLV(sh, r * k, t * k);
  return <div className="space-y-3">
    <Radios label="Bangun" options={curved} value={sh} set={setSh} />
    <Steppers><Stepper label="Jari-jari" value={r} set={setR} min={1} max={12} />{sh !== "Bola" && <Stepper label="Tinggi" value={t} set={setT} min={1} max={20} />}<Stepper label="Faktor skala k" value={k} set={setK} min={0.25} max={3} step={0.25} /></Steppers>
    <Pair><SolidView kind={sh === "Tabung" ? "tabung" : sh === "Kerucut" ? "kerucut" : "bola"} labels={{ r: idn(r * k), ...(sh !== "Bola" ? { t: idn(t * k) } : {}) }} />
      <Steps lines={[`Luas: ${idn(r2(L1))}π → ${idn(r2(L2))}π, perbandingan ${idn(r2(L2 / L1 * 1e4) / 1e4)} = k^{2}`, `Volume: ${idn(r2(V1))}π → ${idn(r2(V2))}π, perbandingan ${idn(Math.round((V2 / V1) * 1e6) / 1e6)} = k^{3}`]} /></Pair>
    <Result value={`${sh}|${key(L2 / L1)}|${key(V2 / V1)}`}>{volume ? <>Volume menjadi <strong>{idn(Math.round((V2 / V1) * 1e6) / 1e6)}</strong> kali, luas {idn(Math.round((L2 / L1) * 1e4) / 1e4)} kali.</> : <>Luas permukaan menjadi <strong>{idn(Math.round((L2 / L1) * 1e4) / 1e4)}</strong> kali (k^2).</>}</Result>
  </div>;
}

function VCylLab() {
  const [R, setR] = useState(7);
  const [t, setT] = useState(10);
  const [w, setW] = useState(0);
  const [pi, setPi] = useState<Pi>("22/7");
  const p = piv(pi), r = R - w, full = p * R * R * t, hole = p * r * r * t, mat = w ? full - hole : full;
  return <div className="space-y-3">
    <Radios label="Nilai π" options={PIS} value={pi} set={setPi} />
    <Steppers><Stepper label="Jari-jari luar" value={R} set={setR} min={2} max={21} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={30} /><Stepper label="Tebal dinding" value={Math.min(w, R - 1)} set={setW} min={0} max={R - 1} /></Steppers>
    <Pair><SolidView kind={w ? "pipa" : "tabung"} labels={w ? { R: `${R}`, r: `${r}`, t: `${t}` } : { r: `${R}`, t: `${t}` }} />
      <Steps lines={[`V penuh = ${piText(pi)} × ${R}^{2} × ${t} = ${idn(r2(full))}`, ...(w ? [`V rongga = ${piText(pi)} × ${r}^{2} × ${t} = ${idn(r2(hole))}`, `V bahan = ${idn(r2(mat))}`] : [])]} /></Pair>
    <Result value={`${key(r2(full))}|${key(r2(mat))}`}>{w ? <>Volume bahan pipa ≈ <strong>{idn(r2(mat))}</strong>, isi rongganya {idn(r2(hole))}.</> : <>Volume tabung ≈ <strong>{idn(r2(full))}</strong> = {idn(r2(full / 1000))} liter jika satuannya cm.</>}</Result>
  </div>;
}

function VConeLab() {
  const [r, setR] = useState(6);
  const [t, setT] = useState(10);
  const [pour, setPour] = useState(0);
  const Vt = 3.14 * r * r * t, Vk = Vt / 3;
  return <div className="space-y-3">
    <Steppers><Stepper label="Jari-jari" value={r} set={setR} min={1} max={12} /><Stepper label="Tinggi" value={t} set={setT} min={1} max={24} /></Steppers>
    <Pour count={pour} set={setPour} max={3} what="kerucut" />
    <Pair><div className="flex items-end gap-4"><SolidView kind="kerucut" labels={{ r: `${r}`, t: `${t}` }} cls="w-28" /><Fill part={pour / 3} label="Tabung" /></div>
      <Steps lines={[`V tabung = 3,14 × ${r}^{2} × ${t} = ${idn(r2(Vt))}`, `V kerucut = {1/3} × ${idn(r2(Vt))} = ${idn(r2(Vk))}`, `Isi tabung: ${pour} × ${idn(r2(Vk))} = ${idn(r2(pour * Vk))}`]} /></Pair>
    <Result value={`${pour}|${key(r2(Vk))}`}>{pour === 3 ? "Tiga kerucut penuh mengisi satu tabung." : `Tabung terisi ${pour} dari 3 bagian.`} V kerucut ≈ {idn(r2(Vk))}.</Result>
  </div>;
}

function VSphereLab() {
  const [r, setR] = useState(21);
  const [pour, setPour] = useState(0);
  const [pi, setPi] = useState<Pi>("22/7");
  const p = piv(pi), Vk = (p * r ** 3) / 3, V = (4 / 3) * p * r ** 3;
  return <div className="space-y-3">
    <Radios label="Nilai π" options={PIS} value={pi} set={setPi} /><Stepper label="Jari-jari" value={r} set={setR} min={1} max={21} />
    <Pour count={pour} set={setPour} max={2} what="kerucut (r, tinggi r)" />
    <Pair><div className="flex items-end gap-4"><SolidView kind="setengahbola" labels={{ r: `${r}` }} cls="w-28" /><Fill part={pour / 2} label="Setengah bola" /></div>
      <Steps lines={[`V kerucut = {1/3}π × ${r}^{2} × ${r} ≈ ${idn(r2(Vk))}`, `Setengah bola = 2 kerucut ≈ ${idn(r2(2 * Vk))}`, `V bola = {4/3}π × ${r}^{3} ≈ ${idn(r2(V))}`]} /></Pair>
    <Result value={`${pour}|${key(r2(V))}`}>{pour === 2 ? "Dua kerucut mengisi penuh setengah bola." : `Setengah bola terisi ${pour} dari 2 bagian.`} Volume bola ≈ <strong>{idn(r2(V))}</strong>.</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = {
  kinds: KindsLab, nets: NetsLab, lpprism: LpPrismLab, lppyr: LpPyrLab, scaleA: ScaleALab, vprism: VPrismLab, vpyr: VPyrLab, scaleV: ScaleVLab,
  circ: CircLab, carea: CAreaLab, arc: () => <ArcLab />, sector: () => <ArcLab juring />, lpcyl: LpCylLab, lpcone: LpConeLab, lpsphere: LpSphereLab,
  scaleC: () => <ScaleCLab />, vcyl: VCylLab, vcone: VConeLab, vsphere: VSphereLab, scaleCV: () => <ScaleCLab volume />,
};

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled }: { value: string; set: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 16))}
    className="h-10 w-32 rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none" />;
}
function SortPart({ p, x, put, checked }: { p: Extract<Part, { kind: "sort" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const pic = (k: number, small = false) => p.items[k].pic.type === "object" ? <ObjectView kind={p.items[k].pic.kind} cls={small ? "w-10" : "w-14"} /> : null;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">{p.items.map((it, k) => !x[k] && <button key={it.name} type="button" disabled={checked} aria-pressed={sel === k} aria-label={`Benda ${it.name}`} onClick={() => setSel(sel === k ? null : k)}
      className={`flex flex-col items-center rounded-xl border-2 bg-base-100 p-1.5 text-xs font-bold ${sel === k ? "border-success ring-2 ring-success/40" : "border-base-300"}`}>{pic(k)}{it.name}</button>)}
      {p.items.every((_, k) => x[k]) && <p className="text-sm text-base-content/60">Semua benda sudah masuk kotak. Ketuk benda di kotak untuk mengeluarkannya.</p>}</div>
    <div className="grid gap-2 sm:grid-cols-3">{p.bins.map(b => <div key={b} className="rounded-xl border-2 border-dashed border-base-content/30 bg-base-100 p-2">
      <button type="button" disabled={checked || sel === null} aria-label={`Kotak ${b}`} onClick={() => { if (sel !== null) { put(sel, b); setSel(null); } }} className="btn btn-sm btn-block btn-outline mb-1">{b}</button>
      <div className="flex min-h-12 flex-wrap gap-1">{p.items.map((it, k) => x[k] === b && <button key={it.name} type="button" disabled={checked} aria-label={`Keluarkan ${it.name} dari ${b}`} onClick={() => put(k, "")} className="flex flex-col items-center rounded-lg bg-base-200 p-1 text-[0.65rem] font-semibold">{pic(k, true)}{it.name}</button>)}</div></div>)}</div>
  </div>;
}
function MatchPart({ p, x, set, checked }: { p: Extract<Part, { kind: "match" }>; x: string[]; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const n = p.left.length, colors = ["#1c64b5", "#c2410c", "#2b8a3e", "#7048e8", "#d6336c"];
  return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk gambar di kiri, lalu nama di kanan. Ketuk gambar lagi untuk mengganti pasangannya.</p>
    <div className="grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]" style={{ gridTemplateRows: `repeat(${n}, minmax(6.5rem, auto))` }}>
      {p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-pressed={sel === k} aria-label={`Kiri ${k + 1}`} onClick={() => setSel(sel === k ? null : k)} style={{ gridColumn: 1, gridRow: k + 1, borderColor: x[k] ? colors[k] : undefined }}
        className={`m-1 flex items-center justify-center rounded-xl border-2 bg-base-100 p-1 ${sel === k ? "ring-2 ring-success" : x[k] ? "" : "border-base-300"}`}>{l.pic.type === "net" ? <NetView kind={l.pic.kind} cls="w-24" /> : <SceneView scene={l.pic} />}</button>)}
      <svg viewBox={`0 0 100 ${n * 100}`} preserveAspectRatio="none" aria-hidden="true" style={{ gridColumn: 2, gridRow: `1 / span ${n}` }} className="h-full w-full">
        {p.left.map((_, k) => { const j = p.right.indexOf(x[k]); return j >= 0 && <line key={k} x1="0" y1={k * 100 + 50} x2="100" y2={j * 100 + 50} stroke={colors[k]} strokeWidth="3" vectorEffect="non-scaling-stroke" />; })}</svg>
      {p.right.map((r, j) => { const owner = x.indexOf(r);
        return <button key={r} type="button" disabled={checked || sel === null} onClick={() => { if (sel === null) return; set(x.map((v, k) => (k === sel ? r : v === r ? "" : v)).join("|")); setSel(null); }} style={{ gridColumn: 3, gridRow: j + 1, borderColor: owner >= 0 ? colors[owner] : undefined }}
          className={`m-1 flex items-center justify-center rounded-xl border-2 bg-base-100 p-2 text-center text-sm font-bold ${owner >= 0 ? "" : "border-base-300"}`}>{r}</button>; })}
    </div></div>;
}
function CubeNetPart({ p, value, set, checked }: { p: Extract<Part, { kind: "cubenet" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const all = [...p.cells, ...p.slots], minX = Math.min(...all.map(c => c[0])), minY = Math.min(...all.map(c => c[1])), maxX = Math.max(...all.map(c => c[0])), maxY = Math.max(...all.map(c => c[1])), s = 40;
  return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><p className="font-bold">{p.label}</p>
    <svg viewBox={`0 0 ${(maxX - minX + 1) * s + 8} ${(maxY - minY + 1) * s + 8}`} className="w-full max-w-[16rem]">
      {p.cells.map(([x, y]) => <rect key={`${x},${y}`} x={4 + (x - minX) * s} y={4 + (y - minY) * s} width={s - 2} height={s - 2} fill="#b9d4f1" stroke="#1f3b30" strokeWidth="1.5" />)}
      {p.slots.map(([x, y]) => { const k = `${x},${y}`, on = value === k, act = () => { if (!checked) set(on ? "" : k); };
        return <g key={k} role="button" tabIndex={0} aria-pressed={on} aria-label={`Petak (${x}, ${y})`} onClick={act} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }} className="cursor-pointer">
          <rect x={4 + (x - minX) * s} y={4 + (y - minY) * s} width={s - 2} height={s - 2} fill={on ? "#ffd8a8" : "#ffffff"} stroke={on ? "#c2410c" : "#868e96"} strokeWidth="1.5" strokeDasharray={on ? undefined : "4 3"} /></g>; })}
    </svg><p className="text-sm">Petak terpilih: <strong>{value ? `(${value.replace(",", ", ")})` : "belum ada"}</strong></p></div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>{p.pre && <span className="font-semibold">{p.pre}</span>}<In label={plainMath(p.label)} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold"><M text={p.unit} /></span>}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      {p.pics ? <div className="grid grid-cols-2 gap-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-base-100 p-1.5 ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start font-extrabold">{op}.</span><SceneView scene={p.pics![k]} /></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "sort": return <SortPart p={p} x={x} put={put} checked={checked} />;
    case "match": return <MatchPart p={p} x={x} set={set} checked={checked} />;
    case "cubenet": return <CubeNetPart p={p} value={value} set={set} checked={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: BQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeNineSolids() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 9, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bangun Ruang</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Mengenal jenis bangun ruang dan jaring-jaringnya, menghitung luas permukaan dan volume bangun sisi datar dan sisi lengkung, serta keliling, luas, busur, dan juring lingkaran.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex w-44 items-end gap-1"><SolidView kind="tabung" cls="w-1/3" /><SolidView kind="kerucut" cls="w-1/3" /><SolidView kind="bola" cls="w-1/3" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berapa karton dan berapa isinya?</h2>
        <p className="mt-2 text-sm">Pabrik kemasan perlu tahu luas bahan untuk membuat kardus atau kaleng, dan berapa banyak isi yang muat di dalamnya. Bab ini membahas kedua ukuran itu untuk balok, prisma, limas, tabung, kerucut, dan bola.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bangun-ruang">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bangun-ruang" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map(x => <button key={x.code} type="button" aria-current={x === t ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${x === t ? "btn-success" : "btn-outline"}`} onClick={() => go(sections.findIndex(o => o.topic === x))}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {inTopic.map(({ x, i }) => <button key={x.code} type="button" role="tab" aria-selected={i === idx} onClick={() => go(i)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${i === idx ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{x.code} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={idx} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{s.code} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <div className="mt-4 border-s-4 border-success ps-3 text-sm leading-7"><p><span className="font-bold">Contoh. </span><M text={s.example} /></p>
              <ol className="mt-1 list-decimal space-y-0.5 ps-5">{s.work.map(w => <li key={w}><M text={w} /></li>)}</ol></div>
            <div className="mt-4 text-sm leading-7"><p className="font-bold">Perlu diperhatikan</p><ul className="list-disc space-y-1 ps-5">{s.notes.map(w => <li key={w}><M text={w} /></li>)}</ul></div>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={idx === 0} onClick={() => go(idx - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan {s.code}</button>
            {idx < sections.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(idx + 1)}>{sections[idx + 1].topic === t ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<BQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
