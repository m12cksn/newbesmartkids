import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Halaman paket belajar untuk orang tua: dapat dibuka dari beranda, demo tiga soal, tab jenjang, paket, FAQ, bar bawah di HP.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/landing-paket-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    const fit = async l => { const s = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, i: innerWidth })); assert.ok(s.s <= s.i, `overflow ${width} ${l} ${JSON.stringify(s)}`); };
    await page.goto(origin + "/");
    if (width >= 1024) await page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: "Paket", exact: true }).click();
    else await page.getByRole("link", { name: "Lihat paket belajar" }).click();
    await page.waitForURL(`${origin}/paket-belajar`);
    await page.getByRole("heading", { level: 1, name: /Anak bilang matematika itu susah/ }).waitFor();
    await fit("atas"); await page.screenshot({ path: `${folder}/${width}-hero.png` });
    // Demo: satu jawaban salah, dua benar.
    const demo = page.getByTestId("landing-demo");
    await demo.getByRole("button", { name: "Jawab 14" }).click(); await demo.getByText(/Belum tepat/).waitFor(); await demo.getByRole("button", { name: "Soal berikutnya" }).click();
    await demo.getByRole("button", { name: "Jawab 4" }).click(); await demo.getByText("Tepat!").waitFor(); await demo.getByRole("button", { name: "Soal berikutnya" }).click();
    await demo.getByRole("button", { name: "Jawab 6" }).click(); await demo.getByRole("button", { name: "Lihat hasil" }).click();
    await demo.getByText("2 / 3").waitFor();
    // Tab jenjang memakai bab sungguhan.
    await page.getByRole("tab", { name: "SMP" }).click(); await page.getByRole("tabpanel").getByRole("heading", { name: "Kelas 8" }).waitFor();
    await page.getByRole("tab", { name: "SMA" }).click(); await page.getByRole("tabpanel").getByRole("heading", { name: "Kelas 12" }).waitFor();
    assert.equal(await page.getByRole("tabpanel").getByRole("heading", { name: "Kelas 11" }).count(), 0, "kelas tanpa bab tidak ditampilkan");
    // Paket: SD, SMP, SMA, Semua Kelas.
    const paket = page.locator("#paket");
    for (const name of ["Paket Jenjang SD", "Paket Jenjang SMP", "Paket Jenjang SMA", "Paket Semua Kelas"]) await paket.getByRole("heading", { name }).waitFor();
    assert.equal(await paket.getByRole("link", { name: /^Pilih / }).count(), 4);
    const href = await paket.getByRole("link", { name: "Pilih SMA" }).getAttribute("href"); assert.ok(href && href.startsWith("http"), "tautan beli");
    await page.getByText("Bisa dicoba dulu?").click(); await page.getByText("Bab pertama setiap kelas dapat dibuka gratis tanpa akun.").waitFor();
    await fit("bawah"); await page.screenshot({ path: `${folder}/${width}-full.png`, fullPage: true });
    if (width < 768) { const bar = page.getByRole("link", { name: "Pilih paket", exact: true }); assert.ok(await bar.isVisible(), "bar bawah"); }
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS halaman paket ${width}px: tautan dari beranda, demo 3 soal, tab SD/SMP/SMA, 4 paket, FAQ, tanpa scroll horizontal`);
  }
} finally { await browser.close(); }
