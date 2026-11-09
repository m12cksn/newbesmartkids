import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyQuestions,wibDate,correctAnswer,readPractice} from '../src/lib/daily-arithmetic.ts';
test('WIB midnight including month/year/leap boundaries',()=>{
 for(const [instant,date] of [['2026-11-09T16:59:59.999Z','2026-11-09'],['2026-11-09T17:00:00Z','2026-11-10'],['2026-12-31T17:00:00Z','2027-01-01'],['2028-02-28T17:00:00Z','2028-02-29']])assert.equal(wibDate(new Date(instant)),date);
});
test('all daily packages: unique facts, exact divisions, single answer, difficulty and variety',()=>{
 for(const level of [1,2,3]){
 let last;
 for(let day=0;day<366;day++){
  const date=new Date(Date.UTC(2026,0,1)+day*86400000).toISOString().slice(0,10), qs=dailyQuestions(date,level);
  assert.equal(qs.length,7); assert.deepEqual(qs,dailyQuestions(date,level));
  assert.equal(new Set(qs.map(q=>[...q.fact].sort((a,b)=>a-b).join(':'))).size,7);
  if(last)assert.notDeepEqual(qs[0].fact,last);last=qs[0].fact;
  assert.equal(new Set(qs.map(q=>q.operator+q.blank)).size,5);
  for(const q of qs){
   const [a,b]=q.fact;
   if(level===1){assert.ok([1,2,5,10].includes(a));assert.ok(b>=1&&b<=10);}
   if(level===2){assert.ok([3,4,6,7,8,9].includes(a));assert.ok(b>=2&&b<=12);}
   if(level===3){assert.ok(a>=11&&a<=49);assert.ok(b>=3&&b<=9);}
   const expected=q.blank===2?(q.operator==='×'?q.left*q.right:q.left/q.right):q.blank===0?(q.operator==='×'?q.result/q.right:q.result*q.right):(q.operator==='×'?q.result/q.left:q.left/q.result);
   assert.equal(q.answer,expected);assert.ok(Number.isInteger(expected)&&expected>0);assert.equal(q.left/q.right===q.result,q.operator==='÷'||q.right===1);assert.ok(correctAnswer(String(expected),q.answer));assert.ok(!correctAnswer(String(expected+1),q.answer));
  }
 }
 }
});
test('answer and persistence validation',()=>{
 for(const value of ['', ' ', '-2', '2.0','2e0','2abc'])assert.equal(correctAnswer(value,2),false);
 assert.equal(correctAnswer('02',2),true);
 for(const raw of ['broken','null','{}',JSON.stringify({date:'2026-02-31',answers:Array(7).fill('1')}),JSON.stringify({date:'2026-11-09',answers:Array(7).fill('<script>')})])assert.equal(readPractice(raw),null);
 assert.deepEqual(readPractice(JSON.stringify({date:'2026-11-09',answers:Array(7).fill(''),checked:true})),{date:'2026-11-09',answers:Array(7).fill(''),checked:false});
});
