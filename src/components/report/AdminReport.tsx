"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReportData } from "@/lib/report";
import { ReportView } from "./ReportView";

/** Admin melihat laporan seorang siswa (misalnya sebelum mengirim kabar ke orang tua). */
export function AdminReport({ id }: { id: string }) {
  const [data, setData] = useState<ReportData | null>(null);
  const [state, setState] = useState<"loading" | "error" | "ok">("loading");
  useEffect(() => {
    fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "report", account: id }) })
      .then(async r => { const j = await r.json(); if (!r.ok || !j) return setState("error"); setData(j as ReportData); setState("ok"); }).catch(() => setState("error"));
  }, [id]);
  return <div className="mx-auto max-w-4xl space-y-4 px-4 py-8 print:p-0">
    <Link href="/admin" className="link link-hover text-sm text-success print:hidden">Kembali ke kelola akun</Link>
    {state === "loading" ? <p className="text-base-content/60">Memuat laporan…</p> : state === "error" || !data ? <p className="text-error">Laporan belum dapat dimuat.</p> : <ReportView data={data} />}
  </div>;
}
