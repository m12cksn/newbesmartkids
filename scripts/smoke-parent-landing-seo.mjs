import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";
const fail = m => { console.error("FAIL:", m); process.exit(1); };
const ok = (c, m) => { if (!c) fail(m); };

const robots = await (await fetch(`${BASE}/robots.txt`)).text();
ok(/Sitemap: .*\/sitemap\.xml/.test(robots) && /Disallow: \/admin/.test(robots) && /Disallow: \/akun/.test(robots), "robots.txt");
const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
ok(locs.length > 30, `sitemap terlalu sedikit (${locs.length})`);
for (const p of ["/kelas/strategi-matematika-kelas-9", "/kelas/strategi-matematika-kelas-9/materi/peluang-dan-pemilihan-sampel", "/kebijakan-privasi", "/mastering-perkalian-pembagian/level-3"]) ok(locs.some(l => l.endsWith(p)), `sitemap tanpa ${p}`);
ok(!locs.some(l => /\/(admin|akun|masuk|laporan)/.test(l)), "sitemap memuat halaman privat");
// semua URL sitemap (sampel) merespons 200
for (const l of locs.filter((_, i) => i % 7 === 0)) { const r = await fetch(BASE + new URL(l).pathname); ok(r.status === 200, `${l} -> ${r.status}`); }
console.log(`robots + sitemap ok (${locs.length} URL)`);

const b = await chromium.launch(), page = await b.newPage();
await page.goto(`${BASE}/kelas/strategi-matematika-kelas-9/materi/peluang-dan-pemilihan-sampel`);
ok(/Peluang/.test(await page.title()), "judul bab: " + await page.title());
const desc = await page.locator('meta[name="description"]').getAttribute("content");
ok(desc && desc.length > 40, "deskripsi bab");
ok(/\/materi\/peluang-dan-pemilihan-sampel$/.test(await page.locator('link[rel="canonical"]').getAttribute("href")), "canonical bab");
ok(await page.locator('meta[property="og:title"]').count() === 1, "og:title bab");
await page.goto(`${BASE}/kelas/strategi-matematika-kelas-9`);
ok(/Kelas 9/i.test(await page.title()), "judul kelas: " + await page.title());
console.log("metadata ok");

for (const w of [320, 390, 768, 1280]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(`${BASE}/`);
  const sec = page.locator("#paket");
  ok(await sec.getByRole("heading", { name: "Untuk orang tua" }).isVisible(), `judul paket ${w}`);
  const wa = sec.getByRole("link", { name: /Tanya harga/ });
  ok(/^https:\/\/wa\.me\/62\d+\?text=/.test(await wa.getAttribute("href")), "tautan WA");
  ok(!/Rp|\d+\.\d{3}/.test(await sec.innerText()), "ada harga yang dikarang");
  const q = sec.locator("details").first();
  ok(!(await q.evaluate(d => d.open)), "FAQ tertutup");
  await q.locator("summary").click(); ok(await q.evaluate(d => d.open), "FAQ terbuka");
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= w, `overflow ${sw} > ${w}`);
  if (w === 1280) { await page.getByRole("navigation").getByRole("link", { name: "Paket" }).first().click(); await page.waitForTimeout(400); ok(await sec.evaluate(e => Math.abs(e.getBoundingClientRect().top) < 120), "tautan Paket"); }
  await sec.screenshot({ path: `${process.env.SHOT_DIR || "/tmp"}/parent-${w}.png` });
  console.log(`homepage ${w}px ok`);
}
await b.close();
console.log("SEMUA OK");
