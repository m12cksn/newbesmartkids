import type { ReactNode } from "react";
import { ThingIcon } from "@/components/learn/GradeOneCounting10Art";
import { ObjectArt, type ArtName } from "@/components/illustrations/ObjectArt";
import type { Scene, ShapeArt, Thing } from "./data";

/* Gambar benda: memakai ilustrasi Bab 1 dan ObjectArt yang sudah ada, bukan emoji. */
const fromBab1: Partial<Record<Thing, "apel" | "jeruk" | "mangga" | "salak" | "balon" | "pensil" | "bola" | "kelereng" | "donat">> = {
  apel: "apel", jeruk: "jeruk", mangga: "mangga", salak: "salak", balon: "balon", pensil: "pensil", bola: "bola", kelereng: "kelereng", donat: "donat",
};
const fromObjectArt: Partial<Record<Thing, ArtName>> = { kue: "cake", bintang: "star" };
const thingName: Record<Thing, string> = { apel: "apel", jeruk: "jeruk", mangga: "mangga", salak: "salak", balon: "balon", pensil: "pensil", bola: "bola", kelereng: "kelereng", kue: "potong kue", donat: "donat", bintang: "bintang" };
const shapeName: Record<ShapeArt, string> = { book: "buku", window: "jendela", door: "pintu", frame: "bingkai foto", plate: "piring", clock: "jam dinding", egg: "telur", "set-square": "penggaris segitiga" };

export function Thing1({ thing, className = "size-8" }: { thing: Thing; className?: string }) {
  const a = fromBab1[thing];
  if (a) return <ThingIcon thing={a} className={className} />;
  return <ObjectArt name={fromObjectArt[thing] ?? "star"} className={className} />;
}

function Many({ thing, n, perRow = 5, size = "size-8" }: { thing: Thing; n: number; perRow?: number; size?: string }) {
  return <span className="inline-flex flex-col items-center gap-1" aria-hidden="true">
    {Array.from({ length: Math.ceil(n / perRow) }, (_, r) => <span key={r} className="flex gap-1">
      {Array.from({ length: Math.min(perRow, n - r * perRow) }, (_, k) => <Thing1 key={k} thing={thing} className={size} />)}
    </span>)}
  </span>;
}

const Card = ({ children, label }: { children: ReactNode; label?: string }) =>
  <figure className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-base-300 bg-base-100 p-3">{children}{label && <figcaption className="text-sm font-bold">{label}</figcaption>}</figure>;

function Frame({ thing, n }: { thing: Thing; n: number }) {
  return <span className="grid grid-cols-5 gap-0 border-2 border-[#5b5b5b] bg-white" aria-hidden="true">
    {Array.from({ length: 10 }, (_, i) => <span key={i} className="grid size-9 place-items-center border border-[#9aa0a6] sm:size-11">{i < n && <Thing1 thing={thing} className="size-7 sm:size-8" />}</span>)}
  </span>;
}

function NumberLine({ from, to, start, hops, marks = [] }: { from: number; to: number; start: number; hops: number; marks?: number[] }) {
  const n = to - from, W = 640, pad = 24, step = (W - 2 * pad) / n, x = (v: number) => pad + (v - from) * step;
  return <svg viewBox={`0 0 ${W} 120`} className="h-auto w-full max-w-2xl" role="img" aria-label={hops ? `Garis bilangan ${from} sampai ${to}, lompat maju ${hops} langkah dari ${start}` : `Garis bilangan ${from} sampai ${to}, ditandai ${marks.join(" dan ")}`}>
    <line x1={pad - 10} y1="78" x2={W - pad + 10} y2="78" stroke="#17352a" strokeWidth="3" />
    {Array.from({ length: n + 1 }, (_, i) => { const v = from + i; const marked = marks.includes(v) || (hops > 0 && v === start);
      return <g key={v}><line x1={x(v)} y1="70" x2={x(v)} y2="86" stroke="#17352a" strokeWidth="2.5" />
        {marked && <circle cx={x(v)} cy="78" r="9" fill="#ffd34f" stroke="#17352a" strokeWidth="2" />}
        <text x={x(v)} y="110" textAnchor="middle" fontSize="20" fontWeight="700" fill="#17352a">{v}</text></g>; })}
    {Array.from({ length: hops }, (_, k) => { const a = x(start + k), b = x(start + k + 1), m = (a + b) / 2;
      return <path key={k} d={`M${a} 70 Q${m} 22 ${b} 70`} fill="none" stroke="#2f86d6" strokeWidth="3" markerEnd="url(#panah)" />; })}
    <defs><marker id="panah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2f86d6" /></marker></defs>
  </svg>;
}

