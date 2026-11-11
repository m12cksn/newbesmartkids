import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP } from "../src/data/grade-two-diagrams.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-diagrams-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = (id = "lab-result") => page.getByTestId(id).getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = v[i], xs = x.split("|");
        const group = page.getByRole("group", { name: `Pilihan bagian ${i + 1}`, exact: true });
        if (p.kind === "number") await box(p.label).fill(x);
        else if (p.kind === "tallyFill") { for (const [k, r] of p.rows.entries()) await box(`Banyak ${r.name}`).fill(xs[k]); }
        else if (p.kind === "tallyBuild") {
          for (const [k, r] of p.rows.entries()) {
            const [t, c] = xs[k].split(",").map(Number);
            await clicks(`Tambah turus ${r.name}`, t + 1); await button(`Hapus turus ${r.name}`).click();
            await page.getByRole("img", { name: `Turus ${t}`, exact: true }).first().waitFor();
            await box(`Banyak ${r.name}`).fill(String(c));
          }
        } else if (p.kind === "picBuild") { for (const [k, r] of p.rows.entries()) await clicks(`Tambah gambar ${r.name}`, Number(xs[k])); }
        else if (p.kind === "pick" || p.kind === "choice") await group.getByRole("button", { name: x, exact: true }).click();
        else if (p.kind === "pair") {
          await group.getByRole("button", { name: p.options.find(o => !xs.includes(o)), exact: true }).click();
          await group.getByRole("button", { name: p.options.find(o => !xs.includes(o)), exact: true }).click();
          for (const op of [...xs].reverse()) await group.getByRole("button", { name: op, exact: true }).click();
        }
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Berbagai Diagram/ }).first().click();
    await page.getByRole("heading", { name: "Berbagai Diagram", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        assert.equal(await result(), "0");
        const fruits = page.getByRole("button", { name: /nomor \d+$/ });
        const n = await fruits.count(); assert.equal(n, 19);
        for (let k = 0; k < n; k++) await fruits.nth(k).click();
        assert.equal(await result(), "19"); await page.getByTestId("lab-result").filter({ hasText: "paling banyak disukai adalah jeruk" }).waitFor();
        await page.getByRole("img", { name: "Turus 7", exact: true }).waitFor();
        await fruits.nth(0).click(); assert.equal(await result(), "18"); await fruits.nth(0).click();
        assert.equal(await result("compare-result"), "2");
        await page.getByRole("group", { name: "Buah kedua" }).getByRole("button", { name: "Anggur" }).click(); assert.equal(await result("compare-result"), "4");
      }
      if (t === 1) {
        assert.equal(await result(), "2");
        await clicks("Tambah gambar Naik sepeda", 3); await clicks("Tambah gambar Diantar motor", 6); await clicks("Tambah gambar Jalan kaki", 4); await clicks("Tambah gambar Diantar mobil", 3); await clicks("Tambah gambar Naik bus", 2);
        assert.equal(await result(), "20"); await page.getByTestId("lab-result").filter({ hasText: "Diagram selesai" }).waitFor();
        await page.getByRole("radio", { name: "hati" }).click(); assert.equal(await page.getByRole("radio", { name: "hati" }).getAttribute("aria-checked"), "true");
        await button("Kurangi gambar Naik bus").click(); assert.equal(await result(), "19");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 0;
        await answer(q, miss ? `5${SEP}7` : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${t}-${k}`); await shot(`practice-${topics[t].code}-${k + 1}`);
        await button(k === set.length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${set.length - wrong} · Salah ${wrong} · Skor ${Math.round((set.length - wrong) / set.length * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      if (q.scene?.type === "scatter") { const first = page.getByRole("button", { name: /nomor 1$/ }).first(); await first.click(); assert.equal(await first.getAttribute("aria-pressed"), "true"); }
      await answer(q, i === 0 ? q.parts[0].rows.map((r, k) => r.n + (k === 0 ? 1 : 0)).join("|") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Mobil-mobilan 6, Boneka 8, Kelereng 11, Mainan balok 7/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 8 at ${width}px: 2 lab, 8 latihan (1 salah disengaja), 24 evaluasi (turus, diagram gambar, isian nama, pasangan, pilihan bergambar), skor dan pembahasan`);
  }
} finally { await browser.close(); }
