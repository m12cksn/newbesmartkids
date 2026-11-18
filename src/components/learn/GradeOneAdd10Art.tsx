import type { ReactNode } from "react";
import { ThingIcon } from "./GradeOneCounting10Art";
import { thingName, type Thing, type Vehicle } from "@/data/grade-one-add10-v2";

/* Gambar benda Kelas 1 Bab 2. Benda yang sudah ada di Bab 1 memakai gambar yang sama; sisanya dibuat di sini (viewBox 24 × 24). */
const ink = "#2b2320";
const s = { stroke: ink, strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const shared: Partial<Record<Thing, "kelereng" | "mobil" | "bolu" | "bola" | "apel" | "boneka" | "burung" | "pensil" | "donat">> = {
  kelereng: "kelereng", mobil: "mobil", bolu: "bolu", bola: "bola", apel: "apel", boneka: "boneka", burung: "burung", pensil: "pensil", donat: "donat",
};
const own: Partial<Record<Thing, (alt?: boolean) => ReactNode>> = {
  kuelapis: () => <><path d="M3 11l9-4 9 4-9 4z" fill="#e2457a" {...s} /><path d="M3 11v6l9 4v-6z" fill="#f6d6a8" {...s} /><path d="M21 11v6l-9 4v-6z" fill="#e9c08a" {...s} />{[13, 15, 17].map(y => <path key={y} d={`M3 ${y}l9 4M21 ${y}l-9 4`} stroke="#7a3b1c" strokeWidth="1.1" />)}</>,
  kupu: alt => { const c = alt ? "#8b5cf6" : "#f6c32d"; return <><path d="M12 8C9-1 1 2 3 9c1 3 5 4 9 3z" fill={c} {...s} /><path d="M12 8c3-9 11-6 9 1-1 3-5 4-9 3z" fill={c} {...s} /><path d="M12 12c-3 0-8 2-6 7 1 2 4 1 6-3z" fill={c} {...s} /><path d="M12 12c3 0 8 2 6 7-1 2-4 1-6-3z" fill={c} {...s} /><ellipse cx="12" cy="12.4" rx="1.3" ry="5.6" fill="#6b4423" {...s} /><path d="M11.4 7c-1-2-2-3-3-3.4M12.6 7c1-2 2-3 3-3.4" stroke={ink} strokeWidth=".8" fill="none" /><circle cx="6" cy="7.6" r="1.1" fill="#fff" /><circle cx="18" cy="7.6" r="1.1" fill="#fff" /></>; },
  pita: alt => { const c = alt ? "#e23d3d" : "#2f86d6"; return <><path d="M12 12L3 6.5c-1 3-1 7 0 11z" fill={c} {...s} /><path d="M12 12l9-5.5c1 3 1 7 0 11z" fill={c} {...s} /><path d="M10 12l-2.6 8.6 3-1.6 1.6 2.4L12 12z" fill={c} {...s} /><path d="M14 12l2.6 8.6-3-1.6-1.6 2.4z" fill={c} {...s} /><rect x="10" y="9.8" width="4" height="4.4" rx="1.4" fill={c} {...s} /><path d="M5 9.4l4 2M5 14.6l4-1.8" stroke="#fff" strokeWidth=".8" opacity=".6" /></>; },
  bebek: () => <><path d="M3.4 14c0-3 2.6-4.4 6-4 1.8.2 3 .8 4 1.6.4-3.4 2-5.6 4.4-5.6 2 0 3.4 1.6 3.4 3.4h-2.4c0 2.4-.8 4.4-2 5.8-1.4 1.6-3.6 2.6-6.4 2.6-4 0-7-1.4-7-3.8z" fill="#c9893a" {...s} /><path d="M21.2 9.4h1.6l-.8 1.4z" fill="#f4a12f" {...s} /><circle cx="18.8" cy="8.2" r=".8" fill={ink} /><path d="M6.4 13.6c2-1 4.6-1 6.4.6" stroke="#8a5a20" strokeWidth="1" fill="none" /><path d="M9 17.8v3M12 17.8v3M8 20.8h2M11 20.8h2" stroke="#f4a12f" strokeWidth="1.2" /></>,
  permen: alt => { const c = alt ? "#e23d3d" : "#f6c32d"; return <><path d="M12 13v10" stroke="#c9a26b" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="8" r="7" fill={c} {...s} /><path d="M12 8a1.6 1.6 0 011.6 1.6 3.2 3.2 0 01-4.8-1.6 4.8 4.8 0 018-1.6 6.4 6.4 0 01-3.2 7.6" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" /></>; },
  mawar: alt => { const c = alt ? "#f6c32d" : "#e23d3d"; return <><path d="M12 13v10" stroke="#3f9b45" strokeWidth="1.6" /><path d="M12 18c-2.6-2.4-5-1.8-5.6-1 1.4 1.8 3.8 2 5.6 1zM12 16c2.6-2.4 5-1.8 5.6-1-1.4 1.8-3.8 2-5.6 1z" fill="#3f9b45" {...s} /><path d="M6 8c0-4 3-6 6-6s6 2 6 6c0 3.6-2.6 5.6-6 5.6S6 11.6 6 8z" fill={c} {...s} /><path d="M9 7c1-2 4-2 5 0M8.4 9.6c2 1.6 5.2 1.6 7.2 0M12 5c-1.4 1-1.4 3 0 4" fill="none" stroke={ink} strokeWidth=".8" opacity=".6" /></>; },
  siswa: () => <><circle cx="12" cy="5" r="3.4" fill="#f2c6a0" {...s} /><path d="M8.6 4.2c.8-3 6-3 6.8 0-1.8-.8-5-.8-6.8 0z" fill="#3b2a20" /><path d="M6.6 9.6h10.8l-1 7H7.6z" fill="#fff" {...s} /><path d="M11 9.6h2l-.4 4h-1.2z" fill="#c0392b" /><path d="M7.6 16.6h8.8v2.6H7.6z" fill="#c0392b" {...s} /><path d="M9.6 19.2v3.4M14.4 19.2v3.4" stroke={ink} strokeWidth="1.8" strokeLinecap="round" /></>,
  kepik: () => <><circle cx="12" cy="4.6" r="3" fill="#3a2a2a" {...s} /><circle cx="12" cy="13.6" r="8.6" fill="#e23d3d" {...s} /><path d="M12 5.4v16.6" stroke={ink} strokeWidth="1.2" /><circle cx="8" cy="11" r="1.4" fill={ink} /><circle cx="16" cy="11" r="1.4" fill={ink} /><circle cx="8.4" cy="16" r="1.4" fill={ink} /><circle cx="15.6" cy="16" r="1.4" fill={ink} /></>,
  ikan: alt => <><path d="M2 12c3-5 10-6 15-2l4-3v10l-4-3c-5 4-12 3-15-2z" fill={alt ? "#2f86d6" : "#f4a12f"} {...s} /><circle cx="6.6" cy="11" r="1" fill={ink} /><path d="M10 9c1 2 1 4 0 6" stroke={ink} strokeWidth=".8" fill="none" opacity=".6" /></>,
};
export function Art({ thing, alt = false, className = "size-10" }: { thing: Thing; alt?: boolean; className?: string }) {
  const sh = shared[thing];
  if (sh) return <ThingIcon thing={sh} alt={alt} className={className} />;
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{own[thing]!(alt)}</svg>;
}
/** Sekelompok benda tersusun 5 per baris. */
export function Many({ thing, n, alt, size = "size-10", label }: { thing: Thing; n: number; alt?: boolean; size?: string; label?: string }) {
  // Susunan rapi dua baris agar muat di kotak sempit: 4 → 2+2, 5 → 3+2, 7 → 4+3, 9 → 5+4.
  const per = n <= 3 ? n : Math.min(5, Math.ceil(n / 2));
  return <span role="img" aria-label={label ?? `${n} ${thingName[thing]}`} className="inline-flex flex-col items-center gap-0.5">
    {Array.from({ length: Math.ceil(n / per) }, (_, r) => <span key={r} className="flex gap-0.5">{Array.from({ length: Math.min(per, n - r * per) }, (_, k) => <Art key={k} thing={thing} alt={alt} className={size} />)}</span>)}
  </span>;
}

/* ---------- Kendaraan (viewBox 48 × 32) ---------- */
const wheel = (x: number, y: number, r = 5) => <g><circle cx={x} cy={y} r={r} fill="#3a3a3a" {...s} /><circle cx={x} cy={y} r={r * 0.4} fill="#c9ced3" /></g>;
export function VehicleArt({ kind, className = "h-12 w-16" }: { kind: Vehicle; className?: string }) {
  const body: Record<Vehicle, ReactNode> = {
    sepeda: <>{wheel(10, 22, 7)}{wheel(38, 22, 7)}<path d="M10 22l9-11h12l7 11M19 11l5 11h-14M31 11l-7 11M17 8h5M31 11l-1-4h4" stroke="#e07a3a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>,
    becak: <><path d="M4 6h18v12H4z" fill="#2f6fb5" {...s} /><path d="M2 5h22v3H2z" fill="#1d4f86" {...s} /><path d="M6 12h14v6H6z" fill="#c4562f" {...s} />{wheel(8, 24)}{wheel(20, 24)}<path d="M20 18l12-6h6M32 12l4 12" stroke="#2f6fb5" strokeWidth="2" fill="none" strokeLinecap="round" />{wheel(38, 24)}</>,
    motor: <><path d="M8 20c2-6 8-8 14-8h8l4 8z" fill="#e23d3d" {...s} /><path d="M18 12h10l-2-4h-6z" fill="#3a3a3a" {...s} /><path d="M34 20l4-12h4" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />{wheel(10, 23)}{wheel(38, 23)}</>,
    mobilbesar: <><path d="M3 22v-6l5-1 5-7h18l8 7 6 1v6z" fill="#3f9b45" {...s} /><path d="M14 9.4h7v5H9zM23 9.4h7l5 5H23z" fill="#d6eefb" {...s} />{wheel(12, 23)}{wheel(36, 23)}</>,
  };
  return <svg viewBox="0 0 48 32" className={className} role="img" aria-label={vehicleLabel[kind]}>{body[kind]}</svg>;
}
const vehicleLabel: Record<Vehicle, string> = { sepeda: "sepeda (2 roda)", becak: "becak (3 roda)", motor: "motor (2 roda)", mobilbesar: "mobil (4 roda)" };
