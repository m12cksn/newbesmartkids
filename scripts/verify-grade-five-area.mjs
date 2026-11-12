import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, shoelace, areaOf, fieldCount } from "../src/data/grade-five-area.ts";

assert.equal(topics.length, 4);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 6, 1: 6, 2: 6, 3: 6 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) {
  assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
  assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level], `tingkat soal ${i + 1}`);
}
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 6 && kinds.compose >= 6, JSON.stringify(kinds));
const nums = s => (s.match(/\d+/g) ?? []).map(Number);

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), sc = q.scene;
  const total = sc ? sc.polys.filter(p => !p.label).reduce((a, p) => a + shoelace(p.pts), 0) : null;
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP), f = fields(p);
    const bump = k => f.map((x, j) => (j === k ? String(Number(x) + 1) : x)).join("|");
    if (p.kind === "number" || p.kind === "items" || p.kind === "formula") f.forEach((_, k) => assert.ok(!correct(q, swap(bump(k))), `kotak ${k} ditolak: ${q.prompt}`));
    if (p.kind === "formula") {
      assert.ok(correct(q, swap((p.shape === "trap" ? [f[1], f[0], f[2], f[3]] : [f[1], f[0], ...f.slice(2)]).join("|"))), "urutan bebas");
      assert.ok(Number.isInteger(areaOf(p.shape, p.vals)));
      if (sc) { const n = nums(sc.texts.map(t => t.text).join(" ")); p.vals.forEach(x => assert.ok(n.includes(x), `ukuran ${x} tampil`)); assert.equal(shoelace(sc.polys[0].pts), areaOf(p.shape, p.vals), "gambar sesuai rumus"); }
    }
    if (p.kind === "number" && total !== null && /Luas|ubin/.test(p.label) && !sc.polys.some(x => x.label)) assert.equal(p.answer, total, q.prompt);
    if (p.kind === "items" && /gabungan/i.test(p.items.at(-1).label)) { const it = p.items; assert.equal(it.at(-1).answer, it.slice(0, -1).reduce((a, x) => a + x.answer, 0)); if (total !== null) assert.equal(it.at(-1).answer, total, q.prompt); }
    if (p.kind === "items" && /^Lebar/.test(p.items[0].label)) { const [K, pj] = nums(q.prompt); assert.equal(2 * (pj + p.items[0].answer), K); assert.equal(p.items[1].answer, pj * p.items[0].answer); }
    if (p.kind === "items" && /^Sisi/.test(p.items[0].label)) { const [K] = nums(q.prompt); assert.equal(p.items[0].answer * 4, K); assert.equal(p.items[1].answer, p.items[0].answer ** 2); }
    if (p.kind === "items" && sc && sc.polys.some(x => x.label)) p.items.forEach(it => { const room = sc.polys.find(x => x.label && it.label.startsWith(x.label.replace("K. ", "Kamar ").split(" ")[0])); if (room) assert.equal(shoelace(room.pts), it.answer, it.label); });
    if (p.kind === "compose") {
      assert.ok(p.versions.length >= 2, "minimal dua versi garis bantu");
      const out = shoelace(p.outline);
      p.versions.forEach((ver, vi) => {
        assert.ok(ver.pieces.length >= 3, `versi ${ver.name} minimal tiga bangun: ${q.prompt}`);
        ver.pieces.forEach(pc => { assert.ok(Math.abs(shoelace(pc.pts) - areaOf(pc.shape, pc.vals)) < 1e-9, `${ver.name} ${pc.label} gambar sesuai ukuran`); assert.ok(Number.isInteger(areaOf(pc.shape, pc.vals))); });
        const areas = ver.pieces.map(pc => areaOf(pc.shape, pc.vals)), tot = areas.reduce((a, x) => a + x, 0);
        assert.equal(tot, out, `${ver.name} jumlah = luas bangun: ${q.prompt}`);
        const n = fieldCount(p) - 2, g = [String(vi), ...Array.from({ length: n }, (_, k) => (k < areas.length ? String(areas[k]) : "")), String(tot)];
        assert.ok(correct(q, swap(g.join("|"))), `${ver.name} diterima`);
        const w1 = [...g]; w1[1] = String(areas[0] + 1); assert.ok(!correct(q, swap(w1.join("|"))));
        const w2 = [...g]; w2[g.length - 1] = String(tot + 1); assert.ok(!correct(q, swap(w2.join("|"))));
      });
      const a0 = p.versions[0].pieces.map(pc => areaOf(pc.shape, pc.vals)), a1 = p.versions[1].pieces.map(pc => areaOf(pc.shape, pc.vals));
      if (a0.join() !== a1.slice(0, a0.length).join()) { const n = fieldCount(p) - 2; const g = ["1", ...Array.from({ length: n }, (_, k) => (k < a0.length ? String(a0[k]) : "")), String(out)]; assert.ok(!correct(q, swap(g.join("|"))), "isian versi lain ditolak"); }
      assert.ok(!ready(q, swap("")), "harus menampilkan garis bantu");
    }
    if (p.kind === "pairs") {
      assert.equal(2 * (p.example[0] + p.example[1]), p.K);
      wrongPairs: { const g = [...f]; g[0] = String(p.example[0]); g[1] = String(p.example[1]); g[3] = String(p.example[0] * p.example[1]); assert.ok(!correct(q, swap(g.join("|"))), "sama dengan contoh ditolak"); }
      const g2 = [...f]; g2[4] = g2[0]; g2[5] = g2[1]; g2[7] = g2[3]; assert.ok(!correct(q, swap(g2.join("|"))), "baris kembar ditolak");
      const g3 = [...f]; [g3[0], g3[1]] = [g3[1], g3[0]]; assert.ok(correct(q, swap(g3.join("|"))), "panjang/lebar boleh ditukar");
      const g4 = [...f]; g4[3] = String(Number(g4[3]) + 1); assert.ok(!correct(q, swap(g4.join("|"))));
    }
    if (p.kind === "choice") {
      assert.ok(p.options.includes(p.answer)); assert.ok(!correct(q, swap(p.options.find(o => o !== p.answer))));
      const dims = p.options.map(o => nums(o));
      if (/terluas/.test(p.label)) { const a = dims.map(([x, y]) => x * y); assert.equal(new Set(dims.map(([x, y]) => x + y)).size, 1); assert.equal(p.options[a.indexOf(Math.max(...a))], p.answer); }
      if (/kebun/.test(p.label)) { const k = dims.map(([x, y]) => x + y); assert.equal(new Set(dims.map(([x, y]) => x * y)).size, 1); assert.equal(p.options[k.indexOf(Math.min(...k))], p.answer); }
      if (/Ruangan/.test(p.label)) { const a = p.options.map(o => shoelace(sc.polys.find(x => x.label === o).pts)); assert.equal(p.options[a.indexOf(Math.max(...a))], p.answer); assert.equal(a.filter(x => x === Math.max(...a)).length, 1); }
    }
    if (p.kind === "tf") { f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; assert.ok(!correct(q, swap(g.join("|")))); }); }
  });
}
const pos = all.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 2, `posisi pilihan ${pos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
