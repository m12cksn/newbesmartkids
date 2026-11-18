# Kelas 6 Bab 3 Kubus dan Balok (timpa versi lama)

Cabang: `feat/kelas-6-bab-3-v2`. Sumber: PDF Matematika SD/MI Kelas VI (Kemendikbudristek 2022) hal. 75–98, dikirim Mr Iwan.

## Ruang lingkup
- Subtopik A Mengonstruksi dan Mengurai (A.1 menyusun kubus, A.2 mengurai bangun), B Visualisasi Spasial (B.1 tampak depan/kanan/atas, B.2 menyusun dari gambar tampak, dadu), C Lokasi (C.1 menentukan lokasi pada sistem berpetak dan peta, C.2 jalur dan jarak).
- Enam peraga: denah tumpukan dengan gambar isometrik, urai per lantai, pilih arah pandang, susun sampai tiga tampak cocok, kertas berpetak (tanda X), jalur P ke Q.
- Latihan 4 soal per bagian (8 per subtopik). Evaluasi 24 soal, tingkat 8/9/7, subtopik bergantian, 10 soal dengan aksi langsung: susun kubus pada denah, warnai gambar tampak, pilih gambar, ketuk titik, gambar jalur.
- Bentuk soal mengikuti buku: hitung kubus/balok, susun dari gambar, sama atau beda dilihat dari arah lain, gambar tampak tiga arah, dadu (sisi berlawanan 7), letak (huruf, bilangan), peta petak, jarak mendatar/tegak, kubus direbahkan, banyak jalur terpendek (pengayaan), tumpukan kardus Pak Hasan.

## Berkas
- `src/data/grade-six-cubes-v2.ts`, `src/components/learn/GradeSixCubesV2.tsx`, `src/chapters/kelas-6-kubus-balok/{meta.ts,Chapter.tsx}`.
- `scripts/verify-grade-six-cubes-v2.mjs`, `scripts/smoke-grade-six-cubes-v2.mjs`, `.github/workflows/grade-six-cubes-v2-qa.yml`.
- Dihapus: `GradeSixCubes.tsx`, `CubesVisuals.tsx`, `CubeOrbit.tsx`, `grade-six-cubes.ts`, skrip verify/smoke lama, `smoke-cube-orbit.mjs`, workflow `grade-six-cubes-qa.yml`, entri di `materials.ts`, dan cabang `if` di halaman materi.

## Validasi
- Verify: susunan soal, tidak ada kubus melayang, puncak setiap tumpukan terlihat minimal 30% dari arah gambar, keunikan pilihan gambar, tampak dihitung ulang dari bangun, dadu disimulasikan, kubus direbahkan disimulasikan, banyak jalur = kombinasi, luas lantai kardus terkecil tunggal.
- Smoke lokal 320×640, 390×844, 768×1024, 1280×800 lulus dengan font lebar (DejaVu Sans): jalur klik dari halaman kelas, 6 peraga, 24 latihan, 24 evaluasi, kartu soal muat di layar sebelum diperiksa, skor dan pembahasan.

## Sisa
- Video belum ada (panel placeholder).
- Pembahasan setelah diperiksa bisa membuat kartu lebih tinggi dari layar 320×640 (catatan lunak, sama seperti bab lain).
