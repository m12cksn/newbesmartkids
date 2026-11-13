import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { assessment, practice, topics, SEP, cells, plain, label } from "../src/data/grade-eight-relations.ts";

const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const folder = process.env.CHAPTER_SCREENSHOTS ?? "/tmp/grade-eight-relations-screenshots";
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
        const x = cells(p, v[i]), l = p.label ? plain(p.label) : "";
        if (p.kind === "num") await box(l).fill(v[i]);
        else if (p.kind === "choice") await group(`Pilihan bagian ${i + 1}`).getByRole("button", { name: p.pics ? `Pilihan ${v[i]}` : plain(v[i]), exact: true }).click();
        else if (p.kind === "classify") { for (const [k, r] of p.rows.entries()) await page.getByRole("radiogroup", { name: `Baris ${plain(r.text)}`, exact: true }).getByRole("radio", { name: x[k], exact: true }).click(); }
        else if (p.kind === "tf") { for (const [k, c] of x.entries()) await group(`Pernyataan ${k + 1}`).getByRole("button", { name: c === "B" ? "Benar" : "Salah", exact: true }).click(); }
        else if (p.kind === "pick") { for (const k of v[i].split(",")) await group(l).getByRole("button", { name: label(p.options[Number(k)]), exact: true }).click(); }
        else if (p.kind === "arrows") { const g = group(l); for (const pr of v[i].split(",")) { const [a, b] = pr.split("-").map(Number); await g.getByRole("button", { name: `Kiri ${label(p.rel.A[a])}`, exact: true }).click(); await g.getByRole("button", { name: `Kanan ${label(p.rel.B[b])}`, exact: true }).click(); } }
        else if (p.kind === "plot") { const g = group(l); for (const pr of v[i].split(",")) { const [a, b] = pr.split("-").map(Number); await g.getByRole("button", { name: `Titik (${label(p.rel.A[a])}, ${label(p.rel.B[b])})`, exact: true }).click(); } }
        else if (p.kind === "table") { for (const [k, xx] of p.xs.entries()) await box(`${p.head}(${label(xx)})`).fill(x[k]); }
        else if (p.kind === "linear") { await box(`${l} a`).fill(x[0]); await box(`${l} b`).fill(x[1]); }
      }
    }
    await page.goto(`${origin}/kelas/hubungan-geometri-kelas-8`);
    await page.locator(`a[href$="/materi/relasi-dan-fungsi"]`).first().click();
    await page.getByRole("heading", { name: "Relasi dan Fungsi", level: 1 }).waitFor();
    await page.getByText("Video pembelajaran segera hadir").waitFor();

    const labChecks = {
      sets: async () => { assert.equal(await result(), "bilangan bulat|5"); await radio("bilangan asli").click(); assert.equal(await result(), "bilangan asli|3"); },
      menu: async () => { assert.equal(await result(), "3"); await page.getByRole("radiogroup", { name: "Pesanan Natalia", exact: true }).getByRole("radio", { name: "rawon", exact: true }).click(); assert.equal(await result(), "4"); },
      repr: async () => { assert.equal(await result(), "kurang dari|7"); await radio("faktor dari").click(); assert.equal(await result(), "faktor dari|4"); },
      isfunc: async () => { assert.equal(await result(), "2|bukan"); await button("Kiri 3").click(); await button("Kanan a").click(); assert.equal(await result(), "3|fungsi"); await button("Kiri 3").click(); await button("Kanan b").click(); assert.equal(await result(), "4|bukan"); },
      count: async () => { assert.equal(await result(), "2|3|9"); await button("Anggota B tambah").click(); assert.equal(await result(), "2|4|16"); },
      taxi: async () => { assert.equal(await result(), "67500"); await button("Jarak (km) tambah").click(); assert.equal(await result(), "70500"); },
      value: async () => { assert.equal(await result(), "4|-3|-11,-7,-3,1,5,9"); await button("a kurangi").click(); assert.equal(await result(), "3|-3|-9,-6,-3,0,3,6"); },
      two: async () => { assert.equal(await result(), "3|−1"); await clicks("f(x₂) tambah", 3); assert.equal(await result(), "4|0"); },
      one: async () => { assert.equal(await result(), "0|belum"); for (const [s, n] of [["Ahmad", 219], ["As'ari", 279], ["Tohir", 292], ["Taufiq", 258], ["Wati", 224]]) { await button(`Kiri ${s}`).click(); await button(`Kanan ${n}`).click(); } assert.equal(await result(), "5|ya"); },
      fact: async () => { assert.equal(await result(), "3|6"); await button("Banyak anggota n tambah").click(); assert.equal(await result(), "4|24"); },
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
        const miss = t === 0 && k === 0;
        await answer(q, miss ? "0,1,2,3,4‖5" : q.answer); if (miss) wrong++;
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
      await answer(q, i === 0 ? "0,1,2,3,4" : q.answer);
      await fit(`evaluasi ${i + 1}`); await shot(`assessment-${String(i + 1).padStart(2, "0")}`);
      await button(i === 23 ? "Lihat hasil" : "Lanjut →").click();
    }
    await page.getByText("Benar 23 · Salah 1 · Skor 96/100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText(/Jawaban benar B = \{−2, −1, 0, 1, 2\}/).waitFor();
    await fit("hasil"); await shot("result");
    assert.deepEqual(errors, []); await page.close();
    console.log(`PASS kelas 8 bab 4 at ${width}px: 10 peraga, 12 latihan (1 salah disengaja), 24 evaluasi (ketuk anggota, tarik panah, titik Cartesius, tabel, rumus, fungsi/bukan, pilihan diagram), skor dan pembahasan`);
  }
} finally { await browser.close(); }
