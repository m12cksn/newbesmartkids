// Uji browser Kelas 1 Bab 6 Penjumlahan dan Pengurangan sampai dengan 20 pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-one-op20-v2.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-one-op20-v2.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-one-op20-v2-screenshots";
await mkdir(folder, { recursive: true });
// 320×800: lebar sempit tanpa zoom tinggi-layar, agar isi yang terpotong ikut tertangkap.
const sizes = [[320, 640], [320, 800], [390, 844], [768, 1024], [1280, 800]];
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
    // 320×800 hanya untuk memeriksa tepi kanan; tinggi layar dinilai ketat di empat ukuran standar.
    const fitsScreen = async (locator, label, strict = !process.env.SOFT && height !== 800) => { const b = await locator.boundingBox(), r = await room(); if (b.height > r + 1) { if (strict) assert.fail(`${width}×${height} ${label}: tinggi ${Math.round(b.height)} > layar ${Math.round(r)}`); else { const parts = process.env.DEBUG ? await locator.evaluate(el => [...el.children].map(c => `${c.tagName.toLowerCase()}:${Math.round(c.getBoundingClientRect().height)}`).join(' ')) : ''; tall.push(`${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)} ${parts}`); } } };
    const quiz = page.locator("section:has(> progress)");
    const shot = async (name, full = false) => { if (width === 390 || width === 1280 || (process.env.SHOT320 && width === 320)) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: full }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "fill" || p.kind === "strip") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "hop") await button(`Bilangan ${v[i]}`).click();
        else if (p.kind === "split") { const labels = [p.parts[0] === null && "Bagian pertama", p.parts[1] === null && "Bagian kedua"].filter(Boolean); for (const [k, c] of x.entries()) await box(labels[k]).fill(c); }
        else if (p.kind === "column") { const name = { at: "puluhan pertama", ao: "satuan pertama", b: "satuan kedua", rt: "puluhan hasil", ro: "satuan hasil" }; for (const [k, s] of p.blanks.entries()) await box(`Bagian ${i + 1} ${name[s]}`).fill(x[k]); }
        else if (p.kind === "eq") { await box(`Bagian ${i + 1} bilangan pertama`).fill(x[0]); await page.getByRole("radiogroup", { name: `Bagian ${i + 1} tanda`, exact: true }).getByRole("radio", { name: x[1] === "+" ? "tambah" : "kurang", exact: true }).click(); await box(`Bagian ${i + 1} bilangan kedua`).fill(x[2]); await box(`Bagian ${i + 1} hasil`).fill(x[3]); }
        else if (p.kind === "draw") { for (const [k, g] of ["A", "B"].entries()) for (let t = 0; t < Number(x[k]); t++) await button(`Tambah benda ${g}`).click(); }
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`);
    await page.locator(`a[href$="/materi/penjumlahan-dan-pengurangan-sampai-dengan-20"]`).first().click();
    await page.getByRole("heading", { name: "Penjumlahan dan Pengurangan sampai dengan 20", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const tab = name => page.getByRole("tab", { name, exact: true });
    const labChecks = {
      selisih: async () => { assert.equal(await result(), "selisih:7:6"); for (let k = 0; k < 3; k++) await button("Tika tambah").click(); assert.equal(await result(), "selisih:7:9"); await page.getByTestId("lab-result").getByText("Selisihnya 9 − 7 = 2", { exact: false }).waitFor(); },
      tambah: async () => { assert.equal(await result(), "maju:7:6"); await tab("Dengan 10").click(); assert.equal(await result(), "sepuluh:7:6:0"); await button("Penuhi bingkai 10").click(); assert.equal(await result(), "sepuluh:7:6:1"); await tab("Nilai tempat").click(); assert.equal(await result(), "tempat:12:3"); },
      kurang: async () => { assert.equal(await result(), "mundur:15:3"); await tab("Pasangan bilangan").click(); assert.equal(await result(), "pasangan:15:0"); await button("Apel satuan 2").click(); assert.equal(await result(), "pasangan:15:2"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].short}`).click();
      for (const [j, sec] of [topics[t]].entries()) {
        await labChecks[sec.lab](); await fit(`peraga ${sec.lab}`);
        await fitsScreen(page.getByTestId("lab"), `peraga ${sec.lab}`);
        await page.getByTestId("lab").scrollIntoViewIfNeeded(); await shot(`lab-${topics[t].code}${j + 1}`);
      }
      await button(`Latihan ${topics[t].code}`).click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `latihan ${t}-${k} terkunci sebelum dijawab`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? q.answer.replace(/\d+$/, d => String(Number(d) + 1)) : q.answer); if (miss) wrong++;
        await fitsScreen(quiz, `latihan ${topics[t].code}${k + 1}`);
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        { const over = await quiz.evaluate(el => [...el.querySelectorAll("*")].filter(c => c.getBoundingClientRect().right > el.getBoundingClientRect().right + 1).map(c => `${c.tagName.toLowerCase()}:${(c.textContent ?? "").slice(0, 30)}`).slice(0, 3)); assert.deepEqual(over, [], `${width}×${height} latihan ${topics[t].code}${k + 1}: isi melewati tepi kanan`); }
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
      await answer(q, i === 0 ? q.answer.replace(/\d+$/, d => String(Number(d) + 1)) : q.answer);
      await fit(`evaluasi ${i + 1}`); await fitsScreen(quiz, `evaluasi ${i + 1}`);
      { const over = await quiz.evaluate(el => [...el.querySelectorAll("*")].filter(c => c.getBoundingClientRect().right > el.getBoundingClientRect().right + 1).map(c => `${c.tagName.toLowerCase()}.${String(c.className).slice(0, 40)}`).slice(0, 3)); assert.deepEqual(over, [], `${width}×${height} evaluasi ${i + 1}: isi melewati tepi kanan`); }
      await quiz.scrollIntoViewIfNeeded(); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Ada 9 kue lapis\./).waitFor();
    await fit("hasil"); await shot("result", true);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 1 bab 6 di ${width}×${height}: 3 peraga, 12 latihan (1 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: tinggi melebihi layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
