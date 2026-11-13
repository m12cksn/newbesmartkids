"use client";

import { ArrowLeft, ArrowRight, Eraser, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { ArrowDiagram, M, PlotGrid, SceneView, TaxiView } from "./GradeEightRelationsArt";
import {
  assessment, cells, correct, fact, formatAnswer, idn, isBijection, isFunction, label, normList, pairKey, pairsOf, pairsText, plain, practice, ready, relate, SEP, splitParts, topics,
  type Item, type Pair, type Part, type Rel, type RQuestion,
} from "@/data/grade-eight-relations";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label: lbl, value, set, min, max, step = 1 }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return <span role="group" aria-label={lbl} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{lbl}</span>
    <button type="button" aria-label={`${lbl} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min - 1e-9} onClick={() => set(Math.round((value - step) * 100) / 100)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${lbl} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max + 1e-9} onClick={() => set(Math.round((value + step) * 100) / 100)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string | number>({ label: lbl, options, value, set, show = String }: { label: string; options: readonly T[]; value: T; set: (v: T) => void; show?: (v: T) => ReactNode }) {
  return <div role="radiogroup" aria-label={lbl} className="flex flex-wrap gap-1.5">{options.map(o => <button key={String(o)} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 ${value === o ? "btn-success" : "btn-outline"}`}>{show(o)}</button>)}</div>;
}
const Box = ({ children }: { children: ReactNode }) => <div className="space-y-1 rounded-xl bg-base-100 p-3 text-base leading-8">{children}</div>;
const setText = (xs: Item[]) => `{${xs.map(label).join(", ")}}`;
const rangeOf = (r: Rel) => r.B.filter((_, j) => r.pairs.some(p => p[1] === j));
/** Ketuk kiri lalu kanan untuk menambah atau menghapus panah. */
function useArrows(initial: Pair[] = []) {
  const [pairs, setPairs] = useState<Pair[]>(initial);
  const [active, setActive] = useState<number | null>(null);
  const toggle = (i: number, j: number) => { const k = pairKey([i, j]); setPairs(pairs.some(p => pairKey(p) === k) ? pairs.filter(p => pairKey(p) !== k) : [...pairs, [i, j]]); };
  return { pairs, setPairs, active, onLeft: (i: number) => setActive(active === i ? null : i), onRight: (j: number) => { if (active !== null) { toggle(active, j); setActive(null); } } };
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
const isPrime = (k: number) => k > 1 && Array.from({ length: Math.floor(Math.sqrt(k)) - 1 }, (_, i) => i + 2).every(d => k % d !== 0);
const kinds = { "bilangan bulat": () => true, "bilangan asli": (k: number) => k >= 1, "bilangan cacah": (k: number) => k >= 0, "bilangan ganjil": (k: number) => Math.abs(k % 2) === 1, "bilangan prima": isPrime } as const;
type Kind = keyof typeof kinds;
function SetsLab() {
  const [lo, setLo] = useState(-2);
  const [hi, setHi] = useState(4);
  const [kind, setKind] = useState<Kind>("bilangan bulat");
  const xs = Array.from({ length: Math.max(0, hi - lo - 1) }, (_, i) => lo + 1 + i).filter(kinds[kind]);
  return <div className="space-y-3">
    <Radios label="Jenis bilangan" options={Object.keys(kinds) as Kind[]} value={kind} set={setKind} />
    <div className="flex flex-wrap gap-4"><Stepper label="Batas bawah" value={lo} set={v => setLo(Math.min(v, hi - 1))} min={-6} max={18} /><Stepper label="Batas atas" value={hi} set={v => setHi(Math.max(v, lo + 1))} min={-4} max={20} /></div>
    <Box>
      <p>Notasi: <strong>A = {"{"}x | {idn(lo)} &lt; x &lt; {idn(hi)}, x {kind}{"}"}</strong></p>
      <p>Deskripsi: A = {"{"}{kind} antara {idn(lo)} dan {idn(hi)}{"}"}</p>
      <p>Enumerasi: <strong>A = {xs.length ? setText(xs) : "{ }"}</strong></p>
    </Box>
    <Result value={`${kind}|${xs.length}`}>n(A) = {xs.length}. {xs.length ? `Batas ${idn(lo)} dan ${idn(hi)} tidak termasuk karena tandanya "<".` : "Tidak ada anggota: himpunan kosong."}</Result>
  </div>;
}

const kids = ["Andino", "Natalia", "Taufiq", "Panggabean"], foods = ["nasi goreng", "sate", "bakso", "rawon", "soto", "rujak cingur"];
function MenuLab() {
  const [order, setOrder] = useState(["soto", "bakso", "sate", "bakso"]);
  const r: Rel = { A: kids, B: foods, pairs: order.map((f, i) => [i, foods.indexOf(f)] as Pair) }, rg = rangeOf(r);
  return <div className="space-y-3">
    <div className="space-y-1.5">{kids.map((k, i) => <div key={k} className="flex flex-col gap-1 sm:flex-row sm:items-center"><span className="w-28 text-sm font-bold">{k}</span>
      <Radios label={`Pesanan ${k}`} options={foods} value={order[i]} set={f => setOrder(order.map((o, j) => (j === i ? f : o)))} /></div>)}</div>
    <div className="rounded-xl bg-base-100 p-2"><ArrowDiagram rel={r} name="memesan" aName="Anak" bName="Menu" className="mx-auto w-full max-w-sm" /></div>
    <Box><p>Domain = {setText(kids)}</p><p>Kodomain = {setText(foods)}</p><p><strong>Range = {setText(rg)}</strong></p></Box>
    <Result value={String(rg.length)}>Range berisi {rg.length} menu yang dipesan. {foods.length - rg.length} menu lain ada di kodomain tetapi tidak dipesan.</Result>
  </div>;
}

const rules = { "kurang dari": (a: number, b: number) => a < b, "lebih dari": (a: number, b: number) => a > b, "faktor dari": (a: number, b: number) => b % a === 0, "setengah dari": (a: number, b: number) => b === 2 * a } as const;
type Rule = keyof typeof rules;
function ReprLab() {
  const [rule, setRule] = useState<Rule>("kurang dari");
  const r = relate([2, 3, 5], [1, 4, 5, 6], rules[rule]);
  return <div className="space-y-3">
    <Radios label="Aturan relasi" options={Object.keys(rules) as Rule[]} value={rule} set={setRule} />
    <div className="grid gap-2 rounded-xl bg-base-100 p-2 sm:grid-cols-2"><ArrowDiagram rel={r} name={rule} className="w-full" /><PlotGrid rel={r} className="mx-auto w-full max-w-60" /></div>
    <Box><p className="break-words">Pasangan berurutan: <strong>{r.pairs.length ? pairsText(r) : "{ }"}</strong></p><p>Range = {setText(rangeOf(r))}</p></Box>
    <Result value={`${rule}|${r.pairs.length}`}>Relasi &quot;{rule}&quot; dari {"{2, 3, 5}"} ke {"{1, 4, 5, 6}"} memiliki {r.pairs.length} pasangan. Ketiga gambar menyajikan relasi yang sama.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function FuncLab() {
  const A = [1, 2, 3], B = ["a", "b"], arr = useArrows([[0, 0], [1, 1]]);
  const r: Rel = { A, B, pairs: arr.pairs }, fn = isFunction(r);
  const none = A.filter((_, i) => !arr.pairs.some(p => p[0] === i)), many = A.filter((_, i) => arr.pairs.filter(p => p[0] === i).length > 1);
  return <div className="space-y-3">
    <p className="text-sm">Ketuk anggota P di kiri, lalu anggota Q di kanan untuk menarik atau menghapus panah.</p>
    <div className="rounded-xl bg-base-100 p-2"><ArrowDiagram rel={r} aName="P" bName="Q" active={arr.active} onLeft={arr.onLeft} onRight={arr.onRight} className="mx-auto w-full max-w-sm" /></div>
    <div className="flex flex-wrap items-center gap-2"><span className="text-sm">Pasangan: <strong>{pairsText(r)}</strong></span>
      <button type="button" className="btn btn-xs btn-ghost gap-1" onClick={() => arr.setPairs([])}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua panah</button></div>
    <Result value={`${arr.pairs.length}|${fn ? "fungsi" : "bukan"}`}>{fn ? "Fungsi: setiap anggota P mempunyai tepat satu pasangan." : `Bukan fungsi. ${none.length ? `${none.join(", ")} belum punya pasangan. ` : ""}${many.length ? `${many.join(", ")} punya lebih dari satu pasangan.` : ""}`}</Result>
  </div>;
}

function CountLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const total = b ** a, A = ["p", "q", "r", "s"].slice(0, a), B = [2, 3, 4, 5].slice(0, b);
  const list: Item[][] = []; if (total <= 9) for (let k = 0; k < total; k++) { let t = k; list.push(A.map(() => { const v = B[t % b]; t = Math.floor(t / b); return v; })); }
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="Anggota A" value={a} set={setA} min={1} max={4} /><Stepper label="Anggota B" value={b} set={setB} min={1} max={4} /></div>
    <Box>
      <p>A = {setText(A)}, B = {setText(B)}</p>
      <p>Setiap anggota A memilih 1 dari {b} pasangan: {A.map(() => b).join(" × ")} = <strong><M text={`${b}^{${a}} = ${total}`} /></strong></p>
      {list.length > 0 && <ul className="grid gap-x-4 text-sm sm:grid-cols-2">{list.map((f, k) => <li key={k}>{`{${A.map((x, i) => `(${x}, ${f[i]})`).join("; ")}}`}</li>)}</ul>}
    </Box>
    <Result value={`${a}|${b}|${total}`}>Banyak fungsi dari A ke B adalah <M text={`n(B)^{n(A)} = ${b}^{${a}} = ${total}`} />. Dari B ke A: <M text={`${a}^{${b}} = ${a ** b}`} />.</Result>
  </div>;
}

function TaxiLab() {
  const [start, setStart] = useState(7500);
  const [per, setPer] = useState(3000);
  const [km, setKm] = useState(20);
  const cost = start + per * km, maxC = start + per * 40, X = (k: number) => 30 + (k / 40) * 260, Y = (c: number) => 110 - (c / maxC) * 96;
  return <div className="space-y-3">
    <div className="grid gap-2 sm:grid-cols-2"><Stepper label="Biaya awal (Rp)" value={start} set={setStart} min={5000} max={10000} step={500} /><Stepper label="Per km (Rp)" value={per} set={setPer} min={2000} max={5000} step={500} /><Stepper label="Jarak (km)" value={km} set={setKm} min={1} max={40} /></div>
    <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr]">
      <TaxiView start={`Rp${idn(start)}`} perKm={`Rp${idn(per)}`} />
      <svg viewBox="0 0 300 130" className="w-full rounded-xl bg-base-100" role="img" aria-label={`Grafik tarif taksi, titik ${km} km dengan tarif ${idn(cost)} rupiah`}>
        <line x1="30" y1="110" x2="295" y2="110" stroke="#33413b" /><line x1="30" y1="110" x2="30" y2="8" stroke="#33413b" />
        {[0, 10, 20, 30, 40].map(k => <text key={k} x={X(k)} y="124" fontSize="9" textAnchor="middle" fill="#1f3b30">{k}</text>)}
        {Array.from({ length: 41 }, (_, k) => <circle key={k} cx={X(k)} cy={Y(start + per * k)} r="1.6" fill="#7aa7d6" />)}
        <circle cx={X(km)} cy={Y(cost)} r="5" fill="#c2410c" /><text x="34" y="16" fontSize="9" fill="#1f3b30">tarif</text><text x="292" y="104" fontSize="9" textAnchor="end" fill="#1f3b30">km</text>
      </svg>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-72 border-collapse bg-base-100 text-center text-sm"><tbody>
      <tr className="border-b border-base-300"><th className="px-2 py-1 text-left">x (km)</th>{[1, 2, 3, 4, 5].map(k => <td key={k}>{k}</td>)}<td className="font-bold">{km}</td></tr>
      <tr><th className="px-2 py-1 text-left">B(x)</th>{[1, 2, 3, 4, 5].map(k => <td key={k}>{idn(start + per * k)}</td>)}<td className="font-bold">{idn(cost)}</td></tr></tbody></table></div>
    <Result value={String(cost)}>Rumus: B(x) = {idn(per)}x + {idn(start)}. Untuk {km} km: {idn(start)} + {km} × {idn(per)} = Rp{idn(cost)},00.</Result>
  </div>;
}

