import type { Metadata } from "next";
import { AdminAffiliatePanel } from "@/components/affiliate/AdminAffiliatePanel";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

export const metadata: Metadata = { title: "Affiliate", robots: { index: false } };

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><AdminAffiliatePanel /><SiteFooter /></main>;
}
