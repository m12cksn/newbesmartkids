import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, scenes, tokenName } from "../src/data/grade-two-position-patterns.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-position-patterns-screenshots";
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
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = v[i];
        if (p.kind === "choice") await page.getByRole("group", { name: `Bagian ${i + 1}` }).getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "tap") await button(scenes[p.scene].objs.find(o => o.id === x).name).click();
        else if (p.kind === "fill") { for (const w of x.split(",")) await page.getByRole("group", { name: "Kata" }).getByRole("button", { name: w, exact: true }).click(); }
        else if (p.kind === "sort") { for (const [k, b] of x.split(",").entries()) { await button(`Ambil ${p.items[k].name}`).click(); await button(`Masukkan ke ${p.bins[Number(b)]}`).click(); } }
        else if (p.kind === "check") { for (const k of x.split(",").filter(Boolean)) await button(`Centang ${p.items[Number(k)].name}`).click(); }
        else if (p.kind === "seq") { for (const t of x.split(",")) await button(`Isi ${tokenName(t)}`).click(); }
        else if (p.kind === "create") { for (const [k, c] of x.split(",").entries()) { await button(`Warna ${c}`).click(); await button(`${p.label} ${k + 1}`).click(); } }
        else if (p.kind === "odd") await button(`Gambar ${Number(x) + 1}`).click();
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Posisi Benda dan Pola/ }).first().click();
    await page.getByRole("heading", { name: "Posisi Benda dan Pola di Sekitar Kita", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        assert.equal(await result(), "atas");
        await button("Kanan").click(); assert.equal(await result(), "kanan"); await page.getByTestId("lab-result").filter({ hasText: "Meja di sebelah kiri bola" }).waitFor();
        await button("Kotak").click(); assert.ok(await button("Bawah").isDisabled()); await button("Belakang").click(); assert.equal(await result(), "belakang");
        await button("Kucing").click(); await page.getByTestId("lab-result").filter({ hasText: "Kucing di belakang kotak" }).waitFor();
      }
      if (t === 1) {
        assert.equal(await result(), "circle:hijau|triangle:hijau");
        await button("Kosongkan").click(); assert.equal(await result(), "");
        await page.getByRole("tab", { name: "Pola warna" }).click(); await button("Tambah lingkaran kuning").click(); assert.equal(await result(), "circle:merah|circle:biru|circle:kuning");
        await page.getByRole("tab", { name: "Pola suara" }).click(); await button("Dengarkan polanya").click(); assert.equal(await result(), "clap:1|clap:2");
        await page.getByRole("tab", { name: "Pola gerakan" }).click(); assert.equal(await result(), "pose:atas|pose:bungkuk");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "bawah" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "depan" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar belakang/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 4 at ${width}px: 2 lab, 8 latihan (1 salah disengaja), 24 evaluasi (ketuk, isian, kelompokkan, warnai, pola), skor dan pembahasan`);
  }
} finally { await browser.close(); }
