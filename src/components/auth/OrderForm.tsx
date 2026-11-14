"use client";

import { Copy, MessageCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { offers, rupiah, type OfferId } from "@/lib/packages";

type Created = { username: string; pin: string; displayName: string };
const waPhone = (p: string) => { const d = p.replace(/\D/g, ""); return d.startsWith("0") ? `62${d.slice(1)}` : d; };
const errorText: Record<string, string> = { taken: "Username bentrok. Coba tekan Buat akun sekali lagi.", bad_offer: "Pilih paket.", bad_username: "Nama pembeli harus berisi huruf atau angka.", not_admin: "Sesi admin berakhir. Silakan masuk lagi." };

/** Membuat semua akun untuk satu pesanan Scalev sekaligus, lalu menyiapkan pesan untuk pembeli. */
export function OrderForm({ onCreated }: { onCreated: () => void }) {
  const [offerId, setOfferId] = useState<OfferId>("sd");
  const offer = offers.find(o => o.id === offerId)!;
  const [buyer, setBuyer] = useState(""); const [phone, setPhone] = useState(""); const [note, setNote] = useState("");
  const [names, setNames] = useState<string[]>(["", "", ""]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ created: Created[]; offer: typeof offer; buyer: string; phone: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null); setCopied(false);
    try {
      const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bundle", offer: offerId, buyer, phone, note, names: names.slice(0, offer.accounts) }) });
      const j = await r.json();
      if (!r.ok || j.error) { setError(errorText[j.error] ?? "Akun gagal dibuat. Periksa daftar akun sebelum mencoba lagi."); }
      else { setDone({ created: j.created, offer, buyer, phone }); setBuyer(""); setPhone(""); setNote(""); setNames(["", "", ""]); onCreated(); }
    } catch { setError("Akun gagal dibuat. Periksa daftar akun sebelum mencoba lagi."); }
    setBusy(false);
  }

  const url = typeof window === "undefined" ? "" : `${window.location.origin}/masuk`;
  const message = done ? `Halo ${done.buyer}, terima kasih sudah membeli ${done.offer.name} BeSmartKids.\n\nMasuk di: ${url}\n\n${done.created.map(c => `${c.displayName}\nUsername: ${c.username}\nPIN: ${c.pin}`).join("\n\n")}\n\nIsi paket: ${done.offer.short}, aktif ${done.offer.months} bulan. Setiap akun untuk satu anak dan bisa dipakai di 2 perangkat. Simpan PIN dan jangan dibagikan.` : "";

  return <section aria-labelledby="pesanan" className="space-y-4 rounded-xl border-2 border-success/40 bg-base-100 p-5">
    <div><h2 id="pesanan" className="flex items-center gap-2 text-xl font-bold"><ShoppingBag className="size-5 text-success" aria-hidden="true" />Buat akun dari pesanan Scalev</h2>
      <p className="mt-1 text-sm text-base-content/70">Setelah pembayaran di Scalev masuk, isi data pembeli. Semua akun dalam paket dibuat sekaligus.</p></div>
    <form onSubmit={submit} className="space-y-4">
      <fieldset><legend className="mb-2 text-sm font-bold">Paket yang dibeli</legend>
        <div className="grid gap-2 sm:grid-cols-2">{offers.map(o => <label key={o.id} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${offerId === o.id ? "border-success bg-success/5" : "border-base-300"}`}>
          <input type="radio" name="offer" className="radio radio-success radio-sm mt-0.5" checked={offerId === o.id} onChange={() => setOfferId(o.id)} />
          <span><span className="font-bold">{o.name}</span> {rupiah(o.price)}<span className="block text-base-content/60">{o.short}, {o.accounts} akun, {o.months} bulan{!o.onSale && ", belum dijual di website"}</span></span></label>)}</div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><span className="mb-1 block text-sm font-bold">Nama pembeli</span><input required className="input input-bordered w-full" value={buyer} onChange={e => setBuyer(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Nomor WhatsApp</span><input inputMode="tel" className="input input-bordered w-full" placeholder="08…" value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Nomor pesanan Scalev</span><input className="input input-bordered w-full" placeholder="Misal: SC-1234" value={note} onChange={e => setNote(e.target.value)} /></label>
      </div>
      <fieldset><legend className="mb-2 text-sm font-bold">Nama anak per akun <span className="font-normal text-base-content/60">(boleh dikosongkan)</span></legend>
        <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: offer.accounts }, (_, i) => <input key={i} aria-label={`Nama anak akun ${i + 1}`} className="input input-bordered w-full" placeholder={`Akun ${i + 1}`} value={names[i]} onChange={e => setNames(n => n.map((x, k) => (k === i ? e.target.value : x)))} />)}</div>
      </fieldset>
      {error && <p role="alert" className="text-sm font-semibold text-error">{error}</p>}
      <button type="submit" className="btn btn-success" disabled={busy || !buyer.trim()}>Buat {offer.accounts} akun</button>
    </form>
    {done && <div role="status" className="space-y-3 rounded-lg bg-success/5 p-4" data-testid="order-result">
      <p className="font-bold">{done.created.length} akun siap. Kirim pesan ini ke pembeli.</p>
      <pre className="whitespace-pre-wrap rounded-lg bg-base-100 p-3 text-xs">{message}</pre>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-sm btn-success gap-1" onClick={() => { void navigator.clipboard?.writeText(message); setCopied(true); }}><Copy className="size-4" aria-hidden="true" />{copied ? "Tersalin" : "Salin pesan"}</button>
        {done.phone && <a className="btn btn-sm btn-outline gap-1" target="_blank" rel="noreferrer" href={`https://wa.me/${waPhone(done.phone)}?text=${encodeURIComponent(message)}`}><MessageCircle className="size-4" aria-hidden="true" />Kirim lewat WhatsApp</a>}
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDone(null)}>Tutup</button>
      </div>
      <p className="text-xs text-base-content/60">PIN hanya tampil sekali. Jika hilang, gunakan Reset PIN di daftar akun.</p>
    </div>}
  </section>;
}
