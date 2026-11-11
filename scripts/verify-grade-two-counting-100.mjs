import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, numberWords, nameOf } from "../src/data/grade-two-counting-100.ts";

assert.equal(topics.length, 2);
assert.deepEqual(practice.map(p => p.length), [4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 12, 1: 12 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
for (let i = 1; i < 24; i++) assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + q.answer)).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 7, JSON.stringify(kinds));

const W = { 100: "seratus", 90: "sembilan puluh", 71: "tujuh puluh satu", 47: "empat puluh tujuh", 68: "enam puluh delapan", 11: "sebelas", 15: "lima belas" };
for (const [n, w] of Object.entries(W)) assert.equal(numberWords(Number(n)).join(" "), w, n);
const fromLabel = s => { const m = s.match(/^(\d+) puluhan dan (\d+) satuan$/); if (m) return Number(m[1]) * 10 + Number(m[2]); for (let n = 1; n <= 100; n++) if (nameOf(n) === s) return n; throw new Error(s); };

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const w = [...v];
    if (p.kind === "number") w[i] = String(p.answer + 1);
    if (p.kind === "words") w[i] = p.answer.length > 1 ? [...p.answer].reverse().join(" ") : "sepuluh";
    if (p.kind === "pv") w[i] = [p.answer[1], p.answer[0], ...p.answer.slice(2)].join("|");
    if (p.kind === "match") { const a = [...p.answer]; [a[0], a[1]] = [a[1], a[0]]; w[i] = a.join(","); }
    if (p.kind === "guess") w[i] = `${p.answer}|${p.answer - 1}`;
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); w[i] = p.options.find(o => o !== p.answer); }
    if (p.kind === "order") w[i] = [...p.answer].reverse().join("|");
    if (!(p.kind === "pv" && p.answer[0] === p.answer[1])) assert.ok(!correct(q, w.join(SEP)), `salah ditolak: ${q.prompt} ${i}`);
    if (p.kind === "pv") { const [t, o, tv, ov, s] = p.answer; assert.equal(tv, t * 10); assert.equal(ov, o); assert.equal(s, tv + ov); assert.ok(o < 10); }
    if (p.kind === "words") { const n = Number(p.label.match(/\d+/)[0]); assert.deepEqual(p.answer, numberWords(n)); p.answer.forEach(x => assert.ok(p.tiles.includes(x), x)); }
    if (p.kind === "match") { p.left.forEach((l, k) => assert.equal(Number(p.right[p.answer[k]]), fromLabel(l), l)); assert.equal(new Set(p.answer).size, p.answer.length); }
    if (p.kind === "order") { const nums = p.answer.map(Number), asc = [...nums].sort((a, b) => a - b); assert.ok(JSON.stringify(nums) === JSON.stringify(asc) || JSON.stringify(nums) === JSON.stringify([...asc].reverse()), q.prompt); assert.equal(/besar/.test(q.prompt), nums[0] > nums[1]); }
    if (p.kind === "choice" && /besar/.test(p.label) && p.options.every(o => /^\d+$/.test(o))) assert.equal(p.answer, String(Math.max(...p.options.map(Number))));
  });
  // Gambar sesuai jawaban.
  const s = q.scene;
  if (s?.type === "packs") { const n = s.packs * 10 + s.loose; const pvp = q.parts.find(p => p.kind === "pv"); if (pvp) assert.equal(pvp.answer[4], n); const num = q.parts.find(p => p.kind === "number" && /Jadi|Banyak kue/.test(p.label)); if (num) assert.equal(num.answer, n); const tens = q.parts.find(p => p.label === "Banyak puluhan"); if (tens) assert.equal(tens.answer * 10, n); }
  if (s?.type === "scatter") assert.equal(q.parts[0].answer, s.n);
  if (s?.type === "strip") { assert.equal(q.parts[0].answer, s.at); assert.ok(s.at > s.from && s.at < s.to); const steps = q.prompt.match(/(maju|mundur) (dua|tiga|empat) langkah/); if (steps) { const k = { dua: 2, tiga: 3, empat: 4 }[steps[2]]; assert.equal(q.parts[1].answer, s.at + (steps[1] === "maju" ? k : -k)); } }
  const m = q.prompt.match(/Aku (\d+) (lebihnya|kurangnya) dari bilangan (\d+)/); if (m) assert.equal(q.parts[0].answer, Number(m[3]) + (m[2] === "lebihnya" ? 1 : -1) * Number(m[1]));
  const r = q.prompt.match(/tambahkan (\d+) pada puluhan dan (\d+) pada satuan, hasilnya adalah (\d+)/); if (r) assert.equal(q.parts[0].answer.split(" ")[1], String(Number(r[3]) - Number(r[1]) * 10 - Number(r[2])));
  const d = q.prompt.match(/(\d+) puluhan dan (\d+) satuan\. Berapakah/); if (d) assert.equal(q.parts[0].answer, Number(d[1]) * 10 + Number(d[2]));
  const nm = q.prompt.match(/nama bilangannya: (.+)\.$/); if (nm) assert.equal(q.parts[0].answer, fromLabel(nm[1]));
}
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 2, `posisi ${pos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
