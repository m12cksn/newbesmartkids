import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, words, digitsOf, places, units, paymentOk, fmt, sources as D } from "../src/data/grade-five-million.ts";

// Pembaca bilangan sesuai buku.
assert.equal(words(875428), "delapan ratus tujuh puluh lima ribu empat ratus dua puluh delapan");
assert.equal(words(979875), "sembilan ratus tujuh puluh sembilan ribu delapan ratus tujuh puluh lima");
assert.equal(words(123456), "seratus dua puluh tiga ribu empat ratus lima puluh enam");
assert.equal(words(111011), "seratus sebelas ribu sebelas");
assert.equal(words(1000), "seribu"); assert.equal(words(10010), "sepuluh ribu sepuluh"); assert.equal(words(1000000), "satu juta"); assert.equal(words(604007), "enam ratus empat ribu tujuh");
assert.equal(fmt(345600), "345.600");

assert.equal(topics.length, 3);
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
assert.ok(Object.keys(kinds).length >= 10, JSON.stringify(kinds));
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds));

const fromText = s => { const m = /^(.*) ribu (.*)$/.exec(s); return m ? m : null; };
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (["number", "items", "seq", "expand", "cards"].includes(p.kind)) f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "place") f.forEach((_, k) => { const g = [...f]; g[k] = String((Number(g[k]) + 1) % 10); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "signs") { p.pairs.forEach(([a, b], k) => { assert.equal(f[k], a > b ? ">" : a < b ? "<" : "="); const g = [...f]; g[k] = g[k] === "<" ? ">" : "<"; wrong(g.join("|")); }); }
    if (p.kind === "placeName") p.rows.forEach((r, k) => { const g = [...f]; g[k] = places.find(o => o !== r.answer); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
    if (p.kind === "order") { assert.deepEqual([...p.answer].sort(), [...p.options].sort()); wrong([...p.answer].reverse().join(";")); }
    if (p.kind === "words") { wrong(words(p.n + 1)); wrong(words(p.n).replace(" ribu", "")); }
    if (p.kind === "expand") assert.equal(f.reduce((a, b) => a + Number(b), 0), p.n);
    if (p.kind === "seq") { let k = 0; for (const row of p.rows) { const full = row.map(x => (x === null ? p.answers[k++] : x)); const d = full[1] - full[0]; full.forEach((x, j) => j && assert.equal(x - full[j - 1], d, `barisan ${q.prompt}`)); } assert.equal(k, p.answers.length); }
    if (p.kind === "cards") { const s = String(p.answer); assert.deepEqual(s.split("").map(Number).sort(), [...p.digits].sort()); assert.notEqual(s[0], "0");
      const perms = []; const go = (rest, acc) => { if (!rest.length) { if (acc[0] !== 0) perms.push(Number(acc.join(""))); return; } rest.forEach((d, j) => go(rest.filter((_, k) => k !== j), [...acc, d])); }; go(p.digits, []);
      assert.equal(p.answer, /terbesar/.test(p.label) ? Math.max(...perms) : Math.min(...perms)); }
    if (p.kind === "payment") {
      const n = p.denoms.length;
      p.sample.forEach(r => { assert.equal(r.reduce((a, c, k) => a + c * p.denoms[k], 0), p.price, "contoh bayar"); r.forEach((c, k) => assert.ok(c <= p.stock[k])); });
      const x = f; assert.ok(paymentOk(p, x));
      const dup = [...x]; for (let k = 0; k < n; k++) dup[n + k] = x[k]; assert.ok(!paymentOk(p, dup), "cara sama ditolak");
      const off = [...x]; off[0] = String(Number(off[0]) + 1); assert.ok(!paymentOk(p, off), "jumlah salah ditolak");
      const over = x.map(String); over.splice(0, n, ...p.stock.map((s, k) => String(k === n - 1 ? s + 1 : 0))); assert.ok(!paymentOk(p, over), "persediaan dilanggar");
      // Cara lain yang sah juga diterima.
      const rows = []; const rec = (k, left, acc) => { if (k === n) { if (left === 0) rows.push(acc); return; } for (let c = 0; c <= p.stock[k] && c * p.denoms[k] <= left; c++) rec(k + 1, left - c * p.denoms[k], [...acc, c]); }; rec(0, p.price, []);
      assert.ok(rows.length >= p.ways + 1, `cara bayar cukup banyak: ${rows.length}`);
      const alt = rows.slice(-p.ways).flat().map(String); assert.ok(paymentOk(p, alt), "cara lain diterima");
    }
  });
  // Bilangan dalam teks soal ditulis ulang sebagai angka untuk kunci "Bentuk angka".
  if (q.scene?.type === "text") { const n = q.parts[0].answer; assert.equal(words(n), q.scene.lines[0]); }
}

