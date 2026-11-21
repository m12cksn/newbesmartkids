# Rencana pemasaran 30 hari BeSmartKids (mulai 2026-11-22)

Dasar rencana:
- Anggaran iklan Rp15 juta per bulan.
- Konten dibuat Mr Iwan bersama Claude.
- Bab 1 setiap kelas gratis, tanpa evaluasi.
- Harga Rp79.000 per jenjang (SD, SMP atau SMA) untuk akses 1 tahun. Paket Keluarga Rp129.000 untuk semua jenjang dan 2 akun.

Rencana ini tidak memuat angka hasil yang dikarang: biaya per pembelian dan jumlah penjualan baru diketahui setelah iklan berjalan.

## 0. Hasil cek pixel (2026-11-21)

| Tempat | Temuan | Tindakan |
|---|---|---|
| Scalev, halaman "Paket Belajar BeSmartKids (HTML)" | Pixel `916155404185090` terpasang dengan Conversions API aktif. Event yang terpasang: PageView, ViewContent (saat halaman dibuka) dan InitiateCheckout (saat formulir dikirim). | Baik. |
| Scalev, pengaturan pixel | Kolom **Test Event Code masih terisi**. Selama terisi, event server bisa masuk ke tab "Test Events" saja dan tidak dihitung untuk optimasi iklan. | Kosongkan setelah pengujian selesai (Scalev, Analytics, Facebook Pixel). Claude tidak mengubahnya tanpa izin. |
| Scalev, event Purchase | Di pemicu halaman tidak ada event Purchase. Purchase biasanya dikirim Scalev saat pembayaran lunas, tetapi belum bisa dipastikan dari sini. | Lakukan 1 pembelian uji, lalu cek di Meta Events Manager apakah Purchase masuk beserta nilainya. |
| Website besmartkids.id | **Belum ada Meta Pixel.** Pengunjung Bab 1 gratis belum bisa dijangkau ulang lewat iklan. | Pasang pixel hanya di halaman untuk orang tua (beranda, daftar kelas, halaman paket), tidak di halaman belajar anak. Ini untuk menjaga privasi anak. Kebijakan Privasi juga perlu diperbarui. Kerjakan di PR terpisah setelah disetujui. |

## 1. Pembagian anggaran Rp15 juta per bulan (sekitar Rp500 ribu per hari)

| Kampanye | Tujuan | Minggu 1–2 | Minggu 3–4 |
|---|---|---|---|
| A. Penjualan, audiens luas (Advantage+) | Optimasi InitiateCheckout dulu, lalu Purchase setelah datanya cukup | Rp350 rb/hari dibagi ke 5 iklan uji | Rp350–400 rb/hari ke 2–3 iklan pemenang |
| B. Jangkau ulang | Penonton video ≥50%, pengunjung Scalev yang belum membeli, pengunjung web (setelah pixel web terpasang) | Rp50 rb/hari (audiens masih kecil) | Rp100 rb/hari |
| C. Dorong konten organik | ThruPlay untuk video organik yang paling banyak disimpan atau dibagikan | Rp100 rb/hari | Rp0–50 rb/hari |

Patokan untung rugi:
- Satu penjualan bernilai Rp79.000. Supaya iklan tidak rugi pada pembelian pertama, **biaya per pembelian harus di bawah Rp79.000** (dikurangi biaya Scalev dan pembayaran). Paket Keluarga memberi ruang lebih besar.
- Iklan yang setelah 3–4 hari biaya per InitiateCheckout-nya jauh di atas rata-rata dimatikan, dan anggarannya dipindah ke iklan pemenang.
- Anggaran iklan pemenang dinaikkan paling banyak 20–30% setiap 2–3 hari agar Meta tidak mengulang fase belajar.
- Setiap tautan memakai UTM: `utm_source=meta&utm_campaign=<A|B|C>&utm_content=<kode iklan>`.

## 2. Sepuluh naskah video (9:16, 15–40 detik)

Setiap video dipakai di TikTok, Reels dan Shorts. Rekaman layar diambil dari besmartkids.id, dan video motion dibuat dengan skill `bsk-iklan-motion`.

