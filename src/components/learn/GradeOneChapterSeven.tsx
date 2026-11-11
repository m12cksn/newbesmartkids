"use client";
import {useState} from "react";
import {ObjectArt,type ArtName} from "@/components/illustrations/ObjectArt";
type Item={name:string;length:number;art?:ArtName};
type Task={id:string;title:string;kind:"compare"|"order"|"height"|"measure"|"grid"|"method"|"story";items:Item[];questions:{label:string;answer:string;options:string[];why:string}[];unit?:string};
const item=(name:string,length:number,art?:ArtName):Item=>({name,length,art});
const practiceA:Task[]=[
{id:"a1",title:"Pilih benda yang lebih panjang",kind:"compare",items:[item("Krayon ungu",5),item("Pensil biru",9)],questions:[{label:"Benda yang lebih panjang",answer:"Pensil biru",options:["Krayon ungu","Pensil biru"],why:"Bandingkan kedua benda dari titik awal yang sama. Pensil biru mencapai titik yang lebih jauh."}]},
{id:"a2",title:"Bandingkan tinggi tanaman",kind:"order",items:[item("Tanaman A",6),item("Tanaman B",9),item("Tanaman C",4),item("Tanaman D",7)],questions:[{label:"Tanaman tertinggi",answer:"Tanaman B",options:["Tanaman A","Tanaman B","Tanaman C","Tanaman D"],why:"Tanaman B mencapai garis paling tinggi."},{label:"Tanaman terpendek",answer:"Tanaman C",options:["Tanaman A","Tanaman B","Tanaman C","Tanaman D"],why:"Tanaman C mencapai garis paling rendah."},{label:"Urutan dari tertinggi",answer:"B, D, A, C",options:["B, D, A, C","B, A, D, C","C, A, D, B"],why:"Bandingkan tinggi: 9, 7, 6, lalu 4."}]},
{id:"a3",title:"Bandingkan posisi burung terbang",kind:"story",items:[item("Burung A",5,"bird"),item("Burung B",8,"parrot"),item("Burung C",3,"dove")],questions:[{label:"Burung paling tinggi",answer:"Burung B",options:["Burung A","Burung B","Burung C"],why:"Burung B berada pada posisi paling tinggi."},{label:"Burung paling rendah",answer:"Burung C",options:["Burung A","Burung B","Burung C"],why:"Burung C berada pada posisi paling rendah."},{label:"Urutan dari tertinggi",answer:"B, A, C",options:["B, A, C","A, B, C","C, A, B"],why:"Urutkan posisi dari paling atas ke paling bawah."}]}
];
const practiceB:Task[]=[
{id:"b1",title:"Ukur benda dengan penjepit kertas",kind:"measure",unit:"penjepit kertas",items:[item("Spidol",7),item("Sisir",9),item("Gunting",6)],questions:[{label:"Panjang spidol",answer:"7",options:["6","7","8","9"],why:"Hitung 7 penjepit dari ujung kiri sampai kanan."},{label:"Panjang sisir",answer:"9",options:["7","8","9","10"],why:"Ada 9 satuan penjepit kertas."},{label:"Panjang gunting",answer:"6",options:["5","6","7","8"],why:"Ada 6 penjepit kertas tanpa celah."}]},
{id:"b2",title:"Bandingkan tinggi hewan memakai kotak",kind:"height",unit:"kotak",items:[item("Kelinci",5),item("Kucing",7),item("Jerapah",10)],questions:[{label:"Tinggi kelinci",answer:"5",options:["4","5","6"],why:"Kelinci mencapai 5 kotak."},{label:"Tinggi jerapah",answer:"10",options:["8","9","10"],why:"Jerapah mencapai 10 kotak."},{label:"Hewan paling pendek",answer:"Kelinci",options:["Kelinci","Kucing","Jerapah"],why:"5 kotak adalah tinggi paling kecil."}]},
{id:"b3",title:"Ukur dua pita dengan satuan yang sama",kind:"measure",unit:"penjepit kertas",items:[item("Pita kuning",8),item("Pita biru",11)],questions:[{label:"Panjang pita kuning",answer:"8",options:["7","8","9"],why:"Pita kuning sepanjang 8 penjepit."},{label:"Panjang pita biru",answer:"11",options:["10","11","12"],why:"Pita biru sepanjang 11 penjepit."},{label:"Pita lebih panjang",answer:"Pita biru",options:["Pita kuning","Pita biru"],why:"11 lebih besar dari 8 dengan satuan yang sama."}]}
];
const evaluation:Task[]=[
{id:"e1",title:"1. Pilih benda yang lebih panjang",kind:"compare",items:[item("Penggaris hijau",11),item("Pensil merah",7)],questions:[{label:"Benda lebih panjang",answer:"Penggaris hijau",options:["Penggaris hijau","Pensil merah"],why:"Keduanya dimulai dari garis awal yang sama; penggaris lebih jauh."},{label:"Jika ujung kanan keduanya diratakan, benda mana yang ujung kirinya lebih ke kiri?",answer:"Penggaris hijau",options:["Pensil merah","Penggaris hijau","Keduanya sama"],why:"Jika ujung kanan sejajar, benda yang lebih panjang menjulur lebih jauh ke kiri."}]},
{id:"e2",title:"2. Pilih benda yang paling tinggi",kind:"order",items:[item("Menara A",7),item("Menara B",11),item("Menara C",5)],questions:[{label:"Benda tertinggi",answer:"Menara B",options:["Menara A","Menara B","Menara C"],why:"Menara B memiliki tinggi paling besar."},{label:"Menara mana yang lebih tinggi dari C tetapi lebih pendek dari B?",answer:"Menara A",options:["Menara C","Menara B","Menara A"],why:"Puncak Menara A berada di antara puncak Menara C dan B."}]},
{id:"e3",title:"3. Bandingkan dan urutkan pohon",kind:"order",items:[item("Pohon A",9),item("Pohon B",6),item("Pohon C",12)],questions:[{label:"Pohon tertinggi",answer:"Pohon C",options:["Pohon A","Pohon B","Pohon C"],why:"Pohon C tingginya 12 kotak."},{label:"Pohon terpendek",answer:"Pohon B",options:["Pohon A","Pohon B","Pohon C"],why:"Pohon B hanya 6 kotak."},{label:"Urutan dari tertinggi",answer:"C, A, B",options:["C, A, B","A, C, B","B, A, C"],why:"12 lebih besar dari 9, lalu 6."}]},
{id:"e4",title:"4. Ceritakan posisi hewan",kind:"story",items:[item("Kupu-kupu A",8,"butterfly"),item("Kupu-kupu B",4,"butterfly"),item("Kupu-kupu C",8,"butterfly"),item("Kupu-kupu D",2,"butterfly")],questions:[{label:"Siapa yang sama tinggi?",answer:"A dan C",options:["A dan B","A dan C","B dan D"],why:"A dan C berada pada ketinggian yang sama."},{label:"Siapa yang paling rendah?",answer:"D",options:["A","B","C","D"],why:"D berada paling dekat tanah."},{label:"A dibanding B",answer:"Lebih tinggi",options:["Lebih tinggi","Lebih rendah","Sama tinggi"],why:"Posisi A lebih tinggi daripada B."},{label:"Jika C terbang turun hingga sejajar dengan B, siapa yang sekarang paling tinggi?",answer:"A",options:["D","A","C","B"],why:"C turun ke posisi B. A tetap di posisi semula dan menjadi yang tertinggi."}]},
{id:"e5",title:"5. Ukur panjang benda",kind:"measure",unit:"penjepit kertas",items:[item("Jam tangan",8),item("Pensil",12),item("Sendok",10)],questions:[{label:"Panjang jam tangan",answer:"8",options:["7","8","9"],why:"Jam tangan = 8 penjepit."},{label:"Panjang pensil",answer:"12",options:["10","11","12"],why:"Pensil = 12 penjepit."},{label:"Panjang sendok",answer:"10",options:["9","10","11"],why:"Sendok = 10 penjepit."},{label:"Ada 9 penjepit. Benda mana yang bisa diukur sampai ujung tanpa menambah penjepit?",answer:"Jam tangan",options:["Pensil","Jam tangan","Sendok"],why:"Jam tangan perlu 8 penjepit. Sendok perlu 10 dan pensil perlu 12."}]},
{id:"e6",title:"6. Pita pada petak kotak",kind:"grid",unit:"kotak",items:[item("Pita A",9),item("Pita B",7),item("Pita C",5)],questions:[{label:"Panjang pita A",answer:"9",options:["7","8","9"],why:"Pita A melintasi 9 petak."},{label:"Panjang pita B",answer:"7",options:["6","7","8"],why:"Pita B melintasi 7 petak."},{label:"Panjang pita C",answer:"5",options:["4","5","6"],why:"Pita C melintasi 5 petak."},{label:"A lebih panjang dari B sebanyak",answer:"2",options:["1","2","3"],why:"9 − 7 = 2 kotak."},{label:"B lebih panjang dari C sebanyak",answer:"2",options:["1","2","3"],why:"7 − 5 = 2 kotak."},{label:"Urutan pita terpanjang",answer:"A, B, C",options:["A, B, C","B, A, C","C, B, A"],why:"9, 7, kemudian 5."}]},
{id:"e7",title:"7. Periksa cara mengukur",kind:"method",items:[item("Kotak pensil",10)],questions:[{label:"Bolehkah mengukur dengan satuan berbeda-beda dan ada celah?",answer:"Tidak",options:["Ya","Tidak"],why:"Satuan harus sejenis, berderet lurus, dan tanpa celah atau tumpang tindih."},{label:"Saran terbaik untuk mengukur",answer:"Gunakan satuan sama tanpa celah",options:["Campur ukuran satuan","Gunakan satuan sama tanpa celah","Tumpuk alat ukur"],why:"Mulai dari ujung benda, rapatkan alat ukur, dan gunakan satuan yang sama."},{label:"Setelah celah ditutup, barisan alat ukur belum sampai ujung kotak. Apa langkah berikutnya?",answer:"Tambahkan satuan yang sama",options:["Regangkan barisan","Gunakan satuan lebih besar","Tambahkan satuan yang sama"],why:"Teruskan barisan dengan satuan yang sama hingga mencapai ujung kotak."}]}
];
function ObjectDrawing({ item }: { item: Item }) {
  const { name } = item;
  let drawing;
  if (name.startsWith("Pensil") || name.startsWith("Krayon") || name === "Spidol") {
    const color = name.includes("biru") ? "#2563eb" : name.includes("ungu") ? "#9333ea" : name.includes("merah") ? "#dc2626" : "#047857";
    drawing = <><path d="M0 7H85L100 20 85 33H0Z" fill={color}/><path d="M85 7L100 20 85 33Z" fill={name.startsWith("Pensil") ? "#f5c88d" : color}/><path d="M94 15L100 20 94 25Z" fill="#202635"/><path d="M12 8V32" stroke="white" strokeWidth="3"/></>;
  } else if (name.startsWith("Penggaris")) {
    drawing = <><rect y="8" width="100" height="24" rx="3" fill="#16a34a"/>{[10,20,30,40,50,60,70,80,90].map(x => <path key={x} d={`M${x} 9v10`} stroke="white" strokeWidth="2"/>)}</>;
  } else if (name.startsWith("Pita")) {
    const color = name.includes("kuning") || name === "Pita B" ? "#ca8a04" : name === "Pita C" ? "#db2777" : "#2563eb";
    drawing = <path d="M0 8C32 0 68 16 100 8V30C68 38 32 22 0 30Z" fill={color}/>;
  } else if (name === "Sisir") {
    drawing = <><rect y="5" width="100" height="12" rx="4" fill="#7e22ce"/>{Array.from({ length: 13 }, (_, i) => <rect key={i} x={i * 8} y="14" width="4" height="20" rx="2" fill="#7e22ce"/>)}</>;
  } else if (name === "Gunting") {
    drawing = <><path d="M24 13L100 8 36 24 100 32 24 27Z" fill="#64748b"/><circle cx="12" cy="11" r="9" fill="none" stroke="#be123c" strokeWidth="6"/><circle cx="12" cy="29" r="9" fill="none" stroke="#be123c" strokeWidth="6"/></>;
  } else if (name === "Jam tangan") {
    drawing = <><rect y="13" width="100" height="14" rx="6" fill="#7c3aed"/><circle cx="50" cy="20" r="19" fill="#334155"/><circle cx="50" cy="20" r="15" fill="#f8fafc"/><path d="M50 10V20L58 24" fill="none" stroke="#334155" strokeWidth="2"/></>;
  } else if (name === "Sendok") {
    drawing = <><rect y="16" width="78" height="8" rx="4" fill="#64748b"/><ellipse cx="76" cy="20" rx="24" ry="16" fill="#94a3b8"/></>;
  } else if (name === "Kotak pensil") {
    drawing = <><rect y="5" width="100" height="30" rx="8" fill="#0284c7"/><path d="M6 15H94" stroke="white" strokeWidth="3"/><rect x="80" y="15" width="8" height="8" fill="#fbbf24"/></>;
  } else {
    return null;
  }
  return <svg aria-hidden="true" className="block h-8 w-full" viewBox="0 0 100 40" preserveAspectRatio="none">{drawing}</svg>;
}

