"use client";

import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, correct, decimalText, formatAnswer, fracText, groups, practice, ready, simplify, topics,
  type FDQuestion, type Frac, type Item,
} from "@/data/grade-six-fractions-decimals";
import {
  Bottle, Bucket, Container, Fr, GardenPlot, Glass, itemName, MathText, PlaceChart, placeNames, SceneView, Tree,
} from "./GradeSixVisuals";

/* ====================================================================== */
/* Komponen kecil                                                          */
/* ====================================================================== */
const chip = (active: boolean) => `btn btn-sm h-auto min-h-9 ${active ? "btn-info text-white" : "btn-outline"}`;
function Chips<T>({ label, items, value, onChange, text }: { label: string; items: T[]; value: T; onChange: (v: T) => void; text: (v: T) => ReactNode }) {
  return <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
    <span className="me-1 text-sm font-bold">{label}</span>
    {items.map((item, i) => <button key={i} type="button" className={chip(item === value)} aria-pressed={item === value} onClick={() => onChange(item)}>{text(item)}</button>)}
  </div>;
}
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return <div className="flex items-center gap-2" role="group" aria-label={label}>
    <span className="text-sm font-bold">{label}</span>
    <button type="button" className="btn btn-sm btn-square btn-outline" aria-label={`Kurangi ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
    <output className="w-7 text-center text-lg font-extrabold tabular-nums">{value}</output>
    <button type="button" className="btn btn-sm btn-square btn-outline" aria-label={`Tambah ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
  </div>;
}
const FracNode = ({ f, mixed = false }: { f: Frac; mixed?: boolean }) => <MathText text={fracText(f, mixed)} />;
function Result({ value, children, tone = "success" }: { value: string; children: ReactNode; tone?: "success" | "warning" | "info" }) {
  return <output data-testid="lab-result" data-value={value} aria-live="polite"
    className={`block rounded-lg p-3 text-sm leading-7 ${tone === "success" ? "bg-success/10" : tone === "warning" ? "bg-warning/20" : "bg-info/10"}`}>{children}</output>;
}
function LabFrame({ title, intro, visual, controls }: { title: string; intro: string; visual: ReactNode; controls: ReactNode }) {
  return <div className="grid min-w-0 gap-5 rounded-2xl border border-base-300 bg-base-100 p-4 lg:grid-cols-[1.15fr_1fr] lg:p-6">
    <div className="min-w-0 rounded-xl bg-[linear-gradient(#e0f2fe80_1px,transparent_1px),linear-gradient(90deg,#e0f2fe80_1px,transparent_1px)] bg-[size:18px_18px] p-3">{visual}</div>
    <div className="min-w-0 space-y-3">
      <h3 className="text-2xl font-extrabold">{title}</h3>
      <p className="text-sm leading-6 text-base-content/70">{intro}</p>
      {controls}
    </div>
  </div>;
}

/* ====================================================================== */
/* A.1 Lab kebun: n × a/b                                                  */
/* ====================================================================== */
const gardenFracs: Frac[] = [[3, 5], [2, 3], [3, 4], [5, 6], [4, 7]];
function GardenLab() {
  const [per, setPer] = useState<Frac>(gardenFracs[0]);
  const [count, setCount] = useState(2);
  const [joined, setJoined] = useState(false);
  const [a, b] = per, total = count * a, wholes = Math.floor(total / b), rest = total % b;
  const result = fracText([total, b]);
  return <LabFrame title="Kebun dan Ember Kecil" intro="Satu ember kecil menyiram sebagian petak 1 m². Tambah embernya dan hitung potongan bedeng yang tersiram."
    visual={<div className="space-y-3">
      {!joined ? <div className="flex flex-wrap gap-3">{Array.from({ length: count }, (_, i) => <figure key={i} className="flex items-end gap-0.5">
        <GardenPlot parts={b} filled={a} className="w-20 sm:w-28" /><div className="text-center"><Bucket className="h-11 w-10" /><figcaption className="text-[10px] font-bold">Ember {i + 1}</figcaption></div>
      </figure>)}</div>
        : <div className="flex flex-wrap gap-3">{Array.from({ length: wholes }, (_, i) => <figure key={i} className="text-center"><GardenPlot parts={b} filled={b} className="w-20 sm:w-28" /><figcaption className="text-xs font-bold">1 m²</figcaption></figure>)}
          {rest > 0 && <figure className="text-center"><GardenPlot parts={b} filled={rest} className="w-20 sm:w-28" /><figcaption className="text-xs font-bold"><MathText text={`${rest}/${b} m²`} /></figcaption></figure>}</div>}
      <table className="table table-sm max-w-xs bg-base-100 text-center">
        <thead><tr><th>Banyak ember kecil</th><th>Luas kebun (m²)</th></tr></thead>
        <tbody><tr><td>1</td><td><FracNode f={per} /></td></tr><tr><td>{count}</td><td><MathText text={`${total}/${b}`} /></td></tr></tbody>
      </table>
    </div>}
    controls={<>
      <Chips label="1 ember =" items={gardenFracs} value={per} onChange={f => { setPer(f); setJoined(false); }} text={f => <><FracNode f={f} /> m²</>} />
      <Stepper label="Ember" value={count} min={1} max={6} onChange={v => { setCount(v); setJoined(false); }} />
      <button type="button" className="btn btn-sm btn-success" onClick={() => setJoined(v => !v)}>{joined ? "Pisahkan per ember" : "Gabungkan potongan"}</button>
      <Result value={`${count}x${a}/${b}=${result}`}>
        <strong>{count} × <Fr n={a} d={b} /> = <Fr n={`${count} × ${a}`} d={b} /> = <Fr n={total} d={b} /></strong> m²
        {total >= b && <> = <FracNode f={[total, b]} mixed /> m²</>}.
        <br />Ada {count} kelompok, masing-masing {a} bagian <Fr n={1} d={b} />, jadi {total} bagian <Fr n={1} d={b} />.
        {joined && <> Disusun ulang menjadi {wholes} petak penuh{rest ? <> dan <Fr n={rest} d={b} /> petak</> : ""}.</>}
      </Result>
    </>} />;
}

