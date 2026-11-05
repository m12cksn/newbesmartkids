"use client";

import { useEffect, useRef, useState } from "react";
import { balls, diagramAssessment, diagramPractice, type Datum, type DiagramQuestion } from "@/data/grade-one-diagrams";

const topics = [
  { id: "daftar", title: "Daftar", group: "A. Mengelompokkan Data",
    explanation: "Pisahkan benda menurut jenis atau warna. Hitung setiap kelompok, lalu tulis nama kelompok dan jumlahnya dalam daftar.",
    steps: ["Pilih aturan pengelompokan. Bola bisa dipisah menurut warna, buah menurut jenis.", "Hitung tiap benda satu kali. Catat nama kelompok dan jumlahnya, misalnya: Ada 7 bola merah.", "Bandingkan jumlahnya. Angka terbesar berarti paling banyak. Jika dua angkanya sama, kedua kelompok sama banyak."],
    example: "Coba kelompokkan bola di samping. Setelah selesai, warna mana yang paling banyak? Adakah dua warna dengan jumlah sama?" },
  { id: "tabel", title: "Tabel", group: "A. Mengelompokkan Data",
    explanation: "Tabel terdiri dari baris dan kolom. Cari nama kelompok, lalu baca jumlah pada baris atau kolom yang sama.",
    steps: ["Judul memberi tahu data apa yang ditampilkan. Baris dibaca mendatar, sedangkan kolom dibaca dari atas ke bawah.", "Pada tabel menurun, cari warna di sebelah kiri lalu baca angka di sebelah kanannya. Pada tabel mendatar, cari warna di atas lalu baca angka di bawahnya.", "Untuk mencari selisih, kurangi jumlah besar dengan jumlah kecil. Untuk mencari total, jumlahkan setiap kelompok satu kali."],
    example: "Bola merah ada 7 dan kuning ada 4. Merah lebih banyak 3. Ganti posisi tabel dan temukan kembali kedua angka itu." },
  { id: "diagram", title: "Diagram Gambar", group: "B. Diagram Gambar",
    explanation: "Lihat arti satu tanda pada legenda. Jika satu tanda mewakili satu benda, hitung tanda untuk mengetahui jumlahnya.",
    steps: ["Baca judul dan legenda. Satu bintang bisa berarti satu anak, sedangkan satu lingkaran bisa berarti satu benda.", "Untuk membaca diagram, temukan kelompoknya lalu hitung tanda. Jika jumlahnya yang diketahui, cari baris dengan jumlah tanda tersebut.", "Untuk membuat diagram, tulis nama setiap kelompok. Mulai dari tepi yang sama dan isi satu tanda untuk setiap benda. Bandingkan baris atau jumlahkan tanda jika ditanya total."],
    example: "Ada 4 bebek. Isi 4 tanda. Jika datang 1 bebek lagi, tambahkan 1 tanda. Berapa tanda sekarang?" },
] as const;

