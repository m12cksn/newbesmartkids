// Verifikasi Kelas 6 Bab 2 Rasio: susunan soal, tabel rasio, dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-six-ratio-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, gcd } from "../src/data/grade-six-ratio-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 3);
practice.forEach((set, t) => { assert.equal(set.length, 8, `latihan ${topics[t].code} harus 8 soal`); for (const s of [0, 1]) assert.equal(set.filter(q => q.topic === t && q.section === s).length, 4, `latihan ${topics[t].code}.${s + 1} harus 4 soal`); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "kalimat soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
for (let t = 0; t < 3; t++) for (const s of [0, 1]) assert.ok(Q.filter(q => q.topic === t && q.section === s).length >= 3, `evaluasi ${topics[t].code}.${s + 1} minimal 3 soal`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "multi", "rtable"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk ${k}`);

for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25);
  for (const p of q.parts) {
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "multi") { const [a, b] = q.prompt.match(/(\d+) : (\d+)/).slice(1).map(Number); const ok = p.options.filter(o => { const [x, y] = o.split(" : ").map(Number); return x * b === y * a; }); assert.deepEqual([...ok].sort(), [...p.answer].sort(), `${q.prompt}: rasio senilai`); }
    if (p.kind === "rtable") {
      const total = p.head.at(-1) === "Total";
      const parts = r => (total ? r.slice(0, -1) : r);
      p.rows.forEach((r, i) => { if (total) assert.equal(r.at(-1), parts(r).reduce((a, b) => a + b, 0), `${q.prompt}: total baris ${i + 1}`); parts(r).forEach((v, j) => assert.equal(v * p.rows[0][0], p.rows[0][j] * r[0], `${q.prompt}: baris ${i + 1} tidak senilai`)); });
      p.ops.forEach((o, i) => p.rows[i + 1].forEach((v, j) => assert.equal(v, o.op === "×" ? p.rows[i][j] * o.k : p.rows[i][j] / o.k, `${q.prompt}: operasi baris ${i + 2}`)));
      assert.ok(p.hide.length + p.ops.filter(o => o.hide).length > 0);
    }
    if (p.kind === "fill") {
      // a : b = c : d di dalam kalimat harus senilai
      let k = 0; const text = p.text.replace(/□/g, () => String(p.answers[k++]));
      const chain = text.match(/\d+(?:\.\d+)? : \d+(?:\.\d+)?(?: = \d+(?:\.\d+)? : \d+(?:\.\d+)?)+/);
      if (chain) { const pairs = chain[0].split(" = ").map(s => s.split(" : ").map(x => Number(x.replace(".", "")))); pairs.forEach(([a, b]) => assert.equal(a * pairs[0][1], b * pairs[0][0], `${q.prompt}: ${chain[0]}`)); const last = pairs.at(-1); if (p.text.trim().endsWith("□ : □") || /= □ : □$/.test(p.text)) assert.equal(gcd(last[0], last[1]), 1, `${q.prompt}: belum paling sederhana`); }
    }
  }
}
// Kunci dari gambar
for (const q of all) if (q.scene?.type === "garden") { const f = q.parts[0]; const order = q.prompt.includes("cemara terhadap pucuk") ? [q.scene.cemara, q.scene.pucuk] : [q.scene.pucuk, q.scene.cemara]; assert.deepEqual(f.answers.slice(0, 2), order, q.prompt); }
for (const q of all) if (q.scene?.type === "packs") { const units = q.scene.items.map(i => i.price / i.count); for (const p of q.parts) { if (p.kind === "fill" && q.parts.indexOf(p) === 0 && /Rp□/.test(p.text) && p.answers.length === units.length) assert.deepEqual(p.answers, units, q.prompt); if (p.kind === "choice" && /hemat|murah per|Paling murah/.test(p.label)) assert.equal(p.answer, q.scene.items[units.indexOf(Math.min(...units))].name, q.prompt); } }
{ const q = Q.find(q => q.prompt.startsWith("Berapa kali kencur")); assert.deepEqual(q.parts[0].answers, [36 / 6, 36 / 18]); }
{ const q = Q.find(q => q.prompt.startsWith("Rasio anak-anak terhadap dewasa")); const k = 150 / (9 - 4); assert.deepEqual(q.parts[0].answers, [9 * k, 4 * k]); }
{ const q = Q.find(q => q.prompt.startsWith("Rasio pucuk merah terhadap cemara 2 : 3")); assert.deepEqual(q.parts[0].answers, [21, 35]); }
{ const q = Q.find(q => q.prompt.startsWith("Banyu menyiapkan")); assert.equal(q.parts[0].answers[0], 6 * 10 / 15); }
{ const q = Q.find(q => q.prompt.startsWith("Ibu membuat kopi")); assert.ok(10 / 4 > 2 / 1, "gula Dona lebih banyak"); assert.equal(q.parts[1].answer, "Terlalu manis"); }
{ const q = Q.find(q => q.prompt.startsWith("Dony")); assert.deepEqual(q.parts[0].answers, [30 / 2, 65 / 5]); }
{ const q = Q.find(q => q.prompt.startsWith("Seorang penulis")); assert.deepEqual(q.parts.map(p => p.answers[0]), [1200 * 3, 4800 / 1200]); }
{ const q = Q.find(q => q.prompt.startsWith("Klub olahraga beranggota 36")); assert.equal(q.parts[0].answers[0], 36 / 4 * 3); }
{ const q = Q.find(q => q.prompt.startsWith("Ayah menanam")); assert.deepEqual(q.parts[1].answers, [60 / 10]); }

console.log(`Kelas 6 Bab 2 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), bentuk jawaban ${[...kinds].join(", ")}`);