/* ====================================================================== */
/* A.2 Lab pohon mangga: a/b × n                                           */
/* ====================================================================== */
const treeCases: { total: number; f: Frac }[] = [{ total: 15, f: [2, 3] }, { total: 12, f: [3, 4] }, { total: 20, f: [2, 5] }, { total: 18, f: [5, 6] }, { total: 24, f: [3, 8] }];
function TreeLab() {
  const [pick, setPick] = useState(treeCases[0]);
  const [marked, setMarked] = useState<number[]>([]);
  const { total, f: [a, b] } = pick, per = total / b, trees = marked.length * per, done = marked.length === a;
  return <LabFrame title="Kebun Mangga Agam" intro="Pohon dibagi otomatis menjadi kelompok yang sama banyak sesuai penyebut. Ketuk kelompok untuk menandai bagian yang dicari."
    visual={<div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${b > 4 ? 2 : 1}, minmax(0,1fr))` }}>
      {Array.from({ length: b }, (_, g) => {
        const on = marked.includes(g);
        return <button key={g} type="button" aria-pressed={on} aria-label={`Kelompok ${g + 1}, ${per} pohon`}
          className={`flex flex-wrap items-center gap-0.5 rounded-lg border-2 p-1 text-left transition ${on ? "border-rose-500 bg-rose-100" : "border-dashed border-success/40 bg-base-100 hover:border-success"}`}
          onClick={() => setMarked(m => on ? m.filter(x => x !== g) : [...m, g])}>
          <span className="w-6 text-xs font-bold text-base-content/60">{g + 1}</span>
          {Array.from({ length: per }, (_, i) => <Tree key={i} item="mango" fruit={on} className="size-7" />)}
        </button>;
      })}
    </div>}
    controls={<>
      <Chips label="Soal" items={treeCases} value={pick} onChange={p => { setPick(p); setMarked([]); }} text={p => <><FracNode f={p.f} /> dari {p.total}</>} />
      <p className="text-sm">{total} pohon ÷ {b} kelompok = <strong>{per} pohon</strong> per kelompok.</p>
      <Result value={String(trees)} tone={done ? "success" : marked.length > a ? "warning" : "info"}>
        Ditandai {marked.length} kelompok = <strong>{trees} pohon</strong>.{" "}
        {done ? <><strong><Fr n={a} d={b} /> × {total} = <Fr n={`${a} × ${total}`} d={b} /> = {trees}</strong> pohon mangga manalagi.</>
          : marked.length > a ? <>Terlalu banyak. Pembilang {a} berarti ambil {a} kelompok saja.</>
          : <>Tandai {a} dari {b} kelompok (pembilang = {a}).</>}
      </Result>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMarked([])}>Hapus tanda</button>
    </>} />;
}

/* ====================================================================== */
/* B.1 Lab menuang: a/b ÷ n                                               */
/* ====================================================================== */
const pourAmounts: Frac[] = [[1, 1], [1, 2], [1, 3], [2, 3], [3, 4]];
const glassColors = ["#0ea5e9", "#f97316", "#8b5cf6", "#10b981", "#f43f5e"];
function PourLab() {
  const [amount, setAmount] = useState<Frac>([1, 2]);
  const [glasses, setGlasses] = useState(3);
  const [poured, setPoured] = useState(false);
  const [a, b] = amount, rows = b * glasses, share = simplify([a, b * glasses]);
  return <LabFrame title="Membagi Air ke Gelas" intro="Kotak tinggi menggambarkan 1 liter. Tekan Tuang untuk membagi air menjadi bagian yang sama untuk setiap gelas."
    visual={<div className="flex flex-wrap items-end gap-4">
      <figure className="text-center">
        <div className="flex h-44 w-24 flex-col-reverse overflow-hidden rounded border-2 border-sky-800 bg-white" role="img" aria-label={`Model 1 liter dibagi ${poured ? rows : b} bagian`}>
          {Array.from({ length: poured ? rows : b }, (_, i) => {
            const filled = poured ? i < a * glasses : i < a;
            const glass = poured ? Math.floor(i / a) % glasses : -1;
            return <span key={i} className="flex flex-1 items-center justify-center border-t border-sky-800/40 text-[10px] font-bold text-white"
              style={{ background: filled ? (poured ? glassColors[glass] : "#7dd3fc") : "#fff" }}>{poured && filled && rows <= 12 ? `G${glass + 1}` : ""}</span>;
          })}
        </div>
        <figcaption className="mt-1 text-xs font-bold">1 liter · isi <FracNode f={amount} /></figcaption>
      </figure>
      <div className="flex flex-wrap gap-2">{Array.from({ length: glasses }, (_, i) => <figure key={i} className="text-center">
        <Glass level={poured ? Math.min(1, 2 * share[0] / share[1]) : 0} color={glassColors[i]} className="h-16 w-11" />
        <figcaption className="text-[11px] font-bold">Gelas {i + 1}{poured && <><br /><FracNode f={share} /> L</>}</figcaption>
      </figure>)}</div>
    </div>}
    controls={<>
      <Chips label="Isi botol" items={pourAmounts} value={amount} onChange={f => { setAmount(f); setPoured(false); }} text={f => <><FracNode f={f} /> L</>} />
      <Stepper label="Gelas" value={glasses} min={2} max={5} onChange={v => { setGlasses(v); setPoured(false); }} />
      <button type="button" className="btn btn-sm btn-success" onClick={() => setPoured(p => !p)}>{poured ? "Kembalikan ke botol" : "Tuang"}</button>
      <Result value={fracText(share)} tone={poured ? "success" : "info"}>
        {poured ? <><strong><FracNode f={amount} /> ÷ {glasses} = <FracNode f={amount} /> × <Fr n={1} d={glasses} /> = <Fr n={a} d={b * glasses} />{fracText(share) !== `${a}/${b * glasses}` && <> = <FracNode f={share} /></>}</strong> liter per gelas.
          <br />Setiap bagian <Fr n={1} d={b} /> dipotong menjadi {glasses}, sehingga 1 liter kini terdiri atas {rows} bagian.</>
          : <>Perkirakan dulu: apakah setiap gelas mendapat lebih banyak atau lebih sedikit dari <FracNode f={amount} /> liter?</>}
      </Result>
    </>} />;
}

/* ====================================================================== */
/* B.2 Lab jus: n ÷ a/b                                                    */
/* ====================================================================== */
const caps: Frac[] = [[1, 2], [1, 3], [1, 4], [1, 5], [2, 5], [3, 4], [2, 3]];
function JuiceLab() {
  const [bottles, setBottles] = useState(3);
  const [cap, setCap] = useState<Frac>([1, 4]);
  const [filled, setFilled] = useState(0);
  const [a, b] = cap, parts = bottles * b, used = filled * a, left = parts - used, canFill = left >= a;
  const exact = fracText([bottles * b, a], true);
  const reset = () => setFilled(0);
  return <LabFrame title="Menuang Jus ke Gelas" intro="Setiap botol 1 liter dibagi menjadi bagian sebesar penyebut ukuran gelas. Isi gelas satu per satu sampai jus tidak cukup lagi."
    visual={<div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">{Array.from({ length: bottles }, (_, i) => <figure key={i} className="text-center">
        <Container item="juice" split={b} used={Math.max(0, Math.min(b, used - i * b))} className="h-24 w-12" />
        <figcaption className="text-[10px] font-bold">Botol {i + 1}</figcaption>
      </figure>)}</div>
      <div className="flex min-h-14 flex-wrap gap-1" aria-label={`${filled} gelas penuh`}>
        {Array.from({ length: filled }, (_, i) => <Glass key={i} level={1} color="#fb923c" className="h-12 w-8" />)}
        {filled === 0 && <p className="self-center text-sm text-base-content/60">Belum ada gelas terisi.</p>}
      </div>
    </div>}
    controls={<>
      <Stepper label="Botol" value={bottles} min={1} max={4} onChange={v => { setBottles(v); reset(); }} />
      <Chips label="Gelas" items={caps} value={cap} onChange={f => { setCap(f); reset(); }} text={f => <><FracNode f={f} /> L</>} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm btn-success" disabled={!canFill} onClick={() => setFilled(v => v + 1)}>Isi 1 gelas</button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>Ulangi</button>
      </div>
      <Result value={String(filled)} tone={canFill ? "info" : "success"}>
        {filled} gelas penuh. Sisa jus <FracNode f={[left, b]} /> liter.
        {!canFill && <><br /><strong>{bottles} ÷ <FracNode f={cap} /> = {bottles} × <Fr n={b} d={a} /> = <MathText text={exact} /></strong> gelas.
          {left > 0 && <> Jadi {filled} gelas penuh dan sisanya cukup untuk <FracNode f={[left, a]} /> gelas.</>}</>}
      </Result>
    </>} />;
}

/* ====================================================================== */
/* C.1 Lab 100 petak: pecahan → desimal                                    */
/* ====================================================================== */
const decimalFracs: Frac[] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 10], [7, 20], [9, 25]];
function GridPicker({ value, onChange, disabled = false, highlight }: { value: number[]; onChange: (v: number[]) => void; disabled?: boolean; highlight?: number }) {
  const [brush, setBrush] = useState<"cell" | "column">("column");
  const toggle = (i: number) => {
    if (brush === "cell") onChange(value.includes(i) ? value.filter(x => x !== i) : [...value, i].sort((x, y) => x - y));
    else {
      const col = Array.from({ length: 10 }, (_, r) => Math.floor(i / 10) * 10 + r);
      const full = col.every(c => value.includes(c));
      onChange(full ? value.filter(x => !col.includes(x)) : [...new Set([...value, ...col])].sort((x, y) => x - y));
    }
  };
  return <div className="space-y-2">
    <div role="group" aria-label="Kuas arsir" className="flex flex-wrap gap-1.5">
      <button type="button" className={chip(brush === "column")} aria-pressed={brush === "column"} onClick={() => setBrush("column")}>Kuas 1 kolom (0,1)</button>
      <button type="button" className={chip(brush === "cell")} aria-pressed={brush === "cell"} onClick={() => setBrush("cell")}>Kuas 1 petak (0,01)</button>
      <button type="button" className="btn btn-sm btn-ghost" disabled={disabled || !value.length} onClick={() => onChange([])}>Hapus</button>
    </div>
    <div className="grid aspect-square w-full max-w-72 grid-flow-col grid-rows-10 gap-px border border-slate-500 bg-slate-400">
      {Array.from({ length: 100 }, (_, i) => <button key={i} type="button" aria-label={`Petak ${i + 1}`} aria-pressed={value.includes(i)} disabled={disabled}
        className={`min-h-0 min-w-0 ${value.includes(i) ? "bg-orange-400" : highlight !== undefined && i < highlight ? "bg-orange-100" : "bg-white"} focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-700`}
        onClick={() => toggle(i)} />)}
    </div>
    <p aria-live="polite" className="text-sm font-semibold">{value.length} dari 100 petak = <Fr n={value.length} d={100} /> = {decimalText(value.length / 100, 2)}</p>
  </div>;
}
function DecimalLab() {
  const [target, setTarget] = useState<Frac>([1, 4]);
  const [cells, setCells] = useState<number[]>([]);
  const [a, b] = target, k = 100 / b, hundredths = a * k, done = cells.length === hundredths;
  const tenths = b <= 10 && 10 % b === 0;
  return <LabFrame title="Petak Perseratus" intro="Seluruh persegi bernilai 1. Arsir petak sesuai pecahan, lalu baca bilangan desimalnya."
    visual={<div className="space-y-3">
      <GridPicker value={cells} onChange={setCells} />
      <div className="max-w-72" aria-hidden="true">
        <div className="relative h-6 border-b-2 border-slate-600">
          {Array.from({ length: 11 }, (_, i) => <span key={i} className="absolute bottom-0 h-2 w-px bg-slate-600" style={{ left: `${i * 10}%` }} />)}
          <span className="absolute -bottom-1.5 size-3 -translate-x-1/2 rounded-full bg-orange-500 transition-all" style={{ left: `${cells.length}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold"><span>0</span><span>0,5</span><span>1</span></div>
      </div>
    </div>}
    controls={<>
      <Chips label="Pecahan" items={decimalFracs} value={target} onChange={f => { setTarget(f); setCells([]); }} text={f => <FracNode f={f} />} />
      <ol className="list-decimal space-y-1 ps-5 text-sm">
        <li>Ubah penyebut menjadi 100: <Fr n={a} d={b} /> = <Fr n={`${a} × ${k}`} d={`${b} × ${k}`} /> = <Fr n={hundredths} d={100} />.</li>
        {tenths && <li>Bisa juga persepuluhan: <Fr n={a} d={b} /> = <Fr n={a * 10 / b} d={10} /> = {decimalText(a / b)}.</li>}
        <li>Arsir {hundredths} petak ({Math.floor(hundredths / 10)} kolom dan {hundredths % 10} petak).</li>
      </ol>
      <Result value={decimalText(cells.length / 100, 2)} tone={done ? "success" : "info"}>
        Arsiranmu: <strong>{decimalText(cells.length / 100, 2)}</strong>.{" "}
        {done ? <>Tepat! <Fr n={a} d={b} /> = {decimalText(a / b, 2)}{decimalText(a / b) !== decimalText(a / b, 2) && <> = {decimalText(a / b)}</>}.</>
          : cells.length > hundredths ? <>Terlalu banyak {cells.length - hundredths} petak.</> : <>Kurang {hundredths - cells.length} petak lagi.</>}
      </Result>
    </>} />;
}

