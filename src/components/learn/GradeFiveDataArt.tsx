import { useId } from "react";
import type { Bars, Picto, Sym } from "@/data/grade-five-data";

/* ---------- Simbol piktogram: digambar khusus, bisa dipotong per seperempat ---------- */
function SymbolShape({ sym }: { sym: Sym }) {
  switch (sym) {
    case "apem": return <g>
      <ellipse cx="12" cy="17" rx="10" ry="4.5" fill="#d9b48a" />
      <path d="M2.5 16 C3 7 21 7 21.5 16 Z" fill="#f4ead7" stroke="#c99a68" strokeWidth="1" />
      <ellipse cx="12" cy="11.5" rx="4" ry="2" fill="#7fbf6a" opacity=".85" />
    </g>;
    case "tomat": return <g>
      <circle cx="12" cy="14" r="8.5" fill="#e5484d" stroke="#b42318" strokeWidth="1" />
      <path d="M12 6 l-4 -1.5 l2.5 3 l-3.5 1 l4.5 .8 l.5 3 l.5 -3 l4.5 -.8 l-3.5 -1 l2.5 -3 Z" fill="#2f9e44" />
      <ellipse cx="8.5" cy="12" rx="1.6" ry="2.4" fill="#fff" opacity=".45" />
    </g>;
    case "jeruk": return <g>
      <circle cx="12" cy="13.5" r="8.5" fill="#f59f00" stroke="#d9480f" strokeWidth="1" />
      <path d="M12 5 q3 -3 6 -1 q-3 2 -6 1" fill="#2f9e44" />
      {[[9, 11], [14, 12], [11, 16], [15, 17]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r=".6" fill="#d9480f" />)}
    </g>;
    case "wortel": return <g>
      <path d="M6 7 L19 20 Q20.5 21 19.5 19 L10 4.5 Q7 3.5 6 7 Z" fill="#f76707" stroke="#d9480f" strokeWidth="1" transform="rotate(10 12 12)" />
      <path d="M7 6 l-4 -3 M8 5 l-1 -4.5 M6.5 7 l-5 -1" stroke="#2f9e44" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 10 l2 -1 M13 13 l2 -1 M15.5 16 l2 -1" stroke="#d9480f" strokeWidth=".9" />
    </g>;
    case "koin": return <g>
      <circle cx="12" cy="12" r="9.5" fill="#fcc419" stroke="#e67700" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="6.8" fill="none" stroke="#e67700" strokeWidth=".8" />
      <text x="12" y="14.6" fontSize="6.5" fontWeight="800" textAnchor="middle" fill="#a35200">Rp</text>
    </g>;
    case "buku": return <g>
      <path d="M2.5 5 Q7.5 3 12 5.5 V20 Q7.5 17.5 2.5 19.5 Z" fill="#4dabf7" stroke="#1c7ed6" strokeWidth="1" />
      <path d="M21.5 5 Q16.5 3 12 5.5 V20 Q16.5 17.5 21.5 19.5 Z" fill="#74c0fc" stroke="#1c7ed6" strokeWidth="1" />
      <path d="M5 8 q3 -1 5 .5 M5 11 q3 -1 5 .5 M14 8.5 q2 -1.5 5 -.5 M14 11.5 q2 -1.5 5 -.5" stroke="#fff" strokeWidth=".9" fill="none" />
    </g>;
  }
}
const symNames: Record<Sym, string> = { apem: "kue apem", tomat: "tomat", koin: "koin", buku: "buku", jeruk: "jeruk", wortel: "wortel" };

/** Satu simbol; `part` = 1..4 seperempat bagian yang tampak (dipotong dari kiri). */
export function PicSymbol({ sym, part = 4, size = 24 }: { sym: Sym; part?: number; size?: number }) {
  const id = useId();
  return <svg viewBox="0 0 24 24" width={size * (part / 4)} height={size} preserveAspectRatio="xMinYMid slice" className="shrink-0 overflow-hidden" aria-hidden="true">
    <defs><clipPath id={id}><rect x="0" y="0" width={6 * part} height="24" /></clipPath></defs>
    <g clipPath={`url(#${id})`}><SymbolShape sym={sym} /></g>
  </svg>;
}

