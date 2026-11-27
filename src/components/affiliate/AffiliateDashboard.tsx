"use client";

import { Copy, MessageCircle, Pencil, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccess } from "@/components/auth/AccessProvider";
import { fmtDate } from "@/components/auth/AccountPanel";
import { AffiliateSignup } from "./AffiliateSignup";
import { AFF_HOLD_DAYS, AFF_MIN_PAYOUT, affiliateErrors, rupiah, shareText, WALLETS, type AffiliateDetail, type AffiliateMe } from "@/lib/affiliate";

const stateLabel: Record<string, string> = { held: "Tertahan", available: "Siap cair", payout: "Dicairkan", void: "Batal" };
const payoutLabel: Record<string, string> = { requested: "Diproses", paid: "Sudah dikirim", rejected: "Ditolak" };

async function post<T>(body: Record<string, unknown>) {
  const r = await fetch("/api/affiliate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return (await r.json()) as T & { error?: string };
}

export function AffiliateDashboard({ origin }: { origin: string }) {
  const { loading, session } = useAccess();
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [editWallet, setEditWallet] = useState(false);
  const [w, setW] = useState({ walletType: "DANA", walletNumber: "", walletName: "" });

  const load = useCallback(async () => {
    try { const r = await fetch("/api/affiliate", { cache: "no-store" }); const j = (await r.json()) as AffiliateMe & { error?: string }; if (j.error) setErr(affiliateErrors[j.error] ?? affiliateErrors.server); else { setMe(j); setErr(null); } }
    catch { setErr(affiliateErrors.server); }
  }, []);
  useEffect(() => { if (session) void Promise.resolve().then(load); }, [session, load]);

  if (loading) return <Shell><span className="loading loading-spinner text-success" aria-label="Memuat" /></Shell>;
  if (!session) return <Shell><h1 className="text-2xl font-extrabold">Masuk untuk melihat dasbor affiliate</h1>
    <p className="mt-2 text-base-content/70">Belum terdaftar? <Link href="/affiliate" className="font-semibold text-success hover:underline">Daftar affiliate</Link>.</p>
    <Link href="/masuk?lanjut=/akun/affiliate" className="btn btn-success mt-4">Masuk</Link></Shell>;
  if (err && !me) return <Shell><p role="alert" className="font-semibold text-error">{err}</p></Shell>;
  if (!me) return <Shell><span className="loading loading-spinner text-success" aria-label="Memuat" /></Shell>;
  if ("none" in me) return <Shell><h1 className="text-2xl font-extrabold">Program affiliate</h1>
    <p className="mt-2 max-w-xl text-base-content/70">Akun ini belum terdaftar sebagai affiliate. Aktifkan sekarang untuk mendapat link pribadi dan komisi sampai Rp34.900 dari setiap paket yang terjual. <Link href="/affiliate" className="font-semibold text-success hover:underline">Baca ketentuannya</Link>.</p>
    <div className="mt-6 max-w-lg"><AffiliateSignup origin={origin} /></div></Shell>;

  const a: AffiliateDetail = me;
  const link = `${origin}/r/${a.code}`;
  const text = shareText(link);
  const canWithdraw = a.status === "active" && a.available >= AFF_MIN_PAYOUT && a.requested === 0;
  const copy = (k: string, v: string) => { void navigator.clipboard?.writeText(v); setCopied(k); };
  async function withdraw() {
    if (!confirm(`Ajukan pencairan ${rupiah(a.available)} ke ${a.walletType} ${a.walletNumber} a.n. ${a.walletName}?`)) return;
    setBusy(true); const r = await post<AffiliateDetail>({ action: "withdraw" }).catch(() => ({ error: "server" } as { error: string }));
    if (r.error) setMsg(affiliateErrors[r.error] ?? affiliateErrors.server); else { setMe(r as AffiliateDetail); setMsg("Pengajuan pencairan terkirim. Admin akan mengirim ke e-wallet Anda."); }
    setBusy(false);
  }
  async function saveWallet(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const r = await post<AffiliateDetail>({ action: "wallet", ...w }).catch(() => ({ error: "server" } as { error: string }));
    if (r.error) setMsg(affiliateErrors[r.error] ?? affiliateErrors.server); else { setMe(r as AffiliateDetail); setEditWallet(false); setMsg("Data e-wallet tersimpan."); }
    setBusy(false);
  }

  const stats = [
    { label: "Klik 30 hari", value: String(a.clicks30) }, { label: "Penjualan", value: String(a.sales) },
    { label: `Tertahan (${AFF_HOLD_DAYS} hari)`, value: rupiah(a.held), id: "held" }, { label: "Siap dicairkan", value: rupiah(a.available), id: "available" },
    { label: "Sudah dikirim", value: rupiah(a.paid) },
  ];
  return <Shell>
    <h1 className="text-3xl font-extrabold">Dasbor affiliate</h1>
    <p className="mt-1 text-base-content/70">Halo, {a.fullName}. Kode Anda <strong data-testid="dash-code" className="text-success">{a.code}</strong>.{a.status === "blocked" && <span className="ms-2 font-semibold text-error">Akun affiliate sedang dinonaktifkan.</span>}</p>

    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{stats.map(s => <div key={s.label} className="rounded-xl bg-base-100 p-4"><dt className="text-xs text-base-content/60">{s.label}</dt><dd data-testid={s.id ? `stat-${s.id}` : undefined} className="mt-1 text-lg font-extrabold">{s.value}</dd></div>)}</dl>

    <section aria-labelledby="link-saya" className="mt-6 rounded-2xl bg-base-100 p-5">
      <h2 id="link-saya" className="text-lg font-bold">Link Anda</h2>
      <p className="mt-2 break-all rounded-lg bg-base-200 px-3 py-2 font-mono text-sm" data-testid="dash-link">{link}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-success btn-sm gap-1" onClick={() => copy("link", link)}><Copy className="size-4" aria-hidden="true" />{copied === "link" ? "Tersalin" : "Salin link"}</button>
        <button type="button" className="btn btn-outline btn-sm gap-1" onClick={() => copy("text", text)}><Copy className="size-4" aria-hidden="true" />{copied === "text" ? "Tersalin" : "Salin teks promosi"}</button>
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm gap-1"><MessageCircle className="size-4" aria-hidden="true" />Bagikan lewat WhatsApp</a>
      </div>
      <details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold">Lihat teks promosi</summary><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-base-200 p-3 text-xs [overflow-wrap:anywhere]">{text}</pre></details>
    </section>

    <section aria-labelledby="pencairan" className="mt-6 rounded-2xl bg-base-100 p-5">
      <h2 id="pencairan" className="text-lg font-bold">Pencairan komisi</h2>
      <p className="mt-1 text-sm leading-6 text-base-content/70">Komisi siap cair {AFF_HOLD_DAYS} hari setelah pesanan lunas. Ajukan pencairan saat mencapai {rupiah(AFF_MIN_PAYOUT)}. Dikirim ke <strong>{a.walletType} {a.walletNumber}</strong> a.n. {a.walletName}.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-success btn-sm gap-1" disabled={!canWithdraw || busy} onClick={withdraw}><Wallet className="size-4" aria-hidden="true" />Cairkan {rupiah(a.available)}</button>
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => { setEditWallet(v => !v); setW({ walletType: a.walletType, walletNumber: a.walletNumber, walletName: a.walletName }); }}><Pencil className="size-4" aria-hidden="true" />Ubah e-wallet</button>
      </div>
      {!canWithdraw && <p className="mt-2 text-xs text-base-content/60">{a.requested > 0 ? `Pengajuan ${rupiah(a.requested)} sedang diproses admin.` : `Kurang ${rupiah(Math.max(0, AFF_MIN_PAYOUT - a.available))} lagi untuk bisa dicairkan.`}</p>}
      {editWallet && <form onSubmit={saveWallet} className="mt-3 grid gap-3 rounded-lg bg-base-200/60 p-3 sm:grid-cols-3">
        <label className="block"><span className="mb-1 block text-sm font-semibold">E-wallet</span><select className="select select-bordered select-sm w-full" value={w.walletType} onChange={e => setW(x => ({ ...x, walletType: e.target.value }))}>{WALLETS.map(x => <option key={x}>{x}</option>)}</select></label>
        <label className="block"><span className="mb-1 block text-sm font-semibold">Nomor</span><input required inputMode="tel" className="input input-bordered input-sm w-full" value={w.walletNumber} onChange={e => setW(x => ({ ...x, walletNumber: e.target.value }))} /></label>
        <label className="block"><span className="mb-1 block text-sm font-semibold">Nama pemilik</span><input required className="input input-bordered input-sm w-full" value={w.walletName} onChange={e => setW(x => ({ ...x, walletName: e.target.value }))} /></label>
        <div className="flex gap-2 sm:col-span-3"><button type="submit" className="btn btn-success btn-sm" disabled={busy}>Simpan</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditWallet(false)}>Batal</button></div>
      </form>}
      {msg && <p role="status" className="mt-3 text-sm font-semibold">{msg}</p>}
      {a.payouts.length > 0 && <ul className="mt-4 divide-y divide-base-200 text-sm">{a.payouts.map(p => <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2"><span>{fmtDate(p.requestedAt)}, {rupiah(p.amount)}</span><span className="font-semibold">{payoutLabel[p.status]}{p.note ? `: ${p.note}` : ""}</span></li>)}</ul>}
    </section>

    <section aria-labelledby="riwayat" className="mt-6 rounded-2xl bg-base-100 p-5">
      <h2 id="riwayat" className="text-lg font-bold">Riwayat penjualan</h2>
      <p className="mt-1 text-xs text-base-content/60">Data pesanan diperbarui otomatis.{a.lastSync ? ` Terakhir: ${new Date(a.lastSync).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}.` : ""}</p>
      {a.commissions.length === 0 ? <p className="mt-3 text-sm">Belum ada penjualan. Mulai bagikan link Anda.</p> :
        <div className="mt-3 overflow-x-auto"><table className="table table-sm"><thead><tr><th>Tanggal lunas</th><th className="text-right">Dibayar</th><th className="text-right">Komisi</th><th>Status</th></tr></thead>
          <tbody>{a.commissions.map(c => <tr key={c.orderId + c.paidAt} data-testid="commission-row"><td>{fmtDate(c.paidAt)}</td><td className="text-right">{rupiah(c.orderAmount)}</td><td className="text-right font-semibold">{rupiah(c.amount)}</td>
            <td>{stateLabel[c.state]}{c.state === "held" && <span className="block text-xs text-base-content/60">cair {fmtDate(c.availableAt)}</span>}</td></tr>)}</tbody></table></div>}
    </section>
    <div className="mt-6 flex flex-wrap gap-4 text-sm"><Link href="/affiliate" className="font-semibold text-success hover:underline">Ketentuan program</Link><Link href="/akun" className="font-semibold text-success hover:underline">Kembali ke akun</Link></div>
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">{children}</section>;
}
