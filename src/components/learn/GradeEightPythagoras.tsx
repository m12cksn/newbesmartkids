"use client";

import { ArrowLeft, ArrowRight, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { FigView } from "./GradeSevenSimilarityArt";
import { GridView, LadderView, M, plainMath, RadarView, SceneView } from "./GradeEightPythagorasArt";
import { simplifyRoot } from "@/data/grade-eight-powers";
import type { Fig, Pt } from "@/data/grade-seven-similarity";
import { assessment, cells, correct, formatAnswer, idn, practice, ready, rightTri, SEP, splitParts, topics, triangleType, type Part, type TQuestion } from "@/data/grade-eight-pythagoras";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1 }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(Math.round((value - step) * 100) / 100)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-8 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(Math.round((value + step) * 100) / 100)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string | number>({ label, options, value, set, show = String }: { label: string; options: readonly T[]; value: T; set: (v: T) => void; show?: (v: T) => ReactNode }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={String(o)} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{show(o)}</button>)}</div>;
}
/** Panjang √n dalam bentuk paling sederhana, teks dengan penanda √{…}. */
const rootOf = (n: number) => { const [c, r] = simplifyRoot(1, n); return r === 1 ? idn(c) : `${c === 1 ? "" : c}√{${r}}`; };
/** "√{n}" atau "√{n} = bentuk sederhana" bila berbeda. */
const sqrtEq = (n: number) => (rootOf(n) === `√{${n}}` ? `√{${n}}` : `√{${n}} = ${rootOf(n)}`);
const approx = (n: number) => idn(Math.round(Math.sqrt(n) * 100) / 100);
/** Segitiga dari tiga sisi: alas AB = c, titik C di atas. */
function triFromSides(a: number, b: number, c: number): Pt[] {
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(b * b - x * x, 0));
  return [[0, 0], [c, 0], [x, -y]];
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function SquaresLab() {
  const [nn, setN] = useState(13);
  const sq = nn * nn, u = 150 / nn;
  return <div className="space-y-3">
    <Stepper label="Panjang sisi" value={nn} set={setN} min={1} max={25} />
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <svg viewBox="-4 -4 168 168" className="w-40" role="img" aria-label={`Persegi ${nn} kali ${nn} petak, berisi ${sq} petak`}>
        <rect width="150" height="150" fill="#dbeafe" stroke="#2563a6" strokeWidth="2" />
        {nn <= 25 && Array.from({ length: nn - 1 }, (_, k) => <path key={k} d={`M${(k + 1) * u} 0v150M0 ${(k + 1) * u}h150`} stroke="#93b8e6" strokeWidth={nn > 15 ? 0.5 : 1} />)}
        <text x="75" y="162" textAnchor="middle" fontSize="10" fontWeight="800" fill="#1c64b5">{nn}</text>
      </svg>
      <div className="text-lg font-bold"><p><M text={`${nn}^{2} = ${nn} × ${nn} = ${idn(sq)}`} /></p><p><M text={`√{${idn(sq)}} = ${nn}`} /></p></div>
    </div>
    <Result value={`${nn}|${sq}`}>Persegi bersisi {nn} berisi {idn(sq)} petak. Jadi {idn(sq)} adalah bilangan kuadrat dan akar kuadratnya {nn}.</Result>
  </div>;
}

