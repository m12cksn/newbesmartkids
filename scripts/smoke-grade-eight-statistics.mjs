import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, plain, idn, blanks } from "../src/data/grade-eight-statistics.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-eight-statistics-screenshots";
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
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "sort") { const g = group(l); for (const k of v[i].split(",").map(Number)) await g.getByRole("button", { name: `Kartu ${k + 1}: ${idn(p.values[k])}`, exact: true }).click(); }
        else if (p.kind === "table") { for (const [k, [r, c]] of blanks(p).entries()) await box(`${p.head[c]} untuk ${p.rows[r][0]}`).fill(x[k]); }
      }
    }
    await page.goto(`${origin}/kelas/hubungan-geometri-kelas-8`);
    await page.locator(`a[href$="/materi/statistika"]`).first().click();
    await page.getByRole("heading", { name: "Statistika", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      mode: async () => { assert.equal(await result(), "39"); await clicks("Ukuran 38 tambah", 4); assert.equal(await result(), "38,39"); },
      median: async () => { assert.equal(await result(), "ganjil|0|"); await clicks("Pasangkan dari luar", 5); assert.equal(await result(), "ganjil|5|39"); await radio("10 nilai UTS").click(); await clicks("Pasangkan dari luar", 4); assert.equal(await result(), "genap|4|79"); },
      mean: async () => { assert.equal(await result(), "90|15"); await clicks("Sabtu tambah", 6); assert.equal(await result(), "96|16"); },
      freq: async () => { assert.equal(await result(), "30|2610|87"); await button("Frekuensi 100 tambah").click(); assert.equal(await result(), "31|2710|87,42"); },
      range: async () => { assert.equal(await result(), "168|154|14"); await button("Nadiva 154").click(); assert.equal(await result(), "168|156|12"); },
      quartile: async () => { assert.equal(await result(), "72|79|86"); await radio("16 data").click(); assert.equal(await result(), "66|76|85"); },
      spread: async () => { assert.equal(await result(), "84|24|14|7"); await clicks("Nilai terbesar tambah", 6); assert.equal(await result(), "90|30|14|7"); },
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
        await answer(q, miss ? "150" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "Senin" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Jawaban: Selasa dan Kamis/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 8 bab 6 at ${width}px: 7 peraga, 8 latihan (1 salah disengaja), 24 evaluasi (urutkan data, tabel frekuensi, modus/median/rata-rata, kuartil, simpangan, pendapat siswa), skor dan pembahasan`);
  }
} finally { await browser.close(); }
