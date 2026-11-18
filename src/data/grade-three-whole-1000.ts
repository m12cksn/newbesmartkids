// Kelas 3 Bab 1: Bilangan Cacah sampai 1.000 (Matematika SD/MI Kelas III, Kemendikbudristek 2022).
// Subtopik A sampai G, latihan 4 soal per subtopik, dan evaluasi 24 soal dengan cara menjawab seperti di buku.
import type { Question } from "./grade-four-whole-numbers";

/* ---------- Nama bilangan ---------- */
const ones = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
export function words(n: number): string {
  if (n < 10) return ones[n];
  if (n === 10) return "sepuluh";
  if (n === 11) return "sebelas";
  if (n < 20) return `${ones[n - 10]} belas`;
  if (n < 100) { const t = Math.floor(n / 10), u = n % 10; return `${ones[t]} puluh${u ? ` ${ones[u]}` : ""}`; }
  if (n < 1000) { const h = Math.floor(n / 100), r = n % 100; return `${h === 1 ? "seratus" : `${ones[h]} ratus`}${r ? ` ${words(r)}` : ""}`; }
  return "seribu";
}
export const reading = (n: number) => { const w = words(n); return w[0].toUpperCase() + w.slice(1); };
export const digits = (n: number) => [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10] as const;
export const fmt = (n: number) => n.toLocaleString("id-ID");

/* ---------- Benda dan gambar soal ---------- */
export type Thing = "pensil" | "melati" | "mobil" | "kelereng" | "telur" | "apel" | "buku" | "daun" | "balon" | "biskuit" | "manik" | "ikan" | "stiker";
export const thingName: Record<Thing, string> = {
  pensil: "pensil", melati: "bunga melati", mobil: "mobil mainan", kelereng: "kelereng", telur: "telur", apel: "apel", buku: "buku",
  daun: "daun", balon: "balon", biskuit: "biskuit", manik: "manik-manik", ikan: "ikan", stiker: "stiker",
};
export type Sign = { kind: "jarak" | "harga"; n: number; name: string };
export type Scene =
  | { type: "blocks"; h: number; t: number; u: number; label?: string }
  | { type: "tens"; rows: number[]; op: "+" | "−" }
  | { type: "signs"; items: Sign[] }
  | { type: "groups"; thing: Thing; groups: number; each: number }
  | { type: "share"; thing: Thing; total: number; plates: number }
  | { type: "table"; caption: string; head: [string, string]; rows: [string, number][] }
  | { type: "story"; items: { name: string; thing: Thing; n: number }[] }
  | { type: "cards"; digits: number[] };

/* ---------- Bagian jawaban ---------- */
export type Part =
  | { kind: "fill"; text: string; answers: number[] } // "□" menandai kotak isian
  | { kind: "pv"; n: number; hide: [boolean, boolean, boolean]; hideN?: boolean }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "multi"; label: string; options: string[]; answer: string[] }
  | { kind: "order"; label: string; options: string[]; answer: string[] }
  | { kind: "match"; left: string[]; right: string[]; answer: number[] }
  | { kind: "column"; a: number; b: number; op: "+" | "−" };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type KQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const columnResult = (p: Extract<Part, { kind: "column" }>) => (p.op === "+" ? p.a + p.b : p.a - p.b);
export const fieldCount = (p: Part) =>
  p.kind === "fill" ? p.answers.length : p.kind === "pv" ? p.hide.filter(Boolean).length + (p.hideN ? 1 : 0)
    : p.kind === "match" ? p.left.length : p.kind === "column" ? String(columnResult(p)).length : 1;
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const list = (v: string) => (v ? v.split("|") : []);
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replaceAll(".", "")));

export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "pv": { const d = digits(p.n), out = d.filter((_, i) => p.hide[i]).map(String); if (p.hideN) out.push(String(p.n)); return out.join("|"); }
    case "choice": return p.answer;
    case "multi": return p.answer.join("|");
    case "order": return p.answer.join("|");
    case "match": return p.answer.join("|");
    case "column": return String(columnResult(p)).split("").join("|");
  }
}
export function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "choice") return v === p.answer;
  if (p.kind === "multi") return list(v).sort().join("|") === [...p.answer].sort().join("|");
  if (p.kind === "order" || p.kind === "match") return v === partKey(p);
  const want = partKey(p).split("|"), got = cells(p, v);
  return want.every((w, i) => num(got[i]) === Number(w));
}
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "choice") return v !== "";
  if (p.kind === "multi") return list(v).length > 0;
  if (p.kind === "order") return list(v).length === p.options.length;
  return cells(p, v).every(x => x.trim() !== "");
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: KQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: KQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: KQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "pv": { let k = 0; const d = digits(p.n).map((dd, j) => (p.hide[j] ? x[k++] || "…" : String(dd))); return `ratusan ${d[0]}, puluhan ${d[1]}, satuan ${d[2]}${p.hideN ? `, bilangan ${x[k] || "…"}` : ""}`; }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "multi": return `${p.label} ${list(v[i]).join(", ") || "…"}`;
      case "order": return `${p.label} ${list(v[i]).join(", ") || "…"}`;
      case "match": return p.left.map((l, k) => `${l} → ${x[k] === "" ? "…" : p.right[Number(x[k])]}`).join("; ");
      case "column": return `${p.a} ${p.op} ${p.b} = ${x.join("") || "…"}`;
    }
  }).join(" | ");
}

