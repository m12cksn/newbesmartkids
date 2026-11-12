import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, clockAngle, kindOf, cornerAngles, rightCorners, clockOk } from "../src/data/grade-five-angles.ts";

assert.equal(topics.length, 4);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 6, 1: 6, 2: 6, 3: 6 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 8, JSON.stringify(kinds));

// Dasar.
assert.equal(clockAngle(8), 120); assert.equal(clockAngle(3), 90); assert.equal(clockAngle(11), 30); assert.equal(clockAngle(4, 30), 45);
assert.deepEqual(cornerAngles([[0, 0], [4, 0], [4, 3], [0, 3]]), [90, 90, 90, 90]);
assert.equal(cornerAngles([[0, 0], [3, 0], [3, 3], [6, 3], [6, 6], [0, 6]])[2], 270);
const nums = s => (s.match(/\d+/g) ?? []).map(Number);

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), sc = q.scene;
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "number") {
      wrong(String(p.answer + 1));
      if (sc?.type === "angle" && sc.tool) { assert.equal(p.answer, sc.angle.deg); wrong(String(180 - p.answer)); }
      if (sc?.type === "clock" && /terkecil/.test(q.prompt) && !/refleks/.test(p.label)) assert.equal(p.answer, clockAngle(sc.h, sc.m ?? 0));
      if (/refleks/.test(p.label)) assert.equal(p.answer, 360 - clockAngle(sc.h));
      if (/sudut siku-siku/.test(p.label)) { assert.equal(sc.type, "shapes"); assert.equal(p.answer, rightCorners(sc.items[0].pts).length); }
      if (/Besarnya/.test(p.label)) { const hs = (q.prompt.match(/(\d+)\.00/g) ?? []).map(t => Number(t.match(/\d+/)[0])); assert.equal(p.answer, Math.max(...hs.map(h => clockAngle(h)))); }
      if (/Besar sudutnya/.test(p.label)) assert.equal(p.answer, Math.max(...sc.items.map(f => f.deg)));
    }
    if (p.kind === "items") {
      p.items.forEach((it, k) => { const g = [...f]; g[k] = String(it.answer + 1); wrong(g.join("|")); });
      if (sc?.type === "shapes" && /siku-siku/.test(q.prompt)) p.items.forEach((it, k) => assert.equal(it.answer, rightCorners(sc.items[k].pts).length));
      if (sc?.type === "shapes" && /banyaknya sudut/.test(q.prompt)) p.items.forEach((it, k) => assert.equal(it.answer, sc.items[k].pts.length));
      if (sc?.type === "tiles") { assert.equal(p.items[0].answer, 360 - 90 - 2 * 108); assert.equal(p.items[1].answer, 360 - 3 * 108); }
    }
    if (p.kind === "classify") {
      assert.equal(p.rows.length, p.answers.length);
      p.rows.forEach((r, k) => {
        assert.ok(p.options.includes(p.answers[k]));
        if (r.angle) assert.equal(p.answers[k], kindOf(r.angle.deg), r.text);
        if (r.clock) assert.equal(p.answers[k], kindOf(clockAngle(...r.clock)), r.text);
        if (!r.angle && !r.clock) { const n = nums(r.text); const want = n.length === 1 ? kindOf(n[0]) : n[0] === 0 ? "Lancip" : n[0] === 90 ? "Tumpul" : "Refleks"; assert.equal(p.answers[k], want, r.text); }
        const g = [...f]; g[k] = p.options.find(o => o !== p.answers[k]); wrong(g.join("|"));
      });
    }
    if (p.kind === "corners") { const rc = rightCorners(p.shape.pts); assert.ok(rc.length > 0); wrong(rc.slice(1).join(",")); if (rc.length < p.shape.pts.length) wrong([...rc, ...p.shape.pts.map((_, k) => k).filter(k => !rc.includes(k)).slice(0, 1)].sort((a, b) => a - b).join(",")); }
    if (p.kind === "draw") { assert.equal(p.target, nums(q.prompt)[0]); wrong(String(p.target + 1)); wrong(String(180 - p.target)); }
    if (p.kind === "clockSet") {
      const ok = Array.from({ length: 12 }, (_, k) => k + 1).filter(h => clockOk(p, h)); assert.ok(ok.length >= 1);
      ok.forEach(h => assert.ok(correct(q, swap(String(h))))); p.avoid.forEach(h => { assert.equal(kindOf(clockAngle(h)), p.target, "contoh sejenis"); wrong(String(h)); });
      Array.from({ length: 12 }, (_, k) => k + 1).filter(h => kindOf(clockAngle(h)) !== p.target).forEach(h => wrong(String(h)));
    }
    if (p.kind === "choice") {
      assert.ok(p.options.includes(p.answer)); wrong(p.options.find(o => o !== p.answer));
      if (p.figs) { const want = nums(p.label)[0]; assert.deepEqual(p.figs.flatMap((fg, k) => (fg.deg === want ? [p.options[k]] : [])), [p.answer]); }
      if (sc?.type === "fans") { const ds = sc.items.map(x => x.deg); assert.equal(sc.items[ds.indexOf(Math.max(...ds))].label, p.answer); assert.equal(new Set(ds).size, ds.length); }
      if (sc?.type === "shapes" && /tepat 3/.test(q.prompt)) assert.deepEqual(sc.items.flatMap((s, k) => (rightCorners(s.pts).length === 3 ? [p.options[k]] : [])), [p.answer]);
      if (/Paling besar/.test(p.label)) { const a = p.options.map(o => clockAngle(nums(o)[0])); assert.equal(p.options[a.indexOf(Math.max(...a))], p.answer); }
    }
    if (p.kind === "order") { wrong([...p.answer].reverse().join(";")); assert.notDeepEqual(p.options, p.answer, "pilihan diacak"); }
    if (p.kind === "tf") {
      f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
      if (sc?.type === "roads") {
        const R = sc.roads, ang = R.map((r, k) => (R[(k + 1) % R.length].dir - r.dir + 360) % 360);
        assert.equal(ang.reduce((a, b) => a + b, 0), 360);
        const pair = (a, b) => { const ia = R.findIndex(r => r.name === a), ib = R.findIndex(r => r.name === b); return ib === (ia + 1) % R.length ? ang[ia] : ang[ib]; };
        assert.equal(p.statements[0].answer, pair("Jalan Nuri", "Jalan Jalak") === Math.max(...ang));
        assert.equal(p.statements[1].answer, !ang.includes(90));
        assert.equal(p.statements[2].answer, pair("Jalan Jalak", "Jalan Ketilang") === 135);
      }
    }
  });
}
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, jenis ${JSON.stringify(kinds)}.`);
