import { M, plainMath } from "./GradeEightPowersArt";
import { idn, relSeries, type Scene } from "@/data/grade-nine-probability";

export { M, plainMath };
const ink = "#1f3b30";

/* ---------- Kantong berisi bola ---------- */
export function BagView({ balls }: { balls: { color: string; name: string; count: number }[] }) {
  const all = balls.flatMap(b => Array.from({ length: b.count }, () => b)), per = 6, rows = Math.ceil(all.length / per);
  return <svg viewBox={`0 0 220 ${80 + rows * 26}`} className="w-full max-w-[15rem]" role="img" aria-label={`Kantong berisi ${balls.map(b => `${b.count} bola ${b.name}`).join(", ")}`}>
    <path d={`M30 30Q20 ${60 + rows * 26} 50 ${68 + rows * 26}H170Q200 ${60 + rows * 26} 190 30Z`} fill="#e9d8b4" stroke="#8a6b47" strokeWidth="2" />
    <path d="M30 30Q110 14 190 30" fill="none" stroke="#8a6b47" strokeWidth="3" /><path d="M95 22q15 -16 30 0" fill="none" stroke="#6b5235" strokeWidth="2.5" />
    {all.map((b, i) => { const x = 52 + (i % per) * 23, y = 50 + Math.floor(i / per) * 26; return <g key={i}><circle cx={x} cy={y} r="10" fill={b.color} stroke="#33413b" strokeWidth="1" /><circle cx={x - 3} cy={y - 3} r="2.5" fill="#ffffff" fillOpacity="0.6" /></g>; })}
    <text x="110" y={80 + rows * 26 - 2} textAnchor="middle" fontSize="11" fontWeight="700" fill={ink}>{balls.map(b => `${b.count} ${b.name}`).join(", ")}</text>
  </svg>;
}

