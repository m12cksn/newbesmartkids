// Uji browser halaman penjualan Scalev (public/landing/paket-belajar.{css,js}) dengan Scalev tiruan.
// Tidak membuat pesanan sungguhan dan tidak memuat piksel iklan.
// Pakai: node scripts/smoke-landing-paket.mjs   (CHAPTER_SCREENSHOTS=folder untuk menyimpan tangkapan layar)
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = process.env.CHAPTER_SCREENSHOTS ?? path.join(os.tmpdir(), "landing-paket-screenshots");
await mkdir(shots, { recursive: true });

// 0. Aset di public/landing harus persis hasil bangun dari sumber (scripts/landing/paket-belajar.src.html).
const tmp = await mkdtemp(path.join(os.tmpdir(), "landing-build-"));
execFileSync("node", [path.join(root, "scripts", "build-landing-paket.mjs"), tmp], { stdio: "pipe" });
for (const f of ["paket-belajar.css", "paket-belajar.js"]) assert.equal(await readFile(path.join(tmp, f), "utf8"), await readFile(path.join(root, "public", "landing", f), "utf8"), `${f} tidak sinkron dengan sumbernya. Jalankan: node scripts/build-landing-paket.mjs`);

const shell = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="file://${root}/public/landing/paket-belajar.css"></head>
<body><div id="bsk-app"></div><script src="file://${root}/public/landing/paket-belajar.js"></script></body></html>`;
const shellPath = path.join(tmp, "shell.html");
await writeFile(shellPath, shell);

// Scalev tiruan: data toko, perkiraan total, dan pembuatan pesanan yang dicatat.
const stub = () => {
  const price = { bpo_FDeyG5ysyV6LJSqaLp_W7WiP: 79000 };
  const uids = { sd: "bpo_FDeyG5ysyV6LJSqaLp-W7WiP", smp: "bpo_B6PpOuV4Jsfw364T0i1okADD", sma: "bpo_nZjwOWaW54Lkx2z7PfUBM_4I", keluarga: "bpo_UhwEEYwlIT3Q94QInAMmHTlw" };
  const harga = { [uids.sd]: 79000, [uids.smp]: 79000, [uids.sma]: 79000, [uids.keluarga]: 129000 };
  void price;
  window.__orders = []; window.__fail = "";
  window.Scalev = {
    data: { get: () => ({ store: {
      bundlePriceOptions: Object.entries(harga).map(([uniqueId, p]) => ({ uniqueId, price: p })),
      paymentMethodOptions: ["qris", "gopay", "shopeepay", "dana", "invoice", "linkaja", "ovo"].map(v => ({ value: v, display: v === "invoice" ? "Virtual Account / GoPay / DANA" : v.toUpperCase() })),
    } }) },
    checkout: {
      updateIntent() {},
      estimateSummary: async p => ({ isComplete: true, grossRevenue: harga[p.items[0].bundlePriceOptionUniqueId] }),
      createOrder: async p => { window.__orders.push(JSON.parse(JSON.stringify(p))); if (window.__fail) throw new Error(window.__fail); return { redirectUrl: "#sukses" }; },
    },
    prefill: { get: async () => ({}), save() {} },
  };
};

const browser = await chromium.launch();
const errors = [];
async function open(width, height = 900) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage(); page.setDefaultTimeout(8000);
  page.on("pageerror", e => errors.push(`${width}: ${e.message}`));
  await page.route(/facebook|googletagmanager|tiktok|clarity|google-analytics/, r => r.abort());
  await page.addInitScript(stub);
  await page.goto("file://" + shellPath);
  await page.waitForSelector("#co-btn:not([disabled])");
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}" });
  return { ctx, page };
}
const top = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : null; }, sel);
const h2top = (page, text) => page.evaluate(t => { const e = [...document.querySelectorAll("h2")].find(x => x.textContent.trim() === t); return e ? e.getBoundingClientRect().top + scrollY : null; }, text);

try {
  // 1. Tata letak di semua lebar: tanpa gulir samping, urutan bagian sesuai keputusan, tangkapan layar.
  for (const width of [320, 390, 768, 1280]) {
    const { ctx, page } = await open(width);
    const sw = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, i: innerWidth }));
    assert.ok(sw.s <= sw.i, `gulir samping di ${width}px: ${sw.s} > ${sw.i}`);
    const y = {
      demoBawah: await page.evaluate(() => document.getElementById("demo").getBoundingClientRect().bottom + scrollY),
      paket: await top(page, "#paket"), masalah: await h2top(page, "Sering begini di rumah?"), metode: await h2top(page, "Benda, gambar, lalu angka"),
      isi: await h2top(page, "Seperti ini isinya"), cara: await h2top(page, "Dari pesan sampai mulai belajar"), faq: await h2top(page, "Pertanyaan umum"), form: await top(page, "#order"),
    };
    const urut = [y.demoBawah, y.paket, y.masalah, y.metode, y.isi, y.cara, y.faq, y.form];
    assert.ok(urut.every((v, i) => v != null && (i === 0 || v >= urut[i - 1])), `urutan bagian salah di ${width}px: ${JSON.stringify(y)}`);
    assert.ok(y.paket - y.demoBawah < 160, `Pilih Paket harus tepat di bawah demo (jarak ${Math.round(y.paket - y.demoBawah)}px)`);
    for (const t of ["Isi BeSmartKids", "Les atau BeSmartKids?"]) assert.equal(await h2top(page, t), null, `bagian "${t}" seharusnya sudah dihapus`);
    await page.screenshot({ path: path.join(shots, `${width}-landing-penuh.png`), fullPage: true });
    await ctx.close();
  }

  // 2. Isi dan klaim.
  {
    const { ctx, page } = await open(390);
    assert.equal((await page.locator("h1").textContent()).trim(), "Anak Bilang Matematika Itu Susah?");
    assert.equal((await page.locator(".hero .lead").innerText()).replace(/\s+/g, " ").trim(), "Bantu dengan yang bisa dilihat & dicoba. 64 bab interaktif, latihan harian, dan laporan orang tua — tanpa install, buka di HP.");
    assert.equal((await page.locator("#paket h2").textContent()).trim(), "Pilih Paket — Akses 1 Tahun Penuh");
    assert.match(await page.locator("#paket .sub").innerText(), /Akun aktif via WhatsApp maksimal 1×24 jam/);
    const body = await page.evaluate(() => document.body.innerText);
    assert.doesNotMatch(body, /4[.,]8\s*\/\s*5|1\.200|[Gg]aransi|[Tt]estimoni|10\.000\+/, "tidak boleh ada rating, jumlah pengguna, atau garansi yang belum benar-benar ada");
    assert.match(body, /Hemat lebih dari\s*95%\s*vs les/);
    assert.match(body, /Hemat Rp29\.000 vs beli 2 paket terpisah/);
    assert.match(body, /SD 40 bab, SMP 16 bab, SMA 8 bab/);
    assert.match(body, /Tersedia Kelas 1-6 SD, 7-9 SMP, 10-12 SMA: 64 bab total/);
    assert.equal(await page.locator("section:has(h2:text-is('Pertanyaan umum')) details").count(), 3, "FAQ harus 3 pertanyaan");
    assert.ok(!(await page.locator("#co-email").isVisible()), "kolom email harus tersembunyi");
    // Daftar bab: tertutup dulu, terbuka lewat tombol.
    assert.ok(!(await page.locator(".acc").evaluate(e => e.open)));
    await page.getByText("Lihat daftar bab lengkap").click();
    await page.locator("#panel h4").first().waitFor();
    assert.match(await page.locator("#panel h4").first().innerText(), /^Kelas 1\s*8 bab/);
    await ctx.close();
  }

  // 3. Bar atas tetap terlihat saat menggulir, dan tombolnya membawa ke paket.
  {
    const { ctx, page } = await open(390);
    await page.evaluate(() => scrollTo(0, 2600));
    const r = await page.locator("#sticky").boundingBox();
    assert.ok(r && r.y >= 0 && r.y < 2, `bar atas harus menempel di atas layar (y=${r?.y})`);
    assert.match(await page.locator("#sticky").innerText(), /BeSmartKids[\s\S]*Akses 1 Tahun mulai Rp79\.000[\s\S]*Lihat paket/);
    await page.screenshot({ path: path.join(shots, "390-bar-atas.png") });
    await page.locator("#sticky").getByRole("link", { name: "Lihat paket" }).click();
    await page.waitForFunction(() => { const t = document.getElementById("paket").getBoundingClientRect().top; return t >= 0 && t < 120; });
    await page.locator("#order").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById("order").scrollIntoView());
    await page.waitForFunction(() => document.getElementById("sticky").classList.contains("hide"));
    await ctx.close();
  }

  // 4. "Coba 3 Soal Gratis Tanpa Daftar": langsung membuka soal latihan dan bisa diselesaikan.
  {
    const { ctx, page } = await open(390);
    await page.getByRole("button", { name: "Coba 3 Soal Gratis Tanpa Daftar" }).click();
    await page.locator("#demo").getByText("Latihan").first().waitFor();
    assert.match(await page.locator("#demo .top").innerText(), /1 dari 3/);
    for (const [pilihan, lanjut] of [[1, "Soal berikutnya"], [2, "Soal berikutnya"], [1, "Lihat hasil"]]) {
      await page.locator(`#demo [data-a="${pilihan}"]`).click();
      await page.locator("#demo .next .cta", { hasText: lanjut }).click();
    }
    assert.match(await page.locator("#demo .score .big").innerText(), /3\/3/);
    await page.screenshot({ path: path.join(shots, "390-tiga-soal-hasil.png") });
    await ctx.close();
  }

  // 5. Kartu paket memilih paket di formulir; teks tombol mengikuti harga; email tidak ada; QRIS bawaan.
  {
    const { ctx, page } = await open(390);
    const kirim = page.locator("#co-btn");
    await page.locator('[data-pick="smp"]').click();
    await page.waitForFunction(() => document.querySelector("#co-pkgs input:checked")?.closest("label")?.innerText.includes("Paket SMP"));
    assert.equal((await kirim.innerText()).replace(/\u00a0/g, " ").trim(), "Dapatkan Akses 1 Tahun - Rp79.000");
    await page.locator('[data-pick="keluarga"]').click();
    await page.waitForFunction(() => document.querySelector("#co-pkgs input:checked")?.closest("label")?.innerText.includes("Paket Keluarga"));
    assert.equal((await kirim.innerText()).replace(/\u00a0/g, " ").trim(), "Dapatkan Akses 1 Tahun - Rp129.000");
    assert.ok((await page.locator("#co-pay input:checked").evaluate(e => e.closest("label").innerText)).includes("QRIS"), "QRIS harus terpilih bawaan");
    assert.equal(await page.locator("#co-pay input[name=pay]:visible").count(), 1, "hanya QRIS yang terlihat sebelum 'Lihat metode lain'");
    await page.getByRole("button", { name: "Lihat metode lain" }).click();
    assert.equal(await page.locator("#co-pay input[name=pay]:visible").count(), 7);
    await page.locator("#co-more label", { hasText: /^GOPAY$/ }).click();
    assert.ok((await page.locator("#co-pay input:checked").evaluate(e => e.closest("label").innerText)).includes("GOPAY"));
    assert.equal(await page.locator("#co-pay input[name=pay]:visible").count(), 7, "daftar tetap terbuka setelah memilih metode lain");
    await page.locator("#co-pay label", { hasText: "QRIS" }).first().click();
    await page.screenshot({ path: path.join(shots, "390-form-qris.png") });

    // 6. Kirim pesanan tanpa email: payload hanya nama dan WhatsApp.
    await page.locator('input[name="name"]').fill("Bunda Uji");
    await page.locator('input[name="phone"]').fill("081234567890");
    await kirim.click();
    await page.waitForFunction(() => window.__orders.length === 1);
    const o = await page.evaluate(() => window.__orders[0]);
    assert.deepEqual(o.customer, { name: "Bunda Uji", phone: "081234567890" }, "payload tidak boleh memuat email kosong");
    assert.equal(o.paymentMethod, "qris");
    assert.deepEqual(o.items, [{ type: "bundle", bundlePriceOptionUniqueId: "bpo_UhwEEYwlIT3Q94QInAMmHTlw", quantity: 1 }]);
    await ctx.close();
  }

  // 7. Jika sistem menolak pesanan tanpa email, kolom email muncul agar pembeli tidak buntu.
  {
    const { ctx, page } = await open(390);
    await page.evaluate(() => { window.__fail = "Email wajib diisi"; });
    await page.locator('input[name="name"]').fill("Bunda Uji");
    await page.locator('input[name="phone"]').fill("081234567890");
    await page.locator("#co-btn").click();
    await page.locator("#co-email").waitFor({ state: "visible" });
    assert.match(await page.locator("#co-err").innerText(), /Email wajib diisi[\s\S]*isi email/);
    await page.locator("#co-email input").fill("ibu@contoh.id");
    await page.evaluate(() => { window.__fail = ""; });
    await page.locator("#co-btn").click();
    await page.waitForFunction(() => window.__orders.length === 2);
    assert.equal((await page.evaluate(() => window.__orders[1])).customer.email, "ibu@contoh.id");
    await page.screenshot({ path: path.join(shots, "390-form-email-muncul.png") });
    await ctx.close();
  }

  // 8. Layar paket di HP dan laptop.
  for (const [width, height] of [[390, 844], [1280, 800]]) {
    const { ctx, page } = await open(width, height);
    await page.evaluate(() => { const e = document.getElementById("paket"); scrollTo(0, e.getBoundingClientRect().top + scrollY - 70); });
    await page.screenshot({ path: path.join(shots, `${width}-paket.png`) });
    await ctx.close();
  }

  assert.deepEqual(errors, [], errors.join("\n"));
  console.log("smoke-landing-paket: OK");
} finally { await browser.close(); }