/* ====================================================================== */
/* C.2 Lab nilai tempat: membandingkan desimal                            */
/* ====================================================================== */
function Blocks({ digits }: { digits: number[] }) {
  const [p, s, t, h] = digits;
  return <div className="flex min-h-16 flex-wrap items-end gap-1" aria-hidden="true">
    {Array.from({ length: p }, (_, i) => <span key={`p${i}`} className="grid size-11 place-items-center rounded-sm bg-emerald-600 text-[10px] font-bold text-white">10</span>)}
    {Array.from({ length: s }, (_, i) => <span key={`s${i}`} className="size-9 rounded-sm border border-sky-800 bg-sky-300" />)}
    {Array.from({ length: t }, (_, i) => <span key={`t${i}`} className="h-9 w-1.5 rounded-sm border border-sky-800 bg-sky-200" />)}
    {Array.from({ length: h }, (_, i) => <span key={`h${i}`} className="size-1.5 bg-sky-700" />)}
  </div>;
}
const toNumber = (d: number[]) => `${d[0] ? d[0] : ""}${d[1]},${d[2]}${d[3]}`;
function CompareLab() {
  const [x, setX] = useState([0, 3, 4, 8]);
  const [y, setY] = useState([0, 3, 7, 0]);
  const first = x.findIndex((d, i) => d !== y[i]);
  const sign = first < 0 ? "=" : x[first] > y[first] ? ">" : "<";
  const editor = (name: string, d: number[], set: (v: number[]) => void) => <fieldset className="min-w-0 rounded-lg border border-base-300 p-2">
    <legend className="px-1 text-sm font-bold">Bilangan {name}: {toNumber(d)}</legend>
    <div className="grid grid-cols-4 gap-1">{placeNames.map((p, i) => <label key={p} className="min-w-0 text-center text-[10px] font-semibold">
      <span className="block min-h-6 break-words leading-tight hyphens-manual">{["Puluhan", "Satuan", "Per\u00adsepuluhan", "Per\u00adseratusan"][i]}</span>
      <select aria-label={`Bilangan ${name} ${p.toLowerCase()}`} className="select select-sm w-full min-w-0 px-1 text-center font-bold" value={d[i]}
        onChange={e => set(d.map((v, j) => j === i ? Number(e.target.value) : v))}>
        {Array.from({ length: 10 }, (_, n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </label>)}</div>
  </fieldset>;
  return <LabFrame title="Papan Nilai Tempat" intro="Bandingkan dari nilai tempat terbesar. Nilai tempat pertama yang berbeda disorot kuning."
    visual={<div className="space-y-3">
      <PlaceChart values={[toNumber(x), toNumber(y)]} highlight={first < 0 ? undefined : first} />
      <div className="grid gap-2 sm:grid-cols-2">
        <figure><figcaption className="text-xs font-bold">{toNumber(x)}</figcaption><Blocks digits={x} /></figure>
        <figure><figcaption className="text-xs font-bold">{toNumber(y)}</figcaption><Blocks digits={y} /></figure>
      </div>
      <p className="text-xs text-base-content/60">Persegi besar = satuan, batang = persepuluhan (0,1), kotak kecil = perseratusan (0,01).</p>
    </div>}
    controls={<>
      {editor("A", x, setX)}{editor("B", y, setY)}
      <Result value={sign}>
        <strong className="text-lg tabular-nums">{toNumber(x)} {sign} {toNumber(y)}</strong><br />
        {first < 0 ? "Semua nilai tempat sama." : <>Nilai tempat {placeNames[first].toLowerCase()} berbeda: {x[first]} {sign} {y[first]}. Nilai tempat sebelumnya sama, jadi tempat inilah yang menentukan.</>}
      </Result>
    </>} />;
}

const labs = [GardenLab, TreeLab, PourLab, JuiceLab, DecimalLab, CompareLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
type AnswerProps = { q: FDQuestion; value: string; record: (v: string) => void; checked: boolean };

function ChoiceAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "choice" && r.kind !== "multi") return null;
  const selected = value ? value.split("|") : [];
  const pick = (o: string) => record(r.kind === "multi" ? (selected.includes(o) ? selected.filter(s => s !== o) : [...selected, o]).sort().join("|") : o);
  if (r.pictures) return <div className="space-y-2">
    {r.kind === "multi" && <p className="text-sm">Boleh memilih lebih dari satu gambar.</p>}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{r.options.map((o, i) => <button key={o} type="button" aria-label={`Gambar ${o}`} aria-pressed={selected.includes(o)} disabled={checked}
      className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border-2 p-2 ${selected.includes(o) ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/60"}`} onClick={() => pick(o)}>
      <span className="self-start rounded bg-base-200 px-1.5 text-xs font-extrabold">{o}</span>
      <div className="w-full min-w-0"><SceneView scene={r.pictures![i]} /></div>
    </button>)}</div>
  </div>;
  return <div className="grid gap-2 sm:grid-cols-2">{r.options.map(o => <button key={o} type="button" aria-pressed={selected.includes(o)} disabled={checked}
    className={`min-h-12 rounded-xl border-2 px-4 py-2 text-left font-semibold ${selected.includes(o) ? "border-success bg-success/15" : "border-base-300 bg-base-100 hover:border-success/60"}`} onClick={() => pick(o)}>
    <span className="sr-only">{o}</span><span aria-hidden="true"><MathText text={o} /></span>
  </button>)}</div>;
}

function FractionAnswer({ q, value, record, checked }: AnswerProps) {
  const [w = "", n = "", d = ""] = value ? value.split("|") : [];
  const set = (i: number, v: string) => record([w, n, d].map((x, j) => j === i ? v.replace(/\D/g, "").slice(0, 4) : x).join("|"));
  const box = (i: number, label: string, v: string, cls = "w-16") => <input aria-label={label} inputMode="numeric" disabled={checked} value={v} onChange={e => set(i, e.target.value)}
    className={`input input-bordered input-sm h-10 ${cls} text-center text-lg font-bold tabular-nums`} />;
  return <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-2">
      {box(0, "Bilangan bulat", w, "w-14")}
      <div className="flex flex-col items-center gap-1">{box(1, "Pembilang", n)}<span className="h-0 w-16 border-t-2 border-base-content" />{box(2, "Penyebut", d)}</div>
      {q.response.kind === "fraction" && q.response.unit && <span className="font-bold">{q.response.unit}</span>}
    </div>
    <p className="max-w-56 text-xs text-base-content/60">Kosongkan bilangan bulat untuk pecahan biasa. Isi untuk pecahan campuran.</p>
  </div>;
}

function TextAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response, decimal = r.kind === "decimal";
  const unit = r.kind === "decimal" || r.kind === "number" ? r.unit : undefined;
  return <label className="flex flex-wrap items-center gap-2 font-bold">{decimal ? "Desimal" : "Jawaban"}
    <input aria-label={decimal ? "Jawaban desimal" : "Jawaban"} inputMode={decimal ? "decimal" : "numeric"} disabled={checked} value={value}
      placeholder={decimal ? "contoh 0,3" : ""} className="input input-bordered w-32 text-lg tabular-nums"
      onChange={e => record(decimal ? e.target.value.replace(/[^\d,.]/g, "").replace(".", ",").slice(0, 8) : e.target.value.replace(/\D/g, "").slice(0, 6))} />
    {unit && <span>{unit}</span>}
  </label>;
}

function ShadeAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "shade") return null;
  const rows = value ? value.split("|") : Array.from({ length: r.wholes }, () => "0".repeat(r.parts));
  const tone = { Pita: "bg-rose-500", Lahan: "bg-lime-500", Liter: "bg-sky-500" }[r.label];
  const flip = (w: number, p: number) => record(rows.map((row, i) => i !== w ? row : [...row].map((c, j) => j === p ? (c === "1" ? "0" : "1") : c).join("")).join("|"));
  return <div className="space-y-2">
    <p className="text-sm">Ketuk bagian untuk mengarsir atau menghapus arsiran.</p>
    {rows.map((row, w) => <div key={w} className="min-w-0">
      <div className={`grid gap-1 ${r.label === "Lahan" ? "h-20" : "h-10"}`} style={{ gridTemplateColumns: `repeat(${r.parts}, minmax(0,1fr))` }}>
        {[...row].map((c, p) => <button key={p} type="button" aria-label={`${r.label} ${w + 1} bagian ${p + 1}`} aria-pressed={c === "1"} disabled={checked}
          className={`min-w-0 rounded border-2 border-slate-600 ${c === "1" ? tone : r.label === "Lahan" ? "bg-lime-50" : "bg-white"}`} onClick={() => flip(w, p)} />)}
      </div>
      <p className="text-xs font-semibold text-base-content/70">{r.label} {w + 1}{r.label === "Pita" ? " · 1 m" : r.label === "Liter" ? " · 1 liter" : ""}: {[...row].filter(c => c === "1").length} dari {r.parts} bagian</p>
    </div>)}
  </div>;
}

