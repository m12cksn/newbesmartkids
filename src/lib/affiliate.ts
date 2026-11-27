/** Aturan program affiliate BeSmartKids (harus sama dengan fungsi bsk_affiliate_* di Supabase). */
/** Komisi per paket pada harga normal. Jika paket dibeli dengan harga promo, komisi turun dengan perbandingan yang sama
 *  (contoh Rp59.000: 19.900 x 59.000/79.000 = Rp14.862). */
export const AFF_COMMISSION_JENJANG = 19_900;
export const AFF_COMMISSION_KELUARGA = 34_900;
export const PRICE_JENJANG = 79_000;
export const FAMILY_PRICE = 129_000;
export const AFF_MIN_PAYOUT = 50_000;
export const AFF_HOLD_DAYS = 3;
export const WALLETS = ["DANA", "OVO", "GoPay", "ShopeePay", "LinkAja"] as const;
export type Wallet = (typeof WALLETS)[number];

/** Komisi untuk sekumpulan paket yang dibayar sejumlah `paid`. Diskon menurunkan komisi secara proporsional; tidak pernah melebihi komisi harga normal. */
export function commissionFor(packages: { jenjang: number; keluarga: number }, paid: number) {
  const full = packages.jenjang * AFF_COMMISSION_JENJANG + packages.keluarga * AFF_COMMISSION_KELUARGA;
  const normal = packages.jenjang * PRICE_JENJANG + packages.keluarga * FAMILY_PRICE;
  if (full <= 0 || normal <= 0 || !(paid > 0)) return 0;
  return Math.round(full * Math.min(1, paid / normal));
}
export const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;

/** Halaman penjualan Scalev. Kode affiliate ikut tercatat di pesanan lewat parameter UTM. */
export const DEFAULT_AFFILIATE_TARGET = "https://be-smart-kids.myscalev.com/paket-belajar-besmartkids";
export function affiliateTarget(code: string | null, target = process.env.AFFILIATE_TARGET_URL || DEFAULT_AFFILIATE_TARGET) {
  const u = new URL(target);
  if (code) { u.searchParams.set("utm_source", "affiliate"); u.searchParams.set("utm_medium", "referral"); u.searchParams.set("utm_campaign", code); }
  return u.toString();
}

export type CommissionRow = { orderId: string; orderAmount: number; amount: number; paidAt: string; availableAt: string; state: "held" | "available" | "payout" | "void" };
export type PayoutRow = { id: string; amount: number; wallet: string; status: "requested" | "paid" | "rejected"; note: string; requestedAt: string; decidedAt: string | null };
export type AffiliateSummary = {
  code: string; fullName: string; phone: string; walletType: Wallet; walletNumber: string; walletName: string; status: "active" | "blocked"; createdAt: string;
  clicks: number; clicks30: number; sales: number; held: number; available: number; requested: number; paid: number;
};
export type AffiliateDetail = AffiliateSummary & { commissions: CommissionRow[]; payouts: PayoutRow[]; lastSync: string | null };
export type AffiliateMe = AffiliateDetail | { none: true; displayName: string; phone: string };

export const affiliateErrors: Record<string, string> = {
  bad_name: "Tulis nama lengkap minimal 2 huruf.",
  bad_phone: "Nomor WhatsApp belum benar. Contoh: 081234567890.",
  bad_wallet: "Pilih jenis e-wallet.",
  bad_wallet_number: "Nomor e-wallet belum benar.",
  bad_wallet_name: "Tulis nama pemilik e-wallet.",
  phone_used: "Nomor WhatsApp ini sudah terdaftar sebagai affiliate. Silakan masuk dengan akun yang sudah ada.",
  busy: "Pendaftaran sedang ramai. Coba lagi beberapa menit lagi.",
  exists: "Akun ini sudah terdaftar sebagai affiliate.",
  session: "Sesi berakhir. Silakan masuk lagi.",
  min: `Komisi siap cair belum mencapai ${rupiah(AFF_MIN_PAYOUT)}.`,
  open: "Masih ada pengajuan pencairan yang sedang diproses.",
  blocked: "Akun affiliate ini sedang dinonaktifkan. Hubungi admin.",
  server: "Sedang ada gangguan. Coba beberapa saat lagi.",
};

