import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-twelve-statistics.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-twelve-statistics-screenshots";
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
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "row") { for (const [k, c] of p.cells.entries()) await box(`${l} ${plain(c)}`).fill(x[k]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/persiapan-matematika-kelas-12`);
    await page.locator(`a[href$="/materi/statistika-kelas-12"]`).first().click();
    await page.getByRole("heading", { name: "Statistika", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const bump = a => a.replace(/(\d+)$/, m => String(Number(m) + 1));
    const labChecks = {
      kelas: async () => { assert.equal(await result(), "5|5|19,15,21,16,9"); await press("Banyak kelas tambah", 2); assert.equal(await result(), "7|4|14,13,15,19,10,5,4"); },
      kumulatif: async () => { assert.equal(await result(), "16,5|20|27.78"); await radio("Kurang dari 28,5", "Batas").click(); assert.equal(await result(), "28,5|72|100"); },
      histogram: async () => { assert.equal(await result(), "Histogram|19,15,21,16,9"); await radio("Poligon", "Tampilan").click(); await press("Frekuensi 16–20 tambah", 3); assert.equal(await result(), "Poligon|22,15,21,16,9"); },
      ogive: async () => { assert.equal(await result(), "70.5|16"); await press("Garis baca di nilai tambah", 1); assert.equal(await result(), "75.5|21.5"); },
      skala: async () => { assert.equal(await result(), "82|3|skala"); await press("Sumbu tegak mulai dari kurangi", 1); assert.equal(await result(), "80|1.67|skala"); await radio("Sembunyikan skala", "Skala").click(); assert.equal(await result(), "80|1.67|tanpa"); },
      rerata: async () => { assert.equal(await result(), "5,10,7,20,8|43.6"); await press("Frekuensi 45–49 kurangi", 10); assert.equal(await result(), "5,10,7,10,8|42.75"); },
      median: async () => { assert.equal(await result(), "25|45–49|45.25"); await press("Data ke- kurangi", 5); assert.equal(await result(), "20|40–44|43.07"); },
      modus: async () => { assert.equal(await result(), "13|12|47.1"); await press("Frekuensi kelas sesudah tambah", 4); assert.equal(await result(), "13|8|47.6"); },
      simpangan: async () => { assert.equal(await result(), "2|4.5"); await press("Data di setiap kelas tepi tambah", 1); assert.equal(await result(), "3|5.5"); },
      ragam: async () => { assert.equal(await result(), "2.15|n-1|212.3"); await radio("Populasi (n)", "Pembagi").click(); assert.equal(await result(), "2.15|n|207.58"); await radio("Contoh 2.16 bensin motor", "Data").click(); assert.equal(await result(), "2.16|n|24.89"); },
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
        await answer(q, miss ? bump(q.answer) : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? bump(q.answer) : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*Panjang kelas = 6 menit/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 12 bab 2 at ${width}px: 10 peraga (tabel frekuensi, kumulatif, histogram/poligon, ogive, skala grafik, rata-rata, median, modus, simpangan, ragam), 40 latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
  }
} finally { await browser.close(); }
