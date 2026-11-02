# Blueprint BeSmartKids Simple

Dokumen ini adalah batasan resmi untuk project BeSmartKids versi sederhana. Semua fitur dan keputusan teknis harus mengacu pada dokumen ini. Jika sebuah fitur tidak dibutuhkan untuk tujuan utama, fitur tersebut tidak boleh ditambahkan ke MVP.

## 1. Tujuan Produk

BeSmartKids Simple adalah website belajar matematika visual untuk siswa kelas 1 sampai 12.

Alur utama siswa:

```text
Beranda
  -> Pilih kelas
    -> Pilih materi
      -> Tonton video dan lihat ringkasan
        -> Kerjakan latihan
          -> Lihat hasil dan pembahasan
```

Tujuan utama:

- siswa dapat menemukan materi dengan cepat;
- materi tidak hanya berupa tulisan;
- konsep matematika dibantu visual dan interaksi sederhana;
- siswa dapat membuat akun dan mengakses materi sesuai paketnya;
- project mudah dipelihara oleh satu atau dua orang;
- konten dapat ditambahkan melalui file lokal atau tabel sederhana;
- akses materi premium dapat dibatasi berdasarkan akun dan masa berlaku.

## 2. Prinsip Batasan

Project ini harus tetap:

- sederhana;
- cepat dibuka;
- mudah dipahami anak dan orang tua;
- mudah ditambah materinya;
- hanya memakai database untuk akun dan hak akses;
- tidak memiliki database konten yang kompleks;
- tidak menyimpan progress siswa;
- tidak memiliki dashboard admin yang kompleks.

Keputusan penting:

> Database hanya digunakan untuk autentikasi dan hak akses. Fitur operasional lain tetap berada di luar MVP.

## 3. Fitur MVP

### 3.1 Beranda publik

Route:

```text
/
```

Isi:

- logo BeSmartKids;
- tagline singkat;
- pilihan kelas 1 sampai 12;
- pengelompokan empat fase;
- tombol menuju halaman kelas;
- tombol masuk atau daftar;
- tampilan responsif.

### 3.2 Login dan pendaftaran

Route:

```text
/login
/register
```

Fitur minimum:

- daftar dengan email dan password;
- login;
- logout;
- halaman akun sederhana;
- pesan error yang mudah dipahami;
- proteksi materi premium.

Untuk MVP, tidak perlu membuat role admin, guru, atau siswa yang kompleks. Semua akun adalah akun pembelajar.

### 3.3 Hak akses

Setiap akun memiliki akses berdasarkan paket yang diberikan:

- paket gratis;
- paket kelas tertentu;
- paket fase tertentu;
- akses dengan tanggal kedaluwarsa.

Pembayaran dapat dilakukan di luar website melalui WhatsApp atau payment provider. Admin dapat memberikan akses melalui Supabase Dashboard terlebih dahulu. Panel admin khusus belum diperlukan.

### 3.4 Halaman kelas

Route:

```text
/kelas/[kelasId]
```

Isi:

- judul kelas;
- deskripsi singkat;
- gambar kelas;
- daftar materi;
- kartu materi dengan judul, topik, durasi, dan status ketersediaan;
- filter sederhana berdasarkan fase atau topik jika memang diperlukan.

### 3.5 Halaman materi

Route:

```text
/kelas/[kelasId]/materi/[materiId]
```

Isi:

- judul materi;
- video YouTube atau notifikasi video belum tersedia;
- ringkasan materi;
- visual interaktif jika tersedia;
- contoh singkat;
- tombol `Mulai Latihan`;
- tombol kembali ke daftar materi.

Materi gratis dapat dibaca publik. Materi premium harus memeriksa akun dan hak akses sebelum ditampilkan.

### 3.6 Halaman latihan

Route:

```text
/kelas/[kelasId]/materi/[materiId]/latihan
```

Isi:

- satu soal dalam satu tampilan;
- pilihan ganda, essay, dan multipart jika diperlukan;
- gambar soal;
- ikon atau pecahan profesional;
- navigasi soal;
- tombol periksa jawaban;
- feedback benar atau salah;
- pembahasan soal;
- skor akhir.

Untuk MVP, jawaban dan skor hanya disimpan selama sesi browser. Progress belajar belum disimpan ke server.

## 4. Empat Fase Pembelajaran

Fase hanya digunakan sebagai pengelompokan navigasi. Fase bukan sistem adaptif dan bukan role pengguna.

### Fondasi

