import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,parse,sceneRows} from '../src/data/grade-three-data.ts';
assert.equal(assessment.length,24);assert.equal(practice.filter(q=>q.topic===0).length,5);assert.equal(practice.filter(q=>q.topic===1).length,5);
assert.deepEqual(assessment.reduce((a,q)=>(a[q.difficulty]=(a[q.difficulty]??0)+1,a),{}),{'sedang':8,'menantang':9,'sangat menantang':7});
const all=[...practice,...assessment];assert.equal(new Set(all.map(q=>q.id)).size,34);
// Independently counted fixtures from the displayed data (not the dataset's frequency helper).
const score1={'5':2,'6':3,'7':4,'8':5,'9':4,'10':2};
const score2={'4':1,'5':2,'6':5,'7':6,'8':8,'9':5,'10':3};
const letterCounts={a:5,b:6,c:9,x:5,y:5};
const words={PERPUSTAKAAN:{P:2,E:1,R:1,U:1,S:1,T:1,A:3,K:1,N:1},MATEMATIKAWAN:{M:2,A:4,T:2,E:1,I:1,K:1,W:1,N:1},KESEHATAN:{K:1,E:2,S:1,H:1,A:2,T:1,N:1}};
for(const q of all){
 assert.ok(correct(q,q.answer),q.id+' canonical');assert.ok(!ready(q,''));assert.ok(!correct(q,'[]'));
 const a=parse(q.answer);assert.equal(a.length,q.fields.length);for(let i=0;i<a.length;i++){const partial=[...a];partial[i]='';assert.ok(!ready(q,JSON.stringify(partial)),q.id+' missing '+i);}
 assert.ok(q.source&&q.prompt&&q.explanation);assert.equal(q.options,undefined);
 if(q.scene.kind==='word')assert.deepEqual(Object.fromEntries(sceneRows(q.scene).map(r=>[r.name,r.count])),words[q.scene.word],q.id+' word frequency');
 if(q.scene.kind==='raw'&&q.scene.values.length>=20){const expected=typeof q.scene.values[0]==='string'?letterCounts:q.scene.values.length===20?score1:score2;const counts={};for(const v of q.scene.values)counts[v]=(counts[v]??0)+1;assert.deepEqual(counts,expected,q.id+' raw counts');}
 if(q.table){let k=q.fields.length-q.table.rows.length*(q.table.tally?2:1);for(const row of q.table.rows){const source=q.scene;const independent=source.kind==='word'?[...source.word].filter(v=>v===row.name).length:source.kind==='raw'?source.values.filter(v=>String(v)===row.name).length:source.rows.find(r=>r.name===row.name).count;assert.equal(row.count,independent);if(q.table.tally)assert.equal(Number(a[k++]),independent);assert.equal(Number(a[k++]),independent);}}
 for(let i=0;i<q.fields.length;i++){const f=q.fields[i];if(f.type==='names'){const alt=[...a];alt[i]=a[i].toLowerCase().split(', ').reverse().join('; ');assert.ok(correct(q,JSON.stringify(alt)),q.id+' name order');alt[i]+=', '+alt[i].split('; ')[0];assert.ok(!correct(q,JSON.stringify(alt)),q.id+' duplicate');}
 if(f.type==='order'){const alt=[...a];const names=a[i].split(', ');let swapped=false;for(let j=1;j<names.length;j++)if(f.counts[names[j]]===f.counts[names[j-1]]){[names[j],names[j-1]]=[names[j-1],names[j]];swapped=true;break;}alt[i]=names.join(', ');assert.ok(correct(q,JSON.stringify(alt)),q.id+' tie permutation');alt[i]=names.slice(1).join(', ');assert.ok(!ready(q,JSON.stringify(alt)),q.id+' incomplete order');if(swapped){alt[i]=names.reverse().join(', ');assert.ok(!correct(q,JSON.stringify(alt)),q.id+' wrong direction');}}
 if(f.type==='text'){const expected=q.scene.values.slice().map(Number).sort((x,y)=>x-y);assert.deepEqual(a[i].split(', ').map(Number),expected);const partial=[...a];partial[i]=a[i].split(', ').slice(1).join(', ');assert.ok(!ready(q,JSON.stringify(partial)),q.id+' missing repeated value');}
 }
}
// Written-answer keys checked separately from their construction helpers.
const expected={e3:[4,10,6],e6:[5,6,9],e12:[5,5,10],e13:[30,7],e16:[5,3],e20:[22,3],e21:[3,4,'Penghapus'],e23:[null,11],e24:[7]};
for(const [id,values] of Object.entries(expected)){const q=assessment.find(q=>q.id===id);for(let i=0;i<values.length;i++)if(values[i]!==null)assert.equal(q.fields[i].value,String(values[i]),id+' independent key');}
console.log('PASS: source coverage, 10 practices, 24 evaluations, 8/9/7 difficulty, independent frequencies/keys, complete-field gating, ties and duplicates');
