import assert from 'node:assert/strict';
import {assessment,practice,correct,ready,shapes,layouts} from '../src/data/grade-four-geometry.ts';
assert.deepEqual(practice.map(x=>x.length),[5,5,5,5,5]);
assert.deepEqual(assessment.map(q=>q.answer),['0|1|0|1','1|2|0','1|2|3','B','2','10','Sama kaki dan siku-siku','1|2|0|2','1|2|3|4','240','4 sisi|2 pasang sisi sejajar','2|0|1','1|2|3|4|5|6|7','Sudut B tidak semua sama besar','Jumlah keduanya sudah lebih dari 180°','6','B|D','9','2|1|0|1','Dinding persegi panjang','2','2|1|0','A|C','3']);
assert.deepEqual(practice.flat().map(q=>q.answer),['0|1|0|1','A|D','7','Sisinya tidak semua sama panjang','54','2|0|1','C','Sama sisi|Lancip','Tidak bisa','6','1|2|0','A|C|D','4 sisi sama panjang','Jajargenjang punya 2 pasang sisi sejajar','0|1|0','1|2|3|4|5|6|7','1|2|3','5','Geser sampai tidak tumpang tindih','1|2|3|4','0|1|1|0','2','Segitiga|Persegi|Jajargenjang','4','2 segitiga siku-siku sama kaki']);
for(const q of [...assessment,...practice.flat()]){
 assert.ok(correct(q,q.answer));assert.ok(ready(q,q.answer));assert.ok(!correct(q,''));assert.ok(!ready(q,''));
 if(q.options){assert.equal(new Set(q.options).size,q.options.length);if(!q.mode)assert.equal(q.options.filter(a=>correct(q,a)).length,1);}
 if(q.task==='match'||q.task==='sort'){assert.ok(!ready(q,'0'));assert.ok(!ready(q,'0||1'));q.answer.split('|').forEach(i=>assert.ok(Number(i)<q.destinations.length));}
 if(q.task==='assemble')assert.ok(!ready(q,'1'));
 for(const id of [...q.figures??[],...q.items??[]])assert.ok(shapes[id],id);
}
const area=p=>Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-a[1]*b[0]},0)/2);
assert.deepEqual(Object.values(layouts).map(l=>l.pieces.reduce((s,p)=>s+area(p.points),0)),[40000,32000,24000]);
// Sample every interior grid cell: exactly one piece covers the target (no overlaps/gaps).
const inside=(x,y,p)=>{let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>y)!==(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])c=!c;return c};
for(const [id,l] of Object.entries(layouts))for(let x=.37;x<200;x+=2)for(let y=.71;y<200;y+=2){const count=l.pieces.filter(p=>inside(x,y,p.points)).length;const expected=id==='square'?true:id==='rectangle'?y>40&&y<160:y>=80||y>=Math.abs(x-100)*.8;assert.equal(count,Number(expected),`${id} at ${x},${y}`)}
for(const s of Object.values(shapes).filter(s=>s.regular)) {const lengths=s.points.map((a,i)=>Math.hypot(a[0]-s.points[(i+1)%s.points.length][0],a[1]-s.points[(i+1)%s.points.length][1]));assert.ok(Math.max(...lengths)-Math.min(...lengths)<1e-8)}
console.log('PASS 49 independently checked answer keys; regular sides; tiling area and no overlap/gaps.');
