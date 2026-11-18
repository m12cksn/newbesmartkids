"use client";

import { ArrowLeft, ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import GradeFourQuiz from "./GradeFourQuiz";
import {
  assessment, cells, correct, formatAnswer, iconName, practice, ready, SEP, splitParts, topics,
  type Bar, type Chart, type CQuestion, type Icon, type Part, type Pikto, type Scene,
} from "@/data/grade-four-charts-v2";

const ink = "#2b2320";

/* ====================================================================== */
/* Gambar satuan piktogram                                                 */
/* ====================================================================== */
export function IconArt({ icon, size = 22, cls }: { icon: Icon; size?: number; cls?: string }) {
  const s = { width: cls ? undefined : size, height: cls ? undefined : size, viewBox: "0 0 24 24", "aria-hidden": true, className: `shrink-0 ${cls ?? ""}` } as const;
  switch (icon) {
    case "siswa": return <svg {...s}><circle cx="12" cy="4.6" r="3.2" fill="#f2c6a0" stroke={ink} strokeWidth=".9" /><path d="M8.8 3.6c1-2.4 5.4-2.4 6.4 0-1.6-.6-4.8-.6-6.4 0z" fill="#3b2a20" /><path d="M7 9.4h10l-1 7H8z" fill="#ffffff" stroke={ink} strokeWidth=".9" /><path d="M8 16.2h8v2.6H8z" fill="#c0392b" stroke={ink} strokeWidth=".9" /><path d="M9.4 18.8v4M14.6 18.8v4" stroke={ink} strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "buku": return <svg {...s}><path d="M3 5h8.4c.4 0 .6.2.6.6V21c-.6-.8-1.6-1-2.6-1H3z" fill="#2f6fb5" stroke={ink} strokeWidth=".9" /><path d="M21 5h-8.4c-.4 0-.6.2-.6.6V21c.6-.8 1.6-1 2.6-1H21z" fill="#4b8fd6" stroke={ink} strokeWidth=".9" /><path d="M5 8.5h4.5M5 11h4.5M14.5 8.5H19M14.5 11H19" stroke="#dbe9f8" strokeWidth=".9" /></svg>;
    case "kelereng": return <svg {...s}><circle cx="12" cy="12" r="9.5" fill="#5aa9e6" stroke={ink} strokeWidth=".9" /><path d="M5 14c3.4-4.6 7.6 1.6 13-3.6" fill="none" stroke="#f6c544" strokeWidth="2" strokeLinecap="round" /><circle cx="8.6" cy="8" r="2" fill="#fff" opacity=".75" /></svg>;
    case "bunga": return <svg {...s}><path d="M12 13v10" stroke="#3f9b45" strokeWidth="1.6" /><path d="M12 19c-2-2.6-5-2-5.6-1.4 1.6 1.6 3.8 2 5.6 1.4z" fill="#3f9b45" />{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="12" cy="5.6" rx="2.6" ry="3.6" fill="#f2557a" stroke={ink} strokeWidth=".7" transform={`rotate(${a} 12 9.4)`} />)}<circle cx="12" cy="9.4" r="2.2" fill="#f6c544" stroke={ink} strokeWidth=".7" /></svg>;
    case "kue": return <svg {...s}><path d="M4 12h16l-2 10H6z" fill="#c98b4a" stroke={ink} strokeWidth=".9" /><path d="M7 13.5l.6 7M11 13.5v7M15 13.5l-.4 7" stroke="#a96e33" strokeWidth=".7" /><path d="M3.4 12C3.4 7 7 4.6 12 4.6S20.6 7 20.6 12z" fill="#f8b4c8" stroke={ink} strokeWidth=".9" /><circle cx="12" cy="3.6" r="1.8" fill="#e23c3c" stroke={ink} strokeWidth=".6" /></svg>;
    case "telur": return <svg {...s}><path d="M12 2.4c4.6 0 7.4 7.6 7.4 12 0 4.4-3.2 7.2-7.4 7.2S4.6 18.8 4.6 14.4C4.6 10 7.4 2.4 12 2.4z" fill="#f6ead7" stroke={ink} strokeWidth=".9" /><ellipse cx="9.4" cy="9" rx="1.4" ry="2.4" fill="#fff" opacity=".85" /></svg>;
    case "apel": return <svg {...s}><path d="M12 7.6C9.6 5.8 3.4 6 3.4 13c0 5.4 3.8 9.4 6.2 9.4 1.2 0 1.6-.8 2.4-.8s1.2.8 2.4.8c2.4 0 6.2-4 6.2-9.4 0-7-6.2-7.2-8.6-5.4z" fill="#e23c3c" stroke={ink} strokeWidth=".9" /><path d="M12 7.6c0-2.4.8-4 1.6-4.8" stroke="#6b4423" strokeWidth="1.2" fill="none" /><path d="M13.6 4.4c2.4-1.6 4.8-.8 4.8 0-1.6 1.6-3.2 1.6-4.8 0z" fill="#3f9b45" /></svg>;
    case "spidol": return <svg {...s}><g transform="rotate(-40 12 12)"><rect x="3" y="9" width="13" height="6" rx="1.2" fill="#f4f4f4" stroke={ink} strokeWidth=".9" /><rect x="12.5" y="9" width="3.5" height="6" fill="#2f6fb5" /><path d="M16 9.6h3.2l2 2.4-2 2.4H16z" fill="#2f6fb5" stroke={ink} strokeWidth=".9" /><rect x="4.5" y="10.6" width="6" height="2.8" fill="#9fc3ea" /></g></svg>;
    case "penghapus": return <svg {...s}><g transform="rotate(-20 12 12)"><rect x="3" y="7.5" width="18" height="9" rx="1.6" fill="#f7b6c8" stroke={ink} strokeWidth=".9" /><path d="M11 7.5h10v9H11z" fill="#5aa9e6" stroke={ink} strokeWidth=".9" /></g></svg>;
    case "pulpen": return <svg {...s}><g transform="rotate(-45 12 12)"><rect x="3" y="10" width="14" height="4" rx="1" fill="#2f6fb5" stroke={ink} strokeWidth=".9" /><path d="M17 10h2.4l2.4 2-2.4 2H17z" fill="#d9e3ea" stroke={ink} strokeWidth=".8" /><path d="M5 10V7.6h5.4V10" fill="none" stroke={ink} strokeWidth="1" /></g></svg>;
    case "taplak": return <svg {...s}><path d="M3 6h18l-1.6 13H4.6z" fill="#fff" stroke={ink} strokeWidth=".9" /><path d="M3 6h18v3H3z" fill="#e2574c" stroke={ink} strokeWidth=".9" />{[6, 10, 14, 18].map(x => <path key={x} d={`M${x} 9.6v8.6`} stroke="#e2574c" strokeWidth="1" />)}<path d="M4.4 13.6h15.2" stroke="#e2574c" strokeWidth="1" /></svg>;
    case "bola": return <svg {...s}><circle cx="12" cy="12" r="9.6" fill="#f08a2c" stroke={ink} strokeWidth=".9" /><path d="M2.6 12h18.8M12 2.4v19.2M5 5.4c3.6 3 3.6 10.2 0 13.2M19 5.4c-3.6 3-3.6 10.2 0 13.2" fill="none" stroke={ink} strokeWidth=".8" /></svg>;
  }
}

