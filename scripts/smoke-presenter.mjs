import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Mode menjelaskan: hanya admin yang melihatnya; laser, spidol yang tetap ada (warna, urungkan, hapus, ikut gulir), pintasan keyboard.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/presenter-screenshots";
await mkdir(folder, { recursive: true });
const CHAPTER = "/kelas/matematika-lanjutan-kelas-10/materi/nilai-mutlak-linear-satu-variabel"; // bab 1: boleh dibuka tamu
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const inked = (page, rgb) => page.getByTestId("presenter-ink").evaluate((c, rgb) => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && (!rgb || (Math.abs(d[i] - rgb[0]) < 40 && Math.abs(d[i + 1] - rgb[1]) < 40 && Math.abs(d[i + 2] - rgb[2]) < 40))) n++; return n; }, rgb);
try {
  for (const width of [320, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } }), page = await ctx.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    const fit = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width} ${label}`);
    const login = async (u, p) => { await page.goto(`${origin}/masuk`); await page.getByLabel("Username").fill(u); await page.getByLabel("PIN").fill(p); await page.getByRole("button", { name: "Masuk Sekarang", exact: true }).click(); await page.waitForURL(`${origin}/`); };
    const logout = async () => { await page.goto(`${origin}/akun`); await page.getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(`${origin}/`); };
    const chapter = async () => { await page.goto(origin + CHAPTER); await page.getByRole("heading", { level: 1 }).waitFor(); await page.getByTestId("scratch-open").waitFor(); await page.waitForTimeout(600); };

    // Tamu dan siswa tidak melihat tombolnya.
    await chapter(); assert.equal(await page.getByTestId("presenter-open").count(), 0, "tamu");
    await login("hampirhabis", "222222"); await chapter(); assert.equal(await page.getByTestId("presenter-open").count(), 0, "siswa"); await logout();

    // Admin.
    await login("admin", "111111"); await chapter();
    const open = page.getByTestId("presenter-open"); await open.waitFor();
    const scratch = await page.getByTestId("scratch-open").boundingBox(), ob = await open.boundingBox();
    assert.ok(ob.x + ob.width <= scratch.x || ob.y + ob.height <= scratch.y, "tidak menutupi tombol kertas coret");
    await open.click();
    const bar = page.getByRole("toolbar", { name: "Mode menjelaskan" }); await bar.waitFor();
    assert.equal(await bar.getAttribute("data-tool"), "laser");
    assert.equal(await page.getByTestId("presenter-canvas").evaluate(c => getComputedStyle(c).pointerEvents), "none", "laser tidak menghalangi klik");
    await page.mouse.move(width / 2, 300); await page.mouse.move(width / 2 + 40, 320);
    await fit("laser"); await page.screenshot({ path: `${folder}/${width}-laser.png` });

    assert.equal(await page.getByTestId("presenter-dot").count(), 1, "titik laser tampil");
    // Alat yang dihapus tidak ada lagi.
    for (const gone of ["Sorot", "Fokus"]) assert.equal(await bar.getByRole("button", { name: gone, exact: true }).count(), 0, `${gone} sudah dihapus`);

    await page.keyboard.press("p"); assert.equal(await bar.getAttribute("data-tool"), "spidol");
    const cv = page.getByTestId("presenter-ink");
    const line = async (x, y) => { await page.mouse.move(x, y); await page.mouse.down(); for (let i = 1; i <= 10; i++) await page.mouse.move(x + i * 20, y + i * 6); await page.mouse.up(); await page.waitForTimeout(80); };
    await line(40, 250);
    assert.equal(await cv.getAttribute("data-ink"), "1"); assert.ok(await inked(page, [217, 45, 32]) > 50, "coretan merah terlihat");
    await page.waitForTimeout(3400); assert.equal(await cv.getAttribute("data-ink"), "1", "coretan tidak hilang sendiri"); assert.ok(await inked(page, [217, 45, 32]) > 50, "masih terlihat setelah 3 detik");
    await bar.getByRole("radio", { name: "Biru", exact: true }).click(); await line(40, 330);
    assert.equal(await cv.getAttribute("data-ink"), "2"); assert.ok(await inked(page, [29, 99, 201]) > 50, "coretan biru");
    await page.screenshot({ path: `${folder}/${width}-spidol.png` });
    // Ctrl+Z hanya mengurungkan spidol, bukan kertas coret yang terbuka bersamaan (dan sebaliknya).
    await bar.getByRole("button", { name: "Laser", exact: true }).click(); await page.getByTestId("scratch-open").click(); await page.getByTestId("scratch").waitFor();
    {
      const r = await page.getByTestId("scratch-canvas").boundingBox(); await page.mouse.move(r.x + 30, r.y + 40); await page.mouse.down(); await page.mouse.move(r.x + 120, r.y + 60); await page.mouse.up();
      const pad = () => page.getByTestId("scratch-canvas").getAttribute("aria-label");
      assert.match(await pad(), /1 coretan/);
      await bar.getByRole("button", { name: "Spidol", exact: true }).click(); await page.keyboard.press("Control+z"); await page.waitForTimeout(80);
      assert.equal(await cv.getAttribute("data-ink"), "1", "Ctrl+Z saat spidol: coretan spidol terakhir diurungkan"); assert.match(await pad(), /1 coretan/, "kertas coret tidak ikut");
      await bar.getByRole("button", { name: "Laser", exact: true }).click(); await page.keyboard.press("Control+z"); await page.waitForTimeout(80);
      assert.match(await pad(), /0 coretan/, "Ctrl+Z saat laser: kertas coret diurungkan"); assert.equal(await cv.getAttribute("data-ink"), "1", "spidol tidak ikut");
      await page.getByRole("button", { name: "Tutup kertas coret" }).click(); await bar.getByRole("button", { name: "Spidol", exact: true }).click();
    }
    await page.waitForTimeout(80);
    assert.equal(await cv.getAttribute("data-ink"), "1"); assert.equal(await inked(page, [29, 99, 201]), 0, "urungkan menghapus coretan terakhir");
    // Penghapus: menggeser di atas coretan biru menghapusnya saja; coretan merah tetap.
    await line(40, 330); assert.equal(await cv.getAttribute("data-ink"), "2");
    await page.keyboard.press("e"); assert.equal(await bar.getAttribute("data-tool"), "hapus");
    await page.mouse.move(100, 330 + 18); await page.mouse.down(); await page.mouse.move(110, 330 + 21, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(80);
    assert.equal(await cv.getAttribute("data-ink"), "1", "penghapus menghapus coretan yang tersentuh"); assert.equal(await inked(page, [29, 99, 201]), 0, "coretan biru hilang"); assert.ok(await inked(page, [217, 45, 32]) > 50, "coretan merah tetap");
    await page.keyboard.press("p");
    // Coretan menempel pada halaman: ikut bergeser saat digulir.
    const top = () => cv.evaluate(c => { const x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) return Math.floor(i / 4 / c.width) / (devicePixelRatio || 1); return -1; });
    const before = await top(); await page.evaluate(() => scrollBy(0, 100)); await page.waitForTimeout(150); const after = await top();
    assert.ok(before > 0 && Math.abs(before - after - 100) < 4, `coretan ikut gulir ${before} → ${after}`);
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(100);
    // Menutup dan membuka lagi: coretan tetap ada.
    await page.keyboard.press("Escape"); await open.waitFor(); assert.equal(await bar.count(), 0, "Esc menutup mode");
    await open.click(); await bar.waitFor(); await page.waitForTimeout(100);
    assert.equal(await cv.getAttribute("data-ink"), "1", "coretan tetap ada setelah dibuka lagi"); assert.ok(await inked(page) > 50);
    await bar.getByRole("button", { name: "Hapus semua coretan" }).click(); await page.waitForTimeout(80);
    assert.equal(await cv.getAttribute("data-ink"), "0"); assert.equal(await inked(page), 0, "hapus semua");
    await fit("spidol");
    await page.keyboard.press("Escape"); await open.waitFor();
    // Mengetik di kotak isian tidak mengganti alat.
    await open.click(); await page.getByTestId("scratch-open").click(); await page.keyboard.press("s");
    await bar.getByRole("button", { name: "Tutup mode menjelaskan" }).click(); await open.waitFor();
    assert.deepEqual(errors, []); await logout(); await ctx.close();
    console.log(`PASS mode menjelaskan ${width}px: hanya admin, laser, spidol tetap ada (warna, urungkan, penghapus, ikut gulir, tetap setelah dibuka lagi, hapus semua), Esc`);
  }
  // Tablet: laser mengikuti jari yang digeser, spidol bisa dipakai dengan sentuhan.
  {
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true }), page = await ctx.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    await page.goto(`${origin}/masuk`); await page.getByLabel("Username").fill("admin"); await page.getByLabel("PIN").fill("111111"); await page.getByRole("button", { name: "Masuk Sekarang", exact: true }).click(); await page.waitForURL(`${origin}/`);
    await page.goto(origin + CHAPTER); await page.getByRole("heading", { level: 1 }).waitFor();
    const cdp = await ctx.newCDPSession(page);
    const drag = async (pts) => { await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: pts[0][0], y: pts[0][1] }] });
      for (const [x, y] of pts.slice(1)) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); };
    await page.getByTestId("presenter-open").tap();
    const bar = page.getByRole("toolbar", { name: "Mode menjelaskan" }); await bar.waitFor();
    await bar.getByRole("button", { name: "Laser", exact: true }).tap();
    await drag([[100, 300], [200, 320], [300, 340]]);
    assert.equal(await page.getByTestId("presenter-dot").count(), 1, "titik laser tampil");
    await bar.getByRole("button", { name: "Spidol", exact: true }).tap();
    await drag([[100, 400], [160, 420], [220, 440], [280, 460]]);
    assert.equal(await page.getByTestId("presenter-ink").getAttribute("data-ink"), "1", "spidol dengan sentuhan");
    await bar.getByRole("button", { name: "Penghapus", exact: true }).tap();
    await drag([[160, 420], [170, 423], [180, 426]]); await page.waitForTimeout(80);
    assert.equal(await page.getByTestId("presenter-ink").getAttribute("data-ink"), "0", "penghapus dengan sentuhan");
    // Halaman terkunci selama alat aktif: geseran jari tidak menggulir; alat Geser membuka kunci.
    const sy = () => page.evaluate(() => scrollY);
    const swipe = [[380, 800], [380, 700], [380, 600], [380, 500], [380, 400], [380, 300]];
    for (const name of ["Laser", "Spidol", "Penghapus"]) {
      await bar.getByRole("button", { name, exact: true }).tap(); const before = await sy();
      await drag(swipe); await page.waitForTimeout(400); assert.equal(await sy(), before, `${name}: layar tidak bergeser`);
      assert.equal(await page.evaluate(() => document.documentElement.style.touchAction), "none");
    }
    await bar.getByRole("button", { name: "Geser", exact: true }).tap();
    assert.equal(await page.evaluate(() => document.documentElement.style.touchAction), "", "kunci dilepas");
    { const before = await sy(); await drag(swipe); await page.waitForTimeout(600); assert.ok(await sy() > before, "Geser: layar bisa digulir"); }
    await page.screenshot({ path: `${folder}/768-tablet-geser.png` });
    assert.deepEqual(errors, []); await ctx.close();
    console.log("PASS mode menjelaskan tablet 768px: laser mengikuti jari, spidol dan penghapus dengan sentuhan, layar terkunci untuk laser/spidol/penghapus, Geser menggulir");
  }
} finally { await browser.close(); }
