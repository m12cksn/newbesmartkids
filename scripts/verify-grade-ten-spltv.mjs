import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, solve3, det3, detMatrix, kindOf, symbolValues, COUNT, sameRow } from "../src/data/grade-ten-spltv.ts";

assert.equal(topics.length, 2); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "A.3", "B.1", "B.2", "B.3"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 6, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 6); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 12, B: 12 });
sections.forEach((_, t) => assert.ok(assessment.filter(q => q.topic === t).length >= 3, `bagian ${t} diuji di evaluasi`));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)), "| bergambar:", assessment.filter(q => q.scene).length);
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","), JSON.stringify(tally(pos.map(String), x => x)));
assert.ok(new Set(pos).size === 3, "posisi jawaban bervariasi");

const near = (a, b) => Math.abs(a - b) < 1e-7;
let rechecked = 0;
const sat = (rows, v) => rows.every(r => near(r[0] * v[0] + r[1] * v[1] + r[2] * v[2], r[3]));
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  if (q.scene?.type === "system") q.scene.rows.forEach(r => assert.ok(!/NaN|undefined/.test(r), r));
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "triple") {
      if (p.sys) { assert.ok(sat(p.sys, p.values), `triple memenuhi sistem: ${q.prompt}`); assert.equal(kindOf(p.sys), "satu"); rechecked++; }
      f.forEach((c, k) => { const g = [...f]; g[k] = String(num(c) + 1); wrong(g.join("|")); });
      if (new Set(f).size > 1) wrong([...f].reverse().join("|") === f.join("|") ? [f[1], f[0], f[2]].join("|") : [...f].reverse().join("|"));
    }
    if (p.kind === "system") {
      assert.ok(correct(q, swap(i, p.rows.flatMap(r => r.map(x => String(-2 * x))).join("|"))), "kelipatan baris diterima");
      p.rows.forEach((_, r) => { const g = [...f]; g[r * 4 + 3] = String(num(g[r * 4 + 3]) + 1); wrong(g.join("|")); });
      assert.ok(!sameRow([0, 0, 0, 0], p.rows[0]));
      const t = q.parts.find(x => x.kind === "triple"); if (t) { assert.ok(sat(p.rows, t.values), "model cocok dengan penyelesaian"); rechecked++; }
    }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}
// Hitung ulang soal cerita dari datanya sendiri.
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const eqv = (a, b, m = "") => { assert.ok(near(a, b), `${m} ${a} ≠ ${b}`); rechecked++; };
const parse = s => { const [l, r] = s.split(" = "); const c = [0, 0, 0]; for (const m of l.replace(/−/g, "-").replace(/\s/g, "").matchAll(/([+-]?\d*)([xyz])/g)) c["xyz".indexOf(m[2])] = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : Number(m[1]); return [...c, num(r)]; };
const sysOf = q => q.scene.rows.map(parse);
const pairs = (ab, ac, bc) => { const s = (1 / ab + 1 / ac + 1 / bc) / 2; return [1 / (s - 1 / bc), 1 / (s - 1 / ac), 1 / (s - 1 / ab)]; };
{ const q = find(/Ani dan Budi/); pairs(4, 4, 6).forEach((t, k) => eqv(t, q.parts[1].values[k])); eqv(q.parts[0].value, 1 / 3); }
{ const q = find(/Trisna, ayahnya/); const all3 = 1 / 2, tk = 1 / 3, ak = 1 / 4; const a = all3 - tk, t = all3 - ak, k = all3 - a - t; [t, a, k].forEach((r, i) => eqv(1 / r, q.parts[0].values[i])); }
{ const q = find(/Pesanan ukiran harus selesai/); pairs(6, 6, 9).forEach((t, k) => eqv(t, q.parts[0].values[k])); const T = 1 / q.parts[0].values.reduce((s, t) => s + 1 / t, 0); eqv(T, q.parts[1].value); assert.equal(q.parts[2].answer.startsWith("Ya"), T < 5); }
{ const q = find(/Joni, Deni, dan Ari/); const [J, D, A] = q.parts[0].values.map(t => 1 / t); eqv(J + D + A, 1 / 12); eqv(D + A, 1 / 20); eqv(4 * (J + D + A) + 10 * (J + D), 1); }
{ const q = find(/Pak Wayan menyelesaikan pesanan dalam 10 hari/); eqv(q.parts[0].value, 1 / 10 + 1 / 15 + 1 / 30); eqv(q.parts[1].value, 1 / q.parts[0].value); }
{ const q = find(/ikan mas/); const [E, T, L] = q.parts.map(p => p.value); eqv(E, 6 + T / 3); eqv(T, L / 2); eqv(6 + T + E, L); }
{ const q = find(/Celengan/); const sols = []; for (let x = 1; x <= 10; x++) for (let y = 1; y <= 10; y++) for (let z = 1; z <= 10; z++) if (x + y + z === 10 && 100 * x + 500 * y + 1000 * z === 5800) sols.push([x, y, z]); assert.deepEqual(sols, [q.parts[0].values]); rechecked++; }
{ const q = find(/Penjual beras/); const [a, b, c] = solve3([[1, 2, 3, 76], [2, 3, 0, 63], [0, 1, 1, 24]]); eqv(q.parts[1].value, Math.max(a, b, c) * 1000); assert.equal(q.parts[0].answer, `Beras ${"ABC"[[a, b, c].indexOf(Math.max(a, b, c))]}`); }
{ const q = find(/Keliling sebuah segitiga/); const [x, y, z] = q.parts[1].values; assert.ok(x <= y && y <= z && x + y > z, "segitiga sah"); eqv(z, 2 * x); eqv(z, x + y - 4); eqv(x + y + z, 24); }
{ const q = find(/Tiket pertunjukan/); const [d, p, a] = q.parts[0].values; eqv(d + p + a, 200); eqv(50000 * d + 30000 * p + 20000 * a, 7200000); eqv(d, 2 * p - 10); }
{ const q = find(/Modal Rp300 juta/); const [t, d, o] = q.parts[1].values; eqv(t + d + o, 300); eqv(0.05 * t + 0.07 * d + 0.09 * o, 19); eqv(0.05 * t, 0.07 * d + 0.09 * o - 4); eqv(q.parts[0].value, det3(detMatrix(sysOf(q), null))); }
{ const q = find(/ax² \+ bx \+ c|ax\^\{2\} \+ bx \+ c|f\(x\) = ax/); const [a, b, c] = q.parts[1].values; for (const [x, y] of q.scene.pts) eqv(a * x * x + b * x + c, y); }
{ const q = find(/Setiap simbol mewakili/); const g = q.scene.grid, val = k => symbolValues[k]; g.forEach((r, i) => eqv(r.reduce((s, k) => s + val(k), 0), q.scene.rowSums[i]));
  const R = [0, 1, 2].map(i => ["s", "b", "m"].map(k => g[i].filter(x => x === k).length).concat(q.scene.rowSums[i])); const v = solve3(R); assert.ok(v, "tiga baris pertama cukup"); eqv(v[0], 30); eqv(v[1], 38); eqv(v[2], 45);
  eqv(q.parts[0].value, g.reduce((s, r) => s + val(r[2]), 0)); }
