"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eraser, FlipHorizontal2, Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { M, Plane, plainMath, SceneView } from "./GradeNineTransformArt";
import {
  assessment, cells, correct, dilate, formatAnswer, idn, pickPoints, practice, ptText, ready, reflect, rotate, sections, SEP, splitParts, topics, translate,
  type Part, type Pt, type TQuestion,
} from "@/data/grade-nine-transform";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, skip }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; skip?: number }) {
  const go = (d: number) => { let v = Math.round((value + d) * 100) / 100; if (skip !== undefined && v === skip) v = Math.round((v + d) * 100) / 100; if (v >= min - 1e-9 && v <= max + 1e-9) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,16rem)_1fr]">{children}</div>;
const Steps = ({ lines }: { lines: string[] }) => <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">{lines.map(l => <li key={l}><M text={l} /></li>)}</ol>;
const key = ([x, y]: Pt) => `${Math.round(x * 1e4) / 1e4},${Math.round(y * 1e4) / 1e4}`;
const ABC = "ABC";
const named = (p: Pt[], prime = "") => p.map((q, k) => `${ABC[k]}${prime}${ptText(q)}`).join(", ");
function PointSteppers({ p, set, label = "P", min = -5, max = 5 }: { p: Pt; set: (p: Pt) => void; label?: string; min?: number; max?: number }) {
  return <div className="flex flex-wrap gap-3"><Stepper label={`x titik ${label}`} value={p[0]} set={v => set([v, p[1]])} min={min} max={max} /><Stepper label={`y titik ${label}`} value={p[1]} set={v => set([p[0], v])} min={min} max={max} /></div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function TranslateLab() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(-2);
  const tri: Pt[] = [[-2, 1], [1, 1], [-1, 3]], img = tri.map(p => translate(p, [a, b]));
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="a (mendatar)" value={a} set={setA} min={-5} max={5} /><Stepper label="b (tegak)" value={b} set={setB} min={-5} max={4} /></div>
    <Pair><Plane polys={[{ pts: tri, names: ABC, tone: "awal" }, { pts: img, tone: "bayangan" }]} arrows={tri.map((p, k) => [p, img[k]] as [Pt, Pt])} r={8} />
      <Steps lines={[`Translasi (${idn(a)}, ${idn(b)}): ${Math.abs(a)} satuan ke ${a >= 0 ? "kanan" : "kiri"}, ${Math.abs(b)} satuan ke ${b >= 0 ? "atas" : "bawah"}`, ...tri.map((p, k) => `${ABC[k]}${ptText(p)} → ${ABC[k]}'(${idn(p[0])} + (${idn(a)}), ${idn(p[1])} + (${idn(b)})) = ${ptText(img[k])}`)]} /></Pair>
    <Result value={`${a}|${b}|${key(img[0])}`}>Semua titik bergeser {Math.abs(a)} ke {a >= 0 ? "kanan" : "kiri"} dan {Math.abs(b)} ke {b >= 0 ? "atas" : "bawah"}. Bentuk dan ukuran segitiga tetap.</Result>
  </div>;
}

