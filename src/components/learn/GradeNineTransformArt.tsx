import type { KeyboardEvent, ReactNode } from "react";
import { M, plainMath } from "./GradeEightPowersArt";
import { idn, type MLine, type Poly, type Pt, type Scene } from "@/data/grade-nine-transform";

export { M, plainMath };
const ink = "#1f3b30";
export const tones = { awal: { fill: "#f8c7c7", stroke: "#c92a2a" }, bayangan: { fill: "#c5dcf7", stroke: "#1c64b5" }, lain: { fill: "#e9ecef", stroke: "#495057" } };

/* ---------- Bidang koordinat dengan bangun, titik, garis, panah, dan titik yang dapat diketuk ---------- */
export function Plane({ polys = [], points = [], lines = [], arrows = [], r = 6, onPick, picked = [], size = "w-full max-w-xs", label, children }: {
  polys?: Poly[]; points?: { p: Pt; label?: string; color?: string }[]; lines?: { l: MLine; label?: string }[]; arrows?: [Pt, Pt][]; r?: number;
  onPick?: (x: number, y: number) => void; picked?: Pt[]; size?: string; label?: string; children?: (X: (x: number) => number, Y: (y: number) => number) => ReactNode;
}) {
  const W = 260, u = (W - 30) / (2 * r), X = (x: number) => 15 + (x + r) * u, Y = (y: number) => 15 + (r - y) * u, step = r > 6 ? 2 : 1;
  const ticks: number[] = []; for (let k = -r; k <= r; k++) if (k !== 0 && k % step === 0) ticks.push(k);
  const lineSeg = (l: MLine): [number, number, number, number] => "x" in l ? [X(l.x), Y(-r), X(l.x), Y(r)] : "y" in l ? [X(-r), Y(l.y), X(r), Y(l.y)] : [X(-r), Y(l.m * -r + l.c), X(r), Y(l.m * r + l.c)];
  const desc = label ?? `Bidang koordinat${polys.map(p => `, bangun ${p.names ?? ""} dengan titik ${p.pts.map(([a, b]) => `(${a}, ${b})`).join(" ")}`).join("")}${points.map(p => `, titik ${p.label ?? ""}(${idn(p.p[0])}, ${idn(p.p[1])})`).join("")}${lines.map(l => `, garis ${l.label ?? ""}`).join("")}`;
  return <svg viewBox={`0 0 ${W} ${W}`} className={size} role={onPick ? "group" : "img"} aria-label={desc}>
    <defs><marker id="tr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2b8a3e" /></marker></defs>
    <rect width={W} height={W} fill="#ffffff" />
    {Array.from({ length: 2 * r + 1 }, (_, k) => k - r).map(k => <g key={k} stroke="#e3ebe7" strokeWidth="0.8"><line x1={X(k)} x2={X(k)} y1={Y(-r)} y2={Y(r)} /><line y1={Y(k)} y2={Y(k)} x1={X(-r)} x2={X(r)} /></g>)}
    <line x1={X(-r)} x2={X(r) + 6} y1={Y(0)} y2={Y(0)} stroke="#33413b" strokeWidth="1.4" /><line y1={Y(-r)} y2={Y(r) - 6} x1={X(0)} x2={X(0)} stroke="#33413b" strokeWidth="1.4" />
    <text x={X(r) + 4} y={Y(0) - 4} fontSize="10" fontWeight="700" fill={ink}>x</text><text x={X(0) + 4} y={Y(r) - 2} fontSize="10" fontWeight="700" fill={ink}>y</text>
    {ticks.map(k => <g key={`t${k}`} fontSize="8" fill="#5b6b64"><text x={X(k)} y={Y(0) + 10} textAnchor="middle">{k < 0 ? `−${-k}` : k}</text><text x={X(0) - 3} y={Y(k) + 3} textAnchor="end">{k < 0 ? `−${-k}` : k}</text></g>)}
    {lines.map((l, i) => { const [x1, y1, x2, y2] = lineSeg(l.l); return <g key={`l${i}`}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7048e8" strokeWidth="2" strokeDasharray="6 3" />{l.label && <text x={Math.min(x2, W - 40) - 2} y={Math.max(y2, 24) + (y1 === y2 ? -4 : 10)} fontSize="9" fontWeight="800" fill="#7048e8" textAnchor="end">{l.label}</text>}</g>; })}
    {polys.map((p, i) => { const t = tones[p.tone ?? "awal"], cx = p.pts.reduce((a, q) => a + q[0], 0) / p.pts.length, cy = p.pts.reduce((a, q) => a + q[1], 0) / p.pts.length;
      return <g key={`p${i}`}><polygon points={p.pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")} fill={t.fill} fillOpacity="0.75" stroke={t.stroke} strokeWidth="1.8" strokeLinejoin="round" />
        {p.names && p.names.length === p.pts.length ? p.pts.map(([a, b], k) => <text key={k} x={X(a) + (a >= cx ? 4 : -4)} y={Y(b) + (b >= cy ? -4 : 11)} textAnchor={a >= cx ? "start" : "end"} fontSize="10" fontWeight="800" fill={t.stroke}>{p.names![k]}</text>)
          : p.names && <text x={X(cx)} y={Y(cy) + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={t.stroke}>{p.names}</text>}</g>; })}
    {arrows.map(([a, b], i) => <line key={`a${i}`} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} stroke="#2b8a3e" strokeWidth="1.6" markerEnd="url(#tr-arrow)" />)}
    {points.map((p, i) => <g key={`q${i}`}><circle cx={X(p.p[0])} cy={Y(p.p[1])} r="3.8" fill={p.color ?? "#c2410c"} />{p.label && <text x={X(p.p[0]) + 5} y={Y(p.p[1]) - 5} fontSize="10" fontWeight="800" fill={ink}>{p.label}</text>}</g>)}
    {children?.(X, Y)}
    {onPick && Array.from({ length: 2 * r + 1 }, (_, a) => a - r).flatMap(x => Array.from({ length: 2 * r + 1 }, (_, b) => b - r).map(y => { const on = picked.some(p => p[0] === x && p[1] === y), act = () => onPick(x, y);
      return <g key={`${x},${y}`} role="button" tabIndex={0} aria-pressed={on} aria-label={`Titik (${x}, ${y})`} className="cursor-pointer" onClick={act} onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } }}>
        <circle cx={X(x)} cy={Y(y)} r={u / 2} fill="transparent" />{on && <circle cx={X(x)} cy={Y(y)} r="5" fill="#1c64b5" stroke="#ffffff" strokeWidth="1.5" />}</g>; }))}
  </svg>;
}

/* ---------- Pasangan bangun merah dan biru ---------- */
function PairsView({ items }: { items: { a: Pt[]; b: Pt[]; caption: string }[] }) {
  return <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-3">{items.map(it => { const s = 22, all = [...it.a, ...it.b], mx = Math.max(...all.map(p => p[0])) + 1, my = Math.max(...all.map(p => p[1])) + 1;
    return <figure key={it.caption} className="flex flex-col items-center rounded-lg bg-base-100 p-1"><svg viewBox={`0 0 ${mx * s + 10} ${my * s + 10}`} className="w-full max-w-[10rem]" role="img" aria-label={`Pasangan ${it.caption}: bangun merah ${it.a.map(p => `(${p})`).join(" ")}, bangun biru ${it.b.map(p => `(${p})`).join(" ")}`}>
      {Array.from({ length: mx + 1 }, (_, k) => <line key={`v${k}`} x1={5 + k * s} x2={5 + k * s} y1={5} y2={5 + my * s} stroke="#e3ebe7" />)}{Array.from({ length: my + 1 }, (_, k) => <line key={`h${k}`} y1={5 + k * s} y2={5 + k * s} x1={5} x2={5 + mx * s} stroke="#e3ebe7" />)}
      {[it.a, it.b].map((ps, k) => <polygon key={k} points={ps.map(([x, y]) => `${5 + x * s},${5 + (my - y) * s}`).join(" ")} fill={k ? tones.bayangan.fill : tones.awal.fill} stroke={k ? tones.bayangan.stroke : tones.awal.stroke} strokeWidth="1.8" fillOpacity="0.8" />)}
    </svg><figcaption className="text-sm font-bold">{it.caption}</figcaption></figure>; })}</div>;
}

export function FigureView({ w, h, polys, labels, segs = [] }: Extract<Scene, { type: "figure" }>) {
  return <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[15rem]" role="img" aria-label={`Gambar dengan titik ${labels.map(l => l.t).join(", ")}`}>
    {polys.map((p, i) => <polygon key={i} points={p.pts.map(q => q.join(",")).join(" ")} fill={p.fill ?? "#dbe8f5"} stroke={ink} strokeWidth="1.6" />)}
    {segs.map(([a, b], i) => <line key={`s${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#c2410c" strokeWidth="1.6" />)}
    {labels.map(l => <text key={l.t} x={l.x} y={l.y} textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>{l.t}</text>)}
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "plane": return <Plane polys={scene.polys} points={scene.points} lines={scene.lines} arrows={scene.arrows} r={scene.r} />;
    case "pairs": return <PairsView items={scene.items} />;
    case "figure": return <FigureView {...scene} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
