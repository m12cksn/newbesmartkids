// Verifikasi Kelas 4 Bab 1 Bilangan Cacah sampai 10.000: susunan soal dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-four-whole-10k.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, reading, digits4, columnResult, fmt } from "../src/data/grade-four-whole-10k.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 9); assert.equal(practice.length, 9);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 9; t++) assert.ok(Q.filter(q => q.topic === t).length >= 2, `evaluasi subtopik ${topics[t].code} minimal 2 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "rank", "match", "pv", "column", "div", "multi"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["rank", "match", "pv", "column", "div", "multi"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);

for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
  for (const p of q.parts) {
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "match") { assert.deepEqual([...p.answer].sort(), p.right.map((_, i) => i)); assert.ok(p.answer.some((a, i) => a !== i)); }
    if (p.kind === "column") { const r = columnResult(p); assert.ok(r >= 0 && r < 10000, q.prompt); if (p.op !== "×") assert.ok(p.nums.every(n => n <= 1000)); else assert.ok(p.nums[0] < 100 && p.nums[1] < 10); }
    if (p.kind === "div") { assert.equal(p.a % p.b, 0, q.prompt); assert.ok(p.a <= 100 && p.b < 10); }
    if (p.kind === "multi") { assert.ok(p.answer.every(a => p.options.includes(a))); assert.ok(p.answer.length < p.options.length); }
  }
}

// Isian dihitung ulang dari kalimatnya
const val = s => { const t = s.replace(/\./g, "").replace(/×/g, "*").replace(/:/g, "/").replace(/−/g, "-").trim(); return /^[\d\s+\-*/()]+$/.test(t) && /\d/.test(t) ? Function(`return (${t})`)() : null; };
let checked = 0;
for (const q of all) for (const p of q.parts) if (p.kind === "fill") {
  let k = 0; const text = p.text.replace(/□/g, () => fmt(p.answers[k++]));
  for (const seg of text.split(",")) { const sides = seg.split("=").map(s => val(s.trim())).filter(v => v !== null); if (sides.length > 1) { sides.forEach(v => assert.equal(v, sides[0], `${q.prompt}: ${seg}`)); checked++; } }
  const m = text.match(/^([\d.]+) = (\d+) ribuan \+ (\d+) ratusan \+ (\d+) puluhan \+ (\d+) satuan$/); if (m) { assert.equal(Number(m[1].replace(".", "")), m[2] * 1000 + m[3] * 100 + m[4] * 10 + Number(m[5])); checked++; }
  const c = text.match(/^(\d+) ribuan \+ (\d+) ratusan \+ (\d+) puluhan \+ (\d+) satuan = ([\d.]+)$/); if (c) { assert.equal(Number(c[5].replace(".", "")), c[1] * 1000 + c[2] * 100 + c[3] * 10 + Number(c[4])); checked++; }
}
assert.ok(checked >= 12, `isian yang dihitung ulang ${checked}`);
// Cara membaca
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && p.label === "Dibaca:") {
  const n = q.scene?.type === "mountain" ? q.scene.height : q.scene?.type === "gauge" ? q.scene.value : q.parts.filter(x => x.kind === "fill").at(-1).answers[0];
  assert.equal(p.answer, reading(n), q.prompt);
}
for (const q of all) for (const p of q.parts) if (p.kind === "fill") { const m = p.text.match(/^([A-Z][a-z ]+) = □$/); if (m) assert.equal(reading(p.answers[0]), m[1], q.prompt); }
for (const q of all) for (const p of q.parts) if (p.kind === "match" && /^\d\.\d{3}$/.test(p.left[0])) p.left.forEach((l, i) => assert.equal(p.right[p.answer[i]], reading(Number(l.replace(".", ""))), q.prompt));
for (const q of all) for (const p of q.parts) if (p.kind === "match" && /\+/.test(p.left[0])) p.left.forEach((l, i) => assert.equal(Number(p.right[p.answer[i]]), val(l), q.prompt));
// Nilai tempat angka tertentu
const PL = ["Ribuan", "Ratusan", "Puluhan", "Satuan"];
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && p.options.join() === PL.join()) {
  const n = Number((p.label.match(/(\d\.\d{3})/) ?? q.prompt.match(/(\d\.\d{3})/))[1].replace(".", "")), d = (p.label.match(/Angka (\d)/) ?? q.prompt.match(/angka (\d)/))[1];
  const at = digits4(n).map(String).indexOf(d); assert.equal(digits4(n).filter(x => String(x) === d).length, 1, `${q.prompt}: angka ${d} muncul sekali`); assert.equal(p.answer, PL[at], `${q.prompt} ${p.label}`);
  const f = q.parts.find(x => x.kind === "fill" && /Nilai angka/.test(x.text)); if (f) assert.equal(f.answers[0], Number(d) * [1000, 100, 10, 1][at]);
}
// Tabel nilai tempat
for (const q of all) for (const p of q.parts) if (p.kind === "pv") assert.ok(q.prompt.includes(fmt(p.n)) || q.parts.some(f => f.kind === "fill" && f.answers[0] === p.n), q.prompt);
{ const q = Q.find(q => q.prompt.startsWith("Sebuah bilangan empat angka")); const d = digits4(q.parts[0].n); assert.deepEqual(d, [6, 6 + 2, 8 / 2, 6 - 1]); }
// Tanda dan urutan
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /^\d\.\d{3} … \d\.\d{3}$/.test(p.label)) { const [a, b] = p.label.split(" … ").map(s => Number(s.replace(".", ""))); assert.equal(p.answer, a < b ? "<" : a > b ? ">" : "="); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && / dan .*:$/.test(p.label) && /^\d/.test(p.label)) assert.equal(Number(p.answer.replace(".", "")), Math.max(...p.options.map(o => Number(o.replace(".", "")))));
for (const q of all) if (q.scene?.type === "mountains") { const p = q.parts[0]; assert.deepEqual(p.items.map(i => i.value), q.scene.peaks.map(x => x.height)); }
{ const q = Q.find(q => q.prompt.startsWith("Titik-titik pada 3.4")); const ok = [...Array(10).keys()].filter(d => 3405 + d * 10 > 3475); assert.equal(q.parts[0].answers[0], Math.min(...ok)); }
// Kartu angka
for (const q of all) if (q.scene?.type === "cards") {
  const ds = q.scene.digits, perms = []; const go = (pre, rest) => { if (!rest.length) { if (pre[0] !== 0) perms.push(Number(pre.join(""))); return; } rest.forEach((d, i) => go([...pre, d], rest.filter((_, j) => j !== i))); }; go([], ds);
  const fills = q.parts.filter(p => p.kind === "fill").flatMap(p => p.answers); assert.deepEqual(fills.slice(0, 2), [Math.max(...perms), Math.min(...perms)], q.prompt);
}
// Uang
const sumNotes = s => s.notes.reduce((a, n) => a + n.value * n.count, 0);
{ const q = practice[3][3]; assert.equal(sumNotes(q.scene) + q.parts[0].answers[0] * 100, 7300); }
{ const q = Q.find(q => q.prompt.startsWith("Bayar Rp7.300")); const a = q.parts[0].answers, vals = [2000, 1000, 500, 100]; assert.equal(a.reduce((s, k, i) => s + k * vals[i], 0), 7300);
  let best = Infinity; for (let w = 0; w <= 4; w++) for (let y = 0; y <= 5; y++) for (let z = 0; z <= 2; z++) for (let u = 0; u <= 4; u++) if (w * 2000 + y * 1000 + z * 500 + u * 100 === 7300) best = Math.min(best, w + y + z + u);
  assert.equal(a.reduce((s, k) => s + k, 0), best, "paling sedikit"); q.scene.notes.forEach((n, i) => assert.ok(n.count >= a[i])); }
