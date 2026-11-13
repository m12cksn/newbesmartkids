import type { Metadata } from "next";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { TeacherPanel } from "@/components/teacher/TeacherPanel";

export const metadata: Metadata = { title: "Rekap kelas", robots: { index: false } };

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content print:bg-white"><div className="print:hidden"><SiteHeader /></div><TeacherPanel /><div className="print:hidden"><SiteFooter /></div></main>;
}
