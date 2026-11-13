"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { GraphView, M, plainMath, RampView, SceneView } from "./GradeEightLinesArt";
import {
  assessment, cells, correct, drawPoints, formatAnswer, frac, idn, lineText, practice, ready, SEP, splitParts, topics,
  type LQuestion, type Part,
} from "@/data/grade-eight-lines";

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
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
const key = (v: number) => String(r6(v));
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,15rem)_1fr]">{children}</div>;

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function TableLab() {
  const [m, setM] = useState(2);
  const [c, setC] = useState(-1);
  const xs = [-2, -1, 0, 1, 2], ys = xs.map(x => r6(m * x + c));
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="m" value={m} set={setM} min={-3} max={3} step={0.5} /><Stepper label="c" value={c} set={setC} min={-5} max={5} /></div>
    <p className="text-xl font-extrabold"><M text={lineText(m, c)} /></p>
    <Pair>
      <GraphView lines={[{ m, c }]} points={xs.map((x, k) => ({ x, y: ys[k] }))} r={6} />
      <div className="overflow-x-auto"><table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-success text-success-content"><th className="px-2 py-1">x</th><th>y</th><th>(x, y)</th></tr></thead>
        <tbody>{xs.map((x, k) => <tr key={x} className="border-t border-base-300"><td>{idn(x)}</td><td className="font-bold">{idn(ys[k])}</td><td>({idn(x)}, {idn(ys[k])})</td></tr>)}</tbody></table></div>
    </Pair>
    <Result value={`${key(m)}|${key(c)}|${ys.map(key).join(",")}`}>Setiap kali x naik 1, y berubah {idn(m)}. Kelima titik terletak pada satu garis lurus.</Result>
  </div>;
}

function InterceptLab() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(12);
  const xi = a === 0 ? null : r6(c / a), yi = b === 0 ? null : r6(c / b);
  const line = b === 0 ? (a === 0 ? null : { vx: c / a }) : { m: -a / b, c: c / b };
  const pts = [xi !== null ? { x: xi, y: 0, label: "potong x" } : null, yi !== null ? { x: 0, y: yi, label: "potong y" } : null].filter(Boolean) as { x: number; y: number; label: string }[];
  const eq = `${a === 0 ? "" : `${a === 1 ? "" : a === -1 ? "−" : idn(a)}x`}${b === 0 ? "" : `${a === 0 ? (b < 0 ? "−" : "") : b < 0 ? " − " : " + "}${Math.abs(b) === 1 ? "" : idn(Math.abs(b))}y`} = ${idn(c)}`;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="a" value={a} set={setA} min={-5} max={5} /><Stepper label="b" value={b} set={setB} min={-5} max={5} /><Stepper label="c" value={c} set={setC} min={-12} max={12} /></div>
    <p className="text-xl font-extrabold">{a === 0 && b === 0 ? "Pilih a atau b selain 0." : eq}</p>
    <Pair>
      <GraphView lines={line ? [line] : []} points={pts} r={8} />
      <ol className="list-decimal space-y-1 ps-5 text-base">
        <li>Sumbu-x (y = 0): {a === 0 ? "garis mendatar, tidak memotong sumbu-x" : <>{idn(a)}x = {idn(c)}, x = <M text={frac(c / a)} /> → <strong>(<M text={frac(c / a)} />, 0)</strong></>}</li>
        <li>Sumbu-y (x = 0): {b === 0 ? "garis tegak, tidak memotong sumbu-y" : <>{idn(b)}y = {idn(c)}, y = <M text={frac(c / b)} /> → <strong>(0, <M text={frac(c / b)} />)</strong></>}</li>
        <li>Hubungkan kedua titik.</li>
      </ol>
    </Pair>
    <Result value={`${xi === null ? "-" : key(xi)}|${yi === null ? "-" : key(yi)}`}>Dua titik potong sudah cukup untuk menggambar garisnya.</Result>
  </div>;
}