function Ring({ v, big }: { v: number | null; big?: boolean }) {
  return <span className={`grid place-items-center rounded-full border-[3px] border-[#17352a] bg-white font-extrabold ${big ? "size-20 text-3xl" : "size-16 text-2xl"} ${v === null ? "border-dashed text-base-content/40" : ""}`}>{v ?? "?"}</span>;
}

function Bond({ whole, a, b, thing }: { whole: number | null; a: number | null; b: number | null; thing?: Thing }) {
  return <div className="flex flex-col items-center gap-3" role="img" aria-label={`Pasangan bilangan: ${whole ?? "kosong"} adalah ${a ?? "kosong"} dan ${b ?? "kosong"}`}>
    {thing && whole !== null && <Many thing={thing} n={whole} perRow={9} size="size-7" />}
    <Ring v={whole} big />
    <svg viewBox="0 0 160 40" className="h-8 w-40" aria-hidden="true"><path d="M80 0L30 40M80 0L130 40" stroke="#17352a" strokeWidth="3" /></svg>
    <span className="flex gap-16"><Ring v={a} /><Ring v={b} /></span>
  </div>;
}

function Tens({ tens, ones }: { tens: number; ones: number }) {
  return <div className="flex items-end gap-6" role="img" aria-label={`${tens} batang puluhan dan ${ones} kubus satuan`}>
    {Array.from({ length: tens }, (_, t) => <span key={t} className="flex flex-col">{Array.from({ length: 10 }, (_, i) => <span key={i} className="size-5 border border-[#8a4b20] bg-[#f6b25a]" />)}</span>)}
    <span className="grid grid-cols-3 gap-1">{Array.from({ length: ones }, (_, i) => <span key={i} className="size-5 border border-[#1d5a94] bg-[#74c0fc]" />)}</span>
  </div>;
}

function Pencilish({ length, color, unit, name }: { length: number; color: string; unit: number; name: string }) {
  const w = length * unit;
  if (name.startsWith("Pita")) return <svg width={w} height="28" viewBox={`0 0 ${w} 28`} aria-hidden="true"><path d={`M0 4C${w * 0.3} 0 ${w * 0.7} 8 ${w} 4V24C${w * 0.7} 28 ${w * 0.3} 20 0 24Z`} fill={color} stroke="#17352a" strokeWidth="1.5" /></svg>;
  const tip = Math.min(22, w * 0.18);
  return <svg width={w} height="28" viewBox={`0 0 ${w} 28`} aria-hidden="true">
    <rect x="1" y="5" width="10" height="18" rx="2" fill="#f08bb0" stroke="#17352a" strokeWidth="1.5" />
    <rect x="11" y="5" width={w - 11 - tip} height="18" fill={color} stroke="#17352a" strokeWidth="1.5" />
    <path d={`M${w - tip} 5L${w - 1} 14L${w - tip} 23Z`} fill="#f3d3a4" stroke="#17352a" strokeWidth="1.5" />
    <path d={`M${w - 6} 11.5L${w - 1} 14L${w - 6} 16.5Z`} fill="#17352a" />
  </svg>;
}

