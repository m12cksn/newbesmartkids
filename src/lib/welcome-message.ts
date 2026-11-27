import { TUTORIAL_VIDEO_URL } from "./tutorial";

/** Alamat publik BeSmartKids yang dikirim ke pembeli. */
export const PUBLIC_URL = "https://www.besmartkids.id";
/** Info video pembelajaran hanya dikirim sampai tanggal ini (setelahnya kalimatnya tidak relevan lagi). */
const VIDEO_INFO_UNTIL = new Date("2026-12-11T00:00:00+07:00");

export type NewAccount = { displayName: string; username: string; pin: string };
type Welcome = { buyer: string; packageName: string; access: string; months: number; accounts: NewAccount[]; now?: Date };

const nick = (name: string) => name.trim().split(/\s+/)[0] || name.trim();
const joinNames = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} dan ${xs[xs.length - 1]}`);

/** Pesan WhatsApp untuk pembeli setelah akun dibuat (format WhatsApp: *tebal*, `kode`, _miring_). */
export function welcomeMessage({ buyer, packageName, access, months, accounts, now = new Date() }: Welcome) {
  const kids = joinNames(accounts.map(a => nick(a.displayName || a.username)));
  const blocks = accounts.map(a => `🔐 *Akun ${a.displayName || a.username}*\nUsername: \`${a.username}\`\nPIN: \`${a.pin}\``).join("\n\n");
  const tutorial = TUTORIAL_VIDEO_URL || `${PUBLIC_URL}/panduan`;
  const videoInfo = now < VIDEO_INFO_UNTIL ? `\n\n📢 *Info tambahan, Bunda!*\nMulai *1 Desember 2026*, video pembelajaran akan mulai ditambahkan secara bertahap hingga *10 Desember 2026*, supaya anak-anak bisa belajar dengan penjelasan yang lebih lengkap. Sambil menunggu, materi dan latihan interaktif sudah bisa digunakan ya, Kak. 😊` : "";
  return `Halo Ayah/Bunda ${buyer.trim()} 😊💚
Terima kasih ya sudah membeli *${packageName}!* 🥰
Yeay, akun belajar ${kids} sudah siap digunakan! 🎉

📚 *Detail Paket*
- ${access}
- Aktif selama ${months} bulan
- Setiap akun untuk 1 anak
- Bisa digunakan di 2 perangkat per akun

${blocks}

🌐 *Link masuk BeSmartKids:*
${PUBLIC_URL}/masuk

🎥 *Tutorial cara menggunakan:*
${tutorial}${videoInfo}

🎁 *Mau dapat penghasilan tambahan dari BeSmartKids?*
Kakak juga bisa bergabung menjadi *Affiliate BeSmartKids* dan mendapatkan komisi sampai *Rp19.900 untuk setiap paket satu jenjang dan Rp34.900 untuk setiap Paket Keluarga* yang terjual melalui rekomendasi Bunda! 💸
Caranya gampang: masuk ke akun BeSmartKids, buka menu *Affiliate*, lalu aktifkan. Link pribadi langsung jadi dan komisinya bisa dicairkan ke e-wallet. Info lengkap: ${PUBLIC_URL}/affiliate 💚

Selamat belajar untuk ${kids}! Semoga makin semangat dan makin jago matematika. 🥰
Kalau ada kendala saat login atau menggunakan BeSmartKids, langsung chat saya aja ya Ayah/Bunda. Kami siap bantu! 😊

_Catatan: Simpan username dan PIN baik-baik, jangan dibagikan kepada orang lain ya, Kak._`;
}

/** Pesan singkat setelah admin membuat PIN baru. */
export function resetPinMessage(a: NewAccount) {
  return `Halo Ayah/Bunda 😊\nPIN baru untuk akun *${a.displayName || a.username}* sudah dibuat.\n\nUsername: \`${a.username}\`\nPIN baru: \`${a.pin}\`\n\n🌐 Link masuk: ${PUBLIC_URL}/masuk\n\nPIN lama sudah tidak berlaku dan semua perangkat perlu masuk lagi. Simpan PIN ini baik-baik ya.`;
}
