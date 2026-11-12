import { greek, transValue, type Fig, type Pt } from "@/data/grade-seven-similarity";

/* ---------- Bangun datar dengan label titik, sisi, dan sudut ---------- */
const norm = (v: Pt): Pt => { const d = Math.hypot(v[0], v[1]) || 1; return [v[0] / d, v[1] / d]; };
export function FigView({ fig, className = "w-full max-w-64", label, stroke = "#2563a6", fill = "#e8f3fb", highlight }: { fig: Fig; className?: string; label?: string; stroke?: string; fill?: string; highlight?: { vertex?: number; side?: number } }) {
  const all = [...fig.pts, ...(fig.extra ?? []).flatMap(e => e.pts)];
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), W = Math.max(...xs) - x0 || 1, H = Math.max(...ys) - y0 || 1, k = 120 / Math.max(W, H), pad = 22;
  const T = (p: Pt): Pt => [(p[0] - x0) * k, (p[1] - y0) * k];
  const Q = fig.pts.map(T), n = Q.length, cx = Q.reduce((a, p) => a + p[0], 0) / n, cy = Q.reduce((a, p) => a + p[1], 0) / n;
  const out = (p: Pt, d: number): Pt => { const u = norm([p[0] - cx, p[1] - cy]); return [p[0] + u[0] * d, p[1] + u[1] * d]; };
  return <svg viewBox={`${-pad} ${-pad} ${W * k + 2 * pad} ${H * k + 2 * pad}`} className={className} role="img" aria-label={label ?? `Bangun ${(fig.labels ?? []).join("")}`}>
    <polygon points={Q.map(p => p.join(",")).join(" ")} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    {highlight?.side !== undefined && (() => { const a = Q[highlight.side], b = Q[(highlight.side + 1) % n]; return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#e8590c" strokeWidth="4" strokeLinecap="round" />; })()}
    {(fig.extra ?? []).map((e, j) => { const P = e.pts.map(T); return <g key={j}><polyline points={P.map(p => p.join(",")).join(" ")} fill="none" stroke="#7048e8" strokeWidth="1.8" />
      {P.map((p, i) => e.labels?.[i] ? <g key={i}><circle cx={p[0]} cy={p[1]} r="2.6" fill="#7048e8" /><text x={p[0] + 6} y={p[1] - 4} fontSize="11" fontWeight="800" fill="#7048e8">{e.labels[i]}</text></g> : null)}</g>; })}
    {fig.right?.map(i => { const p = Q[i], u = norm([Q[(i + n - 1) % n][0] - p[0], Q[(i + n - 1) % n][1] - p[1]]), v = norm([Q[(i + 1) % n][0] - p[0], Q[(i + 1) % n][1] - p[1]]), r = 9;
      return <path key={`r${i}`} d={`M${p[0] + u[0] * r} ${p[1] + u[1] * r}l${v[0] * r} ${v[1] * r}l${-u[0] * r} ${-u[1] * r}`} fill="none" stroke="#e5484d" strokeWidth="1.5" />; })}
    {Q.map((p, i) => { const L = out(p, 13); return <g key={`v${i}`}>
      {highlight?.vertex === i && <circle cx={p[0]} cy={p[1]} r="7" fill="#e8590c" fillOpacity=".35" />}
      <circle cx={p[0]} cy={p[1]} r="2.6" fill={stroke} />
      {fig.labels?.[i] && <text x={L[0]} y={L[1] + 4} fontSize="12" fontWeight="800" textAnchor="middle" fill="#1f3b30">{fig.labels[i]}</text>}
      {fig.angles?.[i] && (() => { const d = norm([cx - p[0], cy - p[1]]); return <text x={p[0] + d[0] * 20} y={p[1] + d[1] * 20 + 4} fontSize="10.5" fontWeight="800" textAnchor="middle" fill={fig.angles[i] === "?" ? "#b42318" : "#1f3b30"}>{fig.angles[i]}</text>; })()}
    </g>; })}
    {fig.sides?.map((s, i) => { if (!s) return null; const a = Q[i], b = Q[(i + 1) % n], m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = out(m, 11);
      return <text key={`s${i}`} x={L[0]} y={L[1] + 4} fontSize="11" fontWeight="700" textAnchor="middle" fill={s === "?" ? "#b42318" : "#1c64b5"}>{s}</text>; })}
  </svg>;
}

/* ---------- Dua garis sejajar dipotong garis lain ---------- */
export function Transversal({ t, labels, values = false, colors = {}, onPick, picked = [], label }: { t: number; labels?: (string | null)[]; values?: boolean; colors?: Record<number, string>; onPick?: (k: number) => void; picked?: number[]; label?: string }) {
  const W = 320, H = 200, y1 = 58, y2 = 142, r = (t * Math.PI) / 180, dx = (y2 - y1) / Math.tan(r), x1 = 150 + dx / 2, x2 = 150 - dx / 2;
  const ext = 70, dir = norm([x1 - x2, y1 - y2]);
  const centers: Pt[] = [[x1, y1], [x2, y2]];
  // Arah tengah setiap sudut: kiri atas, kanan atas, kanan bawah, kiri bawah.
  const bis = (k: number): Pt => { const up = norm([dir[0], dir[1]]), right: Pt = [1, 0];
    const a = [norm([up[0] - right[0], up[1] - right[1]]), norm([up[0] + right[0], up[1] + right[1]]), norm([-up[0] + right[0], -up[1] + right[1]]), norm([-up[0] - right[0], -up[1] - right[1]])];
    return a[k % 4]; };
  return <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md" role={onPick ? "group" : "img"} aria-label={label ?? "Dua garis sejajar dipotong garis lain, delapan sudut"}>
    {[y1, y2].map(y => <g key={y}><line x1="8" x2={W - 8} y1={y} y2={y} stroke="#33413b" strokeWidth="2" /><path d={`M${W - 40} ${y - 4} l6 4 l-6 4 M${W - 46} ${y - 4} l6 4 l-6 4`} fill="none" stroke="#33413b" strokeWidth="1.2" /></g>)}
    <line x1={x2 - dir[0] * ext} y1={y2 - dir[1] * ext} x2={x1 + dir[0] * ext} y2={y1 + dir[1] * ext} stroke="#1c64b5" strokeWidth="2" />
    {Array.from({ length: 8 }, (_, k) => { const c = centers[k < 4 ? 0 : 1], b = bis(k), long = (labels?.[k] ?? "").length > 3, rr = long ? 38 : 26, p: Pt = [c[0] + b[0] * rr, c[1] + b[1] * rr * 0.8], col = colors[k], on = picked.includes(k);
      const text = labels ? labels[k] : values ? `${transValue(t, k)}°` : greek[k];
      return <g key={k}>
        {(col || on) && <circle cx={p[0]} cy={p[1]} r="13" fill={on ? "#2b8a3e" : col} fillOpacity={on ? 0.85 : 0.3} />}
        {text && <text x={p[0]} y={p[1] + 4} fontSize={long ? 10.5 : 12} fontWeight="800" textAnchor="middle" fill={on ? "#ffffff" : "#1f3b30"} pointerEvents="none">{text}</text>}
        {onPick && <circle cx={p[0]} cy={p[1]} r="15" fill="transparent" className="cursor-pointer" role="button" tabIndex={0} aria-pressed={on} aria-label={`Sudut ${greek[k]}`}
          onClick={() => onPick(k)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(k); } }} />}
      </g>; })}
  </svg>;
}

