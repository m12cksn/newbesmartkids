// Kelas 4 Bab 4: Pengukuran Luas dan Volume (Matematika SD/MI Kelas IV, Kemendikbudristek).
// A pengukuran luas (satuan tidak baku, persegi satuan, cm² dan m²), B pengukuran volume (tidak baku, ml dan l, kubus satuan).
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Gambar ---------- */
/**
 * Bangun pada kertas berpetak 1 cm × 1 cm. Setiap baris: '#' persegi penuh, '.' kosong, dan setengah persegi
 * (dipotong diagonal): 'a' terisi bagian kanan-bawah, 'b' kiri-bawah, 'c' kanan-atas, 'd' kiri-atas.
 */
export type Poly = { label?: string; rows: string[] };
export type Thing = "lapangan" | "kolam" | "bingkai" | "buku" | "perangko" | "halaman" | "saputangan" | "basket" | "sendok" | "ember" | "parfum" | "tong" | "obat" | "galon";
export type Scene =
  | { type: "polys"; polys: Poly[] }
  /** Botol besar sama dengan `small` botol kecil; `label` pada botol besar. */
  | { type: "bottles"; rows: { label: string; small: number }[] }
  | { type: "cartons"; items: { name: string; ml: number }[] }
  /** Bangun kubus satuan: tinggi tumpukan di setiap petak alas (baris depan ke belakang). */
  | { type: "cubes"; shapes: { label?: string; heights: number[][] }[] };

/* ---------- Bagian jawaban ---------- */
export type Part =
  | { kind: "fill"; text: string; answers: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "rank"; label: string; items: { label: string; value: number }[]; dir: "naik" | "turun" }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "multi"; label: string; options: string[]; answer: string[] }
  /** Kelompokkan benda ke salah satu kotak tujuan. */
  | { kind: "sort"; items: Thing[]; bins: [string, string]; answer: number[] }
  /** Arsir petak sampai luasnya `need` persegi satuan (bentuk bebas). */
  | { kind: "shade"; cols: number; rows: number; need: number }
  /** Tuang botol kecil ke botol besar sampai tepat penuh. */
  | { kind: "pour"; small: number }
  /** Susun balok dari kubus satuan: atur panjang (≤ max), lebar dan tinggi (≤ 4) sampai volumenya `need`. */
  | { kind: "cuboid"; need: number; max: number };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type MQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const thingName: Record<Thing, string> = { lapangan: "lapangan sepak bola", kolam: "kolam renang", bingkai: "bingkai foto", buku: "sampul buku", perangko: "perangko", halaman: "halaman sekolah", saputangan: "sapu tangan", basket: "lapangan basket", sendok: "sendok obat", ember: "ember", parfum: "botol parfum", tong: "tong air", obat: "tetes mata", galon: "galon air" };
