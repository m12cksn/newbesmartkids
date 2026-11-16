"use client";

import { ArrowLeft, ArrowRight, Layers, Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { FigView, Grid, M, PlaneView, plainMath, SceneView, Shadow } from "./GradeTwelveCongruenceArt";
import {
  angleAt, assessment, cells, correct, cosRuleAngle, cosRuleSide, dist, formatAnswer, idn, move, practice, ready, sections, SEP, splitParts, topics, triSAS, triSSS,
  type Part, type PQuestion, type Pt,
} from "@/data/grade-twelve-congruence";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  const r = (x: number) => Math.round(x * 1000) / 1000;
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(r(value - step))}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(r(value + step))}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div className="space-y-1"><p className="text-xs font-semibold">{label}</p><div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-label={plainMath(o)} aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 normal-case ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div></div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const r1 = (v: number) => Math.round(v * 10) / 10, r2 = (v: number) => Math.round(v * 100) / 100;

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const QA: Record<string, Pt> = { A: [0, 3], B: [0.3, 0.2], C: [3.4, 0], D: [3, 2.3] };
const QE = move(QA, 7.6, 0.4, { rot: 25, rename: { A: "P", B: "Q", C: "R", D: "S" } });
function PasangLab() {
  const [pairs, setPairs] = useState<Record<string, string>>({ A: "P" }); const [sel, setSel] = useState<string | null>(null);
  const L = "ABCD", Rn = "PQRS", used = Object.values(pairs);
  const pick = (r: string) => { if (!sel) return; const next = Object.fromEntries(Object.entries(pairs).filter(([l, v]) => l !== sel && v !== r)); next[sel] = r; setPairs(next); setSel(null); };
  const sides = L.split("").map((a, i) => [a, L[(i + 1) % 4]]).filter(([a, b]) => pairs[a] && pairs[b]).map(([a, b]) => `${a}${b}-${pairs[a]}${pairs[b]}`);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold">Bangun ABCD</span><div role="group" aria-label="Bangun ABCD" className="flex gap-1">{L.split("").map(v => <button key={v} type="button" aria-label={`Titik ${v}`} aria-pressed={sel === v} onClick={() => setSel(v)} className={`btn btn-sm btn-square ${sel === v ? "btn-success" : pairs[v] ? "btn-outline btn-success" : "btn-outline"}`}>{v}</button>)}</div>
      <span className="text-xs font-semibold">Bangun PQRS</span><div role="group" aria-label="Bangun PQRS" className="flex gap-1">{Rn.split("").map(v => <button key={v} type="button" aria-label={`Titik ${v}`} disabled={!sel} onClick={() => pick(v)} className={`btn btn-sm btn-square ${used.includes(v) ? "btn-outline btn-info" : "btn-outline"}`}>{v}</button>)}</div>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => { setPairs({}); setSel(null); }}><RotateCcw className="size-4" aria-hidden="true" />Ulang</button></div>
    <Pair>
      <FigView fig={{ type: "fig", pts: { ...QA, ...QE }, polys: ["ABCD", "PQRS"] }} highlight={sel ? [sel] : []} extra={to => Object.entries(pairs).map(([l, r]) => { const a = to(QA[l]), b = to(QE[r]); return <line key={l} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#f59f00" strokeWidth="1.6" strokeDasharray="5 3" />; })} />
      <ul className="space-y-1 text-sm leading-7"><li>Pasangan titik: {Object.entries(pairs).map(([l, r]) => `${l} ↔ ${r}`).join(", ") || "belum ada"}</li>
        <li>Sudut yang bersesuaian: {Object.entries(pairs).map(([l, r]) => `∠${l} ↔ ∠${r}`).join(", ") || "-"}</li>
        <li>Sisi yang bersesuaian: {sides.map(s => s.replace("-", " ↔ ")).join(", ") || "pasangkan dua titik berurutan"}</li></ul>
    </Pair>
    <Result value={`${Object.entries(pairs).map(([l, r]) => l + r).join(",")}|${sides.join(",")}`}>{sel ? `Pilih pasangan untuk titik ${sel} pada bangun PQRS.` : Object.keys(pairs).length === 4 ? `Korespondensi lengkap: ABCD ↔ ${L.split("").map(v => pairs[v]).join("")}.` : "Ketuk titik pada ABCD, lalu titik pasangannya pada PQRS."}</Result>
  </div>;
}

const BASE: Record<string, Pt> = { A: [0, 0], B: [5, 0], C: [5.8, 3], D: [1, 3.4] };
const CANDS: Record<string, Record<string, Pt>> = {
  "P (diputar)": move(BASE, 0, 0, { rot: 35, rename: { A: "P", B: "Q", C: "R", D: "S" } }),
  "Q (dicerminkan)": move(BASE, 0, 0, { flip: true, rename: { A: "P", B: "Q", C: "R", D: "S" } }),
  "R (sisi diperpanjang)": { P: [0, 0], Q: [6, 0], R: [6.8, 3], S: [1, 3.4] },
};
const sidesOf = (p: Pt[]) => p.map((x, i) => dist(x, p[(i + 1) % p.length]));
const anglesOf = (p: Pt[]) => p.map((x, i) => angleAt(x, p[(i + p.length - 1) % p.length], p[(i + 1) % p.length]));
function TumpukLab() {
  const [c, setC] = useState<keyof typeof CANDS>("P (diputar)"); const [over, setOver] = useState(false);
  const base = ["A", "B", "C", "D"].map(k => BASE[k]), cand = ["P", "Q", "R", "S"].map(k => CANDS[c][k]);
  const s1 = sidesOf(base), s2 = sidesOf(cand), a1 = anglesOf(base), a2 = anglesOf(cand);
  const ok = s1.every((v, i) => Math.abs(v - s2[i]) < 1e-4) && a1.every((v, i) => Math.abs(v - a2[i]) < 1e-3);
  const shown: Record<string, Pt> = over ? (ok ? Object.fromEntries(["P", "Q", "R", "S"].map((k, i) => [k, [base[i][0] + 0.05, base[i][1] + 0.05] as Pt])) : { P: BASE.A, Q: [6, 0], R: [6.8, 3], S: BASE.D }) : move(CANDS[c], 9, 0);
  return <div className="space-y-3">
    <Radios label="Bangun calon" options={Object.keys(CANDS) as (keyof typeof CANDS)[]} value={c} set={v => { setC(v); setOver(false); }} />
    <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => setOver(!over)}><Layers className="size-4" aria-hidden="true" />{over ? "Pisahkan" : "Tumpuk di atas ABCD"}</button>
    <Pair>
      <FigView fig={{ type: "fig", pts: { ...BASE, ...shown }, polys: ["ABCD", "PQRS"] }} />
      <Grid head={["Pasangan", "ABCD", "PQRS"]} rows={[...["AB ↔ PQ", "BC ↔ QR", "CD ↔ RS", "DA ↔ SP"].map((n2, i) => [n2, idn(r2(s1[i])), idn(r2(s2[i]))]), ...["∠A ↔ ∠P", "∠B ↔ ∠Q", "∠C ↔ ∠R", "∠D ↔ ∠S"].map((n2, i) => [n2, `${idn(r1(a1[i]))}°`, `${idn(r1(a2[i]))}°`])]} />
    </Pair>
    <Result value={`${c.split(" ")[0]}|${ok ? "kongruen" : "tidak"}|${over ? "tumpuk" : "pisah"}`}>{ok ? `Semua sisi dan sudut yang bersesuaian sama. ABCD ≅ PQRS${over ? ", dan bangun menutupi ABCD dengan tepat." : "."}` : "Ada sisi dan sudut yang berbeda, jadi tidak kongruen. Saat ditumpuk, bangun tidak menutupi dengan tepat."}</Result>
  </div>;
}

const CRITS = ["Sisi-Sudut-Sisi", "Sudut-Sisi-Sudut", "Sisi-Sisi-Sisi", "Sisi-Sisi-Sudut"] as const;
const DEFAULTS: Record<(typeof CRITS)[number], number[]> = { "Sisi-Sudut-Sisi": [5, 60, 8], "Sudut-Sisi-Sudut": [50, 6, 70], "Sisi-Sisi-Sisi": [5, 7, 8], "Sisi-Sisi-Sudut": [8, 6, 40] };
const LABELS: Record<(typeof CRITS)[number], [string, number, number, number][]> = {
  "Sisi-Sudut-Sisi": [["AB", 2, 10, 1], ["∠A", 20, 150, 10], ["AC", 2, 10, 1]], "Sudut-Sisi-Sudut": [["∠A", 20, 100, 10], ["AB", 2, 10, 1], ["∠B", 20, 100, 10]],
  "Sisi-Sisi-Sisi": [["AB", 2, 10, 1], ["BC", 2, 10, 1], ["CA", 2, 10, 1]], "Sisi-Sisi-Sudut": [["AB", 2, 10, 1], ["BC", 2, 10, 1], ["∠A", 20, 80, 10]],
};
function SegitigaLab() {
  const [c, setC] = useState<(typeof CRITS)[number]>("Sisi-Sudut-Sisi"); const [v, setV] = useState(DEFAULTS["Sisi-Sudut-Sisi"]);
  let tris: Record<string, Pt>[] = [], info = "";
  if (c === "Sisi-Sudut-Sisi") { const [ab, A, ac] = v, bc = cosRuleSide(ab, ac, A); tris = [triSAS("ABC", ab, A, ac)]; info = `BC² = ${ab}² + ${ac}² − 2(${ab})(${ac}) cos ${A}° , BC ≈ ${idn(r2(bc))}`; }
  else if (c === "Sudut-Sisi-Sudut") { const [A, ab, B] = v, C2 = 180 - A - B; if (C2 > 0) { const ac = (ab * Math.sin((B * Math.PI) / 180)) / Math.sin((C2 * Math.PI) / 180); tris = [triSAS("ABC", ab, A, ac)]; info = `∠C = 180° − ${A}° − ${B}° = ${C2}°. Aturan sinus: AC = {${ab} sin ${B}°/sin ${C2}°} ≈ ${idn(r2(ac))}`; } else info = "Jumlah dua sudut sudah 180° atau lebih, tidak ada segitiga."; }
  else if (c === "Sisi-Sisi-Sisi") { const [ab, bc, ca] = v; if (ab + bc > ca && bc + ca > ab && ca + ab > bc) { tris = [triSSS("ABC", ab, bc, ca)]; info = `cos A = {(${ab}² + ${ca}² − ${bc}²)/(2 × ${ab} × ${ca})}, ∠A ≈ ${idn(r1(cosRuleAngle(bc, ab, ca)))}°`; } else info = "Jumlah dua sisi harus lebih dari sisi ketiga."; }
  else { const [ab, bc, A] = v, h = ab * Math.sin((A * Math.PI) / 180), sols: number[] = [];
    if (bc >= h - 1e-9) { const base = ab * Math.cos((A * Math.PI) / 180), d = Math.sqrt(Math.max(0, bc * bc - h * h)); [base - d, base + d].forEach(x => { if (x > 1e-9 && !sols.some(s => Math.abs(s - x) < 1e-6)) sols.push(x); }); }
    tris = sols.map(ac => triSAS("ABC", ab, A, ac)); info = `Tinggi dari B ke garis AC = ${ab} sin ${A}° ≈ ${idn(r2(h))}. ${sols.length === 2 ? "BC di antara tinggi dan AB, jadi ada dua segitiga berbeda." : sols.length === 1 ? "Hanya satu segitiga." : "BC terlalu pendek, tidak ada segitiga."}`; }
  const fig = tris.length ? { type: "fig" as const, pts: tris.length === 2 ? { A: tris[0].A, B: tris[0].B, C: tris[0].C, "C₂": tris[1].C } : tris[0], polys: ["ABC"], segs: tris.length === 2 ? [["B", "C₂", "dash"] as [string, string, "dash"], ["A", "C₂"] as [string, string]] : [] } : null;
  return <div className="space-y-3">
    <Radios label="Kriteria" options={CRITS} value={c} set={x => { setC(x); setV(DEFAULTS[x]); }} />
    <div className="flex flex-wrap gap-x-4 gap-y-2">{LABELS[c].map(([lab, mn, mx, st], i) => <Stepper key={lab} label={lab} value={v[i]} set={x => setV(v.map((y, j) => (j === i ? x : y)))} min={mn} max={mx} step={st} unit={lab.startsWith("∠") ? "°" : ""} />)}</div>
    <Pair>{fig ? <FigView fig={fig} /> : <p className="text-sm">Tidak ada segitiga.</p>}<p className="text-sm leading-7"><M text={info} /></p></Pair>
    <Result value={`${c}|${tris.length}`}>{tris.length === 1 ? (c === "Sisi-Sisi-Sudut" ? "Kebetulan hanya satu segitiga, tetapi Sisi-Sisi-Sudut tidak selalu begitu." : "Hanya ada satu segitiga yang memenuhi. Segitiga lain dengan ukuran ini pasti kongruen dengannya.") : tris.length === 2 ? "Ada dua segitiga berbeda dengan ukuran yang sama. Sisi-Sisi-Sudut tidak cukup untuk kongruen." : "Tidak ada segitiga."}</Result>
  </div>;
}

const PROOF = [
  { s: "EC ≅ AC", r: "Diketahui", need: [] as number[] }, { s: "ER ≅ AR", r: "Diketahui", need: [] }, { s: "RC ≅ RC", r: "Sisi yang sama", need: [] },
  { s: "ΔRCE ≅ ΔRCA", r: "Konjektur Sisi-Sisi-Sisi", need: [0, 1, 2] }, { s: "∠E ≅ ∠A", r: "Definisi kekongruenan segibanyak", need: [3] },
];
const SHOW_ORDER = [3, 0, 4, 2, 1];
function BuktiLab() {
  const [done, setDone] = useState<number[]>([]); const [msg, setMsg] = useState("");
  const tap = (i: number) => { if (done.includes(i)) return; const miss = PROOF[i].need.filter(k => !done.includes(k)); if (miss.length) { setMsg(`Belum bisa: \"${PROOF[i].s}\" membutuhkan ${miss.map(k => PROOF[k].s).join(", ")} terlebih dahulu.`); return; } setDone([...done, i]); setMsg(""); };
  return <div className="space-y-3">
    <p className="text-sm">Layang-layang ERAC: EC ≅ AC dan ER ≅ AR. Tunjukkan ∠E ≅ ∠A. Ketuk pernyataan sesuai urutan bukti.</p>
    <div className="flex flex-wrap gap-1.5">{SHOW_ORDER.map(i => <button key={i} type="button" aria-label={PROOF[i].s} disabled={done.includes(i)} onClick={() => tap(i)} className="btn btn-sm btn-outline normal-case">{PROOF[i].s}</button>)}
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => { setDone([]); setMsg(""); }}><RotateCcw className="size-4" aria-hidden="true" />Ulang</button></div>
    <Pair>
      <FigView fig={{ type: "fig", pts: { R: [0, 0], E: [4, 2.6], C: [7, 0], A: [4, -2.6] }, polys: ["RECA"], segs: [["R", "C"]], ticks: { EC: 1, AC: 1, ER: 2, AR: 2 } }} />
      <Grid head={["No.", "Pernyataan", "Alasan"]} rows={done.map((i, k) => [String(k + 1), PROOF[i].s, PROOF[i].r])} />
    </Pair>
    {msg && <p role="alert" className="rounded-lg bg-warning/15 p-2 text-sm">{msg}</p>}
    <Result value={`${done.length}|${PROOF.length}`}>{done.length === PROOF.length ? "Bukti lengkap: setiap pernyataan punya alasan dan disusun dari yang diketahui menuju kesimpulan." : `${done.length} dari ${PROOF.length} pernyataan sudah tersusun.`}</Result>
  </div>;
}

