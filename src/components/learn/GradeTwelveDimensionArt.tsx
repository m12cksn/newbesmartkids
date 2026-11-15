"use client";

import { RotateCcw, RotateCw } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { M as BaseM, plainMath } from "./GradeEightPowersArt";
import { edgesOf, FACES, idn, solidPoints, type Scene, type Shape, type V3 } from "@/data/grade-twelve-dimension";

export { plainMath };
export const M = ({ text }: { text: string }) => <BaseM text={text.replace(/\{\(([^(){}]*)\)\//g, "{$1/").replace(/\/\(([^(){}]*)\)\}/g, "/$1}")} />;
const ink = "#1f3b30", soft = "#5b6b64", red = "#d6336c", blue = "#1c64b5", leaf = "#2b8a3e";

/* ---------- Proyeksi ortografis dengan putaran ---------- */
export function projector(points: V3[], yaw: number, pitch: number, W: number, H: number, pad = 26) {
  const c = points.reduce((a, p) => [a[0] + p[0] / points.length, a[1] + p[1] / points.length, a[2] + p[2] / points.length], [0, 0, 0]);
  const t = (yaw * Math.PI) / 180, f = (pitch * Math.PI) / 180;
  const rot = (p: V3) => { const x = p[0] - c[0], y = p[1] - c[1], z = p[2] - c[2], x1 = x * Math.cos(t) - y * Math.sin(t), y1 = x * Math.sin(t) + y * Math.cos(t); return { x: x1, up: y1 * Math.sin(f) + z * Math.cos(f), depth: y1 * Math.cos(f) - z * Math.sin(f) }; };
  const rs = points.map(rot), xs = rs.map(r => r.x), ys = rs.map(r => r.up);
  // Skala dari jari-jari terjauh agar ukuran gambar tidak berubah saat diputar.
  const R = Math.max(...points.map(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])), 1e-6), k = Math.min(W - 2 * pad, H - 2 * pad) / (2 * R);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const to = (p: V3) => { const r = rot(p); return { x: W / 2 + (r.x - cx) * k, y: H / 2 - (r.up - cy) * k, depth: r.depth }; };
  return { to };
}
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Tombol dan seret untuk memutar gambar. */
export function useSpin(initial = -32) {
  const [yaw, setYaw] = useState(initial); const drag = useRef<number | null>(null);
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => { drag.current = e.clientX; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); },
    onPointerMove: (e: React.PointerEvent) => { if (drag.current === null) return; const dx = e.clientX - drag.current; drag.current = e.clientX; setYaw(y => y + dx * 0.6); },
    onPointerUp: () => { drag.current = null; }, onPointerCancel: () => { drag.current = null; },
  };
  return { yaw, setYaw, handlers };
}
export function SpinButtons({ setYaw }: { setYaw: (f: (y: number) => number) => void }) {
  return <span className="flex gap-1"><button type="button" aria-label="Putar gambar ke kiri" className="btn btn-xs btn-ghost btn-square" onClick={() => setYaw(y => y - 20)}><RotateCcw className="size-3.5" aria-hidden="true" /></button>
    <button type="button" aria-label="Putar gambar ke kanan" className="btn btn-xs btn-ghost btn-square" onClick={() => setYaw(y => y + 20)}><RotateCw className="size-3.5" aria-hidden="true" /></button></span>;
}

