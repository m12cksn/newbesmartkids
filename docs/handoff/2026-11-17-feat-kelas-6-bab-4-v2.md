# Kelas 6 Bab 4 Peluang (timpa versi lama)

Cabang: `feat/kelas-6-bab-4-v2`. Sumber: PDF Matematika SD/MI Kelas VI (Kemendikbudristek 2022) hal. 101–130, dikirim Mr Iwan.

## Ruang lingkup
- A. Skala Peluang: A.1 menyusun skala peluang (peraga tas bola dengan skala), A.2 membaca skala peluang (peraga dadu yang sisinya bisa diganti).
- B. Membandingkan Peluang Kejadian: B.1 dalam permainan (peraga koin dan dadu, adil atau kurang adil, lempar 12 kali), B.2 sehari-hari (peraga dua kotak hadiah, perkalian silang).
- Patokan skala dinyatakan di materi: 0 = tidak mungkin, kurang dari setengah = kurang mungkin, tepat setengah = mungkin, lebih dari setengah = sangat mungkin, semua = pasti. Patokan ini membuat setiap kunci dapat dipertanggungjawabkan.
- Latihan 4 soal per bagian (8 per subtopik). Evaluasi 24 soal, tingkat 8/9/7, subtopik bergantian, 12 soal dengan aksi langsung: letakkan pada skala, isi sisi dadu, atur isi tas atau lemari, warnai roda putar, pilih gambar.
- Bentuk soal mengikuti buku: skala dari tas, dadu, roda, rak buku, dan data bencana; menebak isi dari skala (beberapa jawaban benar diterima lewat aturan); koin; roda putar ketua kelas; tiga pemain dadu; pilih dadu (termasuk dadu piramida); kotak hadiah; kotak alat tulis; permen; teka-teki lemari Ayah.

## Berkas
- `src/data/grade-six-probability-v2.ts`, `src/components/learn/GradeSixProbabilityV2.tsx`, `src/chapters/kelas-6-peluang/{meta.ts,Chapter.tsx}`.
- `scripts/verify-grade-six-probability-v2.mjs`, `scripts/smoke-grade-six-probability-v2.mjs`, `.github/workflows/grade-six-probability-v2-qa.yml`.
- Dihapus: `GradeSixProbability.tsx`, `grade-six-probability.ts`, skrip verify/smoke lama, workflow `grade-six-probability-qa.yml`, entri `materials.ts`, dan cabang `if` di halaman materi.

## Validasi
- Verify: susunan soal, kategori skala dihitung ulang dari gambar, tepat satu tas cocok dengan skala, aturan dadu/tas sesuai skala dan tidak terlalu longgar, perbandingan pecahan untuk kotak dan dadu, roda nama, pemain dadu, sebaran posisi jawaban.
- Smoke lokal 320×640, 390×844, 768×1024, 1280×800 lulus dengan font lebar: jalur klik dari halaman kelas, 4 peraga, 16 latihan, 24 evaluasi, muat layar sebelum diperiksa, skor dan pembahasan.

## Sisa
- Video belum ada (panel placeholder).
