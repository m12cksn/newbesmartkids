export type Row = {name:string; count:number};
export type Scene = {kind:'names'|'objects'; rows:Row[]; caption:string} | {kind:'raw'; values:(number|string)[]; caption:string} | {kind:'word'; word:string; caption:string} | {kind:'story'; rows:Row[]; caption:string; grades:number[]};
export type Field = {label:string; value:string; type:'number'|'names'|'order'|'text'; counts?:Record<string,number>; direction?:'asc'|'desc'};
export type DQuestion = {id:string; topic:number; prompt:string; answer:string; explanation:string; difficulty:'sedang'|'menantang'|'sangat menantang'; source:string; scene:Scene; fields:Field[]; table?:{label:string; rows:Row[]; tally:boolean}};
export const topics=[
 {title:'Mengurutkan dan Membandingkan Data',steps:['Data adalah keterangan yang kita kumpulkan. Nama anak dan banyak anggota keluarganya dapat ditulis sebagai daftar atau tabel. Setiap angka tetap bersama nama pemiliknya.','Untuk mengurutkan dari paling sedikit, cari nilai terkecil, lalu nilai berikutnya. Jika dua nilai sama, kedua nama boleh bertukar tempat. Mengurutkan tidak menambah atau menghilangkan data.','Bandingkan data untuk menemukan yang paling sedikit, paling banyak, dan sama banyak. Jangkauan adalah nilai terbesar dikurangi nilai terkecil, bukan banyaknya data.'],try:'Ubah data keluarga, kemudian susun nama dari jumlah paling sedikit. Amati perubahan jangkauannya.'},
 {title:'Menyajikan Data dalam Bentuk Tabel',steps:['Catat semua data, lalu kelompokkan nilai atau jenis yang sama. Setiap data dihitung tepat satu kali. Banyak kemunculan suatu nilai disebut frekuensi.','Turus membantu mencatat satu demi satu. Buat empat garis tegak, lalu satu garis menyilang untuk data kelima. Enam berarti satu kelompok lima dan satu garis lagi.','Buat kolom jenis data, turus, dan banyaknya. Jumlah seluruh frekuensi harus sama dengan banyak data awal. Tabel memudahkan kita membaca, membandingkan, dan mengurutkan data.','Untuk percobaan manik-manik, catat banyak manik merah setiap pengambilan. Kembalikan semua manik sebelum pengambilan berikutnya. Hasil tiap percobaan boleh berbeda.'],try:'Ketuk huruf untuk mencatat turus atau lakukan pengambilan manik. Lengkapi tabel sendiri, lalu periksa jumlahnya.'},
];
export const frequency=(values:(string|number)[]):Row[]=>Object.entries(values.reduce<Record<string,number>>((a,v)=>{a[String(v)]=(a[String(v)]??0)+1;return a;},{})).map(([name,count])=>({name,count}));
const names=(items:[string,number][],caption='Banyak kelereng milik lima anak'):Scene=>({kind:'names',rows:items.map(([name,count])=>({name,count})),caption});
const word=(s:string):Scene=>({kind:'word',word:s,caption:`Huruf-huruf pada kata ${s}`});
const raw=(values:(number|string)[],caption='Nilai ulangan siswa'):Scene=>({kind:'raw',values,caption});
export const sceneRows=(s:Scene):Row[]=>'rows' in s?s.rows:frequency(s.kind==='word'?[...s.word]:s.values);
const num=(label:string,value:number):Field=>({label,value:String(value),type:'number'});
const set=(label:string,values:string[]):Field=>({label,value:values.join(', '),type:'names'});
const ordered=(s:Scene,label:string,desc=false):Field=>{const rows=sceneRows(s);return {label,type:'order',value:[...rows].sort((a,b)=>desc?b.count-a.count:a.count-b.count).map(r=>r.name).join(', '),counts:Object.fromEntries(rows.map(r=>[r.name,r.count])),direction:desc?'desc':'asc'};};
const equal=(s:Scene,count:number)=>sceneRows(s).filter(r=>r.count===count).map(r=>r.name);
const extreme=(s:Scene,max:boolean)=>{const rows=sceneRows(s),v=(max?Math.max:Math.min)(...rows.map(r=>r.count));return rows.filter(r=>r.count===v).map(r=>r.name);};
function make(id:string,topic:number,scene:Scene,prompt:string,fields:Field[],source:string,difficulty:DQuestion['difficulty']='sedang',table?:DQuestion['table']):DQuestion{
 const fs=table?[...fields,...table.rows.flatMap(r=>[...(table.tally?[num(`Turus ${r.name}`,r.count)]:[]),num(`Banyak ${r.name}`,r.count)])]:fields;
 return {id,topic,scene,prompt,fields:fs,source,difficulty,table,answer:JSON.stringify(fs.map(f=>f.value)),explanation:fs.map(f=>`${f.label}: ${f.value}.`).join(' ')+(table?' Hitung setiap data sekali. Jumlah semua frekuensi harus sama dengan banyak data awal.':' Bandingkan nilai, bukan urutan nama pada daftar.')};
}
const family=names([['Dina',4],['Raka',7],['Sari',5],['Bayu',7],['Nisa',3]],'Banyak anggota keluarga (termasuk anak yang disebut)');
const marbles=names([['Ayu',6],['Bima',9],['Citra',4],['Doni',9],['Eka',2]]);
const balls:Scene={kind:'objects',caption:'Benda di meja belajar. Hitung setiap gambar satu kali.',rows:[{name:'Buku',count:5},{name:'Bola',count:3},{name:'Pensil',count:4},{name:'Penghapus',count:3},{name:'Rautan',count:6}]};
const objects2:Scene={kind:'objects',caption:'Peralatan kelas dan bola olahraga',rows:[{name:'Buku',count:4},{name:'Bola',count:2},{name:'Pensil',count:5},{name:'Penghapus',count:2},{name:'Rautan',count:3}]};
const scores1=raw([8,7,9,6,8,10,5,8,7,9,6,8,9,7,5,10,8,6,7,9]);
const scores2=raw([8,9,7,7,9,6,5,8,10,7,6,8,9,6,5,4,8,10,9,7,8,6,7,8,9,7,8,6,10,8]);
const letters=raw(['a','b','c','x','y','b','c','a','x','y','c','b','a','c','y','x','c','b','x','a','c','y','b','c','x','c','b','y','a','c'],'Daftar huruf; setiap huruf merupakan satu data');
const story:Scene={kind:'story',caption:'Tara, Uli dan Vino kelas 3. Seno kelas 6. Setiap siswa kelas 3 membutuhkan 9 buku setahun; kelas 6 membutuhkan 12 buku setahun.',grades:[3,6,3,3],rows:[{name:'Tara',count:9},{name:'Seno',count:12},{name:'Uli',count:9},{name:'Vino',count:9}]};
const countValue=(s:Scene,v:string)=>sceneRows(s).find(r=>r.name===v)?.count??0;
const scoreRange=(s:Scene)=>{if(s.kind!=='raw')return 0;return Math.max(...s.values.map(Number))-Math.min(...s.values.map(Number));};
const table=(s:Scene,label:string,tally=true)=>({label,rows:sceneRows(s),tally});
const sortedValues=(s:Scene):Field=>({label:'Semua nilai dari terkecil',value:s.kind==='raw'?[...s.values].map(Number).sort((a,b)=>a-b).join(', '):'',type:'text'});
export const practice:DQuestion[]=[
 make('p1',0,family,'Urutkan nama anak dari anggota keluarga paling sedikit.',[ordered(family,'Urutan nama')],'199'),
 make('p2',0,family,'Tuliskan semua nama dengan anggota keluarga terbanyak dan nama dengan anggota keluarga paling sedikit.',[set('Terbanyak',extreme(family,true)),set('Paling sedikit',extreme(family,false))],'199'),
 make('p3',0,scores1,'Urutkan seluruh nilai dari terkecil. Tuliskan jangkauannya.',[sortedValues(scores1),num('Jangkauan',scoreRange(scores1))],'200,207','menantang'),
 make('p4',0,objects2,'Hitung gambar. Urutkan nama benda dari yang paling sedikit dan tuliskan semua benda yang berjumlah 2.',[ordered(objects2,'Urutan benda'),set('Berjumlah 2',equal(objects2,2))],'210','menantang'),
 make('p5',0,story,'Siapa yang membutuhkan buku terbanyak? Siapa saja yang membutuhkan buku sama banyak (9 buku)?',[set('Terbanyak',extreme(story,true)),set('Sama banyak',equal(story,9))],'209','menantang'),
 make('p6',1,word('PERPUSTAKAAN'),'Lengkapi turus dan banyak setiap huruf. Satu huruf dihitung satu kali.',[],'206–207','sedang',table(word('PERPUSTAKAAN'),'Huruf')),
 make('p7',1,scores1,'Sajikan nilai ulangan dalam tabel turus dan frekuensi.',[],'207','menantang',table(scores1,'Nilai')),
 make('p8',1,word('KESEHATAN'),'Urutkan huruf berdasarkan frekuensi paling banyak. Tuliskan semua huruf dengan frekuensi 1.',[ordered(word('KESEHATAN'),'Urutan huruf',true),set('Muncul sekali',equal(word('KESEHATAN'),1))],'206','menantang'),
 make('p9',1,letters,'Buat tabel frekuensi huruf. Jika x berarti pensil dan y berarti buku, berapa jumlah pensil dan buku?', [num('Pensil dan buku',countValue(letters,'x')+countValue(letters,'y'))],'210–211','sangat menantang',table(letters,'Huruf',false)),
 make('p10',1,raw([3,5,2,4,3,6,5,3,4,5],'Banyak manik merah pada sepuluh pengambilan; manik dikembalikan tiap kali'),'Lengkapi tabel hasil percobaan manik merah.',[],'204–205','menantang',table(raw([3,5,2,4,3,6,5,3,4,5]),'Manik merah')),
];
export const assessment:DQuestion[]=[
 make('e1',0,marbles,'Urutkan nama anak dari pemilik kelereng paling sedikit.',[ordered(marbles,'Urutan nama')],'208 soal1a'),
 make('e2',1,word('MATEMATIKAWAN'),'Buat turus dan banyak setiap huruf pada kata berikut.',[],'208 soal2','menantang',table(word('MATEMATIKAWAN'),'Huruf')),
 make('e3',0,scores2,'Tuliskan nilai terkecil, nilai terbesar, lalu jangkauan data.',[num('Nilai terkecil',4),num('Nilai terbesar',10),num('Jangkauan',6)],'209 soal3b,d,e'),
 make('e4',1,balls,'Hitung gambar, lalu lengkapi tabel banyak benda.',[],'210 soal5','menantang',table(balls,'Benda',false)),
 make('e5',0,story,'Tuliskan anak yang membutuhkan buku terbanyak dan semua anak yang membutuhkan 9 buku.',[set('Terbanyak',extreme(story,true)),set('Membutuhkan 9 buku',equal(story,9))],'209 soal4a,b'),
 make('e6',1,letters,'Hitung banyak huruf a, b dan c pada daftar.',[num('Banyak a',5),num('Banyak b',6),num('Banyak c',9)],'210 soal6a–c'),
 make('e7',0,balls,'Urutkan semua nama benda dari jumlah paling sedikit.',[ordered(balls,'Urutan benda')],'210 soal5e','menantang'),
 make('e8',1,scores2,'Buat tabel turus dan banyak siswa untuk setiap nilai.',[],'209 soal3c','sangat menantang',table(scores2,'Nilai')),
 make('e9',0,marbles,'Tuliskan semua nama yang memiliki kelereng sama banyak (9). Siapa pemilik kelereng paling sedikit?',[set('Memiliki 9 kelereng',equal(marbles,9)),set('Paling sedikit',extreme(marbles,false))],'208 soal1b,c','menantang'),
 make('e10',1,word('MATEMATIKAWAN'),'Tuliskan huruf terbanyak, semua huruf paling sedikit, dan semua huruf yang muncul 2 kali.',[set('Huruf terbanyak',extreme(word('MATEMATIKAWAN'),true)),set('Huruf paling sedikit',extreme(word('MATEMATIKAWAN'),false)),set('Muncul 2 kali',equal(word('MATEMATIKAWAN'),2))],'208 soal2b–d','menantang'),
 make('e11',0,scores2,'Urutkan seluruh 30 nilai ulangan dari terkecil. Jangan hilangkan nilai yang berulang.',[sortedValues(scores2)],'209 soal3a','sangat menantang'),
 make('e12',1,letters,'Jika x mewakili pensil dan y mewakili buku, tuliskan banyak masing-masing dan jumlah keduanya.',[num('Pensil',5),num('Buku',5),num('Jumlah keduanya',10)],'211 soal6d'),
 make('e13',0,marbles,'Berapa jumlah semua kelereng? Berapa selisih jumlah terbanyak dengan paling sedikit?',[num('Jumlah seluruhnya',30),num('Selisih',7)],'208 soal1d;199 jangkauan','menantang'),
 make('e14',1,story,'Sajikan kebutuhan buku tiap anak dalam tabel. Gunakan informasi kelas pada cerita.',[],'209 soal4c','sedang',table(story,'Nama',false)),
 make('e15',0,word('PERPUSTAKAAN'),'Urutkan semua huruf yang berbeda dari frekuensi paling sedikit. Huruf dengan jumlah sama boleh bertukar posisi.',[ordered(word('PERPUSTAKAAN'),'Urutan huruf')],'208 soal2a','menantang'),
 make('e16',1,scores2,'Berapa siswa mendapat nilai 6? Berapa siswa mendapat nilai tertinggi?',[num('Mendapat nilai 6',5),num('Mendapat nilai tertinggi',3)],'209 soal3d,g'),
 make('e17',0,objects2,'Tuliskan semua benda paling sedikit dan semua benda paling banyak. Hitung selisih jumlahnya.',[set('Paling sedikit',extreme(objects2,false)),set('Paling banyak',extreme(objects2,true)),num('Selisih',3)],'210 soal5;199 jangkauan','menantang'),
 make('e18',1,letters,'Sajikan seluruh data huruf dalam tabel turus dan frekuensi.',[],'211 soal6e','sangat menantang',table(letters,'Huruf')),
 make('e19',0,family,'Urutkan nama dari anggota keluarga paling banyak. Tuliskan jangkauannya.',[ordered(family,'Urutan nama',true),num('Jangkauan',4)],'199 aktivitas1','sangat menantang'),
 make('e20',1,scores2,'Hitung siswa dengan nilai lebih dari 6 dan siswa dengan nilai kurang dari 6. Nilai 6 tidak termasuk keduanya.',[num('Lebih dari 6',22),num('Kurang dari 6',3)],'209 soal3h,i','menantang'),
 make('e21',0,balls,'Tuliskan jumlah bola, jumlah pensil, dan semua benda lain (selain bola) dengan jumlah sama seperti bola.',[num('Bola',3),num('Pensil',4),set('Sama seperti bola', ['Penghapus'])],'210 soal5b–d','sedang'),
 make('e22',1,word('KESEHATAN'),'Buat tabel turus dan banyak huruf, lalu urutkan huruf dari frekuensi terbesar.',[ordered(word('KESEHATAN'),'Urutan huruf',true)],'206–208','sangat menantang',table(word('KESEHATAN'),'Huruf')),
 make('e23',0,scores1,'Urutkan seluruh 20 nilai dari terkecil. Berapa siswa mendapat nilai lebih dari 7?',[sortedValues(scores1),num('Lebih dari 7',11)],'207 latihan2','sangat menantang'),
 make('e24',1,raw([4,2,5,3,4,6,2,4,5,4],'Banyak manik merah dalam sepuluh pengambilan, dikembalikan setiap percobaan'),'Sajikan hasil dalam tabel. Berapa percobaan menghasilkan lebih dari 3 manik merah?',[num('Lebih dari 3 manik',7)],'204–205','sangat menantang',table(raw([4,2,5,3,4,6,2,4,5,4]),'Manik merah')),
];
export const parse=(answer:string|undefined):string[]=>{try{const a=JSON.parse(answer??'[]');return Array.isArray(a)?a.map(String):[];}catch{return [];}};
const tokens=(s:string)=>s.trim().toLocaleLowerCase('id').split(/[\s,;|→]+/).filter(Boolean);
export const ready=(q:DQuestion,a:string)=>{const v=parse(a);return q.fields.every((f,i)=>Boolean(v[i]?.trim())&&(f.type!=='order'||tokens(v[i]).length===Object.keys(f.counts??{}).length)&&(f.type!=='text'||tokens(v[i]).length===tokens(f.value).length));};
export function correct(q:DQuestion,a:string|undefined){if(!ready(q,a??''))return false;const v=parse(a);return q.fields.every((f,i)=>{
 if(f.type==='number')return /^\d+$/.test(v[i])&&Number(v[i])===Number(f.value);
 const given=tokens(v[i]),expected=tokens(f.value);
 if(f.type==='names')return given.slice().sort().join('|')===expected.slice().sort().join('|');
 if(f.type==='order'){if(given.slice().sort().join('|')!==expected.slice().sort().join('|'))return false;const counts=Object.fromEntries(Object.entries(f.counts??{}).map(([k,n])=>[k.toLowerCase(),n]));return given.every((x,j)=>j===0||(f.direction==='desc'?counts[given[j-1]]>=counts[x]:counts[given[j-1]]<=counts[x]));}
 return given.join('|')===expected.join('|');
 });}
export const formatAnswer=(q:DQuestion,a:string)=>parse(a).map((v,i)=>`${q.fields[i]?.label??''}: ${v}`).join('; ');
