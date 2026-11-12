import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-seven-algebra.ts";
const plain = s => s.replace(/\{([^}]+)\}/g, "$1");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-seven-algebra-screenshots";
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
    async function signed(label, val) { if (val.startsWith("-")) await button(`${label} ganti tanda`).click(); await box(label).fill(val.replace("-", "").replace(".", ",")); }
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]), L = plain(p.label ?? "");
        if (p.kind === "poly") { for (const [k, t] of p.terms.entries()) await signed(`${L} ${t ? `koefisien ${t}` : "konstanta"}`, x[k]); }
        else if (p.kind === "factor") { await signed(`${L} faktor`, x[0]); await signed(`${L} koefisien ${p.v}`, x[1]); await signed(`${L} konstanta`, x[2]); }
        else if (p.kind === "binom") { await signed(`${L} bilangan 1`, x[0]); await signed(`${L} bilangan 2`, x[1]); }
        else if (p.kind === "num") await signed(L, v[i]);
        else if (p.kind === "table") { let k = 0; for (const row of p.rows) for (const [j, c] of row.entries()) if (c === null) await signed(`${row[0]} untuk ${p.head[0]} = ${p.head[j]}`, x[k++]); }
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(o).click(); }
        else if (p.kind === "select") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: p.options[Number(k)], exact: true }).click(); }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(plain(r.text)).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/logika-dan-aljabar-kelas-7`);
    await page.locator(`a[href$="/materi/bentuk-aljabar"]`).first().click();
    await page.getByRole("heading", { name: "Bentuk Aljabar", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      matches: async () => { assert.equal(await result(), "10"); await button("Banyak persegi tambah").click(); assert.equal(await result(), "13"); },
      parts: async () => { assert.equal(await result(), "3|−5x + y + 8"); await button("Koefisien y kurangi").click(); assert.equal(await result(), "2|−5x + 8"); },
      bags: async () => { assert.equal(await result(), "13"); await button("Isi satu kantong tambah").click(); assert.equal(await result(), "16"); },
      pool: async () => { assert.equal(await result(), "20"); await button("Sisi kolam s tambah").click(); assert.equal(await result(), "24"); },
      area: async () => { assert.equal(await result(), "3x + 6"); await radio("(x + b)(x + c)").click(); assert.equal(await result(), "x² + 5x + 6"); },
      like: async () => { assert.equal(await result(), "3x − 4"); await radio("Penjumlahan").click(); assert.equal(await result(), "7x + 2"); },
      trip: async () => { assert.equal(await result(), "3200"); await button("Waktu t tambah").click(); assert.equal(await result(), "2900"); },
      fruits: async () => { assert.equal(await result(), "ya"); await clicks("Berat jeruk t kurangi", 2); assert.equal(await result(), "tidak"); },
      ojek: async () => { assert.equal(await result(), "Gaga"); await clicks("Jarak k tambah", 4); assert.equal(await result(), "Gogo"); },
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
        const miss = t === 0 && k === 1;
        await answer(q, miss ? "2‖-5" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 3 ? "10‖-7‖5" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar m \+ 6 = 10 \| −3m \+ 5 = −7 \| 12 − 2m = 4/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 7 bab 4 at ${width}px: 9 peraga, 12 latihan (1 salah disengaja), 24 evaluasi (koefisien, jabaran, faktor, tabel, pasangkan, sifat, model), skor dan pembahasan`);
  }
} finally { await browser.close(); }
