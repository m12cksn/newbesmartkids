import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, canForm, interiorAngles, triAngleKind, triSideKind, quadNames, bestName, quadInfo, mirrorAxes, rotationOrder, shapes as S } from "../src/data/grade-five-shape-traits.ts";

assert.equal(topics.length, 2);
assert.deepEqual(practice.map(p => p.length), [4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 12, 1: 12 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 7, JSON.stringify(kinds));

// Geometri dasar sesuai buku.
const sym = (pts) => [mirrorAxes(pts), rotationOrder(pts)];
assert.deepEqual(sym(S.equi), [3, 3]); assert.deepEqual(sym(S.iso), [1, 1]); assert.deepEqual(sym(S.scal), [0, 1]);
assert.deepEqual(sym(S.rect), [2, 2]); assert.deepEqual(sym(S.square), [4, 4]); assert.deepEqual(sym(S.rhombus), [2, 2]); assert.deepEqual(sym(S.par), [0, 2]); assert.deepEqual(sym(S.kite), [1, 1]); assert.deepEqual(sym(S.trapIso), [1, 1]);
assert.equal(bestName(S.par), "Jajargenjang"); assert.equal(bestName(S.rect), "Persegi panjang"); assert.equal(bestName(S.rhombus), "Belah ketupat"); assert.equal(bestName(S.square), "Persegi");
assert.equal(bestName(S.kite), "Layang-layang"); assert.equal(bestName(S.trapIso), "Trapesium sama kaki"); assert.equal(bestName(S.trapRight), "Trapesium siku-siku"); assert.equal(bestName(S.trapGen), "Trapesium"); assert.equal(bestName(S.quadGen), "Segi empat");
assert.ok(quadNames(S.square).includes("Persegi panjang") && quadNames(S.square).includes("Belah ketupat") && quadNames(S.square).includes("Layang-layang"));
assert.ok(quadNames(S.rhombus).includes("Jajargenjang") && quadNames(S.rhombus).includes("Layang-layang"));
assert.ok(!quadNames(S.par).includes("Trapesium sama kaki") && quadNames(S.par).includes("Trapesium"));
assert.equal(quadInfo(S.kite).rights, 0); assert.equal(quadInfo(S.par).rights, 0); assert.equal(quadInfo(S.trapGen).axes, 0);
for (const [k, pts] of Object.entries(S)) interiorAngles(pts).forEach(a => assert.ok(a > 0 && a < 360, k));
assert.equal(triAngleKind(S.acute), "Lancip"); assert.equal(triAngleKind(S.right), "Siku-siku"); assert.equal(triAngleKind(S.obtuse), "Tumpul"); assert.equal(triAngleKind(S.obtuseIso), "Tumpul");
assert.equal(triSideKind(S.equi), "Sama sisi"); assert.equal(triSideKind(S.iso), "Sama kaki"); assert.equal(triSideKind(S.scal), "Sembarang"); assert.equal(triSideKind(S.obtuse), "Sembarang");

const nums = s => (s.match(/\d+/g) ?? []).map(Number);
const quadNameOK = (pts, name) => name === "Segi empat sembarang" ? bestName(pts) === "Segi empat" : bestName(pts) === name;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "straws") { f.forEach((_, k) => { const g = [...f]; g[k] = k % 4 === 0 ? (g[k] === "Bisa" ? "Tidak" : "Bisa") : String(Number(g[k]) + 1); wrong(g.join("|")); }); }
    if (p.kind === "classify") p.rows.forEach((r, k) => {
      const a = p.answers[k], pts = r.fig.pts;
      if (p.options.includes("Lancip")) assert.equal(a, triAngleKind(pts), r.text);
      else if (p.options.includes("Sama sisi")) assert.equal(a, triSideKind(pts), r.text);
      else assert.ok(quadNameOK(pts, a), `${r.text}: ${a} vs ${bestName(pts)}`);
      const g = [...f]; g[k] = p.options.find(o => o !== a); wrong(g.join("|"));
    });
    if (p.kind === "select") {
      const pred = /^Segi empat$/.test(p.label) ? fg => !fg.circle && fg.pts.length === 4 : fg => !fg.circle && quadNames(fg.pts).includes(p.label);
      assert.deepEqual(p.figs.flatMap((fg, k) => (pred(fg) ? [k] : [])), p.answer, p.label);
      wrong(p.answer.slice(1).join(",")); const extra = p.figs.map((_, k) => k).find(k => !p.answer.includes(k)); wrong([...p.answer, extra].sort((a, b) => a - b).join(","));
    }
    if (p.kind === "number") {
      wrong(String(p.answer + 1));
      const sc = q.scene?.fig;
      if (sc?.angleLabels) { const known = sc.angleLabels.filter(t => t && t !== "?").map(t => Number(t.replace("°", ""))); const unknown = sc.angleLabels.filter(t => t === "?").length; assert.equal(p.answer * unknown + known.reduce((a, b) => a + b, 0), 180, q.prompt); interiorAngles(sc.pts).forEach((a, k) => { const t = sc.angleLabels[k]; assert.ok(Math.abs(a - (t === "?" ? p.answer : Number(t.replace("°", "")))) < 0.5, `gambar sudut ${q.prompt}`); }); }
      if (/simetri lipat/.test(p.label) && sc) assert.equal(p.answer, mirrorAxes(sc.pts));
      if (/sudut siku-siku/.test(p.label) && sc) assert.equal(p.answer, quadInfo(sc.pts).rights);
    }
    if (p.kind === "items") {
      p.items.forEach((it, k) => { const g = [...f]; g[k] = String(it.answer + 1); wrong(g.join("|")); });
      const sc = q.scene;
      if (sc?.type === "figs") p.items.forEach(it => { const name = it.label.split(",")[0], fig = sc.items.find(x => x.label === name).fig; assert.equal(it.answer, /putar/.test(it.label) ? rotationOrder(fig.pts) : mirrorAxes(fig.pts), it.label); });
      if (sc?.type === "fig") { assert.equal(p.items[1].answer, mirrorAxes(sc.fig.pts)); assert.equal(p.items[2].answer, rotationOrder(sc.fig.pts)); interiorAngles(sc.fig.pts).forEach(a => assert.ok(Math.abs(a - p.items[0].answer) < 0.5)); }
    }
    if (p.kind === "choice") {
      assert.ok(p.options.includes(p.answer)); wrong(p.options.find(o => o !== p.answer));
      if (/Sedotan ketiga/.test(p.label)) { const [a, b] = nums(q.prompt); assert.deepEqual(p.options.filter(o => canForm(a, b, nums(o)[0])), [p.answer]); }
      if (/Jenis trapesium/.test(p.label)) assert.equal(p.answer, bestName(q.scene.fig.pts));
      if (/Nama segitiga/.test(p.label)) { const pts = q.scene.fig.pts; assert.equal(p.answer, `Segitiga ${triAngleKind(pts).toLowerCase()} ${triSideKind(pts).toLowerCase()}`); }
    }
    if (p.kind === "tf") {
      f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
      p.statements.forEach(s => { const m = s.text.match(/(\d+) cm, (\d+) cm, dan (\d+) cm dapat membentuk segitiga/); if (m) assert.equal(s.answer, canForm(+m[1], +m[2], +m[3])); });
      if (q.scene?.type === "fig" && p.labels) { const info = quadInfo(q.scene.fig.pts); p.statements.forEach(s => {
        if (/berhadapan sejajar/.test(s.text)) assert.equal(s.answer, info.parallelPairs === 2);
        if (/Semua sudutnya siku-siku/.test(s.text)) assert.equal(s.answer, info.rights === 4);
        if (/sumbu simetri/.test(s.text)) assert.equal(s.answer, info.axes > 0); }); }
    }
  });
}
const pos = all.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 3, `posisi pilihan ${pos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
