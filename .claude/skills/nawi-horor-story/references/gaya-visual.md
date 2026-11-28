# Gaya visual Nawi Horor Story

Tujuan: tempat terasa **nyata, gelap, dan seram, tetapi tetap terlihat**. Bukan siluet hitam polos.

## Resep tiap adegan
1. Gambar set dengan **tekstur**: `dindingPapan`, `dindingPlester`, `lantaiPapan`, `tanahJalan`, `pohonKaret`, dan benda (`mejaR`, `kursiR`, `pintuR`, `jendelaR`, `lampuMinyakR`, `bukuR`, `kertasR`).
2. Tambah **bayangan**: `bayanganLantai` (bayangan kontak di bawah benda dan tokoh) dan `bayanganDinding` (bentuk benda atau tokoh digambar hitam, digeser menjauhi cahaya, kabur dan transparan).
3. Panggil **`pencahayaan(ctx, {lampu:[...], t, gelap})`** paling akhir: lapisan gelap (gelap .78 sampai .86) dengan lubang cahaya di sekitar lampu. Hasilnya area dekat lampu hangat dan jelas, area jauh gelap tetapi masih terlihat samar.
4. `vignetteDark(ctx, .5)`.
5. Tokoh digambar **berwarna dan terlihat** (bukan siluet) dan ikut ditimpa lapisan gelap. Pastikan ada satu sumber cahaya dekat tokoh utama.

## Sumber cahaya
- Lampu minyak (hangat `255,176,80`), bohlam kuning (kecil dan redup), bulan (dingin `150,170,220`, `flick:false`), layar ponsel (biru `120,190,255`).
- `kuat` 0 sampai 1, `r` jari-jari dalam piksel. Cahaya berkedip otomatis kecuali `flick:false`.

## Siluet penuh
Hanya untuk **sosok gaib atau sesuatu yang tak boleh dilihat jelas** (pakai `sil:'#05070c'` pada `orang`). Mata menyala putih memberi aksen.

## Komposisi
- Isi adegan di tengah layar: geser `ctx.translate(0, 110)` setelah `push()`.
- Area bawah (y > 1250) dipakai caption narasi; jangan taruh wajah di sana.
- Pergantian adegan memakai `tr:'cut'` (potongan keras) agar terasa dingin; gunakan zoom lambat (`push`) di setiap adegan.
- Adegan pertama selalu **Pak Nawi menganggur**.

## Menambah set baru
Salin pola `setTeras` di `nawi-env.js`: latar → dinding/lantai bertekstur → benda → kembalikan `{lampu:[...], lantai:y}`. Beri nama `setXxx` dan catat di `bible.json` cerita.
