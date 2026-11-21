# Skill /stick-figure terpasang (2026-11-21)

Branch: `feat/skill-stick-figure`. Diminta Mr Iwan: memasang skill dari ZIP `stick-figure-windows-v2_1.zip`.

## Isi
- `.claude/skills/stick-figure/`: skill asli berlisensi MIT, karya Artem Novitckii (https://github.com/artemnovitckii/claude-animation-skills), versi Windows dengan panduan bahasa Indonesia. Isinya:
  - `SKILL.md`;
  - `engine/make.sh`, `engine/tools/*`;
  - contoh lengkap di `engine/template` (reel bajak laut 37 detik).
- `.claude/kit/`:
  - `package.json` dari paket aslinya;
  - `setup.sh` baru untuk Linux, sebagai pengganti `install-windows.sh`.
  - Folder berat diabaikan git: `node_modules/` (memakai Playwright global yang sudah ada di lingkungan cloud), `.venv/` (kokoro-onnx, sherpa-onnx) dan `models/` (±1 GB).
- Jalur kit tetap seperti aslinya: `engine/../../../kit` menunjuk ke `.claude/kit`.

## Cara pakai di sesi baru
1. `bash .claude/kit/setup.sh --voice` (sekali per kontainer, sekitar 1 GB unduhan).
2. `/stick-figure <pertanyaan>`.

## Batasan
- Suara gratis Kokoro dan penyelaras kata Parakeet hanya mendukung **bahasa Inggris**.
- Narasi bahasa Indonesia perlu salah satu dari:
  - suara ElevenLabs multilingual dengan `ELEVENLABS_API_KEY`;
  - rekaman sendiri.

  Pada keduanya, penyelaras kata bisa meleset karena modelnya untuk bahasa Inggris.

## Bukti
- `setup.sh --voice` berhasil.
- `render.js stills` pada contoh bawaan menghasilkan gambar.
- `make.sh` penuh pada contoh bawaan: lihat catatan PR.
