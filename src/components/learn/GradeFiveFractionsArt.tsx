import { Fragment, type ReactNode } from "react";
import { fr, type Model, type Scene } from "@/data/grade-five-fractions";

/* Gambar Kelas 5 Bab 3: pecahan bertingkat, model arsiran, pita, apel, dan rumah. */
export const ink = "#1f3b30";
const shadeColor = "#f08a6e";

/** Pecahan bertingkat; s = "n/d" atau "w n/d". */
export function Frac({ s, className = "" }: { s: string; className?: string }) {
  const f = fr(s);
  if (f.d === 1 && f.n === 0) return <span className={`font-bold ${className}`}>{f.w}</span>;
  return <span className={`inline-flex items-center gap-0.5 align-middle font-bold ${className}`} aria-label={f.w ? `${f.w} ${f.n} per ${f.d}` : `${f.n} per ${f.d}`}>
    {f.w > 0 && <span>{f.w}</span>}
    <span className="inline-flex flex-col items-center leading-none" aria-hidden="true"><span className="px-0.5">{f.n}</span><span className="h-px w-full bg-current" /><span className="px-0.5">{f.d}</span></span>
  </span>;
}
/** Teks dengan pecahan "n/d" dan "w n/d" ditampilkan bertingkat. */
export function FracText({ text }: { text: string }) {
  const parts = text.split(/((?:\d+ )?\d+\/\d+)/g);
  return <>{parts.map((p, i) => (i % 2 ? <Frac key={i} s={p} className="mx-0.5 text-[0.95em]" /> : <Fragment key={i}>{p}</Fragment>))}</>;
}

/* ---------- Model arsiran ---------- */
type Piece = { d: string; key: number };
function pieces(m: Model): { view: string; list: Piece[]; outline?: ReactNode } {
  if (m.shape === "pie") {
    const r = 44, c = 50;
    if (m.d === 1) return { view: "0 0 100 100", list: [{ key: 0, d: `M${c - r} ${c}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0` }] };
    return { view: "0 0 100 100", list: Array.from({ length: m.d }, (_, i) => {
      const a0 = (i / m.d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / m.d) * 2 * Math.PI - Math.PI / 2;
      return { key: i, d: `M${c} ${c}L${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)}A${r} ${r} 0 ${1 / m.d > 0.5 ? 1 : 0} 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)}Z` };
    }) };
  }
  if (m.shape === "bar") { const w = 96 / m.d; return { view: "0 0 100 24", list: Array.from({ length: m.d }, (_, i) => ({ key: i, d: `M${2 + i * w} 2h${w}v20h${-w}z` })) }; }
  if (m.shape === "grid") { const rows = m.rows ?? 1, cols = m.d / rows, w = 96 / cols, h = 60 / rows; return { view: "0 0 100 64", list: Array.from({ length: m.d }, (_, i) => ({ key: i, d: `M${2 + (i % cols) * w} ${2 + Math.floor(i / cols) * h}h${w}v${h}h${-w}z` })) }; }
  if (m.shape === "dots") {
    const rows = m.rows ?? 1, cols = Math.ceil(m.d / rows), s = 96 / cols, H = rows * s + 4;
    return { view: `0 0 100 ${H}`, list: Array.from({ length: m.d }, (_, i) => { const cx = 2 + s * (i % cols) + s / 2, cy = 2 + s * Math.floor(i / cols) + s / 2, r = s * 0.38; return { key: i, d: `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0` }; }) };
  }
  const n = Math.round(Math.sqrt(m.d)), P = (i: number, j: number) => `${50 + (j - i / 2) * (90 / n)} ${6 + i * (84 / n)}`;
  const list: Piece[] = [];
  for (let r = 0; r < n; r++) {
    for (let j = 0; j <= r; j++) list.push({ key: list.length, d: `M${P(r, j)}L${P(r + 1, j)}L${P(r + 1, j + 1)}Z` });
    for (let j = 0; j < r; j++) list.push({ key: list.length, d: `M${P(r, j)}L${P(r, j + 1)}L${P(r + 1, j + 1)}Z` });
  }
  return { view: "0 0 100 94", list };
}
const food = { wingko: { base: "#f3dfb7", shade: "#c98a4b" }, martabak: { base: "#f7e7c6", shade: "#a8641a" } };
export function ModelFig({ m, shaded, onTap, className, label, disabled }: { m: Model; shaded?: number[]; onTap?: (i: number) => void; className?: string; label?: string; disabled?: boolean }) {
  const { view, list } = pieces(m);
  const on = shaded ?? Array.from({ length: m.k ?? 0 }, (_, i) => i);
  const base = m.food ? food[m.food].base : "#ffffff", fill = m.food ? food[m.food].shade : shadeColor;
  const size = className ?? (m.shape === "bar" ? "w-full max-w-72" : m.shape === "dots" ? "w-full max-w-64" : "size-28");
  return <svg viewBox={view} className={size} role={onTap ? "group" : "img"} aria-label={label ?? `${on.length} dari ${m.d} bagian diarsir`}>
    {m.shape === "pie" && m.food && <circle cx="50" cy="50" r="49" fill="#7cc7e8" stroke="#3a8fb7" strokeWidth="1.5" />}
    {list.map(p => {
      const sel = on.includes(p.key);
      return <path key={p.key} d={p.d} fill={sel ? fill : base} stroke={m.food ? "#8a5528" : "#2563a6"} strokeWidth="1.2" vectorEffect="non-scaling-stroke"
        {...(onTap ? { role: "button", tabIndex: disabled ? -1 : 0, "aria-label": `Bagian ${p.key + 1}`, "aria-pressed": sel, onClick: () => !disabled && onTap(p.key), onKeyDown: (e: React.KeyboardEvent) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onTap(p.key); } }, className: "cursor-pointer outline-none focus-visible:stroke-[3]" } : {})} />;
    })}
  </svg>;
}

