/** Gambar Kelas 1 Bab 7 Mengukur Panjang Benda. Semua ukuran dalam satuan dasar (1 penjepit kertas = 12). */
import type { ReactNode } from "react";
import { unitLen, type Animal, type Color, type Flyer, type HObj, type Unit, type VObj, type Way } from "@/data/grade-one-length-v2";

export const paint: Record<Color, { fill: string; dark: string; light: string }> = {
  merah: { fill: "#e5484d", dark: "#a8262b", light: "#f8b4b6" },
  biru: { fill: "#2f7fd6", dark: "#1b4f8f", light: "#a9cdf3" },
  hijau: { fill: "#3fa34d", dark: "#256b30", light: "#a6dcab" },
  kuning: { fill: "#f2c12e", dark: "#b0860f", light: "#fbe6a1" },
  ungu: { fill: "#7b4fc4", dark: "#4f2f86", light: "#cbb6ef" },
  merahmuda: { fill: "#e0508f", dark: "#9c2a5d", light: "#f7b8d3" },
  oranye: { fill: "#f08a24", dark: "#a8560c", light: "#fbcf9f" },
  toska: { fill: "#1fa8a3", dark: "#11706c", light: "#a3e1de" },
};
const ink = "#3b2f2a";

/** Tebal benda mendatar (tinggi gambar) untuk tata letak. */
export const thick = (obj: HObj, len: number) => ({ pensil: 10, krayon: 10, sisir: 12, sikat: 12, daun: len * 0.42, pita: 10, sendok: 14, jam: 16, gunting: 18, botol: 24, buku: 30, sedotan: 5, meja: 26 }[obj]);