function Symbol({ row }: { row: Datum }) {
  if (row.icon === "pensil") {
    return <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
      <path d="m3 17 13-13 4 4L7 21 2 22z" fill="#e9bd88"/><path d="m3 17 13-13 4 4L7 21z" fill={row.color}/><path d="m2 22 1-4 3 3z" fill="#1e293b"/>
    </svg>;
  }
  if (row.icon === "belimbing" || row.icon === "jambu") {
    return <svg aria-hidden="true" className="size-6 shrink-0" viewBox="0 0 24 24">
      {row.icon === "belimbing"
        ? <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#facc15" stroke="#a16207"/>
        : <path d="M10 4c-2 2-2 6-6 12-2 6 16 6 16 0-4-6-4-10-6-12z" fill="#e11d48" stroke="#9f1239"/>}
    </svg>;
  }
  const illustrations = {
    "kaus-pendek": <path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c-2 3-6 3-8 0Z" fill="#ea580c" stroke="#9a3412"/>,
    "kaus-panjang": <path d="m8 3-5 3-2 14 4 1 3-11v12h8V10l3 11 4-1-2-14-5-3c-2 3-6 3-8 0Z" fill="#0891b2" stroke="#155e75"/>,
    celana: <path d="M5 3h14l1 19h-6l-2-11-2 11H4z" fill="#9333ea" stroke="#581c87"/>,
    tomat: <><circle cx="12" cy="14" r="8" fill="#dc2626"/><path d="m12 7 1-5 2 4 5 1-5 2-3 3-2-3-5-2z" fill="#15803d"/></>,
    brokoli: <><path d="m9 12 1 10h4l2-10" fill="#65a30d"/><path d="M5 15a4 4 0 0 1-1-7 4 4 0 0 1 6-4 4 4 0 0 1 7 1 5 5 0 0 1 2 9c-4 2-10 2-14 1Z" fill="#15803d"/></>,
    wortel: <><path d="m15 8 2-6m1 7 4-5M16 10l6-1" stroke="#15803d" strokeWidth="2"/><path d="M15 7q7 1 4 7L3 22q-2 0-1-2L10 8q2-2 5-1Z" fill="#ea580c"/><path d="m8 12 3 2m-6 2 2 2" stroke="#fdba74"/></>,
    jagung: <><ellipse cx="13" cy="10" rx="5" ry="8" fill="#facc15"/><path d="M11 5v9m4-9v9M8 8h10m-10 4h10" stroke="#ca8a04"/><path d="M12 22C6 19 4 14 5 9c3 4 6 4 8 8 1-4 5-5 7-9 1 6-2 11-8 14Z" fill="#15803d"/></>,
    jeruk: <><circle cx="12" cy="13" r="8" fill="#f97316" stroke="#c2410c"/><path d="M12 6q2-5 8-4-2 5-8 4Z" fill="#15803d"/></>,
    apel: <><path d="M12 7C6 2 1 9 5 17c2 5 5 5 7 4 3 1 5 1 7-4 4-8-1-15-7-10Z" fill="#dc2626"/><path d="m12 7 1-5m0 3q2-4 7-3-1 4-7 3Z" fill="#15803d" stroke="#15803d"/></>,
    mangga: <><path d="M5 7C10 2 17 3 20 8c4 8-5 15-11 13-3-1-4-3-3-6 2-4-5-4-1-8Z" fill="#f59e0b" stroke="#b45309"/><path d="M11 5q2-5 8-3-3 4-8 3Z" fill="#15803d"/></>,
  };
  if (row.icon && row.icon in illustrations) {
    return <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">{illustrations[row.icon as keyof typeof illustrations]}</svg>;
  }
  if (row.color) return <span aria-hidden="true" className="size-5 shrink-0 rounded-full border border-slate-800/20 shadow-inner" style={{ background: `radial-gradient(circle at 34% 28%, white -20%, ${row.color} 55%)` }}/>;
  return null;
}

function Table({ rows, sideways = false, renderCount = row => row.count }: { rows: Datum[]; sideways?: boolean; renderCount?: (row: Datum) => React.ReactNode }) {
  return <table className="table table-sm w-full bg-base-100">
    <caption className="sr-only">Tabel jumlah setiap kelompok</caption>
    {sideways ? <>
      <thead><tr><th scope="row">Warna</th>{rows.map(row => <th key={row.label} scope="col">{row.label}</th>)}</tr></thead>
      <tbody><tr><th scope="row">Jumlah</th>{rows.map(row => <td key={row.label}>{row.count}</td>)}</tr></tbody>
    </> : <>
      <thead><tr><th scope="col">Kelompok</th><th scope="col">Jumlah</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td>{renderCount(row)}</td></tr>)}</tbody>
    </>}
  </table>;
}

