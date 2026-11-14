/** Paket yang dijual lewat Scalev. Harga dan isi di sini dipakai halaman depan dan panel admin. */
export type OfferId = "sd" | "smp" | "sma" | "semua";
export type Offer = { id: OfferId; name: string; short: string; price: number; accounts: number; months: number; classes: number[] | "all"; onSale: boolean };

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
export const offers: Offer[] = [
  { id: "sd", name: "Paket Jenjang SD", short: "SD (Kelas 1–6)", price: 79000, accounts: 2, months: 12, classes: range(1, 6), onSale: true },
  { id: "smp", name: "Paket Jenjang SMP", short: "SMP (Kelas 7–9)", price: 79000, accounts: 2, months: 12, classes: range(7, 9), onSale: true },
  // Bab SMA belum ada: tidak dijual di halaman depan, tetapi admin tetap bisa membuatnya.
  { id: "sma", name: "Paket Jenjang SMA", short: "SMA (Kelas 10–12)", price: 79000, accounts: 2, months: 12, classes: range(10, 12), onSale: false },
  { id: "semua", name: "Paket Semua Kelas", short: "Semua kelas (1–12)", price: 129000, accounts: 3, months: 24, classes: "all", onSale: true },
];
export const offerById = (id: unknown) => offers.find(o => o.id === id) ?? null;
export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

/** Tautan halaman produk Scalev, diisi lewat variabel lingkungan Vercel. Kosong berarti tombol beli diarahkan ke WhatsApp admin. */
export const scalevUrl = (kind: "jenjang" | "semua") =>
  (kind === "jenjang" ? process.env.NEXT_PUBLIC_SCALEV_JENJANG_URL : process.env.NEXT_PUBLIC_SCALEV_SEMUA_URL) || "";