/** Benda mendatar dari x sampai x + len, titik tengah tinggi di y. */
export function HArt({ obj, x, y, len: L, color }: { obj: HObj; x: number; y: number; len: number; color: Color }): ReactNode {
  const c = paint[color];
  switch (obj) {
    case "pensil": return <g>
      <rect x={x} y={y - 5} width={7} height={10} rx={2} fill="#f4a6b8" stroke={ink} strokeWidth={0.5} />
      <rect x={x + 6} y={y - 5} width={4} height={10} fill="#c9ccd1" stroke={ink} strokeWidth={0.5} />
      <rect x={x + 10} y={y - 5} width={L - 22} height={10} fill={c.fill} stroke={ink} strokeWidth={0.5} />
      <rect x={x + 10} y={y + 1.5} width={L - 22} height={3.5} fill={c.dark} opacity={0.55} />
      <polygon points={`${x + L - 12},${y - 5} ${x + L - 3.5},${y - 1.6} ${x + L - 3.5},${y + 1.6} ${x + L - 12},${y + 5}`} fill="#f3c98b" stroke={ink} strokeWidth={0.5} />
      <polygon points={`${x + L - 4.5},${y - 1.9} ${x + L},${y} ${x + L - 4.5},${y + 1.9}`} fill={c.dark} />
    </g>;
    case "krayon": return <g>
      <rect x={x} y={y - 5} width={L - 8} height={10} rx={2.5} fill={c.fill} stroke={ink} strokeWidth={0.5} />
      <rect x={x + 6} y={y - 5} width={L - 22} height={10} fill="#fff" opacity={0.3} />
      <line x1={x + 6} x2={x + 6} y1={y - 5} y2={y + 5} stroke={c.dark} strokeWidth={1} />
      <line x1={x + L - 16} x2={x + L - 16} y1={y - 5} y2={y + 5} stroke={c.dark} strokeWidth={1} />
      <polygon points={`${x + L - 8},${y - 4} ${x + L - 1},${y - 1.5} ${x + L},${y} ${x + L - 1},${y + 1.5} ${x + L - 8},${y + 4}`} fill={c.dark} />
    </g>;
    case "sisir": { const h0 = x + L * 0.34, teeth = [];
      for (let t = h0 + 2; t < x + L - 1.5; t += 3.2) teeth.push(<rect key={t} x={t} y={y - 2} width={1.6} height={8} rx={0.8} fill={c.fill} />);
      return <g><rect x={x} y={y - 6} width={L * 0.38} height={8} rx={4} fill={c.fill} stroke={c.dark} strokeWidth={0.6} /><rect x={h0} y={y - 6} width={L - L * 0.34} height={4.5} rx={1.5} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />{teeth}</g>; }
    case "sikat": { const head = x + L - 17, br = [];
      for (let t = head + 1.5; t < x + L - 1; t += 2.2) br.push(<line key={t} x1={t} x2={t} y1={y - 6} y2={y - 0.5} stroke="#7cc6e8" strokeWidth={1.4} />);
      return <g><path d={`M${x + 2} ${y + 1.5} Q${x} ${y + 4} ${x + 3} ${y + 5.5} L${head - 6} ${y + 4.5} Q${head - 2} ${y + 3} ${head} ${y + 3} L${head + 16} ${y + 3} Q${x + L} ${y + 1.5} ${head + 16} ${y} L${head} ${y} Q${head - 4} ${y} ${head - 6} ${y + 1.3} Z`} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />
        <rect x={x + 6} y={y + 2.3} width={(head - x) * 0.45} height={2} rx={1} fill={c.light} />{br}</g>; }
    case "daun": { const a = x + L * 0.12, hh = L * 0.2;
      return <g><line x1={x} y1={y + 0.5} x2={a + 2} y2={y} stroke="#2f6b2a" strokeWidth={1.4} strokeLinecap="round" />
        <path d={`M${a} ${y} C${a + (x + L - a) * 0.25} ${y - hh * 1.35} ${a + (x + L - a) * 0.75} ${y - hh * 1.2} ${x + L} ${y} C${a + (x + L - a) * 0.7} ${y + hh * 1.25} ${a + (x + L - a) * 0.25} ${y + hh * 1.25} ${a} ${y} Z`} fill={c.fill} stroke={c.dark} strokeWidth={0.7} />
        <path d={`M${a} ${y} Q${a + (x + L - a) * 0.5} ${y - hh * 0.15} ${x + L - 1} ${y}`} stroke={c.light} strokeWidth={0.9} fill="none" /></g>; }
    case "pita": return <polygon points={`${x},${y - 5} ${x + L},${y - 5} ${x + L - 4},${y} ${x + L},${y + 5} ${x},${y + 5} ${x + 4},${y}`} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />;
    case "sendok": return <g>
      <path d={`M${x + 1} ${y - 1.6} L${x + L - 21} ${y - 1.2} L${x + L - 21} ${y + 1.2} L${x + 1} ${y + 1.6} Q${x - 0.5} ${y} ${x + 1} ${y - 1.6} Z`} fill="#c3c8ce" stroke="#7d858e" strokeWidth={0.5} />
      <rect x={x} y={y - 2.6} width={L * 0.36} height={5.2} rx={2.6} fill={c.fill} stroke={c.dark} strokeWidth={0.5} />
      <ellipse cx={x + L - 11} cy={y} rx={11} ry={7} fill="#d7dbe0" stroke="#7d858e" strokeWidth={0.6} />
      <ellipse cx={x + L - 10} cy={y - 1} rx={7} ry={4} fill="#eef0f2" />
    </g>;
    case "jam": { const fx = x + L * 0.55;
      return <g><rect x={x} y={y - 4} width={L} height={8} rx={3} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />
        <rect x={x + 2} y={y - 5} width={6} height={10} rx={1.5} fill="none" stroke="#9aa3ad" strokeWidth={1.4} />
        <circle cx={fx} cy={y} r={8} fill="#fff" stroke={c.dark} strokeWidth={2} />
        <line x1={fx} y1={y} x2={fx} y2={y - 5} stroke={ink} strokeWidth={0.9} strokeLinecap="round" /><line x1={fx} y1={y} x2={fx + 3.5} y2={y + 1.5} stroke="#e5484d" strokeWidth={0.8} strokeLinecap="round" /></g>; }
    case "gunting": { const p = x + L - 17;
      return <g><polygon points={`${x},${y - 0.4} ${p},${y - 3.4} ${p + 2},${y - 0.6}`} fill="#c4cad1" stroke="#6f7881" strokeWidth={0.5} />
        <polygon points={`${x + 1},${y + 0.4} ${p},${y + 3.4} ${p + 2},${y + 0.6}`} fill="#aeb5bd" stroke="#6f7881" strokeWidth={0.5} />
        <circle cx={p + 1} cy={y} r={1.3} fill="#6f7881" />
        <path d={`M${p + 2} ${y - 1} Q${p + 4} ${y - 3} ${p + 6} ${y - 4}`} stroke={c.fill} strokeWidth={2.4} fill="none" /><path d={`M${p + 2} ${y + 1} Q${p + 4} ${y + 3} ${p + 6} ${y + 4}`} stroke={c.fill} strokeWidth={2.4} fill="none" />
        <ellipse cx={x + L - 6} cy={y - 5} rx={6} ry={3.6} fill="none" stroke={c.fill} strokeWidth={2.4} /><ellipse cx={x + L - 6} cy={y + 5} rx={6} ry={3.6} fill="none" stroke={c.fill} strokeWidth={2.4} /></g>; }
    case "botol": return <g>
      <path d={`M${x + 3} ${y - 10} Q${x + 7} ${y - 19} ${x + 12} ${y - 10}`} fill="none" stroke={c.dark} strokeWidth={1.6} />
      <rect x={x} y={y - 10} width={15} height={20} rx={3} fill={c.dark} />
      <rect x={x + 13} y={y - 12} width={L - 13} height={24} rx={6} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />
      <rect x={x + 18} y={y - 9} width={L - 26} height={4} rx={2} fill="#fff" opacity={0.45} />
    </g>;
    case "buku": return <g>
      <rect x={x} y={y - 15} width={L} height={26} rx={2.5} fill={c.fill} stroke={c.dark} strokeWidth={0.8} />
      <rect x={x + L * 0.62} y={y - 11} width={L * 0.3} height={14} rx={1.5} fill={c.light} opacity={0.8} />
      <rect x={x + 1.5} y={y + 10} width={L - 3} height={5} fill="#fbfaf6" stroke={c.dark} strokeWidth={0.6} />
      <line x1={x + 3} x2={x + L - 3} y1={y + 12} y2={y + 12} stroke="#c9c4b8" strokeWidth={0.4} /><line x1={x + 3} x2={x + L - 3} y1={y + 13.5} y2={y + 13.5} stroke="#c9c4b8" strokeWidth={0.4} />
    </g>;
    case "sedotan": { const st = []; for (let t = x + 3; t < x + L - 2; t += 8) st.push(<rect key={t} x={t} y={y - 2.5} width={3.5} height={5} fill="#fff" opacity={0.75} />);
      return <g><rect x={x} y={y - 2.5} width={L} height={5} rx={2} fill={c.fill} stroke={c.dark} strokeWidth={0.4} />{st}</g>; }
    case "meja": return <g>
      <rect x={x} y={y - 8} width={L} height={8} rx={1.5} fill="#f2c66d" stroke="#b9862b" strokeWidth={0.8} />
      <rect x={x + L * 0.08} y={y} width={7} height={18} fill="#d9a548" /><rect x={x + L * 0.92 - 7} y={y} width={7} height={18} fill="#d9a548" />
    </g>;
  }
}

