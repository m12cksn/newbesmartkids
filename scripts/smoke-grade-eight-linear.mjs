import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, plain } from "../src/data/grade-eight-linear.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-eight-linear-screenshots";
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
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Kalimat ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "set") { for (const nn of v[i].split(",")) await group(`Bilangan asli 1 sampai ${p.max}`).getByRole("button", { name: `Bilangan ${nn}`, exact: true }).click(); }
        else if (p.kind === "ineq") { await page.getByRole("radiogroup", { name: `${l} tanda`, exact: true }).getByRole("radio", { name: x[0], exact: true }).click(); await box(`${l} batas`).fill(x[1]); }
        else if (p.kind === "build") { for (const k of v[i].split(",")) await button(`Ubin ${p.tiles[Number(k)]}`).click(); }
      }
    }
    await page.goto(`${origin}/kelas/hubungan-geometri-kelas-8`);
    await page.locator(`a[href$="/materi/persamaan-pertidaksamaan-linier"]`).first().click();
    await page.getByRole("heading", { name: "Persamaan dan Pertidaksamaan Linier Satu Variabel", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      open: async () => { assert.equal(await result(), "0|10|salah"); await clicks("Nilai x tambah", 6); assert.equal(await result(), "0|16|benar"); },
      hp: async () => { assert.equal(await result(), "0|0|kurang"); for (const k of [7, 14, 21]) await button(`Bilangan ${k}`).click(); assert.equal(await result(), "0|3|lengkap"); await button("Bilangan 8").click(); assert.equal(await result(), "0|4|salah"); },
      form: async () => { assert.equal(await result(), "PLSV"); await radio("x + 10y = 110").click(); assert.equal(await result(), "PLDV"); },
      balance: async () => { assert.equal(await result(), "2|4|8"); await clicks("Ambil 1 kelereng dari kedua lengan", 4); assert.equal(await result(), "2|0|4"); await button("Bagi menjadi 2 kelompok").click(); assert.equal(await result(), "1|0|2"); },
      steps: async () => { assert.equal(await result(), "0|1|"); await clicks("Langkah berikutnya", 3); assert.equal(await result(), "0|4|selesai"); },
      story: async () => { assert.equal(await result(), "22|660000"); await button("Pasang sepatu tambah").click(); assert.equal(await result(), "24|720000"); },
      symbols: async () => { assert.equal(await result(), "≥|4|[4, ∞)"); await radio("<").click(); assert.equal(await result(), "<|4|(−∞, 4)"); },
      speed: async () => { assert.equal(await result(), "80|boleh"); await clicks("Kecepatan (km/jam) tambah", 3); assert.equal(await result(), "110|terlalu cepat"); },
      flip: async () => { assert.equal(await result(), "3|>"); await clicks("Pengali kurangi", 6); assert.equal(await result(), "-3|<"); },
      solve: async () => { assert.equal(await result(), ">|−3,5"); await button("Koefisien tambah").click(); assert.equal(await result(), ">|−7"); },
      truck: async () => { assert.equal(await result(), "37|10"); await button("Berat kotak (kg) tambah").click(); assert.equal(await result(), "33|11"); },
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
        await answer(q, miss ? "Tertutup|Tertutup|Terbuka|Tertutup" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "Tertutup|Tertutup|Tertutup|Terbuka" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Lima dikurangi p sama dengan dua: Terbuka/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 8 bab 3 at ${width}px: 11 peraga, 16 latihan (1 salah disengaja), 24 evaluasi (terbuka/tertutup, HP, susun model, nilai x, tanda dan batas, garis bilangan, timbangan), skor dan pembahasan`);
  }
} finally { await browser.close(); }
