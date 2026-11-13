import type { ReactNode } from "react";
import type { Scene } from "@/data/grade-eight-pythagoras";
import { FigView } from "./GradeSevenSimilarityArt";
import { M, plainMath } from "./GradeEightPowersArt";

export { M, plainMath };
const ink = "#1f3b30", blue = "#1c64b5", red = "#b42318";
const T = ({ x, y, children, c = blue, a = "middle", s = 12 }: { x: number; y: number; children: ReactNode; c?: string; a?: "middle" | "start" | "end"; s?: number }) =>
  <text x={x} y={y} fontSize={s} fontWeight="800" textAnchor={a} fill={c}>{children}</text>;
const col = (t: string) => (t === "?" ? red : blue);

/* ---------- Bidang koordinat ---------- */
export function GridView({ points, segments = [], legs, label }: { points: { name: string; x: number; y: number }[]; segments?: [number, number][]; legs?: boolean; label?: string }) {
  const xs = [0, ...points.map(p => p.x)], ys = [0, ...points.map(p => p.y)];
  const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
  const span = Math.max(x1 - x0, y1 - y0), u = 240 / span, step = span > 24 ? 5 : span > 14 ? 2 : 1;
  const X = (x: number) => 20 + (x - x0) * u, Y = (y: number) => 20 + (y1 - y) * u, W = 64 + (x1 - x0) * u, H = 40 + (y1 - y0) * u;
  const lines: ReactNode[] = [];
  for (let x = Math.ceil(x0); x <= x1; x++) lines.push(<line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(y0)} y2={Y(y1)} stroke={x === 0 ? "#33413b" : "#d5e3dc"} strokeWidth={x === 0 ? 1.6 : 0.8} />);
  for (let y = Math.ceil(y0); y <= y1; y++) lines.push(<line key={`y${y}`} y1={Y(y)} y2={Y(y)} x1={X(x0)} x2={X(x1)} stroke={y === 0 ? "#33413b" : "#d5e3dc"} strokeWidth={y === 0 ? 1.6 : 0.8} />);
  const ticks: ReactNode[] = [];
  for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) if (x !== 0) ticks.push(<text key={`tx${x}`} x={X(x)} y={Y(0) + 11} fontSize="8" textAnchor="middle" fill="#5b6b64">{x < 0 ? `−${-x}` : x}</text>);
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) if (y !== 0) ticks.push(<text key={`ty${y}`} x={X(0) - 3} y={Y(y) + 3} fontSize="8" textAnchor="end" fill="#5b6b64">{y < 0 ? `−${-y}` : y}</text>);
  const [a, b] = points;
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" role="img" aria-label={label ?? `Bidang koordinat dengan titik ${points.map(p => `${p.name}(${p.x}, ${p.y})`).join(", ")}`}>
    {lines}{ticks}
    {legs && a && b && <g stroke="#e8590c" strokeWidth="2" strokeDasharray="5 3" fill="none"><path d={`M${X(a.x)} ${Y(a.y)}H${X(b.x)}V${Y(b.y)}`} /></g>}
    {legs && a && b && <g><T x={(X(a.x) + X(b.x)) / 2} y={Y(a.y) + (b.y >= a.y ? 13 : -6)} c="#c2410c" s={10}>{Math.abs(b.x - a.x)}</T><T x={X(b.x) + (b.x >= a.x ? 4 : -4)} y={(Y(a.y) + Y(b.y)) / 2 + 3} a={b.x >= a.x ? "start" : "end"} c="#c2410c" s={10}>{Math.abs(b.y - a.y)}</T></g>}
    {segments.map(([i, j]) => <line key={`${i}-${j}`} x1={X(points[i].x)} y1={Y(points[i].y)} x2={X(points[j].x)} y2={Y(points[j].y)} stroke="#2563a6" strokeWidth="2.4" />)}
    {points.map(p => <g key={p.name}><circle cx={X(p.x)} cy={Y(p.y)} r="4" fill={p.name === "O" ? "#33413b" : "#2563a6"} /><T x={X(p.x) + 6} y={Y(p.y) - 6} a="start" c={ink} s={11}>{p.name}</T></g>)}
  </svg>;
}

