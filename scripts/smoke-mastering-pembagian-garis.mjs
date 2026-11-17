// Uji browser Mastering Pembagian Garis pada 320/390/768/1280: jalur dari beranda, peraga coret dan ikat garis
// (sisa pindah kolom, isian soal, soal acak, putar otomatis), soal harian (isi, periksa, petunjuk, peragakan,
// tersimpan setelah dimuat ulang) dan level 3.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-mastering-pembagian-garis.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { dailyQuestions, wibDate } from "../src/lib/daily-pembagian-garis.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/mastering-pembagian-garis-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1280, 800]]) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const divisor = n => page.getByRole("radiogroup", { name: "Pembagi", exact: true }).getByRole("radio", { name: String(n), exact: true });
    const dividend = () => page.getByRole("textbox", { name: "Bilangan yang dibagi" });
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const next = async n => { for (let k = 0; k < n; k++) await button("Lanjut").click(); };
    const text = id => page.getByTestId(id).textContent();
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { await page.screenshot({ path: `${folder}/${width}-${name}.png` }); };

    // Jalur dari beranda
    await page.goto(`${origin}/`);
    await page.getByRole("link", { name: "Latihan pembagian garis" }).click();
    await page.getByRole("heading", { name: "Mastering Pembagian Garis", level: 1 }).waitFor();
    await page.getByText("Latihan hari ini").waitFor();
    await fit("awal");

    // Peraga 756 : 3 seperti contoh sumber
    assert.equal(await result(), "84:4:0");
    await dividend().fill("756"); await divisor(3).click(); assert.equal(await result(), "756:3:0");
    assert.equal(await page.locator("#peraga [data-bundle]").count(), 3 + 5 + 2, "ikatan dan sisa 756 : 3");
    await next(2); assert.equal(await text("hasil-0"), "2"); await page.getByText("Sisa 1, pindah ke kanan jadi 10").waitFor();
    await next(1); assert.equal(await text("atas-1"), "15"); await page.getByText("Ditambah 5, jadi ada 15 garis.").waitFor();
    await next(4); assert.equal(await result(), "756:3:7");
    assert.deepEqual([await text("hasil-0"), await text("hasil-1"), await text("hasil-2")], ["2", "5", "2"]);
    await page.getByText("Jadi 756 : 3 = 252.").waitFor();
    await page.locator("#peraga").scrollIntoViewIfNeeded(); await shot("peraga");
    // Isian tidak habis dibagi ditolak, peraga tetap pada soal terakhir
    await dividend().fill("757"); await page.getByText("757 tidak habis dibagi 3. Coba bilangan lain.", { exact: false }).waitFor(); assert.equal(await result(), "756:3:7");
    // Soal acak dan putar otomatis
    await button("Soal acak").click(); assert.notEqual(await result(), "756:3:7");
    await button("Putar otomatis").click();
    const start = await result();
    await page.waitForFunction(v => document.querySelector('[data-testid="lab-result"]').dataset.value !== v, start, { timeout: 4000 });
    await button("Jeda").click(); await fit("peraga");

    // Soal harian level 1
    const qs = dailyQuestions(wibDate(), 1);
    for (const [i, q] of qs.entries()) await page.getByTestId(`question-${i}`).locator('input[aria-label^="Jawaban soal"]:visible').fill(String(i === 0 ? q.answer + 1 : q.answer));
    await page.getByRole("button", { name: /Periksa jawaban/ }).click();
    await page.getByText("Benar 6, perlu diperbaiki 1, skor 86/100").waitFor();
    // Peraga di bawah soal: murid sendiri yang mencoret, mengikat dan menulis hasil, tanpa jawaban otomatis
    const [n, q] = qs[0].fact, row = page.getByTestId("question-0"), wrong = String(qs[0].answer + 1);
    await row.getByRole("button", { name: "Tampilkan peraga" }).click();
    const box = row.getByTestId("peraga-latihan"); await box.waitFor();
    const d0 = Number(String(n)[0]), place = (await box.getByTestId("latihan-kolom-0").getAttribute("aria-label")).replace("Kolom ", "");
    for (let k = 0; k < d0; k++) await box.getByRole("button", { name: `Tambah garis kolom ${place}` }).click();
    for (let k = 0; k < Math.floor(d0 / q); k++) await box.getByRole("button", { name: `Ikat ${q} garis kolom ${place}` }).click();
    assert.ok(await box.getByRole("button", { name: `Ikat ${q} garis kolom ${place}` }).isDisabled(), "tidak bisa mengikat kurang dari pembagi");
    assert.equal(await box.getByTestId("latihan-kolom-0").locator('[data-ikat="ya"]').count(), Math.floor(d0 / q));
    assert.equal(await box.getByRole("textbox", { name: `Banyak ikatan kolom ${place}` }).inputValue(), "", "hasil kolom tidak diisi otomatis");
    await box.getByRole("textbox", { name: `Banyak ikatan kolom ${place}` }).fill(String(Math.floor(d0 / q)));
    assert.equal(await row.locator('input[aria-label^="Jawaban soal"]:visible').inputValue(), wrong, "peraga tidak mengisi jawaban");
    await box.scrollIntoViewIfNeeded(); await shot("hasil");
    // Tersimpan setelah dimuat ulang
    await page.reload(); await page.getByText("Latihan hari ini").waitFor(); await page.getByTestId("question-0").locator('input[aria-label^="Jawaban soal"]:visible').waitFor();
    assert.equal(await page.getByTestId("question-1").locator('input[aria-label^="Jawaban soal"]:visible').inputValue(), String(qs[1].answer));
    await page.getByTestId("question-0").getByRole("button", { name: "Tampilkan peraga" }).click();
    await page.getByTestId("question-0").locator('input[aria-label^="Jawaban soal"]:visible').fill(String(qs[0].answer));
    await page.getByTestId("question-0").getByTestId("peraga-latihan").waitFor();
    await page.getByRole("button", { name: /Periksa jawaban/ }).click(); await page.getByText("Hebat, lengkap dan tepat!").waitFor();

    // Level 3: bilangan yang hilang di posisi berbeda
    await page.getByRole("link", { name: /Level 3/ }).click(); await page.waitForURL(/level-3$/);
    await page.getByTestId("lab-result").locator("visible=true").waitFor();
    assert.equal(await page.locator('#peraga:visible [role="status"]').count(), 0, "soal awal level 3 harus valid");
    const q3 = dailyQuestions(wibDate(), 3); assert.ok(q3.some(x => x.blank !== 2));
    await page.getByTestId("question-0").locator(`input:visible[aria-label^="Jawaban soal 1: ${[q3[0].blank === 0 ? "kosong" : q3[0].left]}"]`).waitFor();
    for (const [i, x] of q3.entries()) await page.getByTestId(`question-${i}`).locator('input[aria-label^="Jawaban soal"]:visible').fill(String(x.answer));
    await page.getByRole("button", { name: /Periksa jawaban/ }).locator("visible=true").click(); await page.getByText("Benar 7, perlu diperbaiki 0, skor 100/100").locator("visible=true").waitFor();
    await fit("level 3"); await shot("level3");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS mastering pembagian garis di ${width}×${height}: beranda, 756 : 3, sisa pindah kolom, isian salah, soal acak, putar otomatis, 7 soal, peraga di soal, tersimpan, level 3`);
  }
} finally { await browser.close(); }
