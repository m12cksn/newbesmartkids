"use client";

import { Check, MessageCircle, RefreshCw, UserCheck, UserX, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fmtDate } from "@/components/auth/AccountPanel";
import { rupiah, type AffiliateSummary } from "@/lib/affiliate";

type Row = AffiliateSummary & { id: string; username: string };
type Payout = { id: string; amount: number; wallet: string; status: "requested" | "paid" | "rejected"; note: string; requestedAt: string; decidedAt: string | null; code: string; fullName: string; phone: string };
type Data = { affiliates: Row[]; payouts: Payout[]; lastSync: string | null };

async function admin<T>(body: Record<string, unknown>) {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(j.error ?? "server"); return j as T;
}
const syncErrors: Record<string, string> = { not_configured: "Kunci API Scalev belum diatur di Vercel (SCALEV_API_KEY).", not_admin: "Sesi admin berakhir.", server: "Sinkronisasi gagal. Coba lagi." };

export function AdminAffiliatePanel() {
  const [d, setD] = useState<Data | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { setD(await admin<Data>({ action: "affiliates" })); } catch { setMsg("Data affiliate gagal dimuat."); } }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  async function run(fn: () => Promise<void>) { setBusy(true); try { await fn(); } catch { setMsg("Perintah gagal. Coba lagi."); } setBusy(false); }

  async function sync() { await run(async () => {
    const r = await fetch("/api/affiliate/sync", { method: "POST" }); const j = (await r.json()) as { error?: string; checked?: number; new?: number; void?: number };
    if (j.error) setMsg(syncErrors[j.error] ?? (j.error.startsWith("scalev_") ? `Scalev menolak permintaan (${j.error.slice(7)}). Periksa kunci API.` : syncErrors.server));
    else setMsg(`Sinkron selesai: ${j.checked ?? 0} pesanan affiliate diperiksa, ${j.new ?? 0} komisi baru, ${j.void ?? 0} dibatalkan.`);
    await load(); }); }
  const decide = (p: Payout, status: "paid" | "rejected") => run(async () => {
    const note = status === "rejected" ? prompt("Alasan penolakan (akan terlihat oleh affiliate):", "") : prompt("Catatan pembayaran, misalnya nomor referensi transfer (boleh kosong):", "");
    if (note === null) return; setD(await admin<Data>({ action: "payout", payout: p.id, status, note })); });
  const toggle = (a: Row) => run(async () => setD(await admin<Data>({ action: "affiliateStatus", account: a.id, status: a.status === "active" ? "blocked" : "active" })));

  const open = d?.payouts.filter(p => p.status === "requested") ?? [];
  const done = d?.payouts.filter(p => p.status !== "requested") ?? [];
  const wa = (p: string) => `https://wa.me/${p.replace(/\D/g, "")}`;
  return <section className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
    <div><h1 className="text-3xl font-extrabold">Affiliate</h1>
      <p className="mt-1 text-sm text-base-content/70">Komisi 16% tercatat otomatis dari pesanan Scalev yang lunas lewat link affiliate. Kirim pencairan ke e-wallet, lalu tandai sudah dibayar. <Link href="/admin" className="font-semibold text-success hover:underline">Kembali ke kelola akun</Link></p></div>
    <div className="flex flex-wrap items-center gap-3"><button type="button" className="btn btn-success btn-sm gap-1" disabled={busy} onClick={sync}><RefreshCw className="size-4" aria-hidden="true" />Sinkronkan pesanan Scalev</button>
      <span className="text-xs text-base-content/60">{d?.lastSync ? `Terakhir: ${new Date(d.lastSync).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}` : "Belum pernah disinkronkan"}</span></div>
    {msg && <p role="status" className="rounded-lg bg-base-100 p-3 text-sm font-semibold">{msg}</p>}

    <div className="space-y-3"><h2 className="text-xl font-bold">Pengajuan pencairan <span className="text-base font-normal text-base-content/60">({open.length})</span></h2>
      {open.length === 0 ? <p className="text-sm text-base-content/60">Tidak ada pengajuan yang menunggu.</p> : <ul className="space-y-2">{open.map(p => <li key={p.id} data-testid="payout-request" className="flex flex-col gap-3 rounded-xl border border-warning/50 bg-base-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-bold">{p.fullName} <span className="font-normal text-base-content/60">{p.code}</span></p><p className="text-lg font-extrabold text-success">{rupiah(p.amount)}</p><p className="text-sm">{p.wallet}</p><p className="text-xs text-base-content/60">Diajukan {fmtDate(p.requestedAt)}</p></div>
        <div className="flex flex-wrap gap-1"><a className="btn btn-xs btn-outline gap-1" href={wa(p.phone)} target="_blank" rel="noreferrer"><MessageCircle className="size-3.5" aria-hidden="true" />WhatsApp</a>
          <button type="button" className="btn btn-xs btn-success gap-1" disabled={busy} onClick={() => decide(p, "paid")}><Check className="size-3.5" aria-hidden="true" />Sudah dibayar</button>
          <button type="button" className="btn btn-xs btn-outline gap-1" disabled={busy} onClick={() => decide(p, "rejected")}><X className="size-3.5" aria-hidden="true" />Tolak</button></div></li>)}</ul>}
    </div>

    <div className="space-y-3"><h2 className="text-xl font-bold">Daftar affiliate <span className="text-base font-normal text-base-content/60">({d?.affiliates.length ?? 0})</span></h2>
      {!d ? <span className="loading loading-spinner text-success" aria-label="Memuat" /> : d.affiliates.length === 0 ? <p className="text-sm text-base-content/60">Belum ada affiliate.</p> :
        <div className="overflow-x-auto rounded-xl bg-base-100"><table className="table table-sm"><thead><tr><th>Affiliate</th><th>E-wallet</th><th className="text-right">Klik</th><th className="text-right">Jual</th><th className="text-right">Tertahan</th><th className="text-right">Siap cair</th><th className="text-right">Dibayar</th><th /></tr></thead>
          <tbody>{d.affiliates.map(a => <tr key={a.id} data-testid="affiliate-row" className={a.status === "blocked" ? "opacity-60" : ""}>
            <td><p className="font-bold">{a.code}</p><p className="text-xs">{a.fullName}, @{a.username}</p><a className="text-xs text-success hover:underline" href={wa(a.phone)} target="_blank" rel="noreferrer">{a.phone}</a></td>
            <td className="text-xs">{a.walletType} {a.walletNumber}<br />a.n. {a.walletName}</td>
            <td className="text-right">{a.clicks}</td><td className="text-right">{a.sales}</td><td className="text-right">{rupiah(a.held)}</td><td className="text-right">{rupiah(a.available)}</td><td className="text-right">{rupiah(a.paid)}</td>
            <td><button type="button" className="btn btn-xs btn-ghost gap-1" disabled={busy} onClick={() => toggle(a)}>{a.status === "active" ? <><UserX className="size-3.5" aria-hidden="true" />Nonaktifkan</> : <><UserCheck className="size-3.5" aria-hidden="true" />Aktifkan</>}</button></td></tr>)}</tbody></table></div>}
    </div>

    {done.length > 0 && <details className="rounded-xl bg-base-100 p-4"><summary className="cursor-pointer font-bold">Riwayat pencairan ({done.length})</summary>
      <ul className="mt-3 divide-y divide-base-200 text-sm">{done.map(p => <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2"><span>{fmtDate(p.decidedAt ?? p.requestedAt)}, {p.code}, {rupiah(p.amount)}</span><span className="font-semibold">{p.status === "paid" ? "Dibayar" : "Ditolak"}{p.note ? `: ${p.note}` : ""}</span></li>)}</ul></details>}
  </section>;
}
