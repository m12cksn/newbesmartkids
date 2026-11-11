import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, parseCuts } from "../src/data/grade-two-shapes.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-shapes-screenshots";
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
        if (p.kind === "number") await page.getByRole("textbox", { name: p.label, exact: true }).fill(x);
        else if (p.kind === "choice") await page.getByRole("group", { name: `Bagian ${i + 1}` }).getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "check") { for (const k of x.split(",").filter(Boolean)) await button(`Pilih ${p.items[Number(k)].name}`).click(); }
        else if (p.kind === "sort") { for (const [k, b] of x.split(",").entries()) { await button(`Ambil ${p.items[k].name}`).click(); await button(`Masukkan ke ${p.bins[Number(b)]}`).click(); } }
        else if (p.kind === "match") { for (const [k, r] of x.split(",").entries()) { await button(`Pilih ${p.left[k].name}`).click(); await button(`Hubungkan ke ${p.right[Number(r)].name}`).click(); } }
        else if (p.kind === "cut") { for (const [a, b] of parseCuts(x)) { await button(`Titik ${a + 1}`).click(); await button(`Titik ${b + 1}`).click(); } }
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Bentuk di Sekitar Kita/ }).first().click();
    await page.getByRole("heading", { name: "Bentuk di Sekitar Kita", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        assert.equal(await result(), "0/5");
        for (const n of [1, 2, 3, 4]) await button(`Sisi ${n}`).click();
        assert.equal(await result(), "4/5"); await button("Sisi 5").click(); assert.equal(await result(), "Segi lima");
        await button("Bangun E").click(); for (const n of [1, 2, 3, 4, 5, 6]) await button(`Sisi ${n}`).click(); assert.equal(await result(), "Segi enam");
        await button("Bangun G").click(); await button("Putar").click(); assert.equal(await result(), "bukan lingkaran");
        await button("Bangun F").click(); await button("Putar").click(); assert.equal(await result(), "lingkaran");
      }
      if (t === 1) {
        await button("Titik 1").click(); await button("Titik 5").click(); assert.equal(await result(), "2 segitiga");
        await button("Hapus garis terakhir").click(); await button("Titik 2").click(); await button("Titik 6").click(); assert.equal(await result(), "2 segi empat");
        await button("Titik 1").click(); await button("Titik 2").click(); await page.getByText("Garis harus melewati bagian dalam bangun").waitFor();
        await button("Segi lima").click(); await button("Titik 1").click(); await button("Titik 5").click(); await button("Titik 1").click(); await button("Titik 7").click(); assert.equal(await result(), "3 segitiga");
        await button("Rapatkan sisi miring").click(); assert.equal(await result("compose-result"), "Persegi");
        await button("Geser sejajar").click(); assert.equal(await result("compose-result"), "Jajargenjang");
      }
      if (t === 2) {
        await button("Kubus").click(); await button("Gelindingkan").click(); assert.equal(await result(), "tidak menggelinding");
        await button("Bola").click(); await button("Gelindingkan").click(); assert.equal(await result(), "menggelinding");
        await button("Balok").click(); await button("Cap permukaan datar").click(); assert.equal(await result(), "6 cap");
        await button("Kerucut").click(); await button("Cap permukaan datar").click(); assert.equal(await result(), "1 cap");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 2 && k === 0;
        await answer(q, miss ? q.parts[0].options.find(o => o !== q.parts[0].answer) : q.answer); if (miss) wrong++;
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
      // Soal 1 sengaja salah: bangun 1 dan 2 tertukar.
      await answer(q, i === 0 ? "1,2,0,2,1,0" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Bangun 1 dengan Bentuk lengkung/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 3 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (tarik garis, kelompokkan, potong), skor dan pembahasan`);
  }
} finally { await browser.close(); }
