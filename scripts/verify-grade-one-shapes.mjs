import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("src/data/grade-one-shapes.ts","utf8");
const entries=[...source.matchAll(/q\("(p\d\d|e\d\d)","(describe|group|compose)","([^"]+)",\[([^\]]+)\],"([^"]+)"/g)];
test("Chapter 4 question inventory",()=>{
 assert.equal((source.match(/q\("p\d\d"/g)||[]).length,6);
 assert.equal((source.match(/q\("e\d\d"/g)||[]).length,24);
 for(const section of ["describe","group","compose"]){
  assert.ok(source.includes(`id:"${section}"`));
  assert.equal((source.match(new RegExp('q\\("p\\d\\d","'+section+'"',"','g'))||[]).length,2);
  assert.equal((source.match(new RegExp('q\\("e\\d\\d","'+section+'"',"','g'))||[]).length,8);
 }
 const ids=[...source.matchAll(/q\("(p\d\d|e\d\d)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,30,"question IDs must be unique");
});
test("All literal option arrays include their answer",()=>{
 const matches=[...source.matchAll(/q\("(p\d\d|e\d\d)","[^"]+","[^"]+",\[([^\]]+)\],"([^"]+)"/g)];
 for(const m of matches){const options=[...m[2].matchAll(/"([^"]+)"/g)].map(x=>x[1]);assert.equal(options.length,3,m[1]);assert.ok(options.includes(m[3]),m[1]);}
 assert.equal(matches.length,20,"all questions with inline option arrays must be validated");
 assert.equal((source.match(/,names,"/g)||[]).length,10,"remaining questions use shared shape choices");
});
