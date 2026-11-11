"use client";

import { geoShapes, type Fig, type Seg } from "@/data/grade-three-plane-elements";

const ink = "#17352a";
const P = 34; // ukuran satu petak (px dalam viewBox)

function Arrow({ x, y, dx, dy, color = ink }: { x: number; y: number; dx: number; dy: number; color?: string }) {
  const l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, s = 9;
  return <path d={`M${x} ${y}L${x - ux * s - uy * s * .55} ${y - uy * s + ux * s * .55}L${x - ux * s + uy * s * .55} ${y - uy * s - ux * s * .55}z`} fill={color} />;
}

/** Tanda sudut siku-siku di titik p, mengikuti dua ruas garis yang melewati p. */
function RightMark({ p, segs }: { p: [number, number]; segs: Seg[] }) {
  const dirs: [number, number][] = [];
  for (const [x1, y1, x2, y2] of segs) {
    const on = Math.abs((x2 - x1) * (p[1] - y1) - (y2 - y1) * (p[0] - x1)) < 1e-6 && Math.min(x1, x2) - 1e-6 <= p[0] && p[0] <= Math.max(x1, x2) + 1e-6 && Math.min(y1, y2) - 1e-6 <= p[1] && p[1] <= Math.max(y1, y2) + 1e-6;
    if (!on) continue;
    const far = Math.hypot(x1 - p[0], y1 - p[1]) > Math.hypot(x2 - p[0], y2 - p[1]) ? [x1, y1] : [x2, y2];
    const l = Math.hypot(far[0] - p[0], far[1] - p[1]); dirs.push([(far[0] - p[0]) / l, (far[1] - p[1]) / l]);
  }
  if (dirs.length < 2) return null;
  const [u, v] = dirs, s = 0.28, x = p[0], y = p[1];
  const pts = [[x + u[0] * s, y + u[1] * s], [x + (u[0] + v[0]) * s, y + (u[1] + v[1]) * s], [x + v[0] * s, y + v[1] * s]];
  return <path d={`M${pts.map(([a, b]) => `${a * P} ${b * P}`).join("L")}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />;
}

export function GridFig({ fig, className = "w-full max-w-56" }: { fig: Extract<Fig, { t: "grid" }>; className?: string }) {
  const { w, h, segs, labels = [], arrows = [], right = [] } = fig;
  return <svg viewBox={`-4 -4 ${w * P + 8} ${h * P + 8}`} className={className} role="img" aria-label="Gambar pada kertas berpetak">
    <rect x="0" y="0" width={w * P} height={h * P} fill="#fff" stroke="#cbd5e1" />
    {Array.from({ length: w - 1 }, (_, i) => <path key={`v${i}`} d={`M${(i + 1) * P} 0V${h * P}`} stroke="#e2e8f0" />)}
    {Array.from({ length: h - 1 }, (_, i) => <path key={`h${i}`} d={`M0 ${(i + 1) * P}H${w * P}`} stroke="#e2e8f0" />)}
    {segs.map(([x1, y1, x2, y2, c = "#e11d48"], i) => <g key={i}>
      <path d={`M${x1 * P} ${y1 * P}L${x2 * P} ${y2 * P}`} stroke={c} strokeWidth="2.6" strokeLinecap="round" />
      {arrows.includes(i) && <><Arrow x={x2 * P} y={y2 * P} dx={(x2 - x1) * P} dy={(y2 - y1) * P} color={c} /><Arrow x={x1 * P} y={y1 * P} dx={(x1 - x2) * P} dy={(y1 - y2) * P} color={c} /></>}
    </g>)}
    {right.map((p, i) => <RightMark key={i} p={p} segs={segs} />)}
    {labels.map(([x, y, t]) => <text key={t + x + y} x={x * P} y={y * P} fontSize="13" fontWeight="800" fill={ink} textAnchor="middle">{t}</text>)}
  </svg>;
}

/** Garis, ruas garis, sinar garis, atau kurva antara dua titik. */
export function LineFig({ kind, a, b }: { kind: "garis" | "ruas" | "sinar" | "kurva"; a: string; b: string }) {
  const x1 = 40, x2 = 200, y = 34;
  return <svg viewBox="0 0 240 60" className="w-full max-w-64" role="img" aria-label={`Gambar ${a}${b}`}>
    {kind === "kurva" ? <path d={`M${x1} ${y}Q120 2 ${x2} ${y}`} fill="none" stroke={ink} strokeWidth="2.4" />
      : <path d={`M${kind === "garis" ? 10 : x1} ${y}H${kind === "ruas" ? x2 : 230}`} stroke={ink} strokeWidth="2.4" />}
    {kind === "garis" && <Arrow x={8} y={y} dx={-1} dy={0} />}
    {(kind === "garis" || kind === "sinar") && <Arrow x={232} y={y} dx={1} dy={0} />}
    <circle cx={x1} cy={y} r="3.5" fill={ink} /><circle cx={x2} cy={y} r="3.5" fill={ink} />
    <text x={x1} y={y + 20} fontSize="13" fontWeight="800" textAnchor="middle">{a}</text><text x={x2} y={y + 20} fontSize="13" fontWeight="800" textAnchor="middle">{b}</text>
  </svg>;
}

/** Penggaris 0–12 cm dengan garis milimeter; ruas garis dari 0 sampai cm. */
export function RulerFig({ cm, a, b, max = 12 }: { cm: number; a: string; b: string; max?: number }) {
  const pad = 14, u = 26, W = pad * 2 + max * u;
  return <svg viewBox={`0 0 ${W} 86`} className="w-full max-w-md" role="img" aria-label={`Ruas garis ${a}${b} di atas penggaris`}>
    <path d={`M${pad} 22H${pad + cm * u}`} stroke="#2563eb" strokeWidth="3" /><circle cx={pad} cy="22" r="3.5" fill={ink} /><circle cx={pad + cm * u} cy="22" r="3.5" fill={ink} />
    <text x={pad} y="13" fontSize="12" fontWeight="800" textAnchor="middle">{a}</text><text x={pad + cm * u} y="13" fontSize="12" fontWeight="800" textAnchor="middle">{b}</text>
    <rect x="2" y="30" width={W - 4} height="48" rx="3" fill="#fefce8" stroke={ink} />
    {Array.from({ length: max * 10 + 1 }, (_, k) => { const x = pad + k * u / 10, big = k % 10 === 0, mid = k % 5 === 0; return <g key={k}>
      <path d={`M${x} 30v${big ? 14 : mid ? 10 : 6}`} stroke={ink} strokeWidth={big ? 1.2 : 0.6} />
      {big && <text x={x} y="58" fontSize="10" textAnchor="middle">{k / 10}</text>}
    </g>; })}
    <text x={W - 10} y="72" fontSize="9" textAnchor="end" fill="#64748b">cm</text>
  </svg>;
}

/** Sudut dengan dua kaki; bisa ditambah busur derajat. */
export function AngleFig({ deg, base = 0, names, protractor = false, size = "w-full max-w-60" }: { deg: number; base?: number; names: [string, string, string]; protractor?: boolean; size?: string }) {
  const cx = 130, cy = 120, R = 100;
  const pt = (d: number, r: number) => [cx + r * Math.cos((d * Math.PI) / 180), cy - r * Math.sin((d * Math.PI) / 180)];
  const [ax, ay] = pt(base, R + 6), [bx, by] = pt(base + deg, R + 6);
  const [arx, ary] = pt(base, 24), [brx, bry] = pt(base + deg, 24);
  return <svg viewBox="0 0 260 140" className={size} role="img" aria-label={`Sudut ${names[0]}${names[1]}${names[2]}`}>
    {protractor && <Protractor cx={cx} cy={cy} R={R} />}
    {deg === 90 ? (() => { const [p1x, p1y] = pt(base, 16), [p3x, p3y] = pt(base + 90, 16), [p2x, p2y] = [p1x + p3x - cx, p1y + p3y - cy]; return <path d={`M${p1x} ${p1y}L${p2x} ${p2y}L${p3x} ${p3y}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />; })()
      : <path d={`M${arx} ${ary}A24 24 0 ${deg > 180 ? 1 : 0} 0 ${brx} ${bry}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />}
    <path d={`M${cx} ${cy}L${ax} ${ay}M${cx} ${cy}L${bx} ${by}`} stroke="#2563eb" strokeWidth="2.6" strokeLinecap="round" />
    <circle cx={cx} cy={cy} r="3" fill={ink} />
    <text x={ax + 4} y={ay + 14} fontSize="13" fontWeight="800">{names[0]}</text>
    <text x={cx - 4} y={cy + 16} fontSize="13" fontWeight="800" textAnchor="middle">{names[1]}</text>
    <text x={bx + (bx < cx ? -14 : 4)} y={by - 4} fontSize="13" fontWeight="800">{names[2]}</text>
  </svg>;
}

export function Protractor({ cx, cy, R }: { cx: number; cy: number; R: number }) {
  const pt = (d: number, r: number) => [cx + r * Math.cos((d * Math.PI) / 180), cy - r * Math.sin((d * Math.PI) / 180)];
  return <g aria-hidden="true">
    <path d={`M${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx + R} ${cy}Z`} fill="#e0f2fe" fillOpacity=".7" stroke="#0369a1" />
    {Array.from({ length: 37 }, (_, k) => { const d = k * 5, [x1, y1] = pt(d, R), [x2, y2] = pt(d, R - (k % 2 ? 6 : 11)); return <g key={k}>
      <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#0369a1" strokeWidth={k % 2 ? 0.6 : 1} />
      {k % 2 === 0 && (() => { const [tx, ty] = pt(d, R - 20); return <text x={tx} y={ty + 3} fontSize="7" textAnchor="middle" fill="#075985">{d}</text>; })()}
    </g>; })}
    <circle cx={cx} cy={cy} r="2" fill="#0369a1" />
  </g>;
}

export function ShapeFig({ s }: { s: "triangle" | "square" | "rect" | "circle" | "pentagon" | "hexagon" | "trapezoid" }) {
  const c = { triangle: "#2563eb", square: "#dc2626", rect: "#17352a", circle: "#16a34a", pentagon: "#7c3aed", hexagon: "#ea580c", trapezoid: "#0891b2" }[s];
  const reg = (n: number) => Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return `${30 + 22 * Math.cos(a)} ${30 + 22 * Math.sin(a)}`; }).join("L");
  return <svg viewBox="0 0 60 60" className="size-12" aria-hidden="true">
    {s === "circle" ? <circle cx="30" cy="30" r="22" fill="none" stroke={c} strokeWidth="2.4" />
      : s === "square" ? <rect x="12" y="12" width="36" height="36" fill="none" stroke={c} strokeWidth="2.4" />
      : s === "rect" ? <rect x="4" y="18" width="52" height="26" fill="none" stroke={c} strokeWidth="2.4" />
      : s === "trapezoid" ? <path d="M16 16H44L54 46H6Z" fill="none" stroke={c} strokeWidth="2.4" />
      : <path d={`M${reg(s === "triangle" ? 3 : s === "pentagon" ? 5 : 6)}Z`} fill="none" stroke={c} strokeWidth="2.4" />}
  </svg>;
}

const letters: Record<string, Seg[]> = {
  M: [[0, 4, 0, 0], [0, 0, 1.5, 2], [1.5, 2, 3, 0], [3, 0, 3, 4]], A: [[0, 4, 1.5, 0], [1.5, 0, 3, 4], [0.75, 2, 2.25, 2]], T: [[0, 0, 3, 0], [1.5, 0, 1.5, 4]],
  E: [[0, 0, 0, 4], [0, 0, 3, 0], [0, 2, 2.5, 2], [0, 4, 3, 4]], K: [[0, 0, 0, 4], [3, 0, 0, 2], [0, 2, 3, 4]], I: [[1.5, 0, 1.5, 4]], L: [[0, 0, 0, 4], [0, 4, 3, 4]],
  V: [[0, 0, 1.5, 4], [1.5, 4, 3, 0]], H: [[0, 0, 0, 4], [3, 0, 3, 4], [0, 2, 3, 2]],
};
export function LetterFig({ ch }: { ch: string }) {
  return <svg viewBox="-12 -12 126 160" className="h-20 w-auto" role="img" aria-label={`Huruf ${ch}`}>
    {Array.from({ length: 5 }, (_, i) => <path key={`g${i}`} d={`M${i * 34 - 12} -12V148`} stroke="#fecdd3" strokeWidth=".8" />)}
    {Array.from({ length: 6 }, (_, i) => <path key={`h${i}`} d={`M-12 ${i * 34 - 12}H114`} stroke="#fecdd3" strokeWidth=".8" />)}
    {(letters[ch] ?? []).map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1 * 34} ${y1 * 34}L${x2 * 34} ${y2 * 34}`} stroke="#e11d48" strokeWidth="9" strokeLinecap="square" />)}
  </svg>;
}

