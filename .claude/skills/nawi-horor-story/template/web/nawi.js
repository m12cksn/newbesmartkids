// ===== NAWI HOROR STORY: karakter =====
// PAK NAWI = tokoh tetap (jangan ubah rupanya). Tokoh lain dibuat dari spesifikasi (orang()) dan boleh diganti baju/rupa
// antar CERITA, tetapi dalam satu cerita harus sama persis (simpan spesifikasinya di cerita/<slug>/bible.json).
// Satuan rig: 1 = tinggi badan. drawStick() dari engine stick-figure dipakai untuk badan, lalu aksesori digambar dengan transformasi sama.
const SPEC_NAWI = {
  nama: 'Pak Nawi', kulit: '#f6f2ea',
  rambut: { gaya: 'menipis', warna: '#3a3430' },
  baju: { jenis: 'kemeja', warna: '#6b7f94', gelap: '#566879', kerah: '#e9eef3' },
  aksesori: ['kacamata', 'tas', 'map', 'pulpen'],
  tas: { warna: '#7a4f2e', gelap: '#5b3a20' }, map: '#e8dcc0', bingkai: '#2b2b2b',
  wajahDefault: { eyes: 'half', mouth: 'flat', browAng: .22 },
};

// --- bagian-bagian aksesori (dipanggil dalam transformasi rig) ---
function _rambut(ctx, sp, hr, hy) {
  const g = sp.rambut && sp.rambut.gaya; if (!g || g === 'botak') return; const c = sp.rambut.warna || '#2a2420', lw = .017;
  ctx.save(); circle(ctx, 0, hy, hr); ctx.clip(); ctx.fillStyle = c;
  const cap = (top, side) => { ctx.beginPath(); ctx.moveTo(-hr * 1.1, hy - hr * .2); ctx.quadraticCurveTo(-hr * .6, hy - hr * top, 0, hy - hr * (top - .05)); ctx.quadraticCurveTo(hr * .6, hy - hr * top, hr * 1.1, hy - hr * .2); ctx.quadraticCurveTo(hr * .95, hy - hr * side, hr * .55, hy - hr * (side - .05)); ctx.quadraticCurveTo(0, hy - hr * (side + .25), -hr * .55, hy - hr * (side - .05)); ctx.quadraticCurveTo(-hr * .95, hy - hr * side, -hr * 1.1, hy - hr * .2); ctx.fill(); };
  if (g === 'menipis') { ctx.beginPath(); ctx.moveTo(-hr * 1.1, hy - hr * .25); ctx.quadraticCurveTo(-hr * .6, hy - hr * 1.12, -hr * .05, hy - hr * 1.05); ctx.quadraticCurveTo(-hr * .1, hy - hr * .72, -hr * .5, hy - hr * .55); ctx.quadraticCurveTo(-hr * .85, hy - hr * .55, -hr * 1.1, hy - hr * .25); ctx.fill(); ctx.beginPath(); ctx.moveTo(hr * 1.1, hy - hr * .25); ctx.quadraticCurveTo(hr * .7, hy - hr * 1.1, hr * .12, hy - hr * 1.0); ctx.quadraticCurveTo(hr * .2, hy - hr * .7, hr * .55, hy - hr * .5); ctx.quadraticCurveTo(hr * .9, hy - hr * .5, hr * 1.1, hy - hr * .25); ctx.fill(); }
  else if (g === 'pendek' || g === 'anak') cap(1.15, .62);
  else if (g === 'sanggul') { cap(1.14, .58); ctx.restore(); ctx.save(); ctx.fillStyle = c; circle(ctx, -hr * .12, hy - hr * 1.12, hr * .42); ctx.fill(); circle(ctx, -hr * .12, hy - hr * 1.12, hr * .42); fillStroke(ctx, null, lw); ctx.restore(); return _ring(ctx, hr, hy); }
  else if (g === 'panjang') { cap(1.15, .55); ctx.fillRect(-hr * 1.05, hy - hr * .3, hr * .38, hr * 1.5); ctx.fillRect(hr * .67, hy - hr * .3, hr * .38, hr * 1.5); }
  else if (g === 'berkerudung') { ctx.fillStyle = sp.kerudung || '#3c5a4a'; ctx.beginPath(); ctx.rect(-hr * 1.2, hy - hr * 1.3, hr * 2.4, hr * 1.05); ctx.fill(); ctx.beginPath(); ctx.rect(-hr * 1.2, hy - hr * .4, hr * .4, hr * 1.7); ctx.fill(); ctx.beginPath(); ctx.rect(hr * .8, hy - hr * .4, hr * .4, hr * 1.7); ctx.fill(); }
  ctx.restore();
}
function _ring(ctx, hr, hy) { circle(ctx, 0, hy, hr); fillStroke(ctx, null, .017); }
function _kacamata(ctx, sp, hy) {
  const c = sp.bingkai || '#2b2b2b'; ctx.strokeStyle = c; ctx.lineWidth = .013;
  for (const sd of [-1, 1]) { circle(ctx, sd * .072, hy - .005, .056); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-.016, hy - .008); ctx.quadraticCurveTo(0, hy - .024, .016, hy - .008); ctx.stroke();
  line(ctx, -.128, hy - .01, -.18, hy - .03, .01, c); line(ctx, .128, hy - .01, .18, hy - .03, .01, c);
}
function _tas(ctx, sp, sil) {
  const t = sp.tas || { warna: '#7a4f2e', gelap: '#5b3a20' }, lw = .012;
  if (sil) { ctx.strokeStyle = sil; ctx.lineWidth = .022; ctx.beginPath(); ctx.moveTo(.1, -.56); ctx.lineTo(-.13, -.33); ctx.stroke(); rrect(ctx, -.24, -.31, .135, .105, .018); ctx.fillStyle = sil; ctx.fill(); if (sp.aksesori.includes('map')) { rrect(ctx, -.215, -.37, .08, .11, .006); ctx.fill(); } return; }
  ctx.beginPath(); ctx.moveTo(.1, -.56); ctx.lineTo(-.13, -.33); ctx.lineWidth = .022; ctx.strokeStyle = t.gelap; ctx.lineCap = 'round'; ctx.stroke();
  if (sp.aksesori.includes('map')) { rrect(ctx, -.215, -.37, .08, .11, .006); fillStroke(ctx, sp.map || '#e8dcc0', lw); line(ctx, -.2, -.34, -.15, -.34, .007, '#b9ab8a'); }
  rrect(ctx, -.24, -.31, .135, .105, .018); fillStroke(ctx, t.warna, lw); path(ctx, [[-.24, -.31], [-.105, -.31], [-.105, -.27], [-.24, -.27]]); fillStroke(ctx, t.gelap, lw);
  circle(ctx, -.172, -.27, .008); ctx.fillStyle = '#d8b45a'; ctx.fill();
}
function _baju(ctx, sp) {
  const b = sp.baju || {}, lw = .012;
  if (b.jenis === 'kemeja') {
    path(ctx, [[-.075, -.62], [-.008, -.585], [-.07, -.545]]); fillStroke(ctx, b.kerah || '#e9eef3', lw); path(ctx, [[.075, -.62], [.008, -.585], [.07, -.545]]); fillStroke(ctx, b.kerah || '#e9eef3', lw);
    if (sp.aksesori.includes('pulpen')) { rrect(ctx, .03, -.52, .07, .075, .008); fillStroke(ctx, b.gelap || '#566879', lw); line(ctx, .06, -.53, .06, -.48, .012, '#c0392b'); }
  } else if (b.jenis === 'daster') { ctx.save(); ctx.fillStyle = b.warna; ctx.beginPath(); ctx.moveTo(-.125, -.45); ctx.lineTo(.125, -.45); ctx.lineTo(.2, -.14); ctx.lineTo(-.2, -.14); ctx.closePath(); ctx.fill(); ctx.lineWidth = .017; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  else if (b.jenis === 'jaket') { line(ctx, 0, -.62, 0, -.27, .012, b.gelap || '#333'); }
}
// ===== orang(): gambar satu tokoh dari spesifikasi =====
function orang(ctx, spec, o) {
  const sp = Object.assign({}, spec); sp.aksesori = sp.aksesori || [];
  const b = sp.baju || { warna: '#6b7f94', jenis: 'kaos' };
  const sil = o.sil;
  const base = Object.assign({ hat: 'none', belt: false, shadow: false, cols: [b.warna, b.warna], sil }, o);
  if (!sil) base.face = Object.assign({}, sp.wajahDefault || { eyes: 'normal', mouth: 'flat' }, o.face || {});
  drawStick(ctx, base);
  const s = o.s, flip = o.flip || 1; ctx.save(); ctx.translate(o.x, o.y); ctx.scale(s * flip, s * (o.squash || 1)); ctx.rotate(o.lean || 0); ctx.translate(0, o.bob || 0);
  if (sil) { if (sp.aksesori.includes('tas')) _tas(ctx, sp, sil); ctx.restore(); return; }
  _baju(ctx, sp); if (sp.aksesori.includes('tas')) _tas(ctx, sp, null);
  const hx = 0, hy = -.765, hr = .19; ctx.translate(hx, hy); ctx.rotate(o.headTilt || 0); ctx.translate(-hx, -hy);
  _rambut(ctx, sp, hr, hy); circle(ctx, hx, hy, hr); fillStroke(ctx, null, .017);
  if (sp.aksesori.includes('kantungmata') || sp === SPEC_NAWI || sp.nama === 'Pak Nawi') { ctx.strokeStyle = 'rgba(110,95,90,.55)'; ctx.lineWidth = .008; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * .072, hy + .035, .034, .25, Math.PI - .25); ctx.stroke(); } }
  if (sp.aksesori.includes('kacamata')) _kacamata(ctx, sp, hy);
  ctx.restore();
}
// Pak Nawi (tokoh tetap)
const nawi = (ctx, o) => orang(ctx, SPEC_NAWI, o);

