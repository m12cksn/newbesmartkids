import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
import {dailyQuestions} from '../src/lib/daily-arithmetic.ts';
const origin=process.env.TEST_ORIGIN??'http://127.0.0.1:3000';
const folder='/tmp/daily-arithmetic-screenshots';await mkdir(folder,{recursive:true});
const browser=await chromium.launch();
try{
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:950},timezoneId:'America/Los_Angeles'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-11-09T16:50:00Z')});
  const button=name=>page.getByRole('button',{name,exact:true});
  const fit=async()=>assert.ok(await page.evaluate(()=>[...document.querySelectorAll('main input,main button,main nav a')].every(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1})),`Controls overflow ${width}`);
  await page.goto(origin);await page.getByRole('link',{name:'Mulai latihan harian →',exact:true}).click();await page.getByRole('textbox').first().waitFor();
  assert.ok((await page.url()).endsWith('/level-1'));
  for(const level of [1,2,3]){
   if(level>1)await page.getByRole('link',{name:new RegExp(`Level ${level}`)}).click();
   await page.waitForURL(`**/level-${level}`);
   await page.getByRole('textbox',{name:`Jawaban soal 1: ${label(dailyQuestions('2026-11-09',level)[0])}`,exact:true}).waitFor({state:'visible'});
   await page.getByRole('textbox').first().waitFor();assert.equal(await page.getByRole('textbox').count(),7);await fit();
   assert.equal(await page.locator('main').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(250, 249, 243)');
   assert.ok(await page.getByRole('textbox').first().evaluate(el=>el.getBoundingClientRect().width>=40 && el.getBoundingClientRect().width<=70),'Answer boxes must have loaded styles');
   assert.ok(await button('Periksa jawaban').isDisabled());
   const qs=dailyQuestions('2026-11-09',level);
   for(let i=0;i<7;i++)await page.getByRole('textbox').nth(i).fill(String(qs[i].answer+(i===0?1:0)));
   await button('Periksa jawaban').click();await page.getByText('Benar 6 · Perlu diperbaiki 1 · Skor 86/100',{exact:true}).waitFor();
   await button('Petunjuk').click();await page.getByText(/Gunakan keluarga fakta:/).waitFor();await fit();
   await page.getByRole('textbox').first().fill(String(qs[0].answer));await button('Periksa jawaban').click();await page.getByText('Benar 7 · Perlu diperbaiki 0 · Skor 100/100',{exact:true}).waitFor();
   await page.reload();await page.getByText('Benar 7 · Perlu diperbaiki 0 · Skor 100/100',{exact:true}).waitFor();
   await button('Ulangi paket ini').click();assert.equal(await page.getByRole('textbox').first().inputValue(),'');
   await page.getByRole('textbox').first().fill(String(qs[0].answer));await page.reload();assert.equal(await page.getByRole('textbox').first().inputValue(),String(qs[0].answer));
   if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-level-${level}.png`,fullPage:true});
  }
  // Rollover is WIB midnight even though the browser timezone is Los Angeles.
  await page.clock.fastForward(601000);await page.getByText('Paket hari baru sudah tersedia.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('textbox').first().inputValue(),String(dailyQuestions('2026-11-09',3)[0].answer));
  await page.reload();await page.getByText('Paket hari baru sudah tersedia.',{exact:true}).waitFor();
  await button('Mulai paket hari ini →').click();await page.getByRole('heading',{name:'10 November 2026',exact:true}).waitFor();assert.equal(await page.getByRole('textbox').first().inputValue(),'');
  assert.equal(await page.getByRole('textbox').first().getAttribute('aria-label'),`Jawaban soal 1: ${label(dailyQuestions('2026-11-10',3)[0])}`);
  await fit();assert.deepEqual(errors,[]);await context.close();console.log(`PASS daily arithmetic: 3 levels, grading, retries, persistence and WIB rollover at ${width}px`);
 }
 const context=await browser.newContext();await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};});const page=await context.newPage();await page.goto(origin+'/mastering-perkalian-pembagian');await page.getByText(/Penyimpanan perangkat tidak tersedia/).waitFor();assert.equal(await page.getByRole('textbox').count(),7);await context.close();
 const c=await browser.newContext(),p=await c.newPage();const r=await p.goto(origin+'/mastering-perkalian-pembagian/level-9');assert.equal(r.status(),404);await c.close();
}finally{await browser.close()}
function label(q){return [q.blank===0?'kosong':q.left,q.operator==='×'?'dikali':'dibagi',q.blank===1?'kosong':q.right,'sama dengan',q.blank===2?'kosong':q.result].join(' ')}