function Scene({ task, lesson = false }: { task: Task; lesson?: boolean }) {
  const [show, setShow] = useState(false);
  const vertical = ["order", "height", "story"].includes(task.kind);
  const measuring = ["measure", "grid", "height"].includes(task.kind);

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-slate-900 sm:p-5">
      <p className="mb-3 text-sm font-semibold">
        {task.kind === "story" ? "Bandingkan posisi hewan dari garis tanah." : vertical ? "Bandingkan dari garis dasar yang sama." : "Bandingkan dari garis awal yang sama."}
      </p>
      <div className={vertical ? "flex gap-2" : "space-y-3 border-l-2 border-emerald-700 pl-1"}>
        {task.items.map(item => (
          <div key={item.name} className={vertical ? "min-w-0 flex-1 text-center" : ""}>
            {vertical ? (
              <div className="flex h-48 items-end justify-center border-b-2 border-emerald-700">
                <div className="relative flex w-full items-end justify-center" style={{ height: item.length * 13 }}>
                  {task.kind === "story" ? (
                    item.art ? <ObjectArt name={item.art} className="absolute left-1/2 top-0 size-12 -translate-x-1/2 -translate-y-1/2" /> : null
                  ) : task.kind === "height" ? (
                    <svg aria-hidden="true" className="h-full w-9 max-w-full" viewBox="0 0 32 32" preserveAspectRatio="none">
                      {item.name === "Jerapah" ? (
                        <><path d="M4 0H22L30 4V9H19L17 21H29V32H25V25H15V32H11V25H8L10 8H4Z" fill="#d99024"/><path d="M12 13H16V17H12Z M21 21H25V24H21Z" fill="#854d0e"/><circle cx="20" cy="4" r="1" fill="#202635"/></>
                      ) : (
                        <><path d={item.name === "Kelinci" ? "M5 16V3Q5 0 8 0Q11 0 11 3V12H14V3Q14 0 17 0Q20 0 20 3V18Z" : "M4 15V0L12 6H18L25 0V17Z"} fill="#64748b"/><ellipse cx="17" cy="23" rx="13" ry="9" fill="#64748b"/><circle cx="12" cy="13" r="1.5" fill="white"/><circle cx="19" cy="13" r="1.5" fill="white"/><circle cx="29" cy="22" r="3" fill="#64748b"/></>
                      )}
                    </svg>
                  ) : item.name.startsWith("Menara") ? (
                    <svg aria-hidden="true" className="h-full w-9 max-w-full" viewBox="0 0 32 32" preserveAspectRatio="none">
                      <path d="M0 0H7V4H12V0H20V4H25V0H32V9H27V32H5V9H0Z" fill="#a16207"/>
                      <path d="M13 13H19V20H13Z M12 25H20V32H12Z" fill="#fef3c7"/>
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="h-full w-9 max-w-full" viewBox="0 0 32 32" preserveAspectRatio="none">
                      <path d="M13 14H19V32H13Z" fill="#854d0e"/>
                      <path d="M16 0Q22 0 24 6Q32 9 32 16Q32 25 16 24Q0 25 0 16Q0 9 8 6Q10 0 16 0Z" fill="#15803d"/>
                    </svg>
                  )}
                  {(show || measuring) && <div aria-hidden="true" className="absolute inset-y-0 right-0 flex w-3 flex-col">{Array.from({ length: item.length }, (_, i) => <span key={i} className="flex-1 border border-sky-600 bg-sky-100"/>)}</div>}
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold">{item.name}</p>
                <div style={{ width: `${item.length / 12 * 100}%` }}>
                  <ObjectDrawing item={item}/>
                  {(show || measuring) && (
                    <div aria-hidden="true" className="flex">
                      {Array.from({ length: item.length }, (_, i) => task.unit === "penjepit kertas" ? (
                        <svg key={i} className="h-3 min-w-0 flex-1" viewBox="0 0 24 12" preserveAspectRatio="none"><path d="M23 4H5a4 4 0 0 0 0 8h14a3 3 0 0 0 0-6H6" transform="translate(0 -2)" fill="none" stroke="#0369a1" strokeWidth="2"/></svg>
                      ) : <span key={i} className="h-4 min-w-0 flex-1 border border-sky-600 bg-sky-100"/>)}
                    </div>
                  )}
                </div>
              </>
            )}
            {vertical && <p className="mt-2 text-xs font-bold sm:text-sm">{item.name}</p>}
            {lesson && show && <span className="text-xs">{item.length} {task.unit ?? "satuan"}</span>}
          </div>
        ))}
      </div>
      {task.kind === "method" && (
        <div className="mt-3">
          <div aria-hidden="true" className="mb-2 flex gap-3"><span className="h-4 w-7 rounded-full border-2 border-rose-600"/><span className="h-4 w-12 rounded-full border-2 border-rose-600"/><span className="h-4 w-5 rounded-full border-2 border-rose-600"/></div>
          <p className="text-sm font-semibold text-rose-800">Contoh keliru: ukuran alat ukur berbeda dan ada celah.</p>
        </div>
      )}
      {(lesson || (!measuring && task.kind !== "method")) && (
        <button type="button" aria-pressed={show} className="btn btn-outline btn-success btn-sm mt-4" onClick={() => setShow(value => !value)}>
          {show ? "Sembunyikan" : "Tampilkan"} satuan bantu
        </button>
      )}
    </div>
  );
}
function Quiz({ tasks, title, evaluation = false, onBack }: {
  tasks: Task[];
  title: string;
  evaluation?: boolean;
  onBack: () => void;
}) {
  const questions = tasks.flatMap(task => task.questions.map(question => ({ task, question })));
  const [answers, setAnswers] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const current = questions[answers.length];
  const total = questions.length;
  const right = answers.filter((value, i) => value === questions[i].question.answer).length;
  const wrong = answers.length - right;

  function advance() {
    if (answer === null) return;
    setAnswers(previous => [...previous, answer]);
    setAnswer(null);
    setChecked(false);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-success">{title} · Soal {Math.min(answers.length + 1, total)}/{total}</p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>Tutup</button>
      </div>
      <progress aria-label="Soal yang sudah dijawab" className="progress progress-success w-full" value={answers.length} max={total}/>
      {current ? (
        <>
          <h3 className="text-lg font-extrabold">{current.task.title}</h3>
          <Scene key={answers.length} task={current.task}/>
          <p className="font-semibold">{current.question.label}</p>
          <div className="grid grid-cols-2 gap-2">
            {current.question.options.map(option => (
              <button key={option} type="button" disabled={checked} aria-pressed={answer === option} onClick={() => setAnswer(option)}
                className={`min-h-12 rounded-xl border-2 p-2 text-sm font-bold [overflow-wrap:anywhere] ${answer === option ? "border-success bg-success/10" : "border-base-300"}`}>
                {option}
              </button>
            ))}
          </div>
          {checked && (
            <div role="status" className="rounded-xl bg-base-200 p-3 text-sm">
              <strong>{answer === current.question.answer ? "Tepat!" : "Belum tepat."}</strong> {current.question.why}
            </div>
          )}
          {(!evaluation || answer !== null) && (
            <button type="button" className="btn btn-success w-full" disabled={answer === null}
              onClick={() => evaluation || checked ? advance() : setChecked(true)}>
              {!evaluation && !checked ? "Periksa jawaban" : answers.length + 1 === total ? "Selesaikan dan lihat hasil" : "Lanjutkan soal →"}
            </button>
          )}
        </>
      ) : (
        <div className="space-y-4 py-4">
          <div role="status" className="space-y-3 text-center">
            <h2 className="text-2xl font-extrabold">{evaluation ? "Hasil Evaluasi Bab 7" : "Latihan selesai!"}</h2>
            <p className="font-semibold">Benar {right} · Salah {wrong}</p>
            <p className="text-3xl font-extrabold text-success">Skor {Math.round(right / total * 100)} dari 100</p>
          </div>
          {wrong > 0 && (
            <details className="rounded-lg bg-base-200 p-3">
              <summary className="cursor-pointer font-bold">Bahas jawaban yang salah</summary>
              <ol className="mt-3 space-y-3">
                {questions.map(({ question }, i) => answers[i] !== question.answer && (
                  <li key={i} className="text-sm">
                    <strong>Soal {i + 1}. {question.label}</strong>
                    <p>Jawabanmu: {answers[i]} · Jawaban benar: {question.answer}</p>
                    <p>{question.why}</p>
                  </li>
                ))}
              </ol>
            </details>
          )}
          <button type="button" className="btn btn-success w-full" onClick={onBack}>Kembali ke materi</button>
        </div>
      )}
    </div>
  );
}

