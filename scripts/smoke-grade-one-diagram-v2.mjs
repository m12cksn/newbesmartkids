// Uji browser Kelas 1 Bab 8 Mengenal Diagram pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-one-diagram-v2.mjs
// FONT="DejaVu Sans" meniru font cadangan di runner CI; MARGIN=n mencatat soal yang sisa ruangnya kurang dari n px.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, itemName } from "../src/data/grade-one-diagram-v2.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-one-diagram-v2-screenshots";
await mkdir(folder, { recursive: true });
const sizes = (process.env.SIZES ?? "320x640,320x800,390x844,768x1024,1280x800").split(",").map(s => s.split("x").map(Number));
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const tall = [];
/** Jawaban salah: bagian pertama diganti. */
function wrong(q) {
  const v = q.answer.split(SEP), p = q.parts[0], x = v[0].split("|");
  if (p.kind === "choose") x[0] = p.options.find(o => !p.answers.includes(o));
  else if (p.kind === "group") x[0] = String((Number(x[0]) + 1) % p.cats.length);
  else x[0] = String(Number(x[0]) + 1);
  v[0] = x.join("|"); return v.join(SEP);
}
try {
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } }); page.setDefaultTimeout(10000);
    if (process.env.FONT) await page.addInitScript(f => { document.addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = `*{font-family:"${f}",sans-serif !important}`; document.head.append(st); }); }, process.env.FONT);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const room = () => page.evaluate(() => innerHeight - document.querySelector("header").getBoundingClientRect().height);
    // 320×800 hanya untuk memeriksa tepi kanan; tinggi layar dinilai ketat di empat ukuran standar.
    const fitsScreen = async (locator, label, strict = !process.env.SOFT && height !== 800) => { const b = await locator.boundingBox(), r = await room(); if (process.env.MARGIN && b.height > r - Number(process.env.MARGIN)) tall.push(`dekat ${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)}`); if (b.height > r + 1) { if (strict) assert.fail(`${width}×${height} ${label}: tinggi ${Math.round(b.height)} > layar ${Math.round(r)}`); else tall.push(`${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)}`); } };
    const quiz = page.locator("section:has(> progress)");
    const shot = async name => { if (width === 390 || width === 1280 || (process.env.SHOT320 && width === 320)) await page.screenshot({ path: `${folder}/${width}-${name}.png` }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const rightEdge = async label => { const over = await quiz.evaluate(el => [...el.querySelectorAll("*")].filter(c => !c.ownerSVGElement && c.getBoundingClientRect().right > el.getBoundingClientRect().right + 1).map(c => `${c.tagName.toLowerCase()}.${String(c.className?.baseVal ?? c.className).slice(0, 30)}`).slice(0, 3)); assert.deepEqual(over, [], `${width}×${height} ${label}: isi melewati tepi kanan`); };
    /** Kelompokkan: pilih kotak tujuan sekali, lalu ketuk bendanya. */
    async function sort(items, cats, target) {
      for (const c of new Set(target)) { await button(`Kotak ${cats[c].label}`).click(); for (const [k, it] of items.entries()) if (target[k] === c) await button(`${itemName(it)} ${k + 1}`).click(); }
    }
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "fill") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "choose" && p.anyOrder) { for (const c of x) await page.getByRole("group", { name: `Bagian ${i + 1} pilihan`, exact: true }).getByRole("button", { name: c, exact: true }).click(); }
        else if (p.kind === "choose") { for (const [k, c] of x.entries()) await page.getByRole("radiogroup", { name: `Bagian ${i + 1} kotak ${k + 1}`, exact: true }).getByRole("radio", { name: c, exact: true }).click(); }
        else if (p.kind === "table") { for (const [k, r] of p.rows.filter(r => !r.given).entries()) await box(`Bagian ${i + 1} ${r.label}`).fill(x[k]); }
        else if (p.kind === "paint") { for (const [k, r] of p.rows.entries()) if (Number(x[k]) > 0) await button(`${r.label} lingkaran ${x[k]}`).click(); }
        else if (p.kind === "group") await sort(p.items, p.cats, x.map(Number));
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`);
    await page.locator(`a[href$="/materi/mengenal-diagram"]`).first().click();
    await page.getByRole("heading", { name: "Mengenal Diagram", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const tab = name => page.getByRole("tab", { name, exact: true });
    const labChecks = {
      kelompok: async () => {
        assert.equal(await result(), "kelompok:0:0:0:0:14:h");
        const toys = ["pesawat", "mobil", "boneka", "bola"], labels = ["pesawat", "mobil", "boneka", "bola"];
        const items = await page.getByTestId("lab").getByRole("button").evaluateAll(b => b.map(x => x.getAttribute("aria-label")).filter(n => /^(pesawat|mobil-mobilan|boneka|bola merah) \d+$/.test(n)));
        for (const [c, o] of toys.entries()) { await button(`Kotak ${labels[c]}`).click(); for (const n of items.filter(n => n.startsWith(o === "mobil" ? "mobil-mobilan" : o))) await button(n).click(); }
        assert.equal(await result(), "kelompok:5:3:4:2:0:h");
        await page.getByTestId("lab-result").getByText("pesawat paling banyak (5). bola paling sedikit (2).", { exact: false }).waitFor();
        await tab("Menurun").click(); assert.equal(await result(), "kelompok:5:3:4:2:0:v"); await tab("Mendatar").click();
      },
      diagram: async () => {
        assert.equal(await result(), "diagram:3:4:3:2:v:obj"); await button("Tambah kol").click(); assert.equal(await result(), "diagram:3:4:3:3:v:obj");
        await tab("Mendatar").click(); await tab("Bintang").click(); assert.equal(await result(), "diagram:3:4:3:3:h:bintang");
        await page.getByTestId("lab-result").getByText("Semua ada 13 anak.", { exact: false }).waitFor();
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
    await page.getByText(/Jawaban benar Daftar Kelereng: Merah 4, Biru 6/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 1 bab 8 di ${width}×${height}: 2 peraga, 8 latihan (2 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: tinggi melebihi layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
