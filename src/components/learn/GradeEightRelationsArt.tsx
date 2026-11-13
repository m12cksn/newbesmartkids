import type { KeyboardEvent, ReactNode } from "react";
import { label, type Rel, type Scene } from "@/data/grade-eight-relations";
/** Teks bab ini memakai kurung kurawal sebagai lambang himpunan, jadi hanya ^{…} (pangkat) yang diubah. */
export function M({ text }: { text: string }) {
  const parts = text.split(/\^\{([^}]*)\}/);
  return <>{parts.map((t, i) => (i % 2 ? <sup key={i} className="text-[0.7em]">{t}</sup> : t))}</>;
}
const ink = "#1f3b30", blue = "#1c64b5";
const key = (i: number, j: number) => `${i}-${j}`;

/* ---------- Diagram panah (dapat diketuk untuk menarik panah) ---------- */
export function ArrowDiagram({ rel, name, aName = "A", bName = "B", active = null, onLeft, onRight, ariaLabel, className = "w-full max-w-sm" }: {
  rel: Rel; name?: string; aName?: string; bName?: string; active?: number | null; onLeft?: (i: number) => void; onRight?: (j: number) => void; ariaLabel?: string; className?: string;
}) {
  const rows = Math.max(rel.A.length, rel.B.length), gap = 32, H = 52 + rows * gap;
  const yOf = (k: number, len: number) => 40 + (rows - len) * gap / 2 + k * gap + gap / 2;
  const L = 70, R = 250, interactive = !!onLeft;
  const node = (side: "A" | "B", k: number, v: string | number, x: number, y: number, on: boolean, act: () => void): ReactNode => {
    const text = label(v), w = Math.max(30, String(text).length * 7.4 + 14);
    return <g key={`${side}${k}`} {...(interactive ? { role: "button", tabIndex: 0, "aria-label": `${side === "A" ? "Kiri" : "Kanan"} ${text}`, "aria-pressed": on, onClick: act, onKeyDown: (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }, className: "cursor-pointer" } : {})}>
      <rect x={x - w / 2} y={y - 11} width={w} height="22" rx="11" fill={on ? "#2b8a3e" : "#ffffff"} stroke={on ? "#1d5c2a" : "#9fb3aa"} strokeWidth="1.2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={on ? "#ffffff" : ink}>{text}</text>
    </g>;
  };
  return <svg viewBox={`0 0 320 ${H}`} className={className} role={interactive ? "group" : "img"} aria-label={ariaLabel ?? `Diagram panah ${name ? `"${name}" ` : ""}dari ${aName} ke ${bName}: ${rel.pairs.length ? rel.pairs.map(([i, j]) => `${label(rel.A[i])} ke ${label(rel.B[j])}`).join(", ") : "belum ada panah"}`}>
    <defs><marker id="rel-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={blue} /></marker></defs>
    <ellipse cx={L} cy={H / 2 + 8} rx="58" ry={H / 2 - 12} fill="#eef6ff" stroke="#9cc0e6" />
    <ellipse cx={R} cy={H / 2 + 8} rx="58" ry={H / 2 - 12} fill="#fff6e6" stroke="#e6c48a" />
    <text x={L} y="16" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>{aName}</text><text x={R} y="16" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>{bName}</text>
    {name && <text x="160" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b6b64">{name}</text>}
    {rel.pairs.map(([i, j]) => { const y1 = yOf(i, rel.A.length), y2 = yOf(j, rel.B.length); return <line key={key(i, j)} x1={L + 30} y1={y1} x2={R - 32} y2={y2} stroke={blue} strokeWidth="1.6" markerEnd="url(#rel-head)" />; })}
    {rel.A.map((v, i) => node("A", i, v, L, yOf(i, rel.A.length), active === i, () => onLeft?.(i)))}
    {rel.B.map((v, j) => node("B", j, v, R, yOf(j, rel.B.length), false, () => onRight?.(j)))}
  </svg>;
}

/* ---------- Diagram Cartesius relasi (titik dapat diketuk) ---------- */
export function PlotGrid({ rel, xName = "A", yName = "B", onToggle, ariaLabel, className = "w-full max-w-xs" }: { rel: Rel; xName?: string; yName?: string; onToggle?: (i: number, j: number) => void; ariaLabel?: string; className?: string }) {
  const c = 38, x0 = 48, nA = rel.A.length, nB = rel.B.length, W = x0 + nA * c + 24, H = 24 + nB * c + 40;
  const X = (i: number) => x0 + (i + 0.5) * c, Y = (j: number) => 24 + (nB - j - 0.5) * c;
  const on = new Set(rel.pairs.map(([i, j]) => key(i, j)));
  return <svg viewBox={`0 0 ${W} ${H}`} className={className} role={onToggle ? "group" : "img"} aria-label={ariaLabel ?? `Diagram Cartesius dari ${xName} ke ${yName}: titik ${rel.pairs.map(([i, j]) => `(${label(rel.A[i])}, ${label(rel.B[j])})`).join(", ") || "belum ada"}`}>
    <line x1={x0} y1={24 + nB * c} x2={W - 8} y2={24 + nB * c} stroke="#33413b" strokeWidth="1.5" /><line x1={x0} y1={24 + nB * c} x2={x0} y2="8" stroke="#33413b" strokeWidth="1.5" />
    <text x={W - 8} y={24 + nB * c + 34} textAnchor="end" fontSize="12" fontWeight="800" fill={ink}>{xName}</text><text x="8" y="16" fontSize="12" fontWeight="800" fill={ink}>{yName}</text>
    {rel.A.map((v, i) => <g key={`x${i}`}><line x1={X(i)} x2={X(i)} y1="24" y2={24 + nB * c} stroke="#dbe5e0" /><text x={X(i)} y={24 + nB * c + 16} textAnchor="middle" fontSize="11" fontWeight="700" fill={ink}>{label(v)}</text></g>)}
    {rel.B.map((v, j) => <g key={`y${j}`}><line x1={x0} x2={x0 + nA * c} y1={Y(j)} y2={Y(j)} stroke="#dbe5e0" /><text x={x0 - 6} y={Y(j) + 4} textAnchor="end" fontSize="11" fontWeight="700" fill={ink}>{label(v)}</text></g>)}
    {rel.A.flatMap((a, i) => rel.B.map((b, j) => { const k = key(i, j), lit = on.has(k);
      if (!onToggle) return lit ? <circle key={k} cx={X(i)} cy={Y(j)} r="6" fill={blue} /> : null;
      const act = () => onToggle(i, j);
      return <g key={k} role="button" tabIndex={0} aria-pressed={lit} aria-label={`Titik (${label(a)}, ${label(b)})`} onClick={act} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }} className="cursor-pointer">
        <circle cx={X(i)} cy={Y(j)} r="14" fill="transparent" /><circle cx={X(i)} cy={Y(j)} r={lit ? 7 : 4} fill={lit ? blue : "#ffffff"} stroke={lit ? blue : "#9fb3aa"} strokeWidth="1.5" /></g>; }))}
  </svg>;
}

