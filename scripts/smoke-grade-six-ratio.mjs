import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {assessment,practice,topics} from '../src/data/grade-six-ratio.ts';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:3000';
const route='/kelas/konsep-inti-matematika-kelas-6/materi/rasio';
const folder='/tmp/grade-six-ratio-screenshots';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}`);
 const shot=async name=>{if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true});};
 const answer=async(q,wrong=false)=>{
  if(q.options){const opts=wrong?[q.options.find(o=>!q.answer.split('|').includes(o))]:q.answer.split('|');for(const a of opts)await page.getByRole('button',{name:a,exact:true}).click();}
  else for(const [i,f] of q.fields.entries())await page.getByRole('textbox',{name:f,exact:true}).fill(wrong&&i===0?'999999':q.answer.split('|')[i]);
 };
 await page.goto(origin+'/kelas/konsep-inti-matematika-kelas-6');
 await page.getByRole('link',{name:/Rasio/}).filter({hasText:'Rasio'}).first().click();
 await page.waitForURL('**/materi/rasio');
 for(let t=0;t<6;t++){
  await page.getByRole('button',{name:`${topics[t].code} ${topics[t].title}`,exact:true}).click();
  await page.getByTestId(`ratio-lab-${t}`).waitFor();
  const sliders=page.getByRole('slider');const first=sliders.first();const before=await first.inputValue();await first.fill(String(Number(before)+1));assert.notEqual(await first.inputValue(),before);
  if(t===0){await page.getByRole('slider',{name:'Harga per buku A (ribu rupiah)'}).fill('2');await page.getByRole('button',{name:'Bandingkan harga satuan',exact:true}).click();await page.getByText(/Paket A lebih hemat per buku/).waitFor();}
  if(t===1){await page.getByRole('button',{name:'Balik urutan rasio'}).click();await page.getByText(/Pensil : buku =/).waitFor();}
  if(t===2){await page.getByRole('slider',{name:'Tambahan pensil saja'}).fill('1');await page.getByText(/Tidak senilai:/).waitFor();}
  if(t===3)await page.getByRole('button',{name:'Buka langkah satuan'}).click();
  if(t===4){await page.getByRole('button',{name:'Bagian : keseluruhan',exact:true}).click();await page.getByText(/Cerita : seluruh buku =/).waitFor();}
  if(t===5){await page.getByRole('button',{name:'Ganti tampilan jam / menit'}).click();await page.getByRole('button',{name:'Buka langkah durasi'}).click();}
  const guess=page.getByRole('textbox',{name:/Coba sendiri:/});await guess.fill('999');await page.getByRole('button',{name:'Cek eksplorasi'}).click();await page.getByText(/Belum tepat. Hasilnya/).waitFor();await fit();await shot(`lesson-${t}`);
  await page.getByRole('button',{name:'Latihan materi →',exact:true}).click();
  for(const [i,q] of practice[t].entries()){
   assert.equal(await page.getByRole('button',{name:'Periksa jawaban',exact:true}).isDisabled(),true);
   if(q.fields?.length>1){await page.getByRole('textbox',{name:q.fields[0],exact:true}).fill(q.answer.split('|')[0]);assert.equal(await page.getByRole('button',{name:'Periksa jawaban',exact:true}).isDisabled(),true);}
   await answer(q);await page.getByRole('button',{name:'Periksa jawaban',exact:true}).click();await page.getByText('Tepat!',{exact:false}).waitFor();await fit();if(i===0)await shot(`practice-${t}`);
   await page.getByRole('button',{name:i===3?'Lihat hasil':'Lanjut →',exact:true}).click();
  }
  await page.getByText('Benar 4 · Salah 0 · Skor 100/100',{exact:true}).waitFor();await page.getByRole('button',{name:'Kembali ke materi',exact:true}).click();
 }
 await page.getByRole('button',{name:'Evaluasi · 24 soal',exact:true}).click();
 for(const [i,q] of assessment.entries()){
  await page.getByRole('heading',{name:q.prompt,exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:i===23?'Lihat hasil':'Lanjut →',exact:true}).count(),0);
  if(q.fields?.length>1){await page.getByRole('textbox',{name:q.fields[0],exact:true}).fill(q.answer.split('|')[0]);assert.equal(await page.getByRole('button',{name:i===23?'Lihat hasil':'Lanjut →',exact:true}).count(),0);}
  await answer(q,i===0);await fit();await shot(`evaluation-${i+1}`);
  await page.getByRole('button',{name:i===23?'Lihat hasil':'Lanjut →',exact:true}).click();
 }
 await page.getByText('Benar 23 · Salah 1 · Skor 96/100',{exact:true}).waitFor();await page.getByText('Bahas jawaban yang salah',{exact:true}).click();await page.getByText(/Jawaban benar Sains: 2/).waitFor();await fit();await shot('result');
 assert.deepEqual(errors,[]);await page.close();console.log(`PASS Grade 6 Rasio at ${width}px: class discovery, 6 labs, 24 practice, every evaluation, gating, scoring and review.`);
}
}finally{await browser.close();}
