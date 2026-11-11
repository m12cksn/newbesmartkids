import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import {assessment,practice,topics,SEP} from "../src/data/grade-three-plane-elements.ts";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3000";
const folder=process.env.CHAPTER_SCREENSHOTS??"/tmp/grade-three-plane-elements-screenshots";
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(10000);
  const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
  const button=name=>page.getByRole("button",{name,exact:true});
  const fit=async label=>{const s=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));assert.ok(s.scroll<=s.inner,`overflow ${width} ${label}: ${JSON.stringify(s)}`)};
  const shot=async name=>{if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true})};
  const result=()=>page.getByTestId("lab-result").getAttribute("data-value");
  async function answer(q,value=q.answer){
   const v=value.split(SEP);
   for(const [i,p] of q.parts.entries()){
    const x=v[i];
    if(p.kind==="number")await page.getByRole("textbox",{name:p.label,exact:true}).fill(x);
    else if(p.kind==="choice")await page.getByRole("group",{name:`Bagian ${i+1}`}).getByRole("button",{name:x,exact:true}).click();
    else if(p.kind==="check"){for(const k of x.split(",").filter(Boolean))await button(`Centang ${p.cards[Number(k)].name}`).click();}
    else if(p.kind==="sort"){for(const [k,it] of p.items.entries())await page.getByRole("group",{name:it.name,exact:true}).getByRole("button",{name:p.bins[Number(x.split(",")[k])],exact:true}).click();}
    else if(p.kind==="order"){for(const k of x.split(","))await button(`Sudut ${p.cards[Number(k)].name}`).click();}
    else if(p.kind==="angle")await page.getByRole("slider",{name:"Putar kaki OB"}).fill(x);
    else if(p.kind==="segment")await page.getByRole("slider",{name:`Tarik titik ${p.label[1]}`}).fill(x.replace(",","."));
    else for(let k=0;k<Number(x)-1;k++)await button(`Potong ${k+1}`).click();
   }
  }
  await page.goto(`${origin}/kelas/dasar-matematika-kelas-3`);
  await page.getByRole("link",{name:/Unsur-Unsur Bangun Datar/}).first().click();
  await page.getByRole("heading",{name:"Unsur-Unsur Bangun Datar",level:1}).waitFor();
  await page.getByText("Video pembelajaran segera hadir").waitFor();

  for(const [t,set] of practice.entries()){
   if(t>0)await button(`${topics[t].code}. ${topics[t].title}`).click();
   if(t===0){await page.getByRole("slider",{name:"Tarik titik B"}).fill("7.3");await page.getByText("7 cm 3 mm").first().waitFor();await page.getByRole("slider",{name:"Banyak sisi"}).fill("6");assert.equal(await result(),"6");await page.getByText(/AB, BC, CD, DE, EF, FA/).waitFor();}
   if(t===1){await page.getByRole("slider",{name:"Putar kaki OB"}).fill("90");assert.equal(await result(),"90");await page.getByTestId("lab-result").filter({hasText:"Sudut siku-siku"}).waitFor();await page.getByRole("slider",{name:"Putar kaki OB"}).fill("120");await page.getByTestId("lab-result").filter({hasText:"240°"}).waitFor();}
   if(t===2){await page.getByRole("slider",{name:"Putar garis biru"}).fill("0");assert.equal(await result(),"sejajar");await page.getByRole("slider",{name:"Putar garis biru"}).fill("90");assert.equal(await result(),"tegak lurus");await page.getByRole("slider",{name:"Putar garis biru"}).fill("45");assert.equal(await result(),"berpotongan");}
   await fit(`lab ${t}`);await shot(`lab-${topics[t].code}`);
   await button("Latihan materi →").click();
   let wrong=0;
   for(const [k,q] of set.entries()){
    assert.ok(await button("Periksa jawaban").isDisabled(),`gating ${t}-${k}`);
    const miss=t===2&&k===0;
    await answer(q,miss?"1":q.answer);if(miss)wrong++;
    await button("Periksa jawaban").click();await page.getByText(miss?"Belum tepat.":"Tepat!",{exact:true}).waitFor();
    await fit(`latihan ${t}-${k}`);await shot(`practice-${topics[t].code}-${k+1}`);
    await button(k===set.length-1?"Lihat hasil":"Lanjut →").click();
   }
   await page.getByText(`Benar ${set.length-wrong} · Salah ${wrong} · Skor ${Math.round((set.length-wrong)/set.length*100)}/100`,{exact:true}).waitFor();
   await button("Kembali ke materi").click();
  }

  await button("Evaluasi · 24 soal").click();
  for(const [i,q] of assessment.entries()){
   await page.getByText(`Soal ${i+1}/24`).waitFor();
   assert.equal(await button("Lanjut →").count(),0,`gating evaluasi ${i+1}`);
   await answer(q,i===0?"Ruas garis":q.answer);
   await fit(`evaluasi ${i+1}`);await shot(`assessment-${String(i+1).padStart(2,"0")}`);
   await button(i===23?"Lihat hasil":"Lanjut →").click();
  }
  await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
  await page.getByText("Bahas jawaban yang salah",{exact:true}).click();
  await page.getByText(/Jawaban benar Garis\./).waitFor();
  await fit("hasil");await shot("result");
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS kelas 3 bab 4 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
 }
}finally{await browser.close()}
