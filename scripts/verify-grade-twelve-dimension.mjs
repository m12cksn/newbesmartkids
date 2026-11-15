import assert from "node:assert/strict";
import { assessment, practice, topics, sections, correct, ready, formatAnswer, SEP, fields, num, surdValue, surdOf, surdText, solidPoints, dist2, lineFoot, planeFoot, edgesOf, cityEdges, routeNet } from "../src/data/grade-twelve-dimension.ts";

assert.equal(topics.length, 3); assert.deepEqual(sections.map(s => s.code), ["A.1", "A.2", "B.1", "B.2", "C.1", "C.2"]);
assert.equal(new Set(sections.map(s => s.lab)).size, 6, "peraga berbeda di setiap bagian");
sections.forEach(s => assert.ok(s.steps.length >= 6 && s.life.length > 250 && s.work.length >= 4 && s.notes.length >= 3, `materi lengkap ${s.title}`));
assert.equal(practice.length, 6); practice.forEach((list, t) => { assert.equal(list.length, 4); list.forEach(q => assert.equal(q.topic, t, q.prompt)); });
assert.equal(assessment.length, 24);
const letter = q => sections[q.topic].code[0];
const tally = (list, key) => list.reduce((a, q) => (a[key(q)] = (a[key(q)] ?? 0) + 1, a), {});
console.log("Evaluasi per subtopik:", JSON.stringify(tally(assessment, letter)), "| per bagian:", JSON.stringify(tally(assessment, q => sections[q.topic].code)));
assert.deepEqual(tally(assessment, letter), { A: 8, B: 8, C: 8 });
sections.forEach((_, t) => assert.equal(assessment.filter(q => q.topic === t).length, 4, `bagian ${t}`));
assert.deepEqual(tally(assessment, q => q.level), { Sedang: 8, Menantang: 9, "Sangat menantang": 7 });
const order = { Sedang: 0, Menantang: 1, "Sangat menantang": 2 };
for (let i = 1; i < 24; i++) { assert.notEqual(letter(assessment[i]), letter(assessment[i - 1]), `subtopik berurutan ${i}`); assert.ok(order[assessment[i].level] >= order[assessment[i - 1].level]); }
const all = [...practice.flat(), ...assessment];
assert.equal(new Set(all.map(q => q.prompt)).size, all.length, "soal ganda");
console.log("Jenis jawaban evaluasi:", JSON.stringify(tally(assessment.flatMap(q => q.parts), p => p.kind)), "| bergambar:", assessment.filter(q => q.scene).length);
const pos = all.flatMap(q => q.parts).filter(p => p.kind === "choice").map(p => p.options.indexOf(p.answer));
console.log("Posisi jawaban pilihan:", pos.join(","), JSON.stringify(tally(pos.map(String), x => x)));
assert.equal(new Set(pos).size, 3, "posisi jawaban bervariasi");

