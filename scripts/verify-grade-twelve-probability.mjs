import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, DECK, cardEvents, arrangements, labWords } from "../src/data/grade-twelve-probability.ts";

assert.equal(topics.length, 2); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "A.3", "A.4", "A.5", "A.6", "B.1", "B.2", "B.3", "B.4"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 10, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 10); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 12, B: 12 });
sections.forEach((s, t) => assert.equal(assessment.filter(q => q.topic === t).length, s.code[0] === "A" ? 2 : 3, `bagian ${s.code}`));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)), "| bergambar:", assessment.filter(q => q.scene).length);
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","));
assert.equal(new Set(pos).size, 3, "posisi jawaban bervariasi");

for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "frac") { assert.ok(p.p >= 0 && p.p <= p.q, `peluang 0..1: ${q.prompt}`); assert.ok(correct(q, swap(i, `${2 * f[0]}|${2 * f[1]}`)), "pecahan senilai diterima"); wrong(`${Number(f[0]) + 1}|${f[1]}`); }
    if (p.kind === "row") f.forEach((_, k) => { const g = [...f]; g[k] = String(Number(g[k].replace(/\./g, "")) + 1); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}

/* Hitung ulang dengan enumerasi (tanpa rumus dari berkas data). */
let rechecked = 0;
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const vals = q => q.parts.flatMap(p => (p.kind === "num" ? [p.value] : p.kind === "row" ? p.values : p.kind === "frac" ? [p.p / p.q] : []));
const eq = (q, exp) => { const got = vals(q); assert.equal(got.length, exp.length, q.prompt); got.forEach((g, k) => { assert.ok(Math.abs(g - exp[k]) < 1e-12, `${q.prompt}: ${g} ≠ ${exp[k]}`); rechecked++; }); };
const perms = (xs, r) => (r === 0 ? [[]] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)], r - 1).map(p => [x, ...p])));
const subsets = (xs, r) => (r === 0 ? [[]] : xs.flatMap((x, i) => subsets(xs.slice(i + 1), r - 1).map(s => [x, ...s])));
const words = (w, r) => new Set(perms([...w].map((c, i) => c + i), r).map(p => p.map(x => x[0]).join(""))).size;
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const dice = range(1, 6).flatMap(a => range(1, 6).map(b => [a, b]));
const pr = f => dice.filter(([a, b]) => f(a, b)).length / 36;
/** Banyak susunan melingkar berbeda (rotasi dianggap sama) yang memenuhi syarat. */
const circular = (people, ok) => { const seen = new Set(); for (const p of perms(people, people.length)) { if (!ok(p)) continue; const k = p.indexOf(people[0]); seen.add([...p.slice(k), ...p.slice(0, k)].join()); } return seen.size; };
const block = (p, g) => { const n = p.length; for (let s = 0; s < n; s++) if (g.every((_, k) => g.includes(p[(s + k) % n]))) return true; return false; };
const adj = (p, a, b) => { const i = p.indexOf(a), j = p.indexOf(b), n = p.length; return (i - j + n) % n === 1 || (j - i + n) % n === 1; };
const deck = DECK, rank = c => c.slice(0, -1), suit = c => c.slice(-1);

