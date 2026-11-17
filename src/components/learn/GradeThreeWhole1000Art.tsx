import type { ReactNode } from "react";
import { ThingIcon as BaseIcon } from "./GradeOneCounting10Art";
import { fmt, thingName, type Sign, type Thing } from "@/data/grade-three-whole-1000";

const ink = "#2b2320";
const s = { stroke: ink, strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const placeColor = { h: "#3f9b45", t: "#2f86d6", u: "#e23d3d" };

/* ---------- Balok dienes (satuan, puluhan, ratusan) seperti di buku ---------- */
const face = "#9fd6f2", top = "#c9ecfb", side = "#5fb4e0", line = "#2a7fb0";
/** Satu kubus satuan. */
export function Unit({ size = 18, crossed = false, faded = false }: { size?: number; crossed?: boolean; faded?: boolean }) {
  return <svg viewBox="0 0 22 22" width={size} height={size} aria-hidden="true" style={{ opacity: faded ? 0.35 : 1 }}>
    <path d="M2 6h14v14H2z" fill={face} stroke={line} strokeWidth="1" /><path d="M2 6l4-4h14l-4 4z" fill={top} stroke={line} strokeWidth="1" /><path d="M16 6l4-4v14l-4 4z" fill={side} stroke={line} strokeWidth="1" />
    {crossed && <path d="M0 21L21 1" stroke="#e23d3d" strokeWidth="2.4" strokeLinecap="round" />}
  </svg>;
}
/** Satu batang puluhan (10 kubus berjajar). */
export function Rod({ size = 18, crossed = false, faded = false }: { size?: number; crossed?: boolean; faded?: boolean }) {
  const w = 10 * 14;
  return <svg viewBox={`0 0 ${w + 8} 22`} width={(size / 22) * (w + 8)} height={size} aria-hidden="true" style={{ opacity: faded ? 0.35 : 1 }}>
    <path d={`M2 6h${w}v14H2z`} fill={face} stroke={line} strokeWidth="1" /><path d={`M2 6l4-4h${w}l-4 4z`} fill={top} stroke={line} strokeWidth="1" /><path d={`M${w + 2} 6l4-4v14l-4 4z`} fill={side} stroke={line} strokeWidth="1" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${2 + (i + 1) * 14} 6v14M${2 + (i + 1) * 14} 6l4-4`} stroke={line} strokeWidth=".8" />)}
    {crossed && <path d={`M0 21L${w + 8} 1`} stroke="#e23d3d" strokeWidth="2.4" strokeLinecap="round" />}
  </svg>;
}
/** Satu papan ratusan (10 × 10). */
export function Flat({ size = 64 }: { size?: number }) {
  return <svg viewBox="0 0 108 108" width={size} height={size} aria-hidden="true">
    <path d="M2 8h98v98H2z" fill={face} stroke={line} strokeWidth="1.2" /><path d="M2 8l6-6h98l-6 6z" fill={top} stroke={line} strokeWidth="1" /><path d="M100 8l6-6v98l-6 6z" fill={side} stroke={line} strokeWidth="1" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${2 + (i + 1) * 9.8} 8v98M2 ${8 + (i + 1) * 9.8}h98`} stroke={line} strokeWidth=".6" />)}
  </svg>;
}
/** Kumpulan balok: papan ratusan, batang puluhan, kubus satuan. */
export function Blocks({ h, t, u, scale = 1, label }: { h: number; t: number; u: number; scale?: number; label?: string }) {
  const flat = Math.round((h <= 4 ? 64 : h <= 6 ? 48 : 38) * scale), bar = Math.round(16 * scale), cube = Math.round(20 * scale);
  return <div role="img" aria-label={label ?? `${h} papan ratusan, ${t} batang puluhan, ${u} kubus satuan`} className="flex flex-wrap items-end justify-center gap-x-5 gap-y-3">
    {h > 0 && <div className="flex max-w-[22rem] flex-wrap justify-center gap-1.5">{Array.from({ length: h }, (_, i) => <Flat key={i} size={flat} />)}</div>}
    {t > 0 && <div className={`grid gap-0.5 ${t > 6 ? "grid-cols-2 gap-x-2" : ""}`}>{Array.from({ length: t }, (_, i) => <Rod key={i} size={bar} />)}</div>}
    {u > 0 && <div className="grid grid-cols-5 gap-0.5">{Array.from({ length: u }, (_, i) => <Unit key={i} size={cube} />)}</div>}
  </div>;
}

