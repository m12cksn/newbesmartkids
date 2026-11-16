import type { Metadata } from "next";
import ColumnPractice from "@/components/mastering/ColumnPractice";

export const metadata: Metadata = {
  title: "Berhitung Bersusun",
  description: "Latihan tambah, kurang, kali, bagi, dan soal cerita bersusun untuk Kelas 2 sampai 6. Tujuh soal baru setiap hari pukul 00.00 WIB.",
};

export default function Page() {
  return <ColumnPractice />;
}
