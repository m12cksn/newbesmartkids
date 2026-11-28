# Suara dan efek suara

## Aturan
- **Setiap gerakan yang terlihat** punya efek suara pada waktu yang sama (catat di `cues.json`, `t` dalam detik dari awal video).
- Selalu ada lapisan **bed** (ambience) di bawah narasi, dan **drone** pada bagian tegang. Narasi menekan (ducking) bed.
- Efek diambil dari pustaka `assets/sfx` (ElevenLabs). Efek baru: tambah ke `manifest.json`, jalankan `scripts/gen_sfx.py`, simpan hasilnya di repo.
- Gain umum: ambience .45 sampai .55, drone .3, efek gerak .7 sampai .9, stinger .8 sampai .9.
- Jangan menenggelamkan narasi; stinger keras hanya di klimaks.

## Pemetaan gerakan → efek
| Gerakan | Efek |
|---|---|
| Berjalan di tanah / kebun | `langkah_tanah` |
| Berjalan di lantai kayu | `langkah_kayu`, `lantai_berderit` |
| Berlari panik | `langkah_lari`, `napas_berat` |
| Pintu dibuka / ditutup | `pintu_berderit` / `pintu_tutup_keras` |
| Ketukan | `ketukan_tiga` |
| Kursi bergeser sendiri | `kursi_geser` + `stinger_hit` |
| Kertas jatuh / ditempel | `kertas_jatuh` / `kertas_tempel` |
| Pensil menulis (gaib) | `pensil_menggores` |
| Lampu minyak, korek | `lampu_minyak`, `korek_api` |
| Kain, tas, gerak badan | `kain_gesek` |
| Ponsel | `ponsel_getar` |
| Panggilan dari kejauhan | `panggilan_perempuan_jauh` |
| Bisikan banyak suara | `bisik_banyak` |
| Anak / tangis | `tawa_anak_jauh`, `tangis_pelan` |
| Ketegangan naik | `jantung_pelan` → `jantung_cepat`, `drone_gelap`, `riser_terbalik` |
| Kejutan | `stinger_hit`, `stinger_biola` |
| Latar | `ambience_desa_malam`, `ambience_ruangan_sunyi`, `ambience_hujan_atap`, `ambience_jalan_sepi`, `angin_melolong`, `anjing_melolong_jauh`, `burung_hantu`, `petir_jauh` |

## cues.json
```json
{"bed":[{"sfx":"ambience_desa_malam","g":0.5}],
 "drone":{"sfx":"drone_gelap","t":20,"g":0.3},
 "cues":[{"t":2.0,"sfx":"kertas_jatuh","g":0.8},{"t":59.05,"sfx":"kursi_geser","g":1.0,"fi":0.02,"fo":0.1}]}
```
Opsional per efek: `dur` (potong), `fi`/`fo` (fade masuk/keluar).

## Narasi
`scripts/suara_nawi.py`: ElevenLabs Pratama, stabilitas .62, gaya .12, kecepatan .92. Ubah dengan env `NAWI_VOICE`, `NAWI_SPEED`, `NAWI_STAB`, `NAWI_STYLE`.
