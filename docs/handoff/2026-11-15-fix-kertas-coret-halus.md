# fix/kertas-coret-halus (kertas coret lebih halus, teks tidak ikut terseleksi)

## Lingkup
- `src/components/learn/ScratchPad.tsx`:
  - Garis lebih halus: titik dihaluskan saat menulis (`SMOOTH`), semua titik stylus/layar dipakai lewat `getCoalescedEvents`, dan ujung garis tepat di titik angkat.
  - Lebih ringan: coretan yang sudah jadi digambar sekali ke kanvas cadangan, saat menulis hanya coretan berjalan yang digambar ulang (dibatasi satu kali per frame). Sebelumnya semua coretan digambar ulang di setiap gerakan.
  - Teks tidak ikut terseleksi (kasus tulisan "Penghapus" terseleksi di iPad): `user-select: none` dan `-webkit-touch-callout: none` pada seluruh kertas, menu konteks dimatikan, `preventDefault` dan pembersihan seleksi saat mulai menulis.
  - Coretan hilang sesekali: sekarang hanya satu penunjuk (pena atau jari) yang menulis; sentuhan lain (telapak, jari lain) diabaikan sehingga tidak mengakhiri coretan Pencil di tengah jalan. Stylus boleh mengambil alih dari sentuhan jari.
  - Bagian baru coretan digambar langsung per gerakan (bukan menggambar ulang seluruh kertas), dan penyimpanan ke localStorage ditunda 500 ms (langsung disimpan saat halaman ditutup/berpindah) agar tidak menahan penulisan.
  - Penolakan telapak tangan: sentuhan jari diabaikan 5 detik setelah Pencil terakhir terdeteksi (termasuk saat melayang), sebelumnya 1,5 detik.
- Format penyimpanan localStorage tidak berubah, coretan lama tetap terbaca.
- Tidak menambah library: pemasangan paket tidak tersedia di sesi ini dan lockfile tidak boleh tidak sinkron. `perfect-freehand` bisa dipertimbangkan nanti bila ingin garis dengan lebar bervariasi.

## Validasi
- Pemeriksaan sintaks TypeScript pada berkas ini.
- Belum dijalankan: eslint, build, `scripts/smoke-scratchpad.mjs` (ada asersi baru `user-select: none`). Diserahkan ke workflow `scratchpad-qa.yml`.
- Belum dicoba langsung di iPad dengan Apple Pencil; perlu dites di preview.
