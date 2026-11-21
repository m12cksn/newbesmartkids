# K2B2 soal cerita: tandai langkah yang salah (2026-11-21)

Branch: `fix/k2b2-soal-cerita-tandai-bagian-salah`

## Masalah
Mr Iwan melaporkan latihan C no. 1 dinilai "Belum tepat" padahal Solusi yang terlihat benar. Soal cerita dikerjakan per tab (Diketahui, Ditanya, Solusi; PR #186), jadi kesalahan di tab lain tidak terlihat. Tanda centang di tab sebelumnya hanya berarti "sudah diisi", sehingga mudah dikira "benar".

## Perubahan
- `src/data/grade-two-add-sub.ts`: `storySections(p, x)` menghitung benar/salah tiap langkah. `partCorrect` untuk soal cerita memakainya; aturan penilaian tidak berubah.
- `GradeTwoAddSub.tsx`:
  - Sebelum diperiksa, tab menunjukkan nomor langkah. Nomor berwarna berarti langkah itu sudah diisi, jadi tanda centang tidak lagi dipakai.
  - Setelah diperiksa, setiap tab diberi centang hijau (benar) atau X merah (salah). Tab salah pertama langsung terbuka.
  - `aria-label` tab memuat status, misalnya "Diketahui salah".
- `smoke-grade-two-add-sub.mjs`: latihan C no. 1 sengaja diisi dengan angka Diketahui tertukar. Uji memastikan tab Diketahui bertanda salah dan terbuka, sedangkan Ditanya dan Solusi bertanda benar.

## Bukti
- `verify-grade-two-add-sub`, `tsc`, `eslint` dan build lulus.
- Smoke lulus di 320, 390, 768 dan 1280.
