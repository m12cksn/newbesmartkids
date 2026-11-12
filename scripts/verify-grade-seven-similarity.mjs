import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, greek, transValue, relations, relationOf, triFromAngles, triFromSides, sources as D } from "../src/data/grade-seven-similarity.ts";

// Hubungan sudut konsisten dengan nilainya untuk beberapa kemiringan.
for (const t of [35, 65, 110]) relations.forEach(r => r.pairs.forEach(([a, b]) => assert.equal(r.equal ? transValue(t, a) === transValue(t, b) : transValue(t, a) + transValue(t, b) === 180, true, `${r.name} ${a}-${b} t=${t}`)));
assert.equal(new Set(relations.flatMap(r => r.pairs.map(p => [...p].sort().join()))).size, relations.flatMap(r => r.pairs).length, "pasangan unik");
const ang = (P, i) => { const a = P[i], b = P[(i + P.length - 1) % P.length], c = P[(i + 1) % P.length]; const u = [b[0] - a[0], b[1] - a[1]], v = [c[0] - a[0], c[1] - a[1]]; return (Math.acos((u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v)) * 180) / Math.PI; };
const tA = triFromAngles(55, 48); assert.ok(Math.abs(ang(tA, 0) - 55) < 1e-6 && Math.abs(ang(tA, 1) - 48) < 1e-6);
const tS = triFromSides(6, 8, 7); assert.ok(Math.abs(Math.hypot(tS[2][0] - tS[1][0], tS[2][1] - tS[1][1]) - 8) < 1e-9);

assert.equal(topics.length, 3); assert.deepEqual(topics.map(t => t.sections.length), [3, 3, 3]);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 8, 1: 8, 2: 8 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds));

const sideLens = P => P.map((p, i) => Math.hypot(P[(i + 1) % P.length][0] - p[0], P[(i + 1) % P.length][1] - p[1]));
const similar = (A, B) => { const a = sideLens(A), b = sideLens(B), k = b[0] / a[0]; return a.length === b.length && b.every((x, i) => Math.abs(x / a[i] - k) < 1e-6) && A.every((_, i) => Math.abs(ang(A, i) - ang(B, i)) < 1e-6); };
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1).replace(".", ",")); assert.ok(correct(q, swap(String(p.value).replace(".", ","))));
      const g = new RegExp(`^(${greek.join("|")}) =$`).exec(p.label); if (g && q.scene?.type === "trans") { assert.equal(p.value, transValue(q.scene.t, greek.indexOf(g[1])), p.label); rechecked++; } }
    if (p.kind === "pickAngle") { const want = Array.from({ length: 8 }, (_, k) => k).filter(k => k !== p.given && transValue(p.t, k) === transValue(p.t, p.given)); assert.deepEqual(p.answer, want); wrong(want.slice(1).join(",")); rechecked++; }
    if (p.kind === "classify") p.rows.forEach((r, k) => { const g = [...f]; g[k] = p.options.find(o => o !== r.answer); wrong(g.join("|")); });
    if (p.kind === "select") wrong(p.answer.slice(1).join(","));
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
  // Segitiga pada gambar: sudut yang tertulis sesuai bentuknya, dan jumlah sudut 180°.
  const figs = q.scene?.type === "fig" ? [q.scene.fig] : q.scene?.type === "figs" ? q.scene.items.map(x => x.fig) : [];
  figs.forEach(fg => { fg.angles?.forEach((a, k) => { if (a && a !== "?") assert.ok(Math.abs(ang(fg.pts, k) - Number(a.replace("°", ""))) < 1e-6, `${q.prompt} sudut ${a}`); });
    fg.sides?.forEach((s, k) => { if (s && s !== "?") assert.ok(Math.abs(sideLens(fg.pts)[k] - Number(s.replace(",", "."))) < 1e-6, `${q.prompt} sisi ${s}`); }); });
  if (q.scene?.type === "figs" && q.scene.items.length === 2 && q.scene.items[0].fig.pts.length === 3) { assert.ok(similar(q.scene.items[0].fig.pts, q.scene.items[1].fig.pts), `segitiga sebangun ${q.prompt}`); rechecked++; }
}

