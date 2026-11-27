// Uji browser program affiliate dengan server tiruan (scripts/mock-supabase-auth.mjs):
// daftar, link /r/KODE, sinkron pesanan Scalev, komisi tetap Rp19.900 / Rp34.900 + masa tahan 3 hari, pencairan, admin, dan akun lama yang bergabung.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/affiliate-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const fit = async (page, label) => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${label}: ${s.scroll} > ${s.inner}`); };
const errors = [];
const open = async width => { const ctx = await browser.newContext({ viewport: { width, height: 900 } }); const page = await ctx.newPage(); page.setDefaultTimeout(15000);
  page.on("pageerror", e => errors.push(`${page.url()}: ${e.message}`)); page.on("dialog", d => void d.accept(d.type() === "prompt" ? "Ref uji 123" : undefined)); return { ctx, page }; };
const login = async (page, u, p) => { await page.getByLabel("Username", { exact: true }).fill(u); await page.locator("#login-pin").fill(p); await page.getByRole("button", { name: "Masuk Sekarang", exact: true }).click(); };
try {
  // 1. Halaman program terbuka dari footer, rapi di semua lebar.
  for (const width of [320, 390, 768, 1280]) {
    const { ctx, page } = await open(width);
    await page.goto(`${origin}/`); await page.getByRole("link", { name: "Program affiliate" }).click(); await page.waitForURL(/\/affiliate$/);
    await page.getByRole("heading", { level: 1, name: /komisi sampai Rp34\.900/ }).waitFor();
    assert.deepEqual(await page.getByTestId("commission-card").allTextContents().then(t => t.map(x => x.match(/Rp\d+\.\d+$/)?.[0])), ["Rp19.900", "Rp34.900"]);
    // Kalkulator: 3 jenjang + 1 keluarga = Rp94.600; dikurangi sampai 2 jenjang saja = Rp39.800 (belum bisa cair).
    await page.getByTestId("calc-total").filter({ hasText: "Rp94.600" }).waitFor();
    await page.getByRole("button", { name: "Kurangi Paket Keluarga" }).click(); await page.getByRole("button", { name: "Kurangi Paket satu jenjang" }).click();
    await page.getByTestId("calc-total").filter({ hasText: "Rp39.800" }).waitFor(); await page.getByText("Kurang Rp10.200 lagi untuk bisa dicairkan.").waitFor();
    await page.getByRole("button", { name: "Tambah Paket Keluarga" }).click(); await page.getByText("Sudah bisa dicairkan ke e-wallet.").waitFor();
    await fit(page, `affiliate ${width}`); await page.screenshot({ path: `${folder}/${width}-affiliate.png`, fullPage: true });
    await ctx.close();
  }

  // 2. Daftar tanpa akun: dapat kode, username, PIN, dan langsung masuk.
  const { ctx, page } = await open(390);
  await page.goto(`${origin}/affiliate`);
  await page.getByLabel("Nama lengkap").fill("Bunda Rina");
  await page.getByRole("textbox", { name: "Nomor WhatsApp" }).fill("081299990000");
  await page.getByRole("button", { name: "Daftar dan dapatkan link" }).click();
  await page.getByText("Centang persetujuan").waitFor();
  await page.getByLabel(/setuju dengan ketentuan/).check();
  await page.getByRole("button", { name: "Daftar dan dapatkan link" }).click();
  const code = (await page.getByTestId("aff-code").textContent()).trim();
  assert.match(code, /^BUNDARIN\d{3}$/);
  assert.match(await page.getByTestId("aff-pin").textContent(), /^\d{6}$/);
  assert.match(await page.getByTestId("aff-link").textContent(), new RegExp(`/r/${code}$`));
  await fit(page, "daftar selesai"); await page.screenshot({ path: `${folder}/390-daftar-selesai.png`, fullPage: true });

  // Nomor yang sama tidak bisa didaftarkan dua kali.
  const other = await open(390);
  await other.page.goto(`${origin}/affiliate`); await other.page.getByLabel("Nama lengkap").fill("Orang Lain"); await other.page.getByRole("textbox", { name: "Nomor WhatsApp" }).fill("0812-9999-0000");
  await other.page.getByLabel(/setuju dengan ketentuan/).check(); await other.page.getByRole("button", { name: "Daftar dan dapatkan link" }).click();
  await other.page.getByText("sudah terdaftar sebagai affiliate").waitFor(); await other.ctx.close();

  // 3. Link /r/KODE (huruf kecil pun) meneruskan ke halaman penjualan dengan UTM affiliate.
  const visitor = await open(390);
  await visitor.page.goto(`${origin}/r/${code.toLowerCase()}`); await visitor.page.getByRole("heading", { name: "Halaman penjualan tiruan" }).waitFor();
  const u = new URL(visitor.page.url());
  assert.equal(u.searchParams.get("utm_source"), "affiliate"); assert.equal(u.searchParams.get("utm_campaign"), code);
  await visitor.page.goto(`${origin}/r/TIDAKADA999`); await visitor.page.waitForURL(/\/lp/); assert.equal(new URL(visitor.page.url()).search, "");
  await visitor.ctx.close();

  // 4. Dasbor: sinkron otomatis membaca pesanan Scalev. 3 Paket Keluarga sudah lewat 3 hari (34.900 x 3; satu dibayar diskon Rp99.000),
  //    1 paket satu jenjang masih tertahan (19.900); pembelian sendiri, belum bayar, dan batal tidak dihitung.
  await page.locator("#daftar").getByRole("link", { name: "Buka dasbor affiliate" }).click(); await page.waitForURL(/\/akun\/affiliate$/);
  await page.getByTestId("dash-code").filter({ hasText: code }).waitFor();
  await page.getByTestId("stat-available").filter({ hasText: "Rp104.700" }).waitFor();
  assert.equal((await page.getByTestId("stat-held").textContent()).trim(), "Rp19.900");
  assert.equal(await page.getByTestId("commission-row").count(), 4);
  await page.getByText("Klik 30 hari").waitFor();
  await fit(page, "dasbor"); await page.screenshot({ path: `${folder}/390-dasbor.png`, fullPage: true });

  // 5. Ajukan pencairan.
  await page.getByRole("button", { name: /^Cairkan Rp104\.700$/ }).click();
  await page.getByText("Pengajuan pencairan terkirim").waitFor();
  await page.getByText("Pengajuan Rp104.700 sedang diproses admin.").waitFor();
  assert.ok(await page.getByRole("button", { name: /^Cairkan/ }).isDisabled());
  await ctx.close();

  // 6. Admin: lihat pengajuan, sinkron manual, tandai sudah dibayar.
  const adm = await open(1280);
  await adm.page.goto(`${origin}/masuk?lanjut=/admin`); await login(adm.page, "admin", "111111"); await adm.page.waitForURL(/\/admin$/);
  await adm.page.getByRole("link", { name: "Affiliate", exact: true }).click(); await adm.page.waitForURL(/\/admin\/affiliate$/);
  await adm.page.getByTestId("payout-request").filter({ hasText: "Rp104.700" }).waitFor();
  await adm.page.getByTestId("affiliate-row").filter({ hasText: code }).waitFor();
  await adm.page.getByRole("button", { name: "Sinkronkan pesanan Scalev" }).click(); await adm.page.getByText(/Sinkron selesai/).waitFor();
  await fit(adm.page, "admin affiliate"); await adm.page.screenshot({ path: `${folder}/1280-admin-affiliate.png`, fullPage: true });
  await adm.page.getByRole("button", { name: "Sudah dibayar" }).click();
  await adm.page.getByText("Tidak ada pengajuan yang menunggu.").waitFor();
  await adm.page.getByTestId("affiliate-row").filter({ hasText: "Rp104.700" }).waitFor();
  await adm.ctx.close();

  // 7. Akun pembeli yang sudah ada mengaktifkan affiliate dari halaman akun.
  for (const width of [320, 1280]) {
    const s = await open(width);
    const user = width === 320 ? ["masihlama", "444444", "081377770000"] : ["hampirhabis", "222222", "081388880000"];
    await s.page.goto(`${origin}/masuk?lanjut=/akun`); await login(s.page, user[0], user[1]); await s.page.waitForURL(/\/akun$/);
    await s.page.getByRole("link", { name: "Affiliate", exact: true }).click(); await s.page.waitForURL(/\/akun\/affiliate$/);
    await s.page.getByRole("heading", { name: "Aktifkan affiliate untuk akun ini" }).waitFor();
    await s.page.getByLabel("Nama lengkap").fill(`Bunda ${user[0]}`); await s.page.getByRole("textbox", { name: "Nomor WhatsApp" }).fill(user[2]);
    await s.page.getByLabel("Jenis e-wallet").selectOption("GoPay");
    await s.page.getByLabel(/setuju dengan ketentuan/).check(); await s.page.getByRole("button", { name: "Aktifkan affiliate" }).click();
    // Setelah aktif, dasbor langsung tampil dengan kode baru; akun lama tidak dibuatkan PIN baru.
    await s.page.getByRole("heading", { name: "Dasbor affiliate" }).waitFor(); assert.match(await s.page.getByTestId("dash-code").textContent(), /^BUNDA[A-Z]*\d{3}$/);
    assert.equal(await s.page.getByTestId("aff-username").count(), 0);
    await s.page.getByTestId("stat-available").filter({ hasText: "Rp0" }).waitFor();
    await fit(s.page, `dasbor ${width}`); await s.page.screenshot({ path: `${folder}/${width}-dasbor-akun-lama.png`, fullPage: true });
    await s.ctx.close();
  }
  assert.deepEqual(errors, [], errors.join("\n"));
  console.log("smoke-affiliate: OK");
} finally { await browser.close(); }
