"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { Flat, M, Net, plainMath, projector, SceneView, Solid } from "./GradeTwelveDimensionArt";
import {
  assessment, cells, correct, dist2, formatAnswer, idn, lineChoices, lineFoot, planeFoot, planePresets, practice, ready, routeNet, sections, SEP,
  solidPoints, splitParts, surdText, topics, type Part, type PQuestion, type V3,
} from "@/data/grade-twelve-dimension";

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-7">{children}</output>;
function Stepper({ label, value, set, min, max, step = 1, unit = "" }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step?: number; unit?: string }) {
  return <span role="group" aria-label={label} className="inline-flex items-center gap-1 text-sm"><span className="font-semibold">{label}</span>
    <button type="button" aria-label={`${label} kurangi`} className="btn btn-xs btn-square btn-outline" disabled={value - step < min} onClick={() => set(value - step)}><Minus className="size-3.5" aria-hidden="true" /></button>
    <span className="min-w-9 text-center text-base font-extrabold tabular-nums">{idn(value)}{unit}</span>
    <button type="button" aria-label={`${label} tambah`} className="btn btn-xs btn-square btn-outline" disabled={value + step > max} onClick={() => set(value + step)}><Plus className="size-3.5" aria-hidden="true" /></button>
  </span>;
}
function Radios<T extends string>({ label, options, value, set, disabled = [] }: { label: string; options: readonly T[]; value: T; set: (v: T) => void; disabled?: readonly string[] }) {
  return <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">{options.map(o => <button key={o} type="button" role="radio" aria-label={plainMath(o)} aria-checked={value === o} disabled={disabled.includes(o)} onClick={() => set(o)} className={`btn btn-sm h-auto min-h-8 normal-case ${value === o ? "btn-success" : "btn-outline"}`}><M text={o} /></button>)}</div>;
}
const Pair = ({ children }: { children: ReactNode }) => <div className="grid items-start gap-3 rounded-xl bg-base-100 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">{children}</div>;
const r2 = (v: number) => Math.round(v * 100) / 100, r3 = (v: number) => Math.round(v * 1000) / 1000;
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
function RuteLab() {
  const [route, setRoute] = useState<string[]>(["A"]);
  const [found, setFound] = useState<[string, number][]>([]);
  const w = (a: string, b: string) => routeNet.edges.find(([x, y]) => (x === a && y === b) || (x === b && y === a))?.[2];
  const len = route.slice(1).reduce((s, k, i) => s + (w(route[i], k) ?? 0), 0), last = route[route.length - 1], done = last === "C";
  const add = (k: string) => { const next = [...route, k]; setRoute(next); if (k === "C") { const L = next.slice(1).reduce((s, x, i) => s + (w(next[i], x) ?? 0), 0); setFound(f => (f.some(([r]) => r === next.join("–")) ? f : [...f, [next.join("–"), L]])); } };
  const can = (k: string) => !done && !route.includes(k) && w(last, k) !== undefined;
  const best = found.length ? Math.min(...found.map(f => f[1])) : null;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-1.5"><span className="text-sm font-semibold">Lanjut ke kota</span>{["B", "C", "D"].map(k => <button key={k} type="button" className="btn btn-sm btn-outline" disabled={!can(k)} onClick={() => add(k)}>Kota {k}</button>)}
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setRoute(["A"])}>Ulang rute</button></div>
    <Pair>
      <Net nodes={routeNet.nodes} edges={routeNet.edges.map(([a, b, l]) => [a, b, `${l} km`])} path={route} />
      <div className="space-y-2 text-sm"><p>Rute sekarang: <strong>{route.join("–")}</strong> ({len} km)</p>
        <table className="w-full border-collapse text-left"><thead><tr className="bg-base-200"><th className="p-1">Rute A ke C yang sudah dicoba</th><th className="p-1 text-right">Panjang</th></tr></thead>
          <tbody>{found.map(([r, L]) => <tr key={r} className={`border-t border-base-300 ${L === best ? "font-bold text-success" : ""}`}><td className="p-1">{r}</td><td className="p-1 text-right">{L} km</td></tr>)}</tbody></table></div>
    </Pair>
    <Result value={`${route.join("–")}|${len}`}>{done ? `Rute ${route.join("–")} panjangnya ${len} km.${best !== null ? ` Rute terpendek yang sudah dicoba: ${best} km.` : ""} Jarak A ke C adalah rute yang paling pendek.` : "Pilih kota berikutnya sampai tiba di C."}</Result>
  </div>;
}

