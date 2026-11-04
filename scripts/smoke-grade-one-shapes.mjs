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
 await page.getByRole("button",{name:"Periksa jawaban & lanjut"}).click();
 // Complete all subtopic practices and 24 assessment questions with correct answers.
 await page.getByRole("button",{name:"Segitiga",exact:true}).click();
 await page.getByRole("button",{name:"Periksa jawaban & lanjut"}).click();
 await page.getByRole("button",{name:"Latihan submateri →"}).click();
 for(const answer of ["Jam dinding","Bingkai foto"]){
  await page.getByRole("button",{name:answer,exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban & lanjut"}).click();
 }
 await page.getByRole("button",{name:"Gabungkan segitiga"}).click();
 await page.getByText("Dua segitiga → satu segi empat").waitFor();
 await page.getByRole("button",{name:"Latihan submateri →"}).click();
 for(const answer of ["Segi empat","Dua segitiga"]){
  await page.getByRole("button",{name:answer,exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban & lanjut"}).click();
 }
 const assessmentAnswers=["Keduanya memiliki tepi melengkung","Pintu","Diagonal","Potongan semangka segitiga","Segi empat","Sama-sama bertepi lengkung","Tiga sisi utama","Buku dan pintu","Dua segitiga","Telur","Pintu, buku, jendela","Keduanya tetap segitiga","Empat sisi lurus","Dua","Dua sisi miring","Melon","Penggaris segitiga","Empat","Jumlah sisinya","Piring dan telur; jendela dan buku","Segi empat","Empat","Segitiga","Dua"];
 for(let i=0;i<assessmentAnswers.length;i++){
  await page.getByText(`Soal ${i+1} dari 24`).waitFor();
  const matchIndices=new Map([[3,"Buku"],[6,"Penggaris segitiga"],[7,"Gantungan baju"]]);
  const pieceIndices=new Set([8,21,23]);
  if(matchIndices.has(i)){await page.getByRole("button",{name:"Mulai garis dari "+matchIndices.get(i)}).click();await page.getByRole("button",{name:assessmentAnswers[i],exact:true}).click()}
  else if(pieceIndices.has(i)){await page.getByRole("button",{name:assessmentAnswers[i],exact:true}).click();await page.getByRole("button",{name:"Tempat memasukkan potongan"}).click()}
  else await page.getByRole("button",{name:assessmentAnswers[i],exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban & lanjut"}).click();
 }
 await page.getByText("24/24").waitFor();
 await page.getByText("Soal 24.",{exact:false}).waitFor();
 assert.equal(await page.getByText("✓ Benar",{exact:true}).count(),24);
 // Regression: retake with one incorrect response; the final review must show both statuses.
 await page.getByRole("button",{name:"Ulangi evaluasi"}).click();
 for(let i=0;i<assessmentAnswers.length;i++){
  await page.getByText(`Soal ${i+1} dari 24`).waitFor();
  const answer=i===0?"Keduanya memiliki tiga sudut":assessmentAnswers[i];
  await page.getByRole("button",{name:answer,exact:true}).click();
  await page.getByRole("button",{name:"Periksa jawaban & lanjut"}).click();
 }
 await page.getByText("23/24").waitFor();
 assert.equal(await page.getByText("✗ Salah",{exact:true}).count(),1);
 assert.equal(await page.getByText("✓ Benar",{exact:true}).count(),23);
 await page.getByText("Pembahasan:",{exact:false}).first().waitFor();
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:844});
  await page.reload({waitUntil:"domcontentloaded"});
  const dims=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,document:document.documentElement.scrollWidth}));
  assert.ok(dims.document<=dims.viewport+1,`horizontal overflow at ${width}: ${JSON.stringify(dims)}`);
 }
 console.log("PASS Chapter 4: interaction, matching, practice, responsive widths");
}finally{await browser.close()}
