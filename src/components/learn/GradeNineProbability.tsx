"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw, Shuffle } from "lucide-react";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { BagView, DotsView, M, plainMath, RelView, SceneView, SpinnerView } from "./GradeNineProbabilityArt";
import {
  assessment, cells, correct, formatAnswer, fracText, heights, idn, listOf, practice, ready, rng, sections, SEP, splitParts, topics,
  type Part, type PQuestion,
} from "@/data/grade-nine-probability";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1 }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  const go = (d: number) => { const v = value + d; if (v >= min && v <= max) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,16rem)_1fr]">{children}</div>;
const Steps = ({ lines }: { lines: string[] }) => <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">{lines.map(l => <li key={l}><M text={l} /></li>)}</ol>;
const pct = (a: number, b: number) => idn(Math.round((a / b) * 10000) / 100);

/* ---------- Diagram pohon koin ---------- */
export function CoinTree({ k, mark = () => false, onPick, picked = [] }: { k: number; mark?: (s: string) => boolean; onPick?: (s: string) => void; picked?: string[] }) {
  const leaves = 2 ** k, H = leaves * 22 + 10, W = 60 + k * 60 + 70;
  const nodes: { s: string; x: number; y: number }[] = [];
  const place = (s: string, d: number, lo: number, hi: number) => { const y = (lo + hi) / 2; if (d > 0) nodes.push({ s, x: 20 + d * 60, y }); if (d < k) { place(`${s}A`, d + 1, lo, y); place(`${s}G`, d + 1, y, hi); } };
  place("", 0, 5, H - 5);
  const pos = new Map(nodes.map(nd => [nd.s, nd]));
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role={onPick ? "group" : "img"} aria-label={`Diagram pohon pelemparan ${k} koin`}>
    {nodes.map(nd => { const parent = nd.s.length > 1 ? pos.get(nd.s.slice(0, -1))! : { x: 20, y: H / 2 }; return <line key={`l${nd.s}`} x1={parent.x + 8} y1={parent.y} x2={nd.x - 8} y2={nd.y} stroke="#adb5bd" />; })}
    {nodes.map(nd => <text key={nd.s} x={nd.x} y={nd.y + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill={nd.s.endsWith("A") ? "#1c64b5" : "#c2410c"}>{nd.s.at(-1)}</text>)}
    {nodes.filter(nd => nd.s.length === k).map(nd => { const on = picked.includes(nd.s) || mark(nd.s), act = () => onPick?.(nd.s), lx = 20 + k * 60 + 22;
      return <g key={`o${nd.s}`} {...(onPick ? { role: "button", tabIndex: 0, "aria-pressed": on, "aria-label": `Hasil ${nd.s}`, onClick: act, onKeyDown: (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }, className: "cursor-pointer" } : {})}>
        <rect x={lx - 4} y={nd.y - 10} width={k * 14 + 18} height="19" rx="4" fill={on ? "#b2f2bb" : "#f1f3f5"} stroke={on ? "#2b8a3e" : "#ced4da"} />
        <text x={lx + 5} y={nd.y + 4} fontSize="11" fontWeight="700" fill="#1f3b30">({[...nd.s].join(", ")})</text></g>; })}
  </svg>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const exps = ["Dua koin", "Tiga koin", "Dua dadu"] as const;
const conds = ["Tepat", "Minimal"] as const;
function SpaceLab() {
  const [exp, setExp] = useState<(typeof exps)[number]>("Dua koin");
  const [g, setG] = useState(1);
  const [cond, setCond] = useState<(typeof conds)[number]>("Tepat");
  const [sum, setSum] = useState(7);
  const k = exp === "Dua koin" ? 2 : 3, gg = Math.min(g, k);
  const coinHit = (s: string) => { const c = [...s].filter(x => x === "G").length; return cond === "Tepat" ? c === gg : c >= gg; };
  const nS = exp === "Dua dadu" ? 36 : 2 ** k;
  let nA = 0; if (exp === "Dua dadu") { for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === sum) nA++; } else { for (let i = 0; i < nS; i++) if (coinHit(i.toString(2).padStart(k, "0").replace(/0/g, "A").replace(/1/g, "G"))) nA++; }
  return <div className="space-y-3">
    <Radios label="Percobaan" options={exps} value={exp} set={setExp} />
    {exp === "Dua dadu" ? <Stepper label="Jumlah mata dadu" value={sum} set={setSum} min={2} max={12} />
      : <div className="flex flex-wrap items-center gap-3"><Radios label="Syarat" options={conds} value={cond} set={setCond} /><Stepper label="banyak sisi gambar (G)" value={gg} set={setG} min={0} max={k} /></div>}
    <Pair>{exp === "Dua dadu" ? <div className="overflow-x-auto"><table className="border-collapse text-center text-xs"><thead><tr><th className="p-1">+</th>{[1, 2, 3, 4, 5, 6].map(b => <th key={b} className="p-1 text-info">{b}</th>)}</tr></thead>
      <tbody>{[1, 2, 3, 4, 5, 6].map(a => <tr key={a}><th className="p-1 text-info">{a}</th>{[1, 2, 3, 4, 5, 6].map(b => <td key={b} className={`h-7 w-7 border border-base-300 ${a + b === sum ? "bg-success/30 font-extrabold" : ""}`}>{a + b}</td>)}</tr>)}</tbody></table></div>
      : <CoinTree k={k} mark={coinHit} />}
      <Steps lines={[`n(S) = ${nS}`, exp === "Dua dadu" ? `Kejadian jumlah ${sum}: ${nA} pasangan` : `Kejadian ${cond.toLowerCase()} ${gg} sisi G: ${nA} hasil`, `P = ${fracText(nA, nS)}`]} /></Pair>
    <Result value={`${exp}|${nS}|${nA}`}>Ruang sampel mempunyai {nS} anggota; kejadian yang dipilih mempunyai {nA} anggota{nA === 0 ? " (kejadian mustahil)" : nA === nS ? " (kejadian pasti)" : ""}.</Result>
  </div>;
}

const colors = ["Merah", "Kuning", "Hijau"] as const;
const hex = { Merah: "#e03131", Kuning: "#f2b705", Hijau: "#2f9e44" };
function BagLab() {
  const [cnt, setCnt] = useState({ Merah: 5, Kuning: 3, Hijau: 2 });
  const [pick, setPick] = useState<(typeof colors)[number]>("Kuning");
  const total = cnt.Merah + cnt.Kuning + cnt.Hijau, a = cnt[pick];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3">{colors.map(c => <Stepper key={c} label={`Bola ${c.toLowerCase()}`} value={cnt[c]} set={v => setCnt(o => ({ ...o, [c]: v }))} min={0} max={8} />)}</div>
    <Radios label="Warna yang diambil" options={colors} value={pick} set={setPick} />
    <Pair><BagView balls={colors.map(c => ({ color: hex[c], name: c.toLowerCase(), count: cnt[c] }))} />
      {total ? <Steps lines={[`n(S) = ${total}, n(${pick.toLowerCase()}) = ${a}`, `P(${pick.toLowerCase()}) = ${fracText(a, total)} = ${idn(Math.round((a / total) * 1000) / 1000)} = ${pct(a, total)}%`, `P(bukan ${pick.toLowerCase()}) = 1 − P = ${fracText(total - a, total)}`]} /> : <p className="text-sm">Kantong kosong. Tambahkan bola.</p>}</Pair>
    <Result value={`${pick}|${a}|${total}`}>{!total ? "Tidak ada percobaan tanpa bola." : a === 0 ? `Mustahil mengambil bola ${pick.toLowerCase()}: peluangnya 0.` : a === total ? `Pasti mendapat bola ${pick.toLowerCase()}: peluangnya 1.` : `Peluang mengambil bola ${pick.toLowerCase()} ${pct(a, total)}%.`}</Result>
  </div>;
}

const emp = { "Koin: sisi angka": { p: 0.5, sides: 2 }, "Dadu: mata 6": { p: 1 / 6, sides: 6 } } as const;
type EK = keyof typeof emp;
function EmpirisLab() {
  const [e, setE] = useState<EK>("Koin: sisi angka");
  const [series, setSeries] = useState<number[]>([]);
  const [gen] = useState(() => ({ r: rng(2025) }));
  const add = (m: number) => setSeries(s => { const out = [...s]; let k = Math.round((s.at(-1) ?? 0) * s.length); for (let i = 0; i < m; i++) { if (gen.r() < emp[e].p) k++; out.push(k / (out.length + 1)); } return out; });
  const n = series.length, k = Math.round((series.at(-1) ?? 0) * n);
  return <div className="space-y-3">
    <Radios label="Percobaan" options={Object.keys(emp) as EK[]} value={e} set={v => { setE(v); setSeries([]); }} />
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-success" onClick={() => add(10)}>Lempar 10 kali</button><button type="button" className="btn btn-sm btn-success" onClick={() => add(100)}>Lempar 100 kali</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!n} onClick={() => setSeries([])}><RotateCcw className="size-3.5" aria-hidden="true" />Ulang</button></div>
    <Pair><RelView series={series} title={`Frekuensi relatif ${e.toLowerCase()}`} target={emp[e].p} />
      <Steps lines={[`Percobaan: ${n}, kejadian muncul ${k} kali`, n ? `Frekuensi relatif = ${fracText(k, n)} ≈ ${idn(Math.round((k / n) * 1000) / 1000)}` : "Belum ada percobaan.", `Peluang teoretis = ${emp[e].p === 0.5 ? "{1/2}" : "{1/6}"} ≈ ${idn(Math.round(emp[e].p * 1000) / 1000)} (garis hijau)`]} /></Pair>
    <Result value={`${e}|${n}`}>{n < 30 ? "Dengan sedikit percobaan, frekuensi relatif masih naik turun." : `Setelah ${n} percobaan, frekuensi relatif ${idn(Math.round((k / n) * 1000) / 1000)} makin dekat ke peluang teoretis.`}</Result>
  </div>;
}

function HarapanLab() {
  const [cnt, setCnt] = useState({ Merah: 3, Kuning: 2, Hijau: 1 });
  const [N, setN] = useState(60);
  const [pick, setPick] = useState<(typeof colors)[number]>("Kuning");
  const [sim, setSim] = useState<number | null>(null);
  const total = cnt.Merah + cnt.Kuning + cnt.Hijau, fh = total ? (cnt[pick] / total) * N : 0;
  const sectors = colors.flatMap(c => Array.from({ length: cnt[c] }, () => ({ color: hex[c], label: c.toLowerCase() })));
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3">{colors.map(c => <Stepper key={c} label={`Juring ${c.toLowerCase()}`} value={cnt[c]} set={v => { setCnt(o => ({ ...o, [c]: v })); setSim(null); }} min={c === "Merah" ? 1 : 0} max={5} />)}<Stepper label="Putaran" value={N} set={v => { setN(v); setSim(null); }} min={30} max={300} step={30} /></div>
    <Radios label="Warna yang diharapkan" options={colors} value={pick} set={v => { setPick(v); setSim(null); }} />
    <Pair><SpinnerView sectors={sectors} />
      <div className="space-y-2"><Steps lines={[`P(${pick.toLowerCase()}) = ${fracText(cnt[pick], total)}`, `Frekuensi harapan = ${fracText(cnt[pick], total)} × ${N} = ${idn(Math.round(fh * 100) / 100)}`]} />
        <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { const r = rng(N * 7 + cnt[pick]); let k = 0; for (let i = 0; i < N; i++) if (r() < cnt[pick] / total) k++; setSim(k); }}><Shuffle className="size-4" aria-hidden="true" />Simulasikan {N} putaran</button>
        {sim !== null && <p className="text-sm">Hasil simulasi: {pick.toLowerCase()} muncul <strong>{sim}</strong> kali (harapan {idn(Math.round(fh * 100) / 100)}).</p>}</div></Pair>
    <Result value={`${pick}|${Math.round(fh * 100) / 100}`}>Dari {N} putaran, warna {pick.toLowerCase()} diharapkan muncul sekitar {idn(Math.round(fh * 100) / 100)} kali. Hasil sebenarnya bisa sedikit berbeda.</Result>
  </div>;
}