const tangram: { pts: [number, number][]; n: number; c: string }[] = [
  { pts: [[0, 0], [4, 0], [2, 2]], n: 1, c: "#fde68a" }, { pts: [[0, 0], [2, 2], [0, 4]], n: 2, c: "#bfdbfe" }, { pts: [[4, 4], [4, 2], [2, 4]], n: 3, c: "#bbf7d0" },
  { pts: [[2, 2], [3, 1], [3, 3]], n: 4, c: "#fecaca" }, { pts: [[2, 2], [3, 3], [2, 4], [1, 3]], n: 5, c: "#d1d5db" }, { pts: [[1, 3], [2, 4], [0, 4]], n: 6, c: "#fbcfe8" },
  { pts: [[4, 0], [4, 2], [3, 3], [3, 1]], n: 7, c: "#a7f3d0" },
];
export function TangramFig() {
  return <svg viewBox="-2 -2 164 164" className="w-full max-w-48" role="img" aria-label="Tangram 7 bagian bernomor 1 sampai 7">
    {tangram.map(p => { const cx = p.pts.reduce((s, q) => s + q[0], 0) / p.pts.length, cy = p.pts.reduce((s, q) => s + q[1], 0) / p.pts.length; return <g key={p.n}>
      <path d={`M${p.pts.map(([x, y]) => `${x * 40} ${y * 40}`).join("L")}Z`} fill={p.c} stroke={ink} strokeWidth="1.6" />
      <text x={cx * 40} y={cy * 40 + 5} fontSize="14" fontWeight="800" textAnchor="middle">{p.n}</text></g>; })}
  </svg>;
}

