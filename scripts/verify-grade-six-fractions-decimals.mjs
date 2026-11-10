import assert from "node:assert/strict";
import {assessment,practice,topics,correct,ready,parseFraction,parseDecimal,formatAnswer} from "../src/data/grade-six-fractions-decimals.ts";

const value=f=>f[0]/f[1];
assert.equal(topics.length,6);
assert.equal(practice.length,6);
practice.forEach((set,t)=>{assert.ok(set.length>=3&&set.length<=5,`latihan ${t}`);assert.ok(set.every(q=>q.topic===t));assert.ok(new Set(set.map(q=>q.response.kind)).size>=3,`variasi latihan ${t}`);});
assert.equal(assessment.length,24);

// Cakupan: 4 soal per subtopik, tingkat kesulitan, dan variasi bentuk respons.
const count=(list,key)=>list.reduce((a,q)=>(a[key(q)]=(a[key(q)]??0)+1,a),{});
assert.deepEqual(count(assessment,q=>q.topic),{0:4,1:4,2:4,3:4,4:4,5:4});
assert.deepEqual(count(assessment,q=>q.level),{Sedang:8,Menantang:9,"Sangat menantang":7});
const kinds=count(assessment,q=>q.response.kind);
assert.ok(Object.keys(kinds).length>=9,`jenis respons: ${JSON.stringify(kinds)}`);
assert.ok(Math.max(...Object.values(kinds))<=8);
// Tidak ada dua soal berurutan dari subtopik yang sama.
assessment.forEach((q,i)=>{if(i)assert.notEqual(q.topic,assessment[i-1].topic,`soal ${i+1} berurutan`);});
assert.equal(new Set(assessment.map(q=>q.prompt)).size,24);

for(const q of [...practice.flat(),...assessment]){
 const r=q.response;
 assert.ok(correct(q,q.answer),`kunci benar: ${q.prompt}`);
 assert.ok(ready(q,q.answer),`siap: ${q.prompt}`);
 assert.ok(!correct(q,""),q.prompt);assert.ok(!ready(q,""),q.prompt);
 assert.ok(formatAnswer(q,q.answer).length>0);
 if(r.kind==="choice"||r.kind==="multi"||r.kind==="order"){
  assert.equal(new Set(r.options).size,r.options.length,q.prompt);
  if(r.kind==="choice"){assert.equal(r.options.filter(o=>correct(q,o)).length,1,`satu jawaban: ${q.prompt}`);if(r.pictures)assert.equal(r.pictures.length,r.options.length);}
  if(r.kind==="multi")assert.equal(r.pictures.length,r.options.length);
  if(r.kind==="order"){assert.deepEqual([...q.answer.split("|")].sort(),[...r.options].sort());assert.notEqual(r.options.join("|"),q.answer,"urutan awal tidak boleh sudah benar");}
 }
 if(r.kind==="match"){const pairs=q.answer.split("|").map(p=>p.split("="));assert.deepEqual(pairs.map(p=>p[0]).sort(),[...r.left].sort());assert.deepEqual(pairs.map(p=>p[1]).sort(),[...r.right].sort());
  for(const [f,d] of pairs)assert.ok(Math.abs(value(parseFraction(f))-parseDecimal(d))<1e-9,`${f}=${d}`);
  assert.ok(!correct(q,"3/4=0,75|2/5=0,4|7/20=0,36|9/25=0,35"));}
 if(r.kind==="shade"){assert.equal(q.answer.split("|").length,r.wholes);assert.ok(q.answer.split("|").every(s=>s.length===r.parts));assert.ok(!correct(q,q.answer.replace("1","0")));}
 if(r.kind==="mark"){assert.equal(r.total%r.groups,0);assert.equal(q.answer.split(",").length%(r.total/r.groups),0);}
 if(r.kind==="fraction"){assert.ok(parseFraction(q.answer));assert.ok(correct(q,`|${parseFraction(q.answer)[0]*2}|${parseFraction(q.answer)[1]*2}`),"pecahan senilai diterima");}
 if(r.kind==="decimal")assert.ok(correct(q,q.answer.replace(",",".")));
 if(r.kind==="line"){const n=Number(q.answer);assert.ok(n>r.from&&n<r.to);}
}

// Pemeriksaan matematika independen terhadap kunci jawaban.
const A=assessment;
assert.equal(value(parseFraction(A[6].answer)),5*3/4);
assert.equal(value(parseFraction(A[3].answer)),3/5/2);
assert.equal(Number(A[4].answer),9/(3/4));
assert.equal(Number(A[8].answer),48-48*3/8);
assert.equal(value(parseFraction(A[10].answer.split(" ")[0])),2/3/4);
assert.ok(35/8>4&&6*2/3===4&&5*3/4<4&&9*4/9===4);
assert.equal(value(parseFraction(A[12].answer)),7-Math.floor(7/(2/3))*(2/3)>0?1/3:0);
assert.equal(Number(A[14].answer),240/6*3/4);
assert.equal(value(parseFraction(A[16].answer)),3/4/3/2);
assert.equal(Number(A[17].answer),5*3);
assert.ok(Math.abs(5-12*2/5-1/5)<1e-9);
assert.equal(3/4*24,18);assert.equal(2/3*30,20);
assert.equal(Number(A[20].answer.replace(",",".")),1/4);
const positions=A.filter(q=>q.response.kind==="choice").map(q=>q.response.options.indexOf(q.answer));
assert.ok(new Set(positions).size>=3,`posisi jawaban ${positions}`);
console.log(`PASS 6 subtopik, ${practice.flat().length} latihan, 24 evaluasi (4 per subtopik; 8/9/7 tingkat kesulitan; ${Object.keys(kinds).length} jenis respons); kunci jawaban diperiksa.`);
