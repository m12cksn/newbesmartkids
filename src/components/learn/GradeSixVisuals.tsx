import { Fragment, useId, type ReactNode } from "react";

const useSvgId = (prefix: string) => `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
import { fracText, type Frac, type Item, type Liquid, type Scene } from "@/data/grade-six-fractions-decimals";

/* ---------- Pecahan bertumpuk di dalam teks ---------- */
export function Fr({ n, d, className = "" }: { n: number | string; d: number | string; className?: string }) {
  return <span className={`inline-flex flex-col items-center align-middle text-[0.95em] font-bold leading-none tabular-nums ${className}`}>
    <span className="sr-only">{n}/{d}</span>
    <span aria-hidden="true" className="px-0.5">{n}</span>
    <span aria-hidden="true" className="h-0 w-full border-t-[1.5px] border-current" />
    <span aria-hidden="true" className="px-0.5 pt-px">{d}</span>
  </span>;
}
/** Mengubah "3/4" di dalam kalimat menjadi pecahan bertumpuk. */
export function MathText({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\d+\/\d+)/g);
  return <>{parts.map((part, i) => {
    const m = part.match(/^(\d+)\/(\d+)$/);
    return m ? <Fr key={i} n={m[1]} d={m[2]} className="mx-0.5" /> : <Fragment key={i}>{part}</Fragment>;
  })}</>;
}

/* ---------- Benda nyata (SVG buatan sendiri) ---------- */
export function Bucket({ color = "#dc4b3e", className = "h-12 w-11" }: { color?: string; className?: string }) {
  return <svg viewBox="0 0 44 48" className={className} aria-hidden="true">
    <path d="M8 14C8 3 36 3 36 14" fill="none" stroke="#9ca3af" strokeWidth="2.5" />
    <path d="M6 14h32l-4 30H10z" fill={color} />
    <path d="M6 14h32l-.7 5H6.7z" fill="#000" opacity=".15" />
    <ellipse cx="22" cy="14" rx="16" ry="3" fill="#f8fafc" stroke={color} strokeWidth="1.5" />
    <path d="M13 22l1.6 18" stroke="#fff" strokeWidth="2" opacity=".35" strokeLinecap="round" />
  </svg>;
}

function Leaves({ x, y, w }: { x: number; y: number; w: number }) {
  return <g stroke="#14532d" strokeWidth=".8" fill="#16a34a">
    {Array.from({ length: Math.max(2, Math.round(w / 9)) }, (_, i) => {
      const cx = x + 5 + i * (w - 10) / Math.max(1, Math.round(w / 9) - 1);
      return <path key={i} d={`M${cx} ${y + 7}c-3-3-4-5-2-7c1 2 2 3 2 5c0-3 1-5 3-6c1 3 0 5-3 8z`} />;
    })}
  </g>;
}

/** Petak kebun 1 m² dibagi menjadi beberapa bedeng. */
export function GardenPlot({ parts, filled, className = "w-20" }: { parts: number; filled: number; className?: string }) {
  const h = 60 / parts;
  return <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    {Array.from({ length: parts }, (_, i) => {
      const y = 2 + (parts - 1 - i) * h;
      const on = i < filled;
      return <g key={i}>
        <rect x="2" y={y + .6} width="60" height={h - 1.2} rx="2" fill={on ? "#4ade80" : "#fff"} stroke="#15803d" strokeWidth="1" />
        {on && <Leaves x={2} y={y + h / 2 - 5} w={60} />}
      </g>;
    })}
  </svg>;
}

const treeFruit: Record<Item, { fill: string; label: string }> = {
  mango: { fill: "#eab308", label: "mangga" }, orange: { fill: "#f97316", label: "jeruk" },
  guava: { fill: "#a3e635", label: "jambu" }, pastel: { fill: "#f59e0b", label: "pastel" },
};
export const itemName = (item: Item) => item === "pastel" ? "Kue pastel" : `Pohon ${treeFruit[item].label}`;

export function Tree({ item = "mango", fruit = true, className = "size-9" }: { item?: Item; fruit?: boolean; className?: string }) {
  if (item === "pastel") return <Pastel className={className} />;
  const f = treeFruit[item].fill;
  return <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
    <path d="M18 24h4l1 14h-6z" fill="#92400e" />
    <circle cx="13" cy="17" r="9" fill="#15803d" /><circle cx="27" cy="17" r="9" fill="#166534" /><circle cx="20" cy="10" r="9" fill="#16a34a" />
    {fruit && (item === "mango"
      ? <><ellipse cx="13" cy="19" rx="2.2" ry="3" fill={f} /><ellipse cx="25" cy="13" rx="2.2" ry="3" fill={f} /><ellipse cx="28" cy="21" rx="2.2" ry="3" fill={f} /></>
      : <><circle cx="13" cy="19" r="2.5" fill={f} /><circle cx="24" cy="12" r="2.5" fill={f} /><circle cx="28" cy="21" r="2.5" fill={f} /><circle cx="18" cy="8" r="2.2" fill={f} /></>)}
  </svg>;
}

export function Pastel({ className = "size-9", eaten = false }: { className?: string; eaten?: boolean }) {
  return <svg viewBox="0 0 40 30" className={className} aria-hidden="true" opacity={eaten ? .35 : 1}>
    <path d="M4 24C4 10 36 10 36 24z" fill="#f2b85b" stroke="#b7791f" strokeWidth="1.2" />
    <path d="M6 15c3 3 5-2 8 1s5-3 8 0 5-3 8 0 4-1 5 0" fill="none" stroke="#b7791f" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4 24h32" stroke="#b7791f" strokeWidth="1.4" />
  </svg>;
}

export function Bottle({ fill = 1, label = "1 L", className = "h-20 w-10", color = "#38bdf8" }: { fill?: number; label?: string; className?: string; color?: string }) {
  const top = 22, bottom = 76, level = bottom - (bottom - top) * fill, id = useSvgId("bottle");
  return <svg viewBox="0 0 40 80" className={className} aria-hidden="true">
    <defs><clipPath id={id}><path d="M15 10h10v6c6 3 9 6 9 12v46a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V28c0-6 3-9 9-12z" /></clipPath></defs>
    <rect x="14" y="2" width="12" height="8" rx="2" fill="#0369a1" />
    <g clipPath={`url(#${id})`}><rect x="0" y="0" width="40" height="80" fill="#f0f9ff" /><rect x="0" y={level} width="40" height={80 - level} fill={color} opacity=".75" /></g>
    <path d="M15 10h10v6c6 3 9 6 9 12v46a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V28c0-6 3-9 9-12z" fill="none" stroke="#0369a1" strokeWidth="1.5" />
    <rect x="9" y="44" width="22" height="12" rx="2" fill="#fff" opacity=".85" /><text x="20" y="53" fontSize="8" textAnchor="middle" fontWeight="700" fill="#075985">{label}</text>
  </svg>;
}

