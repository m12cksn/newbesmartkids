# Kelas 1 Bab 4 Mengenal Bentuk (timpa) — feat/kelas-1-bab-4-v2

## Lingkup
- Mengganti bab lama `kelas-1-mengenal-bentuk` (slug tetap `mengenal-bentuk`) dengan versi baru lewat `src/chapters/kelas-1-mengenal-bentuk`.
- Sumber: Buku Siswa Matematika SD/MI Kelas I (Kurikulum Merdeka 2022), Bab 4 hlm. 115–144 (PDF unggahan Mr Iwan).
- Subtopik: A. Mendeskripsikan Benda Berdasarkan Bentuk, B. Mengelompokkan Benda, C. Menyusun dan Mengurai Bentuk Bangun.
- 3 peraga (cari bentuk benda lalu masukkan ke kotak; kelompokkan menurut bentuk/warna/ukuran; gabung dua segitiga dan susun rumah), 12 latihan (4 per subtopik), 24 soal evaluasi (8/9/7, A–C bergantian, 8 per subtopik).
- Bentuk jawaban mengikuti buku: pasangkan dengan menarik garis (benda–bentuk, bentuk–nama), hubungkan garis putus-putus lalu pilih nama, lingkari semua yang benar, lingkari bangun satu kelompok/warna/ukuran, warnai paling besar (merah) dan paling kecil (kuning), kelompokkan ke kotak, lingkari pasangan potongan (potongan yang dipilih langsung terpasang di lubang), hitung bentuk pada gambar (kereta, rumah, robot, perahu), dan susun keping ke tempatnya (rumah, roket).
- Gambar benda dibuat khusus (SVG): jam dinding, piring, donat, lolipop, telur, kue kering, potongan semangka, kue risol, penggaris segitiga, gantungan baju, rambu peringatan, buku, pintu, jendela, bingkai foto, kue lapis, amplop.

## Path
- `src/data/grade-one-shapes-v2.ts`, `src/components/learn/GradeOneShapesV2.tsx`, `src/components/learn/GradeOneShapesArt.tsx`
- `src/chapters/kelas-1-mengenal-bentuk/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-one-shapes-v2.mjs`, `scripts/smoke-grade-one-shapes-v2.mjs`, `.github/workflows/grade-one-shapes-v2-qa.yml`
- Dihapus: `GradeOneShapes.tsx`, `src/data/grade-one-shapes.ts`, rute statis `src/app/kelas/matematika-dasar-kelas-1/materi/mengenal-bentuk`, `scripts/verify-grade-one-shapes.mjs`, `scripts/smoke-grade-one-shapes.mjs`, entri di `materials.ts`, baris di `grade-one-addition-qa.yml`.

## Validasi (lokal)
- verify: 36 kunci dihitung ulang (bentuk dari jenis bangun, warna, ukuran, luas untuk warnai, jumlah bentuk dari gambar, kecocokan keping), tingkat 8/9/7, tidak ada subtopik berurutan, posisi jawaban pilihan 0/1/2 bervariasi.
- eslint berkas bab, `npm run build`.
- smoke mode ketat 320×640, 390×844, 768×1024, 1280×800: jalur klik dari halaman kelas, ketiga peraga, 12 latihan (1 salah disengaja), 24 evaluasi, muat di layar tanpa menggulir sebelum menjawab, skor 96 dan pembahasan.
- Catatan: di 320×640, 11 latihan lebih tinggi dari layar setelah diperiksa karena pembahasan muncul (pemeriksaan sesudah jawab tidak wajib).

## Sisa
- Video belum ada (panel placeholder).
- Pratinjau perlu dilihat Mr Iwan.
