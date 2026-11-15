import { Fragment } from "react";
import { M as BaseM, plainMath } from "./GradeEightPowersArt";
import { idn, type Piece, type Scene } from "@/data/grade-ten-functions";

export { plainMath };
/** Pecahan bertumpuk tidak perlu kurung di pembilang/penyebut: {(x − 7)/5} tampil sebagai x − 7 di atas 5. */
export const M = ({ text }: { text: string }) => <BaseM text={text.replace(/\{\(([^(){}]*)\)\//g, "{$1/").replace(/\/\(([^(){}]*)\)\}/g, "/$1}")} />;
const ink = "#1f3b30", soft = "#5b6b64", palette = ["#1c64b5", "#c2410c", "#2b8a3e", "#7048e8"];

/* ---------- Grafik fungsi dengan titik ujung dan asimtot ---------- */
export function Plot({ pieces, view, asymX = [], asymY = [], pts = [], caption, cls = "w-full max-w-sm", diag }: { pieces: Piece[]; view: [number, number, number, number]; asymX?: number[]; asymY?: number[]; pts?: [number, number, string][]; caption?: string; cls?: string; diag?: boolean }) {
  const [x0, x1, y0, y1] = view, W = 300, H = 240, pad = 22, X = (v: number) => pad + ((v - x0) / (x1 - x0)) * (W - 2 * pad), Y = (v: number) => H - pad - ((v - y0) / (y1 - y0)) * (H - 2 * pad);
  const step = (span: number) => (span <= 12 ? 1 : span <= 24 ? 2 : 5), sx = step(x1 - x0), sy = step(y1 - y0);
  const gx: number[] = [], gy: number[] = []; for (let v = Math.ceil(x0 / sx) * sx; v <= x1; v += sx) gx.push(v); for (let v = Math.ceil(y0 / sy) * sy; v <= y1; v += sy) gy.push(v);
  const path = (p: Piece) => { const segs: string[][] = [[]]; const N = 160; for (let i = 0; i <= N; i++) { const x = p.from + ((p.to - p.from) * i) / N, y = p.f(x);
      if (!Number.isFinite(y) || y < y0 - 2 || y > y1 + 2) { if (segs[segs.length - 1].length) segs.push([]); continue; } segs[segs.length - 1].push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`); }
    return segs.filter(s => s.length > 1).map(s => s.join(" ")); };
  const label = pieces.map(p => p.label).filter(Boolean).join(", ");
  const id = `clip-${view.join("_")}`.replace(/[^a-z0-9_-]/gi, "");
  return <figure className="flex min-w-0 flex-col items-center gap-1">
    <svg viewBox={`0 0 ${W} ${H}`} className={cls} role="img" aria-label={`Grafik${label ? ` ${plainMath(label)}` : ""}${asymX.length ? `, asimtot tegak x = ${asymX.map(idn).join(", ")}` : ""}${asymY.length ? `, asimtot datar y = ${asymY.map(idn).join(", ")}` : ""}${pts.length ? `, titik ${pts.map(p => p[2]).join(", ")}` : ""}`}>
      <defs><clipPath id={id}><rect x={pad} y={pad} width={W - 2 * pad} height={H - 2 * pad} /></clipPath></defs>
      {gx.map(v => <line key={`gx${v}`} x1={X(v)} x2={X(v)} y1={pad} y2={H - pad} stroke="#eef2f0" />)}
      {gy.map(v => <line key={`gy${v}`} y1={Y(v)} y2={Y(v)} x1={pad} x2={W - pad} stroke="#eef2f0" />)}
      {y0 <= 0 && y1 >= 0 && <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke={ink} strokeWidth="1.2" />}
      {x0 <= 0 && x1 >= 0 && <line y1={pad} y2={H - pad} x1={X(0)} x2={X(0)} stroke={ink} strokeWidth="1.2" />}
      {gx.filter(v => v).map(v => <text key={`tx${v}`} x={X(v)} y={Math.min(H - 6, Math.max(pad + 10, Y(0) + 12))} textAnchor="middle" fontSize="9" fill={soft}>{idn(v)}</text>)}
      {gy.filter(v => v).map(v => <text key={`ty${v}`} x={Math.max(pad - 2, Math.min(W - pad, X(0) - 4))} y={Y(v) + 3} textAnchor="end" fontSize="9" fill={soft}>{idn(v)}</text>)}
      <g clipPath={`url(#${id})`}>
        {diag && <line x1={X(Math.max(x0, y0))} y1={Y(Math.max(x0, y0))} x2={X(Math.min(x1, y1))} y2={Y(Math.min(x1, y1))} stroke="#adb5bd" strokeDasharray="5 4" />}
        {asymX.map(v => <line key={`ax${v}`} x1={X(v)} x2={X(v)} y1={pad} y2={H - pad} stroke="#e8590c" strokeDasharray="5 4" />)}
        {asymY.map(v => <line key={`ay${v}`} y1={Y(v)} y2={Y(v)} x1={pad} x2={W - pad} stroke="#e8590c" strokeDasharray="5 4" />)}
        {pieces.map((p, i) => path(p).map((d, k) => <polyline key={`${i}-${k}`} points={d} fill="none" stroke={palette[i % palette.length]} strokeWidth="2.4" strokeLinejoin="round" />))}
      </g>
      {pieces.flatMap((p, i) => ([["fromDot", p.from], ["toDot", p.to]] as const).filter(([k]) => p[k]).map(([k, x]) => <circle key={`${i}${k}`} cx={X(x)} cy={Y(p.f(x))} r="4" fill={p[k] === "penuh" ? palette[i % palette.length] : "#fff"} stroke={palette[i % palette.length]} strokeWidth="2" />))}
      {pts.map(([a, b, t]) => <g key={t}><circle cx={X(a)} cy={Y(b)} r="3" fill={ink} /><text x={X(a) + 6} y={Y(b) - 6} fontSize="10" fill={ink}>{t}</text></g>)}
      {asymX.map(v => <text key={`lx${v}`} x={X(v) + 3} y={pad + 10} fontSize="10" fill="#e8590c">x = {idn(v)}</text>)}
      {asymY.map(v => <text key={`ly${v}`} x={W - pad - 2} y={Y(v) - 4} textAnchor="end" fontSize="10" fill="#e8590c">y = {idn(v)}</text>)}
      {pieces.filter(p => p.label).map((p, i) => <text key={`l${i}`} x={pad + 4} y={pad + 12 + i * 13} fontSize="10" fontWeight="600" fill={palette[pieces.indexOf(p) % palette.length]}>{plainMath(p.label!)}</text>)}
    </svg>
    {caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}
  </figure>;
}

/* ---------- Diagram panah antarhimpunan ---------- */
export function Arrows({ sets, stages, caption, highlight }: { sets: { name: string; items: string[] }[]; stages: { label: string; links: [number, number][] }[]; caption?: string; highlight?: number }) {
  const colW = 90, gap = 70, W = sets.length * colW + (sets.length - 1) * gap, rows = Math.max(...sets.map(s => s.items.length)), H = 46 + rows * 30 + 14;
  const cx = (k: number) => colW / 2 + k * (colW + gap), cy = (k: number, i: number) => { const nItems = sets[k].items.length; return 40 + (H - 54) / 2 - ((nItems - 1) * 30) / 2 + i * 30; };
  const desc = stages.map((s, k) => `${s.label}: ${s.links.map(([a, b]) => `${sets[k].items[a]} ke ${sets[k + 1].items[b]}`).join(", ")}`).join("; ");
  return <figure className="flex min-w-0 flex-col items-center gap-1"><svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: W * 1.3 }} role="img" aria-label={`Diagram panah. ${desc}`}>
    <defs><marker id="arr-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill={ink} /></marker></defs>
    {sets.map((s, k) => <g key={k}><ellipse cx={cx(k)} cy={40 + (H - 54) / 2} rx={colW / 2 - 6} ry={(H - 54) / 2 + 8} fill={k === highlight ? "#fff3bf" : "#f1f8f4"} stroke={ink} strokeWidth="1.2" />
      <text x={cx(k)} y="14" textAnchor="middle" fontSize="12" fontWeight="700" fill={ink}>{plainMath(s.name)}</text>
      {s.items.map((it, i) => <text key={i} x={cx(k)} y={cy(k, i) + 4} textAnchor="middle" fontSize="12" fill={ink}>{it}</text>)}</g>)}
    {stages.map((st, k) => <g key={`s${k}`}>
      <text x={(cx(k) + cx(k + 1)) / 2} y="14" textAnchor="middle" fontSize="12" fontStyle="italic" fill={palette[k]}>{plainMath(st.label)}</text>
      {st.links.map(([a, b]) => <line key={`${a}-${b}`} x1={cx(k) + 16} y1={cy(k, a)} x2={cx(k + 1) - 18} y2={cy(k + 1, b)} stroke={palette[k]} strokeWidth="1.4" markerEnd="url(#arr-head)" />)}</g>)}
  </svg>{caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}</figure>;
}

/* ---------- Mesin fungsi (satu atau beberapa tahap) ---------- */
export function Machine({ stages, input, output, lit }: { stages: { name: string; rule: string }[]; input: string; output: string; lit?: "ok" | "error" }) {
  return <div role="img" aria-label={`Mesin fungsi: masukan ${plainMath(input)}, ${stages.map(s => `${s.name}: ${plainMath(s.rule)}`).join(", lalu ")}, luaran ${plainMath(output)}`} className="flex w-full max-w-md flex-wrap items-center justify-center gap-1.5 text-sm">
    <span className="rounded-full bg-base-200 px-3 py-1 font-semibold"><M text={input} /></span>
    {stages.map((s, i) => <Fragment key={i}><svg viewBox="0 0 24 12" className="w-5" aria-hidden="true"><path d="M0 6h20M15 1l6 5-6 5" fill="none" stroke={ink} strokeWidth="1.6" /></svg>
      <span className={`relative rounded-lg border-2 px-3 pb-1.5 pt-3 text-center ${lit === "error" ? "border-error bg-error/10" : "border-[#1c64b5] bg-[#e7f0fb]"}`}>
        <span className="absolute -top-2 left-2 rounded bg-base-100 px-1 text-xs font-bold text-[#1c64b5]">{s.name}</span>
        <span className="absolute -top-1.5 right-2 flex gap-0.5" aria-hidden="true"><span className="size-1.5 rounded-full bg-[#1c64b5]/50" /><span className={`size-1.5 rounded-full ${lit === "error" ? "bg-error" : lit === "ok" ? "bg-success" : "bg-[#1c64b5]/50"}`} /></span>
        <span className="font-semibold"><M text={s.rule} /></span></span></Fragment>)}
    <svg viewBox="0 0 24 12" className="w-5" aria-hidden="true"><path d="M0 6h20M15 1l6 5-6 5" fill="none" stroke={ink} strokeWidth="1.6" /></svg>
    <span className={`rounded-full px-3 py-1 font-semibold ${lit === "error" ? "bg-error/15 text-error" : "bg-success/15"}`}><M text={output} /></span>
  </div>;
}

export function TableView({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{caption && <caption className="mb-1 font-bold">{caption}</caption>}
    <thead><tr className="bg-success text-success-content">{head.map(h => <th key={h} className="px-2 py-1"><M text={h} /></th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 ${j === 0 ? "font-bold" : ""}`}>{typeof c === "number" ? idn(c) : <M text={c} />}</td>)}</tr>)}</tbody></table></div>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "plot": return <Plot {...scene} />;
    case "arrows": return <Arrows sets={scene.sets} stages={scene.stages} caption={scene.caption} />;
    case "machine": return <Machine stages={scene.stages} input={scene.input} output={scene.output} />;
    case "table": return <TableView head={scene.head} rows={scene.rows} caption={scene.caption} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
