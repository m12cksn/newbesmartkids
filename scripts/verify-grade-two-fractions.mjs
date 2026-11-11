import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, pieces, equalParts, showsFraction, foldResult } from "../src/data/grade-two-fractions.ts";

assert.equal(topics.length, 3);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 8, 1: 8, 2: 8 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
for (let i = 1; i < 24; i++) assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + q.answer)).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 8, JSON.stringify(kinds));
const interactive = assessment.filter(q => q.parts.some(p => ["shade", "fold", "mark", "sort", "check", "pick", "share"].includes(p.kind))).length;
assert.ok(interactive >= 16, `interaktif ${interactive}`);
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));

const half = f => f.t === "frac" ? showsFraction(f, 2) : f.a === f.b;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const d = q.topic === 2 ? 4 : 2;
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const w = [...v];
    if (p.kind === "number") w[i] = String(p.answer + 1);
    if (p.kind === "choice") { assert.equal(p.figs.length, p.options.length); w[i] = p.options.find(o => o !== p.answer); const ok = p.figs.map(f => showsFraction(f, d)); assert.deepEqual(ok.map((x, k) => x ? p.options[k] : null).filter(Boolean), [p.answer], q.prompt); }
    if (p.kind === "shade") { const ps = pieces(p.base, p.lines); assert.ok(equalParts(ps), `bagian sama: ${q.prompt}`); assert.equal((ps.length / p.d) % 1, 0); w[i] = p.sample.length > 1 ? p.sample.slice(1).join(",") : "0,1"; }
    if (p.kind === "fold") {
      const r = foldResult(p, v[i]); assert.equal(r.ps.length, p.d);
      // Paling sedikit satu pilihan garis yang salah menghasilkan bagian tidak sama besar.
      const wrong = p.guides.map((_, g) => g).filter(g => { const ps = pieces(p.base, [p.guides[g]]); return !equalParts(ps); });
      assert.ok(wrong.length >= 1, `garis pengecoh: ${q.prompt}`);
      w[i] = `${wrong[0]}/0`;
      // Semua cara benar diterima.
      const n = p.guides.length, combos = [];
      for (let m = 1; m < 1 << n; m++) { const ls = p.guides.map((_, g) => g).filter(g => m & (1 << g)); if (pieces(p.base, ls.map(g => p.guides[g])).length === p.d && equalParts(pieces(p.base, ls.map(g => p.guides[g])))) combos.push(ls.join("+")); }
      assert.ok(combos.length >= 1); combos.forEach(c => assert.ok(correct({ ...q, parts: [p] }, `${c}/0`)));
    }
    if (p.kind === "mark") { p.items.forEach((it, k) => assert.equal(it.fig.t === "frac" ? showsFraction(it.fig, d) : half(it.fig), p.answer[k], `${q.prompt} ${it.name}`)); w[i] = p.answer.map(x => (x ? "n" : "y")).join(","); }
    if (p.kind === "sort") { p.items.forEach((it, k) => assert.equal(showsFraction(it.fig, d), p.answer[k] === 0, `${q.prompt} ${it.name}`)); const a = [...p.answer]; a[0] = 1 - a[0]; w[i] = a.join(","); }
    if (p.kind === "check") { p.items.forEach((it, k) => assert.equal(half(it.fig), p.answer.includes(k), `${q.prompt} ${it.name}`)); w[i] = p.answer.slice(1).join(",") || "1"; }
    if (p.kind === "pick") { assert.equal(p.n % 2, 0); w[i] = p.sample.slice(1).join(","); }
    if (p.kind === "share") { assert.equal(p.n % 2, 0); w[i] = `${p.n / 2 + 1},${p.n / 2 - 1}`; }
    assert.ok(!correct(q, w.join(SEP)), `salah ditolak: ${q.prompt} ${i}`);
    if (p.kind === "number" && /setengah/i.test(q.prompt) && q.fig?.t === "set" && !/sisanya/.test(q.prompt)) assert.equal(p.answer * 2, q.fig.n, q.prompt);
  });
  if (q.fig?.t === "set" && /sisanya/.test(q.prompt)) assert.equal(q.parts[0].answer, q.fig.n / 4);
}
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, ${interactive} interaktif, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
