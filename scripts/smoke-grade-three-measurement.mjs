import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import {assessment,practice,topics,SEP} from "../src/data/grade-three-measurement.ts";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3000";
const folder=process.env.CHAPTER_SCREENSHOTS??"/tmp/grade-three-measurement-screenshots";
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE});
try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(10000);
  const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
  const button=name=>page.getByRole("button",{name,exact:true});
  const box=name=>page.getByRole("textbox",{name,exact:true});
  const fit=async label=>{const s=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));assert.ok(s.scroll<=s.inner,`overflow ${width} ${label}: ${JSON.stringify(s)}`)};
  const shot=async name=>{if(width===390||width===1280)await page.screenshot({path:`${folder}/${width}-${name}.png`,fullPage:true})};
  const result=()=>page.getByTestId("lab-result").getAttribute("data-value");
  const status=async ok=>page.getByRole("status").filter({hasText:ok?"Tepat!":"Belum tepat."}).first().waitFor();
  async function answer(q,value=q.answer){
   const v=value.split(SEP);
   for(const [i,p] of q.parts.entries()){
    if(p.kind==="number")await box(`Jawaban ${i+1}`).fill(v[i]);
    else if(p.kind==="compound"){const [a,b]=v[i].split("|");await box(`Jawaban ${i+1} ${p.units[0]}`).fill(a);await box(`Jawaban ${i+1} ${p.units[1]}`).fill(b);}
    else if(p.kind==="choice")await page.getByRole("group",{name:`Bagian ${i+1}`}).getByRole("button",{name:v[i],exact:true}).click();
    else if(p.kind==="check"){for(const k of v[i].split(",").filter(Boolean))await button(`Centang ${p.names[Number(k)]}`).click();}
    else for(const [k,it] of p.items.entries())await page.getByRole("group",{name:it.name,exact:true}).getByRole("button",{name:p.bins[Number(v[i].split(",")[k])],exact:true}).click();
   }
  }
  await page.goto(`${origin}/kelas/dasar-matematika-kelas-3`);
  await page.getByRole("link",{name:/Pengukuran Panjang dan Berat/}).first().click();
  await page.getByRole("heading",{name:"Pengukuran Panjang dan Berat",level:1}).waitFor();
  await page.getByText("Video pembelajaran segera hadir").waitFor();

  for(const [t,set] of practice.entries()){
   if(t>0)await button(`${topics[t].code}. ${topics[t].title}`).click();
   if(t===0){assert.equal(await result(),"14");await page.getByRole("slider",{name:"Geser benda"}).fill("3");await page.getByText("17 − 3",{exact:false}).first().waitFor();assert.equal(await result(),"14");
    await box("Coba cm").fill("8");await button("Periksa").click();await status(false);await box("Coba cm").fill("9");await button("Periksa").click();await status(true);}
   if(t===1){await page.getByRole("slider",{name:"Tarik meteran"}).fill("300");assert.equal(await result(),"3|0");await page.getByText(/Tepat 3 meter/).waitFor();
    await box("Coba m").fill("3");await box("Coba cm").fill("5");await button("Periksa").click();await status(true);}
   if(t===2){assert.equal(await result(),"1000");await button("Taruh Tepung").click();assert.equal(await result(),"1250");await page.getByText(/1 kg 250 gram/).waitFor();
    await box("Coba kg").fill("2");await box("Coba gram").fill("500");await button("Periksa").click();await status(true);}
   if(t===3){for(const b of ["1 kg","½ kg","2 ons","½ ons"])await button(`Tambah bandul ${b}`).click();assert.equal(await result(),"1750");await page.getByText(/Seimbang!/).waitFor();
    await box("Coba kg").fill("1");await box("Coba gram").fill("753");await button("Periksa").click();await status(true);}
   await fit(`lab ${t}`);await shot(`lab-${topics[t].code}`);
   await button("Latihan materi →").click();
   let wrong=0;
   for(const [k,q] of set.entries()){
    assert.ok(await button("Periksa jawaban").isDisabled(),`gating ${t}-${k}`);
    const miss=t===2&&k===1;
    await answer(q,miss?q.answer.replace("S (salah)","B (benar)"):q.answer);if(miss)wrong++;
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
   await answer(q,i===0?String(q.parts[0].answer+1):q.answer);
   await fit(`evaluasi ${i+1}`);await shot(`assessment-${String(i+1).padStart(2,"0")}`);
   await button(i===23?"Lihat hasil":"Lanjut →").click();
  }
  await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
  await page.getByText("Bahas jawaban yang salah",{exact:true}).click();
  await page.getByText(/Jawaban benar 9 cm/).waitFor();
  await fit("hasil");await shot("result");
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS kelas 3 bab 3 at ${width}px: 4 lab, 16 latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
 }
}finally{await browser.close()}
