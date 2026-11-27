import type { ComponentType } from "react";
import SatKelas1 from "./kelas-1-sat/Exam";

/** Ujian Akhir Tahun (SAT) yang sudah tersedia, per nomor kelas. Tambahkan satu baris per kelas baru. */
export const satExams: Record<number, { title: string; questions: number; minutes: number; Component: ComponentType<{ classSlug: string }> }> = {
  1: { title: "Ujian Akhir Tahun (SAT) Kelas 1", questions: 25, minutes: 60, Component: SatKelas1 },
};
export const SAT_SLUG = "ujian-akhir-tahun";
