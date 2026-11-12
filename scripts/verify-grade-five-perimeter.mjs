import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, perimeter } from "../src/data/grade-five-perimeter.ts";

assert.equal(topics.length, 5);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
const per = tally(assessment, q => q.topic); assert.equal(Object.keys(per).length, 5); Object.values(per).forEach(c => assert.ok(c >= 4 && c <= 5));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) {
  assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
  assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level], `tingkat soal ${i + 1}`);
}
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 6, JSON.stringify(kinds));
const sorted = xs => [...xs].sort((a, b) => a - b).join(",");
const nums = s => (s.match(/\d+/g) ?? []).map(Number);

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), sc = q.scene;
  const shape = sc?.type === "shape" ? sc.shape : null;
  if (shape) {
    assert.equal(shape.lens.length, shape.pts.length);
    // Bangun siku-siku: panjang sisi bulat dan sisi berlabel cukup untuk menentukan lebar dan tinggi.
    if (sc.measure) assert.ok(shape.show.some(s => s === "hide"));
    if (shape.frame) { const xs = shape.pts.map(p => p[0]), ys = shape.pts.map(p => p[1]); assert.equal(perimeter(shape), 2 * (Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys)), "keliling = persegi panjang pelingkup"); }
  }
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const bump = k => f.map((x, j) => (j === k ? String(Number(x) + 1) : x)).join("|");
    if (p.kind !== "choice") f.forEach((_, k) => assert.ok(!correct(q, swap(bump(k))), `kotak ${k} ditolak: ${q.prompt}`));
    if (p.kind === "sum") {
      assert.ok(correct(q, swap([...p.sides].reverse().concat(p.sides.reduce((a, b) => a + b, 0)).join("|"))), "urutan sisi bebas");
      if (shape) assert.equal(sorted(p.sides), sorted(shape.lens), "sisi sesuai gambar");
      if (sc?.type === "field") assert.equal(sorted(p.sides), sorted([sc.w, sc.h, sc.w, sc.h]));
    }
    if (p.kind === "mult") { assert.ok(correct(q, swap(`${p.s}|${p.n}|${p.n * p.s}`))); if (shape) { assert.equal(shape.lens.length, p.n); assert.ok(shape.lens.every(l => l === p.s)); } }
    if (p.kind === "rectf") { assert.ok(correct(q, swap(`${p.b}|${p.a}|${2 * p.b}|${2 * p.a}|${2 * (p.a + p.b)}`)), "urutan pasangan bebas"); if (shape) { assert.equal(2 * (p.a + p.b), perimeter(shape)); } }
    if (p.kind === "fill") p.items.forEach(it => { assert.ok(shape && it.side !== undefined, it.label); assert.equal(shape.show[it.side], "?"); assert.equal(shape.lens[it.side], it.answer, it.label); });
    if (p.kind === "number") {
      const L = p.label;
      if (/Keliling/.test(L)) assert.equal(p.answer, perimeter(shape), q.prompt);
      else if (/Panjang sisi/.test(L)) { const [k] = nums(q.prompt).filter(x => x > 20); assert.equal(p.answer * (/segi enam/.test(q.prompt) ? 6 : 3), k); }
      else if (/kaki/.test(L)) { const [k, alas] = nums(q.prompt); assert.equal(2 * p.answer + alas, k); }
      else if (/Lebar/.test(L)) { const [k, pj] = nums(q.prompt); assert.equal(2 * (pj + p.answer), k); }
      else if (/kayu/.test(L)) { const n = nums(q.prompt); assert.equal(p.answer, 2 * (n[0] + n[1]) + 2 * (n[2] + n[3]) + 4 * n[4]); }
      else assert.fail(L);
    }
    if (p.kind === "choice") {
      assert.ok(p.options.includes(p.answer)); assert.ok(!correct(q, swap(p.options.find(o => o !== p.answer))));
      if (sc?.type === "shapes") { const ps = sc.items.map(it => perimeter(it.shape)); assert.equal(new Set(ps).size, ps.length); assert.equal(sc.items[ps.indexOf(Math.max(...ps))].caption, p.answer.replace(/^Kebun|^Segitiga/, m => m)); }
    }
    if (p.kind === "table") p.rows.forEach(r => assert.ok(/Persegi|lima|enam|delapan/.test(r.name)) || r.n);
  });
}
const pos = all.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 2, `posisi pilihan ${pos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, per subtopik ${JSON.stringify(per)}, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
