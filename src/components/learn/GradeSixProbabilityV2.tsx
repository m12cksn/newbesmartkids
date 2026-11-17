"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, Shuffle } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, BALL, CATS, catOf, cells, cmp, correct, formatAnswer, practice, ready, SEP, sides, splitParts, tally, topics,
  type Ball, type Cat, type Die, type Item, type Part, type PQuestion, type Scene, type Sector, type Visual,
} from "@/data/grade-six-probability-v2";

const ink = "#2b2320";
const SHORT = ["Tidak", "Kurang", "Mungkin", "Sangat", "Pasti"];

/* ====================================================================== */
/* Gambar benda                                                            */
/* ====================================================================== */
function BallArt({ c, size = 22 }: { c: Ball; size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true"><circle cx="10" cy="10" r="8.6" fill={BALL[c]} stroke={c === "putih" ? "#9b9488" : ink} strokeWidth="1" /><ellipse cx="7" cy="6.6" rx="2.6" ry="1.8" fill="#fff" opacity=".55" /></svg>;
}
/** Tas jinjing atau toples berisi bola. */
function Holder({ balls, label, jar = false, small = false, tiny = false }: { balls: [Ball, number][]; label?: string; jar?: boolean; small?: boolean; tiny?: boolean }) {
  const list = balls.flatMap(([c, n]) => Array.from({ length: n }, () => c)), n = list.length;
  const per = n > 12 || tiny ? 5 : 4, s = tiny ? 12 : small ? 16 : n > 12 ? 18 : 22, rows = Math.ceil(n / per);
  const W = per * s + 24, H = rows * s + (jar ? 30 : 34);
  return <figure className="flex flex-col items-center" aria-label={`${label ?? (jar ? "Toples" : "Tas")}: ${balls.filter(b => b[1]).map(([c, k]) => `${k} ${c}`).join(", ")}`} role="img">
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
      {jar ? <><rect x="6" y="2" width={W - 12} height="9" rx="3" fill="#e8c27a" stroke={ink} /><path d={`M4 11h${W - 8}v${H - 15}a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z`} fill="#eaf6fb" stroke={ink} strokeWidth="1.2" opacity=".95" /></>
        : <><path d={`M${W / 2 - 14} 16c0-14 28-14 28 0`} fill="none" stroke="#a07a4a" strokeWidth="3" /><path d={`M3 15h${W - 6}l-5 ${H - 17}H8z`} fill="#f6efe2" stroke="#a07a4a" strokeWidth="1.4" strokeLinejoin="round" /></>}
      {list.map((c, i) => { const r = Math.floor(i / per), k = i % per, off = (per - Math.min(per, n - r * per)) * s / 2;
        return <g key={i} transform={`translate(${12 + off + k * s} ${(jar ? 15 : 19) + r * s})`}><circle cx={s / 2} cy={s / 2} r={s / 2 - 1.2} fill={BALL[c]} stroke={c === "putih" ? "#9b9488" : ink} strokeWidth=".9" /><ellipse cx={s / 2 - 3} cy={s / 2 - 3} rx={s / 8} ry={s / 11} fill="#fff" opacity=".55" /></g>; })}
    </svg>
    {label && <figcaption className="text-sm font-bold">{label}</figcaption>}
  </figure>;
}
const PIPS: Record<number, [number, number][]> = { 1: [[.5, .5]], 2: [[.27, .27], [.73, .73]], 3: [[.27, .27], [.5, .5], [.73, .73]], 4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]], 5: [[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]], 6: [[.27, .24], [.73, .24], [.27, .5], [.73, .5], [.27, .76], [.73, .76]] };
/** Satu sisi dadu: kubus dengan mata dadu, oktahedron dan piramida dengan angka. */
function Face({ kind, v, size = 30 }: { kind: Die["kind"]; v: number | null; size?: number }) {
  if (kind === "kubus") return <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true"><rect x="1.5" y="1.5" width="27" height="27" rx="6" fill="#fff" stroke={ink} strokeWidth="1.3" />{v && PIPS[v]?.map(([a, b], i) => <circle key={i} cx={a * 30} cy={b * 30} r="2.7" fill={ink} />)}{v === null && <text x="15" y="20" textAnchor="middle" fontSize="13" fill="#9aa">?</text>}</svg>;
  const shape = kind === "piramida" ? "M15 2L28.5 27H1.5Z" : "M15 1.5L28.5 15L15 28.5L1.5 15Z";
  return <svg viewBox="0 0 30 30" width={size} height={size} aria-hidden="true"><path d={shape} fill={kind === "piramida" ? "#ffe9a8" : "#bfe7dd"} stroke={ink} strokeWidth="1.3" strokeLinejoin="round" /><text x="15" y={kind === "piramida" ? 23 : 19.5} textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{v ?? "?"}</text></svg>;
}
const kindName = { kubus: "Dadu kubus", oktahedron: "Dadu 8 sisi", piramida: "Dadu piramida" };
function DieArt({ die, size = 30 }: { die: Die; size?: number }) {
  return <figure className="flex flex-col items-center gap-1" role="img" aria-label={`${kindName[die.kind]} dengan sisi ${die.faces.join(", ")}`}>
    <div className={`grid gap-1 ${die.faces.length > 6 ? "grid-cols-4" : die.faces.length > 4 ? "grid-cols-3" : "grid-cols-4"}`}>{die.faces.map((v, i) => <Face key={i} kind={die.kind} v={v} size={size} />)}</div>
    <figcaption className="text-xs font-bold">{die.label ?? kindName[die.kind]}</figcaption>
  </figure>;
}
function Coin() {
  return <div className="flex items-center gap-4" role="img" aria-label="Koin Rp500: sisi angka dan sisi garuda">
    {[0, 1].map(side => <figure key={side} className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 60 60" width="66" height="66" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="#d9dcdf" stroke="#7c8288" strokeWidth="2" /><circle cx="30" cy="30" r="22" fill="none" stroke="#9aa1a7" strokeWidth="1" />
        {side === 0 ? <text x="30" y="37" textAnchor="middle" fontSize="18" fontWeight="800" fill="#4d5359">500</text>
          : <g fill="#5f666c"><path d="M30 18c-3 0-4 3-3 5l-9-4 2 6-6-1 6 6-3 2 10 1-2 9h10l-2-9 10-1-3-2 6-6-6 1 2-6-9 4c1-2 0-5-3-5z" /><circle cx="30" cy="20.5" r="1.1" fill="#d9dcdf" /></g>}
      </svg><figcaption className="text-xs font-bold">{side === 0 ? "sisi angka" : "sisi garuda"}</figcaption></figure>)}
  </div>;
}
function Spinner({ sectors, size = 150, onPaint, label }: { sectors: Sector[]; size?: number; onPaint?: (k: number) => void; label?: string }) {
  const n = sectors.length, r = 46, c = 50;
  const pt = (a: number, rr = r) => [c + rr * Math.sin(a), c - rr * Math.cos(a)];
  return <figure className="flex flex-col items-center gap-1">
    <svg viewBox="0 0 100 100" width={size} height={size} role={onPaint ? "group" : "img"} aria-label={label ?? `Roda putar ${n} bagian: ${Object.entries(tally(sectors.map(s => s.label ?? s.color))).map(([k, v]) => `${k} ${v}`).join(", ")}`}>
      {sectors.map((s, k) => { const a0 = (k / n) * 2 * Math.PI, a1 = ((k + 1) / n) * 2 * Math.PI, [x0, y0] = pt(a0), [x1, y1] = pt(a1), [tx, ty] = pt((a0 + a1) / 2, r * 0.66);
        const d = n === 1 ? `M${c} ${c - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}` : `M${c} ${c}L${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z`;
        return <g key={k}><path d={d} fill={s.color ? BALL[s.color] : "#f4f4f4"} stroke={ink} strokeWidth=".9" {...(onPaint ? { role: "button", tabIndex: 0, "aria-label": `Bagian ${k + 1}`, onClick: () => onPaint(k), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPaint(k); } }, className: "cursor-pointer outline-none focus-visible:stroke-[3]" } : {})} />
          {s.label && <text x={tx} y={ty} fontSize="6.2" fontWeight="700" textAnchor="middle" dominantBaseline="middle" fill={s.color === "kuning" || s.color === "putih" ? ink : "#fff"} pointerEvents="none">{s.label}</text>}</g>; })}
      {!onPaint && <><path d="M50 50L50 16" stroke={ink} strokeWidth="2.6" strokeLinecap="round" /><path d="M50 12l-4 7h8z" fill={ink} /></>}
      <circle cx="50" cy="50" r="4" fill="#fff" stroke={ink} strokeWidth="1.2" pointerEvents="none" />
    </svg>
  </figure>;
}
function ItemArt({ item, size = 34 }: { item: Item; size?: number }) {
  switch (item) {
    case "kotak pensil": return <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true"><rect x="3" y="9" width="28" height="16" rx="5" fill="#3a86d4" stroke={ink} /><path d="M6 12h22" stroke="#d6e6f7" strokeWidth="1.6" strokeDasharray="2 1.4" /><rect x="22" y="10.5" width="4" height="4" rx="1" fill="#e4e4e4" stroke={ink} strokeWidth=".7" /></svg>;
    case "buku bacaan": return <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true"><path d="M6 5h20a2 2 0 0 1 2 2v22H8a2 2 0 0 1-2-2z" fill="#e5484d" stroke={ink} /><path d="M6 27a2 2 0 0 1 2-2h20" fill="none" stroke={ink} /><rect x="10" y="9" width="13" height="5" rx="1" fill="#fff" /></svg>;
    case "pensil": return <svg viewBox="0 0 34 34" width={size} height={size} aria-hidden="true"><g transform="rotate(-40 17 17)"><rect x="5" y="14" width="18" height="6" fill="#f5c518" stroke={ink} strokeWidth=".9" /><path d="M23 14l7 3-7 3z" fill="#f1d6a8" stroke={ink} strokeWidth=".9" /><path d="M28.4 16.3L30 17l-1.6.7z" fill={ink} /><rect x="2.5" y="14" width="3" height="6" fill="#c0c0c0" stroke={ink} strokeWidth=".9" /><rect x="0" y="14" width="3" height="6" rx="1.4" fill="#f08aa0" stroke={ink} strokeWidth=".9" /></g></svg>;
    default: return <BallArt c="biru" size={size * 0.7} />;
  }
}
function Candy({ c, size = 40 }: { c: Ball; size?: number }) {
  return <svg viewBox="0 0 40 22" width={size} height={size * 0.55} aria-hidden="true"><path d="M2 4l9 7-9 7zM38 4l-9 7 9 7z" fill={BALL[c]} stroke={ink} strokeWidth=".9" strokeLinejoin="round" /><ellipse cx="20" cy="11" rx="10" ry="7.5" fill={BALL[c]} stroke={ink} strokeWidth=".9" /><path d="M14 8c3-3 9-3 12 0" stroke="#fff" strokeWidth="1.3" fill="none" opacity=".6" /></svg>;
}
/** Kaus tergantung pada hanger. */
function Shirt({ c, size = 46 }: { c: Ball; size?: number }) {
  return <svg viewBox="0 0 46 48" width={size} height={size * 1.04} aria-hidden="true">
    <path d="M23 9c0-3 2-4 3-4.5s1-3-1-3.2-3 1-3 2.2" fill="none" stroke="#7a7f85" strokeWidth="1.6" strokeLinecap="round" /><path d="M23 9L9 15h28z" fill="none" stroke="#7a7f85" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M17 13l-11 5 4 9 5-2v20h16V25l5 2 4-9-11-5c-1 3-3 4-6 4s-5-1-6-4z" fill={BALL[c]} stroke={ink} strokeWidth="1" strokeLinejoin="round" />
  </svg>;
}
function Shelf({ books }: { books: [Ball, number][] }) {
  const list = books.flatMap(([c, n]) => Array.from({ length: n }, () => c));
  return <div role="img" aria-label={`Rak buku: ${books.map(([c, n]) => `${n} buku ${c}`).join(", ")}`} className="inline-flex flex-col items-stretch">
    <div className="flex items-end gap-0.5 rounded-t-md border-x-8 border-t-8 border-[#8a5a2b] bg-[#5b3a1c] px-2 pt-2">{list.map((c, i) => <span key={i} style={{ background: BALL[c], height: 52 + (i % 3) * 6 }} className="w-4 rounded-sm border border-neutral" />)}</div>
    <div className="h-2.5 rounded-b-md bg-[#8a5a2b]" />
  </div>;
}

