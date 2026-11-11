import assert from 'node:assert/strict';
import {assessment,practice} from '../src/data/grade-four-whole-numbers.ts';
assert.equal(assessment.length,24);assert.deepEqual(practice.map(p=>p.length),[4,4,4,4,4,4,4,4]);
assert.deepEqual(Array.from({length:8},(_,i)=>assessment.filter(q=>q.wholeTopic===i).length),Array(8).fill(3));
assert.deepEqual(['Sedang','Menantang','Sangat menantang'].map(l=>assessment.filter(q=>q.wholeLevel===l).length),[8,9,7]);
assert.equal(new Set(assessment.map(q=>q.prompt)).size,24);
// Independent key calculations, not reading answer values from a parallel copy of the dataset.
const keys=[String(Math.floor(7064/100)%10),'6.089 < 6.098',`${4000+1200+6}|${2*100}`,String(2347+1586),'5 ribuan + 5 ratusan + 9 puluhan + 14 satuan',String(27*4),'108 × 8 = 864',Array.from({length:28},(_,i)=>i+1).filter(n=>28%n===0).join('|'),'7.000 dan 700',[9889,10000,9898,9988].sort((a,b)=>b-a).map(n=>n.toLocaleString('id-ID')).join('|'),'1|2',String(7002-4588),String(9000-5746),`${100*8}|${36*8}`,`${Math.floor(1248/6)}|${1248%6}`,Array.from({length:32},(_,n)=>n).filter(n=>n>10&&n%6===0).join('|'),`${8000+1300+40+2}|300`,'6819|6889',`${8005-3780}|8005`,String(218+67-89),String(10000-4586-1274),String(28*36),String((156+114)/6),String(10+7*5)];
assert.deepEqual(assessment.map(q=>q.answer),keys);
for(const q of [...practice.flat(),...assessment]){assert.ok(q.diagram||q.wholeVisual||q.options,q.prompt);if(q.wholeFields)assert.equal(q.answer.split('|').length,q.wholeFields.length);if(q.options)for(const a of q.answer.split('|'))assert.ok(q.options.includes(a));}
assert.ok(assessment.some(q=>q.mode==='order'));assert.ok(assessment.filter(q=>q.wholeFields).length>=5);
assert.ok(!practice[3][0].explanation.includes('puluhan, dan ratusan'));
console.log('Grade 4 whole upgrade: 8 objectives ×3 evaluation questions; 32 practices; all 24 keys independently checked.');
