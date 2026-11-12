import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, simplest, num, idn, sources as D } from "../src/data/grade-seven-ratio.ts";

assert.deepEqual(simplest(2.8, 4.2), [2, 3]); assert.deepEqual(simplest(3.6, 5.4), [2, 3]); assert.equal(num("1.350"), 1350); assert.equal(num("8,4"), 8.4); assert.equal(idn(21250), "21.250");

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
assert.ok(Object.keys(kinds).length >= 9, JSON.stringify(kinds));
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds));

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const ok = g => assert.ok(correct(q, swap(g)), `diterima: ${q.prompt} ${p.kind} ${g}`);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "ratio") { const [a, b] = f.map(Number); wrong(`${b}|${a}`); wrong(`${a + 1}|${b}`); const dbl = `${a * 2}|${b * 2}`; p.simplest ? wrong(dbl) : ok(dbl);
      if (p.simplest) { const [x, y] = simplest(p.a, p.b); assert.equal(f.join(), `${x},${y}`); } }
    if (p.kind === "frac") { const [n, d] = f.map(Number); ok(`${n * 3}|${d * 3}`); wrong(`${d}|${n}`); wrong(`${n + 1}|${d}`); }
    if (p.kind === "num") { ok(f[0]); assert.ok(!f[0].includes(".")); if (p.value >= 1000) ok(idn(p.value)); wrong(String(Math.round((p.value + Math.max(1, Math.abs(p.value) * 0.1)) * 1e4) / 1e4).replace(".", ",")); }
    if (p.kind === "classify") p.rows.forEach((r, k) => { const g = [...f]; g[k] = p.options.find(o => o !== r.answer); wrong(g.join("|")); });
    if (p.kind === "select") { wrong(p.answer.slice(1).join(",")); }
    if (p.kind === "order") { assert.deepEqual([...p.answer].sort(), [...p.options].sort()); wrong([...p.answer].reverse().join(";")); }
    if (p.kind === "pie") { wrong(Array.from({ length: p.target - 1 }, (_, k) => k).join(",")); ok(Array.from({ length: p.target }, (_, k) => p.sectors - 1 - k).sort((a, b) => a - b).join(",")); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}

