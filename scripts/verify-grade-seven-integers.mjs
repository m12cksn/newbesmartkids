import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, factorPairs, factorsOf, isPrime, primeExponents, gcd, lcm, pairsOk, dialsOk, show, sources as D } from "../src/data/grade-seven-integers.ts";

assert.equal(show(-1500), "−1.500"); assert.equal(show(325000), "325.000");
assert.deepEqual(factorPairs(12), [[1, 12], [2, 6], [3, 4], [-1, -12], [-2, -6], [-3, -4]]);
assert.equal(gcd(16, 24), 8); assert.equal(lcm(6, 10), 30); assert.deepEqual(primeExponents(12, [2, 3]), [2, 1]);

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

// Ekspresi pada label soal dihitung ulang (×, :, kurung, tanda minus tipografis).
const evalExpr = s => Function(`return (${s.replace(/−/g, "-").replace(/×/g, "*").replace(/:/g, "/")})`)();
const num = s => Number(s.replace(/−/g, "-").replace(/\./g, ""));
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (["number", "items", "table", "primeExp", "place"].includes(p.kind)) f.forEach((_, k) => { const g = [...f]; g[k] = String(-Number(g[k]) || 1); wrong(g.join("|")); g[k] = String(Number(f[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "items") p.items.forEach(it => { const m = /^[a-z]\. (.*) =$/.exec(it.label); if (m) assert.equal(evalExpr(m[1]), it.answer, it.label); });
    if (p.kind === "signs") p.pairs.forEach(([a, b], k) => { assert.notEqual(a, b); const g = [...f]; g[k] = g[k] === "<" ? ">" : "<"; wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
    if (p.kind === "order") { assert.deepEqual([...p.answer].sort((a, b) => a - b), [...p.options].sort((a, b) => a - b)); const asc = [...p.options].sort((a, b) => a - b);
      assert.deepEqual(p.answer, /dingin ke paling panas|Terkecil/.test(p.label) ? asc : asc.reverse(), p.label); wrong([...p.answer].reverse().join(";")); }
    if (p.kind === "place") { p.items.forEach(it => assert.ok(it.value >= p.min && it.value <= p.max && (it.value - p.min) % p.step === 0, it.label)); }
    if (p.kind === "select") { const pick = p.options.flatMap((o, k) => { const n = num(o), m = /Faktor (\d+)/.exec(p.label); return m ? (Number(m[1]) % n === 0 ? [k] : []) : []; });
      if (/Faktor/.test(p.label)) assert.deepEqual(pick, p.answer, p.label); wrong(p.answer.slice(1).join(",")); }
    if (p.kind === "pairs") { const x = f; assert.ok(pairsOk(p.n, x)); const sw = [...x]; [sw[0], sw[1]] = [sw[1], sw[0]]; assert.ok(pairsOk(p.n, sw), "urutan bebas");
      const re = [...x.slice(2), ...x.slice(0, 2)]; assert.ok(pairsOk(p.n, re), "baris bebas"); const dup = [...x]; dup[2] = x[0]; dup[3] = x[1]; assert.ok(!pairsOk(p.n, dup), "ganda ditolak"); }
    if (p.kind === "primeExp") { assert.equal(p.primes.reduce((a, pr, k) => a * pr ** Number(f[k]), 1), p.n); p.primes.forEach(pr => assert.ok(isPrime(pr))); }
    if (p.kind === "dials") { assert.ok(dialsOk(p, f)); const rev = [...f].reverse(); assert.ok(dialsOk(p, rev), "urutan tombol bebas"); const bad = [...f]; bad[0] = String(-Number(bad[0])); assert.ok(!dialsOk(p, bad));
      if (!p.primesOnly) { const sols = []; for (let a = p.min; a <= p.max; a++) for (let b = p.min; b <= p.max; b++) if (a * b === p.target) sols.push([a, b]); assert.ok(sols.length >= 2); sols.forEach(s => assert.ok(dialsOk(p, s.map(String)))); } }
  });
}

// Kunci yang dihitung ulang dari sumber.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment, P = practice.flat();
const rule = s => { const m = /([+−])\(([+−])(\d)\)/.exec(s); return (m[1] === "+" ? 1 : -1) * (m[2] === "+" ? 1 : -1) * Number(m[3]); };
const R = Object.fromEntries(D.transferRules.map(([t, v]) => [t, rule(v)]));
assert.equal(key(A, /Klub E/).parts[0].answer, 3 * R["Mendapatkan pemain bagus"] + R["Melepaskan pelatih buruk"] + 2 * R["Mendapatkan pemain buruk"]);
assert.equal(key(P, /Klub A/).parts[0].answer, 4 * R["Mendapatkan pemain bagus"] + 3 * R["Mendapatkan pemain buruk"]);
[key(A, /Klub E/), key(P, /Klub A/)].forEach(q => assert.equal(q.parts[1].answer, q.parts[0].answer > 0 ? "Performa naik" : q.parts[0].answer < 0 ? "Performa turun" : "Performa tetap"));
const placeQ = key(A, /letak suhu setiap kota/); placeQ.parts[0].items.forEach((it, k) => assert.equal(it.value, D.cities[k].temp));
const seoul = D.cities2.find(c => c.city.startsWith("Seoul")).temp; assert.deepEqual(key(A, /lebih dingin daripada Seoul/).parts[0].answer, D.cities2.flatMap((c, k) => (c.temp < seoul ? [k] : [])));
const [jan, feb] = D.bank.rows, saldo = jan.credit - jan.debit + feb.credit; assert.deepEqual(key(A, /buku tabungan/).parts[0].items.map(x => x.answer), [saldo, Math.max(0, 400000 - saldo)]);
const t1 = key(P, /mesin pendingin ruang/).parts[0], t2 = key(A, /Lengkapi tabel perubahan suhu/).parts[0];
assert.deepEqual(t1.answers, [5 * -3, -8 / 2, 12 / -3]); assert.deepEqual(t2.answers, [-7 * 3, -20 / -4, -18 / 6, -2 * -3 * 2]);
assert.deepEqual(key(A, /Tentukan suhu baru/).parts[0].items.map(x => x.answer), [-6 * -2, 3 * 2 * -3]);
assert.equal(key(A, /Arjuna/).parts[0].answer, lcm(8, 12)); assert.equal(key(P, /Klub sains/).parts[0].answer, gcd(18, 30));
assert.deepEqual(key(A, /Sasha/).parts[0].items.map(x => x.answer), [gcd(36, 54), 36 / gcd(36, 54), 54 / gcd(36, 54)]);
const bus = lcm(8, 12, 15), start = 6 * 60 + 15, end = start + bus; assert.deepEqual(key(A, /bus sekolah/).parts[0].items.map(x => x.answer), [Math.floor(end / 60), end % 60]);
assert.equal(key(A, /bioskop/).parts[0].answer, Math.floor(1400 / lcm(20, 30)));
assert.equal(key(A, /tes masuk/).parts[0].answer, 26 * 4 + (32 - 26) * -2 + (40 - 32) * 0);
assert.deepEqual(key(A, /Jawablah dengan bilangan bulat/).parts[0].items.map(x => x.answer), [-12 + (21 / 3) * 5, -240 / 4]);
assert.equal(key(P, /YouTuber/).parts[0].answer, -240 / 4);
const tA = key(A, /^Tentukan benar atau salah\.$/).parts[0].statements.map(s => s.answer); assert.deepEqual(tA, [-15 < -9, false, true, false]);
const between = []; for (let k = -3; k <= 2; k++) between.push(k);
const tS = A.filter(x => x.prompt === "Tentukan benar atau salah.")[1].parts[0].statements.map(s => s.answer); assert.deepEqual(tS, [-(-13) === 13, between.length === 6, -20 < -200, false]);
assert.deepEqual(factorsOf(21), [1, 3, 7, 21]);

console.log(`Data Kelas 7 Bab 1 valid: ${all.length} soal, kunci dihitung ulang; pasangan faktor dan tombol diterima dalam urutan apa pun.`);
