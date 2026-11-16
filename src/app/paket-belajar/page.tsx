import type { Metadata } from "next";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { ParentLanding } from "@/components/landing/ParentLanding";

export const metadata: Metadata = {
  title: "Paket Belajar Matematika Kelas 1–12",
  description: "Peraga interaktif, latihan bertahap, evaluasi 24 soal per bab, dan laporan belajar untuk orang tua. Sekali bayar, tanpa memasang aplikasi.",
};

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-100 text-base-content">
    <SiteHeader />
    <ParentLanding />
    <SiteFooter />
  </main>;
}