function GridAnswer({ value, record, checked }: AnswerProps) {
  const cells = value ? value.split(",").map(Number) : [];
  return <GridPicker value={cells} disabled={checked} onChange={v => record(v.join(","))} />;
}

function MarkAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "mark") return null;
  const marked = value ? value.split(",").map(Number) : [];
  const per = r.total / r.groups, item: Item = r.item;
  return <div className="space-y-2">
    <div className="flex flex-wrap gap-1.5">{Array.from({ length: r.groups }, (_, g) => <div key={g} className="flex flex-wrap gap-0.5 rounded-lg border border-dashed border-success/50 p-1">
      {Array.from({ length: per }, (_, k) => {
        const i = g * per + k, on = marked.includes(i);
        return <button key={i} type="button" aria-label={`${itemName(item)} ${i + 1}`} aria-pressed={on} disabled={checked}
          className={`relative rounded-md p-0.5 ${on ? "bg-rose-100 ring-2 ring-rose-500" : "hover:bg-success/10"}`}
          onClick={() => record((on ? marked.filter(x => x !== i) : [...marked, i]).sort((x, y) => x - y).join(","))}>
          <Tree item={item} fruit={on} className="size-8" />
          {on && <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white" aria-hidden="true">✓</span>}
        </button>;
      })}
    </div>)}</div>
    <p aria-live="polite" className="text-sm font-semibold">{marked.length} dari {r.total} ditandai</p>
  </div>;
}

function OrderAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "order") return null;
  const chosen = value ? value.split("|") : [];
  return <div className="space-y-2">
    <p className="text-sm">Ketuk sesuai urutan. Nomor muncul pada pilihan yang sudah diketuk.</p>
    <div className="flex flex-wrap gap-2">{r.options.map(o => {
      const at = chosen.indexOf(o);
      return <button key={o} type="button" disabled={checked || at >= 0} aria-pressed={at >= 0}
        className={`btn h-auto min-h-11 gap-2 whitespace-normal ${at >= 0 ? "btn-info text-white disabled:bg-info disabled:text-white" : "btn-outline"}`}
        onClick={() => record([...chosen, o].join("|"))}>
        {at >= 0 && <span className="badge badge-sm bg-white text-info" aria-hidden="true">{at + 1}</span>}{o}
      </button>;
    })}</div>
    <p aria-live="polite" className="text-sm font-semibold">{chosen.length ? chosen.map(c => c.split(" · ")[0]).join(" → ") : "Belum ada urutan."}</p>
    <div className="flex gap-2">
      <button type="button" className="btn btn-ghost btn-sm" disabled={checked || !chosen.length} onClick={() => record(chosen.slice(0, -1).join("|"))}>Batalkan terakhir</button>
      <button type="button" className="btn btn-ghost btn-sm" disabled={checked || !chosen.length} onClick={() => record("")}>Ulangi</button>
    </div>
  </div>;
}

