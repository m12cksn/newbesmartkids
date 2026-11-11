import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {assessment,practice,topics} from '../src/data/grade-six-probability.ts';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:3000';const folder='/tmp/grade-six-probability-screenshots';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width}`);
 const shot=async name=>{await fit();if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true});};
 const answer=async(q,wrong=false)=>{
  if(q.options){for(const a of (wrong?[q.options.find(x=>!q.answer.split('|').includes(x))]:q.answer.split('|')))await page.getByRole('button',{name:a,exact:true}).click();}
  else if(q.task==='paint'){for(const [i,c] of q.answer.split('|').entries()){await page.getByRole('button',{name:q.scene.labels[Number(c)],exact:true}).click();await page.getByRole('button',{name:new RegExp(`^Sektor ${i+1}:`)}).click();}}
  else for(const [i,f] of q.fields.entries())await page.getByRole('textbox',{name:f,exact:true}).fill(q.answer.split('|')[i]);
 };
 await page.goto(origin+'/kelas/konsep-inti-matematika-kelas-6');await page.getByRole('link',{name:/Peluang/}).first().click();await page.getByRole('heading',{name:'Peluang',exact:true}).waitFor();
 for(let t=0;t<3;t++){
  await page.getByRole('button',{name:`${topics[t].code} ${topics[t].title}`,exact:true}).click();
  const lab=page.getByTestId(`probability-lab-${t}`);await lab.waitFor();
  if(t===0){await lab.getByRole('slider',{name:'Bola merah',exact:true}).fill('4');await lab.getByRole('button',{name:'Ambil 20 kali',exact:true}).click();await lab.getByText(/20 pengambilan/).waitFor();await lab.getByRole('button',{name:'Hapus catatan'}).click();await lab.getByText(/0 pengambilan/).waitFor();}
  if(t===1){await lab.getByRole('button',{name:'Biru',exact:true}).click();await lab.getByRole('button',{name:/^Sektor 1:/}).click();await lab.getByRole('button',{name:'Putar roda'}).click();const status=lab.getByText(/Panah berhenti/);await status.waitFor();const sector=Number((await status.innerText()).match(/sektor (\d+)/)[1]);assert.equal(await lab.locator('svg[aria-label="Roda 8 sektor sama luas"] > g').getAttribute('transform'),`rotate(${-(sector-.5)*45} 100 100)`);}
  if(t===2){await lab.getByRole('slider',{name:'Merah A',exact:true}).fill('4');await lab.getByRole('slider',{name:'Biru A',exact:true}).fill('8');await lab.getByRole('slider',{name:'Merah B',exact:true}).fill('2');await lab.getByRole('slider',{name:'Biru B',exact:true}).fill('4');}
  await lab.getByLabel(/Coba sendiri/).selectOption(t===0?'Kurang mungkin':t===1?'Adil':'Sama');await lab.getByRole('button',{name:'Cek prediksi'}).click();await lab.getByText(/Tepat!/).waitFor();await shot(`lab-${t}`);
  await page.getByRole('button',{name:'Latihan materi →'}).click();
  for(const q of practice[t]){assert.ok(!(await page.getByRole('button',{name:'Lanjut →',exact:true}).count()));await answer(q);await page.getByRole('button',{name:'Periksa jawaban'}).click();await page.getByText(/Tepat!/).waitFor();await shot(q.id);await page.getByRole('button',{name:q===practice[t].at(-1)?'Lihat hasil':'Lanjut →',exact:true}).click();}
  await page.getByText('Benar 5 · Salah 0 · Skor 100/100',{exact:true}).waitFor();await page.getByRole('button',{name:'Kembali ke materi'}).click();
 }
 await page.getByRole('button',{name:'Evaluasi · 24 soal'}).click();
 for(const [i,q] of assessment.entries()){assert.ok(!(await page.getByRole('button',{name:/^(Lanjut →|Lihat hasil)$/}).count()));await answer(q,i===0);await shot(q.id);await page.getByRole('button',{name:i===23?'Lihat hasil':'Lanjut →',exact:true}).click();}
 await page.getByText('Benar 23 · Salah 1 · Skor 96/100',{exact:true}).waitFor();await page.getByText('Bahas jawaban yang salah',{exact:true}).click();await page.getByText(/Jawaban benar/).waitFor();await shot('results');assert.deepEqual(errors,[]);await page.close();console.log(`Probability browser ${width} passed`);
}}finally{await browser.close();}
