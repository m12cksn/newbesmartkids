import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, things, tilt, panWeight, todOf, minutes } from "../src/data/grade-two-measurement.ts";

assert.equal(topics.length, 2);
assert.deepEqual(practice.map(p => p.length), [4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 12, 1: 12 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
for (let i = 1; i < 24; i++) assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + q.answer)).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 7, JSON.stringify(kinds));
const interactive = assessment.filter(q => q.parts.some(p => ["blanks", "pairs", "extreme", "order", "sort", "setClock"].includes(p.kind))).length;
assert.ok(interactive >= 13, `interaktif ${interactive}`);
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice" && p.options.length > 2 && !["pagi", "siang"].includes(p.options[0])).map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 3, `posisi ${pos}`);

const g = item => things[item.fig.o].g;
const word = s => (s > 0 ? "lebih berat" : s < 0 ? "lebih ringan" : "sama berat");
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  // Timbangan: soal "Berat 1 X = n Y" seimbang dan cocok dengan bobot.
  const bals = q.fig?.t === "balance" ? [q.fig] : q.fig?.t === "balances" ? q.fig.list : [];
  const w = q.fig?.w;
  q.parts.forEach((p, i) => {
    const x = [...v];
    if (p.kind === "number" || p.kind === "setClock") x[i] = String(p.answer + 1);
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); if (p.figs) assert.equal(p.figs.length, p.options.length); x[i] = p.options.find(o => o !== p.answer); }
    if (p.kind === "blanks") { p.sentences.forEach(s => assert.ok(s.options.includes(s.answer), s.text)); x[i] = p.sentences.map((s, k) => k === 0 ? s.options.find(o => o !== s.answer) : s.answer).join("|"); }
    if (p.kind === "pairs") x[i] = p.answer.map((a, k) => k === 0 ? 1 - a : a).join(",");
    if (p.kind === "extreme") x[i] = `${p.light},${p.heavy}`;
    if (p.kind === "order" || p.kind === "sort") { const a = [...p.answer]; if (p.kind === "order") [a[0], a[1]] = [a[1], a[0]]; else a[0] = (a[0] + 1) % p.bins.length; x[i] = a.join(","); }
    assert.ok(!correct(q, x.join(SEP)), `salah ditolak: ${q.prompt} ${i}`);

    // Pasangan benda: yang dipilih memang lebih berat / kegiatan memang lebih lama.
    if (p.kind === "pairs") p.pairs.forEach(([a, b], k) => { const val = it => it.fig.t === "thing" ? g(it) : minutes[it.fig.a]; assert.equal(val(p.answer[k] === 0 ? a : b) > val(p.answer[k] === 0 ? b : a), true, `${q.prompt} ${a.name}/${b.name}`); });
    if (p.kind === "extreme") { const gs = p.items.map(g); assert.equal(gs.indexOf(Math.max(...gs)), p.heavy); assert.equal(gs.indexOf(Math.min(...gs)), p.light); }
    if (p.kind === "choice" && p.figs?.[0]?.t === "thing") { const gs = p.figs.map(f => things[f.o].g); const pick = /ringan/.test(q.prompt) ? Math.min(...gs) : Math.max(...gs); assert.equal(p.options[gs.indexOf(pick)], p.answer); }
    if (p.kind === "order" && p.items[0].fig.t === "clock") { const h24 = it => ({ pagi: 0, siang: 12, sore: 12, malam: 12 }[it.fig.tod]) + (it.fig.h % 12) + (it.fig.tod === "siang" && it.fig.h === 12 ? 0 : 0); const hs = p.answer.map(k => h24(p.items[k])); assert.deepEqual(hs, [...hs].sort((a, b) => a - b), q.prompt); }
    if (p.kind === "order" && p.items[0].fig.t === "thing") { const ws = p.answer.map(k => w[p.items[k].fig.o]); assert.deepEqual(ws, [...ws].sort((a, b) => a - b), q.prompt); }
    if (p.kind === "sort" && p.items[0].fig.t === "clock") p.items.forEach((it, k) => assert.equal(p.bins[p.answer[k]].toLowerCase(), it.fig.tod, it.name));
    if (p.kind === "number" && /^Berat (\d+) (\S+) =$/.test(p.label)) {
      const [, n, name] = p.label.match(/^Berat (\d+) (\S+) =$/);
      const key = Object.keys(w).find(k => things[k].name.toLowerCase() === name.toLowerCase());
      const unit = Object.keys(w).find(k => things[k].name.toLowerCase().startsWith(p.suffix.split(" ")[0]));
      assert.ok(key && unit, `${p.label} ${p.suffix}`);
      assert.equal(Number(n) * w[key], p.answer * w[unit], `${p.label} ${p.answer} ${p.suffix}`);
    }
    if (p.kind === "blanks" && bals.length) p.sentences.forEach(s => {
      const m = s.text.match(/^(\S+) … (?:dari|dengan) (\S+)\.$/);
      if (!m) return;
      const key = n => Object.keys(w).find(k => things[k].name.toLowerCase() === n.toLowerCase());
      if (m[2] === "kol" && /dan/.test(s.text)) return;
      assert.equal(word(Math.sign(w[key(m[1])] - w[key(m[2])])), s.answer, s.text);
    });
  });
  // Semua timbangan miring sesuai bobot; soal satuan seimbang.
  bals.forEach(b => { const t = tilt(b, w); if (q.parts.some(p => p.kind === "number" && /^Berat/.test(p.label))) assert.equal(t, 0, q.prompt); assert.ok(panWeight(b.left, w) > 0 && panWeight(b.right, w) > 0); });
  if (q.fig?.t === "clock" && q.parts[0].kind === "number") { assert.equal(q.parts[0].answer, q.fig.h); assert.equal(q.parts[1].answer, q.fig.tod); }
  if (q.fig?.t === "digital") assert.equal(q.parts[0].figs[q.parts[0].options.indexOf(q.parts[0].answer)].h, q.fig.h);
}
assert.equal(todOf(5), "pagi"); assert.equal(todOf(12), "siang"); assert.equal(todOf(16), "sore"); assert.equal(todOf(21), "malam");
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, ${interactive} interaktif, jenis ${JSON.stringify(kinds)}, posisi ${pos.join("")}.`);
