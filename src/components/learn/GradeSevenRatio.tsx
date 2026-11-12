"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { MathText } from "./GradeSevenRationalArt";
import { Bottle, Box, CompositionBar, GlassRow, MapScale, Picture, Pie, Plan, TapeDiagram } from "./GradeSevenRatioArt";
import {
  assessment, cells, correct, formatAnswer, gcd, idn, practice, ready, SEP, simplest, splitParts, topics,
  type Part, type RaQuestion, type Scene,
} from "@/data/grade-seven-ratio";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const inputCls = "h-10 rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none";
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
/** Titik dianggap pemisah ribuan (dibuang), koma sebagai desimal. */
const clean = (s: string) => s.replace(/\./g, "").replace(/[^\d,]/g, "").replace(/,(?=.*,)/g, "").slice(0, 12);
const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1");
function NumBox({ value, set, label, disabled, w = "w-24" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="decimal" placeholder="…" value={value} disabled={disabled} onChange={e => set(clean(e.target.value))} className={`${inputCls} ${w}`} />;
}
function Stepper({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(r(value - step))}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-12 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(r(value + step))}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
const rt = (a: number, b: number) => simplest(a, b).join(" : ");

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function GlassesLab() {
  const [m, setM] = useState(4);
  const [c, setC] = useState(6);
  const g = gcd(m, c) || 1, [sm, sc] = [m / g, c / g];
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Gelas susu" value={m} set={setM} min={1} max={10} /><Stepper label="Gelas cokelat" value={c} set={setC} min={1} max={10} /></div>
    <div className="flex justify-center"><GlassRow milk={m} choc={c} /></div>
    <div className="rounded-xl bg-base-100 p-3"><TapeDiagram rows={[{ name: "Susu", parts: sm, color: "#f6f1e4" }, { name: "Cokelat", parts: sc, color: "#6b3a1f" }]} unit={g > 1 ? `${g} gelas` : "1 gelas"} /></div>
    <Result value={`${sm}:${sc}`}>Rasio susu : cokelat = {m} : {c} = <strong>{sm} : {sc}</strong>. Gelas susu <MathText text={`{${m}/${m + c}}`} /> dari seluruh gelas. Selisihnya {Math.abs(c - m)} gelas, tetapi rasio membandingkan secara perkalian: cokelat {idn(c / m)} kali susu.</Result>
  </div>;
}
function PercentLab() {
  const [p, setP] = useState(80);
  const [w, setW] = useState(150);
  const a = (p / 100) * w, b = w - a;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Cokelat murni" value={p} set={setP} min={5} max={95} step={5} unit="%" /><Stepper label="Berat batang" value={w} set={setW} min={50} max={300} step={10} unit=" g" /></div>
    <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-2">
      <Pie sectors={20} shaded={Array.from({ length: p / 5 }, (_, k) => k)} label={`Diagram lingkaran: ${p}% cokelat murni`} />
      <CompositionBar caption="Kandungan cokelat batang" parts={[{ name: "Cokelat murni", pct: p, color: "#6b3a1f" }, { name: "Bahan lain", pct: 100 - p, color: "#f2e6c9" }]} />
    </div>
    <Result value={`${idn(a)}|${rt(p, 100 - p)}`}>Cokelat murni <MathText text={`{${p}/100}`} /> × {w} = <strong>{idn(a)} gram</strong>, bahan lain {idn(b)} gram. Rasio cokelat murni : bahan lain = {p} : {100 - p} = <strong>{rt(p, 100 - p)}</strong>, sama untuk berat berapa pun.</Result>
  </div>;
}
function CompareLab() {
  const [a, setA] = useState({ c: 2, m: 1 });
  const [b, setB] = useState({ c: 5, m: 4 });
  const ra = a.c / a.m, rb = b.c / b.m, s = Math.abs(ra - rb) < 1e-9 ? "sama" : ra > rb ? "kiri" : "kanan";
  return <div className="space-y-3">
    <div className="grid gap-2 sm:grid-cols-2">{([["Kiri", a, setA], ["Kanan", b, setB]] as const).map(([n, v, set]) => <div key={n} className="space-y-2 rounded-lg border border-base-300 bg-base-100 p-2">
      <p className="text-sm font-bold">Gelas {n.toLowerCase()}</p>
      <Stepper label={`${n} cokelat`} value={v.c} set={c => set({ ...v, c })} min={1} max={8} /><Stepper label={`${n} susu`} value={v.m} set={m => set({ ...v, m })} min={1} max={8} />
      <GlassRow milk={v.m} choc={v.c} /></div>)}</div>
    <Result value={s}>Cokelat per satu bagian susu: kiri {a.c} : {a.m} = <strong>{idn(ra)}</strong>, kanan {b.c} : {b.m} = <strong>{idn(rb)}</strong>. {s === "sama" ? "Rasionya ekuivalen, jadi kepekatannya sama." : `Gelas ${s} lebih pekat.`}{a.c - a.m === b.c - b.m && s !== "sama" ? " Perhatikan: selisihnya sama, tetapi rasionya berbeda." : ""}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function ResizeLab() {
  const [w, setW] = useState(18);
  const [h, setH] = useState(13.5);
  const prop = Math.abs(w * 9 - h * 12) < 1e-9;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Panjang baru" value={w} set={setW} min={6} max={24} step={1.5} unit=" cm" /><Stepper label="Lebar baru" value={h} set={setH} min={4.5} max={18} step={1.5} unit=" cm" /></div>
    <div className="flex flex-wrap items-end justify-center gap-4 rounded-xl bg-base-100 p-3"><Picture w={12} h={9} scale={7} label="Gambar asal" /><Picture w={w} h={h} scale={7} label="Gambar baru" /></div>
    <Result value={prop ? "ya" : "tidak"}>Rasio asal 12 : 9 = 4 : 3. Rasio baru {idn(w)} : {idn(h)} = {rt(w, h)}. {prop ? <><strong>Proporsional</strong> dengan faktor skala {idn(w / 12)}.</> : <><strong>Tidak proporsional</strong>: panjang dikali {idn(w / 12)}, lebar dikali {idn(h / 9)}.</>}</Result>
  </div>;
}
function ProportionLab() {
  const [a, setA] = useState(12);
  const [b, setB] = useState(16);
  const [c, setC] = useState(32);
  const x = (a * c) / b, [sa, sb] = simplest(a, b);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Lebar asal" value={a} set={setA} min={1} max={30} /><Stepper label="Panjang asal" value={b} set={setB} min={1} max={30} /><Stepper label="Panjang baru" value={c} set={setC} min={1} max={60} /></div>
    <p className="rounded-xl bg-base-100 p-3 text-center text-xl font-extrabold">{a} : {b} = <span className="text-info">lebar</span> : {c}</p>
    <div className="grid gap-2 text-sm sm:grid-cols-2">
      <p className="rounded-lg border border-base-300 p-2"><strong>Di antara:</strong> panjang {b} menjadi {c}, dikali {idn(c / b)}. Lebar {a} × {idn(c / b)} = {idn(x)}.</p>
      <p className="rounded-lg border border-base-300 p-2"><strong>Di dalam:</strong> {a} : {b} = {sa} : {sb}, jadi lebar = <MathText text={`{${sa}/${sb}}`} /> × {c} = {idn(x)}.</p>
    </div>
    <Result value={idn(x)}>Lebar baru = <strong>{idn(x)}</strong>. Kedua cara memberi hasil yang sama.</Result>
  </div>;
}
const mapScales = [100, 50000, 5000000];
function MapLab() {
  const [s, setS] = useState(5000000);
  const [cm, setCm] = useState(3);
  const real = cm * s;
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Skala" className="flex flex-wrap gap-1.5">{mapScales.map(x => <button key={x} type="button" role="radio" aria-checked={s === x} onClick={() => setS(x)} className={`btn btn-sm ${s === x ? "btn-success" : "btn-outline"}`}>1 : {idn(x)}</button>)}</div>
    <Stepper label="Jarak pada peta" value={cm} set={setCm} min={0.5} max={12} step={0.5} unit=" cm" />
    <div className="overflow-hidden rounded-xl bg-base-100 p-3"><svg viewBox="0 0 260 40" className="w-full" role="img" aria-label={`Penggaris, garis ${idn(cm)} cm`}>
      {Array.from({ length: 25 }, (_, k) => <g key={k}><line x1={10 + k * 10} x2={10 + k * 10} y1="24" y2={k % 2 ? 30 : 34} stroke="#33413b" />{k % 2 === 0 && <text x={10 + k * 10} y="20" fontSize="8" textAnchor="middle" fill="#33413b">{k / 2}</text>}</g>)}
      <rect x="10" y="34" width={cm * 20} height="5" fill="#e8590c" /></svg></div>
    <Result value={String(real)}>{idn(cm)} cm × {idn(s)} = <strong>{idn(real)} cm</strong> = {idn(real / 100)} m = <strong>{idn(real / 100000, 3)} km</strong>. {s <= 100 ? "Skala ini cocok untuk denah rumah." : s <= 50000 ? "Skala ini cocok untuk peta kota atau pulau kecil." : "Skala ini cocok untuk peta pulau besar atau negara."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function UnitRateLab() {
  const [b, setB] = useState([{ ml: 200, sp: 4 }, { ml: 180, sp: 3 }]);
  const set = (k: number, v: { ml: number; sp: number }) => setB(x => x.map((y, j) => (j === k ? v : y)));
  const r = b.map(x => x.ml / x.sp), best = r[0] === r[1] ? "sama" : r[0] < r[1] ? "Botol A" : "Botol B";
  return <div className="space-y-3">
    <div className="grid gap-2 sm:grid-cols-2">{b.map((x, k) => { const n = `Botol ${"AB"[k]}`; return <div key={n} className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2">
      <Bottle shade={Math.min(1, 30 / r[k])} label={n} />
      <div className="space-y-1"><Stepper label={`${n} susu`} value={x.ml} set={ml => set(k, { ...x, ml })} min={50} max={300} step={10} unit=" ml" /><Stepper label={`${n} cokelat`} value={x.sp} set={sp => set(k, { ...x, sp })} min={1} max={12} unit=" sdk" /></div></div>; })}</div>
    <Result value={best}>Botol A: {b[0].ml} : {b[0].sp} = <strong>{idn(r[0])} ml per sendok</strong>. Botol B: {b[1].ml} : {b[1].sp} = <strong>{idn(r[1])} ml per sendok</strong>. {best === "sama" ? "Kepekatannya sama." : `${best} lebih pekat karena susunya lebih sedikit untuk setiap sendok cokelat.`}</Result>
  </div>;
}
function PriceLab() {
  const [items, setItems] = useState([{ name: "Lezatos", g: 60, rp: 18000 }, { name: "Choko", g: 75, rp: 24000 }, { name: "Bola Kecil", g: 100, rp: 28000 }, { name: "Kakao", g: 120, rp: 32000 }]);
  const [k, setK] = useState(0);
  const it = items[k], set = (v: typeof it) => setItems(x => x.map((y, j) => (j === k ? v : y)));
  const sorted = [...items].sort((a, b) => a.rp / a.g - b.rp / b.g), max = Math.max(...items.map(i => i.rp / i.g));
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Pilih cokelat" className="flex flex-wrap gap-1.5">{items.map((x, j) => <button key={x.name} type="button" role="radio" aria-checked={k === j} onClick={() => setK(j)} className={`btn btn-sm ${k === j ? "btn-success" : "btn-outline"}`}>{x.name}</button>)}</div>
    <div className="flex flex-wrap gap-3"><Stepper label="Berat" value={it.g} set={g => set({ ...it, g })} min={20} max={200} step={5} unit=" g" /><Stepper label="Harga" value={it.rp} set={rp => set({ ...it, rp })} min={5000} max={50000} step={1000} /></div>
    <ol className="space-y-1 rounded-xl bg-base-100 p-3 text-sm">{sorted.map((x, j) => <li key={x.name} className="flex items-center gap-2"><span className="w-24 font-bold">{j + 1}. {x.name}</span><span className="h-4 rounded-sm bg-[#6b3a1f]" style={{ width: `${(x.rp / x.g / max) * 55}%` }} /><span className="ms-auto tabular-nums">Rp{idn(x.rp / x.g)}/g</span></li>)}</ol>
    <Result value={sorted.map(x => x.name).join(";")}>Harga per gram = harga : berat. Termurah per gram: <strong>{sorted[0].name}</strong> (Rp{idn(sorted[0].rp / sorted[0].g)} per gram). Termahal: {sorted[3].name}.</Result>
  </div>;
}
const rateKinds = [
  { name: "Kepadatan", a: "Penduduk", ua: " orang", b: "Luas", ub: " km²", sa: 50, sb: 1, init: [1200, 40], unit: "orang per km²" },
  { name: "Efisiensi", a: "Jarak", ua: " km", b: "Bensin", ub: " L", sa: 5, sb: 1, init: [180, 15], unit: "km per liter" },
  { name: "Massa jenis", a: "Massa", ua: " g", b: "Volume", ub: " cm³", sa: 10, sb: 5, init: [480, 60], unit: "gram per cm³" },
  { name: "Kecepatan kerja", a: "Hasil", ua: " kg", b: "Waktu", ub: " jam", sa: 1, sb: 1, init: [12, 8], unit: "kg per jam" },
];
function RatesLab() {
  const [k, setK] = useState(0);
  const [v, setV] = useState(rateKinds.map(r => r.init));
  const r = rateKinds[k], [a, b] = v[k], put = (j: number) => (n: number) => setV(x => x.map((y, i) => (i === k ? (j ? [y[0], n] : [n, y[1]]) : y)));
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Jenis laju" className="flex flex-wrap gap-1.5">{rateKinds.map((x, j) => <button key={x.name} type="button" role="radio" aria-checked={k === j} onClick={() => setK(j)} className={`btn btn-sm ${k === j ? "btn-success" : "btn-outline"}`}>{x.name}</button>)}</div>
    <div className="flex flex-wrap gap-3"><Stepper label={r.a} value={a} set={put(0)} min={r.sa} max={r.sa * 400} step={r.sa} unit={r.ua} /><Stepper label={r.b} value={b} set={put(1)} min={r.sb} max={r.sb * 60} step={r.sb} unit={r.ub} /></div>
    <Result value={idn(a / b)}>{r.name} = {r.a.toLowerCase()} : {r.b.toLowerCase()} = {idn(a)} : {idn(b)} = <strong>{idn(a / b)} {r.unit}</strong>.</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { glasses: GlassesLab, percent: PercentLab, compare: CompareLab, resize: ResizeLab, proportion: ProportionLab, map: MapLab, unitrate: UnitRateLab, price: PriceLab, rates: RatesLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "glasses": return <div className="flex flex-wrap justify-center gap-3">{scene.groups.map((g, k) => <GlassRow key={k} {...g} />)}</div>;
    case "bar": return <CompositionBar parts={scene.parts} caption={scene.caption} />;
    case "table": return <div className="w-full overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{scene.caption && <caption className="mb-1 text-sm font-bold">{scene.caption}</caption>}
      <thead><tr className="bg-success text-success-content">{scene.head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>{scene.rows.map(r => <tr key={r[0]} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 tabular-nums ${j ? "" : "font-bold"}`}>{c}</td>)}</tr>)}</tbody></table></div>;
    case "pictures": return <div className="flex flex-wrap items-end justify-center gap-3">{scene.items.map(p => <Picture key={p.label} w={p.w} h={p.h} scale={4.5} label={p.label} />)}</div>;
    case "mapScale": return <MapScale km={scene.km} cm={scene.cm} />;
    case "plan": return <Plan {...scene} />;
    case "boxes": return <div className="flex flex-wrap justify-center gap-4">{scene.items.map(b => <Box key={b.label} {...b} />)}</div>;
    case "text": return <ul className="w-full max-w-lg list-disc space-y-1 rounded-lg bg-base-100 py-2 pe-3 ps-7 text-sm">{scene.lines.map(l => <li key={l}><MathText text={l} /></li>)}</ul>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PieAnswer({ p, value, set, checked }: { p: Extract<Part, { kind: "pie" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const sel = value ? value.split(",").map(Number) : [];
  return <div className="space-y-1">
    <Pie sectors={p.sectors} shaded={sel} colors={["#2f86d6", "#ffffff"]} label={`Lingkaran ${p.sectors} juring, ketuk untuk mengarsir`} onSector={checked ? undefined : k => set((sel.includes(k) ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} />
    <p className="text-center text-xs text-base-content/60">Ketuk juring untuk mengarsir atau menghapus arsiran. Diarsir {sel.length} dari {p.sectors}.</p>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const L = plain("label" in p ? p.label : "");
  switch (p.kind) {
    case "ratio": return <div className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span>
      <NumBox w="w-20" label={`${L} bilangan pertama`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-2xl">:</span><NumBox w="w-20" label={`${L} bilangan kedua`} value={x[1]} set={v => put(1, v)} disabled={checked} /></div>;
    case "frac": return <div className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span>
      <span className="inline-flex flex-col items-center gap-0.5"><NumBox w="w-16" label={`${L} pembilang`} value={x[0]} set={v => put(0, v.replace(",", ""))} disabled={checked} /><span className="h-0.5 w-16 rounded bg-neutral" /><NumBox w="w-16" label={`${L} penyebut`} value={x[1]} set={v => put(1, v.replace(",", ""))} disabled={checked} /></span></div>;
    case "num": return <div className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span><NumBox w="w-32" label={L} value={value} set={set} disabled={checked} />{p.unit}</div>;
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.map((s, k) => <li key={s} className="badge badge-success badge-lg">{k + 1}. {s}</li>)}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" disabled={checked || seq.includes(o)} onClick={() => set([...seq, o].join(";"))} className="btn btn-sm btn-outline">{o}</button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.options.map((o, k) => { const s = sel.includes(k);
          return <button key={o} type="button" aria-pressed={s} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} className={`btn btn-sm min-w-16 text-base ${s ? on : "btn-outline"}`}>{o}</button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={plain(r.text)} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <span className="text-sm font-bold sm:w-56"><MathText text={r.text} /></span>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 py-1 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "pie": return <PieAnswer p={p} value={value} set={set} checked={checked} />;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><MathText text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: RaQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeSevenRatio() {
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
    <p className="text-sm font-semibold text-success">Kelas 7, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Rasio</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Bandingkan dua besaran dengan rasio, bedakan dengan pecahan dan selisih, gunakan rasio ekuivalen untuk skala dan proporsi, lalu hitung laju perubahan satuan seperti harga per gram dan km per liter.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><GlassRow milk={2} choc={3} /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Seberapa pekat susu cokelatmu?</h2>
        <p className="mt-2 text-sm">Agar rasa cokelat tetap sama, penjual harus menjaga perbandingan susu dan cokelat. Pelukis juga menjaga perbandingan panjang dan lebar foto. Keduanya memakai rasio.</p>
        <p className="mt-2 text-sm text-base-content/60">{totalSections} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-rasio">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-rasio" className="mt-8 scroll-mt-20">
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
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-6"><Check className="me-1 inline size-4 text-success" aria-hidden="true" /><MathText text={s.example} /></p>}
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
      </> : <GradeFourQuiz<RaQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
