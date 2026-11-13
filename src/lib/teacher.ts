/** Rekap nilai kelas sekolah untuk guru: kolom bab, nilai per siswa, rata-rata, dan CSV. */
/** Data bab yang dibutuhkan rekap (diisi dari src/data/materials). */
export type Mat = { slug: string; title: string; classId: number; chapter: number };

export type MemberChapter = { path: string; title: string; best: number | null; last: number | null; evals: number; practice: number; lastAt: string };
export type Member = { id: string; username: string; displayName: string; disabled: boolean; lastAt?: string | null; week?: number; chapters?: MemberChapter[] };
export type Group = { id: string; name: string; classId: number | null; createdAt: string; teacher: { id: string; username: string; displayName: string } | null; members: Member[] };
export type Overview = { name: string; role: string; groups: Group[] };
export type Column = { path: string; title: string; label: string; classId: number | null; chapter: number | null };

const DAY = 864e5;
const slugOf = (path: string) => path.split("/")[4] ?? "";
const classOf = (path: string) => { const m = /kelas-(\d+)/.exec(path.split("/")[2] ?? ""); return m ? Number(m[1]) : null; };
export const memberName = (m: Pick<Member, "displayName" | "username">) => m.displayName || m.username;

/** Kolom: semua bab di kelas rombel (urut nomor bab), lalu bab lain yang sudah dikerjakan siswa. */
export function columns(g: Group, materials: Mat[]): Column[] {
  const cols = new Map<string, Column>();
  const own = g.classId ? materials.filter(m => m.classId === g.classId).sort((a, b) => a.chapter - b.chapter) : [];
  for (const m of own) cols.set(m.slug, { path: "", title: m.title, label: `Bab ${m.chapter}`, classId: m.classId, chapter: m.chapter });
  const extra: Column[] = [];
  for (const c of g.members.flatMap(x => x.chapters ?? [])) {
    const slug = slugOf(c.path);
    if (cols.has(slug)) { const col = cols.get(slug)!; if (!col.path) col.path = c.path; continue; }
    if (extra.some(e => slugOf(e.path) === slug)) continue;
    const m = materials.find(x => x.slug === slug), k = m?.classId ?? classOf(c.path);
    extra.push({ path: c.path, title: m?.title ?? c.title, label: m ? `K${m.classId} Bab ${m.chapter}` : c.title.slice(0, 12), classId: k, chapter: m?.chapter ?? null });
  }
  extra.sort((a, b) => (a.classId ?? 99) - (b.classId ?? 99) || (a.chapter ?? 99) - (b.chapter ?? 99));
  return [...cols.values(), ...extra];
}

export const cellOf = (m: Member, col: Column) => (m.chapters ?? []).find(c => slugOf(c.path) === slugOf(col.path)) ?? null;
export const band = (score: number | null) => (score === null ? "belum" : score >= 80 ? "kuat" : score >= 60 ? "cukup" : "ulang");

export function columnStats(g: Group, col: Column) {
  const scores = g.members.map(m => (col.path ? cellOf(m, col)?.best : null)).filter((x): x is number => x !== null && x !== undefined);
  return { done: scores.length, avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null };
}

export function groupStats(g: Group, materials: Mat[], now = Date.now()) {
  const active = g.members.filter(m => m.lastAt && now - new Date(m.lastAt).getTime() <= 7 * DAY);
  const inactive = g.members.filter(m => !m.disabled && !(m.lastAt && now - new Date(m.lastAt).getTime() <= 7 * DAY));
  const bests = g.members.flatMap(m => (m.chapters ?? []).map(c => c.best)).filter((x): x is number => x !== null);
  const weakCols = columns(g, materials).map(c => ({ col: c, ...columnStats(g, c) })).filter(c => c.avg !== null && c.avg < 70);
  return { total: g.members.length, active: active.length, inactive, avgBest: bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : null, weakCols };
}

const q = (v: string | number | null | undefined) => { const s = v === null || v === undefined ? "" : String(v); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
/** CSV dengan pemisah titik koma agar langsung terbaca Excel berbahasa Indonesia. */
export function toCsv(g: Group, materials: Mat[]) {
  const cols = columns(g, materials);
  const head = ["Nama", "Username", "Terakhir belajar", "Kegiatan 7 hari", ...cols.map(c => `${c.label} ${c.title}`)];
  const rows = g.members.map(m => [memberName(m), m.username, m.lastAt ? m.lastAt.slice(0, 10) : "", m.week ?? 0, ...cols.map(c => (c.path ? cellOf(m, c)?.best ?? "" : ""))]);
  return [head, ...rows].map(r => r.map(q).join(";")).join("\r\n");
}