/** Luas bangun berpetak: persegi penuh 1, setengah persegi ½. */
export const polyArea = (p: Poly) => p.rows.join("").split("").reduce((a, c) => a + (c === "#" ? 1 : "abcd".includes(c) ? 0.5 : 0), 0);
export const cubeCount = (h: number[][]) => h.flat().reduce((a, b) => a + b, 0);
export const fieldCount = (p: Part) => (p.kind === "fill" ? p.answers.length : p.kind === "cuboid" ? 3 : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
/** Bilangan dari isian anak; titik ribuan boleh dipakai (1.249). */
export const toNum = (s: string) => { const t = s.trim(); return /^\d{1,3}(\.\d{3})*$|^\d+$/.test(t) ? Number(t.replaceAll(".", "")) : NaN; };
export const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "rank": return p.items.map((_, i) => i).sort((a, b) => (p.dir === "naik" ? p.items[a].value - p.items[b].value : p.items[b].value - p.items[a].value)).join("|");
    case "match": case "sort": return p.answer.join("|");
    case "multi": return [...p.answer].sort().join("|");
    case "shade": return Array.from({ length: p.need }, (_, i) => i).join("|");
    case "pour": return String(p.small);
    case "cuboid": { const w = Math.min(p.max, 4); for (let a = p.max; a >= 1; a--) for (let b = 1; b <= w; b++) { const c = p.need / (a * b); if (Number.isInteger(c) && c <= w) return `${a}|${b}|${c}`; } return ""; }
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": { const got = cells(p, v); return p.answers.every((a, i) => toNum(got[i]) === a); }
    case "rank": { const idx = list(v).map(Number), want = p.items.map(i => i.value).sort((a, b) => (p.dir === "naik" ? a - b : b - a)); return idx.length === p.items.length && new Set(idx).size === idx.length && idx.map(i => p.items[i]?.value).join("|") === want.join("|"); }
    case "multi": return [...list(v)].sort().join("|") === partKey(p);
    case "shade": return new Set(list(v)).size === p.need;
    case "cuboid": { const [a, b, c] = cells(p, v).map(Number); return a * b * c === p.need; }
    default: return v === partKey(p);
  }
}
/** Lengkap (belum tentu benar). */
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill") return cells(p, v).every(x => x.trim() !== "");
  if (p.kind === "rank") return new Set(list(v)).size === p.items.length;
  if (p.kind === "match" || p.kind === "sort") { const x = list(v), n = p.kind === "match" ? p.left.length : p.items.length; return Array.from({ length: n }, (_, i) => x[i] ?? "").every(y => y !== ""); }
  if (p.kind === "pour") return v !== "" && v !== "0";
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: MQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: MQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: MQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => { const c = x[k++]; return c ? fmt(toNum(c)) : "…"; }); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "rank": return `${p.label} ${list(v[i]).map(k => p.items[Number(k)]?.label).join(", ") || "…"}`;
      case "match": { const m = list(v[i]); return p.left.map((l, k) => `${l} → ${m[k] ? p.right[Number(m[k])] : "…"}`).join("; "); }
      case "multi": return `${p.label} ${list(v[i]).sort().join(", ") || "…"}`;
      case "sort": { const m = list(v[i]); return p.items.map((t, k) => `${thingName[t]} → ${m[k] ? p.bins[Number(m[k])] : "…"}`).join("; "); }
      case "shade": return `${list(v[i]).length} persegi satuan diarsir`;
      case "pour": return `${v[i] || 0} botol kecil dituang`;
      case "cuboid": { const [a, b, c] = x.map(Number); return x.every(Boolean) ? `${a} × ${b} × ${c} = ${a * b * c} kubus satuan` : "…"; }
    }
  }).join(" | ");
}

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Pengukuran Luas", short: "Luas", sections: [
    { title: "Luas dengan persegi satuan, cm², dan m²", lab: "area", steps: ["Luas adalah banyaknya satuan luas yang menutupi permukaan tanpa celah.", "Satuan tidak baku bisa berupa uang kertas atau kertas origami. Hasilnya berbeda jika satuannya berbeda.", "Satuan baku: persegi bersisi 1 cm luasnya 1 cm², persegi bersisi 1 m luasnya 1 m². 1 m² = 10.000 cm².", "Dua setengah persegi sama dengan satu persegi satuan."], example: "Meja lipat ditutupi 8 uang kertas atau 4 kertas origami. Bangun dengan 13 persegi bersisi 1 cm luasnya 13 cm².", demo: "Ketuk petak untuk mengarsir. Hitung luasnya, lalu bandingkan dengan satuan yang lebih besar." },
  ] },
  { code: "B", title: "Pengukuran Volume", short: "Volume", sections: [
    { title: "Volume dengan botol, liter, dan kubus satuan", lab: "volume", steps: ["Volume adalah banyaknya isi suatu wadah. Satuan tidak baku: botol A = 4 botol B, atau 10 botol C.", "Satuan baku untuk cairan: liter (l) dan mililiter (ml). 1 l = 1.000 ml.", "Untuk benda pejal dipakai kubus satuan: 1 cm³ = 1 ml dan 1 m³ = 1.000 l.", "Volume balok = banyak kubus satuan = panjang × lebar × tinggi."], example: "Kotak susu 1.000 ml = 1 l. Balok 4 × 3 × 2 tersusun dari 24 kubus satuan, volumenya 24 cm³.", demo: "Tuang botol kecil ke botol besar, atau susun kubus satuan dan lihat volumenya." },
  ] },
];

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): MQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B] = [make(0), make(1)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const polys = (...p: Poly[]): Scene => ({ type: "polys", polys: p });
const rect = (gw: number, gh: number, x: number, y: number, w: number, h: number, hole?: [number, number, number, number]): Poly => ({ rows: Array.from({ length: gh }, (_, r) => Array.from({ length: gw }, (_, c) => {
  const inR = c >= x && c < x + w && r >= y && r < y + h, inH = hole && c >= hole[0] && c < hole[0] + hole[2] && r >= hole[1] && r < hole[1] + hole[3];
  return inR && !inH ? "#" : "."; }).join("")) });
const cubes = (...shapes: { label?: string; heights: number[][] }[]): Scene => ({ type: "cubes", shapes });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: MQuestion[][] = [
  [
    A({ prompt: "Berapa persegi satuan luas bangun A, B, C, dan D?", scene: polys({ label: "A", rows: ["##.", "###", ".#."] }, { label: "B", rows: ["####", "####"] }, { label: "C", rows: ["#..", "###", "..#", "..#"] }, { label: "D", rows: ["###", "#.#", "###"] }), parts: [fill("A □, B □, C □, D □", 6, 8, 6, 8), { kind: "choice", label: "Luasnya sama:", options: ["A dan B", "A dan C", "C dan D"], answer: "A dan C" }], explanation: "Hitung perseginya: A = 6, B = 8, C = 6, D = 8. Bangun A dan C sama luas, begitu juga B dan D." }),
    A({ prompt: "Kelompokkan benda menurut satuan luas yang cocok.", parts: [{ kind: "sort", items: ["lapangan", "bingkai", "kolam", "perangko"], bins: ["cm persegi", "m persegi"], answer: [1, 0, 1, 0] }], explanation: "Lapangan sepak bola dan kolam renang sangat luas, jadi diukur dengan m². Bingkai foto dan perangko kecil, jadi diukur dengan cm²." }),
    A({ prompt: "Tentukan luas bangun yang diarsir. Setiap persegi berukuran 1 cm × 1 cm.", scene: polys({ rows: ["..ab..", ".a##b.", "a####b"] }), parts: [fill("Luas = □ cm²", 9)], explanation: "Ada 6 persegi penuh dan 6 setengah persegi. 6 setengah = 3 persegi. Luasnya 6 + 3 = 9 cm²." }),
    A({ prompt: "Arsirlah sembarang bentuk dengan luas 9 cm² pada kertas berpetak ini.", parts: [{ kind: "shade", cols: 6, rows: 5, need: 9 }], explanation: "Bentuknya boleh apa saja, asalkan ada tepat 9 persegi satuan yang diarsir. Contohnya persegi 3 × 3." }),
  ],
  [
    B({ prompt: "Satu botol besar hand sanitizer dituang ke botol kecil sampai habis. Tuang botol kecil ke botol besar sampai tepat penuh.", parts: [{ kind: "pour", small: 6 }], explanation: "Botol besar tepat penuh setelah 6 botol kecil dituang. Volume botol besar sama dengan 6 botol kecil atau 6 satuan volume." }),
    B({ prompt: "Ibu membeli tiga kotak susu. Berapa volume seluruhnya?", scene: { type: "cartons", items: [{ name: "Susu cokelat", ml: 1000 }, { name: "Susu stroberi", ml: 250 }, { name: "Susu vanila", ml: 750 }] }, parts: [fill("1.000 + 250 + 750 = □ ml = □ l", 2000, 2)], explanation: "1.000 + 250 + 750 = 2.000 ml. Karena 1.000 ml = 1 l, 2.000 ml = 2 l." }),
    B({ prompt: "Ubahlah satuan volume berikut.", parts: [fill("48.000 ml = □ l", 48), fill("7.365 ml = □ l □ ml", 7, 365)], explanation: "Setiap 1.000 ml = 1 l. 48.000 ml = 48 l. 7.365 ml = 7.000 ml + 365 ml = 7 l 365 ml." }),
    B({ prompt: "Setiap kubus volumenya 1 cm³. Tentukan volume bangun ini.", scene: cubes({ heights: [[2, 2, 2], [2, 2, 2]] }), parts: [fill("Volume = □ cm³", 12)], explanation: "Ada 2 lapis, setiap lapis 3 × 2 = 6 kubus. 6 + 6 = 12 kubus satuan, jadi volumenya 12 cm³." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
export const assessment: MQuestion[] = [
  A({ level: "Sedang", prompt: "Mainan bongkar pasang Slamet berbentuk seperti ini. Bangun mana yang lebih luas?", scene: polys({ label: "P", rows: ["###.", "####", ".#.."] }, { label: "Q", rows: ["#...", "###.", "####"] }), parts: [fill("P □, Q □ persegi satuan", 8, 8), { kind: "choice", label: "Yang lebih luas:", options: ["P", "Q", "Sama luas"], answer: "Sama luas" }], explanation: "P: 3 + 4 + 1 = 8 persegi. Q: 1 + 3 + 4 = 8 persegi. Bentuknya berbeda, tetapi luasnya sama." }),
  B({ level: "Sedang", prompt: "Ubahlah satuan volume berikut.", parts: [fill("9.250 ml = □ l □ ml", 9, 250), fill("4 l = □ ml", 4000)], explanation: "9.250 ml = 9.000 ml + 250 ml = 9 l 250 ml. 4 l = 4 × 1.000 ml = 4.000 ml." }),
  A({ level: "Sedang", prompt: "Kelompokkan benda menurut satuan luas yang cocok.", parts: [{ kind: "sort", items: ["basket", "saputangan", "halaman", "buku", "kolam"], bins: ["cm persegi", "m persegi"], answer: [1, 0, 1, 0, 1] }], explanation: "Lapangan basket, halaman sekolah, dan kolam renang diukur dengan m². Sapu tangan dan sampul buku cukup diukur dengan cm²." }),
  B({ level: "Sedang", prompt: "Setiap kubus volumenya 1 cm³. Tentukan volume bangun ini.", scene: cubes({ heights: [[2, 2, 2, 2], [2, 2, 2, 2]] }), parts: [fill("Volume = □ cm³", 16)], explanation: "Ada 2 lapis, setiap lapis 4 × 2 = 8 kubus. 8 + 8 = 16 cm³." }),
  A({ level: "Sedang", prompt: "Hitunglah luas daerah persegi panjang yang diarsir. Setiap petak 1 cm × 1 cm.", scene: polys(rect(9, 5, 1, 1, 6, 3)), parts: [fill("Luas = □ cm²", 18)], explanation: "Persegi panjang itu 6 petak ke kanan dan 3 petak ke bawah: 6 × 3 = 18 cm²." }),
  B({ level: "Sedang", prompt: "Botol sabun besar diisi dari botol sabun kecil. Tuang botol kecil sampai botol besar tepat penuh.", parts: [{ kind: "pour", small: 5 }], explanation: "Botol besar tepat penuh setelah 5 botol kecil. Volume botol besar = 5 botol kecil." }),
  A({ level: "Sedang", prompt: "Arsirlah sembarang bentuk dengan luas 7 cm².", parts: [{ kind: "shade", cols: 5, rows: 4, need: 7 }], explanation: "Bentuk apa pun benar asalkan tepat 7 persegi satuan yang diarsir." }),
  B({ level: "Sedang", prompt: "Slamet membeli tiga minuman. Berapa volume seluruhnya?", scene: { type: "cartons", items: [{ name: "Susu UHT", ml: 1000 }, { name: "Jus jeruk", ml: 500 }, { name: "Teh", ml: 250 }] }, parts: [fill("Jumlah = □ ml", 1750)], explanation: "1.000 + 500 + 250 = 1.750 ml, sama dengan 1 l 750 ml." }),

  A({ level: "Menantang", prompt: "Tentukan luas bangun yang diarsir. Setiap persegi berukuran 1 cm × 1 cm.", scene: polys({ rows: ["...ab...", "..a##b..", ".a####b.", "a######b"] }), parts: [fill("Luas = □ cm²", 16)], explanation: "Persegi penuh: 2 + 4 + 6 = 12. Setengah persegi: 8 buah = 4 persegi. Luasnya 12 + 4 = 16 cm²." }),
  B({ level: "Menantang", prompt: "Setiap botol besar diisi botol kecil sebanyak gambar. Urutkan dari volume paling sedikit.", scene: { type: "bottles", rows: [{ label: "a", small: 5 }, { label: "b", small: 2 }, { label: "c", small: 7 }, { label: "d", small: 1 }, { label: "e", small: 4 }] }, parts: [{ kind: "rank", label: "Ketuk botol dari yang paling sedikit:", items: [["a", 5], ["b", 2], ["c", 7], ["d", 1], ["e", 4]].map(([label, value]) => ({ label: label as string, value: value as number })), dir: "naik" }], explanation: "Bandingkan banyak botol kecil: d (1), b (2), e (4), a (5), c (7)." }),
  A({ level: "Menantang", prompt: "Bandingkan luas kedua bangun. Setiap persegi 1 cm × 1 cm.", scene: polys({ label: "R", rows: ["####", "#..#", "####"] }, { label: "S", rows: ["###", "###", "###"] }), parts: [fill("R □ cm², S □ cm²", 10, 9), { kind: "choice", label: "Yang lebih luas:", options: ["R", "S", "Sama luas"], answer: "R" }], explanation: "R: 4 + 2 + 4 = 10 cm² (tengahnya kosong). S: 3 × 3 = 9 cm². R lebih luas 1 cm²." }),
  B({ level: "Menantang", prompt: "Sebuah tangki berisi 1.850 l air. Siang hari dipompa keluar 625 l 450 ml. Berapa air yang tersisa?", parts: [fill("Sisa = □ l □ ml", 1224, 550)], explanation: "1.850 l = 1.849 l 1.000 ml. 1.849 l − 625 l = 1.224 l dan 1.000 ml − 450 ml = 550 ml. Sisa 1.224 l 550 ml." }),
  A({ level: "Menantang", prompt: "Pilih semua bangun yang luasnya 8 cm².", scene: polys({ label: "A", rows: ["####", "####"] }, { label: "B", rows: ["###", "###", "##."] }, { label: "C", rows: ["#...", "####", "#..."] }, { label: "D", rows: ["###.", "a##b", ".##."] }, { label: "E", rows: ["###", "#.#", "###"] }), parts: [{ kind: "multi", label: "Luasnya 8 cm²:", options: ["A", "B", "C", "D", "E"], answer: ["A", "B", "D", "E"] }], explanation: "A = 8, B = 3 + 3 + 2 = 8, C = 1 + 4 + 1 = 6, D = 3 + (2 penuh + 2 setengah) + 2 = 8, E = 8. Hanya C yang tidak 8 cm²." }),
  B({ level: "Menantang", prompt: "Susun balok dari kubus satuan sehingga volumenya 12 cm³. Atur panjang, lebar, dan tingginya.", parts: [{ kind: "cuboid", need: 12, max: 6 }], explanation: "Banyak kubus = panjang × lebar × tinggi. Contoh yang benar: 3 × 2 × 2, 4 × 3 × 1, atau 6 × 2 × 1." }),
  A({ level: "Menantang", prompt: "Ubahlah satuan luas berikut.", parts: [fill("3 m² = □ cm²", 30000), fill("50.000 cm² = □ m²", 5)], explanation: "1 m² = 10.000 cm². 3 m² = 30.000 cm². 50.000 cm² : 10.000 = 5 m²." }),
  B({ level: "Menantang", prompt: "Kelompokkan wadah menurut satuan volume yang cocok.", parts: [{ kind: "sort", items: ["sendok", "ember", "parfum", "tong", "obat"], bins: ["mililiter (ml)", "liter (l)"], answer: [0, 1, 0, 1, 0] }], explanation: "Sendok obat, botol parfum, dan tetes mata isinya sedikit, jadi memakai ml. Ember dan tong air isinya banyak, jadi memakai liter." }),
  A({ level: "Menantang", prompt: "Arsirlah sembarang bentuk dengan luas 12 cm².", parts: [{ kind: "shade", cols: 6, rows: 5, need: 12 }], explanation: "Bentuk apa pun benar asalkan tepat 12 persegi satuan yang diarsir, misalnya 4 × 3 atau 6 × 2." }),

  B({ level: "Sangat menantang", prompt: "Fina membeli 2 l 450 ml susu pada hari Senin, 1 l 800 ml pada hari Rabu, dan 3 l 650 ml pada hari Jumat. Berapa banyak susu seluruhnya?", parts: [fill("Jumlah = □ l □ ml", 7, 900)], explanation: "Liter: 2 + 1 + 3 = 6 l. Mililiter: 450 + 800 + 650 = 1.900 ml = 1 l 900 ml. Jumlahnya 6 l + 1 l 900 ml = 7 l 900 ml." }),
  A({ level: "Sangat menantang", prompt: "Sebuah bingkai foto berbentuk persegi panjang dengan lubang di tengahnya. Hitung luas bagian bingkai yang diarsir.", scene: polys(rect(10, 7, 1, 1, 8, 5, [3, 2, 4, 3])), parts: [fill("8 × 5 − 4 × 3 = □ − □ = □ cm²", 40, 12, 28)], explanation: "Seluruh persegi panjang 8 × 5 = 40 cm². Lubangnya 4 × 3 = 12 cm². Bingkainya 40 − 12 = 28 cm²." }),
  B({ level: "Sangat menantang", prompt: "Setiap kubus volumenya 1 cm³. Bandingkan volume kedua bangun.", scene: cubes({ label: "K", heights: [[3, 2, 1], [3, 2, 1]] }, { label: "L", heights: [[1, 1], [2, 2], [2, 2]] }), parts: [fill("K □ cm³, L □ cm³", 12, 10), { kind: "choice", label: "Selisihnya:", options: ["1 cm³", "2 cm³", "3 cm³"], answer: "2 cm³" }], explanation: "K: setiap baris 3 + 2 + 1 = 6, dua baris = 12 cm³. L: baris depan 1 + 1, dua baris belakang 2 + 2 + 2 + 2, jumlahnya 10 cm³. Selisihnya 2 cm³." }),
  A({ level: "Sangat menantang", prompt: "Tentukan luas bangun yang diarsir. Setiap persegi berukuran 1 cm × 1 cm.", scene: polys({ rows: ["a####", "#####", "####d"] }), parts: [fill("Luas = □ cm²", 14)], explanation: "Ada 15 petak; 13 di antaranya penuh dan 2 setengah persegi. 13 + 1 = 14 cm²." }),
  B({ level: "Sangat menantang", prompt: "Olivia membeli 7 l 500 ml susu. Siang hari ia meminum 3 l 700 ml. Berapa susu yang tersisa?", parts: [fill("Sisa = □ l □ ml", 3, 800)], explanation: "500 ml kurang dari 700 ml, jadi pinjam 1 l: 6 l 1.500 ml − 3 l 700 ml = 3 l 800 ml." }),
  A({ level: "Sangat menantang", prompt: "Urutkan bangun dari yang luasnya paling kecil.", scene: polys({ label: "A", rows: ["###", "###"] }, { label: "B", rows: ["a##", "###", "##d"] }, { label: "C", rows: ["####", "#..."] }, { label: "D", rows: ["#####", "#####"] }), parts: [{ kind: "rank", label: "Ketuk dari yang paling kecil:", items: [{ label: "A", value: 6 }, { label: "B", value: 8 }, { label: "C", value: 5 }, { label: "D", value: 10 }], dir: "naik" }], explanation: "C = 5, A = 6, B = 7 persegi penuh + 2 setengah persegi = 8, D = 2 × 5 = 10. Urutannya C, A, B, D." }),
  B({ level: "Sangat menantang", prompt: "Tarik garis dari setiap volume ke volume yang sama.", parts: [{ kind: "match", left: ["1 m³", "250 cm³", "5.000 ml", "3 l"], right: ["5 l", "3.000 ml", "1.000 l", "250 ml"], answer: [2, 3, 0, 1] }], explanation: "1 m³ = 1.000 l. 1 cm³ = 1 ml, jadi 250 cm³ = 250 ml. 5.000 ml = 5 l. 3 l = 3.000 ml." }),
];
