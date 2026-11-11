import type { ReactNode } from "react";
import { idNumber, type Scene, type Thing } from "@/data/grade-three-measurement";

const s = { stroke: "#17352a", strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Ilustrasi benda, alat ukur, dan bahan (SVG buatan sendiri, viewBox 48×48). */
export function ThingIcon({ thing, className = "size-12" }: { thing: Thing; className?: string }) {
  const body: Record<Thing, ReactNode> = {
    pencil: <><path d="M6 30l26-26 6 6-26 26-8 2z" fill="#f59e0b" {...s} /><path d="M6 30l6 6-8 2z" fill="#fde68a" {...s} /><path d="M32 4l6 6" stroke="#e11d48" strokeWidth="4" /></>,
    pen: <><rect x="4" y="20" width="36" height="7" rx="3" fill="#2563eb" {...s} /><path d="M40 21l5 2.5-5 2.5z" fill="#94a3b8" {...s} /><path d="M10 20v-3h14v3" fill="none" {...s} /></>,
    crayon: <><rect x="10" y="18" width="30" height="11" rx="3" fill="#22c55e" {...s} /><path d="M10 19l-7 4.5 7 4.5z" fill="#22c55e" {...s} /><rect x="16" y="20" width="16" height="7" fill="#fef9c3" /></>,
    marker: <><rect x="6" y="18" width="32" height="11" rx="2" fill="#f8fafc" {...s} /><path d="M38 20h6v7h-6z" fill="#17352a" {...s} /><rect x="13" y="20" width="16" height="7" fill="#bfdbfe" /></>,
    eraser: <><rect x="8" y="16" width="32" height="16" rx="4" fill="#fda4af" {...s} /><rect x="8" y="16" width="12" height="16" rx="4" fill="#60a5fa" {...s} /></>,
    cupboard: <><rect x="10" y="4" width="28" height="40" rx="2" fill="#d97706" {...s} /><path d="M24 4v40M20 22v4M28 22v4" {...s} /></>,
    window: <><rect x="8" y="6" width="32" height="36" fill="#e0f2fe" stroke="#7c3aed" strokeWidth="2.5" /><path d="M24 6v36M8 14h32M8 36h32" stroke="#7c3aed" strokeWidth="2" /></>,
    door: <><rect x="12" y="4" width="24" height="42" rx="1" fill="#c2774a" {...s} /><rect x="16" y="9" width="16" height="12" fill="none" {...s} /><rect x="16" y="28" width="16" height="12" fill="none" {...s} /><circle cx="31" cy="25" r="1.6" fill="#facc15" /></>,
    board: <><rect x="4" y="8" width="40" height="26" rx="2" fill="#166534" stroke="#a16207" strokeWidth="2.5" /><path d="M10 16h18M10 22h24" stroke="#f0fdf4" strokeWidth="1.5" /><path d="M14 34l-3 10M34 34l3 10" {...s} /></>,
    fence: <>{[6, 16, 26, 36].map(x => <path key={x} d={`M${x} 42V14l3-5 3 5v28z`} fill="#fef3c7" {...s} />)}<path d="M4 22h40M4 34h40" {...s} /></>,
    table: <><rect x="4" y="16" width="40" height="6" rx="1" fill="#b45309" {...s} /><path d="M9 22v20M39 22v20" stroke="#b45309" strokeWidth="3" /></>,
    book: <><rect x="10" y="6" width="28" height="36" rx="2" fill="#60a5fa" {...s} /><path d="M14 6v36" stroke="#1e3a8a" strokeWidth="2" /><text x="25" y="22" fontSize="7" fontWeight="800" fill="#fde047" textAnchor="middle">MATH</text></>,
    fork: <><path d="M14 6v12c0 3 2 4 3 4v20" fill="none" stroke="#94a3b8" strokeWidth="2.5" /><path d="M11 6v10M17 6v10M20 6v12c0 3-2 4-3 4" fill="none" stroke="#94a3b8" strokeWidth="1.6" /><ellipse cx="32" cy="12" rx="5" ry="7" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.6" /><path d="M32 19v23" stroke="#94a3b8" strokeWidth="2.5" /></>,
    money: <><rect x="3" y="14" width="42" height="20" rx="2" fill="#bbf7d0" {...s} /><text x="24" y="28" fontSize="9" fontWeight="800" fill="#15803d" textAnchor="middle">Rp20.000</text></>,
    tv: <><rect x="4" y="8" width="40" height="26" rx="2" fill="#1e293b" {...s} /><rect x="7" y="11" width="34" height="20" fill="#7dd3fc" /><path d="M16 40h16M24 34v6" {...s} /></>,
    carpet: <><path d="M10 8h28l4 32H6z" fill="#fcd34d" {...s} /><path d="M24 12l12 14-12 12-12-12z" fill="none" stroke="#b45309" strokeWidth="1.6" /></>,
    chair: <><path d="M14 4v40M14 24h20v20M14 24h20" fill="none" stroke="#92400e" strokeWidth="3" /><rect x="14" y="4" width="18" height="12" rx="2" fill="#d97706" {...s} /></>,
    ruler: <><rect x="2" y="16" width="44" height="14" rx="1.5" fill="#fefce8" {...s} />{Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${5 + i * 3.8} 16v${i % 5 ? 4 : 7}`} stroke="#17352a" strokeWidth="1" />)}</>,
    tape: <><rect x="4" y="12" width="24" height="24" rx="6" fill="#ef4444" {...s} /><circle cx="16" cy="24" r="6" fill="#fca5a5" {...s} /><path d="M28 30h16v5H28z" fill="#facc15" {...s} /><path d="M32 30v3M36 30v3M40 30v3" stroke="#17352a" strokeWidth="1" /></>,
    sewing: <><path d="M8 30c0-12 32-12 32 0s-26 8-26 0 18-8 18 0" fill="none" stroke="#eab308" strokeWidth="5" /><path d="M8 30c0-12 32-12 32 0s-26 8-26 0 18-8 18 0" fill="none" stroke="#17352a" strokeWidth="0.8" strokeDasharray="1 2.5" /></>,
    stadiometer: <><path d="M24 2v38" stroke="#64748b" strokeWidth="3" /><path d="M24 12h8" stroke="#17352a" strokeWidth="2.5" /><path d="M14 46l4-6h14l2 6z" fill="#475569" {...s} />{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M22 ${6 + i * 4.5}h-2`} stroke="#17352a" />)}</>,
    digital: <><path d="M6 18h36l-4 22H10z" fill="#cbd5e1" {...s} /><rect x="8" y="10" width="32" height="8" rx="2" fill="#e2e8f0" {...s} /><rect x="12" y="25" width="16" height="8" rx="1" fill="#bef264" {...s} /><circle cx="33" cy="29" r="2" fill="#38bdf8" /></>,
    bathroom: <><rect x="8" y="8" width="32" height="34" rx="5" fill="#86efac" {...s} /><rect x="14" y="12" width="20" height="8" rx="1" fill="#f8fafc" {...s} /><path d="M18 16h12" stroke="#17352a" strokeWidth="1" /></>,
    platform: <><path d="M14 30h20l4 12H10z" fill="#94a3b8" {...s} /><path d="M18 30V10M30 30V10" stroke="#475569" strokeWidth="2" /><path d="M14 8h22" stroke="#dc2626" strokeWidth="4" /><path d="M30 8v8l-3 6h6l-3-6" fill="none" {...s} /><circle cx="12" cy="44" r="2.5" fill="#17352a" /><circle cx="36" cy="44" r="2.5" fill="#17352a" /></>,
    dial: <><path d="M6 14h36l-2 4H8z" fill="#7dd3fc" {...s} /><path d="M12 18h24l3 26H9z" fill="#ef4444" {...s} /><circle cx="24" cy="31" r="9" fill="#fef9c3" {...s} /><path d="M24 31l5-3" stroke="#17352a" strokeWidth="1.6" /></>,
    balance: <><path d="M4 36h40l-3 6H7z" fill="#60a5fa" {...s} /><rect x="8" y="26" width="14" height="4" fill="#93c5fd" {...s} /><path d="M28 22c0 8 16 8 16 0z" fill="#e2e8f0" {...s} /><path d="M15 30v6M36 30v6" stroke="#17352a" /></>,
    mango: <><path d="M10 26c0-12 16-18 26-10 8 7 2 24-12 24-8 0-14-6-14-14z" fill="#84cc16" {...s} /><path d="M30 12c2-4 6-5 8-4" stroke="#15803d" strokeWidth="2" fill="none" /></>,
    corn: <><path d="M24 4c8 6 8 30 0 38-8-8-8-32 0-38z" fill="#facc15" {...s} /><path d="M14 44c0-14 4-22 10-22M34 44c0-14-4-22-10-22" fill="#4ade80" {...s} /></>,
    carrot: <><path d="M8 40L34 14l6 6L14 46z" fill="#fb923c" {...s} /><path d="M36 12l6-8M38 16l8-2M34 10l2-8" stroke="#16a34a" strokeWidth="2.5" /></>,
    beans: <>{[0, 4, 8].map(d => <path key={d} d={`M4 ${14 + d}c14 0 24 4 30 12s8 14 10 14`} fill="none" stroke="#65a30d" strokeWidth="2.4" />)}</>,
    strawberry: <><path d="M10 18c0-6 28-6 28 0 0 12-8 24-14 26-6-2-14-14-14-26z" fill="#ef4444" {...s} /><path d="M14 14l10 6 10-6-6-4-4 4-4-4z" fill="#16a34a" {...s} />{[[18, 24], [28, 24], [23, 31], [19, 36], [28, 34]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="0.9" fill="#fde68a" />)}</>,
    rice: <><path d="M10 14c4-6 24-6 28 0l4 26c0 4-36 4-36 0z" fill="#a16207" {...s} /><path d="M12 14c4-5 20-5 24 0" fill="#f8fafc" {...s} /><rect x="13" y="24" width="22" height="9" rx="1" fill="#fef3c7" /><text x="24" y="31" fontSize="6" fontWeight="800" fill="#78350f" textAnchor="middle">BERAS</text></>,
    chicken: <><path d="M8 26c0-10 14-14 24-10 10 4 10 18 0 22-10 4-24 0-24-12z" fill="#fde7c4" {...s} /><path d="M38 30l6 4M38 24l6-2" stroke="#17352a" strokeWidth="1.5" /></>,
    orange: <><circle cx="18" cy="28" r="10" fill="#fb923c" {...s} /><circle cx="31" cy="26" r="10" fill="#f97316" {...s} /><path d="M30 16c2-4 6-4 7-3" stroke="#16a34a" strokeWidth="2" fill="none" /></>,
    egg: <>{[[14, 30], [26, 24], [34, 33]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx="7" ry="9" fill="#fcd9a8" {...s} />)}</>,
    sugar: <><path d="M10 10h28l2 32H8z" fill="#f8fafc" {...s} /><text x="24" y="29" fontSize="8" fontWeight="800" fill="#475569" textAnchor="middle">GULA</text></>,
    flour: <><path d="M10 10h28l2 32H8z" fill="#fef3c7" {...s} /><text x="24" y="29" fontSize="7" fontWeight="800" fill="#92400e" textAnchor="middle">TEPUNG</text></>,
    butter: <><path d="M8 22l16-8 16 8v14l-16 8-16-8z" fill="#fde047" {...s} /><path d="M8 22l16 8 16-8M24 30v14" fill="none" {...s} /></>,
    apple: <><path d="M24 14c-8-6-18 0-16 12 2 12 10 18 16 14 6 4 14-2 16-14 2-12-8-18-16-12z" fill="#ef4444" {...s} /><path d="M24 14c0-4 2-8 6-9" stroke="#16a34a" strokeWidth="2.4" fill="none" /></>,
    goat: <><ellipse cx="22" cy="28" rx="13" ry="8" fill="#f1f5f9" {...s} /><circle cx="37" cy="20" r="5" fill="#f1f5f9" {...s} /><path d="M35 15l-2-6M39 15l2-6" {...s} /><path d="M14 35v9M28 35v9" stroke="#17352a" strokeWidth="2" /></>,
    cement: <><path d="M8 14h32l3 26H5z" fill="#cbd5e1" {...s} /><text x="24" y="31" fontSize="7" fontWeight="800" fill="#334155" textAnchor="middle">SEMEN</text></>,
  };
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true">{body[thing]}</svg>;
}

