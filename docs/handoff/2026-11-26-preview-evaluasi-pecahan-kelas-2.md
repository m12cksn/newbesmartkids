# Pratinjau evaluasi Kelas 2 Bab 5

Pecahan. Dari halaman Kelas 2, buka Pecahan, lalu pilih **Evaluasi 24 soal**.

- `src/components/learn/GradeTwoFractions.tsx` memperbesar diagram, bidang ketuk, dan ilustrasi dalam evaluasi.
- `src/components/learn/FractionVisuals.tsx` memberi ruang untuk kumpulan benda dan menambahkan pencahayaan pada ilustrasi yang berasal dari `src/components/illustrations/ObjectArt.tsx`.
- Dataset `src/data/grade-two-fractions.ts` dan logika penilaian dipertahankan. Jenis benda, jumlah, hubungan antar kelompok, dan garis pembagi mengikuti definisi awal.

Validasi dataset 12 latihan dan 24 evaluasi serta build produksi lulus. Playwright Chromium lulus di lebar 320, 390, 768, dan 1280 piksel, mencakup peraga, latihan, seluruh soal evaluasi, pemberian skor, dan pembahasan jawaban salah. Tampilan apel diperiksa di 390 dan 1280 piksel, serta tampilan kumpulan 16 kue di 390 piksel. Pratinjau masih lokal.
