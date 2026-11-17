// Mastering Pembagian Garis: membagi dengan mencoret garis lalu mengikatnya per pembagi, kolom demi kolom.
// Sisa garis pindah ke kolom kanan dan bernilai 10 kali lipat.
import type { DailyQuestion, Level, SavedPractice } from "./daily-arithmetic";
export type { DailyQuestion, Level, SavedPractice } from "./daily-arithmetic";

/* Sama seperti latihan harian lain: tanggal WIB, paket berganti pukul 00.00 WIB, jawaban tersimpan per level. */
export function wibDate(now = new Date()): string { return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10); }
export function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export const correctAnswer = (value: string, answer: number) => /^\d{1,4}$/.test(value) && Number(value) === answer;
export function readPractice(raw: string | null): SavedPractice | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || !validDate(v.date) || !Array.isArray(v.answers) || v.answers.length !== 7 || !v.answers.every((a: unknown) => typeof a === "string" && /^\d{0,4}$/.test(a))) return null;
    return { date: v.date, answers: v.answers, checked: v.checked === true && v.answers.every(Boolean) };
  } catch { return null; }
}

export const LEVELS = [
  { id: 1 as Level, name: "Tanpa sisa", description: "Setiap angka langsung habis diikat. Pembagi 2 sampai 5.", detail: "Coret garis, ikat, tulis banyak ikatan." },
  { id: 2 as Level, name: "Sisa pindah kolom", description: "Ada sisa garis yang pindah ke kolom kanan menjadi 10 garis. Pembagi 2 sampai 5.", detail: "Satu sisa garis bernilai 10 di kolom sebelahnya." },
  { id: 3 as Level, name: "Campuran", description: "Pembagi 2 sampai 9, termasuk bilangan yang hilang.", detail: "Pilih langkah garis yang tepat untuk setiap kolom." },
];
export const storageKey = (level: Level) => `bsk-mastering-pembagian-garis-v1-level-${level}`;
/** Batas garis dalam satu kolom agar tetap bisa dicoret dan dihitung anak. */
export const MAX_LINES = 30;

export type Column = { place: string; digit: number; carryIn: number; lines: number; groups: number; rem: number };
const PLACES = ["ribuan", "ratusan", "puluhan", "satuan"];
/** Langkah per kolom: garis = sisa sebelumnya × 10 + angka; ikatan = garis : pembagi. */
export function columns(n: number, q: number): Column[] {
  const digits = String(n).split("").map(Number), places = PLACES.slice(PLACES.length - digits.length);
  let carry = 0;
  return digits.map((digit, i) => {
    const lines = carry * 10 + digit, groups = Math.floor(lines / q), rem = lines % q, col = { place: places[i], digit, carryIn: carry, lines, groups, rem };
    carry = rem; return col;
  });
}
/** Soal boleh diperagakan: 10–999, pembagi 2–9, habis dibagi, dan garis per kolom tidak terlalu banyak. */
export function checkProblem(n: number, q: number): string | null {
  if (!Number.isInteger(n) || n < 10 || n > 999) return "Tulis bilangan 10 sampai 999.";
  if (!Number.isInteger(q) || q < 2 || q > 9) return "Pilih pembagi 2 sampai 9.";
  if (n % q) return `${n} tidak habis dibagi ${q}. Coba bilangan lain.`;
  if (columns(n, q).some(c => c.lines > MAX_LINES)) return "Garisnya terlalu banyak untuk dicoret. Coba bilangan lain.";
  return null;
}
const ok = (n: number, q: number) => checkProblem(n, q) === null;
const hasCarry = (n: number, q: number) => columns(n, q).some(c => c.carryIn > 0);