export function OrnamentFig() {
  return <svg viewBox="-14 -8 248 202" className="w-full max-w-64" role="img" aria-label="Hiasan berbingkai dengan garis a, b, c, d, e dan segi empat putih di tengah">
    <rect x="10" y="10" width="200" height="166" fill="#fef3c7" />
    <path d="M110 22L196 93L110 164L24 93Z" fill="#fb7185" stroke="#be123c" strokeWidth="2" />
    <rect x="86" y="69" width="48" height="48" fill="#fff" stroke={ink} strokeWidth="1.5" />
    <path d="M10 10H210M10 176H210" stroke="#16a34a" strokeWidth="4" /><path d="M10 10V176M210 10V176" stroke="#2563eb" strokeWidth="4" />
    {[[110, 4, "a"], [110, 192, "b"], [158, 52, "c"], [-4, 98, "d"], [224, 98, "e"]].map(([x, y, t]) => <text key={t as string} x={x as number} y={y as number} fontSize="14" fontWeight="800" textAnchor="middle" fill={ink}>{t}</text>)}
  </svg>;
}

export function GeoboardFig() {
  return <div className="flex flex-wrap justify-center gap-3" role="img" aria-label="Dua bangun pada papan paku: hijau dan biru">
    {geoShapes.map((g, i) => <svg key={i} viewBox="-14 -14 198 180" className="w-40 rounded-lg bg-[#c88b45]">
      {Array.from({ length: 6 }, (_, x) => Array.from({ length: 5 }, (_, y) => <circle key={`${x}${y}`} cx={x * 34} cy={y * 34} r="3" fill="#7c4a1e" />))}
      <path d={`M${g.pts.map(([x, y]) => `${x * 34} ${y * 34}`).join("L")}Z`} fill="none" stroke={g.color} strokeWidth="3.5" strokeLinejoin="round" />
      <text x="85" y="158" fontSize="12" fontWeight="800" textAnchor="middle" fill="#fff">{i === 0 ? "Bangun hijau" : "Bangun biru"}</text>
    </svg>)}
  </div>;
}

