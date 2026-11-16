"use client";

import { useId, type ReactNode } from "react";
import { M as BaseM, plainMath } from "./GradeEightPowersArt";
import { idn, type Fig, type Plane, type Pt, type Scene } from "@/data/grade-twelve-congruence";

export { plainMath };
export const M = ({ text }: { text: string }) => <BaseM text={text.replace(/\{\(([^(){}]*)\)\//g, "{$1/").replace(/\/\(([^(){}]*)\)\}/g, "/$1}")} />;
const ink = "#1f3b30", soft = "#5b6b64", green = "#2b8a3e", blue = "#1c64b5", red = "#d6336c", warm = "#f59f00";

/* ---------- Gambar bangun datar dengan label sisi, sudut, turus, dan busur ---------- */
export function FigView({ fig, color = green, extra, highlight = [], hl2 = [] }: { fig: Fig; color?: string; extra?: (to: (p: Pt) => [number, number]) => ReactNode; highlight?: string[]; hl2?: string[] }) {
  const all = Object.entries(fig.pts), hide = fig.hide ?? [];
  const xs = all.map(([, p]) => p[0]), ys = all.map(([, p]) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 1e-6), h = Math.max(maxY - minY, 1e-6), W = 320, pad = 30, k = Math.min((W - 2 * pad) / w, 200 / h), H = h * k + 2 * pad;
  const to = (p: Pt): [number, number] => [pad + (p[0] - minX) * k + ((W - 2 * pad) - w * k) / 2, H - pad - (p[1] - minY) * k];
  const P = (name: string) => to(fig.pts[name]);
  const cen = to([(minX + maxX) / 2, (minY + maxY) / 2]);
  const polyOf = (v: string) => (fig.polys ?? []).find(pl => pl.includes(v));
  const polyCenter = (pl?: string) => (pl ? pl.split("").reduce((a, c) => [a[0] + P(c)[0] / pl.length, a[1] + P(c)[1] / pl.length], [0, 0]) : cen);
  const neighbors = (v: string): [string, string] | null => { const pl = polyOf(v); if (!pl) return null; const i = pl.indexOf(v); return [pl[(i - 1 + pl.length) % pl.length], pl[(i + 1) % pl.length]]; };
  const unit = (dx: number, dy: number) => { const L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  const edgeMid = (e: string) => { const a = P(e[0]), b = P(e[1]); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a, b] as const; };
  const label = `Gambar ${fig.polys?.join(" dan ") ?? "bangun"}${fig.sides ? `, ${Object.entries(fig.sides).map(([e, v]) => `${e} = ${v}`).join(", ")}` : ""}${fig.angles ? `, ${Object.entries(fig.angles).map(([a, v]) => `sudut ${a} = ${v}`).join(", ")}` : ""}`;
  return <figure className="w-full max-w-sm">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      {(fig.shade ?? []).map(pl => <polygon key={pl} points={pl.split("").map(c => P(c).join(",")).join(" ")} fill="#adb5bd" opacity="0.6" />)}
      {(fig.polys ?? []).map((pl, i) => <polygon key={pl} points={pl.split("").map(c => P(c).join(",")).join(" ")} fill={i % 2 ? "#e7f0fb" : "#e6f4ea"} fillOpacity="0.55" stroke={i % 2 ? blue : color} strokeWidth="2" strokeLinejoin="round" />)}
      {(fig.segs ?? []).map(([a, b, st], i) => { const p = P(a), q2 = P(b); return <line key={i} x1={p[0]} y1={p[1]} x2={q2[0]} y2={q2[1]} stroke={ink} strokeWidth="1.8" strokeDasharray={st === "dash" ? "5 4" : undefined} />; })}
      {Object.entries(fig.ticks ?? {}).map(([e, nT]) => { const [mx, my, a, b] = edgeMid(e), [ux, uy] = unit(b[0] - a[0], b[1] - a[1]);
        return <g key={e}>{Array.from({ length: nT }, (_, j) => { const o = (j - (nT - 1) / 2) * 5; return <line key={j} x1={mx + ux * o - uy * 6} y1={my + uy * o + ux * 6} x2={mx + ux * o + uy * 6} y2={my + uy * o - ux * 6} stroke={red} strokeWidth="1.8" />; })}</g>; })}
      {(fig.right ?? []).map(t => { const v = P(t[1]), [ax, ay] = unit(P(t[0])[0] - v[0], P(t[0])[1] - v[1]), [bx, by] = unit(P(t[2])[0] - v[0], P(t[2])[1] - v[1]), s = 10;
        return <path key={t} d={`M ${v[0] + ax * s} ${v[1] + ay * s} L ${v[0] + (ax + bx) * s} ${v[1] + (ay + by) * s} L ${v[0] + bx * s} ${v[1] + by * s}`} fill="none" stroke={ink} strokeWidth="1.4" />; })}
      {[...Object.keys(fig.angles ?? {}), ...Object.keys(fig.arcs ?? {})].filter((v, i, a) => a.indexOf(v) === i).map(v => { const nb = neighbors(v); if (!nb) return null; const c = P(v), [ax, ay] = unit(P(nb[0])[0] - c[0], P(nb[0])[1] - c[1]), [bx, by] = unit(P(nb[1])[0] - c[0], P(nb[1])[1] - c[1]);
        const cross = ax * by - ay * bx, nArc = fig.arcs?.[v] ?? 1, [mx, my] = unit(ax + bx, ay + by), txt = fig.angles?.[v];
        return <g key={v}>{Array.from({ length: nArc }, (_, j) => { const r = 15 + j * 4; return <path key={j} d={`M ${c[0] + ax * r} ${c[1] + ay * r} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${c[0] + bx * r} ${c[1] + by * r}`} fill="none" stroke={warm} strokeWidth="1.8" />; })}
          {txt && <text x={c[0] + mx * 32} y={c[1] + my * 32 + 4} fontSize="11" fontWeight="700" textAnchor="middle" fill="#b35c00">{txt}</text>}</g>; })}
      {Object.entries(fig.sides ?? {}).map(([e, v]) => { const [mx, my, a, b] = edgeMid(e), c = polyCenter(polyOf(e[0]) && polyOf(e[0])!.includes(e[1]) ? polyOf(e[0]) : undefined);
        const [ux, uy] = unit(b[0] - a[0], b[1] - a[1]); let nx = -uy, ny = ux; if ((mx - c[0]) * nx + (my - c[1]) * ny < 0) { nx = -nx; ny = -ny; }
        return <text key={e} x={mx + nx * 13} y={my + ny * 13 + 4} fontSize="11.5" fontWeight="700" textAnchor="middle" fill={ink}>{v}</text>; })}
      {all.filter(([nme]) => !hide.includes(nme)).map(([nme, p]) => { const c = polyCenter(polyOf(nme)), v = to(p), [ux, uy] = unit(v[0] - c[0], v[1] - c[1]);
        const on = highlight.includes(nme) || hl2.includes(nme);
        return <g key={nme}>{on && <circle cx={v[0]} cy={v[1]} r="6" fill={highlight.includes(nme) ? green : blue} />}<circle cx={v[0]} cy={v[1]} r="2.5" fill={ink} /><text x={v[0] + ux * 14} y={v[1] + uy * 14 + 4} fontSize="13" fontWeight="800" textAnchor="middle" fill={ink}>{nme}</text></g>; })}
      {extra?.(to)}
    </svg>
    {fig.caption && <figcaption className="text-center text-xs text-base-content/70">{fig.caption}</figcaption>}
  </figure>;
}

/* ---------- Bidang Kartesius ---------- */
const COL = { green, blue, red };
export function PlaneView({ plane }: { plane: Plane }) {
  const [x0, x1, y0, y1] = plane.range, W = 320, pad = 18, k = Math.min((W - 2 * pad) / (x1 - x0), 260 / (y1 - y0)), H = (y1 - y0) * k + 2 * pad;
  const X = (x: number) => pad + (x - x0) * k, Y = (y: number) => H - pad - (y - y0) * k, every = x1 - x0 > 12 ? 2 : 1;
  const xs: number[] = [], ys: number[] = []; for (let x = Math.ceil(x0); x <= x1; x++) xs.push(x); for (let y = Math.ceil(y0); y <= y1; y++) ys.push(y);
  return <figure className="w-full max-w-sm">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Bidang Kartesius: ${plane.shapes.map(s => s.names.map((nm, i) => `${nm}(${s.pts[i].join(", ")})`).join(", ")).join("; ")}`}>
      {xs.map(x => <line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(y0)} y2={Y(y1)} stroke="#e3e8e5" />)}{ys.map(y => <line key={`y${y}`} y1={Y(y)} y2={Y(y)} x1={X(x0)} x2={X(x1)} stroke="#e3e8e5" />)}
      <line x1={X(x0)} x2={X(x1)} y1={Y(0)} y2={Y(0)} stroke={ink} /><line y1={Y(y0)} y2={Y(y1)} x1={X(0)} x2={X(0)} stroke={ink} />
      {xs.filter(x => x && x % every === 0).map(x => <text key={`tx${x}`} x={X(x)} y={Y(0) + 12} fontSize="9" textAnchor="middle" fill={soft}>{x}</text>)}
      {ys.filter(y => y && y % every === 0).map(y => <text key={`ty${y}`} x={X(0) - 4} y={Y(y) + 3} fontSize="9" textAnchor="end" fill={soft}>{y}</text>)}
      <text x={X(0) - 4} y={Y(0) + 12} fontSize="9" textAnchor="end" fill={soft}>O</text>
      {plane.shapes.map((s, i) => <g key={i}>
        {s.pts.length > 2 ? <polygon points={s.pts.map(p => `${X(p[0])},${Y(p[1])}`).join(" ")} fill={COL[s.color]} fillOpacity="0.15" stroke={COL[s.color]} strokeWidth="2" /> : <line x1={X(s.pts[0][0])} y1={Y(s.pts[0][1])} x2={X(s.pts[1][0])} y2={Y(s.pts[1][1])} stroke={COL[s.color]} strokeWidth="2.2" />}
        {s.pts.map((p, j) => <g key={j}><circle cx={X(p[0])} cy={Y(p[1])} r="3" fill={COL[s.color]} /><text x={X(p[0]) + 5} y={Y(p[1]) - 5} fontSize="11.5" fontWeight="800" fill={COL[s.color]}>{s.names[j]}</text></g>)}
      </g>)}
    </svg>
    {plane.caption && <figcaption className="text-center text-xs text-base-content/70">{plane.caption}</figcaption>}
  </figure>;
}

/* ---------- Bayangan tongkat dan gedung/pohon ---------- */
export function Shadow({ stick, stickShadow, objShadow, height, object, unit, caption }: { stick: number; stickShadow: number; objShadow: number; height?: number; object: "pohon" | "gedung"; unit: string; caption?: string }) {
  const H = stick * objShadow / stickShadow, sc = 150 / Math.max(H, stick), sx = 230 / (objShadow + stickShadow * 1.4 + 2 * stickShadow);
  const gy = 175, sX = 20 + stickShadow * sx * 0.2, tipS = sX + stickShadow * sx, oX = tipS + stickShadow * sx * 0.8 + 12, tipO = oX + objShadow * sx, idA = useId().replace(/:/g, "");
  const show = (v: number) => `${idn(v)} ${unit}`;
  return <figure className="w-full max-w-sm">
    <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={`Tongkat setinggi ${show(stick)} dengan bayangan ${show(stickShadow)}, ${object} dengan bayangan ${show(objShadow)}${height !== undefined ? ` dan tinggi ${show(height)}` : ""}`}>
      <defs><linearGradient id={idA} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e7f5ff" /><stop offset="1" stopColor="#ffffff" /></linearGradient></defs>
      <rect x="0" y="0" width="320" height={gy} fill={`url(#${idA})`} />
      <circle cx="292" cy="22" r="12" fill="#ffd43b" />
      <line x1="0" x2="320" y1={gy} y2={gy} stroke="#7c6f57" strokeWidth="3" />
      {/* tongkat */}
      <polygon points={`${sX},${gy} ${sX},${gy - stick * sc} ${tipS},${gy}`} fill="#868e96" opacity="0.25" />
      <rect x={sX - 2.5} y={gy - stick * sc} width="5" height={stick * sc} fill="#8d5524" />
      <line x1={sX} y1={gy - stick * sc} x2={tipS} y2={gy} stroke={warm} strokeDasharray="4 3" />
      <text x={sX + 6} y={gy - stick * sc - 4} fontSize="11" fontWeight="700" textAnchor="start" fill={ink}>{show(stick)}</text>
      <text x={(sX + tipS) / 2} y={gy + 14} fontSize="11" fontWeight="700" textAnchor="middle" fill={ink}>{show(stickShadow)}</text>
      {/* gedung atau pohon */}
      <polygon points={`${oX},${gy} ${oX},${gy - H * sc} ${tipO},${gy}`} fill="#868e96" opacity="0.25" />
      {object === "gedung" ? <g><rect x={oX - 34} y={gy - H * sc} width="34" height={H * sc} fill="#ced4da" stroke={ink} />
        {Array.from({ length: Math.max(1, Math.floor(H * sc / 18)) }, (_, r) => [0, 1].map(c => <rect key={`${r}${c}`} x={oX - 28 + c * 14} y={gy - H * sc + 6 + r * 18} width="8" height="9" fill="#74c0fc" />))}</g>
        : <g><rect x={oX - 4} y={gy - H * sc * 0.55} width="8" height={H * sc * 0.55} fill="#8d5524" /><ellipse cx={oX} cy={gy - H * sc * 0.7} rx="26" ry={H * sc * 0.32} fill="#40c057" stroke="#2b8a3e" /></g>}
      <line x1={oX} y1={gy - H * sc} x2={tipO} y2={gy} stroke={warm} strokeDasharray="4 3" />
      <text x={oX - 40} y={gy - H * sc / 2} fontSize="12" fontWeight="800" textAnchor="end" fill={red}>{height !== undefined ? show(height) : "?"}</text>
      <text x={(oX + tipO) / 2} y={gy + 14} fontSize="11" fontWeight="700" textAnchor="middle" fill={ink}>{show(objShadow)}</text>
    </svg>
    {caption && <figcaption className="text-center text-xs text-base-content/70">{caption}</figcaption>}
  </figure>;
}

export function Grid({ head, rows, title }: { head: string[]; rows: string[][]; title?: string }) {
  return <div className="min-w-0 max-w-full overflow-x-auto">
    {title && <p className="mb-1 text-center text-xs font-bold">{title}</p>}
    <table className="mx-auto border-collapse bg-white text-sm"><thead><tr>{head.map((h, i) => <th key={i} className="border border-base-300 bg-success/10 px-2 py-1 font-bold">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k} className="border border-base-300 px-2 py-0.5 text-center tabular-nums">{c}</td>)}</tr>)}</tbody></table>
  </div>;
}

export function SceneView({ scene }: { scene: Scene }): ReactNode {
  switch (scene.type) {
    case "fig": return <FigView fig={scene} />;
    case "plane": return <PlaneView plane={scene} />;
    case "shadow": return <Shadow {...scene} />;
    case "grid": return <Grid head={scene.head} rows={scene.rows} title={scene.title} />;
    case "multi": return <div className="flex flex-wrap justify-center gap-3">{scene.items.map((s, i) => <div key={i} className="w-full max-w-[15rem]"><SceneView scene={s} /></div>)}</div>;
  }
}
