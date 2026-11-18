# Kelas 1 Bab 3 Pengurangan sampai dengan 10 (timpa) — feat/kelas-1-bab-3-v2

## Lingkup
- Mengganti bab lama `kelas-1-pengurangan-10` (slug tetap `pengurangan-sampai-dengan-10`) dengan versi baru lewat `src/chapters/kelas-1-pengurangan-10`.
- Sumber: Buku Siswa Matematika SD/MI Kelas I (Kurikulum Merdeka 2022), Bab 3 hlm. 77–111 (PDF unggahan Mr Iwan).
- Subtopik: A. Cerita Pengurangan, B. Berbagai Cara Melakukan Pengurangan (pasangan bilangan, hitung mundur, pengurangan dari 10), C. Hubungan Penjumlahan dan Pengurangan, D. Soal Cerita Pengurangan.
- 4 peraga (ambil benda dengan mencoret; tab pasangan/mundur/dari 10; keluarga bilangan; cerita), 16 latihan (4 per subtopik), 24 soal evaluasi (8/9/7, A–D bergantian, 6 per subtopik, 11 soal beraksi).
- Bentuk jawaban mengikuti buku: lengkapi kalimat, tulis □ − □ = □ dari gambar, pasangan bilangan, ketuk tempat mendarat saat mundur, coret benda, bingkai 10, pilih tanda + / −, pilih semua operasi yang hasilnya sama, susun kartu bilangan, tulis tiga pengurangan yang hasilnya 5, soal cerita satu dan dua langkah. "Buat cerita" diganti dengan memilih cerita yang cocok.
- Gambar baru: telur (utuh dan pecah), balon, wortel, apel dimakan ulat; benda lain memakai gambar Bab 1/Bab 2.

## Path
- `src/data/grade-one-sub10-v2.ts`, `src/components/learn/GradeOneSub10V2.tsx`, `src/components/learn/GradeOneSub10Art.tsx`
- `src/chapters/kelas-1-pengurangan-10/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-one-sub10-v2.mjs`, `scripts/smoke-grade-one-sub10-v2.mjs`, `.github/workflows/grade-one-sub10-v2-qa.yml`
- Dihapus: `GradeOneSubtraction.tsx`, `src/data/grade-one-subtraction.ts`, rute statis `src/app/kelas/matematika-dasar-kelas-1/materi/pengurangan-sampai-dengan-10`, `scripts/verify-grade-one-subtraction.mjs`, `scripts/smoke-grade-one-subtraction.mjs`, `scripts/smoke-grade-one-chapters-one-to-three.mjs` (sudah tidak ada bab yang diuji), entri di `materials.ts` dan baris di `grade-one-addition-qa.yml`.

## Validasi (lokal)
- verify: 76 kunci dihitung ulang dari gambar/kalimat, tingkat 8/9/7, tidak ada subtopik berurutan, posisi jawaban pilihan bervariasi.
- eslint berkas bab, `npm run build`.
- smoke mode ketat 320×640, 390×844, 768×1024, 1280×800: jalur klik dari halaman kelas, keempat peraga, 16 latihan (1 salah disengaja), 24 evaluasi, muat di layar tanpa menggulir, skor 96 dan pembahasan.
- Catatan: latihan C1 dan D4 setelah diperiksa di 320×640 lebih 3–4 px (pemeriksaan sesudah jawab tidak wajib).
- Temuan Codex (soal cerita tanpa gambar) diperbaiki: semua soal cerita kini bergambar (mula-mula, yang pergi, sisa); bagian yang ditanyakan digambar "?".

## Sisa
- Video belum ada (panel placeholder).
- Pratinjau perlu dilihat Mr Iwan.
