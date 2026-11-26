# Pratinjau lingkaran hasil evaluasi

Layar hasil evaluasi di `src/components/learn/GradeFourQuiz.tsx` menampilkan satu lingkaran bernomor per soal. Hijau berarti benar dan merah berarti salah. Kedua jenis lingkaran membuka soal asli dengan gambar dan pilihan yang tersedia, jawaban siswa, jawaban benar, dan penjelasan. Soal interaktif ditampilkan dalam keadaan jawaban benar dan hanya bisa dilihat. Kontrol pembahasan yang sudah ada masih dapat membuka seluruh jawaban yang salah.

Perubahan menggunakan penilaian yang sama dengan skor dan riwayat akun. Kunci jawaban dan dataset dipertahankan. Pratinjau masih lokal.

Tombol **Sebelumnya** tersedia saat latihan. Evaluasi hanya maju setelah jawaban dikirim agar siswa tidak dapat mengulang soal yang sudah diperiksa dalam sesi tersebut.

Build produksi lulus. Pengujian Playwright Bab 5 lulus pada lebar 320, 390, 768, dan 1280 piksel, termasuk 24 lingkaran hasil, dua jawaban yang sengaja dibuat salah, pembahasan sesuai nomor yang dipilih, aktivasi dengan Enter, dan pembahasan semua jawaban salah melalui panel.

Setelah navigasi evaluasi diubah, build produksi dan pengujian Playwright Bab 5 di 390 piksel lulus. Pengujian memastikan tombol **Sebelumnya** tersedia saat latihan dan hilang pada seluruh 24 soal evaluasi, dengan skor dan pembahasan tetap berfungsi.

Setelah gambar soal asli ditambahkan pada pembahasan, build produksi dan Playwright Bab 5 lulus di 320, 390, 768, dan 1280 piksel. Pemilihan lingkaran hijau membuka diagram lingkaran dengan empat bagian. Pemilihan lingkaran merah membuka gambar delapan apel atau diagram persegi dua bagian sesuai soal yang dipilih.
