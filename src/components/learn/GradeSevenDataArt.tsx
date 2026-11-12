import { idn, type Line, type Pie } from "@/data/grade-seven-data";

/* ---------- Line plot: tanda X di atas garis bilangan ---------- */
export function LinePlot({ title, min, max, counts, onTick, label }: { title?: string; min: number; max: number; counts: number[]; onTick?: (v: number, add: boolean) => void; label?: string }) {
  const n = max - min + 1, gap = n > 16 ? 14 : 26, W = n * gap + 20, top = Math.max(4, ...counts), H = top * 13 + 46;
  return <figure className="w-full">
    {title && <figcaption className="mb-1 text-center text-sm font-bold">{title}</figcaption>}
    <div className="overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full" style={{ maxWidth: W * 1.5, minWidth: Math.min(W, 280) }} role="img" aria-label={label ?? `Line plot dari ${min} sampai ${max}`}>
      <line x1="6" x2={W - 6} y1={H - 26} y2={H - 26} stroke="#33413b" strokeWidth="1.5" />
      {counts.map((c, k) => { const x = 10 + k * gap + gap / 2, v = min + k;
        return <g key={k}>
          <line x1={x} x2={x} y1={H - 30} y2={H - 22} stroke="#33413b" />
          <text x={x} y={H - 10} fontSize="9.5" textAnchor="middle" fill="#1f3b30">{v}</text>
          {Array.from({ length: c }, (_, j) => <text key={j} x={x} y={H - 33 - j * 13} fontSize="12" fontWeight="800" textAnchor="middle" fill="#1c64b5">×</text>)}
          {onTick && <rect x={x - gap / 2} y="0" width={gap} height={H} fill="transparent" className="cursor-pointer" role="button" tabIndex={0} aria-label={`Tambah X di ${v}`}
            onClick={e => onTick(v, !e.shiftKey)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTick(v, true); } if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); onTick(v, false); } }} />}
        </g>; })}
    </svg></div>
  </figure>;
}

/* ---------- Diagram lingkaran ---------- */
export function PieChart({ pie, size = 220, highlight }: { pie: Pie; size?: number; highlight?: number }) {
  const total = pie.parts.reduce((a, p) => a + p.value, 0) || 1, R = 80, c = 110;
  const starts = pie.parts.reduce<number[]>((a, p, i) => [...a, (a[i - 1] ?? 0) + (i ? pie.parts[i - 1].value : 0)], []);
  const arcs = pie.parts.map((p, i) => ({ ...p, a0: (starts[i] / total) * 2 * Math.PI, a1: ((starts[i] + p.value) / total) * 2 * Math.PI }));
  const pt = (a: number, r = R): [number, number] => [c + r * Math.sin(a), c - r * Math.cos(a)];
  return <figure className="w-full" style={{ maxWidth: size + 80 }}>
    <figcaption className="mb-1 text-center text-sm font-bold">{pie.title}</figcaption>
    <svg viewBox="0 0 220 220" className="mx-auto w-full" style={{ maxWidth: size }} role="img" aria-label={`${pie.title}: ${pie.parts.map(p => `${p.name} ${idn(p.value)}`).join(", ")}`}>
      {arcs.map((a, k) => { const [x0, y0] = pt(a.a0), [x1, y1] = pt(a.a1), large = a.a1 - a.a0 > Math.PI ? 1 : 0, mid = (a.a0 + a.a1) / 2, [lx, ly] = pt(mid, R * 0.62);
        const d = a.a1 - a.a0 >= 2 * Math.PI - 1e-9 ? `M${c} ${c - R}A${R} ${R} 0 1 1 ${c - 0.01} ${c - R}Z` : `M${c} ${c}L${x0} ${y0}A${R} ${R} 0 ${large} 1 ${x1} ${y1}Z`;
        const r1 = (x: number) => idn(Math.round(x * 10) / 10), txt = pie.show === "value" ? idn(a.value) : pie.show === "percent" ? `${r1((a.value / total) * 100)}%` : pie.show === "angle" ? `${r1((a.value / total) * 360)}°` : "";
        return <g key={k}><path d={d} fill={a.color} stroke="#ffffff" strokeWidth={highlight === k ? 3 : 1.5} opacity={highlight === undefined || highlight === k ? 1 : 0.55} />
          {txt && a.a1 - a.a0 > 0.25 && <text x={lx} y={ly + 4} fontSize="11" fontWeight="800" textAnchor="middle" fill={a.color === "#e9ecef" || a.color === "#f5b014" ? "#1f2a25" : "#ffffff"}>{txt}</text>}</g>; })}
      <circle cx={c} cy={c} r={R} fill="none" stroke="#55625c" strokeWidth="1" />
    </svg>
    <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">{pie.parts.map(p => <li key={p.name} className="flex items-center gap-1"><span className="inline-block size-3 rounded-sm ring-1 ring-black/20" style={{ background: p.color }} />{p.name}</li>)}</ul>
  </figure>;
}

