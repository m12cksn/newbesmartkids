import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, num } from "../src/data/grade-eight-linear.ts";

assert.equal(topics.length, 4); assert.deepEqual(topics.map(t => t.sections.length), [3, 3, 2, 3]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 11, "peraga berbeda di setiap bagian");
topics.forEach(t => t.sections.forEach(s => assert.ok(s.life.length > 80 && s.steps.length >= 4 && s.example.length > 30, `materi lengkap ${s.title}`)));
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 6, 1: 6, 2: 6, 3: 6 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| bergambar:", assessment.filter(q => q.scene || q.parts.some(p => p.pics)).length);
assert.ok(Object.keys(kinds).length >= 6, "variasi jenis jawaban");
const pos = assessment.flatMap(q => q.parts).filter(p => p.kind === "choice" && p.options.length > 2).map(p => p.options.indexOf(p.answer));
assert.ok(new Set(pos).size >= 3, `posisi jawaban ${pos}`); console.log("Posisi jawaban pilihan ganda:", pos.join(","));

/* Ekspresi uji: satu variabel huruf, operator JS; '==' dibandingkan dengan toleransi. */
const evalAt = (expr, v) => {
  const vars = [...new Set((expr.match(/\b[a-z]\b/g) ?? []))]; assert.ok(vars.length <= 1, `satu variabel: ${expr}`);
  const body = expr.split("&&").map(e => e.includes("==") ? (([l, r]) => `Math.abs((${l})-(${r}))<1e-9`)(e.split("==")) : e).join("&&");
  return Function(vars[0] ?? "_", `"use strict"; return (${body});`)(v);
};
const holds = (sign, b, t) => (sign === "<" ? t < b : sign === ">" ? t > b : sign === "≤" ? t <= b : t >= b);
/* Model susun: ubah ke ekspresi JS. */
const toJs = s => s.replace(/(\d)\.(\d{3})/g, "$1$2").replace(/×/g, "*").replace(/−/g, "-").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/(^|[^<>])=(?!=)/g, "$1==");
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1).replace(".", ",")); wrong(String(-p.value - 1));
      if (p.check) { assert.ok(evalAt(p.check, p.value), `cek ${p.check} di ${p.value}`); if (!p.check.includes("&&")) { assert.ok(!evalAt(p.check, p.value + 1) && !evalAt(p.check, p.value - 1), `tunggal ${p.check}`); } rechecked++; } }
    if (p.kind === "ineq") { const other = { "<": "≤", "≤": "<", ">": "≥", "≥": ">" }[p.sign]; wrong(`${other}|${f[1]}`); wrong(`${p.sign}|${String(p.value + 1)}`);
      for (let t = p.value - 4; t <= p.value + 4; t += 0.25) assert.equal(evalAt(p.check, t), holds(p.sign, p.value, t), `${p.check} di ${t}`); rechecked++; }
    if (p.kind === "set") { wrong(f[0].split(",").slice(1).join(",")); wrong(`${f[0]},${p.max}`); }
    if (p.kind === "build") { const ids = f[0].split(","); wrong(ids.slice(0, -1).join(",")); const sgn = ids.findIndex(k => /[=<>≤≥]/.test(p.tiles[k])), alt = p.tiles.findIndex((t, k) => /[=<>≤≥]/.test(t) && t !== p.tiles[ids[sgn]]); if (alt >= 0) wrong(ids.map((k, j) => (j === sgn ? alt : k)).join(","));
      // semua bentuk yang diterima setara: kebenarannya sama di banyak titik, termasuk penyelesaiannya
      const js = p.accept.map(toJs), base = js[0], vName = (base.match(/\b[a-z]\b/) ?? [])[0];
      const fn = s => t => Function(vName, `"use strict"; return (${s});`)(t);
      const lhsMinus = base.includes("==") ? (([l, r]) => t => Function(vName, `return (${l})-(${r})`)(t))(base.split("==")) : null;
      const sample = Array.from({ length: 81 }, (_, k) => k - 40).flatMap(k => [k, k * 1000, k * 5000]);
      if (lhsMinus) { const r0 = lhsMinus(0), r1 = lhsMinus(1), sol = -r0 / (r1 - r0); sample.push(sol); assert.ok(fn(base)(sol), `penyelesaian model ${base}`); }
      else { const nums = base.match(/\d+/g).map(Number); nums.forEach(nn => sample.push(nn, nn + 0.5, nn - 0.5)); }
      js.forEach(s => sample.forEach(t => assert.equal(fn(s)(t), fn(base)(t), `${s} vs ${base} di ${t}`)));
      p.tiles.forEach(t => assert.equal(p.tiles.filter(x => x === t).length, 1, "ubin unik")); rechecked++; }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const check = (a, b) => { assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`); rechecked++; };
const seq = (n, f) => Array.from({ length: n }, (_, k) => k + 1).filter(f);
// Himpunan penyelesaian dihitung ulang.
assert.deepEqual(find(/kelipatan 6 yang kurang dari 30/).parts[0].values, seq(30, m => m % 6 === 0 && m < 30));
assert.deepEqual(find(/\(k − 1\) membagi habis 10/).parts[0].values, seq(12, k => k > 1 && 10 % (k - 1) === 0));
assert.deepEqual(find(/kelipatan 2 dan juga kelipatan 3/).parts[0].values, seq(40, a => a % 6 === 0 && a < 40)); rechecked += 3;
// Substitusi nilai pada pernyataan benar/salah.
for (const [re, val] of [[/Apakah −4 merupakan/, -4], [/Apakah −3 merupakan/, -3]]) find(re).parts[0].statements.forEach(s => {
  const js = s.text.replace(/(\d)([a-z])/g, "$1*$2").replace(/−/g, "-").replace(/≤/g, "<=").replace(/≥/g, ">="); assert.equal(evalAt(js, val), s.answer, s.text); rechecked++; });
find(/Analisis nilai kebenaran/).parts[0].statements.forEach((s, k) => assert.equal(s.answer, [32 * 3 / 4 === 24, -6 * -5 === -30, 3600 / 4 === 900, false][k], s.text));
// Garis bilangan pada pilihan ganda sesuai pertidaksamaannya.
const rayOk = (r, sign, b) => r.at === b && r.closed === (sign === "≤" || sign === "≥") && r.dir === (sign === "<" || sign === "≤" ? "left" : "right");
for (const [re, sign, b] of [[/menunjukkan x > −2/, ">", -2], [/menunjukkan x ≥ −3/, "≥", -3], [/penyelesaian −5\(x \+ 2\) ≤ 15/, "≥", -5]]) {
  const p = find(re).parts[0]; p.options.forEach((o, k) => assert.equal(rayOk(p.pics[k].items[0], sign, b), o === p.answer, `${re} ${o}`)); rechecked++; }
assert.ok(evalAt("-5*(x + 2) <= 15", -5) && !evalAt("-5*(x + 2) <= 15", -5.1));
for (const [re, sign, b, k] of [[/ditunjukkan garis bilangan berikut/, "≤", 3, 0]]) { const q = find(re); assert.ok(rayOk(q.scene.items[k], sign, b)); assert.equal(q.parts[0].sign, sign); assert.equal(q.parts[0].value, b); rechecked++; }
const two = find(/ditunjukkan setiap garis bilangan/); two.parts.forEach((p, k) => { assert.ok(rayOk(two.scene.items[k], p.sign, p.value)); rechecked++; });
// Timbangan.
const bal = find(/menggambarkan persamaan n \+ 3 = 7/).parts[0]; bal.options.forEach((o, k) => { const s = bal.pics[k]; assert.equal(s.left.box === 1 && s.left.unit === 3 && s.right.unit === 7, o === bal.answer); }); rechecked++;
const bp = find(/Timbangan berikut seimbang/); check(bp.parts[0].value * bp.scene.left.box + bp.scene.left.unit, bp.scene.right.unit);
const doni = find(/Doni menimbang/), [ga, gb] = doni.scene.items.map(it => it.right.weights.reduce((a, b) => a + b, 0));
assert.deepEqual(doni.parts[0].options.map(o => parseInt(o)).filter(b => b < ga && 3 * b > gb).map(b => `${b} g`), [doni.parts[0].answer]); rechecked++;
assert.equal(find(/berusia di bawah 17 tahun/).parts[0].answer, "x + 2 < 17");
// Soal cerita.
const truck = find(/pick up hanya dapat membawa muatan 1.500/); check(truck.parts[0].value, Math.floor((1500 - 140) / 40)); check(truck.parts[1].value, Math.ceil(200 / truck.parts[0].value));
check(find(/Humam memiliki uang Rp150/).parts[1].value, Math.floor(150000 / 12000));
const shoe = find(/sepatu dua kali lipat/); check(shoe.parts[0].value, 480000 / (5 * 2 + 6)); check(shoe.parts[1].value, 2 * shoe.parts[0].value);
check(find(/Nadia/).parts[1].value, 90 * 5 - (88 + 79 + 94 + 91));
const pool = find(/kolam berbentuk balok/); check(pool.parts[1].value, pool.parts[0].value + 2);
const iso = find(/Segitiga sama kaki/); check(iso.parts[0].value, 66 / 11); check(iso.parts[1].value, 5 * iso.parts[0].value); assert.ok(iso.parts[0].value * 2 <= 5 * iso.parts[0].value, "x, x, 5x bukan segitiga");
const tri1 = find(/nilai m pada segitiga/); check(Math.max(tri1.parts[0].value, 2 * tri1.parts[0].value, tri1.parts[0].value + 20), tri1.parts[1].value);
const tri2 = find(/\(x \+ 15\)°, 2x°, dan \(3x − 15\)°/), xx = tri2.parts[0].value; check(Math.max(xx + 15, 2 * xx, 3 * xx - 15), tri2.parts[1].value);
const jer = find(/Rina mengupas 12 jeruk/).parts[0].statements; assert.deepEqual(jer.map(s => s.answer), [true, 12 + 8 === 20, 15 + 20 === 30]);
check(find(/bernapas sekitar 21.600/).parts[1].value, 21600 / (24 * 60));
assert.equal(num("−7/2"), -3.5); assert.equal(num("1.440"), 1440); assert.equal(num("12,5"), 12.5);
console.log(`Kunci dihitung ulang dari persamaan, garis bilangan, timbangan dan data: ${rechecked}`);
console.log(`Data Kelas 8 Bab 3 valid: ${all.length} soal.`);
