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
  // Beranda hanya untuk belajar: tanpa bagian harga dan tanpa menu Paket.
  ok(await page.locator("#paket").count() === 0, "bagian paket masih ada");
  ok(await page.getByRole("navigation").getByRole("link", { name: "Paket" }).count() === 0, "menu Paket masih ada");
  ok(!/Rp\s?\d/.test(await page.locator("main").innerText()), "harga tampil di beranda");
  ok(await page.locator("#kelas").count() === 1, "daftar kelas");
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= w, `overflow ${sw} > ${w}`);
  console.log(`homepage ${w}px ok`);
}
await b.close();
console.log("SEMUA OK");