const pairColors = ["bg-sky-500", "bg-orange-500", "bg-violet-500", "bg-emerald-600"];
function MatchAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  const [active, setActive] = useState<string | null>(null);
  if (r.kind !== "match") return null;
  const pairs = new Map(value ? value.split("|").map(p => p.split("=") as [string, string]) : []);
  const save = (m: Map<string, string>) => record(r.left.filter(l => m.has(l)).map(l => `${l}=${m.get(l)}`).join("|"));
  const colorOf = (l: string) => pairColors[r.left.indexOf(l)];
  const leftOf = (d: string) => [...pairs].find(([, v]) => v === d)?.[0];
  return <div className="space-y-2">
    <p className="text-sm">Ketuk satu pecahan, lalu ketuk desimal pasangannya. Warna yang sama berarti berpasangan.</p>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">{r.left.map(l => <button key={l} type="button" aria-label={`Pecahan ${l}`} aria-pressed={active === l} disabled={checked}
        className={`btn h-14 w-full gap-2 text-lg ${active === l ? "btn-warning" : "btn-outline"}`}
        onClick={() => { if (pairs.has(l)) { pairs.delete(l); save(pairs); } setActive(active === l ? null : l); }}>
        <MathText text={l} />{pairs.has(l) && <span className={`size-3 rounded-full ${colorOf(l)}`} aria-hidden="true" />}
      </button>)}</div>
      <div className="space-y-2">{r.right.map(d => {
        const owner = leftOf(d);
        return <button key={d} type="button" aria-label={`Desimal ${d}`} disabled={checked || !active} aria-pressed={Boolean(owner)}
          className={`btn h-14 w-full gap-2 text-lg tabular-nums ${owner ? "btn-outline border-2" : "btn-outline"}`}
          onClick={() => { if (!active) return; for (const [k, v] of pairs) if (v === d) pairs.delete(k); pairs.set(active, d); save(pairs); setActive(null); }}>
          {owner && <span className={`size-3 rounded-full ${colorOf(owner)}`} aria-hidden="true" />}{d}
        </button>;
      })}</div>
    </div>
    <p aria-live="polite" className="text-sm font-semibold">{pairs.size} dari {r.left.length} pasangan</p>
  </div>;
}

