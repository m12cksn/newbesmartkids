---
name: bsk-iklan-motion
description: Membuat iklan motion graphic BeSmartKids (video tanpa manusia) dan iklan gambar dari referensi yang diunggah Mr Iwan plus pesan singkat. Gunakan saat pengguna mengirim video/gambar referensi iklan, meminta "buat seperti ini", "motion", "iklan video", "kreatif baru", atau memberi pesan sederhana seperti "pecahan, 12 detik, untuk ibu SD". Hasil akhir: MP4 1080x1920 (dan/atau PNG 1080x1350) siap unggah ke Meta, plus teks iklan.
---

# Iklan motion BeSmartKids

Pengguna cukup mengunggah referensi (video atau gambar) dan menulis pesan pendek. Kamu yang menafsirkan, memutuskan detail kreatif, merender, memeriksa, lalu menyerahkan file. Bahasa ke pengguna: Indonesia, sapa "Bapak".

Peran pengguna hanya **menyetujui**. Jangan bolak-balik bertanya hal yang bisa diputuskan sendiri. Tanyakan hanya bila pesan benar-benar ambigu soal produk atau penawaran (harga, paket, klaim).

## 0. Tafsirkan pesan singkat

Pesan seperti "pecahan, 12 detik, kayak referensi ini" diurai menjadi brief:

| Isian | Cara menentukan bila tidak disebut |
|---|---|
| Sudut cerita | Cocokkan dengan `references/sudut-dan-fakta.md` (A1–A8). Kalau tidak ada yang cocok, buat sudut baru dari masalah orang tua yang nyata |
| Materi aplikasi yang ditampilkan | Bab yang paling dekat dengan sudut itu (daftar bab di `src/data/materials.ts` dan `src/chapters/*/meta.ts`) |
| Durasi | 10–15 detik (Meta: di bawah 15 detik lebih banyak ditonton habis) |
| Format | Video 9:16 1080×1920. Gambar 4:5 1080×1350 |
| Jumlah varian | 2 hook berbeda per video; untuk referensi baru, sekalian 1 varian gaya |
| Musik | Tanpa musik (audio senyap). Sarankan musik dari pustaka Meta. Pakai `--musik` hanya bila pengguna memberi file berlisensi |

Tulis brief singkat ke pengguna (3–5 baris) **bersamaan** dengan hasil, bukan sebelum mulai, kecuali ada keputusan penawaran yang belum jelas.

## 1. Bedah referensi

Video: `bash scripts/ref.sh <file> <folder>` lalu lihat `kontak.jpg`, `hook-3detik.jpg`, dan beberapa `adegan-*.jpg`. Gambar: lihat langsung.

Tulis **kartu gaya** (simpan di folder kerja):
- Hook 3 detik: apa yang membuat berhenti (angka besar, pertanyaan, kontras, gerak cepat, objek tak terduga)
- Ritme: potongan per detik (dari `ref.sh`), lama tiap adegan
- Tata letak: teks di mana, ukuran relatif, kepadatan teks
- Warna dominan dan latar (polos, tekstur, foto, gradasi)
- Tipografi: tebal/tipis, huruf besar, sorotan
- Gerak: pop, geser, ketik, zoom kamera, gambar garis, transisi
- Penutup dan ajakan

Ambil **prinsipnya**, jangan menyalin aset, logo, karakter, kalimat, atau tata letak persis milik merek lain. Warna dan font selalu kembali ke brand BeSmartKids.

## 2. Susun storyboard

4–6 adegan, satu gagasan per adegan:
1. Hook di detik 0 (bukan logo). Teks maksimal 7 kata.
2. Masalah yang dirasakan orang tua.
3. Bukti visual: animasi konsep matematika (pecahan, kotak bersusun, porogapit, petak luas, garis bilangan) dan/atau tangkapan layar asli aplikasi.
4. Solusi singkat.
5. Penutup 1,5–2 detik: logo, penawaran, ajakan.

Semua klaim harus ada di `references/sudut-dan-fakta.md`. **Dilarang** mengarang angka pengguna, testimoni, peringkat, atau statistik. Matematika di layar wajib benar; hitung ulang dengan skrip bila ada angka.

