import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import {assessment, practice, totalCells} from "../src/data/grade-four-measurement.ts";

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_EXECUTABLE});
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const shots = process.env.CHAPTER_SCREENSHOTS;
if (shots) await mkdir(shots, {recursive: true});

try {
  for (const width of [320,390,768,1280]) {
    const page = await browser.newPage({viewport: {width, height: 900}});
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const button = name => page.getByRole("button", {name, exact: true});
    const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width}`);
    const screenshot = async name => { if (shots && [390,1280].includes(width)) await page.screenshot({path: `${shots}/measurement-${name}-${width}.png`, fullPage: true}); };
    const answer = async (q, wrong = false) => {
      if (q.rows) assert.equal(await page.locator('[data-region="inside"]').count(), totalCells(q.rows));
      if (q.action === "tiles") {
        for (const tile of await page.locator('button[data-region="inside"]').all()) await tile.click();
      } else if (q.options) {
        for (const option of wrong ? [q.options[1]] : q.answer.split("|")) await button(option).click();
      } else {
        await page.getByRole("textbox", {name: "Jawaban"}).fill(q.answer);
      }
      await noOverflow();
    };

    await page.goto(origin + "/kelas/pola-dan-strategi-kelas-4");
    await page.getByRole("link", {name: /Pengukuran Luas & Volume/}).click();
    await page.getByRole("heading", {name: "Pengukuran Luas & Volume", exact: true}).waitFor();
    await page.getByRole("slider", {name:"Kolom"}).fill("5");
    await page.getByText("0 petak dipilih. Luas daerah: 5 × 3 = 15 petak satuan.").waitFor();
    assert.equal(await page.locator('[data-region="outside"]').count(), 0);
    await page.locator('button[data-region="inside"]').first().click();
    await page.getByText("1 petak dipilih.", {exact:false}).waitFor();
    await noOverflow();
    await screenshot("area");
    for (const [topic, questions] of practice.entries()) {
      await button(["A. Luas · Satuan Tidak Baku", "B. Luas · Satuan Baku", "C. Volume · Satuan Tidak Baku", "D. Volume · Satuan Baku"][topic]).click();
      if (topic === 2) {
        for (let i=0;i<4;i++) await button("Tuang satu cangkir").click();
        await page.getByText("4 takaran dituang. Wadah penuh!", {exact:true}).waitFor();
      }
      if (topic === 3) {
        for(let i=0;i<4;i++) await button("Tuang satu takaran").click();
        await page.getByText("Wadah penuh. Kapasitasnya 1 L.", {exact:true}).waitFor();
        await noOverflow();
        await screenshot("volume");
        await button("Peraga kubus satuan").click();
        await page.getByRole("slider", {name:"Banyak lapisan"}).fill("3");
        await page.getByText("3 × 2 × 3 = 18 cm³.", {exact:true}).waitFor();
        await noOverflow();
        await screenshot("cubes");
      }
      await button("Latihan submateri →").click();
      for (const [i, q] of questions.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled());
        await answer(q);
        await button("Periksa jawaban").click();
        await page.getByText("Tepat!", {exact: true}).waitFor();
        await button(i === questions.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${questions.length} · Salah 0 · Skor 100/100`, {exact:true}).waitFor();
      await button("Kembali ke materi").click();
    }
    await button("Evaluasi Bab 4 →").click();
    for (const [i,q] of assessment.entries()) {
      assert.equal(await button("Lanjut →").count(),0);
      assert.equal(await button("Lihat hasil").count(),0);
      await answer(q,i===0);
      await screenshot(`assessment-${i+1}`);
      await button(i===23?"Lihat hasil":"Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
    await page.getByText("Bahas jawaban yang salah",{exact:true}).click();
    await page.getByText(/Jawabanmu Pintu rumah/).waitFor();
    await noOverflow();
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS: ${width}px, two labs, all exercises, final evaluation, score and review`);
  }
} finally {
  await browser.close();
}