const axisModes = ["Sumbu x", "Sumbu y", "Titik O"] as const;
function ReflAxisLab() {
  const [mode, setMode] = useState<(typeof axisModes)[number]>("Sumbu x");
  const [p, setP] = useState<Pt>([3, 2]);
  const m = mode === "Sumbu x" ? "sumbu x" : mode === "Sumbu y" ? "sumbu y" : "titik O", q = reflect(p, m), tri: Pt[] = [p, [p[0] + 2 > 5 ? p[0] - 2 : p[0] + 2, p[1]], [p[0], p[1] + 1 > 5 ? p[1] - 1 : p[1] + 1]];
  return <div className="space-y-3">
    <Radios label="Cermin" options={axisModes} value={mode} set={setMode} /><PointSteppers p={p} set={setP} />
    <Pair><Plane polys={[{ pts: tri, tone: "awal" }, { pts: tri.map(x => reflect(x, m)), tone: "bayangan" }]} points={[{ p, label: "P" }, { p: q, label: "P'", color: "#1c64b5" }]} lines={mode === "Titik O" ? [] : [{ l: mode === "Sumbu x" ? { y: 0 } : { x: 0 }, label: mode.toLowerCase() }]} r={6}>
      {(X, Y) => <line x1={X(p[0])} y1={Y(p[1])} x2={X(q[0])} y2={Y(q[1])} stroke="#868e96" strokeDasharray="4 3" />}</Plane>
      <Steps lines={[mode === "Sumbu x" ? "(x, y) → (x, −y)" : mode === "Sumbu y" ? "(x, y) → (−x, y)" : "(x, y) → (−x, −y)", `P${ptText(p)} → P'${ptText(q)}`, mode === "Titik O" ? "O adalah titik tengah PP'." : "PP' tegak lurus cermin, dan jarak P serta P' ke cermin sama."]} /></Pair>
    <Result value={`${mode}|${key(q)}`}>Bayangan P adalah {`P'${ptText(q)}`}. Segitiga bayangannya {mode === "Titik O" ? "terbalik (sama dengan diputar 180°)" : "menghadap arah berlawanan"}.</Result>
  </div>;
}

const diagModes = ["y = x", "y = −x"] as const;
function ReflDiagLab() {
  const [mode, setMode] = useState<(typeof diagModes)[number]>("y = x");
  const [p, setP] = useState<Pt>([4, 1]);
  const q = reflect(p, mode), mid: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  return <div className="space-y-3">
    <Radios label="Garis cermin" options={diagModes} value={mode} set={setMode} /><PointSteppers p={p} set={setP} />
    <Pair><Plane points={[{ p, label: "P" }, { p: q, label: "P'", color: "#1c64b5" }, { p: mid, color: "#7048e8" }]} lines={[{ l: { m: mode === "y = x" ? 1 : -1, c: 0 }, label: mode }]} r={6}>
      {(X, Y) => <line x1={X(p[0])} y1={Y(p[1])} x2={X(q[0])} y2={Y(q[1])} stroke="#868e96" strokeDasharray="4 3" />}</Plane>
      <Steps lines={[mode === "y = x" ? "(x, y) → (y, x): tukar koordinat" : "(x, y) → (−y, −x): tukar lalu ganti tanda", `P${ptText(p)} → P'${ptText(q)}`, `Titik tengah PP' = ${ptText(mid)}, terletak pada garis ${mode}.`]} /></Pair>
    <Result value={`${mode}|${key(q)}`}>Bayangan P terhadap garis {mode} adalah {`P'${ptText(q)}`}.</Result>
  </div>;
}

const lineModes = ["x = k", "y = h"] as const;
function ReflLineLab() {
  const [mode, setMode] = useState<(typeof lineModes)[number]>("x = k");
  const [k, setK] = useState(3);
  const [p, setP] = useState<Pt>([-1, 2]);
  const m = mode === "x = k" ? { x: k } : { y: k }, q = reflect(p, m);
  return <div className="space-y-3">
    <Radios label="Jenis garis" options={lineModes} value={mode} set={setMode} />
    <div className="flex flex-wrap gap-3"><Stepper label={mode === "x = k" ? "k" : "h"} value={k} set={setK} min={-3} max={3} /></div><PointSteppers p={p} set={setP} />
    <Pair><Plane points={[{ p, label: "P" }, { p: q, label: "P'", color: "#1c64b5" }]} lines={[{ l: m, label: mode === "x = k" ? `x = ${k}` : `y = ${k}` }]} r={9}>
      {(X, Y) => <line x1={X(p[0])} y1={Y(p[1])} x2={X(q[0])} y2={Y(q[1])} stroke="#868e96" strokeDasharray="4 3" />}</Plane>
      <Steps lines={[mode === "x = k" ? `(x, y) → (2k − x, y) = (2(${k}) − (${idn(p[0])}), ${idn(p[1])})` : `(x, y) → (x, 2h − y) = (${idn(p[0])}, 2(${k}) − (${idn(p[1])}))`, `P' = ${ptText(q)}`, `Jarak P ke garis = jarak P' ke garis = ${Math.abs(mode === "x = k" ? p[0] - k : p[1] - k)}`]} /></Pair>
    <Result value={`${mode}|${k}|${key(q)}`}>Bayangan P terhadap garis {mode === "x = k" ? `x = ${k}` : `y = ${k}`} adalah {`P'${ptText(q)}`}.</Result>
  </div>;
}

