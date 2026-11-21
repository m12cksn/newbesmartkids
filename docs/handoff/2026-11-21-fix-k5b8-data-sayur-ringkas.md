# K5B8 data sayuran diringkas + rasio K12B4 (2026-11-21)

Branch: `fix/k5b8-data-sayur-ringkas`. Melanjutkan PR #186 dan #187. Data diubah atas persetujuan Mr Iwan.

## Lingkup
- `src/data/grade-five-data.ts`:
  - Data sayuran favorit (`veg`) diringkas dari 16 anak dengan 36 pilihan menjadi 12 anak dengan 26 pilihan.
  - Frekuensi baru: bayam 6, wortel 5, tomat 4, kangkung 3, buncis 3, sawi 3, kol 2.
  - Hubungan yang diuji tetap sama: bayam terbanyak (unik), tomat lebih sedikit dari bayam, kol paling sedikit (unik), serta kangkung = buncis = sawi.
  - Penjelasan pada 3 soal yang memakai data ini disesuaikan.
- `scripts/smoke-grade-five-data.mjs`: teks "Dicoret 1 dari 26".
- K12B4:
  - Label rasio memakai teks kecil di HP dan isian lebih sempit, sehingga muat satu baris.
  - Petunjuk rasio dipendekkan.
  - Pertanyaan dengan pilihan pendek (Ya/Tidak) tampil sebaris dengan pilihannya.

## Bukti
- `verify-grade-five-data` lulus.
- Smoke K5B8 dan K12B4 lulus di 320, 390, 768 dan 1280.
- Hasil pengukuran di 390×844:
  - K5B8 evaluasi 1 sudah muat. Sebelumnya lebih ±126 px.
  - K12B4 latihan A.5 no. 4 tinggal lebih 29 px. Sebelumnya lebih 77 px.
  - Semua soal di 8 bab kini lebih paling banyak ±35 px.

## Sisa
- 320×640 (HP pendek) masih banyak yang perlu digulir.
- 1280×800: K9B3 evaluasi 2 lebih 104 px, K10B2 evaluasi 1 lebih 66 px.
