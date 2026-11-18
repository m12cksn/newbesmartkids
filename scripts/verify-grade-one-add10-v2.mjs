// Verifikasi Kelas 1 Bab 2 Penjumlahan sampai dengan 10: susunan soal dan kunci yang dihitung ulang dari gambar dan kalimat.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-add10-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, wheels } from "../src/data/grade-one-add10-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 3); assert.equal(practice.length, 3);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 3; t++) assert.equal(Q.filter(q => q.topic === t).length, 8, `evaluasi subtopik ${topics[t].code} 8 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "bond", "hop", "wing", "ten", "pairs", "pick"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["hop", "wing", "ten", "pairs", "pick"].includes(p.kind))).length;
assert.ok(action >= 8, `soal beraksi minimal 8, sekarang ${action}`);

/** Bilangan sampai 10 sesuai judul bab. */
const nums = t => [...t.matchAll(/\d+/g)].map(m => Number(m[0]));
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 30, `${q.prompt}: pembahasan terlalu pendek`);
  const sc = q.scene;
  // Jumlah dari gambar.
  const parts2 = sc?.type === "boxes" ? sc.groups.map(g => g.n) : sc?.type === "basket" ? [sc.inside, sc.outside] : sc?.type === "story" ? [sc.first, sc.more] : sc?.type === "dots" ? [sc.a, sc.b] : null;
  for (const p of q.parts) {
    for (const a of p.answers ?? []) assert.ok(a >= 0 && a <= 10, `${q.prompt}: ${a} lebih dari 10`);
    if (p.kind === "fill" && parts2) {
      const t = p.text, sum = parts2[0] + parts2[1];
      if (/^Semuanya ada □|^Di kelas ada □|^Halim/.test(t)) { assert.equal(p.answers[0], sum, `${q.prompt}: ${t}`); checked++; }
      if (t === "□ + □ = □") { assert.deepEqual(p.answers, [...parts2, sum], q.prompt); checked++; }
      if (/^□ \+ □ = \d+$/.test(t)) { assert.deepEqual([...p.answers, nums(t)[0]], [...parts2, sum], q.prompt); checked++; }
      if (/^Ada □/.test(t)) { const idx = q.parts.filter(x => x.kind === "fill" && /^Ada □/.test(x.text)).indexOf(p); assert.equal(p.answers[0], parts2[idx], `${q.prompt}: ${t}`); checked++; }
      if (/^\d+ \+ \d+ = □$/.test(t)) { const [a, b] = nums(t); assert.equal(p.answers[0], a + b); assert.deepEqual([a, b], parts2, q.prompt); checked++; }
    }
    if (p.kind === "fill" && !parts2 && /^\d+ \+ □ = \d+$|^□ \+ \d+ = \d+$/.test(p.text)) { const [x, y] = nums(p.text); assert.equal(p.answers[0], y - x, p.text); checked++; }
    if (p.kind === "fill" && /^\d+ \+ \d+ = □$/.test(p.text) && !parts2) { const [a, b] = nums(p.text); assert.equal(p.answers[0], a + b); checked++; }
    if (p.kind === "fill" && /^\d+ \+ □ = 10$/.test(p.text)) { const ten = q.parts.find(x => x.kind === "ten"); assert.equal(nums(p.text)[0], ten.filled); assert.equal(p.answers[0], 10 - ten.filled); checked++; }
    if (p.kind === "bond") { const w = p.whole ?? p.answers[0], a = p.parts[0] ?? p.answers[p.whole === null ? 1 : 0], b = p.parts[1] ?? p.answers[p.answers.length - 1]; assert.equal(a + b, w, `${q.prompt}: pasangan`); if (parts2) assert.deepEqual([a, b], parts2); checked++; }
    if (p.kind === "hop") { assert.ok(p.start + p.steps <= 10); assert.deepEqual(nums(q.prompt).slice(0, 2), [p.start, p.steps], q.prompt); checked++; }
    if (p.kind === "wing") { const f = q.parts.find(x => x.kind === "fill"); assert.deepEqual(nums(f.text), [p.n, p.n]); assert.equal(f.answers[0], 2 * p.n); checked++; }
    if (p.kind === "pick") { const ok = p.options.filter(o => { const [a, b, c] = nums(o); return a + b === c && parts2 && a === parts2[0] && b === parts2[1]; }); assert.deepEqual(ok, [p.answer], q.prompt); p.options.forEach(o => { const [a, b, c] = nums(o); assert.equal(a + b, c, `${o} salah hitung`); }); checked++; }
    if (p.kind === "pairs") { assert.ok(correct({ ...q, parts: [p] }, "1|8|2|7|3|6")); assert.ok(!correct({ ...q, parts: [p] }, "1|8|1|8|3|6"), "pasangan sama harus ditolak"); assert.ok(!correct({ ...q, parts: [p] }, "1|8|2|6|3|6"), "jumlah salah harus ditolak"); checked++; }
  }
  if (sc?.type === "vehicles") { const [k, r] = q.parts; assert.deepEqual(k.answers, [...sc.items.map(i => i.n), sc.items.reduce((s, i) => s + i.n, 0)]); assert.deepEqual(r.answers, [...sc.items.map(i => i.n * wheels[i.kind]), sc.items.reduce((s, i) => s + i.n * wheels[i.kind], 0)]); checked++; }
  // Soal cerita tanpa gambar: angka di kalimat.
  if (!sc && q.topic === 2) { const [a, b] = nums(q.prompt); const f = q.parts.find(x => x.kind === "fill"); if (q.parts[0].kind === "hop") { assert.deepEqual([q.parts[0].start, q.parts[0].steps], [a, b]); assert.equal(f.answers[0], a + b); checked++; } else if (f.text === "□ + □ = □") { assert.deepEqual(f.answers, [a, b, a + b], q.prompt); checked++; } else { assert.equal(f.answers[0], b - a, q.prompt); checked++; } }
}
// Gambar sayap kepik tidak boleh membocorkan isi sayap kanan, dan cerita "berapa yang datang" tanpa gambar jawaban.
assert.ok(!Q.find(q => /Berapa siswa yang datang/.test(q.prompt)).scene, "gambar membocorkan jawaban");
assert.ok(checked >= 30, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 2 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
