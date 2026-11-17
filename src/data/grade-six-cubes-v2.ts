// Kelas 6 Bab 3: Kubus dan Balok (Matematika SD/MI Kelas VI, Kemendikbudristek 2022).
// A. Mengonstruksi dan Mengurai, B. Visualisasi Spasial, C. Lokasi.
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Kubus dan gambar tampak ---------- */
export type Color = "o" | "r" | "g" | "b" | "y" | "p" | "s";
export const COLORS: Record<Color, { name: string; hex: string }> = {
  o: { name: "Oranye", hex: "#f08a24" }, r: { name: "Merah", hex: "#e5484d" }, g: { name: "Hijau", hex: "#4caf50" },
  b: { name: "Biru", hex: "#3a86d4" }, y: { name: "Kuning", hex: "#f5c518" }, p: { name: "Ungu", hex: "#8e5bc4" }, s: { name: "Abu-abu", hex: "#a8b0b8" },
};
/** Sumbu: x ke kanan, y ke belakang (y = 0 paling depan), z ke atas. g = nomor balok (kubus bergrup tampil sebagai satu balok). */
export type Cube = { x: number; y: number; z: number; c: Color; g?: number; f?: { top?: Color; front?: Color; right?: Color } };
export type View = "depan" | "kanan" | "atas";
export type Grid = (Color | null)[][];

/** Tumpukan kubus di (x, y), warnanya dari bawah ke atas. */
const col = (x: number, y: number, colors: string): Cube[] => [...colors].map((c, z) => ({ x, y, z, c: c as Color }));
/** Bangun dari denah tinggi h[y][x] (baris 0 = paling depan). */
export const fromHeights = (h: number[][], c: Color = "s"): Cube[] => h.flatMap((row, y) => row.flatMap((n, x) => col(x, y, c.repeat(n))));
const build = (...cols: Cube[][]) => cols.flat();
export const size = (cubes: Cube[]) => ({ X: Math.max(...cubes.map(c => c.x)) + 1, Y: Math.max(...cubes.map(c => c.y)) + 1, Z: Math.max(...cubes.map(c => c.z)) + 1 });

/** Gambar tampak: baris 0 di atas. Tampak kanan: kolom kiri = sisi depan. Tampak atas: baris bawah = sisi depan. */
export function viewOf(view: View, cubes: Cube[], dims = size(cubes)): Grid {
  const { X, Y, Z } = dims;
  if (view === "depan") return Array.from({ length: Z }, (_, r) => Array.from({ length: X }, (_, x) => { const z = Z - 1 - r; const hit = cubes.filter(c => c.x === x && c.z === z).sort((a, b) => a.y - b.y)[0]; return hit ? hit.f?.front ?? hit.c : null; }));
  if (view === "kanan") return Array.from({ length: Z }, (_, r) => Array.from({ length: Y }, (_, y) => { const z = Z - 1 - r; const hit = cubes.filter(c => c.y === y && c.z === z).sort((a, b) => b.x - a.x)[0]; return hit ? hit.f?.right ?? hit.c : null; }));
  return Array.from({ length: Y }, (_, r) => Array.from({ length: X }, (_, x) => { const y = Y - 1 - r; const hit = cubes.filter(c => c.x === x && c.y === y).sort((a, b) => b.z - a.z)[0]; return hit ? hit.f?.top ?? hit.c : null; }));
}
export const sameGrid = (a: Grid, b: Grid) => a.length === b.length && a.every((row, r) => row.length === b[r].length && row.every((v, k) => v === b[r][k]));
/** Siluet (abaikan warna). */
export const shape = (g: Grid) => g.map(row => row.map(v => (v ? "s" : null))) as Grid;
export const VIEWS: View[] = ["depan", "kanan", "atas"];

/* ---------- Sistem berpetak ---------- */
export const LETTERS = "ABCDEFGHIJ";
export const pt = (s: string) => ({ c: LETTERS.indexOf(s[0]), r: Number(s.slice(1)) });
export const ptName = (c: number, r: number) => `${LETTERS[c]}${r}`;
export const showPt = (s: string) => `(${s[0]},${s.slice(1)})`;
export const manhattan = (a: string, b: string) => Math.abs(pt(a).c - pt(b).c) + Math.abs(pt(a).r - pt(b).r);
export function validPath(from: string, to: string, steps: string[]) {
  let cur = from;
  for (const s of steps) { if (!/^[A-J]\d+$/.test(s) || manhattan(cur, s) !== 1) return false; cur = s; }
  return cur === to && steps.length === manhattan(from, to);
}
export type MarkKind = "kubus" | "kerucut" | "tabung" | "bola" | "X" | "O" | "P" | "Q" | "K" | "L" | "anak" | "bendera";
export type Mark = { at: string; kind: MarkKind; label?: string };
export type Place = { cell: string; name: string; icon: "sekolah" | "pasar" | "taman" | "masjid" | "rumah" | "pantai" };

/* ---------- Dadu: jumlah mata sisi berlawanan 7 ---------- */
export type Die = { top: number; front: number; right: number | null };

/* ---------- Gambar soal ---------- */
export type Scene =
  | { type: "iso"; cubes: Cube[]; note?: string }
  | { type: "isos"; items: { label: string; cubes: Cube[] }[] }
  | { type: "views"; cubes: Cube[]; mono?: boolean }
  | { type: "grid"; cols: number; rows: number; marks: Mark[]; note?: string }
  | { type: "map"; cols: number; rows: number; places: Place[] }
  | { type: "dice"; dice: Die[] }
  | { type: "kardus"; dims: [number, number, number]; lines: string[] };