/* ---------- Penggaris dengan benda ---------- */
const objColor = { pencil: "#3b82f6", pen: "#f97316", crayon: "#22c55e", marker: "#f8fafc", eraser: "#fda4af" } as const;
export function RulerScene({ max, objects, className = "" }: { max: number; objects: { thing: keyof typeof objColor; from: number; to: number; label?: string }[]; className?: string }) {
  const W = 340, pad = 14, unit = (W - 2 * pad) / max, rowH = 18, top = objects.length * (rowH + 6) + 4;
  return <svg viewBox={`0 0 ${W} ${top + 46}`} className={`w-full max-w-md ${className}`} role="img" aria-label={objects.map(o => `${o.label ?? o.thing} dari angka ${o.from} sampai ${o.to}`).join(", ") + ", di atas penggaris"}>
    {objects.map((o, i) => {
      const x1 = pad + o.from * unit, x2 = pad + o.to * unit, y = 4 + i * (rowH + 6), c = objColor[o.thing];
      return <g key={i}>
        {o.thing === "pencil" ? <><rect x={x1} y={y + 3} width={x2 - x1 - 12} height={rowH - 6} rx="2" fill={c} {...s} /><rect x={x1} y={y + 3} width="8" height={rowH - 6} rx="2" fill="#f43f5e" {...s} /><path d={`M${x2 - 12} ${y + 3}L${x2} ${y + rowH / 2}L${x2 - 12} ${y + rowH - 3}z`} fill="#fde68a" {...s} /></>
          : o.thing === "crayon" ? <><rect x={x1 + 10} y={y + 2} width={x2 - x1 - 10} height={rowH - 4} rx="3" fill={c} {...s} /><path d={`M${x1 + 10} ${y + 3}L${x1} ${y + rowH / 2}L${x1 + 10} ${y + rowH - 3}z`} fill={c} {...s} /><rect x={x1 + 18} y={y + 5} width={Math.max(6, x2 - x1 - 34)} height={rowH - 10} fill="#fef9c3" /></>
          : o.thing === "pen" ? <><rect x={x1} y={y + 4} width={x2 - x1 - 10} height={rowH - 8} rx="3" fill={c} {...s} /><path d={`M${x2 - 10} ${y + 5}L${x2} ${y + rowH / 2}L${x2 - 10} ${y + rowH - 5}z`} fill="#94a3b8" {...s} /></>
          : <rect x={x1} y={y + 2} width={x2 - x1} height={rowH - 4} rx="3" fill={c} {...s} />}
        <path d={`M${x1} ${y}V${top + 6}M${x2} ${y}V${top + 6}`} stroke="#e11d48" strokeDasharray="3 2" strokeWidth="1" />
        {o.label && <text x={(x1 + x2) / 2} y={y + rowH / 2 + 3} fontSize="8" textAnchor="middle" fontWeight="700" fill="#17352a">{o.label}</text>}
      </g>;
    })}
    <rect x="2" y={top + 4} width={W - 4} height="38" rx="3" fill="#fefce8" {...s} />
    {Array.from({ length: max * 2 + 1 }, (_, k) => { const x = pad + k * unit / 2, major = k % 2 === 0; return <g key={k}>
      <path d={`M${x} ${top + 4}v${major ? 12 : 7}`} stroke="#17352a" strokeWidth={major ? 1.2 : 0.8} />
      {major && <text x={x} y={top + 28} fontSize="9" textAnchor="middle" fill="#17352a">{k / 2}</text>}
    </g>; })}
    <text x={W - 10} y={top + 38} fontSize="8" textAnchor="end" fill="#64748b">cm</text>
  </svg>;
}

