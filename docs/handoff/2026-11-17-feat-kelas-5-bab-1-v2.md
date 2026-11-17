# 2026-11-17 feat/kelas-5-bab-1-v2: Kelas 5 Bab 1 Bilangan Cacah sampai 100.000 (versi baru)

## Lingkup
- Versi lama (dibuat di sesi ChatGPT) diganti. URL tetap: `/kelas/pecahan-dan-pengukuran-kelas-5/materi/bilangan-cacah-sampai-100000`.
- Sumber: PDF Matematika SD/MI Kelas V Bab 1 (Kemendikbudristek 2022, 28 halaman), termasuk Ayo Berlatih dan Uji Kompetensi.
- Empat subtopik A–D dengan tujuh peraga:
  - tabel nilai tempat lima kolom;
  - membaca harga per bagian titik;
  - membandingkan dua bilangan dengan kolom penentu;
  - mengurutkan harga dakon;
  - menyusun uang sampai pas Rp45.600 dan mencatat caranya;
  - bersusun langkah demi langkah (simpan/pinjam);
  - angpau: perkalian dengan memisahkan pengali dan membagi uang.
- Uang digambar sebagai lembaran dan koin sederhana bertuliskan nilainya, bukan tiruan uang asli.
- Latihan 4 soal per subtopik (16 soal).
- Evaluasi 24 soal (Sedang 8, Menantang 9, Sangat menantang 7), subtopik tidak berurutan, dengan bentuk jawaban buku:
  - tulis dengan angka;
  - pilih cara membaca;
  - tarik garis bilangan dan cara baca;
  - tabel nilai tempat;
  - tanda >, <, =;
  - bilangan lebih kecil;
  - urutkan harga;
  - barisan;
  - komposisi dan dekomposisi uang;
  - bersusun pendek;
  - benar/salah harga buah;
  - pasangkan kolom A dan B;
  - kartu angka terbesar dan terkecil;
  - soal cerita paket makan.

## Berkas
- `src/chapters/kelas-5-bilangan-cacah-100000/`, `src/data/grade-five-whole-100k.ts`, `src/components/learn/GradeFiveWhole100k.tsx`.
- `scripts/verify-grade-five-whole-100k.mjs`, `scripts/smoke-grade-five-whole-100k.mjs`, `.github/workflows/grade-five-whole-100k-qa.yml`.
- Dihapus:
  - `GradeFiveWholeNumbers.tsx`, `GradeFiveWholeAnswer.tsx`, `src/data/grade-five-whole.ts`;
  - skrip verify/smoke dan workflow `grade-five-whole`;
  - entri `materials.ts` dan cabang `if` halaman materi.

## Validasi
- verify: `Kelas 5 Bab 1 OK: 4 subtopik, 16 latihan, 24 evaluasi (tingkat 8/9/7)`. Kunci dihitung ulang dari:
  - cara baca;
  - lembar uang;
  - papan harga buah;
  - paket;
  - kartu;
  - angpau.
- eslint dan build lulus.
- smoke 320×640, 390×844, 768×1024, 1280×800:
  - jalur klik dari halaman Kelas 5;
  - 7 peraga;
  - 16 latihan (1 salah disengaja);
  - 24 evaluasi dengan skor 96 dan pembahasan;
  - setiap peraga dan soal muat di layar sebelum dijawab, juga dengan `FONT="DejaVu Sans"`.

## Catatan
- Di 320×640, pembahasan setelah jawaban latihan diperiksa bisa sedikit melebihi layar pada 2–3 soal.
- Video belum ada.
