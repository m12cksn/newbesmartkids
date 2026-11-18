/**
 * Kelas 1 Bab 2 - Penjumlahan sampai dengan 10 (Buku Siswa Matematika SD/MI Kelas I, Kurikulum Merdeka 2022, hlm. 41-74).
 * A. Cerita Penjumlahan  B. Berbagai Cara Melakukan Penjumlahan (pasangan bilangan, menghitung maju,
 * penjumlahan berulang, hasilnya 10)  C. Soal Cerita Penjumlahan.
 * Bentuk soal mengikuti buku: lengkapi kalimat, tulis operasi □ + □ = □, isi pasangan bilangan,
 * hitung maju di garis bilangan, lengkapi sayap kepik, isi bingkai 10, cari pasangan yang hasilnya tertentu,
 * dan soal cerita (termasuk menghitung roda kendaraan).
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type Thing =
  | "kelereng" | "mobil" | "bolu" | "kuelapis" | "bola" | "apel" | "boneka" | "kupu" | "pita" | "bebek" | "permen" | "mawar"
  | "burung" | "pensil" | "siswa" | "kepik" | "donat" | "ikan";
export const thingName: Record<Thing, string> = {
  kelereng: "kelereng", mobil: "mobil-mobilan", bolu: "bolu kukus", kuelapis: "kue lapis", bola: "bola", apel: "apel", boneka: "boneka kelinci",
  kupu: "kupu-kupu", pita: "pita", bebek: "bebek", permen: "permen lolipop", mawar: "bunga mawar", burung: "burung", pensil: "pensil",
  siswa: "siswa", kepik: "kepik", donat: "donat", ikan: "ikan",
};
export type Vehicle = "sepeda" | "becak" | "motor" | "mobilbesar";
export const vehicleName: Record<Vehicle, string> = { sepeda: "sepeda", becak: "becak", motor: "motor", mobilbesar: "mobil" };
export const wheels: Record<Vehicle, number> = { sepeda: 2, becak: 3, motor: 2, mobilbesar: 4 };

/** Satu kelompok benda; `alt` memberi warna kedua (misalnya kelereng biru). */
export type Grp = { thing: Thing; n: number; alt?: boolean; color?: string };
export type Scene =
  /** Dua kotak benda seperti di buku. */
  | { type: "boxes"; groups: [Grp, Grp] }
  /** Benda di dalam keranjang dan di luar keranjang. */
  | { type: "basket"; thing: Thing; inside: number; outside: number }
  /** Cerita: mula-mula ada a, datang lagi b. */
  | { type: "story"; thing: Thing; first: number; more: number; place: "pohon" | "kelas" | "kolam" | "meja" }
  | { type: "vehicles"; items: { kind: Vehicle; n: number }[] }
  /** Dua dadu/kartu bertitik. */
  | { type: "dots"; a: number; b: number };

export type Part =
  /** Kalimat atau operasi dengan kotak isian □. */
  | { kind: "fill"; text: string; answers: number[] }
  /** Pasangan bilangan: lingkaran gabungan dan dua lingkaran sebagian; null = harus diisi. */
  | { kind: "bond"; whole: number | null; parts: [number | null, number | null]; answers: number[] }
  /** Menghitung maju: ketuk bilangan tempat mendarat di garis bilangan. */
  | { kind: "hop"; start: number; steps: number }
  /** Penjumlahan berulang: lengkapi titik pada sayap kanan kepik. */
  | { kind: "wing"; n: number }
  /** Bingkai 10: ketuk petak kosong untuk mengisi dengan warna kedua (jawaban: daftar nomor petak). */
  | { kind: "ten"; filled: number; thing: Thing }
  /** Tulis beberapa pasangan berbeda yang hasilnya `sum`. */
  | { kind: "pairs"; sum: number; count: number }
  /** Pilih operasi yang sesuai gambar. */
  | { kind: "pick"; label: string; options: string[]; answer: string };
