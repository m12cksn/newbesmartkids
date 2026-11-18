// Kelas 4 Bab 6: Piktogram dan Diagram Batang (Matematika SD/MI Kelas IV, Kemendikbudristek).
// A piktogram (diagram gambar, dengan skala), B diagram batang tegak dan mendatar.
import type { Question } from "./grade-four-whole-numbers";

/* ====================================================================== */
/* Data dan diagram                                                        */
/* ====================================================================== */
export type Icon = "siswa" | "buku" | "kelereng" | "bunga" | "kue" | "telur" | "apel" | "bola" | "kotak";
export const iconName: Record<Icon, string> = { siswa: "siswa", buku: "buku", kelereng: "kelereng", bunga: "bunga", kue: "kue", telur: "telur", apel: "apel", bola: "bola", kotak: "benda" };
export type Item = { name: string; value: number };
/** `unit`: kata satuan pada keterangan, misalnya "1 gambar menyatakan 2 siswa". */
export type Pikto = { kind: "pikto"; cat: string; head: string; icon: Icon; scale: number; items: Item[]; hide?: string; unit?: string };
export type Bar = { kind: "bar"; dir: "v" | "h"; cat: string; axis: string; step: number; max: number; items: Item[]; color?: string; hide?: string };
export type Chart = Pikto | Bar;
export type Scene =
  | { type: "chart"; chart: Chart }
  /** Tabel data seperti di buku: tegak (dua kolom) atau mendatar (satu baris nilai). */
  | { type: "table"; head: [string, string]; rows: [string, number][]; across?: boolean };

/* ---------- Pertanyaan tentang data (untuk diperiksa ulang) ---------- */
export type Ask =
  | { f: "value"; cat: string } | { f: "sum"; cats: string[] } | { f: "total" } | { f: "diff"; a: string; b: string }
  | { f: "scale" } | { f: "icons"; cat: string } | { f: "missing"; total: number } | { f: "range" };
export type AskName = { f: "max" } | { f: "min" } | { f: "which"; value: number } | { f: "twice"; of: string };

/* ====================================================================== */
/* Bagian jawaban                                                          */
/* ====================================================================== */
export type Part =
  | { kind: "fill"; text: string; answers: number[]; ask: Ask[] }
  | { kind: "choice"; label: string; options: string[]; answer: string; ask: AskName }
  /** Pilih semua kategori yang memenuhi syarat. */
  | { kind: "multi"; label: string; options: string[]; answer: string[]; more: number }
  /** Susun piktogram: ketuk tambah atau kurangi gambar di setiap baris. */
  | { kind: "pikto"; chart: Pikto; edit: string[] }
  /** Buat diagram batang: atur panjang setiap batang. */
  | { kind: "bar"; chart: Bar; edit: string[] }
  /** Pilih diagram yang sesuai dengan data. */
  | { kind: "pick"; label: string; charts: Chart[]; answer: number };
export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export type CQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
const list = (v: string) => (v ? v.split("|") : []);
export const fieldCount = (p: Part) => (p.kind === "fill" ? p.answers.length : p.kind === "pikto" || p.kind === "bar" ? p.edit.length : 1);
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const cells = (p: Part, v: string) => { const x = list(v); return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const toNum = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
const valueOf = (c: Chart, name: string) => c.items.find(i => i.name === name)!.value;
export function partKey(p: Part): string {
  switch (p.kind) {
    case "fill": return p.answers.join("|");
    case "choice": return p.answer;
    case "multi": return [...p.answer].sort().join("|");
    case "pikto": return p.edit.map(n => valueOf(p.chart, n) / p.chart.scale).join("|");
    case "bar": return p.edit.map(n => valueOf(p.chart, n)).join("|");
    case "pick": return String(p.answer);
  }
}
export function partCorrect(p: Part, v: string): boolean {
  switch (p.kind) {
    case "fill": case "pikto": case "bar": { const got = cells(p, v), want = partKey(p).split("|").map(Number); return want.every((a, i) => toNum(got[i]) === a); }
    case "multi": return [...list(v)].sort().join("|") === partKey(p);
    default: return v === partKey(p);
  }
}
/** Lengkap (belum tentu benar): kotak terisi dan setiap baris/batang yang harus dibuat sudah diubah. */
export function partReady(p: Part, v: string): boolean {
  if (p.kind === "fill" || p.kind === "pikto" || p.kind === "bar") return cells(p, v).every(x => x.trim() !== "");
  return v !== "";
}
export const answerKey = (parts: Part[]) => parts.map(partKey).join(SEP);
export const correct = (q: CQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: CQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export function formatAnswer(q: CQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]);
    switch (p.kind) {
      case "fill": { let k = 0; return p.text.replace(/□/g, () => x[k++] || "…"); }
      case "choice": return `${p.label} ${v[i] || "…"}`;
      case "multi": return `${p.label} ${list(v[i]).sort().join(", ") || "…"}`;
      case "pikto": return p.edit.map((n, k) => `${n} ${x[k] || "…"} gambar`).join(", ");
      case "bar": return p.edit.map((n, k) => `${n} ${x[k] || "…"}`).join(", ");
      case "pick": return `${p.label} ${v[i] ? `diagram ${"PQR"[Number(v[i])]}` : "…"}`;
    }
  }).join(" | ");
}

