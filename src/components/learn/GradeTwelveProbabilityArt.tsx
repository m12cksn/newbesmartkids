"use client";

import { useId, type ReactNode } from "react";
import { M as BaseM, plainMath } from "./GradeEightPowersArt";
import { isRed, rankOf, suitOf, type Scene } from "@/data/grade-twelve-probability";

export { plainMath };
export const M = ({ text }: { text: string }) => <BaseM text={text.replace(/\{\(([^(){}]*)\)\//g, "{$1/").replace(/\/\(([^(){}]*)\)\}/g, "/$1}")} />;
const ink = "#1f3b30", soft = "#5b6b64", green = "#2b8a3e", blue = "#1c64b5", red = "#c92a2a";

/* ---------- Kartu remi ---------- */
export function Card({ card, mark, small = false }: { card: string; mark?: "a" | "b" | "ab"; small?: boolean }) {
  const r = rankOf(card), s = suitOf(card), color = isRed(card) ? red : "#212529";
  const ring = mark === "ab" ? "ring-2 ring-offset-1 ring-warning" : mark === "a" ? "ring-2 ring-success" : mark === "b" ? "ring-2 ring-info" : "";
  return <span role="img" aria-label={`Kartu ${r} ${s}`} className={`inline-flex shrink-0 flex-col items-center justify-between rounded-md border border-base-300 bg-white font-bold leading-none shadow-sm ${small ? "h-9 w-full min-w-0 p-0.5 text-[10px]" : "h-14 w-10 p-1 text-sm"} ${ring} ${mark ? "" : "opacity-90"}`} style={{ color }}>
    <span className="self-start">{r}</span><span className={small ? "text-xs" : "text-lg"}>{s}</span>
  </span>;
}
export function CardGrid({ cards, marksOf, caption }: { cards: string[]; marksOf?: (c: string) => "a" | "b" | "ab" | undefined; caption?: string }) {
  const small = cards.length > 13;
  return <figure className="w-full min-w-0">
    <div className={small ? "mx-auto grid max-w-[24rem] gap-0.5" : "flex flex-wrap justify-center gap-1.5"} style={small ? { gridTemplateColumns: "repeat(13, minmax(0, 1fr))" } : undefined}>
      {cards.map(c => { const m = marksOf?.(c); return <span key={c} className={m || !marksOf ? "" : "opacity-35"}><Card card={c} mark={m} small={small} /></span>; })}
    </div>
    {caption && <figcaption className="mt-1 text-center text-xs text-base-content/70">{caption}</figcaption>}
  </figure>;
}

/* ---------- Dadu ---------- */
const PIPS: Record<number, [number, number][]> = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]] };
export function Die({ n, color = "white", size = 22 }: { n: number; color?: "white" | "red"; size?: number }) {
  const bg = color === "red" ? "#e03131" : "#ffffff", pip = color === "red" ? "#ffffff" : "#212529";
  return <svg viewBox="0 0 30 30" width={size} height={size} role="img" aria-label={`Dadu ${color === "red" ? "merah " : ""}mata ${n}`}>
    <rect x="1" y="1" width="28" height="28" rx="6" fill={bg} stroke={ink} strokeWidth="1.5" />
    {PIPS[n].map(([x, y], i) => <circle key={i} cx={8 + x * 7} cy={8 + y * 7} r="2.6" fill={pip} />)}
  </svg>;
}
export function DiceTable({ marks, marks2 = [], caption }: { marks: [number, number][]; marks2?: [number, number][]; caption?: string }) {
  const has = (l: [number, number][], a: number, b: number) => l.some(([x, y]) => x === a && y === b);
  return <figure className="w-full max-w-xs">
    <table className="mx-auto border-collapse text-[11px]" aria-label={caption ?? "Tabel 36 hasil dua dadu"}>
      <thead><tr><th className="p-0.5" /><>{[1, 2, 3, 4, 5, 6].map(b => <th key={b} className="p-0.5"><Die n={b} size={20} /></th>)}</></tr></thead>
      <tbody>{[1, 2, 3, 4, 5, 6].map(a => <tr key={a}><th className="p-0.5"><Die n={a} color="red" size={20} /></th>
        {[1, 2, 3, 4, 5, 6].map(b => { const m1 = has(marks, a, b), m2 = has(marks2, a, b);
          return <td key={b} className={`border border-base-300 px-1 py-0.5 text-center tabular-nums ${m1 && m2 ? "bg-warning/60 font-bold" : m1 ? "bg-success/35 font-bold" : m2 ? "bg-info/35 font-bold" : "bg-white"}`}>{a},{b}</td>; })}</tr>)}</tbody>
    </table>
    {caption && <figcaption className="mt-1 text-center text-xs text-base-content/70">{caption}</figcaption>}
  </figure>;
}

