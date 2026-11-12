import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, primeFactors, factorsOf, months } from "../src/data/grade-five-kpk-fpb.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-five-kpk-fpb-screenshots";
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
    const clicks = async (name, n) => { for (let k = 0; k < n; k++) await button(name).click(); };
    async function answer(q, value = q.answer) {
      const v = value.split(SEP);
      for (const [i, p] of q.parts.entries()) {
        const x = cells(p, v[i]);
        const fill = async (label, val) => { if (val !== "") await box(label).fill(val); };
        if (p.kind === "number") await fill(p.label, x[0]);
        else if (p.kind === "grid") { for (const k of v[i].split(",").filter(Boolean)) await group(p.label).getByRole("button", { name: k, exact: true }).click(); }
        else if (p.kind === "list") { for (const [k, val] of x.entries()) await fill(`${p.label} ke-${k + 1}`, val); }
        else if (p.kind === "rainbow") { for (const [k, val] of x.entries()) await fill(`Faktor ${p.n} ke-${k + 2}`, val); }
        else if (p.kind === "cut") { for (const [k, l] of p.lengths.entries()) await fill(`Potongan panjang ${l}`, x[k]); }
        else if (p.kind === "congklak") {
          for (const [k, list] of [x[0], x[1]].entries()) { await page.getByRole("radio", { name: new RegExp(`^Biji pemain ${k + 1}`) }).click(); for (const h of list.split(",").filter(Boolean)) await button(`Lubang ${h}`).click(); }
          await fill(`FPB dari ${p.a} dan ${p.b}`, x[2]);
        } else if (p.kind === "rows") { for (const val of x[0].split(",").filter(Boolean)) await group(`Kelipatan ${p.nums[0]}`).getByRole("button", { name: val, exact: true }).click(); await fill(`KPK dari ${p.nums.join(" dan ")}`, x[1]); }
        else if (p.kind === "calendar") {
          const m = months[p.month].name;
          await page.getByRole("radio", { name: `Tandai jadwal ${p.who[0]}` }).click(); await button(`${p.start} ${m}`).click();
          assert.equal(await button(`${p.start} ${m}`).getAttribute("aria-pressed"), "false", "tandai jadwal bukan jawaban");
          await page.getByRole("radio", { name: "Pilih tanggal jawaban" }).click(); await button(`${v[i]} ${m}`).click();
        } else if (p.kind === "tree") {
          const ps = v[i].split(",").map(Number); if (width === 390) { await button("Bagi dengan 13").click(); await page.getByText(/tidak habis dibagi 13/).waitFor(); }
          for (const pr of ps.slice(0, -1)) await button(`Bagi dengan ${pr}`).click();
        } else if (p.kind === "factorize") {
          for (const [k, n] of p.nums.entries()) for (const pr of x[k].split(",").filter(Boolean)) await group(`Faktor prima ${n}`).getByRole("button", { name: pr, exact: true }).click();
          await fill("KPK", x[2]); await fill("FPB", x[3]);
        } else if (p.kind === "ladder") {
          const k = x.length - 2;
          for (let r = 0; r < k; r++) { const row = x[r].split(","); await fill(`Baris ${r + 1} pembagi`, row[0]); for (const [c, n] of p.nums.entries()) await fill(`Baris ${r + 1} hasil ${n}`, row[c + 1]); }
          await fill("KPK", x[k]); await fill("FPB", x[k + 1]);
        } else if (p.kind === "time") { await fill("Jam", x[0]); await fill("Menit", x[1]); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: v[i], exact: true }).click();
      }
    }
    if (width === 320) { await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5/kpk-fpb`); await page.waitForURL(/\/materi\/kpk-dan-fpb$/); }
    await page.goto(`${origin}/kelas/pecahan-dan-pengukuran-kelas-5`);
    await page.getByRole("link", { name: /KPK dan FPB/ }).first().click();
    await page.getByRole("heading", { name: "KPK dan FPB", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    for (const [t, set] of practice.entries()) {
      if (t > 0) await button(`${topics[t].code}. ${topics[t].title}`).click();
      if (t === 0) { assert.equal(await result(), "0"); await button("3").click(); await button("6").click(); await button("4").click(); assert.equal(await result(), "2"); await page.getByText(/1 kotak merah bukan kelipatan 3/).waitFor(); }
      if (t === 1) { assert.equal(await result(), "12"); await button("Bilangan A tambah").click(); assert.equal(await result(), "4"); await button("Bilangan A tambah").click(); assert.equal(await result(), "20"); }
      if (t === 2) { await button("Catat potongan").click(); assert.equal(await result(), "1"); await button("Tiap bagian tambah").click(); await button("Catat potongan").click(); assert.equal(await result(), "2"); await button("Tiap bagian tambah").click(); await button("Tiap bagian tambah").click(); assert.ok(await button("Catat potongan").isDisabled(), "panjang 5 bersisa"); }
      if (t === 3) {
        for (const [k, n] of [[1, 12], [2, 18]]) { await page.getByRole("radio", { name: `Biji pemain ${k}` }).click(); for (const h of factorsOf(n)) await button(`Lubang ${h}`).click(); }
        assert.equal(await result(), "4"); await page.getByTestId("lab-result").filter({ hasText: "FPB dari 12 dan 18 adalah 6" }).waitFor();
      }
      if (t === 4) { await button("Bagi dengan 7").click(); await page.getByText("300 tidak habis dibagi 7. Coba bilangan prima lain.").waitFor(); for (const p of [2, 2, 3, 5]) await button(`Bagi dengan ${p}`).click(); assert.equal(await result(), primeFactors(300).join(",")); }
      if (t === 5) {
        assert.equal(await result(), ""); await button("Bagi dengan 5").click(); await page.getByText("Tidak ada bilangan yang habis dibagi 5. Coba prima lain.").waitFor();
        for (const p of [2, 2, 3, 3]) await button(`Bagi dengan ${p}`).click();
        assert.equal(await result(), "36|6"); await page.getByTestId("lab-result").filter({ hasText: "2 × 3 = 6" }).waitFor();
        await button("8, 12, 20").click(); for (const p of [2, 2, 2, 3, 5]) await button(`Bagi dengan ${p}`).click(); assert.equal(await result(), "120|4");
      }
      await fit(`lab ${t}`); await shot(`lab-${topics[t].code}`);
      await button("Latihan materi").click();
      let wrong = 0;
      for (const [k, q] of set.entries()) {
        assert.ok(await button("Periksa jawaban").isDisabled(), `gating ${t}-${k}`);
        const miss = t === 1 && k === 3;
        await answer(q, miss ? "30" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? q.answer.split(",").slice(1).join(",") : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar Kelipatan 7: 7, 14, 21/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 5 bab 2 at ${width}px: 6 lab, 24 latihan (1 salah disengaja), 24 evaluasi (tabel, potong kertas, congklak, kalender, pohon faktor, pembagian berulang), skor dan pembahasan`);
  }
} finally { await browser.close(); }