| # | Judul kerja | Hook (0–3 detik) | Isi | Penutup / CTA | Durasi |
|---|---|---|---|---|---|
| V1 | Pinjam di pengurangan | "71 − 46. Kenapa angka 7 dicoret jadi 6?" | Rekaman berhitung bersusun Kurang: isi kotak pinjaman 11 dan 6, angka lama tercoret otomatis, hasil 25. | "Latihan bersusun gratis tiap hari di BeSmartKids." | 20 dtk |
| V2 | Porogapit tanpa panik | "72 : 4. Anak sering bingung langkah keduanya." | Porogapit langkah demi langkah dengan petunjuk biru: 7:4=1, 1×4=4, 7−4=3, turunkan 2, dan seterusnya. | "Setiap kotak ada petunjuknya. Coba sekarang." | 30 dtk |
| V3 | Pecahan pakai peraga | "Mana lebih besar: 2/3 atau 3/4? Jangan hitung dulu." | Peraga pecahan digeser, dua batang dibandingkan. | "Bab 1 setiap kelas gratis dicoba." | 20 dtk |
| V4 | Soal cerita 3 langkah | "Anak bisa berhitung, tapi soal cerita salah terus?" | Tab Diketahui, Ditanya, Solusi diisi berurutan; langkah yang salah langsung ditandai. | "Biar anak tahu salahnya di mana." | 30 dtk |
| V5 | Orang tua tidak perlu jadi guru | "Saya bukan guru matematika. Terus gimana ngajarinnya?" (suara orang tua) | Anak membuka materi, peraga, latihan dan pembahasan sendiri. | "Anak belajar dari langkahnya, Ibu cukup mendampingi." | 25 dtk |
| V6 | Latihan harian 7 soal | "Cukup 7 soal sehari." | Latihan harian: pilih level, 7 soal, skor dan bintang. Soal baru tiap pukul 00.00 WIB. | "Kebiasaan kecil, hasil kelihatan." | 15 dtk |
| V7 | HP untuk belajar | "HP anak dipakai buat apa hari ini?" | Pergantian dari layar video lucu ke layar peraga BeSmartKids. | "Akses 1 tahun Rp79.000." | 15 dtk |
| V8 | Coba jawab dulu | "Jawab dalam 5 detik: 6 × 7 − 12 : 4" | Hitung mundur, lalu jawaban dibahas langkah demi langkah dengan aturan operasi. | "Banyak soal seperti ini di BeSmartKids." | 20 dtk |
| V9 | Paket keluarga | "Anak dua, beda jenjang?" | Kelas 1–12 dalam satu paket, dengan 2 akun. | "Paket Keluarga Rp129.000 untuk 1 tahun." | 15 dtk |
| V10 | Pendiri bercerita | "Kenapa saya bikin BeSmartKids." (Mr Iwan bicara ke kamera) | Alasan membuat, cara soal disusun dari buku paket, peraga yang bisa dimainkan. | "Coba Bab 1 gratis, linknya di bio." | 40 dtk |

Aturan produksi:
- Teks besar di 3 detik pertama dan teks terjemahan di seluruh video.
- Tanpa musik yang melanggar hak cipta: pakai audio bebas lisensi dari TikTok/IG atau suara asli.
- Kalau wajah anak tampil, harus ada izin tertulis dari orang tua.
- Tidak ada testimoni, angka pengguna atau klaim nilai naik yang dikarang.

## 3. Lima iklan untuk uji minggu pertama (Kampanye A)

