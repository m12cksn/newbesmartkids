import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
const root="http://127.0.0.1:3000/kelas/matematika-dasar-kelas-1/materi/";
try {
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<768});
  for(const chapter of [5,6]){
   await page.goto(root+(chapter===5?"membilang-sampai-dengan-20":"penjumlahan-dan-pengurangan-sampai-dengan-20"));
   await page.getByRole(chapter===5?"button":"tab",{name:chapter===5?/^D\. Membandingkan/:/^C\. Pengurangan/}).click();
   await page.getByRole("button",{name:new RegExp(`^Evaluasi Bab ${chapter}`)}).click();
   let score=0;
   for(let i=0;i<24;i++){
    const check=page.getByRole("button",{name:"Periksa jawaban",exact:true});
    assert.equal(await check.isDisabled(),true);
    const answer=page.getByRole("spinbutton",{name:"Jawaban",exact:true});
    const tens=page.getByRole("spinbutton",{name:"Puluhan",exact:true});
    const draw=page.getByRole("button",{name:"+ Gambar",exact:true});
    if(await tens.count()){
     await tens.fill("1");
     await page.getByRole("spinbutton",{name:"Satuan",exact:true}).fill("1");
    }else if(await draw.count()){
     await draw.click();
    }else if(await answer.count()){
     const move=page.getByRole("button",{name:/^(Maju →|← Mundur)$/});
     for(let n=0;await move.count()&&!(await move.isDisabled())&&n<20;n++) await move.click();
     const slider=page.getByRole("slider",{name:"Bagian untuk membuat 10"});
     if(await slider.count()) await slider.fill("1");
     await answer.fill("0");
    }else{
     const option=page.getByRole("button",{name:/^\d+$/}).first();
     await option.click();
    }
    await check.click();
    const status=page.getByRole("status");
    if(/^(Benar!|Bagus,)/.test(await status.innerText())) score++;
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Bab ${chapter}, soal ${i+1}, ${width}px`);
    await page.getByRole("button",{name:chapter===5&&i===23?"Lihat hasil":"Soal berikutnya →",exact:true}).click();
   }
   await page.getByText(`Benar ${score} · Salah ${24-score} · Skor ${Math.round(score/24*100)}/100`,{exact:true}).waitFor();
   console.log(`Bab ${chapter} ${width}px: ${score}/24, ringkasan sesuai`);
  }
  await page.close();
 }
} finally { await browser.close(); }
