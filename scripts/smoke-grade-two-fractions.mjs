import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP } from "../src/data/grade-two-fractions.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-fractions-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    // Ketuk bagian bangun tepat di titik beratnya (kotak pembatas segitiga bisa menimpa bagian lain).
    const piece = async name => {
      const el = page.getByRole("button", { name, exact: true }); await el.scrollIntoViewIfNeeded();
      const { x, y } = await el.evaluate(poly => { const ps = [...poly.points]; const c = ps.reduce((a, p) => ({ x: a.x + p.x / ps.length, y: a.y + p.y / ps.length }), { x: 0, y: 0 }); const pt = poly.ownerSVGElement.createSVGPoint(); pt.x = c.x; pt.y = c.y; const r = pt.matrixTransform(poly.getScreenCTM()); return { x: r.x, y: r.y }; });
      await page.mouse.click(x, y);
    };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = v[i];
        if (p.kind === "number") await page.getByRole("textbox", { name: p.label, exact: true }).fill(x);
        else if (p.kind === "choice") await page.getByRole("group", { name: `Bagian ${i + 1}` }).getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "shade") { for (const k of x.split(",")) await piece(`Bagian ${Number(k) + 1}`); }
        else if (p.kind === "fold") { const [g, s] = x.split("/"); for (const k of g.split("+")) await button(`Garis ${Number(k) + 1}`).click(); await button("Warnai").click(); await piece(`Bagian ${Number(s) + 1}`); }
        else if (p.kind === "mark") { for (const [k, m] of x.split(",").entries()) await button(`${m === "y" ? "Benar" : "Salah"} ${p.items[k].name}`).click(); }
        else if (p.kind === "sort") { for (const [k, b] of x.split(",").entries()) { await button(`Ambil ${p.items[k].name}`).click(); await button(`Masukkan ke ${p.bins[Number(b)]}`).click(); } }
        else if (p.kind === "check") { for (const k of x.split(",")) await button(`Lingkari ${p.items[Number(k)].name}`).click(); }
        else if (p.kind === "pick") { for (const k of x.split(",")) await button(`${p.label} ${Number(k) + 1}`).click(); }
        else if (p.kind === "share") { const [a, b] = x.split(",").map(Number); for (let k = 0; k < a; k++) await button(`Masukkan ke ${p.boxes[0]}`).click(); for (let k = 0; k < b; k++) await button(`Masukkan ke ${p.boxes[1]}`).click(); }
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /^Bab 5|Pecahan/ }).filter({ hasText: "Pecahan" }).first().click();
    await page.getByRole("heading", { name: "Pecahan", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        await piece("Bagian 1"); assert.equal(await result(), "setengah");
        await button("Tarik garis").click(); await button("Garis 2").click(); await button("Warnai").click(); await piece("Bagian 1"); assert.equal(await result(), "seperempat");
        await button("Tarik garis").click(); await button("Garis 5").click(); await button("Warnai").click(); await piece("Bagian 1"); assert.equal(await result(), "bukan");
        await button("Lingkaran").click(); await piece("Bagian 2"); assert.equal(await result(), "setengah");
      }
      if (t === 1) {
        assert.equal(await result(), "0,0,6"); await button("Bagikan satu").click(); assert.equal(await result(), "1,0,5");
        await button("Bagikan semua").click(); assert.equal(await result(), "3,3,0"); await page.getByTestId("lab-result").filter({ hasText: "adalah 3" }).waitFor();
        await button("Tambah benda").click(); await button("Bagikan semua").click(); assert.equal(await result(), "3,3,1");
      }
      if (t === 2) {
        await button("Potong jadi 2").click(); await button("Potong lagi jadi 4").click(); await piece("Bagian 1"); assert.equal(await result(), "4:1");
        await page.getByTestId("lab-result").filter({ hasText: "seperempat" }).waitFor();
        await button("Kue bolu").click(); await button("Potong silang").click(); await button("Potong jadi 2").click(); await piece("Bagian 2"); assert.equal(await result(), "2:1");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "0,1" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "0,1" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar 1 dari 2 bagian diwarnai/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 5 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (warnai, garis lipat, tanda, bagikan), skor dan pembahasan`);
  }
} finally { await browser.close(); }