| Kode | Visual | Teks utama | Judul | Tombol |
|---|---|---|---|---|
| A1 | Video V1 (pinjam) | Anak masih bingung pinjam di pengurangan bersusun? Di BeSmartKids, kotak pinjaman menuntun setiap langkah. Angka lama tercoret otomatis, jadi anak melihat kenapa 7 jadi 6. | Berhitung bersusun dengan petunjuk | Pelajari Selengkapnya |
| A2 | Video V2 (porogapit) | Porogapit dikerjakan kotak demi kotak, dan setiap langkah ada petunjuknya. Cocok untuk latihan di rumah tanpa harus jadi guru. | Porogapit langkah demi langkah | Pelajari Selengkapnya |
| A3 | Video V4 (soal cerita) | Soal cerita dipecah jadi Diketahui, Ditanya dan Solusi. Setelah diperiksa, langkah yang salah langsung ditandai. | Soal cerita jadi lebih jelas | Daftar |
| A4 | Video V5 (orang tua) | Matematika SD sampai SMA dengan peraga interaktif, latihan dan pembahasan. Bab 1 setiap kelas bisa dicoba gratis. | Coba Bab 1 gratis | Pelajari Selengkapnya |
| A5 | Gambar statis Paket Keluarga | Anak lebih dari satu? Paket Keluarga membuka Kelas 1 sampai 12 untuk 2 akun, akses 1 tahun. | Paket Keluarga Rp129.000 | Beli Sekarang |

Tujuan klik:
- A1, A2 dan A4 diarahkan ke Bab 1 gratis di besmartkids.id. Ini maksimal setelah pixel web terpasang; sebelum itu, arahkan ke halaman Scalev.
- A3 dan A5 diarahkan ke halaman paket di Scalev.

## 4. Kalender konten 30 hari

Pola mingguan:
- Senin, Rabu, Jumat: video trik (TikTok, Reels, Shorts).
- Selasa: carousel IG.
- Kamis: video demo produk.
- Sabtu: video orang tua atau di balik layar.
- Minggu: Story kuis dan rekap.
- Setiap hari: Story "soal harian" dari latihan harian.

| Hari | Konten utama | Tambahan | Iklan |
|---|---|---|---|
| 1 | V1 pinjam | Story: polling "anak kelas berapa?" | Pasang Kampanye A (A1–A5) dan C |
| 2 | Carousel "4 langkah pengurangan bersusun" | Story soal harian | Cek event masuk di Events Manager |
| 3 | V3 pecahan | — | — |
| 4 | V6 latihan harian | Shorts V1 | Kosongkan Test Event Code jika uji sudah beres |
| 5 | V2 porogapit | — | Evaluasi awal: matikan iklan yang jauh tertinggal |
| 6 | V10 pendiri | — | — |
| 7 | Story kuis dan rekap minggu | YouTube panjang #1: "Porogapit Kelas 4 lengkap" | Rekap mingguan |
| 8 | V8 coba jawab dulu | Story | Mulai Kampanye B (jangkau ulang) |
| 9 | Carousel "Kesalahan umum anak di soal cerita" | — | — |
| 10 | V4 soal cerita | — | — |
| 11 | V5 orang tua | — | Gandakan 2 iklan terbaik dengan hook baru |
| 12 | V7 HP untuk belajar | — | — |
| 13 | V9 paket keluarga | — | — |
| 14 | Story kuis dan rekap | YouTube panjang #2: "Pecahan pakai peraga" | Rekap mingguan, naikkan anggaran pemenang 20–30% |
| 15–21 | Ulangi pola dengan topik baru: perkalian bersusun, KPK/FPB, diagram batang, berhitung bersusun penuh warna, mode menjelaskan untuk guru | 2 carousel, YouTube panjang #3 | Ganti 2 kreatif yang mulai jenuh (frekuensi > 3) |
| 22–28 | Konten dari pembeli awal, hanya dengan izin dan cerita nyata. Mulai tema persiapan ujian semester | 2 carousel, YouTube panjang #4 | Kreatif baru dari video organik terbaik |
| 29–30 | Rekap bulan dan rencana bulan berikutnya | — | Evaluasi biaya per pembelian per kampanye |

## 5. Yang dipantau setiap minggu
- **Meta:** biaya per 1.000 tayangan, CTR tautan, biaya per InitiateCheckout, biaya per Purchase dan frekuensi.
- **Organik:** jumlah disimpan, dibagikan dan rata-rata durasi tonton per video.
- **Web:** kunjungan Bab 1 gratis (dari UTM) dan jumlah pembelian per kode iklan.
