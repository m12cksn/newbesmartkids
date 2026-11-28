#!/usr/bin/env python3
"""Buat efek suara yang BELUM ada dari assets/sfx/manifest.json lewat ElevenLabs (sound-generation).
Pakai:  python3 gen_sfx.py [nama ...]      tanpa argumen = semua yang belum ada.
Kunci tidak perlu di sini: di sesi cloud proxy jaringan menambahkan header xi-api-key (lihat SKILL.md).
Tambah efek baru: tambahkan entri di manifest.json lalu jalankan skrip ini. Hasil (.mp3) disimpan di assets/sfx/ supaya dipakai ulang."""
import json, os, sys, urllib.request, urllib.error
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'sfx')
M = json.load(open(os.path.join(D, 'manifest.json')))
want = sys.argv[1:] or list(M)
for k in want:
    if k not in M: print('tidak ada di manifest:', k); continue
    out = os.path.join(D, k + '.mp3')
    if os.path.exists(out): continue
    e = M[k]
    body = json.dumps({'text': e['prompt'], 'duration_seconds': e['durasi'], 'prompt_influence': .55}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    try:
        open(out, 'wb').write(urllib.request.urlopen(req, timeout=120).read()); print('ok', k)
    except urllib.error.HTTPError as ex:
        print('GAGAL', k, ex.code, ex.read().decode(errors='replace')[:160])