/* ---------- Benda ---------- */
const extra: Partial<Record<Thing, ReactNode>> = {
  melati: <>{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="12" cy="6.6" rx="3" ry="5" fill="#fffdf6" {...s} strokeWidth=".8" transform={`rotate(${a} 12 12)`} />)}<circle cx="12" cy="12" r="2.2" fill="#f2c230" {...s} strokeWidth=".8" /></>,
  telur: <><path d="M12 2.6c3.8 0 6.6 5.6 6.6 10.2S15.6 21.4 12 21.4 5.4 17.4 5.4 12.8 8.2 2.6 12 2.6z" fill="#eccb94" {...s} /><path d="M9 7.4c-1 1.4-1.6 3-1.6 4.6" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" /></>,
  daun: <><path d="M4 20C4 10 10 3.6 20.4 3.4 20.6 13.8 14 20 4 20z" fill="#4caf50" {...s} /><path d="M4 20L16 8M9.4 14.6l-.6-4M12.6 11.4l3.4.4" stroke="#2e7d32" strokeWidth="1" fill="none" strokeLinecap="round" /></>,
  biskuit: <><circle cx="12" cy="12" r="8.6" fill="#d9a35b" {...s} /><circle cx="12" cy="12" r="6.8" fill="none" stroke="#b47a35" strokeWidth=".8" strokeDasharray="1.4 1.4" />{[[9, 9], [14.6, 9.6], [12, 13], [8.6, 14.6], [15, 14.8]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r=".9" fill="#8a5a24" />)}</>,
  manik: <><circle cx="12" cy="12" r="7" fill="#2f86d6" {...s} /><circle cx="12" cy="12" r="2.2" fill="#fff" {...s} strokeWidth=".8" /><path d="M7.6 9.4c.8-1.6 2.2-2.6 3.8-2.8" stroke="#fff" strokeWidth="1.1" fill="none" opacity=".6" strokeLinecap="round" /></>,
  ikan: <><path d="M3 12c3-4.6 9.4-5.6 13.6 0-4.2 5.6-10.6 4.6-13.6 0z" fill="#f28c28" {...s} /><path d="M16.6 12l4.6-4v8z" fill="#f2b632" {...s} /><circle cx="7" cy="11" r=".9" fill={ink} /><path d="M10 9.2c1 1.6 1 3.6 0 5.6" stroke={ink} strokeWidth=".7" fill="none" /></>,
  stiker: <><rect x="3.4" y="3.4" width="17.2" height="17.2" rx="3" fill="#fff6c9" {...s} /><path d="M12 6.2l1.7 3.6 3.9.5-2.9 2.7.8 3.9L12 15l-3.5 1.9.8-3.9-2.9-2.7 3.9-.5z" fill="#f2b632" {...s} strokeWidth=".8" /><path d="M16 20.6l4.6-4.6c-2.4.2-4.4 2-4.6 4.6z" fill="#e5d9a0" {...s} strokeWidth=".8" /></>,
};
export function ThingIcon({ thing, className = "size-8", alt = false }: { thing: Thing; className?: string; alt?: boolean }) {
  const own = extra[thing];
  if (own) return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{own}</svg>;
  return <BaseIcon thing={thing as Parameters<typeof BaseIcon>[0]["thing"]} className={className} alt={alt} />;
}

/** Kelompok benda sama banyak, masing-masing dalam satu wadah. */
export function Groups({ thing, groups, each, icon = "size-7" }: { thing: Thing; groups: number; each: number; icon?: string }) {
  const cols = each > 4 ? 3 : 2;
  return <div role="img" aria-label={`${groups} kelompok, setiap kelompok ${each} ${thingName[thing]}`} className="flex flex-wrap justify-center gap-2">
    {Array.from({ length: groups }, (_, g) => <div key={g} className={`grid place-content-center gap-0.5 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/70 p-1.5 ${thing === "telur" ? "border-solid border-amber-600 bg-amber-100" : ""}`} style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}>
      {Array.from({ length: each }, (_, k) => <ThingIcon key={k} thing={thing} alt={g % 2 === 1} className={icon} />)}
    </div>)}
  </div>;
}

