import { M, plainMath } from "./GradeEightPowersArt";
import { idn, type Scene, type Sym } from "@/data/grade-ten-spltv";

export { M, plainMath };
const ink = "#1f3b30", soft = "#5b6b64", accent = "#1c64b5", warm = "#c2410c", leaf = "#2b8a3e";

/* ---------- Sistem persamaan dengan kurung kurawal ---------- */
export function SystemView({ rows, caption }: { rows: string[]; caption?: string }) {
  return <figure className="flex min-w-0 flex-col items-center gap-1">
    <div className="flex items-stretch gap-2" role="group" aria-label={`Sistem persamaan: ${rows.map(plainMath).join("; ")}`}>
      <svg viewBox="0 0 14 60" preserveAspectRatio="none" className="w-3.5 shrink-0" aria-hidden="true"><path d="M12 1 Q5 1 6 10 L6 24 Q6 30 1 30 Q6 30 6 36 L6 50 Q5 59 12 59" fill="none" stroke={ink} strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg>
      <div className="space-y-1 py-1 font-serif text-lg leading-snug">{rows.map((r, i) => <p key={i} className="flex items-baseline gap-3"><span className="w-7 shrink-0 font-sans text-xs text-base-content/50">({i + 1})</span><span><M text={r} /></span></p>)}</div>
    </div>
    {caption && <figcaption className="text-xs text-base-content/70"><M text={caption} /></figcaption>}
  </figure>;
}

