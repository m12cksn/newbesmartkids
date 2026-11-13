/**
 * Kelas 1 Bab 1 - Ayo Membilang sampai dengan 10 (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 1-40).
 * A. Menghitung, Membaca, dan Menulis Bilangan  B. Membandingkan Banyak Benda
 * C. Menghitung Maju dan Mundur  D. Pasangan Bilangan
 * Bentuk soal mengikuti buku: tulis lambang bilangan, pasangkan (tarik garis), warnai sesuai permintaan,
 * lingkari/warnai kelompok, lengkapi urutan (daun, ulat), hubungkan titik, dan pasangan bilangan.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Thing =
  | "apel" | "jeruk" | "mangga" | "rambutan" | "salak" | "balon" | "layang" | "pensil" | "buku" | "penghapus" | "penggaris"
  | "bola" | "kelereng" | "mobil" | "boneka" | "pesawat" | "donat" | "bolu" | "sepeda" | "burung" | "kursi" | "kubus";
export const thingName: Record<Thing, string> = {
  apel: "apel", jeruk: "jeruk", mangga: "mangga", rambutan: "rambutan", salak: "salak", balon: "balon", layang: "layang-layang", pensil: "pensil",
  buku: "buku", penghapus: "penghapus", penggaris: "penggaris", bola: "bola", kelereng: "kelereng", mobil: "mobil-mobilan", boneka: "boneka kelinci",
  pesawat: "pesawat mainan", donat: "donat", bolu: "kue bolu", sepeda: "sepeda", burung: "burung", kursi: "kursi", kubus: "kubus",
};
export const numberWords = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh"];
export const syllables = ["nol", "sa-tu", "du-a", "ti-ga", "em-pat", "li-ma", "e-nam", "tu-juh", "de-la-pan", "sem-bi-lan", "se-pu-luh"];

/** Kumpulan benda; `split` membuat dua warna/kelompok (misalnya 4 merah + 2 biru) untuk pasangan bilangan. */
export type Group = { thing: Thing; n: number; split?: number; label?: string; big?: boolean };
export type Item =
  | { t: "objs"; g: Group }
  | { t: "frame"; n: number }
  | { t: "num"; n: number }
  | { t: "word"; w: string }
  | { t: "hand"; fingers: number[] };
export type Scene =
  | { type: "objs"; g: Group }
  | { type: "groups"; groups: Group[] }
  | { type: "frames"; ns: number[] }
  | { type: "hands"; sets: number[][] }
  | { type: "shelf"; items: Group[] }
  | { type: "pairs"; left: Group; right: Group }
  | { type: "story"; people: { name: string; thing: Thing; n: number }[] };

export type Part =
  | { kind: "num"; label: string; value: number; thing?: Thing }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "match"; left: Item[]; right: Item[]; answer: number[] }
  | { kind: "color"; label: string; n: number; total: number; color: "merah" | "biru" | "kuning" }
  | { kind: "pick"; label: string; groups: Group[]; answer: number; mark: "lingkari" | "warnai" }
  | { kind: "seq"; cells: (number | null)[]; answers: number[]; shape: "daun" | "ulat" }
  /** Pasangan bilangan; `hide` menandai bagian yang diisi siswa: [utuh, bagian 1, bagian 2]. */
  | { kind: "bond"; whole: number; parts: [number, number]; hide: [boolean, boolean, boolean] }
  /** Beberapa pasangan berbeda untuk satu bilangan (jawaban terbuka, diperiksa dengan aturan). */
  | { kind: "bonds"; whole: number; k: number }
  /** Pohon pasangan: utuh -> (g1, X1), X1 -> (X2, g2), X2 -> (X3, g3). */
  | { kind: "chain"; whole: number; given: [number, number, number] }
  | { kind: "dots"; n: number; shape: "bintang" };

export type KQuestion = Question & { topic: 0 | 1 | 2 | 3; level?: Level; scene?: Scene; parts: Part[] };

