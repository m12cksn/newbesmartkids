import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-twelve-dimension.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-twelve-dimension-screenshots";
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
        else if (p.kind === "surd") { await box(`${l} pengali`).fill(x[0]); await box(`${l} bilangan di dalam akar`).fill(x[1]); await box(`${l} penyebut`).fill(x[2]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/persiapan-matematika-kelas-12`);
    await page.locator(`a[href$="/materi/dimensi-tiga-kelas-12"]`).first().click();
    await page.getByRole("heading", { name: "Dimensi Tiga", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      rute: async () => { assert.equal(await result(), "A|0"); await button("Kota C").click(); assert.equal(await result(), "A–C|26"); await button("Ulang rute").click(); await button("Kota B").click(); await button("Kota C").click(); assert.equal(await result(), "A–B–C|35"); },
      kubus: async () => { assert.equal(await result(), "AG|4|48"); await radio("C", "Titik kedua").click(); assert.equal(await result(), "AC|4|32");
        const fig = page.getByRole("img", { name: /^Kubus/ }).first(); const before = await fig.innerHTML(); await page.getByRole("button", { name: "Putar gambar ke kanan" }).first().click(); assert.notEqual(await fig.innerHTML(), before, "kubus bisa diputar"); },
      tali: async () => { assert.equal(await result(), "50|12.5|tidak"); await press("Geser P kurangi", 7); assert.equal(await result(), "36|12|tegak"); },
      garis: async () => { assert.equal(await result(), "A|BE|8"); await radio("H", "Titik").click(); await radio("DF", "Garis").click(); assert.equal(await result(), "H|DF|10.667"); },
      proyeksi: async () => { assert.equal(await result(), "0,0|3.742|tidak"); await press("Q ke kanan", 2); await button("Q ke belakang").click(); assert.equal(await result(), "2,1|3|tegak"); },
      bidang: async () => { assert.equal(await result(), "B-AFGD|4|8"); await radio("C ke bidang BDG").click(); assert.equal(await result(), "C-BDG|4|5.333"); },
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
        await answer(q, miss ? q.answer.replace(/42$/, "43") : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? q.answer.replace(/42$/, "43") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*A–C–D.*42/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 12 bab 1 at ${width}px: 6 peraga (kubus 3D bisa diputar), 24 latihan (1 salah disengaja), 24 evaluasi (rute terpendek, koordinat, diagonal, titik ke garis, titik ke bidang), skor dan pembahasan`);
  }
} finally { await browser.close(); }
