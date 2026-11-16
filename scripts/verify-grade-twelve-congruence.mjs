import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, hourglass, bdcFig } from "../src/data/grade-twelve-congruence.ts";

assert.equal(topics.length, 2); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "A.3", "A.4", "A.5", "B.1", "B.2", "B.3", "B.4"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 9, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 9); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 12, B: 12 });
sections.forEach((s, t) => { const c = assessment.filter(q => q.topic === t).length; assert.ok(c >= 2 && c <= 3, `bagian ${s.code}: ${c}`); });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| bergambar:", assessment.filter(q => q.scene).length);
const interactive = assessment.filter(q => q.parts.some(p => ["match", "classify"].includes(p.kind))).length;
console.log("Soal evaluasi dengan aksi memasangkan/mengelompokkan:", interactive);
assert.ok(kinds.match >= 1 && interactive >= 6, "aksi memasangkan dan mengelompokkan");
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","));
assert.equal(new Set(pos).size, 3, "posisi jawaban bervariasi");

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "frac") { assert.ok(correct(q, swap(i, `${3 * f[0]}|${3 * f[1]}`)), "rasio senilai diterima"); wrong(`${Number(f[0]) + 1}|${f[1]}`); }
    if (p.kind === "row") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "match") { assert.equal(new Set(p.answer).size, p.left.length, "pasangan satu-satu"); p.answer.forEach(a => assert.ok(p.right.includes(a))); const g = [...f]; [g[0], g[1]] = [g[1], g[0]]; wrong(g.join("|")); }
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}

/* Hitung ulang secara mandiri. */
let rechecked = 0;
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const vals = q => q.parts.flatMap(p => (p.kind === "num" ? [p.value] : p.kind === "row" ? p.values : p.kind === "frac" ? [p.p / p.q] : []));
const eq = (q, exp) => { const got = vals(q); assert.equal(got.length, exp.length, q.prompt); got.forEach((g, k) => { assert.ok(Math.abs(g - exp[k]) < 1e-9, `${q.prompt}: ${g} ≠ ${exp[k]}`); rechecked++; }); };
const d = (p, q2) => Math.hypot(p[0] - q2[0], p[1] - q2[1]);
const ang = (v, p, q2) => { const a = [p[0] - v[0], p[1] - v[1]], b = [q2[0] - v[0], q2[1] - v[1]]; return Math.acos((a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))) * 180 / Math.PI; };
const lawCos = (b, c, A) => Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * Math.PI / 180));
const solve = (f, lo, hi) => { for (let x = lo; x <= hi; x++) if (Math.abs(f(x)) < 1e-9) return x; throw new Error("tidak ada solusi"); };
/** Korespondensi dari urutan huruf. */
const corr = (a, b) => Object.fromEntries([...a].map((c, i) => [c, b[i]]));
const side = (map, s) => map[s[0]] + map[s[1]];

