// Uji browser Mastering Jarimatika pada 320/390/768/1280: jalur dari beranda, peraga tiga cara jari,
// soal harian (isi, periksa, petunjuk, peragakan, tersimpan setelah dimuat ulang) dan level 3.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-mastering-jarimatika.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { dailyQuestions, wibDate } from "../src/lib/daily-jarimatika.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/mastering-jarimatika-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1280, 800]]) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = (g, n) => page.getByRole("radiogroup", { name: g, exact: true }).getByRole("radio", { name: String(n), exact: true });
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const next = async n => { for (let k = 0; k < n; k++) await button("Lanjut").click(); };
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { await page.screenshot({ path: `${folder}/${width}-${name}.png` }); };

    // Jalur dari beranda
    await page.goto(`${origin}/`);
    await page.getByRole("link", { name: "Latihan jarimatika" }).click();
    await page.getByRole("heading", { name: "Mastering Jarimatika", level: 1 }).waitFor();
    await page.getByText("Latihan hari ini").waitFor();
    await fit("awal");

    // Tempel jari 7 × 8
    assert.equal(await result(), "7x8:0");
    const handPos = () => page.evaluate(() => document.querySelector('#peraga [aria-label="Tangan kiri"]').parentElement.style.transform);
    const before = await handPos(); await next(1); assert.notEqual(await handPos(), before, "tangan harus bergeser saat jari dipertemukan");
    await next(3); assert.equal(await result(), "7x8:4"); await page.getByText("50 + 6 = 56. Jadi 7 × 8 = 56.").waitFor(); await page.getByText("5 × 10 = 50", { exact: true }).waitFor();
    await page.locator("#peraga").scrollIntoViewIfNeeded(); await shot("tempel");
    await page.getByRole("button", { name: "jari tengah tangan kiri, nilai 8" }).click(); assert.equal(await result(), "8x8:0");
    // Lipat jari 9 × 3, lalu ketuk jari ke-2
    await radio("Bilangan pertama", 9).click(); await radio("Bilangan kedua", 3).click(); assert.equal(await result(), "9x3:0");
    await page.getByText("Lipat jari untuk 9").first().waitFor(); await next(3); assert.equal(await result(), "9x3:3"); await shot("lipat");
    await page.getByRole("button", { name: "Jari ke-2", exact: true }).click(); assert.equal(await result(), "9x2:0");
    // Hitung loncat 3 × 7
    await radio("Bilangan pertama", 3).click(); await radio("Bilangan kedua", 7).click(); assert.equal(await result(), "3x7:0");
    await next(3); assert.equal(await result(), "3x7:3"); await page.getByText("7, 14, 21", { exact: true }).waitFor(); await shot("loncat");
    // Putar otomatis maju sendiri
    await button("Ulangi").click(); await button("Putar otomatis").click();
    await page.waitForFunction(() => document.querySelector('[data-testid="lab-result"]').dataset.value !== "3x7:0", null, { timeout: 4000 });
    await button("Jeda").click(); await fit("peraga");

    // Soal harian level 1
    const qs = dailyQuestions(wibDate(), 1);
    for (const [i, q] of qs.entries()) await page.getByTestId(`question-${i}`).locator("input:visible").fill(String(i === 0 ? q.answer + 1 : q.answer));
    await page.getByRole("button", { name: /Periksa jawaban/ }).click();
    await page.getByText("Benar 6, perlu diperbaiki 1, skor 86/100").waitFor();
    await page.getByTestId("question-0").getByRole("button", { name: "Cara jari" }).click();
    const [a, b] = qs[0].fact;
    await page.getByTestId("question-0").getByRole("button", { name: `Peragakan ${a} × ${b}` }).click();
    await page.waitForFunction(v => document.querySelector('[data-testid="lab-result"]').dataset.value === v, `${a}x${b}:0`);
    await page.waitForTimeout(600); const top = await page.locator("#peraga").boundingBox(); assert.ok(top.y < height && top.y + 40 > 0, `peraga tidak terlihat setelah Peragakan: ${top.y}`);
    await shot("hasil");
    // Tersimpan setelah dimuat ulang
    await page.reload(); await page.getByText("Latihan hari ini").waitFor(); await page.getByTestId("question-0").locator("input:visible").waitFor();
    assert.equal(await page.getByTestId("question-1").locator("input:visible").inputValue(), String(qs[1].answer));
    await page.getByTestId("question-0").locator("input:visible").fill(String(qs[0].answer));
    await page.getByRole("button", { name: /Periksa jawaban/ }).click(); await page.getByText("Hebat, lengkap dan tepat!").waitFor();

    // Level 3: bilangan yang hilang di posisi berbeda
    await page.getByRole("link", { name: /Level 3/ }).click(); await page.waitForURL(/level-3$/);
    const q3 = dailyQuestions(wibDate(), 3); assert.ok(q3.some(q => q.blank !== 2));
    await page.getByTestId("question-0").locator(`input:visible[aria-label^="Jawaban soal 1: ${[q3[0].blank === 0 ? "kosong" : q3[0].left]}"]`).waitFor();
    for (const [i, q] of q3.entries()) await page.getByTestId(`question-${i}`).locator("input:visible").fill(String(q.answer));
    await page.getByRole("button", { name: /Periksa jawaban/ }).locator("visible=true").click(); await page.getByText("Benar 7, perlu diperbaiki 0, skor 100/100").locator("visible=true").waitFor();
    await fit("level 3"); await shot("level3");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS mastering jarimatika di ${width}×${height}: beranda, tempel, lipat, loncat, putar otomatis, 7 soal, petunjuk dan peragakan, tersimpan, level 3`);
  }
} finally { await browser.close(); }
