import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, itemText } from "../src/data/grade-one-counting-10.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-one-counting-10-screenshots";
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
        if (p.kind === "num") await box(p.label).fill(v[i]);
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "match") { for (const [k, l] of p.left.entries()) { await button(`Pilih ${itemText(l)}`).click(); await button(`Hubungkan ke ${itemText(p.right[Number(x[k])])}`).click(); } }
        else if (p.kind === "color") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: `Bola ${Number(k) + 1}`, exact: true }).click(); }
        else if (p.kind === "pick") await button(p.groups[Number(v[i])].label).click();
        else if (p.kind === "seq") { for (const [k, c] of x.entries()) await box(`Urutan ${i + 1} kotak ${k + 1}`).fill(c); }
        else if (p.kind === "bond") { const names = ["Bilangan utuh", "Bagian pertama", "Bagian kedua"].filter((_, j) => p.hide[j]); for (const [k, c] of x.entries()) await box(names[k]).fill(c); }
        else if (p.kind === "bonds") { for (let j = 0; j < p.k; j++) { await box(`Pasangan ${j + 1} bagian pertama`).fill(x[2 * j]); await box(`Pasangan ${j + 1} bagian kedua`).fill(x[2 * j + 1]); } }
        else if (p.kind === "chain") { for (const [k, c] of x.entries()) await box(`Kotak ${"ABC"[k]}`).fill(c); }
        else if (p.kind === "dots") { for (const d of v[i].split(",")) await button(`Titik ${d}`).click(); }
      }
    }
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`);
    await page.locator(`a[href$="/materi/membilang-sampai-dengan-10"]`).first().click();
    await page.getByRole("heading", { name: "Ayo Membilang sampai dengan 10", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      frame: async () => { assert.equal(await result(), "3"); await button("Banyak benda tambah").click(); assert.equal(await result(), "4"); await radio("kursi").click(); await clicks("Banyak benda kurangi", 4); assert.equal(await result(), "0"); },
      hands: async () => { assert.equal(await result(), "2|0"); for (const f of ["Jari telunjuk kiri", "Jari tengah kiri", "Jari manis kiri", "Jari kelingking kiri", "Ibu jari kiri"]) await button(f).click(); assert.equal(await result(), "7|0"); await button("Simpan cara untuk 7").click(); assert.equal(await result(), "7|1"); },
      pair: async () => { assert.equal(await result(), "sama"); await button("Burung tambah").click(); assert.equal(await result(), "kurang"); await clicks("Sepeda tambah", 2); assert.equal(await result(), "lebih"); },
      compare: async () => { assert.equal(await result(), "0|"); await button("Kotak B").click(); assert.equal(await result(), "0|ok"); await button("Ronde berikutnya").click(); await button("Kotak B").click(); assert.equal(await result(), "1|no"); },
      up: async () => { assert.equal(await result(), "1"); await clicks("Naik satu", 9); assert.equal(await result(), "10"); },
      down: async () => { assert.equal(await result(), "10"); await clicks("Turun satu", 3); assert.equal(await result(), "7"); },
      split: async () => { assert.equal(await result(), "4|3"); await button("Pindahkan kelereng 1 dari piring kiri").click(); assert.equal(await result(), "3|4"); },
      ways: async () => { assert.equal(await result(), "0/4"); await button("Catat pasangan ini").click(); assert.equal(await result(), "1/4"); await button("Pemisah tambah").click(); await button("Catat pasangan ini").click(); assert.equal(await result(), "2/4"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      for (const [j, sec] of topics[t].sections.entries()) {
        await page.getByRole("tab", { name: `${topics[t].code}.${j + 1} ${sec.title}`, exact: true }).click();
        await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${topics[t].code}${j + 1}`);
      }
      await button(`Latihan ${topics[t].code}`).click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "5" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "6‖10" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Bingkai kiri: 7/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 1 bab 1 at ${width}px: 8 peraga, 16 latihan (1 salah disengaja), 24 evaluasi (tarik garis, warnai, daun, ulat, titik, pasangan bilangan), skor dan pembahasan`);
  }
} finally { await browser.close(); }