/* ====================================================================== */
/* Piktogram                                                               */
/* ====================================================================== */
function PiktoView({ chart, edit, values, set, disabled }: { chart: Pikto; edit?: string[]; values?: string[]; set?: (v: string[]) => void; disabled?: boolean }) {
  const most = Math.max(...chart.items.map(i => i.value / chart.scale), 1), cls = most > 12 ? "size-[15px] sm:size-5" : most > 8 ? "size-[17px] sm:size-[22px]" : "size-5 sm:size-6";
  const count = (name: string, k: number) => { const e = edit?.indexOf(name) ?? -1; return e >= 0 ? Number(values?.[e] || 0) : name === chart.hide ? 0 : chart.items[k].value / chart.scale; };
  const bump = (name: string, d: number) => { if (!edit || !values || !set) return; const e = edit.indexOf(name), v = [...values]; v[e] = String(Math.max(0, Math.min(16, Number(v[e] || 0) + d))); set(v); };
  return <table className="w-full max-w-xl border-collapse overflow-hidden rounded-lg border-2 border-sky-300 bg-white text-sm">
    <thead><tr className="bg-sky-100"><th className="w-[28%] px-1.5 py-1 font-bold">{chart.cat}</th><th className="px-1.5 py-1 font-bold">{chart.head}</th></tr></thead>
    <tbody>{chart.items.map((it, k) => { const n = count(it.name, k), editable = !!edit?.includes(it.name);
      return <tr key={it.name} className="border-t border-sky-200">
        <th scope="row" className="px-1.5 py-0.5 text-center text-sm font-semibold leading-tight">{it.name}</th>
        <td className="px-1 py-0.5"><div className="flex items-center gap-1">
          {editable && <button type="button" aria-label={`${it.name} kurangi gambar`} disabled={disabled || n <= 0} onClick={() => bump(it.name, -1)} className="btn btn-xs btn-square btn-outline"><Minus className="size-3.5" aria-hidden="true" /></button>}
          <div role="img" aria-label={editable ? `${it.name}: ${n} gambar` : it.name === chart.hide ? `${it.name}: belum digambar` : `${it.name}: ${n} gambar`} className={`flex min-h-6 flex-1 flex-wrap items-center gap-0.5 ${editable ? "justify-start rounded border border-dashed border-orange-300 bg-orange-50 px-0.5" : "justify-center"}`}>
            {Array.from({ length: n }, (_, j) => <IconArt key={j} icon={chart.icons?.[it.name] ?? chart.icon} cls={cls} />)}
            {it.name === chart.hide && !editable && <span className="text-xs text-base-content/50">belum digambar</span>}
          </div>
          {editable && <button type="button" aria-label={`${it.name} tambah gambar`} disabled={disabled || n >= 16} onClick={() => bump(it.name, 1)} className="btn btn-xs btn-square btn-outline"><Plus className="size-3.5" aria-hidden="true" /></button>}
        </div></td>
      </tr>; })}</tbody>
    <tfoot><tr className="border-t-2 border-sky-300 bg-sky-50"><td colSpan={2} className="px-2 py-0.5 text-center"><span className="inline-flex items-center gap-1.5 font-semibold">{chart.icons ? "Setiap gambar" : <IconArt icon={chart.icon} size={20} />} menyatakan {chart.hideKey ? <span aria-label="belum diketahui" className="rounded border-2 border-dashed border-orange-400 px-1.5 text-orange-600">?</span> : chart.scale} {chart.unit ?? iconName[chart.icon]}</span></td></tr></tfoot>
  </table>;
}

