"use client";

import { Copy, Printer, School, Trash2, UserMinus, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Group } from "@/lib/teacher";
import { memberName } from "@/lib/teacher";

type Pkg = { package: "kelas" | "semua"; classId: number };
type Teacher = { id: string; username: string; displayName: string };
type Created = { username: string; pin: string; displayName: string };
const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "server");
  return j as T;
}
const lines = (s: string) => s.split(/[\n,]+/).map(x => x.trim()).filter(Boolean);
const prefixFrom = (name: string) => name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "").slice(0, 12) || "siswa";
const errorText: Record<string, string> = {
  bad_name: "Nama kelas sekolah wajib diisi.", bad_teacher: "Akun guru tidak ditemukan.", bad_prefix: "Awalan username 2–24 karakter: huruf kecil, angka, titik, garis bawah atau strip.",
  bad_count: "Isi 1 sampai 60 nama siswa, satu nama per baris.", bad_package: "Pilih paket.", too_many: "Paling banyak 200 username sekali tambah.", not_found: "Kelas sekolah tidak ditemukan.",
};

function CredentialList({ items, group, close }: { items: Created[]; group: string; close: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/masuk`;
  const text = `Akun BeSmartKids ${group}\nMasuk di: ${url}\n\n${items.map(c => `${c.displayName}: username ${c.username}, PIN ${c.pin}`).join("\n")}`;
  return <div role="status" className="space-y-3 rounded-xl border-2 border-success bg-success/5 p-4 print:border-0">
    <p className="font-bold print:hidden">{items.length} akun siswa siap. Simpan atau cetak daftar ini sekarang, PIN hanya tampil sekali.</p>
    <table className="w-full border-collapse text-sm" data-testid="bulk-result">
      <caption className="mb-1 text-left font-bold">{group}. Masuk di {url}</caption>
      <thead><tr className="border-b-2 border-base-300 text-left"><th className="py-1 pe-3">Nama</th><th className="py-1 pe-3">Username</th><th className="py-1">PIN</th></tr></thead>
      <tbody>{items.map(c => <tr key={c.username} className="border-b border-base-300"><td className="py-1 pe-3">{c.displayName}</td><td className="py-1 pe-3 font-bold">{c.username}</td><td className="py-1 font-bold tracking-widest">{c.pin}</td></tr>)}</tbody>
    </table>
    <div className="flex flex-wrap gap-2 print:hidden">
      <button type="button" className="btn btn-sm btn-success gap-1" onClick={() => { void navigator.clipboard?.writeText(text); setCopied(true); }}><Copy className="size-4" aria-hidden="true" />{copied ? "Tersalin" : "Salin semua"}</button>
      <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" />Cetak</button>
      <button type="button" className="btn btn-sm btn-ghost" onClick={close}>Tutup</button>
    </div>
  </div>;
}

function GroupCard({ g, teachers, update, remove, busy, act }: { g: Group; teachers: Teacher[]; update: (g: Group) => void; remove: (id: string) => void; busy: boolean; act: (fn: () => Promise<string | void>) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState({ name: g.name, teacher: g.teacher?.id ?? "", classId: g.classId ?? 0 });
  const [usernames, setUsernames] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [names, setNames] = useState("");
  const [prefix, setPrefix] = useState(prefixFrom(g.name));
  const [pkg, setPkg] = useState<Pkg>({ package: "kelas", classId: g.classId ?? 1 });
  const [created, setCreated] = useState<Created[] | null>(null);
  const id = `g-${g.id.slice(0, 8)}`;
  return <li className="rounded-xl border border-base-300 bg-base-100 p-4" data-testid="group">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><p className="font-bold">{g.name}{g.classId && <span className="font-normal text-base-content/60">, Kelas {g.classId}</span>}</p>
        <p className="text-sm text-base-content/70">Guru: {g.teacher ? `${g.teacher.displayName || g.teacher.username} (@${g.teacher.username})` : "belum dipilih"}. {g.members.length} siswa.</p></div>
      <button type="button" className="btn btn-xs btn-outline gap-1" aria-expanded={open} onClick={() => setOpen(o => !o)}><Users className="size-3.5" aria-hidden="true" />{open ? "Tutup" : "Kelola"}</button>
    </div>
    {open && <div className="mt-4 space-y-5 border-t border-base-300 pt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label><span className="mb-1 block text-sm font-bold">Nama</span><input className="input input-bordered input-sm" value={edit.name} onChange={e => setEdit(x => ({ ...x, name: e.target.value }))} /></label>
        <label><span className="mb-1 block text-sm font-bold">Guru</span><select className="select select-bordered select-sm" value={edit.teacher} onChange={e => setEdit(x => ({ ...x, teacher: e.target.value }))}><option value="">Belum dipilih</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.displayName || t.username}</option>)}</select></label>
        <label><span className="mb-1 block text-sm font-bold">Kelas</span><select className="select select-bordered select-sm" value={edit.classId} onChange={e => setEdit(x => ({ ...x, classId: Number(e.target.value) }))}><option value={0}>Campuran</option>{CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}</select></label>
        <button type="button" className="btn btn-sm btn-success" disabled={busy} onClick={() => act(async () => { const r = await call<Group & { error?: string }>({ action: "groupSave", group: g.id, name: edit.name, teacher: edit.teacher || null, classId: edit.classId || null }); if (r.error) return errorText[r.error]; update(r); })}>Simpan</button>
      </div>

      <div><h4 className="text-sm font-bold">Siswa ({g.members.length})</h4>
        {g.members.length === 0 ? <p className="text-sm text-base-content/60">Belum ada siswa.</p> : <ul className="mt-2 divide-y divide-base-300 text-sm">{g.members.map(m => <li key={m.id} className="flex items-center justify-between gap-2 py-1.5">
          <span>{memberName(m)} <span className="text-base-content/60">@{m.username}</span></span>
          <button type="button" className="btn btn-xs btn-ghost gap-1" disabled={busy} onClick={() => act(async () => { update(await call<Group>({ action: "groupRemove", group: g.id, account: m.id })); })}><UserMinus className="size-3.5" aria-hidden="true" />Keluarkan</button></li>)}</ul>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); void act(async () => { const r = await call<{ missing: string[]; group: Group; error?: string }>({ action: "groupAdd", group: g.id, usernames: lines(usernames) }); if (r.error) return errorText[r.error]; update(r.group); setMissing(r.missing); setUsernames(""); }); }}>
          <h4 className="text-sm font-bold">Masukkan siswa yang sudah punya akun</h4>
          <textarea className="textarea textarea-bordered w-full" rows={3} aria-label="Username siswa" placeholder="Satu username per baris" value={usernames} onChange={e => setUsernames(e.target.value)} />
          <button type="submit" className="btn btn-sm btn-outline gap-1" disabled={busy || !lines(usernames).length}><UserPlus className="size-4" aria-hidden="true" />Masukkan</button>
          {missing.length > 0 && <p role="alert" className="text-sm text-error">Tidak ditemukan atau bukan akun siswa: {missing.join(", ")}</p>}
        </form>
        <form className="space-y-2" onSubmit={e => { e.preventDefault(); void act(async () => { const r = await call<{ created: Created[]; group: Group; error?: string }>({ action: "bulk", group: g.id, prefix, names: lines(names), ...pkg }); if (r.error) return errorText[r.error]; update(r.group); setCreated(r.created); setNames(""); }); }}>
          <h4 className="text-sm font-bold">Buat akun siswa baru sekaligus</h4>
          <textarea className="textarea textarea-bordered w-full" rows={4} aria-label="Nama siswa" placeholder="Satu nama per baris, paling banyak 60" value={names} onChange={e => setNames(e.target.value)} />
          <div className="flex flex-wrap items-end gap-3">
            <label><span className="mb-1 block text-sm font-bold">Awalan username</span><input className="input input-bordered input-sm w-36" autoCapitalize="none" value={prefix} onChange={e => setPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))} /></label>
            <span className="pb-1 text-xs text-base-content/60">Contoh: {prefix || "awalan"}01, {prefix || "awalan"}02</span>
          </div>
          <fieldset className="flex flex-wrap items-center gap-3 text-sm"><legend className="mb-1 font-bold">Paket untuk setiap siswa</legend>
            <label className="flex items-center gap-2"><input type="radio" className="radio radio-success radio-sm" name={`${id}-pkg`} checked={pkg.package === "kelas"} onChange={() => setPkg(p => ({ ...p, package: "kelas" }))} />1 kelas, 1 tahun
              <select aria-label="Kelas paket" className="select select-bordered select-sm" value={pkg.classId} disabled={pkg.package !== "kelas"} onChange={e => setPkg(p => ({ ...p, classId: Number(e.target.value) }))}>{CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}</select></label>
            <label className="flex items-center gap-2"><input type="radio" className="radio radio-success radio-sm" name={`${id}-pkg`} checked={pkg.package === "semua"} onChange={() => setPkg(p => ({ ...p, package: "semua" }))} />Semua kelas, 2 tahun</label>
          </fieldset>
          <button type="submit" className="btn btn-sm btn-success gap-1" disabled={busy || !lines(names).length}><UserPlus className="size-4" aria-hidden="true" />Buat {lines(names).length || ""} akun</button>
        </form>
      </div>
      {created && <CredentialList items={created} group={g.name} close={() => setCreated(null)} />}

      <button type="button" className="btn btn-xs btn-ghost gap-1 text-error" disabled={busy} onClick={() => act(async () => { if (!confirm(`Hapus kelas sekolah ${g.name}? Akun siswa tidak ikut terhapus.`)) return; await call({ action: "groupDelete", group: g.id }); remove(g.id); })}><Trash2 className="size-3.5" aria-hidden="true" />Hapus kelas sekolah</button>
    </div>}
  </li>;
}

/** Admin: kelas sekolah (rombel) untuk paket sekolah. */
export function SchoolGroups({ teachers }: { teachers: Teacher[] }) {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", teacher: "", classId: 0 });
  const load = useCallback(async () => { try { setGroups(await call<Group[]>({ action: "groups" })); } catch { setError("Kelas sekolah gagal dimuat."); } }, []);
  // Muat ulang saat daftar guru berubah (misalnya guru dikembalikan menjadi siswa).
  const teacherKey = teachers.map(t => t.id).join(",");
  useEffect(() => { void Promise.resolve().then(load); }, [load, teacherKey]);
  async function act(fn: () => Promise<string | void>) { setBusy(true); try { setError((await fn()) || null); } catch { setError("Perintah gagal. Coba lagi."); } setBusy(false); }
  const update = (g: Group) => setGroups(l => (l ? l.map(x => (x.id === g.id ? g : x)) : l));

  return <section aria-labelledby="kelas-sekolah" className="space-y-4">
    <div><h2 id="kelas-sekolah" className="flex items-center gap-2 text-xl font-bold"><School className="size-5 text-success" aria-hidden="true" />Kelas sekolah</h2>
      <p className="text-sm text-base-content/70">Untuk paket sekolah. Ubah sebuah akun menjadi guru di daftar akun, buat kelas sekolah, lalu masukkan siswanya. Guru melihat rekap nilai di halaman Rekap kelas.</p></div>
    {error && <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm font-semibold text-error">{error}</p>}
    <form className="flex flex-wrap items-end gap-3 rounded-xl border border-base-300 bg-base-100 p-4" onSubmit={e => { e.preventDefault(); void act(async () => { const r = await call<Group & { error?: string }>({ action: "groupSave", name: form.name, teacher: form.teacher || null, classId: form.classId || null }); if (r.error) return errorText[r.error]; setGroups(l => [r, ...(l ?? [])]); setForm({ name: "", teacher: "", classId: 0 }); }); }}>
      <label><span className="mb-1 block text-sm font-bold">Nama kelas sekolah</span><input required className="input input-bordered input-sm" placeholder="Misal: 4A SD Harapan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label>
      <label><span className="mb-1 block text-sm font-bold">Guru</span><select className="select select-bordered select-sm" value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}><option value="">Belum dipilih</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.displayName || t.username}</option>)}</select></label>
      <label><span className="mb-1 block text-sm font-bold">Kelas</span><select className="select select-bordered select-sm" value={form.classId} onChange={e => setForm(f => ({ ...f, classId: Number(e.target.value) }))}><option value={0}>Campuran</option>{CLASSES.map(c => <option key={c} value={c}>Kelas {c}</option>)}</select></label>
      <button type="submit" className="btn btn-sm btn-success" disabled={busy}>Buat kelas sekolah</button>
    </form>
    {!groups ? <span className="loading loading-spinner text-success" aria-label="Memuat" /> : groups.length === 0 ? <p className="text-sm text-base-content/60">Belum ada kelas sekolah.</p>
      : <ul className="space-y-2">{groups.map(g => <GroupCard key={g.id} g={g} teachers={teachers} update={update} remove={id => setGroups(l => l?.filter(x => x.id !== id) ?? l)} busy={busy} act={act} />)}</ul>}
  </section>;
}
