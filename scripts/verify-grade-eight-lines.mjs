import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, num, latticeOn } from "../src/data/grade-eight-lines.ts";

assert.equal(topics.length, 2); assert.deepEqual(topics.map(t => t.sections.length), [3, 5]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 8, "peraga berbeda di setiap bagian");
topics.forEach(t => t.sections.forEach(s => assert.ok(s.life.length > 80 && s.steps.length >= 4 && s.example.length > 30, `materi lengkap ${s.title}`)));
assert.deepEqual(practice.map(p => p.length), [4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 12, 1: 12 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| bergambar:", assessment.filter(q => q.scene || q.parts.some(p => p.pics || p.kind === "draw")).length);
assert.ok(Object.keys(kinds).length >= 8);
const pos = assessment.flatMap(q => q.parts).filter(p => p.kind === "choice" && p.options.length > 2).map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan ganda:", pos.join(","));

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); wrong(String(p.value - 2)); if (p.value !== 0) wrong(String(-p.value)); }
    if (p.kind === "table" || p.kind === "mc" || p.kind === "point" || p.kind === "line") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "line") { assert.ok(correct(q, swap(i, `${f[0].replace(",", ".")}|${f[1]}`)) || !f[0].includes(","), "desimal titik"); }
    if (p.kind === "draw") { const pts = latticeOn(p); assert.ok(pts.length >= 2); wrong(`${pts[0].join(",")};${pts[0].join(",")}`); wrong(`${pts[0].join(",")};${pts[0][0] + 1},${pts[0][1]}`);
      for (let k = 1; k < pts.length; k++) assert.ok(correct(q, swap(i, `${pts[0].join(",")};${pts[k].join(",")}`)), "dua titik mana pun pada garis diterima"); rechecked++; }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const eq = (a, b) => { assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`); rechecked++; };
const slope = ([x1, y1], [x2, y2]) => (y2 - y1) / (x2 - x1);
const lineThrough = (A, B) => { const m = slope(A, B); return [m, A[1] - m * A[0]]; };
// Tabel dan titik.
const t1 = find(/y = 2x − 1/).parts[0]; t1.xs.forEach((x, k) => eq(t1.ys[k], 2 * x - 1));
const t2 = find(/2x − y = 3/); t2.parts[0].xs.forEach((x, k) => eq(2 * x - t2.parts[0].ys[k], 3)); eq(2 * t2.parts[1].value - 0, 3);
const ic = find(/3x \+ 2y = 12/); eq(3 * ic.parts[0].x, 12); eq(2 * ic.parts[1].y, 12);
const pp = find(/koordinat y dari P adalah 5/).parts[0]; eq(2 * pp.x - 3, pp.y);
const lin = find(/merupakan persamaan garis lurus/).parts[0]; lin.rows.forEach(r => assert.equal(/\^\{2\}/.test(r.text), r.answer === "Bukan garis lurus"));
// Pilihan grafik: hanya satu grafik yang memenuhi 2x − y + 4 = 0.
const gq = find(/2x − y \+ 4 = 0/).parts[0]; gq.options.forEach((o, k) => { const l = gq.pics[k].lines[0]; assert.equal(l.m === 2 && l.c === 4, o === gq.answer); }); rechecked++;
// Kemiringan.
eq(find(/tangga tempat tidur/).parts[0].value, 140 / 35);
const two = find(/melalui dua titik berikut/); eq(two.parts[0].value, slope([2, 1], [4, 7])); eq(two.parts[1].value, slope([1, 2], [-2, 8]));
eq(find(/A\(1, −2\) dan B\(3, 6\)/).parts[0].value, slope([1, -2], [3, 6]));
const ramp = find(/setinggi 75 cm/); eq(ramp.parts[0].value, 75 / 600); assert.equal(ramp.parts[1].answer, 75 / 600 <= 0.15 ? "Aman" : "Tidak aman");
const st = find(/12 anak tangga/); eq(st.parts[0].value, 216 / 12); eq(st.parts[1].value, 216 / 300);
const ph = find(/Tentukan nilai yang belum diketahui/); { const p = ph.parts[0].value, h = ph.parts[1].value; eq(slope([-2, 3], [2, p]), 0.5); eq(slope([1, h], [h + 2, 8]), 2); }
// Persamaan garis.
const lp = (re, m, c, k = 0) => { const p = find(re).parts[k]; eq(p.m, m); eq(p.c, c); };
lp(/melalui titik \(−1, 4\) dengan kemiringan −3/, -3, 4 - -3 * -1);
{ const [m, c] = lineThrough([2, -1], [-1, 8]); lp(/melalui titik \(2, −1\) dan \(−1, 8\)/, m, c); }
{ const m = -1 / 0.5; lp(/tegak lurus dengan garis y = \{1\/2\}x \+ 1/, m, 1 - m * 3); }
const pr = find(/y = −\{1\/2\}x \+ 3/); eq(pr.parts[0].value, -0.5); eq(pr.parts[1].value, -1 / -0.5);
const ab = find(/Garis A mempunyai kemiringan 2/).parts[0]; assert.equal(ab.answer, `y = 2x − ${2 * 3 - 1} dan y = −3x − ${3 * 1 - 2}`); rechecked++;
const mc = find(/kemiringan \(m\) dan perpotongan sumbu-y/).parts[0].rows; [[-2, 4], [-1, -1], [5, 4]].forEach(([m, c], k) => { eq(mc[k].m, m); eq(mc[k].c, c); });
const moto = find(/Sepeda motor/); eq(moto.parts[0].x, 24e6 / 2e6); eq(moto.parts[1].value, 24e6 - 5 * 2e6);
const kal = find(/c = 9f \+ 120/); eq(kal.parts[0].value, 120); eq(kal.parts[1].value, 9 * 25 + 120);
const col = find(/P\(−4, 3\), Q\(a, 1\)/); { const [m, c] = lineThrough([-4, 3], [1, -2]); eq(col.parts[0].value, (1 - c) / m); eq(col.parts[1].value, (2 - c) / m); eq(col.parts[2].value, m * 4 + c); }
const match = find(/Cocokkan setiap persamaan/); { const items = match.scene.items, rows = match.parts[0].rows;
  const want = [[1, -3], [3, -2], [0.5, 2], [-2, 3]]; rows.forEach((r, k) => { const it = items.find(x => x.caption === r.answer).lines[0]; eq(it.m, want[k][0]); eq(it.c, want[k][1]); }); }
const rect = find(/persegi panjang PQRS/); { const Q = [5, -2], S = [1, 4], [m, c] = lineThrough(Q, S); assert.ok(Math.abs(3 * 0 + 2 * c - 11) < 1e-9 && Math.abs(m + 1.5) < 1e-9); assert.equal(rect.parts[0].answer, "3x + 2y − 11 = 0"); rechecked++; }
const kopi = find(/Kebun kopi Pak Alex/); eq(kopi.parts[0].value, (2800 - 1800) / 5); eq(kopi.parts[1].value, 1800 + 8 * kopi.parts[0].value);
const net = find(/akses internet naik secara linier/); eq(net.parts[0].value, (74 - 50) / 2); eq(net.parts[1].value, 2023 + (98 - 74) / 12);
const l3 = find(/l₁, l₂, dan l₃/); { const c = l3.parts[0].value; eq(-c / 2 - c / 3 - c / 6, -4); eq(l3.parts[1].m, 2); eq(l3.parts[1].c, c); }
const dce = find(/garis ACB, dengan C titik tengah/); { const C = [(0 + 8) / 2, (4 + 0) / 2]; eq(dce.parts[0].x, C[0]); eq(dce.parts[0].y, C[1]); const m = -1 / slope([0, 4], [8, 0]); eq(dce.parts[1].m, m); eq(dce.parts[1].c, C[1] - m * C[0]); }
const abc = find(/A\(4, −1\), B\(1, −7\), dan C\(k, −13\)/); { const [m, c] = lineThrough([4, -1], [1, -7]); eq(abc.parts[0].value, (-13 - c) / m); eq(abc.parts[1].m, m); eq(abc.parts[1].c, c); }
const heli = find(/Helikopter turun/); { const [m, c] = lineThrough([2, 570], [8, 480]); eq(heli.parts[0].m, m); eq(heli.parts[0].c, c); eq(heli.parts[1].value, -c / m); }
const fam = find(/y = x \+ 2, y = 2x \+ 2, dan y = 4x \+ 2/).parts[0].statements; assert.deepEqual(fam.map(s => s.answer), [true, true, false]); rechecked++;
assert.equal(num("−1/2"), -0.5); assert.equal(num("0,125"), 0.125); assert.equal(num("14.000.000"), 14e6);
console.log(`Kunci dihitung ulang dari persamaan, titik, kemiringan dan data: ${rechecked}`);
console.log(`Data Kelas 8 Bab 5 valid: ${all.length} soal.`);
