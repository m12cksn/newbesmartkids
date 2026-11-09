import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DailyMastering from '@/components/mastering/DailyMastering';
import { LEVELS } from '@/lib/daily-arithmetic';
export function generateStaticParams(){return LEVELS.map(l=>({level:`level-${l.id}`}));}
export async function generateMetadata({params}:{params:Promise<{level:string}>}):Promise<Metadata>{
  const {level}=await params;
  const info=LEVELS.find(l=>`level-${l.id}`===level);
  return {title:info?`Mastering Perkalian & Pembagian — Level ${info.id}`:'Level tidak ditemukan',description:'Tujuh soal perkalian, pembagian, dan angka yang hilang. Paket baru setiap hari pukul 00.00 WIB.'};
}
export default async function Page({params}:{params:Promise<{level:string}>}){
  const {level}=await params;
  const info=LEVELS.find(l=>`level-${l.id}`===level);
  if(!info)notFound();
  return <DailyMastering key={info.id} level={info.id}/>;
}
