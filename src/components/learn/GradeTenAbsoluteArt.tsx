import type { ReactNode } from "react";
import { M, plainMath } from "./GradeEightPowersArt";
import { idn, type Fn, type Scene, type Shade } from "@/data/grade-ten-absolute";

export { M, plainMath };
const ink = "#1f3b30", soft = "#5b6b64", accent = "#1c64b5", warm = "#c2410c", fill = "#2b8a3e";

/** Langkah garis bilangan yang rapi untuk rentang tertentu. */
const tickStep = (span: number) => (span <= 12 ? 1 : span <= 24 ? 2 : span <= 60 ? 5 : 10);

/* ---------- Garis bilangan: panah, tanda, dan arsiran interval ---------- */
export function NumberLine({ min, max, arrows = [], marks = [], shade, caption, cls = "w-full max-w-md" }: { min: number; max: number; arrows?: { from: number; to: number; label?: string }[]; marks?: { x: number; label?: string }[]; shade?: Shade | null; caption?: string; cls?: string }) {
  const W = 340, x0 = 18, x1 = W - 18, X = (v: number) => x0 + ((v - min) / (max - min)) * (x1 - x0);
  const rows = arrows.length, base = 30 + rows * 22, H = base + 34 + (marks.some(m => m.label) ? 14 : 0);
  const st = tickStep(max - min), ticks: number[] = []; for (let v = Math.ceil(min / st) * st; v <= max + 1e-9; v += st) ticks.push(Math.round(v * 100) / 100);
  const y = base, L = X(min) - 6, R = X(max) + 6;
  const dot = (v: number, closed: boolean, k: string) => <circle key={k} cx={X(v)} cy={y} r="5" fill={closed ? fill : "#fff"} stroke={fill} strokeWidth="2" />;
  let band: ReactNode = null;
  if (shade) {
    const c = !!shade.closed, a = shade.a ?? 0, b = shade.b ?? 0;
    const seg = (p: number, q: number, k: string) => <line key={k} x1={p} x2={q} y1={y} y2={y} stroke={fill} strokeWidth="6" strokeLinecap="round" opacity="0.85" />;
    if (shade.shape === "antara") band = <g>{seg(X(a), X(b), "s")}{dot(a, c, "a")}{dot(b, c, "b")}</g>;
    if (shade.shape === "luar") band = <g>{seg(L, X(a), "l")}{seg(X(b), R, "r")}{dot(a, c, "a")}{dot(b, c, "b")}</g>;
    if (shade.shape === "kiri") band = <g>{seg(L, X(a), "l")}{dot(a, c, "a")}</g>;
    if (shade.shape === "kanan") band = <g>{seg(X(a), R, "r")}{dot(a, c, "a")}</g>;
    if (shade.shape === "semua") band = seg(L, R, "all");
  }
  const desc = [arrows.length ? `panah ${arrows.map(a => `dari ${idn(a.from)} ke ${idn(a.to)}`).join(", ")}` : "", marks.length ? `titik ${marks.map(m => m.label ?? idn(m.x)).join(", ")}` : ""].filter(Boolean).join("; ");
  return <figure className="flex min-w-0 flex-col items-center gap-1">
    <svg viewBox={`0 0 ${W} ${H}`} className={cls} role="img" aria-label={`Garis bilangan ${idn(min)} sampai ${idn(max)}${desc ? `, ${desc}` : ""}`}>
      <defs><marker id="nl-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={warm} /></marker></defs>
      {arrows.map((a, i) => { const yy = 22 + i * 22; return <g key={i}>
        <line x1={X(a.from)} x2={X(a.to)} y1={yy} y2={yy} stroke={warm} strokeWidth="2" markerEnd="url(#nl-head)" />
        <line x1={X(a.from)} x2={X(a.from)} y1={yy - 4} y2={y} stroke="#ced4da" strokeDasharray="2 3" />
        {a.label && <text x={(X(a.from) + X(a.to)) / 2} y={yy - 5} textAnchor="middle" fontSize="10" fill={ink}>{a.label}</text>}</g>; })}
      <line x1={L - 6} x2={R + 6} y1={y} y2={y} stroke={ink} strokeWidth="1.5" />
      <path d={`M${R + 8} ${y}l-7 -4v8z`} fill={ink} /><path d={`M${L - 8} ${y}l7 -4v8z`} fill={ink} />
      {band}
      {ticks.map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={y - 4} y2={y + 4} stroke={ink} /><text x={X(v)} y={y + 17} textAnchor="middle" fontSize="10" fill={v === 0 ? ink : soft} fontWeight={v === 0 ? 700 : 400}>{idn(v)}</text></g>)}
      {marks.map((m, i) => <g key={`m${i}`}><circle cx={X(m.x)} cy={y} r="4" fill={accent} />{m.label && <text x={X(m.x)} y={y + 31} textAnchor="middle" fontSize="10" fontWeight="600" fill={accent}>{m.label}</text>}</g>)}
    </svg>
    {caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}
  </figure>;
}

