"use client";

import type { ReactNode } from "react";
import { M as BaseM, plainMath } from "./GradeEightPowersArt";
import { boundsOf, classText, cumOf, idn, midsOf, type Col, type Dist, type Scene } from "@/data/grade-twelve-statistics";

export { plainMath };
export const M = ({ text }: { text: string }) => <BaseM text={text.replace(/\{\(([^(){}]*)\)\//g, "{$1/").replace(/\/\(([^(){}]*)\)\}/g, "/$1}")} />;
const ink = "#1f3b30", soft = "#5b6b64", red = "#d6336c", blue = "#1c64b5", leaf = "#2b8a3e", fill = "#cfe8dc";

/** Langkah sumbu yang rapi (1, 2, 5, 10, ...). */
export function niceStep(max: number, parts = 5) {
  const raw = Math.max(max, 1) / parts, p = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map(m => m * p).find(s => s >= raw - 1e-9) ?? 10 * p;
}
const W = 340, H = 230, PL = 40, PR = 14, PB = 42;

function Axes({ x0, x1, top, step, T, xTicks, xlabel, ylabel, children, label }: { x0: number; x1: number; top: number; step: number; T: number; xTicks: number[]; xlabel?: string; ylabel: string; children: (X: (v: number) => number, Y: (v: number) => number) => ReactNode; label: string }) {
  const X = (v: number) => PL + ((v - x0) / (x1 - x0)) * (W - PL - PR), Y = (v: number) => H - PB - (v / top) * (H - PB - T);
  const ys: number[] = []; for (let v = 0; v <= top + 1e-9; v += step) ys.push(Math.round(v * 1e6) / 1e6);
  const rotate = xTicks.length > 7 || xTicks.some(t => idn(t).length > 5);
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-sm" role="img" aria-label={label}>
    {ys.map(v => <g key={v}><line x1={PL} x2={W - PR} y1={Y(v)} y2={Y(v)} stroke="#e3e8e5" /><text x={PL - 5} y={Y(v) + 4} fontSize="10" textAnchor="end" fill={soft}>{idn(v)}</text></g>)}
    {children(X, Y)}
    <line x1={PL} x2={W - PR} y1={Y(0)} y2={Y(0)} stroke={ink} /><line x1={PL} x2={PL} y1={T - 4} y2={Y(0)} stroke={ink} />
    {xTicks.map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1={Y(0)} y2={Y(0) + 4} stroke={ink} />
      <text x={X(t)} y={Y(0) + 14} fontSize="9.5" fill={ink} textAnchor={rotate ? "end" : "middle"} transform={rotate ? `rotate(-35 ${X(t)} ${Y(0) + 14})` : undefined}>{idn(t)}</text></g>)}
    {xlabel && <text x={(PL + W - PR) / 2} y={H - 4} fontSize="10.5" textAnchor="middle" fill={soft}>{xlabel}</text>}
    <text x={10} y={(T + H - PB) / 2} fontSize="10.5" textAnchor="middle" fill={soft} transform={`rotate(-90 10 ${(T + H - PB) / 2})`}>{ylabel}</text>
  </svg>;
}

export function Hist({ dist, show = "bar", title, xlabel, mark, highlight, cross }: { dist: Dist; show?: "bar" | "poly" | "both"; title?: string; xlabel?: string; mark?: { x: number; label: string }; highlight?: number[]; cross?: number }) {
  const b = boundsOf(dist), mids = midsOf(dist), top0 = Math.max(...dist.f, 1), step = niceStep(top0), top = Math.ceil((top0 + 0.01) / step) * step;
  const ticks = show === "poly" ? mids : [b[0][0], ...b.map(x => x[1])];
  const x0 = show === "poly" ? b[0][0] : b[0][0], x1 = b[b.length - 1][1];
  const label = `${show === "poly" ? "Poligon frekuensi" : "Histogram"}${title ? ` ${title}` : ""}: ${dist.f.map((f, i) => `${classText(dist, i)} frekuensi ${f}`).join(", ")}`;
  return <figure className="w-full max-w-sm">
    {title && <figcaption className="text-center text-xs font-bold">{title}</figcaption>}
    <Axes x0={x0} x1={x1} top={top} step={step} T={12} xTicks={ticks} xlabel={xlabel} ylabel="Frekuensi" label={label}>
      {(X, Y) => <>
        {show !== "poly" && b.map(([lo, hi], i) => <g key={i}>
          <rect x={X(lo)} y={Y(dist.f[i])} width={X(hi) - X(lo)} height={Y(0) - Y(dist.f[i])} fill={highlight?.includes(i) ? "#9fd6b9" : fill} stroke={ink} strokeWidth="1.2" />
          {show === "bar" && <text x={(X(lo) + X(hi)) / 2} y={Y(dist.f[i]) - 3} fontSize="10" textAnchor="middle" fill={ink} fontWeight="700">{dist.f[i]}</text>}
        </g>)}
        {show !== "bar" && <>
          <polyline points={mids.map((m, i) => `${X(m)},${Y(dist.f[i])}`).join(" ")} fill="none" stroke={blue} strokeWidth="2" />
          {mids.map((m, i) => <g key={i}><circle cx={X(m)} cy={Y(dist.f[i])} r="3.5" fill={blue} /><text x={X(m)} y={Y(dist.f[i]) - 6} fontSize="10" textAnchor="middle" fill={blue} fontWeight="700">{dist.f[i]}</text></g>)}
        </>}
        {cross !== undefined && (() => { const [lo, hi] = b[cross], f = dist.f[cross], fp = dist.f[cross - 1] ?? 0, fn = dist.f[cross + 1] ?? 0;
          return <g stroke={red} strokeWidth="1.6"><line x1={X(lo)} y1={Y(f)} x2={X(hi)} y2={Y(fn)} /><line x1={X(hi)} y1={Y(f)} x2={X(lo)} y2={Y(fp)} /></g>; })()}
        {mark && <g><line x1={X(mark.x)} x2={X(mark.x)} y1={Y(0)} y2={Y(top) + 2} stroke={red} strokeWidth="2" strokeDasharray="5 3" /><text x={Math.min(X(mark.x) + 4, W - PR - 40)} y={Y(top) + 12} fontSize="10.5" fill={red} fontWeight="700">{mark.label}</text></g>}
      </>}
    </Axes>
  </figure>;
}

export function Ogive({ dist, title, xlabel, mark }: { dist: Dist; title?: string; xlabel?: string; mark?: number }) {
  const b = boundsOf(dist), cum = cumOf(dist), xs = [b[0][0], ...b.map(x => x[1])], ys = [0, ...cum];
  const n = cum[cum.length - 1], step = niceStep(n), top = Math.ceil((n + 0.01) / step) * step;
  const at = (x: number) => { for (let i = 1; i < xs.length; i++) if (x <= xs[i] + 1e-9) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]); return n; };
  const label = `Ogive${title ? ` ${title}` : ""}: ${xs.map((x, i) => `kurang dari ${idn(x)} sebanyak ${ys[i]}`).join(", ")}`;
  return <figure className="w-full max-w-sm">
    {title && <figcaption className="text-center text-xs font-bold">{title}</figcaption>}
    <Axes x0={xs[0]} x1={xs[xs.length - 1]} top={top} step={step} T={12} xTicks={xs} xlabel={xlabel} ylabel="Frekuensi kumulatif" label={label}>
      {(X, Y) => <>
        <polyline points={xs.map((x, i) => `${X(x)},${Y(ys[i])}`).join(" ")} fill="none" stroke={leaf} strokeWidth="2.2" />
        {xs.map((x, i) => <g key={i}><circle cx={X(x)} cy={Y(ys[i])} r="3.5" fill={leaf} /><text x={X(x) - 4} y={Y(ys[i]) - 6} fontSize="10" textAnchor="end" fill={ink} fontWeight="700">{ys[i]}</text></g>)}
        {mark !== undefined && <g>
          <line x1={X(mark)} x2={X(mark)} y1={Y(0)} y2={Y(at(mark))} stroke={red} strokeWidth="1.8" strokeDasharray="5 3" />
          <line x1={PL} x2={X(mark)} y1={Y(at(mark))} y2={Y(at(mark))} stroke={red} strokeWidth="1.8" strokeDasharray="5 3" />
          <circle cx={X(mark)} cy={Y(at(mark))} r="4" fill={red} />
          <text x={X(mark) + 5} y={Y(0) - 5} fontSize="10" fill={red} fontWeight="700">{idn(mark)}</text>
        </g>}
      </>}
    </Axes>
  </figure>;
}

