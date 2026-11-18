// Uji browser Kelas 1 Bab 3 Pengurangan sampai dengan 10 pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-one-sub10-v2.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, thingName } from "../src/data/grade-one-sub10-v2.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-one-sub10-v2-screenshots";
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
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "fill") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "bond") { const labels = [p.whole === null && "Gabungan", p.parts[0] === null && "Sebagian pertama", p.parts[1] === null && "Sebagian kedua"].filter(Boolean); for (const [k, c] of x.entries()) await box(labels[k]).fill(c); }
        else if (p.kind === "back") await button(`Bilangan ${v[i]}`).click();
        else if (p.kind === "cross") { for (const k of v[i].split(",")) await button(`${thingName[p.thing]} ${Number(k) + 1}`).click(); }
        else if (p.kind === "sign") await group(`Kalimat ${i + 1}: ${p.a} □ ${p.b} = ${p.c}`).getByRole("button", { name: v[i] === "+" ? "Tanda tambah" : "Tanda kurang", exact: true }).click();
        else if (p.kind === "pick") await group(p.label).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "multi") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: p.options[Number(k)], exact: true }).click(); }
        else if (p.kind === "build") { for (const k of v[i].split(",")) await button(`Kartu ${p.tiles[Number(k)]}`).click(); }
        else if (p.kind === "pairs") { for (const [k, c] of x.entries()) await box(`Operasi ${Math.floor(k / 2) + 1} bilangan ${k % 2 ? "kedua" : "pertama"}`).fill(c); }
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`);
    await page.locator(`a[href$="/materi/pengurangan-sampai-dengan-10"]`).first().click();
    await page.getByRole("heading", { name: "Pengurangan sampai dengan 10", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const tab = name => page.getByRole("tab", { name, exact: true });
    const radio = name => page.getByRole("radio", { name, exact: true });
    const labChecks = {
      ambil: async () => { assert.equal(await result(), "6-0"); await button("apel 1").click(); await button("apel 2").click(); assert.equal(await result(), "6-2"); await page.getByTestId("lab-result").getByText("6 − 2 = 4").waitFor(); },
      cara: async () => { assert.equal(await result(), "pasangan:6:0"); await button("Apel 1").click(); assert.equal(await result(), "pasangan:6:1");
        await tab("Hitung mundur").click(); assert.equal(await result(), "mundur:5:0"); await button("Mundur").click(); await button("Mundur").click(); assert.equal(await result(), "mundur:5:2");
        await tab("Dari 10").click(); assert.equal(await result(), "sepuluh:0"); for (const k of [1, 2, 3]) await button(`kelereng ${k}`).click(); assert.equal(await result(), "sepuluh:3"); },
      keluarga: async () => { assert.equal(await result(), "keluarga:4:3:0"); await radio("7 − 3 = 4").click(); assert.equal(await result(), "keluarga:4:3:2"); await button("Hijau tambah").click(); assert.equal(await result(), "keluarga:4:4:2"); },
      cerita: async () => { assert.equal(await result(), "8-2:0"); await button("Lihat penyelesaian").click(); assert.equal(await result(), "8-2:1"); },
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
    await page.getByText(/Jawaban benar Sekarang tersisa 3 kupu-kupu\./).waitFor();
    await fit("hasil"); await shot("result", true);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 1 bab 3 di ${width}×${height}: 4 peraga, 16 latihan (1 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: tinggi melebihi layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