/* ---------- Tangga bersandar ke tembok ---------- */
export function LadderView({ wall, base, ladder }: { wall: string; base: string; ladder: string }) {
  return <svg viewBox="0 0 260 200" className="w-full max-w-xs" role="img" aria-label={`Tangga ${plainMath(ladder)} bersandar ke tembok, kaki tangga ${plainMath(base)} dari tembok, tinggi di tembok ${wall === "?" ? "dicari" : plainMath(wall)}`}>
    <rect x="40" y="14" width="34" height="164" fill="#f1e3cf" stroke="#8a6b47" strokeWidth="1.5" />
    {[30, 56, 82, 108, 134, 160].map((y, k) => <path key={y} d={`M40 ${y}H74M${k % 2 ? 57 : 48} ${y}v${-16}`} stroke="#c9ad88" strokeWidth="1" />)}
    <line x1="10" x2="250" y1="178" y2="178" stroke="#5b7a3a" strokeWidth="3" />
    <path d="M74 166h12v12" fill="none" stroke="#e5484d" strokeWidth="1.5" />
    {/* tangga: dua kaki dan anak tangga */}
    <line x1="74" y1="34" x2="200" y2="178" stroke="#a15c1f" strokeWidth="4" strokeLinecap="round" />
    <line x1="80" y1="28" x2="208" y2="174" stroke="#a15c1f" strokeWidth="4" strokeLinecap="round" />
    {Array.from({ length: 8 }, (_, k) => { const t = (k + 1) / 9; return <line key={k} x1={74 + 126 * t} y1={34 + 144 * t} x2={80 + 128 * t} y2={28 + 146 * t} stroke="#c47a32" strokeWidth="2.5" />; })}
    <T x={58} y={102} c={col(wall)} a="end">{wall === "?" ? "?" : plainMath(wall)}</T>
    <T x={137} y={194} c={col(base)}>{plainMath(base)}</T>
    <T x={152} y={92} c={col(ladder)} a="start">{plainMath(ladder)}</T>
  </svg>;
}

/* ---------- Mengukur lebar sungai ---------- */
export function RiverView({ ab, ac }: { ab: string; ac: string }) {
  const pin = (x: number, y: number, name: string, shirt: string) => <g key={name}><circle cx={x} cy={y - 18} r="6" fill="#f2c9a0" stroke="#7a5230" /><path d={`M${x - 7} ${y}l3 -12h8l3 12z`} fill={shirt} /><T x={x} y={y + 13} c={ink} s={10}>{name}</T></g>;
  return <svg viewBox="0 0 280 200" className="w-full max-w-sm" role="img" aria-label={`Sungai. Humam dan Arjuna di satu tepi berjarak ${ab}, Aldo di seberang tepat di depan Arjuna, jarak Humam ke Aldo ${ac}`}>
    <rect x="0" y="60" width="280" height="80" fill="#cfe6f7" />
    {[80, 100, 120].map(y => <path key={y} d={`M10 ${y}q15 -6 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0`} fill="none" stroke="#8cbde3" strokeWidth="1.3" />)}
    <rect x="0" y="0" width="280" height="60" fill="#e7f0dc" /><rect x="0" y="140" width="280" height="60" fill="#e7f0dc" />
    <line x1="60" y1="164" x2="200" y2="164" stroke={blue} strokeWidth="2" />
    <line x1="200" y1="164" x2="200" y2="40" stroke="#c2410c" strokeWidth="2" strokeDasharray="5 3" />
    <line x1="60" y1="164" x2="200" y2="40" stroke={blue} strokeWidth="2" />
    <path d="M188 164v-12h12" fill="none" stroke="#e5484d" strokeWidth="1.5" />
    {pin(60, 164, "Humam", "#2b8a3e")}{pin(200, 164, "Arjuna", "#1c64b5")}{pin(200, 40, "Aldo", "#c2410c")}
    <T x={130} y={158}>{ab}</T><T x={118} y={96} a="end">{ac}</T><T x={208} y={104} a="start" c={red}>lebar ?</T>
  </svg>;
}

