// Verifikasi Mastering Jarimatika: langkah jari untuk semua perkalian 1–10 dan paket harian per level.
// Jalankan: node --experimental-strip-types scripts/verify-daily-jarimatika.mjs
import assert from "node:assert/strict";
import { dailyQuestions, LEVELS, lipatParts, loncatParts, methodFor, pool, steps, tempelParts, storageKey } from "../src/lib/daily-jarimatika.ts";

// Setiap perkalian 1–10 punya cara jari yang menghasilkan jawaban benar.
const used = { tempel: 0, lipat9: 0, loncat: 0 };
for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) {
  const m = methodFor(a, b); used[m]++;
  if (m === "tempel") { const p = tempelParts(a, b); assert.ok(a >= 6 && b >= 6); assert.equal(p.tens + p.units, a * b, `${a}×${b}`); assert.ok(p.downL >= 1 && p.downR >= 1 && p.upL >= 0 && p.upR >= 0); }
  if (m === "lipat9") { const n = a === 9 ? b : a, p = lipatParts(n); assert.ok(n <= 5); assert.equal(p.left * 10 + p.right, a * b, `${a}×${b}`); }
  if (m === "loncat") { const p = loncatParts(a, b); assert.ok(p.fingers <= 5, `${a}×${b}: jari lebih dari 5`); assert.equal(p.totals.at(-1), a * b); }
  const st = steps(a, b); assert.ok(st.at(-1).includes(`= ${a * b}`), `${a}×${b}: langkah terakhir`); assert.ok(st.length >= 2);
}
assert.ok(used.tempel === 25 && used.lipat9 > 0 && used.loncat > 0, JSON.stringify(used));

// Kolam soal per level
assert.equal(pool(1).length, 15); assert.equal(pool(2).length, 30); assert.equal(pool(3).length, 45);
assert.ok(pool(1).every(([a, b]) => methodFor(a, b) === "tempel"));
assert.ok(pool(2).every(([a, b]) => methodFor(a, b) !== "tempel"));
assert.equal(new Set(LEVELS.map(l => storageKey(l.id))).size, 3);

// Paket harian: 7 soal, tetap sepanjang hari, berganti setiap hari
const base = Date.parse("2026-01-01T00:00:00Z");
for (const level of [1, 2, 3]) {
  let prev = null;
  for (let d = 0; d < 400; d++) {
    const date = new Date(base + d * 86400000).toISOString().slice(0, 10), qs = dailyQuestions(date, level);
    assert.equal(qs.length, 7);
    assert.deepEqual(qs, dailyQuestions(date, level), "deterministik");
    const keys = qs.map(q => [...q.fact].sort((x, y) => x - y).join("x")); assert.equal(new Set(keys).size, 7, `${date} L${level}: soal kembar`);
    for (const q of qs) {
      const [a, b] = q.fact; assert.equal(q.left * q.right, q.result); assert.equal(q.answer, [q.left, q.right, q.result][q.blank]);
      assert.ok(pool(level).some(([x, y]) => (x === Math.min(a, b) && y === Math.max(a, b))), `${date} L${level}: ${a}×${b} di luar level`);
      if (level < 3) assert.equal(q.blank, 2);
    }
    if (prev) assert.notEqual(keys.join(), prev, `${date} L${level}: sama dengan kemarin`);
    prev = keys.join();
  }
}
assert.throws(() => dailyQuestions("2026-02-30", 1));
console.log(`Jarimatika OK: 100 perkalian (tempel ${used.tempel}, lipat ${used.lipat9}, loncat ${used.loncat}), 3 level × 400 hari paket harian`);