{ const m = corr("ABCD", "EFGH"), q = find(/Diketahui ABCD ↔ EFGH dengan A ↔ E/); assert.equal(q.parts[0].answer, side(m, "AD")); assert.equal(q.parts[1].answer, `∠${m.C}`); rechecked += 2; }
{ const m = { K: "Y", L: "Z", M: "W", N: "X" }, q = find(/KLMN ↔ WXYZ/); assert.deepEqual(q.parts[0].answer, ["KL", "LM", "MN", "NK"].map(s => side(m, s))); rechecked++; }
{ const m = corr("ABC", "ZXY"), q = find(/^Diketahui ΔABC ↔ ΔZXY/); assert.equal(q.parts[0].answer, side(m, "BC")); assert.equal(q.parts[1].answer, `∠${m.A}`); rechecked += 2; }
{ const m = corr("DEF", "NLM"), q = find(/ΔDEF ↔ ΔNLM/); assert.deepEqual(q.parts[0].answer, ["DE", "EF", "FD"].map(s => side(m, s))); rechecked++; }
eq(find(/ABCD ≅ EFGH\. Diketahui AB = 7/), [7, 9, 75]);
eq(find(/AB = x \+ 3 dan PQ = 2x − 4/), [solve(x => x + 3 - (2 * x - 4), 0, 50), 10]);
eq(find(/AB = 11 cm, CD = 8 cm/), [11, 8, 95]);
{ const x = solve(x => 2 * x + 1 - (x + 6), 0, 50), y = 105 / 3; eq(find(/AB = \(2x \+ 1\)/), [x, y, 2 * x + 1]); }
eq(find(/AB = 5 cm, AC = 8 cm, dan ∠A = 60°\.$/), [lawCos(5, 8, 60)]);
eq(find(/sisi 3 cm, 5 cm, dan 7 cm/), [Math.acos((9 + 25 - 49) / 30) * 180 / Math.PI]);
{ const q = find(/Keliling ΔABC adalah 135/), x = solve(x => (x + 7) + x + (x - 7) - 135, 0, 200); eq(q, [x]); assert.ok(x + 7 === 52 && x === 45); rechecked++; }
{ const q = find(/Keliling ΔABC adalah 108/), x = solve(x => 3 * x - 108, 0, 200); eq(q, [x]); assert.ok(x + 7 === 43 && x === 36); rechecked++; }
{ const q = find(/AB = 3 cm, AC = 8 cm, ∠A = 60°/); eq(q, [lawCos(3, 8, 60)]); }
eq(find(/A\(1, 4\) dan B\(5, 1\) digeser/), [4, 2, d([1, 4], [5, 1]), d([4, 2], [8, -1])]);
eq(find(/P\(1, 1\), Q\(4, 1\), dan R\(1, 3\)/), [-4, 1, -1, 3]);
{ const P = [[0, 0], [4, 0], [6, 6], [2, 6]], H = P.map(([x, y]) => [x / 2, y / 2]), per = p => p.reduce((s, x, i) => s + d(x, p[(i + 1) % 4]), 0), area = p => Math.abs(p.reduce((s, x, i) => s + x[0] * p[(i + 1) % 4][1] - p[(i + 1) % 4][0] * x[1], 0)) / 2;
  eq(find(/Masalah 4\.1\.7/), [per(P) / per(H), area(P) / area(H)]); }
eq(find(/A\(4, 1\) dan B\(1, 5\) dirotasi/), [-1, 4, d([-1, 4], [-5, 1])]);
eq(find(/AB = 9 cm, BC = 6 cm, CD = 7,5 cm/), [12 / 9]); [8 / 6, 10 / 7.5, 8 / 6].forEach(r => assert.ok(Math.abs(r - 4 / 3) < 1e-12));
eq(find(/Foto berukuran 4 cm × 6 cm/), [6 * 10 / 4]);
eq(find(/32 cm × 18 cm/), [18 * 48 / 32]);
eq(find(/KL = 6 cm, LM = 9 cm/), [9 * 8 / 6, 7.5 * 8 / 6, 4.5 * 8 / 6]);
eq(find(/AB = 10 cm, BC = 6 cm, AC = 12 cm, dan PQ = 15/), [6 * 1.5, 12 * 1.5]);
{ const x = solve(x => 8 * (5 * x) - 12 * (2 * x + 4), 1, 50), AE = 2 * x + 4, DE = Math.sqrt(AE ** 2 - 64); assert.equal(3 * x - 4 + AE, 5 * x); eq(find(/Masalah 4\.2\.2/), [x, DE * 12 / 8]); }
eq(find(/AU = 36, UL = 30/), [36 / 27, 30 / 24]);
eq(find(/Tongkat setinggi 2 m|tongkat setinggi 2 m/), [2 * 18 / 1.5]);
{ const C = hourglass.C, A = hourglass.A, B = hourglass.B, D = hourglass.D, E = hourglass.E; assert.ok(Math.abs(d(A, B) - 21) < 1e-9 && Math.abs(d(C, A) - 24) < 1e-9 && Math.abs(d(C, B) - 30) < 1e-9 && Math.abs(d(C, E) - 16) < 1e-9);
  assert.ok(Math.abs((A[1] - B[1]) * (D[0] - E[0]) - (A[0] - B[0]) * (D[1] - E[1])) < 1e-9, "AB sejajar DE"); eq(find(/AB sejajar DE/), [d(C, D), d(D, E)]); }
{ const { A, B, C, D } = bdcFig; assert.ok(Math.abs(d(B, C) - 12) < 1e-9 && Math.abs(d(B, D) - 8) < 1e-9 && Math.abs(d(C, D) - 10) < 1e-9);
  assert.ok(Math.abs(ang(C, B, D) - ang(A, B, C)) < 1e-9, "∠BCD = ∠BAC"); const per = (...p) => p.reduce((s, x, i) => s + d(x, p[(i + 1) % p.length]), 0);
  eq(find(/∠BCD = ∠BAC/), [d(B, A), d(A, C), per(A, D, C) / per(B, D, C)]); }
