export const phases = ["Semua kelas", "Fondasi", "Akselerasi", "Mahir", "Terapan"] as const;

export const classes = [
  { id: 1, slug: "matematika-dasar-kelas-1", phase: "Fondasi", tag: "Mulai dari sini", tone: "success" },
  { id: 2, slug: "bermain-angka-kelas-2", phase: "Fondasi", tag: "Bermain angka", tone: "warning" },
  { id: 3, slug: "dasar-matematika-kelas-3", phase: "Fondasi", tag: "Makin berani", tone: "info" },
  { id: 4, slug: "pola-dan-strategi-kelas-4", phase: "Akselerasi", tag: "Temukan pola", tone: "success" },
  { id: 5, slug: "pecahan-dan-pengukuran-kelas-5", phase: "Akselerasi", tag: "Pecahkan masalah", tone: "warning" },
  { id: 6, slug: "konsep-inti-matematika-kelas-6", phase: "Akselerasi", tag: "Siap naik level", tone: "info" },
  { id: 7, slug: "logika-dan-aljabar-kelas-7", phase: "Akselerasi", tag: "Bangun logika", tone: "success" },
  { id: 8, slug: "hubungan-geometri-kelas-8", phase: "Mahir", tag: "Lihat hubungan", tone: "secondary" },
  { id: 9, slug: "strategi-matematika-kelas-9", phase: "Mahir", tag: "Siapkan langkah", tone: "warning" },
  { id: 10, slug: "matematika-lanjutan-kelas-10", phase: "Mahir", tag: "Pahami konsep", tone: "info" },
  { id: 11, slug: "penalaran-kuantitatif-kelas-11", phase: "Terapan", tag: "Tajamkan strategi", tone: "success" },
  { id: 12, slug: "persiapan-matematika-kelas-12", phase: "Terapan", tag: "Siap melangkah", tone: "info" },
] as const;

export type Phase = (typeof phases)[number];