/* ---------- Bagian jawaban ---------- */
export type Visual = { cubes: Cube[] } | { view: Grid } | { die: Die };
export type Part =
  | { kind: "fill"; text: string; answers: (number | string)[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  /** Pilih gambar. */
  | { kind: "pick"; label: string; options: Visual[]; answer: number }
  /** Susun kubus pada denah: exact = sama persis dengan gambar, views = gambar tampaknya cocok. */
  | { kind: "build"; h: number[][]; max: number; by: "exact" | "views" }
  /** Warnai gambar tampak. */
  | { kind: "paint"; view: View; cubes: Cube[] }
  /** Ketuk titik potong pada sistem berpetak. */
  | { kind: "point"; cols: number; rows: number; at: string; marks?: Mark[] }
  /** Buat jalur terpendek dengan mengetuk titik-titik bersebelahan. */
  | { kind: "path"; cols: number; rows: number; from: string; to: string; marks?: Mark[] };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type CQuestion = Question & { topic: number; section: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const paintKey = (p: Extract<Part, { kind: "paint" }>) => viewOf(p.view, p.cubes);
export const fieldCount = (p: Part) => {
  switch (p.kind) {
    case "fill": return p.answers.length;
    case "build": return p.h.length * p.h[0].length;
    case "paint": { const g = paintKey(p); return g.length * g[0].length; }
    default: return 1;
  }
};
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replaceAll(".", "").replace(",", ".")));
/** Denah dari jawaban (baris 0 = depan). */
export const heightsOf = (p: Extract<Part, { kind: "build" }>, v: string) => { const x = cells(p, v).map(n => Number(n) || 0), w = p.h[0].length; return p.h.map((_, y) => x.slice(y * w, y * w + w)); };
export const shortestPath = (from: string, to: string) => {
  const a = pt(from), b = pt(to), out: string[] = []; let c = a.c, r = a.r;
  while (c !== b.c) { c += Math.sign(b.c - c); out.push(ptName(c, r)); }
  while (r !== b.r) { r += Math.sign(b.r - r); out.push(ptName(c, r)); }
  return out;
};
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "pick": return String(p.answer);
    case "build": return p.h.flat().join("|");
    case "paint": return paintKey(p).flat().map(v => v ?? "").join("|");
    case "point": return p.at;
    case "path": return shortestPath(p.from, p.to).join(";");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "choice": return v === p.answer;
    case "pick": return v === String(p.answer);
    case "point": return v.toUpperCase() === p.at;
    case "path": return validPath(p.from, p.to, v ? v.split(";") : []);
    case "fill": { const got = cells(p, v); return p.answers.every((w, i) => (typeof w === "number" ? num(got[i]) === w : got[i].trim().toUpperCase() === w)); }
    case "paint": { const got = cells(p, v); return paintKey(p).flat().every((w, i) => (w ?? "") === got[i]); }
    case "build": {
      const mine = fromHeights(heightsOf(p, v)), want = fromHeights(p.h);
      if (!mine.length) return false;
      if (p.by === "exact") return heightsOf(p, v).flat().join() === p.h.flat().join();
      const dims = { X: p.h[0].length, Y: p.h.length, Z: p.max };
      return VIEWS.every(view => sameGrid(shape(viewOf(view, mine, dims)), shape(viewOf(view, want, dims))));
    }
  }
}
export function partReady(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": return cells(p, v).every(x => x.trim() !== "");
    case "build": return cells(p, v).some(x => Number(x) > 0);
    case "paint": return cells(p, v).some(x => x !== "");
    case "path": return v !== "" && v.split(";").at(-1) === p.to;
    default: return v !== "";
  }
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: CQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: CQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
const gridText = (g: string[], w: number) => Array.from({ length: g.length / w }, (_, r) => g.slice(r * w, r * w + w).map(c => (c ? COLORS[c as Color].name.toLowerCase() : "kosong")).join(", ")).join(" / ");
export function formatAnswer(q: CQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "pick": return `${p.label} ${v[i] ? `gambar ${"ABCD"[Number(v[i])]}` : "…"}`;
      case "build": return `denah tinggi tumpukan dari depan ke belakang: ${heightsOf(p, v[i]).map(r => r.join(" ")).join(" / ")}`;
      case "paint": return `tampak ${p.view}: ${gridText(x, paintKey(p)[0].length)}`;
      case "point": return v[i] ? showPt(v[i]) : "…";
      case "path": return v[i] ? `jalur ${[p.from, ...v[i].split(";")].map(showPt).join(" → ")}` : "…";
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Mengonstruksi dan Mengurai", short: "Menyusun dan mengurai", sections: [
    { title: "Menyusun kubus", lab: "build", steps: ["Bangun ruang dapat disusun dari kubus-kubus yang sama besar, seperti bangunan dari kontainer bekas.", "Kubus dapat diletakkan berdampingan (satu lantai) atau ditumpuk (bertingkat).", "Susunan yang diputar tetap susunan yang sama, hanya dilihat dari arah lain."], example: "Tiga kubus satu lantai hanya membentuk dua bangun berbeda: lurus dan berbentuk L.", demo: "Ketuk petak pada denah untuk menumpuk kubus. Angka di petak menunjukkan tinggi tumpukannya." },
    { title: "Mengurai bangun", lab: "split", steps: ["Bangun ruang dapat diurai menjadi bangun yang lebih kecil, seperti tembok yang tersusun atas batu bata.", "Hitung kubus lantai demi lantai dari bawah. Kubus di atas selalu ditopang kubus di bawahnya.", "Balok dapat dibentuk dari dua kubus atau lebih."], example: "Lantai bawah 5 kubus dan lantai atas 2 kubus. Seluruhnya 5 + 2 = 7 kubus.", demo: "Pilih bangun, lalu urai per lantai untuk melihat kubus yang tertutup." },
  ] },
  { code: "B", title: "Visualisasi Spasial", short: "Tampak bangun", sections: [
    { title: "Tampak depan, kanan, dan atas", lab: "views", steps: ["Bangun ruang terlihat berbeda jika dilihat dari arah berbeda.", "Tampak depan dilihat lurus dari depan, tampak kanan dari sisi kanan, dan tampak atas dari atas dengan sisi depan di bagian bawah gambar.", "Setiap kotak pada gambar tampak berwarna seperti kubus terdekat yang terlihat dari arah itu."], demo: "Pilih bangun dan arah pandang, lalu bandingkan ketiga gambar tampaknya." },
    { title: "Menyusun dari gambar tampak", lab: "rebuild", steps: ["Dari gambar tampak beberapa arah, bangunnya dapat disusun kembali.", "Tampak atas menunjukkan petak yang berisi kubus. Tampak depan dan kanan menunjukkan tinggi tumpukan.", "Pada dadu, jumlah mata dua sisi yang berlawanan selalu 7: 1 dengan 6, 2 dengan 5, 3 dengan 4."], demo: "Susun kubus pada denah sampai ketiga gambar tampaknya cocok dengan contoh." },
  ] },
  { code: "C", title: "Lokasi", short: "Lokasi", sections: [
    { title: "Menentukan lokasi", lab: "locate", steps: ["Pada sistem berpetak, garis tegak diberi nama huruf dan garis mendatar diberi nama bilangan.", "Letak titik potong ditulis sebagai pasangan (huruf, bilangan), misalnya (B,4).", "Pada peta, setiap petak diberi nama dengan cara yang sama, misalnya Makassar ada di petak C2."], demo: "Ketuk titik potong mana saja untuk memindahkan tanda X, lalu baca letaknya." },
    { title: "Jalur dan jarak", lab: "path", steps: ["Bergerak hanya mendatar atau tegak dari satu titik ke titik sebelahnya, tidak boleh miring.", "Jarak terpendek = jarak mendatar + jarak tegak.", "Biasanya ada lebih dari satu jalur dengan jarak terpendek yang sama."], example: "Dari P(B,5) ke Q(E,1): 3 langkah ke kanan dan 4 langkah ke bawah, jaraknya 7.", demo: "Ketuk titik-titik bersebelahan untuk membuat jalur dari P ke Q. Ketuk titik terakhir untuk membatalkan." },
  ] },
];

