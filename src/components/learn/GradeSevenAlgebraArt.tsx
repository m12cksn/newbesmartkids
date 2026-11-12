/* Gambar khusus Bab 4 Bentuk Aljabar: kantong dan kubus, korek api, bingkai ubin, pola titik, ubin aljabar. */

/** Kantong kertas berisi kubus yang tidak terlihat. */
export function Bag({ size = 40 }: { size?: number }) {
  return <svg viewBox="0 0 36 46" width={size} height={size * 1.28} aria-hidden="true">
    <path d="M4 8 L8 4 H28 L32 8 V44 H4 Z" fill="#c9a170" stroke="#7a5a32" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M8 4 L10 10 H26 L28 4" fill="#b58a58" stroke="#7a5a32" strokeWidth="1" />
    <path d="M4 8 H32" stroke="#7a5a32" strokeWidth="0.8" />
    <path d="M12 12 V42 M24 12 V42" stroke="#a87d4c" strokeWidth="0.7" />
  </svg>;
}
/** Kubus satuan kecil. */
export function Cube({ size = 16 }: { size?: number }) {
  return <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
    <path d="M3 7 L9 4 L17 6 L11 9 Z" fill="#e2b77a" stroke="#7a5a32" strokeWidth=".8" />
    <path d="M11 9 L17 6 V14 L11 17 Z" fill="#b5864e" stroke="#7a5a32" strokeWidth=".8" />
    <path d="M3 7 L11 9 V17 L3 15 Z" fill="#cf9f63" stroke="#7a5a32" strokeWidth=".8" />
  </svg>;
}
export function BagGroup({ bags, cubes, label, size = 34 }: { bags: number; cubes: number; label?: string; size?: number }) {
  return <figure className="flex flex-col items-center rounded-xl bg-base-100 p-2" aria-label={`${label ? `Gambar ${label}: ` : ""}${bags} kantong dan ${cubes} kubus lepas`}>
    <div className="flex flex-wrap items-end justify-center gap-1">
      {Array.from({ length: bags }, (_, k) => <Bag key={k} size={size} />)}
      <span className="ms-1 grid grid-cols-2 gap-0.5">{Array.from({ length: cubes }, (_, k) => <Cube key={k} size={size * 0.45} />)}</span>
    </div>
    {label && <figcaption className="mt-1 text-sm font-bold">Gambar {label}</figcaption>}
  </figure>;
}

/** Persegi berjajar dari korek api. */
export function Matches({ n, unit = 26 }: { n: number; unit?: number }) {
  const W = n * unit + 8, H = unit + 8;
  const stick = (x1: number, y1: number, x2: number, y2: number, k: string, first = false) => <g key={k}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d9a35b" strokeWidth="3" strokeLinecap="round" />
    <circle cx={x1} cy={y1} r="2.4" fill={first ? "#e5484d" : "#2f86d6"} /></g>;
  const s = [stick(4, 4, 4, 4 + unit, "l", true)];
  for (let k = 0; k < n; k++) { const x = 4 + k * unit; s.push(stick(x + 2, 4, x + unit, 4, `t${k}`), stick(x + 2, 4 + unit, x + unit, 4 + unit, `b${k}`), stick(x + unit, 6, x + unit, 4 + unit, `r${k}`)); }
  return <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${n} persegi dari ${1 + 3 * n} korek api`} className="max-w-full">{s}</svg>;
}

/** Daerah persegi yang dikelilingi ubin: ukuran n, n ubin di setiap sisi tanpa sudut. */
export function TileFrame({ n, cell = 12 }: { n: number; cell?: number }) {
  const S = (n + 2) * cell, tiles: [number, number][] = [];
  for (let k = 0; k < n; k++) tiles.push([k + 1, 0], [k + 1, n + 1], [0, k + 1], [n + 1, k + 1]);
  return <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} role="img" aria-label={`Ukuran ${n}: ${4 * n} ubin`}>
    <rect x={cell} y={cell} width={n * cell} height={n * cell} fill="#ffffff" stroke="#c9b48f" strokeWidth=".6" />
    {tiles.map(([c, r], k) => <rect key={k} x={c * cell} y={r * cell} width={cell} height={cell} fill="#d6b27c" stroke="#8a6a3a" strokeWidth="1" />)}
  </svg>;
}

/** Kolam renang bersisi s dengan ubin di sekelilingnya (termasuk sudut). */
export function Pool({ s, cell = 14, colorBy = "sides" }: { s: number; cell?: number; colorBy?: "sides" | "plain" }) {
  const S = (s + 2) * cell, tiles: { c: number; r: number; corner: boolean }[] = [];
  for (let c = 0; c < s + 2; c++) for (let r = 0; r < s + 2; r++) if (c === 0 || r === 0 || c === s + 1 || r === s + 1) tiles.push({ c, r, corner: (c === 0 || c === s + 1) && (r === 0 || r === s + 1) });
  return <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-56" role="img" aria-label={`Kolam bersisi ${s} m dikelilingi ${4 * s + 4} ubin`}>
    <rect x={cell} y={cell} width={s * cell} height={s * cell} fill="#8fd0e8" />
    <path d={`M${cell + 4} ${cell + s * cell * 0.4} q${cell} -6 ${cell * 2} 0 t${cell * 2} 0`} stroke="#ffffff" strokeOpacity=".7" fill="none" />
    {tiles.map((t, k) => <rect key={k} x={t.c * cell} y={t.r * cell} width={cell} height={cell} fill={colorBy === "sides" && t.corner ? "#2b8a3e" : "#e3b873"} stroke="#8a6a3a" strokeWidth="1" />)}
  </svg>;
}

/** Pola titik berbentuk X: pola ke-n mempunyai 4n + 2 titik. */
export function DotX({ n, gap = 9 }: { n: number; gap?: number }) {
  const pts: [number, number][] = [[-0.5, 0], [0.5, 0]];
  for (let k = 1; k <= n; k++) pts.push([-0.5 - k, -k], [-0.5 - k, k], [0.5 + k, -k], [0.5 + k, k]);
  const W = (2 * n + 2) * gap, H = (2 * n + 1) * gap;
  return <svg viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`} width={W} height={H} role="img" aria-label={`Pola ${n}: ${4 * n + 2} titik`}>
    {pts.map(([x, y], k) => <circle key={k} cx={x * gap} cy={y * gap} r={gap * 0.36} fill="#1f2a25" />)}
  </svg>;
}