/** Benda mendatar yang bisa diputar tegak (dasar di bawah, ujung ke atas). */
export function HArtAt({ obj, x, y, len, color, vertical }: { obj: HObj; x: number; y: number; len: number; color: Color; vertical?: boolean }) {
  return vertical ? <g transform={`rotate(-90 ${x} ${y})`}><HArt obj={obj} x={x} y={y} len={len} color={color} /></g> : <HArt obj={obj} x={x} y={y} len={len} color={color} />;
}

/** Lebar gambar benda berdiri. */
export const vWidth = (obj: VObj, h: number) => ({ pohon: h * 0.62, kelapa: 52, payung: 46, kapal: 62 }[obj]);
/** Benda berdiri; dasar di y = base, puncak di base − h. */
export function VArt({ obj, cx, base: b, h, color = "hijau" }: { obj: VObj; cx: number; base: number; h: number; color?: Color }): ReactNode {
  const c = paint[color], top = b - h;
  switch (obj) {
    case "pohon": { const r = h * 0.3, cy = top + r;
      return <g><path d={`M${cx - h * 0.05} ${b} L${cx - h * 0.035} ${cy} L${cx + h * 0.035} ${cy} L${cx + h * 0.05} ${b} Z`} fill="#8a6a49" />
        <path d={`M${cx} ${cy + r * 0.9} L${cx - r * 0.5} ${cy + r * 0.35} M${cx} ${cy + r * 1.1} L${cx + r * 0.45} ${cy + r * 0.5}`} stroke="#8a6a49" strokeWidth={h * 0.025} />
        <circle cx={cx - r * 0.62} cy={cy + r * 0.32} r={r * 0.68} fill="#3f8f37" /><circle cx={cx + r * 0.62} cy={cy + r * 0.32} r={r * 0.68} fill="#3f8f37" />
        <circle cx={cx} cy={cy} r={r} fill="#4fa443" /><circle cx={cx - r * 0.3} cy={cy - r * 0.25} r={r * 0.45} fill="#74bd5c" opacity={0.8} />
        <path d={`M${cx - 10} ${b} q4 -5 6 0 q2 -6 5 0 q3 -5 6 0`} fill="#6cbf4a" /></g>; }
    case "kelapa": { const cy = top + 12, fr = [[-24, 6], [24, 6], [-17, 15], [17, 15], [-10, -6], [10, -6]];
      return <g><path d={`M${cx - 3} ${b} Q${cx - 6} ${(b + cy) / 2} ${cx - 1.5} ${cy} L${cx + 1.5} ${cy} Q${cx - 2} ${(b + cy) / 2} ${cx + 3} ${b} Z`} fill="#b3894f" stroke="#86643a" strokeWidth={0.4} />
        {Array.from({ length: Math.floor((b - cy) / 7) }, (_, k) => <line key={k} x1={cx - 3.6} x2={cx + 2.2} y1={b - 6 - k * 7} y2={b - 6 - k * 7} stroke="#86643a" strokeWidth={0.6} />)}
        {fr.map(([dx, dy], k) => <path key={k} d={`M${cx} ${cy} Q${cx + dx * 0.55} ${cy + Math.min(dy, 0) - 9 + (dy > 0 ? 6 : 0)} ${cx + dx} ${cy + dy} Q${cx + dx * 0.45} ${cy + Math.min(dy, 0) - 3 + (dy > 0 ? 6 : 0)} ${cx} ${cy + 2} Z`} fill={k % 2 ? "#2f8a3a" : "#3fa34d"} />)}
        <circle cx={cx - 2.5} cy={cy + 3} r={2.6} fill="#9b7a3d" /><circle cx={cx + 2.5} cy={cy + 3} r={2.6} fill="#9b7a3d" /><circle cx={cx} cy={cy + 5.5} r={2.6} fill="#8a6a30" /></g>; }
    case "payung": { const ct = top + 3, cb = top + 18;
      return <g><line x1={cx} y1={top} x2={cx} y2={ct + 1} stroke="#555" strokeWidth={1.4} />
        <path d={`M${cx - 23} ${cb} Q${cx - 22} ${ct} ${cx} ${ct} Q${cx + 22} ${ct} ${cx + 23} ${cb} Q${cx + 17.25} ${cb - 4} ${cx + 11.5} ${cb} Q${cx + 5.75} ${cb - 4} ${cx} ${cb} Q${cx - 5.75} ${cb - 4} ${cx - 11.5} ${cb} Q${cx - 17.25} ${cb - 4} ${cx - 23} ${cb} Z`} fill={c.fill} stroke={c.dark} strokeWidth={0.7} />
        <path d={`M${cx} ${ct} Q${cx - 6} ${ct + 7} ${cx - 11.5} ${cb} M${cx} ${ct} L${cx} ${cb} M${cx} ${ct} Q${cx + 6} ${ct + 7} ${cx + 11.5} ${cb}`} stroke={c.dark} strokeWidth={0.6} fill="none" />
        <line x1={cx} y1={cb} x2={cx} y2={b - 5} stroke="#555" strokeWidth={1.5} />
        <path d={`M${cx} ${b - 5.5} A4 4 0 0 1 ${cx - 8} ${b - 5.5}`} fill="none" stroke="#444" strokeWidth={2.4} strokeLinecap="round" /></g>; }
    case "kapal": { const deck = b - 12, mt = top + 6, sh = deck - 3 - (mt + 3), s1 = mt + 3, s2 = s1 + sh * 0.5;
      return <g><path d={`M${cx - 28} ${deck} L${cx + 30} ${deck} L${cx + 22} ${b - 1} L${cx - 24} ${b - 1} Z`} fill="#c2593d" stroke="#8a3a25" strokeWidth={0.7} />
        <line x1={cx - 24} x2={cx + 26} y1={deck + 4} y2={deck + 4} stroke="#8a3a25" strokeWidth={0.6} />
        {[-14, -6, 2, 10].map(d => <rect key={d} x={cx + d} y={deck + 5.5} width={3} height={2.4} fill="#f6e3b5" />)}
        <line x1={cx} y1={top + 2} x2={cx} y2={deck} stroke="#6b4a2a" strokeWidth={1.6} />
        <polygon points={`${cx},${top} ${cx + 8},${top + 2.5} ${cx},${top + 5}`} fill="#e5484d" />
        <path d={`M${cx - 15} ${s1} L${cx + 15} ${s1} Q${cx + 17} ${s1 + sh * 0.25} ${cx + 14} ${s2 - 1} L${cx - 14} ${s2 - 1} Q${cx - 17} ${s1 + sh * 0.25} ${cx - 15} ${s1} Z`} fill="#f3d9a8" stroke="#b8935a" strokeWidth={0.6} />
        <path d={`M${cx - 18} ${s2 + 1} L${cx + 18} ${s2 + 1} Q${cx + 20} ${s2 + sh * 0.25} ${cx + 17} ${deck - 3} L${cx - 17} ${deck - 3} Q${cx - 20} ${s2 + sh * 0.25} ${cx - 18} ${s2 + 1} Z`} fill="#f3d9a8" stroke="#b8935a" strokeWidth={0.6} />
        <path d={`M${cx - 32} ${b} q4 -2.5 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0`} fill="none" stroke="#4aa3df" strokeWidth={1.3} /></g>; }
  }
}

