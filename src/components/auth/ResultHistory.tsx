"use client";

import { BookOpenCheck, ClipboardCheck, PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SavedResult } from "@/app/api/hasil/route";
import { fmtDate } from "./AccountPanel";

type Group = { path: string; title: string; evals: SavedResult[]; practices: SavedResult[] };
const chapterOf = (path: string) => path.split("/").slice(0, 5).join("/");
const classOf = (path: string) => { const m = /kelas-(\d+)/.exec(path.split("/")[2] ?? ""); return m ? Number(m[1]) : null; };
const tone = (s: number) => (s >= 80 ? "text-success" : s >= 60 ? "text-warning-content" : "text-error");

/** Riwayat nilai yang tersimpan di akun: ringkasan per bab dan aktivitas terbaru. */
export function ResultHistory() {
  const [results, setResults] = useState<SavedResult[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetch("/api/hasil", { cache: "no-store" }).then(r => r.json()).then((j: { results?: SavedResult[] | null }) => setResults(j.results ?? [])).catch(() => setFailed(true));
  }, []);
  if (failed) return <p className="mt-8 text-sm text-error">Riwayat belum dapat dimuat. Coba muat ulang halaman.</p>;
  if (!results) return <p className="mt-8 text-sm text-base-content/60">Memuat riwayat belajar…</p>;

  const groups = new Map<string, Group>();
  for (const r of results) {
    const k = chapterOf(r.path), g = groups.get(k) ?? { path: k, title: r.title, evals: [], practices: [] };
    (r.kind === "evaluasi" ? g.evals : g.practices).push(r);
    groups.set(k, g);
  }
  const list = [...groups.values()];
  return <section aria-labelledby="riwayat" className="mt-10">
    <h2 id="riwayat" className="text-2xl font-extrabold">Riwayat belajar</h2>
    {!list.length ? <p className="mt-3 rounded-xl border border-dashed border-base-300 bg-base-100 p-5 text-sm text-base-content/70">Belum ada nilai tersimpan. Selesaikan latihan atau evaluasi di bab mana saja; nilainya muncul di sini.</p> : <>
      <p className="mt-2 text-sm text-base-content/70">{results.filter(r => r.kind === "evaluasi").length} evaluasi dan {results.filter(r => r.kind === "latihan").length} latihan selesai di {list.length} bab.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{list.map(g => {
        const best = g.evals.length ? Math.max(...g.evals.map(e => e.score)) : null, last = g.evals[0], kelas = classOf(g.path);
        const avg = g.practices.length ? Math.round(g.practices.reduce((a, p) => a + p.score, 0) / g.practices.length) : null;
        return <li key={g.path} className="rounded-md border border-base-300 bg-base-100 p-4">
          <p className="text-xs font-semibold text-base-content/60">{kelas ? `Kelas ${kelas}` : "Bab"}</p>
          <Link href={g.path} className="mt-0.5 block font-extrabold leading-snug hover:underline">{g.title || "Bab"}</Link>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="flex items-center gap-1 text-base-content/60"><ClipboardCheck className="size-4" aria-hidden="true" />Evaluasi terbaik</dt><dd className={`text-lg font-extrabold ${best === null ? "text-base-content/40" : tone(best)}`}>{best === null ? "Belum" : `${best}/100`}</dd></div>
            <div><dt className="flex items-center gap-1 text-base-content/60"><PencilLine className="size-4" aria-hidden="true" />Rata-rata latihan</dt><dd className={`text-lg font-extrabold ${avg === null ? "text-base-content/40" : tone(avg)}`}>{avg === null ? "Belum" : `${avg}/100`}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-base-content/60">{last ? `Evaluasi terakhir ${fmtDate(last.at)}: ${last.score}/100 (${g.evals.length}× dikerjakan).` : "Evaluasi belum dikerjakan."} Latihan selesai {g.practices.length}×.</p>
        </li>; })}</ul>
      <h3 className="mt-8 flex items-center gap-1.5 text-lg font-bold"><BookOpenCheck className="size-5 text-success" aria-hidden="true" />Aktivitas terbaru</h3>
      <ol className="mt-2 divide-y divide-base-300 rounded-md border border-base-300 bg-base-100 text-sm">{results.slice(0, 10).map((r, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <span><span className="font-semibold">{r.part || (r.kind === "evaluasi" ? "Evaluasi" : "Latihan")}</span><span className="block text-xs text-base-content/60">{r.title}, {fmtDate(r.at)}</span></span>
        <span className={`font-extrabold ${tone(r.score)}`}>{r.correct}/{r.total} benar, skor {r.score}</span></li>)}</ol>
    </>}
  </section>;
}