const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment, P = practice.flat();
D.shapePairs.forEach(sp => assert.equal(similar(sp.a.pts, sp.b.pts) ? "Sebangun" : "Tidak sebangun", sp.answer, `pasangan ${sp.label}`));
assert.deepEqual(key(A, /pasangan gambar/).parts[0].rows.map(r => r.answer), D.shapePairs.map(s => s.answer));
const pic = key(A, /Kinan/).parts[0]; assert.deepEqual(pic.answer, pic.pictures.flatMap((x, k) => (x.w * 12 === x.h * 16 ? [k] : [])));
const pic2 = key(P, /12 cm × 9 cm. Ketuk/).parts[0]; assert.deepEqual(pic2.answer, pic2.pictures.flatMap((x, k) => (x.w * 9 === x.h * 12 ? [k] : [])));
const ratioRows = q => q.parts[0].rows.forEach(r => { const m = /(\d+) × (\d+) dan (\d+) × (\d+)/.exec(r.text); if (m) assert.equal(r.answer, m[1] * m[4] === m[2] * m[3] ? "Sebangun" : "Tidak sebangun", r.text); });
ratioRows(key(A, /pas foto sebangun/)); ratioRows(key(P, /pasangan bangun sebangun/));
key(A, /Dua sudut setiap segitiga/).parts[0].rows.forEach(r => { const [x, y] = r.text.split(" dan ").map(s => s.match(/\d+/g).map(Number)); const full = a => [...a, 180 - a[0] - a[1]].sort((p, q) => p - q).join(); assert.equal(r.answer, full(x) === full(y) ? "Sebangun" : "Tidak sebangun", r.text); });
key(A, /nama hubungan/).parts[0].rows.forEach(r => { const [a, b] = r.text.split(" dan ").map(g => greek.indexOf(g)); assert.equal(r.answer, relationOf(a, b)); });
const alt = key(A, /siku-siku di B/).parts.map(p => p.value); assert.deepEqual(alt, [10, 24, 48 / 10, 36 / 10]);
const de = key(A, /AB = 12 cm, AD = 8 cm/).parts.map(p => p.value); assert.deepEqual(de, [15 * 8 / 12, 9 * 8 / 12]);
assert.equal(key(P, /AB = 10 cm, AD = 4 cm/).parts[0].value, 15 * 4 / 10);
assert.equal(key(A, /bayangan sebuah gedung/).parts[0].value, 160 / 120 * 450); assert.equal(key(P, /bayangan sebuah tiang/).parts[0].value, 150 / 100 * 300);
const sp = key(A, /dalam sepihak besarnya/).parts.map(p => p.value); assert.equal(2 * sp[0] + 10 + 3 * sp[0] - 5, 180); assert.deepEqual(sp.slice(1), [2 * sp[0] + 10, 3 * sp[0] - 5]);
const bis = key(A, /membagi ∠A/).parts.map(p => p.value); assert.deepEqual(bis, [15 * 12 / 20, 15 * 8 / 20]);
assert.deepEqual(key(A, /1 : 2 : 3/).parts.slice(0, 3).map(p => p.value), [30, 60, 90]);
assert.deepEqual(key(A, /Fraktal/).parts.map(p => p.value), [3 ** 3, 1 / 2 ** 3]);
assert.deepEqual(key(A, /6 cm × 4 cm diperbesar/).parts.slice(0, 2).map(p => p.value), [2 * (18 + 12), 18 * 12]);
assert.deepEqual(key(A, /Maket/).parts.map(p => p.value), [24 * 50 / 100, 200 / 50, (30 * 50 / 100) * (20 * 50 / 100)]);
assert.deepEqual(key(A, /△DEF ~ △ABC dengan DE = 4/).parts.slice(0, 2).map(p => p.value), [12.5 / 5, 4 * 12.5 / 5]);
assert.deepEqual(key(A, /penyiku dan pelurusnya/).parts.map(p => p.value), [90 - 38, 180 - 38]);
assert.deepEqual(key(A, /∠A = 125°/).parts.slice(0, 3).map(p => p.value), [55, 125, 55]);
console.log(`Hitungan sudut dan segitiga yang diperiksa ulang: ${rechecked}`);
console.log(`Data Kelas 7 Bab 5 valid: ${all.length} soal, sudut dari gambar dan kunci dihitung ulang.`);