export function FigView({ fig }: { fig: Fig }) {
  switch (fig.t) {
    case "line": return <LineFig {...fig} />;
    case "ruler": return <RulerFig cm={fig.cm} a={fig.a} b={fig.b} />;
    case "grid": return <GridFig fig={fig} />;
    case "angle": return <AngleFig deg={fig.deg} base={fig.base} names={fig.names} protractor={fig.protractor} />;
    case "shape": return <ShapeFig s={fig.s} />;
    case "letter": return <LetterFig ch={fig.ch} />;
    case "tangram": return <TangramFig />;
    case "ornament": return <OrnamentFig />;
    case "geoboard": return <GeoboardFig />;
  }
}

/* ====================================================================== */
/* Alat interaktif (dipakai di lab dan soal)                               */
/* ====================================================================== */
export function SegmentTool({ value, onChange, a = "A", b = "B", disabled = false }: { value: number; onChange: (v: number) => void; a?: string; b?: string; disabled?: boolean }) {
  return <div className="space-y-2">
    <RulerFig cm={value} a={a} b={b} />
    <label className="block text-sm font-bold">Tarik titik {b}: {String(value).replace(".", ",")} cm
      <input type="range" aria-label={`Tarik titik ${b}`} min={0} max={12} step={0.1} value={value} disabled={disabled} onChange={e => onChange(Number(e.target.value))} className="range range-info range-sm mt-1 w-full" />
    </label>
    <div className="flex flex-wrap gap-1">{[[-1, "−1 cm"], [-0.1, "−1 mm"], [0.1, "+1 mm"], [1, "+1 cm"]].map(([d, t]) => <button key={t as string} type="button" disabled={disabled} className="btn btn-xs btn-outline" onClick={() => onChange(Math.max(0, Math.min(12, Math.round((value + (d as number)) * 10) / 10)))}>{t}</button>)}</div>
  </div>;
}

