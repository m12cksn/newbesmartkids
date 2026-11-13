import { GraphView, M, plainMath } from "./GradeEightLinesArt";
import { eqText, idn, type Eq, type GPoint, type Scene } from "@/data/grade-nine-systems";

export { GraphView, M, plainMath };
const ink = "#1f3b30", blue = "#1c64b5", orange = "#c2410c", green = "#2b8a3e";
export const lineColors = [blue, orange, green];

/** ax + by = c sebagai garis untuk GraphView. */
export const toLine = ([a, b, c]: Eq, label?: string) => (b === 0 ? { vx: c / a, label } : { m: -a / b, c: c / b, label });

/* ---------- Bidang koordinat dengan persamaan ax + by = c ---------- */
export function PlaneView({ eqs, labels, points, r = 6, size, label }: { eqs: Eq[]; labels?: string[]; points?: GPoint[]; r?: number; size?: string; label?: string }) {
  const names = eqs.map((e, i) => labels?.[i] ?? eqText(...e));
  return <figure className="flex w-full max-w-xs flex-col items-center">
    <GraphView lines={eqs.map(e => toLine(e))} points={points} r={r} size={size} label={label ?? `Bidang koordinat dengan garis ${names.map(plainMath).join(" dan ")}`} legend />
    <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-bold">{names.map((nm, i) => <li key={i} className="flex items-center gap-1"><span aria-hidden="true" className="inline-block h-1 w-5 rounded" style={{ background: lineColors[i % lineColors.length] }} /><M text={nm} /></li>)}</ul>
  </figure>;
}

/* ---------- Kuadran I: garis ax + by = c dengan titik yang dipilih ---------- */
export function QuadrantView({ a, b, c, xMax, yMax, point, xLabel, yLabel }: { a: number; b: number; c: number; xMax: number; yMax: number; point?: { x: number; y: number }; xLabel: string; yLabel: string }) {
  const W = 300, H = 220, x0 = 40, y0 = 185, w = 240, h = 160, X = (v: number) => x0 + (v / xMax) * w, Y = (v: number) => y0 - (v / yMax) * h;
  const ends = [[0, c / b], [c / a, 0]] as const, sx = Math.max(1, Math.ceil(xMax / 10)), sy = Math.max(1, Math.ceil(yMax / 8));
  const okPt = point && point.x >= 0 && point.y >= 0 && point.x <= xMax && point.y <= yMax;
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role="img" aria-label={`Grafik ${plainMath(eqText(a, b, c))} di kuadran pertama${okPt ? `, titik (${idn(point.x)}, ${idn(point.y)})` : ""}`}>
    {Array.from({ length: Math.floor(xMax / sx) + 1 }, (_, k) => k * sx).map(v => <g key={`x${v}`}><line x1={X(v)} x2={X(v)} y1={y0} y2={y0 - h} stroke="#e3ebe7" /><text x={X(v)} y={y0 + 12} textAnchor="middle" fontSize="9" fill="#5b6b64">{v}</text></g>)}
    {Array.from({ length: Math.floor(yMax / sy) + 1 }, (_, k) => k * sy).map(v => <g key={`y${v}`}><line x1={x0} x2={x0 + w} y1={Y(v)} y2={Y(v)} stroke="#e3ebe7" /><text x={x0 - 5} y={Y(v) + 3} textAnchor="end" fontSize="9" fill="#5b6b64">{v}</text></g>)}
    <line x1={x0} x2={x0 + w + 6} y1={y0} y2={y0} stroke="#33413b" strokeWidth="1.4" /><line x1={x0} x2={x0} y1={y0} y2={y0 - h - 6} stroke="#33413b" strokeWidth="1.4" />
    <line x1={X(ends[0][0])} y1={Y(ends[0][1])} x2={X(ends[1][0])} y2={Y(ends[1][1])} stroke={blue} strokeWidth="2.4" />
    {okPt && <g><line x1={X(point.x)} x2={X(point.x)} y1={y0} y2={Y(point.y)} stroke={orange} strokeDasharray="3 3" /><line x1={x0} x2={X(point.x)} y1={Y(point.y)} y2={Y(point.y)} stroke={orange} strokeDasharray="3 3" />
      <circle cx={X(point.x)} cy={Y(point.y)} r="5" fill={orange} /><text x={X(point.x) + 7} y={Y(point.y) - 6} fontSize="11" fontWeight="800" fill={ink}>({idn(point.x)}, {idn(point.y)})</text></g>}
    <text x={x0 + w / 2} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>{xLabel}</text>
    <text x="10" y={y0 - h / 2} fontSize="10" fontWeight="700" fill={ink} transform={`rotate(-90 10 ${y0 - h / 2})`} textAnchor="middle">{yLabel}</text>
  </svg>;
}

/* ---------- Nota belanja ---------- */
export function ReceiptView({ title, rows }: { title: string; rows: { items: string; total: string }[] }) {
  return <div className="w-full max-w-sm rounded-md border border-dashed border-base-content/30 bg-[#fffdf6] px-4 py-3 font-mono text-sm text-neutral shadow-sm" role="figure" aria-label={`Nota ${title}: ${rows.map(r => `${r.items} ${r.total}`).join("; ")}`}>
    <p className="border-b border-dashed border-base-content/30 pb-1 text-center font-bold">{title}</p>
    <ul>{rows.map((r, i) => <li key={i} className="flex justify-between gap-3 border-b border-dashed border-base-content/20 py-1.5 last:border-0"><span>{rows.length > 1 && <span className="me-1 text-base-content/60">{i === 0 ? "I" : "II"}.</span>}{r.items}</span><strong className="shrink-0">{r.total}</strong></li>)}</ul>
  </div>;
}

