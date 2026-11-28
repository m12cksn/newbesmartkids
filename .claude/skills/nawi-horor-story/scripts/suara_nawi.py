#!/usr/bin/env python3
"""Narasi horor ElevenLabs. Jalankan DI DALAM folder reel:  python3 <skill>/scripts/suara_nawi.py
Baca script.json (daftar kalimat) -> audio/vo.wav (dipangkas diam di awal dan akhir). Suara: Pratama, tenang dan rendah, sedikit lambat.
Ubah lewat env: NAWI_VOICE (voice id), NAWI_SPEED (default .92), NAWI_STAB (.62), NAWI_STYLE (.12)."""
import json, os, subprocess, urllib.request
vid = os.environ.get('NAWI_VOICE', 'q8qwd1jY2jS3AWOBeq25')
text = ' '.join(json.load(open('script.json')))
body = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2', 'language_code': 'id', 'voice_settings': {
    'stability': float(os.environ.get('NAWI_STAB', .62)), 'similarity_boost': .78, 'style': float(os.environ.get('NAWI_STYLE', .12)),
    'use_speaker_boost': True, 'speed': float(os.environ.get('NAWI_SPEED', .92))}}).encode()
req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_128', data=body, headers={'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
os.makedirs('audio', exist_ok=True); open('audio/vo_el.mp3', 'wb').write(urllib.request.urlopen(req, timeout=180).read())
subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/vo_el.mp3', '-ac', '1', '-ar', '44100', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', 'audio/vo.wav'])
print('suara selesai:', len(text.split()), 'kata')
