import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, num, fact, isFunction, isBijection, relate } from "../src/data/grade-eight-relations.ts";

assert.equal(topics.length, 3); assert.deepEqual(topics.map(t => t.sections.length), [3, 5, 2]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 10, "peraga berbeda di setiap bagian");
topics.forEach(t => t.sections.forEach(s => assert.ok(s.life.length > 80 && s.steps.length >= 4 && s.example.length > 30, `materi lengkap ${s.title}`)));
assert.deepEqual(practice.map(p => p.length), [4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 8, 1: 8, 2: 8 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds));
assert.ok(Object.keys(kinds).length >= 8, "variasi jenis jawaban");
const interactive = assessment.filter(q => q.parts.some(p => ["arrows", "plot", "pick", "table"].includes(p.kind))).length;
console.log("Soal evaluasi dengan aksi menggambar/mengetuk/mengisi tabel:", interactive); assert.ok(interactive >= 8);
const pos = assessment.flatMap(q => q.parts).filter(p => p.kind === "choice" && p.options.length > 2).map(p => p.options.indexOf(p.answer));
assert.ok(new Set(pos).size >= 3, `posisi jawaban ${pos}`); console.log("Posisi jawaban pilihan ganda:", pos.join(","));

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); wrong(String(-p.value - 1)); }
    if (p.kind === "pick") { const ids = f[0].split(","); wrong(ids.slice(1).join(",")); const extra = p.options.findIndex((_, k) => !ids.includes(String(k))); if (extra >= 0) wrong([...ids, extra].join(",")); }
    if (p.kind === "arrows" || p.kind === "plot") { const ks = f[0].split(","); wrong(ks.slice(1).join(",")); const extra = p.rel.A.flatMap((_, a) => p.rel.B.map((_, b) => `${a}-${b}`)).find(k => !ks.includes(k)); if (extra) wrong([...ks, extra].join(",")); }
    if (p.kind === "table") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "linear") { wrong(`${f[1]}|${f[0]}`); wrong(`${f[0]}|${-p.b}`); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const check = (a, b) => { assert.deepEqual(a, b); rechecked++; };
const ints = (lo, hi, f = () => true) => Array.from({ length: hi - lo - 1 }, (_, k) => lo + 1 + k).filter(f);
const prime = k => k > 1 && Array.from({ length: k - 2 }, (_, d) => d + 2).every(d => k % d !== 0);
// Himpunan dihitung ulang dari notasinya.
const pA = find(/A = \{x \| −2 < x < 4/); check(pA.parts[0].answer, ints(-2, 4)); check(pA.parts[1].value, ints(-2, 4).length);
check(find(/B = \{x \| −3 < x < 3/).parts[0].answer, ints(-3, 3));
const pr = find(/bilangan prima antara 2 dan 15/), A = ints(2, 15, prime), B = ints(0, 12, k => k % 2 === 1);
check(pr.parts[0].answer, A); check(pr.parts[1].answer, B.filter(b => A.some(a => a === b + 2)));
const dk = find(/\"dua kali dari\"/); check(dk.parts[0].answer, [2, 3, 4, 6, 8, 10].filter(a => [1, 2, 3, 5].includes(a / 2))); check(dk.parts[1].value, dk.parts[0].answer.length);
const mn = find(/M = \{x \| −2 < x < 3/); check(mn.parts[0].value, ints(-2, 3).length); assert.equal(ints(1, 6).length, ints(-2, 3).length); check(mn.parts[1].value, fact(4));
const hk = find(/nama hari dalam seminggu\} dan K/); check(hk.parts[0].value, ints(1, 18, prime).length); check(hk.parts[1].value, fact(7));
// Relasi pada diagram panah dan Cartesius sesuai aturannya.
const rules = { "kurang dari": (a, b) => a < b, "faktor dari": (a, b) => b % a === 0 };
for (const q of all) q.parts.forEach(p => { if ((p.kind === "arrows" || p.kind === "plot") && /kurang dari|faktor dari/.test(p.label)) {
  const name = /kurang dari/.test(p.label) ? "kurang dari" : "faktor dari"; check(p.rel.pairs, relate(p.rel.A, p.rel.B, rules[name]).pairs); } });
const fam = find(/Pak Hasan/); assert.ok(!isFunction(fam.parts[0].rel)); assert.ok(isFunction({ A: fam.parts[0].rel.B, B: fam.parts[0].rel.A, pairs: fam.parts[0].rel.pairs.map(([i, j]) => [j, i]) })); assert.ok(fam.parts[1].answer.startsWith("Bukan")); rechecked++;
const nisq = find(/nomor induknya/); assert.ok(isBijection(nisq.parts[0].rel)); rechecked++;
const sq = find(/Aturan relasi dari himpunan kiri/); assert.ok(sq.scene.rel.pairs.every(([i, j]) => sq.scene.rel.A[i] === sq.scene.rel.B[j] ** 2)); assert.equal(sq.parts[0].answer, "kuadrat dari"); rechecked++;
const hf = find(/diagram Cartesius relasi dari P ke Q/), hr = hf.scene.rel; check(hr.pairs, relate(hr.A, hr.B, (a, b) => b === 2 * a).pairs);
assert.notDeepEqual(relate(hr.A, hr.B, (a, b) => b % a === 0).pairs, hr.pairs); assert.notDeepEqual(relate(hr.A, hr.B, (a, b) => b === a + 1).pairs, hr.pairs);
check(hf.parts[1].answer, hr.A.filter((_, i) => hr.pairs.some(p => p[0] === i)));
const pics = find(/Diagram panah manakah/).parts[0]; pics.options.forEach((o, k) => assert.equal(isBijection(pics.pics[k].rel), o === pics.answer, o)); rechecked++;
// Himpunan pasangan berurutan: fungsi atau korespondensi satu-satu.
const parse = s => [...s.matchAll(/\(([^,()]+), ([^,()]+)\)/g)].map(m => [m[1], m[2]]);
const isFn = (pairs, dom) => dom.every(d => pairs.filter(p => p[0] === d).length === 1);
const isKs = pairs => new Set(pairs.map(p => p[0])).size === pairs.length && new Set(pairs.map(p => p[1])).size === pairs.length;
find(/P = \{1, 2, 3\} dan Q = \{a, b\}/).parts[0].rows.forEach(r => { assert.equal(isFn(parse(r.text), ["1", "2", "3"]) ? "Fungsi" : "Bukan fungsi", r.answer, r.text); rechecked++; });
all.forEach(q => q.parts.forEach(p => { if (p.kind === "classify" && p.options[0] === "Korespondensi satu-satu") p.rows.forEach(r => { assert.equal(isKs(parse(r.text)) ? "Korespondensi satu-satu" : "Bukan", r.answer, r.text); rechecked++; }); }));
const four = find(/merupakan pemetaan \(fungsi\)/), sets = four.prompt.split(/\((?:i|ii|iii|iv)\) /).slice(1).map(parse);
const fnIdx = sets.map((s, k) => (isFn(s, [...new Set(s.map(p => p[0]))]) && new Set(s.map(p => p[0])).size === s.length ? ["(i)", "(ii)", "(iii)", "(iv)"][k] : null)).filter(Boolean);
assert.equal(four.parts[0].answer, fnIdx.join(" dan ")); rechecked++;
const rels = find(/Tentukan apakah setiap relasi berikut merupakan fungsi/).parts[0].rows, rr = [
  relate([1, 2, 3, 4, 6], [2, 4, 6, 8, 10, 12], (a, b) => b === 2 * a), relate([1, 2, 3, 4, 5], [2, 3, 5, 7], (a, b) => b % a === 0),
  relate([3, 4, 5, 6, 7], [4, 5, 7, 9], (a, b) => a === b + 1), relate([3, 6, 9, 12], [1, 2, 3, 4, 5, 6], (a, b) => a === 3 * b)];
rels.forEach((r, k) => { assert.equal(isFunction(rr[k]) ? "Fungsi" : "Bukan fungsi", r.answer, r.text); rechecked++; });
const ff = find(/f: A → A/).parts[0].statements, dom = [-2, -1, 0, 1, 2], bij = g => { const im = dom.map(g); return im.every(y => dom.includes(y)) && new Set(im).size === dom.length; };
assert.deepEqual(ff.map(s => s.answer), [bij(x => -x), bij(x => x * x), bij(x => x + 1)]); rechecked++;
// Nilai, tabel, rumus.
const val = (q, k) => q.parts[k].value;
check(val(find(/E = \{p, q\} dan F/), 0), 3 ** 2); check(val(find(/E = \{p, q\} dan F/), 1), 2 ** 3);
const t1 = find(/f\(x\) = 3x − 4/).parts[0]; check(t1.ys, t1.xs.map(x => 3 * x - 4));
const t2 = find(/f\(x\) = 5 − 3x/).parts[0]; check(t2.ys, t2.xs.map(x => 5 - 3 * x));
const h = find(/h\(x\) = ax \+ 9/), ha = (-6 - 9) / 3; check(val(h, 0), ha); check(val(h, 1), ha * 6 + 9);
const fq = find(/2x\^\{2\} − 5x \+ 1/), g2 = x => 2 * x * x - 5 * x + 1; check(val(fq, 0), g2(3)); check(val(fq, 1), g2(-2));
const lin = find(/x = −2 adalah −13/), { a, b } = lin.parts[0]; check([a * -2 + b, a * 4 + b], [-13, 11]); check(val(lin, 1), (a * -1 + b) + (a + b));
const taxi = find(/Tarif taksi: biaya awal Rp6.000/), T = taxi.parts[0]; check([T.a, T.b], [3500, 6000]); check(val(taxi, 1), T.a * 24 + T.b); check(val(taxi, 2), (118000 - T.b) / T.a);
check(val(find(/K = \{a, b, c, d, e, f\}/), 0), fact(6));
const cnt = find(/Tentukan banyak korespondensi satu-satu yang mungkin dari A ke B/); check(val(cnt, 0), fact(5)); check(val(cnt, 1), fact(7));
const ab = find(/A = \{1, 2, 3\} dan B = \{a, b, c\}/); check(val(ab, 0), 3 ** 3); check(val(ab, 1), fact(3));
const orch = find(/pohon apel dalam pola persegi/); check(orch.parts[0].ys, orch.parts[0].xs.map(k => k * k)); check(orch.parts[1].ys, orch.parts[1].xs.map(k => 8 * k)); check(val(orch, 2), 8);
const tank = find(/Air mengalir ke bak mandi/), rate = (40 - 22) / (10 - 4), v0 = 22 - 4 * rate; assert.equal(tank.parts[0].answer, `${v0} liter dan ${v0 + 25 * rate} liter`); rechecked++;
const code = d => d.replace(/\D/g, "").split("").map(c => "ABCDEFGHIJ"[Number(c)]).join(""), decode = s => s.split("").map(c => "ABCDEFGHIJ".indexOf(c)).join("");
assert.equal(code("23-07-1986"), "CDAHBJIG"); const ci = find(/kode tanggal/); assert.equal(ci.parts[0].answer, code("17-08-1945")); assert.equal(ci.parts[1].answer.replace(/-/g, ""), decode("BCABCACE")); rechecked += 3;
for (const [re, want] of [[/Anak yang suka renang tetapi tidak suka melukis/, ["renang"], ["melukis"]], [/Anak yang suka menyanyi tetapi tidak suka membaca/, ["menyanyi"], ["membaca"]]].map(([r, y, nn]) => [r, [y, nn]])) {
  const qq = find(re), [yes, no] = want, who = qq.scene.lines.filter(l => yes.every(w => l.includes(w)) && no.every(w => !l.includes(w))).map(l => l.split(":")[0]);
  assert.deepEqual(who, [qq.parts[0].answer]); rechecked++; }
const vow = find(/Pasangan himpunan manakah/).parts[0]; assert.ok(vow.answer.includes("huruf vokal")); assert.equal(ints(1, 7).length, 5); rechecked++;
assert.equal(num("−5"), -5); assert.equal(num("90.000"), 90000);
console.log(`Kunci dihitung ulang dari himpunan, aturan relasi, rumus dan data: ${rechecked}`);
console.log(`Data Kelas 8 Bab 4 valid: ${all.length} soal.`);
