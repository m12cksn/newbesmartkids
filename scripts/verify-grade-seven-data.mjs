import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, countOf, sum, sources as D } from "../src/data/grade-seven-data.ts";

assert.equal(topics.length, 6); assert.deepEqual(topics.map(t => t.sections.length), [2, 2, 2, 2, 2, 2]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 12, "peraga berbeda di setiap bagian");
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 4, 1: 4, 2: 4, 3: 4, 4: 4, 5: 4 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)));
console.log("Jenis gambar evaluasi:", JSON.stringify(tally(assessment, q => q.scene?.type ?? "tanpa")));

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1).replace(".", ",")); assert.ok(correct(q, swap(String(p.value).replace(".", ",")))); }
    if (p.kind === "classify") { p.rows.forEach((r, k) => { assert.ok(p.options.includes(r.answer)); const g = [...f]; g[k] = p.options.find(o => o !== r.answer); wrong(g.join("|")); }); }
    if (p.kind === "select") { wrong(p.answer.slice(1).join(",")); wrong([...p.answer, p.options.findIndex((_, k) => !p.answer.includes(k))].sort().join(",")); }
    if (p.kind === "order") { assert.deepEqual([...p.options].sort(), [...p.answer].sort()); wrong([...p.answer].reverse().join(";")); }
    if (p.kind === "table") f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k].replace(",", ".")) + 1); wrong(g.join("|")); });
    if (p.kind === "plot" || p.kind === "bars") f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
  if (q.scene?.type === "pie") assert.ok(q.scene.pie.parts.every(x => x.value > 0));
}

