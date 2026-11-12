"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { MathText } from "./GradeSevenRationalArt";
import { AlgebraTiles, AreaModel, BagGroup, DotX, Matches, Pool, TileFrame } from "./GradeSevenAlgebraArt";
import {
  assessment, cells, correct, formatAnswer, gcd, idn, ojek, polyText, practice, ready, SEP, splitParts, topics,
  type AQuestion, type Part, type Scene,
} from "@/data/grade-seven-algebra";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const on = "btn-success disabled:bg-success! disabled:text-success-content!";
const plain = (s: string) => s.replace(/\{([^}]+)\}/g, "$1");
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">{children}</output>;
/** Isian bilangan bertanda: tombol ± untuk negatif, kotak berisi angka (titik ribuan diabaikan, koma desimal). */
function SignedBox({ value, set, label, disabled, w = "w-20" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  const neg = value.startsWith("-"), body = value.replace("-", "");
  return <span className="inline-flex items-center gap-0.5">
    <button type="button" aria-label={`${label} ganti tanda`} aria-pressed={neg} disabled={disabled} onClick={() => set((neg ? "" : "-") + body)} className={`btn btn-sm btn-square h-10 w-8 text-lg font-extrabold ${neg ? "btn-info" : "btn-outline"}`}>{neg ? "−" : "+"}</button>
    <input aria-label={label} inputMode="decimal" placeholder="…" value={body} disabled={disabled} onChange={e => { const t = e.target.value.replace(/\./g, "").replace(/[^\d,]/g, "").replace(/,(?=.*,)/g, "").slice(0, 10); set((neg ? "-" : "") + t); }}
      className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-extrabold text-neutral focus:border-success focus:outline-none`} />
  </span>;
}
function Stepper({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-10 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}

/* ====================================================================== */
/* Peraga A                                                                */
/* ====================================================================== */
function MatchesLab() {
  const [n, setN] = useState(3);
  return <div className="space-y-3">
    <Stepper label="Banyak persegi" value={n} set={setN} min={1} max={8} />
    <div className="overflow-x-auto rounded-xl bg-base-100 p-3"><Matches n={n} /></div>
    <table className="w-full table-fixed border-collapse bg-base-100 text-center text-sm"><thead><tr className="bg-success text-success-content"><th className="p-1">Perhitungan</th><th className="p-1">Tetap</th><th className="p-1">Berubah</th><th className="p-1">Tetap</th></tr></thead>
      <tbody><tr><td className="p-1 font-bold">1 + ({n} × 3)</td><td>1</td><td className="font-extrabold text-info">{n}</td><td>3</td></tr></tbody></table>
    <Result value={String(1 + 3 * n)}>{n} persegi memerlukan 1 + ({n} × 3) = <strong>{1 + 3 * n} korek api</strong>. Bagian yang berubah adalah banyak persegi; jika diganti dengan n, banyak korek api = <strong>1 + 3n</strong>.</Result>
  </div>;
}
function PartsLab() {
  const [a, setA] = useState(-5);
  const [b, setB] = useState(1);
  const [c, setC] = useState(8);
  const terms = [{ t: a, s: "x", k: "ax" }, { t: b, s: "y", k: "by" }, { t: c, s: "", k: "c" }].filter(x => x.t !== 0);
  const text = polyText([a, b, c], ["x", "y", ""]);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Koefisien x" value={a} set={setA} min={-9} max={9} /><Stepper label="Koefisien y" value={b} set={setB} min={-9} max={9} /><Stepper label="Konstanta" value={c} set={setC} min={-20} max={20} /></div>
    <p className="rounded-xl bg-base-100 p-3 text-center font-mono text-3xl font-extrabold">{text}</p>
    <ul className="grid gap-1.5 text-sm sm:grid-cols-2">{terms.map(x => <li key={x.k} className="rounded-lg border border-base-300 bg-base-100 p-2">
      <strong>Suku {polyText([x.t], [x.s])}</strong>: {x.s ? <>koefisien <span className="font-bold text-info">{idn(x.t)}</span>, variabel <span className="font-bold text-success">{x.s}</span></> : <>konstanta <span className="font-bold text-warning">{idn(x.t)}</span></>}</li>)}</ul>
    <Result value={`${terms.length}|${text}`}>Bentuk aljabar <strong>{text}</strong> mempunyai <strong>{terms.length} suku</strong>.{a === 0 || b === 0 ? " Suku dengan koefisien 0 tidak ditulis." : ""}{Math.abs(b) === 1 ? ` Koefisien y adalah ${b}, walaupun angka 1 tidak ditulis.` : ""}</Result>
  </div>;
}
function BagsLab() {
  const [bags, setBags] = useState(3);
  const [cubes, setCubes] = useState(1);
  const [x, setX] = useState(4);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="Kantong" value={bags} set={setBags} min={1} max={6} /><Stepper label="Kubus lepas" value={cubes} set={setCubes} min={0} max={6} /><Stepper label="Isi satu kantong" value={x} set={setX} min={0} max={20} /></div>
    <div className="flex justify-center"><BagGroup bags={bags} cubes={cubes} /></div>
    <Result value={String(bags * x + cubes)}>Bentuk aljabarnya <strong>{polyText([bags, cubes], ["x", ""])}</strong>. Jika x = {x}: {bags} × {x}{cubes ? ` + ${cubes}` : ""} = <strong>{bags * x + cubes} kubus</strong>.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga B                                                                */
/* ====================================================================== */
function PoolLab() {
  const [s, setS] = useState(4);
  const forms = [["4s + 4", 4 * s + 4], ["4(s + 1)", 4 * (s + 1)], ["s + s + s + s + 4", s + s + s + s + 4], ["2(s + 2) + 2s", 2 * (s + 2) + 2 * s]] as const;
  return <div className="space-y-3">
    <Stepper label="Sisi kolam s" value={s} set={setS} min={1} max={10} unit=" m" />
    <div className="rounded-xl bg-base-100 p-3"><Pool s={s} /></div>
    <table className="w-full border-collapse bg-base-100 text-sm"><tbody>{forms.map(([f, v]) => <tr key={f} className="border-t border-base-300"><td className="p-1.5 font-mono font-bold">{f}</td><td className="p-1.5 text-end">{v} ubin</td></tr>)}</tbody></table>
    <Result value={String(4 * s + 4)}>Keempat bentuk memberi <strong>{4 * s + 4} ubin</strong> untuk s = {s}. Bentuk-bentuk ini ekuivalen. Ubin hijau adalah 4 ubin sudut.</Result>
  </div>;
}
function AreaLab() {
  const [mode, setMode] = useState<"one" | "two">("one");
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);
  const one = mode === "one";
  const expanded = one ? polyText([a, a * b], ["x", ""]) : polyText([1, b + c, b * c], ["x²", "x", ""]);
  return <div className="space-y-3">
    <div role="radiogroup" aria-label="Bentuk" className="join">{([["one", "a(x + b)"], ["two", "(x + b)(x + c)"]] as const).map(([k, t]) => <button key={k} type="button" role="radio" aria-checked={mode === k} onClick={() => setMode(k)} className={`btn join-item btn-sm ${mode === k ? "btn-success" : "btn-outline"}`}>{t}</button>)}</div>
    <div className="flex flex-wrap gap-3">{one && <Stepper label="a" value={a} set={setA} min={1} max={9} />}<Stepper label="b" value={b} set={setB} min={1} max={9} />{!one && <Stepper label="c" value={c} set={setC} min={1} max={9} />}</div>
    <div className="rounded-xl bg-base-100 p-2">
      {one ? <AreaModel cols={[{ label: "x", w: 5, color: "#7cc4dd" }, { label: String(b), w: Math.max(1.2, b * 0.6), color: "#b9e2ef" }]} rows={[{ label: String(a), h: 3 }]} />
        : <AreaModel cols={[{ label: "x", w: 5, color: "#7cc4dd" }, { label: String(c), w: Math.max(1.2, c * 0.6), color: "#b9e2ef" }]} rows={[{ label: "x", h: 5 }, { label: String(b), h: Math.max(1.2, b * 0.6) }]} />}
    </div>
    <Result value={expanded}>{one ? <>{a}(x + {b}) = {a} × x + {a} × {b} = <strong>{expanded}</strong>. Sebaliknya, faktor persekutuan terbesar dari {a}x dan {a * b} adalah {gcd(a, a * b)}.</>
      : <>(x + {b})(x + {c}) = x² + {c}x + {b}x + {b * c} = <strong>{expanded}</strong>. Empat bagian luasnya: x², {c}x, {b}x, dan {b * c}.</>}</Result>
  </div>;
}
function LikeLab() {
  const [p, setP] = useState({ a: 5, b: -1 });
  const [r, setR] = useState({ a: 2, b: 3 });
  const [op, setOp] = useState<"+" | "−">("−");
  const s = op === "+" ? 1 : -1, A = p.a + s * r.a, B = p.b + s * r.b;
  const right = op === "+" ? polyText([r.a, r.b], ["x", ""]) : polyText([-r.a, -r.b], ["x", ""]);
  return <div className="space-y-3">
    <div className="grid gap-2 sm:grid-cols-2">{([["Bentuk pertama", p, setP], ["Bentuk kedua", r, setR]] as const).map(([n, v, set]) => <div key={n} className="space-y-1.5 rounded-lg border border-base-300 bg-base-100 p-2">
      <p className="text-sm font-bold">{n}: ({polyText([v.a, v.b], ["x", ""])})</p>
      <Stepper label={`${n} koefisien x`} value={v.a} set={a => set({ ...v, a })} min={-8} max={8} /><Stepper label={`${n} konstanta`} value={v.b} set={b => set({ ...v, b })} min={-9} max={9} />
      <AlgebraTiles x={v.a} c={v.b} /></div>)}</div>
    <div role="radiogroup" aria-label="Operasi" className="join">{(["+", "−"] as const).map(o => <button key={o} type="button" role="radio" aria-checked={op === o} aria-label={o === "+" ? "Penjumlahan" : "Pengurangan"} onClick={() => setOp(o)} className={`btn join-item btn-sm w-12 text-lg ${op === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</div>
    <div className="rounded-xl bg-base-100 p-3"><p className="mb-1 text-sm font-bold">Hasil</p><AlgebraTiles x={A} c={B} /></div>
    <Result value={polyText([A, B], ["x", ""])}>({polyText([p.a, p.b], ["x", ""])}) {op} ({polyText([r.a, r.b], ["x", ""])}) = {polyText([p.a, p.b], ["x", ""])}{right.startsWith("−") ? ` ${right.replace("−", "− ")}` : ` + ${right}`} = ({idn(p.a)} {op} {idn(r.a)})x + ({idn(p.b)} {op} {idn(r.b)}) = <strong>{polyText([A, B], ["x", ""])}</strong>. Ubin merah bernilai negatif; ubin positif dan negatif yang sejenis saling menghapus.</Result>
  </div>;
}

/* ====================================================================== */
/* Peraga C                                                                */
/* ====================================================================== */
function TripLab() {
  const [t, setT] = useState(120);
  const v = 15, D = 5000, done = Math.min(D, v * t), left = D - done;
  return <div className="space-y-3">
    <Stepper label="Waktu t" value={t} set={setT} min={0} max={400} step={20} unit=" detik" />
    <div className="rounded-xl bg-base-100 p-3" role="img" aria-label={`Ditempuh ${done} m dari ${D} m`}>
      <div className="flex h-6 overflow-hidden rounded-full ring-1 ring-base-300"><span className="bg-info" style={{ width: `${(done / D) * 100}%` }} /><span className="flex-1 bg-base-200" /></div>
      <p className="mt-1 flex justify-between text-xs"><span>Rumah</span><span>Sekolah (5.000 m)</span></p>
    </div>
    <Result value={String(left)}>Ditempuh 15t = 15 × {t} = <strong>{idn(done)} m</strong>{v * t > D ? " (sudah sampai, model berhenti berlaku)" : ""}. Tersisa 5.000 − 15t = <strong>{idn(left)} m</strong>. {t} detik = {idn(t / 60)} menit.</Result>
  </div>;
}
const fruitRel = [{ name: "Apel", c: 3, rule: "t + 3" }, { name: "Jeruk", c: 0, rule: "t" }, { name: "Belimbing", c: -2, rule: "t − 2" }, { name: "Rambutan", c: -4, rule: "(t − 7) + 3 = t − 4" }, { name: "Anggur", c: -7, rule: "(t − 2) − 5 = t − 7" }];
function FruitsLab() {
  const [t, setT] = useState(9);
  const bad = fruitRel.filter(f => t + f.c <= 0);
  return <div className="space-y-3">
    <Stepper label="Berat jeruk t" value={t} set={setT} min={1} max={15} unit=" kg" />
    <ul className="space-y-1 rounded-xl bg-base-100 p-3 text-sm">{fruitRel.map(f => <li key={f.name} className="flex items-center gap-2"><span className="w-20 font-bold">{f.name}</span><span className="w-36 font-mono">{f.rule}</span>
      <span className={`h-3 rounded-sm ${t + f.c > 0 ? "bg-success" : "bg-error"}`} style={{ width: `${Math.max(2, (t + f.c) * 5)}px` }} /><span className="ms-auto tabular-nums">{t + f.c} kg</span></li>)}</ul>
    <Result value={bad.length ? "tidak" : "ya"}>Urutan dari paling ringan: anggur, rambutan, belimbing, jeruk, apel, karena konstantanya −7 &lt; −4 &lt; −2 &lt; 0 &lt; 3. {bad.length ? <>Untuk t = {t}, berat {bad.map(f => f.name.toLowerCase()).join(", ")} tidak positif, jadi <strong>tidak masuk akal</strong>.</> : <>Semua berat positif, jadi <strong>masuk akal</strong>.</>}</Result>
  </div>;
}
function OjekLab() {
  const [k, setK] = useState(5);
  const cost = ojek.map(o => o.admin + o.km * k), min = Math.min(...cost), best = ojek[cost.indexOf(min)].name, max = Math.max(...cost);
  return <div className="space-y-3">
    <Stepper label="Jarak k" value={k} set={setK} min={1} max={30} unit=" km" />
    <ul className="space-y-1.5 rounded-xl bg-base-100 p-3 text-sm">{ojek.map((o, j) => <li key={o.name} className="flex flex-wrap items-center gap-2">
      <span className="w-14 font-bold">{o.name}</span><span className="w-36 font-mono text-xs">{o.admin ? `${idn(o.admin)} + ${idn(o.km)}k` : `${idn(o.km)}k`}</span>
      <span className={`h-3 rounded-sm ${cost[j] === min ? "bg-success" : "bg-base-300"}`} style={{ width: `${(cost[j] / max) * 35}%` }} /><span className="ms-auto tabular-nums">Rp{idn(cost[j])}{cost[j] === min && <Check className="ms-1 inline size-4 text-success" aria-hidden="true" />}</span></li>)}</ul>
    <Result value={best}>Untuk {k} km, layanan termurah <strong>{best}</strong> (Rp{idn(min)}).</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { matches: MatchesLab, parts: PartsLab, bags: BagsLab, pool: PoolLab, area: AreaLab, like: LikeLab, trip: TripLab, fruits: FruitsLab, ojek: OjekLab };

/* ====================================================================== */
/* Gambar soal                                                             */
/* ====================================================================== */
function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "bags": return <div className="flex flex-wrap justify-center gap-2">{scene.groups.map((g, k) => <BagGroup key={k} {...g} size={30} />)}</div>;
    case "matches": return <div className="flex flex-wrap items-end justify-center gap-4">{scene.counts.map(n => <figure key={n} className="flex flex-col items-center"><Matches n={n} unit={20} /><figcaption className="text-xs font-bold">{n} persegi</figcaption></figure>)}</div>;
    case "frame": return <div className="flex flex-wrap items-end justify-center gap-4">{scene.sizes.map(n => <figure key={n} className="flex flex-col items-center"><TileFrame n={n} /><figcaption className="text-xs font-bold">Ukuran {n}</figcaption></figure>)}</div>;
    case "dots": return <div className="flex flex-wrap items-end justify-center gap-5">{scene.counts.map(n => <figure key={n} className="flex flex-col items-center"><DotX n={n} /><figcaption className="mt-1 text-xs font-bold">Pola {n}</figcaption></figure>)}</div>;
    case "table": return <div className="w-full overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm"><thead><tr className="bg-success text-success-content">{scene.head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>{scene.rows.map(r => <tr key={r[0]} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 tabular-nums ${j ? "" : "font-bold"}`}>{c}</td>)}</tr>)}</tbody></table></div>;
    case "text": return <ul className="w-full max-w-lg list-disc space-y-1 rounded-lg bg-base-100 py-2 pe-3 ps-7 text-sm">{scene.lines.map(l => <li key={l}><MathText text={l} /></li>)}</ul>;
    case "rect": return <AreaModel cols={[{ label: scene.w, w: 5, color: "#7cc4dd" }]} rows={[{ label: scene.h, h: 3 }]} />;
  }
}

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  const L = plain("label" in p ? p.label : "");
  switch (p.kind) {
    case "poly": return <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1.5 font-bold"><span className="me-1"><MathText text={p.label} /></span>
        {p.terms.map((t, k) => <span key={k} className="inline-flex items-center gap-1">{k > 0 && <span className="text-lg">+</span>}<SignedBox w={Math.abs(p.coef[k]) >= 10000 ? "w-28" : "w-16"} label={`${L} ${t ? `koefisien ${t}` : "konstanta"}`} value={x[k]} set={v => put(k, v)} disabled={checked} />{t && <span className="font-mono text-lg">{t}</span>}</span>)}</div>
      <p className="text-xs text-base-content/60">Pakai tombol ± untuk bilangan negatif. Tulis 0 jika suku itu tidak ada, dan 1 jika koefisiennya 1.</p></div>;
    case "factor": return <div className="flex flex-wrap items-center gap-1 font-bold"><span className="me-1"><MathText text={p.label} /></span>
      <SignedBox w="w-14" label={`${L} faktor`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-xl">(</span>
      <SignedBox w="w-14" label={`${L} koefisien ${p.v}`} value={x[1]} set={v => put(1, v)} disabled={checked} /><span className="font-mono text-lg">{p.v} +</span>
      <SignedBox w="w-14" label={`${L} konstanta`} value={x[2]} set={v => put(2, v)} disabled={checked} /><span className="text-xl">)</span></div>;
    case "binom": return <div className="flex flex-wrap items-center gap-1 font-bold"><span className="me-1"><MathText text={p.label} /></span>
      {[0, 1].map(k => <span key={k} className="inline-flex items-center gap-1"><span className="font-mono text-lg">({p.v} +</span><SignedBox w="w-14" label={`${L} bilangan ${k + 1}`} value={x[k]} set={v => put(k, v)} disabled={checked} /><span className="text-xl">)</span></span>)}</div>;
    case "num": return <div className="flex flex-wrap items-center gap-2 font-bold"><span><MathText text={p.label} /></span><SignedBox w={Math.abs(p.value) >= 10000 ? "w-32" : "w-20"} label={L} value={value} set={set} disabled={checked} />{p.unit}</div>;
    case "table": { let k = 0;
      return <div className="space-y-2">{p.rows.map((row, r) => <div key={r} className="rounded-lg border border-base-300 p-2">
        <p className="mb-1.5 font-mono text-sm font-bold">{row[0]}</p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">{row.slice(1).map((c, jj) => { const j = jj + 1; if (c !== null) return <span key={j} className="text-sm">{p.head[0]} = {p.head[j]}: <strong>{c}</strong></span>; const idx = k++;
          return <label key={j} className="flex items-center gap-1 text-sm font-semibold"><span className="shrink-0 whitespace-nowrap font-mono">{p.head[0]} = {p.head[j]}</span><SignedBox w="w-14" label={`${row[0]} untuk ${p.head[0]} = ${p.head[j]}`} value={x[idx]} set={v => put(idx, v)} disabled={checked} /></label>; })}</div></div>)}</div>; }
    case "order": { const seq = value ? value.split(";") : [];
      return <div className="space-y-2"><p className="text-sm font-bold">{p.label}: ketuk berurutan</p>
        <ol className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border-2 border-dashed border-orange-300 p-1.5" aria-label="Urutan yang dipilih">{seq.map((s, k) => <li key={s} className="badge badge-success badge-lg">{k + 1}. {s}</li>)}</ol>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" disabled={checked || seq.includes(o)} onClick={() => set([...seq, o].join(";"))} className="btn btn-sm btn-outline">{o}</button>)}
          <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={checked || !seq.length} onClick={() => set(seq.slice(0, -1).join(";"))}><Undo2 className="size-4" aria-hidden="true" />Batal satu</button></div></div>; }
    case "select": { const sel = value ? value.split(",").map(Number) : [];
      return <div className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
        <div role="group" aria-label={p.label} className="flex flex-wrap gap-1.5">{p.options.map((o, k) => { const s = sel.includes(k);
          return <button key={o} type="button" aria-pressed={s} disabled={checked} onClick={() => set((s ? sel.filter(y => y !== k) : [...sel, k]).sort((a, b) => a - b).join(","))} className={`btn btn-sm font-mono ${s ? on : "btn-outline"}`}>{o}</button>; })}</div>
        <p className="text-xs text-base-content/60">Ketuk semua yang benar. Ketuk lagi untuk membatalkan. Dipilih {sel.length}.</p></div>; }
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="group" aria-label={plain(r.text)} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center">
      <span className="font-mono text-sm font-bold sm:w-64"><MathText text={r.text} /></span>
      <div className="flex flex-wrap gap-1">{p.options.map(o => <button key={o} type="button" disabled={checked} aria-pressed={x[k] === o} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 py-1 ${x[k] === o ? on : "btn-outline"}`}>{o}</button>)}</div></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><MathText text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? on : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: AQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeSevenAlgebra() {
  const [topic, setTopic] = useState(0);
  const [sec, setSec] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], s = t.sections[sec], Lab = labs[s.lab];
  const go = (ti: number, si = 0) => { setTopic(ti); setSec(si); setMode("learn"); };
  const last = topic === topics.length - 1 && sec === t.sections.length - 1;
  const next = () => (sec < t.sections.length - 1 ? go(topic, sec + 1) : go(topic + 1, 0));
  const prev = () => (sec > 0 ? go(topic, sec - 1) : go(topic - 1, topics[topic - 1].sections.length - 1));
  const totalSections = topics.reduce((a, x) => a + x.sections.length, 0);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 7, Bab 4</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Bentuk Aljabar</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Gunakan huruf untuk kuantitas yang berubah atau belum diketahui, kenali suku, koefisien, dan konstanta, ubah bentuk aljabar dengan sifat distributif, lalu modelkan masalah sehari-hari.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><Matches n={4} unit={22} /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berapa korek api untuk 50 persegi?</h2>
        <p className="mt-2 text-sm">Arief menjawab tanpa menghitung satu per satu. Rahasianya adalah bentuk aljabar 1 + 3n, cara singkat yang juga dipakai perawat untuk menghitung tetesan infus.</p>
        <p className="mt-2 text-sm text-base-content/60">{totalSections} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-aljabar">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-aljabar" className="mt-8 scroll-mt-20">
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
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{s.steps.map(x => <li key={x}><MathText text={x} /></li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-sm leading-6"><MathText text={s.example} /></p>}
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
      </> : <GradeFourQuiz<AQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 4"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <MathText text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt + q.answer} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
