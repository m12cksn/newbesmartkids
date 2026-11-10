import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {assessment,practice,topics,project} from '../src/data/grade-six-cubes.ts';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:3000';
const folder='/tmp/grade-six-cubes-screenshots';await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true});let current;
try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});current=page;const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const button=name=>page.getByRole('button',{name,exact:true});
  const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow at ${width}`);
  const shot=async name=>{if([390,1280].includes(width))await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true});};
  const solve=async(q,wrong=false)=>{
   const r=q.response;
   if(r.kind==='number')for(const [i,label] of r.labels.entries())await page.getByRole('textbox',{name:label,exact:true}).fill(wrong&&i===0?'999':q.answer.split('|')[i]);
   else if(r.kind==='build'){const values=q.answer.split(',').map(Number);for(let y=0;y<r.depth;y++)for(let x=0;x<r.width;x++)for(let n=0;n<values[y*r.width+x];n++)await button(`Kolom ${x+1}, baris ${y+1}`).click();}
   else if(r.kind==='paint'){const values=q.answer.split(',').map(Number);for(let row=0;row<r.rows;row++)for(let col=0;col<r.cols;col++)if(values[row*r.cols+col])await button(`Petak baris ${row+1} kolom ${col+1}`).click();}
   else if(r.kind==='match'){for(const [i,name] of ['depan','kanan','atas'].entries()){await button(`Pasangkan ${name}`).click();const card=String.fromCharCode(65+Number(q.answer.split('|')[i]));await page.getByRole('button',{name:new RegExp(`^Kartu ${card}`)}).click();}}
   else if(r.kind==='point')await button(`Titik ${q.answer}`).click();
   else if(r.kind==='path')for(const d of [...q.answer].reverse())await button(`Langkah ${{R:'kanan',L:'kiri',U:'atas',D:'bawah'}[d]}`).click();
   else if(r.kind==='choice')await button(q.answer).click();
   else if(r.kind==='picture')await button(`Pilihan ${Number(q.answer)+1}`).click();
  };
  await page.goto(origin+'/kelas/konsep-inti-matematika-kelas-6');await page.locator('a[href="/kelas/konsep-inti-matematika-kelas-6/materi/kubus-dan-balok"]').first().click();await page.getByRole('heading',{name:'Kubus dan Balok',exact:true}).waitFor();
  // A: edit a column, create a balok, isolate a layer, rotate, count.
  await button('Kolom 3, baris 1').click();await page.getByRole('spinbutton',{name:'Panjang balok',exact:true}).fill('4');await button('Bangun balok').click();
  await page.getByRole('combobox',{name:'Urai lapisan'}).selectOption('2');await page.getByText(/Hanya lapisan 2 diperlihatkan/).waitFor();await button('Putar susunan 90°').click();
  await page.getByRole('textbox',{name:'Jumlah kubus eksplorasi',exact:true}).fill('16');await button('Cek hitungan').click();await page.getByText('Tepat!',{exact:true}).waitFor();await fit();await shot('lesson-A');
  // B: actual view drawing, cube symbols and rotation.
  await button('B. Visualisasi Spasial').click();await page.getByRole('combobox',{name:'Contoh susunan',exact:true}).selectOption('1');await button('Tampak kanan').click();
  const grid=project([[1,0,1],[2,1,0]],'kanan');for(let r=0;r<grid.length;r++)for(let c=0;c<grid[0].length;c++)if(grid[r][c])await button(`Petak baris ${r+1} kolom ${c+1}`).click();
  await button('Cek tampak').click();await page.getByText('Tepat! Semua petak sesuai arah pandang.',{exact:true}).waitFor();await button('Buka contoh tampak').click();await fit();await shot('lesson-B');
  await button('Kubus bertanda').click();await page.getByRole('img',{name:'Lingkaran',exact:true}).waitFor();await shot('lesson-symbols');await button('Kubus bertanda').click();await button('Putar susunan').click();
  // C: pick an endpoint, track rolling P and accept a shortest route.
  await button('C. Lokasi').click();await button('Titik D,4').click();await button('Langkah kanan').click();await page.getByText('Sekarang sisi P di kanan.',{exact:false}).waitFor();
  await button('Langkah kanan').click();await button('Langkah atas').click();await button('Langkah atas').click();await button('Cek jalur terpendek').click();await page.getByText('Tepat! Jalur mencapai tujuan dengan langkah paling sedikit.',{exact:true}).waitFor();await fit();await shot('lesson-C');
  for(let t=0;t<3;t++){
   await button(`${topics[t].code}. ${topics[t].title}`).click();await button('Latihan materi →').click();
   for(const [i,q] of practice[t].entries()){
    await page.getByRole('heading',{name:q.prompt,exact:true}).waitFor();assert.equal(await button('Periksa jawaban').isDisabled(),true);await solve(q);await button('Periksa jawaban').click();await page.getByText('Tepat!',{exact:false}).waitFor();await fit();await shot(`practice-${q.id}`);await button(i===4?'Lihat hasil':'Lanjut →').click();
   }
   await page.getByText('Benar 5 · Salah 0 · Skor 100/100',{exact:true}).waitFor();await button('Kembali ke materi').click();
  }
  await button('Evaluasi · 24 soal').click();
  for(const [i,q] of assessment.entries()){
   await page.getByRole('heading',{name:q.prompt,exact:true}).waitFor();const next=i===23?'Lihat hasil':'Lanjut →';assert.equal(await button(next).count(),0);
   if(q.response.kind==='number'&&q.response.labels.length>1){await page.getByRole('textbox',{name:q.response.labels[0],exact:true}).fill(q.answer.split('|')[0]);assert.equal(await button(next).count(),0);}
   await solve(q,i===0);await fit();await shot(`evaluation-${i+1}`);await button(next).click();
  }
  await page.getByText('Benar 23 · Salah 1 · Skor 96/100',{exact:true}).waitFor();await page.getByText('Bahas jawaban yang salah',{exact:true}).click();await page.getByText('Jawaban benar 5.',{exact:false}).waitFor();await fit();await shot('result');assert.deepEqual(errors,[]);await page.close();console.log(`PASS Grade 6 Cubes ${width}px: class discovery, cube/layer/balok construction, projections, matching, rolling, 15 practices, all 24 evaluations, alternate paths, gating, score/review.`);
 }
}catch(e){if(current)await current.screenshot({path:`${folder}/failure.png`,fullPage:true});throw e;}finally{await browser.close();}
