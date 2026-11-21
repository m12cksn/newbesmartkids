"use client";

import { ExamRunner } from "@/components/exam/ExamRunner";
import { OptionArt, SceneView } from "./Art";
import { satKelas1 } from "./data";

export default function SatKelas1({ classSlug }: { classSlug: string }) {
  return <ExamRunner examKey="kelas-1-sat" title="Ujian Akhir Tahun (SAT) Kelas 1"
    subtitle="Soal dari delapan bab Kelas 1: membilang, penjumlahan, pengurangan, bentuk, bilangan sampai 20, panjang benda, dan diagram. Kerjakan sendiri, lalu lihat pembahasannya."
    questions={satKelas1} minutes={60} backHref={`/kelas/${classSlug}`} backLabel="Kembali ke Kelas 1"
    renderScene={s => <SceneView scene={s} />} renderOptionArt={a => <OptionArt art={a} />} />;
}
