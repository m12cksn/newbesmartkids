# 2026-11-15 — feat/grade-nine-absolute

## Ruang lingkup
Bab baru **Kelas 9 Bab 5 — Persamaan dan Pertidaksamaan Nilai Mutlak Linear Satu Variabel** dari PDF Buku Siswa Matematika Kelas X Bab 1 (hlm. 9–40). Pemilik meminta "Kelas 9 Bab 3"; Bab 3 dan Bab 4 Kelas 9 sudah terisi, jadi bab ini ditempatkan sebagai Bab 5 dan bisa dipindah ke Kelas 10 bila diminta.

- A. Konsep nilai mutlak: A.1 jarak (peraga langkah maju/mundur), A.2 definisi dan bentuk tanpa tanda mutlak (peraga cabang aktif).
- B. Persamaan: B.1 |ax + b| = c (grafik + garis y = c, banyak penyelesaian), B.2 dua nilai mutlak (titik potong dua grafik + tabel).
- C. Pertidaksamaan: C.1 |x − p| ≤/≥ q (arsiran garis bilangan), C.2 dua nilai mutlak (garis tanda + − + setelah dikuadratkan).
- 24 latihan (4 per bagian), 24 evaluasi (A/B/C masing-masing 8, berselang-seling; Sedang 8, Menantang 9, Sangat menantang 7).
- Bentuk jawaban mengikuti buku: isian nilai, bentuk per daerah, himpunan penyelesaian (termasuk "tidak ada penyelesaian"), tabel titik grafik, pilih sketsa grafik, benar/salah, dan interval yang dipilih lalu tampil di garis bilangan.

## Berkas
- `src/data/grade-nine-absolute.ts`, `src/components/learn/GradeNineAbsolute.tsx`, `src/components/learn/GradeNineAbsoluteArt.tsx`
- `src/chapters/kelas-9-nilai-mutlak/{meta.ts,Chapter.tsx}` (+ registri hasil `npm run chapters`)
- `scripts/verify-grade-nine-absolute.mjs`, `scripts/smoke-grade-nine-absolute.mjs`, `.github/workflows/grade-nine-absolute-qa.yml`

## Validasi
- Verify: kunci setiap soal benar, jawaban salah ditolak, akar persamaan dan interval dihitung ulang pada grid halus −40..40 (32 bagian), urutan subtopik/level, posisi jawaban pilihan 0,0,2,1,2.
- Build produksi lulus. Smoke Playwright lulus di 320/390/768/1280: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi, skor 96/100, pembahasan, tanpa overflow horizontal.

## Sisa
- Video masih placeholder.
- Pratinjau perlu dilihat pemilik.
