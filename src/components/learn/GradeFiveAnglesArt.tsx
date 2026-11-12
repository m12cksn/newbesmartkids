import type { AngleSpec, Pt, Road } from "@/data/grade-five-angles";
import { clockAngle, cornerAngles } from "@/data/grade-five-angles";

/* Gambar Kelas 5 Bab 6: sudut, busur derajat, jam, kipas lipat, persimpangan jalan, keramik. */
const ink = "#1f3b30", blue = "#2563a6";
const P = (r: number, d: number): Pt => [r * Math.cos((d * Math.PI) / 180), -r * Math.sin((d * Math.PI) / 180)];
const arc = (r: number, a: number, b: number) => { const [x0, y0] = P(r, a), [x1, y1] = P(r, b), large = Math.abs(b - a) > 180 ? 1 : 0, sweep = b > a ? 0 : 1; return `M${x0} ${y0}A${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`; };

/** Busur derajat dengan pusat di (0,0), garis dasar searah base, terbuka ke sisi s. */
export function Protractor({ base, side }: { base: number; side: "ccw" | "cw" }) {
  const s = side === "ccw" ? 1 : -1, R = 108, dir = (f: number) => base + s * f;
  const [a0, a1] = [P(R, dir(0)), P(R, dir(180))];
  const outline = `M${a0[0]} ${a0[1]}A${R} ${R} 0 0 ${s > 0 ? 0 : 1} ${a1[0]} ${a1[1]}Z`;
  return <g aria-hidden="true">
    <path d={outline} fill="#dbeefe" fillOpacity="0.55" stroke="#4b6c8f" strokeWidth="0.9" />
    {Array.from({ length: 181 }, (_, f) => { if (f % 5) return null; const long = f % 10 === 0, [x0, y0] = P(R, dir(f)), [x1, y1] = P(R - (long ? 9 : 5), dir(f)); return <line key={f} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#4b6c8f" strokeWidth={long ? 0.8 : 0.5} />; })}
    {Array.from({ length: 19 }, (_, k) => { const f = k * 10, [ox, oy] = P(R - 16, dir(f)), [ix, iy] = P(R - 28, dir(f)); return <g key={f} fontSize="7" textAnchor="middle" fontWeight="700"><text x={ox} y={oy + 2.5} fill="#1d4ed8">{f}</text><text x={ix} y={iy + 2.5} fill="#b45309">{180 - f}</text></g>; })}
    <line x1={a0[0]} y1={a0[1]} x2={a1[0]} y2={a1[1]} stroke="#4b6c8f" strokeWidth="0.9" />
    <circle r="3" fill="none" stroke="#4b6c8f" strokeWidth="0.9" />
  </g>;
}

/** Gambar sudut. second = arah kaki kedua bila ditentukan dari luar (untuk melukis). */
export function AngleFig({ a, tool = false, className = "w-full max-w-72", label }: { a: AngleSpec; tool?: boolean; className?: string; label?: string }) {
  const s = a.side === "cw" ? -1 : 1, b2 = a.base + s * a.deg, [x1, y1] = P(100, a.base), [x2, y2] = P(100, b2);
  const mid = a.base + (s * a.deg) / 2, arcPath = a.reflex ? arc(20, Math.max(a.base, b2), Math.min(a.base, b2) + 360) : arc(22, Math.min(a.base, b2), Math.max(a.base, b2));
  const tag = (t: NonNullable<AngleSpec["tags"]>[number]) => { const p = t.at === "vertex" ? P(14, mid + 180) : t.at === "ray" ? P(80, a.base) : P(45, mid); return <text key={t.text} x={p[0] + (t.at === "ray" ? 0 : 0)} y={p[1] + (t.at === "ray" ? 14 : 4)} fontSize="14" fontWeight="800" textAnchor="middle" fill="#b42318">{t.text}</text>; };
  return <svg viewBox="-125 -125 250 250" className={className} role="img" aria-label={label ?? `Sudut ${a.deg} derajat`}>
    {tool && <Protractor base={a.base} side={a.side ?? "ccw"} />}
    {a.deg < 360 && (a.deg === 90 && !a.reflex ? <path d={`M${P(14, a.base)[0]} ${P(14, a.base)[1]}L${P(14 * Math.SQRT2, a.base + s * 45)[0]} ${P(14 * Math.SQRT2, a.base + s * 45)[1]}L${P(14, b2)[0]} ${P(14, b2)[1]}`} fill="none" stroke="#e5484d" strokeWidth="1.8" />
      : a.deg > 0 && <path d={arcPath} fill="none" stroke="#e5484d" strokeWidth="1.8" />)}
    <line x1="0" y1="0" x2={x1} y2={y1} stroke={blue} strokeWidth="2.6" strokeLinecap="round" />
    <line x1="0" y1="0" x2={x2} y2={y2} stroke={blue} strokeWidth="2.6" strokeLinecap="round" />
    <circle r="3.5" fill={blue} />
    {a.tags?.map(tag)}
  </svg>;
}

/** Jam analog; sudut terkecil antara jarum ditandai merah. */
export function Clock({ h, m = 0, className = "size-28", label }: { h: number; m?: number; className?: string; label?: string }) {
  const hd = 90 - (30 * (h % 12) + 0.5 * m), md = 90 - 6 * m, [hx, hy] = P(26, hd), [mx, my] = P(38, md);
  const lo = Math.min(hd, md), hi = Math.max(hd, md), small = hi - lo <= 180;
  return <svg viewBox="-56 -56 112 112" className={className} role="img" aria-label={label ?? `Jam pukul ${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`}>
    <circle r="52" fill="#dfeaf3" stroke="#7a9ab5" strokeWidth="3" /><circle r="47" fill="#ffffff" />
    {Array.from({ length: 60 }, (_, k) => { const [x0, y0] = P(46, 90 - 6 * k), [x1, y1] = P(k % 5 ? 44 : 41, 90 - 6 * k); return <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#334155" strokeWidth={k % 5 ? 0.5 : 1.2} />; })}
    {Array.from({ length: 12 }, (_, k) => { const [x, y] = P(34, 90 - 30 * (k + 1)); return <text key={k} x={x} y={y + 3.5} fontSize="9" fontWeight="700" textAnchor="middle" fill="#1e293b">{k + 1}</text>; })}
    {clockAngle(h, m) > 0 && clockAngle(h, m) < 180 && <path d={small ? arc(12, lo, hi) : arc(12, hi, lo + 360)} fill="none" stroke="#e5484d" strokeWidth="1.6" />}
    <line x1="0" y1="0" x2={hx} y2={hy} stroke="#111827" strokeWidth="3.4" strokeLinecap="round" />
    <line x1="0" y1="0" x2={mx} y2={my} stroke="#111827" strokeWidth="2" strokeLinecap="round" />
    <circle r="2.6" fill="#111827" />
  </svg>;
}

/** Bangun datar; titik sudut dapat diketuk (huruf A, B, C, …). */
export function ShapeFig({ pts, label, marks = [], onTap, disabled, className = "w-full max-w-60" }: { pts: Pt[]; label?: string; marks?: number[]; onTap?: (i: number) => void; disabled?: boolean; className?: string }) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), W = Math.max(...xs) - x0, H = Math.max(...ys) - y0, k = 100 / Math.max(W, H), pad = 22;
  const Q = pts.map(([x, y]): Pt => [(x - x0) * k, (y - y0) * k]), cx = Q.reduce((a, p) => a + p[0], 0) / Q.length, cy = Q.reduce((a, p) => a + p[1], 0) / Q.length;
  const ang = cornerAngles(pts);
  return <svg viewBox={`${-pad} ${-pad} ${W * k + 2 * pad} ${H * k + 2 * pad}`} className={className} role={onTap ? "group" : "img"} aria-label={label ? `Bangun ${label}` : "Bangun datar"}>
    <polygon points={Q.map(p => p.join(",")).join(" ")} fill="#e8f3fb" stroke={blue} strokeWidth="2.4" strokeLinejoin="round" />
    {marks.map(i => { const p = Q[i], a = Q[(i + Q.length - 1) % Q.length], b = Q[(i + 1) % Q.length], u = norm([a[0] - p[0], a[1] - p[1]]), v = norm([b[0] - p[0], b[1] - p[1]]), r = 10;
      return Math.abs(ang[i] - 90) < 0.5 ? <path key={`m${i}`} d={`M${p[0] + u[0] * r} ${p[1] + u[1] * r}l${v[0] * r} ${v[1] * r}l${-u[0] * r} ${-u[1] * r}`} fill="none" stroke="#e5484d" strokeWidth="2" />
        : <circle key={`m${i}`} cx={p[0]} cy={p[1]} r="7" fill="none" stroke="#f08a24" strokeWidth="2.4" />; })}
    {onTap && Q.map((p, i) => { const on = marks.includes(i), dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1, lx = p[0] + (dx / d) * 13, ly = p[1] + (dy / d) * 13;
      return <g key={i} role="button" tabIndex={disabled ? -1 : 0} aria-label={`Titik ${String.fromCharCode(65 + i)}`} aria-pressed={on} className="cursor-pointer outline-none" onClick={() => !disabled && onTap(i)} onKeyDown={e => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onTap(i); } }}>
        <circle cx={p[0]} cy={p[1]} r="12" fill={on ? "#fde68a" : "#ffffff"} fillOpacity={on ? 0.9 : 0.01} stroke={on ? "#d97706" : "#94a3b8"} strokeWidth="1.2" strokeDasharray={on ? undefined : "3 2"} />
        <text x={lx} y={ly + 4} fontSize="11" fontWeight="800" textAnchor="middle" fill={ink}>{String.fromCharCode(65 + i)}</text>
      </g>; })}
    {label && <text x={W * k / 2} y={H * k / 2 + 5} fontSize="16" fontWeight="800" textAnchor="middle" fill="#64748b">{label}</text>}
  </svg>;
}
const norm = (v: Pt): Pt => { const d = Math.hypot(v[0], v[1]) || 1; return [v[0] / d, v[1] / d]; };

/** Kipas lipat yang terbuka deg derajat. */
export function Fan({ deg, base, tool = false, className = "w-full max-w-48", label }: { deg: number; base: number; tool?: boolean; className?: string; label?: string }) {
  const n = Math.max(6, Math.round(deg / 10)), step = deg / n;
  return <svg viewBox="-125 -125 250 250" className={className} role="img" aria-label={label ?? `Kipas terbuka ${deg} derajat`}>
    {tool && <Protractor base={base} side="ccw" />}
    {Array.from({ length: n }, (_, k) => { const a = base + k * step, b = a + step, [p0, p1, p2, p3] = [P(34, a), P(100, a), P(100, b), P(34, b)];
      return <path key={k} d={`M${p0[0]} ${p0[1]}L${p1[0]} ${p1[1]}A100 100 0 0 0 ${p2[0]} ${p2[1]}L${p3[0]} ${p3[1]}A34 34 0 0 1 ${p0[0]} ${p0[1]}Z`} fill={k % 2 ? "#f08a24" : "#e66f0f"} stroke="#b45309" strokeWidth="0.6" fillOpacity={tool ? 0.85 : 1} />; })}
    {Array.from({ length: n + 1 }, (_, k) => { const [x, y] = P(34, base + k * step); return <line key={k} x1="0" y1="0" x2={x} y2={y} stroke="#8a4b12" strokeWidth="1.4" />; })}
    <circle r="4" fill="#8a4b12" />
  </svg>;
}

/** Persimpangan jalan dilihat dari atas. */
export function Roads({ roads, shown, className = "w-full max-w-80" }: { roads: Road[]; shown: [number, number][]; className?: string }) {
  const n = roads.length;
  return <svg viewBox="-125 -125 250 250" className={className} role="img" aria-label="Persimpangan jalan">
    {roads.map(r => { const [x, y] = P(122, r.dir); return <g key={r.name}><line x1="0" y1="0" x2={x} y2={y} stroke="#263238" strokeWidth="22" strokeLinecap="butt" /><line x1="0" y1="0" x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5 5" /></g>; })}
    <circle r="12" fill="#263238" />
    {roads.map(r => { const [x, y] = P(80, r.dir), rot = -r.dir + (r.dir > 90 && r.dir < 270 ? 180 : 0); return <text key={`t${r.name}`} x={x} y={y} transform={`rotate(${rot} ${x} ${y})`} dy="3" fontSize="8.5" fontWeight="700" textAnchor="middle" fill="#ffffff">{r.name}</text>; })}
    {roads.map((r, i) => { const nxt = roads[(i + 1) % n], d = (nxt.dir - r.dir + 360) % 360, [x, y] = P(d < 60 ? 92 : 46, r.dir + d / 2), known = shown.some(([a, b]) => a === i && b === (i + 1) % n);
      return <g key={`a${i}`}><path d={arc(22, r.dir, r.dir + d)} fill="none" stroke="#e5484d" strokeWidth="1.6" /><rect x={x - 15} y={y - 9} width="30" height="16" rx="4" fill="#ffffff" stroke="#e5484d" strokeWidth="0.8" /><text x={x} y={y + 3} fontSize="9.5" fontWeight="800" textAnchor="middle" fill="#b42318">{known ? `${d}°` : "?"}</text></g>; })}
  </svg>;
}

/** Pola keramik: celah di antara persegi dan segi lima (pola 1) dan di antara tiga segi lima (pola 2). */
function pentagon(o: Pt, d1: number, s: number): Pt[] {
  const out: Pt[] = [o]; let p = o;
  for (let k = 0; k < 4; k++) { const [dx, dy] = P(s, d1 + 72 * k); p = [p[0] + dx, p[1] + dy]; out.push(p); }
  return out;
}
export function Tiles({ className = "w-full max-w-md" }: { className?: string }) {
  const s = 34, sq: Pt[] = [[0, 0], [s, 0], [s, -s], [0, -s]];
  const pola1 = [pentagon([0, 0], 90, s), pentagon([0, 0], 252, s)], pola2 = [pentagon([0, 0], 0, s), pentagon([0, 0], 108, s), pentagon([0, 0], 216, s)];
  const poly = (pts: Pt[], fill: string, k: number) => <polygon key={k} points={pts.map(p => p.join(",")).join(" ")} fill={fill} stroke="#ffffff" strokeWidth="2" />;
  const gap = (a: number, b: number) => { const [x1, y1] = P(s, a), [x2, y2] = P(s, b), [tx, ty] = P(s * 0.55, (a + b) / 2);
    return <g><path d={`M0 0L${x1} ${y1}L${x2} ${y2}Z`} fill="#fde047" stroke="#a16207" strokeWidth="1.2" strokeDasharray="3 2" /><text x={tx} y={ty + 4} fontSize="12" fontWeight="800" textAnchor="middle" fill="#7c2d12">?</text></g>; };
  return <svg viewBox="-130 -95 260 190" className={className} role="img" aria-label="Pola keramik segi lima dan persegi dengan celah bertanda tanya">
    <g transform="translate(-65 -5)">{poly(sq, "#5bb3e6", 0)}{pola1.map((p, k) => poly(p, "#c84b44", k + 1))}{gap(198, 252)}</g>
    <g transform="translate(68 -5)">{pola2.map((p, k) => poly(p, "#c84b44", k))}{gap(324, 360)}</g>
    <text x="-65" y="88" fontSize="12" fontWeight="800" textAnchor="middle" fill={blue}>Pola 1</text>
    <text x="68" y="88" fontSize="12" fontWeight="800" textAnchor="middle" fill={blue}>Pola 2</text>
  </svg>;
}