function LineAnswer({ q, value, record, checked }: AnswerProps) {
  const r = q.response;
  if (r.kind !== "line") return null;
  const ticks = Array.from({ length: r.to - r.from + 1 }, (_, i) => r.from + i);
  return <div className="max-w-lg px-3 pb-2 pt-8">
    <div className="relative h-10">
      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-700" />
      {ticks.map((t, i) => {
        const on = value === String(t), pct = i / (ticks.length - 1) * 100, major = i === 0 || i === ticks.length - 1 || i === (ticks.length - 1) / 2;
        return <button key={t} type="button" aria-label={`Titik ${decimalText(t / 100, 2)}`} aria-pressed={on} disabled={checked}
          className="absolute top-0 flex h-10 w-7 -translate-x-1/2 flex-col items-center justify-center" style={{ left: `${pct}%` }} onClick={() => record(String(t))}>
          <span className={`w-0.5 bg-slate-700 ${major ? "h-5" : "h-3"}`} />
          {on && <span className="absolute -top-6 grid size-6 place-items-center rounded-full bg-rose-500 text-xs font-bold text-white" aria-hidden="true">▼</span>}
          {major && <span className="absolute top-10 text-xs font-bold tabular-nums">{decimalText(t / 100, 2)}</span>}
        </button>;
      })}
    </div>
    <p aria-live="polite" className="mt-6 text-sm font-semibold">{value ? `Titik dipilih: ${decimalText(Number(value) / 100, 2)}` : "Ketuk salah satu garis kecil."}</p>
  </div>;
}

function PlaceAnswer({ value, record, checked }: AnswerProps) {
  const digits = value ? value.split("|") : ["", "", "", ""];
  return <div className="grid max-w-md grid-cols-4 gap-2">{placeNames.map((p, i) => <label key={p} className="min-w-0 text-center text-xs font-bold">
    <span className="block truncate">{p}</span>
    <input aria-label={p} inputMode="numeric" maxLength={1} disabled={checked} value={digits[i] ?? ""}
      className={`input input-bordered mt-1 h-12 w-full text-center text-xl font-extrabold ${i === 2 ? "border-l-4" : ""}`}
      onChange={e => record(digits.map((d, j) => j === i ? e.target.value.replace(/\D/g, "").slice(-1) : d).join("|"))} />
  </label>)}</div>;
}

