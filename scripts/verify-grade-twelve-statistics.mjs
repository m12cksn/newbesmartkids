import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, close, ages80, groupRaw, classWidth, bookDists, readMinutes, queueMinutes } from "../src/data/grade-twelve-statistics.ts";

assert.equal(topics.length, 2); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "A.3", "A.4", "A.5", "B.1", "B.2", "B.3", "B.4", "B.5"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 10, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 10); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 12, B: 12 });
sections.forEach((_, t) => { const c = assessment.filter(q => q.topic === t).length; assert.ok(c >= 2 && c <= 3, `bagian ${t}: ${c}`); });
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)), "| bergambar:", assessment.filter(q => q.scene || q.parts.some(p => p.pics)).length);
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","), JSON.stringify(tally(pos.map(String), x => x)));
assert.equal(new Set(pos).size, 3, "posisi jawaban bervariasi");

/* Kunci dan penolakan jawaban salah. */
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") { wrong(String(p.value + 1).replace(".", ",")); if (p.dp === undefined) assert.ok(Number.isInteger(Math.round(p.value * 1e4 * 1e6) / 1e6), `nilai tepat tanpa pembulatan: ${q.prompt}`); }
    if (p.kind === "row") f.forEach((_, k) => { const g = [...f]; g[k] = String(num(g[k]) + 1).replace(".", ","); wrong(g.join("|")); });
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); assert.equal(new Set(p.options).size, p.options.length); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
}
assert.ok(close("5,1", 5.0996, 2) && close("5,0996", 5.0996, 2) && !close("5,09", 5.0996, 2), "pembulatan dua desimal");
assert.equal(num("37,5%"), 37.5); assert.equal(num("1.312,5"), 1312.5);

