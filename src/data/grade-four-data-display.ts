import type {Question} from "./grade-four-whole-numbers";

export type Datum={label:string;value:number;icon?:IconKind};
export type IconKind="book"|"bus"|"ball"|"flower"|"pencil"|"student";
export type DataQuestion=Question&{
 kind:"pictogram"|"bar"|"table";
 data:Datum[];
 keyValue?:number;
 orientation?:"vertical"|"horizontal";
 task?:"build-pictogram"|"build-bar";
 difficulty?:"Sedang"|"Menantang"|"Sangat menantang";
};

const q=(kind:DataQuestion["kind"],prompt:string,data:Datum[],answer:string,explanation:string,extra:Partial<DataQuestion>={}):DataQuestion=>({kind,prompt,data,answer,explanation,...extra});
const choice=(kind:DataQuestion["kind"],prompt:string,data:Datum[],options:string[],answer:string,explanation:string,extra:Partial<DataQuestion>={}):DataQuestion=>q(kind,prompt,data,answer,explanation,{options,mode:"choice",...extra});
const build=(task:"build-pictogram"|"build-bar",prompt:string,data:Datum[],keyValue=1,orientation:"vertical"|"horizontal"="vertical"):DataQuestion=>q(task==="build-pictogram"?"table":"table",prompt,data,data.map(x=>String(x.value)).join("|"),"Setiap gambar atau batang harus tepat mewakili nilai pada tabel.",{task,keyValue,orientation});

export const topics=[
 {title:"Piktogram",steps:[
  "Piktogram menyajikan data menggunakan gambar atau simbol. Setiap baris menunjukkan satu kategori.",
  "Baca keterangan atau kunci lebih dulu. Jika 1 gambar mewakili 2 benda, maka 4 gambar berarti 4 × 2 = 8 benda.",
  "Untuk mencari data terbanyak atau tersedikit, bandingkan jumlah gambar setelah memperhitungkan kunci.",
  "Jumlah keseluruhan diperoleh dengan menjumlahkan nilai semua kategori. Piktogram harus memakai simbol yang sama besar dan tersusun rapi.",
 ],demo:"Ubah jumlah buku, pensil, dan bola. Pilih nilai 1 atau 2 untuk setiap gambar, lalu lihat bagaimana jumlah simbol berubah."},
 {title:"Diagram Batang",steps:[
  "Diagram batang memakai persegi panjang untuk menunjukkan banyak data pada setiap kategori.",
  "Judul menjelaskan data, sumbu kategori memuat nama kelompok, dan sumbu nilai menunjukkan banyaknya. Skala harus berjarak sama.",
  "Batang yang lebih tinggi atau panjang menunjukkan nilai lebih besar. Baca ujung batang terhadap skala, bukan hanya menebak dari bentuknya.",
  "Diagram dapat dibuat tegak atau mendatar. Keduanya menyajikan data yang sama jika kategori, skala, dan panjang batangnya sama.",
 ],demo:"Geser nilai setiap kategori, ubah diagram dari tegak menjadi mendatar, lalu bandingkan batang tertinggi dan terendah."},
];

export const practice:DataQuestion[][]=[
 [
  build("build-pictogram","Susun piktogram dari tabel alat tulis. Satu gambar mewakili 1 benda.",[{label:"Buku",value:6,icon:"book"},{label:"Pensil",value:4,icon:"pencil"},{label:"Bola",value:3,icon:"ball"}]),
  choice("pictogram","Mainan mana yang paling banyak?",[{label:"Mobil",value:7,icon:"bus"},{label:"Robot",value:5,icon:"student"},{label:"Bola",value:9,icon:"ball"}], ["Mobil","Robot","Bola"],"Bola","Bola memiliki 9 gambar, paling banyak dari semua kategori."),
  q("pictogram","Berapa jumlah seluruh tanaman?",[{label:"Mawar",value:5,icon:"flower"},{label:"Melati",value:8,icon:"flower"},{label:"Anggrek",value:4,icon:"flower"}],"17","5 + 8 + 4 = 17 tanaman."),
  choice("pictogram","Berapa selisih buku dan pensil?",[{label:"Buku",value:10,icon:"book"},{label:"Pensil",value:6,icon:"pencil"}], ["3","4","6","16"],"4","10 − 6 = 4."),
  q("pictogram","Satu gambar mewakili 2 siswa. Ada 6 gambar. Berapa siswa?",[{label:"Pramuka",value:12,icon:"student"}],"12","6 gambar × 2 siswa = 12 siswa.",{keyValue:2}),
 ],
 [
  build("build-bar","Atur tinggi batang sesuai tabel jumlah buku yang dibaca.",[{label:"Ayu",value:7},{label:"Bima",value:4},{label:"Citra",value:9}],1,"vertical"),
  choice("bar","Kegiatan mana yang paling banyak diikuti?",[{label:"Sepak bola",value:12},{label:"Tari",value:7},{label:"Musik",value:9},{label:"Catur",value:5}], ["Sepak bola","Tari","Musik","Catur"],"Sepak bola","Batang sepak bola mencapai 12, paling tinggi."),
  q("bar","Berapa jumlah siswa yang memilih renang dan catur?",[{label:"Renang",value:8},{label:"Catur",value:6},{label:"Lari",value:10}],"14","8 + 6 = 14 siswa."),
  q("bar","Berapa selisih data terbesar dan terkecil?",[{label:"Senin",value:13},{label:"Selasa",value:8},{label:"Rabu",value:11}],"5","13 − 8 = 5.",{orientation:"horizontal"}),
  choice("bar","Batang sepanjang 7 pada diagram mendatar menunjukkan kategori apa?",[{label:"Mawar",value:5},{label:"Melati",value:9},{label:"Anggrek",value:7}], ["Mawar","Melati","Anggrek"],"Anggrek","Ujung batang Anggrek tepat pada skala 7.",{orientation:"horizontal"}),
 ],
];

