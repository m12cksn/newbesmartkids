import type { CSSProperties } from "react";

/** Ornamen halaman affiliate: benda yang berhubungan dengan berbagi link dan komisi (koin, rantai link, pesawat kertas,
 *  gelembung chat, dompet, kilau). SVG buatan sendiri, dekoratif (aria-hidden), bergerak pelan lewat .bsk-drift. */
type P = { className?: string; style?: CSSProperties };
const wrap = (className = "", style?: CSSProperties) => ({ className: `pointer-events-none absolute select-none bsk-drift ${className}`, style, "aria-hidden": true as const });

export function Coin({ className, style }: P) {
  return <svg {...wrap(className, style)} viewBox="0 0 64 64">
    <ellipse cx="32" cy="35" rx="26" ry="26" fill="#d9a92b" />
    <circle cx="32" cy="31" r="26" fill="#f7d774" stroke="#c9961f" strokeWidth="2.5" />
    <circle cx="32" cy="31" r="19" fill="none" stroke="#e2b83f" strokeWidth="2" strokeDasharray="3 3" />
    <text x="32" y="38" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="18" fill="#7a5a0c">Rp</text>
  </svg>;
}

export function ChainLink({ className, style }: P) {
  return <svg {...wrap(className, style)} viewBox="0 0 64 64" fill="none" strokeLinecap="round">
    <rect x="6" y="22" width="30" height="18" rx="9" transform="rotate(-35 21 31)" stroke="#208f6d" strokeWidth="5" />
    <rect x="28" y="24" width="30" height="18" rx="9" transform="rotate(-35 43 33)" stroke="#5fbf9c" strokeWidth="5" />
  </svg>;
}

export function PaperPlane({ className, style }: P) {
  return <svg {...wrap(className, style)} viewBox="0 0 64 64" strokeLinejoin="round">
    <path d="M6 30 58 8 44 56 30 38Z" fill="#cfe6f6" stroke="#4f8fbf" strokeWidth="2.5" />
    <path d="M30 38 58 8 22 44Z" fill="#a9d0ec" stroke="#4f8fbf" strokeWidth="2.5" />
  </svg>;
}

export function ChatBubble({ className, style }: P) {
  return <svg {...wrap(className, style)} viewBox="0 0 64 64">
    <path d="M10 12h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H28l-12 10v-10h-6a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6Z" fill="#fde2dd" stroke="#e07a6a" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="22" cy="29" r="3.5" fill="#e07a6a" /><circle cx="32" cy="29" r="3.5" fill="#e07a6a" /><circle cx="42" cy="29" r="3.5" fill="#e07a6a" />
  </svg>;
}

export function WalletArt({ className, style }: P) {
  return <svg {...wrap(className, style)} viewBox="0 0 64 64" strokeLinejoin="round">
    <path d="M12 18 42 8l4 10" fill="#d7f0e5" stroke="#208f6d" strokeWidth="2.5" />
    <rect x="6" y="18" width="50" height="36" rx="7" fill="#f0c08a" stroke="#b9772f" strokeWidth="2.5" />
    <rect x="38" y="29" width="20" height="14" rx="5" fill="#fde8cf" stroke="#b9772f" strokeWidth="2.5" />
    <circle cx="46" cy="36" r="2.6" fill="#b9772f" />
  </svg>;
}

export function Sparkle({ className, style }: P) {
  return <svg {...wrap(className, style)} viewBox="0 0 32 32"><path d="M16 2c1.4 7.4 6.6 12.6 14 14-7.4 1.4-12.6 6.6-14 14-1.4-7.4-6.6-12.6-14-14C9.4 14.6 14.6 9.4 16 2Z" fill="#ffd34f" /></svg>;
}
