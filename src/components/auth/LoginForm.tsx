"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/home/BrandMark";
import { accessUrl } from "@/lib/packages";

const messages: Record<string, string> = {
  invalid: "Username atau PIN tidak cocok. Periksa lagi pesan yang Anda terima.",
  locked: "Terlalu banyak percobaan. Coba lagi 15 menit lagi.",
  server: "Sedang ada gangguan. Coba beberapa saat lagi.",
  disabled: "Login belum aktif di server ini.",
};

export function LoginForm({ next, reason, classId }: { next: string; reason: "paket" | "admin" | null; classId: number | null }) {
  // Bangunkan server login selagi pengguna mengetik, agar tombol Masuk tidak menunggu server menyala.
  useEffect(() => { fetch("/api/masuk", { method: "GET", cache: "no-store" }).catch(() => {}); }, []);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) { setError("PIN terdiri dari 6 angka."); return; }
    setBusy(true); setError(null);
    try {
      const r = await fetch("/api/masuk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, pin }) });
      const j = (await r.json()) as { ok?: boolean; error?: string };
      if (!j.ok) { setError(messages[j.error ?? "invalid"] ?? messages.invalid); setBusy(false); return; }
      // Halaman tujuan dimuat ulang penuh, jadi data sesi diambil di sana; tidak perlu menunggu permintaan tambahan.
      window.location.assign(next);
    } catch { setError(messages.server); setBusy(false); }
  }
  const field = "h-12 w-full rounded-xl border border-transparent bg-[#e8f0fe] px-4 text-base text-neutral outline-none focus:border-success focus:ring-2 focus:ring-success/30";
  return <section className="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 px-6 py-8 shadow-lg shadow-success/5 sm:px-8">
    <div className="flex flex-col items-center text-center">
      <Link href="/" aria-label="Beranda BeSmartKids"><BrandMark /></Link>
      <p className="mt-4 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">BIMBEL KIDS ONLINE</p>
      <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Halo, Ayo Belajar!</h1>
      <p className="mt-2 text-sm text-base-content/70">Masuk dengan username dan PIN dari admin.</p>
    </div>
    {reason === "paket" && <p role="alert" className="mt-5 rounded-xl bg-warning/15 p-3 text-sm">Akun Anda belum memiliki paket {classId ? `Kelas ${classId}` : "untuk halaman ini"}. <a href={accessUrl()} target="_blank" rel="noopener noreferrer" className="link font-semibold">Dapatkan akses</a> untuk kelas ini, atau masuk dengan akun lain.</p>}
    {reason === "admin" && <p role="alert" className="mt-5 rounded-xl bg-warning/15 p-3 text-sm">Halaman ini hanya untuk admin.</p>}
    {reason === null && classId && <p className="mt-5 rounded-xl bg-info/10 p-3 text-sm">Bab ini termasuk paket Kelas {classId}. Bab pertama setiap kelas dapat dicoba tanpa akun.</p>}
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="login-username" className="mb-1.5 block text-sm font-semibold">Username</label>
        <input id="login-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} aria-describedby="login-username-help" className={field} />
        <p id="login-username-help" className="mt-1.5 text-xs text-base-content/60">Username dan PIN ada di pesan WhatsApp dari admin.</p>
      </div>
      <div>
        <label htmlFor="login-pin" className="mb-1.5 block text-sm font-semibold">PIN</label>
        <input id="login-pin" name="pin" type="password" inputMode="numeric" autoComplete="current-password" maxLength={6} required value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} className={`${field} tracking-[0.3em]`} />
      </div>
      {error && <p role="alert" className="text-sm font-semibold text-error">{error}</p>}
      <button type="submit" className="btn btn-success h-12 w-full rounded-xl text-base" disabled={busy}>{busy ? "Memeriksa…" : "Masuk Sekarang"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-base-content/70">Belum punya akun? <a href={accessUrl()} target="_blank" rel="noopener noreferrer" className="link text-success">Dapatkan akses</a>, lalu username dan PIN dikirim lewat WhatsApp. Bab pertama setiap kelas bisa <Link href="/#kelas" className="link text-success">dicoba gratis</Link>.</p>
  </section>;
}
