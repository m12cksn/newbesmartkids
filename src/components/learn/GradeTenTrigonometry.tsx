"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw, RotateCw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { M, plainMath, RightTri, SceneView, Triangle, TrigPlot, UnitCircle } from "./GradeTenTrigonometryArt";
import {
  assessment, cells, correct, exact, fmt, formatAnswer, idn, piText, plain, practice, quadrant, ready, sections, SEP, splitParts, topics,
  type Part, type PQuestion,
} from "@/data/grade-ten-trigonometry";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, skip, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; skip?: number; unit?: string }) {
  const go = (d: number) => { let v = value + d; if (v === skip) v += d; if (v >= min && v <= max) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-10 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-label={plainMath(o)} aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 normal-case ${value === o ? "btn-success" : "btn-outline"}`}><M text={o} /></button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const R = (d: number) => (d * Math.PI) / 180, r2 = (v: number) => Math.round(v * 100) / 100, r3 = (v: number) => Math.round(v * 1000) / 1000;
const Q = ["sumbu", "I", "II", "III", "IV"];

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function SudutLab() {
  const [deg, setDeg] = useState(60);
  const go = (d: number) => setDeg(v => Math.max(-720, Math.min(720, v + d))), quad = quadrant(deg);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => go(15)}><RotateCcw className="size-4" aria-hidden="true" />Putar +15°</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => go(-15)}><RotateCw className="size-4" aria-hidden="true" />Putar −15°</button>
      <button type="button" className="btn btn-sm btn-outline" onClick={() => go(90)}>+90°</button>
      <button type="button" className="btn btn-sm btn-outline" onClick={() => go(360)}>+1 putaran</button>
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDeg(60)}>Ulang</button>
    </div>
    <Pair>
      <UnitCircle deg={deg} label={`${idn(deg)}°`} />
      <ul className="space-y-1 text-sm leading-7">
        <li>Derajat: <strong>{idn(deg)}°</strong> ({deg >= 0 ? "berlawanan arah jarum jam" : "searah jarum jam"})</li>
        <li><M text={`Radian: ${idn(deg)} × {π/180} = ${piText(deg)} rad`} /></li>
        <li><M text={`Putaran: {${idn(deg)}/360} = ${fmt(deg / 360)} putaran`} /></li>
        <li>Letak: {quad ? `kuadran ${Q[quad]}` : "tepat pada sumbu (pembatas kuadran)"}</li>
      </ul>
    </Pair>
    <Result value={`${deg}|${quad ?? "sumbu"}|${plain(piText(deg))}`}><M text={`${idn(deg)}° = ${piText(deg)} rad${quad ? `, sisi akhirnya di kuadran ${Q[quad]}` : ", sisi akhirnya tepat pada sumbu"}.`} /></Result>
  </div>;
}

function SegitigaLab() {
  const [a, setA] = useState(3); const [b, setB] = useState(4);
  const c2 = a * a + b * b, c = Math.sqrt(c2), cInt = Number.isInteger(c), cT = cInt ? String(c) : `√{${c2}}`;
  const fr = (p: string, q: string) => `{${p}/${q}}`;
  const rows: [string, string, number][] = [["sin A", fr(String(a), cT), a / c], ["cos A", fr(String(b), cT), b / c], ["tan A", fr(String(a), String(b)), a / b], ["csc A", fr(cT, String(a)), c / a], ["sec A", fr(cT, String(b)), c / b], ["cot A", fr(String(b), String(a)), b / a]];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Sisi depan" value={a} set={setA} min={1} max={12} /><Stepper label="Sisi samping" value={b} set={setB} min={1} max={12} /></div>
    <Pair>
      <RightTri names={["A", "B", "C"]} sides={[String(b), String(a), cInt ? String(c) : `√${c2}`]} ratio={a / b} angle="A" caption="Sisi BC di depan sudut A, sisi AB di sampingnya" />
      <div className="space-y-1 text-sm leading-7"><p><M text={`AC = √{${a}^{2} + ${b}^{2}} = ${cInt ? c : `√{${c2}} ≈ ${idn(r3(c))}`}`} /></p>
        <table className="w-full border-collapse text-center"><tbody>{rows.map(([k, v, n]) => <tr key={k} className="border-t border-base-300"><th className="p-1 text-left">{k}</th><td className="p-1"><M text={v} /></td><td className="p-1 text-base-content/60">≈ {idn(r3(n))}</td></tr>)}</tbody></table></div>
    </Pair>
    <Result value={`${a}|${b}|${r3(c)}`}><M text={`sin A = ${fr(String(a), cT)} dan cos A = ${fr(String(b), cT)}. Jika kedua sisi dikalikan bilangan yang sama, segitiganya sebangun dan perbandingannya tetap.`} /></Result>
  </div>;
}

const special = ["0°", "30°", "45°", "60°", "90°"] as const;
function IstimewaLab() {
  const [k, setK] = useState<(typeof special)[number]>("45°");
  const d = Number(k.replace("°", "")), s = exact(Math.sin(R(d))), c = exact(Math.cos(R(d))), t = d === 90 ? "tak terdefinisi" : exact(Math.tan(R(d)));
  const source = d === 45 ? "Setengah persegi bersisi a: sisi a, a, dan diagonal a√2." : d === 30 || d === 60 ? "Setengah segitiga sama sisi bersisi 2a: sisi a, a√3, dan 2a." : "Segitiga yang makin pipih: salah satu sisi tegak menjadi 0.";
  return <div className="space-y-3">
    <Radios label="Sudut istimewa" options={special} value={k} set={setK} />
    <Pair>
      <div className="space-y-1">{d === 45 ? <RightTri names={["A", "B", "C"]} sides={["a", "a", "a√2"]} ratio={1} angle="45°" /> : d === 30 || d === 60 ? <RightTri names={["A", "B", "C"]} sides={d === 30 ? ["a√3", "a", "2a"] : ["a", "a√3", "2a"]} ratio={d === 30 ? 1 / Math.sqrt(3) : Math.sqrt(3)} angle={k} /> : <UnitCircle deg={d} label={k} cls="w-full max-w-[12rem]" />}
        <p className="text-xs text-base-content/70">{source}</p></div>
      <table className="w-full border-collapse text-center text-base"><tbody>{[["sin", s], ["cos", c], ["tan", t]].map(([f, v]) => <tr key={f} className="border-t border-base-300"><th className="p-1.5 text-left">{f} {k}</th><td className="p-1.5 font-semibold"><M text={v} /></td></tr>)}</tbody></table>
    </Pair>
    <Result value={`${d}|${plain(s)}|${plain(c)}|${plain(t)}`}><M text={`sin ${k} = ${s}, cos ${k} = ${c}, tan ${k} = ${t}.`} /></Result>
  </div>;
}

const bases = ["30°", "45°", "60°"] as const, targets = ["α", "180° − α", "180° + α", "360° − α"] as const;
function RelasiLab() {
  const [b, setB] = useState<(typeof bases)[number]>("30°"); const [t, setT] = useState<(typeof targets)[number]>("180° − α");
  const a = Number(b.replace("°", "")), th = t === "α" ? a : t === "180° − α" ? 180 - a : t === "180° + α" ? 180 + a : 360 - a;
  const s = Math.sin(R(th)), c = Math.cos(R(th)), tn = Math.tan(R(th)), sg = (v: number) => (v > 0 ? "+" : "−"), signs = `${sg(s)}${sg(c)}${sg(tn)}`;
  const rel = t === "α" ? "sama dengan nilai sudut α" : t === "180° − α" ? "sin tetap, cos dan tan berganti tanda" : t === "180° + α" ? "tan tetap, sin dan cos berganti tanda" : "cos tetap, sin dan tan berganti tanda";
  return <div className="space-y-3">
    <div className="space-y-1"><p className="text-xs font-semibold">Sudut lancip α</p><Radios label="Sudut lancip α" options={bases} value={b} set={setB} /></div>
    <div className="space-y-1"><p className="text-xs font-semibold">Sudut yang diselidiki</p><Radios label="Sudut yang diselidiki" options={targets} value={t} set={setT} /></div>
    <Pair>
      <UnitCircle deg={th} label={`${th}°`} coords={`(${exact(c)}, ${exact(s)})`} />
      <table className="w-full border-collapse text-center text-sm"><tbody>{[["sin", s], ["cos", c], ["tan", tn]].map(([f, v]) => <tr key={f as string} className="border-t border-base-300">
        <th className="p-1 text-left">{f as string} {th}°</th><td className="p-1 font-semibold"><M text={exact(v as number)} /></td><td className="p-1 text-base-content/60"><M text={`${(v as number) < 0 ? "−" : ""}${f as string} ${a}°`} /></td></tr>)}</tbody></table>
    </Pair>
    <Result value={`${th}|${signs}`}><M text={`${th}° berada di kuadran ${Q[quadrant(th)!]}: ${rel}. Tanda sin, cos, tan: ${signs.split("").join(" ")}.`} /></Result>
  </div>;
}

function IdentitasLab() {
  const [th, setTh] = useState(30);
  const s2 = Math.sin(R(th)) ** 2, c2 = Math.cos(R(th)) ** 2, defined = Math.abs(Math.cos(R(th))) > 1e-9, t2 = defined ? Math.tan(R(th)) ** 2 : NaN, sec2 = defined ? 1 / c2 : NaN;
  return <div className="space-y-3">
    <Stepper label="θ" value={th} set={setTh} min={0} max={360} step={15} unit="°" />
    <Pair>
      <div className="space-y-2" aria-label="Batang sin kuadrat dan cos kuadrat">
        <div className="flex h-8 w-full overflow-hidden rounded border border-base-300"><div style={{ width: `${s2 * 100}%` }} className="bg-[#1c64b5]" /><div style={{ width: `${c2 * 100}%` }} className="bg-[#e8590c]" /></div>
        <p className="text-sm"><span className="font-semibold text-[#1c64b5]">sin² θ = {idn(r3(s2))}</span> + <span className="font-semibold text-[#c2410c]">cos² θ = {idn(r3(c2))}</span> = {idn(r3(s2 + c2))}</p>
      </div>
      <ul className="space-y-1 text-sm leading-7"><li><M text={`tan^{2} θ + 1 = ${defined ? idn(r3(t2 + 1)) : "tak terdefinisi"}`} /></li><li><M text={`sec^{2} θ = ${defined ? idn(r3(sec2)) : "tak terdefinisi"}`} /></li>
        <li className="text-base-content/70">{defined ? "Kedua nilai selalu sama." : "Di θ = 90° atau 270°, cos θ = 0 sehingga tan dan sec tidak terdefinisi."}</li></ul>
    </Pair>
    <Result value={`${th}|${r3(s2 + c2)}|${defined ? r3(t2 + 1 - sec2) : "x"}`}><M text={`Untuk θ = ${th}°: sin^{2} θ + cos^{2} θ = 1${defined ? " dan tan^{2} θ + 1 = sec^{2} θ" : ""}.`} /></Result>
  </div>;
}

function AturanLab() {
  const [a, setA] = useState(5); const [b, setB] = useState(8); const [C, setC] = useState(60);
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(R(C))), L = 0.5 * a * b * Math.sin(R(C));
  const A = (Math.asin((a * Math.sin(R(C))) / c) * 180) / Math.PI, Aa = a * a > b * b + c * c ? 180 - A : A;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Sisi a" value={a} set={setA} min={2} max={12} /><Stepper label="Sisi b" value={b} set={setB} min={2} max={12} /><Stepper label="Sudut C" value={C} set={setC} min={10} max={170} step={10} unit="°" /></div>
    <Pair>
      <Triangle names={["A", "B", "C"]} angles={[Aa, 180 - Aa - C, C]} sides={[`a = ${a}`, `b = ${b}`, `c ≈ ${idn(r2(c))}`]} marks={["", "", `${C}°`]} />
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li><M text={`c^{2} = ${a}^{2} + ${b}^{2} − 2(${a})(${b}) cos ${C}°`} /></li>
        <li><M text={`c^{2} = ${idn(a * a + b * b)} − ${idn(2 * a * b)} × (${idn(r3(Math.cos(R(C))))}) ≈ ${idn(r2(c * c))}`} /></li>
        <li>c ≈ {idn(r2(c))}</li>
        <li><M text={`Luas = {1/2} × ${a} × ${b} × sin ${C}° ≈ ${idn(r2(L))}`} /></li>
      </ol>
    </Pair>
    <Result value={`${a}|${b}|${C}|${r2(c)}|${r2(L)}`}><M text={`Dengan aturan cosinus, c ≈ ${idn(r2(c))}. Luas segitiga ≈ ${idn(r2(L))} satuan luas.${C > 90 ? " Sudut C tumpul, jadi c adalah sisi terpanjang." : ""}`} /></Result>
  </div>;
}

const fns = ["sin", "cos", "tan"] as const;
function GrafikLab() {
  const [fn, setFn] = useState<(typeof fns)[number]>("sin"); const [a, setA] = useState(1); const [b, setB] = useState(1); const [d, setD] = useState(0);
  const base = fn === "sin" ? Math.sin : fn === "cos" ? Math.cos : Math.tan, f = (x: number) => a * base(b * x) + d;
  const label = `y = ${a === 1 ? "" : a === -1 ? "−" : idn(a)}${fn} ${b === 1 ? "" : b}x${d ? ` ${d > 0 ? "+" : "−"} ${Math.abs(d)}` : ""}`;
  const max = fn === "tan" ? null : Math.abs(a) + d, min = fn === "tan" ? null : -Math.abs(a) + d, per = piText(fn === "tan" ? 180 / b : 360 / b);
  return <div className="space-y-3">
    <Radios label="Fungsi" options={fns} value={fn} set={setFn} />
    <div className="flex flex-wrap gap-3"><Stepper label="a" value={a} set={setA} min={-3} max={3} skip={0} /><Stepper label="b" value={b} set={setB} min={1} max={3} /><Stepper label="d" value={d} set={setD} min={-2} max={2} /></div>
    <Pair>
      <TrigPlot fns={[{ f, label }]} ymin={-5} ymax={5} />
      <ul className="space-y-1 text-sm leading-7"><li><M text={label} /></li>
        <li>Maksimum: {max === null ? "tidak ada" : idn(max)}</li><li>Minimum: {min === null ? "tidak ada" : idn(min)}</li><li><M text={`Periode: ${per}`} /></li></ul>
    </Pair>
    <Result value={`${fn}|${a}|${b}|${d}|${max ?? "x"}|${min ?? "x"}|${plain(per)}`}><M text={fn === "tan" ? `Grafik tan tidak mempunyai maksimum dan minimum. Periodenya ${per}.` : `Amplitudo ${Math.abs(a)}, digeser ${d} satuan, maksimum ${idn(max!)}, minimum ${idn(min!)}, periode ${per}.`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { sudut: SudutLab, segitiga: SegitigaLab, istimewa: IstimewaLab, relasi: RelasiLab, identitas: IdentitasLab, aturan: AturanLab, grafik: GrafikLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-16" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="text" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "surd": return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <span className="inline-flex flex-col items-center gap-1"><span className="flex items-center gap-1"><In label={`${plainMath(p.label)} pengali`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-xl">√</span><In label={`${plainMath(p.label)} bilangan di dalam akar`} value={x[1]} set={v => put(1, v)} disabled={checked} /></span>
        <span className="h-0.5 w-full bg-neutral" aria-hidden="true" /><In label={`${plainMath(p.label)} penyebut`} value={x[2]} set={v => put(2, v)} disabled={checked} /></span></div>
      <p className="text-xs text-base-content/60">Contoh: {"√3/2"} diisi 1, 3, 2. Bilangan tanpa akar diisi dengan 1 di dalam akar, misalnya {"−1/2"} diisi −1, 1, 2.</p></div>;
    case "pi": return <div role="group" aria-label={plainMath(p.label)} className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <span className="inline-flex flex-col items-center gap-1"><span className="flex items-center gap-1"><In label={`${plainMath(p.label)} pembilang`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-xl italic">π</span></span>
        <span className="h-0.5 w-full bg-neutral" aria-hidden="true" /><In label={`${plainMath(p.label)} penyebut`} value={x[1]} set={v => put(1, v)} disabled={checked} /></span><span className="text-sm">rad</span></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      {p.pics ? <div className="grid gap-2 sm:grid-cols-3">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-base-100 p-1.5 ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start font-extrabold">{op}.</span><SceneView scene={p.pics![k]} /></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTenTrigonometry() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 10, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Trigonometri</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Ukuran sudut, perbandingan trigonometri pada segitiga siku-siku dan sudut istimewa, relasi sudut di setiap kuadran, identitas, aturan sinus dan cosinus, serta grafik fungsi trigonometri.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-44"><UnitCircle deg={30} label="30°" cls="w-full" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Mengukur yang tidak bisa dijangkau</h2>
        <p className="mt-2 text-sm">Tinggi tiang bendera dari bayangannya, lebar danau dari dua jarak di darat, dan naik-turun air laut: semuanya dihitung dengan perbandingan sisi dan sudut segitiga.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-trigonometri">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-trigonometri" className="mt-8 scroll-mt-20">
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
