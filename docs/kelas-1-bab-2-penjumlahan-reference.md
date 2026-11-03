# Bab 2 — Penjumlahan sampai dengan 10: acuan implementasi
Status: referensi guru lengkap (gambar halaman 46–49, 53–56, 63–65, 70–72). Ini adalah spesifikasi revisi PR #6; jangan merge sampai implementasi dan pengujian selesai.

## Kompetensi dan urutan
1. A. Cerita Penjumlahan: hitung dua kelompok benda, isi banyaknya masing-masing dan keseluruhan; tulis persamaan [ ] + [ ] = [ ]; buat cerita sendiri dari ilustrasi. Gunakan objek yang sesuai teks.
2. B. Berbagai cara melakukan penjumlahan:
   - Pasangan Bilangan: diagram bagian-keseluruhan, isi salah satu bagian atau total; representasi benda mendukung persamaan.
   - Menghitung Maju: garis bilangan 1–10, mulai pada bilangan pertama, lompat sejumlah bilangan kedua, perlihatkan jejak tiap lompatan, lalu tulis hasil.
   - Penjumlahan Berulang: kelompok berukuran sama, tunjukkan tiap kelompok dan bentuk kalimat penjumlahan berulang (bukan sekadar perkalian).
   - Penjumlahan yang hasilnya 10: bingkai 10 dua warna, isi bagian kosong, pilih dua pasangan yang berbeda, buat representasi sendiri.
3. C. Soal Cerita Penjumlahan: pahami situasi, identifikasi dua kuantitas, isi [ ] + [ ] = [ ], tulis kalimat jawaban dengan satuan. Gunakan konteks yang wajar untuk kelas 1.
4. Evaluasi akhir: gabungkan seluruh kompetensi. Tidak semua soal berupa isian hasil akhir. Variasikan menyusun persamaan, mengisi dua/lebih kotak, melengkapi diagram, menghitung maju, mencocokkan gambar, serta membuat pasangan bilangan. Tingkat mudah–sedang–menantang mencerminkan proses berpikir.

## Perbaikan wajib terhadap implementasi awal
- Hindari visual statis yang hanya menampilkan hasil lompatan: anak harus dapat menjalankan langkah menghitung maju.
- Jangan menyamakan semua format menjadi satu input jawaban; persamaan perlu kotak yang dapat diisi langsung dan diperiksa sebagai satu kesatuan.
- Penjumlahan berulang diajarkan dengan pengelompokan konkret dan penjumlahan berulang, bukan pengenalan perkalian.
- Aktivitas membuat pasangan 10 harus memungkinkan siswa menyusun sendiri dua kelompok dan melihat bahwa jumlahnya tetap 10.
- Soal roda kendaraan boleh sebagai pengayaan, bukan pengganti cakupan utama.
- Semua soal maksimal hasil 10 dan teks/ilustrasi/kunci harus konsisten.
- Materi, latihan submateri, dan evaluasi akhir merupakan tiga lapisan berbeda; evaluasi bukan pengganti latihan saat belajar.
- Jangan menyalin ilustrasi atau teks soal dari buku; gunakan representasi orisinal.

## Gerbang kualitas
- Periksa setiap soal terhadap kompetensi, visual, teks, kunci, dan feedback.
- Uji setiap jenis interaksi dengan mouse, sentuhan, dan keyboard, termasuk tampilan ponsel.
- Jalankan `node --test scripts/verify-grade-one-addition.mjs` dan `npm run build`.
- PR tetap draft sampai seluruh poin di atas diuji; hasil build/browser belum diverifikasi.
