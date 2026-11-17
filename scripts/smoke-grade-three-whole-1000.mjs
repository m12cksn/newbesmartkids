// Uji browser Kelas 3 Bab 1 Bilangan Cacah sampai 1.000 pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-three-whole-1000.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-three-whole-1000.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-three-whole-1000-screenshots";
await mkdir(folder, { recursive: true });
const places = ["Ratusan", "Puluhan", "Satuan"];
const sizes = [[320, 640], [390, 844], [768, 1024], [1280, 800]];
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const tall = [];
try {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const room = () => page.evaluate(() => innerHeight - document.querySelector("header").getBoundingClientRect().height);
    const fitsScreen = async (locator, label, strict = true) => { const b = await locator.boundingBox(), r = await room(); if (b.height > r + 1) { if (strict) assert.fail(`${width}×${height} ${label}: tinggi ${Math.round(b.height)} > layar ${Math.round(r)}`); else tall.push(`${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)}`); } };
    const quiz = page.locator("section:has(> progress)");
    const shot = async (name, full = false) => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: full }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "fill") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "pv") { const names = places.filter((_, j) => p.hide[j]); if (p.hideN) names.push("Bilangan"); for (const [k, c] of x.entries()) await box(names[k]).fill(c); }
        else if (p.kind === "choice") await group(p.label).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "multi" || p.kind === "order") { for (const o of v[i].split("|")) await group(p.label).getByRole("button", { name: o, exact: true }).click(); }
        else if (p.kind === "match") { for (const [k, l] of p.left.entries()) { await button(`Pilih ${l}`).click(); await button(`Hubungkan ke ${p.right[Number(x[k])]}`).click(); } }
        else if (p.kind === "column") { for (const [k, c] of x.entries()) await box(`Hasil angka ${k + 1}`).fill(c); }
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/dasar-matematika-kelas-3`);
    await page.locator(`a[href$="/materi/bilangan-cacah-sampai-1000"]`).first().click();
    await page.getByRole("heading", { name: "Bilangan Cacah sampai 1.000", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const labChecks = {
      blocks: async () => { assert.equal(await result(), "115"); await clicks("Satuan tambah", 5); assert.equal(await result(), "tukar"); await button("Tukar 10 satuan jadi 1 puluhan").click(); assert.equal(await result(), "120");
        await clicks("Ratusan tambah", 7); await clicks("Puluhan tambah", 8); await button("Tukar 10 puluhan jadi 1 ratusan").click(); assert.equal(await result(), "900"); await clicks("Puluhan tambah", 10); assert.ok(await button("Satuan tambah").isDisabled(), "satuan berhenti di 1.000"); assert.ok(await button("Puluhan tambah").isDisabled(), "batas 1.000"); await button("Tukar 10 puluhan jadi 1 ratusan").click(); assert.equal(await result(), "1000"); },
      cards: async () => { assert.equal(await result(), ""); for (const d of [7, 0, 3]) await button(`Kartu ${d}`).click(); assert.equal(await result(), "703"); },
      cans: async () => { assert.equal(await result(), "251"); await button("Puluhan tambah").click(); assert.equal(await result(), "261"); },
      compare: async () => { assert.equal(await result(), "0|"); await button("Tanda <").click(); assert.equal(await result(), "0|ok"); await button("Berikutnya").click(); await button("Tanda <").click(); assert.equal(await result(), "1|no"); },
      order: async () => { assert.equal(await result(), ""); for (const p of [825, 850, 875]) await button(`Harga ${p}`).click(); assert.equal(await result(), "ok"); },
      add: async () => { assert.equal(await result(), "fase0"); await button("Gabungkan").click(); assert.equal(await result(), "fase1"); await button("Tukar 10 satuan jadi 1 puluhan").click(); assert.equal(await result(), "64"); },
      sub: async () => { assert.equal(await result(), "kurang"); await button("Pindahkan 1 puluhan ke satuan").click(); assert.equal(await result(), "pinjam"); await button("Kurangi satuan").click(); await button("Kurangi puluhan").click(); assert.equal(await result(), "26"); },
      groups: async () => { assert.equal(await result(), "10"); await button("Kelompok tambah").click(); assert.equal(await result(), "12"); await button("Tukar").click(); assert.equal(await result(), "12"); },
      share: async () => { assert.equal(await result(), "r0"); await clicks("Bagikan satu ke setiap anggota", 5); assert.equal(await result(), "15:3=5"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].short}`).click();
      for (const [j, sec] of topics[t].sections.entries()) {
        if (topics[t].sections.length > 1) await page.getByRole("tab", { name: `${topics[t].code}.${j + 1} ${sec.title}`, exact: true }).click();
        await labChecks[sec.lab](); await fit(`peraga ${sec.lab}`);
        await fitsScreen(page.getByTestId("lab"), `peraga ${sec.lab}`);
        await page.getByTestId("lab").scrollIntoViewIfNeeded(); await shot(`lab-${topics[t].code}${j + 1}`);
      }
      await button(`Latihan ${topics[t].code}`).click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `latihan ${t}-${k} terkunci sebelum dijawab`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "1|1|1|111" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? q.answer.replace("4|0|7", "4|7|0") : q.answer);
      await fit(`evaluasi ${i + 1}`); await fitsScreen(quiz, `evaluasi ${i + 1}`);
      await quiz.scrollIntoViewIfNeeded(); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar ratusan 4, puluhan 0, satuan 7 \| Dibaca: Empat ratus tujuh/).waitFor();
    await fit("hasil"); await shot("result", true);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 3 bab 1 di ${width}×${height}: 9 peraga, 28 latihan (1 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: setelah diperiksa, pembahasan membuat kartu lebih tinggi dari layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
