// Verifikasi Kelas 4 Bab 2 Pecahan: susunan soal, sebaran tingkat, dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-four-fractions-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, plain, boxes, toNum } from "../src/data/grade-four-fractions-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 5); assert.equal(practice.length, 5);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 5; t++) assert.ok(Q.filter(q => q.topic === t).length >= 4, `evaluasi subtopik ${topics[t].code} minimal 4 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "rank", "match", "multi", "shade"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["rank", "match", "multi", "shade"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);

const F = s => { const [n, d] = s.split("/").map(Number); return n / d; };
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(!ready(q, ""), `${q.prompt}: kosong dianggap lengkap`);
  for (const [i, p] of q.parts.entries()) if (p.kind === "rank" || p.kind === "match") { const v = q.answer.split("‖"); v[i] = v[i].split("|").slice(0, 1).join("|"); assert.ok(!ready(q, v.join("‖")), `${q.prompt}: ${p.kind} sebagian dianggap lengkap`); }
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
  for (const p of q.parts) {
    if (p.kind === "fill") { assert.equal(boxes(p.text), p.answers.length, `${q.prompt}: banyak kotak`); p.answers.forEach(a => assert.ok(!Number.isNaN(toNum(a)), `${q.prompt}: ${a}`)); }
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "match") { assert.deepEqual([...p.answer].sort(), p.right.map((_, i) => i)); assert.ok(p.answer.some((a, i) => a !== i)); }
    if (p.kind === "multi") { assert.ok(p.answer.every(a => p.options.includes(a))); assert.ok(p.answer.length < p.options.length); }
    if (p.kind === "shade") { assert.ok(p.need > 0 && p.need < p.fig.parts); assert.equal(p.fig.shaded, 0); }
  }
}

