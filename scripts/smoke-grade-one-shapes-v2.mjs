// Uji browser Kelas 1 Bab 4 Mengenal Bentuk pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-one-shapes-v2.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, itemName, isName } from "../src/data/grade-one-shapes-v2.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-one-shapes-v2-screenshots";
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
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      const side = r => (isName(r) ? r : itemName(r));
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "match") { for (const [k, r] of x.entries()) { await page.getByRole("button", { name: /^Pilih / }).nth(k).click(); await button(`Hubungkan ke ${side(p.right[Number(r)])}`).click(); } }
        else if (p.kind === "trace") { await button("Hubungkan garis putus-putus").click(); await group("Nama bentuk").getByRole("button", { name: x[1], exact: true }).click(); }
        else if (p.kind === "multi") { for (const k of v[i].split(",")) await group(p.label).getByRole("button").nth(Number(k)).click(); }
        else if (p.kind === "pick") await group(p.label).getByRole("button").nth(Number(v[i])).click();
        else if (p.kind === "paint") { for (const [k, c] of x.entries()) if (c) { await page.getByRole("radio", { name: c === "m" ? "Merah" : "Kuning", exact: true }).click(); await button(`Bentuk ${k + 1}`).click(); } }
        else if (p.kind === "sort") { for (const [k, b] of x.entries()) { await button(`Pilih ${itemName(p.items[k])}`).click(); await button(`Masukkan ke ${p.bins[Number(b)]}`).click(); } }
        else if (p.kind === "puzzle") await button(`Potongan ${"abc"[Number(v[i])]}`).click();
        else if (p.kind === "count") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "slots") { for (const [k, c] of x.entries()) { await page.getByRole("button", { name: new RegExp(`^Keping ${Number(c) + 1}:`) }).click(); await page.getByRole("button", { name: new RegExp(`^Tempat ${k + 1}(,|$)`) }).press("Enter"); } }
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`);
    await page.locator(`a[href$="/materi/mengenal-bentuk"]`).first().click();
    await page.getByRole("heading", { name: "Mengenal Bentuk", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const tab = name => page.getByRole("tab", { name, exact: true });
    const radio = name => page.getByRole("radio", { name, exact: true });
    const labChecks = {
      cari: async () => { assert.equal(await result(), "cari:0:0"); await button("Pilih jam dinding").click(); await button("Masukkan ke Bentuk lengkung").click(); assert.equal(await result(), "cari:1:1");
        await button("Pilih buku").click(); await button("Masukkan ke Segitiga").click(); assert.equal(await result(), "cari:2:1"); },
      kelompok: async () => { assert.equal(await result(), "kelompok:bentuk"); await radio("Warna").click(); assert.equal(await result(), "kelompok:warna"); await radio("Ukuran").click(); assert.equal(await result(), "kelompok:ukuran"); },
      susun: async () => { assert.equal(await result(), "gabung:0"); await button("Tempelkan").click(); assert.equal(await result(), "gabung:1"); await button("Putar segitiga biru").click(); assert.equal(await result(), "gabung:2");
        await tab("Susun rumah").click(); assert.equal(await result(), "rumah:0");
        for (const [slot, piece] of [[1, 2], [2, 4], [3, 1], [4, 3]]) { await page.getByRole("button", { name: new RegExp(`^Keping ${piece}:`) }).click(); await page.getByRole("button", { name: new RegExp(`^Tempat ${slot}(,|$)`) }).press("Enter"); }
        assert.equal(await result(), "rumah:4"); },
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
      await quiz.scrollIntoViewIfNeeded(); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar jam dinding → bentuk lengkung merah/).waitFor();
    await fit("hasil"); await shot("result", true);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 1 bab 4 di ${width}×${height}: 3 peraga, 12 latihan (1 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: tinggi melebihi layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
