# Karakter

## Pak Nawi (TETAP, jangan diubah)
Definisi ada di `template/web/nawi.js` (`SPEC_NAWI`). Ciri khas yang harus selalu ada:
1. Kacamata bulat berbingkai gelap.
2. Rambut menipis (atas kepala hampir botak).
3. Kantung mata tipis, alis agak turun, mata setengah terpejam (wajah lelah).
4. Kemeja abu-biru polos, kerah putih, pulpen merah di saku.
5. **Tas selempang cokelat di pinggul kiri dengan map lamaran menyembul.**
6. Kepala sedikit menunduk, bahu turun saat diam.

Lembar rujukan: `assets/lembar_pak_nawi.png`. Pemanggilan: `nawi(ctx, {x, y, s, arms, legs, face, headTilt, lean})`. Ekspresi: `eyes` (`half`, `wide`, `happy`), `mouth` (`flat`, `frown`, `o`, `teeth`, `smile`), `browAng`, `look`.

## Tokoh lain
Buat dengan `orang(ctx, spec, opsi)`. Spesifikasi:
```js
{nama:'Bu Sari', kulit:'#f1e6d8', rambut:{gaya:'sanggul', warna:'#2a2420'}, baju:{jenis:'daster', warna:'#4a3b52'}, aksesori:['kacamata'|'tas'|'map'|'pulpen'|'kantungmata']}
```
- `rambut.gaya`: `menipis`, `pendek`, `anak`, `sanggul`, `panjang`, `berkerudung` (butuh `kerudung` warna), `botak`.
- `baju.jenis`: `kemeja`, `kaos`, `daster`, `jaket`.
- Tinggi: dengan skala `s` (Pak Nawi 560 sampai 640 di adegan dekat; orang dewasa lain 0,94 kali; anak 0,55 kali).
- **Dalam satu cerita, tokoh harus sama persis.** Simpan spesifikasi di `cerita/<slug>/bible.json`. Cerita baru boleh ganti baju dan rupa tokoh selain Pak Nawi.
- Pak Nawi di cerita baru tetap Pak Nawi (rupa tidak berubah); hanya **latar dan peran** berubah.

## Pose menganggur (adegan pembuka)
`nawiMenganggur(ctx, t, {gaya, x, y, s})`: `duduk` (di kursi, tangan di lutut), `bengong`, `hp` (cahaya biru di wajah, mengembalikan lampu tambahan untuk `pencahayaan`), `bersandar`. Taruh kursi dengan `kursiR(ctx, x, lantai, 1.5)` sebelum `duduk`.

## Sosok gaib
Gunakan `orang(..., {sil:'#05070c'})` + mata menyala atau bayangan samar (alpha .25). Jangan membuat tokoh anak menjadi korban kekerasan.
