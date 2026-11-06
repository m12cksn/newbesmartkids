import assert from 'node:assert/strict';
import { assessment,practice,checkAnswer,ready } from '../src/data/grade-four-patterns.ts';
assert.equal(assessment.length,24);
assert.deepEqual(practice.map(p=>p.length),[5,5]);
// Independently calculated keys, including all intermediate blanks and distant terms.
const expected=['15','39','9','70|31','38','7','41|63','8','54','14','100|62','14','29','44|92','6','44|72','22','169|123','12','66|32','54|90|126','18','74|106','204|150|96'];
assert.deepEqual(assessment.map(q=>q.answer),expected);
assert.deepEqual(practice.flat().map(q=>q.answer),['12','8','6','8','4','60','47|77','73|39','31|43','48|24']);
const all=[...practice.flat(),...assessment];
assert.equal(new Set(all.map(q=>q.id)).size,all.length);
for(const q of all){
  assert.ok(q.values.every(n=>Number.isInteger(n)&&n>=0));
  const delta=q.values[1]-q.values[0];
  assert.notEqual(delta,0);
  assert.ok(q.values.slice(1).every((n,i)=>n-q.values[i]===delta));
  assert.ok(ready(q,q.answer));assert.ok(checkAnswer(q,q.answer));assert.ok(!ready(q,''));
  assert.ok(!checkAnswer(q,'9999'));assert.ok(!ready(q,'-1'));assert.ok(!ready(q,'1.5'));
  if(q.answer.includes('|')) assert.ok(!ready(q,q.answer.split('|')[0]));
  if(q.kind==='table') assert.deepEqual(q.answer.split('|').map(Number),q.target.map(n=>q.values[0]+(n-1)*delta));
  else assert.deepEqual(q.answer.split('|').map(Number),q.blanks.map(n=>q.values[n]));
  if(q.choices){assert.equal(new Set(q.choices).size,q.choices.length);assert.equal(q.choices.filter(n=>String(n)===q.answer).length,1);}
  if(q.kind==='build') assert.ok(Number(q.answer)<=40);
  if(q.object && q.kind!=='table') assert.ok(Math.max(...q.values)<=40);
}
assert.equal(new Set(assessment.map(q=>q.kind)).size,5);
console.log('PASS: 34 independent answer keys, visual counts, choice uniqueness, arithmetic rules and incomplete-answer gates');