/** Hewan terbang dengan titik tengah (x, y). */
export function FlyerArt({ flyer, x, y, color, s = 1 }: { flyer: Flyer; x: number; y: number; color: Color; s?: number }) {
  const c = paint[color];
  const g = (n: ReactNode) => <g transform={`translate(${x} ${y}) scale(${s})`}>{n}</g>;
  if (flyer === "burung") return g(<>
    <path d="M-9 1 L-15 -2 L-14 4 Z" fill={c.dark} />
    <ellipse cx={0} cy={2} rx={10} ry={6.5} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />
    <circle cx={8} cy={-3} r={5} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />
    <polygon points="12.5,-4 17,-2.5 12.5,-1" fill="#f0a020" /><circle cx={9.5} cy={-4} r={1} fill={ink} />
    <path d="M-3 0 Q-6 -12 4 -13 Q2 -5 4 0 Z" fill={c.dark} opacity={0.85} />
  </>);
  if (flyer === "kupu") return g(<>
    <ellipse cx={-6} cy={-5} rx={7} ry={6} fill={c.fill} stroke={c.dark} strokeWidth={0.6} transform="rotate(-20 -6 -5)" />
    <ellipse cx={6} cy={-5} rx={7} ry={6} fill={c.fill} stroke={c.dark} strokeWidth={0.6} transform="rotate(20 6 -5)" />
    <ellipse cx={-5} cy={5} rx={5} ry={4} fill={c.fill} stroke={c.dark} strokeWidth={0.6} /><ellipse cx={5} cy={5} rx={5} ry={4} fill={c.fill} stroke={c.dark} strokeWidth={0.6} />
    <circle cx={-6} cy={-5} r={2} fill={c.light} /><circle cx={6} cy={-5} r={2} fill={c.light} />
    <ellipse cx={0} cy={0} rx={1.6} ry={8} fill={ink} />
    <path d="M-0.5 -8 Q-3 -13 -5 -13 M0.5 -8 Q3 -13 5 -13" stroke={ink} strokeWidth={0.7} fill="none" />
  </>);
  return g(<>
    <ellipse cx={-6} cy={-5} rx={9} ry={3} fill="#dff1fb" stroke="#9bb8c8" strokeWidth={0.5} transform="rotate(-25 -6 -5)" />
    <ellipse cx={6} cy={-5} rx={9} ry={3} fill="#dff1fb" stroke="#9bb8c8" strokeWidth={0.5} transform="rotate(25 6 -5)" />
    <ellipse cx={-6} cy={-1} rx={8} ry={2.6} fill="#dff1fb" stroke="#9bb8c8" strokeWidth={0.5} transform="rotate(-8 -6 -1)" />
    <ellipse cx={6} cy={-1} rx={8} ry={2.6} fill="#dff1fb" stroke="#9bb8c8" strokeWidth={0.5} transform="rotate(8 6 -1)" />
    <rect x={-1.4} y={-3} width={2.8} height={18} rx={1.4} fill={c.fill} stroke={c.dark} strokeWidth={0.5} />
    <circle cx={0} cy={-5} r={3} fill={c.fill} stroke={c.dark} strokeWidth={0.5} /><circle cx={-1.3} cy={-6} r={1} fill={ink} /><circle cx={1.3} cy={-6} r={1} fill={ink} />
  </>);
}

