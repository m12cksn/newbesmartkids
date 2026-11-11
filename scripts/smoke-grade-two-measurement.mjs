import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP } from "../src/data/grade-two-measurement.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-measurement-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = (id = "lab-result") => page.getByTestId(id).getAttribute("data-value");
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = v[i];
        if (p.kind === "number") await page.getByRole("textbox", { name: `${p.label}${p.suffix ? ` … ${p.suffix}` : ""}`, exact: true }).fill(x);
        else if (p.kind === "choice") await page.getByRole("group", { name: `Bagian ${i + 1}` }).getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "blanks") { for (const [k, w] of x.split("|").entries()) await page.getByRole("group", { name: `Kalimat ${k + 1}` }).getByRole("button", { name: w, exact: true }).click(); }
        else if (p.kind === "pairs") { for (const [k, c] of x.split(",").entries()) await button(`Centang ${p.pairs[k][Number(c)].name}`).click(); }
        else if (p.kind === "extreme") { const [h, l] = x.split(",").map(Number); await button("Warna merah").click(); await button(`Warnai ${p.items[h].name}`).click(); await button("Warna kuning").click(); await button(`Warnai ${p.items[l].name}`).click(); }
        else if (p.kind === "order") { for (const k of x.split(",")) await button(`Urutkan ${p.items[Number(k)].name}`).click(); }
        else if (p.kind === "sort") { for (const [k, b] of x.split(",").entries()) { await button(`Ambil ${p.items[k].name}`).click(); await button(`Masukkan ke ${p.bins[Number(b)]}`).click(); } }
        else if (p.kind === "setClock") await button(`Angka ${x}`).click();
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Pengukuran/ }).first().click();
    await page.getByRole("heading", { name: "Pengukuran", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        assert.equal(await result(), "0:1");
        for (let k = 0; k < 7; k++) await button("Tambah kelereng").click();
        assert.equal(await result(), "7:-1"); await button("Kurangi kelereng").click(); assert.equal(await result(), "6:0");
        await page.getByTestId("lab-result").filter({ hasText: "Berat 1 buku = 6 kelereng" }).waitFor();
        await button("Ukur dengan bola tenis").click(); await button("Tambah bola tenis").click(); await button("Tambah bola tenis").click(); assert.equal(await result(), "2:0");
        assert.equal(await result("compare-result"), "-1"); await button("Kiri Labu").click(); assert.equal(await result("compare-result"), "1");
      }
      if (t === 1) {
        assert.equal(await result(), "7-pagi"); await button("Angka 9").click(); await button("Malam").click(); assert.equal(await result(), "9-malam");
        await page.getByTestId("lab-result").filter({ hasText: "tidur malam" }).waitFor();
        await button("Maju satu jam").click(); assert.equal(await result(), "10-malam");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "lebih berat|lebih berat" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "Mangga" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Semangka/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 6 at ${width}px: 2 lab, 8 latihan (1 salah disengaja), 24 evaluasi (timbangan, isian, atur jam, urutkan), skor dan pembahasan`);
  }
} finally { await browser.close(); }
