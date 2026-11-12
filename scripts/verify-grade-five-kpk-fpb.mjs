import assert from "node:assert/strict";
import { assessment, practice, topics, correct, ready, formatAnswer, SEP, fields, factorsOf, isPrime, gcd, lcm, gcdAll, lcmAll, primeFactors, ladderOk, ladderRows, months } from "../src/data/grade-five-kpk-fpb.ts";

assert.equal(topics.length, 5);
assert.deepEqual(practice.map(p => p.length), [4, 4, 4, 4, 4]);
practice.forEach((list, t) => list.forEach(q => assert.equal(q.topic, t, q.prompt)));
assert.equal(assessment.length, 24);
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
const perTopic = tally(assessment, q => q.topic);
assert.equal(Object.keys(perTopic).length, 5); Object.values(perTopic).forEach(c => assert.ok(c >= 4 && c <= 6, JSON.stringify(perTopic)));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) {
  assert.notEqual(assessment[i].topic, assessment[i - 1].topic, `soal ${i + 1} berurutan topik`);
  assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level], `tingkat soal ${i + 1}`);
}
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.parts))).size, all.length, "soal ganda");
const kinds = tally(assessment.flatMap(q => q.parts), p => p.kind);
assert.ok(Object.keys(kinds).length >= 10, JSON.stringify(kinds));

// Fungsi dasar.
assert.deepEqual(factorsOf(18), [1, 2, 3, 6, 9, 18]); assert.equal(gcd(72, 150), 6); assert.equal(lcm(72, 150), 1800);
assert.deepEqual(primeFactors(300), [2, 2, 3, 5, 5]); assert.ok(!isPrime(1) && isPrime(2) && !isPrime(49));
assert.ok(ladderOk([72, 150], ladderRows([72, 150]).map(r => [r.d, ...r.q].join(","))));
assert.ok(ladderOk([24, 36], ["3,8,12", "2,4,6", "2,2,3", "2,1,3", "3,1,1"]), "urutan pembagi boleh berbeda");
assert.ok(!ladderOk([24, 36], ["4,6,9", "2,3,9", "3,1,3", "3,1,1"]), "pembagi bukan prima ditolak");

