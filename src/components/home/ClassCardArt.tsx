import type { CSSProperties, ReactNode } from "react";

/**
 * Gambar kartu kelas di beranda: latar pastel berpola dan ilustrasi garis bertema matematika per kelas.
 * Animasi memakai kelas bsk-drift, bsk-bob, bsk-spin-slow, bsk-draw, dan bsk-dash-flow dari globals.css,
 * yang sudah dimatikan otomatis untuk pengguna yang memilih kurangi gerakan.
 */

const ink = "#17352a", green = "#208f6d", orange = "#e8590c", paper = "#ffffff";

/** Warna pastel lembut per kelas: latar panel dan warna pola. */
export const cardTones: { bg: string; line: string }[] = [
  { bg: "#d7f0e5", line: "#9fd3bd" }, { bg: "#fdf1c7", line: "#ecd27a" }, { bg: "#fde2dd", line: "#f2b2a6" },
  { bg: "#d9edf8", line: "#9cc8e6" }, { bg: "#e6f2d8", line: "#b8d89a" }, { bg: "#fde8cf", line: "#f0c08a" },
  { bg: "#dcefe9", line: "#9dcfc1" }, { bg: "#f6e6f0", line: "#dfb3cd" }, { bg: "#e3ecf9", line: "#aec3e8" },
  { bg: "#fbefd9", line: "#e7cc93" }, { bg: "#dff3ef", line: "#9fd8cd" }, { bg: "#f1eadf", line: "#d4c2a3" },
];

/** Pola latar: kisi segi enam, kertas berpetak, titik, dan garis kontur, bergantian per kelas. */
export function Pattern({ kind, color, id }: { kind: number; color: string; id: string }) {
  const pid = `bsk-card-pat-${id}`;
  const tile: ReactNode[] = [
    <path key="h" d="M10 0l10 6v12l-10 6l-10 -6v-12zM10 24v12M0 18l-10 6M20 18l10 6" fill="none" stroke={color} strokeWidth="1" />,
    <path key="g" d="M0 0h16v16M0 8h16M8 0v16" fill="none" stroke={color} strokeWidth="0.8" />,
    <g key="d" fill={color}><circle cx="4" cy="4" r="1.3" /><circle cx="14" cy="14" r="1.3" /></g>,
    <path key="t" d="M0 17l10 -14l10 14z" fill="none" stroke={color} strokeWidth="0.9" />,
  ];
  const size: [number, number][] = [[20, 36], [16, 16], [20, 20], [20, 20]];
  const k = kind % 4;
  return <svg aria-hidden="true" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
    <defs><pattern id={pid} width={size[k][0]} height={size[k][1]} patternUnits="userSpaceOnUse">{tile[k]}</pattern></defs>
    <rect width="100%" height="100%" fill={`url(#${pid})`} opacity=".85" />
    {kind % 3 === 2 && <g fill="none" stroke={color} strokeWidth="1.1" opacity=".9">{[18, 34, 50].map(r => <ellipse key={r} cx="88%" cy="18%" rx={r * 1.6} ry={r} />)}</g>}
  </svg>;
}

/** Simbol kecil yang melayang di sekitar ilustrasi. */
function Floaters({ items }: { items: string[] }) {
  const spots: CSSProperties[] = [{ left: "8%", top: "14%" }, { right: "9%", top: "12%" }, { left: "12%", bottom: "12%" }];
  return <>{items.map((m, i) => <span key={m} aria-hidden="true" className="bsk-drift absolute text-sm font-extrabold sm:text-base" style={{ ...spots[i], color: ink, opacity: 0.35, "--t": `${7 + i * 2}s`, "--d": `${-i * 1.7}s`, "--r": `${i % 2 ? -10 : 10}deg`, "--dy": "-5px" } as CSSProperties}>{m}</span>)}</>;
}

