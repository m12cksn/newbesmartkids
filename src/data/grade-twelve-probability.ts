/**
 * Kelas 12 Bab 3 - Peluang
 * (sumber: Buku Siswa Matematika Kelas XII, Bab 3, hlm. 83-152).
 * A. Aturan Pencacahan, Permutasi, dan Kombinasi (Subbab 3.1, Kegiatan 3.1.1-3.1.6).
 * B. Kejadian Majemuk, Peluang Saling Lepas, Saling Bebas, dan Bersyarat (Subbab 3.2, Kegiatan 3.2.1-3.2.4).
 * Bentuk soal mengikuti buku: menghitung banyak cara dengan aturan penjumlahan dan perkalian (kartu remi, memilih
 * wakil kelas, membentuk bilangan), membedakan penyusunan dan pengambilan, faktorial, P(n, r), C(n, r), permutasi
 * dengan unsur sama (SUSUNAN, ABRACADABRA), permutasi siklis (meja bundar), notasi kejadian majemuk (∪, ∩),
 * peluang dua dadu, peluang saling bebas (dua dadu, dadu dan koin, kendaraan darurat), dan peluang bersyarat
 * (kartu tanpa pengembalian, spidol, undian, dompet uang logam, tabel eksekutif, nilai mahasiswa).
 * Catatan buku: Contoh 3.2.9 no. 3 menulis hasil 15/10 (lebih dari 1); seharusnya (78/200)(77/199). Contoh 3.2.9
 * no. 2 mengalikan P(P)P(W) seolah-olah dipilih dengan pengembalian; soal di sini menyebut pengembalian dengan jelas.
 */
import type { Question } from "./grade-four-whole-numbers";

export type Level = "Sedang" | "Menantang" | "Sangat menantang";

/* ---------- Angka ---------- */
export const num = (s: string): number => {
  const t = s.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  const u = t.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(u) ? Number(u) : NaN;
};
export const idn = (n: number) => { const r = Math.round(n * 1e9) / 1e9; const [i, f] = String(Math.abs(r)).split("."); return `${r < 0 ? "−" : ""}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}${f ? `,${f}` : ""}`; };
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
export const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
export const P = (n: number, r: number) => (r > n || r < 0 ? 0 : fact(n) / fact(n - r));
export const C = (n: number, r: number) => (r > n || r < 0 ? 0 : fact(n) / (fact(n - r) * fact(r)));
/** Pecahan paling sederhana. */
export const simp = (p: number, q: number): [number, number] => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
export const fracText = (p: number, q: number) => { const [a, b] = simp(p, q); return b === 1 ? String(a) : `{${a}/${b}}`; };

/* ---------- Kartu remi ---------- */
export const SUITS = [["Club", "♣"], ["Spade", "♠"], ["Heart", "♥"], ["Diamond", "♦"]] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
export const DECK = SUITS.flatMap(([, s]) => RANKS.map(r => `${r}${s}`));
export const isRed = (c: string) => /[♥♦]/.test(c);
export const rankOf = (c: string) => c.slice(0, -1), suitOf = (c: string) => c.slice(-1);

/* ---------- Gambar ---------- */
export type Scene =
  | { type: "cards"; cards: string[]; highlight?: string[]; caption?: string }
  | { type: "dice"; marks: [number, number][]; marks2?: [number, number][]; caption?: string }
  | { type: "venn"; universe: number[]; a: number[]; b: number[]; la: string; lb: string; counts?: [number, number, number, number]; caption?: string }
  | { type: "round"; labels: string[]; caption?: string }
  | { type: "slots"; values: string[]; caption?: string }
  | { type: "tiles"; text: string; caption?: string }
  | { type: "tree"; first: [string, string][]; second: [string, string][][]; caption?: string }
  | { type: "grid"; head: string[]; rows: string[][]; title?: string }
  | { type: "bag"; items: { label: string; color: string; count: number; kind: "spidol" | "bola" | "koin" }[]; caption?: string }
  | { type: "coindie"; caption?: string }
  | { type: "multi"; items: Scene[] };

/* ---------- Bentuk jawaban ---------- */
export type Part =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "frac"; label: string; p: number; q: number }
  | { kind: "row"; label: string; cells: string[]; values: number[] }
  | { kind: "choice"; label: string; options: string[]; answer: string }
  | { kind: "classify"; options: string[]; rows: { text: string; answer: string }[] }
  | { kind: "tf"; statements: { text: string; answer: boolean }[] };

export type PQuestion = Question & { topic: number; level?: Level; scene?: Scene; parts: Part[] };

export const SEP = "‖";
export const splitParts = (value: string, n: number) => { const p = value ? value.split(SEP) : []; return Array.from({ length: n }, (_, i) => p[i] ?? ""); };
export const fieldCount = (p: Part) => (p.kind === "classify" ? p.rows.length : p.kind === "tf" ? p.statements.length : p.kind === "row" ? p.cells.length : p.kind === "frac" ? 2 : 1);
export const cells = (p: Part, v: string) => { if (fieldCount(p) === 1) return [v ?? ""]; const x = v ? v.split("|") : []; return Array.from({ length: fieldCount(p) }, (_, i) => x[i] ?? ""); };
export function fields(p: Part): string[] {
  switch (p.kind) {
    case "num": return [idn(p.value)];
    case "frac": return simp(p.p, p.q).map(String);
    case "row": return p.values.map(idn);
    case "choice": return [p.answer];
    case "classify": return p.rows.map(r => r.answer);
    case "tf": return p.statements.map(s => (s.answer ? "B" : "S"));
  }
}
const same = (raw: string, v: number) => { const a = num(raw); return !Number.isNaN(a) && Math.abs(a - v) <= 1e-9 * Math.max(1, Math.abs(v)); };
function partCorrect(p: Part, v: string): boolean {
  const x = cells(p, v);
  switch (p.kind) {
    case "num": return same(v, p.value);
    case "frac": { const a = num(x[0]), b = num(x[1]); return Number.isInteger(a) && Number.isInteger(b) && b !== 0 && a * p.q === b * p.p; }
    case "row": return p.values.every((val, k) => same(x[k], val));
    default: return x.join("|") === fields(p).join("|");
  }
}
const partReady = (p: Part, v: string) => (fieldCount(p) > 1 ? cells(p, v).every(c => c.trim() !== "") : v.trim() !== "");
export const correct = (q: PQuestion, raw: string | undefined) => { const v = splitParts(raw ?? "", q.parts.length); return q.parts.every((p, i) => partCorrect(p, v[i])); };
export const ready = (q: PQuestion, raw: string) => { const v = splitParts(raw, q.parts.length); return q.parts.every((p, i) => partReady(p, v[i])); };
export const plain = (s: string) => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/\{([^{}]*)\/([^{}]*)\}/g, "$1/$2").replace(/[{}]/g, "");
export function formatAnswer(q: PQuestion, raw: string): string {
  if (!raw) return "(kosong)";
  const v = splitParts(raw, q.parts.length);
  return q.parts.map((p, i) => {
    const x = cells(p, v[i]).map(c => c || "…");
    switch (p.kind) {
      case "num": return `${plain(p.label)} ${v[i] || "…"}${p.unit ? ` ${p.unit}` : ""}`;
      case "frac": return `${plain(p.label)} ${x[0]}/${x[1]}`;
      case "row": return `${plain(p.label)} ${p.cells.map((c, k) => `${plain(c)}: ${x[k]}`).join(", ")}`;
      case "choice": return `${plain(p.label)} ${plain(v[i]) || "…"}`;
      case "classify": return p.rows.map((r, k) => `${plain(r.text)}: ${x[k]}`).join("; ");
      case "tf": return p.statements.map((_, k) => (x[k] === "B" ? "Benar" : x[k] === "S" ? "Salah" : "…")).join(", ");
    }
  }).join(" | ");
}

/* ---------- Pembuat ---------- */
const q = (topic: number, prompt: string, parts: Part[], explanation: string, extra: { level?: Level; scene?: Scene } = {}): PQuestion =>
  ({ topic, prompt, parts, explanation, answer: parts.map(p => fields(p).join("|")).join(SEP), ...extra });
const n = (label: string, value: number, unit?: string): Part => ({ kind: "num", label, value, unit });
const fr = (label: string, p: number, qq: number): Part => ({ kind: "frac", label, p, q: qq });
const row = (label: string, c: string[], values: number[]): Part => ({ kind: "row", label, cells: c, values });
const ch = (label: string, options: string[], answer: string): Part => ({ kind: "choice", label, options, answer });
const tf = (...s: [string, boolean][]): Part => ({ kind: "tf", statements: s.map(([text, answer]) => ({ text, answer })) });
const cls = (options: string[], ...r: [string, string][]): Part => ({ kind: "classify", options, rows: r.map(([text, answer]) => ({ text, answer })) });
const diceWhere = (f: (a: number, b: number) => boolean) => { const out: [number, number][] = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (f(a, b)) out.push([a, b]); return out; };
const sumIs = (s: number) => diceWhere((a, b) => a + b === s);

