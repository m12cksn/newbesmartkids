import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-twelve-probability.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-twelve-probability-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = (name, group) => (group ? page.getByRole("radiogroup", { name: group, exact: true }) : page).getByRole("radio", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const press = async (name, times) => { for (let k = 0; k < times; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "row") { for (const [k, c] of p.cells.entries()) await box(`${l} ${plain(c)}`).fill(x[k]); }
        else if (p.kind === "frac") { await box(`${l} pembilang`).fill(x[0]); await box(`${l} penyebut`).fill(x[1]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/persiapan-matematika-kelas-12`);
    await page.locator(`a[href$="/materi/peluang-kelas-12"]`).first().click();
    await page.getByRole("heading", { name: "Peluang", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const bump = a => a.replace(/(\d+)$/, m => String(Number(m) + 1));
    const labChecks = {
      aturan: async () => { assert.equal(await result(), "Ace|Queen|atau|8"); await radio("Heart", "Kegiatan 2").click(); assert.equal(await result(), "Ace|Heart|atau|16"); await radio("lalu (tanpa dikembalikan)", "Cara menggabungkan").click(); assert.equal(await result(), "Ace|Heart|lalu|51"); },
      susun: async () => { assert.equal(await result(), "4|2|Menyusun|12"); await radio("Mengambil", "Kegiatan").click(); assert.equal(await result(), "4|2|Mengambil|6"); await press("Banyak dipilih tambah", 1); assert.equal(await result(), "4|3|Mengambil|4"); },
      permutasi: async () => { assert.equal(await result(), "5|3|60"); await press("Banyak kotak tambah", 1); assert.equal(await result(), "5|4|120"); },
      kombinasi: async () => { assert.equal(await result(), "5|2♣,3♣,4♣|10"); await button("Pilih 5♣").click(); assert.equal(await result(), "5|2♣,3♣,4♣,5♣|5"); },
      unsur: async () => { assert.equal(await result(), "SUSUNAN|630"); await radio("MATEMATIKA", "Kata").click(); assert.equal(await result(), "MATEMATIKA|151200"); },
      siklis: async () => { assert.equal(await result(), "4|0|6"); await button("Putar satu kursi").click(); assert.equal(await result(), "4|1|6"); await press("Banyak orang tambah", 1); assert.equal(await result(), "5|1|24"); },
      majemuk: async () => { assert.equal(await result(), "kelipatan 3|A ∪ B|2,3,4,6,8,9,10,12"); await radio("A ∩ B", "Operasi").click(); assert.equal(await result(), "kelipatan 3|A ∩ B|6,12"); },
      lepas: async () => { assert.equal(await result(), "5|Jumlah 7|4|6|0|5/18"); await radio("Dadu merah 4", "Kejadian B").click(); assert.equal(await result(), "5|Dadu merah 4|4|6|1|1/4"); },
      bebas: async () => { assert.equal(await result(), "2|5|4|1/9"); await press("Dadu merah paling besar tambah", 1); assert.equal(await result(), "3|5|6|1/6"); },
      bersyarat: async () => { assert.equal(await result(), "8,4,3|Merah lalu biru|16/105"); await radio("Putih lalu putih", "Urutan yang dicari").click(); assert.equal(await result(), "8,4,3|Putih lalu putih|1/35"); },
    };
    for (const [k, sec] of sections.entries()) {
      if (k === 0 || sec.topic !== sections[k - 1].topic) await button(`${sec.topic.code}. ${sec.topic.title}`).click();
      await page.getByRole("tab", { name: `${sec.code} ${sec.title}`, exact: true }).click();
      await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${sec.code}`);
      await button(`Latihan ${sec.code}`).click();
      let wrong = 0;
      for (const [j, q] of practice[k].entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${k}-${j}`);
        const miss = k === 0 && j === 0;
        await answer(q, miss ? bump(q.answer) : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${k}-${j}`); await shot(`practice-${sec.code}-${j + 1}`);
        await button(j === practice[k].length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${4 - wrong} · Salah ${wrong} · Skor ${Math.round((4 - wrong) / 4 * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      await answer(q, i === 0 ? bump(q.answer) : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*Banyak pasangan = 143/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 12 bab 3 at ${width}px: 10 peraga (kartu remi, menyusun/mengambil, permutasi, kombinasi, unsur sama, meja bundar, Venn, dua dadu, saling bebas, diagram pohon), 40 latihan (1 salah disengaja), 24 evaluasi, skor dan pembahasan`);
  }
} finally { await browser.close(); }