function ValueLab() {
  const [a, setA] = useState(4);
  const [b, setB] = useState(-3);
  const xs = [-2, -1, 0, 1, 2, 3], ys = xs.map(x => a * x + b), X = (x: number) => 150 + x * 24, Y = (y: number) => 110 - y * 4;
  const fx = `${a === 0 ? "" : a === 1 ? "x" : a === -1 ? "−x" : `${idn(a)}x`}${b === 0 ? (a === 0 ? "0" : "") : a === 0 ? idn(b) : b > 0 ? ` + ${idn(b)}` : ` − ${idn(-b)}`}`;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-4"><Stepper label="a" value={a} set={setA} min={-5} max={5} /><Stepper label="b" value={b} set={setB} min={-5} max={5} /></div>
    <p className="text-xl font-extrabold">f(x) = {fx}</p>
    <div className="overflow-x-auto"><table className="w-full min-w-72 border-collapse bg-base-100 text-center text-sm"><tbody>
      <tr className="border-b border-base-300"><th className="px-2 py-1 text-left">x</th>{xs.map(x => <td key={x}>{idn(x)}</td>)}</tr>
      <tr><th className="px-2 py-1 text-left">f(x)</th>{ys.map((y, k) => <td key={k} className="font-bold">{idn(y)}</td>)}</tr></tbody></table></div>
    <svg viewBox="0 0 300 220" className="w-full max-w-sm rounded-xl bg-base-100" role="img" aria-label={`Grafik f(x) = ${fx} pada domain −2 sampai 3`}>
      <line x1="10" x2="290" y1="110" y2="110" stroke="#33413b" /><line x1="150" x2="150" y1="6" y2="214" stroke="#33413b" />
      {xs.map(x => <text key={x} x={X(x)} y="122" fontSize="9" textAnchor="middle" fill="#1f3b30">{idn(x)}</text>)}
      {[-20, -10, 10, 20].map(y => <text key={y} x="144" y={Y(y) + 3} fontSize="9" textAnchor="end" fill="#1f3b30">{idn(y)}</text>)}
      <line x1={X(-2)} y1={Y(ys[0])} x2={X(3)} y2={Y(ys[5])} stroke="#9cc0e6" strokeDasharray="4 3" />
      {xs.map((x, k) => <circle key={x} cx={X(x)} cy={Y(ys[k])} r="4" fill="#1c64b5" />)}
    </svg>
    <Result value={`${a}|${b}|${ys.join(",")}`}>Daerah hasil = {setText(ys.slice().sort((p, q) => p - q).filter((v, i, s) => s.indexOf(v) === i))}. Titik-titiknya terletak pada satu garis lurus.</Result>
  </div>;
}