/* ---------- Fraktal segitiga ---------- */
function sier(n: number, p: Pt[], acc: Pt[][]) { if (!n) { acc.push(p); return; } const m = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; const [a, b, c] = p;
  sier(n - 1, [a, m(a, b), m(a, c)], acc); sier(n - 1, [m(a, b), b, m(b, c)], acc); sier(n - 1, [m(a, c), m(b, c), c], acc); }
export function Fractal({ n, size = 80 }: { n: number; size?: number }) {
  const acc: Pt[][] = []; sier(n, [[0, size * 0.87], [size, size * 0.87], [size / 2, 0]], acc);
  return <svg viewBox={`-2 -2 ${size + 4} ${size * 0.87 + 4}`} width={size} height={size * 0.87} role="img" aria-label={`Fraktal n = ${n}, ${acc.length} segitiga`}>
    {acc.map((t, k) => <polygon key={k} points={t.map(p => p.join(",")).join(" ")} fill="#2b8a3e" stroke="#ffffff" strokeWidth=".4" />)}
  </svg>;
}

/* ---------- Rumah sederhana (untuk perbesaran) ---------- */
export function House({ k = 1, unit = 14 }: { k?: number; unit?: number }) {
  const s = unit * k, W = 6 * s, H = 5 * s;
  return <svg width={W + 4} height={H + 4} viewBox={`-2 -2 ${W + 4} ${H + 4}`} role="img" aria-label={`Rumah ${6 * k} × ${5 * k} satuan`}>
    <path d={`M0 ${2 * s} L${1.5 * s} 0 L${6 * s} 0 L${6 * s} ${2 * s} Z`} fill="#f2c48d" stroke="#7a4a1e" strokeWidth="1.5" />
    <line x1={1.5 * s} y1="0" x2={3 * s} y2={2 * s} stroke="#7a4a1e" strokeWidth="1.5" />
    <rect x="0" y={2 * s} width={3 * s} height={3 * s} fill="#fff3df" stroke="#7a4a1e" strokeWidth="1.5" />
    <rect x={3 * s} y={2 * s} width={3 * s} height={3 * s} fill="#fff3df" stroke="#7a4a1e" strokeWidth="1.5" />
    <rect x={1 * s} y={3.4 * s} width={s} height={1.6 * s} fill="#b07a45" />
  </svg>;
}