/* ---------- Pita bertingkat untuk pecahan campuran ---------- */
export function ValueBar({ value, color }: { value: string; color: string }) {
  const f = fr(value);
  return <span className="flex flex-wrap items-center gap-1" role="img" aria-label={`${value} satuan`}>
    {Array.from({ length: f.w }, (_, i) => <span key={i} className="h-4 w-14 rounded-sm border border-black/30" style={{ background: color }} />)}
    {f.n > 0 && <span className="flex h-4 w-14 overflow-hidden rounded-sm border border-black/30 bg-white">{Array.from({ length: f.d }, (_, i) => <span key={i} className="h-full flex-1 border-r border-black/20 last:border-0" style={{ background: i < f.n ? color : undefined }} />)}</span>}
  </span>;
}

const Apple = ({ color }: { color: string }) => <svg viewBox="0 0 48 48" className="size-8" aria-hidden="true"><path d="M24 15c-6-4-15-1-15 9 0 10 7 18 15 15 8 3 15-5 15-15 0-10-9-13-15-9z" fill={color} stroke={ink} strokeWidth="1.6" /><path d="M24 15c0-4 1-7 4-9" fill="none" stroke={ink} strokeWidth="1.6" /><path d="M26 11c4-4 9-3 10-1-3 3-7 3-10 1z" fill="#3fa16b" stroke={ink} strokeWidth="1.2" /></svg>;
const House = ({ roof }: { roof: string }) => <svg viewBox="0 0 64 48" className="h-12 w-16" aria-hidden="true"><path d="M4 22L32 4l28 18" fill={roof} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" /><rect x="10" y="20" width="44" height="26" fill="#f4f1ea" stroke={ink} strokeWidth="1.6" /><rect x="28" y="30" width="9" height="16" fill={roof} stroke={ink} strokeWidth="1.2" /><rect x="15" y="26" width="9" height="8" fill="#bfe3f7" stroke={ink} strokeWidth="1.2" /><rect x="41" y="26" width="9" height="8" fill="#bfe3f7" stroke={ink} strokeWidth="1.2" /></svg>;

export function SceneView({ scene }: { scene: Scene }) {
  if (scene.type === "models") return <div className="flex flex-wrap items-end justify-center gap-6">{scene.items.map((it, i) => <figure key={i} className="flex flex-col items-center gap-1"><ModelFig m={it.model} />{it.caption && <figcaption className="text-xs font-semibold">{it.caption}</figcaption>}</figure>)}</div>;
  if (scene.type === "bars") return <div className="w-full max-w-xl space-y-2">{scene.items.map(it => <div key={it.label} className="flex flex-wrap items-center gap-2 text-sm"><span className="w-24 shrink-0 font-semibold">{it.label}</span><ValueBar value={it.value} color={it.color} /><span className="font-bold"><FracText text={`${it.value} ${scene.unit}`} /></span></div>)}<p className="text-xs text-base-content/60">Satu pita penuh = 1 {scene.unit}.</p></div>;
  if (scene.type === "apples") { let k = 0; const cols = scene.groups.flatMap(g => Array.from({ length: g.n }, () => g.color));
    return <div className="space-y-2"><div className="grid grid-cols-5 gap-1" role="img" aria-label={`${scene.total} apel`}>{cols.map(c => <Apple key={k++} color={c} />)}</div>
      <ul className="flex flex-wrap gap-3 text-xs">{scene.groups.map(g => <li key={g.label} className="flex items-center gap-1"><span className="size-3 rounded-full border border-black/30" style={{ background: g.color }} />{g.label} ({g.n})</li>)}</ul></div>; }
  const names = ["Rumah Yohana", "Rumah Komang", "Rumah Lukas"], roofs = ["#d9534f", "#8d63c7", "#2f86d6"];
  return <div className="w-full max-w-xl"><div className="grid grid-cols-3 items-end text-center text-xs font-semibold">{names.map((n, i) => <div key={n} className="flex flex-col items-center"><House roof={roofs[i]} />{n}</div>)}</div>
    <div className="mt-2 grid grid-cols-3 text-center text-sm">{scene.legs.map((l, i) => <span key={i} className="rounded border border-dashed border-sky-600 px-1 py-0.5"><FracText text={`${l} km`} /><span className="block text-[10px] font-normal text-base-content/60">{["Yohana ke Komang", "lebar rumah Komang", "Komang ke Lukas"][i]}</span></span>)}</div></div>;
}