// Determinan dan nilai turunan dari sistem pada gambar.
for (const q of all.filter(q => q.scene?.type === "system" && q.scene.rows.length === 3)) {
  const rows = sysOf(q), sol = kindOf(rows) === "satu" ? solve3(rows) : null;
  for (const p of q.parts) {
    if (p.kind === "num" && /^D =/.test(p.label)) eqv(p.value, det3(detMatrix(rows, null)), q.prompt);
    if (p.kind === "num" && /^D([xyz]) =/.test(p.label)) eqv(p.value, det3(detMatrix(rows, "xyz".indexOf(p.label[1]))), q.prompt);
    if (p.kind === "num" && /^([xyz]) =|karung SS/.test(p.label)) eqv(p.value, sol[/karung SS/.test(p.label) ? 1 : "xyz".indexOf(p.label[0])], q.prompt);
    if (p.kind === "num" && /x\^\{2\}/.test(p.label)) eqv(p.value, sol.reduce((s, v) => s + v * v, 0), q.prompt);
    if (p.kind === "triple" && p.names.join() === "x,y,z") sol.forEach((v, k) => eqv(v, p.values[k]));
    if (p.kind === "choice" && p.options === COUNT) { assert.equal(p.answer, { satu: COUNT[0], tidak: COUNT[1], banyak: COUNT[2] }[kindOf(rows)]); rechecked++; }
  }
}
// Klasifikasi banyak penyelesaian dari teks baris.
for (const q of all) for (const p of q.parts) if (p.kind === "classify" && p.options === COUNT) p.rows.forEach(r => { assert.equal(r.answer, { satu: COUNT[0], tidak: COUNT[1], banyak: COUNT[2] }[kindOf(r.text.split("; ").map(parse))], r.text); rechecked++; });
// Soal berparameter t: y dari dua persamaan pertama, lalu (t² − k²)z = t − k.
for (const [re, k, d1, d2] of [[/\(t² − 25\)/, 5, 7, 3], [/\(t² − 16\)/, 4, 5, 1]]) { const q = find(re); const kind = t => kindOf([[1, 1, 1, d1], [1, -1, 1, d2], [0, 0, t * t - k * k, t - k]]);
  eqv(kind(q.parts[0].value) === "tidak" ? 1 : 0, 1); eqv(kind(q.parts[1].value) === "banyak" ? 1 : 0, 1); for (let t = -9; t <= 9; t++) if (Math.abs(t) !== k) assert.equal(kind(t), "satu");
  if (q.parts[2]) eqv(solve3([[1, 1, 1, d1], [1, -1, 1, d2], [0, 0, -k * k, -k]])[2], q.parts[2].value); }
assert.equal(num("4,5"), 4.5); assert.equal(num("1/5"), 0.2); assert.equal(num("2.000"), 2000); assert.equal(num("−16"), -16);
console.log(`Kunci dihitung ulang dari sistem dan cerita: ${rechecked}`);
console.log(`Data Kelas 10 Bab 2 valid: ${all.length} soal.`);
