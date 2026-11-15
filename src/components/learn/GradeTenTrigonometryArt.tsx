import { M as BaseM, plainMath } from "./GradeEightPowersArt";
import { idn, type Scene } from "@/data/grade-ten-trigonometry";

export { plainMath };
/** Pecahan bertumpuk tanpa kurung di pembilang/penyebut. */
export const M = ({ text }: { text: string }) => <BaseM text={text.replace(/\{\(([^(){}]*)\)\//g, "{$1/").replace(/\/\(([^(){}]*)\)\}/g, "/$1}")} />;
const ink = "#1f3b30", soft = "#5b6b64", blue = "#1c64b5", warm = "#c2410c", leaf = "#2b8a3e";

/* ---------- Segitiga siku-siku ---------- */
export function RightTri({ names, sides, ratio = 0.75, angle, caption }: { names: [string, string, string]; sides: [string, string, string]; ratio?: number; angle?: string; caption?: string }) {
  const W = 260, H = 190, base = ratio > 1.2 ? 120 : 200, h = Math.min(140, base * ratio), x0 = 30, y0 = 165, P = [x0, y0], Q = [x0 + base, y0], R = [x0 + base, y0 - h];
  return <figure className="flex flex-col items-center gap-1"><svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" role="img" aria-label={`Segitiga siku-siku ${names.join("")} dengan siku-siku di ${names[1]}${sides[0] ? `, ${names[0]}${names[1]} = ${sides[0]}` : ""}${sides[1] ? `, ${names[1]}${names[2]} = ${sides[1]}` : ""}${sides[2] ? `, ${names[0]}${names[2]} = ${sides[2]}` : ""}`}>
    <path d={`M${P} L${Q} L${R} Z`} fill="#e7f5ec" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    <path d={`M${Q[0] - 12} ${y0} v-12 h12`} fill="none" stroke={ink} />
    <path d={`M${x0 + 26} ${y0} A26 26 0 0 0 ${x0 + 26 * Math.cos(Math.atan2(h, base))} ${y0 - 26 * Math.sin(Math.atan2(h, base))}`} fill="none" stroke={warm} strokeWidth="1.6" />
    {angle && <text x={x0 + 32} y={y0 - 8} fontSize="11" fill={warm}>{angle}</text>}
    <text x={P[0] - 6} y={P[1] + 14} textAnchor="end" fontSize="13" fontWeight="700" fill={ink}>{names[0]}</text>
    <text x={Q[0] + 6} y={Q[1] + 14} fontSize="13" fontWeight="700" fill={ink}>{names[1]}</text>
    <text x={R[0] + 6} y={R[1] + 4} fontSize="13" fontWeight="700" fill={ink}>{names[2]}</text>
    {sides[0] && <text x={(P[0] + Q[0]) / 2} y={y0 + 18} textAnchor="middle" fontSize="12" fill={blue}>{sides[0]}</text>}
    {sides[1] && <text x={Q[0] + 8} y={y0 - h / 2} fontSize="12" fill={blue}>{sides[1]}</text>}
    {sides[2] && <text x={(P[0] + R[0]) / 2 - 8} y={(P[1] + R[1]) / 2 - 6} textAnchor="end" fontSize="12" fill={blue}>{sides[2]}</text>}
  </svg>{caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}</figure>;
}

/* ---------- Segitiga sembarang (sudut dalam derajat) ---------- */
export function Triangle({ names, angles, sides = ["", "", ""], marks = ["", "", ""], caption }: { names: [string, string, string]; angles: [number, number, number]; sides?: [string, string, string]; marks?: [string, string, string]; caption?: string }) {
  const r = (d: number) => (d * Math.PI) / 180, [A, , C] = angles, b = Math.sin(r(angles[1])), c = Math.sin(r(C));
  const pts = [[0, 0], [c, 0], [b * Math.cos(r(A)), b * Math.sin(r(A))]];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys), k = Math.min(220 / (maxX - minX), 130 / maxY);
  const P = pts.map(([x, y]) => [30 + (x - minX) * k, 160 - y * k]);
  const mid = (i: number, j: number) => [(P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2];
  const cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3, out = (p: number[], d = 14) => { const dx = p[0] - cx, dy = p[1] - cy, l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * d, p[1] + (dy / l) * d]; };
  const sideAt = [[1, 2], [2, 0], [0, 1]] as const;
  return <figure className="flex flex-col items-center gap-1"><svg viewBox="0 0 280 190" className="w-full max-w-xs" role="img" aria-label={`Segitiga ${names.join("")}${marks.map((m, i) => (m ? `, sudut ${names[i]} = ${m}` : "")).join("")}${sides.map((s, i) => (s ? `, sisi di depan ${names[i]}: ${s}` : "")).join("")}`}>
    <path d={`M${P[0]} L${P[1]} L${P[2]} Z`} fill="#eef4fb" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    {P.map((p, i) => { const [x, y] = out(p, 14); return <text key={i} x={x} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={ink}>{names[i]}</text>; })}
    {marks.map((m, i) => { if (!m) return null; const [x, y] = [p0(P[i], cx, cy, 24)[0], p0(P[i], cx, cy, 24)[1]]; return <text key={`m${i}`} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={warm}>{m}</text>; })}
    {sides.map((s, i) => { if (!s) return null; const [x, y] = out(mid(sideAt[i][0], sideAt[i][1]), 20); return <text key={`s${i}`} x={x} y={y + 4} textAnchor="middle" fontSize="12" fill={blue}>{s}</text>; })}
  </svg>{caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}</figure>;
}
const p0 = (p: number[], cx: number, cy: number, d: number) => { const dx = cx - p[0], dy = cy - p[1], l = Math.hypot(dx, dy) || 1; return [p[0] + (dx / l) * d, p[1] + (dy / l) * d]; };

/* ---------- Jam dinding ---------- */
export function Clock({ h, m }: { h: number; m: number }) {
  const c = 70, mAng = (m / 60) * 360, hAng = ((h % 12) / 12) * 360 + m * 0.5, at = (deg: number, len: number) => [c + len * Math.sin((deg * Math.PI) / 180), c - len * Math.cos((deg * Math.PI) / 180)];
  return <svg viewBox="0 0 140 140" className="w-40" role="img" aria-label={`Jam menunjukkan pukul ${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`}>
    <circle cx={c} cy={c} r="64" fill="#fffdf6" stroke={ink} strokeWidth="3" />
    {Array.from({ length: 60 }, (_, i) => { const [x1, y1] = at(i * 6, i % 5 ? 58 : 54), [x2, y2] = at(i * 6, 61); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={i % 5 ? 0.7 : 1.6} />; })}
    {Array.from({ length: 12 }, (_, i) => { const [x, y] = at((i + 1) * 30, 45); return <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fill={ink}>{i + 1}</text>; })}
    <line x1={c} y1={c} x2={at(hAng, 32)[0]} y2={at(hAng, 32)[1]} stroke={ink} strokeWidth="4" strokeLinecap="round" />
    <line x1={c} y1={c} x2={at(mAng, 50)[0]} y2={at(mAng, 50)[1]} stroke={warm} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx={c} cy={c} r="3.5" fill={ink} />
  </svg>;
}

/* ---------- Tiang bendera dan pengamat ---------- */
function Person({ x, y, h = 34 }: { x: number; y: number; h?: number }) {
  const s = h / 34;
  return <g transform={`translate(${x} ${y}) scale(${s})`} aria-hidden="true"><circle cx="0" cy="-30" r="4.5" fill="#f4c095" stroke={ink} strokeWidth="1" />
    <path d="M-5 -24 h10 l1 13 h-12 z" fill={blue} /><path d="M-4 -11 l-1 11 M4 -11 l1 11" stroke={ink} strokeWidth="2.4" strokeLinecap="round" /></g>;
}
function Pole({ x, top, ground }: { x: number; top: number; ground: number }) {
  return <g aria-hidden="true"><rect x={x - 6} y={ground - 6} width="12" height="6" fill="#ced4da" stroke={ink} strokeWidth="0.8" /><line x1={x} y1={ground - 6} x2={x} y2={top} stroke="#868e96" strokeWidth="3" />
    <circle cx={x} cy={top - 2} r="2.5" fill="#868e96" /><path d={`M${x + 1.5} ${top + 2} h26 v8 h-26 z`} fill="#e03131" /><path d={`M${x + 1.5} ${top + 10} h26 v8 h-26 z`} fill="#fff" stroke="#dee2e6" strokeWidth="0.6" /></g>;
}
export function Elevation({ kind, labels }: { kind: string; labels: Record<string, string> }) {
  const g = 170;
  if (kind === "tiang") return <svg viewBox="0 0 300 200" className="w-full max-w-sm" role="img" aria-label={`Tiang setinggi ${labels.tinggi} dengan bayangan ${labels.jarak}, sudut matahari ${labels.sudut}`}>
    <line x1="10" x2="290" y1={g} y2={g} stroke={soft} strokeWidth="1.5" /><Pole x={60} top={40} ground={g} />
    <line x1="60" y1="40" x2="250" y2={g} stroke="#f59f00" strokeWidth="1.5" strokeDasharray="5 4" /><line x1="60" y1={g} x2="250" y2={g} stroke={ink} strokeWidth="4" opacity="0.35" />
    <path d={`M222 ${g} A28 28 0 0 1 ${250 - 28 * Math.cos(Math.atan2(130, 190))} ${g - 28 * Math.sin(Math.atan2(130, 190))}`} fill="none" stroke={warm} strokeWidth="1.6" />
    <text x="212" y={g - 8} fontSize="12" fill={warm}>{labels.sudut}</text><text x="40" y="110" textAnchor="end" fontSize="12" fill={blue}>{labels.tinggi}</text><text x="155" y={g + 18} textAnchor="middle" fontSize="12" fill={blue}>bayangan {labels.jarak}</text>
  </svg>;
  return <svg viewBox="0 0 320 200" className="w-full max-w-sm" role="img" aria-label={`Tiang bendera dilihat dua guru setinggi ${labels.mata} yang berjarak ${labels.jarak}, sudut elevasi ${labels.a} dan ${labels.b}`}>
    <line x1="10" x2="310" y1={g} y2={g} stroke={soft} strokeWidth="1.5" /><Pole x={40} top={30} ground={g} />
    <Person x={140} y={g} /><Person x={270} y={g} />
    <line x1="140" y1={g - 30} x2="40" y2="30" stroke={warm} strokeDasharray="4 3" /><line x1="270" y1={g - 30} x2="40" y2="30" stroke={warm} strokeDasharray="4 3" /><line x1="40" y1={g - 30} x2="270" y2={g - 30} stroke="#adb5bd" strokeDasharray="2 3" />
    <text x="118" y={g - 34} fontSize="11" fill={warm}>{labels.a}</text><text x="246" y={g - 34} fontSize="11" fill={warm}>{labels.b}</text>
    <text x="205" y={g + 16} textAnchor="middle" fontSize="12" fill={blue}>{labels.jarak}</text><line x1="140" x2="270" y1={g + 5} y2={g + 5} stroke={blue} /><text x="286" y={g - 12} fontSize="10" fill={soft}>{labels.mata}</text>
    <text x="24" y="100" textAnchor="end" fontSize="12" fontWeight="700" fill={ink}>A</text><text x="24" y={g - 26} textAnchor="end" fontSize="12" fontWeight="700" fill={ink}>B</text>
  </svg>;
}

/* ---------- Lingkaran satuan dan sudut baku ---------- */
export function UnitCircle({ deg, label, coords, cls = "w-full max-w-[16rem]" }: { deg: number; label?: string; coords?: string; cls?: string }) {
  const c = 110, R = 80, t = (deg * Math.PI) / 180, px = c + R * Math.cos(t), py = c - R * Math.sin(t), d = ((deg % 360) + 360) % 360, turns = Math.floor(Math.abs(deg) / 360);
  const arcR = 22, end = [c + arcR * Math.cos(t), c - arcR * Math.sin(t)], sweep = deg >= 0 ? 0 : 1, big = (deg >= 0 ? d : 360 - d) > 180 ? 1 : 0;
  return <svg viewBox="0 0 220 220" className={cls} role="img" aria-label={`Sudut ${idn(deg)}° pada lingkaran satuan${coords ? `, titik ${plainMath(coords)}` : ""}`}>
    {["I", "II", "III", "IV"].map((k, i) => <text key={k} x={c + (i === 0 || i === 3 ? 60 : -60)} y={c + (i < 2 ? -60 : 66)} textAnchor="middle" fontSize="11" fill="#adb5bd">{k}</text>)}
    <line x1="10" x2="210" y1={c} y2={c} stroke={ink} /><line y1="10" y2="210" x1={c} x2={c} stroke={ink} />
    <circle cx={c} cy={c} r={R} fill="none" stroke="#adb5bd" strokeWidth="1.5" />
    {d % 360 !== 0 || deg === 0 ? <path d={`M${c + arcR} ${c} A${arcR} ${arcR} 0 ${big} ${sweep} ${end[0]} ${end[1]}`} fill="none" stroke={warm} strokeWidth="2" /> : <circle cx={c} cy={c} r={arcR} fill="none" stroke={warm} strokeWidth="2" />}
    {turns > 0 && <text x={c + 26} y={c + 16} fontSize="10" fill={warm}>+{turns} putaran</text>}
    <line x1={c} y1={c} x2={px} y2={py} stroke={blue} strokeWidth="2.4" />
    <line x1={px} y1={py} x2={px} y2={c} stroke={leaf} strokeDasharray="3 3" />
    <circle cx={px} cy={py} r="4.5" fill={blue} />
    {label && <text x={c + 30} y={c - 8} fontSize="11" fill={warm}>{label}</text>}
    {coords && <text x={px + (Math.cos(t) >= 0 ? 6 : -6)} y={py + (Math.sin(t) >= 0 ? -8 : 16)} textAnchor={Math.cos(t) >= 0 ? "start" : "end"} fontSize="10" fill={ink}>{plainMath(coords)}</text>}
  </svg>;
}

/* ---------- Grafik fungsi trigonometri pada 0 ≤ x ≤ 2π ---------- */
export function TrigPlot({ fns, ymin, ymax, cls = "w-full max-w-sm" }: { fns: { f: (x: number) => number; label: string }[]; ymin: number; ymax: number; cls?: string }) {
  const W = 300, H = 200, pad = 24, X = (v: number) => pad + (v / (2 * Math.PI)) * (W - 2 * pad), Y = (v: number) => H - pad - ((v - ymin) / (ymax - ymin)) * (H - 2 * pad);
  const path = (f: (x: number) => number) => { const segs: string[][] = [[]]; for (let i = 0; i <= 240; i++) { const x = (i / 240) * 2 * Math.PI, y = f(x);
      if (!Number.isFinite(y) || y < ymin - 1 || y > ymax + 1) { if (segs[segs.length - 1].length) segs.push([]); continue; } segs[segs.length - 1].push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`); }
    return segs.filter(s => s.length > 1).map(s => s.join(" ")); };
  const yt: number[] = []; for (let v = Math.ceil(ymin); v <= ymax; v++) yt.push(v);
  return <svg viewBox={`0 0 ${W} ${H}`} className={cls} role="img" aria-label={`Grafik ${fns.map(f => plainMath(f.label)).filter(Boolean).join(", ") || "fungsi trigonometri"} untuk 0 sampai 2π`}>
    <defs><clipPath id={`tp${ymin}${ymax}`}><rect x={pad} y={pad - 4} width={W - 2 * pad} height={H - 2 * pad + 8} /></clipPath></defs>
    {yt.map(v => <line key={v} x1={pad} x2={W - pad} y1={Y(v)} y2={Y(v)} stroke="#eef2f0" />)}
    {[1, 2, 3, 4].map(k => <line key={k} x1={X((k * Math.PI) / 2)} x2={X((k * Math.PI) / 2)} y1={pad} y2={H - pad} stroke="#eef2f0" />)}
    <line x1={pad} x2={W - pad} y1={Y(0)} y2={Y(0)} stroke={ink} /><line x1={pad} x2={pad} y1={pad - 4} y2={H - pad} stroke={ink} />
    {["π/2", "π", "3π/2", "2π"].map((t, k) => <text key={t} x={X(((k + 1) * Math.PI) / 2)} y={Y(0) + 13} textAnchor="middle" fontSize="10" fill={soft}>{t}</text>)}
    {yt.filter(v => v).map(v => <text key={`y${v}`} x={pad - 4} y={Y(v) + 3} textAnchor="end" fontSize="9" fill={soft}>{v}</text>)}
    <g clipPath={`url(#tp${ymin}${ymax})`}>{fns.map((f, i) => path(f.f).map((d, k) => <polyline key={`${i}${k}`} points={d} fill="none" stroke={[blue, warm, leaf][i % 3]} strokeWidth="2.4" />))}</g>
    {fns.map((f, i) => f.label && <text key={`l${i}`} x={W - pad} y={pad + 4 + i * 13} textAnchor="end" fontSize="10" fontWeight="600" fill={[blue, warm, leaf][i % 3]}>{plainMath(f.label)}</text>)}
  </svg>;
}

export function TableView({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{caption && <caption className="mb-1 font-bold">{caption}</caption>}
    <thead><tr className="bg-success text-success-content">{head.map(h => <th key={h} className="px-2 py-1"><M text={h} /></th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 ${j === 0 ? "font-bold" : ""}`}>{typeof c === "number" ? idn(c) : <M text={c} />}</td>)}</tr>)}</tbody></table></div>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "right": return <RightTri {...scene} />;
    case "triangle": return <Triangle {...scene} />;
    case "clock": return <Clock h={scene.h} m={scene.m} />;
    case "elevation": return <Elevation kind={scene.kind} labels={scene.labels} />;
    case "circle": return <UnitCircle deg={scene.deg} label={scene.label} />;
    case "plot": return <TrigPlot fns={scene.fns} ymin={scene.ymin} ymax={scene.ymax} />;
    case "table": return <TableView head={scene.head} rows={scene.rows} caption={scene.caption} />;
  }
}
