import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, polyAt, linParts } from "../src/data/grade-ten-functions.ts";

assert.equal(topics.length, 3); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "B.1", "B.2", "C.1", "C.2"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 6, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 6); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 8, B: 8, C: 8 });
sections.forEach((_, t) => assert.ok(assessment.filter(q => q.topic === t).length >= 4, `bagian ${t} diuji`));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)), "| bergambar:", assessment.filter(q => q.scene || q.parts.some(p => p.pics)).length);
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice" && p.options.length > 2).map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","), JSON.stringify(tally(pos.map(String), x => x)));
assert.equal(new Set(pos).size, 3, "posisi jawaban bervariasi");

const near = (a, b) => Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b));
let rechecked = 0; const xs = [-3, -1.5, 0, 1, 2.5, 7];
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "vals") { wrong(p.values.slice(1).join("; ") || "99"); wrong([...p.values, 99].join("; ")); assert.ok(correct(q, swap(i, [...p.values].reverse().join(" ; ")))); }
    if (p.kind === "poly") { if (p.fn) { xs.forEach(x => assert.ok(near(polyAt(p.coef, x), p.fn(x)), `polinom ${p.label} ${q.prompt}`)); rechecked++; } f.forEach((c, k) => { const g = [...f]; g[k] = String(num(c) + 1); wrong(g.join("|")); }); }
    if (p.kind === "lin") {
      if (p.fn) { xs.forEach(x => assert.ok(near(p.a * x + p.b, p.fn(x)), `invers ${p.label}`)); rechecked++; }
      const [P, Q, R] = linParts(p.a, p.b); assert.ok(correct(q, swap(i, `${-2 * P}|${-2 * Q}|${-2 * R}`)), "bentuk setara diterima"); wrong(`${P}|${Q + 1}|${R}`); wrong(`${Q}|${P}|${R}`); wrong(`${P}|${Q}|0`);
    }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
// Hitung ulang dari definisinya sendiri.
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const eqv = (a, b, m = "") => { assert.ok(near(a, b), `${m} ${a} ≠ ${b}`); rechecked++; };
const inv = (f, y, lo = -1e6, hi = 1e7) => { let a = lo, b = hi; const up = f(b) > f(a); for (let k = 0; k < 200; k++) { const m = (a + b) / 2; if ((f(m) < y) === up) a = m; else b = m; } return (a + b) / 2; };
// Invers: f(f⁻¹(x)) = x untuk setiap bagian "lin" yang punya fungsi asal di soal.
const forward = [[/invers f\(x\) = 4x \+ 3/, x => 4 * x + 3], [/400x \+ 30\.000/, x => 400 * x + 30000], [/Fahrenheit F/, c => 9 / 5 * c + 32], [/f\(x\) = x \+ 4 dan g\(x\) = 2x/, x => 2 * (x + 4)],
  [/invers f\(x\) = 6x − 5/, x => 6 * x - 5], [/f\(x\) = 3x − 6 dan g\(x\) = x \+ 4/, x => 3 * x - 6 + 4], [/\(2, 7\), \(3, 10\)/, x => 3 * x + 1], [/f⁻¹\(x\) = \{\(x − 2\)\/4\}/, x => { const f = t => 4 * t + 2, g = t => 5 - 3 * t; return f(g(x)); }]];
