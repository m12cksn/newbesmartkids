import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-five-perimeter.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-perimeter-screenshots";
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
      if (q.scene?.type === "shape" && q.scene.measure) for (const [k, s] of q.scene.shape.show.entries()) if (s === "hide") await button(`Ukur sisi ${k + 1}`).click();
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "sum") { for (const [k] of p.sides.entries()) await fill(`Sisi ${k + 1}`, x[k]); await fill("Keliling", x[p.sides.length]); }
        else if (p.kind === "mult") { await fill("Pengali pertama", x[0]); await fill("Pengali kedua", x[1]); await fill("Keliling", x[2]); }
        else if (p.kind === "rectf") { for (const [k, l] of ["Sisi pertama", "Sisi kedua", "Hasil pertama", "Hasil kedua", "Keliling"].entries()) await fill(l, x[k]); }
        else if (p.kind === "number") await fill(p.label, x[0]);
        else if (p.kind === "fill") { for (const [k, it] of p.items.entries()) await fill(it.label, x[k]); }
        else if (p.kind === "table") { for (const [k, r] of p.rows.entries()) { await fill(`Banyak sisi ${r.name}`, x[2 * k]); await fill(`Pengali ${r.name}`, x[2 * k + 1]); } }
        else if (p.kind === "choice") await page.getByRole("group", { name: `Pilihan bagian ${i + 1}`, exact: true }).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.getByRole("link", { name: /Keliling Bangun Datar/ }).first().click();
    await page.getByRole("heading", { name: "Keliling Bangun Datar", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "0"); await clicks("Lari ke sudut berikutnya", 2); assert.equal(await result(), "150"); await clicks("Lari ke sudut berikutnya", 2); assert.equal(await result(), "300"); await page.getByTestId("lab-result").filter({ hasText: "keliling" }).waitFor(); assert.ok(await button("Lari ke sudut berikutnya").isDisabled()); }
      if (t === 1) { assert.equal(await result(), "16"); await radio("Sama sisi").click(); assert.equal(await result(), "21"); await radio("Sembarang").click(); await clicks("Sisi 1 tambah", 2); assert.equal(await result(), "", "segitiga tidak mungkin"); }
      if (t === 2) { assert.equal(await result(), "20"); await radio("Persegi").click(); assert.equal(await result(), "24"); await radio("Trapesium").click(); assert.equal(await result(), "23"); }
      if (t === 3) { assert.equal(await result(), "15"); await button("Banyak sisi tambah").click(); assert.equal(await result(), "18"); }
      if (t === 4) { assert.equal(await result(), "36"); await button("Potongan mendatar tambah").click(); assert.equal(await result(), "36", "keliling tetap"); await button("Geser sisi ke luar").click(); await page.getByTestId("lab-result").filter({ hasText: "Cara Komang" }).waitFor(); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 3;
        await answer(q, miss ? "8" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "28|15|28|15|84" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Keliling = 28 \+ 15 \+ 28 \+ 15 = 86 m/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 4 at ${width}px: 5 lab, 20 latihan (1 salah disengaja), 24 evaluasi (ukur sisi, jumlah, kali, rumus persegi panjang, sisi hilang, tabel), skor dan pembahasan`);
  }
} finally { await browser.close(); }
