---
name: nawi-horor-story
description: Membuat reel horor "Nawi Horor Story" (video 9:16, bersuara) dari cerita yang dikirim Mr Iwan per part. Gunakan saat pengguna mengirim cerita horor, menulis "Part N", "bersambung" atau "selesai", atau menyebut Pak Nawi, Nawi Horor Story, Les Malam, atau meminta reel horor. Skill ini sudah berisi karakter tetap Pak Nawi, set tempat gelap yang realistis, pustaka efek suara ElevenLabs, logo dan watermark, serta alur kerja tiap part (minimal 3 reel).
---

# Nawi Horor Story

Pengguna (Mr Iwan, sapa "Bapak", bahasa Indonesia) cukup **menempelkan cerita**. Kamu yang memutuskan semuanya: memecah jadi reel, menggambar adegan, memasang suara dan efek, merender, memeriksa, lalu menyerahkan file. Jangan bertanya hal yang bisa diputuskan sendiri dari aturan di bawah. Tanyakan hanya bila ceritanya benar-benar ambigu (mis. tidak jelas bersambung atau selesai).

Saluran: **Nawi Horor Story** (Instagram Reels dan YouTube Shorts). Nada: horor serius, tegang, manusiawi. Sudut khas: orang yang "terlanjur tua", sulit dapat kerja, rela kerja apa saja.

## 0. Ketergantungan (cek dulu)
- Engine video: `/root/.claude/skills/stick-figure/engine` dan kit `/root/.claude/kit` (venv, models, node_modules). Bila hilang: baca SKILL stick-figure bagian "First use" (`bash kit/setup.sh --voice`). Jangan menyalin engine ke repo (ada lisensi).
- Suara dan efek suara: ElevenLabs lewat proxy jaringan sesi cloud (tanpa kunci di chat; kunci ada di Network secrets untuk `api.elevenlabs.io`). Pengguna sudah mengizinkan sound effect. Jika 401/403, jangan dipaksa: katakan apa yang tertahan.
- Node + Playwright (dari kit) dan ffmpeg. Perintah render memakai `NODE_PATH=/root/.claude/kit/node_modules`.

## 1. Menerima cerita
Format yang dikirim pengguna: judul (opsional), "Part N" (bila ada), isi cerita, lalu **"bersambung"** atau **"selesai"** di ujung.
- **Cerita baru** (judul belum ada di `cerita/`): buat `cerita/<slug>/bible.json` (tokoh, baju, tempat, aturan dunia, progres). Tokoh selain Pak Nawi boleh diberi baju dan rupa baru **untuk cerita ini**.
- **Lanjutan** (judul sudah ada): baca `bible.json`; **semua tokoh, baju, dan tempat harus sama persis** dengan part sebelumnya. Perbarui progres setelah selesai.
- Tulis "bersambung" atau "selesai" ke `status` di bible. Tanpa penanda, anggap bersambung lalu konfirmasi satu kalimat di akhir.
- Jangan menulis atau mengaku **"kisah nyata"** di naskah, keterangan, atau video. Pengguna sudah memutuskan **tidak memakai label "fiksi"**; jangan mempermasalahkannya lagi.

## 2. Memecah satu part menjadi reel
- **Satu part = minimal 3 reel.** Tiap reel 50 sampai 65 detik (sekitar 120 sampai 150 kata pada suara Pratama).
- Tiap reel berakhir **menggantung**. **Klimaks dan penutup part ada di reel terakhir part** (bukan di reel pertama). Bila "bersambung", akhir part meninggalkan satu pertanyaan besar untuk part berikutnya.
- Tulis narasi tiap reel ke `script.json` (daftar kalimat). **Angka ditulis dengan huruf** ("tiga puluh delapan"). Kalimat pendek, ritme lambat, jeda ditandai tanda baca.
- Pertahankan kata-kata pengguna; boleh merapikan ritme tanpa mengubah kejadian.

## 3. Aturan wajib tiap reel
1. **Adegan pertama = Pak Nawi menganggur khas** (`nawiMenganggur`): duduk, bengong, bersandar, atau menatap ponsel, di sebuah set sesuai cerita, tidak melakukan apa-apa. Narasi boleh mulai di atas adegan ini. Tiap reel memakai set atau gaya berbeda dari reel sebelumnya bila memungkinkan.
2. **Tempat realistis, gelap, tetapi terlihat.** Pakai set bertekstur + `pencahayaan()` (lapisan gelap dengan lubang cahaya) + bayangan. Siluet penuh **hanya** untuk sosok gaib sebagai aksen. Benda diberi bayangan kontak di lantai dan bayangan jatuh di dinding. Rinci: `references/gaya-visual.md`.
3. **Setiap gerakan punya efek suara** dan selalu ada lapisan suasana (ambience + drone) di bawah narasi, semuanya dari ElevenLabs (pustaka `assets/sfx`). Rinci: `references/suara-sfx.md`.
4. **Pak Nawi adalah tokoh tetap** (`SPEC_NAWI` di `template/web/nawi.js`). Jangan mengubah rupanya. Tokoh lain dibuat dengan `orang(ctx, spec, ...)`. Rinci: `references/karakter.md`.
5. **Watermark logo Nawi Horor Story di tengah layar, agak transparan** (sudah ditangani `scripts/bangun_reel.sh`: `assets/logo/watermark-nawi.png`, tengah, sekitar 18% opasitas).
6. **Teks lanjutan di akhir video** (`kartuAkhir`), selalu **menyebut "Nawi Horor Story"**:
   - reel yang bukan terakhir di part: mode `'reel'` → "Lanjut reel N di Nawi Horor Story".
   - reel terakhir di part, cerita **bersambung**: mode `'part'` → "BERSAMBUNG. Lanjut Part N+1 di Nawi Horor Story".
   - reel terakhir, cerita **selesai**: mode `'tamat'` → "TAMAT. Cerita lain di Nawi Horor Story".
   Teks muncul sejak sekitar 3 detik sebelum video habis. Tidak memakai kartu penutup BeSmartKids (`NO_OUTRO=1`).

