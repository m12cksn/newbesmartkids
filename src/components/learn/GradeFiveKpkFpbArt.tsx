import type { ReactNode } from "react";
import type { Thing } from "@/data/grade-five-kpk-fpb";

/* Gambar Kelas 5 Bab 2 dalam kotak 48 × 48, dibuat sesuai bentuk benda aslinya. */
export const ink = "#1f3b30";
const o = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const rose = (petal: string, dark: string) => <>
  <path d="M24 26v19" stroke="#2f7a46" strokeWidth="2.4" strokeLinecap="round" />
  <path d="M24 36c-5-5-10-4-12-1 4 3 8 3 12 1zM24 40c4-4 9-4 11-1-3 3-8 3-11 1z" fill="#3fa16b" stroke="#2f7a46" strokeWidth="1.2" />
  <path d="M12 16c0-7 5-12 12-12s12 5 12 12-5 11-12 11-12-4-12-11z" fill={petal} {...o} />
  <path d="M24 8c-5 0-7 5-4 8 3 2 8 1 8-3M17 19c3 4 11 4 14-1M15 13c2-4 5-6 9-6" fill="none" stroke={dark} strokeWidth="1.6" strokeLinecap="round" />
</>;
const child = (hair: string, shirt: string, skirt: string, girl: boolean) => <>
  <circle cx="24" cy="13" r="8" fill="#f2c09b" {...o} />
  <path d={girl ? "M15 14c-1-8 4-11 9-11s10 3 9 11c-2-4-5-6-9-6s-7 2-9 6zM15 14c-1 5 0 9 2 11M33 14c1 5 0 9-2 11" : "M16 11c0-6 4-8 8-8s8 2 8 8c-3-2-5-3-8-3s-5 1-8 3z"} fill={hair} stroke={ink} strokeWidth="1.2" />
  <circle cx="21" cy="13" r="1" fill={ink} /><circle cx="27" cy="13" r="1" fill={ink} />
  <path d="M14 34c0-8 4-12 10-12s10 4 10 12z" fill={shirt} {...o} /><path d="M24 22l-2 6h4z" fill="#d23f4a" />
  <path d={girl ? "M15 34h18l2 9H13z" : "M16 34h16v10h-6v-6h-4v6h-6z"} fill={skirt} {...o} />
</>;

const art: Record<Thing, ReactNode> = {
  mawarMerah: rose("#d7263d", "#8f1426"),
  mawarPutih: rose("#f6efe4", "#b9a88f"),
  susu: <><path d="M14 14l4-8h12l4 8v30H14z" fill="#f4f8fb" {...o} /><path d="M14 14h20" stroke={ink} strokeWidth="1.4" /><path d="M14 24h20v14H14z" fill="#4c9be8" /><path d="M18 30c2-3 4-3 6 0s4 3 6 0" fill="none" stroke="#fff" strokeWidth="1.6" /><path d="M28 6l3-4" stroke="#e5484d" strokeWidth="2" strokeLinecap="round" /><path d="M14 14l4-8h12l4 8v30H14z" fill="none" {...o} /></>,
  lolipop: <><path d="M24 26v20" stroke="#e8e2d0" strokeWidth="3" strokeLinecap="round" /><circle cx="24" cy="16" r="12" fill="#f2668b" {...o} /><path d="M24 16c0-4 4-6 7-3 3 4-1 10-7 10-7 0-11-7-8-13 3-5 10-6 14-2" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></>,
  biskuit: <><rect x="6" y="10" width="36" height="28" rx="4" fill="#d9a35a" {...o} />{[[13, 17], [24, 17], [35, 17], [13, 31], [24, 31], [35, 31], [18, 24], [30, 24]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#8a5528" />)}<rect x="10" y="14" width="28" height="20" rx="2" fill="none" stroke="#b27b34" strokeWidth="1.2" strokeDasharray="2 2" /></>,
  siswaPutri: child("#3b2a20", "#fff", "#c0262d", true),
  siswaPutra: child("#1f1a17", "#fff", "#c0262d", false),
  lampu: <><rect x="16" y="4" width="16" height="32" rx="4" fill="#3a3f45" {...o} /><circle cx="24" cy="11" r="4" fill="#e5484d" /><circle cx="24" cy="20" r="4" fill="#f5a524" opacity=".45" /><circle cx="24" cy="29" r="4" fill="#3fa16b" opacity=".45" /><path d="M24 36v10" stroke="#7a8088" strokeWidth="3" /></>,
};
export function ThingArt({ t, className = "size-6" }: { t: Thing; className?: string }) {
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">{art[t]}</svg>;
}

/** Biji congklak. */
export const Seed = ({ color }: { color: string }) => <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true"><ellipse cx="5" cy="5" rx="4" ry="3.2" fill={color} stroke="#00000055" strokeWidth=".6" /></svg>;