export function Glass({ level = 0, className = "h-14 w-10", color = "#38bdf8" }: { level?: number; className?: string; color?: string }) {
  const top = 6, bottom = 50, y = bottom - (bottom - top) * Math.min(1, level), id = useSvgId("glass");
  return <svg viewBox="0 0 36 54" className={className} aria-hidden="true">
    <defs><clipPath id={id}><path d="M4 4h28l-4 46H8z" /></clipPath></defs>
    <g clipPath={`url(#${id})`}><rect x="0" y="0" width="36" height="54" fill="#f8fafc" /><rect x="0" y={y} width="36" height={54 - y} fill={color} opacity=".8" /></g>
    <path d="M4 4h28l-4 46H8z" fill="none" stroke="#64748b" strokeWidth="1.5" />
  </svg>;
}

const liquid: Record<Liquid, { body: string; dark: string; label: string; unit: string }> = {
  juice: { body: "#fb923c", dark: "#c2410c", label: "JERUK", unit: "1 L" },
  guava: { body: "#fb7185", dark: "#be123c", label: "JAMBU", unit: "1 L" },
  water: { body: "#7dd3fc", dark: "#0369a1", label: "AIR", unit: "1 L" },
  sugar: { body: "#f5f5f4", dark: "#78716c", label: "GULA", unit: "1 kg" },
  chocolate: { body: "#92400e", dark: "#451a03", label: "", unit: "1 batang" },
};
export const liquidUnit = (item: Liquid) => liquid[item].unit;

