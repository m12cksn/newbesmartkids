import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";

// Paket sekolah: admin membuat guru, kelas sekolah, dan akun siswa sekaligus; guru melihat rekap dan laporan siswa.
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/teacher-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }), page = await ctx.newPage(); page.setDefaultTimeout(10000);
const errors = []; page.on("pageerror", e => errors.push(e.message));
page.on("dialog", d => d.accept());
const login = async (u, p) => { await page.goto(`${origin}/masuk`); await page.getByLabel("Username").fill(u); await page.getByLabel("PIN").fill(p); await page.getByRole("button", { name: "Masuk Sekarang", exact: true }).click(); await page.waitForURL(`${origin}/`); };
const logout = async () => { await page.goto(`${origin}/akun`); await page.getByRole("button", { name: "Keluar", exact: true }).click(); await page.waitForURL(`${origin}/`); };
const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${s.inner} ${label}`); };
try {
  // 1. Admin: buat akun guru, jadikan guru, buat kelas sekolah.
  await login("admin", "111111"); await page.goto(`${origin}/admin`);
  await page.getByLabel("Nama siswa atau orang tua").fill("Bu Sari"); await page.getByLabel("Username").fill("bu.sari");
  await page.getByRole("button", { name: "Buat akun dan PIN" }).click();
  const teacherPin = (await page.getByTestId("new-pin").textContent()).trim();
  const row = page.getByRole("listitem").filter({ hasText: "@bu.sari" });
  await row.getByRole("button", { name: "Jadikan guru" }).click(); await row.getByText("guru", { exact: true }).waitFor();
  const school = page.getByRole("region", { name: "Kelas sekolah" });
  await school.getByLabel("Nama kelas sekolah").fill("4A SD Harapan");
  await school.getByLabel("Guru").selectOption({ label: "Bu Sari" }); await school.locator("form").first().getByLabel(/^Kelas/).selectOption("4");
  await school.getByRole("button", { name: "Buat kelas sekolah" }).click();
  const card = school.getByTestId("group").filter({ hasText: "4A SD Harapan" });
  await card.getByText("Guru: Bu Sari (@bu.sari). 0 siswa.").waitFor();
  await card.getByRole("button", { name: "Kelola" }).click();
  // Buat tiga akun siswa sekaligus.
  await card.getByLabel("Nama siswa").fill("Ani Lestari\nBudi\n\nCaca");
  await card.getByLabel("Awalan username").fill("sdh4a");
  await card.getByRole("button", { name: "Buat 3 akun" }).click();
  const result = card.getByTestId("bulk-result"); await result.waitFor();
  const creds = await result.locator("tbody tr").evaluateAll(rows => rows.map(r => [...r.cells].map(c => c.textContent.trim())));
  assert.deepEqual(creds.map(c => c[1]), ["sdh4a01", "sdh4a02", "sdh4a03"]); assert.ok(creds.every(c => /^\d{6}$/.test(c[2])));
  await card.getByText("Guru: Bu Sari (@bu.sari). 3 siswa.").waitFor();
  await page.screenshot({ path: `${folder}/admin-kelas-sekolah.png`, fullPage: true });
  // Masukkan akun lama; username asing dan akun guru ditolak.
  await card.getByLabel("Username siswa").fill("masihlama\ntidakada\nbu.sari");
  await card.getByRole("button", { name: "Masukkan" }).click();
  await card.getByText("Tidak ditemukan atau bukan akun siswa: tidakada, bu.sari").waitFor();
  await card.getByText("4 siswa.", { exact: false }).waitFor();
  // Keluarkan satu siswa.
  await card.getByRole("listitem").filter({ hasText: "@masihlama" }).getByRole("button", { name: "Keluarkan" }).click();
  await card.getByText("Guru: Bu Sari (@bu.sari). 3 siswa.").waitFor();
  await logout();

  // 2. Siswa: tidak bisa membuka halaman guru; simpan nilai.
  await login("sdh4a01", creds[0][2]);
  await page.goto(`${origin}/guru`); await page.waitForURL(/\/masuk\?.*alasan=guru/); await page.getByText("Halaman ini untuk akun guru.").waitFor();
  const save = (path, title, kind, correct, total) => page.evaluate(b => fetch("/api/hasil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.status), { path, title, kind, part: "", correct, total });
  assert.equal(await save("/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar", "Bangun Datar", "latihan", 3, 4), 200);
  assert.equal(await save("/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar", "Bangun Datar", "evaluasi", 21, 24), 200);
  assert.equal(await save("/kelas/pola-dan-strategi-kelas-4/materi/pola-gambar-dan-pola-bilangan", "Pola Gambar dan Pola Bilangan", "evaluasi", 12, 24), 200);
  await logout();
  await login("sdh4a02", creds[1][2]);
  assert.equal(await save("/kelas/pola-dan-strategi-kelas-4/materi/bangun-datar", "Bangun Datar", "evaluasi", 15, 24), 200);
  await logout();

  // 3. Guru: rekap kelas.
  await login("bu.sari", teacherPin);
  await page.goto(`${origin}/akun`); await page.getByRole("link", { name: "Rekap kelas" }).click(); await page.waitForURL(`${origin}/guru`);
  await page.getByRole("heading", { name: "4A SD Harapan" }).waitFor();
  assert.equal(await page.getByTestId("stat-total").textContent(), "3"); assert.equal(await page.getByTestId("stat-active").textContent(), "2");
  const table = page.getByTestId("rekap");
  const head = await table.locator("thead th").allTextContents();
  assert.deepEqual(head.slice(0, 2), ["Siswa", "Terakhir belajar"]); assert.ok(head.includes("Bab 5") && head.includes("Bab 3"), head.join("|"));
  const bdIdx = head.indexOf("Bab 5"), pgIdx = head.indexOf("Bab 3");
  const cells = async name => (await table.locator("tbody tr").filter({ hasText: name }).locator("th, td").allTextContents()).map(t => t.trim());
  const ani = await cells("Ani Lestari");
  assert.equal(ani[bdIdx], "88"); assert.equal(ani[pgIdx], "50");
  assert.equal((await cells("Budi"))[bdIdx], "63");
  assert.equal((await cells("Caca"))[bdIdx], "-");
  assert.match(await table.locator("tfoot").textContent(), /76\s*2\/3/);
  assert.match(await table.locator("tbody tr").filter({ hasText: "Ani Lestari" }).locator("td span[aria-label]").nth(pgIdx - 2).getAttribute("aria-label"), /nilai 50, Perlu belajar lagi/);
  await page.getByText("Bab 3 Pola Gambar dan Pola Bilangan: rata-rata 50 dari 1 siswa").waitFor();
  assert.equal(await page.getByTestId("inactive").textContent(), "Caca");
  // CSV
  const [dl] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Unduh CSV" }).click()]);
  const csv = await readFile(await dl.path(), "utf8");
  assert.match(csv, /^﻿Nama;Username;Terakhir belajar;Kegiatan 7 hari;Bab 1 /); assert.match(csv, /Ani Lestari;sdh4a01;\d{4}-\d{2}-\d{2};3;;;50;;88;/);
  await fit("rekap 1280"); await page.screenshot({ path: `${folder}/1280-rekap-guru.png`, fullPage: true });
  for (const w of [320, 390, 768]) { await page.setViewportSize({ width: w, height: 900 }); await page.reload(); await table.waitFor(); await fit(`rekap ${w}`); await page.screenshot({ path: `${folder}/${w}-rekap-guru.png`, fullPage: true }); }
  await page.setViewportSize({ width: 1280, height: 900 });
  // Laporan siswa di kelasnya.
  await table.getByRole("link", { name: "Ani Lestari" }).click(); await page.waitForURL(/\/guru\/laporan\//);
  await page.getByText("Bangun Datar").first().waitFor(); await page.getByRole("link", { name: "Kembali ke rekap kelas" }).waitFor();
  // Siswa di luar kelasnya tidak bisa dibuka.
  const admin = await page.evaluate(() => fetch("/api/guru", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "report", account: "00000000-0000-0000-0000-000000000000" }) }).then(r => r.status));
  assert.equal(admin, 404);
  // Guru bukan admin.
  await page.goto(`${origin}/admin`); await page.waitForURL(/\/masuk\?.*alasan=admin/);
  await logout();

  // 4. Admin mengembalikan guru menjadi siswa: kelas sekolah kehilangan gurunya.
  await login("admin", "111111"); await page.goto(`${origin}/admin`);
  for (const w of [320, 390, 768, 1280]) { await page.setViewportSize({ width: w, height: 900 }); await fit(`admin ${w}`); }
  await page.getByRole("listitem").filter({ hasText: "@bu.sari" }).getByRole("button", { name: "Jadikan siswa" }).click();
  await page.getByRole("region", { name: "Kelas sekolah" }).getByText("Guru: belum dipilih. 3 siswa.").waitFor();
  assert.deepEqual(errors, []);
  console.log("PASS paket sekolah: guru, kelas sekolah, buat akun sekaligus, rekap nilai, CSV, laporan siswa, batas akses, 320/390/768/1280");
} finally { await browser.close(); }