const angles = ["90°", "180°", "270°", "−90°"] as const;
function RotateLab() {
  const [ang, setAng] = useState<(typeof angles)[number]>("90°");
  const [p, setP] = useState<Pt>([4, 2]);
  const d = Number(ang.replace("°", "").replace("−", "-")), tri: Pt[] = [p, [Math.max(1, p[0] - 2), p[1]], [p[0], Math.min(5, p[1] + 2)]], img = tri.map(x => rotate(x, d)), q = img[0];
  const rule = d === 90 ? "(x, y) → (−y, x)" : d === 180 ? "(x, y) → (−x, −y)" : "(x, y) → (y, −x)";
  return <div className="space-y-3">
    <Radios label="Sudut rotasi" options={angles} value={ang} set={setAng} /><PointSteppers p={p} set={setP} min={1} max={5} />
    <Pair><Plane polys={[{ pts: tri, tone: "awal" }, { pts: img, tone: "bayangan" }]} points={[{ p, label: "P" }, { p: q, label: "P'", color: "#1c64b5" }]} r={6}>
      {(X, Y) => <g><line x1={X(0)} y1={Y(0)} x2={X(p[0])} y2={Y(p[1])} stroke="#868e96" strokeDasharray="4 3" /><line x1={X(0)} y1={Y(0)} x2={X(q[0])} y2={Y(q[1])} stroke="#868e96" strokeDasharray="4 3" /></g>}</Plane>
      <Steps lines={[`${ang}${d > 0 ? " berlawanan arah jarum jam" : " (searah jarum jam)"}: ${rule}`, `P${ptText(p)} → P'${ptText(q)}`, `Jarak ke O tetap: √{${p[0] ** 2 + p[1] ** 2}}`]} /></Pair>
    <Result value={`${ang}|${key(q)}`}>Bayangan P setelah rotasi {ang} terhadap O adalah {`P'${ptText(q)}`}.{d === 270 ? " Hasilnya sama dengan rotasi −90°." : ""}</Result>
  </div>;
}

const shapeL: Pt[] = [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]];
const target = shapeL.map(p => translate(rotate(p, 90), [1, -3]));
const sameSet = (a: Pt[], b: Pt[]) => a.map(key).sort().join(";") === b.map(key).sort().join(";");
function RigidLab() {
  const [cur, setCur] = useState<Pt[]>(shapeL);
  const [moves, setMoves] = useState<string[]>([]);
  const act = (name: string, f: (p: Pt) => Pt) => { setCur(c => c.map(f)); setMoves(m => [...m, name]); };
  const done = sameSet(cur, target);
  const btn = (label: string, icon: ReactNode, name: string, f: (p: Pt) => Pt) => <button type="button" aria-label={label} title={label} className="btn btn-sm btn-outline gap-1" onClick={() => act(name, f)}>{icon}<span className="hidden sm:inline">{label}</span></button>;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">
      {btn("Geser kiri", <ArrowLeft className="size-4" aria-hidden="true" />, "geser kiri", p => translate(p, [-1, 0]))}{btn("Geser kanan", <ArrowRight className="size-4" aria-hidden="true" />, "geser kanan", p => translate(p, [1, 0]))}
      {btn("Geser atas", <ArrowUp className="size-4" aria-hidden="true" />, "geser atas", p => translate(p, [0, 1]))}{btn("Geser bawah", <ArrowDown className="size-4" aria-hidden="true" />, "geser bawah", p => translate(p, [0, -1]))}
      {btn("Putar 90°", <RotateCcw className="size-4" aria-hidden="true" />, "rotasi 90°", p => rotate(p, 90))}{btn("Cerminkan terhadap sumbu y", <FlipHorizontal2 className="size-4" aria-hidden="true" />, "refleksi sumbu y", p => reflect(p, "sumbu y"))}
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => { setCur(shapeL); setMoves([]); }}><RotateCw className="size-4" aria-hidden="true" />Ulang</button>
    </div>
    <Pair><Plane polys={[{ pts: target, tone: "bayangan" }, { pts: cur, tone: "awal" }]} r={6} label="Bangun merah dan bangun tujuan biru pada bidang koordinat" />
      <div className="space-y-2 text-sm"><p>Bawa bangun merah tepat menutupi bangun biru. Putaran dan cermin berpusat di O.</p>
        <p>Langkah: <strong>{moves.length ? moves.join(", ") : "belum ada"}</strong></p></div></Pair>
    <Result value={`${moves.length}|${done ? "berimpit" : "belum"}`}>{done ? `Berimpit setelah ${moves.length} langkah transformasi kaku: kedua bangun kongruen.` : "Belum berimpit. Bentuk dan ukuran bangun merah tidak pernah berubah."}</Result>
  </div>;
}

