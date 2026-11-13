"use client";

import { Download, FileText, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fmtDate } from "@/components/auth/AccountPanel";
import { adminWaLink } from "@/lib/contact";
import { materials } from "@/data/materials";
import { band, cellOf, columns, columnStats, groupStats, memberName, toCsv, type Overview } from "@/lib/teacher";

const tone = { kuat: "bg-success/20", cukup: "bg-warning/25", ulang: "bg-error/15 text-error", belum: "" } as const;
const toneText = { kuat: "Sudah kuat", cukup: "Cukup", ulang: "Perlu belajar lagi", belum: "Belum evaluasi" } as const;

export function TeacherPanel() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gid, setGid] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/guru", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "overview" }) });
      const j = await r.json();
      if (!r.ok) { setError(j.error === "not_teacher" ? "Halaman ini untuk akun guru. Silakan masuk dengan akun guru." : "Rekap belum dapat dimuat. Coba lagi."); return; }
      setData(j as Overview); setError(null);
    } catch { setError("Rekap belum dapat dimuat. Coba lagi."); }
  }, []);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const group = data?.groups.find(g => g.id === gid) ?? data?.groups[0] ?? null;
  const cols = useMemo(() => (group ? columns(group, materials) : []), [group]);
  const stats = useMemo(() => (group ? groupStats(group, materials) : null), [group]);

  function download() {
    if (!group) return;
    const url = URL.createObjectURL(new Blob(["﻿" + toCsv(group, materials)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `rekap-${group.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  if (error) return <section className="mx-auto max-w-3xl px-4 py-12"><p role="alert" className="rounded-lg bg-error/10 p-3 font-semibold text-error">{error}</p></section>;
  if (!data) return <section className="mx-auto max-w-3xl px-4 py-16 text-center"><span className="loading loading-spinner text-success" aria-label="Memuat" /></section>;
  const wa = adminWaLink("Halo admin BeSmartKids, saya guru dan ingin menambahkan kelas atau siswa.");

  return <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8 print:max-w-none print:p-0">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-extrabold">Rekap kelas</h1><p className="mt-1 text-sm text-base-content/70">{data.name}. Nilai yang tampil adalah nilai evaluasi terbaik setiap siswa di setiap bab.</p></div>
      {data.groups.length > 1 && <label className="print:hidden"><span className="mb-1 block text-sm font-bold">Kelas sekolah</span>
        <select className="select select-bordered" value={group?.id ?? ""} onChange={e => setGid(e.target.value)}>{data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>}
    </div>

    {!group ? <div className="rounded-xl border border-base-300 bg-base-100 p-5"><p className="font-bold">Belum ada kelas sekolah untuk akun ini.</p><p className="mt-1 text-sm text-base-content/70">Admin akan membuat kelas sekolah dan memasukkan akun siswa. {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="link text-success">Hubungi admin</a>}</p></div> : <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{group.name}{group.classId && <span className="font-normal text-base-content/60">, Kelas {group.classId}</span>}</h2>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button type="button" className="btn btn-sm btn-outline gap-1" onClick={download} disabled={!group.members.length}><Download className="size-4" aria-hidden="true" />Unduh CSV</button>
          <button type="button" className="btn btn-sm btn-outline gap-1" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" />Cetak</button>
          <button type="button" className="btn btn-sm btn-ghost" aria-label="Muat ulang" onClick={() => void load()}><RefreshCw className="size-4" aria-hidden="true" /></button>
        </div>
      </div>
      {stats && <dl className="grid grid-cols-3 gap-3 text-center sm:max-w-lg">
        <div className="rounded-lg bg-base-100 p-3"><dt className="text-xs text-base-content/60">Siswa</dt><dd className="text-2xl font-extrabold" data-testid="stat-total">{stats.total}</dd></div>
        <div className="rounded-lg bg-base-100 p-3"><dt className="text-xs text-base-content/60">Belajar 7 hari terakhir</dt><dd className="text-2xl font-extrabold" data-testid="stat-active">{stats.active}</dd></div>
        <div className="rounded-lg bg-base-100 p-3"><dt className="text-xs text-base-content/60">Rata-rata evaluasi</dt><dd className="text-2xl font-extrabold">{stats.avgBest ?? "-"}</dd></div>
      </dl>}

      {group.members.length === 0 ? <p className="rounded-xl border border-base-300 bg-base-100 p-5 text-sm">Belum ada siswa di kelas ini. Admin akan memasukkan akun siswa.</p> : <>
        <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
          <table className="w-full min-w-max border-collapse text-sm" data-testid="rekap">
            <caption className="sr-only">Nilai evaluasi terbaik per siswa per bab</caption>
            <thead><tr className="border-b-2 border-base-300 text-left">
              <th scope="col" className="sticky left-0 bg-base-100 px-3 py-2">Siswa</th>
              <th scope="col" className="px-3 py-2">Terakhir belajar</th>
              {cols.map(c => <th key={c.label + c.title} scope="col" className="px-2 py-2 text-center" title={c.title}>{c.label}</th>)}
            </tr></thead>
            <tbody>{group.members.map(m => <tr key={m.id} className="border-b border-base-300">
              <th scope="row" className="sticky left-0 bg-base-100 px-3 py-2 text-left font-semibold">
                <Link href={`/guru/laporan/${m.id}`} className="link-hover inline-flex items-center gap-1 print:no-underline"><FileText className="size-3.5 shrink-0 text-success print:hidden" aria-hidden="true" />{memberName(m)}</Link>
                <span className="block text-xs font-normal text-base-content/60">@{m.username}</span></th>
              <td className="px-3 py-2 text-xs">{m.lastAt ? fmtDate(m.lastAt) : "Belum ada"}</td>
              {cols.map(c => { const cell = c.path ? cellOf(m, c) : null, b = band(cell?.best ?? null);
                return <td key={c.label + c.title} className="px-1 py-1 text-center">
                  <span className={`inline-block min-w-11 rounded px-1.5 py-1 font-bold ${tone[b]}`} aria-label={`${c.label}: ${cell?.best != null ? `nilai ${cell.best}, ${toneText[b]}` : cell?.practice ? `belum evaluasi, ${cell.practice} latihan` : "belum dikerjakan"}`}>
                    {cell?.best ?? (cell?.practice ? <span className="text-xs font-normal text-base-content/60">latihan</span> : <span className="text-base-content/30">-</span>)}</span></td>; })}
            </tr>)}</tbody>
            <tfoot><tr className="bg-base-200/60 text-xs">
              <th scope="row" className="sticky left-0 bg-base-200 px-3 py-2 text-left">Rata-rata kelas</th><td />
              {cols.map(c => { const s = columnStats(group, c); return <td key={c.label + c.title} className="px-1 py-2 text-center"><span className="block font-bold">{s.avg ?? "-"}</span><span className="text-base-content/60">{s.done}/{group.members.length}</span></td>; })}
            </tr></tfoot>
          </table>
        </div>
        <p className="text-xs text-base-content/60">Warna: hijau 80 ke atas (sudah kuat), kuning 60–79 (cukup), merah di bawah 60 (perlu belajar lagi). Angka kecil di baris rata-rata adalah banyak siswa yang sudah evaluasi.</p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <h3 className="font-bold">Bab yang perlu diulang bersama</h3>
            {stats?.weakCols.length ? <ul className="mt-2 space-y-1 text-sm">{stats.weakCols.map(w => <li key={w.col.label + w.col.title}>{w.col.label} {w.col.title}: rata-rata {w.avg} dari {w.done} siswa</li>)}</ul>
              : <p className="mt-2 text-sm text-base-content/70">Belum ada bab dengan rata-rata di bawah 70.</p>}
          </div>
          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <h3 className="font-bold">Belum belajar 7 hari terakhir</h3>
            {stats?.inactive.length ? <p className="mt-2 text-sm" data-testid="inactive">{stats.inactive.map(memberName).join(", ")}</p>
              : <p className="mt-2 text-sm text-base-content/70">Semua siswa belajar minggu ini.</p>}
          </div>
        </div>
        <details className="text-sm"><summary className="cursor-pointer font-bold">Daftar bab</summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">{cols.map(c => <li key={c.label + c.title}><strong>{c.label}</strong> {c.title}</li>)}</ul></details>
      </>}
    </>}
  </section>;
}
