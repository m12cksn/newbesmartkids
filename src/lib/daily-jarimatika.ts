// Mastering Jarimatika: perkalian 1–10 (hasil sampai 100) dengan jari.
// Tiga cara: tempel jari (6–10 × 6–10), lipat jari (9 × 1–5), dan hitung loncat (salah satu bilangan 1–5).
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
  { id: 1 as Level, name: "Tempel jari", description: "Perkalian 6 sampai 10 dengan cara tempel jari.", detail: "Jari bawah puluhan, jari atas dikali." },
  { id: 2 as Level, name: "Lipat & loncat", description: "Perkalian dengan 1 sampai 5 dan perkalian 9.", detail: "Hitung loncat dengan jari dan lipat jari untuk 9." },
  { id: 3 as Level, name: "Campuran", description: "Semua perkalian 2 sampai 10, termasuk bilangan yang hilang.", detail: "Pilih cara jari yang paling cocok." },
];
export const storageKey = (level: Level) => `bsk-mastering-jarimatika-v1-level-${level}`;

export type Method = "tempel" | "lipat9" | "loncat";
export const methodName: Record<Method, string> = { tempel: "Tempel jari", lipat9: "Lipat jari untuk 9", loncat: "Hitung loncat dengan jari" };
/** Cara jari yang dipakai untuk a × b. */
export function methodFor(a: number, b: number): Method {
  if (a >= 6 && b >= 6) return "tempel";
  if (a === 9 || b === 9) return "lipat9";
  return "loncat";
}
/** Bagian-bagian hitungan tempel jari: jari bawah (puluhan) dan jari atas (satuan) setiap tangan. */
export const tempelParts = (a: number, b: number) => ({ downL: a - 5, downR: b - 5, upL: 10 - a, upR: 10 - b, tens: (a - 5 + b - 5) * 10, units: (10 - a) * (10 - b) });
/** Lipat jari ke-n: jari di kiri lipatan puluhan, di kanan satuan. */
export const lipatParts = (n: number) => ({ left: n - 1, right: 10 - n });
/** Hitung loncat: angkat jari sebanyak bilangan kecil, setiap jari menambah bilangan besar. */
export const loncatParts = (a: number, b: number) => { const fingers = Math.min(a, b), step = Math.max(a, b); return { fingers, step, totals: Array.from({ length: fingers }, (_, i) => (i + 1) * step) }; };

/** Langkah penjelasan untuk peraga dan petunjuk. */
export function steps(a: number, b: number): string[] {
  const m = methodFor(a, b);
  if (m === "tempel") {
    const p = tempelParts(a, b);
    return [
      `Kelingking bernilai 6, jari manis 7, jari tengah 8, telunjuk 9, ibu jari 10.`,
      `Tempelkan jari ${a} di tangan kiri dengan jari ${b} di tangan kanan.`,
      `Jari yang menempel dan di bawahnya: ${p.downL} + ${p.downR} = ${p.downL + p.downR} jari. Setiap jari bernilai 10, jadi ${p.tens}.`,
      `Jari di atasnya: ${p.upL} jari × ${p.upR} jari = ${p.units}.`,
      `${p.tens} + ${p.units} = ${a * b}. Jadi ${a} × ${b} = ${a * b}.`,
    ];
  }
  if (m === "lipat9") {
    const n = a === 9 ? b : a, p = lipatParts(n);
    return [
      `Buka kesepuluh jari. Beri nomor 1 sampai 10 dari kiri.`,
      `Lipat jari ke-${n}.`,
      `Jari di kiri lipatan ada ${p.left}. Itu puluhannya: ${p.left * 10}.`,
      `Jari di kanan lipatan ada ${p.right}. Itu satuannya: ${p.right}.`,
      `${p.left * 10} + ${p.right} = ${9 * n}. Jadi 9 × ${n} = ${9 * n}.`,
    ];
  }
  const p = loncatParts(a, b);
  return [
    `Angkat ${p.fingers} jari satu per satu. Setiap jari bernilai ${p.step}.`,
    ...p.totals.map((t, i) => `Jari ke-${i + 1}: ${t}.`),
    `Jari terakhir menunjukkan ${p.fingers * p.step}. Jadi ${a} × ${b} = ${a * b}.`,
  ];
}

function rng(seed: number) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function shuffle<T>(items: T[], random: () => number): T[] { const c = [...items]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; }
/** Semua pasangan berbeda (tanpa memperhatikan urutan) untuk satu level. */
export function pool(level: Level): [number, number][] {
  const out: [number, number][] = [];
  for (let a = 1; a <= 10; a++) for (let b = a; b <= 10; b++) {
    const ok = level === 1 ? a >= 6 : level === 2 ? a >= 2 && (a <= 5 || b === 9) && !(a >= 6 && b >= 6) : a >= 2;
    if (ok) out.push([a, b]);
  }
  return out;
}
/** Tujuh soal per hari per level. Paket sama sepanjang hari (WIB) dan berganti pukul 00.00 WIB. */
export function dailyQuestions(date: string, level: Level): DailyQuestion[] {
  if (!validDate(date) || ![1, 2, 3].includes(level)) throw new Error("Invalid daily exercise");
  const day = Math.floor(Date.parse(date) / 86400000);
  const random = rng(day * 61 + level * 2027);
  const all = pool(level), anchor = ((day % all.length) + all.length) % all.length;
  const pairs = [all[anchor], ...shuffle(all.filter((_, i) => i !== anchor), random).slice(0, 6)].map(([a, b]) => (random() < 0.5 ? [a, b] : [b, a]) as [number, number]);
  const blanks: (0 | 1 | 2)[] = level === 3 ? shuffle([2, 2, 2, 0, 1, 0, 1], random) as (0 | 1 | 2)[] : Array(7).fill(2);
  return pairs.map(([a, b], i) => { const values = [a, b, a * b], blank = blanks[i]; return { left: a, right: b, result: a * b, operator: "×" as const, blank, answer: values[blank], fact: [a, b] }; });
}
export function questionLabel(q: DailyQuestion) {
  return [q.blank === 0 ? "kosong" : q.left, "dikali", q.blank === 1 ? "kosong" : q.right, "sama dengan", q.blank === 2 ? "kosong" : q.result].join(" ");
}
