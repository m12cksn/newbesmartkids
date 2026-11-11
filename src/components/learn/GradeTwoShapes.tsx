"use client";

import { ArrowLeft, ArrowRight, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import { useState } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { FigView, fillOf, ink, ObjArt, SolidArt, curvePath } from "./ShapeVisuals";
import {
  applyCuts, assessment, corners, correct, cutShapes, describePieces, formatAnswer, P, parseCuts, pieceCorners, practice, ready, SEP, sideName,
  solidNames, objNames, splitParts, topics, type CurveName, type CutShape, type Part, type PolyName, type SolidName, type SQuestion, curvedSolid, type ObjName,
} from "@/data/grade-two-shapes";

const pieceFill: Record<number, string> = { 3: "#f4a6bd", 4: "#9cc7ef", 5: "#f6d36b", 6: "#a8dcb5" };

/* ====================================================================== */
/* Papan potong: ketuk dua titik untuk menarik garis                       */
/* ====================================================================== */
function CutBoard({ shape, value, onChange, disabled = false }: { shape: CutShape; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [first, setFirst] = useState<number | null>(null);
  const [warn, setWarn] = useState("");
  const nodes = cutShapes[shape].nodes, cuts = parseCuts(value), pieces = applyCuts(shape, cuts) ?? [nodes.map((_, i) => i)];
  const tap = (i: number) => {
    if (disabled) return;
    if (first === null) { setFirst(i); setWarn(""); return; }
    if (first === i) { setFirst(null); return; }
    const next = [...cuts, [first, i] as [number, number]];
    if (applyCuts(shape, next)) { onChange(next.map(([a, b]) => `${a}-${b}`).join(",")); setWarn(""); }
    else setWarn("Garis harus melewati bagian dalam bangun, bukan menempel di tepinya.");
    setFirst(null);
  };
  const counts = pieces.map(pc => pieceCorners(shape, pc));
  return <div className="space-y-2">
    <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-72 touch-manipulation">
      {pieces.map((pc, k) => <polygon key={k} points={pc.map(i => nodes[i].join(",")).join(" ")} fill={cuts.length ? pieceFill[counts[k]] ?? "#e5e7eb" : "#e8f4ee"} stroke={ink} strokeWidth="1.2" strokeLinejoin="round" />)}
      {cuts.map(([a, b], k) => <line key={k} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#c2410c" strokeWidth="1.6" strokeDasharray="3 2" />)}
      {nodes.map(([x, y], i) => <g key={i} role="button" tabIndex={disabled ? -1 : 0} aria-label={`Titik ${i + 1}`} aria-pressed={first === i} className="cursor-pointer outline-none [&:focus-visible>circle:last-child]:stroke-[#0b5d44]"
        onClick={() => tap(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(i); } }}>
        <circle cx={x} cy={y} r="7" fill="transparent" />
        <circle cx={x} cy={y} r={first === i ? 3.6 : 2.6} fill={first === i ? "#c2410c" : "#fff"} stroke={ink} strokeWidth="1.2" />
      </g>)}
    </svg>
    <p role="status" className="text-center text-sm font-semibold">{warn || (first !== null ? `Titik ${first + 1} dipilih. Ketuk titik lain untuk menarik garis.` : cuts.length ? `Hasil: ${describePieces(counts)}.` : "Ketuk dua titik di tepi bangun untuk menarik garis.")}</p>
    {!disabled && <div className="flex justify-center gap-2">
      <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={!cuts.length} onClick={() => onChange(cuts.slice(0, -1).map(([a, b]) => `${a}-${b}`).join(","))}><Undo2 className="size-3.5" aria-hidden="true" />Hapus garis terakhir</button>
      <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={!cuts.length} onClick={() => { onChange(""); setFirst(null); }}><RotateCcw className="size-3.5" aria-hidden="true" />Ulangi</button>
    </div>}
  </div>;
}

/* ====================================================================== */
/* Lab A: hitung sisi                                                      */
/* ====================================================================== */
/** Pita tipis di sekitar sisi sebagai area ketuk (garis mendatar tidak punya tinggi). */
const band = (a: number[], b: number[], w = 6) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = (-dy / l) * w, ny = (dx / l) * w; return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]].map(q => q.join(",")).join(" "); };
const labShapes: ({ id: string; p: PolyName } | { id: string; k: CurveName })[] = [
  { id: "A", p: "triObtuse" }, { id: "B", p: "trap" }, { id: "C", p: "pent" }, { id: "D", p: "hex" }, { id: "E", p: "hexL" }, { id: "F", k: "circle" }, { id: "G", k: "oval" },
];
function SidesLab() {
  const [pick, setPick] = useState(2);
  const [tapped, setTapped] = useState<number[]>([]);
  const [turn, setTurn] = useState(0);
  const s = labShapes[pick];
  const pts = "p" in s ? P[s.p] : null, n = pts ? corners(pts) : 0, done = pts && tapped.length === n;
  const choose = (i: number) => { setPick(i); setTapped([]); setTurn(0); };
  const isCircle = "k" in s && s.k === "circle";
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih bangun" className="flex flex-wrap gap-1.5">
      {labShapes.map((x, i) => <button key={x.id} type="button" aria-label={`Bangun ${x.id}`} aria-pressed={pick === i} onClick={() => choose(i)}
        className={`grid size-12 place-items-center rounded-lg border-2 bg-base-100 ${pick === i ? "border-success" : "border-base-300"}`}>
        <FigView fig={"p" in x ? { t: "poly", p: x.p, c: 6 } : { t: "curve", k: x.k, c: 6 }} className="size-9" /></button>)}
    </div>
    <div className="rounded-xl bg-base-100 p-3">
      <svg viewBox="-6 -6 112 112" className="mx-auto w-full max-w-64">
        {pts ? <>
          <polygon points={pts.map(q => q.join(",")).join(" ")} fill="#e8f4ee" />
          {pts.map((a, i) => { const b = pts[(i + 1) % pts.length], on = tapped.includes(i), at = tapped.indexOf(i); return <g key={i} role="button" tabIndex={0} aria-label={`Sisi ${i + 1}`} aria-pressed={on} className="cursor-pointer outline-none"
            onClick={() => setTapped(t => on ? t.filter(x => x !== i) : [...t, i])} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setTapped(t => on ? t.filter(x => x !== i) : [...t, i]); } }}>
            <polygon points={band(a, b)} fill="transparent" />
            <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={on ? "#c2410c" : ink} strokeWidth={on ? 4 : 2} strokeLinecap="round" />
            {on && <text x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2 + 3} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" stroke="#c2410c" strokeWidth="3" paintOrder="stroke">{at + 1}</text>}
          </g>; })}
        </> : <>
          <path d={curvePath[(s as { k: CurveName }).k]} fill="none" stroke={ink} strokeWidth="1.4" strokeDasharray="4 4" />
          <path d={curvePath[(s as { k: CurveName }).k]} fill="#9cc7ef" fillOpacity=".85" stroke={ink} strokeWidth="2" transform={`rotate(${turn} 50 50)`} className="motion-safe:transition-transform motion-safe:duration-500" />
        </>}
      </svg>
      {!pts && <div className="mt-2 flex justify-center"><button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => setTurn(t => t + 45)}><RotateCw className="size-4" aria-hidden="true" />Putar</button></div>}
    </div>
    <output data-testid="lab-result" data-value={pts ? (done ? sideName(n) : `${tapped.length}/${n}`) : turn ? (isCircle ? "lingkaran" : "bukan lingkaran") : "lengkung"} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {pts ? (done ? <>Semua sisi sudah dihitung: <strong>{n} sisi</strong>. Bangun ini <strong>{sideName(n).toLowerCase()}</strong>.</> : <>Ketuk setiap garis lurus di tepi bangun. Sudah dihitung <strong>{tapped.length}</strong> sisi.</>)
        : <>Bangun ini tidak punya garis lurus, jadi termasuk <strong>bentuk lengkung</strong>. {turn ? (isCircle ? "Setelah diputar, bentuknya tetap pas dengan cetakannya. Ini lingkaran." : "Setelah diputar, bentuknya tidak pas lagi dengan cetakannya. Ini bukan lingkaran.") : "Tekan Putar dan bandingkan dengan cetakan bergaris putus-putus."}</>}
    </output>
  </div>;
}