/** Teks promosi siap pakai untuk dibagikan affiliate. Tanpa klaim hasil belajar yang tidak bisa dibuktikan. */
export const shareText = (link: string) => `Ayah Bunda, ini tempat latihan matematika yang dipakai anak saya: BeSmartKids.

Materinya per bab sesuai buku Kurikulum Merdeka Kelas 1–12, ada peraga yang bisa digeser, latihan harian, dan evaluasi 24 soal dengan pembahasan.

Bab 1 bisa dicoba gratis. Paket satu jenjang Rp79.000 untuk setahun, bukan bulanan.

Lihat di sini: ${link}`;

export type ScalevOrder = {
  order_id: string; gross_revenue?: number | string; product_price?: number | string; final_variants?: Record<string, number> | null; payment_status?: string; status?: string; created_at?: string;
  confirmed_time?: string | null; transfer_time?: string | null; draft_time?: string | null;
  metadata?: { utm_campaign?: string; utm_source?: string } | null; customer?: { phone?: string } | null; utm_source?: string;
};
export type SyncOrder = { orderId: string; code: string; amount: number; commission: number; paidAt: string | null; paid: boolean; buyerPhone: string };
export type SyncResult = { error?: string; checked?: number; new?: number; void?: number; skipped?: number };

const CANCELED = new Set(["canceled", "rts", "shipped_rts"]);
const PAID = new Set(["paid", "settled"]);

/** Hitung isi paket dari final_variants Scalev ({"Paket Belajar BeSmartKids - Paket Keluarga": 1, ...}).
 *  Tanpa data varian: perkirakan dari harga produk (>= harga Paket Keluarga dianggap Keluarga). */
export function packagesOf(o: Pick<ScalevOrder, "final_variants" | "product_price" | "gross_revenue">) {
  const v = o.final_variants && typeof o.final_variants === "object" ? Object.entries(o.final_variants) : [];
  if (v.length) {
    let jenjang = 0, keluarga = 0;
    for (const [name, qty] of v) { const n = Math.max(0, Math.floor(Number(qty) || 0)); if (/keluarga/i.test(name)) keluarga += n; else jenjang += n; }
    if (jenjang + keluarga > 0) return { jenjang, keluarga };
  }
  const price = Number(o.product_price) || Number(o.gross_revenue) || 0;
  return price >= FAMILY_PRICE ? { jenjang: 0, keluarga: 1 } : { jenjang: price > 0 ? 1 : 0, keluarga: 0 };
}

/** Ubah pesanan Scalev menjadi data komisi. amount = jumlah yang dibayar; commission dihitung per paket. Pesanan yang belum dibayar dilewati; yang dibatalkan dikirim agar komisinya dibatalkan. */
export function toSyncOrders(orders: ScalevOrder[]): SyncOrder[] {
  const out: SyncOrder[] = [];
  for (const o of orders) {
    const code = o.metadata?.utm_campaign?.trim();
    const source = o.metadata?.utm_source ?? o.utm_source;
    if (!code || (source && source !== "affiliate")) continue;
    const canceled = CANCELED.has(o.status ?? "");
    const paid = PAID.has(o.payment_status ?? "") && !canceled;
    if (!paid && !canceled) continue;
    const amount = Number(o.gross_revenue) || 0;
    out.push({ orderId: o.order_id, code, amount, commission: commissionFor(packagesOf(o), amount), paidAt: o.confirmed_time || o.transfer_time || o.draft_time || o.created_at || null, paid, buyerPhone: o.customer?.phone ?? "" });
  }
  return out;
}