export default function GradeOneChapterSeven(){const [tab,setTab]=useState<"A"|"B">("A");const [mode,setMode]=useState<"learn"|"practice"|"evaluation">("learn");const tasks=tab==="A"?practiceA:practiceB;const lesson=tab==="A"?{title:"Membandingkan dan Mengurutkan Panjang Benda",body:"Letakkan benda pada garis awal yang sama. Benda yang ujungnya lebih jauh berarti lebih panjang. Untuk tinggi, bandingkan dari dasar yang sama. Urutkan dari terpendek atau tertinggi dengan mengamati satu per satu."}:{title:"Mengukur Panjang Benda",body:"Gunakan satuan tidak baku seperti penjepit kertas, jengkal, atau kotak. Susun satuan sejenis dari ujung benda tanpa celah dan tanpa bertumpuk. Jika satuannya berbeda, hasil hitungannya tidak boleh langsung dibandingkan."};const close=()=>setMode("learn");return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 1 / Bab 7</p><h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Mengukur Panjang Benda</h1><p className="mt-3 text-base-content/70">Belajar membandingkan, mengurutkan, dan mengukur panjang benda melalui pengamatan serta latihan interaktif.</p><div className="mt-7 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2"><div className="flex min-h-44 flex-col items-center justify-center bg-base-200 p-7 text-center"><span className="text-5xl text-success">▶</span><p className="mt-3 font-bold">Video pembelajaran segera hadir</p></div><div className="flex flex-col justify-center p-7"><h2 className="text-xl font-bold">Amati, bandingkan, lalu ukur</h2><p className="mt-2 text-sm leading-7 text-base-content/70">Dua submateri dengan latihan satu soal per layar, dilanjutkan evaluasi Bab 7.</p><a href="#materi-bab-7" className="btn btn-success mt-4 self-start">Mulai belajar</a></div></div><div id="materi-bab-7" className="mt-8"><div className="mb-5 flex flex-wrap gap-2 pb-2">{(["A","B"] as const).map(id=><button key={id} className={`btn btn-sm max-w-full ${tab===id?"btn-success":"btn-outline"}`} onClick={()=>{setTab(id);close()}}>{id}. {id==="A"?"Membandingkan dan Mengurutkan":"Mengukur Panjang"}</button>)}</div>{mode!=="learn"?<Quiz key={`${tab}-${mode}`} tasks={mode==="evaluation"?evaluation:tasks} title={mode==="evaluation"?"Evaluasi Bab 7":`Latihan Materi ${tab}`} evaluation={mode==="evaluation"} onBack={close}/>:<><div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2"><div className="bg-success/5 p-5"><Scene key={tab} task={tasks[0]} lesson/></div><div className="flex flex-col justify-center p-6"><p className="text-xs font-bold uppercase tracking-widest text-success">Materi {tab}</p><h2 className="mt-3 text-2xl font-extrabold">{lesson.title}</h2><p className="mt-4 leading-8 text-base-content/70">{lesson.body}</p><p className="mt-3 text-sm font-semibold">Tip: Gunakan tombol satuan bantu untuk memeriksa proses pengamatan.</p></div></div><div className="mt-5 flex flex-wrap justify-between gap-3"><button className="btn btn-outline" disabled={tab==="A"} onClick={()=>setTab("A")}>← Materi sebelumnya</button><div className="flex flex-wrap gap-2"><button className="btn btn-success" onClick={()=>setMode("practice")}>Latihan Materi {tab} · {tasks.reduce((total,task)=>total+task.questions.length,0)} soal →</button><button className="btn btn-outline btn-success" disabled={tab==="A"} onClick={()=>setMode("evaluation")}>Evaluasi Bab 7 →</button><button className="btn btn-outline" disabled={tab==="B"} onClick={()=>setTab("B")}>Materi B →</button></div></div></>}</div></section>}
