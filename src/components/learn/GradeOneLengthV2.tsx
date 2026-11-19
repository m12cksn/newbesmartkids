"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { AnimalArt, animalW, FlyerArt, HArt, HArtAt, Kid, thick, UnitArt, VArt, vWidth, WayArt } from "./GradeOneLengthArt";
import { assessment, cells, circleNames, colorName, correct, flyerName, formatAnswer, layCount, objName, practice, ready, SEP, splitParts, topics, unitLen, unitName, wayName, type Color, type HObj, type LQuestion, type Part, type Scene, type Unit, type Way } from "@/data/grade-one-length-v2";

/** Di layar pendek (tinggi ≤ 700 px) gambar dibatasi lebih rendah agar soal muat tanpa menggulir. */
const svgCls = "mx-auto block h-auto w-full [@media(max-height:700px)]:max-h-[21vh]!";
const Label = ({ x, y, t }: { x: number; y: number; t: string }) => <g><circle cx={x} cy={y} r={5.5} fill="#fff4e0" stroke="#f08a24" strokeWidth={1} /><text x={x} y={y + 2.6} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#3b2f2a">{t}</text></g>;
type Tapper = { marked?: number[]; toggle?: (k: number) => void; names?: string[] };
/** Benda yang bisa diketuk untuk dilingkari. */
function Tap({ k, box, children, marked, toggle, names }: Tapper & { k: number; box: [number, number, number, number]; children: ReactNode }) {
  if (!toggle) return <g>{children}</g>;
  const on = marked?.includes(k) ?? false, [x, y, w, h] = box;
  const key = (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(k); } };
  return <g role="button" tabIndex={0} aria-label={names?.[k]} aria-pressed={on} onClick={() => toggle(k)} onKeyDown={key} className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[#208f6d]">
    <rect x={x} y={y} width={w} height={h} rx={4} fill="transparent" stroke="transparent" strokeWidth={1.5} strokeDasharray="3 2" />{children}
    {on && <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2 + 2} ry={h / 2 + 2} fill="none" stroke="#dc2626" strokeWidth={2} />}
  </g>;
}

