import { objectArtNodes } from "@/components/illustrations/ObjectArt";
import { bases, pieces, type Base, type Line, type Obj } from "@/data/grade-two-fractions";

export const ink = "#1f3b30";
export const shadeFill = "#e0567a";
const pts = (p: [number, number][]) => p.map(q => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(" ");

/** Bangun yang sudah dibagi; bagian dapat diketuk bila onTap diberikan. */
export function FracFig({ base, lines, shaded, onTap, className = "size-28", fill = "#ffffff", shade = shadeFill, label }: { base: Base; lines: Line[]; shaded: number[]; onTap?: (i: number) => void; className?: string; fill?: string; shade?: string; label?: string }) {
  const ps = pieces(base, lines);
  return <svg viewBox="-3 -3 106 106" className={className} {...(onTap ? { role: "group", "aria-label": label ?? "Bangun" } : { role: "img", "aria-label": label ?? `Bangun dibagi ${ps.length} bagian, ${shaded.length} diwarnai` })}>
    {ps.map((p, i) => onTap
      ? <polygon key={i} role="button" tabIndex={0} aria-label={`Bagian ${i + 1}`} aria-pressed={shaded.includes(i)} points={pts(p)} fill={shaded.includes(i) ? shade : fill} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" className="cursor-pointer outline-none focus-visible:stroke-[#0b5d44] focus-visible:[stroke-width:3]"
        onClick={() => onTap(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(i); } }} />
      : <polygon key={i} points={pts(p)} fill={shaded.includes(i) ? shade : fill} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />)}
  </svg>;
}

/** Garis lipat yang dapat dipilih (pita tipis sebagai area ketuk). */
export function FoldBoard({ base, guides, chosen, shaded, onGuide, onPiece, mode, className = "w-full max-w-64", fill = "#ffffff", disabled = false }: { base: Base; guides: Line[]; chosen: number[]; shaded: number[]; onGuide: (g: number) => void; onPiece: (i: number) => void; mode: "garis" | "warnai"; className?: string; fill?: string; disabled?: boolean }) {
  const paint = mode === "warnai" && !disabled, draw = mode === "garis" && !disabled;
  const ps = pieces(base, chosen.map(g => guides[g]));
  const clip = `clip-${base}`;
  const band = (l: Line, w = 2.5) => { const dx = l[2] - l[0], dy = l[3] - l[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, nx = -uy * w, ny = ux * w; const a = [l[0] - ux * 200, l[1] - uy * 200], b = [l[2] + ux * 200, l[3] + uy * 200]; return pts([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]); };
  const seg = (l: Line) => { const dx = l[2] - l[0], dy = l[3] - l[1], len = Math.hypot(dx, dy); return [l[0] - (dx / len) * 200, l[1] - (dy / len) * 200, l[2] + (dx / len) * 200, l[3] + (dy / len) * 200]; };
  return <svg viewBox="-3 -3 106 106" className={className}>
    <defs><clipPath id={clip}><polygon points={pts(bases[base])} /></clipPath></defs>
    {ps.map((p, i) => paint ? <polygon key={i} role="button" tabIndex={0} aria-label={`Bagian ${i + 1}`} aria-pressed={shaded.includes(i)} points={pts(p)} fill={shaded.includes(i) ? shadeFill : fill} stroke={ink} strokeWidth="1.4" strokeLinejoin="round"
      className="cursor-pointer outline-none" onClick={() => onPiece(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPiece(i); } }} />
      : <polygon key={i} points={pts(p)} fill={shaded.includes(i) ? shadeFill : fill} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />)}
    <g clipPath={`url(#${clip})`}>
      {guides.map((l, g) => { const [x1, y1, x2, y2] = seg(l), on = chosen.includes(g); if (!draw && !on) return null; return <g key={g} aria-hidden="true" pointerEvents={draw ? undefined : "none"} className={draw ? "cursor-pointer" : ""} onClick={() => draw && onGuide(g)}>
        {draw && <polygon points={band(l, 4)} fill="transparent" />}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? "#c2410c" : "#94a3b8"} strokeWidth={on ? 2.2 : 1.2} strokeDasharray={on ? undefined : "3 3"} />
      </g>; })}
    </g>
    {draw && guides.map((l, g) => { const [hx, hy] = handle(base, l); const on = chosen.includes(g); return <g key={`h${g}`} role="button" tabIndex={0} aria-label={`Garis ${g + 1}`} aria-pressed={on} className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[#0b5d44]"
      onClick={() => onGuide(g)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onGuide(g); } }}>
      <circle cx={hx} cy={hy} r="4.2" fill={on ? "#c2410c" : "#fff"} stroke={on ? "#c2410c" : "#64748b"} strokeWidth="1.4" />
    </g>; })}
  </svg>;
}

/** Titik pegangan garis: dekat ujung garis di dalam bangun. */
function handle(base: Base, l: Line): [number, number] {
  const poly = bases[base], dx = l[2] - l[0], dy = l[3] - l[1];
  const ts: number[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length], ex = q[0] - p[0], ey = q[1] - p[1], den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) return;
    const t = ((p[0] - l[0]) * ey - (p[1] - l[1]) * ex) / den, u = ((p[0] - l[0]) * dy - (p[1] - l[1]) * dx) / den;
    if (u >= -1e-9 && u <= 1 + 1e-9) ts.push(t);
  });
  const t0 = Math.min(...ts), t1 = Math.max(...ts), t = t0 + (t1 - t0) * 0.12;
  return [l[0] + dx * t, l[1] + dy * t];
}

export function ObjIcon({ obj, className = "size-7" }: { obj: Obj; className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">{objectArtNodes[obj]}</svg>;
}
export function GroupsFig({ obj, a, b, obj2, size = "size-6" }: { obj: Obj; a: number; b: number; obj2?: Obj; size?: string }) {
  return <div className="flex flex-wrap items-stretch gap-2" role="img" aria-label={`Kelompok ${a} dan ${b}`}>
    {[[obj, a], [obj2 ?? obj, b]].map(([o, n], k) => <div key={k} className="flex max-w-40 flex-wrap content-center gap-0.5 rounded-lg border-2 border-dashed border-info/50 bg-white p-1">{Array.from({ length: n as number }, (_, i) => <ObjIcon key={i} obj={o as Obj} className={size} />)}</div>)}
  </div>;
}
export function SetFig({ obj, n }: { obj: Obj; n: number }) {
  return <div className="flex max-w-sm flex-wrap justify-center gap-1" role="img" aria-label={`${n} benda`}>{Array.from({ length: n }, (_, i) => <ObjIcon key={i} obj={obj} className="size-8" />)}</div>;
}
