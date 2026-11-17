// Verifikasi Kelas 6 Bab 3 Kubus dan Balok: susunan soal, gambar bangun, dan kunci yang dihitung ulang.
// Jalankan: node --experimental-strip-types scripts/verify-grade-six-cubes-v2.mjs
import assert from "node:assert/strict";
import { assessment as Q, practice, topics, answerKey, correct, ready, viewOf, sameGrid, shape, fromHeights, VIEWS, validPath, manhattan, pt, partKey } from "../src/data/grade-six-cubes-v2.ts";

const all = [...practice.flat(), ...Q];
assert.equal(topics.length, 3);
practice.forEach((set, t) => { assert.equal(set.length, 8, `latihan ${topics[t].code} harus 8 soal`); for (const s of [0, 1]) assert.equal(set.filter(q => q.topic === t && q.section === s).length, 4, `latihan ${topics[t].code}.${s + 1} harus 4 soal`); });
assert.equal(Q.length, 24, "evaluasi 24 soal");
assert.equal(new Set(all.map(q => q.prompt + JSON.stringify(q.scene ?? q.parts))).size, all.length, "soal tidak boleh kembar");
const lv = l => Q.filter(q => q.level === l).length;
assert.deepEqual([lv("Sedang"), lv("Menantang"), lv("Sangat menantang")], [8, 9, 7], "sebaran tingkat");
for (let i = 1; i < Q.length; i++) assert.notEqual(Q[i].topic, Q[i - 1].topic, `soal ${i} dan ${i + 1} dari subtopik yang sama berurutan`);
for (let t = 0; t < 3; t++) for (const s of [0, 1]) assert.ok(Q.filter(q => q.topic === t && q.section === s).length >= 3, `evaluasi ${topics[t].code}.${s + 1} minimal 3 soal`);
const kinds = new Set(Q.flatMap(q => q.parts.map(p => p.kind)));
for (const k of ["fill", "choice", "pick", "build", "paint", "point", "path"]) assert.ok(kinds.has(k), `evaluasi memakai bentuk ${k}`);
const action = Q.filter(q => q.parts.some(p => ["pick", "build", "paint", "point", "path"].includes(p.kind))).length;
assert.ok(action >= 10, `soal dengan aksi langsung minimal 10, sekarang ${action}`);

/* Bangun: tidak melayang, tidak kembar, puncak setiap tumpukan terlihat dari arah gambar. */
const key = c => `${c.x},${c.y},${c.z}`;
function checkCubes(cubes, label) {
  const at = new Set(cubes.map(key));
  assert.equal(at.size, cubes.length, `${label}: kubus kembar`);
  for (const c of cubes) if (c.z > 0) assert.ok(at.has(`${c.x},${c.y},${c.z - 1}`), `${label}: kubus melayang ${key(c)}`);
  const inside = (x, y, z) => at.has(`${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`);
  const tops = cubes.filter(c => !at.has(`${c.x},${c.y},${c.z + 1}`));
  for (const c of tops) {
    let seen = 0, n = 0;
    for (let u = 0.1; u < 1; u += 0.2) for (let v = 0.1; v < 1; v += 0.2) {
      n++; let hit = false;
      for (let t = 0.01; t < 8; t += 0.02) if (inside(c.x + u + t, c.y + v - t, c.z + 1 + t)) { hit = true; break; }
      if (!hit) seen++;
    }
    assert.ok(seen / n >= 0.3, `${label}: puncak ${key(c)} hanya terlihat ${Math.round(seen / n * 100)}%`);
  }
}
for (const q of all) {
  const s = q.scene;
  if (s?.type === "iso") checkCubes(s.cubes, q.prompt);
  if (s?.type === "isos") s.items.forEach(it => checkCubes(it.cubes, `${q.prompt} ${it.label}`));
  for (const p of q.parts) if (p.kind === "pick") p.options.forEach((o, i) => { if (o.cubes) checkCubes(o.cubes, `${q.prompt} pilihan ${i + 1}`); });
}

