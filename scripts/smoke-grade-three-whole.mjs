import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {practice,assessment,topics} from '../src/data/grade-three-whole.ts';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:3000',folder='/tmp/grade-three-whole-screenshots';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
try{for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<=390});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const button=name=>page.getByRole('button',{name,exact:true});
 const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}`);
 const shot=async name=>{await fit();if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true});};
 const answer=async(q,wrong=false)=>{if(q.kind==='match'){for(const [i,v] of q.answer.split('|').entries()){await page.getByRole('button',{name:`Operasi ${i+1}: ${q.pairs[i]}`,exact:true}).click();await button(`Hasil ${q.choices[Number(v)]}`).click();}}else for(const [i,f] of q.fields.entries())await page.getByRole('textbox',{name:f,exact:true}).fill(wrong&&i===0?'8':q.answer.split('|')[i]);};
 await page.goto(origin+'/');await page.locator('a[href="/kelas/dasar-matematika-kelas-3"]').first().click();await page.getByRole('link',{name:/Bilangan Cacah sampai 1\.000/}).first().click();await page.getByRole('heading',{name:'Bilangan Cacah sampai 1.000',exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:/Faktor dan kelipatan/}).count(),0);
 for(let t=0;t<7;t++){
  await button(`${String.fromCharCode(65+t)}. ${topics[t].title}`).click();
  const lab=page.getByTestId(`grade3-lab-${t}`);
  if(t===0){await lab.getByRole('textbox',{name:'Bilangan pertama',exact:true}).fill('1000');await lab.getByRole('button',{name:'Ribuan: 1',exact:true}).click();await lab.getByText('Ribuan: angka 1 bernilai 1.000.',{exact:true}).waitFor();await lab.getByText(/dibaca/).getByText('seribu',{exact:true}).waitFor();}
  if(t===1){await lab.getByRole('textbox',{name:'Bilangan kedua',exact:true}).fill('100');await lab.getByText('Ratusan menentukan: 347 > 100.',{exact:true}).waitFor();await lab.getByRole('textbox',{name:'Bilangan kedua',exact:true}).fill('347');await lab.getByText('Kedua bilangan sama.',{exact:true}).waitFor();}
  if(t===2){await lab.getByRole('button',{name:'Tukar 1 ratusan',exact:true}).click();await lab.getByText('347 = 200 + 140 + 7',{exact:true}).waitFor();await lab.getByRole('button',{name:'Susun kembali'}).click();await lab.getByRole('textbox',{name:'Bilangan pertama',exact:true}).fill('1000');await lab.getByRole('button',{name:'Tukar 1 ribuan'}).click();await lab.getByText('Nilai tetap 1.000. Penukaran mengubah susunan unit, bukan jumlahnya.',{exact:true}).waitFor();}
  if(t>=3){const values={3:[[15,1,12,1,4],[10,1,10,1,6]],4:[[12,4,2,2],[10,4,1,4]],5:[[60,12,72],[120,24,144]],6:[[2,8,0,1,4,0],[2,6,0,0,0,1,4,12,0]]}[t];
   for(let ex=0;ex<2;ex++){if(ex)await lab.getByRole('button',{name:'Contoh lain',exact:true}).click();const guide=lab.getByTestId('grade3-guided');await guide.getByRole('textbox').fill('999');await guide.getByRole('button',{name:'Periksa langkah',exact:true}).click();await guide.getByText(/Coba lagi/).waitFor();assert.equal(await guide.getByRole('button',{name:'Langkah berikutnya',exact:true}).count(),0);for(const [i,v] of values[ex].entries()){await guide.getByRole('textbox').fill(String(v));await guide.getByRole('button',{name:'Periksa langkah',exact:true}).click();await guide.getByText('Tepat!',{exact:true}).waitFor();await guide.getByRole('button',{name:i===values[ex].length-1?'Lihat hasil peraga':'Langkah berikutnya',exact:true}).click();}await guide.getByRole('status').waitFor();}
   const extra=lab.getByTestId('whole-exploration');if(t<5){await extra.getByRole('button',{name:'Tukar 1 puluhan'}).click();await extra.getByText('1 puluhan + 13 satuan = 23',{exact:true}).waitFor();}else{await extra.getByRole('button',{name:t===5?'Buka hasil tiap bagian':'Bagikan merata'}).click();await extra.getByRole('textbox',{name:'Jawaban eksplorasi'}).fill(t===5?'48':'21');await extra.getByRole('button',{name:'Cek eksplorasi'}).click();await extra.getByText(/Tepat!/).waitFor();}
  }
  await shot(`lesson-${t}`);await button('Latihan submateri →').click();
  for(const [i,q] of practice[t].entries()){await page.getByRole('heading',{name:q.prompt,exact:true}).waitFor();assert.equal(await button('Periksa jawaban').isEnabled(),false);if(q.kind==='match'){await page.getByRole('button',{name:`Operasi 1: ${q.pairs[0]}`,exact:true}).click();await button(`Hasil ${q.choices[0]}`).click();assert.equal(await button('Periksa jawaban').isEnabled(),false);}await answer(q);await button('Periksa jawaban').click();await page.getByRole('status').getByText('Tepat!',{exact:true}).waitFor();await shot(q.id);await button(i===3?'Lihat hasil':'Lanjut →').click();}
  await page.getByText('Benar 4 · Salah 0 · Skor 100/100',{exact:true}).waitFor();await button('Kembali ke materi').click();
 }
 await button('Evaluasi Bab 1 · 24 soal').click();
 for(const [i,q] of assessment.entries()){await page.getByRole('heading',{name:q.prompt,exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/^(Lanjut →|Lihat hasil)$/}).count(),0);if(q.fields.length>1&&q.kind!=='match'){await page.getByRole('textbox',{name:q.fields[0],exact:true}).fill(q.answer.split('|')[0]);assert.equal(await page.getByRole('button',{name:/^(Lanjut →|Lihat hasil)$/}).count(),0);}await answer(q,i===0);await shot(q.id);await button(i===23?'Lihat hasil':'Lanjut →').click();}
 await page.getByText('Benar 23 · Salah 1 · Skor 96/100',{exact:true}).waitFor();await page.getByText('Bahas jawaban yang salah',{exact:true}).click();await page.getByText(/Ratusan: 7/).waitFor();await shot('results');assert.deepEqual(errors,[]);await page.close();console.log(`Grade 3 ${width}: seven studios, 28 practices, 24 evaluation items, book input formats and results passed`);
}}finally{await browser.close();}
