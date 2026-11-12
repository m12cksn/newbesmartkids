import { fmt, type Thing } from "@/data/grade-five-million";

/* ---------- Benda berlabel harga: digambar khusus sesuai namanya ---------- */
function ThingShape({ thing, color = "#2f86d6" }: { thing: Thing; color?: string }) {
  switch (thing) {
    case "lemari": return <g>
      <path d="M14 10 Q40 0 66 10 V14 H14 Z" fill="#8a5a2b" />
      <rect x="16" y="14" width="48" height="58" rx="2" fill="#b07a45" stroke="#6b4320" strokeWidth="1.5" />
      <rect x="20" y="18" width="19" height="38" rx="1.5" fill="#c98f55" stroke="#6b4320" />
      <rect x="41" y="18" width="19" height="38" rx="1.5" fill="#c98f55" stroke="#6b4320" />
      <path d="M29.5 24 q-5 6 0 12 q5 6 0 12 M50.5 24 q5 6 0 12 q-5 6 0 12" stroke="#8a5a2b" strokeWidth="1.2" fill="none" />
      <circle cx="36.5" cy="38" r="1.3" fill="#e9c46a" /><circle cx="43.5" cy="38" r="1.3" fill="#e9c46a" />
      <rect x="20" y="59" width="40" height="9" rx="1.5" fill="#c98f55" stroke="#6b4320" /><rect x="36" y="62.5" width="8" height="2" rx="1" fill="#e9c46a" />
      <path d="M18 72 l-2 6 h6 l1 -6 M62 72 l2 6 h-6 l-1 -6" fill="#6b4320" />
    </g>;
    case "sepatu": return <g>
      <path d="M8 56 Q10 38 22 34 L34 30 Q38 42 50 44 L66 48 Q74 51 74 60 L74 64 H8 Z" fill={color} stroke="#1f3b30" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M22 34 Q24 26 34 24 L36 30" fill="#ffffff" stroke="#1f3b30" strokeWidth="1.2" />
      <rect x="8" y="62" width="66" height="7" rx="3" fill="#f1f3f2" stroke="#1f3b30" strokeWidth="1.2" />
      <path d="M33 36 l8 -2 M35 40 l8 -2 M38 44 l7 -1" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    </g>;
    case "speaker": return <g>
      <rect x="22" y="8" width="36" height="64" rx="4" fill="#33413b" stroke="#1f2a25" strokeWidth="1.5" />
      <circle cx="40" cy="24" r="8" fill="#55625c" stroke="#9aa5a0" strokeWidth="1.5" /><circle cx="40" cy="24" r="3" fill="#1f2a25" />
      <circle cx="40" cy="51" r="14" fill="#55625c" stroke="#9aa5a0" strokeWidth="1.5" /><circle cx="40" cy="51" r="5" fill="#1f2a25" />
      <circle cx="53" cy="12" r="1.3" fill="#69db7c" />
    </g>;
    case "mouse": return <g>
      <path d="M40 6 Q40 0 46 0" stroke="#55625c" strokeWidth="1.5" fill="none" transform="translate(-6 4)" />
      <path d="M26 30 Q26 10 40 10 Q54 10 54 30 V52 Q54 72 40 72 Q26 72 26 52 Z" fill="#e8ecea" stroke="#33413b" strokeWidth="1.6" />
      <path d="M26 32 H54 M40 10 V32" stroke="#33413b" strokeWidth="1.3" />
      <rect x="38" y="16" width="4" height="9" rx="2" fill="#55625c" />
    </g>;
    case "hardisk": return <g>
      <rect x="18" y="12" width="44" height="60" rx="6" fill="#4c6ef5" stroke="#364fc7" strokeWidth="1.5" />
      <rect x="24" y="18" width="32" height="42" rx="3" fill="#5c7cfa" />
      <circle cx="40" cy="66" r="1.6" fill="#a5d8ff" />
      <path d="M40 72 V78 M36 78 H44" stroke="#33413b" strokeWidth="2" strokeLinecap="round" />
    </g>;
    case "headset": return <g>
      <path d="M16 46 V40 Q16 14 40 14 Q64 14 64 40 V46" stroke="#33413b" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="10" y="42" width="14" height="22" rx="6" fill="#e5484d" stroke="#33413b" strokeWidth="1.4" />
      <rect x="56" y="42" width="14" height="22" rx="6" fill="#e5484d" stroke="#33413b" strokeWidth="1.4" />
      <path d="M17 62 Q20 74 34 72" stroke="#33413b" strokeWidth="2" fill="none" /><circle cx="35" cy="72" r="2.5" fill="#33413b" />
    </g>;
    case "jam": return <g>
      <rect x="31" y="4" width="18" height="20" rx="3" fill="#8a5a2b" /><rect x="31" y="56" width="18" height="20" rx="3" fill="#8a5a2b" />
      <circle cx="40" cy="40" r="19" fill="#e9c46a" stroke="#a5781d" strokeWidth="2" />
      <circle cx="40" cy="40" r="15" fill="#ffffff" />
      {Array.from({ length: 12 }, (_, k) => { const a = (k * Math.PI) / 6; return <line key={k} x1={40 + Math.sin(a) * 12.5} y1={40 - Math.cos(a) * 12.5} x2={40 + Math.sin(a) * 14} y2={40 - Math.cos(a) * 14} stroke="#33413b" strokeWidth="1.2" />; })}
      <path d="M40 40 V30 M40 40 L47 43" stroke="#33413b" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="58" y="38" width="3" height="4" rx="1" fill="#a5781d" />
    </g>;
  }
}
const thingNames: Record<Thing, string> = { lemari: "lemari ukir", sepatu: "sepatu", speaker: "speaker aktif", mouse: "mouse komputer", hardisk: "hardisk eksternal", headset: "headset", jam: "jam tangan" };
export function ThingCard({ thing, label, price, color }: { thing: Thing; label: string; price: number; color?: string }) {
  return <figure className="flex w-32 flex-col items-center rounded-xl bg-base-100 p-2 text-center sm:w-36">
    <svg viewBox="0 0 80 80" className="size-20" role="img" aria-label={thingNames[thing]}><ThingShape thing={thing} color={color} /></svg>
    <figcaption className="text-xs font-bold">{label}</figcaption>
    <span className="mt-1 rounded-md bg-info/15 px-2 py-0.5 text-sm font-extrabold text-info-content">Rp{fmt(price)},00</span>
  </figure>;
}

