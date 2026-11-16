# Gambar mockup untuk landing Scalev (2026-11-16)

- Scope: empat screenshot tampilan HP (berhitung bersusun, KPK dan FPB, luas dan volume, pecahan Kelas 4) di `public/landing/mockup-*.webp`.
- Dipakai oleh halaman HTML Scalev "Paket Belajar BeSmartKids (HTML)" (slug `paket-belajar-besmartkids`) bagian "Seperti ini isinya".
- Diambil dari build lokal master 352d393 pada lebar 360 px (skala 1,5), WebP kualitas 70.
- Tidak ada perubahan kode atau halaman. Hapus file ini hanya jika halaman Scalev tidak lagi memakainya.

## Lanjutan: CSS dan JS halaman Scalev

- `public/landing/paket-belajar.css` dan `public/landing/paket-belajar.js` berisi seluruh tampilan dan logika halaman Scalev (demo pecahan Kelas 4, daftar bab termasuk Kelas 11, mockup, 2 paket, form pemesanan `Scalev.checkout.createOrder`).
- `public/landing/paket-belajar-scalev-shell.html` adalah salinan kerangka `html_document` yang disimpan di Scalev. Ubah tampilan lewat file CSS/JS ini lalu naikkan `?v=` di kerangka Scalev agar cache baru dipakai.
- Produk Scalev: "Paket Belajar BeSmartKids" (id 495932), varian SD/SMP/SMA Rp69.000 dan Keluarga Rp129.000. Form memesan lewat bundle "BSK Paket SD/SMP/SMA/Keluarga" (opsi harga 47041 sampai 47044) yang ditempel ke toko 60056, karena produk tidak bisa ditempel ke toko lewat API.