/** Satu alat ukur mendatar mulai dari x (atau tegak ke atas dari y bila vertical). */
export function UnitArt({ unit, x, y, k = 0 }: { unit: Unit; x: number; y: number; k?: number }): ReactNode {
  const L = unitLen[unit];
  switch (unit) {
    case "penjepit": { const col = ["#2f7fd6", "#e5484d", "#3fa34d", "#f0a020"][k % 4];
      return <path d={`M${x + 4} ${y + 0.9} H${x + 9.3} a0.95 0.95 0 0 0 0 -1.9 H${x + 2.3} a1.75 1.75 0 0 0 0 3.5 H${x + 10} a2 2 0 0 0 0 -4 H${x + 4}`} fill="none" stroke={col} strokeWidth={0.8} strokeLinecap="round" />; }
    case "koin": return <g><circle cx={x + 4} cy={y} r={3.8} fill="#cdd3da" stroke="#8b939c" strokeWidth={0.5} /><circle cx={x + 4} cy={y} r={2.6} fill="none" stroke="#a3abb4" strokeWidth={0.4} /></g>;
    case "stik": return <rect x={x + 0.4} y={y - 3} width={L - 0.8} height={6} rx={3} fill="#e8c27c" stroke="#c0954a" strokeWidth={0.6} />;
    case "sedotan": return <HArt obj="sedotan" x={x + 0.3} y={y} len={L - 0.6} color={k % 2 ? "merah" : "biru"} />;
    case "jengkal": case "jengkalAyah": return <Hand x={x} y={y} w={L} big={unit === "jengkalAyah"} />;
  }
}
/** Tangan terbuka (jengkal): ibu jari di x, kelingking di x + w, pangkal di y. */
export function Hand({ x, y, w, big }: { x: number; y: number; w: number; big?: boolean }) {
  const s = w / 40, skin = big ? "#c98d68" : "#e3ae8c", line = big ? "#8f5c3e" : "#b47a59";
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M14 0 Q12 -9 16 -13 L26 -13 Q30 -8 28 0 Z" fill={skin} stroke={line} strokeWidth={0.6} />
    <path d="M15 -9 Q8 -10 1 -6 Q0 -4 2 -3.5 Q9 -5 15 -4 Z" fill={skin} stroke={line} strokeWidth={0.6} />
    <path d="M17 -12.5 Q14 -22 13 -27 Q14.5 -29 16 -27 Q18 -21 20 -13 Z" fill={skin} stroke={line} strokeWidth={0.6} />
    <path d="M20.5 -13 Q20.5 -24 21 -30 Q22.8 -31.5 24 -30 Q24 -23 23.5 -13 Z" fill={skin} stroke={line} strokeWidth={0.6} />
    <path d="M24 -13 Q27 -22 29 -27 Q31 -28 31.5 -26 Q30 -20 26.5 -12 Z" fill={skin} stroke={line} strokeWidth={0.6} />
    <path d="M27 -10 Q33 -14 39 -15.5 Q40.5 -14.5 39.5 -13 Q34 -10.5 28 -6 Z" fill={skin} stroke={line} strokeWidth={0.6} />
  </g>;
}
export const handH = (w: number) => (31 * w) / 40;

