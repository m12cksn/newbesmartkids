# Kelas 9 Bab 1 Sistem Persamaan Linear Dua Variabel (feat/kelas-9-spldv)

- Sumber: Buku Siswa Matematika SMP/MTs Kelas IX (Kurikulum Merdeka 2022) Bab I, hlm. 1–40 (PDF dari pengguna). Subtopik A Persamaan Linear Dua Variabel; B Sistem Persamaan Linear Dua Variabel: 1 metode grafik, 2 substitusi, 3 eliminasi, 4 campuran.
- Bab baru lewat registry: `src/chapters/kelas-9-spldv/` (slug `sistem-persamaan-linear-dua-variabel`), tampil di `/kelas/strategi-matematika-kelas-9` sebagai Bab 1. Tidak ada file bersama yang diubah.
- Materi SMP lebih panjang: 6 bagian, masing-masing 5 langkah, kotak "Dalam kehidupan sehari-hari", contoh dengan langkah pengerjaan, "Perlu diperhatikan", dan peraga sendiri.
  - A.1 Bentuk ax + by = c (toko sembako, neraca pegas, tarif listrik; peraga: harga, uang, berat beras → berat tepung dan titik pada grafik).
  - A.2 Himpunan penyelesaian (belanja roti dan susu; peraga: ax + by = c dengan semesta cacah/bulat/real).
  - B.1 Metode grafik (Putri dan Akbar; peraga: dua garis, titik potong, sejajar/berimpit).
  - B.2 Substitusi (sepeda Pak Ahmad, kebun, kesalahan Joko; peraga: tiga langkah substitusi dan apakah hasilnya mungkin dibeli).
  - B.3 Eliminasi (warung nasi goreng, Butet; peraga: pengali KPK, jumlah/kurang, dua urutan eliminasi).
  - B.4 Campuran (kain tenun NTT; peraga: dua nota toko buah, eliminasi lalu substitusi, belanja baru).
- File: `src/data/grade-nine-systems.ts`, `src/components/learn/GradeNineSystems.tsx`, `src/components/learn/GradeNineSystemsArt.tsx` (bidang koordinat ax + by = c, kuadran I, nota belanja, grafik jarak–waktu, sudut berpenyiku), `scripts/verify-grade-nine-systems.mjs`, `scripts/smoke-grade-nine-systems.mjs`, `.github/workflows/grade-nine-systems-qa.yml`.
- Bentuk jawaban seperti buku: PLDV atau bukan, pasangan penyelesaian atau bukan, model ax + by = c (bentuk setara diterima), tabel, himpunan penyelesaian cacah dengan mengetuk titik, menggambar dua garis lalu titik potong, benar/salah, mencocokkan sistem dengan grafik, (x, y), nilai n dan p + q, soal cerita.
- Latihan 4 per subtopik (24). Evaluasi 24 (8 Sedang, 9 Menantang, 7 Sangat menantang; bagian tidak pernah berurutan sama): soal Latihan/Uji Kompetensi buku dengan angka baru.
- Validasi: verify menghitung ulang 160 kunci (setiap sistem diselesaikan ulang dari koefisiennya, soal cerita dari datanya, himpunan cacah lengkap), menolak jawaban salah per jenis, menerima bentuk persamaan setara. tsc, eslint, build; Playwright 320/390/768/1280: tautan halaman kelas, 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi (1 salah disengaja), skor dan pembahasan. Tangkapan layar diperiksa.
- Catatan sebelumnya: PR #116 (laporan orang tua) di-merge sebagai e3503a9; deploy Vercel produksi sukses.
- Belum diuji: video asli (placeholder).
