import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, numberWords } from "../src/data/grade-two-counting-50.ts";

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
const kinds = new Set(assessment.flatMap(q => q.parts.map(p => p.kind)));
assert.ok(kinds.size >= 10, [...kinds].join());

// Kata bilangan.
const W = { 10: "sepuluh", 11: "sebelas", 15: "lima belas", 19: "sembilan belas", 20: "dua puluh", 21: "dua puluh satu", 26: "dua puluh enam", 43: "empat puluh tiga", 50: "lima puluh" };
for (const [n, w] of Object.entries(W)) assert.equal(numberWords(Number(n)).join(" "), w, n);

const sum = ps => ps.reduce((a, b) => a + b, 0);
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const w = [...v];
    switch (p.kind) {
      case "number": case "count": w[i] = String(p.answer + 1); break;
      case "words": w[i] = [...p.answer].reverse().join(" "); if (p.answer.length === 1) w[i] = "sepuluh satu"; break;
      case "bond": case "seq": case "place": case "split": w[i] = p.answer.map((a, k) => k === 0 ? a + 1 : a).join("|"); break;
      case "choice": w[i] = p.options.find(o => o !== p.answer); assert.ok(p.options.includes(p.answer)); break;
      case "check": w[i] = p.answer.slice(0, 1).join(","); break;
      case "order": w[i] = [...p.answer].reverse().join("|"); break;
      case "guess": w[i] = `${p.answer}|${p.answer - 1}`; break;
      case "dots": w[i] = v[i].split("|").reverse().join("|"); break;
    }
    assert.ok(!correct(q, w.join(SEP)), `salah ditolak: ${q.prompt} bagian ${i}`);
    // Konsistensi matematis.
    if (p.kind === "bond") { const vals = [p.tens, p.ones, p.total]; const k = vals.indexOf(null); const full = [...vals]; full[k] = p.answer[0]; assert.equal(full[0] + full[1], full[2], q.prompt); assert.equal(full[0] % 10, 0); assert.ok(full[1] < 10); }
    if (p.kind === "seq") { const full = [...p.items]; let k = 0; full.forEach((x, j) => { if (x === null) full[j] = p.answer[k++]; }); const d = full[1] - full[0]; assert.ok(Math.abs(d) === 1); full.forEach((x, j) => j && assert.equal(x - full[j - 1], d, q.prompt)); }
    if (p.kind === "place") { const [t, o, n] = p.total === null ? p.answer : [...p.answer, p.total]; assert.equal(t * 10 + o, n); assert.ok(o < 10); }
    if (p.kind === "split") { assert.equal(p.answer[0] * 10 + p.answer[1], p.total); }
    if (p.kind === "order") { const nums = p.answer.map(Number); if (nums.every(Number.isFinite)) { const asc = [...nums].sort((a, b) => a - b); assert.ok(JSON.stringify(nums) === JSON.stringify(asc) || JSON.stringify(nums) === JSON.stringify([...asc].reverse()), q.prompt); } assert.deepEqual([...p.options].sort(), [...p.answer].sort()); }
    if (p.kind === "check") { const m = q.prompt.match(/bilangan (\d+)/); const target = Number(m[1]); p.options.forEach((o, k) => { const [t, s] = o.match(/\d+/g).map(Number); assert.equal(t * 10 + s === target, p.answer.includes(k), o); }); }
    if (p.kind === "words") { const n = Number(p.label.match(/\d+/)[0]); assert.deepEqual(p.answer, numberWords(n)); p.answer.forEach(x => assert.ok(p.tiles.includes(x), x)); }
    if (p.kind === "dots") assert.equal(p.pts.length, p.to - p.from + 1);
  });
  // Gambar sesuai jawaban.
  if (q.scene?.type === "objects") { const p = q.parts.find(x => ["count", "guess", "number"].includes(x.kind)); assert.equal(p.answer, q.scene.n, q.prompt); assert.ok(q.scene.n <= 50); }
  if (q.scene?.type === "blocks") { const n = q.scene.tens * 10 + q.scene.ones; const p = q.parts[0]; const ans = p.kind === "place" ? (p.total ?? p.answer[2]) : p.answer; assert.equal(ans, n, q.prompt); }
}
// Soal "puluhan dan satuan" tertulis.
for (const q of all) for (const m of q.prompt.matchAll(/(\d+) puluhan dan (\d+) satuan\. Bilangannya/g)) assert.equal(Number(m[1]) * 10 + Number(m[2]), q.parts[0].answer);
const lili = assessment.find(q => q.prompt.startsWith("Kartu bilangan Kira")); assert.deepEqual(lili.parts[0].answer, ["Lili", "Kira", "Malosi"]);
const cmp = assessment.find(q => q.prompt === "Bilangan mana yang lebih besar?"); assert.equal(cmp.parts[0].answer, "1 puluhan dan 14 satuan");
const cards = assessment.find(q => q.scene?.type === "cards"); assert.deepEqual(cards.parts.map(p => p.answer), [43, 12]);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, ${kinds.size} jenis jawaban.`);