for (const [re, F] of forward) { const q = find(re), p = q.parts.find(x => x.kind === "lin"); for (const x of [-2, 0, 3, 10]) eqv(F(p.a * x + p.b), x, q.prompt); }
{ const q = find(/\(2, 7\), \(3, 10\)/); [[2, 7], [3, 10], [5, 16], [6, 19]].forEach(([x, y]) => eqv(3 * x + 1, y)); eqv(q.parts[0].value, 5); }
{ const q = find(/f\(x\) = 2\^\{x \+ 1\}/); eqv(2 ** (q.parts[1].value + 1), 64); eqv(Math.log2(64) - 1, q.parts[1].value); }
{ const q = find(/faktor prima dari 330/); let m = 330, k = 0; for (let d = 2; d <= m; d++) if (m % d === 0) { k++; while (m % d === 0) m /= d; } eqv(q.parts[0].value, k); const y = q.parts[1].value; eqv((y + 2) / y, k); }
{ const q = find(/f\(1\) = 3 dan f\(x \+ 1\) = 2f\(x\)/); let f = 3; for (let x = 1; x < 10; x++) f *= 2; eqv(q.parts[0].value, f); }
{ const q = find(/f\(\{1\/x\}\)/); const A = q.parts[0].value, B = A / 2 - 8; eqv(A + 2 * B, 2); eqv(B - A / 2, -8); }
{ const q = find(/f\(x\) = x² − 3x \+ 1 dan g\(x\) = 2x − 5/); const f = x => x * x - 3 * x + 1, g = x => 2 * x - 5; eqv(q.parts[0].value, g(f(4))); eqv(q.parts[1].value, f(g(4))); }
{ const q = find(/f\(x\) = 3x − 1 dan g\(x\) = x² \+ 2. Hitung/); eqv(q.parts[0].value, sq(3 * 2 - 1) + 2); eqv(q.parts[1].value, 3 * (4 + 2) - 1); }
{ const q = find(/5x − 10 ton/); const f = x => 5 * x - 10, g = x => x * x + 20; eqv(q.parts[0].value, g(f(30))); eqv(f(q.parts[1].value), 90); eqv(q.parts[2].value, g(90)); }
{ const q = find(/200x \+ 1\.500/); eqv(q.parts[0].value, 200 * 80 + 1500); eqv(inv(x => 200 * x + 1500, 41500), q.parts[1].value); }
{ const q = find(/400x \+ 2\.000/); eqv(q.parts[0].value, 400 * 30 + 2000); eqv(inv(x => 400 * x + 2000, 50000), q.parts[1].value); }
{ const q = find(/450g \+ 2\.000/); const B1 = g => 450 * g + 2000, B2 = g => 120 * g + 800; eqv(q.parts[0].value, B1(12) + B2(12)); eqv(B1(q.parts[1].value) - B2(q.parts[1].value), 8130); }
{ const q = find(/600g \+ 3\.000/); eqv(q.parts[0].value, 600 * 8 + 3000 + 150 * 8 + 1000); eqv(q.parts[1].value, 600 * 4 + 3000 - 150 * 4 - 1000); }
{ const q = find(/√\{x − 2\} dan g\(x\) = √\{11 − x\}/); eqv(q.parts[1].value, Math.sqrt(0) + Math.sqrt(9)); }
{ const q = find(/\{\(x − 4\)\/x\}/); eqv(q.parts[1].value, (5 - 4) / 5 * Math.sqrt(25 - 16)); }
{ const q = find(/√\{x\^\{2\} − 8x \+ 16\}/); eqv(q.parts[2].value, Math.sqrt(1 - 8 + 16)); }
{ const q = find(/8x² \+ 24x \+ 15/); const f = x => 2 * x + 3; [-2, 0, 1, 3].forEach(x => eqv(2 * sq(f(x)) - 3, 8 * x * x + 24 * x + 15)); }
{ const q = find(/diagram\. Tentukan \(g∘f\)\(x\) untuk setiap x/); const sc = q.scene, f = sc.stages[0].links, g = sc.stages[1].links;
  q.parts[0].rows.forEach((r, k) => { const fi = f.find(l => l[0] === k)[1], gl = g.find(l => l[0] === fi); eqv(r.answer === "tidak terdefinisi" ? 1 : 0, gl ? 0 : 1); if (gl) assert.equal(r.answer, sc.sets[2].items[gl[1]]); }); }
// Diagram invers: jawaban adalah satu-satunya diagram bijektif.
for (const q of all) for (const p of q.parts) if (p.pics?.every(s => s.type === "arrows")) {
  const bij = p.pics.map(s => { const [A, B] = s.sets, L = s.stages[0].links; return A.items.every((_, i) => L.filter(l => l[0] === i).length === 1) && B.items.every((_, j) => L.filter(l => l[1] === j).length === 1); });
  assert.equal(bij.filter(Boolean).length, 1); assert.equal(p.options[bij.indexOf(true)], p.answer); rechecked++; }
// Daerah asal dari rumus: uji titik.
{ const q = find(/Pasangkan setiap fungsi dengan daerah asalnya/); const rules = [x => x >= 6, x => x !== -1, () => true, x => x >= -2 && x !== 3], fns = [x => Math.sqrt(x - 6), x => 3 / (x + 1), x => x * x - 2 * x, x => Math.sqrt(x + 2) / (3 - x)];
  for (let x = -8; x <= 10; x += 0.5) fns.forEach((f, k) => { const y = f(x); assert.equal(Number.isFinite(y), rules[k](x), `domain ${k} x=${x}`); }); rechecked++; }
function sq(x) { return x * x; }
assert.equal(num("1.536"), 1536); assert.equal(num("3/5"), 0.6);
console.log(`Kunci dihitung ulang: ${rechecked}`);
console.log(`Data Kelas 10 Bab 3 valid: ${all.length} soal.`);
