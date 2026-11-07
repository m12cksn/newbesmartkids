import assert from "node:assert/strict";
import { chromium } from "playwright";
import { assessment, practice, topics } from "../src/data/cambridge-ratio.ts";
const browser=await chromium.launch({headless:true});
try {
  for(const width of [320,390,768,1280]){
    const page=await browser.newPage({viewport:{width,height:900}});
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    const button=name=>page.getByRole("button",{name,exact:true});
    const fit=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
    async function answer(q,value=q.answer) {
      if(q.options) return button(value).click();
      if(!q.answer.includes(":")) return page.getByRole("textbox",{name:"Answer",exact:true}).fill(value);
      const [a,b]=value.split(":");
      await page.getByRole("textbox",{name:"First term"}).fill(a);
      assert.equal(await button("Next →").count(),0);
      await page.getByRole("textbox",{name:"Second term"}).fill(b);
    }
    await page.goto((process.env.TEST_ORIGIN??"http://127.0.0.1:3000")+"/kelas/konsep-inti-matematika-kelas-6");
    await page.getByRole("link",{name:/Ratio and Proportion/}).click();
    for(const [i,topic] of topics.entries()){
      await button(topic.title).click();
      await page.getByRole("slider").fill("4");
      if(i===0){
        await button("Show individual counters").click();
        await page.getByRole("img",{name:"Blue: 12 equal parts"}).waitFor();
      }else{
        await button("Switch to recipe").click();
        await page.getByText(/12 people need 360 g/).waitFor();
      }
      await fit();
      await button("Practise this topic").click();
      for(const [j,q] of practice[i].entries()){
        assert.ok(await button("Check answer").isDisabled());
        await answer(q);
        await button("Check answer").click();
        await page.getByText("Correct!",{exact:true}).waitFor();
        await fit();
        await button(j===4?"View results":"Next →").click();
      }
      await page.getByText("Correct 5 · Incorrect 0 · Score 100/100",{exact:true}).waitFor();
      await button("Back to lesson").click();
    }
    await button("Assessment").click();
    for(const [i,q] of assessment.entries()){
      assert.equal(await button("Next →").count(),0);
      assert.equal(await button("View results").count(),0);
      await answer(q,i===0?"1:1":q.answer);
      await fit();
      await button(i===23?"View results":"Next →").click();
    }
    await page.getByText("Correct 23 · Incorrect 1 · Score 96/100",{exact:true}).waitFor();
    await page.getByText("Review incorrect answers",{exact:true}).click();
    await page.getByText(/Correct answer: 3:5/).waitFor();
    assert.deepEqual(errors,[]);
    await page.close();
    console.log(`PASS Cambridge ratio at ${width}px`);
  }
}finally{await browser.close();}