/* ---------- Grafik y = s|ax + b| + c ---------- */
export const fnValue = (f: Fn, x: number) => (f.s ?? 1) * Math.abs(f.a * x + f.b) + (f.c ?? 0);
const palette = [accent, warm, "#7048e8"];
export function AbsGraph({ fns, hline, xmin, xmax, ymin, ymax, points = [], cls = "w-full max-w-sm" }: { fns: Fn[]; hline?: { y: number; label: string }; xmin: number; xmax: number; ymin: number; ymax: number; points?: [number, number][]; cls?: string }) {
  const W = 300, H = 230, pad = 24, X = (v: number) => pad + ((v - xmin) / (xmax - xmin)) * (W - 2 * pad), Y = (v: number) => H - pad - ((v - ymin) / (ymax - ymin)) * (H - 2 * pad);
  const sx = tickStep(xmax - xmin), sy = tickStep(ymax - ymin), xs: number[] = [], ys: number[] = [];
  for (let v = Math.ceil(xmin / sx) * sx; v <= xmax; v += sx) xs.push(v);
  for (let v = Math.ceil(ymin / sy) * sy; v <= ymax; v += sy) ys.push(v);
  const clipY = (v: number) => Math.max(ymin - 1, Math.min(ymax + 1, v));
  const path = (f: Fn) => { const pts: string[] = []; const n = 120; for (let i = 0; i <= n; i++) { const x = xmin + ((xmax - xmin) * i) / n; pts.push(`${X(x).toFixed(1)},${Y(clipY(fnValue(f, x))).toFixed(1)}`); } const v = -f.b / f.a; if (v > xmin && v < xmax) { pts.push(`${X(v).toFixed(1)},${Y(clipY(fnValue(f, v))).toFixed(1)}`); pts.sort((p, q) => Number(p.split(",")[0]) - Number(q.split(",")[0])); } return pts.join(" "); };
  const label = fns.map(f => f.label).filter(Boolean).join(" dan ");
  return <svg viewBox={`0 0 ${W} ${H}`} className={cls} role="img" aria-label={`Grafik${label ? ` ${plainMath(label)}` : " nilai mutlak"}${hline ? `, garis ${plainMath(hline.label)}` : ""}${points.length ? `, titik ${points.map(p => `(${idn(p[0])}, ${idn(p[1])})`).join(", ")}` : ""}`}>
    <defs><clipPath id={`clip-${xmin}-${xmax}-${ymin}-${ymax}`}><rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} /></clipPath></defs>
    {xs.map(v => <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={pad} y2={H - pad} stroke="#eef2f0" />)}
    {ys.map(v => <line key={`gy${v}`} y1={Y(v)} y2={Y(v)} x1={pad} x2={W - pad} stroke="#eef2f0" />)}
    {ymin <= 0 && ymax >= 0 && <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke={ink} strokeWidth="1.2" />}
    {xmin <= 0 && xmax >= 0 && <line y1={pad} y2={H - pad} x1={X(0)} x2={X(0)} stroke={ink} strokeWidth="1.2" />}
    {xs.filter(v => v !== 0).map(v => <text key={`tx${v}`} x={X(v)} y={Math.min(H - 8, Math.max(pad + 10, Y(0) + 13))} textAnchor="middle" fontSize="9" fill={soft}>{idn(v)}</text>)}
    {ys.filter(v => v !== 0).map(v => <text key={`ty${v}`} x={Math.max(pad - 4, Math.min(W - pad, X(0) - 4))} y={Y(v) + 3} textAnchor="end" fontSize="9" fill={soft}>{idn(v)}</text>)}
    <g clipPath={`url(#clip-${xmin}-${xmax}-${ymin}-${ymax})`}>
      {hline && <line x1={pad} x2={W - pad} y1={Y(hline.y)} y2={Y(hline.y)} stroke={fill} strokeWidth="2" strokeDasharray="6 4" />}
      {fns.map((f, i) => <polyline key={i} points={path(f)} fill="none" stroke={f.color ?? palette[i % 3]} strokeWidth="2.4" strokeLinejoin="round" />)}
    </g>
    {hline && <text x={W - pad - 2} y={Y(hline.y) - 4} textAnchor="end" fontSize="10" fontWeight="600" fill={fill}><tspan>{plainMath(hline.label)}</tspan></text>}
    {fns.map((f, i) => f.label && <text key={`l${i}`} x={pad + 4} y={pad + 12 + i * 13} fontSize="10" fontWeight="600" fill={f.color ?? palette[i % 3]}>{plainMath(f.label)}</text>)}
    {points.map(([px, py], i) => <circle key={`p${i}`} cx={X(px)} cy={Y(py)} r="4.5" fill={warm} stroke="#fff" strokeWidth="1.5" />)}
  </svg>;
}

export function TableView({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{caption && <caption className="mb-1 font-bold">{caption}</caption>}
    <thead><tr className="bg-success text-success-content">{head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 ${j === 0 ? "font-bold" : ""}`}>{typeof c === "number" ? idn(c) : c}</td>)}</tr>)}</tbody></table></div>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "line": return <NumberLine {...scene} />;
    case "graph": return <AbsGraph {...scene} />;
    case "table": return <TableView head={scene.head} rows={scene.rows} caption={scene.caption} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
