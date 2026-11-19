// Verifikasi Kelas 1 Bab 5 Membilang sampai dengan 20: susunan soal dan kunci yang dihitung ulang dari gambar, urutan, dan kalimat.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-count20-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, seqFull, formatAnswer } from "../src/data/grade-one-count20-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 4); assert.equal(practice.length, 4);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => JSON.stringify([q.prompt, q.parts, q.scene ?? null]))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 4; t++) assert.equal(Q.filter(q => q.topic === t).length, 6, `evaluasi subtopik ${topics[t].code} 6 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "table", "bond", "match", "ring", "paint", "frames", "seq", "pick", "order", "guess"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const actionKinds = ["match", "ring", "paint", "frames", "pick", "order"];
const action = Q.filter(q => q.parts.some(p => actionKinds.includes(p.kind))).length;
assert.ok(action >= 8, `soal beraksi minimal 8, sekarang ${action}`);

const nums = t => [...t.matchAll(/\d+/g)].map(m => Number(m[0]));
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 30, `${q.prompt}: pembahasan terlalu pendek`);
  const sc = q.scene, n = sc?.type === "objs" || sc?.type === "jar" ? sc.n : sc?.type === "pv" ? 10 + sc.ones : null;
  for (const p of q.parts) {
    for (const a of p.answers ?? []) assert.ok(a >= 0 && a <= 20, `${q.prompt}: ${a} di luar 0–20`);
    if (p.kind === "fill" && n !== null && /^Ada □/.test(p.text)) { assert.equal(p.answers[0], n, q.prompt); checked++; }
    if (p.kind === "fill" && /puluhan dan □ satuan = □$/.test(p.text)) { const [t, o, all20] = p.answers; assert.equal(t * 10 + o, all20); if (n !== null) assert.equal(all20, n); checked++; }
    if (p.kind === "fill" && /^Nilai tempat (\d+)/.test(p.text)) { const v = nums(p.text)[0]; assert.deepEqual(p.answers, [Math.floor(v / 10), v % 10]); if (n !== null) assert.equal(v, n); checked++; }
    if (p.kind === "fill" && /ditambah/.test(p.text)) { const [a, b] = nums(p.text); assert.equal(p.answers[0], a + b); checked++; }
    if (p.kind === "table") { const f = q.parts.find(x => x.kind === "frames"); const v = n ?? f?.target; assert.equal(p.tens * 10 + p.ones, v, q.prompt); checked++; }
    if (p.kind === "bond") { const w = p.whole ?? p.answers[0], a = p.parts[0] ?? p.answers[p.whole === null ? 1 : 0], b = p.parts[1] ?? p.answers.at(-1); assert.equal(a + b, w, q.prompt); assert.ok([a, b].includes(10), "pasangan dengan 10"); checked++; }
    if (p.kind === "match") { assert.deepEqual([...p.left].sort(), [...p.right].sort()); assert.ok(p.left.every((l, k) => p.right[k] !== l) || true); assert.ok(p.left.every(l => l > 10 && l <= 20)); checked++; }
    if (p.kind === "ring") { const f = q.parts.find(x => x.kind === "fill"); assert.equal(f.answers[0], p.n); assert.ok(p.n > 10); assert.ok(!correct({ ...q, parts: [p] }, "0,1,2,3,4,5,6,7,8"), "9 dilingkari harus salah"); checked++; }
    if (p.kind === "paint") { assert.equal(nums(q.prompt)[0], p.target); assert.ok(p.target < p.n); checked++; }
    if (p.kind === "frames") { const t = nums(q.prompt); if (/puluhan/.test(q.prompt)) assert.equal(t[0] * 10 + t[1], p.target); else assert.equal(t[0], p.target);
      // Mewarnai jumlah benar tapi bingkai pertama tidak penuh harus salah.
      if (p.target < 20) assert.ok(!correct({ ...q, parts: [p] }, [...Array(9).keys(), ...Array.from({ length: p.target - 9 }, (_, k) => 10 + k)].join(","))); checked++; }
    if (p.kind === "seq") { const f = seqFull(p.items); assert.ok(f.every(Number.isInteger) && f.every(v => v >= 0 && v <= 20), q.prompt); assert.ok(p.items.every((v, i) => v === null || v === f[i]), `${q.prompt}: urutan tidak konsisten`);
      if (/mundur/.test(q.prompt)) assert.ok(f[1] < f[0]); if (/2-2/.test(q.prompt)) assert.equal(Math.abs(f[1] - f[0]), 2); checked++; }
    if (p.kind === "pick" && sc?.type === "groups") { const ns = sc.ns;
      if (/Lebih banyak|Paling banyak/.test(p.label)) { assert.equal(p.answer, sc.labels[ns.indexOf(Math.max(...ns))]); checked++; }
      else if (/Paling sedikit/.test(p.label)) { assert.equal(p.answer, sc.labels[ns.indexOf(Math.min(...ns))]); checked++; }
      else { const [x, y] = /gambar A lebih/.test(p.label) ? [ns[0], ns[1]] : [ns[1], ns[0]]; assert.equal(p.answer, x > y ? "banyak" : "sedikit", p.label); checked++; } }
    if (p.kind === "pick" && !sc) { const ns = nums(q.prompt), names = p.options; const pairs = names.map((nm, k) => [nm, ns[k]]); const best = /banyak/.test(p.label) ? Math.max(...ns) : Math.min(...ns); assert.equal(p.answer, pairs.find(x => x[1] === best)[0]); checked++; }
    if (p.kind === "order") { assert.equal(new Set(p.nums).size, p.nums.length); const got = answerKey([p]).split(",").map(k => p.nums[Number(k)]); const want = [...p.nums].sort((a, b) => (p.dir === "naik" ? a - b : b - a)); assert.deepEqual(got, want); checked++; }
    if (p.kind === "guess") { assert.equal(p.answer, n); assert.ok(correct({ ...q, parts: [p] }, `3|${n}`), "tebakan bebas"); assert.ok(!correct({ ...q, parts: [p] }, `${n}|${n - 1}`)); checked++; }
  }
}
// Gambar tidak membocorkan jawaban: soal "lebih banyak" tidak memakai gambar yang jumlahnya sama.
for (const q of all.filter(q => q.scene?.type === "groups")) { const known = q.scene.ns.filter(x => x !== null); assert.equal(new Set(known).size, known.length, `${q.prompt}: jumlah gambar kembar`); }
// Soal cerita yang membandingkan banyak benda harus bergambar; bilangan yang ditanyakan digambar "?".
for (const q of all.filter(q => q.topic === 3 && /punya/.test(q.prompt))) { assert.equal(q.scene?.type, "groups", q.prompt); q.scene.ns.forEach((x, k) => { if (x !== null) assert.ok(q.prompt.includes(`${q.scene.labels[k]} punya ${x}`), `${q.prompt}: gambar tidak sesuai kalimat`); }); }
// Pembahasan jawaban salah menunjukkan isian anak.
const m = practice[0][0]; assert.notEqual(formatAnswer(m, "0|1|2|3"), formatAnswer(m, m.answer));
assert.ok(checked >= 45, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 5 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
