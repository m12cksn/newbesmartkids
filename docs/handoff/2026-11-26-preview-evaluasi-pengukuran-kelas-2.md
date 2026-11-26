# Pratinjau evaluasi Kelas 2 Bab 6

Pengukuran. Dari halaman Kelas 2, buka Pengukuran, lalu pilih **Evaluasi 24 soal**.

- `src/components/learn/GradeTwoMeasurement.tsx` memperbesar timbangan, jam, gambar benda, dan pilihan bergambar.
- `src/components/learn/MeasureVisuals.tsx` memberi gradasi pada benda, piring timbangan, dan bingkai jam. Arah kemiringan balok timbangan disesuaikan dengan tanda perbandingan berat sehingga sisi yang lebih berat turun di layar.
- Dataset `src/data/grade-two-measurement.ts`, kunci jawaban, jumlah benda, dan posisi jarum jam dipertahankan.

Validasi dataset 8 latihan dan 24 evaluasi serta build produksi lulus. Playwright Chromium lulus di lebar 320, 390, 768, dan 1280 piksel, mencakup peraga, latihan, semua soal, skor, dan pembahasan. Uji browser juga membandingkan kemiringan SVG dengan sisi yang dinyatakan turun. Contoh jam di 390 piksel dan timbangan di 1280 piksel diperiksa. Pratinjau masih lokal.