const quads = { II: { name: "Persegi panjang 9 × 18", sides: [9, 18, 9, 18], angles: [90, 90, 90, 90], pts: [[0, 0], [18, 0], [18, 9], [0, 9]] }, III: { name: "Jajar genjang bersisi 6 dan 12", sides: [6, 12, 6, 12], angles: [60, 120, 60, 120], pts: [[0, 0], [12, 0], [15, 5.2], [3, 5.2]] }, IV: { name: "Persegi panjang 12 × 6", sides: [12, 6, 12, 6], angles: [90, 90, 90, 90], pts: [[0, 0], [6, 0], [6, 12], [0, 12]] } } as const;
type QK = keyof typeof quads;
function PolygonLab() {
  const [k, setK] = useState<QK>("III");
  const Q = quads[k], I = { sides: [6, 12, 6, 12], angles: [90, 90, 90, 90] };
  const best = [0, 1, 2, 3].find(s => I.sides.every((v, j) => v === Q.sides[(j + s) % 4])), sidesOk = best !== undefined, anglesOk = I.angles.every((v, j) => v === Q.angles[(j + (best ?? 0)) % 4]);
  const draw = (ps: readonly (readonly number[])[], color: string) => { const s = 8, my = Math.max(...ps.map(p => p[1])); return <polygon points={ps.map(p => `${8 + p[0] * s},${8 + (my - p[1]) * s}`).join(" ")} fill={color} fillOpacity="0.6" stroke="#1f3b30" strokeWidth="1.4" />; };
  return <div className="space-y-3">
    <Radios label="Bandingkan dengan" options={["II", "III", "IV"] as const} value={k} set={setK} />
    <Pair><div className="flex items-end gap-3"><svg viewBox="0 0 120 70" className="w-24" role="img" aria-label="Persegi panjang I berukuran 6 × 12">{draw([[0, 0], [12, 0], [12, 6], [0, 6]], "#f8c7c7")}</svg>
      <svg viewBox="0 0 170 170" className="w-28" role="img" aria-label={`Segi empat ${k}: ${Q.name}`}>{draw(Q.pts, "#c5dcf7")}</svg></div>
      <table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-success text-success-content"><th className="py-1">Ukuran</th><th>I</th><th>{k}</th></tr></thead>
        <tbody><tr className="border-b border-base-300"><td className="py-1">Sisi</td><td>6, 12, 6, 12</td><td>{Q.sides.join(", ")}</td></tr><tr><td className="py-1">Sudut</td><td>90° semua</td><td>{Q.angles.map(a => `${a}°`).join(", ")}</td></tr></tbody></table></Pair>
    <Result value={`${k}|${sidesOk ? "sisi sama" : "sisi beda"}|${anglesOk ? "sudut sama" : "sudut beda"}|${sidesOk && anglesOk ? "kongruen" : "tidak"}`}>{Q.name}: sisi {sidesOk ? "bersesuaian sama panjang" : "berbeda"}, sudut {anglesOk ? "sama besar" : "berbeda"}. {sidesOk && anglesOk ? "Kongruen dengan I." : "Tidak kongruen dengan I."}</Result>
  </div>;
}