function KubusLab() {
  const [a, setA] = useState(4); const [P, setP] = useState<(typeof LETTERS)[number]>("A"); const [Q, setQ] = useState<(typeof LETTERS)[number]>("G");
  const pts = solidPoints("kubus", [a]), d2 = dist2(pts[P], pts[Q]), kind = d2 === 0 ? "titik yang sama" : d2 === a * a ? "rusuk" : d2 === 2 * a * a ? "diagonal sisi" : "diagonal ruang";
  return <div className="space-y-3">
    <Stepper label="Rusuk" value={a} set={setA} min={2} max={10} unit=" cm" />
    <div className="space-y-1"><p className="text-xs font-semibold">Titik pertama</p><Radios label="Titik pertama" options={LETTERS} value={P} set={setP} /></div>
    <div className="space-y-1"><p className="text-xs font-semibold">Titik kedua</p><Radios label="Titik kedua" options={LETTERS} value={Q} set={setQ} /></div>
    <Pair>
      <Solid shape="kubus" dims={[a]} segs={P !== Q ? [{ a: P, b: Q }] : []} highlight={[P, Q]} />
      <ol className="list-decimal space-y-1 ps-5 text-sm leading-7">
        <li>{P}{Q} adalah {kind}.</li>
        {kind === "diagonal sisi" && <li><M text={`${P}${Q} = √{${a}^{2} + ${a}^{2}} = ${surdText(d2)} cm`} /></li>}
        {kind === "diagonal ruang" && <><li><M text={`Diagonal sisi = ${surdText(2 * a * a)}`} /></li><li><M text={`${P}${Q} = √{(${surdText(2 * a * a)})^{2} + ${a}^{2}} = ${surdText(d2)} cm`} /></li></>}
        {kind === "rusuk" && <li>{P}{Q} = {a} cm</li>}
      </ol>
    </Pair>
    <Result value={`${P}${Q}|${a}|${r3(d2)}`}><M text={P === Q ? "Pilih dua titik yang berbeda." : `Jarak ${P} ke ${Q} = ${surdText(d2)} cm (${kind}).`} /></Result>
  </div>;
}

function TaliLab() {
  const [t, setT] = useState(50);
  const A: [number, number] = [0, 15], B: [number, number] = [20, 0], C: [number, number] = [0, 0], P: [number, number] = [A[0] + (t / 100) * (B[0] - A[0]), A[1] + (t / 100) * (B[1] - A[1])];
  const cp = Math.hypot(P[0], P[1]), perp = t === 36;
  return <div className="space-y-3">
    <Stepper label="Geser P" value={t} set={setT} min={0} max={100} step={2} unit="%" />
    <Pair>
      <Flat points={{ A, B, C, P }} segs={[["A", "B"], ["B", "C"], ["C", "A"], ["C", "P", true]]} right={perp ? [["C", "A", "B"], ["P", "C", "B"]] : [["C", "A", "B"]]} caption="AC = 15 cm, BC = 20 cm, AB = 25 cm" />
      <ul className="space-y-1 text-sm leading-7"><li>P berada {t}% dari A menuju B.</li><li><M text={`CP = ${idn(r2(cp))} cm`} /></li>
        <li><M text={`Jarak terpendek = {AC × BC/AB} = {15 × 20/25} = 12 cm`} /></li></ul>
    </Pair>
    <Result value={`${t}|${r2(cp)}|${perp ? "tegak" : "tidak"}`}><M text={perp ? "CP tegak lurus AB. Inilah jarak titik C ke garis AB: 12 cm." : `CP = ${idn(r2(cp))} cm, masih lebih panjang dari 12 cm. Geser P sampai CP tegak lurus AB.`} /></Result>
  </div>;
}

