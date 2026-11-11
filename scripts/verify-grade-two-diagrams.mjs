import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, things } from "../src/data/grade-two-diagrams.ts";

assert.equal(topics.length, 2);
assert.deepEqual(practice.map(p => p.length), [4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 12, 1: 12 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) {
  assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
  assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level], `tingkat soal ${i + 1}`);
}
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + q.answer)).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 7, JSON.stringify(kinds));
const interactive = assessment.filter(q => q.parts.some(p => ["tallyBuild", "picBuild", "pair", "pick", "choice"].includes(p.kind))).length;
assert.ok(interactive >= 12, `soal dengan aksi selain isian angka: ${interactive}`);

const sum = list => list.reduce((a, b) => a + b, 0);
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  const s = q.scene, data = s && (s.type === "tally" || s.type === "picto") ? s.rows : undefined;
  const by = name => { const r = data.find(x => x.name === name); assert.ok(r, `baris ${name}`); return r.n; };
  q.parts.forEach((p, i) => {
    const w = [...v];
    if (p.kind === "number") w[i] = String(p.answer + 1);
    if (p.kind === "tallyFill" || p.kind === "picBuild") w[i] = p.rows.map((r, k) => r.n + (k === 0 ? 1 : 0)).join("|");
    if (p.kind === "tallyBuild") { w[i] = p.rows.map((r, k) => `${r.n + (k === 1 ? 1 : 0)},${r.n}`).join("|"); assert.ok(!correct(q, w.join(SEP))); w[i] = p.rows.map((r, k) => `${r.n},${r.n - (k === 2 ? 1 : 0)}`).join("|"); }
    if (p.kind === "pick" || p.kind === "choice") { assert.ok(p.options.includes(p.answer)); w[i] = p.options.find(o => o !== p.answer); }
    if (p.kind === "pair") { assert.ok(p.answer.every(a => p.options.includes(a))); w[i] = [p.answer[0], p.options.find(o => !p.answer.includes(o))].join("|"); assert.ok(correct(q, v.map((x, j) => j === i ? [...p.answer].reverse().join("|") : x).join(SEP)), "pasangan urutan bebas"); }
    assert.ok(!correct(q, w.join(SEP)), `salah ditolak: ${q.prompt} ${i}`);
    if ("rows" in p) p.rows.forEach(r => assert.ok(r.n > 0 && r.n <= 15, r.name));

    // Kunci sesuai data pada gambar.
    if (data && p.kind === "pick") {
      const L = p.label, max = Math.max(...data.map(r => r.n)), min = Math.min(...data.map(r => r.n));
      if (/paling banyak|paling disukai adalah/.test(L)) { assert.equal(by(p.answer), max); assert.equal(data.filter(r => r.n === max).length, 1); }
      else if (/paling sedikit/.test(L)) { assert.equal(by(p.answer), min); assert.equal(data.filter(r => r.n === min).length, 1); }
      else if (/lebih banyak (disukai daripada|dari) (buah|bunga) (\w+)/.test(L)) { const ref = L.match(/(?:buah|bunga) (\w+)\.$/)[1]; const base = by(ref[0].toUpperCase() + ref.slice(1)); const more = data.filter(r => r.n > base); assert.deepEqual(more.map(r => r.name), [p.answer], L); }
      else if (/(\d+) anak lagi menyukai warna (\w+).*sama banyak/.test(L)) { const [, k, c] = L.match(/(\d+) anak lagi menyukai warna (\w+)/); const target = by(c[0].toUpperCase() + c.slice(1)) + Number(k); assert.deepEqual(data.filter(r => r.n === target).map(r => r.name), [p.answer], L); }
      else assert.fail(`pick tanpa pemeriksaan: ${L}`);
    }
    if (data && p.kind === "pair") { assert.equal(by(p.answer[0]), by(p.answer[1])); const counts = tally(data, r => r.n); assert.equal(Object.values(counts).filter(c => c > 1).length, 1, "hanya satu pasangan sama"); }
    if (data && p.kind === "number") {
      const L = p.label.toLowerCase(), named = data.filter(r => L.includes(r.name.toLowerCase()) || (r.thing && L.includes(things[r.thing].toLowerCase())));
      const rel = L.match(/(\w[\w -]*?) … (lebihnya|kurangnya) dari/);
      if (/^ada … |berapa siswa|^di peternakan ada/.test(L)) { assert.equal(named.length, 1, L); assert.equal(p.answer, named[0].n, L); }
      else if (/lebih dari dua putaran/.test(L)) assert.equal(p.answer, by("3") + by("4"));
      else if (/kurang dari tiga putaran/.test(L)) assert.equal(p.answer, by("1") + by("2"));
      else if (/(\d) putaran … lebihnya dari siswa yang berlari (\d) putaran/.test(L)) { const [, a, b] = L.match(/(\d) putaran … lebihnya dari siswa yang berlari (\d) putaran/); assert.equal(p.answer, by(a) - by(b)); }
      else if (/semua|semuanya/.test(L)) assert.equal(p.answer, sum(data.map(r => r.n)));
      else if (/^jumlah/.test(L)) { assert.equal(named.length, 2, L); assert.equal(p.answer, named[0].n + named[1].n); }
      else if (rel) {
        assert.equal(named.length, 2, L);
        const [first, second] = [...named].sort((a, b) => L.indexOf(a.name.toLowerCase().split(" ").pop()) - L.indexOf(b.name.toLowerCase().split(" ").pop()));
        const sold = L.match(/jika (\d+) ayam dijual/); const a = first.n - (sold && first.name === "Ayam" ? Number(sold[1]) : 0);
        assert.equal(p.answer, rel[2] === "lebihnya" ? a - second.n : second.n - a, L); assert.ok(p.answer > 0);
      } else assert.fail(`angka tanpa pemeriksaan: ${L}`);
    }
    if (p.kind === "tallyBuild" || p.kind === "picBuild") {
      if (s?.type === "scatter") assert.deepEqual(p.rows.map(r => [r.thing, r.n]), s.items.map(x => [x.thing, x.n]), q.prompt);
      if (s?.type === "list") {
        const known = {};
        p.rows.forEach((r, k) => {
          const line = s.lines[k];
          const plain = line.match(/^Ada (\d+)/); if (plain) known[k] = Number(plain[1]);
          const more = line.match(/(\d+) (lebihnya|kurangnya) dari anak yang (.+)\.$/); if (more) { const j = p.rows.findIndex(x => x.name.toLowerCase().includes(more[3].split(" ").pop())); known[k] = known[j] + (more[2] === "lebihnya" ? 1 : -1) * Number(more[1]); }
          if (/sama banyak dengan anak yang naik sepeda/.test(line)) known[k] = known[0];
          assert.equal(r.n, known[k], line);
        });
      }
    }
    if (p.kind === "choice" && p.tallies) assert.ok(p.options.every(o => /^\d+$/.test(o)) && q.prompt.includes(p.answer));
    if (p.kind === "choice" && p.things) {
      assert.equal(s?.type, "scatter"); const n = s.items.map(x => x.n), k = p.options.indexOf(p.answer);
      assert.deepEqual(s.items.map(x => x.thing), p.things);
      if (/paling banyak Mira kumpulkan/.test(q.prompt)) assert.equal(n[k], Math.max(...n));
      if (/ditambah paling banyak/.test(q.prompt)) assert.equal(n[k], Math.min(...n));
      assert.equal(new Set(n).size, n.length, "banyak kaleng berbeda");
    }
  });
  const total = q.prompt.match(/data (\d+) siswa/); if (total) assert.equal(sum(data.map(r => r.n)), Number(total[1]));
}
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.equal(new Set(pos).size, pos.length, `posisi pilihan ${pos}`);
const pickPos = all.flatMap(q => q.parts.filter(p => p.kind === "pick").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pickPos).size >= 3, `posisi isian nama ${pickPos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, ${interactive} soal beraksi, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}, posisi nama ${pickPos.join("")}.`);