/** Tinggi hewan dalam gambar 100 satuan, lebar menurut jenisnya. */
export const animalW: Record<Animal, number> = { kucing: 80, sapi: 130, jerapah: 72 };
export function AnimalArt({ animal, x, base, h }: { animal: Animal; x: number; base: number; h: number }) {
  const s = h / 100, t = (n: ReactNode) => <g transform={`translate(${x} ${base - h}) scale(${s})`}>{n}</g>;
  if (animal === "kucing") return t(<>
    <path d="M62 88 Q86 86 78 60 Q76 52 70 56" fill="none" stroke="#8d97a3" strokeWidth={7} strokeLinecap="round" />
    <ellipse cx={42} cy={70} rx={24} ry={28} fill="#a7b0bb" />
    <ellipse cx={34} cy={92} rx={9} ry={7} fill="#97a1ad" /><ellipse cx={52} cy={92} rx={9} ry={7} fill="#97a1ad" />
    <circle cx={34} cy={30} r={20} fill="#a7b0bb" />
    <polygon points="16,22 18,0 32,12" fill="#a7b0bb" /><polygon points="52,22 50,0 36,12" fill="#a7b0bb" />
    <polygon points="20,18 21,6 29,13" fill="#f2b8c6" /><polygon points="48,18 47,6 39,13" fill="#f2b8c6" />
    <circle cx={27} cy={28} r={3} fill={ink} /><circle cx={41} cy={28} r={3} fill={ink} /><path d="M32 35 L36 35 L34 37.5 Z" fill="#e48aa0" />
    <path d="M30 40 Q34 43 38 40 M18 34 L6 32 M18 37 L6 39 M50 34 L62 32 M50 37 L62 39" stroke={ink} strokeWidth={1} fill="none" />
    <path d="M28 56 Q42 60 56 56" stroke="#8d97a3" strokeWidth={2} fill="none" />
  </>);
  if (animal === "sapi") return t(<>
    <rect x={30} y={40} width={86} height={40} rx={18} fill="#f7eedc" stroke="#8a6a49" strokeWidth={1.2} />
    {[[48, 52, 11, 8], [86, 48, 13, 9], [100, 66, 8, 7]].map(([cx, cy, rx, ry], k) => <ellipse key={k} cx={cx} cy={cy} rx={rx} ry={ry} fill="#9b5d3a" />)}
    {[38, 54, 92, 106].map(lx => <rect key={lx} x={lx} y={72} width={9} height={24} rx={3} fill="#f7eedc" stroke="#8a6a49" strokeWidth={1} />)}
    {[38, 54, 92, 106].map(lx => <rect key={`h${lx}`} x={lx} y={92} width={9} height={8} rx={2} fill="#4a3426" />)}
    <path d="M114 46 Q128 52 124 74" stroke="#8a6a49" strokeWidth={2.4} fill="none" /><circle cx={124} cy={76} r={3} fill="#4a3426" />
    <ellipse cx={72} cy={82} rx={8} ry={5} fill="#f2b8c6" />
    <rect x={6} y={18} width={30} height={34} rx={13} fill="#f7eedc" stroke="#8a6a49" strokeWidth={1.2} />
    <path d="M10 20 Q2 8 6 2 M32 20 Q40 8 36 2" stroke="#d8c39a" strokeWidth={4} strokeLinecap="round" fill="none" />
    <ellipse cx={2} cy={26} rx={6} ry={4} fill="#f7eedc" stroke="#8a6a49" strokeWidth={1} /><ellipse cx={40} cy={26} rx={6} ry={4} fill="#f7eedc" stroke="#8a6a49" strokeWidth={1} />
    <circle cx={15} cy={30} r={2.6} fill={ink} /><circle cx={27} cy={30} r={2.6} fill={ink} />
    <ellipse cx={21} cy={45} rx={13} ry={8} fill="#f0b6a8" /><circle cx={16} cy={45} r={2} fill="#9b5d3a" /><circle cx={26} cy={45} r={2} fill="#9b5d3a" />
  </>);
  return t(<>
    <path d="M30 56 L40 6 L52 8 L46 58 Z" fill="#f2b84b" />
    <ellipse cx={42} cy={64} rx={28} ry={14} fill="#f2b84b" />
    {[18, 30, 52, 62].map(lx => <rect key={lx} x={lx} y={68} width={6} height={30} rx={2} fill="#f2b84b" />)}
    {[18, 30, 52, 62].map(lx => <rect key={`h${lx}`} x={lx} y={95} width={6} height={5} fill="#6b4a2a" />)}
    <path d="M68 60 Q76 66 74 78" stroke="#c98a2a" strokeWidth={1.6} fill="none" />
    <ellipse cx={46} cy={7} rx={13} ry={7} fill="#f2b84b" transform="rotate(15 46 7)" />
    <line x1={40} y1={2} x2={39} y2={-4} stroke="#8a5a2a" strokeWidth={2} /><line x1={46} y1={1} x2={47} y2={-5} stroke="#8a5a2a" strokeWidth={2} />
    <circle cx={39} cy={-4.5} r={2} fill="#8a5a2a" /><circle cx={47} cy={-5.5} r={2} fill="#8a5a2a" />
    <circle cx={44} cy={5} r={1.8} fill={ink} />
    {[[40, 20], [44, 34], [38, 46], [28, 62], [44, 66], [58, 60], [34, 58]].map(([cx, cy], k) => <ellipse key={k} cx={cx} cy={cy} rx={4.2} ry={3.4} fill="#b56b23" />)}
  </>);
}

