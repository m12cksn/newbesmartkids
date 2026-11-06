"use client";

import { useEffect, useRef, useState } from "react";
import { assessment, number, practice, topics, type Question } from "@/data/grade-four-whole-numbers";

const places = ["Puluh ribu", "Ribuan", "Ratusan", "Puluhan", "Satuan"];
const digits = (value: number) => String(value).padStart(5, "0").split("").map(Number);

function PlaceTable({ value, other, selected, onSelect, missing }: {
  value: number; other?: number; selected?: number; onSelect?: (index: number) => void; missing?: number;
}) {
  return <table className="w-full table-fixed text-center text-xs sm:text-sm">
    <caption className="sr-only">Tabel nilai tempat</caption>
    <thead><tr>{places.map(label => <th scope="col" key={label} className="px-0 py-1 text-[10px] sm:p-1 sm:text-sm">{label}</th>)}</tr></thead>
    <tbody>{(other === undefined ? [value] : [value, other]).map((n, row) => <tr key={row}>
      {digits(n).map((digit, i) => <td key={i} className={`border border-base-300 p-1 font-bold ${selected === i ? "bg-warning/25" : "bg-base-100"}`}>
        {onSelect ? <button type="button" aria-label={`${places[i]} ${row === 0 ? "atas" : "bawah"}: ${digit}`}
          aria-pressed={selected === i} className="min-h-9 w-full" onClick={() => onSelect(i)}>{digit}</button> : missing === i ? "?" : digit}
      </td>)}
    </tr>)}</tbody>
  </table>;
}

function PlaceLab({ topic, onExampleChange }: {
  topic: number;
  onExampleChange: (value: number, position: number) => void;
}) {
  const [value, setValue] = useState("4286");
  const [other, setOther] = useState("4268");
  const [selected, setSelected] = useState(2);
  const a = Number(value);
  const b = Number(other);
  const left = digits(a);
  const right = digits(b);
  const firstDifference = left.findIndex((digit, i) => digit !== right[i]);
  const highlighted = topic === 1 ? firstDifference : selected;
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-3">
      <label className="text-sm font-bold">Bilangan pertama
        <input inputMode="numeric" className="input input-bordered mt-1 block w-28" value={value}
          onChange={event => {
            const raw = event.target.value.replace(/\D/g, "");
            const next = Math.min(10000, Number(raw));
            setValue(raw ? String(next) : "");
            if (topic === 0) onExampleChange(next, selected);
          }}/>
      </label>
      {topic === 1 && <label className="text-sm font-bold">Bilangan kedua
        <input inputMode="numeric" className="input input-bordered mt-1 block w-28" value={other}
          onChange={event => setOther(event.target.value === "" ? "" : String(Math.min(10000, Number(event.target.value.replace(/\D/g, "")))))}/>
      </label>}
    </div>
    <PlaceTable value={a} other={topic === 1 ? b : undefined} selected={highlighted} onSelect={topic === 1 ? undefined : position => {
      setSelected(position);
      if (topic === 0) onExampleChange(a, position);
    }}/>
    <p aria-live="polite" className="font-semibold">
      {topic === 1 ? firstDifference === -1 ? "Kedua bilangan sama."
        : `${places[firstDifference]} menentukan hasil: ${number(a)} ${a > b ? ">" : "<"} ${number(b)}.`
        : `${places[selected]}: angka ${left[selected]} bernilai ${number(left[selected] * 10 ** (4 - selected))}.`}
    </p>
    {topic === 2 && <p className="rounded-lg bg-base-100 p-2 font-bold">
      {number(a)} = {left.map((digit, i) => digit * 10 ** (4 - i)).filter(Boolean).map(number).join(" + ") || "0"}
    </p>}
  </div>;
}

type GuidedStep = { prompt: string; answer: number; hint: string; column?: number; top?: number[]; bottom?: number[]; digit?: number };

