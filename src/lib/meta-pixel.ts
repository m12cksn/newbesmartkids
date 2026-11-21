/** Pixel Meta BeSmartKids (sama dengan pixel di halaman Scalev). ID pixel bukan rahasia. */
export const META_PIXEL_ID = "916155404185090";

/** Pixel hanya aktif di situs produksi, agar pratinjau dan uji lokal tidak mencemari data iklan. */
export const isProductionHost = (host: string) => host === "besmartkids.id" || host.endsWith(".besmartkids.id");

export type PixelPage = { kind: "page" } | { kind: "class" } | { kind: "trial"; slug: string } | null;

/**
 * Halaman mana yang boleh memakai pixel. Hanya halaman untuk orang tua:
 * beranda, halaman kelas, dan pembukaan Bab 1 gratis oleh pengunjung yang belum masuk.
 * Halaman belajar anak lainnya (bab berbayar, latihan, evaluasi, latihan harian, akun, laporan, admin) tidak pernah dikirim.
 */
export function pixelPage(pathname: string, isFree: (slug: string) => boolean): PixelPage {
  if (pathname === "/") return { kind: "page" };
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "kelas") return null;
  if (parts.length === 2) return { kind: "class" };
  if (parts.length === 4 && parts[2] === "materi" && isFree(parts[3])) return { kind: "trial", slug: parts[3] };
  return null;
}