function AnswerArea(props: AnswerProps) {
  switch (props.q.response.kind) {
    case "choice": case "multi": return <ChoiceAnswer {...props} />;
    case "fraction": return <FractionAnswer {...props} />;
    case "decimal": case "number": return <TextAnswer {...props} />;
    case "shade": return <ShadeAnswer {...props} />;
    case "grid": return <GridAnswer {...props} />;
    case "mark": return <MarkAnswer {...props} />;
    case "order": return <OrderAnswer {...props} />;
    case "match": return <MatchAnswer {...props} />;
    case "line": return <LineAnswer {...props} />;
    case "place": return <PlaceAnswer {...props} />;
  }
}

/* ====================================================================== */
/* Halaman bab                                                             */
/* ====================================================================== */
function Ornaments() {
  return <svg aria-hidden="true" viewBox="0 0 320 200" className="pointer-events-none absolute -right-6 top-0 hidden h-full w-[22rem] text-info/30 md:block">
    <g fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="250" cy="60" r="34" /><path d="M250 26v68M216 60h34" /><path d="M250 60L274 84" />
      <path d="M60 150h120" /><path d="M60 142v16M90 146v8M120 142v16M150 146v8M180 142v16" />
      <path d="M232 120h28l-6 10v26l14 24h-44l14-24v-26z" />
      <path d="M150 30l40 0l-20 34z" />
    </g>
    <text x="40" y="70" fontSize="30" fontWeight="800" fill="currentColor">¾</text>
    <text x="110" y="110" fontSize="22" fontWeight="800" fill="currentColor">0,75</text>
    <text x="270" y="190" fontSize="22" fontWeight="800" fill="currentColor">÷</text>
  </svg>;
}

export default function GradeSixFractionsDecimals() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic];
  const Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <header className="relative overflow-hidden rounded-2xl border border-base-300 bg-[linear-gradient(#e0f2fe_1px,transparent_1px),linear-gradient(90deg,#e0f2fe_1px,transparent_1px)] bg-[size:22px_22px] p-5 sm:p-8">
      <Ornaments />
      <p className="relative text-xs font-bold uppercase tracking-widest text-success">Kelas 6 · Bab 1</p>
      <h1 className="relative mt-2 text-3xl font-extrabold sm:text-5xl">Pecahan dan Desimal</h1>
      <p className="relative mt-3 max-w-2xl text-base-content/70">Kalikan dan bagi pecahan lewat kebun, botol, dan gelas, lalu ubah pecahan menjadi desimal dan bandingkan nilainya.</p>
    </header>

    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-44 flex-col items-center justify-center bg-gradient-to-br from-info/10 to-success/10 p-6 text-center">
        <div className="flex items-end gap-2" aria-hidden="true"><Bucket className="h-10 w-9" /><Bottle fill={0.5} label="½ L" className="h-14 w-7" /><Glass level={0.6} className="h-10 w-7" /><span className="text-2xl font-extrabold text-info">0,5</span></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Belum ada video. Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Amati, coba, lalu buktikan</h2>
        <p className="mt-2 text-sm text-base-content/60">6 materi interaktif, {practice.flat().length} latihan materi, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#bab-content">Mulai belajar</a>
      </div>
    </div>

    <div id="bab-content" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-5 grid gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          {groups.map((g, gi) => <div key={g.code} className="min-w-0 rounded-xl border border-base-300 bg-base-100 p-2">
            <p className="px-1 text-xs font-bold uppercase tracking-wide text-base-content/60">{g.code}. {g.title}</p>
            <div className="mt-1 grid gap-1">{topics.map((x, i) => x.group === gi && <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined}
              className={`btn btn-sm h-auto min-h-9 justify-start whitespace-normal text-left ${i === topic ? "btn-success" : "btn-ghost"}`} onClick={() => go(i)}>{x.code} {x.short}</button>)}</div>
          </div>)}
          <button type="button" className="btn btn-outline btn-success h-auto min-h-11 md:self-stretch" onClick={() => setMode("assessment")}>Evaluasi · 24 soal</button>
        </nav>

        <div className="mb-5 grid gap-3 rounded-xl border border-base-300 bg-base-100 p-4 md:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0">
            <p className="text-sm font-bold text-success">{t.code} · {groups[t.group].title}</p>
            <h2 className="text-2xl font-extrabold">{t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(s => <li key={s}><MathText text={s} /></li>)}</ol>
          </div>
          <div className="space-y-2 rounded-lg bg-info/10 p-4 text-sm">
            <strong>Coba bersama.</strong>
            <p><MathText text={t.demo} /></p>
            <p className="text-xs text-base-content/60">Sumber buku: <MathText text={t.source} /></p>
          </div>
        </div>

        <Lab key={topic} />

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost" disabled={topic === 0} onClick={() => go(topic - 1)}>← Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi →</button>
            {topic < topics.length - 1
              ? <button type="button" className="btn btn-outline" onClick={() => go(topic + 1)}>Materi berikutnya</button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<FDQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code} ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold">
          <span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="min-w-0 overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <AnswerArea key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
