# 2026-11-15 — feat/grade-ten-trigonometry

## Ruang lingkup
Bab baru **Kelas 10 Bab 4 — Trigonometri** dari PDF Buku Siswa Matematika Kelas X Bab 4 (hlm. 117–203). Pesan pemilik menulis "bab 3 Fungsi", tetapi isi PDF dan subtopiknya adalah Bab 4 Trigonometri.

- A. Ukuran sudut dan perbandingan: A.1 derajat-radian-putaran dan kuadran (peraga sudut pada lingkaran satuan), A.2 perbandingan pada segitiga siku-siku (peraga sisi bisa diubah), A.3 sudut istimewa (peraga setengah persegi/segitiga sama sisi).
- B. Relasi dan identitas: B.1 relasi sudut dan tanda kuadran (peraga lingkaran satuan), B.2 identitas (peraga batang sin² + cos² = 1).
- C. Aturan dan grafik: C.1 aturan sinus/cosinus dan luas (peraga segitiga SAS), C.2 grafik y = a sin bx + d (peraga grafik sin/cos/tan).
- 28 latihan (4 per bagian) dan 24 evaluasi (A/B/C masing-masing 8, berselang-seling; Sedang 8, Menantang 9, Sangat menantang 7).
- Bentuk jawaban: konversi π-radian (p/q π), nilai eksak p√q/r, kuadran, benar/salah, penyederhanaan identitas, aturan sinus/cosinus, maksimum/minimum/periode, pilih grafik.
- Koreksi isi buku: Contoh 4.9b seharusnya A = 29°; kotak hlm. 167 salah tanda cos 150°, tan 150°, tan 330°; Sifat 4.6c seharusnya tan²α − sec²α = −1; Contoh 4.16 seharusnya s ≈ 4,77.

## Berkas
- `src/data/grade-ten-trigonometry.ts`, `src/components/learn/GradeTenTrigonometry.tsx`, `src/components/learn/GradeTenTrigonometryArt.tsx`
- `src/chapters/kelas-10-trigonometri/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-ten-trigonometry.mjs`, `scripts/smoke-grade-ten-trigonometry.mjs`, `.github/workflows/grade-ten-trigonometry-qa.yml`

## Validasi
- Verify: kunci, penolakan jawaban salah, bentuk setara (2√3/4 = √3/2, 3π/18 = π/6) diterima, 95 hitungan ulang dengan fungsi trigonometri JavaScript (nilai, kuadran dari tanda, akar grafik, grafik pilihan).
- Build produksi lulus. Smoke Playwright lulus di 320/390/768/1280: 7 peraga, 28 latihan (1 salah disengaja), 24 evaluasi, skor 96/100, pembahasan, tanpa overflow horizontal.

## Sisa
- Video masih placeholder. Bab 2–4 Kelas 10 memerlukan akses Kelas 10; paket SMA masih `onSale: false`.