export const assessment:DataQuestion[]=[
 choice("pictogram","Transportasi apa yang digunakan paling banyak?",[{label:"Mobil",value:5,icon:"bus"},{label:"Motor",value:12,icon:"bus"},{label:"Jalan kaki",value:8,icon:"student"}], ["Mobil","Motor","Jalan kaki"],"Motor","Motor memiliki 12 simbol, paling banyak."),
 q("bar","Berapa jumlah peserta renang dan catur?",[{label:"Menyanyi",value:8},{label:"Renang",value:4},{label:"Puisi",value:7},{label:"Catur",value:5}],"9","4 + 5 = 9."),
 build("build-pictogram","Ubah tabel benda di meja guru menjadi piktogram. Satu gambar mewakili 1 benda.",[{label:"Buku",value:5,icon:"book"},{label:"Spidol",value:3,icon:"pencil"},{label:"Penghapus",value:2,icon:"pencil"}]),
 choice("bar","Lomba apa yang diikuti 6 siswa?",[{label:"Matematika",value:14},{label:"IPA",value:6},{label:"Bahasa",value:11},{label:"Puisi",value:4}], ["Matematika","Puisi","IPA","Bahasa"],"IPA","Batang IPA berakhir pada skala 6."),
 q("pictogram","Satu gambar mewakili 2 buku. Ada 7 gambar. Berapa buku?",[{label:"Jumat",value:14,icon:"book"}],"14","7 × 2 = 14 buku.",{keyValue:2}),
 build("build-bar","Buat diagram batang mendatar dari data bunga.",[{label:"Mawar",value:6},{label:"Melati",value:10},{label:"Anggrek",value:8}],1,"horizontal"),
 q("pictogram","Berapa jumlah seluruh kelereng?",[{label:"Azizah",value:6,icon:"ball"},{label:"Karel",value:7,icon:"ball"},{label:"Putu",value:3,icon:"ball"},{label:"Slamet",value:9,icon:"ball"}],"25","6 + 7 + 3 + 9 = 25."),
 choice("bar","Kategori manakah yang paling sedikit?",[{label:"Sains",value:9},{label:"Seni",value:4},{label:"Olahraga",value:11},{label:"Bahasa",value:7}], ["Sains","Olahraga","Seni","Bahasa"],"Seni","Batang Seni paling pendek, nilainya 4."),
 q("bar","Berapa selisih peserta Matematika dan Puisi?",[{label:"Matematika",value:15},{label:"IPA",value:8},{label:"Puisi",value:5}],"10","15 − 5 = 10."),
 choice("pictogram","Pernyataan mana yang benar?",[{label:"Senin",value:8,icon:"book"},{label:"Selasa",value:11,icon:"book"},{label:"Rabu",value:8,icon:"book"}], ["Senin paling banyak","Rabu lebih banyak dari Selasa","Selasa paling banyak"],"Selasa paling banyak","Selasa memiliki 11 buku."),
 build("build-bar","Ubah tabel peminjaman buku menjadi diagram batang tegak.",[{label:"Senin",value:9},{label:"Selasa",value:13},{label:"Rabu",value:7}],1,"vertical"),
 q("pictogram","Satu simbol mewakili 3 siswa. Baris bus berisi 4 simbol dan baris jalan kaki 3 simbol. Berapa total siswa?",[{label:"Bus",value:12,icon:"bus"},{label:"Jalan kaki",value:9,icon:"student"}],"21","(4 + 3) × 3 = 21 siswa.",{keyValue:3}),
 choice("bar","Jika 3 siswa lagi memilih Tari, kategori mana yang kemudian sama banyak dengan Tari?",[{label:"Tari",value:6},{label:"Musik",value:9},{label:"Catur",value:5}], ["Musik","Catur","Tidak ada"],"Musik","6 + 3 = 9, sama dengan Musik."),
 q("pictogram","Berapa selisih kategori terbanyak dan tersedikit?",[{label:"Buku",value:12,icon:"book"},{label:"Pensil",value:5,icon:"pencil"},{label:"Penghapus",value:8,icon:"pencil"}],"7","12 − 5 = 7."),
 choice("bar","Diagram diubah dari tegak menjadi mendatar. Apa yang tetap sama?",[{label:"A",value:4},{label:"B",value:8},{label:"C",value:6}], ["Nilai setiap kategori","Arah batang","Letak sumbu"],"Nilai setiap kategori","Orientasi berubah, tetapi data tetap 4, 8, dan 6."),
 build("build-pictogram","Lengkapi piktogram dengan kunci 1 gambar = 2 buah.",[{label:"Apel",value:8,icon:"ball"},{label:"Jeruk",value:12,icon:"ball"},{label:"Mangga",value:6,icon:"ball"}],2),
 q("bar","Jumlah seluruh data 34. Tiga batang bernilai 8, 11, dan 6. Berapa nilai batang keempat?",[{label:"A",value:8},{label:"B",value:11},{label:"C",value:6},{label:"D",value:9}],"9","34 − (8 + 11 + 6) = 9."),
 choice("pictogram","Dengan kunci 1 gambar = 2 bunga, kategori mana yang membutuhkan tepat 5 gambar?",[{label:"Mawar",value:8,icon:"flower"},{label:"Melati",value:10,icon:"flower"},{label:"Anggrek",value:12,icon:"flower"}], ["Mawar","Melati","Anggrek"],"Melati","10 ÷ 2 = 5 gambar."),
 q("bar","Batang A dua kali batang B. Jika B bernilai 6, berapa nilai A?",[{label:"A",value:12},{label:"B",value:6}],"12","2 × 6 = 12."),
 choice("table","Data 9 benda akan dibuat dengan kunci 1 gambar = 2 benda. Apa masalahnya jika hanya memakai gambar utuh?",[{label:"Benda",value:9,icon:"ball"}], ["Tidak ada masalah","Diperlukan setengah gambar atau kunci lain","Harus memakai 9 gambar"],"Diperlukan setengah gambar atau kunci lain","9 tidak habis dibagi 2; perlu setengah simbol atau memilih kunci yang sesuai.",{keyValue:2}),
 q("bar","Skala diagram melompat 2 angka. Ujung batang berada pada garis ke-7 setelah nol. Berapa nilainya?",[{label:"Panen",value:14}],"14","7 × 2 = 14."),
 choice("table","Pilih data yang dapat dibuat tanpa setengah gambar jika 1 simbol = 3 benda.",[{label:"A",value:10,icon:"book"},{label:"B",value:12,icon:"book"},{label:"C",value:14,icon:"book"}], ["A","B","C"],"B","12 habis dibagi 3, menghasilkan 4 simbol utuh.",{keyValue:3}),
 q("bar","Data awal 7, 9, 5, dan 11. Setiap nilai bertambah 2. Berapa total data baru?",[{label:"A",value:9},{label:"B",value:11},{label:"C",value:7},{label:"D",value:13}],"40","Total awal 32. Empat kategori masing-masing naik 2, jadi 32 + 8 = 40."),
 choice("pictogram","Dua piktogram memakai data sama. Piktogram X memakai kunci 1 gambar = 1 benda, Y memakai 1 gambar = 2 benda. Manakah yang memakai lebih sedikit gambar?",[{label:"Data",value:12,icon:"ball"}], ["X","Y","Sama"],"Y","Y hanya membutuhkan 6 gambar, sedangkan X membutuhkan 12.",{keyValue:2}),
];

assessment.forEach((item,i)=>item.difficulty=i<8?"Sedang":i<17?"Menantang":"Sangat menantang");
export const ready=(question:DataQuestion,value:string)=>question.task?value.split("|").length===question.data.length&&value.split("|").every(x=>/^\d+$/.test(x)):Boolean(value.trim());
export const correct=(question:DataQuestion,value:string|undefined)=>{
 if(!value)return false;
 if(question.task)return value===question.answer;
 if(question.mode==="multiple")return value.split("|").sort().join("|")===question.answer.split("|").sort().join("|");
 return /^\d+$/.test(question.answer)?Number(value.replaceAll(".",""))===Number(question.answer):value===question.answer;
};
