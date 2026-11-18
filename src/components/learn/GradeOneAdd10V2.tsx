"use client";

import { ArrowLeft, ArrowRight, Eye, Footprints, Merge, Minus, Plus, RotateCcw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Art, Many, VehicleArt } from "./GradeOneAdd10Art";
import { assessment, cells, correct, formatAnswer, practice, ready, SEP, splitParts, thingName, topics, type AQuestion, type Part, type Scene, type Thing } from "@/data/grade-one-add10-v2";

const ink = "#2b2320";

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
const Box = ({ children, label }: { children: ReactNode; label?: string }) => <div className="flex min-h-24 min-w-28 flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-4 border-orange-300 bg-white p-2">{children}{label && <span className="text-sm font-bold text-base-content/70">{label}</span>}</div>;
const size = (n: number) => (n > 8 ? "size-7 sm:size-10" : n > 4 ? "size-8 sm:size-11" : "size-10 sm:size-12");
function Dice({ n }: { n: number }) {
  const at: Record<number, [number, number][]> = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] };
  return <svg viewBox="0 0 40 40" className="size-20" role="img" aria-label={`kartu dengan ${n} titik`}><rect x="2" y="2" width="36" height="36" rx="6" fill="#fdf3c7" stroke={ink} strokeWidth="1.4" />{at[n].map(([x, y], i) => <circle key={i} cx={x * 10} cy={y * 10} r="3.6" fill="#e23d3d" />)}</svg>;
}
function Basket({ thing, inside }: { thing: Thing; inside: number }) {
  return <div className="relative h-28 w-36" role="img" aria-label={`${inside} ${thingName[thing]} di dalam keranjang`}>
    <svg viewBox="0 0 120 90" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M10 40h100l-10 44H20z" fill="#d6a85c" stroke={ink} strokeWidth="1.6" />{[52, 64, 76].map(y => <path key={y} d={`M13 ${y}h94`} stroke="#a87a32" strokeWidth="2" />)}<path d="M20 40C20 10 100 10 100 40" fill="none" stroke="#a87a32" strokeWidth="5" /></svg>
    <div className="absolute inset-x-5 top-6 flex flex-wrap justify-center gap-0.5">{Array.from({ length: inside }, (_, k) => <Art key={k} thing={thing} className="size-8" />)}</div>
  </div>;
}
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "boxes": return <div className="flex w-full max-w-lg gap-3">{scene.groups.map((g, i) => <Box key={i}><Many thing={g.thing} n={g.n} alt={g.alt} size={size(g.n)} /></Box>)}</div>;
    case "basket": return <div className="flex w-full max-w-md items-end justify-center gap-4 rounded-2xl border-4 border-orange-300 bg-white p-2"><Basket thing={scene.thing} inside={scene.inside} /><Many thing={scene.thing} n={scene.outside} size="size-10" label={`${scene.outside} ${thingName[scene.thing]} di luar keranjang`} /></div>;
    case "story": return <div className="flex w-full max-w-lg items-center gap-2">
      <Box label="mula-mula"><Many thing={scene.thing} n={scene.first} size={size(scene.first)} /></Box>
      <Plus className="size-8 shrink-0 text-success" strokeWidth={2.5} aria-label="datang lagi" />
      <Box label="datang lagi"><Many thing={scene.thing} n={scene.more} alt size={size(scene.more)} /></Box></div>;
    case "vehicles": return <div className="flex w-full max-w-lg flex-wrap items-end justify-center gap-3 rounded-2xl border-4 border-orange-300 bg-white p-2">{scene.items.flatMap(it => Array.from({ length: it.n }, (_, k) => <VehicleArt key={`${it.kind}${k}`} kind={it.kind} className="h-14 w-20" />))}</div>;
    case "dots": return <div className="flex gap-4"><Dice n={scene.a} /><Dice n={scene.b} /></div>;
  }
}

