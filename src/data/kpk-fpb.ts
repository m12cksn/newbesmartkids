export type KpkQuestion = { prompt: string; options: string[]; answer: number; explanation: string };
export const kpkQuestions: KpkQuestion[] = [
  {
    "prompt": "KPK dari 4 dan 6 adalah ...",
    "options": [
      "10",
      "12",
      "18",
      "24"
    ],
    "answer": 1,
    "explanation": "Kelipatan 4: 4, 8, 12; kelipatan 6: 6, 12. Pertemuan pertama 12."
  },
  {
    "prompt": "FPB dari 12 dan 18 adalah ...",
    "options": [
      "3",
      "4",
      "6",
      "9"
    ],
    "answer": 2,
    "explanation": "Faktor sama: 1, 2, 3, 6. Terbesar 6."
  },
  {
    "prompt": "Kelipatan keempat dari 5 adalah ...",
    "options": [
      "15",
      "20",
      "25",
      "30"
    ],
    "answer": 1,
    "explanation": "5, 10, 15, 20."
  },
  {
    "prompt": "Faktor dari 15 yang benar adalah ...",
    "options": [
      "2",
      "4",
      "5",
      "8"
    ],
    "answer": 2,
    "explanation": "15 dapat dibagi habis oleh 1, 3, 5, 15."
  },
  {
    "prompt": "KPK dari 3 dan 7 adalah ...",
    "options": [
      "10",
      "14",
      "21",
      "28"
    ],
    "answer": 2,
    "explanation": "3 dan 7 relatif prima, KPK-nya 21."
  },
  {
    "prompt": "FPB dari 20 dan 30 adalah ...",
    "options": [
      "5",
      "10",
      "15",
      "20"
    ],
    "answer": 1,
    "explanation": "Faktor sama terbesar 10."
  },
  {
    "prompt": "KPK dari 6 dan 8 adalah ...",
    "options": [
      "12",
      "18",
      "24",
      "48"
    ],
    "answer": 2,
    "explanation": "Kelipatan pertama yang sama adalah 24."
  },
  {
    "prompt": "FPB dari 24 dan 36 adalah ...",
    "options": [
      "6",
      "8",
      "12",
      "18"
    ],
    "answer": 2,
    "explanation": "24 dan 36 sama-sama habis dibagi 12."
  },
  {
    "prompt": "Faktorisasi prima 18 adalah ...",
    "options": [
      "2 × 9",
      "2 × 3 × 3",
      "3 × 6",
      "1 × 18"
    ],
    "answer": 1,
    "explanation": "18 = 2 × 9 = 2 × 3 × 3."
  },
  {
    "prompt": "Faktorisasi prima 40 adalah ...",
    "options": [
      "2 × 2 × 2 × 5",
      "4 × 10",
      "2 × 20",
      "5 × 8"
    ],
    "answer": 0,
    "explanation": "40 = 2³ × 5."
  },
  {
    "prompt": "KPK dari 9 dan 12 adalah ...",
    "options": [
      "18",
      "24",
      "36",
      "48"
    ],
    "answer": 2,
    "explanation": "9 = 3² dan 12 = 2² × 3, sehingga KPK = 36."
  },
  {
    "prompt": "FPB dari 18 dan 27 adalah ...",
    "options": [
      "3",
      "6",
      "9",
      "12"
    ],
    "answer": 2,
    "explanation": "18 = 2 × 3², 27 = 3³; FPB = 3² = 9."
  },
  {
    "prompt": "Dua lonceng berbunyi tiap 4 dan 10 menit. Bersama lagi setelah ...",
    "options": [
      "14 menit",
      "20 menit",
      "24 menit",
      "40 menit"
    ],
    "answer": 1,
    "explanation": "Gunakan KPK 4 dan 10, yaitu 20."
  },
  {
    "prompt": "Ada 16 apel dan 24 jeruk. Paket identik terbanyak adalah ...",
    "options": [
      "4",
      "6",
      "8",
      "12"
    ],
    "answer": 2,
    "explanation": "Gunakan FPB 16 dan 24, yaitu 8 paket."
  },
  {
    "prompt": "KPK dari 5 dan 10 adalah ...",
    "options": [
      "5",
      "10",
      "15",
      "20"
    ],
    "answer": 1,
    "explanation": "10 merupakan kelipatan 5 dan 10 yang terkecil."
  },
  {
    "prompt": "FPB dari 14 dan 21 adalah ...",
    "options": [
      "3",
      "7",
      "14",
      "21"
    ],
    "answer": 1,
    "explanation": "Faktor sama terbesar 7."
  },
  {
    "prompt": "Dua bus datang tiap 6 dan 9 menit. Bersama lagi setelah ...",
    "options": [
      "12",
      "15",
      "18",
      "54"
    ],
    "answer": 2,
    "explanation": "KPK 6 dan 9 = 18."
  },
  {
    "prompt": "Ada 36 buku dan 48 pensil untuk paket identik. Paket maksimal ...",
    "options": [
      "6",
      "8",
      "12",
      "24"
    ],
    "answer": 2,
    "explanation": "FPB 36 dan 48 = 12."
  },
  {
    "prompt": "KPK dari 8 dan 12 adalah ...",
    "options": [
      "16",
      "20",
      "24",
      "36"
    ],
    "answer": 2,
    "explanation": "Kelipatan sama terkecil 24."
  },
  {
    "prompt": "FPB dari 32 dan 40 adalah ...",
    "options": [
      "4",
      "8",
      "16",
      "20"
    ],
    "answer": 1,
    "explanation": "32 = 2⁵, 40 = 2³ × 5, jadi FPB = 8."
  }
];
