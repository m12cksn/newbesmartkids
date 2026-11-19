import type { ReactNode } from "react";
import { objName, type Color, type Fig, type Form, type Item, type Obj, isObj, itemName, pictures, puzzles } from "@/data/grade-one-shapes-v2";

/* Gambar Kelas 1 Bab 4: bangun datar, benda nyata (viewBox 48 × 48), gambar susunan, dan potongan. */
const ink = "#2b2320";
export const tone: Record<Color, { fill: string; line: string }> = {
  merah: { fill: "#fca5a5", line: "#dc2626" }, kuning: { fill: "#fde68a", line: "#ca8a04" }, hijau: { fill: "#bbf7d0", line: "#16a34a" },
  biru: { fill: "#bae6fd", line: "#0284c7" }, ungu: { fill: "#e9d5ff", line: "#9333ea" }, oranye: { fill: "#fed7aa", line: "#ea580c" }, pink: { fill: "#fbcfe8", line: "#db2777" },
};
/** Titik sudut bangun di dalam kotak (x, y, w, h). */
export function points(f: Form, x: number, y: number, w: number, h: number): string {
  const p: Record<Exclude<Form, "circle">, [number, number][]> = {
    tri: [[x + w / 2, y], [x + w, y + h], [x, y + h]], triDown: [[x, y], [x + w, y], [x + w / 2, y + h]],
    right: [[x, y], [x, y + h], [x + w, y + h]], rightR: [[x + w, y], [x + w, y + h], [x, y + h]],
    rect: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], diamond: [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]],
  };
  return f === "circle" ? "" : p[f].map(q => q.join(",")).join(" ");
}
/** Satu bangun sebagai elemen SVG. */
export function FigShape({ fig, x = fig.x ?? 0, y = fig.y ?? 0, dashed = false, fill, line, sw = 1.6 }: { fig: Fig; x?: number; y?: number; dashed?: boolean; fill?: string; line?: string; sw?: number }) {
  const t = tone[fig.c], props = { fill: fill ?? (dashed ? "none" : t.fill), stroke: line ?? (dashed ? ink : t.line), strokeWidth: sw, strokeDasharray: dashed ? "4 4" : undefined, strokeLinejoin: "round" as const };
  return fig.f === "circle" ? <ellipse cx={x + fig.w / 2} cy={y + fig.h / 2} rx={fig.w / 2} ry={fig.h / 2} {...props} /> : <polygon points={points(fig.f, x, y, fig.w, fig.h)} {...props} />;
}
/** Bangun berdiri sendiri. `unit` = piksel per satuan, agar ukuran antarbangun bisa dibandingkan. */
export function FigView({ fig, unit = 1.2, dashed, fill, label }: { fig: Fig; unit?: number; dashed?: boolean; fill?: string; label?: string }) {
  const pad = 3;
  return <svg viewBox={`${-pad} ${-pad} ${fig.w + 2 * pad} ${fig.h + 2 * pad}`} width={(fig.w + 2 * pad) * unit} height={(fig.h + 2 * pad) * unit} role="img" aria-label={label ?? itemName(fig)}><FigShape fig={fig} x={0} y={0} dashed={dashed} fill={fill} sw={dashed ? 1.4 : 2} /></svg>;
}