/* ====================================================================== */
/* Diagram batang                                                          */
/* ====================================================================== */
const BAR = "#2a8bd0";
function BarView({ chart, edit, values, set, disabled, small }: { chart: Bar; edit?: string[]; values?: string[]; set?: (v: string[]) => void; disabled?: boolean; small?: boolean }) {
  const n = chart.items.length, levels = chart.max / chart.step, v = chart.dir === "v";
  const val = (name: string, k: number) => { const e = edit?.indexOf(name) ?? -1; return e >= 0 ? Number(values?.[e] || 0) : name === chart.hide ? 0 : chart.items[k].value; };
  const put = (name: string, x: number) => { if (!edit || !values || !set || disabled) return; const e = edit.indexOf(name), w = [...values]; w[e] = String(x); set(w); };
  // Ukuran gambar (satuan SVG); lebar menyesuaikan layar lewat viewBox.
  const W = small ? 124 : 340, H = small ? 122 : v ? 200 : 40 + n * 27, padL = v ? (small ? 16 : 30) : small ? 40 : 86, padB = v ? (small ? 32 : 40) : 30, padT = 10, padR = 10;
  const pw = W - padL - padR, ph = H - padT - padB, color = chart.color ?? BAR, fs = small ? 9 : 11;
  const slot = (v ? pw : ph) / n, thick = slot * (small ? 0.6 : 0.56);
  const pos = (x: number) => (v ? padT + ph - (x / chart.max) * ph : padL + (x / chart.max) * pw);
  return <svg role={edit ? "group" : "img"} aria-label={`Diagram batang ${v ? "tegak" : "mendatar"} ${chart.cat}${edit ? "" : `: ${chart.items.filter(i => i.name !== chart.hide).map(i => `${i.name} ${i.value}`).join(", ")}`}`} viewBox={`0 0 ${W} ${H}`} width={W} className="h-auto w-full max-w-md">
    <rect width={W} height={H} fill="#fff" />
    {Array.from({ length: levels + 1 }, (_, l) => { const x = l * chart.step, p = pos(x);
      return <g key={l}>{v ? <line x1={padL} x2={W - padR} y1={p} y2={p} stroke={l ? "#cbd5e1" : ink} strokeWidth={l ? 0.8 : 1.4} /> : <line y1={padT} y2={H - padB} x1={p} x2={p} stroke={l ? "#cbd5e1" : ink} strokeWidth={l ? 0.8 : 1.4} />}
        {(!small || l % 2 === 0) && <text x={v ? padL - 4 : p} y={v ? p + 3.5 : H - padB + 12} textAnchor={v ? "end" : "middle"} fontSize={fs} fill="#334155">{x}</text>}</g>; })}
    {v ? <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke={ink} strokeWidth={1.4} /> : <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} stroke={ink} strokeWidth={1.4} />}
    {chart.items.map((it, k) => { const x = val(it.name, k), c = (v ? padL : padT) + slot * (k + 0.5), editable = !!edit?.includes(it.name);
      return <g key={it.name}>
        {x > 0 && (v ? <rect x={c - thick / 2} y={pos(x)} width={thick} height={pos(0) - pos(x)} fill={editable ? "#f4a12f" : color} stroke={ink} strokeWidth={0.6} /> : <rect y={c - thick / 2} x={padL} height={thick} width={pos(x) - padL} fill={editable ? "#f4a12f" : color} stroke={ink} strokeWidth={0.6} />)}
        {small ? (v ? <text x={c} y={H - padB + 8} textAnchor="end" fontSize={8.5} fill={ink} transform={`rotate(-35 ${c} ${H - padB + 8})`}>{it.name}</text> : null) : (v ? <text x={c} y={H - padB + 14} textAnchor="middle" fontSize={fs} fill={ink}>{it.name.split(" ").map((w, j) => <tspan key={j} x={c} dy={j ? 11 : 0}>{w}</tspan>)}</text> : <text x={padL - 5} y={c + 4} textAnchor="end" fontSize={fs} fill={ink}>{it.name}</text>)}
        {editable && Array.from({ length: levels }, (_, l) => { const to = (l + 1) * chart.step, a = pos(l * chart.step), b = pos(to);
          return <rect key={l} role="button" tabIndex={disabled ? -1 : 0} aria-label={`Batang ${it.name} sampai ${to}`} aria-pressed={x === to}
            x={v ? c - slot / 2 : Math.min(a, b)} y={v ? Math.min(a, b) : c - slot / 2} width={v ? slot : Math.abs(b - a)} height={v ? Math.abs(b - a) : slot}
            fill="transparent" className="cursor-pointer outline-none focus-visible:fill-orange-200/50" onClick={() => put(it.name, x === to ? 0 : to)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); put(it.name, x === to ? 0 : to); } }} />; })}
      </g>; })}
    {!small && <text x={v ? 9 : padL + pw / 2} y={v ? padT + ph / 2 : H - 3} textAnchor="middle" fontSize={fs} fontWeight={700} fill={ink} transform={v ? `rotate(-90 9 ${padT + ph / 2})` : undefined}>{chart.axis}</text>}
  </svg>;
}

