import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, sections, SEP, cells, plain } from "../src/data/grade-twelve-congruence.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-twelve-congruence-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const radio = (name, group) => (group ? page.getByRole("radiogroup", { name: group, exact: true }) : page).getByRole("radio", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = () => page.getByTestId("lab-result").getAttribute("data-value");
    const press = async (name, times) => { for (let k = 0; k < times; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "row") { for (const [k, c] of p.cells.entries()) await box(`${l} ${plain(c)}`).fill(x[k]); }
        else if (p.kind === "frac") { await box(`${l} kiri`).fill(x[0]); await box(`${l} kanan`).fill(x[1]); }
        else if (p.kind === "match") { for (const [k, r] of x.entries()) { await button(`Kiri ${p.left[k]}`).click(); await button(`Kanan ${r}`).click(); } }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) { if (p.options.length > 3) await page.getByRole("combobox", { name: `Baris ${plain(r.text)}`, exact: true }).selectOption(x[k]); else await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); } }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
      }
    }
    await page.goto(`${origin}/kelas/persiapan-matematika-kelas-12`);
    await page.locator(`a[href$="/materi/kekongruenan-kesebangunan-kelas-12"]`).first().click();
    await page.getByRole("heading", { name: "Kekongruenan dan Kesebangunan", level: 1, exact: true }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      pasang: async () => { assert.equal(await result(), "AP|"); await group("Bangun ABCD").getByRole("button", { name: "Titik B", exact: true }).click(); await group("Bangun PQRS").getByRole("button", { name: "Titik Q", exact: true }).click(); assert.equal(await result(), "AP,BQ|AB-PQ"); },
      tumpuk: async () => { assert.equal(await result(), "P|kongruen|pisah"); await button("Tumpuk di atas ABCD").click(); assert.equal(await result(), "P|kongruen|tumpuk"); await radio("R (sisi diperpanjang)", "Bangun calon").click(); assert.equal(await result(), "R|tidak|pisah"); },
      segitiga: async () => { assert.equal(await result(), "Sisi-Sudut-Sisi|1"); await radio("Sisi-Sisi-Sudut", "Kriteria").click(); assert.equal(await result(), "Sisi-Sisi-Sudut|2"); },
      bukti: async () => { assert.equal(await result(), "0|5"); await button("ΔRCE ≅ ΔRCA").click(); await page.getByRole("alert").filter({ hasText: "Belum bisa" }).waitFor(); assert.equal(await result(), "0|5");
        for (const st of ["EC ≅ AC", "ER ≅ AR", "RC ≅ RC", "ΔRCE ≅ ΔRCA", "∠E ≅ ∠A"]) await button(st).click(); assert.equal(await result(), "5|5"); },
      geser: async () => { assert.equal(await result(), "Pergeseran|3,5,4|ya"); await radio("Dilatasi", "Transformasi").click(); assert.equal(await result(), "Dilatasi|6,10,8|tidak"); },
      foto: async () => { assert.equal(await result(), "10|15|ya"); await press("Panjang cetakan tambah", 1); assert.equal(await result(), "10|16|tidak"); },
      bayangan: async () => { assert.equal(await result(), "160|200|1000|800"); await press("Bayangan pohon tambah", 1); assert.equal(await result(), "160|200|1050|840"); },
      dilatasi: async () => { assert.equal(await result(), "2|2|4"); await press("Faktor skala k kurangi", 1); assert.equal(await result(), "1.5|1.5|2.25"); },
      unsur: async () => { assert.equal(await result(), "1.5|Garis tinggi|1.5"); await radio("Garis berat", "Garis").click(); assert.equal(await result(), "1.5|Garis berat|1.5"); },
    };
    /** Jawaban salah yang disengaja: ubah bagian pertama. */
    const wrongOf = q => { const v = q.answer.split(SEP), p = q.parts[0], x = cells(p, v[0]);
      if (p.kind === "num") v[0] = String(Number(v[0].replace(",", ".")) + 1); else if (p.kind === "choice") v[0] = p.options.find(o => o !== v[0]);
      else if (p.kind === "match") { [x[0], x[1]] = [x[1], x[0]]; v[0] = x.join("|"); } else { x[0] = p.kind === "row" ? String(Number(x[0]) + 1) : x[0]; v[0] = x.join("|"); }
      return v.join(SEP); };
    for (const [k, sec] of sections.entries()) {
      if (k === 0 || sec.topic !== sections[k - 1].topic) await button(`${sec.topic.code}. ${sec.topic.title}`).click();
      await page.getByRole("tab", { name: `${sec.code} ${sec.title}`, exact: true }).click();
      await labChecks[sec.lab](); await fit(`lab ${sec.lab}`); await shot(`lab-${sec.code}`);
      await button(`Latihan ${sec.code}`).click();
      let wrong = 0;
      for (const [j, q] of practice[k].entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${k}-${j}`);
        const miss = k === 0 && j === 0;
        await answer(q, miss ? wrongOf(q) : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? wrongOf(q) : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar .*DE ↔ NL/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 12 bab 4 at ${width}px: 9 peraga (memasangkan titik, menumpuk bangun, kriteria segitiga, menyusun bukti, transformasi, foto, bayangan pohon, dilatasi, unsur segitiga), 36 latihan (1 salah disengaja), 24 evaluasi termasuk memasangkan sisi, skor dan pembahasan`);
  }
} finally { await browser.close(); }
