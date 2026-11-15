# 2026-11-15 — feat/grade-ten-functions

## Ruang lingkup
Bab baru **Kelas 10 Bab 3 — Fungsi** dari PDF Buku Siswa Matematika Kelas X Bab 3 (hlm. 71–116).

- A. Fungsi dan operasinya: A.1 notasi, daerah asal, daerah hasil, grafik (peraga mesin fungsi), A.2 operasi aljabar (peraga tabel operasi).
- B. Fungsi komposisi: B.1 konsep (peraga mesin produksi bertahap, urutan bisa ditukar), B.2 sifat (peraga pembanding komposisi: tidak komutatif, asosiatif, identitas).
- C. Fungsi invers: C.1 syarat bijektif (peraga diagram panah dengan tombol Balik panah), C.2 rumus invers (peraga grafik f dan f⁻¹ dicerminkan terhadap y = x).
- 24 latihan (4 per bagian) dan 24 evaluasi (A/B/C masing-masing 8, berselang-seling; Sedang 8, Menantang 9, Sangat menantang 7).
- Bentuk jawaban mengikuti buku: daerah asal/hasil dari grafik dan rumus, koefisien hasil operasi dan komposisi, komposisi pasangan terurut, mencari f dari g∘f, diagram panah invers, rumus invers (px + q)/r, soal fungsi khusus.
- Koreksi isi buku: Masalah 3.3 menulis −0,36x (seharusnya −0,036x) sehingga dua cara memberi hasil berbeda; contoh di bab ini memakai hasil yang benar, 193,32 ton. Uji Kompetensi 3.2 no. 9 menghasilkan g yang tidak bijektif, jadi tidak dipakai.

## Berkas
- `src/data/grade-ten-functions.ts`, `src/components/learn/GradeTenFunctions.tsx`, `src/components/learn/GradeTenFunctionsArt.tsx`
- `src/chapters/kelas-10-fungsi/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-ten-functions.mjs`, `scripts/smoke-grade-ten-functions.mjs`, `.github/workflows/grade-ten-functions-qa.yml`

## Validasi
- Verify: kunci setiap soal, penolakan jawaban salah, bentuk invers setara diterima, 98 hitungan ulang (polinom komposisi di beberapa x, f(f⁻¹(x)) = x, daerah asal diuji titik, diagram bijektif, soal cerita), posisi jawaban pilihan 0:7, 1:6, 2:4.
- Build produksi lulus. Smoke Playwright lulus di 320/390/768/1280: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi, skor 96/100, pembahasan, tanpa overflow horizontal.

## Sisa
- Video masih placeholder. Bab 2 dan 3 Kelas 10 memerlukan akses Kelas 10; paket SMA masih `onSale: false`.