/* ====================================================================== */
/* Lab B: urai dan susun                                                   */
/* ====================================================================== */
const labCuts: CutShape[] = ["persegi", "persegiPanjang", "segiLima", "segiEnam", "rumah"];
const composes = [
  { name: "Persegi", how: "Rapatkan sisi miring", a: [[10, 10], [60, 60], [10, 60]], b: [[10, 10], [60, 10], [60, 60]] },
  { name: "Segitiga besar", how: "Rapatkan sisi tegak", a: [[0, 60], [45, 15], [45, 60]], b: [[45, 15], [90, 60], [45, 60]] },
  { name: "Jajargenjang", how: "Geser sejajar", a: [[0, 60], [45, 15], [45, 60]], b: [[45, 15], [90, 15], [45, 60]] },
] as const;
function CutLab() {
  const [shape, setShape] = useState<CutShape>("persegi");
  const [cuts, setCuts] = useState("");
  const [mode, setMode] = useState<number | null>(null);
  const pcs = applyCuts(shape, parseCuts(cuts)) ?? [];
  const desc = cuts ? describePieces(pcs.map(pc => pieceCorners(shape, pc))) : "";
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih bangun untuk diurai" className="flex flex-wrap gap-1.5">
      {labCuts.map(k => <button key={k} type="button" aria-pressed={shape === k} className={`btn btn-sm ${shape === k ? "btn-success" : "btn-outline"}`} onClick={() => { setShape(k); setCuts(""); }}>{cutShapes[k].name}</button>)}
    </div>
    <div className="rounded-xl bg-base-100 p-3"><CutBoard key={shape} shape={shape} value={cuts} onChange={setCuts} /></div>
    <output data-testid="lab-result" data-value={desc} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {desc ? <>{cutShapes[shape].name} diurai menjadi <strong>{desc}</strong>. Coba hapus garis dan tarik di tempat lain: hasilnya bisa berbeda.</> : <>Belum ada garis. Tarik garis dari satu titik ke titik lain.</>}
    </output>
    <div className="rounded-xl border border-base-300 bg-base-100 p-3">
      <p className="text-sm font-bold">Susun dua segitiga yang sama</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{composes.map((c, i) => <button key={c.name} type="button" aria-pressed={mode === i} className={`btn btn-xs ${mode === i ? "btn-success" : "btn-outline"}`} onClick={() => setMode(i)}>{c.how}</button>)}</div>
      <svg viewBox="-4 0 100 70" className="mx-auto mt-2 w-full max-w-56" aria-hidden="true">
        {mode === null ? <><polygon points="5,60 45,20 45,60" fill={fillOf(1)} stroke={ink} strokeWidth="1.2" /><polygon points="55,60 95,20 95,60" fill={fillOf(1)} stroke={ink} strokeWidth="1.2" /></>
          : <><polygon points={composes[mode].a.map(p => p.join(",")).join(" ")} fill={fillOf(1)} stroke={ink} strokeWidth="1.2" /><polygon points={composes[mode].b.map(p => p.join(",")).join(" ")} fill={fillOf(0)} stroke={ink} strokeWidth="1.2" /></>}
      </svg>
      <p data-testid="compose-result" data-value={mode === null ? "" : composes[mode].name} aria-live="polite" className="text-center text-sm">{mode === null ? "Pilih cara menempelkan." : <>Hasilnya <strong>{composes[mode].name.toLowerCase()}</strong>. Dua segitiga yang sama dapat menjadi bentuk berbeda.</>}</p>
    </div>
  </div>;
}

