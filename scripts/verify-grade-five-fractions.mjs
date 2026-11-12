import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, fr, top, val, lcm, opNum, cells } from "../src/data/grade-five-fractions.ts";

assert.equal(topics.length, 3);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 8, 1: 8, 2: 8 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) {
  assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
  assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level], `tingkat soal ${i + 1}`);
}
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 9, JSON.stringify(kinds));

// Fungsi dasar.
assert.equal(top(fr("2 3/4")), 11); assert.equal(val("3 1/2"), 3.5); assert.equal(lcm(8, 10), 40); assert.equal(opNum("1/2", "+", "1/3", 6), 5);

const cmp = (a, b) => Math.sign(val(a) - val(b));
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    const bump = k => f.map((x, j) => (j === k ? String(Number(x || 0) + 1) : x)).join("|");
    if (p.kind === "frac") {
      const a = fr(p.answer); wrong(bump(1));
      // pecahan senilai diterima
      if (!p.mixed) { assert.ok(correct(q, swap(`|${top(a) * 2}|${a.d * 2}`)), "senilai diterima"); }
      else { assert.ok(a.n < a.d && a.w > 0); wrong(`|${top(a)}|${a.d}`); }
    }
    if (p.kind === "sign") { const s = cmp(p.left, p.right); assert.equal(p.answer, s < 0 ? "<" : s > 0 ? ">" : "="); wrong(p.answer === "<" ? ">" : "<"); }
    if (p.kind === "order") {
      const sorted = [...p.options].sort((a, b) => val(a) - val(b)); const desc = /terbesar|terjauh/.test(p.label);
      assert.deepEqual(p.answer, desc ? sorted.reverse() : sorted, p.label); assert.equal(new Set(p.options.map(val)).size, p.options.length); wrong([...p.answer].reverse().join(";"));
    }
    if (p.kind === "convert") { const a = fr(p.mixed); assert.ok(correct(q, swap([a.d, a.w, a.n, top(a), a.d].join("|"))), "urutan perkalian bebas"); wrong(bump(3)); }
    if (p.kind === "equalize") { const L = Number(f[0]); p.fracs.forEach((s, k) => assert.equal(Number(f[k + 1]) / L, val(s))); wrong(bump(0)); wrong(bump(1)); }
    if (p.kind === "chain") {
      assert.equal(p.D, lcm(fr(p.a).d, fr(p.b).d), "D = KPK"); const r = opNum(p.a, p.op, p.b, p.D); assert.ok(r > 0);
      assert.equal(Number(f[2] || 0) * p.D + Number(f[3]), r); wrong(bump(0)); wrong(bump(3));
      assert.equal(/penjumlahan|digabungkan|seluruhnya/.test(q.prompt), p.op === "+", q.prompt);
    }
    if (p.kind === "split") {
      const a = fr(p.a), b = fr(p.b); assert.equal(p.D, lcm(a.d, b.d)); assert.ok(a.w > 0 && b.w > 0);
      if (p.op === "-") assert.ok(a.n * b.d >= b.n * a.d, "pecahan tidak meminjam");
      const total = opNum(p.a, p.op, p.b, p.D); assert.equal(Number(f[4]) * p.D + Number(f[5]), total); wrong(bump(4)); wrong(bump(5)); wrong(bump(0));
    }
    if (p.kind === "shade") { assert.ok(p.answer <= p.model.d); wrong(Array.from({ length: p.answer + 1 }, (_, k) => k).join(",")); assert.ok(correct(q, swap(Array.from({ length: p.answer }, (_, k) => p.model.d - 1 - k).reverse().join(","))), "letak arsiran bebas");
      const fp = q.parts.find(x => x.kind === "frac"); assert.equal(val(fp.answer), p.answer / p.model.d); }
    if (p.kind === "tf") {
      p.statements.forEach(s0 => { const s = { ...s0, text: s0.text.includes("hasilnya") ? s0.text : s0.text.replace(/(\d) adalah (\d)/, "$1 = $2") }; const m = s.text.match(/((?:\d+ )?\d+\/\d+|\d+) ([+−]) ((?:\d+ )?\d+\/\d+)\s*=\s*((?:\d+ )?\d+\/\d+)/) ?? s.text.match(/hasilnya ((?:\d+ )?\d+\/\d+) adalah ((?:\d+ )?\d+\/\d+) ([+−]) ((?:\d+ )?\d+\/\d+)/);
        assert.ok(m, s.text); let ok;
        if (s.text.includes("hasilnya")) { const [, res, a, op, b] = m; ok = Math.abs(val(a) + (op === "+" ? 1 : -1) * val(b) - val(res)) < 1e-9; }
        else { const [, a, op, b, res] = m; ok = Math.abs(val(a) + (op === "+" ? 1 : -1) * val(b) - val(res)) < 1e-9; }
        assert.equal(ok, s.answer, s.text); });
      wrong(f.map((x, k) => (k ? x : x === "B" ? "S" : "B")).join("|"));
    }
    if (p.kind === "choice") {
      assert.ok(p.options.includes(p.answer)); wrong(p.options.find(o => o !== p.answer));
      if (/terbesar/.test(p.label)) assert.equal(p.answer, [...p.options].sort((a, b) => val(b) - val(a))[0]);
      if (/di antaranya/.test(p.label)) { const [lo, hi] = q.prompt.match(/(?:\d+ )?\d+\/\d+/g).map(val); assert.deepEqual(p.options.filter(o => val(o) > lo && val(o) < hi), [p.answer]); }
    }
  });
  // Pecahan pada gambar sesuai jawaban.
  if (q.scene?.type === "models") { const fs = q.parts.filter(p => p.kind === "frac"); if (fs.length === 2) q.scene.items.forEach((it, k) => assert.equal(val(fs[k].answer), it.model.k / it.model.d)); }
  if (q.scene?.type === "bars") q.scene.items.forEach(it => assert.ok(q.prompt.includes(it.value), it.value));
  if (q.scene?.type === "houses") q.scene.legs.forEach(l => assert.ok(q.prompt.includes(l)));
  if (q.scene?.type === "apples") assert.equal(q.scene.groups.reduce((a, g) => a + g.n, 0), q.scene.total);
  const fp = q.parts.find(p => p.kind === "frac" && /Jarak|Tali|Sisa gula|Selisih|Jumlah penduduk/.test(p.label));
  if (fp) { const ns = (q.prompt.match(/(?:\d+ )?\d+\/\d+/g) ?? []).map(val); const sum = ns.reduce((a, b) => a + b, 0); const diff = Math.abs(ns[0] - ns[1]); assert.ok(Math.abs(val(fp.answer) - (/Jarak|Jumlah/.test(fp.label) ? sum : diff)) < 1e-9, q.prompt); }
}
const pos = all.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 2, `posisi pilihan ${pos}`);
void cells;
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