/* ---------- Materi ---------- */
export type Section = { title: string; lab: string; steps: string[]; life: string; example: string; work: string[]; notes: string[]; demo: string };
export const topics: { code: string; title: string; sections: Section[] }[] = [
  { code: "A", title: "Aturan Pencacahan, Permutasi, dan Kombinasi", sections: [
    { title: "Aturan penjumlahan dan perkalian", lab: "aturan",
      steps: [
        "Satu set kartu remi berisi 52 kartu: 4 jenis (Club ♣, Spade ♠, Heart ♥, Diamond ♦), masing-masing 13 kartu A, 2, 3, …, 10, J, Q, K. Club dan Spade berwarna hitam, Heart dan Diamond merah.",
        "Dua kegiatan disebut saling lepas jika tidak punya kemungkinan yang sama. Mengambil satu Ace dan mengambil satu Queen saling lepas, karena tidak ada kartu yang sekaligus Ace dan Queen.",
        "Aturan penjumlahan: jika kegiatan 1 dapat terjadi dengan n cara dan kegiatan 2 dengan m cara, dan keduanya saling lepas, maka kegiatan 1 atau kegiatan 2 dapat terjadi dengan n + m cara. Contoh: Ace atau Queen = 4 + 4 = 8 cara.",
        "Jika kedua kegiatan tidak saling lepas, kemungkinan yang sama jangan dihitung dua kali. Ace atau Heart = 4 + 13 − 1 = 16 cara, karena Ace Heart termasuk keduanya.",
        "Aturan perkalian: jika kegiatan 1 dapat terjadi dengan n cara, lalu dilanjutkan kegiatan 2 dengan m cara, maka kedua kegiatan berurutan dapat terjadi dengan n × m cara. Contoh: satu Ace lalu satu Queen = 4 × 4 = 16 cara.",
        "Kata kunci membantu: \"atau\" biasanya penjumlahan, sedangkan \"lalu\", \"kemudian\", atau \"dan\" yang berurutan biasanya perkalian.",
        "Kedua aturan berlaku untuk lebih dari dua kegiatan: n₁ + n₂ + … + nₖ untuk kegiatan saling lepas, dan n₁ × n₂ × … × nₖ untuk kegiatan berurutan.",
      ],
      life: "Di warung makan dekat sekolah tersedia 3 pilihan nasi (putih, uduk, kuning), 4 pilihan lauk, dan 2 pilihan minuman. Jika kamu hanya ingin membeli satu jenis lauk untuk dibawa pulang, pilihannya 4. Jika hanya membeli satu barang apa saja, entah nasi, lauk, atau minuman, pilihannya 3 + 4 + 2 = 9, karena kamu hanya mengambil salah satunya. Tetapi jika kamu memesan satu paket lengkap, yaitu satu nasi, lalu satu lauk, lalu satu minuman, setiap pilihan nasi bisa dipasangkan dengan setiap lauk dan setiap minuman, sehingga ada 3 × 4 × 2 = 24 paket berbeda. Pemilik warung memakai hitungan ini untuk mencetak daftar menu paket.",
      example: "Dari satu set kartu remi, berapa banyak cara (a) mengambil satu kartu Queen atau satu kartu Heart, dan (b) mengambil satu kartu Ace (tanpa dikembalikan) kemudian satu kartu Queen?",
      work: [
        "Queen ada 4 kartu, Heart ada 13 kartu, dan Queen Heart termasuk keduanya, jadi kedua kegiatan tidak saling lepas.",
        "(a) Banyak cara = 4 + 13 − 1 = 16.",
        "(b) Kartu pertama Ace: 4 cara. Kartu kedua Queen: 4 cara (tidak ada Ace yang juga Queen).",
        "Dengan aturan perkalian, banyak cara = 4 × 4 = 16.",
      ],
      notes: [
        "Sebelum menjumlahkan, periksa apakah ada kemungkinan yang terhitung dua kali.",
        "Pada pengambilan berurutan tanpa pengembalian, kartu yang sudah diambil tidak bisa muncul lagi.",
        "Menuliskan semua kemungkinan seperti tabel di buku membantu memeriksa hasil hitungan.",
      ],
      demo: "Pilih dua kegiatan pengambilan kartu dan cara menggabungkannya (atau / lalu). Kartu yang memenuhi kegiatan pertama dan kedua ditandai pada 52 kartu, dan banyak caranya dihitung.",
    },
    { title: "Penyusunan dan pengambilan", lab: "susun",
      steps: [
        "Menyusun dan mengambil sama-sama memilih beberapa unsur tanpa pengulangan (tanpa pengembalian), tetapi berbeda dalam hal urutan.",
        "Pada penyusunan, urutan diperhatikan: susunan A♣ A♠ berbeda dengan A♠ A♣.",
        "Pada pengambilan, urutan tidak diperhatikan: mengambil A♣ dan A♠ sama dengan mengambil A♠ dan A♣.",
        "Menyusun 2 kartu dari 4 kartu Ace menghasilkan 12 susunan, sedangkan mengambil 2 kartu dari 4 kartu Ace hanya menghasilkan 6 cara, karena setiap pengambilan muncul dua kali sebagai susunan.",
        "Penyusunan r unsur dari n unsur disebut permutasi, ditulis nPr atau P(n, r). Pengambilan r unsur dari n unsur disebut kombinasi, ditulis nCr atau C(n, r), dengan 0 < r ≤ n.",
        "Untuk memutuskan, tanyakan: jika urutannya ditukar, apakah hasilnya dianggap berbeda? Jika ya, itu penyusunan (permutasi). Jika tidak, itu pengambilan (kombinasi).",
      ],
      life: "Bayangkan memilih 2 dari 4 temanmu, yaitu Andi, Budi, Citra, dan Dewi. Jika keduanya akan menjadi ketua dan wakil ketua kelas, maka \"Andi ketua, Budi wakil\" berbeda dengan \"Budi ketua, Andi wakil\". Urutan penting, jadi ini penyusunan, dan ada 12 kemungkinan. Tetapi jika keduanya hanya diutus mewakili kelas ke rapat OSIS tanpa jabatan, Andi–Budi dan Budi–Andi adalah pasangan yang sama, sehingga hanya ada 6 kemungkinan. Hal yang sama terjadi pada kode gembok koper (urutan angka penting) dan memilih 3 rasa es krim dalam satu cup (urutan tidak penting).",
      example: "Dari 3 kartu Ace (A♣, A♠, A♥), tuliskan semua susunan 2 kartu dan semua pengambilan 2 kartu.",
      work: [
        "Susunan: A♣A♠, A♣A♥, A♠A♣, A♠A♥, A♥A♣, A♥A♠, ada 6 susunan.",
        "Pengambilan: coret pasangan yang sama jika urutannya ditukar, tersisa ｛A♣, A♠｝, ｛A♣, A♥｝, ｛A♠, A♥｝, ada 3 cara.",
        "Setiap pengambilan 2 kartu menghasilkan 2 susunan, jadi 6 = 3 × 2.",
        "Kesimpulan: banyak penyusunan = banyak pengambilan × banyak cara mengurutkan unsur yang terambil.",
      ],
      notes: [
        "Penyusunan selalu lebih banyak atau sama dengan pengambilan.",
        "Tidak ada unsur yang berulang, misalnya A♣A♣ tidak dihitung.",
        "Kata \"menyusun\", \"mengurutkan\", \"jabatan\", dan \"kode\" biasanya menandakan urutan penting.",
      ],
      demo: "Atur banyak kartu dan banyak yang dipilih, lalu bandingkan daftar penyusunan dengan daftar pengambilan. Pasangan yang sama dalam pengambilan dihitung satu kali.",
    },
    { title: "Rumus permutasi", lab: "permutasi",
      steps: [
        "Faktorial: n! = n × (n − 1) × … × 2 × 1, misalnya 5! = 120. Disepakati 0! = 1.",
        "Untuk menyusun r unsur dari n unsur, bayangkan r kotak berurutan. Kotak (1) dapat diisi n cara.",
        "Karena satu unsur sudah dipakai, kotak (2) dapat diisi n − 1 cara, kotak (3) n − 2 cara, sampai kotak (r) dengan n − r + 1 cara.",
        "Dengan aturan perkalian: P(n, r) = n × (n − 1) × … × (n − r + 1) = {n!/(n − r)!}.",
        "Jika r = n, maka P(n, n) = n!, disebut permutasi n unsur. Jika r > n, tidak ada susunan, jadi P(n, r) = 0.",
        "Membagikan r benda berbeda kepada n orang, dengan setiap orang paling banyak mendapat satu benda, juga dihitung dengan P(n, r).",
        "Hitung dengan menyederhanakan dulu: {7!/4!} = 7 × 6 × 5 = 210, tidak perlu menghitung 7! seluruhnya.",
      ],
      life: "Lomba lari antarkelas diikuti 8 pelari, dan panitia menyiapkan medali emas, perak, dan perunggu. Untuk menebak susunan juara, kotak emas bisa diisi 8 pelari. Setelah emas diberikan, perak hanya bisa diberikan kepada 7 pelari sisanya, dan perunggu kepada 6 pelari. Banyak kemungkinan susunan juara adalah 8 × 7 × 6 = 336 = P(8, 3). Cara berpikir \"kotak demi kotak\" yang sama dipakai saat menghitung banyak kemungkinan kata sandi 4 angka berbeda (P(10, 4) = 5.040). Karena itulah kata sandi yang lebih panjang jauh lebih sulit ditebak.",
      example: "Berapa banyak cara membagikan 3 kartu berbeda kepada 5 pemain jika setiap pemain paling banyak mendapat satu kartu? (Contoh 3.1.5)",
      work: [
        "Kartu pertama dapat diberikan kepada 5 pemain.",
        "Kartu kedua dapat diberikan kepada 4 pemain yang belum mendapat kartu.",
        "Kartu ketiga dapat diberikan kepada 3 pemain.",
        "Banyak cara = 5 × 4 × 3 = {5!/(5 − 3)!} = 60 = P(5, 3).",
      ],
      notes: [
        "P(n, r) selalu berupa bilangan asli, jadi coret faktor yang sama sebelum mengalikan.",
        "Jangan lupa 0! = 1, sehingga P(n, n) = {n!/0!} = n!.",
        "Permutasi dipakai jika urutan atau posisi penting.",
      ],
      demo: "Ubah banyak unsur n dan banyak kotak r. Peraga mengisi setiap kotak dengan banyak pilihannya dan mengalikannya menjadi P(n, r).",
    },
    { title: "Rumus kombinasi", lab: "kombinasi",
      steps: [
        "Kombinasi r unsur dari n unsur adalah banyak himpunan bagian dengan r anggota dari himpunan n unsur.",
        "Setiap kombinasi r unsur dapat disusun dengan P(r, r) = r! cara. Jadi semua permutasi diperoleh dari semua kombinasi yang masing-masing diurutkan: P(n, r) = C(n, r) × r!.",
        "Rumus kombinasi: C(n, r) = {P(n, r)/r!} = {n!/((n − r)! r!)}, untuk 0 < r ≤ n.",
        "Contoh: C(4, 2) = {12/2} = 6 dan C(5, 3) = {60/6} = 10.",
        "Jika r = n, maka C(n, n) = 1, karena hanya ada satu cara mengambil semuanya. Jika r > n, C(n, r) = 0.",
        "Membagikan r benda yang sama ke n tempat berbeda, dengan setiap tempat paling banyak satu benda, sama dengan memilih r tempat dari n tempat, yaitu C(n, r).",
        "Sifat yang memudahkan: C(n, r) = C(n, n − r). Memilih 3 orang yang ikut sama dengan memilih 2 orang yang tidak ikut dari 5 orang.",
      ],
      life: "Seorang pelatih bulu tangkis harus memilih 4 pemain dari 9 pemain untuk dikirim ke turnamen beregu. Ia tidak menentukan siapa pemain pertama atau kedua, hanya siapa yang berangkat. Jika dihitung dengan permutasi, setiap kelompok 4 pemain akan terhitung 4! = 24 kali dengan urutan yang berbeda-beda. Karena urutan tidak penting, hasil permutasi dibagi 24: C(9, 4) = {3.024/24} = 126 kemungkinan tim. Undian kupon belanja, memilih 6 nomor lotre, dan memilih anggota panitia semuanya dihitung dengan kombinasi.",
      example: "Berapa banyak cara mengambil 3 kartu dari 5 kartu 2♣, 3♣, 4♣, 5♣, 6♣? (Contoh 3.1.8)",
      work: [
        "Urutan tidak diperhatikan, jadi ini kombinasi 3 unsur dari 5 unsur.",
        "P(5, 3) = 5 × 4 × 3 = 60 susunan.",
        "Setiap pengambilan 3 kartu dapat diurutkan dengan 3! = 6 cara.",
        "C(5, 3) = {60/6} = 10 cara.",
      ],
      notes: [
        "Bedakan permutasi (urutan penting) dan kombinasi (urutan tidak penting) sebelum memakai rumus.",
        "Untuk memilih dari dua kelompok, misalnya 3 putra dan 2 putri, kalikan kombinasi tiap kelompok.",
        "C(n, r) selalu lebih kecil atau sama dengan P(n, r).",
      ],
      demo: "Ketuk kartu untuk memilihnya. Peraga menunjukkan semua urutan dari pilihan itu dan menghitung berapa banyak pilihan berbeda yang mungkin: C(n, r) = {P(n, r)/r!}.",
    },
    { title: "Permutasi dengan beberapa unsur sama", lab: "unsur",
      steps: [
        "Jika semua unsur berbeda, n unsur dapat disusun dengan n! cara. Jika ada unsur yang sama, menukar dua unsur yang sama tidak menghasilkan susunan baru.",
        "Contoh: 3 huruf A, 2 huruf B, dan 1 huruf C diletakkan pada 6 kotak.",
        "Letakkan dulu 3 huruf A pada 6 kotak: C(6, 3) cara. Lalu 2 huruf B pada 3 kotak sisa: C(3, 2) cara. Terakhir huruf C pada 1 kotak: C(1, 1) cara.",
        "Banyak susunan = C(6, 3) × C(3, 2) × C(1, 1) = {6!/(3! 2! 1!)} = 60.",
        "Rumus umum untuk n unsur yang terdiri atas n₁ unsur jenis pertama, n₂ unsur jenis kedua, …, nₖ unsur jenis ke-k: {n!/(n₁! n₂! … nₖ!)}.",
        "Huruf yang muncul sekali cukup ditulis 1! = 1, jadi boleh tidak dituliskan.",
      ],
      life: "Seorang penjual menghias etalase dengan 8 bendera kecil: 4 merah, 3 putih, dan 1 biru, dipasang berjajar. Kalau semua bendera dianggap berbeda, ada 8! = 40.320 urutan. Tetapi pembeli tidak bisa membedakan dua bendera merah yang ditukar tempatnya, sehingga banyak susunan itu terlalu besar. Setiap pola warna terhitung 4! kali karena bendera merah, dan 3! kali karena bendera putih. Pola warna yang benar-benar berbeda ada {8!/(4! 3! 1!)} = 280. Cara yang sama dipakai untuk menghitung susunan huruf nama, misalnya berapa susunan berbeda dari huruf-huruf kata \"SUSUNAN\".",
      example: "Berapa banyak susunan huruf yang dapat dibentuk dari kata \"SUSUNAN\"? (Contoh 3.1.11)",
      work: [
        "Kata SUSUNAN terdiri atas 7 huruf: S = 2, U = 2, N = 2, A = 1.",
        "Letakkan S: C(7, 2) = 21. Lalu U: C(5, 2) = 10. Lalu N: C(3, 2) = 3. Lalu A: C(1, 1) = 1.",
        "Banyak susunan = 21 × 10 × 3 × 1 = 630.",
        "Dengan rumus: {7!/(2! 2! 2! 1!)} = {5.040/8} = 630.",
      ],
      notes: [
        "Hitung dulu banyak setiap huruf, lalu periksa jumlahnya sama dengan n.",
        "Pembagi berasal dari faktorial banyak unsur yang sama, bukan dari banyak jenis huruf.",
        "Jika semua unsur berbeda, rumusnya kembali menjadi n!.",
      ],
      demo: "Pilih sebuah kata. Peraga mewarnai huruf yang sama, menghitung banyak setiap huruf, dan menghitung banyak susunan berbeda.",
    },
    { title: "Permutasi siklis", lab: "siklis",
      steps: [
        "Pada susunan mendatar (sebaris), A, B, C dan B, C, A adalah susunan berbeda. Ada 3! = 6 susunan.",
        "Pada susunan melingkar, misalnya duduk mengelilingi meja bundar, A, B, C dan B, C, A sama saja jika dibaca searah jarum jam: setiap orang tetap duduk di sebelah orang yang sama.",
        "Setiap satu susunan melingkar n unsur sesuai dengan n susunan mendatar, karena unsur mana pun dapat dijadikan unsur paling depan.",
        "Banyak permutasi siklis n unsur = {n!/n} = (n − 1)!.",
        "Contoh: 3 unsur membentuk (3 − 1)! = 2 susunan melingkar, 4 unsur membentuk 3! = 6, dan 5 unsur membentuk 4! = 24.",
        "Cara praktis: tetapkan satu orang di satu kursi sebagai patokan, lalu susun n − 1 orang lainnya pada kursi sisa: (n − 1)!.",
        "Jika beberapa orang harus selalu berdampingan, anggap mereka satu kelompok, hitung permutasi siklisnya, lalu kalikan dengan banyak cara mengurutkan orang di dalam kelompok itu.",
      ],
      life: "Keluarga besar berkumpul untuk makan malam di meja bundar dengan 6 kursi. Nenek ingin tahu ada berapa cara duduk yang \"benar-benar berbeda\". Jika semua orang berpindah satu kursi ke kanan bersama-sama, setiap orang tetap diapit tetangga yang sama, jadi suasananya tidak berubah. Itulah sebabnya 6! = 720 susunan sebaris harus dibagi 6, sehingga ada 5! = 120 cara duduk yang berbeda. Jika Ayah dan Ibu ingin selalu duduk bersebelahan, mereka dianggap satu \"kursi ganda\", sehingga ada (5 − 1)! × 2! = 48 cara.",
      example: "Tentukan banyak permutasi siklis dari 4 unsur. (Contoh 3.1.13)",
      work: [
        "Banyak susunan mendatar 4 unsur = 4! = 24.",
        "Susunan melingkar x₁, x₂, x₃, x₄ sama dengan x₂, x₃, x₄, x₁, dengan x₃, x₄, x₁, x₂, dan dengan x₄, x₁, x₂, x₃.",
        "Jadi setiap susunan melingkar sesuai dengan 4 susunan mendatar.",
        "Banyak permutasi siklis = {24/4} = 3! = 6.",
      ],
      notes: [
        "Permutasi siklis hanya untuk susunan melingkar; susunan sebaris tetap n!.",
        "Untuk syarat \"tidak ada dua yang berdekatan\", susun dulu kelompok lain melingkar, lalu tempatkan yang dilarang berdekatan di celah-celahnya.",
        "Tulis langkah pengelompokan dengan jelas agar tidak ada faktor yang terlupa.",
      ],
      demo: "Ubah banyak orang di meja bundar lalu putar semua orang satu kursi. Daftar susunan sebaris berubah, tetapi susunan melingkarnya tetap sama.",
    },
  ] },
  { code: "B", title: "Kejadian Majemuk dan Peluangnya", sections: [
    { title: "Kejadian majemuk", lab: "majemuk",
      steps: [
        "Ruang sampel S adalah himpunan semua hasil yang mungkin. Melantunkan sebuah koin dan sebuah dadu menghasilkan 12 hasil: (A, 1), …, (A, 6), (G, 1), …, (G, 6).",
        "Kejadian adalah himpunan bagian dari ruang sampel, misalnya \"muncul gambar dan mata dadu genap\".",
        "Kejadian majemuk adalah gabungan dua kejadian atau lebih dengan kata \"atau\" maupun \"dan\".",
        "\"A atau B\" berarti paling sedikit salah satu terjadi, ditulis A ∪ B (gabungan).",
        "\"A dan B\" berarti keduanya terjadi bersama-sama, ditulis A ∩ B (irisan).",
        "Diagram Venn membantu: A ∪ B adalah seluruh daerah kedua lingkaran, sedangkan A ∩ B hanya daerah yang tumpang tindih.",
        "Kejadian majemuk bisa melibatkan tiga kejadian atau lebih, misalnya A ∩ B ∩ C berarti ketiganya terjadi.",
      ],
      life: "Sebuah toko elektronik mencatat setiap pengunjung menurut jenis kelamin dan usia. Manajer ingin memberi brosur khusus kepada \"pengunjung perempuan yang berusia di bawah 35 tahun\". Itu kejadian majemuk dengan kata \"dan\", B ∩ C: yang mendapat brosur harus memenuhi kedua syarat. Untuk undangan diskon akhir tahun, manajer memilih \"pengunjung laki-laki atau yang berusia di atas 35 tahun\", yaitu A ∪ D: cukup satu syarat terpenuhi. Kata \"dan\" mempersempit kelompok, sedangkan kata \"atau\" memperluasnya. Salah membaca kata ini bisa membuat brosur tercetak terlalu banyak atau terlalu sedikit.",
      example: "Pengunjung toko diklasifikasikan: A = laki-laki, B = perempuan, C = berusia kurang dari 35 tahun, D = berusia lebih dari 35 tahun. Tuliskan notasi untuk \"pengunjung laki-laki dan berusia kurang dari 35 tahun\" dan \"pengunjung perempuan atau berusia lebih dari 35 tahun\". (Contoh 3.2.2)",
      work: [
        "\"Laki-laki dan kurang dari 35 tahun\" memakai kata \"dan\": A ∩ C.",
        "\"Perempuan atau lebih dari 35 tahun\" memakai kata \"atau\": B ∪ D.",
        "\"Laki-laki atau perempuan\" mencakup semua pengunjung: A ∪ B.",
        "\"Perempuan dan kurang dari 35 tahun\": B ∩ C.",
      ],
      notes: [
        "∪ dibaca \"gabungan\" (atau), ∩ dibaca \"irisan\" (dan).",
        "n(A ∪ B) = n(A) + n(B) − n(A ∩ B), karena anggota irisan terhitung dua kali.",
        "Tuliskan dulu arti setiap huruf kejadian sebelum menyusun notasinya.",
      ],
      demo: "Bilangan 1 sampai 12 menjadi ruang sampel. Pilih kejadian B dan operasinya. Anggota yang termasuk A ∪ B atau A ∩ B ditandai pada diagram Venn.",
    },
    { title: "Peluang saling lepas", lab: "lepas",
      steps: [
        "Peluang kejadian A: P(A) = {n(A)/n(S)}, dengan n(A) banyak hasil yang termasuk A dan n(S) banyak seluruh hasil yang mungkin.",
        "Melantunkan dua dadu menghasilkan 6 × 6 = 36 pasangan, jadi n(S) = 36.",
        "Dua kejadian saling lepas jika tidak dapat terjadi bersamaan, artinya A ∩ B kosong. Jumlah mata dadu 5 dan jumlah mata dadu 7 saling lepas.",
        "Untuk kejadian saling lepas: P(A ∪ B) = P(A) + P(B).",
        "Jika tidak saling lepas, irisannya dikurangkan: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).",
        "Peluang selalu di antara 0 dan 1. Peluang 1 berarti pasti terjadi, misalnya berkas lamaran dari lulusan PTN atau PTS ketika semua pelamar lulusan salah satunya.",
        "Sederhanakan pecahan di akhir, misalnya {3/36} = {1/12}.",
      ],
      life: "Dalam arisan PKK, kocokan dua dadu menentukan siapa yang mendapat uang. Misalkan Bu Rina menang jika jumlah mata dadu 5 atau 7. Jumlah 5 muncul pada 4 pasangan dan jumlah 7 pada 6 pasangan. Kedua kejadian tidak mungkin terjadi pada satu lemparan yang sama, jadi peluangnya cukup dijumlahkan: {4/36} + {6/36} = {10/36} = {5/18}. Bandingkan dengan Bu Sari yang menang jika dadu pertama 4 atau jumlahnya 7: pasangan (4, 3) memenuhi keduanya, sehingga harus dikurangkan sekali. Tanpa memperhatikan hal ini, peluang Bu Sari akan terhitung lebih besar dari yang sebenarnya.",
      example: "Dua dadu dilemparkan satu kali secara bersamaan. Tentukan peluang muncul mata dadu berjumlah 5 atau 7. (Contoh 3.2.4)",
      work: [
        "n(S) = 36.",
        "A = jumlah 5 = ｛(1, 4), (2, 3), (3, 2), (4, 1)｝, n(A) = 4.",
        "B = jumlah 7 = ｛(1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1)｝, n(B) = 6.",
        "A dan B saling lepas, jadi P(A ∪ B) = {4/36} + {6/36} = {10/36} = {5/18}.",
      ],
      notes: [
        "Periksa dulu apakah ada hasil yang termasuk kedua kejadian.",
        "Tabel 6 × 6 hasil dua dadu sangat membantu menghitung n(A) dan n(B).",
        "Jawaban peluang ditulis dalam bentuk pecahan paling sederhana.",
      ],
      demo: "Tentukan kejadian A (jumlah mata dadu) dan kejadian B. Pasangan dadu yang termasuk A, B, dan keduanya ditandai pada tabel 36 hasil, lalu P(A ∪ B) dihitung.",
    },
    { title: "Peluang saling bebas", lab: "bebas",
      steps: [
        "Dua kejadian saling bebas jika terjadinya kejadian yang satu tidak memengaruhi peluang kejadian yang lain.",
        "Contoh: mata dadu merah dan mata dadu putih yang dilempar bersamaan, atau mata dadu dan sisi koin.",
        "Untuk kejadian saling bebas: P(A ∩ B) = P(A) × P(B).",
        "Contoh 3.2.6: P(dadu genap dan koin gambar) = {1/2} × {1/2} = {1/4}, sama dengan menghitung langsung {3/12}.",
        "Jika kejadian majemuk dapat terjadi dalam dua urutan, misalnya jumlah 7 pada lemparan pertama lalu 11 pada lemparan kedua, atau sebaliknya, peluang kedua urutan dijumlahkan.",
        "Peluang suatu kejadian tidak terjadi adalah 1 − P(A). Peluang dua kejadian bebas yang keduanya tidak terjadi adalah (1 − P(A))(1 − P(B)).",
        "\"Paling sedikit satu kali\" lebih mudah dihitung sebagai 1 − peluang tidak pernah terjadi.",
      ],
      life: "Sebuah kota punya satu mobil pemadam kebakaran yang siap pada 98% keadaan darurat dan satu ambulans yang siap pada 92% keadaan darurat. Kesiapan pemadam tidak memengaruhi kesiapan ambulans karena keduanya dirawat oleh tim berbeda. Jika terjadi kebakaran gedung, peluang keduanya siap adalah 0,98 × 0,92 ≈ 0,90. Artinya kira-kira 1 dari 10 kebakaran akan menemukan salah satu kendaraan tidak siap. Angka ini membantu pemerintah kota menilai apakah perlu menambah kendaraan cadangan.",
      example: "Dadu merah dan dadu putih dilempar bersama. Tentukan peluang muncul mata dadu 2 pada dadu merah dan mata dadu 5 pada dadu putih.",
      work: [
        "A = mata 2 pada dadu merah, P(A) = {6/36} = {1/6}.",
        "B = mata 5 pada dadu putih, P(B) = {6/36} = {1/6}.",
        "Dadu merah tidak memengaruhi dadu putih, jadi A dan B saling bebas.",
        "P(A ∩ B) = {1/6} × {1/6} = {1/36}, sama dengan satu pasangan (2, 5) dari 36 pasangan.",
      ],
      notes: [
        "Saling bebas berbeda dengan saling lepas: kejadian saling lepas tidak bisa terjadi bersamaan.",
        "Pengambilan dengan pengembalian menghasilkan kejadian saling bebas; tanpa pengembalian biasanya tidak.",
        "Periksa hasil kali peluang dengan menghitung langsung jika ruang sampelnya kecil.",
      ],
      demo: "Ubah syarat untuk dadu merah dan dadu putih. Daerah yang memenuhi keduanya pada tabel selalu berbentuk persegi panjang, sehingga banyak pasangannya sama dengan hasil kali kedua peluang.",
    },
    { title: "Peluang bersyarat", lab: "bersyarat",
      steps: [
        "Kejadian B bersyarat A terjadi jika peluang B dihitung setelah A diketahui sudah terjadi. Ditulis P(B | A), dibaca \"peluang B jika A\".",
        "Contoh: dua kartu diambil satu per satu tanpa pengembalian. Setelah kartu Heart pertama diambil, tersisa 51 kartu dan hanya 12 Heart, jadi P(Heart kedua | Heart pertama) = {12/51}.",
        "Aturan perkalian peluang: P(A ∩ B) = P(A) × P(B | A).",
        "Diagram pohon membantu: tuliskan peluang pada setiap cabang, kalikan sepanjang cabang, lalu jumlahkan cabang-cabang yang memenuhi.",
        "Dari tabel data dua arah, P(B | A) = {n(A ∩ B)/n(A)}: ruang sampelnya menyempit menjadi anggota A saja.",
        "Jika P(B | A) = P(B), kejadian A dan B saling bebas. Jika berbeda, keduanya tidak saling bebas.",
        "Pada pengambilan tanpa pengembalian, banyak benda dan banyak benda yang dicari berkurang satu setelah setiap pengambilan.",
      ],
      life: "Panitia lomba 17 Agustus menyiapkan 50 lembar undian, dan 3 di antaranya berhadiah. Seorang peserta mengambil dua lembar berturut-turut. Peluang lembar pertama berhadiah adalah {3/50}. Jika lembar pertama ternyata berhadiah, kotak hanya berisi 49 lembar dengan 2 lembar berhadiah, sehingga peluang lembar kedua juga berhadiah tinggal {2/49}. Peluang keduanya berhadiah adalah {3/50} × {2/49} = {3/1.225}, sangat kecil. Cara berpikir \"setelah ini terjadi, apa yang tersisa?\" juga dipakai dokter saat membaca hasil tes kesehatan dan bank saat menilai risiko kredit.",
      example: "Sebuah kartu diambil dari satu set kartu remi. Berapa peluang kartu yang terambil berwarna merah dan bernilai lebih dari 2 tetapi kurang dari 10? (Contoh 3.2.8)",
      work: [
        "C = kartu merah, P(C) = {26/52}.",
        "Di antara 26 kartu merah, kartu bernilai 3, 4, 5, 6, 7, 8, 9 ada 7 × 2 = 14 kartu, jadi P(D | C) = {14/26}.",
        "P(C ∩ D) = {26/52} × {14/26} = {14/52} = {7/26}.",
        "Periksa langsung: ada 14 kartu yang memenuhi dari 52 kartu, yaitu {14/52} = {7/26}.",
      ],
      notes: [
        "Setelah setiap pengambilan tanpa pengembalian, perbarui penyebut dan pembilangnya.",
        "Tulis peluang bersyarat dengan garis tegak: P(B | A), bukan P(B) saja.",
        "Diagram pohon mencegah cabang yang terlupa, terutama jika ada dua urutan yang memenuhi.",
      ],
      demo: "Atur banyak spidol merah, biru, dan putih di dalam tas, lalu pilih urutan dua spidol yang dicari. Diagram pohon menunjukkan peluang setiap cabang tanpa pengembalian.",
    },
  ] },
];
export const sections = topics.flatMap(t => t.sections.map((s, j) => ({ ...s, code: `${t.code}.${j + 1}`, topic: t })));