function ChartView({ chart, ...rest }: { chart: Chart; edit?: string[]; values?: string[]; set?: (v: string[]) => void; disabled?: boolean; small?: boolean }) {
  return chart.kind === "pikto" ? <PiktoView chart={chart} {...rest} /> : <BarView chart={chart} {...rest} />;
}
function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "chart") return <ChartView chart={scene.chart} />;
  // Tabel mendatar seperti di buku; di layar sempit sel-selnya turun ke baris berikutnya.
  if (scene.across) return <dl aria-label="Tabel data" className="flex flex-wrap justify-center overflow-hidden rounded-lg border-2 border-sky-300 bg-white text-center text-sm">
    {scene.rows.map(([a, b]) => <div key={a} className="min-w-[4.5rem] flex-auto border border-sky-200"><dt className="bg-sky-100 px-1.5 py-0.5 font-bold">{a}</dt><dd className="px-1.5 py-0.5 text-base font-extrabold">{b}</dd></div>)}</dl>;
  return <table className="overflow-hidden rounded-lg border-2 border-sky-300 bg-white text-center text-sm"><thead><tr className="bg-sky-100">{scene.head.map(h => <th key={h} className="px-3 py-1 font-bold">{h}</th>)}</tr></thead>
    <tbody>{scene.rows.map(([a, b]) => <tr key={a} className="border-t border-sky-200"><td className="px-3 py-0.5">{a}</td><td className="px-3 py-0.5 font-bold">{b}</td></tr>)}</tbody></table>;
}

