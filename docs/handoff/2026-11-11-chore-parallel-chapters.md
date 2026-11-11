# Struktur kerja paralel (chore/parallel-chapters)

Masalah: setiap bab baru mengedit tiga file bersama (`src/data/materials.ts`, rute `src/app/kelas/[slug]/materi/[materiSlug]/page.tsx`, dan `docs/PROJECT_HANDOFF.md`). Saat dua sesi bekerja bersamaan (misalnya Kelas 2 Bab 6 oleh Claude dan Kelas 5 Bab 1 oleh ChatGPT), PR saling bentrok dan harus digabung ulang.

Perubahan:
- Registri bab otomatis: folder `src/chapters/<id>/` berisi `meta.ts` dan `Chapter.tsx`. `scripts/gen-chapter-registry.mjs` membuat `src/chapters/registry/*.generated.ts` (diabaikan git) sebelum dev/build dan setelah install.
- `src/data/materials.ts` menambahkan bab registri di depan daftar (urut `addedAt` terbaru) dan menolak id atau slug ganda saat build.
- Rute halaman materi merender bab registri secara umum dengan tautan kembali ke kelas.
- Catatan serah terima per PR di `docs/handoff/`.
- Aturan kerja paralel di `AGENTS.md`.
- Bab lama tidak dipindahkan (tetap di daftar dan cabang `if` yang ada) agar PR ini tidak bentrok dengan pekerjaan yang sedang berjalan.

Validasi: tsc, ESLint, build; bab percobaan sementara `kelas-9-uji-registri` muncul di rute, halaman kelas, dan beranda lalu dihapus; smoke beranda dan Kelas 2 Bab 5 lulus. Website tidak berubah tampilannya.
