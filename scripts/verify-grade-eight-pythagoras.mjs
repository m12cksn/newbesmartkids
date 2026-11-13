import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, num, triangleType } from "../src/data/grade-eight-pythagoras.ts";
import { simplifyRoot } from "../src/data/grade-eight-powers.ts";

assert.equal(topics.length, 5); assert.deepEqual(topics.map(t => t.sections.length), [3, 2, 2, 2, 1]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 10, "peraga berbeda di setiap bagian");
topics.forEach(t => t.sections.forEach(s => assert.ok(s.life.length > 80 && s.steps.length >= 4 && s.example.length > 30, `materi lengkap ${s.title}`)));
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 5, 1: 5, 2: 5, 3: 5, 4: 4 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| bergambar:", assessment.filter(q => q.scene).length);
assert.ok(Object.keys(kinds).length >= 4, "variasi jenis jawaban");
assert.ok(assessment.filter(q => q.scene).length >= 16, "sebagian besar soal evaluasi bergambar");
// Posisi jawaban pilihan ganda tidak menumpuk di satu tempat.
const pos = assessment.flatMap(q => q.parts).filter(p => p.kind === "choice" && p.options.length > 2).map(p => p.options.indexOf(p.answer));
assert.ok(new Set(pos).size >= 2, `posisi jawaban ${pos}`);

/* Penghitung label numerik: ^{…}, √{…}, ×, desimal koma. */
function closeAt(s, open) { let d = 0; for (let i = open; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}" && --d === 0) return i; } throw new Error("kurung"); }
function js(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s.startsWith("^{", i)) { const e = closeAt(s, i + 1); const m = /(\([^()]*\)|[\d.]+)$/.exec(out.trimEnd()); const t = out.trimEnd(); out = `${t.slice(0, t.length - m[0].length)}Math.pow(${m[0]},${js(s.slice(i + 2, e))})`; i = e; continue; }
    if (s.startsWith("√{", i)) { const e = closeAt(s, i + 1); out += `Math.sqrt(${js(s.slice(i + 2, e))})`; i = e; continue; }
    out += s[i];
  }
  return out;
}
function evalLabel(label) {
  const s = label.replace(/=\s*$/, "").trim();
  if (/[a-zA-Z]/.test(s)) return null;
  return Function(`"use strict"; return (${js(s.replace(/(\d),(\d)/g, "$1.$2").replace(/×/g, "*"))});`)();
}
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
const len = s => { if (!s || s === "?" || /[a-z]/i.test(s.replace(/cm|m$|km/g, "").replace(/ /g, ""))) return null; const m = /^(\d+(?:,\d+)?)?(?:√(\d+))?/.exec(s.replace(/ /g, "")); if (!m || (!m[1] && !m[2])) return null; return (m[1] ? Number(m[1].replace(",", ".")) : 1) * (m[2] ? Math.sqrt(Number(m[2])) : 1); };
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(num(f[0]) + 1).replace(".", ",")); const val = evalLabel(p.label); if (val !== null) { assert.ok(close(val, p.value), `${p.label} = ${val}, kunci ${p.value}`); rechecked++; } }
    if (p.kind === "root") { const [c, r] = simplifyRoot(p.coef, p.rad); assert.deepEqual([c, r], [p.coef, p.rad], "akar paling sederhana"); assert.ok(p.rad > 1);
      wrong(`${p.coef + 1}|${p.rad}`); if (p.coef > 1) wrong(`1|${p.coef * p.coef * p.rad}`); if (p.coef === 1) assert.ok(correct(q, swap(i, `|${p.rad}`)), "koefisien 1 boleh kosong"); }
    if (p.kind === "classify") { p.rows.forEach(r => { assert.equal(triangleType(r.text.split(",").map(Number)), r.answer, r.text); rechecked++; });
      f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); }); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
  // Gambar segitiga siku-siku: panjang yang tertulis sebanding dengan gambar dan memenuhi Pythagoras.
  const figs = q.scene?.type === "fig" ? [q.scene.fig] : q.scene?.type === "figs" ? q.scene.items.map(x => x.fig) : [];
  for (const fig of figs) {
    if (fig.pts.length !== 3 || !fig.right) continue;
    const L = fig.pts.map((p, k) => Math.hypot(...[0, 1].map(d => fig.pts[(k + 1) % 3][d] - p[d])));
    const [i] = fig.right, hyp = (i + 1) % 3, legs = [i, (i + 2) % 3];
    assert.ok(close(L[hyp] ** 2, L[legs[0]] ** 2 + L[legs[1]] ** 2, 1e-6), `gambar siku-siku ${q.prompt}`);
    const known = (fig.sides ?? []).map(len), ratios = known.map((x, k) => (x === null ? null : x / L[k])).filter(x => x !== null);
    if (ratios.length >= 2 && !/x|√42/.test(JSON.stringify(fig.sides))) { assert.ok(ratios.every(r => close(r, ratios[0], 1e-6)), `skala gambar ${q.prompt} ${ratios}`); rechecked++; }
  }
}
// Soal cerita dihitung ulang dari datanya.
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const leg = (c, b) => Math.sqrt(c * c - b * b), hyp = (a, b) => Math.hypot(a, b);
const check = (a, b) => { assert.ok(close(a, b), `${a} ≠ ${b}`); rechecked++; };
check(find(/tangga panjangnya 250 cm/).parts[0].value, leg(250, 70) / 100);
check(find(/Tangga 5 m disandarkan/).parts[0].value, leg(5, 3));
check(find(/Benang layang-layang/).parts[0].value, leg(50, 30));
check(find(/Lapangan berbentuk/).parts[0].value, hyp(60, 80));
const bt = find(/permainan bentengan/); check(bt.parts[0].value, hyp(4, 3)); check(bt.parts[1].value, hyp(6, 8));
assert.equal(find(/lebar sungai/).parts[0].answer, `${leg(17, 8)} m`); rechecked++;
const boats = find(/perahu nelayan 24 km/); check(boats.parts[0].value, hyp(24, 18)); check(boats.parts[1].value, (hyp(24, 18) - 24) / 36 * 60);
const radar = find(/Radar berada 12 km/); check(radar.parts[0].value, leg(13, 12)); check(radar.parts[1].value, leg(20, 12)); check(radar.parts[2].value, leg(20, 12) - leg(13, 12));
const ant = find(/Tiang antena/); check(ant.parts[0].value, hyp(12 * 3 / 4, 12)); check(ant.parts[1].coef * Math.sqrt(ant.parts[1].rad), 4 * Math.sin(Math.PI / 3));
const dive = find(/Penyelam turun/); check(dive.parts[0].value, leg(25, 20)); check(dive.parts[1].value, 3.14 * leg(25, 20) ** 2);
const kusen = find(/Kusen jendela/); check(kusen.parts[0].value, hyp(48, 36)); assert.equal(kusen.parts[1].answer, hyp(48, 36) === 61 ? "Ya" : "Tidak");
const trap = find(/trapesium siku-siku ABCD/); check(trap.parts[0].value, 29 - 20); check(trap.parts[1].value, hyp(12, 9));
const heli = find(/Helikopter/); check(heli.parts[0].value, 400); assert.deepEqual([heli.parts[1].coef, heli.parts[1].rad], [400, 3]); check(heli.parts[2].value, Math.round(400 * 1.73 - 400));
const multi = find(/nilai variabel pada setiap segitiga/); check(multi.parts[0].coef * Math.sqrt(multi.parts[0].rad), leg(11, 7)); check(multi.parts[1].value, leg(13, 12)); check(multi.parts[2].value, hyp(hyp(3, 4), 12));
const xq = find(/√\{42\} dan 2x/); { const x = xq.parts[0].coef * Math.sqrt(xq.parts[0].rad); check((5 * x) ** 2, 42 + (2 * x) ** 2); }
const pq = find(/\(p − q\), p, dan \(p \+ q\)/); { const [qq, a, c] = pq.parts.map(p => p.value); check(a, 20 - qq); check(c, 20 + qq); check(a * a + 400, c * c); }
for (const [P, Q] of [[3, 2], [5, 2]]) { const t = find(new RegExp(`p = ${P} dan q = ${Q}`)); const [a, b, c] = t.parts.map(p => p.value); check(a, P * P - Q * Q); check(b, 2 * P * Q); check(c, P * P + Q * Q); }
const pts = s => [...s.matchAll(/\((−?\d+), (−?\d+)\)/g)].map(m => m.slice(1).map(x => Number(x.replace("−", "-"))));
for (const q of all.filter(q => /Tentukan jarak titik/.test(q.prompt))) { const [[a, b], [c, d]] = pts(q.prompt), d2 = (c - a) ** 2 + (d - b) ** 2, p = q.parts[0];
  check(p.kind === "num" ? p.value ** 2 : p.coef ** 2 * p.rad, d2);
  const g = q.scene.points; assert.deepEqual([g[0].x, g[0].y, g[1].x, g[1].y], [a, b, c, d], "titik gambar sesuai soal"); }
