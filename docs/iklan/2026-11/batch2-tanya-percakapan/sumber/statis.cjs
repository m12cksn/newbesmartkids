const { chromium } = require('playwright'); const fs = require('fs');
const shot = 'data:image/webp;base64,' + fs.readFileSync('mockup-pecahan.webp').toString('base64');
const logo = 'https://cdn.scalev.id/uploads/1770351441/0bmLuAafT-8qSTnfBVxh5A/1770351441636-logo_horizontal_transparent.webp';
const page = (sapa, ortu) => `<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet"><style>
*{margin:0;box-sizing:border-box}body{width:1080px;height:1350px;background:#dcefff;font-family:Poppins,sans-serif;color:#17352a;position:relative;overflow:hidden}
.lbl{font-size:30px;font-weight:700;color:#4f6b8a;margin:0 0 10px 10px}
.bub{display:inline-block;background:#fff;border-radius:46px;border-bottom-left-radius:10px;padding:36px 48px;font-size:72px;font-weight:800;line-height:1.1;box-shadow:0 14px 0 rgba(23,53,42,.1)}
.ortu{position:absolute;right:60px;top:440px;text-align:right}.ortu .b{display:inline-flex;gap:16px;background:#1c7ed6;border-radius:40px;border-bottom-right-radius:10px;padding:30px 40px}.ortu i{width:24px;height:24px;border-radius:50%;background:#fff;opacity:.7}
.hp{position:absolute;left:70px;top:430px;width:400px;border:12px solid #17352a;border-radius:52px;overflow:hidden;background:#fff;box-shadow:0 24px 50px rgba(0,0,0,.25);transform:rotate(-4deg)}.hp img{width:100%;display:block}
.kanan{position:absolute;left:520px;right:60px;top:640px}
.h{font-size:54px;font-weight:800;line-height:1.15}.s{margin-top:18px;font-size:32px;font-weight:600;line-height:1.4;color:#355a7a}
.harga{margin-top:26px;display:inline-block;background:#ffd34f;border-radius:20px;padding:14px 24px;font-size:34px;font-weight:800;color:#3f3210}
.kaki{position:absolute;left:60px;right:60px;bottom:50px;background:#fff;border-radius:28px;padding:18px 24px;display:flex;align-items:center;justify-content:space-between}
.kaki img{width:290px}.kaki b{background:#1c7ed6;color:#fff;border-radius:20px;padding:16px 28px;font-size:32px}
</style></head><body>
<div style="position:absolute;left:60px;top:60px"><div class="lbl">Anak</div><div class="bub">“${sapa}, kok<br>jawabannya begitu?”</div></div>
<div class="ortu"><div class="lbl">${ortu}</div><div class="b"><i></i><i></i><i></i></div></div>
<div class="hp"><img src="${shot}"></div>
<div class="kanan"><div class="h">Bahan untuk mendampingi belajar</div><div class="s">Buka peraganya bersama, bahas prosesnya, lalu coba latihan.</div><div class="harga">Paket SD Rp79.000, akses 1 tahun</div></div>
<div class="kaki"><img src="${logo}"><b>Lihat contoh materinya</b></div>
</body></html>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [f, s, o] of [['BSK_gambar_tanya-percakapan_hook1.png', 'Bu', 'Ibu'], ['BSK_gambar_tanya-percakapan_hook2.png', 'Yah', 'Ayah']]) { await p.setContent(page(s, o), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: f }); }
  await b.close(); })();
