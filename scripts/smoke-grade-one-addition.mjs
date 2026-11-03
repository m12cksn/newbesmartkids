import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844}});
const url="http://127.0.0.1:3000/kelas/matematika-dasar-kelas-1/materi/penjumlahan-sampai-dengan-10";
await page.goto(url,{waitUntil:"domcontentloaded"});
await page.getByRole("heading",{name:"Penjumlahan sampai dengan 10"}).waitFor();
await page.getByRole("button",{name:/Latihan Cerita Penjumlahan/}).click();
await page.getByRole("textbox",{name:"Bilangan kedua"}).fill("2");
await page.getByRole("textbox",{name:"Jumlah seluruhnya"}).fill("3");
await page.getByRole("button",{name:"Periksa jawaban"}).click();
await page.getByText("Benar!",{exact:true}).waitFor();
await page.getByRole("button",{name:/Berikutnya/}).click();
await page.getByRole("textbox",{name:"Bilangan kedua"}).fill("3");
await page.getByRole("textbox",{name:"Jumlah seluruhnya"}).fill("6");
await page.getByRole("button",{name:"Periksa jawaban"}).click();
await page.getByRole("button",{name:/Lanjut ke submateri berikutnya/}).click();
await page.getByRole("heading",{name:"Pasangan Bilangan"}).waitFor();
await page.getByRole("button",{name:/Latihan Pasangan Bilangan/}).click();
await page.getByRole("textbox",{name:"Bilangan yang hilang"}).fill("2");
await page.getByRole("button",{name:"Periksa jawaban"}).click();
await page.getByText("Benar!",{exact:true}).waitFor();
await page.getByRole("button",{name:/Berikutnya/}).click();
await page.getByRole("textbox",{name:"Bilangan yang hilang"}).fill("3");
await page.getByRole("button",{name:"Periksa jawaban"}).click();
await page.getByRole("button",{name:/Lanjut ke submateri berikutnya/}).click();
await page.getByRole("button",{name:"Langkah maju →"}).click();
await page.getByText(/Sekarang di 4/).waitFor();
await page.getByRole("button",{name:"Ulangi"}).click();
await page.getByText(/Sekarang di 3/).waitFor();
const overflow=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,offenders:[...document.querySelectorAll("body *")].filter(el=>{const r=el.getBoundingClientRect();const s=getComputedStyle(el);return r.right>document.documentElement.clientWidth+1&&s.position!=="fixed"&&s.position!=="absolute"&&s.overflowX!=="auto"&&s.overflowX!=="scroll"}).slice(0,12).map(el=>({tag:el.tagName,className:typeof el.className==="string"?el.className.slice(0,100):"",right:Math.round(el.getBoundingClientRect().right)}))}));console.log("Mobile overflow diagnostics",JSON.stringify(overflow));assert.ok(overflow.document<=overflow.viewport+1,"mobile horizontal overflow");
for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:844});
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByRole("heading",{name:"Penjumlahan sampai dengan 10"}).waitFor();
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
  assert.ok(dimensions.document<=dimensions.viewport+1,`document overflow at ${width}px: ${JSON.stringify(dimensions)}`);
  console.log(`PASS: no document overflow at ${width}px`);
}
console.log("PASS: mobile practice, inline equations, number bond and active number line");
}finally{await browser.close()}
