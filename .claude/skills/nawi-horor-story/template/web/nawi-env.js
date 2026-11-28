// ===== NAWI HOROR STORY: set tempat, pencahayaan, bayangan =====
// Prinsip: tempat DIGAMBAR dengan tekstur dan benda berbentuk nyata, lalu diberi LAPISAN GELAP dengan "lubang" cahaya
// (pencahayaan()). Hasilnya gelap dan seram tetapi bentuk tetap terlihat. Setiap benda punya bayangan: bayangan kontak di lantai
// dan bayangan jatuh lembut di dinding. Siluet penuh hanya dipakai untuk sosok gaib sebagai aksen.
const SIL = '#05070c';
const pop = (t, t0, d = .4) => t < t0 ? 0 : backOut(clamp((t - t0) / d));
const fadeIn = (t, t0, d = .6) => clamp((t - t0) / d);
const flick = t => .86 + .09 * Math.sin(t * 21) + .05 * Math.sin(t * 37 + 1);
const push = (ctx, lt, dur, z0, z1, cx = 540, cy = 800) => { const z = lerp(z0, z1, clamp(lt / dur)); ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); };

// ---------- pencahayaan: gelap dengan lubang cahaya ----------
let _dkc = null;
function pencahayaan(ctx, o) {
  const m = ctx.getTransform(), sc = Math.hypot(m.a, m.b);
  if (!_dkc) { _dkc = document.createElement('canvas'); _dkc.width = W; _dkc.height = H; }
  const d = _dkc.getContext('2d'); d.setTransform(1, 0, 0, 1, 0, 0); d.globalCompositeOperation = 'source-over'; d.clearRect(0, 0, W, H);
  d.fillStyle = `rgba(${o.warnaGelap || '5,7,15'},${o.gelap == null ? .82 : o.gelap})`; d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const L = o.lampu || [];
  L.forEach(l => { const p = m.transformPoint(new DOMPoint(l.x, l.y)), r = l.r * sc * (l.flick === false ? 1 : flick(o.t || 0)), k = l.kuat == null ? 1 : l.kuat;
    const g = d.createRadialGradient(p.x, p.y, r * .05, p.x, p.y, r); g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(.45, `rgba(0,0,0,${k * .6})`); g.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = g; d.fillRect(p.x - r, p.y - r, r * 2, r * 2); });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(_dkc, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  L.forEach(l => { const p = m.transformPoint(new DOMPoint(l.x, l.y)), r = l.r * sc * (l.flick === false ? 1 : flick(o.t || 0)), c = l.warna || '255,176,80';
    const g = ctx.createRadialGradient(p.x, p.y, r * .03, p.x, p.y, r * .9); g.addColorStop(0, `rgba(${c},${.32 * (l.kuat == null ? 1 : l.kuat)})`); g.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g; ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2); });
  ctx.restore();
}
function vignetteDark(ctx, a = .5) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createRadialGradient(540, 900, 260, 540, 960, 1150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// bayangan kontak di lantai
function bayanganLantai(ctx, x, y, w, a = .45) { ctx.save(); const g = ctx.createRadialGradient(x, y, 2, x, y, w); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.translate(x, y); ctx.scale(1, .16); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.fillRect(x - w, y - w, w * 2, w * 2); ctx.restore(); }
// bayangan jatuh lembut di dinding: gambar ulang bentuk dengan fungsi gambar(ctx) berwarna hitam, digeser menjauhi cahaya
function bayanganDinding(ctx, gambar, dx, dy, a = .5, blur = 14, skala = 1.04, pusat = [540, 900]) {
  ctx.save(); ctx.globalAlpha = a; ctx.filter = `blur(${blur}px)`; ctx.translate(pusat[0] + dx, pusat[1] + dy); ctx.scale(skala, skala); ctx.translate(-pusat[0], -pusat[1]); gambar(ctx); ctx.restore();
}

// ---------- tekstur ----------
function dindingPapan(ctx, x0, y0, w, h, seed = 3, warna = [58, 40, 28]) {
  const R = rng(seed); let x = x0; ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
  while (x < x0 + w) { const pw = 86 + R() * 46, v = (R() - .5) * 18, c = `rgb(${warna[0] + v | 0},${warna[1] + v * .8 | 0},${warna[2] + v * .6 | 0})`; ctx.fillStyle = c; ctx.fillRect(x, y0, pw, h);
    ctx.lineWidth = 1.5; for (let k = 0; k < 18; k++) { const gx = x + 6 + R() * (pw - 12); ctx.strokeStyle = `rgba(20,10,5,${.08 + R() * .12})`; ctx.beginPath(); ctx.moveTo(gx, y0); ctx.bezierCurveTo(gx + (R() - .5) * 8, y0 + h * .3, gx + (R() - .5) * 8, y0 + h * .6, gx + (R() - .5) * 6, y0 + h); ctx.stroke(); }
    if (R() > .55) { const ky = y0 + R() * h, kx = x + pw * (.3 + R() * .4); ctx.beginPath(); ctx.ellipse(kx, ky, 9, 16, 0, 0, TAU); ctx.fillStyle = 'rgba(20,10,5,.35)'; ctx.fill(); ctx.strokeStyle = 'rgba(20,10,5,.5)'; ctx.stroke(); }
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x + pw - 3, y0, 3, h); ctx.fillStyle = 'rgba(255,230,190,.05)'; ctx.fillRect(x, y0, 3, h);
    [.12, .5, .88].forEach(f => { circle(ctx, x + pw * .5, y0 + h * f, 2.4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill(); }); x += pw; }
  ctx.restore();
}
function lantaiPapan(ctx, x0, y0, w, h, seed = 5, warna = [44, 30, 20]) {
  const R = rng(seed); ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); let y = y0;
  while (y < y0 + h) { const ph = 34 + R() * 20, v = (R() - .5) * 14; ctx.fillStyle = `rgb(${warna[0] + v | 0},${warna[1] + v | 0},${warna[2] + v | 0})`; ctx.fillRect(x0, y, w, ph); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x0, y + ph - 2, w, 2);
    for (let k = 0; k < 14; k++) { const gx = x0 + R() * w; ctx.strokeStyle = `rgba(15,8,4,${.08 + R() * .1})`; ctx.beginPath(); ctx.moveTo(gx, y + 3); ctx.lineTo(gx + 40 + R() * 90, y + ph - 4); ctx.stroke(); }
    const sx = x0 + R() * w; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(sx, y, 2, ph); y += ph; }
  const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h * .5); ctx.restore();
}
function dindingPlester(ctx, x0, y0, w, h, seed = 7, warna = [86, 82, 74]) {
  const R = rng(seed); ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip(); ctx.fillStyle = `rgb(${warna.join(',')})`; ctx.fillRect(x0, y0, w, h);
  for (let i = 0; i < 40; i++) { const x = x0 + R() * w, y = y0 + R() * h, r = 40 + R() * 160; const g = ctx.createRadialGradient(x, y, 2, x, y, r); const dk = R() > .5; g.addColorStop(0, dk ? 'rgba(20,16,10,.16)' : 'rgba(255,245,220,.05)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.strokeStyle = 'rgba(20,14,8,.5)'; ctx.lineWidth = 2; for (let i = 0; i < 2; i++) { let x = x0 + R() * w, y = y0; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 7; k++) { x += (R() - .5) * 40; y += 40 + R() * 60; ctx.lineTo(x, y); } ctx.stroke(); }
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x0, y0 + h - 60, w, 60); ctx.restore();
}
function tanahJalan(ctx, y0, seed = 4) { const R = rng(seed); ctx.save(); const g = ctx.createLinearGradient(0, y0, 0, H); g.addColorStop(0, '#2b241d'); g.addColorStop(1, '#17120e'); ctx.fillStyle = g; ctx.fillRect(-100, y0, W + 200, H - y0);
  for (let i = 0; i < 90; i++) { const x = R() * W, y = y0 + 10 + R() * (H - y0 - 20), r = 3 + R() * 8; ctx.beginPath(); ctx.ellipse(x, y, r, r * .5, 0, 0, TAU); ctx.fillStyle = `rgba(${90 + R() * 40 | 0},${80 + R() * 30 | 0},${68 + R() * 25 | 0},${.12 + R() * .15})`; ctx.fill(); } ctx.restore(); }

// ---------- benda ----------
function lampuMinyakR(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const f = flick(t);
  rrect(ctx, -34, -24, 68, 24, 8); const bg = ctx.createLinearGradient(-34, 0, 34, 0); bg.addColorStop(0, '#3a2a1c'); bg.addColorStop(.5, '#6d4f33'); bg.addColorStop(1, '#2b1d12'); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = '#120b06'; ctx.lineWidth = 3; ctx.stroke();
  rrect(ctx, -8, -34, 16, 12, 3); ctx.fillStyle = '#8a6a3c'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, -34); ctx.quadraticCurveTo(-36, -84, -15, -118); ctx.lineTo(15, -118); ctx.quadraticCurveTo(36, -84, 22, -34); ctx.closePath(); const gg = ctx.createLinearGradient(-30, 0, 30, 0); gg.addColorStop(0, 'rgba(255,214,150,.18)'); gg.addColorStop(.5, 'rgba(255,230,180,.38)'); gg.addColorStop(1, 'rgba(255,214,150,.15)'); ctx.fillStyle = gg; ctx.fill(); ctx.strokeStyle = 'rgba(40,28,20,.85)'; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -70, 9 * f, 32 * f, 0, 0, TAU); ctx.fillStyle = '#ffcf7a'; ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -62, 4, 17 * f, 0, 0, TAU); ctx.fillStyle = '#fff3d0'; ctx.fill(); ctx.restore();
}
function kursiR(ctx, x, y, s, o = {}) { // kursi kayu kecil dengan bayangan
  const a = o.a == null ? 1 : o.a; if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  bayanganLantai(ctx, 0, 6, 70, .5);
  const wood = ctx.createLinearGradient(-34, 0, 34, 0); wood.addColorStop(0, '#4a3321'); wood.addColorStop(.5, '#6b4a2f'); wood.addColorStop(1, '#3a2717');
  ctx.fillStyle = wood; ctx.strokeStyle = '#120b06'; ctx.lineWidth = 3;
  rrect(ctx, -30, -140, 12, 90, 4); ctx.fill(); ctx.stroke(); rrect(ctx, 18, -140, 12, 90, 4); ctx.fill(); ctx.stroke(); rrect(ctx, -30, -140, 60, 16, 4); ctx.fill(); ctx.stroke(); rrect(ctx, -30, -112, 60, 10, 3); ctx.fill(); ctx.stroke();
  rrect(ctx, -36, -62, 72, 16, 4); ctx.fill(); ctx.stroke(); rrect(ctx, -30, -46, 10, 48, 3); ctx.fill(); ctx.stroke(); rrect(ctx, 20, -46, 10, 48, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,225,170,.12)'; ctx.fillRect(-36, -62, 72, 4); ctx.restore();
}
function mejaR(ctx, x, y, w, h = 36, t = 0) { // y = permukaan atas
  ctx.save(); bayanganLantai(ctx, x + w / 2, y + 330, w * .6, .5);
  const wood = ctx.createLinearGradient(0, y, 0, y + h + 60); wood.addColorStop(0, '#6b4a2f'); wood.addColorStop(1, '#2b1b10'); ctx.fillStyle = wood; ctx.strokeStyle = '#120b06'; ctx.lineWidth = 3;
  rrect(ctx, x, y, w, h, 8); ctx.fill(); ctx.stroke(); ctx.fillRect(x + 20, y + h, w - 40, 26); rrect(ctx, x + 26, y + h, 30, 300, 4); ctx.fill(); ctx.stroke(); rrect(ctx, x + w - 56, y + h, 30, 300, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,225,170,.13)'; ctx.fillRect(x + 8, y + 2, w - 16, 5); ctx.restore();
}
function pintuR(ctx, x, y, w, h, o = {}) { // pintu kayu; o.buka 0..1; o.celah warna cahaya di bawah/samping
  ctx.save(); const op = o.buka || 0; rrect(ctx, x - 14, y - 14, w + 28, h + 14, 4); ctx.fillStyle = '#1c130c'; ctx.fill();
  ctx.fillStyle = '#050403'; ctx.fillRect(x, y, w, h);
  const pw = w * (1 - op * .85); const g = ctx.createLinearGradient(x, 0, x + pw, 0); g.addColorStop(0, '#4c3524'); g.addColorStop(1, '#33241a'); ctx.fillStyle = g; ctx.fillRect(x, y, pw, h);
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 3; ctx.strokeRect(x + 14, y + 16, pw - 28, h * .42); ctx.strokeRect(x + 14, y + h * .52, pw - 28, h * .42);
  circle(ctx, x + pw - 22, y + h * .5, 7); ctx.fillStyle = '#b8964a'; ctx.fill();
  if (o.celah) { const c = o.celah; ctx.fillStyle = `rgba(${c},.55)`; ctx.fillRect(x + 6, y + h - 6, pw - 12, 6); }
  ctx.restore();
}
function jendelaR(ctx, x, y, w, h, o = {}) { // jendela dengan sinar bulan (berkas ke bawah)
  ctx.save(); rrect(ctx, x - 12, y - 12, w + 24, h + 24, 4); ctx.fillStyle = '#2a1d12'; ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, o.langit || '#1e2a46'); g.addColorStop(1, '#0d1222'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  if (o.bulan) { glowAt(ctx, x + w * .7, y + h * .3, 110, '170,190,230', .8); circle(ctx, x + w * .7, y + h * .3, 18); ctx.fillStyle = '#e8edf8'; ctx.fill(); }
  ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke(); ctx.restore();
}
function tiraiRobek(ctx, x, y, w, h, t, warna = '#5a3b34') { ctx.save(); ctx.fillStyle = warna; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); for (let i = 0; i <= 8; i++) ctx.lineTo(x + w - i * w / 8, y + h + Math.sin(t * 1.2 + i) * 6 + (i % 2) * 18); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let i = 1; i < 6; i++) ctx.fillRect(x + i * w / 6, y, 3, h); ctx.restore(); }
function bukuR(ctx, x, y, w, o = {}) { const a = o.a == null ? 1 : o.a; if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(o.rot || 0); const h = w * 1.3;
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-w / 2 + 5, -h / 2 + 6, w, h); rrect(ctx, -w / 2, -h / 2, w, h, 5); const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#c9bb98'); g.addColorStop(1, '#ece0c2'); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#1a130d'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = o.warna || '#7a1e1e'; ctx.fillRect(-w / 2 + 6, -h * .3, w - 12, h * .17); ctx.restore(); }
function kertasR(ctx, x, y, w, h, rot = 0, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 12, w, h); const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#efe3c0'); g.addColorStop(1, '#d9c9a0'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = '#3a2c1a'; ctx.lineWidth = 3; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore(); }
function ink(ctx, str, x, y, size, a = 1, col = '#2a1c10', align = 'center') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; text(ctx, str, x, y, size, col, '#000', 0, 'Poppins', 700, align); ctx.restore(); }
function glowAt(ctx, x, y, r, col = '255,186,90', a = 1) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, r * .04, x, y, r); g.addColorStop(0, `rgba(${col},${.6 * a})`); g.addColorStop(.35, `rgba(${col},${.2 * a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
function moonD(ctx, x, y, r, a = 1) { glowAt(ctx, x, y, r * 4.5, '170,190,230', .55 * a); ctx.save(); ctx.globalAlpha = a; circle(ctx, x, y, r); ctx.fillStyle = '#dfe5f2'; ctx.fill(); ctx.globalAlpha = a * .25; circle(ctx, x - r * .25, y - r * .1, r * .35); ctx.fillStyle = '#9aa6bf'; ctx.fill(); ctx.restore(); }
function mistLayer(ctx, t, y, h, a, spd = 12, seed = 1) { ctx.save(); const R = rng(seed); for (let i = 0; i < 7; i++) { const x = ((R() * 1600 + t * spd * (.6 + R() * .8)) % 1600) - 260, ry = h * (.5 + R() * .6), rx = 280 + R() * 260; const g = ctx.createRadialGradient(x, y, 10, x, y, rx); g.addColorStop(0, `rgba(180,195,225,${a})`); g.addColorStop(1, 'rgba(180,195,225,0)'); ctx.fillStyle = g; ctx.save(); ctx.translate(0, y); ctx.scale(1, ry / rx); ctx.translate(0, -y); ctx.fillRect(x - rx, y - rx, rx * 2, rx * 2); ctx.restore(); } ctx.restore(); }
function pohonKaret(ctx, x, base, h, sway, w = 30) { // batang bertekstur dengan bekas sadapan dan mangkuk penampung
  ctx.save(); const topx = x + sway * 8 + (x % 7 - 3) * 5; const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#0e0c0b'); g.addColorStop(.45, '#2a2420'); g.addColorStop(1, '#0a0908');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w / 2, base); ctx.quadraticCurveTo(x - w * .3 + sway * 3, base - h * .5, topx - w * .22, base - h); ctx.lineTo(topx + w * .22, base - h); ctx.quadraticCurveTo(x + w * .3 + sway * 3, base - h * .5, x + w / 2, base); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,110,100,.22)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { const yy = base - 100 - i * 38; ctx.beginPath(); ctx.moveTo(x - w * .4, yy); ctx.lineTo(x + w * .3, yy + 16); ctx.stroke(); }
  ctx.fillStyle = '#17110d'; ctx.beginPath(); ctx.ellipse(x + w * .45, base - 90, 12, 8, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0a0908'; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const by = base - h * (.62 + i * .13), s = (i % 2 ? -1 : 1); ctx.lineWidth = w * .3; ctx.beginPath(); ctx.moveTo(x + sway * 4, by); ctx.quadraticCurveTo(x + s * 60, by - 30, x + s * (90 + i * 14) + sway * 10, by - 70); ctx.stroke(); }
  ctx.fillStyle = '#0a0b0a'; for (let i = 0; i < 4; i++) { circle(ctx, topx + (i - 1.5) * 38 + sway * 8, base - h - 18 - (i % 2) * 22, 40 + (i % 3) * 8); ctx.fill(); } ctx.restore(); }

// ---------- set tempat (mengembalikan {lampu:[...], lantai:y}) ----------
// Setiap set menggambar tempat lengkap dengan tekstur. Panggil, gambar tokoh dan benda tambahan, lalu pencahayaan(ctx,{lampu:L.lampu,t}).
function setTeras(ctx, t) { // teras rumah kontrakan malam hari
  bgNightFill(ctx, '#0a0e1a', '#141826');
  dindingPlester(ctx, 0, 120, 700, 960, 11, [92, 86, 76]);
  jendelaR(ctx, 120, 360, 200, 260, { bulan: true }); tiraiRobek(ctx, 112, 352, 216, 120, t);
  pintuR(ctx, 470, 400, 180, 640, { celah: '255,190,100' });
  ctx.fillStyle = '#17120e'; ctx.fillRect(0, 1040, W, H - 1040); lantaiPapan(ctx, 0, 1040, W, H - 1040, 6, [58, 56, 52]);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 1034, W, 8);
  // bohlam menggantung dan cahaya
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(380, 120); ctx.lineTo(380, 250); ctx.stroke(); circle(ctx, 380, 268, 20); ctx.fillStyle = '#ffe3a0'; ctx.fill();
  // sisi kanan: halaman gelap dengan tiang lampu jauh
  ctx.fillStyle = '#07090f'; ctx.fillRect(700, 120, 400, 920); moonD(ctx, 930, 300, 46, .55); ctx.fillStyle = '#05070b'; ctx.fillRect(900, 520, 12, 520); glowAt(ctx, 906, 520, 160, '255,210,140', .35);
  return { lampu: [{ x: 380, y: 268, r: 760, kuat: 1 }, { x: 930, y: 300, r: 420, kuat: .35, warna: '150,170,220', flick: false }], lantai: 1090 };
}
function setWarung(ctx, t) { // warung kayu di kampung
  bgNightFill(ctx, '#0c0a08', '#17110c'); dindingPapan(ctx, 0, 0, W, 1100, 21, [60, 42, 28]);
  mejaR(ctx, 40, 880, 620, 40); ctx.fillStyle = '#0a0705'; ctx.fillRect(0, 1100, W, H - 1100); lantaiPapan(ctx, 0, 1100, W, H - 1100, 9, [40, 28, 19]);
  for (let i = 0; i < 7; i++) { const x = 90 + i * 85, y = 560 + (i % 2) * 20; ctx.fillStyle = ['#a33','#38a','#da3','#3a6'][i % 4]; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.2 + i) * .03); ctx.fillRect(-18, 0, 36, 52); ctx.restore(); line(ctx, x, 300, x, y, 2, '#1a1510'); }
  ctx.fillStyle = '#3a2a1c'; ctx.fillRect(700, 300, 330, 560); kertasR(ctx, 860, 520, 230, 320, .02);
  return { lampu: [{ x: 240, y: 520, r: 780, kuat: 1 }], lantai: 1160 };
}
function setRuangTamu(ctx, t) { // ruang tamu rumah kayu dengan pintu kamar belakang di kanan
  bgNightFill(ctx, '#0a0807', '#150f0b'); dindingPapan(ctx, 0, 0, W, 1040, 31, [56, 38, 26]);
  pintuR(ctx, 800, 360, 190, 680, { celah: '120,150,200' });
  ctx.fillStyle = '#080605'; ctx.fillRect(0, 1040, W, H - 1040); lantaiPapan(ctx, 0, 1040, W, H - 1040, 13, [46, 32, 22]);
  return { lampu: [{ x: 440, y: 900, r: 860, kuat: 1 }], lantai: 1100 };
}
function setJalanKaret(ctx, t) { // jalan tanah di kebun karet, bulan dan kabut
  const g = ctx.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, '#05070f'); g.addColorStop(1, '#1a1c30'); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, 1400); moonD(ctx, 820, 300, 62, .65);
  for (let i = 0; i < 10; i++) pohonKaret(ctx, 40 + i * 118 + (i % 2) * 28, 1180, 620 + (i % 3) * 120, Math.sin(t * .7 + i), 32);
  mistLayer(ctx, t, 1120, 120, .16, 14, 5); tanahJalan(ctx, 1170, 4);
  return { lampu: [{ x: 820, y: 300, r: 1300, kuat: .55, warna: '150,170,220', flick: false }], lantai: 1215 };
}
function bgNightFill(ctx, a, b) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// ---------- kartu akhir (teks lanjutan) ----------
// mode: 'reel' -> "Lanjut reel N di Nawi Horor Story"; 'part' -> "Bersambung. Lanjut Part N di Nawi Horor Story"; 'tamat' -> "Tamat. Cerita lain di Nawi Horor Story"
function kartuAkhir(ctx, t, t0, mode, n) {
  const a = fadeIn(t, t0, .9); if (a <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const bg = ctx.createLinearGradient(0, 980, 0, 1260); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(1, `rgba(0,0,0,${.7 * a})`); ctx.fillStyle = bg; ctx.fillRect(0, 980, W, 300);
  const L = mode === 'tamat' ? ['TAMAT', 'Cerita lain di Nawi Horor Story'] : mode === 'part' ? ['BERSAMBUNG', 'Lanjut Part ' + n + ' di Nawi Horor Story'] : ['Lanjut reel ' + n, 'di Nawi Horor Story'];
  ctx.globalAlpha = a; text(ctx, L[0], 540, 1090, 74, mode === 'reel' ? '#e8e4dc' : '#d83a3a', '#000', 10, 'Poppins', 700); text(ctx, L[1], 540, 1175, 40, '#e8e4dc', '#000', 7, 'Poppins', 700); ctx.restore();
}
