import type { Question } from "./grade-four-whole-numbers";

/* ====================================================================== */
/* Kelas 2 Bab 4: Posisi Benda dan Pola di Sekitar Kita                    */
/* ====================================================================== */
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export const positions = ["atas", "bawah", "depan", "belakang", "kanan", "kiri"] as const;
export type Pos = (typeof positions)[number];

/* ---------- Adegan: benda dengan kotak posisi (kanvas 400 × 280) ---------- */
export type Art = "jam" | "bingkai" | "meja" | "buku" | "lampu" | "kursi" | "kotak" | "kasur" | "boneka" | "bantal" | "bola" | "mobil" | "kucing"
  | "rumah" | "pohon" | "burung" | "sepeda" | "bangku" | "pot" | "anak";
/** z: bidang kedalaman. Benda pada bidang yang sama dapat di atas/di bawah; z lebih besar berarti lebih depan. */
export type SceneObj = { id: string; name: string; art: Art; x: number; y: number; w: number; h: number; z: number; color?: string; label?: string };
export type SceneName = "kamar" | "halaman" | "rumahAni" | "barisan" | "kursiWarna";

export const scenes: Record<SceneName, { title: string; objs: SceneObj[] }> = {
  kamar: {
    title: "Kamar Lili", objs: [
      { id: "jam", name: "Jam dinding", art: "jam", x: 58, y: 18, w: 40, h: 40, z: 1 },
      { id: "bingkai", name: "Lukisan", art: "bingkai", x: 300, y: 22, w: 54, h: 42, z: 1 },
      { id: "meja", name: "Meja", art: "meja", x: 20, y: 128, w: 112, h: 80, z: 1 },
      { id: "buku", name: "Buku", art: "buku", x: 50, y: 108, w: 36, h: 20, z: 1 },
      { id: "lampu", name: "Lampu belajar", art: "lampu", x: 100, y: 84, w: 28, h: 44, z: 1 },
      { id: "kursi", name: "Kursi", art: "kursi", x: 140, y: 140, w: 46, h: 70, z: 1 },
      { id: "kotak", name: "Kotak mainan", art: "kotak", x: 192, y: 170, w: 42, h: 40, z: 1 },
      { id: "kasur", name: "Tempat tidur", art: "kasur", x: 242, y: 140, w: 150, h: 72, z: 1 },
      { id: "boneka", name: "Boneka beruang", art: "boneka", x: 262, y: 104, w: 40, h: 40, z: 1 },
      { id: "bantal", name: "Bantal", art: "bantal", x: 340, y: 126, w: 44, h: 18, z: 1 },
      { id: "bola", name: "Bola", art: "bola", x: 300, y: 184, w: 26, h: 26, z: 1 },
      { id: "mobil", name: "Mobil-mobilan", art: "mobil", x: 54, y: 186, w: 44, h: 22, z: 1 },
      { id: "kucing", name: "Kucing", art: "kucing", x: 196, y: 196, w: 36, h: 32, z: 2 },
    ],
  },
  halaman: {
    title: "Halaman rumah", objs: [
      { id: "rumah", name: "Rumah", art: "rumah", x: 18, y: 62, w: 176, h: 150, z: 1 },
      { id: "pohon", name: "Pohon", art: "pohon", x: 232, y: 52, w: 120, h: 162, z: 1 },
      { id: "burung1", name: "Burung", art: "burung", x: 256, y: 8, w: 30, h: 26, z: 1 },
      { id: "burung2", name: "Burung", art: "burung", x: 304, y: 14, w: 30, h: 26, z: 1 },
      { id: "sepeda", name: "Sepeda", art: "sepeda", x: 56, y: 196, w: 96, h: 62, z: 2 },
      { id: "bangku", name: "Bangku", art: "bangku", x: 206, y: 214, w: 104, h: 46, z: 2 },
      { id: "bola", name: "Bola", art: "bola", x: 246, y: 238, w: 22, h: 22, z: 2 },
      { id: "kucing", name: "Kucing", art: "kucing", x: 218, y: 186, w: 32, h: 28, z: 2 },
    ],
  },
  rumahAni: {
    title: "Rumah Ani", objs: [
      { id: "rumah", name: "Rumah Ani", art: "rumah", x: 70, y: 20, w: 260, h: 200, z: 1 },
      ...["merah", "kuning", "ungu", "putih", "oranye"].map((c, i) => ({ id: `pot${i + 1}`, name: `Pot ke-${i + 1} dari kiri`, art: "pot" as Art, x: 34 + i * 72, y: 214, w: 44, h: 52, z: 2, color: c })),
    ],
  },
  barisan: {
    title: "Barisan anak", objs: ["Upe", "Kira", "Halim", "Lili", "Malosi"].map((n, i) => ({ id: n.toLowerCase(), name: n, art: "anak" as Art, x: 20 + i * 76, y: 70, w: 60, h: 160, z: 1, label: n, color: ["#3b82c4", "#e0567a", "#2f9e6a", "#8d63c7", "#e8963a"][i] })),
  },
  kursiWarna: {
    title: "Empat kursi", objs: [
      ...["merah", "biru", "kuning", "hijau"].map((c, i) => ({ id: `kursi-${c}`, name: `Kursi ${c}`, art: "kursi" as Art, x: 24 + i * 96, y: 110, w: 70, h: 110, z: 1, color: c, label: c })),
      { id: "kucing", name: "Kucing", art: "kucing", x: 132, y: 186, w: 36, h: 32, z: 1 },
    ],
  },
};

