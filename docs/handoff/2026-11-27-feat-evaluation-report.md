# Laporan hasil evaluasi

Ringkasan setelah evaluasi dan laporan dari Aktivitas terbaru memakai komponen yang sama. Grafik SVG dan pembahasan dapat dibuka sesuai kebutuhan. Soal salah bisa diulang langsung dari hasil selesai tanpa menyimpan nilai kedua.

Riwayat membuka laporan melalui ID hasil. Supabase memeriksa sesi dan pemilik hasil sebelum mengembalikan pembahasan. Laporan lama tetap menampilkan nilai dan persentase. Peta jawaban menggunakan nomor salah yang sudah disimpan. Riwayat menampilkan pembahasan tersimpan dalam bentuk teks. Soal asli bergambar dan pengulangan soal tersedia pada hasil setelah evaluasi selesai.

Migrasi `20261127010000_bsk_evaluation_report.sql` perlu diterapkan sebelum versi ini diterbitkan. Uji Login QA mencakup tautan riwayat, hasil lama, persentase, grafik, dan pemilihan nomor soal.
