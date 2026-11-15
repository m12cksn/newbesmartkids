import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-ten-functions.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-ten-functions-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = (name, group) => (group ? page.getByRole("radiogroup", { name: group, exact: true }) : page).getByRole("radio", { name, exact: true });
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
        if (p.kind === "num" || p.kind === "vals") await box(l).fill(v[i]);
        else if (p.kind === "poly") { const deg = p.coef.length - 1; for (let k = 0; k <= deg; k++) { const d = deg - k; await box(`${l} koefisien ${d === 0 ? "konstanta" : d === 1 ? "x" : `x^${d}`}`).fill(x[k]); } }
        else if (p.kind === "lin") { await box(`${l} koefisien x pembilang`).fill(x[0]); await box(`${l} konstanta pembilang`).fill(x[1]); await box(`${l} penyebut`).fill(x[2]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/matematika-lanjutan-kelas-10`);
    await page.locator(`a[href$="/materi/fungsi-kelas-10"]`).first().click();
    await page.getByRole("heading", { name: "Fungsi", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      mesin: async () => { assert.equal(await result(), "2x + 5|5|15"); await radio("1/(x − 2)").click(); assert.equal(await result(), "1/(x − 2)|5|0.333"); await press("x kurangi", 3); assert.equal(await result(), "1/(x − 2)|2|x"); },
      operasi: async () => { assert.equal(await result(), "f + g|3|10"); await radio("f : g").click(); assert.equal(await result(), "f : g|3|1"); await press("x kurangi", 1); assert.equal(await result(), "f : g|2|x"); },
      komposisi: async () => { assert.equal(await result(), "200|g∘f|145.2"); await radio("f∘g").click(); assert.equal(await result(), "200|f∘g|144.8"); },
      sifat: async () => { assert.equal(await result(), "g∘f|f∘g|beda"); await radio("f∘(g∘h)", "Komposisi pertama").click(); await radio("(f∘g)∘h", "Komposisi kedua").click(); assert.equal(await result(), "f∘(g∘h)|(f∘g)∘h|sama"); },
      invers: async () => { assert.equal(await result(), "f|asli|fungsi"); await button("Balik panah").click(); assert.equal(await result(), "f|balik|fungsi"); await radio("h").click(); assert.equal(await result(), "h|balik|bukan"); },
      rumus: async () => { assert.equal(await result(), "2|-3|1|-1|1"); await button("a tambah").click(); assert.equal(await result(), "3|-3|1|0|1"); },
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
        await answer(q, miss ? q.answer.replace(/^11/, "12") : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? [q.answer.split(SEP)[0], q.parts[1].options[0]].join(SEP) : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*y ≥ −2/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 10 bab 3 at ${width}px: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi (daerah asal/hasil dari grafik dan rumus, operasi, komposisi, pasangan terurut, invers, rumus invers), skor dan pembahasan`);
  }
} finally { await browser.close(); }