/* ---------- Hubungan posisi (dari sudut pandang pembaca) ---------- */
const overlapX = (a: SceneObj, b: SceneObj) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0;
export function holds(a: SceneObj, b: SceneObj, p: Pos): boolean {
  const cy = (o: SceneObj) => o.y + o.h / 2;
  switch (p) {
    case "atas": return a.z === b.z && overlapX(a, b) && a.y + a.h <= b.y + 8 && cy(a) < cy(b);
    case "bawah": return a.z === b.z && overlapX(a, b) && cy(a) > cy(b) && a.y >= b.y;
    case "depan": return a.z > b.z && overlapX(a, b);
    case "belakang": return a.z < b.z && overlapX(a, b);
    case "kanan": return a.x >= b.x + b.w;
    case "kiri": return a.x + a.w <= b.x;
  }
}
export const objOf = (s: SceneName, id: string) => scenes[s].objs.find(o => o.id === id)!;

/* ---------- Pasangan benda (gambar kecil) ---------- */
export type Mover = "bola" | "kucing";
export type Ref = "meja" | "kotak" | "sepeda" | "kursi";

/* ---------- Pola ---------- */
export type Shape = "circle" | "triangle" | "square" | "pentagon" | "hexagon" | "heart" | "star" | "moon" | "cloud" | "diamond" | "leaf" | "flower" | "butterfly" | "rabbit" | "pose" | "clap";
export const colorHex: Record<string, string> = {
  merah: "#e5484d", biru: "#2f86d6", kuning: "#f5c542", hijau: "#2fa36b", oranye: "#f08a24", ungu: "#8d63c7", pink: "#e8559a", coklat: "#9a6234", putih: "#ffffff",
};
/** Token "bentuk:warna", misalnya "heart:pink", "pose:bungkuk", "clap:2". */
export type Token = string;
export const tokenName = (t: Token) => {
  const [s, c] = t.split(":");
  if (s === "pose") return { atas: "Tangan ke atas", bungkuk: "Membungkuk", jongkok: "Jongkok" }[c] ?? c;
  if (s === "clap") return `Tepuk ${["", "satu", "dua", "tiga", "empat"][Number(c)]} kali`;
  const n: Record<string, string> = { circle: "lingkaran", triangle: "segitiga", square: "segi empat", pentagon: "segi lima", hexagon: "segi enam", heart: "hati", star: "bintang", moon: "bulan sabit", cloud: "awan", diamond: "wajik", leaf: "daun", flower: "bunga", butterfly: "kupu-kupu", rabbit: "kelinci" };
  return `${n[s] ?? s}${c ? ` ${c}` : ""}`;
};
/** Barisan disebut pola jika ada bagian (2–4 benda) yang berulang teratur dan barisan memuat paling sedikit dua ulangan. */
export function periodOf(seq: Token[]): number | null {
  for (let p = 2; p <= Math.min(4, Math.floor(seq.length / 2)); p++) {
    if (seq.every((t, i) => i < p || t === seq[i - p]) && new Set(seq.slice(0, p)).size > 1) return p;
  }
  return null;
}

