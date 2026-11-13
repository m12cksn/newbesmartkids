import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, num, mean, median, modes, quartiles, sorted, sum, expand, sources } from "../src/data/grade-eight-statistics.ts";

assert.equal(topics.length, 2); assert.deepEqual(topics.map(t => t.sections.length), [4, 3]);
assert.equal(new Set(topics.flatMap(t => t.sections.map(s => s.lab))).size, 7, "peraga berbeda di setiap bagian");
topics.forEach(t => t.sections.forEach(s => assert.ok(s.life.length > 80 && s.steps.length >= 4 && s.example.length > 30, `materi lengkap ${s.title}`)));
assert.deepEqual(practice.map(p => p.length), [4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
assert.deepEqual(tally(assessment, q => q.topic), { 0: 12, 1: 12 });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(assessment[i].topic, assessment[i - 1].topic); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)), "| bergambar:", assessment.filter(q => q.scene).length);
console.log("Posisi jawaban pilihan ganda:", assessment.flatMap(q => q.parts).filter(p => p.kind === "choice" && p.options.length > 2).map(p => p.options.indexOf(p.answer)).join(","));

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); wrong(String(p.value - 0.5).replace(".", ",")); }
    if (p.kind === "table") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1); wrong(g.join("|")); });
    if (p.kind === "sort") { const ids = f[0].split(","); const g = [...ids]; const k = ids.findIndex((x, j) => j > 0 && p.values[Number(x)] !== p.values[Number(ids[j - 1])]); [g[k - 1], g[k]] = [g[k], g[k - 1]]; wrong(g.join(",")); wrong(ids.slice(1).join(","));
      assert.ok(correct(q, swap(i, [...ids].map((x, j, a) => a[j]).join(","))), "urutan benar"); rechecked++; }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const eq = (a, b) => { assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`); rechecked++; };
const nums = s => s.split(":").pop().match(/\d+(,\d+)?/g).map(x => Number(x.replace(",", ".")));
const listOf = (q, re = /: ([\d, .]+)\./) => re.exec(q.prompt)[1].split(",").map(x => Number(x.trim()));
// Pemusatan.
const ht = find(/Tinggi badan 12 siswa/); assert.deepEqual(modes(listOf(ht)), [ht.parts[0].value]); rechecked++;
const sh = find(/Ukuran sepatu 11 siswa/); eq(sh.parts[1].value, median(sh.parts[0].values));
const ft = find(/Lengkapi tabel, lalu tentukan rata-ratanya/), ftp = ft.parts[0]; eq(ft.parts[1].value, sum(ftp.answers) / sum(ftp.rows.map(r => r[1])));
ftp.rows.forEach((r, k) => eq(ftp.answers[k], r[0] * r[1]));
eq(find(/berat badan 11 anak/).parts[0].value, 12 * 42.5 - 11 * 42);
const bk = find(/buku tulis/); { const vals = bk.scene.values, top = Math.max(...vals); assert.equal(bk.parts[0].answer, bk.scene.labels.filter((_, i) => vals[i] === top).join(" dan ")); rechecked++; }
eq(find(/7, 8, 8, 9, 10, 10, 11, 9/).parts[0].value, mean([7, 8, 8, 9, 10, 10, 11, 9]));
const uts = find(/Nilai UTS 10 siswa/); eq(uts.parts[1].value, median(uts.parts[0].values));
eq(find(/Nilai ulangan 30 siswa/).parts[1].value, mean(expand([5, 6, 7, 8, 9, 10], [4, 7, 9, 6, 3, 1])));
eq(find(/Rata-rata nilai 25 siswa kelas 8A adalah 80/).parts[0].value, (25 * 80 + 20 * 74 + 15 * 86) / 60);
eq(find(/nilai seorang siswa yang mendapat 54/).parts[0].value, (25 * 78 - 54) / 24);
eq(find(/a \+ b/).parts[0].value, 72 - sum([8, 6, 5, 9, 7, 4, 8, 10]));
eq(find(/Rata-rata tinggi 15 anak/).parts[0].value, (20 * 152 - 15 * 150) / 5);
const opn = find(/2, 3, 7, 7, 8, 8, 8, 9, 11/).parts[0].statements, d = [2, 3, 7, 7, 8, 8, 8, 9, 11], mo = modes(d)[0];
assert.deepEqual(opn.map(s => s.answer), [mo > mean(d), median(d) < mean(d), mo === mean(d), mo === median(d)]); rechecked++;
const gaji = find(/Dua belas pegawai/), gx = 12 * 3e6 - (6 * 3e6 + 3 * 2.5e6 + 2 * 4e6); eq(gaji.parts[1].value, gx); assert.equal(gaji.parts[0].answer, gx < 3e6 ? "kurang dari" : gx > 3e6 ? "lebih dari" : "sama dengan");
{ const rest = 16 * 20 - 10 * 19 - 4 * 23.5; eq(find(/Rata-rata 16 data adalah 20/).parts[0].value, rest / 3); }
eq(find(/12 siswa pertama masing-masing ditambah/).parts[0].value, 78 + (sum(Array.from({ length: 12 }, (_, k) => 2 * (k + 1))) - 120) / 24);
// Penyebaran.
const suhu = find(/Suhu siang hari/), sv = suhu.scene.values; eq(suhu.parts[0].value, Math.max(...sv) - Math.min(...sv)); eq(suhu.parts[1].value, Math.max(...sv) - Math.min(...sv.filter(x => x !== 22)));
const q10 = find(/84, 70, 78, 82, 74, 96, 80, 88, 92, 68/); quartiles([84, 70, 78, 82, 74, 96, 80, 88, 92, 68]).forEach((x, k) => eq(q10.parts[k].value, x));
const q12 = find(/5, 8, 6, 6, 10, 9, 10, 11, 6, 7, 8, 8/), [a1, , a3] = quartiles([5, 8, 6, 6, 10, 9, 10, 11, 6, 7, 8, 8]); eq(q12.parts[0].value, a1); eq(q12.parts[1].value, a3); eq(q12.parts[2].value, a3 - a1); eq(q12.parts[3].value, (a3 - a1) / 2);
const out = find(/diganti menjadi 120/).parts[0].statements, base = [60, 64, 66, 70, 74, 78, 80, 84], alt = [60, 64, 66, 70, 74, 78, 80, 120], sk = x => (quartiles(x)[2] - quartiles(x)[0]) / 2;
assert.deepEqual(out.map(s => s.answer), [Math.max(...alt) - 60 !== Math.max(...base) - 60, sk(alt) !== sk(base), true]); rechecked++;
const rice = find(/produksi beras/); eq(rice.parts[0].value, Math.max(...sources.rice) - Math.min(...sources.rice));
const q16 = find(/16 data berikut/), d16 = [62, 88, 74, 74, 80, 66, 68, 80, 66, 88, 74, 80, 88, 68, 74, 90]; quartiles(d16).forEach((x, k) => eq(q16.parts[k + 1].value, x));
const tb = find(/Anton 155/), hs = tb.scene.rows.map(r => r[1]); eq(tb.parts[0].value, Math.max(...hs) - Math.min(...hs));
eq(tb.parts[1].value, Math.max(...hs) - Math.min(...hs.filter((_, i) => tb.scene.rows[i][0] !== "Nadiva")));
{ const later = tb.scene.rows.map(([nm, h]) => h + (nm === "Robert" ? 4 : 2)); eq(tb.parts[2].value, Math.max(...later) - Math.min(...later)); }
const shoe = find(/Ukuran sepatu 30 siswa/), sd = expand(sources.shoeV, sources.shoeF); { const [x1, , x3] = quartiles(sd); eq(shoe.parts[1].value, x1); eq(shoe.parts[2].value, x3); shoe.parts[0].answers.forEach((c, k) => eq(c, sum(sources.shoeF.slice(0, k + 1)))); }
const bp = find(/Tekanan darah/), bd = nums(bp.prompt); { const [x1, , x3] = quartiles(bd); eq(bp.parts[0].value, x1); eq(bp.parts[1].value, x3); eq(bp.parts[2].value, x3 - x1); eq(bp.parts[3].value, (x3 - x1) / 2); }
const AB = find(/Data A: 4, 6/), dA = [4, 6, 6, 7, 7, 7, 8, 8, 9, 10, 11, 12], dB = [5, 6, 6, 6, 7, 7, 8, 8, 9, 9, 11, 17];
eq(AB.parts[0].value, 12 - 4); eq(AB.parts[1].value, 17 - 5); eq(AB.parts[2].value, sk(dA)); eq(AB.parts[3].value, sk(dB));
const mt = find(/penjualan motor di sebuah dealer/), md = sources.motor; { const [x1, x2, x3] = quartiles(md); eq(mt.parts[0].value, mean(md)); eq(mt.parts[1].value, x2); assert.deepEqual(modes(md), [mt.parts[2].value]); eq(mt.parts[3].value, x1); eq(mt.parts[4].value, x3); }
const bb = find(/berat badan anaknya/); { const [x1, , x3] = quartiles(sources.baby); assert.deepEqual(sources.baby, sorted(sources.baby)); eq(bb.parts[0].value, x1); eq(bb.parts[1].value, x3); eq(bb.parts[2].value, (x3 - x1) / 2); }
const vac = find(/penerima vaksin/), vv = vac.scene.values, mn = Math.min(...vv); eq(vac.parts[0].value, Math.max(...vv) - mn);
{ const nv = vv.map(x => (x === mn ? x * 1.4 : x * 1.1)); eq(vac.parts[1].value, Math.round((Math.max(...nv) - Math.min(...nv)) * 100) / 100); }
const ld = find(/luas lahan/); quartiles(sources.land).forEach((x, k) => eq(ld.parts[k].value, x));
const xq = find(/Delapan data terurut/); { const x = xq.parts[0].value, dd = [4, 6, 7, x, 10, 11, 13, 15]; eq(median(dd), 9); eq(xq.parts[1].value, sk(dd)); }
const pc = find(/40% mendapat nilai 65/), pd = expand([65, 75, 85, 95], [8, 4, 6, 2]); { const [x1, x2, x3] = quartiles(pd); eq(pc.parts[0].value, x1); eq(pc.parts[1].value, x3); eq(pc.parts[2].value, (x3 - x1) / 2);
  const m = { Modus: modes(pd)[0], Median: x2, "Rata-rata": mean(pd) }; const ord = Object.entries(m).sort((a, b) => a[1] - b[1]).map(e => e[0]).join(" < "); assert.equal(pc.parts[3].answer, ord); rechecked++; }
console.log(`Kunci dihitung ulang dari data: ${rechecked}`);
console.log(`Data Kelas 8 Bab 6 valid: ${all.length} soal.`);
