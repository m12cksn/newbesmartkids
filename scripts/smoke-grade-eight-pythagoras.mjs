import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-eight-pythagoras.ts";
const plainMath = s => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/[{}]/g, "");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-eight-pythagoras-screenshots";
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
        const x = cells(p, v[i]), l = p.label ? plainMath(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "root") { await box(`${l} bilangan di depan akar`).fill(x[0]); await box(`${l} bilangan di dalam akar`).fill(x[1]); }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Sisi ${r.text}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plainMath(v[i]), exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/hubungan-geometri-kelas-8`);
    await page.locator(`a[href$="/materi/teorema-pythagoras"]`).first().click();
    await page.getByRole("heading", { name: "Teorema Pythagoras", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const radarCd = Math.round((Math.sqrt(19 ** 2 - 144) - 5) * 100) / 100;
    const labChecks = {
      squares: async () => { assert.equal(await result(), "13|169"); await button("Panjang sisi tambah").click(); assert.equal(await result(), "14|196"); },
      proof: async () => { assert.equal(await result(), "9|16|25"); await clicks("Sisi a tambah", 2); assert.equal(await result(), "25|16|41"); },
      solve: async () => { assert.equal(await result(), "miring|169"); await radio("Sisi siku-siku").click(); assert.equal(await result(), "siku|119"); await button("Sisi miring c tambah").click(); assert.equal(await result(), "siku|144"); },
      kind: async () => { assert.equal(await result(), "Lancip"); await button("Sisi 1 kurangi").click(); assert.equal(await result(), "Tumpul"); await button("Sisi 2 kurangi").click(); await button("Sisi 3 kurangi").click(); assert.equal(await result(), "Siku-siku"); },
      triples: async () => { assert.equal(await result(), "5|12|13"); await button("p tambah").click(); assert.equal(await result(), "12|16|20"); },
      iso: async () => { assert.equal(await result(), "5|2"); await button("Sisi siku-siku tambah").click(); assert.equal(await result(), "6|2"); },
      half: async () => { assert.equal(await result(), "12|6|3"); await button("Sisi terpendek tambah").click(); assert.equal(await result(), "14|7|3"); },
      ladder: async () => { assert.equal(await result(), "25"); await button("Jarak kaki tangga (m) tambah").click(); assert.equal(await result(), "32"); },
      radar: async () => { assert.equal(await result(), "13|20|11"); await button("AD (km) kurangi").click(); assert.equal(await result(), `13|19|${String(radarCd).replace(".", ",")}`); },
      grid: async () => { assert.equal(await result(), "6|8|100"); await button("x₂ kurangi").click(); assert.equal(await result(), "5|8|89"); },
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
        await answer(q, miss ? "225‖15" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "16" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar PR = 15 cm/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 8 bab 2 at ${width}px: 10 peraga, 20 latihan (1 salah disengaja), 24 evaluasi (isian, bentuk akar, pilihan, pasangkan jenis segitiga), skor dan pembahasan`);
  }
} finally { await browser.close(); }
