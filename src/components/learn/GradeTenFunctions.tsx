"use client";

import { ArrowLeft, ArrowLeftRight, ArrowRight, Check, Minus, Plus, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Arrows, M, Machine, Plot, plainMath, SceneView } from "./GradeTenFunctionsArt";
import {
  assessment, cells, correct, factory, fmt, formatAnswer, idn, inverseDiagrams, machineRules, opF, opG, polyText, practice, ready,
  sections, SEP, sifatOptions, splitParts, topics, type Part, type PQuestion,
} from "@/data/grade-ten-functions";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, skip }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; skip?: number }) {
  const go = (d: number) => { let v = value + d; if (v === skip) v += d; if (v >= min && v <= max) set(v); };
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => go(-step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => go(step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set }: { label: string; options: readonly T[]; value: T; set: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-label={plainMath(o)} aria-checked={value === o} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 normal-case ${value === o ? "btn-success" : "btn-outline"}`}><M text={o} /></button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const Mark = ({ ok, children }: { ok: boolean; children: ReactNode }) => <li className="flex items-start gap-2">{ok ? <Check className="mt-1 size-4 shrink-0 text-success" strokeWidth={2} aria-label="ya" /> : <X className="mt-1 size-4 shrink-0 text-error" strokeWidth={2} aria-label="tidak" />}<span>{children}</span></li>;
const r3 = (v: number) => Math.round(v * 1000) / 1000;

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function MesinLab() {
  const [k, setK] = useState(machineRules[0].name); const [x, setX] = useState(5);
  const rule = machineRules.find(r => r.name === k)!, ok = rule.ok(x), y = ok ? rule.f(x) : NaN;
  return <div className="space-y-3">
    <Radios label="Aturan mesin" options={machineRules.map(r => r.name)} value={k} set={setK} />
    <Stepper label="x" value={x} set={setX} min={-5} max={8} />
    <Machine stages={[{ name: "f", rule: `f(x) = ${rule.name}` }]} input={`x = ${idn(x)}`} output={ok ? `f(${idn(x)}) = ${idn(r3(y))}` : "tidak terdefinisi"} lit={ok ? "ok" : "error"} />
    <Pair>
      <div className="overflow-x-auto"><table className="w-full border-collapse text-center text-xs"><tbody>
        <tr><th className="bg-base-200 p-1">x</th>{[-4, -3, -2, 0, 2, 4, 6].map(t => <td key={t} className={`p-1 ${t === x ? "font-bold text-success" : ""}`}>{idn(t)}</td>)}</tr>
        <tr className="border-t border-base-300"><th className="bg-base-200 p-1">f(x)</th>{[-4, -3, -2, 0, 2, 4, 6].map(t => <td key={t} className="p-1">{rule.ok(t) ? idn(r3(rule.f(t))) : "—"}</td>)}</tr></tbody></table></div>
      <p className="text-sm leading-7">Daerah asal: <M text={rule.domain} />. Tanda — berarti masukan ditolak mesin.</p>
    </Pair>
    <Result value={`${plainMath(k)}|${x}|${ok ? r3(y) : "x"}`}>{ok ? <M text={`f(${idn(x)}) = ${idn(r3(y))}. Nilai ini termasuk daerah hasil f.`} /> : <M text={`x = ${idn(x)} tidak termasuk daerah asal, jadi mesin tidak menghasilkan apa pun.`} />}</Result>
  </div>;
}

const ops = ["f + g", "f − g", "f × g", "f : g"] as const;
const opText: Record<(typeof ops)[number], string> = { "f + g": "x^{2} + x − 2", "f − g": "−x^{2} + x + 6", "f × g": "x^{3} + 2x^{2} − 4x − 8", "f : g": "{1/(x − 2)}, dengan x ≠ −2 dan x ≠ 2" };
function OperasiLab() {
  const [op, setOp] = useState<(typeof ops)[number]>("f + g"); const [x, setX] = useState(3);
  const fx = opF(x), gx = opG(x), val = op === "f + g" ? fx + gx : op === "f − g" ? fx - gx : op === "f × g" ? fx * gx : gx === 0 ? NaN : fx / gx;
  return <div className="space-y-3">
    <Radios label="Operasi" options={ops} value={op} set={setOp} />
    <Stepper label="x" value={x} set={setX} min={-4} max={4} />
    <Pair>
      <table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-base-200"><th className="p-1">f(x) = x + 2</th><th className="p-1">g(x) = x² − 4</th><th className="p-1">({plainMath(op)})(x)</th></tr></thead>
        <tbody><tr><td className="p-1 text-lg font-bold">{idn(fx)}</td><td className="p-1 text-lg font-bold">{idn(gx)}</td><td className="p-1 text-lg font-bold">{Number.isNaN(val) ? "tidak ada" : idn(r3(val))}</td></tr></tbody></table>
      <div className="space-y-1 text-sm leading-7"><p><M text={`(${op})(x) = ${opText[op]}`} /></p>
        <p>Daerah asal: {op === "f : g" ? <M text="semua bilangan real kecuali x = −2 dan x = 2 (penyebut nol)" /> : "semua bilangan real"}.</p></div>
    </Pair>
    <Result value={`${op}|${x}|${Number.isNaN(val) ? "x" : r3(val)}`}>{Number.isNaN(val) ? <M text={`g(${idn(x)}) = 0, jadi (f : g)(${idn(x)}) tidak terdefinisi.`} /> : <M text={`(${op})(${idn(x)}) = ${idn(fx)} ${op[2]} ${gx < 0 ? `(${idn(gx)})` : idn(gx)} = ${idn(r3(val))}`} />}</Result>
  </div>;
}

const orders = ["g∘f", "f∘g"] as const;
function KomposisiLab() {
  const [x, setX] = useState(200); const [o, setO] = useState<(typeof orders)[number]>("g∘f");
  const first = o === "g∘f" ? factory.f : factory.g, second = o === "g∘f" ? factory.g : factory.f, mid = first(x), out = second(mid);
  const st = o === "g∘f" ? [{ name: "Mesin I", rule: "f(x) = 0,9x − 1" }, { name: "Mesin II", rule: "g(x) = 0,8x + 2" }] : [{ name: "Mesin II", rule: "g(x) = 0,8x + 2" }, { name: "Mesin I", rule: "f(x) = 0,9x − 1" }];
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3"><Stepper label="Kayu x (ton)" value={x} set={setX} min={10} max={300} step={10} /><Radios label="Urutan" options={orders} value={o} set={setO} /></div>
    <Machine stages={st} input={`${idn(x)} ton`} output={`${idn(r3(out))} ton`} lit="ok" />
    <Pair>
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li>{st[0].name}: {idn(x)} → {idn(r3(mid))}</li>
        <li>{st[1].name}: {idn(r3(mid))} → {idn(r3(out))}</li>
      </ol>
      <p className="text-sm leading-7"><M text={o === "g∘f" ? "(g∘f)(x) = 0,8(0,9x − 1) + 2 = 0,72x + 1,2" : "(f∘g)(x) = 0,9(0,8x + 2) − 1 = 0,72x + 0,8"} /></p>
    </Pair>
    <Result value={`${x}|${o}|${r3(out)}`}><M text={`(${o})(${idn(x)}) = ${idn(r3(out))}. Urutan lain memberi ${idn(r3(o === "g∘f" ? factory.f(factory.g(x)) : factory.g(factory.f(x))))}, jadi g∘f ≠ f∘g.`} /></Result>
  </div>;
}

function SifatLab() {
  const names = sifatOptions.map(s => s.name);
  const [a, setA] = useState(names[0]); const [b, setB] = useState(names[1]);
  const A = sifatOptions.find(s => s.name === a)!, B = sifatOptions.find(s => s.name === b)!, xs = [-1, 0, 1, 2, 3], same = xs.every(x => A.fn(x) === B.fn(x));
  return <div className="space-y-3">
    <p className="text-sm">f(x) = 2x + 1, g(x) = x − 3, h(x) = 3x, I(x) = x</p>
    <div className="space-y-1"><p className="text-xs font-semibold">Komposisi pertama</p><Radios label="Komposisi pertama" options={names} value={a} set={setA} /></div>
    <div className="space-y-1"><p className="text-xs font-semibold">Komposisi kedua</p><Radios label="Komposisi kedua" options={names} value={b} set={setB} /></div>
    <Pair>
      <table className="w-full border-collapse text-center text-sm"><thead><tr className="bg-base-200"><th className="p-1">x</th>{xs.map(x => <th key={x} className="p-1">{idn(x)}</th>)}</tr></thead>
        <tbody>{[A, B].map((s, k) => <tr key={k} className="border-t border-base-300"><th className="p-1">{s.name}</th>{xs.map(x => <td key={x} className={`p-1 ${A.fn(x) === B.fn(x) ? "" : "font-bold text-error"}`}>{idn(s.fn(x))}</td>)}</tr>)}</tbody></table>
      <ul className="space-y-1 text-sm leading-7"><li><M text={`(${A.name})(x) = ${A.text}`} /></li><li><M text={`(${B.name})(x) = ${B.text}`} /></li></ul>
    </Pair>
    <Result value={`${a}|${b}|${same ? "sama" : "beda"}`}>{same ? `${a} dan ${b} memberi nilai yang sama untuk setiap x: rumusnya sama.` : `${a} dan ${b} berbeda. Angka merah menunjukkan x yang hasilnya tidak sama.`}</Result>
  </div>;
}

function InversLab() {
  const [k, setK] = useState(inverseDiagrams[0].name); const [rev, setRev] = useState(false);
  const d = inverseDiagrams.find(x => x.name === k)!;
  const from = rev ? d.B : d.A, links = rev ? d.links.map(([a, b]) => [b, a] as [number, number]) : d.links;
  const counts = from.map((_, i) => links.filter(l => l[0] === i).length), allHave = counts.every(c => c >= 1), noDouble = counts.every(c => c <= 1), isFn = allHave && noDouble;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2"><Radios label="Fungsi" options={inverseDiagrams.map(x => x.name)} value={k} set={x => { setK(x); }} />
      <button type="button" aria-pressed={rev} onClick={() => setRev(r => !r)} className={`btn btn-sm gap-1 ${rev ? "btn-success" : "btn-outline"}`}><ArrowLeftRight className="size-4" aria-hidden="true" />Balik panah</button></div>
    <Pair>
      <Arrows sets={rev ? [{ name: "B", items: d.B }, { name: "A", items: d.A }] : [{ name: "A", items: d.A }, { name: "B", items: d.B }]} stages={[{ label: rev ? `${k}⁻¹` : k, links }]} />
      <div className="space-y-2 text-sm leading-6"><p className="font-semibold">{k} {d.kind}</p>
        <ul className="space-y-1"><Mark ok={allHave}>Setiap anggota {rev ? "B" : "A"} punya pasangan</Mark><Mark ok={noDouble}>Tidak ada anggota {rev ? "B" : "A"} yang punya dua pasangan</Mark></ul></div>
    </Pair>
    <Result value={`${k}|${rev ? "balik" : "asli"}|${isFn ? "fungsi" : "bukan"}`}>{rev ? (isFn ? `${k}⁻¹ adalah fungsi, karena ${k} bijektif.` : `${k}⁻¹ hanya relasi, bukan fungsi, karena ${k} ${d.kind}.`) : `${k} adalah fungsi dari A ke B. Tekan Balik panah untuk melihat inversnya.`}</Result>
  </div>;
}

function RumusLab() {
  const [a, setA] = useState(2); const [b, setB] = useState(-3); const [x, setX] = useState(1);
  const f = (t: number) => a * t + b, fi = (t: number) => (t - b) / a, fx = f(x), back = fi(fx);
  const inv = `{(x ${b > 0 ? "−" : "+"} ${idn(Math.abs(b))})/${idn(a)}}`;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3"><Stepper label="a" value={a} set={setA} min={-4} max={4} skip={0} /><Stepper label="b" value={b} set={setB} min={-6} max={6} /><Stepper label="titik uji x" value={x} set={setX} min={-4} max={6} /></div>
    <Pair>
      <Plot pieces={[{ f, from: -8, to: 8, label: `f(x) = ${polyText([a, b])}` }, { f: fi, from: -8, to: 8, label: "f⁻¹(x)" }]} view={[-6, 6, -6, 6]} pts={[[x, fx, `(${idn(x)}, ${idn(r3(fx))})`], [fx, x, `(${idn(r3(fx))}, ${idn(x)})`]].filter(p => Math.abs(p[0] as number) <= 6 && Math.abs(p[1] as number) <= 6) as [number, number, string][]} diag />
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li><M text={`y = ${polyText([a, b])}`} /></li>
        <li><M text={`${idn(a)}x = y ${b > 0 ? "−" : "+"} ${idn(Math.abs(b))}, jadi x = {(y ${b > 0 ? "−" : "+"} ${idn(Math.abs(b))})/${idn(a)}}`} /></li>
        <li><M text={`f⁻¹(x) = ${inv}`} /></li>
        <li><M text={`Uji: f(${idn(x)}) = ${fmt(fx)}, lalu f⁻¹(${fmt(fx)}) = ${fmt(back)}`} /></li>
      </ol>
    </Pair>
    <Result value={`${a}|${b}|${x}|${r3(fx)}|${r3(back)}`}><M text={`f⁻¹(f(${idn(x)})) = ${fmt(back)}: titik kembali ke tempat semula. Grafik f⁻¹ adalah cerminan f terhadap garis putus-putus y = x.`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { mesin: MesinLab, operasi: OperasiLab, komposisi: KomposisiLab, sifat: SifatLab, invers: InversLab, rumus: RumusLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-20", wide }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string; wide?: boolean }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="text" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(wide ? /[^0-9,./;\-−\s]/g : /[^0-9,./\-−]/g, "").slice(0, wide ? 24 : 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-32" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "vals": return <div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-36" wide /></div>
      <p className="text-xs text-base-content/60">Pisahkan beberapa nilai dengan titik koma, misalnya 0; 4.</p></div>;
    case "poly": { const deg = p.coef.length - 1;
      return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><div className="flex flex-wrap items-center gap-1 text-base"><span className="me-1 font-bold"><M text={p.label} /></span>
        {p.coef.map((_, k) => { const d = deg - k; return <span key={k} className="inline-flex items-center gap-1">{k > 0 && <span>+</span>}<In label={`${plainMath(p.label)} koefisien ${d === 0 ? "konstanta" : d === 1 ? "x" : `x^${d}`}`} value={x[k]} set={v => put(k, v)} disabled={checked} w="w-20" />{d > 0 && <span className="italic"><M text={d === 1 ? "x" : `x^{${d}}`} /></span>}</span>; })}</div>
        <p className="text-xs text-base-content/60">Koefisien negatif ditulis dengan minus, suku yang tidak ada diisi 0. Desimal memakai koma.</p></div>; }
    case "lin": return <div role="group" aria-label={plainMath(p.label)} className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <span className="inline-flex flex-col items-center gap-1"><span className="flex items-center gap-1"><In label={`${plainMath(p.label)} koefisien x pembilang`} value={x[0]} set={v => put(0, v)} disabled={checked} w="w-20" /><span className="italic">x</span><span>+</span><In label={`${plainMath(p.label)} konstanta pembilang`} value={x[1]} set={v => put(1, v)} disabled={checked} w="w-24" /></span>
        <span className="h-0.5 w-full bg-neutral" aria-hidden="true" /><In label={`${plainMath(p.label)} penyebut`} value={x[2]} set={v => put(2, v)} disabled={checked} w="w-20" /></span></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      {p.pics ? <div className="grid gap-2 sm:grid-cols-3">{p.options.map((op, k) => <button key={op} type="button" aria-label={`Pilihan ${op}`} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`flex flex-col items-center gap-1 rounded-2xl border-4 bg-base-100 p-1.5 ${value === op ? "border-error bg-error/5" : "border-transparent ring-1 ring-base-300"}`}><span className="self-start font-extrabold">{op}.</span><SceneView scene={p.pics![k]} /></button>)}</div>
        : <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div>}</div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm h-auto min-h-8 ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTenFunctions() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 10, Bab 3</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Fungsi</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Notasi, daerah asal, dan daerah hasil fungsi, operasi aljabar pada fungsi, fungsi komposisi beserta sifatnya, serta fungsi invers dan cara menentukan rumusnya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true"><Machine stages={[{ name: "f", rule: "2x + 5" }]} input="5" output="15" lit="ok" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Masukan, aturan, luaran</h2>
        <p className="mt-2 text-sm">Tarif ojek dari jarak, kertas dari kayu, rupiah dari dolar: semuanya fungsi. Di bab ini kamu menggabungkan dua fungsi menjadi satu, lalu membalik prosesnya untuk mencari masukan dari hasil yang diketahui.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-fungsi">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-fungsi" className="mt-8 scroll-mt-20">
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
      </> : <GradeFourQuiz<PQuestion> key={`${mode}-${idx}`}
        questions={mode === "practice" ? practice[idx] : assessment}
        title={mode === "practice" ? `Latihan ${s.code} ${s.title}` : "Evaluasi Bab 3"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderText={text => <M text={text} />}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
