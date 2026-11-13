import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, topics, SEP, cells, plain, idn } from "../src/data/grade-nine-systems.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-nine-systems-screenshots";
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
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "table") { for (const [k, xx] of p.xs.entries()) await box(`y untuk x = ${idn(xx)}`).fill(x[k]); }
        else if (p.kind === "point") { await box(`${l} x`).fill(x[0]); await box(`${l} y`).fill(x[1]); }
        else if (p.kind === "eq") { await box(`${l} koefisien ${p.x ?? "x"}`).fill(x[0]); await box(`${l} koefisien ${p.y ?? "y"}`).fill(x[1]); await box(`${l} konstanta`).fill(x[2]); }
        else if (p.kind === "draw" || p.kind === "pick") { const g = group(l); for (const pt of v[i].split(";")) { const [a, b] = pt.split(","); await g.getByRole("button", { name: `Titik (${a}, ${b})`, exact: true }).click(); } }
      }
    }
    await page.goto(`${origin}/kelas/strategi-matematika-kelas-9`);
    await page.locator(`a[href$="/materi/sistem-persamaan-linear-dua-variabel"]`).first().click();
    await page.getByRole("heading", { name: "Sistem Persamaan Linear Dua Variabel", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      model: async () => { assert.equal(await result(), "2|8"); await button("Beras merah (kg) tambah").click(); assert.equal(await result(), "2.5|7"); },
      solutions: async () => { assert.equal(await result(), "2|1|8|Cacah|5"); await radio("Bulat").click(); assert.equal(await result(), "2|1|8|Bulat|tak hingga"); await radio("Cacah").click(); await button("a tambah").click(); assert.equal(await result(), "3|1|8|Cacah|3"); },
      graph: async () => { assert.equal(await result(), "3|2"); await button("a₂ kurangi").click(); await clicks("b₂ tambah", 2); assert.equal(await result(), "sejajar"); },
      subst: async () => { assert.equal(await result(), "16|9|bisa"); await button("Uang (juta) tambah").click(); assert.equal(await result(), "14|11|bisa"); },
      elim: async () => { assert.equal(await result(), "3|2"); await radio("Hilangkan y dulu").click(); assert.equal(await result(), "3|2"); await button("c₁ tambah").click(); assert.equal(await result(), "3.105263|2.263158"); },
      mixed: async () => { assert.equal(await result(), "17000|20000|139000"); await radio("Hilangkan jeruk dulu").click(); assert.equal(await result(), "17000|20000|139000"); await button("Apel (kg) tambah").click(); assert.equal(await result(), "17000|20000|159000"); },
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
        await answer(q, miss ? "PLDV|PLDV|PLDV|PLDV|PLDV" : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${k}-${j}`); await shot(`practice-${sec.code}-${j + 1}`);
        await button(j === practice[k].length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${4 - wrong} · Salah ${wrong} · Skor ${Math.round((4 - wrong) / 4 * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }
    assert.equal(topics.length, 2);

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      await answer(q, i === 0 ? "PLDV|PLDV|PLDV|PLDV|PLDV" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar 4a = 7 − 2b: PLDV/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 9 bab 1 at ${width}px: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi (PLDV, pasangan, model ax + by = c, himpunan cacah, gambar dua garis, sistem, soal cerita), skor dan pembahasan`);
  }
} finally { await browser.close(); }
