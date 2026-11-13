"use client";

import { BellRing, Copy, FileText, KeyRound, LogOut, MessageCircle, Plus, RefreshCw, Search, UserX, UserCheck, CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmtDate } from "./AccountPanel";
import { reminderMessage, reminders, renewDate, whenText } from "@/lib/renewal";

type Ent = { id: string; package: "kelas" | "semua"; classId: number | null; startsAt: string; expiresAt: string };
type Account = { id: string; username: string; displayName: string; phone: string; note: string; role: string; disabled: boolean; createdAt: string; entitlements: Ent[]; devices: number };
type Pkg = { package: "kelas" | "semua"; classId: number };
const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

const pkgName = (p: { package: string; classId: number | null }) => (p.package === "semua" ? "Semua kelas (2 tahun)" : `Kelas ${p.classId} (1 tahun)`);
const activeEnts = (a: Account) => a.entitlements.filter(e => new Date(e.expiresAt) > new Date());
const suggest = (name: string) => { const base = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "").slice(0, 12) || "siswa"; return `${base.length < 3 ? base + "bsk" : base}${Math.floor(100 + Math.random() * 900)}`; };
const waPhone = (p: string) => { const d = p.replace(/\D/g, ""); return d.startsWith("0") ? `62${d.slice(1)}` : d; };

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "server");
  return j as T;
}

function PackagePicker({ value, set, idPrefix }: { value: Pkg; set: (p: Pkg) => void; idPrefix: string }) {
  return <fieldset className="space-y-2"><legend className="mb-1 text-sm font-bold">Paket</legend>
    <label className="flex items-center gap-2 text-sm"><input type="radio" className="radio radio-success radio-sm" name={`${idPrefix}-pkg`} checked={value.package === "kelas"} onChange={() => set({ ...value, package: "kelas" })} />1 kelas, 1 tahun
      <select aria-label="Kelas" className="select select-bordered select-sm" value={value.classId} disabled={value.package !== "kelas"} onChange={e => set({ ...value, classId: Number(e.target.value) })}>{CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}</select></label>
    <label className="flex items-center gap-2 text-sm"><input type="radio" className="radio radio-success radio-sm" name={`${idPrefix}-pkg`} checked={value.package === "semua"} onChange={() => set({ ...value, package: "semua" })} />Semua kelas, 2 tahun</label>
  </fieldset>;
}