/* ---------- Bangun ruang ---------- */
export type Seg = { a: string; b: string; color?: string; dashed?: boolean };
export function Solid({ shape, dims, extra = {}, segs = [], plane, names = {}, caption, highlight = [], children }: { shape: Shape; dims: number[]; extra?: Record<string, V3>; segs?: Seg[]; plane?: string[]; names?: Record<string, string>; caption?: string; highlight?: string[]; children?: ReactNode }) {
  const { yaw, setYaw, handlers } = useSpin();
  const W = 300, H = 240, base = solidPoints(shape, dims), corner = Object.fromEntries(Object.entries(base).filter(([k]) => k !== "O")), pts: Record<string, V3> = { ...base, ...extra };
  const { to } = projector(Object.values({ ...corner, ...extra }), yaw, 20, W, H);
  const centroid = Object.values(corner).reduce((a, p, _, arr) => [a[0] + p[0] / arr.length, a[1] + p[1] / arr.length, a[2] + p[2] / arr.length], [0, 0, 0] as V3);
  const faceVisible = (f: string) => { const v = f.split("").map(k => pts[k]), n = cross(sub(v[1], v[0]), sub(v[2], v[0])), fc = v.reduce((a, p) => [a[0] + p[0] / v.length, a[1] + p[1] / v.length, a[2] + p[2] / v.length], [0, 0, 0] as V3);
    const out = dot(n, sub(fc, centroid)) < 0 ? [-n[0], -n[1], -n[2]] as V3 : n; const tip = to([fc[0] + out[0], fc[1] + out[1], fc[2] + out[2]]), mid = to(fc); return tip.depth < mid.depth; };
  const vis = new Set(FACES[shape].filter(faceVisible));
  const adjacent = (f: string, a: string, b: string) => { const i = f.indexOf(a), j = f.indexOf(b); return i >= 0 && j >= 0 && (Math.abs(i - j) === 1 || Math.abs(i - j) === f.length - 1); };
  const edges = edgesOf(shape).map(e => ({ a: e[0], b: e[1], hidden: !FACES[shape].some(f => vis.has(f) && adjacent(f, e[0], e[1])) }));
  const P = (k: string) => to(pts[k]), screenC = to(centroid), label = (k: string) => names[k] ?? k;
  const off = (k: string) => { const p = P(k), dx = p.x - screenC.x, dy = p.y - screenC.y, l = Math.hypot(dx, dy) || 1; return { x: p.x + (dx / l) * 13, y: p.y + (dy / l) * 13 + 4 }; };
  const desc = `${shape === "kubus" ? "Kubus" : shape === "balok" ? "Balok" : "Limas"} ${Object.keys(corner).map(label).join("")}${plane ? `, bidang ${plane.map(label).join("")} diarsir` : ""}${segs.length ? `, ruas ${segs.map(s => label(s.a) + label(s.b)).join(", ")}` : ""}`;
  return <figure className="flex min-w-0 flex-col items-center gap-1">
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm cursor-grab touch-pan-y select-none" role="img" aria-label={desc} {...handlers}>
      {plane && <polygon points={plane.map(k => `${P(k).x},${P(k).y}`).join(" ")} fill={leaf} opacity="0.22" stroke={leaf} strokeWidth="1" />}
      {edges.map(e => <line key={e.a + e.b} x1={P(e.a).x} y1={P(e.a).y} x2={P(e.b).x} y2={P(e.b).y} stroke={ink} strokeWidth={e.hidden ? 1 : 1.6} strokeDasharray={e.hidden ? "4 4" : undefined} opacity={e.hidden ? 0.7 : 1} />)}
      {segs.map((s, i) => <line key={`s${i}`} x1={P(s.a).x} y1={P(s.a).y} x2={P(s.b).x} y2={P(s.b).y} stroke={s.color ?? red} strokeWidth="2.6" strokeDasharray={s.dashed ? "6 4" : undefined} strokeLinecap="round" />)}
      {Object.keys(pts).filter(k => k in corner || k in extra || highlight.includes(k)).map(k => <g key={k}>
        <circle cx={P(k).x} cy={P(k).y} r={highlight.includes(k) || k in extra ? 3.6 : 2} fill={highlight.includes(k) ? red : k in extra ? blue : ink} />
        <text x={off(k).x} y={off(k).y} textAnchor="middle" fontSize="12" fontWeight="700" fill={k in extra ? blue : ink}>{label(k)}</text></g>)}
      {children}
    </svg>
    <div className="flex items-center gap-2 text-xs text-base-content/60"><SpinButtons setYaw={setYaw} /><span>Seret atau tekan tombol untuk memutar</span></div>
    {caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}
  </figure>;
}