/* ====================================================================== */
/* Materi                                                                  */
/* ====================================================================== */
export type Section = { title: string; lab: string; steps: string[]; example?: string; demo: string };
export type Topic = { code: string; title: string; short: string; sections: Section[] };
export const topics: Topic[] = [
  { code: "A", title: "Piktogram", short: "Piktogram", sections: [
    { title: "Menyajikan dan membaca piktogram", lab: "pikto", steps: [
      "Piktogram atau diagram gambar memakai gambar untuk menunjukkan banyaknya setiap kategori.",
      "Semua gambar dalam satu piktogram sama. Keterangan di bawah tabel menyebut nilai satu gambar, misalnya 1 gambar menyatakan 2 siswa.",
      "Membaca piktogram: hitung gambarnya, lalu kalikan dengan nilai satu gambar.",
      "Baris dengan gambar terbanyak adalah data paling banyak. Jumlahkan semua baris untuk mendapatkan total.",
    ], example: "Jika 1 gambar menyatakan 4 siswa, maka 6 gambar menyatakan 6 × 4 = 24 siswa.", demo: "Ketuk tambah atau kurangi untuk menyusun piktogram dari tabel. Ganti nilai satu gambar dan lihat banyak gambarnya berubah." },
  ] },
  { code: "B", title: "Diagram Batang", short: "Diagram batang", sections: [
    { title: "Menyajikan dan membaca diagram batang", lab: "bar", steps: [
      "Diagram batang memakai persegi panjang (batang) untuk menunjukkan banyaknya setiap kategori.",
      "Sumbu datar dan sumbu tegak saling tegak lurus. Satu sumbu berisi nama kategori, sumbu lainnya berisi banyaknya dengan skala yang sama.",
      "Diagram batang tegak dibaca dari tinggi batang. Diagram batang mendatar dibaca dari panjang batang.",
      "Jika ujung batang berada di antara dua garis skala, nilainya berada di antara kedua angka itu.",
    ], example: "Batang Catur setinggi garis 2, jadi 2 siswa ikut catur. Batang tertinggi menunjukkan lomba yang paling banyak diikuti.", demo: "Ketuk petak di atas nama kategori untuk mengatur tinggi batang. Ganti arah diagram menjadi mendatar." },
  ] },
];