const S = { fill: paper, stroke: ink, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Ilustrasi garis per kelas, digambar pada kanvas 120 × 90. */
export function Drawing({ id }: { id: number }) {
  switch (id) {
    case 1: return <g>{/* manik-manik sempoa */}
      <rect x="18" y="16" width="84" height="60" rx="3" {...S} />
      {[32, 46, 60].map(y => <line key={y} x1="20" x2="100" y1={y} y2={y} stroke={ink} strokeWidth="1.4" />)}
      {[0, 1, 2].map(r => <g key={r} className="bsk-bob" style={{ animationDelay: `${r * 0.4}s` }}>{Array.from({ length: 3 - r + 2 }, (_, k) => <circle key={k} cx={28 + k * 11} cy={32 + r * 14} r="5" fill={r === 1 ? orange : green} stroke={ink} strokeWidth="1.3" />)}</g>)}</g>;
    case 2: return <g>{/* garis bilangan dengan lompatan */}
      <line x1="10" x2="110" y1="62" y2="62" {...S} />
      {[0, 1, 2, 3, 4, 5].map(k => <g key={k}><line x1={18 + k * 17} x2={18 + k * 17} y1="57" y2="67" stroke={ink} strokeWidth="2" /><text x={18 + k * 17} y="80" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink}>{k * 2}</text></g>)}
      {[0, 1, 2, 3, 4].map(k => <path key={k} d={`M${18 + k * 17} 56q8.5 -22 17 0`} fill="none" stroke={k % 2 ? orange : green} strokeWidth="2" className="bsk-dash-flow" />)}
      <circle cx="35" cy="36" r="6" className="bsk-bob" fill={orange} stroke={ink} strokeWidth="1.5" /></g>;
    case 3: return <g>{/* susunan titik perkalian 3 × 4 */}
      <rect x="22" y="14" width="76" height="62" rx="3" {...S} />
      {Array.from({ length: 12 }, (_, k) => <circle key={k} className="bsk-bob" style={{ animationDelay: `${(k % 4) * 0.25}s` }} cx={36 + (k % 4) * 16} cy={30 + Math.floor(k / 4) * 16} r="5" fill={k < 4 ? orange : green} stroke={ink} strokeWidth="1.2" />)}
      <text x="60" y="88" textAnchor="middle" fontSize="10" fontWeight="800" fill={ink}>3 × 4</text></g>;
    case 4: return <g>{/* pecahan lingkaran */}
      <circle cx="56" cy="46" r="30" {...S} />
      {[0, 90, 180, 270].map(a => <line key={a} x1="56" y1="46" x2={56 + 30 * Math.cos((a * Math.PI) / 180)} y2={46 + 30 * Math.sin((a * Math.PI) / 180)} stroke={ink} strokeWidth="1.8" />)}
      <path d="M56 46V16A30 30 0 0 1 86 46z" fill={orange} stroke={ink} strokeWidth="2" className="bsk-drift" style={{ "--t": "6s", "--dx": "5px", "--dy": "-5px", "--r": "0deg" } as CSSProperties} />
      <text x="102" y="30" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>¼</text></g>;
    case 5: return <g>{/* busur derajat dan sudut */}
      <path d="M14 70a46 46 0 0 1 92 0z" {...S} />
      {Array.from({ length: 9 }, (_, k) => { const a = Math.PI - (k * Math.PI) / 8; return <line key={k} x1={60 + 38 * Math.cos(a)} y1={70 - 38 * Math.sin(a)} x2={60 + 44 * Math.cos(a)} y2={70 - 44 * Math.sin(a)} stroke={ink} strokeWidth="1.4" />; })}
      <g className="bsk-spin-slow" style={{ transformOrigin: "60px 70px", transformBox: "view-box" }}><line x1="60" y1="70" x2="96" y2="42" stroke={orange} strokeWidth="2.6" strokeLinecap="round" /></g>
      <line x1="60" y1="70" x2="104" y2="70" stroke={green} strokeWidth="2.6" strokeLinecap="round" /><circle cx="60" cy="70" r="3" fill={ink} /></g>;
    case 6: return <g>{/* cincin persen */}
      <circle cx="58" cy="46" r="28" fill={paper} stroke="#e6ece9" strokeWidth="10" />
      <circle cx="58" cy="46" r="28" fill="none" stroke={green} strokeWidth="10" strokeDasharray="132 176" transform="rotate(-90 58 46)" className="bsk-draw" style={{ "--len": "176" } as CSSProperties} />
      <circle cx="58" cy="46" r="34" fill="none" stroke={ink} strokeWidth="1.6" /><circle cx="58" cy="46" r="22" fill="none" stroke={ink} strokeWidth="1.6" />
      <text x="58" y="51" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>75%</text></g>;
    case 7: return <g>{/* timbangan aljabar */}
      <path d="M60 22L52 78h16z" {...S} /><line x1="56" y1="80" x2="64" y2="80" stroke={ink} strokeWidth="3" />
      <g className="bsk-bob"><line x1="22" x2="98" y1="28" y2="28" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 28l-10 22h20zM98 28l-10 22h20z" fill="none" stroke={ink} strokeWidth="1.3" />
        <rect x="14" y="40" width="16" height="12" rx="2" fill={orange} stroke={ink} strokeWidth="1.5" /><text x="22" y="49.5" textAnchor="middle" fontSize="8" fontWeight="800" fill={paper}>x</text>
        {[0, 1, 2].map(k => <circle key={k} cx={91 + k * 7} cy="47" r="3.2" fill={green} stroke={ink} strokeWidth="1" />)}</g>
      <circle cx="60" cy="28" r="3" fill={ink} /></g>;
    case 8: return <g>{/* segitiga siku-siku dengan persegi pada sisinya */}
      <rect x="22" y="40" width="22" height="22" fill={orange} opacity=".85" stroke={ink} strokeWidth="1.6" />
      <rect x="44" y="62" width="26" height="26" fill={green} opacity=".85" stroke={ink} strokeWidth="1.6" />
      <path d="M44 40l26 22l22 -26l-26 -22z" fill="#d9edf8" stroke={ink} strokeWidth="1.6" className="bsk-drift" style={{ "--t": "8s", "--dx": "2px", "--dy": "-3px", "--r": "0deg" } as CSSProperties} />
      <path d="M44 40v22h26z" {...S} /><path d="M44 56h6v6" fill="none" stroke={ink} strokeWidth="1.3" />
      <text x="68" y="40" textAnchor="middle" fontSize="9" fontWeight="800" fill={ink}>c²</text><text x="33" y="54" textAnchor="middle" fontSize="8" fontWeight="800" fill={paper}>a²</text><text x="57" y="78" textAnchor="middle" fontSize="8" fontWeight="800" fill={paper}>b²</text></g>;
    case 9: return <g>{/* parabola pada bidang koordinat */}
      <line x1="10" x2="110" y1="70" y2="70" stroke={ink} strokeWidth="1.6" /><line x1="60" x2="60" y1="8" y2="84" stroke={ink} strokeWidth="1.6" />
      <path d="M22 14Q60 120 98 14" fill="none" stroke={green} strokeWidth="2.6" className="bsk-draw" style={{ "--len": "200" } as CSSProperties} />
      <circle cx="60" cy="67" r="4" fill={orange} stroke={ink} strokeWidth="1.3" className="bsk-bob" /><text x="96" y="12" fontSize="9" fontWeight="800" fill={ink}>y = x²</text></g>;
    case 10: return <g>{/* lingkaran satuan dengan jari-jari berputar */}
      <line x1="14" x2="106" y1="46" y2="46" stroke={ink} strokeWidth="1.4" /><line x1="60" x2="60" y1="6" y2="86" stroke={ink} strokeWidth="1.4" />
      <circle cx="60" cy="46" r="32" fill="none" stroke={ink} strokeWidth="2" />
      <g className="bsk-spin-slow" style={{ transformOrigin: "60px 46px", transformBox: "view-box" }}><line x1="60" y1="46" x2="83" y2="24" stroke={orange} strokeWidth="2.6" strokeLinecap="round" /><circle cx="83" cy="24" r="4" fill={orange} stroke={ink} strokeWidth="1.2" /></g>
      <path d="M72 46a12 12 0 0 0 -3 -8" fill="none" stroke={green} strokeWidth="2" /><text x="80" y="42" fontSize="9" fontWeight="800" fill={ink}>θ</text></g>;
    case 11: return <g>{/* diagram batang statistik */}
      <line x1="14" x2="106" y1="78" y2="78" stroke={ink} strokeWidth="2" /><line x1="16" x2="16" y1="10" y2="80" stroke={ink} strokeWidth="2" />
      {[30, 46, 24, 58, 40].map((h, k) => <rect key={k} x={24 + k * 16} y={78 - h} width="11" height={h} fill={k === 3 ? orange : green} stroke={ink} strokeWidth="1.4" className="bsk-bob" style={{ animationDelay: `${k * 0.3}s` }} />)}
      <path d="M29 44l16 -16l16 22l16 -34l16 18" fill="none" stroke={ink} strokeWidth="1.5" strokeDasharray="3 3" /></g>;
    default: return <g>{/* luas di bawah kurva */}
      <line x1="10" x2="110" y1="76" y2="76" stroke={ink} strokeWidth="1.6" /><line x1="16" x2="16" y1="8" y2="80" stroke={ink} strokeWidth="1.6" />
      <path d="M36 76V50C50 34 66 30 84 26V76z" fill={green} opacity=".35" />
      {[0, 1, 2, 3].map(k => <rect key={k} x={36 + k * 12} y={48 - k * 6} width="12" height={28 + k * 6} fill="none" stroke={orange} strokeWidth="1.3" className="bsk-dash-flow" />)}
      <path d="M20 70C40 40 70 26 104 20" fill="none" stroke={ink} strokeWidth="2.4" className="bsk-draw" style={{ "--len": "130" } as CSSProperties} />
      <text x="94" y="40" fontSize="12" fontWeight="800" fill={ink}>∫</text></g>;
  }
}

export const motifs = [["1", "2", "3"], ["+", "−", "="], ["×", "÷", "="], ["½", "¼", "¾"], ["∠", "°", "△"], ["%", "0,5", "∶"], ["x", "y", "="], ["a²", "√", "c²"], ["x²", "π", "√"], ["sin", "θ", "∞"], ["Σ", "x̄", "%"], ["∫", "dx", "lim"]];

/** Panel atas kartu kelas. */
export function ClassCardArt({ id }: { id: number }) {
  const tone = cardTones[(id - 1) % cardTones.length];
  return <div className="relative h-32 overflow-hidden sm:h-40" style={{ background: tone.bg }}>
    <Pattern kind={id - 1} color={tone.line} id={String(id)} />
    <Floaters items={motifs[(id - 1) % motifs.length]} />
    <svg viewBox="0 0 120 90" aria-hidden="true" className="absolute left-1/2 top-1/2 h-[78%] -translate-x-1/2 -translate-y-1/2 transition duration-300 group-hover:scale-105">
      <Drawing id={id} />
    </svg>
  </div>;
}