const abc = find(/A\(−2, 4\), B\(4, 1\)/); { const [A, B, C] = pts(abc.prompt), d2 = (P, Q) => (P[0] - Q[0]) ** 2 + (P[1] - Q[1]) ** 2;
  assert.equal(d2(A, B) + d2(B, C), d2(A, C)); assert.equal(abc.parts[0].answer, "Siku-siku di B"); rechecked++; }
const duel = find(/saling membelakangi/); check(duel.parts[0].value, hyp(20 + 12, 15 + 9));
const sameq = find(/\(4, 2\) sebagai titik pertama/); check(hyp(7 - 4, 6 - 2), 5); assert.ok(sameq.parts[0].answer.includes("5"));
const tfq = find(/Tentukan benar atau salah/); tfq.parts[0].statements.forEach(s => { const n = s.text.match(/\d+/g).map(Number); assert.equal(triangleType(n) === "Siku-siku", s.answer, s.text); rechecked++; });
const kind = all.filter(q => q.parts[0].kind === "choice" && q.parts[0].options.includes("Tumpul")); kind.forEach(q => { const n = q.prompt.match(/(\d+) m, (\d+) m, dan (\d+) m/).slice(1).map(Number); assert.equal(triangleType(n), q.parts[0].answer); rechecked++; });
const right = find(/dikatakan segitiga siku-siku jika/); right.parts[0].options.forEach(o => { const n = o.match(/\d+/g).map(Number); assert.equal(triangleType(n) === "Siku-siku", o === right.parts[0].answer, o); }); rechecked++;
console.log(`Kunci dihitung ulang dari rumus, gambar dan data: ${rechecked}`);
console.log(`Data Kelas 8 Bab 2 valid: ${all.length} soal.`);
