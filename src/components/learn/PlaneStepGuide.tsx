"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";

/* Penjelasan langkah demi langkah untuk Kelas 3 Bab 4 Unsur-Unsur Bangun Datar.
   Setiap langkah: satu gagasan, satu gambar besar, dan kalimat pendek yang runtut. */

const ink = "#17352a", red = "#e11d48", blue = "#2563eb", green = "#16a34a";
const Dot = ({ x, y, name, dx = 0, dy = -12, c = ink }: { x: number; y: number; name: string; dx?: number; dy?: number; c?: string }) =>
  <g><circle cx={x} cy={y} r="5" fill={c} /><text x={x + dx} y={y + dy} textAnchor="middle" fontSize="18" fontWeight="800" fill={c}>{name}</text></g>;
/** Mata panah di ujung (x, y) yang menunjuk ke arah (ux, uy). */
const Head = ({ x, y, ux, uy, c }: { x: number; y: number; ux: number; uy: number; c: string }) => { const px = -uy, py = ux; return <path d={`M${x} ${y} L${x - 14 * ux + 7 * px} ${y - 14 * uy + 7 * py} L${x - 14 * ux - 7 * px} ${y - 14 * uy - 7 * py} Z`} fill={c} />; };
const Frame = ({ children, label, h = 150 }: { children: ReactNode; label: string; h?: number }) =>
  <svg role="img" aria-label={label} viewBox={`0 0 320 ${h}`} className="mx-auto h-auto w-full max-w-md rounded-xl bg-white">{children}</svg>;