function TwoLab() {
  const [x1, setX1] = useState(-1);
  const [y1, setY1] = useState(-4);
  const [x2, setX2] = useState(2);
  const [y2, setY2] = useState(5);
  const dx = x2 - x1, a = dx === 0 ? NaN : (y2 - y1) / dx, b = y1 - a * x1, r = (v: number) => idn(Math.round(v * 100) / 100);
  const sgn = (v: number) => (v === 0 ? "" : v < 0 ? `− ${idn(-v)}` : `+ ${idn(v)}`);
  const ka = (c: number) => (c === 1 ? "a" : c === -1 ? "−a" : `${idn(c)}a`);
  return <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><Stepper label="x₁" value={x1} set={setX1} min={-5} max={5} /><Stepper label="f(x₁)" value={y1} set={setY1} min={-20} max={20} /><Stepper label="x₂" value={x2} set={setX2} min={-5} max={5} /><Stepper label="f(x₂)" value={y2} set={setY2} min={-20} max={20} /></div>
    {dx === 0 ? <p className="rounded-lg bg-warning/15 p-3 text-sm">Kedua nilai x sama. Pilih dua nilai x yang berbeda.</p> :
      <ol className="list-decimal space-y-1 rounded-xl bg-base-100 py-3 pe-3 ps-8 text-base">
        <li>f({idn(x1)}) = {idn(y1)}: {ka(x1)} + b = {idn(y1)}</li>
        <li>f({idn(x2)}) = {idn(y2)}: {ka(x2)} + b = {idn(y2)}</li>
        <li>Dikurangkan: {ka(dx)} = {idn(y2 - y1)}, jadi <strong>a = {r(a)}</strong></li>
        <li>b = {idn(y1)} − ({r(a)})({idn(x1)}) = <strong>{r(b)}</strong></li>
        <li className="font-bold">f(x) = {r(a)}x {sgn(Math.round(b * 100) / 100)}</li>
      </ol>}
    <Result value={dx === 0 ? "sama" : `${r(a)}|${r(b)}`}>{dx === 0 ? "Belum dapat ditentukan." : `Rumus fungsinya f(x) = ${r(a)}x ${sgn(Math.round(b * 100) / 100)}. Periksa: f(${idn(x2)}) = ${r(a * x2 + b)}.`}</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function OneLab() {
  const A = ["Ahmad", "As'ari", "Tohir", "Taufiq", "Wati"], B = [219, 224, 258, 279, 292], arr = useArrows();
  const r: Rel = { A, B, pairs: arr.pairs }, fn = isFunction(r), bij = isBijection(r);
  const truth: Record<string, number> = { Ahmad: 219, "As'ari": 279, Tohir: 292, Taufiq: 258, Wati: 224 }, match = bij && arr.pairs.every(([i, j]) => truth[A[i]] === B[j]);
  return <div className="space-y-3">
    <p className="text-sm">Nomor induk: Ahmad 219, As&apos;ari 279, Tohir 292, Taufiq 258, Wati 224. Ketuk nama, lalu nomornya.</p>
    <div className="rounded-xl bg-base-100 p-2"><ArrowDiagram rel={r} aName="Siswa" bName="Nomor induk" active={arr.active} onLeft={arr.onLeft} onRight={arr.onRight} className="mx-auto w-full max-w-sm" /></div>
    <button type="button" className="btn btn-xs btn-ghost gap-1" onClick={() => arr.setPairs([])}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua panah</button>
    <Result value={`${arr.pairs.length}|${bij ? "ya" : "belum"}`}>{bij ? `Korespondensi satu-satu: setiap siswa dan setiap nomor tepat satu pasangan.${match ? " Semua pasangan sesuai data." : " Ada pasangan yang belum sesuai data."}` : fn ? "Sudah fungsi, tetapi ada nomor yang dipakai dua kali atau belum dipakai." : "Belum fungsi: setiap siswa harus punya tepat satu nomor."}</Result>
  </div>;
}

const perms = (xs: string[]): string[][] => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map(p => [x, ...p])));
function FactLab() {
  const [nn, setN] = useState(3);
  const B = ["a", "b", "c"].slice(0, nn), list = nn <= 3 ? perms(B) : [];
  return <div className="space-y-3">
    <Stepper label="Banyak anggota n" value={nn} set={setN} min={1} max={10} />
    <Box>
      <p><strong>{nn}! = {Array.from({ length: nn }, (_, k) => nn - k).join(" × ")} = {idn(fact(nn))}</strong></p>
      {list.length > 0 && <ol className="grid list-decimal gap-x-6 ps-6 text-sm sm:grid-cols-2">{list.map(p => <li key={p.join("")}>{`{${p.map((b, i) => `(${i + 1}, ${b})`).join("; ")}}`}</li>)}</ol>}
      {nn > 3 && <p className="text-sm text-base-content/70">Anggota pertama punya {nn} pilihan, anggota kedua {nn - 1} pilihan, dan seterusnya.</p>}
    </Box>
    <Result value={`${nn}|${fact(nn)}`}>Jika n(A) = n(B) = {nn}, ada {idn(fact(nn))} korespondensi satu-satu dari A ke B.</Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { sets: SetsLab, menu: MenuLab, repr: ReprLab, isfunc: FuncLab, count: CountLab, taxi: TaxiLab, value: ValueLab, two: TwoLab, one: OneLab, fact: FactLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label: lbl, disabled, w = "w-32" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={lbl} value={value} disabled={disabled} placeholder="…" inputMode="decimal" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,.\-−]/g, "").slice(0, 14))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