/* ---------- Bentuk soal ---------- */
export type Fig =
  | { t: "pair"; mover: Mover; ref: Ref; pos: Pos }
  | { t: "scene"; s: SceneName }
  | { t: "row"; items: Token[] }
  | { t: "token"; tk: Token };
export type Item = { name: string; fig: Fig };
export type Part =
  | { kind: "choice"; label: string; options: string[]; figs?: Fig[]; answer: string }
  | { kind: "tap"; label: string; scene: SceneName; answer: string }
  | { kind: "fill"; sentences: string[]; bank: string[]; answer: string[] }
  | { kind: "sort"; label: string; items: Item[]; bins: string[]; answer: number[] }
  | { kind: "check"; label: string; items: Item[]; answer: number[] }
  | { kind: "seq"; label: string; items: (Token | null)[]; palette: Token[]; answer: Token[] }
  | { kind: "create"; label: string; shape: Shape; n: number; colors: string[]; sample: string[] }
  | { kind: "odd"; label: string; items: Token[]; answer: number };

export type PQuestion = Question & { topic: 0 | 1; level?: Level; fig?: Fig; parts: Part[] };
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };

function partAnswer(p: Part): string {
  switch (p.kind) {
    case "choice": case "tap": return p.answer;
    case "fill": case "seq": return p.answer.join(",");
    case "sort": return p.answer.join(",");
    case "check": return [...p.answer].sort((a, b) => a - b).join(",");
    case "create": return p.sample.join(",");
    case "odd": return String(p.answer);
  }
}
export const createValid = (p: Extract<Part, { kind: "create" }>, v: string) => {
  const seq = v.split(",");
  return seq.length === p.n && seq.every(c => p.colors.includes(c)) && periodOf(seq.map(c => `${p.shape}:${c}`)) !== null;
};
function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "create") return createValid(p, v);
  if (p.kind === "check") return v.split(",").filter(Boolean).map(Number).sort((a, b) => a - b).join(",") === partAnswer(p);
  return v === partAnswer(p);
}
function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "choice": case "tap": case "odd": return v !== "";
    case "check": return v.split(",").filter(Boolean).length > 0;
    case "fill": case "seq": case "sort": { const n = p.kind === "fill" ? p.sentences.length : p.kind === "seq" ? p.answer.length : p.items.length; const x = v.split(","); return x.length === n && x.every(y => y !== ""); }
    case "create": { const x = v.split(","); return x.length === p.n && x.every(y => y !== ""); }
  }
}
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = v[i];
    switch (p.kind) {
      case "tap": return scenes[p.scene].objs.find(o => o.id === x)?.name ?? "…";
      case "fill": return x.split(",").map((w, k) => p.sentences[k].replace("…", w || "…")).join(" ");
      case "sort": return x.split(",").map((b, k) => `${p.items[k].name}: ${b === "" ? "…" : p.bins[Number(b)]}`).join("; ");
      case "check": return x ? x.split(",").filter(Boolean).map(n => p.items[Number(n)].name).join(", ") : "tidak ada";
      case "seq": return x.split(",").map(t => (t ? tokenName(t) : "…")).join(", ");
      case "create": return x.split(",").map(c => c || "…").join(", ");
      case "odd": return x === "" ? "…" : `gambar ke-${Number(x) + 1}`;
      default: return x || "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: PQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; fig?: Fig } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(partAnswer).join(SEP), ...extra });
const pair = (mover: Mover, ref: Ref, pos: Pos): Fig => ({ t: "pair", mover, ref, pos });
const rep = (core: Token[], n: number): Token[] => Array.from({ length: n }, (_, i) => core[i % core.length]);
const bank = [...positions];
const row = (name: string, items: Token[]): Item => ({ name, fig: { t: "row", items } });

/* ---------- Materi ---------- */
export const topics = [
  {
    code: "A", title: "Posisi Benda", short: "Posisi benda",
    steps: [
      "Posisi benda ditunjukkan dengan kata atas, bawah, depan, belakang, kanan, dan kiri.",
      "Kupu-kupu di atas bunga berarti bunga di bawah kupu-kupu. Setiap posisi punya pasangan kebalikannya.",
      "Benda yang lebih dekat dengan kita ada di depan. Benda yang tertutup sebagian ada di belakang.",
      "Kanan dan kiri pada gambar mengikuti posisi pembaca, yaitu tangan kanan dan tangan kirimu saat melihat gambar.",
    ],
    demo: "Pilih benda, lalu pindahkan bola ke atas, bawah, depan, belakang, kanan, dan kiri. Baca kalimatnya, lalu baca juga kalimat kebalikannya.",
  },
  {
    code: "B", title: "Pola", short: "Pola",
    steps: [
      "Hal yang berulang dan teratur dinamakan pola.",
      "Ada pola bentuk, pola warna, pola gerakan, dan pola suara.",
      "Cari bagian yang berulang. Contoh: lingkaran, segitiga, lingkaran, segitiga. Bagian yang berulang adalah lingkaran dan segitiga.",
      "Untuk melanjutkan pola, ulangi bagian itu dengan urutan yang sama.",
    ],
    demo: "Ketuk 2 sampai 4 gambar untuk membuat bagian yang berulang. Barisan di bawahnya akan melanjutkan polamu. Coba juga pola gerakan dan pola suara.",
  },
] as const;

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: PQuestion[][] = [
  [
    q(0, "Perhatikan posisi kucing. Pilih kata yang tepat: Kucing duduk di … meja.", [{ kind: "choice", label: "Posisi kucing", options: ["atas", "bawah"], answer: "atas" }],
      "Kucing duduk pada permukaan meja, jadi kucing di atas meja.", { fig: pair("kucing", "meja", "atas") }),
    q(0, "Amati kamar Lili. Di atas tempat tidur, di sebelah kiri bantal ada …. Ketuk bendanya.", [{ kind: "tap", label: "Benda", scene: "kamar", answer: "boneka" }],
      "Di atas tempat tidur ada boneka beruang dan bantal. Yang di sebelah kiri bantal adalah boneka beruang."),
    q(0, "Lengkapi kalimat dengan kata yang tepat. Setiap kata hanya digunakan satu kali.", [{ kind: "fill", sentences: ["Kucing duduk di … bangku.", "Pohon berada di sebelah … rumah.", "Rumah berada di … sepeda."], bank, answer: ["atas", "kanan", "belakang"] }],
      "Kucing duduk pada bangku (atas). Pohon ada di sisi kanan rumah jika dilihat dari posisi kita. Sepeda di depan rumah, jadi rumah di belakang sepeda.", { fig: { t: "scene", s: "halaman" } }),
    q(0, "Bola mula-mula di atas meja. Bola dipindah ke bawah meja, lalu dipindah lagi ke sebelah kiri meja. Di manakah bola sekarang?", [{ kind: "choice", label: "Posisi bola", options: ["P", "Q", "R", "S"], figs: [pair("bola", "meja", "bawah"), pair("bola", "meja", "kiri"), pair("bola", "meja", "atas"), pair("bola", "meja", "kanan")], answer: "Q" }],
      "Ikuti perpindahannya sampai yang terakhir: atas, lalu bawah, lalu kiri meja. Gambar Q menunjukkan bola di sebelah kiri meja."),
  ],
  [
    q(1, "Beri tanda centang pada barisan yang menunjukkan pola.", [{ kind: "check", label: "Barisan", items: [row("a", rep(["circle:hijau", "triangle:oranye"], 8)), row("b", ["square:merah", "star:kuning", "square:merah", "square:merah", "star:kuning", "star:kuning", "square:merah"]), row("c", rep(["moon:ungu", "square:biru", "square:biru"], 6))], answer: [0, 2] }],
      "Barisan a mengulang lingkaran, segitiga. Barisan c mengulang bulan, segi empat, segi empat. Barisan b tidak punya bagian yang berulang teratur."),
    q(1, "Lanjutkan polanya. Pilih gambar berikutnya.", [{ kind: "choice", label: "Gambar berikutnya", options: ["Awan", "Bulan sabit"], figs: [{ t: "token", tk: "cloud:biru" }, { t: "token", tk: "moon:kuning" }], answer: "Awan" }],
      "Bagian yang berulang adalah awan, awan, bulan. Setelah bulan, pola dimulai lagi dengan awan.", { fig: { t: "row", items: rep(["cloud:biru", "cloud:biru", "moon:kuning"], 6) } }),
    q(1, "Warnai kotak yang kosong untuk melanjutkan pola warna.", [{ kind: "seq", label: "Kotak", items: ["square:pink", "square:biru", "square:pink", "square:biru", null, null], palette: ["square:pink", "square:biru", "square:kuning"], answer: ["square:pink", "square:biru"] }],
      "Warnanya berulang pink, biru. Setelah biru datang pink, lalu biru lagi."),
    q(1, "Warnai daun berikut untuk membentuk pola warnamu sendiri. Gunakan paling sedikit dua warna.", [{ kind: "create", label: "Daun", shape: "leaf", n: 8, colors: ["hijau", "kuning", "oranye"], sample: rep(["hijau", "kuning"], 8) }],
      "Banyak jawaban yang benar. Pilih bagian yang berulang, misalnya hijau, kuning, lalu ulangi dengan urutan yang sama sampai daun terakhir."),
  ],
];

/* ---------- Evaluasi: 24 soal ---------- */
export const assessment: PQuestion[] = [
  q(0, "Perhatikan gambar. Pilih kata yang tepat: Kucing berdiri di … sepeda.", [{ kind: "choice", label: "Posisi kucing", options: ["belakang", "depan"], answer: "belakang" }],
    "Sebagian badan kucing tertutup sepeda. Benda yang tertutup ada di belakang, jadi kucing di belakang sepeda.", { level: "Sedang", fig: pair("kucing", "sepeda", "belakang") }),
  q(1, "Beri tanda centang pada barisan yang menunjukkan pola.", [{ kind: "check", label: "Barisan", items: [row("a", ["star:hijau", "diamond:coklat", "star:hijau", "star:hijau", "diamond:coklat", "star:hijau", "diamond:coklat", "star:hijau"]), row("b", rep(["heart:pink", "heart:pink", "triangle:hijau"], 9)), row("c", rep(["pentagon:ungu", "circle:kuning"], 8)), row("d", ["moon:ungu", "square:biru", "square:biru", "moon:ungu", "square:biru", "moon:ungu", "moon:ungu", "square:biru"])], answer: [1, 2] }],
    "Barisan b mengulang hati, hati, segitiga. Barisan c mengulang segi lima, lingkaran. Pada barisan a dan d urutannya berubah-ubah, jadi bukan pola.", { level: "Sedang" }),
  q(0, "Amati kamar Lili. Di bawah tempat tidur ada …. Ketuk bendanya.", [{ kind: "tap", label: "Benda", scene: "kamar", answer: "bola" }],
    "Di kolong tempat tidur ada bola. Mobil-mobilan juga di bawah, tetapi di bawah meja.", { level: "Sedang" }),
  q(1, "Lanjutkan polanya. Pilih gambar berikutnya.", [{ kind: "choice", label: "Gambar berikutnya", options: ["Hati", "Segi enam"], figs: [{ t: "token", tk: "heart:pink" }, { t: "token", tk: "hexagon:kuning" }], answer: "Segi enam" }],
    "Polanya segi enam, hati, segi enam, hati. Setelah hati selalu datang segi enam.", { level: "Sedang", fig: { t: "row", items: rep(["hexagon:kuning", "heart:pink"], 6) } }),
  q(0, "Setelah mengunci pintu, Ani menyembunyikan kunci di bawah pot kedua dari kanan. Ketuk pot tempat kunci disembunyikan.", [{ kind: "tap", label: "Pot", scene: "rumahAni", answer: "pot4" }],
    "Hitung dari kanan: pot paling kanan adalah pot pertama dari kanan, pot di sebelah kirinya adalah pot kedua dari kanan.", { level: "Menantang" }),
  q(1, "Ini pola gerakan. Gerakan apa yang berikutnya?", [{ kind: "choice", label: "Gerakan berikutnya", options: ["Membungkuk", "Jongkok", "Tangan ke atas"], figs: [{ t: "token", tk: "pose:bungkuk" }, { t: "token", tk: "pose:jongkok" }, { t: "token", tk: "pose:atas" }], answer: "Membungkuk" }],
    "Gerakannya tangan ke atas, membungkuk, tangan ke atas, membungkuk, tangan ke atas. Berikutnya membungkuk.", { level: "Sedang", fig: { t: "row", items: rep(["pose:atas", "pose:bungkuk"], 5) } }),
  q(0, "Lengkapi kalimat dengan kata yang tepat. Setiap kata hanya digunakan satu kali.", [{ kind: "fill", sentences: ["Bola ada di … bangku.", "Burung terbang di … pohon.", "Sepeda ada di … rumah."], bank, answer: ["bawah", "atas", "depan"] }],
    "Bola ada di kolong bangku (bawah). Burung terbang lebih tinggi dari pohon (atas). Sepeda lebih dekat dengan kita dan menutupi sebagian rumah (depan).", { level: "Sedang", fig: { t: "scene", s: "halaman" } }),
  q(1, "Lanjutkan pola di bawah ini. Isi kotak yang kosong.", [{ kind: "seq", label: "Kotak", items: ["pentagon:oranye", "pentagon:ungu", "pentagon:oranye", "pentagon:ungu", null, null, null, null], palette: ["pentagon:oranye", "pentagon:ungu", "hexagon:oranye", "circle:ungu"], answer: ["pentagon:oranye", "pentagon:ungu", "pentagon:oranye", "pentagon:ungu"] }],
    "Bentuknya selalu segi lima, warnanya berulang oranye, ungu. Isi: segi lima oranye, segi lima ungu, segi lima oranye, segi lima ungu.", { level: "Menantang" }),
  q(0, "Tuliskan posisi bola terhadap kotak atau meja. Kelompokkan setiap gambar ke kata yang tepat.", [{ kind: "sort", label: "Gambar", items: [{ name: "Gambar 1", fig: pair("bola", "kotak", "atas") }, { name: "Gambar 2", fig: pair("bola", "kotak", "kanan") }, { name: "Gambar 3", fig: pair("bola", "meja", "bawah") }, { name: "Gambar 4", fig: pair("bola", "kotak", "belakang") }, { name: "Gambar 5", fig: pair("bola", "meja", "kiri") }, { name: "Gambar 6", fig: pair("bola", "kotak", "depan") }], bins: bank.map(p => `di ${p}`), answer: [0, 4, 1, 3, 5, 2] }],
    "Perhatikan setiap gambar. Bola tertutup kotak berarti di belakang, bola menutupi kotak berarti di depan. Kanan dan kiri mengikuti tangan kita saat melihat gambar.", { level: "Menantang" }),
  q(1, "Warnai lingkaran yang kosong untuk melanjutkan pola warna.", [{ kind: "seq", label: "Lingkaran", items: ["circle:oranye", "circle:hijau", "circle:oranye", "circle:hijau", "circle:oranye", null], palette: ["circle:oranye", "circle:hijau", "circle:biru"], answer: ["circle:hijau"] }],
    "Warnanya berulang oranye, hijau. Setelah oranye datang hijau.", { level: "Sedang" }),
  q(0, "Perhatikan gambar. Pilih kata yang tepat: Kucing duduk di sebelah … sepeda.", [{ kind: "choice", label: "Posisi kucing", options: ["kiri", "kanan"], answer: "kanan" }],
    "Kanan dan kiri pada gambar mengikuti posisi pembaca. Kucing berada di sisi tangan kananmu, jadi kucing di sebelah kanan sepeda.", { level: "Menantang", fig: pair("kucing", "sepeda", "kanan") }),
  q(1, "Ini pola suara tepuk tangan. Tepukan apa yang berikutnya?", [{ kind: "choice", label: "Tepukan berikutnya", options: ["Tepuk tiga kali", "Tepuk satu kali", "Tepuk dua kali"], figs: [{ t: "token", tk: "clap:3" }, { t: "token", tk: "clap:1" }, { t: "token", tk: "clap:2" }], answer: "Tepuk dua kali" }],
    "Pola suaranya tepuk 1 kali, 2 kali, 3 kali, lalu diulang. Setelah 1 kali datang 2 kali.", { level: "Menantang", fig: { t: "row", items: rep(["clap:1", "clap:2", "clap:3"], 7) } }),
  q(0, "Coba tebak. Apa aku? Aku di atas meja. Aku di bawah jam dinding. Ketuk bendanya.", [{ kind: "tap", label: "Benda", scene: "kamar", answer: "buku" }],
    "Di atas meja ada buku dan lampu belajar. Dari keduanya, yang tepat di bawah jam dinding adalah buku.", { level: "Menantang" }),
  q(1, "Lanjutkan polanya. Pilih gambar berikutnya.", [{ kind: "choice", label: "Gambar berikutnya", options: ["Kupu-kupu", "Kelinci"], figs: [{ t: "token", tk: "butterfly:pink" }, { t: "token", tk: "rabbit:coklat" }], answer: "Kupu-kupu" }],
    "Bagian yang berulang adalah kupu-kupu, kelinci, kelinci. Setelah dua kelinci, pola dimulai lagi dengan kupu-kupu.", { level: "Sedang", fig: { t: "row", items: rep(["butterfly:pink", "rabbit:coklat", "rabbit:coklat"], 6) } }),
  q(0, "Lengkapi kalimat dengan kata yang tepat. Setiap kata hanya digunakan satu kali.", [{ kind: "fill", sentences: ["Mobil-mobilan ada di … meja.", "Boneka ada di … tempat tidur.", "Kucing ada di … kotak mainan.", "Kursi ada di sebelah … meja."], bank, answer: ["bawah", "atas", "depan", "kanan"] }],
    "Mobil-mobilan di kolong meja (bawah). Boneka di atas tempat tidur. Kucing menutupi sebagian kotak (depan). Kursi ada di sisi kanan meja.", { level: "Menantang", fig: { t: "scene", s: "kamar" } }),
  q(1, "Warnai bintang yang kosong untuk melanjutkan pola warna.", [{ kind: "seq", label: "Bintang", items: ["star:biru", "star:pink", "star:oranye", "star:biru", "star:pink", null, null], palette: ["star:biru", "star:pink", "star:oranye"], answer: ["star:oranye", "star:biru"] }],
    "Bagian yang berulang ada tiga warna: biru, pink, oranye. Setelah pink datang oranye, lalu pola dimulai lagi dengan biru.", { level: "Menantang" }),
  q(0, "Coba tebak. Apa aku? Aku di bawah meja atau di bawah tempat tidur. Aku di sebelah kiri kursi. Ketuk bendanya.", [{ kind: "tap", label: "Benda", scene: "kamar", answer: "mobil" }],
    "Yang di bawah meja atau tempat tidur adalah bola (di bawah tempat tidur) dan mobil-mobilan (di bawah meja). Dari keduanya, yang di sebelah kiri kursi hanya mobil-mobilan.", { level: "Sangat menantang" }),
  q(1, "Isilah kotak yang kosong untuk membentuk pola.", [{ kind: "seq", label: "Kotak", items: ["heart:pink", "star:oranye", "star:oranye", null, "star:oranye", "star:oranye", "heart:pink", null, null], palette: ["heart:pink", "star:oranye", "star:kuning"], answer: ["heart:pink", "star:oranye", "star:oranye"] }],
    "Cari bagian yang berulang: hati, bintang, bintang. Kotak keempat adalah hati. Setelah hati ketujuh datang bintang, bintang.", { level: "Sangat menantang" }),
  q(0, "Bola ada di sebelah kiri kotak. Kucing duduk di atas meja. Lengkapi kalimat kebalikannya.", [{ kind: "choice", label: "Kotak di sebelah … bola", options: ["kanan", "kiri", "depan"], answer: "kanan" }, { kind: "choice", label: "Meja di … kucing", options: ["atas", "belakang", "bawah"], answer: "bawah" }],
    "Setiap posisi punya kebalikannya. Jika bola di kiri kotak, maka kotak di kanan bola. Jika kucing di atas meja, maka meja di bawah kucing.", { level: "Menantang", fig: pair("bola", "kotak", "kiri") }),
  q(1, "Warnai bunga untuk membentuk pola warnamu sendiri. Gunakan paling sedikit dua warna dan buat bagian yang berulang.", [{ kind: "create", label: "Bunga", shape: "flower", n: 9, colors: ["merah", "kuning", "ungu"], sample: rep(["merah", "kuning", "ungu"], 9) }],
    "Banyak jawaban yang benar, misalnya merah, kuning, ungu, merah, kuning, ungu, merah, kuning, ungu. Warna harus berulang dengan urutan yang sama sampai bunga terakhir.", { level: "Sangat menantang" }),
  q(0, "Kucing mula-mula di bawah kursi biru. Kucing pindah ke kursi di sebelah kanannya, lalu naik ke atasnya. Kemudian kucing pindah dua kursi ke kiri dan duduk di bawahnya. Di manakah kucing sekarang?", [{ kind: "choice", label: "Posisi kucing", options: ["Di atas kursi kuning", "Di bawah kursi biru", "Di atas kursi merah", "Di bawah kursi merah"], answer: "Di bawah kursi merah" }],
    "Ikuti langkahnya: bawah kursi biru, pindah ke kanan menjadi kursi kuning, naik ke atasnya. Dua kursi ke kiri dari kuning adalah merah, lalu duduk di bawahnya.", { level: "Sangat menantang", fig: { t: "scene", s: "kursiWarna" } }),
  q(1, "Lanjutkan pola di bawah ini. Isi kotak yang kosong.", [{ kind: "seq", label: "Kotak", items: ["circle:hijau", "square:pink", "triangle:biru", "triangle:biru", "circle:hijau", null, null, null], palette: ["circle:hijau", "square:pink", "triangle:biru", "square:biru", "triangle:pink"], answer: ["square:pink", "triangle:biru", "triangle:biru"] }],
    "Bagian yang berulang ada empat: lingkaran hijau, segi empat pink, segitiga biru, segitiga biru. Perhatikan bentuk dan warnanya sekaligus.", { level: "Sangat menantang" }),
  q(0, "Tika datang dan berdiri di antara Upe dan Kira. Siapa yang sekarang berdiri ketiga dari kiri? Ketuk anaknya.", [{ kind: "tap", label: "Anak", scene: "barisan", answer: "kira" }],
    "Urutan dari kiri menjadi Upe, Tika, Kira, Halim, Lili, Malosi. Anak ketiga dari kiri adalah Kira.", { level: "Sangat menantang" }),
  q(1, "Ada satu gambar yang merusak pola. Ketuk gambar itu.", [{ kind: "odd", label: "Barisan", items: ["heart:pink", "star:oranye", "star:oranye", "heart:pink", "star:oranye", "heart:pink", "heart:pink", "star:oranye", "star:oranye"], answer: 5 }],
    "Polanya hati, bintang, bintang. Gambar keenam seharusnya bintang, tetapi yang ada hati.", { level: "Sangat menantang" }),
];
