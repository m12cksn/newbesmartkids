"use client";

import { ArrowLeft, ArrowRight, Delete, Minus, Plus, RotateCcw, Scale, StepForward } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { BalanceView, M, NumberLine, SceneView } from "./GradeEightLinearArt";
import {
  assessment, builtText, cells, correct, formatAnswer, idn, plain, practice, ready, SEP, SIGNS, sortedSet, splitParts, topics,
  type LQuestion, type Part, type Sign,
} from "@/data/grade-eight-linear";

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
function Radios<T extends string | number>({ label, options, value, set, show = String }: { label: string; options: readonly T[]; value: T; set: (v: T) => void; show?: (v: T) => ReactNode }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={String(o)} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 ${value === o ? "btn-success" : "btn-outline"}`}>{show(o)}</button>)}</div>;
}
const Box = ({ children }: { children: ReactNode }) => <div className="space-y-1 rounded-xl bg-base-100 p-3 text-base leading-8">{children}</div>;
/** ax + b dengan tanda yang rapi. */
const lin = (a: number, b: number, v = "x") => `${a === 1 ? "" : a === -1 ? "−" : idn(a)}${v}${b === 0 ? "" : b > 0 ? ` + ${idn(b)}` : ` − ${idn(-b)}`}`;
const flip: Record<Sign, Sign> = { "<": ">", ">": "<", "≤": "≥", "≥": "≤" };

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const openSentences = [{ text: "x + 4 = 20", v: "x", f: (x: number) => x + 4, rhs: 20, sub: (x: number) => `${idn(x)} + 4` }, { text: "2 + a = 8", v: "a", f: (a: number) => 2 + a, rhs: 8, sub: (a: number) => `2 + ${a < 0 ? `(${idn(a)})` : idn(a)}` }, { text: "p + 28 = 40", v: "p", f: (p: number) => p + 28, rhs: 40, sub: (p: number) => `${idn(p)} + 28` }];
function OpenLab() {
  const [k, setK] = useState(0);
  const [val, setVal] = useState(10);
  const s = openSentences[k], lhs = s.f(val), ok = lhs === s.rhs;
  return <div className="space-y-3">
    <Radios label="Kalimat terbuka" options={[0, 1, 2]} value={k} set={setK} show={i => openSentences[i].text} />
    <Stepper label={`Nilai ${s.v}`} value={val} set={setVal} min={-10} max={30} />
    <Box>
      <p>Kalimat terbuka: <strong>{s.text}</strong> (belum dapat dinilai)</p>
      <p>Ganti {s.v} = {idn(val)}: <strong>{s.sub(val)} = {s.rhs}</strong></p>
      <p>Ruas kiri {idn(lhs)} {ok ? "=" : "≠"} ruas kanan {s.rhs}</p>
    </Box>
    <Result value={`${k}|${val}|${ok ? "benar" : "salah"}`}>Sekarang kalimatnya tertutup dan bernilai <strong>{ok ? "benar" : "salah"}</strong>.{ok ? ` Jadi ${s.v} = ${idn(val)} adalah penyelesaiannya.` : ` Coba nilai ${s.v} yang lain.`}</Result>
  </div>;
}

const hpSentences = [
  { text: "m kelipatan 7 yang kurang dari 24", test: (m: number) => m % 7 === 0 && m < 24 },
  { text: "p membagi habis 12", test: (p: number) => 12 % p === 0 },
  { text: "a bilangan genap kurang dari 10", test: (a: number) => a % 2 === 0 && a < 10 },
  { text: "x + 4 = 10", test: (x: number) => x + 4 === 10 },
];
function HpLab() {
  const [k, setK] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const s = hpSentences[k], all = Array.from({ length: 24 }, (_, i) => i + 1), want = all.filter(s.test);
  const wrong = picked.filter(x => !s.test(x)), missing = want.filter(x => !picked.includes(x));
  const status = wrong.length ? "salah" : missing.length ? "kurang" : "lengkap";
  const toggle = (x: number) => setPicked(picked.includes(x) ? picked.filter(y => y !== x) : [...picked, x].sort((a, b) => a - b));
  return <div className="space-y-3">
    <Radios label="Kalimat terbuka" options={[0, 1, 2, 3]} value={k} set={i => { setK(i); setPicked([]); }} show={i => hpSentences[i].text} />
    <div role="group" aria-label="Bilangan asli 1 sampai 24" className="grid grid-cols-6 gap-1.5 rounded-xl bg-base-100 p-3 sm:grid-cols-12">
      {all.map(x => <button key={x} type="button" aria-pressed={picked.includes(x)} aria-label={`Bilangan ${x}`} onClick={() => toggle(x)} className={`h-9 rounded-lg border-2 text-sm font-bold ${picked.includes(x) ? "border-success bg-success text-success-content" : "border-base-300 bg-base-100"}`}>{x}</button>)}
    </div>
    <p className="text-lg font-bold">HP = {"{"}{picked.join(", ")}{"}"}</p>
    <Result value={`${k}|${picked.length}|${status}`}>{status === "lengkap" ? `Tepat. Semua bilangan asli sampai 24 yang memenuhi "${s.text}" sudah dipilih.` : status === "salah" ? `${wrong.join(", ")} tidak memenuhi kalimatnya. Ketuk lagi untuk membatalkan.` : `Masih ada ${missing.length} bilangan yang memenuhi tetapi belum dipilih.`}</Result>
  </div>;
}

const forms = [
  { text: "2x + 5 = 11", vars: "x", coef: "2", konst: "5 dan 11", pow: 1, kind: "PLSV", why: "satu variabel, pangkat 1, tanda =" },
  { text: "3p = 45", vars: "p", coef: "3", konst: "45", pow: 1, kind: "PLSV", why: "satu variabel, pangkat 1, tanda =" },
  { text: "x + 10y = 110", vars: "x dan y", coef: "1 dan 10", konst: "110", pow: 1, kind: "PLDV", why: "ada dua variabel" },
  { text: "x^{2} − 4 = 0", vars: "x", coef: "1", konst: "−4 dan 0", pow: 2, kind: "Persamaan kuadrat", why: "pangkat tertinggi variabelnya 2" },
  { text: "2a − 4 < 32", vars: "a", coef: "2", konst: "−4 dan 32", pow: 1, kind: "PtLSV", why: "memakai tanda <, bukan =" },
];
function FormLab() {
  const [k, setK] = useState(0);
  const f = forms[k];
  return <div className="space-y-3">
    <Radios label="Kalimat matematika" options={[0, 1, 2, 3, 4]} value={k} set={setK} show={i => <M text={forms[i].text} />} />
    <div className="overflow-x-auto"><table className="w-full min-w-64 border-collapse bg-base-100 text-left text-sm">
      <tbody>{([["Kalimat", <M key="t" text={f.text} />], ["Variabel", f.vars], ["Koefisien", f.coef], ["Konstanta", f.konst], ["Pangkat tertinggi", f.pow]] as [string, ReactNode][]).map(([h, v]) => <tr key={h} className="border-t border-base-300"><th className="w-40 px-3 py-1.5 font-semibold">{h}</th><td className="px-3 py-1.5 text-base font-bold">{v}</td></tr>)}</tbody>
    </table></div>
    <Result value={f.kind}>Jenisnya <strong>{f.kind}</strong>, karena {f.why}.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
const balanceStarts = [[2, 4, 8], [3, 2, 14], [1, 1, 5]] as const;
function BalanceLab() {
  const [k, setK] = useState(0);
  const [[a, b, c], setS] = useState<[number, number, number]>([...balanceStarts[0]]);
  const [log, setLog] = useState<string[]>([]);
  const pick = (i: number) => { setK(i); setS([...balanceStarts[i]]); setLog([]); };
  const take = () => { setS([a, b - 1, c - 1]); setLog([...log, `Kedua lengan dikurangi 1 kelereng: ${lin(a, b - 1)} = ${c - 1}`]); };
  const split = () => { setS([1, 0, c / a]); setLog([...log, `Kedua lengan dibagi ${a} kelompok sama: x = ${c / a}`]); };
  const done = a === 1 && b === 0;
  return <div className="space-y-3">
    <Radios label="Persamaan" options={[0, 1, 2]} value={k} set={pick} show={i => { const [x, y, z] = balanceStarts[i]; return `${lin(x, y)} = ${z}`; }} />
    <div className="rounded-xl bg-base-100 p-2"><BalanceView left={{ box: a, unit: b }} right={{ unit: c }} className="mx-auto w-full max-w-sm" />
      <p className="text-center text-xl font-extrabold">{lin(a, b)} = {c}</p></div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-outline gap-1" disabled={b === 0} onClick={take}><Minus className="size-4" aria-hidden="true" />Ambil 1 kelereng dari kedua lengan</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" disabled={b !== 0 || a === 1} onClick={split}><Scale className="size-4" aria-hidden="true" />Bagi menjadi {a} kelompok</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => pick(k)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    {log.length > 0 && <ol className="list-decimal space-y-0.5 ps-6 text-sm">{log.slice(-4).map((l, i) => <li key={i}>{l}</li>)}</ol>}
    <Result value={`${a}|${b}|${c}`}>{done ? <>Satu kotak berisi <strong>{c} kelereng</strong>, jadi x = {c}. Timbangan tetap seimbang di setiap langkah.</> : b > 0 ? "Ambil kelereng dari kedua lengan sampai lengan kiri hanya berisi kotak." : `Sekarang ${a} kotak seimbang dengan ${c} kelereng. Bagi menjadi ${a} kelompok.`}</Result>
  </div>;
}

const stepEqs = [
  { eq: "4x + 9 = 29", steps: [["4x + 9 − 9 = 29 − 9", "kedua ruas dikurangi 9"], ["4x = 20", "disederhanakan"], ["{4x/4} = {20/4}", "kedua ruas dibagi 4"], ["x = 5", "periksa: 4 × 5 + 9 = 29"]] },
  { eq: "13 − 7p = 34", steps: [["13 − 7p − 13 = 34 − 13", "kedua ruas dikurangi 13"], ["−7p = 21", "disederhanakan"], ["{−7p/−7} = {21/−7}", "kedua ruas dibagi −7"], ["p = −3", "periksa: 13 − 7 × (−3) = 34"]] },
  { eq: "{4x + 3/5} = −2", steps: [["{4x + 3/5} × 5 = −2 × 5", "kedua ruas dikali 5"], ["4x + 3 = −10", "disederhanakan"], ["4x = −13", "kedua ruas dikurangi 3"], ["x = −{13/4}", "kedua ruas dibagi 4"]] },
  { eq: "3(x + 2) = 5x − 4", steps: [["3x + 6 = 5x − 4", "buka tanda kurung"], ["3x − 5x = −4 − 6", "kumpulkan variabel di kiri, konstanta di kanan"], ["−2x = −10", "disederhanakan"], ["x = 5", "kedua ruas dibagi −2; periksa: 3 × 7 = 21 = 25 − 4"]] },
];
function StepsLab() {
  const [k, setK] = useState(0);
  const [shown, setShown] = useState(1);
  const e = stepEqs[k], done = shown === e.steps.length;
  return <div className="space-y-3">
    <Radios label="Persamaan" options={[0, 1, 2, 3]} value={k} set={i => { setK(i); setShown(1); }} show={i => <M text={stepEqs[i].eq} />} />
    <ol className="space-y-1 rounded-xl bg-base-100 p-3 text-base">
      <li className="font-bold"><M text={e.eq} /></li>
      {e.steps.slice(0, shown).map(([m, why], i) => <li key={i} className="flex flex-wrap items-baseline gap-x-3"><span className="font-bold"><M text={m} /></span><span className="text-sm text-base-content/70">({why})</span></li>)}
    </ol>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={done} onClick={() => setShown(shown + 1)}><StepForward className="size-4" aria-hidden="true" />Langkah berikutnya</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setShown(1)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={`${k}|${shown}|${done ? "selesai" : ""}`}>{done ? <>Selesai: <strong><M text={e.steps.at(-1)![0]} /></strong>. Setiap langkah dilakukan pada kedua ruas sehingga persamaannya tetap ekuivalen.</> : `Langkah ${shown} dari ${e.steps.length}.`}</Result>
  </div>;
}

function StoryLab() {
  const [a, setA] = useState(7);
  const [b, setB] = useState(8);
  const [s, setS] = useState(30000);
  const k = 2 * a + b, total = k * s;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Pasang sepatu" value={a} set={setA} min={1} max={10} /><Stepper label="Pasang sandal" value={b} set={setB} min={1} max={10} /><Stepper label="Harga sandal (Rp)" value={s} set={setS} min={10000} max={50000} step={5000} /></div>
    <ol className="list-decimal space-y-1 rounded-xl bg-base-100 py-3 pe-3 ps-8 text-base">
      <li>Misalkan harga sandal s, harga sepatu 2s.</li>
      <li>{a} × 2s + {b} × s = {idn(total)}</li>
      <li>{2 * a}s + {b}s = {k}s = {idn(total)}</li>
      <li className="font-bold">s = {idn(total)} : {k} = {idn(s)}</li>
    </ol>
    <Result value={`${k}|${total}`}>Total Rp{idn(total)},00 berasal dari {k} kali harga sandal. Sandal Rp{idn(s)},00 dan sepatu Rp{idn(2 * s)},00.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
const signWords: Record<Sign, string> = { "<": "kurang dari", ">": "lebih dari", "≤": "kurang dari atau sama dengan (paling banyak)", "≥": "lebih dari atau sama dengan (paling sedikit)" };
function interval(sign: Sign, b: number) { const v = idn(b); return sign === "<" ? `(−∞, ${v})` : sign === "≤" ? `(−∞, ${v}]` : sign === ">" ? `(${v}, ∞)` : `[${v}, ∞)`; }
function SymbolsLab() {
  const [sign, setSign] = useState<Sign>("≥");
  const [b, setB] = useState(4);
  const closed = sign === "≤" || sign === "≥", dir = sign === "<" || sign === "≤" ? "left" : "right";
  return <div className="space-y-3">
    <Radios label="Tanda" options={SIGNS} value={sign} set={setSign} />
    <Stepper label="Batas" value={b} set={setB} min={-8} max={8} />
    <Box>
      <NumberLine ray={{ at: b, closed, dir, from: -8, to: 8 }} />
      <p className="text-xl font-extrabold">x {sign} {idn(b)}</p>
      <p>Notasi interval: <strong>{interval(sign, b)}</strong></p>
      <p>Notasi pembentuk himpunan: <strong>{"{"}x | x {sign} {idn(b)}{"}"}</strong></p>
    </Box>
    <Result value={`${sign}|${b}|${interval(sign, b)}`}>x {signWords[sign]} {idn(b)}. Bulatan {closed ? "penuh karena batasnya termasuk" : "kosong karena batasnya tidak termasuk"}, arsiran ke {dir === "left" ? "kiri" : "kanan"}.</Result>
  </div>;
}

function SpeedLab() {
  const [v, setV] = useState(80);
  const ok = v >= 60 && v <= 100, state = ok ? "boleh" : v < 60 ? "terlalu lambat" : "terlalu cepat";
  return <div className="space-y-3">
    <Stepper label="Kecepatan (km/jam)" value={v} set={setV} min={0} max={140} step={10} />
    <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-100 p-3">
      <svg viewBox="0 0 150 90" className="w-40" role="img" aria-label="Rambu jalan tol: kecepatan maksimal 100 km/jam dan minimal 60 km/jam">
        <circle cx="38" cy="44" r="32" fill="#ffffff" stroke="#c92a2a" strokeWidth="7" /><text x="38" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1f2a25">100</text>
        <circle cx="112" cy="44" r="32" fill="#1c64b5" /><text x="112" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="#ffffff">60</text>
      </svg>
      <div className="min-w-48 flex-1"><svg viewBox="0 0 300 50" className="w-full" role="img" aria-label={`Kecepatan ${v} km/jam pada skala 0 sampai 140`}>
        <rect x="10" y="14" width="280" height="10" rx="5" fill="#e3e8e6" /><rect x={10 + (60 / 140) * 280} y="14" width={(40 / 140) * 280} height="10" fill="#3fa36b" />
        {[0, 60, 100, 140].map(t => <text key={t} x={10 + (t / 140) * 280} y="44" fontSize="14" textAnchor="middle" fill="#1f3b30">{t}</text>)}
        <path d={`M${10 + (v / 140) * 280} 12l-6 -9h12z`} fill={ok ? "#2b8a3e" : "#c92a2a"} />
      </svg><p className="mt-1 text-lg font-bold">60 ≤ v ≤ 100</p></div>
    </div>
    <Result value={`${v}|${state}`}>v = {v} km/jam: {ok ? "memenuhi 60 ≤ v ≤ 100, boleh melaju di jalan tol." : v < 60 ? `${v} < 60, terlalu lambat untuk jalan tol.` : `${v} > 100, melebihi batas kecepatan.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D                                                                */
/* ====================================================================== */
function FlipLab() {
  const [c, setC] = useState(3);
  const a = 4, b = 2, A = a * c, B = b * c, sign = A > B ? ">" : A < B ? "<" : "=";
  const X = (v: number) => 20 + ((v + 30) / 60) * 280;
  return <div className="space-y-3">
    <Stepper label="Pengali" value={c} set={setC} min={-5} max={5} />
    <Box>
      <p>Mula-mula: <strong>4 &gt; 2</strong></p>
      <p>Kedua ruas dikali {c < 0 ? `(${idn(c)})` : c}: <strong>{idn(A)} {sign} {idn(B)}</strong></p>
      <svg viewBox="0 0 320 58" className="w-full" role="img" aria-label={`Garis bilangan dengan titik ${idn(A)} dan ${idn(B)}`}>
        <line x1="10" x2="310" y1="30" y2="30" stroke="#33413b" strokeWidth="1.5" />
        {[-30, -20, -10, 0, 10, 20, 30].map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1="25" y2="35" stroke="#33413b" /><text x={X(t)} y="52" fontSize="11" textAnchor="middle" fill="#1f3b30">{t < 0 ? `−${-t}` : t}</text></g>)}
        <circle cx={X(A)} cy="30" r="6" fill="#1c64b5" /><text x={X(A)} y="16" fontSize="12" fontWeight="800" textAnchor="middle" fill="#1c64b5">{idn(A)}</text>
        <circle cx={X(B)} cy="30" r="6" fill="#e8590c" /><text x={X(B)} y={A === B ? 8 : 16} fontSize="12" fontWeight="800" textAnchor="middle" fill="#e8590c">{idn(B)}</text>
      </svg>
    </Box>
    <Result value={`${c}|${sign}`}>{c > 0 ? "Dikali bilangan positif: tandanya tetap >." : c < 0 ? "Dikali bilangan negatif: urutannya berbalik, tanda > menjadi <." : "Dikali nol: kedua ruas menjadi 0. Karena itu perkalian dengan nol tidak dipakai."}</Result>
  </div>;
}

