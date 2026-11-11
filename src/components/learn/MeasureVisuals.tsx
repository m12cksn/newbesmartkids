import { Apple, Bath, BedDouble, BookOpen, Droplets, EggFried, Footprints, Moon, School, ShowerHead, Soup, Sun, Sunrise, Sunset, UtensilsCrossed, Volleyball } from "lucide-react";
import type { ReactNode } from "react";
import { objectArtNodes } from "@/components/illustrations/ObjectArt";
import { acts, things, type Act, type Pan, type Thing, type Tod } from "@/data/grade-two-measurement";

export const ink = "#1f3b30";
const o = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const oa = (n: keyof typeof objectArtNodes) => <g transform="scale(1)">{objectArtNodes[n]}</g>;

/** Gambar benda dalam kotak 48 × 48. */
const art: Record<Thing, ReactNode> = {
  apel: oa("apple"), jeruk: oa("orange"), pensil: oa("pencil"), bolaSepak: oa("ball"), kelereng: oa("marble-red"), buku: oa("book"), kupu: oa("butterfly"), burung: oa("bird"), motor: oa("scooter"),
  semangka: <><ellipse cx="24" cy="26" rx="20" ry="16" fill="#2f9e5a" {...o} /><path d="M10 18c4 10 4 18 0 22M20 11c3 10 3 20 0 30M30 11c-3 10-3 20 0 30M38 18c-4 10-4 18 0 22" fill="none" stroke="#1d6b3c" strokeWidth="2.4" /></>,
  mangga: <><path d="M8 30c-2-10 6-20 18-22 10-2 16 6 14 16-2 12-14 18-24 16-4-1-7-5-8-10z" fill="#f2b134" {...o} /><path d="M26 8c8-1 14 5 14 14-6-6-12-8-20-6 1-4 3-7 6-8z" fill="#7fb342" /><path d="M8 30c-2-10 6-20 18-22 10-2 16 6 14 16-2 12-14 18-24 16-4-1-7-5-8-10z" fill="none" {...o} /><path d="M28 8c1-3 4-5 7-5" fill="none" {...o} /></>,
  manggis: <><circle cx="24" cy="28" r="15" fill="#6b213f" {...o} /><path d="M16 14c3 3 5 3 8 0 3 3 5 3 8 0l-2 6H18z" fill="#4d7c0f" {...o} /></>,
  belimbing: <><path d="M4 24c4-4 6-10 10-10s5 4 10 4 6-4 10-4 6 6 10 10c-4 4-6 10-10 10s-5-4-10-4-6 4-10 4-6-6-10-10z" fill="#f5d33d" {...o} /><path d="M8 24h32M12 19c6 3 18 3 24 0M12 29c6-3 18-3 24 0" fill="none" stroke="#c9a51c" strokeWidth="1.3" /><path d="M44 24l3-3" stroke="#4d7c0f" strokeWidth="2.4" strokeLinecap="round" /></>,
  stroberi: <><path d="M12 18c0-4 24-4 24 0 0 10-6 22-12 24-6-2-12-14-12-24z" fill="#e5484d" {...o} /><path d="M16 15l8 4 8-4-4-4-4 3-4-3z" fill="#3fa16b" {...o} />{[[18, 24], [28, 24], [23, 31], [19, 35], [28, 33]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1" fill="#fde68a" />)}</>,
  pisang: <><path d="M6 20c6 14 26 20 38 10-2-2-4-2-6-1-10 6-22 2-28-10z" fill="#f5d33d" {...o} /><path d="M44 30l2-4" {...o} /></>,
  kelapa: <><circle cx="24" cy="25" r="17" fill="#8a5528" {...o} /><path d="M10 18c4 2 6 6 6 10M38 18c-4 2-6 6-6 10M24 8v8" fill="none" stroke="#6b3f1d" strokeWidth="1.6" /><circle cx="20" cy="20" r="2" fill="#3b2410" /><circle cx="28" cy="20" r="2" fill="#3b2410" /><circle cx="24" cy="27" r="2" fill="#3b2410" /></>,
  labu: <><path d="M24 12c-14 0-20 8-20 16s8 14 20 14 20-6 20-14-6-16-20-16z" fill="#f08a24" {...o} /><path d="M24 12c-6 6-6 24 0 30M24 12c6 6 6 24 0 30M12 16c-4 8-4 18 2 24M36 16c4 8 4 18-2 24" fill="none" stroke="#c46a12" strokeWidth="1.6" /><path d="M24 12V6h4" fill="none" stroke="#4d7c0f" strokeWidth="3" /></>,
  pepaya: <><path d="M1 24c0-9 9-14 21-14h9c9 0 16 6 16 14s-7 14-16 14h-9C10 38 1 33 1 24z" fill="#8cc63f" {...o} /><path d="M8 19c7-3 16-4 24-2" fill="none" stroke="#f5b83d" strokeWidth="2.6" strokeLinecap="round" /><path d="M47 24h1" stroke="#4d7c0f" strokeWidth="3" strokeLinecap="round" /></>,
  kol: <><circle cx="24" cy="26" r="17" fill="#a7d98a" {...o} /><path d="M12 22c6-6 18-6 24 0M10 30c8-6 20-6 28 0M24 10v32" fill="none" stroke="#5f9e42" strokeWidth="1.6" /></>,
  wortel: <><path d="M10 38L36 14l4 4-24 26z" fill="#f08a24" {...o} /><path d="M38 14c2-6 6-8 8-8-2 4-2 6-4 8M38 14c-2-4-2-8 0-10 1 4 3 6 2 10" fill="#3fa16b" {...o} /></>,
  kucing: <><path d="M10 42c-2-10 0-16 8-18h12c6 2 8 8 6 18z" fill="#f2a64a" {...o} /><circle cx="24" cy="18" r="10" fill="#f2a64a" {...o} /><path d="M16 12l-2-8 7 5M32 12l2-8-7 5" fill="#f2a64a" {...o} /><circle cx="20" cy="17" r="1.4" fill={ink} /><circle cx="28" cy="17" r="1.4" fill={ink} /></>,
  tikus: <><ellipse cx="22" cy="30" rx="14" ry="9" fill="#9aa5b1" {...o} /><circle cx="34" cy="24" r="4" fill="#c3cad3" {...o} /><circle cx="38" cy="29" r="1.2" fill={ink} /><path d="M8 32c-4 2-6 6-4 10" fill="none" {...o} /></>,
  tupai: <><path d="M14 40c-10-4-10-22 2-26 8-2 8 8 2 12" fill="#b7793f" {...o} /><ellipse cx="28" cy="32" rx="9" ry="10" fill="#c98a4b" {...o} /><circle cx="32" cy="18" r="6" fill="#c98a4b" {...o} /><circle cx="34" cy="17" r="1.2" fill={ink} /></>,
  anjing: <><path d="M8 40v-12c0-6 4-8 10-8h14c4 0 6 2 6 8v12" fill="#c98a4b" {...o} /><circle cx="36" cy="16" r="8" fill="#c98a4b" {...o} /><path d="M30 12c-4 2-4 8 0 10" fill="#8a5528" {...o} /><circle cx="38" cy="15" r="1.4" fill={ink} /><circle cx="44" cy="18" r="1.6" fill={ink} /><path d="M8 26c-4-2-6-6-4-8" fill="none" {...o} /></>,
  gajah: <><ellipse cx="22" cy="26" rx="18" ry="13" fill="#9aa5b1" {...o} /><path d="M10 36v8h6v-6M28 36v8h6v-6" fill="#9aa5b1" {...o} /><circle cx="38" cy="20" r="8" fill="#9aa5b1" {...o} /><path d="M44 22c2 6 0 14-4 18" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" /><path d="M44 22c2 6 0 14-4 18" fill="none" stroke="#9aa5b1" strokeWidth="2" strokeLinecap="round" /><circle cx="40" cy="18" r="1.3" fill={ink} /></>,
  kambing: <><ellipse cx="22" cy="26" rx="14" ry="9" fill="#f4f1ea" {...o} /><path d="M12 34v10M18 34v10M28 34v10M32 34v10" stroke={ink} strokeWidth="2.4" /><circle cx="38" cy="18" r="6" fill="#f4f1ea" {...o} /><path d="M36 12c-2-4 0-8 4-8M40 12c0-4 3-6 6-6" fill="none" stroke="#8a5528" strokeWidth="2" /><path d="M40 24v4" stroke={ink} strokeWidth="1.6" /></>,
  kelinci: <><path d="M18 16c-2-8 0-14 3-14s3 6 2 14M26 16c0-8 2-14 5-14s2 6-1 14" fill="#f4f1ea" {...o} /><circle cx="24" cy="22" r="8" fill="#f4f1ea" {...o} /><ellipse cx="24" cy="36" rx="12" ry="9" fill="#f4f1ea" {...o} /><circle cx="21" cy="21" r="1.2" fill={ink} /><circle cx="27" cy="21" r="1.2" fill={ink} /></>,
  monyet: <><circle cx="24" cy="18" r="10" fill="#8a5528" {...o} /><ellipse cx="24" cy="21" rx="6" ry="5" fill="#e3b26a" /><circle cx="13" cy="17" r="4" fill="#8a5528" {...o} /><circle cx="35" cy="17" r="4" fill="#8a5528" {...o} /><ellipse cx="24" cy="36" rx="10" ry="9" fill="#8a5528" {...o} /><circle cx="21" cy="17" r="1.2" fill={ink} /><circle cx="27" cy="17" r="1.2" fill={ink} /></>,
  bulu: <><path d="M10 42L38 8c4 6 2 16-6 22-8 6-16 8-22 12z" fill="#e8dcc6" {...o} /><path d="M10 42L36 12" stroke="#b39b72" strokeWidth="1.4" /></>,
  tas: <><rect x="10" y="14" width="28" height="30" rx="6" fill="#8d63c7" {...o} /><path d="M18 14c0-8 12-8 12 0" fill="none" stroke={ink} strokeWidth="2.4" /><rect x="15" y="28" width="18" height="10" rx="2" fill="#a986dc" {...o} /></>,
  penggaris: <><rect x="4" y="18" width="40" height="12" rx="1.5" fill="#7cc7a4" {...o} /><path d="M10 18v5M16 18v3M22 18v5M28 18v3M34 18v5M40 18v3" stroke={ink} strokeWidth="1.2" /></>,
  gunting: <><path d="M20 22L44 10M20 26L44 38" stroke="#8e99a5" strokeWidth="3.4" strokeLinecap="round" /><circle cx="12" cy="18" r="6" fill="none" stroke="#e5484d" strokeWidth="3.4" /><circle cx="12" cy="30" r="6" fill="none" stroke="#e5484d" strokeWidth="3.4" /></>,
  bolaTenis: <><circle cx="24" cy="24" r="14" fill="#c8e64a" {...o} /><path d="M12 16c8 4 8 12 0 16M36 16c-8 4-8 12 0 16" fill="none" stroke="#fff" strokeWidth="2" /></>,
  balok: <><rect x="10" y="18" width="28" height="20" rx="2" fill="#2f86d6" {...o} /><circle cx="18" cy="16" r="3.5" fill="#2f86d6" {...o} /><circle cx="30" cy="16" r="3.5" fill="#2f86d6" {...o} /></>,
  sepeda: <><circle cx="12" cy="32" r="9" fill="none" stroke={ink} strokeWidth="2.6" /><circle cx="36" cy="32" r="9" fill="none" stroke={ink} strokeWidth="2.6" /><path d="M12 32l8-12h14l2 12M20 20l6 12h-14M26 32l8-12M32 20l-2-6h6" fill="none" stroke="#8d63c7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  mobil: <><path d="M4 34v-8l6-2 6-10h18l8 10 4 2v8z" fill="#e5484d" {...o} /><path d="M18 16h14l5 8H14z" fill="#bfe3f7" {...o} /><circle cx="14" cy="36" r="5" fill={ink} /><circle cx="36" cy="36" r="5" fill={ink} /></>,
  truk: <><rect x="2" y="12" width="28" height="22" fill="#f3f4f6" {...o} /><path d="M30 18h9l7 8v8H30z" fill="#2f86d6" {...o} /><path d="M33 20h6l4 6H33z" fill="#bfe3f7" {...o} /><circle cx="10" cy="36" r="4.5" fill={ink} /><circle cx="22" cy="36" r="4.5" fill={ink} /><circle cx="38" cy="36" r="4.5" fill={ink} /></>,
  bukuMerah: <><path d="M6 20h36v12H6z" fill="#e5484d" {...o} /><path d="M10 20v12" stroke="#fff" strokeWidth="1.6" /></>,
  bukuBiru: <><path d="M10 22h28v10H10z" fill="#2f86d6" {...o} /><path d="M14 22v10" stroke="#fff" strokeWidth="1.6" /></>,
};
export function ThingArt({ t, className = "size-12", label }: { t: Thing; className?: string; label?: string }) {
  return <svg viewBox="0 0 48 48" className={className} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>{art[t]}</svg>;
}

/* ---------- Timbangan ---------- */
function PanStack({ pans, x, y }: { pans: Pan[]; x: number; y: number }) {
  const icons = pans.flatMap(p => Array.from({ length: p.n }, () => p.o));
  const s = icons.length > 4 ? 16 : icons.length > 2 ? 20 : 30, per = icons.length > 4 ? 4 : icons.length > 2 ? 3 : 2;
  return <g>{icons.map((t, i) => { const row = Math.floor(i / per), col = i % per, inRow = Math.min(per, icons.length - row * per); return <svg key={i} x={x - (inRow * s) / 2 + col * s} y={y - s - row * (s - 4)} width={s} height={s} viewBox="0 0 48 48" overflow="visible">{art[t]}</svg>; })}</g>;
}
export function Balance({ left, right, tilt, style = "piring", className = "w-full max-w-72" }: { left: Pan[]; right: Pan[]; tilt: number; style?: "jungkat" | "piring"; className?: string }) {
  const ang = tilt * 12, rad = (ang * Math.PI) / 180, L = 70;
  const lx = 100 - L * Math.cos(rad), ly = 62 - L * Math.sin(rad), rx = 100 + L * Math.cos(rad), ry = 62 + L * Math.sin(rad);
  const name = (ps: Pan[]) => ps.map(p => `${p.n} ${things[p.o].name.toLowerCase()}`).join(" dan ");
  const label = `Timbangan: ${name(left)} di kiri, ${name(right)} di kanan. ${tilt > 0 ? "Sisi kiri turun." : tilt < 0 ? "Sisi kanan turun." : "Timbangan datar."}`;
  return <svg viewBox="0 0 200 110" className={className} role="img" aria-label={label}>
    {style === "jungkat" ? <>
      <path d="M88 104l12-40 12 40z" fill="#c94f7c" stroke={ink} strokeWidth="1.4" strokeLinejoin="round" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#6b7a89" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="62" r="5" fill="#f5c542" stroke={ink} strokeWidth="1.2" />
      <PanStack pans={left} x={lx + 10} y={ly - 3} /><PanStack pans={right} x={rx - 10} y={ry - 3} />
    </> : <>
      <path d="M86 104h28l-4-8h-20z" fill="#4c86c6" stroke={ink} strokeWidth="1.4" /><path d="M97 96V60h6v36z" fill="#6b7a89" stroke={ink} strokeWidth="1.2" />
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#6b7a89" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="62" r="5" fill="#f5c542" stroke={ink} strokeWidth="1.2" />
      {[[lx, ly], [rx, ry]].map(([x, y], k) => <path key={k} d={`M${x - 26} ${y + 6}h52c-2 8-10 10-26 10s-24-2-26-10z`} fill="#f5c542" stroke={ink} strokeWidth="1.2" />)}
      <PanStack pans={left} x={lx} y={ly + 7} /><PanStack pans={right} x={rx} y={ry + 7} />
    </>}
  </svg>;
}

/* ---------- Jam ---------- */
export function ClockFace({ h, className = "size-28", onPick, label }: { h: number | null; className?: string; onPick?: (n: number) => void; label?: string }) {
  const at = (n: number, r: number) => { const a = (n * 30 * Math.PI) / 180; return [50 + r * Math.sin(a), 50 - r * Math.cos(a)]; };
  const [hx, hy] = h ? at(h, 22) : [50, 50];
  return <svg viewBox="0 0 100 100" className={className} {...(onPick ? { role: "group", "aria-label": label ?? "Jam" } : { role: "img", "aria-label": label ?? (h ? `Jam menunjukkan pukul ${h} tepat` : "Jam") })}>
    <circle cx="50" cy="50" r="46" fill="#fff" stroke="#2f9e6a" strokeWidth="5" />
    {Array.from({ length: 60 }, (_, i) => { const [x1, y1] = at(i / 5, 41), [x2, y2] = at(i / 5, i % 5 ? 39 : 37); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth={i % 5 ? 0.6 : 1.4} />; })}
    {Array.from({ length: 12 }, (_, i) => { const n = i + 1, [x, y] = at(n, 30); return onPick
      ? <g key={n} role="button" tabIndex={0} aria-label={`Angka ${n}`} aria-pressed={h === n} className="cursor-pointer outline-none" onClick={() => onPick(n)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(n); } }}>
        <circle cx={x} cy={y} r="7.5" fill={h === n ? "#fde68a" : "transparent"} stroke={h === n ? "#c2410c" : "transparent"} strokeWidth="1.2" /><text x={x} y={y + 3.6} textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>{n}</text></g>
      : <text key={n} x={x} y={y + 3.6} textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>{n}</text>; })}
    <line x1="50" y1="50" x2="50" y2="14" stroke="#2f86d6" strokeWidth="2.6" strokeLinecap="round" />
    {h && <line x1="50" y1="50" x2={hx} y2={hy} stroke="#c2410c" strokeWidth="4" strokeLinecap="round" />}
    <circle cx="50" cy="50" r="3" fill={ink} />
  </svg>;
}
export function Digital({ h, className = "w-32" }: { h: number; className?: string }) {
  return <svg viewBox="0 0 120 54" className={className} role="img" aria-label={`Jam digital ${String(h).padStart(2, "0")}.00`}>
    <rect x="3" y="6" width="114" height="44" rx="8" fill="#3b2a6b" stroke={ink} strokeWidth="2" /><rect x="11" y="13" width="98" height="30" rx="4" fill="#111827" />
    <text x="60" y="37" textAnchor="middle" fontSize="24" fontWeight="800" fontFamily="ui-monospace, monospace" fill="#7ee08f">{String(h).padStart(2, "0")}:00</text>
  </svg>;
}

