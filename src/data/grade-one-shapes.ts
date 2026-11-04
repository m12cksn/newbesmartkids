export type ShapeName="Bentuk lengkung"|"Segitiga"|"Segi empat";
export type ShapeSection="describe"|"group"|"compose";
export type ShapeQuestion={id:string;section:ShapeSection;prompt:string;options:string[];answer:string;explanation:string;difficulty:"mudah"|"sedang"|"menantang";shape?:ShapeName};
export const shapeSections=[
{id:"describe" as const,title:"A. Mendeskripsikan Benda Berdasarkan Bentuk",concept:"Amati benda di sekitar kita. Jam dan piring memiliki bentuk lengkung, penggaris segitiga memiliki bentuk segitiga, sedangkan pintu dan buku memiliki bentuk segi empat."},
{id:"group" as const,title:"B. Mengelompokkan Benda",concept:"Benda dapat dikelompokkan berdasarkan bentuk, warna, dan ukuran. Pilih satu aturan pengelompokan, lalu cari benda yang sesuai."},
{id:"compose" as const,title:"C. Menyusun dan Mengurai Bentuk Bangun",concept:"Dua segitiga dapat disusun menjadi bangun baru. Sebaliknya, bangun dapat diurai menjadi bagian-bagian bentuk sederhana."}
];
const q=(id:string,section:ShapeSection,prompt:string,options:string[],answer:string,difficulty:ShapeQuestion["difficulty"]="mudah",shape?:ShapeName):ShapeQuestion=>({id,section,prompt,options,answer,difficulty,shape,explanation:`Jawaban yang benar adalah ${answer}. Perhatikan ciri bentuknya.`});
const names=["Bentuk lengkung","Segitiga","Segi empat"];
export const shapePractice:ShapeQuestion[]=[
q("p01","describe","Jam dinding berbentuk apa?",names,"Bentuk lengkung","mudah","Bentuk lengkung"),
q("p02","describe","Penggaris segitiga berbentuk apa?",names,"Segitiga","sedang","Segitiga"),
q("p03","group","Manakah yang satu kelompok dengan piring berdasarkan bentuk?",["Jam dinding","Pintu","Penggaris segitiga"],"Jam dinding"),
q("p04","group","Manakah yang satu kelompok dengan buku berdasarkan bentuk?",["Bingkai foto","Melon","Kue risol"],"Bingkai foto","sedang"),
q("p05","compose","Dua segitiga siku-siku yang cocok dapat digabung menjadi ...",["Segi empat","Bentuk lengkung","Lingkaran"],"Segi empat"),
q("p06","compose","Sebuah persegi yang dipotong diagonal menghasilkan ...",["Dua segitiga","Dua lingkaran","Tiga oval"],"Dua segitiga","sedang")
];
export const shapeAssessment:ShapeQuestion[]=[
q("e01","describe","Bentuk jam dinding yang bundar adalah ...",names,"Bentuk lengkung"),
q("e02","describe","Bentuk pintu adalah ...",names,"Segi empat"),
q("e03","describe","Bentuk kue risol segitiga adalah ...",names,"Segitiga"),
q("e04","describe","Bentuk bingkai foto persegi panjang adalah ...",names,"Segi empat"),
q("e05","describe","Bentuk buah melon yang bulat adalah ...",names,"Bentuk lengkung"),
q("e06","describe","Bentuk penggaris segitiga adalah ...",names,"Segitiga"),
q("e07","describe","Bentuk jendela persegi adalah ...",names,"Segi empat","sedang"),
q("e08","describe","Bentuk piring bundar adalah ...",names,"Bentuk lengkung","sedang"),
q("e09","group","Manakah yang satu kelompok dengan jam dinding berdasarkan bentuk?",["Piring bundar","Pintu","Buku"],"Piring bundar"),
q("e10","group","Manakah yang satu kelompok dengan buku berdasarkan bentuk?",["Jendela","Telur","Semangka segitiga"],"Jendela"),
q("e11","group","Manakah yang satu kelompok dengan penggaris segitiga?",["Kue risol segitiga","Jam","Pintu"],"Kue risol segitiga"),
q("e12","group","Kelompok segitiga memiliki ...",["Tiga sisi lurus","Empat sisi lurus","Tepi melengkung"],"Tiga sisi lurus"),
q("e13","group","Kelompok segi empat memiliki ...",["Empat sisi lurus","Tiga sisi lurus","Tepi melengkung"],"Empat sisi lurus"),
q("e14","group","Manakah kelompok benda yang semuanya berbentuk lengkung?",["Jam, piring, telur","Buku, pintu, jendela","Penggaris segitiga, risol, semangka segitiga"],"Jam, piring, telur","sedang"),
q("e15","group","Segitiga besar dan segitiga kecil dikelompokkan berdasarkan ...",["Bentuk","Ukuran yang sama","Warna yang sama"],"Bentuk","sedang"),
q("e16","group","Benda merah dan merah dapat dikelompokkan berdasarkan ...",["Warna","Bentuk saja","Ukuran saja"],"Warna","sedang"),
q("e17","compose","Dua segitiga siku-siku yang sama dapat disusun menjadi ...",["Segi empat","Lingkaran","Oval"],"Segi empat"),
q("e18","compose","Persegi yang dipotong melalui diagonal menjadi ...",["Dua segitiga","Dua lingkaran","Dua oval"],"Dua segitiga"),
q("e19","compose","Bangun segi empat bisa diurai menjadi dua ...",["Segitiga","Lingkaran","Oval"],"Segitiga"),
q("e20","compose","Dua bagian segitiga yang cocok dapat digabung tanpa celah menjadi ...",["Bangun baru","Titik","Garis saja"],"Bangun baru","sedang"),
q("e21","compose","Untuk menyusun persegi dari dua segitiga siku-siku sama besar, kedua sisi miringnya harus ...",["Saling bertemu","Saling menjauh","Tidak disentuhkan"],"Saling bertemu","menantang"),
q("e22","compose","Sebuah lingkaran yang kehilangan satu bagian melengkung dapat dilengkapi dengan ...",["Potongan lengkung yang cocok","Segitiga besar","Persegi panjang"],"Potongan lengkung yang cocok","menantang"),
q("e23","compose","Bangun robot pada buku tersusun dari ...",["Berbagai bentuk datar","Hanya lingkaran","Hanya segitiga"],"Berbagai bentuk datar","sedang"),
q("e24","compose","Jika dua segitiga digabung membentuk persegi, bentuk penyusunnya adalah ...",["Segitiga","Lingkaran","Oval"],"Segitiga","menantang")
];
