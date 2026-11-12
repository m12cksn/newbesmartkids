import type { Pt, ShapeSpec } from "@/data/grade-five-perimeter";

/* Gambar bangun datar: label sisi di luar bangun, tanda sisi sama panjang, dan sisi yang dapat diukur. */
const blue = "#2563a6";

function bounds(pts: Pt[]) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
const area2 = (pts: Pt[]) => pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0);

export function ShapeFig({ s, measured, onMeasure, className = "w-full max-w-72", label, disabled, fontScale = 1 }: { s: ShapeSpec; measured?: number[]; onMeasure?: (i: number) => void; className?: string; label?: string; disabled?: boolean; fontScale?: number }) {
  const b = bounds(s.pts), W = b.x1 - b.x0 || 1, H = b.y1 - b.y0 || 1, size = Math.max(W, H), pad = size * 0.28;
  const fs = size * 0.075 * fontScale, px = pad + fs * 2.2, vb = `${b.x0 - px} ${b.y0 - pad} ${W + 2 * px} ${H + 2 * pad}`, out = area2(s.pts) > 0 ? 1 : -1;
  const n = s.pts.length;
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const labelPos = s.pts.map((p, i) => {
    const q = s.pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
    const nx = (out * dy) / len, ny = (-out * dx) / len, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    const mode = s.show[i], text = mode === "show" || measured?.includes(i) ? `${s.lens[i]} ${s.unit}` : mode === "?" ? "?" : mode === "hide" ? `… ${s.unit}` : "";
    const anchor: "start" | "end" | "middle" = nx > 0.5 ? "start" : nx < -0.5 ? "end" : "middle", w = text.length * fs * 0.58, h = fs;
    let d = fs * 0.6, x = 0, y = 0;
    for (let t = 0; t < 6; t++) {
      x = mx + nx * d; y = my + ny * d + (Math.abs(ny) > 0.5 ? (ny > 0 ? fs * 0.75 : 0) : fs * 0.35);
      const bx = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2, box = { x: bx, y: y - h, w, h };
      if (!text || !placed.some(o => box.x < o.x + o.w && o.x < box.x + box.w && box.y < o.y + o.h && o.y < box.y + box.h)) { if (text) placed.push(box); break; }
      d += fs * 0.9;
    }
    return { x, y, anchor, text };
  });
  return <svg viewBox={vb} className={className} role="img" aria-label={label ?? `Bangun dengan ${n} sisi`}>
    {s.frame && <rect x={b.x0 - size * 0.03} y={b.y0 - size * 0.03} width={W + size * 0.06} height={H + size * 0.06} fill="none" stroke="#e5484d" strokeWidth="1.6" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
    <polygon points={s.pts.map(p => p.join(",")).join(" ")} fill="#e8f3fb" stroke={blue} strokeWidth="2.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    {s.inner?.map((l, i) => <g key={i}><line x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke="#e5484d" strokeWidth="1.4" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
      {l.label && <text x={(l.a[0] + l.b[0]) / 2} y={(l.a[1] + l.b[1]) / 2 - fs * 0.4} fontSize={fs * 0.9} textAnchor="middle" fill="#b42318">{l.label}</text>}</g>)}
    {s.pts.map((p, i) => {
      const q = s.pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
      const nx = (out * dy) / len, ny = (-out * dx) / len, mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      const ticks = s.ticks?.[i] ?? 0, tl = size * 0.04, hw = size * 0.06;
      const mode = s.show[i], isMeasured = measured?.includes(i), lp = labelPos[i], text = lp.text;
      return <g key={i}>
        {Array.from({ length: ticks }, (_, k) => { const off = (k - (ticks - 1) / 2) * size * 0.025, cx = mx + (dx / len) * off, cy = my + (dy / len) * off;
          return <line key={k} x1={cx - nx * tl} y1={cy - ny * tl} x2={cx + nx * tl} y2={cy + ny * tl} stroke={blue} strokeWidth="2" vectorEffect="non-scaling-stroke" />; })}
        {isMeasured && <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#f08a24" strokeWidth="4" vectorEffect="non-scaling-stroke" />}
        {text && <text x={lp.x} y={lp.y} fontSize={fs} fontWeight="700" textAnchor={lp.anchor} fill={mode === "?" ? "#b42318" : "#1f3b30"}>{text}</text>}
        {onMeasure && mode === "hide" && <polygon points={[[p[0] + nx * hw, p[1] + ny * hw], [q[0] + nx * hw, q[1] + ny * hw], [q[0] - nx * hw, q[1] - ny * hw], [p[0] - nx * hw, p[1] - ny * hw]].map(c => c.join(",")).join(" ")} fill="transparent" role="button" tabIndex={disabled ? -1 : 0} aria-label={`Ukur sisi ${i + 1}`} aria-pressed={isMeasured}
          className="cursor-pointer outline-none" onClick={() => !disabled && onMeasure(i)} onKeyDown={e => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onMeasure(i); } }} />}
      </g>;
    })}
  </svg>;
}

/** Lapangan sepak bola dengan ukuran dan titik start; pos = posisi pelari di sepanjang tepi (0..1). */
export function Field({ w, h, unit, runner, className = "w-full max-w-md" }: { w: number; h: number; unit: string; runner?: number; className?: string }) {
  const W = 200, H = Math.max(60, Math.min(140, (h / w) * 200)), per = 2 * (W + H);
  const at = (t: number): Pt => { let d = t * per; if (d <= W) return [d, H]; d -= W; if (d <= H) return [W, H - d]; d -= H; if (d <= W) return [W - d, 0]; d -= W; return [0, Math.min(d, H)]; };
  const r = runner !== undefined ? at(runner) : null;
  return <svg viewBox={`-30 -22 ${W + 60} ${H + 46}`} className={className} role="img" aria-label={`Lapangan ${w} ${unit} kali ${h} ${unit}`}>
    <rect x="0" y="0" width={W} height={H} fill="#5fae4f" stroke="#fff" strokeWidth="2" />
    <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#fff" strokeWidth="1.2" /><circle cx={W / 2} cy={H / 2} r={H * 0.18} fill="none" stroke="#fff" strokeWidth="1.2" />
    <rect x="0" y={H * 0.25} width={W * 0.14} height={H * 0.5} fill="none" stroke="#fff" strokeWidth="1.2" /><rect x={W * 0.86} y={H * 0.25} width={W * 0.14} height={H * 0.5} fill="none" stroke="#fff" strokeWidth="1.2" />
    <text x={W / 2} y={H + 16} fontSize="11" textAnchor="middle" fontWeight="700" fill="#1f3b30">{w} {unit}</text>
    <text x={W + 6} y={H / 2 + 4} fontSize="11" fontWeight="700" fill="#1f3b30">{h} {unit}</text>
    <rect x="-2" y={H - 12} width="34" height="12" fill="#f08a24" /><text x="15" y={H - 3} fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700">Start</text>
    {r && <g><circle cx={r[0]} cy={r[1]} r="7" fill="#e5484d" stroke="#fff" strokeWidth="2" /><path d={`M${r[0] - 2} ${r[1] - 3}l5 3-5 3z`} fill="#fff" /></g>}
  </svg>;
}
