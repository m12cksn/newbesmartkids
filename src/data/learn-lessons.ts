export type LearnKind = "counting" | "addition" | "explanation";

export type LearnStep = {
  label: string;
  title: string;
  description: string;
  action?: string;
  explanation: string;
  kind: LearnKind;
};

const countingSteps: LearnStep[] = [
  { label: "Hitung benda", title: "Satu benda, satu hitungan.", description: "Tekan tombol untuk melihat cara menghitung benda satu per satu.", action: "Hitung bersama", explanation: "Setiap benda dihitung satu kali. Kelompok ini memiliki 5 benda.", kind: "counting" },
  { label: "Cocokkan angka", title: "Banyak benda memiliki lambang bilangan.", description: "Perhatikan jumlah benda, lalu pilih angka yang sesuai.", explanation: "Lima benda ditulis menggunakan lambang bilangan 5.", kind: "explanation" },
  { label: "Cek pemahaman", title: "Sekarang kamu sudah mengenal bilangan.", description: "Gunakan pemahaman ini saat mengerjakan latihan.", explanation: "Menghitung dengan urut membantu kita menemukan jumlah benda dengan tepat.", kind: "explanation" },
];

const additionSteps: LearnStep[] = [
  { label: "Gabungkan", title: "Penjumlahan berarti menggabungkan.", description: "Ada 3 kelereng hijau dan 2 kelereng jingga. Jika digabung, berapa semuanya?", action: "Gabungkan kelereng", explanation: "Tiga kelereng digabung dengan dua kelereng. Jumlah seluruhnya menjadi lima.", kind: "addition" },
  { label: "Coba jumlah", title: "Tulis gabungannya sebagai kalimat matematika.", description: "Kita dapat menuliskan jumlah kedua kelompok dengan tanda tambah.", explanation: "Kelompok pertama berisi 3 dan kelompok kedua berisi 2, jadi 3 + 2 = 5.", kind: "explanation" },
  { label: "Cek pemahaman", title: "Penjumlahan membantu kita menemukan jumlah seluruhnya.", description: "Kamu siap mencoba beberapa soal penjumlahan.", explanation: "Saat dua kelompok digabung, gunakan penjumlahan untuk menemukan jumlah benda semuanya.", kind: "explanation" },
];

export function getLearnSteps(slug: string): LearnStep[] {
  return slug === "penjumlahan-sampai-dengan-10" ? additionSteps : countingSteps;
}