/* ---------- Diagram Venn ---------- */
export function Venn({ universe, a, b, la, lb, counts, highlight, caption }: { universe: number[]; a: number[]; b: number[]; la: string; lb: string; counts?: [number, number, number, number]; highlight?: "union" | "inter"; caption?: string }) {
  const inA = (x: number) => a.includes(x), inB = (x: number) => b.includes(x);
  const groups = { a: universe.filter(x => inA(x) && !inB(x)), ab: universe.filter(x => inA(x) && inB(x)), b: universe.filter(x => inB(x) && !inA(x)), o: universe.filter(x => !inA(x) && !inB(x)) };
  const place = (xs: number[], cx: number, cy: number, w: number) => xs.map((x, i) => { const per = Math.max(1, Math.floor(w / 22)), r = Math.floor(i / per), c = i % per, cols = Math.min(per, xs.length); return { x, px: cx - ((cols - 1) * 22) / 2 + c * 22, py: cy - 10 + r * 20 }; });
  const clip = useId().replace(/:/g, "");
  const shade = highlight === "union" ? "#2b8a3e" : highlight === "inter" ? "#f59f00" : "transparent";
  return <figure className="w-full max-w-sm">
    <svg viewBox="0 0 320 200" className="h-auto w-full" role="img" aria-label={`Diagram Venn ${la} dan ${lb}${counts ? `: hanya ${la} ${counts[0]}, keduanya ${counts[1]}, hanya ${lb} ${counts[2]}, di luar ${counts[3]}` : ""}`}>
      <defs><clipPath id={clip}><circle cx="125" cy="100" r="70" /></clipPath></defs>
      <rect x="4" y="4" width="312" height="192" rx="10" fill="#fff" stroke={ink} />
      <text x="14" y="22" fontSize="13" fontWeight="700" fill={ink}>S</text>
      {highlight === "union" && <><circle cx="125" cy="100" r="70" fill={shade} opacity="0.22" /><circle cx="195" cy="100" r="70" fill={shade} opacity="0.22" /></>}
      {highlight === "inter" && <circle cx="195" cy="100" r="70" fill={shade} opacity="0.4" clipPath={`url(#${clip})`} />}
      <circle cx="125" cy="100" r="70" fill="none" stroke={green} strokeWidth="2" /><circle cx="195" cy="100" r="70" fill="none" stroke={blue} strokeWidth="2" />
      <text x="80" y="40" fontSize="12" fontWeight="700" fill={green} textAnchor="middle">{la}</text><text x="240" y="40" fontSize="12" fontWeight="700" fill={blue} textAnchor="middle">{lb}</text>
      {counts ? <>{[[counts[0], 95, 105], [counts[1], 160, 105], [counts[2], 228, 105], [counts[3], 290, 182]].map(([v, x, y], i) => <text key={i} x={x} y={y} fontSize="18" fontWeight="800" fill={ink} textAnchor="middle">{v}</text>)}</>
        : <>{[...place(groups.a, 92, 100, 60), ...place(groups.ab, 160, 100, 40), ...place(groups.b, 228, 100, 60), ...place(groups.o, 160, 186, 260)].map(({ x, px, py }) => <text key={x} x={px} y={py} fontSize="12.5" fontWeight="700" fill={ink} textAnchor="middle">{x}</text>)}</>}
    </svg>
    {caption && <figcaption className="text-center text-xs text-base-content/70">{caption}</figcaption>}
  </figure>;
}

/* ---------- Meja bundar ---------- */
export function RoundTable({ labels, caption, hot = [] }: { labels: string[]; caption?: string; hot?: number[] }) {
  const n = labels.length, R = 72, mk = useId().replace(/:/g, "");
  return <figure className="w-full max-w-[16rem]">
    <svg viewBox="0 0 220 220" className="h-auto w-full" role="img" aria-label={`Meja bundar dengan ${n} kursi: ${labels.join(", ")} searah jarum jam`}>
      <circle cx="110" cy="110" r="46" fill="#c08457" stroke="#7a4b26" strokeWidth="3" /><circle cx="110" cy="110" r="38" fill="none" stroke="#a46b3e" opacity="0.6" />
      {labels.map((l, i) => { const t = (2 * Math.PI * i) / n - Math.PI / 2, x = 110 + R * Math.cos(t), y = 110 + R * Math.sin(t);
        return <g key={i}><circle cx={x} cy={y} r="19" fill={hot.includes(i) ? "#ffe8a3" : "#e6f4ea"} stroke={ink} strokeWidth="1.5" /><text x={x} y={y + 4} fontSize={l.length > 3 ? 9.5 : 12} fontWeight="700" textAnchor="middle" fill={ink}>{l}</text></g>; })}
      <path d="M 110 22 A 88 88 0 0 1 180 55" fill="none" stroke={soft} strokeWidth="1.5" markerEnd={`url(#${mk})`} />
      <defs><marker id={mk} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={soft} /></marker></defs>
    </svg>
    {caption && <figcaption className="text-center text-xs text-base-content/70">{caption}</figcaption>}
  </figure>;
}

