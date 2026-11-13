import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-nine-transform.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-nine-transform-screenshots";
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
        else if (p.kind === "pts") { for (const [k, nm] of p.names.entries()) { await box(`${nm} x`).fill(x[2 * k]); await box(`${nm} y`).fill(x[2 * k + 1]); } }
        else if (p.kind === "vec") { await box(`${l} mendatar`).fill(x[0]); await box(`${l} tegak`).fill(x[1]); }
        else if (p.kind === "eq") { await box(`${l} koefisien x`).fill(x[0]); await box(`${l} koefisien y`).fill(x[1]); await box(`${l} konstanta`).fill(x[2]); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "match") { for (const [k, lft] of p.left.entries()) { await button(`Kiri ${lft}`).click(); await button(`Kanan ${x[k]}`).click(); } }
        else if (p.kind === "plot") { const g = group(l); for (const pt of v[i].split(";")) { const [a, b] = pt.split(","); await g.getByRole("button", { name: `Titik (${a}, ${b})`, exact: true }).click(); } }
      }
    }
    await page.goto(`${origin}/kelas/strategi-matematika-kelas-9`);
    await page.locator(`a[href$="/materi/transformasi-geometri-kelas-9"]`).first().click();
    await page.getByRole("heading", { name: "Transformasi Geometri", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      translate: async () => { assert.equal(await result(), "4|-2|2,-1"); await button("a (mendatar) kurangi").click(); assert.equal(await result(), "3|-2|1,-1"); },
      reflAxis: async () => { assert.equal(await result(), "Sumbu x|3,-2"); await radio("Titik O").click(); assert.equal(await result(), "Titik O|-3,-2"); },
      reflDiag: async () => { assert.equal(await result(), "y = x|1,4"); await radio("y = −x").click(); assert.equal(await result(), "y = −x|-1,-4"); },
      reflLine: async () => { assert.equal(await result(), "x = k|3|7,2"); await radio("y = h").click(); assert.equal(await result(), "y = h|3|-1,4"); },
      rotate: async () => { assert.equal(await result(), "90°|-2,4"); await radio("−90°").click(); assert.equal(await result(), "−90°|2,-4"); },
      rigid: async () => { assert.equal(await result(), "0|belum"); await button("Putar 90°").click(); await button("Geser kanan").click(); await clicks("Geser bawah", 3); assert.equal(await result(), "5|berimpit"); },
      polygon: async () => { assert.equal(await result(), "III|sisi sama|sudut beda|tidak"); await radio("IV").click(); assert.equal(await result(), "IV|sisi sama|sudut sama|kongruen"); },
      triangle: async () => { assert.equal(await result(), "S.S.S|kongruen"); await radio("S.S.Sd").click(); assert.equal(await result(), "S.S.Sd|belum pasti"); },
      dilate: async () => { assert.equal(await result(), "O|2|2,2"); await radio("P(2, 3)").click(); assert.equal(await result(), "P|2|0,-1"); },
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
        await answer(q, miss ? "Translasi|Translasi|Translasi" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "(−7, 7)" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Jawaban: \(7, −7\)/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 9 bab 3 at ${width}px: 9 peraga, 36 latihan (1 salah disengaja), 24 evaluasi (gambar bayangan dengan mengetuk titik, hubungkan refleksi, translasi, refleksi, rotasi, kongruen, dilatasi), skor dan pembahasan`);
  }
} finally { await browser.close(); }