/* ====================================================================== */
/* Skala peluang                                                           */
/* ====================================================================== */
function ScaleBar({ marks }: { marks: { label: string; color?: Ball; cat: Cat }[] }) {
  return <div className="w-full max-w-md" role="img" aria-label={`Skala peluang: ${marks.map(m => `${m.label} ${CATS[m.cat].toLowerCase()}`).join(", ")}`}>
    <div className="grid grid-cols-5 items-end gap-0.5 text-center">{CATS.map((_, k) => <div key={k} className="flex min-h-8 flex-col-reverse items-center gap-0.5">{marks.filter(m => m.cat === k).map(m => <span key={m.label} className="flex items-center gap-0.5 rounded bg-base-100 px-1 text-[10px] font-bold leading-tight ring-1 ring-base-300">{m.color && <BallArt c={m.color} size={12} />}{m.color ? "" : m.label}</span>)}</div>)}</div>
    <div className="relative mx-[10%] my-1 h-1 rounded bg-[#1f4e8c]">{[0, 25, 50, 75, 100].map(x => <span key={x} style={{ left: `${x}%` }} className="absolute -top-1.5 h-4 w-0.5 -translate-x-1/2 bg-[#1f4e8c]" />)}</div>
    <div className="grid grid-cols-5 gap-0.5 text-center text-[10px] font-bold leading-tight sm:text-xs">{CATS.map((c, k) => <span key={c} className={["text-rose-700", "text-amber-700", "text-emerald-700", "text-sky-700", "text-indigo-700"][k]}>{c}</span>)}</div>
  </div>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, icon, show }: { label: string; value: number; set: (n: number) => void; min: number; max: number; icon?: ReactNode; show?: string }) {
  return <span role="group" aria-label={label} className="flex items-center gap-1 rounded-lg bg-base-100 px-1.5 py-1 ring-1 ring-base-300">{icon}<span className="text-xs font-bold">{show ?? label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-5 text-center text-lg font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-3.5" aria-hidden="true" /></button></span>;
}
const isJar = (label?: string) => !!label && /Kotak|^[PQR]$/.test(label);

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const labBalls: Ball[] = ["merah", "biru", "kuning"];
function BagLab() {
  const [k, setK] = useState<number[]>([5, 3, 2]);
  const n = k.reduce((a, b) => a + b, 0), cats = k.map(x => catOf(x, n));
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-center gap-1.5">{labBalls.map((c, i) => <Stepper key={c} label={c[0].toUpperCase() + c.slice(1)} icon={<BallArt c={c} size={16} />} value={k[i]} min={0} max={8} set={v => setK(k.map((x, j) => (j === i ? v : x)))} />)}</div>
    <div className="flex flex-wrap items-center justify-center gap-3 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]"><Holder balls={labBalls.map((c, i) => [c, k[i]])} /><ScaleBar marks={labBalls.map((c, i) => ({ label: c, color: c, cat: cats[i] }))} /></div>
    <Result value={cats.join("-")}>{n === 0 ? "Tas kosong. Tambahkan bola dulu." : labBalls.map((c, i) => `${c[0].toUpperCase() + c.slice(1)} ${k[i]} dari ${n}: ${CATS[cats[i]].toLowerCase()}`).join(". ")}.</Result>
  </div>;
}
function DieLab() {
  const [f, setF] = useState([2, 2, 3, 3, 3, 4]), [t, setT] = useState("3");
  const k = f.filter(x => String(x) === t).length, cat = catOf(k, 6);
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-center gap-1.5 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.2]">{f.map((v, i) => <button key={i} type="button" aria-label={`Sisi ${i + 1}, angka ${v}`} onClick={() => setF(f.map((x, j) => (j === i ? (x % 6) + 1 : x)))} className="rounded-lg p-0.5 ring-1 ring-base-300 hover:ring-success"><Face kind="kubus" v={v} size={42} /></button>)}</div>
    <div role="radiogroup" aria-label="Angka" className="flex flex-wrap items-center justify-center gap-1"><span className="text-xs font-bold">Lihat angka:</span>{["1", "2", "3", "4", "5", "6"].map(x => <button key={x} type="button" role="radio" aria-checked={t === x} onClick={() => setT(x)} className={`btn btn-xs sm:btn-sm ${t === x ? "btn-success" : "btn-outline"}`}>{x}</button>)}</div>
    <div className="flex justify-center"><ScaleBar marks={[{ label: `Angka ${t}`, cat }]} /></div>
    <Result value={`${t}:${k}:${cat}`}>Angka {t} ada di <strong>{k} dari 6</strong> sisi, jadi {CATS[cat].toLowerCase()}. Ketuk sisi dadu untuk mengganti angkanya.</Result>
  </div>;
}
type Tool = "Koin" | "Dadu";
function GameLab() {
  const [tool, setTool] = useState<Tool[]>(["Koin", "Dadu"]), [wins, setWins] = useState<number[][]>([[6], [6]]), [runs, setRuns] = useState<number[] | null>(null);
  const frac = (i: number): [number, number] => (tool[i] === "Koin" ? [1, 2] : [wins[i].length, 6]);
  const a = frac(0), b = frac(1), v = cmp(a[0], a[1], b[0], b[1]), verdict = v === 0 ? 0 : v > 0 ? 1 : 2;
  const roll = () => setRuns([0, 1].map(i => Array.from({ length: 12 }, () => (tool[i] === "Koin" ? Math.random() < 0.5 : wins[i].includes(1 + Math.floor(Math.random() * 6)))).filter(Boolean).length));
  return <div className="space-y-2.5">
    <div className="grid gap-2 sm:grid-cols-2">{[0, 1].map(i => <div key={i} className="space-y-1.5 rounded-xl bg-base-100 p-2 ring-1 ring-base-300">
      <div role="radiogroup" aria-label={`Alat pemain ${i + 1}`} className="flex flex-wrap items-center gap-1"><span className="text-sm font-extrabold">Pemain {i + 1}:</span>{(["Koin", "Dadu"] as Tool[]).map(o => <button key={o} type="button" role="radio" aria-checked={tool[i] === o} onClick={() => { setTool(tool.map((x, j) => (j === i ? o : x))); setRuns(null); }} className={`btn btn-xs ${tool[i] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>
      {tool[i] === "Koin" ? <p className="text-sm">Menang jika sisi <strong>garuda</strong>.</p> : <div className="flex flex-wrap items-center gap-1"><span className="text-xs font-bold">Menang jika:</span>{[1, 2, 3, 4, 5, 6].map(x => <button key={x} type="button" aria-label={`Pemain ${i + 1} angka ${x}`} aria-pressed={wins[i].includes(x)} onClick={() => { const w = wins[i].includes(x) ? wins[i].filter(y => y !== x) : [...wins[i], x]; if (w.length) { setWins(wins.map((y, j) => (j === i ? w : y))); setRuns(null); } }} className={`rounded-md p-0.5 ${wins[i].includes(x) ? "bg-success/20 ring-2 ring-success" : "ring-1 ring-base-300"}`}><Face kind="kubus" v={x} size={26} /></button>)}</div>}
      <p className="text-lg font-extrabold">Peluang {frac(i)[0]} dari {frac(i)[1]}{runs && <span className="ms-2 text-sm font-semibold text-base-content/70">menang {runs[i]} dari 12 lemparan</span>}</p>
    </div>)}</div>
    <div className="flex justify-center"><button type="button" className="btn btn-sm btn-outline gap-1" onClick={roll}><Shuffle className="size-4" aria-hidden="true" />Lempar 12 kali</button></div>
    <Result value={`${a.join("/")}|${b.join("/")}|${verdict}`}>{verdict === 0 ? <>Peluang kedua pemain sama, jadi permainan ini <strong>adil</strong>.</> : <>Pemain {verdict} punya peluang lebih besar, jadi permainan ini <strong>kurang adil</strong>.</>} Hasil lemparan bisa berbeda-beda, tetapi makin sering dilempar, makin dekat dengan peluangnya.</Result>
  </div>;
}
function BoxLab() {
  const [k, setK] = useState([[4, 3], [3, 4]]);
  const f = k.map(([b, w]) => [b, b + w]), empty = f.some(x => x[1] === 0), v = cmp(f[0][0], f[0][1], f[1][0], f[1][1]), best = empty ? "-" : v === 0 ? "=" : v > 0 ? "A" : "B";
  const set = (i: number, j: number) => (x: number) => setK(k.map((r, a) => (a === i ? r.map((y, b) => (b === j ? x : y)) : r)));
  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">{["A", "B"].map((name, i) => <div key={name} className="flex flex-col items-center gap-1.5 rounded-xl bg-base-100 p-2 ring-1 ring-base-300">
      <div className="[@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.1]"><Holder jar balls={[["biru", k[i][0]], ["putih", k[i][1]]]} label={`Kotak ${name}`} small /></div>
      <Stepper label={`Kotak ${name} biru`} show="Biru" icon={<BallArt c="biru" size={14} />} value={k[i][0]} set={set(i, 0)} min={0} max={9} />
      <Stepper label={`Kotak ${name} putih`} show="Putih" icon={<BallArt c="putih" size={14} />} value={k[i][1]} set={set(i, 1)} min={0} max={9} />
      <p className="text-lg font-extrabold">{f[i][0]} dari {f[i][1]}</p>
    </div>)}</div>
    <Result value={best}>{empty ? <>Ada kotak yang kosong. Tambahkan paling sedikit satu bola agar peluangnya bisa dibandingkan.</> : <>Bola biru berhadiah piring. Bandingkan {f[0][0]}/{f[0][1]} dan {f[1][0]}/{f[1][1]} dengan perkalian silang: {f[0][0]} × {f[1][1]} = {f[0][0] * f[1][1]} dan {f[1][0]} × {f[0][1]} = {f[1][0] * f[0][1]}. {best === "=" ? "Peluangnya sama besar." : <>Pilih <strong>Kotak {best}</strong>, walaupun belum pasti mendapat piring.</>}</>}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { bag: BagLab, die: DieLab, game: GameLab, boxes: BoxLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "bags": return <div className="flex flex-wrap items-end justify-center gap-3">{scene.bags.map((b, i) => <Holder key={i} balls={b.balls} label={b.label} jar={isJar(b.label)} small={scene.bags.length > 2} />)}</div>;
    case "dice": return <div className="flex flex-wrap justify-center gap-4">{scene.dice.map((d, i) => <DieArt key={i} die={d} size={34} />)}</div>;
    case "spinners": return <div className="flex flex-wrap justify-center gap-4">{scene.spinners.map((s, i) => <div key={i} className="flex flex-col items-center"><Spinner sectors={s.sectors} size={140} />{s.label && <span className="text-sm font-bold">{s.label}</span>}</div>)}</div>;
    case "boxes": return <div className="flex flex-wrap justify-center gap-3">{scene.boxes.map(b => <figure key={b.label} className="flex flex-col items-center gap-1" role="img" aria-label={`${b.label}: ${b.items.map(([it, n]) => `${n} ${it}`).join(", ")}`}>
      <div className="grid max-w-44 grid-cols-6 gap-0.5 rounded-lg border-4 border-[#a06a3a] bg-[#f3dfb8] p-1.5">{b.items.flatMap(([it, n]) => Array.from({ length: n }, (_, k) => <ItemArt key={`${it}${k}`} item={it} size={24} />))}</div>
      <figcaption className="text-sm font-bold">{b.label}</figcaption></figure>)}
      <p className="w-full text-center text-xs font-semibold">{(["kotak pensil", "buku bacaan", "pensil"] as Item[]).map(it => <span key={it} className="me-2 inline-flex items-center gap-0.5"><ItemArt item={it} size={18} />{it}</span>)}</p></div>;
    case "candies": return <div className="flex max-w-xs flex-wrap justify-center gap-1" role="img" aria-label={`Permen: ${scene.candies.map(([c, n]) => `${n} ${c}`).join(", ")}`}>{scene.candies.flatMap(([c, n]) => Array.from({ length: n }, (_, k) => <Candy key={`${c}${k}`} c={c} />))}</div>;
    case "coin": return <Coin />;
    case "table": return <table className="overflow-hidden rounded-xl border-2 border-sky-300 bg-white text-center text-sm"><caption className="pb-1 text-sm font-bold">{scene.title}</caption><thead className="bg-sky-100"><tr>{scene.head.map(h => <th key={h} className="px-2 py-0.5">{h}</th>)}</tr></thead><tbody><tr>{scene.row.map((v, i) => <td key={i} className="border-t border-sky-200 px-2 py-0.5 text-lg font-extrabold">{v}</td>)}</tr></tbody></table>;
    case "players": return <div className="grid w-full max-w-lg grid-cols-2 gap-1.5 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">{scene.players.map(p => <div key={p.name} className="rounded-xl bg-base-100 p-2 text-center ring-1 ring-base-300"><p className="text-sm font-extrabold">{p.name}</p><div className="flex justify-center gap-1 py-1">{p.tool === "koin" ? <svg viewBox="0 0 30 30" width="28" height="28" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="#d9dcdf" stroke="#7c8288" strokeWidth="1.5" /><text x="15" y="19" textAnchor="middle" fontSize="9" fontWeight="800" fill="#4d5359">500</text></svg> : Array.from({ length: p.tool === "2 dadu" ? 2 : 1 }, (_, i) => <Face key={i} kind="kubus" v={i ? 2 : 5} size={26} />)}</div><p className="text-xs">menang jika <strong>{p.win}</strong></p></div>)}</div>;
    case "scale": return <ScaleBar marks={scene.marks} />;
    case "shirts": return <div className="flex flex-col items-center gap-1"><div className="flex gap-1 border-t-4 border-[#7a7f85] pt-0.5">{scene.colors.map(c => <Shirt key={c} c={c} />)}</div><p className="text-sm font-bold">Lemari berisi {scene.total} kaus</p></div>;
    case "books": return <Shelf books={scene.books} />;
    case "spinbag": return <div className="flex flex-wrap items-end justify-center gap-5"><div className="flex flex-col items-center"><Spinner sectors={scene.sectors} size={120} /><span className="text-sm font-bold">Roda putar</span></div><Holder balls={scene.bag} label="Kantong" small /></div>;
  }
}
function VisualArt({ v }: { v: Visual }) {
  if ("bag" in v) return <Holder balls={v.bag} tiny />;
  if ("die" in v) return <DieArt die={v.die} size={26} />;
  return <Spinner sectors={v.spinner} size={90} />;
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
    className="h-10 w-14 rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:h-11 sm:text-2xl" />;
}
function SpinPart({ p, x, put, checked }: { p: Extract<Part, { kind: "spin" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean }) {
  const [brush, setBrush] = useState<Ball>(p.colors[0]);
  return <div className="flex flex-wrap items-center gap-3">
    <Spinner sectors={x.map(c => ({ color: (c || undefined) as Ball }))} size={150} onPaint={k => !checked && put(k, brush)} label="Roda putar untuk diwarnai" />
    <div className="space-y-1.5"><div role="radiogroup" aria-label="Warna roda" className="flex gap-1.5">{p.colors.map(c => <button key={c} type="button" role="radio" aria-checked={brush === c} aria-label={c} disabled={checked} onClick={() => setBrush(c)} style={{ background: BALL[c] }} className={`size-9 rounded-full border-2 ${brush === c ? "border-neutral ring-2 ring-neutral ring-offset-2" : "border-white"}`} />)}</div>
      <p className="text-sm font-semibold">{p.colors.map(c => `${c} ${x.filter(y => y === c).length}`).join(", ")} dari {p.n}</p></div>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      const lead = (k: number) => (k > 0 ? (bits[k].match(/^[,.)]+/)?.[0] ?? "") : ""), body = (k: number) => bits[k].slice(lead(k).length).trim();
      return <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-lg font-bold leading-10 sm:text-xl [@media(max-height:700px)]:gap-y-1 [@media(max-height:700px)]:leading-8">{bits.map((_, k) => <span key={k} className="contents">{body(k) && <span>{body(k)}</span>}{k < bits.length - 1 && <span className="inline-flex items-end"><Box label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{lead(k + 1)}</span>}</span>)}</p>; }
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold [@media(max-height:700px)]:text-base">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-10 rounded-2xl border-4 px-3 text-base font-bold sm:text-lg ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "pick": return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
      <div className={`grid gap-2 ${p.options.length === 4 ? "grid-cols-2 sm:grid-cols-4" : p.options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>{p.options.map((o, k) => <button key={k} type="button" aria-label={`Gambar ${"ABCD"[k]}`} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))}
        className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl border-4 bg-base-100 p-1 ${value === String(k) ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start text-sm font-extrabold leading-none">{"ABCD"[k]}</span><VisualArt v={o} /></button>)}</div></div>;
    case "scale": return <div className="space-y-1.5">
      <div className="grid grid-cols-[minmax(5.5rem,1fr)_repeat(5,minmax(0,3.6rem))] items-center gap-1 text-center text-[11px] font-bold leading-tight sm:text-xs"><span />{CATS.map((c, k) => <span key={c} className={["text-rose-700", "text-amber-700", "text-emerald-700", "text-sky-700", "text-indigo-700"][k]}>{c}</span>)}</div>
      {p.items.map((it, k) => <div key={it.label} role="radiogroup" aria-label={it.label} className="grid grid-cols-[minmax(5.5rem,1fr)_repeat(5,minmax(0,3.6rem))] items-center gap-1">
        <span className="flex items-center gap-1 text-sm font-bold leading-tight sm:text-base">{it.color && <BallArt c={it.color} size={18} />}{it.label}</span>
        {CATS.map((c, j) => <button key={c} type="button" role="radio" aria-checked={x[k] === String(j)} aria-label={c} disabled={checked} onClick={() => put(k, String(j))}
          className={`h-9 rounded-lg border-2 text-[11px] font-bold sm:text-xs ${x[k] === String(j) ? "border-error bg-error/10" : "border-base-300 bg-base-100"}`}>{x[k] === String(j) ? SHORT[j] : ""}</button>)}
      </div>)}
      <div className="mx-auto h-1 max-w-full rounded bg-[#1f4e8c]" aria-hidden="true" />
    </div>;
    case "die": { const n = sides[p.dieKind], counts = tally(x);
      return <div className="space-y-1.5"><div className="flex flex-wrap gap-1.5">{x.map((v, k) => <button key={k} type="button" disabled={checked} aria-label={`Sisi ${k + 1}${v ? `, angka ${v}` : ""}`} onClick={() => put(k, String(p.values[(p.values.indexOf(Number(v)) + 1) % p.values.length]))} className="rounded-lg p-0.5 ring-1 ring-base-300 hover:ring-success"><Face kind={p.dieKind} v={v ? Number(v) : null} size={40} /></button>)}</div>
        <p className="text-sm font-semibold">Ketuk sisi untuk mengganti angka. {p.values.map(v => `Angka ${v}: ${counts[v] ?? 0} dari ${n}`).join(", ")}.</p></div>; }
    case "bag": { const k = x.map(v => Number(v) || 0), sum = k.reduce((a, b) => a + b, 0);
      return <div className="space-y-1.5"><div className="flex flex-wrap gap-1.5">{p.colors.map((c, j) => <Stepper key={c} label={c[0].toUpperCase() + c.slice(1)} icon={p.noun === "kaus" ? <Shirt c={c} size={20} /> : <BallArt c={c} size={16} />} value={k[j]} min={0} max={p.total} set={v => !checked && put(j, String(v))} />)}</div>
        <p className={`text-sm font-bold ${sum === p.total ? "text-success" : ""}`}>Jumlah {sum} dari {p.total} {p.noun}</p></div>; }
    case "spin": return <SpinPart p={p} x={x} put={put} checked={checked} />;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.78]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeSixProbabilityV2() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); show(); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Peluang</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Letakkan kejadian pada skala peluang, tebak isi tas atau dadu dari skalanya, lalu bandingkan peluang untuk menilai permainan yang adil dan memilih yang paling menguntungkan.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-3"><Spinner sectors={[{ color: "merah" }, { color: "biru" }, { color: "kuning" }, { color: "hijau" }, { color: "merah" }, { color: "biru" }]} size={84} /><Face kind="kubus" v={5} size={44} /><Holder balls={[["merah", 2], ["biru", 1], ["kuning", 1]]} small /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Lomba menyanyi Dhien</h2>
        <p className="mt-2 text-sm">Dhien ragu ikut lomba karena pesertanya banyak. Seberapa mungkin ia menang? Di kategori mana peluangnya lebih besar? Peluang membantu kita menjawabnya.</p>
        <p className="mt-2 text-sm text-base-content/60">4 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-peluang">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-peluang" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.short}`} className="mb-3 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0 && sec === 0} onClick={prev}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => open("practice")}>Latihan {t.code}</button>
            {!last ? <button type="button" className="btn btn-outline gap-1" onClick={next}>{sec < t.sections.length - 1 ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => open("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.65]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
