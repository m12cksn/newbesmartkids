import type { ReactNode } from "react";
import { M, plainMath } from "./GradeEightPowersArt";
import type { NetKind, ObjectKind, Scene, SolidKind } from "@/data/grade-nine-solids";

export { M, plainMath };
const ink = "#1f3b30", blue = "#1c64b5", orange = "#c2410c", green = "#2b8a3e", face = "#dbe8f5", face2 = "#c4d8ee", face3 = "#eef4fb";

/* ---------- Proyeksi miring sederhana ---------- */
type P3 = [number, number, number];
const pr = (o: [number, number], s: number) => ([x, y, z]: P3): [number, number] => [o[0] + (x + z * 0.45) * s, o[1] - (y + z * 0.32) * s];
const pts = (f: (p: P3) => [number, number], ps: P3[]) => ps.map(p => f(p).join(",")).join(" ");
const Lbl = ({ x, y, t, c = ink, a = "middle" }: { x: number; y: number; t?: string; c?: string; a?: "start" | "middle" | "end" }) => (t ? <text x={x} y={y} textAnchor={a} fontSize="11" fontWeight="800" fill={c}>{t}</text> : null);
const Svg = ({ label, children, w = 240, h = 200, cls = "w-full max-w-[17rem]" }: { label: string; children: ReactNode; w?: number; h?: number; cls?: string }) => <svg viewBox={`0 0 ${w} ${h}`} className={cls} role="img" aria-label={label}>{children}</svg>;
const dash = { strokeDasharray: "4 3" };

function Box({ L = {}, p = 3, l = 1.6, t = 1.6, s = 34 }: { L?: Record<string, string>; p?: number; l?: number; t?: number; s?: number }) {
  const f = pr([30, 175], s), A: P3 = [0, 0, 0], B: P3 = [p, 0, 0], C: P3 = [p, t, 0], D: P3 = [0, t, 0], E: P3 = [0, 0, l], F: P3 = [p, 0, l], G: P3 = [p, t, l], H: P3 = [0, t, l];
  return <g stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
    <polygon points={pts(f, [D, C, G, H])} fill={face3} /><polygon points={pts(f, [B, F, G, C])} fill={face2} /><polygon points={pts(f, [A, B, C, D])} fill={face} />
    <polyline points={pts(f, [A, E, H])} fill="none" {...dash} strokeWidth="1" /><line x1={f(E)[0]} y1={f(E)[1]} x2={f(F)[0]} y2={f(F)[1]} {...dash} strokeWidth="1" />
    <g stroke="none"><Lbl x={(f(A)[0] + f(B)[0]) / 2} y={f(A)[1] + 15} t={L.p ?? L.s} c={blue} /><Lbl x={(f(B)[0] + f(F)[0]) / 2 + 6} y={(f(B)[1] + f(F)[1]) / 2 + 12} t={L.l} c={green} a="start" /><Lbl x={f(G)[0] + 6} y={(f(F)[1] + f(G)[1]) / 2} t={L.t} c={orange} a="start" /></g>
  </g>;
}