const nums = s => (s.match(/\d+/g) ?? []).map(Number);
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`);
  assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP);
  const counts = q.scene?.type === "items" ? q.scene.rows.map(r => r.n) : null;
  q.parts.forEach((p, i) => {
    const swap = x => v.map((y, j) => (j === i ? x : y)).join(SEP);
    const f = fields(p);
    const wrong = g => assert.ok(!correct(q, swap(g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "grid") {
      const k = p.label.match(/^Kelipatan (\d+)$/), two = p.label.match(/^Kelipatan (\d+) dan (\d+)$/);
      const want = k ? p.answer.filter(() => true) : null;
      if (k) assert.deepEqual(p.answer, Array.from({ length: p.n }, (_, j) => j + 1).filter(x => x % +k[1] === 0));
      else if (two) assert.deepEqual(p.answer, Array.from({ length: p.n }, (_, j) => j + 1).filter(x => x % +two[1] === 0 && x % +two[2] === 0));
      else { assert.equal(p.label, "Bilangan prima"); assert.deepEqual(p.answer, Array.from({ length: p.n }, (_, j) => j + 1).filter(isPrime)); }
      void want; wrong(p.answer.slice(1).join(",")); wrong([...p.answer, p.answer[0] + 1].sort((a, b) => a - b).join(","));
    }
    if (p.kind === "list") { assert.ok(correct(q, swap([...p.answer].reverse().join("|")) ), "urutan bebas"); wrong(p.answer.map((x, j) => (j ? x : x + 1)).join("|")); }
    if (p.kind === "rainbow") { wrong(f.map((x, j) => (j ? x : String(+x + 1))).join("|")); }
    if (p.kind === "cut") { p.lengths.forEach(l => assert.equal(p.n % l, 0)); wrong(f.map((x, j) => (j ? x : String(+x + 1))).join("|")); }
    if (p.kind === "congklak") { assert.ok(p.a <= 28 && p.b <= 28); wrong([f[0], f[1], String(+f[2] + 1)].join("|")); wrong([factorsOf(p.a).slice(1).join(","), f[1], f[2]].join("|")); }
    if (p.kind === "rows") { assert.ok(f[0].split(",").length >= 1, "ada kelipatan persekutuan yang terlihat"); assert.equal(Number(f[1]), Number(f[0].split(",")[0])); wrong(["", f[1]].join("|")); }
    if (p.kind === "calendar") { const d = Number(f[0]); assert.ok(d <= months[p.month].days); assert.ok(q.prompt.includes(`Tanggal ${p.start} ${months[p.month].name}`)); assert.deepEqual(nums(q.prompt).slice(0, 2), p.every); wrong(String(d + 1)); }
    if (p.kind === "tree") { assert.ok(correct(q, swap([...primeFactors(p.n)].reverse().join(",")))); wrong(primeFactors(p.n).slice(1).join(",")); }
    if (p.kind === "factorize") { wrong([f[0], f[1], String(+f[2] + 1), f[3]].join("|")); wrong([f[0] + ",2", f[1], f[2], f[3]].join("|")); }
    if (p.kind === "ladder") { const k = f.length - 2; wrong([...f.slice(0, k - 1), "2,1,1", f[k], f[k + 1]].join("|")); wrong([...f.slice(0, k), f[k], String(+f[k + 1] + 1)].join("|")); }
    if (p.kind === "time") { const sc = q.scene; assert.equal(sc.type, "lights"); const [h, m] = sc.start.split(".").map(Number); const t = h * 60 + m + lcmAll(sc.seconds) / 60; assert.deepEqual(p.answer, [Math.floor(t / 60), t % 60]); assert.equal(lcmAll(sc.seconds) % 60, 0); wrong(`${p.answer[0]}|${p.answer[1] + 1}`); }
    if (p.kind === "tf") { const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]; p.statements.forEach(s => { const m = s.text.match(/hari (\w+), maka \w+ berikutnya bertepatan dengan hari (\w+)/); if (m) assert.equal((days.indexOf(m[1]) + 5) % 7 === days.indexOf(m[2]), s.answer, s.text); if (/setiap 35 hari/.test(s.text)) assert.equal(lcm(5, 7) === 35, s.answer); }); wrong(f.map((x, j) => (j ? x : x === "B" ? "S" : "B")).join("|")); }
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); wrong(p.options.find(o => o !== p.answer));
      const k = p.label.match(/^(Bukan )?[Kk]elipatan (\d+)$/), fa = p.label.match(/^Bukan faktor (\d+)$/);
      if (k) { const ok = p.options.filter(o => (+o % +k[2] === 0) !== Boolean(k[1])); assert.deepEqual(ok, [p.answer], p.label); }
      if (fa) assert.deepEqual(p.options.filter(o => +fa[1] % +o !== 0), [p.answer]); }
    if (p.kind === "number") {
      const L = p.label, n = nums(L);
      if (/^KPK dari/.test(L)) assert.equal(p.answer, lcmAll(n));
      else if (/^FPB dari/.test(L)) assert.equal(p.answer, gcdAll(n));
      else if (/^Kelipatan (\d+) ke-(\d+)/.test(L)) assert.equal(p.answer, n[0] * n[1]);
      else if (/paling banyak:$/.test(L)) assert.equal(p.answer, gcdAll(counts));
      else if (/di setiap (vas|paket|kelompok):$/.test(L)) { const g = gcdAll(counts), k = q.parts.slice(1).indexOf(p); assert.equal(p.answer, counts[k] / g, L); }
      else if (/^Banyak pilihan panjang/.test(L)) assert.equal(p.answer, factorsOf(q.scene.n).length);
      else if (/^Aku adalah/.test(L)) { const [lo, hi] = nums(q.prompt).slice(1, 3); const c = Array.from({ length: hi - lo - 1 }, (_, j) => lo + 1 + j).filter(x => x % 7 === 0 && x % 10 === 6); assert.deepEqual(c, [p.answer]); }
      else if (/Rabu Legi berikutnya tanggal/.test(L)) assert.equal(p.answer, 3 + 35 - 31);
      else assert.fail(`angka tanpa pemeriksaan: ${L}`);
      wrong(String(p.answer + 1));
    }
  });
  if (counts) assert.ok(counts.every(c => nums(q.prompt).includes(c)), `gambar sesuai cerita: ${q.prompt}`);
  // Isian faktor persekutuan sesuai dengan dua pelangi sebelumnya.
  const rb = q.parts.filter(p => p.kind === "rainbow"), cl = q.parts.find(p => p.kind === "list" && /persekutuan/.test(p.label));
  if (rb.length === 2 && cl) assert.deepEqual(cl.answer, factorsOf(rb[0].n).filter(x => rb[1].n % x === 0));
}
const pos = all.flatMap(q => q.parts.filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer)));
assert.ok(new Set(pos).size >= 2, `posisi pilihan ${pos}`);
console.log(`OK: ${practice.flat().length} latihan, ${assessment.length} evaluasi, per subtopik ${JSON.stringify(perTopic)}, jenis ${JSON.stringify(kinds)}, posisi pilihan ${pos.join("")}.`);
