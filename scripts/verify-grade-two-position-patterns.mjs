import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, scenes, holds, objOf, positions, periodOf, createValid } from "../src/data/grade-two-position-patterns.ts";

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
const interactive = assessment.filter(q => q.parts.some(p => ["tap", "fill", "sort", "check", "seq", "create", "odd"].includes(p.kind))).length;
assert.ok(interactive >= 14, `interaktif ${interactive}`);
const pos = assessment.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 3, `posisi pilihan ${pos}`);

// Benda di adegan tidak saling bertumpuk pada bidang yang sama kecuali memang di atas/di bawah.
const byName = (s, name) => scenes[s].objs.filter(o => o.name.toLowerCase().startsWith(name));
const relWords = (s, a, b) => positions.filter(p => holds(a, b, p));
const furniture = { meja: "meja", "tempat tidur": "kasur", kursi: "kursi", bangku: "bangku", rumah: "rumah", pohon: "pohon", sepeda: "sepeda", "kotak mainan": "kotak", kotak: "kotak", "jam dinding": "jam", bantal: "bantal" };
const subjects = { bola: "bola", kucing: "kucing", burung: "burung1", sepeda: "sepeda", pohon: "pohon", rumah: "rumah", "mobil-mobilan": "mobil", boneka: "boneka", kursi: "kursi" };

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  q.parts.forEach((p, i) => {
    const w = [...v];
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); if (p.figs) assert.equal(p.figs.length, p.options.length); w[i] = p.options.find(o => o !== p.answer); }
    if (p.kind === "tap") w[i] = scenes[p.scene].objs.find(o => o.id !== p.answer).id;
    if (p.kind === "fill") { assert.equal(new Set(p.answer).size, p.answer.length, "kata dipakai sekali"); w[i] = [...p.answer].reverse().join(","); }
    if (p.kind === "sort") { const a = [...p.answer]; a[0] = (a[0] + 1) % p.bins.length; w[i] = a.join(","); }
    if (p.kind === "check") w[i] = p.answer.slice(1).join(",") || "0";
    if (p.kind === "seq") { w[i] = p.answer.map((t, k) => k === 0 ? p.palette.find(x => x !== t) : t).join(","); p.answer.forEach(t => assert.ok(p.palette.includes(t))); }
    if (p.kind === "create") w[i] = p.colors[0] + "," + Array(p.n - 1).fill(p.colors[1]).join(",");
    if (p.kind === "odd") w[i] = String((p.answer + 1) % p.items.length);
    if (!(p.kind === "fill" && p.answer.length === 1)) assert.ok(!correct(q, w.join(SEP)), `salah ditolak: ${q.prompt} ${i}`);

    // Kalimat isian: kata jawaban satu-satunya yang benar menurut letak benda di adegan.
    if (p.kind === "fill") {
      const s = q.fig.s;
      p.sentences.forEach((sent, k) => {
        const subj = Object.keys(subjects).find(n => sent.toLowerCase().startsWith(n));
        const ref = Object.keys(furniture).sort((x, y) => y.length - x.length).find(n => sent.toLowerCase().includes(`… ${n}.`) || sent.toLowerCase().includes(`${n}.`));
        const a = objOf(s, subjects[subj]), b = objOf(s, furniture[ref]);
        assert.deepEqual(relWords(s, a, b), [p.answer[k]], `${sent} → ${relWords(s, a, b)}`);
      });
    }
    if (p.kind === "seq") {
      const full = [...p.items]; let k = 0; full.forEach((t, j) => { if (t === null) full[j] = p.answer[k++]; });
      assert.ok(periodOf(full), `pola lengkap: ${q.prompt}`);
      // Tidak ada isian lain dari palet yang juga membentuk pola.
      const blanks = p.items.map((t, j) => t === null ? j : -1).filter(j => j >= 0);
      const combos = blanks.reduce((acc) => acc.flatMap(c => p.palette.map(t => [...c, t])), [[]]);
      const ok = combos.filter(c => { const f = [...p.items]; blanks.forEach((j, n) => f[j] = c[n]); return periodOf(f); });
      assert.equal(ok.length, 1, `isian unik: ${q.prompt} ${ok.length}`);
    }
    if (p.kind === "check") p.items.forEach((it, k) => assert.equal(Boolean(periodOf(it.fig.items)), p.answer.includes(k), `${q.prompt} ${it.name}`));
    if (p.kind === "odd") {
      const fixes = p.items.map((_, j) => [...new Set(p.items)].some(t => { const f = [...p.items]; f[j] = t; return t !== p.items[j] && periodOf(f); }));
      assert.deepEqual(fixes.map((x, j) => x ? j : -1).filter(j => j >= 0), [p.answer], "hanya satu gambar yang merusak pola");
      assert.ok(!periodOf(p.items));
    }
    if (p.kind === "create") { assert.ok(createValid(p, p.sample.join(","))); assert.ok(!createValid(p, Array(p.n).fill(p.colors[0]).join(","))); }
    if (p.kind === "sort" && p.items[0].fig.t === "pair") p.items.forEach((it, k) => assert.equal(p.bins[p.answer[k]], `di ${it.fig.pos}`));
  });
  // Soal pilihan dengan gambar pasangan: kunci sesuai gambar.
  if (q.fig?.t === "pair" && q.parts.length === 1 && q.parts[0].kind === "choice") assert.equal(q.parts[0].answer, q.fig.pos);
  // Barisan pola di soal: lanjutkan dengan pilihan yang benar.
  if (q.fig?.t === "row" && q.parts[0].kind === "choice" && q.parts[0].figs) {
    const per = periodOf(q.fig.items); assert.ok(per);
    const next = q.fig.items[q.fig.items.length - per];
    assert.equal(q.parts[0].figs[q.parts[0].options.indexOf(q.parts[0].answer)].tk, next, q.prompt);
  }
}

