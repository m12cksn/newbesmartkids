export type Datum = { label: string; count: number; icon?: string; color?: string };

export const balls: Datum[] = [
  { label: "Merah", count: 7, color: "#dc2626" },
  { label: "Kuning", count: 4, color: "#eab308" },
  { label: "Hijau", count: 6, color: "#15803d" },
];

const marbles: Datum[] = [
  { label: "Merah", count: 3, color: "#dc2626" },
  { label: "Biru", count: 5, color: "#2563eb" },
  { label: "Kuning", count: 4, color: "#eab308" },
  { label: "Hijau", count: 4, color: "#15803d" },
];
const cakes: Datum[] = [
  { label: "Kue talam", count: 5 }, { label: "Kue cucur", count: 3 },
  { label: "Kue lapis", count: 5 }, { label: "Kue bugis", count: 6 },
];
const vegetables: Datum[] = [
  { label: "Brokoli", icon: "brokoli", count: 4 },
  { label: "Wortel", icon: "wortel", count: 7 },
  { label: "Jagung", icon: "jagung", count: 5 },
];
const fruit: Datum[] = [
  { label: "Jeruk", icon: "jeruk", count: 6 },
  { label: "Apel", icon: "apel", count: 3 },
  { label: "Mangga", icon: "mangga", count: 4 },
  { label: "Belimbing", icon: "belimbing", count: 5 },
];
const favorites: Datum[] = [
  { label: "Jagung", icon: "jagung", count: 8 }, { label: "Wortel", icon: "wortel", count: 5 },
  { label: "Brokoli", icon: "brokoli", count: 9 }, { label: "Tomat", icon: "tomat", count: 6 },
];
const pencils: Datum[] = [
  { label: "Jingga", icon: "pensil", color: "#ea580c", count: 6 },
  { label: "Ungu", icon: "pensil", color: "#7e22ce", count: 4 },
  { label: "Hijau", icon: "pensil", color: "#15803d", count: 9 },
  { label: "Hitam", icon: "pensil", color: "#1e293b", count: 7 },
];
const clothes: Datum[] = [
  { label: "Kaus pendek", icon: "kaus-pendek", count: 7 },
  { label: "Kaus panjang", icon: "kaus-panjang", count: 5 },
  { label: "Celana", icon: "celana", count: 4 },
];
const animals: Datum[] = [
  { label: "Ikan", count: 6 }, { label: "Katak", count: 3 }, { label: "Kura-kura", count: 8 },
];

type Visual = "objects" | "table" | "diagram" | "build";
type Source = { title: string; rows: Datum[]; visual: Visual; unit: string; clue?: string };
export type DiagramQuestion = Source & {
  prompt: string;
  answer: string;
  explanation: string;
  options?: string[];
  target?: string;
  cell?: string;
  worksheet?: "list" | "table" | "marks";
  difficulty: "sedang" | "menantang" | "sangat menantang";
};
const sources = {
  marbles: { title: "Kelereng", rows: marbles, visual: "objects", unit: "kelereng" },
  cakes: { title: "Kue Kesukaan", rows: cakes, visual: "table", unit: "anak" },
  vegetables: { title: "Sayur Kesukaan", rows: vegetables, visual: "diagram", unit: "anak" },
  fruit: { title: "Buah dari Pasar", rows: fruit, visual: "build", unit: "buah" },
  favorites: { title: "Sayur Favorit Kelas", rows: favorites, visual: "diagram", unit: "anak" },
  pencils: { title: "Pensil Warna", rows: pencils, visual: "objects", unit: "pensil" },
  clothes: { title: "Pakaian Nara", rows: clothes, visual: "build", unit: "pakaian" },
  fruitList: { title: "Daftar Buah-buahan", rows: [{ ...fruit[3], count: 8 }, { label: "Jambu air", icon: "jambu", count: 6 }, { ...fruit[2], count: 9 }], visual: "objects", unit: "buah" },
  toys: { title: "Permainan Kesukaan", rows: [{ label: "Lompat tali", count: 4 }, { label: "Puzzle", count: 6 }, { label: "Petak umpet", count: 3 }, { label: "Sepak bola", count: 7 }], visual: "table", unit: "anak" },
  animals: { title: "Hewan di Kolam Bu Rani", rows: animals, visual: "build", unit: "hewan",
    clue: "Ada 6 ikan. Katak 3 lebih sedikit dari ikan. Kura-kura 2 lebih banyak dari ikan." },
} satisfies Record<string, Source>;

