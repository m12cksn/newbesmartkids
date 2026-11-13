import { CalendarCheck, ClipboardCheck, Flame, PencilLine, Printer } from "lucide-react";
import Link from "next/link";
import { statusLabel, summarize, type ReportData } from "@/lib/report";
import { PrintButton } from "./PrintButton";

const fmt = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const chip: Record<string, string> = { kuat: "bg-success/15 text-success", cukup: "bg-warning/25 text-warning-content", ulang: "bg-error/15 text-error", belum: "bg-base-200 text-base-content/60" };

/** Laporan belajar yang ramah dibaca orang tua dan siap dicetak. */
export function ReportView({ data, links = true }: { data: ReportData; links?: boolean }) {
  const s = summarize(data.results, new Date(data.generatedAt).getTime());
  const max = Math.max(1, ...s.weeks.map(w => w.count));
  const stats = [
    { icon: ClipboardCheck, label: "Evaluasi (30 hari)", value: String(s.totals.evaluasi), sub: s.totals.avgEval30 === null ? "Belum ada nilai" : `Rata-rata ${s.totals.avgEval30}` },
    { icon: PencilLine, label: "Latihan (30 hari)", value: String(s.totals.latihan + s.totals.harian), sub: `${s.totals.harian} di antaranya latihan harian` },
    { icon: CalendarCheck, label: "Hari belajar (30 hari)", value: String(s.totals.activeDays30), sub: "Hari dengan minimal satu latihan" },
    { icon: Flame, label: "Berturut-turut", value: `${s.totals.streak} hari`, sub: "Sampai hari ini atau kemarin" },
  ];
  return <article className="mx-auto max-w-4xl space-y-8 bg-base-100 p-5 text-base-content sm:p-8 print:max-w-none print:p-0">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-base-300 pb-5">
      <div><p className="text-sm font-semibold text-success">Laporan belajar BeSmartKids</p><h1 className="mt-1 text-3xl font-extrabold">{data.name}</h1>
        <p className="mt-1 text-sm text-base-content/60">Dibuat {fmt(data.generatedAt)}{data.expiresAt ? `. Tautan berlaku sampai ${fmt(data.expiresAt)}` : ""}.</p></div>
      <PrintButton><Printer className="size-4" aria-hidden="true" />Cetak atau simpan PDF</PrintButton>
    </header>

    {!data.results.length ? <p className="rounded-md border border-dashed border-base-300 p-6 text-center text-base-content/70">Belum ada nilai tersimpan. Setelah anak menyelesaikan latihan atau evaluasi sambil masuk ke akunnya, hasilnya muncul di laporan ini.</p> : <>
      <section aria-labelledby="ringkasan"><h2 id="ringkasan" className="text-xl font-bold">Ringkasan</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(({ icon: Icon, label, value, sub }) => <div key={label} className="rounded-md border border-base-300 p-3">
          <dt className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60"><Icon className="size-4 text-success" aria-hidden="true" />{label}</dt>
          <dd className="mt-1 text-2xl font-extrabold">{value}</dd><dd className="text-xs text-base-content/60">{sub}</dd></div>)}</dl>
      </section>

      <section aria-labelledby="kegiatan"><h2 id="kegiatan" className="text-xl font-bold">Kegiatan 8 minggu terakhir</h2>
        <svg viewBox="0 0 320 120" className="mt-3 w-full max-w-xl" role="img" aria-label={`Banyak latihan dan evaluasi per minggu: ${s.weeks.map(w => `${w.label} ${w.count}`).join(", ")}`}>
          <line x1="10" x2="310" y1="96" y2="96" stroke="#33413b" />
          {s.weeks.map((w, i) => { const h = (w.count / max) * 74, x = 14 + i * 37; return <g key={i}><rect x={x} y={96 - h} width="26" height={h} rx="2" fill={w.count ? "#208f6d" : "#e3ebe7"} />
            <text x={x + 13} y={92 - h} textAnchor="middle" fontSize="9" fontWeight="700" fill="#1f3b30">{w.count}</text><text x={x + 13} y="110" textAnchor="middle" fontSize="8" fill="#5b6b64">{w.label}</text></g>; })}
        </svg>
        <p className="text-xs text-base-content/60">Label di bawah batang adalah tanggal awal setiap minggu.</p>
      </section>

      {s.tips.length > 0 && <section aria-labelledby="saran" className="rounded-md border-s-4 border-warning bg-warning/10 p-4"><h2 id="saran" className="text-xl font-bold">Saran untuk minggu ini</h2>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-6">{s.tips.map(t => <li key={t}>{t}</li>)}</ul></section>}

      {s.chapters.length > 0 && <section aria-labelledby="per-bab"><h2 id="per-bab" className="text-xl font-bold">Per bab</h2>
        <div className="mt-3 hidden overflow-x-auto sm:block print:block"><table className="w-full border-collapse text-left text-sm">
          <thead><tr className="border-b-2 border-base-300 text-xs text-base-content/60"><th className="py-2 pe-3">Bab</th><th className="pe-3">Evaluasi terbaik</th><th className="pe-3">Evaluasi terakhir</th><th className="pe-3">Rata-rata latihan</th><th>Keterangan</th></tr></thead>
          <tbody>{s.chapters.map(c => <tr key={c.path} className="border-b border-base-300 align-top">
            <td className="py-2 pe-3"><span className="block text-xs text-base-content/60">{c.classId ? `Kelas ${c.classId}` : ""}</span>{links ? <Link href={c.path} className="font-semibold hover:underline print:no-underline">{c.title}</Link> : <span className="font-semibold">{c.title}</span>}</td>
            <td className="pe-3 font-bold">{c.bestEval ?? "-"}</td><td className="pe-3">{c.lastEval ?? "-"}{c.evalCount > 1 ? <span className="text-xs text-base-content/60"> ({c.evalCount}×)</span> : null}</td>
            <td className="pe-3">{c.practiceAvg ?? "-"}{c.practiceCount ? <span className="text-xs text-base-content/60"> ({c.practiceCount}×)</span> : null}</td>
            <td><span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${chip[c.status]}`}>{statusLabel[c.status]}</span></td></tr>)}</tbody></table></div>
        <ul className="mt-3 space-y-2 sm:hidden print:hidden">{s.chapters.map(c => <li key={c.path} className="rounded-md border border-base-300 p-3 text-sm" data-testid="chapter-card">
          <div className="flex items-start justify-between gap-2"><div><span className="block text-xs text-base-content/60">{c.classId ? `Kelas ${c.classId}` : ""}</span>{links ? <Link href={c.path} className="font-semibold hover:underline">{c.title}</Link> : <span className="font-semibold">{c.title}</span>}</div>
            <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold ${chip[c.status]}`}>{statusLabel[c.status]}</span></div>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-xs"><div><dt className="text-base-content/60">Evaluasi terbaik</dt><dd className="text-base font-bold">{c.bestEval ?? "-"}</dd></div>
            <div><dt className="text-base-content/60">Evaluasi terakhir</dt><dd className="text-base">{c.lastEval ?? "-"}</dd></div>
            <div><dt className="text-base-content/60">Rata-rata latihan</dt><dd className="text-base">{c.practiceAvg ?? "-"}</dd></div></dl></li>)}</ul>
        <p className="mt-2 text-xs text-base-content/60">Sudah kuat: evaluasi terbaik 80 ke atas. Cukup: 60 sampai 79. Perlu belajar lagi: di bawah 60.</p>
      </section>}

      {s.daily.length > 0 && <section aria-labelledby="harian"><h2 id="harian" className="text-xl font-bold">Latihan harian</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">{s.daily.map(d => <li key={d.path} className="rounded-md border border-base-300 p-3 text-sm"><p className="font-semibold">{d.title}, Level {d.level}</p><p className="text-base-content/70">{d.count} paket selesai, rata-rata skor {d.avg}</p></li>)}</ul>
      </section>}

      <section aria-labelledby="terbaru"><h2 id="terbaru" className="text-xl font-bold">15 kegiatan terakhir</h2>
        <ol className="mt-3 divide-y divide-base-300 rounded-md border border-base-300 text-sm">{data.results.slice(0, 15).map((r, i) => <li key={i} className="flex flex-wrap justify-between gap-2 px-3 py-2">
          <span><span className="font-semibold">{r.part || r.kind}</span><span className="block text-xs text-base-content/60">{r.title}, {fmt(r.at)}</span></span>
          <span className="font-bold">{r.correct}/{r.total} benar, skor {r.score}</span></li>)}</ol>
      </section>
    </>}
  </article>;
}
