import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-five-shape-traits.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-shape-traits-screenshots";
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
        else if (p.kind === "straws") { for (let k = 0; k < p.rows.length; k++) { await group(`Percobaan ${k + 1} membentuk segitiga`).getByRole("button", { name: x[4 * k], exact: true }).click(); for (const [j, l] of ["b+c", "a+c", "a+b"].entries()) await fill(`Percobaan ${k + 1} ${l}`, x[4 * k + 1 + j]); } }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(r.text).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "select") { for (const k of v[i].split(",").filter(Boolean)) await group(p.label).getByRole("button", { name: `Bangun ${String.fromCharCode(65 + Number(k))}`, exact: true }).click(); }
        else if (p.kind === "tf") { const [y, n] = p.labels ?? ["Benar", "Salah"]; for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? y : n, exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.locator(`a[href$="/materi/membandingkan-ciri-ciri-bangun-datar"]`).first().click();
    await page.getByRole("heading", { name: "Membandingkan Ciri-Ciri Bangun Datar", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "Lancip|Sembarang"); await clicks("Sedotan c tambah", 8); assert.equal(await result(), "tidak"); await clicks("Sedotan c kurangi", 7); await button("Sedotan a tambah").click(); assert.equal(await result(), "Lancip|Sama kaki"); }
      if (t === 1) { assert.equal(await result(), "Jajargenjang"); await button("Sudut tambah").click(); await button("Sudut tambah").click(); assert.equal(await result(), "Persegi panjang"); await clicks("Alas kurangi", 2); assert.equal(await result(), "Persegi");
        await radio("Layang-layang").click(); assert.equal(await result(), "Layang-layang"); await clicks("Tinggi atas tambah", 3); assert.equal(await result(), "Belah ketupat");
        await radio("Trapesium").click(); assert.equal(await result(), "Trapesium"); await button("Geser atas tambah").click(); assert.equal(await result(), "Trapesium sama kaki"); await clicks("Geser atas kurangi", 2); assert.equal(await result(), "Trapesium siku-siku"); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 2;
        await answer(q, miss ? "77" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 2 ? "70" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Sudut ketiga = 60°/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 7 at ${width}px: 2 lab, 8 latihan (1 salah disengaja), 24 evaluasi (sedotan, jenis segitiga, sudut, simetri, pilih bangun, nama segi empat), skor dan pembahasan`);
  }
} finally { await browser.close(); }
