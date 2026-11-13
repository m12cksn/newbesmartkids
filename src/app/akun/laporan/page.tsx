import type { Metadata } from "next";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { MyReport } from "@/components/report/MyReport";

export const metadata: Metadata = { title: "Laporan belajar", robots: { index: false } };

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content print:bg-white"><div className="print:hidden"><SiteHeader /></div><MyReport /><div className="print:hidden"><SiteFooter /></div></main>;
}
