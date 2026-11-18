// Verifikasi Kelas 4 Bab 3 Pola Gambar dan Pola Bilangan: susunan soal dan kunci yang dihitung ulang dari polanya.
// Jalankan: node --experimental-strip-types scripts/verify-grade-four-patterns-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, seqFill } from "../src/data/grade-four-patterns-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 2; t++) assert.equal(Q.filter(q => q.topic === t).length, 12, `evaluasi subtopik ${topics[t].code} 12 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "seq", "choice", "rank", "match", "multi", "build", "pick"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["rank", "match", "multi", "build", "pick"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);

/** Pola dengan selisih tetap dari bilangan yang diketahui. */
const step = xs => { const d = xs[1] - xs[0]; xs.forEach((x, i) => i && assert.equal(x - xs[i - 1], d, `selisih tidak tetap: ${xs}`)); return d; };
const nth = (xs, k) => xs[0] + (k - 1) * step(xs);
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 25, `${q.prompt}: pembahasan terlalu pendek`);
  for (const [i, p] of q.parts.entries()) {
    if (p.kind === "rank" || p.kind === "match") { const v = q.answer.split("‖"); v[i] = v[i].split("|")[0]; assert.ok(!ready(q, v.join("‖")), `${q.prompt}: ${p.kind} sebagian dianggap lengkap`); }
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "seq") { const filled = seqFill(p.items); let m = 0; const done = p.items.map(x => (x === null ? filled[m++] : x)); step(done); assert.ok(done.every(x => x > 0), q.prompt); checked++; }
    if (p.kind === "rank") { const s = [...p.items].sort((a, b) => b - a); step(s); checked++; }
    if (p.kind === "match") p.left.forEach((l, k) => { const xs = l.replace(/, …$/, "").split(", ").map(Number); const d = step(xs); assert.equal(p.right[p.answer[k]], d > 0 ? `+${d}` : `−${-d}`, l); checked++; });
    if (p.kind === "multi") { const xs = q.prompt.match(/pola ([\d, ]+), …/)[1].split(", ").map(Number), d = step(xs); assert.deepEqual(p.answer, p.options.filter(o => o > xs[0] && (o - xs[0]) % d === 0), q.prompt); checked++; }
    if (p.kind === "pick") { const filled = seqFill(p.row); assert.deepEqual([p.answer], filled, q.prompt); assert.ok(p.options.includes(p.answer) && new Set(p.options).size === p.options.length); checked++; }
    if (p.kind === "build") { assert.ok(p.answer <= p.max && p.answer > 0); }
  }
  // Soal bergambar: kunci = kumpulan ke-k dari pola pada gambar
  // Gambar sesuai kalimat: "disusun N baris" berarti susunan tepat N baris, juga pada kotak susun jawaban
  { const m = q.prompt.match(/disusun (\d) baris/); if (m) { for (const gr of [q.scene, ...q.parts.filter(p => p.kind === "build").map(p => p.group)]) assert.deepEqual([gr.layout, gr.per], ["band", Number(m[1])], q.prompt); checked++; } }
  if (q.scene?.type === "groups") {
    const c = q.scene.counts;
    if (q.scene.layout === "frame") c.forEach(n => assert.equal(n % 4, 0, q.prompt));
    if (q.scene.layout === "x") c.forEach(n => assert.equal(n % 4, 1, q.prompt));
    if (q.scene.layout === "lshape") c.forEach(n => assert.equal(n % 2, 1, q.prompt));
    const misfit = q.parts.find(p => p.kind === "choice" && p.label === "Tidak sesuai:");
    if (misfit) { const bad = Number(misfit.answer.split(" ")[1]) - 1, d = c[1] - c[0]; c.forEach((n, k) => assert.equal(n === c[0] + k * d, k !== bad, `${q.prompt}: kumpulan ${k + 1}`)); assert.equal(q.parts[1].answers[0], c[0] + bad * d); checked++; continue; }
    for (const p of q.parts) {
      if (p.kind === "build") { const k = Number(p.label.match(/ke-(\d+)/)[1]); assert.equal(p.answer, nth(c, k), q.prompt); checked++; }
      if (p.kind === "fill") { const m = p.text.match(/ke-(\d+)/); if (m && /Kumpulan ke-/.test(p.text)) { assert.equal(p.answers[0], nth(c, Number(m[1])), `${q.prompt}: ${p.text}`); checked++; } if (/habis pada kumpulan ke-/.test(p.text)) { assert.equal(nth(c, p.answers[0]), 0); checked++; } }
      if (p.kind === "choice" && p.label === "Polanya:") { assert.equal(p.answer, step(c) > 0 ? "Membesar" : "Mengecil"); checked++; }
    }
  }
  if (q.scene?.type === "table") {
    const xs = q.scene.rows.map(r => Number(r[1])), months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus"];
    for (const p of q.parts) if (p.kind === "fill") { const key = p.text.split(":")[0], k = months.includes(key) ? months.indexOf(key) + 1 : /ke-(\d+)/.test(key) ? Number(key.match(/ke-(\d+)/)[1]) : { "Rak kelima": 5 }[key]; assert.equal(p.answers[0], nth(xs, k), `${q.prompt}: ${key}`); checked++; }
    for (const p of q.parts) if (p.kind === "choice" && p.label === "Polanya:") assert.equal(p.answer, step(xs) > 0 ? "Membesar" : "Mengecil");
  }
}
// Soal cerita tanpa gambar: dihitung dari kalimatnya
{ const q = Q.find(q => /Rina/.test(q.prompt)); assert.equal(q.parts[0].answers[0], nth([6, 11, 16], 5)); checked++; }
{ const q = Q.find(q => /bioskop/.test(q.prompt)); assert.equal(q.parts[0].answers[0], nth([12, 15, 18], 12)); checked++; }
{ const q = Q.find(q => /bilangan ke-10/.test(q.prompt)); assert.equal(q.parts[0].answers[0], nth([4, 9, 14, 19], 10)); checked++; }
assert.ok(checked >= 30, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 4 Bab 3 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
