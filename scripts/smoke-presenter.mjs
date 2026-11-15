import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Mode menjelaskan: hanya admin yang melihatnya; laser, sorot, spidol sementara, fokus blok, pintasan keyboard.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/presenter-screenshots";
await mkdir(folder, { recursive: true });
const CHAPTER = "/kelas/matematika-lanjutan-kelas-10/materi/nilai-mutlak-linear-satu-variabel"; // bab 1: boleh dibuka tamu
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const inked = page => page.getByTestId("presenter-canvas").evaluate(c => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
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

    await page.keyboard.press("s"); assert.equal(await bar.getAttribute("data-tool"), "sorot");
    await page.mouse.move(width / 2, 400);
    const bg = await page.getByTestId("presenter-spot").evaluate(e => e.style.background);
    assert.match(bg, /radial-gradient\((circle )?140px at/);
    await bar.getByRole("button", { name: "Perbesar sorot" }).click(); await page.mouse.move(width / 2, 410);
    assert.match(await page.getByTestId("presenter-spot").evaluate(e => e.style.background), /(circle )?170px at/);
    await page.screenshot({ path: `${folder}/${width}-sorot.png` });

    await page.keyboard.press("p"); assert.equal(await bar.getAttribute("data-tool"), "spidol");
    const cv = page.getByTestId("presenter-canvas");
    await page.mouse.move(40, 250); await page.mouse.down(); for (let i = 1; i <= 10; i++) await page.mouse.move(40 + i * 20, 250 + i * 6); await page.mouse.up();
    assert.equal(await cv.getAttribute("data-ink"), "1"); await page.waitForTimeout(150); assert.ok(await inked(page) > 50, "coretan terlihat");
    await page.screenshot({ path: `${folder}/${width}-spidol.png` });
    await page.waitForTimeout(3400); assert.equal(await cv.getAttribute("data-ink"), "0", "coretan hilang sendiri"); assert.equal(await inked(page), 0);

    await page.keyboard.press("f"); assert.equal(await bar.getAttribute("data-tool"), "fokus");
    const target = page.locator("h1").first(); const tb = await target.boundingBox();
    await page.mouse.click(tb.x + 20, tb.y + tb.height / 2);
    const fb = await page.getByTestId("presenter-focus").boundingBox();
    assert.ok(Math.abs(fb.x - (tb.x - 6)) < 3 && Math.abs(fb.width - (tb.width + 12)) < 3, `fokus mengikuti blok ${JSON.stringify([fb, tb])}`);
    await fit("fokus"); await page.screenshot({ path: `${folder}/${width}-fokus.png` });
    await page.keyboard.press("Escape"); assert.equal(await page.getByTestId("presenter-focus").count(), 0, "Esc melepas fokus");
    await page.keyboard.press("Escape"); await open.waitFor(); assert.equal(await bar.count(), 0, "Esc menutup mode");
    // Mengetik di kotak isian tidak mengganti alat.
    await open.click(); await page.getByTestId("scratch-open").click(); await page.keyboard.press("s");
    await bar.getByRole("button", { name: "Tutup mode menjelaskan" }).click(); await open.waitFor();
    assert.deepEqual(errors, []); await logout(); await ctx.close();
    console.log(`PASS mode menjelaskan ${width}px: hanya admin, laser, sorot, spidol hilang sendiri, fokus blok, Esc`);
  }
  // Tablet: sorot dan laser mengikuti jari yang digeser, spidol bisa dipakai dengan sentuhan.
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
    await bar.getByRole("button", { name: "Sorot", exact: true }).tap();
    assert.match(await page.getByTestId("presenter-spot").evaluate(e => e.style.background), /384px 512px/, "sorot mulai di tengah layar");
    await drag([[200, 300], [260, 360], [340, 440], [420, 520], [500, 600]]);
    assert.match(await page.getByTestId("presenter-spot").evaluate(e => e.style.background), /500px 600px/, "sorot mengikuti jari");
    await page.screenshot({ path: `${folder}/768-tablet-sorot.png` });
    await bar.getByRole("button", { name: "Laser", exact: true }).tap();
    await drag([[100, 300], [200, 320], [300, 340]]);
    assert.ok(await page.locator("span.rounded-full.bg-\\[\\#e11d2e\\]").count() === 1, "titik laser tampil");
    await bar.getByRole("button", { name: "Spidol", exact: true }).tap();
    await drag([[100, 400], [160, 420], [220, 440], [280, 460]]);
    assert.equal(await page.getByTestId("presenter-canvas").getAttribute("data-ink"), "1", "spidol dengan sentuhan");
    // Halaman terkunci selama alat aktif: geseran jari tidak menggulir; alat Geser membuka kunci.
    const sy = () => page.evaluate(() => scrollY);
    const swipe = [[380, 800], [380, 700], [380, 600], [380, 500], [380, 400], [380, 300]];
    for (const name of ["Laser", "Sorot", "Spidol", "Fokus"]) {
      await bar.getByRole("button", { name, exact: true }).tap(); const before = await sy();
      await drag(swipe); await page.waitForTimeout(400); assert.equal(await sy(), before, `${name}: layar tidak bergeser`);
      assert.equal(await page.evaluate(() => document.documentElement.style.touchAction), "none");
    }
    // Fokus dengan ketukan.
    const h1 = await page.locator("h1").first().boundingBox();
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: h1.x + 20, y: h1.y + h1.height / 2 }] }); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await page.getByTestId("presenter-focus").waitFor();
    await page.screenshot({ path: `${folder}/768-tablet-fokus.png` });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: h1.x + 20, y: h1.y + h1.height / 2 }] }); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.equal(await page.getByTestId("presenter-focus").count(), 0, "ketuk lagi melepas fokus");
    await bar.getByRole("button", { name: "Geser", exact: true }).tap();
    assert.equal(await page.evaluate(() => document.documentElement.style.touchAction), "", "kunci dilepas");
    { const before = await sy(); await drag(swipe); await page.waitForTimeout(600); assert.ok(await sy() > before, "Geser: layar bisa digulir"); }
    await page.screenshot({ path: `${folder}/768-tablet-geser.png` });
    assert.deepEqual(errors, []); await ctx.close();
    console.log("PASS mode menjelaskan tablet 768px: sorot dan laser mengikuti jari, spidol dengan sentuhan, layar terkunci untuk laser/sorot/spidol/fokus, fokus dengan ketukan, Geser menggulir");
  }
} finally { await browser.close(); }