// Kunci dihitung ulang dari data sumber.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const vals = q => q.parts.map(p => p.value);
const A = assessment, P = practice.flat();
const mode = xs => { const m = Math.max(...xs.map(x => countOf(xs, x))); return [...new Set(xs.filter(x => countOf(xs, x) === m))]; };
assert.deepEqual(vals(key(A, /line plot panjang nama siswa kelas 7A/)), [countOf(D.names7A, 13), D.names7A.length, ...mode(D.names7A)]);
assert.deepEqual(vals(key(P, /line plot panjang nama siswa kelas 7B/)), [countOf(D.names7B, 14), D.names7B.filter(x => x > 20).length, D.names7B.length]);
const pageData = key(A, /halaman yang dibaca 16 siswa/);
const pages = pageData.scene.items; assert.equal(pages.length, 16);
assert.deepEqual(vals(pageData), [Math.max(...pages) - Math.min(...pages), ...mode(pages), pages.filter(x => x > 50).length]);
for (const re of [/^Buatlah line plot dari data berikut/, /^Buatlah line plot dari data panjang nama/]) { const q = key([...P, ...A], re); assert.deepEqual(q.parts[0].data, q.scene.items); assert.ok(q.parts[0].data.every(x => x >= q.parts[0].min && x <= q.parts[0].max)); }
assert.deepEqual(vals(key(P, /tabel banyak aplikasi permainan online siswa 7C/)), [sum(D.apps), D.apps.indexOf(Math.max(...D.apps)), D.apps[6]]);
assert.equal(key(A, /tabel banyak aplikasi permainan online siswa 7C/).parts[1].value, sum(D.apps.slice(4)));
const qv = D.quota.series[0].values, qc = D.quota.cats;
assert.deepEqual(vals(key(A, /kuota internet/)).filter(x => x !== undefined), [qv[qc.indexOf("11")], Math.max(...qv)]);
assert.equal(qc[qv.indexOf(Math.max(...qv))], "10");
assert.equal(key(P, /kuota internet/).parts[0].value, qv[qc.indexOf("8")]); assert.equal(qc[qv.indexOf(7)], "12");
const [m16, m20] = D.medals.series.map(s => s.values);
assert.deepEqual(key(A, /medali emas Olimpiade 2016 dan 2020/).parts[0].answer, D.medals.cats.flatMap((_, k) => (m20[k] > m16[k] ? [k] : [])));
assert.equal(key(A, /medali emas Olimpiade 2016 dan 2020/).parts[1].answer, D.medals.cats[m16.indexOf([...m16].sort((a, b) => b - a)[1])]);
assert.equal(key(P, /medali emas Olimpiade\./).parts[0].answer, D.medals.cats[m20.indexOf([...m20].sort((a, b) => b - a)[1])]);
const [sp, sw] = D.shoes.series.map(s => s.values);
assert.equal(key(A, /sepatu terjual/).parts[0].answer, D.shoes.cats[sp.indexOf(Math.max(...sp))]); assert.equal(key(A, /sepatu terjual/).parts[1].value, sp[0] - sp[2]);
assert.equal(key(P, /sepatu terjual/).parts[0].value, sw[1] - sw[2]);
const cv = D.cars.series[0].values; assert.deepEqual(vals(key(P, /mobil berdasarkan warna/)), [cv[2], cv[0] - cv[3], sum(cv)]);
const vv = D.visitors.series[0].values; assert.deepEqual(vals(key(A, /pengunjung taman/)), [vv[3], vv[2] - vv[1], vv[3] + (vv[3] - vv[2])]);
const [s7c, s7d] = D.sports.series.map(s => s.values); assert.deepEqual(key(P, /cabang olahraga/).parts[0].answer, D.sports.cats.flatMap((_, k) => (s7d[k] > s7c[k] ? [k] : [])));
const [c90, c98] = D.co2.series.map(s => s.values);
const co = key(A, /emisi CO₂ tahun 1990/); assert.deepEqual([co.parts[0].value, co.parts[1].value], [c98[4] - c90[4], ((c90[4] - c98[4]) / c90[4]) * 100]);
assert.deepEqual(co.parts[2].answer, D.co2.cats.flatMap((_, k) => (c98[k] > c90[k] ? [k] : [])));
assert.deepEqual(vals(key(P, /Emisi CO₂ Amerika/)), [c98[0] - c90[0], ((c98[0] - c90[0]) / c90[0]) * 100]);
const [em, pe, pu] = D.sea.series.map(s => s.values); const seaQ = key(A, /SEA Games/);
assert.equal(seaQ.parts[0].answer, D.sea.cats[em.indexOf(Math.max(...em))]);
assert.deepEqual(seaQ.parts[1].answer, D.sea.cats.flatMap((_, k) => (pe[k] > pu[k] ? [k] : [])));
assert.deepEqual(D.sea.cats.slice(1).filter((_, k) => Math.abs(em[k + 1] / em[k] - 2) < 0.1), [seaQ.parts[2].answer]);
const kt = sum(D.kaus.map(k => k.value)); assert.equal(kt, 40);
assert.deepEqual(key(A, /penjualan kaus/).parts[0].answers, D.kaus.flatMap(k => [(k.value / kt) * 100, (k.value / kt) * 360]));
assert.deepEqual(key(P, /diagram batang dari tabel warna kaus/).parts[0].values, D.kaus.map(k => k.value));
assert.deepEqual(key(A, /cara siswa kelas 7E/).parts[0].values, D.transport.map(t => t.f));
const ot = sum(D.osis.map(o => o.value)), os = key(A, /ketua OSIS/);
assert.deepEqual([os.parts[0].value, os.parts[2].value, os.parts[3].value], [ot, (21 / ot) * 100, (D.osis.find(o => o.name === "Noer").value / ot) * 360]);
assert.equal(os.parts[1].answer, D.osis.reduce((a, b) => (b.value > a.value ? b : a)).name);
const pt = sum(D.password.map(x => x.value)); assert.deepEqual(vals(key(P, /password/)), [(30 / pt) * 100, (15 / pt) * 360]);
const ft = sum(D.food.map(f => f.value)); assert.deepEqual(key(P, /makanan favorit/).parts[0].answers, D.food.map(f => (f.value / ft) * 360));
const nk = sum(D.nutrients.map(t => t.k)), x = 360 / nk; assert.deepEqual(vals(key(A, /Sudut juring komponen/)), [x, (3 * x / 360) * 100, 135 / (9 * x / 360)]);
assert.deepEqual(vals(key(P, /hard disk 216°/)), [(216 / 360) * 100, (216 / 360) * 500]);
assert.equal(key(P, /72 siswa/).parts[0].value, (50 / 360) * 72);
assert.deepEqual(vals(key(A, /perempuan 40%/)), [60, 0.6 * 360]);
assert.deepEqual(vals(key(A, /YouTube/)), [0.8 * 180, 0.9 * 200, ((0.9 * 200 - 0.8 * 180) / (0.8 * 180)) * 100].map(v => Math.round(v * 1e9) / 1e9));
assert.equal(key(A, /Bella berkata/).parts[1].value, 70 / 50);
console.log(`Data Kelas 7 Bab 6 valid: ${all.length} soal, kunci dihitung ulang dari data diagram.`);