/* ---------- Uang: lembar dan keping sederhana, bukan tiruan uang asli ---------- */
const noteColor: Record<number, [string, string]> = {
  100000: ["#f8c9c9", "#c92a2a"], 50000: ["#cfe3fb", "#1c64b5"], 20000: ["#cdeccf", "#2b8a3e"], 10000: ["#e3d5f7", "#6741d9"],
  5000: ["#f1e0c3", "#8a5a2b"], 2000: ["#dfe3e6", "#495057"], 1000: ["#d9f2ec", "#0b7285"],
};
export function Money({ value, size = 1 }: { value: number; size?: number }) {
  if (value < 1000) return <svg viewBox="0 0 40 40" width={30 * size} height={30 * size} role="img" aria-label={`keping ${fmt(value)} rupiah`}>
    <circle cx="20" cy="20" r="18" fill={value === 500 ? "#fcc419" : "#ced4da"} stroke={value === 500 ? "#c77d00" : "#868e96"} strokeWidth="2" />
    <circle cx="20" cy="20" r="13.5" fill="none" stroke={value === 500 ? "#c77d00" : "#868e96"} strokeWidth="0.8" />
    <text x="20" y="24" fontSize="11" fontWeight="800" textAnchor="middle" fill="#3b3b3b">{value}</text>
  </svg>;
  const [bg, ink] = noteColor[value] ?? ["#eee", "#333"];
  return <svg viewBox="0 0 96 46" width={72 * size} height={34.5 * size} role="img" aria-label={`lembar ${fmt(value)} rupiah`}>
    <rect x="1" y="1" width="94" height="44" rx="4" fill={bg} stroke={ink} strokeWidth="1.5" />
    <rect x="5" y="5" width="86" height="36" rx="2" fill="none" stroke={ink} strokeWidth="0.6" strokeDasharray="2 2" />
    <circle cx="74" cy="23" r="10" fill="none" stroke={ink} strokeWidth="1" opacity=".5" />
    <text x="10" y="21" fontSize="13" fontWeight="800" fill={ink}>{fmt(value)}</text>
    <text x="10" y="34" fontSize="7" fontWeight="700" fill={ink} opacity=".75">RUPIAH</text>
  </svg>;
}

/* ---------- Grafik garis ---------- */
export function LineChart({ title, labels, values, max, step }: { title: string; labels: string[]; values: number[]; max: number; step: number }) {
  const L = 62, T = 14, W = 340, H = 210, pw = W - L - 16, ph = H - T - 30;
  const x = (i: number) => L + 18 + (i * (pw - 36)) / (labels.length - 1), y = (v: number) => T + ph - (v / max) * ph;
  const ticks: number[] = []; for (let t = 0; t <= max; t += step) ticks.push(t);
  return <figure className="w-full max-w-md">
    <figcaption className="mb-1 text-center text-sm font-extrabold">{title}</figcaption>
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${title}: ${labels.map((l, i) => `${l} ${fmt(values[i])}`).join(", ")}`}>
      {ticks.map(t => <g key={t}><line x1={L} x2={W - 16} y1={y(t)} y2={y(t)} stroke="#dfe5e2" /><text x={L - 5} y={y(t) + 4} fontSize="10" textAnchor="end" fill="#33413b">{fmt(t)}</text></g>)}
      <line x1={L} y1={T} x2={L} y2={T + ph} stroke="#33413b" strokeWidth="1.2" /><line x1={L} y1={T + ph} x2={W - 16} y2={T + ph} stroke="#33413b" strokeWidth="1.2" />
      <polyline points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#e8590c" strokeWidth="2.2" strokeLinejoin="round" />
      {values.map((v, i) => <g key={i}><circle cx={x(i)} cy={y(v)} r="4" fill="#e8590c" />
        <text x={x(i) + (i === 0 ? -4 : i === values.length - 1 ? 4 : 0)} y={y(v) - 9} fontSize="10" fontWeight="800" textAnchor={i === 0 ? "start" : i === values.length - 1 ? "end" : "middle"} fill="#1f3b30" paintOrder="stroke" stroke="#ffffff" strokeWidth="3">{fmt(v)}</text>
        <text x={x(i)} y={T + ph + 15} fontSize="10.5" fontWeight="700" textAnchor="middle" fill="#1f3b30">{labels[i]}</text></g>)}
    </svg>
  </figure>;
}