/** Wadah 1 satuan yang dibagi menjadi `split` bagian; `used` bagian sudah terpakai. */
export function Container({ item, split, used = 0, className = "h-24 w-12" }: { item: Liquid; split: number; used?: number; className?: string }) {
  const c = liquid[item];
  if (item === "chocolate") return <svg viewBox="0 0 30 80" className={className} aria-hidden="true">
    <rect x="3" y="3" width="24" height="74" rx="3" fill="#451a03" />
    {Array.from({ length: split }, (_, i) => {
      const h = 70 / split; const y = 5 + i * h;
      return <rect key={i} x="5" y={y + 1} width="20" height={h - 2} rx="1.5" fill={i < used ? "#fde68a" : c.body} stroke="#2b1102" strokeWidth=".8" />;
    })}
  </svg>;
  if (item === "sugar") return <svg viewBox="0 0 44 80" className={className} aria-hidden="true">
    <path d="M8 10c4-6 24-6 28 0l4 62a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#fafaf9" stroke="#78716c" strokeWidth="1.5" />
    <path d="M10 7c6 3 18 3 24 0" stroke="#78716c" strokeWidth="1.5" fill="none" />
    {Array.from({ length: split - 1 }, (_, i) => { const y = 14 + (i + 1) * 60 / split; return <path key={i} d={`M5 ${y}h34`} stroke="#a8a29e" strokeDasharray="3 2" />; })}
    {used > 0 && <rect x="5" y={74 - used * 60 / split} width="34" height={used * 60 / split} fill="#d6d3d1" opacity=".8" />}
    <text x="22" y="30" fontSize="8" textAnchor="middle" fontWeight="800" fill="#57534e">GULA</text><text x="22" y="40" fontSize="7" textAnchor="middle" fill="#57534e">1 kg</text>
  </svg>;
  const top = 26, bottom = 74, h = (bottom - top) / split;
  return <svg viewBox="0 0 40 80" className={className} aria-hidden="true">
    <rect x="13" y="3" width="14" height="7" rx="2" fill={c.dark} />
    <path d="M14 10h12v6c8 2 10 5 10 10v48a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V26c0-5 2-8 10-10z" fill="#fff" stroke={c.dark} strokeWidth="1.5" />
    {Array.from({ length: split }, (_, i) => {
      const y = bottom - (i + 1) * h; const empty = i >= split - used;
      return <rect key={i} x="5.2" y={y} width="29.6" height={h} fill={empty ? "#fff" : c.body} stroke={c.dark} strokeWidth=".6" strokeDasharray="2 1.5" opacity={empty ? 1 : .85} />;
    })}
    <text x="20" y="22" fontSize="5" textAnchor="middle" fontWeight="800" fill={c.dark}>{c.label}</text>
  </svg>;
}

export function Jug({ ml, className = "mx-auto block h-24 w-24" }: { ml: number; className?: string }) {
  const bottom = 86, top = 18, y = bottom - (bottom - top) * ml / 1000, id = useSvgId("jug");
  return <svg viewBox="0 0 90 92" className={className} aria-hidden="true">
    <defs><clipPath id={id}><path d="M10 14h52l-4 72H14z" /></clipPath></defs>
    <g clipPath={`url(#${id})`}><rect width="90" height="92" fill="#f0f9ff" /><rect y={y} width="90" height={92 - y} fill="#38bdf8" opacity=".7" /></g>
    <path d="M10 14h52l-4 72H14z" fill="none" stroke="#0369a1" strokeWidth="2" />
    <path d="M62 26c14 0 16 30 0 34" fill="none" stroke="#0369a1" strokeWidth="5" />
    {[0, 250, 500, 750, 1000].map(v => { const ty = bottom - (bottom - top) * v / 1000; return <g key={v}><path d={`M15 ${ty}h${v % 500 ? 6 : 10}`} stroke="#0c4a6e" strokeWidth="1.2" /><text x="28" y={ty + 3} fontSize="7" fill="#0c4a6e">{v} ml</text></g>; })}
  </svg>;
}

