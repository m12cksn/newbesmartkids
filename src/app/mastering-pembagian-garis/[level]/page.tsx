import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PembagianGarisMastering from "@/components/mastering/PembagianGarisMastering";
import { LEVELS } from "@/lib/daily-pembagian-garis";
export function generateStaticParams() { return LEVELS.map(l => ({ level: `level-${l.id}` })); }
export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const info = LEVELS.find(l => `level-${l.id}` === level);
  return { title: info ? `Mastering Pembagian Garis — Level ${info.id}` : "Level tidak ditemukan", description: "Peraga pembagian dengan mencoret dan mengikat garis, lalu tujuh soal pembagian. Paket baru setiap hari pukul 00.00 WIB." };
}
export default async function Page({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = LEVELS.find(l => `level-${l.id}` === level);
  if (!info) notFound();
  return <PembagianGarisMastering key={info.id} level={info.id} />;
}
