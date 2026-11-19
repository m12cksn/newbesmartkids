# Kelas 1 Bab 7 Mengukur Panjang Benda (timpa) — feat/kelas-1-bab-7-v2

## Lingkup
- Mengganti bab lama `kelas-1-panjang-benda` (slug tetap `mengukur-panjang-benda`) dengan versi baru lewat `src/chapters/kelas-1-panjang-benda`.
- Sumber: Buku Siswa Matematika SD/MI Kelas I (Kurikulum Merdeka 2022), Bab 7 hlm. 197–217 (PDF unggahan Mr Iwan).
- Subtopik: A. Membandingkan dan Mengurutkan Panjang Benda, B. Mengukur Panjang Benda.
- Dua peraga:
  - A: ubah panjang pensil lalu ratakan ujung kirinya, ubah tinggi pohon, naikkan dan turunkan kupu-kupu; kalimat paling, lebih, dan sama berubah otomatis.
  - B: ukur buku/meja dengan penjepit kertas, koin, stik es krim, sedotan, atau jengkal satu per satu; lima cara meletakkan sedotan: benar, ada celah, bertumpuk, tidak dari ujung, miring.
- 8 latihan (4 per subtopik) dan 24 soal evaluasi (8/9/7; A dan B bergantian; 12 per subtopik).
- Bentuk jawaban mengikuti buku:
  - lingkari benda (ketuk);
  - "Pohon yang paling … adalah □" (pilih huruf);
  - urutan (ketuk berurutan; yang sama tinggi boleh bertukar);
  - posisi hewan terbang;
  - menghitung penjepit kertas, stik es krim, atau koin;
  - menambahkan alat ukur sampai ujung benda;
  - tinggi hewan dalam kotak;
  - benda pada petak kotak (ujung tidak rata);
  - cara mengukur yang benar;
  - menilai cara Kira;
  - jengkal Kira dan Ayah;
  - tebakan dibanding hasil.
- Semua gambar adalah SVG buatan sendiri (pensil, krayon, sisir, sikat gigi, daun, pita, sendok, jam tangan, gunting, botol minum, buku, meja, pohon, pohon kelapa, payung, kapal, burung, kupu-kupu, capung, kucing, sapi, jerapah, siswa, penjepit kertas, koin, stik es krim, sedotan, tangan).

## Path
- `src/data/grade-one-length-v2.ts`
- `src/components/learn/GradeOneLengthV2.tsx`
- `src/components/learn/GradeOneLengthArt.tsx`
- `src/chapters/kelas-1-panjang-benda/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-one-length-v2.mjs`, `scripts/smoke-grade-one-length-v2.mjs`, `.github/workflows/grade-one-length-v2-qa.yml`
- Dihapus:
  - `GradeOneChapterSeven.tsx`;
  - `scripts/smoke-grade-one-measurement.mjs` dan barisnya di `grade-one-addition-qa.yml`;
  - cabang `if` Bab 7 di `src/app/kelas/[slug]/materi/[materiSlug]/page.tsx`;
  - entri di `materials.ts`.

## Validasi (lokal)
- verify: 48 kunci dihitung ulang dari gambar, mencakup:
  - paling, lebih, dan sama dari tinggi/panjang/posisi;
  - urutan, termasuk penolakan urutan terbalik;
  - hitungan alat ukur pas dengan panjang benda;
  - jumlah kotak;
  - jengkal;
  - banyak kupu-kupu yang lebih tinggi;
  - satu jawaban benar pada pilih gambar;
  - variasi posisi jawaban.
- eslint berkas bab, `npm run build`.
- smoke mode ketat:
  - ukuran: 320×640, 390×844, 768×1024, 1280×800, ditambah 320×800 (tepi kanan saja);
  - jalur klik dari halaman kelas;
  - kedua peraga;
  - 8 latihan (2 salah disengaja) dan 24 evaluasi;
  - setiap soal muat di layar sebelum dan sesudah dijawab;
  - tidak ada isi yang melewati tepi kanan;
  - skor 96 dan pembahasan.
- Di layar ≥ 640 px, gambar soal dan jawaban berdampingan agar muat tanpa menggulir.
- Catatan: setelah tombol Periksa ditekan di latihan, kotak pembahasan bisa membuat kartu sedikit lebih tinggi dari layar (sama seperti bab sebelumnya).

## Sisa
- Video belum ada (panel placeholder).
- Pratinjau perlu dilihat Mr Iwan.

## Catatan CI
- Runner CI merender dengan font cadangan yang lebih lebar. `FONT="DejaVu Sans"` pada smoke meniru ukurannya (latihan A4: 594 px, sama dengan CI).
- Di layar pendek (tinggi ≤ 700 px), gambar dibatasi 21vh dan jawaban di-zoom 0,78.
- Beberapa sub-soal yang tumpang tindih dihapus agar setiap soal muat di 320×640.
- `MARGIN=n` mencatat soal yang sisa ruangnya kurang dari n px.
