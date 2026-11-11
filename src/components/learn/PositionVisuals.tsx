import { Hand } from "lucide-react";
import type { ReactNode } from "react";
import { objectArtNodes } from "@/components/illustrations/ObjectArt";
import { colorHex, scenes, type Art, type Mover, type Pos, type Ref, type SceneName, type SceneObj, type Token } from "@/data/grade-two-position-patterns";

export const ink = "#1f3b30";
const o = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/* ====================================================================== */
/* Gambar benda. Setiap gambar punya kotak gambar sendiri [lebar, tinggi]. */
/* ====================================================================== */
const art: Record<Art, { vb: [number, number]; node: (c?: string, label?: string) => ReactNode }> = {
  jam: { vb: [48, 48], node: () => objectArtNodes.clock },
  bingkai: { vb: [48, 48], node: () => objectArtNodes.frame },
  bola: { vb: [48, 48], node: () => objectArtNodes.ball },
  burung: { vb: [48, 48], node: () => objectArtNodes.bird },
  buku: { vb: [36, 20], node: () => <><path d="M2 6h28l4 4v8H6l-4-4z" fill="#2f86d6" {...o} /><path d="M2 6v8l4 4" fill="none" {...o} /><path d="M6 10h26" stroke="#fff" strokeWidth="2" /><path d="M8 2h22l2 4H6z" fill="#e5484d" {...o} /></> },
  lampu: { vb: [28, 44], node: () => <><path d="M6 40h16v3H6z" fill="#5b6470" {...o} /><path d="M14 40V22l-6-8" fill="none" stroke="#5b6470" strokeWidth="2.4" /><path d="M2 12L12 2l10 10-6 4z" fill="#f5c542" {...o} /></> },
  meja: { vb: [112, 80], node: () => <><rect x="2" y="2" width="108" height="10" rx="2" fill="#b7793f" {...o} /><path d="M8 12v66M104 12v66M20 12v52M92 12v52" stroke="#8a5528" strokeWidth="5" strokeLinecap="round" /></> },
  kursi: { vb: [46, 70], node: c => <><path d="M6 2h8v36H6z" fill={c ? colorHex[c] : "#c2783a"} {...o} /><rect x="4" y="34" width="38" height="8" rx="2" fill={c ? colorHex[c] : "#c2783a"} {...o} /><path d="M8 42v26M40 42v26M16 42v20M34 42v20" stroke={ink} strokeWidth="3" strokeLinecap="round" /></> },
  kotak: { vb: [42, 40], node: () => <><rect x="2" y="10" width="38" height="28" fill="#dcae74" {...o} /><path d="M2 10l6-8h26l6 8" fill="#c8955a" {...o} /><path d="M14 18h14" stroke="#8a5a2b" strokeWidth="2" /></> },
  kasur: { vb: [150, 72], node: () => <><path d="M138 4h8v66h-8zM4 26h6v44H4z" fill="#c2584a" {...o} /><rect x="8" y="24" width="132" height="22" rx="4" fill="#9ad8c0" {...o} /><rect x="8" y="44" width="132" height="8" fill="#c2584a" {...o} /><path d="M12 52v18M134 52v18" stroke="#8a3a2b" strokeWidth="4" /></> },
  boneka: { vb: [40, 40], node: () => <><circle cx="9" cy="7" r="5" fill="#b7793f" {...o} /><circle cx="31" cy="7" r="5" fill="#b7793f" {...o} /><circle cx="20" cy="14" r="11" fill="#c98a4b" {...o} /><ellipse cx="20" cy="31" rx="12" ry="9" fill="#c98a4b" {...o} /><circle cx="16" cy="12" r="1.5" fill={ink} /><circle cx="24" cy="12" r="1.5" fill={ink} /><ellipse cx="20" cy="17" rx="4" ry="3" fill="#f2d3a0" /></> },
  bantal: { vb: [44, 18], node: () => <path d="M3 4c12 3 26 3 38 0 2 4 2 8 0 12-12-3-26-3-38 0-2-4-2-8 0-12z" fill="#fdf6e3" {...o} /> },
  mobil: { vb: [44, 22], node: () => <><path d="M2 14l4-6h10l6-6h12l6 8h2v6H2z" fill="#e5484d" {...o} /><path d="M24 4h8l4 5H24z" fill="#bfe3f7" {...o} /><circle cx="11" cy="17" r="4" fill={ink} /><circle cx="33" cy="17" r="4" fill={ink} /></> },
  kucing: { vb: [36, 32], node: () => <><path d="M6 30c-2-8 0-14 8-16h12c4 2 6 8 4 16z" fill="#f2a64a" {...o} /><path d="M30 26c4 0 5-6 3-10" fill="none" stroke="#f2a64a" strokeWidth="3" strokeLinecap="round" /><circle cx="14" cy="12" r="9" fill="#f2a64a" {...o} /><path d="M6 8L5 1l6 4M22 8l1-7-6 4" fill="#f2a64a" {...o} /><circle cx="11" cy="11" r="1.4" fill={ink} /><circle cx="17" cy="11" r="1.4" fill={ink} /><path d="M12 15c1 1 3 1 4 0" fill="none" {...o} /></> },
  rumah: { vb: [176, 150], node: () => <><path d="M14 60h148v88H14z" fill="#f3dcb0" {...o} /><path d="M2 64L88 4l86 60z" fill="#b5523b" {...o} /><rect x="74" y="92" width="30" height="56" fill="#8a5528" {...o} /><circle cx="98" cy="122" r="2" fill="#f5c542" /><rect x="28" y="84" width="32" height="26" fill="#bfe3f7" {...o} /><rect x="118" y="84" width="32" height="26" fill="#bfe3f7" {...o} /><path d="M44 84v26M134 84v26" stroke={ink} strokeWidth="1.2" /></> },
  pohon: { vb: [120, 162], node: () => <><path d="M52 90h16v70H52z" fill="#8a5528" {...o} /><circle cx="60" cy="54" r="40" fill="#3fa16b" {...o} /><circle cx="30" cy="78" r="26" fill="#4bb179" {...o} /><circle cx="90" cy="78" r="26" fill="#4bb179" {...o} /></> },
  sepeda: { vb: [96, 62], node: () => <><circle cx="20" cy="42" r="17" fill="none" stroke={ink} strokeWidth="3" /><circle cx="76" cy="42" r="17" fill="none" stroke={ink} strokeWidth="3" /><path d="M20 42l18-24h30l8 24M38 18l12 24h-30M50 42l18-24M66 18l-4-12h10M34 12h10" fill="none" stroke="#8d63c7" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M32 10h12" stroke={ink} strokeWidth="4" strokeLinecap="round" /></> },
  bangku: { vb: [104, 46], node: () => <><rect x="2" y="2" width="100" height="10" rx="2" fill="#c2783a" {...o} /><rect x="2" y="14" width="100" height="8" rx="2" fill="#b7793f" {...o} /><path d="M10 22v22M94 22v22" stroke="#5b6470" strokeWidth="5" strokeLinecap="round" /></> },
  pot: { vb: [44, 52], node: c => <><path d="M22 26c-2-8-10-14-16-12 2 6 8 10 16 12zM22 26c2-8 10-14 16-12-2 6-8 10-16 12z" fill="#3fa16b" {...o} /><circle cx="22" cy="14" r="7" fill={c ? colorHex[c] : "#e5484d"} {...o} /><circle cx="22" cy="14" r="2.4" fill="#f5c542" /><path d="M6 28h32l-4 22H10z" fill="#c2584a" {...o} /><path d="M4 26h36v6H4z" fill="#a8473b" {...o} /></> },
  anak: { vb: [60, 160], node: (c, label) => <><circle cx="30" cy="22" r="16" fill="#f2c094" {...o} /><path d="M14 20c0-12 8-18 16-18s16 6 16 18c-6-4-14-6-22-4z" fill="#3b2a20" {...o} /><circle cx="24" cy="24" r="1.8" fill={ink} /><circle cx="36" cy="24" r="1.8" fill={ink} /><path d="M25 30c3 3 7 3 10 0" fill="none" {...o} /><path d="M12 44c6-4 30-4 36 0l4 52H8z" fill={c ?? "#2f86d6"} {...o} /><path d="M22 96v52M38 96v52" stroke="#3b4a5a" strokeWidth="8" strokeLinecap="round" />{label && <text x="30" y="70" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff">{label}</text>}</> },
};

function Placed({ ob, tap, picked }: { ob: SceneObj; tap?: (id: string) => void; picked?: string }) {
  const a = art[ob.art];
  const svg = <svg x={ob.x} y={ob.y} width={ob.w} height={ob.h} viewBox={`0 0 ${a.vb[0]} ${a.vb[1]}`} preserveAspectRatio="none" overflow="visible">{a.node(ob.color, ob.label)}</svg>;
  if (!tap) return svg;
  return <g role="button" tabIndex={0} aria-label={ob.name} aria-pressed={picked === ob.id} className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[#0b5d44]" onClick={() => tap(ob.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(ob.id); } }}>
    <rect x={ob.x - 4} y={ob.y - 4} width={ob.w + 8} height={ob.h + 8} rx="8" fill={picked === ob.id ? "#fde68a" : "transparent"} fillOpacity=".55" stroke={picked === ob.id ? "#c2410c" : "transparent"} strokeWidth="2.5" strokeDasharray="5 3" />
    {svg}
  </g>;
}
export function SceneView({ s, tap, picked, className = "w-full max-w-lg" }: { s: SceneName; tap?: (id: string) => void; picked?: string; className?: string }) {
  const sc = scenes[s], objs = [...sc.objs].sort((a, b) => a.z - b.z);
  const bg = s === "kamar" ? <><rect width="400" height="210" fill="#efe4f7" /><rect y="210" width="400" height="70" fill="#d8c3a5" /></>
    : s === "kursiWarna" ? <><rect width="400" height="220" fill="#eaf4fb" /><rect y="220" width="400" height="60" fill="#d8c3a5" /></>
      : <><rect width="400" height="200" fill="#dff1fb" /><rect y="200" width="400" height="80" fill="#a9d98b" /></>;
  return <svg viewBox="0 0 400 280" className={`rounded-xl ${className}`} role={tap ? "group" : "img"} aria-label={sc.title}>
    {bg}{objs.map(ob => <Placed key={ob.id} ob={ob} tap={tap} picked={picked} />)}
  </svg>;
}

/* ====================================================================== */
/* Pasangan: satu benda terhadap benda lain                                */
/* ====================================================================== */
const refBox: Record<Ref, { art: Art; x: number; y: number; w: number; h: number }> = {
  meja: { art: "meja", x: 50, y: 60, w: 100, h: 70 }, kursi: { art: "kursi", x: 78, y: 40, w: 46, h: 90 },
  kotak: { art: "kotak", x: 70, y: 76, w: 62, h: 56 }, sepeda: { art: "sepeda", x: 48, y: 70, w: 104, h: 64 },
};
export function PairView({ mover, target, pos, className = "w-full max-w-56" }: { mover: Mover; target: Ref; pos: Pos; className?: string }) {
  const r = refBox[target], m = mover === "bola" ? { art: "bola" as Art, w: 24, h: 24 } : { art: "kucing" as Art, w: 36, h: 32 };
  const cx = r.x + r.w / 2 - m.w / 2, floor = 134 - m.h;
  const top = target === "meja" ? r.y - m.h + 2 : target === "kursi" ? r.y + 36 - m.h : target === "sepeda" ? r.y + 6 - m.h : r.y + 10 - m.h;
  const p = { atas: { x: cx, y: top }, bawah: { x: cx, y: floor - 2 }, kanan: { x: r.x + r.w + 8, y: floor }, kiri: { x: r.x - m.w - 8, y: floor }, depan: { x: cx + 6, y: floor + 6 }, belakang: target === "kotak" ? { x: r.x + r.w - m.w * 0.9, y: r.y - m.h * 0.4 } : { x: cx - 4, y: r.y + r.h - m.h - 18 } }[pos];
  const scale = pos === "depan" ? 1.15 : pos === "belakang" ? 0.85 : 1;
  const mv = <svg x={p.x} y={p.y} width={m.w * scale} height={m.h * scale} viewBox={`0 0 ${art[m.art].vb[0]} ${art[m.art].vb[1]}`} overflow="visible">{art[m.art].node()}</svg>;
  const rf = <svg x={r.x} y={r.y} width={r.w} height={r.h} viewBox={`0 0 ${art[r.art].vb[0]} ${art[r.art].vb[1]}`} preserveAspectRatio="none" overflow="visible">{art[r.art].node()}</svg>;
  return <svg viewBox="0 0 200 150" className={className} role="img" aria-label={`${mover === "bola" ? "Bola" : "Kucing"} dan ${target}`}>
    <rect width="200" height="150" rx="10" fill="#f3f7f4" /><path d="M0 134h200" stroke="#c9d6cf" strokeWidth="2" />
    {pos === "belakang" ? <>{mv}{rf}</> : <>{rf}{mv}</>}
  </svg>;
}

/* ====================================================================== */
/* Token pola                                                              */
/* ====================================================================== */
const shapePath: Record<string, string> = {
  circle: "M20 4a16 16 0 1 1 0 32a16 16 0 1 1 0-32z", triangle: "M20 4l17 30H3z", square: "M5 5h30v30H5z", diamond: "M20 3l15 17-15 17L5 20z",
  pentagon: "M20 3l16 12-6 20H10L4 15z", hexagon: "M11 4h18l9 16-9 16H11L2 20z", heart: "M20 35C8 26 3 20 3 13c0-5 4-9 9-9 4 0 6 2 8 5 2-3 4-5 8-5 5 0 9 4 9 9 0 7-5 13-17 22z",
  star: "M20 3l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z", moon: "M26 4a16 16 0 1 0 10 26A13 13 0 1 1 26 4z", cloud: "M10 30a7 7 0 0 1-1-14 9 9 0 0 1 17-4 8 8 0 0 1 8 10 6 6 0 0 1-2 8z",
  leaf: "M6 34C6 16 16 6 34 6c0 18-10 28-28 28zM6 34L24 16", flower: "M20 14a5 5 0 1 1 6 5 5 5 0 1 1-2 7 5 5 0 1 1-8 0 5 5 0 1 1-2-7 5 5 0 1 1 6-5z",
};
function Pose({ kind }: { kind: string }) {
  const body = kind === "atas" ? <><circle cx="20" cy="9" r="5" fill="#f2c094" {...o} /><path d="M14 16h12v12H14z" fill="#2f86d6" {...o} /><path d="M14 17L8 4M26 17l6-13M17 28v10M23 28v10" stroke={ink} strokeWidth="2.6" strokeLinecap="round" /></>
    : kind === "bungkuk" ? <><circle cx="9" cy="18" r="5" fill="#f2c094" {...o} /><path d="M13 16l14-2 2 10-14 2z" fill="#2f86d6" {...o} /><path d="M14 24l-2 10M27 22v16M22 24v14" stroke={ink} strokeWidth="2.6" strokeLinecap="round" /></>
      : <><circle cx="20" cy="14" r="5" fill="#f2c094" {...o} /><path d="M14 21h12v9H14z" fill="#2f86d6" {...o} /><path d="M14 30l-4 8h8M26 30l4 8h-8M14 23l-6 4M26 23l6 4" stroke={ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>;
  return <>{body}</>;
}
export function TokenView({ tk, className = "size-9", outline = false }: { tk: Token | null; className?: string; outline?: boolean }) {
  if (!tk) return <svg viewBox="0 0 40 40" className={className} aria-hidden="true"><rect x="3" y="3" width="34" height="34" rx="6" fill="#fff" stroke="#94a3b8" strokeDasharray="4 3" strokeWidth="1.6" /></svg>;
  const [s, c] = tk.split(":");
  if (s === "clap") return <span className={`inline-flex items-center justify-center gap-0.5 rounded-lg bg-amber-100 px-1 ${className}`} style={{ width: "auto", minWidth: "2.25rem" }} aria-hidden="true">{Array.from({ length: Number(c) }, (_, i) => <Hand key={i} className="size-4 text-amber-700" strokeWidth={2} />)}</span>;
  if (s === "butterfly") return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">{objectArtNodes.butterfly}</svg>;
  if (s === "rabbit") return <svg viewBox="0 0 40 40" className={className} aria-hidden="true"><path d="M13 16c-3-8-3-14 0-14s4 6 4 14M23 16c0-8 1-14 4-14s3 6 0 14" fill="#c98a4b" {...o} /><circle cx="20" cy="20" r="8" fill="#c98a4b" {...o} /><ellipse cx="20" cy="31" rx="10" ry="7" fill="#c98a4b" {...o} /><circle cx="17" cy="19" r="1.2" fill={ink} /><circle cx="23" cy="19" r="1.2" fill={ink} /><circle cx="20" cy="22" r="1.2" fill="#e8559a" /></svg>;
  if (s === "pose") return <svg viewBox="0 0 40 40" className={className} aria-hidden="true"><Pose kind={c} /></svg>;
  const fill = outline ? "#fff" : colorHex[c] ?? "#cbd5e1";
  return <svg viewBox="0 0 40 40" className={className} aria-hidden="true"><path d={shapePath[s]} fill={s === "leaf" ? fill : fill} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}
export function RowView({ items, className = "size-8" }: { items: (Token | null)[]; className?: string }) {
  return <div className="flex flex-wrap items-center gap-1">{items.map((t, i) => <TokenView key={i} tk={t} className={className} />)}</div>;
}
