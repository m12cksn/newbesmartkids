"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { DArt, hue, SymArt } from "./GradeOneDiagramArt";
import { assessment, cells, correct, formatAnswer, itemName, mix, objName, practice, ready, SEP, splitParts, topics, type Color, type DQuestion, type Item, type Obj, type Part, type Row, type Scene, type Sym } from "@/data/grade-one-diagram-v2";

/** Ukuran teks jawaban: sedikit lebih kecil di HP sempit. */
const txt = "text-base leading-snug min-[400px]:text-lg sm:text-xl";
const icon = "size-7 sm:size-8";
const RowHead = ({ r }: { r: Pick<Row, "label" | "obj" | "color"> }) => <span className="flex items-center gap-1">{r.obj && <DArt obj={r.obj} color={r.color} className="size-6 shrink-0 sm:size-7" />}<span>{r.label}</span></span>;

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
/** Benda bercampur, tersebar acak tetapi tetap sama setiap kali. */
function Scatter({ items, render }: { items: Item[]; render?: (it: Item, k: number) => ReactNode }) {
  const cols = Math.max(4, Math.ceil(Math.sqrt(items.length * 1.8)));
  return <div className="grid w-full max-w-md gap-x-1 gap-y-0.5 rounded-2xl bg-sky-100/70 p-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {items.map((it, k) => { const j = (k * 37) % 11, rot = it.obj === "pensil" ? (k % 3) * 30 - 30 : (j - 5) * 3;
      return <span key={k} className="grid place-items-center" style={{ transform: `translate(${(j % 4) - 1.5}px, ${(j % 3) * 2 - 2}px) rotate(${rot}deg)` }}>{render ? render(it, k) : <DArt obj={it.obj} color={it.color} className={icon} />}</span>; })}
  </div>;
}
function ListView({ s }: { s: Extract<Scene, { type: "list" }> }) {
  return <div className="w-full max-w-md overflow-hidden rounded-xl border-2 border-purple-200 bg-white"><p className="bg-purple-100 py-1 text-center text-sm font-bold">{s.title}</p>
    {s.rows.map(r => <div key={r.label} className="flex items-center gap-2 border-t border-purple-100 px-2 py-1"><span className="w-24 shrink-0 text-sm font-bold">{r.label}</span><span role="img" aria-label={`${r.label}`} className="flex flex-wrap gap-0.5">{Array.from({ length: r.n }, (_, k) => <DArt key={k} obj={r.obj!} color={r.color} className="size-6 sm:size-7" />)}</span></div>)}</div>;
}
/** Tabel menurun (v) atau mendatar (h); cell(k) mengisi kolom banyaknya. */
function TableView({ title, head, orient, rows, cell, extra }: { title: string; head: [string, string]; orient: "v" | "h"; rows: Row[]; cell: (k: number) => ReactNode; extra?: ReactNode }) {
  const th = "border-2 border-purple-200 bg-purple-100 px-1.5 py-0.5 font-bold", td = "border-2 border-purple-200 bg-white px-1.5 py-0.5 text-center";
  return <div className="w-full max-w-md"><div className="mb-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1"><p className="text-sm font-bold">{title}</p>{extra}</div>
    <table className="w-full table-fixed border-collapse text-sm sm:text-base">{orient === "v"
      ? <><thead><tr><th className={th}>{head[0]}</th><th className={th}>{head[1]}</th></tr></thead><tbody>{rows.map((r, k) => <tr key={r.label}><td className={td}><span className="flex justify-center"><RowHead r={r} /></span></td><td className={`${td} text-lg font-bold`}>{cell(k)}</td></tr>)}</tbody></>
      : <tbody><tr><th className={`${th} w-[27%] text-xs [overflow-wrap:anywhere] sm:text-sm`}>{head[0]}</th>{rows.map(r => <td key={r.label} className={`${td} bg-purple-50 font-bold leading-tight`}><span className="flex flex-col items-center">{r.obj && <DArt obj={r.obj} color={r.color} className="size-6 sm:size-7" />}<span className="text-[10px] leading-tight min-[400px]:text-xs sm:text-sm">{r.label}</span></span></td>)}</tr>
        <tr><th className={`${th} text-xs [overflow-wrap:anywhere] sm:text-sm`}>{head[1]}</th>{rows.map((r, k) => <td key={r.label} className={`${td} text-lg font-bold`}>{cell(k)}</td>)}</tr></tbody>}</table></div>;
}
function Sym1({ sym, row, fluid }: { sym: Sym | "obj"; row: { obj?: Obj; color?: Color }; fluid?: boolean }) {
  const size = fluid ? "size-[90%]" : "size-6 sm:size-7";
  return sym === "obj" ? <DArt obj={row.obj!} color={row.color} className={size} /> : <SymArt sym={sym} color={row.color} className={sym === "karet" ? "h-4 w-8 sm:h-5 sm:w-10" : size} />;
}
function PictoView({ s }: { s: Extract<Scene, { type: "picto" }> }) {
  const max = Math.max(...s.rows.map(r => r.n ?? 0), 1), slots = Math.max(max, s.axis ? max : 0);
  const hcols = { gridTemplateColumns: `repeat(${Math.max(slots, 6)}, minmax(0, 2rem))` };
  const unknown = <span className="grid size-7 place-items-center text-2xl font-extrabold text-base-content/50">?</span>;
  const legend = s.sym === "obj" ? `Setiap gambar mewakili 1 ${s.unit}.` : <>Gambar <Sym1 sym={s.sym} row={s.rows[0]} /> mewakili 1 {s.unit}.</>;
  const label = `${s.title}: ${s.rows.map(r => `${r.label} ${r.n ?? "belum diketahui"}`).join(", ")}`;
  return <figure className="w-full max-w-md" role="img" aria-label={label}><p className="mb-1 text-center text-sm font-bold">{s.title}</p>
    {s.orient === "v"
      ? <div className="flex items-end justify-center gap-1">{s.axis && <div className="flex flex-col-reverse pb-8 sm:pb-9">{Array.from({ length: slots }, (_, k) => <span key={k} className="grid h-[1.375rem] w-5 place-items-center text-xs font-bold min-[400px]:h-7 sm:h-8">{k + 1}</span>)}</div>}
        {s.rows.map(r => <div key={r.label} className="flex min-w-0 flex-1 flex-col items-center">
          <div className={`flex w-full flex-col-reverse items-center ${s.axis ? "border-x border-t border-purple-200" : ""}`}>{r.n === null ? unknown : Array.from({ length: s.axis ? slots : r.n }, (_, k) => <span key={k} className={`grid w-full place-items-center ${s.sym === "karet" ? "h-4 min-[400px]:h-5 sm:h-6" : "h-[1.375rem] min-[400px]:h-7 sm:h-8"} ${s.axis ? "border-b border-purple-200" : ""}`}>{k < (r.n ?? 0) && <Sym1 sym={s.sym} row={r} />}</span>)}</div>
          <span className="mt-0.5 flex h-8 flex-col items-center text-center text-[11px] font-bold leading-none sm:h-9 sm:text-xs">{r.obj ? <DArt obj={r.obj} color={r.color} className="size-5 sm:size-6" /> : null}{r.label}</span></div>)}</div>
      : <div className="space-y-0.5">{s.rows.map(r => <div key={r.label} className="flex items-center gap-1.5 border-b border-purple-100"><span className="w-[5.5rem] shrink-0 text-xs font-bold leading-tight sm:w-28 sm:text-sm"><RowHead r={r} /></span>
          <span className="grid min-w-0 flex-1 gap-0.5" style={hcols}>{r.n === null ? unknown : Array.from({ length: s.axis ? slots : r.n }, (_, k) => <span key={k} className={`grid aspect-square place-items-center ${s.axis ? "border border-purple-200" : ""}`}>{k < (r.n ?? 0) && <Sym1 sym={s.sym} row={r} fluid />}</span>)}</span></div>)}
        {s.axis && <div className="flex gap-1.5"><span className="w-[5.5rem] shrink-0 sm:w-28" /><span className="grid min-w-0 flex-1 gap-0.5" style={hcols}>{Array.from({ length: slots }, (_, k) => <span key={k} className="text-center text-xs font-bold">{k + 1}</span>)}</span></div>}</div>}
    <figcaption className="mt-1 flex items-center justify-center gap-1 text-xs font-bold sm:text-sm">{legend}</figcaption></figure>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "scatter": return <div role="img" aria-label={`${scene.items.length} benda bercampur: ${scene.items.map(itemName).join(", ")}`} className="flex w-full justify-center"><Scatter items={scene.items} /></div>;
    case "list": return <ListView s={scene} />;
    case "table": return <TableView title={scene.title} head={scene.head} orient={scene.orient} rows={scene.rows} cell={k => scene.rows[k].n} />;
    case "picto": return <PictoView s={scene} />;
  }
}