function columnSteps(a: number, b: number, subtract: boolean): GuidedStep[] {
  const left = digits(a);
  const right = digits(b);
  const first = Math.min(left.findIndex(Boolean), right.findIndex(Boolean));
  const steps: GuidedStep[] = [];
  let carry = 0;
  for (let i = 4; i >= first; i--) {
    const place = places[i].toLowerCase();
    if (subtract) {
      if (left[i] < right[i]) {
        let donor = i - 1;
        while (left[donor] === 0) donor--;
        left[donor]--;
        for (let position = donor + 1; position < i; position++) left[position] = 9;
        left[i] += 10;
        steps.push({ prompt: `Tukar dari ${places[donor].toLowerCase()}. Berapa angka atas pada kolom ${place} sekarang?`,
          answer: left[i], hint: "Satu unit dari kolom kiri menjadi sepuluh unit di kolom berikutnya. Teruskan penukaran sampai kolom aktif.",
          column: i, top: [...left], bottom: right });
      }
      const difference = left[i] - right[i];
      steps.push({ prompt: `${left[i]} − ${right[i]} = …`, answer: difference, hint: `Kurangkan angka bawah dari angka atas pada kolom ${place}.`,
        column: i, top: [...left], bottom: right, digit: difference });
    } else {
      const sum = left[i] + right[i] + carry;
      const expression = `${left[i]} + ${right[i]}${carry ? " + 1 simpan" : ""}`;
      steps.push({ prompt: `${expression} = …`, answer: sum, hint: `Jumlahkan digit pada kolom ${place}, termasuk simpanan dari kanan.`,
        column: i, top: left, bottom: right, digit: sum % 10 });
      carry = Math.floor(sum / 10);
      if (carry) steps.push({ prompt: `Tulis ${sum % 10} di kolom ${place}. Berapa yang disimpan ke kolom kiri?`,
        answer: carry, hint: `Pisahkan ${sum} menjadi ${sum % 10} yang ditulis dan satu kelompok sepuluh yang disimpan.`,
        column: i, top: left, bottom: right });
    }
  }
  return steps;
}

const examples = [
  [[2748, 1685], [3186, 2719]],
  [[4002, 1786], [7305, 2857]],
  [[12, 4], [128, 6]],
  [[84, 4], [936, 4]],
];

function operationSteps(a: number, b: number, operation: number): GuidedStep[] {
  if (operation < 2) return columnSteps(a, b, operation === 1);
  if (operation === 2) {
    const parts = digits(a).map((digit, i) => digit * 10 ** (4 - i)).filter(Boolean);
    return [
      ...parts.map(part => ({ prompt: `${number(part)} × ${b} = …`, answer: part * b, hint: `Kalikan bagian ${number(part)} dengan banyak kelompok.` })),
      { prompt: `${parts.map(part => number(part * b)).join(" + ")} = …`, answer: a * b, hint: "Jumlahkan semua hasil kali bagian." },
    ];
  }
  const steps: GuidedStep[] = [];
  let remainder = 0;
  for (const [index, digit] of String(a).split("").entries()) {
    const dividend = remainder * 10 + Number(digit);
    const quotient = Math.floor(dividend / b);
    const product = quotient * b;
    remainder = dividend - product;
    steps.push({ prompt: `${index === 0 ? "Mulai dari" : "Turunkan"} ${digit}. Berapa kali ${b} masuk ke ${dividend}?`,
      answer: quotient, hint: `Pilih hasil kali ${b} yang paling besar tanpa melebihi ${dividend}.` });
    steps.push({ prompt: `${dividend} − (${quotient} × ${b}) = …`, answer: remainder,
      hint: `Kalikan ${quotient} dengan ${b}, lalu kurangi hasilnya dari ${dividend}. Bawa sisanya ke digit berikutnya.` });
  }
  return steps;
}

function OperationLab({ topic }: { topic: number }) {
  const [example, setExample] = useState(0);
  return <GuidedOperation key={example} topic={topic} example={example} onExample={() => setExample(1 - example)}/>;
}

