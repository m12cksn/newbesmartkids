import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,count,layerCount,project,matrixKey,rotate,walk,distance,pathCount,roll,pointLabel} from '../src/data/grade-six-cubes.ts';
assert.equal(assessment.length,24);assert.equal(practice.length,3);for(const p of practice)assert.equal(p.length,5);
const all=[...practice.flat(),...assessment];assert.equal(new Set(all.map(q=>q.id)).size,39);
assert.deepEqual([0,1,2].map(t=>assessment.filter(q=>q.topic===t).length),[8,8,8]);
assert.deepEqual(['Sedang','Menantang','Sangat menantang'].map(l=>assessment.filter(q=>q.level===l).length),[8,9,7]);
// Explicit independent keys for all evaluated numerical, coordinate, path and model tasks.
assert.deepEqual(assessment.map(q=>q.answer),['5','2|0|1','D,4','5|2|0','0,1,0,1,1,1','RRRUU','1,2,1,0','1,1,0,1,0,1','B,3','11','2|0|1','4|4|8','7','1,0,1,1,1,1','LLLDDD','6|4|2','1|2|0','6','2,1,0,1,3,1','0|2|1','D,5','11','0,1,1,1,1,0,1,0,1','RRRRDDDD']);
for(const q of all){
 assert.ok(ready(q,q.answer),q.id);assert.ok(correct(q,q.answer),q.id);assert.ok(!ready(q,''),q.id);assert.ok(!correct(q,undefined),q.id);
 assert.ok(q.source&&q.explanation&&q.prompt,q.id);
 if(q.scene.kind==='cubes'){
  const h=q.scene.heights;assert.ok(h.flat().every(v=>Number.isInteger(v)&&v>=0&&v<=3));assert.ok(h.every(row=>row.length===h[0].length));
  assert.equal([1,2,3].reduce((n,z)=>n+layerCount(h,z),0),count(h));
  assert.equal(count(rotate(h)),count(h));assert.deepEqual(rotate(rotate(rotate(rotate(h)))),h);
  // Ray-style projection of individual voxels; independent of max-height implementation.
  const vox=[];for(let y=0;y<h.length;y++)for(let x=0;x<h[0].length;x++)for(let z=0;z<h[y][x];z++)vox.push([x,y,z]);
  const max=Math.max(1,...h.flat());for(const view of ['depan','kanan','atas']){
   const rows=view==='atas'?h.length:max,cols=view==='kanan'?h.length:h[0].length;
   const img=Array.from({length:rows},()=>Array(cols).fill(0));
   for(const [x,y,z] of vox)if(view==='depan')img[max-1-z][x]=1;else if(view==='kanan')img[max-1-z][y]=1;else img[h.length-1-y][x]=1;
   assert.deepEqual(project(h,view),img,q.id+' '+view);
  }
 }
 if(q.response.kind==='match'){
  const cards=q.response.cards.map(c=>c.symbol??`${c.grid.length}x${c.grid[0].length}:${matrixKey(c.grid)}`);assert.equal(new Set(cards).size,3,q.id);
  assert.equal(new Set(q.answer.split('|')).size,3,q.id);
 }
 if(q.response.kind==='paint')assert.ok(q.answer.split(',').some(v=>v==='1'));
 if(q.response.kind==='path'){
  const start=q.scene.start,end=q.scene.end;assert.equal(q.answer.length,distance(start,end));assert.deepEqual(walk(start,q.answer),end);
  assert.ok(correct(q,[...q.answer].reverse().join('')),q.id+' alternate route');
  assert.ok(!correct(q,q.answer+'RL'),q.id+' not shortest');
 }
}
assert.ok(!ready(practice[0][2],'1||2'));assert.ok(!ready(assessment[1],'0|0|1'));
assert.deepEqual(project([[2,1,0],[1,0,1]],'depan'),[[1,0,0],[1,1,1]]);
assert.deepEqual(project([[2,1,0],[1,0,1]],'kanan'),[[1,0],[1,1]]);
assert.equal(pathCount([1,1],[3,3]),6);assert.equal(pathCount([0,0],[2,1]),3);
assert.equal(walk([0,0],'L'),null);assert.equal(walk([0,0],'X'),null);
assert.equal(pointLabel([3,3]),'D,4');
const faces={top:'P',bottom:'Q',front:'R',back:'S',right:'T',left:'U'};
assert.deepEqual(roll(roll(faces,'R'),'L'),faces);assert.deepEqual(roll(roll(faces,'U'),'D'),faces);
assert.equal(roll(faces,'R').right,'P');assert.equal(roll(faces,'U').back,'P');
let f=faces;for(let i=0;i<4;i++)f=roll(f,'R');assert.deepEqual(f,faces);
console.log('PASS Grade 6 cubes: 15 practice, 24 interleaved evaluations, voxel projections, hidden/layer counts, matching uniqueness, coordinates, alternate paths, answer gating and rolling orientation.');
