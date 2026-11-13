import assert from "node:assert/strict";
import { chromium } from "playwright";
import { additionQuestions } from "../src/data/grade-one-addition.ts";
import { additionPracticeQuestions } from "../src/data/grade-one-addition-practice.ts";
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
    await page.goto(base + "penjumlahan-sampai-dengan-10");
    await button(/^6\. Soal Cerita Penjumlahan/).click();
    await button(/^Latihan Soal Cerita Penjumlahan/).click();
    async function addAnswer(q, answer) {
      if (["story", "word"].includes(q.section)) {
        await fill("Bilangan kedua", q.b);
        await fill("Jumlah seluruhnya", answer);
      } else {
        await fill(["bond", "ten"].includes(q.section) ? "Bilangan yang hilang" : "Jawaban", answer);
      }
      await button("Periksa jawaban").click();
    }
    for (const [index, q] of additionPracticeQuestions.filter(item => item.section === "word").entries()) {
      await addAnswer(q, q.answer);
      await button(index === 0 ? "Berikutnya →" : "Mulai evaluasi akhir").click();
    }
    for (const [index, q] of additionQuestions.entries()) {
      const advance = button(index === 23 ? "Lihat hasil" : "Berikutnya →");
      assert.equal(await advance.count(), 0);
      await addAnswer(q, index === 0 ? 0 : q.answer);
      assert.equal(await overflow(), false, `Bab 2 ${q.id} at ${width}`);
      await advance.click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();

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
    console.log(`Bab 2–3: ${width}px · 48 soal evaluasi · skor 96 setiap bab (Bab 1 diuji di smoke-grade-one-counting-10)`);
  }
} finally {
  await browser.close();
}