eq(find(/18 siswa putri dan 14 siswa putra/), [18 + 14]);
eq(find(/4 jenis nasi, 3 jenis lauk/), [4 * 3 * 2, 4 + 3 + 2]);
{ const q = find(/kartu King atau satu kartu Diamond/); eq(q, [deck.filter(c => rank(c) === "K" || suit(c) === "♦").length]); assert.equal(q.parts[0].answer, "Tidak saling lepas"); }
eq(find(/angka 1, 2, 3, 4, 5 akan dibentuk/), [perms([1, 2, 3, 4, 5], 3).length, perms([1, 2, 3, 4, 5], 3).filter(p => p[2] % 2 === 0).length]);
eq(find(/5 kartu 2♣/), [perms([2, 3, 4, 5, 6], 2).length, subsets([2, 3, 4, 5, 6], 2).length]);
eq(find(/3 kartu Ace: A♣, A♠, A♥/), [perms([1, 2, 3], 2).length, subsets([1, 2, 3], 2).length]);
eq(find(/nilai faktorial/), [720, 5040 / 120, 6 * 2]);
eq(find(/ketua, sekretaris, dan bendahara/), [perms(range(1, 7), 3).length]);
eq(find(/Empat hadiah berbeda/), [perms(range(1, 9), 4).length]);
{ const q = find(/P\(n, 2\) = 56/); const sols = range(2, 50).filter(n => n * (n - 1) === 56); eq(q, sols); }
eq(find(/lomba debat beregu/), [subsets(range(1, 8), 3).length]);
eq(find(/jabat tangan|berjabat tangan/), [subsets(range(1, 10), 2).length]);
eq(find(/hubungan permutasi dan kombinasinya/), [perms(range(1, 6), 3).length, 6, subsets(range(1, 6), 3).length]);
eq(find(/3 putra dan 2 putri\. Calonnya/), [subsets(range(1, 6), 3).length, subsets(range(1, 5), 2).length, subsets(range(1, 6), 3).length * subsets(range(1, 5), 2).length]);
eq(find(/"KAKAK"/), [words("KAKAK", 5)]);
eq(find(/"MATEMATIKA"/), [arrangements("MATEMATIKA")]); // 10! terlalu besar untuk enumerasi; dicek ulang di bawah dengan rumus faktorial mandiri
assert.equal(arrangements("MATEMATIKA"), 3628800 / (2 * 6 * 2));
eq(find(/Delapan bendera kecil/), [words("MMMMPPPB", 8)]);
eq(find(/angka 1, 1, 2, 2, 2, 3/), [words("112223", 6)]);
eq(find(/^Enam orang duduk mengelilingi/), [circular(range(1, 6), () => true)]);
eq(find(/Rina dan Sari/), [circular(range(1, 7), p => adj(p, 1, 2))]);
eq(find(/sebaris dengan banyak cara duduk mengelilingi/), [perms(range(1, 5), 5).length, circular(range(1, 5), () => true)]);
eq(find(/Tiga pria dan tiga wanita duduk/), [circular(range(1, 6), p => block(p, [4, 5, 6]))]);
{ const q = find(/S = ｛1, 2, …, 10｝/), A = range(1, 10).filter(x => x % 2 === 0), B = [2, 3, 5, 7]; eq(q, [A.filter(x => B.includes(x)).length, new Set([...A, ...B]).size]); }
eq(find(/Sebuah koin dan sebuah dadu dilantunkan/), [12, ["A", "G"].flatMap(c => range(1, 6).map(d => [c, d])).filter(([c, d]) => c === "G" && d % 2 === 0).length]);
eq(find(/berjumlah 4 atau 9/), [pr((a, b) => a + b === 4 || a + b === 9)]);
eq(find(/12 lulusan PTN dan 8 lulusan PTS/), [1, 13 / 20]);
eq(find(/kartu King atau kartu Heart/), [deck.filter(c => rank(c) === "K" || suit(c) === "♥").length / 52]);
eq(find(/mata 3 pada dadu merah dan mata 6/), [pr((a, b) => a === 3 && b === 6)]);
eq(find(/mata dadu ganjil dan sisi angka/), [range(1, 6).flatMap(d => ["A", "G"].map(c => [d, c])).filter(([d, c]) => d % 2 && c === "A").length / 12]);
eq(find(/0,95/), [0.95 * 0.9]);
eq(find(/Amir masih tinggal/), [(1 - 0.8) * (1 - 0.6)]);
const draw2 = (items, ok) => { let good = 0, tot = 0; for (let i = 0; i < items.length; i++) for (let j = 0; j < items.length; j++) if (i !== j) { tot++; if (ok(items[i], items[j])) good++; } return good / tot; };
eq(find(/keduanya kartu Heart/), [draw2(deck, (x, y) => suit(x) === "♥" && suit(y) === "♥")]);
const bag = (...g) => g.flatMap(([c, k]) => Array(k).fill(c));
eq(find(/6 spidol merah, 4 spidol biru, dan 2 spidol putih/), [draw2(bag(["m", 6], ["b", 4], ["p", 2]), (x, y) => x === "m" && y === "b")]);
eq(find(/100 karyawan menurut jabatan/), [12 / 60]);
eq(find(/40 lembar undian/), [draw2(bag(["h", 4], ["k", 36]), (x, y) => x === "h" && y === "h")]);
// Evaluasi
eq(find(/13 siswa putri dan 11 siswa putra/), [13 * 11]);
{ const q = find(/S = ｛1, 2, …, 15｝/), A = range(1, 15).filter(x => x % 3 === 0), B = range(1, 15).filter(x => x % 2); eq(q, [A.filter(x => B.includes(x)).length, new Set([...A, ...B]).size]); }
eq(find(/berjumlah 6 atau 10/), [pr((a, b) => a + b === 6 || a + b === 10)]);
eq(find(/Tiga orang akan duduk pada 5 kursi/), [perms(range(1, 5), 3).length]);
eq(find(/paling besar 2 dan dadu putih/), [pr((a, b) => a <= 2 && b % 2 === 1)]);
eq(find(/4 pemain dari 9 pemain/), [subsets(range(1, 9), 4).length]);
eq(find(/keduanya kartu King/), [draw2(deck, (x, y) => rank(x) === "K" && rank(y) === "K")]);
eq(find(/"BANDUNG"/), [words("BANDUNG", 7)]);
{ const q = find(/Peneliti serangga/); assert.equal(q.parts[0].answer, "A ∪ C"); assert.equal(q.parts[1].answer, "A ∩ B ∩ C"); rechecked += 2; }
eq(find(/Tiga orang bersaudara/), [circular(range(1, 8), p => block(p, [1, 2, 3]))]);
eq(find(/100 ban/), [(24 + 18) / 100, (15 + 31 + 18) / 100]);
{ const nums = perms([0, 1, 2, 3, 4, 5], 3).filter(p => p[0] !== 0); eq(find(/angka 0, 1, 2, 3, 4, 5/), [nums.length, nums.filter(p => p[0] < 3).length]); }
{ const p6 = pr((a, b) => a + b === 6), p9 = pr((a, b) => a + b === 9); eq(find(/jumlah 6 pada satu lemparan dan jumlah 9/), [p6 * p9 + p9 * p6]); }
{ const q = find(/P\(n, 4\) = 20/), Pn = (n, r) => perms(range(1, n), r).length; eq(q, range(4, 9).filter(n => Pn(n, 4) === 20 * Pn(n, 2))); }
{ let good = 0, tot = 0; const d1 = bag(["s", 5], ["l", 3]), d2 = bag(["s", 2], ["l", 6]); for (const moved of d1) { const second = [...d2, moved]; for (const c of second) { tot++; if (c === "l") good++; } } eq(find(/Dompet pertama berisi 5/), [good / tot]); }
{ const kids = [...range(1, 6).map(i => `L${i}`), ...range(1, 5).map(i => `P${i}`)], teams = subsets(kids, 4); const girls = t => t.filter(x => x[0] === "P").length;
  eq(find(/paduan suara/), [teams.filter(t => girls(t) === 3).length, teams.filter(t => girls(t) === 4).length, teams.filter(t => girls(t) >= 3).length]); }