function GuidedOperation({ topic, example, onExample }: { topic: number; example: number; onExample: () => void }) {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "retry" | null>(null);
  const operation = topic - 3;
  const [a, b] = examples[operation][example];
  const sign = ["+", "−", "×", "÷"][operation];
  const result = [a + b, a - b, a * b, a / b][operation];
  const steps = operationSteps(a, b, operation);
  const current = steps[step];
  const shown = current ?? steps.at(-1)!;
  const completedSteps = steps.slice(0, step + Number(feedback === "correct"));
  const solvedDigits = new Map(completedSteps
    .flatMap(item => item.digit === undefined ? [] : [[item.column, item.digit]] as const));
  const move = (next: number) => { setStep(next); setAnswer(""); setFeedback(null); };

  return <div className="space-y-3">
    <p className="text-2xl font-extrabold tabular-nums">{number(a)} {sign} {number(b)}</p>
    {shown.top && shown.bottom && <table className="w-full table-fixed text-center text-sm" aria-label="Hitung bersusun">
      <thead><tr>{places.map(label => <th key={label} scope="col" className="py-1 text-[10px] sm:text-sm">{label}</th>)}</tr></thead>
      <tbody>{[shown.top, shown.bottom, places.map((_, i) => solvedDigits.get(i) ?? "—")].map((row, index) => <tr key={index}>
        {row.map((digit, i) => <td key={i} className={`border border-base-300 p-2 font-bold ${shown.column === i && current ? "bg-warning/25" : "bg-base-100"}`}>{digit}</td>)}
      </tr>)}</tbody>
    </table>}
    {operation >= 2 && <div className="grid grid-cols-4 gap-1" aria-label={operation === 2 ? `${b} kelompok berisi ${a}` : `${a} dibagi ke ${b} kelompok`}>
      {Array.from({ length: b }, (_, i) => <div key={i} className="rounded-lg border border-info bg-info/10 p-2 text-center text-sm font-bold">
        {operation === 2 ? number(a) : current ? "?" : number(result)}
      </div>)}
    </div>}
    {operation >= 2 && completedSteps.length > 0 && <ol className="list-decimal space-y-1 pl-5 text-sm" aria-label="Langkah yang selesai">
      {completedSteps.map((item, i) => <li key={i}>
        {item.prompt.endsWith("…") ? item.prompt.replace("…", number(item.answer)) : `${item.prompt} ${number(item.answer)} kali.`}
      </li>)}
    </ol>}
    {current ? <form className="space-y-2 rounded-lg bg-base-100 p-3" onSubmit={event => {
      event.preventDefault();
      if (answer) setFeedback(Number(answer) === current.answer ? "correct" : "retry");
    }}>
      <p className="text-sm font-bold text-success">Langkah {step + 1} dari {steps.length}</p>
      <label className="block font-bold" htmlFor="guided-operation-answer">{current.prompt}</label>
      <p className="text-sm">{current.hint}</p>
      <div className="flex flex-wrap gap-2">
        <input id="guided-operation-answer" className="input input-bordered w-28" inputMode="numeric" value={answer}
          onChange={event => { setAnswer(event.target.value.replace(/\D/g, "")); setFeedback(null); }} />
        <button className="btn btn-success" disabled={!answer || feedback === "correct"}>Periksa langkah</button>
      </div>
      {feedback && <p role="status" className="font-semibold">{feedback === "correct" ? "Tepat! Lanjutkan ke langkah berikutnya." : "Coba lagi. Gunakan petunjuk di atas."}</p>}
      {feedback === "correct" && <button type="button" className="btn btn-success btn-sm" onClick={() => move(step + 1)}>
        {step + 1 === steps.length ? "Lihat hasil peraga" : "Langkah berikutnya"}
      </button>}
    </form> : <p role="status" className="font-bold text-success">{number(a)} {sign} {number(b)} = {number(result)}.</p>}
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-outline btn-sm" disabled={step === 0} onClick={() => move(step - 1)}>Langkah sebelumnya</button>
      <button className="btn btn-ghost btn-sm" onClick={onExample}>Contoh lain</button>
    </div>
  </div>;
}

function FactorLab() {
  const [value, setValue] = useState(18);
  const [mode, setMode] = useState<"factor" | "multiple">("factor");
  const pairs = Array.from({length: Math.floor(Math.sqrt(value))}, (_, i) => i + 1).filter(i => value % i === 0);
  return <div className="space-y-3">
    <label className="flex items-center gap-3 font-bold">Bilangan
      <select className="select select-bordered w-24" value={value} onChange={event => setValue(Number(event.target.value))}>
        {[18,24,30,36,48,72].map(n => <option key={n}>{n}</option>)}
      </select>
    </label>
    <div className="flex flex-wrap gap-2">
      <button className="btn btn-outline btn-sm" aria-pressed={mode === "factor"} onClick={() => setMode("factor")}>Pasangan faktor</button>
      <button className="btn btn-outline btn-sm" aria-pressed={mode === "multiple"} onClick={() => setMode("multiple")}>Kelipatan</button>
    </div>
    <div className="flex flex-wrap gap-2" aria-live="polite">
      {(mode === "factor" ? pairs.map(i => `${i} × ${value / i}`) : Array.from({length: 6}, (_, i) => `${value} × ${i + 1} = ${value * (i + 1)}`))
        .map(label => <span className="rounded-lg border border-info bg-info/10 px-3 py-2 font-bold" key={label}>{label}</span>)}
    </div>
  </div>;
}

