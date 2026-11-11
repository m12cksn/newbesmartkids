import type { ReactNode } from "react";
import { P, type CurveName, type Fig, type ObjName, type SolidName } from "@/data/grade-two-shapes";

export const ink = "#1f3b30";
export const palette = ["#3b82c4", "#e0567a", "#2f9e6a", "#e8963a", "#8d63c7", "#d4a514", "#4f9fb0", "#c2584a"];
export const fillOf = (c?: number) => (c === undefined ? palette[0] : c === 6 ? "#9fd3bd" : palette[c % palette.length]);
const o = { stroke: ink, strokeWidth: 1.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/* ---------- Bentuk lengkung ---------- */
export const curvePath: Record<CurveName, string> = {
  circle: "M50 10a40 40 0 1 1 0 80a40 40 0 1 1 0-80z",
  circleSmall: "M50 26a24 24 0 1 1 0 48a24 24 0 1 1 0-48z",
  oval: "M50 24c24 0 44 12 44 26s-20 26-44 26S6 64 6 50s20-26 44-26z",
  ovalTall: "M50 8c13 0 24 19 24 42s-11 42-24 42-24-19-24-42S37 8 50 8z",
  semi: "M10 66a40 40 0 0 1 80 0z",
  heart: "M50 88C20 66 8 50 8 34c0-12 9-22 21-22 9 0 16 5 21 13 5-8 12-13 21-13 12 0 21 10 21 22 0 16-12 32-42 54z",
  drop: "M50 8c10 18 32 38 32 56a32 32 0 0 1-64 0c0-18 22-38 32-56z",
  egg: "M50 8c18 0 32 26 32 48 0 20-14 36-32 36S18 76 18 56C18 34 32 8 50 8z",
  quarter3: "M50 50V10a40 40 0 1 1-40 40z",
};

const pt = (a: number, r = 40): [number, number] => [50 + r * Math.sin((a * Math.PI) / 180), 50 - r * Math.cos((a * Math.PI) / 180)];
export function sectorPath(deg: number, rot: number) {
  if (deg >= 360) return curvePath.circle;
  const [x1, y1] = pt(rot), [x2, y2] = pt(rot + deg);
  return `M50 50L${x1.toFixed(2)} ${y1.toFixed(2)}A40 40 0 ${deg > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`;
}

/* ---------- Bangun ruang (skema) ---------- */
export function SolidArt({ s, className = "size-24", label }: { s: SolidName; className?: string; label?: string }) {
  const art: Record<SolidName, ReactNode> = {
    kubus: <><path d="M20 38h40v40H20z" fill="#f6d36b" {...o} /><path d="M20 38l18-16h40L60 38z" fill="#fbe7a6" {...o} /><path d="M60 38l18-16v40L60 78z" fill="#e2b93f" {...o} /><path d="M20 78l18-16h40M38 62V22" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" /></>,
    balok: <><path d="M8 48h56v28H8z" fill="#f3a0b8" {...o} /><path d="M8 48l26-18h56L64 48z" fill="#f8c7d5" {...o} /><path d="M64 48l26-18v28L64 76z" fill="#de7a98" {...o} /><path d="M8 76l26-18h56M34 58V30" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" /></>,
    tabung: <><path d="M24 22v56c0 7 12 12 26 12s26-5 26-12V22" fill="#c4a6e6" {...o} /><ellipse cx="50" cy="22" rx="26" ry="10" fill="#dccaf1" {...o} /><path d="M24 78c0-7 12-12 26-12s26 5 26 12" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" /></>,
    kerucut: <><path d="M50 10L22 78c0 7 12 12 28 12s28-5 28-12z" fill="#8cc8ea" {...o} /><path d="M22 78c0-7 12-12 28-12s28 5 28 12" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" /></>,
    bola: <><circle cx="50" cy="50" r="38" fill="#9edb9a" {...o} /><path d="M12 50c0 10 17 16 38 16s38-6 38-16" fill="none" stroke={ink} strokeWidth="1.4" /><path d="M12 50c0-10 17-16 38-16s38 6 38 16" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" /><circle cx="36" cy="34" r="6" fill="#fff" opacity=".5" /></>,
  };
  return <svg viewBox="0 0 100 100" className={className} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>{art[s]}</svg>;
}

/* ---------- Benda nyata ---------- */
const iso = (x: number, y: number, w: number, d: number, h: number, top: string, left: string, right: string, extra?: ReactNode) => {
  // Kotak isometrik: (x,y) titik depan bawah, lebar w ke kanan, kedalaman d ke belakang, tinggi h.
  const c = 0.5, s = 0.87;
  const A: [number, number] = [x, y], B: [number, number] = [x + w * s, y - w * c], D: [number, number] = [x - d * s, y - d * c];
  const p = (q: [number, number], dz = 0) => `${q[0].toFixed(1)} ${(q[1] - dz).toFixed(1)}`;
  const Bp: [number, number] = [B[0] - d * s, B[1] - d * c];
  return <>
    <path d={`M${p(A)}L${p(B)}L${p(B, h)}L${p(A, h)}Z`} fill={right} {...o} />
    <path d={`M${p(A)}L${p(D)}L${p(D, h)}L${p(A, h)}Z`} fill={left} {...o} />
    <path d={`M${p(A, h)}L${p(B, h)}L${p(Bp, h)}L${p(D, h)}Z`} fill={top} {...o} />
    {extra}
  </>;
};
const objArt: Record<ObjName, ReactNode> = {
  dadu: <>{iso(50, 90, 40, 40, 40, "#ffffff", "#eef1f4", "#dfe4ea")}{[[50, 48], [40, 44], [60, 52]].map(([x, y]) => <ellipse key={`t${x}`} cx={x} cy={y - 20} rx="3.2" ry="2" fill="#d23f4a" />)}{[[30, 64], [42, 70], [30, 78], [42, 84]].map(([x, y]) => <ellipse key={`l${x}${y}`} cx={x - 6} cy={y - 8} rx="2" ry="3" fill={ink} />)}<ellipse cx="68" cy="66" rx="2" ry="3" fill={ink} /></>,
  rubik: <>{iso(50, 90, 40, 40, 40, "#f5c542", "#e5484d", "#2f86d6")}<path d="M38.4 83.3V43.3M26.8 76.6V36.6M15.2 70L15.2 30M50 76.7l-34.8-20M50 63.3l-34.8-20M61.6 83.3V43.3M73.2 76.6V36.6M50 76.7l34.8-20M50 63.3l34.8-20M38.4 43.3l34.8-20M26.8 36.6l34.8-20M61.6 43.3l-34.8-20M73.2 36.6l-34.8-20" stroke={ink} strokeWidth="1.4" fill="none" /></>,
  kardus: <>{iso(46, 88, 50, 34, 36, "#dcae74", "#c8955a", "#b9844a")}<path d="M28 58.5L71.5 33.5" stroke="#e9d3a8" strokeWidth="5" /><path d="M46 52l-4 18M54 48l4 18" stroke="#8a5a2b" strokeWidth="1" opacity=".4" /></>,
  kotakSusu: <>{iso(52, 92, 26, 18, 66, "#f5f7fa", "#e8eef5", "#2f86d6")}<path d="M56 60l14-7v14l-14 7z" fill="#fff" {...o} /><path d="M44 18l6-14" stroke="#e5484d" strokeWidth="3" strokeLinecap="round" /></>,
  kotakTisu: <>{iso(48, 88, 46, 30, 28, "#7cc6a8", "#5fb08f", "#4c9b7c")}<path d="M42 44c-2-12 6-18 12-16 4-8 14-6 14 2 6 0 8 8 2 12" fill="#fff" {...o} /></>,
  kaleng: <><path d="M26 20v60c0 6 11 10 24 10s24-4 24-10V20" fill="#e5e9ee" {...o} /><path d="M26 34c0 6 11 10 24 10s24-4 24-10v30c0 6-11 10-24 10S26 70 26 64z" fill="#2f86d6" {...o} /><ellipse cx="50" cy="20" rx="24" ry="9" fill="#cfd6de" {...o} /><ellipse cx="50" cy="20" rx="18" ry="6" fill="none" stroke={ink} strokeWidth="1" /><text x="50" y="58" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">SUSU</text></>,
  drum: <><path d="M18 30v42c0 7 14 12 32 12s32-5 32-12V30" fill="#e5484d" {...o} /><path d="M18 34l10 46M38 38l-10 44M38 38l14 46M62 38l-10 46M62 38l12 44M82 34l-8 46" stroke="#fff" strokeWidth="1.4" fill="none" /><ellipse cx="50" cy="30" rx="32" ry="11" fill="#f8f0e2" {...o} /><path d="M70 6l-12 22M84 10L64 30" stroke="#b7793f" strokeWidth="3" strokeLinecap="round" /></>,
  topi: <><path d="M50 10L24 80c0 6 12 10 26 10s26-4 26-10z" fill="#8d63c7" {...o} />{[[44, 34], [56, 46], [40, 60], [58, 70], [48, 80]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill="#f5c542" />)}<circle cx="50" cy="9" r="6" fill="#f08bb0" {...o} /></>,
  conEs: <><path d="M22 18c0-5 12-8 28-8s28 3 28 8L50 92z" fill="#e3b26a" {...o} /><ellipse cx="50" cy="18" rx="28" ry="8" fill="#f2d39b" {...o} /><path d="M30 30l26 32M40 26l22 28M60 26L42 52M70 28L46 60M26 26l8 10M66 38l-8 10" stroke="#b7793f" strokeWidth="1.2" fill="none" /></>,
  bola: <><circle cx="50" cy="50" r="38" fill="#fff" {...o} /><path d="M50 36l13 9-5 15H42l-5-15z" fill={ink} /><path d="M50 36V14M63 45l20-8M58 60l12 18M42 60L30 78M37 45l-20-8" fill="none" {...o} /></>,
  jeruk: <><circle cx="50" cy="54" r="36" fill="#f59f00" {...o} />{[[36, 46], [60, 40], [42, 68], [64, 64], [52, 54]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill="#c77700" />)}<path d="M50 18c0-5 2-8 6-10" fill="none" {...o} /><path d="M54 14c6-6 16-5 18-2-4 6-12 6-18 2z" fill="#3fa16b" {...o} /></>,
  kelereng: <><circle cx="50" cy="50" r="30" fill="#4fb3d9" {...o} /><path d="M30 50c8 10 26 12 40-4" fill="none" stroke="#e5484d" strokeWidth="4" strokeLinecap="round" /><circle cx="40" cy="38" r="6" fill="#fff" opacity=".7" /></>,
  mur: <><path d="M92 50L71 86.4H29L8 50l21-36.4h42z" fill="#b8c2cc" {...o} /><circle cx="50" cy="50" r="18" fill="#fff" {...o} /><circle cx="50" cy="50" r="13" fill="none" stroke="#8e99a5" strokeWidth="2" strokeDasharray="3 3" /></>,
  tehCelup: <><path d="M50 4v14" stroke={ink} strokeWidth="1.2" /><path d="M50 4h20" stroke={ink} strokeWidth="1.2" /><rect x="66" y="0" width="16" height="12" fill="#e5484d" {...o} /><path d="M50 18L80 38v52H20V38z" fill="#f3e2c7" {...o} /><path d="M26 58c8-6 16 6 24 0s16 6 24 0v26H26z" fill="#b5651d" opacity=".75" /></>,
  rambu: <><path d="M47 60h6v38h-6z" fill="#8e99a5" {...o} /><path d="M50 6l42 70H8z" fill="#f5c542" {...o} /><path d="M50 16l33 54H17z" fill="none" stroke={ink} strokeWidth="2.4" /><path d="M50 32v20" stroke={ink} strokeWidth="5" strokeLinecap="round" /><circle cx="50" cy="61" r="3" fill={ink} /></>,
  koin: <><circle cx="50" cy="50" r="38" fill="#d9b44a" {...o} /><circle cx="50" cy="50" r="31" fill="none" stroke="#a8862a" strokeWidth="2" /><text x="50" y="52" textAnchor="middle" fontSize="18" fontWeight="800" fill="#7a5f16">500</text><text x="50" y="66" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7a5f16">Rupiah</text></>,
  rumahBurung: <><path d="M46 76h8v22h-8z" fill="#8a5a2b" {...o} /><path d="M50 6l36 30v42H14V36z" fill="#7fc36b" {...o} /><path d="M50 6l36 30" stroke="#c0392b" strokeWidth="5" strokeLinecap="round" /><path d="M50 6L14 36" stroke="#c0392b" strokeWidth="5" strokeLinecap="round" /><circle cx="50" cy="48" r="10" fill="#3b2a20" {...o} /><path d="M50 64v6" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" /></>,
  stikerBulat: <><circle cx="50" cy="50" r="38" fill="#ffe08a" {...o} /><path d="M50 26l7 14 15 2-11 10 3 15-14-8-14 8 3-15-11-10 15-2z" fill="#e8963a" {...o} /></>,
  kartuSegitiga: <><path d="M50 10l42 76H8z" fill="#e0567a" {...o} /><path d="M50 30l22 42H28z" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 3" /></>,
  kertasPersegi: <><rect x="14" y="14" width="72" height="72" fill="#8fd0f0" {...o} /><path d="M14 14l72 72" stroke="#fff" strokeWidth="1.6" strokeDasharray="4 4" /></>,
  kotakPensil: <>{iso(30, 84, 64, 22, 18, "#6c8fe6", "#5577cc", "#4a68b8")}<path d="M34 59l40-23" stroke="#f5c542" strokeWidth="5" strokeLinecap="round" /><path d="M74 36l6-3" stroke="#f2d3a0" strokeWidth="5" strokeLinecap="round" /></>,
};
export function ObjArt({ o: name, className = "size-24", label }: { o: ObjName; className?: string; label?: string }) {
  return <svg viewBox="0 0 100 100" className={className} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>{objArt[name]}</svg>;
}

/* ---------- Susunan balok satuan (isometrik) ---------- */
export function Stack({ cubes, className = "w-48" }: { cubes: [number, number, number][]; className?: string }) {
  const s = 14, c = 0.866;
  const proj = (x: number, y: number, z: number): [number, number] => [(x - y) * s * c, (x + y) * s * 0.5 - z * s];
  const sorted = [...cubes].sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[2] - b[2]);
  const all = cubes.flatMap(([x, y, z]) => [proj(x, y, z), proj(x + 1, y + 1, z + 1), proj(x + 1, y, z), proj(x, y + 1, z), proj(x, y, z + 1)]);
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const minX = Math.min(...xs) - 4, minY = Math.min(...ys) - 4, w = Math.max(...xs) - minX + 4, h = Math.max(...ys) - minY + 18;
  const f = (pts: [number, number][]) => pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return <svg viewBox={`${minX} ${minY} ${w} ${h}`} className={className} role="img" aria-label="Susunan balok satuan">
    {sorted.map(([x, y, z]) => <g key={`${x}${y}${z}`}>
      <polygon points={f([proj(x, y, z + 1), proj(x + 1, y, z + 1), proj(x + 1, y + 1, z + 1), proj(x, y + 1, z + 1)])} fill="#8fd17a" stroke={ink} strokeWidth="1" strokeLinejoin="round" />
      <polygon points={f([proj(x + 1, y, z), proj(x + 1, y + 1, z), proj(x + 1, y + 1, z + 1), proj(x + 1, y, z + 1)])} fill="#4c9e3c" stroke={ink} strokeWidth="1" strokeLinejoin="round" />
      <polygon points={f([proj(x, y + 1, z), proj(x + 1, y + 1, z), proj(x + 1, y + 1, z + 1), proj(x, y + 1, z + 1)])} fill="#6cbc58" stroke={ink} strokeWidth="1" strokeLinejoin="round" />
    </g>)}
  </svg>;
}