/* ---------- Kunci dan pemeriksaan ---------- */
export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) =>
  p.kind === "match" ? p.left.length : p.kind === "seq" ? p.answers.length : p.kind === "bond" ? p.hide.filter(Boolean).length
    : p.kind === "bonds" ? p.k * 2 : p.kind === "chain" ? 3 : 1;
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const bondValues = (p: Extract<Part, { kind: "bond" }>) => [p.whole, p.parts[0], p.parts[1]].filter((_, i) => p.hide[i]);
export const chainValues = (p: Extract<Part, { kind: "chain" }>) => { const x1 = p.whole - p.given[0], x2 = x1 - p.given[1], x3 = x2 - p.given[2]; return [x1, x2, x3]; };
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [String(p.value)];
    case "choice": return [p.answer];
    case "match": return p.answer.map(String);
    case "color": return [Array.from({ length: p.n }, (_, i) => i).join(",")];
    case "pick": return [String(p.answer)];
    case "seq": return p.answers.map(String);
    case "bond": return bondValues(p).map(String);
    case "bonds": return Array.from({ length: p.k }, (_, i) => [String(i + 1), String(p.whole - i - 1)]).flat();
    case "chain": return chainValues(p).map(String);
    case "dots": return [Array.from({ length: p.n }, (_, i) => i + 1).join(",")];
  }
}
const isNum = (s: string) => /^\d{1,2}$/.test(s);
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "color": return v !== "" && new Set(v.split(",")).size === p.n;
    case "bond": {
      if (p.hide[1] && p.hide[2]) { // kedua bagian kosong: urutan boleh dibalik
        const off = p.hide[0] ? 1 : 0;
        if (p.hide[0] && Number(x[0]) !== p.whole) return false;
        const got = [Number(x[off]), Number(x[off + 1])].sort((a, b) => a - b), want = [...p.parts].sort((a, b) => a - b);
        return x.every(isNum) && got[0] === want[0] && got[1] === want[1];
      }
      return x.every(isNum) && x.join("|") === fields(p).join("|");
    }
    case "bonds": {
      if (!x.every(isNum)) return false;
      const pairs = Array.from({ length: p.k }, (_, i) => [Number(x[2 * i]), Number(x[2 * i + 1])]);
      if (!pairs.every(([a, b]) => a >= 1 && b >= 1 && a + b === p.whole)) return false;
      return new Set(pairs.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`)).size === p.k;
    }
    case "num": case "seq": case "chain": return x.every(isNum) && x.map(Number).join("|") === fields(p).join("|");
    default: return x.join("|") === fields(p).join("|");
  }
}
function partReady(p: Part, v: string): boolean {
  const x = cells(p, v);
  if (p.kind === "dots") return v.split(",").filter(Boolean).length === p.n;
  if (p.kind === "color" || p.kind === "pick" || p.kind === "choice") return v !== "";
  return x.every(c => c !== "");
}
export const correct = (q: KQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: KQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const itemText = (it: Item) => it.t === "objs" ? `${it.g.n} ${thingName[it.g.thing]}` : it.t === "frame" ? `bingkai ${it.n}` : it.t === "num" ? String(it.n) : it.t === "word" ? it.w : `${it.fingers.reduce((a, b) => a + b, 0)} jari`;
export function formatAnswer(q: KQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "num": return `${p.label} ${v[i] || "…"}`;
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "match": return p.left.map((l, k) => `${itemText(l)} → ${x[k] === "" ? "…" : itemText(p.right[Number(x[k])])}`).join("; ");
      case "color": return `${v[i] ? v[i].split(",").length : 0} bola diwarnai ${p.color}`;
      case "pick": return `${p.mark === "lingkari" ? "Dilingkari" : "Diwarnai"}: ${v[i] === "" ? "…" : p.groups[Number(v[i])]?.label ?? "…"}`;
      case "seq": { let k = 0; return p.cells.map(c => (c === null ? x[k++] || "…" : String(c))).join(", "); }
      case "bond": { const w = [p.whole, ...p.parts].map(String); let k = 0; const f = w.map((s, j) => (p.hide[j] ? x[k++] || "…" : s)); return `${f[0]} → ${f[1]} dan ${f[2]}`; }
      case "bonds": return Array.from({ length: p.k }, (_, j) => `${p.whole} → ${x[2 * j] || "…"} dan ${x[2 * j + 1] || "…"}`).join("; ");
      case "chain": return `${p.whole} → ${p.given[0]} dan ${x[0] || "…"}; ${x[0] || "…"} → ${x[1] || "…"} dan ${p.given[1]}; ${x[1] || "…"} → ${x[2] || "…"} dan ${p.given[2]}`;
      case "dots": return v[i] ? `Urutan titik: ${v[i].split(",").join(", ")}` : "…";
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
const q = (topic: KQuestion["topic"], prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): KQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, thing?: Thing): Part => ({ kind: "num", label, value, thing });
const g = (thing: Thing, count: number, extra: Partial<Group> = {}): Group => ({ thing, n: count, ...extra });
const objs = (thing: Thing, count: number, split?: number): Item => ({ t: "objs", g: { thing, n: count, split } });
const MORE = ["A", "B"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export const topics: { code: string; title: string; short: string; sections: Section[] }[] = [
  { code: "A", title: "Menghitung, Membaca, dan Menulis Bilangan", short: "Menghitung dan menulis", sections: [
    { title: "Bingkai 10", lab: "frame", steps: [
      "Hitung benda satu per satu. Tunjuk setiap benda sekali saja.",
      "Setiap benda diberi satu bulatan pada bingkai 10. Baris atas diisi dulu sampai 5, lalu baris bawah.",
      "Bilangan terakhir yang kita sebut adalah banyak benda. Tulis lambang bilangannya: 1, 2, 3, … sampai 10.",
      "Baca bilangannya per suku kata: sa-tu, du-a, ti-ga, em-pat, li-ma, e-nam, tu-juh, de-la-pan, sem-bi-lan, se-pu-luh.",
    ], example: "Ada 7 layang-layang. Bingkai 10 terisi 5 di atas dan 2 di bawah. Lambang bilangannya 7, dibaca tu-juh.",
      demo: "Tambahkan benda satu per satu. Lihat bingkai 10, lambang bilangan, dan cara membacanya berubah." },
    { title: "Jari tangan dan bilangan nol", lab: "hands", steps: [
      "Jari tangan dapat menunjukkan bilangan. Satu tangan punya 5 jari, dua tangan punya 10 jari.",
      "Satu bilangan dapat ditunjukkan dengan cara berbeda. Bilangan 6 bisa 5 jari dan 1 jari, atau 3 jari dan 3 jari.",
      "Keranjang yang tidak berisi bola menunjukkan bilangan 0. Angka 0 dibaca nol.",
      "Tangan yang mengepal tidak menunjukkan jari, artinya 0.",
    ], demo: "Ketuk jari untuk mengangkat atau menurunkannya. Coba tunjukkan 7 dengan dua cara yang berbeda." },
  ] },
  { code: "B", title: "Membandingkan Banyak Benda", short: "Membandingkan", sections: [
    { title: "Pasangkan satu-satu", lab: "pair", steps: [
      "Pasangkan setiap benda di kiri dengan satu benda di kanan menggunakan garis.",
      "Jika semua benda punya pasangan, jumlahnya sama banyak.",
      "Jika ada benda yang tidak punya pasangan, kelompok itu lebih banyak.",
      "Kelompok yang bendanya habis lebih dulu adalah kelompok yang lebih sedikit.",
    ], example: "5 kursi dan 4 sepeda: satu kursi tidak punya pasangan. Jumlah kursi lebih banyak dari jumlah sepeda.",
      demo: "Ubah banyak sepeda dan burung. Garis memasangkan satu-satu, lalu lihat kelompok mana yang lebih banyak." },
    { title: "Lebih banyak dan lebih sedikit", lab: "compare", steps: [
      "Hitung banyak benda pada setiap kotak.",
      "Bilangan yang lebih besar menunjukkan benda yang lebih banyak.",
      "Bilangan yang lebih kecil menunjukkan benda yang lebih sedikit.",
      "Susunan benda tidak mengubah banyaknya. Benda yang besar belum tentu lebih banyak.",
    ], demo: "Ketuk kotak yang bendanya lebih banyak. Setiap ronde memakai benda dan susunan yang berbeda." },
  ] },
  { code: "C", title: "Menghitung Maju dan Mundur", short: "Maju dan mundur", sections: [
    { title: "Naik tangga: menghitung maju", lab: "up", steps: [
      "Menghitung maju dimulai dari bilangan kecil ke bilangan besar.",
      "Langkahnya sama: setiap kali bertambah satu.",
      "Setelah 1 adalah 2, setelah 2 adalah 3, dan seterusnya sampai 10.",
    ], example: "Upe naik tangga: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.",
      demo: "Ketuk “Naik satu” untuk membawa Upe ke anak tangga berikutnya sambil menyebut bilangannya." },
    { title: "Turun tangga: menghitung mundur", lab: "down", steps: [
      "Menghitung mundur dimulai dari bilangan besar ke bilangan kecil.",
      "Langkahnya sama: setiap kali berkurang satu.",
      "Sebelum 10 adalah 9, sebelum 9 adalah 8, dan seterusnya sampai 1.",
    ], example: "Upe turun tangga: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.",
      demo: "Ketuk “Turun satu” untuk membawa Upe turun sambil menyebut bilangan dari 10 ke 1." },
  ] },
  { code: "D", title: "Pasangan Bilangan", short: "Pasangan bilangan", sections: [
    { title: "Memisahkan dan menggabungkan", lab: "split", steps: [
      "Satu bilangan bisa dipisahkan menjadi dua bagian. 5 kue: 2 donat dan 3 kue bolu.",
      "Dua bilangan bisa digabungkan menjadi satu. 3 bola hijau dan 4 bola merah menjadi 7 bola.",
      "Gambar pasangan bilangan: lingkaran besar untuk bilangan utuh, dua lingkaran kecil untuk bagiannya.",
    ], example: "7 → 3 dan 4. Jika 3 dan 4 digabung, kembali menjadi 7.",
      demo: "Ketuk kelereng untuk memindahkannya ke piring lain. Lihat pasangan bilangannya berubah." },
    { title: "Semua pasangan sebuah bilangan", lab: "ways", steps: [
      "Satu bilangan punya banyak pasangan. 8 → 1 dan 7, 2 dan 6, 3 dan 5, 4 dan 4.",
      "Jika satu bagian bertambah 1, bagian lain berkurang 1, jumlahnya tetap.",
      "Jika satu bagian sudah diketahui, hitung maju dari bagian itu sampai bilangan utuh untuk menemukan bagian lainnya.",
    ], demo: "Pilih bilangan, lalu geser pemisah balok. Setiap pasangan baru dicatat sampai semuanya ditemukan." },
  ] },
];

/* ---------- Latihan: 4 soal per subtopik ---------- */
export const practice: KQuestion[][] = [
  [
    q(0, "Hitunglah banyak layang-layang. Tulis lambang bilangannya.", [n("Banyak layang-layang:", 6)], "Ada 6 layang-layang: 5 di baris atas dan 1 di baris bawah. Lambang bilangannya 6, dibaca e-nam.", { scene: { type: "objs", g: g("layang", 6) } }),
    q(0, "Pasangkan benda dengan bingkai 10 yang sama banyak.", [{ kind: "match", left: [objs("buku", 4), objs("penghapus", 3), objs("penggaris", 5), objs("bola", 2)], right: [{ t: "frame", n: 2 }, { t: "frame", n: 5 }, { t: "frame", n: 4 }, { t: "frame", n: 3 }], answer: [2, 3, 1, 0] }],
      "4 buku ↔ bingkai berisi 4, 3 penghapus ↔ 3, 5 penggaris ↔ 5, 2 bola ↔ 2."),
    q(0, "Warnai sesuai permintaan: 5 bola warna merah.", [{ kind: "color", label: "5 bola warna merah", n: 5, total: 7, color: "merah" }], "Ketuk 5 bola saja. Dua bola lainnya tetap tidak berwarna."),
    q(0, "Hitung banyak jari pada gambar. Tulis lambang bilangannya.", [n("Gambar a:", 6), n("Gambar b:", 0)], "Gambar a: 5 jari dan 1 jari, jadi 6. Gambar b: tangan mengepal, tidak ada jari terangkat, jadi 0.", { scene: { type: "hands", sets: [[5, 1], [0]] } }),
  ],
  [
    q(1, "Bandingkan banyak benda.", [{ kind: "choice", label: "Benda mana yang jumlahnya lebih banyak?", options: MORE, answer: "B" }, { kind: "choice", label: "Benda mana yang jumlahnya lebih sedikit?", options: MORE, answer: "A" }],
      "A: 3 apel. B: 4 jeruk. 4 lebih banyak dari 3.", { scene: { type: "groups", groups: [g("apel", 3, { label: "A" }), g("jeruk", 4, { label: "B" })] } }),
    q(1, "Apakah jumlah benda pada kotak A dan B sama banyak?", [{ kind: "choice", label: "Jawaban:", options: ["Ya, sama banyak", "Tidak sama banyak"], answer: "Ya, sama banyak" }],
      "A: 7 kue bolu. B: 7 donat. Keduanya 7, jadi sama banyak walaupun susunannya berbeda.", { scene: { type: "groups", groups: [g("bolu", 7, { label: "A" }), g("donat", 7, { label: "B" })] } }),
    q(1, "Lingkari benda yang jumlahnya lebih banyak.", [{ kind: "pick", label: "Ketuk kotak yang bendanya lebih banyak.", groups: [g("pensil", 6, { label: "Kotak kiri" }), g("pensil", 5, { label: "Kotak kanan" })], answer: 0, mark: "lingkari" }],
      "Kotak kiri 6 pensil, kotak kanan 5 pensil. 6 lebih banyak."),
    q(1, "Kira mempunyai 4 pensil. Tika mempunyai 5 pensil.", [{ kind: "choice", label: "Siapa yang mempunyai pensil lebih banyak?", options: ["Kira", "Tika"], answer: "Tika" }],
      "Pasangkan pensil Kira dan Tika satu-satu. Satu pensil Tika tidak punya pasangan, jadi Tika lebih banyak.", { scene: { type: "story", people: [{ name: "Kira", thing: "pensil", n: 4 }, { name: "Tika", thing: "pensil", n: 5 }] } }),
  ],
  [
    q(2, "Lengkapi urutan bilangan berikut.", [{ kind: "seq", shape: "daun", cells: [1, 2, null], answers: [3] }, { kind: "seq", shape: "daun", cells: [4, 5, null], answers: [6] }, { kind: "seq", shape: "daun", cells: [6, null, 8], answers: [7] }],
      "Menghitung maju bertambah satu: 1, 2, 3; 4, 5, 6; 6, 7, 8."),
    q(2, "Lengkapi bilangan mulai dari 1 sampai 10.", [{ kind: "seq", shape: "ulat", cells: [1, 2, null, 4, null, null, 7, 8, null, 10], answers: [3, 5, 6, 9] }], "1, 2, 3, 4, 5, 6, 7, 8, 9, 10."),
    q(2, "Lengkapi bilangan mulai dari 10 sampai 1.", [{ kind: "seq", shape: "ulat", cells: [10, 9, null, 7, null, 5, null, null, 2, 1], answers: [8, 6, 4, 3] }], "Menghitung mundur berkurang satu: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1."),
    q(2, "Upe naik tangga mulai dari anak tangga ke-3. Lanjutkan hitung majunya.", [{ kind: "seq", shape: "daun", cells: [3, null, null, 6, null], answers: [4, 5, 7] }], "3, 4, 5, 6, 7."),
  ],
  [
    q(3, "Temukan pasangan bilangan berikut.", [{ kind: "bond", whole: 8, parts: [5, 3], hide: [false, false, true] }],
      "Ada 5 mangga dan 3 rambutan. 8 → 5 dan 3.", { scene: { type: "groups", groups: [g("mangga", 5), g("rambutan", 3)] } }),
    q(3, "Temukan pasangan bilangan berikut.", [{ kind: "bond", whole: 9, parts: [4, 5], hide: [false, true, true] }],
      "Ada 4 jeruk dan 5 salak. 9 → 4 dan 5.", { scene: { type: "groups", groups: [g("jeruk", 4), g("salak", 5)] } }),
    q(3, "Pasangkan dua bilangan yang jumlahnya 5.", [{ kind: "match", left: [1, 2, 3, 4].map(k => ({ t: "num", n: k }) as Item), right: [3, 1, 4, 2].map(k => ({ t: "num", n: k }) as Item), answer: [2, 0, 3, 1] }],
      "1 dan 4, 2 dan 3, 3 dan 2, 4 dan 1. Setiap pasangan jumlahnya 5."),
    q(3, "Ada 6 kue bolu. Pisahkan menjadi dua kelompok. Tulis pasangan bilangannya.", [{ kind: "bonds", whole: 6, k: 1 }],
      "Pasangan 6 adalah 1 dan 5, 2 dan 4, atau 3 dan 3. Jawaban mana pun dari pasangan itu benar.", { scene: { type: "objs", g: g("bolu", 6) } }),
  ],
];

/* ---------- Evaluasi: 24 soal, A B C D bergantian ---------- */
export const assessment: KQuestion[] = [
  // Sedang (1-8)
  q(0, "Hitunglah banyak benda berikut. Tulis lambang bilangannya.", [n("Bingkai kiri:", 7), n("Bingkai kanan:", 10)],
    "Bingkai kiri: 5 di atas dan 2 di bawah, jadi 7. Bingkai kanan penuh, jadi 10.", { level: "Sedang", scene: { type: "frames", ns: [7, 10] } }),
  q(1, "Perhatikan buah pada kotak A dan B.", [{ kind: "choice", label: "Buah mana yang jumlahnya lebih banyak?", options: MORE, answer: "A" }, { kind: "choice", label: "Buah mana yang jumlahnya lebih sedikit?", options: MORE, answer: "B" }],
    "A: 5 mangga. B: 3 jeruk. 5 lebih banyak dari 3.", { level: "Sedang", scene: { type: "groups", groups: [g("mangga", 5, { label: "A" }), g("jeruk", 3, { label: "B" })] } }),
  q(2, "Lengkapi urutan bilangan berikut.", [{ kind: "seq", shape: "daun", cells: [2, 3, null], answers: [4] }, { kind: "seq", shape: "daun", cells: [5, null, 7], answers: [6] }, { kind: "seq", shape: "daun", cells: [9, null, 7], answers: [8] }],
    "2, 3, 4 (maju). 5, 6, 7 (maju). 9, 8, 7 (mundur).", { level: "Sedang" }),
  q(3, "Temukan pasangan bilangan berikut.", [{ kind: "bond", whole: 6, parts: [4, 2], hide: [false, true, true] }],
    "Ada 4 mobil merah dan 2 mobil biru. 6 → 4 dan 2.", { level: "Sedang", scene: { type: "objs", g: g("mobil", 6, { split: 4 }) } }),
  q(0, "Hitung banyak jari pada gambar. Tulis lambang bilangannya.", [n("Gambar a:", 8), n("Gambar b:", 4)],
    "Gambar a: 5 jari dan 3 jari, jadi 8. Gambar b: 4 jari.", { level: "Sedang", scene: { type: "hands", sets: [[5, 3], [4]] } }),
  q(1, "Warnai benda yang jumlahnya lebih sedikit.", [{ kind: "pick", label: "Ketuk kotak yang bendanya lebih sedikit.", groups: [g("bola", 6, { label: "Kotak bola" }), g("apel", 4, { label: "Kotak apel" })], answer: 1, mark: "warnai" }],
    "Bola ada 6, apel ada 4. 4 lebih sedikit dari 6, jadi kotak apel yang diwarnai.", { level: "Sedang" }),
  q(2, "Lengkapi bilangan mulai dari 1 sampai 10.", [{ kind: "seq", shape: "ulat", cells: [1, null, 3, null, 5, 6, null, null, 9, 10], answers: [2, 4, 7, 8] }], "1, 2, 3, 4, 5, 6, 7, 8, 9, 10.", { level: "Sedang" }),
  q(3, "Temukan pasangan bilangan berikut.", [{ kind: "bond", whole: 7, parts: [4, 3], hide: [false, false, true] }],
    "Ada 4 apel dan 3 jeruk. 7 → 4 dan 3.", { level: "Sedang", scene: { type: "groups", groups: [g("apel", 4), g("jeruk", 3)] } }),
  // Menantang (9-17)
  q(0, "Hitunglah banyak benda berikut. Pasangkan dengan bilangannya.", [{ kind: "match", left: [objs("balon", 3), objs("pensil", 8), { t: "objs", g: { thing: "bola", n: 0, label: "keranjang kosong" } }, objs("buku", 6), objs("kelereng", 9)], right: [6, 0, 9, 3, 8].map(k => ({ t: "num", n: k }) as Item), answer: [3, 4, 1, 0, 2] }],
    "3 balon ↔ 3, 8 pensil ↔ 8, keranjang kosong ↔ 0, 6 buku ↔ 6, 9 kelereng ↔ 9.", { level: "Menantang" }),
  q(1, "Kira mempunyai 8 pensil. Tika mempunyai 6 pensil.", [{ kind: "choice", label: "Siapa yang mempunyai pensil lebih banyak?", options: ["Kira", "Tika"], answer: "Kira" }, { kind: "choice", label: "Siapa yang mempunyai pensil lebih sedikit?", options: ["Kira", "Tika"], answer: "Tika" }],
    "Pasangkan satu-satu: dua pensil Kira tidak punya pasangan. Kira lebih banyak, Tika lebih sedikit.", { level: "Menantang", scene: { type: "story", people: [{ name: "Kira", thing: "pensil", n: 8 }, { name: "Tika", thing: "pensil", n: 6 }] } }),
  q(2, "Lengkapi bilangan mulai dari 10 sampai 1.", [{ kind: "seq", shape: "ulat", cells: [10, null, 8, null, 6, 5, null, null, 2, 1], answers: [9, 7, 4, 3] }], "10, 9, 8, 7, 6, 5, 4, 3, 2, 1.", { level: "Menantang" }),
  q(3, "Pasangkan dua bilangan yang jumlahnya 6.", [{ kind: "match", left: [5, 4, 3, 2, 1].map(k => ({ t: "num", n: k }) as Item), right: [2, 4, 5, 1, 3].map(k => ({ t: "num", n: k }) as Item), answer: [3, 0, 4, 1, 2] }],
    "5 dan 1, 4 dan 2, 3 dan 3, 2 dan 4, 1 dan 5. Setiap pasangan jumlahnya 6.", { level: "Menantang" }),
  q(0, "Warnai sesuai permintaan.", [{ kind: "color", label: "6 bola warna merah", n: 6, total: 8, color: "merah" }, { kind: "color", label: "8 bola warna biru", n: 8, total: 9, color: "biru" }],
    "Baris pertama: 6 bola merah, 2 tidak berwarna. Baris kedua: 8 bola biru, 1 tidak berwarna.", { level: "Menantang" }),
  q(1, "Pasangkan sepeda dan burung satu-satu.", [{ kind: "choice", label: "Jumlah sepeda … jumlah burung.", options: ["lebih banyak dari", "lebih sedikit dari", "sama banyak dengan"], answer: "lebih sedikit dari" }],
    "4 sepeda dan 6 burung. Dua burung tidak punya pasangan, jadi jumlah sepeda lebih sedikit dari jumlah burung.", { level: "Menantang", scene: { type: "pairs", left: g("sepeda", 4), right: g("burung", 6) } }),
  q(2, "Lanjutkan hitung maju.", [{ kind: "seq", shape: "daun", cells: [4, null, 6, null, null, 9, null], answers: [5, 7, 8, 10] }], "4, 5, 6, 7, 8, 9, 10.", { level: "Menantang" }),
  q(3, "Temukan pasangan bilangan berikut.", [{ kind: "bond", whole: 8, parts: [6, 2], hide: [true, false, false] }],
    "Ada 6 salak dan 2 rambutan. 6 dan 2 digabung menjadi 8.", { level: "Menantang", scene: { type: "groups", groups: [g("salak", 6), g("rambutan", 2)] } }),
  q(0, "Ayo bantu Wei menghitung mainan di toko.", [n("Ada … boneka kelinci", 5, "boneka"), n("Ada … mobil-mobilan", 7, "mobil"), n("Ada … pesawat mainan", 3, "pesawat")],
    "Hitung setiap jenis mainan satu per satu: 5 boneka kelinci, 7 mobil-mobilan, dan 3 pesawat.", { level: "Menantang", scene: { type: "shelf", items: [g("boneka", 5), g("mobil", 7), g("pesawat", 3)] } }),
  // Sangat menantang (18-24)
  q(1, "Lingkari benda yang jumlahnya lebih banyak.", [{ kind: "pick", label: "Ketuk kotak yang bendanya lebih banyak.", groups: [g("kelereng", 9, { label: "Kotak kiri" }), g("bola", 8, { label: "Kotak kanan", big: true })], answer: 0, mark: "lingkari" }],
    "Kotak kiri 9 kelereng kecil, kotak kanan 8 bola besar. Bola lebih besar, tetapi 9 lebih banyak dari 8.", { level: "Sangat menantang" }),
  q(2, "Hubungkan bilangan mulai dari 1 sampai 10 secara berurutan.", [{ kind: "dots", n: 10, shape: "bintang" }, { kind: "choice", label: "Gambar apa yang kalian temukan?", options: ["Rumah", "Bintang", "Ikan"], answer: "Bintang" }],
    "Titik 1 sampai 10 dihubungkan berurutan membentuk bintang.", { level: "Sangat menantang" }),
  q(3, "Temukan 3 pasangan bilangan yang berbeda untuk 8.", [{ kind: "bonds", whole: 8, k: 3 }],
    "Pasangan 8: 1 dan 7, 2 dan 6, 3 dan 5, 4 dan 4. Pilih tiga yang berbeda.", { level: "Sangat menantang" }),
  q(0, "Pasangkan lambang bilangan dengan namanya.", [{ kind: "match", left: [9, 6, 0, 7, 4].map(k => ({ t: "num", n: k }) as Item), right: ["Tujuh", "Nol", "Delapan", "Empat", "Sembilan", "Enam"].map(w => ({ t: "word", w }) as Item), answer: [4, 5, 1, 0, 3] }],
    "9 sembilan, 6 enam, 0 nol, 7 tujuh, 4 empat. Delapan tidak dipakai.", { level: "Sangat menantang" }),
  q(1, "Kotak mana yang banyak bendanya sama dengan banyak jari ini?", [{ kind: "pick", label: "Ketuk kotak yang sama banyak.", groups: [g("layang", 6, { label: "Kotak A" }), g("donat", 7, { label: "Kotak B" }), g("bolu", 8, { label: "Kotak C" })], answer: 1, mark: "lingkari" }],
    "Jari: 5 dan 2, jadi 7. Kotak B berisi 7 donat.", { level: "Sangat menantang", scene: { type: "hands", sets: [[5, 2]] } }),
  q(2, "Lanjutkan hitung mundur.", [{ kind: "seq", shape: "daun", cells: [7, null, null, 4, null, 2, null], answers: [6, 5, 3, 1] }], "7, 6, 5, 4, 3, 2, 1.", { level: "Sangat menantang" }),
  q(3, "Malosi mempunyai 9 kelereng. Ia memisahkan kelerengnya menjadi 2 kelompok, lalu memisahkan lagi kelompok itu. Bantu Malosi.", [{ kind: "chain", whole: 9, given: [4, 2, 1] }],
    "9 → 4 dan 5. 5 → 3 dan 2. 3 → 2 dan 1.", { level: "Sangat menantang" }),
];

export const sources = { numberWords };