/* ---------- Timbangan ---------- */
export function DigitalScale({ display, thing, label }: { display: string; thing: Thing; label?: string }) {
  return <figure className="flex flex-col items-center">
    <div className="relative">
      <ThingIcon thing={thing} className="absolute -top-9 left-1/2 size-14 -translate-x-1/2" />
      <svg viewBox="0 0 120 70" className="mt-8 w-32" aria-hidden="true">
        <path d="M10 18h100l-8 44H18z" fill="#94a3b8" {...s} /><rect x="14" y="8" width="92" height="12" rx="3" fill="#e2e8f0" {...s} />
        <rect x="28" y="30" width="54" height="20" rx="2" fill="#bef264" {...s} /><circle cx="92" cy="40" r="4" fill="#38bdf8" />
        <text x="76" y="45" fontSize="15" fontFamily="monospace" fontWeight="700" textAnchor="end" fill="#14532d">{display}</text>
      </svg>
    </div>
    {label && <figcaption className="text-xs font-bold">{label}</figcaption>}
    <span className="sr-only">Timbangan digital menunjukkan {display}</span>
  </figure>;
}

/** Timbangan duduk: angka 0 sampai max kg, 10 garis kecil (100 gram) antara dua angka. */
export function DialScale({ grams, max, thing }: { grams: number; max: number; thing: Thing }) {
  const steps = max * 10, angle = (g: number) => -150 + (g / (max * 1000)) * 300;
  const pt = (a: number, r: number) => [60 + r * Math.sin(a * Math.PI / 180), 62 - r * Math.cos(a * Math.PI / 180)];
  const [nx, ny] = pt(angle(grams), 30);
  return <figure className="flex flex-col items-center">
    <ThingIcon thing={thing} className="-mb-3 size-12" />
    <svg viewBox="0 0 120 120" className="w-44" role="img" aria-label={`Timbangan duduk 0 sampai ${max} kg dengan garis setiap 100 gram`}>
      <path d="M10 14h100l-6 8H16z" fill="#7dd3fc" {...s} /><path d="M22 22h76l8 92H14z" fill="#ef4444" {...s} />
      <circle cx="60" cy="62" r="40" fill="#fefce8" {...s} />
      {Array.from({ length: steps + 1 }, (_, k) => { const a = angle(k * 100), major = k % 10 === 0; const [x1, y1] = pt(a, 38), [x2, y2] = pt(a, major ? 31 : 34); return <g key={k}>
        <path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#17352a" strokeWidth={major ? 1.4 : 0.7} />
        {major && (() => { const [tx, ty] = pt(a, 25); return <text x={tx} y={ty + 3} fontSize="8" textAnchor="middle" fontWeight="700" fill="#17352a">{k / 10}</text>; })()}
      </g>; })}
      <path d={`M60 62L${nx} ${ny}`} stroke="#dc2626" strokeWidth="2" strokeLinecap="round" /><circle cx="60" cy="62" r="3" fill="#dc2626" />
      <text x="60" y="88" fontSize="7" textAnchor="middle" fill="#64748b">kg</text>
    </svg>
  </figure>;
}

