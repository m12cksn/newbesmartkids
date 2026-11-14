/** Pengingat perpanjangan paket: siapa yang paketnya segera berakhir atau baru saja berakhir. */
export type RenewEnt = { package: "kelas" | "semua"; classId: number | null; expiresAt: string };
export type RenewAccount = { id: string; username: string; displayName: string; phone: string; role: string; disabled: boolean; entitlements: RenewEnt[] };
export type Reminder = { account: RenewAccount; label: string; expiresAt: string; days: number; status: "segera" | "berakhir" };

export const SOON_DAYS = 14, GRACE_DAYS = 30;
const DAY = 864e5;
/** Selisih hari kalender (dibulatkan ke atas): 0 berarti berakhir hari ini. */
export const daysLeft = (iso: string, now = Date.now()) => Math.ceil((new Date(iso).getTime() - now) / DAY);
export const pkgLabel = (e: { package: string; classId: number | null }) => (e.package === "semua" ? "Semua kelas" : `Kelas ${e.classId}`);

/** "Kelas 3", "Kelas 1–6", atau "Kelas 2, 5". */
export function classesLabel(ids: number[]) {
  const c = [...new Set(ids)].sort((x, y) => x - y);
  if (c.length === 1) return `Kelas ${c[0]}`;
  return c.every((v, i) => i === 0 || v === c[i - 1] + 1) ? `Kelas ${c[0]}–${c[c.length - 1]}` : `Kelas ${c.join(", ")}`;
}

/** Satu pengingat per paket (per kelas atau semua kelas), memakai tanggal berakhir terakhir untuk paket itu. */
export function reminders(accounts: RenewAccount[], now = Date.now()): Reminder[] {
  const out: Reminder[] = [];
  for (const a of accounts) {
    if (a.role === "admin" || a.disabled) continue;
    const latest = new Map<string, RenewEnt>();
    for (const e of a.entitlements) { const k = pkgLabel(e), cur = latest.get(k); if (!cur || e.expiresAt > cur.expiresAt) latest.set(k, e); }
    const hasSemua = [...latest.values()].some(e => e.package === "semua" && daysLeft(e.expiresAt, now) > SOON_DAYS);
    // Paket jenjang tercatat sebagai beberapa kelas yang berakhir bersamaan: gabungkan menjadi satu pengingat.
    const groups = new Map<string, RenewEnt[]>();
    for (const e of latest.values()) {
      if (hasSemua && e.package === "kelas") continue;
      const k = e.package === "semua" ? "semua" : `kelas-${e.expiresAt.slice(0, 10)}`;
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }
    for (const es of groups.values()) {
      const e = es[0], d = daysLeft(e.expiresAt, now);
      if (d <= SOON_DAYS && d >= -GRACE_DAYS) out.push({ account: a, label: e.package === "semua" ? "Semua kelas" : classesLabel(es.map(x => x.classId!)), expiresAt: e.expiresAt, days: d, status: d >= 0 ? "segera" : "berakhir" });
    }
  }
  return out.sort((x, y) => x.days - y.days);
}

const fmt = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
export const whenText = (d: number) => (d > 1 ? `${d} hari lagi` : d === 1 ? "besok" : d === 0 ? "hari ini" : `${-d} hari yang lalu`);
/** Pesan WhatsApp untuk orang tua. */
export function reminderMessage(r: Reminder) {
  const name = r.account.displayName || r.account.username;
  return r.status === "segera"
    ? `Halo ${name}, paket BeSmartKids ${r.label} untuk akun ${r.account.username} berakhir ${whenText(r.days)} (${fmt(r.expiresAt)}). Agar belajar tidak terputus, paket dapat diperpanjang sekarang; masa aktif baru dihitung setelah paket lama habis. Riwayat belajar tetap tersimpan. Balas pesan ini untuk perpanjangan.`
    : `Halo ${name}, paket BeSmartKids ${r.label} untuk akun ${r.account.username} sudah berakhir pada ${fmt(r.expiresAt)}. Akun dan riwayat belajar masih tersimpan, dan semua bab dapat dibuka lagi setelah paket diperpanjang. Balas pesan ini untuk perpanjangan.`;
}
export { fmt as renewDate };
