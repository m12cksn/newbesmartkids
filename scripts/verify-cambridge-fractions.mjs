import assert from "node:assert/strict";
import { assessment, practice, correct } from "../src/data/cambridge-fractions.ts";
assert.deepEqual(practice.map(group => group.length), [4,4,4,4]);
assert.equal(assessment.length,24);
const keys = ["31/36","49","35/8","7/60","1 1/2","81","4","1/10","19/60","64","27/8","4/33","53/84","72 ÷ 8","23/6","1/5","No, the total is greater than 1","40","25/6","7/96","9/20","28","8","The pieces from the first strip"];
assert.deepEqual(assessment.map(q=>q.answer),keys);
for (const q of [...assessment,...practice.flat()]) {
  assert.ok(correct(q,q.answer));
  assert.ok(!correct(q,""));
  if (q.options) assert.equal(q.options.filter(option=>correct(q,option)).length,1);
}
assert.ok(correct(assessment[2],"4 3/8"));
assert.ok(correct(assessment[2],"70/16"));
assert.ok(!correct(assessment[2],"4/0"));
console.log("PASS: 24 assessment keys, 16 practice answers, mixed and equivalent fraction input");