/* ---------- Bangun ruang ---------- */
export function SolidView({ kind, labels = {}, cls }: { kind: SolidKind; labels?: Record<string, string>; cls?: string }) {
  const L = labels, desc = Object.entries(L).map(([k, v]) => `${k} = ${v}`).join(", ");
  const name: Record<SolidKind, string> = { kubus: "Kubus", balok: "Balok", prisma3: "Prisma segitiga", limas4: "Limas segi empat", limas6: "Limas segi enam", tabung: "Tabung", kerucut: "Kerucut", bola: "Bola", setengahbola: "Setengah bola", frustum: "Kerucut terpotong", pipa: "Pipa", kerucutbola: "Gabungan kerucut dan setengah bola", honai: "Rumah Honai: tabung beratap setengah bola", bolakubus: "Bola di dalam kubus", kerucutprisma: "Kerucut di dalam prisma persegi", bolatabung: "Bola di dalam tabung" };
  const label = `${name[kind]}${desc ? `: ${plainMath(desc)}` : ""}`;
  switch (kind) {
    case "kubus": return <Svg label={label} cls={cls}><Box L={L} p={3} l={3} t={3} s={33} /></Svg>;
    case "balok": return <Svg label={label} cls={cls}><Box L={L} /></Svg>;
    case "kerucutprisma": { const f = pr([40, 180], 30);
      return <Svg label={label} cls={cls}><Box L={{ p: L.s, t: L.t }} p={3.4} l={3.4} t={4} s={30} />
        <ellipse cx={(f([0, 0, 0])[0] + f([3.4, 0, 3.4])[0]) / 2 - 10} cy={(f([0, 0, 0])[1] + f([3.4, 0, 3.4])[1]) / 2 + 5} rx="48" ry="17" fill="#f6d9b8" stroke={orange} strokeWidth="1.4" />
        <polygon points={`${(f([0, 0, 0])[0] + f([3.4, 0, 3.4])[0]) / 2 - 58},${(f([0, 0, 0])[1] + f([3.4, 0, 3.4])[1]) / 2 + 5} ${(f([0, 0, 0])[0] + f([3.4, 0, 3.4])[0]) / 2 + 38},${(f([0, 0, 0])[1] + f([3.4, 0, 3.4])[1]) / 2 + 5} ${(f([0, 4, 0])[0] + f([3.4, 4, 3.4])[0]) / 2 - 10},${(f([0, 4, 0])[1] + f([3.4, 4, 3.4])[1]) / 2}`} fill="#f6d9b8" fillOpacity="0.85" stroke={orange} strokeWidth="1.4" /></Svg>; }
    case "prisma3": { const f = pr([30, 170], 30), A: P3 = [0, 0, 0], B: P3 = [3, 0, 0], C: P3 = [0, 2.6, 0], d = 3.2, A2: P3 = [0, 0, d], B2: P3 = [3, 0, d], C2: P3 = [0, 2.6, d];
      return <Svg label={label} cls={cls}><g stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
        <polygon points={pts(f, [C, B, B2, C2])} fill={face2} /><polygon points={pts(f, [A, B, C])} fill={face} />
        <polyline points={pts(f, [A, A2, B2])} fill="none" {...dash} strokeWidth="1" /><line x1={f(A2)[0]} y1={f(A2)[1]} x2={f(C2)[0]} y2={f(C2)[1]} {...dash} strokeWidth="1" />
        <path d={`M${f(A)[0] + 9} ${f(A)[1]}v-9h-9`} fill="none" strokeWidth="1" /></g>
        <Lbl x={f(A)[0] - 6} y={(f(A)[1] + f(C)[1]) / 2} t={L.ta ?? L.a} c={orange} a="end" /><Lbl x={(f(A)[0] + f(B)[0]) / 2} y={f(A)[1] + 15} t={L.ta ? L.a : L.b} c={blue} />
        <Lbl x={(f(B)[0] + f(C)[0]) / 2 + 8} y={(f(B)[1] + f(C)[1]) / 2 - 4} t={L.c} c={green} a="start" /><Lbl x={(f(B)[0] + f(B2)[0]) / 2 + 6} y={(f(B)[1] + f(B2)[1]) / 2 + 14} t={L.t} c={ink} a="start" /></Svg>; }
    case "limas4": { const f = pr([35, 175], 34), A: P3 = [0, 0, 0], B: P3 = [3.4, 0, 0], C: P3 = [3.4, 0, 2.4], D: P3 = [0, 0, 2.4], T: P3 = [1.7, 3.6, 1.2], O: P3 = [1.7, 0, 1.2], Mf: P3 = [1.7, 0, 0];
      return <Svg label={label} cls={cls}><g stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
        <polygon points={pts(f, [B, C, T])} fill={face2} /><polygon points={pts(f, [A, B, T])} fill={face} />
        <polyline points={pts(f, [A, D, C])} fill="none" {...dash} strokeWidth="1" /><line x1={f(D)[0]} y1={f(D)[1]} x2={f(T)[0]} y2={f(T)[1]} {...dash} strokeWidth="1" />
        {L.t && <line x1={f(T)[0]} y1={f(T)[1]} x2={f(O)[0]} y2={f(O)[1]} stroke={orange} {...dash} strokeWidth="1.4" />}
        {L.l && <line x1={f(T)[0]} y1={f(T)[1]} x2={f(Mf)[0]} y2={f(Mf)[1]} stroke={green} {...dash} strokeWidth="1.4" />}</g>
        <Lbl x={(f(A)[0] + f(B)[0]) / 2} y={f(A)[1] + 15} t={L.b} c={blue} /><Lbl x={f(O)[0] + 5} y={(f(T)[1] + f(O)[1]) / 2 + 10} t={L.t} c={orange} a="start" /><Lbl x={(f(T)[0] + f(Mf)[0]) / 2 - 6} y={(f(T)[1] + f(Mf)[1]) / 2 + 6} t={L.l} c={green} a="end" /></Svg>; }
    case "limas6": { const cx = 120, cy = 160, rx = 78, ry = 26, hex = Array.from({ length: 6 }, (_, k) => [cx + rx * Math.cos((k * Math.PI) / 3), cy + ry * Math.sin((k * Math.PI) / 3)]), T = [cx, 30];
      return <Svg label={label} cls={cls}><g stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
        {[[0, 1], [1, 2], [2, 3]].map(([a, b]) => <polygon key={a} points={`${hex[a]} ${hex[b]} ${T}`} fill={a === 1 ? face : face2} />)}
        <polyline points={[hex[3], hex[4], hex[5], hex[0]].join(" ")} fill="none" {...dash} strokeWidth="1" />
        {[4, 5].map(k => <line key={k} x1={hex[k][0]} y1={hex[k][1]} x2={T[0]} y2={T[1]} {...dash} strokeWidth="1" />)}
        {L.t && <line x1={T[0]} y1={T[1]} x2={cx} y2={cy} stroke={orange} {...dash} strokeWidth="1.4" />}
        {L.a && <line x1={cx} y1={cy} x2={(hex[1][0] + hex[2][0]) / 2} y2={(hex[1][1] + hex[2][1]) / 2} stroke={blue} strokeWidth="1.4" />}
        {L.l && <line x1={T[0]} y1={T[1]} x2={(hex[1][0] + hex[2][0]) / 2} y2={(hex[1][1] + hex[2][1]) / 2} stroke={green} {...dash} strokeWidth="1.4" />}</g>
        <Lbl x={(hex[1][0] + hex[2][0]) / 2} y={hex[1][1] + 16} t={L.b} c={ink} /><Lbl x={cx + 6} y={cy - 4} t={L.a} c={blue} a="start" /><Lbl x={cx + 6} y={95} t={L.t} c={orange} a="start" /><Lbl x={cx - 30} y={100} t={L.l} c={green} a="end" /></Svg>; }
    case "tabung": case "pipa": case "honai": case "bolatabung": { const cx = 120, rx = 62, ry = 16, top = kind === "honai" ? 95 : 45, bot = 165;
      return <Svg label={label} cls={cls}><g stroke={ink} strokeWidth="1.6">
        <path d={`M${cx - rx} ${top}V${bot}A${rx} ${ry} 0 0 0 ${cx + rx} ${bot}V${top}`} fill={kind === "honai" ? "#d9b98c" : face} />
        {kind === "honai" ? <path d={`M${cx - rx} ${top}A${rx} ${rx} 0 0 1 ${cx + rx} ${top}A${rx} ${ry} 0 0 1 ${cx - rx} ${top}`} fill="#a7895a" />
          : <ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={face3} />}
        {kind === "honai" && <><path d={`M${cx - 12} ${bot + 15}v-34h24v34`} fill="#6b4f2e" /><path d={`M${cx - rx} ${top}A${rx} ${ry} 0 0 0 ${cx + rx} ${top}`} fill="none" strokeWidth="1" {...dash} />{Array.from({ length: 5 }, (_, k) => <path key={k} d={`M${cx - rx + 8 + k * 6} ${top - 10 - k * 9}Q${cx} ${top - 30 - k * 9} ${cx + rx - 8 - k * 6} ${top - 10 - k * 9}`} fill="none" stroke="#7a6034" strokeWidth="0.8" />)}</>}
        <path d={`M${cx - rx} ${bot}A${rx} ${ry} 0 0 1 ${cx + rx} ${bot}`} fill="none" strokeWidth="1" {...dash} />
        {kind === "pipa" && <ellipse cx={cx} cy={top} rx={rx * 0.72} ry={ry * 0.72} fill="#ffffff" />}
        {kind === "bolatabung" && <><circle cx={cx} cy={(top + bot) / 2} r={rx} fill="#f6d9b8" fillOpacity="0.8" stroke={orange} /><ellipse cx={cx} cy={(top + bot) / 2} rx={rx} ry={ry} fill="none" stroke={orange} strokeWidth="1" {...dash} /></>}
        {(L.r || L.d) && kind !== "honai" && <line x1={cx} y1={top} x2={cx + (L.d ? rx : kind === "pipa" ? rx * 0.72 : rx)} y2={top} stroke={orange} strokeWidth="1.6" />}
        {kind === "pipa" && <line x1={cx} y1={top} x2={cx - rx} y2={top} stroke={blue} strokeWidth="1.6" />}</g>
        <Lbl x={cx + rx * 0.4} y={top - 5} t={L.d ?? L.r} c={orange} /><Lbl x={cx - rx * 0.5} y={top - 5} t={kind === "pipa" ? L.R : undefined} c={blue} />
        <Lbl x={cx + rx + 6} y={(top + bot) / 2 + 4} t={L.t} c={green} a="start" />{kind === "honai" && L.r && <Lbl x={cx + rx * 0.72 + 4} y={top - rx * 0.72} t={`r = ${L.r}`} c={orange} a="start" />}</Svg>; }
    case "kerucut": case "kerucutbola": { const cx = 120, rx = 60, ry = 15, base = kind === "kerucutbola" ? 70 : 160, apex = kind === "kerucutbola" ? 190 : 32;
      return <Svg label={label} cls={cls}><g stroke={ink} strokeWidth="1.6">
        {kind === "kerucutbola" && <path d={`M${cx - rx} ${base}A${rx} ${rx} 0 0 1 ${cx + rx} ${base}`} fill="#f2c2c8" />}
        <path d={`M${cx - rx} ${base}L${cx} ${apex}L${cx + rx} ${base}${kind === "kerucutbola" ? `A${rx} ${ry} 0 0 0 ${cx - rx} ${base}` : `A${rx} ${ry} 0 0 1 ${cx - rx} ${base}`}`} fill={kind === "kerucutbola" ? "#e7c08a" : face} />
        <ellipse cx={cx} cy={base} rx={rx} ry={ry} fill={kind === "kerucutbola" ? "#f2c2c8" : "none"} strokeWidth="1" {...(kind === "kerucut" ? dash : {})} />
        {L.t && <line x1={cx} y1={apex} x2={cx} y2={base} stroke={orange} strokeWidth="1.4" {...dash} />}
        {(L.r) && <line x1={cx} y1={base} x2={cx + rx} y2={base} stroke={blue} strokeWidth="1.6" />}</g>
        <Lbl x={cx + rx / 2} y={base + (kind === "kerucutbola" ? -6 : 14)} t={L.r} c={blue} /><Lbl x={cx - 6} y={(apex + base) / 2} t={L.t} c={orange} a="end" />
        <Lbl x={cx + rx / 2 + 12} y={(apex + base) / 2} t={L.s} c={green} a="start" /></Svg>; }
    case "bola": case "bolakubus": return <Svg label={label} cls={cls}>
      {kind === "bolakubus" && <Box L={{ s: L.s }} p={3.6} l={3.6} t={3.6} s={30} />}
      <circle cx={kind === "bolakubus" ? 112 : 120} cy={kind === "bolakubus" ? 110 : 100} r={kind === "bolakubus" ? 52 : 72} fill="#f6d9b8" fillOpacity={kind === "bolakubus" ? 0.85 : 1} stroke={orange} strokeWidth="1.6" />
      <ellipse cx={kind === "bolakubus" ? 112 : 120} cy={kind === "bolakubus" ? 110 : 100} rx={kind === "bolakubus" ? 52 : 72} ry="16" fill="none" stroke={orange} strokeWidth="1" {...dash} />
      {kind === "bola" && <><line x1="120" y1="100" x2="192" y2="100" stroke={blue} strokeWidth="1.6" /><circle cx="120" cy="100" r="2.5" fill={ink} /><Lbl x={156} y={94} t={L.r} c={blue} /></>}</Svg>;
    case "setengahbola": return <Svg label={label} cls={cls}><path d="M48 150A72 72 0 0 1 192 150A72 18 0 0 1 48 150" fill="#f6d9b8" stroke={orange} strokeWidth="1.6" />
      <ellipse cx="120" cy="150" rx="72" ry="18" fill="#f3e6d6" stroke={orange} strokeWidth="1.2" /><line x1="120" y1="150" x2="192" y2="150" stroke={blue} strokeWidth="1.6" /><Lbl x={156} y={146} t={L.r} c={blue} /></Svg>;
    case "frustum": return <Svg label={label} cls={cls}><path d="M60 50L85 160A35 10 0 0 0 155 160L180 50" fill={face} stroke={ink} strokeWidth="1.6" /><ellipse cx="120" cy="50" rx="60" ry="15" fill={face3} stroke={ink} strokeWidth="1.6" /></Svg>;
  }
}