// ===== pose menganggur khas Pak Nawi (WAJIB di awal setiap reel) =====
// gaya: 'bengong' (berdiri melamun), 'duduk' (di kursi/bangku, dua tangan di lutut), 'hp' (menatap layar ponsel, cahaya biru di wajah), 'bersandar'
// kembalikan lampu tambahan (mis. cahaya ponsel) untuk dimasukkan ke pencahayaan()
function nawiMenganggur(ctx, t, o) {
  const g = o.gaya || 'bengong', s = o.s || 560, x = o.x, y = o.y, out = { lampu: [] };
  const napas = Math.sin(t * 1.3) * .004, geleng = Math.sin(t * .7) * .03;
  if (g === 'duduk') {
    // y = tinggi lantai; duduk pada dudukan setinggi .17 s. Badan turun .13 s, paha ke depan, betis ke bawah.
    nawi(ctx, { x, y: y + s * .13, s, flip: o.flip, bob: napas, headTilt: .1 + geleng, arms: { L: [.55, .95], R: [.5, .95] }, legs: { L: [1.5, -1.5], R: [1.46, -1.5] }, face: { eyes: 'half', mouth: 'flat', browAng: .25, look: [Math.sin(t * .5) * .5, .4] } });
  } else if (g === 'hp') {
    const hand = [x + (o.flip || 1) * .13 * s, y - .86 * s];
    nawi(ctx, { x, y, s, flip: o.flip, bob: napas, headTilt: .12, lean: .02, arms: { L: [.18, -.1], R: { ik: [.1 * (o.flip || 1), -.86] } }, face: { eyes: 'half', mouth: 'flat', browAng: .22, look: [0, .6] } });
    rrect(ctx, hand[0] - .035 * s, hand[1] - .06 * s, .07 * s, .12 * s, 6); ctx.fillStyle = '#d8f0ff'; ctx.fill();
    out.lampu.push({ x: hand[0], y: hand[1], r: .75 * s, kuat: .9, warna: '120,190,255', flick: false });
  } else if (g === 'bersandar') {
    nawi(ctx, { x, y, s, flip: o.flip, bob: napas, lean: -.07, headTilt: .08 + geleng, arms: { L: [.5, -1.25], R: [.5, -1.3] }, legs: { L: [.1, -.05], R: [.3, -.5] }, face: { eyes: 'half', mouth: 'flat', browAng: .2, look: [.6, .2] } });
  } else {
    nawi(ctx, { x, y, s, flip: o.flip, bob: napas, headTilt: .08 + geleng, lean: .02, arms: { L: [.14, -.1], R: [.14, -.1] }, face: { eyes: 'half', mouth: 'flat', browAng: .22, look: [Math.sin(t * .4) * .6, .5] } });
  }
  return out;
}
