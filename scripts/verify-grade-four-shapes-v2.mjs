// Verifikasi Kelas 4 Bab 5 Bangun Datar: susunan soal dan kunci yang dihitung ulang dari koordinat bangun.
// Jalankan: node --experimental-strip-types scripts/verify-grade-four-shapes-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, F, triKind, quadNames, isRegular, angleCount, countShapes, mosaics, congruent, area, shapeName } from "../src/data/grade-four-shapes-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 2); assert.equal(practice.length, 2);
practice.forEach((p, i) => { assert.equal(p.length, 4, `latihan ${topics[i].code} harus 4 soal`); p.forEach(q => assert.equal(q.topic, i)); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts) + JSON.stringify(q.scene ?? null))).size, all.length, "soal tidak boleh kembar");
assert.equal(new Set(Q.map(q => q.prompt)).size, Q.length, "kalimat soal evaluasi tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let t = 0; t < 2; t++) assert.equal(Q.filter(q => q.topic === t).length, 12, `evaluasi subtopik ${topics[t].code} 12 soal`);
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "count", "choice", "pick", "multi", "sort", "match", "table", "slots"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk jawaban ${k}`);
const action = Q.filter(q => q.parts.some(p => ["pick", "multi", "sort", "match", "table", "slots"].includes(p.kind))).length;
assert.ok(action >= 10, `soal beraksi minimal 10, sekarang ${action}`);
// Posisi jawaban pilihan tidak menumpuk di satu tempat.
const pos = Q.flatMap(q => q.parts.flatMap(p => p.kind === "choice" ? [p.options.indexOf(p.answer)] : p.kind === "pick" ? [p.answer] : []));
assert.ok(new Set(pos).size >= 3, `posisi jawaban terlalu seragam: ${pos}`);

/** Nama segitiga/segiempat dari koordinat. */
const names = f => f.pts?.length === 3 ? [triKind(f.pts).bySide, triKind(f.pts).byAngle] : f.pts?.length === 4 ? quadNames(f.pts) : [];
const nonPoly = f => !f.pts;
const thingPoly = { papan: true, mur: true, penggaris: true, rambu: true, ban: false, gelang: false, eskrim: false, jam: false };
let checked = 0;
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, "") && !ready(q, ""), `${q.prompt}: kosong dianggap benar atau lengkap`);
  assert.ok(q.explanation.length > 40, `${q.prompt}: pembahasan terlalu pendek`);
  for (const [i, p] of q.parts.entries()) {
    if (["sort", "match", "slots"].includes(p.kind)) { const v = q.answer.split("‖"); v[i] = v[i].split("|")[0]; assert.ok(!ready(q, v.join("‖")), `${q.prompt}: ${p.kind} sebagian dianggap lengkap`); }
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "sort") {
      p.items.forEach((it, k) => {
        const want = typeof it === "string" ? (thingPoly[it] ? 0 : 1) : p.bins[0] === "Segi banyak" ? (nonPoly(it) ? 1 : 0) : p.bins[0] === "Jajargenjang" ? (quadNames(it.pts).includes("jajargenjang") ? 0 : 1) : NaN;
        assert.equal(p.answer[k], want, `${q.prompt}: ${typeof it === "string" ? it : it.label}`);
      }); checked++;
    }
    if (p.kind === "match") {
      const fits = (f, name) => names(f).some(n => name.toLowerCase().endsWith(n));
      p.left.forEach((f, k) => assert.ok(fits(f, p.right[p.answer[k]]), `${q.prompt}: ${f.label}`));
      // Pasangan harus satu-satunya cara memasangkan semua.
      const perms = a => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(r => [x, ...r]));
      assert.equal(perms([...p.right.keys()]).filter(pm => p.left.every((f, k) => fits(f, p.right[pm[k]]))).length, 1, `${q.prompt}: pasangan tidak tunggal`); checked++;
    }
    if (p.kind === "table") {
      const has = (f, row) => { const s = f.pts; const n = names(f);
        if (row === "Memiliki 3 sisi") return s.length === 3;
        if (row === "Ada 2 sisi sama panjang") return n[0] === "sama kaki" || n[0] === "sama sisi";
        if (row === "Ketiga sisi sama panjang") return n[0] === "sama sisi";
        if (row === "2 pasang sisi sejajar") return n.includes("jajargenjang");
        if (row === "Tepat 1 pasang sisi sejajar") return n.includes("trapesium");
        if (row === "4 sudut siku-siku") return angleCount(s, "siku-siku") === 4;
        if (row === "4 sisi sama panjang") return n.includes("belah ketupat");
        throw new Error(row); };
      p.rows.forEach((r, ri) => p.cols.forEach((c, ci) => assert.equal(p.answer[ri][ci], has(c, r), `${q.prompt}: ${r} / ${c.label}`))); checked++;
    }
    if (p.kind === "slots") { p.slots.forEach(s => assert.ok(p.pieces.some(x => congruent(x, s)))); assert.ok(p.pieces.length > p.slots.length || q.topic === 1, q.prompt);
      const tot = p.slots.reduce((a, s) => a + area(s), 0); assert.ok(tot > 0); checked++; }
  }
  // Soal yang bergantung pada gambar: kunci dari koordinat.
  if (q.scene?.type === "mosaic" && q.scene.name !== "persegi berlubang") {
    const c = countShapes(q.scene.pieces);
    for (const p of q.parts) {
      if (p.kind === "count" && !p.labels.some(l => /besar/.test(l))) { p.labels.forEach((k, j) => assert.equal(p.answers[j], c[k.toLowerCase()] ?? 0, `${q.prompt}: ${k}`)); assert.equal(p.answers.reduce((x, y) => x + y, 0), q.scene.pieces.length, `${q.prompt}: semua keping terhitung`); checked++; }
      if (p.kind === "multi") {
        // Gambar pilihan ada di gambar jika ada keping dengan nama yang sama; segitiga dibandingkan jenisnya (siku-siku atau sisinya).
        const pieces = q.scene.pieces.map(x => (x.c ? { c: x.c } : { pts: x.pts }));
        const inPic = f => { const n = shapeName(f); if (n !== "segitiga") return pieces.some(x => shapeName(x) === n);
          const t = triKind(f.pts); return pieces.some(x => x.pts?.length === 3 && (t.byAngle === "siku-siku" ? triKind(x.pts).byAngle === "siku-siku" : triKind(x.pts).bySide === t.bySide)); };
        p.figs.forEach((f, k) => assert.equal(p.answer.includes(p.options[k]), inPic(f), `${q.prompt}: ${f.label} (${shapeName(f)})`)); checked++; }
    }
  }
}
// Soal khusus dihitung dari bangunnya.
const find = re => Q.find(q => re.test(q.prompt));
{ const q = find(/tangram ini/); const sz = mosaics.tangram.filter(p => p.pts.length === 3).map(p => area(p.pts)); const c = countShapes(mosaics.tangram); assert.deepEqual(q.parts[0].answers, [sz.filter(a => a === 16).length, sz.filter(a => a === 8).length, sz.filter(a => a === 4).length, c.persegi, c.jajargenjang]); checked++; }
{ const q = find(/sudut lancip dan sudut tumpul/); const s = q.scene.figs[0].pts; assert.deepEqual(q.parts[0].answers, [angleCount(s, "lancip"), angleCount(s, "tumpul")]); assert.equal(angleCount(s, "siku-siku"), 0); checked++; }
{ const q = find(/segi banyak beraturan ditunjukkan/); const reg = q.scene.figs.map((f, i) => (isRegular(f.pts) ? i + 1 : 0)).filter(Boolean); assert.equal(q.parts[0].answer, reg.join(" dan ")); checked++; }
{ const q = find(/semua nama yang tepat untuk segitiga/); assert.deepEqual([...q.parts[0].answer].map(s => s.toLowerCase()).sort(), names(q.scene.figs[0]).sort()); checked++; }
{ const q = find(/semua nama yang tepat untuk bangun/); assert.deepEqual([...q.parts[0].answer].map(s => s.toLowerCase()).sort(), quadNames(q.scene.figs[0].pts).sort()); checked++; }
{ const q = find(/tumpul sekaligus sama kaki/); const ok = q.parts[0].figs.map((f, i) => (triKind(f.pts).bySide === "sama kaki" && triKind(f.pts).byAngle === "tumpul" ? i : -1)).filter(i => i >= 0); assert.deepEqual(ok, [q.parts[0].answer]); checked++; }
{ const q = find(/Ciri apa yang dimiliki A/); const [a, b] = q.scene.figs.map(f => quadNames(f.pts)); assert.ok(a.includes("belah ketupat") && !b.includes("belah ketupat") && b.includes("layang-layang")); checked++; }
{ const q = find(/diurai menurut kedua diagonalnya\. Segitiga/); const [p0, p1, p2] = q.scene.figs[0].pts, c = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2]; const k = [triKind([p0, p1, c]), triKind([p1, p2, c])]; assert.ok(k.every(x => x.bySide === "sama kaki" && x.byAngle !== "siku-siku")); assert.equal(q.parts[0].answer, "4 segitiga sama kaki"); checked++; }
{ const q = practice[1][3]; const [p0, p1, p2] = q.scene.figs[0].pts, c = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2]; const k = triKind([p0, p1, c]); assert.equal(`${k.byAngle} ${k.bySide}`, "siku-siku sama kaki"); checked++; }
{ const q = find(/Taman kota/); assert.ok(isRegular(q.scene.figs[0].pts)); assert.deepEqual(q.parts.map(p => p.answers[0]), [5 * 60, 2 * 5 * 60]); checked++; }
{ const q = find(/Satu keping hilang/); const gap = [[0, 4], [4, 4], [2, 2]], p = q.parts[0]; assert.deepEqual(p.figs.map((f, i) => (congruent(f.pts, gap) ? i : -1)).filter(i => i >= 0), [p.answer]); checked++; }
{ const q = find(/Segienam beraturan dipotong/); assert.ok(isRegular(q.scene.figs[0].pts)); assert.deepEqual([q.parts[0].answers[0], q.parts[1].answers[0]], [3, 6]); checked++; }
{ const q = find(/TIDAK bisa disusun/); const p = q.parts[0]; const kind = f => (f.pts.length === 3 ? `segitiga ${triKind(f.pts).bySide}` : quadNames(f.pts)[0]);
  assert.deepEqual(p.figs.map(kind), ["persegi panjang", "segitiga sama kaki", "trapesium", "jajargenjang"]); assert.equal(kind(p.figs[p.answer]), "trapesium"); checked++; }
{ const q = practice[0][2]; assert.equal(q.scene.figs[0].pts.length, 6); assert.ok(!isRegular(q.scene.figs[0].pts)); checked++; }
{ const q = find(/Garis kecil menandai sisi yang sama panjang\.$/); assert.ok(isRegular(q.scene.figs[0].pts)); assert.equal(q.scene.figs[0].pts.length, q.parts[0].answers[0]); checked++; }
assert.ok(checked >= 30, `kunci yang dihitung ulang ${checked}`);
void F;
console.log(`Kelas 4 Bab 5 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, ${checked} kunci dihitung ulang, bentuk ${[...kinds].join(", ")}`);
