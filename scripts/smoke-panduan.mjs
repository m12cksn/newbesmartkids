// Uji browser halaman /panduan pada 320/390/768/1280 dan jalur klik dari footer, menu, halaman masuk.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/panduan-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1280, 800]]) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    // Jalur klik dari footer beranda
    await page.goto(`${origin}/`); await page.locator("footer").getByRole("link", { name: "Panduan", exact: true }).click(); await page.waitForURL(`${origin}/panduan`);
    await page.getByRole("heading", { level: 1, name: "Cara memakai BeSmartKids" }).waitFor();
    const video = await page.getByTestId("tutorial-video").count(), holder = await page.getByTestId("tutorial-placeholder").count();
    assert.equal(video + holder, 1, "video atau panel video");
    const box = await page.getByTestId(video ? "tutorial-video" : "tutorial-placeholder").boundingBox(); assert.ok(box.width > 200 && box.x >= 0 && box.x + box.width <= width, `video ${width}`);
    assert.equal(await page.locator("main ol > li").count(), 12, "12 langkah");
    for (const id of ["masuk", "belajar", "harian", "hasil"]) await page.locator(`#${id}`).waitFor();
    const q = page.locator("details").first(); await q.locator("summary").click(); assert.ok(await q.evaluate(d => d.open));
    await fit("panduan"); await page.screenshot({ path: `${folder}/${width}-panduan.png`, fullPage: true });
    // Dari halaman masuk
    await page.goto(`${origin}/masuk`); await page.getByRole("link", { name: "Lihat panduan" }).click(); await page.waitForURL(`${origin}/panduan`);
    // Dari menu utama (layar lebar)
    if (width >= 1024) { await page.goto(`${origin}/`); await page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: "Panduan" }).click(); await page.waitForURL(`${origin}/panduan`); }
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS panduan ${width}×${height}: video/panel muat, 12 langkah, pertanyaan, tanpa geser samping, tautan dari footer/masuk${width >= 1024 ? "/menu" : ""}`);
  }
} finally { await browser.close(); }
