import type { ReactNode } from "react";
import type { Scene } from "@/data/grade-eight-powers";

/* ---------- Penampil rumus: ^{…} pangkat, √{…} akar, {a/b} pecahan ---------- */
function closeAt(s: string, open: number) { let d = 0; for (let i = open; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}" && --d === 0) return i; } return s.length; }
function topSlash(s: string) { let d = 0; for (let i = 0; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}") d--; else if (s[i] === "/" && d === 0) return i; } return -1; }
function parse(s: string, key = "m"): ReactNode[] {
  const out: ReactNode[] = []; let buf = "", k = 0;
  const flush = () => { if (buf) { out.push(buf); buf = ""; } };
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith("^{", i)) { flush(); const e = closeAt(s, i + 1); out.push(<sup key={`${key}${k++}`} className="text-[0.7em]">{parse(s.slice(i + 2, e), `${key}s${k}`)}</sup>); i = e; continue; }
    if (s.startsWith("√{", i)) { flush(); const e = closeAt(s, i + 1);
      out.push(<span key={`${key}${k++}`} className="inline-flex items-stretch whitespace-nowrap"><span>√</span><span className="border-t-[1.5px] border-current px-px">{parse(s.slice(i + 2, e), `${key}r${k}`)}</span></span>); i = e; continue; }
    if (s[i] === "{") { flush(); const e = closeAt(s, i), inner = s.slice(i + 1, e), sl = topSlash(inner);
      out.push(sl < 0 ? <span key={`${key}${k++}`}>{parse(inner, `${key}g${k}`)}</span>
        : <span key={`${key}${k++}`} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.92em] leading-tight"><span className="px-0.5">{parse(inner.slice(0, sl), `${key}n${k}`)}</span><span className="border-t-[1.5px] border-current px-0.5">{parse(inner.slice(sl + 1), `${key}d${k}`)}</span></span>);
      i = e; continue; }
    buf += s[i];
  }
  flush(); return out;
}
export const M = ({ text }: { text: string }) => <>{parse(text)}</>;
const supChar: Record<string, string> = { "2": "²", "3": "³" };
export const svgMath = (s: string) => s.replace(/\^\{([23])\}/g, (_, d: string) => supChar[d]);
export const plainMath = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/[{}]/g, "");

/* ---------- Gambar soal ---------- */
export function SquareFig({ area, label, side }: { area: string; label: string; side?: string }) {
  return <figure className="flex flex-col items-center gap-1">
    <svg viewBox="0 0 170 150" className="w-44" role="img" aria-label={`${label} berbentuk persegi, luas ${plainMath(area)}`}>
      <rect x="30" y="10" width="120" height="120" fill="#dbeafe" stroke="#2563a6" strokeWidth="2" />
      {[18, 26].map(o => <g key={o} stroke="#93b8e6" strokeWidth="2"><path d={`M${30 + o} 10v120M${150 - o} 10v120M30 ${10 + o}h120M30 ${130 - o}h120`} /></g>)}
      <text x="90" y="75" textAnchor="middle" fontSize="13" fontWeight="700" fill="#17352a">Luas {svgMath(area)}</text>
      <text x="90" y="146" textAnchor="middle" fontSize="12" fontWeight="700" fill="#b42318">{side ?? "sisi = ?"}</text>
    </svg>
    <figcaption className="text-sm font-semibold">{label}</figcaption>
  </figure>;
}
export function RectFig({ w, h, label }: { w: string; h: string; label: string }) {
  return <figure className="flex flex-col items-center gap-1">
    <svg viewBox="0 0 260 160" className="w-64" role="img" aria-label={`${label}: panjang ${plainMath(w)}, lebar ${plainMath(h)}`}>
      <rect x="30" y="34" width="160" height="96" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
      <rect x="38" y="42" width="144" height="80" fill="#fffbeb" stroke="#d97706" strokeWidth="1" />
      {([["A", 18, 146], ["B", 192, 146], ["C", 192, 30], ["D", 18, 30]] as const).map(([t, x, y]) => <text key={t} x={x} y={y} fontSize="12" fontWeight="700" fill="#17352a">{t}</text>)}
      <text x="110" y="24" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1c64b5">{plainMath(w)}</text>
      <text x="198" y="86" fontSize="13" fontWeight="800" fill="#1c64b5">{plainMath(h)}</text>
    </svg>
    <figcaption className="text-sm font-semibold">{label}</figcaption>
  </figure>;
}
export function Cubes({ n, size = 120 }: { n: number; size?: number }) {
  const u = 1 / n, pts: ReactNode[] = [];
  const iso = (x: number, y: number, z: number) => [60 + (x - y) * 40, 70 + (x + y) * 22 - z * 46];
  const face = (p: number[][], fill: string, key: string) => <polygon key={key} points={p.map(q => q.join(",")).join(" ")} fill={fill} stroke="#1f2a25" strokeWidth="0.6" />;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a = i * u, b = j * u;
    pts.push(face([iso(a, b, 1), iso(a + u, b, 1), iso(a + u, b + u, 1), iso(a, b + u, 1)], "#4caf50", `t${i}${j}`));
    pts.push(face([iso(1, a, 1 - b), iso(1, a + u, 1 - b), iso(1, a + u, 1 - b - u), iso(1, a, 1 - b - u)], "#e53935", `r${i}${j}`));
    pts.push(face([iso(a, 1, 1 - b), iso(a + u, 1, 1 - b), iso(a + u, 1, 1 - b - u), iso(a, 1, 1 - b - u)], "#fdd835", `f${i}${j}`));
  }
  return <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Kubus ${n} × ${n} × ${n} terdiri atas ${n ** 3} kubus satuan`}>{pts}</svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "square": return <SquareFig area={scene.area} label={scene.label} />;
    case "rect": return <RectFig w={scene.w} h={scene.h} label={scene.label} />;
    case "cubes": return <Cubes n={scene.n} />;
    case "table": return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{scene.caption && <caption className="mb-1 font-bold">{scene.caption}</caption>}
      <thead><tr className="bg-success text-success-content">{scene.head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
      <tbody>{scene.rows.map(r => <tr key={r[0]} className="border-t border-base-300">{r.map((c, j) => <td key={j} className="px-2 py-1"><M text={c} /></td>)}</tr>)}</tbody></table></div>;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
    case "split": return <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 300 110" className="w-full max-w-sm" role="img" aria-label={scene.label}>
        {[[1, 0], [2, 1], [4, 2], [8, 3]].map(([cnt, step]) => <g key={step}>
          <text x={10} y={18 + step * 26} fontSize="10" fontWeight="700" fill="#17352a">{step} menit</text>
          {Array.from({ length: cnt }, (_, k) => <g key={k} transform={`translate(${60 + k * 19} ${13 + step * 26})`}><circle r="7" fill="#e8d4cf" stroke="#7a2e3a" strokeWidth="1.2" />{[0, 60, 120, 180, 240, 300].map(a => <circle key={a} cx={8.5 * Math.cos((a * Math.PI) / 180)} cy={8.5 * Math.sin((a * Math.PI) / 180)} r="1.6" fill="#9b2335" />)}</g>)}
          <text x={56 + cnt * 19} y={18 + step * 26} fontSize="10" fill="#17352a">= 2<tspan dy="-4" fontSize="7">{step}</tspan><tspan dy="4"> = {cnt}</tspan></text>
        </g>)}
      </svg>
      <figcaption className="text-sm font-semibold">{scene.label}</figcaption>
    </figure>;
  }
}