function SolveLab() {
  const [a, setA] = useState(-2);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(2);
  const [sign, setSign] = useState<Sign>("<");
  const setNZ = (v: number) => setA(v === 0 ? (a < 0 ? 1 : -1) : v);
  const r = c - b, val = r / a, out = a < 0 ? flip[sign] : sign, nice = Number.isInteger(val) ? idn(val) : idn(Math.round(val * 100) / 100);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Koefisien" value={a} set={setNZ} min={-6} max={6} /><Stepper label="Konstanta kiri" value={b} set={setB} min={-12} max={12} /><Stepper label="Ruas kanan" value={c} set={setC} min={-12} max={12} /></div>
    <Radios label="Tanda" options={SIGNS} value={sign} set={setSign} />
    <ol className="list-decimal space-y-1 rounded-xl bg-base-100 py-3 pe-3 ps-8 text-base">
      <li className="font-bold">{lin(a, b)} {sign} {idn(c)}</li>
      <li>{lin(a, 0)} {sign} {idn(c)} {b >= 0 ? "−" : "+"} {idn(Math.abs(b))} = {idn(r)} <span className="text-sm text-base-content/70">(kedua ruas {b >= 0 ? "dikurangi" : "ditambah"} {idn(Math.abs(b))})</span></li>
      <li>x {out} {Number.isInteger(val) ? idn(val) : <M text={`{${idn(r)}/${idn(a)}}`} />} <span className="text-sm text-base-content/70">(dibagi {idn(a)}{a < 0 ? ", tanda berbalik" : ", tanda tetap"})</span></li>
      <li className="font-bold">x {out} {nice}</li>
    </ol>
    <div className="rounded-xl bg-base-100 p-2"><NumberLine ray={{ at: Math.round(val * 100) / 100, closed: out === "≤" || out === "≥", dir: out === "<" || out === "≤" ? "left" : "right", from: Math.floor(val) - 6, to: Math.floor(val) + 6 }} /></div>
    <Result value={`${out}|${nice}`}>Himpunan penyelesaiannya {"{"}x | x {out} {nice}{"}"}.{a < 0 ? " Tandanya berbalik karena dibagi bilangan negatif." : ""}</Result>
  </div>;
}