/* ---------- Diagram garis ---------- */
export function LineChart({ line, compact = false }: { line: Line; compact?: boolean }) {
  const L = 34, T = 10, W = 300, H = compact ? 120 : 190, pw = W - L - 10, ph = H - T - 28, n = line.cats.length;
  const x = (i: number) => L + (n === 1 ? pw / 2 : (i * pw) / (n - 1)), y = (v: number) => T + ph - (v / line.max) * ph;
  const ticks: number[] = []; for (let t = 0; t <= line.max; t += line.step) ticks.push(t);
  return <figure className="w-full max-w-md">
    {!compact && <figcaption className="mb-1 text-center text-sm font-bold">{line.title}</figcaption>}
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${line.title}: ${line.series.map(s => `${s.name} ${s.values.join(", ")}`).join("; ")}`}>
      {ticks.map(t => <g key={t}><line x1={L} x2={W - 10} y1={y(t)} y2={y(t)} stroke="#e1e7e4" />{!compact && <text x={L - 4} y={y(t) + 3} fontSize="8.5" textAnchor="end" fill="#33413b">{idn(t)}</text>}</g>)}
      <line x1={L} y1={T} x2={L} y2={T + ph} stroke="#33413b" /><line x1={L} y1={T + ph} x2={W - 10} y2={T + ph} stroke="#33413b" />
      {line.series.map(s => <g key={s.name}><polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2.2" strokeLinejoin="round" />
        {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#ffffff" stroke={s.color} strokeWidth="1.6" />)}</g>)}
      {!compact && line.cats.map((c, i) => <text key={c} x={x(i)} y={T + ph + 14} fontSize="9" textAnchor="middle" fill="#1f3b30">{c}</text>)}
    </svg>
    {line.series.length > 1 && !compact && <p className="flex justify-center gap-3 text-xs">{line.series.map(s => <span key={s.name} className="inline-flex items-center gap-1"><span className="inline-block h-0.5 w-4" style={{ background: s.color }} />{s.name}</span>)}</p>}
  </figure>;
}

/* ---------- Diagram batang dengan awal sumbu yang dapat diubah ---------- */
export function AxisBars({ title, cats, values, from, to, step }: { title: string; cats: string[]; values: number[]; from: number; to: number; step: number }) {
  const L = 34, T = 10, W = 260, H = 190, ph = H - T - 30, slot = (W - L - 10) / cats.length, y = (v: number) => T + ph - ((v - from) / (to - from)) * ph;
  const ticks: number[] = []; for (let t = from; t <= to; t += step) ticks.push(t);
  return <figure className="w-full max-w-sm">
    <figcaption className="mb-1 text-center text-sm font-bold">{title}</figcaption>
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title}, sumbu tegak mulai dari ${from}: ${cats.map((c, i) => `${c} ${values[i]}`).join(", ")}`}>
      {ticks.map(t => <g key={t}><line x1={L} x2={W - 10} y1={y(t)} y2={y(t)} stroke="#e1e7e4" /><text x={L - 4} y={y(t) + 3} fontSize="9" textAnchor="end" fill="#33413b">{t}</text></g>)}
      {cats.map((c, i) => <g key={c}><rect x={L + i * slot + slot * 0.25} y={y(values[i])} width={slot * 0.5} height={y(from) - y(values[i])} fill="#f08a24" />
        <text x={L + i * slot + slot / 2} y={T + ph + 14} fontSize="10" textAnchor="middle" fontWeight="700" fill="#1f3b30">{c}</text></g>)}
      <line x1={L} y1={T} x2={L} y2={T + ph} stroke="#33413b" /><line x1={L} y1={T + ph} x2={W - 10} y2={T + ph} stroke="#33413b" />
    </svg>
  </figure>;
}

/* ---------- Empat diagram mini tanpa angka ---------- */
export function MiniCharts() {
  const one: Line = { title: "Diagram 1", cats: ["1", "2", "3", "4", "5", "6", "7"], series: [{ name: "a", color: "#33413b", values: [2, 4, 3, 5, 6, 9, 8] }], max: 10, step: 2, valueLabel: "" };
  const two: Line = { title: "Diagram 3", cats: ["1", "2", "3", "4", "5", "6", "7"], series: [{ name: "a", color: "#33413b", values: [2, 5, 7, 8, 6, 4, 9] }, { name: "b", color: "#2f86d6", values: [1, 3, 6, 7, 8, 5, 7] }], max: 10, step: 2, valueLabel: "" };
  return <div className="grid w-full grid-cols-2 gap-3">
    <figure className="rounded-lg bg-base-100 p-2"><LineChart line={one} compact /><figcaption className="text-center text-sm font-bold">Diagram 1</figcaption></figure>
    <figure className="rounded-lg bg-base-100 p-2"><svg viewBox="0 0 120 80" className="w-full" role="img" aria-label="Diagram batang dengan tiga batang"><line x1="10" y1="72" x2="115" y2="72" stroke="#33413b" /><line x1="10" y1="5" x2="10" y2="72" stroke="#33413b" />
      {[20, 34, 58].map((h, i) => <rect key={i} x={24 + i * 30} y={72 - h} width="16" height={h} fill="#f7a8c4" stroke="#b5476e" />)}</svg><figcaption className="text-center text-sm font-bold">Diagram 2</figcaption></figure>
    <figure className="rounded-lg bg-base-100 p-2"><LineChart line={two} compact /><figcaption className="text-center text-sm font-bold">Diagram 3</figcaption></figure>
    <figure className="rounded-lg bg-base-100 p-2"><PieChart size={110} pie={{ title: "", show: "percent", parts: [{ name: "A", value: 20, color: "#a9d18e" }, { name: "B", value: 30, color: "#8cc06c" }, { name: "C", value: 15, color: "#b8dba0" }, { name: "D", value: 10, color: "#9ccb7c" }, { name: "E", value: 25, color: "#c7e3b4" }] }} /><figcaption className="text-center text-sm font-bold">Diagram 4</figcaption></figure>
  </div>;
}
