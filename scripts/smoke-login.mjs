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
    const single = page.locator("details").filter({ hasText: "Buat satu akun dengan paket per kelas" });
    await single.locator("summary").click();
    await single.getByLabel("Nama siswa atau orang tua").fill(`Siswa ${width}`);
    await single.getByLabel("Nomor WhatsApp").fill("081234567890");
    await single.getByLabel("Username").fill(user);
    await single.getByLabel("Kelas", { exact: true }).selectOption("7");
    await single.getByRole("button", { name: "Buat akun dan PIN" }).click();
    const pin = await page.getByTestId("new-pin").textContent(); assert.match(pin, /^\d{6}$/);
    assert.equal(await page.getByTestId("new-username").textContent(), user);
    await page.getByText(`Kelas 7 s.d.`).first().waitFor();
    await fit("admin"); await shot("admin");
    await single.getByLabel("Nama siswa atau orang tua").fill("Ganda"); await single.getByLabel("Username").fill(user); await single.getByRole("button", { name: "Buat akun dan PIN" }).click();
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
    // Latihan harian: setelah diperiksa, nilainya tersimpan ke akun (sekali per paket hari itu).
    for (let i = 0; i < 7; i++) await page.locator(`[data-testid="question-${i}"] input`).fill("1");
    await button("Periksa jawaban →").or(page.getByRole("button", { name: /Periksa jawaban/ })).first().click();
    await page.getByText("Nilai tersimpan di riwayat akunmu.").waitFor();
    await page.goto(`${origin}/admin`); await page.waitForURL(/alasan=admin/);
    await page.goto(`${origin}/akun`); await page.getByText("Kelas 7", { exact: true }).waitFor();
    // Riwayat nilai: kosong dulu, lalu dua hasil disimpan lewat API dan tampil per bab.
    for (const body of [{ kind: "latihan", part: "Latihan A. Bilangan bulat", correct: 3, total: 4 }, { kind: "evaluasi", part: "Evaluasi Bab 1", correct: 21, total: 24 }]) {
      const r = await page.evaluate(b => fetch("/api/hasil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/kelas/logika-dan-aljabar-kelas-7/materi/bilangan-bulat", title: "Bilangan Bulat", ...b }) }).then(x => x.status), body);
      assert.equal(r, 200);
    }
    assert.equal(await page.evaluate(() => fetch("/api/hasil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/admin", kind: "latihan", correct: 1, total: 1 }) }).then(x => x.status)), 400);
    assert.equal(await page.evaluate(() => fetch("/api/hasil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/mastering-perkalian-pembagian/level-2", title: "Mastering Perkalian & Pembagian", kind: "harian", part: "Level 2", correct: 6, total: 7 }) }).then(x => x.status)), 200);
    await page.reload(); await page.getByRole("heading", { name: "Riwayat belajar" }).waitFor();
    await page.getByRole("link", { name: "Bilangan Bulat" }).waitFor(); await page.getByText("88/100").first().waitFor(); await page.getByText("75/100").first().waitFor();
    await page.getByText("21/24 benar, skor 88").waitFor(); const hist = page.getByRole("region", { name: "Riwayat belajar" }); await hist.getByText("Latihan harian", { exact: true }).first().waitFor(); await hist.getByText("Mastering Perkalian & Pembagian").first().waitFor(); await page.getByText("6/7 benar, skor 86").waitFor();
    await fit("akun"); await shot("akun");
    // Laporan orang tua: ringkasan bab, tautan baca-saja tanpa login, lalu tautan dicabut.
    await page.getByRole("link", { name: "Laporan belajar" }).click(); await page.waitForURL(/\/akun\/laporan$/);
    await page.getByRole("heading", { name: `Siswa ${width}` }).waitFor(); await page.getByRole("heading", { name: "Per bab" }).waitFor();
    await page.getByText("Sudah kuat", { exact: true }).filter({ visible: true }).first().waitFor();
    await fit("laporan"); await shot("laporan");
    await button("Buat tautan untuk orang tua").click(); const url = (await page.getByTestId("report-url").textContent()).trim(); assert.match(url, /\/laporan\/[0-9a-f]{24}$/);
    const guest = await browser.newContext({ viewport: { width, height: 900 } }); const gp = await guest.newPage();
    await gp.goto(url); await gp.getByRole("heading", { name: `Siswa ${width}` }).waitFor(); await gp.getByText("Bilangan Bulat", { exact: true }).filter({ visible: true }).first().waitFor();
    assert.equal(await gp.getByRole("link", { name: "Bilangan Bulat" }).count(), 0);
    assert.equal(await gp.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? ""), "noindex, nofollow");
    if (width === 1280) await gp.screenshot({ path: `${folder}/${width}-laporan-ortu.png`, fullPage: true });
    await button("Nonaktifkan tautan").click(); await page.getByRole("button", { name: "Buat tautan untuk orang tua" }).waitFor();
    await gp.reload(); await gp.getByRole("heading", { name: "Laporan tidak ditemukan" }).waitFor(); await guest.close();
    await page.goto(`${origin}/laporan/zz`); await page.getByRole("heading", { name: "Laporan tidak ditemukan" }).waitFor();
    await page.goto(`${origin}/akun`);
    // Ganti PIN sendiri: PIN lama salah ditolak, lalu PIN baru dipakai untuk masuk lagi.
    const newPin = pin === "246802" ? "135791" : "246802";
    await button("Ganti PIN").click();
    await page.getByLabel("PIN lama").fill("000000"); await page.getByLabel("PIN baru", { exact: true }).fill(newPin); await page.getByLabel("Ulangi PIN baru").fill(newPin);
    await button("Simpan PIN baru").click(); await page.getByText("PIN lama tidak cocok.").waitFor();
    await page.getByLabel("PIN lama").fill(pin); await button("Simpan PIN baru").click(); await page.getByText("PIN berhasil diganti.", { exact: false }).waitFor();
    await fit("ganti pin"); await shot("ganti-pin");
    await button("Keluar").click(); await page.waitForURL(`${origin}/`);
    await page.goto(`${origin}/masuk`); await login(user, pin); await page.getByText("Username atau PIN tidak cocok").waitFor();
    await login(user, newPin); await page.waitForURL(`${origin}/`);

    // Admin membuka laporan siswa dari kelola akun.
    await page.goto(`${origin}/masuk`); await login("admin", "111111"); await page.waitForURL(`${origin}/`);
    await page.goto(`${origin}/admin`); await page.getByRole("heading", { name: "Kelola akun" }).waitFor();
    await page.getByRole("listitem").filter({ hasText: `@${user}` }).getByRole("link", { name: "Laporan" }).click();
    await page.waitForURL(/\/admin\/laporan\//); await page.getByRole("heading", { name: `Siswa ${width}` }).waitFor(); await page.getByText("21/24 benar, skor 88").waitFor();
    await fit("laporan admin");
    // 4. Admin menambah paket Kelas 5, siswa langsung bisa membuka setelah cache habis (sesi baru).
    assert.deepEqual(errors, []); await ctx.close();
    console.log(`PASS login at ${width}px: bab gratis + evaluasi terkunci, pengalihan, PIN salah, admin buat akun, akses per kelas, mastering, akun`);
  }
} finally { await browser.close(); }