/* ---------- Benda sehari-hari ---------- */
export function ObjectView({ kind, cls = "w-full max-w-[9rem]" }: { kind: ObjectKind; cls?: string }) {
  const lbl: Record<ObjectKind, string> = { kaleng: "Kaleng susu", bola: "Bola basket", kardus: "Kardus", dadu: "Dadu", tenda: "Tenda", topi: "Topi ulang tahun", piramida: "Piramida", ember: "Ember" };
  const body: Record<ObjectKind, ReactNode> = {
    kaleng: <g stroke="#555" strokeWidth="1.5"><path d="M30 30V105A30 9 0 0 0 90 105V30" fill="#cfd6dc" /><rect x="30" y="50" width="60" height="38" fill="#f1f6ff" /><path d="M30 50h60M30 88h60" /><ellipse cx="60" cy="30" rx="30" ry="9" fill="#e7ecf0" /><ellipse cx="60" cy="30" rx="24" ry="6.5" fill="none" strokeWidth="1" /><text x="60" y="74" textAnchor="middle" fontSize="11" fontWeight="800" fill={blue} stroke="none">SUSU</text></g>,
    bola: <g><circle cx="60" cy="65" r="45" fill="#e3742b" stroke="#7a3a10" strokeWidth="1.5" /><path d="M15 65h90M60 20v90M28 33Q48 65 28 97M92 33Q72 65 92 97" fill="none" stroke="#3b1d08" strokeWidth="1.6" /></g>,
    kardus: <g stroke="#7a5a32" strokeWidth="1.5" strokeLinejoin="round"><polygon points="20,50 80,50 80,110 20,110" fill="#c99a5b" /><polygon points="80,50 100,35 100,95 80,110" fill="#b4864a" /><polygon points="20,50 40,35 100,35 80,50" fill="#dcb57e" /><path d="M50 50L70 35" stroke="#e9d8a8" strokeWidth="5" /><path d="M50 50v60" stroke="#e9d8a8" strokeWidth="5" /><text x="50" y="92" textAnchor="middle" fontSize="8" fill="#5b3f1c" stroke="none">↑↑</text></g>,
    dadu: <g stroke="#333" strokeWidth="1.5" strokeLinejoin="round"><polygon points="22,48 78,48 78,104 22,104" fill="#ffffff" /><polygon points="78,48 98,32 98,88 78,104" fill="#e9ecef" /><polygon points="22,48 42,32 98,32 78,48" fill="#f8f9fa" />
      {[[35, 61], [50, 76], [65, 91]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="4.5" fill="#d6336c" stroke="none" />)}{[[88, 52], [88, 80]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="3.5" fill="#222" stroke="none" />)}<ellipse cx="60" cy="40" rx="5" ry="2.5" fill="#222" stroke="none" /></g>,
    tenda: <g stroke="#2f4f3a" strokeWidth="1.5" strokeLinejoin="round"><polygon points="15,105 50,40 70,105" fill="#3f8f5a" /><polygon points="50,40 95,30 110,95 70,105" fill="#2f7a4a" /><path d="M42 105L50 70L58 105" fill="#1f3b2a" /><path d="M50 40L46 28M95 30L99 20" /><path d="M5 108h110" stroke="#7a6a4a" strokeWidth="2" /></g>,
    topi: <g strokeLinejoin="round"><path d="M60 15L28 105A32 9 0 0 0 92 105Z" fill="#7048e8" stroke="#3b2a8a" strokeWidth="1.5" /><path d="M47 52L70 47M40 72L79 66M33 92L87 85" stroke="#ffd43b" strokeWidth="5" /><circle cx="60" cy="13" r="7" fill="#ff8787" /><path d="M30 106Q60 120 90 106" fill="none" stroke="#3b2a8a" strokeWidth="1" /></g>,
    piramida: <g strokeLinejoin="round"><path d="M5 108h110" stroke="#c9a46a" strokeWidth="4" /><polygon points="12,104 60,22 80,104" fill="#e2c38a" stroke="#8a6a3a" strokeWidth="1.5" /><polygon points="60,22 108,96 80,104" fill="#c9a46a" stroke="#8a6a3a" strokeWidth="1.5" />
      {[40, 58, 76, 94].map(y => <path key={y} d={`M${60 - (y - 22) * 0.585} ${y}H${60 + (y - 22) * 0.244}`} stroke="#a3824c" strokeWidth="0.8" />)}</g>,
    ember: <g stroke="#1c4f8a" strokeWidth="1.5"><path d="M25 40L38 105A22 7 0 0 0 82 105L95 40" fill="#4dabf7" /><ellipse cx="60" cy="40" rx="35" ry="10" fill="#a5d8ff" /><path d="M25 42Q60 -5 95 42" fill="none" stroke="#495057" strokeWidth="2.2" /></g>,
  };
  return <svg viewBox="0 0 120 125" className={cls} role="img" aria-label={lbl[kind]}>{body[kind]}</svg>;
}

