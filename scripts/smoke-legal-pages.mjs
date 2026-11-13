import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/legal-pages-screenshots";
const wa = process.env.EXPECT_ADMIN_WA ?? "6285726321786";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}`); };
    await page.goto(`${origin}/`);
    const footer = page.getByRole("navigation", { name: "Informasi" });
    await footer.getByRole("link", { name: "Kebijakan Privasi" }).click(); await page.waitForURL(/\/kebijakan-privasi$/);
    await page.getByRole("heading", { name: "Kebijakan Privasi", level: 1 }).waitFor();
    for (const h of ["Belajar tanpa akun", "Data yang kami simpan untuk akun", "Kuki", "Hak orang tua dan siswa"]) await page.getByRole("heading", { name: new RegExp(h) }).waitFor();
    await page.getByRole("navigation", { name: "Daftar isi" }).getByRole("link", { name: "Kuki" }).click(); await page.waitForURL(/#kuki$/);
    await fit("privasi"); if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-privasi.png`, fullPage: true });
    await page.getByRole("navigation", { name: "Informasi" }).getByRole("link", { name: "Syarat Layanan" }).click(); await page.waitForURL(/\/syarat-layanan$/);
    await page.getByRole("heading", { name: "Syarat Layanan", level: 1 }).waitFor(); await page.getByRole("heading", { name: /Paket dan masa aktif/ }).waitFor();
    await fit("syarat"); if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-syarat.png`, fullPage: true });
    const waLinks = page.locator('a[href^="https://wa.me/"]');
    if (wa) { assert.ok((await waLinks.count()) >= 2); assert.match(await waLinks.first().getAttribute("href"), new RegExp(`^https://wa\\.me/${wa}\\?text=`)); }
    else { assert.equal(await waLinks.count(), 0); await page.getByText("melalui kontak yang Anda terima saat membeli paket").first().waitFor(); }
    await page.goto(`${origin}/masuk`); await page.getByText(/Belum punya akun\?/).first().waitFor();
    assert.equal(await page.locator('a[href^="https://wa.me/"]').count() > 0, Boolean(wa));
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS halaman kebijakan at ${width}px (WA admin ${wa ? "terpasang" : "belum diisi"})`);
  }
} finally { await browser.close(); }
