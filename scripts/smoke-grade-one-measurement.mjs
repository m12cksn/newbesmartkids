import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE,
  args: ["--no-sandbox"],
});
const base = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
const path = "/kelas/matematika-dasar-kelas-1/materi/mengukur-panjang-benda";
const practice = [
  ["Pensil biru", "Tanaman B", "Tanaman C", "B, D, A, C", "Burung B", "Burung C", "B, A, C"],
  ["7", "9", "6", "5", "10", "Kelinci", "8", "11", "Pita biru"],
];
const evaluation = [
  "Pensil merah", "Penggaris hijau", "Menara B", "Menara A",
  "Pohon C", "Pohon B", "C, A, B", "A dan C", "D", "Lebih tinggi", "A",
  "8", "12", "10", "Jam tangan", "9", "7", "5", "2", "2", "A, B, C",
  "Tidak", "Gunakan satuan sama tanpa celah", "Tambahkan satuan yang sama",
];

try {
  for (const width of [320, 390, 768, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, hasTouch: width < 768 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    assert.equal((await page.goto(base + path)).status(), 200);
    const button = name => page.getByRole("button", { name, exact: typeof name === "string" });
    const noOverflow = () => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    await button("Tampilkan satuan bantu").click();
    await page.getByText("9 satuan", { exact: true }).waitFor();

    for (const [i, answers] of practice.entries()) {
      if (i === 1) await button(/^B\. Mengukur/).click();
      await button(/^Latihan Materi/).click();
      for (const [index, answer] of answers.entries()) {
        const check = button("Periksa jawaban");
        assert.equal(await check.isDisabled(), true);
        await button(answer).click();
        await check.click();
        await page.getByText("Tepat!", { exact: true }).waitFor();
        assert.equal(await noOverflow(), true);
        await button(index === answers.length - 1 ? "Selesaikan dan lihat hasil" : "Lanjutkan soal →").click();
      }
      await page.getByText(`Benar ${answers.length} · Salah 0`, { exact: true }).waitFor();
      await button("Kembali ke materi").click();
    }

    await button(/^Evaluasi Bab 7/).click();
    for (const [index, answer] of evaluation.entries()) {
      await page.getByText(`Evaluasi Bab 7 · Soal ${index + 1}/24`, { exact: true }).waitFor();
      const advance = button(index === 23 ? "Selesaikan dan lihat hasil" : "Lanjutkan soal →");
      assert.equal(await advance.count(), 0);
      await button(answer).click();
      assert.equal(await noOverflow(), true);
      await advance.click();
    }
    await page.getByRole("heading", { name: "Hasil Evaluasi Bab 7" }).waitFor();
    await page.getByText("Benar 23 · Salah 1", { exact: true }).waitFor();
    await page.getByText("Skor 96 dari 100", { exact: true }).waitFor();
    await page.getByText("Bahas jawaban yang salah", { exact: true }).click();
    await page.getByText("Jawabanmu: Pensil merah · Jawaban benar: Penggaris hijau", { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Bab 7: ${width}px · 16 latihan · 24 evaluasi · skor 96`);
  }
} finally {
  await browser.close();
}
