import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, calc, fields } from "../src/data/grade-two-add-sub.ts";

assert.equal(topics.length, 3);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 8, 1: 8, 2: 8 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) {
  assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
  assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level], `tingkat soal ${i + 1}`);
}
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 7, JSON.stringify(kinds));

const nums = s => (s.match(/\d+/g) ?? []).map(Number);
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP);
    const f = fields(p);
    // Setiap kotak yang salah harus ditolak.
    if (p.kind !== "choice") f.forEach((w, k) => { if (p.kind === "story" && k === p.known.length) return; const g = [...f]; g[k] = p.kind === "story" && k > p.known.length && k <= p.known.length + p.steps.length ? w.replace(/,(\d+)$/, (_, c) => `,${Number(c) + 1}`) : String(Number(w) + 1); assert.ok(!correct(q, swap(g.join("|"))), `kotak ${k} salah ditolak: ${q.prompt}`); });
    if (p.kind === "hop") {
      const r = calc(p.a, p.op, p.b); assert.ok(r >= p.lo && r <= p.hi && p.a >= p.lo && p.a <= p.hi && p.hi - p.lo <= 16, q.prompt);
      assert.ok(!correct(q, swap(`|${r}`)), "hasil tanpa lompat ditolak");
      assert.equal(/maju/.test(q.prompt), p.op === "+"); assert.equal(/mundur/.test(q.prompt), p.op === "-");
    }
    if (p.kind === "column") { const r = calc(p.a, p.op, p.b); assert.ok(r >= 0 && r < 100); if (r < 10) assert.ok(correct(q, swap(`|${r}`)) && correct(q, swap(`0|${r}`))); assert.equal(/penjumlahan/.test(q.prompt), p.op === "+"); }
    if (p.kind === "split") { assert.ok(p.a > 10 && p.a < 20); assert.equal(Number(f[6]), p.a + p.b); }
    if (p.kind === "split2") { assert.ok(p.a > p.b && p.b > 10 && p.a < 20 && p.a - p.b < 10); assert.equal(Number(f[6]), p.a - p.b); }
    if (p.kind === "number") { const m = p.label.match(/^(\d+) ([+−]) (\d+) =$/); if (m) assert.equal(p.answer, m[2] === "+" ? +m[1] + +m[3] : +m[1] - +m[3]); }
    if (p.kind === "story") {
      const said = nums(q.prompt);
      p.known.forEach(k => assert.ok(said.includes(k.answer), `diketahui ${k.text} ada di cerita`));
      assert.ok(p.ask.options.includes(p.ask.answer) && new Set(p.ask.options).size === p.ask.options.length);
      p.steps.forEach(s => s.accept.forEach(([a, op, b, c]) => assert.equal(calc(a, op, b), c, s.label)));
      const results = p.steps.map(s => s.accept[0][3]);
      p.conclude.forEach(c => assert.ok(results.includes(c.answer), `kesimpulan ${c.text}`));
      // Urutan dua bilangan pada penjumlahan boleh ditukar.
      p.steps.forEach((s, j) => { const [a, op, b, c] = s.accept[0]; if (op === "+") { const g = [...f]; g[p.known.length + 1 + j] = `${b},+,${a},${c}`; assert.ok(correct(q, swap(g.join("|"))), "tukar urutan"); } else { const g = [...f]; g[p.known.length + 1 + j] = `${b},-,${a},${c}`; assert.ok(!correct(q, swap(g.join("|"))), "urutan pengurangan tidak boleh ditukar"); } });
      const g = [...f]; g[p.known.length] = p.ask.options.find(o => o !== p.ask.answer); assert.ok(!correct(q, swap(g.join("|"))), "ditanya salah");
    }
    if (p.kind === "choice") {
      assert.ok(p.options.includes(p.answer)); assert.ok(!correct(q, swap(p.options.find(o => o !== p.answer))));
      const k = p.options.indexOf(p.answer);
      if (p.pots) { const m = q.prompt.match(/Kira memiliki (\d+) bunga\. Tanaman Tika mempunyai (\d+) bunga lebihnya/); assert.ok(m); assert.equal(p.pots[k], +m[1] + +m[2]); assert.equal(p.pots.filter(x => x === p.pots[k]).length, 1); }
      if (p.abacus) { const m = q.prompt.match(/hasil (\d+) \+ (\d+)/); assert.equal(p.abacus[k], +m[1] + +m[2]); assert.equal(new Set(p.abacus).size, 4); }
      const eq = q.prompt.match(/^(\d+) − (\d+) = (\d+) − \?/); if (eq) assert.equal(+eq[3] - Number(p.answer.split(" ")[1]), +eq[1] - +eq[2]);
    }
  });
  if (q.scene?.type === "shapes") { const val = Object.fromEntries(q.scene.legend.map(l => [l.shape, l.value])); assert.equal(q.parts[0].answer, q.scene.row.reduce((s, x) => s + val[x], 0)); }
  if (q.scene?.type === "groups") q.scene.groups.forEach(g => { if (g.n !== null) assert.ok(nums(q.prompt).includes(g.n), `gambar ${g.who}`); });
}
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.equal(new Set(pos).size, pos.length, `posisi pilihan ${pos}`);
const askPos = all.flatMap(q => q.parts.filter(p => p.kind === "story").map(p => p.ask.options.indexOf(p.ask.answer)));
assert.equal(new Set(askPos).size, 3, `posisi ditanya ${askPos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}, posisi ditanya ${askPos.join("")}.`);