/* ---------- Dua perahu di laut ---------- */
export function BoatsView({ shore, gap }: { shore: string; gap: string }) {
  const boat = (x: number, y: number, c: string, name: string) => <g key={name}><path d={`M${x - 16} ${y}h32l-6 8h-20z`} fill={c} /><path d={`M${x} ${y}v-18l12 14h-12`} fill="#fff" stroke={c} strokeWidth="1" /><T x={x} y={y + 22} c={ink} s={10}>{name}</T></g>;
  return <svg viewBox="0 0 280 210" className="w-full max-w-sm" role="img" aria-label={`Aldo di pantai. Perahu nelayan ${shore} di depannya, perahu wisata ${gap} dari perahu nelayan secara tegak lurus`}>
    <rect width="280" height="170" fill="#dcefff" /><rect y="170" width="280" height="40" fill="#f3e2b6" />
    <line x1="60" y1="180" x2="60" y2="40" stroke={blue} strokeWidth="2" />
    <line x1="60" y1="40" x2="220" y2="40" stroke={blue} strokeWidth="2" />
    <line x1="60" y1="180" x2="220" y2="40" stroke="#c2410c" strokeWidth="2" strokeDasharray="5 3" />
    <path d="M60 52h12v-12" fill="none" stroke="#e5484d" strokeWidth="1.5" />
    <circle cx="60" cy="180" r="5" fill="#2b8a3e" /><T x={60} y={200} c={ink} s={10}>Aldo</T>
    {boat(60, 36, "#1c64b5", "Nelayan")}{boat(220, 36, "#c2410c", "Wisata")}
    <T x={52} y={114} a="end">{shore}</T><T x={140} y={58}>{gap}</T><T x={150} y={124} c={red} a="start">?</T>
  </svg>;
}

/* ---------- Radar dan dua pesawat ---------- */
export function RadarView({ ab, ac, ad }: { ab: string; ac: string; ad: string }) {
  const plane = (x: number, y: number, k: string) => <g key={k} transform={`translate(${x} ${y})`}><path d="M-14 0h28l4 -3h-4l-10 -1l-6 -7h-3l3 7h-10l-3 -4h-3l2 5z" fill="#33413b" /></g>;
  return <svg viewBox="0 0 280 230" className="w-full max-w-sm" role="img" aria-label={`Radar A berjarak ${ab} dari kapal induk B. Pesawat C berjarak ${ac} dan pesawat D berjarak ${ad} dari radar, keduanya tepat di atas kapal induk`}>
    <rect width="280" height="230" fill="#eef6ff" /><rect y="196" width="280" height="34" fill="#9cc8ea" />
    <line x1="40" y1="196" x2="220" y2="196" stroke={blue} strokeWidth="2" />
    <line x1="220" y1="196" x2="220" y2="24" stroke="#33413b" strokeWidth="1.6" strokeDasharray="4 3" />
    <line x1="40" y1="196" x2="220" y2="140" stroke={blue} strokeWidth="2" /><line x1="40" y1="196" x2="220" y2="40" stroke="#c2410c" strokeWidth="2" />
    <path d="M208 196v-12h12" fill="none" stroke="#e5484d" strokeWidth="1.5" />
    <path d="M28 196l12 -16l12 16z" fill="#5b6b64" /><path d="M34 176a8 8 0 0 1 12 0" fill="none" stroke="#5b6b64" strokeWidth="2" />
    <path d="M190 200h60l-8 10h-46z" fill="#5b6b64" /><rect x="214" y="190" width="14" height="10" fill="#5b6b64" />
    {plane(220, 140, "c")}{plane(220, 40, "d")}
    <T x={30} y={172} c={ink} s={11}>A</T><T x={232} y={196} c={ink} s={11} a="start">B</T><T x={240} y={144} c={ink} s={11} a="start">C</T><T x={240} y={44} c={ink} s={11} a="start">D</T>
    <T x={130} y={214} c={ink}>{ab}</T><T x={130} y={160}>{ac}</T><T x={122} y={104} c="#c2410c">{ad}</T>
  </svg>;
}

