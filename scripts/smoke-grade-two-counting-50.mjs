import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP } from "../src/data/grade-two-counting-50.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-counting-50-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = v[i], xs = x.split("|");
        if (p.kind === "number" || p.kind === "count") await box(p.label).fill(x);
        else if (p.kind === "words") { for (const w of x.split(" ")) await page.getByRole("group", { name: `Kata untuk ${p.label}` }).getByRole("button", { name: w, exact: true }).click(); }
        else if (p.kind === "bond") await box(`Pasangan ${p.tens === null ? "puluhan" : p.ones === null ? "satuan" : "jumlah"}`).fill(x);
        else if (p.kind === "seq") { let k = 0; for (const [j, it] of p.items.entries()) if (it === null) await box(`${p.label} ${j + 1}`).fill(xs[k++]); }
        else if (p.kind === "place") { await box("Puluhan").fill(xs[0]); await box("Satuan").fill(xs[1]); if (p.total === null) await box("Bilangan").fill(xs[2]); }
        else if (p.kind === "split") { await box("Puluhan").fill(xs[0]); await box("Satuan").fill(xs[1]); }
        else if (p.kind === "choice") await page.getByRole("group", { name: `Bagian ${i + 1}` }).getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "check") { for (const k of x.split(",").filter(Boolean)) await button(`Pilih ${p.options[Number(k)]}`).click(); }
        else if (p.kind === "order") { for (const o of xs) await page.getByRole("group", { name: p.label, exact: true }).getByRole("button", { name: o, exact: true }).click(); }
        else if (p.kind === "guess") { await box("Tebakanku").fill(String(p.answer + 3)); await box("Hitunganku").fill(xs[1]); }
        else if (p.kind === "dots") { for (const n of xs) await button(`Titik ${n}`).click(); }
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Ayo Membilang sampai 50/ }).first().click();
    await page.getByRole("heading", { name: "Ayo Membilang sampai dengan 50", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "26"); await button("+1").click(); assert.equal(await result(), "27"); await page.getByTestId("lab-result").filter({ hasText: "dua puluh tujuh" }).waitFor(); await button("+10").click(); assert.equal(await result(), "37"); await button("−1").click(); assert.equal(await result(), "36"); }
      if (t === 1) { assert.equal(await result(), "1|16"); await button("Tukar 10 satuan → 1 puluhan").click(); assert.equal(await result(), "2|6"); await button("+ Satuan").click(); assert.equal(await result(), "2|7"); await button("Pecah 1 puluhan → 10 satuan").click(); assert.equal(await result(), "1|17"); await page.getByTestId("lab-result").filter({ hasText: "= 27" }).waitFor(); }
      if (t === 2) { assert.equal(await result(), "<"); await button("Bilangan A +10").click(); assert.equal(await result(), ">"); for (let k = 0; k < 4; k++) await button("Bilangan A −1").click(); assert.equal(await result(), "="); await button("Bilangan B +1").click(); await page.getByTestId("lab-result").filter({ hasText: "bandingkan satuan" }).waitFor(); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi →").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 2 && k === 0;
        await answer(q, miss ? q.parts[0].options.find(o => o !== q.parts[0].answer) : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${t}-${k}`); await shot(`practice-${topics[t].code}-${k + 1}`);
        await button(k === set.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${set.length - wrong} · Salah ${wrong} · Skor ${Math.round((set.length - wrong) / set.length * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi · 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      if (q.scene?.layout === "scatter") { await button("Tandai benda 1").click(); assert.equal(await button("Tandai benda 1").getAttribute("aria-pressed"), "true"); }
      await answer(q, i === 0 ? "28" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar 27/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 1 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
  }
} finally { await browser.close(); }
