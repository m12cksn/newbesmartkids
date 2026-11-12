import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, places, fmt } from "../src/data/grade-five-million.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-million-screenshots";
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
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "number") await fill(p.label, v[i]);
        else if (p.kind === "items") { for (const [k, it] of p.items.entries()) await fill(it.label, x[k]); }
        else if (p.kind === "words") { for (const w of v[i].split(" ")) await group("Kartu kata").getByRole("button", { name: w, exact: true }).click(); }
        else if (p.kind === "place") { for (const [k, r] of p.rows.entries()) for (const [j, pl] of places.entries()) await fill(`${r.label} ${pl}`, x[6 * k + j]); }
        else if (p.kind === "placeName") { for (const [k, r] of p.rows.entries()) await group(r.text).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "signs") { for (const [k, s] of x.entries()) await group(`Pasangan ${k + 1}`).getByRole("button", { name: s === "<" ? "kurang dari" : s === ">" ? "lebih dari" : "sama dengan", exact: true }).click(); }
        else if (p.kind === "seq") { let k = 0; for (const [r, row] of p.rows.entries()) for (const [j, val] of row.entries()) if (val === null) await fill(`Barisan ${String.fromCharCode(97 + r)} kotak ${j + 1}`, x[k++]); }
        else if (p.kind === "expand") { for (const [j, pl] of places.entries()) await fill(`Nilai ${pl.toLowerCase()}`, x[j]); }
        else if (p.kind === "cards") { for (const d of v[i]) await group(p.label).getByRole("button", { name: `Kartu ${d}`, exact: true }).click(); }
        else if (p.kind === "payment") { const n = p.denoms.length; for (let r = 0; r < p.ways; r++) for (const [k, d] of p.denoms.entries()) if (x[r * n + k] !== "0") await fill(`Cara ${r + 1} uang ${fmt(d)}`, x[r * n + k]); }
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(o).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.locator(`a[href$="/materi/bilangan-cacah-sampai-1000000"]`).first().click();
    await page.getByRole("heading", { name: "Bilangan Cacah sampai 1.000.000", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "720736|1"); await button("Pilih Ratusan").click(); assert.equal(await result(), "720736|3"); await clicks("Ratus ribuan tambah", 2); assert.equal(await result(), "920736|3");
        await page.getByTestId("lab-result").filter({ hasText: "sembilan ratus dua puluh ribu tujuh ratus tiga puluh enam" }).waitFor(); }
      if (t === 1) { assert.equal(await result(), ""); for (let k = 0; k < 3; k++) await button("Bandingkan kolom berikutnya").click(); assert.equal(await result(), "");
        await button("Bandingkan kolom berikutnya").click(); assert.equal(await result(), ">"); assert.ok(await button("Bandingkan kolom berikutnya").isDisabled());
        await radio("342.231 dan 432.543").click(); await button("Bandingkan kolom berikutnya").click(); assert.equal(await result(), "<");
        await radio("126.789 dan 126.789").click(); await clicks("Bandingkan kolom berikutnya", 6); assert.equal(await result(), "="); }
      if (t === 2) { assert.equal(await result(), "345500"); await button("Tambah 100").click(); assert.equal(await result(), "345600"); await button("Kurangi 100.000").click(); assert.equal(await result(), "245600"); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 1;
        await answer(q, miss ? "740060" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "508307" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Bentuk angka: 580\.307/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 9 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (kartu kata, nilai tempat, tanda, barisan, kartu angka, cara membayar), skor dan pembahasan`);
  }
} finally { await browser.close(); }
