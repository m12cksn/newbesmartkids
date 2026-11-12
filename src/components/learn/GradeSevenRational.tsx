"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, Undo2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { AreaGrid, FracLine, FracValue, MathText, MeasuringSet, StorageBar, Venn } from "./GradeSevenRationalArt";
import {
  add, assessment, cells, cmp, correct, decText, div, formatAnswer, fracText, longDivision, mul, practice, ready, red, SEP, splitParts, sub, topics,
  type F, type Part, type RQuestion, type Scene,
} from "@/data/grade-seven-rational";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
const inputCls = "rounded-md border-2 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none";
function SignBtn({ neg, set, label, disabled }: { neg: boolean; set: (n: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" aria-label={`${label} ganti tanda`} aria-pressed={neg} disabled={disabled} onClick={() => set(!neg)} className={`btn btn-sm btn-square h-9 w-8 text-lg font-extrabold ${neg ? "btn-info" : "btn-outline"}`}>{neg ? "−" : "+"}</button>;
}
/** Isian pecahan: tanda, bagian bulat (boleh kosong), pembilang, penyebut. */
function FracBox({ x, set, label, disabled }: { x: string[]; set: (x: string[]) => void; label: string; disabled?: boolean }) {
  const put = (k: number, v: string) => set(x.map((y, j) => (j === k ? v : y)));
  const digits = (k: number) => (e: React.ChangeEvent<HTMLInputElement>) => put(k, e.target.value.replace(/\D/g, "").slice(0, 4));
  return <span className="inline-flex items-center gap-1">
    <SignBtn neg={x[0] === "-"} set={n => put(0, n ? "-" : "")} label={label} disabled={disabled} />
    <input aria-label={`${label} bilangan bulat`} inputMode="numeric" placeholder="" value={x[1]} disabled={disabled} onChange={digits(1)} className={`${inputCls} h-11 w-10 text-lg`} />
    <span className="inline-flex flex-col items-center gap-0.5">
      <input aria-label={`${label} pembilang`} inputMode="numeric" placeholder="…" value={x[2]} disabled={disabled} onChange={digits(2)} className={`${inputCls} h-8 w-12`} />
      <span className="h-0.5 w-12 rounded bg-neutral" />
      <input aria-label={`${label} penyebut`} inputMode="numeric" placeholder="…" value={x[3]} disabled={disabled} onChange={digits(3)} className={`${inputCls} h-8 w-12`} />
    </span>
  </span>;
}
function DecBox({ value, set, label, disabled }: { value: string; set: (v: string) => void; label: string; disabled?: boolean }) {
  const neg = value.startsWith("-"), body = value.replace("-", "");
  return <span className="inline-flex items-center gap-1">
    <SignBtn neg={neg} set={n => set((n ? "-" : "") + body)} label={label} disabled={disabled} />
    <input aria-label={label} inputMode="decimal" placeholder="…" value={body} disabled={disabled} onChange={e => { const t = e.target.value.replace(/\./g, ",").replace(/[^\d,]/g, "").replace(/,(?=.*,)/g, "").slice(0, 10); set((neg ? "-" : "") + t); }} className={`${inputCls} h-10 w-28 text-lg`} />
  </span>;
}
function Stepper({ label, value, set, min, max, shown }: { label: string; value: number; set: (n: number) => void; min: number; max: number; shown?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{shown ?? label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="w-8 text-center text-lg font-extrabold tabular-nums">{value < 0 ? `−${-value}` : value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function FracPicker({ name, f, set, nRange = [-12, 12], dMax = 12 }: { name: string; f: F; set: (f: F) => void; nRange?: [number, number]; dMax?: number }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2">
    <span className="w-full text-sm font-bold sm:w-auto sm:me-1">{name}</span>
    <Stepper label={`${name} pembilang`} shown="Pembilang" value={f[0]} set={n => set([n, f[1]])} min={nRange[0]} max={nRange[1]} />
    <Stepper label={`${name} penyebut`} shown="Penyebut" value={f[1]} set={d => set([f[0], d])} min={1} max={dMax} />
    <span className="ms-auto text-xl font-extrabold"><MathText text={`{${f[0] < 0 ? "-" : ""}${Math.abs(f[0])}/${f[1]}}`} /></span>
  </div>;
}
const lcmOf = (a: number, b: number) => { let m = Math.max(a, b); while (m % a || m % b) m++; return m; };
const tok = (f: F) => `{${fracText(f).replace("−", "-")}}`;
const raw = (f: F) => `{${f[0] < 0 ? "-" : ""}${Math.abs(f[0])}/${f[1]}}`;
const decimalOf = (n: number, d: number) => { const r = longDivision(n, d); return { text: `${r.neg && (r.whole || r.digits.some(Boolean)) ? "−" : ""}${r.whole}${r.digits.length ? `,${r.digits.join("")}` : ""}`, r }; };

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const vennItems: { text: string; set: string }[] = [{ text: "7", set: "Asli" }, { text: "0", set: "Cacah" }, { text: "−4", set: "Bulat" }, { text: "{-3/5}", set: "Rasional" }, { text: "0,75", set: "Rasional" }, { text: "√9", set: "Asli" }, { text: "√2", set: "Irasional" }, { text: "π", set: "Irasional" }];
function VennLab() {
  const [k, setK] = useState(3);
  const [pick, setPick] = useState("");
  const it = vennItems[k], ok = pick === it.set;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Pilih bilangan" className="flex flex-wrap gap-1.5">{vennItems.map((v, i) => <button key={v.text} type="button" role="radio" aria-checked={k === i} aria-label={`Bilangan ${v.text.replace(/[{}]/g, "")}`} onClick={() => { setK(i); setPick(""); }} className={`btn btn-sm min-w-11 ${k === i ? "btn-success" : "btn-outline"}`}><MathText text={v.text} /></button>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><Venn active={pick || undefined} onPick={setPick} /></div>
    <Result value={pick ? `${pick}|${ok ? "ok" : "no"}` : ""}>{!pick ? <>Ketuk himpunan <strong>terkecil</strong> yang memuat <MathText text={it.text} />.</> : ok
      ? <><Check className="me-1 inline size-4 text-success" aria-hidden="true" />Tepat. <MathText text={it.text} /> termasuk bilangan {it.set.toLowerCase()}<MathText text={it.set === "Irasional" ? ": tidak dapat ditulis sebagai {a/b}." : it.set === "Rasional" ? ", tetapi bukan bilangan bulat." : ", jadi juga termasuk semua himpunan yang lebih luas di luarnya."} />{it.text === "√9" && " √9 = 3."}</>
      : <><X className="me-1 inline size-4 text-error" aria-hidden="true" />Belum. <MathText text={it.set === "Irasional" || pick === "Irasional" ? "Ingat: bilangan irasional tidak dapat ditulis sebagai {a/b}, sedangkan bilangan rasional dapat." : "Bilangan ini memang ada di himpunan itu, tetapi masih ada himpunan lebih kecil di dalamnya yang memuatnya."} /></>}</Result>
  </div>;
}
function DivisionLab() {
  const [f, setF] = useState<F>([3, 8]);
  const { r, text } = decimalOf(f[0], f[1]);
  const steps = r.digits.slice(0, 8).reduce<{ rem: number; lines: string[] }>((acc, dg) => ({ rem: (acc.rem * 10) % f[1], lines: [...acc.lines, `${acc.rem * 10} : ${f[1]} = ${dg}, sisa ${(acc.rem * 10) % f[1]}`] }), { rem: Math.abs(f[0]) % f[1], lines: [] });
  const rows = steps.lines, rem = steps.rem;
  const rep = r.repeatFrom;
  return <div className="space-y-3">
    <FracPicker name="Pecahan" f={f} set={setF} nRange={[-20, 20]} dMax={30} />
    <div className="rounded-xl bg-base-100 p-3 font-mono text-sm">
      <p>{Math.abs(f[0])} : {f[1]} = {r.whole}, sisa {Math.abs(f[0]) % f[1]}</p>
      <ol className="mt-1 space-y-0.5">{rows.map((l, i) => <li key={i} className={rep >= 0 && i >= rep ? "text-info" : ""}>{l}</li>)}</ol>
      {!r.ends && rep < 0 && <p className="text-base-content/60">…</p>}
    </div>
    <Result value={r.ends ? text : `${text}…`}><MathText text={raw(f)} /> = <strong className="tabular-nums">{r.neg ? "−" : ""}{r.whole}{r.digits.length > 0 && ","}{r.digits.map((dg, i) => <span key={i} className={rep >= 0 && i >= rep ? "overline decoration-2" : ""}>{dg}</span>)}{!r.ends && "…"}</strong>.{" "}
      {r.ends ? "Sisanya habis, jadi desimalnya terbatas." : rep >= 0 ? `Sisa ${rem} sudah pernah muncul, jadi angka bergaris atas berulang terus: desimal tak terbatas dan berulang.` : "Sisanya belum habis."}
      {red(f)[1] !== f[1] && <> Bentuk paling sederhana: <MathText text={raw(red(f))} />.</>}</Result>
  </div>;
}
function LineLab() {
  const [f, setF] = useState<F>([3, 4]);
  const n = Math.max(-2 * f[1], Math.min(2 * f[1], f[0]));
  const v: F = [n, f[1]];
  return <div className="space-y-3">
    <FracPicker name="Bilangan" f={v} set={setF} nRange={[-2 * f[1], 2 * f[1]]} dMax={10} />
    <div className="overflow-x-auto rounded-xl bg-base-100 p-2"><FracLine min={-2} max={2} den={f[1]} marks={[{ v: n / f[1], label: fracText(v) }]} /></div>
    <Result value={fracText(red(v))}>Setiap satuan dibagi <strong>{f[1]}</strong> bagian. <MathText text={raw(v)} /> berarti {Math.abs(n)} bagian ke {n < 0 ? "kiri" : "kanan"} dari 0{Math.abs(n) > f[1] ? <>, sama dengan <MathText text={tok(v)} /></> : ""}. Dalam desimal {decText(v) ?? `≈ ${(n / f[1]).toFixed(3).replace(".", ",")}`}.</Result>
  </div>;
}
function CompareLab() {
  const [a, setA] = useState<F>([3, 5]);
  const [b, setB] = useState<F>([4, 7]);
  const L = lcmOf(a[1], b[1]), A = a[0] * (L / a[1]), B = b[0] * (L / b[1]), s = A > B ? ">" : A < B ? "<" : "=";
  return <div className="space-y-2">
    <FracPicker name="Pecahan pertama" f={a} set={setA} dMax={12} /><FracPicker name="Pecahan kedua" f={b} set={setB} dMax={12} />
    <div className="overflow-x-auto rounded-xl bg-base-100 p-2"><FracLine min={-2} max={2} den={1} marks={[{ v: a[0] / a[1], label: "pertama", color: "#e8590c" }, { v: b[0] / b[1], label: "kedua", color: "#1c64b5" }]} /></div>
    <Result value={s}>KPK penyebut {a[1]} dan {b[1]} adalah {L}. <MathText text={raw(a)} /> = <MathText text={raw([A, L])} /> dan <MathText text={raw(b)} /> = <MathText text={raw([B, L])} />. Bandingkan pembilangnya: {A} {s} {B}, jadi <strong><MathText text={raw(a)} /> {s} <MathText text={raw(b)} /></strong>.</Result>
  </div>;
}
const needs: { text: string; v: F; unit: "cangkir" | "sdm" | "sdt" }[] = [{ text: "{9/10} cangkir kaldu", v: [9, 10], unit: "cangkir" }, { text: "{1/5} cangkir kecap", v: [1, 5], unit: "cangkir" }, { text: "{3/8} cangkir susu", v: [3, 8], unit: "cangkir" }, { text: "{3/4} sdt garam", v: [3, 4], unit: "sdt" }, { text: "{1/3} sdm saus", v: [1, 3], unit: "sdm" }];
const toolSizes: Record<string, F[]> = { cangkir: [[1, 4], [1, 3], [1, 2], [1, 1]], sdm: [[1, 2], [1, 1]], sdt: [[1, 2], [1, 1]] };
function MeasureLab() {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<F | null>(null);
  const need = needs[k], opts = toolSizes[need.unit];
  const best = opts.reduce((a, b) => (Math.abs(b[0] / b[1] - need.v[0] / need.v[1]) < Math.abs(a[0] / a[1] - need.v[0] / need.v[1]) ? b : a));
  const ok = pick && cmp(pick, best) === 0;
  return <div className="space-y-3">
    <div className="rounded-xl bg-base-100 p-2"><MeasuringSet /></div>
    <div role="radiogroup" aria-label="Kebutuhan resep" className="flex flex-wrap gap-1.5">{needs.map((n, i) => <button key={n.text} type="button" role="radio" aria-checked={k === i} aria-label={n.text.replace(/[{}]/g, "")} onClick={() => { setK(i); setPick(null); }} className={`btn btn-sm h-auto py-1 ${k === i ? "btn-success" : "btn-outline"}`}><MathText text={n.text} /></button>)}</div>
    <div role="group" aria-label="Pilih takaran" className="flex flex-wrap gap-1.5">{opts.map(o => <button key={fracText(o)} type="button" aria-label={`${fracText(o)} ${need.unit}`} aria-pressed={!!pick && cmp(pick, o) === 0} onClick={() => setPick(o)} className={`btn btn-sm ${pick && cmp(pick, o) === 0 ? "btn-info" : "btn-outline"}`}><FracValue f={o} /> {need.unit}</button>)}</div>
    <Result value={pick ? `${fracText(pick)}|${ok ? "ok" : "no"}` : ""}>{!pick ? <>Ketuk takaran yang paling mendekati <MathText text={need.text} />.</> : ok
      ? <><Check className="me-1 inline size-4 text-success" aria-hidden="true" />Tepat. <MathText text={raw(need.v)} /> ≈ {(need.v[0] / need.v[1]).toFixed(2).replace(".", ",")}, paling dekat dengan <FracValue f={best} /> {need.unit}.</>
      : <><X className="me-1 inline size-4 text-error" aria-hidden="true" />Belum. <MathText text={raw(need.v)} /> ≈ {(need.v[0] / need.v[1]).toFixed(2).replace(".", ",")}. Bandingkan jaraknya ke setiap takaran.</>}</Result>
  </div>;
}
function AddSubLab() {
  const [op, setOp] = useState<"+" | "−">("+");
  const [a, setA] = useState<F>([5, 8]);
  const [b, setB] = useState<F>([1, 4]);
  const L = lcmOf(a[1], b[1]), A = a[0] * (L / a[1]), B = b[0] * (L / b[1]), r = op === "+" ? add(a, b) : sub(a, b), top = op === "+" ? A + B : A - B;
  return <div className="space-y-2">
    <div role="radiogroup" aria-label="Operasi" className="join">{(["+", "−"] as const).map(o => <button key={o} type="button" role="radio" aria-checked={op === o} aria-label={o === "+" ? "Penjumlahan" : "Pengurangan"} onClick={() => setOp(o)} className={`btn join-item btn-sm w-12 text-lg ${op === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>
    <FracPicker name="Pecahan pertama" f={a} set={setA} /><FracPicker name="Pecahan kedua" f={b} set={setB} />
    <Result value={fracText(r)}><MathText text={raw(a)} /> {op} <MathText text={raw(b)} /> = <MathText text={raw([A, L])} /> {op} <MathText text={raw([B, L])} /> = <MathText text={raw([top, L])} />{red([top, L])[1] !== L || top % L === 0 ? <> = <strong><MathText text={tok(r)} /></strong></> : null}. Penyebut disamakan menjadi KPK({a[1]}, {b[1]}) = {L}.{decText(r) ? ` Dalam desimal ${decText(r)}.` : ""}</Result>
  </div>;
}
function AreaLab() {
  const [a, setA] = useState<F>([3, 4]);
  const [b, setB] = useState<F>([2, 4]);
  const r = mul(a, b);
  return <div className="space-y-2">
    <FracPicker name="Panjang" f={a} set={f => setA([Math.max(0, Math.min(f[1], f[0])), f[1]])} nRange={[0, a[1]]} dMax={6} />
    <FracPicker name="Lebar" f={b} set={f => setB([Math.max(0, Math.min(f[1], f[0])), f[1]])} nRange={[0, b[1]]} dMax={6} />
    <div className="rounded-xl bg-base-100 p-2"><AreaGrid rows={b[1]} cols={a[1]} shadeCols={a[0]} shadeRows={b[0]} label={`Persegi ${b[1]} × ${a[1]} kotak, ${a[0] * b[0]} kotak terkena kedua arsiran`} /></div>
    <p className="flex flex-wrap gap-3 text-xs"><span className="inline-flex items-center gap-1"><span className="inline-block size-3 bg-[#cdeccf] ring-1 ring-base-300" />{a[0]} dari {a[1]} kolom</span><span className="inline-flex items-center gap-1"><span className="inline-block size-3 bg-[#cfe3fb] ring-1 ring-base-300" />{b[0]} dari {b[1]} baris</span><span className="inline-flex items-center gap-1"><span className="inline-block size-3 bg-[#2b8a3e]" />keduanya</span></p>
    <Result value={fracText(r)}>Persegi dibagi {a[1]} × {b[1]} = {a[1] * b[1]} kotak. Kotak yang terkena kedua arsiran: {a[0]} × {b[0]} = {a[0] * b[0]}. Jadi <MathText text={raw(a)} /> × <MathText text={raw(b)} /> = <MathText text={raw([a[0] * b[0], a[1] * b[1]])} />{a[0] * b[0] > 0 && red(r)[1] !== a[1] * b[1] ? <> = <strong><MathText text={tok(r)} /></strong></> : null}.</Result>
  </div>;
}
function DivideLab() {
  const [a, setA] = useState<F>([3, 8]);
  const [b, setB] = useState<F>([1, 2]);
  const ok = b[0] !== 0, flip: F = ok ? [b[1] * Math.sign(b[0]), Math.abs(b[0])] : [0, 1], r = ok ? div(a, b) : null;
  return <div className="space-y-2">
    <FracPicker name="Yang dibagi" f={a} set={setA} /><FracPicker name="Pembagi" f={b} set={setB} />
    <Result value={r ? fracText(r) : "tidak"}>{r ? <><MathText text={raw(a)} /> : <MathText text={raw(b)} /> = <MathText text={raw(a)} /> × <MathText text={raw(flip)} /> = <MathText text={raw([a[0] * flip[0], a[1] * flip[1]])} /> = <strong><MathText text={tok(r)} /></strong>. Kebalikan <MathText text={raw(b)} /> adalah <MathText text={raw(flip)} />, karena hasil kali keduanya 1.</> : "Pembagi 0 tidak mempunyai kebalikan. Pembagian dengan 0 tidak didefinisikan."}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { venn: VennLab, division: DivisionLab, line: LineLab, compare: CompareLab, measure: MeasureLab, addsub: AddSubLab, area: AreaLab, divide: DivideLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "text": return <ul className="w-full max-w-lg list-disc space-y-1 rounded-lg bg-base-100 py-2 pe-3 ps-7 text-sm">{scene.lines.map(l => <li key={l}><MathText text={l} /></li>)}</ul>;
    case "line": return <div className="w-full overflow-x-auto"><FracLine min={scene.min} max={scene.max} den={scene.den} marks={scene.marks.map(m => ({ v: m.v[0] / m.v[1], label: m.label, color: "#1c64b5" }))} /></div>;
    case "storage": return <StorageBar parts={scene.parts} />;
    case "tools": return <MeasuringSet />;
    case "table": return <div className="w-full overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm"><thead><tr className="bg-success text-success-content">{scene.head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>{scene.rows.map(r => <tr key={r[0]} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 tabular-nums ${j ? "" : "font-bold"}`}>{c}</td>)}</tr>)}</tbody></table></div>;
    case "recipes": return <div className="grid w-full gap-2 sm:grid-cols-3">{scene.items.map(it => <div key={it.name} className="rounded-lg border border-base-300 bg-base-100 p-2 text-sm"><p className="font-bold">{it.name}</p><ul className="mt-1 space-y-1">{it.lines.map(l => <li key={l}><MathText text={l} /></li>)}</ul></div>)}</div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PlaceOnLine({ p, x, put, checked }: { p: Extract<Part, { kind: "place" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState(0);
  const colors = ["#e8590c", "#1c64b5", "#2b8a3e", "#7048e8"];
  const plainLabel = (s: string) => s.replace(/\{([^}]+)\}/g, "$1").replace(/-/g, "−");
  const marks = p.items.flatMap((it, k) => (x[k] === "" ? [] : [{ v: Number(x[k]) / p.den, label: plainLabel(it.label), color: colors[k % 4] }]));
  return <div className="space-y-2">
    <p className="text-sm">Pilih bilangan, lalu ketuk letaknya pada garis bilangan. Setiap satuan dibagi {p.den} bagian.</p>
    <div role="group" aria-label="Pilih yang akan diletakkan" className="flex flex-wrap gap-1.5">{p.items.map((it, k) => <button key={it.label} type="button" disabled={checked} aria-pressed={sel === k} aria-label={plainLabel(it.label)} onClick={() => setSel(k)} className={`btn btn-sm h-auto min-h-9 py-1 ${sel === k ? on : "btn-outline"}`}><MathText text={it.label} /></button>)}</div>
    <div className="overflow-x-auto rounded-xl bg-base-100 p-1"><FracLine min={p.min} max={p.max} den={p.den} marks={marks} selected={plainLabel(p.items[sel].label)} onTick={checked ? undefined : k => { put(sel, String(k)); setSel(s => Math.min(p.items.length - 1, s + 1)); }} /></div>
  </div>;
}
function ShadeGrid({ p, value, set, checked }: { p: Extract<Part, { kind: "shade" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const sel = value ? value.split(",").map(Number) : [];
  return <div className="space-y-1">
    <AreaGrid rows={p.rows} cols={p.cols} picked={sel} label={`Persegi ${p.rows} × ${p.cols}, ketuk kotak untuk mengarsir`} onCell={checked ? undefined : k => set((sel.includes(k) ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} />
    <p className="text-center text-xs text-base-content/60">Ketuk kotak untuk mengarsir atau menghapus arsiran. Diarsir {sel.length} dari {p.rows * p.cols} kotak.</p>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const plainLabel = (s: string) => s.replace(/\{([^}]+)\}/g, "$1").replace(/-/g, "−");
  switch (p.kind) {
    case "frac": case "between": return <div className="flex flex-wrap items-center gap-2 text-lg font-bold"><MathText text={p.label} /><FracBox x={x} set={a => set(a.join("|"))} label={plainLabel(p.label)} disabled={checked} /></div>;
    case "dec": return <div className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span><DecBox value={value} set={set} label={plainLabel(p.label)} disabled={checked} />{p.unit}</div>;
    case "signs": return <div className="space-y-2">{p.pairs.map(([a, , b], k) => <div key={k} role="group" aria-label={`Pasangan ${k + 1}`} className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-base-300 p-2 text-lg font-extrabold">
      <span className="w-20 text-right"><MathText text={a} /></span>
      <span className="join">{(["<", "=", ">"] as const).map(s => <button key={s} type="button" disabled={checked} aria-pressed={x[k] === s} aria-label={s === "<" ? "kurang dari" : s === ">" ? "lebih dari" : "sama dengan"} onClick={() => put(k, s)} className={`btn join-item btn-sm w-10 text-lg ${x[k] === s ? on : "btn-outline"}`}>{s}</button>)}</span>
      <span className="w-20"><MathText text={b} /></span></div>)}</div>;
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.map((s, k) => <li key={s} className="badge badge-success badge-lg h-auto gap-1 py-1">{k + 1}. <MathText text={s} /></li>)}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o.text} type="button" aria-label={`Bilangan ${plainLabel(o.text)}`} disabled={checked || seq.includes(o.text)} onClick={() => set([...seq, o.text].join(";"))} className="btn btn-sm btn-outline h-auto min-h-10 min-w-12 py-1 text-base"><MathText text={o.text} /></button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "place": return <PlaceOnLine p={p} x={x} put={put} checked={checked} />;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={plainLabel(r.text)} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <span className="text-base font-bold sm:w-56"><MathText text={r.text} /></span>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 py-1 ${o.length <= 2 ? "w-10 text-lg" : ""} ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold"><MathText text={p.label} /></p>
        <div role="group" aria-label={plainLabel(p.label)} className="flex flex-wrap gap-1.5">{p.options.map((o, k) => { const s = sel.includes(k);
          return <button key={o} type="button" aria-pressed={s} aria-label={plainLabel(o)} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} className={`btn btn-sm h-auto min-h-11 min-w-12 py-1 text-base ${s ? on : "btn-outline"}`}><MathText text={o} /></button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "shade": return <ShadeGrid p={p} value={value} set={set} checked={checked} />;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><MathText text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: RQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeSevenRational() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  const totalSections = topics.reduce((a, x) => a + x.sections.length, 0);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 7, Bab 2</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bilangan Rasional</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Kenali bilangan di antara dua bilangan bulat, ubah pecahan dan desimal, bandingkan dan urutkan, lalu hitung penjumlahan, pengurangan, perkalian, dan pembagiannya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-56"><MeasuringSet /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Sisa <MathText text="{5/8}" /> pizza dan suhu 36,6°C</h2>
        <p className="mt-2 text-sm">Bilangan bulat tidak cukup untuk menyatakan sisa pizza, suhu badan, atau kecepatan internet 15,22 Mbps. Di bab ini kamu memakai bilangan rasional.</p>
        <p className="mt-2 text-sm text-base-content/60">{totalSections} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-rasional">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-rasional" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.2fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><MathText text={x} /></li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-6"><MathText text={s.example} /></p>}
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
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
      </> : <GradeFourQuiz<RQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