export function DigitalScale({ display, item, className = "w-40" }: { display: string; item: "orange" | "tomato" | "salak"; className?: string }) {
  const fruit = { orange: "#f97316", tomato: "#ef4444", salak: "#7c2d12" }[item];
  return <svg viewBox="0 0 120 96" className={className} aria-hidden="true">
    {[[34, 30], [50, 30], [66, 30], [42, 18], [58, 18]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="9" fill={fruit} />{item !== "salak" && <path d={`M${x - 2} ${y - 9}l3-3`} stroke="#15803d" strokeWidth="2" />}</g>)}
    <path d="M16 40h88l-6 6H22z" fill="#cbd5e1" /><rect x="54" y="46" width="12" height="8" fill="#0f766e" />
    <path d="M14 54h92l6 34H8z" fill="#14b8a6" /><rect x="30" y="62" width="60" height="20" rx="3" fill="#ecfeff" stroke="#115e59" />
    <text x="56" y="77" fontSize="13" textAnchor="middle" fontFamily="monospace" fontWeight="700" fill="#134e4a">{display}</text><text x="80" y="70" fontSize="6" fill="#134e4a">KG</text>
  </svg>;
}

/* ---------- Model pecahan ---------- */
export function FractionBar({ per, label, tone = "#059669", className = "" }: { per: Frac; label?: string; tone?: string; className?: string }) {
  const [n, d] = per;
  return <div className={`min-w-0 ${className}`}>
    <div className="grid h-7 gap-px overflow-hidden rounded border border-slate-500 bg-slate-500" style={{ gridTemplateColumns: `repeat(${d}, minmax(0,1fr))` }}>
      {Array.from({ length: d }, (_, i) => <span key={i} style={{ background: i < n ? tone : "#fff" }} />)}
    </div>
    {label && <p className="mt-0.5 text-center text-[11px] font-semibold text-base-content/70">{label}</p>}
  </div>;
}

export function HundredGrid({ shaded, pattern = "columns", className = "w-28" }: { shaded: number; pattern?: "columns" | "blocks"; className?: string }) {
  const on = (i: number) => {
    const col = Math.floor(i / 10), row = i % 10;
    return pattern === "blocks" ? (col < 5 && row < 5) || (col >= 5 && row >= 5) : i < shaded;
  };
  return <div className={`mx-auto grid aspect-square grid-flow-col grid-rows-10 gap-px border border-slate-500 bg-slate-400 ${className}`}>
    {Array.from({ length: 100 }, (_, i) => <span key={i} className={on(i) ? "bg-orange-400" : "bg-white"} />)}
  </div>;
}

function Collection({ label, total, groups, item }: { label: string; total: number; groups: number; item: Item }) {
  const per = total / groups;
  return <figure className="min-w-0">
    <figcaption className="mb-1 text-xs font-bold text-base-content/70">{label} · {groups} kelompok @ {per}</figcaption>
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: groups }, (_, g) => <div key={g} className="flex flex-wrap gap-0.5 rounded-md border border-dashed border-success/50 bg-success/5 p-1">
        {Array.from({ length: per }, (_, i) => <Tree key={i} item={item} className={total > 40 ? "size-5" : "size-7"} />)}
      </div>)}
    </div>
  </figure>;
}