// Kelompok dan bagi
for (const q of all) if (q.scene?.type === "groups") { const n = q.scene.groups * q.scene.per; const ok = q.parts.some(p => (p.kind === "column" && columnResult(p) === n) || (p.kind === "fill" && p.answers.includes(n))); assert.ok(ok, `${q.prompt}: ${n}`); }
for (const q of all) if (q.scene?.type === "share") { const f = q.parts[0]; assert.equal(f.answers[0], Math.floor(q.scene.total / q.scene.to)); if (f.answers.length > 1) assert.equal(f.answers[1], q.scene.total % q.scene.to); }
for (const q of all) if (q.scene?.type === "days") { const f = q.parts[0]; assert.deepEqual(f.answers, [4 * q.scene.per, 7 * q.scene.per]); }
// Faktor dan kelipatan
for (const q of all) for (const p of q.parts) if (p.kind === "multi") {
  const m = q.prompt.match(/faktor dari (\d+)/); if (m) assert.deepEqual(p.answer, p.options.filter(o => Number(m[1]) % o === 0), q.prompt);
  const k = q.prompt.match(/kelipatan (\d+)/); if (k) { const lo = Number(q.prompt.match(/lebih dari (\d+)/)?.[1] ?? 0), hi = Number(q.prompt.match(/kurang dari (\d+)/)[1]); assert.deepEqual(p.answer, p.options.filter(o => o % Number(k[1]) === 0 && o > lo && o < hi), q.prompt); }
}
console.log(`Kelas 4 Bab 1 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} isian dihitung ulang, bentuk ${[...kinds].join(", ")}`);
