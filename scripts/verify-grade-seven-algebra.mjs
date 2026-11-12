import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, polyText, num, gcd, sources as D } from "../src/data/grade-seven-algebra.ts";

assert.equal(polyText([2, -3, 0], ["x²", "x", ""]), "2x² − 3x"); assert.equal(polyText([-1, 5], ["x", ""]), "−x + 5"); assert.equal(num("−1.500"), -1500);

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

/* Penghitung ekspresi satu variabel: angka, variabel, (), +, −, ×, :, /, ², perkalian tersirat. */
function evalExpr(src, val) {
  const s = src.replace(/−/g, "-").replace(/×/g, "*").replace(/:/g, "/").replace(/²/g, "^2").replace(/\s+/g, "");
  const toks = s.match(/\d+(?:[.,]\d+)?|[a-z]|\^|[-+*/()]/g); let i = 0;
  const peek = () => toks[i];
  function atom() { const t = toks[i++]; let v;
    if (t === "(") { v = expr(); i++; } else if (t === "-") return -factor(); else if (/[a-z]/.test(t)) v = val; else v = Number(t.replace(",", "."));
    if (peek() === "^") { i++; v = v ** Number(toks[i++]); } return v; }
  function factor() { let v = atom(); while (peek() && (/[a-z(]/.test(peek()) || /^\d/.test(peek()))) v *= atom(); return v; }
  function term() { let v = factor(); while (peek() === "*" || peek() === "/") { const o = toks[i++], w = factor(); v = o === "*" ? v * w : v / w; } return v; }
  function expr() { let v = term(); while (peek() === "+" || peek() === "-") { const o = toks[i++], w = term(); v = o === "+" ? v + w : v - w; } return v; }
  return expr();
}
assert.equal(evalExpr("2x(x+5)", 3), 48); assert.equal(evalExpr("(1/2)(6x-4)+(1/3)(3x+9)", 2), 9); assert.equal(evalExpr("-2m+7", 3), 1);
const polyVal = (p, coef, x) => coef.reduce((a, c, k) => a + c * (p.terms[k] === "" ? 1 : p.terms[k].endsWith("²") ? x * x : x), 0);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const ok = g => assert.ok(correct(q, swap(g)), `diterima: ${q.prompt} ${p.kind} ${g}`);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (["poly", "table"].includes(p.kind)) f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k]) + 1); wrong(g.join("|")); if (Number(f[k])) { g[k] = String(-Number(f[k])); wrong(g.join("|")); } });
    if (p.kind === "poly" && p.expr) { for (const x of [-3, -1, 0, 2, 5]) near(evalExpr(p.expr, x), polyVal(p, p.coef, x)); rechecked++; }
    if (p.kind === "poly") { const m = /^(.*) =$/.exec(p.label); if (m && /^[\d{(−-]/.test(m[1]) && !p.expr) assert.fail(`ekspresi tanpa expr: ${p.label}`); }
    if (p.kind === "factor") { const [k, a, b] = f.map(Number); assert.equal(k * a, p.a); assert.equal(k * b, p.b); assert.equal(k, gcd(p.a, p.b));
      wrong(`${k / (k % 2 ? k : 2)}|${a * (k % 2 ? k : 2)}|${b * (k % 2 ? k : 2)}`); const lbl = p.label.replace(/ =$/, ""); for (const x of [-2, 1, 4]) near(evalExpr(lbl, x), k * (a * x + b)); rechecked++; }
    if (p.kind === "binom") { ok(`${p.n}|${p.m}`); wrong(`${p.m}|${-p.n}`); const lbl = p.label.replace(/ =$/, ""); for (const x of [-2, 1, 4]) near(evalExpr(lbl, x), (x + p.m) * (x + p.n)); rechecked++; }
    if (p.kind === "num") { wrong(String(p.value + 1)); if (p.value) wrong(String(-p.value)); const m = /^(.*) =$/.exec(p.label); if (m) { const sub = /untuk m = (\d+)/.exec(q.prompt); if (sub) { near(evalExpr(m[1], Number(sub[1])), p.value); rechecked++; } } }
    if (p.kind === "classify") p.rows.forEach((r, k) => { const g = [...f]; g[k] = p.options.find(o => o !== r.answer); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
    if (p.kind === "select") { wrong(p.answer.slice(1).join(",")); }
    if (p.kind === "order") { assert.deepEqual([...p.answer].sort(), [...p.options].sort()); wrong([...p.answer].reverse().join(";")); }
  });
}
console.log(`Ekspresi yang dijabarkan ulang: ${rechecked}`);
assert.ok(rechecked >= 20);

// Kunci soal konteks dihitung ulang.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment, P = practice.flat();
const eqv = key(A, /pasangan ekuivalen/).parts[0].rows; const eqText = s => s.split(" dan ");
eqv.forEach(r => { const [l, rr] = eqText(r.text); const same = [-2, 0, 1, 3].every(x => Math.abs(evalExpr(l, x) - evalExpr(rr, x)) < 1e-9); assert.equal(r.answer, same ? "Ekuivalen" : "Tidak ekuivalen", r.text); });
const bags = key(A, /kantong kertas. Pasangkan/); bags.parts[0].rows.forEach((r, k) => { const g = D.bagSet.groups[k]; assert.equal(r.answer, `${g.bags}x + ${g.cubes}`); });
const fr = key(A, /Berat jeruk t kg/).parts; assert.deepEqual(fr[0].answer, [...D.fruits].sort((a, b) => a.c - b.c).map(f => f.name)); assert.equal(fr[1].value, 6 + D.fruits.find(f => f.name === "Rambutan").c);
const oj = key(A, /tiga layanan ojek/).parts; const cost = (o, k) => o.admin + o.km * k; const ch = k => D.ojek.reduce((a, b) => (cost(b, k) < cost(a, k) ? b : a)).name;
assert.equal(oj[0].answer, ch(6)); assert.equal(oj[1].answer, ch(15)); assert.equal(oj[2].value, cost(D.ojek[0], 15));
[6, 15].forEach(k => assert.equal(D.ojek.map(o => cost(o, k)).filter(c => c === Math.min(...D.ojek.map(o => cost(o, k)))).length, 1));
const tb = key(A, /Lengkapi tabel nilai, lalu/).parts[0]; const xs = tb.head.slice(1).map(s => Number(s.replace("−", "-")));
assert.deepEqual(tb.answers, [...xs.map(x => evalExpr("(3x-5)+(2x+1)", x)), ...xs.map(x => evalExpr("5x-4", x))]);
const tp = key(A, /Rani menuliskan 3p \+ 1/).parts[0]; assert.deepEqual(tp.answers, tp.head.slice(1).map(s => 3 * Number(s) + 1));
const dots = key(A, /pola titik/).parts; [1, 2, 3].forEach(n => assert.equal(4 * n + 2, [6, 10, 14][n - 1])); assert.equal(dots[1].value, 4 * 20 + 2);
assert.deepEqual(dots[2].answer, dots[2].options.flatMap((o, k) => ([-1, 2, 5].every(x => evalExpr(o, x) === 4 * x + 2) ? [k] : [])));
const lin = key(A, /Linda/).parts; assert.deepEqual(lin[0].coef, [4, 2 * 13 - 30]); assert.equal(lin[1].value, 4 * 50 - 30);
const mal = key(A, /Malik/).parts; assert.deepEqual(mal[0].coef, [-10, 60000]); assert.deepEqual(mal[1].coef, [-5, 60000]); assert.equal(mal[2].answer, 60000 - 10 * 7000 < 0 ? "Uang kurang Rp10.000,00" : "");
const osis = key(A, /sponsor/).parts; assert.deepEqual(osis[0].coef, [6 * 150000 + 8 * 250000, 4 * 600000 + 6 * 800000]); assert.equal(osis[1].value, 7200000 + 2900000 * 4);
const puz = key(A, /teka-teki/).parts; [-4, 0, 7].forEach(n => assert.equal((4 * n + 12) / 4 - n, puz[1].value));
assert.equal(key(A, /Dita/).parts[1].value, 6000 - 12 * 180); assert.equal(key(A, /Sinta/).parts[2].value, 4 * 25000 + 3 * 40000); assert.equal(key(A, /Cakra/).parts[1].value, 2 * 15000 + 3 * 12000 + 14000);
assert.equal(key(A, /ukuran 15/).parts[1].value, 60); assert.equal(key(P, /12 persegi/).parts[1].value, 1 + 3 * 12);
assert.deepEqual(key(P, /Ayu p kg/).parts.map(p => p.value), [40 - 10, 2 * 40 - 3, 40 / 2 + 8]); assert.equal(key(P, /ojek online sejauh 5 km/).parts[0].answer, ch(5));
const ne = key(P, /Mana yang tidak/).parts[0]; const vals = ne.options.map(o => [-1, 2, 4].map(x => evalExpr(o, x)).join()); assert.equal(vals.filter(x => x === vals[ne.options.indexOf(ne.answer)]).length, 1);

console.log(`Data Kelas 7 Bab 4 valid: ${all.length} soal, semua bentuk aljabar dijabarkan ulang dan kunci konteks dihitung ulang.`);