function ArrowAnswer({ p, value, set, checked }: { p: Extract<Part, { kind: "arrows" }>; value: string; set: (v: string) => void; checked: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const pairs = pairsOf(normList(value)), r: Rel = { ...p.rel, pairs };
  const onRight = (j: number) => { if (active === null || checked) return; const k = pairKey([active, j]), keys = pairs.map(pairKey); set(normList((keys.includes(k) ? keys.filter(x => x !== k) : [...keys, k]).join(","))); setActive(null); };
  return <div role="group" aria-label={plain(p.label)} className="space-y-1">
    <p className="text-xs text-base-content/60">Ketuk anggota kiri, lalu anggota kanan. Ketuk pasangan yang sama untuk menghapus panah.</p>
    <ArrowDiagram rel={r} name={p.name} active={active} onLeft={i => !checked && setActive(active === i ? null : i)} onRight={onRight} className="mx-auto w-full max-w-sm" />
    <button type="button" disabled={checked || !pairs.length} className="btn btn-xs btn-ghost gap-1" onClick={() => set("")}><Eraser className="size-3.5" aria-hidden="true" />Hapus semua panah</button>
  </div>;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const lbl = "label" in p && p.label ? <span className="font-bold"><M text={p.label} /></span> : null;
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2">{lbl}{p.pre && <span className="font-semibold">{p.pre}</span>}<In label={plain(p.label)} value={value} set={set} disabled={checked} />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1">{lbl}
      {p.pics ? <div className="grid gap-2 sm:grid-cols-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex items-center gap-2 rounded-2xl border-4 bg-base-100 p-2 text-left ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="font-extrabold">{op}.</span><span className="min-w-0 flex-1"><SceneView scene={p.pics![k]} /></span></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plain(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "pick": { const on = value ? normList(value).split(",") : [];
      const toggle = (k: string) => set(normList((on.includes(k) ? on.filter(y => y !== k) : [...on, k]).join(",")));
      return <div className="space-y-2"><p className="text-lg">{lbl} <strong>{"{"}{on.map(k => label(p.options[Number(k)])).join(", ")}{"}"}</strong></p>
        <div role="group" aria-label={plain(p.label)} className="flex flex-wrap gap-1.5">{p.options.map((o, k) => <button key={k} type="button" disabled={checked} aria-pressed={on.includes(String(k))} onClick={() => toggle(String(k))} className={`h-9 min-w-10 rounded-lg border-2 px-2 text-sm font-bold ${on.includes(String(k)) ? "border-success bg-success text-success-content" : "border-base-300 bg-base-100"}`}>{label(o)}</button>)}</div></div>; }
    case "arrows": return <div className="space-y-1">{lbl}<ArrowAnswer p={p} value={value} set={set} checked={checked} /></div>;
    case "plot": { const pairs = pairsOf(normList(value));
      const toggle = (a: number, b: number) => { if (checked) return; const k = pairKey([a, b]), keys = pairs.map(pairKey); set(normList((keys.includes(k) ? keys.filter(y => y !== k) : [...keys, k]).join(","))); };
      return <div role="group" aria-label={plain(p.label)} className="space-y-1">{lbl}<p className="text-xs text-base-content/60">Ketuk titik potong untuk menandai pasangan; ketuk lagi untuk menghapus.</p>
        <PlotGrid rel={{ ...p.rel, pairs }} onToggle={toggle} className="mx-auto w-full max-w-xs" /></div>; }
    case "table": return <div className="space-y-1">{lbl}<div className="overflow-x-auto"><table className="border-collapse bg-base-100 text-center text-sm"><tbody>
      <tr className="border-b border-base-300"><th className="px-2 py-1 text-left">x</th>{p.xs.map(v => <td key={String(v)} className="px-1 font-bold">{label(v)}</td>)}</tr>
      <tr><th className="px-2 py-1 text-left">{p.head}(x)</th>{p.xs.map((v, k) => <td key={String(v)} className="p-1"><In label={`${p.head}(${label(v)})`} value={x[k]} set={s => put(k, s)} disabled={checked} w="w-14" /></td>)}</tr></tbody></table></div></div>;
    case "linear": return <div className="flex flex-wrap items-center gap-2">{lbl}<span className="text-lg font-extrabold">{p.f}(x) =</span>
      <In label={`${plain(p.label)} a`} value={x[0]} set={s => put(0, s)} disabled={checked} w="w-24" /><span className="text-lg font-extrabold">x +</span>
      <In label={`${plain(p.label)} b`} value={x[1]} set={s => put(1, s)} disabled={checked} w="w-24" />
      <p className="w-full text-xs text-base-content/60">Isi b negatif dengan tanda minus, misalnya −5.</p></div>;
  }
}
function Answer({ q, value, record, checked }: { q: RQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeEightRelations() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  const total = topics.reduce((a, x) => a + x.sections.length, 0);
  const hero: Rel = { A: ["Ani", "Budi", "Cici"], B: ["Pramuka", "PMR"], pairs: [[0, 0], [1, 1], [2, 0]] };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 8, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Relasi dan Fungsi</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Memasangkan anggota dua himpunan: menyajikan relasi, mengenali fungsi, menghitung nilai dan rumus fungsi, serta korespondensi satu-satu.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-48"><ArrowDiagram rel={hero} aName="Siswa" bName="Ekskul" className="w-full" ariaLabel="" /></div>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Siapa berpasangan dengan apa</h2>
        <p className="mt-2 text-sm">Setiap siswa punya satu kursi, satu nomor induk, dan bisa punya beberapa kesukaan. Bab ini membahas kapan sebuah pasangan disebut relasi, kapan disebut fungsi, dan kapan disebut korespondensi satu-satu.</p>
        <p className="mt-2 text-sm text-base-content/60">{total} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-relasi">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-relasi" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal text-left ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div role="tablist" aria-label={`Bagian ${t.title}`} className="mb-4 flex flex-wrap gap-1.5 border-b border-base-300 pb-2">
          {t.sections.map((x, j) => <button key={x.title} type="button" role="tab" aria-selected={j === sec} onClick={() => go(topic, j)} className={`rounded-md px-2.5 py-1 text-left text-sm font-semibold ${j === sec ? "bg-info/15 text-info-content ring-1 ring-info/40" : "text-base-content/70 hover:bg-base-200"}`}>{t.code}.{j + 1} {x.title}</button>)}
        </div>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={`${topic}-${sec}`} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}.{sec + 1} {s.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><M text={x} /></li>)}</ol>
            <div className="mt-3 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Dalam kehidupan sehari-hari</p><p><M text={s.life} /></p></div>
            <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-7"><span className="font-bold">Contoh. </span><M text={s.example} /></p>
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong><M text={s.demo} /></p>
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
      </> : <GradeFourQuiz<RQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
