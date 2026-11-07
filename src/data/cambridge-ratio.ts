export const topics = [
  {title:"Understand equivalent ratios", steps:["Keep the quantities in the same order as the ratio.","Multiply or divide both terms by the same number to make an equivalent ratio.","For the simplest form, divide both terms by their greatest common factor."]},
  {title:"Understand direct proportions", steps:["Two quantities are in direct proportion when one is a constant multiple of the other.","Scale both quantities by the same factor, or find the amount for one unit first.","When comparing prices, calculate the cost per unit for each pack."]},
];
type Visual = {head:[string,string]; rows:[string,string][]} | {tape:[number,number]; labels:[string,string]};
export type RatioQuestion = {prompt:string; answer:string; explanation:string; options?:string[]; visual?:Visual};
const input=(prompt:string,answer:string|number,explanation:string,visual?:Visual):RatioQuestion=>({prompt,answer:String(answer),explanation,visual});
const pick=(prompt:string,options:string[],at:number,explanation:string,visual?:Visual):RatioQuestion=>({...input(prompt,options[at],explanation,visual),options});
const table=(a:string,b:string,...rows:[string,string][]):Visual=>({head:[a,b],rows});
const simplify=(a:number,b:number,f:number)=>input(`Write ${a} : ${b} in its simplest form.`,`${a/f}:${b/f}`,`Divide both terms by ${f}.`);
const equivalent=(a:number,b:number,k:number,at:number)=> {
  const options=[`${a*k+1} : ${b*k}`,`${a*k} : ${b*k+1}`,`${b*k} : ${a*k}`];
  options[at]=`${a*k} : ${b*k}`;
  return pick(`Which ratio is equivalent to ${a} : ${b}?`,options,at,`Multiply both terms by ${k}.`);
};
const scale=(x:number,y:number,target:number,first:string,second:string,unit:string,reverse=false)=> {
  const answer=reverse?target*x/y:target*y/x;
  return input(`Complete the table. Give the missing amount in ${unit}.`,answer,`The scale factor is ${target} ÷ ${reverse?y:x}. Apply it to the other amount to get ${answer}.`,table(first,second,[String(x),String(y)],reverse?["?",String(target)]:[String(target),"?"]));
};
const total=(a:number,b:number,known:number,first:string,second:string)=> {
  const unit=known/b;
  return input(`There are ${known} ${second.toLowerCase()}. The ratio of ${first.toLowerCase()} to ${second.toLowerCase()} is ${a} : ${b}. How many are there altogether?`,unit*(a+b),`One part represents ${known} ÷ ${b} = ${unit}. There are ${a+b} parts altogether.`,{tape:[a,b],labels:[first,second]});
};
const best=(weights:[number,number,number],prices:[number,number,number],at:number)=>pick("Which pack of rice is the best buy? Compare the price per kilogram.",["Pack A","Pack B","Pack C"],at,
  `The prices per kilogram are ${prices.map((p,i)=>"£"+(p/weights[i]).toFixed(2)).join(", ")} respectively.`,
  table("Pack and mass","Price",...weights.map((w,i):[string,string]=>[`${"ABC"[i]} · ${w} kg`,`£${prices[i]}`])));
export const practice:RatioQuestion[][]=[
  [simplify(12,18,6),equivalent(3,7,4,1),input("Complete 5 : 8 = 25 : □.",40,"Both terms are multiplied by 5."),total(2,5,30,"Oranges","Pears"),pick("The coach-to-player ratio is 2 : 15. Can there be 6 coaches and 40 players?",["Yes","No"],1,"Six coaches require 45 players.")],
  [scale(3,12,9,"Syrup (L)","Water (L)","litres"),scale(8,240,120,"People","Flour (g)","people",true),best([2,3,5],[7,12,15],2),scale(150,9,450,"Wall area (m²)","Paint (L)","litres"),input("A model and a real tower are in the ratio 1 : 20. The real tower is 18 m tall. How tall is the model in metres?",0.9,"Divide the real height by 20.",table("Model (m)","Real tower (m)",["1","20"],["?","18"]))],
];
export const assessment:RatioQuestion[]=[
 simplify(18,30,6),scale(4,28,9,"People","Flour (g)","grams"),equivalent(4,7,6,2),best([2,4,5],[9,16,25],1),
 total(3,5,35,"Apples","Plums"),scale(200,14,550,"Wall area (m²)","Paint (L)","litres"),input("Complete 7 : 9 = □ : 63.",49,"Multiply both terms by 7."),scale(6,450,1125,"People","Rice (g)","people",true),
 pick("The adult-to-child ratio is 3 : 14. Can a group have 12 adults and 54 children?",["Yes","No"],1,"Twelve adults require 56 children."),input("A model bus is 12 cm long. The model-to-real ratio is 1 : 35. Find the real length in metres.",4.2,"12 × 35 = 420 cm = 4.2 m.",table("Model (cm)","Real (cm)",["1","35"],["12","?"])),
 simplify(36,84,12),best([2,3,6],[6,12,21],0),total(5,8,56,"Peaches","Apricots"),scale(7,21,54,"Syrup (L)","Water (L)","litres",true),
 equivalent(5,8,7,0),input("A shop sells 4 kg of oats for £15. What is the price per kilogram in pounds?",3.75,"Divide £15 by 4.",table("Mass (kg)","Price (£)",["4","15"],["1","?"])),
 input("The teacher-to-pupil ratio is 2 : 17. There are 119 pupils. How many teachers are there?",14,"119 ÷ 17 = 7, so there are 2 × 7 teachers."),
 scale(360,24,42,"Wall area (m²)","Paint (L)","square metres",true),total(4,9,81,"Red counters","Blue counters"),
 input("A recipe uses 160 g of flour for 5 people. Two groups of 8 people each need the same recipe. How much flour is needed in grams?",512,"There are 16 people. Each needs 32 g.",table("People","Flour (g)",["5","160"],["16","?"])),
 equivalent(7,11,5,1),best([3,5,8],[12,19,28],2),input("Red and blue tiles are in the ratio 7 : 11. There are 126 tiles altogether. How many are blue?",77,"There are 18 parts. Each represents 7 tiles, and 11 parts are blue.",{tape:[7,11],labels:["Red","Blue"]}),
 scale(8,12,30,"Model length (cm)","Model height (cm)","centimetres",true),
];
export const correct=(q:RatioQuestion,value:string)=>q.options?value===q.answer:q.answer.includes(":")?value.replace(/\s/g,"")===q.answer:/^\d+(?:\.\d+)?$/.test(value.trim())&&Number(value)===Number(q.answer);
