import type { CSSProperties } from "react";

type Glyph = { text: string; x: string; y: string; size: string; color: string; t: number; d: number; r: number; hideSm?: boolean };

// Simbol matematika melayang pelan. Murni SVG/CSS: tanpa gambar raster dan tanpa JavaScript.
const glyphs: Glyph[] = [
  { text: "+", x: "4%", y: "14%", size: "text-5xl sm:text-6xl", color: "text-success/15", t: 12, d: 0, r: -12 },
  { text: "÷", x: "46%", y: "6%", size: "text-4xl sm:text-5xl", color: "text-warning/50", t: 14, d: -3, r: 10, hideSm: true },
  { text: "×", x: "7%", y: "78%", size: "text-4xl sm:text-5xl", color: "text-success/15", t: 10, d: -5, r: 8 },
  { text: "π", x: "93%", y: "10%", size: "text-4xl", color: "text-success/20", t: 13, d: -2, r: -6 },
  { text: "¾", x: "90%", y: "84%", size: "text-4xl sm:text-5xl", color: "text-warning/60", t: 11, d: -7, r: 6 },
  { text: "√", x: "40%", y: "88%", size: "text-3xl", color: "text-success/15", t: 15, d: -4, r: -8, hideSm: true },
  { text: "=", x: "52%", y: "46%", size: "text-3xl", color: "text-warning/40", t: 9, d: -1, r: 0, hideSm: true },
];

export function MathOrnaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bsk-graph-paper absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
      {glyphs.map((g) => (
        <span key={g.text + g.x} className={`bsk-drift absolute select-none font-extrabold ${g.size} ${g.color} ${g.hideSm ? "hidden sm:block" : ""}`}
          style={{ left: g.x, top: g.y, "--t": `${g.t}s`, "--d": `${g.d}s`, "--r": `${g.r}deg` } as CSSProperties}>{g.text}</span>
      ))}
      <svg className="absolute -left-10 bottom-8 hidden w-40 text-success/15 sm:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
        <g className="bsk-spin-slow"><polygon points="50,8 92,80 8,80" /><circle cx="50" cy="56" r="24" /></g>
      </svg>
      <svg className="absolute right-[38%] top-6 hidden w-24 text-warning/50 lg:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
        <g className="bsk-spin-slow" style={{ animationDuration: "60s" }}><rect x="18" y="18" width="64" height="64" rx="6" /><path d="M18 50h64M50 18v64" /></g>
      </svg>
    </div>
  );
}
