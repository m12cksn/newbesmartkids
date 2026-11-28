// Membuat assets/logo/nawi-horor-story-logo.png (berwarna, transparan) dan watermark-nawi.png (putih, transparan ~18%)
// Jalankan: NODE_PATH=$(npm root -g) node buat_logo.cjs   (playwright dari kit stick-figure: NODE_PATH=/root/.claude/kit/node_modules)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = path.resolve(__dirname, '..', '..', 'assets', 'logo'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [mode, file] of [['warna', 'nawi-horor-story-logo.png'], ['watermark', 'watermark-nawi.png']]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
    await p.goto('file://' + path.join(__dirname, 'logo.html') + '#' + mode); await p.waitForFunction(() => window.READY);
    await p.screenshot({ path: path.join(out, file), omitBackground: true }); await p.close();
  }
  await b.close(); console.log('logo selesai ->', out);
})();