function ProofLab() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c2 = a * a + b * b, c = Math.sqrt(c2);
  // Titik siku-siku di O(0,0); sisi a tegak ke atas, sisi b mendatar ke kanan.
  const O: Pt = [0, 0], P: Pt = [0, -a], Q: Pt = [b, 0];
  const sqA: Pt[] = [O, P, [-a, -a], [-a, 0]], sqB: Pt[] = [O, Q, [b, b], [0, b]];
  // Persegi pada sisi miring PQ: geser sejauh (a, −b), tegak lurus PQ dan menjauhi O, panjangnya tepat c.
  const outC: Pt[] = [P, Q, [Q[0] + a, Q[1] - b], [P[0] + a, P[1] - b]];
  const all = [...sqA, ...sqB, ...outC], xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), k = 190 / Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0);
  const T = (p: Pt) => `${(p[0] - x0) * k + 10},${(p[1] - y0) * k + 10}`;
  const poly = (pts: Pt[], fill: string, stroke: string, key: string) => <polygon key={key} points={pts.map(T).join(" ")} fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />;
  const grid = (o: Pt, dx: Pt, dy: Pt, m: number, key: string) => <g key={key} stroke="#ffffff" strokeOpacity=".7" strokeWidth="0.8">{Array.from({ length: m - 1 }, (_, i) => <g key={i}>
    <line x1={(o[0] + dx[0] * (i + 1) - x0) * k + 10} y1={(o[1] + dx[1] * (i + 1) - y0) * k + 10} x2={(o[0] + dx[0] * (i + 1) + dy[0] * m - x0) * k + 10} y2={(o[1] + dx[1] * (i + 1) + dy[1] * m - y0) * k + 10} />
    <line x1={(o[0] + dy[0] * (i + 1) - x0) * k + 10} y1={(o[1] + dy[1] * (i + 1) - y0) * k + 10} x2={(o[0] + dy[0] * (i + 1) + dx[0] * m - x0) * k + 10} y2={(o[1] + dy[1] * (i + 1) + dx[1] * m - y0) * k + 10} /></g>)}</g>;
  const ctr = (pts: Pt[]) => { const x = pts.reduce((s, p) => s + p[0], 0) / 4, y = pts.reduce((s, p) => s + p[1], 0) / 4; return [(x - x0) * k + 10, (y - y0) * k + 14]; };
  const [ca, cb, cc] = [ctr(sqA), ctr(sqB), ctr(outC)];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Sisi a" value={a} set={setA} min={1} max={12} /><Stepper label="Sisi b" value={b} set={setB} min={1} max={12} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <svg viewBox="0 0 210 210" className="w-56 max-w-full" role="img" aria-label={`Segitiga siku-siku dengan sisi ${a} dan ${b}. Persegi pada sisinya berluas ${a * a}, ${b * b}, dan ${c2}`}>
        {poly(sqA, "#4c8bd6", "#1c4f8f", "a")}{grid(O, [0, -1], [-1, 0], a, "ga")}
        {poly(sqB, "#e8a33d", "#9a5b0a", "b")}{grid(O, [1, 0], [0, 1], b, "gb")}
        {poly(outC, "#5fb88a", "#1f6b46", "c")}
        <polygon points={[O, P, Q].map(T).join(" ")} fill="#fff7e6" stroke="#33413b" strokeWidth="2" />
        <text x={ca[0]} y={ca[1]} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{a * a}</text>
        <text x={cb[0]} y={cb[1]} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{b * b}</text>
        <text x={cc[0]} y={cc[1]} textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{c2}</text>
      </svg>
      <div className="text-lg font-bold">
        <p><M text={`a^{2} = ${a}^{2} = ${a * a}`} /></p><p><M text={`b^{2} = ${b}^{2} = ${b * b}`} /></p>
        <p><M text={`c^{2} = ${a * a} + ${b * b} = ${c2}`} /></p><p><M text={`c = ${sqrtEq(c2)}`} /></p>
      </div>
    </div>
    <Result value={`${a * a}|${b * b}|${c2}`}>Luas persegi biru dan jingga: {a * a} + {b * b} = {c2}, sama dengan luas persegi hijau pada sisi miring. Sisi miringnya <M text={rootOf(c2)} />{Number.isInteger(c) ? "" : ` ≈ ${approx(c2)}`}.</Result>
  </div>;
}