/** Garis, sinar garis, atau ruas garis dari A ke B yang bisa "diperpanjang". */
function LineKind({ kind, grow }: { kind: "garis" | "sinar" | "ruas"; grow: number }) {
  const ax = 110, bx = 210, y = 80, c = kind === "garis" ? red : kind === "sinar" ? blue : green;
  const left = kind === "garis" ? ax - 30 - grow * 30 : ax, right = kind === "ruas" ? bx : bx + 30 + grow * 30;
  return <Frame label={`${kind} AB${grow ? ", diperpanjang" : ""}`}>
    <line x1={left} y1={y} x2={right} y2={y} stroke={c} strokeWidth="5" strokeLinecap="round" />
    {kind === "garis" && <Head x={left - 2} y={y} ux={-1} uy={0} c={c} />}
    {kind !== "ruas" && <Head x={right + 2} y={y} ux={1} uy={0} c={c} />}
    <Dot x={ax} y={y} name="A" /><Dot x={bx} y={y} name="B" />
    {kind === "sinar" && <text x={ax} y={y + 30} textAnchor="middle" fontSize="13" fill={ink}>titik pangkal</text>}
    {kind === "ruas" && <><text x={ax} y={y + 30} textAnchor="middle" fontSize="13" fill={ink}>ujung</text><text x={bx} y={y + 30} textAnchor="middle" fontSize="13" fill={ink}>ujung</text></>}
  </Frame>;
}
function Compare() {
  const row = (y: number, kind: "garis" | "sinar" | "ruas", c: string, name: string, note: string) => <g key={kind}>
    <text x="8" y={y + 5} fontSize="15" fontWeight="800" fill={c}>{name}</text>
    <line x1={kind === "garis" ? 112 : 120} y1={y} x2={kind === "ruas" ? 210 : 232} y2={y} stroke={c} strokeWidth="4" strokeLinecap="round" />
    {kind === "garis" && <Head x={110} y={y} ux={-1} uy={0} c={c} />}{kind !== "ruas" && <Head x={234} y={y} ux={1} uy={0} c={c} />}
    <circle cx={kind === "garis" ? 140 : 120} cy={y} r="4" fill={ink} /><circle cx={kind === "ruas" ? 210 : 200} cy={y} r="4" fill={ink} />
    <text x="246" y={y + 5} fontSize="12" fill={ink}>{note}</text></g>;
  return <Frame label="Perbandingan garis, sinar garis, dan ruas garis" h={160}>
    {row(30, "garis", red, "Garis", "2 arah")}
    {row(80, "sinar", blue, "Sinar garis", "1 arah")}
    {row(130, "ruas", green, "Ruas garis", "tetap")}
  </Frame>;
}
function Ruler() {
  return <Frame label="Mengukur ruas garis AB dengan penggaris: 6 cm" h={150}>
    <line x1="40" y1="45" x2="220" y2="45" stroke={green} strokeWidth="5" strokeLinecap="round" />
    <Dot x={40} y={45} name="A" dy={-12} /><Dot x={220} y={45} name="B" dy={-12} />
    <rect x="20" y="62" width="290" height="48" rx="4" fill="#fde68a" stroke={ink} />
    {Array.from({ length: 81 }, (_, i) => { const x = 40 + i * 3; return x <= 300 ? <line key={i} x1={x} y1="62" x2={x} y2={i % 10 === 0 ? 80 : i % 5 === 0 ? 74 : 70} stroke={ink} strokeWidth={i % 10 === 0 ? 1.4 : 0.8} /> : null; })}
    {Array.from({ length: 9 }, (_, i) => <text key={i} x={40 + i * 30} y="96" textAnchor="middle" fontSize="12" fontWeight={i === 0 || i === 6 ? 800 : 400} fill={i === 0 || i === 6 ? red : ink}>{i}</text>)}
    <path d="M40 112v14M220 112v14" stroke={red} strokeWidth="2" strokeDasharray="3 3" /><text x="130" y="138" textAnchor="middle" fontSize="14" fontWeight="800" fill={red}>AB = 6 cm</text>
  </Frame>;
}
function SidesFig({ show }: { show: number }) {
  const pts: [number, number][] = [[160, 18], [270, 130], [50, 130]], names = ["A", "B", "C"], cols = [red, blue, green];
  return <Frame label="Segitiga ABC dengan 3 sisi" h={150}>
    <path d={`M${pts.map(p => p.join(" ")).join("L")}Z`} fill="#dcfce7" />
    {pts.map((p, i) => { const q = pts[(i + 1) % 3]; return <line key={i} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={i < show ? cols[i] : "#cbd5e1"} strokeWidth="5" strokeLinecap="round" />; })}
    {pts.map((p, i) => <Dot key={i} x={p[0]} y={p[1]} name={names[i]} dy={i === 0 ? -8 : 20} dx={i === 1 ? 12 : i === 2 ? -12 : 0} />)}
  </Frame>;
}
function AngleParts({ mark }: { mark: "rays" | "parts" | "name" }) {
  const o: [number, number] = [70, 120], a: [number, number] = [280, 120], b: [number, number] = [230, 25];
  return <Frame label="Sudut AOB dengan titik sudut O dan kaki sudut OA dan OB" h={150}>
    <line x1={o[0]} y1={o[1]} x2={a[0]} y2={a[1]} stroke={blue} strokeWidth="5" strokeLinecap="round" /><Head x={a[0] + 2} y={a[1]} ux={1} uy={0} c={blue} />
    <line x1={o[0]} y1={o[1]} x2={b[0]} y2={b[1]} stroke={red} strokeWidth="5" strokeLinecap="round" /><Head x={b[0] + 1.7} y={b[1] - 1} ux={0.86} uy={-0.51} c={red} />
    <path d="M110 120 A40 40 0 0 0 104 99" fill="none" stroke={ink} strokeWidth="2.5" />
    <Dot x={o[0]} y={o[1]} name="O" dy={22} /><Dot x={230} y={120} name="A" dy={22} /><Dot x={196} y={45} name="B" dx={-12} />
    {mark !== "rays" && <><text x="140" y="146" fontSize="13" fill={blue}>kaki sudut</text><text x="96" y="60" fontSize="13" fill={red} transform="rotate(-31 96 60)">kaki sudut</text><text x="20" y="104" fontSize="13" fontWeight="700" fill={ink}>titik sudut</text></>}
    {mark === "name" && <text x="300" y="70" textAnchor="end" fontSize="20" fontWeight="800" fill={ink}>∠AOB</text>}
  </Frame>;
}
function ProtractorSteps({ step }: { step: number }) {
  const cx = 160, cy = 130, R = 110, deg = 50, r = (deg * Math.PI) / 180;
  return <Frame label="Mengukur sudut dengan busur derajat" h={150}>
    <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z`} fill="#e0f2fe" stroke={ink} strokeWidth="1.5" />
    {Array.from({ length: 19 }, (_, i) => { const t = (i * 10 * Math.PI) / 180; return <g key={i}><line x1={cx + R * Math.cos(t)} y1={cy - R * Math.sin(t)} x2={cx + (R - 10) * Math.cos(t)} y2={cy - (R - 10) * Math.sin(t)} stroke={ink} />{i % 3 === 0 && <text x={cx + (R - 22) * Math.cos(t)} y={cy - (R - 22) * Math.sin(t) + 4} textAnchor="middle" fontSize="10" fill={ink}>{i * 10}</text>}</g>; })}
    {step >= 1 && <circle cx={cx} cy={cy} r="6" fill={red} />}
    {step >= 2 && <line x1={cx} y1={cy} x2={cx + R + 10} y2={cy} stroke={blue} strokeWidth="4" />}
    {step >= 3 && <><line x1={cx} y1={cy} x2={cx + (R + 10) * Math.cos(r)} y2={cy - (R + 10) * Math.sin(r)} stroke={red} strokeWidth="4" /><text x={cx + 60} y={cy - 18} fontSize="16" fontWeight="800" fill={red}>50°</text></>}
  </Frame>;
}
function AngleKinds() {
  const fig = (x: number, d: number, name: string) => { const r = (d * Math.PI) / 180; return <g key={name}><line x1={x} y1="100" x2={x + 60} y2="100" stroke={blue} strokeWidth="3.5" strokeLinecap="round" /><line x1={x} y1="100" x2={x + 60 * Math.cos(r)} y2={100 - 60 * Math.sin(r)} stroke={red} strokeWidth="3.5" strokeLinecap="round" />
    {d === 90 ? <path d={`M${x + 12} 100 V88 H${x}`} fill="none" stroke={ink} strokeWidth="1.6" /> : <path d={`M${x + 16} 100 A16 16 0 0 0 ${x + 16 * Math.cos(r)} ${100 - 16 * Math.sin(r)}`} fill="none" stroke={ink} strokeWidth="1.6" />}
    <circle cx={x} cy="100" r="3.5" fill={ink} /><text x={x + 18} y="128" textAnchor="middle" fontSize="12" fontWeight="800" fill={ink}>{name}</text><text x={x + 18} y="143" textAnchor="middle" fontSize="11" fill={ink}>{d}°</text></g>; };
  return <Frame label="Sudut lancip, siku-siku, tumpul, dan lurus" h={150}>{fig(18, 45, "Lancip")}{fig(98, 90, "Siku-siku")}{fig(190, 130, "Tumpul")}{fig(262, 180, "Lurus")}</Frame>;
}
function Reflex() {
  return <Frame label="Sudut 130 derajat dan sudut refleks 230 derajat" h={150}>
    <line x1="160" y1="85" x2="270" y2="85" stroke={blue} strokeWidth="4" strokeLinecap="round" /><line x1="160" y1="85" x2={160 + 110 * Math.cos(2.27)} y2={85 - 110 * Math.sin(2.27)} stroke={red} strokeWidth="4" strokeLinecap="round" />
    <path d={`M190 85 A30 30 0 0 0 ${160 + 30 * Math.cos(2.27)} ${85 - 30 * Math.sin(2.27)}`} fill="none" stroke={ink} strokeWidth="2" /><text x="175" y="55" fontSize="14" fontWeight="800" fill={ink}>130°</text>
    <path d={`M${160 + 44 * Math.cos(2.27)} ${85 - 44 * Math.sin(2.27)} A44 44 0 1 0 204 85`} fill="none" stroke={green} strokeWidth="3" strokeDasharray="5 4" /><text x="160" y="146" textAnchor="middle" fontSize="14" fontWeight="800" fill={green}>360° − 130° = 230°</text>
  </Frame>;
}
function Lines({ kind }: { kind: "potong" | "tegak" | "sejajar" | "petak" }) {
  const grid = kind === "petak";
  return <Frame label={kind === "tegak" ? "Garis AB tegak lurus garis CD" : kind === "sejajar" || grid ? "Garis AB sejajar garis CD" : "Dua garis berpotongan"} h={150}>
    {grid && Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={20 + i * 25} y1="10" x2={20 + i * 25} y2="140" stroke="#cbd5e1" />)}
    {grid && Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="20" y1={15 + i * 25} x2="295" y2={15 + i * 25} stroke="#cbd5e1" />)}
    {kind === "potong" && <><line x1="40" y1="120" x2="280" y2="40" stroke={red} strokeWidth="4" /><line x1="40" y1="40" x2="280" y2="110" stroke={blue} strokeWidth="4" /><circle cx="158" cy="80" r="5" fill={ink} /><text x="170" y="100" fontSize="13" fill={ink}>titik potong</text></>}
    {kind === "tegak" && <><line x1="40" y1="110" x2="280" y2="110" stroke={red} strokeWidth="4" /><line x1="160" y1="15" x2="160" y2="140" stroke={blue} strokeWidth="4" /><path d="M160 96 H174 V110" fill="none" stroke={ink} strokeWidth="2" /><Dot x={40} y={110} name="A" dy={-10} /><Dot x={280} y={110} name="B" dy={-10} /><Dot x={160} y={15} name="C" dx={14} dy={6} /><Dot x={160} y={140} name="D" dx={14} dy={4} /><text x="240" y="40" fontSize="18" fontWeight="800" fill={ink}>AB ⊥ CD</text></>}
    {(kind === "sejajar" || grid) && <><line x1={grid ? 45 : 40} y1={grid ? 40 : 45} x2={grid ? 270 : 280} y2={grid ? 40 : 45} stroke={red} strokeWidth="4" /><line x1={grid ? 45 : 40} y1={grid ? 115 : 110} x2={grid ? 270 : 280} y2={grid ? 115 : 110} stroke={blue} strokeWidth="4" />
      {grid ? <><path d="M70 42 V113 M245 42 V113" stroke={green} strokeWidth="2.5" strokeDasharray="4 3" /><text x="76" y="82" fontSize="13" fontWeight="800" fill={green}>3 petak</text><text x="180" y="82" fontSize="13" fontWeight="800" fill={green}>3 petak</text></>
        : <><Dot x={40} y={45} name="A" dy={-10} /><Dot x={280} y={45} name="B" dy={-10} /><Dot x={40} y={110} name="C" dy={24} /><Dot x={280} y={110} name="D" dy={24} /><text x="160" y="85" textAnchor="middle" fontSize="18" fontWeight="800" fill={ink}>AB // CD</text></>}</>}
  </Frame>;
}
function Fold({ step }: { step: number }) {
  return <Frame label="Melipat kertas dua kali untuk membuat sudut siku-siku" h={150}>
    {step === 0 ? <rect x="80" y="20" width="160" height="110" fill="#fef3c7" stroke={ink} strokeWidth="2" />
      : step === 1 ? <><rect x="80" y="20" width="160" height="55" fill="#fef3c7" stroke={ink} strokeWidth="2" /><path d="M80 75 H240" stroke={red} strokeWidth="2.5" strokeDasharray="6 4" /><text x="160" y="100" textAnchor="middle" fontSize="13" fill={ink}>lipatan pertama: garis lurus</text></>
      : <><rect x="120" y="20" width="80" height="55" fill="#fde68a" stroke={ink} strokeWidth="2" /><path d="M120 75 H200 M120 20 V75" stroke={red} strokeWidth="2.5" /><path d="M120 61 H134 V75" fill="none" stroke={ink} strokeWidth="2" /><text x="160" y="105" textAnchor="middle" fontSize="13" fill={ink}>lipatan kedua: sudut siku-siku</text></>}
  </Frame>;
}

/* ---------- Langkah-langkah ---------- */
type Step = { title: string; text: string; tip?: string; fig: (s: { grow: number }) => ReactNode; grow?: "garis" | "sinar" | "ruas" };
const guide: Step[][] = [
  [
    { title: "1. Titik", text: "Mulai dari yang paling kecil: titik. Titik hanya menunjukkan sebuah tempat. Titik diberi nama dengan huruf kapital, misalnya titik A dan titik B.", fig: () => <Frame label="Titik A dan titik B" h={110}><Dot x={110} y={60} name="A" /><Dot x={210} y={60} name="B" /></Frame> },
    { title: "2. Garis", text: "Hubungkan titik A dan B, lalu teruskan ke kiri dan ke kanan. Garis tidak punya ujung, bisa diperpanjang ke dua arah tanpa batas. Tanda panah di kedua ujung artinya \"terus berlanjut\". Ditulis: garis AB.", tip: "Ketuk Perpanjang: garis memanjang ke kiri dan ke kanan.", grow: "garis", fig: ({ grow }) => <LineKind kind="garis" grow={grow} /> },
    { title: "3. Sinar garis", text: "Sinar garis punya satu titik pangkal (A), lalu terus berlanjut ke satu arah saja, seperti sinar senter. Hanya ada satu tanda panah. Ditulis: sinar garis AB.", tip: "Ketuk Perpanjang: sinar hanya memanjang ke arah panah.", grow: "sinar", fig: ({ grow }) => <LineKind kind="sinar" grow={grow} /> },
    { title: "4. Ruas garis", text: "Ruas garis adalah potongan garis yang punya dua titik ujung, A dan B. Tidak ada tanda panah, jadi tidak bisa diperpanjang dan panjangnya bisa diukur. Ditulis: ruas garis AB.", tip: "Ketuk Perpanjang: ruas garis tetap, karena kedua ujungnya sudah berhenti.", grow: "ruas", fig: ({ grow }) => <LineKind kind="ruas" grow={grow} /> },
    { title: "5. Bandingkan ketiganya", text: "Lihat tanda panahnya. Dua panah: garis (dua arah). Satu panah: sinar garis (satu arah). Tanpa panah: ruas garis (panjangnya tetap).", fig: () => <Compare /> },
    { title: "6. Mengukur ruas garis", text: "Karena punya dua ujung, ruas garis bisa diukur dengan penggaris. Letakkan angka 0 tepat di titik A, lalu baca angka di titik B. Di sini AB = 6 cm. Ingat 1 cm = 10 mm.", fig: () => <Ruler /> },
    { title: "7. Ruas garis menjadi sisi", text: "Ruas-ruas garis yang membatasi bangun datar disebut sisi. Segitiga ABC dibatasi 3 ruas garis: sisi AB, sisi BC, dan sisi CA.", tip: "Ketuk Perpanjang untuk menebalkan sisi satu per satu.", fig: ({ grow }) => <SidesFig show={Math.min(3, grow + 1)} /> },
    { title: "8. Banyak sisi dan sudut", text: "Pada bangun datar bersisi lurus, banyak sisi sama dengan banyak sudut. Segitiga: 3 sisi, 3 sudut. Segi empat: 4 sisi, 4 sudut. Lingkaran dibatasi garis lengkung, jadi tidak punya sisi lurus dan tidak punya sudut.", fig: () => <SidesFig show={3} /> },
  ],
  [
    { title: "1. Dua sinar dari satu titik", text: "Gambar dua sinar garis yang berangkat dari titik yang sama, O. Celah di antara kedua sinar itu disebut sudut.", fig: () => <AngleParts mark="rays" /> },
    { title: "2. Titik sudut dan kaki sudut", text: "Titik pertemuannya (O) disebut titik sudut. Kedua sinar garisnya (OA dan OB) disebut kaki sudut.", fig: () => <AngleParts mark="parts" /> },
    { title: "3. Menamai sudut", text: "Sudut diberi nama dengan tiga huruf, dan huruf titik sudut selalu di tengah: ∠AOB atau ∠BOA. Bisa juga cukup ∠O.", fig: () => <AngleParts mark="name" /> },
    { title: "4. Siapkan busur derajat", text: "Sudut diukur dengan busur derajat. Satuannya derajat (°). Busur punya angka 0 sampai 180.", fig: () => <ProtractorSteps step={0} /> },
    { title: "5. Letakkan titik pusat", text: "Langkah pertama: letakkan titik pusat busur (titik merah) tepat di titik sudut O.", fig: () => <ProtractorSteps step={1} /> },
    { title: "6. Impitkan satu kaki dengan 0", text: "Langkah kedua: putar busur sampai satu kaki sudut (biru) berimpit dengan garis 0.", fig: () => <ProtractorSteps step={2} /> },
    { title: "7. Baca kaki yang lain", text: "Langkah ketiga: baca angka yang dilewati kaki sudut lainnya (merah). Sudut ini besarnya 50°.", fig: () => <ProtractorSteps step={3} /> },
    { title: "8. Jenis-jenis sudut", text: "Kurang dari 90°: sudut lancip. Tepat 90°: sudut siku-siku (diberi tanda kotak kecil). Antara 90° dan 180°: sudut tumpul. Tepat 180°: sudut lurus.", fig: () => <AngleKinds /> },
    { title: "9. Sudut refleks", text: "Sudut di sisi luar yang lebih dari 180° disebut sudut refleks. Satu putaran penuh 360°, jadi refleks = 360° dikurangi sudut di dalamnya.", fig: () => <Reflex /> },
  ],
  [
    { title: "1. Dua garis berpotongan", text: "Dua garis yang saling menyilang disebut berpotongan. Tempat keduanya bertemu disebut titik potong.", fig: () => <Lines kind="potong" /> },
    { title: "2. Garis tegak lurus", text: "Jika dua garis berpotongan dan membentuk sudut siku-siku (90°), keduanya tegak lurus. Ditulis AB ⊥ CD.", fig: () => <Lines kind="tegak" /> },
    { title: "3. Garis sejajar", text: "Dua garis yang jaraknya selalu sama dan tidak pernah berpotongan, sejauh apa pun diperpanjang, disebut sejajar. Ditulis AB // CD.", fig: () => <Lines kind="sejajar" /> },
    { title: "4. Cek sejajar di kertas berpetak", text: "Hitung petak di antara kedua garis di ujung kiri dan ujung kanan. Jika sama banyak (di sini 3 petak), garisnya sejajar.", fig: () => <Lines kind="petak" /> },
    { title: "5. Kertas untuk cek siku-siku", text: "Ambil selembar kertas.", fig: () => <Fold step={0} /> },
    { title: "6. Lipat pertama", text: "Lipat kertas sekali. Tepi lipatannya berupa garis lurus.", fig: () => <Fold step={1} /> },
    { title: "7. Lipat kedua", text: "Lipat sekali lagi sehingga tepi lipatan pertama bertemu. Pojoknya membentuk sudut siku-siku. Tempelkan ke dua garis: jika pas, garisnya tegak lurus.", fig: () => <Fold step={2} /> },
  ],
];

export default function PlaneStepGuide({ topic }: { topic: number }) {
  const steps = guide[topic];
  const [i, setI] = useState(0), [grow, setGrow] = useState(0);
  const s = steps[i];
  const go = (k: number) => { setI(k); setGrow(0); };
  const canGrow = !!s.grow || (topic === 0 && i === 6);
  return <div data-testid="step-guide" className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-xl font-extrabold">{s.title}</h3>
      <span className="text-sm font-bold text-base-content/60">Langkah {i + 1} dari {steps.length}</span>
    </div>
    <div className="rounded-xl border border-base-300 bg-base-200/40 p-2">{s.fig({ grow })}</div>
    {canGrow && <div className="flex flex-wrap items-center gap-2">
      <button type="button" className="btn btn-sm btn-outline" disabled={s.grow !== "ruas" && grow >= 3} onClick={() => setGrow(Math.min(3, grow + 1))}>Perpanjang</button>
      {grow > 0 && <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setGrow(0)}><RotateCcw className="size-4" aria-hidden="true" />Ulangi</button>}
      {s.grow === "ruas" && grow > 0 && <span role="status" className="text-sm font-bold text-success">Panjangnya tetap AB.</span>}
    </div>}
    <p className="text-base leading-7">{s.text}</p>
    {s.tip && <p className="text-sm text-base-content/70">{s.tip}</p>}
    <div className="flex items-center justify-between gap-2 pt-1">
      <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={i === 0} onClick={() => go(i - 1)}><ArrowLeft className="size-4" aria-hidden="true" />Kembali</button>
      <div className="flex gap-1.5" role="tablist" aria-label="Langkah">{steps.map((x, k) => <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`Langkah ${k + 1}: ${x.title.replace(/^\d+\.\s*/, "")}`} onClick={() => go(k)} className={`size-3 rounded-full ${k === i ? "bg-success" : "bg-base-300"}`} />)}</div>
      <button type="button" className="btn btn-sm btn-success gap-1" disabled={i === steps.length - 1} onClick={() => go(i + 1)}>Lanjut<ArrowRight className="size-4" aria-hidden="true" /></button>
    </div>
  </div>;
}
