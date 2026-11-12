import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-seven-ratio.ts";
const plain = s => s.replace(/\{([^}]+)\}/g, "$1");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-seven-ratio-screenshots";
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
        const x = cells(p, v[i]), L = plain(p.label ?? "");
        if (p.kind === "ratio") { await box(`${L} bilangan pertama`).fill(x[0]); await box(`${L} bilangan kedua`).fill(x[1]); }
        else if (p.kind === "frac") { await box(`${L} pembilang`).fill(x[0]); await box(`${L} penyebut`).fill(x[1]); }
        else if (p.kind === "num") await box(L).fill(v[i]);
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(o).click(); }
        else if (p.kind === "select") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: p.options[Number(k)], exact: true }).click(); }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(plain(r.text)).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "pie") { for (const k of v[i].split(",").map(Number)) await button(`Juring ${k + 1}`).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/logika-dan-aljabar-kelas-7`);
    await page.locator(`a[href$="/materi/rasio-kelas-7"]`).first().click();
    await page.getByRole("heading", { name: "Rasio", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      glasses: async () => { assert.equal(await result(), "2:3"); await clicks("Gelas susu tambah", 2); assert.equal(await result(), "1:1"); },
      percent: async () => { assert.equal(await result(), "120|4 : 1"); await button("Cokelat murni kurangi").click(); assert.equal(await result(), "112,5|3 : 1"); },
      compare: async () => { assert.equal(await result(), "kiri"); await clicks("Kanan cokelat tambah", 3); assert.equal(await result(), "sama"); },
      resize: async () => { assert.equal(await result(), "ya"); await button("Lebar baru tambah").click(); assert.equal(await result(), "tidak"); },
      proportion: async () => { assert.equal(await result(), "24"); await button("Panjang baru tambah").click(); assert.equal(await result(), "24,75"); },
      map: async () => { assert.equal(await result(), "15000000"); await radio("1 : 100").click(); assert.equal(await result(), "300"); },
      unitrate: async () => { assert.equal(await result(), "Botol A"); await button("Botol B cokelat tambah").click(); assert.equal(await result(), "Botol B"); },
      price: async () => { assert.equal(await result(), "Kakao;Bola Kecil;Lezatos;Choko"); await radio("Kakao").click(); await clicks("Harga tambah", 5); assert.equal(await result(), "Bola Kecil;Lezatos;Kakao;Choko"); },
      rates: async () => { assert.equal(await result(), "30"); await radio("Efisiensi").click(); assert.equal(await result(), "12"); },
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
        const miss = t === 0 && k === 1;
        await answer(q, miss ? "6|4" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 4 ? "16" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Lebar baru: 18 cm/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 7 bab 3 at ${width}px: 9 peraga, 12 latihan (1 salah disengaja), 24 evaluasi (rasio, pecahan, proporsi, skala, laju satuan, juring, urutan), skor dan pembahasan`);
  }
} finally { await browser.close(); }