function DataRows({ rows, diagram = false }: { rows: Datum[]; diagram?: boolean }) {
  return <ul className="divide-y divide-base-300">
    {rows.map(row => <li key={row.label} className="grid grid-cols-[5.25rem_minmax(0,1fr)] items-center gap-2 py-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <span className="flex items-center gap-1 text-sm font-bold">{diagram && <Symbol row={row}/>} {row.label}</span>
      <span role="img" aria-label={`${row.count} tanda untuk ${row.label}`} className="flex flex-wrap items-center gap-1.5">
        {Array.from({ length: row.count }, (_, i) => diagram
          ? <span key={i} aria-hidden="true" className="text-xl leading-none text-amber-700">★</span>
          : <Symbol key={i} row={row}/>)}
      </span>
    </li>)}
  </ul>;
}

function Marks({ count, onChange, label, disabled = false }: {
  count: number; onChange: (count: number) => void; label: string; disabled?: boolean;
}) {
  return <div className="space-y-2">
    <div className="flex flex-wrap gap-1" aria-label={`Baris ${label}`}>
      {Array.from({ length: 7 }, (_, i) => <button key={i} type="button"
        aria-label={`${label}: tanda ${i + 1}`} aria-pressed={i < count} disabled={disabled}
        onClick={() => onChange(i + 1 === count ? i : i + 1)}
        className={`grid min-h-9 min-w-7 place-items-center rounded border text-lg sm:min-h-11 sm:min-w-11 ${i < count ? "border-success bg-success/15 text-success" : "border-base-300 bg-base-100 text-base-content/60"}`}>
        {i < count ? "●" : "○"}
      </button>)}
    </div>
    <p className="text-sm font-semibold" aria-live="polite">{count} tanda terisi</p>
  </div>;
}

function ColorMarks({ label, value = "", onChange, disabled }: {
  label: string; value?: string; onChange: (value: string) => void; disabled: boolean;
}) {
  return <div className="flex flex-wrap gap-1">
    {Array.from({ length: 9 }, (_, i) => {
      const mark = String(i + 1);
      const colored = value.includes(mark);
      return <button key={mark} type="button" aria-label={`${label}: tanda ${mark}`} aria-pressed={colored} disabled={disabled}
        className="grid size-8 place-items-center rounded border border-base-300 text-success aria-pressed:bg-success/20"
        onClick={() => onChange(colored ? value.replace(mark, "") : value + mark)}>{colored ? "●" : "○"}</button>;
    })}
  </div>;
}

function CountObjects({ rows }: { rows: Datum[] }) {
  const [marked, setMarked] = useState<string[]>([]);
  const objects = Array.from({ length: Math.max(...rows.map(row => row.count)) }, (_, index) =>
    [...rows.slice(index % rows.length), ...rows.slice(0, index % rows.length)]
      .filter(row => row.count > index).map(row => ({ row, id: `${row.label}-${index}` }))).flat();

  return <div className="mb-2">
    <p className="text-sm">Ketuk gambar untuk menandai benda yang sudah dihitung.</p>
    <div className="flex flex-wrap gap-1 py-2">
      {objects.map(({ row, id }, index) => <button key={id} type="button" aria-label={`${row.label}, gambar ${index + 1}`}
        aria-pressed={marked.includes(id)} className="grid size-9 place-items-center rounded border border-base-300 aria-pressed:bg-success/25"
        onClick={() => setMarked(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id])}>
        <Symbol row={row}/>
      </button>)}
    </div>
    {marked.length > 0 && <button type="button" className="btn btn-ghost btn-xs" onClick={() => setMarked([])}>Hapus tanda hitung</button>}
  </div>;
}

