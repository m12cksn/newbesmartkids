"use client";

import { useState, type ReactNode } from "react";
import { TrainFront } from "lucide-react";
import GradeFourQuiz from "./GradeFourQuiz";
import { assessment, correct, formatAnswer, numberWords, practice, ready, SEP, splitParts, topics, type CQuestion, type Part, type Scene, type Thing } from "@/data/grade-two-counting-50";

const ink = "#17352a";
const s = { stroke: ink, strokeWidth: 1.4, strokeLinejoin: "round" as const };

/* ====================================================================== */
/* Ilustrasi (SVG buatan sendiri)                                          */
/* ====================================================================== */
export function ThingIcon({ thing, className = "size-7" }: { thing: Thing; className?: string }) {
  const body: Record<Thing, ReactNode> = {
    mango: <><path d="M6 14c0-6 8-10 14-7 5 3 3 13-5 14-5 1-9-3-9-7z" fill="#facc15" {...s} /><path d="M17 6c1-2 4-3 5-2" stroke="#16a34a" strokeWidth="2" fill="none" /></>,
    mangosteen: <><circle cx="12" cy="14" r="8" fill="#6b213f" {...s} /><path d="M8 6c1.5 1.5 2.5 1.5 4 0 1.5 1.5 2.5 1.5 4 0l-1 4H9z" fill="#4d7c0f" {...s} /></>,
    strawberry: <><path d="M5 9c0-3 14-3 14 0 0 6-4 12-7 13-3-1-7-7-7-13z" fill="#ef4444" {...s} /><path d="M7 7l5 3 5-3-3-2-2 2-2-2z" fill="#16a34a" {...s} /></>,
    ladybug: <><circle cx="12" cy="13" r="8" fill="#ef4444" {...s} /><path d="M12 5v16" stroke={ink} /><circle cx="12" cy="5" r="3" fill={ink} /><circle cx="8.5" cy="11" r="1.4" fill={ink} /><circle cx="15.5" cy="11" r="1.4" fill={ink} /><circle cx="9" cy="16" r="1.4" fill={ink} /><circle cx="15" cy="16" r="1.4" fill={ink} /></>,
    butterfly: <><path d="M12 12C8 3 2 5 3 10s6 4 9 2zM12 12c4-9 10-7 9-2s-6 4-9 2zM12 13c-3 6-8 7-8 3s5-4 8-3zM12 13c3 6 8 7 8 3s-5-4-8-3z" fill="#4ade80" {...s} /><path d="M12 8v10" stroke={ink} strokeWidth="2" /></>,
    star: <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z" fill="#84cc16" {...s} />,
    candy: <><path d="M3 8l5 4-5 4zM21 8l-5 4 5 4z" fill="#a5f3fc" {...s} /><rect x="7" y="8" width="10" height="8" rx="4" fill="#06b6d4" {...s} /></>,
    bee: <><ellipse cx="12" cy="14" rx="7" ry="5" fill="#facc15" {...s} /><path d="M10 9.5v9M14 9.5v9" stroke={ink} strokeWidth="2" /><ellipse cx="9" cy="7" rx="3" ry="4" fill="#e0f2fe" {...s} /><ellipse cx="15" cy="7" rx="3" ry="4" fill="#e0f2fe" {...s} /></>,
    apple: <><path d="M12 7c-4-3-9 0-8 6 1 6 5 9 8 7 3 2 7-1 8-7 1-6-4-9-8-6z" fill="#ef4444" {...s} /><path d="M12 7c0-2 1-4 3-5" stroke="#16a34a" strokeWidth="2" fill="none" /></>,
    marble: <><circle cx="12" cy="12" r="8" fill="#22c55e" {...s} /><circle cx="9" cy="9" r="2.4" fill="#fff" opacity=".7" /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{body[thing]}</svg>;
}

/** Kumpulan benda. Pada susunan acak, siswa boleh mengetuk benda untuk menandai yang sudah dihitung. */
function Objects({ thing, n, layout }: { thing: Thing; n: number; layout: "rows" | "scatter" }) {
  const [marked, setMarked] = useState<number[]>([]);
  if (layout === "rows") return <div className="space-y-1" role="img" aria-label={`Kumpulan ${n} benda tersusun per baris sepuluh`}>
    {Array.from({ length: Math.ceil(n / 10) }, (_, r) => <div key={r} className="flex gap-0.5">{Array.from({ length: Math.min(10, n - r * 10) }, (_, k) => <ThingIcon key={k} thing={thing} className="size-6 sm:size-7" />)}</div>)}
  </div>;
  // Acak deterministik: sel kisi 10 × ⌈n/7⌉ diambil dengan urutan loncat.
  const cols = 10, rows = Math.ceil((n * 1.4) / cols), cells = cols * rows;
  const pos = Array.from({ length: n }, (_, i) => (i * 7 + 3) % cells).map((c, i) => [(c % cols) * 10 + 1 + ((i * 37) % 3), Math.floor(c / cols) * 11 + 1 + ((i * 53) % 4)]);
  return <div className="space-y-1">
    <div className="relative w-full max-w-sm" style={{ aspectRatio: `${cols * 10 + 6} / ${rows * 11 + 6}` }}>
      {pos.map(([x, y], i) => <button key={i} type="button" aria-label={`Tandai benda ${i + 1}`} aria-pressed={marked.includes(i)} onClick={() => setMarked(m => m.includes(i) ? m.filter(z => z !== i) : [...m, i])}
        className={`absolute grid -translate-x-0 place-items-center rounded-full ${marked.includes(i) ? "bg-warning/50 ring-2 ring-warning" : ""}`} style={{ left: `${(x / (cols * 10 + 6)) * 100}%`, top: `${(y / (rows * 11 + 6)) * 100}%`, width: "7%", aspectRatio: "1" }}>
        <ThingIcon thing={thing} className="size-full" /></button>)}
    </div>
    <p className="text-xs text-base-content/60">Ketuk benda untuk menandai yang sudah kamu hitung. <button type="button" className="link" onClick={() => setMarked([])}>Hapus tanda</button></p>
  </div>;
}

function Rod({ small = false }: { small?: boolean }) {
  return <span className={`inline-flex flex-col gap-px rounded-sm border border-red-900 bg-red-900 ${small ? "w-2.5" : "w-3.5"}`}>{Array.from({ length: 10 }, (_, i) => <span key={i} className={`${small ? "h-1.5" : "h-2.5"} bg-red-500`} />)}</span>;
}
const Unit = () => <span className="inline-block size-3.5 rounded-sm border border-red-900 bg-red-500" />;
export function Blocks({ tens, ones }: { tens: number; ones: number }) {
  return <div className="flex flex-wrap items-end gap-3" role="img" aria-label={`${tens} batang puluhan dan ${ones} balok satuan`}>
    <div className="flex gap-1">{Array.from({ length: tens }, (_, i) => <Rod key={i} />)}</div>
    <div className="grid max-w-24 grid-cols-5 gap-0.5">{Array.from({ length: ones }, (_, i) => <Unit key={i} />)}</div>
  </div>;
}

function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "objects") return <Objects thing={scene.thing} n={scene.n} layout={scene.layout} />;
  if (scene.type === "blocks") return <Blocks tens={scene.tens} ones={scene.ones} />;
  return <div className="flex gap-2">{scene.nums.map(n => <span key={n} className="grid h-14 w-10 place-items-center rounded-lg border-2 border-neutral bg-warning/40 text-2xl font-extrabold">{n}</span>)}</div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-14" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const Circle = ({ children }: { children: ReactNode }) => <span className="grid size-14 place-items-center rounded-full border-2 border-orange-400 bg-white text-xl font-extrabold">{children}</span>;
