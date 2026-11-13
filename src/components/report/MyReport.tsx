"use client";

import { Copy, Link2, Link2Off, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReportData } from "@/lib/report";
import { ReportView } from "./ReportView";

const fmt = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });

/** Halaman laporan untuk akun sendiri, dengan tautan baca-saja untuk orang tua. */
export function MyReport() {
  const [data, setData] = useState<{ report: ReportData; link: { expiresAt: string } | null } | null>(null);
  const [state, setState] = useState<"loading" | "session" | "error" | "ok">("loading");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch("/api/laporan", { cache: "no-store" }).then(async r => { if (r.status === 401) return setState("session"); const j = await r.json(); if (!r.ok) return setState("error"); setData(j); setState("ok"); }).catch(() => setState("error"));
  }, []);
  async function act(action: "link" | "revoke") {
    setBusy(true);
    try {
      const j = (await (await fetch("/api/laporan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })).json()) as { code?: string; expiresAt?: string };
      if (action === "link" && j.code && j.expiresAt) { setUrl(`${window.location.origin}/laporan/${j.code}`); setData(d => d && { ...d, link: { expiresAt: j.expiresAt! } }); }
      if (action === "revoke") { setUrl(""); setData(d => d && { ...d, link: null }); }
    } finally { setBusy(false); }
  }
  if (state === "loading") return <p className="px-4 py-16 text-center text-base-content/60">Memuat laporan…</p>;
  if (state === "session") return <section className="mx-auto max-w-md px-4 py-16"><h1 className="text-2xl font-extrabold">Masuk untuk melihat laporan</h1><Link href="/masuk?lanjut=/akun/laporan" className="btn btn-success mt-4">Masuk</Link></section>;
  if (state === "error" || !data) return <p className="px-4 py-16 text-center text-error">Laporan belum dapat dimuat. Coba muat ulang halaman.</p>;
  const wa = url ? `https://wa.me/?text=${encodeURIComponent(`Laporan belajar ${data.report.name} di BeSmartKids: ${url}`)}` : "";
  return <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:py-12 print:p-0">
    <Link href="/akun" className="link link-hover text-sm text-success print:hidden">Kembali ke akun</Link>
    <section aria-labelledby="bagikan" className="rounded-md border border-base-300 bg-base-100 p-4 print:hidden">
      <h2 id="bagikan" className="font-bold">Bagikan ke orang tua</h2>
      <p className="mt-1 text-sm text-base-content/70">Tautan ini bisa dibuka tanpa username dan PIN, hanya untuk melihat laporan, dan berlaku 30 hari. Membuat tautan baru akan menonaktifkan tautan lama.</p>
      {url ? <div className="mt-3 space-y-2"><p className="break-all rounded bg-base-200 p-2 font-mono text-xs" data-testid="report-url">{url}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => navigator.clipboard?.writeText(url).then(() => setCopied(true))}><Copy className="size-4" aria-hidden="true" />{copied ? "Tersalin" : "Salin tautan"}</button>
          <a className="btn btn-sm btn-success gap-1" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" aria-hidden="true" />Kirim lewat WhatsApp</a>
        </div></div>
        : data.link ? <p className="mt-3 text-sm">Ada tautan aktif sampai {fmt(data.link.expiresAt)}. Tautannya hanya ditampilkan saat dibuat; buat tautan baru jika perlu mengirim ulang.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm btn-outline gap-1" disabled={busy} onClick={() => act("link")}><Link2 className="size-4" aria-hidden="true" />{data.link ? "Buat tautan baru" : "Buat tautan untuk orang tua"}</button>
        {data.link && <button type="button" className="btn btn-sm btn-ghost gap-1" disabled={busy} onClick={() => act("revoke")}><Link2Off className="size-4" aria-hidden="true" />Nonaktifkan tautan</button>}
      </div>
    </section>
    <ReportView data={data.report} />
  </div>;
}
