"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAccess } from "./AccessProvider";

const messages: Record<string, string> = {
  invalid: "Username atau PIN tidak cocok. Periksa lagi pesan yang Anda terima.",
  locked: "Terlalu banyak percobaan. Coba lagi 15 menit lagi.",
  server: "Sedang ada gangguan. Coba beberapa saat lagi.",
  disabled: "Login belum aktif di server ini.",
};

export function LoginForm({ next, reason, classId }: { next: string; reason: "paket" | "admin" | null; classId: number | null }) {
  const { refresh } = useAccess();
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
      await refresh();
      window.location.assign(next);
    } catch { setError(messages.server); setBusy(false); }
  }
  return <section className="mx-auto max-w-md px-4 py-10 sm:py-16">
    <h1 className="text-3xl font-extrabold">Masuk ke BeSmartKids</h1>
    <p className="mt-2 text-sm leading-6 text-base-content/70">Gunakan username dan PIN 6 angka yang Anda terima setelah membeli paket.</p>
    {reason === "paket" && <p role="alert" className="mt-4 rounded-lg bg-warning/15 p-3 text-sm">Akun Anda belum memiliki paket {classId ? `Kelas ${classId}` : "untuk halaman ini"}. Hubungi admin tempat Anda membeli untuk menambah paket, atau masuk dengan akun lain.</p>}
    {reason === "admin" && <p role="alert" className="mt-4 rounded-lg bg-warning/15 p-3 text-sm">Halaman ini hanya untuk admin.</p>}
    {reason === null && classId && <p className="mt-4 rounded-lg bg-info/10 p-3 text-sm">Bab ini termasuk paket Kelas {classId}. Bab pertama setiap kelas dapat dicoba tanpa akun.</p>}
    <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-base-300 bg-base-100 p-5">
      <label className="block"><span className="mb-1 block text-sm font-bold">Username</span>
        <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))} className="input input-bordered w-full" /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">PIN</span>
        <input name="pin" type="password" inputMode="numeric" autoComplete="current-password" maxLength={6} required value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} className="input input-bordered w-full tracking-[0.4em]" /></label>
      {error && <p role="alert" className="text-sm font-semibold text-error">{error}</p>}
      <button type="submit" className="btn btn-success w-full gap-1" disabled={busy}><LogIn className="size-4" aria-hidden="true" />{busy ? "Memeriksa…" : "Masuk"}</button>
    </form>
    <p className="mt-4 text-sm text-base-content/70">Belum punya akun? Bab pertama setiap kelas bisa dicoba gratis. <Link href="/#kelas" className="link text-success">Lihat kelas</Link></p>
  </section>;
}