export type AQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
export const fieldCount = (p: Part) => (p.kind === "fill" || p.kind === "bond" ? p.answers.length : p.kind === "pairs" ? p.count * 2 : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": case "bond": return p.answers.join("|");
    case "hop": return String(p.start + p.steps);
    case "wing": return String(p.n);
    case "ten": return Array.from({ length: 10 - p.filled }, (_, i) => p.filled + i).join(",");
    case "pairs": return Array.from({ length: p.count }, (_, i) => `${i + 1}|${p.sum - i - 1}`).join("|");
    case "pick": return p.answer;
  }
}
/** Pasangan sah: setiap pasangan berjumlah `sum` dan tidak ada pasangan yang sama (urutan berbeda dianggap berbeda, seperti 4 + 5 dan 5 + 4 di buku). */
function pairsOk(p: Extract<Part, { kind: "pairs" }>, v: string) {
  const x = cells(p, v).map(num), seen = new Set<string>();
  for (let i = 0; i < p.count; i++) { const a = x[2 * i], b = x[2 * i + 1]; if (!(a >= 0 && b >= 0) || a + b !== p.sum || seen.has(`${a}+${b}`)) return false; seen.add(`${a}+${b}`); }
  return true;
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": case "bond": { const got = cells(p, v); return p.answers.every((a, i) => num(got[i]) === a); }
    case "pairs": return pairsOk(p, v);
    /* Petak yang diisi disimpan sebagai daftar nomor petak; yang dinilai banyaknya. */
    case "ten": { const x = v ? v.split(",").filter(Boolean) : []; return new Set(x).size === x.length && x.length === 10 - p.filled && x.every(k => Number(k) >= p.filled && Number(k) < 10); }
    default: return v === partKey(p);
  }
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill" || p.kind === "bond" || p.kind === "pairs") return cells(p, v).every(x => x.trim() !== "");
  return v !== "" && v !== "0";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: AQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: AQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: AQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "bond": { let k = 0; const f = (n: number | null) => (n === null ? x[k++] || "…" : String(n)); const w = f(p.whole); return `${f(p.parts[0])} dan ${f(p.parts[1])} menjadi ${w}`; }
      case "hop": return `${p.start} + ${p.steps} = ${v[i] || "…"}`;
      case "wing": return `${v[i] || 0} titik di sayap kanan`;
      case "ten": return `${v[i] ? v[i].split(",").length : 0} kelereng biru diisi`;
      case "pairs": return Array.from({ length: p.count }, (_, k) => `${x[2 * k] || "…"} + ${x[2 * k + 1] || "…"} = ${p.sum}`).join(", ");
      case "pick": return v[i] || "…";
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Topic = { code: string; title: string; short: string; lab: string; steps: string[]; demo: string };
export const topics: Topic[] = [
  { code: "A", title: "Cerita Penjumlahan", short: "Cerita", lab: "gabung", steps: [
    "Ada 4 anak bermain lompat tali. Datang lagi 2 anak. Sekarang ada 6 anak.",
    "Menjumlahkan artinya menggabungkan. Tanda tambah (+) dipakai untuk penjumlahan.",
    "Kita menulis 4 + 2 = 6 dan membacanya: empat ditambah dua hasilnya enam.",
  ], demo: "Ketuk tambah untuk mengisi kedua kotak, lalu ketuk Gabungkan." },
  { code: "B", title: "Berbagai Cara Melakukan Penjumlahan", short: "Berbagai cara", lab: "cara", steps: [
    "Pasangan bilangan: 3 dan 2 jika digabungkan menjadi 5. Jadi 3 + 2 = 5 dan 2 + 3 = 5.",
    "Menghitung maju: mulai dari 5, lompat 3 kali ke depan: 6, 7, 8. Jadi 5 + 3 = 8.",
    "Penjumlahan berulang: bilangan yang sama ditambahkan, seperti 3 + 3 = 6 pada sayap kepik.",
    "Hasilnya 10: isi bingkai 10. Ada 7 merah, isi 3 biru. Jadi 7 + 3 = 10.",
  ], demo: "Pilih caranya, lalu coba: pisahkan pasangan, lompat di garis bilangan, isi sayap kepik, atau penuhi bingkai 10." },
  { code: "C", title: "Soal Cerita Penjumlahan", short: "Soal cerita", lab: "cerita", steps: [
    "Baca ceritanya: Ada 4 burung di pohon. Datang lagi 2 burung.",
    "Cari bilangan yang digabung: 4 dan 2.",
    "Tulis penyelesaiannya: 4 + 2 = 6.",
    "Jawab dengan kalimat: Semuanya ada 6 burung.",
  ], demo: "Pilih benda dan banyaknya, baca ceritanya, lalu tebak hasilnya sebelum dibuka." },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): AQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B, C] = [make(0), make(1), make(2)];
