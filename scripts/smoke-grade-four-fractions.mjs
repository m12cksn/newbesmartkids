import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics } from "../src/data/grade-four-fractions.ts";

assert.equal(practice.length,5);
assert.ok(practice.every(questions => questions.length === 4));
assert.equal(assessment.length,24);
for (const q of [...practice.flat(),...assessment]) {
  if (q.options) {
    assert.equal(new Set(q.options).size,q.options.length);
    for (const option of q.answer.split("|")) assert.ok(q.options.includes(option));
  }
  for (const [n,d] of q.models ?? []) assert.ok(Number.isInteger(n) && Number.isInteger(d) && d > 0 && n >= 0 && n <= d);
}

const screenshots = process.env.CHAPTER_SCREENSHOTS;
if (screenshots) await mkdir(screenshots,{recursive:true});
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
try {
  for (const width of [320,390,768,1280]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    const errors = [];
    page.on("pageerror",error => errors.push(error.message));
    const button = name => page.getByRole("button",{name,exact:true});
    const noOverflow = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    async function answer(q,value=q.answer) {
      if (q.shade) {
        const first = button("Bagian 1");
        await first.click();
        await first.click();
        assert.equal(await first.getAttribute("aria-pressed"),"false");
        for (let i=1;i<=Number(value);i++) await button(`Bagian ${i}`).click();
      } else if (q.options) {
        for (const option of value.split("|")) await button(option).click();
      } else await page.getByRole("textbox",{name:"Jawaban"}).fill(value);
      await noOverflow();
    }
    await page.goto(origin+"/kelas/pola-dan-strategi-kelas-4");
    await page.getByRole("link",{name:/Pecahan/}).click();
    for (const [i,topic] of topics.entries()) {
      await button(`${String.fromCharCode(65+i)}. ${topic.title}`).click();
      await page.getByText("Coba bersama.",{exact:true}).waitFor();
      if (i < 2) {
        await button("Garis bilangan").click();
        await page.getByRole("img",{name:/garis bilangan/}).first().waitFor();
      } else if (i === 2) {
        await page.getByRole("slider",{name:"Faktor pengali"}).fill("3");
        await page.getByText("(2 × 3) / (3 × 3) = 6/9",{exact:true}).waitFor();
      } else if (i === 3) {
        await button("Tampilkan perseratusan").click();
        await page.getByRole("img",{name:"40 dari 100 bagian pada kotak"}).waitFor();
      } else {
        await page.getByRole("slider",{name:"Persen",exact:true}).fill("125");
        await page.getByText("125/100 = 1,25 = 125%",{exact:true}).waitFor();
      }
      await noOverflow();
      await button("Latihan submateri →").click();
      for (const [index,q] of practice[i].entries()) {
        const check = button("Periksa jawaban");
        assert.ok(await check.isDisabled());
        await answer(q, q.notation === "decimal" ? q.answer.replace(",",".") : q.answer);
        await check.click();
        await page.getByRole("status").getByText("Tepat!").waitFor();
        await button(index === 3 ? "Lihat hasil" : "Lanjut →").click();
      }
      await button("Kembali ke materi").click();
    }
    await button("Evaluasi Bab 2 →").click();
    for (const [i,q] of assessment.entries()) {
      const advance = button(i === 23 ? "Lihat hasil" : "Lanjut →");
      assert.equal(await advance.count(),0);
      await answer(q,i === 0 ? "<" : q.answer);
      if (screenshots && [390,1280].includes(width)) {
        await page.getByRole("heading",{name:q.prompt,exact:true}).locator("..").screenshot({path:`${screenshots}/${width}-${i+1}.png`});
      }
      await advance.click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
    await page.getByText("Bahas jawaban yang salah").click();
    await page.getByText("Jawabanmu <. Jawaban benar >.").waitFor();
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`Pecahan: ${width}px · 5 peraga · 20 latihan · 24 evaluasi`);
  }
} finally {
  await browser.close();
}