export function Bars({ cats, vals, yMin, yMax, scale, title }: { cats: string[]; vals: number[]; yMin: number; yMax: number; scale: boolean; title?: string }) {
  const T = 12, Y = (v: number) => H - PB - ((v - yMin) / (yMax - yMin)) * (H - PB - T), step = niceStep(yMax - yMin, 5);
  const ticks: number[] = []; for (let v = yMin; v <= yMax + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  const bw = (W - PL - PR) / cats.length;
  return <figure className="w-full max-w-sm">
    {title && <figcaption className="text-center text-xs font-bold">{title}</figcaption>}
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Diagram batang${title ? ` ${title}` : ""}${scale ? `, sumbu tegak dimulai dari ${yMin}` : ", tanpa skala"}: ${cats.map((c, i) => `${c} ${scale ? vals[i] : ""}`.trim()).join(", ")}`}>
      {ticks.map(v => <g key={v}><line x1={PL} x2={W - PR} y1={Y(v)} y2={Y(v)} stroke="#e3e8e5" />{scale && <text x={PL - 5} y={Y(v) + 4} fontSize="10" textAnchor="end" fill={soft}>{idn(v)}</text>}</g>)}
      {cats.map((c, i) => { const x = PL + bw * i + bw * 0.28; return <g key={c}>
        <rect x={x} y={Y(vals[i])} width={bw * 0.44} height={Y(yMin) - Y(vals[i])} fill="#4dabf7" stroke={ink} />
        {scale && <text x={x + bw * 0.22} y={Y(vals[i]) - 4} fontSize="10" textAnchor="middle" fill={ink} fontWeight="700">{vals[i]}</text>}
        <text x={x + bw * 0.22} y={Y(yMin) + 15} fontSize="11" textAnchor="middle" fill={ink} fontWeight="700">{c}</text></g>; })}
      <line x1={PL} x2={W - PR} y1={Y(yMin)} y2={Y(yMin)} stroke={ink} /><line x1={PL} x2={PL} y1={T - 4} y2={Y(yMin)} stroke={ink} />
    </svg>
  </figure>;
}

export function Grid({ head, rows, title }: { head: string[]; rows: string[][]; title?: string }) {
  return <div className="min-w-0 max-w-full overflow-x-auto">
    {title && <p className="mb-1 text-center text-xs font-bold">{title}</p>}
    <table className="mx-auto border-collapse bg-white text-sm">
      <thead><tr>{head.map(h => <th key={h} className="border border-base-300 bg-success/10 px-2 py-1 font-bold"><M text={h} /></th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k} className="border border-base-300 px-2 py-0.5 text-center tabular-nums"><M text={c} /></td>)}</tr>)}</tbody>
    </table>
  </div>;
}
const colHead: Record<Col, string> = { kelas: "Kelas", batas: "Batas kelas", tengah: "Titik tengah (xᵢ)", f: "Frekuensi (fᵢ)", fk: "Frek. kumulatif" };
export function DistTable({ dist, cols, title, fLabel }: { dist: Dist; cols: Col[]; title?: string; fLabel?: string }) {
  const b = boundsOf(dist), mids = midsOf(dist), cum = cumOf(dist);
  const cell = (c: Col, i: number) => (c === "kelas" ? classText(dist, i) : c === "batas" ? `${idn(b[i][0])}–${idn(b[i][1])}` : c === "tengah" ? idn(mids[i]) : c === "f" ? String(dist.f[i]) : String(cum[i]));
  return <Grid title={title} head={cols.map(c => (c === "f" && fLabel ? fLabel : colHead[c]))} rows={dist.f.map((_, i) => cols.map(c => cell(c, i)))} />;
}
export function Raw({ values, cols, title }: { values: number[]; cols: number; title?: string }) {
  return <div className="min-w-0 max-w-full">
    {title && <p className="mb-1 text-center text-xs font-bold">{title}</p>}
    <div className="mx-auto grid gap-px rounded border border-base-300 bg-base-300 text-sm tabular-nums" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(2.4rem, 1fr))", maxWidth: `${cols * 2.5}rem` }} role="table" aria-label={`${title ?? "Data"}: ${values.join(", ")}`}>
      {values.map((v, i) => <span key={i} role="cell" className="bg-white px-1 py-0.5 text-center">{idn(v)}</span>)}
    </div>
  </div>;
}

export function SceneView({ scene }: { scene: Scene }): ReactNode {
  switch (scene.type) {
    case "table": return <DistTable dist={scene.dist} cols={scene.cols} title={scene.title} fLabel={scene.fLabel} />;
    case "grid": return <Grid head={scene.head} rows={scene.rows} title={scene.title} />;
    case "raw": return <Raw values={scene.values} cols={scene.cols} title={scene.title} />;
    case "hist": return <Hist dist={scene.dist} show={scene.show} title={scene.title} xlabel={scene.xlabel} mark={scene.mark !== undefined ? { x: scene.mark, label: idn(scene.mark) } : undefined} />;
    case "ogive": return <Ogive dist={scene.dist} title={scene.title} xlabel={scene.xlabel} mark={scene.mark} />;
    case "bars": return <Bars {...scene} />;
    case "multi": return <div className="flex flex-wrap justify-center gap-3">{scene.items.map((s, i) => <SceneView key={i} scene={s} />)}</div>;
  }
}
