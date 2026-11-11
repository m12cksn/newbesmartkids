import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3000";
const folder=process.env.CHAPTER_SCREENSHOTS??"/tmp/homepage-screenshots";
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 for(const width of [320,390,768,1280]){
  for(const reducedMotion of ["no-preference","reduce"]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion});page.setDefaultTimeout(10000);
   const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
   await page.goto(origin+"/");
   await page.getByRole("heading",{level:1,name:/Matematika yang/}).waitFor();
   for(const name of ["Tiga langkah belajar","Materi terbaru","Mulai dari kelasmu","Mastering Matematika Harian"])await page.getByRole("heading",{name,exact:true}).waitFor({state:"attached"});
   // Peraga pecahan di hero.
   await page.getByRole("slider",{name:"Banyak bagian"}).fill("8");
   await page.getByRole("slider",{name:"Bagian diarsir"}).fill("2");
   await page.getByRole("img",{name:"Lingkaran dibagi 8 bagian, 2 bagian diarsir"}).waitFor();
   await page.locator("p[aria-live=polite]").filter({hasText:"25%"}).first().waitFor();
   // Kartu kelas menampilkan jumlah materi nyata, dan tab fase tetap berfungsi.
   await page.locator("#kelas").getByText(/^\d+ materi$/).first().waitFor({state:"attached"});
   await page.getByRole("tab",{name:"Mahir"}).click();
   assert.equal(await page.locator('#kelas a[href^="/kelas/"]').count(),3);
   await page.getByRole("tab",{name:"Semua kelas"}).click();
   const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
   assert.ok(size.scroll<=size.inner,`overflow ${width}: ${JSON.stringify(size)}`);
   if(reducedMotion==="reduce"){
    const animated=await page.evaluate(()=>[...document.querySelectorAll(".bsk-drift,.bsk-marquee,.bsk-ticker,.bsk-reveal")].filter(el=>getComputedStyle(el).animationName!=="none").length);
    assert.equal(animated,0,"animasi harus mati saat reduced motion");
    if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-home.png`,fullPage:true});
   }
   // Jalur klik: materi terbaru, kelas, dan latihan harian.
   const latest=page.locator("#materi-terbaru a[href*='/materi/']").first();
   const href=await latest.getAttribute("href");await latest.click();await page.waitForURL(`**${href}`);await page.getByRole("heading",{level:1}).waitFor();
   await page.goto(origin+"/");await page.locator('#kelas a[href="/kelas/konsep-inti-matematika-kelas-6"]').click();await page.waitForURL("**/kelas/konsep-inti-matematika-kelas-6");
   await page.goto(origin+"/");await page.getByRole("link",{name:"Mulai latihan harian →",exact:true}).click();await page.waitForURL("**/mastering-perkalian-pembagian/level-1");
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log(`PASS beranda ${width}px: hero, peraga pecahan, jumlah materi, tab kelas, jalur klik, tanpa overflow, reduced motion`);
 }
}finally{await browser.close()}
