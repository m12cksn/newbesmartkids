# Merekam layar aplikasi BeSmartKids (bila butuh bukti bergerak)

1. Build dan jalankan lokal tanpa Supabase agar semua halaman terbuka:
   `(unset SUPABASE_URL SUPABASE_PUBLISHABLE_KEY; npm run build)` lalu `npm run start -- --hostname 127.0.0.1 --port 3000 &`
2. Rekam dengan Playwright: viewport 390×844, deviceScaleFactor 2, isMobile, hasTouch. Ambil frame dengan CDP `Page.captureScreenshot` memakai `clip: { x: pageX, y: pageY, width: 390, height: 844, scale: 2 }` (pageX/pageY dari `Page.getLayoutMetrics().cssVisualViewport`), lalu susun dengan ffmpeg concat. Screencast CDP biasa hanya 1x.
3. Halaman berguna: `/mastering-berhitung-bersusun` (radio "Jenis soal": Tambah, Kurang, Kali, Bagi; tombol "Bantu satu langkah"; papan angka berlabel "Angka 0"–"Angka 9"; kotak berlabel "Soal 1, kotak pinjaman kolom ke-2 dari kanan" dan seterusnya), bab `/kelas/<kelas>/materi/<bab>`.
4. Sembunyikan tombol melayang "Kertas coret" sebelum merekam.
5. Soal latihan harian berganti setiap hari: periksa soalnya dulu sebelum menulis hook yang menyebut angka tertentu.