const fill = (text: string, ...answers: number[]): Part => ({ kind: "fill", text, answers });
const boxes = (a: Grp, b: Grp): Scene => ({ type: "boxes", groups: [a, b] });
const bond = (whole: number | null, a: number | null, b: number | null, ...answers: number[]): Part => ({ kind: "bond", whole, parts: [a, b], answers });

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: AQuestion[][] = [
  [
    A({ prompt: "Lengkapilah kalimatnya.", scene: boxes({ thing: "mobil", n: 3 }, { thing: "mobil", n: 4, alt: true }), parts: [fill("Ada □ mobil merah.", 3), fill("Ada □ mobil biru.", 4), fill("Semuanya ada □ mobil.", 7)], explanation: "Hitung setiap kotak: 3 mobil merah dan 4 mobil biru. Digabung menjadi 3 + 4 = 7 mobil." }),
    A({ prompt: "Berapa semua bola?", scene: { type: "basket", thing: "bola", inside: 5, outside: 2 }, parts: [fill("Semuanya ada □ bola.", 7)], explanation: "Di dalam keranjang 5 bola, di luar 2 bola. 5 + 2 = 7 bola." }),
    A({ prompt: "Tulis operasi penjumlahannya.", scene: boxes({ thing: "boneka", n: 2 }, { thing: "boneka", n: 4 }), parts: [fill("□ + □ = 6", 2, 4)], explanation: "Kotak pertama 2 boneka, kotak kedua 4 boneka. 2 + 4 = 6." }),
    A({ prompt: "Pilih operasi yang cocok dengan gambar.", scene: boxes({ thing: "bebek", n: 5 }, { thing: "bebek", n: 3 }), parts: [{ kind: "pick", label: "Operasinya:", options: ["5 + 2 = 7", "5 + 3 = 8", "3 + 3 = 6"], answer: "5 + 3 = 8" }], explanation: "Ada 5 bebek dan 3 bebek. Digabung menjadi 5 + 3 = 8." }),
  ],
  [
    B({ prompt: "Isilah pasangan bilangan dari gambar bunga.", scene: boxes({ thing: "mawar", n: 3 }, { thing: "mawar", n: 4, alt: true }), parts: [bond(null, 3, 4, 7), fill("3 + 4 = □", 7)], explanation: "3 bunga merah dan 4 bunga kuning digabung menjadi 7. Jadi 3 + 4 = 7." }),
    B({ prompt: "Mulai dari 4, lompat 3 kali ke depan. Ketuk tempat mendarat.", parts: [{ kind: "hop", start: 4, steps: 3 }], explanation: "Dari 4 menghitung maju 3 kali: 5, 6, 7. Jadi 4 + 3 = 7." }),
    B({ prompt: "Lengkapi titik pada sayap kanan kepik, lalu tulis hasilnya.", parts: [{ kind: "wing", n: 3 }, fill("3 + 3 = □", 6)], explanation: "Sayap kiri ada 3 titik. Sayap kanan juga 3 titik. 3 + 3 = 6." }),
    B({ prompt: "Isi bingkai 10 sampai penuh dengan kelereng biru.", parts: [{ kind: "ten", filled: 6, thing: "kelereng" }, fill("6 + □ = 10", 4)], explanation: "Sudah ada 6 kelereng merah. Perlu 4 kelereng biru lagi agar penuh 10. 6 + 4 = 10." }),
  ],
  [
    C({ prompt: "Ada 3 burung di pohon. Datang lagi 4 burung. Berapa jumlah semua burung?", scene: { type: "story", thing: "burung", first: 3, more: 4, place: "pohon" }, parts: [fill("□ + □ = □", 3, 4, 7), fill("Semuanya ada □ burung.", 7)], explanation: "Mula-mula 3 burung, datang lagi 4. 3 + 4 = 7. Semuanya ada 7 burung." }),
    C({ prompt: "Halim mempunyai 2 pensil merah dan 5 pensil hijau. Berapa semua pensil Halim?", parts: [fill("□ + □ = □", 2, 5, 7), fill("Halim memiliki □ pensil.", 7)], explanation: "2 pensil merah dan 5 pensil hijau. 2 + 5 = 7 pensil." }),
    C({ prompt: "Ada 6 siswa di kelas. Datang lagi 2 siswa. Berapa semua siswa sekarang?", scene: { type: "story", thing: "siswa", first: 6, more: 2, place: "kelas" }, parts: [fill("□ + □ = □", 6, 2, 8), fill("Di kelas ada □ siswa.", 8)], explanation: "6 siswa ditambah 2 siswa. 6 + 2 = 8 siswa." }),
    C({ prompt: "Ada 2 sepeda dan 1 becak.", scene: { type: "vehicles", items: [{ kind: "sepeda", n: 2 }, { kind: "becak", n: 1 }] }, parts: [fill("Kendaraan: □ + □ = □", 2, 1, 3), fill("Roda: □ + □ = □", 4, 3, 7)], explanation: "Kendaraan: 2 + 1 = 3. Roda: 2 sepeda punya 4 roda, 1 becak punya 3 roda. 4 + 3 = 7 roda." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
export const assessment: AQuestion[] = [
  A({ level: "Sedang", prompt: "Lengkapilah kalimatnya.", scene: boxes({ thing: "kelereng", n: 4 }, { thing: "kelereng", n: 5, alt: true }), parts: [fill("Ada □ kelereng merah.", 4), fill("Ada □ kelereng hijau.", 5), fill("Semuanya ada □ kelereng.", 9)], explanation: "4 kelereng merah dan 5 kelereng hijau. 4 + 5 = 9 kelereng." }),
  B({ level: "Sedang", prompt: "Hitung dengan menghitung maju. Mulai dari 2, lompat 4 kali.", parts: [{ kind: "hop", start: 2, steps: 4 }], explanation: "Dari 2 menghitung maju 4 kali: 3, 4, 5, 6. Jadi 2 + 4 = 6." }),
  C({ level: "Sedang", prompt: "Ada 5 ikan di kolam. Datang lagi 3 ikan. Berapa semua ikan?", scene: { type: "story", thing: "ikan", first: 5, more: 3, place: "kolam" }, parts: [fill("□ + □ = □", 5, 3, 8), fill("Semuanya ada □ ikan.", 8)], explanation: "5 ikan ditambah 3 ikan. 5 + 3 = 8 ikan." }),
  A({ level: "Sedang", prompt: "Berapa semua kupu-kupu?", scene: boxes({ thing: "kupu", n: 5 }, { thing: "kupu", n: 2, alt: true }), parts: [fill("Semuanya ada □ kupu-kupu.", 7)], explanation: "5 kupu-kupu kuning dan 2 kupu-kupu ungu. 5 + 2 = 7." }),
  B({ level: "Sedang", prompt: "Hitung jumlah pita, lalu isi pasangan bilangannya.", scene: boxes({ thing: "pita", n: 2 }, { thing: "pita", n: 6, alt: true }), parts: [bond(null, 2, 6, 8), fill("2 + 6 = □", 8)], explanation: "2 pita biru dan 6 pita merah digabung menjadi 8." }),
  C({ level: "Sedang", prompt: "Ada 4 donat di meja. Ibu menaruh 4 donat lagi. Berapa semua donat?", scene: { type: "story", thing: "donat", first: 4, more: 4, place: "meja" }, parts: [fill("□ + □ = □", 4, 4, 8), fill("Semuanya ada □ donat.", 8)], explanation: "4 donat ditambah 4 donat. 4 + 4 = 8 donat." }),
  A({ level: "Sedang", prompt: "Tulis operasi penjumlahannya.", scene: boxes({ thing: "bolu", n: 3 }, { thing: "bolu", n: 3 }), parts: [fill("□ + □ = □", 3, 3, 6)], explanation: "Kotak pertama 3 bolu dan kotak kedua 3 bolu. Digabung menjadi 3 + 3 = 6." }),
  B({ level: "Sedang", prompt: "Lengkapi titik pada sayap kanan kepik, lalu tulis hasilnya.", parts: [{ kind: "wing", n: 4 }, fill("4 + 4 = □", 8)], explanation: "Sayap kiri 4 titik, sayap kanan juga 4 titik. 4 + 4 = 8." }),

  C({ level: "Menantang", prompt: "Ada 3 motor dan 1 mobil di parkiran.", scene: { type: "vehicles", items: [{ kind: "motor", n: 3 }, { kind: "mobilbesar", n: 1 }] }, parts: [fill("Kendaraan: □ + □ = □", 3, 1, 4), fill("Roda: □ + □ = □", 6, 4, 10)], explanation: "Kendaraan: 3 + 1 = 4. Roda: 3 motor punya 6 roda dan 1 mobil punya 4 roda. 6 + 4 = 10 roda." }),
  A({ level: "Menantang", prompt: "Tulis operasi penjumlahannya. Hasilnya sudah ditulis.", scene: boxes({ thing: "apel", n: 4 }, { thing: "apel", n: 5, alt: true }), parts: [fill("□ + □ = 9", 4, 5)], explanation: "Kotak pertama 4 apel merah, kotak kedua 5 apel hijau. 4 + 5 = 9." }),
  B({ level: "Menantang", prompt: "Isi bingkai 10 sampai penuh, lalu lengkapi operasinya.", parts: [{ kind: "ten", filled: 3, thing: "kelereng" }, fill("3 + □ = 10", 7)], explanation: "Ada 3 kelereng merah, perlu 7 lagi agar penuh. 3 + 7 = 10." }),
  C({ level: "Menantang", prompt: "Rani punya 6 permen. Kakak memberi 3 permen lagi. Hitung maju di garis bilangan, lalu jawab.", parts: [{ kind: "hop", start: 6, steps: 3 }, fill("Permen Rani ada □.", 9)], explanation: "Mulai dari 6, hitung maju 3 kali: 7, 8, 9. Jadi 6 + 3 = 9 permen." }),
  A({ level: "Menantang", prompt: "Pilih operasi yang cocok dengan gambar.", scene: boxes({ thing: "kuelapis", n: 2 }, { thing: "kuelapis", n: 5 }), parts: [{ kind: "pick", label: "Operasinya:", options: ["2 + 4 = 6", "5 + 3 = 8", "2 + 5 = 7"], answer: "2 + 5 = 7" }], explanation: "Kotak pertama 2 kue lapis dan kotak kedua 5 kue lapis. 2 + 5 = 7." }),
  B({ level: "Menantang", prompt: "Isi bilangan yang hilang pada pasangan bilangan.", parts: [bond(9, 5, null, 4), fill("5 + □ = 9", 4)], explanation: "Gabungannya 9 dan satu bagiannya 5. 5 + 4 = 9, jadi bagian yang lain 4." }),
  C({ level: "Menantang", prompt: "Ada 7 bebek di kolam. Datang lagi 2 bebek. Berapa semua bebek?", scene: { type: "story", thing: "bebek", first: 7, more: 2, place: "kolam" }, parts: [fill("□ + □ = □", 7, 2, 9), fill("Semuanya ada □ bebek.", 9)], explanation: "7 bebek ditambah 2 bebek. 7 + 2 = 9 bebek." }),
  A({ level: "Menantang", prompt: "Hitung semua titik pada kedua kartu.", scene: { type: "dots", a: 5, b: 5 }, parts: [fill("□ + □ = □", 5, 5, 10)], explanation: "Kartu pertama 5 titik dan kartu kedua 5 titik. 5 + 5 = 10." }),
  B({ level: "Menantang", prompt: "Hitung dengan menghitung maju. Mulai dari 5, lompat 5 kali.", parts: [{ kind: "hop", start: 5, steps: 5 }], explanation: "Dari 5 menghitung maju 5 kali: 6, 7, 8, 9, 10. Jadi 5 + 5 = 10." }),

  C({ level: "Sangat menantang", prompt: "Ada 2 sepeda dan 2 becak.", scene: { type: "vehicles", items: [{ kind: "sepeda", n: 2 }, { kind: "becak", n: 2 }] }, parts: [fill("Kendaraan: □ + □ = □", 2, 2, 4), fill("Roda: □ + □ = □", 4, 6, 10)], explanation: "Kendaraan: 2 + 2 = 4. Roda: 2 sepeda 4 roda, 2 becak 6 roda. 4 + 6 = 10 roda." }),
  B({ level: "Sangat menantang", prompt: "Buatlah tiga operasi penjumlahan yang hasilnya 9.", parts: [{ kind: "pairs", sum: 9, count: 3 }], explanation: "Banyak jawaban yang benar, misalnya 1 + 8, 2 + 7, 3 + 6, 4 + 5, 5 + 4, atau 9 + 0. Setiap pasangan harus berjumlah 9 dan tidak boleh sama." }),
  A({ level: "Sangat menantang", prompt: "Lengkapilah kalimatnya.", scene: boxes({ thing: "pita", n: 3 }, { thing: "pita", n: 7, alt: true }), parts: [fill("Ada □ pita biru.", 3), fill("Ada □ pita merah.", 7), fill("Semuanya ada □ pita.", 10)], explanation: "3 pita biru dan 7 pita merah. 3 + 7 = 10 pita." }),
  C({ level: "Sangat menantang", prompt: "Di dalam kelas ada 5 siswa. Datang lagi beberapa siswa, sehingga semuanya menjadi 9 siswa. Berapa siswa yang datang?", parts: [fill("5 + □ = 9", 4), fill("Yang datang □ siswa.", 4)], explanation: "5 ditambah berapa sama dengan 9? Hitung maju dari 5: 6, 7, 8, 9, ada 4 langkah. Jadi yang datang 4 siswa." }),
  B({ level: "Sangat menantang", prompt: "Isi bilangan yang hilang pada pasangan bilangan.", parts: [bond(10, null, 6, 4), fill("□ + 6 = 10", 4)], explanation: "Gabungannya 10 dan satu bagiannya 6. 4 + 6 = 10, jadi bagian yang lain 4." }),
  A({ level: "Sangat menantang", prompt: "Pilih operasi yang cocok dengan gambar.", scene: { type: "basket", thing: "apel", inside: 6, outside: 3 }, parts: [{ kind: "pick", label: "Operasinya:", options: ["6 + 2 = 8", "3 + 3 = 6", "6 + 3 = 9", "6 + 4 = 10"], answer: "6 + 3 = 9" }], explanation: "Di dalam keranjang 6 apel, di luar 3 apel. 6 + 3 = 9." }),
  C({ level: "Sangat menantang", prompt: "Tono punya 4 kelereng. Rudi punya 2 kelereng lebih banyak dari Tono. Berapa kelereng Rudi?", parts: [fill("□ + □ = □", 4, 2, 6), fill("Kelereng Rudi ada □.", 6)], explanation: "Kelereng Rudi 2 lebih banyak dari 4. 4 + 2 = 6 kelereng." }),
];
