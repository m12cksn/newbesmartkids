// Verifikasi Kelas 6 Bab 4 Peluang: susunan soal, skala peluang dari gambar, dan aturan isi yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-six-probability-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, catOf, meets, tally, cmp, sides, partKey } from "../src/data/grade-six-probability-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2);
practice.forEach((set, t) => topics[t].sections.forEach((_, s) => assert.equal(set.filter(q => q.topic === t && q.section === s).length, 4, `latihan ${topics[t].code}.${s + 1} harus 4 soal`)));
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.scene ?? q.parts))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let i = 1; i < Q.length; i++) assert.notEqual(`${Q[i].topic}${Q[i].section}`, `${Q[i - 1].topic}${Q[i - 1].section}`, `soal ${i} dan ${i + 1} dari bagian yang sama berurutan`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
for (let t = 0; t < 2; t++) for (const s of [0, 1]) assert.ok(Q.filter(q => q.topic === t && q.section === s).length >= 5, `evaluasi ${topics[t].code}.${s + 1} minimal 5 soal`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "pick", "scale", "die", "bag", "spin"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk ${k}`);
const action = Q.filter(q => q.parts.some(p => ["pick", "scale", "die", "bag", "spin"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);

for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25);
  for (const p of q.parts) {
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "die") { assert.equal(p.key.length, sides[p.dieKind]); assert.ok(p.key.every(v => p.values.includes(v))); }
    if (p.kind === "bag") assert.equal(p.key.reduce((a, b) => a + b, 0), p.total);
    // Aturan isi tidak boleh terlalu longgar: isian serba sama harus salah
    if (p.kind === "die") assert.ok(!meets(tally(Array(p.key.length).fill(String(p.values[0]))), p.key.length, p.rules), `${q.prompt}: semua sisi sama dianggap benar`);
    if (p.kind === "spin") assert.ok(!meets(tally(Array(p.n).fill(p.colors[0])), p.n, p.rules), `${q.prompt}: satu warna dianggap benar`);
  }
}

/* Roda: setiap warna yang diminta harus dipakai */
for (const q of all) for (const p of q.parts) if (p.kind === "spin") {
  for (const c of p.rules.need ?? []) { const others = p.colors.filter(x => x !== c); const bad = Array.from({ length: p.n }, (_, i) => (i < p.n - 1 ? others[0] : others.at(-1))); assert.ok(!meets(tally(bad), p.n, p.rules), `${q.prompt}: tanpa ${c} dianggap benar`); }
  assert.ok(!meets(tally([...Array(7).fill("merah"), "hijau"]), p.n, p.rules), `${q.prompt}: 7 merah 1 hijau tanpa biru dianggap benar`);
  assert.deepEqual([...(p.rules.need ?? [])].sort(), [...p.colors].sort(), `${q.prompt}: semua warna wajib`);
}
/* Skala dari gambar */
const counts = s => {
  if (s.type === "bags" && s.bags.length === 1) return { m: Object.fromEntries(s.bags[0].balls), n: s.bags[0].balls.reduce((a, [, k]) => a + k, 0) };
  if (s.type === "books") return { m: Object.fromEntries(s.books), n: s.books.reduce((a, [, k]) => a + k, 0) };
  if (s.type === "spinners") { const x = s.spinners[0].sectors; return { m: tally(x.map(z => z.color)), n: x.length }; }
  if (s.type === "dice") { const f = s.dice[0].faces; return { m: tally(f.map(String)), n: f.length, faces: f }; }
};
for (const q of all) for (const p of q.parts) if (p.kind === "scale") {
  const { m, n, faces } = counts(q.scene);
  p.items.forEach((it, i) => {
    let k;
    if (it.color) k = m[it.color] ?? 0;
    else if (/^Angka \d+$/.test(it.label)) k = m[it.label.split(" ")[1]] ?? 0;
    else if (/^Angka kurang dari (\d+)$/.test(it.label)) k = faces.filter(f => f < Number(it.label.split(" ").at(-1))).length;
    else if (it.label === "Angka ganjil") k = faces.filter(f => f % 2).length;
    else if (/^Bukan /.test(it.label)) { const c = it.label.split(" ").at(-1); k = n - (m[c] ?? 0); }
    assert.notEqual(k, undefined, `${q.prompt}: ${it.label} tidak terbaca`);
    assert.equal(p.answer[i], catOf(k, n), `${q.prompt}: ${it.label}`);
  });
}
/* Pilih tas dari skala: tepat satu cocok */
for (const q of all) if (q.scene?.type === "scale") for (const p of q.parts) if (p.kind === "pick") {
  const ok = p.options.map(o => { const m = Object.fromEntries(o.bag), n = o.bag.reduce((a, [, k]) => a + k, 0); return q.scene.marks.every(mk => catOf(m[mk.color] ?? 0, n) === mk.cat); });
  assert.equal(ok.filter(Boolean).length, 1, q.prompt); assert.equal(ok.indexOf(true), p.answer, q.prompt);
}
/* Aturan die/bag sesuai skala yang digambar */
for (const q of all) if (q.scene?.type === "scale") for (const p of q.parts) if (p.kind === "die" || p.kind === "bag")
  for (const mk of q.scene.marks) { const key = mk.color ?? mk.label.split(" ")[1]; assert.ok(p.rules.cats.some(([k, c]) => k === key && c === mk.cat), `${q.prompt}: aturan ${key}`); }
/* Pilih dadu: syarat menang angka 3 */
for (const q of all) for (const p of q.parts) if (p.kind === "pick" && p.options[0].die) {
  const pr = p.options.map(o => [o.die.faces.filter(f => f === 3).length, o.die.faces.length]);
  const best = pr.map((a, i) => pr.every((b, j) => i === j || cmp(a[0], a[1], b[0], b[1]) > 0));
  assert.equal(best.filter(Boolean).length, 1, q.prompt); assert.equal(best.indexOf(true), p.answer, q.prompt);
  const f = q.parts.find(x => x.kind === "fill"); if (f) assert.equal(f.answers[0], pr[p.answer][0]);
}
/* Pilih kotak: bandingkan pecahan */
const frac = (balls, c = "biru") => [balls.find(([k]) => k === c)?.[1] ?? 0, balls.reduce((a, [, k]) => a + k, 0)];
for (const q of all) if (q.scene?.type === "bags" && q.scene.bags.length > 1) {
  const fr = q.scene.bags.map(b => frac(b.balls)); const best = fr.map((a, i) => fr.every((b, j) => i === j || cmp(...a, ...b) > 0));
  const p = q.parts[0]; assert.equal(best.filter(Boolean).length, 1); const name = q.scene.bags[best.indexOf(true)].label; assert.ok(p.answer.endsWith(name), `${q.prompt}: ${p.answer} vs ${name}`);
}
for (const q of all) if (q.scene?.type === "boxes") for (const p of q.parts) {
  const item = p.label.match(/Ingin (.+):/)[1]; const fr = q.scene.boxes.map(b => frac(b.items, item));
  assert.notEqual(cmp(...fr[0], ...fr[1]), 0); assert.equal(p.answer, q.scene.boxes[cmp(...fr[0], ...fr[1]) > 0 ? 0 : 1].label, `${q.prompt}: ${item}`);
}
for (const q of all) if (q.scene?.type === "candies") { const n = q.scene.candies.reduce((a, [, k]) => a + k, 0), mx = Math.max(...q.scene.candies.map(c => c[1])), mn = Math.min(...q.scene.candies.map(c => c[1]));
  assert.equal(q.scene.candies.filter(c => c[1] === mx).length, 1); const top = q.scene.candies.find(c => c[1] === mx)[0]; assert.equal(q.parts[0].answer.toLowerCase(), top);
  const f = q.parts.find(p => p.kind === "fill"); if (f) assert.deepEqual(f.answers, [mx, n]);
  const lo = q.parts.find(p => /kecil/.test(p.label ?? "")); if (lo) { assert.equal(q.scene.candies.filter(c => c[1] === mn).length, 1); assert.equal(lo.answer.toLowerCase(), q.scene.candies.find(c => c[1] === mn)[0]); } }
/* Roda nama: terbesar dan adil */
for (const q of all) if (q.scene?.type === "spinners" && q.scene.spinners[0].sectors[0].label) { const t = tally(q.scene.spinners[0].sectors.map(s => s.label)), v = Object.values(t), fair = v.every(x => x === v[0]);
  for (const p of q.parts) { if (p.label === "Roda ini:") assert.equal(p.answer, fair ? "Adil" : "Kurang adil"); if (p.label === "Peluang terbesar:") assert.equal(t[p.answer], Math.max(...v)); if (p.kind === "fill") assert.deepEqual(p.answers, [t[p.text.split(" ")[1]], q.scene.spinners[0].sectors.length]); } }
/* Pemain dadu tunggal: banyak angka menang */
for (const q of all) if (q.scene?.type === "players" && q.scene.players.every(p => p.tool === "dadu")) {
  const w = q.scene.players.map(p => (p.win.match(/\d/g) ?? []).length), max = Math.max(...w);
  for (const p of q.parts) { if (p.label === "Peluang terbesar:") { assert.equal(w.filter(x => x === max).length, 1); assert.equal(p.answer, q.scene.players[w.indexOf(max)].name); }
    if (p.label === "Permainan ini:") assert.equal(p.answer.startsWith("Adil"), w.every(x => x === w[0])); if (p.kind === "fill") assert.equal(p.answers[0], max); }
}
{ const q = Q.find(q => q.prompt.startsWith("Hadiah diberikan jika mendapat warna merah")); assert.ok(cmp(3, 8, 4, 12) > 0); assert.ok(q.parts[0].answer.startsWith("Roda")); }

const pos = Q.flatMap(q => q.parts.filter(p => p.kind === "choice" || p.kind === "pick").map(p => (p.kind === "pick" ? p.answer : p.options.indexOf(p.answer))));
console.log(`Kelas 6 Bab 4 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, bentuk ${[...kinds].join(", ")}, posisi jawaban pilihan ${pos.join(",")}; kunci contoh ${partKey(Q[0].parts[0])}`);
