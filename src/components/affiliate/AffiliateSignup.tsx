"use client";

import { ArrowRight, Copy, LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccess } from "@/components/auth/AccessProvider";
import { affiliateErrors, WALLETS } from "@/lib/affiliate";

type Done = { username?: string; pin?: string; code: string };

/** Formulir daftar affiliate. Tanpa akun: membuat akun baru. Sudah masuk: mengaktifkan affiliate untuk akun itu. */
export function AffiliateSignup({ origin }: { origin: string }) {
  const { session, refresh } = useAccess();
  const [f, setF] = useState({ name: "", phone: "", walletType: "DANA", walletNumber: "", walletName: "", same: true, agree: false });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF(x => ({ ...x, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.agree) return setErr("Centang persetujuan ketentuan program terlebih dahulu.");
    setBusy(true); setErr(null);
    try {
      const body = { action: session ? "join" : "register", name: f.name, phone: f.phone, walletType: f.walletType, walletNumber: f.same ? f.phone : f.walletNumber, walletName: f.walletName || f.name };
      const r = await fetch("/api/affiliate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = (await r.json()) as { error?: string; username?: string; pin?: string; code?: string };
      if (j.error || !j.code) setErr(affiliateErrors[j.error ?? "server"] ?? affiliateErrors.server);
      else { setDone({ username: j.username, pin: j.pin, code: j.code }); await refresh(); }
    } catch { setErr(affiliateErrors.server); }
    setBusy(false);
  }

  if (done) {
    const link = `${origin}/r/${done.code}`;
    return <div role="status" className="space-y-4 rounded-2xl border-2 border-success bg-base-100 p-5 sm:p-6">
      <h3 className="text-xl font-extrabold">Pendaftaran berhasil</h3>
      <div className="space-y-1 text-sm"><p>Kode affiliate Anda: <strong data-testid="aff-code" className="text-lg tracking-wide text-success">{done.code}</strong></p>
        <p className="break-all">Link Anda: <strong data-testid="aff-link">{link}</strong></p></div>
      {done.username && <div className="rounded-xl bg-warning/10 p-4 text-sm leading-6">
        <p className="font-bold">Simpan data masuk ini</p>
        <p>Username <strong data-testid="aff-username">{done.username}</strong>, PIN <strong data-testid="aff-pin" className="tracking-widest">{done.pin}</strong></p>
        <p className="text-base-content/70">PIN hanya tampil sekali. Pakai untuk masuk dan melihat komisi Anda.</p></div>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={() => { void navigator.clipboard?.writeText(link); setCopied(true); }}><Copy className="size-4" aria-hidden="true" />{copied ? "Tersalin" : "Salin link"}</button>
        <Link href="/akun/affiliate" className="btn btn-success btn-sm gap-1">Buka dasbor affiliate<ArrowRight className="size-4" aria-hidden="true" /></Link>
      </div>
    </div>;
  }

  const input = "input input-bordered w-full";
  return <form onSubmit={submit} aria-labelledby="daftar-affiliate" className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6">
    <h3 id="daftar-affiliate" className="text-xl font-extrabold">{session ? "Aktifkan affiliate untuk akun ini" : "Daftar affiliate"}</h3>
    {session ? <p className="text-sm text-base-content/70">Anda masuk sebagai <strong>@{session.username}</strong>. Komisi akan tercatat di akun ini.</p>
      : <p className="text-sm text-base-content/70">Sudah punya akun BeSmartKids? <Link href="/masuk?lanjut=/affiliate%23daftar" className="inline-flex items-center gap-1 font-semibold text-success hover:underline"><LogIn className="size-4" aria-hidden="true" />Masuk dulu</Link> agar komisi tercatat di akun yang sama.</p>}
    <label className="block"><span className="mb-1 block text-sm font-semibold">Nama lengkap</span><input required autoComplete="name" className={input} value={f.name} onChange={e => set("name", e.target.value)} /></label>
    <label className="block"><span className="mb-1 block text-sm font-semibold">Nomor WhatsApp</span><input required inputMode="tel" autoComplete="tel" placeholder="08…" className={input} value={f.phone} onChange={e => set("phone", e.target.value)} /></label>
    <fieldset className="space-y-3 rounded-xl bg-base-200/60 p-4"><legend className="px-1 text-sm font-bold">E-wallet untuk pencairan komisi</legend>
      <label className="block"><span className="mb-1 block text-sm font-semibold">Jenis e-wallet</span>
        <select className="select select-bordered w-full" value={f.walletType} onChange={e => set("walletType", e.target.value)}>{WALLETS.map(w => <option key={w} value={w}>{w}</option>)}</select></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="checkbox checkbox-success checkbox-sm" checked={f.same} onChange={e => set("same", e.target.checked)} />Nomor e-wallet sama dengan nomor WhatsApp</label>
      {!f.same && <label className="block"><span className="mb-1 block text-sm font-semibold">Nomor e-wallet</span><input required inputMode="tel" className={input} value={f.walletNumber} onChange={e => set("walletNumber", e.target.value)} /></label>}
      <label className="block"><span className="mb-1 block text-sm font-semibold">Nama pemilik e-wallet</span><input className={input} placeholder="Kosongkan jika sama dengan nama lengkap" value={f.walletName} onChange={e => set("walletName", e.target.value)} /></label>
    </fieldset>
    <label className="flex items-start gap-2 text-sm leading-6"><input type="checkbox" className="checkbox checkbox-success checkbox-sm mt-1" checked={f.agree} onChange={e => set("agree", e.target.checked)} />Saya sudah membaca dan setuju dengan ketentuan program affiliate di halaman ini.</label>
    {err && <p role="alert" className="text-sm font-semibold text-error">{err}</p>}
    <button type="submit" className="btn btn-success w-full sm:w-auto" disabled={busy}>{busy ? "Mendaftarkan…" : session ? "Aktifkan affiliate" : "Daftar dan dapatkan link"}</button>
  </form>;
}
