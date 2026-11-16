import type { Metadata } from "next";
import { ParentLanding } from "@/components/landing/ParentLanding";

export const metadata: Metadata = {
  title: "Paket Belajar Matematika Kelas 1–12",
  description: "Peraga interaktif, latihan bertahap, evaluasi 24 soal per bab, dan laporan belajar untuk orang tua. Sekali bayar, tanpa memasang aplikasi.",
};

export default function Page() {
  return <ParentLanding />;
}