/* ---------- Peta titik dan jalan ---------- */
export function Net({ nodes, edges, path = [], caption }: { nodes: Record<string, [number, number]>; edges: [string, string, string][]; path?: string[]; caption?: string }) {
  const on = (a: string, b: string) => path.some((p, i) => i > 0 && ((path[i - 1] === a && p === b) || (path[i - 1] === b && p === a)));
  return <figure className="flex flex-col items-center gap-1"><svg viewBox="0 0 250 200" className="w-full max-w-xs" role="img" aria-label={`Peta: ${edges.map(([a, b, l]) => `${a} ke ${b} ${l}`).join(", ")}`}>
    {edges.map(([a, b, l]) => { const p = nodes[a], q = nodes[b], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; return <g key={a + b}>
      <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={on(a, b) ? red : soft} strokeWidth={on(a, b) ? 3.4 : 1.6} strokeLinecap="round" />
      <rect x={mx - 19} y={my - 8} width="38" height="15" rx="4" fill="#fff" opacity="0.9" /><text x={mx} y={my + 3.5} textAnchor="middle" fontSize="10" fill={ink}>{l}</text></g>; })}
    {Object.entries(nodes).map(([k, [x, y]]) => <g key={k}><circle cx={x} cy={y} r="7" fill={path.includes(k) ? red : ink} /><text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">{k}</text></g>)}
  </svg>{caption && <figcaption className="text-xs text-base-content/70">{caption}</figcaption>}</figure>;
}

/* ---------- Gambar datar dengan tanda siku-siku ---------- */
export function Flat({ points, segs, right = [], caption }: { points: Record<string, [number, number]>; segs: [string, string, boolean?][]; right?: [string, string, string][]; caption?: string }) {
  const xs = Object.values(points).map(p => p[0]), ys = Object.values(points).map(p => p[1]), W = 260, H = 190, pad = 26;
  const k = Math.min((W - 2 * pad) / (Math.max(...xs) - Math.min(...xs) || 1), (H - 2 * pad) / (Math.max(...ys) - Math.min(...ys) || 1));
  const X = (p: [number, number]) => [pad + (p[0] - Math.min(...xs)) * k, H - pad - (p[1] - Math.min(...ys)) * k];
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length, cy = ys.reduce((a, b) => a + b, 0) / ys.length;
  return <figure className="flex flex-col items-center gap-1"><svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" role="img" aria-label={`Gambar titik ${Object.keys(points).join(", ")}${right.length ? `, sudut siku-siku di ${right.map(r => r[0]).join(", ")}` : ""}`}>
    {segs.map(([a, b, dashed]) => { const p = X(points[a]), q = X(points[b]); return <line key={a + b} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={dashed ? red : ink} strokeWidth={dashed ? 2.2 : 1.6} strokeDasharray={dashed ? "5 4" : undefined} />; })}
    {right.map(([v, a, b]) => { const o = X(points[v]), pa = X(points[a]), pb = X(points[b]), u = (p: number[]) => { const dx = p[0] - o[0], dy = p[1] - o[1], l = Math.hypot(dx, dy) || 1; return [(dx / l) * 9, (dy / l) * 9]; }, ua = u(pa), ub = u(pb);
      return <path key={v} d={`M${o[0] + ua[0]} ${o[1] + ua[1]} L${o[0] + ua[0] + ub[0]} ${o[1] + ua[1] + ub[1]} L${o[0] + ub[0]} ${o[1] + ub[1]}`} fill="none" stroke={ink} />; })}
    {Object.entries(points).map(([n, p]) => { const [x, y] = X(p), dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return <g key={n}><circle cx={x} cy={y} r="2.6" fill={ink} /><text x={x + (dx / l) * 12} y={y - (dy / l) * 12 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={ink}>{n}</text></g>; })}
  </svg>{caption && <figcaption className="text-xs text-base-content/70">{caption}</figcaption>}</figure>;
}

/* ---------- Bidang koordinat ---------- */
export function Coords({ points, range }: { points: Record<string, [number, number]>; range: number }) {
  const W = 220, c = W / 2, k = (W / 2 - 14) / range, X = (v: number) => c + v * k, Y = (v: number) => c - v * k, step = range > 8 ? 2 : 1;
  const ticks = Array.from({ length: Math.floor(range / step) * 2 + 1 }, (_, i) => (i - Math.floor(range / step)) * step);
  const pts = Object.entries(points);
  return <svg viewBox={`0 0 ${W} ${W}`} className="w-full max-w-[15rem]" role="img" aria-label={`Bidang koordinat dengan titik ${pts.map(([n, p]) => `${n}(${idn(p[0])}, ${idn(p[1])})`).join(", ")}`}>
    {ticks.map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1="6" y2={W - 6} stroke="#eef2f0" /><line y1={Y(t)} y2={Y(t)} x1="6" x2={W - 6} stroke="#eef2f0" /></g>)}
    <line x1="6" x2={W - 6} y1={c} y2={c} stroke={ink} /><line y1="6" y2={W - 6} x1={c} x2={c} stroke={ink} />
    {pts.length === 2 && <><line x1={X(pts[0][1][0])} y1={Y(pts[0][1][1])} x2={X(pts[1][1][0])} y2={Y(pts[1][1][1])} stroke={red} strokeWidth="2" />
      <path d={`M${X(pts[0][1][0])} ${Y(pts[0][1][1])} H${X(pts[1][1][0])} V${Y(pts[1][1][1])}`} fill="none" stroke={blue} strokeDasharray="4 3" /></>}
    {pts.map(([n, p]) => <g key={n}><circle cx={X(p[0])} cy={Y(p[1])} r="3.5" fill={red} /><text x={X(p[0]) + 6} y={Y(p[1]) - 6} fontSize="11" fontWeight="700" fill={ink}>{n}({idn(p[0])}, {idn(p[1])})</text></g>)}
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "solid": return <Solid shape={scene.shape} dims={scene.dims} extra={scene.extra} segs={(scene.segs ?? []).map(([a, b]) => ({ a, b }))} plane={scene.plane} names={scene.names} caption={scene.caption} />;
    case "graph": return <Net nodes={scene.nodes} edges={scene.edges} caption={scene.caption} />;
    case "flat": return <Flat points={scene.points} segs={scene.segs} right={scene.right} caption={scene.caption} />;
    case "coords": return <Coords points={scene.points} range={scene.range} />;
  }
}
