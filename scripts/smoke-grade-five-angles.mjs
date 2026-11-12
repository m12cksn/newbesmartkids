import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-five-angles.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-angles-screenshots";
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
    const result = (id = "lab-result") => page.getByTestId(id).getAttribute("data-value");
    const rotate = async (label, target, from = 0) => { let d = from; while (d !== target) { const step = target - d >= 10 ? 10 : target - d > 0 ? 1 : d - target >= 10 ? -10 : -1; await button(`${label} ${step > 0 ? "putar maju" : "putar mundur"} ${Math.abs(step)}`).click(); d += step; } };
    async function answer(q, value = q.answer) {
      if (q.scene?.tool) await button("Pasang busur derajat").click();
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "number") await fill(p.label, v[i]);
        else if (p.kind === "items") { for (const [k, it] of p.items.entries()) await fill(it.label, x[k]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(r.text).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "corners") { for (const k of v[i].split(",").filter(Boolean)) await button(`Titik ${String.fromCharCode(65 + Number(k))}`).click(); }
        else if (p.kind === "draw") await rotate("Putar kaki sudut kedua", Number(v[i]));
        else if (p.kind === "clockSet") { const h = Number(v[i]); const fwd = (h - 12 + 12) % 12; for (let k = 0; k < Math.min(fwd, 12 - fwd); k++) await button(fwd <= 6 ? "Jam maju" : "Jam mundur").click(); }
        else if (p.kind === "order") { for (const op of v[i].split(";")) await group(p.label).getByRole("button", { name: op, exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.locator(`a[href$="/materi/sudut"]`).first().click();
    await page.getByRole("heading", { name: "Sudut", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "0"); await button("Titik A").click(); await page.getByTestId("lab-result").filter({ hasText: "lebih besar dari sudut siku-siku" }).waitFor(); await button("Titik D").click(); await button("Titik E").click(); assert.equal(await result(), "2"); await radio("Huruf L").click(); await button("Titik C").click(); assert.equal(await result(), "0"); }
      if (t === 1) { assert.equal(await result(), "Lancip"); await rotate("Putar kaki sudut", 90, 60); assert.equal(await result(), "Siku-siku"); await rotate("Putar kaki sudut", 200, 90); assert.equal(await result(), "Refleks"); for (let k = 0; k < 6; k++) await button("Jam maju").click(); assert.equal(await result("clock-result"), "Tumpul"); }
      if (t === 2) { assert.equal(await result(), ""); await button("Pasang busur derajat").click(); await box("Hasil ukuranku").fill("140"); await page.getByText(/membaca skala yang salah/).waitFor(); await box("Hasil ukuranku").fill("40"); assert.equal(await result(), "40"); }
      if (t === 3) { assert.equal(await result(), ""); await rotate("Putar kaki sudut kedua", 150); assert.equal(await result(), "150"); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 2 && k === 0;
        await answer(q, miss ? "130" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "3" : i === 5 ? "5" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Banyak sudut siku-siku = 2/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 6 at ${width}px: 4 lab, 16 latihan (1 salah disengaja), 24 evaluasi (titik siku, jenis sudut, jam, busur, lukis, urutan, persimpangan, keramik), skor dan pembahasan`);
  }
} finally { await browser.close(); }
