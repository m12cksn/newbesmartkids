/**
 * Tipe umum Ujian Akhir Tahun (SAT, Sumatif Akhir Tahun) per kelas.
 * Data soal setiap kelas berada di src/exams/kelas-<n>-sat/data.ts dan hanya memakai `import type` dari file ini,
 * supaya skrip verifikasi bisa memuatnya dengan `node --experimental-strip-types`.
 */
export type ExamLevel = "Sedang" | "Menantang" | "Sangat menantang";

/** Pilihan jawaban: teks biasa, atau teks dengan gambar (kode gambar ditafsirkan oleh Art kelas itu). */
export type ExamOption = string | { text: string; art: string };

export type ExamPart =
  | { kind: "num"; label: string; value: number; unit?: string }
  | { kind: "choice"; label: string; options: ExamOption[]; answer: string };

export type ExamQuestion<Scene = unknown> = {
  id: string;
  /** Nomor bab sumber; soal gabungan memakai lebih dari satu bab. */
  chapters: number[];
  level: ExamLevel;
  prompt: string;
  scene?: Scene;
  parts: ExamPart[];
  explanation: string;
};

export const EXAM_SEP = "‖";
export const optionText = (o: ExamOption) => (typeof o === "string" ? o : o.text);
export const partAnswer = (p: ExamPart) => (p.kind === "num" ? String(p.value) : p.answer);
export const answerKey = (q: ExamQuestion) => q.parts.map(partAnswer).join(EXAM_SEP);
export const splitAnswer = (raw: string | undefined, n: number) => { const v = raw ? raw.split(EXAM_SEP) : []; return Array.from({ length: n }, (_, i) => v[i] ?? ""); };
export const isAnswered = (q: ExamQuestion, raw: string | undefined) => splitAnswer(raw, q.parts.length).every(v => v.trim() !== "");
export const isCorrect = (q: ExamQuestion, raw: string | undefined) => {
  const v = splitAnswer(raw, q.parts.length);
  return q.parts.every((p, i) => (p.kind === "num" ? v[i].trim() !== "" && Number(v[i]) === p.value : v[i] === p.answer));
};
/** Jawaban siswa dalam bentuk kalimat, untuk tinjauan hasil. */
export const describe = (q: ExamQuestion, raw: string | undefined) => {
  const v = splitAnswer(raw, q.parts.length);
  return q.parts.map((p, i) => `${p.label} ${v[i] || "(kosong)"}${p.kind === "num" && p.unit && v[i] ? ` ${p.unit}` : ""}`).join("; ");
};
export const describeKey = (q: ExamQuestion) => q.parts.map(p => `${p.label} ${partAnswer(p)}${p.kind === "num" && p.unit ? ` ${p.unit}` : ""}`).join("; ");
