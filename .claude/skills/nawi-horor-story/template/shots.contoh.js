// ===== Contoh adegan Nawi Horor Story. Salin polanya untuk tiap reel. =====
// ATURAN YANG WAJIB (lihat SKILL.md):
//  1. Adegan PERTAMA setiap reel = Pak Nawi menganggur khas (nawiMenganggur) di sebuah set, tidak melakukan apa-apa. Narasi sudah boleh mulai.
//  2. Tempat memakai set/tekstur nyata + pencahayaan() (gelap tapi terlihat) + bayangan. Siluet penuh hanya untuk sosok gaib.
//  3. Setiap gerakan yang terlihat punya efek suara di cues.json (waktu yang sama).
//  4. Adegan terakhir menampilkan kartuAkhir() sesuai mode: 'reel' | 'part' | 'tamat'.
const SHOTS = [];
const orangNawi = (ctx, x, y, s, o = {}) => nawi(ctx, Object.assign({ x, y, s }, o));

// 1. pembuka: Pak Nawi menganggur di teras kontrakan (0 - 5)
SHOTS.push({ start: 0, end: 5, tr: 'cut', draw(ctx, lt, t) {
  push(ctx, lt, 5, 1, 1.05, 540, 800); ctx.translate(0, 110);   // geser ke bawah agar isi adegan di tengah layar
  const L = setTeras(ctx, t);
  kursiR(ctx, 300, L.lantai, 1.5); bayanganLantai(ctx, 300, L.lantai, 220, .55);
  const tambahan = nawiMenganggur(ctx, t, { gaya: 'duduk', x: 300, y: L.lantai - 4, s: 560 });
  pencahayaan(ctx, { lampu: L.lampu.concat(tambahan.lampu), t, gelap: .8 }); vignetteDark(ctx, .5);
} });

// 2. contoh adegan cerita di warung (5 - 10): bayangan jatuh di dinding dari lampu
SHOTS.push({ start: 5, end: 10, tr: 'cut', draw(ctx, lt, t) {
  push(ctx, lt, 5, 1, 1.05, 540, 800); ctx.translate(0, 110);
  const L = setWarung(ctx, t); lampuMinyakR(ctx, 240, 880, 1.1, t);
  bayanganDinding(ctx, c => orangNawi(c, 620, L.lantai - 20, 600, { sil: '#000' }), 80, -10, .55, 16);
  bayanganLantai(ctx, 620, L.lantai - 20, 230, .6);
  nawiMenganggur(ctx, t, { gaya: 'bengong', x: 620, y: L.lantai - 20, s: 600 });
  pencahayaan(ctx, { lampu: L.lampu, t }); vignetteDark(ctx, .5);
} });

// 3. contoh: ruang tamu, tujuh kursi dan lampu minyak (10 - 16)
SHOTS.push({ start: 10, end: 16, tr: 'cut', draw(ctx, lt, t) {
  push(ctx, lt, 6, 1, 1.06, 540, 850); ctx.translate(0, 110);
  const L = setRuangTamu(ctx, t);
  for (let i = 0; i < 7; i++) kursiR(ctx, 90 + i * 135, L.lantai - 10, 1.15, { a: pop(t, 11 + i * .3) });
  mejaR(ctx, 120, 880, 760, 36); lampuMinyakR(ctx, 440, 880, 1.2, t);
  bayanganLantai(ctx, 190, L.lantai + 80, 230, .6);
  orangNawi(ctx, 190, L.lantai + 80, 640, { arms: { L: [.2, -.1], R: [.2, -.1] }, headTilt: .05 });
  pencahayaan(ctx, { lampu: L.lampu, t, gelap: .84 }); vignetteDark(ctx, .55);
} });

// 4. contoh: perjalanan di kebun karet (16 - 20) + kartu akhir
SHOTS.push({ start: 16, end: 24, tr: 'cut', draw(ctx, lt, t) {
  push(ctx, lt, 8, 1, 1.06, 540, 850); ctx.translate(0, 110);
  const L = setJalanKaret(ctx, t); const wx = lerp(180, 600, clamp(lt / 6));
  bayanganLantai(ctx, wx, L.lantai + 30, 150, .6);
  orangNawi(ctx, wx, L.lantai + 30, 420, { arms: { L: [.5 + Math.sin(t * 5) * .3, -.1], R: [.5 - Math.sin(t * 5) * .3, -.1] }, legs: { L: [Math.sin(t * 5) * .5, -.3], R: [-Math.sin(t * 5) * .5, -.3] }, headTilt: .05 });
  pencahayaan(ctx, { lampu: L.lampu, t, gelap: .78 }); vignetteDark(ctx, .5);
  kartuAkhir(ctx, t, 21, 'reel', 2);
} });