/* Hitung ulang secara mandiri dari tabel. */
let rechecked = 0;
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const eqv = (a, b, m = "") => { assert.ok(near(a, b), `${m}: ${a} ≠ ${b}`); rechecked++; };
function stats(d) {
  const u = d.unit ?? 1, cls = d.lows.map(a => [a, a + d.width - u]), mid = cls.map(([a, b]) => (a + b) / 2), lo = d.lows.map(a => a - u / 2);
  const n = d.f.reduce((s, x) => s + x, 0), mean = mid.reduce((s, x, i) => s + x * d.f[i], 0) / n;
  const cum = []; d.f.reduce((s, x) => (cum.push(s + x), s + x), 0);
  const at = k => { let i = 0; while (cum[i] < k) i++; const F = i ? cum[i - 1] : 0; return lo[i] + (d.width * (k - F)) / d.f[i]; };
  const top = Math.max(...d.f), single = d.f.filter(x => x === top).length === 1;
  const m = d.f.indexOf(top), d1 = top - (d.f[m - 1] ?? 0), d2 = top - (d.f[m + 1] ?? 0);
  const ss = mid.reduce((s, x, i) => s + d.f[i] * (x - mean) ** 2, 0);
  return { single, n, mean, median: at(n / 2), mode: lo[m] + (d.width * d1) / (d1 + d2), d1, d2, sr: mid.reduce((s, x, i) => s + d.f[i] * Math.abs(x - mean), 0) / n, v: ss / (n - 1), sd: Math.sqrt(ss / (n - 1)), cum, mid };
}
const pick = [[/^Rata-rata/, "mean"], [/^Median/, "median"], [/^Modus/, "mode"], [/^(Simpangan rata-rata|SR) =/, "sr"], [/^Ragam =/, "v"], [/^Simpangan baku =/, "sd"], [/^d₁/, "d1"], [/^d₂/, "d2"]];
for (const q of all) {
  const d = q.scene && "dist" in q.scene ? q.scene.dist : null; if (!d) continue;
  const s = stats(d);
  for (const p of q.parts) if (p.kind === "num") for (const [re, key] of pick) if (re.test(p.label)) { if (/^(mode|d1|d2)$/.test(key)) assert.ok(s.single, `kelas modus tunggal: ${q.prompt}`); eqv(p.value, s[key], `${q.prompt} ${p.label}`); }
}
/* Soal dengan dua kelompok atau tabel kumulatif. */
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const nums = q => q.parts.filter(p => p.kind === "num").map(p => p.value);
const D = (lows, width, f) => ({ lows, width, f });
const fromCum = c => c.slice(1).map((x, i) => x - c[i]);
const cumOfScene = q => q.scene.rows.map(r => Number(r[1]));
{ const q = find(/kafe A dan kafe B/), v = nums(q), A = stats(D([3, 8, 13, 18, 23], 5, [1, 4, 10, 4, 1])), B = stats(D([3, 8, 13, 18, 23], 5, [5, 3, 4, 3, 5])); eqv(A.mean, 15); eqv(B.mean, 15); eqv(v[0], A.sr); eqv(v[1], B.sr); assert.equal(q.parts[2].answer, A.sr < B.sr ? "Kafe A" : "Kafe B"); }
{ const q = find(/mesin P dan mesin Q/), v = nums(q), P = stats(D([95, 100, 105], 5, [3, 14, 3])), Q = stats(D([95, 100, 105], 5, [7, 6, 7])); eqv(P.mean, 102); eqv(Q.mean, 102); eqv(v[0], P.sd); eqv(v[1], Q.sd); assert.equal(q.parts[2].answer, P.sd < Q.sd ? "Mesin P" : "Mesin Q"); }
{ const q = find(/merek A dan 40 baterai merek B/), v = nums(q), A = stats(D([60, 70, 80, 90, 100], 10, [2, 8, 20, 8, 2])), B = stats(D([60, 70, 80, 90, 100], 10, [6, 9, 10, 9, 6])); eqv(A.mean, 84.5); eqv(B.mean, 84.5); eqv(v[0], A.sd); eqv(v[1], B.sd); assert.equal(q.parts[2].answer, "Merek A"); }
{ const q = find(/kelas A dan 20 siswa kelas B/), v = nums(q), A = stats(D([50, 60, 70, 80, 90], 10, [2, 6, 8, 3, 1])), B = stats(D([50, 60, 70, 80, 90], 10, [1, 3, 12, 3, 1])); eqv(v[0], A.mean); eqv(v[1], A.sr); eqv(v[2], B.sr); assert.equal(q.parts[3].answer, B.sr < A.sr ? "Kelas B" : "Kelas A"); }
{ const q = find(/usia 36 pengunjung museum/), c = cumOfScene(q), s = stats(D([20, 30, 40, 50, 60], 10, fromCum(c))); eqv(nums(q)[0], s.median); }
{ const q = find(/suhu udara tertinggi/), c = cumOfScene(q), s = stats(D([100, 105, 110, 115, 120, 125], 5, fromCum(c))); eqv(nums(q)[0], s.mean); eqv(nums(q)[1], s.median); }
{ const q = find(/lama perjalanan \(menit\) 50 karyawan/), c = cumOfScene(q); fromCum(c).forEach((x, k) => eqv(q.parts[0].values[k], x)); }
{ const q = find(/pesanan harian sebuah warung/), c = cumOfScene(q), f = fromCum(c); f.forEach((x, k) => eqv(q.parts[0].values[k], x)); assert.equal(q.parts[1].answer, q.parts[0].cells[f.indexOf(Math.max(...f))]); }
{ const q = find(/frekuensi 4, x, 10, 6/); const x = nums(q)[0]; eqv(stats(D([60, 70, 80, 90], 10, [4, x, 10, 6])).mean, 80.5); }
{ const q = find(/frekuensi 5, 9, x, 8, 3/); const x = nums(q)[0]; eqv(stats(D([30, 40, 50, 60, 70], 10, [5, 9, x, 8, 3])).mean, 53.25); eqv(nums(q)[1], 25 + x); }
{ const q = find(/n = 20, Σfᵢxᵢ = 300/), v = (20 * 4880 - 300 ** 2) / (20 * 19); eqv(nums(q)[0], v); eqv(nums(q)[1], Math.sqrt(v)); }
{ const q = find(/Hubungan ragam/); eqv(nums(q)[0], Math.sqrt(6.25)); eqv(nums(q)[1], 1.2 ** 2); }
/* Data mentah. */
const R = v => Math.max(...v) - Math.min(...v), count = (v, a, b) => v.filter(x => x >= a && x <= b).length;
{ const q = find(/Lama membaca buku/), v = nums(q); eqv(v[0], 35); eqv(v[1], 73); eqv(v[2], R(readMinutes)); eqv(v[3], Math.ceil(R(readMinutes) / 5)); }
{ const q = find(/lama membaca 30 siswa tadi/); [[35, 42], [43, 50], [51, 58], [59, 66], [67, 74]].forEach(([a, b], k) => eqv(q.parts[0].values[k], count(readMinutes, a, b))); eqv(q.parts[0].values.reduce((s, x) => s + x, 0), readMinutes.length); }
{ const q = find(/Lama antre \(menit\) 32 orang/), v = nums(q); eqv(v[0], R(queueMinutes)); eqv(v[1], Math.ceil(R(queueMinutes) / 6)); }
{ const q = find(/lama antre 32 orang tadi/); [12, 18, 24, 30, 36, 42].forEach((a, k) => eqv(q.parts[0].values[k], count(queueMinutes, a, a + 5))); }
assert.equal(readMinutes.length, 30); assert.equal(queueMinutes.length, 32); assert.equal(ages80.length, 80);
/* Data buku: tabel dari data mentah dan ukuran yang tertulis di buku. */
assert.deepEqual(groupRaw(ages80, 16, 5, 5), bookDists.usia.f, "Tabel 2.1 dari Contoh 2.1");
assert.equal(classWidth(24, 7), 4); assert.equal(classWidth(24, 5), 5);
const book = [["kaya", "mean", 43.6, 0.05], ["kaya", "median", 45.25, 0.005], ["kaya", "mode", 47.1, 0.05], ["usia", "mean", 26.8, 0.05], ["pendapatan", "sr", 12.4, 0.05], ["pendapatan", "sd", 14.6, 0.05], ["pendapatan", "v", 212.3, 0.05],
  ["motor", "sr", 3.5, 0.05], ["motor", "sd", 5.1, 0.05], ["motor", "v", 25.7, 0.05], ["balita", "sr", 1.85, 0.005], ["balita", "sd", 2.26, 0.005]];
