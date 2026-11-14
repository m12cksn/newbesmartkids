"use client";

import { BellRing, FileText, KeyRound, LogOut, RefreshCw, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { classes } from "@/components/home/home-data";
import { useAccess } from "./AccessProvider";
import { ResultHistory } from "./ResultHistory";
import { accessUrl } from "@/lib/packages";
import { daysLeft, SOON_DAYS, whenText } from "@/lib/renewal";

export const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-");

export function AccountPanel() {
  const { loading, session, refresh } = useAccess();
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function logout() { setBusy(true); await fetch("/api/keluar", { method: "POST" }).catch(() => null); await refresh(); router.push("/"); }
  if (loading) return <section className="mx-auto max-w-md px-4 py-16 text-center"><span className="loading loading-spinner text-success" aria-label="Memuat" /></section>;
  if (!session) return <section className="mx-auto max-w-md px-4 py-16"><h1 className="text-2xl font-extrabold">Anda belum masuk</h1><Link href="/masuk?lanjut=/akun" className="btn btn-success mt-4">Masuk</Link></section>;
  const opened = session.all || session.role === "admin" ? "Semua kelas" : session.classes.length ? classes.filter(c => session.classes.includes(c.id)).map(c => `Kelas ${c.id}`).join(", ") : "Belum ada paket aktif";
  return <section className="mx-auto max-w-3xl px-4 py-10 sm:py-16"><div className="max-w-md">
    <h1 className="text-3xl font-extrabold">Akun saya</h1>
    <dl className="mt-6 space-y-3 rounded-xl border border-base-300 bg-base-100 p-5 text-sm">
      <div><dt className="text-base-content/60">Nama</dt><dd className="font-bold">{session.displayName || "-"}</dd></div>
      <div><dt className="text-base-content/60">Username</dt><dd className="font-bold">{session.username}</dd></div>
      <div><dt className="text-base-content/60">Kelas yang terbuka</dt><dd className="font-bold">{opened}</dd></div>
      <div><dt className="text-base-content/60">Berlaku sampai</dt><dd className="font-bold">{session.role === "admin" ? "Admin" : fmtDate(session.expiresAt)}</dd></div>
    </dl>
    <RenewNotice expiresAt={session.role === "admin" ? undefined : session.expiresAt} username={session.username} />
    <p className="mt-3 text-xs text-base-content/60">Satu akun dapat dipakai di 2 perangkat. Jika masuk di perangkat ketiga, perangkat yang paling lama otomatis keluar.</p>
    <ChangePin />
    <div className="mt-5 flex flex-wrap gap-2">
      <Link href="/akun/laporan" className="btn btn-success gap-1"><FileText className="size-4" aria-hidden="true" />Laporan belajar</Link>
      {session.role === "admin" && <Link href="/admin" className="btn btn-outline gap-1"><Settings className="size-4" aria-hidden="true" />Kelola akun</Link>}
      <button type="button" className="btn btn-ghost gap-1" disabled={busy} onClick={logout}><LogOut className="size-4" aria-hidden="true" />Keluar</button>
    </div></div>
    <ResultHistory />
  </section>;
}

/** Pemberitahuan di Akun saya jika paket berakhir dalam 14 hari atau tidak ada paket aktif. */
function RenewNotice({ expiresAt, username }: { expiresAt: string | null | undefined; username: string }) {
  if (expiresAt === undefined) return null;
  const d = expiresAt ? daysLeft(expiresAt) : null;
  if (d !== null && d > SOON_DAYS) return null;
  const url = accessUrl(`Halo admin BeSmartKids, saya ingin memperpanjang paket untuk akun ${username}.`);
  return <div role="status" data-testid="renew-notice" className="mt-4 rounded-xl border-s-4 border-warning bg-warning/10 p-4 text-sm leading-6">
    <p className="flex items-center gap-2 font-bold"><BellRing className="size-4 text-warning" aria-hidden="true" />{d === null ? "Belum ada paket aktif" : `Paket berakhir ${whenText(d)}`}</p>
    <p className="mt-1">{d === null ? "Bab pertama setiap kelas tetap bisa dibuka, dan riwayat belajar tetap tersimpan. Perpanjang paket untuk membuka semua bab lagi." : "Perpanjang sebelum berakhir agar belajar tidak terputus. Masa aktif baru dihitung setelah paket lama habis."}</p>
    {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-success btn-sm mt-2 gap-1"><RefreshCw className="size-4" aria-hidden="true" />Perpanjang paket</a> : <p className="mt-1 text-base-content/70">Hubungi admin tempat Anda membeli paket.</p>}
    <p className="mt-2 text-xs text-base-content/60">Saat membayar, tulis username <strong>{username}</strong> agar paket ditambahkan ke akun ini.</p>
  </div>;
}

const pinMessages: Record<string, string> = {
  wrong: "PIN lama tidak cocok.", same: "PIN baru harus berbeda dari PIN lama.", format: "PIN terdiri dari 6 angka.",
  locked: "Terlalu banyak percobaan. Coba lagi 15 menit lagi.", session: "Sesi berakhir. Silakan masuk lagi.", server: "Sedang ada gangguan. Coba beberapa saat lagi.",
};
function ChangePin() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ old: "", pin: "", again: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const field = (k: "old" | "pin" | "again", label: string, auto: string) => <label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span>
    <input type="password" inputMode="numeric" autoComplete={auto} maxLength={6} required value={f[k]} onChange={e => setF(x => ({ ...x, [k]: e.target.value.replace(/\D/g, "").slice(0, 6) }))} className="input input-bordered w-full tracking-[0.3em]" /></label>;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (![f.old, f.pin].every(v => /^\d{6}$/.test(v))) return setMsg({ ok: false, text: pinMessages.format });
    if (f.pin !== f.again) return setMsg({ ok: false, text: "Ulangi PIN baru belum sama." });
    setBusy(true);
    try {
      const r = await fetch("/api/pin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ old: f.old, pin: f.pin }) });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      setMsg(j.ok ? { ok: true, text: "PIN berhasil diganti. Perangkat lain yang memakai akun ini sudah dikeluarkan." } : { ok: false, text: pinMessages[j.error ?? "server"] ?? pinMessages.server });
      if (j.ok) { setF({ old: "", pin: "", again: "" }); setOpen(false); }
    } catch { setMsg({ ok: false, text: pinMessages.server }); }
    setBusy(false);
  }
  return <div className="mt-5">
    {!open ? <button type="button" className="btn btn-outline gap-1" onClick={() => { setOpen(true); setMsg(null); }}><KeyRound className="size-4" aria-hidden="true" />Ganti PIN</button>
      : <form onSubmit={submit} aria-labelledby="ganti-pin" className="space-y-3 rounded-xl border border-base-300 bg-base-100 p-5">
        <h2 id="ganti-pin" className="text-lg font-bold">Ganti PIN</h2>
        {field("old", "PIN lama", "current-password")}{field("pin", "PIN baru", "new-password")}{field("again", "Ulangi PIN baru", "new-password")}
        <div className="flex gap-2"><button type="submit" className="btn btn-success" disabled={busy}>{busy ? "Menyimpan…" : "Simpan PIN baru"}</button><button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Batal</button></div>
      </form>}
    {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-error"}`}>{msg.text}</p>}
  </div>;
}