/* Kunci umum */
for (const q of all) {
  assert.equal(q.answer, answerKey(q.parts));
  assert.ok(correct(q, q.answer), `${q.prompt}: kunci tidak lolos`);
  assert.ok(ready(q, q.answer), `${q.prompt}: kunci belum lengkap`);
  assert.ok(!correct(q, ""), `${q.prompt}: kosong dianggap benar`);
  assert.ok(q.explanation.length > 25);
  for (const p of q.parts) {
    if (p.kind === "choice") assert.equal(p.options.filter(o => o === p.answer).length, 1, q.prompt);
    if (p.kind === "pick") {
      const ser = p.options.map(o => JSON.stringify(o.view ?? o.cubes ?? o.die));
      assert.equal(new Set(ser).size, ser.length, `${q.prompt}: pilihan gambar kembar`);
    }
    if (p.kind === "point") { const a = pt(p.at); assert.ok(a.c >= 0 && a.c < p.cols && a.r >= 1 && a.r <= p.rows, q.prompt); assert.ok(!(p.marks ?? []).some(m => m.at === p.at), `${q.prompt}: jawaban sudah bertanda`); }
    if (p.kind === "path") { assert.ok(validPath(p.from, p.to, partKey(p).split(";"))); assert.ok(!validPath(p.from, p.to, [...partKey(p).split(";"), p.to])); }
  }
}

/* Kunci dari gambar */
const scene = q => q.scene;
for (const q of all) {
  const s = scene(q);
  // Soal hitung kubus: jawaban = banyak kubus pada gambar
  if (s?.type === "iso" && /Banyak kubus = □/.test(q.parts[0].text ?? "")) assert.equal(q.parts[0].answers[0], s.cubes.length, q.prompt);
  if (s?.type === "iso" && /Lantai bawah/.test(q.parts[0].text ?? "")) { const z0 = s.cubes.filter(c => c.z === 0).length, z1 = s.cubes.filter(c => c.z === 1).length; assert.deepEqual(q.parts[0].answers, [z0, z1, s.cubes.length], q.prompt); }
  if (s?.type === "iso" && /balok atau/.test(q.parts[0].text ?? "")) assert.deepEqual(q.parts[0].answers, [new Set(s.cubes.map(c => c.g)).size, s.cubes.length], q.prompt);
  if (s?.type === "iso" && /Banyak balok/.test(q.parts[0].text ?? "")) assert.equal(q.parts[0].answers[0], new Set(s.cubes.map(c => c.g)).size, q.prompt);
  // Susun persis sama: denah = gambar
  for (const p of q.parts) if (p.kind === "build" && p.by === "exact") { const want = fromHeights(p.h); assert.equal(s.cubes.length, want.length, q.prompt); for (const v of VIEWS) assert.ok(sameGrid(shape(viewOf(v, s.cubes)), shape(viewOf(v, want))), `${q.prompt}: tampak ${v}`); }
  for (const p of q.parts) if (p.kind === "build" && p.by === "views") for (const v of VIEWS) assert.ok(sameGrid(shape(viewOf(v, s.cubes)), shape(viewOf(v, fromHeights(p.h)))), `${q.prompt}: tampak ${v}`);
  // Pilih bangun dari tampak: tepat satu yang cocok
  if (s?.type === "views") for (const p of q.parts) if (p.kind === "pick") {
    const match = p.options.map(o => VIEWS.every(v => { const a = viewOf(v, o.cubes), b = viewOf(v, s.cubes); return s.mono ? sameGrid(shape(a), shape(b)) : sameGrid(a, b); }));
    assert.equal(match.filter(Boolean).length, 1, `${q.prompt}: harus tepat satu bangun cocok`); assert.equal(match.indexOf(true), p.answer, q.prompt);
  }
  // Pilih tampak: tepat satu yang sama dengan tampak sebenarnya
  if (s?.type === "iso") for (const p of q.parts) if (p.kind === "pick" && p.options[0].view) {
    const v = /kanan/.test(p.label) ? "kanan" : /atas/.test(p.label) ? "atas" : "depan";
    const match = p.options.map(o => sameGrid(o.view, viewOf(v, s.cubes)));
    assert.equal(match.filter(Boolean).length, 1, q.prompt); assert.equal(match.indexOf(true), p.answer, q.prompt);
  }
  // Pilih bangun dengan 5 kubus
  for (const p of q.parts) if (p.kind === "pick" && /tepat 5 kubus/.test(q.prompt)) { const m = p.options.map(o => o.cubes.length === 5); assert.equal(m.filter(Boolean).length, 1); assert.equal(m.indexOf(true), p.answer); }
  // Jarak: mendatar, tegak, jumlah
  for (const f of q.parts) if (f.kind === "fill" && /Mendatar □/.test(f.text)) { const marks = s?.marks ?? q.parts.find(p => p.kind === "path").marks; const [a, b] = ["P", "Q"].map(k => pt(marks.find(m => m.kind === k).at)); assert.deepEqual(f.answers, [Math.abs(a.c - b.c), Math.abs(a.r - b.r), Math.abs(a.c - b.c) + Math.abs(a.r - b.r)], q.prompt); }
  // Banyak jalur kanan/atas = kombinasi
  if (s?.type === "grid" && /Ada □ jalur/.test(q.parts[0].text ?? "")) { const [a, b] = ["K", "L"].map(k => pt(s.marks.find(m => m.kind === k).at)); const h = b.c - a.c, v = b.r - a.r; const C = (n, k) => (k === 0 ? 1 : C(n - 1, k - 1) * n / k); assert.equal(q.parts[0].answers[0], C(h + v, h), q.prompt); }
  // Letak benda pada kertas berpetak
  if (s?.type === "grid" && /\(□,□\)/.test(q.parts[0].text ?? "") && !/Kubus sampai/.test(q.parts[0].text)) {
    const names = [...q.parts[0].text.matchAll(/(\w+) \(□,□\)/g)].map(m => m[1].toLowerCase());
    const want = names.flatMap(n => { const m = s.marks.find(k => k.kind === n); return [m.at[0], Number(m.at.slice(1))]; });
    assert.deepEqual(q.parts[0].answers, want, q.prompt);
  }
  // Peta: jawaban petak sesuai tempat
  if (s?.type === "map") for (const p of q.parts) {
    const m = p.label.match(/^(\w+) di petak/); if (m) assert.equal(p.answer, s.places.find(x => x.name === m[1]).cell, q.prompt);
    const c = p.label.match(/^Petak (\w+) berisi/); if (c) assert.equal(p.answer, s.places.find(x => x.cell === c[1]).name, q.prompt);
  }
}

