import { Fragment, type ReactNode } from "react";
import { fracText, type F } from "@/data/grade-seven-rational";

/* ---------- Pecahan bersusun di dalam teks ---------- */
export function Frac({ n, d, whole, neg = false, size = "md" }: { n: string | number; d: string | number; whole?: string | number; neg?: boolean; size?: "md" | "lg" }) {
  const t = size === "lg" ? "text-lg" : "text-[0.85em]";
  return <span className="inline-flex items-center gap-0.5 align-middle" aria-label={`${neg ? "negatif " : ""}${whole ? `${whole} ` : ""}${n} per ${d}`}>
    {neg && <span aria-hidden="true">−</span>}{whole !== undefined && whole !== "" && <span aria-hidden="true">{whole}</span>}
    <span aria-hidden="true" className={`inline-flex flex-col items-center leading-none ${t}`}><span className="px-0.5">{n}</span><span className="w-full border-t border-current" /><span className="px-0.5">{d}</span></span>
  </span>;
}
/** Teks dengan penanda pecahan {3/4}, {-5/8}, {2 1/3}, {π/3}. */
export function MathText({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\{[^}]+\})/);
  return <>{parts.map((s, i) => { const m = /^\{(-)?(?:(\S+) )?([^/\s]+)\/([^}]+)\}$/.exec(s);
    if (!m) return <Fragment key={i}>{s.replace(/\{([^}]+)\}/g, "$1")}</Fragment>;
    return <Frac key={i} neg={!!m[1]} whole={m[2]} n={m[3]} d={m[4]} />; })}</>;
}
export const FracValue = ({ f }: { f: F }) => <MathText text={`{${fracText(f).replace("−", "-")}}`} />;

/* ---------- Garis bilangan pecahan ---------- */
export function FracLine({ min, max, den, marks = [], onTick, selected, label }: { min: number; max: number; den: number; marks?: { v: number; label: string; color?: string }[]; onTick?: (k: number) => void; selected?: string; label?: string }) {
  const n = (max - min) * den, gap = den >= 8 ? 20 : 30, W = Math.max(300, n * gap + 40), L = 20, base = 30;
  const x = (v: number) => L + ((v - min) / (max - min)) * (W - 2 * L);
  const ticks = Array.from({ length: n + 1 }, (_, k) => min * den + k);
  const ends: number[] = [];
  const rows = [...marks].sort((a, b) => a.v - b.v).map(m => { const w = (m.label.length * 7.5) / 2, cx = x(m.v); let r = ends.findIndex(e => e < cx - w - 4); if (r < 0) { r = ends.length; ends.push(0); } ends[r] = cx + w; return { m, r }; });
  return <svg viewBox={`0 0 ${W} ${base + 46 + ends.length * 14}`} className="mx-auto w-full" style={{ minWidth: Math.min(W, 640) * 0.85, maxWidth: W * 1.3 }} role="img" aria-label={label ?? `Garis bilangan dari ${min} sampai ${max}, setiap satuan dibagi ${den}`}>
    <defs><marker id="fl-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#33413b" /></marker></defs>
    <line x1="4" x2={W - 4} y1={base} y2={base} stroke="#33413b" strokeWidth="2" markerStart="url(#fl-head)" markerEnd="url(#fl-head)" />
    {ticks.map(k => { const v = k / den, whole = k % den === 0;
      return <g key={k}>
        <line x1={x(v)} x2={x(v)} y1={base - (whole ? 8 : 5)} y2={base + (whole ? 8 : 5)} stroke={whole ? "#1f3b30" : "#7a8580"} strokeWidth={whole ? 2 : 1.2} />
        {whole && <text x={x(v)} y={base + 22} fontSize="12" fontWeight="800" textAnchor="middle" fill="#1f3b30">{v < 0 ? `−${-v}` : v}</text>}
        {onTick && <rect x={x(v) - gap / 2} y={base - 18} width={gap} height="40" fill="transparent" className="cursor-pointer" role="button" tabIndex={0} aria-label={`Letakkan ${selected ?? "titik"} di ${fracText([k, den])}`}
          onClick={() => onTick(k)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTick(k); } }} />}
      </g>; })}
    {marks.map((m, k) => <circle key={k} cx={x(m.v)} cy={base} r="6" fill={m.color ?? "#e8590c"} stroke="#fff" strokeWidth="1.5" pointerEvents="none" />)}
    {rows.map(({ m, r }, k) => <text key={k} x={x(m.v)} y={base + 40 + r * 14} fontSize="11" fontWeight="800" textAnchor="middle" fill={m.color ?? "#e8590c"} pointerEvents="none">{m.label}</text>)}
  </svg>;
}

