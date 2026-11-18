import assert from "node:assert/strict";
import { chromium } from "playwright";
import { subtractionAssessment, subtractionPractice } from "../src/data/grade-one-subtraction.ts";

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
const base = "http://127.0.0.1:3000/kelas/matematika-dasar-kelas-1/materi/";

try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 768 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const button = name => page.getByRole("button", { name, exact: typeof name === "string" });
    const fill = (name, value) => page.getByRole("textbox", { name, exact: true }).fill(String(value));
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    // Bab 2 Penjumlahan diuji oleh scripts/smoke-grade-one-add10-v2.mjs.
    await page.goto(base + "pengurangan-sampai-dengan-10");
    await button(/^6\. D\. Soal Cerita Pengurangan/).click();
    await button(/^Latihan D\. Soal Cerita Pengurangan/).click();
    async function subtractAnswer(answer) {
      await fill("Jawaban pengurangan", answer);
      await button("Periksa jawaban").click();
    }
    for (const [index, q] of subtractionPractice.filter(item => item.section === "word").entries()) {
      await subtractAnswer(q.answer);
      await button(index === 0 ? "Soal berikutnya →" : "Lihat hasil").click();
    }
    for (const [index, q] of subtractionAssessment.entries()) {
      const advance = button(index === 23 ? "Lihat hasil" : "Soal berikutnya →");
      assert.equal(await advance.count(), 0);
      await subtractAnswer(index === 0 ? 0 : q.answer);
      assert.equal(await overflow(), false, `Bab 3 ${q.id} at ${width}`);
      await advance.click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Bab 3: ${width}px · 24 soal evaluasi · skor 96 (Bab 1 dan Bab 2 diuji di skrip masing-masing)`);
  }
} finally {
  await browser.close();
}
