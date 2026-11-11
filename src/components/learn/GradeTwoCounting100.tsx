"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { objectArtNodes } from "@/components/illustrations/ObjectArt";
import {
  assessment, correct, formatAnswer, holderName, numberWords, practice, ready, SEP, splitParts, thingName, topics,
  type CQuestion, type Holder, type Part, type Scene, type Thing,
} from "@/data/grade-two-counting-100";

const ink = "#1f3b30";
const o = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round" as const };

/* ====================================================================== */
/* Gambar benda                                                            */
/* ====================================================================== */
const thingArt: Record<Thing, ReactNode> = {
  jeruk: objectArtNodes.orange, kelereng: objectArtNodes["marble-blue"], pensil: objectArtNodes.pencil, bintang: objectArtNodes.star, apel: objectArtNodes.apple,
  kue: <><circle cx="24" cy="26" r="16" fill="#c98a4b" {...o} /><circle cx="24" cy="24" r="10" fill="#8a5528" />{[[18, 20], [27, 19], [22, 27], [30, 26], [17, 28]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="3" height="1.6" rx=".8" fill="#fde68a" transform={`rotate(${x * 7} ${x} ${y})`} />)}</>,
  rambutan: <><circle cx="24" cy="26" r="13" fill="#d23f4a" {...o} />{Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return <path key={i} d={`M${24 + 13 * Math.cos(a)} ${26 + 13 * Math.sin(a)}q${4 * Math.cos(a + 0.5)} ${4 * Math.sin(a + 0.5)} ${6 * Math.cos(a)} ${6 * Math.sin(a)}`} fill="none" stroke="#3fa16b" strokeWidth="1.6" strokeLinecap="round" />; })}</>,
  ikan: <><path d="M8 24c6-10 22-12 30 0-8 12-24 10-30 0z" fill="#f08a24" {...o} /><path d="M38 24l8-7v14z" fill="#f08a24" {...o} /><path d="M18 16v16M26 15v18" stroke="#fff" strokeWidth="2.4" /><circle cx="13" cy="22" r="1.6" fill={ink} /></>,
  anggur: <>{[[18, 18], [26, 18], [34, 18], [22, 25], [30, 25], [26, 32], [18, 32], [34, 32], [26, 39]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" fill="#8d63c7" {...o} />)}<path d="M26 13V6" stroke="#4d7c0f" strokeWidth="2.4" /></>,
};
const Icon = ({ t, className = "size-6" }: { t: Thing; className?: string }) => <svg viewBox="0 0 48 48" className={className} aria-hidden="true">{thingArt[t]}</svg>;

/** Satu wadah berisi 10 benda. */
function Pack({ thing, holder }: { thing: Thing; holder: Holder }) {
  const grid = Array.from({ length: 10 }, (_, i) => [8 + (i % 5) * 13, holder === "gelas" ? 4 + Math.floor(i / 5) * 6 : 8 + Math.floor(i / 5) * 12]);
  const shell: Record<Holder, ReactNode> = {
    keranjang: <path d="M2 30h72l-6 22H8z" fill="#c98a4b" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />,
    kantong: <path d="M4 6h68l-4 46H8z" fill="#e0f2fe" fillOpacity=".6" stroke="#64748b" strokeWidth="1.4" strokeLinejoin="round" />,
    kotak: <rect x="2" y="4" width="72" height="34" rx="4" fill="#3b2a20" stroke={ink} strokeWidth="1.4" />,
    gelas: <path d="M14 22h48l-4 30H18z" fill="#e8559a" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />,
  };
  const front = holder === "keranjang" || holder === "gelas";
  return <svg viewBox="0 0 76 56" className="h-12 w-16 sm:h-14 sm:w-[4.5rem]" aria-hidden="true">
    {!front && shell[holder]}
    {grid.map(([x, y], i) => <svg key={i} x={holder === "gelas" ? 10 + (i % 5) * 11 : x - 6} y={holder === "keranjang" ? 14 + Math.floor(i / 5) * 8 : holder === "gelas" ? 0 + Math.floor(i / 5) * 6 : y - 4} width={holder === "gelas" ? 22 : 14} height={holder === "gelas" ? 26 : 14} viewBox="0 0 48 48">{thingArt[thing]}</svg>)}
    {front && shell[holder]}
  </svg>;
}
function Packs({ thing, holder, packs, loose }: { thing: Thing; holder: Holder; packs: number; loose: number }) {
  return <div className="space-y-2" role="img" aria-label={`${packs} ${holderName[holder]} masing-masing berisi 10 ${thingName[thing]}${loose ? ` dan ${loose} ${thingName[thing]} lepas` : ""}`}>
    <div className="flex flex-wrap gap-1">{Array.from({ length: packs }, (_, i) => <Pack key={i} thing={thing} holder={holder} />)}</div>
    {loose > 0 && <div className="flex max-w-xs flex-wrap gap-0.5">{Array.from({ length: loose }, (_, i) => <Icon key={i} t={thing} className="size-6" />)}</div>}
  </div>;
}
function Scatter({ thing, n }: { thing: Thing; n: number }) {
  const [marked, setMarked] = useState<number[]>([]);
  const cols = 12, rows = Math.ceil((n * 1.35) / cols), cells = cols * rows;
  const pos = Array.from({ length: n }, (_, i) => (i * 7 + 3) % cells).map((c, i) => [(c % cols) * 10 + 1 + ((i * 37) % 3), Math.floor(c / cols) * 10 + 1 + ((i * 53) % 3)]);
  const W = cols * 10 + 4, Hh = rows * 10 + 4;
  return <div className="w-full max-w-md space-y-1">
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${Hh}` }}>
      {pos.map(([x, y], i) => <button key={i} type="button" aria-label={`Tandai benda ${i + 1}`} aria-pressed={marked.includes(i)} onClick={() => setMarked(m => m.includes(i) ? m.filter(z => z !== i) : [...m, i])}
        className={`absolute grid place-items-center rounded-full ${marked.includes(i) ? "bg-warning/60 ring-2 ring-warning" : ""}`} style={{ left: `${(x / W) * 100}%`, top: `${(y / Hh) * 100}%`, width: "7%", aspectRatio: "1" }}><Icon t={thing} className="size-full" /></button>)}
    </div>
    <p className="text-xs text-base-content/60">Ketuk benda untuk menandai yang sudah dihitung. Ditandai {marked.length}. <button type="button" className="link" onClick={() => setMarked([])}>Hapus tanda</button></p>
  </div>;
}
const Dragonfly = ({ className }: { className?: string }) => <svg viewBox="0 0 48 48" className={className} aria-hidden="true"><path d="M24 14v28" stroke="#2f86d6" strokeWidth="4" strokeLinecap="round" /><circle cx="24" cy="11" r="4" fill="#2f86d6" {...o} /><ellipse cx="13" cy="18" rx="11" ry="4" fill="#bfe3f7" {...o} /><ellipse cx="35" cy="18" rx="11" ry="4" fill="#bfe3f7" {...o} /><ellipse cx="14" cy="25" rx="9" ry="3.4" fill="#bfe3f7" {...o} /><ellipse cx="34" cy="25" rx="9" ry="3.4" fill="#bfe3f7" {...o} /></svg>;
function Strip({ from, to, animal, at, reveal = false }: { from: number; to: number; animal: "kupu" | "capung"; at: number; reveal?: boolean }) {
  return <div className="flex max-w-full flex-wrap gap-0.5" role="img" aria-label={`Garis bilangan ${from} sampai ${to} dengan ${animal === "kupu" ? "kupu-kupu" : "capung"} di salah satu kotak`}>
    {Array.from({ length: to - from + 1 }, (_, i) => from + i).map(n => <span key={n} className={`grid h-10 w-9 place-items-center rounded-md border text-sm font-bold ${n === at ? "border-warning bg-warning/20" : "border-purple-200 bg-purple-50"}`}>
      {n === at && !reveal ? (animal === "kupu" ? <svg viewBox="0 0 48 48" className="size-8" aria-hidden="true">{objectArtNodes.butterfly}</svg> : <Dragonfly className="size-8" />) : n}</span>)}
  </div>;
}
function PlaceTable({ tens, ones, total }: { tens: ReactNode; ones: ReactNode; total?: ReactNode }) {
  return <div className="inline-grid min-w-36 grid-cols-2 overflow-hidden rounded-xl border border-purple-300 text-center">
    <span className="bg-purple-200 px-3 py-1 text-xs font-bold">Puluhan</span><span className="bg-purple-200 px-3 py-1 text-xs font-bold">Satuan</span>
    <span className="grid place-items-center bg-purple-50 p-2 text-xl font-extrabold">{tens}</span><span className="grid place-items-center bg-purple-50 p-2 text-xl font-extrabold">{ones}</span>
    {total !== undefined && <span className="col-span-2 border-t border-purple-200 bg-purple-100 p-1.5 text-lg font-extrabold">{total}</span>}
  </div>;
}
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "packs") return <Packs thing={scene.thing} holder={scene.holder} packs={scene.packs} loose={scene.loose} />;
  if (scene.type === "scatter") return <Scatter thing={scene.thing} n={scene.n} />;
  if (scene.type === "strip") return <Strip from={scene.from} to={scene.to} animal={scene.animal} at={scene.at} />;
  return <div className="flex flex-wrap gap-2">{scene.nums.map((n, i) => <span key={n} className="flex flex-col items-center"><span className="grid h-16 w-14 place-items-center rounded-lg border-2 border-neutral bg-warning/40 text-2xl font-extrabold">{n}</span>{scene.letters && <span className="text-sm font-bold">{"ABCD"[i]}</span>}</span>)}</div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-16" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const Circle = ({ children }: { children: ReactNode }) => <span className="grid size-14 place-items-center rounded-full border-2 border-orange-400 bg-white text-lg font-extrabold">{children}</span>;

/* ====================================================================== */
/* Lab A: bungkus sepuluh                                                  */
/* ====================================================================== */
function CountLab() {
  const [n, setN] = useState(53);
  const t = Math.floor(n / 10), u = n % 10;
  const step = (d: number) => setN(v => Math.max(0, Math.min(100, v + d)));
  return <div className="space-y-4">
    <div className="rounded-xl bg-base-100 p-3"><Packs thing="kue" holder="kotak" packs={t} loose={u} /></div>
    <div role="group" aria-label="Ubah banyak kue" className="flex flex-wrap gap-1.5">
      {([[-10, "Kurangi 10"], [-1, "Kurangi 1"], [1, "Tambah 1"], [10, "Tambah 10"]] as const).map(([d, l]) => <button key={l} type="button" aria-label={l} className={`btn btn-sm gap-1 ${d > 0 ? "btn-success" : "btn-outline"}`} onClick={() => step(d)}>{d > 0 ? <Plus className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}{Math.abs(d)}</button>)}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <PlaceTable tens={t} ones={u} />
      <div className="flex items-center gap-2"><div className="flex flex-col gap-1"><Circle>{t * 10}</Circle><Circle>{u}</Circle></div><ArrowRight className="size-5 text-base-content/40" aria-hidden="true" /><Circle>{n}</Circle></div>
    </div>
    <output data-testid="lab-result" data-value={String(n)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {t} puluhan dan {u} satuan = {t * 10} + {u} = <strong>{n}</strong>, dibaca <strong>{numberWords(n).join(" ")}</strong>.{n === 100 && " Sepuluh puluhan adalah seratus."}
    </output>
  </div>;
}

/* ====================================================================== */
/* Lab B: maju, mundur, dan membandingkan                                  */
/* ====================================================================== */
function CompareLab() {
  const [start, setStart] = useState(58);
  const [pos, setPos] = useState(58);
  const [a, setA] = useState(56);
  const [b, setB] = useState(65);
  const lo = Math.max(50, Math.min(pos - 5, 90)), d = pos - start;
  const sign = a === b ? "=" : a > b ? ">" : "<";
  const pick = (name: string, v: number, set: (x: number) => void) => <div className="space-y-1 text-center" role="group" aria-label={`Bilangan ${name}`}>
    <PlaceTable tens={Math.floor(v / 10)} ones={v % 10} total={v} />
    <div className="flex justify-center gap-1">{[-10, -1, 1, 10].map(k => <button key={k} type="button" aria-label={`Bilangan ${name} ${k > 0 ? "tambah" : "kurangi"} ${Math.abs(k)}`} className="btn btn-xs btn-outline" onClick={() => set(Math.max(0, Math.min(100, v + k)))}>{k > 0 ? "+" : "−"}{Math.abs(k)}</button>)}</div>
  </div>;
  return <div className="space-y-4">
    <div className="rounded-xl bg-base-100 p-3 space-y-2">
      <Strip from={lo} to={lo + 10} animal="kupu" at={pos} />
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className="btn btn-sm btn-outline gap-1" disabled={pos <= 50} onClick={() => setPos(pos - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Mundur</button>
        <button type="button" className="btn btn-sm btn-success gap-1" disabled={pos >= 100} onClick={() => setPos(pos + 1)}>Maju<ArrowRight className="size-4" aria-hidden="true" /></button>
        <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setStart(pos)}><RotateCcw className="size-4" aria-hidden="true" />Mulai dari sini</button>
      </div>
      <output data-testid="lab-result" data-value={String(pos)} aria-live="polite" className="block text-sm leading-6">
        Kupu-kupu mula-mula di {start}, sekarang di <strong>{pos}</strong>. {d > 0 ? <>{d} lebihnya dari {start} adalah {pos}.</> : d < 0 ? <>{-d} kurangnya dari {start} adalah {pos}.</> : "Tekan Maju atau Mundur."}
      </output>
    </div>
    <div className="rounded-xl border border-base-300 bg-base-100 p-3">
      <p className="text-sm font-bold">Bandingkan dua bilangan</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">{pick("A", a, setA)}<span className="text-4xl font-extrabold text-success" aria-hidden="true">{sign}</span>{pick("B", b, setB)}</div>
      <p data-testid="compare-result" data-value={sign} className="mt-2 text-sm">{a === b ? "Kedua bilangan sama." : Math.floor(a / 10) !== Math.floor(b / 10) ? `Puluhan ${Math.floor(a / 10)} dan ${Math.floor(b / 10)} berbeda, jadi ${Math.max(a, b)} lebih besar.` : `Puluhannya sama, bandingkan satuan ${a % 10} dan ${b % 10}. ${Math.max(a, b)} lebih besar.`}</p>
    </div>
  </div>;
}
const labs = [CountLab, CompareLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.left.length }, (_, k) => value.split(",")[k] ?? "");
  const n = p.left.length, H = 1000;
  return <div className="space-y-2">
    <p className="text-xs text-base-content/60">{sel === null ? "Ketuk kotak di kiri, lalu ketuk bilangan pasangannya di kanan." : `${p.left[sel]} dipilih. Ketuk bilangannya.`}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,5rem)]" style={{ minHeight: n * 52 }}>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${l}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-2 text-left text-sm font-semibold ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}>{l}</button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / p.right.length) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${p.right.length}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join(",")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 text-xl font-extrabold">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  const vals = value.split("|");
  const setAt = (k: number, n: number, x: string) => { const a = Array.from({ length: n }, (_, j) => vals[j] ?? ""); a[k] = x; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} <Box label={p.label} value={value} onChange={set} disabled={checked} w="w-20" /></label>;
    case "words": { const ws = value ? value.split(" ") : []; return <div className="space-y-2"><p className="font-bold">{p.label} …</p>
      <p aria-live="polite" className="min-h-11 rounded-xl border-2 border-dashed border-orange-400 bg-white px-3 py-2 text-lg font-bold">{ws.join(" ") || "Ketuk kata di bawah."}</p>
      <div role="group" aria-label={`Kata untuk ${p.label}`} className="flex flex-wrap gap-1.5">{p.tiles.map(w => <button key={w} type="button" disabled={checked} className="btn btn-sm btn-outline" onClick={() => set([...ws, w].join(" "))}>{w}</button>)}
        <button type="button" disabled={checked || !ws.length} className="btn btn-sm btn-ghost" onClick={() => set(ws.slice(0, -1).join(" "))}>Hapus kata</button></div></div>; }
    case "pv": { const f = (k: number, label: string) => <Box label={label} value={vals[k] ?? ""} onChange={x => setAt(k, 5, x)} disabled={checked} w={k < 2 ? "w-14" : "w-16"} />;
      return <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4"><PlaceTable tens={f(0, "Puluhan")} ones={f(1, "Satuan")} />
          <div className="flex items-center gap-2" aria-label="Pasangan bilangan"><div className="flex flex-col gap-1"><Circle>{vals[2] || "…"}</Circle><Circle>{vals[3] || "…"}</Circle></div><ArrowRight className="size-5 text-base-content/40" aria-hidden="true" /><Circle>{vals[4] || "…"}</Circle></div></div>
        <p className="flex flex-wrap items-center gap-1.5 text-base font-semibold">{vals[0] || "…"} puluhan dan {vals[1] || "…"} satuan = {f(2, "Nilai puluhan")} + {f(3, "Nilai satuan")} = {f(4, "Jumlah")}</p>
      </div>; }
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "guess": return <div className="flex flex-wrap gap-4 font-bold">
      <label className="flex items-center gap-2">Tebakanku: <Box label="Tebakanku" value={vals[0] ?? ""} onChange={x => setAt(0, 2, x)} disabled={checked} /></label>
      <label className="flex items-center gap-2">Hasil hitunganku: <Box label="Hasil hitunganku" value={vals[1] ?? ""} onChange={x => setAt(1, 2, x)} disabled={checked} /></label></div>;
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-3">{p.options.map(op => <button key={op} type="button" aria-label={op} aria-pressed={value === op} disabled={checked} onClick={() => set(op)}
        className={`rounded-2xl border-4 p-1.5 font-extrabold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>
        {p.tables ? <PlaceTable tens={op[0]} ones={op[1]} total={op} /> : <span className="block px-3 py-1 text-xl">{op}</span>}</button>)}</div></div>;
    case "order": { const sel = value ? value.split("|").filter(Boolean) : []; return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap items-end gap-1"><span className="grid h-14 w-12 place-items-center rounded-l-2xl rounded-tr-lg bg-sky-600 text-white" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="4" y="5" width="16" height="12" rx="2" /><path d="M8 17l-2 3M16 17l2 3M4 11h16" /></svg></span>
        {p.options.map(op => { const at = sel.indexOf(op); return <button key={op} type="button" disabled={checked || at >= 0} aria-label={op} onClick={() => set([...sel, op].join("|"))}
          className={`relative grid h-14 min-w-14 place-items-center rounded-md border-4 px-2 text-xl font-extrabold ${at >= 0 ? "border-info bg-info/10" : "border-purple-500 bg-white"}`}>{op}{at >= 0 && <span className="badge badge-info badge-sm absolute -right-1 -top-2">{at + 1}</span>}</button>; })}</div>
      <div className="flex flex-wrap gap-1.5">{p.options.map((_, k) => <span key={k} className="grid h-10 min-w-12 place-items-center rounded-xl border-2 border-orange-400 bg-white px-2 font-extrabold">{sel[k] ?? "…"}</span>)}</div>
      <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || !sel.length} onClick={() => set(sel.slice(0, -1).join("|"))}><RotateCcw className="size-3.5" aria-hidden="true" />Batalkan terakhir</button></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: CQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoCounting100() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 7</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Ayo Membilang sampai dengan 100</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Hitung benda dengan kelompok sepuluh, baca dan tulis bilangan sampai 100, lalu bandingkan dan urutkan bilangan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex gap-1"><Pack thing="kue" holder="kotak" /><Pack thing="rambutan" holder="keranjang" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Sepuluh-sepuluh sampai seratus</h2>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-seratus">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-seratus" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
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
      </> : <GradeFourQuiz<CQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 7"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
