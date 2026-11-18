# 2026-11-17 feat/kelas-3-bab-1-v2: Kelas 3 Bab 1 Bilangan Cacah sampai 1.000 (versi baru)

## Lingkup
- Versi lama (dibuat di sesi ChatGPT) diganti. URL tetap: `/kelas/dasar-matematika-kelas-3/materi/bilangan-cacah-sampai-1000`.
- Sumber: PDF Matematika SD/MI Kelas III Bab 1 (Kemendikbudristek 2022, 74 halaman), dari Ayo Mengingat sampai Asesmen.
- Tujuh subtopik A–G dengan sembilan peraga:
  - balok satuan/puluhan/ratusan dengan tukar 10;
  - kartu angka;
  - kaleng nilai tempat (menyusun dan mengurai);
  - tabel banding dua bilangan;
  - urutkan harga karet penghapus;
  - susun pendek penjumlahan dengan menyimpan;
  - susun pendek pengurangan dengan mengambil 1 puluhan;
  - kelompok sama banyak dengan tukar urutan;
  - bagi manik-manik dengan catatan pengurangan berulang.
- Latihan 4 soal per subtopik (28 soal).
- Evaluasi 24 soal (Sedang 8, Menantang 9, Sangat menantang 7), memakai bentuk jawaban buku:
  - tabel nilai tempat;
  - lambang dan cara membaca;
  - tarik garis;
  - tanda >, <, =;
  - urutkan;
  - pilih semua;
  - susun panjang dan susun pendek;
  - benar/salah;
  - pengurangan berulang;
  - soal cerita.
- Angka, gambar, dan tingkat kesulitan diubah.
- Visual dibuat besar dan muat di layar. Pada layar pendek (tinggi ≤ 700px) gambar dikecilkan, pada desktop diperbesar.

## Berkas
- `src/chapters/kelas-3-bilangan-cacah-1000/` (meta dan Chapter).
- `src/data/grade-three-whole-1000.ts`, `src/components/learn/GradeThreeWhole1000.tsx`, `src/components/learn/GradeThreeWhole1000Art.tsx`.
- `scripts/verify-grade-three-whole-1000.mjs`, `scripts/smoke-grade-three-whole-1000.mjs`, `.github/workflows/grade-three-whole-1000-qa.yml`.
- Dihapus:
  - `GradeThreeWholeNumbers.tsx`, `GradeThreeBookAnswer.tsx`, `src/data/grade-three-whole.ts`;
  - skrip verify/smoke dan workflow `grade-three-whole`;
  - entri di `materials.ts` dan cabang `if` di halaman materi.

## Validasi
- verify: `Kelas 3 Bab 1 OK: 7 subtopik, 28 latihan, 24 evaluasi (tingkat 8/9/7), 24 kalimat isian dihitung ulang, posisi pilihan 1/3/1`.
- eslint dan build produksi lulus.
- smoke pada 320×640, 390×844, 768×1024, 1280×800:
  - jalur klik dari halaman Kelas 3;
  - 9 peraga diuji interaksinya;
  - 28 latihan, termasuk 1 jawaban salah yang disengaja;
  - 24 evaluasi dengan skor 96 dan pembahasan.
- Uji muat layar: setiap peraga dan setiap soal (sampai tombol jawab) tidak lebih tinggi dari layar di keempat ukuran. Juga diuji dengan font pengganti yang lebih lebar (`FONT="DejaVu Sans"`), karena Poppins tidak dimuat sebagai webfont.
- Peraga balok bisa menukar 10 ratusan menjadi 1.000 (masukan review Codex).

## Catatan
- Di 320×640, setelah jawaban latihan diperiksa, teks pembahasan membuat kartu 1–120px lebih tinggi dari layar pada 9 soal latihan. Menjawab tetap tanpa menggulir.
- Tombol "Kertas coret" (fitur bersama) bisa menutupi tombol Lanjut saat tombol itu berada di tepi bawah layar.
- Video belum ada (panel bertanda segera hadir).