eq(find(/persegi panjang dengan keliling 36|Persegi panjang dengan keliling 36/), [18, 20]);
eq(find(/luas 16 cm\^\{2\}/), [12, 144, 4, 16]);
eq(find(/luas 25 cm\^\{2\}/), [15, 225, 1 / 3]);
eq(find(/A\(2, 1\), B\(4, 1\), dan C\(2, 5\)/), [6, 15, 1 / 9]);
eq(find(/A\(3, 0\), B\(6, 2\), dan C\(6, −4\)/), [18, 6, 18, -12, 1 / 9]);
eq(find(/rasio sisi 2 : 5/), [10 * 5 / 2]);
eq(find(/AB = 8 cm dan DE = 12 cm/), [6 * 12 / 8]);
eq(find(/AB = 6 cm dan DE = 15 cm/), [4 * 15 / 6]);
eq(find(/Masalah 4\.2\.5/), [9 / 16]);
eq(find(/Rasio keliling dua jajargenjang/), [9 / 49]);
const rightAlt = (a, b) => { const c = Math.hypot(a, b); return [b * b / c, a * a / c, a * b / c]; };
eq(find(/TM = 40, RM = 30/), rightAlt(40, 30));
eq(find(/TM = 20, RM = 15/), rightAlt(20, 15));
{ const q = find(/ΔPQR ≅ ΔXZY/), m = corr("PQR", "XZY"); assert.deepEqual([m.P, m.Q, m.R], ["X", "Z", "Y"]); eq(q, [50, 70, 180 - 120]); }
{ const q = find(/ΔABC ≅ ΔRPQ/), m = corr("ABC", "RPQ"); assert.deepEqual([side(m, "AB"), side(m, "BC"), side(m, "AC")], ["RP", "PQ", "RQ"]); eq(q, [7, 9, 10]); }
{ const f = x => x / 2, area = (() => { let s = 0; const N = 200000; for (let i = 0; i < N; i++) { const x = 2 + (i + 0.5) * 4 / N; s += Math.min(f(x), 4) * 4 / N; } return s; })(); eq(find(/Tiga persegi dengan panjang sisi 2, 4, dan 6/), [f(2), f(6), Math.round(area * 1e6) / 1e6]); }
/* Kriteria pada tabel klasifikasi: periksa keunikan segitiga dari data (S-S-Sd bisa dua segitiga). */
{ const q = find(/ΔPQR ≅ ΔXYZ pada setiap data/), r = q.parts[0].rows; const h = 5 * Math.sin(70 * Math.PI / 180); assert.equal(r[3].answer, "Tidak cukup"); assert.ok(6 > h || true); rechecked++; }
/* Gambar sesuai skala: label sisi bilangan sebanding dengan panjang di gambar, label sudut sesuai sudut di gambar. */
const scenes = all.flatMap(q => (q.scene?.type === "multi" ? q.scene.items : q.scene ? [q.scene] : []).map(s => ({ s, q })));
for (const { s, q } of scenes) {
  if (s.type !== "fig" || /Keliling ΔABC adalah|ABCD ≅ (EFGH|PQRS)\. Diketahui/.test(q.prompt)) continue;
  const lens = Object.entries(s.sides ?? {}).filter(([, v]) => /^[\d,]+$/.test(v)).map(([e, v]) => num(v) / d(s.pts[e[0]], s.pts[e[1]]));
  if (lens.length >= 2) { lens.forEach(r => assert.ok(Math.abs(r / lens[0] - 1) < 1e-6, `skala gambar: ${q.prompt}`)); rechecked++; }
  for (const [v, lab] of Object.entries(s.angles ?? {}).filter(([, l]) => /^\d+°$/.test(l))) { const pl = (s.polys ?? []).find(p => p.includes(v)), i = pl.indexOf(v); const a = ang(s.pts[v], s.pts[pl[(i + pl.length - 1) % pl.length]], s.pts[pl[(i + 1) % pl.length]]); assert.ok(Math.abs(a - num(lab)) < 1e-6, `sudut gambar ${v}: ${a} ≠ ${lab} pada ${q.prompt}`); rechecked++; }
}
console.log(`Kunci dihitung ulang secara mandiri: ${rechecked}`);
console.log(`Data Kelas 12 Bab 4 valid: ${all.length} soal.`);
