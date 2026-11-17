import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JarimatikaMastering from "@/components/mastering/JarimatikaMastering";
import { LEVELS } from "@/lib/daily-jarimatika";
export function generateStaticParams() { return LEVELS.map(l => ({ level: `level-${l.id}` })); }
export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const info = LEVELS.find(l => `level-${l.id}` === level);
  return { title: info ? `Mastering Jarimatika — Level ${info.id}` : "Level tidak ditemukan", description: "Peraga perkalian dengan jari dan tujuh soal jarimatika. Paket baru setiap hari pukul 00.00 WIB." };
}
export default async function Page({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const info = LEVELS.find(l => `level-${l.id}` === level);
  if (!info) notFound();
  return <JarimatikaMastering key={info.id} level={info.id} />;
}