/* ====================================================================== */
/* Lab C: bangun ruang                                                     */
/* ====================================================================== */
const solids: SolidName[] = ["kubus", "balok", "tabung", "kerucut", "bola"];
const examples: Record<SolidName, ObjName[]> = { kubus: ["dadu", "rubik"], balok: ["kardus", "kotakSusu"], tabung: ["kaleng", "drum"], kerucut: ["topi", "conEs"], bola: ["bola", "jeruk"] };
const stamps: Record<SolidName, { shape: "sq" | "rectA" | "rectB" | "circle"; n: number }[]> = {
  kubus: [{ shape: "sq", n: 6 }], balok: [{ shape: "sq", n: 2 }, { shape: "rectA", n: 2 }, { shape: "rectB", n: 2 }], tabung: [{ shape: "circle", n: 2 }], kerucut: [{ shape: "circle", n: 1 }], bola: [],
};
function SolidLab() {
  const [s, setS] = useState<SolidName>("tabung");
  const [rolled, setRolled] = useState(false);
  const [stamped, setStamped] = useState(false);
  const curved = curvedSolid(s), total = stamps[s].reduce((a, b) => a + b.n, 0);
  const choose = (x: SolidName) => { setS(x); setRolled(false); setStamped(false); };
  return <div className="space-y-4">
    <div role="group" aria-label="Pilih bangun ruang" className="flex flex-wrap gap-1.5">
      {solids.map(x => <button key={x} type="button" aria-pressed={s === x} className={`btn btn-sm h-auto gap-1 py-1 ${s === x ? "btn-success" : "btn-outline"}`} onClick={() => choose(x)}><SolidArt s={x} className="size-7" />{solidNames[x]}</button>)}
    </div>
    <div className="overflow-hidden rounded-xl bg-base-100 p-3">
      <div className="relative h-32 border-b-4 border-amber-700/40">
        <div className={`absolute bottom-0 left-2 motion-safe:transition-transform motion-safe:duration-1000 ${rolled ? (curved ? "translate-x-[min(14rem,55vw)]" : "translate-x-4") : ""}`}>
          <div className={`motion-safe:transition-transform motion-safe:duration-1000 ${rolled && curved ? "rotate-[300deg]" : ""}`}><SolidArt s={s} className="size-28" label={solidNames[s]} /></div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><span className="font-semibold">Contoh benda:</span>{examples[s].map(o => <span key={o} className="flex items-center gap-1"><ObjArt o={o} className="size-10" />{objNames[o]}</span>)}</div>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success" onClick={() => setRolled(r => !r)}>{rolled ? "Kembalikan" : "Gelindingkan"}</button>
      <button type="button" className="btn btn-sm btn-outline" onClick={() => setStamped(true)}>Cap permukaan datar</button>
    </div>
    {stamped && <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-xl border border-dashed border-base-300 bg-base-100 p-3" aria-label="Hasil cap">
      {total === 0 ? <span className="text-sm">Tidak ada cap. Bola tidak mempunyai permukaan datar.</span>
        : stamps[s].flatMap(({ shape, n }) => Array.from({ length: n }, (_, k) => <svg key={`${shape}${k}`} viewBox="0 0 40 40" className="size-10" aria-hidden="true">
          {shape === "circle" ? <circle cx="20" cy="20" r="15" fill="#c4a6e6" stroke={ink} /> : shape === "sq" ? <rect x="6" y="6" width="28" height="28" fill="#f6d36b" stroke={ink} /> : shape === "rectA" ? <rect x="2" y="10" width="36" height="20" fill="#f3a0b8" stroke={ink} /> : <rect x="2" y="13" width="36" height="14" fill="#de7a98" stroke={ink} />}
        </svg>))}
    </div>}
    <output data-testid="lab-result" data-value={rolled ? (curved ? "menggelinding" : "tidak menggelinding") : stamped ? `${total} cap` : ""} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {rolled ? (curved ? <>{solidNames[s]} <strong>menggelinding</strong> karena mempunyai permukaan lengkung.</> : <>{solidNames[s]} <strong>tidak menggelinding</strong>, hanya bergeser, karena semua permukaannya datar.</>)
        : stamped ? (total ? <>{solidNames[s]} menghasilkan <strong>{total} cap</strong>. {s === "kubus" ? "Semua segi empat sama ukurannya." : s === "balok" ? "Segi empatnya berbeda ukuran." : "Capnya berbentuk lingkaran."}</> : <>Bola tidak menghasilkan cap datar.</>)
          : <>Gelindingkan bangun atau cap permukaan datarnya, lalu bandingkan dengan bangun lain.</>}
    </output>
  </div>;
}

