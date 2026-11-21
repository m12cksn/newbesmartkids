// Uji browser Ujian Akhir Tahun (SAT) Kelas 1 pada lebar 320/390/768/1280.
// Jalankan setelah `npm run start`: node --experimental-strip-types scripts/smoke-sat-kelas-1.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { satKelas1 as Q } from "../src/exams/kelas-1-sat/data.ts";
import { optionText } from "../src/exams/types.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/sat-kelas-1-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error" && !/401|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${s.scroll} > ${s.inner}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };

    // Jalur klik dari halaman kelas
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1`, { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Ujian Akhir Tahun \(SAT\) Kelas 1/ }).click();
    await page.waitForURL(/\/ujian-akhir-tahun$/);
    await page.getByRole("button", { name: "Mulai ujian" }).click();
    assert.match(await page.getByRole("timer").innerText(), /^(60:00|59:5\d)$/);

    for (const [i, q] of Q.entries()) {
      await page.getByRole("heading", { name: q.prompt }).waitFor();
      const next = page.getByRole("button", { name: i === Q.length - 1 ? "Kumpulkan jawaban" : "Berikutnya" });
      assert.ok(await next.isDisabled(), `soal ${i + 1}: tombol lanjut harus terkunci sebelum dijawab`);
      for (const p of q.parts) {
        const wrong = i === 0; // satu kesalahan sengaja di soal pertama
        if (p.kind === "num") await page.getByRole("textbox", { name: p.label, exact: true }).fill(String(wrong ? p.value + 1 : p.value));
        else { const opts = p.options.map(optionText); const pick = wrong ? opts.find(o => o !== p.answer) : p.answer; await page.getByRole("group", { name: p.label, exact: true }).getByRole("button", { name: pick }).click(); }
      }
      await fit(`soal ${i + 1}`);
      if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-soal-${String(i + 1).padStart(2, "0")}.png`, fullPage: true });
      await next.click();
    }
    const res = page.getByTestId("exam-result");
    await res.waitFor();
    assert.equal(await res.getAttribute("data-correct"), "24"); assert.equal(await res.getAttribute("data-score"), "96");
    assert.ok(await page.getByText(/Pembahasan soal yang salah \(1\)/).isVisible());
    assert.ok(await page.getByText(`Soal 1. ${Q[0].prompt}`).isVisible());
    await fit("hasil"); await shot("hasil");

    // Ulangi: soal sama, jawaban kosong, nilai terbaik tersimpan
    await page.getByRole("button", { name: "Ulangi ujian" }).click();
    await page.getByRole("heading", { name: Q[0].prompt }).waitFor();
    assert.equal(await page.getByRole("textbox", { name: Q[0].parts[0].label, exact: true }).inputValue(), "");
    await page.goto(`${origin}/kelas/matematika-dasar-kelas-1/ujian-akhir-tahun`, { waitUntil: "networkidle" });
    assert.ok(await page.getByText("96/100").isVisible(), "nilai terbaik tampil di awal");
    assert.ok(await page.getByRole("button", { name: "Lanjutkan ujian yang belum selesai" }).isVisible(), "ujian yang belum selesai bisa dilanjutkan");
    assert.deepEqual(errors, [], `galat konsol ${width}`);
    await page.close();
  }

  // Waktu habis: jawaban dikumpulkan otomatis
  const ctx = await browser.newContext({ viewport: { width: 390, height: 900 } });
  const page = await ctx.newPage(); await page.clock.install();
  await page.goto(`${origin}/kelas/matematika-dasar-kelas-1/ujian-akhir-tahun`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mulai ujian" }).click();
  await page.getByRole("textbox", { name: Q[0].parts[0].label, exact: true }).fill(String(Q[0].parts[0].value));
  await page.clock.fastForward("55:00"); await page.clock.runFor(2000);
  assert.match(await page.getByRole("timer").innerText(), /^0[45]:\d\d$/, "sisa waktu sekitar 5 menit");
  await page.clock.fastForward("05:10"); await page.clock.runFor(2000);
  await page.getByTestId("exam-result").waitFor();
  assert.ok(await page.getByText("Waktu habis. Jawaban dikumpulkan otomatis.").isVisible());
  assert.equal(await page.getByTestId("exam-result").getAttribute("data-total"), "25");
  await page.screenshot({ path: `${folder}/390-waktu-habis.png`, fullPage: true });
  await ctx.close();
  console.log("SAT Kelas 1 smoke OK: 4 lebar, 25 soal, skor 24/25 (96), ulangi, lanjutkan, waktu habis");
} finally { await browser.close(); }
