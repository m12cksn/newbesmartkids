import assert from "node:assert/strict";
import { dailyColumn, COL_OPS, COL_LEVELS, carries, borrows, steps, partials, answerWidth, isCorrect, readColumn, emptyColumn, COUNT, longDivision, borrowTops } from "../src/lib/daily-column.ts";

// Soal berhitung bersusun: 7 soal per jenis dan level, ditentukan tanggal (WIB), kunci benar, dan berganti setiap hari.
const days = Array.from({ length: 60 }, (_, i) => new Date(Date.UTC(2026, 10, 1 + i)).toISOString().slice(0, 10));
let n = 0;
for (const op of COL_OPS.map(o => o.id)) for (const level of COL_LEVELS.map(l => l.id)) {
  let prev = null;
  for (const d of days) {
    const qs = dailyColumn(d, op, level);
    assert.equal(qs.length, COUNT, `${op} ${level} ${d}`);
    assert.deepEqual(dailyColumn(d, op, level), qs, "sama untuk tanggal yang sama");
    if (op !== "cerita") assert.equal(new Set(qs.map(q => `${q.a}${q.calc}${q.b}`)).size, COUNT, "tanpa soal kembar");
    for (const q of qs) {
      const exp = q.calc === "tambah" ? q.a + q.b : q.calc === "kurang" ? q.a - q.b : q.calc === "kali" ? q.a * q.b : Math.floor(q.a / q.b);
      if (q.calc === "bagi") { assert.equal(q.rem ?? 0, q.a % q.b, "sisa"); assert.equal(q.withRem, level > 1); assert.equal(Boolean(q.long), level === 3); if (level === 1) assert.equal(q.a % q.b, 0, "Mudah habis dibagi");
        if (q.long) { const st = longDivision(q.a, q.b); assert.ok(st.length >= 1); const L = st.at(-1); assert.equal(Number(String(L.diff) + L.brings.map(j => String(q.a)[j]).join("")), q.a % q.b, "porogapit: sisa terakhir");
          assert.equal(st.reduce((s, x) => s + x.prod / q.b * 10 ** (String(q.a).length - 1 - x.end), 0), q.answer, "porogapit: hasil bagi dari langkah");
          st.forEach(x => { assert.ok(x.diff < q.b && x.prod % q.b === 0); }); } }
      if (q.calc === "kurang") { const t = borrowTops(q.a, q.b), top = String(q.a).split("").map((d, i) => t[i] ?? Number(d)), bot = String(q.b).padStart(String(q.a).length, "0").split("").map(Number);
        assert.ok(top.every((v, i) => v >= bot[i] && v <= 19), `pinjaman ${q.a}-${q.b}`); assert.equal(Number(top.map((v, i) => v - bot[i]).reduce((s, d) => s * 10 + d, 0)), q.answer, "pinjaman menghasilkan jawaban"); }
      assert.equal(q.answer, exp, JSON.stringify(q)); assert.ok(Number.isInteger(q.answer) && q.answer > 0);
      if (q.calc === "tambah") assert.ok(carries(q.a, q.b) >= 1, "ada simpanan");
      if (q.calc === "kurang") assert.ok(borrows(q.a, q.b) >= 1, "ada pinjaman");
      if (q.calc === "kali" && q.b >= 10) assert.equal(partials(q).reduce((s, x) => s + x, 0), q.answer);
      assert.ok(steps(q).length >= 1);
      const remOk = String(q.rem ?? 0);
      assert.ok(isCorrect(q, String(q.answer), remOk) && !isCorrect(q, String(q.answer + 1).padStart(answerWidth(q), "0").slice(-answerWidth(q)), remOk));
      if (q.withRem) assert.ok(!isCorrect(q, String(q.answer), String((q.rem ?? 0) + 1)) && !isCorrect(q, String(q.answer), ""), "sisa diperiksa");
      if (q.story) { assert.ok(q.story.includes(String(q.a)) && q.story.includes(String(q.b))); }
      n++;
    }
    if (op === "cerita") assert.equal(new Set(qs.map(q => q.calc)).size, 4, "soal cerita memuat keempat operasi");
    if (prev) assert.notDeepEqual(qs, prev, `${op} ${level} berganti setiap hari`);
    prev = qs;
  }
}
// Tingkat: bilangan makin besar.
const avg = (op, l) => dailyColumn("2026-11-16", op, l).reduce((s, q) => s + q.a, 0);
for (const op of ["tambah", "kurang", "bagi"]) assert.ok(avg(op, 1) < avg(op, 2) && avg(op, 2) < avg(op, 3), `tingkat ${op}`);
assert.ok(dailyColumn("2026-11-16", "kali", 3).every(q => q.b >= 10), "Sulit: pengali dua angka");
// Contoh dari pengguna dan pinjam berantai.
assert.deepEqual(borrowTops(71, 46), [6, 11]);
assert.deepEqual(borrowTops(503, 168), [4, 9, 13]);
assert.deepEqual(longDivision(1044, 12).map(x => [x.end, x.prod, x.diff, x.brings]), [[2, 96, 8, [3]], [3, 84, 0, []]]);
assert.deepEqual(longDivision(1236, 12).map(x => [x.end, x.prod, x.diff]), [[1, 12, 0], [3, 36, 0]]);
const days3 = days.flatMap(d => dailyColumn(d, "bagi", 3));
assert.ok(days3.some(q => q.b >= 11) && days3.some(q => q.b < 10) && days3.some(q => q.rem) && days3.some(q => !q.rem), "porogapit: pembagi satu/dua angka, dengan dan tanpa sisa");
assert.ok(days.flatMap(d => dailyColumn(d, "cerita", 2)).some(q => q.rem && /tersisa/.test(q.story)), "cerita bersisa");
// Penyimpanan.
assert.deepEqual(readColumn(JSON.stringify(emptyColumn("2026-11-16"))), emptyColumn("2026-11-16"));
assert.equal(readColumn("rusak"), null);
console.log(`Berhitung bersusun valid: ${n} soal dalam ${days.length} hari, 5 jenis × 3 level.`);
