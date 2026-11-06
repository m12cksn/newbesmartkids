import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {assessment,practice,topics,objectNames} from '../src/data/grade-four-patterns.ts';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:3000';
const shots=process.env.CHAPTER_SCREENSHOTS;
if(shots) await mkdir(shots,{recursive:true});
try {
 for(const width of [320,390,768,1280]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true});
  const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
  async function visual(q){
   if(q.object&&q.kind!=='table') {
    const figures=page.locator('figure');assert.equal(await figures.count(),q.values.length);
    for(let i=0;i<q.values.length;i++) assert.equal(await figures.nth(i).locator('[data-object]').count(),q.blanks.includes(i)?0:q.values[i]);
   }
  }
  async function answer(q,wrong=false){
   if(q.kind==='build'){
    await button('Tambah benda').click();await button('Ambil benda 1').click();
    await button('Tambah benda').click();await button('Kosongkan').click();
    for(let i=0;i<Number(q.answer)+(wrong?1:0);i++)await button('Tambah benda').click();
   }else if(q.kind==='pick'){
    const n=wrong?q.choices.find(n=>String(n)!==q.answer):Number(q.answer);
    const i=q.choices.indexOf(n);
    await button(`Gambar ${String.fromCharCode(65+i)}: ${n} ${objectNames[q.object]}`).click();
   }else{
    const fields=page.getByRole('textbox');const values=q.answer.split('|');
    for(let i=0;i<values.length;i++){
     await fields.nth(i).fill(String(Number(values[i])+(wrong&&i===0?1:0)));
     if(i<values.length-1)assert.equal(await button('Lanjut →').count(),0);
    }
   }
   await noOverflow();
  }
  await page.goto(origin+'/kelas/pola-dan-strategi-kelas-4');
  await page.getByRole('link',{name:/Pola Gambar dan Pola Bilangan/}).click();
  await page.getByRole('heading',{name:'Pola Gambar dan Pola Bilangan',exact:true}).waitFor();
  for(let topic=0;topic<2;topic++){
   await button(`${String.fromCharCode(65+topic)}. ${topics[topic].title}`).click();
   await button('Pola mengecil').click();
   await page.getByRole('slider',{name:'Besar perubahan',exact:true}).fill(topic===0?'4':'9');
   await button('Langkah berikutnya').click();
   await page.getByText(/1 perubahan dari kumpulan pertama/).waitFor();
   await button('Ulangi peraga').click();assert.ok(await button('Langkah sebelumnya').isDisabled());
   await button('Pola membesar').click();
   await page.getByRole('slider',{name:'Bilangan awal',exact:true}).fill('5');
   await noOverflow();
   if(shots)await page.screenshot({path:`${shots}/lesson-${topic}-${width}.png`,fullPage:true});
   await button('Latihan submateri →').click();
   for(const [i,q] of practice[topic].entries()){
    assert.ok(await button('Periksa jawaban').isDisabled());await visual(q);await answer(q);
    await button('Periksa jawaban').click();await page.getByText('Tepat!',{exact:true}).waitFor();
    await button(i===4?'Lihat hasil':'Lanjut →').click();
   }
   await page.getByText('Benar 5 · Salah 0 · Skor 100/100',{exact:true}).waitFor();await button('Kembali ke materi').click();
  }
  await button('Evaluasi Bab 3 →').click();
  for(const [i,q] of assessment.entries()){
   assert.equal(await button('Lanjut →').count(),0);assert.equal(await button('Lihat hasil').count(),0);
   await visual(q);await answer(q,i===0);
   if(shots)await page.screenshot({path:`${shots}/assessment-${i+1}-${width}.png`,fullPage:true});
   if(i===1){await button('← Sebelumnya').click();await page.getByRole('textbox').fill('16');await button('Lanjut →').click();assert.equal(await page.getByRole('textbox').inputValue(),q.answer);}
   await button(i===23?'Lihat hasil':'Lanjut →').click();
  }
  await page.getByRole('heading',{name:'Hasil evaluasi',exact:true}).waitFor();
  await page.getByText('Benar 23 · Salah 1 · Skor 96/100',{exact:true}).waitFor();
  await page.getByText('Bahas jawaban yang salah',{exact:true}).click();await page.getByText('Jawabanmu 16. Jawaban benar 15.',{exact:true}).waitFor();
  assert.deepEqual(errors,[]);await noOverflow();await page.close();
  console.log(`PASS patterns: ${width}px, two labs, 10 practices, 24 assessments, answer gates, review and score`);
 }
}finally{await browser.close();}
