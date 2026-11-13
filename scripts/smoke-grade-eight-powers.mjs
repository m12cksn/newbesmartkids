import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-eight-powers.ts";
const plainMath = s => s.replace(/\^\{([^}]*)\}/g, "^$1").replace(/√\{([^}]*)\}/g, "√$1").replace(/[{}]/g, "");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-eight-powers-screenshots";
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
        else if (p.kind === "pow") { if (p.fixedBase) await box(`${l} pangkat`).fill(x[0]); else { await box(`${l} bilangan pokok`).fill(x[0]); await box(`${l} pangkat`).fill(x[1]); } }
        else if (p.kind === "frac") { await box(`${l} pembilang`).fill(x[0]); await box(`${l} penyebut`).fill(x[1]); }
        else if (p.kind === "root") { await box(`${l} koefisien`).fill(x[0]); await box(`${l} bilangan di dalam akar`).fill(x[1]); }
        else if (p.kind === "surd") { for (let k = 0; k < p.terms.length; k++) { await box(`${l} suku ${k + 1} koefisien`).fill(x[2 * k]); await box(`${l} suku ${k + 1} akar`).fill(x[2 * k + 1]); } await box(`${l} penyebut`).fill(x.at(-1)); }
        else if (p.kind === "sci") { await box(`${l} bilangan depan`).fill(x[0]); await box(`${l} pangkat 10`).fill(x[1]); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/hubungan-geometri-kelas-8`);
    await page.locator(`a[href$="/materi/bilangan-berpangkat"]`).first().click();
    await page.getByRole("heading", { name: "Bilangan Berpangkat", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      repeat: async () => { assert.equal(await result(), "-2|4|16"); await button("Pangkat tambah").click(); assert.equal(await result(), "-2|5|-32"); },
      laws: async () => { assert.equal(await result(), "kali|6"); await radio("Pembagian").click(); assert.equal(await result(), "bagi|2"); await clicks("Pangkat kedua tambah", 3); assert.equal(await result(), "bagi|-1"); },
      power: async () => { assert.equal(await result(), "12"); await button("Pangkat luar tambah").click(); assert.equal(await result(), "16"); },
      ladder: async () => { assert.equal(await result(), "10|2"); await clicks("Turun satu pangkat", 3); assert.equal(await result(), "10|-1"); },
      square: async () => { assert.equal(await result(), "625|25|1"); await button("Luas tambah").click(); assert.equal(await result(), "626|1|626"); await clicks("Luas kurangi", 578); assert.equal(await result(), "48|4|3"); },
      simplify: async () => { assert.equal(await result(), "6|2"); await button("Bilangan di dalam akar tambah").click(); assert.equal(await result(), "1|73"); },
      multiply: async () => { assert.equal(await result(), "75|2"); await button("Koefisien panjang kurangi").click(); assert.equal(await result(), "50|2"); },
      rational: async () => { assert.equal(await result(), "(15 − 3√3) / 11"); await radio("√ a").click(); assert.equal(await result(), "(6√5) / 5"); },
      sci: async () => { assert.equal(await result(), "0|"); await clicks("Geser koma ke kiri", 21); assert.equal(await result(), "21|ok"); },
      sciops: async () => { assert.equal(await result(), "1,8|10"); await radio("Pembagian").click(); assert.equal(await result(), "5|6"); },
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
        await answer(q, miss ? "513‖-243" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "-7|5‖0,4|3‖S|B|B" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar \(−7\) × \(−7\)/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 8 bab 1 at ${width}px: 10 peraga, 12 latihan (1 salah disengaja), 24 evaluasi (pangkat, pecahan, akar, rasionalkan, bentuk baku), skor dan pembahasan`);
  }
} finally { await browser.close(); }
