import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, heights, relSeries } from "../src/data/grade-nine-probability.ts";

assert.equal(topics.length, 4); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "B", "C", "D"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 5, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 5 && s.life.length > 200 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 5); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)));
Object.values(tally(assessment, letter)).forEach(c => assert.ok(c >= 5)); assert.equal(Object.keys(tally(assessment, letter)).length, 4);
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
console.log("Jenis jawaban evaluasi:", JSON.stringify(kinds), "| interaktif (ketuk hasil/tabel):", assessment.filter(q => q.parts.some(p => p.kind === "pickset" || p.kind === "grid")).length);
console.log("Posisi jawaban pilihan:", all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)).join(","));

let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1)); }
    if (p.kind === "prob") {
      const val = p.a / p.b; assert.ok(val >= 0 && val <= 1, "peluang 0–1");
      for (const ok of [`${p.a}/${p.b}`, String(Math.round(val * 1000) / 1000).replace(".", ","), `${String(Math.round(val * 1000) / 10).replace(".", ",")}%`]) assert.ok(correct(q, swap(i, ok)), `bentuk setara diterima: ${ok}`);
      wrong(`${p.a + 1}/${p.b}`); wrong(String(Math.round((val + 0.02) * 1000) / 1000).replace(".", ",")); if (p.a !== p.b - p.a) wrong(`${p.b - p.a}/${p.b}`); rechecked++;
    }
    if (p.kind === "pickset") { assert.ok(p.answer.every(a => p.items.includes(a))); wrong(p.answer.slice(1).join(";")); wrong([...p.answer, p.items.find(it => !p.answer.includes(it))].join(";")); assert.ok(correct(q, swap(i, [...p.answer].reverse().join(";")))); }
    if (p.kind === "grid") { const k = p.answer.map(c => c.join(",")); wrong(k.slice(1).join(";")); wrong([...k, "1,1"].join(";")); assert.ok(correct(q, swap(i, [...k].reverse().join(";")))); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); if (p.pics) assert.equal(p.pics.length, p.options.length); }
  });
}
// Hitung ulang dari ruang sampel lengkap.
const coins = k => { let out = [""]; for (let i = 0; i < k; i++) out = out.flatMap(s => [s + "A", s + "G"]); return out; };
const G = s => [...s].filter(c => c === "G").length;
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const eqv = (a, b, m = "") => { assert.ok(Math.abs(a - b) < 1e-9, `${m} ${a} ≠ ${b}`); rechecked++; };
const P = p => p.a / p.b;
{ const q = find(/minimal dua sisi gambar/); assert.deepEqual([...q.parts[0].answer].sort(), coins(3).filter(s => G(s) >= 2).sort()); rechecked++; }
{ const q = find(/maksimal satu sisi gambar/); assert.deepEqual([...q.parts[0].answer].sort(), coins(3).filter(s => G(s) <= 1).sort()); eqv(P(q.parts[1]), 4 / 8); }
{ const q = find(/tepat dua sisi angka\./); eqv(P(q.parts[0]), coins(3).filter(s => 3 - G(s) === 2).length / 8); eqv(q.parts[1].value, 100 * 3 / 8); }
{ const q = find(/jumlah mata dadunya 8/); eqv(q.parts[0].answer.length, 5); q.parts[0].answer.forEach(([a, b]) => assert.equal(a + b, 8)); }
{ const q = find(/jumlah mata dadunya 9/); eqv(q.parts[0].answer.length / 36, P(q.parts[1])); }
{ const q = find(/kartu bernomor genap/); let k = 0; for (let x = 10; x <= 20; x++) if (x % 2 === 0) k++; eqv(P(q.parts[0]), k / 11); }
{ const q = find(/15 bilangan acak/); const xs = [2, 0, 1, 3, 0, 2, 2, 1, 0, 3, 2, 2, 1, 0, 2]; eqv(P(q.parts[0]), xs.filter(x => x === 0).length / xs.length); }
{ const q = find(/A, G, G, A, G, A, A, G, G, G, A, G, G, A/); const s = "AGGAGAAGGGAGGA"; eqv(P(q.parts[0]), [...s].filter(c => c === "G").length / s.length); }
{ const q = find(/Roda bernomor 1–5/); const v = q.scene.values; eqv(q.parts[0].value, v.reduce((a, b) => a + b, 0)); eqv(P(q.parts[1]), v[2] / q.parts[0].value); }
{ const q = find(/Kantong berisi 10 bola merah, kuning, dan hijau/); const v = q.scene.values; [0, 1, 2].forEach(k => eqv(q.parts[k].value, Math.round(v[k] / 200 * 10))); eqv(q.parts.reduce((a, p) => a + p.value, 0), 10); }
{ const q = find(/Kotak berisi 20 bola/); [0.09, 0.26, 0.65].forEach((r, k) => eqv(q.parts[k].value, Math.round(r * 20))); eqv(q.parts.reduce((a, p) => a + p.value, 0), 20); }
{ const q = find(/kurang dari 5\./); eqv(q.parts[0].value, 60 * 4 / 6); }
{ const q = find(/8 juring sama besar bernomor 1–8/); eqv(q.parts[0].value, 100 * [2, 3, 5, 7].length / 8); }
{ const q = find(/Gim Koin/); const s = coins(4), hit = s.filter(x => G(x) === 0 || G(x) === 4).length; eqv(P(q.parts[0]), hit / 16); eqv(q.parts[1].value, 8 * hit / 16); }
{ const q = find(/roda yang terbagi lima juring/); let k = 0; for (let a = 1; a <= 5; a++) for (let b = 1; b <= 5; b++) for (let c = 1; c <= 5; c++) if ((a + b + c) / 3 < 2) k++; eqv(q.parts[0].value, 125); eqv(P(q.parts[1]), k / 125); }
{ const q = find(/lima kartu bernomor 1–5. Dua kartu/); const ok = []; for (let a = 1; a <= 5; a++) for (let b = a + 1; b <= 5; b++) if (a + b === 6) ok.push(`${a}-${b}`); assert.deepEqual([...q.parts[0].answer].sort(), ok.sort()); eqv(P(q.parts[1]), ok.length / 10); }
{ const q = find(/Empat anak tingginya/); const h = [158, 142, 163, 147], groups = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]], items = q.parts[0].items;
  const good = groups.filter(g => g.reduce((a, i) => a + h[i], 0) / 3 > 152).map(g => g.map(i => h[i]).join(", ")); assert.deepEqual(items, groups.map(g => g.map(i => h[i]).join(", "))); assert.deepEqual([...q.parts[0].answer].sort(), good.sort()); eqv(P(q.parts[1]), good.length / 4); }
{ const q = find(/Medan ke Palembang/); const [r1, r2] = q.scene.rows.map(r => r.slice(1)); const tot = [...r1, ...r2].reduce((a, b) => a + b, 0); eqv(P(q.parts[0]), (r1[1] + r2[1]) / tot); eqv(P(q.parts[1]), r1[2] / (r1[2] + r2[2])); }
{ const q = find(/bebek karet/); eqv(q.parts[0].value, 3 * 3 / 10);
  let sum = 0, cnt = 0; const ducks = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0]; for (let a = 0; a < 10; a++) for (let b = a + 1; b < 10; b++) for (let c = b + 1; c < 10; c++) { sum += ducks[a] + ducks[b] + ducks[c]; cnt++; } eqv(sum / cnt, q.parts[0].value); eqv(q.parts[1].value, 50 * (10000 - 10000 * sum / cnt)); }
{ const q = find(/ketapelnya/); eqv(P(q.parts[0]), 45 / 54); eqv(P(q.parts[1]), 15 / 20); assert.equal(q.parts[2].answer, [P(q.parts[0]) > 0.8, P(q.parts[1]) > 0.8].join() === "true,false" ? "Karuna saja" : "?"); }
{ const q = find(/Kuis tiga tirai/); let win = 0, tot = 0; for (let prize = 0; prize < 3; prize++) for (let pick = 0; pick < 3; pick++) { const open = [0, 1, 2].find(d => d !== prize && d !== pick); const sw = [0, 1, 2].find(d => d !== pick && d !== open); tot++; if (sw === prize) win++; } eqv(P(q.parts[1]), win / tot); }
{ const q = find(/360 desa/); eqv(P(q.parts[0]), 0.9); }
{ const q = find(/grafik menunjukkan frekuensi relatif|Grafik menunjukkan frekuensi relatif/); const s = relSeries(q.scene.p, q.scene.n, q.scene.seed); assert.ok(Math.abs(s.at(-1) - 0.25) < 0.05, `grafik mendekati 0,25: ${s.at(-1)}`); rechecked++; }
{ const q = find(/Diagram titik abu-abu menunjukkan tinggi badan/); const mean = a => a.reduce((x, y) => x + y, 0) / a.length; const pm = mean(heights), [a, b] = q.parts[0].pics.map(p => mean(p.sample));
  assert.equal(heights.length, 40); assert.ok(Math.abs(b - pm) < Math.abs(a - pm)); assert.ok(Math.abs(pm - 155.5) < 0.06, `rata-rata populasi ${pm}`); q.parts[0].pics.forEach(p => p.sample.forEach(v => assert.ok(heights.includes(v)))); rechecked++; }
{ const q = find(/nilai 37 siswa/); const pics = q.parts[0].pics, mean = a => a.reduce((x, y) => x + y, 0) / a.length; const pm = mean(pics[0].population); assert.equal(pics[0].population.length, 37); assert.ok(Math.abs(mean(pics[1].sample) - pm) < Math.abs(mean(pics[0].sample) - pm)); rechecked++; }
assert.equal(num("37,5%"), 0.375); assert.equal(num("3/8"), 0.375); assert.equal(num("0,375"), 0.375);
console.log(`Kunci dihitung ulang dari ruang sampel dan data: ${rechecked}`);
console.log(`Data Kelas 9 Bab 4 valid: ${all.length} soal.`);
