"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { classes } from "@/components/home/home-data";
import { useAccess } from "./AccessProvider";

export const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-");

export function AccountPanel() {
  const { loading, session, refresh } = useAccess();
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function logout() { setBusy(true); await fetch("/api/keluar", { method: "POST" }).catch(() => null); await refresh(); router.push("/"); }
  if (loading) return <section className="mx-auto max-w-md px-4 py-16 text-center"><span className="loading loading-spinner text-success" aria-label="Memuat" /></section>;
  if (!session) return <section className="mx-auto max-w-md px-4 py-16"><h1 className="text-2xl font-extrabold">Anda belum masuk</h1><Link href="/masuk?lanjut=/akun" className="btn btn-success mt-4">Masuk</Link></section>;
  const opened = session.all || session.role === "admin" ? "Semua kelas" : session.classes.length ? classes.filter(c => session.classes.includes(c.id)).map(c => `Kelas ${c.id}`).join(", ") : "Belum ada paket aktif";
  return <section className="mx-auto max-w-md px-4 py-10 sm:py-16">
    <h1 className="text-3xl font-extrabold">Akun saya</h1>
    <dl className="mt-6 space-y-3 rounded-xl border border-base-300 bg-base-100 p-5 text-sm">
      <div><dt className="text-base-content/60">Nama</dt><dd className="font-bold">{session.displayName || "-"}</dd></div>
      <div><dt className="text-base-content/60">Username</dt><dd className="font-bold">{session.username}</dd></div>
      <div><dt className="text-base-content/60">Kelas yang terbuka</dt><dd className="font-bold">{opened}</dd></div>
      <div><dt className="text-base-content/60">Berlaku sampai</dt><dd className="font-bold">{session.role === "admin" ? "Admin" : fmtDate(session.expiresAt)}</dd></div>
    </dl>
    <p className="mt-3 text-xs text-base-content/60">Satu akun dapat dipakai di 2 perangkat. Jika masuk di perangkat ketiga, perangkat yang paling lama otomatis keluar.</p>
    <div className="mt-5 flex flex-wrap gap-2">
      {session.role === "admin" && <Link href="/admin" className="btn btn-outline gap-1"><Settings className="size-4" aria-hidden="true" />Kelola akun</Link>}
      <button type="button" className="btn btn-ghost gap-1" disabled={busy} onClick={logout}><LogOut className="size-4" aria-hidden="true" />Keluar</button>
    </div>
  </section>;
}
