import assert from "node:assert/strict";
import { assessment, practice, correct } from "../src/data/cambridge-ratio.ts";
assert.deepEqual(practice.map(q=>q.length),[5,5]);
assert.deepEqual(assessment.map(q=>q.answer),["3:5","63","24 : 42","Pack B","56","38.5","49","15","No","4.2","3:7","Pack A","91","18","35 : 56","3.75","14","630","117","512","35 : 55","Pack C","77","20"]);
assert.deepEqual(practice.flat().map(q=>q.answer),["2:3","12 : 28","40","42","No","36","4","Pack C","27","0.9"]);
for(const q of [...assessment,...practice.flat()]){
  assert.ok(correct(q,q.answer));
  assert.ok(!correct(q,""));
  if(q.options) assert.equal(q.options.filter(value=>correct(q,value)).length,1);
}
console.log("PASS: 34 ratio and proportion answer keys");
