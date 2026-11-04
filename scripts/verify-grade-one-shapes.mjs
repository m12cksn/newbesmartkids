import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync("src/data/grade-one-shapes.ts","utf8");
test("Chapter 4 curriculum and assessment inventory",()=>{
 assert.equal((source.match(/q\("p\d\d"/g)||[]).length,6);
 assert.equal((source.match(/q\("e\d\d"/g)||[]).length,24);
 for(const s of ["describe","group","compose"])assert.ok(source.includes(`id:"${s}"`));
});
