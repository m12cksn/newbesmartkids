"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { GraphView, M, PlaneView, plainMath, QuadrantView, ReceiptView, SceneView, toLine } from "./GradeNineSystemsArt";
import {
  assessment, cells, correct, drawPoints, eqText, formatAnswer, frac, idn, latticeOn, practice, ready, sections, SEP, solve, splitParts, topics,
  type Part, type SQuestion,
} from "@/data/grade-nine-systems";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, skip, show = idn }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; skip?: number; show?: (n: number) => string }) {
  const go = (d: number) => { let v = Math.round((value + d) * 100) / 100; if (skip !== undefined && v === skip) v = Math.round((v + d) * 100) / 100; if (v >= min - 1e-9 && v <= max + 1e-9) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{show(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm ${value === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>;
}
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;
const key = (v: number) => String(r6(v));
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,15rem)_1fr]">{children}</div>;
const rp = (v: number) => `Rp${idn(v)}`;
/** Suku dengan tanda dan kurung untuk bilangan negatif: 3(−4). */
const par = (v: number) => (v < 0 ? `(${frac(v)})` : frac(v));

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function ModelLab() {
  const [p1, setP1] = useState(20000);
  const [p2, setP2] = useState(10000);
  const [total, setTotal] = useState(120000);
  const [x, setX] = useState(2);
  const xMax = total / p1, xx = Math.min(x, Math.floor(xMax * 2) / 2), y = r6((total - p1 * xx) / p2), g = gcd(gcd(p1, p2), total);
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Stepper label="Beras merah/kg" value={p1} set={setP1} min={5000} max={30000} step={5000} show={rp} />
      <Stepper label="Tepung/kg" value={p2} set={setP2} min={5000} max={30000} step={5000} show={rp} />
      <Stepper label="Uang dibayar" value={total} set={setTotal} min={60000} max={200000} step={10000} show={rp} />
      <Stepper label="Beras merah (kg)" value={xx} set={setX} min={0} max={Math.floor(xMax * 2) / 2} step={0.5} />
    </div>
    <p className="text-lg font-extrabold"><M text={eqText(p1, p2, total)} /></p>
    {g > 1 && <p className="text-sm">Bagi kedua ruas dengan {idn(g)}: <strong><M text={eqText(p1 / g, p2 / g, total / g)} /></strong></p>}
    <Pair>
      <QuadrantView a={p1} b={p2} c={total} xMax={Math.ceil(xMax)} yMax={Math.ceil(total / p2)} point={{ x: xx, y }} xLabel="Beras merah (kg)" yLabel="Tepung (kg)" />
      <ol className="list-decimal space-y-1 ps-5 text-base">
        <li>x = {idn(xx)} kg beras merah: {idn(xx)}({idn(p1)}) = {idn(p1 * xx)}</li>
        <li>Sisa uang untuk tepung: {idn(total)} − {idn(p1 * xx)} = {idn(total - p1 * xx)}</li>
        <li>y = {idn(total - p1 * xx)} : {idn(p2)} = <strong>{idn(y)} kg</strong></li>
      </ol>
    </Pair>
    <Result value={`${key(xx)}|${key(y)}`}>Pasangan ({idn(xx)}, {idn(y)}) adalah salah satu penyelesaian. Ubah berat beras merah: berat tepung ikut berubah, dan semua titiknya terletak pada satu garis.</Result>
  </div>;
}

const domains = ["Cacah", "Bulat", "Real"] as const;
function SolutionsLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(8);
  const [dom, setDom] = useState<(typeof domains)[number]>("Cacah");
  const r = 10, cac = latticeOn({ a, b, c, r: Math.max(r, c) }, true), bul = latticeOn({ a, b, c, r });
  const pts = dom === "Cacah" ? cac : dom === "Bulat" ? bul : [];
  const list = (p: [number, number][]) => p.map(([x, y]) => `(${x}, ${y})`).join(", ");
  return <div className="space-y-3">
    <Radios label="Semesta x dan y" options={domains} value={dom} set={setDom} />
    <div className="flex flex-wrap gap-4"><Stepper label="a" value={a} set={setA} min={1} max={4} /><Stepper label="b" value={b} set={setB} min={1} max={4} /><Stepper label="c" value={c} set={setC} min={2} max={10} /></div>
    <p className="text-xl font-extrabold"><M text={eqText(a, b, c)} /></p>
    <Pair>
      <GraphView lines={dom === "Real" ? [toLine([a, b, c])] : []} points={pts.map(([x, y]) => ({ x, y }))} r={r} label={`Penyelesaian ${plainMath(eqText(a, b, c))} untuk bilangan ${dom.toLowerCase()}`} />
      <div className="space-y-2 text-base">
        {dom === "Cacah" && <p>Himpunan penyelesaian: <strong>{cac.length ? `{${list(cac)}}` : "{ } (kosong)"}</strong></p>}
        {dom === "Bulat" && <p>Himpunan penyelesaian: <strong>{`{…, ${list(bul.slice(0, 4))}, …}`}</strong>. Banyaknya tak hingga, tetapi dapat didaftar satu per satu.</p>}
        {dom === "Real" && <p>Himpunan penyelesaian: <strong>{"{(x, y) | "}<M text={eqText(a, b, c)} />{"; x, y ∈ R}"}</strong>, yaitu semua titik pada garis.</p>}
        <p className="text-sm text-base-content/70">Ketiga semesta memakai persamaan yang sama. Yang berbeda hanya pasangan mana yang boleh dipakai.</p>
      </div>
    </Pair>
    <Result value={`${a}|${b}|${c}|${dom}|${dom === "Cacah" ? cac.length : "tak hingga"}`}>{dom === "Cacah" ? `Ada ${cac.length} penyelesaian bilangan cacah.` : dom === "Bulat" ? "Penyelesaian bilangan bulat tak hingga banyaknya; titik-titiknya terpisah." : "Penyelesaian bilangan real membentuk garis utuh."}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function GraphLab() {
  const [e, setE] = useState([1, 1, 5, 2, -1, 4]);
  const put = (k: number) => (v: number) => setE(o => o.map((x, j) => (j === k ? v : x)));
  const [a1, b1, c1, a2, b2, c2] = e, bad = (a1 === 0 && b1 === 0) || (a2 === 0 && b2 === 0);
  const s = bad ? null : solve(a1, b1, c1, a2, b2, c2);
  return <div className="space-y-3">
    {[0, 1].map(i => <div key={i} className="flex flex-wrap items-center gap-3"><span className="font-bold">Persamaan {i ? "II" : "I"}</span>
      <Stepper label={`a${i ? "₂" : "₁"}`} value={e[3 * i]} set={put(3 * i)} min={-4} max={4} /><Stepper label={`b${i ? "₂" : "₁"}`} value={e[3 * i + 1]} set={put(3 * i + 1)} min={-4} max={4} /><Stepper label={`c${i ? "₂" : "₁"}`} value={e[3 * i + 2]} set={put(3 * i + 2)} min={-8} max={8} /></div>)}
    {bad ? <p className="text-error">Koefisien x dan y tidak boleh keduanya 0.</p> : <Pair>
      <PlaneView eqs={[[a1, b1, c1], [a2, b2, c2]]} points={s && typeof s === "object" && Math.abs(s.x) <= 8 && Math.abs(s.y) <= 8 ? [{ x: s.x, y: s.y }] : []} r={8} />
      <div className="space-y-1 text-base">
        <p>I: <strong><M text={eqText(a1, b1, c1)} /></strong></p><p>II: <strong><M text={eqText(a2, b2, c2)} /></strong></p>
        {s === "sejajar" && <p>Kemiringan sama, tetapi garisnya tidak berimpit: <strong>sejajar</strong>.</p>}
        {s === "berimpit" && <p>Persamaan II adalah kelipatan persamaan I: <strong>berimpit</strong>.</p>}
        {s && typeof s === "object" && <><p>Titik potong: <strong>(<M text={frac(s.x)} />, <M text={frac(s.y)} />)</strong></p>
          <p className="text-sm">Periksa I: <M text={`${frac(a1)}${par(s.x)} + ${frac(b1)}${par(s.y)} = ${frac(c1)}`} /></p>
          <p className="text-sm">Periksa II: <M text={`${frac(a2)}${par(s.x)} + ${frac(b2)}${par(s.y)} = ${frac(c2)}`} /></p></>}
      </div>
    </Pair>}
    <Result value={!s ? "-" : typeof s === "string" ? s : `${key(s.x)}|${key(s.y)}`}>{!s ? "Lengkapi kedua persamaan." : s === "sejajar" ? "Tidak ada penyelesaian." : s === "berimpit" ? "Tak hingga penyelesaian: setiap titik pada garis memenuhi keduanya." : Number.isInteger(r6(s.x)) && Number.isInteger(r6(s.y)) ? "Tepat satu penyelesaian." : "Tepat satu penyelesaian, tetapi pecahan: dari gambar saja sulit dibaca dengan tepat."}</Result>
  </div>;
}

function SubstLab() {
  const [cnt, setCnt] = useState(25);
  const [p1, setP1] = useState(1.5);
  const [p2, setP2] = useState(2);
  const [money, setMoney] = useState(42);
  const jt = (v: number) => `${idn(v)} jt`;
  const same = p1 === p2, y = same ? null : r6((money - p1 * cnt) / (p2 - p1)), x = y === null ? null : r6(cnt - y);
  const ok = x !== null && y !== null && x >= 0 && y >= 0 && Number.isInteger(x) && Number.isInteger(y);
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Stepper label="Banyak sepeda" value={cnt} set={setCnt} min={10} max={30} />
      <Stepper label="Uang (juta)" value={money} set={setMoney} min={15} max={90} show={jt} />
      <Stepper label="Sepeda gunung" value={p1} set={setP1} min={1} max={3} step={0.5} show={jt} />
      <Stepper label="Sepeda balap" value={p2} set={setP2} min={1} max={3} step={0.5} show={jt} />
    </div>
    <div className="rounded-xl bg-base-100 p-3 text-base">
      <p>x = sepeda gunung, y = sepeda balap (harga dalam juta rupiah)</p>
      <p className="font-bold">I: x + y = {cnt}</p><p className="font-bold">II: {idn(p1)}x + {idn(p2)}y = {idn(money)}</p>
      <ol className="mt-2 list-decimal space-y-1 ps-5">
        <li>Dari I: x = {cnt} − y</li>
        <li>Ke II: {idn(p1)}({cnt} − y) + {idn(p2)}y = {idn(money)} → {idn(p1 * cnt)} {p2 - p1 >= 0 ? "+" : "−"} {idn(Math.abs(r6(p2 - p1)))}y = {idn(money)}{same ? "" : <> → y = <M text={frac(y!)} /></>}</li>
        {!same && <li>x = {cnt} − <M text={frac(y!)} /> = <M text={frac(x!)} /></li>}
      </ol>
    </div>
    <Result value={same ? "sama" : `${key(x!)}|${key(y!)}|${ok ? "bisa" : "tidak"}`}>{same ? "Harga kedua sepeda sama, jadi y hilang dan banyak masing-masing tidak dapat ditentukan." : ok ? `Pak Ahmad membeli ${x} sepeda gunung dan ${y} sepeda balap.` : "Hasilnya pecahan atau negatif: rencana belanja ini tidak mungkin, ubah uang atau harganya."}</Result>
  </div>;
}

const orders = ["Hilangkan x dulu", "Hilangkan y dulu"] as const;
/** Langkah eliminasi satu variabel (k = 0 untuk x, 1 untuk y). */
function eliminate(e: number[], k: 0 | 1) {
  const [a1, b1, c1, a2, b2, c2] = e, u = k === 0 ? a1 : b1, v = k === 0 ? a2 : b2, L = lcm(u, v), m1 = L / Math.abs(u), m2 = L / Math.abs(v);
  const r1 = [a1 * m1, b1 * m1, c1 * m1], r2 = [a2 * m2, b2 * m2, c2 * m2], add = Math.sign(u) !== Math.sign(v);
  const res = add ? r1.map((x, j) => x + r2[j]) : r1.map((x, j) => x - r2[j]), coef = k === 0 ? res[1] : res[0];
  return { m1, m2, r1, r2, add, coef, rhs: res[2], value: coef === 0 ? null : r6(res[2] / coef) };
}
function ElimLab() {
  const [e, setE] = useState([2, 3, 12, 5, -2, 11]);
  const [ord, setOrd] = useState<(typeof orders)[number]>("Hilangkan x dulu");
  const put = (k: number) => (v: number) => setE(o => o.map((x, j) => (j === k ? v : x)));
  const first = ord === "Hilangkan x dulu" ? 0 : 1, steps = [first, 1 - first] as (0 | 1)[];
  const s = solve(e[0], e[1], e[2], e[3], e[4], e[5]);
  return <div className="space-y-3">
    <Radios label="Urutan eliminasi" options={orders} value={ord} set={setOrd} />
    {[0, 1].map(i => <div key={i} className="flex flex-wrap items-center gap-3"><span className="font-bold">Persamaan {i ? "II" : "I"}</span>
      <Stepper label={`a${i ? "₂" : "₁"}`} value={e[3 * i]} set={put(3 * i)} min={-6} max={6} skip={0} /><Stepper label={`b${i ? "₂" : "₁"}`} value={e[3 * i + 1]} set={put(3 * i + 1)} min={-6} max={6} skip={0} /><Stepper label={`c${i ? "₂" : "₁"}`} value={e[3 * i + 2]} set={put(3 * i + 2)} min={-20} max={20} /></div>)}
    <div className="grid gap-3 sm:grid-cols-2">{steps.map((k, j) => { const st = eliminate(e, k), other = k === 0 ? "y" : "x";
      return <div key={k} className="rounded-xl bg-base-100 p-3 text-sm leading-7"><p className="font-bold">{j + 1}. Hilangkan {k === 0 ? "x" : "y"}</p>
        <p><M text={eqText(e[0], e[1], e[2])} /> (×{st.m1}) → <M text={eqText(st.r1[0], st.r1[1], st.r1[2])} /></p>
        <p><M text={eqText(e[3], e[4], e[5])} /> (×{st.m2}) → <M text={eqText(st.r2[0], st.r2[1], st.r2[2])} /></p>
        <p>{st.add ? "Tanda berlawanan, jumlahkan" : "Tanda sama, kurangkan"}: <strong><M text={`${frac(st.coef)}${other} = ${frac(st.rhs)}`} /></strong></p>
        {st.value !== null && <p className="font-bold">{other} = <M text={frac(st.value)} /></p>}</div>; })}</div>
    <Result value={typeof s === "string" ? s : `${key(s.x)}|${key(s.y)}`}>{typeof s === "string" ? `Kedua variabel hilang bersamaan: garisnya ${s}, jadi ${s === "sejajar" ? "tidak ada penyelesaian" : "penyelesaiannya tak hingga"}.` : <>Penyelesaian: (<M text={frac(s.x)} />, <M text={frac(s.y)} />). Urutan eliminasi tidak mengubah hasil.</>}</Result>
  </div>;
}

const fruitOrders = ["Hilangkan apel dulu", "Hilangkan jeruk dulu"] as const;
function MixedLab() {
  const J = 17000, A = 20000;
  const [q, setQ] = useState([5, 2, 3, 4]);
  const [buy, setBuy] = useState([7, 1]);
  const [ord, setOrd] = useState<(typeof fruitOrders)[number]>("Hilangkan apel dulu");
  const put = (k: number) => (v: number) => setQ(o => o.map((x, j) => (j === k ? v : x)));
  const [a1, b1, a2, b2] = q, c1 = a1 * J + b1 * A, c2 = a2 * J + b2 * A, e = [a1, b1, c1, a2, b2, c2];
  const k: 0 | 1 = ord === "Hilangkan apel dulu" ? 1 : 0, st = eliminate(e, k), s = solve(a1, b1, c1, a2, b2, c2);
  const found = typeof s === "object", sub = k === 1 ? "jeruk" : "apel", other = k === 1 ? "apel" : "jeruk";
  const rest = found ? (k === 1 ? `${a1}(${idn(s.x)}) + ${b1}a = ${idn(c1)} → a = ${idn(s.y)}` : `${a1}j + ${b1}(${idn(s.y)}) = ${idn(c1)} → j = ${idn(s.x)}`) : "";
  return <div className="space-y-3">
    <Radios label="Urutan eliminasi" options={fruitOrders} value={ord} set={setOrd} />
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Stepper label="Nota I jeruk (kg)" value={a1} set={put(0)} min={1} max={6} /><Stepper label="Nota I apel (kg)" value={b1} set={put(1)} min={1} max={6} />
      <Stepper label="Nota II jeruk (kg)" value={a2} set={put(2)} min={1} max={6} /><Stepper label="Nota II apel (kg)" value={b2} set={put(3)} min={1} max={6} />
    </div>
    <Pair>
      <ReceiptView title="Toko buah" rows={[{ items: `${a1} kg jeruk + ${b1} kg apel`, total: rp(c1) }, { items: `${a2} kg jeruk + ${b2} kg apel`, total: rp(c2) }]} />
      {found ? <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li>Eliminasi {other}: ×{st.m1} dan ×{st.m2}, lalu {st.add ? "jumlahkan" : "kurangkan"}: <M text={`${frac(st.coef)}${sub[0]} = ${idn(st.rhs)}`} />, jadi {sub[0]} = {idn(st.value!)}</li>
        <li>Substitusi ke nota I: {rest}</li>
        <li>Harga jeruk {rp(s.x)}/kg, apel {rp(s.y)}/kg.</li>
      </ol> : <p className="text-sm">Isi kedua nota sebanding, jadi harga per kg tidak dapat ditentukan. Ubah salah satu nota.</p>}
    </Pair>
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-base-100 p-3"><span className="font-bold">Belanja baru</span><Stepper label="Jeruk (kg)" value={buy[0]} set={v => setBuy([v, buy[1]])} min={0} max={9} /><Stepper label="Apel (kg)" value={buy[1]} set={v => setBuy([buy[0], v])} min={0} max={9} /></div>
    <Result value={found ? `${key(s.x)}|${key(s.y)}|${key(buy[0] * s.x + buy[1] * s.y)}` : "sebanding"}>{found ? <>Belanja {buy[0]} kg jeruk dan {buy[1]} kg apel: {buy[0]}({idn(s.x)}) + {buy[1]}({idn(s.y)}) = <strong>{rp(buy[0] * s.x + buy[1] * s.y)}</strong>.</> : "Butuh dua nota yang tidak sebanding."}</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { model: ModelLab, solutions: SolutionsLab, graph: GraphLab, subst: SubstLab, elim: ElimLab, mixed: MixedLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-28" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 14))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const lbl = "label" in p && p.label ? <span className="font-bold"><M text={p.label} /></span> : null, aria = "label" in p ? plainMath(p.label) : "";
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{lbl}{p.pre && <span className="font-semibold">{p.pre}</span>}<In label={aria} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{lbl}
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "table": return <div className="space-y-1">{lbl}<div className="overflow-x-auto"><table className="border-collapse bg-base-100 text-center text-sm"><tbody>
      <tr className="border-b border-base-300"><th className="px-2 py-1 text-left">x</th>{p.xs.map(v => <td key={v} className="px-1 font-bold">{idn(v)}</td>)}</tr>
      <tr><th className="px-2 py-1 text-left">y</th>{p.xs.map((v, k) => <td key={v} className="p-1"><In label={`y untuk x = ${idn(v)}`} value={x[k]} set={s => put(k, s)} disabled={checked} w="w-14" /></td>)}</tr></tbody></table></div></div>;
    case "point": return <div className="flex flex-wrap items-center gap-1.5">{lbl}<span className="text-2xl">(</span><In label={`${aria} x`} value={x[0]} set={s => put(0, s)} disabled={checked} w="w-20" /><span className="text-2xl">,</span><In label={`${aria} y`} value={x[1]} set={s => put(1, s)} disabled={checked} w="w-20" /><span className="text-2xl">)</span></div>;
    case "eq": return <div className="space-y-1"><div className="flex flex-wrap items-center gap-1.5">{lbl}
      <In label={`${aria} koefisien ${p.x ?? "x"}`} value={x[0]} set={s => put(0, s)} disabled={checked} w="w-24" /><span className="text-lg font-extrabold">{p.x ?? "x"} +</span>
      <In label={`${aria} koefisien ${p.y ?? "y"}`} value={x[1]} set={s => put(1, s)} disabled={checked} w="w-24" /><span className="text-lg font-extrabold">{p.y ?? "y"} =</span>
      <In label={`${aria} konstanta`} value={x[2]} set={s => put(2, s)} disabled={checked} w="w-28" /></div>
      <p className="text-xs text-base-content/60">Tulis koefisien negatif dengan tanda minus, misalnya −1. Bentuk yang setara (dikali atau dibagi bilangan yang sama) juga benar.</p></div>;
    case "draw": case "pick": { const pts = drawPoints(value), many = p.kind === "pick";
      const pick = (px: number, py: number) => { if (checked) return; const on = pts.findIndex(p2 => p2[0] === px && p2[1] === py); const next = on >= 0 ? pts.filter((_, k) => k !== on) : many ? [...pts, [px, py] as [number, number]] : [...pts, [px, py] as [number, number]].slice(-2); set(next.map(p2 => p2.join(",")).join(";")); };
      const dx = !many && pts.length === 2 ? pts[1][0] - pts[0][0] : 0, line = !many && pts.length === 2 ? (dx === 0 ? [{ vx: pts[0][0] }] : [{ m: (pts[1][1] - pts[0][1]) / dx, c: pts[0][1] - ((pts[1][1] - pts[0][1]) / dx) * pts[0][0] }]) : [];
      return <div role="group" aria-label={aria} className="space-y-1">{lbl}<p className="text-xs text-base-content/60">{many ? "Ketuk setiap titik penyelesaian. Ketuk lagi untuk membatalkan." : "Ketuk dua titik potong garis kisi. Garis digambar melalui keduanya; ketuk lagi untuk membatalkan."}</p>
        <GraphView lines={line} r={p.r} onPick={pick} picked={pts} size="mx-auto w-full max-w-xs" label={`Bidang koordinat untuk ${aria}`} />
        <div className="flex flex-wrap items-center gap-2 text-sm">Titik: <strong>{pts.map(p2 => `(${p2[0]}, ${p2[1]})`).join(many ? ", " : " dan ") || "belum dipilih"}</strong>
          <button type="button" disabled={checked || !pts.length} className="btn btn-xs btn-ghost gap-1" onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus</button></div></div>; }
  }
}
function Answer({ q, value, record, checked }: { q: SQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeNineSystems() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 9, Bab 1</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Sistem Persamaan Linear Dua Variabel</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Membuat model dari situasi sehari-hari, mencari himpunan penyelesaian, lalu menyelesaikan dua persamaan sekaligus dengan metode grafik, substitusi, eliminasi, dan campuran.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-36"><GraphView lines={[{ m: -1, c: 3 }, { m: 1, c: 1 }]} points={[{ x: 1, y: 2 }]} r={4} size="w-full" label="" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Dua nota, dua harga</h2>
        <p className="mt-2 text-sm">Satu nota belanja belum cukup untuk mengetahui harga setiap barang. Dengan dua nota, harga itu bisa dihitung. Bab ini membahas cara menyusun dan menyelesaikan dua persamaan seperti itu.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-spldv">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-spldv" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map(x => <button key={x.code} type="button" aria-current={x === t ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${x === t ? "btn-success" : "btn-outline"}`} onClick={() => go(sections.findIndex(o => o.topic === x))}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {inTopic.map(({ x, i }) => <button key={x.code} type="button" role="tab" aria-selected={i === idx} onClick={() => go(i)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${i === idx ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{x.code} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={idx} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{s.code} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <div className="mt-4 border-s-4 border-success ps-3 text-sm leading-7"><p><span className="font-bold">Contoh. </span><M text={s.example} /></p>
              <ol className="mt-1 list-decimal space-y-0.5 ps-5">{s.work.map(w => <li key={w}><M text={w} /></li>)}</ol></div>
            <div className="mt-4 text-sm leading-7"><p className="font-bold">Perlu diperhatikan</p><ul className="list-disc space-y-1 ps-5">{s.notes.map(w => <li key={w}><M text={w} /></li>)}</ul></div>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={idx === 0} onClick={() => go(idx - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan {s.code}</button>
            {idx < sections.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(idx + 1)}>{sections[idx + 1].topic === t ? "Bagian berikutnya" : "Materi berikutnya"}<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<SQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 1"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