/** Anak berseragam, tinggi h, kaki di base. look: 0 Kira (bando), 1 Upe, 2 Malosi (keriting), 3 Wei (kuncir). */
export function Kid({ cx, base, h, look }: { cx: number; base: number; h: number; look: number }) {
  const s = h / 100, girl = look === 0 || look === 3;
  const skin = ["#f3c7a5", "#efc19c", "#9a6646", "#f6d0b1"][look], hair = ["#2b1d16", "#2b1d16", "#1d1410", "#3a2619"][look];
  return <g transform={`translate(${cx - 20 * s} ${base - h}) scale(${s})`}>
    {look === 2 ? <circle cx={20} cy={11} r={13} fill={hair} /> : <path d="M7 14 Q6 0 20 0 Q34 0 33 14 Z" fill={hair} />}
    {look === 3 && <path d="M32 9 Q42 14 36 26" stroke={hair} strokeWidth={4} fill="none" strokeLinecap="round" />}
    <circle cx={20} cy={13} r={10} fill={skin} />
    {look === 2 && [[10, 6], [16, 2], [24, 2], [30, 6]].map(([a, b], k) => <circle key={k} cx={a} cy={b} r={4} fill={hair} />)}
    {look !== 2 && <path d="M10 10 Q20 4 30 10 L30 7 Q20 -1 10 7 Z" fill={hair} />}
    {look === 0 && <path d="M9 8 Q20 1 31 8" stroke="#c0398a" strokeWidth={2.2} fill="none" />}
    <circle cx={16.5} cy={14} r={1.3} fill={ink} /><circle cx={23.5} cy={14} r={1.3} fill={ink} /><path d="M17 18 Q20 20.5 23 18" stroke={ink} strokeWidth={0.9} fill="none" />
    <path d="M9 26 Q20 22 31 26 L33 52 L7 52 Z" fill="#fdfdfb" stroke="#c9c9c2" strokeWidth={0.7} />
    <polygon points="18.5,25 21.5,25 22,40 20,43 18,40" fill="#cf2f2f" />
    <path d="M9 27 L3 46 L7 47 L12 32 M31 27 L37 46 L33 47 L28 32" fill="#fdfdfb" stroke="#c9c9c2" strokeWidth={0.7} />
    <circle cx={5} cy={48} r={2.4} fill={skin} /><circle cx={35} cy={48} r={2.4} fill={skin} />
    {girl ? <path d="M7 50 L33 50 L36 70 L4 70 Z" fill="#c72f35" /> : <path d="M8 50 L32 50 L33 68 L22 68 L20 60 L18 68 L7 68 Z" fill="#c72f35" />}
    <rect x={12} y={girl ? 70 : 68} width={5} height={girl ? 21 : 23} fill={skin} /><rect x={23} y={girl ? 70 : 68} width={5} height={girl ? 21 : 23} fill={skin} />
    <rect x={11.5} y={86} width={6} height={8} fill="#fff" /><rect x={22.5} y={86} width={6} height={8} fill="#fff" />
    <path d="M9 94 L18 94 L18 100 L8 100 Q8 96 9 94 Z M22 94 L31 94 Q32 96 32 100 L22 100 Z" fill="#2a2a2a" />
  </g>;
}

