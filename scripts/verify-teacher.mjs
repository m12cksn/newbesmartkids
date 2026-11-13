import assert from "node:assert/strict";
import { band, cellOf, columns, columnStats, groupStats, toCsv } from "../src/lib/teacher.ts";

// Rekap kelas sekolah: kolom bab, nilai per sel, rata-rata, siswa tidak aktif, CSV.
const mats = [
  { slug: "pola-gambar", title: "Pola Gambar", classId: 4, chapter: 3 },
  { slug: "bilangan-cacah", title: "Bilangan Cacah", classId: 4, chapter: 1 },
  { slug: "pecahan", title: "Pecahan", classId: 5, chapter: 2 },
];
const now = Date.parse("2026-11-13T05:00:00Z"), ago = d => new Date(now - d * 864e5).toISOString();
const ch = (cls, slug, best, practice = 1) => ({ path: `/kelas/kelas-${cls}-x/materi/${slug}`, title: slug, best, last: best, evals: best === null ? 0 : 1, practice, lastAt: ago(1) });
const g = { id: "g", name: "4A; Harapan", classId: 4, createdAt: ago(30), teacher: null, members: [
  { id: "1", username: "ani", displayName: "Ani", disabled: false, lastAt: ago(1), week: 3, chapters: [ch(4, "bilangan-cacah", 90), ch(4, "pola-gambar", 55)] },
  { id: "2", username: "budi", displayName: "", disabled: false, lastAt: ago(10), week: 0, chapters: [ch(4, "bilangan-cacah", 70), ch(4, "pola-gambar", null, 2), ch(5, "pecahan", 80)] },
  { id: "3", username: "caca", displayName: "Caca \"C\"", disabled: false, lastAt: null, week: 0, chapters: [] },
  { id: "4", username: "dodi", displayName: "Dodi", disabled: true, lastAt: null, week: 0, chapters: [] },
] };

const cols = columns(g, mats);
assert.deepEqual(cols.map(c => c.label), ["Bab 1", "Bab 3", "K5 Bab 2"], "bab kelas rombel urut nomor, lalu bab kelas lain");
assert.equal(cols[0].path, "/kelas/kelas-4-x/materi/bilangan-cacah");
assert.equal(cellOf(g.members[0], cols[1]).best, 55);
assert.equal(cellOf(g.members[1], cols[1]).best, null, "hanya latihan");
assert.equal(cellOf(g.members[2], cols[0]), null);
assert.deepEqual(columnStats(g, cols[0]), { done: 2, avg: 80 });
assert.deepEqual(columnStats(g, cols[1]), { done: 1, avg: 55 });
assert.deepEqual([band(null), band(59), band(60), band(79), band(80)], ["belum", "ulang", "cukup", "cukup", "kuat"]);

// Bab tanpa nilai sama sekali tetap tampil sebagai kolom kosong.
const empty = columns({ ...g, members: [] }, mats);
assert.deepEqual(empty.map(c => [c.label, c.path]), [["Bab 1", ""], ["Bab 3", ""]]);
assert.deepEqual(columnStats({ ...g, members: [] }, empty[0]), { done: 0, avg: null });

const s = groupStats(g, mats, now);
assert.equal(s.total, 4); assert.equal(s.active, 1);
assert.deepEqual(s.inactive.map(m => m.username), ["budi", "caca"], "akun nonaktif tidak dihitung");
assert.equal(s.avgBest, Math.round((90 + 55 + 70 + 80) / 4));
assert.deepEqual(s.weakCols.map(w => w.col.label), ["Bab 3"]);

const csv = toCsv(g, mats).split("\r\n");
assert.equal(csv.length, 5);
assert.equal(csv[0], "Nama;Username;Terakhir belajar;Kegiatan 7 hari;Bab 1 Bilangan Cacah;Bab 3 Pola Gambar;K5 Bab 2 Pecahan");
assert.equal(csv[1], `Ani;ani;${ago(1).slice(0, 10)};3;90;55;`);
assert.equal(csv[2], `budi;budi;${ago(10).slice(0, 10)};0;70;;80`);
assert.equal(csv[3], '"Caca ""C""";caca;;0;;;');
console.log("PASS rekap guru: kolom bab, sel nilai, rata-rata, siswa tidak aktif, CSV");