/* ---------- Grafik jarak dan waktu dua orang ---------- */
export function ChaseView({ a, b, clock, hours }: { a: { name: string; start: number; speed: number }; b: { name: string; start: number; speed: number }; clock: number; hours: number }) {
  const W = 320, H = 210, x0 = 44, y0 = 175, w = 255, h = 150, top = Math.max(a.speed * (hours - a.start), b.speed * (hours - b.start)) * 1.1;
  const step = top > 150 ? 50 : 20, X = (t: number) => x0 + (t / hours) * w, Y = (d: number) => y0 - (d / top) * h;
  const halfs = Array.from({ length: hours * 2 + 1 }, (_, k) => k / 2);
  const hh = (t: number) => { const m = Math.round((clock + t) * 60); return `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`; };
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role="img" aria-label={`Grafik jarak terhadap waktu: ${a.name} mulai pukul ${hh(a.start)} dengan ${a.speed} km/jam, ${b.name} mulai pukul ${hh(b.start)} dengan ${b.speed} km/jam`}>
    {halfs.map(t => <g key={t}><line x1={X(t)} x2={X(t)} y1={y0} y2={y0 - h} stroke="#e3ebe7" /><text x={X(t)} y={y0 + 12} textAnchor="middle" fontSize="8.5" fill="#5b6b64">{hh(t)}</text></g>)}
    {Array.from({ length: Math.floor(top / step) + 1 }, (_, k) => k * step).map(d => <g key={d}><line x1={x0} x2={x0 + w} y1={Y(d)} y2={Y(d)} stroke="#e3ebe7" /><text x={x0 - 4} y={Y(d) + 3} textAnchor="end" fontSize="8.5" fill="#5b6b64">{d}</text></g>)}
    <line x1={x0} x2={x0 + w} y1={y0} y2={y0} stroke="#33413b" /><line x1={x0} x2={x0} y1={y0} y2={y0 - h} stroke="#33413b" />
    {[a, b].map((p, i) => <g key={p.name}><line x1={X(p.start)} y1={y0} x2={X(hours)} y2={Y(p.speed * (hours - p.start))} stroke={lineColors[i]} strokeWidth="2.4" />
      <text x={X(hours) - 4} y={Y(p.speed * (hours - p.start)) + (i ? -6 : 14)} textAnchor="end" fontSize="10" fontWeight="800" fill={lineColors[i]}>{p.name}</text></g>)}
    <text x={x0 + w / 2} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>Waktu (pukul)</text>
    <text x="10" y={y0 - h / 2} fontSize="10" fontWeight="700" fill={ink} transform={`rotate(-90 10 ${y0 - h / 2})`} textAnchor="middle">Jarak (km)</text>
  </svg>;
}

/* ---------- Dua sudut berpenyiku ---------- */
export function AnglesView({ small, big }: { small: string; big: string }) {
  const o = { x: 60, y: 150 }, R = 110, t = (20 * Math.PI) / 180, p = { x: o.x + R * Math.cos(t), y: o.y - R * Math.sin(t) };
  return <svg viewBox="0 0 220 170" className="w-full max-w-[16rem]" role="img" aria-label={`Sudut siku-siku dibagi menjadi sudut ${small} dan sudut ${big}`}>
    <line x1={o.x} y1={o.y} x2={o.x + R + 20} y2={o.y} stroke={ink} strokeWidth="2.4" /><line x1={o.x} y1={o.y} x2={o.x} y2={o.y - R - 10} stroke={ink} strokeWidth="2.4" />
    <line x1={o.x} y1={o.y} x2={p.x + 14} y2={p.y - 5} stroke={blue} strokeWidth="2.4" />
    <path d={`M${o.x + 12} ${o.y}v-12h-12`} fill="none" stroke="#5b6b64" strokeWidth="1.2" />
    <path d={`M${o.x + 34} ${o.y}A34 34 0 0 0 ${o.x + 34 * Math.cos(t)} ${o.y - 34 * Math.sin(t)}`} fill="none" stroke={orange} strokeWidth="2" />
    <path d={`M${o.x + 52 * Math.cos(t)} ${o.y - 52 * Math.sin(t)}A52 52 0 0 0 ${o.x} ${o.y - 52}`} fill="none" stroke={green} strokeWidth="2" />
    <text x={o.x + 42} y={o.y - 6} fontSize="14" fontWeight="800" fill={orange}>{small}</text>
    <text x={o.x + 40} y={o.y - 58} fontSize="14" fontWeight="800" fill={green}>{big}</text>
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "plane": return <PlaneView eqs={scene.eqs} labels={scene.labels} points={scene.points} r={scene.r} />;
    case "planes": return <div className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-3">{scene.items.map(it => <figure key={it.caption} className="flex flex-col items-center rounded-lg bg-base-100 p-1">
      <GraphView lines={it.eqs.map(e => toLine(e))} r={scene.r ?? 4} size="w-full max-w-[11rem]" label={`Grafik ${it.caption}`} /><figcaption className="text-sm font-bold">{it.caption}</figcaption></figure>)}</div>;
    case "receipt": return <ReceiptView title={scene.title} rows={scene.rows} />;
    case "chase": return <ChaseView a={scene.a} b={scene.b} clock={scene.clock} hours={scene.hours} />;
    case "angles": return <AnglesView small={scene.small} big={scene.big} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