/** Ubin aljabar: x berupa batang, satuan berupa persegi kecil; negatif berwarna merah. */
export function AlgebraTiles({ x, c, label }: { x: number; c: number; label?: string }) {
  const bar = (neg: boolean, k: number) => <span key={`x${k}`} className={`inline-block h-10 w-3 rounded-sm border ${neg ? "border-red-700 bg-red-300" : "border-emerald-800 bg-emerald-500"}`} />;
  const unit = (neg: boolean, k: number) => <span key={`u${k}`} className={`inline-block size-3 rounded-sm border ${neg ? "border-red-700 bg-red-300" : "border-amber-700 bg-amber-300"}`} />;
  return <div className="flex min-h-12 flex-wrap items-end gap-1" role="img" aria-label={label ?? `${x} ubin x dan ${c} ubin satuan`}>
    {Array.from({ length: Math.abs(x) }, (_, k) => bar(x < 0, k))}
    <span className="ms-1 grid grid-cols-5 gap-0.5">{Array.from({ length: Math.abs(c) }, (_, k) => unit(c < 0, k))}</span>
  </div>;
}

/** Model luas persegi panjang yang dibagi dua kolom dan (opsional) dua baris. */
const cellLabel = (r: string, c: string) => { if (r === c && /^[a-z]$/.test(r)) return `${r}²`; const n = [r, c].filter(t => /^\d+$/.test(t)), v = [r, c].filter(t => !/^\d+$/.test(t)); return `${n.length ? n.reduce((a, b) => a * Number(b), 1) : ""}${v.join("")}` || "1"; };
const offsets = (xs: number[]) => xs.map((_, i) => xs.slice(0, i).reduce((a, b) => a + b, 0));
export function AreaModel({ cols, rows }: { cols: { label: string; w: number; color: string }[]; rows: { label: string; h: number }[] }) {
  const W = cols.reduce((a, c) => a + c.w, 0), H = rows.reduce((a, r) => a + r.h, 0), k = Math.min(260 / W, 160 / H);
  const xs = offsets(cols.map(c => c.w * k)), ys = offsets(rows.map(r => r.h * k));
  return <svg viewBox={`-34 -4 ${W * k + 40} ${H * k + 30}`} className="mx-auto w-full max-w-sm" role="img" aria-label={`Persegi panjang ${rows.map(r => r.label).join(" + ")} kali ${cols.map(c => c.label).join(" + ")}`}>
    {rows.map((r, ri) => <g key={ri}>
      {cols.map((c, ci) => <g key={ci}><rect x={xs[ci]} y={ys[ri]} width={c.w * k} height={r.h * k} fill={c.color} fillOpacity={ri ? 0.55 : 0.9} stroke="#1f6f8b" strokeWidth="1.2" />
        <text x={xs[ci] + (c.w * k) / 2} y={ys[ri] + (r.h * k) / 2 + 4} fontSize="11" fontWeight="800" textAnchor="middle" fill="#0f3a47">{cellLabel(r.label, c.label)}</text></g>)}
      <text x={-6} y={ys[ri] + (r.h * k) / 2 + 4} fontSize="11" fontWeight="700" textAnchor="end" fill="#1f2a25">{r.label}</text></g>)}
    {cols.map((c, ci) => <text key={ci} x={xs[ci] + (c.w * k) / 2} y={H * k + 16} fontSize="11" fontWeight="700" textAnchor="middle" fill="#1f2a25">{c.label}</text>)}
  </svg>;
}
