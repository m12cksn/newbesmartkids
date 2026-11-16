/** Ikon berwarna buatan sendiri untuk halaman paket. Setiap ikon menggambarkan bendanya (tangan, buku, papan klip, lampu, kalender, dan seterusnya). */
type P = { className?: string };
const S = ({ children, className = "size-10" }: { children: React.ReactNode; className?: string }) =>
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
const ink = "#17352a";

export const IconHand = ({ className }: P) => <S className={className}>
  <path d="M14 26V14a3 3 0 0 1 6 0v9V10a3 3 0 0 1 6 0v13-9a3 3 0 0 1 6 0v12-6a3 3 0 0 1 6 0v10c0 8-5 13-12 13h-2c-5 0-8-2-11-6l-6-8a3 3 0 0 1 5-4z" fill="#ffd8a8" stroke={ink} strokeWidth="2" />
  <circle cx="40" cy="8" r="3" fill="#ffd34f" /><path d="M36 4l-1-2M44 8h2M42 3l1-1" stroke="#f59f00" strokeWidth="2" />
</S>;
export const IconNotebook = ({ className }: P) => <S className={className}>
  <rect x="9" y="6" width="26" height="36" rx="3" fill="#74c0fc" stroke={ink} strokeWidth="2" />
  <rect x="14" y="6" width="21" height="36" fill="#e7f5ff" stroke={ink} strokeWidth="2" />
  <path d="M19 15h11M19 21h11M19 27h7" stroke="#1c7ed6" strokeWidth="2" />
  <path d="M33 34l9-14 3 2-9 14-4 1z" fill="#ffd34f" stroke={ink} strokeWidth="2" />
</S>;
export const IconClipboard = ({ className }: P) => <S className={className}>
  <rect x="9" y="8" width="30" height="35" rx="3" fill="#c3fae8" stroke={ink} strokeWidth="2" />
  <rect x="17" y="4" width="14" height="8" rx="2" fill="#20c997" stroke={ink} strokeWidth="2" />
  <path d="M15 22l3 3 6-6M15 33l3 3 6-6" stroke="#0ca678" strokeWidth="2.5" /><path d="M28 23h6M28 34h6" stroke={ink} strokeWidth="2" />
</S>;
export const IconBulb = ({ className }: P) => <S className={className}>
  <path d="M24 5a13 13 0 0 0-8 23c2 2 3 4 3 6h10c0-2 1-4 3-6A13 13 0 0 0 24 5z" fill="#ffe066" stroke={ink} strokeWidth="2" />
  <path d="M20 38h8M21 43h6" stroke={ink} strokeWidth="2.5" /><path d="M21 22l3 4 3-4" stroke="#f08c00" strokeWidth="2" />
  <path d="M5 18h3M40 18h3M9 7l2 2M39 7l-2 2" stroke="#fab005" strokeWidth="2.5" />
</S>;
export const IconCalendar = ({ className }: P) => <S className={className}>
  <rect x="6" y="9" width="36" height="33" rx="4" fill="#fff" stroke={ink} strokeWidth="2" />
  <path d="M6 13a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v5H6z" fill="#ff8787" stroke={ink} strokeWidth="2" />
  <path d="M15 5v8M33 5v8" stroke={ink} strokeWidth="2.5" />
  <path d="M16 30l5 5 10-10" stroke="#2b8a3e" strokeWidth="3" />
</S>;
export const IconFamily = ({ className }: P) => <S className={className}>
  <circle cx="17" cy="14" r="6" fill="#ffd8a8" stroke={ink} strokeWidth="2" /><path d="M6 40c0-8 5-13 11-13s11 5 11 13z" fill="#4dabf7" stroke={ink} strokeWidth="2" />
  <circle cx="33" cy="20" r="5" fill="#ffd8a8" stroke={ink} strokeWidth="2" /><path d="M24 41c0-7 4-11 9-11s9 4 9 11z" fill="#ff922b" stroke={ink} strokeWidth="2" />
</S>;
export const IconReport = ({ className }: P) => <S className={className}>
  <path d="M24 4l16 6v12c0 10-7 17-16 21C15 39 8 32 8 22V10z" fill="#b2f2bb" stroke={ink} strokeWidth="2" />
  <path d="M16 30v-5M22 30v-9M28 30v-6M34 30v-12" stroke="#2b8a3e" strokeWidth="3" />
</S>;
export const IconBook = ({ className }: P) => <S className={className}>
  <path d="M4 10c6-2 13-2 20 2v30c-7-4-14-4-20-2z" fill="#ffc9c9" stroke={ink} strokeWidth="2" />
  <path d="M44 10c-6-2-13-2-20 2v30c7-4 14-4 20-2z" fill="#a5d8ff" stroke={ink} strokeWidth="2" />
  <path d="M9 18c4-1 7-1 10 1M29 19c3-2 6-2 10-1M9 25c4-1 7-1 10 1M29 26c3-2 6-2 10-1" stroke={ink} strokeWidth="1.5" />
</S>;
export const IconClock = ({ className }: P) => <S className={className}>
  <circle cx="24" cy="25" r="17" fill="#ffec99" stroke={ink} strokeWidth="2" /><circle cx="24" cy="25" r="12" fill="#fff" />
  <path d="M24 17v8l6 4" stroke="#e8590c" strokeWidth="2.5" /><path d="M10 9l-4 4M38 9l4 4" stroke={ink} strokeWidth="2.5" />
</S>;
export const IconDevices = ({ className }: P) => <S className={className}>
  <rect x="4" y="9" width="30" height="21" rx="2" fill="#d0ebff" stroke={ink} strokeWidth="2" /><path d="M1 34h36l-3 4H4z" fill="#adb5bd" stroke={ink} strokeWidth="2" />
  <rect x="31" y="17" width="14" height="25" rx="3" fill="#ffd34f" stroke={ink} strokeWidth="2" /><circle cx="38" cy="38" r="1.5" fill={ink} />
  <path d="M12 21l4 3 7-7" stroke="#1c7ed6" strokeWidth="2.5" />
</S>;
export const IconCoins = ({ className }: P) => <S className={className}>
  <ellipse cx="18" cy="32" rx="12" ry="5" fill="#ffd43b" stroke={ink} strokeWidth="2" /><path d="M6 32v6c0 3 5 5 12 5s12-2 12-5v-6" fill="#fab005" stroke={ink} strokeWidth="2" />
  <circle cx="32" cy="17" r="11" fill="#ffe066" stroke={ink} strokeWidth="2" /><path d="M32 11v12M29 14h5a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h5" stroke="#e67700" strokeWidth="2" />
</S>;
