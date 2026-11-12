import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, show } from "../src/data/grade-seven-integers.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-seven-integers-screenshots";
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
    async function signed(label, val, scope = page) {
      if (val === "") return;
      if (val.startsWith("-")) await scope.getByRole("button", { name: `${label} ganti tanda`, exact: true }).click();
      await scope.getByRole("textbox", { name: label, exact: true }).fill(val.replace("-", ""));
    }
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "number") await signed(p.label, v[i]);
        else if (p.kind === "items") { for (const [k, it] of p.items.entries()) await signed(it.label, x[k]); }
        else if (p.kind === "table") { let k = 0; for (const [r, row] of p.rows.entries()) for (const [j, c] of row.entries()) if (c === null) await signed(`Baris ${r + 1} ${p.head[j]}`, x[k++]); }
        else if (p.kind === "pairs") { for (let k = 0; k < x.length / 2; k++) { await signed(`Pasangan ${k + 1} bilangan pertama`, x[2 * k]); await signed(`Pasangan ${k + 1} bilangan kedua`, x[2 * k + 1]); } }
        else if (p.kind === "primeExp") { for (const [k, pr] of p.primes.entries()) await box(`Pangkat ${pr}`).fill(x[k]); }
        else if (p.kind === "signs") { for (const [k, s] of x.entries()) await group(`Pasangan ${k + 1}`).getByRole("button", { name: s === "<" ? "kurang dari" : "lebih dari", exact: true }).click(); }
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(`Bilangan ${show(Number(o))}`).click(); }
        else if (p.kind === "place") { for (const [k, it] of p.items.entries()) { await group("Pilih yang akan diletakkan").getByRole("button", { name: it.label, exact: true }).click(); await button(`Letakkan ${it.label} di ${show(Number(x[k]))}`).click(); } }
        else if (p.kind === "select") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: p.options[Number(k)], exact: true }).click(); }
        else if (p.kind === "dials") { const g = group(`Tombol untuk ${show(p.target)}°C`); for (const [k, c] of x.entries()) { const n = Number(c); for (let j = 0; j < Math.abs(n); j++) await g.getByRole("button", { name: `Tombol ${k + 1} putar ${n > 0 ? "kanan" : "kiri"}`, exact: true }).click(); } }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/logika-dan-aljabar-kelas-7`);
    await page.locator(`a[href$="/materi/bilangan-bulat"]`).first().click();
    await page.getByRole("heading", { name: "Bilangan Bulat", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "-3"); await clicks("Suhu tambah", 5); assert.equal(await result(), "2"); await button("Lompat 10 kurangi").click(); assert.equal(await result(), "-8");
        await page.getByTestId("lab-result").filter({ hasText: "bilangan bulat negatif" }).waitFor(); }
      if (t === 1) { assert.equal(await result(), "+|-2"); await radio("Pengurangan").click(); assert.equal(await result(), "−|8"); await radio("Perkalian").click(); assert.equal(await result(), "×|-12");
        await button("Bilangan pertama kurangi").click(); assert.equal(await result(), "×|-8"); }
      if (t === 2) { assert.equal(await result(), ""); await group("Bagi 12 dengan bilangan prima").getByRole("button", { name: "5", exact: true }).click(); await page.getByText("12 tidak habis dibagi 5.").waitFor();
        await group("Bagi 12 dengan bilangan prima").getByRole("button", { name: "2", exact: true }).click(); await group("Bagi 6 dengan bilangan prima").getByRole("button", { name: "2", exact: true }).click();
        assert.equal(await result(), "12|2² × 3"); await page.getByRole("tab", { name: "FPB dan KPK" }).click(); assert.equal(await result(), "8|48"); await button("Bilangan B tambah").click(); assert.equal(await result(), "1|400"); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 3;
        await answer(q, miss ? "60" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 5 ? "48" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Setelah 24 hari/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 7 bab 1 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (garis bilangan, tanda, urutan, tabel suhu, pasangan faktor, pohon faktor, tombol suhu), skor dan pembahasan`);
  }
} finally { await browser.close(); }