export function TableView({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{caption && <caption className="mb-1 font-bold">{caption}</caption>}
    <thead><tr className="bg-success text-success-content">{head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 ${j === 0 ? "font-bold" : ""}`}>{typeof c === "number" ? idn(c) : c}</td>)}</tr>)}</tbody></table></div>;
}

/* ---------- Karung pupuk ---------- */
export function Sack({ color, label, size = 22 }: { color: string; label?: string; size?: number }) {
  return <svg viewBox="0 0 24 28" width={size} height={size * 28 / 24} aria-hidden="true">
    <path d="M7 5 Q12 8 17 5 L16 9 Q22 13 21 22 Q20 27 12 27 Q4 27 3 22 Q2 13 8 9 Z" fill={color} stroke={ink} strokeWidth="1" strokeLinejoin="round" />
    <path d="M7 5 Q12 2 17 5" fill="none" stroke={ink} strokeWidth="1" /><path d="M8.5 9.5 Q12 11 15.5 9.5" fill="none" stroke={ink} strokeWidth="0.8" />
    {label && <text x="12" y="21" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">{label}</text>}
  </svg>;
}

/* ---------- Segitiga dengan panjang sisi 5, 9, 10 ---------- */
function TriangleFig({ labels, caption }: { labels: [string, string, string]; caption?: string }) {
  // titik A(20,150) B(220,150) C; AB = 10 satuan (z), AC = 9 (y), BC = 5 (x)
  const s = 20, A = [20, 150], B = [20 + 10 * s, 150], cx = (100 + 81 - 25) / 20, cy = Math.sqrt(81 - cx * cx), C = [20 + cx * s, 150 - cy * s];
  const mid = (P: number[], Q: number[], dx: number, dy: number) => [(P[0] + Q[0]) / 2 + dx, (P[1] + Q[1]) / 2 + dy];
  const [zx, zy] = mid(A, B, 0, 18), [yx, yy] = mid(A, C, -12, -4), [xx, xy] = mid(B, C, 12, -4);
  return <figure className="flex flex-col items-center gap-1"><svg viewBox="0 0 240 180" className="w-full max-w-xs max-sm:max-h-[17vh]!" role="img" aria-label={`Segitiga dengan sisi ${labels.join(", ")}`}>
    <path d={`M${A} L${B} L${C} Z`} fill="#e7f5ec" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
    <text x={zx} y={zy} textAnchor="middle" fontSize="15" fontStyle="italic" fill={warm}>{labels[2]}</text>
    <text x={yx} y={yy} textAnchor="end" fontSize="15" fontStyle="italic" fill={accent}>{labels[1]}</text>
    <text x={xx} y={xy} textAnchor="start" fontSize="15" fontStyle="italic" fill={leaf}>{labels[0]}</text>
  </svg>{caption && <figcaption className="text-xs text-base-content/70">{caption}</figcaption>}</figure>;
}

/* ---------- Ikan mas: kepala, tubuh, ekor ---------- */
function FishFig({ head, body, tail }: { head: string; body: string; tail: string }) {
  return <svg viewBox="0 0 320 150" className="w-full max-w-sm" role="img" aria-label={`Ikan mas dibagi menjadi kepala ${head}, ${body}, dan ${tail}`}>
    <path d="M236 70 L300 30 Q288 70 300 110 Z" fill="#f59f00" stroke={ink} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M20 70 Q40 28 110 26 Q190 24 236 70 Q190 116 110 114 Q40 112 20 70 Z" fill="#fab005" stroke={ink} strokeWidth="1.5" />
    <path d="M120 28 Q150 6 190 34" fill="#f59f00" stroke={ink} strokeWidth="1.2" />
    <path d="M75 34 Q88 70 75 106" fill="none" stroke={ink} strokeWidth="1.3" />
    {[0, 1, 2].map(r => [0, 1, 2, 3].map(c => <path key={`${r}${c}`} d={`M${100 + c * 28} ${50 + r * 20} q10 8 0 16`} fill="none" stroke="#e67700" strokeWidth="1" />))}
    <circle cx="45" cy="60" r="5" fill="#fff" stroke={ink} /><circle cx="46" cy="60" r="2.2" fill={ink} />
    <path d="M24 76 Q30 80 36 77" fill="none" stroke={ink} strokeWidth="1.2" />
    {[[20, 75, head], [75, 236, body], [236, 300, tail]].map(([a, b, t]) => <g key={String(t)}>
      <line x1={Number(a)} x2={Number(b)} y1="132" y2="132" stroke={soft} strokeWidth="1" /><line x1={Number(a)} x2={Number(a)} y1="126" y2="138" stroke={soft} /><line x1={Number(b)} x2={Number(b)} y1="126" y2="138" stroke={soft} />
      <text x={(Number(a) + Number(b)) / 2} y="147" textAnchor="middle" fontSize="11" fill={ink}>{String(t)}</text></g>)}
  </svg>;
}

/* ---------- Timbangan badan digital ---------- */
function ScalesFig({ items }: { items: { names: string; value: number }[] }) {
  return <div className="grid w-full max-w-md grid-cols-3 gap-2" role="img" aria-label={`Hasil timbangan: ${items.map(i => `${i.names} ${i.value} kg`).join(", ")}`}>
    {items.map(it => <figure key={it.names} className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 80" className="w-full" aria-hidden="true">
        <rect x="6" y="18" width="88" height="56" rx="14" fill="#e9ecef" stroke={ink} strokeWidth="1.5" />
        <rect x="14" y="26" width="72" height="40" rx="9" fill="#f8f9fa" stroke="#ced4da" />
        <rect x="28" y="31" width="44" height="17" rx="3" fill="#1f3b30" />
        <text x="50" y="44" textAnchor="middle" fontSize="12" fontFamily="monospace" fill="#8ce99a">{it.value}</text>
        <text x="50" y="59" textAnchor="middle" fontSize="8" fill={soft}>kg</text>
        <rect x="16" y="74" width="10" height="4" rx="1" fill={ink} /><rect x="74" y="74" width="10" height="4" rx="1" fill={ink} />
      </svg>
      <figcaption className="text-center text-xs font-semibold">{it.names}</figcaption></figure>)}
  </div>;
}

/* ---------- Simbol: bintang empat, bintang lima, matahari ---------- */
const symName: Record<Sym, string> = { s: "bintang empat sudut", b: "bintang lima sudut", m: "matahari" };
function SymbolShape({ k, x, y, w }: { k: Sym; x: number; y: number; w: number }) {
  const c = [x + w / 2, y + w / 2], r = w * 0.4, stroke = "#7048e8";
  if (k === "s") { const p = [0, 1, 2, 3].flatMap(i => { const a = (i * Math.PI) / 2 - Math.PI / 2, b = a + Math.PI / 4; return [[c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)], [c[0] + r * 0.32 * Math.cos(b), c[1] + r * 0.32 * Math.sin(b)]]; });
    return <polygon points={p.map(v => v.join(",")).join(" ")} fill="#f3f0ff" stroke={stroke} strokeWidth="1.4" />; }
  if (k === "b") { const p = Array.from({ length: 10 }, (_, i) => { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.42 : r; return [c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)]; });
    return <polygon points={p.map(v => v.join(",")).join(" ")} fill="#f3f0ff" stroke={stroke} strokeWidth="1.4" />; }
  return <g><circle cx={c[0]} cy={c[1]} r={r * 0.5} fill="#fff9db" stroke={stroke} strokeWidth="1.4" />
    {Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4, ri = r * 0.68, ro = r * 0.98, h = 0.16;
      return <polygon key={i} points={[[c[0] + ri * Math.cos(a - h), c[1] + ri * Math.sin(a - h)], [c[0] + ro * Math.cos(a), c[1] + ro * Math.sin(a)], [c[0] + ri * Math.cos(a + h), c[1] + ri * Math.sin(a + h)]].map(v => v.join(",")).join(" ")} fill="#fff9db" stroke={stroke} strokeWidth="1.2" />; })}</g>;
}
function SymbolsFig({ grid, rowSums, colSums }: { grid: Sym[][]; rowSums: (number | null)[]; colSums: (number | null)[] }) {
  const w = 52, g = 6, n = grid.length, W = n * (w + g) + 50, H = n * (w + g) + 26;
  const desc = grid.map((r, i) => `baris ${i + 1}: ${r.map(k => symName[k]).join(", ")}, jumlah ${rowSums[i]}`).join("; ");
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role="img" aria-label={`Teka-teki simbol. ${desc}. Jumlah kolom: ${colSums.map(v => (v === null ? "tanda tanya" : v)).join(", ")}`}>
    {grid.map((r, i) => r.map((k, j) => <g key={`${i}${j}`}><rect x={j * (w + g)} y={i * (w + g)} width={w} height={w} fill="#fff" stroke="#b197fc" /><SymbolShape k={k} x={j * (w + g)} y={i * (w + g)} w={w} /></g>))}
    {rowSums.map((v, i) => <text key={`r${i}`} x={n * (w + g) + 6} y={i * (w + g) + w / 2 + 5} fontSize="15" fill={ink}>{v ?? "?"}</text>)}
    {colSums.map((v, j) => <text key={`c${j}`} x={j * (w + g) + w / 2} y={n * (w + g) + 16} textAnchor="middle" fontSize="15" fontWeight={v === null ? 700 : 400} fill={v === null ? warm : ink}>{v ?? "?"}</text>)}
  </svg>;
}

/* ---------- Titik pada bidang koordinat ---------- */
function PointsFig({ pts }: { pts: [number, number][] }) {
  const W = 240, H = 200, x0 = -3, x1 = 4, y0 = -1, y1 = 8, X = (v: number) => 20 + ((v - x0) / (x1 - x0)) * (W - 40), Y = (v: number) => H - 20 - ((v - y0) / (y1 - y0)) * (H - 40);
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" role="img" aria-label={`Titik ${pts.map(p => `(${idn(p[0])}, ${idn(p[1])})`).join(", ")}`}>
    {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map(v => <line key={`x${v}`} x1={X(v)} x2={X(v)} y1={Y(y0)} y2={Y(y1)} stroke="#eef2f0" />)}
    {Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i).map(v => <line key={`y${v}`} y1={Y(v)} y2={Y(v)} x1={X(x0)} x2={X(x1)} stroke="#eef2f0" />)}
    <line x1={X(x0)} x2={X(x1)} y1={Y(0)} y2={Y(0)} stroke={ink} /><line y1={Y(y0)} y2={Y(y1)} x1={X(0)} x2={X(0)} stroke={ink} />
    {[-2, -1, 1, 2, 3].map(v => <text key={v} x={X(v)} y={Y(0) + 12} textAnchor="middle" fontSize="9" fill={soft}>{idn(v)}</text>)}
    {[2, 4, 6].map(v => <text key={v} x={X(0) - 4} y={Y(v) + 3} textAnchor="end" fontSize="9" fill={soft}>{v}</text>)}
    {pts.map(([a, b]) => <g key={`${a}${b}`}><circle cx={X(a)} cy={Y(b)} r="4.5" fill={warm} /><text x={X(a) + 7} y={Y(b) - 6} fontSize="10" fill={ink}>({idn(a)}, {idn(b)})</text></g>)}
  </svg>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "system": return <SystemView rows={scene.rows} caption={scene.caption} />;
    case "table": return <TableView head={scene.head} rows={scene.rows} caption={scene.caption} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
    case "triangle": return <TriangleFig labels={scene.labels} caption={scene.caption} />;
    case "fish": return <FishFig head={scene.head} body={scene.body} tail={scene.tail} />;
    case "scales": return <ScalesFig items={scene.items} />;
    case "symbols": return <SymbolsFig grid={scene.grid} rowSums={scene.rowSums} colSums={scene.colSums} />;
    case "points": return <PointsFig pts={scene.pts} />;
  }
}