/* ====================================================================== */
/* Peraga                                                                  */
/* ====================================================================== */
const Result = ({ value, children }: { value: string; children: ReactNode }) => <output data-testid="lab-result" data-value={value} aria-live="polite" className="block rounded-lg bg-success/10 p-3 text-base leading-7">{children}</output>;
const jus = { Jeruk: 8, Mangga: 6, Alpukat: 4, Melon: 10 };
function PiktoLab() {
  const [scale, setScale] = useState(2), [v, setV] = useState<string[]>(["", "", "", ""]);
  const names = Object.keys(jus), want = names.map(n => jus[n as keyof typeof jus] / scale), got = v.map(x => Number(x || 0));
  const done = got.every((g, i) => g === want[i]);
  const chart: Pikto = { kind: "pikto", cat: "Jus", head: "Banyak Siswa", icon: "siswa", scale, items: names.map(n => ({ name: n, value: jus[n as keyof typeof jus] })) };
  return <div className="space-y-2.5">
    <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">1 gambar menyatakan</span>
      <div role="radiogroup" aria-label="Nilai satu gambar" className="flex gap-1.5">{[1, 2].map(k => <button key={k} type="button" role="radio" aria-checked={scale === k} onClick={() => { setScale(k); setV(["", "", "", ""]); }} className={`btn btn-sm ${scale === k ? "btn-success" : "btn-outline"}`}>{k} siswa</button>)}</div></div>
    <p className="text-sm">Tabel jus kesukaan: {names.map(n => `${n} ${jus[n as keyof typeof jus]}`).join(", ")} siswa.</p>
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8]"><PiktoView chart={chart} edit={names} values={v} set={setV} /></div>
    <div className="flex gap-2"><button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setV(["", "", "", ""])}><RotateCcw className="size-4" aria-hidden="true" />Kosongkan</button></div>
    <Result value={`${scale}:${got.join(",")}:${done ? "ok" : "-"}`}>{done ? `Tepat! Setiap baris berisi banyak siswa dibagi ${scale}. Contoh: Melon ${jus.Melon} siswa = ${jus.Melon / scale} gambar.` : names.map((n, i) => `${n} ${got[i]} gambar = ${got[i] * scale} siswa${got[i] * scale === jus[n as keyof typeof jus] ? " (pas)" : ""}`).join("; ")}</Result>
  </div>;
}
function BarLab() {
  const [dir, setDir] = useState<"v" | "h">("v"), [v, setV] = useState<string[]>(["4", "7", "2", "5"]);
  const names = ["Kucing", "Kelinci", "Burung", "Ikan"], vals = v.map(x => Number(x || 0));
  const chart: Bar = { kind: "bar", dir, cat: "Hewan peliharaan", axis: "Banyak Siswa", step: 1, max: 10, items: names.map((n, i) => ({ name: n, value: vals[i] })) };
  const hi = Math.max(...vals), lo = Math.min(...vals);
  return <div className="space-y-2.5">
    <div role="radiogroup" aria-label="Arah diagram" className="flex gap-1.5">{([["v", "Tegak"], ["h", "Mendatar"]] as const).map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={dir === k} onClick={() => setDir(k)} className={`btn btn-sm ${dir === k ? "btn-success" : "btn-outline"}`}>{l}</button>)}</div>
    <div className="flex justify-center [@media(max-height:700px)]:[zoom:0.8]"><BarView chart={chart} edit={names} values={v} set={setV} /></div>
    <Result value={`${dir}:${vals.join(",")}`}>Paling banyak: <strong>{names.filter((_, i) => vals[i] === hi).join(" dan ")}</strong> ({hi}). Paling sedikit: <strong>{names.filter((_, i) => vals[i] === lo).join(" dan ")}</strong> ({lo}). Jumlah semua {vals.reduce((a, b) => a + b, 0)} siswa. Baca dari {dir === "v" ? "tinggi" : "panjang"} batang.</Result>
  </div>;
}
const labs: Record<string, () => ReactNode> = { pikto: PiktoLab, bar: BarLab };

