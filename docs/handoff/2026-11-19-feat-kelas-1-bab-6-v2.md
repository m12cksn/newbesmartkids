# Kelas 1 Bab 6 Penjumlahan dan Pengurangan sampai dengan 20 (timpa) — feat/kelas-1-bab-6-v2

## Lingkup
- Mengganti bab lama `kelas-1-operasi-20` (slug tetap `penjumlahan-dan-pengurangan-sampai-dengan-20`) dengan versi baru lewat `src/chapters/kelas-1-operasi-20`.
- Sumber: Buku Siswa Matematika SD/MI Kelas I (Kurikulum Merdeka 2022), Bab 6 hlm. 175–196 (PDF unggahan Mr Iwan; Mr Iwan menyebutnya "Bab 5").
- Subtopik: A. Mengenal Konsep Lebih dari, Kurang dari, dan Selisih, B. Penjumlahan yang Hasilnya Kurang dari 20, C. Pengurangan yang Hasilnya Kurang dari 20.
- 3 peraga (memasangkan donat Ibu dan Tika untuk selisih; penjumlahan dengan hitung maju, bingkai 10, nilai tempat; pengurangan dengan hitung mundur dan coret satuan pasangan bilangan), 12 latihan (4 per subtopik), 24 soal evaluasi (8/9/7, A–C bergantian, 8 per subtopik).
- Bentuk jawaban mengikuti buku: "Ada □ …", "… □ lebihnya/kurangnya dari …", selisih dari cerita, gambar dua kelompok (A n kurangnya/lebihnya dari B), pita bilangan hitung maju, garis bilangan hitung mundur, memisah bilangan (penjumlahan 10, berulang, pasangan bilangan), tabel nilai tempat bersusun (termasuk bilangan yang hilang), dan "… [tanda] … = …" untuk soal cerita.

## Path
- `src/data/grade-one-op20-v2.ts`, `src/components/learn/GradeOneOp20V2.tsx` (memakai gambar Bab 3 dan Bab 5)
- `src/chapters/kelas-1-operasi-20/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-one-op20-v2.mjs`, `scripts/smoke-grade-one-op20-v2.mjs`, `.github/workflows/grade-one-op20-v2-qa.yml`
- Dihapus: `GradeOneChapterSix.tsx`, `ChapterSixExercises.tsx`, `scripts/smoke-grade-one-chapters-five-six.mjs` (tinggal Bab 6 lama) dan barisnya di `grade-one-addition-qa.yml`, cabang `if` Bab 6 di `src/app/kelas/[slug]/materi/[materiSlug]/page.tsx`, entri di `materials.ts`.

## Validasi (lokal)
- verify: 66 kunci dihitung ulang (operasi di kalimat, pita bilangan, pemisahan bilangan, kolom tanpa menyimpan/meminjam, selisih dari gambar, tanda operasi, arah gambar dua kelompok).
- eslint berkas bab, `npm run build`.
- smoke mode ketat 320×640, 390×844, 768×1024, 1280×800 + 320×800 (tepi kanan saja): jalur klik dari halaman kelas, ketiga peraga, 12 latihan (1 salah disengaja), 24 evaluasi, muat di layar sebelum menjawab, tidak ada isi yang melewati tepi kanan, skor 96 dan pembahasan.
- Temuan Codex diperbaiki: soal 18 dan 20 kini memberi pertanyaan untuk tiap operasi (a., b.); peraga "Dengan 10" memakai angka sendiri (merah 5–9, hijau cukup untuk melewati 10) dan bingkai dua warna.
- Catatan: di 320×800 (tanpa zoom tinggi-layar) latihan A1, A3, dan evaluasi 10 sedikit lebih tinggi dari layar.

## Sisa
- Video belum ada (panel placeholder).
- Pratinjau perlu dilihat Mr Iwan.