const labs = [SidesLab, CutLab, SolidLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function SortPart({ p, value, set, checked }: { p: Extract<Part, { kind: "sort" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.items.length }, (_, k) => value.split(",")[k] ?? "");
  const put = (k: number, b: string) => { const v = [...vals]; v[k] = b; set(v.join(",")); setSel(null); };
  const loose = p.items.map((_, k) => k).filter(k => vals[k] === "");
  return <div className="space-y-3">
    <div role="group" aria-label="Benda yang belum dikelompokkan" className="flex min-h-16 flex-wrap gap-2 rounded-xl bg-base-200/60 p-2">
      {loose.length ? loose.map(k => <button key={k} type="button" disabled={checked} aria-label={`Ambil ${p.items[k].name}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`flex flex-col items-center rounded-xl border-2 bg-base-100 p-1 text-xs font-semibold ${sel === k ? "border-success ring-2 ring-success/40" : "border-base-300"}`}><FigView fig={p.items[k].fig} className="size-14" scale={0.5} />{p.items[k].name}</button>)
        : <p className="self-center px-2 text-sm text-base-content/60">Semua sudah dikelompokkan.</p>}
    </div>
    <p className="text-xs text-base-content/60">{sel === null ? "Ketuk satu benda, lalu ketuk kotak tujuannya." : `${p.items[sel].name} dipilih. Ketuk kotak tujuannya.`}</p>
    <div className={`grid gap-2 ${p.bins.length > 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
      {p.bins.map((b, bi) => <div key={b} className="flex min-w-0 flex-col rounded-xl border-2 border-dashed border-info/50 bg-info/5 p-2">
        <button type="button" disabled={checked || sel === null} aria-label={`Masukkan ke ${b}`} onClick={() => sel !== null && put(sel, String(bi))} className="btn btn-xs btn-info btn-outline h-auto min-h-7 whitespace-normal">{b}</button>
        <div className="mt-2 flex min-h-12 flex-wrap gap-1">{p.items.map((it, k) => vals[k] === String(bi) && <button key={k} type="button" disabled={checked} aria-label={`Keluarkan ${it.name}`} onClick={() => put(k, "")} className="flex flex-col items-center rounded-lg bg-base-100 p-0.5 text-[11px] font-semibold"><FigView fig={it.fig} className="size-10" scale={0.35} />{it.name}</button>)}</div>
      </div>)}
    </div>
  </div>;
}

function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = Array.from({ length: p.left.length }, (_, k) => value.split(",")[k] ?? "");
  const nl = p.left.length, nr = p.right.length, rows = Math.max(nl, nr), H = 1000;
  const link = (j: number) => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join(",")); setSel(null); };
  const hasFig = p.right.some(r => r.fig);
  return <div className="space-y-2">
    <p className="text-xs text-base-content/60">{sel === null ? "Ketuk gambar di kiri, lalu ketuk pasangannya di kanan." : `${p.left[sel].name} dipilih. Ketuk pasangannya di kanan.`}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]" style={{ minHeight: rows * (hasFig ? 88 : 76) }}>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${nl}, minmax(0, 1fr))` }}>
        {p.left.map((it, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${it.name}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
          className={`flex min-w-0 items-center justify-end gap-1 rounded-xl border-2 bg-base-100 px-1 ${sel === k ? "border-success ring-2 ring-success/40" : vals[k] !== "" ? "border-info/60" : "border-base-300"}`}>
          <FigView fig={it.fig} className="size-16" scale={0.9} /><span className="size-2.5 shrink-0 rounded-full bg-info" aria-hidden="true" /></button>)}
      </div>
      <svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
        {vals.map((v, k) => v !== "" && <line key={k} x1="0" y1={((k + 0.5) / nl) * H} x2="40" y2={((Number(v) + 0.5) / nr) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}
      </svg>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${nr}, minmax(0, 1fr))` }}>
        {p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r.name}`} onClick={() => link(j)}
          className="flex min-w-0 items-center gap-1 rounded-xl border-2 border-base-300 bg-base-100 px-1 text-left text-xs font-semibold sm:text-sm">
          <span className="size-2.5 shrink-0 rounded-full bg-info" aria-hidden="true" />{r.fig ? <FigView fig={r.fig} scale={0.9} /> : <span className="py-2">{r.name}</span>}</button>)}
      </div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><RotateCcw className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}

