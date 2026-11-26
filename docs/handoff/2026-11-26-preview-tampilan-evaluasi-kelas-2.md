# Pratinjau tampilan evaluasi Kelas 2 Bab 2 dan Bab 3

Pratinjau lokal untuk Penjumlahan dan Pengurangan serta Bentuk di Sekitar Kita. Evaluasi yang menggunakan `GradeFourQuiz.tsx` mendapat kartu dan teks soal yang lebih besar. `QuizFitLayout.tsx` memberi panel visual evaluasi satu baris penuh dan menghapus pengecilan pada layar pendek.

Dalam PR #206, kartu dan teks evaluasi yang lebih besar dibatasi ke Kelas 2 sesudah pengujian lintas kelas mendapati kartu di beberapa bab lain melebihi tinggi layar 320 × 640. Susunan panel besar `QuizFitLayout.tsx` dipakai pada materi Kelas 2 yang memilih tampilan tersebut.

- `GradeTwoAddSub.tsx` dan `GradeTwoAddSubArt.tsx` memperbesar gambar yang dihitung, menjaga pengelompokan, dan memberi pencahayaan pada jambu, pesawat, mobil, ikan, pisang goreng, dan kue.
- `GradeTwoShapes.tsx` dan `ShapeVisuals.tsx` memperbesar gambar soal, pilihan bergambar, serta gambar pada aktivitas mengelompokkan dan memasangkan. Gradasi dan bayangan memberi kesan volume pada bangun ruang dan sejumlah benda, termasuk kaleng dan kelereng. Bangun datar memakai proyeksi datar agar sisi dan sudut mudah dibaca.
- Dataset, kunci jawaban, dan alur penilaian menggunakan logika yang sudah ada.

Kedua skrip validasi dataset dan build produksi lulus. Playwright Chromium lulus di lebar 320, 390, 768, dan 1280 piksel untuk kedua bab, mencakup peraga, latihan, seluruh 24 soal per bab, skor, dan pembahasan. Contoh tampilan diperiksa pada tangkapan layar 390 dan 1280 piksel. Soal pertama evaluasi Ciri-Ciri Bangun Datar Kelas 5 juga lulus pemeriksaan ukuran teks dan panel visual pada empat lebar yang sama dengan tinggi 640 piksel.

Ilustrasi khusus di luar dua bab pratinjau masih perlu ditinjau per bab. Pratinjau lokal belum diterbitkan.
