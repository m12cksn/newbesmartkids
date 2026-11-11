import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const folder='/tmp/grade-six-cubes-screenshots';await mkdir(folder,{recursive:true});
const browser=await chromium.launch();
try{for(const width of [320,390,768,1280]){
 const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,isMobile:width<768});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.TEST_ORIGIN??'http://127.0.0.1:3000')+'/kelas/konsep-inti-matematika-kelas-6/materi/kubus-dan-balok');
 await page.getByRole('button',{name:'B. Visualisasi Spasial',exact:true}).click();const lab=page.getByTestId('cube-lab-B');
 const cell=lab.getByRole('button',{name:'Petak baris 1 kolom 1',exact:true});await cell.click();assert.equal(await cell.getAttribute('aria-pressed'),'true');
 await lab.getByRole('button',{name:'Mode 3D · putar dengan mouse / jari',exact:true}).click();const viewer=lab.getByTestId('cube-orbit'),svg=viewer.locator('svg').first();await svg.scrollIntoViewIfNeeded();
 const attr=async name=>Number(await svg.getAttribute('data-'+name));
 const box=await svg.boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y+20,{steps:8});await page.mouse.up();assert.notEqual(await attr('yaw'),45);assert.notEqual(await attr('pitch'),28);
 await page.mouse.move(x,y);await page.mouse.wheel(0,-200);await page.waitForFunction(()=>Number(document.querySelector('[data-testid="cube-orbit"] svg').dataset.zoom)>1);
 for(const [name,yaw,pitch] of [['Depan',0,0],['Kanan',90,0],['Atas',0,90]]){await viewer.getByRole('button',{name:`${name} 3D`,exact:true}).click();assert.equal(await attr('yaw'),yaw);assert.equal(await attr('pitch'),pitch);}
 await viewer.getByRole('button',{name:'Reset posisi',exact:true}).click();assert.equal(await attr('yaw'),45);assert.equal(await attr('pitch'),28);assert.equal(await attr('zoom'),1);
 await svg.focus();await page.keyboard.press('ArrowRight');assert.equal(await attr('yaw'),60);await page.keyboard.press('Home');assert.equal(await attr('yaw'),45);
 await svg.scrollIntoViewIfNeeded();const b=await svg.boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+45,y:cy-20,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(el=>Number(el.dataset.yaw)!==45,await svg.elementHandle());assert.notEqual(await attr('yaw'),45);
 await viewer.getByRole('button',{name:'Reset posisi',exact:true}).click();await svg.scrollIntoViewIfNeeded();const p=await svg.boundingBox(),px=p.x+p.width/2,py=p.y+p.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:px-25,y:py,id:1},{x:px+25,y:py,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:px-40,y:py,id:1},{x:px+40,y:py,id:2}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:px-55,y:py,id:1},{x:px+55,y:py,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(el=>Number(el.dataset.zoom)>1,await svg.elementHandle());assert.ok(await attr('zoom')>1);
 await viewer.getByRole('button',{name:'Reset posisi',exact:true}).click();assert.equal(await cell.getAttribute('aria-pressed'),'true');
 if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-orbit.png`,fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await lab.getByRole('button',{name:'Kembali ke gambar soal',exact:true}).click();assert.equal(await lab.getByTestId('cube-orbit').count(),0);assert.equal(await cell.getAttribute('aria-pressed'),'true');
 // A question model can also orbit; camera actions must not reveal or change its answer.
 await page.getByRole('button',{name:'Evaluasi · 24 soal',exact:true}).click();await page.getByRole('button',{name:'Mode 3D · putar dengan mouse / jari',exact:true}).click();await page.getByRole('button',{name:'Kanan 3D',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Lanjut →',exact:true}).count(),0);
 await page.getByRole('textbox',{name:'Banyak kubus',exact:true}).fill('5');await page.getByRole('button',{name:'Lanjut →',exact:true}).click();await page.getByRole('heading',{name:/Hubungkan tampak depan/}).waitFor();assert.equal(await page.getByTestId('cube-orbit').count(),0);assert.deepEqual(errors,[]);
 await context.close();console.log(`PASS orbit ${width}px: mouse drag, wheel, presets/reset, keyboard, real touch drag/pinch, preserved drawing and unchanged question gating.`);
}}finally{await browser.close();}
