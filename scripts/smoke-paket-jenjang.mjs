import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Pesanan Scalev: admin membuat semua akun dalam satu paket; akses mengikuti jenjang.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/paket-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const K3 = "/kelas/dasar-matematika-kelas-3/materi/kalimat-matematika", K7 = "/kelas/logika-dan-aljabar-kelas-7/materi/bilangan-rasional", K9 = "/kelas/strategi-matematika-kelas-9/materi/bangun-ruang-kelas-9";
try {
  for (const width of [320, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } }), page = await ctx.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message));
    const fit = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow ${width} ${label}`);
    const login = async (u, p) => { await page.goto(`${origin}/masuk`); await page.getByLabel("Username").fill(u); await page.getByLabel("PIN").fill(p); await page.getByRole("button", { name: "Masuk Sekarang", exact: true }).click(); await page.waitForURL(`${origin}/`); };
    const logout = async () => { await page.goto(`${origin}/akun`); await page.getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(`${origin}/`); };
    const order = async (offer, buyer, names) => {
      const box = page.getByRole("region", { name: "Buat akun dari pesanan Scalev" });
      await box.getByRole("radio", { name: new RegExp(offer) }).check();
      await box.getByLabel("Nama pembeli").fill(buyer); await box.getByLabel("Nomor WhatsApp").fill("081234567890"); await box.getByLabel("Nomor pesanan Scalev").fill(`SC-${width}`);
      for (const [i, n] of names.entries()) await box.getByLabel(`Nama anak akun ${i + 1}`).fill(n);
      await box.getByRole("button", { name: `Buat ${names.length} akun` }).click();
      const res = page.getByTestId("order-result"); await res.waitFor();
      const msg = await res.locator("pre").textContent();
      const creds = [...msg.matchAll(/Username: (\S+)\nPIN: (\d{6})/g)].map(m => [m[1], m[2]]);
      assert.equal(creds.length, names.length, msg);
      for (const n of names) assert.ok(msg.includes(n), `nama ${n} di pesan`);
      assert.ok(decodeURIComponent(await res.getByRole("link", { name: "Kirim lewat WhatsApp" }).getAttribute("href")).includes(creds[0][0]));
      await res.getByRole("button", { name: "Tutup" }).click();
      return creds;
    };
    await login("admin", "111111"); await page.goto(`${origin}/admin`);
    const sd = await order("Paket Jenjang SD", `Ibu Rina ${width}`, ["Dika", "Nara"]);
    assert.notEqual(sd[0][0], sd[1][0]);
    await page.getByText(sd[0][0]).first().waitFor();
    await fit("admin"); await page.screenshot({ path: `${folder}/${width}-admin-pesanan.png`, fullPage: true });
    const all = await order("Paket Semua Kelas", `Pak Budi ${width}`, ["A", "B", "C"]);
    await logout();
    // Akun SD: kelas 3 terbuka, kelas 7 tidak.
    await login(sd[1][0], sd[1][1]);
    await page.goto(`${origin}${K3}`); assert.ok(page.url().endsWith(K3), "SD membuka kelas 3");
    await page.goto(`${origin}${K7}`); await page.waitForURL(/\/masuk\?.*alasan=paket/); assert.ok(page.url().includes("kelas=7"));
    await page.goto(`${origin}/akun`); await page.getByText("Kelas 1, Kelas 2, Kelas 3, Kelas 4, Kelas 5, Kelas 6").waitFor();
    await logout();
    // Akun semua kelas: kelas 9 terbuka.
    await login(all[2][0], all[2][1]);
    await page.goto(`${origin}${K9}`); assert.ok(page.url().endsWith(K9), "semua kelas membuka kelas 9");
    await logout();
    // Tombol "Dapatkan akses" muncul di halaman Masuk dan saat kelas belum dibeli.
    await page.goto(`${origin}/masuk`);
    assert.ok(/^https:\/\//.test(await page.getByRole("link", { name: "Dapatkan akses" }).getAttribute("href")));
    await fit("masuk");
    assert.deepEqual(errors, []); await ctx.close();
    console.log(`PASS paket ${width}px: pesanan SD 2 akun dan semua kelas 3 akun, akses per jenjang, pesan WhatsApp, tombol Dapatkan akses`);
  }
} finally { await browser.close(); }