/* ---------- Tiang antena dengan kawat penyangga ---------- */
export function AntennaView({ pole, ground }: { pole: string; ground: string }) {
  return <svg viewBox="0 0 280 210" className="w-full max-w-sm" role="img" aria-label={`Tiang antena ${pole}, kawat penyangga dipasang pada tiga perempat tinggi tiang dan diikat ${ground} dari kaki tiang. Tembok trapesium sama kaki dengan sisi miring 4 m dan sudut alas 60°`}>
    <path d="M10 150l60 -36l60 36z" fill="#c2410c" opacity=".85" /><rect x="22" y="150" width="96" height="40" fill="#f1e3cf" stroke="#8a6b47" />
    <line x1="70" y1="114" x2="70" y2="14" stroke="#33413b" strokeWidth="3" />
    {[24, 38, 52].map((y, k) => <line key={y} x1={70 - 16 + k * 3} x2={70 + 16 - k * 3} y1={y} y2={y} stroke="#33413b" strokeWidth="2" />)}
    <line x1="70" y1="39" x2="250" y2="114" stroke={blue} strokeWidth="1.8" />
    <line x1="70" y1="114" x2="250" y2="114" stroke="#5b6b64" strokeWidth="1.5" strokeDasharray="5 3" />
    <path d="M82 114v-12h-12" fill="none" stroke="#e5484d" strokeWidth="1.5" />
    <circle cx="70" cy="39" r="3" fill={blue} /><circle cx="250" cy="114" r="3" fill={blue} />
    <T x={62} y={70} a="end" c={ink} s={11}>{`tiang ${pole}`}</T><T x={160} y={130} c={ink} s={11}>{ground}</T><T x={170} y={66} c={red}>kawat ?</T>
    <T x={78} y={34} a="start" c={ink} s={9}>3/4 tinggi</T>
    {/* tembok pembatas: trapesium sama kaki, sisi miring 4 m, sudut alas 60° */}
    <path d="M150 200l20 -34h56l20 34z" fill="#e7d9c4" stroke="#8a6b47" strokeWidth="1.5" />
    <line x1="170" y1="166" x2="170" y2="200" stroke={red} strokeWidth="1.3" strokeDasharray="3 2" />
    <T x={150} y={180} a="end" c={ink} s={9}>4 m</T><T x={166} y={196} a="end" c={ink} s={8}>60°</T><T x={174} y={188} a="start" c={red} s={9}>tinggi ?</T>
    <T x={198} y={160} c={ink} s={9}>tembok</T>
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "fig": return <figure className="flex w-full max-w-xs flex-col items-center gap-1"><FigView fig={scene.fig} className="w-full max-w-60 overflow-visible px-6" label={scene.caption ?? `Segitiga ${(scene.fig.labels ?? []).join("")} dengan sisi ${(scene.fig.sides ?? []).filter(Boolean).join(", ")}`} />{scene.caption && <figcaption className="text-sm font-semibold">{scene.caption}</figcaption>}</figure>;
    case "figs": return <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">{scene.items.map(it => <figure key={it.caption} className="flex flex-col items-center gap-1 rounded-lg bg-base-100 p-2"><FigView fig={it.fig} className="w-full max-w-44 overflow-visible px-6" label={`Gambar ${it.caption}, sisi ${(it.fig.sides ?? []).filter(Boolean).join(", ")}`} /><figcaption className="text-sm font-semibold">{it.caption}</figcaption></figure>)}</div>;
    case "grid": return <GridView points={scene.points} segments={scene.segments} legs={scene.legs} />;
    case "ladder": return <LadderView wall={scene.wall} base={scene.base} ladder={scene.ladder} />;
    case "river": return <RiverView ab={scene.ab} ac={scene.ac} />;
    case "boats": return <BoatsView shore={scene.shore} gap={scene.gap} />;
    case "radar": return <RadarView ab={scene.ab} ac={scene.ac} ad={scene.ad} />;
    case "antenna": return <AntennaView pole={scene.pole} ground={scene.ground} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