eq(find(/25 siswa suka basket/), [25 + 18 - 8, 40 - (25 + 18 - 8), (25 + 18 - 8) / 40]);
{ const w = "ABRACADABRA", strs = new Set(perms([...w].map((c, i) => c + i), 3).map(p => p.map(x => x[0]).join(""))); const kinds = s => new Set(s).size;
  eq(find(/ABRACADABRA/), [[...strs].filter(s => kinds(s) === 3).length, [...strs].filter(s => kinds(s) === 2).length, [...strs].filter(s => kinds(s) === 1).length, strs.size]); }
{ const people = [...Array(15).fill("PEP"), ...Array(5).fill("WEP"), ...Array(40).fill("PEM"), ...Array(30).fill("WEM"), ...Array(35).fill("PEB"), ...Array(75).fill("WEB")];
  eq(find(/200 eksekutif/), [people.filter(x => x[0] === "P" || x.endsWith("EP")).length / 200, people.filter(x => x.endsWith("EB") || x[0] === "W").length / 200]); }
eq(find(/Empat pria dan empat wanita/), [circular(range(1, 8), p => p.every((x, i) => !(x > 4 && p[(i + 1) % 8] > 4)))]);
{ const pA = 5 / 12, pB = 4 / 12, pD = 3 / 12, out = [pA, pB, pD]; let alt = 0, bAtLeast = 0;
  for (const a of [0, 1, 2]) for (const b of [0, 1, 2]) for (const c of [0, 1, 2]) { const p = out[a] * out[b] * out[c]; if ((a === 0 && b === 1 && c === 0) || (a === 1 && b === 0 && c === 1)) alt += p; if ([a, b, c].includes(1)) bAtLeast += p; }
  eq(find(/catur 12 babak/), [alt, bAtLeast]); }
{ const q = find(/6 kartu berbeda/), t = q.parts[0].statements; assert.equal(t[0].answer, perms(range(1, 6), 3).length === 120); assert.equal(t[1].answer, subsets(range(1, 6), 3).length === 20); assert.equal(t[2].answer, perms(range(1, 6), 3).length === 3 * subsets(range(1, 6), 3).length); assert.equal(t[3].answer, subsets(range(1, 6), 6).length === 1); rechecked += 4; }
eq(find(/Metodologi Riset/), [7 / (4 + 9 + 7), 9 / 24]);
/* Peraga: angka buku. */
const A = deck.filter(cardEvents.Ace), Q = deck.filter(cardEvents.Queen), H = deck.filter(cardEvents.Heart);
assert.equal(new Set([...A, ...Q]).size, 8); assert.equal(new Set([...A, ...H]).size, 16); assert.equal(A.length * Q.length, 16);
assert.equal(arrangements("SUSUNAN"), 630); assert.ok(labWords.every(w => arrangements(w) === words(w, w.length) || w.length > 8));
assert.equal(words("AAABBC", 6), 60); assert.equal(circular([1, 2, 3, 4], () => true), 6); assert.equal(circular([1, 2, 3, 4, 5], () => true), 24);
assert.equal(deck.filter(c => /[♥♦]/.test(c) && ["3", "4", "5", "6", "7", "8", "9"].includes(rank(c))).length, 14); // Contoh 3.2.8
rechecked += 9;
console.log(`Kunci dihitung ulang dengan enumerasi: ${rechecked}`);
console.log(`Data Kelas 12 Bab 3 valid: ${all.length} soal.`);
