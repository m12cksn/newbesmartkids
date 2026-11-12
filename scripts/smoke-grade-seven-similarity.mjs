import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, greek } from "../src/data/grade-seven-similarity.ts";
const plain = s => s.replace(/\{([^}]+)\}/g, "$1");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-seven-similarity-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = name => page.getByRole("radio", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "num") await box(p.label).fill(v[i]);
        else if (p.kind === "pickAngle") { for (const k of v[i].split(",")) await button(`Sudut ${greek[Number(k)]}`).click(); }
        else if (p.kind === "select") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: p.options[Number(k)], exact: true }).click(); }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(r.text).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/logika-dan-aljabar-kelas-7`);
    await page.locator(`a[href$="/materi/kesebangunan"]`).first().click();
    await page.getByRole("heading", { name: "Kesebangunan", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      pair: async () => { assert.equal(await result(), "50|140"); await button("Besar sudut tambah").click(); assert.equal(await result(), "45|135"); },
      trans: async () => { assert.equal(await result(), "Sehadap|sama"); await radio("Dalam sepihak").click(); assert.equal(await result(), "Dalam sepihak|pelurus"); },
      triangle: async () => { assert.equal(await result(), "60"); await clicks("∠A tambah", 2); assert.equal(await result(), "50"); await clicks("∠A tambah", 10); assert.equal(await result(), "tidak"); },
      scale: async () => { assert.equal(await result(), "2|4"); await radio("k = 0,5").click(); assert.equal(await result(), "0,5|0,25"); },
      resize: async () => { assert.equal(await result(), "ya"); await button("Lebar tambah").click(); assert.equal(await result(), "tidak"); },
      transform: async () => { assert.equal(await result(), "ya"); await button("Rentang mendatar").click(); assert.equal(await result(), "tidak"); await button("Ulangi").click(); await button("Putar 90°").click(); await button("Cerminkan").click(); await button("Perbesar 1,5 kali").click(); assert.equal(await result(), "ya"); },
      match: async () => { assert.equal(await result(), "D"); await button("BC").click(); assert.equal(await result(), "EF"); },
      angles: async () => { assert.equal(await result(), "ya"); await button("Sudut pertama tambah").click(); assert.equal(await result(), "tidak"); },
      parallel: async () => { assert.equal(await result(), "10"); await button("AD tambah").click(); assert.equal(await result(), "11,25"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      for (const [j, sec] of topics[t].sections.entries()) {
        await page.getByRole("tab", { name: `${topics[t].code}.${j + 1} ${sec.title}`, exact: true }).click();
        await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${topics[t].code}${j + 1}`);
      }
      await button(`Latihan ${topics[t].code}`).click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "60‖70" : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${t}-${k}`); await shot(`practice-${topics[t].code}-${k + 1}`);
        await button(k === set.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${set.length - wrong} · Salah ${wrong} · Skor ${Math.round((set.length - wrong) / set.length * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      await answer(q, i === 0 ? "50‖142" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Penyiku: 52 ° \| Pelurus: 142 °/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 7 bab 5 at ${width}px: 9 peraga, 12 latihan (1 salah disengaja), 24 evaluasi (sudut, ketuk sudut, pasangan sebangun, gambar, segitiga), skor dan pembahasan`);
  }
} finally { await browser.close(); }
