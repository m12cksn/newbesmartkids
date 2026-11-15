import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, surdValue, quadrant, piText, exact } from "../src/data/grade-ten-trigonometry.ts";

assert.equal(topics.length, 3); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "A.3", "B.1", "B.2", "C.1", "C.2"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 7, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 7); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 8, B: 8, C: 8 });
sections.forEach((_, t) => assert.ok(assessment.filter(q => q.topic === t).length >= 2, `bagian ${t} diuji`));
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
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "surd") { assert.ok(correct(q, swap(i, `${2 * p.p}|${p.q}|${2 * p.r}`)), "bentuk setara diterima"); wrong(`${-p.p}|${p.q}|${p.r}`); if (p.q !== 1) wrong(`${p.p}|1|${p.r}`); wrong(`${p.p}|${p.q}|${p.r + 1}`); }
    if (p.kind === "pi") { assert.ok(correct(q, swap(i, `${3 * p.p}|${3 * p.q}`))); wrong(`${p.p + 1}|${p.q}`); wrong(`${p.p}|0`); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
// Hitung ulang setiap nilai dengan fungsi trigonometri JavaScript.
const R = d => d * Math.PI / 180, S = d => Math.sin(R(d)), C = d => Math.cos(R(d)), T = d => Math.tan(R(d));
const find = re => { const r = all.filter(q => re.test(q.prompt) || q.parts.some(p => re.test(p.label ?? ""))); assert.equal(r.length, 1, String(re)); return r[0]; };
const val = p => (p.kind === "surd" ? surdValue(p.p, p.q, p.r) : p.kind === "pi" ? p.p / p.q * Math.PI : p.value);
const eqv = (a, b, m = "") => { assert.ok(near(a, b), `${m}: ${a} ≠ ${b}`); rechecked++; };
const checks = [
  [/Ubah satuan sudut berikut/, [150 * Math.PI / 180, 4 / 9 * 180]],
  [/Nyatakan dalam satuan yang diminta/, [3 / 8 * 360, 1080 / 360]],
  [/pukul 04\.00/, [120, R(120)]],
  [/PQ = 12 dan QR = 5/, [13, 12 / 13, 12 / 5]],
  [/sin A = \{2\/5\}/, [Math.cos(Math.asin(0.4)), Math.tan(Math.asin(0.4))]],
  [/tan P = \{5\/12\}/, [Math.sin(Math.atan(5 / 12)), 1 / Math.cos(Math.atan(5 / 12))]],
  [/Tiang setinggi 6 m/, [1.2 * 9 / 6, 6 / 9]],
  [/sin 60° × cos 30° − cos 60° × sin 30°/, [S(60) * C(30) - C(60) * S(30)]],
  [/Tulis nilai eksaknya/, [C(45), T(60)]],
  [/LM = 6 cm, dan ∠M = 30°/, [6 / C(30), 6 * T(30)]],
  [/Tentukan nilai eksak berikut/, [S(150), C(225), T(300)]],
  [/cos α = −\{3\/5\}/, [4 / 5, (4 / 5) / (-3 / 5), 5 / 4]],
  [/sudut yang lebih dari 360°/, [S(750), C(1200)]],
  [/tan β = 2\./, [Math.sin(Math.atan(2)), Math.cos(Math.atan(2))]],
  [/sin θ = \{3\/5\}/, [(3 / 5 + 4 / 5) ** 2, 9 / 25 - 16 / 25]],
  [/b = 10, ∠A = 30°/, [10 * S(30) / S(45)]],
  [/a = 5, b = 8, dan ∠C = 60°/, [Math.sqrt(25 + 64 - 80 * C(60))]],
  [/a = 6, b = 8, dan ∠C = 30°/, [0.5 * 6 * 8 * S(30)]],
  [/4, 5, dan 6/, [(16 + 25 - 36) / 40]],
  [/y = 3 sin x dan y = sin 2x/, [3, -3, Math.PI]],
  [/y = 2 \+ sin x/, [3, 1]],
  [/sin 240°/, [S(240), T(135)]],
  [/b = 3, c = 5, dan ∠A = 120°/, [Math.sqrt(9 + 25 - 30 * C(120))]],
  [/AB = 15 cm, dan BC = 8 cm/, [8 / 17, 15 / 17, 15 / 8]],
  [/tan β = 4\./, [Math.sin(Math.atan(4)), Math.cos(Math.atan(4))]],
  [/bentuk pecahan berikut/, [(4 * C(60) ** 2 + 3 / C(30) ** 2 - 2 * T(45) ** 2) / (S(30) ** 2 + C(30) ** 2)]],
  [/A ke C 6 km/, [6 * S(60) / S(45)]],
  [/pukul 03\.30/, [Math.abs(180 - (90 + 15)), R(75)]],
  [/tan θ = −\{5\/12\}/, [-12 / 13, 13 / 5]],
  [/y = 3 sin 2x\./, [3, Math.PI, 3 * Math.sin(2 * Math.PI / 4)]],
  [/Dua guru setinggi 1,5 m/, [12 / (1 / T(30) - 1 / T(60))]],
  [/a = 8, b = 10, dan ∠C = 150°/, [0.5 * 80 * S(150)]],
  [/sin 2\.910°/, [S(2910), C(1665)]],
  [/berjalan 8 km/, [Math.sqrt(64 + 25 - 80 * C(60))]],
  [/PR \+ QR = 18/, [10, 8 / 10, 8 / 6]],
  [/y = −2 cos x \+ 1/, [3, Math.PI, -1]],
  [/y = 2 sin x \+ 1/, [3, -1]],
];
for (const [re, exp] of checks) { const q = find(re), ps = q.parts.filter(p => ["num", "surd", "pi"].includes(p.kind)); assert.equal(ps.length, exp.length, String(re)); ps.forEach((p, k) => eqv(val(p), exp[k], `${re} bagian ${k}`)); }
{ const q = find(/Gunakan relasi sudut/); const A = q.parts[0].value; eqv(S(3 * A), C(A - 22)); assert.ok(3 * A < 90); eqv(q.parts[1].value, T(65) / (1 / T(25))); }
{ const q = find(/sin\(A \+ B\) = 1/); const [A, B] = q.parts.map(p => p.value); eqv(S(A + B), 1); eqv(C(A - B), Math.sqrt(3) / 2); }
{ const q = find(/tan\^\{2\} β/); const b = q.parts[1].value; eqv(T(b) ** 2 / (1 / C(b) - 1), 3); eqv(q.parts[0].value, 1 / C(b)); }
{ const q = find(/2 sin x \+ 1 untuk/); let roots = 0; for (let k = 0; k < 7200; k++) { const a = k / 7200 * 2 * Math.PI, b = (k + 1) / 7200 * 2 * Math.PI, f = x => 2 * Math.sin(x) + 1; if (f(a) * f(b) < 0) roots++; } eqv(roots, Number(q.parts[2].answer)); }
// Klasifikasi kuadran dan definisi.
const quadOf = t => { const sg = { sin: 0, cos: 0, tan: 0 }; for (const m of t.matchAll(/(sin|cos|tan|csc|sec|cot) α ([<>]) 0/g)) { const k = { csc: "sin", sec: "cos", cot: "tan" }[m[1]] ?? m[1]; sg[k] = m[2] === ">" ? 1 : -1; }
  return [45, 135, 225, 315].filter(d => (!sg.sin || Math.sign(S(d)) === sg.sin) && (!sg.cos || Math.sign(C(d)) === sg.cos) && (!sg.tan || Math.sign(T(d)) === sg.tan)); };
for (const q of all) for (const p of q.parts) if (p.kind === "classify" && p.options[0] === "Kuadran I") p.rows.forEach(r => {
  if (/α/.test(r.text)) { const qs = quadOf(r.text); assert.equal(qs.length, 1, r.text); assert.equal(r.answer, p.options[qs[0] / 90 - 0.5]); }
  else assert.equal(r.answer, p.options[quadrant(num(r.text.replace("°", ""))) - 1], r.text); rechecked++; });
// Diagram grafik: jawaban cocok dengan fungsi yang diminta.
for (const [re, F] of [[/grafik y = cos x/, x => Math.cos(x)], [/grafik y = 2 sin x/, x => 2 * Math.sin(x)]]) { const q = find(re), p = q.parts[0], pic = p.pics[p.options.indexOf(p.answer)]; [0.3, 1.7, 4].forEach(x => eqv(pic.fns[0].f(x), F(x))); p.pics.filter(s => s !== pic).forEach(s => assert.ok([0.3, 1.7, 4].some(x => !near(s.fns[0].f(x), F(x))))); }
assert.equal(piText(150), "{5π/6}"); assert.equal(piText(180), "π"); assert.equal(exact(Math.sqrt(3) / 2), "{√{3}/2}"); assert.equal(exact(-0.5), "−{1/2}"); assert.equal(exact(1), "1"); assert.equal(exact(0), "0");
console.log(`Kunci dihitung ulang dengan fungsi trigonometri: ${rechecked}`);
console.log(`Data Kelas 10 Bab 4 valid: ${all.length} soal.`);
