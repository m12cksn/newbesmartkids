# 2026-11-15 — feat/grade-twelve-dimension

## Ruang lingkup
Bab pertama Kelas 12: **Kelas 12 Bab 1 — Dimensi Tiga** dari PDF Buku Siswa Matematika Kelas XII Bab 1 (hlm. 1–26). File pertama yang diunggah pemilik ternyata Kelas X Bab 1; file yang benar diunggah ulang.

- A. Jarak antartitik: A.1 pengertian dan rute terpendek, rumus koordinat (peraga peta rute A ke C), A.2 jarak pada kubus/balok/limas (peraga kubus 3D yang bisa diputar, pilih dua titik).
- B. Jarak titik ke garis: B.1 pengertian, paku dan tali, d = ab/c (peraga geser P sampai tegak lurus), B.2 pada bangun ruang (peraga pilih titik dan garis pada kubus, titik kaki K).
- C. Jarak titik ke bidang: C.1 pengertian dan proyeksi (peraga lampu di atas lantai), C.2 pada kubus dan limas (peraga pilihan titik-bidang, bidang diarsir).
- Materi diperpanjang dengan studi kasus untuk orang awam (kabel lampu kamar, sedotan dalam kotak, pipa sumur, aula, drone, gazebo).
- 24 latihan (4 per bagian) dan 24 evaluasi (A/B/C masing-masing 8, tiap bagian 4; Sedang 8, Menantang 9, Sangat menantang 7).
- Soal buku yang tidak lengkap tidak dipakai: Uji Kompetensi no. 8 (rusuk tidak tertulis) dan no. 4 ("panjang setiap bidang empat").
- `scripts/smoke-class-page.mjs`: contoh kelas tanpa bab dipindah dari Kelas 12 ke Kelas 11.

## Berkas
- `src/data/grade-twelve-dimension.ts` (termasuk fungsi geometri vektor), `src/components/learn/GradeTwelveDimension.tsx`, `src/components/learn/GradeTwelveDimensionArt.tsx` (bangun ruang 3D dengan rusuk tersembunyi putus-putus)
- `src/chapters/kelas-12-dimensi-tiga/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-twelve-dimension.mjs`, `scripts/smoke-grade-twelve-dimension.mjs`, `.github/workflows/grade-twelve-dimension-qa.yml`

## Validasi
- Verify: kunci, bentuk akar paling sederhana, penolakan jawaban salah, 66 hitungan ulang dengan vektor (jarak titik-titik, titik-garis, titik-bidang, lintasan terpendek, ruas tegak lurus pada pilihan).
- Build produksi lulus. Smoke Playwright lulus di 320/390/768/1280: 6 peraga (kubus dapat diputar), 24 latihan (1 salah disengaja), 24 evaluasi, skor 96/100, pembahasan, tanpa overflow horizontal.

## Sisa
- Video masih placeholder. Paket SMA masih `onSale: false`.
