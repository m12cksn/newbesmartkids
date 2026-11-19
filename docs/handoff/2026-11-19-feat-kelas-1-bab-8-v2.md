# Kelas 1 Bab 8 Mengenal Diagram (timpa) — feat/kelas-1-bab-8-v2

## Lingkup
- Mengganti bab lama `kelas-1-mengenal-diagram` (slug tetap `mengenal-diagram`) dengan versi baru lewat `src/chapters/kelas-1-mengenal-diagram`.
- Sumber: Buku Siswa Matematika SD/MI Kelas I (Kurikulum Merdeka 2022), Bab 8 hlm. 219–242 (PDF unggahan Mr Iwan).
- Subtopik: A. Mengelompokkan Data (daftar dan tabel), B. Diagram Gambar.
- Dua peraga:
  - A: ketuk rak tujuan lalu ketuk mainan untuk merapikan toko Paman. Tabel mendatar/menurun ikut terisi, beserta kalimat paling banyak/sedikit.
  - B: tambah atau kurangi anak untuk setiap sayur. Diagram dapat diubah tegak/mendatar dan bergambar sayur/bintang, dengan jumlah semua anak.
- 8 latihan (4 per subtopik) dan 24 soal evaluasi (8/9/7; A dan B bergantian; 12 per subtopik).
- Bentuk jawaban mengikuti buku:
  - menghitung benda bercampur lalu mengisi daftar/tabel;
  - membaca tabel tegak dan mendatar;
  - menyalin tabel menurun ke mendatar;
  - melengkapi angka yang hilang dari jumlah semua;
  - membaca diagram gambar (bintang, wajah, karet gelang, gambar sayur dengan nomor);
  - "… paling banyak/sedikit adalah …", "… lebih banyak dari …", "sama banyak", jumlah semua;
  - mewarnai lingkaran sesuai banyak data, termasuk dari kalimat "2 kurangnya / 1 lebihnya";
  - mengelompokkan benda ke kotaknya.
- Semua gambar adalah SVG buatan sendiri di `GradeOneDiagramArt.tsx`: kelereng, bola, pita, pensil, buah, mainan, sayur, pakaian, hewan, alat tulis, bintang, wajah, karet gelang.

## Path
- `src/data/grade-one-diagram-v2.ts`
- `src/components/learn/GradeOneDiagramV2.tsx`
- `src/components/learn/GradeOneDiagramArt.tsx`
- `src/chapters/kelas-1-mengenal-diagram/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-one-diagram-v2.mjs`, `scripts/smoke-grade-one-diagram-v2.mjs`, `.github/workflows/grade-one-diagram-v2-qa.yml`
- Dihapus:
  - `GradeOneChapterEight.tsx`;
  - `scripts/smoke-grade-one-diagrams.mjs` dan barisnya di `grade-one-addition-qa.yml`;
  - cabang `if` Bab 8 di `src/app/kelas/[slug]/materi/[materiSlug]/page.tsx`;
  - entri di `materials.ts`.

## Validasi (lokal)
- verify: 64 kunci dihitung ulang dari gambar, tabel, dan diagram, mencakup:
  - banyak per warna/jenis;
  - paling banyak/sedikit;
  - tepat satu pasangan sama banyak;
  - selisih dan jumlah;
  - baris yang hilang dari jumlah semua;
  - lingkaran yang diwarnai, termasuk dari "kurangnya/lebihnya";
  - setiap benda punya kelompok.
- eslint berkas bab, `npm run build`.
- smoke mode ketat:
  - ukuran: 320×640, 390×844, 768×1024, 1280×800, ditambah 320×800 (tepi kanan saja);
  - dijalankan dengan font biasa dan dengan `FONT="DejaVu Sans"` (meniru font runner CI);
  - jalur klik dari halaman kelas;
  - kedua peraga;
  - 8 latihan (2 salah disengaja) dan 24 evaluasi;
  - muat di layar sebelum menjawab;
  - tidak ada isi yang melewati tepi kanan;
  - skor 96 dan pembahasan.
- Catatan: setelah tombol Periksa ditekan di latihan, kotak pembahasan bisa membuat kartu lebih tinggi dari layar 320×640 (sama seperti bab sebelumnya).

## Sisa
- Video belum ada (panel placeholder).
- Pratinjau perlu dilihat Mr Iwan.