function FamilyLab() {
  const [m, setM] = useState(1);
  const [c, setC] = useState(2);
  const rel = m === 2 && c === 2 ? "berimpit" : m === 2 ? "sejajar" : r6(m * 2) === -1 ? "tegak" : c === 2 ? "sumbu-y" : "potong";
  const words: Record<string, string> = { berimpit: "Kedua garis berimpit: persamaannya sama.", sejajar: "Sejajar: kemiringannya sama (m = 2), titik potong sumbu-y berbeda.", tegak: "Tegak lurus: 2 × m = −1.", "sumbu-y": "Kemiringan berbeda, tetapi keduanya memotong sumbu-y di (0, 2).", potong: "Kedua garis berpotongan di satu titik." };
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="m garismu" value={m} set={setM} min={-4} max={4} step={0.5} /><Stepper label="c garismu" value={c} set={setC} min={-5} max={5} /></div>
    <Pair>
      <GraphView lines={[{ m: 2, c: 2, label: "y = 2x + 2" }, { m, c, label: "garismu" }]} r={6} />
      <div className="space-y-1 text-base"><p>Acuan: <strong>y = 2x + 2</strong></p><p>Garismu: <strong><M text={lineText(m, c)} /></strong></p>
        <p className="text-sm text-base-content/70">m mengatur kecuraman dan arah. c menggeser garis naik atau turun.</p></div>
    </Pair>
    <Result value={`${key(m)}|${key(c)}|${rel}`}>{words[rel]}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const limits = { "Kursi roda (0,15)": 0.15, "Area parkir (0,25)": 0.25, "Trotoar (0,325)": 0.325, "Anak tangga (0,875)": 0.875 } as const;
type Limit = keyof typeof limits;
function RampLab() {
  const [rise, setRise] = useState(90);
  const [run, setRun] = useState(700);
  const [lim, setLim] = useState<Limit>("Kursi roda (0,15)");
  const s = rise / run, ok = s <= limits[lim] + 1e-12, shown = Math.round(s * 1000) / 1000;
  return <div className="space-y-3">
    <Radios label="Batas aman" options={Object.keys(limits) as Limit[]} value={lim} set={setLim} />
    <div className="flex flex-wrap gap-4"><Stepper label="Tinggi (cm)" value={rise} set={setRise} min={10} max={200} step={5} /><Stepper label="Panjang mendatar (cm)" value={run} set={setRun} min={100} max={1200} step={50} /></div>
    <div className="rounded-xl bg-base-100 p-2"><RampView rise={`${rise} cm`} run={`${idn(run)} cm`} /></div>
    <p className="text-lg font-bold">Kemiringan = <M text={`{${rise}/${idn(run)}}`} /> ≈ {idn(shown)}</p>
    <Result value={`${idn(shown)}|${ok ? "aman" : "curam"}`}>{ok ? `Aman: ${idn(shown)} ≤ ${idn(limits[lim])}.` : `Terlalu curam: ${idn(shown)} > ${idn(limits[lim])}.`} Panjang mendatar terpendek yang aman: {idn(Math.ceil(rise / limits[lim]))} cm.</Result>
  </div>;
}

function SlopeLab() {
  const [x1, setX1] = useState(2);
  const [y1, setY1] = useState(1);
  const [x2, setX2] = useState(4);
  const [y2, setY2] = useState(5);
  const dx = x2 - x1, dy = y2 - y1, m = dx === 0 ? null : dy / dx;
  const kind = m === null ? "tak terdefinisi" : m > 0 ? "positif" : m < 0 ? "negatif" : "nol";
  const line = dx === 0 ? { vx: x1 } : { m: m!, c: y1 - m! * x1 };
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Stepper label="x₁" value={x1} set={setX1} min={-5} max={5} /><Stepper label="y₁" value={y1} set={setY1} min={-5} max={5} /><Stepper label="x₂" value={x2} set={setX2} min={-5} max={5} /><Stepper label="y₂" value={y2} set={setY2} min={-5} max={5} /></div>
    <Pair>
      <GraphView lines={dx === 0 && dy === 0 ? [] : [line]} points={[{ x: x1, y: y1, label: "A" }, { x: x2, y: y2, label: "B" }]} r={6} />
      <div className="space-y-1 text-base"><p>Perubahan tegak: {idn(y2)} − {y1 < 0 ? `(${idn(y1)})` : idn(y1)} = {idn(dy)}</p><p>Perubahan mendatar: {idn(x2)} − {x1 < 0 ? `(${idn(x1)})` : idn(x1)} = {idn(dx)}</p>
        <p className="text-lg font-bold">m = {dx === 0 ? <><M text={`{${idn(dy)}/0}`} />, tak terdefinisi</> : <M text={`{${idn(dy)}/${idn(dx)}} = ${frac(m!)}`} />}</p></div>
    </Pair>
    <Result value={`${m === null ? "-" : key(m)}|${kind}`}>Kemiringan {kind}. {kind === "positif" ? "Garis naik ke kanan." : kind === "negatif" ? "Garis turun ke kanan." : kind === "nol" ? "Garis mendatar, sejajar sumbu-x." : "Garis tegak, sejajar sumbu-y."}</Result>
  </div>;
}

function PointSlopeLab() {
  const [m, setM] = useState(3);
  const [x1, setX1] = useState(2);
  const [y1, setY1] = useState(5);
  const c = r6(y1 - m * x1), sg = (v: number, s: string) => (v === 0 ? s : v > 0 ? `${s} − ${idn(v)}` : `${s} + ${idn(-v)}`);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Kemiringan" value={m} set={setM} min={-3} max={3} step={0.5} /><Stepper label="x₁" value={x1} set={setX1} min={-5} max={5} /><Stepper label="y₁" value={y1} set={setY1} min={-5} max={5} /></div>
    <Pair>
      <GraphView lines={[{ m, c }]} points={[{ x: x1, y: y1, label: "A" }, { x: 0, y: c }]} r={8} />
      <ol className="list-decimal space-y-1 ps-5 text-base">
        <li><M text={`${sg(y1, "y")} = ${frac(m)}(${sg(x1, "x")})`} /></li>
        <li><M text={`${sg(y1, "y")} = ${frac(m)}x ${-m * x1 < 0 ? "−" : "+"} ${frac(Math.abs(m * x1))}`} /></li>
        <li className="font-bold"><M text={lineText(m, c)} /></li>
      </ol>
    </Pair>
    <Result value={`${key(m)}|${key(c)}`}>Garis memotong sumbu-y di (0, {idn(c)}). Bentuk umumnya <M text={lineText(m, c)} />.</Result>
  </div>;
}

function TwoLab() {
  const [x1, setX1] = useState(1);
  const [y1, setY1] = useState(-5);
  const [x2, setX2] = useState(-2);
  const [y2, setY2] = useState(4);
  const dx = x2 - x1, m = dx === 0 ? null : (y2 - y1) / dx, c = m === null ? null : r6(y1 - m * x1);
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Stepper label="x₁" value={x1} set={setX1} min={-5} max={5} /><Stepper label="y₁" value={y1} set={setY1} min={-8} max={8} /><Stepper label="x₂" value={x2} set={setX2} min={-5} max={5} /><Stepper label="y₂" value={y2} set={setY2} min={-8} max={8} /></div>
    <Pair>
      <GraphView lines={m === null ? [{ vx: x1 }] : [{ m, c: c! }]} points={[{ x: x1, y: y1, label: "P" }, { x: x2, y: y2, label: "Q" }]} r={8} />
      {m === null ? <p className="text-base">Kedua titik mempunyai x yang sama. Persamaannya <strong>x = {idn(x1)}</strong>.</p> :
        <ol className="list-decimal space-y-1 ps-5 text-base">
          <li><M text={`m = {${idn(y2)} − (${idn(y1)})/${idn(x2)} − (${idn(x1)})} = ${frac(m)}`} /></li>
          <li><M text={`${idn(y2)} = ${frac(m)}(${idn(x2)}) + c, c = ${frac(c!)}`} /></li>
          <li className="font-bold"><M text={lineText(m, c!)} /></li>
        </ol>}
    </Pair>
    <Result value={m === null ? "tegak" : `${key(m)}|${key(c!)}`}>{m === null ? "Garis tegak tidak dapat ditulis dalam bentuk y = mx + c." : <>Persamaan garis: <M text={lineText(m, c!)} />. Periksa: titik P juga memenuhi.</>}</Result>
  </div>;
}

const modes = ["Sejajar", "Tegak lurus"] as const;
function PerpLab() {
  const [m, setM] = useState(2);
  const [mode, setMode] = useState<(typeof modes)[number]>("Sejajar");
  const [x0, setX0] = useState(1);
  const [y0, setY0] = useState(1);
  const m2 = r6(mode === "Sejajar" ? m : -1 / m), c2 = r6(y0 - m2 * x0);
  return <div className="space-y-3">
    <Radios label="Hubungan" options={modes} value={mode} set={setMode} />
    <div className="flex flex-wrap gap-3"><Stepper label="m acuan" value={m} set={setM} min={-3} max={3} step={0.5} skip={0} /><Stepper label="x titik" value={x0} set={setX0} min={-4} max={4} /><Stepper label="y titik" value={y0} set={setY0} min={-4} max={4} /></div>
    <Pair>
      <GraphView lines={[{ m, c: 0, label: "acuan" }, { m: m2, c: c2, label: "baru" }]} points={[{ x: x0, y: y0 }]} r={6} />
      <div className="space-y-1 text-base"><p>Acuan: <M text={lineText(m, 0)} /></p>
        <p>{mode === "Sejajar" ? "m baru = m acuan" : <>m baru = −<M text={`{1/${frac(m)}}`} /></>} = <strong><M text={frac(m2)} /></strong></p>
        {mode === "Tegak lurus" && <p className="text-sm">Periksa: <M text={`${frac(m)} × ${frac(m2)} = −1`} /></p>}
        <p className="font-bold"><M text={lineText(m2, c2)} /></p></div>
    </Pair>
    <Result value={`${key(m2)}|${key(c2)}`}>Garis {mode.toLowerCase()} melalui ({x0}, {y0}): <M text={lineText(m2, c2)} />.</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { table: TableLab, intercept: InterceptLab, family: FamilyLab, ramp: RampLab, slope: SlopeLab, pointslope: PointSlopeLab, two: TwoLab, perp: PerpLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-28" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 14))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const lbl = "label" in p && p.label ? <span className="font-bold"><M text={p.label} /></span> : null, aria = "label" in p ? plainMath(p.label) : "";
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{lbl}{p.pre && <span className="font-semibold">{p.pre}</span>}<In label={aria} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{lbl}
      {p.pics ? <div className="grid grid-cols-2 gap-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-base-100 p-1.5 ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start font-extrabold">{op}.</span><SceneView scene={p.pics![k]} /></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Persamaan ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "table": return <div className="space-y-1">{lbl}<div className="overflow-x-auto"><table className="border-collapse bg-base-100 text-center text-sm"><tbody>
      <tr className="border-b border-base-300"><th className="px-2 py-1 text-left">x</th>{p.xs.map(v => <td key={v} className="px-1 font-bold">{idn(v)}</td>)}</tr>
      <tr><th className="px-2 py-1 text-left">y</th>{p.xs.map((v, k) => <td key={v} className="p-1"><In label={`y untuk x = ${idn(v)}`} value={x[k]} set={s => put(k, s)} disabled={checked} w="w-14" /></td>)}</tr></tbody></table></div></div>;
    case "point": return <div className="flex flex-wrap items-center gap-1.5">{lbl}<span className="text-2xl">(</span><In label={`${aria} x`} value={x[0]} set={s => put(0, s)} disabled={checked} w="w-20" /><span className="text-2xl">,</span><In label={`${aria} y`} value={x[1]} set={s => put(1, s)} disabled={checked} w="w-20" /><span className="text-2xl">)</span></div>;
    case "line": return <div className="space-y-1"><div className="flex flex-wrap items-center gap-1.5">{lbl}<span className="text-lg font-extrabold">{p.y ?? "y"} =</span>
      <In label={`${aria} kemiringan`} value={x[0]} set={s => put(0, s)} disabled={checked} w="w-20" /><span className="text-lg font-extrabold">{p.x ?? "x"} +</span>
      <In label={`${aria} konstanta`} value={x[1]} set={s => put(1, s)} disabled={checked} w="w-24" /></div>
      <p className="text-xs text-base-content/60">Bilangan negatif ditulis dengan tanda minus, pecahan boleh ditulis 1/2.</p></div>;
    case "mc": return <div className="overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm"><thead><tr className="bg-success text-success-content"><th className="px-2 py-1 text-left">Persamaan</th><th>Kemiringan (m)</th><th>Perpotongan sumbu-y (c)</th></tr></thead>
      <tbody>{p.rows.map((r, k) => <tr key={r.eq} className="border-t border-base-300"><td className="px-2 py-1 text-left font-bold"><M text={r.eq} /></td>
        <td className="p-1"><In label={`${plainMath(r.eq)} kemiringan`} value={x[2 * k]} set={s => put(2 * k, s)} disabled={checked} w="w-16" /></td>
        <td className="p-1"><In label={`${plainMath(r.eq)} perpotongan`} value={x[2 * k + 1]} set={s => put(2 * k + 1, s)} disabled={checked} w="w-16" /></td></tr>)}</tbody></table></div>;
    case "draw": { const pts = drawPoints(value);
      const pick = (px: number, py: number) => { if (checked) return; const on = pts.findIndex(p2 => p2[0] === px && p2[1] === py); const next = on >= 0 ? pts.filter((_, k) => k !== on) : [...pts, [px, py] as [number, number]].slice(-2); set(next.map(p2 => p2.join(",")).join(";")); };
      const dx = pts.length === 2 ? pts[1][0] - pts[0][0] : 0, line = pts.length === 2 ? (dx === 0 ? [{ vx: pts[0][0] }] : [{ m: (pts[1][1] - pts[0][1]) / dx, c: pts[0][1] - ((pts[1][1] - pts[0][1]) / dx) * pts[0][0] }]) : [];
      return <div role="group" aria-label={aria} className="space-y-1">{lbl}<p className="text-xs text-base-content/60">Ketuk dua titik potong garis kisi. Garis digambar melalui keduanya; ketuk lagi untuk membatalkan.</p>
        <GraphView lines={line} r={p.r} onPick={pick} picked={pts} size="mx-auto w-full max-w-xs" label={`Bidang koordinat untuk menggambar ${aria}`} />
        <div className="flex flex-wrap items-center gap-2 text-sm">Titik: <strong>{pts.map(p2 => `(${p2[0]}, ${p2[1]})`).join(" dan ") || "belum dipilih"}</strong>
          <button type="button" disabled={checked || !pts.length} className="btn btn-xs btn-ghost gap-1" onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus</button></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: LQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeEightLines() {
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
    <p className="text-sm font-semibold text-success">Kelas 8, Bab 5</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Persamaan Garis Lurus</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menggambar garis dari persamaannya, membaca titik potong sumbu, memahami kemiringan, dan menyusun persamaan garis dari titik dan kemiringan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-36"><GraphView lines={[{ m: 0.5, c: 1 }]} points={[{ x: 0, y: 1 }, { x: 2, y: 2 }]} r={4} size="w-full" label="" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Seberapa curam jalannya?</h2>
        <p className="mt-2 text-sm">Jalur kursi roda, tangga rumah, dan jalan menanjak dirancang dengan kemiringan tertentu agar aman. Bab ini membahas cara menggambar garis lurus dan menghitung kemiringannya.</p>
        <p className="mt-2 text-sm text-base-content/60">{total} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-garis">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-garis" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<LQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 5"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
