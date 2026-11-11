import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,category} from '../src/data/grade-six-probability.ts';
assert.equal(assessment.length,24);assert.equal(practice.length,3);
assert.deepEqual(practice.map(p=>p.length),[5,5,5]);
assert.deepEqual([0,1,2].map(t=>assessment.filter(q=>q.topic===t).length),[8,8,8]);
assert.deepEqual(['Sedang','Menantang','Sangat menantang'].map(l=>assessment.filter(q=>q.level===l).length),[8,9,7]);
const all=[...practice.flat(),...assessment];assert.equal(new Set(all.map(q=>q.id)).size,39);
for(const q of all){assert.ok(correct(q,q.answer),q.id);assert.ok(ready(q,q.answer),q.id);assert.ok(!ready(q,''),q.id);assert.ok(!correct(q,'999'),q.id);if(q.options)for(const x of q.answer.split('|'))assert.ok(q.options.includes(x),q.id);}
// Independent examples for all scale boundaries, ratio comparisons and nonunique construction rules.
assert.deepEqual([0,1,4,7,8].map(n=>category(n,8)),[0,1,2,3,4]);
assert.equal(assessment[4].answer,'A');assert.ok(2*6>2*4);
assert.equal(assessment[5].answer,'A');assert.ok(3*8>5*4);
assert.equal(assessment[11].answer,String(15*4/10));
assert.equal(assessment[17].answer,'C|A|B');assert.ok(3/4>4/8&&4/8>3/9);
const paint=assessment[7];assert.ok(correct(paint,'0|1|0|2|0|1|0|0|1|0'));assert.ok(!correct(paint,'0|0|0|0|0|1|1|1|1|1'));
assert.ok(correct(assessment[6],'7|5'));assert.ok(correct(assessment[6],'11|1'));assert.ok(!correct(assessment[6],'6|6'));assert.ok(!correct(assessment[6],'12|0'));
assert.ok(correct(assessment[3],'1|2|4|2|2|6'));assert.ok(!correct(assessment[3],'2|2|2|2|1|1'));
for(let n=0;n<=12;n++)assert.equal(correct(assessment[6],`${n}|${12-n}`),n>6&&n<12);
assert.ok(!ready(paint,'0|0|0|0|0|0|1|1|1|'));
assert.equal(Array.from({length:36},(_,i)=>[Math.floor(i/6)+1,i%6+1]).filter(([x,y])=>x===2||y===2).length,11);assert.ok(11/36>1/6);assert.equal(assessment[22].answer,'B lebih mungkin; kurang adil');
console.log('39 questions, 24 interleaved evaluation keys, boundaries and alternate constructions passed');