/** Deretan simbol untuk banyak seperempat tertentu. */
export function SymbolRow({ sym, quarters, size = 24 }: { sym: Sym; quarters: number; size?: number }) {
  const whole = Math.floor(quarters / 4), rest = quarters % 4;
  return <span className="flex min-h-6 flex-wrap items-center gap-0.5" role="img" aria-label={`${whole} ${symNames[sym]}${rest ? ` dan ${rest} per 4 bagian` : ""}`}>
    {Array.from({ length: whole }, (_, k) => <PicSymbol key={k} sym={sym} size={size} />)}
    {rest > 0 && <PicSymbol sym={sym} part={rest} size={size} />}
  </span>;
}

export function PictoChart({ p, override, showTable = false }: { p: Picto; override?: (number | null)[]; showTable?: boolean }) {
  const shown = p.drawn ?? p.rows.map(r => r.value);
  return <figure className="w-full max-w-xl">
    <figcaption className="mb-1 text-center text-sm font-extrabold">{p.title}</figcaption>
    <table className="w-full border-collapse text-sm">
      <thead><tr className="bg-success/15"><th className="border border-base-300 px-2 py-1 text-left">{p.head}</th>{showTable && <th className="border border-base-300 px-2 py-1">Terjual</th>}<th className="border border-base-300 px-2 py-1 text-left">Piktogram</th></tr></thead>
      <tbody>{p.rows.map((r, k) => { const v = override ? override[k] : shown[k];
        return <tr key={r.label}><td className="border border-base-300 px-2 py-1 font-bold">{r.label}</td>{showTable && <td className="border border-base-300 px-2 py-1 text-center">{r.value}</td>}
          <td className="border border-base-300 px-2 py-1">{v === null || v === undefined ? <span className="text-base-content/40">…</span> : <SymbolRow sym={p.symbol} quarters={Math.round((v * 4) / p.unit)} size={22} />}</td></tr>; })}</tbody>
    </table>
    <p className="mt-1 flex items-center gap-1 text-xs font-semibold"><PicSymbol sym={p.symbol} size={20} /> = {p.unitText}</p>
  </figure>;
}

/* ---------- Turus: 4 garis tegak dan 1 garis miring ---------- */
export function Tally({ n }: { n: number }) {
  const groups = Math.floor(n / 5), rest = n % 5, gw = 26;
  const w = Math.max(8, groups * gw + rest * 5 + 4);
  return <svg viewBox={`0 0 ${w} 20`} width={w} height="20" role="img" aria-label={`turus ${n}`}>
    {Array.from({ length: groups }, (_, g) => <g key={g} stroke="#1f3b30" strokeWidth="1.8" strokeLinecap="round">
      {[0, 1, 2, 3].map(j => <line key={j} x1={3 + g * gw + j * 5} y1="3" x2={3 + g * gw + j * 5} y2="17" />)}
      <line x1={g * gw} y1="15" x2={g * gw + 21} y2="5" stroke="#b42318" />
    </g>)}
    {Array.from({ length: rest }, (_, j) => <line key={j} x1={3 + groups * gw + j * 5} y1="3" x2={3 + groups * gw + j * 5} y2="17" stroke="#1f3b30" strokeWidth="1.8" strokeLinecap="round" />)}
  </svg>;
}

