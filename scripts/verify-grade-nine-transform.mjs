import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, translate, reflect, rotate, dilate } from "../src/data/grade-nine-transform.ts";

assert.equal(topics.length, 5); assert.deepEqual(topics.map(t => t.sections.length), [1, 3, 1, 3, 1]);
assert.deepEqual(sections.map(s => s.code), ["A", "B.1", "B.2", "B.3", "C", "D.1", "D.2", "D.3", "E"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 9, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 5 && s.life.length > 200 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 9); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)));
Object.values(tally(assessment, letter)).forEach(c => assert.ok(c >= 4)); assert.equal(Object.keys(tally(assessment, letter)).length, 5);
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| interaksi geometri (gambar bayangan, hubungkan):", assessment.filter(q => q.parts.some(p => p.kind === "plot" || p.kind === "match")).length);
assert.ok(Object.keys(kinds).length >= 8);
console.log("Posisi jawaban pilihan:", all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)).join(","));

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); if (p.value !== 0) wrong(String(-p.value)); }
    if (p.kind === "pts" || p.kind === "vec") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); if (num(f[k]) !== 0) { g[k] = String(-num(f[k])); wrong(g.join("|")); } });
    if (p.kind === "pts") for (let k = 0; k < p.points.length; k++) if (p.points[k][0] !== p.points[k][1]) { const g = [...f]; [g[2 * k], g[2 * k + 1]] = [g[2 * k + 1], g[2 * k]]; wrong(g.join("|")); }
    if (p.kind === "eq") { assert.ok(correct(q, swap(i, [-p.a, -p.b, -p.c].join("|")))); assert.ok(correct(q, swap(i, [2 * p.a, 2 * p.b, 2 * p.c].join("|")))); f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); }); }
    if (p.kind === "plot") { const key = p.points.map(x => x.join(",")); wrong(key.slice(1).join(";")); wrong([...key.slice(1), `${p.points[0][0] + 1},${p.points[0][1]}`].join(";")); assert.ok(correct(q, swap(i, [...key].reverse().join(";"))), "urutan bebas");
      p.points.forEach(([x, y]) => assert.ok(Math.abs(x) <= p.r && Math.abs(y) <= p.r && Number.isInteger(x) && Number.isInteger(y), "titik terlihat pada bidang")); rechecked++; }
    if (p.kind === "match") { assert.equal(new Set(p.answer).size, p.answer.length); assert.deepEqual([...p.answer].sort(), [...p.right].sort()); const g = [...f]; [g[0], g[1]] = [g[1], g[0]]; wrong(g.join("|")); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}
