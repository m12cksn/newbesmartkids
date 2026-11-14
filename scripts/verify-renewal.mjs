import assert from "node:assert/strict";
import { classesLabel, daysLeft, reminders, reminderMessage, whenText } from "../src/lib/renewal.ts";

const now = Date.parse("2026-11-13T05:00:00Z"), d = n => new Date(now + n * 864e5).toISOString();
const acc = (username, ents, extra = {}) => ({ id: username, username, displayName: username.toUpperCase(), phone: "0812", role: "student", disabled: false, entitlements: ents, ...extra });
const k = (c, days) => ({ package: "kelas", classId: c, expiresAt: d(days) }), all = days => ({ package: "semua", classId: null, expiresAt: d(days) });
const r = reminders([
  acc("a", [k(3, 5)]), acc("b", [k(4, -10)]), acc("c", [k(6, 200)]), acc("d", [k(2, -40)]),
  acc("e", [k(1, 3), k(1, 300)]), // sudah diperpanjang: tidak diingatkan
  acc("f", [k(5, 2), all(400)]), // punya paket semua kelas yang masih lama
  acc("g", [k(7, 1)], { disabled: true }), acc("h", [k(8, 1)], { role: "admin" }), acc("i", [k(9, 14), k(2, 0)]),
], now);
assert.deepEqual(r.map(x => `${x.account.username}:${x.label}:${x.days}:${x.status}`), ["b:Kelas 4:-10:berakhir", "i:Kelas 2:0:segera", "a:Kelas 3:5:segera", "i:Kelas 9:14:segera"]);
assert.equal(daysLeft(d(5), now), 5); assert.equal(whenText(0), "hari ini"); assert.equal(whenText(1), "besok"); assert.equal(whenText(-3), "3 hari yang lalu");
assert.match(reminderMessage(r[2]), /Kelas 3 untuk akun a berakhir 5 hari lagi/); assert.match(reminderMessage(r[0]), /sudah berakhir pada/);
// Paket jenjang SD (kelas 1–6 berakhir bersamaan) menjadi satu pengingat.
const jen = reminders([acc("j", [1, 2, 3, 4, 5, 6].map(c => k(c, 7)))], now);
assert.deepEqual(jen.map(x => x.label), ["Kelas 1–6"]); assert.match(reminderMessage(jen[0]), /Kelas 1–6 untuk akun j/);
assert.equal(classesLabel([7, 9]), "Kelas 7, 9"); assert.equal(classesLabel([8]), "Kelas 8");
console.log("Pengingat perpanjangan valid:", r.length, "pengingat dari 9 akun contoh.");
