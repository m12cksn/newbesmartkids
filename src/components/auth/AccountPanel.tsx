"use client";

import { BellRing, BookOpenCheck, ChartNoAxesCombined, CircleCheck, FileText, KeyRound, LogOut, RefreshCw, Settings, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { classes } from "@/components/home/home-data";
import { ClassCardArt } from "@/components/home/ClassCardArt";
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
  const featuredClass = session.classes[0] || 1;
  return <section className="relative isolate overflow-hidden bg-base-200"><div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    <span className="account-math account-math-one">+</span><span className="account-math account-math-two">÷</span><span className="account-math account-math-three">π</span>
    <span className="account-grid" />
  </div><div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <div className="account-hero relative overflow-hidden rounded-[2rem] bg-[#d7f0e5] px-5 py-7 text-[#17352a] shadow-[0_12px_0_#9fd3bd,0_24px_60px_-28px_rgba(23,53,42,.45)] sm:px-8 sm:py-9 lg:px-12 lg:py-12">
      <svg className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 text-[#208f6d]/20 account-hero-orbit" viewBox="0 0 260 260" fill="none" aria-hidden="true"><circle cx="130" cy="130" r="92" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 9"/><circle cx="130" cy="130" r="56" stroke="currentColor" strokeWidth="1.5"/><path d="M38 130h184M130 38v184" stroke="currentColor" strokeWidth="1" opacity=".5"/><circle cx="190" cy="78" r="7" fill="#e8590c"/></svg>
      <div className="relative grid gap-9 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-success"><Sparkles className="size-4" aria-hidden="true" />Pusat belajar BeSmartKids</p>
          <h1 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">Halo, {session.displayName || session.username}!</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#17352a]/70 sm:text-lg">Lihat perjalanan belajarmu, lanjutkan latihan, dan temukan bagian yang masih perlu dikuatkan.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#kelas" className="btn btn-success shadow-lg shadow-success/20"><BookOpenCheck className="size-4" aria-hidden="true" />Lanjut belajar</Link>
            <Link href="/akun/laporan" className="btn btn-outline border-[#17352a]/25 bg-white/30 text-[#17352a] hover:border-[#17352a]/50 hover:bg-white/50"><ChartNoAxesCombined className="size-4" aria-hidden="true" />Lihat laporan</Link>
          </div>
        </div>
        <div className="relative grid gap-3 sm:gap-4">
          <div className="account-class-preview group"><ClassCardArt id={featuredClass} /><div className="flex items-center justify-between bg-white px-4 py-3"><div><p className="text-xs font-semibold text-base-content/55">Lanjutkan dari</p><p className="font-extrabold">Kelas {featuredClass}</p></div><span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">Mulai</span></div></div>
          <div className="grid grid-cols-2 gap-3"><div className="account-stat-card"><span className="account-stat-icon"><Target className="size-5" aria-hidden="true" /></span><span className="mt-3 block text-xl font-extrabold">{session.role === "admin" ? "Admin" : "Aktif"}</span><span className="mt-1 block text-xs text-[#17352a]/60">Status akun</span></div><div className="account-stat-card"><span className="account-stat-icon"><CircleCheck className="size-5" aria-hidden="true" /></span><span className="mt-3 block text-xl font-extrabold">{session.all ? "Semua" : session.classes.length || 0}</span><span className="mt-1 block text-xs text-[#17352a]/60">Kelas terbuka</span></div></div>
        </div>
      </div>
    </div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <div className="account-info-panel">
        <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-base-content/55">Profil belajar</p><p className="mt-1 text-lg font-extrabold">{session.displayName || "Nama belum diatur"}</p><p className="text-sm text-base-content/65">@{session.username}</p></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-sm text-base-content/60">Kelas yang terbuka</p><p className="mt-1 break-words font-bold">{opened}</p></div><div><p className="text-sm text-base-content/60">Berlaku sampai</p><p className="mt-1 font-bold">{session.role === "admin" ? "Admin" : fmtDate(session.expiresAt)}</p></div></div>
      </div>
      <div className="account-tip-panel"><div className="flex items-start gap-3"><span className="rounded-2xl bg-warning/20 p-2.5 text-warning-content"><Sparkles className="size-5" aria-hidden="true" /></span><div><p className="font-bold">Belajar sedikit demi sedikit</p><p className="mt-1 text-sm leading-6 text-base-content/70">Selesaikan satu latihan hari ini untuk menjaga ritme belajarmu.</p></div></div></div>
    </div>
    <RenewNotice expiresAt={session.role === "admin" ? undefined : session.expiresAt} username={session.username} />
    <p className="mt-4 text-sm text-base-content/60">Butuh bantuan memakai BeSmartKids? <Link href="/panduan" className="font-semibold text-success hover:underline">Lihat panduan</Link>. Satu akun dapat dipakai di 2 perangkat. Jika masuk di perangkat ketiga, perangkat yang paling lama otomatis keluar.</p>
    <ChangePin />
    <div className="mt-5 flex flex-wrap gap-2 border-b border-base-300 pb-8">
      <Link href="/akun/laporan" className="btn btn-success gap-1"><FileText className="size-4" aria-hidden="true" />Laporan belajar</Link>
      {session.role === "admin" && <Link href="/admin" className="btn btn-outline gap-1"><Settings className="size-4" aria-hidden="true" />Kelola akun</Link>}
      <button type="button" className="btn btn-ghost gap-1" disabled={busy} onClick={logout}><LogOut className="size-4" aria-hidden="true" />Keluar</button>
    </div>
    <ResultHistory />
    </div></section>;
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
