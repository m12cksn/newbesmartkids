# Mode menjelaskan: layar sentuh terkunci (fix/presenter-touch-lock)

## Ruang lingkup
- Permintaan pengguna: di tablet, halaman ikut bergeser saat laser dipakai. Selama alat laser, sorot, spidol, atau fokus aktif, sentuhan kini tidak menggulir, tidak memperbesar, dan tidak menekan isi halaman.
- Fokus di layar sentuh memakai ketukan singkat (ketuk bagian yang sama untuk melepas).
- Alat baru **Geser** (ikon tangan, tombol G) membuka kunci untuk menggulir dan memakai peraga tanpa menutup mode menjelaskan.
- Mouse dan keyboard tidak berubah: dengan mouse, peraga tetap bisa diklik saat laser aktif.

## Berkas
- `src/components/learn/PresenterMode.tsx`
- `scripts/smoke-presenter.mjs`

## Validasi
- Build dengan mock Supabase lulus; `scripts/smoke-presenter.mjs` lulus di 320px, 1280px, dan tablet 768px (geseran jari tidak menggulir untuk laser/sorot/spidol/fokus, fokus dengan ketukan, Geser menggulir).
