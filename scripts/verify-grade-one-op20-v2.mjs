// Verifikasi Kelas 1 Bab 6 Penjumlahan dan Pengurangan sampai dengan 20: susunan soal dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-op20-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, apply, stripFull, columnValue, formatAnswer } from "../src/data/grade-one-op20-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 3); assert.equal(practice.length, 3);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => JSON.stringify([q.prompt, q.parts, q.scene ?? null]))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 3; t++) assert.equal(Q.filter(q => q.topic === t).length, 8, `evaluasi subtopik ${topics[t].code} 8 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "strip", "hop", "split", "column", "eq", "draw"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["hop", "eq", "draw", "split", "column", "strip"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);

const nums = t => [...t.matchAll(/\d+/g)].map(m => Number(m[0]));
const evalText = (text, answers) => { let k = 0; const s = text.replace(/□/g, () => String(answers[k++])); const m = s.match(/(\d+) ([+−]) (\d+) = (\d+)$/); return m ? apply(Number(m[1]), m[2], Number(m[3])) === Number(m[4]) : null; };
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 30, `${q.prompt}: pembahasan terlalu pendek`);
  const g = q.scene?.type === "groups" ? q.scene.items : null;
  for (const p of q.parts) {
    if (p.kind === "fill") { for (const a of p.answers) assert.ok(a >= 0 && a <= 20); const r = evalText(p.text, p.answers); if (r !== null) { assert.ok(r, `${q.prompt}: ${p.text}`); checked++; }
      if (g && /^Ada □/.test(p.text)) { const it = g.find(x => p.text.includes(x.label) || p.text.includes(`kelereng ${x.label}`)); assert.equal(p.answers[0], it.n, p.text); checked++; }
      if (g && /lebihnya|kurangnya|Beda|Selisih/.test(p.text) && g.every(x => x.n !== null)) { assert.equal(p.answers[0], Math.abs(g[0].n - g[1].n), p.text); checked++; } }
    if (p.kind === "strip") { const f = stripFull(p.items); assert.ok(f.every(Number.isInteger) && f.every(v => v >= 0 && v <= 20)); const sum = q.parts.find(x => x.kind === "fill"); const [a, b] = nums(sum.text); assert.equal(f[0], a); assert.equal(f.at(-1), a + b, "pita berakhir di hasil"); checked++; }
    if (p.kind === "hop") { const [a, b] = nums(q.prompt); assert.deepEqual([p.start, p.steps], [a, b]); assert.ok(apply(p.start, p.op, p.steps) >= 10 && apply(p.start, p.op, p.steps) <= 20); checked++; }
    if (p.kind === "split") { const n = p.which ? p.b : p.a, parts = [...p.parts]; let k = 0; for (let j = 0; j < 2; j++) if (parts[j] === null) parts[j] = p.answers[k++]; assert.equal(parts[0] + parts[1], n, q.prompt);
      const rest = q.parts.filter(x => x.kind === "fill"); assert.ok(rest.every(f => evalText(f.text, f.answers)), q.prompt);
      // Langkah akhir harus sama dengan hasil operasi.
      assert.equal(rest.at(-1).answers.at(-1), apply(p.a, p.op, p.b), q.prompt); checked++; }
    if (p.kind === "column") { const r = apply(p.a, p.op, p.b); assert.ok(r >= 10 && r <= 20 && p.a > 10 && p.b < 10); assert.equal(columnValue(p, "rt") * 10 + columnValue(p, "ro"), r); if (p.op === "+") assert.ok(p.a % 10 + p.b < 10, "tanpa menyimpan"); else assert.ok(p.a % 10 >= p.b, "tanpa meminjam"); checked++; }
    if (p.kind === "eq") { const n = nums(q.prompt); assert.ok(n.includes(p.a) || (g && g.some(x => x.n === null)), `${q.prompt}: ${p.a}`); assert.ok(!correct({ ...q, parts: [p] }, `${p.a}|${p.op === "+" ? "−" : "+"}|${p.b}|${apply(p.a, p.op, p.b)}`), "tanda salah harus ditolak");
      if (p.op === "+") assert.ok(correct({ ...q, parts: [p] }, `${p.b}|+|${p.a}|${p.a + p.b}`), "penjumlahan boleh ditukar"); else assert.ok(!correct({ ...q, parts: [p] }, `${p.b}|−|${p.a}|${p.a - p.b}`)); checked++; }
    if (p.kind === "draw") { const v = { ...q, parts: [p] }; assert.equal(nums(q.prompt)[0], p.diff); assert.ok(correct(v, p.less === "A" ? `5|${5 + p.diff}` : `${5 + p.diff}|5`), "jumlah lain yang selisihnya tepat juga benar"); assert.ok(!correct(v, p.less === "A" ? `${5 + p.diff}|5` : `5|${5 + p.diff}`), "arah terbalik harus salah"); checked++; }
  }
  // Kelompok yang ditanyakan ("?") tidak boleh tergambar jumlahnya; angka yang tergambar sesuai kalimat.
  if (g) for (const it of g) if (it.n !== null && /mempunyai|memiliki|Ada \d/.test(q.prompt)) assert.ok(nums(q.prompt).includes(it.n) || !/\d/.test(q.prompt), `${q.prompt}: gambar ${it.n} tidak ada di kalimat`);
}
// Soal dengan lebih dari satu operasi harus menyebutkan apa yang dihitung setiap operasi.
for (const q of all) { const eqs = q.parts.filter(p => p.kind === "eq"); if (eqs.length > 1) assert.ok(eqs.every(p => p.label && p.label.endsWith("?")), `${q.prompt}: operasi tanpa pertanyaan`); }
assert.notEqual(formatAnswer(Q[11], "1|2|3|4"), formatAnswer(Q[11], Q[11].answer), "pembahasan menunjukkan isian anak");
assert.ok(checked >= 45, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 6 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
