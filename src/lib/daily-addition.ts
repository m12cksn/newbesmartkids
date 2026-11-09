import { validDate, type Level, type DailyQuestion } from './daily-arithmetic';
export { wibDate, correctAnswer, readPractice, type Level, type SavedPractice } from './daily-arithmetic';
export const LEVELS = [
  { id: 1 as Level, name: 'Dasar', description: 'Penjumlahan dan pengurangan sampai 20.', detail: 'Temukan hasil atau bagian yang hilang.' },
  { id: 2 as Level, name: 'Lancar', description: 'Penjumlahan dan pengurangan sampai 100.', detail: 'Berlatih menyimpan dan meminjam.' },
  { id: 3 as Level, name: 'Tantangan', description: 'Penjumlahan dan pengurangan sampai 1.000.', detail: 'Gunakan nilai tempat untuk mencari angka yang kosong.' },
];
export const storageKey = (level: Level) => `bsk-mastering-addition-v1-level-${level}`;
export function dailyQuestions(date: string, level: Level): DailyQuestion[] {
  if (!validDate(date) || ![1,2,3].includes(level)) throw new Error('Invalid daily exercise');
  const day = Math.floor(Date.parse(date) / 86400000);
  let seed = (day * 47 + level * 1009) >>> 0;
  const random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
  const max = level === 1 ? 20 : level === 2 ? 100 : 1000;
  const min = level === 1 ? 1 : level === 2 ? 10 : 100;
  const seen = new Set<string>();
  return Array.from({length:7}, (_,i) => {
    let a: number, b: number;
    do {
      a = min + Math.floor(random() * (max-min*2+1));
      b = min + Math.floor(random() * (max-a-min+1));
    } while (seen.has([a,b].sort((x,y)=>x-y).join(':')));
    seen.add([a,b].sort((x,y)=>x-y).join(':'));
    const operator = (i + day) % 2 === 0 ? '+' as const : '−' as const;
    const values = operator === '+' ? [a,b,a+b] : [a+b,b,a];
    const blank = ((i + day) % 3) as 0|1|2;
    return {left:values[0],right:values[1],result:values[2],operator,blank,answer:values[blank],fact:[a,b]};
  });
}
export function questionLabel(q: DailyQuestion) {
  return [q.blank===0?'kosong':q.left,q.operator==='+'?'ditambah':'dikurangi',q.blank===1?'kosong':q.right,'sama dengan',q.blank===2?'kosong':q.result].join(' ');
}
