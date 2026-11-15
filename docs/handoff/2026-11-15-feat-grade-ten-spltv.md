# 2026-11-15 — feat/grade-ten-spltv

## Ruang lingkup
Bab baru **Kelas 10 Bab 2 — Sistem Persamaan Linear Tiga Variabel** dari PDF Buku Siswa Matematika Kelas X Bab 2 (hlm. 41–70).

- A. Menyusun dan menemukan konsep SPLTV: A.1 model dari masalah (peraga karung pupuk dengan tiga syarat), A.2 pekerjaan bersama dan pemisalan p = 1/x (peraga pembagian kerja), A.3 ciri SPLTV, homogen, dan trivial (peraga uji triple).
- B. Penyelesaian SPLTV: B.1 eliminasi dan substitusi (langkah demi langkah, variabel pertama bisa dipilih), B.2 determinan/aturan Sarrus (D, Dx, Dy, Dz dengan garis penuh dan putus-putus), B.3 banyak penyelesaian (sistem berparameter t).
- 24 latihan (4 per bagian) dan 24 evaluasi (A/B masing-masing 12, berselang-seling; Sedang 8, Menantang 9, Sangat menantang 7).
- Bentuk jawaban mengikuti buku: isian model koefisien, triple penyelesaian, nilai determinan, x² + y² + z², SPLTV atau bukan, benar/salah, banyak penyelesaian, teka-teki simbol.
- Catatan isi: Uji Kompetensi 2.1 no. 7 di buku memaksa z = 1 dari dua persamaan pertama sehingga tidak pernah tepat satu penyelesaian. Soal berparameter di bab ini memakai sistem yang benar.

## Berkas
- `src/data/grade-ten-spltv.ts`, `src/components/learn/GradeTenSpltv.tsx`, `src/components/learn/GradeTenSpltvArt.tsx`
- `src/chapters/kelas-10-spltv/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-ten-spltv.mjs`, `scripts/smoke-grade-ten-spltv.mjs`, `.github/workflows/grade-ten-spltv-qa.yml`

## Validasi
- Verify: kunci setiap soal, penolakan jawaban salah, isian model menerima kelipatan baris, 98 hitungan ulang (penyelesaian sistem, determinan, banyak penyelesaian, soal cerita, teka-teki simbol), posisi jawaban pilihan 0:4, 1:3, 2:3.
- Build produksi lulus. Smoke Playwright lulus di 320/390/768/1280: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi, skor 96/100, pembahasan, tanpa overflow horizontal.

## Sisa
- Video masih placeholder.
