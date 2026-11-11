import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,words,divisionSteps} from '../src/data/grade-three-whole.ts';
assert.deepEqual(practice.map(q=>q.length),Array(7).fill(4));assert.equal(assessment.length,24);
assert.deepEqual(Array.from({length:7},(_,t)=>assessment.filter(q=>q.topic===t).length),[4,3,3,4,4,3,3]);
assert.deepEqual(['Sedang','Menantang','Sangat menantang'].map(l=>assessment.filter(q=>q.level===l).length),[8,9,7]);
const all=[...practice.flat(),...assessment];assert.equal(new Set(all.map(q=>q.id)).size,52);
const storyKeys={p12:650-600,p16:237+148+96,p20:625-278,p23:7*24,p27:96/4,e17:850-800,e18:218+167+95,e19:586-278,e20:18*24,e21:(156+114)/6,e23:118+76-89,e24:1000-586-174};
const longKeys={p13:[200,30,4,100,50,8,300,80,12,392],p17:[500,30,2,100,70,8,400,120,12,300,50,4,354],e11:[300,20,6,100,80,7,400,100,13,513],e12:[600,20,4,200,70,8,500,110,14,300,40,6,346]};
for(const q of all){assert.ok(correct(q,q.answer),q.id);assert.ok(ready(q,q.answer),q.id);assert.ok(!ready(q,''),q.id);assert.ok(!correct(q,''),q.id);assert.ok(!ready(q,Array(q.fields.length).fill('.').join('|'))||q.kind==='place',q.id);assert.equal(q.fields.length,q.answer.split('|').length,q.id);assert.ok(!('options' in q),q.id+' must retain written book response');assert.ok(q.source);
 for(const n of q.values)assert.ok(Number.isInteger(n)&&n>=0&&n<=1000,q.id);
 for(const a of q.answer.split('|'))if(/^\d+$/.test(a))assert.ok(Number(a)<=1000,q.id);
 const [a,b]=q.values;
 if(q.kind==='story')assert.equal(Number(q.answer),storyKeys[q.id],q.id);
 if(q.kind==='compare')assert.equal(q.answer,q.target?String(Math.max(a,b)):a>b?'>':a<b?'<':'=',q.id);
 if(q.kind==='order')assert.deepEqual(q.answer.split('|').map(Number),[...q.values].sort((a,b)=>q.prompt.includes('terbesar ke terkecil')?b-a:a-b),q.id);
 if(q.kind==='vertical'){const n=q.op==='+'?a+b:q.op==='−'?a-b:a*b;assert.equal(Number(q.answer.replaceAll('|','')),n,q.id);assert.ok(n>=0&&n<=1000,q.id);}
 if(q.kind==='expand')assert.deepEqual(q.answer.split('|').map(Number),q.op==='×'?[Math.floor(a/10)*10*b,a%10*b,a*b]:longKeys[q.id],q.id);
 if(q.kind==='divide'){const v=q.answer.split('|').map(Number),length=String(a/b).length,qs=v.slice(0,length);assert.equal(Number(qs.join('')),a/b,q.id);let carried=Number(String(a).slice(0,String(a).length-length+1));for(let i=0;i<length;i++){const product=v[length+2*i],rem=v[length+2*i+1];assert.equal(product,qs[i]*b,q.id);assert.equal(carried-product,rem,q.id);assert.ok(rem>=0&&rem<b,q.id);if(i<length-1)carried=rem*10+Number(String(a)[String(a).length-length+i+1]);}assert.equal(v.at(-1),0,q.id);}
 if(q.kind==='match'){assert.equal(new Set(q.choices).size,q.choices.length);for(const [i,e] of q.pairs.entries()){const ns=e.split(/[+−]/).map(Number),answer=q.op==='+'?ns[0]+ns[1]:ns[0]-ns[1];assert.equal(q.choices[Number(q.answer.split('|')[i])],String(answer),q.id);}}
}
assert.equal(words(0),'nol');assert.equal(words(1000),'seribu');assert.equal(words(708),'tujuh ratus delapan');assert.equal(words(426),'empat ratus dua puluh enam');assert.equal(new Set(Array.from({length:1001},(_,i)=>words(i))).size,1001);
assert.ok(correct(assessment[14],'1.000| SERIBU '));assert.ok(!ready(assessment[14],'1.00|seribu'));assert.ok(!ready(assessment[0],'7|0|4|'));assert.ok(!correct(assessment[0],'7|1|4|tujuh ratus empat'));
assert.ok(correct(practice[2][3],'2|3|1'));assert.ok(!correct(practice[2][3],'3|0|3'));assert.ok(!correct(practice[2][3],'3|1|0'));
for(let a=2;a<=1000;a++)for(let b=2;b<=9;b++)if(a>=b&&a%b===0){const s=divisionSteps(a,b);assert.equal(Number(s.map(x=>x.quotient).join('')),a/b);assert.equal(s.at(-1).remainder,0);}
console.log('Grade 3: 52 book-format questions; independently checked algorithms, story keys, range, coverage, text normalization and zero quotient digits.');
