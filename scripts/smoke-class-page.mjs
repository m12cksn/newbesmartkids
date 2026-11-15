import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Halaman kelas: bagian atas bergambar, urutan bab, kartu bab bergambar topik, bab gratis, tanpa scroll horizontal.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/class-page-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    // Jalur dari beranda: kartu kelas membuka halaman kelas.
    await page.goto(`${origin}/`);
    await page.locator('a[href="/kelas/pola-dan-strategi-kelas-4"]').first().click();
    await page.waitForURL(`${origin}/kelas/pola-dan-strategi-kelas-4`);
    await page.getByRole("heading", { level: 1, name: "Kelas 4" }).waitFor();
    const hero = page.getByRole("region", { name: "Kelas 4" });
    assert.ok(await hero.getByRole("img", { name: "Gambar matematika Kelas 4" }).isVisible());
    // Urutan bab naik dan setiap nomor menuju kartu yang ada.
    const steps = page.getByRole("navigation", { name: "Urutan bab" }).getByRole("link");
    const nums = (await steps.locator("span:first-child").allTextContents()).map(Number);
    assert.ok(nums.length >= 5); assert.deepEqual(nums, [...nums].sort((a, b) => a - b), "urutan bab naik");
    const cards = page.locator("#daftar-bab a[id^='bab-']");
    assert.equal(await cards.count(), nums.length);
    for (const n of nums) assert.equal(await page.locator(`#bab-${n}`).count(), 1, `kartu bab ${n}`);
    // Setiap kartu punya gambar topik, judul, dan tautan ke halaman bab.
    for (let i = 0; i < await cards.count(); i++) {
      const c = cards.nth(i);
      assert.ok(await c.locator("svg").first().isVisible(), `gambar kartu ${i + 1}`);
      assert.match(await c.getAttribute("href"), /^\/kelas\/pola-dan-strategi-kelas-4\/materi\/[a-z0-9-]+$/);
    }
    assert.equal(await page.getByText("Gratis dicoba").count(), 1, "hanya bab gratis yang bertanda");
    assert.match(await cards.first().textContent(), /Gratis dicoba/);
    // Tombol mulai membuka bab gratis.
    const start = page.getByRole("link", { name: /Mulai dari Bab 1/ });
    assert.equal(await start.getAttribute("href"), await cards.first().getAttribute("href"));
    const fit = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    assert.ok(fit, `scroll horizontal di ${width}px`);
    await page.screenshot({ path: `${folder}/${width}-kelas-4.png`, fullPage: true });
    // Klik nomor bab menggulir ke kartunya.
    await steps.nth(2).click(); await page.waitForTimeout(400);
    assert.ok(await page.locator(`#bab-${nums[2]}`).evaluate(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; }), "lompat ke kartu");
    // Kelas tanpa bab tetap rapi.
    await page.goto(`${origin}/kelas/persiapan-matematika-kelas-12`);
    await page.getByText("Bab Kelas 12 sedang disusun.").waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    // Kelas lain memakai gambar topik yang berbeda.
    await page.goto(`${origin}/kelas/strategi-matematika-kelas-9`);
    assert.equal(await page.locator("#daftar-bab a[id^='bab-']").count(), 4);
    await page.screenshot({ path: `${folder}/${width}-kelas-9.png`, fullPage: true });
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS halaman kelas ${width}px: gambar, urutan bab, ${nums.length} kartu, bab gratis, tanpa scroll horizontal`);
  }
} finally { await browser.close(); }
