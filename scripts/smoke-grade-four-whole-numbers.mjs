import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics } from "../src/data/grade-four-whole-numbers.ts";

assert.equal(topics.length, 8);
assert.equal(practice.length, 8);
assert.equal(assessment.length, 24);
assert.equal(new Set(assessment.map(q => q.prompt)).size, 24);
assert.ok(practice.every(section => section.length >= 3 && section.length <= 5));
for (const q of [...assessment, ...practice.flat()]) {
  if (q.options) {
    assert.equal(new Set(q.options).size, q.options.length);
    for (const answer of q.answer.split("|")) assert.ok(q.options.includes(answer));
  } else assert.match(q.answer, q.wholeFields ? /^\d+(\|\d+)+$/ : /^\d+$/);
}

const screenshots = process.env.CHAPTER_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, {recursive:true});
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
const base = "http://127.0.0.1:3000/kelas/pola-dan-strategi-kelas-4";

try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: {width, height:900} });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const button = name => page.getByRole("button", {name, exact:true});
    const noOverflow = async () => { const overflow = await page.evaluate(() => [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map(e => [e.tagName,e.className,e.textContent.slice(0,40)])); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), JSON.stringify(overflow)); };
    const solve = async (q, answer = q.answer) => {
      if (q.options) for (const option of answer.split("|")) await button(option).click();
      else if(q.wholeFields)for(const [i,f] of q.wholeFields.entries())await page.getByRole('textbox',{name:f,exact:true}).fill(answer.split('|')[i]);
      else await page.getByRole("textbox", {name:"Jawaban",exact:true}).fill(answer);
      await noOverflow();
    };
    await page.goto(base);
    await page.getByRole("link", {name:/Bilangan Cacah sampai 10\.000/}).click();
    for (const [i, topic] of topics.entries()) {
      await button(`${String.fromCharCode(65+i)}. ${topic.title}`).click();
      await page.getByText("Coba bersama.", {exact:true}).waitFor();
      if (i === 0 || i === 2) {
        await page.getByRole("textbox",{name:"Bilangan pertama"}).fill("10000");
        await button("Puluh ribu atas: 1").click();
        await page.getByText("Puluh ribu: angka 1 bernilai 10.000.", {exact:true}).waitFor();
        if (i === 0) await page.getByText(/Pada 10\.000, angka 1 menempati puluh ribu dan bernilai 10\.000/).waitFor();
      } else if (i === 1) {
        await page.getByText("Puluhan menentukan hasil: 4.286 > 4.268.").waitFor();
        await page.getByRole("textbox", {name:"Bilangan kedua"}).fill("100");
        await page.getByText("Ribuan menentukan hasil: 4.286 > 100.").waitFor();
        assert.deepEqual(await page.locator("td.bg-warning\\/25").allTextContents(), ["4","0"]);
        await page.getByRole("textbox", {name:"Bilangan kedua"}).fill("4286");
        await page.getByText("Kedua bilangan sama.").waitFor();
        assert.equal(await page.locator("td.bg-warning\\/25").count(), 0);
      } else if (i < 7) {
        const steps = [[13,1,13,1,14,1,4], [12,6,1,2,2], [40,8,48], [2,0,1,0]][i-3];
        const entry = page.locator("#guided-operation-answer");
        await entry.fill("99");
        await button("Periksa langkah").click();
        await page.getByRole("status").getByText(/Coba lagi/).waitFor();
        assert.equal(await button("Langkah berikutnya").count(), 0);
        for (const [n, value] of steps.entries()) {
          await entry.fill(String(value));
          await button("Periksa langkah").click();
          await page.getByRole("status").getByText(/Tepat!/).waitFor();
          await noOverflow();
          await button(n === steps.length-1 ? "Lihat hasil peraga" : "Langkah berikutnya").click();
        }
        await page.getByRole("status").getByText(new RegExp(`= ${["4\\.433","2\\.216","48","21"][i-3]}\\.$`)).waitFor();
        await button('Contoh lain').click();
        const alternate=[[15,1,10,1,9,5],[15,8,4,12,4,4],[600,120,48,768],[2,1,3,1,4,0]][i-3];
        for(const [n,value] of alternate.entries()){await entry.fill(String(value));await button('Periksa langkah').click();await page.getByRole('status').getByText(/Tepat!/).waitFor();await button(n===alternate.length-1?'Lihat hasil peraga':'Langkah berikutnya').click();}
      } else {
        await button("Kelipatan").click();
        await page.getByText("18 × 6 = 108",{exact:true}).waitFor();
      }
      await noOverflow();
      if(i>=3){const lab=page.getByTestId('whole-exploration');if(i===3||i===4){await lab.getByRole('button',{name:'Tukar 1 puluhan',exact:true}).click();await lab.getByText('1 puluhan + 13 satuan = 23',{exact:true}).waitFor();await lab.getByRole('button',{name:'Gabungkan 10 satuan',exact:true}).click();}else{if(i===5){await lab.getByRole('button',{name:'Buka hasil tiap bagian'}).click();await lab.getByRole('textbox',{name:'Jawaban eksplorasi'}).fill('48');}else{await lab.getByRole('button',{name:'Bagikan merata'}).click();await lab.getByRole('textbox',{name:'Jawaban eksplorasi'}).fill(i===6?'21':'6');}await lab.getByRole('button',{name:'Cek eksplorasi'}).click();await lab.getByRole('status').getByText(/Tepat!/).waitFor();}await noOverflow();}
      if(screenshots&&[390,1280].includes(width))await page.screenshot({path:`${screenshots}/${width}-lesson-${i}.png`,fullPage:true});
      await button("Latihan submateri →").click();
      for (const [index,q] of practice[i].entries()) {
        await solve(q);
        await button("Periksa jawaban").click();
        await page.getByRole("status").getByText("Tepat!").waitFor();
        await button(index === practice[i].length-1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi Bab 1 →").click();
    for (const [i,q] of assessment.entries()) {
      await page.getByRole("heading",{name:q.prompt,exact:true}).waitFor();
      const advance = button(i === 23 ? "Lihat hasil" : "Lanjut →");
      assert.equal(await advance.count(),0);
      await solve(q,i === 0 ? "1" : q.answer);
      if (screenshots && [390,1280].includes(width)) {
        await page.getByRole("heading",{name:q.prompt,exact:true}).locator("..").screenshot({path:`${screenshots}/${width}-${i+1}.png`});
      }
      await advance.click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
    await page.getByText("Bahas jawaban yang salah").click();
    await page.getByText("Jawabanmu 1. Jawaban benar 0.").waitFor();
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`Kelas 4 Bab 1: ${width}px · 8 peraga · 32 latihan · 24 evaluasi`);
  }
} finally {
  await browser.close();
}