/* ---------- Diagram batang ---------- */
export function BarsView({ labels, values, xlabel, title }: { labels: string[]; values: number[]; xlabel: string; title?: string }) {
  const W = 300, H = 190, x0 = 34, y0 = 150, top = 20, max = Math.ceil((Math.max(...values) * 1.15) / 10) * 10 || 10, bw = (W - x0 - 10) / labels.length, Y = (v: number) => y0 - (v / max) * (y0 - top);
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role="img" aria-label={`${title ?? "Diagram batang"}: ${labels.map((l, i) => `${l} ${values[i]}`).join(", ")}`}>
    {title && <text x={W / 2} y="12" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{title}</text>}
    {[0, 0.25, 0.5, 0.75, 1].map(t => <g key={t}><line x1={x0} x2={W - 6} y1={Y(max * t)} y2={Y(max * t)} stroke="#e3ebe7" /><text x={x0 - 4} y={Y(max * t) + 3} textAnchor="end" fontSize="8" fill="#5b6b64">{idn(max * t)}</text></g>)}
    <line x1={x0} x2={W - 6} y1={y0} y2={y0} stroke="#33413b" />
    {values.map((v, i) => { const x = x0 + i * bw + bw * 0.18, w = bw * 0.64; return <g key={i}><rect x={x} y={Y(v)} width={w} height={y0 - Y(v)} rx="2" fill="#7aa7d6" /><text x={x + w / 2} y={Y(v) - 3} textAnchor="middle" fontSize="10" fontWeight="800" fill={ink}>{v}</text><text x={x + w / 2} y={y0 + 13} textAnchor="middle" fontSize="10" fill={ink}>{labels[i]}</text></g>; })}
    <text x={(W + x0) / 2} y={H - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>{xlabel}</text>
    <text x="10" y={(y0 + top) / 2} fontSize="10" fontWeight="700" fill={ink} transform={`rotate(-90 10 ${(y0 + top) / 2})`} textAnchor="middle">Frekuensi</text>
  </svg>;
}

/* ---------- Grafik frekuensi relatif ---------- */
export function RelView({ series, title, target, cls = "w-full max-w-sm" }: { series: number[]; title: string; target?: number; cls?: string }) {
  const W = 300, H = 180, x0 = 32, y0 = 145, w = W - x0 - 10, h = 125, n = series.length, X = (i: number) => x0 + ((i + 1) / Math.max(n, 1)) * w, Y = (v: number) => y0 - v * h;
  const step = n > 200 ? Math.ceil(n / 200) : 1, pts = series.map((v, i) => (i % step === 0 || i === n - 1 ? `${X(i)},${Y(v)}` : "")).filter(Boolean).join(" ");
  return <svg viewBox={`0 0 ${W} ${H}`} className={cls} role="img" aria-label={`${title}: ${n} percobaan, frekuensi relatif terakhir ${n ? idn(Math.round(series[n - 1] * 1000) / 1000) : 0}`}>
    {[0, 0.2, 0.4, 0.6, 0.8, 1].map(t => <g key={t}><line x1={x0} x2={W - 6} y1={Y(t)} y2={Y(t)} stroke="#e3ebe7" /><text x={x0 - 4} y={Y(t) + 3} textAnchor="end" fontSize="8" fill="#5b6b64">{idn(t)}</text></g>)}
    <line x1={x0} x2={W - 6} y1={y0} y2={y0} stroke="#33413b" /><line x1={x0} x2={x0} y1={y0} y2={y0 - h} stroke="#33413b" />
    {target !== undefined && <line x1={x0} x2={W - 6} y1={Y(target)} y2={Y(target)} stroke="#2b8a3e" strokeDasharray="5 3" strokeWidth="1.5" />}
    {n > 0 && <polyline points={pts} fill="none" stroke="#1c64b5" strokeWidth="1.8" />}
    <text x={(W + x0) / 2} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>Banyak percobaan ({n})</text>
  </svg>;
}

/* ---------- Roda putar ---------- */
export function SpinnerView({ sectors, cls = "w-full max-w-[12rem]" }: { sectors: { color: string; label: string }[]; cls?: string }) {
  const c = 90, R = 80, k = sectors.length;
  const P = (t: number) => [c + R * Math.sin(t), c - R * Math.cos(t)];
  return <svg viewBox="0 0 180 190" className={cls} role="img" aria-label={`Roda putar dengan ${k} juring sama besar: ${sectors.map(s => s.label).join(", ")}`}>
    {sectors.map((s, i) => { const a = (i / k) * 2 * Math.PI, b = ((i + 1) / k) * 2 * Math.PI, [x1, y1] = P(a), [x2, y2] = P(b), [lx, ly] = [c + R * 0.62 * Math.sin((a + b) / 2), c - R * 0.62 * Math.cos((a + b) / 2)];
      return <g key={i}><path d={`M${c} ${c}L${x1} ${y1}A${R} ${R} 0 0 1 ${x2} ${y2}Z`} fill={s.color} stroke="#ffffff" strokeWidth="2" />{k <= 10 && <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#ffffff" stroke="#1f3b30" strokeWidth="0.3">{/^\d+$/.test(s.label) ? s.label : ""}</text>}</g>; })}
    <circle cx={c} cy={c} r="6" fill="#33413b" /><path d={`M${c} ${c}L${c + 8} ${c - 46}L${c - 2} ${c - 4}Z`} fill="#33413b" />
  </svg>;
}

/* ---------- Diagram titik ---------- */
export function DotsView({ min, max, step, population, sample = [], label }: { min: number; max: number; step: number; population: number[]; sample?: number[]; label: string }) {
  const W = 300, x0 = 14, w = W - 28, X = (v: number) => x0 + ((v - min) / (max - min)) * w;
  const stack = (vals: number[]) => { const seen = new Map<number, number>(); return vals.map(v => { const k = seen.get(v) ?? 0; seen.set(v, k + 1); return [v, k] as const; }); };
  const pop = stack(population), maxK = Math.max(...pop.map(p => p[1]), 0) + 1, r = 4, base = 30 + maxK * (2 * r + 1), H = base + 40;
  const taken = new Map<number, number>();
  return <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-sm" role="img" aria-label={`${label}: populasi ${population.length} data${sample.length ? `, sampel ${sample.join(", ")}` : ""}`}>
    <text x={W / 2} y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>{label}</text>
    {pop.map(([v, k], i) => { const t = taken.get(v) ?? 0, isS = sample.filter(s => s === v).length > t; if (isS) taken.set(v, t + 1);
      return <circle key={i} cx={X(v)} cy={base - k * (2 * r + 1)} r={r} fill={isS ? "#e8590c" : "#ced4da"} stroke={isS ? "#a03f06" : "none"} />; })}
    <line x1={x0} x2={x0 + w} y1={base + r + 2} y2={base + r + 2} stroke="#33413b" />
    {Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step).map(v => <g key={v}><line x1={X(v)} x2={X(v)} y1={base + r + 2} y2={base + r + 6} stroke="#33413b" /><text x={X(v)} y={base + r + 18} textAnchor="middle" fontSize="9" fill={ink}>{v}</text></g>)}
  </svg>;
}

export function TableView({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption?: string }) {
  return <div className="w-full max-w-md overflow-x-auto"><table className="w-full border-collapse bg-base-100 text-center text-sm">{caption && <caption className="mb-1 font-bold">{caption}</caption>}
    <thead><tr className="bg-success text-success-content">{head.map(h => <th key={h} className="px-2 py-1">{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-base-300">{r.map((c, j) => <td key={j} className={`px-2 py-1 ${j === 0 ? "font-bold" : ""}`}>{c}</td>)}</tr>)}</tbody></table></div>;
}

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "bag": return <BagView balls={scene.balls} />;
    case "bars": return <BarsView labels={scene.labels} values={scene.values} xlabel={scene.xlabel} title={scene.title} />;
    case "rel": return <RelView series={relSeries(scene.p, scene.n, scene.seed)} title={scene.title} />;
    case "spinner": return <SpinnerView sectors={scene.sectors} />;
    case "dots": return <DotsView {...scene} />;
    case "table": return <TableView head={scene.head} rows={scene.rows} caption={scene.caption} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
