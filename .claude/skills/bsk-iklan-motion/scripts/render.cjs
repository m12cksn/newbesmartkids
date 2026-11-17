#!/usr/bin/env node
/*
 * Render iklan motion HTML menjadi MP4 secara deterministik.
 * Semua animasi CSS/Web Animations di halaman dijeda lalu di-"seek" per frame,
 * jadi hasilnya sama persis setiap kali dirender (tidak bergantung kecepatan mesin).
 * Halaman boleh menyediakan window.seek(detik) untuk animasi berbasis JS (mis. penghitung angka).
 *
 * Pakai: node render.cjs <iklan.html> <keluar.mp4> [--detik 12] [--fps 30] [--w 1080] [--h 1920] [--musik file.mp3] [--draft]
 * --draft: hanya membuat lembar kontak (contact sheet) PNG di sebelah file keluar, untuk dicek sebelum render penuh.
 * Butuh: playwright (global, NODE_PATH=$(npm root -g)) dan ffmpeg.
 */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const [src, out] = args;
if (!src || !out) { console.error('Pakai: node render.cjs <iklan.html> <keluar.mp4> [--detik 12] [--fps 30] [--w 1080] [--h 1920] [--musik f.mp3] [--draft]'); process.exit(1); }
const fps = +opt('fps', 30), W = +opt('w', 1080), H = +opt('h', 1920), musik = opt('musik', null), draft = opt('draft', false);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const durHalaman = await p.evaluate(() => +(document.body.dataset.detik || 0));
  const detik = +opt('detik', durHalaman || 12);
  // jeda semua animasi
  await p.evaluate(() => { window.__seek = t => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; }); if (window.seek) window.seek(t); }; window.__seek(0); });
  const N = Math.ceil(detik * fps);
  const cdp = await p.context().newCDPSession(p);
  const shot = async t => { await p.evaluate(t => window.__seek(t), t); return Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 })).data, 'base64'); };
  if (draft) {
    const fs = require('fs'); const titik = Array.from({ length: 12 }, (_, i) => +(i * detik / 12 + detik / 24).toFixed(2));
    const dir = out.replace(/\.mp4$/, '') + '-draft'; fs.mkdirSync(dir, { recursive: true });
    for (const t of titik) fs.writeFileSync(`${dir}/t${String(t).padStart(5, '0')}.jpg`, await shot(t));
    console.log('draft', dir, titik.join(', ')); await b.close(); return;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ...(musik ? ['-i', musik] : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']),
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps),
    '-c:a', 'aac', '-b:a', '160k', ...(musik ? ['-af', `afade=t=out:st=${Math.max(0, detik - 1)}:d=1`] : []), '-t', (N / fps).toFixed(3), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < N; i++) { const img = await shot(i / fps); if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log('selesai', out, N, 'frame', (N / fps).toFixed(2) + 's');
})();
