import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-seven-data.ts";
const plain = s => s.replace(/\{([^}]+)\}/g, "$1");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-seven-data-screenshots";
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
        if (p.kind === "num") { const l = plain(p.label); if (v[i].startsWith("-")) await button(`${l} ganti tanda`).click(); await box(l).fill(v[i].replace("-", "")); }
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(o).click(); }
        else if (p.kind === "table") { let k = 0; for (const row of p.rows) for (const [j, c] of row.entries()) if (c === null) await box(`${row[0]} ${p.head[j]}`).fill(x[k++]); }
        else if (p.kind === "plot") { for (const [k, c] of x.entries()) await clicks(`Tambah X di ${p.min + k}`, Number(c)); }
        else if (p.kind === "bars") { for (const [k, c] of x.entries()) await clicks(`${p.cats[k]} naik`, Number(c) / p.step); }
        else if (p.kind === "select") { for (const k of v[i].split(",")) await group(p.label).getByRole("button", { name: p.options[Number(k)], exact: true }).click(); }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(r.text).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/logika-dan-aljabar-kelas-7`);
    await page.locator(`a[href$="/materi/data-dan-diagram"]`).first().click();
    await page.getByRole("heading", { name: "Data dan Diagram", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      flow: async () => { assert.equal(await result(), "0|0/0"); for (const st of ["Formulasi pertanyaan", "Pengumpulan data", "Analisis data", "Interpretasi hasil"]) await button(st).click(); assert.equal(await result(), "ok|0/0");
        await group("Berapa tinggi badan siswa kelas 7?").getByRole("button", { name: "Statistika" }).click(); assert.equal(await result(), "ok|1/1"); },
      lineplot: async () => { assert.equal(await result(), "8|10,12"); await button("Data yang dicatat tambah").click(); assert.equal(await result(), "9|10,12,13"); },
      sort: async () => { assert.equal(await result(), "0/0"); await group("Nomor absen").getByRole("button", { name: "Kategorik" }).click(); assert.equal(await result(), "1/1"); },
      tally: async () => { assert.equal(await result(), "0"); await button("Catat semua").click(); assert.equal(await result(), "16"); },
      read: async () => { assert.equal(await result(), "12|27"); await radio("AS").click(); assert.equal(await result(), "46|39"); },
      axis: async () => { assert.equal(await result(), "3"); await clicks("Sumbu tegak mulai dari kurangi", 4); assert.equal(await result(), "1,4"); },
      build: async () => { assert.equal(await result(), "0"); await clicks("Jalan kaki tambah", 7); assert.equal(await result(), "1"); },
      change: async () => { assert.equal(await result(), "12"); await radio("Jerman").click(); assert.equal(await result(), "−20"); },
      pie: async () => { assert.equal(await result(), "40|90"); await button("Merah tambah").click(); assert.match(await result(), /^41\|96,6$/); },
      pieread: async () => { assert.equal(await result(), "300"); await button("Sudut terpakai tambah").click(); assert.equal(await result(), "325"); },
      choose: async () => { assert.equal(await result(), ""); await group("Pilih diagram").getByRole("button", { name: "Diagram garis", exact: true }).click(); assert.equal(await result(), "ok");
        await radio("Situasi 3").click(); await group("Pilih diagram").getByRole("button", { name: "Diagram batang", exact: true }).click(); assert.equal(await result(), "no"); },
      lineview: async () => { assert.equal(await result(), "bar"); await radio("Garis").click(); assert.equal(await result(), "line"); },
    };
    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      for (const [j, sec] of topics[t].sections.entries()) {
        await page.getByRole("tab", { name: `${topics[t].code}.${j + 1} ${sec.title}`, exact: true }).click();
        await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${topics[t].code}${j + 1}`);
      }
      await button(`Latihan ${topics[t].code}`).click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 0 && k === 1;
        await answer(q, miss ? "3‖5‖20" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "4‖25‖13" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Banyak siswa dengan panjang nama 13 huruf: 5/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 7 bab 6 at ${width}px: 12 peraga, 24 latihan (1 salah disengaja), 24 evaluasi (line plot, diagram batang, tabel, diagram lingkaran, pilihan diagram), skor dan pembahasan`);
  }
} finally { await browser.close(); }