const crits = ["S.S.S", "S.Sd.S", "Sd.S.Sd", "S.S.Sd"] as const;
function TriangleLab() {
  const [c, setC] = useState<(typeof crits)[number]>("S.S.S");
  const rad = (d: number) => (d * Math.PI) / 180;
  const fromSAS = (a: number, b: number, g: number): Pt[] => [[0, 0], [a, 0], [b * Math.cos(rad(g)), b * Math.sin(rad(g))]];
  let tris: Pt[][] = [], info = "";
  if (c === "S.S.S") { const a = 7, b = 5, cc = 6, g = (Math.acos((a * a + b * b - cc * cc) / (2 * a * b)) * 180) / Math.PI; tris = [fromSAS(a, b, g), fromSAS(a, b, g)]; info = "Sisi 7, 5, 6 hanya membentuk satu segitiga."; }
  else if (c === "S.Sd.S") { tris = [fromSAS(7, 5, 50), fromSAS(7, 5, 50)]; info = "Sisi 7 dan 5 mengapit sudut 50°: satu segitiga."; }
  else if (c === "Sd.S.Sd") { const A = 50, B = 60, s = 7, b = (s * Math.sin(rad(B))) / Math.sin(rad(180 - A - B)); tris = [fromSAS(s, b, A), fromSAS(s, b, A)]; info = "Sudut 50° dan 60° mengapit sisi 7: satu segitiga."; }
  else { const A = 30, ab = 10, bc = 6, h = ab * Math.sin(rad(A)), x0 = ab * Math.cos(rad(A)), d = Math.sqrt(bc * bc - h * h); tris = [[[0, 0], [x0 - d, 0], [x0, h]], [[0, 0], [x0 + d, 0], [x0, h]]]; info = "Sisi 10 dan 6 dengan sudut 30° yang tidak diapit: ada dua segitiga berbeda."; }
  const draw = (t: Pt[], color: string) => { const s = 11; return <polygon points={t.map(([x, y]) => `${10 + x * s},${100 - y * s}`).join(" ")} fill={color} fillOpacity="0.55" stroke="#1f3b30" strokeWidth="1.4" />; };
  const same = sameSet(tris[0], tris[1]);
  return <div className="space-y-3">
    <Radios label="Kriteria" options={crits} value={c} set={setC} />
    <Pair><div className="flex gap-2">{tris.map((t, i) => <svg key={i} viewBox="0 0 170 110" className="w-1/2" role="img" aria-label={`Segitiga ${i + 1} dengan titik ${t.map(p => `(${idn(Math.round(p[0] * 10) / 10)}, ${idn(Math.round(p[1] * 10) / 10)})`).join(" ")}`}>{draw(t, i ? "#c5dcf7" : "#f8c7c7")}</svg>)}</div>
      <p className="text-sm">{info}</p></Pair>
    <Result value={`${c}|${same ? "kongruen" : "belum pasti"}`}>{same ? `${c} menjamin kedua segitiga kongruen.` : "S.S.Sd tidak menjamin kongruen: dua segitiga di atas memenuhi ukuran yang sama tetapi bentuknya berbeda."}</Result>
  </div>;
}

