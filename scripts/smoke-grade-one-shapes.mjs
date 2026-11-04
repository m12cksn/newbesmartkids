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
 // Complete all subtopic practices and 24 assessment questions with correct answers.
 await page.getByRole("button",{name:"Segitiga",exact:true}).click();
 await page.getByRole("button",{name:"Periksa jawaban"}).click();
 await page.getByRole("button",{name:/Submateri berikutnya/}).click();
 await page.getByRole("button",{name:"Latihan submateri →"}).click();
 for(const answer of ["Jam dinding","Bingkai foto"]){
  await page.getByRole("button",{name:answer,exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban"}).click();
  await page.getByRole("button",{name:/Berikutnya|Submateri berikutnya/}).click();
 }
 await page.getByRole("button",{name:"Gabungkan segitiga"}).click();
 await page.getByText("Dua segitiga → satu segi empat").waitFor();
 await page.getByRole("button",{name:"Latihan submateri →"}).click();
 for(const answer of ["Segi empat","Dua segitiga"]){
  await page.getByRole("button",{name:answer,exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban"}).click();
  await page.getByRole("button",{name:/Berikutnya|Mulai evaluasi/}).click();
 }
 const assessmentAnswers=["Keduanya memiliki tepi melengkung","Segi empat","Pintu","Empat sisi lurus","Potongan semangka segitiga","Dua segitiga","Penggaris segitiga","Tiga sisi utama","Dua sisi miring","Telur","Jumlah sisinya","Segitiga","Pintu, buku, jendela","Segi empat","Sama-sama bertepi lengkung","Melon","Diagonal","Keduanya tetap segitiga","Buku dan pintu","Dua","Dua","Empat","Empat","Piring dan telur; jendela dan buku"];
 for(let i=0;i<assessmentAnswers.length;i++){
  await page.getByText(`Soal ${i+1} dari 24`).waitFor();
  await page.getByRole("button",{name:assessmentAnswers[i],exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban"}).click();
  await page.getByText("Benar!",{exact:true}).waitFor();
  await page.getByRole("button",{name:i===23?"Lihat hasil":"Berikutnya →"}).click();
 }
 await page.getByText("24/24").waitFor();
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:844});
  await page.reload({waitUntil:"domcontentloaded"});
  const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
  assert.ok(dims.document<=dims.viewport+1,`horizontal overflow at ${width}: ${JSON.stringify(dims)}`);
 }
 console.log("PASS Chapter 4: interaction, matching, practice, responsive widths");
}finally{await browser.close()}
