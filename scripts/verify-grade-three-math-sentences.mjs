import assert from "node:assert/strict";
import {assessment,practice,topics,correct,ready,checkRow,rows,formatAnswer,sentenceText} from "../src/data/grade-three-math-sentences.ts";

assert.equal(topics.length,2);
assert.deepEqual(practice.map(p=>p.length),[4,4]);
assert.equal(assessment.length,24);
const count=(list,key)=>list.reduce((a,q)=>(a[key(q)]=(a[key(q)]??0)+1,a),{});
assert.deepEqual(count(assessment,q=>q.topic),{0:12,1:12});
assert.deepEqual(count(assessment,q=>q.level),{Sedang:8,Menantang:9,"Sangat menantang":7});
// Hanya jenis soal yang ada di buku (Asesmen dan Latihan 1–2).
assert.deepEqual(count(assessment,q=>q.kind),{sentence:12,story:8,possibilities:4});
for(let i=1;i<assessment.length;i++)assert.notEqual(assessment[i].topic,assessment[i-1].topic,`soal ${i+1} berurutan dari subtopik yang sama`);
assert.equal(new Set(assessment.map(q=>q.sentence?sentenceText(q.sentence):q.prompt)).size,24);

for(const q of [...practice.flat(),...assessment]){
 assert.ok(correct(q,q.answer),`kunci: ${q.prompt}`);assert.ok(ready(q,q.answer));assert.ok(!correct(q,""));assert.ok(formatAnswer(q,q.answer).length>0);
 if(q.kind==="sentence"){const s=q.sentence;assert.equal(s.op==="+"?s.a+s.b:s.a-s.b,s.c);assert.ok([s.a,s.b,s.c].every(v=>Number.isInteger(v)&&v>0));assert.equal(String([s.a,s.b,s.c][s.blank]),q.answer);assert.ok(!correct(q,String(Number(q.answer)+1)));
  assert.equal(s.op==="+",q.topic===0);}
 if(q.kind==="story"){const b=q.bar,n=Number(q.answer);const parts=b.parts.map(p=>p??n),whole=b.whole??n;assert.equal(parts[0]+parts[1],whole,q.prompt);assert.equal([b.whole,...b.parts].filter(x=>x===null).length,1);
  for(const v of [b.whole,...b.parts].filter(x=>x!==null))assert.ok(q.prompt.includes(String(v)),`angka ${v} ada di soal`);}
 if(q.kind==="possibilities"){const p=q.possibilities,r=rows(q.answer);assert.equal(r.length,5);assert.ok(r.every(x=>checkRow(p,x)));
  // Jawaban salah harus ditolak: hitungan salah, baris kembar, syarat dilanggar.
  const bad=[...r];bad[4]=bad[0];assert.ok(!correct(q,bad.map(x=>x.join(",")).join(";")),"baris kembar ditolak");
  const wrong=r.map(x=>[...x]);wrong[2][2]=String(Number(wrong[2][2])+1);if(p.fixed?.col!==2)assert.ok(!correct(q,wrong.map(x=>x.join(",")).join(";")),"hitungan salah ditolak");
  if(p.op==="−")assert.ok(!checkRow(p,["10","20","-10"]));
  if(p.range)assert.ok(!checkRow(p,["150","75","75"]),"di luar syarat ditolak");
  if(p.fixed)assert.ok(!checkRow(p,p.op==="+"?["1","2","3"]:["10","3","7"]),"kolom tetap wajib");}
}
console.log("PASS kelas 3 bab 2: 8 latihan, 24 evaluasi (12 kalimat, 8 cerita, 4 lima kemungkinan; 8/9/7 tingkat kesulitan); kunci dan aturan diperiksa.");