function GarisLab() {
  const [a, setA] = useState(4); const [P, setP] = useState<(typeof LETTERS)[number]>("A"); const [L, setL] = useState(lineChoices[0]);
  const pts = solidPoints("kubus", [a]), { d2, F } = lineFoot(pts[P], pts[L[0]], pts[L[1]]);
  return <div className="space-y-3">
    <Stepper label="Rusuk" value={a} set={setA} min={2} max={10} unit=" cm" />
    <div className="space-y-1"><p className="text-xs font-semibold">Titik</p><Radios label="Titik" options={LETTERS} value={P} set={setP} /></div>
    <div className="space-y-1"><p className="text-xs font-semibold">Garis</p><Radios label="Garis" options={lineChoices} value={L} set={setL} /></div>
    <Pair>
      <Solid shape="kubus" dims={[a]} extra={{ K: F as V3 }} segs={[{ a: L[0], b: L[1], color: "#1c64b5" }, ...(d2 > 1e-9 ? [{ a: P, b: "K" }] : [])]} highlight={[P]} />
      <ul className="space-y-1 text-sm leading-7"><li>K adalah proyeksi titik {P} pada garis {L}.</li><li>{P}K tegak lurus {L}.</li><li><M text={`Jarak ${P} ke ${L} = ${surdText(d2)} cm`} /></li></ul>
    </Pair>
    <Result value={`${P}|${L}|${r3(d2)}`}><M text={d2 < 1e-9 ? `Titik ${P} terletak pada garis ${L}, jaraknya 0.` : `Jarak titik ${P} ke garis ${L} = ${surdText(d2)} cm ≈ ${idn(r2(Math.sqrt(d2)))} cm.`} /></Result>
  </div>;
}