/* Dadu: simulasi rotasi */
const valid = d => [d.top, d.front, d.right].filter(Boolean).every((a, i, arr) => arr.every((b, j) => i === j || (a !== b && a + b !== 7)));
for (const q of all) if (q.scene?.type === "dice") q.scene.dice.forEach(d => assert.ok(valid(d), `${q.prompt}: dadu tidak sah`));
{ const q = practice[1].find(q => q.scene?.type === "dice"); const d = q.scene.dice[0]; assert.deepEqual(q.parts[0].answers, [7 - d.top, 7 - d.front]); }
{ const q = Q.find(q => q.scene?.type === "dice" && q.scene.dice.length === 1); const d = q.scene.dice[0]; assert.deepEqual(q.parts[0].answers, [7 - d.top, 7 - d.right]); }
{ // Putar mendatar: urutan sisi tegak (depan, kanan, belakang, kiri) bergeser
  const q = Q.find(q => q.scene?.type === "dice" && q.scene.dice.length === 2); const [a, b] = q.scene.dice;
  const ring = [a.front, a.right, 7 - a.front, 7 - a.right]; assert.equal(a.top, b.top);
  const k = ring.indexOf(b.front); assert.ok(k >= 0); assert.equal(q.parts[0].answers[0], ring[(k + 1) % 4], q.prompt);
}
/* Kubus direbahkan: simulasi sisi bertanda */
{
  const q = Q.find(q => /direbahkan 2 kali ke kiri/.test(q.prompt));
  let face = "Atas"; const left = { Atas: "Kiri", Kiri: "Bawah", Bawah: "Kanan", Kanan: "Atas" }, back = { Atas: "Belakang", Belakang: "Bawah", Bawah: "Depan", Depan: "Atas" };
  let p = pt("F1"); for (let i = 0; i < 2; i++) { face = left[face] ?? face; p.c--; } for (let i = 0; i < 2; i++) { face = back[face] ?? face; p.r++; }
  assert.deepEqual(q.parts[0].answers, ["D", 3]); assert.equal(`${"ABCDEFG"[p.c]}${p.r}`, "D3"); assert.equal(q.parts[1].answer, face);
  assert.equal(q.scene.marks.find(m => m.kind === "bendera").at, "D3");
}
{ const q = practice[2].find(q => /direbahkan ke salah satu/.test(q.prompt)); const [a, b] = ["kubus", "bendera"].map(k => q.scene.marks.find(m => m.kind === k).at); assert.equal(q.parts[0].answers[0], manhattan(a, b)); }
/* Kardus: tumpukan dan luas lantai */
{
  const q = Q.find(q => q.prompt.startsWith("Pak Hasan")); const [a, b, c] = q.scene.dims, n = 24, H = 230;
  const opts = [[a, b * c], [b, a * c], [c, a * b]].map(([h, base]) => ({ h, area: Math.ceil(n / Math.floor(H / h)) * base }));
  const best = opts.reduce((m, o) => (o.area < m.area ? o : m)); assert.equal(opts.filter(o => o.area === best.area).length, 1, "luas terkecil tunggal");
  assert.equal(q.parts[0].answer, `${best.h} cm`); assert.equal(q.parts[1].answers[0], best.area);
}
for (const [q, H, h, n] of [[practice[0].find(q => q.scene?.type === "kardus"), 100, 30, 12], [Q.find(q => q.scene?.type === "kardus" && !q.prompt.startsWith("Pak")), 160, 25, 20]]) { const per = Math.floor(H / h); assert.deepEqual(q.parts[0].answers, [per, Math.ceil(n / per)], q.prompt); }
/* Soal (a)/(b): sama jika salah satu putaran mendatar menyamakan */
const rot = cubes => { const X = Math.max(...cubes.map(c => c.x)); return cubes.map(c => ({ ...c, x: c.y, y: X - c.x })); };
const norm = cubes => { const mx = Math.min(...cubes.map(c => c.x)), my = Math.min(...cubes.map(c => c.y)); return cubes.map(c => `${c.x - mx},${c.y - my},${c.z}`).sort().join(" "); };
for (const q of all) if (q.scene?.type === "isos" && q.parts[0].label === "Jawaban:") {
  const [a, b] = q.scene.items.map(i => i.cubes); let r = a, same = false; for (let i = 0; i < 4; i++) { if (norm(r) === norm(b)) same = true; r = rot(r); }
  assert.equal(q.parts[0].answer, same ? "Sama" : "Berbeda", q.prompt);
}
{ const q = Q.find(q => q.prompt.startsWith("Bandingkan kedua bangun")); const [a, b] = q.scene.items.map(i => i.cubes); const same = VIEWS.filter(v => sameGrid(viewOf(v, a), viewOf(v, b))); assert.deepEqual(same, ["depan", "kanan"]); assert.equal(q.parts[0].answer, "Tampak depan dan kanan"); }
{ const q = Q.find(q => q.prompt.includes("3 × 2 × 2")); assert.deepEqual(q.parts[0].answers, [q.scene.cubes.length, 12 - q.scene.cubes.length]); }

/* Sebaran posisi jawaban pilihan */
const pos = Q.flatMap(q => q.parts.filter(p => p.kind === "choice" || p.kind === "pick").map(p => (p.kind === "pick" ? p.answer : p.options.indexOf(p.answer))));
console.log(`Kelas 6 Bab 3 OK: ${topics.length} subtopik, ${practice.flat().length} latihan, ${Q.length} evaluasi (tingkat ${lv("Sedang")}/${lv("Menantang")}/${lv("Sangat menantang")}), ${action} soal beraksi, bentuk ${[...kinds].join(", ")}, posisi jawaban pilihan ${pos.join(",")}`);
