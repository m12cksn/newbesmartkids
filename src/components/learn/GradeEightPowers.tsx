"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronsLeft, ChevronsRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Cubes, M, plainMath, SceneView, SquareFig } from "./GradeEightPowersArt";
import {
  assessment, cells, correct, formatAnswer, gcd, idn, plainDecimal, practice, ready, SEP, simplifyRoot, splitParts, surdText, topics,
  type Part, type PQuestion,
} from "@/data/grade-eight-powers";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, show }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; show?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(Math.round((value - step) * 100) / 100)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{show ?? idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(Math.round((value + step) * 100) / 100)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string | number>({ label, options, value, set, show = String }: { label: string; options: T[]; value: T; set: (v: T) => void; show?: (v: T) => ReactNode }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={String(o)} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{show(o)}</button>)}</div>;
}
const Chip = ({ children, tone = "a", off }: { children: ReactNode; tone?: "a" | "b"; off?: boolean }) => <span className={`relative inline-grid h-8 min-w-8 place-items-center rounded-md px-1 text-sm font-extrabold ${tone === "a" ? "bg-info/20 text-info-content ring-1 ring-info/50" : "bg-warning/30 ring-1 ring-warning"} ${off ? "opacity-40" : ""}`}>{children}{off && <span className="absolute inset-x-0 top-1/2 h-0.5 -rotate-12 bg-error" aria-hidden="true" />}</span>;
const sup = (b: number | string, e: number | string) => `${typeof b === "number" && b < 0 ? `(${idn(b)})` : b}^{${typeof e === "number" ? idn(e) : e}}`;

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function RepeatLab() {
  const [a, setA] = useState(-2);
  const [nn, setN] = useState(4);
  const val = a ** nn, sgn = a < 0 ? (nn % 2 ? "negatif (pangkat ganjil)" : "positif (pangkat genap)") : "positif";
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Bilangan pokok" value={a} set={setA} min={-5} max={10} /><Stepper label="Pangkat" value={nn} set={setN} min={1} max={10} /></div>
    <div className="rounded-xl bg-base-100 p-3 text-lg">
      <p className="text-2xl font-extrabold"><M text={sup(a, nn)} /></p>
      <p className="mt-1 flex flex-wrap gap-1">{Array.from({ length: nn }, (_, k) => <span key={k} className="flex items-center gap-1">{k > 0 && <span>×</span>}<Chip>{a < 0 ? `(${idn(a)})` : idn(a)}</Chip></span>)}<span className="ms-1 font-bold">= {idn(val)}</span></p>
      {a < 0 && <p className="mt-2 text-sm">Bandingkan tanpa kurung: <M text={`−${-a}^{${nn}} = −${idn((-a) ** nn)}`} /></p>}
      {a === 2 && nn === 10 && <p className="mt-2 text-sm font-semibold text-success">2^10 = 1.024: banyak byte dalam 1 kilobyte.</p>}
      {a === 3 && nn === 3 && <div className="mt-2 flex items-center gap-2 text-sm"><Cubes n={3} size={70} /> Kubus rubik 3 × 3 × 3 berisi 27 kubus kecil.</div>}
    </div>
    <Result value={`${a}|${nn}|${val}`}><M text={sup(a, nn)} /> = {idn(val)}. Bilangan pokok {idn(a)} dikalikan {nn} kali. Hasilnya {sgn}.</Result>
  </div>;
}
function LawsLab() {
  const [op, setOp] = useState<"kali" | "bagi">("kali");
  const [base, setBase] = useState(3);
  const [m, setM] = useState(4);
  const [nn, setN] = useState(2);
  const e = op === "kali" ? m + nn : m - nn;
  return <div className="space-y-3">
    <Radios label="Operasi" options={["kali", "bagi"] as const} value={op} set={setOp} show={o => (o === "kali" ? "Perkalian" : "Pembagian")} />
    <div className="flex flex-wrap gap-4"><Stepper label="Bilangan pokok" value={base} set={setBase} min={2} max={10} /><Stepper label="Pangkat pertama" value={m} set={setM} min={1} max={8} /><Stepper label="Pangkat kedua" value={nn} set={setN} min={1} max={8} /></div>
    <div className="rounded-xl bg-base-100 p-3">
      {op === "kali" ? <div className="flex flex-wrap items-center gap-1">{Array.from({ length: m }, (_, k) => <Chip key={`a${k}`}>{base}</Chip>)}<span className="mx-1">×</span>{Array.from({ length: nn }, (_, k) => <Chip key={`b${k}`} tone="b">{base}</Chip>)}</div>
        : <div className="inline-flex flex-col items-start gap-1"><div className="flex flex-wrap gap-1">{Array.from({ length: m }, (_, k) => <Chip key={k} off={k < Math.min(m, nn)}>{base}</Chip>)}</div><div className="h-0.5 w-full bg-neutral" /><div className="flex flex-wrap gap-1">{Array.from({ length: nn }, (_, k) => <Chip key={k} tone="b" off={k < Math.min(m, nn)}>{base}</Chip>)}</div></div>}
      <p className="mt-2 text-lg font-bold"><M text={op === "kali" ? `${base}^{${m}} × ${base}^{${nn}} = ${base}^{${m} + ${nn}} = ${base}^{${e}}` : `{${base}^{${m}}/${base}^{${nn}}} = ${base}^{${m} − ${nn}} = ${base}^{${idn(e)}}`} /></p>
    </div>
    <Result value={`${op}|${e}`}>{op === "kali" ? `Ada ${m} + ${nn} = ${e} faktor ${base}.` : `${Math.min(m, nn)} pasang faktor saling membagi habis (hasilnya 1). ${e > 0 ? `Tersisa ${e} faktor di atas.` : e === 0 ? "Tidak ada yang tersisa, hasilnya 1 = pangkat nol." : `Tersisa ${-e} faktor di bawah, jadi pangkatnya negatif.`}`}</Result>
  </div>;
}
function PowerLab() {
  const [m, setM] = useState(4);
  const [nn, setN] = useState(3);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Pangkat dalam" value={m} set={setM} min={1} max={5} /><Stepper label="Pangkat luar" value={nn} set={setN} min={1} max={4} /></div>
    <div className="space-y-1.5 rounded-xl bg-base-100 p-3">
      <p className="text-lg font-bold"><M text={`(3^{${m}})^{${nn}}`} /> = {Array.from({ length: nn }, (_, k) => <span key={k}>{k > 0 && " × "}<M text={`3^{${m}}`} /></span>)}</p>
      <div className="flex flex-wrap gap-2">{Array.from({ length: nn }, (_, g) => <span key={g} className="flex gap-0.5 rounded-lg border-2 border-dashed border-success/50 p-1">{Array.from({ length: m }, (_, k) => <Chip key={k} tone={g % 2 ? "b" : "a"}>3</Chip>)}</span>)}</div>
    </div>
    <Result value={String(m * nn)}>{nn} kelompok, masing-masing {m} faktor: {nn} × {m} = {m * nn} faktor. Jadi <M text={`(3^{${m}})^{${nn}} = 3^{${m * nn}}`} />.</Result>
  </div>;
}
function LadderLab() {
  const [base, setBase] = useState(10);
  const [k, setK] = useState(2);
  const rows = [3, 2, 1, 0, -1, -2, -3];
  const fracText = (e: number) => (e >= 0 ? idn(base ** e) : `{1/${idn(base ** -e)}}`);
  return <div className="space-y-3">
    <Radios label="Bilangan pokok" options={[10, 2, 5]} value={base} set={b => setBase(b)} />
    <div className="grid gap-1 rounded-xl bg-base-100 p-2 sm:grid-cols-[auto_1fr]">
      <ol className="space-y-0.5">{rows.map(e => <li key={e} className={`flex items-center gap-3 rounded-md px-2 py-0.5 text-base ${e === k ? "bg-success/15 font-extrabold ring-1 ring-success" : ""}`}><span className="w-12"><M text={`${base}^{${idn(e)}}`} /></span><span>=</span><span className="w-20"><M text={fracText(e)} /></span><span className="text-sm text-base-content/70">{idn(base ** e)}</span></li>)}</ol>
      <div className="flex flex-row gap-2 sm:flex-col sm:justify-center">
        <button type="button" className="btn btn-sm btn-outline gap-1" disabled={k >= 3} onClick={() => setK(k + 1)}><ArrowUp className="size-4" aria-hidden="true" />Naik satu pangkat</button>
        <button type="button" className="btn btn-sm btn-success gap-1" disabled={k <= -3} onClick={() => setK(k - 1)}><ArrowDown className="size-4" aria-hidden="true" />Turun satu pangkat</button>
      </div>
    </div>
    <Result value={`${base}|${k}`}><M text={`${base}^{${idn(k)}}`} /> = <M text={fracText(k)} /> = {idn(base ** k)}. {k === 0 ? "Pangkat nol selalu bernilai 1." : k < 0 ? <>Pangkat negatif adalah kebalikan dari <M text={`${base}^{${-k}}`} />.</> : "Setiap turun satu pangkat, nilainya dibagi " + base + "."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const rootText = (c: number, r: number) => (r === 1 ? idn(c) : `${c === 1 ? "" : idn(c)}√{${r}}`);
function SquareLab() {
  const [area, setArea] = useState(625);
  const [c, r] = simplifyRoot(1, area), side = rootText(c, r);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3"><Stepper label="Luas" value={area} set={setArea} min={1} max={900} /><Stepper label="Luas (lompat 25)" value={area} set={setArea} min={1} max={900} step={25} /></div>
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3"><SquareFig area={`${area} cm^{2}`} label="Saputangan" side={`sisi = ${r === 1 ? idn(c) : (c === 1 ? "" : idn(c)) + "√" + r} cm`} />
      <p className="text-lg font-bold"><M text={`√{${area}} = ${side}`} /></p></div>
    <Result value={`${area}|${c}|${r}`}>{r === 1 ? <>{area} adalah bilangan kuadrat: {c} × {c} = {area}. Sisinya {c} cm.</> : <>{area} bukan bilangan kuadrat. Sisinya <M text={side} /> cm ≈ {idn(Math.round(Math.sqrt(area) * 100) / 100)} cm, bilangan irasional.</>}</Result>
  </div>;
}
function SimplifyLab() {
  const [nn, setN] = useState(72);
  const [c, r] = simplifyRoot(1, nn), sq = c * c;
  return <div className="space-y-3">
    <Stepper label="Bilangan di dalam akar" value={nn} set={setN} min={2} max={300} />
    <div className="space-y-1 rounded-xl bg-base-100 p-3 text-lg">
      {c > 1 ? <p className="font-bold"><M text={`√{${nn}} = √{${sq} × ${r}} = √{${sq}} × √{${r}} = ${rootText(c, r)}`} /></p> : <p className="font-bold"><M text={`√{${nn}}`} /> tidak punya faktor kuadrat selain 1.</p>}
      <p className="text-sm text-base-content/70">Faktor kuadrat yang dicoba: {[4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144].filter(s => s <= nn).map(s => <span key={s} className={`me-1 ${nn % s === 0 ? "font-bold text-success" : ""}`}>{s}</span>)}</p>
    </div>
    <Result value={`${c}|${r}`}>Bentuk paling sederhana: <strong><M text={rootText(c, r)} /></strong>.{r === 1 ? ` ${nn} adalah bilangan kuadrat.` : ""}</Result>
  </div>;
}
function MultiplyLab() {
  const [a, setA] = useState(3);
  const [p, setP] = useState(5);
  const [b, setB] = useState(5);
  const [qq, setQ] = useState(10);
  const [c, r] = simplifyRoot(a * b, p * qq);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Koefisien panjang" value={a} set={setA} min={1} max={9} /><Stepper label="Akar panjang" value={p} set={setP} min={2} max={20} /><Stepper label="Koefisien lebar" value={b} set={setB} min={1} max={9} /><Stepper label="Akar lebar" value={qq} set={setQ} min={2} max={20} /></div>
    <div className="rounded-xl bg-base-100 p-3 text-lg">
      <p>Panjang <M text={rootText(a, p)} /> cm, lebar <M text={rootText(b, qq)} /> cm</p>
      <p className="font-bold">Luas = <M text={`${rootText(a, p)} × ${rootText(b, qq)} = ${a * b}√{${p * qq}} = ${rootText(c, r)}`} /> cm<sup>2</sup></p>
    </div>
    <Result value={`${c}|${r}`}>Koefisien dikalikan ({a} × {b} = {a * b}), bilangan di dalam akar dikalikan ({p} × {qq} = {p * qq}), lalu disederhanakan menjadi <strong><M text={rootText(c, r)} /></strong>.</Result>
  </div>;
}
type Kind = "akar" | "plus" | "dua";
function RationalLab() {
  const [kind, setKind] = useState<Kind>("plus");
  const [k, setK] = useState(6);
  const [a, setA] = useState(5);
  const [b, setB] = useState(3);
  const bs = [2, 3, 5, 6, 7], as = kind === "dua" ? [3, 5, 6, 7, 10, 11] : kind === "akar" ? [2, 3, 5, 6, 7] : [2, 3, 4, 5, 6];
  const A = as.includes(a) ? a : as[0], B = bs.includes(b) && !(kind === "dua" && b >= A) ? b : bs.find(x => kind !== "dua" || x < A)!;
  let terms: [number, number][] = [], den = 1, denText = "", conj = "", mid = "";
  if (kind === "akar") { terms = [[k, A]]; den = A; denText = `√{${A}}`; conj = `√{${A}}`; mid = `${A}`; }
  else if (kind === "plus") { terms = [[k * A, 1], [-k, B]]; den = A * A - B; denText = `${A} + √{${B}}`; conj = `${A} − √{${B}}`; mid = `${A}^{2} − ${B} = ${den}`; }
  else { terms = [[k, A], [-k, B]]; den = A - B; denText = `√{${A}} + √{${B}}`; conj = `√{${A}} − √{${B}}`; mid = `${A} − ${B} = ${den}`; }
  const g = terms.reduce((x, [c]) => gcd(x, c), den);
  const out = surdText(terms.map(([c, r]) => [String(c / g), String(r)] as [string, string]), String(den / g));
  return <div className="space-y-3">
    <Radios label="Jenis penyebut" options={["akar", "plus", "dua"] as Kind[]} value={kind} set={setKind} show={o => <M text={o === "akar" ? "√{a}" : o === "plus" ? "a + √{b}" : "√{a} + √{b}"} />} />
    <div className="flex flex-wrap gap-3"><Stepper label="Pembilang" value={k} set={setK} min={1} max={12} />
</div>
    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">a</span><Radios label="Nilai a" options={as} value={A} set={setA} />
      {kind !== "akar" && <><span className="ms-2 text-sm font-semibold">b</span><Radios label="Nilai b" options={bs.filter(x => kind !== "dua" || x < A)} value={B} set={setB} /></>}</div>
    <ol className="list-decimal space-y-1 rounded-xl bg-base-100 py-3 pe-3 ps-8 text-base">
      <li><M text={`{${k}/${denText}} × {${conj}/${conj}}`} /></li>
      <li>Penyebut: <M text={`(${denText})(${conj}) = ${mid}`} /></li>
      <li>Pembilang: <M text={`${k}(${conj})`} /></li>
      <li className="font-bold">Hasil: {out.replace(/√(\d+)/g, "√$1")}</li>
    </ol>
    <Result value={out}>Penyebut sekarang bilangan bulat. Bentuk sekawan dipakai karena <M text={kind === "akar" ? "√{a} × √{a} = a" : kind === "plus" ? "(a + √{b})(a − √{b}) = a^{2} − b" : "(√{a} + √{b})(√{a} − √{b}) = a − b"} />.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
const samples = [{ name: "Berat Bumi (ton)", digits: "6", exp: 21 }, { name: "Daya angkut truk (kg)", digits: "4", exp: 5 }, { name: "Panjang 0,0000000796 m", digits: "796", exp: -8 }, { name: "Diameter virus 0,00012 mm", digits: "12", exp: -4 }];
function SciLab() {
  const [k, setK] = useState(0);
  const [shift, setShift] = useState(0);
  const s = samples[k], mant0 = Number(s.digits[0] + (s.digits.length > 1 ? "." + s.digits.slice(1) : "")); // bilangan asli = mant0 × 10^exp
  const value = plainDecimal(mant0, s.exp), cur = plainDecimal(mant0, s.exp - shift), ok = shift === s.exp;
  return <div className="space-y-3">
    <Radios label="Contoh" options={[0, 1, 2, 3]} value={k} set={v => { setK(v); setShift(0); }} show={v => samples[v].name} />
    <div className="space-y-2 rounded-xl bg-base-100 p-3">
      <p className="break-all text-sm text-base-content/70">Bentuk biasa: {value}</p>
      <p className="break-all text-xl font-extrabold"><span className="text-success">{cur}</span> × <M text={`10^{${idn(shift)}}`} /></p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => setShift(shift + 1)}><ChevronsLeft className="size-4" aria-hidden="true" />Geser koma ke kiri</button>
        <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => setShift(shift - 1)}>Geser koma ke kanan<ChevronsRight className="size-4" aria-hidden="true" /></button>
        <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setShift(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
      </div>
    </div>
    <Result value={`${shift}|${ok ? "ok" : ""}`}>{ok ? <>Tepat. Bentuk bakunya <strong><M text={`${idn(mant0)} × 10^{${idn(s.exp)}}`} /></strong>, karena 1 ≤ {idn(mant0)} &lt; 10.</> : shift < s.exp ? "Bilangan depan masih 10 atau lebih. Geser koma ke kiri lagi." : "Bilangan depan kurang dari 1. Geser koma ke kanan."}</Result>
  </div>;
}
function SciOpsLab() {
  const [op, setOp] = useState<"kali" | "bagi">("kali");
  const [a, setA] = useState(3);
  const [m, setM] = useState(8);
  const [b, setB] = useState(6);
  const [nn, setN] = useState(1);
  const raw = op === "kali" ? a * b : a / b, e0 = op === "kali" ? m + nn : m - nn;
  const shift = raw >= 10 ? 1 : raw < 1 ? -1 : 0, mant = Math.round((raw / 10 ** shift) * 1e6) / 1e6, e = e0 + shift;
  return <div className="space-y-3">
    <Radios label="Operasi" options={["kali", "bagi"] as const} value={op} set={setOp} show={o => (o === "kali" ? "Perkalian" : "Pembagian")} />
    <div className="flex flex-wrap gap-3"><Stepper label="Bilangan pertama" value={a} set={setA} min={1} max={9.5} step={0.5} /><Stepper label="Pangkat pertama" value={m} set={setM} min={-9} max={12} />
      <Stepper label="Bilangan kedua" value={b} set={setB} min={1} max={9.5} step={0.5} /><Stepper label="Pangkat kedua" value={nn} set={setN} min={-9} max={12} /></div>
    <ol className="list-decimal space-y-1 rounded-xl bg-base-100 py-3 pe-3 ps-8 text-base">
      <li><M text={`(${idn(a)} × 10^{${idn(m)}}) ${op === "kali" ? "×" : ":"} (${idn(b)} × 10^{${idn(nn)}})`} /></li>
      <li><M text={`= (${idn(a)} ${op === "kali" ? "×" : ":"} ${idn(b)}) × 10^{${idn(m)} ${op === "kali" ? "+" : "−"} ${nn < 0 ? `(${idn(nn)})` : idn(nn)}} = ${idn(Math.round(raw * 1e6) / 1e6)} × 10^{${idn(e0)}}`} /></li>
      <li className="font-bold"><M text={`= ${idn(mant)} × 10^{${idn(e)}}`} />{shift !== 0 && <span className="ms-2 text-sm font-normal">(dirapikan karena {idn(Math.round(raw * 1e6) / 1e6)} {shift > 0 ? "≥ 10" : "< 1"})</span>}</li>
    </ol>
    <Result value={`${idn(mant)}|${e}`}>Hasil dalam bentuk baku: <strong><M text={`${idn(mant)} × 10^{${idn(e)}}`} /></strong>.</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { repeat: RepeatLab, laws: LawsLab, power: PowerLab, ladder: LadderLab, square: SquareLab, simplify: SimplifyLab, multiply: MultiplyLab, rational: RationalLab, sci: SciLab, sciops: SciOpsLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-16", small }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string; small?: boolean }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9a-zA-Z,.\-−()]/g, "").slice(0, 16))}
    className={`${small ? "h-8 w-11 text-sm" : `h-10 ${w} text-lg`} rounded-lg border-2 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), lbl = plainMath(p.kind === "tf" ? "" : p.label);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const label = p.kind !== "tf" ? <span className="font-bold"><M text={p.label} /></span> : null;
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{label}<In label={lbl} value={value} set={set} disabled={checked} w="w-36" />{p.unit && <span className="font-semibold"><M text={p.unit} /></span>}</div>;
    case "pow": return <div className="flex flex-wrap items-center gap-2">{label}
      <span className="inline-flex items-start">{p.fixedBase ? <span className="mt-2 text-2xl font-extrabold">{p.base}</span> : <In label={`${lbl} bilangan pokok`} value={x[0]} set={v => put(0, v)} disabled={checked} />}
        <In small label={`${lbl} pangkat`} value={x[p.fixedBase ? 0 : 1]} set={v => put(p.fixedBase ? 0 : 1, v)} disabled={checked} /></span></div>;
    case "frac": return <div className="flex flex-wrap items-center gap-2">{label}
      <span className="inline-flex flex-col items-center gap-1"><In label={`${lbl} pembilang`} value={x[0]} set={v => put(0, v)} disabled={checked} w="w-24" /><span className="h-0.5 w-24 bg-neutral" /><In label={`${lbl} penyebut`} value={x[1]} set={v => put(1, v)} disabled={checked} w="w-24" /></span></div>;
    case "root": return <div className="flex flex-wrap items-center gap-2">{label}
      <span className="inline-flex items-center gap-0.5"><In label={`${lbl} koefisien`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-2xl">√</span><span className="border-t-2 border-neutral pt-0.5"><In label={`${lbl} bilangan di dalam akar`} value={x[1]} set={v => put(1, v)} disabled={checked} /></span></span></div>;
    case "surd": return <div className="space-y-1">{label}
      <div className="inline-flex flex-col items-center gap-1 rounded-lg bg-base-100 p-2">
        <span className="flex flex-wrap items-center gap-1">{p.terms.map((_, k) => <span key={k} className="inline-flex items-center gap-0.5">{k > 0 && <span className="mx-1 font-bold">+</span>}<In label={`${lbl} suku ${k + 1} koefisien`} value={x[2 * k]} set={v => put(2 * k, v)} disabled={checked} w="w-14" /><span className="text-xl">√</span><span className="border-t-2 border-neutral pt-0.5"><In label={`${lbl} suku ${k + 1} akar`} value={x[2 * k + 1]} set={v => put(2 * k + 1, v)} disabled={checked} w="w-12" /></span></span>)}</span>
        <span className="h-0.5 w-full bg-neutral" /><In label={`${lbl} penyebut`} value={x.at(-1)!} set={v => put(x.length - 1, v)} disabled={checked} w="w-16" />
      </div>
      <p className="text-xs text-base-content/60">Koefisien boleh negatif (misalnya −1). Untuk suku tanpa akar, isi 1 di dalam akar. Jika penyebutnya 1, isi 1.</p></div>;
    case "sci": return <div className="flex flex-wrap items-center gap-2">{label}
      <span className="inline-flex items-start gap-1"><In label={`${lbl} bilangan depan`} value={x[0]} set={v => put(0, v)} disabled={checked} w="w-24" /><span className="mt-2 text-xl font-bold">× 10</span><In small label={`${lbl} pangkat 10`} value={x[1]} set={v => put(1, v)} disabled={checked} /></span></div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{label}
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeEightPowers() {
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
    <p className="text-sm font-semibold text-success">Kelas 8, Bab 1</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bilangan Berpangkat</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Tulis bilangan yang sangat besar dan sangat kecil dengan ringkas: pangkat bulat dan sifat-sifatnya, bentuk akar dan merasionalkan penyebut, serta bentuk baku.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-3"><Cubes n={3} size={64} /><span className="text-3xl font-extrabold text-success"><M text="3^{3}" /></span></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Dari virus sampai Matahari</h2>
        <p className="mt-2 text-sm">Diameter Matahari sangat besar, sedangkan virus sangat kecil. Keduanya lebih mudah ditulis dengan bilangan berpangkat: pangkat positif untuk yang besar, pangkat negatif untuk yang kecil.</p>
        <p className="mt-2 text-sm text-base-content/60">{total} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-pangkat">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-pangkat" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-3 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-7"><span className="font-bold">Contoh. </span><M text={s.example} /></p>
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
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
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
