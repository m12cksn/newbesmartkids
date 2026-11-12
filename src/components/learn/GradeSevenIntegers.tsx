"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { AcPanel, BankBook, Dial, NumberLine, Thermometer, WeatherCard, type Arrow } from "./GradeSevenIntegersArt";
import {
  assessment, cells, correct, factorPairs, factorsOf, formatAnswer, gcd, int, isPrime, lcm, practice, primeExponents, ready, SEP, show, splitParts, topics,
  type IQuestion, type Part, type Scene,
} from "@/data/grade-seven-integers";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
/** Kotak bilangan bulat: tombol ± mengganti tanda, kotak hanya berisi angka. */
function SignedBox({ value, onChange, label, disabled = false, wide = false, compact = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; wide?: boolean; compact?: boolean }) {
  const neg = value.startsWith("-"), digits = value.replace("-", "");
  return <span className="inline-flex items-center gap-1">
    <button type="button" aria-label={`${label} ganti tanda`} aria-pressed={neg} disabled={disabled} onClick={() => onChange(neg ? digits : `-${digits}`)}
      className={`btn btn-sm btn-square h-10 ${compact ? "w-8" : "w-9"} text-lg font-extrabold ${neg ? "btn-info" : "btn-outline"}`}>{neg ? "−" : "+"}</button>
    <input aria-label={label} inputMode="numeric" value={digits ? show(Number(digits)) : ""} disabled={disabled} placeholder="…" onChange={e => { const d = e.target.value.replace(/\D/g, "").slice(0, 7); onChange(d ? (neg ? `-${d}` : d) : neg ? "-" : ""); }}
      className={`h-10 ${wide ? "w-28" : compact ? "w-14" : "w-20"} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />
  </span>;
}
function SmallBox({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className="h-9 w-10 rounded-md border-2 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none" />;
}
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1 }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="w-10 text-center text-lg font-extrabold tabular-nums">{show(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
const sup = (e: number) => (e > 1 ? String(e).split("").map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]).join("") : "");
const expForm = (n: number) => { const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23].filter(p => n % p === 0); return ps.map((p, k) => `${p}${sup(primeExponents(n, ps)[k])}`).join(" × ") || String(n); };

/* ====================================================================== */
/* Pohon faktor: dipakai di peraga dan di soal                             */
/* ====================================================================== */
function FactorTree({ n, onDone }: { n: number; onDone?: (s: string) => void }) {
  const [chosen, setChosen] = useState<number[]>([]);
  const [msg, setMsg] = useState("");
  const rem = chosen.reduce((a, p) => a / p, n), done = isPrime(rem) || rem === 1;
  const pick = (p: number) => { if (rem % p !== 0 || rem === p) { setMsg(rem === p ? `${p} sudah prima.` : `${rem} tidak habis dibagi ${p}.`); return; } setMsg(""); const next = [...chosen, p]; setChosen(next); if (onDone && isPrime(rem / p)) onDone(expForm(n)); };
  const steps = chosen.map((p, k) => ({ p, rest: chosen.slice(0, k + 1).reduce((a, x) => a / x, n) }));
  return <div className="space-y-2">
    <div className="overflow-x-auto"><svg viewBox={`0 0 ${120 + steps.length * 46} ${50 + steps.length * 46}`} className="mx-auto block max-w-full" style={{ width: (120 + steps.length * 46) * 1.5 }} role="img" aria-label={`Pohon faktor ${n}: ${[...chosen, ...(done && rem > 1 ? [rem] : [])].join(" × ") || "belum dibagi"}`}>
      <text x="40" y="24" fontSize="18" fontWeight="800" textAnchor="middle" fill="#1f3b30">{n}</text>
      {steps.map(({ p, rest }, k) => { const px = 40 + k * 46, py = 24 + k * 46, last = k === steps.length - 1;
        return <g key={k}>
          <line x1={px - 4} y1={py + 6} x2={px - 16} y2={py + 30} stroke="#55625c" strokeWidth="1.5" /><line x1={px + 4} y1={py + 6} x2={px + 40} y2={py + 30} stroke="#55625c" strokeWidth="1.5" />
          <circle cx={px - 20} cy={py + 41} r="13" fill="#fff" stroke="#e5484d" strokeWidth="1.5" /><text x={px - 20} y={py + 47} fontSize="15" fontWeight="800" textAnchor="middle" fill="#1f3b30">{p}</text>
          {last && isPrime(rest) && <circle cx={px + 46} cy={py + 41} r="13" fill="#fff" stroke="#e5484d" strokeWidth="1.5" />}
          <text x={px + 46} y={py + 47} fontSize="15" fontWeight="800" textAnchor="middle" fill="#1f3b30">{rest}</text>
        </g>; })}
    </svg></div>
    {!done && <div role="group" aria-label={`Bagi ${rem} dengan bilangan prima`} className="flex flex-wrap items-center gap-1.5 text-sm"><span className="font-semibold">Bagi {rem} dengan</span>
      {[2, 3, 5, 7, 11, 13].map(p => <button key={p} type="button" className="btn btn-sm btn-outline min-w-10" onClick={() => pick(p)}>{p}</button>)}</div>}
    <p className="text-sm" aria-live="polite">{done ? <><Check className="me-1 inline size-4 text-success" aria-hidden="true" />Semua ujung sudah prima: <strong>{n} = {[...chosen, ...(rem > 1 ? [rem] : [])].join(" × ")} = {expForm(n)}</strong>.</> : msg || "Ketuk bilangan prima yang membagi habis."}</p>
    {chosen.length > 0 && <button type="button" className="btn btn-xs btn-ghost gap-1" onClick={() => { setChosen([]); setMsg(""); }}><RotateCcw className="size-3.5" aria-hidden="true" />Ulangi pohon</button>}
  </div>;
}

/* ====================================================================== */
/* Lab A: termometer dan garis bilangan                                    */
/* ====================================================================== */
const labCities = [{ city: "Moskow", temp: -15 }, { city: "Seoul", temp: -2 }, { city: "Tokyo", temp: 6 }, { city: "Kupang", temp: 30 }];
function ThermoLab() {
  const [t, setT] = useState(-3);
  const kind = t < 0 ? "bilangan bulat negatif" : t > 0 ? "bilangan bulat positif" : "nol (bukan positif dan bukan negatif)";
  const colder = labCities.filter(c => c.temp > t).map(c => c.city);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2"><Stepper label="Suhu" value={t} set={setT} min={-30} max={50} /><Stepper label="Lompat 10" value={t} set={setT} min={-30} max={50} step={10} /></div>
    <div className="grid items-center gap-3 rounded-xl bg-base-100 p-2 sm:grid-cols-[auto_1fr]">
      <div className="flex justify-center"><Thermometer temp={t} /></div>
      <div className="min-w-0 overflow-x-auto"><NumberLine min={-30} max={50} step={5} labelEvery={2} marks={[{ v: t, label: `${show(t)}°C` }, ...labCities.map(c => ({ v: c.temp, label: c.city, color: "#1c64b5" }))]} label={`Garis bilangan, suhu ${show(t)}`} /></div>
    </div>
    <Result value={String(t)}><strong>{show(t)}°C</strong> adalah {kind}. Lawannya {show(-t)}, karena {show(t)} + ({show(-t)}) = 0.<br />{colder.length ? <>Suhu ini lebih dingin daripada {colder.join(", ")}.</> : <>Suhu ini lebih panas daripada semua kota contoh.</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab B: operasi pada garis bilangan                                      */
/* ====================================================================== */
function OpLab() {
  const [op, setOp] = useState<"+" | "−" | "×">("+");
  const [a, setA] = useState(3);
  const [b, setB] = useState(-5);
  const lim = op === "×" ? [3, 4] : [6, 6];
  const A = Math.max(-lim[0], Math.min(lim[0], a)), B = Math.max(-lim[1], Math.min(lim[1], b));
  const res = op === "+" ? A + B : op === "−" ? A - B : A * B;
  const arrows: Arrow[] = op === "×" ? [{ from: 0, to: B, color: "#2f86d6", row: 0 }, { from: 0, to: res, color: "#e8590c", row: 1 }]
    : [{ from: 0, to: A, color: "#2f86d6", row: 0 }, { from: A, to: res, color: "#e8590c", row: 1 }];
  const why = op === "+" ? (B >= 0 ? `Mulai di ${show(A)}, tambah ${show(B)}: bergerak ${B} langkah ke kanan.` : `Mulai di ${show(A)}, tambah ${show(B)}: bergerak ${-B} langkah ke kiri.`)
    : op === "−" ? `Mengurangi ${show(B)} sama dengan menambah lawannya, ${show(-B)}: ${show(A)} + (${show(-B)}) = ${show(res)}.`
    : `Panah biru dari 0 ke ${show(B)}. Dikali ${show(A)}: panjangnya ${Math.abs(A)} kali${A < 0 ? " dan arahnya dibalik" : A === 0 ? ", jadi hasilnya 0" : " searah"}.`;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Operasi" className="join">{(["+", "−", "×"] as const).map(o => <button key={o} type="button" role="radio" aria-checked={op === o} aria-label={o === "+" ? "Penjumlahan" : o === "−" ? "Pengurangan" : "Perkalian"} onClick={() => setOp(o)} className={`btn join-item btn-sm w-12 text-lg ${op === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>
    <div className="flex flex-wrap gap-3"><Stepper label="Bilangan pertama" value={A} set={setA} min={-lim[0]} max={lim[0]} /><Stepper label="Bilangan kedua" value={B} set={setB} min={-lim[1]} max={lim[1]} /></div>
    <div className="overflow-x-auto rounded-xl bg-base-100 p-2"><NumberLine min={-12} max={12} labelEvery={2} arrows={arrows} marks={[{ v: res, color: "#e8590c" }]} label={`${show(A)} ${op} (${show(B)}) = ${show(res)}`} /></div>
    <Result value={`${op}|${res}`}><strong>{show(A)} {op} ({show(B)}) = {show(res)}</strong>. {why}</Result>
  </div>;
}

/* ====================================================================== */
/* Lab C: pohon faktor, FPB dan KPK                                        */
/* ====================================================================== */
const treeNumbers = [12, 18, 24, 36, 45, 60, 84, 100];
function FactorLab() {
  const [tab, setTab] = useState<"tree" | "fpb">("tree");
  const [n, setN] = useState(12);
  const [done, setDone] = useState("");
  const [a, setA] = useState(16);
  const [b, setB] = useState(24);
  const fa = factorsOf(a), fb = factorsOf(b), ma = Array.from({ length: 10 }, (_, k) => a * (k + 1)), mb = Array.from({ length: 10 }, (_, k) => b * (k + 1));
  const F = gcd(a, b), K = lcm(a, b);
  const chip = (x: number, common: boolean, best: boolean) => <span key={x} className={`rounded px-1.5 py-0.5 text-xs font-bold tabular-nums ${best ? "bg-warning/50 ring-1 ring-warning" : common ? "bg-success/20" : "bg-base-200"}`}>{x}</span>;
  return <div className="space-y-3">
    <div role="tablist" className="join">{([["tree", "Pohon faktor"], ["fpb", "FPB dan KPK"]] as const).map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`btn join-item btn-sm ${tab === k ? "btn-success" : "btn-outline"}`}>{t}</button>)}</div>
    {tab === "tree" ? <>
      <div role="radiogroup" aria-label="Bilangan" className="flex flex-wrap gap-1.5">{treeNumbers.map(x => <button key={x} type="button" role="radio" aria-checked={n === x} onClick={() => { setN(x); setDone(""); }} className={`btn btn-xs ${n === x ? "btn-success" : "btn-outline"}`}>{x}</button>)}</div>
      <div className="rounded-xl bg-base-100 p-3"><FactorTree key={n} n={n} onDone={setDone} /></div>
      <p className="text-sm"><strong>Pasangan faktor {n}:</strong> {factorPairs(n).map(([x, y]) => `(${show(x)}, ${show(y)})`).join(", ")}</p>
      <Result value={done ? `${n}|${done}` : ""}>{done ? <>Faktorisasi prima {n} = <strong>{done}</strong>.</> : "Selesaikan pohon faktornya sampai semua ujung berupa bilangan prima."}</Result>
    </> : <>
      <div className="flex flex-wrap gap-3"><Stepper label="Bilangan A" value={a} set={setA} min={2} max={40} /><Stepper label="Bilangan B" value={b} set={setB} min={2} max={40} /></div>
      <div className="space-y-2 rounded-xl bg-base-100 p-3 text-sm">
        <p className="font-bold">Faktor</p>
        {[[a, fa], [b, fb]].map(([x, fs]) => <div key={`f${x as number}`} className="flex flex-wrap items-center gap-1"><span className="w-8 font-bold">{x as number}:</span>{(fs as number[]).map(f => chip(f, fa.includes(f) && fb.includes(f), f === F))}</div>)}
        <p className="pt-1 font-bold">Kelipatan</p>
        {[[a, ma], [b, mb]].map(([x, ms]) => <div key={`m${x as number}`} className="flex flex-wrap items-center gap-1"><span className="w-8 font-bold">{x as number}:</span>{(ms as number[]).map(m => chip(m, ma.includes(m) && mb.includes(m), m === K))}</div>)}
      </div>
      <Result value={`${F}|${K}`}>Faktor persekutuan diberi warna hijau. <strong>FPB({a}, {b}) = {F}</strong>, faktor persekutuan yang terbesar. <strong>KPK({a}, {b}) = {K}</strong>{K > a * 10 || K > b * 10 ? " (di luar 10 kelipatan pertama)" : ""}, kelipatan persekutuan yang terkecil.</Result>
    </>}
  </div>;
}
const labs = [ThermoLab, OpLab, FactorLab];

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "weather": return <div className="w-full max-w-md space-y-1.5">{scene.items.map(c => <WeatherCard key={c.city} {...c} />)}</div>;
    case "text": return <ul className="w-full max-w-lg list-disc space-y-1 rounded-lg bg-base-100 py-2 pe-3 ps-7 text-sm">{scene.lines.map(l => <li key={l}>{l}</li>)}</ul>;
    case "rules": return <table className="w-full max-w-lg border-collapse bg-base-100 text-sm"><thead><tr className="bg-success text-success-content"><th className="px-2 py-1 text-left">Proses transfer</th><th className="px-2 py-1">Nilai</th><th className="px-2 py-1">Efek performa</th></tr></thead>
      <tbody>{scene.rows.map(([a, b, c]) => <tr key={a} className="border-t border-base-300"><td className="px-2 py-1">{a}</td><td className="px-2 py-1 text-center font-mono font-bold">{b}</td><td className="px-2 py-1">{c}</td></tr>)}</tbody></table>;
    case "bank": return <BankBook owner={scene.owner} rows={scene.rows} />;
    case "ac": return <AcPanel temp={scene.temp} buttons={scene.buttons} />;
    case "tree": return <div className="w-full max-w-md rounded-xl bg-base-100 p-3"><p className="mb-1 text-sm font-bold">Pohon faktor {scene.n}</p><FactorTree n={scene.n} /></div>;
    case "thermo": return <Thermometer temp={scene.temp} />;
    case "line": return <div className="w-full overflow-x-auto"><NumberLine min={scene.min} max={scene.max} step={scene.step} marks={scene.marks} /></div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PlaceOnLine({ p, x, put, checked }: { p: Extract<Part, { kind: "place" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState(0);
  const marks = p.items.flatMap((it, k) => (Number.isNaN(int(x[k])) ? [] : [{ v: int(x[k]), label: it.label, color: ["#e8590c", "#1c64b5", "#2b8a3e", "#7048e8", "#c92a2a"][k % 5] }]));
  return <div className="space-y-2">
    <p className="text-sm">Pilih nama, lalu ketuk letaknya pada garis bilangan.</p>
    <div role="group" aria-label="Pilih yang akan diletakkan" className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={it.label} type="button" disabled={checked} aria-pressed={sel === k} onClick={() => setSel(k)} className={`btn btn-sm ${sel === k ? on : "btn-outline"}`}>{it.label}{x[k] !== "" && <span className="text-xs font-normal">({show(int(x[k]))})</span>}</button>)}</div>
    <div className="overflow-x-auto rounded-xl bg-base-100 p-1"><NumberLine min={p.min} max={p.max} step={p.step} marks={marks} selected={p.items[sel].label} onTick={checked ? undefined : v => { put(sel, String(v)); setSel(s => Math.min(p.items.length - 1, s + 1)); }} /></div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <div className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label}<SignedBox label={p.label} value={value} onChange={set} disabled={checked} />{p.unit}</div>;
    case "items": return <div className="space-y-2">{p.items.map((it, k) => <div key={it.label} className="flex flex-wrap items-center gap-2 font-bold">{it.label}<SignedBox label={it.label} value={x[k]} onChange={v => put(k, v)} disabled={checked} wide={Math.abs(it.answer) >= 10000} />{it.unit}</div>)}</div>;
    case "signs": return <div className="space-y-2">{p.pairs.map(([a, b], k) => <div key={k} role="group" aria-label={`Pasangan ${k + 1}`} className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-base-300 p-2 text-lg font-extrabold">
      <span className="w-20 text-right">{show(a)}</span>
      <span className="join">{(["<", ">"] as const).map(s => <button key={s} type="button" disabled={checked} aria-pressed={x[k] === s} aria-label={s === "<" ? "kurang dari" : "lebih dari"} onClick={() => put(k, s)} className={`btn join-item btn-sm w-11 text-lg ${x[k] === s ? on : "btn-outline"}`}>{s}</button>)}</span>
      <span className="w-20">{show(b)}</span></div>)}</div>;
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.map((s, k) => <li key={s} className="badge badge-success badge-lg">{k + 1}. {show(Number(s))}</li>)}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-label={`Bilangan ${show(o)}`} disabled={checked || seq.includes(String(o))} onClick={() => set([...seq, String(o)].join(";"))} className="btn btn-sm btn-outline min-w-12 text-base">{show(o)}</button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "place": return <PlaceOnLine p={p} x={x} put={put} checked={checked} />;
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.options.map((o, k) => { const s = sel.includes(k);
          return <button key={o} type="button" aria-pressed={s} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} className={`btn btn-sm min-w-12 ${s ? on : "btn-outline"}`}>{o}</button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "pairs": return <div className="space-y-2"><p className="text-sm">Isi setiap baris dengan satu pasangan. Urutan baris bebas. Tekan tombol ± untuk bilangan negatif.</p>
      <div className="grid gap-2 sm:grid-cols-2">{Array.from({ length: x.length / 2 }, (_, k) => <div key={k} className="flex items-center gap-1 rounded-lg border border-base-300 p-1.5 font-extrabold"><span className="me-1 text-xs">{k + 1}.</span>(<SignedBox compact label={`Pasangan ${k + 1} bilangan pertama`} value={x[2 * k]} onChange={v => put(2 * k, v)} disabled={checked} />,<SignedBox compact label={`Pasangan ${k + 1} bilangan kedua`} value={x[2 * k + 1]} onChange={v => put(2 * k + 1, v)} disabled={checked} />)</div>)}</div></div>;
    case "primeExp": return <div className="space-y-1"><p className="text-sm">Tulis pangkat setiap bilangan prima. Tulis 0 jika bilangan prima itu tidak muncul.</p>
      <div className="flex flex-wrap items-center gap-1.5 text-xl font-extrabold"><span>{p.n} =</span>{p.primes.map((pr, k) => <span key={pr} className="flex items-start gap-0.5">{k > 0 && <span className="me-1">×</span>}{pr}<SmallBox label={`Pangkat ${pr}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} /></span>)}</div></div>;
    case "table": { let k = 0;
      return <div className="overflow-x-auto"><table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-success text-success-content">{p.head.map(h => <th key={h} className="px-1 py-1 text-xs sm:text-sm">{h}</th>)}</tr></thead>
        <tbody>{p.rows.map((row, r) => <tr key={r} className="border-t border-base-300">{row.map((c, j) => { if (c !== null) return <td key={j} className="px-2 py-2 font-bold">{c}</td>; const idx = k++;
          return <td key={j} className="px-1 py-1"><SignedBox compact label={`Baris ${r + 1} ${p.head[j]}`} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} /></td>; })}</tr>)}</tbody></table></div>; }
    case "dials": { const vals = x.map(int), prod = vals.every(v => !Number.isNaN(v)) ? vals.reduce((a, b) => a * b, 1) : null;
      return <div role="group" aria-label={`Tombol untuk ${show(p.target)}°C`} className="space-y-2 rounded-xl border border-base-300 p-2">
        <p className="text-sm font-bold">Suhu yang diinginkan {show(p.target)}°C{p.primesOnly ? ", setiap tombol harus bilangan prima" : ""}</p>
        <div className="flex flex-wrap justify-center gap-3">{x.map((c, k) => { const v = Number.isNaN(int(c)) ? 0 : int(c), name = `Tombol ${k + 1}`;
          return <div key={k} className="flex flex-col items-center"><Dial value={v} min={p.min} max={p.max} label={name} />
            <span className="flex items-center gap-1"><button type="button" aria-label={`${name} putar kiri`} disabled={checked || (c !== "" && v <= p.min)} onClick={() => put(k, String(c === "" ? -1 : v - 1))} className="btn btn-xs btn-square btn-outline"><Minus className="size-3.5" aria-hidden="true" /></button>
              <span className="w-8 text-center font-extrabold">{c === "" ? "…" : show(v)}</span>
              <button type="button" aria-label={`${name} putar kanan`} disabled={checked || (c !== "" && v >= p.max)} onClick={() => put(k, String(c === "" ? 1 : v + 1))} className="btn btn-xs btn-square btn-outline"><Plus className="size-3.5" aria-hidden="true" /></button></span></div>; })}</div>
        <p className="text-center font-mono text-lg font-bold">Layar: {prod === null ? "…" : `${show(prod)}°C`}</p></div>; }
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span>{s.text}</span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: IQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeSevenIntegers() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 7, Bab 1</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bilangan Bulat</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Kenali bilangan bulat negatif, nol, dan positif pada garis bilangan, hitung dengan aturan tanda, lalu cari faktor, faktorisasi prima, FPB, dan KPK.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="scale-75"><Thermometer temp={-3} /></div>
        <p className="font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Suhu −3°C di Puncak Jaya</h2>
        <p className="mt-2 text-sm">Tanda minus menunjukkan suhu di bawah nol. Bilangan bulat juga dipakai untuk kedalaman laut, utang, dan untung rugi.</p>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bulat">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bulat" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={topic} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{t.demo}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi</button>
            {topic < topics.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<IQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
