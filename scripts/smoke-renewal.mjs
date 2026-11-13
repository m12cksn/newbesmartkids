import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/login-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } }), page = await ctx.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}`); };
    const login = async (u, p) => { await page.goto(`${origin}/masuk`); await page.getByLabel("Username").fill(u); await page.getByLabel("PIN").fill(p); await page.getByRole("button", { name: "Masuk Sekarang", exact: true }).click(); await page.waitForURL(`${origin}/`); };
    // Admin: daftar pengingat memuat paket hampir habis dan sudah habis, bukan yang masih lama.
    await login("admin", "111111"); await page.goto(`${origin}/admin`);
    const box = page.getByRole("region", { name: /Pengingat perpanjangan/ });
    await box.getByText("@hampirhabis").waitFor(); await box.getByText("@sudahhabis").waitFor();
    assert.equal(await box.getByText("@masihlama").count(), 0);
    const items = box.getByTestId("reminder"); assert.equal(await items.count(), 2);
    assert.match(await items.first().textContent(), /Sudah berakhir.*Kelas 4.*10 hari yang lalu/);
    const href = await items.nth(1).getByRole("link", { name: "Kirim pengingat" }).getAttribute("href");
    assert.ok(href.startsWith("https://wa.me/6281234567890?text=")); assert.match(decodeURIComponent(href), /Kelas 3 untuk akun hampirhabis berakhir 5 hari lagi/);
    await items.nth(1).getByRole("button", { name: "Tambah paket" }).click();
    await page.getByRole("button", { name: "Simpan paket" }).waitFor();
    await fit("pengingat admin"); await page.screenshot({ path: `${folder}/${width}-pengingat-admin.png`, fullPage: true });
    // Siswa: pemberitahuan di Akun saya.
    await page.goto(`${origin}/akun`); await page.getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(`${origin}/`);
    await login("hampirhabis", "222222"); await page.goto(`${origin}/akun`);
    await page.getByTestId("renew-notice").getByText("Paket berakhir 5 hari lagi").waitFor();
    await fit("akun hampir habis"); await page.screenshot({ path: `${folder}/${width}-pengingat-siswa.png`, fullPage: true });
    await page.getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(`${origin}/`);
    await login("sudahhabis", "333333"); await page.goto(`${origin}/akun`); await page.getByTestId("renew-notice").getByText("Belum ada paket aktif").waitFor();
    await page.getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(`${origin}/`);
    await login("masihlama", "444444"); await page.goto(`${origin}/akun`); await page.getByRole("heading", { name: "Akun saya" }).waitFor();
    assert.equal(await page.getByTestId("renew-notice").count(), 0);
    assert.deepEqual(errors, []); await ctx.close();
    console.log(`PASS pengingat perpanjangan at ${width}px: daftar admin, pesan WhatsApp, tambah paket, pemberitahuan siswa`);
  }
} finally { await browser.close(); }
