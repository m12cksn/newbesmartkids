// Verifikasi Kelas 3 Bab 1 Bilangan Cacah sampai 1.000: susunan soal dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-three-whole-1000.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, reading, digits, columnResult } from "../src/data/grade-three-whole-1000.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 7, "subtopik A sampai G");
assert.equal(practice.length, 7); practice.forEach((p, i) => assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`));
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(Q.map(q => q.prompt)).size, 24, "kalimat soal evaluasi tidak boleh kembar");
for (const [i, p] of practice.entries()) { assert.equal(new Set(p.map(q => q.prompt)).size, 4, `latihan ${i} kembar`); p.forEach(q => assert.equal(q.topic, i)); }
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 7; t++) assert.ok(Q.filter(q => q.topic === t).length >= 3, `evaluasi subtopik ${topics[t].code} minimal 3 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "pv", "choice", "multi", "order", "match", "column"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);

// Kunci lolos pemeriksa, kosong tidak lolos
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
}

// Bentuk pilihan
const pos = [0, 0, 0];
for (const q of all) for (const p of q.parts) {
  if (p.kind === "choice") { assert.equal(p.options.filter(o => o === p.answer).length, 1, `${q.prompt}: jawaban pilihan`); assert.equal(new Set(p.options).size, p.options.length); if (Q.includes(q) && p.options.length === 3) pos[p.options.indexOf(p.answer)]++; }
  if (p.kind === "multi") { p.answer.forEach(a => assert.ok(p.options.includes(a))); assert.ok(p.answer.length < p.options.length); }
  if (p.kind === "order") assert.deepEqual([...p.answer].sort(), [...p.options].sort(), `${q.prompt}: urutan harus memakai semua pilihan`);
  if (p.kind === "match") { assert.deepEqual([...p.answer].sort(), p.right.map((_, i) => i), `${q.prompt}: pasangan harus satu-satu`); assert.ok(p.answer.some((a, i) => a !== i), `${q.prompt}: pasangan tidak boleh lurus semua`); }
}
assert.ok(Math.max(...pos) - Math.min(...pos) <= 2, `posisi jawaban pilihan evaluasi tidak seimbang: ${pos}`);

// Hitung ulang isian dari kalimatnya
const toNum = seg => {
  let s = seg.replace(/(\d+) ratusan/g, "($1*100)").replace(/(\d+) puluhan/g, "($1*10)").replace(/(\d+) satuan/g, "($1)").replace(/×/g, "*").replace(/:/g, "/").replace(/−/g, "-").replace(/\b(telur|siswa|ekor|daun)\b/g, "").trim();
  if (/[a-zA-Z]/.test(s) || !/\d/.test(s)) return null;
  return Function(`return (${s})`)();
};
let checkedFills = 0;
for (const q of all) for (const p of q.parts) if (p.kind === "fill") {
  let k = 0; const text = p.text.replace(/□/g, () => String(p.answers[k++]));
  for (const clause of text.split(/, jadi | dan |, /)) {
    const vals = clause.split("=").map(toNum).filter(v => v !== null);
    if (vals.length > 1) { vals.forEach(v => assert.equal(v, vals[0], `${q.prompt}: "${clause}"`)); checkedFills++; }
  }
}
// Pasangan bilangan dan cara baca / hasil
const val = s => (/^\d/.test(s) ? toNum(s) : null);
for (const q of all) for (const p of q.parts) if (p.kind === "match") p.left.forEach((l, i) => {
  const r = p.right[p.answer[i]], lv = val(l), rv = val(r);
  if (rv !== null) assert.equal(lv, rv, `${q.prompt}: ${l} ↔ ${r}`); else assert.equal(reading(lv), r, `${q.prompt}: ${l} dibaca ${r}`);
});