/** Menyusun blok berurutan: f memberi hasil dan posisi berikutnya. */
function stackUp<T, R>(items: T[], start: number, f: (it: T, at: number) => [R, number]): [R[], number] {
  let at = start; const out = items.map(it => { const [r, next] = f(it, at); at = next; return r; }); return [out, at];
}
/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function StackView({ s, ...tap }: { s: Extract<Scene, { type: "stack" }> } & Tapper) {
  const [rows, y] = stackUp(s.items, 6, (it, at) => { const t = thick(it.obj, it.len); return [{ it, cy: at + t / 2, t }, at + t + 12]; });
  const W = Math.max(...s.items.map(i => i.len)) + 22, H = y - 6;
  return <svg viewBox={`0 0 ${W} ${H}`} className={`${svgCls} max-w-md`} style={{ maxHeight: "22vh" }} role={tap.toggle ? undefined : "img"} aria-label={tap.toggle ? undefined : s.items.map(i => objName[i.obj]).join(", ")}>
    <line x1={8} x2={8} y1={0} y2={H} stroke="#555" strokeWidth={0.8} strokeDasharray="3 2" />
    {rows.map(({ it, cy, t }, k) => <Tap key={k} k={k} box={[6, cy - t / 2 - 2, it.len + 6, t + 4]} {...tap}><HArt obj={it.obj} x={8} y={cy} len={it.len} color={it.color} /></Tap>)}
  </svg>;
}
function RowView({ s, ...tap }: { s: Extract<Scene, { type: "row" }> } & Tapper) {
  const maxH = Math.max(...s.items.map(i => i.h)), slot = Math.max(...s.items.map(i => vWidth(s.obj, i.h))) + 10, W = slot * s.items.length, base = maxH + 4, H = base + 16;
  return <svg viewBox={`0 0 ${W} ${H}`} className={`${svgCls} max-w-md`} style={{ maxHeight: "30vh" }} role={tap.toggle ? undefined : "img"} aria-label={tap.toggle ? undefined : `${s.items.length} ${objName[s.obj]} berlabel ${s.items.map(i => i.label).join(", ")}`}>
    {s.obj !== "kapal" && <rect x={0} y={base} width={W} height={2.5} rx={1} fill={s.obj === "payung" ? "#9aa3ad" : "#7a5a3a"} />}
    {s.items.map((it, k) => { const cx = slot * (k + 0.5), w = vWidth(s.obj, it.h);
      return <g key={k}><Tap k={k} box={[cx - w / 2 - 3, base - it.h - 2, w + 6, it.h + 4]} {...tap}><VArt obj={s.obj} cx={cx} base={base} h={it.h} color={it.color} /></Tap><Label x={cx} y={base + 9} t={it.label} /></g>; })}
  </svg>;
}
function GridView({ s, ...tap }: { s: Extract<Scene, { type: "grid" }> } & Tapper) {
  const W = s.w * 10, H = s.h * 10;
  return <svg viewBox={`-1 -1 ${W + 2} ${H + 2}`} className={`${svgCls} max-w-sm`} style={{ maxHeight: "28vh" }} role={tap.toggle ? undefined : "img"} aria-label={tap.toggle ? undefined : `Petak kotak dengan ${s.items.map(i => `${i.obj} ${i.label}`).join(", ")}`}>
    <rect x={0} y={0} width={W} height={H} fill="#e6f4fb" />
    {Array.from({ length: s.w + 1 }, (_, i) => <line key={`v${i}`} x1={i * 10} x2={i * 10} y1={0} y2={H} stroke="#7cc3e3" strokeWidth={0.5} />)}
    {Array.from({ length: s.h + 1 }, (_, i) => <line key={`h${i}`} x1={0} x2={W} y1={i * 10} y2={i * 10} stroke="#7cc3e3" strokeWidth={0.5} />)}
    {s.items.map((it, k) => { const L = it.len * 10, px = it.vertical ? it.x * 10 + 5 : it.x * 10, py = it.vertical ? (it.y + it.len) * 10 : it.y * 10 + 5;
      const box: [number, number, number, number] = it.vertical ? [it.x * 10 + 1, it.y * 10, 8, L] : [it.x * 10, it.y * 10 + 1, L, 8];
      return <g key={k}><Tap k={k} box={box} {...tap}><HArtAt obj={it.obj} x={px} y={py} len={L} color={it.color} vertical={it.vertical} /></Tap>
        <Label x={it.x * 10 + 5} y={it.vertical ? (it.y + it.len) * 10 + 5 : (it.y - 1) * 10 + 5} t={it.label} /></g>; })}
  </svg>;
}
function SkyView({ s }: { s: Extract<Scene, { type: "sky" }> }) {
  const W = 200, H = 104;
  return <svg viewBox={`0 0 ${W} ${H}`} className={`${svgCls} max-w-md`} style={{ maxHeight: "28vh" }} role="img" aria-label={`${s.items.length} ${flyerName[s.flyer]} terbang pada ketinggian berbeda`}>
    <rect x={0} y={0} width={W} height={H} rx={6} fill="#d8eefb" />
    {[[30, 9], [150, 12]].map(([x, y], k) => <g key={k} fill="#fff"><circle cx={x} cy={y} r={6} /><circle cx={x + 7} cy={y - 2} r={7} /><circle cx={x + 14} cy={y} r={5.5} /></g>)}
    <path d={`M0 ${H - 12} Q50 ${H - 18} 100 ${H - 12} T200 ${H - 12} V${H} H0 Z`} fill="#7cc35a" />
    {s.items.map((it, k) => { const x = (W * (k + 0.5)) / s.items.length, y = 89 - it.y * 8.4;
      return <g key={k}><FlyerArt flyer={s.flyer} x={x} y={y} color={it.color} s={1.15} />{it.label && <Label x={x + 15} y={y + 9} t={it.label} />}</g>; })}
  </svg>;
}
const unitRowH = (u: Unit) => ({ penjepit: 6, koin: 9, stik: 8, sedotan: 7, jengkal: 32, jengkalAyah: 47 }[u]);
function UnitRow({ unit, n, x, y, vertical }: { unit: Unit; n: number; x: number; y: number; vertical?: boolean }) {
  const row = Array.from({ length: n }, (_, k) => <UnitArt key={k} unit={unit} x={x + k * unitLen[unit]} y={y} k={k} />);
  return vertical ? <g transform={`rotate(-90 ${x} ${y})`}>{row}</g> : <g>{row}</g>;
}
function MeasureView({ s }: { s: Extract<Scene, { type: "measure" }> }) {
  const hs = s.items.filter(i => !i.vertical), vs = s.items.filter(i => i.vertical);
  const [hb, y] = stackUp(hs, 4, (it, at) => { const t = thick(it.obj, it.len), cy = at + t / 2; const [rows, uy] = stackUp(it.units, cy + t / 2 + 4, (u, v) => [{ u, y: v + unitRowH(u) / 2 }, v + unitRowH(u) + 2]); return [{ it, cy, rows }, uy + 8]; });
  const hW = hs.length ? Math.max(...hs.map(i => i.len)) + 10 : 0, vH = vs.length ? Math.max(...vs.map(i => i.len)) + 8 : 0, H = Math.max(y - 4, vH);
  const [vb, vx] = stackUp(vs, hW + (hs.length ? 16 : 4), (it, at) => { const t = thick(it.obj, it.len), cx = at + t / 2; const [cols, ux] = stackUp(it.units, cx + t / 2 + 4, (u, v) => [{ u, x: v + unitRowH(u) / 2 }, v + unitRowH(u) + 2]); return [{ it, cx, cols }, ux + 10]; });
  const W = vs.length ? vx - 6 : hW + 4;
  return <svg viewBox={`0 0 ${W} ${H}`} className={`${svgCls} max-w-lg`} style={{ maxHeight: "36vh" }} role="img" aria-label={`${s.items.map(i => objName[i.obj]).join(" dan ")} diukur`}>
    {hb.map(({ it, cy, rows }, k) => <g key={k}><HArt obj={it.obj} x={4} y={cy} len={it.len} color={it.color} />{rows.map(r => <UnitRow key={r.u} unit={r.u} n={it.len / unitLen[r.u]} x={4} y={r.y} />)}</g>)}
    {vb.map(({ it, cx, cols }, k) => <g key={k}><HArtAt obj={it.obj} x={cx} y={H - 2} len={it.len} color={it.color} vertical />{cols.map(c => <UnitRow key={c.u} unit={c.u} n={it.len / unitLen[c.u]} x={c.x} y={H - 2} vertical />)}</g>)}
  </svg>;
}
const animalName = { kucing: "kucing", sapi: "sapi", jerapah: "jerapah" } as const;
function AnimalsView({ s }: { s: Extract<Scene, { type: "animals" }> }) {
  const maxH = Math.max(...s.items.map(i => i.h)) * 10, base = maxH + 4; 
  const [pos, x] = stackUp(s.items, 2, (it, at) => { const aw = (animalW[it.animal] * it.h * 10) / 100; return [{ it, x: at, aw }, at + aw + 20]; });
  return <svg viewBox={`0 0 ${x - 6} ${base + 14}`} className={`${svgCls} max-w-md`} style={{ maxHeight: "36vh" }} role="img" aria-label={`Kucing, sapi, dan jerapah dengan kolom kotak`}>
    {pos.map(({ it, x: ax, aw }, k) => <g key={k}><AnimalArt animal={it.animal} x={ax} base={base} h={it.h * 10} />
      {Array.from({ length: it.h }, (_, j) => <rect key={j} x={ax + aw + 3} y={base - (j + 1) * 10} width={9} height={10} fill="#ec5f98" stroke="#fff" strokeWidth={0.8} />)}
      <text x={ax + aw / 2 + 6} y={base + 11} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#3b2f2a">{animalName[it.animal]}</text></g>)}
  </svg>;
}
function SpanView({ s }: { s: Extract<Scene, { type: "span" }> }) {
  return <div className="w-full max-w-md space-y-1">{s.rows.map(r => { const hh = r.unit === "jengkalAyah" ? 47 : 32, n = s.len / unitLen[r.unit];
    return <div key={r.who}><p className="text-sm font-bold">Jengkal {r.who}</p><svg viewBox={`0 0 ${s.len + 12} ${hh + 14}`} className={svgCls} style={{ maxHeight: "17vh" }} role="img" aria-label={`Meja diukur dengan jengkal ${r.who}`}>
      <rect x={6} y={2} width={s.len} height={hh + 6} rx={2} fill="#fbe3a2" stroke="#d9a548" strokeWidth={1} /><rect x={6} y={hh + 7} width={s.len} height={5} fill="#d9a548" />
      {Array.from({ length: n }, (_, k) => <UnitArt key={k} unit={r.unit} x={6 + k * unitLen[r.unit]} y={hh + 6} />)}
    </svg></div>; })}</div>;
}
function KiraView() {
  return <svg viewBox="0 0 156 70" className={`${svgCls} max-w-md`} style={{ maxHeight: "30vh" }} role="img" aria-label="Kotak pensil diukur dengan dua koin, dua stik es krim, dan satu penghapus">
    <rect x={6} y={4} width={144} height={36} rx={12} fill="#7b4fc4" /><rect x={10} y={10} width={136} height={24} rx={9} fill="#c9ccd1" />
    <HArt obj="pensil" x={30} y={22} len={80} color="biru" />
    {[0, 1].map(k => <UnitArt key={k} unit="koin" x={6 + k * 8} y={52} />)}
    {[0, 1].map(k => <UnitArt key={`s${k}`} unit="stik" x={22 + k * 48} y={52} />)}
    <rect x={118.5} y={45} width={31} height={14} rx={3} fill="#eef3f7" stroke="#9fb3c4" strokeWidth={0.6} /><rect x={128} y={45} width={13} height={14} fill="#2f7fd6" />
    <line x1={6} x2={6} y1={0} y2={66} stroke="#555" strokeWidth={0.6} strokeDasharray="2 2" /><line x1={150} x2={150} y1={0} y2={66} stroke="#555" strokeWidth={0.6} strokeDasharray="2 2" />
  </svg>;
}
function KidsView({ s }: { s: Extract<Scene, { type: "kids" }> }) {
  const base = Math.max(...s.items.map(i => i.h)) + 3;
  return <svg viewBox={`0 0 ${s.items.length * 46} ${base + 13}`} className={`${svgCls} max-w-sm`} style={{ maxHeight: "28vh" }} role="img" aria-label={`${s.items.map(i => i.name).join(", ")} berbaris`}>
    <rect x={0} y={base} width={s.items.length * 46} height={1.5} fill="#9aa3ad" />
    {s.items.map((it, k) => <g key={it.name}><Kid cx={23 + k * 46} base={base} h={it.h} look={it.look} /><text x={23 + k * 46} y={base + 11} textAnchor="middle" fontSize={9} fontWeight={700} fill="#3b2f2a">{it.name}</text></g>)}
  </svg>;
}
function PerchView({ s }: { s: Extract<Scene, { type: "perch" }> }) {
  const W = s.items.length * 50;
  return <svg viewBox={`0 0 ${W} 54`} className={`${svgCls} max-w-xs`} style={{ maxHeight: "22vh" }} role="img" aria-label={`Burung ${s.items.map(c => colorName[c]).join(", ")}`}>
    <path d={`M0 33 Q${W / 2} 29 ${W} 34`} stroke="#8a6a49" strokeWidth={3} fill="none" strokeLinecap="round" />
    {s.items.map((c, k) => <g key={c}><FlyerArt flyer={s.flyer} x={25 + k * 50} y={22} color={c} s={1.3} /><text x={25 + k * 50} y={49} textAnchor="middle" fontSize={9} fontWeight={700} fill="#3b2f2a">{colorName[c]}</text></g>)}
  </svg>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "stack": return <StackView s={scene} />;
    case "row": return <RowView s={scene} />;
    case "grid": return <GridView s={scene} />;
    case "sky": return <SkyView s={scene} />;
    case "measure": return <MeasureView s={scene} />;
    case "animals": return <AnimalsView s={scene} />;
    case "span": return <SpanView s={scene} />;
    case "kira": return <KiraView />;
    case "kids": return <KidsView s={scene} />;
    case "perch": return <PerchView s={scene} />;
  }
}

/* ====================================================================== */
/* Bentuk jawaban                                                          */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className="h-11 w-12 rounded-2xl border-4 border-orange-400 bg-white text-center text-2xl font-extrabold text-neutral focus:border-success focus:outline-none sm:h-12 sm:w-14" />;
}
function CircleView({ p, value, set, checked }: { p: Extract<Part, { kind: "circle" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const marked = value ? value.split(",").map(Number) : [], names = circleNames(p.scene);
  const toggle = (k: number) => { if (checked) return; const next = p.ans.length === 1 ? (marked[0] === k ? [] : [k]) : marked.includes(k) ? marked.filter(m => m !== k) : [...marked, k]; set(next.sort((a, b) => a - b).join(",")); };
  const t = { marked, toggle, names };
  return <div className="rounded-xl bg-base-200/60 p-2">{p.scene.type === "stack" ? <StackView s={p.scene} {...t} /> : p.scene.type === "row" ? <RowView s={p.scene} {...t} /> : <GridView s={p.scene} {...t} />}</div>;
}
/** Ukuran teks jawaban: sedikit lebih kecil di HP sempit. */
const txt = "text-base leading-snug min-[400px]:text-lg sm:text-xl";
const isShort = (p: Extract<Part, { kind: "choose" }>) => p.options.every(o => o.length <= 2);
function Choose({ p, x, put, set, disabled, i }: { p: Extract<Part, { kind: "choose" }>; x: string[]; put: (k: number, v: string) => void; set: (v: string) => void; disabled: boolean; i: number }) {
  const bits = p.text.split("□"), short = isShort(p);
  const chip = (on: boolean) => `rounded-xl border-2 font-bold ${on ? "border-success bg-success/20" : "border-base-300 bg-base-100"}`;
  if (short) {
    // Huruf: pilihan langsung di tempat kotak.
    const group = (k: number) => <span key={`g${k}`} role="radiogroup" aria-label={`Bagian ${i + 1} kotak ${k + 1}`} className="inline-flex gap-1 rounded-2xl border-[3px] border-orange-300 bg-white p-0.5">
      {p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={disabled} onClick={() => put(k, o)} className={`size-9 text-lg ${chip(x[k] === o)}`}>{o}</button>)}</span>;
    return <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-bold ${txt}`}>{bits.map((b, k) => <span key={k} className="contents">{b.trim() && <span>{b.trim()}</span>}{k < bits.length - 1 && group(k)}</span>)}</div>;
  }
  // Kata: kalimat dengan kotak terisi, pilihan di bawahnya.
  const btn = "min-h-9 px-1.5 text-sm text-left leading-tight min-[400px]:px-2.5 min-[400px]:text-base";
  const got = x.filter(Boolean);
  return <div className="space-y-1">
    <p className={`${txt} font-bold`}>{bits.map((b, k) => <span key={k}>{b}{k < bits.length - 1 && <span className={`mx-0.5 inline-block min-w-16 rounded-lg border-b-4 px-1.5 text-center ${x[k] ? "border-success bg-success/10" : "border-orange-400 bg-orange-50"}`}>{x[k] || "…"}</span>}</span>)}</p>
    {p.anyOrder ? <div role="group" aria-label={`Bagian ${i + 1} pilihan`} className="flex flex-wrap gap-1">{p.options.map(o => { const on = got.includes(o);
      return <button key={o} type="button" aria-pressed={on} disabled={disabled || (!on && got.length >= p.answers.length)} onClick={() => set((on ? got.filter(g => g !== o) : [...got, o]).join("|"))} className={`${btn} ${chip(on)} disabled:opacity-40`}>{o}</button>; })}</div>
      : p.answers.map((_, k) => <div key={k} role="radiogroup" aria-label={`Bagian ${i + 1} kotak ${k + 1}`} className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={disabled} onClick={() => put(k, o)} className={`${btn} ${chip(x[k] === o)}`}>{o}</button>)}</div>)}
  </div>;
}
function Order({ p, x, set, disabled, i }: { p: Extract<Part, { kind: "order" }>; x: string[]; set: (v: string) => void; disabled: boolean; i: number }) {
  const got = x.filter(Boolean);
  return <div className="space-y-1"><p className={`${txt} font-bold`} aria-live="polite">{p.text} {p.labels.map((_, k) => <span key={k}><span className={`inline-block min-w-8 rounded-lg border-b-4 px-1 text-center ${got[k] ? "border-success bg-success/10" : "border-orange-400 bg-orange-50"}`}>{got[k] ?? "…"}</span>{k < p.labels.length - 1 && ", "}</span>)}</p>
    <div role="group" aria-label={`Bagian ${i + 1} pilihan urutan`} className="flex flex-wrap items-center gap-1.5">{p.labels.map(l => { const n = got.indexOf(l);
      return <button key={l} type="button" aria-label={`Bagian ${i + 1} pilih ${l}`} disabled={disabled || n >= 0} onClick={() => set([...got, l].join("|"))}
        className="relative grid h-10 min-w-11 place-items-center rounded-xl border-2 border-orange-300 bg-white px-2 text-lg font-extrabold disabled:border-success disabled:bg-success/10">{l}{n >= 0 && <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-success text-xs text-white">{n + 1}</span>}</button>; })}
      <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={disabled || !got.length} onClick={() => set("")}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div></div>;
}
function Fill({ p, x, put, disabled, i }: { p: Extract<Part, { kind: "fill" }>; x: string[]; put: (k: number, v: string) => void; disabled: boolean; i: number }) {
  const bits = p.text.split("□");
  return <p className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 font-bold ${txt}`}>{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => { const [w, ...rest] = b.trim().split(" ");
    return <span key={k} className="contents"><span className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={disabled} />{w && <span>{w}</span>}</span>{rest.length > 0 && <span>{rest.join(" ")}</span>}</span>; })}</p>;
}
/** Benda dengan deretan alat ukur di bawahnya. */
function LayArt({ obj, len, color, unit, n }: { obj: HObj; len: number; color: Color; unit: Unit; n: number }) {
  const t = thick(obj, len), uh = unitRowH(unit), W = Math.max(len, n * unitLen[unit]) + 12, H = t + uh + 12;
  return <svg viewBox={`0 0 ${W} ${H}`} className={`${svgCls} max-w-lg`} style={{ maxHeight: "30vh" }} role="img" aria-label={`${objName[obj]} dan ${n} ${unitName[unit]}`}>
    <line x1={6} x2={6} y1={0} y2={H} stroke="#555" strokeWidth={0.6} strokeDasharray="2 2" /><line x1={6 + len} x2={6 + len} y1={0} y2={H} stroke="#555" strokeWidth={0.6} strokeDasharray="2 2" />
    <HArt obj={obj} x={6} y={2 + t / 2} len={len} color={color} />
    <UnitRow unit={unit} n={n} x={6} y={t + 6 + uh / 2} />
  </svg>;
}
function Lay({ p, value, set, checked }: { p: Extract<Part, { kind: "lay" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const n = Number(value || 0), max = layCount(p) + 4;
  return <div className="space-y-2"><div className="rounded-xl bg-base-200/60 p-2"><LayArt obj={p.obj} len={p.len} color={p.color} unit={p.unit} n={n} /></div>
    <div className="flex flex-wrap items-center gap-2"><button type="button" aria-label="Kurangi alat ukur" className="btn btn-circle btn-outline" disabled={checked || n <= 0} onClick={() => set(n - 1 ? String(n - 1) : "")}><Minus className="size-5" aria-hidden="true" /></button>
      <button type="button" aria-label="Tambah alat ukur" className="btn btn-success gap-1" disabled={checked || n >= max} onClick={() => set(String(n + 1))}><Plus className="size-5" aria-hidden="true" />Tambah</button>
      <p className="text-lg font-bold sm:text-xl" aria-live="polite">Panjang {objName[p.obj]} = {n} {unitName[p.unit]}</p></div></div>;
}
function Pick({ p, value, set, checked }: { p: Extract<Part, { kind: "pick" }>; value: string; set: (v: string) => void; checked: boolean }) {
  return <div className="grid grid-cols-2 gap-2">{p.ways.map((w, k) => <button key={k} type="button" aria-label={`Gambar ${k + 1}`} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))}
    className={`relative rounded-xl border-4 bg-white p-1.5 pt-6 ${value === String(k) ? "border-error" : "border-orange-200"}`}>
    <span className="absolute left-1.5 top-1 text-sm font-extrabold">{k + 1}</span><WayArt way={w} obj={p.obj} unit={p.unit} /></button>)}</div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "circle": return <CircleView p={p} value={value} set={set} checked={checked} />;
    case "choose": return <Choose p={p} x={x} put={put} set={set} disabled={checked} i={i} />;
    case "order": return <Order p={p} x={x} set={set} disabled={checked} i={i} />;
    case "fill": return <Fill p={p} x={x} put={put} disabled={checked} i={i} />;
    case "lay": return <Lay p={p} value={value} set={set} checked={checked} />;
    case "pick": return <Pick p={p} value={value} set={set} checked={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: LQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-2.5 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-2xl bg-success/10 p-3 text-base font-bold leading-7 sm:text-lg">{children}</output>;
function Stepper({ label, value, set, min, max, down = "kurangi", up = "tambah" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; down?: string; up?: string }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5 min-[420px]:flex-row min-[420px]:gap-1.5"><span className="text-center text-xs font-bold min-[420px]:text-sm">{label}</span><span className="flex gap-1">
    <button type="button" aria-label={`${label} ${down}`} className="btn btn-circle btn-sm btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
    <button type="button" aria-label={`${label} ${up}`} className="btn btn-circle btn-sm btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-4" aria-hidden="true" /></button></span></span>;
}
const Tabs = <T extends string>({ tabs, tab, set, label }: { tabs: readonly (readonly [T, string])[]; tab: T; set: (t: T) => void; label: string }) => <div role="tablist" aria-label={label} className="flex flex-wrap gap-1.5">{tabs.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => set(k)} className={`btn btn-sm ${tab === k ? "btn-success" : "btn-outline"}`}>{n}</button>)}</div>;
const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} dan ${xs.at(-1)}`);
/** Kalimat paling …/sama … untuk daftar nilai berlabel. */
function compare(names: string[], vals: number[], big: string, small: string, same: string) {
  const hi = Math.max(...vals), lo = Math.min(...vals);
  if (hi === lo) return `Semuanya ${same}.`;
  const top = names.filter((_, k) => vals[k] === hi), bot = names.filter((_, k) => vals[k] === lo);
  const pairs = [...new Set(vals)].filter(v => vals.filter(w => w === v).length > 1).map(v => join(names.filter((_, k) => vals[k] === v)));
  return `${join(top)} paling ${big}. ${join(bot)} paling ${small}.${pairs.length ? ` ${pairs.join("; ")} ${same}.` : ""}`;
}
const bandingTabs = [["panjang", "Panjang"], ["tinggi", "Tinggi"], ["terbang", "Terbang"]] as const;
const pencilColors: Color[] = ["biru", "merah", "hijau"];
function BandingLab() {
  const [tab, setTab] = useState<(typeof bandingTabs)[number][0]>("panjang");
  const [lens, setLens] = useState([11, 8, 6]), [even, setEven] = useState(false);
  const [hs, setHs] = useState([8, 6, 10, 8]), [ys, setYs] = useState([5, 3, 7]);
  const upd = (arr: number[], f: (a: number[]) => void, k: number) => (v: number) => f(arr.map((x, j) => (j === k ? v : x)));
  const shift = [0, 3, 1.5], maxLen = 12;
  const kupu: Color[] = ["merah", "kuning", "hijau"];
  return <div className="space-y-2.5"><Tabs tabs={bandingTabs} tab={tab} set={setTab} label="Yang dibandingkan" />
    {tab === "panjang" && <>
      <svg viewBox={`0 0 ${8 + Math.max(...shift) * 10 + maxLen * 12 + 4} 66`} className={`${svgCls} max-w-md`} style={{ maxHeight: "26vh" }} role="img" aria-label={`Pensil biru ${lens[0]}, merah ${lens[1]}, hijau ${lens[2]} kotak`}>
        <line x1={8} x2={8} y1={0} y2={66} stroke="#555" strokeWidth={0.7} strokeDasharray="3 2" />
        {lens.map((l, k) => <HArt key={k} obj="pensil" x={8 + (even ? 0 : shift[k] * 10)} y={10 + k * 22} len={l * 12} color={pencilColors[k]} />)}</svg>
      <div className="grid grid-cols-3 gap-1.5">{lens.map((l, k) => <Stepper key={k} label={`Pensil ${colorName[pencilColors[k]]}`} value={l} set={upd(lens, setLens, k)} min={4} max={maxLen} down="pendekkan" up="panjangkan" />)}</div>
      <button type="button" className="btn btn-success btn-sm gap-1" onClick={() => setEven(!even)}>{even ? <><RotateCcw className="size-4" aria-hidden="true" />Geser lagi</> : "Ratakan ujung kiri"}</button>
      <Result value={`panjang:${lens.join(":")}:${even ? 1 : 0}`}>{even ? compare(pencilColors.map(c => `Pensil ${colorName[c]}`), lens, "panjang", "pendek", "sama panjang") : "Ujung kiri pensil belum rata. Ratakan dulu supaya perbandingannya adil."}</Result></>}
    {tab === "tinggi" && <>
      <RowView s={{ type: "row", obj: "pohon", items: hs.map((h, k) => ({ h: h * 10, label: "ABCD"[k] })) }} />
      <div className="grid grid-cols-4 gap-1.5">{hs.map((h, k) => <Stepper key={k} label={`Pohon ${"ABCD"[k]}`} value={h} set={upd(hs, setHs, k)} min={4} max={11} down="pendekkan" up="tinggikan" />)}</div>
      <Result value={`tinggi:${hs.join(":")}`}>{compare([..."ABCD"].map(c => `Pohon ${c}`), hs, "tinggi", "pendek", "sama tinggi")} Urutan dari yang paling tinggi: {[..."ABCD"].map((c, k) => [c, hs[k]] as const).sort((a, b) => b[1] - a[1]).map(x => x[0]).join(", ")}.</Result></>}
    {tab === "terbang" && <>
      <SkyView s={{ type: "sky", flyer: "kupu", items: ys.map((y, k) => ({ y, color: kupu[k] })) }} />
      <div className="grid grid-cols-3 gap-1.5">{ys.map((y, k) => <Stepper key={k} label={`Kupu-kupu ${colorName[kupu[k]]}`} value={y} set={upd(ys, setYs, k)} min={1} max={9} down="turun" up="naik" />)}</div>
      <Result value={`terbang:${ys.join(":")}`}>{compare(kupu.map(c => `Kupu-kupu ${colorName[c]}`), ys, "tinggi", "rendah", "sama tinggi")} {[1, 2].map(k => `Kupu-kupu ${colorName[kupu[k]]} terbang ${ys[k] > ys[0] ? "lebih tinggi dari" : ys[k] < ys[0] ? "lebih rendah dari" : "sama tinggi dengan"} kupu-kupu merah.`).join(" ")}</Result></>}
  </div>;
}
const ukurTabs = [["ukur", "Ukur benda"], ["cara", "Cara mengukur"]] as const;
const things: Record<"buku" | "meja", { len: number; units: Unit[]; color: Color }> = { buku: { len: 96, units: ["penjepit", "koin", "stik"], color: "hijau" }, meja: { len: 240, units: ["stik", "sedotan", "jengkal"], color: "kuning" } };
const ways: Way[] = ["benar", "celah", "tumpuk", "geser", "miring"];
function UkurLab() {
  const [tab, setTab] = useState<(typeof ukurTabs)[number][0]>("ukur");
  const [obj, setObj] = useState<"buku" | "meja">("buku"), [unit, setUnit] = useState<Unit>("stik"), [n, setN] = useState(0);
  const [log, setLog] = useState<Record<string, number>>({}), [way, setWay] = useState<Way>("celah");
  const th = things[obj], need = th.len / unitLen[unit], done = n === need;
  const pickObj = (o: "buku" | "meja") => { setObj(o); setUnit(things[o].units[things[o].units.length - 1]); setN(0); };
  const add = (d: number) => { const m = n + d; setN(m); if (m === need) setLog(l => ({ ...l, [`${obj}:${unit}`]: m })); };
  const seen = th.units.filter(u => log[`${obj}:${u}`]);
  return <div className="space-y-2.5"><Tabs tabs={ukurTabs} tab={tab} set={setTab} label="Peraga mengukur" />
    {tab === "ukur" && <>
      <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-bold">Benda</span>{(["buku", "meja"] as const).map(o => <button key={o} type="button" aria-pressed={obj === o} onClick={() => pickObj(o)} className={`btn btn-sm ${obj === o ? "btn-success" : "btn-outline"}`}>{objName[o]}</button>)}</div>
      <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-bold">Alat ukur</span>{th.units.map(u => <button key={u} type="button" aria-pressed={unit === u} onClick={() => { setUnit(u); setN(0); }} className={`btn btn-sm ${unit === u ? "btn-success" : "btn-outline"}`}>{unitName[u]}</button>)}</div>
      {obj === "buku" ? <LayArt obj="buku" len={th.len} color={th.color} unit={unit} n={n} /> : <MejaLay unit={unit} n={n} />}
      <div className="flex flex-wrap items-center gap-2"><button type="button" aria-label="Kurangi alat ukur" className="btn btn-circle btn-sm btn-outline" disabled={n <= 0} onClick={() => add(-1)}><Minus className="size-4" aria-hidden="true" /></button>
        <button type="button" aria-label="Tambah alat ukur" className="btn btn-success btn-sm gap-1" disabled={n >= need + 2} onClick={() => add(1)}><Plus className="size-4" aria-hidden="true" />Tambah {unitName[unit]}</button></div>
      <Result value={`ukur:${obj}:${unit}:${n}`}>{done ? `Pas dari ujung ke ujung. Panjang ${objName[obj]} = ${n} ${unitName[unit]}.` : n < need ? `${n} ${unitName[unit]}. Belum sampai ujung ${objName[obj]}, tambah lagi.` : `${n} ${unitName[unit]} melewati ujung ${objName[obj]}. Kurangi satu.`}
        {seen.length > 1 && ` Hasil berbeda karena alat ukurnya berbeda: ${seen.map(u => `${log[`${obj}:${u}`]} ${unitName[u]}`).join(", ")}.`}</Result></>}
    {tab === "cara" && <>
      <div className="flex flex-wrap gap-1.5">{ways.map(w => <button key={w} type="button" aria-pressed={way === w} onClick={() => setWay(w)} className={`btn btn-sm ${way === w ? "btn-success" : "btn-outline"}`}>{wayName[w][0].toUpperCase() + wayName[w].slice(1)}</button>)}</div>
      <WayArt way={way} obj="meja" unit="sedotan" />
      <Result value={`cara:${way}`}>{way === "benar" ? "Benar. Mulai dari ujung meja, sedotan rapat, tidak bertumpuk, dan tidak miring. Panjang meja 4 sedotan." : `Belum benar: ${wayName[way]}. Sedotan harus mulai dari ujung meja, rapat, tidak bertumpuk, dan tidak miring.`}</Result></>}
  </div>;
}
function MejaLay({ unit, n }: { unit: Unit; n: number }) {
  const L = 240, hh = unit === "jengkal" ? 32 : 8, W = Math.max(L, n * unitLen[unit]) + 12;
  return <svg viewBox={`0 0 ${W} ${hh + 30}`} className={`${svgCls} max-w-lg`} style={{ maxHeight: "24vh" }} role="img" aria-label={`Meja dan ${n} ${unitName[unit]}`}>
    <rect x={6} y={2} width={L} height={hh + 10} rx={2} fill="#fbe3a2" stroke="#d9a548" strokeWidth={1} /><rect x={6} y={hh + 12} width={L} height={5} fill="#d9a548" />
    <rect x={22} y={hh + 17} width={8} height={11} fill="#d9a548" /><rect x={L - 18} y={hh + 17} width={8} height={11} fill="#d9a548" />
    <line x1={6 + L} x2={6 + L} y1={0} y2={hh + 30} stroke="#555" strokeWidth={0.6} strokeDasharray="2 2" />
    <UnitRow unit={unit} n={n} x={6} y={unit === "jengkal" ? hh + 10 : hh + 6} />
  </svg>;
}
const labs: Record<string, () => ReactNode> = { banding: BandingLab, ukur: UkurLab };

export default function GradeOneLengthV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Mengukur Panjang Benda</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Bandingkan dan urutkan panjang, tinggi, dan posisi benda, lalu ukur panjangnya dengan penjepit kertas, stik es krim, koin, atau jengkal.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <svg viewBox="0 0 110 40" className="h-20 w-auto" aria-hidden="true"><HArt obj="pensil" x={4} y={10} len={96} color="biru" /><UnitRow unit="penjepit" n={8} x={4} y={26} /></svg>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Mencuci Tangan</h2>
        <p className="mt-2">Kira, Upe, Malosi, dan Wei berbaris menunggu giliran mencuci tangan sebelum makan. Siapa yang paling tinggi? Bagaimana cara kita mengetahuinya?</p>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-panjang-benda">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-panjang-benda" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-lg leading-8">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            <p className="mt-3 rounded-lg bg-info/10 p-3"><strong>Coba bersama. </strong>{t.demo}</p>
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
      </> : <GradeFourQuiz<LQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 7"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderAnswer={(q, value, record, checked) => <div className={q.scene ? "space-y-2.5 sm:grid sm:grid-cols-2 sm:items-start sm:gap-3 sm:space-y-0" : ""}>
          {q.scene && <div className="flex min-w-0 justify-center rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.8]"><SceneView key={q.prompt} scene={q.scene} /></div>}
          <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} /></div>}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