/* ====================================================================== */
/* Pembuat soal                                                            */
/* ====================================================================== */
type Spec = { prompt: string; parts: Part[]; explanation: string; scene?: Scene; level?: Level };
const make = (topic: number) => (s: Spec): CQuestion => ({ ...s, topic, answer: answerKey(s.parts) });
const [A, B] = [make(0), make(1)];
const it = (o: Record<string, number>): Item[] => Object.entries(o).map(([name, value]) => ({ name, value }));
const pikto = (cat: string, head: string, icon: Icon, scale: number, o: Record<string, number>, hide?: string): Pikto => ({ kind: "pikto", cat, head, icon, scale, items: it(o), hide });
const bar = (dir: "v" | "h", cat: string, axis: string, step: number, max: number, o: Record<string, number>, color?: string): Bar => ({ kind: "bar", dir, cat, axis, step, max, items: it(o), color });
const chart = (c: Chart): Scene => ({ type: "chart", chart: c });
const table = (head: [string, string], o: Record<string, number>, across = false): Scene => ({ type: "table", head, rows: Object.entries(o), across });
/** Menghitung jawaban dari data. */
export function answerFor(c: Chart, a: Ask): number {
  const vis = c.items.filter(i => i.name !== c.hide), tot = vis.reduce((s, i) => s + i.value, 0);
  switch (a.f) {
    case "value": return valueOf(c, a.cat);
    case "sum": return a.cats.reduce((s, n) => s + valueOf(c, n), 0);
    case "total": return tot;
    case "diff": return Math.abs(valueOf(c, a.a) - valueOf(c, a.b));
    case "scale": return c.kind === "pikto" ? c.scale : c.step;
    case "icons": return valueOf(c, a.cat) / (c.kind === "pikto" ? c.scale : 1);
    case "missing": return (a.total - tot) / (c.kind === "pikto" ? c.scale : 1);
    case "range": return Math.max(...vis.map(i => i.value)) - Math.min(...vis.map(i => i.value));
  }
}
export function nameFor(c: Chart, a: AskName): string[] {
  const vs = c.items.map(i => i.value);
  switch (a.f) {
    case "max": return c.items.filter(i => i.value === Math.max(...vs)).map(i => i.name);
    case "min": return c.items.filter(i => i.value === Math.min(...vs)).map(i => i.name);
    case "which": return c.items.filter(i => i.value === a.value).map(i => i.name);
    case "twice": return c.items.filter(i => i.value === 2 * valueOf(c, a.of)).map(i => i.name);
  }
}
const fill = (c: Chart, text: string, ...ask: Ask[]): Part => ({ kind: "fill", text, ask, answers: ask.map(a => answerFor(c, a)) });
const choose = (c: Chart, label: string, ask: AskName, options = c.items.map(i => i.name)): Part => { const n = nameFor(c, ask); if (n.length !== 1) throw new Error(`${label}: jawaban tidak tunggal`); return { kind: "choice", label, options, answer: n[0], ask }; };
const more = (c: Chart, label: string, than: number): Part => ({ kind: "multi", label, more: than, options: c.items.map(i => i.name), answer: c.items.filter(i => i.value > than).map(i => i.name) });

/* ---------- Data ---------- */
const kelereng = { ...pikto("Nama", "Banyak Kelereng", "kelereng", 1, { Dina: 4, Rudi: 7, Sari: 3, Bima: 6 }), unit: "kelereng" };
const pinjam = { ...pikto("Hari", "Banyak Buku", "buku", 1, { Senin: 9, Selasa: 5, Rabu: 11, Kamis: 4, Jumat: 8 }), unit: "buku" };
const warna = { ...pikto("Warna", "Banyak Siswa", "siswa", 2, { Merah: 8, Biru: 12, Hijau: 6, Kuning: 10 }), unit: "siswa" };
const buahA = { ...pikto("Buah", "Banyak Buah", "apel", 1, { Apel: 7, Jeruk: 9, Mangga: 5, Salak: 6 }), unit: "buah" };
const lombaV = bar("v", "Lomba", "Banyak Siswa", 2, 16, { Matematika: 12, IPA: 7, "Bahasa Inggris": 10, Puisi: 4, Melukis: 9 });
const bungaH = bar("h", "Bunga", "Banyak Bunga", 1, 10, { Mawar: 6, Melati: 9, Sepatu: 3, Matahari: 5, Anggrek: 8 });
const sukaH = bar("h", "Olahraga", "Banyak Siswa", 1, 10, { Voli: 7, Renang: 4, Lari: 9, Senam: 5 });
const tabelB4 = { Buku: 6, Pensil: 9, Penggaris: 4, Penghapus: 7 };
const options3 = (o: Record<string, number>, wrong1: Record<string, number>, wrong2: Record<string, number>, order: number[]) => { const all = [o, wrong1, wrong2].map(x => bar("v", "Alat tulis", "Banyaknya", 1, 10, x)); return order.map(i => all[i]); };

