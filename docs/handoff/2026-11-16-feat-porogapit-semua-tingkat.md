# Porogapit untuk semua tingkat (feat/porogapit-semua-tingkat)

## Ruang lingkup
- Pembagian di Berhitung Bersusun memakai porogapit di semua tingkat (sebelumnya hanya Sulit). Setiap langkah punya kotak: hasil bagi di atas, hasil kali, hasil kurang, dan angka yang diturunkan (kini diisi anak, bukan ditampilkan). Contoh 72 : 4 → 1, 4, 3, 2, 8, 32, 0.
- Kursor mengikuti urutan pengerjaan (`longLayout` di `src/lib/daily-column.ts`), petunjuk biru menyesuaikan kotak yang sedang diisi ("Berapa 7 : 4?", "Berapa 1 × 4?", "Berapa 7 − 4?", "Turunkan angka 2", "lebih kecil, tulis 0").
- Mudah dan Sedang: semua kotak langkah wajib diisi sebelum Periksa. Sulit: kotak langkah boleh dilewati. Yang dinilai tetap hasil dan sisa; kotak langkah diberi warna setelah diperiksa. "Bantu satu langkah" mengikuti urutan yang sama.
- Isi kotak langkah tersimpan di perangkat (`work` pada `SavedColumn`). Pilihan "Kotak sisa" kecil dihapus dari pembagian karena tidak diperlukan lagi.

## Berkas
- `src/lib/daily-column.ts`, `src/components/mastering/ColumnPractice.tsx`
- `scripts/verify-berhitung-bersusun.mjs`, `scripts/smoke-berhitung-bersusun.mjs`

## Validasi
- Verify: 6.300 soal; urutan 72 : 4 dan 1236 : 12 sesuai, kotak hasil = jawaban, angka turun benar, baris paling bawah = sisa, posisi kotak unik.
- Build lulus; smoke lulus di 320/390/768/1280 (Mudah: Periksa terkunci sampai semua langkah terisi, lalu diisi berurutan; Sulit lewat papan angka dengan sisa; soal cerita pembagian).

## Status
- Draft PR, menunggu persetujuan preview dari pengguna.
