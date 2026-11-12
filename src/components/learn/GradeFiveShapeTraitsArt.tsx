import { interiorAngles, sideLengths, type Fig, type Pt } from "@/data/grade-five-shape-traits";

/* Gambar bangun datar: tanda sisi sama panjang dan sudut siku-siku dihitung dari koordinatnya. */
const blue = "#2563a6", red = "#e5484d";
const norm = (v: Pt): Pt => { const d = Math.hypot(v[0], v[1]) || 1; return [v[0] / d, v[1] / d]; };

export function ShapeFig({ fig, className = "w-full max-w-56", label }: { fig: Fig; className?: string; label?: string }) {
  if (fig.circle || !fig.pts) return <svg viewBox="-12 -12 124 124" className={className} role="img" aria-label={label ?? "Lingkaran"}><circle cx="50" cy="50" r="46" fill="#e8f3fb" stroke={blue} strokeWidth="3" /></svg>;
  const xs = fig.pts.map(p => p[0]), ys = fig.pts.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), W = Math.max(...xs) - x0, H = Math.max(...ys) - y0, k = 100 / Math.max(W, H), pad = fig.angleLabels ? 26 : 14;
  const Q = fig.pts.map(([x, y]): Pt => [(x - x0) * k, (y - y0) * k]), n = Q.length;
  const lens = sideLengths(fig.pts), ang = interiorAngles(fig.pts);
  // Kelompok sisi sama panjang: 1, 2, 3 garis kecil.
  const groups: number[] = []; const tickOf = lens.map(l => { const g = groups.findIndex(x => Math.abs(x - l) < 1e-3 * Math.max(1, l)); if (g >= 0) return g; groups.push(l); return groups.length - 1; });
  const count = (g: number) => tickOf.filter(t => t === g).length;
  const order = [...new Set(tickOf.filter(g => count(g) > 1))];
  const cx = Q.reduce((a, p) => a + p[0], 0) / n, cy = Q.reduce((a, p) => a + p[1], 0) / n;
  return <svg viewBox={`${-pad} ${-pad} ${W * k + 2 * pad} ${H * k + 2 * pad}`} className={className} role="img" aria-label={label ?? `Bangun dengan ${n} sisi`}>
    <polygon points={Q.map(p => p.join(",")).join(" ")} fill="#e8f3fb" stroke={blue} strokeWidth="2.6" strokeLinejoin="round" />
    {!fig.plain && n <= 4 && Q.map((p, i) => {
      const q = Q[(i + 1) % n], g = tickOf[i], m = order.indexOf(g) + 1; if (m <= 0) return null;
      const d = norm([q[0] - p[0], q[1] - p[1]]), nx = -d[1], ny = d[0], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      return <g key={`t${i}`}>{Array.from({ length: m }, (_, j) => { const o = (j - (m - 1) / 2) * 4, x = mx + d[0] * o, y = my + d[1] * o; return <line key={j} x1={x - nx * 5} y1={y - ny * 5} x2={x + nx * 5} y2={y + ny * 5} stroke={red} strokeWidth="1.8" />; })}</g>;
    })}
    {!fig.plain && Q.map((p, i) => {
      if (Math.abs(ang[i] - 90) > 0.5) return null;
      const u = norm([Q[(i + n - 1) % n][0] - p[0], Q[(i + n - 1) % n][1] - p[1]]), v = norm([Q[(i + 1) % n][0] - p[0], Q[(i + 1) % n][1] - p[1]]), r = 9;
      return <path key={`r${i}`} d={`M${p[0] + u[0] * r} ${p[1] + u[1] * r}l${v[0] * r} ${v[1] * r}l${-u[0] * r} ${-u[1] * r}`} fill="none" stroke={red} strokeWidth="1.6" />;
    })}
    {fig.angleLabels?.map((t, i) => { if (!t) return null; const p = Q[i], d = norm([cx - p[0], cy - p[1]]), x = p[0] + d[0] * 20, y = p[1] + d[1] * 20 + 4;
      return <text key={`a${i}`} x={x} y={y} fontSize="11" fontWeight="800" textAnchor="middle" fill={t === "?" ? "#b42318" : "#1f3b30"}>{t}</text>; })}
  </svg>;
}

/** Sedotan berwarna yang belum atau sudah dirangkai. */
export function Straw({ length, color, scale = 12 }: { length: number; color: string; scale?: number }) {
  return <svg viewBox={`0 0 ${length * scale + 4} 12`} style={{ width: `${(length * scale + 4) / 16}rem` }} className="h-3 max-w-full" aria-hidden="true">
    <rect x="2" y="2" width={length * scale} height="8" rx="4" fill={color} stroke="#00000040" strokeWidth="0.8" />
    {Array.from({ length: Math.floor(length) }, (_, i) => <line key={i} x1={2 + (i + 1) * scale} y1="2" x2={2 + (i + 1) * scale} y2="10" stroke="#ffffff70" strokeWidth="0.8" />)}
  </svg>;
}
