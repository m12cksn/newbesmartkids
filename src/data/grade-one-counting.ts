export type GradeOneQuestion = {id:string;section:number;kind:"count"|"compare"|"bond"|"sequence";format:"multiple_choice"|"number_input";a:number;b?:number;sequence?:Array<number|null>;prompt:string;options:string[];answer:string;explanation:string};
export const gradeOneQuestions:GradeOneQuestion[] = [
  {
    "id": "g1-c-01",
    "section": 0,
    "kind": "count",
    "a": 6,
    "b": 0,
    "prompt": "Ada berapa benda? Pilih lambang bilangan yang tepat.",
    "options": [
      "6",
      "4",
      "5",
      "7"
    ],
    "answer": "6",
    "explanation": "Ada 6 (enam) benda. Hitung satu per satu.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-02",
    "section": 0,
    "kind": "count",
    "a": 8,
    "b": 0,
    "prompt": "Hitung benda, lalu tulis lambang bilangannya.",
    "options": [],
    "answer": "8",
    "explanation": "Ada 8 (delapan) benda. Hitung satu per satu.",
    "format": "number_input"
  },
  {
    "id": "g1-c-03",
    "section": 0,
    "kind": "count",
    "a": 5,
    "b": 0,
    "prompt": "Ada berapa benda? Pilih lambang bilangan yang tepat.",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": "5",
    "explanation": "Ada 5 (lima) benda. Hitung satu per satu.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-04",
    "section": 0,
    "kind": "count",
    "a": 9,
    "b": 0,
    "prompt": "Hitung benda, lalu tulis lambang bilangannya.",
    "options": [],
    "answer": "9",
    "explanation": "Ada 9 (sembilan) benda. Hitung satu per satu.",
    "format": "number_input"
  },
  {
    "id": "g1-c-05",
    "section": 0,
    "kind": "count",
    "a": 10,
    "b": 0,
    "prompt": "Ada berapa benda? Pilih lambang bilangan yang tepat.",
    "options": [
      "10",
      "8",
      "9",
      "7"
    ],
    "answer": "10",
    "explanation": "Ada 10 (sepuluh) benda. Hitung satu per satu.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-06",
    "section": 0,
    "kind": "count",
    "a": 7,
    "b": 0,
    "prompt": "Hitung benda, lalu tulis lambang bilangannya.",
    "options": [],
    "answer": "7",
    "explanation": "Ada 7 (tujuh) benda. Hitung satu per satu.",
    "format": "number_input"
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
      "Sama banyak",
      "Tidak dapat ditentukan",
      "B"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 3 benda dan kelompok B 5 benda.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-08",
    "section": 1,
    "kind": "compare",
    "a": 7,
    "b": 4,
    "prompt": "Kelompok mana lebih sedikit?",
    "options": [
      "B",
      "A",
      "Sama banyak",
      "Tidak dapat ditentukan"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 7 benda dan kelompok B 4 benda.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-09",
    "section": 1,
    "kind": "compare",
    "a": 6,
    "b": 6,
    "prompt": "Bagaimana banyak benda kedua kelompok?",
    "options": [
      "A",
      "Sama banyak",
      "B",
      "Tidak dapat ditentukan"
    ],
    "answer": "Sama banyak",
    "explanation": "Kelompok A memiliki 6 benda dan kelompok B 6 benda.",
    "format": "multiple_choice"
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
      "Sama banyak",
      "B",
      "Tidak dapat ditentukan"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 8 benda dan kelompok B 9 benda.",
    "format": "multiple_choice"
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
      "Sama banyak",
      "Tidak dapat ditentukan",
      "B"
    ],
    "answer": "B",
    "explanation": "Kelompok A memiliki 5 benda dan kelompok B 2 benda.",
    "format": "multiple_choice"
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
      "Sama banyak",
      "Tidak dapat ditentukan"
    ],
    "answer": "A",
    "explanation": "Kelompok A memiliki 10 benda dan kelompok B 7 benda.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-13",
    "section": 2,
    "kind": "bond",
    "a": 5,
    "b": 2,
    "prompt": "Lengkapi pasangan bilangan 5 (lima). Jika satu bagian 2, berapa bagian lainnya?",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "answer": "3",
    "explanation": "5 dapat dipisahkan menjadi 2 dan 3.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-14",
    "section": 2,
    "kind": "bond",
    "a": 7,
    "b": 4,
    "prompt": "Lengkapi pasangan bilangan 7 (tujuh). Jika satu bagian 4, berapa bagian lainnya?",
    "options": [],
    "answer": "3",
    "explanation": "7 dapat dipisahkan menjadi 4 dan 3.",
    "format": "number_input"
  },
  {
    "id": "g1-c-15",
    "section": 2,
    "kind": "bond",
    "a": 9,
    "b": 5,
    "prompt": "Lengkapi pasangan bilangan 9 (sembilan). Jika satu bagian 5, berapa bagian lainnya?",
    "options": [
      "4",
      "2",
      "3",
      "5"
    ],
    "answer": "4",
    "explanation": "9 dapat dipisahkan menjadi 5 dan 4.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-16",
    "section": 2,
    "kind": "bond",
    "a": 6,
    "b": 1,
    "prompt": "Lengkapi pasangan bilangan 6 (enam). Jika satu bagian 1, berapa bagian lainnya?",
    "options": [],
    "answer": "5",
    "explanation": "6 dapat dipisahkan menjadi 1 dan 5.",
    "format": "number_input"
  },
  {
    "id": "g1-c-17",
    "section": 2,
    "kind": "bond",
    "a": 8,
    "b": 3,
    "prompt": "Lengkapi pasangan bilangan 8 (delapan). Jika satu bagian 3, berapa bagian lainnya?",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "answer": "5",
    "explanation": "8 dapat dipisahkan menjadi 3 dan 5.",
    "format": "multiple_choice"
  },
  {
    "id": "g1-c-18",
    "section": 2,
    "kind": "bond",
    "a": 7,
    "b": 2,
    "prompt": "Lengkapi pasangan bilangan 7 (tujuh). Jika satu bagian 2, berapa bagian lainnya?",
    "options": [],
    "answer": "5",
    "explanation": "7 dapat dipisahkan menjadi 2 dan 5.",
    "format": "number_input"
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
      "2",
      "4",
      "3",
      "5"
    ],
    "answer": "4",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 4.",
    "format": "multiple_choice"
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
    "prompt": "Isi angka yang hilang pada urutan bilangan berikut.",
    "options": [],
    "answer": "7",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 7.",
    "format": "number_input"
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
      "5",
      "6",
      "8",
      "7"
    ],
    "answer": "7",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 7.",
    "format": "multiple_choice"
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
    "prompt": "Isi angka yang hilang pada urutan bilangan berikut.",
    "options": [],
    "answer": "9",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 9.",
    "format": "number_input"
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
      "2",
      "4",
      "3",
      "5"
    ],
    "answer": "4",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 4.",
    "format": "multiple_choice"
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
    "prompt": "Isi angka yang hilang pada urutan bilangan berikut.",
    "options": [],
    "answer": "2",
    "explanation": "Urutan yang benar mengisi tempat kosong dengan 2.",
    "format": "number_input"
  }
];