Target: TK dan SD awal.

Contoh topik:

- membilang;
- penjumlahan dan pengurangan;
- bentuk;
- posisi;
- pola;
- pecahan dasar;
- pengukuran dasar.

Visual utama:

- sempoa digital;
- benda yang dapat dihitung;
- garis bilangan;
- pizza pecahan;
- blok nilai tempat;
- pola bentuk dan warna.

### Akselerasi

Target: SD akhir dan SMP.

Contoh topik:

- pecahan, desimal, dan persen;
- KPK dan FPB;
- rasio;
- aljabar dasar;
- geometri;
- data dan peluang.

Visual utama:

- fraction bar;
- timbangan aljabar;
- grid rasio;
- diagram luas;
- grafik interaktif.

### Mahir

Target: SMA dan SNBT.

Contoh topik:

- fungsi;
- grafik;
- peluang;
- statistika;
- geometri analitik;
- penalaran kuantitatif.

Visual utama:

- slider koefisien;
- grafik fungsi;
- bidang koordinat;
- simulasi peluang;
- latihan strategi.

### Terapan

Target: CPNS, TPA, dan psikotes.

Contoh topik:

- hitung cepat;
- deret angka;
- logika numerik;
- perbandingan kuantitatif;
- tabel dan grafik;
- pola figural.

Visual utama:

- timer;
- papan pola;
- simulasi ujian;
- analisis waktu;
- visual tabel dan grafik.

## 5. Visual dan Animasi

Project harus menggunakan pendekatan visual-first. Setiap materi penting idealnya memiliki minimal satu bentuk bantuan visual:

- gambar;
- diagram;
- SVG;
- peraga interaktif;
- animasi perubahan;
- feedback warna;
- drag and drop;
- slider;
- simulasi sederhana.

Animasi yang boleh digunakan:

- transisi saat jawaban diperiksa;
- objek bergerak saat operasi matematika terjadi;
- perubahan grafik;
- progress latihan;
- highlight langkah pembahasan.

Animasi yang tidak boleh digunakan:

- dekorasi bergerak terus-menerus;
- efek yang mengganggu membaca soal;
- animasi lambat di halaman latihan;
- suara otomatis tanpa kontrol;
- efek berlebihan setelah setiap klik.

Semua animasi harus tetap nyaman pada perangkat HP dan menghormati `prefers-reduced-motion`.

## 6. Struktur Folder

Struktur awal yang wajib digunakan:

```text
besmartkids-simple/
├── public/
│   ├── images/
│   │   ├── classes/
│   │   ├── materials/
│   │   └── questions/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── kelas/
│   │   │   └── [kelasId]/page.tsx
│   │   └── latihan/
│   │       └── [latihanId]/page.tsx
│   ├── components/
│   │   ├── ClassCard.tsx
│   │   ├── MaterialCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── QuestionFeedback.tsx
│   │   └── visual/
│   ├── data/
│   │   ├── classes.ts
│   │   ├── phases.ts
│   │   ├── materials.ts
│   │   └── questions/
│   └── lib/
│       ├── questionTypes.ts
│       └── formatters.ts
├── docs/
├── package.json
└── README.md
```

Folder berikut boleh dibuat hanya jika dibutuhkan untuk autentikasi dan proteksi route:

```text
src/lib/supabase/
src/proxy.ts
```

Namun folder dan fitur berikut tidak boleh dibuat pada MVP:

```text
src/app/api/
src/app/dashboard/
src/app/admin/
src/app/teacher/
```

## 7. Bentuk Data

### 7.1 Kelas

```ts
export type ClassItem = {
  id: number;
  title: string;
  phase: "fondasi" | "akselerasi" | "mahir" | "terapan";
  description: string;
  image: string;
};
```

### 7.2 Materi

```ts
export type MaterialItem = {
  id: string;
  classId: number;
  title: string;
  topic: string;
  description: string;
  videoUrl?: string;
  videoStatus: "available" | "coming_soon";
  summary?: string;
  image?: string;
  tool?: string;
  questionIds: string[];
};
```

### 7.3 Soal

```ts
export type Question = {
  id: string;
  materialId: string;
  type: "multiple_choice" | "essay" | "multipart";
  prompt: string;
  image?: string;
  options?: string[];
  answer: string | string[];
  explanation: string;
  difficulty: "mudah" | "sedang" | "menantang";
};
```

Data konten tetap dapat dibaca dari file lokal. Database hanya digunakan untuk autentikasi dan hak akses.