function Table({ head, rows, note }: { head: [string, string]; rows: [string, string][]; note?: string }) {
  return <figure className="max-w-md overflow-hidden rounded-lg border border-base-300 bg-base-100 text-sm">
    <div className="grid grid-cols-2 bg-info/15 px-3 py-1.5 font-bold"><span>{head[0]}</span><span>{head[1]}</span></div>
    {rows.map(([a, b]) => <div key={a} className="grid grid-cols-2 border-t border-base-300 px-3 py-1.5"><span>{a}</span><strong className="tabular-nums">{b}</strong></div>)}
    {note && <figcaption className="border-t border-base-300 px-3 py-1 text-xs text-base-content/60">{note}</figcaption>}
  </figure>;
}

export const placeNames = ["Puluhan", "Satuan", "Persepuluhan", "Perseratusan"] as const;
const placeHead = ["Puluhan", "Satuan", "Per\u00adsepuluhan", "Per\u00adseratusan"];
export function digitsOf(value: string) {
  const [whole, dec = ""] = value.split(",");
  const w = whole.padStart(2, "0"), d = dec.padEnd(2, "0");
  return [w[w.length - 2], w[w.length - 1], d[0], d[1]].map(Number);
}
export function PlaceChart({ values, highlight }: { values: string[]; highlight?: number }) {
  return <div className="max-w-md overflow-hidden rounded-lg border border-base-300 bg-base-100 text-center text-sm">
    <div className="grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] bg-info/15 font-bold"><span className="p-1">Bilangan</span>{placeNames.map((p, i) => <span key={p} className={`hyphens-manual break-words p-1 text-[10px] leading-tight sm:text-xs ${i === 2 ? "border-l-2 border-dashed border-base-content/40" : ""}`}>{placeHead[i]}<span className="block font-normal opacity-70">{["10", "1", "0,1", "0,01"][i]}</span></span>)}</div>
    {values.map(v => <div key={v} className="grid grid-cols-[4.5rem_repeat(4,minmax(0,1fr))] border-t border-base-300"><strong className="p-1.5 tabular-nums">{v}</strong>
      {digitsOf(v).map((d, i) => <span key={i} className={`p-1.5 text-base font-extrabold tabular-nums ${i === 2 ? "border-l-2 border-dashed border-base-content/40" : ""} ${highlight === i ? "bg-warning/50" : ""}`}>{d}</span>)}</div>)}
  </div>;
}