function LessonActivity({ topic }: { topic: typeof topics[number]["id"] }) {
  const [groups, setGroups] = useState([0, 0, 0]);
  const [message, setMessage] = useState("");
  const [sideways, setSideways] = useState(false);
  const [marks, setMarks] = useState(0);
  const next = [0, 1, 2, 0, 2, 1, 0][groups.reduce((sum, value) => sum + value, 0)];

  if (topic === "daftar") {
    return <div className="space-y-3">
      <p className="font-semibold">Masukkan bola ke kelompok warnanya.</p>
      {next === undefined ? <p>Semua bola sudah dikelompokkan.</p> : <>
        <p className="flex items-center gap-2"><Symbol row={balls[next]}/> Bola {balls[next].label.toLowerCase()}</p>
        <div className="flex flex-wrap gap-2">{balls.map((row, i) => <button key={row.label} className="btn btn-sm btn-outline" onClick={() => {
          if (i !== next) { setMessage("Coba pilih kelompok dengan warna yang sama."); return; }
          setGroups(previous => previous.map((value, index) => index === i ? value + 1 : value));
          setMessage("Bola masuk ke kelompok yang tepat.");
        }}>{row.label}</button>)}</div>
      </>}
      <ul className="rounded-lg bg-base-100 p-3">{balls.map((row, i) => <li key={row.label}>Ada {groups[i]} bola {row.label.toLowerCase()}.</li>)}</ul>
      <p role="status" className="text-sm">{message}</p>
      <button className="btn btn-sm btn-ghost" onClick={() => { setGroups([0, 0, 0]); setMessage(""); }}>Ulangi pengelompokan</button>
    </div>;
  }

  if (topic === "tabel") return <div className="space-y-3">
    <p className="font-semibold">Tabel Bola Upe</p>
    <div className="overflow-x-auto"><Table rows={balls} sideways={sideways}/></div>
    <button className="btn btn-sm btn-outline" onClick={() => setSideways(value => !value)}>{sideways ? "Lihat tabel menurun" : "Lihat tabel mendatar"}</button>
    <p className="text-sm">Letak data berubah. Jumlah bola setiap warna tetap sama.</p>
  </div>;

  return <div className="space-y-3">
    <p className="font-semibold">Ada 4 bebek. Buat baris bebek pada diagram.</p>
    <p className="text-sm">● mewakili 1 bebek. Sentuh tanda terakhir yang ingin kamu isi.</p>
    <p className="font-bold">Bebek</p>
    <Marks count={marks} onChange={setMarks} label="Bebek"/>
    {marks === 4 && <p role="status" className="font-bold text-success">Tepat! Empat tanda mewakili empat bebek.</p>}
  </div>;
}