### 7.4 Akun dan hak akses

Struktur minimum yang diperlukan:

```ts
export type AccessGrant = {
  userId: string;
  productKey: string;
  status: "active" | "expired" | "revoked";
  expiresAt: string | null;
};
```

Tabel minimum:

- `profiles` untuk nama dan kelas siswa;
- `access_grants` untuk paket yang dapat dibuka;
- Supabase Auth untuk email dan password.

## 8. Format Visual Soal

Soal boleh menggunakan:

- gambar dari `public/images/questions`;
- SVG inline untuk bentuk sederhana;
- format pecahan profesional;
- superscript untuk pangkat;
- ikon visual untuk objek anak-anak.

Jika gambar belum tersedia, gunakan placeholder yang jelas:

```tsx
<img src="/images/questions/kelas-1-soal-01.png" alt="Gambar apel untuk soal nomor 1" />
```

Nama file harus menjelaskan kelas, materi, dan nomor soal.

## 9. Standar Desain

Gaya visual:

- warna dominan hijau BeSmartKids;
- putih dan hijau muda sebagai dasar;
- aksen kuning, biru, dan oranye untuk visual belajar;
- font Poppins jika tersedia secara lokal atau dapat di-load dengan aman;
- card tidak terlalu membulat;
- gunakan `rounded-md` atau `rounded-lg`, bukan bentuk kapsul berlebihan;
- ruang kosong cukup;
- judul singkat;
- teks tidak memenuhi layar;
- tombol utama jelas;
- mobile-first.

Prinsip layout:

- satu fokus utama per layar;
- video berada di bagian atas halaman materi;
- tombol latihan mudah ditemukan;
- soal tidak terlalu panjang ke bawah;
- gambar tidak terpotong;
- feedback muncul dekat dengan jawaban;
- navigasi kembali selalu tersedia.

## 10. Urutan Pengerjaan

### Tahap 1: Setup

- buat project Next.js baru;
- pastikan TypeScript, Tailwind, ESLint, dan App Router aktif;
- gunakan `next dev --webpack` jika mode development Turbopack tidak stabil;
- buat layout dan warna dasar;
- pastikan halaman kosong dapat dibuka.

### Tahap 2: Data statis

- buat daftar fase;
- buat kelas 1 sampai 12;
- buat satu materi contoh untuk kelas 1;
- buat lima soal contoh;
- validasi TypeScript.

### Tahap 3: Beranda

- buat header;
- buat hero singkat;
- buat card kelas 1 sampai 12;
- buat filter fase;
- uji tampilan HP dan desktop.

### Tahap 4: Halaman kelas

- tampilkan materi berdasarkan `classId`;
- buat kartu materi;
- tampilkan status video;
- buat navigasi kembali.

### Tahap 5: Halaman materi

- tampilkan video YouTube;
- tampilkan notifikasi jika video belum tersedia;
- tampilkan ringkasan;
- pasang alat visual pertama;
- tambahkan tombol latihan.

### Tahap 6: Mesin latihan lokal

- tampilkan satu soal;
- buat pilihan ganda;
- buat essay;
- buat multipart;
- validasi jawaban;
- tampilkan penjelasan;
- hitung skor tanpa menyimpan ke server.

### Tahap 7: Konten nyata

- pindahkan materi dari PDF ke file data;
- masukkan latihan dari buku;
- tambahkan gambar soal;
- tambahkan visual interaktif yang diperlukan;
- pastikan soal sesuai kelas.

### Tahap 8: Kualitas dan deploy

- jalankan lint;
- jalankan test komponen jika ada;
- jalankan build;
- cek semua route utama;
- cek HP, tablet, dan desktop;
- deploy ke Vercel.

## 11. Definition of Done MVP

MVP dianggap selesai jika:

- halaman utama menampilkan kelas 1 sampai 12;
- semua card kelas dapat diklik;
- setiap kelas memiliki halaman materi;
- minimal satu materi memiliki video;
- video dapat dibuka tanpa halaman rusak;
- latihan gratis dapat dikerjakan tanpa login;
- latihan premium dapat dikerjakan setelah login dan memiliki akses aktif;
- pilihan ganda dan essay berfungsi;
- jawaban benar dan salah memiliki feedback;
- pembahasan dapat dibaca;
- skor akhir muncul;
- gambar soal dapat tampil;
- layout berfungsi pada HP dan desktop;
- akun dapat dibuat dan digunakan untuk login;
- materi premium hanya terbuka untuk akun dengan akses aktif;
- akses yang kedaluwarsa ditolak;
- tidak ada progress yang disimpan ke server;
- `npm run lint` berhasil;
- `npm run build` berhasil.

