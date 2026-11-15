# 2026-11-15 — feat/grade-ten-absolute

## Ruang lingkup
Bab baru **Kelas 10 Bab 1 — Persamaan dan Pertidaksamaan Nilai Mutlak Linear Satu Variabel** dari PDF Buku Siswa Matematika Kelas X Bab 1 (hlm. 9–40). Ditempatkan sesuai buku sumber: Kelas 10 (Kelas X), Bab 1. Ini bab pertama di Kelas 10.

- A. Konsep nilai mutlak: A.1 jarak (peraga langkah maju/mundur), A.2 definisi dan bentuk tanpa tanda mutlak (peraga cabang aktif).
- B. Persamaan: B.1 |ax + b| = c (grafik + garis y = c, banyak penyelesaian), B.2 dua nilai mutlak (titik potong dua grafik + tabel).
- C. Pertidaksamaan: C.1 |x − p| ≤/≥ q (arsiran garis bilangan), C.2 dua nilai mutlak (garis tanda + − + setelah dikuadratkan).
- 24 latihan (4 per bagian), 24 evaluasi (A/B/C masing-masing 8, berselang-seling; Sedang 8, Menantang 9, Sangat menantang 7).
- Bentuk jawaban mengikuti buku: isian nilai, bentuk per daerah, himpunan penyelesaian (termasuk "tidak ada penyelesaian"), tabel titik grafik, pilih sketsa grafik, benar/salah, dan interval yang dipilih lalu tampil di garis bilangan.

## Berkas
- `src/data/grade-ten-absolute.ts`, `src/components/learn/GradeTenAbsolute.tsx`, `src/components/learn/GradeTenAbsoluteArt.tsx`
- `src/chapters/kelas-10-nilai-mutlak/{meta.ts,Chapter.tsx}` (+ registri hasil `npm run chapters`)
- `scripts/verify-grade-ten-absolute.mjs`, `scripts/smoke-grade-ten-absolute.mjs`, `.github/workflows/grade-ten-absolute-qa.yml`

## Validasi
- Verify: kunci setiap soal benar, jawaban salah ditolak, akar persamaan dan interval dihitung ulang pada grid halus −40..40 (32 bagian), urutan subtopik/level, posisi jawaban pilihan 0,0,2,1,2.
- Build produksi lulus. Smoke Playwright lulus di 320/390/768/1280: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi, skor 96/100, pembahasan, tanpa overflow horizontal.

## Sisa
- Video masih placeholder.
- Pratinjau perlu dilihat pemilik.
