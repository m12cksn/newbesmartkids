import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Masuk" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const safeNext = (v: unknown) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/");

async function Form({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const kelas = Number(sp.kelas);
  return <LoginForm next={safeNext(sp.lanjut)} reason={sp.alasan === "paket" || sp.alasan === "admin" || sp.alasan === "guru" ? sp.alasan : null} classId={Number.isInteger(kelas) && kelas > 0 ? kelas : null} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return <main data-theme="besmartkids" className="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10 text-base-content">
    <Suspense fallback={<section className="min-h-[28rem] w-full max-w-md rounded-3xl border border-base-300 bg-base-100" />}><Form searchParams={searchParams} /></Suspense>
  </main>;
}
