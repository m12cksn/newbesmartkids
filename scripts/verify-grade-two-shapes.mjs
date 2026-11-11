import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, P, corners, objSolid, curvedSolid, applyCuts, pieceCorners, cutShapes, sideName } from "../src/data/grade-two-shapes.ts";

assert.equal(topics.length, 3);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 8, 1: 8, 2: 8 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
for (let i = 1; i < 24; i++) assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + q.answer)).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 6, JSON.stringify(kinds));
// Interaksi nyata (tarik garis, ketuk, kelompokkan, potong) pada sebagian besar soal evaluasi.
const interactive = assessment.filter(q => q.parts.some(p => ["match", "check", "sort", "cut"].includes(p.kind))).length;
assert.ok(interactive >= 14, `interaktif ${interactive}`);

// Banyak sisi bangun.
const SIDES = { tri: 3, triRight: 3, triObtuse: 3, triThin: 3, sq: 4, rect: 4, rhombus: 4, para: 4, trap: 4, dart: 4, pent: 5, pentIrr: 5, house: 5, hex: 6, hexIrr: 6, hexL: 6, star: 10 };
for (const [k, n] of Object.entries(SIDES)) assert.equal(corners(P[k]), n, k);

// Posisi jawaban pilihan tidak selalu sama.
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 3, `posisi jawaban ${pos}`);

const figSides = f => f.t === "poly" ? corners(P[f.p]) : f.t === "curve" ? 0 : null;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const w = [...v];
    if (p.kind === "number") w[i] = String(p.answer + 1);
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); if (p.figs) assert.equal(p.figs.length, p.options.length); w[i] = p.options.find(o => o !== p.answer); }
    if (p.kind === "check") w[i] = p.answer.slice(1).join(",") || String(p.items.findIndex((_, k) => !p.answer.includes(k)));
    if (p.kind === "sort" || p.kind === "match") { const a = [...p.answer]; a[0] = (a[0] + 1) % (p.kind === "sort" ? p.bins.length : p.right.length); w[i] = a.join(","); }
    if (p.kind === "cut") { const pcs = applyCuts(p.shape, p.sample); assert.ok(pcs, q.prompt); w[i] = ""; }
    if (p.kind !== "cut") assert.ok(!correct(q, w.join(SEP)), `salah ditolak: ${q.prompt} ${i}`);
    // Kunci sesuai gambar.
    if (p.kind === "check" && p.label !== "Benda") {
      const test = /segi empat/.test(q.prompt) ? n => n === 4 : /segi banyak/.test(q.prompt) ? n => n > 0 : /lingkaran/.test(q.prompt) ? null : undefined;
      if (test) p.items.forEach((it, k) => assert.equal(test(figSides(it.fig)), p.answer.includes(k), `${q.prompt} ${it.name}`));
      if (test === null) p.items.forEach((it, k) => assert.equal(["circle", "circleSmall"].includes(it.fig.k), p.answer.includes(k), it.name));
    }
    if (p.kind === "check" && p.label === "Benda") p.items.forEach((it, k) => assert.equal(objSolid[it.fig.o] === "kubus", p.answer.includes(k), it.name));
    if (p.kind === "sort") p.items.forEach((it, k) => {
      const bin = p.bins[p.answer[k]];
      if (it.fig.t === "obj") {
        const s = objSolid[it.fig.o];
        if (p.bins[0] === "Permukaan datar") assert.equal(bin, s && curvedSolid(s) ? "Permukaan lengkung" : "Permukaan datar", it.name);
        else if (p.bins[0] === "Bangun datar") assert.equal(bin, s ? "Bangun ruang" : "Bangun datar", it.name);
        else assert.equal(bin.toLowerCase(), s, it.name);
      } else {
        const n = figSides(it.fig);
        if (p.bins[0] === "Segi banyak") assert.equal(bin, n ? "Segi banyak" : "Bentuk lengkung", it.name);
        else assert.equal(bin, sideName(n), it.name);
      }
    });
    if (p.kind === "match" && p.right.every(r => !r.fig) && /Segitiga|sisi|kurva/.test(p.right.map(r => r.name).join())) p.left.forEach((it, k) => {
      const n = figSides(it.fig), name = p.right[p.answer[k]].name;
      if (name.startsWith("Mempunyai")) assert.equal(name, n ? `Mempunyai ${n} sisi` : "Mempunyai satu kurva", it.name);
      else assert.equal(name, n ? sideName(n) : "Bentuk lengkung", it.name);
    });
    // Pasangan susun/urai: luas potongan = luas hasil.
    if (p.kind === "match" && p.left.every(l => l.fig.t === "pieces") && p.right.every(r => r.fig?.t === "pieces")) {
      const area = f => f.list.reduce((s, pc) => s + Math.abs(pc.pts.reduce((a, pt, k) => { const n = pc.pts[(k + 1) % pc.pts.length]; return a + pt[0] * n[1] - n[0] * pt[1]; }, 0)) / 2, 0);
      p.left.forEach((l, k) => assert.equal(area(l.fig), area(p.right[p.answer[k]].fig), `${q.prompt} ${l.name}`));
      assert.equal(new Set(p.answer).size, p.answer.length, "hasil dipakai sekali");
    }
  });
  if (q.fig?.t === "obj" && q.parts[0].kind === "choice" && q.parts[0].label.startsWith("Nama bangun ruang")) assert.equal(q.parts[0].answer.toLowerCase(), objSolid[q.fig.o]);
  if (q.fig?.t === "stack") { const n = q.fig.cubes.length; assert.equal(String(n), q.answer, q.prompt); for (const [x, y, z] of q.fig.cubes) if (z > 0) assert.ok(q.fig.cubes.some(c => c[0] === x && c[1] === y && c[2] === z - 1), "balok melayang"); }
  if (q.fig?.t === "poly" && q.parts[0].kind === "number") assert.equal(corners(P[q.fig.p]), q.parts[0].answer);
}
// Mesin potong: garis di tepi atau di luar ditolak; garis yang menghasilkan segi lima ditolak oleh soal.
assert.equal(applyCuts("persegi", [[0, 1]]), null);
assert.equal(applyCuts("persegi", [[0, 2]]), null);
const rect = assessment.find(q => q.parts[0].kind === "cut" && q.parts[0].shape === "persegiPanjang");
assert.ok(!correct(rect, "1-3"), "tengah atas ke tengah kanan menghasilkan segi lima");
assert.ok(correct(rect, "0-4") && correct(rect, "0-5") && correct(rect, "1-5"));
const hex = assessment.find(q => q.parts[0].kind === "cut" && q.parts[0].shape === "segiEnam");
assert.ok(!correct(hex, "1-7") && correct(hex, "2-8"));
const pent = assessment.find(q => q.parts[0].kind === "cut" && q.parts[0].shape === "segiLima");
assert.ok(correct(pent, "2-6,2-8") && !correct(pent, "0-4"));
for (const k of Object.keys(cutShapes)) assert.equal(pieceCorners(k, cutShapes[k].nodes.map((_, i) => i)), { persegiPanjang: 4, persegi: 4, pitaPanjang: 4, segiLima: 5, segiEnam: 6, rumah: 5 }[k], k);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, ${interactive} soal interaktif, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
