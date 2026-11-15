import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, NONE } from "../src/data/grade-nine-absolute.ts";

assert.equal(topics.length, 3); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "B.1", "B.2", "C.1", "C.2"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 6, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 200 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 6); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 8, B: 8, C: 8 });
sections.forEach((_, t) => assert.ok(assessment.some(q => q.topic === t), `bagian ${t} diuji di evaluasi`));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)));
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","), JSON.stringify(tally(pos.map(String), x => x)));

const near = (a, b) => Math.abs(a - b) < 1e-7;
const grid = []; for (let k = -40 * 120; k <= 40 * 120; k++) grid.push(k / 120);
const inside = (p, x) => { const { shape, a, b, closed } = p;
  switch (shape) { case "antara": return closed ? x >= a && x <= b : x > a && x < b; case "luar": return closed ? x <= a || x >= b : x < a || x > b;
    case "kiri": return closed ? x <= a : x < a; case "kanan": return closed ? x >= a : x > a; case "semua": return true; case "kosong": return false; } };
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "solset") {
      // Semua akar f pada grid halus harus tepat sama dengan kunci.
      p.values.forEach(r => assert.ok(near(p.f(r), 0), `akar ${r}: ${q.prompt}`));
      const roots = []; const add = r => { if (!roots.some(o => near(o, r))) roots.push(r); };
      for (let k = 0; k < grid.length; k++) { const x = grid[k], y = p.f(x); if (near(y, 0)) add(x); else if (k && Math.sign(y) !== Math.sign(p.f(grid[k - 1])) && !near(p.f(grid[k - 1]), 0)) { let lo = grid[k - 1], hi = x; for (let it = 0; it < 80; it++) { const m = (lo + hi) / 2; if (Math.sign(p.f(m)) === Math.sign(p.f(lo))) lo = m; else hi = m; } add((lo + hi) / 2); } }
      assert.equal(roots.length, p.values.length, `banyak akar ${q.prompt}: ${roots}`); p.values.forEach(r => assert.ok(roots.some(o => near(o, r)))); rechecked++;
      if (p.values.length) { wrong(NONE); wrong(p.values.slice(1).map(String).join("; ") || "0"); wrong([...p.values, p.values[0] + 1].join("; ")); assert.ok(correct(q, swap(i, [...p.values].reverse().map(String).join(" ; ")))); }
      else wrong("0");
    }
    if (p.kind === "interval") {
      grid.forEach(x => assert.equal(!!p.test(x), inside(p, x), `interval ${q.prompt} di x=${x}`));
      [p.a, p.b].filter(x => x !== undefined).forEach(x => assert.equal(!!p.test(x), inside(p, x), `batas ${x}`)); rechecked++;
      const x = f; ["antara", "luar", "kiri", "kanan", "semua", "kosong"].filter(s => s !== p.shape).forEach(s => wrong([s, x[1], x[2], x[3]].join("|")));
      if (x[3]) wrong([x[0], x[1], x[2], x[3] === "tutup" ? "buka" : "tutup"].join("|"));
      if (x[1]) wrong([x[0], String(num(x[1]) - 1), x[2], x[3]].join("|"));
    }
    if (p.kind === "piece") {
      for (const x of [p.t - 3, p.t - 0.5, p.t, p.t + 0.5, p.t + 3]) { const val = x >= p.t ? p.a1 * x + p.b1 : p.a2 * x + p.b2; assert.ok(near(val, Math.abs(p.a1 * x + p.b1)), `bentuk ${p.expr} di ${x}`); }
      assert.ok(p.a1 > 0, `cabang x ≥ t harus naik: ${p.expr}`); rechecked++;
      f.forEach((c, k) => { const g = [...f]; g[k] = String(num(c) + 1); wrong(g.join("|")); });
    }
    if (p.kind === "tbl") f.forEach((c, k) => { const g = [...f]; g[k] = String(num(c) + 1); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
assert.equal(num("2/3"), 2 / 3); assert.equal(num("−4"), -4); assert.equal(num("1,5"), 1.5);
console.log(`Penyelesaian dan interval dihitung ulang pada grid halus: ${rechecked}`);
console.log(`Data Kelas 9 Bab 5 valid: ${all.length} soal.`);