/* ====================================================================== */
/* Cara menjawab                                                           */
/* ====================================================================== */
function NumBox({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled: boolean }) {
  return <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} placeholder="…" onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
    className="h-11 w-20 rounded-xl border-2 border-orange-400 bg-white text-center text-xl font-extrabold text-neutral focus:border-success focus:outline-none sm:text-2xl" />;
}
function PartView({ p, value, set, checked, i }: { p: Part; value: string; set: (v: string) => void; checked: boolean; i: number }) {
  const x = cells(p, value), put = (k: number, v: string) => { const a = [...x]; a[k] = v; set(a.join("|")); };
  switch (p.kind) {
    case "fill": { const bits = p.text.split("□");
      // Kotak isian dan satuannya tidak dipisah ke baris berbeda.
      return <p className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xl font-bold sm:text-2xl">{bits[0] && <span>{bits[0].trim()}</span>}{bits.slice(1).map((b, k) => <span key={k} className="inline-flex items-center gap-2 whitespace-nowrap"><NumBox label={`Bagian ${i + 1} kotak ${k + 1}`} value={x[k]} onChange={v => put(k, v)} disabled={checked} />{b.trim() && <span>{b.trim()}</span>}</span>)}</p>; }
    case "choice": return <div role="group" aria-label={p.label} className="flex flex-wrap items-center gap-x-3 gap-y-1.5"><p className="text-base font-bold sm:text-xl">{p.label}</p>
      <div className="flex flex-wrap gap-1.5">{p.options.map(op => <button key={op} type="button" aria-pressed={value === op} disabled={checked} onClick={() => set(op)} className={`min-h-9 rounded-2xl border-4 px-2 text-sm font-bold sm:min-h-10 sm:px-2.5 sm:text-base ${value === op ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{op}</button>)}</div></div>;
    case "multi": { const on = value ? value.split("|") : [];
      return <div role="group" aria-label={p.label} className="space-y-1"><p className="text-lg font-bold">{p.label}</p>
        <div className="flex flex-wrap gap-1.5">{p.options.map(o => <button key={o} type="button" aria-pressed={on.includes(o)} disabled={checked} onClick={() => set((on.includes(o) ? on.filter(y => y !== o) : [...on, o]).join("|"))} className={`min-h-9 rounded-full border-4 px-2.5 text-sm font-bold sm:min-h-10 sm:text-base ${on.includes(o) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>{o}</button>)}</div>
        <p className="text-xs text-base-content/60 [@media(max-height:700px)]:hidden">Pilih semua yang benar. Ketuk lagi untuk membatalkan.</p></div>; }
    case "pikto": return <div className="space-y-1"><p className="text-sm text-base-content/70">Ketuk tambah atau kurangi sampai banyak gambarnya sesuai data.</p><div className="flex justify-center"><PiktoView chart={p.chart} edit={p.edit} values={x} set={v => set(v.join("|"))} disabled={checked} /></div></div>;
    case "bar": return <div className="space-y-1"><p className="text-sm text-base-content/70">Ketuk petak {p.chart.dir === "v" ? "di atas" : "di samping"} nama untuk mengatur {p.chart.dir === "v" ? "tinggi" : "panjang"} batang.</p><div className="flex justify-center"><BarView chart={p.chart} edit={p.edit} values={x} set={v => set(v.join("|"))} disabled={checked} /></div></div>;
    case "pick": return <div role="group" aria-label={p.label} className="space-y-1.5"><p className="text-lg font-bold">{p.label}</p>
      <div className="grid grid-cols-3 gap-1.5">{p.charts.map((c, k) => <button key={k} type="button" aria-label={`Diagram ${"PQR"[k]}`} aria-pressed={value === String(k)} disabled={checked} onClick={() => set(String(k))} className={`flex flex-col items-center rounded-xl border-4 p-1 ${value === String(k) ? "border-error bg-error/5" : "border-transparent bg-base-100 ring-1 ring-base-300"}`}>
        <ChartView chart={c} small /><span className="font-extrabold text-sky-700">{"PQR"[k]}</span></button>)}</div></div>;
  }
}
function Answer({ q, value, record, checked }: { q: CQuestion; value: string; record: (v: string) => void; checked: boolean }) {
  const v = splitParts(value, q.parts.length);
  return <div className="space-y-3 [@media(max-height:700px)]:space-y-1 [@media(max-height:700px)]:[zoom:0.76]">{q.parts.map((p, i) => <PartView key={i} i={i} p={p} value={v[i]} checked={checked} set={x => record(v.map((y, j) => (j === i ? x : y)).join(SEP))} />)}</div>;
}

export default function GradeFourChartsV2() {
  const [topic, setTopic] = useState(0);
  const [mode, setMode] = useState<"learn" | "practice" | "assessment">("learn");
  const area = useRef<HTMLDivElement>(null);
  const t = topics[topic], s = t.sections[0], Lab = labs[s.lab];
  const show = () => requestAnimationFrame(() => area.current?.scrollIntoView({ block: "start" }));
  const open = (m: "practice" | "assessment") => { setMode(m); show(); };
  const go = (ti: number) => { setTopic(ti); setMode("learn"); show(); };
  const last = topic === topics.length - 1;
  return <section className="mx-auto max-w-6xl overflow-x-clip px-4 py-8 sm:px-8">
    <h1 className="text-3xl font-extrabold sm:text-5xl">Piktogram dan Diagram Batang</h1>
    <p className="mt-3 max-w-3xl text-base-content/70">Sajikan data dengan gambar dan batang, lalu baca mana yang paling banyak, paling sedikit, dan berapa jumlahnya.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-40 flex-col items-center justify-center bg-success/5 p-6 text-center">
        <div aria-hidden="true" className="flex items-end gap-1.5">{[3, 5, 2, 4].map((h, i) => <span key={i} className="w-6 rounded-t bg-[#2a8bd0]" style={{ height: h * 12 }} />)}<span className="ms-3 flex flex-col gap-1">{[3, 2].map((n, r) => <span key={r} className="flex gap-0.5">{Array.from({ length: n }, (_, j) => <IconArt key={j} icon="siswa" size={20} />)}</span>)}</span></div>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
        <p className="text-xs text-base-content/60">Panel ini akan memutar video saat tautannya tersedia.</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Data kelas dalam gambar</h2>
        <p className="mt-2 text-sm">Berapa siswa yang naik sepeda ke sekolah? Lomba apa yang paling banyak diikuti? Piktogram dan diagram batang menjawabnya sekilas pandang.</p>
        <p className="mt-2 text-sm text-base-content/60">2 peraga, {practice.flat().length} latihan, dan {assessment.length} soal evaluasi.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-data-4">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-data-4" ref={area} className="mt-8 scroll-mt-20">
      {mode === "learn" ? <>
        <nav aria-label="Subtopik" className="mb-3 flex flex-wrap gap-1.5">
          {topics.map((x, i) => <button key={x.code} type="button" aria-current={i === topic ? "step" : undefined} title={x.title} className={`btn btn-sm h-auto min-h-9 ${i === topic ? "btn-success" : "btn-outline"}`} onClick={() => go(i)}>{x.code}. {x.short}</button>)}
          <button type="button" className="btn btn-sm btn-outline btn-success ms-auto" onClick={() => open("assessment")}>Evaluasi 24 soal</button>
        </nav>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-[1.35fr_1fr]">
          <div data-testid="lab" className="min-w-0 bg-info/5 p-3 sm:p-5"><Lab key={topic} /></div>
          <div className="min-w-0 p-4 sm:p-6">
            <h2 className="text-2xl font-extrabold">{t.code}. {s.title}</h2>
            <p className="mt-1 text-sm text-base-content/60">{t.title}</p>
            <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-base leading-7">{s.steps.map(x => <li key={x}>{x}</li>)}</ol>
            {s.example && <p className="mt-3 border-s-4 border-success ps-3 text-base leading-7">{s.example}</p>}
            <p className="mt-3 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{s.demo}</p>
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
      </> : <GradeFourQuiz<CQuestion> key={`${mode}-${topic}`}
        questions={mode === "practice" ? practice[topic] : assessment}
        title={mode === "practice" ? `Latihan ${t.code}. ${t.short}` : "Evaluasi Bab 6"}
        practiceMode={mode === "practice"} close={() => { setMode("learn"); show(); }}
        renderMeta={q => q.level && <p className="text-xs font-bold"><span className={`badge badge-sm ${q.level === "Sedang" ? "badge-info" : q.level === "Menantang" ? "badge-warning" : "badge-error"}`}>{q.level}</span></p>}
        renderVisual={q => q.scene ? <div className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [@media(max-height:700px)]:p-1 [@media(max-height:700px)]:[zoom:0.7]"><SceneView key={q.prompt} scene={q.scene} /></div> : null}
        renderAnswer={(q, value, record, checked) => <Answer key={q.prompt} q={q} value={value} record={record} checked={checked} />}
        checkAnswer={correct} isReady={ready} formatAnswer={formatAnswer} />}
    </div>
  </section>;
}
