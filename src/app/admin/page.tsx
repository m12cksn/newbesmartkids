import type { Metadata } from "next";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { AdminPanel } from "@/components/auth/AdminPanel";

export const metadata: Metadata = { title: "Kelola akun", robots: { index: false } };

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><AdminPanel /><SiteFooter /></main>;
}
