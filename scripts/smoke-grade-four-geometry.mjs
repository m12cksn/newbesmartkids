import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {assessment,practice,topics,layouts} from '../src/data/grade-four-geometry.ts';
const browser=await chromium.launch({headless:true});
const folder=process.env.CHAPTER_SCREENSHOTS??'/tmp/geometry-screenshots';await mkdir(folder,{recursive:true});
try {for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
 const b=name=>page.getByRole('button',{name,exact:true});
 const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width}`);
 const shot=async name=>{if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true})};
 async function answer(q,value=q.answer){
  if(q.options){for(const v of value.split('|'))await b(v).click();return;}
  if(q.task==='sort'||q.task==='match'){for(const [i,v] of value.split('|').entries()){await b(`Gambar ${String.fromCharCode(65+i)}`).click();await b(`Tujuan ${Number(v)+1}: ${q.destinations[Number(v)]}`).click();if(i===0){assert.equal(await b('Lanjut →').count(),0);if(await b('Periksa jawaban').count())assert.ok(await b('Periksa jawaban').isDisabled());}}return;}
  if(q.task==='assemble'){for(const [i,v] of value.split('|').entries()){await b(`Potongan ${v}`).click();await b(`Tempat ${i+1}`).press('Enter');if(i===0)assert.equal(await b('Lanjut →').count(),0);}return;}
  if(q.task==='construct'){await page.getByRole('slider',{name:'Banyak titik'}).fill(value);assert.equal(await b('Lanjut →').count(),0);await b('Hubungkan semua titik').click();return;}
  await page.getByRole('textbox',{name:'Jawaban',exact:true}).fill(value);
 }
 await page.goto((process.env.TEST_ORIGIN??'http://127.0.0.1:3000')+'/kelas/pola-dan-strategi-kelas-4');await page.getByRole('link',{name:/Bangun Datar/}).click();
 for(const [i,t] of topics.entries()){
  await b(t.title).click();
  if(i===0){await page.getByRole('slider').fill('8');await b('Buka garis terakhir').click();await page.getByText(/Sekarang ada 7 ruas garis/).waitFor();await b('Tutup garis terakhir').click();}
  if(i===1||i===2){await page.getByRole('combobox').selectOption(i===1?'scalene':'trapezium');await b('Putar 45°').click();await b('Sorot sisi dan titik sudut').click();await page.getByText(/Diputar 45°/).waitFor();}
  if(i===3){await page.getByRole('combobox').selectOption('house');await answer({task:'assemble'},'1|3|2');await page.getByText('Tepat! Semua potongan mengisi target.',{exact:true}).waitFor();await b('Kosongkan susunan').click();await page.getByText('0 dari 3 potongan dipasang').waitFor();}
  if(i===4){await b('Potong menjadi empat').click();await b('Pisahkan potongan').click();await page.getByRole('img',{name:'4 persegi'}).waitFor();await b('Satukan kembali').click();}
  await fit();await shot(`lesson-${i}`);await b('Latihan materi').click();
  for(const [j,q] of practice[i].entries()){
   assert.ok(await b('Periksa jawaban').isDisabled());await answer(q);await b('Periksa jawaban').click();await page.getByText('Tepat!',{exact:true}).waitFor();await fit();await shot(`practice-${i}-${j}`);await b(j===4?'Lihat hasil':'Lanjut →').click();
  }
  await page.getByText('Benar 5 · Salah 0 · Skor 100/100',{exact:true}).waitFor();await b('Kembali ke materi').click();
 }
 await b('Evaluasi').click();
 for(const [i,q] of assessment.entries()){
  assert.equal(await b('Lanjut →').count(),0);assert.equal(await b('Lihat hasil').count(),0);await answer(q,i===0?'1|1|0|1':q.answer);await fit();await shot(`assessment-${i+1}`);await b(i===23?'Lihat hasil':'Lanjut →').click();
 }
 await page.getByText('Benar 23 · Salah 1 · Skor 96/100',{exact:true}).waitFor();await page.getByText('Bahas jawaban yang salah',{exact:true}).click();await page.getByText(/Jawaban benar A → Segibanyak/).waitFor();await shot('result');assert.deepEqual(errors,[]);await page.close();console.log(`PASS Geometry: all 49 questions and labs at ${width}px`);
}}finally{await browser.close()}
