import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,gcd,topics} from '../src/data/grade-six-ratio.ts';
assert.equal(topics.length,6);
assert.equal(assessment.length,24);
assert.equal(practice.length,6);
const all=[...practice.flat(),...assessment];
assert.equal(all.length,48);
assert.equal(new Set(all.map(q=>q.id)).size,48);
assert.equal(new Set(all.map(q=>q.prompt)).size,48);
for(let t=0;t<6;t++){assert.equal(practice[t].length,4);assert.equal(assessment.filter(q=>q.topic===t).length,4);}
assert.deepEqual(['Sedang','Menantang','Sangat menantang'].map(l=>assessment.filter(q=>q.level===l).length),[8,9,7]);
for(const q of all){
 assert.ok(q.source&&q.explanation&&q.scene,q.id);
 assert.ok(ready(q,q.answer),q.id);
 assert.ok(correct(q,q.answer),q.id);
 assert.ok(!ready(q,''),q.id);
 assert.ok(!correct(q,undefined),q.id);
 assert.equal(q.scene.labels.length,q.scene.values.length,q.id);
 assert.ok(q.scene.values.every(v=>Number.isFinite(v)&&v>=0),q.id);
 if(q.scene.extra)assert.ok(q.scene.extra.every(v=>v>0),q.id);
 if(q.options){assert.equal(q.options.length,new Set(q.options).size,q.id);for(const a of q.answer.split('|'))assert.ok(q.options.includes(a),q.id);assert.ok(q.options.some(o=>!q.answer.split('|').includes(o)),q.id);}
 else {assert.equal(q.fields.length,q.answer.split('|').length,q.id);if(q.fields.length>1)assert.ok(!ready(q,'1|'),q.id);}
}
// Independent recomputation of the 24 evaluation keys, including chained ratios,
// unit-price decisions, part-to-whole totals, concentration and time conversion.
const simplest=(a,b)=>`${a/gcd(a,b)}|${b/gcd(a,b)}`;
const expected=[simplest(24,36),(65/5>48/4?'Campuran B':'Campuran A'),`${144/8*5}|${144/8*3}`,String(1440/60*150),(39600/12<28000/8?'Paket B':'Paket A'),String(36/3*5),String(2250/(1800/60)),'7 : 4',`${28800/9}|${42000/14}`,String(180/12*(7-5)),String(48/2*3/4*3),'A mengandung 15 ml sirup per sendok susu, B 14 ml','20 : 35|32 : 56',String(2160/90*135),`${240/8*3}|${240/8*5}`,String(36/3*7),String((3600-3400)*15),simplest(45+15,60-15),simplest(252/14*9-36,252/14*5),String(30/6*21600-30/10*34000),String(2520/(1680/60)-45),`${32/2*5}|${32/2*5/4*3}`,String(84/6*10-120),simplest(36,54/3*4/6*5)];
assert.deepEqual(assessment.map(q=>q.answer),expected);
for(const source of ['Evaluasi 1','Evaluasi 2','Evaluasi 3','Evaluasi 4','Evaluasi 5'])assert.ok(assessment.some(q=>q.source.startsWith(source)),source);
assert.ok(correct(practice[2][1],'12 : 20|6 : 10'));
assert.ok(!correct(practice[2][1],'6 : 10'));
assert.ok(correct(practice[0][2],'04000|03500'));
console.log('PASS Rasio: 24 practice, 24 interleaved evaluations; independently checked keys, sources, difficulty, answer gating and visuals.');
