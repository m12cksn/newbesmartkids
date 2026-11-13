/**
 * Kelas 9 Bab 2 - Bangun Ruang (Buku Siswa Matematika SMP/MTs Kelas IX, Kurikulum Merdeka 2022, hlm. 41-124).
 * A. Klasifikasi dan jaring-jaring  B. Luas permukaan sisi datar  C. Volume sisi datar  D. Lingkaran
 * E. Luas permukaan sisi lengkung  F. Volume sisi lengkung.
 * Bentuk jawaban mengikuti buku: mengenali bangun dari benda, jaring-jaring, benar/salah, isian bilangan dengan satuan,
 * tabel busur/juring, perubahan skala (k² dan k³), soal cerita, serta interaksi geometri: menyortir benda, menghubungkan
 * jaring-jaring dengan namanya, dan melengkapi jaring-jaring kubus.
 * Teks matematika memakai penanda: ^{…} pangkat, {a/b} pecahan bertumpuk, √{…} akar.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";
export const PI = 3.14, PI7 = 22 / 7;
const r2 = (v: number) => Math.round(v * 100) / 100;
const r6 = (v: number) => Math.round(v * 1e6) / 1e6;

/* ---------- Angka: 1.500 (ribuan), 0,15 (desimal), −3, pecahan 1/4 ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const f = /^(-?[\d.,]+)\/(-?[\d.,]+)$/.exec(t);
  if (f) { const a = num(f[1]), b = num(f[2]); return b === 0 ? NaN : a / b; }
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e6) / 1e6; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };

/* ---------- Jaring-jaring kubus: menggelindingkan kubus di atas petak ---------- */
type V3 = [number, number, number];
const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]];
export function isCubeNet(cells: [number, number][]): boolean {
  if (cells.length !== 6) return false;
  const keyOf = (c: [number, number]) => c.join(","), set = new Set(cells.map(keyOf));
  if (set.size !== 6) return false;
  const seen = new Map<string, { E: V3; N: V3; D: V3 }>([[keyOf(cells[0]), { E: [1, 0, 0], N: [0, 1, 0], D: [0, 0, -1] }]]), queue = [cells[0]];
  while (queue.length) {
    const c = queue.shift()!, f = seen.get(keyOf(c))!;
    const moves: [[number, number], { E: V3; N: V3; D: V3 }][] = [
      [[c[0] + 1, c[1]], { E: neg(f.D), N: f.N, D: f.E }], [[c[0] - 1, c[1]], { E: f.D, N: f.N, D: neg(f.E) }],
      [[c[0], c[1] - 1], { E: f.E, N: neg(f.D), D: f.N }], [[c[0], c[1] + 1], { E: f.E, N: f.D, D: neg(f.N) }]];
    for (const [nc, nf] of moves) if (set.has(keyOf(nc)) && !seen.has(keyOf(nc))) { seen.set(keyOf(nc), nf); queue.push(nc); }
  }
  if (seen.size !== 6) return false;
  return new Set([...seen.values()].map(f => f.D.join(","))).size === 6;
}

/* ---------- Gambar ---------- */
export type SolidKind = "kubus" | "balok" | "prisma3" | "limas4" | "limas6" | "tabung" | "kerucut" | "bola" | "setengahbola" | "frustum" | "pipa" | "kerucutbola" | "honai" | "bolakubus" | "kerucutprisma" | "bolatabung";
export type ObjectKind = "kaleng" | "bola" | "kardus" | "dadu" | "tenda" | "topi" | "piramida" | "ember";
export type NetKind = "kubus" | "balok" | "prisma3" | "limas4" | "tabung" | "kerucut" | "lingkaransegitiga" | "juring";
export type Scene =
  | { type: "solid"; kind: SolidKind; labels?: Record<string, string>; caption?: string }
  | { type: "object"; kind: ObjectKind }
  | { type: "net"; kind: NetKind; labels?: Record<string, string> }
  | { type: "circle"; r: string; theta?: number; mode?: "busur" | "juring" | "keliling"; inner?: string }
  | { type: "cubes"; p: number; l: number; t: number; hole?: [number, number] }
  | { type: "lshape"; outer: number; notch: number; height: number; unit: string }
  | { type: "pool"; length: number; width: number; shallow: number; deep: number }
  | { type: "card"; title: string; lines: string[] };

export type Part =
  | { kind: "num"; label: string; value: number; unit?: string; pre?: string; tol?: number }
  | { kind: "choice"; label: string; options: string[]; answer: string; pics?: Scene[] }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] }
  | { kind: "sort"; bins: string[]; items: { name: string; pic: Scene; answer: string }[] }
  | { kind: "match"; left: { pic: Scene; answer: string }[]; right: string[] }
  | { kind: "cubenet"; label: string; cells: [number, number][]; slots: [number, number][] };

