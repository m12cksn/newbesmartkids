import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("src/data/grade-one-shapes.ts","utf8");
const rows=[...source.matchAll(/q\("(p\d{2}|e\d{2})","(describe|group|compose)","([^"]+)",(names|\[[^\]]+\]),"([^"]+)"/g)].map(m=>({id:m[1],section:m[2],prompt:m[3],raw:m[4],answer:m[5]}));
test("Chapter 4 has 6 practices and 24 final questions",()=>{
 assert.equal(rows.length,30);
 assert.equal(rows.filter(q=>q.id.startsWith("p")).length,6);
 assert.equal(rows.filter(q=>q.id.startsWith("e")).length,24);
 assert.equal(new Set(rows.map(q=>q.id)).size,30);
 for(const section of ["describe","group","compose"]){
  assert.equal(rows.filter(q=>q.section===section&&q.id.startsWith("p")).length,2);
  assert.ok(rows.filter(q=>q.section===section&&q.id.startsWith("e")).length>=6);
 }
});
test("Final questions interleave subtopics and avoid trivial difficulty",()=>{
 const final=rows.filter(q=>q.id.startsWith("e"));
 assert.ok(final.slice(1).some((q,i)=>q.section!==final[i].section));
 assert.equal((source.match(/"sangat sulit"/g)||[]).length>=4,true);
 assert.equal(final.filter(q=>q.prompt.startsWith("Bentuk ")).length,0);
});
test("Each question has a valid, unique answer option",()=>{
 const shared=["Bentuk lengkung","Segitiga","Segi empat"];
 for(const q of rows){
  const options=q.raw==="names"?shared:[...q.raw.matchAll(/"([^"]+)"/g)].map(m=>m[1]);
  assert.equal(options.length,3,q.id);
  assert.equal(new Set(options).size,3,q.id);
  assert.ok(options.includes(q.answer),q.id);
  assert.ok(q.prompt.length>10,q.id);
 }
});
