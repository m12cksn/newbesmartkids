import type { CSSProperties } from "react";

/**
 * Ilustrasi garis per topik untuk kartu materi di halaman kelas (kanvas 160 × 100).
 * Gerak memakai kelas bsk-* dari globals.css; semuanya berhenti untuk pengguna yang memilih kurangi gerakan.
 */
const ink = "#17352a", green = "#208f6d", orange = "#e8590c", sky = "#5b9bd5", paper = "#ffffff";
const line = { fill: "none", stroke: ink, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export type TopicKind = "bilangan" | "operasi" | "pecahan" | "geometri" | "transformasi" | "ruang" | "ukur" | "data" | "pola" | "aljabar" | "rasio" | "peluang";

export function topicKind(topic: string, title = ""): TopicKind {
  const t = `${topic} ${title}`.toLowerCase();
  if (t.includes("peluang")) return "peluang";
  if (t.includes("perbandingan") || t.includes("ratio") || t.includes("skala")) return "rasio";
  if (t.includes("pecahan") || t.includes("fraction") || t.includes("desimal")) return "pecahan";
  if (t.includes("bangun ruang") || t.includes("lokasi") || t.includes("volume")) return "ruang";
  if (t.includes("transformasi") || t.includes("refleksi") || t.includes("simetri")) return "transformasi";
  if (t.includes("geometri") || t.includes("bentuk")) return "geometri";
  if (t.includes("data") || t.includes("statistik") || t.includes("diagram")) return "data";
  if (t.includes("ukur") || t.includes("waktu") || t.includes("panjang")) return "ukur";
  if (t.includes("pola")) return "pola";
  if (t.includes("aljabar") || t.includes("persamaan") || t.includes("fungsi")) return "aljabar";
  if (t.includes("penjumlahan") || t.includes("pengurangan") || t.includes("operasi") || t.includes("kalimat")) return "operasi";
  return "bilangan";
}

/** Warna latar panel per topik (pastel, sejalan dengan kartu kelas di beranda). */
export const topicTone: Record<TopicKind, { bg: string; line: string }> = {
  bilangan: { bg: "#d7f0e5", line: "#a9d9c4" }, operasi: { bg: "#fdf1c7", line: "#ecd27a" }, pecahan: { bg: "#fde2dd", line: "#f2b2a6" },
  geometri: { bg: "#d9edf8", line: "#a8cfe9" }, transformasi: { bg: "#e9e4f6", line: "#c3b6e6" }, ruang: { bg: "#e3ecf9", line: "#b3c6ea" }, ukur: { bg: "#fde8cf", line: "#f0c08a" },
  data: { bg: "#e6f2d8", line: "#bddb9f" }, pola: { bg: "#f6e6f0", line: "#e0b6cf" }, aljabar: { bg: "#dcefe9", line: "#a3d3c5" },
  rasio: { bg: "#fbefd9", line: "#e7cc93" }, peluang: { bg: "#f1eadf", line: "#d6c5a7" },
};

const delay = (s: number) => ({ animationDelay: `${s}s` }) as CSSProperties;

function Art({ kind }: { kind: TopicKind }) {
  switch (kind) {
    case "bilangan": return <g>{/* blok nilai tempat: satu ratusan, tiga puluhan, empat satuan */}
      <g transform="translate(18 18)"><rect width="50" height="50" fill={paper} stroke={ink} strokeWidth="2" />
        {[10, 20, 30, 40].map(v => <g key={v}><line x1={v} x2={v} y1="0" y2="50" stroke={ink} strokeWidth=".8" /><line y1={v} y2={v} x1="0" x2="50" stroke={ink} strokeWidth=".8" /></g>)}</g>
      {[0, 1, 2].map(k => <g key={k} transform={`translate(${80 + k * 14} 18)`}><g className="bsk-bob" style={delay(k * .3)}><rect width="10" height="50" fill={green} stroke={ink} strokeWidth="1.6" />{[10, 20, 30, 40].map(v => <line key={v} x1="0" x2="10" y1={v} y2={v} stroke={ink} strokeWidth=".8" />)}</g></g>)}
      {[0, 1, 2, 3].map(k => <rect key={k} className="bsk-bob" style={delay(.9 + k * .2)} x={124 + (k % 2) * 13} y={42 + Math.floor(k / 2) * 13} width="10" height="10" fill={orange} stroke={ink} strokeWidth="1.5" />)}
      <text x="80" y="90" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink}>134</text></g>;
    case "operasi": return <g>{/* ikatan bilangan 8 = 5 + 3 */}
      <path d="M80 34L48 66M80 34l32 32" {...line} className="bsk-dash-flow" />
      <circle cx="80" cy="28" r="16" fill={paper} stroke={ink} strokeWidth="2" /><text x="80" y="33" textAnchor="middle" fontSize="15" fontWeight="800" fill={ink}>8</text>
      <circle cx="46" cy="70" r="14" fill={green} stroke={ink} strokeWidth="2" className="bsk-bob" /><text x="46" y="75" textAnchor="middle" fontSize="13" fontWeight="800" fill={paper}>5</text>
      <circle cx="114" cy="70" r="14" fill={orange} stroke={ink} strokeWidth="2" className="bsk-bob" style={delay(.5)} /><text x="114" y="75" textAnchor="middle" fontSize="13" fontWeight="800" fill={paper}>3</text>
      <text x="80" y="76" textAnchor="middle" fontSize="16" fontWeight="800" fill={ink}>+</text></g>;
    case "pecahan": return <g>{/* pita pecahan: 1, 1/2, 1/4 */}
      {[1, 2, 4].map((n, r) => <g key={n} transform={`translate(22 ${14 + r * 24})`}>
        {Array.from({ length: n }, (_, k) => <rect key={k} x={(k * 116) / n} width={116 / n} height="18" fill={r === 0 ? paper : k === 0 ? (r === 1 ? green : orange) : paper} stroke={ink} strokeWidth="1.8" className={r && k === 0 ? "bsk-bob" : undefined} style={delay(r * .4)} />)}
        <text x={(116 / n) / 2} y="13" textAnchor="middle" fontSize="10" fontWeight="800" fill={r === 0 ? ink : paper}>{r === 0 ? "1" : `1/${n}`}</text></g>)}
      <text x="80" y="94" textAnchor="middle" fontSize="10" fontWeight="700" fill={ink}>½ = 2/4</text></g>;
    case "geometri": return <g>{/* bangun datar dengan segitiga yang berputar pelan */}
      <rect x="20" y="40" width="38" height="38" rx="2" fill={sky} fillOpacity=".55" stroke={ink} strokeWidth="2" />
      <circle cx="128" cy="58" r="20" fill={paper} stroke={ink} strokeWidth="2" /><line x1="128" y1="58" x2="148" y2="58" stroke={ink} strokeWidth="1.4" strokeDasharray="3 3" />
      <g className="bsk-spin-slow"><path d="M80 18l24 42H56z" fill={orange} fillOpacity=".85" stroke={ink} strokeWidth="2" strokeLinejoin="round" /></g>
      <path d="M20 70h8v8" fill="none" stroke={ink} strokeWidth="1.3" /></g>;
    case "transformasi": return <g>{/* bangun dan bayangannya terhadap garis cermin */}
      <line x1="80" x2="80" y1="8" y2="92" stroke={ink} strokeWidth="1.6" strokeDasharray="5 4" className="bsk-dash-flow" />
      <path d="M30 70l14 -44l22 30z" fill={green} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M130 70l-14 -44l-22 30z" fill={orange} fillOpacity=".8" stroke={ink} strokeWidth="2" strokeLinejoin="round" className="bsk-bob" />
      {[[44, 26, 116], [66, 56, 94]].map(([x, y, x2]) => <line key={x} x1={x} x2={x2} y1={y} y2={y} stroke={ink} strokeWidth="1" strokeDasharray="2 3" opacity=".5" />)}
      <text x="40" y="86" textAnchor="middle" fontSize="10" fontWeight="800" fill={ink}>A</text><text x="120" y="86" textAnchor="middle" fontSize="10" fontWeight="800" fill={ink}>A′</text></g>;
    case "ruang": return <g>{/* kubus dan tabung digambar miring */}
      <path d="M30 40l22 -12l22 12v28l-22 12l-22 -12z" fill={paper} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M30 40l22 12l22 -12M52 52v28" {...line} /><path d="M30 40l22 -12l22 12l-22 12z" fill={green} fillOpacity=".45" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <g className="bsk-bob" style={delay(.4)}><ellipse cx="116" cy="30" rx="18" ry="6" fill={orange} fillOpacity=".7" stroke={ink} strokeWidth="2" />
        <path d="M98 30v42M134 30v42" {...line} /><path d="M98 72a18 6 0 0 0 36 0" {...line} /><path d="M98 72a18 6 0 0 1 36 0" fill="none" stroke={ink} strokeWidth="1.2" strokeDasharray="3 3" /></g></g>;
    case "ukur": return <g>{/* penggaris mengukur pensil */}
      <rect x="14" y="56" width="132" height="22" rx="2" fill="#f7d774" stroke={ink} strokeWidth="2" />
      {Array.from({ length: 13 }, (_, k) => <line key={k} x1={20 + k * 10} x2={20 + k * 10} y1="56" y2={k % 5 === 0 ? 68 : 63} stroke={ink} strokeWidth="1.2" />)}
      {[0, 5, 10].map(v => <text key={v} x={20 + v * 10} y="75" textAnchor="middle" fontSize="7" fontWeight="700" fill={ink}>{v}</text>)}
      <g className="bsk-bob"><path d="M20 38h82l14 6l-14 6H20z" fill={orange} stroke={ink} strokeWidth="2" strokeLinejoin="round" /><path d="M102 38v12" {...line} /><path d="M112 44h4" stroke={ink} strokeWidth="3" strokeLinecap="round" /></g>
      <path d="M20 32v-6M116 32v-6M20 29h96" fill="none" stroke={green} strokeWidth="1.6" className="bsk-dash-flow" /></g>;
    case "data": return <g>{/* diagram batang dan turus */}
      <path d="M18 82h122M22 82V14" {...line} />
      {[34, 52, 26, 60].map((h, k) => <rect key={k} x={32 + k * 22} y={82 - h} width="14" height={h} fill={k === 3 ? orange : green} stroke={ink} strokeWidth="1.6" className="bsk-bob" style={delay(k * .3)} />)}
      <g stroke={ink} strokeWidth="1.8" strokeLinecap="round">{[0, 1, 2, 3].map(k => <line key={k} x1={126 + k * 5} x2={126 + k * 5} y1="16" y2="34" />)}<line x1="122" y1="31" x2="146" y2="19" stroke={orange} /></g></g>;
    case "pola": return <g>{/* pola berulang dengan bagian yang hilang */}
      {["c", "s", "t", "c", "s"].map((s, k) => { const x = 14 + k * 24, y = 44;
        return <g key={k} className="bsk-bob" style={delay(k * .25)}>{s === "c" ? <circle cx={x + 10} cy={y + 10} r="10" fill={green} stroke={ink} strokeWidth="1.8" /> : s === "s" ? <rect x={x} y={y} width="20" height="20" rx="2" fill={orange} stroke={ink} strokeWidth="1.8" /> : <path d={`M${x + 10} ${y}l11 20H${x - 1}z`} fill={sky} stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />}</g>; })}
      <rect x="136" y="42" width="22" height="24" rx="3" fill={paper} stroke={ink} strokeWidth="1.8" strokeDasharray="4 3" /><text x="147" y="59" textAnchor="middle" fontSize="14" fontWeight="800" fill={ink}>?</text></g>;
    case "aljabar": return <g>{/* ubin aljabar: 2x + 3 = 7 */}
      {[0, 1].map(k => <g key={k} className="bsk-bob" style={delay(k * .3)}><rect x={16 + k * 18} y="30" width="14" height="36" rx="2" fill={green} stroke={ink} strokeWidth="1.8" /><text x={23 + k * 18} y="52" textAnchor="middle" fontSize="10" fontWeight="800" fill={paper}>x</text></g>)}
      {[0, 1, 2].map(k => <rect key={k} x={54 + k * 13} y="52" width="10" height="10" fill={orange} stroke={ink} strokeWidth="1.5" />)}
      <text x="102" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>=</text>
      {Array.from({ length: 7 }, (_, k) => <rect key={k} x={114 + (k % 3) * 13} y={30 + Math.floor(k / 3) * 13} width="10" height="10" fill={orange} stroke={ink} strokeWidth="1.5" />)}
      <text x="80" y="90" textAnchor="middle" fontSize="11" fontWeight="800" fill={ink}>2x + 3 = 7</text></g>;
    case "rasio": return <g>{/* model pita perbandingan 2 : 3 */}
      {[2, 3].map((n, r) => <g key={n} transform={`translate(24 ${22 + r * 30})`}>{Array.from({ length: n }, (_, k) => <rect key={k} x={k * 24} width="24" height="20" fill={r ? orange : green} stroke={ink} strokeWidth="1.8" className="bsk-bob" style={delay(k * .2 + r * .5)} />)}
        <text x="-8" y="14" textAnchor="end" fontSize="10" fontWeight="800" fill={ink}>{r ? "B" : "A"}</text></g>)}
      <text x="128" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>2 : 3</text></g>;
    case "peluang": return <g>{/* dadu dan roda putar */}
      <g className="bsk-bob"><rect x="22" y="30" width="40" height="40" rx="7" fill={paper} stroke={ink} strokeWidth="2" />
        {[[32, 40], [52, 40], [42, 50], [32, 60], [52, 60]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill={ink} />)}</g>
      <circle cx="116" cy="50" r="28" fill={paper} stroke={ink} strokeWidth="2" />
      {[0, 1, 2, 3].map(k => { const a = (k * Math.PI) / 2, b = a + Math.PI / 2; return <path key={k} d={`M116 50L${116 + 28 * Math.sin(a)} ${50 - 28 * Math.cos(a)}A28 28 0 0 1 ${116 + 28 * Math.sin(b)} ${50 - 28 * Math.cos(b)}Z`} fill={[green, orange, sky, "#f7d774"][k]} stroke={ink} strokeWidth="1.4" />; })}
      <g className="bsk-spin-slow" style={{ transformOrigin: "116px 50px", transformBox: "view-box", animationDuration: "9s" }}><path d="M116 50l4 -22l-8 0z" fill={ink} /></g><circle cx="116" cy="50" r="4" fill={ink} /></g>;
  }
}

export function TopicArt({ kind, className = "" }: { kind: TopicKind; className?: string }) {
  return <svg viewBox="0 0 160 100" aria-hidden="true" className={className}><Art kind={kind} /></svg>;
}
