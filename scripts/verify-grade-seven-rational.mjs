import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, add, sub, mul, div, cmp, eq, red, parseDec, decText, longDivision, fracText, orderAnswer, readFrac, sources as D } from "../src/data/grade-seven-rational.ts";

// Pembantu dasar.
assert.deepEqual(parseDec("−0,35"), [-7, 20]); assert.equal(decText([3, 8]), "0,375"); assert.equal(decText([1, 3]), null); assert.equal(fracText([-7, 3]), "−2 1/3");
assert.deepEqual(longDivision(2, 7).digits.slice(0, 6), [2, 8, 5, 7, 1, 4]); assert.equal(longDivision(2, 7).repeatFrom, 0);
assert.deepEqual(readFrac(["-", "2", "1", "3"]), [-7, 3]); assert.deepEqual(readFrac(["", "", "6", "15"]), [2, 5]);

assert.equal(topics.length, 3); assert.deepEqual(topics.map(t => t.sections.length), [2, 2, 4]);
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

/* Penghitung ekspresi pecahan dan desimal dari teks soal: {a/b}, {w a/b}, 2,17, ×, :, kurung. */
function tokenFrac(t) { const m = /^(-)?(?:(\d+) )?(\d+)\/(-?\d+)$/.exec(t); if (!m) return null; const w = Number(m[2] ?? 0), n = Number(m[3]), d = Number(m[4]); const f = red([w * Math.abs(d) + n, d]); return m[1] ? [-f[0], f[1]] : f; }
function evaluate(src) {
  const toks = src.replace(/−/g, "-").match(/\{[^}]+\}|\d+(?:,\d+)?|[-+×:()]/g); let i = 0;
  const atom = () => { const t = toks[i++]; if (t === "(") { const v = expr(); i++; return v; } if (t === "-") { const v = atom(); return [-v[0], v[1]]; } if (t.startsWith("{")) return tokenFrac(t.slice(1, -1)); return parseDec(t); };
  const term = () => { let v = atom(); while (toks[i] === "×" || toks[i] === ":") { const o = toks[i++], w = atom(); v = o === "×" ? mul(v, w) : div(v, w); } return v; };
  function expr() { let v = term(); while (toks[i] === "+" || toks[i] === "-") { const o = toks[i++], w = term(); v = o === "+" ? add(v, w) : sub(v, w); } return v; }
  return expr();
}
assert.deepEqual(evaluate("{1 1/2} × {2/3}"), [1, 1]); assert.deepEqual(evaluate("1,6 : (−0,8) + {2/5}"), [-8, 5]);
const textVal = t => { const s = t.trim(); return s.startsWith("{") && s.endsWith("}") && !s.slice(1).includes("{") ? tokenFrac(s.slice(1, -1)) : parseDec(s); };

