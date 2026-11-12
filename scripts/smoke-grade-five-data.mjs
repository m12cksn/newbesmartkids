import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-five-data.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-data-screenshots";
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
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "number") await fill(p.label, v[i]);
        else if (p.kind === "items") { for (const [k, it] of p.items.entries()) await fill(it.label, x[k]); }
        else if (p.kind === "freq") { for (const [k, r] of p.rows.entries()) { await clicks(`Turus ${r.label} tambah`, Number(x[2 * k])); await fill(`Frekuensi ${r.label}`, x[2 * k + 1]); } }
        else if (p.kind === "picBuild") { for (const [k, r] of p.picto.rows.entries()) { const n = Number(x[k]); await clicks(`${r.label} tambah satu gambar`, Math.floor(n / 4)); await clicks(`${r.label} tambah seperempat`, n % 4); } }
        else if (p.kind === "barBuild") { const { major, minor } = p.bars; for (const [k, c] of p.fill.entries()) { const n = Number(x[k]), cat = p.bars.cats[c]; await clicks(`${cat} naik ${major}`, Math.floor(n / major)); await clicks(`${cat} naik ${minor}`, (n % major) / minor); } }
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(o).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.locator(`a[href$="/materi/data"]`).first().click();
    await page.getByRole("heading", { name: "Data", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "0"); const chips = group("Data nilai").getByRole("button"); for (let k = 0; k < 20; k++) await chips.nth(k).click(); assert.equal(await result(), "20");
        await page.getByText("Nilai yang paling sering muncul adalah").waitFor(); await button("Batal satu").click(); assert.equal(await result(), "19"); }
      if (t === 1) { assert.equal(await result(), "0"); await clicks("Senin tambah satu gambar", 6); assert.equal(await result(), "1"); await clicks("Rabu tambah satu gambar", 4); await clicks("Rabu tambah seperempat", 2); assert.equal(await result(), "2");
        await radio("8 kue").click(); assert.equal(await result(), "0"); await clicks("Rabu tambah satu gambar", 2); await clicks("Rabu tambah seperempat", 1); assert.equal(await result(), "1"); }
      if (t === 2) { assert.equal(await result(), "0"); for (const [c, n] of [["Jalan kaki", 7], ["Sepeda", 9], ["Angkot", 4], ["Diantar", 6]]) await clicks(`${c} naikkan`, n); assert.equal(await result(), "4");
        await page.getByTestId("lab-result").filter({ hasText: "Batang tertinggi: Sepeda" }).waitFor(); await radio("Mendatar").click(); assert.equal(await result(), "4"); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 2;
        await answer(q, miss ? "5" : q.answer); if (miss) wrong++;
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
      if (q.scene?.type === "raw") { const chips = group("Data, ketuk untuk menandai").getByRole("button"); await chips.first().click(); assert.equal(await chips.first().getAttribute("aria-pressed"), "true"); }
      if (q.scene?.type === "cards") { await button("Asep menyukai Bayam").click(); await page.getByText(/Dicoret 1 dari 36/).waitFor(); }
      await answer(q, i === 1 ? "18000" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Minggu ke-3: Rp 19000/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 8 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (turus dan frekuensi, piktogram, diagram batang, urutan, benar-salah), skor dan pembahasan`);
  }
} finally { await browser.close(); }