/* ---------- Diagram batang (tegak, mendatar, ganda) ---------- */
export function BarChart({ b, override, highlight = [], compact = false, label }: { b: Bars; override?: (number | null)[]; highlight?: number[]; compact?: boolean; label?: string }) {
  const S = b.series.length, nc = b.cats.length, v = b.orient === "v";
  const len = compact ? 150 : 220, slot = v ? Math.max(36, 26 * S + 14) : Math.max(24, 15 * S + 9);
  const L = v ? 44 : (compact ? 44 : 104), T = 10, R = 12, B = v ? 40 : 36;
  const W = v ? L + nc * slot + R : L + len + R + 14, H = v ? T + len + B : T + nc * slot + B;
  const scale = (x: number) => (x / b.max) * len;
  const ticks: number[] = []; for (let t = 0; t <= b.max; t += b.minor) ticks.push(t);
  const vals = (j: number) => (j === 0 && override ? override : b.series[j].values);
  const bw = (slot - 10) / S;
  return <figure className="w-full" style={{ maxWidth: compact ? 260 : Math.max(320, W * 1.35) }}>
    {!compact && <figcaption className="mb-1 text-center text-sm font-extrabold">{b.title}</figcaption>}
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label ?? `${b.title}: ${b.cats.map((c, i) => `${c} ${b.series.map((_, j) => vals(j)[i] ?? "kosong").join(" dan ")}`).join(", ")}`}>
      {ticks.map(t => { const major = t % b.major === 0, p = scale(t);
        return v ? <g key={t}><line x1={L} x2={W - R} y1={T + len - p} y2={T + len - p} stroke={major ? "#9aa5a0" : "#dfe5e2"} strokeWidth={major ? 0.8 : 0.5} />{major && <text x={L - 4} y={T + len - p + 4} fontSize="11" textAnchor="end" fill="#33413b">{t}</text>}</g>
          : <g key={t}><line y1={T} y2={T + nc * slot} x1={L + p} x2={L + p} stroke={major ? "#9aa5a0" : "#dfe5e2"} strokeWidth={major ? 0.8 : 0.5} />{major && <text x={L + p} y={T + nc * slot + 13} fontSize="11" textAnchor="middle" fill="#33413b">{t}</text>}</g>; })}
      {b.cats.map((c, i) => <g key={c}>
        {b.series.map((s, j) => { const x = vals(j)[i]; if (x === null || x === undefined) return null; const p = scale(x), hl = highlight.includes(i) && j === 0;
          return v ? <rect key={j} x={L + i * slot + 5 + j * bw} y={T + len - p} width={bw - 1} height={p} fill={s.color} stroke={hl ? "#1f3b30" : "none"} strokeWidth="1.2" />
            : <rect key={j} x={L} y={T + i * slot + 4.5 + j * bw} width={p} height={bw - 1} fill={s.color} stroke={hl ? "#1f3b30" : "none"} strokeWidth="1.2" />; })}
        {b.series.some((_, j) => vals(j)[i] === null) && (v ? <rect x={L + i * slot + 5} y={T + len - 14} width={bw - 1} height="14" fill="none" stroke="#e67700" strokeDasharray="3 2" /> : <rect x={L} y={T + i * slot + 4.5} width="14" height={bw - 1} fill="none" stroke="#e67700" strokeDasharray="3 2" />)}
        {v ? <text x={L + i * slot + slot / 2} y={T + len + 14} fontSize={nc > 5 && S > 1 ? 10 : 11} textAnchor="middle" fontWeight="700" fill="#1f3b30">{c}</text>
          : <text x={L - 4} y={T + i * slot + slot / 2 + 4} fontSize="11" textAnchor="end" fontWeight="700" fill="#1f3b30">{c}</text>}
      </g>)}
      <line x1={L} y1={T} x2={L} y2={v ? T + len : T + nc * slot} stroke="#33413b" strokeWidth="1.2" />
      <line x1={L} y1={v ? T + len : T + nc * slot} x2={v ? W - R : L + len + 6} y2={v ? T + len : T + nc * slot} stroke="#33413b" strokeWidth="1.2" />
      {!compact && <text x={v ? L + (nc * slot) / 2 : L + len / 2} y={H - 4} fontSize="11" textAnchor="middle" fill="#55625c">{v ? b.catLabel : b.valueLabel}</text>}
    </svg>
    {S > 1 && <p className="mt-1 flex flex-wrap justify-center gap-3 text-xs font-semibold">{b.series.map(s => <span key={s.name} className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm" style={{ background: s.color }} />{s.name}</span>)}</p>}
    {!compact && <p className="mt-0.5 text-center text-[11px] text-base-content/60">{v ? `Sumbu tegak: ${b.valueLabel.toLowerCase()}` : `Sumbu tegak: ${b.catLabel.toLowerCase()}`}. Satu kotak kecil = {b.minor}.</p>}
  </figure>;
}
