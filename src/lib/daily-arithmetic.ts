export type Level = 1 | 2 | 3;
export type DailyQuestion = { left: number; right: number; result: number; operator: '×' | '÷' | '+' | '−'; blank: 0 | 1 | 2; answer: number; fact: [number, number] };
export const LEVELS = [
  { id: 1 as Level, name: 'Dasar', description: 'Keluarga perkalian 1, 2, 5, dan 10.', detail: 'Bangun kebiasaan dengan bilangan 1–10.' },
  { id: 2 as Level, name: 'Lancar', description: 'Keluarga perkalian 3, 4, 6, 7, 8, dan 9.', detail: 'Latih ingatan dengan pasangan bilangan 2–12.' },
  { id: 3 as Level, name: 'Tantangan', description: 'Bilangan dua digit × satu digit.', detail: 'Gunakan strategi untuk bilangan 11–49 dan 3–9.' },
];
export function wibDate(now = new Date()): string {
  return new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
function rng(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function dailyQuestions(date: string, level: Level): DailyQuestion[] {
  if (!validDate(date) || ![1,2,3].includes(level)) throw new Error('Invalid daily exercise');
  const day = Math.floor(Date.parse(date) / 86400000);
  const random = rng(day * 31 + level * 1009);
  const factors = level === 1 ? [1,2,5,10] : level === 2 ? [3,4,6,7,8,9] : Array.from({length:39},(_,i)=>i+11);
  const pool: [number,number][] = [], seen = new Set<string>();
  for (const a of factors) for (let b = level === 1 ? 1 : level === 2 ? 2 : 3; b <= (level === 1 ? 10 : level === 2 ? 12 : 9); b++) {
    const key = [a,b].sort((x,y)=>x-y).join(':');
    if (!seen.has(key)) { pool.push([a,b]); seen.add(key); }
  }
  // A rotating anchor guarantees a different first fact on adjacent dates.
  const anchor = ((day % pool.length) + pool.length) % pool.length;
  const pairs = [pool[anchor], ...shuffle(pool.filter((_,i)=>i!==anchor),random).slice(0,6)];
  const formats = shuffle([0,1,2,3,4,0,3], random);
  return pairs.map(([a,b],i) => {
    const format = formats[i], operator = format < 3 ? '×' as const : '÷' as const;
    const values = operator === '×' ? [a,b,a*b] : [a*b,b,a];
    const blank = (format === 1 ? 0 : format === 2 || format === 4 ? 1 : 2) as 0|1|2;
    return { left:values[0], right:values[1], result:values[2], operator, blank, answer:values[blank], fact:[a,b] };
  });
}
export function correctAnswer(value: string, answer: number) { return /^\d{1,4}$/.test(value) && Number(value) === answer; }
export function questionLabel(q: DailyQuestion) {
  return [q.blank===0?'kosong':q.left, q.operator==='×'?'dikali':'dibagi', q.blank===1?'kosong':q.right, 'sama dengan', q.blank===2?'kosong':q.result].join(' ');
}
export type SavedPractice = { date:string; answers:string[]; checked:boolean };
export function readPractice(raw: string | null): SavedPractice | null {
  try {
    const v = JSON.parse(raw ?? 'null');
    if (!v || !validDate(v.date) || !Array.isArray(v.answers) || v.answers.length !== 7 || !v.answers.every((a:unknown)=>typeof a==='string' && /^\d{0,4}$/.test(a))) return null;
    return { date:v.date, answers:v.answers, checked:v.checked===true && v.answers.every(Boolean) };
  } catch { return null; }
}
export const storageKey = (level:Level) => `bsk-mastering-v1-level-${level}`;