export type Lesson = { title: string; text: string };
/** Langkah peraga: pisahkan angka, lalu per kolom coret garis dan ikat per pembagi, lalu baca hasil. */
export function lesson(n: number, q: number): Lesson[] {
  const cols = columns(n, q), out: Lesson[] = [{ title: "Pisahkan per angka", text: `Tulis ${n} per angka: ${cols.map(c => c.digit).join(", ")}. Kerjakan dari kolom paling kiri. Setiap ${q} garis nanti diikat menjadi satu.` }];
  cols.forEach((c, i) => {
    const next = cols[i + 1];
    out.push({ title: `Coret garis kolom ${c.place}`, text: c.carryIn ? `Sisa ${c.carryIn} garis dari kolom sebelumnya menjadi ${c.carryIn * 10} garis di sini. Ditambah ${c.digit}, jadi ada ${c.lines} garis.` : c.digit ? `Coret ${c.digit} garis.` : "Angkanya 0, jadi tidak ada garis." });
    const tie = c.groups ? `${c.lines} garis diikat per ${q}: ada ${c.groups} ikatan${c.rem ? `, sisa ${c.rem} garis` : " tanpa sisa"}. Tulis ${c.groups} di bawah.` : `${c.lines} garis belum cukup untuk satu ikatan ${q}. Tulis 0${c.rem ? `, sisa ${c.rem} garis` : ""}.`;
    out.push({ title: `Ikat per ${q}`, text: tie + (c.rem && next ? ` Sisa ${c.rem} garis pindah ke kolom ${next.place}.` : "") });
  });
  const lead = cols[0].groups === 0 ? " Angka 0 di depan tidak ditulis." : "";
  out.push({ title: "Baca hasilnya", text: `Baca angka di bawah dari kiri.${lead} Jadi ${n} : ${q} = ${n / q}.` });
  return out;
}
export const steps = (n: number, q: number): string[] => lesson(n, q).map(l => l.text);

/** Semua soal [bilangan dibagi, pembagi] untuk satu level. */
export function pool(level: Level): [number, number][] {
  const out: [number, number][] = [];
  for (let q = 2; q <= 9; q++) for (let n = 10; n <= 999; n++) {
    if (!ok(n, q)) continue;
    const first = Number(String(n)[0]);
    const pick = level === 1 ? q <= 5 && !hasCarry(n, q) && first >= q && n / q >= 10
      : level === 2 ? q <= 5 && hasCarry(n, q) && first >= q
        : n >= 100 && (q >= 6 || hasCarry(n, q));
    if (pick) out.push([n, q]);
  }
  return out;
}
function rng(seed: number) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function shuffle<T>(items: T[], random: () => number): T[] { const c = [...items]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
/** Tujuh soal per hari per level. Paket sama sepanjang hari (WIB) dan berganti pukul 00.00 WIB. */
export function dailyQuestions(date: string, level: Level): DailyQuestion[] {
  if (!validDate(date) || ![1, 2, 3].includes(level)) throw new Error("Invalid daily exercise");
  const day = Math.floor(Date.parse(date) / 86400000);
  const random = rng(day * 73 + level * 3061);
  const all = pool(level), anchor = ((day * 37) % all.length + all.length) % all.length;
  const chosen: [number, number][] = [all[anchor]];
  const mixed = shuffle(all, random);
  // Utamakan pembagi yang berbeda-beda, lalu lengkapi sampai tujuh soal.
  for (const fresh of [true, false]) for (const p of mixed) {
    if (chosen.length === 7) break;
    if (!chosen.some(c => c[0] === p[0] || (fresh && c[1] === p[1]))) chosen.push(p);
  }
  const blanks: (0 | 1 | 2)[] = level === 3 ? shuffle([2, 2, 2, 2, 0, 1, 1], random) as (0 | 1 | 2)[] : Array(7).fill(2);
  return chosen.map(([n, q], i) => { const values = [n, q, n / q], blank = blanks[i]; return { left: n, right: q, result: n / q, operator: "÷" as const, blank, answer: values[blank], fact: [n, q] }; });
}
export function questionLabel(q: DailyQuestion) {
  return [q.blank === 0 ? "kosong" : q.left, "dibagi", q.blank === 1 ? "kosong" : q.right, "sama dengan", q.blank === 2 ? "kosong" : q.result].join(" ");
}
