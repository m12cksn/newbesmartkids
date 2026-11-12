import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, fracText } from "../src/data/grade-seven-rational.ts";
const plain = s => s.replace(/\{([^}]+)\}/g, "$1").replace(/-/g, "−");

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-seven-rational-screenshots";
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
        if (p.kind === "frac" || p.kind === "between") { const L = plain(p.label);
          if (x[0] === "-") await button(`${L} ganti tanda`).click();
          if (x[1]) await box(`${L} bilangan bulat`).fill(x[1]); await box(`${L} pembilang`).fill(x[2]); await box(`${L} penyebut`).fill(x[3]); }
        else if (p.kind === "dec") { const L = plain(p.label); if (v[i].startsWith("-")) await button(`${L} ganti tanda`).click(); await box(L).fill(v[i].replace("-", "")); }
        else if (p.kind === "signs") { for (const [k, s] of x.entries()) await group(`Pasangan ${k + 1}`).getByRole("button", { name: s === "<" ? "kurang dari" : s === ">" ? "lebih dari" : "sama dengan", exact: true }).click(); }
        else if (p.kind === "order") { for (const o of v[i].split(";")) await button(`Bilangan ${plain(o)}`).click(); }
        else if (p.kind === "place") { for (const [k, it] of p.items.entries()) { await group("Pilih yang akan diletakkan").getByRole("button", { name: plain(it.label), exact: true }).click(); await button(`Letakkan ${plain(it.label)} di ${fracText([Number(x[k]), p.den])}`).click(); } }
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await group(plain(r.text)).getByRole("button", { name: x[k], exact: true }).click(); }
        else if (p.kind === "select") { for (const k of v[i].split(",")) await group(plain(p.label)).getByRole("button", { name: plain(p.options[Number(k)]), exact: true }).click(); }
        else if (p.kind === "shade") { for (const k of v[i].split(",").map(Number)) await button(`Kotak baris ${Math.floor(k / p.cols) + 1} kolom ${(k % p.cols) + 1}`).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/logika-dan-aljabar-kelas-7`);
    await page.locator(`a[href$="/materi/bilangan-rasional"]`).first().click();
    await page.getByRole("heading", { name: "Bilangan Rasional", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    // Ketuk bagian cincin yang terlihat (dekat label), seperti pengguna sungguhan.
    const zone = async name => { const el = button(`Himpunan ${name}`); await el.scrollIntoViewIfNeeded(); const b = await el.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height * (name === "Asli" || name === "Irasional" ? 0.5 : 0.12)); };
    const labChecks = {
      venn: async () => { assert.equal(await result(), ""); await zone("Rasional"); assert.equal(await result(), "Rasional|ok"); await radio("Bilangan √9").click(); await zone("Bulat"); assert.equal(await result(), "Bulat|no"); await zone("Cacah"); assert.equal(await result(), "Cacah|no"); await zone("Asli"); assert.equal(await result(), "Asli|ok"); },
      division: async () => { assert.equal(await result(), "0,375"); await button("Pecahan penyebut tambah").click(); const r = await result(); assert.ok(r.startsWith("0,3") && r.endsWith("…"), r); await page.getByText("desimal tak terbatas dan berulang").waitFor(); },
      line: async () => { assert.equal(await result(), "3/4"); await clicks("Bilangan pembilang tambah", 2); assert.equal(await result(), "1 1/4"); },
      compare: async () => { assert.equal(await result(), ">"); await button("Pecahan kedua pembilang tambah").click(); assert.equal(await result(), "<"); },
      measure: async () => { assert.equal(await result(), ""); await group("Pilih takaran").getByRole("button", { name: "1 cangkir", exact: true }).click(); assert.equal(await result(), "1|ok"); await radio("1/5 cangkir kecap").click(); await group("Pilih takaran").getByRole("button", { name: "1/3 cangkir", exact: true }).click(); assert.equal(await result(), "1/3|no"); },
      addsub: async () => { assert.equal(await result(), "7/8"); await radio("Pengurangan").click(); assert.equal(await result(), "3/8"); },
      area: async () => { assert.equal(await result(), "3/8"); await button("Lebar pembilang tambah").click(); assert.equal(await result(), "9/16"); },
      divide: async () => { assert.equal(await result(), "3/4"); await button("Pembagi pembilang kurangi").click(); assert.equal(await result(), "tidak"); },
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
        const miss = t === 2 && k === 0;
        await answer(q, miss ? "||13|25" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 8 ? "5,13‖0,59‖1,89" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar 9,5 − 4,37 = 5,13/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 7 bab 2 at ${width}px: 8 peraga, 12 latihan (1 salah disengaja), 24 evaluasi (pecahan, desimal, garis bilangan, Venn, takaran, arsiran, operasi), skor dan pembahasan`);
  }
} finally { await browser.close(); }