function question(source: keyof typeof sources, prompt: string, answer: string | number,
  explanation: string, difficulty: DiagramQuestion["difficulty"], options?: string[]): DiagramQuestion {
  const data = sources[source];
  return { ...data, visual: data.visual === "build" ? "table" : data.visual,
    prompt, answer: String(answer), explanation, difficulty, options };
}

function build(source: "fruit" | "animals" | "clothes", target: string, answer: number, explanation: string): DiagramQuestion {
  return { ...sources[source], prompt: `Isi baris ${target.toLowerCase()} pada diagram.`,
    target, answer: String(answer), explanation, difficulty: "sedang" };
}

function practice(source: keyof typeof sources, prompt: string, answer: string | number, explanation: string,
  worksheet?: DiagramQuestion["worksheet"]): DiagramQuestion {
  return { ...question(source, prompt, answer, explanation, "sedang"), worksheet };
}

function fillCounts(source: "fruitList" | "pencils", worksheet: "list" | "table"): DiagramQuestion[] {
  return sources[source].rows.map(row => ({
    ...practice(source, `Hitung dan isi jumlah untuk ${row.label.toLowerCase()}.`, row.count,
      `Hitung satu per satu gambar ${row.label.toLowerCase()}. Jumlahnya ${row.count}.`, worksheet),
    cell: row.label,
  }));
}

