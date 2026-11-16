# Kelas 12 Bab 4 Kekongruenan dan Kesebangunan (feat/grade-twelve-congruence)

## Ruang lingkup
- Sumber: Buku Siswa Matematika Kelas XII, Bab 4 Kekongruenan dan Kesebangunan (Pengayaan), hlm. 153-232, PDF dari pengguna. Pengguna menulis "bab 3 Statistika"; judul dan subtopik di PDF adalah Bab 4 Kekongruenan dan Kesebangunan, jadi bab dinamai sesuai PDF.
- Bab baru `kelas-12-kongruen-sebangun` (slug `kekongruenan-kesebangunan-kelas-12`, classId 12, chapter 4) lewat registri `src/chapters/`.
- 9 bagian sesuai Kegiatan 4.1.1-4.1.5 dan 4.2.1-4.2.4, masing-masing dengan peraga: memasangkan titik sudut, menumpuk bangun calon, kriteria segitiga (S-Sd-S, Sd-S-Sd, S-S-S, dan S-S-Sd yang bisa menghasilkan dua segitiga), menyusun bukti deduktif berurutan, transformasi di bidang Kartesius, foto yang diperbesar, tinggi pohon dari bayangan, dilatasi, serta garis tinggi/berat/bagi pada segitiga sebangun.
- 36 latihan (4 per bagian) dan 24 soal evaluasi (8 Sedang, 9 Menantang, 7 Sangat menantang; A/B berselang-seling). Jenis jawaban: memasangkan dengan garis, klasifikasi (kriteria, alasan bukti, kongruen/sebangun), isian tabel, rasio, pilihan, benar/salah.

## Berkas
- `src/data/grade-twelve-congruence.ts`
- `src/components/learn/GradeTwelveCongruence.tsx`, `GradeTwelveCongruenceArt.tsx`
- `src/chapters/kelas-12-kongruen-sebangun/{meta.ts,Chapter.tsx}`
- `scripts/verify-grade-twelve-congruence.mjs`, `scripts/smoke-grade-twelve-congruence.mjs`
- `.github/workflows/grade-twelve-congruence-qa.yml`

## Validasi
- Verify: 60 soal, 113 hitungan dicek ulang (aturan kosinus, transformasi koordinat, faktor skala, segitiga siku-siku dengan garis tinggi, luas daerah tiga persegi dengan integrasi numerik) dan skala setiap gambar dibandingkan dengan label sisi/sudutnya.
- Build produksi lulus; smoke browser lulus di 320/390/768/1280.

## Status
- PR dibuka dan di-merge otomatis setelah CI hijau (izin tetap pengguna).
