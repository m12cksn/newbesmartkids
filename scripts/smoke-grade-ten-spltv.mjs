import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-ten-spltv.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-ten-spltv-screenshots";
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
    const press = async (name, times) => { for (let k = 0; k < times; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "triple") { for (const [k, nm] of p.names.entries()) await box(`${l} ${nm}`).fill(x[k]); }
        else if (p.kind === "system") { for (let r = 0; r < 3; r++) { for (let j = 0; j < 3; j++) await box(`Persamaan ${r + 1} koefisien ${p.vars[j]}`).fill(x[r * 4 + j]); await box(`Persamaan ${r + 1} konstanta`).fill(x[r * 4 + 3]); } }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    const missTriple = (q, triple) => { const v = q.answer.split(SEP); v[1] = triple; return v.join(SEP); };
    await page.goto(`${origin}/kelas/matematika-lanjutan-kelas-10`);
    await page.locator(`a[href$="/materi/sistem-persamaan-linear-tiga-variabel"]`).first().click();
    await page.getByRole("heading", { name: "Sistem Persamaan Linear Tiga Variabel", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      model: async () => { assert.equal(await result(), "10|10|10|0"); await press("Urea (x) tambah", 6); await press("SS (y) kurangi", 2); await press("TSP (z) tambah", 2); assert.equal(await result(), "16|8|12|3"); },
      kerja: async () => { assert.equal(await result(), "12|15|20|10"); await button("Putu dan I Gede (hari) tambah").click(); assert.equal(await result(), "12|15|21|10.12"); },
      ciri: async () => { assert.equal(await result(), "S|(8, 3, −5)|3"); await radio("R").click(); assert.equal(await result(), "R|(8, 3, −5)|0"); await radio("(0, 0, 0)").click(); assert.equal(await result(), "R|(0, 0, 0)|3"); },
      eliminasi: async () => { assert.equal(await result(), "Tiga bilangan|x|1/6"); while (await button("Langkah berikutnya").isEnabled()) await button("Langkah berikutnya").click();
        assert.equal(await result(), "Tiga bilangan|x|6/6"); await page.getByTestId("lab-result").getByText(/\(14, 18, 28\)/).waitFor();
        await radio("Latihan").click(); await radio("z").click(); while (await button("Langkah berikutnya").isEnabled()) await button("Langkah berikutnya").click(); await page.getByTestId("lab-result").getByText(/\(2, −1, 3\)/).waitFor(); },
      sarrus: async () => { assert.equal(await result(), "Contoh|D|9"); await radio("Dz").click(); assert.equal(await result(), "Contoh|Dz|27"); await radio("Pupuk Pak Joko").click(); await radio("Dx").click(); assert.equal(await result(), "Pupuk Pak Joko|Dx|-240"); },
      jenis: async () => { assert.equal(await result(), "0|satu"); await press("t tambah", 3); assert.equal(await result(), "3|banyak"); await press("t kurangi", 6); assert.equal(await result(), "-3|tidak"); },
    };
    for (const [k, sec] of sections.entries()) {
      if (k === 0 || sec.topic !== sections[k - 1].topic) await button(`${sec.topic.code}. ${sec.topic.title}`).click();
      await page.getByRole("tab", { name: `${sec.code} ${sec.title}`, exact: true }).click();
      await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${sec.code}`);
      await button(`Latihan ${sec.code}`).click();
      let wrong = 0;
      for (const [j, q] of practice[k].entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${k}-${j}`);
        const miss = k === 0 && j === 0;
        await answer(q, miss ? missTriple(q, "12|6|13") : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${k}-${j}`); await shot(`practice-${sec.code}-${j + 1}`);
        await button(j === practice[k].length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${4 - wrong} · Salah ${wrong} · Skor ${Math.round((4 - wrong) / 4 * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      await answer(q, i === 0 ? missTriple(q, "5|9|11") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*\(5; 9; 10\)/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 10 bab 2 at ${width}px: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi (menyusun model, triple penyelesaian, determinan, SPLTV atau bukan, homogen, parameter, teka-teki simbol), skor dan pembahasan`);
  }
} finally { await browser.close(); }
