/** Nomor WhatsApp admin BeSmartKids, diisi lewat NEXT_PUBLIC_ADMIN_WA (contoh 0812xxxxxxx atau 62812xxxxxxx). */
const raw = (process.env.NEXT_PUBLIC_ADMIN_WA ?? "").replace(/\D/g, "");
export const adminWa = raw ? (raw.startsWith("0") ? `62${raw.slice(1)}` : raw) : "";
/** Nomor untuk ditampilkan: 0812-3456-7890. */
export const adminWaText = adminWa ? `0${adminWa.slice(2)}`.replace(/^(\d{4})(\d{4})(\d+)$/, "$1-$2-$3") : "";
export const adminWaLink = (text = "Halo admin BeSmartKids, saya ingin bertanya.") => (adminWa ? `https://wa.me/${adminWa}?text=${encodeURIComponent(text)}` : "");