/* ---------- Bangun yang dipakai soal ---------- */
const stairs = fromHeights([[2, 1, 0], [3, 2, 1]], "o");
const anike = build(col(0, 0, "b"), col(1, 0, "rg"), col(2, 0, "y"), col(1, 1, "p"));
const solo = (top: Color, front: Color, right: Color): Cube[] => [{ x: 0, y: 0, z: 0, c: front, f: { top, front, right } }];
const balokTower: Cube[] = [0, 1, 2].flatMap(z => [0, 1].map(x => ({ x, y: 0, z, c: "o" as Color, g: z })));
const balokL: Cube[] = [{ x: 0, y: 0, z: 0, g: 0 }, { x: 1, y: 0, z: 0, g: 0 }, { x: 2, y: 0, z: 0, g: 1 }, { x: 3, y: 0, z: 0, g: 1 }, { x: 2, y: 0, z: 1, g: 2 }, { x: 3, y: 0, z: 1, g: 2 }].map(c => ({ ...c, c: "o" as Color }));
const balokFour: Cube[] = [
  ...[0, 1].map(y => ({ x: 0, y, z: 0, g: 0 })), ...[0, 1].map(y => ({ x: 1, y, z: 0, g: 1 })), ...[0, 1].map(y => ({ x: 2, y, z: 0, g: 2 })),
  ...[0, 1].map(x => ({ x, y: 1, z: 1, g: 3 })),
].map((c, i) => ({ ...c, c: (["o", "o", "y", "y", "o", "o", "r", "r"] as Color[])[i] }));

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number, section: number) => (s: Spec): CQuestion => ({ ...s, topic, section, answer: answerKey(s.parts) });
const A1 = make(0, 0), A2 = make(0, 1), B1 = make(1, 0), B2 = make(1, 1), C1 = make(2, 0), C2 = make(2, 1);
const fill = (text: string, ...answers: (number | string)[]): Part => ({ kind: "fill", text, answers });
const choice = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const pick = (label: string, options: Visual[], answer: number): Part => ({ kind: "pick", label, options, answer });
const iso = (cubes: Cube[], note?: string): Scene => ({ type: "iso", cubes, note });
const RULE = "Setiap kubus di atas ditopang kubus di bawahnya.";

