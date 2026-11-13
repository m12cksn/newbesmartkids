import { idn, type Scene } from "@/data/grade-eight-statistics";
import { M } from "./GradeEightPowersArt";

export { M };
const ink = "#1f3b30", blue = "#1c64b5", orange = "#c2410c";
const colors = [blue, "#d9480f", "#2b8a3e"];
const niceMax = (v: number) => { const p = 10 ** Math.floor(Math.log10(v)); return Math.ceil((v * 1.1) / p) * p; };

/* ---------- Diagram batang ---------- */
export function BarChart({ title, labels, values, unit, highlight = [], meanLine, className = "w-full max-w-md" }: { title: string; labels: string[]; values: number[]; unit?: string; highlight?: number[]; meanLine?: number; className?: string }) {
  const W = 320, H = 190, x0 = 40, y0 = 160, top = 26, max = niceMax(Math.max(...values)), bw = (W - x0 - 10) / labels.length;
  const Y = (v: number) => y0 - (v / max) * (y0 - top);
  return <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${title}: ${labels.map((l, i) => `${l} ${idn(values[i])}${unit ? ` ${unit}` : ""}`).join(", ")}`}>
    <text x={W / 2} y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{title}</text>
    {[0, 0.25, 0.5, 0.75, 1].map(t => <g key={t}><line x1={x0} x2={W - 6} y1={Y(max * t)} y2={Y(max * t)} stroke="#e3ebe7" /><text x={x0 - 4} y={Y(max * t) + 3} textAnchor="end" fontSize="8" fill="#5b6b64">{idn(max * t)}</text></g>)}
    <line x1={x0} x2={W - 6} y1={y0} y2={y0} stroke="#33413b" />
    {values.map((v, i) => { const x = x0 + i * bw + bw * 0.15, w = bw * 0.7, on = highlight.includes(i);
      return <g key={i}><rect x={x} y={Y(v)} width={w} height={y0 - Y(v)} rx="2" fill={on ? orange : "#7aa7d6"} />
        <text x={x + w / 2} y={Y(v) - 3} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={ink}>{idn(v)}</text>
        <text x={x + w / 2} y={y0 + 12} textAnchor="middle" fontSize={labels[i].length > 6 ? 7 : 8.5} fill={ink}>{labels[i]}</text></g>; })}
    {meanLine !== undefined && <g><line x1={x0} x2={W - 6} y1={Y(meanLine)} y2={Y(meanLine)} stroke="#2b8a3e" strokeWidth="2" strokeDasharray="5 3" /><text x={W - 8} y={Y(meanLine) - 4} textAnchor="end" fontSize="9" fontWeight="800" fill="#2b8a3e">rata-rata {idn(Math.round(meanLine * 100) / 100)}</text></g>}
  </svg>;
}

/* ---------- Diagram garis ---------- */
export function LineChart({ title, labels, series, unit }: { title: string; labels: string[]; series: { name: string; values: number[] }[]; unit?: string }) {
  const W = 330, H = 200, x0 = 42, y0 = 160, top = 26, max = niceMax(Math.max(...series.flatMap(s => s.values))), X = (i: number) => x0 + 8 + (i * (W - x0 - 22)) / (labels.length - 1), Y = (v: number) => y0 - (v / max) * (y0 - top);
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md" role="img" aria-label={`${title}: ${series.map(s => `${s.name} ${labels.map((l, i) => `${l} ${idn(s.values[i])}`).join(", ")}`).join("; ")}${unit ? ` ${unit}` : ""}`}>
    <text x={W / 2} y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{title}</text>
    {[0, 0.25, 0.5, 0.75, 1].map(t => <g key={t}><line x1={x0} x2={W - 6} y1={Y(max * t)} y2={Y(max * t)} stroke="#e3ebe7" /><text x={x0 - 4} y={Y(max * t) + 3} textAnchor="end" fontSize="8" fill="#5b6b64">{idn(max * t)}</text></g>)}
    <line x1={x0} x2={W - 6} y1={y0} y2={y0} stroke="#33413b" />
    {labels.map((l, i) => <text key={l} x={X(i)} y={y0 + 12} textAnchor="middle" fontSize="8" fill={ink}>{l}</text>)}
    {series.map((s, k) => <g key={s.name}><polyline points={s.values.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke={colors[k]} strokeWidth="2" />
      {s.values.map((v, i) => <g key={i}><circle cx={X(i)} cy={Y(v)} r="3" fill={colors[k]} /><text x={X(i)} y={Y(v) - 6} textAnchor="middle" fontSize="7.5" fontWeight="700" fill={ink}>{idn(v)}</text></g>)}</g>)}
  </svg>;
}

export function TableView({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{caption && <caption className="mb-1 font-bold">{caption}</caption>}
    <thead><tr className="bg-success text-success-content">{head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-base-300">{r.map((c, j) => <td key={j} className="px-2 py-1">{typeof c === "number" ? idn(c) : c}</td>)}</tr>)}</tbody></table></div>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "bars": return <BarChart title={scene.title} labels={scene.labels} values={scene.values} unit={scene.unit} />;
    case "lines": return <LineChart title={scene.title} labels={scene.labels} series={scene.series} unit={scene.unit} />;
    case "table": return <TableView head={scene.head} rows={scene.rows} caption={scene.caption} />;
    case "card": return <div className="w-full max-w-md rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p>{scene.lines.map(l => <p key={l} className="leading-7"><M text={l} /></p>)}</div>;
  }
}