/* ====================================================================== */
/* Bagian interaktif bersama                                               */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled, round = false }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; round?: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 2))}
    className={`h-14 w-16 border-4 border-orange-400 bg-white text-center text-3xl font-extrabold text-neutral focus:border-success focus:outline-none ${round ? "rounded-full" : "rounded-2xl"}`} />;
}
/** Pasangan bilangan: lingkaran gabungan di kiri, dua lingkaran sebagian di kanan. */
function BondView({ whole, parts, values, set, disabled }: { whole: number | null; parts: [number | null, number | null]; values?: string[]; set?: (k: number, v: string) => void; disabled?: boolean }) {
  let k = 0;
  const slot = (n: number | null, label: string, big = false) => { if (n !== null) return <span className={`grid place-items-center rounded-full border-4 bg-white font-extrabold ${big ? "size-20 border-purple-400 text-4xl" : "size-16 border-orange-400 text-3xl"}`}>{n}</span>;
    const i = k++; return <span className={`grid place-items-center rounded-full border-4 bg-orange-50 ${big ? "size-20 border-purple-400" : "size-16 border-orange-400"}`}><NumBox round label={label} value={values?.[i] ?? ""} onChange={v => set?.(i, v)} disabled={disabled} /></span>; };
  const w = slot(whole, "Gabungan", true), a = slot(parts[0], "Sebagian pertama"), b = slot(parts[1], "Sebagian kedua");
  return <div className="flex items-center gap-1" role="group" aria-label="Pasangan bilangan">
    <div className="flex flex-col items-center">{w}<span className="text-xs font-bold text-purple-700">Gabungan</span></div>
    <svg viewBox="0 0 40 100" className="h-28 w-8" aria-hidden="true"><path d="M2 50L38 18M2 50l36 32" stroke="#a78bfa" strokeWidth="3" /></svg>
    <div className="flex flex-col gap-2">{[a, b].map((x, i) => <div key={i} className="flex items-center gap-1">{x}<span className="text-xs font-bold text-orange-700">Sebagian</span></div>)}</div>
  </div>;
}
/** Garis bilangan 0–10 dengan lompatan dari `start`. */
function HopLine({ start, to, pick, disabled, showHops = true }: { start: number; to: number; pick?: (n: number) => void; disabled?: boolean; showHops?: boolean }) {
  const W = 330, x = (n: number) => 15 + n * 30;
  return <div className="w-full max-w-xl">
    <svg viewBox={`0 0 ${W} 60`} className="h-auto w-full" aria-hidden="true">
      {showHops && to > start && Array.from({ length: to - start }, (_, i) => { const a = x(start + i), b = x(start + i + 1); return <path key={i} d={`M${a} 50 Q${(a + b) / 2} 10 ${b} 50`} fill="none" stroke="#16a34a" strokeWidth="2.4" markerEnd="url(#hopArrow)" />; })}
      <defs><marker id="hopArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#16a34a" /></marker></defs>
      <circle cx={x(start)} cy="50" r="7" fill="#f4a12f" stroke={ink} strokeWidth="1.2" />
    </svg>
    <div className="grid grid-cols-11 gap-0.5">{Array.from({ length: 11 }, (_, n) => <button key={n} type="button" disabled={disabled || !pick} aria-label={`Bilangan ${n}`} aria-pressed={to === n && n !== start} onClick={() => pick?.(n)}
      className={`grid h-11 place-items-center rounded-lg border-2 text-lg font-extrabold sm:text-xl ${n === start ? "border-orange-400 bg-orange-100" : to === n ? "border-success bg-success/20" : "border-base-300 bg-white"} disabled:opacity-100`}>{n}</button>)}</div>
  </div>;
}
/** Kepik: sayap kiri `left` titik, sayap kanan `right` titik. */
function Ladybug({ left, right }: { left: number; right: number }) {
  const spots = (n: number, side: -1 | 1) => Array.from({ length: n }, (_, i) => { const row = Math.floor(i / 2), col = i % 2; return <circle key={i} cx={60 + side * (14 + col * 16)} cy={48 + row * 18} r="6" fill={ink} />; });
  return <svg viewBox="0 0 120 150" className="h-40 w-32" role="img" aria-label={`kepik: sayap kiri ${left} titik, sayap kanan ${right} titik`}>
    <circle cx="60" cy="22" r="16" fill="#3a2a2a" /><circle cx="53" cy="17" r="3" fill="#fff" /><circle cx="67" cy="17" r="3" fill="#fff" />
    <path d="M60 32C28 32 14 62 18 96c4 30 24 48 42 48z" fill="#e23d3d" stroke={ink} strokeWidth="1.6" /><path d="M60 32c32 0 46 30 42 64-4 30-24 48-42 48z" fill="#ef5b5b" stroke={ink} strokeWidth="1.6" />
    {spots(left, -1)}{spots(right, 1)}
  </svg>;
}
/** Kelereng biru untuk bingkai 10 (varian kedua kelereng Bab 1 berwarna hijau, jadi dibuat khusus di sini). */
const BlueMarble = () => <svg viewBox="0 0 24 24" className="size-10" aria-hidden="true"><circle cx="12" cy="12" r="6.4" fill="#2f6fd6" stroke={ink} strokeWidth="1" /><path d="M8.4 13.4c2-2.8 5.2-3.6 7.4-2.2" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".55" /><circle cx="9.6" cy="9.4" r="1.5" fill="#fff" opacity=".75" /></svg>;
/** Bingkai 10: `filled` petak merah; petak lain bisa diisi biru. */
function TenFrame({ filled, blue, toggle, disabled }: { filled: number; blue: boolean[]; toggle?: (k: number) => void; disabled?: boolean }) {
  return <div role="group" aria-label="Bingkai 10" className="grid grid-cols-5 gap-1 rounded-xl border-4 border-sky-400 bg-white p-1">
    {Array.from({ length: 10 }, (_, k) => k < filled ? <span key={k} className="grid size-12 place-items-center rounded-lg bg-sky-50 sm:size-14"><Art thing="kelereng" className="size-10" /></span>
      : <button key={k} type="button" disabled={disabled || !toggle} aria-label={`Petak ${k + 1}`} aria-pressed={blue[k]} onClick={() => toggle?.(k)} className="grid size-12 place-items-center rounded-lg border-2 border-dashed border-sky-300 bg-white sm:size-14">{blue[k] && <BlueMarble />}</button>)}
  </div>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-2xl bg-success/10 p-3 text-xl font-bold leading-8">{children}</output>;
function Stepper({ label, value, set, min, max }: { label: string; value: number; set: (n: number) => void; min: number; max: number }) {
  return <span role="group" aria-label={label} className="flex items-center gap-2"><span className="text-base font-bold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-circle btn-outline" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="size-5" aria-hidden="true" /></button>
    <span className="min-w-8 text-center text-3xl font-extrabold tabular-nums">{value}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-circle btn-outline" disabled={value >= max} onClick={() => set(value + 1)}><Plus className="size-5" aria-hidden="true" /></button></span>;
}
const labThings: Thing[] = ["apel", "bola", "kupu"];
function GabungLab() {
  const [thing, setThing] = useState<Thing>("apel"), [a, setA] = useState(3), [b, setB] = useState(2), [merged, setMerged] = useState(false);
  const reset = (f: () => void) => { f(); setMerged(false); };
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Benda" className="flex flex-wrap gap-2">{labThings.map(t => <button key={t} type="button" role="radio" aria-checked={thing === t} onClick={() => reset(() => setThing(t))} className={`btn gap-1 ${thing === t ? "btn-success" : "btn-outline"}`}><Art thing={t} className="size-6" />{thingName[t]}</button>)}</div>
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Kotak 1" value={a} set={n => reset(() => setA(n))} min={0} max={5} /><Stepper label="Kotak 2" value={b} set={n => reset(() => setB(n))} min={0} max={5} /></div>
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8]">{merged ? <div className="w-full max-w-lg"><Box label="digabung"><span className="flex flex-wrap justify-center gap-0.5">{Array.from({ length: a + b }, (_, k) => <Art key={k} thing={thing} alt={k >= a} className="size-10 sm:size-12" />)}</span></Box></div>
      : <div className="flex w-full max-w-lg items-center gap-2"><Box><Many thing={thing} n={a} size="size-10 sm:size-12" /></Box><Plus className="size-8 shrink-0 text-success" strokeWidth={2.5} aria-hidden="true" /><Box><Many thing={thing} n={b} alt size="size-10 sm:size-12" /></Box></div>}</div>
    <button type="button" className="btn btn-success btn-lg gap-2" onClick={() => setMerged(!merged)}>{merged ? <><RotateCcw className="size-5" aria-hidden="true" />Pisahkan</> : <><Merge className="size-5" aria-hidden="true" />Gabungkan</>}</button>
    <Result value={`${a}+${b}:${merged ? 1 : 0}`}>{merged ? <>{a} + {b} = {a + b}. Semuanya ada {a + b} {thingName[thing]}.</> : <>Ada {a} dan {b} {thingName[thing]}. Ketuk Gabungkan.</>}</Result>
  </div>;
}
const caraTabs = [["pasangan", "Pasangan"], ["lompat", "Lompat maju"], ["berulang", "Berulang"], ["sepuluh", "Hasilnya 10"]] as const;
function CaraLab() {
  const [tab, setTab] = useState<(typeof caraTabs)[number][0]>("pasangan");
  const [n, setN] = useState(5), [split, setSplit] = useState<boolean[]>(Array(10).fill(false));
  const [start, setStart] = useState(3), [hops, setHops] = useState(0);
  const [d, setD] = useState(3), [blue, setBlue] = useState<boolean[]>(Array(10).fill(false)), [red, setRed] = useState(7);
  const k = split.slice(0, n).filter(Boolean).length, bl = blue.filter(Boolean).length;
  return <div className="space-y-3">
    <div role="tablist" aria-label="Cara penjumlahan" className="flex flex-wrap gap-1.5">{caraTabs.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`btn btn-sm ${tab === key ? "btn-success" : "btn-outline"}`}>{label}</button>)}</div>
    {tab === "pasangan" && <>
      <Stepper label="Banyak apel" value={n} set={v => { setN(v); setSplit(Array(10).fill(false)); }} min={2} max={10} />
      <div className="flex flex-wrap justify-center gap-1">{Array.from({ length: n }, (_, i) => <button key={i} type="button" aria-label={`Apel ${i + 1}`} aria-pressed={split[i]} onClick={() => setSplit(split.map((x, j) => (j === i ? !x : x)))} className="rounded-xl p-0.5 hover:bg-base-200"><Art thing="apel" alt={split[i]} className="size-11" /></button>)}</div>
      <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8]"><BondView whole={n} parts={[n - k, k]} /></div>
      <Result value={`pasangan:${n}:${k}`}>Ketuk apel untuk mengubahnya menjadi hijau. {n - k} + {k} = {n} dan {k} + {n - k} = {n}.</Result>
    </>}
    {tab === "lompat" && <>
      <Stepper label="Mulai dari" value={start} set={v => { setStart(v); setHops(0); }} min={0} max={9} />
      <HopLine start={start} to={start + hops} />
      <div className="flex gap-2"><button type="button" className="btn btn-success gap-2" disabled={start + hops >= 10} onClick={() => setHops(hops + 1)}><Footprints className="size-5" aria-hidden="true" />Lompat</button><button type="button" className="btn btn-ghost gap-1" onClick={() => setHops(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button></div>
      <Result value={`lompat:${start}:${hops}`}>{hops === 0 ? `Katak di angka ${start}. Ketuk Lompat.` : `${start} + ${hops} = ${start + hops}. Hitung maju: ${Array.from({ length: hops }, (_, i) => start + i + 1).join(", ")}.`}</Result>
    </>}
    {tab === "berulang" && <>
      <Stepper label="Titik di satu sayap" value={d} set={setD} min={0} max={5} />
      <div className="flex justify-center"><Ladybug left={d} right={d} /></div>
      <Result value={`berulang:${d}`}>Kedua sayap sama banyak: {d} + {d} = {d + d}.</Result>
    </>}
    {tab === "sepuluh" && <>
      <Stepper label="Kelereng merah" value={red} set={v => { setRed(v); setBlue(Array(10).fill(false)); }} min={0} max={10} />
      <div className="flex justify-center"><TenFrame filled={red} blue={blue} toggle={i => setBlue(blue.map((x, j) => (j === i ? !x : x)))} /></div>
      <Result value={`sepuluh:${red}:${bl}`}>{red + bl === 10 ? `Penuh! ${red} + ${bl} = 10.` : `${red} + ${bl} = ${red + bl}. Ketuk petak kosong sampai penuh 10.`}</Result>
    </>}
  </div>;
}
const storyThings: [Thing, string][] = [["burung", "di pohon"], ["ikan", "di kolam"], ["siswa", "di kelas"]];
function CeritaLab() {
  const [t, setT] = useState(0), [a, setA] = useState(4), [b, setB] = useState(2), [show, setShow] = useState(false);
  const [thing, where] = storyThings[t], name = thingName[thing];
  const reset = (f: () => void) => { f(); setShow(false); };
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-2 [@media(max-height:700px)]:[zoom:0.82]">
    <div role="radiogroup" aria-label="Cerita" className="flex flex-wrap gap-2">{storyThings.map(([th], i) => <button key={th} type="button" role="radio" aria-checked={t === i} onClick={() => reset(() => setT(i))} className={`btn gap-1 ${t === i ? "btn-success" : "btn-outline"}`}><Art thing={th} className="size-6" />{thingName[th]}</button>)}</div>
    <div className="flex flex-wrap justify-around gap-2"><Stepper label="Mula-mula" value={a} set={n => reset(() => setA(n))} min={1} max={6} /><Stepper label="Datang lagi" value={b} set={n => reset(() => setB(n))} min={1} max={4} /></div>
    <p className="rounded-2xl bg-base-100 p-3 text-xl font-bold leading-8">Ada {a} {name} {where}. Datang lagi {b} {name}. Berapa jumlah semua {name}?</p>
    <div className="flex justify-center"><SceneView scene={{ type: "story", thing, first: a, more: b, place: "pohon" }} /></div>
    <button type="button" className="btn btn-success btn-lg gap-2" onClick={() => setShow(!show)}><Eye className="size-5" aria-hidden="true" />{show ? "Tutup jawaban" : "Lihat penyelesaian"}</button>
    <Result value={`${a}+${b}:${show ? 1 : 0}`}>{show ? <>Penyelesaian: {a} + {b} = {a + b}. Semuanya ada {a + b} {name}.</> : "Tebak dulu hasilnya, lalu ketuk Lihat penyelesaian."}</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { gabung: GabungLab, cara: CaraLab, cerita: CeritaLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-2xl font-bold sm:text-3xl">{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => <span key={k} className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{b.trim() && <span>{b.trim()}</span>}</span>)}</p>; }
    case "bond": return <div className="flex justify-center"><BondView whole={p.whole} parts={p.parts} values={x} set={put} disabled={checked} /></div>;
    case "hop": return <div className="space-y-1"><p className="text-base text-base-content/70">Katak mulai di angka {p.start} (oranye). Ketuk angka tempat katak mendarat.</p><HopLine start={p.start} to={value ? Number(value) : p.start} pick={n => set(n === p.start ? "" : String(n))} disabled={checked} showHops={!!value && Number(value) > p.start} /><p className="text-2xl font-bold">{p.start} + {p.steps} = {value || "…"}</p></div>;
    case "wing": { const n = Number(value || 0);
      return <div className="flex flex-wrap items-center justify-center gap-4"><Ladybug left={p.n} right={n} />
        <div className="flex flex-col items-center gap-2"><span className="text-base font-bold">Titik sayap kanan</span>
          <span className="flex items-center gap-2"><button type="button" aria-label="Kurangi titik" className="btn btn-circle btn-outline" disabled={checked || n <= 0} onClick={() => set(n - 1 ? String(n - 1) : "")}><Minus className="size-5" aria-hidden="true" /></button>
            <span className="min-w-8 text-center text-3xl font-extrabold">{n}</span>
            <button type="button" aria-label="Tambah titik" className="btn btn-circle btn-outline" disabled={checked || n >= 6} onClick={() => set(String(n + 1))}><Plus className="size-5" aria-hidden="true" /></button></span></div></div>; }
    case "ten": { const blue = Array.from({ length: 10 }, (_, k) => (value ? value.split(",") : []).includes(String(k)));
      const sel = blue.map((b, k) => (b ? k : -1)).filter(k => k >= 0);
      // Nilai jawaban disimpan sebagai banyaknya petak; urutan petak disimpan setelah titik dua agar gambar tetap sama.
      return <div className="flex flex-col items-center gap-1"><TenFrame filled={p.filled} blue={blue} disabled={checked} toggle={k => { const s = blue[k] ? sel.filter(y => y !== k) : [...sel, k]; set(s.length ? s.join(",") : ""); }} /><span className="text-base font-bold">{sel.length} kelereng biru</span></div>; }
    case "pairs": return <div className="space-y-2">{Array.from({ length: p.count }, (_, k) => <p key={k} className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><NumBox label={`Pasangan ${k + 1} bilangan pertama`} value={x[2 * k]} onChange={v => put(2 * k, v)} disabled={checked} />+<NumBox label={`Pasangan ${k + 1} bilangan kedua`} value={x[2 * k + 1]} onChange={v => put(2 * k + 1, v)} disabled={checked} />= {p.sum}</p>)}</div>;
    case "pick": return <div role="group" aria-label={p.label} className="space-y-2"><p className="text-xl font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map(o => <button key={o} type="button" aria-pressed={value === o} disabled={checked} onClick={() => set(o)} className={`min-h-14 rounded-2xl border-4 px-4 text-2xl font-extrabold ${value === o ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: AQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.74]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeOneAdd10V2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], Lab = labs[t.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Penjumlahan sampai dengan 10</h1>
    <p className="mt-3 max-w-3xl text-lg text-base-content/70">Gabungkan benda, tulis tanda tambah, lalu coba berbagai cara menghitung dan soal cerita.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-2"><Many thing="apel" n={3} size="size-9" /><Plus className="size-7 text-success" strokeWidth={2.5} /><Many thing="apel" n={2} alt size="size-9" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Bermain lompat tali</h2>
        <p className="mt-2">Ada 4 anak bermain lompat tali. Datang lagi 2 anak. Berapa anak sekarang? Ayo belajar menjumlahkan.</p>
        <p className="mt-2 text-sm text-base-content/60">3 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-tambah-1">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-tambah-1" ref={area} className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<AQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 2"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.66]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
