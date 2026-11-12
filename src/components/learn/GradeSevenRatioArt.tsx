import { useId } from "react";
import { idn } from "@/data/grade-seven-ratio";

/* ---------- Gelas susu dan gelas cokelat ---------- */
export function Glass({ kind, size = 30 }: { kind: "milk" | "choc" | "mix"; size?: number }) {
  const fill = kind === "milk" ? "#f6f1e4" : kind === "choc" ? "#6b3a1f" : "#a8683d";
  return <svg viewBox="0 0 30 40" width={size} height={size * 1.33} aria-hidden="true">
    <path d="M4 3 h22 l-2.5 33 q-0.3 2 -2.3 2 h-12.4 q-2 0 -2.3 -2 z" fill="#e8f3fb" stroke="#8fb7d3" strokeWidth="1.2" />
    <path d="M5.2 10 h19.6 l-1.9 25.6 q-0.2 1.4 -1.6 1.4 h-12.6 q-1.4 0 -1.6 -1.4 z" fill={fill} stroke={kind === "milk" ? "#d9cfb6" : "none"} strokeWidth=".6" />
    <ellipse cx="15" cy="10" rx="9.8" ry="1.6" fill={kind === "milk" ? "#ffffff" : "#8a5230"} opacity=".9" />
    <path d="M8 13 v18" stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" />
  </svg>;
}
export function GlassRow({ milk, choc, label }: { milk: number; choc: number; label?: string }) {
  return <figure className="rounded-xl bg-base-100 p-2" aria-label={`${label ? `${label}: ` : ""}${milk} gelas susu dan ${choc} gelas cokelat`}>
    {label && <figcaption className="mb-1 text-center text-sm font-bold">{label}</figcaption>}
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-wrap justify-center gap-0.5">{Array.from({ length: choc }, (_, k) => <Glass key={k} kind="choc" />)}</div>
      <div className="flex flex-wrap justify-center gap-0.5">{Array.from({ length: milk }, (_, k) => <Glass key={k} kind="milk" />)}</div>
    </div>
    <p className="mt-1 text-center text-xs text-base-content/70">{choc} cokelat, {milk} susu</p>
  </figure>;
}

/* ---------- Diagram kotak ---------- */
export function TapeDiagram({ rows, unit }: { rows: { name: string; parts: number; color: string }[]; unit?: string }) {
  const max = Math.max(...rows.map(r => r.parts), 1);
  return <div className="space-y-1" role="img" aria-label={`Diagram kotak: ${rows.map(r => `${r.name} ${r.parts} kotak`).join(", ")}${unit ? `, setiap kotak ${unit}` : ""}`}>
    {rows.map(r => <div key={r.name} className="flex items-center gap-2 text-xs"><span className="w-16 shrink-0 font-bold">{r.name}</span>
      <span className="grid flex-1 gap-0.5" style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))` }}>{Array.from({ length: r.parts }, (_, k) => <span key={k} className="h-6 rounded-sm border border-black/20" style={{ background: r.color }} />)}</span></div>)}
    {unit && <p className="text-right text-xs text-base-content/60">Setiap kotak = {unit}</p>}
  </div>;
}

/* ---------- Batang komposisi ---------- */
export function CompositionBar({ parts, caption }: { parts: { name: string; pct: number; color: string }[]; caption: string }) {
  return <figure className="w-full max-w-sm">
    <figcaption className="mb-1 text-center text-sm font-bold">{caption}</figcaption>
    <div className="flex h-14 overflow-hidden rounded-lg ring-1 ring-base-300" role="img" aria-label={parts.map(p => `${p.name} ${p.pct}%`).join(", ")}>
      {parts.map(p => <span key={p.name} className="flex items-center justify-center text-sm font-extrabold" style={{ width: `${p.pct}%`, background: p.color, color: p.color === "#f2e6c9" ? "#5a3a1c" : "#fff" }}>{p.pct}%</span>)}
    </div>
    <ul className="mt-1 flex flex-wrap justify-center gap-3 text-xs">{parts.map(p => <li key={p.name} className="flex items-center gap-1"><span className="inline-block size-3 rounded-sm ring-1 ring-black/20" style={{ background: p.color }} />{p.name}</li>)}</ul>
  </figure>;
}

/* ---------- Lingkaran berjuring ---------- */
export function Pie({ sectors, shaded = [], onSector, label, colors }: { sectors: number; shaded?: number[]; onSector?: (k: number) => void; label?: string; colors?: [string, string] }) {
  const R = 50, pt = (k: number) => { const a = (k / sectors) * 2 * Math.PI - Math.PI / 2; return [60 + R * Math.cos(a), 60 + R * Math.sin(a)]; };
  const [on, off] = colors ?? ["#6b3a1f", "#ffffff"];
  return <svg viewBox="0 0 120 120" className="mx-auto w-full max-w-48" role={onSector ? "group" : "img"} aria-label={label ?? `Lingkaran ${sectors} juring, ${shaded.length} diarsir`}>
    {Array.from({ length: sectors }, (_, k) => { const [x1, y1] = pt(k), [x2, y2] = pt(k + 1), s = shaded.includes(k);
      return <path key={k} d={`M60 60 L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={s ? on : off} stroke="#55625c" strokeWidth="0.8"
        role={onSector ? "button" : undefined} tabIndex={onSector ? 0 : undefined} aria-label={onSector ? `Juring ${k + 1}` : undefined} aria-pressed={onSector ? s : undefined} className={onSector ? "cursor-pointer" : undefined}
        onClick={onSector ? () => onSector(k) : undefined} onKeyDown={onSector ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSector(k); } } : undefined} />; })}
  </svg>;
}

