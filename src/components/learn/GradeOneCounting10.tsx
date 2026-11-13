"use client";

import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Eraser, Minus, Plus, RotateCcw, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Basket, Hand, Hands, Leaf, Objects, Segment, Stairs, starPoints, TenFrame, ThingIcon } from "./GradeOneCounting10Art";
import {
  assessment, cells, correct, formatAnswer, itemText, numberWords, practice, ready, SEP, splitParts, syllables, thingName, topics,
  type Group, type Item, type KQuestion, type Part, type Scene, type Thing,
} from "@/data/grade-one-counting-10";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1.5 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-sm btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
    <span className="min-w-8 text-center text-xl font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-sm btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-4" aria-hidden="true" /></button>
  </span>;
}
function Box({ value, onChange, label, disabled = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className="h-12 w-14 rounded-xl border-2 border-orange-400 bg-white text-center text-2xl font-extrabold text-neutral focus:border-success focus:outline-none" />;
}
const Ring = ({ children, big }: { children: ReactNode; big?: boolean }) => <span className={`grid place-items-center rounded-full border-2 bg-white font-extrabold ${big ? "size-16 border-purple-400 text-2xl" : "size-14 border-orange-400 text-xl"}`}>{children}</span>;
function BondFig({ whole, a, b }: { whole: ReactNode; a: ReactNode; b: ReactNode }) {
  return <div className="relative inline-grid grid-cols-[4rem_2.5rem_3.5rem] items-center" role="group" aria-label="Pasangan bilangan">
    <Ring big>{whole}</Ring>
    <svg viewBox="0 0 40 120" className="h-28 w-10" aria-hidden="true"><path d="M0 60L40 22M0 60l40 38" stroke="#9b6bc4" strokeWidth="2.5" /></svg>
    <div className="flex flex-col gap-4"><Ring>{a}</Ring><Ring>{b}</Ring></div>
  </div>;
}
function GroupBox({ g, children }: { g: Group; children?: ReactNode }) {
  return <div className="flex flex-col items-center gap-1"><div className="grid min-h-24 min-w-28 place-items-center rounded-2xl border-2 border-orange-300 bg-base-100 p-2"><Objects g={g} /></div>{children ?? (g.label && <span className="rounded-lg border-2 border-orange-300 bg-base-100 px-3 text-lg font-extrabold">{g.label}</span>)}</div>;
}
function Pairs({ left, right }: { left: Group; right: Group }) {
  const rows = Math.max(left.n, right.n);
  return <div className="grid w-full max-w-xs grid-cols-[3rem_1fr_3rem] items-center gap-y-1" role="img" aria-label={`${left.n} ${thingName[left.thing]} dipasangkan dengan ${right.n} ${thingName[right.thing]}`}>
    {Array.from({ length: rows }, (_, i) => <div key={i} className="contents">
      <span className="grid h-10 place-items-center">{i < left.n && <ThingIcon thing={left.thing} className="size-10" />}</span>
      <span className="h-0.5 rounded bg-purple-400" style={{ opacity: i < left.n && i < right.n ? 1 : 0 }} />
      <span className="grid h-10 place-items-center">{i < right.n && <ThingIcon thing={right.thing} className="size-10" />}</span>
    </div>)}
  </div>;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const frameThings: Thing[] = ["layang", "kursi", "balon"];
function FrameLab() {
  const [n, setN] = useState(3);
  const [thing, setThing] = useState<Thing>("layang");
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Benda" className="flex flex-wrap gap-1.5">{frameThings.map(t => <button key={t} type="button" role="radio" aria-checked={thing === t} onClick={() => setThing(t)} className={`btn btn-sm gap-1 ${thing === t ? "btn-success" : "btn-outline"}`}><ThingIcon thing={t} className="size-5" />{thingName[t]}</button>)}</div>
    <Stepper label="Banyak benda" value={n} set={setN} min={0} max={10} />
    <div className="grid items-center gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[1fr_auto_auto]">
      <div className="grid min-h-20 place-items-center">{n ? <Objects g={{ thing, n }} /> : <Basket />}</div>
      <TenFrame n={n} />
      <div className="text-center"><p className="text-5xl font-extrabold text-success">{n}</p><p className="text-lg font-bold">{syllables[n]}</p></div>
    </div>
    <Result value={String(n)}>Ada <strong>{n}</strong> {thingName[thing]}. Lambang bilangannya {n}, dibaca <strong>{numberWords[n]}</strong>.{n === 0 && " Tidak ada benda sama sekali, jadi nol."}{n === 10 && " Bingkai 10 penuh."}</Result>
  </div>;
}
function HandsLab() {
  const [l, setL] = useState([false, false, false, false, false]);
  const [r, setR] = useState([false, true, true, false, false]);
  const [ways, setWays] = useState<string[]>([]);
  const cl = l.filter(Boolean).length, cr = r.filter(Boolean).length, tot = cl + cr;
  const flip = (side: "l" | "r") => (f: number) => (side === "l" ? setL : setR)(x => x.map((v, i) => (i === f ? !v : v)));
  const key = `${Math.min(cl, cr)} dan ${Math.max(cl, cr)}`;
  return <div className="space-y-3">
    <p className="text-sm">Ketuk jari untuk mengangkat atau menurunkannya.</p>
    <div className="flex justify-center gap-4 rounded-xl bg-base-100 p-3"><Hand up={l} flip onToggle={flip("l")} size={120} /><Hand up={r} onToggle={flip("r")} size={120} /></div>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-sm btn-outline" onClick={() => { setL([false, false, false, false, false]); setR([false, false, false, false, false]); }}>Kepalkan tangan</button>
      <button type="button" className="btn btn-sm btn-success" disabled={tot !== 7 || ways.includes(key)} onClick={() => setWays(w => [...w, key])}>Simpan cara untuk 7</button>
    </div>
    <Result value={`${tot}|${ways.length}`}>Jari terangkat: {cl} dan {cr}, jadi <strong>{tot}</strong> ({numberWords[tot]}).{tot === 0 && " Tangan mengepal menunjukkan nol."} {ways.length > 0 && `Cara menunjukkan 7 yang sudah kamu temukan: ${ways.join("; ")}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function PairLab() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(4);
  const verdict = a === b ? "sama" : a > b ? "lebih" : "kurang";
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Sepeda" value={a} set={setA} min={1} max={7} /><Stepper label="Burung" value={b} set={setB} min={1} max={7} /></div>
    <div className="flex justify-center rounded-xl bg-base-100 p-3"><Pairs left={{ thing: "sepeda", n: a }} right={{ thing: "burung", n: b }} /></div>
    <Result value={verdict}>{a} sepeda dan {b} burung. {verdict === "sama" ? <>Semua punya pasangan: jumlah sepeda <strong>sama banyak</strong> dengan jumlah burung.</> : verdict === "lebih" ? <>Ada {a - b} sepeda tanpa pasangan: jumlah sepeda <strong>lebih banyak</strong> dari jumlah burung.</> : <>Ada {b - a} burung tanpa pasangan: jumlah sepeda <strong>lebih sedikit</strong> dari jumlah burung.</>}</Result>
  </div>;
}
const rounds: [Group, Group][] = [[{ thing: "apel", n: 3 }, { thing: "jeruk", n: 4 }], [{ thing: "kelereng", n: 7 }, { thing: "bola", n: 5 }], [{ thing: "donat", n: 6 }, { thing: "bolu", n: 8 }], [{ thing: "kubus", n: 9 }, { thing: "buku", n: 7 }]];
function CompareLab() {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [a, b] = rounds[k], more = a.n > b.n ? 0 : 1;
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Ronde {k + 1} dari {rounds.length}. Ketuk kotak yang bendanya lebih banyak.</p>
    <div className="flex flex-wrap justify-center gap-3">{[a, b].map((g, i) => <button key={i} type="button" aria-label={`Kotak ${i ? "B" : "A"}`} aria-pressed={pick === i} onClick={() => setPick(i)}
      className={`rounded-2xl p-1 ${pick === i ? (i === more ? "ring-4 ring-success" : "ring-4 ring-error") : ""}`}><GroupBox g={{ ...g, label: i ? "B" : "A" }} /></button>)}</div>
    <div className="flex gap-2"><button type="button" className="btn btn-sm btn-outline gap-1" disabled={pick === null} onClick={() => { setK((k + 1) % rounds.length); setPick(null); }}>Ronde berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button></div>
    <Result value={pick === null ? `${k}|` : `${k}|${pick === more ? "ok" : "no"}`}>{pick === null ? `A: ${a.n} ${thingName[a.thing]}, B: ${b.n} ${thingName[b.thing]}. Hitung dulu, lalu bandingkan.` : pick === more ? `Tepat. ${Math.max(a.n, b.n)} lebih banyak dari ${Math.min(a.n, b.n)}.` : `Belum. Hitung lagi: A ada ${a.n}, B ada ${b.n}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function StairsLab({ down }: { down?: boolean }) {
  const [at, setAt] = useState(down ? 10 : 1);
  const said = down ? Array.from({ length: 11 - at }, (_, i) => 10 - i) : Array.from({ length: at }, (_, i) => i + 1);
  return <div className="space-y-3">
    <div className="rounded-xl bg-base-100 p-2"><Stairs at={at} label={`Tangga balok, Upe di anak tangga ${at}`} /></div>
    <div className="flex flex-wrap gap-2">
      {down ? <button type="button" className="btn btn-success gap-1" disabled={at <= 1} onClick={() => setAt(at - 1)}><ArrowDown className="size-4" aria-hidden="true" />Turun satu</button>
        : <button type="button" className="btn btn-success gap-1" disabled={at >= 10} onClick={() => setAt(at + 1)}><ArrowUp className="size-4" aria-hidden="true" />Naik satu</button>}
      <button type="button" className="btn btn-ghost gap-1" onClick={() => setAt(down ? 10 : 1)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={String(at)}>Upe di anak tangga <strong>{at}</strong>. Yang sudah disebut: {said.join(", ")}.{(down ? at === 1 : at === 10) && (down ? " Selesai menghitung mundur dari 10 sampai 1." : " Selesai menghitung maju dari 1 sampai 10.")}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D                                                                */
/* ====================================================================== */
function SplitLab() {
  const [whole, setWhole] = useState(7);
  const [right, setRight] = useState<number[]>([4, 5, 6]);
  const r = right.filter(i => i < whole), a = whole - r.length;
  const plate = (side: "kiri" | "kanan", idx: number[]) => <div className="grid min-h-28 min-w-36 place-content-center rounded-full border-4 border-yellow-300 bg-yellow-50 p-3">
    <div className="grid max-w-36 grid-cols-4 gap-1">{idx.map(i => <button key={i} type="button" aria-label={`Pindahkan kelereng ${i + 1} dari piring ${side}`} onClick={() => setRight(x => (x.includes(i) ? x.filter(y => y !== i) : [...x, i]))}><ThingIcon thing="kelereng" alt={side === "kanan"} className="size-8" /></button>)}</div>
  </div>;
  return <div className="space-y-3">
    <Stepper label="Banyak kelereng" value={whole} set={w => { setWhole(w); setRight(x => x.filter(i => i < w)); }} min={2} max={10} />
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-base-100 p-3">{plate("kiri", Array.from({ length: whole }, (_, i) => i).filter(i => !r.includes(i)))}{plate("kanan", r)}
      <BondFig whole={whole} a={a} b={r.length} /></div>
    <Result value={`${a}|${r.length}`}>{whole} → <strong>{a}</strong> dan <strong>{r.length}</strong>. Jika digabung lagi, {a} dan {r.length} menjadi {whole}.</Result>
  </div>;
}
function WaysLab() {
  const [whole, setWhole] = useState(8);
  const [cut, setCut] = useState(3);
  const [found, setFound] = useState<string[]>([]);
  const all = Math.floor(whole / 2), key = `${Math.min(cut, whole - cut)} dan ${Math.max(cut, whole - cut)}`;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Bilangan" value={whole} set={w => { setWhole(w); setCut(1); setFound([]); }} min={2} max={10} /><Stepper label="Pemisah" value={cut} set={setCut} min={1} max={whole - 1} /></div>
    <div className="flex flex-wrap items-end justify-center gap-1 rounded-xl bg-base-100 p-3" role="img" aria-label={`${whole} kubus dipisah menjadi ${cut} dan ${whole - cut}`}>
      {Array.from({ length: whole }, (_, i) => <span key={i} className={i === cut ? "ms-4" : ""}><ThingIcon thing="kubus" className="size-8" /></span>)}
    </div>
    <div className="flex flex-wrap items-center gap-3"><BondFig whole={whole} a={cut} b={whole - cut} />
      <button type="button" className="btn btn-sm btn-success" disabled={found.includes(key)} onClick={() => setFound(f => [...f, key])}>Catat pasangan ini</button></div>
    <Result value={`${found.length}/${all}`}>Pasangan {whole} yang sudah dicatat: {found.length ? found.join("; ") : "belum ada"}. {found.length === all ? `Lengkap! ${whole} punya ${all} pasangan berbeda.` : `Masih ada ${all - found.length} pasangan lagi.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { frame: FrameLab, hands: HandsLab, pair: PairLab, compare: CompareLab, up: () => <StairsLab />, down: () => <StairsLab down />, split: SplitLab, ways: WaysLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "objs": return <Objects g={scene.g} size="size-10" />;
    case "groups": return <div className="flex flex-wrap justify-center gap-4">{scene.groups.map((g, i) => <GroupBox key={i} g={g} />)}</div>;
    case "frames": return <div className="flex flex-wrap justify-center gap-6">{scene.ns.map((n, i) => <div key={i} className="flex flex-col items-center gap-1"><TenFrame n={n} size={26} label={`Bingkai ${i ? "kanan" : "kiri"}`} /><span className="text-sm font-semibold">{i ? "Kanan" : "Kiri"}</span></div>)}</div>;
    case "hands": return <div className="flex flex-wrap justify-center gap-6">{scene.sets.map((f, i) => <div key={i} className="flex flex-col items-center gap-1"><Hands fingers={f} size={84} />{scene.sets.length > 1 && <span className="text-sm font-semibold">Gambar {String.fromCharCode(97 + i)}</span>}</div>)}</div>;
    case "shelf": return <div className="w-full max-w-md rounded-xl border-4 border-amber-700 bg-amber-100 p-2" role="img" aria-label="Rak mainan di toko">{scene.items.map((g, i) => <div key={i} className="flex flex-wrap gap-1 border-b-4 border-amber-700 px-1 pb-1 pt-2 last:border-b-0">{Array.from({ length: g.n }, (_, k) => <ThingIcon key={k} thing={g.thing} className="size-9" />)}</div>)}</div>;
    case "pairs": return <Pairs left={scene.left} right={scene.right} />;
    case "story": return <div className="flex flex-wrap justify-center gap-6">{scene.people.map(p => <div key={p.name} className="flex flex-col items-center gap-1"><span className="flex max-w-40 flex-wrap justify-center gap-0.5">{Array.from({ length: p.n }, (_, k) => <ThingIcon key={k} thing={p.thing} className="size-8" />)}</span><span className="font-bold">{p.name}</span></div>)}</div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function ItemView({ it }: { it: Item }) {
  if (it.t === "objs") return <Objects g={it.g} size="size-8" label={itemText(it)} />;
  if (it.t === "frame") return <TenFrame n={it.n} size={14} />;
  if (it.t === "hand") return <Hands fingers={it.fingers} size={48} />;
  return <span className="text-2xl font-extrabold">{it.t === "num" ? it.n : it.w}</span>;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = cells(p, value);
  const n = p.left.length, m = p.right.length, H = 1000, rowH = p.left.some(l => l.t === "objs") ? 80 : 52;
  return <div className="space-y-2">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk gambar di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)]" style={{ minHeight: Math.max(n, m) * rowH }}>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${itemText(l)}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`grid place-items-center rounded-xl border-2 p-1 ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}><ItemView it={l} /></button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${itemText(r)}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="grid place-items-center rounded-xl border-2 border-purple-300 bg-purple-50 p-1"><ItemView it={r} /></button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
const paint = { merah: "#e23d3d", biru: "#2f86d6", kuning: "#f2c230" };
function ColorPart({ p, value, set, checked }: { p: Extract<Part, { kind: "color" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const on = value ? value.split(",").map(Number) : [];
  return <div className="space-y-1" role="group" aria-label={p.label}>
    <p className="font-bold">{p.label}</p>
    <div className="flex flex-wrap gap-1.5">{Array.from({ length: p.total }, (_, i) => <button key={i} type="button" disabled={checked} aria-pressed={on.includes(i)} aria-label={`Bola ${i + 1}`}
      onClick={() => set((on.includes(i) ? on.filter(x => x !== i) : [...on, i]).sort((a, b) => a - b).join(","))} className="rounded-full">
      <svg viewBox="0 0 24 24" className="size-11" aria-hidden="true"><circle cx="12" cy="12" r="10" fill={on.includes(i) ? paint[p.color] : "#fff"} stroke="#2b2320" strokeWidth="1.2" /><path d="M5 8c4 2 10 2 14 0M12 2c-2 6-2 14 0 20" stroke="#2b2320" strokeWidth=".8" fill="none" opacity={on.includes(i) ? 0.35 : 1} /></svg>
    </button>)}</div>
    <p className="text-xs text-base-content/60">Diwarnai {on.length} bola. Ketuk lagi untuk menghapus warna.</p>
  </div>;
}
function DotsPart({ p, value, set, checked }: { p: Extract<Part, { kind: "dots" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const seq = value ? value.split(",").map(Number) : [];
  const pts = starPoints.slice(0, p.n);
  return <div className="space-y-1">
    <svg viewBox="0 0 160 150" className="w-full max-w-xs" role="group" aria-label="Titik bernomor 1 sampai 10">
      {seq.slice(1).map((v, i) => { const a = pts[seq[i] - 1], b = pts[v - 1]; return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#9b3fc4" strokeWidth="2.5" strokeLinecap="round" />; })}
      {seq.length === p.n && <line x1={pts[seq[p.n - 1] - 1][0]} y1={pts[seq[p.n - 1] - 1][1]} x2={pts[seq[0] - 1][0]} y2={pts[seq[0] - 1][1]} stroke="#9b3fc4" strokeWidth="2.5" strokeDasharray="3 3" />}
      {pts.map(([x, y], i) => { const lx = x + (x - 80) * 0.18, ly = y + (y - 74) * 0.18 + 3, on = seq.includes(i + 1);
        return <g key={i}><circle cx={x} cy={y} r="4" fill={on ? "#9b3fc4" : "#2b2320"} /><text x={lx} y={ly} fontSize="9" fontWeight="800" textAnchor="middle" fill="#2b2320">{i + 1}</text>
          {!checked && <circle cx={x} cy={y} r="11" fill="transparent" className="cursor-pointer" role="button" tabIndex={0} aria-label={`Titik ${i + 1}`} onClick={() => !on && set([...seq, i + 1].join(","))} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !on) { e.preventDefault(); set([...seq, i + 1].join(",")); } }} />}</g>; })}
    </svg>
    <div className="flex gap-2"><button type="button" className="btn btn-xs btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(","))}><Undo2 className="size-3.5" aria-hidden="true" />Batal satu</button>
      <span className="text-xs text-base-content/60">Ketuk titik 1, 2, 3, … sampai 10.</span></div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <label className="flex flex-wrap items-center gap-2 text-lg font-bold">{p.label.includes("…") ? <>{p.label.split("…")[0]}<Box label={p.label} value={value} onChange={set} disabled={checked} />{p.label.split("…")[1]}</> : <>{p.label}<Box label={p.label} value={value} onChange={set} disabled={checked} /></>}{p.thing && <ThingIcon thing={p.thing} className="size-9" />}</label>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-11 min-w-14 rounded-2xl border-4 px-4 text-lg font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "color": return <ColorPart p={p} value={value} set={set} checked={checked} />;
    case "pick": return <div className="space-y-1"><p className="font-bold">{p.label}</p>
      <div className="flex flex-wrap justify-center gap-3">{p.groups.map((g, k) => <button key={k} type="button" disabled={checked} aria-label={g.label} aria-pressed={value === String(k)} onClick={() => set(String(k))}
        className={`rounded-[2rem] p-1.5 ${value === String(k) ? (p.mark === "lingkari" ? "ring-4 ring-error" : "bg-warning/40 ring-2 ring-warning") : ""}`}><GroupBox g={g}><span className="text-sm font-semibold">{g.label}</span></GroupBox></button>)}</div></div>;
    case "seq": { let k = 0;
      return <div className={`flex flex-wrap items-center ${p.shape === "ulat" ? "gap-0" : "gap-1"}`} role="group" aria-label={`Urutan ${i + 1}`}>
        {p.shape === "ulat" && p.cells[0]! > p.cells[p.cells.length - 1]! ? null : p.shape === "ulat" && <Segment head>{""}</Segment>}
        {p.cells.map((c, j) => { const idx = c === null ? k++ : -1; const inner = c === null ? <Box label={`Urutan ${i + 1} kotak ${idx + 1}`} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} /> : c;
          return p.shape === "ulat" ? <Segment key={j} empty={c === null}>{inner}</Segment> : <Leaf key={j} empty={c === null}>{inner}</Leaf>; })}
        {p.shape === "ulat" && p.cells[0]! > p.cells[p.cells.length - 1]! && <Segment head>{""}</Segment>}
      </div>; }
    case "bond": { let k = 0; const f = [p.whole, p.parts[0], p.parts[1]].map((v, j) => { if (!p.hide[j]) return v; const idx = k++; return <Box key={j} label={["Bilangan utuh", "Bagian pertama", "Bagian kedua"][j]} value={x[idx]} onChange={val => put(idx, val)} disabled={checked} />; });
      return <BondFig whole={f[0]} a={f[1]} b={f[2]} />; }
    case "bonds": return <div className="flex flex-wrap gap-4">{Array.from({ length: p.k }, (_, j) => <BondFig key={j} whole={p.whole}
      a={<Box label={`Pasangan ${j + 1} bagian pertama`} value={x[2 * j]} onChange={v => put(2 * j, v)} disabled={checked} />} b={<Box label={`Pasangan ${j + 1} bagian kedua`} value={x[2 * j + 1]} onChange={v => put(2 * j + 1, v)} disabled={checked} />} />)}</div>;
    case "chain": { const b = (k: number, name: string) => <Box label={`Kotak ${name}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />;
      return <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2"><BondFig whole={p.whole} a={p.given[0]} b={b(0, "A")} /></div>
        <div className="flex flex-wrap items-center gap-2 ps-6"><span className="text-sm font-semibold">Kotak A dipisah lagi:</span><BondFig whole={x[0] || "A"} a={b(1, "B")} b={p.given[1]} /></div>
        <div className="flex flex-wrap items-center gap-2 ps-12"><span className="text-sm font-semibold">Kotak B dipisah lagi:</span><BondFig whole={x[1] || "B"} a={b(2, "C")} b={p.given[2]} /></div>
      </div>; }
    case "dots": return <DotsPart p={p} value={value} set={set} checked={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: KQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-5">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeOneCounting10() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 1, Bab 1</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Ayo Membilang sampai dengan 10</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Hitung benda di taman, baca dan tulis bilangan 0 sampai 10, bandingkan banyak benda, hitung maju dan mundur, lalu temukan pasangan bilangan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-3"><Objects g={{ thing: "layang", n: 7 }} size="size-6" /><TenFrame n={7} size={16} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Di taman bermain</h2>
        <p className="mt-2 text-sm">Malosi dan teman-teman bermain di taman. Ada jungkat-jungkit, ayunan, perosotan, sepeda, dan kursi. Ayo kita kelompokkan dan hitung banyaknya.</p>
        <p className="mt-2 text-sm text-base-content/60">8 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-membilang">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-membilang" className="mt-8 scroll-mt-20">
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
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
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
      </> : <GradeFourQuiz<KQuestion> key={`${mode}-${topic}`}
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
