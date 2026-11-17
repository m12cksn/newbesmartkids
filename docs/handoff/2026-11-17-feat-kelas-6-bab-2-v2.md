# 2026-11-17 feat/kelas-6-bab-2-v2: Kelas 6 Bab 2 Rasio (versi baru)

## Lingkup
- Versi lama (dibuat di sesi ChatGPT) diganti. URL tetap: `/kelas/konsep-inti-matematika-kelas-6/materi/rasio`.
- Sumber: PDF Matematika SD/MI Kelas VI Bab 2 (Kemendikbudristek 2022, 30 halaman), termasuk Latihan 2.1–2.3 dan Uji Kompetensi.
- A. Konsep rasio:
  - membandingkan paket bibit per bibit;
  - kebun pucuk merah dan cemara dengan rasio paling sederhana.
- B. Kesamaan rasio:
  - tabel rasio dengan tombol × dan ÷;
  - rasio satuan dua paket jahe merah.
- C. Penerapan:
  - model batang dan tabel rasio bagian/keseluruhan;
  - rasio masa panen dengan penyamaan satuan waktu.
- Latihan 4 soal per bagian (8 per subtopik, 24 soal).
- Evaluasi 24 soal (Sedang 8, Menantang 9, Sangat menantang 7), subtopik selang-seling. Bentuk jawaban buku: tabel rasio dengan kotak isian dan pengali, a : b = … : …, pilih rasio senilai, pilihan paket lebih hemat, soal cerita.

## Berkas
- `src/chapters/kelas-6-rasio/`, `src/data/grade-six-ratio-v2.ts`, `src/components/learn/GradeSixRatioV2.tsx`.
- `scripts/verify-grade-six-ratio-v2.mjs`, `scripts/smoke-grade-six-ratio-v2.mjs`, `.github/workflows/grade-six-ratio-v2-qa.yml`.
- Dihapus:
  - `GradeSixRatio.tsx` dan `src/data/grade-six-ratio.ts`;
  - skrip verify/smoke dan workflow `grade-six-ratio`;
  - entri `materials.ts` dan cabang `if` halaman materi.
- `docs/GRADE_SIX_CHAPTER_TWO.md` (catatan versi lama) dibiarkan sebagai riwayat.

## Validasi
- verify: `Kelas 6 Bab 2 OK: 3 subtopik, 24 latihan, 24 evaluasi (tingkat 8/9/7)`, dengan pemeriksaan:
  - setiap baris tabel rasio senilai;
  - operasi antarbaris benar;
  - total = jumlah bagian;
  - rasio paling sederhana;
  - pilihan senilai;
  - harga satuan dari gambar paket.
- eslint dan build lulus.
- smoke 320×640, 390×844, 768×1024, 1280×800:
  - jalur klik dari halaman Kelas 6;
  - 6 peraga;
  - 24 latihan (1 salah disengaja);
  - 24 evaluasi dengan skor 96 dan pembahasan;
  - semua muat di layar sebelum dijawab, juga dengan `FONT="DejaVu Sans"`.

## Catatan
- Video belum ada.
