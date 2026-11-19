// Uji browser Kelas 1 Bab 7 Mengukur Panjang Benda pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-one-length-v2.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, circleNames } from "../src/data/grade-one-length-v2.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-one-length-v2-screenshots";
await mkdir(folder, { recursive: true });
// 320×800: lebar sempit tanpa zoom tinggi-layar, agar isi yang terpotong ikut tertangkap.
const sizes = (process.env.SIZES ?? "320x640,320x800,390x844,768x1024,1280x800").split(",").map(s => s.split("x").map(Number));
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const tall = [];
/** Jawaban salah: bagian pertama diganti. */
function wrong(q) {
  const v = q.answer.split(SEP), p = q.parts[0];
  if (p.kind === "circle") v[0] = String(p.scene.items.findIndex((_, k) => !p.ans.includes(k)));
  else if (p.kind === "fill") v[0] = [String(p.answers[0] + 1), ...p.answers.slice(1)].join("|");
  else if (p.kind === "lay") v[0] = String(Number(v[0]) + 1);
  else if (p.kind === "pick") v[0] = String((Number(v[0]) + 1) % p.ways.length);
  else if (p.kind === "choose") v[0] = [p.options.find(o => o !== p.answers[0]), ...p.answers.slice(1)].join("|");
  else v[0] = v[0].split("|").reverse().join("|");
  return v.join(SEP);
}
try {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const room = () => page.evaluate(() => innerHeight - document.querySelector("header").getBoundingClientRect().height);
    // 320×800 hanya untuk memeriksa tepi kanan; tinggi layar dinilai ketat di empat ukuran standar.
    const fitsScreen = async (locator, label, strict = !process.env.SOFT && height !== 800) => { const b = await locator.boundingBox(), r = await room(); if (b.height > r + 1) { if (strict) assert.fail(`${width}×${height} ${label}: tinggi ${Math.round(b.height)} > layar ${Math.round(r)}`); else tall.push(`${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)}`); } };
    const quiz = page.locator("section:has(> progress)");
    const shot = async name => { if (width === 390 || width === 1280 || (process.env.SHOT320 && width === 320)) await page.screenshot({ path: `${folder}/${width}-${name}.png` }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const rightEdge = async label => { const over = await quiz.evaluate(el => [...el.querySelectorAll("*")].filter(c => !(c.ownerSVGElement) && c.getBoundingClientRect().right > el.getBoundingClientRect().right + 1).map(c => `${c.tagName.toLowerCase()}.${String(c.className?.baseVal ?? c.className).slice(0, 30)}`).slice(0, 3)); assert.deepEqual(over, [], `${width}×${height} ${label}: isi melewati tepi kanan`); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "circle") { const names = circleNames(p.scene); for (const k of v[i].split(",")) await page.getByRole("button", { name: names[Number(k)], exact: true }).click(); }
        else if (p.kind === "fill") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "choose" && p.anyOrder && !p.options.every(o => o.length <= 2)) { for (const c of x) await page.getByRole("group", { name: `Bagian ${i + 1} pilihan`, exact: true }).getByRole("button", { name: c, exact: true }).click(); }
        else if (p.kind === "choose") { for (const [k, c] of x.entries()) await page.getByRole("radiogroup", { name: `Bagian ${i + 1} kotak ${k + 1}`, exact: true }).getByRole("radio", { name: c, exact: true }).click(); }
        else if (p.kind === "order") { for (const c of x) await button(`Bagian ${i + 1} pilih ${c}`).click(); }
        else if (p.kind === "lay") { for (let t = 0; t < Number(v[i]); t++) await button("Tambah alat ukur").click(); }
        else if (p.kind === "pick") await button(`Gambar ${Number(v[i]) + 1}`).click();
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`);
    await page.locator(`a[href$="/materi/mengukur-panjang-benda"]`).first().click();
    await page.getByRole("heading", { name: "Mengukur Panjang Benda", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const tab = name => page.getByRole("tab", { name, exact: true });
    const labChecks = {
      banding: async () => {
        assert.equal(await result(), "panjang:11:8:6:0"); await button("Ratakan ujung kiri").click(); assert.equal(await result(), "panjang:11:8:6:1");
        await page.getByTestId("lab-result").getByText("Pensil biru paling panjang. Pensil hijau paling pendek.").waitFor();
        for (let k = 0; k < 3; k++) await button("Pensil merah panjangkan").click(); assert.equal(await result(), "panjang:11:11:6:1");
        await page.getByTestId("lab-result").getByText("Pensil biru dan Pensil merah paling panjang", { exact: false }).waitFor();
        await tab("Tinggi").click(); assert.equal(await result(), "tinggi:8:6:10:8"); await page.getByTestId("lab-result").getByText("Pohon A dan Pohon D sama tinggi", { exact: false }).waitFor();
        await tab("Terbang").click(); assert.equal(await result(), "terbang:5:3:7"); await button("Kupu-kupu kuning naik").click(); assert.equal(await result(), "terbang:5:4:7");
        await page.getByTestId("lab-result").getByText("Kupu-kupu kuning terbang lebih rendah dari kupu-kupu merah", { exact: false }).waitFor();
      },
      ukur: async () => {
        assert.equal(await result(), "ukur:buku:stik:0"); await button("Tambah alat ukur").click(); await button("Tambah alat ukur").click();
        assert.equal(await result(), "ukur:buku:stik:2"); await page.getByTestId("lab-result").getByText("Pas dari ujung ke ujung. Panjang buku = 2 stik es krim.", { exact: false }).waitFor();
        await button("koin").click(); for (let k = 0; k < 12; k++) await button("Tambah alat ukur").click();
        await page.getByTestId("lab-result").getByText("Hasil berbeda karena alat ukurnya berbeda: 12 koin, 2 stik es krim.", { exact: false }).waitFor();
        await button("meja").click(); assert.equal(await result(), "ukur:meja:jengkal:0");
        await tab("Cara mengukur").click(); assert.equal(await result(), "cara:celah"); await button("Rapat dari ujung ke ujung").click(); assert.equal(await result(), "cara:benar");
      },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].short}`).click();
      await labChecks[topics[t].lab](); await fit(`peraga ${topics[t].lab}`);
      await fitsScreen(page.getByTestId("lab"), `peraga ${topics[t].lab}`);
      await page.getByTestId("lab").scrollIntoViewIfNeeded(); await shot(`lab-${topics[t].code}`);
      await button(`Latihan ${topics[t].code}`).click();
      let miss = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `latihan ${t}-${k} terkunci sebelum dijawab`);
        await fitsScreen(quiz, `latihan ${topics[t].code}${k + 1} sebelum menjawab`);
        const bad = k === 0; await answer(q, bad ? wrong(q) : q.answer); if (bad) miss++;
        await fitsScreen(quiz, `latihan ${topics[t].code}${k + 1}`);
        await button("Periksa jawaban").click(); await page.getByText(bad ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await rightEdge(`latihan ${topics[t].code}${k + 1}`); await fit(`latihan ${t}-${k}`); await fitsScreen(quiz, `latihan ${topics[t].code}${k + 1} setelah diperiksa`, false);
        await quiz.scrollIntoViewIfNeeded(); await shot(`practice-${topics[t].code}-${k + 1}`);
        await button(k === set.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${set.length - miss} · Salah ${miss} · Skor ${Math.round((set.length - miss) / set.length * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `evaluasi ${i + 1} terkunci sebelum dijawab`);
      await fitsScreen(quiz, `evaluasi ${i + 1} sebelum menjawab`);
      await answer(q, i === 0 ? wrong(q) : q.answer);
      await fit(`evaluasi ${i + 1}`); await fitsScreen(quiz, `evaluasi ${i + 1}`); await rightEdge(`evaluasi ${i + 1}`);
      await quiz.scrollIntoViewIfNeeded(); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar melingkari sisir merah muda\./).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 1 bab 7 di ${width}×${height}: 2 peraga, 8 latihan (2 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: tinggi melebihi layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
