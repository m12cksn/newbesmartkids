export type SubtractionSection = "story" | "bond" | "backward" | "ten" | "inverse" | "word";
export type SubtractionQuestion = {id:string;section:SubtractionSection;prompt:string;start:number;remove:number;answer:number;explanation:string;kind?:"balloon"|"egg"|"bird"|"apple"|"ball"};
export const subtractionSections: {id:SubtractionSection;title:string;concept:string}[] = [
{id:"story",title:"A. Cerita Pengurangan",concept:"Pengurangan berarti jumlah benda berkurang. Contoh: 6 anak bermain, 2 pulang, tersisa 4."},
{id:"bond",title:"B1. Pasangan Bilangan",concept:"Bilangan dapat dibagi menjadi dua bagian. Jika 6 terdiri atas 4 dan 2, maka 6 − 4 = 2."},
{id:"backward",title:"B2. Menghitung Mundur",concept:"Mulai dari bilangan pertama, lalu mundur sebanyak bilangan yang dikurangi."},
{id:"ten",title:"B3. Pengurangan dari 10",concept:"Gunakan sepuluh kotak untuk melihat bagian yang diambil dan yang tersisa."},
{id:"inverse",title:"C. Hubungan Penjumlahan dan Pengurangan",concept:"Jika 4 + 3 = 7, maka 7 − 4 = 3 dan 7 − 3 = 4."},
{id:"word",title:"D. Soal Cerita Pengurangan",concept:"Baca cerita, tentukan jumlah mula-mula, jumlah yang berkurang, lalu cari sisanya."}
];
const q=(id:string,section:SubtractionSection,prompt:string,start:number,remove:number,kind:SubtractionQuestion["kind"]="apple"):SubtractionQuestion=>({id,section,prompt,start,remove,answer:start-remove,kind,explanation:`${start} dikurangi ${remove} sama dengan ${start-remove}. Hitung benda yang masih tersisa.`});
export const subtractionPractice:SubtractionQuestion[]=[
q("s1","story","Ada 6 anak bermain. Sebanyak 2 anak pulang. Berapa anak yang masih bermain?",6,2),
q("s2","story","Ada 7 kelereng. Diambil 2 kelereng. Berapa sisanya?",7,2),
q("b1","bond","Bilangan 6 terdiri atas 4 dan berapa?",6,4,"egg"),
q("b2","bond","Bilangan 8 terdiri atas 4 dan berapa?",8,4),
q("m1","backward","Mulai dari 5, mundur 2 langkah. Berhenti di angka berapa?",5,2),
q("m2","backward","Mulai dari 9, mundur 3 langkah. Berhenti di angka berapa?",9,3),
q("t1","ten","Ada 10 kotak, 7 terisi. Berapa kotak yang kosong?",10,7),
q("t2","ten","Ada 10 bola, 4 berwarna merah. Berapa bola yang bukan merah?",10,4,"ball"),
q("i1","inverse","Jika 4 + 3 = 7, berapakah 7 − 4?",7,4),
q("i2","inverse","Jika 2 + 3 = 5, berapakah 5 − 2?",5,2),
q("w1","word","Ada 8 burung di pohon. Dua burung terbang. Berapa burung yang tersisa?",8,2,"bird"),
q("w2","word","Kira mempunyai 10 bola. Tiga bola di luar kardus. Berapa bola di dalam kardus?",10,3,"ball")
];
export const subtractionAssessment:SubtractionQuestion[]=[
q("e01","story","Ada 5 kupu-kupu. Dua terbang. Berapa yang tersisa?",5,2),
q("e02","story","Ada 7 telur. Dua pecah. Berapa yang utuh?",7,2,"egg"),
q("e03","bond","Lengkapi pasangan bilangan: 7 terdiri atas 2 dan ...",7,2),
q("e04","backward","Hitung mundur: 5 − 2 = ...",5,2),
q("e05","backward","Hitung mundur: 10 − 2 = ...",10,2),
q("e06","backward","Hitung mundur: 9 − 3 = ...",9,3),
q("e07","ten","10 − 8 = ...",10,8),
q("e08","ten","10 − 7 = ...",10,7),
q("e09","ten","10 − 3 = ...",10,3),
q("e10","inverse","Jika 8 + 2 = 10, maka 10 − 8 = ...",10,8),
q("e11","inverse","Jika 7 + 1 = 8, maka 8 − 7 = ...",8,7),
q("e12","inverse","Jika 7 − 4 = 3, maka 7 − 3 = ...",7,3),
q("e13","word","Ibu mempunyai 6 telur. Dua telur pecah. Berapa telur yang utuh?",6,2,"egg"),
q("e14","word","Kira mempunyai 8 balon. Dua diberikan kepada Mei. Berapa sisanya?",8,2,"balloon"),
q("e15","word","Ada 9 kelereng. Dua diberikan kepada Kira dan empat kepada Upe. Berapa sisanya?",9,6),
q("e16","story","Ada 9 balon. Empat balon meletus. Berapa balon yang tersisa?",9,4,"balloon"),
q("e17","bond","Bilangan 10 terdiri atas 6 dan berapa?",10,6),
q("e18","bond","Bilangan 8 terdiri atas 3 dan berapa?",8,3),
q("e19","backward","Mulai dari 7 dan mundur 0 langkah. Berhenti di angka berapa?",7,0),
q("e20","backward","Mulai dari 6 dan mundur 6 langkah. Berhenti di angka berapa?",6,6),
q("e21","ten","Ada 10 kotak, 5 diwarnai. Berapa yang belum diwarnai?",10,5),
q("e22","inverse","Jika 5 + 4 = 9, maka 9 − 5 = ...",9,5),
q("e23","word","Ada 7 siswa di kelas. Lima siswa masih di kelas. Berapa siswa yang pergi?",7,5),
q("e24","word","Kira mempunyai 10 bola. Empat bola diberikan kepada Tika. Berapa sisanya?",10,4,"ball")
];