/* ---------- Data peraga ---------- */
export const cardEvents: Record<string, (c: string) => boolean> = {
  Ace: c => rankOf(c) === "A", Queen: c => rankOf(c) === "Q", King: c => rankOf(c) === "K", Heart: c => suitOf(c) === "♥",
  "Ace hitam": c => rankOf(c) === "A" && !isRed(c), "Club bernomor ganjil": c => suitOf(c) === "♣" && ["3", "5", "7", "9"].includes(rankOf(c)),
  "Club bernomor prima": c => suitOf(c) === "♣" && ["2", "3", "5", "7"].includes(rankOf(c)),
};
export const labWords = ["SUSUNAN", "KAKAK", "MATEMATIKA", "BANDUNG"];
export const letterCounts = (w: string) => { const m = new Map<string, number>(); for (const ch2 of w) m.set(ch2, (m.get(ch2) ?? 0) + 1); return [...m.entries()]; };
export const arrangements = (w: string) => fact(w.length) / letterCounts(w).reduce((s, [, k]) => s * fact(k), 1);
export const vennSets: Record<string, number[]> = { "kelipatan 3": [3, 6, 9, 12], "bilangan prima": [2, 3, 5, 7, 11], "lebih dari 8": [9, 10, 11, 12] };

/* ---------- Latihan ---------- */
const deckScene = (highlight: string[], caption?: string): Scene => ({ type: "cards", cards: DECK, highlight, caption });
const aces = ["A♣", "A♠", "A♥", "A♦"];
export const practice: PQuestion[][] = [
  [
    q(0, "Di sebuah kelas terdapat 18 siswa putri dan 14 siswa putra. Akan dipilih satu siswa untuk mewakili kelas dalam lomba cerdas cermat.",
      [n("Banyak cara =", 32)],
      "Wakil kelas bisa putri atau putra, dan tidak ada siswa yang sekaligus putri dan putra. Dengan aturan penjumlahan: 18 + 14 = 32 cara."),
    q(0, "Kantin menyediakan 4 jenis nasi, 3 jenis lauk, dan 2 jenis minuman. Satu paket berisi satu nasi, satu lauk, dan satu minuman.",
      [n("Banyak paket =", 24), n("Banyak cara membeli satu barang saja =", 9)],
      "Paket: memilih nasi, lalu lauk, lalu minuman, jadi 4 × 3 × 2 = 24. Satu barang saja: nasi atau lauk atau minuman, jadi 4 + 3 + 2 = 9."),
    q(0, "Dari satu set kartu remi diambil satu kartu King atau satu kartu Diamond.",
      [ch("Kedua kegiatan:", ["Saling lepas", "Tidak saling lepas"], "Tidak saling lepas"), n("Banyak cara =", 16)],
      "King Diamond termasuk keduanya, jadi tidak saling lepas. Banyak cara = 4 + 13 − 1 = 16.", { scene: deckScene(DECK.filter(c => rankOf(c) === "K" || suitOf(c) === "♦"), "Kartu King atau Diamond") }),
    q(0, "Dari angka 1, 2, 3, 4, 5 akan dibentuk bilangan tiga angka tanpa pengulangan angka.",
      [n("Banyak bilangan =", 60), n("Banyak bilangan genap =", 24)],
      "Semua bilangan: 5 × 4 × 3 = 60. Bilangan genap: angka satuan harus 2 atau 4 (2 cara), lalu ratusan 4 cara dan puluhan 3 cara, jadi 2 × 4 × 3 = 24.",
      { scene: { type: "slots", values: ["Ratusan", "Puluhan", "Satuan"], caption: "Isi kotak dari syarat yang paling ketat" } }),
  ],
  [
    q(1, "Diberikan 5 kartu 2♣, 3♣, 4♣, 5♣, 6♣.",
      [n("Banyak cara menyusun 2 kartu =", 20), n("Banyak cara mengambil 2 kartu =", 10)],
      "Menyusun (urutan diperhatikan): 5 × 4 = 20. Mengambil (urutan tidak diperhatikan): setiap pasangan terhitung 2 kali, jadi {20/2} = 10.", { scene: { type: "cards", cards: ["2♣", "3♣", "4♣", "5♣", "6♣"] } }),
    q(1, "Tentukan apakah setiap kegiatan berikut termasuk penyusunan atau pengambilan.",
      [cls(["Penyusunan", "Pengambilan"], ["Memilih ketua dan wakil ketua OSIS dari 6 calon", "Penyusunan"], ["Memilih 3 siswa untuk membersihkan kelas", "Pengambilan"], ["Membuat kode PIN 4 angka yang berbeda", "Penyusunan"], ["Mengambil 2 buah jeruk dari keranjang", "Pengambilan"])],
      "Jabatan dan kode PIN membedakan urutan (penyusunan). Petugas kebersihan dan buah jeruk tidak membedakan urutan (pengambilan)."),
    q(1, "Diberikan 3 kartu Ace: A♣, A♠, A♥.",
      [n("Banyak susunan 2 kartu =", 6), n("Banyak pengambilan 2 kartu =", 3)],
      "Susunan: A♣A♠, A♣A♥, A♠A♣, A♠A♥, A♥A♣, A♥A♠ = 6. Pengambilan: ｛A♣, A♠｝, ｛A♣, A♥｝, ｛A♠, A♥｝ = 3.", { scene: { type: "cards", cards: ["A♣", "A♠", "A♥"] } }),
    q(1, "Tentukan benar atau salah pernyataan berikut tentang penyusunan dan pengambilan kartu Ace.",
      [tf(["Susunan A♣ A♠ sama dengan susunan A♠ A♣.", false], ["Pengambilan A♣ A♠ sama dengan pengambilan A♠ A♣.", true], ["Pada penyusunan maupun pengambilan, kartu yang sama tidak boleh muncul dua kali.", true])],
      "Pada penyusunan urutan diperhatikan, pada pengambilan tidak. Keduanya tanpa pengulangan.", { scene: { type: "cards", cards: aces } }),
  ],
  [
    q(2, "Hitunglah nilai faktorial berikut.",
      [row("Nilai", ["6!", "{7!/5!}", "3! × 2!"], [720, 42, 12])],
      "6! = 720. {7!/5!} = 7 × 6 = 42. 3! × 2! = 6 × 2 = 12."),
    q(2, "Dari 7 anggota klub akan dipilih ketua, sekretaris, dan bendahara. Setiap orang hanya boleh memegang satu jabatan.",
      [n("Banyak susunan pengurus =", P(7, 3))],
      "Jabatan membedakan urutan, jadi P(7, 3) = 7 × 6 × 5 = 210.", { scene: { type: "slots", values: ["Ketua: 7", "Sekretaris: 6", "Bendahara: 5"] } }),
    q(2, "Empat hadiah berbeda akan dibagikan kepada 9 siswa. Setiap siswa paling banyak menerima satu hadiah.",
      [n("Banyak cara =", P(9, 4))],
      "Hadiah pertama 9 cara, kedua 8 cara, ketiga 7 cara, keempat 6 cara: P(9, 4) = 9 × 8 × 7 × 6 = 3.024."),
    q(2, "Tentukan nilai n yang memenuhi P(n, 2) = 56.",
      [n("n =", 8)],
      "P(n, 2) = n(n − 1) = 56. Bilangan berurutan yang hasil kalinya 56 adalah 8 × 7, jadi n = 8."),
  ],
  [
    q(3, "Dari 8 siswa akan dipilih 3 siswa untuk mengikuti lomba debat beregu.",
      [n("Banyak cara =", C(8, 3))],
      "Urutan tidak penting, jadi C(8, 3) = {8 × 7 × 6/(3 × 2 × 1)} = 56."),
    q(3, "Sepuluh orang saling berjabat tangan tepat satu kali dengan setiap orang lainnya.",
      [n("Banyak jabat tangan =", C(10, 2))],
      "Setiap jabat tangan melibatkan 2 orang tanpa urutan: C(10, 2) = {10 × 9/2} = 45."),
    q(3, "Untuk memilih 3 unsur dari 6 unsur, lengkapi hubungan permutasi dan kombinasinya.",
      [row("Nilai", ["P(6, 3)", "3!", "C(6, 3)"], [P(6, 3), 6, C(6, 3)])],
      "P(6, 3) = 6 × 5 × 4 = 120, dan setiap kombinasi dapat diurutkan 3! = 6 cara, jadi C(6, 3) = {120/6} = 20."),
    q(3, "Sebuah panitia terdiri atas 3 putra dan 2 putri. Calonnya 6 putra dan 5 putri.",
      [row("Banyak cara", ["Memilih putra", "Memilih putri"], [C(6, 3), C(5, 2)]), n("Banyak susunan panitia =", C(6, 3) * C(5, 2))],
      "C(6, 3) = 20 dan C(5, 2) = 10. Dengan aturan perkalian: 20 × 10 = 200."),
  ],
  [
    q(4, "Berapa banyak susunan huruf berbeda dari kata \"KAKAK\"?",
      [n("Banyak susunan =", arrangements("KAKAK"))],
      "K = 3, A = 2, n = 5. Banyak susunan = {5!/(3! 2!)} = {120/12} = 10.", { scene: { type: "tiles", text: "KAKAK" } }),
    q(4, "Berapa banyak susunan huruf berbeda dari kata \"MATEMATIKA\"?",
      [n("Banyak susunan =", arrangements("MATEMATIKA"))],
      "M = 2, A = 3, T = 2, E = 1, I = 1, K = 1, n = 10. Banyak susunan = {10!/(2! 3! 2!)} = {3.628.800/24} = 151.200.", { scene: { type: "tiles", text: "MATEMATIKA" } }),
    q(4, "Delapan bendera kecil, yaitu 4 merah, 3 putih, dan 1 biru, dipasang berjajar.",
      [n("Banyak pola warna =", fact(8) / (fact(4) * fact(3)))],
      "Banyak susunan = {8!/(4! 3! 1!)} = {40.320/144} = 280."),
    q(4, "Dari angka 1, 1, 2, 2, 2, 3 akan dibentuk bilangan enam angka dengan memakai semua angka itu.",
      [n("Banyak bilangan =", fact(6) / (fact(2) * fact(3)))],
      "Angka 1 dua kali, angka 2 tiga kali, angka 3 sekali. Banyak bilangan = {6!/(2! 3!)} = {720/12} = 60.", { scene: { type: "tiles", text: "112223" } }),
  ],
  [
    q(5, "Enam orang duduk mengelilingi meja bundar.",
      [n("Banyak cara duduk =", fact(5))],
      "Permutasi siklis 6 unsur: (6 − 1)! = 5! = 120.", { scene: { type: "round", labels: ["1", "2", "3", "4", "5", "6"] } }),
    q(5, "Tujuh orang duduk mengelilingi meja bundar. Dua orang tertentu, Rina dan Sari, selalu duduk berdampingan.",
      [n("Banyak cara duduk =", fact(5) * 2)],
      "Rina dan Sari dianggap satu kelompok, jadi ada 6 unsur melingkar: (6 − 1)! = 120. Di dalam kelompok, keduanya bisa bertukar: 2! = 2. Banyak cara = 120 × 2 = 240.",
      { scene: { type: "round", labels: ["Rina", "Sari", "3", "4", "5", "6", "7"] } }),
    q(5, "Lima orang akan duduk. Bandingkan banyak cara duduk sebaris dengan banyak cara duduk mengelilingi meja bundar.",
      [row("Banyak cara", ["Sebaris", "Melingkar"], [120, 24])],
      "Sebaris: 5! = 120. Melingkar: (5 − 1)! = 24, karena setiap susunan melingkar sesuai dengan 5 susunan sebaris."),
    q(5, "Tiga pria dan tiga wanita duduk mengelilingi meja bundar. Semua wanita duduk berdekatan.",
      [n("Banyak cara duduk =", fact(3) * fact(3))],
      "Tiga wanita dianggap satu kelompok, sehingga ada 4 unsur melingkar: (4 − 1)! = 6. Di dalam kelompok, wanita bisa diurutkan 3! = 6 cara. Banyak cara = 6 × 6 = 36."),
  ],
  [
    q(6, "Pengunjung toko diklasifikasikan: A = laki-laki, B = perempuan, C = berusia kurang dari 35 tahun, D = berusia lebih dari 35 tahun. Tentukan notasi untuk \"pengunjung perempuan dan berusia lebih dari 35 tahun\".",
      [ch("Notasi:", ["B ∪ D", "A ∩ D", "B ∩ D"], "B ∩ D")],
      "Kata \"dan\" berarti irisan. Perempuan (B) dan lebih dari 35 tahun (D): B ∩ D."),
    q(6, "Ruang sampel S = ｛1, 2, …, 10｝. A = kejadian muncul bilangan genap, B = kejadian muncul bilangan prima.",
      [row("Banyak anggota", ["A ∩ B", "A ∪ B"], [1, 8])],
      "A = ｛2, 4, 6, 8, 10｝, B = ｛2, 3, 5, 7｝. A ∩ B = ｛2｝ (1 anggota). A ∪ B = ｛2, 3, 4, 5, 6, 7, 8, 10｝ (8 anggota).",
      { scene: { type: "venn", universe: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], a: [2, 4, 6, 8, 10], b: [2, 3, 5, 7], la: "A genap", lb: "B prima" } }),
    q(6, "Tentukan operasi yang sesuai untuk setiap kejadian majemuk berikut.",
      [cls(["∪ (atau)", "∩ (dan)"], ["Kusuma meminjam buku pelajaran atau buku bacaan", "∪ (atau)"], ["Kusuma meminjam buku pelajaran dan buku bacaan", "∩ (dan)"], ["Terambil bola putih dan bola merah", "∩ (dan)"], ["Pengunjung laki-laki atau perempuan", "∪ (atau)"])],
      "Kata \"atau\" menjadi gabungan (∪), kata \"dan\" menjadi irisan (∩)."),
    q(6, "Sebuah koin dan sebuah dadu dilantunkan bersamaan.",
      [n("Banyak hasil dalam ruang sampel =", 12), n("Banyak hasil \"gambar dan mata dadu genap\" =", 3)],
      "Ruang sampel: 2 sisi koin × 6 mata dadu = 12. Gambar dan genap: (G, 2), (G, 4), (G, 6), ada 3.", { scene: { type: "coindie" } }),
  ],
  [
    q(7, "Dua dadu dilempar satu kali. Tentukan peluang muncul mata dadu berjumlah 4 atau 9.",
      [fr("P(A ∪ B) =", sumIs(4).length + sumIs(9).length, 36)],
      "Jumlah 4: (1, 3), (2, 2), (3, 1), ada 3. Jumlah 9: (3, 6), (4, 5), (5, 4), (6, 3), ada 4. Saling lepas, jadi P = {3/36} + {4/36} = {7/36}.",
      { scene: { type: "dice", marks: sumIs(4), marks2: sumIs(9), caption: "Hijau: jumlah 4. Biru: jumlah 9." } }),
    q(7, "Tentukan apakah setiap pasangan kejadian berikut saling lepas.",
      [cls(["Saling lepas", "Tidak saling lepas"], ["Dua dadu: jumlah 5 dan jumlah 7", "Saling lepas"], ["Dua dadu: dadu pertama 2 dan jumlah 5", "Tidak saling lepas"], ["Satu kartu: King dan Queen", "Saling lepas"], ["Satu kartu: kartu merah dan kartu Heart", "Tidak saling lepas"])],
      "Dadu pertama 2 dengan jumlah 5 sama-sama dipenuhi (2, 3). Kartu Heart pasti kartu merah. Dua pasangan lainnya tidak punya hasil yang sama."),
    q(7, "Dua puluh berkas lamaran diajukan oleh 12 lulusan PTN dan 8 lulusan PTS. Sebanyak 4 pelamar berpengalaman kurang dari 2 tahun, 9 pelamar lebih dari 2 tahun, dan 7 belum berpengalaman. Satu berkas diambil acak.",
      [fr("P(PTN atau PTS) =", 20, 20), fr("P(kurang dari 2 tahun atau lebih dari 2 tahun) =", 13, 20)],
      "P(PTN ∪ PTS) = {12/20} + {8/20} = 1. P(R ∪ S) = {4/20} + {9/20} = {13/20}. Kedua pasangan saling lepas."),
    q(7, "Satu kartu diambil dari satu set kartu remi. Tentukan peluang terambil kartu King atau kartu Heart.",
      [fr("P(King ∪ Heart) =", 16, 52)],
      "P(King) = {4/52}, P(Heart) = {13/52}, P(King Heart) = {1/52}. Tidak saling lepas: P = {4/52} + {13/52} − {1/52} = {16/52} = {4/13}.",
      { scene: deckScene(DECK.filter(c => rankOf(c) === "K" || suitOf(c) === "♥")) }),
  ],
  [
    q(8, "Dadu merah dan dadu putih dilempar bersama. Tentukan peluang muncul mata 3 pada dadu merah dan mata 6 pada dadu putih.",
      [fr("P(A ∩ B) =", 1, 36)],
      "P(A) = {1/6}, P(B) = {1/6}, saling bebas. P(A ∩ B) = {1/6} × {1/6} = {1/36}.", { scene: { type: "dice", marks: [[3, 6]], caption: "Baris: dadu merah. Kolom: dadu putih." } }),
    q(8, "Sebuah dadu dan sebuah koin dilempar bersamaan. Tentukan peluang muncul mata dadu ganjil dan sisi angka (A) pada koin.",
      [fr("Peluang =", 1, 4)],
      "P(ganjil) = {3/6} = {1/2}, P(angka) = {1/2}. Saling bebas: {1/2} × {1/2} = {1/4}. Periksa: (1, A), (3, A), (5, A) adalah 3 dari 12 hasil.", { scene: { type: "coindie" } }),
    q(8, "Peluang mobil pemadam kebakaran siap saat darurat adalah 0,95 dan peluang ambulans siap adalah 0,9. Kesiapan keduanya saling bebas.",
      [n("Peluang keduanya siap =", 0.855)],
      "P(A ∩ B) = 0,95 × 0,9 = 0,855."),
    q(8, "Peluang Amir masih tinggal di kota yang sama 10 tahun lagi adalah 0,8 dan peluang Badu adalah 0,6. Keduanya saling bebas.",
      [n("Peluang keduanya tidak lagi tinggal di kota itu =", 0.08)],
      "Peluang Amir tidak tinggal = 0,2, Badu tidak tinggal = 0,4. Keduanya: 0,2 × 0,4 = 0,08."),
  ],
  [
    q(9, "Dua kartu diambil satu per satu tanpa pengembalian dari satu set kartu remi. Tentukan peluang keduanya kartu Heart.",
      [fr("P(A ∩ B) =", 13 * 12, 52 * 51)],
      "P(A) = {13/52}. Setelah satu Heart diambil, tersisa 51 kartu dengan 12 Heart: P(B | A) = {12/51}. P = {13/52} × {12/51} = {156/2.652} = {1/17}."),
    q(9, "Sebuah tas berisi 6 spidol merah, 4 spidol biru, dan 2 spidol putih. Dua spidol diambil satu per satu tanpa pengembalian. Tentukan peluang terambil merah lalu biru.",
      [fr("Peluang =", 6 * 4, 12 * 11)],
      "P(merah) = {6/12}. Setelah itu tersisa 11 spidol dengan 4 biru: {4/11}. P = {6/12} × {4/11} = {24/132} = {2/11}.",
      { scene: { type: "bag", items: [{ label: "merah", color: "#e03131", count: 6, kind: "spidol" }, { label: "biru", color: "#1c64b5", count: 4, kind: "spidol" }, { label: "putih", color: "#f8f9fa", count: 2, kind: "spidol" }] } }),
    q(9, "Tabel berikut menyajikan 100 karyawan menurut jabatan dan jenis kelamin. Seorang karyawan dipilih acak dan diketahui ia pria. Tentukan peluang ia seorang manajer.",
      [fr("P(Manajer | Pria) =", 12, 60)],
      "Ruang sampel menyempit menjadi 60 pria. Manajer pria ada 12, jadi P = {12/60} = {1/5}.",
      { scene: { type: "grid", head: ["", "Pria", "Wanita"], rows: [["Manajer", "12", "8"], ["Staf", "48", "32"], ["Jumlah", "60", "40"]] } }),
    q(9, "Dari 40 lembar undian terdapat 4 lembar berhadiah. Panitia mengambil dua lembar berturut-turut tanpa pengembalian. Tentukan peluang keduanya berhadiah.",
      [fr("Peluang =", 4 * 3, 40 * 39)],
      "P = {4/40} × {3/39} = {12/1.560} = {1/130}."),
  ],
];

