import type { Metadata } from "next";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { AccountPanel } from "@/components/auth/AccountPanel";

export const metadata: Metadata = { title: "Akun saya" };

export default function Page() {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><AccountPanel /><SiteFooter /></main>;
}