/** Timbangan kodok: bandul 1 kg di kiri, benda di kanan. */
export function BalanceScale({ weights, thing, tilt = 0, extra }: { weights: number; thing: Thing; tilt?: number; extra?: ReactNode }) {
  return <svg viewBox="0 0 160 90" className="w-full max-w-60" role="img" aria-label={`Timbangan kodok dengan ${weights} bandul 1 kg`}>
    <g transform={`rotate(${tilt} 80 52)`}>
      <rect x="14" y="44" width="48" height="6" rx="2" fill="#93c5fd" {...s} />
      <path d="M96 40c0 14 50 14 50 0z" fill="#e2e8f0" {...s} />
      {Array.from({ length: weights }, (_, i) => <g key={i} transform={`translate(${18 + (i % 5) * 9} ${30 - Math.floor(i / 5) * 13})`}><rect width="8" height="13" rx="2" fill="#facc15" {...s} /><text x="4" y="10" fontSize="7" fontWeight="800" textAnchor="middle" fill="#17352a">1</text></g>)}
      {extra}
      <foreignObject x="102" y="10" width="38" height="34"><ThingIcon thing={thing} className="size-full" /></foreignObject>
    </g>
    <path d="M78 52v16" stroke="#17352a" strokeWidth="2" /><path d="M6 70h148l-6 14H12z" fill="#60a5fa" {...s} />
  </svg>;
}

