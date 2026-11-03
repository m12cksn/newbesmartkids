import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const url="http://127.0.0.1:3000/kelas/matematika-dasar-kelas-1/materi/pengurangan-sampai-dengan-10";
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.getByRole("heading",{name:"Pengurangan sampai dengan 10"}).waitFor();
 await page.getByText("Video pembelajaran segera hadir").waitFor();
 await page.getByLabel("Jumlah mula-mula").fill("8");
 await page.getByLabel("Dikurangi").fill("3");
 await page.getByText("8 − 3 = 5").waitFor();
 await page.getByRole("button",{name:/Latihan A. Cerita Pengurangan/}).click();
 await page.getByRole("textbox",{name:"Jawaban pengurangan"}).fill("4");
 await page.getByRole("button",{name:"Periksa jawaban"}).click();
 await page.getByText("Benar!",{exact:true}).waitFor();
 await page.getByRole("button",{name:/Soal berikutnya/}).click();
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:844});
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Pengurangan sampai dengan 10"}).waitFor();
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
  assert.ok(dimensions.document<=dimensions.viewport+1,`overflow at ${width}px: ${JSON.stringify(dimensions)}`);
 }
 console.log("PASS: subtraction interactive lesson, practice, video panel and four responsive viewports");
}finally{await browser.close()}
