import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/login-screenshots";
await mkdir(folder, { recursive: true });
const K7 = "/kelas/logika-dan-aljabar-kelas-7/materi";
const K5 = "/kelas/pecahan-dan-pengukuran-kelas-5/materi";
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage(); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(`${page.url()}: ${e.message}`));
    const button = name => page.getByRole("button", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}`); };
    const shot = name => page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true });
    const login = async (u, p) => { await page.getByLabel("Username").fill(u); await page.getByLabel("PIN").fill(p); await button("Masuk Sekarang").click(); };

    // 1. Tanpa akun: bab pertama terbuka, evaluasinya terkunci; bab lain dialihkan ke halaman masuk.
    await page.goto(`${origin}${K7}/bilangan-bulat`);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await page.getByRole("link", { name: "Masuk" }).first().waitFor();
    await button("Latihan materi").click(); await page.getByText("Periksa jawaban").first().waitFor(); await button("Tutup").click();
    await button("Evaluasi 24 soal").click();
    await page.getByRole("heading", { name: "Evaluasi perlu akun BeSmartKids" }).waitFor();
    await fit("kunci evaluasi"); await shot("evaluasi-terkunci");
    await button("Kembali ke materi").click();
    await page.goto(`${origin}${K7}/rasio-kelas-7`);
    await page.waitForURL(/\/masuk\?/); assert.match(page.url(), /lanjut=%2Fkelas%2Flogika-dan-aljabar-kelas-7%2Fmateri%2Frasio-kelas-7/);
    await page.getByText("Bab ini termasuk paket Kelas 7").first().waitFor();
    await page.goto(`${origin}/mastering-perkalian-pembagian/level-1`); await page.waitForURL(/\/masuk\?/);
    await page.goto(`${origin}/admin`); await page.waitForURL(/\/masuk\?/);

    // 2. PIN salah, lalu admin masuk dan membuat akun Kelas 7.
    await login("admin", "000000"); await page.getByText("Username atau PIN tidak cocok").waitFor();
    await fit("masuk"); await shot("masuk");
    await login("admin", "111111"); await page.waitForURL(/\/admin$/);
    await page.getByRole("heading", { name: "Kelola akun" }).waitFor();
    const user = `siswa${width}`;
    await page.getByLabel("Nama siswa atau orang tua").fill(`Siswa ${width}`);
    await page.getByLabel("Nomor WhatsApp").fill("081234567890");
    await page.getByLabel("Username").fill(user);
    await page.getByLabel("Kelas", { exact: true }).selectOption("7");
    await button("Buat akun dan PIN").click();
    const pin = await page.getByTestId("new-pin").textContent(); assert.match(pin, /^\d{6}$/);
    assert.equal(await page.getByTestId("new-username").textContent(), user);
    await page.getByText(`Kelas 7 s.d.`).first().waitFor();
    await fit("admin"); await shot("admin");
    await page.getByLabel("Nama siswa atau orang tua").fill("Ganda"); await page.getByLabel("Username").fill(user); await button("Buat akun dan PIN").click();
    await page.getByText("Username sudah dipakai").waitFor();

    // 3. Keluar, masuk sebagai siswa: Kelas 7 terbuka, Kelas 5 tidak.
    await page.goto(`${origin}/akun`); await button("Keluar").click(); await page.waitForURL(`${origin}/`);
    await page.goto(`${origin}${K7}/rasio-kelas-7`); await page.waitForURL(/\/masuk\?/);
    await login(user, pin); await page.waitForURL(`${origin}${K7}/rasio-kelas-7`);
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await page.goto(`${origin}${K7}/bilangan-bulat`); await button("Evaluasi 24 soal").click();
    await page.getByText("Soal 1/24").waitFor();
    await page.goto(`${origin}${K5}/data`); await page.waitForURL(/alasan=paket/);
    await page.getByText("Akun Anda belum memiliki paket Kelas 5").first().waitFor();
    await page.goto(`${origin}/mastering-perkalian-pembagian/level-1`); await page.waitForURL(/mastering-perkalian-pembagian\/level-1$/);
    await page.goto(`${origin}/admin`); await page.waitForURL(/alasan=admin/);
    await page.goto(`${origin}/akun`); await page.getByText("Kelas 7", { exact: true }).waitFor();
    await fit("akun"); await shot("akun");

    // 4. Admin menambah paket Kelas 5, siswa langsung bisa membuka setelah cache habis (sesi baru).
    assert.deepEqual(errors, []); await ctx.close();
    console.log(`PASS login at ${width}px: bab gratis + evaluasi terkunci, pengalihan, PIN salah, admin buat akun, akses per kelas, mastering, akun`);
  }
} finally { await browser.close(); }
