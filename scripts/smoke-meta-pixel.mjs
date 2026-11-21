import assert from "node:assert/strict";
import { chromium } from "playwright";
import { META_PIXEL_ID, isProductionHost, pixelPage } from "../src/lib/meta-pixel.ts";

// Pixel Meta hanya di halaman orang tua, hanya di domain produksi, dan tidak pernah di halaman belajar lain.
const free = "membilang-sampai-dengan-10", isFree = s => s === free;
assert.deepEqual(pixelPage("/", isFree), { kind: "page" });
assert.deepEqual(pixelPage("/kelas/matematika-dasar-kelas-1", isFree), { kind: "class" });
assert.deepEqual(pixelPage(`/kelas/x/materi/${free}`, isFree), { kind: "trial", slug: free });
for (const p of ["/kelas/x/materi/bab-berbayar", `/kelas/x/materi/${free}/latihan`, "/mastering-berhitung-bersusun", "/akun", "/laporan/abc", "/admin", "/masuk"]) assert.equal(pixelPage(p, isFree), null, p);
assert.ok(isProductionHost("besmartkids.id") && isProductionHost("www.besmartkids.id"));
assert.ok(!isProductionHost("127.0.0.1") && !isProductionHost("newbesmartkids.vercel.app"));

// Peramban: www.besmartkids.id diarahkan ke server lokal; skrip Meta diganti stub agar panggilan fbq tercatat di antrean.
const port = new URL(process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000").port || "80";
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE, args: [`--host-resolver-rules=MAP www.besmartkids.id:80 127.0.0.1:${port}`, "--no-proxy-server"] });
try {
  const page = await browser.newPage(); page.setDefaultTimeout(15000);
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  let scriptLoads = 0;
  await page.route("https://connect.facebook.net/**", r => { scriptLoads++; return r.fulfill({ contentType: "application/javascript", body: "" }); });
  await page.route("https://www.facebook.com/**", r => r.fulfill({ status: 204, body: "" }));
  const origin = "http://www.besmartkids.id";
  const calls = () => page.evaluate(() => (window.fbq?.queue ?? []).map(a => a.slice(0, 2).join(":")));
  // Latihan harian tidak memuat pixel.
  await page.goto(`${origin}/mastering-berhitung-bersusun`); await page.waitForLoadState("networkidle");
  assert.equal(await page.evaluate(() => typeof window.fbq), "undefined", "latihan harian tanpa pixel");
  await page.goto(`${origin}/`); await page.waitForFunction(() => window.fbq?.queue?.some(a => a[0] === "track"));
  assert.deepEqual(await calls(), ["set:autoConfig", `init:${META_PIXEL_ID}`, "track:PageView"]);
  assert.equal(await page.evaluate(() => window.fbq.disablePushState), true);
  const trialUrl = `${origin}/kelas/matematika-dasar-kelas-1/materi/membilang-sampai-dengan-10`;
  await page.goto(trialUrl); await page.waitForFunction(() => window.fbq?.queue?.some(a => a[1] === "StartTrial"));
  const q = await page.evaluate(() => window.fbq.queue.filter(a => a[0] === "track"));
  assert.deepEqual(q.map(a => a[1]), ["PageView", "StartTrial"]);
  assert.deepEqual(q[1][2], { content_name: "membilang-sampai-dengan-10" }, "hanya nama bab yang dikirim");
  // Bab berbayar diarahkan ke halaman masuk: tidak ada pixel.
  await page.goto(`${origin}/kelas/matematika-dasar-kelas-1/materi/mengukur-panjang-benda`); await page.waitForLoadState("networkidle");
  assert.equal(await page.evaluate(() => typeof window.fbq), "undefined", "halaman masuk tanpa pixel");
  assert.ok(scriptLoads >= 1, "skrip Meta dimuat di beranda");
  assert.deepEqual(errors, []);
  // Domain lain (pratinjau/lokal): tidak pernah memuat pixel.
  const local = await browser.newPage(); await local.goto((process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000") + "/"); await local.waitForLoadState("networkidle");
  assert.equal(await local.evaluate(() => typeof window.fbq), "undefined", "bukan domain produksi");
  console.log("PASS meta pixel: hanya beranda, halaman kelas, dan Bab 1 gratis di domain produksi; StartTrial hanya membawa nama bab; tidak ada di latihan harian, halaman masuk, maupun domain lain");
} finally { await browser.close(); }