const methods = ["5 terdepan", "Diundi acak", "Nomor acak lalu 4 berikutnya"] as const;
function SampelLab() {
  const [m, setM] = useState<(typeof methods)[number]>("5 terdepan");
  const [gen] = useState(() => ({ r: rng(99) }));
  const [idx, setIdx] = useState<number[]>([0, 1, 2, 3, 4]);
  const take = (mm: (typeof methods)[number]) => {
    if (mm === "5 terdepan") return [0, 1, 2, 3, 4];
    if (mm === "Diundi acak") { const pool = heights.map((_, i) => i); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(gen.r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; } return pool.slice(0, 5).sort((a, b) => a - b); }
    const s = Math.floor(gen.r() * (heights.length - 4)); return [s, s + 1, s + 2, s + 3, s + 4];
  };
  const sample = idx.map(i => heights[i]), mean = Math.round((sample.reduce((a, b) => a + b, 0) / 5) * 10) / 10, popMean = Math.round((heights.reduce((a, b) => a + b, 0) / heights.length) * 10) / 10;
  return <div className="space-y-3">
    <Radios label="Cara memilih sampel" options={methods} value={m} set={v => { setM(v); setIdx(take(v)); }} />
    <button type="button" className="btn btn-sm btn-success gap-1" onClick={() => setIdx(take(m))}><Shuffle className="size-4" aria-hidden="true" />Ambil sampel</button>
    <Pair><DotsView min={140} max={175} step={5} population={heights} sample={sample} label="Tinggi 40 siswa (cm), sampel ditandai" />
      <Steps lines={[`Nomor barisan terpilih: ${idx.map(i => i + 1).join(", ")}`, `Sampel: ${sample.join(", ")}`, `Rata-rata sampel ${idn(mean)} cm, rata-rata populasi ${idn(popMean)} cm`]} /></Pair>
    <Result value={`${m}|${mean}`}>{Math.abs(mean - popMean) <= 4 ? "Rata-rata sampel dekat dengan rata-rata populasi." : "Rata-rata sampel jauh dari rata-rata populasi: sampel ini bias."} Siswa berbaris dari yang terpendek, jadi mengambil yang terdepan atau berurutan cenderung bias.</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { space: SpaceLab, bag: BagLab, empiris: EmpirisLab, harapan: HarapanLab, sampel: SampelLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-28" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./%\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const toggle = (s: string) => { if (checked) return; const cur = listOf(value); set((cur.includes(s) ? cur.filter(c => c !== s) : [...cur, s]).join(";")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "prob": return <div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} /></div>
      <p className="text-xs text-base-content/60">Tulis sebagai pecahan (3/8), desimal (0,375), atau persen (37,5%).</p></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      {p.pics ? <div className="grid gap-2 sm:grid-cols-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-base-100 p-1.5 ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start font-extrabold">{op}.</span><SceneView scene={p.pics![k]} /></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "pickset": { const cur = listOf(value);
      return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><p className="font-bold"><M text={p.label} /></p>
        {p.tree ? <CoinTree k={p.tree} onPick={toggle} picked={cur} />
          : <div className="flex flex-wrap gap-2">{p.items.map(it => <button key={it} type="button" aria-label={`Hasil ${it}`} aria-pressed={cur.includes(it)} disabled={checked} onClick={() => toggle(it)} className={`btn btn-sm ${cur.includes(it) ? "btn-success" : "btn-outline"}`}>{it}</button>)}</div>}
        <div className="flex flex-wrap items-center gap-2 text-sm">Terpilih: <strong>{cur.length ? `{${cur.join(", ")}}` : "belum ada"}</strong><button type="button" disabled={checked || !cur.length} className="btn btn-xs btn-ghost gap-1" onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus</button></div></div>; }
    case "grid": { const cur = listOf(value);
      return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><p className="font-bold"><M text={p.label} /></p><p className="text-xs text-base-content/60">Baris: dadu pertama, kolom: dadu kedua. Ketuk setiap pasangan anggota kejadian.</p>
        <div className="overflow-x-auto"><table className="border-collapse text-center text-xs"><thead><tr><th className="p-1" />{[1, 2, 3, 4, 5, 6].map(b => <th key={b} className="p-1 text-info">{b}</th>)}</tr></thead>
          <tbody>{[1, 2, 3, 4, 5, 6].map(a => <tr key={a}><th className="p-1 text-info">{a}</th>{[1, 2, 3, 4, 5, 6].map(b => { const k = `${a},${b}`, on = cur.includes(k);
            return <td key={b} className="p-0.5"><button type="button" aria-label={`Pasangan (${a}, ${b})`} aria-pressed={on} disabled={checked} onClick={() => toggle(k)} className={`h-8 w-11 rounded border text-[0.7rem] font-semibold ${on ? "border-success bg-success text-success-content" : "border-base-300 bg-base-100"}`}>({a},{b})</button></td>; })}</tr>)}</tbody></table></div>
        <p className="text-sm">Terpilih: <strong>{cur.length}</strong> pasangan</p></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeNineProbability() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 9, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Peluang dan Pemilihan Sampel</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Menentukan ruang sampel dan peluang suatu kejadian, memperkirakan peluang dari percobaan berulang, menghitung frekuensi harapan, dan memilih sampel yang mewakili populasi.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-28"><SpinnerView sectors={[{ color: "#e03131", label: "" }, { color: "#f2b705", label: "" }, { color: "#2f9e44", label: "" }, { color: "#1c64b5", label: "" }]} cls="w-full" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Aturan mana yang lebih menguntungkan?</h2>
        <p className="mt-2 text-sm">Dalam gim lempar dua dadu, menang jika jumlahnya 7 jauh lebih mungkin daripada jika jumlahnya 11. Bab ini membahas cara menghitung seberapa mungkin suatu kejadian, dan cara memilih sampel yang adil.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-peluang">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-peluang" className="mt-8 scroll-mt-20">
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
