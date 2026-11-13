import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-nine-solids.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-nine-solids-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = name => page.getByRole("radio", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        if (p.kind === "num") await box(plain(p.label)).fill(v[i]);
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "sort") { for (const [k, it] of p.items.entries()) { await button(`Benda ${it.name}`).click(); await button(`Kotak ${x[k]}`).click(); } }
        else if (p.kind === "match") { for (const [k] of p.left.entries()) { await button(`Kiri ${k + 1}`).click(); await button(x[k]).click(); } }
        else if (p.kind === "cubenet") { const [a, b] = v[i].split(","); await group(plain(p.label)).getByRole("button", { name: `Petak (${a}, ${b})`, exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/strategi-matematika-kelas-9`);
    await page.locator(`a[href$="/materi/bangun-ruang-kelas-9"]`).first().click();
    await page.getByRole("heading", { name: "Bangun Ruang", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      kinds: async () => { assert.equal(await result(), "Kubus|6|8|12"); await radio("Prisma segitiga").click(); assert.equal(await result(), "Prisma segitiga|5|6|9"); },
      nets: async () => { assert.equal(await result(), "6|jaring"); await button("Lima berjajar").click(); assert.equal(await result(), "6|bukan"); await button("Petak (4, 1)").click(); assert.equal(await result(), "5|-"); await button("Petak (1, 2)").click(); assert.equal(await result(), "6|jaring"); },
      lpprism: async () => { assert.equal(await result(), "Balok|94"); await radio("Kubus").click(); assert.equal(await result(), "Kubus|96"); },
      lppyr: async () => { assert.equal(await result(), "4|10|13|360"); await button("Banyak sisi alas (n) tambah").click(); assert.equal(await result(), "5|10|13|497"); },
      scaleA: async () => { assert.equal(await result(), "24|96|4"); await button("Faktor skala k tambah").click(); assert.equal(await result(), "24|150|6.25"); },
      vprism: async () => { assert.equal(await result(), "12|36"); await clicks("Lapisan terisi tambah", 2); assert.equal(await result(), "36|36"); },
      vpyr: async () => { assert.equal(await result(), "0|324|108"); await clicks("Tuang isi limas", 3); assert.equal(await result(), "3|324|108"); },
      scaleV: async () => { assert.equal(await result(), "105|840|8"); },
      circ: async () => { assert.equal(await result(), "14|22/7|88"); await radio("3,14").click(); assert.equal(await result(), "14|3,14|87.92"); },
      carea: async () => { assert.equal(await result(), "16|706.5"); await radio("24").click(); assert.equal(await result(), "24|706.5"); },
      arc: async () => { assert.equal(await result(), "21|60|22/7|22"); await button("Sudut pusat (°) tambah").click(); assert.equal(await result(), "21|75|22/7|27.5"); },
      sector: async () => { assert.equal(await result(), "21|60|22/7|231"); },
      lpcyl: async () => { assert.equal(await result(), "Tertutup|748"); await radio("Pipa terbuka").click(); assert.equal(await result(), "Pipa terbuka|440"); },
      lpcone: async () => { assert.equal(await result(), "13|282.6"); },
      lpsphere: async () => { assert.equal(await result(), "7|22/7|616"); },
      scaleC: async () => { assert.equal(await result(), "Tabung|0.5625|0.4219"); },
      vcyl: async () => { assert.equal(await result(), "1540|1540"); await button("Tebal dinding tambah").click(); assert.equal(await result(), "1540|408.57"); },
      vcone: async () => { assert.equal(await result(), "0|376.8"); await clicks("Tuang isi kerucut", 3); assert.equal(await result(), "3|376.8"); },
      vsphere: async () => { assert.equal(await result(), "0|38808"); await clicks("Tuang isi kerucut (r, tinggi r)", 2); assert.equal(await result(), "2|38808"); },
      scaleCV: async () => { assert.equal(await result(), "Bola|0.25|0.125"); },
    };
    for (const [k, sec] of sections.entries()) {
      if (k === 0 || sec.topic !== sections[k - 1].topic) await button(`${sec.topic.code}. ${sec.topic.title}`).click();
      await page.getByRole("tab", { name: `${sec.code} ${sec.title}`, exact: true }).click();
      await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${sec.code}`);
      await button(`Latihan ${sec.code}`).click();
      let wrong = 0;
      for (const [j, q] of practice[k].entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${k}-${j}`);
        const miss = k === 0 && j === 0;
        await answer(q, miss ? Array(6).fill("Sisi datar").join("|") : q.answer); if (miss) wrong++;
        await button("Periksa jawaban").click(); await page.getByText(miss ? "Belum tepat." : "Tepat!", { exact: true }).waitFor();
        await fit(`latihan ${k}-${j}`); await shot(`practice-${sec.code}-${j + 1}`);
        await button(j === practice[k].length - 1 ? "Lihat hasil" : "Lanjut →").click();
      }
      await page.getByText(`Benar ${4 - wrong} · Salah ${wrong} · Skor ${Math.round((4 - wrong) / 4 * 100)}/100`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button("Evaluasi 24 soal").click();
    for (const [i, q] of assessment.entries()) {
      await page.getByText(`Soal ${i + 1}/24`).waitFor();
      assert.equal(await button("Lanjut →").count(), 0, `gating evaluasi ${i + 1}`);
      await answer(q, i === 0 ? Array(6).fill("Prisma").join("|") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Tenda → Prisma; Piramida → Limas/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 9 bab 2 at ${width}px: 20 peraga, 80 latihan (1 salah disengaja), 24 evaluasi (sortir benda, hubungkan jaring-jaring, lengkapi jaring kubus, luas, volume, lingkaran, skala), skor dan pembahasan`);
  }
} finally { await browser.close(); }