/* ---------- Foto keluarga yang diubah ukurannya ---------- */
export function Picture({ w, h, scale = 8, label }: { w: number; h: number; scale?: number; label: string }) {
  const id = useId();
  return <figure className="flex flex-col items-center">
    <svg width={w * scale} height={h * scale} viewBox="0 0 120 90" preserveAspectRatio="none" role="img" aria-label={`${label}, ${idn(w)} cm × ${idn(h)} cm`} className="max-w-full">
      <defs><clipPath id={id}><rect width="120" height="90" /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <rect width="120" height="90" fill="#bfe3f5" /><circle cx="88" cy="26" r="12" fill="#f5b014" />
        <path d="M0 62 Q30 40 60 58 T120 52 V90 H0 Z" fill="#3fa36b" /><path d="M0 76 Q40 60 80 74 T120 70 V90 H0 Z" fill="#2b8a3e" />
        <path d="M18 26 q6 -8 14 -2 q8 -4 12 4 q-13 4 -26 -2 z" fill="#ffffff" />
      </g>
      <rect width="120" height="90" fill="none" stroke="#7a4a1e" strokeWidth="4" />
    </svg>
    <figcaption className="mt-1 text-xs font-bold">{label}</figcaption><span className="text-xs text-base-content/70">{idn(w)} cm × {idn(h)} cm</span>
  </figure>;
}

/* ---------- Skala garis pada peta ---------- */
export function MapScale({ km, cm, segments = 3 }: { km: number; cm: number; segments?: number }) {
  const u = 36;
  return <figure className="w-full max-w-sm rounded-xl bg-[#d6ecf7] p-3">
    <svg viewBox={`0 0 ${segments * u + 40} 46`} className="w-full" role="img" aria-label={`Skala garis: setiap ${cm} cm mewakili ${km} km`}>
      {Array.from({ length: segments }, (_, k) => <rect key={k} x={20 + k * u} y="18" width={u} height="9" fill={k % 2 ? "#1f2a25" : "#ffffff"} stroke="#1f2a25" />)}
      {Array.from({ length: segments + 1 }, (_, k) => <text key={k} x={20 + k * u} y="13" fontSize="8.5" textAnchor="middle" fill="#1f2a25">{idn(k * km)}</text>)}
      <text x={20 + segments * u + 4} y="25" fontSize="8" fill="#1f2a25">km</text>
      <text x={20 + u * 1.5} y="40" fontSize="8" textAnchor="middle" fill="#1f2a25">garis hitam = {idn(cm)} cm pada peta</text>
    </svg>
  </figure>;
}

