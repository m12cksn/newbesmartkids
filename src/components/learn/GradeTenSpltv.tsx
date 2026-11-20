"use client";

import { ArrowLeft, ArrowRight, Check, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { QuizFitLayout } from "./QuizFitLayout";
import { M, plainMath, Sack, SceneView, SystemView } from "./GradeTenSpltvArt";
import {
  assessment, cells, ciriSystems, ciriTriples, correct, det3, detMatrix, elimPresets, eqText, fertilizer, fmt, formatAnswer, idn, kindOf, num, practice,
  ready, sarrusPresets, sections, SEP, side, solve3, splitParts, topics, type Part, type PQuestion, type Row,
} from "@/data/grade-ten-spltv";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-8 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm normal-case ${value === o ? "btn-success" : "btn-outline"}`}><M text={o} /></button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const Mark = ({ ok, children }: { ok: boolean; children: ReactNode }) => <li className="flex items-start gap-2">{ok ? <Check className="mt-1 size-4 shrink-0 text-success" strokeWidth={2} aria-label="terpenuhi" /> : <X className="mt-1 size-4 shrink-0 text-error" strokeWidth={2} aria-label="belum" />}<span>{children}</span></li>;
const tripleText = (v: number[]) => `(${v.map(fmt).join(", ")})`;

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const sackColors = ["#2f9e44", "#1c7ed6", "#e8590c"];
function ModelLab() {
  const [v, setV] = useState([10, 10, 10]);
  const set = (k: number) => (n: number) => setV(x => x.map((y, j) => (j === k ? n : y)));
  const [x, y, z] = v, cost = fertilizer.prices.reduce((s, p, k) => s + p * v[k], 0);
  const checks = [x + y + z === fertilizer.total, x === 2 * y, cost === fertilizer.budget];
  const ok = checks.filter(Boolean).length;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Urea (x)" value={x} set={set(0)} min={0} max={36} /><Stepper label="SS (y)" value={y} set={set(1)} min={0} max={36} /><Stepper label="TSP (z)" value={z} set={set(2)} min={0} max={36} /></div>
    <Pair>
      <div className="space-y-2" aria-label="Tumpukan karung pupuk">{["Urea", "SS", "TSP"].map((t, k) => <div key={t}>
        <p className="text-xs font-semibold">{t}: {v[k]} karung, Rp{idn(fertilizer.prices[k] * 1000)} per karung</p>
        <div className="flex flex-wrap gap-0.5" aria-hidden="true">{Array.from({ length: v[k] }, (_, i) => <Sack key={i} color={sackColors[k]} size={14} />)}</div></div>)}</div>
      <ul className="space-y-1.5 text-sm leading-6">
        <Mark ok={checks[0]}><M text={`x + y + z = 36 (sekarang ${x + y + z})`} /></Mark>
        <Mark ok={checks[1]}><M text={`x = 2y (sekarang ${x} dan 2 × ${y} = ${2 * y})`} /></Mark>
        <Mark ok={checks[2]}><M text={`8x + 11y + 14z = 384, artinya dana Rp3.840.000 (sekarang Rp${idn(cost * 1000)})`} /></Mark>
      </ul>
    </Pair>
    <Result value={`${x}|${y}|${z}|${ok}`}>{ok === 3 ? `(x, y, z) = (${x}, ${y}, ${z}) memenuhi ketiga persamaan. Inilah penyelesaian sistemnya.` : `${ok} dari 3 syarat terpenuhi. Triple (${x}, ${y}, ${z}) belum menjadi penyelesaian.`}</Result>
  </div>;
}

function KerjaLab() {
  const [a, setA] = useState(12); const [b, setB] = useState(15); const [c, setC] = useState(20);
  const p = (1 / a + 1 / b - 1 / c) / 2, q = (1 / a - 1 / b + 1 / c) / 2, r = (-1 / a + 1 / b + 1 / c) / 2, sum = p + q + r;
  const okRates = [p, q, r].every(t => t > 1e-9), T = 1 / sum;
  const people = [["Pak Wayan", p, "#2f9e44"], ["Putu", q, "#1c7ed6"], ["I Gede", r, "#e8590c"]] as const;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Wayan dan Putu (hari)" value={a} set={setA} min={2} max={30} /><Stepper label="Wayan dan I Gede (hari)" value={b} set={setB} min={2} max={30} /><Stepper label="Putu dan I Gede (hari)" value={c} set={setC} min={2} max={30} /></div>
    <Pair>
      <div className="space-y-2">
        <p className="text-xs font-semibold">Bagian pesanan yang selesai dalam 1 hari jika bertiga</p>
        {okRates ? <div className="flex h-8 w-full overflow-hidden rounded border border-base-300" aria-label="Pembagian kerja per hari">{people.map(([nm, v, col]) => <div key={nm} style={{ width: `${(v / sum) * 100}%`, background: col }} title={nm} />)}</div> : <p className="text-sm text-error">Data ini tidak mungkin: ada kecepatan kerja yang negatif.</p>}
        <ul className="space-y-0.5 text-sm">{people.map(([nm, v, col]) => <li key={nm} className="flex items-center gap-2"><span className="inline-block size-3 rounded-sm" style={{ background: col }} aria-hidden="true" />{nm}: {okRates ? <>{idn(Math.round(v * 10000) / 10000)} bagian per hari, sendirian {idn(Math.round((1 / v) * 100) / 100)} hari</> : "—"}</li>)}</ul>
      </div>
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li><M text={`p + q = {1/${a}}, p + r = {1/${b}}, q + r = {1/${c}}`} /></li>
        <li><M text={`2(p + q + r) = {1/${a}} + {1/${b}} + {1/${c}}`} /></li>
        <li><M text={`p + q + r = ${idn(Math.round(sum * 10000) / 10000)}`} /></li>
        <li>Waktu bertiga = 1 : (p + q + r)</li>
      </ol>
    </Pair>
    <Result value={`${a}|${b}|${c}|${okRates ? Math.round(T * 100) / 100 : "x"}`}>{okRates ? `Bertiga, pesanan selesai dalam ${idn(Math.round(T * 100) / 100)} hari.` : "Ubah lama kerja pasangan: setiap orang harus punya kecepatan kerja positif."}</Result>
  </div>;
}

function CiriLab() {
  const [name, setName] = useState("S"); const [t, setT] = useState(1);
  const sys = ciriSystems.find(s => s.name === name)!, triple = ciriTriples[t];
  const homog = !!sys.rows && sys.rows.every(r => r[3] === 0);
  const okRows = sys.rows?.map(r => r[0] * triple[0] + r[1] * triple[1] + r[2] * triple[2] === r[3]);
  const kind = sys.rows ? kindOf(sys.rows) : null;
  return <div className="space-y-3">
    <Radios label="Sistem" options={ciriSystems.map(s => s.name)} value={name} set={setName} />
    <div role="radiogroup" aria-label="Triple yang diuji" className="flex flex-wrap gap-1.5">{ciriTriples.map((v, k) => <button key={k} type="button" role="radio" aria-checked={t === k} onClick={() => setT(k)} className={`btn btn-sm ${t === k ? "btn-success" : "btn-outline"}`}>{tripleText(v)}</button>)}</div>
    <Pair>
      <SystemView rows={sys.rows ? sys.rows.map(r => eqText(r)) : sys.text} />
      <div className="space-y-2 text-sm leading-6">
        <ul className="space-y-1"><Mark ok={sys.linear}>Setiap persamaan linear</Mark><Mark ok={sys.linked}>Tiga variabel yang sama dan saling terkait</Mark><Mark ok={homog}>Semua konstanta nol (homogen)</Mark></ul>
        {okRows ? <><p className="font-semibold">Uji {tripleText(triple)}</p><ul className="space-y-1">{okRows.map((ok, k) => <Mark key={k} ok={ok}>Persamaan ({k + 1})</Mark>)}</ul></> : <p className="text-base-content/70">Sistem ini bukan SPLTV, jadi tidak diuji dengan triple (x, y, z).</p>}
      </div>
    </Pair>
    <Result value={`${name}|${tripleText(triple)}|${okRows ? okRows.filter(Boolean).length : "-"}`}>
      {!sys.linear ? "Bukan SPLTV: ada persamaan yang tidak linear dan variabelnya tidak saling terkait." : `SPLTV${homog ? " homogen" : ""}. ${kind === "satu" ? (homog ? "Hanya mempunyai penyelesaian trivial (0, 0, 0)." : `Penyelesaiannya ${tripleText(solve3(sys.rows!)!)}.`) : "Mempunyai tak hingga banyak penyelesaian, termasuk penyelesaian nontrivial."} Triple ${tripleText(triple)} memenuhi ${okRows!.filter(Boolean).length} dari 3 persamaan.`}
    </Result>
  </div>;
}

/** Langkah eliminasi untuk sistem dengan penyelesaian tunggal, dimulai dari variabel v. */
function elimSteps(rows: Row[], v: number): string[] {
  const V = "xyz", g = (r: number[]) => { const d = r.reduce((a, x) => (x ? (a ? gcdN(a, Math.abs(x)) : Math.abs(x)) : a), 0) || 1; const s = r.find(x => x !== 0)! < 0 ? -1 : 1; return r.map(x => (x * s) / d); };
  const [u, w] = [0, 1, 2].filter(k => k !== v), i0 = rows.findIndex(r => r[v] !== 0), out: string[] = [], made: Row[] = [];
  rows.forEach((r, j) => { if (j === i0) return;
    if (r[v] === 0) { made.push(r); out.push(`Persamaan (${j + 1}) tidak memuat ${V[v]}: ${eqText(r)}. Sebut persamaan (${3 + made.length}).`); return; }
    const nr = g(r.map((x, k) => rows[i0][v] * x - r[v] * rows[i0][k])); made.push(nr);
    out.push(`Hilangkan ${V[v]}: (${j + 1}) × ${idn(rows[i0][v])} − (${i0 + 1}) × ${idn(r[v])} menghasilkan ${eqText(nr)}. Sebut persamaan (${3 + made.length}).`); });
  const [F1, F2] = made; let wv: number;
  if (F1[u] === 0) wv = F1[3] / F1[w]; else if (F2[u] === 0) wv = F2[3] / F2[w];
  else { const G = g(F1.map((x, k) => F2[u] * x - F1[u] * F2[k])); wv = G[3] / G[w]; out.push(`Hilangkan ${V[u]} dari (4) dan (5): ${eqText(G)}.`); }
  out.push(`Jadi ${V[w]} = ${fmt(wv)}.`);
  const F = F1[u] !== 0 ? F1 : F2, uv = (F[3] - F[w] * wv) / F[u];
  out.push(`Substitusikan ${V[w]} = ${fmt(wv)} ke (${F === F1 ? 4 : 5}): ${V[u]} = ${fmt(uv)}.`);
  const R = rows[i0], vals = [0, 0, 0]; vals[u] = uv; vals[w] = wv; vals[v] = (R[3] - R[u] * uv - R[w] * wv) / R[v];
  out.push(`Substitusikan ke (${i0 + 1}): ${V[v]} = ${fmt(vals[v])}. Penyelesaian (x, y, z) = ${tripleText(vals)}.`);
  return out;
}
const gcdN = (a: number, b: number): number => (b ? gcdN(b, a % b) : a);
function EliminasiLab() {
  const [k, setK] = useState(elimPresets[0].name); const [v, setV] = useState<"x" | "y" | "z">("x"); const [shown, setShown] = useState(1);
  const rows = elimPresets.find(p => p.name === k)!.rows, steps = elimSteps(rows, "xyz".indexOf(v));
  return <div className="space-y-3">
    <Radios label="Sistem" options={elimPresets.map(p => p.name)} value={k} set={x => { setK(x); setShown(1); }} />
    <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold">Hilangkan dulu</span><Radios label="Variabel pertama" options={["x", "y", "z"] as const} value={v} set={x => { setV(x); setShown(1); }} /></div>
    <Pair>
      <SystemView rows={rows.map(r => eqText(r))} />
      <div className="space-y-2"><ol className="list-decimal space-y-1 ps-5 text-sm leading-7">{steps.slice(0, shown).map(s => <li key={s}><M text={s} /></li>)}</ol>
        <div className="flex gap-2"><button type="button" className="btn btn-sm btn-success gap-1" disabled={shown >= steps.length} onClick={() => setShown(s => s + 1)}>Langkah berikutnya<ChevronRight className="size-4" aria-hidden="true" /></button>
          <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setShown(1)}><RotateCcw className="size-3.5" aria-hidden="true" />Ulang</button></div></div>
    </Pair>
    <Result value={`${k}|${v}|${shown}/${steps.length}`}>{shown >= steps.length ? <M text={steps[steps.length - 1]} /> : `Langkah ${shown} dari ${steps.length}. Lanjutkan sampai ketiga nilai ditemukan.`}</Result>
  </div>;
}

const which = ["D", "Dx", "Dy", "Dz"] as const;
function SarrusLab() {
  const [k, setK] = useState(sarrusPresets[0].name); const [d, setD] = useState<(typeof which)[number]>("D");
  const rows = sarrusPresets.find(p => p.name === k)!.rows, col = d === "D" ? null : "xyz".indexOf(d[1]), m = detMatrix(rows, col), val = det3(m);
  const ext = m.map(r => [...r, r[0], r[1]]), plus = [0, 1, 2].map(s => [0, 1, 2].map(i => ext[i][s + i])), minus = [0, 1, 2].map(s => [0, 1, 2].map(i => ext[i][s + 2 - i]));
  const prod = (a: number[]) => a.reduce((x, y) => x * y, 1), sp = plus.reduce((s, a) => s + prod(a), 0), sm = minus.reduce((s, a) => s + prod(a), 0);
  const cw = 46, ch = 30, X = (j: number) => 20 + j * cw, Y = (i: number) => 22 + i * ch;
  const D0 = det3(detMatrix(rows, null));
  return <div className="space-y-3">
    <Radios label="Sistem" options={sarrusPresets.map(p => p.name)} value={k} set={setK} />
    <Radios label="Determinan" options={which} value={d} set={setD} />
    <Pair>
      <div className="space-y-2"><SystemView rows={rows.map(r => eqText(r))} />
        <svg viewBox={`0 0 ${20 + 5 * cw} ${30 + 3 * ch}`} className="w-full max-w-xs" role="img" aria-label={`Aturan Sarrus untuk ${d}: ${m.map(r => r.map(idn).join(" ")).join("; ")}`}>
          {col !== null && [col, ...(col < 2 ? [col + 3] : [])].map(j => <rect key={j} x={X(j) - cw / 2 + 3} y="6" width={cw - 6} height={3 * ch} rx="5" fill="#fff3bf" />)}
          {[0, 1, 2].map(s => <line key={`p${s}`} x1={X(s) - 8} y1={Y(0) - 10} x2={X(s + 2) + 8} y2={Y(2) + 4} stroke="#2f9e44" strokeWidth="1.3" />)}
          {[0, 1, 2].map(s => <line key={`m${s}`} x1={X(s + 2) + 8} y1={Y(0) - 10} x2={X(s) - 8} y2={Y(2) + 4} stroke="#e8590c" strokeWidth="1.3" strokeDasharray="4 3" />)}
          {ext.map((r, i) => r.map((v, j) => <g key={`${i}${j}`}><rect x={X(j) - 15} y={Y(i) - 12} width="30" height="16" rx="4" fill={(j === col || j === (col ?? -9) + 3) ? "#fff3bf" : "#fff"} />
            <text x={X(j)} y={Y(i)} textAnchor="middle" fontSize="12" fontWeight="600" fill={j > 2 ? "#868e96" : "#1f3b30"}>{idn(v)}</text></g>))}
          <line x1={X(2) + cw / 2} x2={X(2) + cw / 2} y1="6" y2={6 + 3 * ch} stroke="#adb5bd" strokeDasharray="2 3" />
        </svg></div>
      <div className="space-y-1 text-sm leading-7">
        <p><span className="font-semibold text-success">Garis penuh:</span> {plus.map(a => `(${a.map(idn).join(")(")})`).join(" + ")} = {idn(sp)}</p>
        <p><span className="font-semibold text-warning-content">Garis putus-putus:</span> {minus.map(a => `(${a.map(idn).join(")(")})`).join(" + ")} = {idn(sm)}</p>
        <p className="font-bold">{d} = {idn(sp)} − ({idn(sm)}) = {idn(val)}</p>
        {d !== "D" && D0 !== 0 && <p><M text={`${d[1]} = {${d}/D} = ${idn(val)} : ${idn(D0)} = ${fmt(val / D0)}`} /></p>}
      </div>
    </Pair>
    <Result value={`${k}|${d}|${val}`}><M text={`${d} = ${idn(val)}${d !== "D" && D0 ? `, sehingga ${d[1]} = ${fmt(val / D0)}` : D0 ? `. Karena D ≠ 0, sistem mempunyai tepat satu penyelesaian.` : ""}`} /></Result>
  </div>;
}

function JenisLab() {
  const [t, setT] = useState(0);
  const a = t * t - 9, b = t - 3, type = a !== 0 ? "satu" : b === 0 ? "banyak" : "tidak", z = a !== 0 ? b / a : 0;
  return <div className="space-y-3">
    <Stepper label="t" value={t} set={setT} min={-6} max={6} />
    <Pair>
      <SystemView rows={["x + y + z = 6", "x − y + z = 2", `(t^{2} − 9)z = t − 3`]} caption={`Untuk t = ${idn(t)}: ${idn(a)}z = ${idn(b)}`} />
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li>(1) − (2): 2y = 4, jadi y = 2 dan x + z = 4.</li>
        <li><M text={`Persamaan (3): ${idn(a)} · z = ${idn(b)}.`} /></li>
        <li><M text={type === "satu" ? `Koefisien z tidak nol: z = ${fmt(z)}, x = ${fmt(4 - z)}.` : type === "banyak" ? "0 · z = 0 benar untuk semua z, jadi z bebas dan x = 4 − z." : `0 · z = ${idn(b)} adalah pernyataan salah.`} /></li>
      </ol>
    </Pair>
    <Result value={`${t}|${type}`}><M text={type === "satu" ? `t = ${idn(t)}: tepat satu penyelesaian, (x, y, z) = (${fmt(4 - z)}, 2, ${fmt(z)}).` : type === "banyak" ? `t = ${idn(t)}: tak hingga banyak penyelesaian, misalnya (4, 2, 0), (3, 2, 1), dan seterusnya.` : `t = ${idn(t)}: tidak ada penyelesaian.`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { model: ModelLab, kerja: KerjaLab, ciri: CiriLab, eliminasi: EliminasiLab, sarrus: SarrusLab, jenis: JenisLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-20" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="text" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function SystemInput({ p, value, set, checked }: { p: Extract<Part, { kind: "system" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  return <div role="group" aria-label={plainMath(p.label)} className="space-y-2"><p className="font-bold"><M text={p.label} /></p>
    {[0, 1, 2].map(r => { const nums = x.slice(r * 4, r * 4 + 4).map(num), full = nums.every(v => !Number.isNaN(v));
      return <div key={r} className="space-y-0.5"><div className="flex flex-wrap items-center gap-1 text-base"><span className="w-8 text-xs text-base-content/50">({r + 1})</span>
        {[0, 1, 2].map(j => <span key={j} className="inline-flex items-center gap-1">{j > 0 && <span>+</span>}<In label={`Persamaan ${r + 1} koefisien ${p.vars[j]}`} value={x[r * 4 + j]} set={v => put(r * 4 + j, v)} disabled={checked} w="w-14" /><span className="italic">{p.vars[j]}</span></span>)}
        <span>=</span><In label={`Persamaan ${r + 1} konstanta`} value={x[r * 4 + 3]} set={v => put(r * 4 + 3, v)} disabled={checked} w="w-16" /></div>
        {full && <p className="ps-9 text-xs text-base-content/60">Terbaca: <M text={`${side(nums, p.vars)} = ${idn(nums[3])}`} /></p>}</div>; })}
    <p className="text-xs text-base-content/60">Variabel yang tidak ada diisi 0. Koefisien negatif ditulis dengan minus, misalnya −2.</p>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "triple": return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><p className="font-bold"><M text={p.label} /></p>
      <div className="flex flex-wrap items-end gap-2">{p.names.map((nm, k) => <label key={nm} className="flex flex-col items-center gap-0.5 text-xs font-semibold"><span>{nm}</span><In label={`${plainMath(p.label)} ${nm}`} value={x[k]} set={v => put(k, v)} disabled={checked} w="w-24" /></label>)}{p.unit && <span className="pb-2 font-semibold">{p.unit}</span>}</div></div>;
    case "system": return <SystemInput p={p} value={value} set={set} checked={checked} />;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTenSpltv() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 10, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Sistem Persamaan Linear Tiga Variabel</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menyusun model dari masalah sehari-hari, mengenali ciri SPLTV, lalu menyelesaikannya dengan eliminasi, substitusi, dan determinan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-2">{sackColors.map((c, k) => <Sack key={c} color={c} size={44} label={["U", "SS", "T"][k]} />)}</div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Tiga hal belum diketahui, tiga informasi tersedia</h2>
        <p className="mt-2 text-sm">Banyak karung tiga jenis pupuk, harga tiga barang belanjaan, atau lama kerja tiga orang: jika ada tiga informasi yang saling terkait, ketiganya bisa ditemukan bersamaan.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-spltv">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-spltv" className="mt-8 scroll-mt-20">
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
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderAnswer={(q, value, record, checked) => <QuizFitLayout visual={q.scene ? <SceneView key={q.prompt} scene={q.scene} /> : null}><Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} /></QuizFitLayout>}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