/* ---------- Kotak isian dan huruf ---------- */
export function Slots({ values, caption }: { values: string[]; caption?: string }) {
  return <figure className="w-full"><div className="flex flex-wrap justify-center gap-1.5">{values.map((v, i) => <span key={i} className="flex min-w-16 flex-col items-center rounded-lg border-2 border-base-content/40 bg-white px-2 py-1 text-sm"><span className="text-xs text-base-content/60">({i + 1})</span><span className="font-bold"><M text={v} /></span></span>)}</div>
    {caption && <figcaption className="mt-1 text-center text-xs text-base-content/70">{caption}</figcaption>}</figure>;
}
const tileColors = ["#d3f9d8", "#d0ebff", "#ffe3e3", "#fff3bf", "#e5dbff", "#ffe8cc", "#c3fae8"];
export function Tiles({ text, caption }: { text: string; caption?: string }) {
  const kinds = [...new Set(text)];
  return <figure className="w-full"><div className="flex flex-wrap justify-center gap-1" role="img" aria-label={`Kartu huruf ${text.split("").join(" ")}`}>
    {text.split("").map((c, i) => <span key={i} className="flex size-9 items-center justify-center rounded-md border border-base-content/30 text-lg font-extrabold text-neutral shadow-sm" style={{ background: tileColors[kinds.indexOf(c) % tileColors.length] }}>{c}</span>)}</div>
    {caption && <figcaption className="mt-1 text-center text-xs text-base-content/70">{caption}</figcaption>}</figure>;
}

/* ---------- Diagram pohon ---------- */
export function Tree({ first, second, caption, hot }: { first: [string, string][]; second: [string, string][][]; caption?: string; hot?: [number, number] }) {
  const leaves = second.flat().length, H = Math.max(140, leaves * 36), ys1 = first.map((_, i) => (H * (i + 0.5)) / first.length);
  let k = 0;
  return <figure className="w-full max-w-sm">
    <svg viewBox={`0 0 330 ${H}`} className="h-auto w-full" role="img" aria-label={`Diagram pohon: ${first.map(([l, p], i) => `${l} ${p} lalu ${second[i].map(([l2, p2]) => `${l2} ${p2}`).join(" atau ")}`).join("; ")}`}>
      <circle cx="12" cy={H / 2} r="5" fill={ink} />
      {first.map(([l, p], i) => { const y1 = ys1[i];
        return <g key={i}>
          <line x1="12" y1={H / 2} x2="120" y2={y1} stroke={hot?.[0] === i ? red : ink} strokeWidth={hot?.[0] === i ? 2.4 : 1.4} />
          <text x="60" y={(H / 2 + y1) / 2 - 5} fontSize="11" fill={blue} fontWeight="700" textAnchor="middle">{p}</text>
          <text x="124" y={y1 + 4} fontSize="11.5" fontWeight="700" fill={ink}>{l}</text>
          {second[i].map(([l2, p2], j) => { const y2 = (H * (k++ + 0.5)) / leaves, on = hot?.[0] === i && hot?.[1] === j;
            return <g key={j}><line x1="180" y1={y1} x2="250" y2={y2} stroke={on ? red : ink} strokeWidth={on ? 2.4 : 1.2} />
              <text x="236" y={y1 + 0.8 * (y2 - y1) - 4} fontSize="10.5" fill={blue} fontWeight="700" textAnchor="end">{p2}</text>
              <text x="254" y={y2 + 4} fontSize="11" fill={ink}>{l2}</text></g>; })}
        </g>; })}
    </svg>
    {caption && <figcaption className="text-center text-xs text-base-content/70">{caption}</figcaption>}
  </figure>;
}

