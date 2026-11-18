// Verifikasi Kelas 3 Bab 5 Penyajian Data dalam Tabel: susunan soal dan kunci yang dihitung ulang dari gambar soal.
// Jalankan: node --experimental-strip-types scripts/verify-grade-three-data-table.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, countOf, frequency, lettersOf } from "../src/data/grade-three-data-table.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "kalimat soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "multi", "rank", "table", "tally"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);

for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
  for (const p of q.parts) {
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "multi") { p.answer.forEach(a => assert.ok(p.options.includes(a), q.prompt)); assert.ok(p.answer.length < p.options.length, q.prompt); }
    if (p.kind === "rank") { assert.ok(p.items.length >= 3); assert.ok(!correct({ ...q, parts: [p] }, p.items.map((_, i) => i).join("|")) || p.items.every((it, i, a) => !i || (p.dir === "naik" ? a[i - 1].value <= it.value : a[i - 1].value >= it.value)), `${q.prompt}: urutan awal sudah benar`); }
    if (p.kind === "table") { assert.ok(p.rows.some(r => r.tally || r.count), `${q.prompt}: tabel tanpa isian`); if (q.scene?.type === "cards") assert.ok(p.noTally, `${q.prompt}: turus tidak boleh memberi tahu jawaban`); }
  }
}

// Kunci dihitung ulang dari gambar soal
const scene = q => q.scene;
for (const q of all) {
  const s = scene(q);
  if (s?.type === "tallyTable") for (const p of q.parts) if (p.kind === "fill" && /^[A-Za-z]+ □/.test(p.text)) assert.deepEqual(p.answers, s.rows.map(r => r.n), `${q.prompt}: turus`);
  if (s?.type === "word") for (const p of q.parts) if (p.kind === "table") { const f = frequency(lettersOf(s.word)); p.rows.forEach(r => assert.equal(r.n, f.get(r.label), `${q.prompt}: huruf ${r.label}`)); }
  if (s?.type === "cards") {
    const v = s.values;
    for (const p of q.parts) {
      if (p.kind === "rank") assert.deepEqual(p.items.map(i => i.value), v, `${q.prompt}: kartu peringkat sama dengan gambar`);
      if (p.kind === "table") p.rows.forEach(r => assert.equal(r.n, countOf(v, Number(r.label)), `${q.prompt}: nilai ${r.label}`));
      if (p.kind === "table") assert.equal(p.rows.reduce((a, r) => a + r.n, 0), v.length, `${q.prompt}: jumlah baris = banyak data`);
    }
    if (q.prompt.startsWith("Perhatikan nilai ulangan harian")) assert.deepEqual(q.parts[0].answers, [Math.min(...v), Math.max(...v), Math.max(...v) - Math.min(...v)]);
    if (q.prompt.startsWith("Tentukan nilai terkecil")) assert.deepEqual(q.parts[0].answers, [Math.min(...v), Math.max(...v)]);
    if (q.prompt.startsWith("Berapakah jangkauan")) assert.deepEqual(q.parts[0].answers, [Math.max(...v), Math.min(...v), Math.max(...v) - Math.min(...v)]);
    if (q.prompt.startsWith("Berapa siswa yang nilainya lebih dari 7")) assert.equal(q.parts[0].answers[0], v.filter(x => x > 7).length);
    if (q.prompt.startsWith("Dari nilai ulangan berikut")) assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [countOf(v, 9), v.filter(x => x > 7).length]);
    if (q.prompt.startsWith("Nilai berapa yang paling banyak")) { const f = [...frequency(v)].sort((a, b) => b[1] - a[1]); assert.ok(f[0][1] > f[1][1], "modus tunggal"); assert.deepEqual(q.parts[0].answers, [Number(f[0][0]), f[0][1]]); }
    if (q.prompt.startsWith("Kartu menunjukkan manik")) assert.equal(q.parts[1].answers[0], v.filter(x => x > 3).length);
  }
  if (s?.type === "story") {
    const m = Object.fromEntries(s.items.map(i => [i.name, i.n]));
    for (const p of q.parts) {
      if (p.kind === "rank") p.items.forEach(it => assert.equal(it.value, m[it.label], `${q.prompt}: ${it.label}`));
      if (p.kind === "multi" && p.label.startsWith("Kelereng sama") || p.label === "Pilih semua:") { const same = Object.keys(m).filter(n => Object.values(m).filter(x => x === m[n]).length > 1); assert.deepEqual([...p.answer].sort(), same.sort(), q.prompt); }
    }
  }
  if (s?.type === "objects") { const m = Object.fromEntries(s.items.map(i => [i.thing, i.n]));
    for (const p of q.parts) { if (p.kind === "fill") assert.deepEqual(p.answers, [m.bola, m.pensil]); if (p.kind === "rank") p.items.forEach(it => assert.equal(it.value, m[it.label.toLowerCase()])); } }
  if (s?.type === "letters") { const c = ch => s.text.split(" ").filter(x => x === ch).length;
    if (q.parts[0].text.startsWith("a =")) assert.deepEqual(q.parts[0].answers, [c("a"), c("b")]);
    if (q.parts[0].text.startsWith("x =")) assert.deepEqual(q.parts[0].answers, [c("x"), c("y"), c("x") + c("y")]); }
}
{ const q = Q.find(q => q.prompt.startsWith("Danu memberi Putri")), m = Object.fromEntries(q.scene.items.map(i => [i.name, i.n])); m.Danu -= 4; m.Putri += 4; const mn = Math.min(...Object.values(m));
  assert.deepEqual([...q.parts[0].answer].sort(), Object.keys(m).filter(n => m[n] === mn).sort()); assert.equal(q.parts[1].answers[0], m.Putri); }
{ const q = Q.find(q => q.prompt.startsWith("Tabel pilihan ketua kelas")); assert.equal(q.parts[0].rows[0].n, 24 - q.scene.rows.reduce((a, r) => a + r.n, 0)); }
{ const q = Q.find(q => q.prompt.startsWith("Berapa siswa yang nilainya kurang dari 7")); assert.equal(q.parts[0].answers[0], q.scene.rows.filter(r => Number(r.label) < 7).reduce((a, r) => a + r.n, 0)); }
{ const q = Q.find(q => q.prompt.startsWith("Nilai terkecil sebuah ulangan")); assert.equal(q.parts[0].answers[0], 4 + 5); }
{ const q = Q.find(q => q.prompt.startsWith("Kelas 4 butuh")); assert.deepEqual(q.parts[0].answer, ["Rafi", "Lala"]); assert.equal(q.parts[1].answer, "Dimas"); }
for (const q of all) for (const p of q.parts) if (p.kind === "tally") assert.ok(q.prompt.includes(String(p.n)), `${q.prompt}: bilangan turus ada di soal`);
{ const q = practice[1].find(q => q.prompt.startsWith("Perhatikan tabel buah")), rows = q.scene.rows, mx = Math.max(...rows.map(r => r.n));
  assert.equal(q.parts[0].answer, rows.find(r => r.n === mx).label); assert.deepEqual(q.parts[1].answer, rows.filter(r => rows.filter(x => x.n === r.n).length > 1).map(r => r.label)); }

console.log(`Kelas 3 Bab 5 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), bentuk jawaban ${[...kinds].join(", ")}`);
