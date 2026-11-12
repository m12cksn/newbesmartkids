import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-five-fractions.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-fractions-screenshots";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }); page.setDefaultTimeout(10000);
    const errors = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
    const button = name => page.getByRole("button", { name, exact: true });
    const box = name => page.getByRole("textbox", { name, exact: true });
    const group = name => page.getByRole("group", { name, exact: true });
    const fit = async label => { const s = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth })); assert.ok(s.scroll <= s.inner, `overflow ${width} ${label}: ${JSON.stringify(s)}`); };
    const shot = async name => { if (width === 390 || width === 1280) await page.screenshot({ path: `${folder}/${width}-${name}.png`, fullPage: true }); };
    const result = (id = "lab-result") => page.getByTestId(id).getAttribute("data-value");
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "frac") { await fill(`${p.label} bulat`, x[0]); await fill(`${p.label} pembilang`, x[1]); await fill(`${p.label} penyebut`, x[2]); }
        else if (p.kind === "sign") await group(`Tanda bagian ${i + 1}`).getByRole("button", { name: { "<": "kurang dari", ">": "lebih dari", "=": "sama dengan" }[v[i]], exact: true }).click();
        else if (p.kind === "order") { for (const op of v[i].split(";")) await group(p.label).getByRole("button", { name: op, exact: true }).click(); }
        else if (p.kind === "convert") { for (const [k, l] of ["Dikalikan pertama", "Dikalikan kedua", "Ditambah", "Hasil pembilang", "Hasil penyebut"].entries()) await fill(l, x[k]); }
        else if (p.kind === "equalize") { await fill("KPK", x[0]); for (const [k, f] of p.fracs.entries()) await fill(`Senilai ${f} pembilang`, x[k + 1]); }
        else if (p.kind === "chain") { for (const [k, l] of ["Pecahan pertama pembilang", "Pecahan kedua pembilang", "Hasil bulat", "Hasil pembilang"].entries()) await fill(l, x[k]); }
        else if (p.kind === "split") { for (const [k, l] of ["Hasil bilangan bulat", "Pecahan pertama pembilang", "Pecahan kedua pembilang", "Hasil pecahan pembilang", "Jadi bulat", "Jadi pembilang"].entries()) await fill(l, x[k]); }
        else if (p.kind === "shade") { const g = group(p.label); for (const k of v[i].split(",").filter(Boolean)) await g.getByRole("button", { name: `Bagian ${Number(k) + 1}`, exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.getByRole("link", { name: /Bilangan Pecahan/ }).first().click();
    await page.getByRole("heading", { name: "Bilangan Pecahan", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      assert.equal(await result(), "");
      if (t === 0) { await button("Samakan penyebut").click(); assert.equal(await result(), ">"); await page.getByTestId("lab-result").filter({ hasText: "KPK dari 3 dan 5 adalah 15" }).waitFor(); await button("Pembilang A kurangi").click(); assert.equal(await result(), "", "ubah pecahan mengulang"); await button("Samakan penyebut").click(); assert.equal(await result(), "<"); }
      if (t === 1) { await button("Samakan penyebut").click(); assert.equal(await result(), "5/6"); await button("Pembilang B tambah").click(); await button("Samakan penyebut").click(); assert.equal(await result(), "7/6"); await page.getByTestId("lab-result").getByLabel("1 1 per 6").waitFor(); }
      if (t === 2) { await button("Samakan penyebut").click(); assert.equal(await result(), "1/6"); await button("Pembilang B tambah").click(); await page.getByText("Pecahan A lebih kecil dari B.", { exact: false }).waitFor(); }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 1;
        await answer(q, miss ? "2|5||6" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? q.answer.replace("‖>‖", "‖<‖").replace("‖<‖", "‖>‖") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Gambar kiri 7\/12 \| 7\/12 < 10\/12/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 3 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (arsir, tanda, urutkan, ubah campuran, samakan penyebut, bersusun pecahan, benar-salah), skor dan pembahasan`);
  }
} finally { await browser.close(); }
