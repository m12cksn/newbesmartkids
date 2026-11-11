import assert from "node:assert/strict";
import {assessment,practice,topics,correct,ready,formatAnswer,SEP} from "../src/data/grade-three-measurement.ts";

assert.equal(topics.length,4);
assert.deepEqual(practice.map(p=>p.length),[4,4,4,4]);
assert.equal(assessment.length,24);
const count=(list,key)=>list.reduce((a,q)=>(a[key(q)]=(a[key(q)]??0)+1,a),{});
assert.deepEqual(count(assessment,q=>q.topic),{0:6,1:6,2:6,3:6});
assert.deepEqual(count(assessment,q=>q.level),{Sedang:8,Menantang:9,"Sangat menantang":7});
for(let i=1;i<24;i++)assert.notEqual(assessment[i].topic,assessment[i-1].topic,`soal ${i+1} berurutan`);
assert.equal(new Set(assessment.map(q=>q.prompt+q.answer)).size,24);
// Lima soal bertipe Asesmen buku: kain seragam, lintasan bolak-balik, jarum "kurang garis", dua karung beras, kantong apel.
for(const key of ["seragam","balap karung","kurang 2 garis","karung berisi","kantong plastik"])assert.ok(assessment.some(q=>q.prompt.includes(key)),key);

const parts=q=>q.answer.split(SEP);
for(const q of [...practice.flat(),...assessment]){
 assert.ok(correct(q,q.answer),`kunci: ${q.prompt}`);assert.ok(ready(q,q.answer));assert.ok(!correct(q,""));assert.ok(!ready(q,""));assert.ok(formatAnswer(q,q.answer).length>0);
 assert.equal(parts(q).length,q.parts.length);
 // Setiap bagian yang salah membuat soal salah.
 q.parts.forEach((p,i)=>{const v=parts(q);
  if(p.kind==="number")v[i]=String(p.answer+1);else if(p.kind==="compound")v[i]=`${p.answer[0]}|${p.answer[1]+1}`;else if(p.kind==="choice")v[i]=p.options.find(o=>o!==p.answer);else if(p.kind==="check")v[i]=[...p.answer,...p.cards.map((_,k)=>k).filter(k=>!p.answer.includes(k)).slice(0,1)].join(",");else v[i]=p.answer.map((a,k)=>k===0?(a+1)%p.bins.length:a).join(",");
  assert.ok(!correct(q,v.join(SEP)),`salah ditolak: ${q.prompt} bagian ${i+1}`);
  if(p.kind==="choice"){assert.ok(p.options.includes(p.answer));assert.equal(new Set(p.options).size,p.options.length);}
  if(p.kind==="sort")assert.ok(p.answer.every(a=>a>=0&&a<p.bins.length));
 });
 // Gambar penggaris: panjang = ujung kanan − ujung kiri.
 if(q.scene?.type==="ruler"&&q.scene.objects.length===1){const o=q.scene.objects[0];assert.equal(q.parts[0].answer,o.to-o.from,q.prompt);}
 if(q.scene?.type==="dial"&&q.parts[0].kind==="compound"){assert.deepEqual(q.parts[0].answer,[Math.floor(q.scene.grams/1000),q.scene.grams%1000]);}
 if(q.scene?.type==="bags")assert.equal(q.parts[0].answer,q.scene.items.reduce((t,x)=>t+x.grams,0));
 for(const p of q.parts)if(p.kind==="sort"&&p.items[0].scene?.type==="balance")p.items.forEach((it,k)=>assert.equal(Number(p.bins[p.answer[k]].replace(/\D/g,"")),it.scene.weights*1000));
}
// Pemeriksaan hitungan independen.
const A=assessment;
assert.equal(A[5].parts[0].answer,700*2);assert.equal(A[5].parts[1].answer,1400/100);
assert.equal(A[18].parts[2].answer,750-4*150);
assert.equal(A[19].parts[0].answer,12*2-15);
assert.deepEqual(A[22].parts[0].answer,[Math.floor((72640+18570)/1000),(72640+18570)%1000]);
assert.deepEqual(A[23].parts[0].answer,[Math.floor((365+458)/100),(365+458)%100]);
assert.equal(A[15].parts[0].answer,3075);
assert.ok(correct(A[2],"8"));assert.ok(correct(A[15],"3.075"),"titik ribuan diterima");
console.log("PASS kelas 3 bab 3: 16 latihan, 24 evaluasi (6 per subtopik, 8/9/7, 5 soal bertipe Asesmen); kunci dan gambar diperiksa.");
