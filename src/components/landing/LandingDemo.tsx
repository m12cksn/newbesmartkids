"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";

/** Jeruk yang digambar sederhana tetapi jelas: bulat oranye dengan daun dan tangkai. */
function Orange({ size = 26 }: { size?: number }) {
  return <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    <circle cx="16" cy="18" r="12" fill="#f9a03f" stroke="#c96a12" strokeWidth="1.5" />
    <circle cx="12" cy="14" r="2.5" fill="#fff" opacity="0.35" />
    <path d="M16 6 L16 9" stroke="#6b4423" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 7 C 19 3, 24 4, 24 6 C 21 8, 18 8, 16 7 Z" fill="#40c057" stroke="#2b8a3e" strokeWidth="1" />
  </svg>;
}
function Plate({ n }: { n: number }) {
  return <div className="flex h-16 w-24 flex-wrap content-center items-center justify-center gap-0.5 rounded-[50%] border-2 border-[#ced4da] bg-white shadow-inner">
    {Array.from({ length: n }, (_, i) => <Orange key={i} size={22} />)}
  </div>;
}

type Step = { tag: string; title: string; options: number[]; answer: number; hint: string; view: React.ReactNode };
const STEPS: Step[] = [
  { tag: "Benda", title: "Ada 3 piring, setiap piring berisi 4 jeruk. Berapa jeruk semuanya?", options: [7, 12, 14], answer: 12, hint: "Hitung per piring: 4, 8, 12.",
    view: <div className="flex flex-wrap justify-center gap-2">{[0, 1, 2].map(i => <Plate key={i} n={4} />)}</div> },
  { tag: "Gambar", title: "12 jeruk dibagi rata ke 3 kantong. Berapa jeruk di setiap kantong?", options: [3, 4, 6], answer: 4, hint: "Batang 12 dipotong menjadi 3 bagian sama panjang.",
    view: <div className="w-full"><div className="flex h-9 overflow-hidden rounded-lg border-2 border-[#17352a] text-sm font-bold">{[0, 1, 2].map(i => <span key={i} className="flex flex-1 items-center justify-center border-e-2 border-[#17352a] bg-[#e6f4ea] last:border-e-0">?</span>)}</div>
      <p className="mt-1 text-center text-xs font-semibold text-[#5b6b64]">Satu batang utuh = 12 jeruk</p></div> },
  { tag: "Angka", title: "Sekarang tanpa gambar: 24 : 4 = …", options: [5, 6, 8], answer: 6, hint: "Pikirkan 4 × … = 24.",
    view: <p className="text-center text-4xl font-extrabold tracking-wide text-[#17352a]">24 : 4</p> },
];

/** Tiga soal singkat yang menunjukkan urutan belajar BeSmartKids: benda, gambar, lalu angka. */
export function LandingDemo() {
  const [i, setI] = useState(0); const [picked, setPicked] = useState<number | null>(null); const [score, setScore] = useState(0);
  const done = i >= STEPS.length, s = STEPS[Math.min(i, STEPS.length - 1)], right = picked === s.answer;
  const next = () => { setI(i + 1); setPicked(null); };
  return <div data-testid="landing-demo" className="flex h-full flex-col gap-3 p-4 text-[#17352a]">
    <div className="flex items-center justify-between text-xs font-bold"><span className="text-[#208f6d]">BeSmartKids</span><span>{done ? "Selesai" : `Soal ${i + 1} dari 3`}</span></div>
    <div className="flex gap-1">{STEPS.map((x, k) => <span key={x.tag} className={`h-1.5 flex-1 rounded-full ${k < i || done ? "bg-[#208f6d]" : k === i ? "bg-[#ffd34f]" : "bg-[#e1eee6]"}`} />)}</div>
    {done ? <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <p className="text-3xl font-extrabold">{score} / 3</p>
      <p className="text-sm">Dari benda, ke gambar, lalu ke angka. Begitulah setiap bab di BeSmartKids disusun.</p>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => { setI(0); setPicked(null); setScore(0); }}><RotateCcw className="size-4" aria-hidden="true" />Coba lagi</button>
    </div> : <>
      <p className="w-fit rounded-full bg-[#e6f4ea] px-2 py-0.5 text-xs font-bold text-[#208f6d]">{s.tag}</p>
      <p className="text-sm font-bold leading-snug">{s.title}</p>
      <div className="flex min-h-24 items-center justify-center rounded-xl bg-[#f5faf7] p-2">{s.view}</div>
      <div role="group" aria-label="Pilihan jawaban" className="grid grid-cols-3 gap-2">{s.options.map(o => <button key={o} type="button" aria-label={`Jawab ${o}`} disabled={picked !== null}
        onClick={() => { setPicked(o); if (o === s.answer) setScore(score + 1); }}
        className={`btn h-12 text-lg ${picked === o ? (o === s.answer ? "btn-success" : "btn-error") : "btn-outline"}`}>{o}</button>)}</div>
      {picked !== null && <div role="status" className={`flex items-start gap-2 rounded-lg p-2 text-xs ${right ? "bg-[#e6f4ea]" : "bg-[#fff3bf]"}`}>
        {right ? <Check className="size-4 shrink-0 text-[#208f6d]" aria-hidden="true" /> : <X className="size-4 shrink-0 text-[#c92a2a]" aria-hidden="true" />}
        <span>{right ? "Tepat!" : `Belum tepat. ${s.hint} Jawabannya ${s.answer}.`}</span></div>}
      {picked !== null && <button type="button" className="btn btn-sm btn-success mt-auto" onClick={next}>{i === STEPS.length - 1 ? "Lihat hasil" : "Soal berikutnya"}</button>}
    </>}
  </div>;
}