function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} <input aria-label={p.label} inputMode="numeric" value={value} disabled={checked} placeholder="…" onChange={e => set(e.target.value.replace(/\D/g, "").slice(0, 2))}
      className="h-11 w-20 rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none" /></label>;
    case "choice": return <div role="group" aria-label={`Bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className={p.figs ? "grid grid-cols-2 gap-2 sm:grid-cols-4" : "flex flex-wrap gap-2"}>{p.options.map((o, k) => <button key={o} type="button" aria-label={o} aria-pressed={value === o} disabled={checked} onClick={() => set(o)}
        className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-2 font-bold ${value === o ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-success/40"}`}>
        {p.figs && <FigView fig={p.figs[k]} className="size-16" scale={0.6} />}<span className={p.figs ? "text-sm" : "px-2 text-lg"}>{o}</span></button>)}</div></div>;
    case "check": { const sel = value ? value.split(",").filter(Boolean).map(Number) : []; return <div className="space-y-1"><p className="text-xs text-base-content/60">Ketuk untuk mewarnai. Ketuk lagi untuk membatalkan.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{p.items.map((it, k) => { const on = sel.includes(k); return <button key={k} type="button" aria-pressed={on} aria-label={`Pilih ${it.name}`} disabled={checked}
        onClick={() => set((on ? sel.filter(x => x !== k) : [...sel, k]).sort((a, b) => a - b).join(","))}
        className={`relative flex flex-col items-center rounded-xl border-2 p-1 text-xs font-semibold ${on ? "border-success bg-success/15" : "border-base-300 bg-base-100"}`}>
        <span className={on ? "" : "grayscale-[85%] opacity-80"}><FigView fig={it.fig} className="size-14" /></span>{it.name}</button>; })}</div></div>; }
    case "sort": return <SortPart p={p} value={value} set={set} checked={checked} />;
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "cut": return <CutBoard shape={p.shape} value={value} onChange={set} disabled={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoShapes() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bentuk di Sekitar Kita</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Hitung sisi bangun datar, urai dan susun bangun dengan menarik garis, lalu kenali kubus, balok, tabung, kerucut, dan bola pada benda di sekitarmu.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div className="flex items-end gap-1" aria-hidden="true"><FigView fig={{ t: "poly", p: "hex", c: 6 }} className="size-12" /><SolidArt s="kerucut" className="size-14" /><ObjArt o="rumahBurung" className="size-12" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Amati, urai, lalu kelompokkan</h2>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bentuk">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bentuk" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.fig ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><FigView fig={q.fig} className={q.fig.t === "stack" ? "w-44" : "size-36"} scale={1.6} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