function PlaceTable({ tens, ones, children }: { tens: ReactNode; ones: ReactNode; children?: ReactNode }) {
  return <div className="inline-grid min-w-40 grid-cols-2 overflow-hidden rounded-xl border border-purple-300 text-center">
    <span className="bg-purple-200 px-3 py-1 text-xs font-bold">Puluhan</span><span className="bg-purple-200 px-3 py-1 text-xs font-bold">Satuan</span>
    <span className="grid place-items-center bg-purple-50 p-2 text-xl font-extrabold">{tens}</span><span className="grid place-items-center bg-purple-50 p-2 text-xl font-extrabold">{ones}</span>
    {children && <span className="col-span-2 grid place-items-center border-t border-purple-200 bg-purple-100 p-2 text-xl font-extrabold">{children}</span>}
  </div>;
}

/* ====================================================================== */
/* Lab A: membilang dengan ikatan sepuluh                                   */
/* ====================================================================== */
function Pencils({ n }: { n: number }) {
  return <div className="flex min-h-20 flex-wrap items-end gap-2" role="img" aria-label={`${Math.floor(n / 10)} ikat pensil berisi 10 dan ${n % 10} pensil`}>
    {Array.from({ length: Math.floor(n / 10) }, (_, i) => <span key={i} className="relative flex gap-px rounded border-2 border-amber-700 bg-amber-100 p-0.5">{Array.from({ length: 10 }, (_, k) => <span key={k} className="h-14 w-1.5 rounded-t-full bg-purple-500" />)}<span className="absolute inset-x-0 top-7 h-1.5 bg-amber-600" /></span>)}
    {Array.from({ length: n % 10 }, (_, i) => <span key={`s${i}`} className="h-14 w-1.5 rounded-t-full bg-purple-500" />)}
  </div>;
}
function CountLab() {
  const [n, setN] = useState(26);
  const t = Math.floor(n / 10) * 10, o = n % 10;
  const step = (d: number) => setN(v => Math.max(0, Math.min(50, v + d)));
  return <div className="space-y-4">
    <div className="rounded-xl bg-base-100 p-3"><Pencils n={n} /></div>
    <div role="group" aria-label="Ubah banyak pensil" className="flex flex-wrap gap-1.5">
      {[[-10, "−10"], [-1, "−1"], [1, "+1"], [10, "+10"]].map(([d, l]) => <button key={l} type="button" className={`btn btn-sm ${(d as number) > 0 ? "btn-success" : "btn-outline"}`} onClick={() => step(d as number)}>{l}</button>)}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col items-center gap-2"><Circle>{t}</Circle><Circle>{o}</Circle></div>
      <span className="text-2xl text-base-content/40" aria-hidden="true">→</span><Circle>{n}</Circle>
      <output data-testid="lab-result" data-value={String(n)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
        {t} + {o} = <strong>{n}</strong><br />{n} dibaca <strong>{numberWords(n).join(" ")}</strong>.
      </output>
    </div>
    <div className="flex flex-wrap gap-1" aria-label="Garis hitung">{Array.from({ length: 11 }, (_, i) => { const v = Math.max(0, Math.min(40, n - 5)) + i; return <span key={v} className={`grid size-9 place-items-center rounded-lg border text-sm font-bold ${v === n ? "border-success bg-success text-white" : "border-base-300 bg-base-100"}`}>{v}</span>; })}</div>
    <p className="text-xs text-base-content/60">Tekan +1 untuk menghitung maju dan −1 untuk menghitung mundur.</p>
  </div>;
}

/* ====================================================================== */
/* Lab B: nilai tempat dengan balok                                         */
/* ====================================================================== */
function PlaceLab() {
  const [t, setT] = useState(1);
  const [o, setO] = useState(16);
  const total = t * 10 + o;
  return <div className="space-y-4">
    <div className="rounded-xl bg-base-100 p-3"><Blocks tens={t} ones={o} /></div>
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className="btn btn-sm btn-success" disabled={total + 10 > 50} onClick={() => setT(t + 1)}>+ Puluhan</button>
      <button type="button" className="btn btn-sm btn-outline" disabled={!t} onClick={() => setT(t - 1)}>− Puluhan</button>
      <button type="button" className="btn btn-sm btn-success" disabled={total + 1 > 50} onClick={() => setO(o + 1)}>+ Satuan</button>
      <button type="button" className="btn btn-sm btn-outline" disabled={!o} onClick={() => setO(o - 1)}>− Satuan</button>
    </div>
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className="btn btn-sm btn-warning" disabled={o < 10} onClick={() => { setO(o - 10); setT(t + 1); }}>Tukar 10 satuan → 1 puluhan</button>
      <button type="button" className="btn btn-sm btn-outline btn-warning" disabled={!t} onClick={() => { setT(t - 1); setO(o + 10); }}>Pecah 1 puluhan → 10 satuan</button>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <PlaceTable tens={t} ones={o}>{total}</PlaceTable>
      <output data-testid="lab-result" data-value={`${t}|${o}`} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
        {t} puluhan dan {o} satuan = <strong>{total}</strong>.{o >= 10 ? <> Satuannya 10 atau lebih, jadi bisa ditukar: {Math.floor(total / 10)} puluhan dan {total % 10} satuan.</> : <> Ini cara biasa menulis {total}.</>}
      </output>
    </div>
  </div>;
}

/* ====================================================================== */
/* Lab C: membandingkan                                                    */
/* ====================================================================== */
function CompareLab() {
  const [a, setA] = useState(26);
  const [b, setB] = useState(32);
  const sign = a === b ? "=" : a > b ? ">" : "<";
  const tensDiff = Math.floor(a / 10) !== Math.floor(b / 10);
  const pick = (name: string, v: number, set: (x: number) => void) => <div className="space-y-1 text-center" role="group" aria-label={`Bilangan ${name}`}>
    <PlaceTable tens={Math.floor(v / 10)} ones={v % 10}>{v}</PlaceTable>
    <div className="flex justify-center gap-1">{[[-10, "−10"], [-1, "−1"], [1, "+1"], [10, "+10"]].map(([d, l]) => <button key={l} type="button" aria-label={`Bilangan ${name} ${l}`} className="btn btn-xs btn-outline" onClick={() => set(Math.max(0, Math.min(50, v + (d as number))))}>{l}</button>)}</div>
  </div>;
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-center gap-4">{pick("A", a, setA)}<span className="text-4xl font-extrabold text-success" aria-hidden="true">{sign}</span>{pick("B", b, setB)}</div>
    <div className="rounded-xl bg-base-100 px-4 pb-2 pt-6" aria-hidden="true">
      <div className="relative h-4 border-b-2 border-neutral/60">
        {Array.from({ length: 6 }, (_, i) => <span key={i} className="absolute bottom-0 h-3 w-px bg-neutral/60" style={{ left: `${i * 20}%` }} />)}
        <span className="absolute -top-5 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-sky-600 text-xs font-bold text-white" style={{ left: `${a * 2}%` }}>A</span>
        <span className="absolute -top-1 grid size-6 -translate-x-1/2 place-items-center rounded-full bg-orange-500 text-xs font-bold text-white" style={{ left: `${b * 2}%` }}>B</span>
      </div>
      <div className="relative h-5 text-[11px] font-bold">{[0, 10, 20, 30, 40, 50].map(v => <span key={v} className="absolute -translate-x-1/2" style={{ left: `${v * 2}%` }}>{v}</span>)}</div>
    </div>
    <output data-testid="lab-result" data-value={sign} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      <strong className="text-lg">{a} {sign} {b}</strong><br />
      {a === b ? "Kedua bilangan sama." : tensDiff ? <>Bandingkan puluhan: {Math.floor(a / 10)} dan {Math.floor(b / 10)}. Puluhan lebih banyak berarti bilangan lebih besar.</> : <>Puluhannya sama ({Math.floor(a / 10)}), jadi bandingkan satuan: {a % 10} dan {b % 10}.</>}
      {" "}Di garis bilangan, bilangan yang lebih besar ada di sebelah kanan.
    </output>
  </div>;
}

const labs = [CountLab, PlaceLab, CompareLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  const vals = value.split("|");
  const setAt = (k: number, n: number, x: string) => { const a = Array.from({ length: n }, (_, j) => vals[j] ?? ""); a[k] = x; set(a.join("|")); };
  switch (p.kind) {
    case "count": case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} <Box label={p.label} value={value} onChange={set} disabled={checked} w="w-20" /></label>;
    case "words": { const ws = value ? value.split(" ") : []; return <div className="space-y-2"><p className="font-bold">{p.label} …</p>
      <p aria-live="polite" className="min-h-11 rounded-xl border-2 border-dashed border-orange-400 bg-white px-3 py-2 text-lg font-bold">{ws.join(" ") || "Ketuk kata di bawah."}</p>
      <div role="group" aria-label={`Kata untuk ${p.label}`} className="flex flex-wrap gap-1.5">{p.tiles.map(w => <button key={w} type="button" disabled={checked} className="btn btn-sm btn-outline" onClick={() => set([...ws, w].join(" "))}>{w}</button>)}
        <button type="button" disabled={checked || !ws.length} className="btn btn-sm btn-ghost" onClick={() => set(ws.slice(0, -1).join(" "))}>Hapus kata</button></div></div>; }
    case "bond": { let k = -1; const slot = (v: number | null, name: string) => v !== null ? <Circle>{v}</Circle> : (k++, <Box key={name} label={`Pasangan ${name}`} value={vals[k] ?? ""} onChange={(kk => (x: string) => setAt(kk, p.answer.length, x))(k)} disabled={checked} />);
      return <div className="flex items-center gap-3"><div className="flex flex-col items-center gap-2">{slot(p.tens, "puluhan")}{slot(p.ones, "satuan")}</div><span className="text-2xl text-base-content/40" aria-hidden="true">→</span>{slot(p.total, "jumlah")}</div>; }
    case "seq": { let k = -1; return <div className="flex flex-wrap items-end gap-1.5" aria-label={p.label}>
      {p.style === "train" && <span className="grid h-14 w-12 place-items-center rounded-l-2xl rounded-tr-lg bg-sky-500 text-white" aria-hidden="true"><TrainFront className="size-7" strokeWidth={1.75} /></span>}
      {p.items.map((v, j) => { if (v === null) k++; const kk = k; return <span key={j} className={`grid place-items-center p-1.5 ${p.style === "train" ? "rounded-md bg-purple-600" : "rounded-b-xl rounded-t-sm bg-pink-200"}`}>
        {v !== null ? <span className="grid h-11 w-12 place-items-center rounded-lg bg-white text-xl font-extrabold">{v}</span> : <Box label={`${p.label} ${j + 1}`} value={vals[kk] ?? ""} onChange={x => setAt(kk, p.answer.length, x)} disabled={checked} w="w-12" />}
      </span>; })}</div>; }
    case "place": { const n = p.answer.length; return <PlaceTable tens={<Box label="Puluhan" value={vals[0] ?? ""} onChange={x => setAt(0, n, x)} disabled={checked} />} ones={<Box label="Satuan" value={vals[1] ?? ""} onChange={x => setAt(1, n, x)} disabled={checked} />}>
      {p.total !== null ? p.total : <Box label="Bilangan" value={vals[2] ?? ""} onChange={x => setAt(2, n, x)} disabled={checked} w="w-20" />}</PlaceTable>; }
    case "split": return <div className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.total} = <Box label="Puluhan" value={vals[0] ?? ""} onChange={x => setAt(0, 2, x)} disabled={checked} /> puluhan + <Box label="Satuan" value={vals[1] ?? ""} onChange={x => setAt(1, 2, x)} disabled={checked} /> satuan</div>;
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-3">{p.options.map(o => <button key={o} type="button" aria-label={o} aria-pressed={value === o} disabled={checked} onClick={() => set(o)}
        className={`rounded-2xl border-4 p-2 font-extrabold ${value === o ? "border-success bg-success/10" : "border-transparent bg-base-100 hover:border-success/40"}`}>
        {p.tables ? <PlaceTable tens={o[0]} ones={o[1]} /> : <span className="block px-3 py-1 text-xl">{o}</span>}</button>)}</div></div>;
    case "check": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-1.5"><p className="text-sm font-bold">{p.label}</p>{p.options.map((o, k) => { const on = sel.includes(k); return <button key={o} type="button" aria-pressed={on} aria-label={`Pilih ${o}`} disabled={checked}
      className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left font-semibold ${on ? "border-success bg-success/10" : "border-base-300 bg-base-100"}`} onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort().join(","))}>
      <span className={`grid size-6 place-items-center rounded border-2 ${on ? "border-success bg-success text-white" : "border-base-300"}`}>{on ? "✓" : ""}</span>{o}</button>; })}</div>; }
    case "order": { const sel = value ? value.split("|").filter(Boolean) : []; return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(o => { const at = sel.indexOf(o); return <button key={o} type="button" disabled={checked || at >= 0} aria-pressed={at >= 0} onClick={() => set([...sel, o].join("|"))}
        className={`relative grid h-14 min-w-14 place-items-center rounded-full border-2 px-3 text-xl font-extrabold ${at >= 0 ? "border-info bg-info/15" : "border-red-400 bg-red-50"}`}>{o}{at >= 0 && <span className="badge badge-info badge-sm absolute -right-1 -top-1">{at + 1}</span>}</button>; })}</div>
      <div className="flex flex-wrap gap-1.5">{p.options.map((_, k) => <span key={k} className="grid h-10 min-w-12 place-items-center rounded-xl border-2 border-orange-400 bg-white px-2 font-extrabold">{sel[k] ?? "…"}</span>)}</div>
      <button type="button" className="btn btn-ghost btn-xs" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join("|"))}>Batalkan terakhir</button></div>; }
    case "guess": return <div className="flex flex-wrap gap-4 font-bold">
      <label className="flex items-center gap-2">Tebakanku: <Box label="Tebakanku" value={vals[0] ?? ""} onChange={x => setAt(0, 2, x)} disabled={checked} /></label>
      <label className="flex items-center gap-2">Hitunganku: <Box label="Hitunganku" value={vals[1] ?? ""} onChange={x => setAt(1, 2, x)} disabled={checked} /></label></div>;
    case "dots": { const seqv = value ? value.split("|").filter(Boolean).map(Number) : [], n = p.to - p.from + 1;
      const posOf = (num: number) => p.pts[((num - p.from) * 5 + 3) % n];
      return <div className="space-y-2">
        <svg viewBox="0 0 100 100" className="w-full max-w-xs rounded-xl bg-sky-50" role="img" aria-label={`Titik bilangan ${p.from} sampai ${p.to}`}>
          {seqv.slice(1).map((num, k) => { const [x1, y1] = posOf(seqv[k]), [x2, y2] = posOf(num); return <path key={k} d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#7c3aed" strokeWidth="1.2" />; })}
          {Array.from({ length: n }, (_, k) => { const num = p.from + k, [x, y] = posOf(num); return <g key={num}><circle cx={x} cy={y} r="2" fill={seqv.includes(num) ? "#7c3aed" : ink} /><text x={x} y={y - 3} fontSize="5" textAnchor="middle" fontWeight="700">{num}</text></g>; })}
        </svg>
        <div role="group" aria-label="Ketuk titik" className="flex flex-wrap gap-1">{Array.from({ length: n }, (_, k) => (k * 7) % n).map(k => p.from + k).map(num => <button key={num} type="button" disabled={checked || seqv.includes(num)} aria-label={`Titik ${num}`} className={`btn btn-xs ${seqv.includes(num) ? "btn-info" : "btn-outline"}`} onClick={() => set([...seqv, num].join("|"))}>{num}</button>)}</div>
        <div className="flex gap-2"><button type="button" className="btn btn-ghost btn-xs" disabled={checked || !seqv.length} onClick={() => set(seqv.slice(0, -1).join("|"))}>Batalkan terakhir</button><button type="button" className="btn btn-ghost btn-xs" disabled={checked || !seqv.length} onClick={() => set("")}>Ulangi</button></div>
      </div>; }
  }
}
function Answer({ q, value, record, checked }: { q: CQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoCounting() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 2 · Bab 1</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Ayo Membilang sampai dengan 50</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Hitung benda dengan ikatan sepuluh, tulis dalam tabel nilai tempat, lalu bandingkan dan urutkan bilangan sampai 50.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-gradient-to-br from-warning/20 to-success/10 p-6 text-center">
        <div aria-hidden="true"><Blocks tens={2} ones={6} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Hitung, kelompokkan, bandingkan</h2>
        <p className="mt-2 text-sm text-base-content/60">3 materi interaktif, {practice.flat().length} latihan materi, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bilang">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bilang" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi · 24 soal</button>
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
          <button type="button" className="btn btn-ghost" disabled={topic === 0} onClick={() => go(topic - 1)}>← Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi →</button>
            {topic < topics.length - 1 ? <button type="button" className="btn btn-outline" onClick={() => go(topic + 1)}>Materi berikutnya</button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<CQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