/* ---------- Kebun apel dan pinus ---------- */
const Pine = ({ x, y }: { x: number; y: number }) => <g><path d={`M${x} ${y - 7}l6 9h-12z M${x} ${y - 3}l7 9h-14z`} fill="#2f8f4e" /><rect x={x - 1.2} y={y + 6} width="2.4" height="3" fill="#7a5230" /></g>;
const Apple = ({ x, y }: { x: number; y: number }) => <g><circle cx={x} cy={y + 1} r="5" fill="#d63a3a" /><path d={`M${x} ${y - 4}q2 -3 4 -2`} stroke="#3c7a2f" strokeWidth="1.5" fill="none" /></g>;
export function OrchardView({ ns }: { ns: number[] }) {
  const s = 15; let x = 8; const out: ReactNode[] = [];
  for (const nn of ns) { const m = 2 * nn + 1, x0 = x;
    out.push(<text key={`t${nn}`} x={x0} y="14" fontSize="11" fontWeight="800" fill={ink}>n = {nn}</text>);
    for (let r = 0; r < m; r++) for (let c = 0; c < m; c++) { const cx = x0 + c * s + 7, cy = 28 + r * s + 7, edge = r === 0 || c === 0 || r === m - 1 || c === m - 1;
      if (edge) out.push(<Pine key={`${nn}-${r}-${c}`} x={cx} y={cy} />); else if (r % 2 === 1 && c % 2 === 1) out.push(<Apple key={`${nn}-${r}-${c}`} x={cx} y={cy} />); }
    x += m * s + 18; }
  const H = 28 + (2 * Math.max(...ns) + 1) * s + 26;
  return <svg viewBox={`0 0 ${x} ${H}`} className="w-full max-w-md" role="img" aria-label={`Kebun apel dalam pola persegi dikelilingi pohon pinus untuk n = ${ns.join(", ")}: apel ${ns.map(k => k * k).join(", ")}, pinus ${ns.map(k => 8 * k).join(", ")}`}>
    {out}<g transform={`translate(8 ${H - 10})`}><Pine x={6} y={-2} /><text x="16" y="2" fontSize="10" fill={ink}>pohon pinus</text><Apple x={100} y={-2} /><text x="110" y="2" fontSize="10" fill={ink}>pohon apel</text></g>
  </svg>;
}

