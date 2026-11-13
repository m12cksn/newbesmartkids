import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, plain, idn } from "../src/data/grade-eight-lines.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-eight-lines-screenshots";
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
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Persamaan ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "table") { for (const [k, xx] of p.xs.entries()) await box(`y untuk x = ${idn(xx)}`).fill(x[k]); }
        else if (p.kind === "point") { await box(`${l} x`).fill(x[0]); await box(`${l} y`).fill(x[1]); }
        else if (p.kind === "line") { await box(`${l} kemiringan`).fill(x[0]); await box(`${l} konstanta`).fill(x[1]); }
        else if (p.kind === "mc") { for (const [k, r] of p.rows.entries()) { await box(`${plain(r.eq)} kemiringan`).fill(x[2 * k]); await box(`${plain(r.eq)} perpotongan`).fill(x[2 * k + 1]); } }
        else if (p.kind === "draw") { const g = group(l); for (const pt of v[i].split(";")) { const [a, b] = pt.split(","); await g.getByRole("button", { name: `Titik (${a}, ${b})`, exact: true }).click(); } }
      }
    }
    await page.goto(`${origin}/kelas/hubungan-geometri-kelas-8`);
    await page.locator(`a[href$="/materi/persamaan-garis-lurus"]`).first().click();
    await page.getByRole("heading", { name: "Persamaan Garis Lurus", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      table: async () => { assert.equal(await result(), "2|-1|-5,-3,-1,1,3"); await button("m tambah").click(); assert.equal(await result(), "2.5|-1|-6,-3.5,-1,1.5,4"); },
      intercept: async () => { assert.equal(await result(), "4|6"); await clicks("c kurangi", 6); assert.equal(await result(), "2|3"); },
      family: async () => { assert.equal(await result(), "1|2|sumbu-y"); await clicks("m garismu tambah", 2); assert.equal(await result(), "2|2|berimpit"); },
      ramp: async () => { assert.equal(await result(), "0,129|aman"); await clicks("Tinggi (cm) tambah", 4); assert.equal(await result(), "0,157|curam"); },
      slope: async () => { assert.equal(await result(), "2|positif"); await clicks("y₂ kurangi", 4); assert.equal(await result(), "0|nol"); },
      pointslope: async () => { assert.equal(await result(), "3|-1"); await button("x₁ tambah").click(); assert.equal(await result(), "3|-4"); },
      two: async () => { assert.equal(await result(), "-3|-2"); await clicks("y₁ tambah", 3); assert.equal(await result(), "-2|0"); },
      perp: async () => { assert.equal(await result(), "2|-1"); await radio("Tegak lurus").click(); assert.equal(await result(), "-0.5|1.5"); },
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
        await answer(q, miss ? "0|0|0|0|0" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "0|0|0|0‖1,5" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Nilai y: x = −1: y = −5/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 8 bab 5 at ${width}px: 8 peraga, 8 latihan (1 salah disengaja), 24 evaluasi (tabel, titik, gambar garis, y = mx + c, tabel m dan c, cocokkan grafik, pilihan grafik), skor dan pembahasan`);
  }
} finally { await browser.close(); }