function Quiz({ questions, title, practice, close }: {
  questions: DiagramQuestion[]; title: string; practice: boolean; close: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = questions[index];
  const answer = answers[index];
  const hasAnswer = Boolean(answer?.trim());
  const isCorrect = (item: DiagramQuestion, value?: string) =>
    item.worksheet === "marks" && item.target ? value?.length === Number(item.answer) :
    Boolean(value?.trim()) && (/^\d+$/.test(item.answer)
      ? Number(value) === Number(item.answer)
      : value!.trim().toLowerCase().replace(/\s+/g, " ") === item.answer.toLowerCase());
  const score = questions.filter((item, i) => isCorrect(item, answers[i])).length;
  const record = (value: string) => setAnswers(previous => ({ ...previous, [index]: value }));

  useEffect(() => { heading.current?.focus(); }, [index]);

  const numeric = question ? /^\d+$/.test(question.answer) : false;
  const input = (label: string) => <input aria-label={label} className={`input input-bordered ${numeric ? "w-20" : "w-full max-w-64"}`}
    inputMode={numeric ? "numeric" : "text"} maxLength={numeric ? 2 : 50} value={answer ?? ""} disabled={checked}
    onChange={event => record(numeric ? event.target.value.replace(/\D/g, "") : event.target.value)}/>;
  const saved = (row: Datum) => {
    const related = questions.findIndex(item => item.title === question.title && (item.cell ?? item.target) === row.label);
    return answers[related];
  };

  return <section className="mx-auto max-w-2xl space-y-3 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-6">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-bold text-success">{title}{question && ` · Soal ${index + 1}/${questions.length}`}</p>
      <button className="btn btn-ghost btn-sm" onClick={close}>Tutup</button>
    </div>
    <progress aria-label="Progres soal" className="progress progress-success w-full" value={index} max={questions.length}/>
    {question ? <>
      <h2 ref={heading} tabIndex={-1} className="text-lg font-extrabold">{question.prompt}</h2>
      <div className="rounded-xl bg-success/5 p-2 sm:p-4">
        <p className="mb-1 text-sm font-bold">{question.title}</p>
        {question.worksheet === "list" || question.worksheet === "table" ? <>
          <CountObjects key={question.title} rows={question.rows}/>
          {question.worksheet === "list" ? <ul className="space-y-1 rounded bg-base-100 p-2">
            {question.rows.map(row => <li key={row.label} className="flex items-center gap-2">
              Ada {question.cell === row.label ? input(`Jumlah ${row.label}`) : <strong>{saved(row) ?? "___"}</strong>} {row.label.toLowerCase()}.
            </li>)}
          </ul> : <Table rows={question.rows} renderCount={row => question.cell === row.label ? input(`Jumlah ${row.label}`) : saved(row) ?? "—"}/>}
        </> : question.worksheet === "marks" ? <>
          {question.clue ? <p className="text-sm">{question.clue}</p> : <CountObjects key={question.title} rows={question.rows}/>}
          <p className="my-2 text-sm">Satu tanda mewakili satu {question.unit}. Ketuk tanda untuk mewarnai atau menghapus warnanya.</p>
          {question.rows.map(row => <div key={row.label} className="border-t border-base-300 py-2">
            <p className="mb-1 font-bold">{row.label}</p>
            {row.label === question.target ? <ColorMarks key={row.label} label={row.label} value={answer} onChange={record} disabled={checked}/>
              : <span className="text-lg tracking-wider text-success" aria-label={`${(saved(row) ?? "").length} tanda terisi`}>
                {Array.from({length: 9}, (_, i) => saved(row)?.includes(String(i + 1)) ? "●" : "○").join(" ")}
              </span>}
          </div>)}
        </> : question.visual === "table" ? <div className="overflow-x-auto"><Table rows={question.rows} sideways={practice}/></div>
          : question.visual === "build" ? <>
            <p className="mb-2 text-sm">{question.clue ?? question.rows.map(row => `${row.count} ${row.label.toLowerCase()}`).join(" · ")}</p>
            <p className="mb-2 text-sm">● mewakili 1 {question.unit}. Sentuh tanda terakhir yang ingin kamu isi.</p>
            <p className="mb-1 font-bold">{question.target}</p>
            <Marks label={question.target!} count={Number(answer ?? 0)} onChange={value => record(String(value))} disabled={checked}/>
          </> : <>
            {question.visual === "diagram" && <p className="text-sm">★ mewakili 1 {question.unit}.</p>}
            <DataRows rows={question.rows} diagram={question.visual === "diagram"}/>

          </>}
      </div>
      {question.options ? <div className="grid grid-cols-2 gap-2">{question.options.map(option =>
        <button key={option} disabled={checked} aria-pressed={answer === option} onClick={() => record(option)}
          className={`btn h-auto min-h-11 whitespace-normal px-2 ${answer === option ? "btn-success" : "btn-outline"}`}>{option}</button>
      )}</div> : question.visual !== "build" && !question.cell && <label className="flex items-center gap-3 text-sm font-bold">Jawaban
        {input("Jawaban")}
      </label>}
      {practice && checked && <p role="status" className="rounded-lg bg-base-200 p-2 text-sm">
        <strong>{isCorrect(question, answer) ? "Tepat! " : "Belum tepat. "}</strong>{question.explanation}
      </p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {index > 0 && <button className="btn btn-sm btn-ghost" onClick={() => { setIndex(index - 1); setChecked(false); }}>← Sebelumnya</button>}
        {practice && !checked ? <button className="btn btn-success ms-auto" disabled={!hasAnswer} onClick={() => setChecked(true)}>Periksa jawaban</button>
          : hasAnswer && <button className="btn btn-success ms-auto" onClick={() => { setIndex(index + 1); setChecked(false); }}>
            {index + 1 === questions.length ? "Lihat hasil" : "Lanjut →"}
          </button>}
      </div>
    </> : <>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-extrabold">{practice ? "Latihan selesai!" : "Hasil Evaluasi Bab 8"}</h2>
      <p className="font-bold">Benar {score} · Salah {questions.length - score} · Skor {Math.round(score / questions.length * 100)}/100</p>
      {score < questions.length && <details className="rounded-lg bg-base-200 p-3">
        <summary className="cursor-pointer font-bold">Bahas jawaban yang salah</summary>
        <ol className="mt-2 space-y-3 text-sm">{questions.map((item, i) => !isCorrect(item, answers[i]) &&
          <li key={i}><strong>Soal {i + 1}. {item.prompt}</strong><p>Jawabanmu {item.worksheet === "marks" && item.target ? answers[i]?.length : answers[i]}. Jawaban benar {item.answer}.</p><p>{item.explanation}</p></li>)}</ol>
      </details>}
      <button className="btn btn-success" onClick={close}>Kembali ke materi</button>
    </>}
  </section>;
}

export default function GradeOneChapterEight() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"lesson" | "practice" | "assessment">("lesson");
  const topic = topics[index];
  const close = () => setMode("lesson");

  return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 1 / Bab 8</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Mengenal Diagram</h1>
    <p className="mt-3 text-base-content/70">Kelompokkan benda, catat jumlahnya, lalu baca dan buat diagram gambar.</p>
    <div className="mt-7 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-44 flex-col items-center justify-center bg-base-200 p-6 text-center">
        <span className="text-4xl text-success" aria-hidden="true">▶</span>
        <p className="mt-3 font-bold">Video pembelajaran segera hadir</p>
      </div>
      <div className="flex flex-col justify-center p-6">
        <h2 className="text-xl font-bold">Amati, kelompokkan, lalu sajikan</h2>
        <p className="mt-2 text-sm text-base-content/70">Belajar lewat daftar, tabel, dan diagram gambar. Akhiri dengan evaluasi 24 soal.</p>
        <a className="btn btn-success mt-4 self-start" href="#materi-bab-8">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bab-8" className="mt-8">
      <nav aria-label="Submateri Bab 8" className="mb-4 flex flex-wrap gap-2">
        {topics.map((item, i) => <button key={item.id} aria-current={index === i ? "step" : undefined}
          className={`btn btn-sm ${index === i ? "btn-success" : "btn-outline"}`}
          onClick={() => { setIndex(i); close(); }}>{item.title}</button>)}
      </nav>
      {mode === "lesson" ? <>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2">
          <div className="min-w-0 bg-success/5 p-4 sm:p-6"><LessonActivity key={topic.id} topic={topic.id}/></div>
          <div className="p-6"><p className="text-sm font-bold text-success">{topic.group}</p>
            <h2 className="mt-2 text-2xl font-extrabold">{topic.title}</h2>
            <p className="mt-3 leading-relaxed">{topic.explanation}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {topic.steps.map(step => <li key={step}>{step}</li>)}
            </ol>
            <p className="mt-4 rounded-lg bg-success/5 p-3 text-sm"><strong>Coba bersama. </strong>{topic.example}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Sebelumnya</button>
          <button className="btn btn-outline btn-success" onClick={() => setMode("practice")}>Latihan {topic.title} →</button>
          {index < topics.length - 1 ? <button className="btn btn-success" onClick={() => setIndex(index + 1)}>Materi berikutnya →</button>
            : <button className="btn btn-success" onClick={() => setMode("assessment")}>Evaluasi Bab 8 →</button>}
        </div>
      </> : <Quiz key={`${topic.id}-${mode}`} title={mode === "practice" ? `Latihan ${topic.title}` : "Evaluasi Bab 8"}
        practice={mode === "practice"} questions={mode === "practice" ? diagramPractice[topic.id] : diagramAssessment} close={close}/>}
    </div>
  </section>;
}