for (const [k, key, val, tol] of book) { assert.ok(Math.abs(stats(bookDists[k])[key] - val) <= tol, `buku ${k} ${key}: ${stats(bookDists[k])[key]}`); rechecked++; }
assert.deepEqual(stats(bookDists.nilai).cum, [1, 7, 16, 27, 38, 44]);
/* Grafik menyesatkan dan ogive. */
{ const q = find(/tiga merek kipas angin/), v = nums(q); eqv(v[0], (66 - 60) / (62 - 60)); eqv(v[1], 66 - 62); }
{ const q = find(/toko P, Q, dan R/), v = nums(q); eqv(v[0], (93 - 90) / (91 - 90)); eqv(v[1], 2); }
{ const q = find(/81% dan 84%/); eqv(nums(q)[0], (84 - 80) / (81 - 80)); }
{ const q = find(/tiga penyedia internet/), s = q.parts[0].statements; assert.equal(s[0].answer, (96 - 86) / (88 - 86) === 5); assert.equal(s[1].answer, 96 / 88 === 5); assert.equal(s[2].answer, 96 - 88 === 8); assert.equal(s[3].answer, 96 / 88 < 1.1); rechecked += 4; }
{ const q = find(/KKM-nya 74,5/), s = stats(q.scene.dist), est = s.cum[2] + q.scene.dist.f[3] / 2; eqv(nums(q)[0], est); eqv(nums(q)[1], (est / s.n) * 100); }
{ const q = find(/kurang dari 44,5 menit/), s = stats(q.scene.dist); eqv(nums(q)[0], s.cum[1] + q.scene.dist.f[2] / 2); }
{ const q = find(/lama servis 36 sepeda motor/), s = stats(q.scene.dist); eqv(nums(q)[0], s.cum[1]); eqv(nums(q)[1], s.cum[3]); }
{ const q = find(/waktu tempuh \(menit\) 40 pelari/), s = stats(q.scene.dist); eqv(nums(q)[0], s.cum[2]); eqv(nums(q)[1], s.cum[3] - s.cum[2]); }
{ const q = find(/uang jajan 40 siswa/), s = stats(q.scene.dist); eqv(nums(q)[0], s.cum[2] - s.cum[1]); eqv(nums(q)[1], s.n - s.cum[2]); }
{ const q = find(/tinggi titik-titik ogive/), s = stats(q.scene.dist); eqv(q.parts[0].values.length, 6); [0, ...s.cum].forEach((x, k) => eqv(q.parts[0].values[k], x)); }
{ const q = find(/Upah harian/), s = stats(q.scene.dist), t = q.parts[1].statements; assert.equal(t[0].answer, near(s.mean, 17)); assert.equal(t[1].answer, s.mode > s.mean); assert.equal(t[2].answer, s.cum[1] > s.n / 2); rechecked += 3; }
{ const q = find(/nilai ulangan sebuah angkatan/), s = stats(q.scene.dist), t = q.parts[0].statements; assert.equal(t[1].answer, s.n === 48); assert.equal(t[2].answer, q.scene.dist.f[3] > q.scene.dist.f[1]); assert.ok(s.mid.includes(74.5)); rechecked += 3; }
{ const q = find(/120 pendaftar/), d = q.scene.dist, n = d.f.reduce((a, b) => a + b), v = nums(q); eqv(v[0], d.f[3] + d.f[4]); eqv(v[1], ((d.f[3] + d.f[4]) / n) * 100); eqv(v[2], (d.f[2] / n) * 100); }
{ const q = find(/80 pendaftar beasiswa/), d = q.scene.dist, v = nums(q); eqv(v[0], d.f[3] + d.f[4]); eqv(v[1], ((d.f[3] + d.f[4]) / 80) * 100); }
{ const q = find(/tentukan frekuensi relatif kelas 16–20/), d = q.scene.dist, v = nums(q); eqv(v[0], (d.f[2] / 40) * 100); eqv(v[1], (d.f[0] / 40) * 100); }
/* Pilihan histogram: hanya satu gambar yang frekuensinya sama dengan tabel. */
for (const q of all) for (const p of q.parts) if (p.pics) { const ok = Object.entries(p.pics).filter(([, s]) => JSON.stringify(s.dist.f) === JSON.stringify(q.scene.dist.f)).map(([k]) => k); assert.deepEqual(ok, [p.answer], q.prompt); rechecked++; }
console.log(`Kunci dihitung ulang secara mandiri: ${rechecked}`);
console.log(`Data Kelas 12 Bab 2 valid: ${all.length} soal.`);
