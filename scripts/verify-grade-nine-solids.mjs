import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, isCubeNet, validSlots, PI, PI7 } from "../src/data/grade-nine-solids.ts";

assert.equal(topics.length, 6); assert.deepEqual(topics.map(t => t.sections.length), [2, 3, 3, 4, 4, 4]);
assert.equal(sections.length, 20); assert.equal(new Set(sections.map(s => s.lab)).size, 20, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 5 && s.life.length > 200 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 20); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)));
Object.values(tally(assessment, letter)).forEach(c => assert.ok(c >= 3)); assert.equal(Object.keys(tally(assessment, letter)).length, 6);
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
const interactive = assessment.filter(q => q.parts.some(p => ["sort", "match", "cubenet"].includes(p.kind))).length;
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| bergambar:", assessment.filter(q => q.scene || q.parts.some(p => p.pics || ["sort", "match", "cubenet"].includes(p.kind))).length, "| interaksi geometri:", interactive);
assert.ok(interactive >= 3); assert.ok(Object.keys(kinds).length >= 6);
console.log("Posisi jawaban pilihan:", all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)).join(","));

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); wrong(String(p.value * 2 + 1)); if (p.tol) { assert.ok(correct(q, swap(i, String(p.value + p.tol / 2).replace(".", ","))), "toleransi pembulatan"); } }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "sort") { f.forEach((_, k) => { const g = [...f]; g[k] = p.bins.find(o => o !== g[k]); wrong(g.join("|")); }); p.items.forEach(it => assert.ok(p.bins.includes(it.answer))); p.bins.forEach(b => assert.ok(p.items.some(it => it.answer === b), `kotak ${b} terisi`)); }
    if (p.kind === "match") { assert.equal(new Set(f).size, f.length, "pasangan unik"); assert.deepEqual([...f].sort(), [...p.right].sort()); const g = [...f]; [g[0], g[1]] = [g[1], g[0]]; wrong(g.join("|")); assert.notDeepEqual(f, p.right, "urutan kanan diacak"); }
    if (p.kind === "cubenet") { assert.equal(validSlots(p).length, 1); assert.ok(!isCubeNet(p.cells)); p.slots.filter(s => s.join(",") !== f[0]).forEach(s => wrong(s.join(","))); rechecked++; }
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
// Jaring-jaring kubus: 11 jaring berbeda pada petak 5 × 5 (hingga rotasi/pencerminan) — cek jaring yang dikenal.
assert.ok(isCubeNet([[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [1, 2]])); assert.ok(!isCubeNet([[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [1, 0]])); assert.ok(!isCubeNet([[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]]));
{ const seen = new Set(); const cells = []; for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) cells.push([x, y]);
  const canon = s => { const forms = []; let pts = s; for (let m = 0; m < 2; m++) { for (let r = 0; r < 4; r++) { pts = pts.map(([x, y]) => [y, -x]); const mx = Math.min(...pts.map(p => p[0])), my = Math.min(...pts.map(p => p[1])); forms.push(pts.map(([x, y]) => `${x - mx},${y - my}`).sort().join(";")); } pts = pts.map(([x, y]) => [-x, y]); } return forms.sort()[0]; };
  const rec = (start, chosen) => { if (chosen.length === 6) { if (isCubeNet(chosen)) seen.add(canon(chosen)); return; } for (let i = start; i < cells.length; i++) rec(i + 1, [...chosen, cells[i]]); };
  rec(0, []); assert.equal(seen.size, 11, "kubus mempunyai 11 jaring-jaring"); rechecked++; }

const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const eq = (a, b, msg = "") => { assert.ok(Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b)) || Math.abs(a - b) <= 0.01, `${msg} ${a} ≠ ${b}`); rechecked++; };
const v = (q, k) => q.parts[k].value;
const box = (p, l, t) => 2 * (p * l + p * t + l * t);
eq(v(find(/Kotak pensil logam/), 0), box(20, 10, 3)); eq(v(find(/Kardus sepatu/), 0), box(25, 12, 8));
{ const q = find(/Tentukan luas permukaan kubus dan balok/); eq(v(q, 0), 150); eq(v(q, 1), box(4, 5, 6)); }
{ const q = find(/rubik 5 × 5 × 5/); eq(v(q, 2), 6 * 25); }
{ const q = find(/Tenda berbentuk prisma segitiga/); eq(v(q, 1), 2 * 24 + (6 + 8 + 10) * 12); }
{ const q = find(/sisi alas 10 cm dan tinggi limas 12 cm/); const l = Math.hypot(12, 5); eq(v(q, 0), l); eq(v(q, 1), 100 + 4 * 0.5 * 10 * l); }
{ const q = find(/sisi alas 12 cm dan tinggi limas 8 cm/); const l = Math.hypot(8, 6); eq(v(q, 0), l); eq(v(q, 1), 144 + 2 * 12 * l); }
{ const q = find(/Balok 2 cm × 3 cm × 4 cm diubah/); eq(v(q, 0), box(6, 9, 12)); eq(v(q, 1), box(6, 9, 12) / box(2, 3, 4)); }
{ const q = find(/sisi alas 3 cm, 4 cm, 5 cm/); eq(v(q, 0), 2 * 6 + 12 * 10); eq(v(q, 1), (2 * 6 + 12 * 10) * 9); }
{ const q = find(/Balok 5 × 3 × 7 diubah dengan skala k/); const k = Math.cbrt(6720 / 105); eq(v(q, 0), k); eq(v(q, 1), box(5 * k, 3 * k, 7 * k)); }
{ const q = find(/lubang tembus 2 × 2 × 4/); eq(v(q, 0), 6 * 6 * 4 - 2 * 2 * 4); }
{ const q = find(/40 cm × 40 cm/); eq(v(q, 0), (40 * 40 - 20 * 20) * 30); eq(v(q, 1), v(q, 0) / 1000); }
{ const q = find(/Kolam renang panjang 50 m/); eq(v(q, 0), 50 * 20 * (1 + 2.5) / 2); eq(v(q, 1), v(q, 0) * 1000); }
{ const q = find(/Limas persegi beralas 6 m × 6 m/); eq(v(q, 0), 36 * 5 / 3); eq(v(q, 1), v(q, 0) / (0.2 * 0.1 * 0.1)); }
{ const q = find(/jari-jarinya 14 cm \(π = \{22\/7\}\)/); eq(v(q, 0), 2 * PI7 * 14); }
{ const q = find(/jari-jari 14 cm dengan sudut pusat 90°/); eq(v(q, 0), 2 * PI7 * 14 / 4); eq(v(q, 1), PI7 * 196 / 4); }
{ const q = find(/Taman lingkaran berjari-jari 35 m/); eq(v(q, 0), PI7 * (35 ** 2 - 7 ** 2)); eq(v(q, 2), 8800 / (2 * PI7 * 35)); assert.ok(Number.isInteger(v(q, 2))); }
{ const q = find(/juring cincin/); eq(v(q, 0), PI7 * (21 ** 2 - 7 ** 2) / 4); }
{ const q = find(/panjang sebuah busur 33 cm/); eq(v(q, 0), 33 / (2 * PI7 * 21) * 360); }
{ const q = find(/Kaleng biskuit/); eq(v(q, 0), 2 * PI7 * 14 * (14 + 20)); }
{ const q = find(/Drum tertutup/); const L = 2 * PI * 30 * (30 + 90); eq(v(q, 0), L); eq(v(q, 1), (L / 10000) * 50 / (40 * 10)); }
{ const q = find(/30 topi ulang tahun/); const s = Math.hypot(7, 24); eq(v(q, 0), s); eq(v(q, 1), 30 * PI7 * 7 * s); }
{ const q = find(/Kerucut berjari-jari 5 cm dan tinggi 12 cm/); eq(v(q, 1), PI * 5 * (5 + Math.hypot(5, 12))); }
{ const q = find(/kerucut tembaga/); eq(v(q, 2), PI7 * 21 * 35 * 100 / 5000 * 800000); }
{ const q = find(/Rumah Honai/); eq(v(q, 2), 2 * PI7 * 3.5 * 2 + 2 * PI7 * 3.5 ** 2); }
{ const q = find(/Bola berdiameter 20 cm akan dibungkus/); eq(v(q, 1), Math.floor(10000 / (4 * PI * 100))); }
{ const q = find(/Kerucut diletakkan di dalam prisma persegi bersisi 20 cm/); eq(v(q, 0), 20 * 20 * 30 - PI * 100 * 30 / 3); }
{ const q = find(/Bis beton/); eq(v(q, 0), PI * 50 * (100 ** 2 - 90 ** 2)); }
{ const q = find(/Bola diletakkan dalam kubus/); eq(v(q, 0), 4 / 3 * PI * 6 ** 3); assert.equal(q.parts[1].answer, "π : 6"); eq((4 / 3) * Math.PI * 6 ** 3 / 12 ** 3, Math.PI / 6); }
{ const q = find(/3 bola golf/); const balls = 3 * 4 / 3 * PI * 8; eq(v(q, 0), balls); eq(v(q, 1), 12 * 4 * 4 - balls); eq(v(q, 2), PI * 4 * 12 - balls); assert.equal(q.parts[3].answer, v(q, 2) < v(q, 1) ? "Tabung" : "Kotak balok"); }
{ const q = find(/Kerucut A berjari-jari 7 cm/); const rB = 88 / (2 * PI7); eq(v(q, 0), rB); eq(v(q, 1), 49 * 12 / rB ** 2); }
{ const q = find(/Kemasan gelato/); eq(v(q, 0), 3 * (3 + Math.hypot(3, 4))); eq(v(q, 2), 0.75 ** 2); }
{ const q = find(/Tangki gas berbentuk bola berdiameter 30 m/); eq(v(q, 0), 4 / 3 * PI * 15 ** 3); }
{ const q = find(/Bola berjari-jari 3 cm tepat masuk/); eq(v(q, 0), 9 * 6 - 4 / 3 * 27); }
{ const q = find(/Gelas kopi/); eq(v(q, 1), 16 * 10 * 1.25 ** 3); }
assert.equal(num("1.750.000"), 1750000); assert.equal(num("0,28"), 0.28); assert.equal(num("1/4"), 0.25);
console.log(`Kunci dihitung ulang dari rumus dan data soal: ${rechecked}`);
console.log(`Data Kelas 9 Bab 2 valid: ${all.length} soal.`);
