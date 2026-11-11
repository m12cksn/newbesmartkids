import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,decode} from '../src/data/grade-two-arithmetic.ts';
assert.equal(assessment.length,24);assert.equal(practice.length,15);for(let t=0;t<3;t++){assert.equal(practice.filter(q=>q.topic===t).length,5);assert.equal(assessment.filter(q=>q.topic===t).length,8);}
assert.deepEqual(assessment.reduce((a,q)=>(a[q.difficulty]=(a[q.difficulty]??0)+1,a),{}),{sedang:8,menantang:9,'sangat menantang':7});
const all=[...practice,...assessment];assert.equal(new Set(all.map(q=>q.id)).size,39);
const storyResults={p11:[19,5],p12:[13,19],p13:[8,4,20],p14:[16,11],p15:[11,18,4],e2:[11,19,3],e8:[19],e12:[7,6,20],e16:[15,21],e20:[18,11],e22:[11,18],e24:[9,11,20]};
for(const q of all){assert.ok(q.source&&q.prompt&&q.explanation);assert.ok(correct(q,q.answer),q.id);assert.ok(!ready(q,''));const key=decode(q.answer);assert.equal(key.length,q.fields.length);for(let i=0;i<key.length;i++){const a=[...key];a[i]='';assert.ok(!ready(q,JSON.stringify(a)),q.id+' missing '+i);a[i]=q.fields[i].endsWith('tanda')?(key[i]==='+'?'−':'+'):'99';assert.ok(!correct(q,JSON.stringify(a)),q.id+' wrong '+i);}
 if(q.kind==='story'){assert.deepEqual(q.steps.map(s=>s.result),storyResults[q.id]);for(const [j,s]of q.steps.entries()){assert.equal(s.result,s.op==='+'?s.a+s.b:s.a-s.b);assert.ok(s.result>=0&&s.result<=30);if(s.op==='+'){const a=[...key],i=q.facts.length+j*5;[a[i],a[i+2]]=[a[i+2],a[i]];assert.ok(correct(q,JSON.stringify(a)),q.id+' commutative');}}for(const g of q.groups)assert.ok(g.count===null||g.count>=0&&g.count<=30);continue;}
 if(q.choices){assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(n=>n===q.target).length,1);assert.equal(Number(key[0]),q.choices.indexOf(q.target));if(q.kind==='balance')assert.equal(q.a+q.b,6+q.target);if(q.kind==='flowers')assert.equal(q.a+q.b,q.target);continue;}
 if(q.kind==='shapes'){assert.equal(Number(key[0]),q.shapeValues.reduce((total,v,i)=>total+v*q.shapeCounts[i],0));continue;}
 const r=q.op==='+'?q.a+q.b:q.a-q.b;assert.ok(r>=0&&r<=30);if(q.kind==='vertical'){assert.equal(Number(key.at(-2))*10+Number(key.at(-1)),r);if(q.op==='+'&&q.a%10+q.b%10>=10)assert.deepEqual(key.slice(0,2).map(Number),[q.a%10+q.b%10,1]);if(q.op==='−'&&q.a%10<q.b%10)assert.deepEqual(key.slice(0,2).map(Number),[Math.floor(q.a/10)-1,q.a%10+10]);}
 else if(q.kind==='bond'){const first=key.slice(0,2).map(Number);assert.equal(first[0]+first[1],q.a);if(q.op==='−'){assert.equal(Number(key[2])+Number(key[3]),q.b);assert.equal(Number(key[4])+Number(key[5]),r);}else{assert.equal(Number(key[2]),q.a%10+q.b);assert.equal(Number(key[3]),r);}assert.equal(Number(key.at(-1)),r);}else assert.equal(Number(key[0]),r);
}
assert.deepEqual(assessment.filter(q=>q.choices).map(q=>Number(decode(q.answer)[0])),[2,3,1]);
console.log('PASS: 15 practices, 24 evaluations, 8 per topic, 8/9/7 difficulty, all keys/fields, carry/borrow, story reasoning, commutative answers and unique visual choices');