function Clip({ unit }: { unit: number }) {
  return <svg width={unit} height="16" viewBox="0 0 40 16" aria-hidden="true"><path d="M6 4h26a4 4 0 0 1 0 8H10a2.5 2.5 0 0 1 0-5h20" fill="none" stroke="#5b6670" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "frames": return <div className="flex flex-wrap justify-center gap-4">{scene.ns.map((n, i) => <Card key={i} label={scene.labels?.[i]}><span role="img" aria-label={`Bingkai 10 berisi ${n} ${thingName[scene.thing]}`}><Frame thing={scene.thing} n={n} /></span></Card>)}</div>;
    case "groups": return <div className="flex flex-wrap justify-center gap-4">{scene.groups.map(g => <Card key={g.label} label={g.label}><span role="img" aria-label={`${g.label}: ${g.n} ${thingName[g.thing]}`}><Many thing={g.thing} n={g.n} size={g.big ? "size-12" : "size-8"} /></span></Card>)}</div>;
    case "crossed": return <Card><span role="img" aria-label={`${scene.n} ${thingName[scene.thing]}, ${scene.cross} dicoret`} className="flex max-w-md flex-wrap justify-center gap-2">
      {Array.from({ length: scene.n }, (_, i) => <span key={i} className="relative inline-grid place-items-center"><Thing1 thing={scene.thing} className="size-10" />
        {i >= scene.n - scene.cross && <svg viewBox="0 0 40 40" className="absolute inset-0 size-10" aria-hidden="true"><path d="M6 6L34 34M34 6L6 34" stroke="#e03131" strokeWidth="4" strokeLinecap="round" /></svg>}</span>)}
    </span></Card>;
    case "repeat": return <div className="flex flex-wrap justify-center gap-3" role="img" aria-label={`${scene.groups} kelompok, setiap kelompok ${scene.each} ${thingName[scene.thing]}`}>
      {Array.from({ length: scene.groups }, (_, i) => <span key={i} className="rounded-2xl border-2 border-dashed border-success/60 bg-base-100 p-3"><Many thing={scene.thing} n={scene.each} perRow={scene.each} /></span>)}
    </div>;
    case "line": return <NumberLine {...scene} />;
    case "bond": return <Bond {...scene} />;
    case "tens": return <Card><Tens tens={scene.tens} ones={scene.ones} /></Card>;
    case "objects": return <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">{scene.items.map(it => <Card key={it} label={shapeName[it][0].toUpperCase() + shapeName[it].slice(1)}><ObjectArt name={it} className="size-16" label={shapeName[it]} /></Card>)}</div>;
    case "triangles": return <Card><svg viewBox="0 0 260 120" className="h-auto w-full max-w-xs" role="img" aria-label="Dua segitiga siku-siku sama besar, sisi miringnya saling berhadapan">
      <path d="M10 110V10L110 110Z" fill="#74c0fc" stroke="#17352a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M150 10H250V110Z" fill="#ffd34f" stroke="#17352a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M118 60h24" stroke="#17352a" strokeWidth="2.5" strokeDasharray="4 4" />
    </svg></Card>;
    case "lengths": { const unit = 28;
      return <Card><div className="max-w-full overflow-x-auto"><div className="relative" style={{ width: scene.grid * unit + 2 }} role="img" aria-label={scene.items.map(i => `${i.name} mulai petak ${(i.start ?? 0) + 1}`).join(", ")}>
        {!scene.showGrid && <span className="absolute inset-y-0 left-0 w-1 rounded bg-[#e03131]" aria-hidden="true" />}
        {scene.items.map(it => <div key={it.name} className="mb-3 last:mb-0">
          <p className="mb-1 text-sm font-bold">{it.name}</p>
          <div className="relative h-8" style={scene.showGrid ? { backgroundImage: "linear-gradient(90deg,#9aa0a6 1px,transparent 1px)", backgroundSize: `${unit}px 100%`, borderTop: "1px solid #9aa0a6", borderBottom: "1px solid #9aa0a6", borderRight: "1px solid #9aa0a6", width: scene.grid * unit + 1 } : undefined}>
            <span className="absolute top-0.5" style={{ left: (it.start ?? 0) * unit + 1 }}><Pencilish length={it.length} color={it.color} unit={unit} name={it.name} /></span>
          </div>
        </div>)}
      </div></div></Card>; }
    case "clips": { const unit = 34;
      return <div className="flex flex-col gap-4">{scene.items.map(it => <Card key={it.name} label={it.name}><div className="max-w-full overflow-x-auto"><div className="flex flex-col gap-1" style={{ width: it.length * unit + 2 }}>
        <Pencilish length={it.length} color={it.color} unit={unit} name={it.name} />
        <span className="flex" role="img" aria-label={`Penjepit kertas berderet di bawah ${it.name}`}>{Array.from({ length: it.length }, (_, k) => <Clip key={k} unit={unit} />)}</span>
      </div></div></Card>)}</div>; }
    case "pictograph": return <Card label="Satu gambar mewakili satu siswa">
      <table className="w-full max-w-lg text-left"><caption className="mb-2 font-extrabold">{scene.title}</caption>
        <tbody>{scene.rows.map(r => <tr key={r.label} className="border-t border-base-300"><th scope="row" className="py-1.5 pe-3 text-sm font-bold">{r.label}</th>
          <td className="py-1.5"><span role="img" aria-label={`${r.n} gambar ${thingName[r.thing]}`} className="flex flex-wrap gap-0.5">{Array.from({ length: r.n }, (_, k) => <Thing1 key={k} thing={r.thing} className="size-7" />)}</span></td></tr>)}</tbody>
      </table></Card>;
  }
}

export function OptionArt({ art }: { art: string }) {
  return <ObjectArt name={art as ArtName} className="size-14" />;
}
