/** Ringkasan laporan belajar dari riwayat nilai (dipakai halaman akun, tautan orang tua, dan admin). */
export type ReportResult = { path: string; title: string; kind: "latihan" | "evaluasi" | "harian"; part: string; correct: number; total: number; score: number; at: string };
export type ReportData = { name: string; generatedAt: string; expiresAt?: string; results: ReportResult[] };
export type ChapterSummary = {
  path: string; title: string; classId: number | null; bestEval: number | null; lastEval: number | null; evalCount: number;
  practiceAvg: number | null; practiceCount: number; lastAt: string; status: "kuat" | "cukup" | "ulang" | "belum";
};
export type DailySummary = { path: string; title: string; level: number; count: number; avg: number };

const DAY = 864e5;
/** Tanggal kalender di Asia/Jakarta (YYYY-MM-DD). */
export const wibDate = (iso: string | number | Date) => new Date(new Date(iso).getTime() + 7 * 3600e3).toISOString().slice(0, 10);
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
export const classOfPath = (path: string) => { const m = /kelas-(\d+)/.exec(path.split("/")[2] ?? ""); return m ? Number(m[1]) : null; };
export const statusLabel: Record<ChapterSummary["status"], string> = { kuat: "Sudah kuat", cukup: "Cukup, ulangi sedikit", ulang: "Perlu belajar lagi", belum: "Belum evaluasi" };

export function summarize(results: ReportResult[], now = Date.now()) {
  const last30 = results.filter(r => now - new Date(r.at).getTime() <= 30 * DAY);
  const days = new Set(results.map(r => wibDate(r.at)));
  // Hari berturut-turut sampai hari ini (atau kemarin, jika hari ini belum belajar).
  let streak = 0; let d = now; if (!days.has(wibDate(d))) d -= DAY;
  while (days.has(wibDate(d))) { streak++; d -= DAY; }
  const weeks = Array.from({ length: 8 }, (_, k) => { const end = now - k * 7 * DAY, start = end - 7 * DAY;
    return { label: wibDate(start + DAY).slice(5).split("-").reverse().join("/"), count: results.filter(r => { const t = new Date(r.at).getTime(); return t > start && t <= end; }).length }; }).reverse();

  const groups = new Map<string, ReportResult[]>();
  for (const r of results.filter(x => x.kind !== "harian")) { const k = r.path.split("/").slice(0, 5).join("/"); groups.set(k, [...(groups.get(k) ?? []), r]); }
  const chapters: ChapterSummary[] = [...groups].map(([path, rs]): ChapterSummary => {
    const evals = rs.filter(r => r.kind === "evaluasi"), prs = rs.filter(r => r.kind === "latihan");
    const best = evals.length ? Math.max(...evals.map(e => e.score)) : null;
    return { path, title: rs[0].title || "Bab", classId: classOfPath(path), bestEval: best, lastEval: evals[0]?.score ?? null, evalCount: evals.length,
      practiceAvg: avg(prs.map(p => p.score)), practiceCount: prs.length, lastAt: rs[0].at,
      status: best === null ? "belum" : best >= 80 ? "kuat" : best >= 60 ? "cukup" : "ulang" };
  }).sort((a, b) => (a.classId ?? 99) - (b.classId ?? 99) || b.lastAt.localeCompare(a.lastAt));

  const dailyGroups = new Map<string, ReportResult[]>();
  for (const r of results.filter(x => x.kind === "harian")) dailyGroups.set(r.path, [...(dailyGroups.get(r.path) ?? []), r]);
  const daily: DailySummary[] = [...dailyGroups].map(([path, rs]) => ({ path, title: rs[0].title, level: Number(/level-(\d)/.exec(path)?.[1] ?? 0), count: rs.length, avg: avg(rs.map(r => r.score)) ?? 0 }))
    .sort((a, b) => a.title.localeCompare(b.title) || a.level - b.level);

  const tips: string[] = [];
  const weak = chapters.filter(c => c.bestEval !== null && c.bestEval < 70).sort((a, b) => (a.bestEval ?? 0) - (b.bestEval ?? 0));
  for (const c of weak.slice(0, 2)) tips.push(`Ulangi materi dan latihan "${c.title}", lalu kerjakan evaluasinya lagi. Nilai terbaik saat ini ${c.bestEval}.`);
  const noEval = chapters.filter(c => c.status === "belum");
  if (noEval.length) tips.push(`Latihan "${noEval[0].title}" sudah dikerjakan. Langkah berikutnya: coba evaluasi bab tersebut.`);
  if (!results.some(r => now - new Date(r.at).getTime() <= 7 * DAY)) tips.push("Belum ada kegiatan dalam 7 hari terakhir. Coba jadwalkan 15 menit belajar setiap hari.");
  if (!daily.length) tips.push("Latihan harian berisi 7 soal dan berganti setiap hari. Cocok untuk kebiasaan berhitung singkat.");
  const strong = chapters.filter(c => c.status === "kuat");
  if (strong.length) tips.push(`Sudah kuat di ${strong.length} bab. Pertahankan dengan mengulang latihan sesekali.`);

  return {
    totals: { evaluasi: last30.filter(r => r.kind === "evaluasi").length, latihan: last30.filter(r => r.kind === "latihan").length, harian: last30.filter(r => r.kind === "harian").length,
      activeDays30: new Set(last30.map(r => wibDate(r.at))).size, streak, avgEval30: avg(last30.filter(r => r.kind === "evaluasi").map(r => r.score)) },
    weeks, chapters, daily, tips: tips.slice(0, 4),
  };
}