/* ---------- Pembuat soal ---------- */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): KQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const signs3 = ["<", ">", "="];
const trueFalse = ["Benar", "Salah"];

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Bilangan dan Lambang Bilangan Cacah sampai 1.000", short: "Membaca dan menulis", sections: [
    { title: "Satuan, puluhan, ratusan", lab: "blocks", steps: ["10 satuan diikat menjadi 1 puluhan.", "10 puluhan disusun menjadi 1 ratusan.", "Bilangan tiga angka ditulis dari ratusan, puluhan, lalu satuan."], example: "1 ratusan, 1 puluhan, dan 5 satuan ditulis 115, dibaca seratus lima belas.", demo: "Tambah satuan sampai 10, lalu tukar menjadi 1 puluhan. Lihat bilangannya berubah." },
    { title: "Membaca dan menulis bilangan", lab: "cards", steps: ["Ambil tiga kartu angka. Angka pertama tidak boleh 0.", "Kartu pertama menunjukkan ratusan, kedua puluhan, ketiga satuan.", "Baca dari ratusan: 671 dibaca enam ratus tujuh puluh satu."], example: "Tiga ratus lima puluh empat: ratusannya 3, puluhannya 5, satuannya 4, jadi ditulis 354.", demo: "Susun 703 dengan kartu. Angka 0 di tengah tidak dibaca, jadi 703 dibaca tujuh ratus tiga." },
  ] },
  { code: "B", title: "Nilai Tempat Bilangan Cacah sampai 1.000", short: "Nilai tempat", sections: [
    { title: "Kaleng nilai tempat", lab: "cans", steps: ["Setiap angka punya nilai tempat: ratusan, puluhan, atau satuan.", "Pada 251, angka 2 bernilai 200, angka 5 bernilai 50, angka 1 bernilai 1.", "Menggabungkan nilai-nilai itu disebut menyusun, memecahnya disebut mengurai."], example: "602 = 6 ratusan + 0 puluhan + 2 satuan = 600 + 0 + 2.", demo: "Ubah angka di setiap kaleng. Perhatikan nilai angka itu ikut berubah." },
  ] },
  { code: "C", title: "Membandingkan dan Mengurutkan Bilangan Cacah sampai 1.000", short: "Membandingkan", sections: [
    { title: "Membandingkan dua bilangan", lab: "compare", steps: ["Bandingkan angka ratusan lebih dulu.", "Jika ratusannya sama, bandingkan puluhan. Jika masih sama, bandingkan satuan.", "Tanda < dibaca kurang dari, > dibaca lebih dari, = dibaca sama dengan."], example: "583 dan 529: ratusannya sama-sama 5, puluhannya 8 dan 2. Jadi 583 > 529.", demo: "Pilih tanda yang tepat, lalu lihat nilai tempat mana yang menentukan." },
    { title: "Mengurutkan bilangan", lab: "order", steps: ["Cari bilangan dengan ratusan terkecil.", "Untuk ratusan yang sama, lihat puluhannya, lalu satuannya.", "Urutan terkecil ke terbesar bisa dibalik menjadi terbesar ke terkecil."], example: "639, 709, 720: 639 punya 6 ratusan, lalu 709 dan 720 dibedakan dari puluhannya.", demo: "Ketuk karet penghapus dari yang paling murah sampai paling mahal." },
  ] },
  { code: "D", title: "Penjumlahan Bilangan Cacah sampai 100", short: "Penjumlahan", sections: [
    { title: "Menjumlahkan dengan nilai tempat", lab: "add", steps: ["Susun puluhan lurus dengan puluhan, satuan lurus dengan satuan.", "Jumlahkan satuan dulu. Jika 10 atau lebih, simpan 1 puluhan.", "Jumlahkan puluhan, termasuk puluhan yang disimpan."], example: "48 + 16: 8 + 6 = 14, tulis 4 simpan 1. Lalu 1 + 4 + 1 = 6. Hasilnya 64.", demo: "Gabungkan kedua bilangan. Jika satuan lebih dari 9, tukar 10 satuan dengan 1 puluhan." },
  ] },
  { code: "E", title: "Pengurangan Bilangan Cacah sampai 100", short: "Pengurangan", sections: [
    { title: "Mengurangi dengan nilai tempat", lab: "sub", steps: ["Kurangkan satuan dulu, lalu puluhan.", "Jika satuan atas lebih kecil, ambil 1 puluhan dan jadikan 10 satuan.", "Puluhan yang diambil berkurang satu."], example: "45 − 19: 5 kurang dari 9, ambil 1 puluhan jadi 15. 15 − 9 = 6 dan 3 − 1 = 2. Hasilnya 26.", demo: "Coba kurangi satuan. Jika tidak cukup, pindahkan 1 puluhan ke satuan." },
  ] },
  { code: "F", title: "Perkalian Bilangan Cacah sampai 100", short: "Perkalian", sections: [
    { title: "Kelompok sama banyak", lab: "groups", steps: ["Perkalian adalah penjumlahan berulang.", "5 kelompok berisi 2 pensil: 2 + 2 + 2 + 2 + 2 = 10, ditulis 5 × 2 = 10.", "Banyak kelompok ditulis di depan, isi tiap kelompok di belakang."], example: "5 × 6 = 30 dan 6 × 5 = 30. Hasilnya sama, tetapi susunan kelompoknya berbeda.", demo: "Ubah banyak kelompok dan isinya, lalu tukar keduanya." },
  ] },
  { code: "G", title: "Pembagian Bilangan Cacah sampai 100", short: "Pembagian", sections: [
    { title: "Membagi sama banyak", lab: "share", steps: ["Bagikan satu per satu ke setiap wadah sampai habis.", "Pembagian adalah pengurangan berulang sampai sisanya 0.", "Hasil bagi dikalikan pembagi sama dengan bilangan yang dibagi."], example: "15 : 3 = 5 karena 15 − 3 − 3 − 3 − 3 − 3 = 0, dan 5 × 3 = 15.", demo: "Bagikan manik-manik ke anggota kelompok. Catatan pengurangannya muncul di bawah." },
  ] },
];

