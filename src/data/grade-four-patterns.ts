import type { Question } from "./grade-four-whole-numbers";

export type PatternObject = "marble" | "flower" | "tile" | "can" | "brick" | "book" | "chair";
export type PatternQuestion = Question & {
  id: string;
  kind: "picture" | "build" | "pick" | "number" | "table";
  values: number[];
  blanks: number[];
  object?: PatternObject;
  choices?: number[];
  target?: number[];
  rowLabel?: string;
  difficulty: "sedang" | "menantang" | "sangat menantang";
  source: string;
};
export const objectNames: Record<PatternObject,string> = {marble:"kelereng",flower:"bunga",tile:"ubin segi enam",can:"kaleng",brick:"batu bata",book:"buku",chair:"kursi"};
export const sequence = (start:number, change:number, length:number) => Array.from({length},(_,i)=>start+change*i);

function picture(id:string,start:number,change:number,kind:PatternQuestion["kind"],object:PatternObject,blank=3,choices?:number[]):PatternQuestion {
  const values=sequence(start,change,4);
  return {id,kind,values,blanks:[blank],object,choices,answer:String(values[blank]),
    prompt:kind === "build" ? `Susun banyak ${objectNames[object]} untuk melengkapi kumpulan ke-${blank+1}.` : kind === "pick" ? `Pilih gambar untuk kumpulan ke-${blank+1} yang kosong.` : `Berapa ${objectNames[object]} pada kumpulan ke-${blank+1} yang kosong?`,
    explanation:`Banyak benda ${change>0?"bertambah":"berkurang"} ${Math.abs(change)} setiap kumpulan. Urutannya ${values.join(", ")}. Jadi kumpulan ke-${blank+1} berisi ${values[blank]} benda.`,
    difficulty:blank===3?"sedang":"menantang",source:change>0?"Evaluasi 1–2; Latihan gambar 1–2, 5":"Evaluasi 3–4; Latihan gambar 3–5"};
}
function numbers(id:string,start:number,change:number,blanks:number[],length=6):PatternQuestion {
  const values=sequence(start,change,length);
  return {id,kind:"number",values,blanks,answer:blanks.map(i=>values[i]).join("|"),
    prompt:"Lengkapi setiap kotak kosong dari kiri ke kanan.",
    explanation:`Setiap langkah ${change>0?"ditambah":"dikurangi"} ${Math.abs(change)}. Pola lengkap: ${values.join(", ")}.`,
    difficulty:blanks.length>1?"menantang":"sedang",source:change>0?"Evaluasi 5–6; Latihan bilangan 1–2":"Evaluasi 7–8; Latihan bilangan 3–5"};
}
function table(id:string,start:number,change:number,target:number[],object:PatternObject,rowLabel:string,prompt:string):PatternQuestion {
  const values=sequence(start,change,4);
  const result=target.map(n=>start+(n-1)*change);
  return {id,kind:"table",values,blanks:[],target,object,rowLabel,prompt,answer:result.join("|"),
    explanation:`Setiap ${rowLabel.toLowerCase()} ${change>0?"bertambah":"berkurang"} ${Math.abs(change)} ${objectNames[object]}. ${target.map((n,i)=>`${rowLabel} ke-${n}: ${start} ${change>0?"+":"−"} (${n-1} × ${Math.abs(change)}) = ${result[i]}`).join("; ")}. Dari posisi pertama ke posisi ke-n terdapat n − 1 perubahan.`,
    difficulty:target.length>1 || target[0]>8?"sangat menantang":"menantang",source:change>0?"Evaluasi 10; Latihan bilangan 6–7":"Evaluasi 9; Latihan bilangan 8"};
}
export const topics = [
  { title:"Pola gambar", intro:"Pola gambar adalah susunan gambar yang mengikuti aturan. Di bab ini kita memperhatikan banyak benda pada setiap kumpulan, bukan besar atau kecil ukuran gambarnya.",
    steps:["Hitung benda pada kumpulan pertama, kedua, dan ketiga. Catat hasil hitungan secara berurutan.","Bandingkan dua kumpulan yang berdekatan. Periksa apakah jumlah yang ditambahkan atau diambil selalu sama.","Pada pola membesar, banyak benda bertambah. Pada pola mengecil, banyak benda berkurang.","Gunakan aturan yang sama untuk membuat kumpulan berikutnya. Jika bagian tengah kosong, periksa juga kumpulan sebelum dan sesudahnya."],
    remember:"Susunan boleh berbeda, tetapi setiap benda tetap dihitung satu kali. Kita mencari pola jumlah benda dengan selisih tetap.",demo:"Pilih pola membesar atau mengecil. Ubah selisih, lalu susun kumpulan keempat. Periksa dan lanjutkan penjelasan langkah demi langkah." },
  { title:"Pola bilangan", intro:"Pola bilangan adalah urutan bilangan yang disusun menurut aturan tertentu. Banyak benda dari pola gambar dapat ditulis sebagai pola bilangan.",
    steps:["Baca bilangan sesuai urutannya. Cari selisih bilangan kedua dan pertama, lalu periksa pada pasangan berikutnya.","Jika selalu ditambah bilangan yang sama, polanya membesar. Jika selalu dikurangi bilangan yang sama, polanya mengecil.","Isi kotak kosong satu langkah demi satu langkah. Untuk kotak di tengah, periksa hasilnya terhadap kedua tetangganya.","Pada tabel dan soal cerita, bedakan nomor urutan dengan banyak benda. Baris ke-7 berarti enam perubahan dari baris pertama."],
    remember:"Contoh: 8, 13, 18, 23 bertambah 5. Bilangan kelima adalah 28. Dari bilangan pertama ke kelima ada empat langkah, bukan lima.",demo:"Ubah bilangan awal dan besar perubahan. Tekan Langkah berikutnya untuk melihat hitungan serta tabel berkembang bersama." },
];
export const practice:PatternQuestion[][] = [
  [picture("p1",3,3,"build","marble"),picture("p2",20,-4,"picture","brick"),picture("p3",2,4,"pick","flower",1,[10,6,8]),picture("p4",17,-3,"build","can"),picture("p5",4,2,"pick","tile",0,[2,6,4])],
  [numbers("p6",8,13,[4],5),numbers("p7",17,15,[2,4],5),numbers("p8",124,-17,[3,5]),table("p9",7,6,[5,7],"book","Rak","Buku di setiap rak mengikuti pola pada tabel. Lengkapi banyak buku pada kedua rak yang ditanyakan."),table("p10",108,-12,[6,8],"can","Hari","Pengiriman kaleng berkurang dengan pola tetap. Berapa kaleng dikirim pada kedua hari berikut?")],
];
export const assessment:PatternQuestion[] = [
  picture("e1",3,4,"picture","marble"),
  numbers("e2",11,7,[4],5),
  picture("e3",24,-5,"build","can"),
  numbers("e4",96,-13,[2,5]),
  table("e5",92,-9,[7],"flower","Hari","Penjualan bunga mengikuti tabel. Berapa bunga terjual pada hari ke-7?"),
  picture("e6",4,3,"pick","tile",1,[10,7,6]),
  numbers("e7",19,11,[2,4]),
  picture("e8",26,-6,"picture","brick"),
  table("e9",14,5,[9],"chair","Baris","Sebuah aula memiliki 9 baris kursi. Berapa kursi pada baris terakhir jika polanya tetap?"),
  picture("e10",5,3,"build","flower"),
  numbers("e11",157,-19,[3,5]),
  picture("e12",22,-4,"pick","can",2,[12,10,14]),
  table("e13",127,-14,[8],"book","Hari","Buku yang dipinjam tiap hari mengikuti tabel. Berapa buku dipinjam pada hari ke-8?"),
  numbers("e14",28,16,[1,4]),
  picture("e15",6,4,"picture","tile",0),
  table("e16",9,7,[6,10],"chair","Baris","Lengkapi banyak kursi pada baris ke-6 dan ke-10 sesuai pola."),
  picture("e17",27,-5,"build","brick",1),
  numbers("e18",215,-23,[2,4]),
  picture("e19",2,5,"pick","marble",2,[12,10,15]),
  table("e20",168,-17,[7,9],"can","Hari","Pengiriman kaleng mengikuti pola menurun. Lengkapi banyak kiriman hari ke-7 dan ke-9."),
  numbers("e21",36,18,[1,3,5]),
  picture("e22",25,-7,"pick","flower",1,[11,18,21]),
  table("e23",18,8,[8,12],"chair","Baris","Teater memiliki 12 baris. Berapa kursi pada baris ke-8 dan baris terakhir?"),
  numbers("e24",231,-27,[1,3,5]),
];
export function ready(q:PatternQuestion,answer:string) {
  const count=q.kind==="table"?q.target!.length:q.kind==="number"?q.blanks.length:1;
  const parts=answer.split("|");
  return parts.length===count && parts.every(value=>/^\d+$/.test(value));
}
export function checkAnswer(q:PatternQuestion,answer:string|undefined) {
  return Boolean(answer && ready(q,answer) && answer.split("|").map(Number).join("|")===q.answer);
}
