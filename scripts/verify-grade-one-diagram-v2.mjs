// Verifikasi Kelas 1 Bab 8 Mengenal Diagram: susunan soal dan kunci yang dihitung ulang dari gambar, tabel, dan diagram.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-diagram-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, formatAnswer, objName, colorName, catOf } from "../src/data/grade-one-diagram-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => JSON.stringify([q.prompt, q.parts, q.scene ?? null]))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 2; t++) assert.equal(Q.filter(q => q.topic === t).length, 12);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choose", "table", "paint", "group"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const sceneTypes = new Set(Q.map(q => q.scene?.type).filter(Boolean));
for (const t of ["scatter", "list", "table", "picto"]) assert.ok(sceneTypes.has(t), `evaluasi memakai gambar ${t}`);
const action = Q.filter(q => q.parts.some(p => ["table", "paint", "group"].includes(p.kind))).length;
assert.ok(action >= 9, `soal beraksi minimal 9, sekarang ${action}`);

/** Nilai data dari gambar: nama (huruf kecil) → banyaknya. */
function values(q) {
  const m = new Map(), s = q.scene;
  const add = (k, n) => m.set(k.toLowerCase(), n);
  if (s?.type === "scatter") for (const it of s.items) { for (const k of [it.color ? colorName[it.color] : null, objName[it.obj]].filter(Boolean)) add(k, (m.get(k) ?? 0) + 1); }
  if (s && s.type !== "scatter") for (const r of s.rows) { add(r.label, r.n); if (r.obj && !m.has(objName[r.obj])) add(objName[r.obj], r.n); }
  // Data dari kelompok (dikelompokkan sendiri oleh anak).
  for (const p of q.parts) if (p.kind === "group") p.items.forEach(it => { const c = p.cats[catOf(p, it)].label.toLowerCase(); add(c, (m.get(c) ?? 0) + 1); });
  return m;
}
/** Nama data yang disebut di kalimat, urut kemunculan. */
function names(text, m) {
  let t = text.toLowerCase(); const found = [];
  for (const k of [...m.keys()].sort((a, b) => b.length - a.length)) { const i = t.indexOf(k); if (i >= 0 && !/[a-z]/.test(t[i + k.length] ?? "")) { found.push([i, k]); t = t.slice(0, i) + "#".repeat(k.length) + t.slice(i + k.length); } }
  return found.sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
const nums = t => [...t.matchAll(/\d+/g)].map(x => Number(x[0]));
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 30, `${q.prompt}: pembahasan terlalu pendek`);
  const m = values(q);
  // Baris yang ditanyakan (n = null) dihitung dari jumlah semua di kalimat soal.
  const missing = q.scene?.rows?.find(r => r.n === null) ?? q.parts.find(p => p.kind === "table")?.rows.find(r => !r.given && q.scene?.type === "table" && !q.scene.rows.some(s => s.label === r.label));
  if (missing) { const total = nums(q.prompt)[0], known = [...q.scene.rows].filter(r => r.n !== null).reduce((a, r) => a + r.n, 0); m.set(missing.label.toLowerCase(), total - known); checked++; }
  for (const p of q.parts) {
    if (p.kind === "fill") {
      assert.equal(p.answers.length, 1);
      const t = p.text.toLowerCase(), ns = names(p.text, m), a = p.answers[0];
      const rows = q.scene && q.scene.type !== "scatter" ? q.scene.rows.map(r => m.get(r.label.toLowerCase())) : null;
      if (/jumlah semua|semua ada|semuanya ada/.test(t)) { const tot = rows ? rows.reduce((x, y) => x + y, 0) : q.parts.find(x => x.kind === "group")?.items.length ?? [...q.parts.find(x => x.kind === "paint").rows].reduce((x, r) => x + r.n, 0); assert.equal(a, tot, p.text); }
      else if (/lebih banyak dari|sama banyak dengan/.test(t)) { assert.equal(ns.length, 2, `${p.text}: ${ns}`); assert.equal(a, Math.abs(m.get(ns[0]) - m.get(ns[1])), p.text); }
      else if (/jumlah anak yang suka/.test(t)) { assert.equal(ns.length, 2); assert.equal(a, m.get(ns[0]) + m.get(ns[1]), p.text); }
      else { assert.equal(ns.length, 1, `${p.text}: ${ns}`); assert.equal(a, m.get(ns[0]), p.text); }
      checked++;
    }
    if (p.kind === "choose") {
      const t = p.text.toLowerCase(), opt = p.options.map(o => o.toLowerCase()), v = opt.map(o => m.get(o));
      assert.ok(v.every(Number.isInteger), `${p.text}: pilihan tanpa data ${opt}`);
      const pick = f => opt.filter((_, k) => v[k] === f(...v));
      if (/paling sedikit/.test(t)) assert.deepEqual(p.answers.map(x => x.toLowerCase()), pick(Math.min), p.text);
      else if (/paling banyak|paling disukai/.test(t)) assert.deepEqual(p.answers.map(x => x.toLowerCase()), pick(Math.max), p.text);
      else if (/sama banyak/.test(t)) { const [a, b] = p.answers.map(x => x.toLowerCase()); assert.equal(m.get(a), m.get(b)); assert.equal(v.filter(x => x === m.get(a)).length, 2, "tepat satu pasangan"); assert.equal(new Set(v).size, v.length - 1, "hanya satu pasangan sama"); assert.ok(p.anyOrder); }
      else if (/lebih banyak disukai/.test(t)) assert.deepEqual(p.answers.map(x => x.toLowerCase()), pick(Math.max), p.text);
      else { const n = nums(p.text)[0]; assert.ok(n !== undefined, p.text); assert.deepEqual(p.answers.map(x => x.toLowerCase()), opt.filter((_, k) => v[k] === n), p.text); }
      // Jawaban tunggal: hanya satu pilihan yang benar.
      if (!p.anyOrder) assert.equal(p.answers.length, 1);
      checked++;
    }
    if (p.kind === "table") { for (const r of p.rows) if (!r.given) assert.equal(r.n, m.get(r.label.toLowerCase()), `${p.title} ${r.label}`); checked++; }
    if (p.kind === "paint") {
      for (const r of p.rows) assert.ok(r.n >= 1 && r.n <= p.slots, `${r.label} muat di ${p.slots} lingkaran`);
      if (q.scene) for (const r of p.rows) assert.equal(r.n, m.get(r.label.toLowerCase()), `${q.prompt} ${r.label}`);
      else if (/kurangnya|lebihnya/.test(q.prompt)) { const base = Number(q.prompt.match(/(\d+) ayam/)[1]), less = Number(q.prompt.match(/(\d+) kurangnya/)[1]), more = Number(q.prompt.match(/(\d+) lebihnya/)[1]); assert.deepEqual(p.rows.map(r => r.n), [base, base - less, base + more]); }
      else { const said = new Map([...q.prompt.matchAll(/(\d+) (\w+)/g)].map(x => [x[2].toLowerCase(), Number(x[1])])); for (const r of p.rows) assert.equal(r.n, said.get(r.label.toLowerCase()), r.label); }
      // Mewarnai satu lingkaran lebih banyak harus salah.
      assert.ok(!correct({ ...q, parts: [p] }, p.rows.map((r, k) => r.n + (k === 0 ? 1 : 0)).join("|")));
      checked++;
    }
    if (p.kind === "group") { assert.ok(p.items.every(it => catOf(p, it) >= 0), "setiap benda punya kelompok"); assert.ok(!correct({ ...q, parts: [p] }, p.items.map(() => "0").join("|"))); checked++; }
  }
  // Diagram tidak membocorkan angka: gambar diagram/daftar tidak menulis angka banyaknya.
  if (q.scene?.type === "picto" || q.scene?.type === "list") assert.ok(!q.scene.rows.some(r => /\d/.test(r.label)));
}
assert.notEqual(formatAnswer(Q[0], "1|1|1|1‖biru"), formatAnswer(Q[0], Q[0].answer));
assert.ok(checked >= 60, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 8 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}, gambar ${[...sceneTypes].join(", ")}`);
