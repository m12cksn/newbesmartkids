export type MaterialItem = {
  id: string;
  classId: number;
  chapter: number;
  slug: string;
  title: string;
  topic: string;
  description: string;
  videoUrl?: string;
  videoStatus: "available" | "coming_soon";
  summary: string;
  questionIds: string[];
};

export const materials: MaterialItem[] = [
  {
    id: "cambridge-grade-6-ratio", classId: 6, chapter: 11, slug: "cambridge-ratio-and-proportion",
    title: "Ratio and Proportion", topic: "Cambridge Curriculum · Grade 6",
    description: "Group counters, scale recipes and compare unit prices.",
    videoStatus: "coming_soon", summary: "Understand equivalent ratios and direct proportions.", questionIds: [],
  },
  {
    id: "cambridge-grade-6-fractions", classId: 6, chapter: 10, slug: "cambridge-calculation-with-fractions",
    title: "Calculation with Fractions", topic: "Cambridge Curriculum · Grade 6",
    description: "Estimate and calculate with fractions using interactive fraction strips.",
    videoStatus: "coming_soon", summary: "Add, subtract, multiply and divide fractions, and use fractions as operators.", questionIds: [],
  },
  {
    id: "kelas-4-pengukuran", classId: 4, chapter: 4, slug: "pengukuran-luas-dan-volume",
    title: "Pengukuran Luas & Volume", topic: "Pengukuran",
    description: "Ukur luas dengan petak, takar isi wadah, dan hubungkan liter dengan mililiter.",
    videoStatus: "coming_soon", summary: "Satuan luas, petak satuan, kapasitas dan konversi volume.", questionIds: [],
  },
  {
    id: "kelas-4-pola", classId: 4, chapter: 3, slug: "pola-gambar-dan-pola-bilangan",
    title: "Pola Gambar dan Pola Bilangan", topic: "Pola",
    description: "Susun pola gambar, lengkapi pola bilangan, dan pecahkan cerita dengan peraga interaktif.",
    videoStatus: "coming_soon", summary: "Pola membesar dan mengecil, selisih tetap, tabel, dan soal cerita.", questionIds: [],
  },
  {
    id: "kelas-4-pecahan",
    classId: 4,
    chapter: 2,
    slug: "pecahan",
    title: "Pecahan",
    topic: "Bilangan",
    description: "Bandingkan pecahan, cari pecahan senilai, dan hubungkan desimal dengan persen melalui peraga.",
    videoStatus: "coming_soon",
    summary: "Pelajari pecahan, desimal persepuluhan dan perseratusan, serta persen.",
    questionIds: [],
  },
  {
    id: "kelas-4-bilangan-cacah-10000",
    classId: 4,
    chapter: 1,
    slug: "bilangan-cacah-sampai-10000",
    title: "Bilangan Cacah sampai 10.000",
    topic: "Bilangan",
    description: "Jelajahi nilai tempat, operasi hitung, faktor, dan kelipatan dengan peraga interaktif.",
    videoStatus: "coming_soon",
    summary: "Baca, bandingkan, susun, dan hitung bilangan cacah sampai 10.000.",
    questionIds: [],
  },
  {
    id: "kelas-5-kpk-fpb",
    classId: 5,
    chapter: 2,
    slug: "kpk-dan-fpb",
    title: "KPK dan FPB",
    topic: "Bilangan",
    description: "Pelajari kelipatan, faktor, KPK, FPB, faktorisasi prima, dan soal cerita melalui visual interaktif.",
    videoStatus: "coming_soon",
    summary: "KPK digunakan untuk menemukan kelipatan bersama yang paling kecil, sedangkan FPB untuk mencari faktor bersama terbesar. Keduanya dapat ditentukan lewat daftar bilangan atau faktorisasi prima.",
    questionIds: [],
  },

  {
    id: "kelas-1-membilang-10",
    classId: 1,
    chapter: 1,
    slug: "membilang-sampai-dengan-10",
    title: "Ayo Membilang sampai dengan 10",
    topic: "Bilangan",
    description: "Belajar menghitung, membaca, menulis, membandingkan, dan mengurutkan bilangan sampai 10.",
    videoStatus: "coming_soon",
    summary: "Bilangan dapat digunakan untuk menyatakan banyak benda. Kita dapat menghitung benda satu per satu, membaca lambang bilangan, menulisnya, lalu membandingkan mana yang lebih banyak atau lebih sedikit.",
    questionIds: ["kelas1-bilangan-01", "kelas1-bilangan-02", "kelas1-bilangan-03", "kelas1-bilangan-04", "kelas1-bilangan-05"],
  },
  {
    id: "kelas-1-penjumlahan-10",
    classId: 1,
    chapter: 2,
    slug: "penjumlahan-sampai-dengan-10",
    title: "Penjumlahan sampai dengan 10",
    topic: "Penjumlahan",
    description: "Memahami penjumlahan melalui cerita, benda konkret, dan berbagai cara menghitung.",
    videoStatus: "coming_soon",
    summary: "Penjumlahan berarti menggabungkan dua kelompok atau lebih. Hasil penjumlahan dapat ditemukan dengan menghitung semua benda atau melanjutkan hitungan dari bilangan pertama.",
    questionIds: [],
  },
  {
    id: "kelas-1-pengurangan-10",
    classId: 1,
    chapter: 3,
    slug: "pengurangan-sampai-dengan-10",
    title: "Pengurangan sampai dengan 10",
    topic: "Pengurangan",
    description: "Belajar mengurangi benda, menghitung mundur, dan memahami hubungan pengurangan dengan penjumlahan.",
    videoStatus: "coming_soon",
    summary: "Pengurangan berarti mengambil sebagian dari suatu kelompok. Kita dapat menghitung sisa benda, menghitung mundur, dan menggunakan penjumlahan untuk memeriksa jawaban.",
    questionIds: [],
  },
  {
    id: "kelas-1-mengenal-bentuk",
    classId: 1,
    chapter: 4,
    slug: "mengenal-bentuk",
    title: "Mengenal Bentuk",
    topic: "Geometri",
    description: "Mendeskripsikan benda berdasarkan bentuk, mengelompokkan benda, serta menyusun dan mengurai bentuk bangun.",
    videoStatus: "coming_soon",
    summary: "Benda di sekitar memiliki bentuk yang berbeda. Kita dapat mengenali ciri bentuk, mengelompokkan benda yang bentuknya sama, dan menyusun beberapa bentuk menjadi bangun baru.",
    questionIds: [],
  },
  {
    id: "kelas-1-membilang-20",
    classId: 1,
    chapter: 5,
    slug: "membilang-sampai-dengan-20",
    title: "Ayo Membilang sampai dengan 20",
    topic: "Bilangan",
    description: "Menghitung, membaca, menulis, mengurutkan, dan membandingkan bilangan sampai 20.",
    videoStatus: "coming_soon",
    summary: "Setelah memahami bilangan sampai 10, kita melanjutkan membilang sampai 20. Perhatikan urutan bilangan dan gunakan benda untuk membantu menghitung dengan tepat.",
    questionIds: [],
  },
  {
    id: "kelas-1-operasi-20",
    classId: 1,
    chapter: 6,
    slug: "penjumlahan-dan-pengurangan-sampai-dengan-20",
    title: "Penjumlahan dan Pengurangan sampai dengan 20",
    topic: "Operasi hitung",
    description: "Mengenal konsep lebih dari, kurang dari, dan selisih melalui penjumlahan serta pengurangan sampai 20.",
    videoStatus: "coming_soon",
    summary: "Gunakan penjumlahan dan pengurangan untuk membandingkan dua bilangan dan menemukan selisih. Hasil operasi tetap harus diperiksa agar tidak lebih dari 20.",
    questionIds: [],
  },
  {
    id: "kelas-1-panjang-benda",
    classId: 1,
    chapter: 7,
    slug: "mengukur-panjang-benda",
    title: "Mengukur Panjang Benda",
    topic: "Pengukuran",
    description: "Membandingkan, mengurutkan, dan mengukur panjang benda menggunakan satuan yang sesuai.",
    videoStatus: "coming_soon",
    summary: "Panjang benda dapat dibandingkan dengan melihat langsung atau menggunakan alat ukur. Saat mengukur, mulai dari angka nol dan gunakan satuan yang sama.",
    questionIds: [],
  },
  {
    id: "kelas-1-mengenal-diagram",
    classId: 1,
    chapter: 8,
    slug: "mengenal-diagram",
    title: "Mengenal Diagram",
    topic: "Data",
    description: "Mengelompokkan data sederhana dan membaca informasi dari diagram gambar.",
    videoStatus: "coming_soon",
    summary: "Data dapat dikumpulkan dan dikelompokkan. Diagram gambar membantu kita melihat jumlah setiap kelompok dengan lebih mudah.",
    questionIds: [],
  },
];

export function getMaterialsByClass(classId: number) {
  return materials.filter((material) => material.classId === classId);
}

export function getMaterialBySlug(slug: string) {
  return materials.find((material) => material.slug === slug);
}
