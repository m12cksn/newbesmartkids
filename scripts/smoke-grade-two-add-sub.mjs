import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells } from "../src/data/grade-two-add-sub.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-two-add-sub-screenshots";
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
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "number") await fill(p.label, x[0]);
        else if (p.kind === "hop") { const d = Number(x[0]) - p.a; await clicks(d > 0 ? "Lompat maju" : "Lompat mundur", Math.abs(d)); await fill("Hasil", x[1]); }
        else if (p.kind === "column") { await fill("Puluhan hasil", x[0]); await fill("Satuan hasil", x[1]); }
        else if (p.kind === "split") {
          if (!p.tensGiven) await fill(`Puluhan dari ${p.a}`, x[0]);
          for (const [k, l] of [[1, `Satuan dari ${p.a}`], [2, "Baris 1 bilangan pertama"], [3, "Baris 1 hasil"], [4, "Baris 2 bilangan kedua"], [5, "Baris 2 hasil"], [6, "Jadi"]]) await fill(l, x[k]);
        } else if (p.kind === "split2") {
          if (!p.tensGiven) { await fill(`Puluhan dari ${p.a}`, x[0]); await fill(`Puluhan dari ${p.b}`, x[2]); }
          for (const [k, l] of [[1, `Satuan dari ${p.a}`], [3, `Satuan dari ${p.b}`], [4, "Hasil puluhan"], [5, "Hasil satuan"], [6, "Jadi"]]) await fill(l, x[k]);
        } else if (p.kind === "story") {
          const k = p.known.length;
          for (const [j, kn] of p.known.entries()) await fill(kn.text.replace("___", "…"), x[j]);
          await page.getByRole("group", { name: "Ditanya" }).getByRole("button", { name: x[k], exact: true }).click();
          for (const [j, st] of p.steps.entries()) {
            const [a, op, b, c] = x[k + 1 + j].split(",");
            await fill(`${st.label} bilangan pertama`, a);
            await page.getByRole("group", { name: `Operasi ${st.label}`, exact: true }).getByRole("button", { name: op === "+" ? "tambah" : "kurang", exact: true }).click();
            await fill(`${st.label} bilangan kedua`, b); await fill(`${st.label} hasil`, c);
          }
          for (const [j, c] of p.conclude.entries()) await fill(c.text.replace("___", "…"), x[k + 1 + p.steps.length + j]);
        } else if (p.kind === "choice") await page.getByRole("group", { name: "Pilihan" }).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    await page.goto(`${origin}/kelas/bermain-angka-kelas-2`);
    await page.getByRole("link", { name: /Penjumlahan dan Pengurangan/ }).first().click();
    await page.getByRole("heading", { name: "Penjumlahan dan Pengurangan", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) {
        assert.equal(await result(), "12"); await button("Bilangan pertama tambah 1").click(); assert.equal(await result(), "13");
        await clicks("Lompat maju", 6); assert.equal(await result(), "19"); assert.ok(await button("Lompat maju").isDisabled());
        await page.getByTestId("lab-result").filter({ hasText: "13 + 6 = 19" }).waitFor();
        await button("Bilangan kedua tambah 1").click(); await page.getByText(/10 satuan dipindah menjadi 1 puluhan, sisa 0 satuan/).waitFor();
      }
      if (t === 1) {
        assert.equal(await result(), "12"); await clicks("Lompat mundur", 8); assert.equal(await result(), "4");
        await clicks("Ambil 1 satuan", 2); assert.ok(await button("Ambil 1 satuan").isDisabled());
        await page.getByText("Satuan tidak cukup. Urai 1 puluhan menjadi 10 satuan.").waitFor();
        await button("Urai 1 puluhan").click(); assert.equal(await result("blocks-result"), "10");
        await clicks("Ambil 1 satuan", 6); assert.equal(await result("blocks-result"), "4"); await page.getByTestId("blocks-result").filter({ hasText: "12 − 8 = 4" }).waitFor();
      }
      if (t === 2) {
        assert.equal(await result("compare-result"), "1|9"); await clicks("Burung hijau tambah 1", 2); assert.equal(await result("compare-result"), "1|11");
        await page.getByTestId("compare-result").filter({ hasText: "1 lebihnya" }).waitFor();
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 0;
        await answer(q, miss ? "11|12" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "18|19" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar 13 \+ 5 = 18/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 2 bab 2 at ${width}px: 3 lab, 12 latihan (1 salah disengaja), 24 evaluasi (lompat, bersusun, pasangan bilangan, soal cerita, pilihan bergambar), skor dan pembahasan`);
  }
} finally { await browser.close(); }