// Rumus transformasi dicek dengan geometri: jarak dan titik tengah.
const Z = a => a.map(v => v + 0);
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) {
  const P = [x, y];
  const mid = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  assert.equal(mid(P, reflect(P, "y = x"))[0], mid(P, reflect(P, "y = x"))[1]); assert.ok(Math.abs(mid(P, reflect(P, "y = −x"))[0] + mid(P, reflect(P, "y = −x"))[1]) < 1e-9);
  assert.equal(mid(P, reflect(P, { x: 3 }))[0], 3); assert.equal(mid(P, reflect(P, { y: -2 }))[1], -2);
  for (const d of [90, 180, 270, -90]) { const R = rotate(P, d); assert.ok(Math.abs(dist(R, [0, 0]) - dist(P, [0, 0])) < 1e-9); }
  assert.deepEqual(Z(rotate(P, 270)), Z(rotate(P, -90))); assert.deepEqual(Z(rotate(P, 180)), Z(reflect(P, "titik O")));
  assert.deepEqual(Z(reflect(reflect(P, "sumbu x"), "sumbu y")), Z(rotate(P, 180)));
  assert.deepEqual(Z(dilate(P, -1)), Z(rotate(P, 180)));
}
assert.deepEqual(rotate([1, 0], 90), [0, 1]); rechecked += 5;
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const ptsOf = p => p.points;
const same = (a, b, m) => { assert.deepEqual(a.map(x => x.map(v => Math.round(v * 1e6) / 1e6 + 0)), b.map(x => x.map(v => v + 0)), m); rechecked++; };
{ const q = find(/translasi \(5, −2\) adalah/); const [x, y] = translate([-3, 4], [5, -2]); assert.equal(q.parts[0].answer, `A'(${x}, ${y})`); rechecked++; }
same(ptsOf(find(/Segitiga PQR dengan P\(4, −2\), Q\(3, 5\)/).parts[0]), [[2, 4], [-5, 3], [-1, -2]]);
same(ptsOf(find(/A\(4, 1\), B\(6, 3\), C\(1, 2\)/).parts[0]), [[-1, 4], [-3, 6], [-2, 1]]);
same(ptsOf(find(/P\(−3, 2\) dan Q\(4, −1\) direfleksikan terhadap garis x = 3/).parts[0]), [[9, 2], [2, -1]]);
same(ptsOf(find(/didilatasi \[P\(2, 3\), 2\]/).parts[0]), [[0, -3], [4, -3], [4, -1], [0, -1]]);
same(ptsOf(find(/didilatasi \[P\(2, 2\), −2\]/).parts[0]), [[0, 4], [-2, 0], [2, -2]]);
same(ptsOf(find(/P\(5, 6\) dan Q\(10, 6\)/).parts[0]), [[1, 2], [-4, 2]]);
{ const q = find(/Segitiga PQR ditranslasikan menjadi STU/); const v = [1 - -2, -2 - 1]; assert.deepEqual([q.parts[0].a, q.parts[0].b], v); same(q.parts[1].points, [[2 + v[0], -1 + v[1]], [4 - v[0], 3 - v[1]]]); }
{ const q = find(/Pencuri bersembunyi/); assert.deepEqual([q.parts[0].a, q.parts[0].b], [7, -3]); assert.deepEqual(translate([-1, -2], [7, -3]), [6, -5]); assert.deepEqual([q.parts[2].a, q.parts[2].b], [5, 1]); rechecked++; }
{ const q = find(/Bola golf/); const V = [1, 3], W2 = [7, -1], x = V[0] + (W2[0] - V[0]) * V[1] / (V[1] - W2[1]); same(q.parts[0].points, [[x, 0]]);
  const T = [x, 0], d1 = dist(V, T) + dist(T, [7, 1]); for (let xx = 0; xx <= 8; xx += 0.5) assert.ok(dist(V, [xx, 0]) + dist([xx, 0], [7, 1]) >= d1 - 1e-9, "lintasan terpendek"); }
{ const q = find(/garis 3x \+ y = 3 ditranslasikan|Garis 3x \+ y = 3/); const A = translate([1, 0], [3, -4]), B = translate([0, 3], [3, -4]); const p = q.parts[0]; assert.equal(p.a * A[0] + p.b * A[1], p.c); assert.equal(p.a * B[0] + p.b * B[1], p.c); rechecked++; }
{ const q = find(/y = 3x − 4 jika direfleksikan/); const p = q.parts[0]; for (const x of [0, 2]) { const [a, b] = reflect([x, 3 * x - 4], "sumbu x"); assert.equal(p.a * a + p.b * b, p.c); } rechecked++; }
{ const q = find(/y = 2x \+ 3 jika direfleksikan/); const p = q.parts[0]; for (const x of [0, 1]) { const [a, b] = reflect([x, 2 * x + 3], "sumbu x"); assert.equal(p.a * a + p.b * b, p.c); } rechecked++; }
{ const q = find(/Hubungkan setiap jenis refleksi/); assert.deepEqual(q.parts[0].answer, ["(4, 1)", "(−4, −1)", "(−4, 1)", "(−1, 4)", "(1, −4)", "(0, −1)", "(4, 3)"]); rechecked++; }
{ const q = find(/ΔKLM ≅ ΔXYZ/); assert.equal(q.parts[1].value, 180 - 65 - 40); rechecked++; }
{ const q = find(/AB = BC = 12 cm/); assert.ok(Math.abs(q.parts[2].value - (12 * Math.SQRT2 - 12)) < 0.01); rechecked++; }
{ const q = find(/AB = 8 cm, BC = 15 cm/); assert.equal(q.parts[1].value, 9 * 0.5 * 8 * 15); rechecked++; }
{ const q = find(/W\(u, v\) dicerminkan/); const [u, v] = [q.parts[0].value, q.parts[1].value]; assert.deepEqual(reflect([u, v], { y: 3 }), [-3, 2]); rechecked++; }
{ const q = find(/rotasi 90° berlawanan arah jarum jam terhadap O, lalu hasilnya dicerminkan|dirotasikan 90° berlawanan arah jarum jam terhadap O, lalu hasilnya/); for (let x = -3; x <= 3; x++) assert.deepEqual(Z(reflect(rotate([x, 2], 90), "sumbu x")), Z(reflect([x, 2], "y = −x"))); rechecked++; }
assert.equal(num("5,5"), 5.5); assert.equal(num("−1/2"), -0.5);
console.log(`Kunci dihitung ulang dari rumus dan geometri: ${rechecked}`);
console.log(`Data Kelas 9 Bab 3 valid: ${all.length} soal.`);