## 12. Daftar Fitur Di Luar MVP

Fitur berikut tidak boleh dikerjakan sebelum MVP selesai dan digunakan:

- Supabase untuk fitur selain autentikasi dan hak akses;
- akun guru;
- akun admin;
- dashboard admin;
- dashboard guru;
- progress tersimpan;
- leaderboard;
- pembayaran internal;
- subscription;
- diagnostic test;
- laporan PDF;
- WhatsApp automation;
- Zoom;
- mobile app;
- CMS;
- editor soal online;
- adaptive learning berbasis machine learning;
- notifikasi;
- rekomendasi personal otomatis.

## 13. Aturan Perubahan Scope

Jika muncul ide fitur baru, tulis terlebih dahulu di bagian berikut:

```md
## Ide Fitur Berikutnya

- Nama fitur:
- Masalah yang diselesaikan:
- Apakah dibutuhkan untuk alur utama siswa:
- Apakah membutuhkan database:
- Apakah dapat ditunda sampai setelah MVP:
```

Sebuah fitur hanya boleh masuk ke kode jika:

1. membantu alur belajar utama;
2. tidak menambah kompleksitas yang belum diperlukan;
3. tidak merusak struktur data statis;
4. sudah disetujui sebagai bagian dari milestone aktif.

## 14. Target Pengembangan Pertama

Target pertama bukan membuat seluruh kelas 1 sampai 12 sekaligus.

Target pertama adalah satu alur lengkap dan rapi:

```text
Beranda
  -> Preview materi
    -> Daftar atau login
      -> Cek hak akses
        -> Kelas 1
          -> Materi Penjumlahan
            -> Video
            -> Peraga visual
            -> 5 soal latihan
            -> Feedback
            -> Skor
```

Jika alur tersebut sudah stabil dan nyaman digunakan, barulah konten kelas lain ditambahkan dengan struktur yang sama.

## 15. Keputusan Akhir

Project BeSmartKids Simple harus menjadi website belajar berakses premium yang:

- mudah dibuka;
- mudah dipahami;
- kaya visual;
- sederhana secara teknis;
- menyimpan data minimum untuk akun dan hak akses;
- menjaga materi premium tetap tertutup bagi pengguna tanpa akses;
- tidak memiliki fitur operasional yang belum diperlukan;
- dapat dikembangkan berdasarkan konten nyata.

Prioritas selalu mengikuti urutan:

```text
Pengalaman siswa
  -> Kejelasan materi
    -> Visual dan interaksi
      -> Latihan
        -> Kualitas konten
```

## 16. Model Bisnis dan Progress

Model bisnis yang dipilih adalah menjual akses belajar premium seperti portal belajar berlangganan atau paket belajar digital.

### Bagian yang wajib ada pada MVP

- akun siswa;
- login dan logout;
- materi preview yang dapat dilihat publik;
- materi premium yang membutuhkan login;
- hak akses berdasarkan paket;
- tanggal kedaluwarsa jika paket memiliki masa berlaku;
- halaman sederhana ketika akses ditolak;
- pemberian akses manual melalui Supabase Dashboard;
- pembayaran di luar website melalui WhatsApp atau payment provider.

### Bagian yang sengaja ditunda

Login tidak sama dengan progress. Pada MVP, akun hanya digunakan untuk mengamankan materi premium.

Progress berikut ditunda sampai model bisnis dan konten sudah terbukti:

- materi terakhir yang dibuka;
- riwayat skor;
- jumlah latihan selesai;
- mastery per skill;
- review otomatis;
- rekomendasi personal;
- laporan orang tua;
- leaderboard.

Skor latihan tetap dapat tampil setelah siswa selesai mengerjakan, tetapi hanya disimpan di browser selama sesi berlangsung.

### Alasan keputusan

Jika progress dibuat sejak awal, project membutuhkan tabel attempt, jawaban siswa, status materi, perhitungan statistik, dan aturan sinkronisasi. Itu akan membawa kembali kompleksitas project lama.

Urutan yang lebih aman adalah:

```text
Login
  -> Hak akses premium
    -> Konten visual
      -> Latihan lokal
        -> Validasi model bisnis
          -> Progress tersimpan pada fase berikutnya
```