// Tebakan "Apa aku?" dan "ketuk benda": tepat satu benda yang cocok.
const kamar = s => objOf("kamar", s);
const objs = scenes.kamar.objs;
const only = (f) => objs.filter(f).map(o => o.id);
assert.deepEqual(only(o => holds(o, kamar("kasur"), "bawah")), ["bola"]);
assert.deepEqual(only(o => holds(o, kamar("kasur"), "atas") && holds(o, kamar("bantal"), "kiri")), ["boneka"]);
assert.deepEqual(only(o => holds(o, kamar("meja"), "atas") && holds(o, kamar("jam"), "bawah")), ["buku"]);
assert.ok(only(o => holds(o, kamar("meja"), "atas")).length > 1 && only(o => holds(o, kamar("jam"), "bawah")).length > 1, "setiap petunjuk sendiri belum cukup");
assert.deepEqual(only(o => (holds(o, kamar("meja"), "bawah") || holds(o, kamar("kasur"), "bawah")) && holds(o, kamar("kursi"), "kiri")), ["mobil"]);
assert.ok(only(o => holds(o, kamar("meja"), "bawah") || holds(o, kamar("kasur"), "bawah")).length > 1);
// Pot kedua dari kanan.
const pots = scenes.rumahAni.objs.filter(o => o.art === "pot").sort((a, b) => a.x - b.x);
assert.equal(pots[pots.length - 2].id, assessment.find(q => q.parts[0].kind === "tap" && q.parts[0].scene === "rumahAni").parts[0].answer);
// Barisan anak: Tika di antara Upe dan Kira, anak ketiga dari kiri.
const line = scenes.barisan.objs.sort((a, b) => a.x - b.x).map(o => o.name);
line.splice(1, 0, "Tika");
assert.equal(line[2].toLowerCase(), assessment.find(q => q.parts[0].kind === "tap" && q.parts[0].scene === "barisan").parts[0].answer);
// Perpindahan kucing pada kursi warna.
const chairs = ["merah", "biru", "kuning", "hijau"]; let at = chairs.indexOf("biru"); at += 1; at -= 2;
assert.equal(`Di bawah kursi ${chairs[at]}`, assessment.find(q => q.fig?.t === "scene" && q.fig.s === "kursiWarna").parts[0].answer);
// Kucing di adegan kursi mula-mula di bawah kursi biru.
assert.ok(holds(objOf("kursiWarna", "kucing"), objOf("kursiWarna", "kursi-biru"), "bawah"));
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, ${interactive} interaktif, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
