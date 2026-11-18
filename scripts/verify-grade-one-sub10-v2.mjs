// Verifikasi Kelas 1 Bab 3 Pengurangan sampai dengan 10: susunan soal dan kunci yang dihitung ulang dari gambar dan kalimat.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-sub10-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, apply } from "../src/data/grade-one-sub10-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 4); assert.equal(practice.length, 4);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 4; t++) assert.equal(Q.filter(q => q.topic === t).length, 6, `evaluasi subtopik ${topics[t].code} 6 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "bond", "back", "cross", "sign", "pick", "multi", "build", "pairs"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const actionKinds = ["back", "cross", "sign", "pick", "multi", "build", "pairs"];
const action = Q.filter(q => q.parts.some(p => actionKinds.includes(p.kind))).length;
assert.ok(action >= 8, `soal beraksi minimal 8, sekarang ${action}`);
// Posisi jawaban pilihan tunggal tidak selalu sama.
const pos = Q.flatMap(q => q.parts.filter(p => p.kind === "pick").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size > 1, "posisi jawaban pilihan selalu sama");

const nums = t => [...t.matchAll(/\d+/g)].map(m => Number(m[0]));
/** Kalimat a ± b = c dengan satu kotak □ diisi jawaban; hasil harus benar. */
const evalFill = (text, answers) => { let k = 0; const s = text.replace(/^[^:]*:\s*/, "").replace(/□/g, () => String(answers[k++])); const m = s.match(/^(\d+)((?:\s*[+−]\s*\d+)+)\s*=\s*(\d+)$/); if (!m) return null; let v = Number(m[1]); for (const [, op, n] of m[2].matchAll(/([+−])\s*(\d+)/g)) v = apply(v, op, Number(n)); return v === Number(m[3]); };
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 30, `${q.prompt}: pembahasan terlalu pendek`);
  const sc = q.scene;
  const total = sc?.type === "gone" ? sc.stay + sc.away.reduce((s, a) => s + a.n, 0) : null;
  for (const p of q.parts) {
    for (const a of p.answers ?? []) assert.ok(a >= 0 && a <= 10, `${q.prompt}: ${a} di luar 0–10`);
    if (p.kind === "fill") {
      const r = evalFill(p.text, p.answers); if (r !== null) { assert.ok(r, `${q.prompt}: ${p.text} salah hitung`); checked++; }
      if (sc?.type === "gone") {
        if (p.text === "□ − □ = □") { assert.deepEqual(p.answers, [total, sc.away[0].n, sc.stay], q.prompt); checked++; }
        if (/^\d+ − \d+ = □$/.test(p.text)) { assert.deepEqual(nums(p.text), [total, sc.away[0].n], q.prompt); assert.equal(p.answers[0], sc.stay); checked++; }
        if (/tersisa □|Tersisa □|Masih ada □/.test(p.text)) { assert.equal(p.answers[0], sc.stay, q.prompt); checked++; }
      }
      if (sc?.type === "frame") { assert.equal(p.answers[0], nums(p.text).includes(sc.n) && /□ = \d+$/.test(p.text) ? 10 - sc.n : 10 - sc.n, q.prompt); checked++; }
      if (sc?.type === "line") { assert.deepEqual(nums(p.text), [sc.from, sc.to]); assert.equal(p.answers[0], sc.from - sc.to); checked++; }
      if (sc?.type === "boxes") { const [x, y] = nums(p.text), s = sc.a + sc.b; assert.ok([sc.a, sc.b, s].includes(x) && [sc.a, sc.b, s].includes(y), `${q.prompt}: ${p.text} tidak sesuai gambar`); checked++; }
    }
    if (p.kind === "bond") { const w = p.whole ?? p.answers[0], a = p.parts[0] ?? p.answers[p.whole === null ? 1 : 0], b = p.parts[1] ?? p.answers[p.answers.length - 1]; assert.equal(a + b, w, `${q.prompt}: pasangan`); checked++; }
    if (p.kind === "back") { assert.ok(p.start - p.steps >= 0); assert.deepEqual(nums(q.prompt).slice(0, 2), [p.start, p.steps], q.prompt); assert.ok(!correct({ ...q, parts: [p] }, String(p.start + p.steps).slice(0, 2)), "lompat maju tidak boleh benar"); checked++; }
    if (p.kind === "cross") { const f = q.parts.find(x => x.kind === "fill"); assert.equal(f.answers.at(-1), p.total - p.take, q.prompt); assert.deepEqual(nums(q.prompt).slice(0, 2), [p.total, p.take], q.prompt);
      assert.ok(!correct({ ...q, parts: [p] }, Array.from({ length: p.take + 1 }, (_, i) => i).join(",")), "coret terlalu banyak harus salah"); assert.ok(correct({ ...q, parts: [p] }, Array.from({ length: p.take }, (_, i) => p.total - 1 - i).join(",")), "coret benda lain tetap benar"); checked++; }
    if (p.kind === "sign") { assert.equal(apply(p.a, p.answer, p.b), p.c); assert.notEqual(apply(p.a, p.answer === "+" ? "−" : "+", p.b), p.c, "dua tanda sama-sama benar"); checked++; }
    if (p.kind === "pick" && sc?.type === "gone") { const ok = p.options.filter(o => { const [a, b, c] = nums(o); return a - b === c && a === total && b === sc.away[0].n; }); assert.deepEqual(ok, [p.answer], q.prompt); p.options.forEach(o => { const [a, b, c] = nums(o); assert.equal(a - b, c, `${o} salah hitung`); }); checked++; }
    if (p.kind === "pick" && !sc) { const [a, b, c] = nums(q.prompt); const ok = p.options.filter(o => { const [x, y] = nums(o); return x === a && y === b && /terbang|pergi|pulang|dimakan/.test(o); }); assert.deepEqual(ok, [p.answer]); assert.equal(a - b, c); checked++; }
    if (p.kind === "multi") { const target = nums(p.label)[0]; const ok = p.options.map((o, i) => { const m = o.match(/(\d+) ([+−]) (\d+)/); return apply(Number(m[1]), m[2], Number(m[3])) === target ? i : -1; }).filter(i => i >= 0); assert.deepEqual(ok, [...p.answers].sort((a, b) => a - b), q.prompt); assert.ok(ok.length >= 2 && ok.length < p.options.length); checked++; }
    if (p.kind === "build") { const v = q.parts.length === 1 ? q : { ...q, parts: [p] }; const good = []; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) if (new Set([a, b, c]).size === 3) { const s = `${a},${b},${c}`; if (correct(v, s)) good.push(s); } assert.ok(good.length >= 1 && good.length <= 2, `${q.prompt}: susunan benar ${good.length}`); good.forEach(s => { const [a, b, c] = s.split(",").map(Number); assert.equal(apply(p.tiles[a], p.op, p.tiles[b]), p.tiles[c]); }); checked++; }
    if (p.kind === "pairs") { const v = { ...q, parts: [p] }; assert.ok(correct(v, "6|1|7|2|10|5")); assert.ok(!correct(v, "6|1|6|1|7|2"), "operasi sama harus ditolak"); assert.ok(!correct(v, "6|1|7|1|8|3"), "hasil salah harus ditolak"); assert.ok(!correct(v, "6|1|7|2|15|10"), "bilangan lebih dari 10 harus ditolak"); checked++; }
  }
  // Soal cerita tanpa gambar: angka di kalimat.
  if (!sc && q.topic === 3) { const n = nums(q.prompt); const f = q.parts.find(x => x.kind === "fill"); if (f.text.startsWith("□ − □")) { assert.deepEqual(f.answers.slice(0, -1), n.slice(0, f.answers.length - 1), q.prompt); checked++; } }
}
// Soal "berapa yang pergi" tidak boleh punya gambar yang membocorkan jawaban.
for (const q of all.filter(q => /Beberapa|beberapa/.test(q.prompt) && q.topic === 3)) assert.ok(!q.scene, `${q.prompt}: gambar membocorkan jawaban`);
assert.ok(checked >= 40, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 3 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, posisi pilihan ${pos.join("/")}, bentuk ${[...kinds].join(", ")}`);
