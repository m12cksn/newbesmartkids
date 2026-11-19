// Verifikasi Kelas 1 Bab 7 Mengukur Panjang Benda: susunan soal dan kunci yang dihitung ulang dari gambar.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-length-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, formatAnswer, unitLen, layCount, partKey } from "../src/data/grade-one-length-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => JSON.stringify([q.prompt, q.parts, q.scene ?? null]))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 2; t++) assert.equal(Q.filter(q => q.topic === t).length, 12, `evaluasi subtopik ${topics[t].code} 12 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["circle", "choose", "order", "fill", "lay", "pick"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["circle", "order", "lay", "pick"].includes(p.kind))).length;
assert.ok(action >= 12, `soal beraksi minimal 12, sekarang ${action}`);

/** Nilai berlabel dari gambar: label → panjang/tinggi/posisi. */
function values(scene) {
  if (!scene) return null;
  const m = new Map();
  if (scene.type === "row") scene.items.forEach(it => m.set(it.label, it.h));
  if (scene.type === "grid") scene.items.forEach(it => m.set(it.label, it.len));
  if (scene.type === "stack") scene.items.forEach((it, k) => m.set(String(k), it.len));
  if (scene.type === "sky") scene.items.forEach(it => { m.set(it.label ?? it.color, it.y); m.set(it.color, it.y); });
  if (scene.type === "animals") scene.items.forEach(it => m.set(it.animal, it.h));
  if (scene.type === "kids") scene.items.forEach(it => m.set(it.name, it.h));
  return m;
}
const argBy = (m, keys, f) => keys.filter(k => m.get(k) === f(...keys.map(x => m.get(x))));
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 30, `${q.prompt}: pembahasan terlalu pendek`);
  const vals = values(q.scene);
  for (const p of q.parts) {
    if (p.kind === "circle") {
      const m = values(p.scene), keys = p.scene.type === "stack" ? p.scene.items.map((_, k) => String(k)) : p.scene.items.map(it => it.label);
      const pick = p.ans.map(k => keys[k]);
      if (/lebih panjang|paling tinggi|paling panjang/.test(q.prompt)) assert.deepEqual(pick, argBy(m, keys, Math.max), q.prompt);
      else if (/lebih pendek|paling pendek/.test(q.prompt)) assert.deepEqual(pick, argBy(m, keys, Math.min), q.prompt);
      else if (/sama panjang/.test(q.prompt)) { assert.equal(pick.length, 2); assert.equal(m.get(pick[0]), m.get(pick[1])); assert.equal(keys.filter(k => m.get(k) === m.get(pick[0])).length, 2, "tepat dua yang sama"); }
      else assert.fail(`${q.prompt}: perintah lingkari tidak dikenal`);
      // Benda yang dibandingkan harus jelas bedanya (paling sedikit 1 kotak / 10 satuan), kecuali yang memang sama.
      const vs = [...new Set(keys.map(k => m.get(k)))].sort((a, b) => a - b); for (let i = 1; i < vs.length; i++) assert.ok(vs[i] - vs[i - 1] >= (p.scene.type === "grid" ? 1 : 10), `${q.prompt}: beda terlalu kecil`);
      checked++;
      // Satu pilihan salah harus ditolak.
      const wrong = keys.findIndex((_, k) => !p.ans.includes(k)); assert.ok(!correct({ ...q, parts: [p] }, String(wrong)), q.prompt);
    }
    if (p.kind === "choose" && vals) {
      const keys = p.options.filter(o => vals.has(o));
      if (keys.length === p.options.length) {
        if (/paling (tinggi|panjang)/.test(p.text)) { assert.deepEqual(p.answers, argBy(vals, keys, Math.max), p.text); checked++; }
        else if (/paling (pendek|rendah)/.test(p.text)) { assert.deepEqual(p.answers, argBy(vals, keys, Math.min), p.text); checked++; }
        else if (/sama (tinggi|panjang)/.test(p.text)) { const [a, b] = p.answers; assert.equal(vals.get(a), vals.get(b), p.text); assert.equal(keys.filter(k => vals.get(k) === vals.get(a)).length, 2); assert.ok(p.anyOrder); checked++; }
      }
      // "X lebih □ dari Y" dan "X □ Y" dihitung ulang dari gambar.
      const m = p.text.match(/^(?:\w+ )?(\w+) lebih □ dari (?:\w+ )?(\w+)\.$/);
      if (m && vals.has(m[1]) && vals.has(m[2])) { assert.equal(p.answers[0], vals.get(m[1]) > vals.get(m[2]) ? "panjang" : "pendek", p.text); checked++; }
      const r = p.text.match(/^Dibandingkan (?:capung )?(\w+), (?:capung )?(\w+)(?: terbang)? □\.$/);
      if (r && vals.has(r[1]) && vals.has(r[2])) { const [a, b] = [vals.get(r[2]), vals.get(r[1])]; const tall = q.scene.type === "kids";
        assert.equal(p.answers[0], a > b ? "lebih tinggi" : a < b ? (tall ? "lebih pendek" : "lebih rendah") : "sama tinggi", p.text); checked++; }
    }
    if (p.kind === "order") {
      if (vals) for (const [k, l] of p.labels.entries()) if (vals.has(l)) assert.equal(p.values[k], vals.get(l), `${p.text} ${l}`);
      const key = partKey(p).split("|");
      // Urutan terbalik harus salah (kecuali semuanya sama).
      if (new Set(p.values).size > 1) assert.ok(!correct({ ...q, parts: [p] }, [...key].reverse().join("|")), p.text);
      if (/pendek/.test(p.text)) assert.equal(p.dir, "asc"); if (/(paling tinggi|paling panjang|terpanjang):/.test(p.text)) assert.equal(p.dir, "desc");
      checked++;
    }
    if (p.kind === "fill" && q.scene) {
      const s = q.scene;
      if (s.type === "measure") { const n = []; for (const it of s.items) for (const u of it.units) { assert.equal(it.len % unitLen[u], 0, `${q.prompt}: ${it.obj} ${u} tidak pas`); n.push(it.len / unitLen[u]); }
        assert.ok(p.answers.every(a => n.includes(a)), `${p.text}: ${p.answers}`); checked++; }
      if (s.type === "grid" || s.type === "animals") { assert.deepEqual(p.answers, s.items.map(it => s.type === "grid" ? it.len : it.h)); checked++; }
      if (s.type === "span") { assert.deepEqual(p.answers, s.rows.map(r => s.len / unitLen[r.unit])); checked++; }
      if (s.type === "sky") { const red = s.items.find(it => it.color === "merah").y; assert.equal(p.answers[0], s.items.filter(it => it.y > red).length); checked++; }
    }
    if (p.kind === "lay") { assert.ok(Number.isInteger(layCount(p)) && layCount(p) >= 2, q.prompt); assert.ok(!correct({ ...q, parts: [p] }, String(layCount(p) + 1)) && !correct({ ...q, parts: [p] }, String(layCount(p) - 1))); checked++; }
    if (p.kind === "pick") { assert.equal(p.ways.filter(w => w === "benar").length, 1); assert.equal(new Set(p.ways).size, p.ways.length); checked++; }
  }
  if (q.scene?.type === "grid") for (const it of q.scene.items) { assert.ok(it.x >= 0 && it.y >= 0); if (it.vertical) assert.ok(it.y + it.len < q.scene.h, "label di bawah pita tegak"); else assert.ok(it.x + it.len <= q.scene.w && it.y >= 1, "muat dan ada tempat label"); }
}
for (const q of all.flatMap(q => q.parts.filter(p => p.kind === "circle").map(p => p.scene)).filter(s => s.type === "grid")) for (const it of q.items) { if (it.vertical) assert.ok(it.y + it.len < q.h); else assert.ok(it.x + it.len <= q.w && it.y >= 1); }
// Posisi jawaban pilih gambar dan lingkari tidak selalu sama.
const pickPos = all.flatMap(q => q.parts.filter(p => p.kind === "pick").map(p => p.ways.indexOf("benar")));
assert.equal(new Set(pickPos).size, pickPos.length, "posisi gambar benar berbeda-beda");
const firstLetters = Q.flatMap(q => q.parts.filter(p => p.kind === "choose" && p.options[0] === "A").map(p => p.answers[0]));
assert.ok(new Set(firstLetters).size >= 3, `jawaban huruf bervariasi: ${firstLetters}`);
assert.notEqual(formatAnswer(Q[0], "0"), formatAnswer(Q[0], Q[0].answer), "pembahasan menunjukkan pilihan anak");
assert.ok(checked >= 45, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 7 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
