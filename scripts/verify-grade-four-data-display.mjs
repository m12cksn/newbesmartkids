import assert from "node:assert/strict";
import {assessment,practice,correct,ready} from "../src/data/grade-four-data-display.ts";

assert.deepEqual(practice.map(x=>x.length),[5,5]);
assert.equal(assessment.length,24);
assert.deepEqual(assessment.reduce((a,q)=>(a[q.kind]=(a[q.kind]??0)+1,a),{}),{pictogram:8,bar:10,table:6});
assert.deepEqual(assessment.reduce((a,q)=>(a[q.difficulty]=(a[q.difficulty]??0)+1,a),{}),{Sedang:8,Menantang:9,"Sangat menantang":7});
for(const q of [...practice.flat(),...assessment]){
 assert.ok(q.data.length>0);
 assert.ok(correct(q,q.answer),q.prompt);
 assert.ok(ready(q,q.answer),q.prompt);
 assert.ok(!correct(q,""),q.prompt);
 assert.ok(!ready(q,""),q.prompt);
 assert.equal(new Set(q.data.map(x=>x.label)).size,q.data.length);
 assert.ok(q.data.every(x=>Number.isInteger(x.value)&&x.value>=0));
 if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(x=>correct(q,x)).length,1);}
 if(q.task){assert.equal(q.answer.split("|").length,q.data.length);assert.ok(!ready(q,"1"));}
 if(q.kind==="pictogram"&&q.keyValue>1)assert.ok(q.data.every(x=>x.value%q.keyValue===0)||q.prompt.includes("masalahnya"));
}
const positions=assessment.filter(q=>q.options).map(q=>q.options.indexOf(q.answer));
assert.ok(new Set(positions).size>=3);
assert.ok(assessment.some(q=>q.orientation==="horizontal"));
assert.ok(assessment.some(q=>q.task==="build-pictogram"));
assert.ok(assessment.some(q=>q.task==="build-bar"));
console.log("PASS 10 practice and 24 interleaved assessment questions; answer keys, data, difficulty, and interaction coverage validated.");