/* ---------- Latihan (4 soal per subtopik) ---------- */
export const practice: CQuestion[][] = [
  [
    A({ prompt: "Buatlah piktogram dari tabel kelereng ini. Satu gambar menyatakan 1 kelereng.", scene: table(["Nama", "Banyak Kelereng"], { Dina: 4, Rudi: 7, Sari: 3, Bima: 6 }), parts: [{ kind: "pikto", chart: kelereng, edit: ["Dina", "Rudi", "Sari", "Bima"] }], explanation: "Setiap kelereng digambar satu: Dina 4, Rudi 7, Sari 3, dan Bima 6 gambar." }),
    A({ prompt: "Piktogram buku yang dipinjam dari perpustakaan.", scene: chart(pinjam), parts: [choose(pinjam, "Paling banyak dipinjam hari:", { f: "max" }), fill(pinjam, "Selasa = □ buku", { f: "value", cat: "Selasa" })], explanation: "Baris Rabu paling panjang dengan 11 gambar. Baris Selasa ada 5 gambar, jadi 5 buku." }),
    A({ prompt: "Piktogram warna kesukaan siswa. Perhatikan nilai satu gambar.", scene: chart(warna), parts: [fill(warna, "Biru = □ siswa", { f: "value", cat: "Biru" }), fill(warna, "Seluruhnya = □ siswa", { f: "total" })], explanation: "Satu gambar menyatakan 2 siswa. Biru 6 gambar = 12 siswa. Seluruhnya 4 + 6 + 3 + 5 = 18 gambar = 36 siswa." }),
    A({ prompt: "Piktogram buah di keranjang Bu Ani.", scene: chart(buahA), parts: [choose(buahA, "Buah yang banyaknya 9:", { f: "which", value: 9 }), fill(buahA, "Apel + mangga = □ buah", { f: "sum", cats: ["Apel", "Mangga"] })], explanation: "Baris jeruk ada 9 gambar. Apel 7 dan mangga 5, jumlahnya 12 buah." }),
  ],
  [
    B({ prompt: "Diagram batang siswa kelas IV yang mengikuti lomba.", scene: chart(lombaV), parts: [choose(lombaV, "Paling sedikit diikuti:", { f: "min" }), fill(lombaV, "Matematika = □ siswa", { f: "value", cat: "Matematika" })], explanation: "Batang Puisi paling pendek, yaitu 4 siswa. Batang Matematika sampai garis 12." }),
    B({ prompt: "Di taman ada 6 mawar, 9 melati, 3 bunga sepatu, 5 bunga matahari, dan 8 anggrek. Buatlah diagram batang mendatarnya.", parts: [{ kind: "bar", chart: bungaH, edit: ["Mawar", "Melati", "Sepatu", "Matahari", "Anggrek"] }], explanation: "Panjang setiap batang sama dengan banyak bunga: mawar 6, melati 9, sepatu 3, matahari 5, dan anggrek 8." }),
    B({ prompt: "Diagram batang olahraga kesukaan siswa.", scene: chart(sukaH), parts: [fill(sukaH, "Voli + renang = □ siswa", { f: "sum", cats: ["Voli", "Renang"] }), choose(sukaH, "Disukai 5 siswa:", { f: "which", value: 5 })], explanation: "Voli 7 dan renang 4, jumlahnya 11 siswa. Batang senam berhenti di angka 5." }),
    B({ prompt: "Diagram batang mana yang sesuai dengan tabel alat tulis ini?", scene: table(["Alat tulis", "Banyaknya"], tabelB4, true), parts: [{ kind: "pick", label: "Ketuk diagramnya:", charts: options3(tabelB4, { Buku: 6, Pensil: 7, Penggaris: 4, Penghapus: 9 }, { Buku: 9, Pensil: 6, Penggaris: 4, Penghapus: 7 }, [1, 0, 2]), answer: 1 }], explanation: "Tabel: buku 6, pensil 9, penggaris 4, penghapus 7. Diagram Q tingginya tepat sama. Diagram P menukar pensil dan penghapus, R menukar buku dan pensil." }),
  ],
];

