// Verifikasi Ujian Akhir Tahun (SAT) Kelas 1: aturan susunan dan kunci jawaban dihitung ulang dari data adegan.
// Jalankan: node --experimental-strip-types scripts/verify-sat-kelas-1.mjs
import assert from "node:assert/strict";
import { satKelas1 as Q, fruitPoll } from "../src/exams/kelas-1-sat/data.ts";
import { answerKey, isCorrect, isAnswered, optionText } from "../src/exams/types.ts";

const byId = id => Q.find(q => q.id === id);
const num = (id, i = 0) => byId(id).parts[i].value;
const ans = id => byId(id).parts[0].answer;
const poll = Object.fromEntries(fruitPoll.map(r => [r.label, r.n]));
const straight = new Set(["book", "window", "door", "frame", "set-square"]);

// ---- Susunan ----
assert.equal(Q.length, 25, "SAT harus 25 soal");
assert.equal(new Set(Q.map(q => q.id)).size, 25, "id soal harus unik");
assert.equal(new Set(Q.map(q => q.prompt)).size, 25, "kalimat soal tidak boleh kembar");
for (let bab = 1; bab <= 8; bab++) assert.ok(Q.filter(q => q.chapters.includes(bab)).length >= 3, `Bab ${bab} minimal 3 soal`);
assert.equal(Q.filter(q => q.chapters.length > 1).length, 1, "tepat satu soal gabungan");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 10, 7], "sebaran tingkat kesulitan");
for (let i = 1; i < Q.length; i++) assert.notDeepEqual(Q[i].chapters, Q[i - 1].chapters, `soal ${i} dan ${i + 1} dari bab yang sama berurutan`);
const pos = [0, 0, 0];
for (const q of Q) for (const p of q.parts) if (p.kind === "choice") {
  const texts = p.options.map(optionText);
  assert.equal(new Set(texts).size, texts.length, `${q.id}: pilihan kembar`);
  assert.equal(texts.filter(t => t === p.answer).length, 1, `${q.id}: jawaban harus tepat satu pilihan`);
  pos[texts.indexOf(p.answer)]++;
}
assert.ok(Math.max(...pos) - Math.min(...pos) <= 2, `posisi jawaban pilihan tidak seimbang: ${pos}`);
for (const q of Q) { assert.ok(isCorrect(q, answerKey(q)), `${q.id}: kunci tidak lolos pemeriksa`); assert.ok(isAnswered(q, answerKey(q))); assert.ok(!isCorrect(q, ""), `${q.id}: jawaban kosong dianggap benar`); assert.ok(q.explanation.length > 20, `${q.id}: pembahasan terlalu pendek`); }

// ---- Kunci dihitung ulang dari adegan ----
const sc = id => byId(id).scene;
assert.deepEqual([num("s01", 0), num("s01", 1)], sc("s01").ns, "s01 bingkai");
assert.equal(num("s02"), sc("s02").groups.reduce((a, g) => a + g.n, 0), "s02 penjumlahan");
assert.equal(ans("s03"), "Jam dinding", "s03 satu-satunya bertepi lengkung");
assert.equal(num("s04"), sc("s04").ns.reduce((a, b) => a + b, 0), "s04 10 + 6");
assert.equal(num("s05"), sc("s05").n - sc("s05").cross, "s05 balon tersisa");
{ const it = sc("s06").items, max = Math.max(...it.map(i => i.length)); assert.equal(it.filter(i => i.length === max).length, 1); assert.equal(ans("s06"), it.find(i => i.length === max).name, "s06 terpanjang"); }
assert.equal(num("s07"), poll.Jeruk, "s07 jeruk");
assert.equal(num("s08"), sc("s08").start + sc("s08").hops, "s08 lompat maju");
assert.equal(num("s09"), sc("s09").whole - sc("s09").a, "s09 pasangan 9");
assert.equal(num("s10"), 10 - sc("s10").ns[0], "s10 membuat 10");
assert.equal(num("s11"), sc("s11").whole - sc("s11").a, "s11 kebalikan");
assert.equal(ans("s12"), "Segi empat", "s12 dua segitiga");
assert.equal(ans("s13"), [16, 11, 19].sort((a, b) => a - b).join(", "), "s13 urutan");
{ const [a, b] = sc("s14").groups; assert.equal(num("s14"), Math.abs(a.n - b.n), "s14 selisih"); }
assert.deepEqual([num("s15", 0), num("s15", 1)], sc("s15").items.map(i => i.length), "s15 penjepit");
assert.equal(num("s16"), poll.Jeruk - poll.Mangga, "s16 jeruk - mangga");
{ const [a, b] = sc("s17").groups; assert.ok(a.n !== b.n && b.big); assert.equal(ans("s17"), a.n > b.n ? a.label : b.label, "s17 lebih banyak"); }
{ const s = sc("s18"); assert.equal(ans("s18"), `${Array(s.groups).fill(s.each).join(" + ")} = ${s.groups * s.each}`, "s18 penjumlahan berulang"); }
assert.equal(num("s19"), sc("s19").groups[0].n - 3 - 2, "s19 dua kali dikurangi");
assert.equal(num("s20"), sc("s20").items.filter(i => straight.has(i)).length, "s20 sisi lurus");
assert.equal(num("s21", 0), sc("s21").whole - sc("s21").a, "s21 pecah 5");
assert.equal(num("s21", 1), 8 + sc("s21").whole, "s21 8 + 5");
assert.ok((8 + sc("s21").a) === 10, "s21 bagian pertama membuat 10");
{ const [a, b] = sc("s22").items; assert.ok((a.start ?? 0) + a.length > (b.start ?? 0) + b.length, "s22 harus menjebak: ujung A lebih jauh"); assert.equal(ans("s22"), a.length > b.length ? a.name : b.name, "s22 panjang sebenarnya");
  assert.ok((a.start ?? 0) + a.length <= sc("s22").grid && b.length <= sc("s22").grid, "s22 muat di petak"); }
{ const after = { ...poll, Apel: poll.Apel - 2, Mangga: poll.Mangga + 2 }; const same = byId("s23").parts[0].options.map(optionText).filter(o => after[o] === after.Salak);
  assert.deepEqual(same, [ans("s23")], "s23 sama dengan salak, tepat satu"); }
{ const cand = [16, 17, 18].filter(n => n > 17); assert.deepEqual(cand, [num("s24")], "s24 bilangan unik"); }
assert.equal(num("s25"), sc("s25").items[0].length + 3, "s25 gabungan");

// ---- Gambar sesuai rentang ----
for (const q of Q) { const s = q.scene; if (!s) continue;
  if (s.type === "frames") s.ns.forEach(n => assert.ok(n >= 0 && n <= 10, `${q.id}: bingkai 0..10`));
  if (s.type === "line") assert.ok(s.start + s.hops <= s.to && s.start >= s.from, `${q.id}: lompatan di dalam garis`);
  if (s.type === "crossed") assert.ok(s.cross < s.n);
}
console.log(`SAT Kelas 1 OK: 25 soal, tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}, posisi pilihan ${pos.join("/")}`);