## 4. Langkah kerja per reel
```bash
SK=/home/user/newbesmartkids/.claude/skills/nawi-horor-story     # lokasi skill di repo
R=<folder kerja>/<slug>-part<N>-reel<K>
bash $SK/scripts/siapkan_reel.sh $R                              # salin templat engine + templat Nawi
# tulis $R/script.json (narasi), lalu suara:
(cd $R && python3 $SK/scripts/suara_nawi.py)                     # ElevenLabs Pratama, tenang dan rendah
# penyelarasan kata (dijalankan bangun_reel.sh); lihat waktu kata:
#   KIT=/root/.claude/kit; $KIT/.venv/bin/python /root/.claude/skills/stick-figure/engine/tools/align.py audio/vo.wav (di folder reel)
# tulis $R/web/shots.js (adegan, mulai dari shots.contoh.js) dan $R/cues.json (efek suara per gerakan)
# cek tampilan dulu:
(cd $R && NODE_PATH=/root/.claude/kit/node_modules node /root/.claude/skills/stick-figure/engine/tools/render.js stills 1,8,20,40,55)
# render penuh (lama, jalankan di latar belakang dan pantau):
bash $SK/scripts/bangun_reel.sh $R
```
- Waktu adegan dan efek suara diikat ke **waktu kata** hasil penyelarasan (`audio/words_new.json`). Satu adegan per kalimat atau ide, 2 sampai 6 detik, kecuali adegan klimaks.
- Perkiraan: render satu reel 60 detik sekitar 20 sampai 25 menit dengan 4 worker.
- Bila `gen_sfx.py` perlu efek baru: tambah entri di `assets/sfx/manifest.json`, jalankan `python3 $SK/scripts/gen_sfx.py <nama>`, lalu **simpan hasilnya di repo** agar dipakai ulang.

## 5. Pemeriksaan sebelum menyerahkan
- Lihat frame: adegan 1 (Pak Nawi menganggur), tiap pergantian set, klimaks, dan kartu akhir. Teks tidak terpotong; area caption (y 1250 sampai 1420) bebas dari wajah.
- `ffprobe`: 1080x1920, 30 fps, H.264, durasi 50 sampai 65 detik.
- Volume: narasi jelas, efek tidak menenggelamkan suara (rata-rata sekitar -18 dB).
- Watermark tampak di tengah, transparan, tidak menutup narasi.
- Konsistensi tokoh sesuai `bible.json`. Tidak ada kata "kisah nyata".
- Pernyataan jujur: katakan apa yang sudah diperiksa dan apa yang **belum** (mis. belum didengar langsung).

## 6. Serahkan
- Kirim file `<slug>_part<N>_reel<K>.mp4` dengan `SendUserFile` (video `render`).
- Sertakan keterangan unggahan (caption) singkat dan hashtag, tanpa klaim "kisah nyata".
- Perbarui `cerita/<slug>/bible.json` (progres reel, status bersambung/selesai) dan simpan naskah reel di folder cerita.
- Katakan reel berikutnya dan minta cerita part selanjutnya bila bersambung.
- Pembuatan reel boleh berurutan; tidak perlu minta izin tiap reel setelah pengguna mengirim cerita.

## Berkas skill
| Jalur | Isi |
|---|---|
| `template/web/nawi.js` | Pak Nawi tetap (`SPEC_NAWI`), `orang()` untuk tokoh lain, `nawiMenganggur()` |
| `template/web/nawi-env.js` | `pencahayaan`, bayangan, tekstur, benda, set (`setTeras`, `setWarung`, `setRuangTamu`, `setJalanKaret`), `kartuAkhir` |
| `template/shots.contoh.js`, `cues.contoh.json`, `audio.py` | Contoh adegan, contoh data efek suara, mixer |
| `assets/sfx` | 37 efek suara ElevenLabs + `manifest.json` |
| `assets/logo` | `nawi-horor-story-logo.png`, `watermark-nawi.png` |
| `scripts/` | `siapkan_reel.sh`, `suara_nawi.py`, `bangun_reel.sh`, `gen_sfx.py`, `logo/buat_logo.cjs` |
| `references/` | `gaya-visual.md`, `suara-sfx.md`, `karakter.md` |
| `cerita/<slug>/` | `bible.json` dan naskah tiap cerita (contoh: `les-malam`) |
