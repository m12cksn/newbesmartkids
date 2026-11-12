import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Masuk" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const safeNext = (v: unknown) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/");

async function Form({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const kelas = Number(sp.kelas);
  return <LoginForm next={safeNext(sp.lanjut)} reason={sp.alasan === "paket" || sp.alasan === "admin" ? sp.alasan : null} classId={Number.isInteger(kelas) && kelas > 0 ? kelas : null} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content">
    <SiteHeader />
    <Suspense fallback={<section className="mx-auto min-h-96 max-w-md px-4 py-16" />}><Form searchParams={searchParams} /></Suspense>
    <SiteFooter />
  </main>;
}
