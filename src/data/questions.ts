export type Question = {
  id: string;
  materialId: string;
  type: "multiple_choice" | "essay" | "multipart";
  prompt: string;
  visual?: string;
  visualType?: "apples" | "number_line" | "groups" | "order" | "pencils";
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: "mudah" | "sedang" | "menantang";
};

export const questions: Question[] = [
  { id: "kelas1-bilangan-01", materialId: "kelas-1-membilang-10", type: "multiple_choice", prompt: "Ada berapa apel?", visualType: "apples", options: ["2", "3", "4"], answer: "3", explanation: "Hitung setiap apel satu kali. Jumlahnya ada 3.", difficulty: "mudah" },
  { id: "kelas1-bilangan-02", materialId: "kelas-1-membilang-10", type: "multiple_choice", prompt: "Bilangan setelah 6 adalah ...", visualType: "number_line", options: ["5", "7", "8"], answer: "7", explanation: "Urutan bilangan setelah 6 adalah 7.", difficulty: "mudah" },
  { id: "kelas1-bilangan-03", materialId: "kelas-1-membilang-10", type: "multiple_choice", prompt: "Kelompok mana yang memiliki benda lebih banyak?", visualType: "groups", options: ["Kelompok A", "Kelompok B", "Jumlahnya sama"], answer: "Kelompok B", explanation: "Kelompok B memiliki 4 benda, sedangkan A memiliki 3 benda.", difficulty: "mudah" },
  { id: "kelas1-bilangan-04", materialId: "kelas-1-membilang-10", type: "multiple_choice", prompt: "Urutan bilangan dari yang terkecil adalah ...", visualType: "order", options: ["5, 2, 4", "2, 4, 5", "4, 2, 5"], answer: "2, 4, 5", explanation: "Bilangan 2 lebih kecil dari 4, dan 4 lebih kecil dari 5.", difficulty: "sedang" },
  { id: "kelas1-bilangan-05", materialId: "kelas-1-membilang-10", type: "multiple_choice", prompt: "Rani memiliki 8 pensil. Ia memberikan 2 pensil kepada Dito. Apakah pensil Rani sekarang lebih banyak atau lebih sedikit dari 8?", visualType: "pencils", options: ["Lebih banyak", "Lebih sedikit", "Tetap 8"], answer: "Lebih sedikit", explanation: "Karena 2 pensil diberikan, jumlah pensil Rani menjadi lebih sedikit dari 8.", difficulty: "sedang" },
];

export function getQuestionsByMaterial(materialId: string) {
  return questions.filter((question) => question.materialId === materialId);
}
