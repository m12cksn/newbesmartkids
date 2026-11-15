import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, NONE, cells, plain, SHAPES } from "../src/data/grade-nine-absolute.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-nine-absolute-screenshots";
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
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "solset") { if (v[i] === NONE) await button("Tidak ada penyelesaian").click(); else await box(`${l} himpunan penyelesaian`).fill(v[i]); }
        else if (p.kind === "piece") { const e = plain(p.expr); const names = ["bagian pertama koefisien x", "bagian pertama konstanta", "titik batas", "bagian kedua koefisien x", "bagian kedua konstanta"]; for (const [k, nm] of names.entries()) await box(`${e} ${nm}`).fill(x[k]); }
        else if (p.kind === "interval") {
          const [shape, a, b, cl] = x;
          await page.getByRole("radiogroup", { name: `${l} bentuk`, exact: true }).getByRole("radio", { name: SHAPES.find(s => s.id === shape).label, exact: true }).click();
          if (shape === "antara" || shape === "luar") { await box(`${l} batas kiri`).fill(a); await box(`${l} batas kanan`).fill(b); }
          if (shape === "kiri" || shape === "kanan") await box(`${l} batas`).fill(a);
          if (cl) await group(l).getByRole("button", { name: cl === "tutup" ? "Termasuk batas (≤, ≥)" : "Tidak termasuk (<, >)", exact: true }).click();
        }
        else if (p.kind === "tbl") { for (const [k, t] of p.xs.entries()) await box(`y untuk x = ${String(t).replace("-", "−").replace(".", ",")}`).fill(x[k]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/strategi-matematika-kelas-9`);
    await page.locator(`a[href$="/materi/nilai-mutlak-linear-satu-variabel"]`).first().click();
    await page.getByRole("heading", { name: "Persamaan dan Pertidaksamaan Nilai Mutlak Linear Satu Variabel", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      jarak: async () => { assert.equal(await result(), "1|13"); await button("Maju 2").click(); assert.equal(await result(), "3|15"); await button("Ulang").click(); await button("Mundur 3").click(); assert.equal(await result(), "-3|3"); },
      definisi: async () => { assert.equal(await result(), "2|3|0|3"); await button("x kurangi").click(); await button("x kurangi").click(); await button("x kurangi").click(); await button("x kurangi").click(); assert.equal(await result(), "2|3|-2|1"); },
      persamaan: async () => { assert.equal(await result(), "2|-5|9|2"); for (let k = 0; k < 9; k++) await button("c kurangi").click(); assert.equal(await result(), "2|-5|0|1"); await button("c kurangi").click(); assert.equal(await result(), "2|-5|-1|0"); },
      grafik: async () => { assert.equal(await result(), "|2x − 1| = |x + 3||-0.667;4"); await radio("|x − 2| = |x − 8|").click(); assert.equal(await result(), "|x − 2| = |x − 8||5"); await radio("|x − 2| = |2x + 2|").click(); assert.equal(await result(), "|x − 2| = |2x + 2||-4;0"); },
      interval: async () => { assert.equal(await result(), "≤|−1 ≤ x ≤ 5"); await radio(">").click(); assert.equal(await result(), ">|x < −1 atau x > 5"); },
      tanda: async () => { assert.equal(await result(), "|2x + 1| ≥ |x − 3||x ≤ −4 atau x ≥ {2/3}"); await radio("|2x − 1| < |x + 4|").click(); assert.equal(await result(), "|2x − 1| < |x + 4||−1 < x < 5"); },
    };
    for (const [k, sec] of sections.entries()) {
      if (k === 0 || sec.topic !== sections[k - 1].topic) await button(`${sec.topic.code}. ${sec.topic.title}`).click();
      await page.getByRole("tab", { name: `${sec.code} ${plain(sec.title)}`, exact: true }).click();
      await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${sec.code}`);
      await button(`Latihan ${sec.code}`).click();
      let wrong = 0;
      for (const [j, q] of practice[k].entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${k}-${j}`);
        const miss = k === 0 && j === 0;
        await answer(q, miss ? q.answer.replace(/^12/, "13") : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? q.answer.replace(/0,35$/, "0,36") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*0,35/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 9 bab 5 at ${width}px: 6 peraga, 24 latihan (1 salah disengaja), 24 evaluasi (nilai mutlak, bentuk per daerah, himpunan penyelesaian, tabel grafik, pilih grafik, interval pada garis bilangan, benar/salah), skor dan pembahasan`);
  }
} finally { await browser.close(); }