/* ---------- Denah sederhana ---------- */
export function Plan({ w, h, drawW, drawH }: { w: number; h: number; drawW: number; drawH: number }) {
  return <figure className="w-full max-w-60">
    <svg viewBox="0 0 120 150" className="w-full" role="img" aria-label={`Denah kamar ${drawW} cm × ${drawH} cm untuk ukuran sebenarnya ${w} m × ${h} m`}>
      <rect x="20" y="10" width="80" height="106" fill="#fff8ec" stroke="#1f2a25" strokeWidth="3" />
      <rect x="26" y="16" width="30" height="20" fill="#cfe3fb" stroke="#55625c" strokeWidth=".8" /><text x="41" y="29" fontSize="6.5" textAnchor="middle" fill="#1f2a25">kasur</text>
      <rect x="74" y="88" width="20" height="22" fill="#e9d3b4" stroke="#55625c" strokeWidth=".8" /><text x="84" y="101" fontSize="6" textAnchor="middle" fill="#1f2a25">lemari</text>
      <path d="M60 116 a14 14 0 0 1 14 -14" fill="none" stroke="#55625c" strokeWidth=".8" /><line x1="60" y1="116" x2="60" y2="102" stroke="#55625c" />
      <line x1="20" y1="128" x2="100" y2="128" stroke="#1c64b5" /><text x="60" y="138" fontSize="8" textAnchor="middle" fill="#1c64b5">{drawW} cm (sebenarnya {w} m)</text>
      <line x1="108" y1="10" x2="108" y2="116" stroke="#1c64b5" /><text x="112" y="66" fontSize="7.5" fill="#1c64b5" transform="rotate(90 112 66)" textAnchor="middle">{drawH} cm ({h} m)</text>
    </svg>
  </figure>;
}

/* ---------- Balok sampel ---------- */
export function Box({ p, l, t, mass, label }: { p: number; l: number; t: number; mass: number; label: string }) {
  const s = 12, dx = l * s * 0.5, dy = l * s * 0.35, W = p * s, H = t * s;
  return <figure className="flex flex-col items-center">
    <svg viewBox={`0 0 ${W + dx + 50} ${H + dy + 26}`} className="w-44" role="img" aria-label={`${label}: balok ${p} cm × ${l} cm × ${t} cm, massa ${mass} gram`}>
      <g transform={`translate(4 ${dy + 4})`}>
        <path d={`M0 0 l${dx} ${-dy} h${W} l${-dx} ${dy} z`} fill="#b07a45" stroke="#5a3a1c" />
        <path d={`M${W} 0 l${dx} ${-dy} v${H} l${-dx} ${dy} z`} fill="#7a4a1e" stroke="#5a3a1c" />
        <rect x="0" y="0" width={W} height={H} fill="#9a6232" stroke="#5a3a1c" />
        <text x={W / 2} y={H + 11} fontSize="9" textAnchor="middle" fill="#1f2a25">{p} cm</text>
        <text x={W + dx + 4} y={H / 2 - dy / 2} fontSize="9" fill="#1f2a25">{t} cm</text>
        <text x={W + dx / 2 + 4} y={H + 4 - dy / 2} fontSize="9" fill="#1f2a25">{l} cm</text>
      </g>
    </svg>
    <figcaption className="text-xs font-bold">{label}, massa {mass} gram</figcaption>
  </figure>;
}

/* ---------- Botol susu cokelat ---------- */
export function Bottle({ shade, label }: { shade: number; label: string }) {
  const c = `hsl(25 ${45 + shade * 20}% ${70 - shade * 45}%)`;
  return <figure className="flex flex-col items-center">
    <svg viewBox="0 0 40 80" className="h-24 w-12" aria-hidden="true">
      <rect x="14" y="2" width="12" height="7" rx="2" fill="#a33b2b" />
      <path d="M15 9 h10 v8 q8 6 8 16 v38 q0 6 -6 6 h-14 q-6 0 -6 -6 v-38 q0 -10 8 -16 z" fill="#eef6fb" stroke="#8fb7d3" />
      <path d="M8.5 30 q1 -6 6.5 -9 h10 q5.5 3 6.5 9 v41 q0 4.5 -4.5 4.5 h-14 q-4.5 0 -4.5 -4.5 z" fill={c} />
    </svg>
    <figcaption className="text-xs font-bold">{label}</figcaption>
  </figure>;
}
