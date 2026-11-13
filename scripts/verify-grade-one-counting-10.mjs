import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, chainValues, numberWords } from "../src/data/grade-one-counting-10.ts";

assert.equal(topics.length, 4); assert.deepEqual(topics.map(t => t.sections.length), [2, 2, 2, 2]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 8, "peraga berbeda di setiap bagian");
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 6, 1: 6, 2: 6, 3: 6 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)));

const val = it => (it.t === "objs" ? it.g.n : it.t === "frame" || it.t === "num" ? it.n : it.t === "hand" ? it.fingers.reduce((a, b) => a + b, 0) : numberWords.indexOf(it.w.toLowerCase()));
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
    if (p.kind === "match") {
      const sumTo = /jumlahnya (\d+)/.exec(q.prompt);
      p.left.forEach((l, k) => { const want = p.right.findIndex(r => (sumTo ? val(l) + val(r) === Number(sumTo[1]) : val(r) === val(l)));
        assert.equal(p.answer[k], want, `${q.prompt} kiri ${k}`); assert.equal(p.right.filter(r => (sumTo ? val(l) + val(r) === Number(sumTo[1]) : val(r) === val(l))).length, 1, "pasangan tunggal");
        const g = [...f]; g[k] = String((Number(g[k]) + 1) % p.right.length); wrong(g.join("|")); });
      rechecked++;
    }
    if (p.kind === "color") { wrong(Array.from({ length: p.n - 1 }, (_, k) => k).join(",")); wrong(Array.from({ length: p.n + 1 }, (_, k) => k).join(",")); assert.ok(p.n < p.total); }
    if (p.kind === "seq") {
      const known = p.cells.map((c, k) => [c, k]).filter(([c]) => c !== null), step = (known[1][0] - known[0][0]) / (known[1][1] - known[0][1]);
      assert.ok(step === 1 || step === -1, q.prompt);
      const full = p.cells.map((_, k) => known[0][0] + (k - known[0][1]) * step);
      p.cells.forEach((c, k) => c !== null && assert.equal(c, full[k]));
      assert.deepEqual(p.answers, full.filter((_, k) => p.cells[k] === null)); rechecked++;
      f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k]) + 1); wrong(g.join("|")); });
    }
    if (p.kind === "bond") { assert.equal(p.parts[0] + p.parts[1], p.whole);
      if (q.scene?.type === "groups") assert.deepEqual(q.scene.groups.map(gr => gr.n), p.parts, `gambar sesuai pasangan ${q.prompt}`);
      if (q.scene?.type === "objs") { assert.equal(q.scene.g.n, p.whole); assert.deepEqual([q.scene.g.split, q.scene.g.n - q.scene.g.split], p.parts); }
      f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k]) + 1); wrong(g.join("|")); });
      if (p.hide[1] && p.hide[2]) assert.ok(correct(q, swap(i, [...f.slice(0, f.length - 2), f.at(-1), f.at(-2)].join("|"))), "urutan bagian boleh dibalik");
      rechecked++; }
    if (p.kind === "bonds") { wrong(["1", String(p.whole - 2), ...f.slice(2)].join("|")); wrong(["0", String(p.whole), ...f.slice(2)].join("|")); if (p.k > 1) wrong(Array.from({ length: p.k }, () => ["1", String(p.whole - 1)]).flat().join("|")); }
    if (p.kind === "chain") { const [a, b, c] = chainValues(p); assert.ok(a > 0 && b > 0 && c > 0); wrong([a, b, c + 1].join("|")); }
    if (p.kind === "pick") {
      const counts = p.groups.map(g => g.n);
      const want = /lebih banyak/.test(p.label) ? counts.indexOf(Math.max(...counts)) : /lebih sedikit/.test(p.label) ? counts.indexOf(Math.min(...counts))
        : counts.indexOf(q.scene.sets[0].reduce((a, b) => a + b, 0));
      assert.equal(p.answer, want, q.prompt); assert.equal(new Set(counts).size, counts.length, "banyak benda berbeda"); rechecked++;
      counts.forEach((_, k) => k !== p.answer && wrong(String(k)));
    }
    if (p.kind === "dots") wrong([2, 1, ...Array.from({ length: p.n - 2 }, (_, k) => k + 3)].join(","));
  });
  // Pilihan A/B pada kotak bergambar dihitung ulang dari banyak benda.
  if (q.scene?.type === "groups" && q.parts.some(p => p.kind === "choice")) {
    const [a, b] = q.scene.groups.map(g => g.n);
    q.parts.forEach(p => { if (p.kind !== "choice") return;
      if (/lebih banyak/.test(p.label)) assert.equal(p.answer, a > b ? "A" : "B");
      else if (/lebih sedikit/.test(p.label)) assert.equal(p.answer, a < b ? "A" : "B");
      else assert.equal(p.answer, a === b ? "Ya, sama banyak" : "Tidak sama banyak"); });
    rechecked++;
  }
  if (q.scene?.type === "story") { const [x, y] = q.scene.people; q.parts.forEach(p => p.kind === "choice" && assert.equal(p.answer, /lebih banyak/.test(p.label) === (x.n > y.n) ? x.name : y.name)); rechecked++; }
  if (q.scene?.type === "frames" || q.scene?.type === "hands" && q.parts.every(p => p.kind === "num")) {
    const ns = q.scene.type === "frames" ? q.scene.ns : q.scene.sets.map(s => s.reduce((a, b) => a + b, 0));
    assert.deepEqual(q.parts.map(p => p.value), ns); rechecked++;
  }
  if (q.scene?.type === "shelf") { assert.deepEqual(q.parts.map(p => p.value), q.scene.items.map(g => g.n)); rechecked++; }
  if (q.scene?.type === "objs" && q.parts[0].kind === "num") { assert.equal(q.parts[0].value, q.scene.g.n); rechecked++; }
  if (q.scene?.type === "pairs") { const { left: l, right: r } = q.scene; assert.equal(q.parts[0].answer, l.n === r.n ? "sama banyak dengan" : l.n > r.n ? "lebih banyak dari" : "lebih sedikit dari"); rechecked++; }
}
// Bonds terbuka menerima pasangan apa pun yang benar, termasuk urutan terbalik.
const b8 = assessment.find(q => q.parts[0].kind === "bonds");
assert.ok(correct(b8, "7|1|5|3|4|4")); assert.ok(!correct(b8, "1|7|7|1|4|4"), "pasangan sama tidak boleh diulang");
const answerPos = tally(assessment.flatMap(q => q.parts.filter(p => p.kind === "choice")), p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", JSON.stringify(answerPos));
console.log(`Kunci dihitung ulang: ${rechecked}`);
console.log(`Data Kelas 1 Bab 1 valid: ${all.length} soal.`);