/* ---------- Gambar umum ---------- */
export function FigView({ fig, className = "size-20", label, scale = 1.1 }: { fig: Fig; className?: string; label?: string; scale?: number }) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  if (fig.t === "solid") return <SolidArt s={fig.s} className={className} label={label} />;
  if (fig.t === "obj") return <ObjArt o={fig.o} className={className} label={label} />;
  if (fig.t === "stack") return <Stack cubes={fig.cubes} className={className} />;
  if (fig.t === "pieces") {
    const pts = fig.list.flatMap(p => p.pts), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const minX = Math.min(...xs) - 3, minY = Math.min(...ys) - 3, w = Math.max(...xs) - minX + 3, h = Math.max(...ys) - minY + 3;
    return <svg viewBox={`${minX} ${minY} ${w} ${h}`} style={{ width: w * scale, maxWidth: "100%" }} {...a11y}>
      {fig.list.map((p, i) => <polygon key={i} points={p.pts.map(q => q.join(",")).join(" ")} fill={fillOf(p.c)} stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />)}
    </svg>;
  }
  return <svg viewBox="0 0 100 100" className={className} {...a11y}>
    {fig.t === "poly" && <polygon points={P[fig.p].map(q => q.join(",")).join(" ")} fill={fillOf(fig.c)} {...o} transform={fig.rot ? `rotate(${fig.rot} 50 50)` : undefined} />}
    {fig.t === "curve" && <path d={curvePath[fig.k]} fill={fillOf(fig.c)} {...o} transform={fig.rot ? `rotate(${fig.rot} 50 50)` : undefined} />}
    {fig.t === "sector" && <path d={sectorPath(fig.deg, fig.rot)} fill="#7cc6d9" {...o} />}
    {fig.t === "missing" && <><circle cx="50" cy="50" r="40" fill="none" stroke={ink} strokeWidth="1.4" strokeDasharray="4 4" /><path d={sectorPath(360 - fig.deg, fig.rot + fig.deg)} fill="#7cc6d9" {...o} /></>}
  </svg>;
}