/* ---------- Evaluasi (24 soal) ---------- */
const transport = { ...pikto("Alat transportasi", "Banyak Siswa", "siswa", 1, { Mobil: 4, "Sepeda motor": 12, Sepeda: 6, "Jalan kaki": 9 }), unit: "siswa" };
const meja = { Buku: 5, Spidol: 4, Penghapus: 2, Pulpen: 6, Taplak: 1 };
const porseni = bar("h", "Lomba", "Banyak Siswa", 1, 10, { Menyanyi: 8, Renang: 3, "Bulu tangkis": 6, Puisi: 7, Lari: 4, Catur: 5 }, "#e07a3a");
const pinjam2 = { ...pikto("Hari", "Banyak Buku", "buku", 1, { Senin: 12, Selasa: 7, Rabu: 14, Kamis: 5, Jumat: 9 }), unit: "buku" };
const ekskul = bar("v", "Ekstrakurikuler", "Banyak Siswa", 1, 10, { "Sepak bola": 9, Tari: 6, Pramuka: 8, Catur: 3, Basket: 5 });
const kueJual = { ...pikto("Hari", "Kue Terjual", "kue", 1, { Senin: 8, Selasa: 6, Rabu: 9, Kamis: 7 }), unit: "kue" };
const gambarV = bar("v", "Benda", "Banyaknya", 1, 8, { Buku: 5, Spidol: 4, Penghapus: 2, Pulpen: 6, Taplak: 1 });
const kelas = { ...pikto("Kelas", "Banyak Siswa", "siswa", 4, { I: 28, II: 24, III: 32, IV: 36, V: 20, VI: 28 }), unit: "siswa" };
const tanamH = bar("h", "Tanaman", "Banyak Pot", 1, 10, { Cabai: 5, Tomat: 8, Terong: 4, Seledri: 9, Bayam: 6 });
const telur = { ...pikto("Hari", "Banyak Telur", "telur", 5, { Senin: 20, Selasa: 35, Rabu: 15, Kamis: 30 }), unit: "telur" };
const lomba2 = bar("v", "Lomba", "Banyak Siswa", 2, 16, { Matematika: 15, IPA: 6, "Bahasa Inggris": 11, Puisi: 3, Pidato: 8 });
const buahB = { ...pikto("Buah", "Banyak Buah", "apel", 2, { Apel: 8, Jeruk: 12, Mangga: 6, Pisang: 10 }), unit: "buah" };
const tabelB7 = { Buku: 7, Pensil: 4, Penggaris: 8, Penghapus: 5 };
const pinjam3 = { ...pikto("Hari", "Banyak Buku", "buku", 2, { Senin: 10, Selasa: 14, Rabu: 8, Kamis: 12, Jumat: 6 }), unit: "buku" };
const hobiH = bar("h", "Hobi", "Banyak Siswa", 1, 10, { Membaca: 6, Menggambar: 8, Bersepeda: 4, Memasak: 3, Berkebun: 7 }, "#3f9b45");
const tabungan = bar("v", "Bulan", "Tabungan (ribu rupiah)", 5, 50, { Januari: 25, Februari: 40, Maret: 15, April: 35, Mei: 45 });
const kelompok = { ...pikto("Kelompok", "Banyak Bunga", "bunga", 3, { Mawar: 12, Melati: 18, Anggrek: 9, Kenanga: 15 }), unit: "bunga" };
const pakaian = bar("v", "Bulan", "Banyak Baju", 4, 40, { Juli: 24, Agustus: 36, September: 16, Oktober: 28 }, "#7c5cbf");
const panen = { ...pikto("Kebun", "Banyak Apel", "apel", 2, { "Pak Ali": 14, "Bu Tini": 10, "Pak Joko": 16, "Bu Sri": 0 }, "Bu Sri"), unit: "apel" };
const bolaKey = { ...pikto("Keranjang", "Banyak Bola", "bola", 5, { A: 30, B: 20, C: 35, D: 15 }), unit: "bola" };
const renangH = bar("h", "Lomba", "Banyak Siswa", 1, 12, { Lari: 9, Lompat: 7, Renang: 6, Senam: 10 }, "#e07a3a");
const sayurH = bar("h", "Sayur", "Banyak Ikat", 1, 10, { Wortel: 7, Kol: 3, Sawi: 9, Kangkung: 6, Buncis: 4 }, "#3f9b45");
const minat = { ...pikto("Olahraga", "Banyak Siswa", "siswa", 3, { "Sepak bola": 15, "Bulu tangkis": 9, Voli: 6, Catur: 12 }), unit: "siswa" };
const kegiatan = { ...pikto("Kegiatan", "Banyak Siswa", "siswa", 2, { Membaca: 6, Olahraga: 12, Melukis: 8, Menari: 4 }), unit: "siswa" };

