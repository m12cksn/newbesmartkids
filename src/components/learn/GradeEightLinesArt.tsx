import type { KeyboardEvent, ReactNode } from "react";
import { idn, type GLine, type GPoint, type Scene } from "@/data/grade-eight-lines";
import { M, plainMath } from "./GradeEightPowersArt";

export { M, plainMath };
const ink = "#1f3b30", blue = "#1c64b5", orange = "#c2410c";
const colors = [blue, orange, "#2b8a3e", "#7048e8"];

/* ---------- Bidang koordinat dengan garis dan titik ---------- */
export function GraphView({ lines, points = [], r = 6, size = "w-full max-w-xs", label, onPick, picked = [], children, legend = false }: {
  lines: GLine[]; points?: GPoint[]; r?: number; size?: string; label?: string; onPick?: (x: number, y: number) => void; picked?: [number, number][]; children?: ReactNode; legend?: boolean;
}) {
  const W = 260, u = (W - 30) / (2 * r), X = (x: number) => 15 + (x + r) * u, Y = (y: number) => 15 + (r - y) * u;
  const step = r > 8 ? 2 : 1, ticks: number[] = []; for (let k = -r; k <= r; k++) if (k !== 0 && k % step === 0) ticks.push(k);
  const clip = (m: number, c: number): [number, number, number, number] => {
    const pts: [number, number][] = []; const lim = r + 0.4;
    for (const x of [-lim, lim]) { const y = m * x + c; if (Math.abs(y) <= lim + 1e-9) pts.push([x, y]); }
    if (m !== 0) for (const y of [-lim, lim]) { const x = (y - c) / m; if (Math.abs(x) <= lim + 1e-9) pts.push([x, y]); }
    pts.sort((a, b) => a[0] - b[0]); const a = pts[0] ?? [0, 0], b = pts.at(-1) ?? [0, 0]; return [X(a[0]), Y(a[1]), X(b[0]), Y(b[1])];
  };
  const desc = lines.map(l => ("vx" in l ? `garis x = ${idn(l.vx)}` : `garis ${l.label ?? `kemiringan ${idn(l.m)} memotong sumbu-y di ${idn(l.c)}`}`)).join(", ");
  return <svg viewBox={`0 0 ${W} ${W}`} className={size} role={onPick ? "group" : "img"} aria-label={label ?? `Koordinat Cartesius dengan ${desc || "beberapa titik"}${points.length ? `, titik ${points.map(p => `${p.label ?? ""}(${idn(p.x)}, ${idn(p.y)})`).join(", ")}` : ""}`}>
    <rect x="0" y="0" width={W} height={W} fill="#ffffff" />
    {Array.from({ length: 2 * r + 1 }, (_, k) => k - r).map(k => <g key={k} stroke="#e3ebe7" strokeWidth="0.8"><line x1={X(k)} x2={X(k)} y1={Y(-r)} y2={Y(r)} /><line y1={Y(k)} y2={Y(k)} x1={X(-r)} x2={X(r)} /></g>)}
    <line x1={X(-r)} x2={X(r) + 6} y1={Y(0)} y2={Y(0)} stroke="#33413b" strokeWidth="1.4" /><line y1={Y(-r)} y2={Y(r) - 6} x1={X(0)} x2={X(0)} stroke="#33413b" strokeWidth="1.4" />
    <text x={X(r) + 4} y={Y(0) - 4} fontSize="10" fontWeight="700" fill={ink}>x</text><text x={X(0) + 4} y={Y(r) - 2} fontSize="10" fontWeight="700" fill={ink}>y</text>
    {ticks.map(k => <g key={`t${k}`} fontSize="8" fill="#5b6b64"><text x={X(k)} y={Y(0) + 10} textAnchor="middle">{k < 0 ? `−${-k}` : k}</text><text x={X(0) - 3} y={Y(k) + 3} textAnchor="end">{k < 0 ? `−${-k}` : k}</text></g>)}
    {lines.map((l, i) => { const col = colors[i % colors.length];
      if ("vx" in l) return <line key={i} x1={X(l.vx)} x2={X(l.vx)} y1={Y(-r)} y2={Y(r)} stroke={col} strokeWidth="2.2" />;
      const [x1, y1, x2, y2] = clip(l.m, l.c);
      return <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2.2" />{l.label && !legend && <text x={x2 > W - 60 ? x2 - 4 : x2 + 2} y={y2 < 20 ? y2 + 12 : y2 - 4} fontSize="9" fontWeight="700" textAnchor={x2 > W - 60 ? "end" : "start"} fill={col}>{l.label}</text>}</g>; })}
    {points.map((p, i) => <g key={`p${i}`}><circle cx={X(p.x)} cy={Y(p.y)} r="3.6" fill={orange} />{p.label && <text x={X(p.x) + 5} y={Y(p.y) - 5} fontSize="10" fontWeight="800" fill={ink}>{p.label}</text>}</g>)}
    {children}
    {onPick && Array.from({ length: 2 * r + 1 }, (_, a) => a - r).flatMap(x => Array.from({ length: 2 * r + 1 }, (_, b) => b - r).map(y => { const on = picked.some(p => p[0] === x && p[1] === y), act = () => onPick(x, y);
      return <g key={`${x},${y}`} role="button" tabIndex={0} aria-pressed={on} aria-label={`Titik (${x}, ${y})`} className="cursor-pointer" onClick={act} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }}>
        <circle cx={X(x)} cy={Y(y)} r={u / 2} fill="transparent" />{on && <circle cx={X(x)} cy={Y(y)} r="5" fill="#2b8a3e" stroke="#ffffff" strokeWidth="1.5" />}</g>; }))}
  </svg>;
}

/* ---------- Jalur landai (beranda) ---------- */
export function RampView({ rise, run, label = "Beranda" }: { rise: string; run: string; label?: string }) {
  return <svg viewBox="0 0 300 140" className="w-full max-w-sm" role="img" aria-label={`Jalur landai: ${label} setinggi ${rise}, panjang mendatar ${run}`}>
    <rect x="200" y="50" width="90" height="70" fill="#e7d9c4" stroke="#8a6b47" /><text x="245" y="44" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{label}</text>
    <path d="M20 120L200 50V120z" fill="#c9d2cf" stroke="#5b6b64" strokeWidth="1.5" /><line x1="10" x2="295" y1="120" y2="120" stroke="#5b7a3a" strokeWidth="3" />
    <path d="M188 120v-12h12" fill="none" stroke="#e5484d" strokeWidth="1.3" />
    <circle cx="96" cy="84" r="9" fill="none" stroke={ink} strokeWidth="2" /><circle cx="96" cy="84" r="2" fill={ink} /><path d="M96 84l10 -14h8" stroke={ink} strokeWidth="2" fill="none" />
    <text x="208" y="90" fontSize="12" fontWeight="800" fill={orange}>{rise}</text><text x="110" y="136" textAnchor="middle" fontSize="12" fontWeight="800" fill={blue}>{run}</text>
  </svg>;
}

/* ---------- Tangga rumah ---------- */
export function StairsView({ steps, height, depth }: { steps: number; height: string; depth: string }) {
  const w = 220 / steps, h = 100 / steps;
  return <svg viewBox="0 0 300 150" className="w-full max-w-sm" role="img" aria-label={`Tangga dengan ${steps} anak tangga, tinggi total ${height}, kedalaman total ${depth}`}>
    <path d={`M20 120${Array.from({ length: steps }, () => `v-${h}h${w}`).join("")}V120z`} fill="#e7d9c4" stroke="#8a6b47" strokeWidth="1.2" />
    <line x1="20" y1="132" x2="240" y2="132" stroke={blue} strokeWidth="1.2" /><text x="130" y="146" textAnchor="middle" fontSize="11" fontWeight="800" fill={blue}>kedalaman total {depth}</text>
    <line x1="252" y1="120" x2="252" y2="20" stroke={orange} strokeWidth="1.2" /><text x="258" y="74" fontSize="11" fontWeight="800" fill={orange}>{height}</text>
  </svg>;
}

/* ---------- Tangga tempat tidur tingkat ---------- */
export function BedView({ rise, run }: { rise: string; run: string }) {
  return <svg viewBox="0 0 300 170" className="w-full max-w-xs" role="img" aria-label={`Tangga tempat tidur tingkat: tinggi ${rise}, jarak mendatar kaki tangga ${run}`}>
    <rect x="150" y="30" width="130" height="16" fill="#8a6b47" /><rect x="150" y="18" width="130" height="12" rx="3" fill="#cfe1f3" />
    <rect x="150" y="110" width="130" height="16" fill="#8a6b47" /><rect x="150" y="98" width="130" height="12" rx="3" fill="#cfe1f3" />
    <rect x="276" y="10" width="6" height="146" fill="#6b5235" /><rect x="148" y="10" width="6" height="146" fill="#6b5235" />
    <line x1="104" y1="156" x2="150" y2="34" stroke="#a15c1f" strokeWidth="4" /><line x1="116" y1="156" x2="160" y2="40" stroke="#a15c1f" strokeWidth="4" />
    {[0.2, 0.4, 0.6, 0.8].map(t => <line key={t} x1={104 + 46 * t} y1={156 - 122 * t} x2={116 + 44 * t} y2={156 - 116 * t} stroke="#c47a32" strokeWidth="3" />)}
    <line x1="10" x2="295" y1="156" y2="156" stroke="#5b6b64" strokeWidth="2" />
    <line x1="100" y1="34" x2="100" y2="156" stroke={orange} strokeDasharray="4 3" /><text x="94" y="98" textAnchor="end" fontSize="12" fontWeight="800" fill={orange}>{rise}</text>
    <line x1="104" y1="164" x2="150" y2="164" stroke={blue} /><text x="127" y="160" textAnchor="middle" fontSize="11" fontWeight="800" fill={blue}>{run}</text>
  </svg>;
}

/* ---------- Grafik data berkala ---------- */
export function ChartView({ title, xs, ys, unit }: { title: string; xs: string[]; ys: number[]; unit: string }) {
  const max = Math.max(...ys) * 1.25, X = (i: number) => 40 + (i * 220) / Math.max(1, xs.length - 1), Y = (v: number) => 130 - (v / max) * 110;
  return <svg viewBox="0 0 300 160" className="w-full max-w-sm" role="img" aria-label={`${title}: ${xs.map((x, i) => `${x} ${idn(ys[i])} ${unit}`).join(", ")}`}>
    <text x="150" y="12" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{title}</text>
    <line x1="30" x2="290" y1="130" y2="130" stroke="#33413b" /><line x1="30" x2="30" y1="20" y2="130" stroke="#33413b" />
    <polyline points={ys.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke={blue} strokeWidth="2" />
    {ys.map((v, i) => <g key={i}><circle cx={X(i)} cy={Y(v)} r="4" fill={orange} /><text x={X(i)} y={Y(v) - 8} textAnchor="middle" fontSize="10" fontWeight="800" fill={ink}>{idn(v)} {unit}</text><text x={X(i)} y="145" textAnchor="middle" fontSize="10" fill={ink}>{xs[i]}</text></g>)}
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "graph": return <figure className="flex w-full max-w-xs flex-col items-center"><GraphView lines={scene.lines} points={scene.points} r={scene.r} legend />
      {scene.lines.some(l => l.label) && <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-bold">{scene.lines.map((l, i) => l.label && <li key={i} className="flex items-center gap-1"><span aria-hidden="true" className="inline-block h-1 w-5 rounded" style={{ background: colors[i % colors.length] }} /><M text={l.label} /></li>)}</ul>}{scene.caption && <figcaption className="text-sm font-semibold">{scene.caption}</figcaption>}</figure>;
    case "graphs": return <div className="grid w-full grid-cols-2 gap-2">{scene.items.map(it => <figure key={it.caption} className="flex flex-col items-center rounded-lg bg-base-100 p-1"><GraphView lines={it.lines} points={it.points} r={it.r} label={`Grafik ${it.caption}`} /><figcaption className="text-sm font-bold">{it.caption}</figcaption></figure>)}</div>;
    case "ramp": return <RampView rise={scene.rise} run={scene.run} label={scene.label} />;
    case "stairs": return <StairsView steps={scene.steps} height={scene.height} depth={scene.depth} />;
    case "bed": return <BedView rise={scene.rise} run={scene.run} />;
    case "chart": return <ChartView title={scene.title} xs={scene.xs} ys={scene.ys} unit={scene.unit} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
