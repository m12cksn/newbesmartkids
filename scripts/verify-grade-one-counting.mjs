// Run with: node --test scripts/verify-grade-one-counting.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { gradeOneQuestions as questions, gradeOnePractice } from "../src/data/grade-one-counting.ts";

test("two separate practice questions per subtopic", () => {
  assert.equal(gradeOnePractice.length, 8);
  assert.equal(new Set([...gradeOnePractice, ...questions].map(q => q.id)).size, 32);
  for (let section = 0; section < 4; section++) {
    assert.equal(gradeOnePractice.filter(q => q.section === section).length, 2);
  }
});
const nouns=["apel","pensil","bintang","mobil mainan","balok","bunga"];
const names=["nol","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh"];
const supported=new Set(["tap_count","number_input","multiple_choice","select_group","bond_input","split_objects","sequence_pick","sequence_input"]);
test("24 unique questions and 6 per section",()=>{assert.equal(questions.length,24);assert.equal(new Set(questions.map(q=>q.id)).size,24);for(let i=0;i<4;i++)assert.equal(questions.filter(q=>q.section===i).length,6)});
test("balanced difficulty tiers and interaction variety",()=>{for(const level of ["mudah","sedang","menantang"])assert.equal(questions.filter(q=>q.difficulty===level).length,8);assert.ok(new Set(questions.map(q=>q.format)).size>=7);for(const q of questions)assert.ok(supported.has(q.format),q.id)});
test("object labels and illustration mapping agree",()=>{questions.forEach((q,i)=>{assert.equal(q.object,nouns[i%6],q.id);assert.ok(q.prompt.includes(q.object)||q.kind==="sequence",q.id);if(q.kind==="count"){assert.equal(q.answer,String(q.a),q.id);assert.ok(q.explanation.includes(q.object),q.id);assert.ok(q.explanation.includes(names[q.a]),q.id)}})});
test("every multiple choice has four unique choices and exactly one key",()=>{for(const q of questions.filter(q=>q.format==="multiple_choice")){assert.equal(q.options.length,4,q.id);assert.equal(new Set(q.options).size,4,q.id);assert.equal(q.options.filter(v=>v===q.answer).length,1,q.id)}});
test("all number bonds, comparisons and sequences have correct keys",()=>{for(const q of questions){if(q.kind==="bond")assert.equal(Number(q.answer),q.a-q.b,q.id);if(q.kind==="sequence"){assert.equal(q.sequence.filter(v=>v===null).length,1,q.id);const idx=q.sequence.indexOf(null);const expected=q.sequence[idx-1]!==undefined&&q.sequence[idx-1]!==null?(q.sequence[idx-2]!==undefined&&q.sequence[idx-2]!==null?2*q.sequence[idx-1]-q.sequence[idx-2]:q.sequence[idx+1]!==undefined&&q.sequence[idx+1]!==null?(q.sequence[idx-1]+q.sequence[idx+1])/2:null):q.sequence[idx+1]!==undefined&&q.sequence[idx+2]!==undefined?2*q.sequence[idx+1]-q.sequence[idx+2]:null;assert.equal(Number(q.answer),expected,q.id)}if(q.kind==="compare"){const diff=Math.abs(q.a-q.b);if(q.format==="number_input")assert.equal(Number(q.answer),diff,q.id);if(q.format==="select_group"){const more=q.prompt.includes("lebih banyak"),less=q.prompt.includes("lebih sedikit");const expected=q.a===q.b?"Sama banyak":more?(q.a>q.b?"A":"B"):less?(q.a<q.b?"A":"B"):"Sama banyak";assert.equal(q.answer,expected,q.id)}}}});