/** Piring untuk membagi. */
export function Plate({ items, thing, label, icon = "size-6", small, wide }: { items: number; thing: Thing; label: string; icon?: string; small?: boolean; wide?: boolean }) {
  return <div className="flex flex-col items-center gap-0.5">
    <div className={`grid place-content-center rounded-[50%] border-4 border-rose-300 bg-rose-100 px-2 py-1.5 ${small ? "min-h-10 min-w-14" : "min-h-14 min-w-16 sm:min-h-16 sm:min-w-20"}`}>
      <div className={`flex flex-wrap justify-center gap-0.5 ${wide ? "max-w-44" : "max-w-24 sm:max-w-28"}`}>{Array.from({ length: items }, (_, k) => <ThingIcon key={k} thing={thing} className={icon} />)}</div>
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </div>;
}

/* ---------- Papan jarak dan label harga ---------- */
export function SignView({ sign, small }: { sign: Sign; small?: boolean }) {
  if (sign.kind === "harga") return <figure className="flex flex-col items-center gap-1" aria-label={`Karet penghapus ${sign.name}, harga ${fmt(sign.n)} rupiah`}>
    <svg viewBox="0 0 120 70" className={`h-auto ${small ? "w-[4.5rem] sm:w-28" : "w-28 sm:w-32"}`} aria-hidden="true">
      <path d="M60 2c-6 0-6 10 0 10" stroke="#8a5a24" strokeWidth="1.5" fill="none" />
      <path d="M22 14h76l14 14v32a6 6 0 01-6 6H14a6 6 0 01-6-6V28z" fill="#fff8d6" stroke="#b78a1e" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="60" cy="22" r="3.4" fill="#fff" stroke="#b78a1e" strokeWidth="1.5" />
      <text x="60" y="54" textAnchor="middle" fontSize="22" fontWeight="800" fill={ink}>Rp{sign.n}</text>
    </svg>
    <figcaption className="text-xs font-semibold sm:text-sm">{sign.name}</figcaption>
  </figure>;
  return <figure className="flex flex-col items-center" aria-label={`Papan jarak ${sign.name} ${sign.n} meter`}>
    <svg viewBox="0 0 170 120" className={`h-auto ${small ? "w-[6.25rem] sm:w-40" : "w-36 sm:w-48"}`} aria-hidden="true">
      <rect x="80" y="20" width="10" height="100" fill="#8a5a24" stroke="#5c3a14" strokeWidth="1.5" />
      <path d="M10 10h130l20 18-20 18H10z" fill="#2f8f5b" stroke="#1d5e3b" strokeWidth="2" strokeLinejoin="round" />
      <text x="76" y="35" textAnchor="middle" fontSize={sign.name.length > 9 ? 15 : 22} fontWeight="700" fill="#fff">{sign.name}</text>
      <rect x="40" y="56" width="90" height="40" rx="6" fill="#fff" stroke="#1d5e3b" strokeWidth="2" />
      <text x="85" y="84" textAnchor="middle" fontSize="24" fontWeight="800" fill={ink}>{sign.n}</text>
      <text x="85" y="108" textAnchor="middle" fontSize="12" fontWeight="700" fill="#5c3a14">meter</text>
    </svg>
  </figure>;
}

/* ---------- Kartu angka seperti di buku ---------- */
export const cardColor = ["#3f9b45", "#f28c28", "#9b3fc4", "#3aa0d8", "#2f86d6", "#e23d3d", "#8a5a24", "#6b7280", "#1d5e3b", "#c4b000"];
export function Card({ d, size = "md", on, onClick, label }: { d: number; size?: "sm" | "md"; on?: boolean; onClick?: () => void; label?: string }) {
  const cls = `grid place-items-center rounded-xl border-4 font-extrabold text-white shadow-sm ${size === "md" ? "h-16 w-12 text-3xl sm:h-20 sm:w-14 sm:text-4xl" : "h-12 w-9 text-2xl"} ${on ? "opacity-30" : ""}`;
  const style = { background: cardColor[d], borderColor: "#00000022" };
  return onClick ? <button type="button" aria-label={label ?? `Kartu ${d}`} disabled={on} onClick={onClick} className={cls} style={style}>{d}</button>
    : <span className={cls} style={style}>{d}</span>;
}