/* ---------- Jaring-jaring ---------- */
export function NetView({ kind, cls = "w-full max-w-[13rem]" }: { kind: NetKind; cls?: string }) {
  const sq = (x: number, y: number, s = 28, fill = face) => <rect key={`${x},${y}`} x={x} y={y} width={s} height={s} fill={fill} stroke={ink} strokeWidth="1.4" />;
  const name: Record<NetKind, string> = { kubus: "Jaring-jaring dari enam persegi", balok: "Jaring-jaring dari enam persegi panjang", prisma3: "Jaring-jaring dari dua segitiga dan tiga persegi panjang", limas4: "Jaring-jaring dari satu persegi dan empat segitiga", tabung: "Jaring-jaring dari dua lingkaran dan satu persegi panjang", kerucut: "Jaring-jaring dari satu lingkaran dan satu juring", lingkaransegitiga: "Jaring-jaring dari satu lingkaran dan satu segitiga", juring: "Jaring-jaring berupa satu juring saja" };
  const g: Record<NetKind, ReactNode> = {
    kubus: <g>{[[10, 46], [38, 46], [66, 46], [94, 46], [38, 18], [38, 74]].map(([x, y]) => sq(x, y))}</g>,
    balok: <g>{[[10, 50, 20, 30], [30, 50, 44, 30], [74, 50, 20, 30], [94, 50, 44, 30], [30, 30, 44, 20], [30, 80, 44, 20]].map(([x, y, w, h]) => <rect key={`${x}${y}`} x={x} y={y} width={w} height={h} fill={face} stroke={ink} strokeWidth="1.4" />)}</g>,
    prisma3: <g>{[10, 44, 78].map(x => <rect key={x} x={x} y={40} width="34" height="40" fill={face} stroke={ink} strokeWidth="1.4" />)}<polygon points="44,40 78,40 61,12" fill={face2} stroke={ink} strokeWidth="1.4" /><polygon points="44,80 78,80 61,108" fill={face2} stroke={ink} strokeWidth="1.4" /></g>,
    limas4: <g><rect x="45" y="38" width="36" height="36" fill={face2} stroke={ink} strokeWidth="1.4" />{["45,38 81,38 63,6", "81,38 81,74 113,56", "45,74 81,74 63,106", "45,38 45,74 13,56"].map(p => <polygon key={p} points={p} fill={face} stroke={ink} strokeWidth="1.4" />)}</g>,
    tabung: <g><rect x="12" y="38" width="100" height="40" fill={face} stroke={ink} strokeWidth="1.4" /><circle cx="62" cy="22" r="16" fill={face2} stroke={ink} strokeWidth="1.4" /><circle cx="62" cy="94" r="16" fill={face2} stroke={ink} strokeWidth="1.4" /></g>,
    kerucut: <g><path d="M62 8L18 76A52 52 0 0 0 106 76Z" fill={face} stroke={ink} strokeWidth="1.4" /><circle cx="62" cy="100" r="15" fill={face2} stroke={ink} strokeWidth="1.4" /></g>,
    lingkaransegitiga: <g><polygon points="62,8 22,80 102,80" fill={face} stroke={ink} strokeWidth="1.4" /><circle cx="62" cy="100" r="15" fill={face2} stroke={ink} strokeWidth="1.4" /></g>,
    juring: <g><path d="M62 18L18 86A52 52 0 0 0 106 86Z" fill={face} stroke={ink} strokeWidth="1.4" /></g>,
  };
  return <svg viewBox="0 0 125 120" className={cls} role="img" aria-label={name[kind]}>{g[kind]}</svg>;
}