let evaluated = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const ok = g => assert.ok(correct(q, swap(g)), `diterima: ${q.prompt} ${p.kind} ${g}`);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "frac") {
      const [n, d] = red(p.value); ok([n < 0 ? "-" : "", "", String(Math.abs(n) * 3), String(d * 3)].join("|")); // bentuk setara
      wrong([n < 0 ? "" : "-", "", String(Math.abs(n)), String(d)].join("|")); wrong([n < 0 ? "-" : "", "", String(Math.abs(n) + 1), String(d)].join("|"));
      const m = /^(.*) =$/.exec(p.label.trim()); if (m && /[+\-−×:]/.test(m[1].replace(/^\{-/, "{"))) { assert.ok(eq(evaluate(m[1]), p.value), `hitung ulang ${p.label}`); evaluated++; }
      if (m && !/[+×:]/.test(m[1]) && !/ − /.test(m[1])) { const tv = textVal(m[1].replace("−", "-")); if (tv) { assert.ok(eq(tv, p.value), `nilai ${p.label}`); evaluated++; } }
    }
    if (p.kind === "dec") {
      const w = parseDec(p.value); const alt = p.value.includes(",") ? p.value + "0" : p.value + ",0"; ok(alt);
      wrong(p.value.startsWith("-") ? p.value.slice(1) : `-${p.value}`); wrong(fracText(add(w, [1, 100])).includes("/") ? String(Number(p.value.replace(",", ".")) + 1).replace(".", ",") : String(Number(p.value) + 1));
      const m = /^(.*) (=|≈)$/.exec(p.label.trim());
      if (m && m[2] === "=") { assert.ok(eq(evaluate(m[1]), w), `hitung ulang ${p.label}`); evaluated++; }
    }
    if (p.kind === "between") { assert.ok(cmp(p.sample, p.lo) > 0 && cmp(p.sample, p.hi) < 0); const mid = add(mul(p.lo, [1, 2]), mul(p.hi, [1, 2])); const [n, d] = red(mid); ok(["", "", String(n), String(d)].join("|"));
      const [ln, ld] = red(p.lo); wrong(["", "", String(ln), String(ld)].join("|")); const [hn, hd] = red(p.hi); wrong(["", "", String(hn), String(hd)].join("|")); }
    if (p.kind === "signs") p.pairs.forEach(([ta, a, tb, b], k) => { assert.ok(eq(textVal(ta.replace("−", "-")), a), ta); assert.ok(eq(textVal(tb.replace("−", "-")), b), tb); const g = [...f]; g[k] = g[k] === "<" ? ">" : "<"; wrong(g.join("|")); });
    if (p.kind === "order") { p.options.forEach(o => assert.ok(eq(textVal(o.text.replace("−", "-")), o.v), o.text)); wrong([...orderAnswer(p)].reverse().join(";")); }
    if (p.kind === "place") { p.items.forEach(it => { assert.ok(eq(textVal(it.label.replace("−", "-")), it.v), it.label); assert.ok(Number.isInteger((it.v[0] / it.v[1]) * p.den)); assert.ok(it.v[0] / it.v[1] >= p.min && it.v[0] / it.v[1] <= p.max); });
      const g = [...f]; g[0] = String(Number(g[0]) + 1); wrong(g.join("|")); }
    if (p.kind === "classify") p.rows.forEach((r, k) => { const g = [...f]; g[k] = p.options.find(o => o !== r.answer); wrong(g.join("|")); });
    if (p.kind === "select") { wrong(p.answer.slice(1).join(",")); if (/terbatas/.test(p.label)) assert.deepEqual(p.options.flatMap((o, k) => (decText(textVal(o)) !== null ? [k] : [])), p.answer, p.label); }
    if (p.kind === "shade") { const n = p.r * p.c; assert.equal(f[0].split(",").length, n); wrong(Array.from({ length: n - 1 }, (_, k) => k).join(",")); wrong(Array.from({ length: n + 1 }, (_, k) => k).join(",")); ok(Array.from({ length: n }, (_, k) => p.rows * p.cols - 1 - k).sort((a, b) => a - b).join(",")); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}
console.log(`Ekspresi dan nilai yang dihitung ulang: ${evaluated}`);
assert.ok(evaluated >= 25);

// Kunci yang dihitung dari sumber.
const key = (list, re) => { const q = list.find(x => re.test(x.prompt)); assert.ok(q, re); return q; };
const A = assessment;
const tool = (need, unit) => { const opts = (unit === "cangkir" ? ["1/4", "1/3", "1/2", "1"] : ["1/2", "1"]).map(t => [t, tokenFrac(t.includes("/") ? t : `${t}/1`)]); return opts.reduce((a, b) => (Math.abs(b[1][0] / b[1][1] - need) < Math.abs(a[1][0] / a[1][1] - need) ? b : a))[0] + " " + unit; };
key(A, /Karina menakar/).parts[0].rows.forEach(r => { const m = /^\{(\d+)\/(\d+)\} (cangkir|sdm|sdt)/.exec(r.text); assert.equal(r.answer, tool(Number(m[1]) / Number(m[2]), m[3]), r.text); assert.ok(D.tools.includes(r.answer)); });
const ops = key(A, /Lengkapi □/).parts[0].rows; ops.forEach(r => { const m = /^\{([^}]+)\} □ \{([^}]+)\} = \{([^}]+)\}$/.exec(r.text); const a = tokenFrac(m[1]), b = tokenFrac(m[2]), res = tokenFrac(m[3].includes("/") ? m[3] : `${m[3]}/1`);
  const hits = [["+", add], ["−", sub], ["×", mul], [":", div]].filter(([, fn]) => eq(fn(a, b), res)).map(([o]) => o); assert.deepEqual(hits, [r.answer], r.text); });
const ch = D.chicken.rows.map(r => r.slice(1).map(x => Number(x.replace(/\./g, "").replace(",", "."))));
const w1 = ch.map(r => r[1] - r[0]), w4 = ch.map(r => r[4] - r[0]), letters = ["A", "B", "C"];
const cq = key(A, /pakan ayam/).parts; assert.equal(cq[0].answer, `Pakan ${letters[w1.indexOf(Math.max(...w1))]}`); assert.equal(cq[1].answer, `Pakan ${letters[w4.indexOf(Math.max(...w4))]}`);
const sq = key(A, /ruang penyimpanan/).parts; const gb = D.storage.map(s => Number(s.gb.replace(",", "."))); assert.equal(sq[0].answer, D.storage[gb.indexOf(Math.max(...gb.slice(0, 5)))].name);
const sisa = Math.round(gb[5] * 1000); assert.deepEqual(sq[1].answer, [250, 600, 700].flatMap((m, k) => (m <= sisa ? [k] : []))); assert.equal(sq[2].statements[0].answer, 250 + 600 <= sisa);
const rec = key(A, /ketiga kue/).parts; const need = add(add([5, 3], [9, 4]), [3, 4]); assert.ok(eq(rec[0].value, need)); assert.ok(eq(rec[1].value, sub([6, 1], need)));
assert.equal(key(A, /2\/7/).parts[0].value, "0," + longDivision(2, 7).digits.slice(0, 6).join(""));
const bb = key(A, /batu bata/).parts; assert.deepEqual(bb.slice(0, 3).map(p => Number(p.value)), [63, 4 * 9, 5 * 7]); assert.equal(bb[3].answer, cmp([4, 7], [5, 9]) > 0 ? "Ananta" : "Budi");
const wp = key(A, /soal cerita/).parts.map(p => Number(p.value)); assert.deepEqual(wp, [22.5 / 1.25, (2 / 7) * 42, 1.5 * 42, 42 - (2 / 7) * 42]);
const kq = key(A, /kuota belajar/).parts; assert.equal(kq[1].answer, cmp([11, 8], [27, 20]) > 0 ? "Kakak" : "Adik");
const disc = key(practice.flat(), /diskon/).parts.map(p => Number(p.value)); assert.deepEqual(disc, [150000 * 0.7, 150000 * 0.75]);
const line = key(A, /▲ dan ■/); line.parts.forEach((p, k) => assert.ok(eq(p.value, line.scene.marks[k].v)));

console.log(`Data Kelas 7 Bab 2 valid: ${all.length} soal, kunci dihitung ulang dengan pecahan eksak; bentuk setara dan pecahan lain yang sah diterima.`);