/* ---------- Evaluasi ---------- */
const S = "Sedang", Mn = "Menantang", SM = "Sangat menantang";
const lvl = (level: Level, x: PQuestion): PQuestion => ({ ...x, level });
export const assessment: PQuestion[] = [
  lvl(S, q(0, "Sebuah kelas terdiri atas 13 siswa putri dan 11 siswa putra. Akan dipilih sepasang ganda campuran (satu putra dan satu putri) untuk mewakili kelas.",
    [n("Banyak pasangan =", 13 * 11)],
    "Pilih putri (13 cara), lalu pilih putra (11 cara). Dengan aturan perkalian: 13 × 11 = 143.")),
  lvl(S, q(6, "Ruang sampel S = ｛1, 2, …, 15｝. A = kejadian muncul kelipatan 3, B = kejadian muncul bilangan ganjil.",
    [row("Banyak anggota", ["A ∩ B", "A ∪ B"], [3, 10])],
    "A = ｛3, 6, 9, 12, 15｝, B = ｛1, 3, 5, 7, 9, 11, 13, 15｝. A ∩ B = ｛3, 9, 15｝ (3). n(A ∪ B) = 5 + 8 − 3 = 10.",
    { scene: { type: "venn", universe: Array.from({ length: 15 }, (_, i) => i + 1), a: [3, 6, 9, 12, 15], b: [1, 3, 5, 7, 9, 11, 13, 15], la: "A kelipatan 3", lb: "B ganjil" } })),
  lvl(S, q(1, "Panitia pentas seni menyiapkan beberapa kegiatan. Kelompokkan setiap kegiatan sebagai penyusunan atau pengambilan.",
    [cls(["Penyusunan", "Pengambilan"], ["Menentukan juara 1, 2, dan 3 lomba menyanyi", "Penyusunan"], ["Memilih 4 lagu untuk dinyanyikan bersama tanpa urutan", "Pengambilan"], ["Memilih 2 dari 7 warna cat untuk dicampur", "Pengambilan"], ["Menyusun jadwal piket Senin sampai Jumat dari 5 siswa", "Penyusunan"])],
    "Juara dan jadwal hari membedakan urutan (penyusunan). Memilih lagu tanpa urutan dan mencampur cat tidak membedakan urutan (pengambilan).")),
  lvl(S, q(7, "Dua dadu dilempar satu kali. Tentukan peluang muncul mata dadu berjumlah 6 atau 10.",
    [fr("P(A ∪ B) =", sumIs(6).length + sumIs(10).length, 36)],
    "Jumlah 6 ada 5 pasangan, jumlah 10 ada 3 pasangan, dan keduanya saling lepas. P = {5/36} + {3/36} = {8/36} = {2/9}.",
    { scene: { type: "dice", marks: sumIs(6), marks2: sumIs(10), caption: "Hijau: jumlah 6. Biru: jumlah 10." } })),
  lvl(S, q(2, "Tiga orang akan duduk pada 5 kursi yang terletak sebaris.",
    [n("Banyak cara duduk =", P(5, 3))],
    "Orang pertama memilih 5 kursi, orang kedua 4 kursi, orang ketiga 3 kursi: P(5, 3) = 60.", { scene: { type: "slots", values: ["Kursi 1", "Kursi 2", "Kursi 3", "Kursi 4", "Kursi 5"] } })),
  lvl(S, q(8, "Dadu merah dan dadu putih dilempar bersama. Tentukan peluang dadu merah menunjukkan mata paling besar 2 dan dadu putih menunjukkan mata ganjil.",
    [fr("Peluang =", 2 * 3, 36)],
    "P(merah ≤ 2) = {2/6}, P(putih ganjil) = {3/6}. Saling bebas: {2/6} × {3/6} = {6/36} = {1/6}.",
    { scene: { type: "dice", marks: diceWhere((a, b) => a <= 2 && b % 2 === 1), caption: "Baris: dadu merah. Kolom: dadu putih." } })),
  lvl(S, q(3, "Pelatih memilih 4 pemain dari 9 pemain untuk mengikuti turnamen beregu.",
    [n("Banyak tim =", C(9, 4))],
    "Urutan tidak penting: C(9, 4) = {9 × 8 × 7 × 6/(4 × 3 × 2 × 1)} = {3.024/24} = 126.")),
  lvl(S, q(9, "Dua kartu diambil satu per satu tanpa pengembalian dari satu set kartu remi. Tentukan peluang keduanya kartu King.",
    [fr("Peluang =", 4 * 3, 52 * 51)],
    "P(King pertama) = {4/52}, P(King kedua | King pertama) = {3/51}. P = {12/2.652} = {1/221}.",
    { scene: { type: "tree", first: [["King", "4/52"], ["Bukan King", "48/52"]], second: [[["King", "3/51"], ["Bukan", "48/51"]], [["King", "4/51"], ["Bukan", "47/51"]]] } })),
  lvl(Mn, q(4, "Berapa banyak susunan huruf berbeda dari kata \"BANDUNG\"?",
    [n("Banyak susunan =", arrangements("BANDUNG"))],
    "B, A, N, D, U, N, G: 7 huruf dengan N dua kali. Banyak susunan = {7!/2!} = {5.040/2} = 2.520.", { scene: { type: "tiles", text: "BANDUNG" } })),
  lvl(Mn, q(6, "Peneliti serangga di hutan menetapkan A = menghadapi cuaca buruk, B = menghadapi masalah perizinan, dan C = mengalami kerusakan alat foto. Tentukan notasi setiap kejadian.",
    [ch("Menghadapi cuaca buruk atau kerusakan alat foto:", ["A ∩ C", "A ∪ C", "A ∪ B"], "A ∪ C"), ch("Menghadapi ketiga masalah sekaligus:", ["A ∩ B ∩ C", "A ∪ B ∪ C", "A ∩ B"], "A ∩ B ∩ C")],
    "\"Atau\" adalah gabungan: A ∪ C. \"Ketiganya sekaligus\" adalah irisan ketiganya: A ∩ B ∩ C.")),
  lvl(Mn, q(5, "Delapan orang duduk mengelilingi meja bundar. Tiga orang bersaudara selalu duduk berdampingan.",
    [n("Banyak cara duduk =", fact(5) * fact(3))],
    "Tiga bersaudara dianggap satu kelompok, sehingga ada 6 unsur melingkar: (6 − 1)! = 120. Di dalam kelompok: 3! = 6. Banyak cara = 120 × 6 = 720.",
    { scene: { type: "round", labels: ["S1", "S2", "S3", "4", "5", "6", "7", "8"] } })),
  lvl(Mn, q(7, "Sebuah toko menjual 100 ban: 15 merek P, 24 merek Q, 6 merek R, 31 merek S, 18 merek T, dan 6 merek U. Satu ban terjual secara acak.",
    [fr("P(merek Q atau T) =", 24 + 18, 100), fr("P(merek P, S, atau T) =", 15 + 31 + 18, 100)],
    "Setiap ban hanya satu merek, jadi kejadiannya saling lepas. P(Q ∪ T) = {24/100} + {18/100} = {42/100} = {21/50}. P(P ∪ S ∪ T) = {15 + 31 + 18/100} = {64/100} = {16/25}.",
    { scene: { type: "grid", head: ["Merek", "P", "Q", "R", "S", "T", "U"], rows: [["Banyak", "15", "24", "6", "31", "18", "6"]] } })),
  lvl(Mn, q(0, "Dari angka 0, 1, 2, 3, 4, 5 akan dibentuk bilangan tiga angka tanpa pengulangan angka.",
    [n("Banyak bilangan =", 100), n("Banyak bilangan kurang dari 300 =", 40)],
    "Angka ratusan tidak boleh 0: 5 cara, lalu puluhan 5 cara, satuan 4 cara: 5 × 5 × 4 = 100. Kurang dari 300: ratusan 1 atau 2 (2 cara), puluhan 5, satuan 4: 2 × 5 × 4 = 40.",
    { scene: { type: "slots", values: ["Ratusan", "Puluhan", "Satuan"] } })),
  lvl(Mn, q(8, "Dua dadu dilempar dua kali. Tentukan peluang mendapat jumlah 6 pada satu lemparan dan jumlah 9 pada lemparan lainnya.",
    [fr("Peluang =", 2 * 5 * 4, 36 * 36)],
    "P(jumlah 6) = {5/36}, P(jumlah 9) = {4/36}. Dua urutan: (6 lalu 9) atau (9 lalu 6). P = {5/36} × {4/36} + {4/36} × {5/36} = {40/1.296} = {5/162}.")),
  lvl(Mn, q(2, "Tentukan nilai n yang memenuhi P(n, 4) = 20 × P(n, 2).",
    [n("n =", 7)],
    "P(n, 4) = n(n − 1)(n − 2)(n − 3) dan P(n, 2) = n(n − 1). Jadi (n − 2)(n − 3) = 20, sehingga n − 2 = 5 dan n = 7.")),
  lvl(Mn, q(9, "Dompet pertama berisi 5 uang logam seribu rupiah dan 3 uang logam lima ratus rupiah. Dompet kedua berisi 2 uang logam seribu rupiah dan 6 uang logam lima ratus rupiah. Satu uang logam diambil dari dompet pertama dan dimasukkan ke dompet kedua, lalu satu uang logam diambil dari dompet kedua.",
    [fr("P(yang terambil dari dompet kedua lima ratus) =", 5 * 6 + 3 * 7, 8 * 9)],
    "Jika yang dipindahkan seribu (peluang {5/8}), dompet kedua berisi 3 seribu dan 6 lima ratus: {6/9}. Jika yang dipindahkan lima ratus ({3/8}), dompet kedua berisi 2 seribu dan 7 lima ratus: {7/9}. P = {5/8} × {6/9} + {3/8} × {7/9} = {51/72} = {17/24}.",
    { scene: { type: "multi", items: [{ type: "bag", caption: "Dompet pertama", items: [{ label: "1.000", color: "#c9a227", count: 5, kind: "koin" }, { label: "500", color: "#adb5bd", count: 3, kind: "koin" }] }, { type: "bag", caption: "Dompet kedua", items: [{ label: "1.000", color: "#c9a227", count: 2, kind: "koin" }, { label: "500", color: "#adb5bd", count: 6, kind: "koin" }] }] } })),
  lvl(Mn, q(3, "Dari 6 putra dan 5 putri akan dipilih 4 orang untuk tim paduan suara, dengan paling sedikit 3 putri.",
    [row("Banyak cara", ["3 putri, 1 putra", "4 putri"], [C(5, 3) * C(6, 1), C(5, 4)]), n("Banyak tim =", C(5, 3) * C(6, 1) + C(5, 4))],
    "3 putri dan 1 putra: C(5, 3) × C(6, 1) = 10 × 6 = 60. 4 putri: C(5, 4) = 5. Kedua kasus saling lepas: 60 + 5 = 65.")),
  lvl(SM, q(6, "Dari 40 siswa, 25 siswa suka basket, 18 siswa suka voli, dan 8 siswa suka keduanya. Seorang siswa dipilih acak.",
    [row("Banyak siswa", ["Basket ∪ Voli", "Tidak suka keduanya"], [35, 5]), fr("P(Basket ∪ Voli) =", 35, 40)],
    "n(B ∪ V) = 25 + 18 − 8 = 35. Yang tidak suka keduanya 40 − 35 = 5. P(B ∪ V) = {35/40} = {7/8}.",
    { scene: { type: "venn", universe: [], a: [], b: [], la: "Basket", lb: "Voli", counts: [17, 8, 10, 5], caption: "Banyak siswa pada setiap daerah, semesta 40 siswa" } })),
  lvl(SM, q(4, "Ada berapa banyak susunan berbeda yang terdiri atas 3 huruf dari kata \"ABRACADABRA\"?",
    [row("Banyak susunan", ["3 huruf berbeda", "2 huruf sama", "3 huruf sama"], [60, 36, 1]), n("Jumlah susunan =", 97)],
    "Huruf: A (5), B (2), R (2), C (1), D (1). Tiga huruf berbeda dari 5 jenis: P(5, 3) = 60. Dua huruf sama: huruf kembar dipilih dari A, B, R (3 cara), huruf lain dari 4 jenis sisanya (4 cara), dan letak huruf yang berbeda 3 cara: 3 × 4 × 3 = 36. Tiga huruf sama hanya AAA: 1. Jumlah 60 + 36 + 1 = 97.",
    { scene: { type: "tiles", text: "ABRACADABRA" } })),
  lvl(SM, q(7, "Tabel berikut menyajikan 200 eksekutif sebuah perusahaan. Seorang eksekutif dipilih acak.",
    [fr("P(pria atau eksekutif puncak) =", 90 + 20 - 15, 200), fr("P(eksekutif bawah atau wanita) =", 110 + 110 - 75, 200)],
    "P(P ∪ EP) = {90/200} + {20/200} − {15/200} = {95/200} = {19/40}. Eksekutif bawah 110, wanita 110, irisan 75: P = {(110 + 110 − 75)/200} = {145/200} = {29/40}.",
    { scene: { type: "grid", head: ["", "Pria (P)", "Wanita (W)"], rows: [["Eksekutif Puncak (EP)", "15", "5"], ["Eksekutif Menengah (EM)", "40", "30"], ["Eksekutif Bawah (EB)", "35", "75"]] } })),
  lvl(SM, q(5, "Empat pria dan empat wanita duduk mengelilingi meja bundar sehingga tidak ada dua wanita yang duduk berdekatan.",
    [n("Banyak cara duduk =", fact(3) * fact(4))],
    "Susun dulu 4 pria melingkar: (4 − 1)! = 6. Terbentuk 4 celah di antara pria, dan 4 wanita menempati celah itu: 4! = 24. Banyak cara = 6 × 24 = 144.",
    { scene: { type: "round", labels: ["P1", "W", "P2", "W", "P3", "W", "P4", "W"] } })),
  lvl(SM, q(8, "Pemain A dan B bermain catur 12 babak: A menang 5 kali, B menang 4 kali, dan 3 kali seri. Dalam pertandingan 3 babak berikutnya, anggap peluang setiap babak sama dengan data tersebut dan saling bebas.",
    [fr("P(A dan B menang bergantian) =", 5 * 4 * 5 + 4 * 5 * 4, 12 * 12 * 12), fr("P(B menang paling sedikit satu babak) =", 12 ** 3 - 8 ** 3, 12 ** 3)],
    "Bergantian: A-B-A atau B-A-B. P = {5/12} × {4/12} × {5/12} + {4/12} × {5/12} × {4/12} = {180/1.728} = {5/48}. B tidak menang pada satu babak: {8/12} = {2/3}, jadi P(paling sedikit satu) = 1 − ({2/3})^{3} = 1 − {8/27} = {19/27}.")),
  lvl(SM, q(1, "Tentukan benar atau salah setiap pernyataan tentang penyusunan dan pengambilan dari 6 kartu berbeda.",
    [tf(["Banyak cara menyusun 3 kartu dari 6 kartu adalah 120.", true], ["Banyak cara mengambil 3 kartu dari 6 kartu adalah 20.", true], ["Banyak susunan 3 kartu sama dengan 3 kali banyak pengambilan 3 kartu.", false], ["Mengambil 6 kartu dari 6 kartu hanya dapat dilakukan dengan 1 cara.", true])],
    "P(6, 3) = 120 dan C(6, 3) = 20. Setiap pengambilan 3 kartu dapat disusun 3! = 6 cara, jadi susunan = 6 kali pengambilan, bukan 3 kali. C(6, 6) = 1.",
    { scene: { type: "cards", cards: ["2♦", "3♦", "4♦", "5♦", "6♦", "7♦"] } })),
  lvl(SM, q(9, "Kelas \"Metodologi Riset\" diikuti 12 mahasiswa semester V, 24 mahasiswa semester VII, dan 14 mahasiswa semester IX. Yang mendapat nilai A: 4 mahasiswa semester V, 9 mahasiswa semester VII, dan 7 mahasiswa semester IX. Seorang mahasiswa dipilih acak.",
    [fr("P(semester IX | nilai A) =", 7, 20), fr("P(nilai A | semester VII) =", 9, 24)],
    "Yang mendapat nilai A ada 4 + 9 + 7 = 20 orang, dan 7 di antaranya semester IX: {7/20}. Dari 24 mahasiswa semester VII, 9 mendapat A: {9/24} = {3/8}.",
    { scene: { type: "grid", head: ["Semester", "Mahasiswa", "Nilai A"], rows: [["V", "12", "4"], ["VII", "24", "9"], ["IX", "14", "7"]] } })),
];