// Kunci yang dihitung ulang dari sumber dan dari teks soal.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment, P = practice.flat();
const near = (a, b, t = 1e-9) => assert.ok(Math.abs(a - b) <= t, `${a} ≈ ${b}`);
const bq = key(A, /Empat botol/).parts; D.bottles.forEach((b, k) => near(bq[k].value, b.milk / b.spoon));
const rates = D.bottles.map(b => b.milk / b.spoon); assert.equal(rates.filter(r => r === Math.min(...rates)).length, 1); assert.equal(bq[4].answer, D.bottles[rates.indexOf(Math.min(...rates))].name);
const cq = key(A, /Susunlah cokelat/).parts[0]; const per = D.chocolates.map(c => c.rp / c.g); assert.equal(new Set(per).size, per.length);
assert.deepEqual(cq.answer, [...D.chocolates].sort((a, b) => a.rp / a.g - b.rp / b.g).map(c => c.name));
const car = key(A, /empat mobil/).parts; const eff = D.cars.map(c => c.km / c.l); assert.equal(car[0].answer, D.cars[eff.indexOf(Math.max(...eff))].name); near(car[1].value, Math.max(...eff));
const isl = key(A, /komodonya/).parts; const den = D.islands.map(i => i.pop / i.km2); assert.equal(isl[0].answer, D.islands[den.indexOf(Math.max(...den))].name); near(isl[1].value, Math.max(...den));
const pics = key(A, /Gambar A berukuran 12/).parts[0].rows; D.pictures.slice(1).forEach((p, k) => assert.equal(pics[k].answer === "Proporsional", p.w * 9 === p.h * 12, p.label));
const gq = key(A, /gelas-gelas berisi susu/); const g = gq.scene.groups[0]; assert.equal(gq.parts[0].n / gq.parts[0].d, g.choc / (g.milk + g.choc)); assert.deepEqual([gq.parts[1].a, gq.parts[1].b], [g.milk, g.choc]);
const bar = key(A, /72% cokelat/).parts; near(bar[0].value, 0.72 * 150); near(bar[1].value, 150 - 0.72 * 150);
near(key(A, /18 cm × 12 cm/).parts[0].value, 12 * 27 / 18);
const kel = key(A, /kelinci/).parts; near(kel[0].value, 6 * 75); near(kel[1].value, 900 / 75);
const mg = key(A, /Toko A menjual mangga Rp36/).parts; near(mg[0].value, 36000 / 1.5); near(mg[1].value, 17000 / 0.8); assert.equal(mg[2].answer, 36000 / 1.5 < 17000 / 0.8 ? "Toko A" : "Toko B");
near(key(A, /alkohol terhadap air/).parts[3].value, 0.6 * 250);
const map = key(A, /garis hitam sepanjang 3 cm/).parts; near(map[0].value, 150 * 100000 / 3); near(map[1].value, 27 * 150 / 3); near(map[2].value, 1800 / (150 / 3));
const glas = key(A, /takaran berbeda: gelas kiri/).parts[0].statements.map(s => s.answer); assert.deepEqual(glas, [3 / 2 === 6 / 5, 6 / 5 > 3 / 2, 3 / 2 > 6 / 5]);
near(key(A, /Kamar berukuran/).parts[0].value, 600 / 12);
const sir = key(A, /sirup lemon/).parts; near(sir[0].value, 10); near(sir[1].value, 5 * 8 / 2); near(sir[2].value, 7 - 15 / 5 * 2);
const box = key(A, /massa jenis kedua/); const dens = box.scene.items.map(b => b.mass / (b.p * b.l * b.t)); near(box.parts[0].value, dens[0]); near(box.parts[1].value, dens[1]); assert.equal(box.parts[2].answer, dens[1] > dens[0] ? "Sampel B" : "Sampel A");
const kls = key(A, /kelas 7A adalah 3 : 4/).parts[0].statements.map(s => s.answer); assert.deepEqual(kls, [3 / 4 === 4 / 5, 4 / 9 > 3 / 7, (3 / 7) * 28 === 12]);
const eko = key(A, /Eko-enzim/).parts.map(p => p.value); const n = Math.min(Math.floor(4 / 1), Math.floor(10 / 3), Math.floor(35 / 10)); assert.deepEqual(eko, [n, 4 - n, 10 - 3 * n, 35 - 10 * n]);
const mes = key(A, /Mesin A menggiling/).parts.map(p => p.value); assert.deepEqual(mes, [12 / 8, 90 / 6, (90 / 6) / (12 / 8)]);
const tali = key(A, /Tali sepanjang 2,4 m/).parts[0]; const okR = tali.options.flatMap((o, k) => { const [a, b] = o.split(" : ").map(Number); return 12 % (a + b) === 0 ? [k] : []; }); assert.deepEqual(okR, tali.answer);
const sirup = key(A, /tiga campuran sirup/).parts; const c3 = [3 / 4, 4 / 3, 2 / 3]; near(sirup[0].value, c3[1], 1e-9); assert.equal(sirup[1].answer, `Campuran ${c3.indexOf(Math.max(...c3)) + 1}`);
const pa = key(A, /Ukuran kertas seri A/).parts; near(297 / 210, 420 / 297, 0.01); assert.equal(pa[0].answer, "A3"); assert.equal(pa[1].answer, "A1");
const ju = key(P, /Mira membuat/).parts; assert.equal(ju[2].answer, 3 / 5 < 2 / 3 ? "Jus kedua" : "Jus pertama");
near(key(P, /bingkai berukuran 90/).parts[0].a / key(P, /bingkai berukuran 90/).parts[0].b, 90 / 60);
near(key(P, /65% cokelat murni/).parts[0].value, 130 / 65 * 35); near(key(P, /20 cm × 15 cm/).parts[0].value, 28 * 15 / 20);
near(key(P, /mobil menempuh 165/).parts[0].value, 165 / 15); near(key(P, /10 kg biji/).parts[0].value, 10 / 8);

console.log(`Data Kelas 7 Bab 3 valid: ${all.length} soal; kunci dihitung ulang dari data, rasio setara diterima kecuali yang diminta paling sederhana.`);
