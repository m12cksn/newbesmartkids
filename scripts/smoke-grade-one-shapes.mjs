import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const url="http://127.0.0.1:3000/kelas/matematika-dasar-kelas-1/materi/mengenal-bentuk";
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.getByRole("heading",{name:"Mengenal Bentuk"}).waitFor();
 await page.getByRole("button",{name:"Segi empat",exact:true}).first().click();
 await page.getByLabel("Ukuran bentuk").fill("120");
 await page.getByLabel("Bentuk Jam dinding").selectOption("Bentuk lengkung");
 await page.getByRole("button",{name:"Latihan submateri →"}).click();
 await page.getByText("Soal 1 dari 2").waitFor();
 await page.getByRole("button",{name:"Bentuk lengkung",exact:true}).click();
 await page.getByRole("button",{name:"Periksa jawaban"}).click();
 await page.getByText("Benar!",{exact:true}).waitFor();
 await page.getByRole("button",{name:/Berikutnya/}).click();
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:844});
  await page.reload({waitUntil:"domcontentloaded"});
  const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
  assert.ok(dims.document<=dims.viewport+1,`horizontal overflow at ${width}: ${JSON.stringify(dims)}`);
 }
 console.log("PASS Chapter 4: interaction, matching, practice, responsive widths");
}finally{await browser.close()}