export type BQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[]; id?: string };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "sort" ? p.items.length : p.kind === "match" ? p.left.length : 1);
export const cells = (p: Part, v: string) => { const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
const str = (n: number) => idn(n).replace(/\./g, "");
export const validSlots = (p: { cells: [number, number][]; slots: [number, number][] }) => p.slots.filter(s => isCubeNet([...p.cells, s]));
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [str(p.value)];
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
    case "sort": return p.items.map(i => i.answer);
    case "match": return p.left.map(l => l.answer);
    case "cubenet": { const v = validSlots(p); if (v.length !== 1) throw new Error("jaring kubus harus tepat satu petak benar"); return [v[0].join(",")]; }
  }
}
const near = (a: number, b: number, tol = 0) => !Number.isNaN(a) && Math.abs(a - b) <= Math.max(tol, 1e-9 * Math.max(1, Math.abs(b)));
function partCorrect(p: Part, v: string): boolean {
  if (p.kind === "num") return near(num(v), p.value, p.tol);
  return cells(p, v).join("|") === fields(p).join("|");
}
const partReady = (p: Part, v: string) => (p.kind === "num" || p.kind === "choice" || p.kind === "cubenet" ? v.trim() !== "" : cells(p, v).every(c => c.trim() !== ""));
export const correct = (q: BQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: BQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: BQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${p.pre ?? ""}${v[i] || "…"}${p.unit ? ` ${plain(p.unit)}` : ""}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
      case "sort": return p.items.map((it, k) => `${it.name} → ${x[k]}`).join("; ");
      case "match": return p.left.map((_, k) => `gambar ${k + 1} → ${x[k]}`).join("; ");
      case "cubenet": return `${plain(p.label)} petak (${v[i] || "…"})`;
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene; id?: string } = {}): BQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string, extra: { pre?: string; tol?: number } = {}): Part => ({ kind: "num", label, value: r6(value), unit, ...extra });
const ch = (label: string, options: string[], answer: string, pics?: Scene[]): Part => ({ kind: "choice", label, options, answer, pics });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const solid = (kind: SolidKind, labels?: Record<string, string>): Scene => ({ type: "solid", kind, labels });
const obj = (kind: ObjectKind): Scene => ({ type: "object", kind });
const net = (kind: NetKind, labels?: Record<string, string>): Scene => ({ type: "net", kind, labels });
const T = 0.01; // toleransi pembulatan dua angka di belakang koma

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Klasifikasi Bangun Ruang dan Jaring-Jaring", sections: [
    { title: "Jenis-jenis bangun ruang", lab: "kinds", steps: [
      "Bangun ruang dibagi menjadi dua kelompok: bangun ruang sisi datar (kubus, balok, prisma, limas) dan bangun ruang sisi lengkung (tabung, kerucut, bola).",
      "Prisma mempunyai dua sisi alas yang sama dan sejajar (alas dan tutup), sedangkan sisi tegaknya berbentuk persegi panjang. Balok adalah prisma yang alasnya persegi panjang, dan kubus adalah balok yang semua rusuknya sama panjang.",
      "Limas mempunyai satu alas berbentuk segi banyak dan sisi tegak berbentuk segitiga yang bertemu di satu titik puncak. Namanya mengikuti bentuk alas: limas segitiga, limas segi empat, dan seterusnya.",
      "Tabung mempunyai dua alas lingkaran dan satu sisi lengkung (selimut). Kerucut mempunyai satu alas lingkaran dan satu selimut yang meruncing ke puncak. Bola hanya mempunyai satu sisi lengkung. Kerucut yang ujungnya dipotong disebut kerucut terpotong.",
      "Untuk bangun sisi datar berlaku rumus polihedron Euler: S + T − R = 2, dengan S banyak sisi, T banyak titik sudut, dan R banyak rusuk. Kubus: 6 + 8 − 12 = 2.",
    ], life: "Lihat isi tas belanja: kardus susu berbentuk balok, kaleng sarden berbentuk tabung, dadu berbentuk kubus, kerucut es krim berbentuk kerucut, dan ember berbentuk kerucut terpotong. Bentuk kemasan dipilih karena fungsinya: balok mudah ditumpuk di rak tanpa celah, tabung kuat menahan tekanan dari dalam (cocok untuk minuman bersoda), dan bola mudah menggelinding.",
      example: "Tentukan banyak sisi, titik sudut, dan rusuk prisma segitiga, lalu periksa rumus Euler.",
      work: ["Sisi: 2 segitiga (alas dan tutup) + 3 persegi panjang = 5.", "Titik sudut: 3 di bawah + 3 di atas = 6.", "Rusuk: 3 di alas + 3 di tutup + 3 tegak = 9.", "S + T − R = 5 + 6 − 9 = 2. Rumus Euler terpenuhi."],
      notes: ["Kubus termasuk balok, dan balok termasuk prisma. Jadi rumus prisma juga berlaku untuk balok dan kubus.", "Rumus Euler hanya untuk bangun sisi datar (polihedron); tabung, kerucut, dan bola tidak mempunyai rusuk lurus seperti polihedron.", "Rumah adat Honai di Papua berbentuk gabungan tabung dan setengah bola."],
      demo: "Pilih bangun ruang. Gambarnya, contoh benda sehari-hari, serta banyak sisi, titik sudut, dan rusuknya ditampilkan." },
    { title: "Jaring-jaring bangun ruang", lab: "nets", steps: [
      "Jaring-jaring adalah gambar dua dimensi berupa gabungan beberapa bangun datar yang dapat dilipat menjadi sebuah bangun ruang.",
      "Satu bangun ruang dapat mempunyai banyak jaring-jaring. Kubus mempunyai 11 jaring-jaring yang berbeda, bergantung pada rusuk mana yang digunting.",
      "Tidak semua susunan enam persegi adalah jaring-jaring kubus. Susunan yang membuat dua persegi bertumpuk saat dilipat, misalnya lima persegi berjajar, bukan jaring-jaring kubus.",
      "Jaring-jaring prisma terdiri atas dua alas dan persegi panjang sebanyak sisi alasnya. Jaring-jaring limas terdiri atas satu alas dan segitiga sebanyak sisi alasnya.",
      "Jaring-jaring tabung: dua lingkaran dan satu persegi panjang yang panjangnya sama dengan keliling lingkaran. Jaring-jaring kerucut: satu lingkaran dan satu juring. Bola tidak mempunyai jaring-jaring karena permukaannya tidak dapat dibuka menjadi datar tanpa disobek.",
    ], life: "Kardus bekas mi instan yang digunting di rusuk-rusuknya dan dibuka menjadi lembaran datar adalah jaring-jaring balok. Pabrik kemasan mencetak jaring-jaring ini di atas karton, lalu melipatnya menjadi kardus. Cara menggunting yang berbeda menghasilkan jaring-jaring yang berbeda, tetapi luas kartonnya tetap sama.",
      example: "Lima persegi disusun berjajar, lalu satu persegi ditempel di atas persegi kedua. Apakah ini jaring-jaring kubus?",
      work: ["Lima persegi berjajar: saat dilipat, persegi pertama dan kelima menempati sisi yang sama.", "Dua persegi bertumpuk berarti ada sisi kubus yang tidak tertutup.", "Jadi susunan itu bukan jaring-jaring kubus.", "Jika hanya empat persegi berjajar dengan satu persegi di atas dan satu di bawah, susunannya adalah jaring-jaring kubus."],
      notes: ["Periksa jaring-jaring kubus dengan membayangkan melipat: setiap persegi harus menjadi sisi yang berbeda.", "Panjang persegi panjang pada jaring-jaring tabung = keliling alas = 2πr.", "Panjang busur juring pada jaring-jaring kerucut = keliling alas kerucut."],
      demo: "Pilih bangun ruang dan geser tingkat lipatan. Jaring-jaringnya terlipat menjadi bangun ruang atau terbuka kembali." },
  ] },
  { code: "B", title: "Luas Permukaan Bangun Ruang Sisi Datar", sections: [
    { title: "Luas permukaan kubus, balok, dan prisma", lab: "lpprism", steps: [
      "Luas permukaan adalah jumlah luas semua sisi bangun ruang, dinyatakan dalam satuan persegi (cm², m²). Bayangkan banyaknya kertas yang diperlukan untuk membungkus bangun itu tanpa tumpang tindih.",
      "Cara paling aman: gambar jaring-jaringnya, hitung luas setiap bangun datar, lalu jumlahkan.",
      "Kubus dengan rusuk s: L = 6 × s², karena ada 6 persegi yang sama.",
      "Balok dengan panjang p, lebar l, tinggi t: L = 2 × (p × l + p × t + l × t), karena sisi yang berhadapan sama luas.",
      "Prisma dengan luas alas A, keliling alas K, dan tinggi t: L = 2 × A + K × t. Sisi tegaknya jika dibentangkan menjadi satu persegi panjang berukuran K × t.",
    ], life: "Untuk membungkus kado berbentuk kotak 30 cm × 20 cm × 10 cm, kertas kado yang diperlukan paling sedikit 2(600 + 300 + 200) = 2.200 cm², ditambah sedikit untuk lipatan. Tukang cat menghitung luas dinding kamar dengan cara yang sama, lalu mengurangkan luas pintu dan jendela.",
      example: "Sebuah tenda berbentuk prisma segitiga dengan alas segitiga 6 m, 8 m, 10 m (siku-siku) dan panjang tenda 12 m. Berapa luas kain seluruhnya?",
      work: ["Luas alas segitiga = {1/2} × 6 × 8 = 24 m².", "Keliling alas = 6 + 8 + 10 = 24 m.", "L = 2 × 24 + 24 × 12 = 48 + 288 = 336 m².", "Jika tenda tanpa lantai, kurangi luas sisi alas yang menempel tanah."],
      notes: ["Rubik 6 × 6 × 6: setiap sisi memuat 36 stiker, total 6 × 36 = 216 stiker. Ini cara lain melihat 6 × s².", "Satuan luas permukaan selalu persegi: cm², bukan cm atau cm³.", "Untuk kotak tanpa tutup, kurangi satu sisi alas dari rumusnya."],
      demo: "Pilih kubus, balok, atau prisma segitiga dan atur ukurannya. Luas setiap sisi pada jaring-jaring dan jumlahnya ditampilkan." },
    { title: "Luas permukaan limas", lab: "lppyr", steps: [
      "Luas permukaan limas = luas alas + jumlah luas semua sisi tegak (segitiga).",
      "Pada limas segi-n beraturan dengan sisi alas b, apotema alas a, dan tinggi sisi tegak l: L = {1/2} × n × b × (l + a) = {1/2} × K × (l + a), dengan K = n × b.",
      "Tinggi sisi tegak l berbeda dengan tinggi limas t. Pada limas persegi dengan sisi alas b: l^{2} = t^{2} + ({b/2})^{2} (teorema Pythagoras).",
      "Untuk limas yang alasnya tidak beraturan, gambar jaring-jaringnya lalu hitung luas setiap segitiga satu per satu.",
      "Atap rumah berbentuk limas biasanya tidak mempunyai alas, jadi luas gentengnya hanya jumlah luas sisi tegak.",
    ], life: "Atap rumah limasan berbentuk limas persegi tanpa alas. Jika sisi alas atap 8 m dan tinggi setiap segitiga 5 m, luas atap = 4 × {1/2} × 8 × 5 = 80 m². Dengan 25 genteng per m², diperlukan sekitar 2.000 genteng. Tukang menambah sedikit cadangan untuk genteng yang pecah.",
      example: "Limas persegi mempunyai sisi alas 10 cm dan tinggi limas 12 cm. Tentukan luas permukaannya.",
      work: ["Tinggi sisi tegak: l^{2} = 12^{2} + 5^{2} = 169, l = 13 cm.", "Luas satu segitiga = {1/2} × 10 × 13 = 65 cm².", "Luas alas = 10 × 10 = 100 cm².", "L = 100 + 4 × 65 = 360 cm²."],
      notes: ["Kesalahan yang sering terjadi: memakai tinggi limas sebagai tinggi segitiga sisi tegak.", "Untuk alas persegi, apotema a = {1/2} × sisi alas, jadi rumus {1/2} × K × (l + a) juga memberi 100 + 260 = 360 cm².", "Satu jaring-jaring limas segi empat terdiri atas 1 persegi dan 4 segitiga."],
      demo: "Atur banyak sisi alas, panjang sisi alas, dan tinggi sisi tegak limas beraturan. Luas alas, luas sisi tegak, dan luas permukaan dihitung." },
    { title: "Pengaruh perubahan skala terhadap luas permukaan", lab: "scaleA", steps: [
      "Mengubah bangun ruang dengan faktor skala k berarti setiap rusuknya dikalikan k. k > 1 memperbesar, 0 < k < 1 memperkecil.",
      "Setiap sisi adalah bangun datar yang panjang dan lebarnya sama-sama dikali k, jadi luasnya dikali k × k = k^{2}.",
      "Karena itu luas permukaan bangun ruang yang diubah dengan skala k menjadi k^{2} kali luas semula.",
      "Contoh: kubus rusuk 2 m, L = 24 m². Diperbesar skala 2: rusuk 4 m, L = 96 m² = 2^{2} × 24.",
      "Jika diperkecil dengan skala 0,5, luas permukaannya menjadi 0,25 kali semula.",
    ], life: "Kardus ukuran besar yang semua rusuknya dua kali kardus kecil membutuhkan karton empat kali lebih banyak, bukan dua kali. Itulah sebabnya harga kemasan besar naik lebih cepat daripada ukurannya: bahan pembungkusnya bertambah menurut k^{2}.",
      example: "Balok 2 cm × 3 cm × 4 cm diperbesar dengan skala 3. Tentukan luas permukaan sebelum dan sesudahnya.",
      work: ["Sebelum: 2(6 + 8 + 12) = 52 cm².", "Sesudah: 6 cm × 9 cm × 12 cm, L = 2(54 + 72 + 108) = 468 cm².", "468 : 52 = 9 = 3^{2}.", "Jadi luasnya menjadi 9 kali semula."],
      notes: ["Faktor skala berlaku untuk semua rusuk sekaligus. Jika hanya tinggi yang diubah, aturan k^{2} tidak berlaku.", "Dari luas, faktor skala dapat dicari: luas menjadi 16 kali berarti k = 4.", "Skala 0,5 berarti setengah kali, bukan dikurangi 0,5."],
      demo: "Atur rusuk kubus dan faktor skala. Luas permukaan sebelum dan sesudah serta perbandingannya dibandingkan dengan k^{2}." },
  ] },
  { code: "C", title: "Volume Bangun Ruang Sisi Datar", sections: [
    { title: "Volume kubus, balok, dan prisma", lab: "vprism", steps: [
      "Volume adalah ukuran banyaknya ruang yang ditempati bangun ruang, dinyatakan dalam kubus satuan (cm³, m³). 1 dm³ = 1 liter dan 1 m³ = 1.000 liter.",
      "Balok p × l × t dapat diisi p × l kubus satuan pada lapisan pertama, dan ada t lapisan. Jadi V = p × l × t.",
      "Kubus dengan rusuk s: V = s^{3}.",
      "Prisma dengan luas alas A dan tinggi t: V = A × t. Balok dan kubus adalah prisma yang alasnya persegi panjang atau persegi.",
      "Bangun gabungan atau berlubang: pecah menjadi beberapa prisma lalu jumlahkan, atau hitung bangun utuh lalu kurangi bagian yang kosong.",
    ], life: "Akuarium berbentuk balok 60 cm × 30 cm × 40 cm berisi 60 × 30 × 40 = 72.000 cm³ = 72 liter air. Jika tinggi air hanya 35 cm agar tidak tumpah, airnya 63 liter. Penjual pasir menghitung muatan truk dengan cara yang sama: panjang × lebar × tinggi bak.",
      example: "Balok 8 × 8 × 5 kubus satuan mempunyai lubang tembus berukuran 4 × 4 × 5 di tengahnya. Berapa volumenya?",
      work: ["Volume jika penuh: 8 × 8 × 5 = 320 kubus satuan.", "Volume lubang: 4 × 4 × 5 = 80 kubus satuan.", "Volume bangun: 320 − 80 = 240 kubus satuan.", "Cara lain: bagi menjadi 4 prisma 6 × 2 × 5 = 60, lalu 4 × 60 = 240."],
      notes: ["Prisma miring mempunyai volume yang sama dengan prisma tegak yang alas dan tingginya sama (prinsip Cavalieri, seperti tumpukan kartu yang digeser).", "Tinggi prisma adalah jarak antara kedua alasnya, belum tentu ukuran yang tegak pada gambar.", "Perhatikan satuan: semua ukuran harus satuan yang sama sebelum dikalikan."],
      demo: "Atur panjang, lebar, dan tinggi, lalu tambahkan lapisan kubus satuan satu per satu sampai balok penuh." },
    { title: "Volume limas", lab: "vpyr", steps: [
      "Limas dan prisma dengan alas dan tinggi yang sama: isi limas dengan pasir lalu tuang ke prisma. Diperlukan tepat tiga kali tuangan sampai prisma penuh.",
      "Jadi volume limas = {1/3} × volume prisma = {1/3} × A × t, dengan A luas alas dan t tinggi limas.",
      "Tinggi limas adalah jarak tegak dari puncak ke alas, bukan tinggi sisi tegak.",
      "Untuk alas segi-n beraturan, hitung luas alas sebagai n segitiga: A = {1/2} × keliling × apotema.",
      "Limas terpotong dapat dihitung sebagai limas besar dikurangi limas kecil di bagian atasnya.",
    ], life: "Piramida Khafre di Mesir beralas persegi 215,5 m dengan tinggi 136,4 m. Volumenya {1/3} × 215,5^{2} × 136,4 ≈ 2.111.000 m³, kira-kira setara 845 kolam renang olimpiade. Candi Sukuh di Karanganyar berbentuk limas terpotong.",
      example: "Piramida segi enam beraturan dengan sisi 6 m (apotema ≈ 5,2 m) dan tinggi 8 m dibangun dari bata beton 10 cm × 10 cm × 10 cm. Perkirakan banyak bata.",
      work: ["Luas alas = {1/2} × (6 × 6) × 5,2 = 93,6 m².", "Volume = {1/3} × 93,6 × 8 = 249,6 m³.", "Volume satu bata = 0,1 × 0,1 × 0,1 = 0,001 m³.", "Banyak bata ≈ 249,6 : 0,001 = 249.600 buah, ditambah cadangan untuk potongan di sisi miring."],
      notes: ["Perbandingan volume limas dan prisma dengan alas dan tinggi sama selalu 1 : 3.", "Satuan volume selalu kubik: m³ atau cm³.", "Untuk banyak benda yang mengisi ruang, bagi volume ruang dengan volume satu benda."],
      demo: "Atur sisi alas dan tinggi, lalu tuang isi limas ke prisma. Setelah tiga kali tuangan prisma penuh." },
    { title: "Pengaruh perubahan skala terhadap volume", lab: "scaleV", steps: [
      "Jika bangun ruang diubah dengan skala k, panjang, lebar, dan tinggi masing-masing dikali k.",
      "Volume adalah hasil kali tiga ukuran, jadi volume menjadi k × k × k = k^{3} kali semula.",
      "Kubus rusuk 3 m, V = 27 m³. Diperbesar skala 3: rusuk 9 m, V = 729 m³ = 27 × 27 = 3^{3} × 27.",
      "Diperkecil skala 0,75: volume menjadi 0,75^{3} = 0,421875 kali semula.",
      "Bandingkan: luas permukaan berubah k^{2} kali, volume berubah k^{3} kali.",
    ], life: "Kotak tisu ukuran keluarga yang setiap rusuknya 1,5 kali kotak biasa memuat 1,5^{3} ≈ 3,4 kali lebih banyak tisu, tetapi kartonnya hanya 1,5^{2} = 2,25 kali. Inilah alasan kemasan besar biasanya lebih hemat per lembar.",
      example: "Balok 5 × 3 × 7 diubah dengan skala 4. Tentukan volumenya setelah diubah.",
      work: ["Volume awal = 5 × 3 × 7 = 105.", "Ukuran baru 20 × 12 × 28.", "Volume baru = 6.720.", "6.720 : 105 = 64 = 4^{3}."],
      notes: ["Volume dua kali lipat tidak berarti rusuk dua kali lipat: rusuknya hanya ∛{2} ≈ 1,26 kali.", "Jika volume menjadi 27 kali, faktor skalanya 3.", "Aturan k^{3} hanya berlaku jika semua ukuran diubah dengan skala yang sama."],
      demo: "Atur ukuran balok dan faktor skala. Volume sebelum dan sesudah serta perbandingannya dengan k^{3} dibandingkan." },
  ] },
  { code: "D", title: "Lingkaran", sections: [
    { title: "Keliling lingkaran", lab: "circ", steps: [
      "Lingkaran adalah kumpulan semua titik pada bidang yang jaraknya sama terhadap satu titik tertentu (titik pusat).",
      "Jari-jari (r) menghubungkan titik pusat dengan titik pada lingkaran. Diameter (d) menghubungkan dua titik pada lingkaran melalui pusat, jadi d = 2r.",
      "Untuk setiap lingkaran, keliling dibagi diameter hasilnya sama, yaitu π ≈ 3,14 atau {22/7}.",
      "Jadi keliling lingkaran K = π × d = 2 × π × r.",
      "Pakai π = {22/7} jika jari-jari atau diameternya kelipatan 7, dan π = 3,14 untuk ukuran lain.",
    ], life: "Roda sepeda berdiameter 70 cm menempuh {22/7} × 70 = 220 cm dalam satu putaran. Setelah 500 putaran, sepeda sudah berjalan 1.100 m. Speedometer sepeda motor bekerja dengan prinsip yang sama: menghitung putaran roda lalu mengalikannya dengan keliling roda.",
      example: "Tentukan keliling lingkaran yang jari-jarinya 14 cm.",
      work: ["d = 2 × 14 = 28 cm.", "K = π × d ≈ {22/7} × 28.", "K = 88 cm.", "Periksa: K : d = 88 : 28 ≈ 3,14."],
      notes: ["Jari-jari tidak menghubungkan dua titik pada lingkaran; itu tali busur atau diameter.", "Keliling berbanding lurus dengan diameter: diameter dua kali, keliling juga dua kali.", "Hasil dengan π adalah perkiraan, sehingga dapat ditulis ≈."],
      demo: "Atur jari-jari dan pilih nilai π. Roda digelindingkan satu putaran dan panjang lintasannya dibandingkan dengan diameter." },
    { title: "Luas lingkaran", lab: "carea", steps: [
      "Busur adalah bagian lingkaran. Juring adalah daerah yang dibatasi dua jari-jari dan busur di antaranya.",
      "Bagi lingkaran menjadi banyak juring yang sama, lalu susun berselang-seling. Hasilnya menyerupai jajar genjang.",
      "Alas jajar genjang itu setengah keliling = π × r, dan tingginya jari-jari r. Luasnya π × r × r.",
      "Jadi luas lingkaran L = π × r^{2}.",
      "Jika yang diketahui diameter, cari jari-jarinya dulu: r = {d/2}, atau gunakan L = {1/4} × π × d^{2}.",
    ], life: "Pizza berdiameter 30 cm luasnya 3,14 × 15^{2} = 706,5 cm², sedangkan pizza 20 cm hanya 314 cm². Pizza 30 cm lebih dari dua kali lipat luasnya, walaupun diameternya hanya 1,5 kali. Bandingkan harganya per cm² sebelum memilih ukuran.",
      example: "Taman berbentuk lingkaran berjari-jari 10 m mempunyai kolam lingkaran berjari-jari 4 m di tengahnya. Sisanya ditanami rumput. Berapa luas rumput?",
      work: ["Luas taman = 3,14 × 10^{2} = 314 m².", "Luas kolam = 3,14 × 4^{2} = 50,24 m².", "Luas rumput = 314 − 50,24 = 263,76 m².", "Cara singkat: 3,14 × (100 − 16) = 263,76 m²."],
      notes: ["Luas lingkaran berbanding lurus dengan kuadrat jari-jari: jari-jari dua kali, luasnya empat kali.", "Satuan luas: cm² atau m².", "Jangan memakai diameter langsung pada π × r^{2}."],
      demo: "Atur jari-jari dan banyak juring. Juring disusun ulang menjadi bentuk yang mendekati jajar genjang berukuran πr × r." },
    { title: "Panjang busur lingkaran", lab: "arc", steps: [
      "Sudut pusat adalah sudut yang dibentuk oleh dua jari-jari lingkaran. Satu putaran penuh = 360°.",
      "Busur di hadapan sudut pusat θ adalah bagian {θ/360} dari keliling lingkaran.",
      "Panjang busur = {θ/360} × K = {θ/360} × 2πr.",
      "Panjang busur sebanding dengan sudut pusat: sudut dua kali lebih besar, busurnya dua kali lebih panjang.",
      "Jika panjang busur diketahui, sudut pusat dapat dicari: θ = {panjang busur/K} × 360°.",
    ], life: "Bundaran HI di Jakarta berjari-jari sekitar 50 m. Bagian bundaran di antara dua jalan yang membentuk sudut pusat 75° panjangnya {75/360} × 2 × 3,14 × 50 ≈ 65,42 m. Jarum menit jam dinding sepanjang 14 cm menempuh busur {90/360} × 2 × {22/7} × 14 = 22 cm dalam 15 menit.",
      example: "Lingkaran berjari-jari 21 cm. Lengkapi panjang busur untuk sudut pusat 60°, 120°, dan 180°.",
      work: ["K = 2 × {22/7} × 21 = 132 cm.", "60°: {60/360} × 132 = 22 cm.", "120°: 44 cm; 180°: 66 cm.", "Setiap sudut bertambah 60°, panjang busur bertambah 22 cm."],
      notes: ["Busur 180° adalah setengah lingkaran, panjangnya setengah keliling.", "Gunakan keliling, bukan luas, untuk menghitung panjang busur.", "Jarum jam berputar 6° setiap menit (360° : 60)."],
      demo: "Atur jari-jari dan sudut pusat. Busur yang dipilih ditebalkan dan panjangnya dihitung." },
    { title: "Luas juring lingkaran", lab: "sector", steps: [
      "Juring dengan sudut pusat θ adalah bagian {θ/360} dari daerah lingkaran.",
      "Luas juring = {θ/360} × L = {θ/360} × π × r^{2}.",
      "Luas juring sebanding dengan sudut pusatnya: {θ₁/θ₂} = {luas juring₁/luas juring₂}.",
      "Juring 90° adalah seperempat lingkaran, juring 180° setengah lingkaran.",
      "Daerah berbentuk cincin atau juring cincin dihitung sebagai juring besar dikurangi juring kecil.",
    ], life: "Lapangan tolak peluru berbentuk juring dengan sudut pusat sekitar 35° sampai 40°. Satu potong pizza dari 8 potongan sama besar adalah juring 45°, luasnya {1/8} pizza. Penyiram rumput yang berputar 120° membasahi juring {1/3} lingkaran.",
      example: "Lingkaran berjari-jari 15 cm. Tentukan luas juring yang sudut pusatnya 60°.",
      work: ["Luas lingkaran = 3,14 × 15^{2} = 706,5 cm².", "Bagian juring = {60/360} = {1/6}.", "Luas juring = {1/6} × 706,5 = 117,75 cm².", "Periksa: juring 120° pada lingkaran ini luasnya dua kali, yaitu 235,5 cm²."],
      notes: ["Panjang busur memakai keliling; luas juring memakai luas lingkaran.", "Luas juring bersatuan persegi, panjang busur bersatuan panjang.", "Jika dua juring di lingkaran yang sama, perbandingan luasnya sama dengan perbandingan sudutnya."],
      demo: "Atur jari-jari dan sudut pusat. Juring diarsir, lalu bagian {θ/360} dan luasnya ditampilkan." },
  ] },
  { code: "E", title: "Luas Permukaan Bangun Ruang Sisi Lengkung", sections: [
    { title: "Luas permukaan tabung", lab: "lpcyl", steps: [
      "Jaring-jaring tabung terdiri atas dua lingkaran (alas dan tutup) dan satu persegi panjang (selimut).",
      "Panjang persegi panjang selimut sama dengan keliling alas 2πr, dan lebarnya sama dengan tinggi tabung t.",
      "Luas permukaan tabung = 2 × πr^{2} + 2πrt = 2πr(r + t).",
      "Tabung tanpa tutup (seperti gelas atau ember lurus): πr^{2} + 2πrt. Pipa terbuka di kedua ujung: hanya selimut 2πrt.",
      "Jika yang diketahui diameter, ingat r = {d/2}.",
    ], life: "Drum minyak berdiameter 58 cm dan tinggi 93 cm luas permukaannya sekitar 2,22 m². Dengan rumus kebutuhan cat (luas × DFT) : (VS% × 10), cat dengan DFT 50 dan VS 45% memerlukan sekitar 0,25 liter untuk satu drum. Pabrik kaleng susu juga menghitung luas pelat sebelum memotongnya.",
      example: "Tentukan luas permukaan tabung tertutup dengan jari-jari 7 cm dan tinggi 10 cm.",
      work: ["Luas alas dan tutup = 2 × {22/7} × 7^{2} = 308 cm².", "Luas selimut = 2 × {22/7} × 7 × 10 = 440 cm².", "Luas permukaan = 308 + 440 = 748 cm².", "Dengan rumus 2πr(r + t) = 2 × {22/7} × 7 × 17 = 748 cm²."],
      notes: ["Selimut tabung adalah persegi panjang, bukan lingkaran.", "Baca soal: tertutup, tanpa tutup, atau terbuka di kedua ujung.", "Ubah cm² ke m² dengan membagi 10.000."],
      demo: "Atur jari-jari dan tinggi, pilih tertutup atau tanpa tutup. Jaring-jaring tabung dan luas setiap bagiannya ditampilkan." },
    { title: "Luas permukaan kerucut", lab: "lpcone", steps: [
      "Jaring-jaring kerucut terdiri atas satu lingkaran (alas) dan satu juring (selimut).",
      "Jari-jari juring sama dengan garis pelukis s (panjang sisi miring kerucut), dan panjang busurnya sama dengan keliling alas 2πr.",
      "Garis pelukis dihitung dengan teorema Pythagoras: s = √{r^{2} + t^{2}}.",
      "Luas selimut = πrs. Luas permukaan kerucut = πr^{2} + πrs = πr(r + s).",
      "Sudut juring pada jaring-jaring = {r/s} × 360°.",
    ], life: "Topi ulang tahun adalah kerucut tanpa alas, jadi kertas yang diperlukan hanya selimutnya, πrs. Rumah adat Mbaru Niang di Wae Rebo, NTT, berbentuk kerucut setinggi sekitar 15 m; luas atap ilalangnya dihitung dengan rumus selimut kerucut.",
      example: "Kerucut berjari-jari 5 cm dan tinggi 12 cm. Tentukan luas permukaannya.",
      work: ["s = √{5^{2} + 12^{2}} = √{169} = 13 cm.", "Luas alas = 3,14 × 25 = 78,5 cm².", "Luas selimut = 3,14 × 5 × 13 = 204,1 cm².", "Luas permukaan = 282,6 cm²."],
      notes: ["Jangan memakai tinggi t sebagai garis pelukis s.", "Tumpeng yang ditutupi daun pisang hanya memerlukan luas selimut.", "Tripel Pythagoras seperti 3-4-5, 5-12-13, 7-24-25 sering dipakai dalam soal."],
      demo: "Atur jari-jari dan tinggi kerucut. Garis pelukis, sudut juring, dan jaring-jaringnya dihitung dan digambar." },
    { title: "Luas permukaan bola", lab: "lpsphere", steps: [
      "Kupas kulit bola plastik, lalu tempelkan pada lingkaran-lingkaran yang jari-jarinya sama dengan jari-jari bola. Kulit itu tepat menutupi empat lingkaran.",
      "Jadi luas permukaan bola = 4 × luas lingkaran = 4πr^{2}.",
      "Setengah bola terbuka (seperti mangkuk) luasnya 2πr^{2}. Setengah bola tertutup (dengan alas datar) luasnya 3πr^{2}.",
      "Luas permukaan bola berbanding lurus dengan kuadrat jari-jarinya.",
      "Untuk bangun gabungan, jumlahkan hanya bagian yang terlihat dari luar.",
    ], life: "Bumi berdiameter sekitar 12.750 km, jadi luas permukaannya ≈ 4 × 3,14 × 6.375^{2} ≈ 510 juta km². Luas daratan Indonesia sekitar 1,9 juta km² dan wilayah totalnya sekitar 7,81 juta km², kira-kira 1,53% permukaan Bumi. Pabrik bola sepak menghitung luas kulit sintetis dengan rumus 4πr^{2}.",
      example: "Kubah setengah bola tertutup berjari-jari 14 m. Berapa luas permukaannya?",
      work: ["Setengah kulit bola: 2 × {22/7} × 14^{2} = 1.232 m².", "Lantai lingkaran: {22/7} × 14^{2} = 616 m².", "Luas permukaan = 1.232 + 616 = 1.848 m².", "Atau langsung 3πr^{2} = 3 × 616 = 1.848 m²."],
      notes: ["Luas bola = 4 kali luas lingkaran besar, bukan 2 kali.", "Rumah Honai: dinding tabung tanpa alas dan tutup ditambah atap setengah bola.", "Bandingkan dua bola dengan perbandingan kuadrat jari-jarinya."],
      demo: "Atur jari-jari bola. Kulit bola dibandingkan dengan empat lingkaran yang jari-jarinya sama." },
    { title: "Pengaruh perubahan skala terhadap luas permukaan sisi lengkung", lab: "scaleC", steps: [
      "Mengubah tabung, kerucut, atau bola dengan skala k berarti jari-jari, tinggi, dan garis pelukisnya dikali k.",
      "Setiap rumus luas memuat perkalian dua ukuran panjang (r × r, r × t, r × s), jadi luas permukaan menjadi k^{2} kali.",
      "Kemasan tabung d = 10 cm, t = 10 cm luasnya 150π cm². Diperkecil 0,75: d = 7,5 cm, t = 7,5 cm, luasnya 84,375π cm² = 0,75^{2} × 150π.",
      "Aturannya sama dengan bangun ruang sisi datar.",
      "Jika luas permukaan diketahui menjadi m kali, faktor skalanya k = √{m}.",
    ], life: "Usaha garam milik Matulessy memakai kemasan tabung. Kemasan kecil dengan ukuran 0,75 kali kemasan besar hanya butuh 0,5625 kali bahan. Jika satu kemasan besar butuh Rp1.000,00 bahan, kemasan kecil cukup sekitar Rp562,50. Informasi ini dipakai untuk menentukan harga jual.",
      example: "Tabung d = 10 cm, t = 7 cm diperbesar dua kali. Tentukan luas permukaan sebelum dan sesudah.",
      work: ["Sebelum: 2π(5)^{2} + 2π(5)(7) = 50π + 70π = 120π cm².", "Sesudah: r = 10, t = 14: 2π(100) + 2π(10)(14) = 480π cm².", "480π : 120π = 4 = 2^{2}.", "Bahan kemasan baru empat kali bahan kemasan lama."],
      notes: ["Menulis hasil dalam π (misalnya 120π) membuat perbandingan lebih mudah.", "Skala 1,5 membuat luas 2,25 kali.", "Jika hanya tinggi yang diubah, perbandingan luas tidak sama dengan k^{2}."],
      demo: "Pilih tabung, kerucut, atau bola, atur ukurannya dan faktor skala. Luas sebelum dan sesudah dibandingkan dengan k^{2}." },
  ] },
  { code: "F", title: "Volume Bangun Ruang Sisi Lengkung", sections: [
    { title: "Volume tabung", lab: "vcyl", steps: [
      "Tabung seperti prisma yang alasnya lingkaran: volume = luas alas × tinggi.",
      "V = πr^{2}t.",
      "Pipa atau tabung berongga: volume bahan = πR^{2}t − πr^{2}t = πt(R^{2} − r^{2}), dengan R jari-jari luar dan r jari-jari dalam.",
      "Setengah tabung (talang, tempat minum ternak): V = {1/2}πr^{2}t.",
      "Ubah ke liter: 1 dm³ = 1 liter, 1 m³ = 1.000 liter, 1.000 cm³ = 1 liter.",
    ], life: "Truk tangki dengan tangki tabung berdiameter 2 m dan panjang 12 m memuat 3,14 × 1^{2} × 12 = 37,68 m³ = 37.680 liter. Toren air di rumah, kaleng cat, dan gelas juga dihitung isinya dengan rumus πr^{2}t.",
      example: "Pipa besi panjang 100 m, jari-jari dalam 35 cm, jari-jari luar 36 cm. Nyatakan volume besinya dalam π.",
      work: ["t = 100 m = 10.000 cm.", "V = π × 10.000 × (36^{2} − 35^{2}).", "36^{2} − 35^{2} = (36 + 35)(36 − 35) = 71.", "V = 710.000π cm³."],
      notes: ["Prisma persegi yang memuat tabung dengan sisi alas = diameter mempunyai volume lebih besar.", "Satuan volume selalu kubik.", "Pastikan jari-jari dan tinggi bersatuan sama."],
      demo: "Atur jari-jari, tinggi, dan tebal dinding. Volume tabung penuh, rongga, dan bahannya dihitung." },
    { title: "Volume kerucut", lab: "vcone", steps: [
      "Isi kerucut dengan pasir, lalu tuang ke tabung yang alas dan tingginya sama. Tabung penuh setelah tiga kali tuangan.",
      "Jadi volume kerucut = {1/3} × volume tabung = {1/3}πr^{2}t.",
      "Hubungan ini sama seperti limas dan prisma.",
      "Tinggi yang dipakai adalah tinggi tegak t, bukan garis pelukis s.",
      "Untuk ruang di antara dua bangun (misalnya kerucut di dalam prisma), kurangkan volume yang kecil dari yang besar.",
    ], life: "Corong es krim berdiameter 7 cm dan tinggi 12 cm memuat {1/3} × {22/7} × 3,5^{2} × 12 = 154 cm³ es krim (tanpa bagian yang menonjol di atas). Tumpeng berdiameter 30 cm dan tinggi 40 cm berisi sekitar 9.420 cm³ nasi.",
      example: "Kerucut diletakkan di dalam prisma persegi bersisi 12 cm dan tinggi 16 cm (tinggi kerucut sama). Berapa volume prisma yang tidak terisi?",
      work: ["V prisma = 12 × 12 × 16 = 2.304 cm³.", "Jari-jari kerucut = 6 cm. V kerucut = {1/3} × 3,14 × 36 × 16 = 602,88 cm³.", "Sisa = 2.304 − 602,88 = 1.701,12 cm³.", "Perbandingan V tabung : V kerucut (r dan t sama) selalu 3 : 1."],
      notes: ["Jika volume tabung 600 cm³, kerucut dengan r dan t sama volumenya 200 cm³.", "Dua kerucut dengan volume sama: kerucut yang alasnya lebih besar lebih pendek.", "Kerucut terpancung = kerucut besar − kerucut kecil."],
      demo: "Atur jari-jari dan tinggi, lalu tuang isi kerucut ke tabung. Tabung penuh setelah tiga kali tuangan." },
    { title: "Volume bola", lab: "vsphere", steps: [
      "Buat kerucut terbuka dengan jari-jari alas r dan tinggi r. Isinya dituang dua kali ke setengah bola berjari-jari r sampai penuh.",
      "Volume setengah bola = 2 × {1/3}πr^{2} × r = {2/3}πr^{3}. Jadi volume bola = {4/3}πr^{3}.",
      "Untuk tabung yang tepat memuat bola (jari-jari r, tinggi 2r): V kerucut : V bola : V tabung = 1 : 2 : 3.",
      "Kulit atau lapisan bola: volume bola luar dikurangi volume bola dalam.",
      "Volume bola berbanding lurus dengan pangkat tiga jari-jarinya.",
    ], life: "Tangki gas berbentuk bola berdiameter 30 m memuat {4/3} × 3,14 × 15^{3} = 14.130 m³ = 14.130.000 liter gas. Kerak Bumi setebal sekitar 24 km hanya sekitar 1,13% volume Bumi. Bola sepak berjari-jari 11 cm berisi sekitar {4/3} × 3,14 × 11^{3} ≈ 5.572 cm³ udara, kira-kira 5,6 liter.",
      example: "Tentukan volume bola berjari-jari 21 cm.",
      work: ["r^{3} = 21 × 21 × 21 = 9.261.", "V = {4/3} × {22/7} × 9.261.", "V = 38.808 cm³.", "Isinya sekitar 38,8 liter."],
      notes: ["Volume bola memakai r^{3}, luas bola memakai r^{2}.", "Bola di dalam kubus yang menyinggung semua sisi: V bola : V kubus = π : 6.", "Ruang kosong dalam kemasan = volume kemasan − volume benda di dalamnya."],
      demo: "Atur jari-jari. Kerucut berjari-jari r dan tinggi r dituang ke setengah bola, lalu volume bola dihitung." },
    { title: "Pengaruh perubahan skala terhadap volume sisi lengkung", lab: "scaleCV", steps: [
      "Tabung, kerucut, atau bola yang diubah dengan skala k: semua ukuran panjang dikali k.",
      "Volume memuat perkalian tiga ukuran panjang, jadi volume menjadi k^{3} kali.",
      "Luas permukaan menjadi k^{2} kali dan volume menjadi k^{3} kali.",
      "Bola berjari-jari 10 cm diperkecil menjadi 5 cm (k = {1/2}): luas menjadi {1/4} kali dan volume {1/8} kali.",
      "Gabungan kerucut dan setengah bola yang diperbesar dua kali: luas 4 kali, volume 8 kali.",
    ], life: "Kafe kopi menjual gelas tabung kecil dan besar. Jika ukuran gelas besar 1,25 kali gelas kecil, isinya 1,25^{3} ≈ 1,95 kali, hampir dua kali lipat. Karena itu harga gelas besar boleh hampir dua kali harga gelas kecil walaupun gelasnya tidak tampak jauh lebih besar.",
      example: "Kemasan tabung garam d = 10 cm, t = 10 cm diperkecil menjadi 0,75 kalinya. Bandingkan volumenya.",
      work: ["V besar = π × 5^{2} × 10 = 250π cm³.", "V kecil = π × 3,75^{2} × 7,5 = 105,46875π cm³.", "Perbandingan = 105,46875 : 250 = 0,421875.", "0,421875 = 0,75^{3}."],
      notes: ["Untuk perbandingan, tidak perlu mengganti π dengan angka.", "Volume 8 kali berarti skala 2, volume 27 kali berarti skala 3.", "Perbandingan luas dan volume berbeda untuk faktor skala yang sama."],
      demo: "Atur jari-jari bola dan faktor skala. Luas dan volume sebelum dan sesudah dibandingkan dengan k^{2} dan k^{3}." },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Benda dan jaring-jaring untuk interaksi ---------- */
const OBJ: Record<ObjectKind, string> = { kaleng: "Kaleng susu", bola: "Bola basket", kardus: "Kardus", dadu: "Dadu", tenda: "Tenda", topi: "Topi ulang tahun", piramida: "Piramida", ember: "Ember" };
const item = (k: ObjectKind, answer: string) => ({ name: OBJ[k], pic: obj(k), answer });
export const objectName = OBJ;

/* ---------- Latihan: 4 soal per bagian ---------- */
export const practice: BQuestion[][] = [
  // A.1
  [
    q(0, "Sortir benda berikut ke kotak yang sesuai: ketuk benda, lalu ketuk kotaknya.", [{ kind: "sort", bins: ["Sisi datar", "Sisi lengkung"], items: [item("kardus", "Sisi datar"), item("kaleng", "Sisi lengkung"), item("dadu", "Sisi datar"), item("bola", "Sisi lengkung"), item("tenda", "Sisi datar"), item("topi", "Sisi lengkung")] }],
      "Kardus (balok), dadu (kubus), dan tenda (prisma segitiga) bersisi datar. Kaleng (tabung), bola, dan topi (kerucut) mempunyai sisi lengkung."),
    q(0, "Benda pada gambar menyerupai bangun ruang apa?", [ch("Jawaban:", ["Tabung", "Kerucut", "Kerucut terpotong", "Limas"], "Kerucut terpotong")],
      "Ember mempunyai dua alas lingkaran yang ukurannya berbeda: kerucut yang ujungnya dipotong.", { scene: obj("ember") }),
    q(0, "Tentukan banyak sisi, titik sudut, dan rusuk prisma segitiga.", [n("Sisi (S) =", 5), n("Titik sudut (T) =", 6), n("Rusuk (R) =", 9)],
      "2 segitiga + 3 persegi panjang = 5 sisi; 6 titik sudut; 9 rusuk. S + T − R = 5 + 6 − 9 = 2.", { scene: solid("prisma3") }),
    q(0, "Benar atau salah?", [tf(["Kubus termasuk balok.", true], ["Balok termasuk prisma.", true], ["Bola mempunyai tepat satu sisi lengkung.", true], ["Limas segi empat mempunyai 4 sisi.", false])],
      "Kubus adalah balok dengan rusuk sama panjang, balok adalah prisma beralas persegi panjang. Limas segi empat mempunyai 1 alas dan 4 sisi tegak, jadi 5 sisi."),
  ],
  // A.2
  [
    q(1, "Jaring-jaring manakah yang dapat dilipat menjadi prisma segitiga?", [ch("Jawaban:", ["a", "b", "c", "d"], "c", [net("kubus"), net("limas4"), net("prisma3"), net("tabung")])],
      "Prisma segitiga: dua segitiga dan tiga persegi panjang (c)."),
    q(1, "Hubungkan setiap jaring-jaring dengan nama bangunnya: ketuk gambar, lalu ketuk namanya.", [{ kind: "match", left: [{ pic: net("limas4"), answer: "Limas segi empat" }, { pic: net("kerucut"), answer: "Kerucut" }, { pic: net("kubus"), answer: "Kubus" }, { pic: net("tabung"), answer: "Tabung" }], right: ["Kubus", "Tabung", "Kerucut", "Limas segi empat"] }],
      "Persegi dengan empat segitiga: limas segi empat. Lingkaran dan juring: kerucut. Enam persegi: kubus. Dua lingkaran dan persegi panjang: tabung."),
    q(1, "Lengkapi jaring-jaring kubus berikut: ketuk satu petak putus-putus sehingga susunannya dapat dilipat menjadi kubus.", [{ kind: "cubenet", label: "Petak tambahan:", cells: [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0]], slots: [[4, 1], [1, 0], [2, 2], [3, 0]] }],
      "Empat persegi berjajar menjadi selimut. Satu persegi di atas sudah menjadi tutup, jadi persegi tambahan harus di bawah sebagai alas. Lima berjajar atau dua persegi bersebelahan di atas akan bertumpuk."),
    q(1, "Benar atau salah?", [tf(["Bola dapat dibuat jaring-jaringnya.", false], ["Jaring-jaring kerucut terdiri atas sebuah lingkaran dan sebuah juring.", true], ["Satu bangun ruang hanya mempunyai satu jaring-jaring.", false])],
      "Kulit bola tidak dapat dibuka menjadi datar. Kubus saja mempunyai 11 jaring-jaring berbeda."),
  ],
  // B.1
  [
    q(2, "Tentukan luas permukaan kubus dan balok berikut.", [n("Kubus dengan rusuk 5 cm: L =", 6 * 5 * 5, "cm²"), n("Balok 4 cm × 5 cm × 6 cm: L =", 2 * (20 + 24 + 30), "cm²")],
      "Kubus: 6 × 25 = 150 cm². Balok: 2(20 + 24 + 30) = 148 cm²."),
    q(2, "Ahmad mengganti stiker rubik 5 × 5 × 5 dengan stiker persegi berwarna, satu warna untuk setiap sisi.", [n("Banyak warna =", 6), n("Stiker setiap warna =", 25), n("Total stiker =", 150)],
      "Rubik berbentuk kubus dengan 6 sisi. Setiap sisi 5 × 5 = 25 stiker. Total 6 × 25 = 150 stiker.", { scene: solid("kubus", { s: "5 kotak" }) }),
    q(2, "Kotak pensil logam berukuran 20 cm × 10 cm × 3 cm. Berapa luas logam yang diperlukan?", [n("Luas logam =", 2 * (200 + 60 + 30), "cm²")],
      "2(20 × 10 + 20 × 3 + 10 × 3) = 2(200 + 60 + 30) = 580 cm².", { scene: solid("balok", { p: "20 cm", l: "10 cm", t: "3 cm" }) }),
    q(2, "Tenda berbentuk prisma segitiga dengan alas segitiga siku-siku 6 m, 8 m, 10 m dan panjang 12 m. Tentukan luas kain jika semua sisinya tertutup.", [n("Luas alas segitiga =", 24, "m²"), n("Luas permukaan =", 2 * 24 + 24 * 12, "m²")],
      "Luas alas {1/2} × 6 × 8 = 24 m². Keliling alas 24 m. L = 2 × 24 + 24 × 12 = 336 m².", { scene: solid("prisma3", { a: "6 m", b: "8 m", c: "10 m", t: "12 m" }) }),
  ],
  // B.2
  [
    q(3, "Limas segi empat beraturan mempunyai sisi alas 4 cm dan tinggi sisi tegak 6 cm. Tentukan luas permukaannya.", [n("Luas permukaan =", 16 + 4 * 0.5 * 4 * 6, "cm²")],
      "Alas 4 × 4 = 16 cm². Empat segitiga: 4 × {1/2} × 4 × 6 = 48 cm². Total 64 cm².", { scene: solid("limas4", { b: "4 cm", l: "6 cm" }) }),
    q(3, "Limas persegi mempunyai sisi alas 10 cm dan tinggi limas 12 cm.", [n("Tinggi sisi tegak =", 13, "cm"), n("Luas permukaan =", 100 + 2 * 10 * 13, "cm²")],
      "l^{2} = 12^{2} + 5^{2} = 169, l = 13. L = 100 + 4 × {1/2} × 10 × 13 = 360 cm².", { scene: solid("limas4", { b: "10 cm", t: "12 cm" }) }),
    q(3, "Limas segi enam beraturan mempunyai sisi alas 4 cm, apotema alas 3,5 cm, dan tinggi sisi tegak 9 cm. Gunakan L = {1/2} × n × b × (l + a).", [n("Luas permukaan =", 0.5 * 6 * 4 * (9 + 3.5), "cm²")],
      "{1/2} × 6 × 4 × (9 + 3,5) = 12 × 12,5 = 150 cm².", { scene: solid("limas6", { b: "4 cm", a: "3,5 cm", l: "9 cm" }) }),
    q(3, "Atap rumah limasan berbentuk limas persegi tanpa alas dengan sisi alas 8 m dan tinggi setiap segitiga 5 m. Setiap 1 m² memerlukan 25 genteng.", [n("Luas atap =", 4 * 0.5 * 8 * 5, "m²"), n("Banyak genteng =", 80 * 25)],
      "4 × {1/2} × 8 × 5 = 80 m². Genteng 80 × 25 = 2.000 buah."),
  ],
  // B.3
  [
    q(4, "Kubus berusuk 3 m diubah dengan faktor skala 0,5.", [n("Luas permukaan sebelum =", 54, "m²"), n("Luas permukaan sesudah =", 13.5, "m²"), n("Luas menjadi … kali semula:", 0.25)],
      "Sebelum 6 × 9 = 54. Rusuk baru 1,5 m, luas 6 × 2,25 = 13,5. 13,5 : 54 = 0,25 = 0,5^{2}."),
    q(4, "Balok 2 cm × 3 cm × 4 cm diubah dengan skala 3.", [n("Luas permukaan sesudah =", 2 * (54 + 72 + 108), "cm²"), n("Luas menjadi … kali semula:", 9)],
      "Ukuran baru 6 × 9 × 12: 2(54 + 72 + 108) = 468 cm². Semula 52 cm², jadi 9 kali."),
    q(4, "Prisma diperbesar sehingga setiap rusuknya menjadi 3 kali semula. Luas permukaannya menjadi …", [ch("Jawaban:", ["3 kali", "6 kali", "9 kali", "27 kali"], "9 kali")],
      "Luas berubah k^{2} = 3^{2} = 9 kali."),
    q(4, "Luas permukaan sebuah kubus 96 cm². Kubus itu diperbesar dengan faktor skala 2,5.", [n("Luas permukaan baru =", 96 * 6.25, "cm²")],
      "96 × 2,5^{2} = 96 × 6,25 = 600 cm²."),
  ],
  // C.1
  [
    q(5, "Berapa banyak kubus satuan yang menyusun balok berikut?", [n("Volume =", 4 * 3 * 2, "kubus satuan")],
      "Lapisan bawah 4 × 3 = 12 kubus, ada 2 lapisan: 24 kubus satuan.", { scene: { type: "cubes", p: 4, l: 3, t: 2 } }),
    q(5, "Balok 6 × 6 × 4 kubus satuan mempunyai lubang tembus 2 × 2 × 4 di tengahnya. Berapa volumenya?", [n("Volume =", 6 * 6 * 4 - 2 * 2 * 4, "kubus satuan")],
      "6 × 6 × 4 = 144, lubang 2 × 2 × 4 = 16. Volume 144 − 16 = 128 kubus satuan.", { scene: { type: "cubes", p: 6, l: 6, t: 4, hole: [2, 2] } }),
    q(5, "Akuarium berbentuk huruf L. Alasnya persegi 30 cm × 30 cm yang salah satu pojoknya dipotong persegi 15 cm × 15 cm, dan tingginya 20 cm.", [n("Luas alas =", 900 - 225, "cm²"), n("Volume =", 675 * 20, "cm³")],
      "Luas alas 900 − 225 = 675 cm². Volume 675 × 20 = 13.500 cm³ = 13,5 liter.", { scene: { type: "lshape", outer: 30, notch: 15, height: 20, unit: "cm" } }),
    q(5, "Prisma segitiga mempunyai alas segitiga dengan alas 9 cm dan tinggi 9 cm, serta tinggi prisma 12 cm.", [n("Volume =", 0.5 * 9 * 9 * 12, "cm³")],
      "Luas alas {1/2} × 9 × 9 = 40,5 cm². Volume 40,5 × 12 = 486 cm³.", { scene: solid("prisma3", { a: "9 cm", ta: "9 cm", t: "12 cm" }) }),
  ],
  // C.2
  [
    q(6, "Limas persegi bersisi alas 6 cm dan tinggi 10 cm. Tentukan volumenya.", [n("Volume =", (36 * 10) / 3, "cm³")],
      "{1/3} × 36 × 10 = 120 cm³.", { scene: solid("limas4", { b: "6 cm", t: "10 cm" }) }),
    q(6, "Prisma dan limas mempunyai alas dan tinggi yang sama. Volume prisma 240 cm³. Berapa volume limas?", [n("Volume limas =", 80, "cm³")],
      "Volume limas = {1/3} × 240 = 80 cm³."),
    q(6, "Sebuah piramida beralas persegi bersisi 200 m dan tingginya 135 m. Tentukan volumenya.", [n("Volume =", (200 * 200 * 135) / 3, "m³")],
      "{1/3} × 40.000 × 135 = 1.800.000 m³."),
    q(6, "Limas segi enam beraturan bersisi alas 6 m, apotema alas 5,2 m, dan tinggi 10 m disusun dari bata beton bervolume 0,001 m³.", [n("Luas alas =", 0.5 * 36 * 5.2, "m²"), n("Volume limas =", (0.5 * 36 * 5.2 * 10) / 3, "m³"), n("Perkiraan banyak bata =", (0.5 * 36 * 5.2 * 10) / 3 / 0.001)],
      "Luas alas {1/2} × 36 × 5,2 = 93,6 m². Volume {1/3} × 93,6 × 10 = 312 m³. Bata 312 : 0,001 = 312.000.", { scene: solid("limas6", { b: "6 m", a: "5,2 m", t: "10 m" }) }),
  ],
  // C.3
  [
    q(7, "Kubus berusuk 4 m diubah dengan faktor skala 0,75.", [n("Volume sebelum =", 64, "m³"), n("Volume sesudah =", 27, "m³"), n("Volume menjadi … kali semula:", 0.421875)],
      "Rusuk baru 3 m: 27 m³. 27 : 64 = 0,421875 = 0,75^{3}."),
    q(7, "Balok berukuran 5 × 3 × 7 diubah dengan skala 4. Tentukan volume setelah diubah.", [n("Volume =", 105 * 64)],
      "Volume semula 105, menjadi 105 × 4^{3} = 6.720."),
    q(7, "Setiap rusuk sebuah limas diperbesar menjadi 2 kali. Volumenya menjadi …", [ch("Jawaban:", ["2 kali", "4 kali", "6 kali", "8 kali"], "8 kali")],
      "Volume berubah k^{3} = 2^{3} = 8 kali."),
    q(7, "Volume sebuah prisma 50 cm³. Setelah diperbesar dengan faktor skala k, volumenya 1.350 cm³.", [n("k =", 3)],
      "1.350 : 50 = 27 = 3^{3}, jadi k = 3."),
  ],
  // D.1
  [
    q(8, "Tentukan keliling lingkaran yang jari-jarinya 14 cm (π = {22/7}).", [n("Keliling =", 88, "cm")], "K = 2 × {22/7} × 14 = 88 cm.", { scene: { type: "circle", r: "14 cm", mode: "keliling" } }),
    q(8, "Tentukan keliling lingkaran yang diameternya 50 cm (π = 3,14).", [n("Keliling =", 157, "cm")], "K = 3,14 × 50 = 157 cm."),
    q(8, "Roda sepeda berdiameter 70 cm berputar 100 kali (π = {22/7}). Berapa jarak yang ditempuh?", [n("Keliling roda =", 220, "cm"), n("Jarak =", 220, "m")],
      "K = {22/7} × 70 = 220 cm. 100 putaran = 22.000 cm = 220 m."),
    q(8, "Benar atau salah?", [tf(["Jari-jari adalah ruas garis yang menghubungkan dua titik pada lingkaran.", false], ["Diameter panjangnya dua kali jari-jari.", true], ["Perbandingan keliling dan diameter lingkaran sekitar 3,14.", true])],
      "Jari-jari menghubungkan titik pusat dengan titik pada lingkaran."),
  ],
  // D.2
  [
    q(9, "Tentukan luas lingkaran yang jari-jarinya 28 cm (π = {22/7}).", [n("Luas =", PI7 * 28 * 28, "cm²")], "{22/7} × 28 × 28 = 2.464 cm²."),
    q(9, "Tentukan luas lingkaran yang diameternya 30 cm (π = 3,14).", [n("Luas =", PI * 225, "cm²")], "r = 15 cm. 3,14 × 225 = 706,5 cm²."),
    q(9, "Taman lingkaran berjari-jari 10 m mempunyai kolam lingkaran berjari-jari 4 m di tengahnya. Sisanya ditanami rumput seharga Rp50.000,00 per m² (π = 3,14).", [n("Luas rumput =", PI * 84, "m²"), n("Biaya rumput =", PI * 84 * 50000, undefined, { pre: "Rp" })],
      "3,14 × (100 − 16) = 263,76 m². Biaya 263,76 × 50.000 = 13.188.000.", { scene: { type: "circle", r: "10 m", inner: "4 m" } }),
    q(9, "Luas sebuah lingkaran 154 cm² (π = {22/7}). Berapa jari-jarinya?", [n("Jari-jari =", 7, "cm")], "{22/7} × r^{2} = 154, r^{2} = 49, r = 7 cm."),
  ],
  // D.3
  [
    q(10, "Lingkaran berjari-jari 21 cm (π = {22/7}). Tentukan panjang busur di hadapan sudut pusat 60°.", [n("Panjang busur =", 22, "cm")], "{60/360} × 2 × {22/7} × 21 = {1/6} × 132 = 22 cm.", { scene: { type: "circle", r: "21 cm", theta: 60, mode: "busur" } }),
    q(10, "Bagian bundaran berjari-jari 40 m di antara dua jalan membentuk sudut pusat 45° (π = 3,14). Berapa panjangnya?", [n("Panjang busur =", (45 / 360) * 2 * PI * 40, "m")], "{45/360} × 2 × 3,14 × 40 = 31,4 m."),
    q(10, "Lengkapi tabel panjang busur pada lingkaran berjari-jari 21 cm (π = {22/7}).", [n("θ = 120°: busur =", 44, "cm"), n("θ = 180°: busur =", 66, "cm"), n("θ = 300°: busur =", 110, "cm")],
      "K = 132 cm. 120°: {1/3} × 132 = 44. 180°: 66. 300°: {5/6} × 132 = 110."),
    q(10, "Pada lingkaran berjari-jari 21 cm (π = {22/7}), panjang sebuah busur 33 cm. Berapa sudut pusatnya?", [n("Sudut pusat =", 90, "°")], "K = 132 cm. {33/132} × 360° = 90°."),
  ],
  // D.4
  [
    q(11, "Lingkaran berjari-jari 15 cm (π = 3,14). Tentukan luas juring yang sudut pusatnya 60°.", [n("Luas juring =", 117.75, "cm²")], "{60/360} × 3,14 × 225 = 117,75 cm².", { scene: { type: "circle", r: "15 cm", theta: 60, mode: "juring" } }),
    q(11, "Tentukan luas juring dengan sudut pusat 135° dan jari-jari 21 cm (π = {22/7}).", [n("Luas juring =", (135 / 360) * PI7 * 441, "cm²")], "{135/360} × 1.386 = 519,75 cm²."),
    q(11, "Lengkapi tabel luas juring pada lingkaran berjari-jari 10 (π = 3,14; luas lingkaran 314).", [n("θ = 180°: luas =", 157), n("θ = 90°: luas =", 78.5), n("θ = 36°: luas =", 31.4)],
      "{180/360} × 314 = 157. {90/360} × 314 = 78,5. {36/360} × 314 = 31,4."),
    q(11, "Daerah pendaratan tolak peluru berbentuk juring berjari-jari 20 m dengan sudut pusat 45° (π = 3,14). Rumput seharga Rp45.000,00 per m².", [n("Luas daerah =", (45 / 360) * PI * 400, "m²"), n("Biaya =", 157 * 45000, undefined, { pre: "Rp" })],
      "{45/360} × 3,14 × 400 = 157 m². Biaya 157 × 45.000 = 7.065.000.", { scene: { type: "circle", r: "20 m", theta: 45, mode: "juring" } }),
  ],
  // E.1
  [
    q(12, "Tentukan luas permukaan tabung tertutup berjari-jari 7 cm dan tinggi 10 cm (π = {22/7}).", [n("Luas permukaan =", 2 * PI7 * 49 + 2 * PI7 * 7 * 10, "cm²")],
      "2 × 154 + 2 × {22/7} × 7 × 10 = 308 + 440 = 748 cm².", { scene: solid("tabung", { r: "7 cm", t: "10 cm" }) }),
    q(12, "Ember lurus berbentuk tabung tanpa tutup, jari-jari 7 cm dan tinggi 20 cm (π = {22/7}). Berapa luas bahannya?", [n("Luas bahan =", PI7 * 49 + 2 * PI7 * 7 * 20, "cm²")],
      "Alas 154 + selimut 880 = 1.034 cm²."),
    q(12, "Drum tertutup berdiameter 60 cm dan tinggi 90 cm akan dicat (π = 3,14). Kebutuhan cat = (luas dalam m² × DFT) : (VS% × 10), dengan DFT 50 dan VS% 40.", [n("Luas permukaan =", 2 * PI * 900 + 2 * PI * 30 * 90, "cm²"), n("Cat yang diperlukan ≈", r2((2.2608 * 50) / 400), "liter", { tol: T })],
      "2 × 3,14 × 900 + 2 × 3,14 × 30 × 90 = 5.652 + 16.956 = 22.608 cm² = 2,2608 m². Cat = 2,2608 × 50 : 400 ≈ 0,28 liter.", { scene: solid("tabung", { d: "60 cm", t: "90 cm" }) }),
    q(12, "Pipa terbuka di kedua ujung berjari-jari 1 m dan panjang 5 m (π = 3,14). Berapa luas permukaannya?", [n("Luas =", 2 * PI * 5, "m²")], "Hanya selimut: 2 × 3,14 × 1 × 5 = 31,4 m²."),
  ],
  // E.2
  [
    q(13, "Kerucut berjari-jari 5 cm dan tinggi 12 cm (π = 3,14).", [n("Garis pelukis =", 13, "cm"), n("Luas permukaan =", PI * 5 * 18, "cm²")],
      "s = √{25 + 144} = 13. L = 3,14 × 5 × (5 + 13) = 282,6 cm².", { scene: solid("kerucut", { r: "5 cm", t: "12 cm" }) }),
    q(13, "Tumpeng berbentuk kerucut berjari-jari 9 cm dan tinggi 12 cm akan ditutup daun pisang (tanpa alas, π = 3,14). Berapa luas daun pisang?", [n("Luas daun =", PI * 9 * 15, "cm²")],
      "s = √{81 + 144} = 15. Selimut 3,14 × 9 × 15 = 423,9 cm²."),
    q(13, "100 kerucut tembaga berjari-jari 21 inci dan garis pelukis 35 inci disemprot oksidator di selimutnya (π = {22/7}). 1 liter oksidator cukup untuk 5.000 inci², harganya Rp800.000,00 per liter.", [n("Luas selimut satu kerucut =", PI7 * 21 * 35, "inci²"), n("Oksidator =", (PI7 * 21 * 35 * 100) / 5000, "liter"), n("Biaya =", ((PI7 * 21 * 35 * 100) / 5000) * 800000, undefined, { pre: "Rp" })],
      "{22/7} × 21 × 35 = 2.310 inci². 100 kerucut: 231.000 inci², oksidator 46,2 liter, biaya 46,2 × 800.000 = 36.960.000.", { scene: solid("kerucut", { r: "21 in", s: "35 in" }) }),
    q(13, "Jaring-jaring manakah yang dapat dilipat menjadi kerucut tertutup?", [ch("Jawaban:", ["a", "b", "c", "d"], "b", [net("lingkaransegitiga"), net("kerucut"), net("juring"), net("tabung")])],
      "Kerucut tertutup: lingkaran (alas) dan juring (selimut). Juring saja menjadi kerucut tanpa alas."),
  ],
  // E.3
  [
    q(14, "Tentukan luas permukaan bola berjari-jari 7 cm (π = {22/7}).", [n("Luas =", 4 * PI7 * 49, "cm²")], "4 × {22/7} × 49 = 616 cm².", { scene: solid("bola", { r: "7 cm" }) }),
    q(14, "Bola berdiameter 20 cm akan dibungkus (π = 3,14). Bahan pembungkus tersedia 1 m².", [n("Luas satu bola =", 4 * PI * 100, "cm²"), n("Banyak bola yang dapat dibungkus =", Math.floor(10000 / 1256))],
      "4 × 3,14 × 100 = 1.256 cm². 10.000 : 1.256 ≈ 7,96, jadi paling banyak 7 bola."),
    q(14, "Luas lingkaran besar sebuah bola 38,5 cm². Berapa luas permukaan bola itu?", [n("Luas permukaan =", 154, "cm²")], "Luas bola = 4 × luas lingkaran besar = 154 cm²."),
    q(14, "Kubah setengah bola tertutup (dengan lantai) berjari-jari 14 m (π = {22/7}).", [n("Luas permukaan =", 3 * PI7 * 196, "m²")], "3πr^{2} = 3 × 616 = 1.848 m².", { scene: solid("setengahbola", { r: "14 m" }) }),
  ],
  // E.4
  [
    q(15, "Kemasan tabung d = 10 cm, t = 10 cm diperkecil menjadi 0,75 kalinya.", [n("Luas kemasan besar = … π cm²:", 150), n("Luas kemasan kecil = … π cm²:", 84.375), n("Perbandingan kecil : besar =", 0.5625)],
      "Besar: 2π(25) + 2π(5)(10) = 150π. Kecil: 150π × 0,75^{2} = 84,375π. Perbandingan 0,5625."),
    q(15, "Kemasan tabung d = 10 cm, t = 7 cm diperbesar dua kali.", [n("Luas semula = … π cm²:", 120), n("Luas baru = … π cm²:", 480)], "2π(25) + 2π(5)(7) = 120π. Baru 120π × 4 = 480π."),
    q(15, "Jari-jari sebuah bola diperkecil menjadi setengahnya. Luas permukaannya menjadi …", [ch("Jawaban:", ["{1/2} kali", "{1/4} kali", "{1/8} kali", "2 kali"], "{1/4} kali")], "({1/2})^{2} = {1/4}."),
    q(15, "Luas permukaan sebuah kerucut 300 cm². Semua ukurannya diperbesar 1,5 kali.", [n("Luas baru =", 300 * 2.25, "cm²")], "300 × 1,5^{2} = 675 cm²."),
  ],
  // F.1
  [
    q(16, "Tentukan volume tabung berjari-jari 7 cm dan tinggi 10 cm (π = {22/7}).", [n("Volume =", PI7 * 49 * 10, "cm³")], "{22/7} × 49 × 10 = 1.540 cm³.", { scene: solid("tabung", { r: "7 cm", t: "10 cm" }) }),
    q(16, "Pipa berjari-jari luar 25 cm dan jari-jari dalam 20 cm, panjangnya 2 m. Nyatakan volume bahannya dalam π.", [n("Volume = … π cm³:", 200 * (625 - 400))],
      "t = 200 cm. π × 200 × (625 − 400) = 45.000π cm³.", { scene: solid("pipa", { R: "25 cm", r: "20 cm", t: "2 m" }) }),
    q(16, "Truk tangki membawa tangki tabung berdiameter 2 m dan panjang 12 m (π = 3,14).", [n("Volume =", PI * 12, "m³"), n("Isi =", PI * 12 * 1000, "liter")], "3,14 × 1 × 12 = 37,68 m³ = 37.680 liter."),
    q(16, "Tempat minum ternak berbentuk setengah tabung berdiameter 40 cm dan panjang 5 m (π = 3,14).", [n("Volume =", 0.5 * PI * 400 * 500, "cm³"), n("Isi =", (0.5 * PI * 400 * 500) / 1000, "liter")],
      "{1/2} × 3,14 × 20^{2} × 500 = 314.000 cm³ = 314 liter."),
  ],
  // F.2
  [
    q(17, "Tentukan volume kerucut berjari-jari 6 cm dan tinggi 10 cm (π = 3,14).", [n("Volume =", (PI * 36 * 10) / 3, "cm³")], "{1/3} × 3,14 × 36 × 10 = 376,8 cm³.", { scene: solid("kerucut", { r: "6 cm", t: "10 cm" }) }),
    q(17, "Corong es krim berdiameter 7 cm dan tinggi 12 cm diisi penuh (π = {22/7}).", [n("Volume es krim =", (PI7 * 12.25 * 12) / 3, "cm³")], "{1/3} × {22/7} × 3,5^{2} × 12 = 154 cm³."),
    q(17, "Kerucut diletakkan dalam prisma persegi bersisi 10 cm dan tinggi 15 cm (tinggi kerucut sama, π = 3,14). Berapa volume prisma yang tidak terisi?", [n("Volume kerucut =", (PI * 25 * 15) / 3, "cm³"), n("Volume tidak terisi =", 1500 - (PI * 25 * 15) / 3, "cm³")],
      "Prisma 10 × 10 × 15 = 1.500. Kerucut {1/3} × 3,14 × 25 × 15 = 392,5. Sisa 1.107,5 cm³.", { scene: solid("kerucutprisma", { s: "10 cm", t: "15 cm" }) }),
    q(17, "Volume tabung 600 cm³. Kerucut dengan jari-jari dan tinggi yang sama volumenya …", [n("Volume kerucut =", 200, "cm³")], "{1/3} × 600 = 200 cm³."),
  ],
  // F.3
  [
    q(18, "Tentukan volume bola berjari-jari 21 cm (π = {22/7}).", [n("Volume =", (4 / 3) * PI7 * 9261, "cm³")], "{4/3} × {22/7} × 9.261 = 38.808 cm³.", { scene: solid("bola", { r: "21 cm" }) }),
    q(18, "Tangki gas berbentuk bola berdiameter 30 m (π = 3,14).", [n("Volume =", (4 / 3) * PI * 3375, "m³"), n("Isi =", (4 / 3) * PI * 3375 * 1000, "liter")], "{4/3} × 3,14 × 15^{3} = 14.130 m³ = 14.130.000 liter."),
    q(18, "Kerucut berjari-jari 6 cm dan tinggi 6 cm, serta setengah bola berjari-jari 6 cm. Nyatakan dalam π.", [n("Volume kerucut = … π cm³:", 72), n("Volume setengah bola = … π cm³:", 144)],
      "Kerucut {1/3}π × 36 × 6 = 72π. Setengah bola {2/3}π × 216 = 144π, yaitu dua kali kerucut."),
    q(18, "Bola berjari-jari 3 cm tepat masuk ke dalam tabung berjari-jari 3 cm dan tinggi 6 cm. Nyatakan volume ruang kosongnya dalam π.", [n("Ruang kosong = … π cm³:", 54 - 36)],
      "Tabung π × 9 × 6 = 54π. Bola {4/3}π × 27 = 36π. Sisa 18π cm³.", { scene: solid("bolatabung", { r: "3 cm" }) }),
  ],
  // F.4
  [
    q(19, "Bola berjari-jari 10 cm diperkecil menjadi berjari-jari 5 cm.", [n("Perbandingan luas akhir : awal =", 0.25), n("Perbandingan volume akhir : awal =", 0.125)], "k = 0,5: luas k^{2} = 0,25, volume k^{3} = 0,125."),
    q(19, "Kemasan tabung d = 10 cm, t = 10 cm diperkecil 0,75 kalinya.", [n("Volume besar = … π cm³:", 250), n("Volume kecil = … π cm³:", 250 * 0.421875), n("Perbandingan kecil : besar =", 0.421875)],
      "π × 25 × 10 = 250π. Kecil 250π × 0,75^{3} = 105,46875π."),
    q(19, "Bangun gabungan kerucut dan setengah bola diperbesar dua kali.", [n("Luas menjadi … kali:", 4), n("Volume menjadi … kali:", 8)], "Luas 2^{2} = 4, volume 2^{3} = 8.", { scene: solid("kerucutbola", { r: "3,5 cm", t: "16 cm" }) }),
    q(19, "Gelas kopi tabung kecil berdiameter 8 cm dan tinggi 10 cm. Gelas besar berukuran 1,25 kali gelas kecil.", [n("Volume kecil = … π cm³:", 160), n("Volume besar = … π cm³:", 160 * 1.953125)],
      "π × 16 × 10 = 160π. Besar 160π × 1,25^{3} = 312,5π."),
  ],
];

/* ---------- Evaluasi: 24 soal, bagian bergantian ---------- */
export const assessment: BQuestion[] = [
  // Sedang (1-8)
  q(0, "Sortir benda berikut menurut bentuknya: ketuk benda, lalu ketuk kotaknya.", [{ kind: "sort", bins: ["Prisma", "Limas", "Bangun sisi lengkung"], items: [item("tenda", "Prisma"), item("piramida", "Limas"), item("kaleng", "Bangun sisi lengkung"), item("kardus", "Prisma"), item("topi", "Bangun sisi lengkung"), item("dadu", "Prisma")] }],
    "Tenda (prisma segitiga), kardus (balok), dan dadu (kubus) termasuk prisma. Piramida adalah limas. Kaleng dan topi mempunyai sisi lengkung.", { level: "Sedang" }),
  q(9, "Benar atau salah?", [tf(["Diameter lingkaran panjangnya dua kali jari-jari.", true], ["Luas lingkaran yang diameternya d adalah πd^{2}.", false], ["Juring adalah daerah yang dibatasi dua jari-jari dan busur di antaranya.", true])],
    "Luas lingkaran dengan diameter d adalah π({d/2})^{2} = {1/4}πd^{2}.", { level: "Sedang" }),
  q(2, "Kardus sepatu berukuran 25 cm × 12 cm × 8 cm. Berapa luas karton untuk membuatnya (tanpa lipatan)?", [n("Luas karton =", 2 * (300 + 200 + 96), "cm²")],
    "2(25 × 12 + 25 × 8 + 12 × 8) = 2(300 + 200 + 96) = 1.192 cm².", { level: "Sedang", scene: solid("balok", { p: "25 cm", l: "12 cm", t: "8 cm" }) }),
  q(17, "Benar atau salah?", [tf(["Volume prisma tegak lebih kecil daripada prisma miring yang luas alas dan tingginya sama.", false], ["Jika jari-jari dan tingginya sama, volume tabung : volume kerucut = 3 : 1.", true], ["Jika alas dan tingginya sama, volume limas : volume prisma = 1 : 3.", true])],
    "Prinsip Cavalieri: prisma tegak dan miring dengan alas dan tinggi sama bervolume sama. Kerucut {1/3} tabung, limas {1/3} prisma.", { level: "Sedang" }),
  q(5, "Akuarium berbentuk huruf L: alas persegi 40 cm × 40 cm yang satu pojoknya dipotong persegi 20 cm × 20 cm, tingginya 30 cm. Berapa liter air yang dapat ditampung?", [n("Volume =", 1200 * 30, "cm³"), n("Isi =", 36, "liter")],
    "Luas alas 1.600 − 400 = 1.200 cm². Volume 1.200 × 30 = 36.000 cm³ = 36 liter.", { level: "Sedang", scene: { type: "lshape", outer: 40, notch: 20, height: 30, unit: "cm" } }),
  q(12, "Kaleng biskuit berbentuk tabung tertutup berjari-jari 14 cm dan tinggi 20 cm (π = {22/7}). Berapa luas pelat kalengnya?", [n("Luas =", 2 * PI7 * 196 + 2 * PI7 * 14 * 20, "cm²")],
    "2 × 616 + 2 × {22/7} × 14 × 20 = 1.232 + 1.760 = 2.992 cm².", { level: "Sedang", scene: solid("tabung", { r: "14 cm", t: "20 cm" }) }),
  q(1, "Hubungkan setiap jaring-jaring dengan nama bangunnya: ketuk gambar, lalu ketuk namanya.", [{ kind: "match", left: [{ pic: net("tabung"), answer: "Tabung" }, { pic: net("prisma3"), answer: "Prisma segitiga" }, { pic: net("kerucut"), answer: "Kerucut" }, { pic: net("limas4"), answer: "Limas segi empat" }], right: ["Limas segi empat", "Kerucut", "Prisma segitiga", "Tabung"] }],
    "Dua lingkaran dan persegi panjang: tabung. Dua segitiga dan tiga persegi panjang: prisma segitiga. Lingkaran dan juring: kerucut. Persegi dan empat segitiga: limas segi empat.", { level: "Sedang" }),
  q(11, "Lingkaran berjari-jari 14 cm dengan sudut pusat 90° (π = {22/7}).", [n("Panjang busur =", 22, "cm"), n("Luas juring =", 154, "cm²")],
    "Busur {90/360} × 2 × {22/7} × 14 = 22 cm. Juring {90/360} × {22/7} × 196 = 154 cm².", { level: "Sedang", scene: { type: "circle", r: "14 cm", theta: 90, mode: "juring" } }),
  // Menantang (9-17)
  q(3, "Limas persegi bersisi alas 12 cm dan tinggi limas 8 cm.", [n("Tinggi sisi tegak =", 10, "cm"), n("Luas permukaan =", 144 + 4 * 0.5 * 12 * 10, "cm²")],
    "l^{2} = 8^{2} + 6^{2} = 100, l = 10. L = 144 + 4 × {1/2} × 12 × 10 = 384 cm².", { level: "Menantang", scene: solid("limas4", { b: "12 cm", t: "8 cm" }) }),
  q(17, "Kerucut diletakkan di dalam prisma persegi bersisi 20 cm dan tinggi 30 cm, tingginya sama (π = 3,14). Berapa volume prisma yang tidak terisi kerucut?", [n("Volume tidak terisi =", 12000 - (PI * 100 * 30) / 3, "cm³")],
    "Prisma 20 × 20 × 30 = 12.000. Kerucut r = 10: {1/3} × 3,14 × 100 × 30 = 3.140. Sisa 8.860 cm³.", { level: "Menantang", scene: solid("kerucutprisma", { s: "20 cm", t: "30 cm" }) }),
  q(5, "Kolam renang panjang 50 m dan lebar 20 m. Kedalamannya berubah rata dari 1 m di ujung dangkal sampai 2,5 m di ujung dalam. Berapa liter air untuk mengisinya penuh?", [n("Volume =", ((1 + 2.5) / 2) * 50 * 20, "m³"), n("Isi =", ((1 + 2.5) / 2) * 50 * 20 * 1000, "liter")],
    "Kolam adalah prisma beralas trapesium: luas {1 + 2,5/2} × 50 = 87,5 m². Volume 87,5 × 20 = 1.750 m³ = 1.750.000 liter.", { level: "Menantang", scene: { type: "pool", length: 50, width: 20, shallow: 1, deep: 2.5 } }),
  q(13, "30 topi ulang tahun berbentuk kerucut tanpa alas, berjari-jari 7 cm dan tinggi 24 cm (π = {22/7}).", [n("Garis pelukis =", 25, "cm"), n("Luas kertas seluruhnya =", 30 * PI7 * 7 * 25, "cm²")],
    "s = √{49 + 576} = 25. Satu topi {22/7} × 7 × 25 = 550 cm². 30 topi = 16.500 cm².", { level: "Menantang", scene: obj("topi") }),
  q(1, "Lengkapi jaring-jaring kubus berikut: ketuk satu petak putus-putus sehingga susunannya dapat dilipat menjadi kubus.", [{ kind: "cubenet", label: "Petak tambahan:", cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]], slots: [[1, 0], [3, 2], [1, 2], [2, 0]] }],
    "Hanya petak (3, 2) yang membuat keenam persegi menjadi sisi berbeda saat dilipat. Petak lain membuat dua persegi bertumpuk saat dilipat.", { level: "Menantang" }),
  q(9, "Taman lingkaran berjari-jari 35 m. Di tengahnya ada alas patung globe berbentuk lingkaran berjari-jari 7 m; sisanya ditanami rumput seharga Rp55.000,00 per m² (π = {22/7}).", [n("Luas rumput =", PI7 * (1225 - 49), "m²"), n("Biaya =", PI7 * (1225 - 49) * 55000, undefined, { pre: "Rp" }), n("Putaran untuk joging 8,8 km di tepi taman =", 8800 / (2 * PI7 * 35))],
    "{22/7} × (1.225 − 49) = 3.696 m². Biaya 3.696 × 55.000 = 203.280.000. Keliling 220 m, 8.800 : 220 = 40 putaran.", { level: "Menantang", scene: { type: "circle", r: "35 m", inner: "7 m" } }),
  q(4, "Prisma segitiga siku-siku dengan sisi alas 3 cm, 4 cm, 5 cm dan tinggi prisma 10 cm diperbesar 3 kali.", [n("Luas permukaan semula =", 2 * 6 + 12 * 10, "cm²"), n("Luas permukaan setelah diperbesar =", 132 * 9, "cm²")],
    "Semula 2 × 6 + 12 × 10 = 132 cm². Setelah diperbesar 132 × 3^{2} = 1.188 cm².", { level: "Menantang", scene: solid("prisma3", { a: "3 cm", b: "4 cm", c: "5 cm", t: "10 cm" }) }),
  q(16, "Bis beton berbentuk tabung berongga: jari-jari luar 100 cm, tebal 10 cm, panjang 50 cm (π = 3,14). Berapa volume betonnya?", [n("Volume beton =", PI * 50 * (10000 - 8100), "cm³")],
    "r dalam = 90 cm. V = 3,14 × 50 × (100^{2} − 90^{2}) = 3,14 × 50 × 1.900 = 298.300 cm³.", { level: "Menantang", scene: solid("pipa", { R: "100 cm", r: "90 cm", t: "50 cm" }) }),
  q(6, "Limas persegi beralas 6 m × 6 m dan tinggi 5 m dibangun dari bata berukuran 20 cm × 10 cm × 10 cm.", [n("Volume limas =", 60, "m³"), n("Perkiraan banyak bata =", 60 / 0.002)],
    "{1/3} × 36 × 5 = 60 m³. Satu bata 0,2 × 0,1 × 0,1 = 0,002 m³. 60 : 0,002 = 30.000 bata.", { level: "Menantang", scene: solid("limas4", { b: "6 m", t: "5 m" }) }),
  // Sangat menantang (18-24)
  q(14, "Rumah Honai berbentuk tabung (dinding) beratap setengah bola. Jari-jari 3,5 m dan tinggi dinding 2 m (π = {22/7}). Berapa luas dinding dan atap yang terlihat dari luar (tanpa lantai)?", [n("Luas dinding =", 2 * PI7 * 3.5 * 2, "m²"), n("Luas atap =", 2 * PI7 * 12.25, "m²"), n("Luas seluruhnya =", 44 + 77, "m²")],
    "Dinding (selimut) 2 × {22/7} × 3,5 × 2 = 44 m². Atap setengah bola 2 × {22/7} × 3,5^{2} = 77 m². Total 121 m².", { level: "Sangat menantang", scene: solid("honai", { r: "3,5 m", t: "2 m" }) }),
  q(18, "Bola diletakkan dalam kubus bersisi 12 cm sehingga menyentuh keenam sisi kubus (π = 3,14).", [n("Volume bola =", (4 / 3) * PI * 216, "cm³"), ch("Volume bola : volume kubus =", ["π : 6", "π : 3", "2π : 3", "1 : 2"], "π : 6")],
    "r = 6 cm. V bola {4/3} × 3,14 × 216 = 904,32 cm³. {4/3}πr^{3} : (2r)^{3} = {4/3}π : 8 = π : 6.", { level: "Sangat menantang", scene: solid("bolakubus", { s: "12 cm" }) }),
  q(11, "Daerah berpasir lapangan tolak peluru berbentuk juring cincin: sudut pusat 90°, jari-jari luar 21 m dan jari-jari dalam 7 m (π = {22/7}). Pasir diganti rumput seharga Rp45.000,00 per m².", [n("Luas daerah =", (90 / 360) * PI7 * (441 - 49), "m²"), n("Biaya =", 308 * 45000, undefined, { pre: "Rp" })],
    "{90/360} × {22/7} × (441 − 49) = {1/4} × 1.232 = 308 m². Biaya 308 × 45.000 = 13.860.000.", { level: "Sangat menantang", scene: { type: "circle", r: "21 m", theta: 90, mode: "juring", inner: "7 m" } }),
  q(18, "Pabrik membandingkan dua kemasan untuk 3 bola golf berjari-jari 2 cm (π = 3,14): kotak balok 12 cm × 4 cm × 4 cm dan tabung berjari-jari 2 cm dan tinggi 12 cm.", [n("Volume 3 bola =", 3 * (4 / 3) * PI * 8, "cm³"), n("Ruang kosong kotak =", 192 - 100.48, "cm³"), n("Ruang kosong tabung =", PI * 4 * 12 - 100.48, "cm³"), ch("Kemasan yang ruang kosongnya lebih sedikit:", ["Kotak balok", "Tabung"], "Tabung")],
    "3 × {4/3} × 3,14 × 8 = 100,48 cm³. Kotak 192 − 100,48 = 91,52. Tabung 3,14 × 4 × 12 = 150,72, kosong 50,24 cm³. Tabung lebih hemat ruang.", { level: "Sangat menantang", id: "golf" }),
  q(4, "Balok 5 × 3 × 7 diubah dengan skala k sehingga volumenya menjadi 6.720.", [n("k =", 4), n("Luas permukaan setelah diubah =", 2 * (15 + 35 + 21) * 16)],
    "6.720 : 105 = 64 = 4^{3}, k = 4. Luas semula 2(15 + 35 + 21) = 142, menjadi 142 × 16 = 2.272.", { level: "Sangat menantang" }),
  q(17, "Kerucut A berjari-jari 7 cm dan tinggi 12 cm. Kerucut B mempunyai volume yang sama dan keliling alasnya 88 cm (π = {22/7}). Berapa tinggi kerucut B?", [n("Jari-jari B =", 14, "cm"), n("Tinggi B =", 3, "cm")],
    "Keliling 88 = 2 × {22/7} × r, r = 14. {1/3}π × 49 × 12 = {1/3}π × 196 × t, jadi t = 3 cm.", { level: "Sangat menantang", id: "kerucutsama" }),
  q(15, "Kemasan gelato berbentuk kerucut tertutup berjari-jari 3 cm dan tinggi 4 cm diperkecil menjadi 0,75 kalinya.", [n("Luas kemasan semula = … π cm²:", 3 * (3 + 5)), n("Luas kemasan kecil = … π cm²:", 24 * 0.5625), n("Perbandingan kecil : semula =", 0.5625)],
    "s = 5. L = π × 3 × (3 + 5) = 24π. Kecil 24π × 0,75^{2} = 13,5π. Perbandingan 0,5625.", { level: "Sangat menantang", scene: solid("kerucut", { r: "3 cm", t: "4 cm" }) }),
];