function isCorrect(question: Question, answer: string | undefined) {
  if (!answer) return false;
  if (question.mode === "multiple") {
    return answer.split("|").sort().join("|") === question.answer.split("|").sort().join("|");
  }
  if (!question.mode && /^\d+$/.test(question.answer)) return /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/.test(answer) && Number(answer.replaceAll(".", "")) === Number(question.answer);
  return answer === question.answer;
}

function Quiz({ questions, title, practiceMode, close }: {
  questions: Question[]; title: string; practiceMode: boolean; close: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = questions[index];
  const answer = answers[index] ?? "";
  const selected = answer ? answer.split("|") : [];
  const ready = question?.mode === "order" ? selected.length === question.options?.length : Boolean(answer.trim());
  const score = questions.filter((q, i) => isCorrect(q, answers[i])).length;
  const record = (value: string) => setAnswers(old => ({ ...old, [index]: value }));
  const go = (i: number) => { setChecked(false); setIndex(i); };
  useEffect(() => { heading.current?.focus(); }, [index]);

  return <section className="mx-auto max-w-2xl space-y-3 rounded-xl border border-base-300 bg-base-100 p-3 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-bold text-success">{title}{question && ` · Soal ${index + 1}/${questions.length}`}</p>
      <button className="btn btn-ghost btn-sm" onClick={close}>Tutup</button>
    </div>
    <progress className="progress progress-success w-full" aria-label="Progres soal" value={index} max={questions.length}/>
    {question ? <>
      <h2 ref={heading} tabIndex={-1} className="text-lg font-extrabold">{question.prompt}</h2>
      {question.diagram !== undefined && <div className="rounded-lg bg-info/10 p-2">
        <p className="mb-2 text-center font-bold tabular-nums">{number(question.diagram.value)}</p>
        <PlaceTable value={question.diagram.value} missing={question.diagram.missing}/>
      </div>}
      {question.mode === "order" && <div className="flex flex-wrap items-center gap-2">
        <p aria-live="polite">{selected.join(" → ") || "Ketuk angka sesuai urutan."}</p>
        <button className="btn btn-ghost btn-sm" disabled={checked || !answer} onClick={() => record(selected.slice(0, -1).join("|"))}>Batalkan pilihan terakhir</button>
      </div>}
      {question.options ? <div className="flex flex-wrap gap-2">
        {question.options.map(option => <button key={option} className="btn btn-outline h-auto min-h-11 whitespace-normal"
          disabled={checked || (question.mode === "order" && selected.includes(option))}
          aria-pressed={selected.includes(option)} onClick={() => {
            if (question.mode === "order") record([...selected, option].join("|"));
            else if (question.mode === "multiple") record(selected.includes(option) ? selected.filter(item => item !== option).join("|") : [...selected, option].join("|"));
            else record(option);
          }}>{option}</button>)}
      </div> : <label className="flex flex-wrap items-center gap-2 font-bold">Jawaban
        <input className="input input-bordered w-36" inputMode="numeric" value={answer} disabled={checked}
          onChange={event => record(event.target.value.replace(/[^\d.]/g, ""))}/>
      </label>}
      {practiceMode && checked && <p role="status" className="rounded-lg bg-info/10 p-3">
        <strong>{isCorrect(question, answer) ? "Tepat! " : "Belum tepat. "}</strong>{question.explanation}
      </p>}
      <div className="flex flex-wrap justify-between gap-2">
        {index > 0 && <button className="btn btn-ghost btn-sm" onClick={() => go(index - 1)}>← Sebelumnya</button>}
        {practiceMode && !checked ? <button className="btn btn-success ms-auto" disabled={!ready} onClick={() => setChecked(true)}>Periksa jawaban</button>
          : ready && <button className="btn btn-success ms-auto" onClick={() => go(index + 1)}>{index + 1 === questions.length ? "Lihat hasil" : "Lanjut →"}</button>}
      </div>
    </> : <>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-extrabold">{practiceMode ? "Latihan selesai" : "Hasil evaluasi"}</h2>
      <p className="font-bold">Benar {score} · Salah {questions.length - score} · Skor {Math.round(score / questions.length * 100)}/100</p>
      {score < questions.length && <details className="rounded-lg bg-base-200 p-3">
        <summary className="cursor-pointer font-bold">Bahas jawaban yang salah</summary>
        <ol className="mt-2 space-y-3 text-sm">{questions.map((q, i) => !isCorrect(q, answers[i]) &&
          <li key={i}><strong>Soal {i + 1}. {q.prompt}</strong>
            <p>Jawabanmu {answers[i]?.replaceAll("|", ", ")}. Jawaban benar {q.answer.replaceAll("|", ", ")}.</p><p>{q.explanation}</p>
          </li>)}</ol>
      </details>}
      <button className="btn btn-success" onClick={close}>Kembali ke materi</button>
    </>}
  </section>;
}

export default function GradeFourWholeNumbers() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"lesson" | "practice" | "assessment">("lesson");
  const topic = topics[index];
  const [placeExample, setPlaceExample] = useState({ value: 4286, position: 2 });
  const exampleDigit = digits(placeExample.value)[placeExample.position];
  const changeTopic = (next: number) => {
    setPlaceExample({ value: 4286, position: 2 });
    setIndex(next);
    setMode("lesson");
  };
  return <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-widest text-success">Kelas 4 / Bab 1</p>
    <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Bilangan Cacah sampai 10.000</h1>
    <p className="mt-3">Amati nilai tempat, coba strategi hitung, lalu gunakan untuk memecahkan soal cerita.</p>
    <div className="mt-6 grid overflow-hidden rounded-xl border border-base-300 bg-base-100 md:grid-cols-2">
      <div className="flex min-h-36 flex-col items-center justify-center bg-info/10 p-5 text-center">
        <span aria-hidden="true" className="text-3xl font-bold text-info">▶</span>
        <p className="mt-2 font-bold">Video pembelajaran segera hadir</p>
      </div>
      <div className="p-5">
        <div className="mb-2 flex gap-2 font-mono font-bold text-info" aria-hidden="true">
          {["1.000", "100", "10", "1"].map(value => <span key={value} className="rounded bg-info/10 px-2 py-1">{value}</span>)}
        </div>
        <h2 className="text-xl font-bold">Laboratorium Bilangan</h2>
        <p className="text-sm">Delapan submateri, masing-masing empat soal latihan, dan evaluasi 24 soal.</p>
        <a href="#materi-bilangan" className="btn btn-success btn-sm mt-3">Mulai belajar</a>
      </div>
    </div>
    <div id="materi-bilangan" className="mt-6">
      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Submateri Bab 1 Kelas 4">
        {topics.map((item, i) => <button key={item.title} className={`btn btn-sm h-auto min-h-9 max-w-full whitespace-normal ${i === index ? "btn-success" : "btn-outline"}`}
          aria-current={i === index ? "step" : undefined} onClick={() => changeTopic(i)}>
          {String.fromCharCode(65 + i)}. {item.title}
        </button>)}
      </nav>
      {mode === "lesson" ? <>
        <div className="grid overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-2">
          <div className="min-w-0 bg-info/5 p-4 sm:p-6">
            {index < 3 ? <PlaceLab key={index} topic={index} onExampleChange={(value, position) => setPlaceExample({ value, position })}/> : index < 7 ? <OperationLab key={index} topic={index}/> : <FactorLab/>}
          </div>
          <div className="p-5 sm:p-6">
            <h2 className="text-2xl font-extrabold">{topic.title}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed">{topic.steps.map((step, i) => <li key={step}>{index === 0 && i === 1
              ? `Bedakan angka, tempatnya, dan nilainya. Pada ${number(placeExample.value)}, angka ${exampleDigit} menempati ${places[placeExample.position].toLowerCase()} dan bernilai ${number(exampleDigit * 10 ** (4 - placeExample.position))}.`
              : step}</li>)}</ol>
            <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm"><strong>Coba bersama. </strong>{topic.demo}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-ghost" disabled={index === 0} onClick={() => changeTopic(index - 1)}>← Materi sebelumnya</button>
          <button className="btn btn-outline btn-success" onClick={() => setMode("practice")}>Latihan submateri →</button>
          {index < topics.length - 1 ? <button className="btn btn-success" onClick={() => changeTopic(index + 1)}>Materi berikutnya →</button>
            : <button className="btn btn-success" onClick={() => setMode("assessment")}>Evaluasi Bab 1 →</button>}
        </div>
      </> : <Quiz key={`${index}-${mode}`} title={mode === "practice" ? `Latihan · ${topic.title}` : "Evaluasi Bab 1"}
        questions={mode === "practice" ? practice[index] : assessment} practiceMode={mode === "practice"} close={() => changeTopic(index)}/>}
    </div>
  </section>;
}
