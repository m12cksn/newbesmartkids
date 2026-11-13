import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, surdValue, squareFree, simplifyRoot, num } from "../src/data/grade-eight-powers.ts";

assert.equal(topics.length, 3); assert.deepEqual(topics.map(t => t.sections.length), [4, 4, 2]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 10, "peraga berbeda di setiap bagian");
topics.forEach(t => t.sections.forEach(s => assert.ok(s.life.length > 60 && s.steps.length >= 3, `materi lengkap ${s.title}`)));
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
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)));

/* Penghitung rumus dari label: ^{…}, √{…}, {a/b}, ×, :, desimal koma, ribuan titik. */
function closeAt(s, open) { let d = 0; for (let i = open; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}" && --d === 0) return i; } throw new Error("kurung"); }
function topSlash(s) { let d = 0; for (let i = 0; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}") d--; else if (s[i] === "/" && d === 0) return i; } return -1; }
function popOperand(out) {
  const t = out.trimEnd();
  if (t.endsWith(")")) { let d = 0; for (let i = t.length - 1; i >= 0; i--) { if (t[i] === ")") d++; else if (t[i] === "(" && --d === 0) { let j = i; const m = /Math\.\w+$/.exec(t.slice(0, i)); if (m) j = i - m[0].length; return [t.slice(0, j), t.slice(j)]; } } }
  const m = /[\d.]+$/.exec(t); return [t.slice(0, t.length - m[0].length), m[0]];
}
function js(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith("^{", i)) { const e = closeAt(s, i + 1); const [rest, op] = popOperand(out); out = `${rest}Math.pow(${op},${js(s.slice(i + 2, e))})`; i = e; continue; }
    if (s.startsWith("√{", i)) { const e = closeAt(s, i + 1); out += `Math.sqrt(${js(s.slice(i + 2, e))})`; i = e; continue; }
    if (s[i] === "{") { const e = closeAt(s, i), inner = s.slice(i + 1, e), sl = topSlash(inner); out += sl < 0 ? `(${js(inner)})` : `((${js(inner.slice(0, sl))})/(${js(inner.slice(sl + 1))}))`; i = e; continue; }
    out += s[i];
  }
  return out;
}
function evalLabel(label) {
  let s = label.replace(/=\s*$/, "").trim();
  if (/[a-zA-Z]/.test(s.replace(/√|Math/g, ""))) return null;
  s = s.replace(/(\d)\.(?=\d{3}(\D|$))/g, "$1").replace(/(\d),(\d)/g, "$1.$2").replace(/[−–]/g, "-").replace(/×/g, "*").replace(/:/g, "/");
  let e = js(s).replace(/(\d|\))\s*(Math|\()/g, "$1*$2");
  return Function(`"use strict"; return (${e});`)();
}
const close = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    const val = p.kind === "tf" || p.kind === "choice" ? null : evalLabel(p.label);
    if (p.kind === "num") { wrong(String(num(f[0]) + 1).replace(".", ",")); if (val !== null) { assert.ok(close(val, p.value), `${p.label} = ${val}, kunci ${p.value}`); rechecked++; } }
    if (p.kind === "pow") { wrong(p.fixedBase ? String(p.exp + 1) : `${p.base}|${p.exp + 1}`); if (!p.fixedBase) wrong(`9|${p.exp}`);
      const b = num(p.base); if (val !== null && !Number.isNaN(b)) { assert.ok(close(val, b ** p.exp), `${p.label}`); rechecked++; } }
    if (p.kind === "frac") { wrong(`${p.n * 2}|${p.d * 2}`); wrong(`${p.n}|${p.d + 1}`); if (val !== null) { assert.ok(close(val, p.n / p.d), p.label); rechecked++; } }
    if (p.kind === "root") { assert.ok(squareFree(p.rad) && p.rad > 1); wrong(`${p.coef + 1}|${p.rad}`); const [c, r] = simplifyRoot(1, p.rad * p.coef * p.coef); assert.deepEqual([c, r], [p.coef, p.rad]);
      if (val !== null) { assert.ok(close(val, p.coef * Math.sqrt(p.rad)), p.label); rechecked++; } }
    if (p.kind === "surd") { const t = p.terms; assert.ok(t.every(([, r]) => squareFree(r)));
      wrong([...t.flat().map((x, k) => (k === 0 ? x + 1 : x)), p.den].join("|")); wrong([...t.flat().map(x => x * 2), p.den * 2].join("|"));
      if (val !== null) { assert.ok(close(val, surdValue(t, p.den)), `${p.label} = ${val}`); rechecked++; } }
    if (p.kind === "sci") { assert.ok(p.mant >= 1 && p.mant < 10); wrong(`${String(p.mant * 10).replace(".", ",")}|${p.exp - 1}`); wrong(`${f[0]}|${p.exp + 1}`);
      if (val !== null) { assert.ok(close(val, p.mant * 10 ** p.exp), `${p.label} = ${val}`); rechecked++; } }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}
// Soal cerita dihitung ulang dari datanya.
const find = re => all.find(q => re.test(q.prompt));
assert.equal(find(/Rina memakai/).parts[0].exp, Math.log10(10 * 1e6 * 1000)); assert.equal(find(/Rina memakai/).parts[1].exp, 7 - 3);
assert.ok(close(find(/Sekarung beras/).parts[0].mant * 1e6, 25000 / 0.02));
assert.ok(close(find(/Kecepatan cahaya/).parts[0].mant * 1e9, (3e8 * 7200) / 1000));
assert.equal(2 ** find(/Flashdisk/).parts[0].value * 3, 0.75 * 128 * 2 ** 30);
const vir = find(/Virus di desa X/); assert.equal(vir.parts[0].exp, 12); assert.equal(vir.parts[1].exp, 12 / 2); assert.ok(60 * Math.log(2) > 30 * Math.log(3) && vir.parts[2].answer === "Desa X");
const yr = find(/Satu tahun dihitung/); assert.ok(close(yr.parts[0].mant * 1e9, 50 * 365 * 86400)); assert.ok(close(yr.parts[1].mant * 1e7, 12 * 500 * 8e3));
const frame = find(/bingkai berbentuk persegi panjang/); assert.equal(frame.parts[0].coef, 2 * (4 + 2)); assert.equal(frame.parts[1].value, 4 * 2 * 3);
const p19 = find(/Tentukan nilai p/); assert.equal(((-4) ** 2 / 2 ** 3) * (8 ** 4 / (-16) ** 2), 2 ** p19.parts[0].value); assert.equal(9 ** p19.parts[1].value * 27 ** 2 / 3 ** 4, 3 ** 12);
rechecked += 9;
console.log(`Kunci dihitung ulang dari rumus dan data: ${rechecked}`);
console.log(`Data Kelas 8 Bab 1 valid: ${all.length} soal.`);
