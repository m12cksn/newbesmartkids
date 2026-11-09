import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import {assessment,practice} from "../src/data/grade-four-data-display.ts";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3000";
const folder=process.env.CHAPTER_SCREENSHOTS??"/tmp/data-display-screenshots";
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(10000);const errors=[];page.on("pageerror",e=>errors.push(e.message));
  const button=name=>page.getByRole("button",{name,exact:true});
  const fit=async()=>{const size=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth}));assert.ok(size.scroll<=size.inner,`overflow ${width}: ${JSON.stringify(size)}`)};
  const shot=async name=>{if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true})};
  const answer=async(q,value=q.answer)=>{
   if(q.options){await button(value.split("|")[0]).click();for(const v of value.split("|").slice(1))await button(v).click();return;}
   if(q.task){for(const [i,v] of value.split("|").entries())await page.getByRole("slider",{name:`Nilai ${q.data[i].label}`}).fill(v);return;}
   await page.getByRole("textbox",{name:"Jawaban",exact:true}).fill(value);
  };
  await page.goto(`${origin}/kelas/pola-dan-strategi-kelas-4/materi/piktogram-dan-diagram-batang`);
  await page.getByRole("heading",{name:"Piktogram dan Diagram Batang"}).waitFor();
  await page.getByRole("slider",{name:"Jumlah Buku"}).fill("10");await button("1 gambar = 2").click();await page.getByText(/Total data 22/).waitFor();await fit();await shot("lesson-pictogram");
  await button("Latihan materi →").click();
  for(const [i,q] of practice[0].entries()){assert.ok(await button("Periksa jawaban").isDisabled());await answer(q);await button("Periksa jawaban").click();await page.getByText("Tepat!",{exact:true}).waitFor();await fit();if(i===0)await shot("practice-pictogram");await button(i===4?"Lihat hasil":"Lanjut →").click();}
  await page.getByText("Benar 5 · Salah 0 · Skor 100/100",{exact:true}).waitFor();await button("Kembali ke materi").click();
  await button("2. Diagram Batang").click();await button("Mendatar").click();await page.getByRole("slider",{name:"Jumlah Catur"}).fill("11");await page.getByText(/selisihnya 6/).waitFor();await fit();await shot("lesson-bars");
  await button("Latihan materi →").click();
  for(const [i,q] of practice[1].entries()){assert.ok(await button("Periksa jawaban").isDisabled());await answer(q);await button("Periksa jawaban").click();await page.getByText("Tepat!",{exact:true}).waitFor();await fit();if(i===0)await shot("practice-bars");await button(i===4?"Lihat hasil":"Lanjut →").click();}
  await page.getByText("Benar 5 · Salah 0 · Skor 100/100",{exact:true}).waitFor();await button("Kembali ke materi").click();await button("Evaluasi · 24 soal").click();
  for(const [i,q] of assessment.entries()){
   assert.equal(await button("Lanjut →").count(),0);assert.equal(await button("Lihat hasil").count(),0);
   const value=i===0?"Mobil":q.answer;await answer(q,value);await fit();if([0,2,5,15,23].includes(i))await shot(`assessment-${i+1}`);await button(i===23?"Lihat hasil":"Lanjut →").click();
  }
  await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();await page.getByText("Bahas jawaban yang salah",{exact:true}).click();await page.getByText(/Jawaban benar Motor/).waitFor();await fit();await shot("result");assert.deepEqual(errors,[]);await page.close();console.log(`PASS data display: 10 practice, 24 assessment, labs at ${width}px`);
 }
}finally{await browser.close()}
