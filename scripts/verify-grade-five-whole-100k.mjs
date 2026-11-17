// Verifikasi Kelas 5 Bab 1 Bilangan Cacah sampai 100.000: susunan soal dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-five-whole-100k.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, reading, digits5, columnResult, fmt } from "../src/data/grade-five-whole-100k.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 4); assert.equal(practice.length, 4);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "kalimat soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 4; t++) assert.ok(Q.filter(q => q.topic === t).length >= 5, `evaluasi subtopik ${topics[t].code} minimal 5 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "rank", "match", "pv", "column"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);

const pos = [0, 0, 0];
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
  for (const p of q.parts) {
    if (p.kind === "choice") { assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt); if (Q.includes(q) && p.options.length === 3 && p.label === "Dibaca:") pos[p.options.indexOf(p.answer)]++; }
    if (p.kind === "match") { assert.deepEqual([...p.answer].sort(), p.right.map((_, i) => i)); assert.ok(p.answer.some((a, i) => a !== i)); }
    if (p.kind === "column") { const r = columnResult(p); assert.ok(r >= 0 && r <= 100000 && p.a <= 100000 && p.b <= 100000); }
  }
}

// Isian dihitung ulang dari kalimatnya
const val = s => { const t = s.replace(/\./g, "").replace(/×/g, "*").replace(/:/g, "/").replace(/−/g, "-").trim(); return /^[\d\s+\-*/()]+$/.test(t) && /\d/.test(t) ? Function(`return (${t})`)() : null; };
let checked = 0;
for (const q of all) for (const p of q.parts) if (p.kind === "fill") {
  let k = 0; const text = p.text.replace(/□/g, () => fmt(p.answers[k++]));
  const sides = text.split("=").map(s => val(s.trim())).filter(v => v !== null);
  if (sides.length > 1) { sides.forEach(v => assert.equal(v, sides[0], `${q.prompt}: ${text}`)); checked++; }
}
// Cara membaca dan bilangan dari kata
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && p.label === "Dibaca:") { const f = q.parts.find(x => x.kind === "fill"); const m = q.prompt.match(/\d{1,3}\.\d{3}/); const n = f ? f.answers[0] : m ? Number(m[0].replace(".", "")) : q.scene.items[0].price; assert.equal(p.answer, reading(n), q.prompt); }
for (const q of all) for (const p of q.parts) if (p.kind === "fill") { const m = p.text.match(/^([A-Z][a-z ]+) = □$/); if (m) assert.equal(reading(p.answers[0]), m[1], q.prompt); }
{ const q = practice[0][0]; assert.equal(reading(q.parts[0].answers[0]).toLowerCase() + ".", q.prompt.split(": ")[1]); }
for (const q of all) for (const p of q.parts) if (p.kind === "match" && /^\d{1,3}\.\d{3}$/.test(p.left[0])) p.left.forEach((l, i) => assert.equal(p.right[p.answer[i]], reading(Number(l.replace(".", ""))), q.prompt));
// Uang
const sumNotes = s => s.notes.reduce((a, n) => a + n.value * n.count, 0);
{ const q = practice[2][0]; assert.equal(q.parts[0].answers.at(-1), sumNotes(q.scene)); }
{ const q = Q.find(q => q.prompt.startsWith("Tuliskan jumlah uang")); assert.equal(q.parts[0].answers[0], sumNotes(q.scene)); }
{ const q = Q.find(q => q.prompt.startsWith("Bayar Rp45.600")); const [a, b, c] = q.parts[0].answers; assert.equal(a * 10000 + b * 1000 + c * 100, 45600); assert.ok(b < 10 && c < 10, "paling sedikit lembar"); q.scene.notes.forEach((n, i) => assert.ok(n.count >= [a, b, c][i])); }
{ const q = Q.find(q => q.prompt.startsWith("Ibu Saga")); const [t, d] = q.parts[0].answers; assert.equal(40000 + 5000 + t * 10000 + d * 2000, 59000); assert.ok((t + 1) * 10000 > 14000); }
{ const q = Q.find(q => q.prompt.startsWith("Komang membayar Rp45.600 dengan 3")); assert.equal(30000 + 600 + q.parts[0].answers[0] * 1000, 45600); }
{ const q = practice[2][2]; const [r, h] = q.parts[0].answers; assert.equal(40000 + r * 1000 + h * 100, 45600); }
{ const q = practice[2][3]; assert.equal(55000 + q.parts[0].answers[0] * 2000, 59000); }
{ const q = Q.find(q => q.prompt.startsWith("Hitung uang Lukas")); assert.deepEqual(q.parts[0].answers, q.scene.groups.map(sumNotes)); assert.equal(q.parts[1].answer, q.scene.groups[0].name === "Uang Lukas" && sumNotes(q.scene.groups[0]) > sumNotes(q.scene.groups[1]) ? "Lukas" : "Asep"); }
// Nilai tempat, urutan, buah
for (const q of all) for (const p of q.parts) if (p.kind === "pv") assert.ok(q.prompt.includes(fmt(p.n)) || q.parts.some(f => f.kind === "fill" && f.answers[0] === p.n), q.prompt);
{ const q = Q.find(q => q.prompt.startsWith("Jumlah penduduk sebuah kecamatan")), d = digits5(q.parts[0].n); assert.deepEqual(d, [2, 2 + 4, 9, 9 / 3, 2]); assert.ok(Q.filter(x => x.level !== "Sedang").every(x => !x.parts.some(p => p.kind === "pv" && x.prompt.includes(fmt(p.n)))), "soal menantang tidak boleh menyalin bilangan ke tabel"); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && /^\d+\.\d+ … \d+\.\d+$/.test(p.label)) { const [a, b] = p.label.split(" … ").map(s => Number(s.replace(".", ""))); assert.equal(p.answer, a < b ? "<" : a > b ? ">" : "="); }
for (const q of all) for (const p of q.parts) if (p.kind === "choice" && / dan .*:$/.test(p.label) && /^\d/.test(p.label)) assert.equal(Number(p.answer.replace(".", "")), Math.min(...p.options.map(o => Number(o.replace(".", "")))));
{ const q = Q.find(q => q.prompt.startsWith("Bilangan mana yang angka 7")); const ok = q.parts[0].options.filter(o => { const d = digits5(Number(o.replace(".", ""))); return d[0] === 7 && d[4] === 7; }); assert.deepEqual(ok, [q.parts[0].answer]); }
{ const q = practice[0][3]; assert.equal(["Puluh ribuan", "Ribuan", "Ratusan", "Puluhan", "Satuan"][digits5(27509).indexOf(7)], q.parts[0].answer); }
{ const q = Q.find(q => q.prompt.startsWith("Dengan kartu")), d = q.scene.digits; const big = Number([...d].sort((a, b) => b - a).join("")); const s = [...d].sort((a, b) => a - b); const firstNon0 = s.find(x => x > 0); const sm = Number([firstNon0, ...s.filter((x, i) => i !== s.indexOf(firstNon0))].join("")); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [big, sm]); }
const fruit = Object.fromEntries(Q.find(q => q.scene?.type === "board").scene.rows);
{ const q = Q.find(q => q.prompt.startsWith("Perhatikan harga buah")); const mx = Object.entries(fruit).sort((a, b) => b[1] - a[1])[0][0];
  assert.equal(q.parts[0].answer, mx === "Kelengkeng" ? "Benar" : "Salah"); assert.equal(q.parts[1].answer, 2 * fruit["Buah naga"] > fruit.Alpukat ? "Benar" : "Salah"); assert.equal(q.parts[2].answer, 3 * fruit.Jeruk > fruit.Kelengkeng ? "Benar" : "Salah"); }
{ const q = Q.find(q => q.prompt.startsWith("Pasangkan setiap hitungan")), p = q.parts[0], vals = [2 * fruit.Mangga + fruit.Jeruk, 100000 - 2 * fruit.Mangga - 2 * fruit["Buah naga"], Math.min(...Object.values(fruit)) + Math.max(...Object.values(fruit)), fruit.Kelengkeng - 2 * fruit["Buah naga"]];
  vals.forEach((v, i) => assert.equal(p.right[p.answer[i]], `Rp${fmt(v)}`)); }
{ const q = Q.find(q => q.prompt.startsWith("Uang Rp84.000")); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [84000 / 4, 84000 / 4 - fruit.Jeruk]); }
{ const q = Q.find(q => q.prompt.startsWith("Paket A")), [a, b] = q.scene.pakets.map(p => p.price); assert.deepEqual(q.parts.map(p => p.answers[0]), [2 * a, 2 * a - b, 35000 - b / 2]); }
for (const q of all) if (q.scene?.type === "angpau") assert.equal(q.parts[0].answers.at(-1), q.scene.count * q.scene.value);
for (const q of all) for (const p of q.parts) if (p.kind === "rank") { const s = q.scene?.type === "tags" ? Object.fromEntries(q.scene.items.map(i => [i.name, i.price])) : null; if (s) p.items.forEach(it => assert.equal(it.value, s[it.label])); else p.items.forEach(it => assert.equal(it.value, Number(it.label.replace(".", "")))); }

console.log(`Kelas 5 Bab 1 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${checked} kalimat isian dihitung ulang, posisi pilihan baca ${pos.join("/")}`);