function ProyeksiLab() {
  const [q, setQ] = useState<[number, number]>([0, 0]);
  const P: V3 = [2, 1, 3], Q: V3 = [q[0], q[1], 0], d = Math.sqrt(dist2(P, Q)), perp = q[0] === 2 && q[1] === 1;
  const corners: V3[] = [[0, 0, 0], [4, 0, 0], [4, 3, 0], [0, 3, 0]], { to } = projector([...corners, P], -30, 25, 300, 220);
  const mv = (dx: number, dy: number) => setQ(([x, y]) => [Math.max(0, Math.min(4, x + dx)), Math.max(0, Math.min(3, y + dy))]);
  const pp = to(P), pq = to(Q), foot = to([2, 1, 0]);
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => mv(-1, 0)}><ArrowLeft className="size-4" aria-hidden="true" />Q ke kiri</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => mv(1, 0)}><ArrowRight className="size-4" aria-hidden="true" />Q ke kanan</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => mv(0, 1)}><ArrowUp className="size-4" aria-hidden="true" />Q ke belakang</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => mv(0, -1)}><ArrowDown className="size-4" aria-hidden="true" />Q ke depan</button>
    </div>
    <Pair>
      <svg viewBox="0 0 300 220" className="w-full max-w-sm" role="img" aria-label={`Titik P di atas bidang lantai, titik Q di lantai pada (${q[0]}, ${q[1]}), panjang PQ ${idn(r2(d))}`}>
        <polygon points={corners.map(c => { const p = to(c); return `${p.x},${p.y}`; }).join(" ")} fill="#2b8a3e" opacity="0.18" stroke="#2b8a3e" />
        {[1, 2, 3].map(x => { const a = to([x, 0, 0]), b = to([x, 3, 0]); return <line key={`x${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2b8a3e" opacity="0.3" />; })}
        {[1, 2].map(y => { const a = to([0, y, 0]), b = to([4, y, 0]); return <line key={`y${y}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#2b8a3e" opacity="0.3" />; })}
        <line x1={pp.x} y1={pp.y} x2={foot.x} y2={foot.y} stroke="#868e96" strokeDasharray="4 3" />
        <line x1={pp.x} y1={pp.y} x2={pq.x} y2={pq.y} stroke={perp ? "#2b8a3e" : "#d6336c"} strokeWidth="2.6" />
        <circle cx={pp.x} cy={pp.y} r="5" fill="#f59f00" stroke="#1f3b30" /><text x={pp.x + 8} y={pp.y - 6} fontSize="12" fontWeight="700" fill="#1f3b30">P (lampu)</text>
        <circle cx={pq.x} cy={pq.y} r="4" fill="#1c64b5" /><text x={pq.x + 7} y={pq.y + 14} fontSize="12" fontWeight="700" fill="#1c64b5">Q</text>
      </svg>
      <ul className="space-y-1 text-sm leading-7"><li>P berada 3 m di atas lantai.</li><li>Q = ({q[0]}, {q[1]}) di lantai.</li><li><M text={`PQ = ${idn(r3(d))} m`} /></li></ul>
    </Pair>
    <Result value={`${q[0]},${q[1]}|${r3(d)}|${perp ? "tegak" : "tidak"}`}>{perp ? "Q tepat di bawah P. PQ tegak lurus lantai dan paling pendek: 3 m. Inilah jarak titik P ke bidang lantai." : `PQ = ${idn(r3(d))} m, lebih panjang dari 3 m. Geser Q sampai tepat di bawah P.`}</Result>
  </div>;
}

function BidangLab() {
  const [k, setK] = useState(planePresets[0].name); const [a, setA] = useState(4);
  const pr = planePresets.find(p => p.name === k)!, pts = solidPoints("kubus", [a]), [A, B, C] = pr.plane.split("").map(c => pts[c]), { d2, F } = planeFoot(pts[pr.point], A, B, C);
  return <div className="space-y-3">
    <Radios label="Titik dan bidang" options={planePresets.map(p => p.name)} value={k} set={setK} />
    <Stepper label="Rusuk" value={a} set={setA} min={2} max={12} unit=" cm" />
    <Pair>
      <Solid shape="kubus" dims={[a]} plane={pr.plane.split("")} extra={{ K: F as V3 }} segs={[{ a: pr.point, b: "K" }]} highlight={[pr.point]} />
      <ul className="space-y-1 text-sm leading-7"><li>K adalah proyeksi {pr.point} pada bidang {pr.plane}.</li><li>{pr.point}K tegak lurus bidang {pr.plane}.</li><li><M text={`Jarak = ${surdText(d2)} cm`} /></li>
        <li className="text-base-content/70"><M text={`Bandingkan dengan rusuk ${a}: perbandingannya ${idn(r3(Math.sqrt(d2) / a))}.`} /></li></ul>
    </Pair>
    <Result value={`${pr.point}-${pr.plane}|${a}|${r3(d2)}`}><M text={`Jarak titik ${pr.point} ke bidang ${pr.plane} = ${surdText(d2)} cm. Ubah rusuk: jaraknya selalu kelipatan rusuk yang sama.`} /></Result>
  </div>;
}

const labs: Record<string, () => ReactNode> = { rute: RuteLab, kubus: KubusLab, tali: TaliLab, garis: GarisLab, proyeksi: ProyeksiLab, bidang: BidangLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function In({ value, set, label, disabled, w = "w-16" }: { value: string; set: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} value={value} disabled={disabled} placeholder="…" inputMode="text" autoCapitalize="none" spellCheck={false}
    onChange={e => set(e.target.value.replace(/[^0-9,./\-−]/g, "").slice(0, 12))}
    className={`h-10 ${w} rounded-lg border-2 border-orange-400 bg-white text-center text-lg font-bold text-neutral focus:border-success focus:outline-none`} />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value);
  const put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "num": return <div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span><In label={plainMath(p.label)} value={value} set={set} disabled={checked} w="w-28" />{p.unit && <span className="font-semibold">{p.unit}</span>}</div>;
    case "surd": return <div role="group" aria-label={plainMath(p.label)} className="space-y-1"><div className="flex flex-wrap items-center gap-2"><span className="font-bold"><M text={p.label} /></span>
      <span className="inline-flex flex-col items-center gap-1"><span className="flex items-center gap-1"><In label={`${plainMath(p.label)} pengali`} value={x[0]} set={v => put(0, v)} disabled={checked} /><span className="text-xl">√</span><In label={`${plainMath(p.label)} bilangan di dalam akar`} value={x[1]} set={v => put(1, v)} disabled={checked} /></span>
        <span className="h-0.5 w-full bg-neutral" aria-hidden="true" /><In label={`${plainMath(p.label)} penyebut`} value={x[2]} set={v => put(2, v)} disabled={checked} /></span>{p.unit && <span className="font-semibold">{p.unit}</span>}</div>
      <p className="text-xs text-base-content/60">Contoh: 2√6 diisi 2, 6, 1. Bentuk {"4√14/3"} diisi 4, 14, 3. Bilangan bulat ditulis dengan 1 di dalam akar.</p></div>;
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><span className="font-bold"><M text={p.label} /></span>
      <div className="flex flex-wrap gap-2">{p.options.map(op => <button key={op} type="button" aria-label={plainMath(op)} aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`rounded-2xl border-4 px-3 py-1.5 text-left text-sm font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}><M text={op} /></button>)}</div></div>;
    case "classify": return <div className="space-y-2">{p.rows.map((r, k) => <div key={r.text} role="radiogroup" aria-label={`Baris ${plainMath(r.text)}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-bold"><M text={r.text} /></span><span className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" role="radio" aria-checked={x[k] === o} disabled={checked} onClick={() => put(k, o)} className={`btn btn-sm ${x[k] === o ? "btn-success" : "btn-outline"}`}>{o}</button>)}</span></div>)}</div>;
    case "tf": return <div className="space-y-2">{p.statements.map((s, k) => <div key={k} role="group" aria-label={`Pernyataan ${k + 1}`} className="flex flex-col gap-1.5 rounded-lg border border-base-300 p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span><M text={s.text} /></span><span className="join shrink-0">{(["B", "S"] as const).map(c => <button key={c} type="button" disabled={checked} aria-pressed={x[k] === c} onClick={() => put(k, c)} className={`btn join-item btn-sm ${x[k] === c ? "btn-success" : "btn-outline"}`}>{c === "B" ? "Benar" : "Salah"}</button>)}</span></div>)}</div>;
  }
}
function Answer({ q, value, record, checked }: { q: PQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeTwelveDimension() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const s = sections[idx], t = s.topic, Lab = labs[s.lab];
  const go = (i: number) => { setIdx(i); setMode("learn"); };
  const inTopic = sections.map((x, i) => ({ x, i })).filter(o => o.x.topic === t);
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 12, Bab 1</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Dimensi Tiga</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Jarak antartitik, jarak titik ke garis, dan jarak titik ke bidang pada kubus, balok, dan limas, dengan bantuan Teorema Pythagoras.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="w-56"><Solid shape="kubus" dims={[4]} extra={{ T: [2, 2, 4] }} segs={[{ a: "A", b: "T" }]} /></div>
        <p className="mt-1 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Berapa panjang kabel dari lampu ke sudut lantai?</h2>
        <p className="mt-2 text-sm">Jarak di dalam ruangan tidak selalu bisa diukur dengan meteran. Dengan memecah ruang menjadi segitiga siku-siku, panjang kabel, tali, atau tiang penyangga bisa dihitung sebelum dipasang.</p>
        <p className="mt-2 text-sm text-base-content/60">{sections.length} bagian materi dengan peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-dimensi-tiga">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-dimensi-tiga" className="mt-8 scroll-mt-20">
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
            <div className="mt-4 rounded-lg border-s-4 border-warning bg-warning/10 p-3 text-sm leading-7"><p className="font-bold">Studi kasus sehari-hari</p><p><M text={s.life} /></p></div>
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