## 3. Pastikan beda visual (anti-jenuh)

Sebelum membuat, baca `references/riwayat-kreatif.md`. Iklan baru harus berbeda dari **semua** iklan yang masih aktif pada minimal **3 dari 6** sumbu:

1. Latar (warna/tekstur/foto)
2. Tata letak utama (teks penuh, objek tengah, layar terbagi, HP, kartu)
3. Jenis visual utama (tipografi, diagram animasi, layar aplikasi, ikon objek)
4. Warna dominan
5. Gaya gerak (pop cepat, geser halus, gambar garis, zoom kamera)
6. Struktur cerita (pertanyaan → jawaban, sebelum → sesudah, daftar, perbandingan, demo)

Hanya mengganti teks hook **tidak dihitung** sebagai iklan berbeda. Setelah selesai, tambahkan baris ke `references/riwayat-kreatif.md`.

## 4. Bangun dan render

- Salin `contoh/pecahan-kertas-kotak.html` sebagai titik awal. Pakai `kit/kit.css`:
  - kelas `.m` dengan `data-in` (`up`, `down`, `left`, `right`, `pop`, `fade`, `wipe`, `zoom`), `data-out="fade"`, `--d` (detik muncul), `--o` (detik hilang)
  - `.gores` untuk menggambar garis SVG, `.isi` untuk mewarnai bagian SVG, `.kamera` untuk zoom pelan, `.berdenyut`
- Animasi **hanya** lewat CSS animation/Web Animations, atau fungsi `window.seek(detik)` untuk hal berbasis JS (penghitung angka). Jangan pakai `setTimeout`/`requestAnimationFrame` untuk animasi, karena renderer men-seek waktu.
- `<body data-detik="12">` menentukan durasi.
- Aset aplikasi: tangkapan layar asli dari `public/landing/mockup-*.webp`, atau rekam baru (lihat `references/rekam-aplikasi.md`). Logo: `https://cdn.scalev.id/uploads/1770351441/0bmLuAafT-8qSTnfBVxh5A/1770351441636-logo_horizontal_transparent.webp`.
- Ikon antarmuka: lucide (SVG inline), jangan emoji. Objek yang disebut harus digambar sesuai bendanya.
- Zona aman Reels: teks penting tidak di 250 px bawah dan 120 px kanan (tambahkan `class="debug-aman"` ke body saat cek).

Perintah (jalankan dari folder skill):
```
NODE_PATH=$(npm root -g) node scripts/render.cjs <iklan.html> <keluar.mp4> --draft
NODE_PATH=$(npm root -g) node scripts/render.cjs <iklan.html> <keluar.mp4>
```
`--draft` membuat 12 frame contoh. Gabungkan jadi lembar kontak (`ffmpeg ... tile=6x2`) dan **lihat** sebelum render penuh. Untuk gambar statis: render HTML 1080×1350 dengan Playwright `page.screenshot`.

## 5. Periksa sebelum menyerahkan

- Ambil frame di detik 0,5, tengah tiap adegan, dan akhir. Lihat sendiri: teks terbaca, tidak terpotong, tidak tumpang tindih, matematika benar, tidak ada frame kosong.
- `ffprobe`: 1080×1920, 30 fps, H.264, durasi sesuai.
- Bandingkan dengan kartu gaya referensi: ritme dan rasa visualnya mirip, tetapi asetnya orisinal.

## 6. Serahkan

- Nama file: `BSK_motion_<sudut>-<konsep>_hook<n>.mp4`
- Kirim dengan `SendUserFile` (video `render`), plus berkas teks iklan: teks utama, judul, deskripsi, nama iklan, dan link UTM `https://be-smart-kids.myscalev.com/paket-belajar-besmartkids?utm_source=meta&utm_medium=paid&utm_campaign=<batch>&utm_content=<nama-iklan>`
- Laporkan singkat: konsep, beda visual dari iklan sebelumnya (sumbu mana), apa yang perlu disetujui.
- Simpan sumber HTML di `.claude/skills/bsk-iklan-motion/contoh/` hanya bila menjadi pola baru yang layak dipakai ulang.