export const diagramPractice = {
  daftar: [
    ...fillCounts("fruitList", "list"),
    practice("fruitList", "Buah apa yang paling banyak?", "Mangga", "Ada 9 mangga, lebih banyak dari 8 belimbing dan 6 jambu air.", "list"),
    practice("fruitList", "Buah apa yang paling sedikit?", "Jambu air", "Jambu air berjumlah 6, paling sedikit.", "list"),
  ],
  tabel: [
    ...fillCounts("pencils", "table"),
    practice("pencils", "Berapa banyak pensil hijau?", 9, "Pada baris hijau tercatat 9.", "table"),
    practice("pencils", "Berapa banyak pensil jingga?", 6, "Pada baris jingga tercatat 6.", "table"),
    practice("pencils", "Mana yang lebih banyak, pensil hijau atau jingga? Tulis warnanya.", "Hijau", "9 lebih besar dari 6.", "table"),
    practice("pencils", "Warna pensil apa yang paling banyak?", "Hijau", "Hijau memiliki jumlah terbesar, yaitu 9.", "table"),
    practice("pencils", "Warna pensil apa yang paling sedikit?", "Ungu", "Ungu memiliki jumlah terkecil, yaitu 4.", "table"),
    practice("pencils", "Berapa jumlah pensil hitam dan hijau?", 16, "7 + 9 = 16.", "table"),
    practice("toys", "Berapa anak yang suka lompat tali?", 4, "Kolom lompat tali berisi angka 4."),
    practice("toys", "Berapa anak yang suka sepak bola?", 7, "Kolom sepak bola berisi angka 7."),
    practice("toys", "Permainan apa yang paling disukai?", "Sepak bola", "Sepak bola dipilih 7 anak, jumlah terbesar."),
    practice("toys", "Berapa jumlah seluruh anak?", 20, "4 + 6 + 3 + 7 = 20."),
  ],
  diagram: [
    practice("favorites", "Berapa anak yang suka wortel?", 5, "Hitung 5 bintang pada baris wortel."),
    practice("favorites", "Berapa anak yang suka tomat?", 6, "Hitung 6 bintang pada baris tomat."),
    practice("favorites", "Sayur apa yang disukai 5 anak?", "Wortel", "Baris wortel berisi 5 bintang."),
    practice("favorites", "Sayur apa yang disukai 9 anak?", "Brokoli", "Baris brokoli berisi 9 bintang."),
    practice("favorites", "Sayur apa yang paling disukai?", "Brokoli", "Sembilan bintang adalah jumlah terbesar."),
    practice("favorites", "Berapa lebihnya pemilih brokoli daripada wortel?", 4, "9 − 5 = 4 anak."),
    ...clothes.map(row => ({ ...build("clothes", row.label, row.count, `Ada ${row.count} ${row.label.toLowerCase()}.`), worksheet: "marks" as const })),
    practice("clothes", "Ada berapa kaus pendek?", 7, "Baris kaus pendek perlu 7 tanda.", "marks"),
    practice("clothes", "Ada berapa kaus panjang?", 5, "Baris kaus panjang perlu 5 tanda.", "marks"),
    practice("clothes", "Ada berapa celana?", 4, "Baris celana perlu 4 tanda.", "marks"),
    practice("clothes", "Pakaian apa yang paling banyak?", "Kaus pendek", "Tujuh adalah jumlah terbesar.", "marks"),
    practice("clothes", "Pakaian apa yang paling sedikit?", "Celana", "Empat adalah jumlah terkecil.", "marks"),
    practice("clothes", "Berapa lebihnya kaus pendek daripada celana?", 3, "7 − 4 = 3 pakaian.", "marks"),
    practice("clothes", "Berapa jumlah semua pakaian?", 16, "7 + 5 + 4 = 16.", "marks"),
    ...animals.map(row => ({ ...build("animals", row.label, row.count,
      row.label === "Ikan" ? "Di cerita ada 6 ikan." : row.label === "Katak" ? "6 − 3 = 3 katak." : "6 + 2 = 8 kura-kura."),
      worksheet: "marks" as const })),
    practice("animals", "Ada berapa ikan?", 6, "Baris ikan perlu 6 tanda.", "marks"),
    practice("animals", "Ada berapa katak?", 3, "Kurangi 6 dengan 3. Ada 3 katak.", "marks"),
    practice("animals", "Ada berapa kura-kura?", 8, "Tambahkan 2 pada 6. Ada 8 kura-kura.", "marks"),
    practice("animals", "Berapa jumlah semua hewan?", 17, "6 + 3 + 8 = 17.", "marks"),
    practice("animals", "Hewan apa yang paling banyak?", "Kura-kura", "Kura-kura berjumlah 8, paling banyak.", "marks"),
    practice("animals", "Hewan apa yang paling sedikit?", "Katak", "Katak berjumlah 3, paling sedikit.", "marks"),
  ],
};