/* ---------- Kegiatan ---------- */
const todStyle: Record<Tod, { bg: string; fg: string; Icon: typeof Sun; name: string }> = {
  pagi: { bg: "bg-amber-100", fg: "text-amber-700", Icon: Sunrise, name: "Pagi" }, siang: { bg: "bg-sky-100", fg: "text-sky-700", Icon: Sun, name: "Siang" },
  sore: { bg: "bg-orange-200", fg: "text-orange-800", Icon: Sunset, name: "Sore" }, malam: { bg: "bg-indigo-900", fg: "text-indigo-50", Icon: Moon, name: "Malam" },
};
const Toothbrush = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21L15 9" /><rect x="13" y="3" width="8" height="5" rx="1.5" transform="rotate(45 17 5.5)" /><path d="M15 3.5v-1M17.5 4.5l.7-.7M19.5 6.5h1" /></svg>;
const Comb = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><rect x="3" y="7" width="18" height="4" rx="1.2" /><path d="M5 11v6M8 11v6M11 11v6M14 11v6M17 11v6M20 11v4" /></svg>;
const actIcon: Record<Act, (p: { className?: string }) => ReactNode> = {
  bangun: p => <BedDouble {...p} />, sarapan: p => <EggFried {...p} />, sekolah: p => <School {...p} />, belajar: p => <BookOpen {...p} />, makanSiang: p => <Soup {...p} />,
  bola: p => <Volleyball {...p} />, mandiSore: p => <ShowerHead {...p} />, sikatGigi: p => <Toothbrush {...p} />, menyisir: p => <Comb {...p} />, mandi: p => <Bath {...p} />,
  cuciTangan: p => <Droplets {...p} />, tidur: p => <BedDouble {...p} />, makanMalam: p => <UtensilsCrossed {...p} />, olahraga: p => <Footprints {...p} />, membaca: p => <BookOpen {...p} />, istirahat: p => <Apple {...p} />,
};
export function ActCard({ a, tod, h, small = false }: { a: Act; tod?: Tod; h?: number; small?: boolean }) {
  const st = tod ? todStyle[tod] : { bg: "bg-base-200", fg: "text-base-content", Icon: null, name: "" };
  const I = actIcon[a];
  return <div className={`flex items-center gap-2 rounded-xl p-2 ${st.bg} ${st.fg}`} role="img" aria-label={`${acts[a]}${h ? `, jam menunjukkan pukul ${h}` : ""}${tod ? `, ${tod}` : ""}`}>
    {h && <span className="rounded-full bg-white p-0.5"><ClockFace h={h} className={small ? "size-12" : "size-16"} /></span>}
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="flex items-center gap-1">{I({ className: small ? "size-7" : "size-9" })}{st.Icon && <st.Icon className="size-4 opacity-80" aria-hidden="true" />}</span>
      <span className={`font-semibold leading-tight ${small ? "text-[11px]" : "text-xs"}`}>{acts[a]}</span>
    </div>
  </div>;
}
