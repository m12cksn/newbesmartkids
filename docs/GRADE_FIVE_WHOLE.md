# Kelas 5 Bab 1 — Bilangan Cacah sampai 100.000

Sumber: `KLS-V_compressed-17-44.pdf`, 28 halaman file, buku halaman 1–28. Pemetaan dibuat sebelum implementasi; bahasa Indonesia, video belum tersedia.

| Materi | Sumber dan tujuan | Peraga siswa | Pola latihan |
| --- | --- | --- | --- |
| A | 4–9; membaca/menulis, membedakan digit, nama tempat, dan nilai | Ubah bilangan dan pilih kolom nilai tempat; label dan pembacaan ikut berubah; 100.000 memakai enam kolom | 5 latihan: isian angka/nama, tabel, memasangkan dengan garis, bilangan terbuka sesuai posisi digit |
| B | 10–15; membandingkan dari kiri, mengurutkan, melengkapi deret | Ubah dua bilangan, kolom pembeda otomatis berpindah; susun kartu harga | 5 latihan: bilangan lebih kecil, tanda >/< /=, tabel urutan naik/turun, deret kosong |
| C | 15–17; komposisi/dekomposisi, beberapa pembayaran sah | Ubah jumlah unit dan tukar satu unit dengan sepuluh unit di bawahnya; susun pembayaran dari persediaan uang | 5 latihan: tabel unit, uraian nilai, komposisi, dua cara bayar berbeda, bagian uraian hilang |
| D | 17–25; empat operasi dan masalah uang | Tutorial susun panjang/pendek, simpan/pinjam melewati nol, hasil kali parsial dan pembagian bersusun langkah demi langkah | 5 latihan: tambah, kurang, kali, bagi, tabel benar/salah dan pasangan cerita pasar |

Evaluasi tepat 24 butir (6 per materi, diselingi A/B/C/D), 8 sedang, 9 menantang, 7 sangat menantang. Inti Uji Kompetensi halaman 27–28: menulis, membaca, komposisi uang, hasil empat operasi beserta nilai tempat, pembayaran dari persediaan, serta paket makan dua orang. Dikembangkan dengan format latihan sumber halaman 8–25: hubungan garis, tabel nilai tempat, tanda perbandingan, urutan/deret, dan benar/salah. Tidak menggantikan isian dengan pilihan ganda.

Semua konteks harga/data merupakan data latihan, bukan klaim harga atau statistik terkini. Hasil dan operand adaptasi dibatasi sampai 100.000 (sumber menjumlahkan lima harga menjadi 121.500; paket adaptasi disesuaikan agar sesuai judul). Nominal rupiah menggunakan ilustrasi uang bertuliskan nilai, bukan gambar uang resmi. Hanya denominasi yang disebut dipakai, persediaan dibatasi, semua pembayaran sah diterima; dua baris pembayaran harus berbeda. Nilai tempat 100.000 mencakup ratus ribuan. Pembagian yang ditentukan habis dibagi, tetapi nol hasil bagi tetap ditulis.

Catatan sumber yang tidak disalin sebagai kunci: tabel Lukas halaman 16 menampilkan 3 puluh ribuan walau narasinya menyebut 6; hitungan bersusun 5.000 × 12 halaman 23 membutuhkan hasil parsial puluhan 50.000, bukan 5.000 tanpa penjelasan geser. Implementasi menghitung ulang dari data soal dan menampilkan pergeseran nilai tempat yang benar.

Persiapan CI awal gagal sebelum browser berjalan: runner Ubuntu 26 tidak dapat me-resolve security.ubuntu.com saat memasang font sistem melalui apt. Workflow browser dipatok ke Ubuntu 24.04 dan mengunduh Chromium tanpa mengulang pemasangan dependensi OS. Semua verifikasi, build, browser dan screenshot tetap dijalankan; tidak ada tes yang dilewati. Revisi CI lama yang sudah digantikan dihentikan agar tidak menahan antrean. Status hasil versi baru masih harus diverifikasi sebelum rilis.

Jawaban opini paket makan memakai tulisan bebas dan bukan penilaian gaya bahasa: pilihan A maupun B diterima bila diisi bersama perhitungan yang tepat; alasan ditujukan untuk diskusi guru. Asumsi berbagi biaya sama rata dinyatakan eksplisit agar sisa uang tiap anak tidak ambigu. Validasi rilis: kunci independen, alternatif jawaban uang dan bilangan terbuka, cakupan/diversitas, lint/build, browser 320/390/768/1280 untuk semua latihan/evaluasi dan studio, gating, skor/review, kesesuaian gambar dan jalur beranda/katalog, tinjauan screenshot. Bukti nyata dicatat dalam PROJECT_HANDOFF.md setelah dijalankan.