/* ---------- Penampil adegan soal ---------- */
export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "ruler": return <RulerScene max={scene.max} objects={scene.objects} />;
    case "digital": return <DigitalScale display={scene.display} thing={scene.thing} label={scene.label} />;
    case "digitals": return <div className="flex flex-wrap justify-center gap-4">{scene.items.map(it => <DigitalScale key={it.label} {...it} />)}</div>;
    case "dial": return <DialScale grams={scene.grams} max={scene.max} thing={scene.thing} />;
    case "balance": return <BalanceScale weights={scene.weights} thing={scene.thing} />;
    case "bags": return <div className="flex flex-wrap items-end gap-3">{scene.items.map((it, i) => <figure key={i} className="text-center"><ThingIcon thing={it.thing} className="size-16" /><figcaption className="text-sm font-bold">{idNumber(it.grams)} gram</figcaption></figure>)}</div>;
    case "plants": return <div className="flex items-end gap-4" role="img" aria-label={`Tinggi tanaman ${scene.heights.join(", ")} cm`}>{scene.heights.map((h, i) => <figure key={i} className="flex flex-col items-center">
      <svg viewBox="0 0 60 100" className="w-16" style={{ height: `${50 + h * 2.2}px` }} preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M30 64V20" stroke="#15803d" strokeWidth="3" /><circle cx="30" cy="20" r="14" fill="#22c55e" {...s} /><circle cx="20" cy="34" r="9" fill="#16a34a" {...s} /><circle cx="40" cy="32" r="9" fill="#16a34a" {...s} /><path d="M12 64h36l-5 34H17z" fill={["#7dd3fc", "#cbd5e1", "#fda4af"][i % 3]} {...s} /></svg>
      <figcaption className="text-xs font-bold">Pot {i + 1}<br /><span className="text-sm">{h} cm</span></figcaption></figure>)}</div>;
    case "scales": return <div className="flex flex-wrap gap-3">{(["digital", "bathroom", "platform"] as const).map((t, i) => <figure key={t} className="flex flex-col items-center rounded-lg border border-base-300 bg-base-100 p-2"><span className="badge badge-sm badge-neutral">{i + 1}</span><ThingIcon thing={t} className="size-14" /><figcaption className="text-[10px] font-semibold">{["Timbangan digital", "Timbangan badan", "Timbangan besar"][i]}</figcaption></figure>)}</div>;
    case "table": return <table className="table table-sm max-w-md bg-base-100"><thead><tr>{scene.head.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{scene.rows.map(r => <tr key={r.join()}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>;
    case "fabric": return <div className="flex items-center gap-3"><svg viewBox="0 0 80 40" className="w-24" aria-hidden="true"><rect x="4" y="6" width="56" height="28" rx="14" fill="#a78bfa" {...s} /><ellipse cx="60" cy="20" rx="8" ry="14" fill="#c4b5fd" {...s} /></svg><div className="text-sm"><p className="font-bold">Kain {scene.meters}</p><p>{scene.note}</p></div></div>;
  }
}
