# 2026-11-15 — feat/presenter-mode

## Ruang lingkup
Mode menjelaskan untuk admin di setiap halaman bab (`src/components/learn/PresenterMode.tsx`, dipasang di layout `kelas/[slug]/materi/[materiSlug]`).

- Hanya muncul jika sesi `role === "admin"` (tamu dan siswa tidak melihatnya; tanpa login aktif juga tidak muncul).
- Tombol kiri bawah (ikon saja di HP) agar tidak menutupi tombol Kertas coret di kanan bawah.
- Alat: Laser (titik merah dengan jejak memudar, klik tetap sampai ke peraga), Sorot (layar meredup kecuali lingkaran di sekitar kursor, ukuran dengan − / + atau tombol [ dan ]), Spidol (coretan oranye hilang sendiri setelah 3 detik, ikut halaman saat digulir), Fokus (klik satu bagian, bagian lain meredup; klik lagi atau Esc untuk melepas).
- Pintasan: L, S, P, F, Esc (tidak aktif saat mengetik di kotak isian). Tidak ada yang disimpan.

## Validasi
- `scripts/smoke-presenter.mjs` (build dengan server Supabase tiruan): tamu dan siswa tidak melihat tombol; admin bisa memakai keempat alat; spidol hilang setelah 3 detik; fokus mengikuti batas blok; Esc melepas fokus lalu menutup mode; tidak ada overflow di 320 dan 1280.
- CI: `.github/workflows/presenter-qa.yml`.
