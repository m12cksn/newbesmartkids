import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, latticeOn, solve, eqText } from "../src/data/grade-nine-systems.ts";

assert.equal(topics.length, 2); assert.deepEqual(topics.map(t => t.sections.length), [2, 4]);
assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "B.1", "B.2", "B.3", "B.4"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 6, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 5 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
Object.values(tally(assessment, q => q.topic)).forEach(c => assert.ok(c >= 3, "setiap bagian diuji minimal 3 soal"));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `bagian berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| bergambar/interaktif:", assessment.filter(q => q.scene || q.parts.some(p => p.kind === "draw" || p.kind === "pick")).length);
assert.ok(Object.keys(kinds).length >= 7);
console.log("Posisi jawaban pilihan:", all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)).join(","));

let rechecked = 0;
const eq = (a, b, msg = "") => { assert.ok(Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b)), `${msg} ${a} ≠ ${b}`); rechecked++; };
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); wrong(String(p.value - 2)); if (p.value !== 0) wrong(String(-p.value)); }
    if (p.kind === "table" || p.kind === "point") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "eq") {
      assert.ok(correct(q, swap(i, [-p.a, -p.b, -p.c].map(x => String(x)).join("|"))), "bentuk setara (dikali −1) diterima");
      assert.ok(correct(q, swap(i, [2 * p.a, 2 * p.b, 2 * p.c].map(x => String(x)).join("|"))), "bentuk setara (dikali 2) diterima");
      f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); }); wrong("0|0|0");
      if (p.c !== 0) { const g = [...f]; g[2] = String(-num(g[2])); wrong(g.join("|")); } rechecked++;
    }
    if (p.kind === "draw") { const pts = latticeOn(p); assert.ok(pts.length >= 2); wrong(`${pts[0].join(",")};${pts[0].join(",")}`); wrong(`${pts[0].join(",")};${pts[0][0] + 1},${pts[0][1]}`);
      for (let k = 1; k < pts.length; k++) assert.ok(correct(q, swap(i, `${pts[0].join(",")};${pts[k].join(",")}`)), "dua titik mana pun pada garis diterima"); rechecked++; }
    if (p.kind === "pick") { const pts = latticeOn(p, true), key = pts.map(x => x.join(","));
      for (const [x, y] of pts) { eq(p.a * x + p.b * y, p.c); assert.ok(x >= 0 && y >= 0 && x <= p.r && y <= p.r, "titik penyelesaian terlihat"); }
      for (let x = 0; x <= p.c; x++) for (let y = 0; y <= p.c; y++) assert.equal(p.a * x + p.b * y === p.c, key.includes(`${x},${y}`), `himpunan cacah lengkap ${x},${y}`);
      wrong(key.slice(1).join(";")); wrong([...key, "1,1"].join(";")); assert.ok(correct(q, swap(i, [...key].reverse().join(";"))), "urutan bebas"); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
  // Sistem: penyelesaian dihitung ulang dari koefisien.
  if (q.sys) {
    const s = solve(...q.sys); assert.equal(typeof s, "object", `sistem tunggal: ${q.prompt}`);
    const [a1, b1, c1, a2, b2, c2] = q.sys; eq(a1 * s.x + b1 * s.y, c1); eq(a2 * s.x + b2 * s.y, c2);
    const p = q.parts.find(x => x.kind === "point"); if (p) { eq(p.x, s.x, q.prompt); eq(p.y, s.y, q.prompt); }
    q.parts.filter(x => x.kind === "draw").forEach((d, k) => { assert.deepEqual([d.a, d.b, d.c], k ? [a2, b2, c2] : [a1, b1, c1]); rechecked++; });
  }
}
const byId = id => { const r = all.filter(q => q.id === id); assert.equal(r.length, 1, id); return r[0]; };
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const val = (q, k) => q.parts[k].value;
// Soal cerita: hitung ulang dari data di soal.
{ const q = byId("kursi"), s = solve(1, 1, 20, 150000, 250000, 3800000); eq(val(q, 0), s.x); eq(val(q, 1), s.y); }
{ const q = byId("kebun"), p = (46 / 2 + 3) / 2; eq(val(q, 0), p); eq(val(q, 1), p * (p - 3)); }
{ const q = byId("batik"), s = solve(3, 2, 1900000, 2, 5, 2000000); eq(val(q, 0), s.x); eq(val(q, 1), s.y); let best = 0; for (let t = 0; t <= 6; t++) if (t * s.x + (6 - t) * s.y <= 2400000) best = t; eq(val(q, 2), best); }
{ const q = byId("xy"), s = solve(1, 1, 10, 1, -1, 6); eq(val(q, 0), s.x * s.y); }
{ const q = byId("taman"), s = solve(1, 1, 25, -2, 1, -2); eq(val(q, 0), s.x); eq(val(q, 1), s.y); eq(val(q, 2), s.x * s.y); eq(2 * s.x + 2 * s.y, 50); }
{ const q = byId("kue"), s = solve(1, 3, 11000, 2, 5, 20000); eq(val(q, 0), 3 * s.x + 4 * s.y); }
{ const q = find(/Tiket terusan/), s = solve(1, 1, 150, 75000, 40000, 9150000); eq(val(q, 0), s.x); eq(val(q, 1), s.y); }
{ const q = byId("n"), n = q.parts[0].value; assert.equal(solve(1, -2, 5, -3, n, 4), "sejajar"); assert.equal(typeof solve(1, -2, 5, -3, n + 1, 4), "object"); rechecked++; }
{ const q = find(/berpenyiku/), s = solve(1, 1, 90, -3, 1, 10); eq(val(q, 0), s.x); eq(val(q, 1), s.y); eq(s.y, 3 * s.x + 10); }
{ const q = byId("buah"), s = solve(5, 2, 128000, 3, 4, 144000); eq(val(q, 0), s.x); eq(val(q, 1), 7 * s.x + s.y); }
{ const q = find(/Dina berangkat/), s = solve(40, -1, 0, 60, -1, 30); const m = Math.round((7 + s.x) * 60); assert.equal(q.parts[0].answer, `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(m % 60).padStart(2, "0")}`); eq(val(q, 1), s.y);
  assert.deepEqual([q.scene.a.speed, q.scene.b.speed, q.scene.b.start], [40, 60, 0.5]); }
{ const q = find(/kadar perak/), s = solve(1, 1, 50, 0.4, 0.8, 0.64 * 50); eq(val(q, 0), s.x); eq(val(q, 1), s.y); }
{ const q = find(/searah angin/), s = solve(1, 1, 2400 / 4, 1, -1, 2000 / 4); eq(val(q, 0), s.x); eq(val(q, 1), s.y); }
{ const q = byId("pq"), pq = q.parts[0].value; let found = null; for (let p = -10; p <= 10; p++) for (let qq = -20; qq <= 30; qq++) if (solve(2, 3, 5 + p, p + 4, 6, 16 - qq) === "berimpit") found = [p, qq]; assert.ok(found); eq(pq, found[0] + found[1]); }
{ const q = byId("pecahan"), { x, y } = q.parts[0]; eq(3 * (x + y) - 2 * (x - y), 19); eq((x + y) / 7 + x - y, 2); }
{ const q = byId("susul"), jarak = 36 * (60 / 60); eq(val(q, 0), jarak / (50 / 60)); }
{ const q = find(/garis pada grafik berikut/), p = q.parts[0]; eq(p.a * 4 + p.b * 0, p.c); eq(p.a * 0 + p.b * 3, p.c); }
{ const q = find(/Pasangkan setiap sistem/); const kind = e => { const s = solve(...e[0], ...e[1]); return typeof s === "string" ? s : "satu"; };
  const want = { "x + y = 2 dan 2x + 2y = 6": "sejajar", "x − y = 2 dan 2x − 2y = 4": "berimpit", "x + y = 2 dan x − y = 2": "satu" };
  q.parts[0].rows.forEach(r => { const it = q.scene.items.find(i => i.caption === r.answer); assert.equal(kind(it.eqs), want[r.text], r.text); assert.equal(`${eqText(...it.eqs[0])} dan ${eqText(...it.eqs[1])}`.replace("2x + 2y = 6", "2x + 2y = 6"), r.text); rechecked++; }); }
{ const q = find(/Berapa banyak penyelesaian setiap sistem/), sys = [[-3, 1, -1, -3, 1, 4], [1, 1, 3, 2, -1, 0], [1, -2, 4, -3, 6, -12]], name = { sejajar: "Tidak ada", berimpit: "Tak hingga" };
  q.parts[0].rows.forEach((r, k) => { const s = solve(...sys[k]); assert.equal(typeof s === "string" ? name[s] : "Tepat satu", r.answer); rechecked++; }); }
{ const pl = all.flatMap(q => q.parts.filter(p => p.kind === "classify" && p.options.includes("PLDV")).flatMap(p => p.rows));
  const lin = { "4p − 5 = 11": 1, "2a = 7 − b": 2, "3p − 5q = −2p": 2, "−2n + 1 = 5n": 1, "{x/2} + 3y = 8": 2, "4a = 7 − 2b": 2, "5p − 3 = 2p": 1, "{x/3} + 2y = 8": 2, "xy − 2y = 6": 0, "3m − 4n = −m": 2 };
  pl.forEach(r => { assert.ok(r.text in lin, r.text); assert.equal(r.answer === "PLDV", lin[r.text] === 2, r.text); rechecked++; }); }
{ const rows = all.flatMap(q => q.parts.filter(p => p.kind === "classify" && p.options.includes("Penyelesaian")).flatMap(p => p.rows));
  const f = { "y = 4x; (0, 4)": (x, y) => y === 4 * x, "y = 2x − 5; ({1/2}, −4)": (x, y) => y === 2 * x - 5, "−2x − 3y = −5; (−2, 3)": (x, y) => -2 * x - 3 * y === -5, "2y = 3x + 2; (−2, −3)": (x, y) => 2 * y === 3 * x + 2,
    "(2, −1)": (x, y) => 3 * x - 2 * y === 8, "(0, 4)": (x, y) => 3 * x - 2 * y === 8, "({1/3}, −{7/2})": (x, y) => Math.abs(3 * x - 2 * y - 8) < 1e-9, "(6, 4)": (x, y) => 3 * x - 2 * y === 8 };
  const pts = { "y = 4x; (0, 4)": [0, 4], "y = 2x − 5; ({1/2}, −4)": [0.5, -4], "−2x − 3y = −5; (−2, 3)": [-2, 3], "2y = 3x + 2; (−2, −3)": [-2, -3], "(2, −1)": [2, -1], "(0, 4)": [0, 4], "({1/3}, −{7/2})": [1 / 3, -3.5], "(6, 4)": [6, 4] };
  rows.forEach(r => { assert.equal(r.answer === "Penyelesaian", f[r.text](...pts[r.text]), r.text); rechecked++; }); }
{ const q = find(/Lengkapi tabel penyelesaian/).parts[0]; q.xs.forEach((x, k) => eq(3 * x + q.ys[k], 9)); }
{ const q = find(/x \+ 3y = 12/); eq(val(q, 0), latticeOn({ a: 1, b: 3, c: 12, r: 12 }, true).length); }
{ const q = find(/Joko menyelesaikan/), s = solve(1, 2, 10, -2, 3, -6); assert.ok(q.parts[0].answer.includes(`(${s.x}, ${s.y})`)); rechecked++; }
{ const q = find(/4x \+ 3y = 5 dan 6x − 5y = 17/); assert.equal(q.parts[0].answer, `${12 / 4} dan ${12 / 6}`); rechecked++; }
{ const q = find(/Rani membeli/); eq(val(q, 1), (27000 - 4 * 4500) / 3); }
assert.equal(num("−1/2"), -0.5); assert.equal(num("43,2"), 43.2); assert.equal(num("9.150.000"), 9150000);
console.log(`Kunci dihitung ulang dari sistem, data soal cerita, dan himpunan penyelesaian: ${rechecked}`);
console.log(`Data Kelas 9 Bab 1 valid: ${all.length} soal.`);