function TruckLab() {
  const [cap, setCap] = useState(2000);
  const [crew, setCrew] = useState(150);
  const [box, setBox] = useState(50);
  const [total, setTotal] = useState(350);
  const max = Math.floor((cap - crew) / box), trips = max > 0 ? Math.ceil(total / max) : 0;
  return <div className="space-y-3">
    <div className="grid gap-2 sm:grid-cols-2"><Stepper label="Daya angkut (kg)" value={cap} set={setCap} min={1000} max={3000} step={100} /><Stepper label="Berat awak (kg)" value={crew} set={setCrew} min={50} max={300} step={10} />
      <Stepper label="Berat kotak (kg)" value={box} set={setBox} min={10} max={100} step={5} /><Stepper label="Banyak kotak" value={total} set={setTotal} min={50} max={500} step={10} /></div>
    <ol className="list-decimal space-y-1 rounded-xl bg-base-100 py-3 pe-3 ps-8 text-base">
      <li>{idn(crew)} + {box}x ≤ {idn(cap)}</li>
      <li>{box}x ≤ {idn(cap - crew)}</li>
      <li>x ≤ {idn(Math.round(((cap - crew) / box) * 100) / 100)}, jadi paling banyak <strong>{max} kotak</strong> sekali jalan</li>
      <li>{total} : {max} ≈ {idn(Math.round((total / max) * 100) / 100)}, dibulatkan ke atas: <strong>{trips} kali</strong></li>
    </ol>
    <Result value={`${max}|${trips}`}>Sekali jalan paling banyak {max} kotak (dibulatkan ke bawah). Untuk {total} kotak dibutuhkan {trips} kali pengangkutan (dibulatkan ke atas).</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { open: OpenLab, hp: HpLab, form: FormLab, balance: BalanceLab, steps: StepsLab, story: StoryLab, symbols: SymbolsLab, speed: SpeedLab, flip: FlipLab, solve: SolveLab, truck: TruckLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-32" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 14))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const label = "label" in p && p.label ? <span className="font-bold"><M text={p.label} /></span> : null;
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{label}{p.pre && <span className="font-semibold">{p.pre}</span>}<In label={plain(p.label)} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{label}
      {p.pics ? <div className="grid gap-2 sm:grid-cols-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex items-center gap-2 rounded-2xl border-4 bg-base-100 p-2 text-left ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="font-extrabold">{op}.</span><span className="min-w-0 flex-1"><SceneView scene={p.pics![k]} /></span></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Kalimat ${plain(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "set": { const picked = sortedSet(value);
      const toggle = (n: number) => { const s = picked.includes(n) ? picked.filter(y => y !== n) : [...picked, n]; set(s.sort((a, b) => a - b).join(",")); };
      return <div className="space-y-2"><p className="text-lg font-bold">{label} {"{"}{picked.join(", ")}{"}"}</p>
        <div role="group" aria-label={`Bilangan asli 1 sampai ${p.max}`} className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">{Array.from({ length: p.max }, (_, k) => k + 1).map(n => <button key={n} type="button" disabled={checked} aria-pressed={picked.includes(n)} aria-label={`Bilangan ${n}`} onClick={() => toggle(n)} className={`h-9 rounded-lg border-2 text-sm font-bold ${picked.includes(n) ? "border-success bg-success text-success-content" : "border-base-300 bg-base-100"}`}>{n}</button>)}</div></div>; }
    case "ineq": return <div className="flex flex-wrap items-center gap-2">{label}<span className="text-2xl font-extrabold">{p.v}</span>
      <span role="radiogroup" aria-label={`${plain(p.label)} tanda`} className="join">{SIGNS.map(s => <button key={s} type="button" role="radio" aria-checked={x[0] === s} aria-label={s} disabled={checked} onClick={() => put(0, s)} className={`btn join-item btn-sm w-10 text-lg ${x[0] === s ? "btn-success" : "btn-outline"}`}>{s}</button>)}</span>
      <In label={`${plain(p.label)} batas`} value={x[1]} set={v => put(1, v)} disabled={checked} w="w-24" /></div>;
    case "build": { const used = value ? value.split(",").map(Number) : [];
      const add = (k: number) => set([...used, k].join(",")); const back = () => set(used.slice(0, -1).join(","));
      return <div className="space-y-2">{label}
        <p aria-live="polite" className="min-h-12 rounded-xl border-2 border-dashed border-success/50 bg-base-100 px-3 py-2 text-xl font-extrabold">{builtText(p, value) || <span className="text-sm font-normal text-base-content/50">Ketuk ubin di bawah secara berurutan.</span>}</p>
        <div role="group" aria-label={`Ubin ${plain(p.label)}`} className="flex flex-wrap gap-1.5">{p.tiles.map((t, k) => <button key={t} type="button" aria-label={`Ubin ${t}`} disabled={checked || used.includes(k)} onClick={() => add(k)} className="btn btn-sm min-w-10 border-2 border-warning bg-warning/20 text-base font-extrabold">{t}</button>)}
          <button type="button" aria-label="Hapus ubin terakhir" disabled={checked || !used.length} onClick={back} className="btn btn-sm btn-ghost gap-1"><Delete className="size-4" aria-hidden="true" />Hapus</button></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: LQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeEightLinear() {
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
    <p className="text-sm font-semibold text-success">Kelas 8, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Persamaan dan Pertidaksamaan Linier Satu Variabel</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Dari kalimat terbuka sampai himpunan penyelesaian: menyusun model, menyelesaikan persamaan dengan prinsip timbangan, dan menyelesaikan pertidaksamaan beserta garis bilangannya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><BalanceView left={{ box: 2, unit: 4 }} right={{ unit: 8 }} className="w-40" label="" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Mencari nilai yang belum diketahui</h2>
        <p className="mt-2 text-sm">Berapa harga sepasang sandal? Berapa kotak yang muat di mobil pick up? Pertanyaan seperti ini dijawab dengan menuliskan kalimat matematika lalu menyelesaikannya langkah demi langkah.</p>
        <p className="mt-2 text-sm text-base-content/60">{total} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-linier">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-linier" className="mt-8 scroll-mt-20">
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
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
