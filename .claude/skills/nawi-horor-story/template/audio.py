# Mixer Nawi Horor Story: suara narasi + lapisan ambience + drone + efek suara per gerakan.
# Data-driven: baca cues.json di folder reel. Tidak perlu mengubah file ini per cerita.
#   cues.json = {"bed":[{"sfx":"ambience_desa_malam","g":.5}], "drone":{"sfx":"drone_gelap","t":0,"g":.3},
#                "cues":[{"t":2.0,"sfx":"kertas_jatuh","g":.8}, {"t":10.4,"sfx":"kertas_tempel","g":.9,"dur":1.6}, ...]}
# Aturan: SETIAP gerakan yang terlihat di layar punya efek suara; selalu ada lapisan ambience (bed) di bawah narasi.
import numpy as np, soundfile as sf, json, os, subprocess, sys
from scipy import signal
SR = 44100
SFXDIR = os.environ.get('NAWI_SFX', os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', 'assets', 'sfx'))
WARP = json.load(open('audio/warp.json')) if os.path.exists('audio/warp.json') else None
def toNew(x):
    if not WARP: return x
    A = WARP['anchors']
    if x <= A[0][0]: return x - A[0][0] + A[0][1]
    for i in range(len(A) - 1):
        if x <= A[i + 1][0]: k = (x - A[i][0]) / (A[i + 1][0] - A[i][0]); return A[i][1] + k * (A[i + 1][1] - A[i][1])
    return x - A[-1][0] + A[-1][1]
DUR = (WARP['new_end'] + 0.6 if WARP else float(os.environ.get('NAWI_DUR', 60))) + 0.6
N = int(DUR * SR)
os.makedirs('audio/_sfx', exist_ok=True)
def load(name, dur=None):
    mp3 = os.path.join(SFXDIR, name + '.mp3'); wav = f'audio/_sfx/{name}.wav'
    if not os.path.exists(wav):
        if not os.path.exists(mp3): print('SFX tidak ada:', name, '(buat dengan scripts/gen_sfx.py)'); return np.zeros(int(.1 * SR))
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), wav])
    x, sr = sf.read(wav)
    if x.ndim > 1: x = x.mean(1)
    return x[:int(dur * SR)] if dur else x
def place(buf, x, at, g=1.0, fi=.02, fo=.25):
    i = int(toNew(at) * SR)
    if i < 0 or i >= len(buf): return
    n = min(len(x), len(buf) - i); y = x[:n].copy(); a = min(n, int(fi * SR)); b = min(n, int(fo * SR))
    if a: y[:a] *= np.linspace(0, 1, a)
    if b: y[n - b:] *= np.linspace(1, 0, b)
    buf[i:i + n] += y * g
cfg = json.load(open('cues.json')) if os.path.exists('cues.json') else {'bed': [{'sfx': 'ambience_desa_malam', 'g': .5}], 'cues': []}
bed = np.zeros(N); sfx = np.zeros(N)
for b in cfg.get('bed', []):   # ambience disambung dengan tumpang tindih agar tidak putus
    x = load(b['sfx']); step = max(1, len(x) - int(1.2 * SR)); pos = 0
    while pos < N:
        n = min(len(x), N - pos); y = x[:n].copy(); a = min(n, int(1.0 * SR)); o = min(n, int(1.2 * SR)); y[:a] *= np.linspace(0, 1, a); y[n - o:] *= np.linspace(1, 0, o)
        bed[pos:pos + n] += y * b.get('g', .5); pos += step
d = cfg.get('drone')
if d:
    x = load(d['sfx']); t = d.get('t', 0)
    while toNew(t) < DUR: place(bed, x, t, d.get('g', .3), 2.0, 1.5); t += len(x) / SR - 1.5
for c in cfg.get('cues', []): place(sfx, load(c['sfx'], c.get('dur')), c['t'], c.get('g', .8), c.get('fi', .02), c.get('fo', .25))
# narasi
vo, vsr = sf.read('audio/vo.wav')
if vo.ndim > 1: vo = vo.mean(1)
vo = signal.resample_poly(vo, SR, vsr); b_, a_ = signal.butter(2, 90 / (SR / 2), 'high'); vo = signal.lfilter(b_, a_, vo)
env = np.abs(signal.hilbert(vo)); b2, a2 = signal.butter(2, 20 / (SR / 2), 'low'); env = signal.lfilter(b2, a2, env)
vo = vo * np.where(env > .15, (.15 / np.maximum(env, 1e-6)) ** .4, 1.0); vo = vo / np.max(np.abs(vo)) * .9
VO = np.zeros(N); VO[:min(N, len(vo))] = vo[:N]
b3, a3 = signal.butter(2, 6 / (SR / 2), 'low'); venv = signal.lfilter(b3, a3, np.abs(VO)); duck = 1 - .5 * np.clip(venv / .05, 0, 1)
mix = VO + bed * duck + sfx * .85
fade = np.ones(N); fl = int(.6 * SR); fade[-fl:] = np.linspace(1, 0, fl); mix *= fade
mix = mix / max(np.max(np.abs(mix)), 1e-6) * .89
sf.write('audio/mix.wav', np.stack([mix, mix], 1), SR); print('mix selesai', round(DUR, 1), 'dtk', len(cfg.get('cues', [])), 'efek')
