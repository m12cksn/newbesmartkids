import type { ReactNode } from "react";
import { thingName, type Group, type Thing } from "@/data/grade-one-counting-10";

const ink = "#2b2320";
const s = { stroke: ink, strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/* ---------- Benda (SVG buatan sendiri, viewBox 24 × 24) ---------- */
const art: Record<Thing, (alt?: boolean) => ReactNode> = {
  apel: alt => <><path d="M12 7.5c-3.5-2.6-8.6-.6-8 5.3.5 5.5 4.6 8.9 8 7 3.4 1.9 7.5-1.5 8-7 .6-5.9-4.5-7.9-8-5.3z" fill={alt ? "#7cc04a" : "#e23d3d"} {...s} /><path d="M12 7.5c0-2 .8-3.6 2-4.6" stroke="#6b4423" strokeWidth="1.4" fill="none" strokeLinecap="round" /><path d="M13.5 5c2-1.7 4.4-1.4 5.3-.8-1 1.7-3.4 2.4-5.3.8z" fill="#3f9b45" {...s} /><ellipse cx="8.2" cy="11" rx="1.2" ry="2" fill="#fff" opacity=".45" /></>,
  jeruk: () => <><circle cx="12" cy="13.5" r="8" fill="#f59e0b" {...s} /><path d="M12 5.6c.6-1.6 2.6-2.6 4.4-2-.5 1.8-2.4 2.6-4.4 2z" fill="#3f9b45" {...s} />{[[9, 11], [14, 10], [16, 15], [10, 16], [12.5, 13]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r=".45" fill="#c76b06" />)}<path d="M11.4 5.8l.6.4" stroke="#6b4423" strokeWidth="1.2" /></>,
  mangga: () => <><path d="M5 14.5C4 8.5 10 3.8 15.6 5.2c4.8 1.2 5.6 7.6 2 11.6-3.4 3.8-11.6 4.4-12.6-2.3z" fill="#f2b632" {...s} /><path d="M5.6 12.4c1-4.6 5.6-7 9.4-6.2" stroke="#7cc04a" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".85" /><path d="M15.4 5.3c.4-1.4 1.6-2.3 3-2.4" stroke="#6b4423" strokeWidth="1.3" fill="none" strokeLinecap="round" /><circle cx="15" cy="15" r="2.6" fill="#e5602c" opacity=".55" /></>,
  rambutan: () => <><circle cx="12" cy="12.5" r="6.4" fill="#c81e3a" {...s} />{Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * 2 * Math.PI, x1 = 12 + Math.cos(a) * 6.2, y1 = 12.5 + Math.sin(a) * 6.2, x2 = 12 + Math.cos(a + 0.25) * 9, y2 = 12.5 + Math.sin(a + 0.25) * 9; return <path key={i} d={`M${x1} ${y1}Q${12 + Math.cos(a) * 8.6} ${12.5 + Math.sin(a) * 8.6} ${x2} ${y2}`} stroke={i % 2 ? "#7a9a2e" : "#c81e3a"} strokeWidth="1.1" fill="none" strokeLinecap="round" />; })}<ellipse cx="10" cy="10.5" rx="1.4" ry="1" fill="#fff" opacity=".35" /></>,
  salak: () => <><path d="M12 3.2c3.3 3.2 7 7.4 7 11.3 0 3.8-3.2 6.3-7 6.3s-7-2.5-7-6.3c0-3.9 3.7-8.1 7-11.3z" fill="#8a4b20" {...s} />{[[9, 10], [12, 9], [15, 10], [8, 13.5], [11, 13], [14, 13], [16.5, 14], [9.5, 16.8], [12.5, 16.5], [15, 17.2]].map(([x, y], i) => <path key={i} d={`M${x - 1.2} ${y}l1.2 1.6 1.2-1.6`} stroke="#d39a63" strokeWidth=".8" fill="none" />)}</>,
  balon: alt => <><path d="M12 2.8c4 0 6.4 3.2 6.4 6.8 0 4.4-3.4 7.8-6.4 8.2-3-.4-6.4-3.8-6.4-8.2 0-3.6 2.4-6.8 6.4-6.8z" fill={alt ? "#3b82f6" : "#c026d3"} {...s} /><path d="M11 17.8h2l-1 1.4z" fill={alt ? "#3b82f6" : "#c026d3"} {...s} /><path d="M12 19.2c-1.2 1.4 1.2 2 0 3.6" stroke={ink} strokeWidth=".8" fill="none" /><ellipse cx="9.6" cy="7" rx="1.2" ry="2" fill="#fff" opacity=".5" /></>,
  layang: () => <><path d="M12 2.5l7 7.5-7 9.5-7-9.5z" fill="#f2b632" {...s} /><path d="M12 2.5l7 7.5H5z" fill="#3aa0d8" {...s} /><path d="M12 2.5v17M5 10h14" stroke={ink} strokeWidth=".8" /><path d="M12 19.5c-1 1-1 2 0 3" stroke={ink} strokeWidth=".8" fill="none" /><path d="M10.6 20.6l1.4.6-1.4.6zM13.4 20.6l-1.4.6 1.4.6z" fill="#3aa0d8" stroke={ink} strokeWidth=".5" /></>,
  pensil: () => <g transform="rotate(40 12 12)"><rect x="9.4" y="1.5" width="5.2" height="15" rx=".6" fill="#3b82f6" {...s} /><rect x="9.4" y="1.5" width="5.2" height="2.2" fill="#f2a4b6" {...s} /><path d="M9.4 16.5h5.2L12 22z" fill="#f3d3a4" {...s} /><path d="M11.2 20.2h1.6L12 22z" fill={ink} /></g>,
  buku: () => <><path d="M4.5 5h12.5a2 2 0 012 2v13H6.5a2 2 0 01-2-2z" fill="#22a05a" {...s} /><path d="M6.5 18h12.5v2H6.5a1 1 0 010-2z" fill="#fff" {...s} /><rect x="8.5" y="8" width="7" height="3" rx=".5" fill="#c7efd5" /><path d="M7 5v13" stroke="#167a42" strokeWidth=".8" /></>,
  penghapus: () => <g transform="rotate(-20 12 12)"><rect x="4" y="8" width="16" height="8" rx="1.6" fill="#f4f6f8" {...s} /><rect x="10" y="7.6" width="10.4" height="8.8" rx="1" fill="#2f86d6" {...s} /><path d="M12.5 10h5.5" stroke="#bfe0f7" strokeWidth="1" /></g>,
  penggaris: () => <g transform="rotate(-35 12 12)"><rect x="1" y="8.6" width="22" height="6.8" rx=".8" fill="#9fd3f2" {...s} />{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${3 + i * 2} 8.6v${i % 2 ? 1.6 : 2.8}`} stroke={ink} strokeWidth=".6" />)}</g>,
  bola: () => <><circle cx="12" cy="12" r="8.6" fill="#fff" {...s} /><path d="M12 3.4c-3.6 2.2-5 5.6-4.6 8.6l-4.6 1.2A8.6 8.6 0 0112 3.4z" fill="#e23d3d" /><path d="M12 3.4c3 2.6 3.6 6 3 8.8l5.4 1.4A8.6 8.6 0 0012 3.4z" fill="#f2b632" /><path d="M7.4 12c.6 3.4 2.8 6.2 6 8.4A8.6 8.6 0 013 13.2z" fill="#2f86d6" /><path d="M15 12.2c-.4 3.2-1.4 6-1.6 8.2a8.6 8.6 0 007-6.8z" fill="#22a05a" /><circle cx="12" cy="12" r="8.6" fill="none" {...s} /></>,
  kelereng: alt => <><circle cx="12" cy="12" r="6.4" fill={alt ? "#22a05a" : "#e23d3d"} {...s} /><path d="M8.4 13.4c2-2.8 5.2-3.6 7.4-2.2" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".55" /><circle cx="9.6" cy="9.4" r="1.5" fill="#fff" opacity=".75" /></>,
  mobil: alt => <><path d="M3 14.5v-2.6l2.4-.6 2.6-3.8h7.4l3.2 3.8 2.4.6v2.6z" fill={alt ? "#2f86d6" : "#e23d3d"} {...s} /><path d="M8.8 8.3h3v3H6.6zM13 8.3h2.2l2.4 3H13z" fill="#d6eefb" {...s} /><circle cx="7.4" cy="15.2" r="2.2" fill="#3a3a3a" {...s} /><circle cx="16.6" cy="15.2" r="2.2" fill="#3a3a3a" {...s} /><circle cx="7.4" cy="15.2" r=".8" fill="#ccc" /><circle cx="16.6" cy="15.2" r=".8" fill="#ccc" /><rect x="19.6" y="12" width="1.4" height="1" fill="#fde68a" /></>,
  boneka: () => <><ellipse cx="9.2" cy="5.6" rx="1.6" ry="4.2" fill="#f28db2" {...s} /><ellipse cx="14.8" cy="5.6" rx="1.6" ry="4.2" fill="#f28db2" {...s} /><ellipse cx="9.2" cy="6" rx=".7" ry="2.8" fill="#fbd0e0" /><ellipse cx="14.8" cy="6" rx=".7" ry="2.8" fill="#fbd0e0" /><ellipse cx="12" cy="18" rx="5.2" ry="4.4" fill="#f28db2" {...s} /><circle cx="12" cy="11.6" r="4.4" fill="#f28db2" {...s} /><circle cx="10.4" cy="11" r=".6" fill={ink} /><circle cx="13.6" cy="11" r=".6" fill={ink} /><path d="M11.4 12.8l.6.5.6-.5" stroke={ink} strokeWidth=".6" fill="none" /><ellipse cx="12" cy="18.6" rx="2.4" ry="2" fill="#fbd0e0" /></>,
  pesawat: () => <><path d="M2.5 12.4c0-1 1-1.8 2.2-1.8h13.6c1.8 0 3.4.8 3.4 1.8s-1.6 1.8-3.4 1.8H4.7c-1.2 0-2.2-.8-2.2-1.8z" fill="#2f86d6" {...s} /><path d="M9.6 10.6L12.4 4h2l-1 6.6zM9.6 14.2l2.8 5.8h2l-1-5.8z" fill="#f2b632" {...s} /><path d="M3 10.8L2 7.6h1.6l2.2 3z" fill="#f2b632" {...s} />{[13, 15, 17].map(x => <circle key={x} cx={x} cy="12" r=".55" fill="#fff" />)}</>,
  donat: () => <><circle cx="12" cy="12" r="8.4" fill="#e3a868" {...s} /><path d="M4.4 11c1-4.4 5-6.6 8.8-6.2 4 .4 6.8 3.2 6.6 7-.4-1-1.6-.8-2.2.2-.6-1-1.8-1-2.4.2-.8-1.2-2-1.2-2.8 0-.8-1-2-1-2.8 0-.8-1-2-1-2.6.2-.6-1-1.6-1-2.6-1.4z" fill="#6b3a1f" {...s} /><circle cx="12" cy="12" r="2.8" fill="#fff" {...s} />{[[8, 8, "#f2b632"], [12, 6.4, "#3aa0d8"], [16, 8.4, "#f28db2"], [9.6, 10.6, "#fff"], [15, 11, "#7cc04a"]].map(([x, y, c], i) => <rect key={i} x={Number(x)} y={Number(y)} width="1.4" height=".6" rx=".3" fill={String(c)} transform={`rotate(${i * 37} ${x} ${y})`} />)}</>,
  bolu: () => <><path d="M5 13h14l-1.6 7.4H6.6z" fill="#f6a6c1" {...s} /><path d="M8 13l.6 7.4M12 13v7.4M16 13l-.6 7.4" stroke="#d36d93" strokeWidth=".7" /><path d="M4.4 13c0-4.6 3.4-8 7.6-8s7.6 3.4 7.6 8z" fill="#c9783a" {...s} /><path d="M8.4 8.4l7 4M15.6 8.4l-7 4" stroke="#8a4b20" strokeWidth="1" /></>,
  sepeda: () => <><circle cx="6" cy="15" r="4" fill="none" stroke="#3a3a3a" strokeWidth="1.6" /><circle cx="18" cy="15" r="4" fill="none" stroke="#3a3a3a" strokeWidth="1.6" /><path d="M6 15l4-6.4h6.4L18 15M10 8.6L12.4 15h-6.4M16.4 8.6l-4 6.4" stroke="#9b3fc4" strokeWidth="1.5" fill="none" strokeLinejoin="round" /><path d="M8.4 7.4h3.2M15.6 6.4l1.6-.6v2" stroke={ink} strokeWidth="1.3" fill="none" strokeLinecap="round" /></>,
  burung: () => <><path d="M4 13.6c0-3.4 3-5.8 6.6-5.8 2 0 3.4.8 4.2 1.8l3.6-1.2-1.6 3c.6 3.6-2.4 7-7 7-3.4 0-5.8-1.8-5.8-4.8z" fill="#9a5a3a" {...s} /><path d="M7.6 11.6c2-.6 4.6.2 5.6 2.4-2.2.8-4.6.4-5.6-2.4z" fill="#6b3a1f" {...s} /><path d="M4 12.6l-2.2-.4 2 1.6" fill="#f2a24a" {...s} /><circle cx="6.4" cy="11.4" r=".6" fill={ink} /><path d="M7 14.6c1.4 1.4 3.4 1.8 5 1.4" stroke="#f2c49a" strokeWidth="1.4" fill="none" strokeLinecap="round" /></>,
  kursi: () => <><rect x="7" y="3" width="10" height="7" rx="1" fill="#9a5a2e" {...s} /><path d="M8 10v4M16 10v4" stroke="#9aa0a6" strokeWidth="1.4" /><rect x="5.4" y="13" width="13.2" height="2.6" rx=".6" fill="#b06a35" {...s} /><path d="M6.6 15.6v6M17.4 15.6v6M9 15.6v4.6M15 15.6v4.6" stroke="#9aa0a6" strokeWidth="1.4" strokeLinecap="round" /></>,
  kubus: () => <><path d="M12 3l8 4.4v9.2L12 21l-8-4.4V7.4z" fill="#e08a2a" {...s} /><path d="M4 7.4L12 12l8-4.6L12 3z" fill="#f6b25a" {...s} /><path d="M12 12v9" stroke={ink} strokeWidth="1" /><path d="M12 12l8-4.6v9.2L12 21z" fill="#b8681a" {...s} /></>,
};
export function ThingIcon({ thing, alt = false, className = "size-8" }: { thing: Thing; alt?: boolean; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{art[thing](alt)}</svg>;
}

/** Sekelompok benda tersusun rapi (5 per baris). `split` memberi warna kedua mulai benda ke-(split+1). */
export function Objects({ g, size: sizeIn = "size-8", label }: { g: Group; size?: string; label?: string }) {
  let size = sizeIn;
  if (g.n === 0) return <span role="img" aria-label={label ?? "keranjang kosong"} className="inline-grid place-items-center"><Basket /></span>;
  if (g.split !== undefined && g.split > 0 && g.split < g.n) return <span role="img" aria-label={label ?? `${g.n} ${thingName[g.thing]}: ${g.split} dan ${g.n - g.split}`} className="inline-flex items-center gap-5">
    {[g.split, g.n - g.split].map((m, j) => <span key={j} className="flex max-w-36 flex-wrap justify-center gap-0.5">{Array.from({ length: m }, (_, k) => <ThingIcon key={k} thing={g.thing} alt={j === 1} className={size} />)}</span>)}
  </span>;
  if (g.big) size = "size-12";
  const perRow = g.n > 6 ? 5 : g.n === 6 ? 3 : g.n;
  return <span role="img" aria-label={label ?? `${g.n} ${thingName[g.thing]}`} className="inline-flex flex-col items-center gap-0.5">
    {Array.from({ length: Math.ceil(g.n / perRow) }, (_, r) => <span key={r} className="flex gap-0.5">
      {Array.from({ length: Math.min(perRow, g.n - r * perRow) }, (_, k) => { const i = r * perRow + k; return <ThingIcon key={k} thing={g.thing} alt={g.split !== undefined && i >= g.split} className={size} />; })}
    </span>)}
  </span>;
}
export function Basket({ balls = 0 }: { balls?: number }) {
  return <svg viewBox="0 0 64 44" className="h-11 w-16" aria-hidden="true">
    <path d="M6 16h52l-5 24H11z" fill="#d9a35b" stroke="#8a5a24" strokeWidth="1.5" strokeLinejoin="round" />
    {[22, 30].map(y => <path key={y} d={`M8 ${y}h48`} stroke="#b07a35" strokeWidth="1.2" />)}
    <path d="M4 16h56" stroke="#8a5a24" strokeWidth="3" strokeLinecap="round" />
    {Array.from({ length: balls }, (_, i) => <circle key={i} cx={12 + (i % 5) * 10} cy={12 - Math.floor(i / 5) * 6} r="4.4" fill={["#e23d3d", "#f2b632", "#2f86d6"][i % 3]} stroke="#2b2320" strokeWidth=".8" />)}
  </svg>;
}

/* ---------- Bingkai 10 ---------- */
export function TenFrame({ n, size = 22, label }: { n: number; size?: number; label?: string }) {
  return <svg viewBox={`0 0 ${5 * size + 2} ${2 * size + 2}`} width={5 * size + 2} height={2 * size + 2} role="img" aria-label={label ?? `Bingkai 10 berisi ${n} bulatan`}>
    {Array.from({ length: 10 }, (_, i) => { const x = 1 + (i % 5) * size, y = 1 + Math.floor(i / 5) * size;
      return <g key={i}><rect x={x} y={y} width={size} height={size} fill="#fff" stroke="#5b5b5b" strokeWidth="1" />{i < n && <circle cx={x + size / 2} cy={y + size / 2} r={size * 0.36} fill="#e23d3d" />}</g>; })}
  </svg>;
}

/* ---------- Tangan dengan jari terangkat (0-5) ---------- */
// Urutan mengangkat jari seperti di buku: telunjuk, tengah, manis, kelingking, lalu ibu jari.
const order = [1, 2, 3, 4, 0];
export function Hand({ up, flip = false, onToggle, size = 64 }: { up: number | boolean[]; flip?: boolean; onToggle?: (finger: number) => void; size?: number }) {
  const raised = Array.isArray(up) ? up : [0, 1, 2, 3, 4].map(f => order.indexOf(f) < up);
  // Jari: telunjuk, tengah, manis, kelingking (dari kanan ke kiri pada tangan kanan).
  const fingers = [{ x: 30, w: 8.5, top: 10 }, { x: 21, w: 8.5, top: 5 }, { x: 12, w: 8.5, top: 9 }, { x: 4, w: 7.5, top: 17 }];
  const skin = "#f6c7a1", fold = "#eab08a", line = "#a8714d";
  const tap = (k: number, x: number, y: number, w: number, h: number, name: string) => onToggle && <rect x={x} y={y} width={w} height={h} fill="transparent" className="cursor-pointer" role="button" tabIndex={0} aria-pressed={raised[k]} aria-label={`${name} ${flip ? "kiri" : "kanan"}`}
    onClick={() => onToggle(k)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(k); } }} />;
  return <svg viewBox="0 0 52 84" width={size * 0.62} height={size} className={flip ? "-scale-x-100" : ""} role={onToggle ? "group" : "img"} aria-label={`${raised.filter(Boolean).length} jari terangkat`}>
    {fingers.map((f, k) => raised[k + 1] && <g key={k}><rect x={f.x} y={f.top} width={f.w} height={50 - f.top} rx={f.w / 2} fill={skin} stroke={line} strokeWidth="1.1" />
      <path d={`M${f.x + 1.8} ${f.top + 4}h${f.w - 3.6}`} stroke="#fde3cf" strokeWidth="2" strokeLinecap="round" /><path d={`M${f.x + 2} ${f.top + 22}h${f.w - 4}`} stroke={line} strokeWidth=".7" opacity=".6" /></g>)}
    {raised[0] && <rect x="38" y="44" width="9" height="24" rx="4.5" fill={skin} stroke={line} strokeWidth="1.1" transform="rotate(40 42 64)" />}
    <path d="M3 46c0-3 2-5 5-5h29c3 0 5 2 5 5v18c0 10-7 17-17 17h-4C10 81 3 74 3 64z" fill={skin} stroke={line} strokeWidth="1.1" />
    {fingers.map((f, k) => !raised[k + 1] && <rect key={k} x={f.x} y="40" width={f.w} height="10" rx={f.w / 2} fill={fold} stroke={line} strokeWidth="1" />)}
    {!raised[0] && <path d="M41 52c-6-1-12 1-15 5" stroke={line} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
    {fingers.map((f, k) => <g key={`t${k}`}>{tap(k + 1, f.x - 1, 0, f.w + 2, 52, ["Jari telunjuk", "Jari tengah", "Jari manis", "Jari kelingking"][k])}</g>)}
    {tap(0, 36, 44, 16, 28, "Ibu jari")}
  </svg>;
}
export function Hands({ fingers, size = 64 }: { fingers: number[]; size?: number }) {
  return <span role="img" aria-label={`Tangan menunjukkan ${fingers.join(" dan ")} jari`} className="inline-flex items-end gap-1">{fingers.map((f, i) => <Hand key={i} up={f} flip={i === 0 && fingers.length > 1} size={size} />)}</span>;
}

/* ---------- Daun dan ulat untuk urutan bilangan ---------- */
export function Leaf({ children, empty }: { children: ReactNode; empty?: boolean }) {
  return <span className="relative inline-grid h-14 w-20 place-items-center">
    <svg viewBox="0 0 80 56" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M4 30C18 6 52 2 76 12 66 40 34 56 4 30z" fill={empty ? "#ffffff" : "#3f9b45"} stroke="#2f7a35" strokeWidth="2" /><path d="M8 30C30 24 52 18 72 13" stroke={empty ? "#a7d7ab" : "#2f7a35"} strokeWidth="1.5" fill="none" /></svg>
    <span className={`relative text-2xl font-extrabold ${empty ? "" : "text-white"}`}>{children}</span>
  </span>;
}
export function Segment({ children, empty, head }: { children: ReactNode; empty?: boolean; head?: boolean }) {
  return <span className="relative inline-grid size-14 shrink-0 place-items-center">
    <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <path d="M14 46l-3 8M42 46l3 8" stroke="#e23d3d" strokeWidth="4" strokeLinecap="round" />
      <circle cx="28" cy="28" r="24" fill={head ? "#7cc04a" : empty ? "#ffffff" : "#eaf6df"} stroke="#5d9c36" strokeWidth="3" />
      {head && <><circle cx="20" cy="24" r="4" fill="#fff" stroke="#2b2320" /><circle cx="36" cy="24" r="4" fill="#fff" stroke="#2b2320" /><circle cx="21" cy="25" r="1.6" fill="#2b2320" /><circle cx="37" cy="25" r="1.6" fill="#2b2320" /><path d="M21 36c4 4 10 4 14 0" stroke="#2b2320" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M20 6l-4-6M36 6l4-6" stroke="#5d9c36" strokeWidth="3" strokeLinecap="round" /></>}
    </svg>
    {!head && <span className="relative text-xl font-extrabold">{children}</span>}
  </span>;
}

/* ---------- Tangga balok ---------- */
export function Stairs({ at, label }: { at: number; label?: string }) {
  const u = 13, W = 10 * 26 + 10;
  return <svg viewBox={`0 0 ${W} ${10 * u + 50}`} className="w-full max-w-md" role="img" aria-label={label ?? `Tangga balok, Upe di anak tangga ${at}`}>
    {Array.from({ length: 10 }, (_, i) => <g key={i}>{Array.from({ length: i + 1 }, (_, k) => <g key={k}><rect x={8 + i * 26} y={10 * u + 14 - (k + 1) * u} width="20" height={u} fill={i + 1 <= at ? "#f2a33a" : "#f6d4a3"} stroke="#9a5a1e" strokeWidth="1" /></g>)}
      <circle cx={18 + i * 26} cy={10 * u + 32} r="9" fill={i + 1 === at ? "#f2a33a" : "#fff4e5"} stroke="#e08a2a" strokeWidth="1.5" /><text x={18 + i * 26} y={10 * u + 36} fontSize="11" fontWeight="800" textAnchor="middle" fill="#2b2320">{i + 1 <= at ? i + 1 : "…"}</text></g>)}
    {at > 0 && <g transform={`translate(${10 + (at - 1) * 26} ${10 * u + 14 - at * u - 30})`}>
      <circle cx="8" cy="6" r="5" fill="#f6c7a1" stroke="#2b2320" strokeWidth=".8" /><path d="M3 5c1-4 9-4 10 0" fill="#2b2320" /><rect x="4" y="11" width="8" height="9" rx="2" fill="#fff" stroke="#2b2320" strokeWidth=".8" /><path d="M8 12v5" stroke="#d32f2f" strokeWidth="1.6" /><rect x="4" y="19" width="8" height="5" fill="#c62828" /><path d="M5.5 24v5M10.5 24v5" stroke="#2b2320" strokeWidth="1.6" strokeLinecap="round" />
    </g>}
  </svg>;
}

/* ---------- Titik bintang 1-10 ---------- */
export const starPoints = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 26 : 62; return [80 + r * Math.cos(a), 74 + r * Math.sin(a)] as const; });