/* ---------- Benda nyata ---------- */
const s = { stroke: ink, strokeWidth: 1.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const objArt: Record<Obj, ReactNode> = {
  jam: <><circle cx="24" cy="24" r="20" fill="#2f6fd6" {...s} /><circle cx="24" cy="24" r="16" fill="#fff" {...s} />{Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return <line key={i} x1={24 + 13 * Math.sin(a)} y1={24 - 13 * Math.cos(a)} x2={24 + 15 * Math.sin(a)} y2={24 - 15 * Math.cos(a)} stroke={i % 3 ? "#9aa4ad" : "#dc2626"} strokeWidth="1.4" />; })}<path d="M24 24L24 13M24 24L31 28" stroke={ink} strokeWidth="2" strokeLinecap="round" /><circle cx="24" cy="24" r="1.6" fill={ink} /></>,
  piring: <><circle cx="24" cy="24" r="21" fill="#b8322a" {...s} /><circle cx="24" cy="24" r="17" fill="none" stroke="#f3c14b" strokeWidth="1.4" strokeDasharray="3 2" /><circle cx="24" cy="24" r="14" fill="#f7f7f5" {...s} /><path d="M15 20c2-4 6-6 10-6" stroke="#fff" strokeWidth="2" fill="none" /></>,
  donat: <><circle cx="24" cy="24" r="19" fill="#d79a54" {...s} /><path d="M7.5 23c2-9 9-14 16.5-14s14 5 16 13c-2 2-3 0-5 2s-1 4-4 4-3-3-5-3-3 4-6 4-3-4-5-4-4 3-6 1-1-4-3-4z" fill="#f28fb5" {...s} /><circle cx="24" cy="24" r="6" fill="#fff" {...s} />{[[15, 15, "#fff"], [30, 13, "#4ade80"], [35, 20, "#60a5fa"], [13, 21, "#facc15"], [22, 12, "#60a5fa"]].map(([x, y, c], i) => <rect key={i} x={x as number} y={y as number} width="3" height="1.4" rx=".7" fill={c as string} transform={`rotate(${i * 40} ${x} ${y})`} />)}</>,
  lolipop: <><path d="M24 30L24 46" stroke="#e8b24a" strokeWidth="3" strokeLinecap="round" /><circle cx="24" cy="17" r="14" fill="#ef4444" {...s} /><path d="M24 17a2.5 2.5 0 012.5 2.5 5 5 0 01-7.5-2.5 7.5 7.5 0 0112.5-2.5 10 10 0 01-5 11.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></>,
  telur: <><ellipse cx="24" cy="45" rx="12" ry="1.8" fill="#000" opacity=".12" /><path d="M24 4c8 0 14 12 14 22 0 10-6 18-14 18S10 36 10 26C10 16 16 4 24 4z" fill="#e8955a" {...s} /><path d="M17 15c1-3 3-6 6-7" stroke="#fff" strokeWidth="2" fill="none" opacity=".6" strokeLinecap="round" /></>,
  kukis: <><circle cx="24" cy="24" r="19" fill="#e2b46b" {...s} />{[[16, 16], [29, 14], [33, 26], [21, 30], [14, 26], [26, 22], [28, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill="#5b3418" />)}</>,
  semangka: <><path d="M5 9Q24 2 43 9L24 44Z" fill="#3f9b45" {...s} /><path d="M9 12Q24 7 39 12L24 39Z" fill="#f2f2c8" /><path d="M11 14Q24 10 37 14L24 37Z" fill="#ef4444" />{[[19, 18], [28, 18], [24, 25], [21, 30]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="1" ry="1.7" fill={ink} />)}</>,
  risol: <><path d="M24 6c2 0 3 1 4 3l14 27c1 3-1 5-4 5H10c-3 0-5-2-4-5L20 9c1-2 2-3 4-3z" fill="#d98b2f" {...s} />{[[18, 24], [27, 20], [24, 32], [32, 33], [15, 35], [22, 15]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.3" fill="#a85d16" />)}</>,
  penggaris: <><path d="M6 6V42H42Z" fill="#e5b33b" {...s} /><path d="M12 20V36H28Z" fill="#fff" {...s} />{Array.from({ length: 9 }, (_, i) => <line key={i} x1="6" y1={10 + i * 3.6} x2={i % 2 ? 8.5 : 10} y2={10 + i * 3.6} stroke={ink} strokeWidth=".8" />)}</>,
  gantungan: <><path d="M24 14c0-3 4-3 4-6s-2-4-4-4-4 1-4 3" fill="none" stroke="#b91c1c" strokeWidth="2.4" strokeLinecap="round" /><path d="M24 14L5 34h38z" fill="none" stroke="#b91c1c" strokeWidth="3" strokeLinejoin="round" /><path d="M5 34v4h3M43 34v4h-3" stroke="#b91c1c" strokeWidth="2.4" fill="none" strokeLinecap="round" /></>,
  rambu: <><path d="M24 34v12" stroke="#7a7a7a" strokeWidth="3" /><path d="M24 3L44 36H4Z" fill="#fff" stroke="#dc2626" strokeWidth="4" strokeLinejoin="round" /><path d="M24 14v10" stroke={ink} strokeWidth="3" strokeLinecap="round" /><circle cx="24" cy="29" r="1.8" fill={ink} /></>,
  buku: <><path d="M10 6h26v36H10z" fill="#1f9d55" {...s} /><path d="M36 7h3v34h-3" fill="#f4f1e8" {...s} /><path d="M15 12h16v10H15z" fill="#52c27f" /><path d="M15 30h16M15 34h12" stroke="#c8f0d6" strokeWidth="1.2" /></>,
  pintu: <><path d="M12 3h24v42H12z" fill="#e89a62" {...s} /><path d="M16 8h16v14H16zM16 26h16v14H16z" fill="none" stroke="#b8693a" strokeWidth="1.2" /><path d="M30 24h3" stroke="#6b7280" strokeWidth="2.4" strokeLinecap="round" /></>,
  jendela: <><path d="M6 6h36v36H6z" fill="#8b5a2b" {...s} /><path d="M10 10h12v12H10zM26 10h12v12H26zM10 26h12v12H10zM26 26h12v12H26z" fill="#c9d6df" /><path d="M12 20l6-8M28 20l6-8M12 36l6-8M28 36l6-8" stroke="#fff" strokeWidth="1.4" opacity=".8" /></>,
  bingkai: <><path d="M8 4h32v40H8z" fill="#7a4a24" {...s} /><path d="M13 9h22v30H13z" fill="#bfe3f2" {...s} /><path d="M13 39l8-12 5 7 4-5 5 10z" fill="#4ca35b" /><circle cx="29" cy="16" r="3" fill="#f6c32d" /></>,
  kuelapis: <><path d="M6 12h36v26H6z" fill="#f6d6a8" {...s} />{[16, 22, 28, 34].map(y => <path key={y} d={`M6 ${y}h36`} stroke="#8a4a2a" strokeWidth="2" />)}<path d="M6 12h36v3H6z" fill="#e2457a" /><path d="M6 12h36v26H6z" fill="none" {...s} /></>,
  amplop: <><path d="M5 11h38v26H5z" fill="#fdf3dc" {...s} /><path d="M5 11l19 15 19-15" fill="none" {...s} /><path d="M5 37l14-12M43 37L29 25" stroke="#c9b48a" strokeWidth="1" /></>,
};
export function ObjArt({ obj, size = 56 }: { obj: Obj; size?: number }) {
  return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label={objName[obj]}>{objArt[obj]}</svg>;
}
/** Benda atau bangun. */
export function ItemView({ it, size = 56, unit }: { it: Item; size?: number; unit?: number }) {
  if (isObj(it)) return <ObjArt obj={it} size={size} />;
  return <FigView fig={it} unit={unit ?? size / Math.max(it.w, it.h, 30) / 1.1} />;
}
/** Satuan bersama agar ukuran beberapa bangun bisa dibandingkan. */
export const sharedUnit = (figs: Fig[], px: number) => px / Math.max(...figs.map(f => Math.max(f.w, f.h)));

/* ---------- Gambar susunan ---------- */
export function PictureView({ id, mark, toggle, className = "h-auto w-full" }: { id: string; mark?: boolean[]; toggle?: (k: number) => void; className?: string }) {
  const pic = pictures[id];
  return <svg viewBox={`-2 -2 ${pic.vb[0] + 4} ${pic.vb[1] + 4}`} className={className} role="img" aria-label={`gambar ${pic.name} dari bentuk bangun`}>
    {pic.figs.map((f, k) => <g key={k} onClick={toggle ? () => toggle(k) : undefined} className={toggle ? "cursor-pointer" : undefined}>
      <FigShape fig={f} fill={tone[f.c].fill} line={tone[f.c].line} sw={1.4} />
      {mark?.[k] && <circle cx={(f.x ?? 0) + f.w / 2} cy={(f.y ?? 0) + f.h / 2} r={Math.min(4, f.w / 2.5, f.h / 2.5)} fill={ink} opacity=".75" />}
    </g>)}
  </svg>;
}

/* ---------- Potongan ---------- */
export function PuzzleBase({ id, chosen, className = "h-40 w-40" }: { id: string; chosen?: number; className?: string }) {
  const z = puzzles[id], p = chosen === undefined ? undefined : z.opts[chosen];
  return <svg viewBox="0 0 100 100" className={className} role="img" aria-label="bangun yang terpotong">
    <path d={z.base} fill={z.color} stroke={ink} strokeWidth="1.6" />
    <path d={z.hole} fill="#fff" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" />
    {p && <path d={p.d} transform={`translate(${z.at[0]} ${z.at[1]})`} fill={z.color} stroke="#16a34a" strokeWidth="1.8" opacity=".9" />}
  </svg>;
}
export function PieceView({ id, k, size = 72 }: { id: string; k: number; size?: number }) {
  const z = puzzles[id], p = z.opts[k], scale = size / 70;
  return <svg viewBox={`-3 -3 ${p.w + 6} ${p.h + 6}`} width={(p.w + 6) * scale} height={(p.h + 6) * scale} aria-hidden="true"><path d={p.d} fill={z.color} stroke={ink} strokeWidth="1.6" /></svg>;
}

/* ---------- Dua segitiga digabung ---------- */
export function JoinView({ mode, colors }: { mode: "kotak" | "segitiga"; colors: [Color, Color] }) {
  const [a, b] = colors.map(c => tone[c]);
  return <svg viewBox="-2 -2 104 64" className="h-32 w-56" role="img" aria-label="dua segitiga sama besar yang digabungkan">
    {/* Kedua segitiga selalu sama: siku-siku dengan kaki 40 dan 60. */}
    {mode === "kotak" ? <><polygon points="30,0 30,60 70,60" fill={a.fill} stroke={a.line} strokeWidth="2" /><polygon points="30,0 70,0 70,60" fill={b.fill} stroke={b.line} strokeWidth="2" /></>
      : <><polygon points="50,0 50,60 10,60" fill={a.fill} stroke={a.line} strokeWidth="2" /><polygon points="50,0 50,60 90,60" fill={b.fill} stroke={b.line} strokeWidth="2" /></>}
  </svg>;
}
export const Cap = ({ children }: { children: ReactNode }) => <span className="text-xs font-bold leading-tight text-base-content/70">{children}</span>;
