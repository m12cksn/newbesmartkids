import type { ReactNode } from "react";
import { Art as AddArt } from "./GradeOneAdd10Art";
import { thingName, type Thing } from "@/data/grade-one-sub10-v2";

/* Gambar benda Kelas 1 Bab 3. Benda dari Bab 2 memakai gambar yang sama; telur, balon dan wortel dibuat di sini (viewBox 24 × 24).
   `gone` menggambar keadaan setelah diambil: telur pecah, apel dimakan ulat, balon meletus. */
const ink = "#2b2320";
const s = { stroke: ink, strokeWidth: 1, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const own: Partial<Record<Thing, (alt: boolean, gone: boolean) => ReactNode>> = {
  telur: (_, gone) => gone
    ? <><ellipse cx="12" cy="21.4" rx="7" ry="1.4" fill="#000" opacity=".12" /><path d="M5 13.6c0 4.6 3 7.4 7 7.4s7-2.8 7-7.4l-2 1.6-1.6-2.4-1.8 2.2-1.6-2.6-1.8 2.6-1.6-2.2-1.6 2.4z" fill="#f0a167" {...s} /><path d="M7.4 15.6c.6 2 2 3.4 4 3.8" stroke="#fff" strokeWidth="1" fill="none" opacity=".5" /><path d="M8 9.6c.6-2.6 2.2-4.6 4-4.6 1.4 0 2.6 1 3.4 2.6l-1.6 1.2-1.2-1.6-1.6 2-1.4-1.4z" fill="#f0a167" {...s} /></>
    : <><ellipse cx="12" cy="21.4" rx="7" ry="1.4" fill="#000" opacity=".12" /><path d="M12 2.6c3.8 0 7 6 7 11 0 4.6-3 7.4-7 7.4s-7-2.8-7-7.4c0-5 3.2-11 7-11z" fill="#f0a167" {...s} /><path d="M8.6 8.4c.6-1.8 1.6-3 2.6-3.4" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".6" /></>,
  balon: (alt, gone) => { const c = alt ? "#f6c32d" : "#e23d3d";
    return gone
      ? <><path d="M12 11l-2-4 3 2 1-4 1 4 3-1-2 3 4 1-4 1 2 3-3-1-1 4-1-4-3 2 2-4-4-1z" fill={c} {...s} /><path d="M12 15c1 2-1 4 0 6s-1 2 0 2.6" stroke="#8a8a8a" strokeWidth=".9" fill="none" /></>
      : <><path d="M12 1.6c4 0 6.4 3.2 6.4 6.8 0 4-3 7.2-6.4 7.2s-6.4-3.2-6.4-7.2c0-3.6 2.4-6.8 6.4-6.8z" fill={c} {...s} /><path d="M11 15.6h2l-1 1.4z" fill={c} {...s} /><path d="M12 17c1 2-1 3 0 4.6s-.6 1.4 0 2" stroke="#8a8a8a" strokeWidth=".9" fill="none" /><path d="M8.6 5.6c.6-1.4 1.6-2.2 2.8-2.4" stroke="#fff" strokeWidth="1.2" fill="none" opacity=".6" /></>; },
  wortel: () => <><path d="M14.6 7.4c2.4 1.6 2.6 3.6 1.2 5.6L7 22.2c-.8.8-2 .2-1.6-.8l5.4-12.6c1.2-2 2.6-2.6 3.8-1.4z" fill="#f08a24" {...s} /><path d="M9.6 13.4l1.8.8M8.4 16.4l1.6.6M11.6 10.6l1.2.8" stroke="#b85c12" strokeWidth=".9" /><path d="M15 7.4c-.4-2.6.6-4.6 2-5.6-.2 2 .2 3.4 1 4.2 1-1.4 2.6-2 4.4-1.6-1.4.8-2.2 2-2.6 3.4 1 .4 1.8 1.2 2.2 2.4-2-.6-4-.6-5.6-.8z" fill="#3f9b45" {...s} /></>,
};
/** Apel dimakan ulat: gambar apel Bab 1 dengan bekas gigitan dan ulat kecil. */
const bitten = <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M17.6 7.4c-1.6 1.2-1.8 3.8-.6 5.4 1.4 1.8 3.6 1.6 4.6.6.3-2.4-.6-5-2.2-6.6z" fill="#fff6e8" stroke={ink} strokeWidth=".8" /><circle cx="18.6" cy="11.2" r="1.5" fill="#7cc04b" stroke={ink} strokeWidth=".6" /><circle cx="18.2" cy="10.8" r=".35" fill={ink} /></svg>;

export function Art({ thing, alt = false, gone = false, className = "size-10" }: { thing: Thing; alt?: boolean; gone?: boolean; className?: string }) {
  const draw = own[thing];
  if (draw) return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{draw(alt, gone)}</svg>;
  if (gone && thing === "apel") return <span className={`relative inline-block ${className}`}><AddArt thing="apel" className="h-full w-full" />{bitten}</span>;
  return <AddArt thing={thing as Parameters<typeof AddArt>[0]["thing"]} alt={alt} className={className} />;
}
/** Sekelompok benda tersusun rapi dua baris. */
export function Many({ thing, n, alt, gone, size = "size-10", label }: { thing: Thing; n: number; alt?: boolean; gone?: boolean; size?: string; label?: string }) {
  const per = n <= 3 ? n : Math.min(5, Math.ceil(n / 2));
  return <span role="img" aria-label={label ?? `${n} ${thingName[thing]}`} className="inline-flex flex-col items-center gap-0.5">
    {Array.from({ length: Math.ceil(n / per) }, (_, r) => <span key={r} className="flex gap-0.5">{Array.from({ length: Math.min(per, n - r * per) }, (_, k) => <Art key={k} thing={thing} alt={alt} gone={gone} className={size} />)}</span>)}
  </span>;
}
