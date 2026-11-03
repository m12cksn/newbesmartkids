export type GradeOneQuestion = {id:string;section:number;kind:"count"|"compare"|"bond"|"sequence";a:number;b?:number;sequence?:Array<number|null>;prompt:string;options:string[];answer:string;explanation:string};
export const gradeOneQuestions:GradeOneQuestion[] = [
  {
    "id": "g1-c-01",
    "section": 0,
    "kind": "count",
    "a": 6,
    "b": 0,
    "prompt": "Ada berapa titik di dalam bingkai?",
    "options": [
      "5",
      "6",
      "7"
    ],
    "answer": "6",
    "explanation": "Ada 6 titik. Hitung satu per satu."
  },
  {
    "id": "g1-c-02",
    "section": 0,
    "kind": "count",
    "a": 8,
    "b": 0,
    "prompt": "Hitung titik berikut.",
    "options": [
      "7",
      "8",
      "9"
    ],
    "answer": "8",
    "explanation": "Ada 8 titik. Hitung satu per satu."
  },
  {
    "id": "g1-c-03",
    "section": 0,
    "kind": "count",
    "a": 5,
    "b": 0,
    "prompt": "Berapa banyak benda yang kamu lihat?",
    "options": [
      "4",
      "5",
      "6"
    ],
    "answer": "5",
    "explanation": "Ada 5 titik. Hitung satu per satu."
  },
  {
    "id": "g1-c-04",
    "section": 0,
    "kind": "count",
    "a": 9,
    "b": 0,
    "prompt": "Pilih lambang bilangan sembilan.",
    "options": [
      "8",
      "9",
      "10"
    ],
    "answer": "9",
    "explanation": "Ada 9 titik. Hitung satu per satu."
  },
  {
    "id": "g1-c-05",
    "section": 0,
    "kind": "count",
    "a": 10,
    "b": 0,
    "prompt": "Hitung semua titik.",
    "options": [
      "8",
      "9",
      "10"
    ],
    "answer": "10",
    "explanation": "Ada 10 titik. Hitung satu per satu."
  },
  {
    "id": "g1-c-06",
    "section": 0,
    "kind": "count",
    "a": 7,
    "b": 0,
    "prompt": "Tuliskan banyak titik dengan memilih angka.",
    "options": [
      "6",
      "7",
      "8"
    ],
    "answer": "7",
    "explanation": "Ada 7 titik. Hitung satu per satu."
  },
  {
    "id": "g1-c-07",
    "section": 1,
    "kind": "compare",
    "a": 3,
    "b": 5,
    "prompt": "Kelompok mana lebih banyak?",
    "options": [
      "A",
      "B",
      "Sama banyak"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 3 benda dan kelompok B 5 benda."
  },
  {
    "id": "g1-c-08",
    "section": 1,
    "kind": "compare",
    "a": 7,
    "b": 4,
    "prompt": "Kelompok mana lebih sedikit?",
    "options": [
      "A",
      "B",
      "Sama banyak"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 7 benda dan kelompok B 4 benda."
  },
  {
    "id": "g1-c-09",
    "section": 1,
    "kind": "compare",
    "a": 6,
    "b": 6,
    "prompt": "Bagaimana banyak benda kedua kelompok?",
    "options": [
      "A lebih banyak",
      "B lebih banyak",
      "Sama banyak"
    ],
    "answer": "Sama banyak",
    "explanation": "Kelompok A memiliki 6 benda dan kelompok B 6 benda."
  },
  {
    "id": "g1-c-10",
    "section": 1,
    "kind": "compare",
    "a": 8,
    "b": 9,
    "prompt": "Kelompok mana lebih banyak?",
    "options": [
      "A",
      "B",
      "Sama banyak"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 8 benda dan kelompok B 9 benda."
  },
  {
    "id": "g1-c-11",
    "section": 1,
    "kind": "compare",
    "a": 5,
    "b": 2,
    "prompt": "Kelompok mana lebih sedikit?",
    "options": [
      "A",
      "B",
      "Sama banyak"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 5 benda dan kelompok B 2 benda."
  },
  {
    "id": "g1-c-12",
    "section": 1,
    "kind": "compare",
    "a": 10,
    "b": 7,
    "prompt": "Kelompok mana lebih banyak?",
    "options": [
      "A",
      "B",
      "Sama banyak"
    ],
    "answer": "A",
    "explanation": "Kelompok A memiliki 10 benda dan kelompok B 7 benda."
  },
  {
    "id": "g1-c-13",
    "section": 2,
    "kind": "bond",
    "a": 5,
    "b": 2,
    "prompt": "5 dipisah menjadi 2 dan berapa?",
    "options": [
      "2",
      "3",
      "4"
    ],
    "answer": "3",
    "explanation": "5 dapat dipisahkan menjadi 2 dan 3."
  },
  {
    "id": "g1-c-14",
    "section": 2,
    "kind": "bond",
    "a": 7,
    "b": 4,
    "prompt": "7 dipisah menjadi 4 dan berapa?",
    "options": [
      "2",
      "3",
      "5"
    ],
    "answer": "3",
    "explanation": "7 dapat dipisahkan menjadi 4 dan 3."
  },
  {
    "id": "g1-c-15",
    "section": 2,
    "kind": "bond",
    "a": 9,
    "b": 5,
    "prompt": "9 dipisah menjadi 5 dan berapa?",
    "options": [
      "3",
      "4",
      "5"
    ],
    "answer": "4",
    "explanation": "9 dapat dipisahkan menjadi 5 dan 4."
  },
  {
    "id": "g1-c-16",
    "section": 2,
    "kind": "bond",
    "a": 6,
    "b": 1,
    "prompt": "6 dipisah menjadi 1 dan berapa?",
    "options": [
      "4",
      "5",
      "6"
    ],
    "answer": "5",
    "explanation": "6 dapat dipisahkan menjadi 1 dan 5."
  },
  {
    "id": "g1-c-17",
    "section": 2,
    "kind": "bond",
    "a": 8,
    "b": 3,
    "prompt": "8 dipisah menjadi 3 dan berapa?",
    "options": [
      "4",
      "5",
      "6"
    ],
    "answer": "5",
    "explanation": "8 dapat dipisahkan menjadi 3 dan 5."
  },
  {
    "id": "g1-c-18",
    "section": 2,
    "kind": "bond",
    "a": 7,
    "b": 2,
    "prompt": "7 dipisah menjadi 2 dan berapa?",
    "options": [
      "4",
      "5",
      "6"
    ],
    "answer": "5",
    "explanation": "7 dapat dipisahkan menjadi 2 dan 5."
  },
  {
    "id": "g1-c-19",
    "section": 3,
    "kind": "sequence",
    "a": 0,
    "b": 0,
    "sequence": [
      2,
      3,
      null
    ],
    "prompt": "Lengkapi urutan: 2, 3, ...",
    "options": [
      "1",
      "4",
      "5"
    ],
    "answer": "4",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 4."
  },
  {
    "id": "g1-c-20",
    "section": 3,
    "kind": "sequence",
    "a": 0,
    "b": 0,
    "sequence": [
      6,
      null,
      8
    ],
    "prompt": "Lengkapi urutan: 6, ..., 8",
    "options": [
      "5",
      "7",
      "9"
    ],
    "answer": "7",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 7."
  },
  {
    "id": "g1-c-21",
    "section": 3,
    "kind": "sequence",
    "a": 0,
    "b": 0,
    "sequence": [
      9,
      8,
      null
    ],
    "prompt": "Lengkapi urutan mundur: 9, 8, ...",
    "options": [
      "6",
      "7",
      "10"
    ],
    "answer": "7",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 7."
  },
  {
    "id": "g1-c-22",
    "section": 3,
    "kind": "sequence",
    "a": 0,
    "b": 0,
    "sequence": [
      10,
      null,
      8
    ],
    "prompt": "Lengkapi urutan mundur: 10, ..., 8",
    "options": [
      "7",
      "9",
      "10"
    ],
    "answer": "9",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 9."
  },
  {
    "id": "g1-c-23",
    "section": 3,
    "kind": "sequence",
    "a": 0,
    "b": 0,
    "sequence": [
      null,
      5,
      6
    ],
    "prompt": "Lengkapi urutan: ..., 5, 6",
    "options": [
      "3",
      "4",
      "7"
    ],
    "answer": "4",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 4."
  },
  {
    "id": "g1-c-24",
    "section": 3,
    "kind": "sequence",
    "a": 0,
    "b": 0,
    "sequence": [
      4,
      3,
      null,
      1
    ],
    "prompt": "Lengkapi urutan mundur: 4, 3, ..., 1",
    "options": [
      "1",
      "2",
      "5"
    ],
    "answer": "2",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 2."
  }
];