function Credentials({ c, close }: { c: { username: string; pin: string; name: string; phone: string; paket: string }; close: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/masuk`;
  const text = `Halo ${c.name || ""}, terima kasih sudah bergabung dengan BeSmartKids.\n\nMasuk di: ${url}\nUsername: ${c.username}\nPIN: ${c.pin}\nPaket: ${c.paket}\n\nSatu akun dapat dipakai di 2 perangkat. Simpan PIN ini dan jangan dibagikan.`;
  return <div role="status" className="space-y-3 rounded-xl border-2 border-success bg-success/5 p-4">
    <p className="font-bold">Akun siap. Kirim data ini ke pembeli.</p>
    <p className="text-sm">Username <strong data-testid="new-username">{c.username}</strong>, PIN <strong data-testid="new-pin" className="tracking-widest">{c.pin}</strong></p>
    <pre className="whitespace-pre-wrap rounded-lg bg-base-100 p-3 text-xs">{text}</pre>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn btn-sm btn-success gap-1" onClick={() => { void navigator.clipboard?.writeText(text); setCopied(true); }}><Copy className="size-4" aria-hidden="true" />{copied ? "Tersalin" : "Salin pesan"}</button>
      {c.phone && <a className="btn btn-sm btn-outline gap-1" target="_blank" rel="noreferrer" href={`https://wa.me/${waPhone(c.phone)}?text=${encodeURIComponent(text)}`}><MessageCircle className="size-4" aria-hidden="true" />Buka WhatsApp</a>}
      <button type="button" className="btn btn-sm btn-ghost" onClick={close}>Tutup</button>
    </div>
    <p className="text-xs text-base-content/60">PIN hanya tampil sekali. Jika hilang, gunakan Reset PIN.</p>
  </div>;
}


function Reminders({ list, onExtend }: { list: Account[]; onExtend: (a: Account) => void }) {
  const items = useMemo(() => reminders(list), [list]);
  return <section aria-labelledby="pengingat" className="space-y-3 rounded-xl border border-warning/50 bg-warning/5 p-5">
    <h2 id="pengingat" className="flex items-center gap-2 text-xl font-bold"><BellRing className="size-5 text-warning" aria-hidden="true" />Pengingat perpanjangan <span className="text-base font-normal text-base-content/60">({items.length})</span></h2>
    <p className="text-sm text-base-content/70">Paket yang berakhir dalam 14 hari atau sudah berakhir dalam 30 hari terakhir. Kirim pengingat lewat WhatsApp, lalu tambah paket setelah pembayaran diterima.</p>
    {items.length === 0 ? <p className="text-sm">Tidak ada paket yang perlu diingatkan.</p> : <ul className="space-y-2">{items.map(r => { const a = list.find(x => x.id === r.account.id)!;
      return <li key={`${r.account.id}-${r.label}`} data-testid="reminder" className="flex flex-col gap-2 rounded-lg bg-base-100 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-bold">{r.account.displayName || r.account.username} <span className="font-normal text-base-content/60">@{r.account.username}</span></p>
          <p className="text-sm"><span className={`me-1 rounded px-1.5 py-0.5 text-xs font-bold ${r.status === "segera" ? "bg-warning/30" : "bg-error/15 text-error"}`}>{r.status === "segera" ? "Segera berakhir" : "Sudah berakhir"}</span>{r.label}, {r.status === "segera" ? "berakhir" : "berakhir"} {whenText(r.days)} ({renewDate(r.expiresAt)})</p></div>
        <div className="flex flex-wrap gap-1">{r.account.phone ? <a className="btn btn-xs btn-success gap-1" target="_blank" rel="noreferrer" href={`https://wa.me/${waPhone(r.account.phone)}?text=${encodeURIComponent(reminderMessage(r))}`}><MessageCircle className="size-3.5" aria-hidden="true" />Kirim pengingat</a>
          : <span className="text-xs text-base-content/60">Nomor WA belum diisi</span>}
          <button type="button" className="btn btn-xs btn-outline gap-1" onClick={() => onExtend(a)}><CalendarPlus className="size-3.5" aria-hidden="true" />Tambah paket</button></div></li>; })}</ul>}
  </section>;
}

export function AdminPanel() {
  const [list, setList] = useState<Account[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ displayName: "", phone: "", username: "", note: "" });
  const [pkg, setPkg] = useState<Pkg>({ package: "kelas", classId: 1 });
  const [creds, setCreds] = useState<{ username: string; pin: string; name: string; phone: string; paket: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [extendFor, setExtendFor] = useState<string | null>(null);
  const [extPkg, setExtPkg] = useState<Pkg>({ package: "kelas", classId: 1 });

  const load = useCallback(async () => {
    try { setList(await call<Account[]>({ action: "list" })); setError(null); }
    catch (e) { setError((e as Error).message === "not_admin" ? "Sesi admin berakhir. Silakan masuk lagi." : "Daftar akun gagal dimuat."); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const upsert = (a: Account) => setList(l => (l ? l.map(x => (x.id === a.id ? a : x)) : l));
  async function act(fn: () => Promise<string | void>) { setBusy(true); try { setError((await fn()) || null); } catch { setError("Perintah gagal. Coba lagi."); } setBusy(false); }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const username = form.username || suggest(form.displayName);
    await act(async () => {
      const r = await call<{ error?: string; username: string; pin: string; account: Account }>({ action: "create", ...form, username, ...pkg });
      if (r.error) return r.error === "taken" ? "Username sudah dipakai. Ganti username." : "Username hanya boleh huruf kecil, angka, titik, garis bawah atau strip (3–32 karakter).";
      setCreds({ username: r.username, pin: r.pin, name: form.displayName, phone: form.phone, paket: `${pkgName(pkg)}, berlaku sampai ${fmtDate(r.account.entitlements[0]?.expiresAt ?? null)}` });
      setList(l => [r.account, ...(l ?? [])]);
      setForm({ displayName: "", phone: "", username: "", note: "" });
    });
  }

  const shown = useMemo(() => (list ?? []).filter(a => !q || `${a.username} ${a.displayName} ${a.phone} ${a.note}`.toLowerCase().includes(q.toLowerCase())), [list, q]);

  return <section className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8">
    <div><h1 className="text-3xl font-extrabold">Kelola akun</h1><p className="mt-1 text-sm text-base-content/70">Buat akun setelah pembayaran di Scalev atau Lynk.id masuk, lalu kirim username dan PIN ke pembeli.</p></div>
    {error && <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>}

    <form onSubmit={create} className="space-y-4 rounded-xl border border-base-300 bg-base-100 p-5" aria-labelledby="buat-akun">
      <h2 id="buat-akun" className="text-xl font-bold">Buat akun baru</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="mb-1 block text-sm font-bold">Nama siswa atau orang tua</span><input required className="input input-bordered w-full" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Nomor WhatsApp</span><input inputMode="tel" className="input input-bordered w-full" placeholder="08…" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Username</span><input className="input input-bordered w-full" placeholder="Kosongkan agar dibuat otomatis" autoCapitalize="none" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, "") }))} /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Catatan</span><input className="input input-bordered w-full" placeholder="Misal: Scalev #1234" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></label>
      </div>
      <PackagePicker value={pkg} set={setPkg} idPrefix="baru" />
      <button type="submit" className="btn btn-success gap-1" disabled={busy}><Plus className="size-4" aria-hidden="true" />Buat akun dan PIN</button>
    </form>
    {creds && <Credentials c={creds} close={() => setCreds(null)} />}

    {list && <Reminders list={list} onExtend={a => { setQ(a.username); setExtendFor(a.id); const e = a.entitlements[0]; setExtPkg(e ? { package: e.package, classId: e.classId ?? 1 } : { package: "kelas", classId: 1 }); }} />}

    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">Daftar akun {list && <span className="text-base font-normal text-base-content/60">({list.length})</span>}</h2>
        <div className="flex items-center gap-2"><label className="input input-bordered input-sm flex items-center gap-1"><Search className="size-4 opacity-60" aria-hidden="true" /><input aria-label="Cari akun" placeholder="Cari nama, username, nomor" value={q} onChange={e => setQ(e.target.value)} /></label>
          <button type="button" className="btn btn-sm btn-ghost" aria-label="Muat ulang" onClick={() => void load()}><RefreshCw className="size-4" aria-hidden="true" /></button></div></div>
      {!list ? <span className="loading loading-spinner text-success" aria-label="Memuat" /> : shown.length === 0 ? <p className="text-sm text-base-content/60">Belum ada akun.</p> :
        <ul className="space-y-2">{shown.map(a => { const act1 = activeEnts(a);
          return <li key={a.id} className={`rounded-xl border border-base-300 bg-base-100 p-4 ${a.disabled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="font-bold">{a.displayName || a.username} <span className="font-normal text-base-content/60">@{a.username}</span>{a.role === "admin" && <span className="badge badge-sm badge-info ms-2">admin</span>}{a.disabled && <span className="badge badge-sm ms-2">nonaktif</span>}</p>
                <p className="text-xs text-base-content/60">{[a.phone, a.note, `${a.devices} perangkat aktif`].filter(Boolean).join(", ")}</p>
                <p className="mt-1 text-sm">{act1.length ? act1.map(e => `${e.package === "semua" ? "Semua kelas" : `Kelas ${e.classId}`} s.d. ${fmtDate(e.expiresAt)}`).join("; ") : a.role === "admin" ? "Akses penuh" : "Tidak ada paket aktif"}</p></div>
              {a.role !== "admin" && <div className="flex flex-wrap gap-1">
                <Link href={`/admin/laporan/${a.id}`} className="btn btn-xs btn-outline gap-1"><FileText className="size-3.5" aria-hidden="true" />Laporan</Link>
                <button type="button" className="btn btn-xs btn-outline gap-1" disabled={busy} onClick={() => { setExtendFor(extendFor === a.id ? null : a.id); setExtPkg(act1[0] ? { package: act1[0].package, classId: act1[0].classId ?? 1 } : { package: "kelas", classId: 1 }); }}><CalendarPlus className="size-3.5" aria-hidden="true" />Tambah paket</button>
                <button type="button" className="btn btn-xs btn-outline gap-1" disabled={busy} onClick={() => act(async () => { if (!confirm(`Buat PIN baru untuk ${a.username}? PIN lama tidak berlaku dan semua perangkat keluar.`)) return; const r = await call<{ username: string; pin: string }>({ action: "reset", account: a.id }); setCreds({ username: r.username, pin: r.pin, name: a.displayName, phone: a.phone, paket: act1.map(e => `${e.package === "semua" ? "Semua kelas" : `Kelas ${e.classId}`} sampai ${fmtDate(e.expiresAt)}`).join("; ") || "-" }); window.scrollTo({ top: 0, behavior: "smooth" }); upsert({ ...a, devices: 0 }); })}><KeyRound className="size-3.5" aria-hidden="true" />Reset PIN</button>
                <button type="button" className="btn btn-xs btn-outline gap-1" disabled={busy || !a.devices} onClick={() => act(async () => upsert(await call<Account>({ action: "logout", account: a.id })))}><LogOut className="size-3.5" aria-hidden="true" />Keluarkan perangkat</button>
                <button type="button" className="btn btn-xs btn-outline gap-1" disabled={busy} onClick={() => act(async () => upsert(await call<Account>({ action: "disable", account: a.id, disabled: !a.disabled })))}>{a.disabled ? <><UserCheck className="size-3.5" aria-hidden="true" />Aktifkan</> : <><UserX className="size-3.5" aria-hidden="true" />Nonaktifkan</>}</button>
              </div>}
            </div>
            {extendFor === a.id && <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg bg-base-200/60 p-3">
              <PackagePicker value={extPkg} set={setExtPkg} idPrefix={a.id} />
              <button type="button" className="btn btn-sm btn-success" disabled={busy} onClick={() => act(async () => { upsert(await call<Account>({ action: "extend", account: a.id, ...extPkg })); setExtendFor(null); })}>Simpan paket</button>
              <p className="w-full text-xs text-base-content/60">Jika paket yang sama masih aktif, masa berlakunya disambung dari tanggal berakhir.</p>
            </div>}
          </li>; })}</ul>}
    </div>
  </section>;
}
