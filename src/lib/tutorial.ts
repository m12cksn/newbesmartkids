/** Video panduan pemakaian BeSmartKids. Tempel alamat YouTube di sini (watch, youtu.be, atau shorts). Kosong = panel "video sedang disiapkan". */
export const TUTORIAL_VIDEO_URL = "";
/** Video panduan direkam tegak (9:16, seperti Shorts). Ubah ke false bila video mendatar. */
export const TUTORIAL_VIDEO_VERTICAL = true;

/** Ambil ID video dari alamat YouTube apa pun; null bila bukan alamat YouTube yang dikenali. */
export function youtubeId(url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  const m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(u) ? u : null;
}