/* ---------- Latihan (4 soal per subtopik) ---------- */
const A = make(0), B = make(1), C = make(2), D = make(3), E = make(4), F = make(5), G = make(6);
export const practice: KQuestion[][] = [
  [
    A({ prompt: "Isilah tabel nilai tempat sesuai gambar balok.", scene: { type: "blocks", h: 3, t: 4, u: 6 }, parts: [{ kind: "pv", n: 346, hide: [true, true, true], hideN: true }], explanation: "Ada 3 papan ratusan, 4 batang puluhan, dan 6 kubus satuan. Bilangannya 346." }),
    A({ prompt: "Tulis bilangan pada papan, lalu pilih cara membacanya.", scene: { type: "signs", items: [{ kind: "jarak", n: 482, name: "Sekolah" }] }, parts: [{ kind: "fill", text: "Lambang bilangan: □", answers: [482] }, { kind: "choice", label: "Dibaca:", options: ["Empat ratus delapan puluh dua", "Empat ratus dua puluh delapan", "Delapan ratus empat puluh dua"], answer: "Empat ratus delapan puluh dua" }], explanation: "4 ratusan, 8 puluhan, 2 satuan: 482, dibaca empat ratus delapan puluh dua." }),
    A({ prompt: "Pasangkan lambang bilangan dengan cara membacanya.", parts: [{ kind: "match", left: ["706", "160", "670", "106"], right: ["Seratus enam puluh", "Enam ratus tujuh puluh", "Seratus enam", "Tujuh ratus enam"], answer: [3, 0, 1, 2] }], explanation: "706 tujuh ratus enam, 160 seratus enam puluh, 670 enam ratus tujuh puluh, 106 seratus enam. Angka 0 tidak dibaca." }),
    A({ prompt: "Pilih semua bilangan yang angka puluhannya kurang dari 3.", parts: [{ kind: "multi", label: "Bilangan:", options: ["438", "527", "903", "264", "685"], answer: ["527", "903"] }], explanation: "Angka puluhan: 438 → 3, 527 → 2, 903 → 0, 264 → 6, 685 → 8. Yang kurang dari 3 adalah 527 dan 903." }),
  ],
  [
    B({ prompt: "Isilah titik-titik dengan bilangan yang tepat.", parts: [{ kind: "fill", text: "7 ratusan + 0 puluhan + 4 satuan = □ + □ + □ = □", answers: [700, 0, 4, 704] }], explanation: "7 ratusan = 700, 0 puluhan = 0, 4 satuan = 4. 700 + 0 + 4 = 704." }),
    B({ prompt: "Perhatikan angka 8 pada bilangan 581.", parts: [{ kind: "choice", label: "Nilai tempat angka 8:", options: ["Ratusan", "Puluhan", "Satuan"], answer: "Puluhan" }, { kind: "fill", text: "Nilai angka 8 adalah □", answers: [80] }], explanation: "581 = 5 ratusan + 8 puluhan + 1 satuan. Angka 8 di puluhan bernilai 80." }),
    B({ prompt: "Lengkapi tabel nilai tempat bilangan 360.", parts: [{ kind: "pv", n: 360, hide: [true, true, true] }], explanation: "360 = 3 ratusan + 6 puluhan + 0 satuan." }),
    B({ prompt: "Uraikan bilangan 629.", parts: [{ kind: "fill", text: "629 = □ ratusan + □ puluhan + □ satuan = □ + □ + □", answers: [6, 2, 9, 600, 20, 9] }], explanation: "629 = 6 ratusan + 2 puluhan + 9 satuan = 600 + 20 + 9." }),
  ],
  [
    C({ prompt: "Isilah titik-titik dengan tanda >, <, atau =.", parts: [{ kind: "choice", label: "527 … 572", options: signs3, answer: "<" }, { kind: "choice", label: "830 … 803", options: signs3, answer: ">" }], explanation: "527 dan 572: ratusan sama, puluhan 2 < 7, jadi 527 < 572. 830 dan 803: puluhan 3 > 0, jadi 830 > 803." }),
    C({ prompt: "Urutkan harga karet penghapus dari yang paling murah.", scene: { type: "signs", items: [{ kind: "harga", n: 650, name: "Hewan" }, { kind: "harga", n: 625, name: "Buah" }, { kind: "harga", n: 675, name: "Bunga" }, { kind: "harga", n: 605, name: "Mobil" }] }, parts: [{ kind: "order", label: "Urutan:", options: ["650", "625", "675", "605"], answer: ["605", "625", "650", "675"] }], explanation: "Ratusannya sama, 6. Puluhannya 0, 2, 5, 7. Jadi 605, 625, 650, 675." }),
    C({ prompt: "Alfa punya 247 kelereng, Galih 274 kelereng, dan Andi 227 kelereng.", scene: { type: "story", items: [{ name: "Alfa", thing: "kelereng", n: 247 }, { name: "Galih", thing: "kelereng", n: 274 }, { name: "Andi", thing: "kelereng", n: 227 }] }, parts: [{ kind: "choice", label: "Paling banyak:", options: ["Alfa", "Galih", "Andi"], answer: "Galih" }, { kind: "choice", label: "Paling sedikit:", options: ["Alfa", "Galih", "Andi"], answer: "Andi" }], explanation: "Ratusannya sama, 2. Puluhannya 4, 7, 2. Galih (274) paling banyak, Andi (227) paling sedikit." }),
    C({ prompt: "Urutkan bilangan dari yang terbesar ke terkecil.", parts: [{ kind: "order", label: "Urutan:", options: ["318", "381", "183", "138"], answer: ["381", "318", "183", "138"] }], explanation: "381 dan 318 punya 3 ratusan, 183 dan 138 punya 1 ratusan. Bandingkan puluhannya: 381 > 318 > 183 > 138." }),
  ],
  [
    D({ prompt: "Gunakan cara susun panjang untuk 34 + 25.", scene: { type: "tens", rows: [34, 25], op: "+" }, parts: [{ kind: "fill", text: "34 + 25 = (30 + 20) + (4 + 5) = □ + □ = □", answers: [50, 9, 59] }], explanation: "Puluhan 30 + 20 = 50, satuan 4 + 5 = 9. 50 + 9 = 59." }),
    D({ prompt: "Gunakan cara susun pendek.", parts: [{ kind: "column", a: 47, b: 38, op: "+" }], explanation: "7 + 8 = 15, tulis 5 simpan 1. 1 + 4 + 3 = 8. Hasilnya 85." }),
    D({ prompt: "Tarik garis dari soal ke hasil penjumlahannya.", parts: [{ kind: "match", left: ["58 + 22", "35 + 40", "26 + 31 + 12", "17 + 50 + 24"], right: ["75", "91", "80", "69"], answer: [2, 0, 3, 1] }], explanation: "58 + 22 = 80, 35 + 40 = 75, 26 + 31 + 12 = 69, 17 + 50 + 24 = 91." }),
    D({ prompt: "Alen punya 24 ikan cupang dan 37 ikan koki. Berapa ekor ikan Alen seluruhnya?", scene: { type: "story", items: [{ name: "Ikan cupang", thing: "ikan", n: 24 }, { name: "Ikan koki", thing: "ikan", n: 37 }] }, parts: [{ kind: "fill", text: "Jumlah ikan = □ ekor", answers: [61] }], explanation: "24 + 37: 4 + 7 = 11, tulis 1 simpan 1. 1 + 2 + 3 = 6. Jadi 61 ekor." }),
  ],
  [
    E({ prompt: "Gunakan cara susun panjang untuk 52 − 27.", scene: { type: "tens", rows: [52, 27], op: "−" }, parts: [{ kind: "fill", text: "52 = 40 + 12 dan 27 = 20 + 7, jadi 52 − 27 = (40 − 20) + (12 − 7) = □ + □ = □", answers: [20, 5, 25] }], explanation: "2 kurang dari 7, jadi 50 diurai menjadi 40 + 10. 40 − 20 = 20, 12 − 7 = 5. Hasilnya 25." }),
    E({ prompt: "Gunakan cara susun pendek.", parts: [{ kind: "column", a: 70, b: 36, op: "−" }], explanation: "0 kurang dari 6, ambil 1 puluhan: 10 − 6 = 4. Puluhan tinggal 6, 6 − 3 = 3. Hasilnya 34." }),
    E({ prompt: "Berilah tanda pada setiap pernyataan: benar atau salah.", parts: [{ kind: "choice", label: "64 − 28 = 36", options: trueFalse, answer: "Benar" }, { kind: "choice", label: "83 − 47 = 46", options: trueFalse, answer: "Salah" }], explanation: "64 − 28 = 36, benar. 83 − 47 = 36, bukan 46, jadi salah." }),
    E({ prompt: "Bia punya 45 stiker. Bia memberi adiknya 18 stiker. Berapa stiker Bia sekarang?", scene: { type: "story", items: [{ name: "Stiker Bia", thing: "stiker", n: 45 }, { name: "Diberikan", thing: "stiker", n: 18 }] }, parts: [{ kind: "fill", text: "Sisa stiker = □", answers: [27] }], explanation: "45 − 18: 5 kurang dari 8, ambil 1 puluhan: 15 − 8 = 7, 3 − 1 = 2. Sisanya 27 stiker." }),
  ],
  [
    F({ prompt: "Isilah titik-titik sesuai gambar.", scene: { type: "groups", thing: "pensil", groups: 4, each: 3 }, parts: [{ kind: "fill", text: "□ + □ + □ + □ = □", answers: [3, 3, 3, 3, 12] }, { kind: "fill", text: "□ × □ = □", answers: [4, 3, 12] }], explanation: "Ada 4 kelompok, setiap kelompok 3 pensil. 3 + 3 + 3 + 3 = 12, jadi 4 × 3 = 12." }),
    F({ prompt: "Pasangkan penjumlahan berulang dengan hasil atau perkaliannya.", parts: [{ kind: "match", left: ["5 + 5 + 5 + 5 + 5 + 5", "9 + 9 + 9 + 9", "7 + 7 + 7 + 7 + 7 + 7 + 7 + 7", "6 + 6 + 6 + 6 + 6 + 6 + 6"], right: ["4 × 9", "30", "7 × 6", "56"], answer: [1, 0, 3, 2] }], explanation: "6 kali 5 = 30, 4 kali 9 = 4 × 9, 8 kali 7 = 56, 7 kali 6 = 7 × 6." }),
    F({ prompt: "Hitunglah hasil perkalian berikut.", parts: [{ kind: "fill", text: "6 × 7 = □", answers: [42] }, { kind: "fill", text: "8 × 4 = □", answers: [32] }], explanation: "6 × 7 = 7 + 7 + 7 + 7 + 7 + 7 = 42. 8 × 4 = 4 + 4 + 4 + 4 + 4 + 4 + 4 + 4 = 32." }),
    F({ prompt: "Ada 5 kotak telur. Setiap kotak berisi 6 telur. Berapa telur seluruhnya?", scene: { type: "groups", thing: "telur", groups: 5, each: 6 }, parts: [{ kind: "fill", text: "□ × □ = □ telur", answers: [5, 6, 30] }], explanation: "5 kotak berisi 6: 6 + 6 + 6 + 6 + 6 = 30, jadi 5 × 6 = 30 telur." }),
  ],
  [
    G({ prompt: "Tulislah 18 : 6 sebagai pengurangan berulang.", parts: [{ kind: "fill", text: "18 − □ − □ − □ = 0, jadi 18 : 6 = □", answers: [6, 6, 6, 3] }], explanation: "18 − 6 = 12, 12 − 6 = 6, 6 − 6 = 0. Ada 6 sebanyak 3 kali, jadi 18 : 6 = 3." }),
    G({ prompt: "12 manik-manik dibagikan sama banyak kepada 4 anggota. Berapa manik-manik setiap anggota?", scene: { type: "share", thing: "manik", total: 12, plates: 4 }, parts: [{ kind: "fill", text: "12 : 4 = □", answers: [3] }], explanation: "Setiap putaran memberi 4 manik-manik: 12 − 4 − 4 − 4 = 0. Ada 3 putaran, jadi 12 : 4 = 3." }),
    G({ prompt: "Hitunglah hasil pembagian berikut.", parts: [{ kind: "fill", text: "45 : 9 = □", answers: [5] }, { kind: "fill", text: "56 : 7 = □", answers: [8] }], explanation: "45 : 9 = 5 karena 5 × 9 = 45. 56 : 7 = 8 karena 8 × 7 = 56." }),
    G({ prompt: "Ayah punya 32 telur dan memasukkannya ke 4 kotak sama banyak. Berapa telur di setiap kotak?", scene: { type: "share", thing: "telur", total: 32, plates: 4 }, parts: [{ kind: "fill", text: "32 : 4 = □ telur", answers: [8] }, { kind: "fill", text: "Periksa: □ × 4 = 32", answers: [8] }], explanation: "32 : 4 = 8 karena 8 × 4 = 32. Setiap kotak berisi 8 telur." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const heights: [string, number][] = [["Dodi", 128], ["Rina", 132], ["Sari", 119], ["Tono", 105], ["Lala", 137], ["Beni", 124]];
const heightTable: Scene = { type: "table", caption: "Tinggi badan (cm)", head: ["Nama", "Tinggi"], rows: heights };
const distances: Scene = { type: "signs", items: [{ kind: "jarak", n: 498, name: "Meutia" }, { kind: "jarak", n: 490, name: "Alfa" }, { kind: "jarak", n: 508, name: "Galih" }] };
export const assessment: KQuestion[] = [
  A({ level: "Sedang", prompt: "Isi tabel nilai tempat dari gambar balok, lalu pilih cara membacanya.", scene: { type: "blocks", h: 4, t: 0, u: 7 }, parts: [{ kind: "pv", n: 407, hide: [true, true, true] }, { kind: "choice", label: "Dibaca:", options: ["Empat ratus tujuh puluh", "Empat ratus tujuh", "Tujuh ratus empat"], answer: "Empat ratus tujuh" }], explanation: "4 papan ratusan, tidak ada batang puluhan, 7 kubus satuan. 407 dibaca empat ratus tujuh." }),
  D({ level: "Sedang", prompt: "Selesaikan dengan cara susun pendek.", parts: [{ kind: "column", a: 39, b: 46, op: "+" }], explanation: "9 + 6 = 15, tulis 5 simpan 1. 1 + 3 + 4 = 8. Jadi 39 + 46 = 85." }),
  B({ level: "Sedang", prompt: "Susunlah bilangan dari nilai tempatnya.", parts: [{ kind: "fill", text: "3 ratusan + 0 puluhan + 8 satuan = □ + □ + □ = □", answers: [300, 0, 8, 308] }], explanation: "3 ratusan = 300, 0 puluhan = 0, 8 satuan = 8. 300 + 0 + 8 = 308." }),
  F({ level: "Sedang", prompt: "Tuliskan perkalian sesuai gambar bunga melati.", scene: { type: "groups", thing: "melati", groups: 6, each: 4 }, parts: [{ kind: "fill", text: "□ × □ = □", answers: [6, 4, 24] }], explanation: "Ada 6 kelompok, setiap kelompok 4 bunga. 4 + 4 + 4 + 4 + 4 + 4 = 24, jadi 6 × 4 = 24." }),
  C({ level: "Sedang", prompt: "Isilah titik-titik dengan tanda >, <, atau =.", parts: [{ kind: "choice", label: "609 … 690", options: signs3, answer: "<" }, { kind: "choice", label: "872 … 827", options: signs3, answer: ">" }], explanation: "609 dan 690: ratusan sama, puluhan 0 < 9. 872 dan 827: ratusan sama, puluhan 7 > 2." }),
  E({ level: "Sedang", prompt: "Hitunglah pengurangan berikut dengan cara susun pendek.", parts: [{ kind: "column", a: 81, b: 45, op: "−" }], explanation: "1 kurang dari 5, ambil 1 puluhan: 11 − 5 = 6. Puluhan tinggal 7, 7 − 4 = 3. Jadi 81 − 45 = 36." }),
  G({ level: "Sedang", prompt: "24 biskuit dibagikan sama banyak ke 4 piring. Berapa biskuit di setiap piring?", scene: { type: "share", thing: "biskuit", total: 24, plates: 4 }, parts: [{ kind: "fill", text: "24 : 4 = □", answers: [6] }], explanation: "24 − 4 − 4 − 4 − 4 − 4 − 4 = 0, ada 4 sebanyak 6. Jadi 24 : 4 = 6 biskuit." }),
  A({ level: "Sedang", prompt: "Tulis bilangan pada papan jarak ke taman, lalu pilih cara membacanya.", scene: { type: "signs", items: [{ kind: "jarak", n: 509, name: "Taman Kota" }] }, parts: [{ kind: "fill", text: "Lambang bilangan: □", answers: [509] }, { kind: "choice", label: "Dibaca:", options: ["Lima ratus sembilan puluh", "Sembilan ratus lima", "Lima ratus sembilan"], answer: "Lima ratus sembilan" }], explanation: "5 ratusan, 0 puluhan, 9 satuan: 509, dibaca lima ratus sembilan." }),

  C({ level: "Menantang", prompt: "Ada berapa anak yang angka puluhan tinggi badannya kurang dari 3?", scene: heightTable, parts: [{ kind: "fill", text: "Banyak anak = □", answers: [4] }], explanation: "Angka puluhan: Dodi 2, Rina 3, Sari 1, Tono 0, Lala 3, Beni 2. Yang kurang dari 3: Dodi, Sari, Tono, Beni, jadi 4 anak." }),
  A({ level: "Menantang", prompt: "Pasangkan lambang bilangan dengan cara membacanya.", parts: [{ kind: "match", left: ["350", "305", "530", "503"], right: ["Lima ratus tiga", "Tiga ratus lima puluh", "Lima ratus tiga puluh", "Tiga ratus lima"], answer: [1, 3, 2, 0] }], explanation: "350 tiga ratus lima puluh, 305 tiga ratus lima, 530 lima ratus tiga puluh, 503 lima ratus tiga. Perhatikan letak angka 0." }),
  D({ level: "Menantang", prompt: "Lomba karnaval diikuti 16 siswa kelas 3, 25 siswa kelas 4, dan 29 siswa kelas 5. Berapa siswa seluruhnya?", parts: [{ kind: "fill", text: "16 + 25 + 29 = □ siswa", answers: [70] }], explanation: "16 + 25 = 41, lalu 41 + 29 = 70. Jadi 70 siswa." }),
  F({ level: "Menantang", prompt: "Pasangkan penjumlahan berulang dengan hasil atau perkaliannya.", parts: [{ kind: "match", left: ["8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8", "7 + 7 + 7 + 7 + 7", "9 + 9 + 9 + 9 + 9 + 9 + 9", "6 + 6 + 6 + 6 + 6 + 6 + 6 + 6"], right: ["63", "48", "9 × 8", "35"], answer: [2, 3, 0, 1] }], explanation: "9 kali 8 = 9 × 8, 5 kali 7 = 35, 7 kali 9 = 63, 8 kali 6 = 48." }),
  B({ level: "Menantang", prompt: "Pilih semua bilangan yang angka 6-nya bernilai 60.", parts: [{ kind: "multi", label: "Bilangan:", options: ["361", "916", "562", "640", "265"], answer: ["361", "562", "265"] }], explanation: "Angka 6 bernilai 60 jika berada di puluhan: 361, 562, dan 265. Pada 916 nilainya 6, pada 640 nilainya 600." }),
  E({ level: "Menantang", prompt: "Berilah tanda pada setiap pernyataan: benar atau salah.", parts: [{ kind: "choice", label: "90 − 27 = 73", options: trueFalse, answer: "Salah" }, { kind: "choice", label: "75 − 20 − 18 = 37", options: trueFalse, answer: "Benar" }], explanation: "90 − 27 = 63, bukan 73. 75 − 20 = 55, lalu 55 − 18 = 37, benar." }),
  G({ level: "Menantang", prompt: "Tulislah 35 : 7 sebagai pengurangan berulang.", parts: [{ kind: "fill", text: "35 − □ − □ − □ − □ − □ = 0, jadi 35 : 7 = □", answers: [7, 7, 7, 7, 7, 5] }], explanation: "35 − 7 = 28, 21, 14, 7, 0. Ada 7 sebanyak 5 kali, jadi 35 : 7 = 5." }),
  C({ level: "Menantang", prompt: "Urutkan tinggi badan Rina, Lala, dan Beni dari yang paling pendek.", scene: heightTable, parts: [{ kind: "order", label: "Urutan:", options: ["Rina", "Lala", "Beni"], answer: ["Beni", "Rina", "Lala"] }], explanation: "Beni 124, Rina 132, Lala 137. Dari yang paling pendek: Beni, Rina, Lala." }),
  B({ level: "Menantang", prompt: "Uraikan tinggi badan Tono ke dalam nilai tempat.", scene: heightTable, parts: [{ kind: "fill", text: "105 = □ ratusan + □ puluhan + □ satuan = □ + □ + □", answers: [1, 0, 5, 100, 0, 5] }], explanation: "Tinggi Tono 105 cm = 1 ratusan + 0 puluhan + 5 satuan = 100 + 0 + 5." }),

  D({ level: "Sangat menantang", prompt: "Alfa punya 64 kelereng dan Galih 28 kelereng. Alfa memberi Galih 19 kelereng. Berapa kelereng mereka sekarang?", scene: { type: "story", items: [{ name: "Alfa", thing: "kelereng", n: 64 }, { name: "Galih", thing: "kelereng", n: 28 }] }, parts: [{ kind: "fill", text: "Kelereng Galih sekarang = □", answers: [47] }, { kind: "fill", text: "Kelereng Alfa sekarang = □", answers: [45] }], explanation: "Galih bertambah: 28 + 19 = 47. Alfa berkurang: 64 − 19 = 45." }),
  A({ level: "Sangat menantang", prompt: "Dengan kartu 4, 0, dan 7, susun bilangan tiga angka terbesar dan terkecil. Angka pertama tidak boleh 0.", scene: { type: "cards", digits: [4, 0, 7] }, parts: [{ kind: "fill", text: "Terbesar: □", answers: [740] }, { kind: "fill", text: "Terkecil: □", answers: [407] }], explanation: "Terbesar: angka terbesar di ratusan, jadi 740. Terkecil: 0 tidak boleh di depan, jadi 4 di ratusan, 0 di puluhan, 7 di satuan: 407." }),
  F({ level: "Sangat menantang", prompt: "Setiap siswa membawa 6 daun. Satu kelompok ada 4 siswa. Ada 3 kelompok di kelas. Berapa daun yang terkumpul?", scene: { type: "groups", thing: "daun", groups: 4, each: 6 }, parts: [{ kind: "fill", text: "Satu kelompok: □ daun", answers: [24] }, { kind: "fill", text: "Tiga kelompok: □ daun", answers: [72] }], explanation: "Satu kelompok: 4 × 6 = 24 daun. Tiga kelompok: 24 + 24 + 24 = 72 daun." }),
  G({ level: "Sangat menantang", prompt: "Toko mainan membagikan 56 balon selama seminggu (7 hari), setiap hari sama banyak.", parts: [{ kind: "fill", text: "Balon setiap hari = □", answers: [8] }, { kind: "fill", text: "Balon dalam 3 hari = □", answers: [24] }], explanation: "56 : 7 = 8 balon setiap hari karena 8 × 7 = 56. Dalam 3 hari: 3 × 8 = 24 balon." }),
  C({ level: "Sangat menantang", prompt: "Jarak rumah ke sekolah: urutkan dari yang paling jauh, lalu pilih yang paling dekat.", scene: distances, parts: [{ kind: "order", label: "Dari paling jauh:", options: ["Meutia", "Alfa", "Galih"], answer: ["Galih", "Meutia", "Alfa"] }, { kind: "choice", label: "Paling dekat:", options: ["Meutia", "Alfa", "Galih"], answer: "Alfa" }], explanation: "Galih 508 punya 5 ratusan, paling jauh. Meutia 498 dan Alfa 490 punya 4 ratusan dan 9 puluhan, satuannya 8 > 0. Urutan: Galih, Meutia, Alfa. Paling dekat Alfa." }),
  E({ level: "Sangat menantang", prompt: "Ibu membeli 60 telur. Sebanyak 23 telur dipakai membuat kue dan 18 telur diberikan kepada tetangga. Berapa telur yang tersisa?", parts: [{ kind: "fill", text: "Sisa telur = □", answers: [19] }], explanation: "60 − 23 = 37, lalu 37 − 18 = 19. Sisa 19 telur." }),
  B({ level: "Sangat menantang", prompt: "Ali menyusun 4 papan ratusan, 13 batang puluhan, dan 5 kubus satuan. Bilangan berapa yang ia susun?", scene: { type: "blocks", h: 4, t: 13, u: 5 }, parts: [{ kind: "fill", text: "Bilangannya = □", answers: [535] }], explanation: "13 puluhan = 10 puluhan + 3 puluhan = 1 ratusan + 3 puluhan. Jadi 5 ratusan, 3 puluhan, 5 satuan = 535." }),
];