/* ---------- Diagram Venn bilangan real ---------- */
export function Venn({ active, onPick }: { active?: string; onPick?: (s: string) => void }) {
  const zone = (name: string, el: ReactNode) => <g role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined} aria-label={onPick ? `Himpunan ${name}` : undefined} className={onPick ? "cursor-pointer" : undefined}
    onClick={onPick ? e => { e.stopPropagation(); onPick(name); } : undefined} onKeyDown={onPick ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(name); } } : undefined}>{el}</g>;
  const fill = (name: string, base: string) => (active === name ? "#f5b014" : base);
  return <svg viewBox="0 0 360 230" className="mx-auto w-full max-w-md" role="img" aria-label="Diagram Venn bilangan real: asli di dalam cacah, di dalam bulat, di dalam rasional; irasional terpisah">
    <ellipse cx="180" cy="115" rx="176" ry="111" fill="#f3faf6" stroke="#2b8a3e" strokeWidth="1.5" />
    <text x="180" y="22" fontSize="12" fontWeight="800" textAnchor="middle" fill="#2b8a3e">Bilangan Real</text>
    {zone("Rasional", <ellipse cx="120" cy="125" rx="98" ry="90" fill={fill("Rasional", "#2f6fa8")} />)}
    {zone("Bulat", <ellipse cx="120" cy="140" rx="78" ry="72" fill={fill("Bulat", "#3a82bf")} stroke="#ffffff80" />)}
    {zone("Cacah", <ellipse cx="120" cy="155" rx="58" ry="54" fill={fill("Cacah", "#4f97d1")} stroke="#ffffff80" />)}
    {zone("Asli", <ellipse cx="120" cy="170" rx="38" ry="34" fill={fill("Asli", "#6aaee0")} stroke="#ffffff80" />)}
    {zone("Irasional", <ellipse cx="282" cy="125" rx="62" ry="78" fill={fill("Irasional", "#f2b285")} />)}
    {[["Rasional", 120, 52], ["Bulat", 120, 84], ["Cacah", 120, 116], ["Asli", 120, 174], ["Irasional", 282, 129]].map(([t, x, y]) =>
      <text key={t as string} x={x as number} y={y as number} fontSize="11.5" fontWeight="800" textAnchor="middle" fill={t === "Irasional" ? "#5a2d0c" : "#ffffff"} pointerEvents="none">{t}</text>)}
  </svg>;
}

