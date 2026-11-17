// Uji browser Kelas 4 Bab 1 Bilangan Cacah sampai 10.000 pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-four-whole-10k.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, places } from "../src/data/grade-four-whole-10k.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-four-whole-10k-screenshots";
await mkdir(folder, { recursive: true });
const sizes = [[320, 640], [390, 844], [768, 1024], [1280, 800]];
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const tall = [];
try {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    if (process.env.FONT) await page.addInitScript(f => { document.addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = `*{font-family:"${f}",sans-serif !important}`; document.head.append(st); }); }, process.env.FONT);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const room = () => page.evaluate(() => innerHeight - document.querySelector("header").getBoundingClientRect().height);
    const fitsScreen = async (locator, label, strict = !process.env.SOFT) => { const b = await locator.boundingBox(), r = await room(); if (b.height > r + 1) { if (strict) assert.fail(`${width}×${height} ${label}: tinggi ${Math.round(b.height)} > layar ${Math.round(r)}`); else { const parts = process.env.DEBUG ? await locator.evaluate(el => [...el.children].map(c => `${c.tagName.toLowerCase()}:${Math.round(c.getBoundingClientRect().height)}`).join(' ')) : ''; tall.push(`${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)} ${parts}`); } } };
    const quiz = page.locator("section:has(> progress)");
    const shot = async (name, full = false) => { if (width === 390 || width === 1280 || (process.env.SHOT320 && width === 320)) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: full }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "fill") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "choice") await group(p.label).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "rank") { for (const k of v[i].split("|")) await group(p.label).getByRole("button").nth(Number(k)).click(); }
        else if (p.kind === "match") { for (const [k, l] of p.left.entries()) { await button(`Pilih ${l}`).click(); await button(`Hubungkan ke ${p.right[Number(x[k])]}`).click(); } }
        else if (p.kind === "pv") { const names = places.filter((_, j) => p.hide[j]); for (const [k, c] of x.entries()) await box(names[k]).fill(c); }
        else if (p.kind === "column") { for (const [k, c] of x.entries()) await box(`Hasil angka ${k + 1}`).fill(c); }
        else if (p.kind === "div") { for (const [k, c] of x.entries()) await box(`Hasil bagi angka ${k + 1}`).fill(c); }
        else if (p.kind === "multi") { for (const o of v[i].split("|")) await group(p.label).getByRole("button", { name: o, exact: true }).click(); }
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/pola-dan-strategi-kelas-4`);
    await page.locator(`a[href$="/materi/bilangan-cacah-sampai-10000"]`).first().click();
    await page.getByRole("heading", { name: "Bilangan Cacah sampai 10.000", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const labChecks = {
      read: async () => { assert.equal(await result(), "3286"); await button("Ratusan tambah").click(); assert.equal(await result(), "3386"); },
      blocks: async () => { assert.equal(await result(), "2150"); await button("Pilih Ratusan").click(); assert.equal(await result(), "2150:1"); },
      compare: async () => { assert.equal(await result(), "0|"); await button("Tanda >").click(); assert.equal(await result(), "0|ok"); await button("Berikutnya").click(); await button("Tanda >").click(); assert.equal(await result(), "1|no"); },
      money: async () => { assert.equal(await result(), "7300|0"); await button("Catat cara ini").click(); assert.equal(await result(), "7300|1"); await button("Rp100 kurangi").click(); assert.equal(await result(), "7200|1"); },
      add: async () => { assert.equal(await result(), "l0"); await clicks("Langkah berikutnya", 3); assert.equal(await result(), "434"); },
      sub: async () => { assert.equal(await result(), "l0"); await clicks("Langkah berikutnya", 3); assert.equal(await result(), "66"); },
      mult: async () => { assert.equal(await result(), "48"); await button("Isi tiap kotak tambah").click(); assert.equal(await result(), "60"); },
      share: async () => { assert.equal(await result(), "12|0"); await button("Wadah tambah").click(); assert.equal(await result(), "9|3"); },
      factor: async () => { assert.equal(await result(), "f:12:6"); await button("Bilangan tambah").click(); assert.equal(await result(), "f:13:2"); await clicks("Bilangan tambah", 35); assert.equal(await result(), "f:48:10");
        { const arr = await page.getByRole("img", { name: "1 baris, 48 kolom" }).boundingBox(), lab = await page.getByTestId("lab").boundingBox(); assert.ok(arr.x >= lab.x && arr.x + arr.width <= lab.x + lab.width + 1, `susunan 1 × 48 terpotong: ${JSON.stringify(arr)} vs ${JSON.stringify(lab)}`); }
        await page.getByRole("radio", { name: "Kelipatan" }).click(); assert.equal(await result(), "k:3:16"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].short}`).click();
      for (const [j, sec] of topics[t].sections.entries()) {
        await labChecks[sec.lab](); await fit(`peraga ${sec.lab}`);
        await fitsScreen(page.getByTestId("lab"), `peraga ${sec.lab}`);
        await page.getByTestId("lab").scrollIntoViewIfNeeded(); await shot(`lab-${topics[t].code}${j + 1}`);
      }
      await button(`Latihan ${topics[t].code}`).click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `latihan ${t}-${k} terkunci sebelum dijawab`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? q.answer.replace("6208", "6280") : q.answer); if (miss) wrong++;
        await fitsScreen(quiz, `latihan ${topics[t].code}${k + 1}`);
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${t}-${k}`); await fitsScreen(quiz, `latihan ${topics[t].code}${k + 1} setelah diperiksa`, false);
        await quiz.scrollIntoViewIfNeeded(); await shot(`practice-${topics[t].code}-${k + 1}`);
        await button(k === set.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${set.length - wrong} · Salah ${wrong} · Skor ${Math.round((set.length - wrong) / set.length * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `evaluasi ${i + 1} terkunci sebelum dijawab`);
      await answer(q, i === 0 ? "Tiga ribu delapan puluh lima" : q.answer);
      await fit(`evaluasi ${i + 1}`); await fitsScreen(quiz, `evaluasi ${i + 1}`);
      await quiz.scrollIntoViewIfNeeded(); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Dibaca: Tiga ribu delapan ratus lima/).waitFor();
    await fit("hasil"); await shot("result", true);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 4 bab 1 di ${width}×${height}: 9 peraga, 36 latihan (1 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: setelah diperiksa, pembahasan membuat kartu lebih tinggi dari layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
