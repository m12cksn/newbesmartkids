import type { Metadata } from "next";
import { Suspense } from "react";
import { TeacherReport } from "@/components/teacher/TeacherReport";

export const metadata: Metadata = { title: "Laporan siswa", robots: { index: false } };

async function Body({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherReport id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content print:bg-white"><Suspense fallback={null}><Body params={params} /></Suspense></main>;
}