/* ---------- Penampil adegan soal ---------- */
export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "buckets": return <div className="flex flex-wrap gap-3" role="img" aria-label={`${scene.count} ember kecil, setiap ember menyiram ${fracText(scene.per)} meter persegi`}>
      {Array.from({ length: scene.count }, (_, i) => <div key={i} className="flex items-end gap-0.5"><GardenPlot parts={scene.per[1]} filled={scene.per[0]} className="w-14" /><Bucket className="h-9 w-8" /></div>)}
    </div>;
    case "bars": return <div className="grid w-full max-w-md gap-2" role="img" aria-label={`${scene.count} ${scene.item} masing-masing ${fracText(scene.per)}`}>
      {Array.from({ length: scene.count }, (_, i) => scene.item === "pita"
        ? <FractionBar key={i} per={scene.per} label="1 m" tone="#e11d48" />
        : <FractionBar key={i} per={scene.per} label={scene.item === "kain" ? "1 m kain" : undefined} tone={scene.item === "kain" ? "#7c3aed" : "#059669"} />)}
    </div>;
    case "bottles": return <div className="flex flex-wrap gap-1" role="img" aria-label={`${scene.count} botol, masing-masing berisi ${fracText(scene.fill)} liter`}>
      {Array.from({ length: scene.count }, (_, i) => <Bottle key={i} fill={scene.fill[0] / scene.fill[1]} color="#facc15" />)}
    </div>;
    case "collection": return <div className="space-y-2" role="img" aria-label={scene.sets.map(s => s.label).join(" dan ")}>{scene.sets.map(s => <Collection key={s.label} {...s} />)}</div>;
    case "pour": {
      const [n, d] = scene.amount;
      return <div className="flex flex-wrap items-end gap-3" role="img" aria-label={`Botol berisi ${fracText(scene.amount)} liter dituang merata ke ${scene.glasses} gelas`}>
        <div className="text-center"><Bottle fill={n / d} label={`${fracText(scene.amount)} L`} className="h-24 w-12" /><p className="text-xs font-bold"><MathText text={`${fracText(scene.amount)} liter`} /></p></div>
        <span className="pb-8 text-2xl font-bold text-info" aria-hidden="true">→</span>
        <div className="flex gap-1">{Array.from({ length: scene.glasses }, (_, i) => <div key={i} className="text-center"><Glass level={0} className="h-12 w-8" /><p className="text-[10px] font-bold">Gelas {i + 1}</p></div>)}</div>
      </div>;
    }
    case "containers": return <div className="flex flex-wrap gap-1" role="img" aria-label={`${scene.count} wadah ${liquid[scene.item].unit}, setiap wadah dibagi ${scene.split} bagian`}>
      {Array.from({ length: scene.count }, (_, i) => <Container key={i} item={scene.item} split={scene.split} className={scene.count > 6 ? "h-16 w-8" : "h-20 w-10"} />)}
    </div>;
    case "land": return <figure className="max-w-sm">
      <svg viewBox="0 0 200 100" className="w-full" role="img" aria-label={`Tanah dibagi ${scene.parts} bagian, ${scene.filled} bagian akan dibagikan kepada ${scene.split} anak`}>
        <rect x="2" y="2" width="196" height="96" rx="4" fill="#ecfccb" stroke="#4d7c0f" strokeWidth="2" />
        {Array.from({ length: scene.parts }, (_, i) => { const w = 196 / scene.parts; return <g key={i}><rect x={2 + i * w} y="2" width={w} height="96" fill={i < scene.filled ? "#86efac" : "#f7fee7"} stroke="#4d7c0f" />
          {i < scene.filled && Array.from({ length: scene.split - 1 }, (_, s) => <path key={s} d={`M${2 + i * w} ${2 + 96 * (s + 1) / scene.split}h${w}`} stroke="#166534" strokeDasharray="4 3" />)}</g>; })}
      </svg>
      <figcaption className="mt-1 text-xs text-base-content/70">Hijau: <MathText text={`${scene.filled}/${scene.parts}`} /> tanah yang dibagikan. Garis putus-putus membagi untuk {scene.split} anak.</figcaption>
    </figure>;
    case "grid": return <HundredGrid shaded={scene.shaded} pattern={scene.pattern} />;
    case "jug": return <Jug ml={scene.ml} />;
    case "scale": return <DigitalScale display={scene.display} item={scene.item} />;
    case "table": return <Table head={scene.head} rows={scene.rows} note={scene.note} />;
    case "tape": return <div className="max-w-md" role="img" aria-label={`Diagram batang ${scene.total} ${scene.unit} dibagi ${scene.parts} bagian`}>
      <p className="text-center text-xs font-bold">{scene.total} {scene.unit}</p>
      <div className="grid h-8 gap-px border border-slate-600 bg-slate-600" style={{ gridTemplateColumns: `repeat(${scene.parts}, minmax(0,1fr))` }}>
        {Array.from({ length: scene.parts }, (_, i) => <span key={i} className={i === 0 ? "bg-sky-300" : "bg-white"} />)}
      </div>
      <div className="grid h-7 w-[calc(100%/var(--p))] gap-px border border-t-0 border-slate-600 bg-slate-600" style={{ ["--p" as string]: scene.parts, gridTemplateColumns: `repeat(${scene.sub}, minmax(0,1fr))` }}>
        {Array.from({ length: scene.sub }, (_, i) => <span key={i} className={i < scene.subFilled ? "bg-violet-400" : "bg-sky-100"} />)}
      </div>
      <p className="mt-1 text-xs">Biru: siswa musik. Ungu: siswa musik yang juga melukis.</p>
    </div>;
    case "compare": return <PlaceChart values={scene.values} />;
  }
}