export const assessment: CQuestion[] = [
  B({ level: "Sedang", prompt: "Diagram batang ekstrakurikuler yang diikuti siswa.", scene: chart(ekskul), parts: [choose(ekskul, "Paling banyak diikuti:", { f: "max" }), fill(ekskul, "Pramuka = □ siswa", { f: "value", cat: "Pramuka" })], explanation: "Batang Sepak bola paling tinggi (9 siswa). Batang Pramuka sampai garis 8." }),
  A({ level: "Sedang", prompt: "Piktogram alat transportasi siswa kelas IV ke sekolah.", scene: chart(transport), parts: [choose(transport, "Paling banyak dipakai:", { f: "max" }), fill(transport, "Sepeda = □ siswa", { f: "value", cat: "Sepeda" })], explanation: "Baris Sepeda motor paling panjang, 12 gambar. Baris Sepeda ada 6 gambar, jadi 6 siswa." }),
  B({ level: "Sedang", prompt: "Diagram batang lomba PORSENI.", scene: chart(porseni), parts: [choose(porseni, "Diikuti 3 siswa:", { f: "which", value: 3 }), fill(porseni, "Catur + renang = □ siswa", { f: "sum", cats: ["Catur", "Renang"] })], explanation: "Batang Renang berhenti di 3. Catur 5 dan renang 3, jumlahnya 8 siswa." }),
  A({ level: "Sedang", prompt: "Benda di meja guru. Sajikan dalam piktogram, 1 gambar = 1 benda.", scene: table(["Benda", "Banyaknya"], meja, true), parts: [{ kind: "pikto", chart: { ...pikto("Benda", "Banyaknya", "kotak", 1, meja), unit: "benda" }, edit: Object.keys(meja) }], explanation: "Gambarkan sebanyak datanya: buku 5, spidol 4, penghapus 2, pulpen 6, dan taplak 1 gambar." }),
  B({ level: "Sedang", prompt: "Benda di meja guru. Sajikan dalam diagram batang tegak.", scene: table(["Benda", "Banyaknya"], meja, true), parts: [{ kind: "bar", chart: gambarV, edit: Object.keys(meja) }], explanation: "Tinggi setiap batang sama dengan banyak benda: buku 5, spidol 4, penghapus 2, pulpen 6, dan taplak 1." }),
  A({ level: "Sedang", prompt: "Piktogram buku yang dipinjam siswa dari perpustakaan.", scene: chart(pinjam2), parts: [choose(pinjam2, "Dipinjam 14 buku hari:", { f: "which", value: 14 }), fill(pinjam2, "Kamis + Jumat = □ buku", { f: "sum", cats: ["Kamis", "Jumat"] })], explanation: "Baris Rabu ada 14 gambar. Kamis 5 dan Jumat 9, jumlahnya 14 buku." }),
  B({ level: "Sedang", prompt: "Diagram batang tanaman di kebun sekolah.", scene: chart(tanamH), parts: [choose(tanamH, "Paling sedikit:", { f: "min" }), fill(tanamH, "Seledri = □ pot", { f: "value", cat: "Seledri" })], explanation: "Batang Terong paling pendek (4 pot). Batang Seledri sampai angka 9." }),
  A({ level: "Sedang", prompt: "Piktogram kue yang terjual di kantin selama 4 hari.", scene: chart(kueJual), parts: [fill(kueJual, "Seluruhnya = □ kue", { f: "total" })], explanation: "Jumlahkan semua gambar: 8 + 6 + 9 + 7 = 30 kue." }),

  B({ level: "Menantang", prompt: "Di kelas IV ada 7 buku, 4 pensil, 8 penggaris, dan 5 penghapus. Diagram batang mana yang benar?", parts: [{ kind: "pick", label: "Ketuk diagramnya:", charts: options3(tabelB7, { Buku: 7, Pensil: 5, Penggaris: 8, Penghapus: 4 }, { Buku: 8, Pensil: 4, Penggaris: 7, Penghapus: 5 }, [2, 1, 0]), answer: 2 }], explanation: "Hanya diagram R yang batangnya tepat 7, 4, 8, dan 5. Diagram P menukar buku dan penggaris, Q menukar pensil dan penghapus." }),
  A({ level: "Menantang", prompt: "Piktogram banyak siswa setiap kelas. Perhatikan nilai satu gambar.", scene: chart(kelas), parts: [fill(kelas, "Kelas IV = □ siswa", { f: "value", cat: "IV" }), choose(kelas, "Siswanya 24 orang:", { f: "which", value: 24 })], explanation: "Satu gambar menyatakan 4 siswa. Kelas IV 9 gambar = 36 siswa. Kelas II 6 gambar = 24 siswa." }),
  B({ level: "Menantang", prompt: "Pedagang menjual 7 ikat wortel, 3 kol, 9 sawi, 6 kangkung, dan 4 buncis. Buatlah diagram batang mendatarnya.", parts: [{ kind: "bar", chart: sayurH, edit: sayurH.items.map(i => i.name) }], explanation: "Panjang batang sama dengan banyak ikat: wortel 7, kol 3, sawi 9, kangkung 6, dan buncis 4." }),
  A({ level: "Menantang", prompt: "Piktogram telur yang dikumpulkan dari kandang ayam.", scene: chart(telur), parts: [fill(telur, "Selasa = □ telur", { f: "value", cat: "Selasa" }), fill(telur, "Selisih Selasa dan Rabu = □ telur", { f: "diff", a: "Selasa", b: "Rabu" })], explanation: "Satu gambar 5 telur. Selasa 7 gambar = 35 telur, Rabu 3 gambar = 15 telur. Selisihnya 20 telur." }),
  B({ level: "Menantang", prompt: "Diagram batang lomba. Beberapa batang berhenti di antara dua garis.", scene: chart(lomba2), parts: [fill(lomba2, "Matematika = □ siswa", { f: "value", cat: "Matematika" }), fill(lomba2, "IPA + Pidato = □ siswa", { f: "sum", cats: ["IPA", "Pidato"] })], explanation: "Garis skalanya naik 2. Batang Matematika di tengah garis 14 dan 16, jadi 15 siswa. IPA 6 dan Pidato 8, jumlahnya 14." }),
  A({ level: "Menantang", prompt: "Buatlah piktogram dari tabel ini. Satu gambar = 2 buah.", scene: table(["Buah", "Banyak Buah"], { Apel: 8, Jeruk: 12, Mangga: 6, Pisang: 10 }), parts: [{ kind: "pikto", chart: buahB, edit: ["Apel", "Jeruk", "Mangga", "Pisang"] }], explanation: "Bagi setiap data dengan 2: apel 4, jeruk 6, mangga 3, dan pisang 5 gambar." }),
  B({ level: "Menantang", prompt: "Diagram batang hobi siswa. Pilih semua hobi yang disukai lebih dari 5 siswa.", scene: chart(hobiH), parts: [more(hobiH, "Lebih dari 5 siswa:", 5)], explanation: "Membaca 6, Menggambar 8, dan Berkebun 7 lebih dari 5. Bersepeda 4 dan Memasak 3 tidak." }),
  A({ level: "Menantang", prompt: "Piktogram buku yang dipinjam. Pilih semua hari dengan lebih dari 10 buku.", scene: chart(pinjam3), parts: [more(pinjam3, "Lebih dari 10 buku:", 10)], explanation: "Satu gambar 2 buku. Selasa 14 dan Kamis 12 lebih dari 10. Senin tepat 10, jadi tidak lebih dari 10." }),
  B({ level: "Menantang", prompt: "Diagram batang tabungan Rina setiap bulan.", scene: chart(tabungan), parts: [fill(tabungan, "Seluruhnya = □ ribu rupiah", { f: "total" })], explanation: "25 + 40 + 15 + 35 + 45 = 160 ribu rupiah." }),

  A({ level: "Sangat menantang", prompt: "Piktogram bunga yang ditanam setiap kelompok.", scene: chart(kelompok), parts: [choose(kelompok, "Dua kali banyak Anggrek:", { f: "twice", of: "Anggrek" }), fill(kelompok, "Seluruhnya = □ bunga", { f: "total" })], explanation: "Satu gambar 3 bunga. Anggrek 3 gambar = 9, dan Melati 6 gambar = 18, dua kali lipatnya. Seluruhnya 4 + 6 + 3 + 5 = 18 gambar = 54 bunga." }),
  B({ level: "Sangat menantang", prompt: "Diagram batang baju yang dijahit setiap bulan. Perhatikan skalanya. Berapa selisih bulan terbanyak dan tersedikit?", scene: chart(pakaian), parts: [fill(pakaian, "Selisih = □ baju", { f: "range" }), fill(pakaian, "Juli + Oktober = □ baju", { f: "sum", cats: ["Juli", "Oktober"] })], explanation: "Garis skalanya naik 4. Terbanyak Agustus 36, tersedikit September 16, selisihnya 20. Juli 24 dan Oktober 28, jumlahnya 52." }),
  A({ level: "Sangat menantang", prompt: "Hasil panen apel seluruhnya 52 buah. Baris Bu Sri belum digambar. Satu gambar menyatakan 2 apel.", scene: chart(panen), parts: [fill(panen, "Bu Sri perlu □ gambar", { f: "missing", total: 52 })], explanation: "Pak Ali 14, Bu Tini 10, Pak Joko 16, jumlahnya 40. Bu Sri 52 − 40 = 12 apel, jadi 12 : 2 = 6 gambar." }),
  B({ level: "Sangat menantang", prompt: "Piktogram ini diubah menjadi diagram batang. Diagram mana yang benar?", scene: chart(kegiatan), parts: [{ kind: "pick", label: "Ketuk diagramnya:", charts: [bar("v", "Kegiatan", "Banyak Siswa", 2, 14, { Membaca: 3, Olahraga: 6, Melukis: 4, Menari: 2 }), bar("v", "Kegiatan", "Banyak Siswa", 2, 14, { Membaca: 6, Olahraga: 12, Melukis: 8, Menari: 4 }), bar("v", "Kegiatan", "Banyak Siswa", 2, 14, { Membaca: 6, Olahraga: 12, Melukis: 4, Menari: 8 })], answer: 1 }], explanation: "Kalikan banyak gambar dengan 2: membaca 6, olahraga 12, melukis 8, menari 4. Diagram P lupa mengalikan 2, dan R menukar melukis dan menari." }),
  A({ level: "Sangat menantang", prompt: "Keranjang A berisi 30 bola dan digambar dengan 6 gambar.", scene: chart(bolaKey), parts: [fill(bolaKey, "1 gambar = □ bola", { f: "scale" }), fill(bolaKey, "Keranjang C = □ bola", { f: "value", cat: "C" })], explanation: "6 gambar menyatakan 30 bola, jadi 1 gambar = 30 : 6 = 5 bola. Keranjang C 7 gambar = 35 bola." }),
  B({ level: "Sangat menantang", prompt: "Diagram batang lomba ini menyajikan 32 siswa, tetapi batang Senam belum digambar. Gambarlah batang Senam.", parts: [{ kind: "bar", chart: { ...renangH, hide: undefined }, edit: ["Senam"] }], explanation: "Lari 9, lompat 7, dan renang 6, jumlahnya 22. Senam 32 − 22 = 10 siswa." }),
  A({ level: "Sangat menantang", prompt: "Piktogram olahraga kesukaan siswa. Berapa lebih banyak siswa yang menyukai Sepak bola daripada Voli?", scene: chart(minat), parts: [fill(minat, "Lebih banyak □ siswa", { f: "diff", a: "Sepak bola", b: "Voli" })], explanation: "Satu gambar 3 siswa. Sepak bola 5 gambar dan Voli 2 gambar, selisih 3 gambar = 9 siswa." }),
];
