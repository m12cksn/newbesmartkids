import assert from "node:assert/strict";
import { dailyColumn, COL_OPS, COL_LEVELS, carries, borrows, steps, partials, answerWidth, isCorrect, readColumn, emptyColumn, COUNT } from "../src/lib/daily-column.ts";

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
      const exp = q.calc === "tambah" ? q.a + q.b : q.calc === "kurang" ? q.a - q.b : q.calc === "kali" ? q.a * q.b : q.a / q.b;
      assert.equal(q.answer, exp, JSON.stringify(q)); assert.ok(Number.isInteger(q.answer) && q.answer > 0);
      if (q.calc === "tambah") assert.ok(carries(q.a, q.b) >= 1, "ada simpanan");
      if (q.calc === "kurang") assert.ok(borrows(q.a, q.b) >= 1, "ada pinjaman");
      if (q.calc === "kali" && q.b >= 10) assert.equal(partials(q).reduce((s, x) => s + x, 0), q.answer);
      assert.ok(steps(q).length >= 1);
      assert.ok(isCorrect(q, String(q.answer)) && !isCorrect(q, String(q.answer + 1).padStart(answerWidth(q), "0").slice(-answerWidth(q))));
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
// Penyimpanan.
assert.deepEqual(readColumn(JSON.stringify(emptyColumn("2026-11-16"))), emptyColumn("2026-11-16"));
assert.equal(readColumn("rusak"), null);
console.log(`Berhitung bersusun valid: ${n} soal dalam ${days.length} hari, 5 jenis × 3 level.`);