/* ---------- Latihan (4 soal per bagian, 8 per subtopik) ---------- */
export const practice: CQuestion[][] = [
  [
    A1({ prompt: `Berapa kubus yang menyusun bangun ini? ${RULE}`, scene: iso(stairs), parts: [fill("Banyak kubus = □", 9)], explanation: "Hitung tinggi setiap tumpukan. Baris belakang 3 + 2 + 1 = 6, baris depan 2 + 1 = 3. Seluruhnya 9 kubus." }),
    A1({ prompt: "Susun kubus pada denah agar sama dengan bangun di gambar. Ketuk petak untuk menambah kubus.", scene: iso(fromHeights([[1, 1, 1], [2, 0, 0]], "b")), parts: [{ kind: "build", h: [[1, 1, 1], [2, 0, 0]], max: 3, by: "exact" }], explanation: "Baris depan berisi tiga kubus satu lantai. Di belakang kubus paling kiri ada tumpukan dua kubus." }),
    A1({ prompt: "Gambar (a) dan (b) masing-masing tersusun dari tiga kubus. Apakah keduanya susunan yang sama yang dilihat dari arah berbeda?", scene: { type: "isos", items: [{ label: "(a)", cubes: fromHeights([[1, 1], [1, 0]], "y") }, { label: "(b)", cubes: fromHeights([[1, 1], [0, 1]], "y") }] }, parts: [choice("Jawaban:", ["Sama", "Berbeda"], "Sama")], explanation: "Keduanya berbentuk L dari tiga kubus satu lantai. Jika (a) diputar seperempat putaran, hasilnya sama dengan (b)." }),
    A1({ prompt: `Manakah bangun yang tersusun dari tepat 5 kubus? ${RULE}`, parts: [pick("Pilih gambar:", [{ cubes: fromHeights([[1, 1], [2, 0]], "g") }, { cubes: fromHeights([[1, 1, 1], [2, 1, 0]], "g") }, { cubes: fromHeights([[1, 1, 0], [2, 1, 0]], "g") }, { cubes: fromHeights([[2, 1], [3, 1]], "g") }], 2)], explanation: "Hitung tumpukannya. Gambar A 4 kubus, B 6 kubus, C 1 + 1 + 2 + 1 = 5 kubus, D 7 kubus." }),
    A2({ prompt: "Bangun ini disusun dari balok. Setiap balok terdiri atas 2 kubus. Berapa balok yang dibutuhkan?", scene: iso(balokTower), parts: [fill("Banyak balok = □", 3)], explanation: "Ada tiga lapis dan setiap lapis berisi satu balok. Jadi diperlukan 3 balok (6 kubus)." }),
    A2({ prompt: `Uraikan bangun ini per lantai. ${RULE}`, scene: iso(fromHeights([[1, 1, 1], [2, 2, 1]], "r")), parts: [fill("Lantai bawah □ kubus, lantai atas □ kubus, seluruhnya □ kubus", 6, 2, 8)], explanation: "Lantai bawah menutupi 2 baris × 3 petak = 6 kubus. Di lantai atas ada 2 kubus di belakang. Seluruhnya 6 + 2 = 8." }),
    A2({ prompt: "Bangun ini disusun dari balok-balok yang sama. Setiap balok terdiri atas 2 kubus.", scene: iso(balokL), parts: [fill("□ balok atau □ kubus", 3, 6)], explanation: "Ada dua balok di bawah dan satu balok di atas balok kanan. Jadi 3 balok, atau 3 × 2 = 6 kubus." }),
    A2({ prompt: "Kardus setinggi 30 cm ditumpuk di gudang setinggi 1 m.", scene: { type: "kardus", dims: [20, 40, 30], lines: ["Tinggi gudang 1 m = 100 cm", "12 kardus"] }, parts: [fill("Paling banyak □ kardus setiap tumpukan, jadi perlu □ tumpukan", 3, 4)], explanation: "3 × 30 = 90 cm masih muat, 4 × 30 = 120 cm terlalu tinggi. Jadi 3 kardus per tumpukan dan 12 : 3 = 4 tumpukan." }),
  ],
  [
    B1({ prompt: "Warnai tampak depan susunan kubus ini. Pilih warna, lalu ketuk kotaknya.", scene: iso(anike), parts: [{ kind: "paint", view: "depan", cubes: anike }], explanation: "Dari depan terlihat biru, merah, kuning di bawah dan hijau di atas merah. Kubus ungu tertutup kubus merah." }),
    B1({ prompt: "Warnai tampak atas susunan kubus ini. Baris bawah gambar adalah sisi depan.", scene: iso(anike), parts: [{ kind: "paint", view: "atas", cubes: anike }], explanation: "Dari atas terlihat kubus paling tinggi di setiap petak: biru, hijau, kuning di depan dan ungu di belakang tengah." }),
    B1({ prompt: "Manakah tampak kanan susunan kubus ini?", scene: iso(stairs), parts: [pick("Tampak kanan:", [{ view: viewOf("depan", stairs) }, { view: [["o", null], ["o", "o"], ["o", "o"]] }, { view: viewOf("kanan", stairs) }, { view: viewOf("atas", stairs) }], 2)], explanation: "Dari kanan, sisi depan ada di kiri gambar. Tumpukan depan paling tinggi 2 dan tumpukan belakang paling tinggi 3, jadi kolom kanan lebih tinggi." }),
    B1({ prompt: "Kubus ini sisinya berwarna-warni. Warnai tampak depan, kanan, dan atasnya.", scene: iso(solo("r", "b", "y")), parts: [{ kind: "paint", view: "depan", cubes: solo("r", "b", "y") }, { kind: "paint", view: "kanan", cubes: solo("r", "b", "y") }, { kind: "paint", view: "atas", cubes: solo("r", "b", "y") }], explanation: "Sisi depan biru, sisi kanan kuning, sisi atas merah." }),
    B2({ prompt: "Gambar tampak ini milik bangun yang mana?", scene: { type: "views", cubes: fromHeights([[2, 1], [0, 1]]), mono: true }, parts: [pick("Bangunnya:", [{ cubes: fromHeights([[2, 1], [1, 0]]) }, { cubes: fromHeights([[1, 2], [0, 1]]) }, { cubes: fromHeights([[2, 1], [0, 1]]) }, { cubes: fromHeights([[2, 1], [0, 2]]) }], 2)], explanation: "Tampak atas: dua petak depan dan satu petak kanan belakang. Tampak depan: kolom kiri setinggi 2. Tampak kanan: depan setinggi 2, belakang setinggi 1. Hanya C yang cocok." }),
    B2({ prompt: "Susun kubus pada denah sehingga tampak depan, kanan, dan atasnya sama dengan gambar.", scene: { type: "views", cubes: fromHeights([[1, 1, 2], [1, 0, 0]]), mono: true }, parts: [{ kind: "build", h: [[1, 1, 2], [1, 0, 0]], max: 3, by: "views" }], explanation: "Tampak atas: tiga petak di depan dan satu di kiri belakang. Tampak depan: kolom kanan setinggi 2. Tampak kanan: tumpukan tinggi ada di depan." }),
    B2({ prompt: "Ingat: jumlah mata dua sisi dadu yang berlawanan adalah 7.", scene: { type: "dice", dice: [{ top: 5, front: 3, right: 1 }] }, parts: [fill("Sisi bawah □ mata, sisi belakang □ mata", 2, 4)], explanation: "Bawah berlawanan dengan atas: 7 − 5 = 2. Belakang berlawanan dengan depan: 7 − 3 = 4." }),
    B2({ prompt: "Sebuah kubus berwarna-warni terlihat seperti ini dari depan, kanan, dan atas. Manakah kubusnya?", scene: { type: "views", cubes: solo("g", "r", "y") }, parts: [pick("Kubusnya:", [{ cubes: solo("r", "g", "y") }, { cubes: solo("g", "y", "r") }, { cubes: solo("y", "r", "g") }, { cubes: solo("g", "r", "y") }], 3)], explanation: "Depan merah, kanan kuning, atas hijau. Hanya gambar D yang cocok ketiganya." }),
  ],
  [
    C1({ prompt: "Beri tanda X pada titik (C,4). Ketuk titik potongnya.", parts: [{ kind: "point", cols: 6, rows: 5, at: "C4" }], explanation: "Ikuti garis tegak C, lalu garis mendatar 4. Titik potongnya adalah (C,4)." }),
    C1({ prompt: "Bangun-bangun ruang diletakkan pada kertas berpetak. Tuliskan letaknya.", scene: { type: "grid", cols: 6, rows: 5, marks: [{ at: "B2", kind: "kubus" }, { at: "D5", kind: "kerucut" }, { at: "F3", kind: "tabung" }] }, parts: [fill("Kerucut (□,□), tabung (□,□)", "D", 5, "F", 3)], explanation: "Kerucut ada di garis D dan garis 5. Tabung ada di garis F dan garis 3." }),
    C1({ prompt: "Perhatikan peta kampung ini. Di petak mana taman berada?", scene: { type: "map", cols: 4, rows: 3, places: [{ cell: "A3", name: "Sekolah", icon: "sekolah" }, { cell: "C2", name: "Taman", icon: "taman" }, { cell: "D1", name: "Pasar", icon: "pasar" }, { cell: "B1", name: "Masjid", icon: "masjid" }] }, parts: [choice("Taman di petak:", ["B2", "C3", "C2", "D2"], "C2")], explanation: "Taman berada di kolom C dan baris 2, jadi di petak C2." }),
    C1({ prompt: "Rina duduk di (C,2). Dimas duduk dua deret di sebelah kiri Rina dan satu baris di belakangnya (bilangan barisnya bertambah 1). Ketuk tempat duduk Dimas.", parts: [{ kind: "point", cols: 5, rows: 4, at: "A3", marks: [{ at: "C2", kind: "anak", label: "Rina" }] }], explanation: "Dua deret ke kiri dari C adalah A. Satu baris ke belakang dari 2 adalah 3. Dimas di (A,3)." }),
    C2({ prompt: "Buat jalur terpendek dari (A,3) ke (E,5). Ketuk titik-titik yang bersebelahan.", parts: [{ kind: "path", cols: 6, rows: 6, from: "A3", to: "E5" }], explanation: "Jalur terpendek terdiri atas 4 langkah ke kanan dan 2 langkah ke atas, dengan urutan apa saja." }),
    C2({ prompt: "Tentukan jarak dari (B,6) ke (D,3).", scene: { type: "grid", cols: 6, rows: 6, marks: [{ at: "B6", kind: "P" }, { at: "D3", kind: "Q" }] }, parts: [fill("Mendatar □, tegak □, jarak terpendek □", 2, 3, 5)], explanation: "Dari B ke D ada 2 langkah mendatar. Dari 6 ke 3 ada 3 langkah tegak. Jaraknya 2 + 3 = 5." }),
    C2({ prompt: "Kubus di (F,1) dipindahkan ke bendera di (D,2) dengan cara direbahkan ke salah satu sisinya. Berapa kali paling sedikit kubus direbahkan?", scene: { type: "grid", cols: 7, rows: 4, marks: [{ at: "F1", kind: "kubus" }, { at: "D2", kind: "bendera" }] }, parts: [fill("Paling sedikit □ kali", 3)], explanation: "Setiap direbahkan, kubus berpindah satu langkah. Dari F ke D 2 langkah dan dari 1 ke 2 satu langkah, jadi 3 kali." }),
    C2({ prompt: "Tigor berjalan dari K(A,1) ke L(B,3) dan hanya boleh bergerak ke kanan atau ke atas. Ada berapa jalur terpendek?", scene: { type: "grid", cols: 4, rows: 4, marks: [{ at: "A1", kind: "K" }, { at: "B3", kind: "L" }] }, parts: [fill("Ada □ jalur", 3)], explanation: "Tigor perlu 1 langkah kanan dan 2 langkah atas. Langkah kanan bisa di urutan pertama, kedua, atau ketiga, jadi ada 3 jalur." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const evalA1 = fromHeights([[1, 1, 1], [2, 2, 0]], "p");
const evalB1 = build(col(0, 0, "g"), col(1, 0, "y"), col(2, 0, "r"), col(0, 1, "bb"), col(1, 1, "g"));
const evalB1b = build(col(0, 0, "r"), col(1, 0, "b"), col(0, 1, "yy"), col(1, 1, "g"), col(2, 1, "o"));
const evalTop = fromHeights([[1, 1, 0], [2, 1, 1]], "b");
const lA = build(col(0, 0, "oo"), col(1, 0, "o"), col(0, 1, "o"));
const lB = build(col(0, 0, "o"), col(1, 0, "o"), col(0, 1, "oo"));
const twinA = fromHeights([[1, 2, 1], [0, 0, 1]], "g"), twinB = fromHeights([[1, 2, 1], [0, 1, 1]], "g");
const box8 = fromHeights([[1, 1, 1], [2, 2, 1]], "y");
export const assessment: CQuestion[] = [
  A2({ level: "Sedang", prompt: `Uraikan bangun ini per lantai. ${RULE}`, scene: iso(fromHeights([[1, 1, 1], [2, 2, 0]], "g")), parts: [fill("Lantai bawah □ kubus, lantai atas □ kubus, seluruhnya □ kubus", 5, 2, 7)], explanation: "Lantai bawah: 3 petak depan dan 2 petak belakang = 5 kubus. Lantai atas: 2 kubus di belakang. Seluruhnya 7." }),
  B1({ level: "Sedang", prompt: "Warnai tampak depan susunan kubus ini.", scene: iso(evalB1), parts: [{ kind: "paint", view: "depan", cubes: evalB1 }], explanation: "Dari depan terlihat hijau, kuning, merah di bawah. Di atas kubus hijau ada kubus biru dari tumpukan belakang." }),
  C1({ level: "Sedang", prompt: "Tuliskan letak tabung dan bola pada kertas berpetak.", scene: { type: "grid", cols: 6, rows: 5, marks: [{ at: "E2", kind: "tabung" }, { at: "B4", kind: "bola" }, { at: "C1", kind: "kubus" }] }, parts: [fill("Tabung (□,□), bola (□,□)", "E", 2, "B", 4)], explanation: "Tabung di garis E dan garis 2, bola di garis B dan garis 4. Huruf ditulis dulu, lalu bilangan." }),
  A1({ level: "Sedang", prompt: "Susun kubus pada denah agar sama dengan bangun di gambar.", scene: iso(evalA1), parts: [{ kind: "build", h: [[1, 1, 1], [2, 2, 0]], max: 3, by: "exact" }], explanation: "Baris depan: tiga tumpukan setinggi 1. Baris belakang: dua tumpukan setinggi 2 di kiri dan tengah." }),
  B2({ level: "Sedang", prompt: "Jumlah mata dua sisi dadu yang berlawanan adalah 7.", scene: { type: "dice", dice: [{ top: 4, front: 2, right: 6 }] }, parts: [fill("Sisi bawah □ mata, sisi kiri □ mata", 3, 1)], explanation: "Bawah berlawanan dengan atas: 7 − 4 = 3. Kiri berlawanan dengan kanan: 7 − 6 = 1." }),
  C2({ level: "Sedang", prompt: "Gambarkan satu jalur terpendek dari P ke Q, lalu tentukan jaraknya.", parts: [{ kind: "path", cols: 6, rows: 5, from: "A4", to: "F1", marks: [{ at: "A4", kind: "P" }, { at: "F1", kind: "Q" }] }, fill("Mendatar □, tegak □, jarak terpendek □", 5, 3, 8)], explanation: "P(A,4) ke Q(F,1): dari A ke F 5 langkah, dari 4 ke 1 tiga langkah. Jaraknya 5 + 3 = 8." }),
  A1({ level: "Sedang", prompt: `Berapa kubus yang menyusun bangun ini? ${RULE}`, scene: iso(fromHeights([[2, 1], [3, 2]], "r")), parts: [fill("Banyak kubus = □", 8)], explanation: "Tumpukan belakang 3 + 2 = 5, tumpukan depan 2 + 1 = 3. Seluruhnya 8 kubus." }),
  B1({ level: "Sedang", prompt: "Manakah tampak atas bangun ini? Baris bawah gambar adalah sisi depan.", scene: iso(evalTop), parts: [pick("Tampak atas:", [{ view: viewOf("atas", evalTop) }, { view: [["b", "b", null], ["b", "b", "b"]] }, { view: viewOf("depan", evalTop) }, { view: [["b", "b", "b"], [null, "b", "b"]] }], 0)], explanation: "Dari atas terlihat semua petak berisi kubus: tiga di belakang dan dua di kiri depan. Gambar B terbalik depan-belakang." }),

  C1({ level: "Menantang", prompt: "Kinan duduk di (B,3). Angga duduk dua deret di sebelah kanan Kinan dan satu baris tepat di belakang Kinan (bilangan barisnya bertambah 1). Ketuk tempat duduk Angga.", parts: [{ kind: "point", cols: 6, rows: 5, at: "D4", marks: [{ at: "B3", kind: "anak", label: "Kinan" }] }], explanation: "Dua deret ke kanan dari B adalah D. Satu baris ke belakang dari 3 adalah 4. Angga di (D,4)." }),
  A2({ level: "Menantang", prompt: "Bangun ini disusun dari balok-balok yang sama. Setiap balok terdiri atas 2 kubus.", scene: iso(balokFour), parts: [fill("□ balok atau □ kubus", 4, 8)], explanation: "Lantai bawah berisi 3 balok yang berjajar, dan lantai atas 1 balok di belakang. Jadi 4 balok = 8 kubus." }),
  B2({ level: "Menantang", prompt: "Gambar tampak ini milik bangun yang mana?", scene: { type: "views", cubes: fromHeights([[2, 1, 0], [1, 1, 1]]), mono: true }, parts: [pick("Bangunnya:", [{ cubes: fromHeights([[1, 1, 0], [2, 1, 1]]) }, { cubes: fromHeights([[2, 1, 1], [1, 1, 0]]) }, { cubes: fromHeights([[2, 1, 0], [1, 1, 0]]) }, { cubes: fromHeights([[2, 1, 0], [1, 1, 1]]) }], 3)], explanation: "Tampak atas: dua petak di depan kiri dan tiga di belakang. Tampak depan: kolom kiri setinggi 2. Tampak kanan: yang tinggi ada di depan. Hanya D yang cocok." }),
  C2({ level: "Menantang", prompt: "Buat jalur terpendek dari P(B,5) ke Q(E,2).", parts: [{ kind: "path", cols: 6, rows: 6, from: "B5", to: "E2", marks: [{ at: "B5", kind: "P" }, { at: "E2", kind: "Q" }] }], explanation: "Jalur terpendek terdiri atas 3 langkah ke kanan dan 3 langkah ke bawah, total 6 langkah." }),
  A1({ level: "Menantang", prompt: "Gambar (a) dan (b) masing-masing tersusun dari empat kubus. Apakah keduanya susunan yang sama yang dilihat dari arah berbeda?", scene: { type: "isos", items: [{ label: "(a)", cubes: lA }, { label: "(b)", cubes: lB }] }, parts: [choice("Jawaban:", ["Sama", "Berbeda"], "Berbeda")], explanation: "Pada (a), kubus atas berada di atas kubus pojok L. Pada (b), kubus atas berada di ujung lengan L. Diputar ke arah mana pun, kubus pojok tetap di pojok, jadi susunannya berbeda." }),
  B1({ level: "Menantang", prompt: "Warnai tampak kanan susunan kubus ini. Kolom kiri gambar adalah sisi depan.", scene: iso(evalB1b), parts: [{ kind: "paint", view: "kanan", cubes: evalB1b }], explanation: "Dari kanan, yang terlihat adalah kubus paling kanan di setiap baris. Depan: biru. Belakang: oranye di bawah dan kuning di atas." }),
  C1({ level: "Menantang", prompt: "Perhatikan peta kampung ini.", scene: { type: "map", cols: 5, rows: 3, places: [{ cell: "B3", name: "Sekolah", icon: "sekolah" }, { cell: "D2", name: "Pasar", icon: "pasar" }, { cell: "A1", name: "Pantai", icon: "pantai" }, { cell: "E3", name: "Masjid", icon: "masjid" }, { cell: "C1", name: "Rumah Tenri", icon: "rumah" }] }, parts: [choice("Pasar di petak:", ["B4", "D2", "C2", "D3"], "D2"), choice("Petak C1 berisi:", ["Sekolah", "Pantai", "Rumah Tenri", "Masjid"], "Rumah Tenri")], explanation: "Pasar ada di kolom D dan baris 2, jadi petak D2. Petak C1 adalah kolom C baris 1, isinya rumah Tenri." }),
  A2({ level: "Menantang", prompt: "Kardus setinggi 25 cm ditumpuk di gudang yang tingginya 1,6 m. Ada 20 kardus.", scene: { type: "kardus", dims: [30, 40, 25], lines: ["Tinggi gudang 1,6 m = 160 cm", "20 kardus"] }, parts: [fill("Paling banyak □ kardus setiap tumpukan, paling sedikit □ tumpukan", 6, 4)], explanation: "6 × 25 = 150 cm muat, 7 × 25 = 175 cm terlalu tinggi. 20 kardus dengan 6 per tumpukan: 6 + 6 + 6 + 2, jadi 4 tumpukan." }),
  B2({ level: "Menantang", prompt: "Susun kubus pada denah sehingga tampak depan, kanan, dan atasnya sama dengan gambar.", scene: { type: "views", cubes: fromHeights([[1, 0, 1], [2, 1, 2]]), mono: true }, parts: [{ kind: "build", h: [[1, 0, 1], [2, 1, 2]], max: 3, by: "views" }], explanation: "Tampak atas: baris belakang penuh, baris depan hanya kiri dan kanan. Tampak depan: kolom kiri dan kanan setinggi 2. Tampak kanan: yang tinggi ada di belakang." }),

  C2({ level: "Sangat menantang", prompt: "Tigor berjalan dari K(A,1) ke L(C,3) dan hanya boleh bergerak ke kanan atau ke atas. Ada berapa jalur terpendek?", scene: { type: "grid", cols: 4, rows: 4, marks: [{ at: "A1", kind: "K" }, { at: "C3", kind: "L" }] }, parts: [fill("Ada □ jalur", 6)], explanation: "Tulis banyak cara di setiap titik: titik di tepi bernilai 1, titik lain = nilai kiri + nilai bawah. (B,2) = 2, (C,2) = 3, (B,3) = 3, jadi (C,3) = 3 + 3 = 6." }),
  A2({ level: "Sangat menantang", prompt: "Pak Hasan menumpuk 24 kardus di gudangnya. Semua kardus memakai rusuk tegak yang sama. Agar lantai terpakai paling sedikit:", scene: { type: "kardus", dims: [20, 30, 40], lines: ["Tinggi gudang 2,3 m = 230 cm", "24 kardus"] }, parts: [choice("Rusuk yang tegak:", ["20 cm", "30 cm", "40 cm"], "40 cm"), fill("Luas lantai □ cm²", 3000)], explanation: "Tegak 20 cm: 11 per tumpukan, 3 tumpukan × 1.200 = 3.600 cm². Tegak 30 cm: 7 per tumpukan, 4 × 800 = 3.200 cm². Tegak 40 cm: 5 per tumpukan, 5 × 600 = 3.000 cm². Paling kecil 3.000 cm²." }),
  B1({ level: "Sangat menantang", prompt: "Bandingkan kedua bangun ini. Gambar tampak mana yang sama?", scene: { type: "isos", items: [{ label: "(a)", cubes: twinA }, { label: "(b)", cubes: twinB }] }, parts: [choice("Yang sama:", ["Hanya tampak depan", "Hanya tampak atas", "Tampak depan dan kanan", "Ketiganya sama"], "Tampak depan dan kanan")], explanation: "Tampak depan keduanya: kolom tengah setinggi 2, kolom kiri dan kanan setinggi 1. Tampak kanan keduanya: depan setinggi 2, belakang setinggi 1. Tampak atas berbeda: (a) punya satu petak belakang, (b) dua." }),
  C2({ level: "Sangat menantang", prompt: "Kubus di (F,1) direbahkan 2 kali ke kiri, lalu 2 kali ke belakang (bilangan bertambah). Sisi bertanda P mula-mula di atas.", scene: { type: "grid", cols: 7, rows: 4, marks: [{ at: "F1", kind: "kubus", label: "P di atas" }, { at: "D3", kind: "bendera" }] }, parts: [fill("Kubus sampai di (□,□)", "D", 3), choice("Sisi P sekarang di:", ["Atas", "Bawah", "Depan", "Belakang", "Kiri", "Kanan"], "Atas")], explanation: "Ke kiri sekali: P pindah ke kiri. Ke kiri lagi: P di bawah. Ke belakang sekali: P di depan. Ke belakang lagi: P kembali di atas. Kubus sampai di (D,3)." }),
  A1({ level: "Sangat menantang", prompt: `Bangun ini akan dilengkapi menjadi balok berukuran 3 × 2 × 2 kubus. ${RULE}`, scene: iso(box8), parts: [fill("Kubus sekarang □, perlu ditambah □ kubus", 8, 4)], explanation: "Balok 3 × 2 × 2 berisi 12 kubus. Bangun sekarang: lantai bawah 6 dan lantai atas 2, jadi 8 kubus. Perlu ditambah 12 − 8 = 4 kubus." }),
  B2({ level: "Sangat menantang", prompt: "Kedua gambar adalah dadu yang sama yang diputar mendatar. Jumlah mata dua sisi berlawanan 7. Berapa mata pada sisi kanan dadu kedua?", scene: { type: "dice", dice: [{ top: 5, front: 1, right: 3 }, { top: 5, front: 3, right: null }] }, parts: [fill("Sisi kanan dadu kedua □ mata", 6)], explanation: "Jika dilihat dari atas, urutan sisi tegaknya depan 1, kanan 3, belakang 6, kiri 4. Dadu diputar sehingga 3 di depan, maka sisi kanannya adalah 6." }),
  C1({ level: "Sangat menantang", prompt: "Kelompok X sudah menandai (B,2) dan (C,3). Kelompok O sudah menandai (A,1) dan (E,5). Ketuk satu titik kosong agar kelompok X punya tiga tanda segaris.", parts: [{ kind: "point", cols: 6, rows: 5, at: "D4", marks: [{ at: "B2", kind: "X" }, { at: "C3", kind: "X" }, { at: "A1", kind: "O" }, { at: "E5", kind: "O" }] }], explanation: "(B,2) dan (C,3) segaris miring. Titik kosong lain pada garis itu adalah (A,1), (D,4), dan (E,5). (A,1) dan (E,5) sudah ditandai O, jadi X harus di (D,4)." }),
];