export function AngleTool({ value, onChange, disabled = false, max = 180 }: { value: number; onChange: (v: number) => void; disabled?: boolean; max?: number }) {
  return <div className="space-y-2">
    <AngleFig deg={value} names={["A", "O", "B"]} protractor size="w-full max-w-72" />
    <label className="block text-sm font-bold">Putar kaki OB: {value}°
      <input type="range" aria-label="Putar kaki OB" min={0} max={max} step={5} value={value} disabled={disabled} onChange={e => onChange(Number(e.target.value))} className="range range-info range-sm mt-1 w-full" />
    </label>
    <div className="flex flex-wrap gap-1">{[-10, -5, 5, 10].map(d => <button key={d} type="button" disabled={disabled} className="btn btn-xs btn-outline" onClick={() => onChange(Math.max(0, Math.min(max, value + d)))}>{d > 0 ? `+${d}°` : `${d}°`}</button>)}</div>
  </div>;
}

/** Trapesium siku-siku dengan 4 calon garis potong yang tidak bersilangan. */
export const cutLines: Seg[] = [[1.2, 1.56, 1.2, 3], [2.5, 0, 2.5, 3], [4, 0, 4, 3], [5, 0, 5, 3]];
export function CutTool({ selected, toggle, disabled = false }: { selected: number[]; toggle: (i: number) => void; disabled?: boolean }) {
  const S = 40;
  return <div className="space-y-2">
    <svg viewBox="-10 -10 260 140" className="w-full max-w-sm" role="img" aria-label={`Trapesium dibagi menjadi ${selected.length + 1} bagian`}>
      <path d={`M${2.5 * S} 0H${6 * S}V${3 * S}H0Z`} fill="#fef9c3" stroke={ink} strokeWidth="2.4" strokeLinejoin="round" />
      {cutLines.map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1 * S} ${y1 * S}L${x2 * S} ${y2 * S}`} stroke={selected.includes(i) ? "#dc2626" : "#94a3b8"} strokeWidth={selected.includes(i) ? 3 : 1.5} strokeDasharray={selected.includes(i) ? undefined : "5 4"} />)}
    </svg>
    <div className="flex flex-wrap gap-1.5">{cutLines.map((_, i) => <button key={i} type="button" aria-pressed={selected.includes(i)} disabled={disabled} className={`btn btn-sm ${selected.includes(i) ? "btn-error text-white" : "btn-outline"}`} onClick={() => toggle(i)}>Potong {i + 1}</button>)}</div>
    <p aria-live="polite" className="text-sm font-bold">Banyak bagian: {selected.length + 1}</p>
  </div>;
}