// Pecahan dari gambar: setiap {□/□} sesuai bangun yang diarsir, berurutan
let checked = 0;
const figFracs = q => q.scene.figs.map(f => [f.shaded, f.parts]);
for (const q of all) if (q.scene?.type === "figs" && q.parts.some(p => p.kind === "fill" && p.text.startsWith("{□/□}"))) {
  const got = q.parts.filter(p => p.kind === "fill").flatMap(p => { const a = p.answers.map(Number), out = []; for (let k = 0; k < (p.text.match(/\{□\/□\}/g) ?? []).length; k++) out.push([a[2 * k], a[2 * k + 1]]); return out; });
  const want = figFracs(q);
  if (!/Helen/.test(q.prompt)) { assert.deepEqual(got, want.slice(0, got.length), q.prompt); checked++; }
}
// Tanda perbandingan dari label {a/b} … {c/d}
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /^\{\d+\/\d+\} … \{\d+\/\d+\}$/.test(p.label)) {
  const [a, b] = p.label.match(/\{(\d+\/\d+)\}/g).map(s => F(s.slice(1, -1))); assert.equal(p.answer, a < b ? "<" : a > b ? ">" : "=", `${q.prompt} ${p.label}`); checked++;
}
// Tanda di antara dua pecahan dari gambar
for (const q of all) { const i = q.parts.findIndex(p => p.kind === "choice" && p.label === "Tanda"); if (i > 0) { const a = q.parts[i - 1].answers.map(Number), b = q.parts[i + 1].answers.map(Number); const x = a[0] / a[1], y = b[0] / b[1]; assert.equal(q.parts[i].answer, x < y ? "<" : x > y ? ">" : "=", q.prompt); checked++; } }
// Persamaan isian dihitung ulang: semua ruas yang berupa pecahan/desimal/persen harus sama
const val = s => { s = s.trim(); let m = s.match(/^\{([\d,]+)\/([\d,]+)\}$/); if (m) return toNum(m[1]) / toNum(m[2]); m = s.match(/^([\d,]+)%$/); if (m) return toNum(m[1]) / 100; m = s.match(/^[\d,]+$/); if (m) return toNum(s); return null; };
for (const q of all) for (const p of q.parts) if (p.kind === "fill") {
  let k = 0; const text = p.text.replace(/□/g, () => p.answers[k++]).replace(/^(Helen|Putu|Dodi mendapat) /, "");
  for (const seg of text.split(/, (?:Putu )?/)) { const sides = seg.split(" = ").map(val).filter(v => v !== null); if (sides.length > 1) { sides.forEach(v => assert.ok(Math.abs(v - sides[0]) < 1e-9, `${q.prompt}: ${seg}`)); checked++; } }
}
// Pecahan senilai ke desimal, desimal ke persen, persen ke desimal pada pasangan
for (const q of all) for (const p of q.parts) if (p.kind === "match") p.left.forEach((l, i) => { const r = p.right[p.answer[i]]; const L = /^\{/.test(l) ? F(l.slice(1, -1)) : toNum(l), R = /%$/.test(r) ? toNum(r) / 100 : toNum(r); assert.ok(Math.abs(L - R) < 1e-9, `${q.prompt}: ${l} ↔ ${r}`); checked++; });
for (const q of all) for (const p of q.parts) if (p.kind === "match") { const vals = p.right.map(r => (/%$/.test(r) ? toNum(r) / 100 : toNum(r))); assert.equal(new Set(vals).size, vals.length, `${q.prompt}: pasangan ganda`); }
// Urutan: nilai sesuai label
for (const q of all) for (const p of q.parts) if (p.kind === "rank") p.items.forEach(it => { if (/^\{\d+\/\d+\}$/.test(it.label)) assert.ok(Math.abs(F(it.label.slice(1, -1)) - it.value) < 1e-9, it.label); else if (/%$/.test(it.label)) assert.ok(Math.abs(toNum(it.label) / 100 - it.value) < 1e-9); else if (/^[\d,]+$/.test(it.label)) assert.ok(Math.abs(toNum(it.label) - it.value) < 1e-9); });
for (const q of all) for (const p of q.parts) if (p.kind === "rank") assert.equal(new Set(p.items.map(i => i.value)).size, p.items.length, `${q.prompt}: nilai kembar`);
{ const q = Q.find(q => q.scene?.type === "sacks"); q.parts[0].items.forEach(it => { const s = q.scene.items.find(x => x.name === it.label); assert.ok(Math.abs(F(s.label.match(/\{(\d+\/\d+)\}/)[1]) - it.value) < 1e-9); }); }
// Pilih semua yang senilai
for (const q of all) for (const p of q.parts) if (p.kind === "multi") { const target = F(p.label.match(/\{(\d+\/\d+)\}/)[1]); assert.deepEqual([...p.answer].sort(), p.options.filter(o => Math.abs(F(o.slice(1, -1)) - target) < 1e-9).sort(), q.prompt); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /senilai dengan \{(\d+\/\d+)\}/.test(q.prompt)) { const t = F(q.prompt.match(/senilai dengan \{(\d+\/\d+)\}/)[1]); assert.deepEqual(p.options.filter(o => Math.abs(F(o.slice(1, -1)) - t) < 1e-9), [p.answer]); }
// Arsir: banyak bagian sesuai pecahan yang diminta
for (const q of all) for (const p of q.parts) if (p.kind === "shade") {
  const m = q.prompt.match(/senilai dengan \{(\d+\/\d+)\}/) ?? q.prompt.match(/desimal (\d+(?:,\d+)?)/);
  const target = m ? (m[1].includes("/") ? F(m[1]) : toNum(m[1])) : q.scene.figs[0].shaded / q.scene.figs[0].parts;
  assert.ok(Math.abs(p.need / p.fig.parts - target) < 1e-9, q.prompt); checked++;
}
// Benda di dalam kotak dan persen siswa
for (const q of all) if (q.scene?.type === "items") { const f = q.parts[0].answers; assert.deepEqual([Number(f[0]), Number(f[1])], [q.scene.marked, q.scene.count]); assert.equal(toNum(f[2]), q.scene.marked / q.scene.count); checked++; }
for (const q of all) if (q.scene?.type === "people") { assert.equal(Number(q.parts[0].answers.at(-1)), (q.scene.marked / q.scene.total) * 100); assert.ok(q.prompt.includes(String(q.scene.total)) && q.prompt.includes(String(q.scene.marked))); checked++; }
for (const q of all) if (q.scene?.type === "sheet") { assert.equal(Number(q.parts[0].answers.at(-1)), (q.scene.right / q.scene.total) * 100); checked++; }
// Cerita
{ const q = Q.find(q => /semangka/.test(q.prompt)); const a = q.parts[0].answers.map(Number); assert.equal(a[0] + a[2], a[1]); assert.equal(a[1], q.scene.figs[0].parts); assert.equal(q.parts[1].answer, a[2] > a[0] ? "Putu" : "Helen"); }
{ const q = Q[0]; const a = q.parts[0].answers.map(Number); assert.deepEqual([a[1], a[3]], q.scene.figs.map(f => f.parts)); assert.equal(q.parts[1].answer, a[1] < a[3] ? "Cokelat" : "Keju"); }
// Evaluasi tidak boleh hanya menamai pecahan dari satu gambar
for (const q of Q) assert.ok(!(q.parts.length === 1 && q.parts[0].kind === "fill" && q.parts[0].text === "{□/□}"), `${q.prompt}: soal hanya melabeli gambar`);
{ const q = Q.find(q => /Bibi/.test(q.prompt)); assert.equal(Number(q.parts[0].answers[0]), 9 - 2 - 4); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /^(Lebih panjang|Lebih banyak):$/.test(p.label)) {
  const caps = q.scene.figs.map(f => [plain(f.caption ?? "").split(" ")[0], f.shaded / f.parts]); const best = caps.reduce((a, b) => (b[1] > a[1] ? b : a)); assert.equal(p.answer, best[0], q.prompt); checked++;
}
assert.ok(checked >= 40, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 4 Bab 2 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