const centers = ["O(0, 0)", "P(2, 3)"] as const;
function DilateLab() {
  const [cn, setCn] = useState<(typeof centers)[number]>("O(0, 0)");
  const [k, setK] = useState(2);
  const c: Pt = cn === "O(0, 0)" ? [0, 0] : [2, 3], tri: Pt[] = [[1, 1], [3, 1], [2, 3]], img = tri.map(p => dilate(p, k, c));
  return <div className="space-y-3">
    <Radios label="Pusat dilatasi" options={centers} value={cn} set={setCn} /><Stepper label="Faktor skala k" value={k} set={setK} min={-2} max={3} step={0.5} skip={0} />
    <Pair><Plane polys={[{ pts: tri, tone: "awal", names: ABC }, { pts: img, tone: "bayangan" }]} points={[{ p: c, label: cn[0], color: "#7048e8" }]} r={8}>
      {(X, Y) => tri.map((p, i) => <line key={i} x1={X(c[0])} y1={Y(c[1])} x2={X(img[i][0])} y2={Y(img[i][1])} stroke="#adb5bd" strokeDasharray="3 3" />)}</Plane>
      <Steps lines={[cn === "O(0, 0)" ? "(x, y) → (kx, ky)" : "(x, y) → (k(x − 2) + 2, k(y − 3) + 3)", named(img, "'"), `Luas bayangan = ${idn(k * k)} × luas awal`]} /></Pair>
    <Result value={`${cn[0]}|${k}|${key(img[0])}`}>{Math.abs(k) > 1 ? "Diperbesar" : "Diperkecil"}{k < 0 ? " dan terbalik di seberang pusat" : ""}. {`A' = ${ptText(img[0])}`}, sisi dikali {idn(Math.abs(k))}, luas dikali {idn(k * k)}.</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { translate: TranslateLab, reflAxis: ReflAxisLab, reflDiag: ReflDiagLab, reflLine: ReflLineLab, rotate: RotateLab, rigid: RigidLab, polygon: PolygonLab, triangle: TriangleLab, dilate: DilateLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-20" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 10))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function MatchPart({ p, x, set, checked }: { p: Extract<Part, { kind: "match" }>; x: string[]; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const n = p.left.length, colors = ["#1c64b5", "#c2410c", "#2b8a3e", "#7048e8", "#d6336c", "#0c8599", "#e67700"];
  return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk jenis refleksi di kiri, lalu hasilnya di kanan.</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]" style={{ gridTemplateRows: `repeat(${n}, minmax(2.75rem, auto))` }}>
      {p.left.map((l, k) => <button key={l} type="button" disabled={checked} aria-pressed={sel === k} aria-label={`Kiri ${l}`} onClick={() => setSel(sel === k ? null : k)} style={{ gridColumn: 1, gridRow: k + 1, borderColor: x[k] ? colors[k] : undefined }}
        className={`m-0.5 rounded-lg border-2 bg-base-100 px-2 text-sm font-bold ${sel === k ? "ring-2 ring-success" : x[k] ? "" : "border-base-300"}`}>{l}</button>)}
      <svg viewBox={`0 0 100 ${n * 100}`} preserveAspectRatio="none" aria-hidden="true" style={{ gridColumn: 2, gridRow: `1 / span ${n}` }} className="h-full w-full">
        {p.left.map((_, k) => { const j = p.right.indexOf(x[k]); return j >= 0 && <line key={k} x1="0" y1={k * 100 + 50} x2="100" y2={j * 100 + 50} stroke={colors[k]} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />; })}</svg>
      {p.right.map((r, j) => { const owner = x.indexOf(r);
        return <button key={r} type="button" disabled={checked || sel === null} aria-label={`Kanan ${r}`} onClick={() => { if (sel === null) return; set(x.map((v, k) => (k === sel ? r : v === r ? "" : v)).join("|")); setSel(null); }} style={{ gridColumn: 3, gridRow: j + 1, borderColor: owner >= 0 ? colors[owner] : undefined }}
          className={`m-0.5 rounded-lg border-2 bg-base-100 px-2 text-sm font-bold ${owner >= 0 ? "" : "border-base-300"}`}>{r}</button>; })}
    </div></div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "pts": return <div className="space-y-2">{p.names.map((nm, k) => <div key={nm} className="flex flex-wrap items-center gap-1"><span className="min-w-8 font-bold">{nm}</span><span className="text-2xl">(</span>
      <In label={`${nm} x`} value={x[2 * k]} set={s => put(2 * k, s)} disabled={checked} /><span className="text-2xl">,</span><In label={`${nm} y`} value={x[2 * k + 1]} set={s => put(2 * k + 1, s)} disabled={checked} /><span className="text-2xl">)</span></div>)}</div>;
    case "vec": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <span className="inline-flex items-center"><span className="text-5xl font-light leading-none">(</span><span className="flex flex-col gap-1"><In label={`${plainMath(p.label)} mendatar`} value={x[0]} set={s => put(0, s)} disabled={checked} /><In label={`${plainMath(p.label)} tegak`} value={x[1]} set={s => put(1, s)} disabled={checked} /></span><span className="text-5xl font-light leading-none">)</span></span></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "eq": return <div className="space-y-1"><div className="flex flex-wrap items-center gap-1.5"><span className="font-bold"><M text={p.label} /></span>
      <In label={`${plainMath(p.label)} koefisien x`} value={x[0]} set={s => put(0, s)} disabled={checked} /><span className="text-lg font-extrabold">x +</span>
      <In label={`${plainMath(p.label)} koefisien y`} value={x[1]} set={s => put(1, s)} disabled={checked} /><span className="text-lg font-extrabold">y =</span>
      <In label={`${plainMath(p.label)} konstanta`} value={x[2]} set={s => put(2, s)} disabled={checked} /></div>
      <p className="text-xs text-base-content/60">Koefisien negatif ditulis dengan tanda minus. Bentuk setara juga benar.</p></div>;
    case "match": return <MatchPart p={p} x={x} set={set} checked={checked} />;
    case "plot": { const picked = pickPoints(value);
      const pick = (px: number, py: number) => { if (checked) return; const on = picked.findIndex(q => q[0] === px && q[1] === py); const next = on >= 0 ? picked.filter((_, k) => k !== on) : [...picked, [px, py] as Pt]; set(next.map(q => q.join(",")).join(";")); };
      return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><p className="font-bold"><M text={p.label} /></p><p className="text-xs text-base-content/60">Ketuk setiap titik sudut bayangan. Ketuk lagi untuk membatalkan.</p>
        <Plane polys={[...(p.given ? [p.given] : []), ...(picked.length > 2 ? [{ pts: picked, tone: "bayangan" as const }] : [])]} points={picked.length <= 2 ? picked.map(q => ({ p: q, color: "#1c64b5" })) : []} lines={p.mirror ? [{ l: p.mirror, label: "x" in p.mirror ? `x = ${p.mirror.x}` : "y" in p.mirror ? `y = ${p.mirror.y}` : p.mirror.m === 1 ? "y = x" : "y = −x" }] : []} r={p.r} onPick={pick} picked={picked} size="mx-auto w-full max-w-sm" label={`Bidang koordinat untuk ${plainMath(p.label)}`} />
        <div className="flex flex-wrap items-center gap-2 text-sm">Titik: <strong>{picked.map(ptText).join(", ") || "belum dipilih"}</strong>
          <button type="button" disabled={checked || !picked.length} className="btn btn-xs btn-ghost gap-1" onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus</button></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: TQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeNineTransform() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 9, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Transformasi Geometri</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menggeser, mencerminkan, memutar, dan memperbesar bangun pada bidang koordinat, lalu memakai transformasi kaku untuk memeriksa kekongruenan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-36"><Plane polys={[{ pts: [[1, 1], [3, 1], [1, 3]], tone: "awal" }, { pts: [[-1, 1], [-3, 1], [-1, 3]], tone: "bayangan" }]} lines={[{ l: { x: 0 } }]} r={4} size="w-full" label="" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Digeser, dicerminkan, diputar</h2>
        <p className="mt-2 text-sm">Motif batik kawung dan jendela rumah adat Minangkabau tersusun dari bentuk yang digeser, dicerminkan, dan diputar. Bab ini membahas cara menghitung letak bayangannya di bidang koordinat.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-transformasi">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-transformasi" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<TQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
