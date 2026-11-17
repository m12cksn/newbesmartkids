// Verifikasi Mastering Pembagian Garis: langkah garis per kolom, batas garis, kolam soal dan paket harian.
// Jalankan: node --experimental-strip-types scripts/verify-daily-pembagian-garis.mjs
import assert from "node:assert/strict";
import { checkProblem, columns, dailyQuestions, LEVELS, lesson, MAX_LINES, pool, steps, storageKey } from "../src/lib/daily-pembagian-garis.ts";

// Contoh dari sumber: 756 : 3 = 252 dengan kolom 7 | 15 | 6.
assert.deepEqual(columns(756, 3).map(c => [c.lines, c.groups, c.rem]), [[7, 2, 1], [15, 5, 0], [6, 2, 0]]);
assert.equal(lesson(756, 3).length, 8);

// Setiap soal yang boleh diperagakan: garis diikat dengan benar dan hasil per kolom membentuk hasil bagi.
let checked = 0;
for (let q = 2; q <= 9; q++) for (let n = 10; n <= 999; n++) {
  if (checkProblem(n, q)) continue;
  const cols = columns(n, q);
  for (const c of cols) { assert.equal(c.groups * q + c.rem, c.lines); assert.ok(c.rem < q); assert.ok(c.lines <= MAX_LINES); }
  assert.equal(cols.at(-1).rem, 0, `${n}:${q} bersisa`);
  assert.equal(Number(cols.map(c => c.groups).join("")), n / q, `${n}:${q}`);
  const st = steps(n, q); assert.equal(st.length, 2 + 2 * cols.length); assert.ok(st.at(-1).includes(`${n} : ${q} = ${n / q}`), `${n}:${q} langkah terakhir`);
  checked++;
}
assert.ok(checkProblem(757, 3) && checkProblem(9, 3) && checkProblem(1000, 2) && checkProblem(96, 1));

// Kolam soal per level
const p1 = pool(1), p2 = pool(2), p3 = pool(3);
assert.ok(p1.length >= 50 && p2.length >= 100 && p3.length >= 100, `${p1.length} ${p2.length} ${p3.length}`);
assert.ok(p1.every(([n, q]) => q <= 5 && columns(n, q).every(c => c.carryIn === 0)), "level 1 tanpa sisa pindah");
assert.ok(p2.every(([n, q]) => q <= 5 && columns(n, q).some(c => c.carryIn > 0)), "level 2 ada sisa pindah");
assert.ok(new Set(p3.map(([, q]) => q)).size === 8, "level 3 memakai pembagi 2–9");
assert.equal(new Set(LEVELS.map(l => storageKey(l.id))).size, 3);

// Paket harian: 7 soal, tetap sepanjang hari, berganti setiap hari
const base = Date.parse("2026-01-01T00:00:00Z");
for (const level of [1, 2, 3]) {
  let prev = null;
  for (let d = 0; d < 400; d++) {
    const date = new Date(base + d * 86400000).toISOString().slice(0, 10), qs = dailyQuestions(date, level);
    assert.equal(qs.length, 7); assert.deepEqual(qs, dailyQuestions(date, level), "deterministik");
    const keys = qs.map(q => q.fact.join(":")); assert.equal(new Set(qs.map(q => q.left)).size, 7, `${date} L${level}: soal kembar`);
    for (const q of qs) {
      assert.equal(q.left / q.right, q.result); assert.equal(q.answer, [q.left, q.right, q.result][q.blank]);
      assert.ok(pool(level).some(([n, d2]) => n === q.left && d2 === q.right), `${date} L${level}: ${q.left}:${q.right} di luar level`);
      if (level < 3) assert.equal(q.blank, 2);
    }
    if (level === 3) assert.ok(qs.some(q => q.blank !== 2));
    if (prev) assert.notEqual(keys.join(), prev, `${date} L${level}: sama dengan kemarin`);
    prev = keys.join();
  }
}
console.log(`Pembagian garis OK: ${checked} soal diperagakan, level ${p1.length}/${p2.length}/${p3.length}, 3 level × 400 hari paket harian`);
