# 2026-11-17 feat/kelas-3-bab-5-v2: Kelas 3 Bab 5 Penyajian Data dalam Tabel (versi baru)

## Lingkup
- Versi lama (dibuat di sesi ChatGPT) diganti. URL tetap: `/kelas/dasar-matematika-kelas-3/materi/penyajian-data-dalam-tabel`.
- Sumber: PDF Matematika SD/MI Kelas III Bab 5 (Kemendikbudristek 2022, 18 halaman), termasuk Ayo Berpikir, Ayo Berlatih, dan Asesmen.
- A. Mengurutkan dan Membandingkan Data, dengan dua peraga:
  - urutkan kartu banyak anggota keluarga dengan umpan balik;
  - kartu nilai ulangan: urutkan, hitung nilai tertentu, jangkauan.
- B. Menyajikan Data dalam Bentuk Tabel, dengan dua peraga:
  - lidi turus dengan lidi kelima miring;
  - ketuk huruf atau anak satu per satu untuk mengisi tabel turus.
- Latihan 4 soal per subtopik.
- Evaluasi 24 soal (Sedang 8, Menantang 9, Sangat menantang 7), selang-seling A/B, dengan bentuk jawaban buku:
  - urutkan (data yang sama boleh bertukar);
  - pilih yang sama banyak;
  - isi banyak dari turus;
  - lengkapi tabel turus dan banyak;
  - buat turus;
  - hitung benda pada gambar dan huruf pada kotak;
  - jangkauan;
  - soal cerita.
- Pada soal "sajikan dalam tabel", kolom turus disembunyikan agar tidak memberi tahu jawaban.

## Berkas
- `src/chapters/kelas-3-penyajian-data/`, `src/data/grade-three-data-table.ts`, `src/components/learn/GradeThreeDataTable.tsx`.
- `scripts/verify-grade-three-data-table.mjs`, `scripts/smoke-grade-three-data-table.mjs`, `.github/workflows/grade-three-data-table-qa.yml`.
- Dihapus:
  - `GradeThreeData.tsx`, `src/data/grade-three-data.ts`;
  - skrip verify/smoke dan workflow `grade-three-data`;
  - entri `materials.ts` dan cabang `if` halaman materi.

## Validasi
- verify: `Kelas 3 Bab 5 OK: 2 subtopik, 8 latihan, 24 evaluasi (tingkat 8/9/7)`. Kunci dihitung ulang dari kartu, tabel, kata, gambar benda, dan kotak huruf.
- eslint dan build lulus.
- smoke 320×640, 390×844, 768×1024, 1280×800:
  - jalur klik dari halaman Kelas 3;
  - 4 peraga;
  - 8 latihan (1 salah disengaja);
  - 24 evaluasi dengan skor 96 dan pembahasan;
  - setiap peraga dan soal muat di layar sebelum dijawab, juga dengan `FONT="DejaVu Sans"`.

## Catatan
- Kelas untuk layar pendek harus ditulis langsung (`[@media(max-height:700px)]:...`), bukan lewat variabel, agar Tailwind membuatnya.
- Di 320×640 semua kartu soal, termasuk pembahasan setelah diperiksa, muat di layar.
- Video belum ada.
