// Verifikasi Kelas 4 Bab 4 Pengukuran Luas dan Volume: susunan soal dan kunci yang dihitung ulang dari gambarnya.
// Jalankan: node --experimental-strip-types scripts/verify-grade-four-measure-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, polyArea, cubeCount, partKey } from "../src/data/grade-four-measure-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 2; t++) assert.equal(Q.filter(q => q.topic === t).length, 12, `evaluasi subtopik ${topics[t].code} 12 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "rank", "match", "multi", "sort", "shade", "pour", "cuboid"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["rank", "match", "multi", "sort", "shade", "pour", "cuboid"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);

const big = { lapangan: 1, kolam: 1, halaman: 1, basket: 1, bingkai: 0, buku: 0, perangko: 0, saputangan: 0, sendok: 0, parfum: 0, obat: 0, ember: 1, tong: 1, galon: 1 };
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
  const polys = q.scene?.type === "polys" ? q.scene.polys : [], areas = polys.map(polyArea);
  for (const [i, p] of q.parts.entries()) {
    if (p.kind === "rank" || p.kind === "match" || p.kind === "sort") { const v = q.answer.split("‖"); v[i] = v[i].split("|")[0]; assert.ok(!ready(q, v.join("‖")), `${q.prompt}: ${p.kind} sebagian dianggap lengkap`); }
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "rank") { const vals = p.items.map(x => x.value); assert.equal(new Set(vals).size, vals.length, `${q.prompt}: nilai urutan kembar`); checked++;
      if (polys.length) { p.items.forEach(it => assert.equal(it.value, areas[polys.findIndex(x => x.label === it.label)], `${q.prompt}: luas ${it.label}`)); }
      if (q.scene?.type === "bottles") p.items.forEach((it, k) => assert.equal(it.value, q.scene.rows[k].small)); }
    if (p.kind === "multi" && polys.length) { const n = Number(p.label.match(/(\d+)/)[1]); assert.deepEqual([...p.answer].sort(), polys.filter(x => polyArea(x) === n).map(x => x.label).sort(), q.prompt); checked++; }
    if (p.kind === "sort") { p.items.forEach((t, k) => assert.equal(p.answer[k], big[t], `${q.prompt}: ${t}`)); assert.ok(p.answer.includes(0) && p.answer.includes(1)); checked++; }
    if (p.kind === "shade") { assert.ok(p.need < p.cols * p.rows); const half = q.answer.split("‖")[i].split("|").slice(1).join("|"); assert.ok(!correct(q, q.answer.replace(q.answer.split("‖")[i], half)), `${q.prompt}: arsiran kurang dianggap benar`); checked++; }
    if (p.kind === "pour") { assert.ok(!correct(q, String(p.small + 1)) && !correct(q, String(p.small - 1))); checked++; }
    if (p.kind === "cuboid") { const [a, b, c] = partKey(p).split("|").map(Number); assert.equal(a * b * c, p.need); assert.ok(b <= 4 && c <= 4, "lebar dan tinggi kunci dapat disusun"); assert.ok(!correct(q, "2|2|2")); checked++; }
    if (p.kind === "fill" && polys.length && /persegi satuan|Luas = □ cm²|R □ cm², S □ cm²|^A □, B □/.test(p.text)) { assert.deepEqual(p.answers, areas, `${q.prompt}: luas`); checked++; }
    if (p.kind === "fill" && q.scene?.type === "cubes") { assert.deepEqual(p.answers, q.scene.shapes.map(s => cubeCount(s.heights)), `${q.prompt}: volume`); checked++; }
    if (p.kind === "fill" && q.scene?.type === "cartons") { assert.equal(p.answers[0], q.scene.items.reduce((s, x) => s + x.ml, 0)); if (p.answers[1] !== undefined) assert.equal(p.answers[1] * 1000, p.answers[0]); checked++; }
  }
  if (q.scene?.type === "polys") for (const poly of polys) assert.ok(poly.rows.every(r => /^[#.abcd]+$/.test(r)), q.prompt);
}
// Isian berbentuk "angka satuan = □ satuan" dihitung dari teksnya.
const ml = s => { let m; if ((m = s.match(/^([\d.]+) l ([\d.]+) ml$/))) return +m[1].replaceAll(".", "") * 1000 + +m[2].replaceAll(".", ""); if ((m = s.match(/^([\d.]+) (ml|l|cm³|m³)$/))) return +m[1].replaceAll(".", "") * { ml: 1, l: 1000, "cm³": 1, "m³": 1000000 }[m[2]]; return NaN; };
for (const q of all) for (const p of q.parts) {
  if (p.kind !== "fill") continue;
  const m = p.text.match(/^([\d.]+ (?:ml|l))(?: = | )□ (l|ml)(?: □ ml)?$/);
  if (m) { const want = ml(m[1]); const got = p.answers.length === 2 ? p.answers[0] * 1000 + p.answers[1] : p.answers[0] * (m[2] === "l" ? 1000 : 1); assert.equal(got, want, p.text); checked++; }
  const a = p.text.match(/^([\d.]+) (m²|cm²) = □ (m²|cm²)$/);
  if (a) { const n = +a[1].replaceAll(".", ""); assert.equal(p.answers[0], a[2] === "m²" ? n * 10000 : n / 10000, p.text); checked++; }
}
for (const q of all) for (const p of q.parts) if (p.kind === "match") { p.left.forEach((l, k) => assert.equal(ml(l), ml(p.right[p.answer[k]]), l)); checked++; }
// Soal cerita: dihitung dari kalimatnya
{ const q = Q.find(q => /tangki/.test(q.prompt)); assert.equal(q.parts[0].answers[0] * 1000 + q.parts[0].answers[1], 1850000 - 625450); checked++; }
{ const q = Q.find(q => /Fina/.test(q.prompt)); assert.equal(q.parts[0].answers[0] * 1000 + q.parts[0].answers[1], 2450 + 1800 + 3650); checked++; }
{ const q = Q.find(q => /Olivia/.test(q.prompt)); assert.equal(q.parts[0].answers[0] * 1000 + q.parts[0].answers[1], 7500 - 3700); checked++; }
{ const q = Q.find(q => /bingkai foto/.test(q.prompt)); assert.equal(q.parts[0].answers[2], polyArea(q.scene.polys[0])); assert.deepEqual(q.parts[0].answers, [40, 12, 28]); checked++; }
{ const q = Q.find(q => /K □ cm³/.test(JSON.stringify(q.parts))); const [k, l] = q.scene.shapes.map(s => cubeCount(s.heights)); assert.equal(q.parts[1].answer, `${Math.abs(k - l)} cm³`); checked++; }
assert.ok(checked >= 30, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 4 Bab 4 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
