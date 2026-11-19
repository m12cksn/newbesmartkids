# Penghapus untuk spidol mode menjelaskan — feat/spidol-penghapus

## Lingkup (permintaan Mr Iwan)
- Mode menjelaskan mendapat alat **Penghapus** (tombol E), seperti penghapus kertas coret: menggeser di atas coretan spidol menghapus coretan yang tersentuh (radius 14 px), memakai semua titik antara agar gerakan cepat tetap kena.
- Selama Penghapus aktif, layar sentuh dikunci seperti Laser/Spidol, dan Ctrl+Z tetap milik spidol (bukan kertas coret).
- Path: `src/components/learn/PresenterMode.tsx`, `scripts/smoke-presenter.mjs`.

## Validasi (lokal, dengan mock-supabase-auth)
- eslint, `npm run build`.
- `smoke-presenter.mjs` lulus di 320, 1280, dan tablet 768: penghapus menghapus coretan biru yang tersentuh sementara coretan merah tetap; penghapus dengan sentuhan; layar terkunci untuk Laser/Spidol/Penghapus.
- Belum diuji: rasa penghapus dengan stylus sungguhan.
