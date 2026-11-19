# Kertas coret lebih mulus dan spidol permanen di mode menjelaskan — feat/kertas-coret-spidol

## Lingkup (permintaan Mr Iwan)
- Kertas coret tidak lagi patah-patah saat ditulis.
  - Coretan yang sedang ditulis digambar di lapisan kanvas sendiri (`scratch-live`), paling banyak sekali per frame (requestAnimationFrame, konteks `desynchronized`).
  - Semua titik antara dari browser dipakai (`getCoalescedEvents`), jarak minimum titik 0,8 px.
  - Kertas digambar ulang penuh hanya saat urungkan, hapus, ganti kertas, atau ukuran berubah; coretan baru langsung ditempel ke lapisan bawah.
- Mode menjelaskan (admin): alat Sorot dan Fokus dihapus. Tersisa Laser, Spidol, Geser.
  - Spidol tidak lagi hilang sendiri: coretan tetap ada sampai diurungkan (tombol atau Ctrl+Z) atau dihapus semua, tetap ada saat mode ditutup lalu dibuka lagi, dan hilang saat pindah halaman.
  - Pilihan warna merah, biru, hitam. Coretan menempel pada halaman sehingga ikut bergeser saat digulir.
  - Spidol dan laser memakai titik antara agar mulus; laser hanya berjalan saat dipilih.
  - Mode selalu dibuka lagi dengan Laser agar kanvas spidol tidak menutupi tombol halaman.
- `PresenterMode` kini memakai `usePathname`, jadi ikut dibungkus `Suspense` di layout halaman bab.

## Path
- `src/components/learn/ScratchPad.tsx`, `src/components/learn/PresenterMode.tsx`, `src/app/kelas/[slug]/materi/[materiSlug]/layout.tsx`
- `scripts/smoke-scratchpad.mjs`, `scripts/smoke-presenter.mjs`

## Validasi (lokal)
- eslint, `npm run build` (dengan dan tanpa login tiruan).
- `smoke-scratchpad.mjs` lulus di 320/390/768/1280, ditambah cek lapisan tulis kosong setelah coretan selesai.
- `smoke-presenter.mjs` (dengan `mock-supabase-auth`) lulus di 320, 1280, dan tablet 768: hanya admin; Sorot/Fokus tidak ada; spidol tetap ada setelah 3 detik; warna biru; urungkan; coretan ikut gulir 100 px; tetap ada setelah ditutup-dibuka; hapus semua; layar terkunci untuk Laser/Spidol; Geser menggulir.
- Belum diuji: rasa mulus di tablet/stylus sungguhan (uji otomatis tidak bisa mengukur latensi tangan). Mohon Mr Iwan mencoba di perangkat yang biasa dipakai.
