import assert from "node:assert/strict";
import {assessment,practice,topics,correct,ready,formatAnswer,SEP,geoShapes} from "../src/data/grade-three-plane-elements.ts";

assert.equal(topics.length,3);
assert.deepEqual(practice.map(p=>p.length),[4,4,4]);
assert.equal(assessment.length,24);
const count=(list,key)=>list.reduce((a,q)=>(a[key(q)]=(a[key(q)]??0)+1,a),{});
assert.deepEqual(count(assessment,q=>q.topic),{0:8,1:8,2:8});
assert.deepEqual(count(assessment,q=>q.level),{Sedang:8,Menantang:9,"Sangat menantang":7});
for(let i=1;i<24;i++)assert.notEqual(assessment[i].topic,assessment[i-1].topic,`soal ${i+1} berurutan`);
assert.equal(new Set(assessment.map(q=>q.prompt+q.answer)).size,24);
// Tiga soal bertipe Asesmen buku.
assert.ok(assessment.some(q=>q.fig?.t==="tangram"));assert.ok(assessment.some(q=>q.fig?.t==="ornament"));assert.ok(assessment.some(q=>q.parts.some(p=>p.kind==="cut")));
const kinds=new Set(assessment.flatMap(q=>q.parts.map(p=>p.kind)));assert.ok(kinds.size>=7,[...kinds].join());

const dir=([x1,y1,x2,y2])=>[x2-x1,y2-y1];
const parallel=(a,b)=>{const[u,v]=[dir(a),dir(b)];return Math.abs(u[0]*v[1]-u[1]*v[0])<1e-9;};
const perp=(a,b)=>{const[u,v]=[dir(a),dir(b)];return Math.abs(u[0]*v[0]+u[1]*v[1])<1e-9;};
for(const q of [...practice.flat(),...assessment]){
 assert.ok(correct(q,q.answer),`kunci: ${q.prompt}`);assert.ok(ready(q,q.answer));assert.ok(!correct(q,""));assert.ok(formatAnswer(q,q.answer).length>0);
 q.parts.forEach((p,i)=>{const v=q.answer.split(SEP);
  if(["number","angle","segment","cut"].includes(p.kind))v[i]=String(p.answer+1);else if(p.kind==="choice")v[i]=p.options.find(o=>o!==p.answer);else if(p.kind==="check")v[i]=p.cards.map((_,k)=>k).filter(k=>!p.answer.includes(k)).slice(0,1).concat(p.answer).join(",");else v[i]=[...p.answer].reverse().join(",");
  if(!(p.kind==="sort"&&new Set(p.answer).size===1))assert.ok(!correct(q,v.join(SEP)),`salah ditolak: ${q.prompt} ${i}`);
  if(p.kind==="choice"){assert.ok(p.options.includes(p.answer));assert.equal(new Set(p.options).size,p.options.length);}
  // Kartu garis: jawaban "tegak lurus"/"sejajar" harus sesuai geometri gambar.
  if(p.kind==="check"&&p.cards[0].fig?.t==="grid"){const test=q.prompt.includes("tegak lurus")?perp:parallel;p.cards.forEach((c,k)=>assert.equal(test(c.fig.segs[0],c.fig.segs[1]),p.answer.includes(k),`${q.prompt} kartu ${c.name}`));}
  if(p.kind==="sort"&&p.label==="Sudut")p.items.forEach((it,k)=>{const d=Number(it.name.replace("°",""));const t=d<90?0:d===90?1:d<180?2:d===180?3:4;assert.equal(p.answer[k],t,it.name);});
  if(p.kind==="order"){const degs=p.answer.map(k=>p.cards[k].fig.deg);assert.deepEqual(degs,[...degs].sort((a,b)=>a-b));}
 });
 if(q.fig?.t==="ruler")assert.equal(q.parts[0].answer,q.fig.cm);
 if(q.fig?.t==="angle"&&q.fig.protractor)assert.equal(q.parts[0].answer,q.fig.deg);
}
// Pemeriksaan tambahan.
const A=assessment;
assert.equal(A.find(q=>q.prompt.includes("refleks")).parts[0].answer,360-140);
assert.equal(geoShapes[0].pts.length,5);
const blue=geoShapes[1].pts;let rightCount=0;for(let i=0;i<blue.length;i++){const p=blue[i],a=blue[(i+blue.length-1)%blue.length],b=blue[(i+1)%blue.length];if((a[0]-p[0])*(b[0]-p[0])+(a[1]-p[1])*(b[1]-p[1])===0)rightCount++;}assert.equal(rightCount,2);
const hex=A.find(q=>q.prompt.includes("segi enam")).fig.segs;let pairs=0;for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)if(parallel(hex[i],hex[j]))pairs++;assert.equal(pairs,3);
assert.ok(correct(practice[0][1],"4.5"),"titik desimal diterima");
console.log("PASS kelas 3 bab 4: 12 latihan, 24 evaluasi (8 per subtopik, 8/9/7, 3 soal bertipe Asesmen); kunci dan geometri gambar diperiksa.");