const TRI: Pt[] = [[1, 1], [4, 1], [1, 5]];
const TRANS = ["Pergeseran", "Rotasi 90°", "Pencerminan sumbu y", "Dilatasi"] as const;
function GeserLab() {
  const [t, setT] = useState<(typeof TRANS)[number]>("Pergeseran"); const [dx, setDx] = useState(3); const [dy, setDy] = useState(-2); const [k, setK] = useState(2);
  const img: Pt[] = TRI.map(([x, y]) => (t === "Pergeseran" ? [x + dx, y + dy] : t === "Rotasi 90°" ? [-y, x] : t === "Pencerminan sumbu y" ? [-x, y] : [k * x, k * y]));
  const s1 = sidesOf(TRI), s2 = sidesOf(img), ok = s1.every((v, i) => Math.abs(v - s2[i]) < 1e-9);
  return <div className="space-y-3">
    <Radios label="Transformasi" options={TRANS} value={t} set={setT} />
    {t === "Pergeseran" && <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Geser x" value={dx} set={setDx} min={-5} max={5} /><Stepper label="Geser y" value={dy} set={setDy} min={-5} max={4} /></div>}
    {t === "Dilatasi" && <Stepper label="Faktor skala" value={k} set={setK} min={0.5} max={2} step={0.5} />}
    <Pair>
      <PlaneView plane={{ type: "plane", range: [-6, 9, -6, 10], shapes: [{ pts: TRI, names: ["A", "B", "C"], color: "green" }, { pts: img, names: ["A'", "B'", "C'"], color: "blue" }] }} />
      <Grid head={["Sisi", "Asal", "Bayangan"]} rows={["AB", "BC", "CA"].map((n2, i) => [n2, idn(r2(s1[i])), idn(r2(s2[i]))])} />
    </Pair>
    <Result value={`${t}|${s2.map(v => r2(v)).join(",")}|${ok ? "ya" : "tidak"}`}>{ok ? "Ketiga sisi sama, jadi segitiga dan bayangannya kongruen (Sisi-Sisi-Sisi)." : `Setiap sisi menjadi ${idn(k)} kali, jadi bayangannya tidak kongruen (tetapi sebangun).`}</Result>
  </div>;
}

function Photo({ w, h, x, y, s }: { w: number; h: number; x: number; y: number; s: number }) {
  return <g><rect x={x} y={y} width={w * s} height={h * s} fill="#e7f5ff" stroke="#1f3b30" strokeWidth="2" /><circle cx={x + w * s * 0.75} cy={y + h * s * 0.25} r={Math.min(w, h) * s * 0.1} fill="#ffd43b" />
    <polygon points={`${x},${y + h * s} ${x + w * s * 0.35},${y + h * s * 0.45} ${x + w * s * 0.65},${y + h * s}`} fill="#69db7c" /><polygon points={`${x + w * s * 0.4},${y + h * s} ${x + w * s * 0.7},${y + h * s * 0.55} ${x + w * s},${y + h * s}`} fill="#40c057" /></g>;
}
function FotoLab() {
  const [l, setL] = useState(10); const [p, setP] = useState(15); const r1v = l / 4, r2v = p / 6, ok = Math.abs(r1v - r2v) < 1e-9, s = 150 / 18;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Lebar cetakan" value={l} set={setL} min={2} max={12} unit=" cm" /><Stepper label="Panjang cetakan" value={p} set={setP} min={3} max={18} unit=" cm" /></div>
    <Pair>
      <svg viewBox="0 0 300 170" className="h-auto w-full max-w-sm" role="img" aria-label={`Foto asli 4 × 6 cm dan cetakan ${l} × ${p} cm`}>
        <Photo w={4} h={6} x={10} y={170 - 6 * s - 5} s={s} /><Photo w={l} h={p} x={60} y={170 - p * s - 5} s={s} />
        <text x={10} y={14} fontSize="11" fontWeight="700" fill="#1f3b30">4 × 6</text><text x={60 + l * s / 2} y={Math.max(14, 170 - p * s - 10)} fontSize="11" fontWeight="700" textAnchor="middle" fill="#1f3b30">{l} × {p}</text>
      </svg>
      <ul className="space-y-1 text-sm leading-7"><li><M text={`Rasio lebar {${l}/4} = ${idn(r2(r1v))}`} /></li><li><M text={`Rasio panjang {${p}/6} = ${idn(r2(r2v))}`} /></li><li>Semua sudut tetap 90°.</li></ul>
    </Pair>
    <Result value={`${l}|${p}|${ok ? "ya" : "tidak"}`}>{ok ? `Kedua rasio sama (${idn(r2(r1v))}), jadi cetakan sebangun dengan foto asli.` : "Rasio lebar dan rasio panjang berbeda, jadi gambar akan melar atau terpotong."}</Result>
  </div>;
}

function BayanganLab() {
  const [t, setT] = useState(160); const [s, setS] = useState(200); const [S, setS2] = useState(1000); const H = (t * S) / s;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-x-4 gap-y-2"><Stepper label="Tinggi tongkat" value={t} set={setT} min={50} max={250} step={10} unit=" cm" /><Stepper label="Bayangan tongkat" value={s} set={setS} min={50} max={400} step={10} unit=" cm" /><Stepper label="Bayangan pohon" value={S} set={setS2} min={300} max={2000} step={50} unit=" cm" /></div>
    <Shadow stick={t} stickShadow={s} objShadow={S} height={r1(H)} object="pohon" unit="cm" caption="Sinar matahari sejajar membuat dua segitiga sebangun" />
    <p className="text-center text-sm"><M text={`{tinggi pohon/${t}} = {${S}/${s}}, jadi tinggi pohon = {${t} × ${S}/${s}} = ${idn(r1(H))} cm`} /></p>
    <Result value={`${t}|${s}|${S}|${r1(H)}`}>{`Tinggi pohon kira-kira ${idn(r1(H / 100))} m.`}</Result>
  </div>;
}

const DT: Pt[] = [[1, 1], [3, 1], [1, 2]];
function DilatasiLab() {
  const [k, setK] = useState(2); const img: Pt[] = DT.map(([x, y]) => [k * x, k * y]);
  const per = (p: Pt[]) => sidesOf(p).reduce((a, b) => a + b, 0);
  return <div className="space-y-3">
    <Stepper label="Faktor skala k" value={k} set={x => setK(x === 0 ? (k > 0 ? -0.5 : 0.5) : x)} min={-2} max={3} step={0.5} />
    <Pair>
      <PlaneView plane={{ type: "plane", range: [-6, 9, -5, 7], shapes: [{ pts: DT, names: ["A", "B", "C"], color: "green" }, { pts: img, names: ["A'", "B'", "C'"], color: "blue" }] }} />
      <ul className="space-y-1 text-sm leading-7"><li>{`A'(${img[0].map(idn).join(", ")}), B'(${img[1].map(idn).join(", ")}), C'(${img[2].map(idn).join(", ")})`}</li>
        <li><M text={`Rasio keliling = {${idn(r2(per(img)))}/${idn(r2(per(DT)))}} = ${idn(Math.abs(k))}`} /></li><li><M text={`Rasio luas = k^{2} = ${idn(k * k)}`} /></li></ul>
    </Pair>
    <Result value={`${k}|${Math.abs(k)}|${k * k}`}>{`Bayangan sebangun dengan faktor skala ${idn(k)}${k < 0 ? " (terbalik di seberang O)" : ""}. ${Math.abs(k) === 1 ? "Karena |k| = 1, bayangan juga kongruen." : ""}`}</Result>
  </div>;
}

const UT = { A: [0, 0] as Pt, B: [6, 0] as Pt, C: [2, 4] as Pt };
const ELEMS = ["Garis tinggi", "Garis berat", "Garis bagi"] as const;
function footOf(p: Pt, a: Pt, b: Pt): Pt { const d = [b[0] - a[0], b[1] - a[1]], t = ((p[0] - a[0]) * d[0] + (p[1] - a[1]) * d[1]) / (d[0] ** 2 + d[1] ** 2); return [a[0] + t * d[0], a[1] + t * d[1]]; }
function elemFoot(e: (typeof ELEMS)[number], A: Pt, B: Pt, C: Pt): Pt {
  if (e === "Garis tinggi") return footOf(C, A, B);
  if (e === "Garis berat") return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const ca = dist(C, A), cb = dist(C, B), t = ca / (ca + cb); return [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])];
}
function UnsurLab() {
  const [k, setK] = useState(1.5); const [e, setE] = useState<(typeof ELEMS)[number]>("Garis tinggi");
  const D: Pt = [9, 0], E: Pt = [9 + 6 * k, 0], F: Pt = [9 + 2 * k, 4 * k];
  const K = elemFoot(e, UT.A, UT.B, UT.C), P2 = elemFoot(e, D, E, F), l1 = dist(UT.C, K), l2 = dist(F, P2);
  return <div className="space-y-3">
    <Stepper label="Faktor skala" value={k} set={setK} min={1} max={2.5} step={0.5} />
    <Radios label="Garis" options={ELEMS} value={e} set={setE} />
    <FigView fig={{ type: "fig", pts: { ...UT, K, D, E, F, P: P2 }, polys: ["ABC", "DEF"], segs: [["C", "K"], ["F", "P"]], right: e === "Garis tinggi" ? ["AKC", "DPF"] : [] }} />
    <ul className="space-y-1 text-sm leading-7"><li>{e} CK ≈ {idn(r2(l1))} dan FP ≈ {idn(r2(l2))}</li><li><M text={`{FP/CK} ≈ ${idn(r2(l2 / l1))}, sama dengan {DE/AB} = ${idn(k)}`} /></li><li><M text={`Rasio luas = ${idn(k)}^{2} = ${idn(k * k)}`} /></li></ul>
    <Result value={`${k}|${e}|${r2(l2 / l1)}`}>{`${e} yang bersesuaian memiliki rasio ${idn(k)}, sama dengan rasio sisi.`}</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { pasang: PasangLab, tumpuk: TumpukLab, segitiga: SegitigaLab, bukti: BuktiLab, geser: GeserLab, foto: FotoLab, bayangan: BayanganLab, dilatasi: DilatasiLab, unsur: UnsurLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-20" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,.\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function MatchView({ p, x, put, checked }: { p: Extract<Part, { kind: "match" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null), H = 48;
  return <div className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
    <p className="text-xs text-base-content/60">Ketuk sisi di kiri, lalu pasangannya di kanan. Garis akan menghubungkan keduanya.</p>
    <div className="grid grid-cols-[auto_5rem_auto] items-start gap-x-1">
      <div className="flex flex-col gap-2">{p.left.map((l, i) => <button key={l} type="button" aria-label={`Kiri ${l}`} aria-pressed={sel === i} disabled={checked} onClick={() => setSel(i)} className={`btn h-10 min-h-10 normal-case ${sel === i ? "btn-success" : "btn-outline"}`}>{l}</button>)}</div>
      <svg viewBox={`0 0 80 ${p.left.length * H - 8}`} className="h-full w-20" aria-hidden="true" preserveAspectRatio="none">
        {x.map((v, i) => { const j = p.right.indexOf(v); return j < 0 ? null : <line key={i} x1="2" y1={i * H + 20} x2="78" y2={j * H + 20} stroke="#f59f00" strokeWidth="2.5" />; })}
      </svg>
      <div className="flex flex-col gap-2">{p.right.map(r => <button key={r} type="button" aria-label={`Kanan ${r}`} disabled={checked || sel === null} onClick={() => { if (sel !== null) { put(sel, r); setSel(null); } }} className={`btn h-10 min-h-10 normal-case ${x.includes(r) ? "btn-outline btn-info" : "btn-outline"}`}>{r}</button>)}</div>
    </div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "frac": return <div role="group" aria-label={plainMath(p.label)} className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <In label={`${plainMath(p.label)} kiri`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-xl font-bold">:</span><In label={`${plainMath(p.label)} kanan`} value={x[1]} set={v => put(1, v)} disabled={checked} />
      <span className="basis-full text-xs text-base-content/60">Rasio yang senilai juga diterima, misalnya 2 : 4 untuk 1 : 2.</span></div>;
    case "row": return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.cells.map((c, k) => <label key={c} className="flex flex-col items-center gap-1 rounded-lg bg-base-100 p-1.5 text-xs font-semibold ring-1 ring-base-300"><M text={c} /><In label={`${plainMath(p.label)} ${plainMath(c)}`} value={x[k]} set={v => put(k, v)} disabled={checked} w="w-24" /></label>)}</div></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "match": return <MatchView p={p} x={x} put={put} checked={checked} />;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 lg:flex-row lg:items-center lg:justify-between">
      <span className="text-sm font-bold"><M text={r.text} /></span><span className="flex shrink-0 flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTwelveCongruence() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 12, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Kekongruenan dan Kesebangunan</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Memasangkan sisi dan sudut, membuktikan dua segitiga kongruen dengan aturan sinus dan kosinus, menyusun bukti deduktif, serta memakai kesebangunan untuk menghitung panjang, keliling, dan luas.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-56"><FigView fig={{ type: "fig", pts: { ...triSSS("ABC", 4, 3, 3.6), ...move(triSSS("DEF", 6, 4.5, 5.4), 5, 0, { rename: {} }) }, polys: ["ABC", "DEF"] }} /></div>
        <p className="mt-1 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Sama persis, atau hanya sama bentuknya?</h2>
        <p className="mt-2 text-sm">Rangka atap kembar harus sama persis, sedangkan foto yang diperbesar cukup sama bentuknya. Bab ini membahas cara memeriksa keduanya, dan cara mengukur tinggi pohon hanya dari bayangannya.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-kongruen-12">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-kongruen-12" className="mt-8 scroll-mt-20">
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
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Studi kasus sehari-hari</p><p><M text={s.life} /></p></div>
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
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
