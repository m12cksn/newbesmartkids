import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-five-area.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-area-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = name => page.getByRole("radio", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      if (q.scene?.mark && !q.scene.plain) { await button("Petak 2, 2").click(); assert.equal(await button("Petak 2, 2").getAttribute("aria-pressed"), "true"); }
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "number") await fill(p.label, x[0]);
        else if (p.kind === "formula") {
          const k = x.length - 1;
          const names = p.shape === "trap" ? ["Sisi pertama", "Sisi kedua", "Tinggi"] : ["Bilangan pertama", "Bilangan kedua"];
          for (const [j, n] of names.entries()) await fill(n, x[j]); await fill("Luas", x[k]);
        } else if (p.kind === "items") { for (const [k, it] of p.items.entries()) await fill(it.label, x[k]); }
        else if (p.kind === "pairs") { for (let r = 0; r < p.rows; r++) for (const [j, c] of ["Panjang", "Lebar", "Keliling", "Luas"].entries()) await fill(`Bentuk ${r + 2} ${c}`, x[4 * r + j]); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await page.getByRole("group", { name: `Pernyataan ${k + 1}`, exact: true }).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await page.getByRole("group", { name: `Pilihan bagian ${i + 1}`, exact: true }).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.getByRole("link", { name: /Luas Daerah Bangun Datar/ }).first().click();
    await page.getByRole("heading", { name: "Luas Daerah Bangun Datar", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "0"); await button("Petak 2, 2").click(); assert.equal(await result(), "1"); await button("Petak 1, 1").click(); assert.equal(await result(), "1", "di luar ruangan tidak dihitung"); await clicks("Pasang ubin sebaris", 3); assert.equal(await result(), "12"); await page.getByTestId("lab-result").filter({ hasText: "12 m²" }).waitFor(); }
      if (t === 1) { assert.equal(await result(), "16"); await button("Potong dan pindahkan").click(); await page.getByTestId("lab-result").filter({ hasText: "8 × 2 = 16" }).waitFor(); await radio("Trapesium").click(); assert.equal(await result(), "24"); await radio("Persegi").click(); assert.equal(await result(), "25"); }
      if (t === 2) { assert.equal(await result(), "52"); await button("Tinggi atap tambah").click(); assert.equal(await result(), "56"); }
      if (t === 3) { assert.equal(await result(), "32"); await button("Catat ukuran").click(); await button("Panjang kurangi").click(); await clicks("Panjang kurangi", 1); assert.equal(await result(), "36"); await page.getByTestId("lab-result").filter({ hasText: "Ini persegi" }).waitFor(); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 0;
        await answer(q, miss ? "7|4|11" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "8" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Banyak ubin = 15 buah/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 5 at ${width}px: 4 lab, 16 latihan (1 salah disengaja), 24 evaluasi (petak, rumus, gabungan, tabel keliling-luas), skor dan pembahasan`);
  }
} finally { await browser.close(); }