// Kunci khusus dari gambar dan data
const byPrompt = s => Q.find(q => q.prompt.startsWith(s)) ?? practice.flat().find(q => q.prompt.startsWith(s));
for (const q of all) for (const p of q.parts) if (p.kind === "column") assert.equal(columnResult(p), p.op === "+" ? p.a + p.b : p.a - p.b);
for (const q of all) if (q.scene?.type === "blocks") { const { h, t, u } = q.scene, n = 100 * h + 10 * t + u; const p = q.parts[0]; assert.equal(p.kind === "pv" ? p.n : p.answers[0], n, `${q.prompt}: bilangan dari balok`); }
for (const q of all) { const ch = q.parts.find(p => p.kind === "choice" && p.label === "Dibaca:"); if (ch) { const p0 = q.parts[0]; const n = p0.kind === "pv" ? p0.n : p0.answers[0]; assert.equal(ch.answer, reading(n), `${q.prompt}: cara baca`); } }
for (const q of all) if (q.scene?.type === "signs" && q.parts[0].kind === "fill" && q.scene.items.length === 1) assert.equal(q.parts[0].answers[0], q.scene.items[0].n);
for (const q of all) if (q.scene?.type === "groups") { const f = q.parts.find(p => p.kind === "fill" && p.text.includes("×")); if (f) assert.deepEqual(f.answers.slice(0, 2), [q.scene.groups, q.scene.each], `${q.prompt}: kelompok`); }
for (const q of all) if (q.scene?.type === "share") assert.equal(q.parts[0].answers[0], q.scene.total / q.scene.plates, `${q.prompt}: bagi rata`);
{ const q = byPrompt("Pilih semua bilangan yang angka puluhannya"); assert.deepEqual(q.parts[0].answer, q.parts[0].options.filter(o => digits(+o)[1] < 3)); }
{ const q = byPrompt("Pilih semua bilangan yang angka 6-nya"); assert.deepEqual(q.parts[0].answer, q.parts[0].options.filter(o => digits(+o)[1] === 6)); }
{ const q = byPrompt("Perhatikan angka 8 pada bilangan 581"); assert.equal(q.parts[0].answer, ["Ratusan", "Puluhan", "Satuan"][digits(581).indexOf(8)]); }
for (const q of all) for (const p of q.parts) if (p.kind === "order" && /^\d+$/.test(p.options[0])) { const asc = [...p.options].sort((a, b) => a - b); assert.deepEqual(p.answer, q.prompt.includes("terbesar ke terkecil") ? asc.reverse() : asc, q.prompt); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /^\d+ … \d+$/.test(p.label)) { const [a, b] = p.label.split(" … ").map(Number); assert.equal(p.answer, a < b ? "<" : a > b ? ">" : "="); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /^[\d −]+ = \d+$/.test(p.label)) { const [l, r] = p.label.split(" = "); assert.equal(p.answer, toNum(l) === Number(r) ? "Benar" : "Salah", p.label); }
{ const t = byPrompt("Ada berapa anak").scene.rows; assert.equal(byPrompt("Ada berapa anak").parts[0].answers[0], t.filter(([, v]) => digits(v)[1] < 3).length); }
{ const q = byPrompt("Urutkan tinggi badan"), h = Object.fromEntries(q.scene.rows); assert.deepEqual(q.parts[0].answer, [...q.parts[0].options].sort((a, b) => h[a] - h[b])); }
{ const q = byPrompt("Uraikan tinggi badan Tono"), h = Object.fromEntries(q.scene.rows); assert.deepEqual(q.parts[0].answers.slice(0, 3), [...digits(h.Tono)]); }
{ const q = byPrompt("Jarak rumah ke sekolah"), d = Object.fromEntries(q.scene.items.map(s => [s.name.replace("Rumah ", ""), s.n])); assert.deepEqual(q.parts[0].answer, [...q.parts[0].options].sort((a, b) => d[b] - d[a])); assert.equal(q.parts[1].answer, q.parts[0].answer.at(-1)); }
{ const q = byPrompt("Alfa punya 247"), it = q.scene.items, mx = it.reduce((a, b) => (b.n > a.n ? b : a)), mn = it.reduce((a, b) => (b.n < a.n ? b : a)); assert.equal(q.parts[0].answer, mx.name); assert.equal(q.parts[1].answer, mn.name); }
{ const q = byPrompt("Dengan kartu"), d = q.scene.digits, perms = []; for (const a of d) for (const b of d) for (const c of d) if (new Set([a, b, c]).size === 3 && a) perms.push(a * 100 + b * 10 + c); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [Math.max(...perms), Math.min(...perms)]); }
{ const q = byPrompt("Alfa punya 64"); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [28 + 19, 64 - 19]); }
{ const q = byPrompt("Setiap siswa membawa 6 daun"); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [6 * 4, 6 * 4 * 3]); }
{ const q = byPrompt("Toko mainan"); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [56 / 7, 3 * (56 / 7)]); }
{ const q = byPrompt("Ibu membeli 60 telur"); assert.equal(q.parts[0].answers[0], 60 - 23 - 18); }
{ const q = byPrompt("Alen punya 24"); assert.equal(q.parts[0].answers[0], 24 + 37); }
{ const q = byPrompt("Bia punya 45"); assert.equal(q.parts[0].answers[0], 45 - 18); }
{ const q = byPrompt("Lomba karnaval"); assert.equal(q.parts[0].answers[0], 16 + 25 + 29); }
// Semua bilangan dalam bab paling besar 1.000; operasi hitung sampai 100
for (const q of all) for (const p of q.parts) { if (p.kind === "column") assert.ok(p.a <= 100 && p.b <= 100 && columnResult(p) <= 100 && columnResult(p) >= 0); if (p.kind === "fill") p.answers.forEach(a => assert.ok(a >= 0 && a <= 1000)); }

console.log(`Kelas 3 Bab 1 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${checkedFills} kalimat isian dihitung ulang, posisi pilihan ${pos.join("/")}`);
