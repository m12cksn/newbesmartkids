// Verifikasi Kelas 4 Bab 6 Piktogram dan Diagram Batang: susunan soal dan kunci yang dihitung ulang dari data diagram.
// Jalankan: node --experimental-strip-types scripts/verify-grade-four-charts-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready } from "../src/data/grade-four-charts-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "kalimat soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 2; t++) assert.equal(Q.filter(q => q.topic === t).length, 12, `evaluasi subtopik ${topics[t].code} 12 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "multi", "pikto", "bar", "pick"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["multi", "pikto", "bar", "pick"].includes(p.kind))).length;
assert.ok(action >= 8, `soal beraksi minimal 8, sekarang ${action}`);
// Diagram dalam evaluasi tidak dipakai berulang (kecuali data meja guru yang di buku memang disajikan dua kali).
const sig = c => JSON.stringify(c.items);
const used = Q.filter(q => q.scene?.type === "chart").map(q => sig(q.scene.chart));
assert.equal(new Set(used).size, used.length, "diagram evaluasi tidak boleh kembar");
const posChoice = Q.flatMap(q => q.parts.flatMap(p => (p.kind === "choice" ? [p.options.indexOf(p.answer)] : p.kind === "pick" ? [p.answer] : [])));
assert.ok(new Set(posChoice).size >= 3, `posisi jawaban terlalu seragam: ${posChoice}`);

/** Perhitungan bebas dari data mentah (tidak memakai fungsi pembuat soal). */
const get = (c, n) => c.items.find(i => i.name === n).value;
const vis = c => c.items.filter(i => i.name !== c.hide);
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 40, `${q.prompt}: pembahasan terlalu pendek`);
  const c = q.scene?.type === "chart" ? q.scene.chart : null;
  if (c?.kind === "pikto") c.items.forEach(i => assert.equal(i.value % c.scale, 0, `${q.prompt}: ${i.name} bukan kelipatan ${c.scale}`));
  if (c?.kind === "bar") c.items.forEach(i => assert.ok(i.value <= c.max && i.value >= 0, `${q.prompt}: ${i.name} di luar skala`));
  for (const [pi, p] of q.parts.entries()) {
    if (p.kind === "fill") {
      p.ask.forEach((a, k) => {
        const want = a.f === "value" ? get(c, a.cat) : a.f === "sum" ? a.cats.reduce((s, n) => s + get(c, n), 0) : a.f === "total" ? vis(c).reduce((s, i) => s + i.value, 0)
          : a.f === "diff" ? Math.abs(get(c, a.a) - get(c, a.b)) : a.f === "scale" ? c.scale : a.f === "range" ? Math.max(...vis(c).map(i => i.value)) - Math.min(...vis(c).map(i => i.value))
          : a.f === "missing" ? (a.total - vis(c).reduce((s, i) => s + i.value, 0)) / c.scale : NaN;
        assert.equal(p.answers[k], want, `${q.prompt}: ${p.text}`);
        // Angka di kalimat soal harus cocok dengan data, misalnya "Keranjang A berisi 30 bola dan digambar dengan 6 gambar".
      }); checked++;
    }
    if (p.kind === "choice") {
      const vs = c.items.map(i => i.value), a = p.ask;
      const names = c.items.filter(i => (a.f === "max" ? i.value === Math.max(...vs) : a.f === "min" ? i.value === Math.min(...vs) : a.f === "which" ? i.value === a.value : i.value === 2 * get(c, a.of))).map(i => i.name);
      assert.deepEqual(names, [p.answer], `${q.prompt}: ${p.label}`); assert.equal(p.options.filter(o => o === p.answer).length, 1); checked++;
    }
    if (p.kind === "multi") { assert.deepEqual([...p.answer].sort(), c.items.filter(i => i.value > p.more).map(i => i.name).sort(), q.prompt); assert.ok(p.answer.length > 0 && p.answer.length < p.options.length); checked++; }
    if (p.kind === "pikto" || p.kind === "bar") {
      const ch = p.chart;
      if (p.kind === "pikto") ch.items.forEach(i => assert.equal(i.value % ch.scale, 0)); else ch.items.forEach(i => { assert.equal(i.value % ch.step, 0, `${q.prompt}: batang ${i.name} harus tepat di garis`); assert.ok(i.value <= ch.max); });
      // Sumber data (tabel atau kalimat) harus sama dengan diagram yang diminta.
      if (q.scene?.type === "table") assert.deepEqual(Object.fromEntries(q.scene.rows), Object.fromEntries(ch.items.map(i => [i.name, i.value])), `${q.prompt}: tabel tidak sama`);
      else if (/menyajikan \d+/.test(q.prompt)) { const tot = Number(q.prompt.match(/menyajikan (\d+)/)[1]); assert.equal(ch.items.reduce((s, i) => s + i.value, 0), tot, `${q.prompt}: total`); }
      else ch.items.forEach(i => assert.ok(new RegExp(`\\b${i.value} (ikat |bunga |pot )?${i.name}`, "i").test(q.prompt), `${q.prompt}: ${i.value} ${i.name} tidak ada di kalimat`));
      const half = q.answer.split("‖"); half[pi] = half[pi].split("|").slice(0, -1).join("|"); if (p.edit.length > 1) assert.ok(!ready(q, half.join("‖")), `${q.prompt}: sebagian dianggap lengkap`);
      checked++;
    }
    if (p.kind === "pick") {
      const src = q.scene?.type === "table" ? Object.fromEntries(q.scene.rows) : q.scene?.type === "chart" ? Object.fromEntries(q.scene.chart.items.map(i => [i.name, i.value])) : Object.fromEntries([...q.prompt.matchAll(/(\d+) ([a-z]+)/gi)].map(m => [m[2][0].toUpperCase() + m[2].slice(1), Number(m[1])]));
      const matches = p.charts.map((ch, k) => (ch.items.every(i => i.value === src[i.name]) ? k : -1)).filter(k => k >= 0);
      assert.deepEqual(matches, [p.answer], `${q.prompt}: diagram yang cocok harus tepat satu`); checked++;
    }
  }
}
{ const q = Q.find(q => /Keranjang A berisi 30 bola dan digambar dengan 6 gambar/.test(q.prompt)); const c = q.scene.chart; assert.equal(get(c, "A"), 30); assert.equal(30 / c.scale, 6); checked++; }
{ const q = Q.find(q => /seluruhnya 52 buah/.test(q.prompt)); assert.equal(q.scene.chart.hide, "Bu Sri"); checked++; }
assert.ok(checked >= 35, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 4 Bab 6 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
