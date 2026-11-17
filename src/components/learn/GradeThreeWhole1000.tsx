"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus, RotateCcw, Shuffle, Undo2, Repeat2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Blocks, Card, Flat, Groups, placeColor, Plate, Rod, SignView, ThingIcon, Unit } from "./GradeThreeWhole1000Art";
import {
  assessment, cells, correct, digits, formatAnswer, practice, reading, ready, SEP, splitParts, thingName, topics,
  type KQuestion, type Part, type Scene, type Thing,
} from "@/data/grade-three-whole-1000";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
function VStepper({ label, value, set, min, max, color }: { label: string; value: number; set: (n: number) => void; min: number; max: number; color?: string }) {
  return <span role="group" aria-label={label} className="flex flex-col items-center gap-0.5"><span className="text-sm font-bold" style={color ? { color } : undefined}>{label}</span>
    <span className="flex items-center gap-1"><button type="button" aria-label={`${label} kurangi`} className="btn btn-sm btn-square btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-4" aria-hidden="true" /></button>
      <span className="min-w-7 text-center text-xl font-extrabold tabular-nums">{value}</span>
      <button type="button" aria-label={`${label} tambah`} className="btn btn-sm btn-square btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-4" aria-hidden="true" /></button></span>
  </span>;
}
/** Satu baris pengatur bilangan dua angka: −10, −1, +1, +10. */
function NumStepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  const b = (d: number) => <button type="button" aria-label={`${label} ${d > 0 ? "tambah" : "kurangi"} ${Math.abs(d)}`} className="btn btn-sm min-w-10 px-1.5 btn-outline" disabled={value + d < min || value + d > max} onClick={() => set(value + d)}>{d > 0 ? `+${d}` : `−${-d}`}</button>;
  return <span role="group" aria-label={label} className="flex items-center gap-1"><span className="w-20 text-sm font-bold">{label}</span>{b(-10)}{b(-1)}<span className="min-w-9 text-center text-2xl font-extrabold tabular-nums">{value}</span>{b(1)}{b(10)}</span>;
}
function Box({ value, onChange, label, disabled = false, wide = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; wide?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-11 ${wide ? "w-20" : "w-16"} rounded-xl border-2 border-orange-400 bg-white text-center text-2xl font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const placeNames = ["Ratusan", "Puluhan", "Satuan"] as const;
const placeColors = [placeColor.h, placeColor.t, placeColor.u];
/** Tabel nilai tempat. `cell(i)` mengisi kolom ke-i. */
function PvTable({ cell, mark, small }: { cell: (i: number) => ReactNode; mark?: number; small?: boolean }) {
  return <div className="inline-grid grid-cols-3 overflow-hidden rounded-xl border-2 border-lime-300 bg-lime-50 text-center">
    {placeNames.map(p => <span key={p} className="border-b-2 border-lime-300 px-2 py-0.5 text-sm font-bold" style={{ color: placeColors[placeNames.indexOf(p)] }}>{p}</span>)}
    {placeNames.map((p, i) => <span key={p} className={`grid place-items-center px-2 font-extrabold ${small ? "min-h-10 text-2xl" : "min-h-14 text-3xl"} ${mark === i ? "rounded-full ring-4 ring-error ring-inset" : ""}`}>{cell(i)}</span>)}
  </div>;
}
/** Baris puluhan dan satuan untuk penjumlahan dan pengurangan. */
function TensRow({ n, crossT = 0, crossU = 0, borrowed = false, label }: { n: number; crossT?: number; crossU?: number; borrowed?: boolean; label: string }) {
  const t = Math.floor(n / 10) - (borrowed ? 1 : 0), u = (n % 10) + (borrowed ? 10 : 0);
  return <div className="contents">
    <span className="grid place-items-center border-t border-violet-200 px-1 text-xl font-extrabold">{label}</span>
    <span className="flex flex-col items-center justify-center gap-px border-s border-t border-violet-200 p-1">{Array.from({ length: t }, (_, i) => <Rod key={i} size={11} crossed={i >= t - crossT} />)}</span>
    <span className="grid grid-cols-5 place-content-center gap-0.5 border-s border-t border-violet-200 p-1">{Array.from({ length: u }, (_, i) => <Unit key={i} size={15} crossed={i >= u - crossU} />)}</span>
  </div>;
}
function TensTable({ children }: { children: ReactNode }) {
  return <div className="grid w-full max-w-md grid-cols-[3.75rem_1fr_1fr] overflow-hidden rounded-xl border-2 border-violet-300 bg-white">
    <span className="bg-violet-200 py-0.5 text-center text-xs font-bold">Bilangan</span><span className="bg-violet-200 py-0.5 text-center text-xs font-bold" style={{ color: placeColor.t }}>Puluhan</span><span className="bg-violet-200 py-0.5 text-center text-xs font-bold" style={{ color: placeColor.u }}>Satuan</span>
    {children}
  </div>;
}
/** Susun pendek. `out` berisi angka hasil (atau kotak isian), `carry` angka kecil di atas. */
function Column({ a, b, op, out, carry }: { a: number; b: number; op: "+" | "−"; out: ReactNode[]; carry?: ReactNode[] }) {
  const w = Math.max(String(a).length, String(b).length, out.length);
  const pad = (n: number) => String(n).padStart(w, " ").split("");
  const heads = placeNames.slice(3 - w);
  return <div className="inline-grid gap-x-1 text-center font-mono text-2xl font-extrabold sm:text-3xl" style={{ gridTemplateColumns: `repeat(${w}, 3.25rem) 1.5rem` }} role="group" aria-label={`${a} ${op} ${b} cara susun pendek`}>
    {heads.map((h, i) => <span key={h} className="font-sans text-xs font-bold" style={{ color: placeColors[3 - w + i] }}>{h}</span>)}<span />
    {carry ? <>{Array.from({ length: w }, (_, i) => <span key={i} className="h-5 text-base leading-5 text-error">{carry[i]}</span>)}<span /></> : null}
    {pad(a).map((c, i) => <span key={i}>{c.trim()}</span>)}<span />
    {pad(b).map((c, i) => <span key={i}>{c.trim()}</span>)}<span className="text-2xl">{op}</span>
    <span className="col-span-full h-0.5 bg-neutral" />
    {Array.from({ length: w - out.length }, (_, i) => <span key={`p${i}`} />)}{out.map((c, i) => <span key={i} className="grid place-items-center">{c}</span>)}<span />
  </div>;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function BlocksLab() {
  const [h, setH] = useState(1), [t, setT] = useState(1), [u, setU] = useState(5);
  const n = 100 * h + 10 * t + u, over = t > 9 || u > 9, room = 1000 - n, thousand = h === 10;
  const shown = thousand ? [0, 0, 0] : [h, t, u];
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2">
      <VStepper label="Ratusan" color={placeColor.h} value={h} set={setH} min={0} max={Math.max(h, Math.min(9, h + Math.floor(room / 100)))} />
      <VStepper label="Puluhan" color={placeColor.t} value={t} set={setT} min={0} max={Math.max(t, Math.min(12, t + Math.floor(room / 10)))} />
      <VStepper label="Satuan" color={placeColor.u} value={u} set={setU} min={0} max={Math.max(u, Math.min(12, u + room))} />
    </div>
    <div className="grid min-h-32 place-items-center rounded-xl bg-base-100 p-2 sm:min-h-40 sm:p-3 [@media(max-height:700px)]:min-h-0 [@media(max-height:700px)]:[zoom:0.75] lg:[zoom:1.4]"><Blocks h={h} t={t} u={u} scale={1} /></div>
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" className="btn btn-sm btn-success" disabled={u < 10} onClick={() => { setU(u - 10); setT(t + 1); }}>Tukar 10 satuan jadi 1 puluhan</button>
      <button type="button" className="btn btn-sm btn-success" disabled={t < 10} onClick={() => { setT(t - 10); setH(h + 1); }}>Tukar 10 puluhan jadi 1 ratusan</button>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      {thousand ? <div className="inline-grid grid-cols-4 overflow-hidden rounded-xl border-2 border-lime-300 bg-lime-50 text-center">
        {["Ribuan", ...placeNames].map((p, i) => <span key={p} className="border-b-2 border-lime-300 px-1.5 py-0.5 text-xs font-bold" style={{ color: ["#b45309", ...placeColors][i] }}>{p}</span>)}
        {[1, 0, 0, 0].map((d, i) => <span key={i} className="grid min-h-12 place-items-center text-3xl font-extrabold">{d}</span>)}
      </div> : <PvTable cell={i => shown[i] > 9 ? <span className="text-error">{shown[i]}</span> : shown[i]} />}
      <span className="text-4xl font-extrabold text-success sm:text-5xl">{over ? "?" : n.toLocaleString("id-ID")}</span></div>
    <Result value={over ? "tukar" : String(n)}>{over ? <>Ada lebih dari 9 di satu tempat. Tukar dulu 10 menjadi 1 di tempat sebelah kirinya.</> : thousand ? <>10 ratusan = 1 ribuan: <strong>1.000</strong>, dibaca <strong>seribu</strong>.</> : <><strong>{n}</strong> dibaca <strong>{reading(n).toLowerCase()}</strong>.</>}</Result>
  </div>;
}
function CardsLab() {
  const [picked, setPicked] = useState<number[]>([]);
  const n = picked.length === 3 ? picked[0] * 100 + picked[1] * 10 + picked[2] : null;
  return <div className="space-y-3">
    <p className="text-sm">Ketuk tiga kartu. Kartu pertama menjadi ratusan, lalu puluhan, lalu satuan.</p>
    <div className="grid grid-cols-5 justify-items-center gap-2 rounded-xl bg-base-100 p-3 sm:max-w-md [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]">{Array.from({ length: 10 }, (_, d) => <Card key={d} d={d} on={picked.includes(d)} onClick={picked.length < 3 && !(d === 0 && picked.length === 0) ? () => setPicked([...picked, d]) : undefined} />)}</div>
    <div className="flex flex-wrap items-center gap-3">
      <PvTable cell={i => (picked[i] !== undefined ? <Card d={picked[i]} size="sm" /> : <span className="text-base-content/30">…</span>)} />
      <div className="flex gap-2"><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!picked.length} onClick={() => setPicked(picked.slice(0, -1))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button>
        <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!picked.length} onClick={() => setPicked([])}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    </div>
    <Result value={n === null ? "" : String(n)}>{n === null ? (picked.length === 0 ? "Kartu 0 tidak bisa menjadi kartu pertama, sebab bilangannya menjadi dua angka." : `Sudah ${picked.length} kartu. Ambil ${3 - picked.length} lagi.`) : <>Bilanganmu <strong className="text-2xl">{n}</strong>, dibaca <strong>{reading(n).toLowerCase()}</strong>.{picked[1] === 0 && " Puluhannya 0, jadi tidak ada kata puluh."}</>}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function Can({ i, d, set }: { i: number; d: number; set: (n: number) => void }) {
  const fill = ["#c8ead0", "#cfe0f7", "#f9d3d3"][i], c = placeColors[i];
  return <div className="flex flex-col items-center gap-1">
    <button type="button" aria-label={`${placeNames[i]} tambah`} className="btn btn-xs btn-outline btn-square" disabled={d >= 9} onClick={() => set(d + 1)}><Plus className="size-3.5" aria-hidden="true" /></button>
    <svg viewBox="0 0 80 100" className="h-24 w-20 sm:h-28 sm:w-24" role="img" aria-label={`Kaleng ${placeNames[i]} berisi kartu ${d}`}>
      <path d="M6 14v74c0 5 15 9 34 9s34-4 34-9V14" fill={fill} stroke={c} strokeWidth="2.5" />
      <ellipse cx="40" cy="14" rx="34" ry="9" fill="#fff" stroke={c} strokeWidth="2.5" />
      <text x="40" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill={c}>{placeNames[i]}</text>
      <text x="40" y="82" textAnchor="middle" fontSize="34" fontWeight="800" fill="#2b2320">{d}</text>
    </svg>
    <button type="button" aria-label={`${placeNames[i]} kurangi`} className="btn btn-xs btn-outline btn-square" disabled={d <= (i === 0 ? 1 : 0)} onClick={() => set(d - 1)}><Minus className="size-3.5" aria-hidden="true" /></button>
  </div>;
}
function CansLab() {
  const [d, setD] = useState([2, 5, 1]);
  const n = d[0] * 100 + d[1] * 10 + d[2], vals = [d[0] * 100, d[1] * 10, d[2]];
  return <div className="space-y-3">
    <div className="flex justify-center gap-2 rounded-xl bg-base-100 p-3 sm:gap-5 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.25]">{d.map((x, i) => <Can key={i} i={i} d={x} set={v => setD(d.map((y, j) => (j === i ? v : y)))} />)}</div>
    <div className="space-y-1 rounded-xl bg-base-100 p-3 text-lg font-bold sm:text-xl">
      <p>{d.map((x, i) => <span key={i}><span style={{ color: placeColors[i] }}>{x} {placeNames[i].toLowerCase()}</span>{i < 2 ? " + " : ""}</span>)} = {n}</p>
      <p>{vals.map((v, i) => <span key={i}><span style={{ color: placeColors[i] }}>{v}</span>{i < 2 ? " + " : ""}</span>)} = {n}</p>
    </div>
    <Result value={String(n)}>Pada <strong>{n}</strong>: angka {d[0]} bernilai {vals[0]}, angka {d[1]} bernilai {vals[1]}, angka {d[2]} bernilai {vals[2]}. Dari kiri ke kanan disebut menyusun; dari {n} ke {vals.join(" + ")} disebut mengurai.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
const pairs: [number, number][] = [[339, 421], [583, 529], [769, 761], [804, 804], [915, 951], [470, 407]];
const sign = (a: number, b: number) => (a < b ? "<" : a > b ? ">" : "=");
function CompareLab() {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [a, b] = pairs[k], da = digits(a), db = digits(b), at = da.findIndex((x, i) => x !== db[i]), ok = pick === sign(a, b);
  const row = (n: number, d: readonly number[]) => <div className="contents"><span className="grid place-items-center border-t border-lime-300 px-2 text-2xl font-extrabold">{n}</span>
    {d.map((x, i) => <span key={i} className={`grid min-h-12 place-items-center border-s border-t border-lime-300 text-3xl font-extrabold ${pick && i === at ? "bg-error/10 text-error" : ""}`}>{x}</span>)}</div>;
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Pasangan {k + 1} dari {pairs.length}. Pilih tanda yang tepat.</p>
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-base-100 p-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.85] lg:[zoom:1.3]">
      <div className="grid grid-cols-[auto_repeat(3,minmax(3.25rem,1fr))] overflow-hidden rounded-xl border-2 border-lime-300 bg-lime-50 text-center">
        <span className="px-2 text-xs font-bold">Bilangan</span>{placeNames.map((p, i) => <span key={p} className="border-s border-lime-300 px-1 text-xs font-bold" style={{ color: placeColors[i] }}>{p}</span>)}
        {row(a, da)}{row(b, db)}
      </div>
      <p className="text-3xl font-extrabold">{a} <span className="inline-grid size-12 place-items-center rounded-full border-4 border-orange-300 bg-white align-middle">{pick ?? "…"}</span> {b}</p>
    </div>
    <div className="flex flex-wrap gap-2">{["<", ">", "="].map(x => <button key={x} type="button" aria-label={`Tanda ${x}`} aria-pressed={pick === x} onClick={() => setPick(x)} className={`btn w-14 text-3xl ${pick === x ? (ok ? "btn-success" : "btn-error") : "btn-outline"}`}>{x}</button>)}
      <button type="button" className="btn btn-outline gap-1 ms-auto" onClick={() => { setK((k + 1) % pairs.length); setPick(null); }}>Berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button></div>
    <Result value={pick ? `${k}|${ok ? "ok" : "no"}` : `${k}|`}>{!pick ? "Bandingkan ratusannya dulu." : ok ? (at < 0 ? `Tepat. Semua angkanya sama, jadi ${a} = ${b}.` : `Tepat. ${at === 0 ? "Ratusannya" : at === 1 ? "Ratusannya sama, puluhannya" : "Ratusan dan puluhannya sama, satuannya"} ${da[at]} dan ${db[at]}, jadi ${a} ${sign(a, b)} ${b}.`) : "Belum tepat. Lihat lagi nilai tempat yang angkanya berbeda, mulai dari ratusan."}</Result>
  </div>;
}
const priceSets = [[850, 825, 875], [650, 625, 675, 605], [720, 639, 709], [498, 490, 508, 489]];
const tagNames = ["Hewan", "Buah", "Bunga", "Mobil"];
function OrderLab() {
  const [k, setK] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const set = priceSets[k], want = [...set].sort((x, y) => x - y), done = seq.length === set.length, ok = done && seq.every((v, i) => v === want[i]);
  return <div className="space-y-3">
    <p className="text-sm font-semibold">Ketuk karet penghapus dari harga yang paling murah.</p>
    <div className="flex flex-wrap justify-center gap-1 rounded-xl bg-base-100 p-2 sm:gap-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.15]">{set.map((p, i) => <button key={p} type="button" aria-label={`Harga ${p}`} disabled={seq.includes(p)} onClick={() => setSeq([...seq, p])} className="rounded-xl p-0.5 disabled:opacity-30"><SignView small sign={{ kind: "harga", n: p, name: tagNames[i] }} /></button>)}</div>
    <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold">Urutanmu:</span>{set.map((_, i) => <span key={i} className="grid h-10 min-w-14 place-items-center rounded-xl border-2 border-dashed border-orange-300 bg-white px-2 text-xl font-extrabold">{seq[i] ?? ""}</span>)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-ghost gap-1" disabled={!seq.length} onClick={() => setSeq(seq.slice(0, -1))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setK((k + 1) % priceSets.length); setSeq([]); }}><Shuffle className="size-4" aria-hidden="true" />Harga lain</button></div>
    <Result value={done ? (ok ? "ok" : "no") : ""}>{!done ? "Cari ratusan terkecil dulu, lalu bandingkan puluhan dan satuannya." : ok ? `Tepat: ${want.join(" < ")}. Yang paling murah ${want[0]} rupiah.` : `Belum tepat. Urutan yang benar ${want.join(", ")}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga D dan E                                                          */
/* ====================================================================== */
function TwoNumbers({ a, b, setA, setB, sub }: { a: number; b: number; setA: (n: number) => void; setB: (n: number) => void; sub?: boolean }) {
  return <div className="space-y-1.5 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.9]">
    <NumStepper label="Bilangan 1" value={a} set={setA} min={sub ? 11 : 10} max={sub ? 99 : 99 - b} />
    <NumStepper label="Bilangan 2" value={b} set={setB} min={1} max={sub ? a : 99 - a} />
  </div>;
}
function AddLab() {
  const [a, setA0] = useState(48), [b, setB0] = useState(16), [phase, setPhase] = useState(0);
  const setA = (v: number) => { setA0(v); setPhase(0); }, setB = (v: number) => { setB0(v); setPhase(0); };
  const ut = (a % 10) + (b % 10), carry = ut >= 10, sum = a + b, over = sum > 99;
  const doneAll = phase === 2 || (phase === 1 && !carry);
  const shownT = Math.floor(a / 10) + Math.floor(b / 10) + (phase === 2 ? 1 : 0), shownU = phase === 2 ? ut - 10 : ut;
  return <div className="space-y-3">
    <TwoNumbers a={a} b={b} setA={setA} setB={setB} />
    <div className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-xl bg-base-100 p-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.6]">
      <TensTable><TensRow n={a} label={String(a)} /><TensRow n={b} label={String(b)} />
        {phase > 0 && <div className="contents"><span className="col-span-3 bg-lime-100 py-0.5 text-center text-sm font-bold">Gabungkan</span>
          <span className="grid place-items-center text-xl font-extrabold">{doneAll ? sum : "?"}</span>
          <span className="flex flex-col items-center justify-center gap-px border-s border-violet-200 p-1">{Array.from({ length: shownT }, (_, i) => <Rod key={i} size={11} />)}</span>
          <span className="grid grid-cols-5 place-content-center gap-0.5 border-s border-violet-200 p-1">{Array.from({ length: shownU }, (_, i) => <Unit key={i} size={15} />)}</span></div>}
      </TensTable>
      <Column a={a} b={b} op="+" carry={carry && phase === 2 ? ["1", ""] : undefined} out={doneAll ? String(sum).split("") : phase === 2 ? ["", String(ut - 10)] : []} />
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success" disabled={phase > 0 || over} onClick={() => setPhase(1)}>Gabungkan</button>
      <button type="button" className="btn btn-sm btn-success" disabled={phase !== 1 || !carry} onClick={() => setPhase(2)}>Tukar 10 satuan jadi 1 puluhan</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setPhase(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={doneAll ? String(sum) : over ? "over" : `fase${phase}`}>{over ? "Hasilnya lebih dari 99. Kecilkan salah satu bilangan." : phase === 0 ? `Satuan: ${a % 10} + ${b % 10} = ${ut}. ${carry ? "Lebih dari 9, nanti perlu ditukar." : "Tidak perlu menyimpan."}` : !doneAll ? `Ada ${ut} satuan. Tukar 10 satuan menjadi 1 puluhan.` : <>{carry ? `${a % 10} + ${b % 10} = ${ut}, tulis ${ut - 10} simpan 1. ` : ""}Jadi <strong>{a} + {b} = {sum}</strong>.</>}</Result>
  </div>;
}
function SubLab() {
  const [a, setA0] = useState(45), [b, setB0] = useState(19);
  const [borrowed, setBorrowed] = useState(false), [uDone, setUDone] = useState(false), [tDone, setTDone] = useState(false);
  const reset = () => { setBorrowed(false); setUDone(false); setTDone(false); };
  const setA = (v: number) => { setA0(v); if (b > v) setB0(v); reset(); }, setB = (v: number) => { setB0(Math.min(v, a)); reset(); };
  const need = a % 10 < b % 10, canU = (!need || borrowed) && !uDone;
  const topT = Math.floor(a / 10) - (borrowed ? 1 : 0), topU = (a % 10) + (borrowed ? 10 : 0);
  const outU = uDone ? String(topU - (b % 10)) : "", outT = tDone ? String(topT - Math.floor(b / 10)) : "";
  return <div className="space-y-3">
    <TwoNumbers a={a} b={b} setA={setA} setB={setB} sub />
    <div className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-xl bg-base-100 p-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.75]">
      <TensTable><TensRow n={a} label={String(a)} borrowed={borrowed} crossU={uDone ? b % 10 : 0} crossT={tDone ? Math.floor(b / 10) : 0} /></TensTable>
      <Column a={a} b={b} op="−" carry={borrowed ? [String(topT), String(topU)] : undefined} out={[outT, outU]} />
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success" disabled={!need || borrowed} onClick={() => setBorrowed(true)}>Pindahkan 1 puluhan ke satuan</button>
      <button type="button" className="btn btn-sm btn-success" disabled={!canU} onClick={() => setUDone(true)}>Kurangi satuan</button>
      <button type="button" className="btn btn-sm btn-success" disabled={!uDone || tDone} onClick={() => setTDone(true)}>Kurangi puluhan</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={reset}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>
    </div>
    <Result value={tDone ? String(a - b) : borrowed ? "pinjam" : need ? "kurang" : "siap"}>{tDone ? <>Jadi <strong>{a} − {b} = {a - b}</strong>.</> : uDone ? `Satuan: ${topU} − ${b % 10} = ${topU - (b % 10)}. Sekarang kurangi puluhan: ${topT} − ${Math.floor(b / 10)}.` : need && !borrowed ? `${a % 10} kurang dari ${b % 10}, jadi satuannya tidak cukup. Pindahkan 1 puluhan menjadi 10 satuan.` : borrowed ? `Sekarang ada ${topU} satuan dan ${topT} puluhan. Kurangi satuan: ${topU} − ${b % 10}.` : `Satuannya cukup: ${a % 10} − ${b % 10}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga F dan G                                                          */
/* ====================================================================== */
const groupThings: Thing[] = ["pensil", "melati", "mobil"];
function GroupsLab() {
  const [g, setG] = useState(5), [e, setE] = useState(2), [thing, setThing] = useState<Thing>("pensil");
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Benda" className="flex flex-wrap gap-1.5">{groupThings.map(t => <button key={t} type="button" role="radio" aria-checked={thing === t} onClick={() => setThing(t)} className={`btn btn-sm gap-1 ${thing === t ? "btn-success" : "btn-outline"}`}><ThingIcon thing={t} className="size-5" />{thingName[t]}</button>)}</div>
    <div className="flex flex-wrap items-end justify-around gap-2"><VStepper label="Kelompok" value={g} set={setG} min={1} max={9} /><VStepper label="Isi" value={e} set={setE} min={1} max={9} />
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setG(e); setE(g); }}><Repeat2 className="size-4" aria-hidden="true" />Tukar</button></div>
    <div className="grid min-h-28 place-items-center rounded-xl bg-base-100 p-2 sm:p-3 [@media(max-height:700px)]:min-h-0 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.3]"><Groups thing={thing} groups={g} each={e} icon={g * e > 40 ? "size-4 sm:size-5" : g * e > 20 ? "size-5 sm:size-7" : "size-7"} /></div>
    <p className="text-lg font-bold sm:text-xl">{Array(g).fill(e).join(" + ")} = {g * e}</p>
    <Result value={String(g * e)}><strong>{g} × {e} = {g * e}</strong>: {g} kelompok, setiap kelompok {e} {thingName[thing]}. Tukar untuk melihat {e} × {g} juga {g * e}.</Result>
  </div>;
}
function ShareLab() {
  const [total, setTotal0] = useState(15), [people, setPeople0] = useState(3), [rounds, setRounds] = useState(0);
  const setTotal = (v: number) => { setTotal0(v); setRounds(0); }, setPeople = (v: number) => { setPeople0(v); setRounds(0); };
  const left = total - rounds * people, can = left >= people;
  const log = Array.from({ length: rounds }, (_, i) => `${total - i * people} − ${people} = ${total - (i + 1) * people}`);
  return <div className="space-y-3">
    <div className="flex flex-wrap justify-around gap-2"><VStepper label="Manik-manik" value={total} set={setTotal} min={4} max={30} /><VStepper label="Anggota" value={people} set={setPeople} min={2} max={5} /></div>
    <div className="flex flex-wrap items-start justify-center gap-1.5 rounded-xl bg-base-100 p-2 sm:gap-2 sm:p-3 [@media(max-height:700px)]:[zoom:0.8] lg:[zoom:1.25]"><Plate items={left} thing="manik" label="Ketua" icon="size-4 sm:size-5" />{Array.from({ length: people }, (_, i) => <Plate key={i} items={rounds} thing="manik" label={`Anggota ${i + 1}`} icon="size-4 sm:size-5" />)}</div>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-success" disabled={!can} onClick={() => setRounds(rounds + 1)}>Bagikan satu ke setiap anggota</button>
      <button type="button" className="btn btn-sm btn-ghost gap-1" onClick={() => setRounds(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
    {log.length > 0 && <p className="font-mono text-sm leading-6">{log.join(";  ")}</p>}
    <Result value={can ? `r${rounds}` : left === 0 ? `${total}:${people}=${rounds}` : `sisa${left}`}>{can ? `Tersisa ${left}. Bagikan lagi.` : left === 0 ? <>Habis setelah {rounds} putaran. <strong>{total} : {people} = {rounds}</strong>, dan {rounds} × {people} = {total}.</> : `Tersisa ${left}, kurang dari ${people}. ${total} tidak bisa dibagi sama banyak kepada ${people} anggota.`}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { blocks: BlocksLab, cards: CardsLab, cans: CansLab, compare: CompareLab, order: OrderLab, add: AddLab, sub: SubLab, groups: GroupsLab, share: ShareLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "blocks": return <Blocks h={scene.h} t={scene.t} u={scene.u} scale={scene.t > 9 ? 0.75 : 0.95} />;
    case "tens": return <TensTable>{scene.rows.map(n => <TensRow key={n} n={n} label={String(n)} />)}</TensTable>;
    case "signs": return <div className="flex flex-wrap justify-center gap-1 sm:gap-2">{scene.items.map(s => <SignView key={s.name} sign={s} small={scene.items.length > 1} />)}</div>;
    case "groups": return <Groups thing={scene.thing} groups={scene.groups} each={scene.each} icon={scene.groups * scene.each > 24 ? "size-5" : "size-7"} />;
    case "share": return <div className="flex flex-wrap items-center justify-center gap-1.5"><Plate wide items={scene.total} thing={scene.thing} label={`${scene.total} ${thingName[scene.thing]}`} icon="size-4" />{Array.from({ length: scene.plates }, (_, i) => <Plate key={i} small items={0} thing={scene.thing} label={scene.thing === "telur" ? `Kotak ${i + 1}` : `Piring ${i + 1}`} />)}</div>;
    case "table": return <figure className="w-full max-w-lg"><figcaption className="pb-1 text-center text-sm font-bold">{scene.caption}</figcaption>
      <dl className="grid grid-cols-3 overflow-hidden rounded-xl border-2 border-violet-300 bg-white text-center sm:grid-cols-6">{scene.rows.map(([n, v]) => <div key={n} className="border-b border-e border-violet-200"><dt className="bg-violet-100 py-0.5 text-sm font-semibold">{n}</dt><dd className="py-0.5 text-xl font-extrabold">{v}</dd></div>)}</dl></figure>;
    case "story": return <div className="flex flex-wrap justify-center gap-4">{scene.items.map(it => <div key={it.name} className="flex flex-col items-center gap-0.5"><span className="relative"><ThingIcon thing={it.thing} className="size-10 sm:size-14" /><span className="absolute -end-3 -top-2 rounded-full bg-success px-2 text-lg font-extrabold text-white">{it.n}</span></span><span className="text-sm font-bold">{it.name}</span></div>)}</div>;
    case "cards": return <div className="flex gap-2">{scene.digits.map(d => <Card key={d} d={d} />)}</div>;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function FillPart({ p, x, put, checked, i }: { p: Extract<Part, { kind: "fill" }>; x: string[]; put: (k: number, v: string) => void; checked: boolean; i: number }) {
  const bits = p.text.split("□");
  return <p className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xl font-bold leading-10">{bits.map((t, k) => <span key={k} className="contents">{t && <span>{t.trim()}</span>}{k < bits.length - 1 && <Box label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} wide={p.answers[k] >= 100} />}</span>)}</p>;
}
function OrderPart({ p, value, set, checked }: { p: Extract<Part, { kind: "order" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const seq = value ? value.split("|") : [];
  return <div className="space-y-1.5"><p className="font-bold">{p.label}</p>
    <div role="group" aria-label={p.label} className="flex flex-wrap gap-2">{p.options.map(o => <button key={o} type="button" disabled={checked || seq.includes(o)} onClick={() => set([...seq, o].join("|"))} className="btn btn-outline text-xl">{o}</button>)}</div>
    <div className="flex flex-wrap items-center gap-1.5">{p.options.map((_, k) => <span key={k} className="grid h-10 min-w-14 place-items-center rounded-xl border-2 border-dashed border-orange-300 bg-white px-2 text-xl font-extrabold">{seq[k] ?? k + 1}</span>)}
      <button type="button" className="btn btn-ghost btn-sm gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join("|"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div>
  </div>;
}
function MatchPart({ p, value, set, checked }: { p: Extract<Part, { kind: "match" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [sel, setSel] = useState<number | null>(null);
  const vals = cells(p, value), n = p.left.length, m = p.right.length, H = 1000;
  return <div className="space-y-2">
    <p className="text-sm text-base-content/70">{sel === null ? "Ketuk kotak di kiri, lalu ketuk pasangannya di kanan." : "Sekarang ketuk pasangannya di kanan."}</p>
    <div className="grid grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)]" style={{ minHeight: Math.max(n, m) * 46 }}>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${n}, minmax(0, 1fr))` }}>{p.left.map((l, k) => <button key={k} type="button" disabled={checked} aria-label={`Pilih ${l}`} aria-pressed={sel === k} onClick={() => setSel(sel === k ? null : k)}
        className={`rounded-xl border-2 px-1.5 py-1 text-sm font-bold leading-snug sm:text-base ${sel === k ? "border-success bg-success/10" : vals[k] !== "" ? "border-info/60 bg-base-100" : "border-orange-300 bg-orange-50"}`}>{l}</button>)}</div>
      <div className="relative"><svg viewBox={`0 0 40 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">{vals.map((r, k) => r !== "" && <line key={k} x1="0" y1={((k + 0.5) / n) * H} x2="40" y2={((Number(r) + 0.5) / m) * H} stroke="#0f766e" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}</svg></div>
      <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${m}, minmax(0, 1fr))` }}>{p.right.map((r, j) => <button key={j} type="button" disabled={checked || sel === null} aria-label={`Hubungkan ke ${r}`} onClick={() => { if (sel === null) return; const v = [...vals]; v[sel] = String(j); set(v.join("|")); setSel(null); }}
        className="rounded-xl border-2 border-purple-300 bg-purple-50 px-1.5 py-1 text-sm font-bold leading-snug sm:text-base">{r}</button>)}</div>
    </div>
    <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={checked || vals.every(v => v === "")} onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua garis</button>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": return <FillPart p={p} x={x} put={put} checked={checked} i={i} />;
    case "pv": { let k = 0; const d = digits(p.n);
      return <div className="flex flex-wrap items-center gap-3">
        {p.hideN && <label className="flex items-center gap-2 text-lg font-bold">Bilangan <Box label="Bilangan" wide value={x[x.length - 1]} onChange={v => put(x.length - 1, v)} disabled={checked} /></label>}
        <PvTable cell={j => { if (!p.hide[j]) return d[j]; const idx = k++; return <Box label={placeNames[j]} value={x[idx]} onChange={v => put(idx, v)} disabled={checked} />; }} />
      </div>; }
    case "choice": { const sym = p.options[0] === "<";
      return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5"><p className="text-lg font-bold sm:text-xl">{p.label}</p>
        <div className="flex flex-wrap gap-2 [@media(max-height:700px)]:gap-1">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 font-bold ${sym ? "min-h-12 min-w-14 px-4 text-3xl" : "min-h-10 px-3 text-base sm:text-lg [@media(max-height:700px)]:min-h-8 [@media(max-height:700px)]:py-0"} ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>; }
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><p className="font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={on.includes(op)} disabled={checked} onClick={() => set((on.includes(op) ? on.filter(o => o !== op) : [...on, op]).join("|"))} className={`min-h-12 min-w-16 rounded-full border-4 px-4 text-2xl font-extrabold ${on.includes(op) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div>
        <p className="text-xs text-base-content/60">Ketuk lagi untuk membatalkan.</p></div>; }
    case "order": return <OrderPart p={p} value={value} set={set} checked={checked} />;
    case "match": return <MatchPart p={p} value={value} set={set} checked={checked} />;
    case "column": return <Column a={p.a} b={p.b} op={p.op} out={x.map((c, k) => <Box key={k} label={`Hasil angka ${k + 1}`} value={c} onChange={v => put(k, v.slice(-1))} disabled={checked} />)} />;
  }
}
function Answer({ q, value, record, checked }: { q: KQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4 [@media(max-height:700px)]:space-y-2 [@media(max-height:700px)]:[zoom:0.88]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeThreeWhole1000() {
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
    <h1 className="text-3xl font-extrabold sm:text-5xl">Bilangan Cacah sampai 1.000</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Baca dan tulis bilangan tiga angka, kenali nilai tempat, bandingkan dan urutkan bilangan, lalu jumlahkan, kurangkan, kalikan, dan bagi bilangan sampai 100.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-2"><Flat size={44} /><div className="grid gap-0.5"><Rod size={10} /><Rod size={10} /></div><Unit size={14} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Kegiatan Pramuka</h2>
        <p className="mt-2 text-sm">Alfa membawa tongkat Pramuka sepanjang 160 cm. Jarak rumah Meutia ke sekolah 671 meter. Bilangan tiga angka ada di sekitar kita. Ayo belajar membaca, menulis, dan menghitungnya.</p>
        <p className="mt-2 text-sm text-base-content/60">9 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bilangan-1000">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bilangan-1000" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        {t.sections.length > 1 && <div role="tablist" aria-label={`Bagian ${t.short}`} className="mb-3 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>}
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <p className="mt-1 text-sm text-base-content/60">{t.title}</p>
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
      </> : <GradeFourQuiz<KQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2.5 [@media(max-height:700px)]:p-1.5 [@media(max-height:700px)]:[zoom:0.72]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