/* ---------- Lingkaran, busur, juring ---------- */
export function CircleView({ r, theta, mode, inner, cls = "w-full max-w-[15rem]" }: { r: string; theta?: number; mode?: "busur" | "juring" | "keliling"; inner?: string; cls?: string }) {
  const c = 100, R = 78, ri = inner ? 30 : 0, a = ((theta ?? 0) * Math.PI) / 180, P = (rr: number, t: number) => [c + rr * Math.cos(-t), c + rr * Math.sin(-t)];
  const big = (theta ?? 0) > 180 ? 1 : 0, [x1, y1] = P(R, 0), [x2, y2] = P(R, a), [i1x, i1y] = P(ri, 0), [i2x, i2y] = P(ri, a);
  const sector = theta ? (ri ? `M${i1x} ${i1y}L${x1} ${y1}A${R} ${R} 0 ${big} 0 ${x2} ${y2}L${i2x} ${i2y}A${ri} ${ri} 0 ${big} 1 ${i1x} ${i1y}Z` : `M${c} ${c}L${x1} ${y1}A${R} ${R} 0 ${big} 0 ${x2} ${y2}Z`) : "";
  return <svg viewBox="0 0 200 200" className={cls} role="img" aria-label={`Lingkaran berjari-jari ${r}${theta ? `, sudut pusat ${theta}°` : ""}${mode ? `, ${mode} ditandai` : ""}${inner ? `, lingkaran dalam berjari-jari ${inner}` : ""}`}>
    <circle cx={c} cy={c} r={R} fill={!theta && inner ? "#b2dfb8" : "#ffffff"} stroke={ink} strokeWidth={mode === "keliling" ? 3.5 : 1.6} />
    {!theta && inner && <circle cx={c} cy={c} r={ri} fill="#d0ebff" stroke={ink} strokeWidth="1.4" />}
    {theta && mode === "juring" && <path d={sector} fill="#b2dfb8" stroke={green} strokeWidth="1.6" />}
    {theta && <><line x1={c} y1={c} x2={x1} y2={y1} stroke={ink} strokeWidth="1.4" /><line x1={c} y1={c} x2={x2} y2={y2} stroke={ink} strokeWidth="1.4" />
      <path d={`M${c + 18} ${c}A18 18 0 ${big} 0 ${P(18, a)[0]} ${P(18, a)[1]}`} fill="none" stroke={orange} strokeWidth="1.4" /><text x={P(32, a / 2)[0]} y={P(32, a / 2)[1] + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill={orange}>{theta}°</text></>}
    {theta && mode === "busur" && <path d={`M${x1} ${y1}A${R} ${R} 0 ${big} 0 ${x2} ${y2}`} fill="none" stroke={blue} strokeWidth="4.5" />}
    {!theta && <line x1={c} y1={c} x2={c + R * 0.71} y2={c - R * 0.71} stroke={blue} strokeWidth="1.6" />}
    <circle cx={c} cy={c} r="2.5" fill={ink} />
    <text x={theta ? P(R / 2, -0.25)[0] : c + R * 0.42} y={theta ? P(R / 2, -0.25)[1] + 8 : c - R * 0.42 - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill={blue}>{r}</text>
    {inner && <text x={c - 8} y={c - 6} textAnchor="end" fontSize="10" fontWeight="800" fill={ink}>{inner}</text>}
  </svg>;
}

/* ---------- Susunan kubus satuan ---------- */
export function CubesView({ p, l, t, hole, layers = t, cls = "w-full max-w-[17rem]" }: { p: number; l: number; t: number; hole?: [number, number]; layers?: number; cls?: string }) {
  const s = Math.min(26, 150 / (p + l * 0.45 + 0.5), 120 / (t + l * 0.32 + 0.5)), f = pr([16, 182], s), cubes: P3[] = [];
  const hx = hole ? (p - hole[0]) / 2 : -1, hz = hole ? (l - hole[1]) / 2 : -1;
  for (let y = 0; y < Math.min(layers, t); y++) for (let z = l - 1; z >= 0; z--) for (let x = 0; x < p; x++) if (!(hole && x >= hx && x < hx + hole[0] && z >= hz && z < hz + hole[1])) cubes.push([x, y, z]);
  return <svg viewBox="0 0 230 195" className={cls} role="img" aria-label={`Susunan kubus satuan ${p} × ${l} × ${t}${hole ? ` dengan lubang tembus ${hole[0]} × ${hole[1]}` : ""}, ${Math.min(layers, t)} lapisan terisi`}>
    {cubes.map(([x, y, z]) => { const A: P3 = [x, y, z], B: P3 = [x + 1, y, z], C: P3 = [x + 1, y + 1, z], D: P3 = [x, y + 1, z], F: P3 = [x + 1, y, z + 1], G: P3 = [x + 1, y + 1, z + 1], H: P3 = [x, y + 1, z + 1];
      return <g key={`${x},${y},${z}`} stroke="#3b5f86" strokeWidth="0.8" strokeLinejoin="round"><polygon points={pts(f, [D, C, G, H])} fill="#cfe2f6" /><polygon points={pts(f, [B, F, G, C])} fill="#9fc2e8" /><polygon points={pts(f, [A, B, C, D])} fill="#b9d4f1" /></g>; })}
  </svg>;
}

/* ---------- Prisma alas huruf L ---------- */
export function LShapeView({ outer, notch, height, unit }: { outer: number; notch: number; height: number; unit: string }) {
  const s = 110 / outer, f = pr([18, 185], s), o = outer, k = outer - notch, h = height * 0.9;
  const P = (x: number, y: number, z: number): P3 => [x, y, z];
  const face = (ps: P3[], fill: string) => <polygon points={pts(f, ps)} fill={fill} />;
  return <svg viewBox="0 0 230 200" className="w-full max-w-[17rem]" role="img" aria-label={`Akuarium berbentuk prisma beralas huruf L: persegi ${outer} ${unit} × ${outer} ${unit} dipotong ${notch} ${unit} × ${notch} ${unit}, tinggi ${height} ${unit}`}>
    <g stroke={ink} strokeWidth="1.4" strokeLinejoin="round">
      {face([P(k, 0, k), P(k, 0, o), P(k, h, o), P(k, h, k)], "#74c0fc")}
      {face([P(o, 0, 0), P(o, 0, k), P(o, h, k), P(o, h, 0)], "#74c0fc")}
      {face([P(0, 0, 0), P(o, 0, 0), P(o, h, 0), P(0, h, 0)], "#a5d8ff")}
      {face([P(0, h, 0), P(o, h, 0), P(o, h, k), P(k, h, k), P(k, h, o), P(0, h, o)], "#d0ebff")}
    </g>
    <Lbl x={(f(P(0, 0, 0))[0] + f(P(o, 0, 0))[0]) / 2} y={f(P(0, 0, 0))[1] + 15} t={`${outer} ${unit}`} c={blue} />
    <Lbl x={f(P(o, 0, 0))[0] + 6} y={(f(P(o, 0, 0))[1] + f(P(o, h, 0))[1]) / 2 + 4} t={`${height} ${unit}`} c={orange} a="start" />
    <Lbl x={(f(P(k, h, k))[0] + f(P(o, h, k))[0]) / 2} y={f(P(o, h, k))[1] - 5} t={`${notch} ${unit}`} c={green} />
  </svg>;
}

/* ---------- Kolam dengan kedalaman berubah ---------- */
export function PoolView({ length, width, shallow, deep }: { length: number; width: number; shallow: number; deep: number }) {
  return <svg viewBox="0 0 300 150" className="w-full max-w-sm" role="img" aria-label={`Penampang kolam: panjang ${length} m, lebar ${width} m, kedalaman ${idnS(shallow)} m sampai ${idnS(deep)} m`}>
    <path d="M20 30H280V120L20 70Z" fill="#a5d8ff" stroke={ink} strokeWidth="1.6" /><path d="M20 30H280" stroke="#1c7ed6" strokeWidth="3" />
    <Lbl x={150} y={22} t={`${length} m`} c={blue} /><Lbl x={14} y={54} t={`${idnS(shallow)} m`} c={orange} a="end" /><Lbl x={286} y={80} t={`${idnS(deep)} m`} c={orange} a="start" />
    <text x="150" y="140" textAnchor="middle" fontSize="11" fill={ink}>Penampang samping, lebar kolam {width} m</text></svg>;
}
const idnS = (v: number) => String(v).replace(".", ",");

export function SceneView({ scene }: { scene: Scene }) {
  switch (scene.type) {
    case "solid": return <SolidView kind={scene.kind} labels={scene.labels} />;
    case "object": return <ObjectView kind={scene.kind} cls="w-full max-w-[11rem]" />;
    case "net": return <NetView kind={scene.kind} />;
    case "circle": return <CircleView r={scene.r} theta={scene.theta} mode={scene.mode} inner={scene.inner} />;
    case "cubes": return <CubesView p={scene.p} l={scene.l} t={scene.t} hole={scene.hole} />;
    case "lshape": return <LShapeView outer={scene.outer} notch={scene.notch} height={scene.height} unit={scene.unit} />;
    case "pool": return <PoolView length={scene.length} width={scene.width} shallow={scene.shallow} deep={scene.deep} />;
    case "card": return <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-3 text-sm"><p className="mb-1 font-bold">{scene.title}</p><ul className="space-y-0.5">{scene.lines.map(l => <li key={l}><M text={l} /></li>)}</ul></div>;
  }
}