function SolveLab() {
  const [find, setFind] = useState<"miring" | "siku">("miring");
  const [p, setP] = useState(12);
  const [q, setQ] = useState(5);
  const hyp = find === "miring", big = hyp ? p : Math.max(p, q + 1);
  const val = hyp ? p * p + q * q : big * big - q * q;
  const fig = hyp ? rightTri(q, p, [`${p}`, `${q}`, "?"]) : rightTri(q, Math.sqrt(val), ["?", `${q}`, `${big}`]);
  return <div className="space-y-3">
    <Radios label="Yang dicari" options={["miring", "siku"] as const} value={find} set={setFind} show={o => (o === "miring" ? "Sisi miring" : "Sisi siku-siku")} />
    <div className="flex flex-wrap gap-4">{hyp ? <Stepper label="Sisi siku-siku a" value={p} set={setP} min={1} max={30} /> : <Stepper label="Sisi miring c" value={big} set={setP} min={q + 1} max={30} />}<Stepper label="Sisi siku-siku b" value={q} set={setQ} min={1} max={hyp ? 30 : big - 1} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <FigView fig={fig} className="w-40 overflow-visible px-4" label={`Segitiga siku-siku, ${hyp ? `sisi siku-siku ${p} dan ${q}` : `sisi miring ${big}, sisi siku-siku ${q}`}`} />
      <ol className="list-decimal space-y-1 ps-5 text-base">
        {hyp ? <><li><M text={`c^{2} = ${p}^{2} + ${q}^{2}`} /></li><li><M text={`c^{2} = ${p * p} + ${q * q} = ${val}`} /></li></>
          : <><li><M text={`a^{2} = ${big}^{2} − ${q}^{2}`} /></li><li><M text={`a^{2} = ${big * big} − ${q * q} = ${val}`} /></li></>}
        <li className="font-bold"><M text={`${hyp ? "c" : "a"} = ${sqrtEq(val)}`} /></li>
      </ol>
    </div>
    <Result value={`${find}|${val}`}>{hyp ? "Sisi miring: jumlahkan kuadrat kedua sisi siku-siku." : "Sisi siku-siku: kurangkan kuadrat sisi siku-siku yang diketahui dari kuadrat sisi miring."} Hasilnya <M text={rootOf(val)} />{Number.isInteger(Math.sqrt(val)) ? "" : ` ≈ ${approx(val)}`}.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function KindLab() {
  const [s, setS] = useState([4, 5, 6]);
  const set = (i: number) => (v: number) => setS(s.map((x, j) => (j === i ? v : x)));
  const [a, b, c] = [...s].sort((x, y) => x - y), valid = a + b > c;
  const kind = triangleType(s), lhs = c * c, rhs = a * a + b * b;
  const fig: Fig = { pts: triFromSides(a, b, c), labels: ["", "", ""], sides: [String(c), String(a), String(b)], right: kind === "Siku-siku" ? [2] : undefined };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4">{["Sisi 1", "Sisi 2", "Sisi 3"].map((l, i) => <Stepper key={l} label={l} value={s[i]} set={set(i)} min={1} max={30} />)}</div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      {valid ? <FigView fig={fig} className="w-44 overflow-visible px-4" label={`Segitiga dengan sisi ${a}, ${b}, dan ${c}`} /> : <p className="w-44 text-sm font-semibold text-error">{a} + {b} tidak lebih dari {c}, jadi ketiga sisi tidak dapat membentuk segitiga.</p>}
      <div className="text-lg font-bold"><p>Sisi terpanjang c = {c}</p><p><M text={`c^{2} = ${lhs}`} /></p><p><M text={`a^{2} + b^{2} = ${a * a} + ${b * b} = ${rhs}`} /></p><p>{lhs} {lhs === rhs ? "=" : lhs < rhs ? "<" : ">"} {rhs}</p></div>
    </div>
    <Result value={valid ? kind : "bukan"}>{valid ? <>Segitiga {a}, {b}, {c} adalah segitiga <strong>{kind.toLowerCase()}</strong>.{kind === "Siku-siku" ? " Ketiga bilangan ini tripel Pythagoras." : ""}</> : "Bukan segitiga. Ubah panjang sisinya."}</Result>
  </div>;
}

function TriplesLab() {
  const [p, setP] = useState(3);
  const [q, setQ] = useState(2);
  const Q = Math.min(q, p - 1), a = p * p - Q * Q, b = 2 * p * Q, c = p * p + Q * Q;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="p" value={p} set={setP} min={2} max={9} /><Stepper label="q" value={Q} set={setQ} min={1} max={p - 1} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <FigView fig={rightTri(b, a, [String(a), String(b), String(c)])} className="w-40 overflow-visible px-4" label={`Segitiga siku-siku dengan sisi ${a}, ${b}, dan ${c}`} />
      <ul className="space-y-1 text-base">
        <li><M text={`p^{2} − q^{2} = ${p * p} − ${Q * Q} = ${a}`} /></li>
        <li><M text={`2pq = 2 × ${p} × ${Q} = ${b}`} /></li>
        <li><M text={`p^{2} + q^{2} = ${p * p} + ${Q * Q} = ${c}`} /></li>
        <li className="font-bold"><M text={`${a}^{2} + ${b}^{2} = ${a * a + b * b} = ${c}^{2}`} /></li>
      </ul>
    </div>
    <Result value={`${a}|${b}|${c}`}>Tripel Pythagoras: {Math.min(a, b)}, {Math.max(a, b)}, {c}.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function IsoLab() {
  const [a, setA] = useState(5);
  return <div className="space-y-3">
    <Stepper label="Sisi siku-siku" value={a} set={setA} min={1} max={20} />
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <svg viewBox="-24 -24 198 198" className="w-44" role="img" aria-label={`Persegi bersisi ${a} dipotong diagonalnya menjadi dua segitiga siku-siku sama kaki`}>
        <rect width="150" height="150" fill="#e8f3fb" stroke="#2563a6" strokeWidth="2" />
        <polygon points="0,0 0,150 150,150" fill="#fde7c7" stroke="#c2410c" strokeWidth="2" />
        <path d="M0 138h12v12" fill="none" stroke="#e5484d" strokeWidth="1.5" />
        <text x="-8" y="80" textAnchor="end" fontSize="12" fontWeight="800" fill="#1c64b5">{a}</text>
        <text x="75" y="168" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1c64b5">{a}</text>
        <text x="86" y="64" textAnchor="start" fontSize="12" fontWeight="800" fill="#b42318">{a}√2</text>
        <text x="20" y="40" fontSize="10" fontWeight="700" fill="#33413b">45°</text><text x="104" y="142" fontSize="10" fontWeight="700" fill="#33413b">45°</text>
      </svg>
      <div className="text-lg font-bold"><p><M text={`c = √{${a}^{2} + ${a}^{2}} = √{${2 * a * a}}`} /></p><p><M text={`c = ${a}√{2} ≈ ${idn(Math.round(a * Math.SQRT2 * 100) / 100)}`} /></p><p className="text-base font-semibold"><M text={`${a} : ${a} : ${a}√{2} = 1 : 1 : √{2}`} /></p></div>
    </div>
    <Result value={`${a}|2`}>Hipotenusa segitiga 45°-45°-90° dengan sisi siku-siku {a} adalah <M text={`${a}√{2}`} />.</Result>
  </div>;
}

function HalfLab() {
  const [a, setA] = useState(6);
  const h = Math.sqrt(3) * 75;
  return <div className="space-y-3">
    <Stepper label="Sisi terpendek" value={a} set={setA} min={1} max={20} />
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <svg viewBox="-24 -16 198 172" className="w-48" role="img" aria-label={`Segitiga sama sisi bersisi ${2 * a} dibelah dua menjadi segitiga 30-60-90 dengan sisi ${a}, ${2 * a}, dan ${a} akar 3`}>
        <polygon points={`0,${h} 150,${h} 75,0`} fill="#e8f3fb" stroke="#2563a6" strokeWidth="1.5" strokeDasharray="5 3" />
        <polygon points={`75,${h} 150,${h} 75,0`} fill="#fde7c7" stroke="#c2410c" strokeWidth="2" />
        <path d={`M75 ${h - 12}h12v12`} fill="none" stroke="#e5484d" strokeWidth="1.5" />
        <text x="112" y={h + 14} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1c64b5">{a}</text>
        <text x="122" y={h / 2 - 2} textAnchor="start" fontSize="12" fontWeight="800" fill="#1c64b5">{2 * a}</text>
        <text x="70" y={h / 2 + 10} textAnchor="end" fontSize="12" fontWeight="800" fill="#b42318">{a}√3</text>
        <text x="80" y="34" fontSize="10" fontWeight="700" fill="#33413b">30°</text><text x="124" y={h - 6} fontSize="10" fontWeight="700" fill="#33413b">60°</text>
      </svg>
      <div className="text-lg font-bold"><p>Hipotenusa = 2 × {a} = {2 * a}</p><p><M text={`√{${2 * a}^{2} − ${a}^{2}} = √{${3 * a * a}} = ${a}√{3}`} /></p><p className="text-base font-semibold"><M text={`${a} : ${2 * a} : ${a}√{3} = 1 : 2 : √{3}`} /></p></div>
    </div>
    <Result value={`${2 * a}|${a}|3`}>Sisi di depan 30° = {a}, hipotenusa = {2 * a}, sisi di depan 60° = <M text={`${a}√{3}`} /> ≈ {idn(Math.round(a * Math.sqrt(3) * 100) / 100)}.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D                                                                */
/* ====================================================================== */
function LadderLab() {
  const [wall, setWall] = useState(4);
  const [base, setBase] = useState(3);
  const sq = wall * wall + base * base;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Tinggi di tembok (m)" value={wall} set={setWall} min={1} max={12} /><Stepper label="Jarak kaki tangga (m)" value={base} set={setBase} min={1} max={9} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <LadderView wall={`${wall} m`} base={`${base} m`} ladder="?" />
      <div className="text-lg font-bold"><p><M text={`L^{2} = ${wall}^{2} + ${base}^{2} = ${sq}`} /></p><p><M text={`L = ${sqrtEq(sq)}`} />{!Number.isInteger(Math.sqrt(sq)) && ` ≈ ${approx(sq)}`} m</p></div>
    </div>
    <Result value={`${sq}`}>Tangga paling pendek yang dibutuhkan <M text={rootOf(sq)} /> m{Number.isInteger(Math.sqrt(sq)) ? "" : ` ≈ ${approx(sq)} m`}. Tangga adalah sisi miring, jadi selalu lebih panjang dari tinggi tembok.</Result>
  </div>;
}

function RadarLab() {
  const [ab, setAb] = useState(12);
  const [ac, setAc] = useState(13);
  const [ad, setAd] = useState(20);
  const AC = Math.max(ac, ab + 1), AD = Math.max(ad, AC + 1);
  const bc2 = AC * AC - ab * ab, bd2 = AD * AD - ab * ab, bc = Math.sqrt(bc2), bd = Math.sqrt(bd2);
  const nice = Number.isInteger(bc) && Number.isInteger(bd);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="AB (km)" value={ab} set={setAb} min={3} max={15} /><Stepper label="AC (km)" value={AC} set={setAc} min={ab + 1} max={30} /><Stepper label="AD (km)" value={AD} set={setAd} min={AC + 1} max={35} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <RadarView ab={`${ab} km`} ac={`${AC} km`} ad={`${AD} km`} />
      <ol className="list-decimal space-y-1 ps-5 text-base">
        <li><M text={`BC = √{${AC}^{2} − ${ab}^{2}} = ${sqrtEq(bc2)}`} /></li>
        <li><M text={`BD = √{${AD}^{2} − ${ab}^{2}} = ${sqrtEq(bd2)}`} /></li>
        <li className="font-bold">CD = BD − BC ≈ {idn(Math.round((bd - bc) * 100) / 100)} km</li>
      </ol>
    </div>
    <Result value={`${AC}|${AD}|${idn(Math.round((bd - bc) * 100) / 100)}`}>Kedua segitiga berbagi sisi AB. Jarak kedua pesawat adalah selisih tingginya: {nice ? `${bd} − ${bc} = ${bd - bc}` : `≈ ${idn(Math.round((bd - bc) * 100) / 100)}`} km.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga E                                                                */
/* ====================================================================== */
function GridLab() {
  const [x1, setX1] = useState(1);
  const [y1, setY1] = useState(2);
  const [x2, setX2] = useState(7);
  const [y2, setY2] = useState(10);
  const dx = x2 - x1, dy = y2 - y1, d2 = dx * dx + dy * dy, neg = (v: number) => (v < 0 ? `(${idn(v)})` : idn(v));
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Stepper label="x₁" value={x1} set={setX1} min={-8} max={10} /><Stepper label="y₁" value={y1} set={setY1} min={-8} max={10} /><Stepper label="x₂" value={x2} set={setX2} min={-8} max={10} /><Stepper label="y₂" value={y2} set={setY2} min={-8} max={10} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <GridView points={[{ name: "A", x: x1, y: y1 }, { name: "B", x: x2, y: y2 }]} segments={[[0, 1]]} legs label={`Titik A(${x1}, ${y1}) dan B(${x2}, ${y2})`} />
      <ol className="list-decimal space-y-1 ps-5 text-base">
        <li>Selisih x: {idn(x2)} − {neg(x1)} = {idn(dx)}</li><li>Selisih y: {idn(y2)} − {neg(y1)} = {idn(dy)}</li>
        <li className="font-bold"><M text={`AB = √{${neg(dx)}^{2} + ${neg(dy)}^{2}} = ${d2 === 0 ? "0" : sqrtEq(d2)}`} /></li>
      </ol>
    </div>
    <Result value={`${Math.abs(dx)}|${Math.abs(dy)}|${d2}`}>{d2 === 0 ? "Kedua titik berimpit, jaraknya 0." : <>Jarak A ke B = <M text={rootOf(d2)} />{Number.isInteger(Math.sqrt(d2)) ? "" : ` ≈ ${approx(d2)}`} satuan.</>}</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { squares: SquaresLab, proof: ProofLab, solve: SolveLab, kind: KindLab, triples: TriplesLab, iso: IsoLab, half: HalfLab, ladder: LadderLab, radar: RadarLab, grid: GridLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-16" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,.\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), lbl = plainMath(p.kind === "tf" || p.kind === "classify" ? "" : p.label);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const label = p.kind !== "tf" && p.kind !== "classify" ? <span className="font-bold"><M text={p.label} /></span> : null;
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{label}<In label={lbl} value={value} set={set} disabled={checked} w="w-32" />{p.unit && <span className="font-semibold"><M text={p.unit} /></span>}</div>;
    case "root": return <div className="space-y-1"><div className="flex flex-wrap items-center gap-2">{label}
      <span className="inline-flex items-center gap-0.5"><In label={`${lbl} bilangan di depan akar`} value={x[0]} set={v => put(0, v)} disabled={checked} w="w-14" /><span className="text-2xl">√</span><span className="border-t-2 border-neutral pt-0.5"><In label={`${lbl} bilangan di dalam akar`} value={x[1]} set={v => put(1, v)} disabled={checked} w="w-14" /></span></span>{p.unit && <span className="font-semibold">{p.unit}</span>}</div>
      <p className="text-xs text-base-content/60">Tulis dalam bentuk akar paling sederhana. Kotak depan boleh dikosongkan jika bilangannya 1.</p></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{label}
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Sisi ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold">{r.text}</span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: TQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeEightPythagoras() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  const total = topics.reduce((a, x) => a + x.sections.length, 0);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 8, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Teorema Pythagoras</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Hubungan ketiga sisi segitiga siku-siku: menemukan teoremanya, tripel Pythagoras, segitiga istimewa, pemakaiannya sehari-hari, dan rumus jarak dua titik.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <svg aria-hidden="true" viewBox="0 0 120 80" className="w-28"><polygon points="20,70 20,20 90,70" fill="#fde7c7" stroke="#c2410c" strokeWidth="2" /><path d="M20 60h10v10" fill="none" stroke="#e5484d" strokeWidth="1.5" /><text x="12" y="48" fontSize="11" fontWeight="800" fill="#1c64b5" textAnchor="end">3</text><text x="55" y="80" fontSize="11" fontWeight="800" fill="#1c64b5" textAnchor="middle">4</text><text x="62" y="40" fontSize="11" fontWeight="800" fill="#b42318">5</text></svg>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Mengukur tanpa harus memanjat</h2>
        <p className="mt-2 text-sm">Berapa panjang tangga untuk mencapai jendela? Seberapa lebar sungai di depanmu? Dengan segitiga siku-siku, jarak yang sulit diukur langsung bisa dihitung dari dua jarak lain.</p>
        <p className="mt-2 text-sm text-base-content/60">{total} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-pythagoras">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pythagoras" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-3 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-7"><span className="font-bold">Contoh. </span><M text={s.example} /></p>
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0 && sec === 0} onClick={prev}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={next}>{sec < t.sections.length - 1 ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<TQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