export const diagramAssessment = [
  question("marbles", "Berapa jumlah kelereng merah dan kuning?", 7, "Ada 3 merah dan 4 kuning. Jumlahnya 7.", "sedang"),
  question("cakes", "Berapa anak yang memilih kue talam dan kue cucur jika digabung?", 8, "5 ditambah 3 sama dengan 8.", "sedang"),
  question("vegetables", "Berapa anak yang suka wortel?", 7, "Hitung 7 bintang pada baris wortel.", "sedang"),
  build("fruit", "Jeruk", 6, "Enam jeruk diwakili oleh enam tanda."),
  question("marbles", "Dua warna mana yang jumlahnya sama?", "Kuning dan hijau", "Kuning dan hijau masing-masing 4.", "menantang", ["Biru dan kuning", "Merah dan hijau", "Kuning dan hijau"]),
  question("cakes", "Kue apa yang paling banyak dipilih?", "Kue bugis", "Kue bugis dipilih 6 anak. Itu jumlah terbesar.", "sedang", ["Kue lapis", "Kue bugis", "Kue talam", "Kue cucur"]),
  question("vegetables", "Sayur apa yang dipilih 5 anak?", "Jagung", "Baris jagung berisi 5 bintang.", "sedang", ["Jagung", "Wortel", "Brokoli"]),
  build("fruit", "Apel", 3, "Tiga apel diwakili oleh tiga tanda."),
  question("marbles", "Berapa kelereng hijau yang perlu ditambah agar sama banyak dengan biru?", 1, "Biru 5 dan hijau 4. Jadi perlu 1 lagi.", "menantang"),
  question("cakes", "Berapa anak yang ikut memilih kue?", 19, "5 + 3 + 5 + 6 = 19.", "sangat menantang"),
  question("vegetables", "Berapa lebihnya pemilih wortel daripada jagung?", 2, "7 dikurangi 5 sama dengan 2.", "menantang"),
  build("fruit", "Mangga", 4, "Empat mangga diwakili oleh empat tanda."),
  question("marbles", "Jika dua kelereng biru diambil, warna apa yang jumlahnya sama dengan biru?", "Merah", "5 dikurangi 2 sama dengan 3, sama dengan merah.", "sangat menantang", ["Hijau", "Kuning", "Merah"]),
  question("cakes", "Jika satu anak pindah pilihan dari kue bugis ke kue cucur, berapa pemilih kue cucur?", 4, "Kue cucur mendapat satu pilihan tambahan: 3 + 1 = 4.", "menantang"),
  question("vegetables", "Berapa jumlah anak yang memilih brokoli atau jagung?", 9, "4 ditambah 5 sama dengan 9.", "menantang"),
  { ...build("fruit", "Belimbing", 5, "Lima belimbing diwakili oleh lima tanda."), difficulty: "menantang" },
  question("marbles", "Berapa jumlah semua kelereng selain biru?", 11, "Hitung merah, kuning, dan hijau: 3 + 4 + 4 = 11.", "sangat menantang"),
  question("cakes", "Jika dua anak lagi memilih kue cucur, dengan kue apa jumlahnya akan sama?", "Kue talam dan kue lapis", "3 + 2 = 5. Kue talam dan lapis masing-masing dipilih 5 anak.", "sangat menantang", ["Kue bugis dan kue lapis", "Kue talam dan kue lapis", "Kue cucur dan kue bugis"]),
  question("vegetables", "Jika satu pemilih wortel beralih ke jagung, sayur apa yang sama banyak?", "Wortel dan jagung", "Wortel turun menjadi 6 dan jagung naik menjadi 6.", "sangat menantang", ["Brokoli dan jagung", "Wortel dan brokoli", "Wortel dan jagung"]),
  question("fruit", "Berapa jumlah semua buah yang dibeli Ibu?", 18, "6 + 3 + 4 + 5 = 18.", "sangat menantang"),
  question("marbles", "Jika setiap warna diambil satu, berapa kelereng yang tersisa?", 12, "Ada 16 kelereng. Satu dari tiap warna berarti 4 diambil, sehingga tersisa 12.", "sangat menantang"),
  question("cakes", "Berapa tambahan pemilih kue cucur agar jumlahnya sama dengan kue bugis?", 3, "Kue cucur memiliki 3 pemilih dan kue bugis 6. Selisihnya 3.", "menantang"),
  question("vegetables", "Berapa jumlah semua anak yang memilih sayur?", 16, "4 + 7 + 5 = 16.", "sangat menantang"),
  question("fruit", "Jika tiga jeruk dimakan, buah apa yang paling banyak tersisa?", "Belimbing", "Jeruk tinggal 3. Belimbing masih 5, lebih banyak dari mangga dan apel.", "menantang", ["Belimbing", "Mangga", "Jeruk", "Apel"]),
] satisfies DiagramQuestion[];
