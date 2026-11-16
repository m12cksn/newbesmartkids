import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { dailyColumn, wibDate } from "../src/lib/daily-column.ts";

// Berhitung bersusun: tautan dari beranda, ketik dari kanan ke kiri, periksa, pembahasan, soal cerita, kali dua angka, bagi, tersimpan.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/berhitung-bersusun-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const day = wibDate();
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    const fit = async l => { const s = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, i: innerWidth })); assert.ok(s.s <= s.i, `overflow ${width} ${l} ${JSON.stringify(s)}`); };
    const card = i => page.getByTestId(`bersusun-${i}`);
    const cell = (i, k) => card(i).getByRole("textbox", { name: `Soal ${i + 1}, angka hasil ke-${k} dari kiri` });
    /** Ketik hasil seperti anak: mulai kotak paling kanan, kursor pindah sendiri ke kiri. */
    const typeRtl = async (i, value) => { await cell(i, value.length).click(); for (const d of [...value].reverse()) await page.keyboard.type(d); };
    const typeLtr = async (i, value) => { await cell(i, 1).click(); for (const d of value) await page.keyboard.type(d); };
    await page.goto(origin + "/");
    await page.getByRole("link", { name: "Latihan berhitung bersusun" }).click();
    await page.waitForURL(`${origin}/mastering-berhitung-bersusun`);
    await page.getByRole("heading", { level: 1, name: "Berhitung bersusun" }).waitFor();
    let qs = dailyColumn(day, "tambah", 1);
    await card(0).getByText(`${qs[0].a} + ${qs[0].b}`).waitFor();
    await typeRtl(0, String(qs[0].answer));
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Soal 1, angka hasil ke-1 dari kiri", "kursor pindah ke kiri");
    await card(0).getByRole("button", { name: "Periksa" }).click(); await card(0).getByText(/Tepat!/).waitFor();
    // Salah satu angka, lalu buka pembahasan.
    const wrong = String(qs[1].answer).replace(/.$/, d => String((Number(d) + 1) % 10));
    await typeRtl(1, wrong); await card(1).getByRole("button", { name: "Periksa" }).click();
    await card(1).getByText("Ada kotak yang belum tepat.").waitFor();
    await card(1).getByRole("button", { name: "Lihat pembahasan" }).click(); await card(1).getByText(/Kolom satuan/).waitFor();
    await page.getByText("Benar 1 dari 7").waitFor();
    await page.getByText(/Cara menghitung tambah/).click(); await page.getByText(/Mulai dari kolom paling kanan/).waitFor();
    await fit("tambah"); if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-tambah.png`, fullPage: true });
    // Tersimpan setelah dimuat ulang.
    await page.reload(); await card(0).getByText(/Tepat!/).waitFor();
    // Soal cerita: pilih operasi dulu.
    await page.getByRole("radiogroup", { name: "Jenis soal" }).getByRole("radio", { name: "Soal cerita" }).click();
    qs = dailyColumn(day, "cerita", 1);
    await card(0).getByText("Pilih operasi dulu untuk menampilkan kolom hitung.").waitFor();
    const opName = { tambah: "Tambah", kurang: "Kurang", kali: "Kali", bagi: "Bagi" }[qs[0].calc];
    await card(0).getByRole("radio", { name: `Operasi ${opName}` }).click();
    if (qs[0].calc === "bagi") await typeLtr(0, String(qs[0].answer)); else await typeRtl(0, String(qs[0].answer));
    await card(0).getByRole("button", { name: "Periksa" }).click(); await card(0).getByText(/Tepat!/).waitFor();
    await fit("cerita"); if (width === 390) await page.screenshot({ path: `${folder}/${width}-cerita.png`, fullPage: true });
    // Kali, Sulit: pengali dua angka dengan baris hasil sebagian.
    await page.getByRole("radiogroup", { name: "Jenis soal" }).getByRole("radio", { name: "Kali" }).click(); await page.getByRole("radio", { name: /Sulit/ }).click();
    qs = dailyColumn(day, "kali", 3);
    await card(0).getByRole("textbox", { name: "Soal 1, hasil sebagian baris 1, angka ke-1" }).waitFor();
    await typeRtl(0, String(qs[0].answer)); await card(0).getByRole("button", { name: "Periksa" }).click(); await card(0).getByText(/Tepat!/).waitFor();
    await fit("kali"); if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-kali.png`, fullPage: true });
    // Bagi: kerjakan dari kiri.
    await page.getByRole("radiogroup", { name: "Jenis soal" }).getByRole("radio", { name: "Bagi" }).click(); qs = dailyColumn(day, "bagi", 3);
    await typeLtr(0, String(qs[0].answer)); await card(0).getByRole("button", { name: "Periksa" }).click(); await card(0).getByText(/Tepat!/).waitFor();
    await fit("bagi"); if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-bagi.png`, fullPage: true });
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS berhitung bersusun ${width}px: tautan beranda, ketik kanan ke kiri, periksa, pembahasan, tersimpan, soal cerita, kali dua angka, bagi`);
  }
} finally { await browser.close(); }