// Kunci yang dihitung ulang dari sumber.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment, P = practice.flat();
const sh = D.shoes.items, byPrice = [...sh].sort((a, b) => b.price - a.price).map(s => s.label);
assert.deepEqual(key(P, /sepatu dari/).parts[0].answer, byPrice); assert.deepEqual(key(A, /sepatu dari/).parts[0].answer, byPrice);
const vs = D.visitors; assert.deepEqual(key(A, /Urutkan tahun/).parts[0].answer, [...vs.labels].sort((a, b) => vs.values[vs.labels.indexOf(a)] - vs.values[vs.labels.indexOf(b)]));
const tv = key(A, /grafik wisatawan/).parts[0].statements.map(s => s.answer);
assert.deepEqual(tv, [vs.values[3] > vs.values[2], Math.min(...vs.values) === vs.values[4], vs.values.filter(x => x > 400000).length === 2, words(vs.values[0]) === "tiga ratus enam puluh dua ribu empat ratus lima puluh"]);
const mu = D.museum; assert.equal(key(P, /pengunjung museum/).parts[0].answer, mu.labels[mu.values.indexOf(Math.max(...mu.values))]);
const pn = key(A, /angka 9/).parts[0].rows; D.shop.items.forEach((it, k) => assert.equal(pn[k].answer, places[digitsOf(it.price).indexOf(9)]));
D.shop.items.forEach(it => assert.equal(String(it.price).split("9").length, 2, "angka 9 tunggal"));
const kas = key(A, /538\.274/).parts[0].rows; digitsOf(538274).forEach((d, k) => { assert.equal(kas[k].text, `Angka ${d}`); assert.equal(kas[k].answer, places[k]); });
const sum = g => g.notes.reduce((a, [v, n]) => a + v * n, 0);
const w9 = key(A, /dompet Ibu. Berapa jumlahnya/); assert.equal(w9.parts[0].answer, sum(w9.scene.groups[0])); assert.equal(w9.parts[1].rows[0].n, sum(w9.scene.groups[0]));
const wp = key(P, /dompet Ibu. Berapa jumlah uangnya/); assert.deepEqual(wp.parts[0].items.map(x => x.answer), [sum(wp.scene.groups[0]), digitsOf(sum(wp.scene.groups[0]))[1] * 10000]);
const yk = key(A, /Yosep dan uang Komang/); const [ys, ks] = yk.scene.groups.map(sum); assert.deepEqual(yk.parts[0].items.map(x => x.answer), [ys, ks, Math.abs(ys - ks)]);
assert.equal(key(A, /4 ratus ribuan, 6 ribuan/).parts[0].answer, 4 * 100000 + 6 * 1000 + 3 * 100 + 8);
assert.equal(key(A, /12 ribuan/).parts[0].answer, 3 * 100000 + 12 * 1000 + 5 * 100 + 14);
assert.equal(key(P, /3 ratus ribuan, 2 puluh/).parts[0].answer, 327100);
const box = key(A, /paling kecil untuk mengisi kotak/); const okDigits = [...Array(10).keys()].filter(d => Number(`5${d}8214`) > 548300); assert.equal(box.parts[0].answer, Math.min(...okDigits));
const miss = key(A, /hilang dari dekomposisi/); assert.equal(miss.parts[0].answer, 614385 - (4000 + 300 + 5 + 600000 + 80));
const t19 = key(A, /^Tentukan benar atau salah\.$/).parts[0].statements.map(s => s.answer);
assert.deepEqual(t19, [digitsOf(608040)[2] * 1000 === 8000, words(604007) === "enam ratus empat ribu tujuh", digitsOf(316825)[2] * units[2] === 600, words(1000000) === "sepuluh ratus ribu"]);
const t20 = key(A, /Pilihlah pernyataan/).parts[0].statements.map(s => s.answer); const L = [676785, 786897, 789876, 789867];
assert.deepEqual(t20, [275000 > 257000, L.every((x, k) => !k || x > L[k - 1]), 900009 < 909000]);
const pv = key(P, /624\.957/).parts; assert.equal(pv[0].answer, places[1]); assert.equal(pv[1].answer, 2 * units[1]);

console.log(`Data Kelas 5 Bab 9 valid: ${all.length} soal, kunci dihitung ulang dan jawaban lain yang sah diterima.`);