/* ---------- Sendok dan cangkir ukur ---------- */
const toolColor = ["#4a9be0", "#7a4bc2", "#9cc23f", "#e0559a"];
export function MeasuringSet() {
  const cups: [string, number][] = [["1/4", 0.55], ["1/3", 0.65], ["1/2", 0.8], ["1", 1]];
  const spoons: [string, string, number][] = [["1/2", "sdt", 0.6], ["1", "sdt", 0.75], ["1/2", "sdm", 0.85], ["1", "sdm", 1]];
  return <svg viewBox="12 0 400 150" className="mx-auto w-full max-w-lg" role="img" aria-label="Cangkir ukur 1/4, 1/3, 1/2, dan 1 cangkir, serta sendok ukur 1/2 dan 1 sendok teh, 1/2 dan 1 sendok makan">
    {cups.map(([t, s], k) => { const cx = 40 + k * 56, r = 22 * s;
      return <g key={t}><rect x={cx + r - 2} y={58 - 4} width={26 * s} height="8" rx="4" fill={toolColor[k]} />
        <path d={`M${cx - r} 52 h${2 * r} l-${r * 0.22} ${r * 1.15} h-${2 * r * 0.78} z`} fill={toolColor[k]} stroke="#00000030" />
        <ellipse cx={cx} cy="52" rx={r} ry={r * 0.28} fill="#ffffffa0" stroke={toolColor[k]} />
        <text x={cx} y="104" fontSize="14" fontWeight="800" textAnchor="middle" fill="#1f3b30">{t}</text><text x={cx} y="119" fontSize="11" textAnchor="middle" fill="#55625c">cangkir</text></g>; })}
    {spoons.map(([t, u, s], k) => { const cx = 250 + k * 44, r = 13 * s;
      return <g key={t + u}><rect x={cx - 2.5} y={56 + r * 0.6} width="5" height={34 * s} rx="2.5" fill={toolColor[k]} />
        <ellipse cx={cx} cy="50" rx={r} ry={r * 0.8} fill={toolColor[k]} stroke="#00000030" /><ellipse cx={cx} cy="48" rx={r * 0.7} ry={r * 0.5} fill="#ffffff70" />
        <text x={cx} y="118" fontSize="14" fontWeight="800" textAnchor="middle" fill="#1f3b30">{t}</text><text x={cx} y="133" fontSize="11" textAnchor="middle" fill="#55625c">{u}</text></g>; })}
    <text x="122" y="140" fontSize="11" textAnchor="middle" fill="#55625c">Cangkir ukur</text><text x="316" y="148" fontSize="10.5" textAnchor="middle" fill="#55625c">sdt: sendok teh, sdm: sendok makan</text>
  </svg>;
}

/* ---------- Ruang penyimpanan telepon ---------- */
export function StorageBar({ parts }: { parts: { name: string; gb: string; color: string }[] }) {
  const v = parts.map(p => Number(p.gb.replace(",", "."))), total = v.reduce((a, b) => a + b, 0);
  return <figure className="w-full max-w-sm">
    <div className="flex h-8 w-full overflow-hidden rounded-full ring-1 ring-base-300" role="img" aria-label={`Ruang penyimpanan: ${parts.map(p => `${p.name} ${p.gb} GB`).join(", ")}`}>{parts.map((p, k) => <span key={p.name} style={{ width: `${(v[k] / total) * 100}%`, background: p.color }} />)}</div>
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">{parts.map(p => <li key={p.name} className="flex items-center gap-1.5"><span className="inline-block size-3 rounded-sm" style={{ background: p.color }} /><span>{p.name}</span><strong className="ms-auto tabular-nums">{p.gb} GB</strong></li>)}</ul>
  </figure>;
}

/* ---------- Persegi satuan untuk perkalian ---------- */
export function AreaGrid({ rows, cols, shadeRows = 0, shadeCols = 0, picked, onCell, label }: { rows: number; cols: number; shadeRows?: number; shadeCols?: number; picked?: number[]; onCell?: (k: number) => void; label?: string }) {
  const S = 220, cw = S / cols, rh = S / rows;
  return <svg viewBox={`-2 -2 ${S + 4} ${S + 4}`} className="mx-auto w-full max-w-60" role={onCell ? "group" : "img"} aria-label={label ?? `Persegi dibagi ${rows} × ${cols}`}>
    {Array.from({ length: rows * cols }, (_, k) => { const r = Math.floor(k / cols), c = k % cols, a = c < shadeCols, b = r < shadeRows, p = picked?.includes(k);
      return <rect key={k} x={c * cw} y={r * rh} width={cw} height={rh} fill={p ? "#2b8a3e" : a && b ? "#2b8a3e" : a ? "#cdeccf" : b ? "#cfe3fb" : "#ffffff"} stroke="#7a8580" strokeWidth="0.8" strokeDasharray="3 2"
        role={onCell ? "button" : undefined} tabIndex={onCell ? 0 : undefined} aria-label={onCell ? `Kotak baris ${r + 1} kolom ${c + 1}` : undefined} aria-pressed={onCell ? !!p : undefined} className={onCell ? "cursor-pointer" : undefined}
        onClick={onCell ? () => onCell(k) : undefined} onKeyDown={onCell ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCell(k); } } : undefined} />; })}
    <rect x="0" y="0" width={S} height={S} fill="none" stroke="#1f3b30" strokeWidth="2" />
  </svg>;
}
