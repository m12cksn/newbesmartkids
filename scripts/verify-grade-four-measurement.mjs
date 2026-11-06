import assert from "node:assert/strict";
import { assessment, practice, correct, totalCells } from "../src/data/grade-four-measurement.ts";

const keys = [
  "Penghapus kecil|Klip kertas besar", "20", "2,35", "Meja persegi 1 m × 1 m", "24", "4,375",
  "Gagang sapu|Gitar akustik ukuran penuh", "(8 × 2) + (5 × 2)", "3,35", "cm²", "30", "8,25",
  "Baterai AA|Pensil yang sudah pendek", "33", "Bagi 6.480 dengan 1.000", "m²", "18", "3,34",
  "Panjang penggaris meter|Lebar meja belajar", "(9 × 3) + (5 × 2) + 2", "9,045", "Sampul buku tulis", "35", "8,475",
];
assert.equal(assessment.length, 24);
assert.deepEqual(practice.map(set => set.length), [3, 3, 3, 4]);
assert.deepEqual(assessment.map(q => q.answer), keys);
assert.deepEqual(practice.flat().map(q => q.answer), ["12", "16", "(7 × 2) + (3 × 2)", "m²", "15", "30000", "2 cangkir", "Teko B", "2 gelas", "1,75", "12", "2,35", "2,125"]);
assert.deepEqual([...new Set(assessment.map(q => q.source))].sort(), [1,2,3,4,5,6,7]);

for (const q of [...practice.flat(), ...assessment]) {
  assert.equal(correct(q, ""), false);
  if (q.cubes) assert.equal(q.cubes.reduce((a,b) => a*b,1), Number(q.answer));
  if (q.rows && !q.options) assert.equal(totalCells(q.rows), Number(q.answer));
  if (q.action === "tiles") {
    const cols = Math.max(...q.rows);
    const cells = q.rows.flatMap((width, row) => Array.from({length: width}, (_, col) => row * cols + col));
    assert.ok(correct(q, cells.join("|")));
    assert.ok(!correct(q, cells.slice(1).join("|")));
    assert.ok(!correct(q, [...cells.slice(1), cols * q.rows.length].join("|")));
  } else {
    assert.ok(correct(q, q.answer));
  }
  if (q.options) {
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(q.answer.split("|").every(option => q.options.includes(option)));
  }
  if (q.action === "decimal") {
    assert.ok(correct(q, q.answer.replace(",", ".")));
    assert.ok(!correct(q, q.answer + ",0"));
  }
}
console.log("PASS: 37 answer keys, seven source groups, grid selections, decimal validation");