/** Cara meletakkan alat ukur pada meja atau buku. */
export function WayArt({ way, obj, unit }: { way: Way; obj: "meja" | "buku"; unit: Unit }) {
  const L = obj === "meja" ? 240 : 96, u = unitLen[unit], n = L / u, W = L + 24, top = obj === "meja" ? 8 : 6, faceH = obj === "meja" ? 46 : 30;
  const yy = top + faceH - 5;
  const step = way === "celah" ? u + 5 : way === "tumpuk" ? u * 0.72 : u, start = way === "geser" ? 14 : 0;
  const units = Array.from({ length: n }, (_, k) => <g key={k} transform={way === "tumpuk" ? `translate(0 ${k % 2 ? -2.5 : 0})` : undefined}><UnitArt unit={unit} x={12 + start + k * step} y={yy} k={k} /></g>);
  return <svg viewBox={`0 0 ${W} ${top + faceH + (obj === "meja" ? 18 : 4)}`} className="h-auto w-full" aria-hidden="true">
    {obj === "meja" ? <><rect x={12} y={top} width={L} height={faceH} rx={2} fill="#f6cf7f" stroke="#c4913a" strokeWidth={1} /><rect x={12} y={top + faceH - 3} width={L} height={4} fill="#e2ae52" />
      <rect x={30} y={top + faceH + 1} width={10} height={16} fill="#e2ae52" /><rect x={L - 16} y={top + faceH + 1} width={10} height={16} fill="#e2ae52" /></>
      : <HArt obj="buku" x={12} y={top + 15} len={L} color="hijau" />}
    {way === "miring" ? <g transform={`rotate(-6 12 ${yy})`}>{units}</g> : units}
  </svg>;
}
