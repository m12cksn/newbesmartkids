import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, countOf, quarters, sources as D } from "../src/data/grade-five-data.ts";

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
assert.ok(Object.keys(kinds).length >= 7, JSON.stringify(kinds));
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds));

// Posisi jawaban pilihan tidak menumpuk.
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
console.log("Posisi jawaban pilihan:", pos.join(","));
assert.ok(new Set(pos).size >= 3);

const sum = xs => xs.reduce((a, b) => a + b, 0);
const vals = p => p.rows.map(r => r.value);
const barVals = b => b.series[0].values;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (["number", "items", "freq", "picBuild", "barBuild"].includes(p.kind)) f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); p.options.filter(o => o !== p.answer).forEach(wrong); }
    if (p.kind === "order") { assert.deepEqual([...p.answer].sort(), [...p.options].sort()); wrong([...p.answer].reverse().join(";")); }
    // Kunci tabel frekuensi dihitung ulang dari data mentah atau kartu.
    if (p.kind === "freq") p.rows.forEach(r => {
      const sc = q.scene;
      const c = sc.type === "raw" ? countOf(sc.items, Number(r.label)) : sc.items.filter(k => k.likes.includes(r.label)).length;
      assert.equal(r.count, c, `frekuensi ${r.label}`);
      if (sc.type === "raw") assert.equal(sum(p.rows.map(x => x.count)), sc.items.length);
    });
    if (p.kind === "picBuild") p.picto.rows.forEach(r => assert.ok(Number.isInteger(quarters(p.picto, r.value)), `${r.value} tidak dapat digambar per seperempat`));
    if (p.kind === "barBuild") p.fill.forEach(c => assert.equal(p.bars.series[0].values[c], null));
  });
  // Piktogram dan diagram pada soal harus tepat dalam kisi.
  if (q.scene?.type === "picto") (q.scene.picto.drawn ?? vals(q.scene.picto)).forEach(x => assert.ok(Number.isInteger(quarters(q.scene.picto, x))));
  if (q.scene?.type === "bars") q.scene.bars.series.forEach(s => s.values.forEach(x => assert.ok(x % q.scene.bars.minor === 0 && x <= q.scene.bars.max)));
}

// Kunci yang dihitung ulang dari sumber data.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment, P = practice.flat();
const ap = vals(D.apem), tb = vals(D.tabungan), pp = vals(D.perpus), ll = barVals(D.lele);
assert.equal(key(P, /Selasa dan Kamis/).parts[0].items.map(x => x.answer).join(), [ap[1], ap[3]].join());
assert.equal(key(P, /selama seminggu/).parts[0].answer, sum(ap));
assert.equal(key(A, /keuntungan/).parts[0].answer, sum(ap) * 300);
assert.equal(key(A, /minggu ke-3\?/).parts[0].answer, tb[2]);
assert.equal(key(A, /menabung paling banyak/).parts[0].answer, `Minggu ke-${tb.indexOf(Math.max(...tb)) + 1}`);
assert.deepEqual(key(A, /selisih tabungan/).parts[0].items.map(x => x.answer), [Math.abs(tb[1] - tb[4]), sum(tb)]);
const tf = key(A, /alat gambar/).parts[0].statements.map(s => s.answer);
assert.deepEqual(tf, [sum(tb) >= 100000, sum(tb) - 100000 === 3000, Math.min(...tb) === tb[0], tb[2] === 20000]);
assert.deepEqual(key(A, /pendapatan/).parts[0].items.map(x => x.answer), [sum(ll), sum(ll) * 22000]);
assert.deepEqual(key(A, /kolam 2 dan kolam 4/).parts[0].items.map(x => x.answer), [ll[1], ll[3]]);
const lb = key(A, /Lengkapi diagram batang hasil panen lele/).parts[0]; assert.deepEqual(lb.answers, lb.fill.map(c => ll[c]));
const mb = key(P, /Lengkapi diagram batang perolehan/).parts[0]; assert.deepEqual(mb.answers, mb.fill.map(c => barVals(D.medali)[c]));
assert.equal(key(P, /tahun 2015/).parts[0].answer, barVals(D.medali)[1]);
const kc = D.kalori; assert.equal(key(A, /kalorinya paling tinggi/).parts[0].answer, kc.cats[barVals(kc).indexOf(Math.max(...barVals(kc)))]);
const [sl, sp] = D.siswa.series.map(s => s.values); assert.deepEqual(key(P, /diagram batang ganda/).parts[0].items.map(x => x.answer), [Math.abs(sl[2] - sp[2]), sl[4] + sp[4]]);
const [n1, n2] = D.nilai.series.map(s => s.values), dif = n2.map((x, k) => x - n1[k]);
const nq = key(A, /naik paling tinggi/).parts; const best = (ok, f) => nq[ok].options.reduce((a, o) => (f(dif[D.nilai.cats.indexOf(o)]) > f(dif[D.nilai.cats.indexOf(a)]) ? o : a));
assert.equal(nq[0].answer, best(0, x => x)); assert.equal(nq[1].answer, best(1, x => -x));
const [il, ip] = D.internet.series.map(s => s.values);
const iq = key(A, /pengguna internet/).parts[0].statements.map(s => s.answer);
assert.deepEqual(iq, [Math.max(...ip) > Math.max(...il), il[1] + ip[1] === 31, il.every((x, k) => x > ip[k]), il[3] + ip[3] === 13]);
const days = D.perpus.rows.map(r => r.label); assert.deepEqual(key(A, /Urutkan hari/).parts[0].answer, [...days].sort((a, b) => pp[days.indexOf(a)] - pp[days.indexOf(b)]));
const wrongDay = D.apemWrong.drawn.findIndex((x, k) => x !== ap[k]); assert.equal(key(A, /gambarnya salah/).parts[0].answer, D.apem.rows[wrongDay].label);
const sc = D.scores, rem = sc.filter(x => x < 70).length;
assert.equal(key(A, /Berapa siswa yang mengikuti remedi/).parts[0].answer, rem);
assert.equal(key(A, /tidak remedi dan yang remedi/).parts[0].answer, sc.length - 2 * rem);
assert.deepEqual(key(A, /nilai 25 siswa. Berapa nilai tertinggi/).parts[0].items.map(x => x.answer), [Math.max(...sc), countOf(sc, Math.max(...sc))]);
assert.deepEqual(key(P, /nilai tertinggi, dan/).parts[0].items.map(x => x.answer), [Math.max(...D.scoresP2), countOf(D.scoresP2, Math.max(...D.scoresP2))]);
const vc = D.vegNames.map(n => D.veg.filter(k => k.likes.includes(n)).length);
assert.equal(key(A, /paling banyak disukai/).parts[0].answer, D.vegNames[vc.indexOf(Math.max(...vc))]);
assert.equal(vc.filter(x => x === Math.max(...vc)).length, 1);
const tc = key(A, /Tentukan benar atau salah\.$/).parts[0].statements.map(s => s.answer);
const V = n => vc[D.vegNames.indexOf(n)];
assert.deepEqual(tc, [V("Tomat") > V("Bayam"), Math.min(...vc) === V("Kol") && vc.filter(x => x === V("Kol")).length === 1, V("Kangkung") === V("Buncis") && V("Buncis") === V("Sawi")]);
assert.equal(key(A, /teka-teki/).parts[0].answer, 60 / 3 + 3 * (40 / 5));
assert.equal(key(P, /teka-teki/).parts[0].answer, 3 * (100 / 2));

console.log(`Data Kelas 5 Bab 8 valid: ${all.length} soal, kunci dihitung ulang dari data.`);
