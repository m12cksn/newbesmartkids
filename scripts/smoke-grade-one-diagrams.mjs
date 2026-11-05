import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { diagramAssessment, diagramPractice } from "../src/data/grade-one-diagrams.ts";

assert.equal(diagramAssessment.length, 24);
assert.equal(new Set(diagramAssessment.map(q => q.prompt)).size, 24);
for (const tier of ["sedang", "menantang", "sangat menantang"]) {
  assert.equal(diagramAssessment.filter(q => q.difficulty === tier).length, 8);
}
for (const q of [...diagramAssessment, ...Object.values(diagramPractice).flat()]) {
  assert.equal(new Set(q.rows.map(row => row.label)).size, q.rows.length);
  assert.ok(q.rows.every(row => Number.isInteger(row.count) && row.count >= 0));
  if (q.options) assert.equal(q.options.filter(value => value === q.answer).length, 1);
  else assert.ok(q.answer.trim());
  if (q.target) assert.equal(q.rows.find(row => row.label === q.target)?.count, Number(q.answer));
}

const screenshots = process.env.DIAGRAM_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 768 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const button = name => page.getByRole("button", { name, exact: true });
    const checkWidth = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const answer = async (q, value) => {
      if (q.worksheet === "marks" && q.target) {
        const first = button(`${q.target}: tanda 1`);
        await first.click();
        await first.click();
        assert.equal(await first.getAttribute("aria-pressed"), "false");
        for (let i = 1; i <= Number(value); i++) await button(`${q.target}: tanda ${i}`).click();
      } else if (q.target) await button(`${q.target}: tanda ${value}`).click();
      else if (q.options) await button(value).click();
      else await page.getByRole("textbox", { name: q.cell ? `Jumlah ${q.cell}` : "Jawaban" }).fill(value);
    };

    await page.goto("http://127.0.0.1:3000/kelas/matematika-dasar-kelas-1");
    await page.getByRole("link", { name: /Mengenal Diagram/ }).click();
    await page.getByRole("heading", { name: "Mengenal Diagram", exact: true }).waitFor();
    await button("Kuning").click();
    await page.getByText("Coba pilih kelompok dengan warna yang sama.").waitFor();
    await button("Merah").click();
    await page.getByText("Ada 1 bola merah.").waitFor();
    await button("Tabel").click();
    await button("Lihat tabel mendatar").click();
    await page.getByRole("columnheader", { name: "Hijau" }).waitFor();
    await checkWidth();
    await button("Diagram Gambar").click();
    await button("Bebek: tanda 4").click();
    await page.getByText("Tepat! Empat tanda mewakili empat bebek.").waitFor();

    for (const [name, questions] of Object.entries(diagramPractice)) {
      const title = { daftar: "Daftar", tabel: "Tabel", diagram: "Diagram Gambar" }[name];
      await button(title).click();
      await button(`Latihan ${title} →`).click();
      for (const [i, q] of questions.entries()) {
        await page.getByRole("heading", { name: q.prompt }).waitFor();
        assert.equal(await button("Periksa jawaban").isDisabled(), true);
        await answer(q, q.answer);
        await button("Periksa jawaban").click();
        await page.getByRole("status").getByText("Tepat!").waitFor();
        await checkWidth();
        await button(i === questions.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi Bab 8 →").click();
    for (const [i, q] of diagramAssessment.entries()) {
      await page.getByRole("heading", { name: q.prompt }).waitFor();
      const next = button(i === 23 ? "Lihat hasil" : "Lanjut →");
      assert.equal(await next.count(), 0);
      await answer(q, i === 0 ? "0" : q.answer);
      await checkWidth();
      if (screenshots && [390, 1280].includes(width)) {
        await page.getByRole("heading", { name: q.prompt }).locator("..").screenshot({ path: `${screenshots}/${width}-${i + 1}.png` });
      }
      await next.click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100").waitFor();
    await page.getByText("Bahas jawaban yang salah").click();
    await page.getByText("Jawabanmu 0. Jawaban benar 7.").waitFor();
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Bab 8: ${width}px · 44 latihan · 24 evaluasi · skor 96`);
  }
} finally {
  await browser.close();
}
