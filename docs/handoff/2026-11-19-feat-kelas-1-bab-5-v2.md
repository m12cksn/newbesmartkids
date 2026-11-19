# Kelas 1 Bab 5 Membilang sampai dengan 20 (timpa) — feat/kelas-1-bab-5-v2

## Lingkup
- Mengganti bab lama `kelas-1-membilang-20` (slug tetap `membilang-sampai-dengan-20`) dengan versi baru lewat `src/chapters/kelas-1-membilang-20`.
- Sumber: Buku Siswa Matematika SD/MI Kelas I (Kurikulum Merdeka 2022), Bab 5 hlm. 145–174 (PDF unggahan Mr Iwan).
- Subtopik: A. Menghitung, Membaca, dan Menulis Bilangan, B. Menghitung Maju dan Mundur, C. Nilai Tempat, D. Membandingkan Bilangan.
- 4 peraga (bingkai 10 dengan nama bilangan; ulat hitung maju/mundur langkah 1 atau 2; kantong puluhan dan satuan; membandingkan apel Kira dan Tika), 16 latihan (4 per subtopik), 24 soal evaluasi (8/9/7, A–D bergantian, 6 per subtopik).
- Bentuk jawaban mengikuti buku: tarik garis bingkai 10 ke bilangan, hitung dan tulis, lingkari 10 benda, warnai sejumlah bola, pasangan bilangan "10 ditambah … menjadi …", tebak lalu hitung isi stoples, lengkapi urutan pada ulat/es krim/tabel 1–20, tabel puluhan-satuan dari kantong kelereng/pensil diikat/wadah telur, warnai lingkaran dua bingkai 10, lingkari gambar yang lebih banyak, "lebih banyak/sedikit", paling banyak/sedikit, dan urutkan dengan mengetuk kartu bilangan.

## Path
- `src/data/grade-one-count20-v2.ts`, `src/components/learn/GradeOneCount20V2.tsx`, `src/components/learn/GradeOneCount20Art.tsx`
- `src/chapters/kelas-1-membilang-20/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-one-count20-v2.mjs`, `scripts/smoke-grade-one-count20-v2.mjs`, `.github/workflows/grade-one-count20-v2-qa.yml`
- Dihapus: `GradeOneChapterFive.tsx`, cabang `if` Bab 5 di `src/app/kelas/[slug]/materi/[materiSlug]/page.tsx`, entri di `materials.ts`. `scripts/smoke-grade-one-chapters-five-six.mjs` kini hanya menguji Bab 6.

## Validasi (lokal)
- verify: 58 kunci dihitung ulang (jumlah dari gambar, puluhan-satuan, urutan dengan langkah tetap, perbandingan, urutan kartu), tingkat 8/9/7, tidak ada subtopik berurutan.
- eslint berkas bab, `npm run build`.
- smoke mode ketat 320×640, 390×844, 768×1024, 1280×800: jalur klik dari halaman kelas, keempat peraga, 16 latihan (1 salah disengaja), 24 evaluasi, muat di layar tanpa menggulir sebelum menjawab, skor 96 dan pembahasan.
- `smoke-grade-one-chapters-five-six.mjs` (Bab 6) tetap lulus di 4 lebar.

## Sisa
- Video belum ada (panel placeholder).
- Pratinjau perlu dilihat Mr Iwan.
