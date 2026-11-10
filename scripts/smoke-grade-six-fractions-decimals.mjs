import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import {assessment,practice,topics,parseFraction} from "../src/data/grade-six-fractions-decimals.ts";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3000";
const folder=process.env.CHAPTER_SCREENSHOTS??"/tmp/grade-six-fractions-screenshots";
await mkdir(folder,{recursive:true});
const itemNames={mango:"Pohon mangga",orange:"Pohon jeruk",guava:"Pohon jambu",pastel:"Kue pastel"};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(10000);
  const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
  const button=name=>page.getByRole("button",{name,exact:true});
  const fit=async label=>{const size=await page.evaluate(()=>({inner:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll("body *")].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(-6).map(el=>`${el.tagName}.${el.getAttribute("class")?.slice(0,60)}`)}));assert.ok(size.scroll<=size.inner,`overflow ${width} ${label}: ${JSON.stringify(size)}`)};
  const shot=async name=>{if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true})};
  const result=async()=>page.getByTestId("lab-result").getAttribute("data-value");
  const expectResult=async v=>{for(let i=0;i<40&&await result()!==v;i++)await page.waitForTimeout(50);assert.equal(await result(),v)};

  async function answer(q,value=q.answer){
   const r=q.response;
   switch(r.kind){
    case "choice":await button(r.pictures?`Gambar ${value}`:value).click();break;
    case "multi":for(const v of value.split("|"))await button(`Gambar ${v}`).click();break;
    case "fraction":{const [n,d]=parseFraction(value);if(n>d&&n%d){await page.getByRole("textbox",{name:"Bilangan bulat"}).fill(String(Math.floor(n/d)));await page.getByRole("textbox",{name:"Pembilang"}).fill(String(n%d));}else await page.getByRole("textbox",{name:"Pembilang"}).fill(String(n));await page.getByRole("textbox",{name:"Penyebut"}).fill(String(d));break;}
    case "decimal":await page.getByRole("textbox",{name:"Jawaban desimal"}).fill(value);break;
    case "number":await page.getByRole("textbox",{name:"Jawaban",exact:true}).fill(value);break;
    case "shade":{const first=button(`${r.label} 1 bagian 1`);await first.click();await first.click();assert.equal(await first.getAttribute("aria-pressed"),"false");
     for(const [w,row] of value.split("|").entries())for(const [p,c] of [...row].entries())if(c==="1")await button(`${r.label} ${w+1} bagian ${p+1}`).click();break;}
    case "grid":{const k=value.split(",").length,cols=Math.floor(k/10);for(let c=0;c<cols;c++)await button(`Petak ${c*10+1}`).click();await button("Kuas 1 petak (0,01)").click();for(let i=0;i<k%10;i++)await button(`Petak ${cols*10+i+1}`).click();await page.getByText(`${k} dari 100 petak`).waitFor();break;}
    case "mark":for(let i=0;i<value.split(",").length;i++)await button(`${itemNames[r.item]} ${i+1}`).click();break;
    case "order":for(const v of value.split("|"))await button(v).click();break;
    case "match":for(const pair of value.split("|")){const [l,d]=pair.split("=");await button(`Pecahan ${l}`).click();await button(`Desimal ${d}`).click();}await page.getByText(`${r.left.length} dari ${r.left.length} pasangan`).waitFor();break;
    case "line":await button(`Titik ${(Number(value)/100).toFixed(2).replace(".",",")}`).click();break;
    case "place":for(const [i,d] of value.split("|").entries())await page.getByRole("textbox",{name:["Puluhan","Satuan","Persepuluhan","Perseratusan"][i],exact:true}).fill(d);break;
   }
  }

  await page.goto(`${origin}/kelas/konsep-inti-matematika-kelas-6`);
  await page.getByRole("link",{name:/Pecahan dan Desimal/}).first().click();
  await page.getByRole("heading",{name:"Pecahan dan Desimal",level:1}).waitFor();
  await page.getByText("Video pembelajaran segera hadir").waitFor();await fit("top");await shot("00-top");

  for(const [i,t] of topics.entries()){
   await button(`${t.code} ${t.short}`).click();
   await page.getByRole("heading",{name:t.title}).waitFor();
   const tryIt=async(w,n,d,ok=true)=>{await page.getByRole("textbox",{name:"Coba bilangan bulat"}).fill(w);await page.getByRole("textbox",{name:"Coba pembilang"}).fill(n);await page.getByRole("textbox",{name:"Coba penyebut"}).fill(d);await button("Periksa").click();await page.getByRole("status").filter({hasText:ok?"Tepat!":"Belum tepat."}).waitFor();};
   if(i===0){await expectResult("9/4");await button("Langkah berikutnya").click();await page.getByText("9 potongan",{exact:false}).first().waitFor();await button("Langkah berikutnya").click();await page.getByText(/disusun menjadi 2 utuh/).waitFor();await tryIt("","9","12",false);await tryIt("2","1","4");await page.getByRole("slider",{name:"Banyak kelompok"}).fill("2");await expectResult("3/2");}
   if(i===1){await button("Bagi menjadi 3 kelompok").click();await button("Kelompok 1, 4 benda").click();await button("Kelompok 3, 4 benda").click();await expectResult("8");await page.getByTestId("lab-result").filter({hasText:/Bandingkan:/}).waitFor();await button("Kelompok 2, 4 benda").click();await page.getByText(/Terlalu banyak/).waitFor();}
   if(i===2){await expectResult("1/6");await button("Langkah berikutnya").click();await page.getByText(/12 potongan kecil/).waitFor();await button("Langkah berikutnya").click();await page.getByTestId("lab-result").filter({hasText:/lebih kecil dari/}).waitFor();await tryIt("","2","12");}
   if(i===3){for(let k=0;k<7;k++)await button("Lompat 2/5").click();assert.ok(await button("Lompat 2/5").isDisabled());await expectResult("7");await page.getByText(/7 lompatan penuh/).waitFor();await tryIt("7","1","2");}
   if(i===4){await expectResult("");await button("× 2").click();await page.getByText(/belum 10 atau 100/).waitFor();await button("× 5").click();await expectResult("0,35");await page.getByRole("textbox",{name:"Coba desimal"}).fill("0,35");await button("Periksa").click();await page.getByRole("status").filter({hasText:"Tepat!"}).waitFor();}
   if(i===5){await expectResult("<");await button("Samakan angka di belakang koma").click();await page.getByText("3,48 < 3,70",{exact:true}).waitFor();await page.getByRole("combobox",{name:"Bilangan B persepuluhan"}).selectOption("3");await expectResult(">");await page.getByRole("combobox",{name:"Bilangan B persepuluhan"}).selectOption("4");await page.getByRole("combobox",{name:"Bilangan B perseratusan"}).selectOption("8");await expectResult("=");}
   await fit(`lab ${t.code}`);await shot(`lab-${i+1}`);

   await button("Latihan materi →").click();
   const set=practice[i];let wrong=0;
   for(const [k,q] of set.entries()){
    assert.ok(await button("Periksa jawaban").isDisabled(),`gating latihan ${t.code}-${k+1}`);
    const miss=i===5&&k===1;
    await answer(q,miss?"2,6 < 2,58":q.answer);if(miss)wrong++;
    await button("Periksa jawaban").click();
    await page.getByText(miss?"Belum tepat.":"Tepat!",{exact:true}).waitFor();
    await fit(`latihan ${t.code}-${k+1}`);await shot(`practice-${i+1}-${k+1}`);
    await button(k===set.length-1?"Lihat hasil":"Lanjut →").click();
   }
   await page.getByText(`Benar ${set.length-wrong} · Salah ${wrong} · Skor ${Math.round((set.length-wrong)/set.length*100)}/100`,{exact:true}).waitFor();
   await button("Kembali ke materi").click();
  }

  await button("Evaluasi · 24 soal").click();
  for(const [i,q] of assessment.entries()){
   await page.getByText(`Soal ${i+1}/24`).waitFor();
   assert.equal(await button("Lanjut →").count(),0,`gating evaluasi ${i+1}`);assert.equal(await button("Lihat hasil").count(),0);
   await answer(q,i===0?"10000|10000|10000":q.answer);
   await fit(`evaluasi ${i+1}`);await shot(`assessment-${String(i+1).padStart(2,"0")}`);
   await button(i===23?"Lihat hasil":"Lanjut →").click();
  }
  await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
  await page.getByText("Bahas jawaban yang salah",{exact:true}).click();
  await page.getByText(/Jawaban benar 2, 2, 2 bagian diarsir/).waitFor();
  await fit("hasil");await shot("result");
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS kelas 6 bab 1 at ${width}px: 6 lab, ${practice.flat().length} latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
 }
}finally{await browser.close()}
