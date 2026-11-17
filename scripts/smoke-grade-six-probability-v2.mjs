// Uji browser Kelas 6 Bab 4 Peluang pada 320/390/768/1280.
// Selain fungsi, memeriksa bahwa peraga dan setiap soal (sampai tombol jawab) muat di layar tanpa menggulir.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-grade-six-probability-v2.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, CATS } from "../src/data/grade-six-probability-v2.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-six-probability-v2-screenshots";
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
    const radio = (g, name) => page.getByRole("radiogroup", { name: g, exact: true }).getByRole("radio", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const room = () => page.evaluate(() => innerHeight - document.querySelector("header").getBoundingClientRect().height);
    const fitsScreen = async (locator, label, strict = !process.env.SOFT) => { const b = await locator.boundingBox(), r = await room(); if (b.height > r + 1) { if (strict) assert.fail(`${width}×${height} ${label}: tinggi ${Math.round(b.height)} > layar ${Math.round(r)}`); else { const parts = process.env.DEBUG ? await locator.evaluate(el => [...el.children].map(c => `${c.tagName.toLowerCase()}:${Math.round(c.getBoundingClientRect().height)}`).join(" ")) : ""; tall.push(`${width}×${height} ${label} ${Math.round(b.height)}/${Math.round(r)} ${parts}`); } } };
    const quiz = page.locator("section:has(> progress)");
    const shot = async (name, full = false) => { if (width === 390 || width === 1280 || (process.env.SHOT320 && width === 320)) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: full }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    const cap = c => c[0].toUpperCase() + c.slice(1);
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "fill") { for (const [k, c] of x.entries()) await box(`Bagian ${i + 1} kotak ${k + 1}`).fill(String(c)); }
        else if (p.kind === "choice") await group(p.label).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "pick") await group(p.label).getByRole("button", { name: `Gambar ${"ABCD"[Number(v[i])]}`, exact: true }).click();
        else if (p.kind === "scale") { for (const [k, it] of p.items.entries()) await radio(it.label, CATS[Number(x[k])]).click(); }
        else if (p.kind === "die") { for (const [k, f] of x.entries()) for (let n = 0; n <= p.values.indexOf(Number(f)); n++) await page.getByRole("button", { name: new RegExp(`^Sisi ${k + 1}(,|$)`) }).click(); }
        else if (p.kind === "bag") { for (const [k, c] of p.colors.entries()) await clicks(`${cap(c)} tambah`, Number(x[k])); }
        else if (p.kind === "spin") { for (const [k, c] of x.entries()) { await radio("Warna roda", c).click(); await button(`Bagian ${k + 1}`).click(); } }
      }
    }

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/konsep-inti-matematika-kelas-6`);
    await page.locator(`a[href$="/materi/peluang"]`).first().click();
    await page.getByRole("heading", { name: "Peluang", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();
    await fit("awal");

    const labChecks = {
      bag: async () => { assert.equal(await result(), "2-1-1"); await clicks("Kuning kurangi", 2); assert.equal(await result(), "3-1-0"); },
      die: async () => { assert.equal(await result(), "3:3:2"); await page.getByRole("button", { name: /^Sisi 1,/ }).click(); assert.equal(await result(), "3:4:3"); },
      game: async () => { assert.equal(await result(), "1/2|1/6|1"); await button("Pemain 2 angka 4").click(); await button("Pemain 2 angka 5").click(); assert.equal(await result(), "1/2|3/6|0"); await button("Lempar 12 kali").click(); await page.getByText(/menang \d+ dari 12 lemparan/).first().waitFor(); },
      boxes: async () => { assert.equal(await result(), "A"); await clicks("Kotak B biru tambah", 2); assert.equal(await result(), "A"); await clicks("Kotak B putih kurangi", 2); assert.equal(await result(), "B"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
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
        await answer(q, miss ? "1|1|0" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "2|1|1" : q.answer);
      await fit(`evaluasi ${i + 1}`); await fitsScreen(quiz, `evaluasi ${i + 1}`);
      await quiz.scrollIntoViewIfNeeded(); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Bola merah: mungkin, Bola biru: kurang mungkin, Bola hijau: tidak mungkin/).waitFor();
    await fit("hasil"); await shot("result", true);
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 6 bab 4 di ${width}×${height}: 4 peraga, 16 latihan (1 salah disengaja), 24 evaluasi, muat di layar, skor dan pembahasan`);
  }
  if (tall.length) console.log(`Catatan: setelah diperiksa, pembahasan membuat kartu lebih tinggi dari layar pada:\n  ${tall.join("\n  ")}`);
} finally { await browser.close(); }
