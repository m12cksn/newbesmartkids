export type ShapeName="Bentuk lengkung"|"Segitiga"|"Segi empat";
export type ShapeSection="describe"|"group"|"compose";
export type ShapeQuestion={id:string;section:ShapeSection;prompt:string;options:string[];answer:string;explanation:string;difficulty:"mudah"|"sedang"|"menantang"|"sangat sulit";shape?:ShapeName};
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
q("e01","describe","Amati jam dan piring pada gambar. Ciri bentuk yang sama adalah ...",["Keduanya memiliki tepi melengkung","Keduanya memiliki tiga sudut","Keduanya memiliki empat sudut"],"Keduanya memiliki tepi melengkung","sedang"),
q("e02","compose","Dua segitiga pada gambar disatukan tepat di sisi miring. Bentuk luar yang muncul adalah ...",["Segi empat","Lingkaran","Segitiga"],"Segi empat","sedang"),
q("e03","group","Dari tiga benda pada gambar, mana yang tidak satu kelompok berdasarkan bentuk?",["Pintu","Piring","Jam dinding"],"Pintu","sedang"),
q("e04","describe","Amati jendela dan bingkai foto. Ciri apa yang dimiliki keduanya?",["Empat sisi lurus","Tiga sisi lurus","Tepi melengkung"],"Empat sisi lurus","sedang"),
q("e05","group","Perhatikan penggaris segitiga dan risol pada gambar. Benda lain yang cocok dalam kelompok itu adalah ...",["Potongan semangka segitiga","Piring bundar","Buku"],"Potongan semangka segitiga","sedang"),
q("e06","compose","Persegi pada gambar dipotong mengikuti garis miring dari sudut ke sudut. Hasilnya adalah ...",["Dua segitiga","Dua lingkaran","Dua persegi"],"Dua segitiga","sedang"),
q("e07","group","Pada gambar, benda mana yang berbeda bentuk dari dua benda lainnya?",["Penggaris segitiga","Buku","Jendela"],"Penggaris segitiga","sedang"),
q("e08","describe","Gantungan baju dan penggaris segitiga pada gambar mempunyai ciri bentuk yang sama, yaitu ...",["Tiga sisi utama","Empat sisi sama panjang","Tepi bundar"],"Tiga sisi utama","sedang"),
q("e09","compose","Dua bagian pada gambar harus disatukan. Sisi mana yang perlu dipertemukan agar menjadi persegi?",["Dua sisi miring","Dua sudut runcing saja","Dua sisi yang berjauhan"],"Dua sisi miring","menantang"),
q("e10","group","Benda mana yang dapat menggantikan jam dinding dalam kelompok benda bertepi lengkung?",["Telur","Pintu","Buku"],"Telur","menantang"),
q("e11","describe","Dua bangun segi empat pada gambar berbeda ukuran. Apa yang tetap sama?",["Jumlah sisinya","Panjang sisinya","Luasnya"],"Jumlah sisinya","menantang"),
q("e12","compose","Gambar menunjukkan persegi yang diurai. Jika satu segitiga diambil, potongan yang tersisa berbentuk ...",["Segitiga","Lingkaran","Segi lima"],"Segitiga","menantang"),
q("e13","group","Pilih kelompok yang seluruh bendanya mempunyai empat sisi lurus.",["Pintu, buku, jendela","Piring, jam, telur","Risol, penggaris, piring"],"Pintu, buku, jendela","menantang"),
q("e14","compose","Bangun pada gambar terdiri dari dua segitiga. Jika garis pemisah dihilangkan, bangun luarnya adalah ...",["Segi empat","Lingkaran","Tiga segitiga"],"Segi empat","menantang"),
q("e15","describe","Perhatikan bentuk oval telur dan piring bundar. Mengapa keduanya satu kelompok?",["Sama-sama bertepi lengkung","Sama-sama bulat sempurna","Sama-sama punya empat sudut"],"Sama-sama bertepi lengkung","menantang"),
q("e16","group","Pada gambar ada tiga benda. Pilih benda yang tidak cocok jika aturannya empat sisi lurus.",["Melon","Jendela","Bingkai foto"],"Melon","menantang"),
q("e17","compose","Dua segitiga siku-siku yang sama besar disusun menjadi persegi. Garis yang membagi persegi itu disebut ...",["Diagonal","Garis lengkung","Lingkaran"],"Diagonal","menantang"),
q("e18","describe","Perhatikan dua bentuk segitiga yang diputar berbeda arah. Apa kesimpulan yang benar?",["Keduanya tetap segitiga","Salah satunya menjadi segi empat","Salah satunya menjadi lingkaran"],"Keduanya tetap segitiga","menantang"),
q("e19","group","Jika benda dikelompokkan berdasarkan bentuk, manakah pasangan yang paling tepat?",["Buku dan pintu","Buku dan telur","Piring dan penggaris segitiga"],"Buku dan pintu","menantang"),
q("e20","compose","Sebuah persegi dibagi oleh satu diagonal. Ada berapa segitiga penyusunnya?",["Dua","Tiga","Empat"],"Dua","sangat sulit"),
q("e21","group","Dari empat benda pada gambar, berapa benda yang memiliki tepi melengkung?",["Dua","Satu","Tiga"],"Dua","sangat sulit"),
q("e22","compose","Perhatikan dua segitiga pada gambar. Jika disatukan tanpa celah, berapa sisi pada batas luarnya?",["Empat","Tiga","Lima"],"Empat","sangat sulit"),
q("e23","describe","Sebuah persegi diputar hingga tampak seperti belah ketupat. Berapa jumlah sisinya sekarang?",["Empat","Tiga","Lima"],"Empat","sangat sulit"),
q("e24","group","Amati piring, telur, jendela, dan buku. Jika dipisahkan menurut bentuk, kelompok yang benar adalah ...",["Piring dan telur; jendela dan buku","Piring dan buku; telur dan jendela","Piring dan jendela; telur dan buku"],"Piring dan telur; jendela dan buku","sangat sulit")
];