/* ====================================================================== */
/* Bentuk jawaban                                                          */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled, small }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; small?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`${small ? "h-8 w-10 text-xl" : "h-11 w-12 text-2xl sm:h-12 sm:w-14"} rounded-xl border-4 border-orange-400 bg-white text-center font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function Fill({ p, x, put, disabled, i }: { p: Extract<Part, { kind: "fill" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number }) {
  const bits = p.text.split("□");
  return <p className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 font-bold ${txt}`}>{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => { const [w, ...rest] = b.trim().split(" ");
    return <span key={k} className="contents"><span className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={disabled} />{w && <span>{w}</span>}</span>{rest.length > 0 && <span>{rest.join(" ")}</span>}</span>; })}</p>;
}
function Choose({ p, x, put, set, disabled, i }: { p: Extract<Part, { kind: "choose" }>; x: string[]; put: (k: number, v: string) => void; set: (v: string) => void; disabled: boolean; i: number }) {
  const bits = p.text.split("□"), got = x.filter(Boolean);
  const chip = (on: boolean) => `min-h-8 rounded-xl border-2 px-1.5 text-sm font-bold leading-tight min-[400px]:px-2.5 min-[400px]:text-base ${on ? "border-success bg-success/20" : "border-base-300 bg-base-100"}`;
  return <div className="space-y-1">
    <p className={`${txt} font-bold`}>{bits.map((b, k) => <span key={k}>{b}{k < bits.length - 1 && <span className={`mx-0.5 inline-block min-w-16 rounded-lg border-b-4 px-1.5 text-center ${x[k] ? "border-success bg-success/10" : "border-orange-400 bg-orange-50"}`}>{x[k] || "…"}</span>}</span>)}</p>
    {p.anyOrder ? <div role="group" aria-label={`Bagian ${i + 1} pilihan`} className="flex flex-wrap gap-1">{p.options.map(o => { const on = got.includes(o);
      return <button key={o} type="button" aria-pressed={on} disabled={disabled || (!on && got.length >= p.answers.length)} onClick={() => set((on ? got.filter(g => g !== o) : [...got, o]).join("|"))} className={`${chip(on)} disabled:opacity-40`}>{o}</button>; })}</div>
      : p.answers.map((_, k) => <div key={k} role="radiogroup" aria-label={`Bagian ${i + 1} kotak ${k + 1}`} className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={disabled} onClick={() => put(k, o)} className={chip(x[k] === o)}>{o}</button>)}</div>)}
  </div>;
}
function TableInput({ p, x, put, disabled, i }: { p: Extract<Part, { kind: "table" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number }) {
  const slot = p.rows.map((r, k) => (r.given ? -1 : p.rows.slice(0, k).filter(o => !o.given).length));
  return <TableView title={p.title} head={p.head} orient={p.orient} rows={p.rows} cell={k => slot[k] < 0 ? p.rows[k].n : <span className="flex justify-center"><NumBox small label={`Bagian ${i + 1} ${p.rows[k].label}`} value={x[slot[k]]} onChange={v => put(slot[k], v)} disabled={disabled} /></span>} />;
}
const paintHue: Color[] = ["oranye", "merah", "hijau", "kuning", "biru", "ungu"];
function Paint({ p, x, set, disabled }: { p: Extract<Part, { kind: "paint" }>; x: string[]; set: (v: string) => void; disabled: boolean }) {
  const n = x.map(c => Number(c || 0));
  const tap = (r: number, k: number) => { const a = [...n]; a[r] = a[r] === k + 1 ? k : k + 1; set(a.join("|")); };
  return <div className="w-full max-w-md space-y-0.5 rounded-xl border-2 border-purple-200 bg-white p-1.5">{p.rows.map((r, ri) => <div key={r.label} role="group" aria-label={`Baris ${r.label}`} className="flex items-center gap-1.5">
    <span className="w-[5.5rem] shrink-0 text-sm font-bold leading-tight sm:w-28"><RowHead r={r} /></span>
    <span className="grid min-w-0 flex-1 gap-0.5" style={{ gridTemplateColumns: `repeat(${p.slots}, minmax(0, 2.5rem))` }}>{Array.from({ length: p.slots }, (_, k) => { const on = k < n[ri];
      return <button key={k} type="button" aria-label={`${r.label} lingkaran ${k + 1}`} aria-pressed={on} disabled={disabled} onClick={() => tap(ri, k)}
        className="aspect-[5/4] w-full rounded-[50%] border-2 border-neutral/70" style={{ background: on ? hue[paintHue[ri % paintHue.length]].fill : "#fff" }} />; })}</span>
    <span className="w-5 text-right text-sm font-bold tabular-nums">{n[ri] || ""}</span></div>)}
    <p className="pt-0.5 text-xs font-bold text-base-content/70">Satu lingkaran mewakili 1 {p.unit}. Ketuk lagi lingkaran terakhir untuk menghapus.</p></div>;
}
/** Ketuk kotak tujuan, lalu ketuk benda untuk memasukkannya. Ketuk benda di kotak untuk mengeluarkannya. */
function Group({ items, cats, value, set, disabled }: { items: Item[]; cats: { label: string; obj?: Obj; color?: Color }[]; value: string[]; set: (v: string[]) => void; disabled: boolean }) {
  const [dest, setDest] = useState(0);
  const put = (k: number, c: string) => { const a = [...value]; a[k] = c; set(a); };
  const name = (it: Item, k: number) => `${itemName(it)} ${k + 1}`;
  const left = items.map((it, k) => [it, k] as const).filter(([, k]) => value[k] === "" || value[k] === undefined);
  return <div className="w-full space-y-1.5">
    <div className="min-h-12 rounded-2xl bg-sky-100/70 p-1.5">{left.length ? <Scatter items={left.map(x => x[0])} render={(it, j) => { const k = left[j][1];
      return <button type="button" aria-label={name(it, k)} disabled={disabled} onClick={() => put(k, String(dest))} className="rounded-full p-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-success"><DArt obj={it.obj} color={it.color} className={icon} /></button>; }} />
      : <p className="py-2 text-center text-sm font-bold text-success">Semua sudah dikelompokkan.</p>}</div>
    <div className={`grid gap-1.5 ${cats.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>{cats.map((c, ci) => <div key={c.label} className={`rounded-xl border-4 bg-white p-1 ${dest === ci ? "border-success" : "border-orange-200"}`}>
      <button type="button" aria-label={`Kotak ${c.label}`} aria-pressed={dest === ci} disabled={disabled} onClick={() => setDest(ci)} className="flex w-full items-center justify-center gap-1 rounded-lg bg-orange-50 px-1 text-sm font-bold">{c.obj && <DArt obj={c.obj} color={c.color} className="size-5" />}{c.label}</button>
      <div className="mt-0.5 flex min-h-8 flex-wrap justify-center gap-0.5">{items.map((it, k) => value[k] === String(ci) && <button key={k} type="button" aria-label={name(it, k)} disabled={disabled} onClick={() => put(k, "")}><DArt obj={it.obj} color={it.color} className="size-6 sm:size-7" /></button>)}</div></div>)}</div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": return <Fill p={p} x={x} put={put} disabled={checked} i={i} />;
    case "choose": return <Choose p={p} x={x} put={put} set={set} disabled={checked} i={i} />;
    case "table": return <TableInput p={p} x={x} put={put} disabled={checked} i={i} />;
    case "paint": return <Paint p={p} x={x} set={set} disabled={checked} />;
    case "group": return <Group items={p.items} cats={p.cats} value={x} set={a => set(a.join("|"))} disabled={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: DQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-2.5 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-2xl bg-success/10 p-3 text-base font-bold leading-7 sm:text-lg">{children}</output>;
const Tabs = <T extends string>({ tabs, tab, set, label }: { tabs: readonly (readonly [T, string])[]; tab: T; set: (t: T) => void; label: string }) => <div role="tablist" aria-label={label} className="flex flex-wrap gap-1">{tabs.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => set(k)} className={`btn btn-xs sm:btn-sm ${tab === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>;
const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} dan ${xs.at(-1)}`);
function most(names: string[], vals: number[]) {
  const hi = Math.max(...vals), lo = Math.min(...vals);
  return `${join(names.filter((_, k) => vals[k] === hi))} paling banyak (${hi}). ${join(names.filter((_, k) => vals[k] === lo))} paling sedikit (${lo}).`;
}
const toys: Obj[] = ["pesawat", "mobil", "boneka", "bola"];
const toyItems = mix([[{ obj: "pesawat" }, 5], [{ obj: "mobil" }, 3], [{ obj: "boneka" }, 4], [{ obj: "bola", color: "merah" }, 2]], 23);
const orientTabs = [["h", "Mendatar"], ["v", "Menurun"]] as const;
function KelompokLab() {
  const [v, setV] = useState<string[]>(toyItems.map(() => "")), [orient, setOrient] = useState<"v" | "h">("h");
  const cats = toys.map(o => ({ label: objName[o].replace("mobil-mobilan", "mobil"), obj: o, color: o === "bola" ? "merah" as Color : undefined }));
  const counts = toys.map((_, c) => v.filter(x => x === String(c)).length), left = v.filter(x => x === "").length;
  const wrong = toyItems.filter((it, k) => v[k] !== "" && toys[Number(v[k])] !== it.obj).length;
  return <div className="space-y-2">
    <Group items={toyItems} cats={cats} value={v} set={setV} disabled={false} />
    <TableView title="Tabel Mainan di Toko" head={["Mainan", "Banyaknya"]} orient={orient} rows={toys.map((o, k) => ({ label: objName[o], obj: o, color: o === "bola" ? "merah" : undefined, n: counts[k] }))} cell={k => counts[k]}
      extra={<Tabs tabs={orientTabs} tab={orient} set={setOrient} label="Bentuk tabel" />} />
    <Result value={`kelompok:${counts.join(":")}:${left}:${orient}`}>{wrong ? `Ada ${wrong} mainan yang masuk rak yang salah. Ketuk mainan itu untuk mengeluarkannya.` : left ? `Masih ada ${left} mainan yang belum dirapikan.` : `Semua rapi. ${most(toys.map(o => objName[o]), counts)}`} {!wrong && !left && (orient === "v" ? "Tabel ini menurun." : "Tabel ini mendatar, isinya sama.")}</Result>
  </div>;
}
const veg: Obj[] = ["jagung", "wortel", "brokoli", "kol"];
const shapeTabs = [["v", "Tegak"], ["h", "Mendatar"]] as const, symTabs = [["obj", "Gambar sayur"], ["bintang", "Bintang"]] as const;
function DiagramLab() {
  const [vals, setVals] = useState([3, 4, 3, 2]), [orient, setOrient] = useState<"v" | "h">("v"), [sym, setSym] = useState<"obj" | "bintang">("obj");
  const names = veg.map(o => objName[o]);
  return <div className="space-y-2">
    <div className="flex flex-wrap gap-2"><Tabs tabs={shapeTabs} tab={orient} set={setOrient} label="Bentuk diagram" /><Tabs tabs={symTabs} tab={sym} set={setSym} label="Gambar diagram" /></div>
    <div className="flex justify-center"><PictoView s={{ type: "picto", title: "Diagram Sayur Kesukaan", orient, sym, unit: "anak", rows: veg.map((o, k) => ({ label: names[k][0].toUpperCase() + names[k].slice(1), obj: o, n: vals[k] })) }} /></div>
    <div className="grid grid-cols-4 gap-1">{veg.map((o, k) => <span key={o} role="group" aria-label={`Anak suka ${names[k]}`} className="flex flex-col items-center gap-0.5"><span className="text-xs font-bold">{names[k]}</span><span className="flex gap-1">
      <button type="button" aria-label={`Kurangi ${names[k]}`} className="btn btn-circle btn-xs btn-outline sm:btn-sm" disabled={vals[k] <= 0} onClick={() => setVals(vals.map((x, j) => (j === k ? x - 1 : x)))}><Minus className="size-3.5" aria-hidden="true" /></button>
      <button type="button" aria-label={`Tambah ${names[k]}`} className="btn btn-circle btn-xs btn-outline sm:btn-sm" disabled={vals[k] >= 6} onClick={() => setVals(vals.map((x, j) => (j === k ? x + 1 : x)))}><Plus className="size-3.5" aria-hidden="true" /></button></span></span>)}</div>
    <Result value={`diagram:${vals.join(":")}:${orient}:${sym}`}>{Math.max(...vals) === 0 ? "Belum ada data. Tambahkan anak." : `${most(names, vals)} Semua ada ${vals.reduce((a, b) => a + b, 0)} anak.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { kelompok: KelompokLab, diagram: DiagramLab };

export default function GradeOneDiagramV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const [lab, setLab] = useState(0);
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Mengenal Diagram</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Kelompokkan data, tulis dalam daftar dan tabel, lalu baca dan buat diagram gambar.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-2">{[3, 4, 2].map((n, k) => <span key={k} className="flex flex-col-reverse items-center">{Array.from({ length: n }, (_, j) => <SymArt key={j} sym="bintang" className="size-6" />)}</span>)}</div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Kira Membantu Paman</h2>
        <p className="mt-2">Toko mainan Paman berantakan. Pesawat, mobil-mobilan, boneka, dan bola bercampur. Mainan apa yang paling banyak? Bagaimana cara mudah menemukannya?</p>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-diagram">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-diagram" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={`${topic}-${lab}`} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-lg leading-8">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-3 rounded-lg bg-info/10 p-3"><strong>Coba bersama. </strong>{t.demo}</p>
            <button type="button" className="btn btn-ghost btn-sm mt-2 gap-1" onClick={() => setLab(lab + 1)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi peraga</button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<DQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 8"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderAnswer={(q, value, record, checked) => <div className={q.scene ? "space-y-2.5 sm:grid sm:grid-cols-2 sm:items-start sm:gap-3 sm:space-y-0" : ""}>
          {q.scene && <div className="flex min-w-0 justify-center rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.72]"><SceneView key={q.prompt} scene={q.scene} /></div>}
          <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} /></div>}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