const near = (a, b) => Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(b));
let rechecked = 0;
for (const q of all) {
  assert.ok(correct(q, q.answer), `kunci: ${q.prompt}`); assert.ok(ready(q, q.answer)); assert.ok(!correct(q, "")); assert.ok(!ready(q, ""));
  assert.ok(formatAnswer(q, q.answer).length > 0);
  const v = q.answer.split(SEP), swap = (i, x) => v.map((y, j) => (j === i ? x : y)).join(SEP);
  q.parts.forEach((p, i) => {
    const f = fields(p), wrong = g => assert.ok(!correct(q, swap(i, g)), `salah ditolak: ${q.prompt} ${p.kind} ${g}`);
    if (p.kind === "num") wrong(String(p.value + 1));
    if (p.kind === "surd") { const s = surdOf((p.p * p.p * p.q) / (p.r * p.r)); assert.deepEqual([s.p, s.q, s.r], [p.p, p.q, p.r], `bentuk paling sederhana ${q.prompt}`); assert.ok(correct(q, swap(i, `${2 * p.p}|${p.q}|${2 * p.r}`))); wrong(`${p.p}|${p.q + 1}|${p.r}`); if (p.q !== 1) wrong(`${p.p}|1|${p.r}`); }
    if (p.kind === "tf") f.forEach((_, k) => { const g = [...f]; g[k] = g[k] === "B" ? "S" : "B"; wrong(g.join("|")); });
    if (p.kind === "classify") f.forEach((_, k) => { const g = [...f]; g[k] = p.options.find(o => o !== g[k]); wrong(g.join("|")); });
    if (p.kind === "choice") { assert.ok(p.options.includes(p.answer)); p.options.filter(o => o !== p.answer).forEach(wrong); }
  });
  // Gambar bangun: semua titik yang disebut harus ada.
  if (q.scene?.type === "solid") { const pts = { ...solidPoints(q.scene.shape, q.scene.dims), ...(q.scene.extra ?? {}) }; for (const [a, b] of q.scene.segs ?? []) assert.ok(pts[a] && pts[b], `${a}${b}`); for (const k of q.scene.plane ?? []) assert.ok(pts[k], k); }
}
// Hitung ulang dengan vektor.
const find = re => { const r = all.filter(q => re.test(q.prompt)); assert.equal(r.length, 1, String(re)); return r[0]; };
const val = p => (p.kind === "surd" ? surdValue(p.p, p.q, p.r) : p.value);
const eqv = (a, b, m = "") => { assert.ok(near(a, b), `${m}: ${a} ≠ ${b}`); rechecked++; };
const K = a => solidPoints("kubus", [a]), Bk = (p, l, t) => solidPoints("balok", [p, l, t]);
const L4 = (s, h) => solidPoints("limas4", [s, h]), L3 = (s, h) => solidPoints("limas3", [s, h]), L6 = (s, h) => solidPoints("limas6", [s, h]);
const d = (a, b) => Math.sqrt(dist2(a, b)), dl = (P, A, B) => Math.sqrt(lineFoot(P, A, B).d2), dp = (P, A, B, C) => Math.sqrt(planeFoot(P, A, B, C).d2);
const mid = (a, b) => a.map((x, i) => (x + b[i]) / 2);
const hFromEdge = (s, ta, R) => Math.sqrt(ta * ta - R * R);
const checks = [
  [/A\(1, 2\) ke titik B\(7, 10\)/, [d([1, 2, 0], [7, 10, 0])]],
  [/P\(−3, 1\) ke titik Q\(2, 13\)/, [d([-3, 1, 0], [2, 13, 0])]],
  [/titik \(6, −3\)/, [d([0, 0, 0], [6, -3, 0])]],
  [/Kubus ABCD\.EFGH berusuk 5 cm\./, [d(K(5).B, K(5).D)]],
  [/berusuk 6 cm\. Hitung panjang diagonal ruang AG/, [d(K(6).A, K(6).G)]],
  [/kubus 6 m × 6 m × 6 m/, [d(K(6).E, [3, 3, 6]), d(K(6).A, [3, 3, 6])]],
  [/AB = 8 cm, BC = 6 cm, dan AE = 24 cm/, [d(Bk(8, 6, 24).A, Bk(8, 6, 24).C), d(Bk(8, 6, 24).A, Bk(8, 6, 24).G)]],
  [/AC = 6 cm, BC = 8 cm, dan AB = 10 cm/, [dl([0, 0, 0], [0, 6, 0], [8, 0, 0])]],
  [/PR = 5 cm, QR = 12 cm/, [dl([0, 0, 0], [5, 0, 0], [0, 12, 0])]],
  [/berusuk 6 cm\. Tentukan jarak titik A ke diagonal sisi BE/, [dl(K(6).A, K(6).B, K(6).E)]],
  [/berusuk 10 cm\. Tentukan jarak titik H ke garis DF/, [dl(K(10).H, K(10).D, K(10).F)]],
  [/titik tengah BC\. Tentukan jarak M ke garis EG/, [dl(mid(K(8).B, K(8).C), K(8).E, K(8).G)]],
  [/AB = 4 cm dan TA = 6 cm/, [(() => { const P = L4(4, hFromEdge(4, 6, 2 * Math.SQRT2)); assert.ok(near(d(P.T, P.A), 6)); return dl(P.B, P.T, P.D); })()]],
  [/berada 3 m di atas titik Q/, [3, d([0, 0, 3], [Math.sqrt(5), 0, 0])]],
  [/AB = 6 cm dan TA = 5 cm/, [(() => { const P = L3(6, hFromEdge(6, 5, 6 / Math.sqrt(3))); assert.ok(near(d(P.T, P.A), 5)); return dp(P.T, P.A, P.B, P.C); })()]],
  [/berusuk 6 cm\. Tentukan jarak titik B ke bidang AFGD/, [dp(K(6).B, K(6).A, K(6).F, K(6).G)]],
  [/Luas permukaan kubus ABCD\.EFGH adalah 216/, [dp(K(Math.sqrt(216 / 6)).F, K(6).A, K(6).D, K(6).H), dp(K(6).B, K(6).A, K(6).C, K(6).H)]],
  [/AB = 10 cm dan tinggi TO = 12 cm/, [dp(L4(10, 12).O, L4(10, 12).T, L4(10, 12).B, L4(10, 12).C)]],
  [/berusuk 12 cm\. Tentukan jarak titik C ke bidang BDG/, [dp(K(12).C, K(12).B, K(12).D, K(12).G)]],
  [/AC = 8 cm dan BC = 15 cm/, [dl([0, 0, 0], [0, 8, 0], [15, 0, 0])]],
  [/berusuk 7 cm\./, [d(K(7).A, K(7).C), d(K(7).A, K(7).G)]],
  [/berusuk 4 cm\. Tentukan jarak titik A ke garis CG/, [dl(K(4).A, K(4).C, K(4).G)]],
  [/Kubus ABCD\.EFGH berusuk 8 cm\.$/, [dp(K(8).F, K(8).A, K(8).D, K(8).H), dp(K(8).B, K(8).A, K(8).F, K(8).G)]],
  [/A\(−4, 7\) ke titik B\(4, −8\)/, [d([-4, 7, 0], [4, -8, 0])]],
  [/AB = 12 cm dan TA = 10 cm/, [(() => { const P = L3(12, hFromEdge(12, 10, 12 / Math.sqrt(3))); assert.ok(near(d(P.T, P.A), 10)); return dp(P.T, P.A, P.B, P.C); })()]],
  [/panjang 6 m, lebar 4 m, dan tinggi 3 m/, [d(Bk(6, 4, 3).A, [3, 2, 3])]],
  [/AB = TA = 8 cm/, [(() => { const P = L4(8, hFromEdge(8, 8, 4 * Math.SQRT2)); assert.ok(near(d(P.T, P.A), 8)); return dl(P.T, mid(P.A, P.B), mid(P.A, P.D)); })()]],
  [/AB = 6 cm dan tinggi TO = 4 cm/, [dp(L4(6, 4).O, L4(6, 4).T, L4(6, 4).B, L4(6, 4).C)]],
  [/titik tengah EH\. Tentukan jarak titik P ke garis CF/, [dl(mid(K(6).E, K(6).H), K(6).C, K(6).F)]],
  [/12 m di atas titik Q/, [12, d([0, 0, 12], [5, 0, 0])]],
  [/AB = 6 cm dan TA = 10 cm/, [(() => { const P = L6(6, hFromEdge(6, 10, 6)); assert.ok(near(d(P.T, P.A), 10)); assert.ok(near(d(P.O, mid(P.B, P.E)), 0)); return d(P.T, P.O); })()]],
  [/berusuk 9 cm\. Tentukan jarak titik F ke bidang BEG/, [dp(K(9).F, K(9).B, K(9).E, K(9).G)]],
  [/PB = 2 × rusuk/, [(() => { const k = K(4), P = [k.B[0] + 8, 0, 0], Q = [4, k.G[1] + 4, 4]; eqv(d(k.B, P), 8); eqv(d(k.G, Q), 4); eqv(d(k.F, Q), d(k.F, k.G) + 4); return d(P, Q); })()]],
  [/berusuk 6 cm\. Tentukan jarak titik H ke diagonal ruang DF/, [dl(K(6).H, K(6).D, K(6).F)]],
  [/EC = 5√\{5\}/, [(() => { const t = Math.sqrt(125 - 100), b = Bk(8, 6, t); eqv(d(b.E, b.C), 5 * Math.sqrt(5)); return dp(b.B, b.A, b.C, b.E); })()]],
  [/A\(1, −2, 3\) dan titik B\(7, 1, −3\)/, [d([1, -2, 3], [7, 1, -3])]],
  [/AC = 9 cm, BC = 12 cm, dan AB = 15 cm/, [dl([0, 0, 0], [0, 9, 0], [12, 0, 0]), d([0, 9, 0], lineFoot([0, 0, 0], [0, 9, 0], [12, 0, 0]).F)]],
  [/proyeksi titik C pada bidang AFH/, [(() => { const k = K(9), S = planeFoot(k.C, k.A, k.F, k.H).F; return d(k.A, S); })()]],
];
for (const [re, exp] of checks) { const q = find(re), ps = q.parts.filter(p => p.kind === "num" || p.kind === "surd"); assert.equal(ps.length, exp.length, String(re)); ps.forEach((p, k) => eqv(val(p), exp[k], `${re} bagian ${k}`)); }
// Jalur terpendek pada graf (Dijkstra sederhana) dan banyak rute.
const paths = (edges, a, b) => { const adj = {}; for (const [x, y, w] of edges) { (adj[x] ??= []).push([y, w]); (adj[y] ??= []).push([x, w]); } const out = []; const go = (u, seen, len, path) => { if (u === b) { out.push([path.join("–"), len]); return; } for (const [v, w] of adj[u]) if (!seen.has(v)) go(v, new Set([...seen, v]), len + w, [...path, v]); }; go(a, new Set([a]), 0, [a]); return out.sort((p, q) => p[1] - q[1]); };
{ const q = find(/lintasan terpendeknya/), ps = paths(cityEdges, "A", "D"); assert.equal(q.parts[0].answer, ps[0][0]); eqv(q.parts[1].value, ps[0][1]); }
{ const q = find(/A–B 12 km/), e = [["A", "B", 12], ["B", "C", 14], ["A", "D", 15], ["D", "C", 17], ["D", "B", 13], ["A", "C", 21]], ps = paths(e, "A", "C"); assert.equal(q.parts[0].answer, ps[0][0]); eqv(q.parts[1].value, ps[0][1]); eqv(q.parts[2].value, ps.find(p => p[0] === "A–D–B–C")[1]); }
{ const q = find(/A–B 9 km/), e = [["A", "B", 9], ["B", "C", 12], ["A", "D", 10], ["D", "C", 11], ["D", "B", 7], ["A", "C", 15]], ps = paths(e, "A", "C"); eqv(q.parts[0].value, ps.length); eqv(q.parts[1].value, ps[0][1]); }
{ const ps = paths(routeNet.edges, "A", "C"); eqv(ps[0][1], 26); eqv(ps.length, 5); }
// Pilihan "ruas yang merupakan jarak": ruas itu tegak lurus garis/bidang yang dimaksud.
const perpLine = (pts, P, X, A, B) => near(lineFoot(pts[P], pts[A], pts[B]).d2, dist2(pts[P], pts[X])) && near(dist2(lineFoot(pts[P], pts[A], pts[B]).F, pts[X]), 0);
const perpPlane = (pts, P, X, plane) => near(dist2(planeFoot(pts[P], ...plane.map(k => pts[k])).F, pts[X]), 0);
{ const k = K(4); assert.ok(perpLine(k, "C", "B", "A", "B")); rechecked++; }
{ const k = K(4), map = { BC: ["B", "C", "DCG"], CD: ["C", "D", "ADH"], HE: ["H", "E", "ABF"], CG: ["C", "G", "EFG"] }; for (const r of find(/jarak setiap titik ke bidang/).parts[0].rows) { const [P, X, pl] = map[r.answer]; assert.ok(perpPlane(k, P, X, pl.split("")), r.text); rechecked++; } }
{ const b = Bk(7, 4, 3), nm = { K: "A", L: "B", M: "C", N: "D", O: "E", P: "F", Q: "G", R: "H" }; for (const r of find(/KLMN\.OPQR, tentukan ruas garis/).parts[0].rows) { const [, P, A, B] = /Titik (\w) ke garis (\w)(\w)/.exec(r.text); assert.ok(perpLine(b, nm[P], nm[r.answer[1]], nm[A], nm[B]), r.text); rechecked++; }
  assert.ok(perpPlane(b, "B", "A", ["A", "D", "H"])); rechecked++; }
assert.equal(edgesOf("kubus").length, 12); assert.equal(edgesOf("limas4").length, 8); assert.equal(edgesOf("limas6").length, 12);
assert.equal(surdText(32), "4√{2}"); assert.equal(surdText(32 / 3), "{4√{6}/3}"); assert.equal(surdText(49), "7"); assert.equal(num("4,8"), 4.8);
console.log(`Kunci dihitung ulang dengan vektor: ${rechecked}`);
console.log(`Data Kelas 12 Bab 1 valid: ${all.length} soal.`);
