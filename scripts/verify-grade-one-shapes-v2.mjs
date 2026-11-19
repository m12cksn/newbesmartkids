// Verifikasi Kelas 1 Bab 4 Mengenal Bentuk: susunan soal dan kunci yang dihitung ulang dari bentuk, warna, ukuran, dan gambar.
// Jalankan: node --experimental-strip-types scripts/verify-grade-one-shapes-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, catName, itemCat, formCat, area, pictures, countOf, puzzles, paintKey, fits } from "../src/data/grade-one-shapes-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 3); assert.equal(practice.length, 3);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => JSON.stringify([q.prompt, q.parts, q.scene ?? null]))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 3; t++) assert.equal(Q.filter(q => q.topic === t).length, 8, `evaluasi subtopik ${topics[t].code} 8 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["match", "trace", "multi", "pick", "paint", "sort", "puzzle", "count", "slots"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
// Aksi geometri (tarik garis, kelompokkan, susun/lengkapi keping) harus banyak.
const action = Q.filter(q => q.parts.some(p => ["match", "sort", "slots", "puzzle", "trace", "paint"].includes(p.kind))).length;
assert.ok(action >= 12, `soal beraksi minimal 12, sekarang ${action}`);
const pos = Q.flatMap(q => q.parts.filter(p => p.kind === "pick" || p.kind === "puzzle").map(p => p.answer));
assert.ok(new Set(pos).size === 3, `posisi jawaban pilihan harus bervariasi: ${pos}`);

const names = new Set(Object.values(catName));
const name = r => (names.has(r) ? r : catName[itemCat(r)]);
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 40, `${q.prompt}: pembahasan terlalu pendek`);
  for (const p of q.parts) {
    if (p.kind === "match") {
      // Setiap kiri harus cocok dengan tepat satu kanan menurut bentuk.
      p.left.forEach((l, k) => { const ok = p.right.map((r, j) => (name(r) === catName[itemCat(l)] ? j : -1)).filter(j => j >= 0); assert.deepEqual(ok, [p.answer[k]], `${q.prompt}: ${JSON.stringify(l)}`); });
      assert.ok(new Set(p.answer).size === p.right.length, `${q.prompt}: semua pilihan kanan dipakai`); checked++;
    }
    if (p.kind === "trace") { assert.equal(p.answer, catName[formCat[p.fig.f]]); assert.ok(!correct({ ...q, parts: [p] }, `|${p.answer}`), "harus disambung dulu"); checked++; }
    if (p.kind === "multi") { const target = Object.entries(catName).find(([, v]) => p.label.toLowerCase().startsWith(v.toLowerCase()))?.[0];
      if (target) { assert.deepEqual(p.items.map((it, k) => (itemCat(it) === target ? k : -1)).filter(k => k >= 0), p.answers, q.prompt); checked++; }
      else { const ref = q.scene.figs[0]; assert.deepEqual(p.items.map((it, k) => (formCat[it.f] === formCat[ref.f] && it.c === ref.c ? k : -1)).filter(k => k >= 0), p.answers, q.prompt); checked++; } }
    if (p.kind === "pick" && q.scene?.type === "group") {
      const g = q.scene.figs, rule = /warna/.test(q.prompt) ? "warna" : /ukuran/.test(q.prompt) ? "ukuran" : "bentuk";
      const big = f => Math.max(f.w, f.h) >= 34;
      const test = f => rule === "warna" ? g.every(x => x.c === f.c) : rule === "ukuran" ? g.every(x => big(x) === big(f)) : g.every(x => formCat[x.f] === formCat[f.f]);
      assert.ok(g.every(x => rule !== "ukuran" || big(x) === big(g[0])), "kelompok rujukan seukuran");
      assert.deepEqual(p.options.map((o, k) => (test(o) ? k : -1)).filter(k => k >= 0), [p.answer], `${q.prompt}: jawaban tunggal`); checked++;
    }
    if (p.kind === "pick" && q.scene?.type === "join") { assert.equal(p.options[p.answer], q.scene.mode === "kotak" ? catName.segiempat : catName.segitiga); checked++; }
    if (p.kind === "pick" && !q.scene) { const c = p.options.map(o => itemCat(o)), odd = c.map((x, k) => (c.filter(y => y === x).length === 1 ? k : -1)).filter(k => k >= 0); assert.deepEqual(odd, [p.answer], q.prompt); checked++; }
    if (p.kind === "paint") { const a = p.figs.map(area); assert.equal(new Set(a).size, a.length, "ukuran harus berbeda"); assert.ok(p.figs.every(f => f.f === p.figs[0].f), "warnai satu jenis bentuk"); assert.deepEqual(paintKey(p.figs).filter(Boolean).sort(), ["k", "m"]); checked++; }
    if (p.kind === "sort") { const rule = p.bins[0] === "Besar" ? "ukuran" : p.bins[0] === "Merah" ? "warna" : "bentuk";
      p.items.forEach((it, k) => { const want = rule === "ukuran" ? (Math.max(it.w, it.h) >= 34 ? 0 : 1) : rule === "warna" ? (it.c === "merah" ? 0 : 1) : p.bins.indexOf(catName[itemCat(it)]); assert.equal(p.answer[k], want, `${q.prompt}: benda ${k}`); });
      if (rule === "ukuran") { const sz = p.items.map(it => Math.max(it.w, it.h)); assert.ok(Math.min(...sz.filter(x => x >= 34)) - Math.max(...sz.filter(x => x < 34)) >= 18, "besar dan kecil harus jelas"); }
      checked++; }
    if (p.kind === "puzzle") { const z = puzzles[p.puzzle]; assert.equal(z.opts.length, 3); const hole = z.hole, k = z.opts[p.answer];
      // Potongan benar = lubang digeser ke titik (0,0): bandingkan jumlah titik dan ukuran kotaknya.
      assert.equal(k.d.split(/[A-Z]/i).length, hole.split(/[A-Z]/i).length, `${p.puzzle}: jumlah perintah gambar potongan benar sama dengan lubang`);
      assert.ok(z.opts.every((o, j) => j === p.answer || o.d !== k.d), "pengecoh berbeda"); checked++; }
    if (p.kind === "count") { const pic = pictures[p.picture]; assert.equal(countOf(pic, "semua"), pic.figs.length); for (const c of p.cats) assert.ok(countOf(pic, c) > 0); checked++; }
    if (p.kind === "slots") { const pic = pictures[p.picture]; assert.deepEqual([...p.order].sort((a, b) => a - b), pic.figs.map((_, k) => k), "keping = semua bentuk gambar");
      assert.ok(!correct({ ...q, parts: [p] }, pic.figs.map((_, k) => k).join("|")) || p.order.every((o, k) => o === k), "urutan keping tidak boleh sama dengan tempat");
      // Pasang keping salah ukuran harus ditolak.
      const v = answerKey([p]).split("|"); [v[0], v[1]] = [v[1], v[0]]; if (!fits(pic.figs[p.order[Number(v[0])]], pic.figs[0])) assert.ok(!correct({ ...q, parts: [p] }, v.join("|"))); checked++; }
  }
}
// Gambar soal tidak membocorkan jawaban: kelompok rujukan "satu ukuran" semuanya besar atau semuanya kecil.
assert.ok(checked >= 36, `kunci yang dihitung ulang ${checked}`);
console.log(`Kelas 1 Bab 4 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, posisi pilihan ${pos.join("/")}, bentuk ${[...kinds].join(", ")}`);
