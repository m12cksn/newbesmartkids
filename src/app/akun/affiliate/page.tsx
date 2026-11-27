import type { Metadata } from "next";
import { AffiliateDashboard } from "@/components/affiliate/AffiliateDashboard";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Dasbor affiliate", robots: { index: false } };

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><AffiliateDashboard origin={SITE_URL} /><SiteFooter /></main>;
}