/* ---------- Isi tas atau dompet ---------- */
function Marker({ color }: { color: string }) {
  return <svg viewBox="0 0 14 52" width="11" height="40" aria-hidden="true"><rect x="2" y="2" width="10" height="14" rx="2" fill={color} stroke={ink} /><rect x="1" y="16" width="12" height="28" rx="2" fill="#f1f3f5" stroke={ink} /><rect x="1" y="24" width="12" height="8" fill={color} opacity="0.85" /><path d="M4 44 L10 44 L7.5 50 L6.5 50 Z" fill={color} stroke={ink} strokeWidth="0.8" /></svg>;
}
function Coin({ color, label }: { color: string; label: string }) {
  return <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true"><circle cx="20" cy="20" r="18" fill={color} stroke={ink} strokeWidth="1.5" /><circle cx="20" cy="20" r="14" fill="none" stroke={ink} strokeOpacity="0.35" /><text x="20" y="24" fontSize={label.length > 3 ? 9 : 11} fontWeight="800" textAnchor="middle" fill={ink}>{label}</text></svg>;
}
export function Bag({ items, caption }: { items: { label: string; color: string; count: number; kind: "spidol" | "bola" | "koin" }[]; caption?: string }) {
  return <figure className="w-full max-w-sm rounded-xl border border-base-300 bg-white p-2" role="img" aria-label={`${caption ?? "Isi tas"}: ${items.map(i => `${i.count} ${i.kind} ${i.label}`).join(", ")}`}>
    {caption && <figcaption className="mb-1 text-center text-xs font-bold">{caption}</figcaption>}
    {items.map(it => <div key={it.label} className="flex flex-wrap items-center gap-1 py-0.5"><span className="w-20 text-xs font-semibold">{it.count} {it.label}</span>
      {Array.from({ length: it.count }, (_, i) => it.kind === "spidol" ? <Marker key={i} color={it.color} /> : it.kind === "koin" ? <Coin key={i} color={it.color} label={it.label} /> : <span key={i} className="size-5 rounded-full border border-neutral" style={{ background: it.color }} />)}</div>)}
  </figure>;
}
export function CoinDie() {
  return <figure className="flex flex-col items-center gap-1" role="img" aria-label="Sebuah koin dengan sisi angka (A) dan gambar (G), serta sebuah dadu bermata 1 sampai 6">
    <div className="flex items-center gap-3"><Coin color="#e9c46a" label="A" /><Coin color="#e9c46a" label="G" /><span className="flex gap-0.5">{[1, 2, 3, 4, 5, 6].map(k => <Die key={k} n={k} size={24} />)}</span></div>
    <figcaption className="text-xs text-base-content/70">Koin: A (angka) atau G (gambar). Dadu: mata 1 sampai 6.</figcaption>
  </figure>;
}

export function Grid({ head, rows, title }: { head: string[]; rows: string[][]; title?: string }) {
  return <div className="min-w-0 max-w-full overflow-x-auto">
    {title && <p className="mb-1 text-center text-xs font-bold">{title}</p>}
    <table className="mx-auto border-collapse bg-white text-sm"><thead><tr>{head.map((h, i) => <th key={i} className="border border-base-300 bg-success/10 px-2 py-1 font-bold">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k} className={`border border-base-300 px-2 py-0.5 tabular-nums ${k ? "text-center" : "font-semibold"}`}>{c}</td>)}</tr>)}</tbody></table>
  </div>;
}

export function SceneView({ scene }: { scene: Scene }): ReactNode {
  switch (scene.type) {
    case "cards": return <CardGrid cards={scene.cards} caption={scene.caption} marksOf={scene.highlight ? c => (scene.highlight!.includes(c) ? "a" : undefined) : undefined} />;
    case "dice": return <DiceTable marks={scene.marks} marks2={scene.marks2} caption={scene.caption} />;
    case "venn": return <Venn {...scene} />;
    case "round": return <RoundTable labels={scene.labels} caption={scene.caption} />;
    case "slots": return <Slots values={scene.values} caption={scene.caption} />;
    case "tiles": return <Tiles text={scene.text} caption={scene.caption} />;
    case "tree": return <Tree first={scene.first} second={scene.second} caption={scene.caption} />;
    case "grid": return <Grid head={scene.head} rows={scene.rows} title={scene.title} />;
    case "bag": return <Bag items={scene.items} caption={scene.caption} />;
    case "coindie": return <CoinDie />;
    case "multi": return <div className="flex flex-wrap justify-center gap-3">{scene.items.map((s, i) => <SceneView key={i} scene={s} />)}</div>;
  }
}
