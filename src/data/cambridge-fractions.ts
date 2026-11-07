export const topics = [
  { title: "Add and subtract fractions", steps: ["Estimate using 0, 1/2 or 1 as a benchmark.", "Rewrite both fractions with a common denominator.", "Add or subtract the numerators and simplify."], demo: "Reveal equivalent fractions on two strips." },
  { title: "Use fractions as operators", steps: ["Divide the quantity by the denominator.", "Multiply one share by the numerator.", "An improper fraction can produce more than the original quantity."], demo: "Change the number of groups taken and compare it with the original quantity." },
  { title: "Multiply proper fractions by whole numbers", steps: ["Estimate using a nearby benchmark.", "Repeat the same fractional amount for each group.", "Multiply the numerator by the whole number and simplify."], demo: "Add or remove a group and watch the total change." },
  { title: "Divide proper fractions by whole numbers", steps: ["Estimate the size of one share.", "Split each part into as many smaller parts as there are shares.", "One share is the original fraction multiplied by the reciprocal of the whole number."], demo: "Change the number of shares and highlight one share." },
];

export type FractionQuestion = { prompt: string; answer: string; explanation: string; options?: string[] };
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
export const fraction = (n: number, d: number) => { const g = gcd(n,d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
export function normalise(value: string) {
  const m = value.trim().match(/^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
  if (!m) return /^\d+$/.test(value.trim()) ? String(Number(value)) : value.trim();
  const [, w, n, d] = m;
  if (!Number(d) || [w ?? "", n, d].some(x => x.length > 6)) return "";
  return fraction(Number(w ?? 0) * Number(d) + Number(n), Number(d));
}
export const correct = (q: FractionQuestion, value: string) => normalise(value) === normalise(q.answer);
const input = (prompt: string, n: number, d: number, explanation: string): FractionQuestion => ({prompt, answer: fraction(n,d), explanation});
const choose = (prompt: string, options: string[], at: number, explanation: string): FractionQuestion => ({prompt, options, answer: options[at], explanation});
const combine = (a: number,b: number,c: number,d: number, sign: 1|-1) => {
  const den = b*d/gcd(b,d), left = a*den/b, right = c*den/d;
  const symbol = sign === 1 ? "+" : "−";
  return input(`Calculate ${a}/${b} ${symbol} ${c}/${d}.`,left+sign*right,den,`Use denominator ${den}: (${left} ${symbol} ${right})/${den} = ${fraction(left+sign*right,den)}.`);
};
const op = (a:number,b:number,n:number) => input(`Find ${a}/${b} of ${n}.`,a*n,b,`Divide ${n} by ${b}, then multiply by ${a}: ${fraction(a*n,b)}.`);
const mult = (a:number,b:number,n:number) => input(`Calculate ${a}/${b} × ${n}.`,a*n,b,`Multiply the numerator by ${n}, then simplify ${a*n}/${b}.`);
const div = (a:number,b:number,n:number) => input(`Calculate ${a}/${b} ÷ ${n}.`,a,b*n,`Split each ${1}/${b} into ${n} equal pieces, so one share is ${a}/${b*n}.`);
export const practice: FractionQuestion[][] = [
  [choose("Estimate 4/9 + 5/11 using the nearest benchmark for each fraction.",["1/2","1","2"],1,"Both fractions are close to 1/2."),combine(5,6,3,8,1),combine(7,10,1,6,-1),input("A bottle has capacity 7/8 L and contains 1/3 L. How many litres are needed to fill it?",13,24,"Subtract 8/24 from 21/24.")],
  [op(3,8,40),op(7,4,28),input("Two-fifths of Ava’s ribbon is 18 cm. How long is the whole ribbon in centimetres?",45,1,"One fifth is 9 cm, so five fifths are 45 cm."),choose("Which expression finds 5/6 of 42?",["42 ÷ 5 × 6","42 ÷ 6 × 5","42 × 6"],1,"Find one sixth first, then take five shares.")],
  [choose("Estimate 5/11 × 6 using the nearest benchmark to 5/11.",["1","3","6"],1,"5/11 is close to 1/2; half of 6 is 3."),mult(3,7,5),input("Each packet weighs 5/12 kg. What is the total mass of 9 packets in kilograms?",15,4,"9 × 5/12 = 45/12 = 15/4."),input("One panel needs 1/4 L of blue paint and 2/5 L of white paint. How many litres are needed for 6 panels?",39,10,"One panel needs 13/20 L. Multiply by 6.")],
  [choose("Estimate 5/9 ÷ 4 using the nearest benchmark to 5/9.",["1/4","1/2","1/8"],2,"5/9 is close to 1/2, and 1/2 shared among four is 1/8."),div(5,8,3),input("Share 7/10 L of juice equally among 4 cups. How many litres are in each cup?",7,40,"Each cup receives one fourth of 7/10 L."),choose("Maya divides both terms of 4/6 by 2 to share it equally. What should she do instead?",["Multiply 4/6 by 1/2","Multiply 4/6 by 2","Keep 4/6 unchanged"],0,"Dividing both terms makes an equivalent fraction. Sharing requires multiplying by 1/2.")],
];
export const assessment: FractionQuestion[] = [
  combine(7,12,5,18,1),op(7,9,63),mult(5,8,7),div(7,12,5),
  choose("Estimate 7/15 + 11/12 using the nearest benchmark for each term.",["1","2","1 1/2"],2,"7/15 is near 1/2 and 11/12 is near 1."),
  op(9,5,45),choose("Estimate 7/15 × 8 using the nearest benchmark to 7/15.",["4","8","2"],0,"7/15 is near 1/2; half of 8 is 4."),choose("Estimate 4/9 ÷ 5 using the nearest benchmark to 4/9.",["1/5","1/10","1/2"],1,"4/9 is near 1/2; one fifth of 1/2 is 1/10."),
  combine(11,15,5,12,-1),input("Three eighths of a ribbon is 24 cm. How long is the whole ribbon in centimetres?",64,1,"One eighth is 8 cm, so eight eighths are 64 cm."),input("One shelf needs 3/8 L of varnish. How many litres are needed for 9 shelves?",27,8,"9 × 3/8 = 27/8 L."),input("Share 8/11 kg of flour equally among 6 bowls. How many kilograms are in each bowl?",4,33,"8/11 ÷ 6 = 8/66 = 4/33."),
  input("A jug holds 11/12 L and contains 2/7 L. How many litres are needed to fill it?",53,84,"77/84 − 24/84 = 53/84."),
  choose("Which is the correct first step for finding 11/8 of 72 by dividing first?",["72 ÷ 11","72 × 8","72 ÷ 8"],2,"Divide by the denominator, then multiply by the numerator."),
  input("Each gate needs 2/9 L of primer and 5/12 L of paint. How many litres are needed for 6 gates?",23,6,"One gate needs 23/36 L. Multiply by 6."),
  choose("A learner says 6/10 ÷ 3 is 6/10 because the fraction still has the same value after simplification. Which result is correct?",["3/5","1/5","9/5"],1,"Sharing into thirds gives 6/30 = 1/5."),
  choose("A tank is full. Can you use 5/8 of the tank for cleaning and 7/18 of the tank for watering?",["Yes, the total is less than 1","No, the total is greater than 1","Yes, the total is exactly 1"],1,"45/72 + 28/72 = 73/72, which is more than 1."),
  input("Nina has 48 stickers. Leo has 5/4 as many as Nina. Riya has 2/3 as many as Leo. How many stickers does Riya have?",40,1,"Leo has 60. Two thirds of 60 is 40."),
  input("Seven bags each contain 5/6 kg of rice. Two bags are used. How many kilograms remain?",25,6,"Five bags remain, each containing 5/6 kg."),
  input("A 7/8 m strip is cut into 3 equal pieces. Each piece is then cut into 4 equal parts. How many metres long is one small part?",7,96,"There are 12 equal parts, so calculate 7/8 ÷ 12."),
  input("A full pail loses 3/10 of its water. Later, 1/4 of the original full pail is used. What fraction of a full pail remains?",9,20,"1 − 6/20 − 5/20 = 9/20."),
  input("A team solves 4/5 as many puzzles as another team. Together they solve 63. How many does the first team solve?",28,1,"Nine equal shares make 63. The first team solves four shares."),
  input("A 24 kg sack is 3/4 full relative to its 32 kg capacity. One third of the rice is used, then half of what remains is used. How many kilograms are left?",8,1,"After the first use 16 kg remains. Half of that is 8 kg."),
  choose("Two equal strips are each 5/6 m long. One is divided into 2 groups of 4 equal pieces, and the other into 6 equal pieces. Which pieces are shorter?",["The pieces from the first strip","The pieces from the second strip","They are equally long"],0,"Eight equal pieces of the same total length are shorter than six."),
];
