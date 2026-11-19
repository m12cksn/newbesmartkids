import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Kertas coret: buka, tulis (mouse dan sentuhan), urungkan, penghapus, kertas baru, tersimpan setelah muat ulang, tutup.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/scratchpad-screenshots";
await mkdir(folder, { recursive: true });
const CHAPTER = "/kelas/dasar-matematika-kelas-3/materi/kalimat-matematika";
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const count = async page => Number((await page.getByTestId("scratch-canvas").getAttribute("aria-label")).match(/(\d+) coretan/)[1]);
const inked = page => page.getByTestId("scratch-canvas").evaluate(c => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
async function stroke(page, x0, y0, x1, y1) {
  const r = await page.getByTestId("scratch-canvas").boundingBox();
  await page.mouse.move(r.x + x0, r.y + y0); await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(r.x + x0 + ((x1 - x0) * i) / 8, r.y + y0 + ((y1 - y0) * i) / 8);
  await page.mouse.up();
}
try {
  for (const width of [320, 390, 768, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, hasTouch: width < 900 });
    const page = await ctx.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    await page.goto(origin + CHAPTER);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.getByTestId("scratch-open").click();
    const pad = page.getByTestId("scratch"); await pad.waitFor();
    const box = await pad.boundingBox();
    if (width < 900) { assert.ok(box.y > 800 * 0.3, "soal tetap terlihat di atas kertas"); assert.equal(Math.round(box.width), width); }
    else { assert.equal(Math.round(box.width), 440); assert.ok(await page.evaluate(() => document.body.style.paddingRight === "440px")); }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width}`);
    // Menulis dengan mouse.
    assert.equal(await count(page), 0);
    await stroke(page, 30, 40, 150, 60);
    assert.equal(await count(page), 1); assert.ok(await inked(page) > 50, "coretan tergambar");
    // Coretan yang sedang ditulis ada di lapisan atas; setelah selesai pindah ke kertas dan lapisan atas kosong lagi.
    assert.equal(await page.getByTestId("scratch-live").evaluate(c => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }), 0, "lapisan tulis kosong setelah selesai");
    // Menulis dengan jari tidak menggulir halaman.
    if (width < 900) {
      const before = await page.evaluate(() => scrollY);
      const r = await page.getByTestId("scratch-canvas").boundingBox(), cdp = await ctx.newCDPSession(page);
      const at = (x, y) => [{ x: r.x + x, y: r.y + y, id: 1 }];
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: at(40, 100) });
      for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: at(40 + i * 12, 100 + i * 6) });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(100);
      assert.equal(await count(page), 2, "coretan jari tercatat");
      assert.equal(await page.evaluate(() => scrollY), before, "halaman tidak ikut bergeser");
    } else await stroke(page, 40, 100, 140, 150);
    // Urungkan.
    await page.getByRole("button", { name: "Urungkan" }).click(); assert.equal(await count(page), 1);
    await stroke(page, 40, 100, 140, 150); assert.equal(await count(page), 2);
    // Pulpen merah.
    await page.getByRole("button", { name: "Pulpen merah" }).click(); await stroke(page, 60, 200, 160, 200); assert.equal(await count(page), 3);
    // Penghapus menghapus coretan yang disentuh.
    await page.getByRole("button", { name: "Penghapus" }).click(); await stroke(page, 90, 30, 90, 70);
    assert.equal(await count(page), 2, "coretan pertama terhapus");
    // Kertas baru dan pindah kertas.
    await page.getByRole("button", { name: "Kertas baru" }).click();
    await page.getByTestId("scratch-page").getByText("Kertas 2 dari 2").waitFor(); assert.equal(await count(page), 0);
    await page.getByRole("button", { name: "Pensil" }).click(); await stroke(page, 30, 30, 100, 30);
    await page.getByRole("button", { name: "Kertas sebelumnya" }).click(); assert.equal(await count(page), 2);
    await page.screenshot({ path: `${folder}/${width}-kertas-coret.png` });
    // Tersimpan setelah muat ulang, lalu tutup dengan Esc.
    await page.reload(); await page.getByTestId("scratch-open").click();
    await page.getByTestId("scratch-page").getByText("Kertas 2 dari 2").waitFor(); assert.equal(await count(page), 1);
    await page.keyboard.press("Escape"); await page.getByTestId("scratch-open").waitFor();
    assert.equal(await page.evaluate(() => document.body.style.paddingBottom + document.body.style.paddingRight), "");
    // Hapus coretan di kertas.
    await page.getByTestId("scratch-open").click(); page.once("dialog", d => d.accept());
    await page.getByRole("button", { name: "Hapus coretan di kertas ini" }).click(); await page.getByTestId("scratch-page").getByText("Kertas 1 dari 1").waitFor();
    // Latihan harian juga punya kertas coret.
    await page.goto(origin + "/mastering-perkalian-pembagian/level-1"); await page.getByTestId("scratch-open").waitFor();
    assert.deepEqual(errors, []); await ctx.close();
    console.log(`PASS kertas coret ${width}px: buka, mouse${width < 900 ? " dan sentuhan tanpa menggulir" : ""}, urungkan, pulpen, penghapus, kertas baru, tersimpan, Esc, latihan harian`);
  }
} finally { await browser.close(); }
