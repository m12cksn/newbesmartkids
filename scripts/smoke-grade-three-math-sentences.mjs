import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {chromium} from "playwright";
import {assessment,practice,topics,rows} from "../src/data/grade-three-math-sentences.ts";

const origin=process.env.TEST_ORIGIN??"http://127.0.0.1:3000";
const folder=process.env.CHAPTER_SCREENSHOTS??"/tmp/grade-three-math-sentences-screenshots";
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
  const clicks=async(name,n)=>{for(let i=0;i<n;i++)await button(name).click()};
  async function answer(q,value=q.answer){
   if(q.kind==="sentence")return box("Isi titik-titik").fill(value);
   if(q.kind==="story")return box("Jawaban").fill(value);
   const p=q.possibilities;
   for(const [r,row] of rows(value).entries())for(const [c,v] of row.entries())if(p.fixed?.col!==c)await box(`Baris ${r+1} ${p.headers[c]}`).fill(v);
  }

  // Jalur klik dari beranda kelas 3.
  await page.goto(`${origin}/kelas/dasar-matematika-kelas-3`);
  await page.getByRole("link",{name:/Kalimat Matematika/}).first().click();
  await page.getByRole("heading",{name:"Kalimat Matematika",level:1}).waitFor();
  await page.getByText("Video pembelajaran segera hadir").waitFor();

  // Lab A: kantong kelereng.
  await clicks("Tambah 10",2);assert.equal(await result(),"20");await page.getByText(/Pas!/).waitFor();
  await button("… + 36 = 68").click();await clicks("Tambah 10",3);await clicks("Tambah 1",3);await page.getByText(/kelebihan 1/).waitFor();await button("Kurangi 1").click();assert.equal(await result(),"32");await page.getByText(/Pas!/).waitFor();
  await box("Coba isi titik-titik").fill("24");await button("Periksa").click();await page.getByRole("status").filter({hasText:"Belum tepat."}).waitFor();
  await box("Coba isi titik-titik").fill("25");await button("Periksa").click();await page.getByRole("status").filter({hasText:"Tepat!"}).waitFor();
  await page.getByRole("slider",{name:"Penonton laki-laki"}).fill("30");await button("Simpan kemungkinan (0/5)").click();await page.getByText("30 + 65 = 95").first().waitFor();
  await fit("lab A");await shot("lab-a");

  for(const [t,set] of practice.entries()){
   if(t===1){await button("B. Kalimat Matematika Berkaitan dengan Pengurangan").click();
    // Lab B: toples permen.
    await clicks("Ambil 10",3);await clicks("Ambil 1",5);assert.equal(await result(),"35");await page.getByText(/Pas!/).waitFor();
    await button("… − 45 = 26").click();await clicks("Tambah 10",7);await button("Tambah 1").click();assert.equal(await result(),"71");await page.getByText(/Pas!/).waitFor();
    await box("Coba isi titik-titik").fill("23");await button("Periksa").click();await page.getByRole("status").filter({hasText:"Tepat!"}).waitFor();
    await page.getByRole("slider",{name:"Televisi terjual"}).fill("15");await button("Simpan kemungkinan (0/5)").click();await page.getByText("40 − 15 = 25").first().waitFor();
    await fit("lab B");await shot("lab-b");}
   await button("Latihan materi →").click();
   let wrong=0;
   for(const [k,q] of set.entries()){
    assert.ok(await button("Periksa jawaban").isDisabled(),`gating latihan ${t}-${k}`);
    const miss=t===0&&q.kind==="possibilities";
    // Baris kembar harus ditolak.
    const value=miss?rows(q.answer).map((r,i)=>(i===4?rows(q.answer)[0]:r).join(",")).join(";"):q.answer;
    await answer(q,value);if(miss)wrong++;
    await button("Periksa jawaban").click();await page.getByText(miss?"Belum tepat.":"Tepat!",{exact:true}).waitFor();
    await fit(`latihan ${t}-${k}`);await shot(`practice-${t+1}-${k+1}`);
    await button(k===set.length-1?"Lihat hasil":"Lanjut →").click();
   }
   await page.getByText(`Benar ${set.length-wrong} · Salah ${wrong} · Skor ${Math.round((set.length-wrong)/set.length*100)}/100`,{exact:true}).waitFor();
   await button("Kembali ke materi").click();
  }

  await button("Evaluasi · 24 soal").click();
  for(const [i,q] of assessment.entries()){
   await page.getByText(`Soal ${i+1}/24`).waitFor();
   assert.equal(await button("Lanjut →").count(),0,`gating evaluasi ${i+1}`);
   await answer(q,i===0?String(Number(q.answer)+10):q.answer);
   await fit(`evaluasi ${i+1}`);await shot(`assessment-${String(i+1).padStart(2,"0")}`);
   await button(i===23?"Lihat hasil":"Lanjut →").click();
  }
  await page.getByText("Benar 23 · Salah 1 · Skor 96/100",{exact:true}).waitFor();
  await page.getByText("Bahas jawaban yang salah",{exact:true}).click();
  await page.getByText(`Jawaban benar ${assessment[0].answer}.`,{exact:false}).waitFor();
  await fit("hasil");await shot("result");
  assert.deepEqual(errors,[]);await page.close();
  console.log(`PASS kelas 3 bab 2 at ${width}px: 2 lab, ${practice.flat().length} latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
 }
}finally{await browser.close()}
