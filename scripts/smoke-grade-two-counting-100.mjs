import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP } from "../src/data/grade-two-counting-100.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-counting-100-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = (id = "lab-result") => page.getByTestId(id).getAttribute("data-value");
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = v[i], xs = x.split("|");
        if (p.kind === "number") await box(p.label).fill(x);
        else if (p.kind === "words") { for (const w of x.split(" ")) await page.getByRole("group", { name: `Kata untuk ${p.label}` }).getByRole("button", { name: w, exact: true }).click(); }
        else if (p.kind === "pv") { for (const [k, l] of ["Puluhan", "Satuan", "Nilai puluhan", "Nilai satuan", "Jumlah"].entries()) await box(l).fill(xs[k]); }
        else if (p.kind === "match") { for (const [k, r] of x.split(",").entries()) { await button(`Pilih ${p.left[k]}`).click(); await button(`Hubungkan ke ${p.right[Number(r)]}`).click(); } }
        else if (p.kind === "guess") { await box("Tebakanku").fill(String(p.answer + 5)); await box("Hasil hitunganku").fill(xs[1]); }
        else if (p.kind === "choice") await page.getByRole("group", { name: `Bagian ${i + 1}` }).getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "order") { for (const op of xs) await page.getByRole("group", { name: p.label, exact: true }).getByRole("button", { name: op, exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Ayo Membilang sampai dengan 100/ }).first().click();
    await page.getByRole("heading", { name: "Ayo Membilang sampai dengan 100", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        assert.equal(await result(), "53"); await button("Tambah 10").click(); assert.equal(await result(), "63");
        await page.getByTestId("lab-result").filter({ hasText: "enam puluh tiga" }).waitFor();
        for (let k = 0; k < 4; k++) await button("Tambah 10").click(); assert.equal(await result(), "100"); await page.getByTestId("lab-result").filter({ hasText: "seratus" }).waitFor();
        await button("Kurangi 1").click(); assert.equal(await result(), "99");
      }
      if (t === 1) {
        assert.equal(await result(), "58"); await button("Maju").click(); await button("Maju").click(); assert.equal(await result(), "60");
        await page.getByTestId("lab-result").filter({ hasText: "2 lebihnya dari 58 adalah 60" }).waitFor();
        assert.equal(await result("compare-result"), "<"); await button("Bilangan A tambah 10").click(); assert.equal(await result("compare-result"), ">");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 0;
        await answer(q, miss ? "67" : q.answer); if (miss) wrong++;
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
      if (q.scene?.type === "scatter") { await button("Tandai benda 1").click(); assert.equal(await button("Tandai benda 1").getAttribute("aria-pressed"), "true"); }
      await answer(q, i === 0 ? `6${SEP}66` : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Banyak puluhan 6 \| Jadi, banyak buah jeruk 60/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 7 at ${width}px: 2 lab, 8 latihan (1 salah disengaja), 24 evaluasi (nilai tempat, tarik garis, tebak, garis bilangan, urutkan), skor dan pembahasan`);
  }
} finally { await browser.close(); }
