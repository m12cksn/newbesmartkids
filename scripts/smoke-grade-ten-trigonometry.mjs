import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-ten-trigonometry.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-ten-trigonometry-screenshots";
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
        else if (p.kind === "surd") { await box(`${l} pengali`).fill(x[0]); await box(`${l} bilangan di dalam akar`).fill(x[1]); await box(`${l} penyebut`).fill(x[2]); }
        else if (p.kind === "pi") { await box(`${l} pembilang`).fill(x[0]); await box(`${l} penyebut`).fill(x[1]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/matematika-lanjutan-kelas-10`);
    await page.locator(`a[href$="/materi/trigonometri-kelas-10"]`).first().click();
    await page.getByRole("heading", { name: "Trigonometri", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      sudut: async () => { assert.equal(await result(), "60|1|π/3"); await button("+90°").click(); assert.equal(await result(), "150|2|5π/6"); await press("Putar −15°", 2); assert.equal(await result(), "120|2|2π/3"); },
      segitiga: async () => { assert.equal(await result(), "3|4|5"); await press("Sisi depan tambah", 2); assert.equal(await result(), "5|4|6.403"); },
      istimewa: async () => { assert.equal(await result(), "45|√2/2|√2/2|1"); await radio("60°").click(); assert.equal(await result(), "60|√3/2|1/2|√3"); await radio("90°").click(); assert.equal(await result(), "90|1|0|tak terdefinisi"); },
      relasi: async () => { assert.equal(await result(), "150|+−−"); await radio("180° + α").click(); assert.equal(await result(), "210|−−+"); await radio("60°", "Sudut lancip α").click(); assert.equal(await result(), "240|−−+"); },
      identitas: async () => { assert.equal(await result(), "30|1|0"); await press("θ tambah", 4); assert.equal(await result(), "90|1|x"); },
      aturan: async () => { assert.equal(await result(), "5|8|60|7|17.32"); await press("Sudut C tambah", 6); assert.equal(await result(), "5|8|120|11.36|17.32"); },
      grafik: async () => { assert.equal(await result(), "sin|1|1|0|1|-1|2π"); await button("a tambah").click(); await button("b tambah").click(); assert.equal(await result(), "sin|2|2|0|2|-2|π"); await radio("tan").click(); assert.equal(await result(), "tan|2|2|0|x|x|π/2"); },
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
        await answer(q, miss ? q.answer.replace(/80$/, "81") : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "B|B|B|B" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Benar, Benar, Salah, Benar/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 10 bab 4 at ${width}px: 7 peraga, 28 latihan (1 salah disengaja), 24 evaluasi (derajat-radian, perbandingan dan sudut istimewa, relasi, identitas, aturan sinus/cosinus, grafik), skor dan pembahasan`);
  }
} finally { await browser.close(); }