/* ---------- Bak mandi ---------- */
export function TankView({ t1, v1, t2, v2 }: { t1: number; v1: number; t2: number; v2: number }) {
  return <svg viewBox="0 0 300 150" className="w-full max-w-sm" role="img" aria-label={`Bak mandi diisi air dengan debit tetap: setelah ${t1} menit ${v1} liter, setelah ${t2} menit ${v2} liter`}>
    {[[20, v1, t1, 0.45], [160, v2, t2, 0.8]].map(([x, v, t, f]) => <g key={x}>
      <path d={`M${x + 30} 18v14h-8`} stroke="#5b6b64" strokeWidth="4" fill="none" /><path d={`M${x + 21} 34V${120 - 78 * f}`} stroke="#5fa8e6" strokeWidth="2" strokeDasharray="3 3" />
      <rect x={x} y="40" width="110" height="80" fill="#f3f6f5" stroke="#5b6b64" strokeWidth="2" />
      <rect x={x + 2} y={120 - 78 * f} width="106" height={78 * f - 1} fill="#9cd0f2" />
      <text x={x + 55} y="138" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{t} menit</text>
      <text x={x + 55} y={116 - 78 * f + 20} textAnchor="middle" fontSize="13" fontWeight="800" fill={blue}>{v} liter</text></g>)}
  </svg>;
}

/* ---------- Taksi ---------- */
export function TaxiView({ start, perKm }: { start: string; perKm: string }) {
  return <svg viewBox="0 0 300 120" className="w-full max-w-sm" role="img" aria-label={`Taksi dengan biaya awal ${start} dan ${perKm} per kilometer`}>
    <path d="M30 80l14 -26c4 -7 9 -10 18 -10h70c8 0 13 3 18 9l18 27h24c6 0 10 4 10 10v12H18V90c0-6 5-10 12-10z" fill="#f2c230" stroke="#9a7a10" strokeWidth="1.5" />
    <path d="M56 56l-10 22h46V56zM100 56v22h52l-14 -20c-2 -2 -4 -2 -6 -2z" fill="#d6ecf7" stroke="#9a7a10" />
    <rect x="80" y="34" width="38" height="12" rx="2" fill="#33413b" /><text x="99" y="43.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#f2c230">TAKSI</text>
    {[60, 180].map(x => <g key={x}><circle cx={x} cy="102" r="13" fill="#33413b" /><circle cx={x} cy="102" r="5" fill="#c9d2cf" /></g>)}
    <text x="218" y="30" fontSize="10" fontWeight="700" fill={ink}>Biaya awal</text><text x="218" y="44" fontSize="11" fontWeight="800" fill={blue}>{start}</text>
    <text x="218" y="62" fontSize="10" fontWeight="700" fill={ink}>Per kilometer</text><text x="218" y="76" fontSize="11" fontWeight="800" fill={blue}>{perKm}</text>
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "arrow": return <ArrowDiagram rel={scene.rel} name={scene.name} />;
    case "plot": return <PlotGrid rel={scene.rel} xName={scene.xName} yName={scene.yName} />;
    case "orchard": return <OrchardView ns={scene.ns} />;
    case "tank": return <TankView t1={scene.t1} v1={scene.v1} t2={scene.t2} v2={scene.v2} />;
    case "taxi": return <TaxiView start={scene.start} perKm={scene.perKm} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
