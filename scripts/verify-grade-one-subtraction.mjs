import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import test from "node:test";
const source=readFileSync(new URL("../src/data/grade-one-subtraction.ts",import.meta.url),"utf8");
const rows=[...source.matchAll(/q\("(\w+)","(story|bond|backward|ten|inverse|word)","[^"]+",(\d+),(\d+)(?:,"\w+")?\)/g)].map(m=>({id:m[1],section:m[2],start:Number(m[3]),remove:Number(m[4])}));
test("12 practice and 24 evaluation subtraction questions",()=>{assert.equal(rows.length,36);assert.equal(new Set(rows.map(x=>x.id)).size,36)});
test("all numbers stay in 0–10 with nonnegative answers",()=>{for(const x of rows){assert.ok(x.start>=0&&x.start<=10,x.id);assert.ok(x.remove>=0&&x.remove<=x.start,x.id)}});
test("every required subtopic is represented",()=>{for(const s of ["story","bond","backward","ten","inverse","word"])assert.ok(rows.filter(x=>x.section===s).length>=2,s)});
