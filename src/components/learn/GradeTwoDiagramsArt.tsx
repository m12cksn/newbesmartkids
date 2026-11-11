import type { ReactNode } from "react";
import { objectArtNodes } from "@/components/illustrations/ObjectArt";
import { swatchHex, things, type Swatch, type PicSymbol, type Thing } from "@/data/grade-two-diagrams";

/* Gambar benda Bab 8 dalam kotak 48 × 48. Garis tepi gelap, warna mengikuti benda aslinya. */
export const ink = "#1f3b30";
const o = { stroke: ink, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const can = (body: string, deco: ReactNode) => <>
  <rect x="13" y="8" width="22" height="34" rx="3" fill={body} {...o} />
  <path d="M13 12h22M13 38h22" stroke="#d4d4d8" strokeWidth="2.4" />
  <ellipse cx="24" cy="8" rx="11" ry="2.6" fill="#e4e4e7" {...o} />
  <path d="M21 7.4h6" stroke="#71717a" strokeWidth="1.6" strokeLinecap="round" />
  {deco}
</>;

const art: Record<Thing, ReactNode> = {
  apel: objectArtNodes.apple,
  jeruk: objectArtNodes.orange,
  anggur: <><path d="M24 12V5M24 8c4-4 9-3 11-1-4 3-8 3-11 1z" fill="#4d9a3a" {...o} />{[[16, 16], [24, 15], [32, 16], [20, 23], [28, 23], [16, 30], [24, 30], [32, 30], [20, 37], [28, 37], [24, 43]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4.6" fill="#7c4fb3" {...o} />)}</>,
  pisang: <><path d="M5 18c4 16 24 24 38 12-1-3-4-3-6-2-11 7-24 2-29-10z" fill="#f5d33d" {...o} /><path d="M10 22c6 8 16 11 26 7" fill="none" stroke="#c9a51c" strokeWidth="1.3" /><path d="M5 18l-1-4 4 1z" fill="#6b4a1d" {...o} /><path d="M43 30l2-3" {...o} /></>,
  mangga: <><path d="M8 30c-2-10 6-20 18-22 10-2 16 6 14 16-2 12-14 18-24 16-4-1-7-5-8-10z" fill="#f2b134" {...o} /><path d="M10 30c2 6 8 9 14 8" fill="none" stroke="#e98a2a" strokeWidth="3" strokeLinecap="round" opacity=".7" /><path d="M28 8c1-3 4-5 7-5" fill="none" {...o} /><path d="M30 6c6-3 12 0 13 4-5 2-10 1-13-4z" fill="#5fb246" {...o} /></>,
  semangka: <><ellipse cx="24" cy="26" rx="20" ry="16" fill="#2f9e5a" {...o} /><path d="M10 18c4 10 4 18 0 22M20 11c3 10 3 20 0 30M30 11c-3 10-3 20 0 30M38 18c-4 10-4 18 0 22" fill="none" stroke="#1d6b3c" strokeWidth="2.4" /><path d="M24 10V6" stroke="#6b4a1d" strokeWidth="2" /></>,
  alpukat: <><path d="M24 5c-6 0-8 8-10 14-3 8-4 22 10 24 14-2 13-16 10-24-2-6-4-14-10-14z" fill="#3f7d32" {...o} /><path d="M24 9c-4 1-6 8-7 13-2 7-2 16 7 17 9-1 9-10 7-17-1-5-3-12-7-13z" fill="#cfe38a" /><circle cx="24" cy="28" r="6" fill="#8a5528" {...o} /></>,
  manggis: <><circle cx="24" cy="28" r="15" fill="#5b1c3a" {...o} /><path d="M24 13V7" stroke="#6b4a1d" strokeWidth="2.4" strokeLinecap="round" /><path d="M14 15c3 3 6 4 10 0 4 4 7 3 10 0l-1 5c-3 2-15 2-18 0z" fill="#5fb246" {...o} /><circle cx="18" cy="26" r="2" fill="#8e4a6b" /></>,
  stroberi: <><path d="M12 18c0-4 24-4 24 0 0 10-6 22-12 24-6-2-12-14-12-24z" fill="#e5484d" {...o} /><path d="M16 15l8 4 8-4-4-4-4 3-4-3z" fill="#3fa16b" {...o} />{[[18, 24], [28, 24], [23, 30], [19, 34], [28, 33], [23, 38]].map(([x, y]) => <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1" ry="1.4" fill="#fde68a" />)}</>,
  brokoli: <><path d="M20 28l-2 16h12l-2-16z" fill="#8cc63f" {...o} /><circle cx="15" cy="22" r="8" fill="#2f8a3e" {...o} /><circle cx="33" cy="22" r="8" fill="#2f8a3e" {...o} /><circle cx="24" cy="15" r="9" fill="#3a9a48" {...o} /><circle cx="24" cy="24" r="6" fill="#2f8a3e" {...o} /></>,
  bayam: <><path d="M24 44V22M24 34l-10-10M24 30l10-10" fill="none" stroke="#7cb342" strokeWidth="2" strokeLinecap="round" /><path d="M24 22c-8-2-10-12-4-17 6 3 8 10 4 17z" fill="#2f8a3e" {...o} /><path d="M14 24c-8 0-12-8-9-13 6 0 10 6 9 13z" fill="#3a9a48" {...o} /><path d="M34 20c2-7 9-10 12-7-1 6-6 9-12 7z" fill="#3a9a48" {...o} /></>,
  wortel: <><path d="M10 40L34 14l5 5-26 24z" fill="#f08a24" {...o} /><path d="M20 30l3 2M26 23l3 2M15 36l2 2" stroke="#c46a12" strokeWidth="1.4" /><path d="M37 15c2-6 6-9 9-9-2 5-3 7-5 9M37 15c-2-5-2-9 1-12 1 5 3 7 2 12" fill="#3fa16b" {...o} /></>,
  jagung: <><path d="M24 4c-6 0-9 10-9 20s3 18 9 18 9-8 9-18-3-20-9-20z" fill="#f5d33d" {...o} />{[10, 16, 22, 28, 34].map(y => <path key={y} d={`M17 ${y}h14`} stroke="#c9a51c" strokeWidth="1.2" />)}<path d="M21 6v34M27 6v34" stroke="#c9a51c" strokeWidth="1.2" /><path d="M24 44c-10-2-14-12-12-22 4 6 8 10 12 22zM24 44c10-2 14-12 12-22-4 6-8 10-12 22z" fill="#5fb246" {...o} /></>,
  mobilan: <><path d="M4 34v-8l6-2 6-10h18l8 10 4 2v8z" fill="#e5484d" {...o} /><path d="M18 16h14l5 8H14z" fill="#bfe3f7" {...o} /><path d="M25 16v8" stroke={ink} strokeWidth="1.4" /><circle cx="14" cy="36" r="5" fill={ink} /><circle cx="14" cy="36" r="2" fill="#d4d4d8" /><circle cx="36" cy="36" r="5" fill={ink} /><circle cx="36" cy="36" r="2" fill="#d4d4d8" /></>,
  boneka: <><circle cx="14" cy="10" r="5" fill="#a86b3c" {...o} /><circle cx="34" cy="10" r="5" fill="#a86b3c" {...o} /><circle cx="24" cy="17" r="11" fill="#c08552" {...o} /><ellipse cx="24" cy="21" rx="5" ry="4" fill="#e8c39a" /><circle cx="24" cy="19.5" r="1.6" fill={ink} /><circle cx="20" cy="15" r="1.3" fill={ink} /><circle cx="28" cy="15" r="1.3" fill={ink} /><ellipse cx="24" cy="36" rx="11" ry="9" fill="#c08552" {...o} /><ellipse cx="24" cy="37" rx="5" ry="5" fill="#e8c39a" /></>,
  kelereng: <>{[[16, 30, "#2f86d6"], [30, 32, "#e5484d"], [24, 18, "#3fa16b"]].map(([x, y, c]) => <g key={String(c)}><circle cx={x} cy={y} r="8" fill={String(c)} {...o} /><circle cx={Number(x) - 3} cy={Number(y) - 3} r="2" fill="#fff" opacity=".8" /></g>)}</>,
  balok: <><rect x="6" y="26" width="20" height="14" rx="1.5" fill="#2f86d6" {...o} /><circle cx="12" cy="24" r="3" fill="#2f86d6" {...o} /><circle cx="20" cy="24" r="3" fill="#2f86d6" {...o} /><rect x="22" y="12" width="20" height="14" rx="1.5" fill="#f2b134" {...o} /><circle cx="28" cy="10" r="3" fill="#f2b134" {...o} /><circle cx="36" cy="10" r="3" fill="#f2b134" {...o} /><rect x="26" y="30" width="16" height="10" rx="1.5" fill="#e5484d" {...o} /></>,
  mawar: <><path d="M24 30v16M24 40c-4-4-8-4-10-2 3 3 7 3 10 2z" fill="#3fa16b" stroke="#2f7a46" strokeWidth="1.6" /><circle cx="24" cy="18" r="13" fill="#e23d5f" {...o} /><path d="M24 10c-6 0-8 6-4 10 3 3 9 1 9-4M18 22c2 4 10 5 13 0M15 15c1-4 5-7 9-7" fill="none" stroke="#9f1239" strokeWidth="1.6" strokeLinecap="round" /></>,
  lili: <><path d="M24 30v16" stroke="#2f7a46" strokeWidth="2.4" />{[0, 72, 144, 216, 288].map(a => <path key={a} d="M24 20c-3-6-3-14 0-18 3 4 3 12 0 18z" fill="#fff" {...o} transform={`rotate(${a} 24 20)`} />)}<circle cx="24" cy="20" r="3" fill="#f5d33d" /><path d="M22 18l-3-5M26 18l3-5M24 17v-5" stroke="#c46a12" strokeWidth="1.2" /></>,
  tulip: <><path d="M24 28v18M24 38c-6-6-10-4-12-2 4 2 8 4 12 2z" fill="#3fa16b" stroke="#2f7a46" strokeWidth="1.6" /><path d="M13 10c0 12 4 18 11 18s11-6 11-18l-5 5-6-9-6 9z" fill="#f2668b" {...o} /><path d="M24 6v20" stroke="#d6336c" strokeWidth="1.4" /></>,
  aster: <><path d="M24 30v16" stroke="#2f7a46" strokeWidth="2.4" />{Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="24" cy="9" rx="2.6" ry="7" fill="#9b6cd6" stroke="#6b3fa0" strokeWidth="1" transform={`rotate(${i * 30} 24 18)`} />)}<circle cx="24" cy="18" r="5.5" fill="#f2b134" {...o} /></>,
  ayam: <><path d="M10 28c0-8 6-12 14-12h6c6 0 10 6 8 14-2 8-10 12-18 10-6-2-10-6-10-12z" fill="#b8562e" {...o} /><path d="M10 26c-6-2-8-10-4-14 2 4 4 6 6 8" fill="#2d2d2d" {...o} /><circle cx="34" cy="12" r="6" fill="#b8562e" {...o} /><path d="M31 6c1-3 3-3 4-1 1-2 3-2 3 1" fill="#e23d5f" {...o} /><path d="M40 12l5 2-5 2z" fill="#f5a524" {...o} /><path d="M38 17c1 3 0 5-2 5" fill="#e23d5f" {...o} /><circle cx="35" cy="11" r="1.2" fill={ink} /><path d="M20 40v6M26 40v6" stroke="#f5a524" strokeWidth="2" /></>,
  bebek: <><path d="M6 28c0-6 6-8 12-8h12c4 0 8 4 8 10s-6 12-16 12C12 42 6 36 6 28z" fill="#fff" {...o} /><path d="M6 26l-2-6 6 4" fill="#fff" {...o} /><path d="M30 22c0-8 2-14 7-14 4 0 6 3 6 7 0 3-2 5-4 6" fill="#fff" {...o} /><path d="M42 13l5 2-5 3z" fill="#f08a24" {...o} /><circle cx="38" cy="12" r="1.2" fill={ink} /><path d="M14 30c4 4 10 4 14 0" fill="none" stroke="#9aa5b1" strokeWidth="1.4" /><path d="M20 42v4h-4M26 42v4h4" fill="none" stroke="#f08a24" strokeWidth="2" /></>,
  kambing: <><ellipse cx="22" cy="26" rx="14" ry="9" fill="#b97a4a" {...o} /><path d="M12 33v11M18 34v10M27 34v10M32 33v11" stroke={ink} strokeWidth="2.4" /><path d="M36 22c0-6 2-10 6-10 3 0 4 3 4 6 0 4-2 8-6 8" fill="#b97a4a" {...o} /><path d="M38 12c-2-4 0-8 4-9M42 12c1-4 4-6 6-5" fill="none" stroke="#5c3a1e" strokeWidth="2" strokeLinecap="round" /><circle cx="42" cy="17" r="1.2" fill={ink} /><path d="M42 26v4" stroke="#5c3a1e" strokeWidth="1.6" /></>,
  sapi: <><rect x="6" y="18" width="30" height="16" rx="7" fill="#fff1d6" {...o} /><path d="M12 20c2 4 6 4 8 0M24 28c3 0 6 2 6 5" fill="#9a5a2c" stroke="#9a5a2c" strokeWidth="3" /><path d="M10 33v11M16 34v10M26 34v10M32 33v11" stroke={ink} strokeWidth="2.6" /><path d="M34 16c0-4 4-6 8-6s6 4 5 10c-1 4-4 6-7 6s-6-4-6-10z" fill="#fff1d6" {...o} /><ellipse cx="42" cy="22" rx="4" ry="3" fill="#f2b8a0" {...o} /><path d="M36 11c-2-3-1-6 1-6M46 11c2-3 1-6-1-6" fill="none" {...o} /><circle cx="39" cy="15" r="1.1" fill={ink} /><path d="M6 22c-3 2-4 6-3 10" fill="none" {...o} /></>,
  kucing: <><path d="M10 42c-2-10 0-16 8-18h12c6 2 8 8 6 18z" fill="#f2a64a" {...o} /><circle cx="24" cy="18" r="10" fill="#f2a64a" {...o} /><path d="M16 12l-2-8 7 5M32 12l2-8-7 5" fill="#f2a64a" {...o} /><circle cx="20" cy="17" r="1.4" fill={ink} /><circle cx="28" cy="17" r="1.4" fill={ink} /><path d="M22 22l2 1 2-1M14 20l-6-1M14 22l-6 2M34 20l6-1M34 22l6 2" fill="none" stroke={ink} strokeWidth="1" /><path d="M36 38c6 0 8-4 8-8" fill="none" stroke="#f2a64a" strokeWidth="3" strokeLinecap="round" /></>,
  ikan: <><path d="M6 24c6-10 22-12 30 0-8 12-24 10-30 0z" fill="#f08a24" {...o} /><path d="M36 24l9-8v16z" fill="#f08a24" {...o} /><path d="M16 16v16M24 15v18" stroke="#fff" strokeWidth="2.4" /><circle cx="11" cy="22" r="1.6" fill={ink} /></>,
  kelinci: <><path d="M18 16c-2-8 0-14 3-14s3 6 2 14M26 16c0-8 2-14 5-14s2 6-1 14" fill="#f4f1ea" {...o} /><path d="M20 6c0 3 0 6 1 9M29 6c0 3-1 6-2 9" stroke="#f2b8c6" strokeWidth="1.6" /><circle cx="24" cy="22" r="8" fill="#f4f1ea" {...o} /><ellipse cx="24" cy="36" rx="12" ry="9" fill="#f4f1ea" {...o} /><circle cx="21" cy="21" r="1.2" fill={ink} /><circle cx="27" cy="21" r="1.2" fill={ink} /><path d="M23 25h2" stroke="#e8559a" strokeWidth="1.6" /></>,
  burung: objectArtNodes.bird,
  cucur: <><ellipse cx="24" cy="30" rx="20" ry="10" fill="#a3d977" {...o} /><path d="M10 26c0-6 6-10 14-10s14 4 14 10c0 4-6 7-14 7s-14-3-14-7z" fill="#a0522d" {...o} /><path d="M18 22c4-3 10-3 14 0" fill="none" stroke="#6b3216" strokeWidth="1.6" /><circle cx="24" cy="23" r="3" fill="#6b3216" /></>,
  onde: <><ellipse cx="24" cy="34" rx="20" ry="8" fill="#7cc7e8" {...o} /><circle cx="17" cy="24" r="8" fill="#d98b3a" {...o} /><circle cx="31" cy="24" r="8" fill="#d98b3a" {...o} /><circle cx="24" cy="16" r="8" fill="#d98b3a" {...o} />{[[14, 22], [19, 26], [29, 22], [33, 27], [22, 14], [26, 18], [16, 27], [31, 20]].map(([x, y]) => <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.1" ry=".7" fill="#fff7e0" />)}</>,
  lemper: <><ellipse cx="24" cy="34" rx="20" ry="8" fill="#f5e663" {...o} /><path d="M8 26l6-10h20l6 10-6 6H14z" fill="#3a9a48" {...o} /><path d="M14 16l4 16M34 16l-4 16" stroke="#2f7a3b" strokeWidth="1.4" /><path d="M8 26h32" stroke="#2f7a3b" strokeWidth="1.2" /><rect x="34" y="26" width="7" height="6" rx="1" fill="#fff" stroke="#2f7a3b" strokeWidth="1.2" /></>,
  talam: <><ellipse cx="24" cy="36" rx="20" ry="7" fill="#f2668b" {...o} /><path d="M10 20v12c0 3 6 5 14 5s14-2 14-5V20" fill="#eef7c8" {...o} /><ellipse cx="24" cy="20" rx="14" ry="5" fill="#f8fbe6" {...o} /><path d="M10 26c0 3 6 5 14 5s14-2 14-5" fill="none" stroke="#c9e39a" strokeWidth="1.4" /><path d="M24 20c0-4 2-6 5-7" fill="none" stroke="#3fa16b" strokeWidth="2" strokeLinecap="round" /></>,
  sepeda: <><circle cx="12" cy="32" r="9" fill="none" stroke={ink} strokeWidth="2.6" /><circle cx="36" cy="32" r="9" fill="none" stroke={ink} strokeWidth="2.6" /><path d="M12 32l8-12h14l2 12M20 20l6 12h-14M26 32l8-12M32 20l-2-6h6M18 20h6" fill="none" stroke="#2f9ad6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  motor: objectArtNodes.scooter,
  jalan: <><path d="M14 8c4 0 6 4 6 10s-2 10-6 10-6-4-6-10 2-10 6-10z" fill="#8a5528" {...o} /><ellipse cx="14" cy="34" rx="4" ry="5" fill="#8a5528" {...o} /><path d="M34 14c4 0 6 4 6 10s-2 10-6 10-6-4-6-10 2-10 6-10z" fill="#8a5528" {...o} /><ellipse cx="34" cy="40" rx="4" ry="5" fill="#8a5528" {...o} /></>,
  mobil: <><path d="M3 34v-8l7-3 7-9h16l8 9 4 3v8z" fill="#2f86d6" {...o} /><path d="M18 16h13l6 7H14z" fill="#bfe3f7" {...o} /><path d="M25 16v7" stroke={ink} strokeWidth="1.4" /><circle cx="13" cy="36" r="5" fill={ink} /><circle cx="13" cy="36" r="2" fill="#d4d4d8" /><circle cx="36" cy="36" r="5" fill={ink} /><circle cx="36" cy="36" r="2" fill="#d4d4d8" /></>,
  bus: <><rect x="4" y="10" width="40" height="26" rx="4" fill="#f2b134" {...o} />{[8, 17, 26, 35].map(x => <rect key={x} x={x} y="14" width="7" height="8" rx="1" fill="#bfe3f7" {...o} />)}<path d="M4 28h40" stroke={ink} strokeWidth="1.4" /><circle cx="13" cy="37" r="4.5" fill={ink} /><circle cx="35" cy="37" r="4.5" fill={ink} /></>,
  gasing: <><path d="M24 4v8" stroke="#6b4a1d" strokeWidth="3" strokeLinecap="round" /><path d="M8 18c0-4 8-6 16-6s16 2 16 6c0 6-8 16-16 26C16 34 8 24 8 18z" fill="#c0762f" {...o} /><path d="M9 20c6 3 24 3 30 0M12 26c6 3 18 3 24 0" fill="none" stroke="#e23d5f" strokeWidth="2.4" /></>,
  layang: <><path d="M24 2l14 18-14 20-14-20z" fill="#e23d5f" {...o} /><path d="M24 2v38M10 20h28" stroke={ink} strokeWidth="1.4" /><path d="M24 2l14 18H24z" fill="#f2b134" /><path d="M24 2l14 18-14 20-14-20z" fill="none" {...o} /><path d="M24 40c-4 2 4 4 0 6" fill="none" stroke={ink} strokeWidth="1.4" /></>,
  congklak: <><path d="M3 22c0-5 4-7 8-7h26c4 0 8 2 8 7v6c0 5-4 7-8 7H11c-4 0-8-2-8-7z" fill="#a0642f" {...o} />{[13, 19, 25, 31, 37].map(x => <g key={x}><circle cx={x - 2} cy="21" r="2.4" fill="#6b3f1d" /><circle cx={x - 2} cy="29" r="2.4" fill="#6b3f1d" /></g>)}<ellipse cx="6.5" cy="25" rx="2" ry="4" fill="#6b3f1d" /><ellipse cx="41.5" cy="25" rx="2" ry="4" fill="#6b3f1d" /></>,
  tali: <><path d="M10 10c-2 20 6 32 14 32s16-12 14-32" fill="none" stroke="#e23d5f" strokeWidth="2.6" strokeLinecap="round" /><rect x="7" y="4" width="6" height="10" rx="2.5" fill="#2f86d6" {...o} /><rect x="35" y="4" width="6" height="10" rx="2.5" fill="#2f86d6" {...o} /></>,
  kalengCokelat: can("#7a4a2a", <path d="M24 32c-4-3-1-6 0-9 2 3 4 6 0 9zM20 33h8" fill="#e8a256" stroke="#e8a256" strokeWidth="1.4" />),
  kalengHijau: can("#8cc63f", <><circle cx="20" cy="30" r="3" fill="#2f86d6" /><circle cx="28" cy="26" r="4" fill="#2f86d6" /><circle cx="27" cy="34" r="2.4" fill="#2f86d6" /></>),
  kalengMerah: can("#ec4c8c", <path d="M13 32c8-6 14 4 22-4v10H13z" fill="#f2a530" />),
  kalengBiru: can("#3aa0db", <path d="M28 16c-8 0-8 8 0 10s6 10-4 10" fill="none" stroke="#f5d33d" strokeWidth="3" strokeLinecap="round" />),
};
export function ThingArt({ t, className = "size-10", label }: { t: Thing; className?: string; label?: string }) {
  return <svg viewBox="0 0 48 48" className={className} {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}>{art[t]}</svg>;
}
export const thingLabel = (t: Thing) => things[t];

/* Simbol diagram gambar. */
export function SymbolArt({ s, color = "kuning", className = "size-6" }: { s: PicSymbol; color?: Swatch; className?: string }) {
  const c = swatchHex[color];
  const node: Record<PicSymbol, ReactNode> = {
    bintang: <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.8z" fill={c} stroke="#00000040" strokeWidth=".8" strokeLinejoin="round" />,
    lingkaran: <circle cx="12" cy="12" r="8.5" fill={c} stroke="#00000040" strokeWidth=".8" />,
    hati: <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.6A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z" fill={c} stroke="#00000040" strokeWidth=".8" strokeLinejoin="round" />,
    senyum: <><circle cx="12" cy="12" r="9" fill={c} stroke="#00000040" strokeWidth=".8" /><circle cx="9" cy="10" r="1.2" fill={ink} /><circle cx="15" cy="10" r="1.2" fill={ink} /><path d="M8 14c2 3 6 3 8 0" fill="none" stroke={ink} strokeWidth="1.4" strokeLinecap="round" /></>,
    pelari: <><circle cx="14" cy="4" r="2.6" fill={c} /><path d="M12 8l-3 6 4 2-2 6M12 8l4 3 4-1M9 14l-5-1M13 16l4 1 1 4M12 8l-4 1-2 3" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} aria-hidden="true">{node[s]}</svg>;
}

/** Turus: kelompok lima berupa empat garis tegak dan satu garis miring. */
export function Tally({ n, className = "h-7" }: { n: number; className?: string }) {
  const groups = Math.floor(n / 5), rest = n % 5, gw = 26, w = groups * gw + rest * 6 + 4;
  return <svg viewBox={`0 0 ${Math.max(w, 8)} 24`} className={className} style={{ width: `${(Math.max(w, 8) / 24) * 1.75}rem` }} role="img" aria-label={`Turus ${n}`}>
    {Array.from({ length: groups }, (_, g) => <g key={g} transform={`translate(${g * gw + 2} 0)`} stroke={ink} strokeWidth="2" strokeLinecap="round">
      {[0, 1, 2, 3].map(k => <path key={k} d={`M${3 + k * 5} 3v18`} />)}<path d="M-1 18L22 6" />
    </g>)}
    {Array.from({ length: rest }, (_, k) => <path key={k} d={`M${groups * gw + 5 + k * 6} 3v18`} stroke={ink} strokeWidth="2" strokeLinecap="round" />)}
  </svg>;
}
