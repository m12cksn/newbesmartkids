"use client";

import { ArrowLeft, ArrowRight, Check, Minus, Plus, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import { SymbolArt, Tally, ThingArt } from "./GradeTwoDiagramsArt";
import {
  assessment, correct, formatAnswer, practice, ready, SEP, splitParts, swatchHex, symbolName, things, topics,
  type DQuestion, type Part, type PicSymbol, type Row, type Scene, type Swatch, type Thing,
} from "@/data/grade-two-diagrams";

/* ====================================================================== */
/* Gambar data                                                             */
/* ====================================================================== */
/** Urutan acak yang selalu sama untuk n benda. */
function layout(list: Thing[]) {
  const n = list.length, cols = n > 24 ? 8 : n > 14 ? 7 : 6, rows = Math.ceil((n * 1.25) / cols), cells = cols * rows;
  let seed = n * 7919 + 13;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const shuffle = <T,>(xs: T[]) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const order = shuffle(Array.from({ length: cells }, (_, i) => i)), mix = shuffle(list);
  return { cols, rows, items: mix.map((t, i) => { const c = order[i]; return { t, x: (c % cols) + (rnd() - 0.5) * 0.2, y: Math.floor(c / cols) + (rnd() - 0.5) * 0.2 }; }) };
}
const frames = { awan: "rounded-[2.5rem] bg-sky-100", meja: "rounded-xl border-b-[10px] border-amber-700 bg-amber-100", vas: "rounded-3xl bg-rose-50", keranjang: "rounded-3xl bg-amber-50" } as const;

/** Benda-benda acak. Ketuk benda untuk memberi tanda sudah dihitung. */
function Scatter({ items, frame, onTap, marked: markedOuter }: { items: { thing: Thing; n: number }[]; frame?: keyof typeof frames; onTap?: (t: Thing, on: boolean) => void; marked?: number[] }) {
  const [own, setOwn] = useState<number[]>([]);
  const marked = markedOuter ?? own;
  const { cols, rows, items: pos } = layout(items.flatMap(x => Array.from({ length: x.n }, () => x.thing)));
  const toggle = (i: number, t: Thing) => { const on = !marked.includes(i); if (!markedOuter) setOwn(m => on ? [...m, i] : m.filter(z => z !== i)); onTap?.(t, on); };
  return <div className="w-full max-w-lg space-y-1">
    <div className={`relative w-full ${frame ? frames[frame] : "rounded-xl bg-lime-50"}`} style={{ aspectRatio: `${cols + 0.6} / ${rows + 0.6}` }}>
      {pos.map((p, i) => { const on = marked.includes(i); return <button key={i} type="button" aria-label={`${things[p.t]} nomor ${i + 1}`} aria-pressed={on} onClick={() => toggle(i, p.t)}
        className={`absolute grid place-items-center rounded-full transition ${on ? "bg-white/70 ring-2 ring-success" : "hover:bg-white/60"}`}
        style={{ left: `${((p.x + 0.15) / (cols + 0.6)) * 100}%`, top: `${((p.y + 0.15) / (rows + 0.6)) * 100}%`, width: `${(0.95 / (cols + 0.6)) * 100}%`, aspectRatio: "1" }}>
        <ThingArt t={p.t} className="size-full" />
        {on && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-success text-white"><Check className="size-3" strokeWidth={3} aria-hidden="true" /></span>}
      </button>; })}
    </div>
    <p className="text-xs text-base-content/60">Ketuk benda yang sudah dihitung agar diberi tanda. Ditandai {marked.length} dari {pos.length}.{!markedOuter && marked.length > 0 && <> <button type="button" className="link" onClick={() => setOwn([])}>Hapus tanda</button></>}</p>
  </div>;
}

const NameCell = ({ r }: { r: Row }) => <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
  {r.thing && <ThingArt t={r.thing} className="size-7 shrink-0 sm:size-9" />}
  {r.color && <span className="size-5 shrink-0 rounded-full border border-black/20" style={{ background: swatchHex[r.color] }} aria-hidden="true" />}
  <span className={/^\d+$/.test(r.name) ? "text-lg font-extrabold" : "min-w-0 text-xs font-semibold [overflow-wrap:anywhere] sm:text-sm"}>{r.name}</span>
</span>;

function DataTable({ title, head, children }: { title: string; head: string[]; children: ReactNode }) {
  return <figure className="w-full max-w-xl">
    <figcaption className="mb-1 text-center text-xs font-semibold text-base-content/70">{title}</figcaption>
    <div className="overflow-hidden rounded-lg border border-purple-300">
      <table className="w-full table-fixed border-collapse text-sm">
        <thead><tr className="bg-purple-200/70">{head.map((h, i) => <th key={h} scope="col" className={`border-purple-300 px-2 py-1.5 font-semibold ${i ? "border-l" : "w-[34%]"}`}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  </figure>;
}
const td = "border-l border-t border-purple-200 px-2 py-1.5 align-middle";

function TallyView({ s }: { s: Extract<Scene, { type: "tally" }> }) {
  const show = s.showCount !== false;
  return <DataTable title={s.title} head={[s.head[0], "Turus", ...(show ? [s.head[1]] : [])]}>
    {s.rows.map(r => <tr key={r.name}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={r} /></td><td className={td}><Tally n={r.n} /></td>{show && <td className={`${td} text-center text-lg font-bold`}>{r.n}</td>}</tr>)}
  </DataTable>;
}
function SymbolRow({ n, s, color }: { n: number; s: PicSymbol; color?: Swatch }) {
  return <span className="flex flex-wrap gap-0.5">{Array.from({ length: n }, (_, i) => <SymbolArt key={i} s={s} color={color} className="size-6 sm:size-7" />)}</span>;
}
function PictoView({ s }: { s: Extract<Scene, { type: "picto" }> }) {
  const unit = <SymbolArt s={s.symbol} color={s.color ?? "merah"} className="inline size-5 align-text-bottom" />;
  return <div className="w-full max-w-xl space-y-1">
    <DataTable title={s.title} head={[s.head[0], s.head[1]]}>
      {s.rows.map(r => <tr key={r.name}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={r} /></td>
        <td className={td}><SymbolRow n={r.n} s={s.symbol} color={s.color ?? r.color} /></td></tr>)}
    </DataTable>
    <p className="text-sm">Setiap gambar {unit} mewakili 1 {s.unit}.</p>
  </div>;
}
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "scatter") return <Scatter items={scene.items} frame={scene.frame} />;
  if (scene.type === "tally") return <TallyView s={scene} />;
  if (scene.type === "picto") return <PictoView s={scene} />;
  return <ul className="w-full max-w-xl space-y-1 rounded-xl bg-base-100 p-3 text-sm leading-6">{scene.lines.map(l => <li key={l} className="border-b border-dashed border-base-300 pb-1 last:border-0">{l}</li>)}</ul>;
}

/* ====================================================================== */
/* Bagian kecil                                                            */
/* ====================================================================== */
function Box({ value, onChange, label, disabled = false, w = "w-16" }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean; w?: string }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
    className={`h-11 ${w} rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none`} />;
}
const Step = ({ label, onClick, disabled, plus }: { label: string; onClick: () => void; disabled?: boolean; plus?: boolean }) =>
  <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={`btn btn-xs btn-square ${plus ? "btn-success" : "btn-outline"}`}>{plus ? <Plus className="size-3.5" aria-hidden="true" /> : <Minus className="size-3.5" aria-hidden="true" />}</button>;

/* ====================================================================== */
/* Lab A: ketuk buah, turus bertambah                                      */
/* ====================================================================== */
const labFruit: [Thing, number][] = [["anggur", 3], ["jeruk", 7], ["apel", 5], ["pisang", 4]];
function TallyLab() {
  const [marked, setMarked] = useState<number[]>([]);
  const [cnt, setCnt] = useState<Record<string, number>>({});
  const [pair, setPair] = useState<[Thing, Thing]>(["jeruk", "apel"]);
  const { items, cols, rows } = layout(labFruit.flatMap(([t, n]) => Array.from({ length: n }, () => t)));
  const total = marked.length, done = total === items.length;
  const tap = (i: number, t: Thing) => { const on = !marked.includes(i); setMarked(m => on ? [...m, i] : m.filter(z => z !== i)); setCnt(c => ({ ...c, [t]: (c[t] ?? 0) + (on ? 1 : -1) })); };
  const data = Object.fromEntries(labFruit) as Record<Thing, number>;
  const [a, b] = pair, d = data[a] - data[b];
  const pickRow = (k: 0 | 1, t: Thing) => setPair(p => (k ? [p[0], t] : [t, p[1]]));
  return <div className="space-y-4">
    <div className="rounded-xl bg-base-100 p-3">
      <ScatterLab items={items} cols={cols} rows={rows} marked={marked} onTap={tap} />
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-base-content/60"><span>Buah kesukaan Lili dan teman-teman. Ketuk setiap buah satu kali.</span>
        <button type="button" className="btn btn-ghost btn-xs gap-1" disabled={!total} onClick={() => { setMarked([]); setCnt({}); }}><RotateCcw className="size-3.5" aria-hidden="true" />Ulangi</button></div>
    </div>
    <DataTable title="Diagram Turus Buah Kesukaan" head={["Nama Buah", "Turus", "Banyak Anak"]}>
      {labFruit.map(([t]) => <tr key={t}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={{ name: things[t], thing: t, n: 0 }} /></td><td className={td}>{cnt[t] ? <Tally n={cnt[t]} /> : <span className="text-base-content/40">…</span>}</td><td className={`${td} text-center text-lg font-bold`}>{cnt[t] ?? 0}</td></tr>)}
    </DataTable>
    <output data-testid="lab-result" data-value={String(total)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      {done ? <>Semua {items.length} buah sudah dihitung. Buah yang paling banyak disukai adalah <strong>jeruk</strong>, ada 7 anak.</> : <>Sudah dihitung {total} dari {items.length} buah. Turus kelima ditulis miring menutup empat turus sebelumnya.</>}
    </output>
    <div className="rounded-xl border border-base-300 bg-base-100 p-3 text-sm">
      <p className="font-bold">Bandingkan dua buah</p>
      {([0, 1] as const).map(k => <div key={k} role="group" aria-label={k ? "Buah kedua" : "Buah pertama"} className="mt-2 flex flex-wrap items-center gap-1.5"><span className="w-16 text-xs">{k ? "Kedua" : "Pertama"}</span>
        {labFruit.map(([t]) => <button key={t} type="button" aria-pressed={pair[k] === t} onClick={() => pickRow(k, t)} className={`btn btn-xs ${pair[k] === t ? "btn-success" : "btn-outline"}`}>{things[t]}</button>)}</div>)}
      <p data-testid="compare-result" data-value={String(d)} className="mt-2">{things[a]} {data[a]} dan {things[b]} {data[b]}. {d === 0 ? "Keduanya sama banyak." : d > 0 ? <>{things[a]} <strong>{d} lebihnya</strong> dari {things[b].toLowerCase()}.</> : <>{things[a]} <strong>{-d} kurangnya</strong> dari {things[b].toLowerCase()}.</>}</p>
    </div>
  </div>;
}
function ScatterLab({ items, cols, rows, marked, onTap }: { items: { t: Thing; x: number; y: number }[]; cols: number; rows: number; marked: number[]; onTap: (i: number, t: Thing) => void }) {
  return <div className="relative w-full rounded-[2.5rem] bg-sky-100" style={{ aspectRatio: `${cols + 0.6} / ${rows + 0.6}` }}>
    {items.map((p, i) => { const on = marked.includes(i); return <button key={i} type="button" aria-label={`${things[p.t]} nomor ${i + 1}`} aria-pressed={on} onClick={() => onTap(i, p.t)}
      className={`absolute grid place-items-center rounded-full ${on ? "bg-white/70 ring-2 ring-success" : "hover:bg-white/60"}`}
      style={{ left: `${((p.x + 0.15) / (cols + 0.6)) * 100}%`, top: `${((p.y + 0.15) / (rows + 0.6)) * 100}%`, width: `${(0.95 / (cols + 0.6)) * 100}%`, aspectRatio: "1" }}>
      <ThingArt t={p.t} className="size-full" />{on && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-success text-white"><Check className="size-3" strokeWidth={3} aria-hidden="true" /></span>}
    </button>; })}
  </div>;
}

/* ====================================================================== */
/* Lab B: membuat diagram gambar                                          */
/* ====================================================================== */
const labWay: Row[] = [{ name: "Naik sepeda", thing: "sepeda", n: 5 }, { name: "Diantar motor", thing: "motor", n: 6 }, { name: "Jalan kaki", thing: "jalan", n: 4 }, { name: "Diantar mobil", thing: "mobil", n: 3 }, { name: "Naik bus", thing: "bus", n: 2 }];
const symbols: [PicSymbol, Swatch][] = [["bintang", "jingga"], ["lingkaran", "merah"], ["hati", "ungu"], ["senyum", "kuning"]];
function PictoLab() {
  const [sym, setSym] = useState(0);
  const [n, setN] = useState<number[]>([2, 0, 0, 0, 0]);
  const [s, c] = symbols[sym];
  const set = (k: number, d: number) => setN(v => v.map((x, j) => (j === k ? Math.max(0, Math.min(10, x + d)) : x)));
  const ok = n.filter((x, k) => x === labWay[k].n).length, total = n.reduce((a, b) => a + b, 0);
  return <div className="space-y-4">
    <ul className="rounded-xl bg-base-100 p-3 text-sm leading-6">
      <li className="font-bold">Data cara 20 anak berangkat ke sekolah</li>
      {labWay.map(r => <li key={r.name}>{r.name}: {r.n} anak</li>)}
    </ul>
    <div role="radiogroup" aria-label="Gambar yang dipakai" className="flex flex-wrap items-center gap-1.5 text-sm"><span>Gambar:</span>
      {symbols.map(([x, col], k) => <button key={x} type="button" role="radio" aria-checked={sym === k} aria-label={symbolName[x]} onClick={() => setSym(k)} className={`btn btn-sm btn-square ${sym === k ? "btn-success btn-outline border-2" : "btn-ghost"}`}><SymbolArt s={x} color={col} className="size-6" /></button>)}
    </div>
    <DataTable title="Diagram Gambar Cara Berangkat ke Sekolah" head={["Cara Berangkat", "Banyak Anak"]}>
      {labWay.map((r, k) => <tr key={r.name}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={r} /></td>
        <td className={td}><div className="flex items-center gap-2"><span className="min-h-7 flex-1"><SymbolRow n={n[k]} s={s} color={c} /></span>
          <span className="flex shrink-0 gap-1"><Step label={`Kurangi gambar ${r.name}`} disabled={!n[k]} onClick={() => set(k, -1)} /><Step plus label={`Tambah gambar ${r.name}`} onClick={() => set(k, 1)} /></span>
          {n[k] === r.n && <Check className="size-4 shrink-0 text-success" aria-label="Sesuai data" />}</div></td></tr>)}
    </DataTable>
    <output data-testid="lab-result" data-value={String(total)} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-sm leading-6">
      Setiap gambar <SymbolArt s={s} color={c} className="inline size-5 align-text-bottom" /> mewakili 1 anak. {ok === labWay.length ? <>Diagram selesai: ada {total} anak. Paling banyak <strong>diantar motor</strong>, paling sedikit <strong>naik bus</strong>.</> : <>{ok} dari {labWay.length} baris sudah sesuai data.</>}
    </output>
  </div>;
}
const labs = [TallyLab, PictoLab];

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function Blanks({ label, fill }: { label: string; fill: (string | undefined)[] }) {
  const bits = label.split("___");
  return <p className="text-base font-semibold leading-9">{bits.map((b, k) => <span key={k}>{b}{k < bits.length - 1 && <span className={`mx-1 inline-block min-w-24 rounded-lg border-2 border-dashed px-2 text-center ${fill[k] ? "border-success bg-success/10" : "border-orange-400 bg-white"}`}>{fill[k] || "…"}</span>}</span>)}</p>;
}
function PartView({ p, i, value, set, checked }: { p: Part; i: number; value: string; set: (v: string) => void; checked: boolean }) {
  const vals = value.split("|");
  const at = (k: number, n: number, x: string) => { const a = Array.from({ length: n }, (_, j) => vals[j] ?? ""); a[k] = x; set(a.join("|")); };
  switch (p.kind) {
    case "number": return <label className="flex flex-wrap items-center gap-2 font-bold">{p.label} <Box label={p.label} value={value} onChange={set} disabled={checked} /></label>;
    case "tallyFill": return <DataTable title={p.title} head={p.head}>
      {p.rows.map((r, k) => <tr key={r.name}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={r} /></td><td className={td}><Tally n={r.n} /></td>
        <td className={`${td} text-center`}><Box label={`Banyak ${r.name}`} value={vals[k] ?? ""} onChange={x => at(k, p.rows.length, x)} disabled={checked} w="w-14" /></td></tr>)}
    </DataTable>;
    case "tallyBuild": {
      const cells = p.rows.map((_, k) => (vals[k] ?? "").split(",")), t = (k: number) => Number(cells[k][0]) || 0;
      const put = (k: number, tv: number, cv: string) => at(k, p.rows.length, `${tv || ""},${cv}`);
      return <DataTable title={p.title} head={p.head}>
        {p.rows.map((r, k) => <tr key={r.name}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={r} /></td>
          <td className={td}><div className="flex flex-wrap items-center gap-1.5"><span className="min-h-7 min-w-8">{t(k) ? <Tally n={t(k)} /> : <span className="text-base-content/40">…</span>}</span>
            <span className="flex gap-1"><Step label={`Hapus turus ${r.name}`} disabled={checked || !t(k)} onClick={() => put(k, t(k) - 1, cells[k][1] ?? "")} /><Step plus label={`Tambah turus ${r.name}`} disabled={checked || t(k) >= 20} onClick={() => put(k, t(k) + 1, cells[k][1] ?? "")} /></span></div></td>
          <td className={`${td} text-center`}><Box label={`Banyak ${r.name}`} value={cells[k][1] ?? ""} onChange={x => put(k, t(k), x)} disabled={checked} w="w-14" /></td></tr>)}
      </DataTable>;
    }
    case "picBuild": {
      const n = (k: number) => Number(vals[k]) || 0;
      return <div className="w-full space-y-1"><DataTable title={p.title} head={p.head}>
        {p.rows.map((r, k) => <tr key={r.name}><td className="border-t border-purple-200 px-2 py-1.5"><NameCell r={r} /></td>
          <td className={td}><div className="flex items-center gap-2"><span className="min-h-7 flex-1">{n(k) ? <SymbolRow n={n(k)} s={p.symbol} color={p.color} /> : <span className="text-base-content/40">…</span>}</span>
            <span className="flex shrink-0 gap-1"><Step label={`Kurangi gambar ${r.name}`} disabled={checked || !n(k)} onClick={() => at(k, p.rows.length, String(n(k) - 1 || ""))} /><Step plus label={`Tambah gambar ${r.name}`} disabled={checked || n(k) >= 15} onClick={() => at(k, p.rows.length, String(n(k) + 1))} /></span></div></td></tr>)}
      </DataTable><p className="text-sm">Setiap gambar <SymbolArt s={p.symbol} color={p.color} className="inline size-5 align-text-bottom" /> mewakili 1 {p.unit}.</p></div>;
    }
    case "pick": return <div className="space-y-2"><Blanks label={p.label} fill={[value]} />
      <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" disabled={checked} aria-pressed={value === op} onClick={() => set(op)} className={`btn btn-sm ${value === op ? "btn-success disabled:bg-success! disabled:text-success-content! disabled:border-success!" : "btn-outline"}`}>{op}</button>)}</div></div>;
    case "pair": {
      const sel = [vals[0] ?? "", vals[1] ?? ""];
      const tap = (op: string) => { const k = sel.indexOf(op); if (k >= 0) { sel[k] = ""; } else { const e = sel.indexOf(""); if (e < 0) return; sel[e] = op; } set(sel.join("|") === "|" ? "" : sel.join("|")); };
      return <div className="space-y-2"><Blanks label={p.label} fill={sel} />
        <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" disabled={checked} aria-pressed={sel.includes(op)} onClick={() => tap(op)} className={`btn btn-sm ${sel.includes(op) ? "btn-success disabled:bg-success! disabled:text-success-content! disabled:border-success!" : "btn-outline"}`}>{op}</button>)}</div>
        <p className="text-xs text-base-content/60">Ketuk dua nama. Ketuk lagi untuk membatalkan.</p></div>;
    }
    case "choice": return <div role="group" aria-label={`Pilihan bagian ${i + 1}`} className="space-y-1"><p className="text-sm font-bold">{p.label}</p>
      <div className="flex flex-wrap gap-2">{p.options.map((op, k) => <button key={op} type="button" aria-label={op} aria-pressed={value === op} disabled={checked} onClick={() => set(op)}
        className={`flex flex-col items-center gap-1 rounded-2xl border-4 p-2 font-bold ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>
        {p.tallies ? <><Tally n={Number(op)} className="h-8" /><span className="text-xs">{"ABCD"[k]}</span></> : p.things ? <><ThingArt t={p.things[k]} className="size-12" /><span className="text-sm">{op.slice(0, 1)}</span></> : <span className="px-2 text-lg">{op}</span>}</button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: DQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-4">{q.parts.map((p, i) => <PartView key={i} p={p} i={i} value={v[i]} checked={checked} set={x => record(v.map((y, j) => j === i ? x : y).join(SEP))} />)}</div>;
}

export default function GradeTwoDiagrams() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const t = topics[topic], Lab = labs[topic];
  const go = (i: number) => { setTopic(i); setMode("learn"); };
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <p className="text-sm font-semibold text-success">Kelas 2, Bab 8</p>
    <h1 className="mt-1 text-3xl font-extrabold sm:text-5xl">Berbagai Diagram</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Kumpulkan data, tulis dengan turus, lalu sajikan dengan gambar. Dari diagram kita tahu mana yang paling banyak, mana yang sama, dan berapa selisihnya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-center gap-3"><Tally n={7} className="h-8" /><SymbolRow n={3} s="bintang" color="jingga" /></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Turus dan gambar</h2>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-diagram">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-diagram" className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-4 flex flex-wrap gap-2">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} className={`btn btn-sm h-auto min-h-9 whitespace-normal ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.title}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => setMode("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6"><Lab key={topic} /></div>
          <div className="min-w-0 p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {t.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm leading-7">{t.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {topic === 0 && <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg border border-base-300 p-3 text-sm"><span className="flex items-center gap-1"><Tally n={1} /> = 1</span><span className="flex items-center gap-1"><Tally n={2} /> = 2</span><span className="flex items-center gap-1"><Tally n={5} /> = 5</span><span className="flex items-center gap-1"><Tally n={12} /> = 12</span></div>}
            {topic === 1 && <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-base-300 p-3 text-sm">{symbols.map(([x, c]) => <span key={x} className="flex items-center gap-1"><SymbolArt s={x} color={c} className="size-6" />{symbolName[x]}</span>)}</div>}
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{t.demo}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn btn-ghost gap-1" disabled={topic === 0} onClick={() => go(topic - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Sebelumnya</button>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-success" onClick={() => setMode("practice")}>Latihan materi</button>
            {topic < topics.length - 1 ? <button type="button" className="btn btn-outline gap-1" onClick={() => go(topic + 1)}>Materi berikutnya<ArrowRight className="size-4" aria-hidden="true" /></button>
              : <button type="button" className="btn btn-outline btn-success" onClick={() => setMode("assessment")}>Mulai evaluasi</button>}
          </div>
        </div>
      </> : <GradeFourQuiz<DQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 8"}
        practiceMode={mode === "practice"} close={() => setMode("learn")}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-3"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt + q.answer} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
