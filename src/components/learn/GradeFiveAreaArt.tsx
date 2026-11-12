"use client";

import { useState } from "react";
import type { Scene } from "@/data/grade-five-area";

/* Kertas berpetak dan bangun berlabel. Petak dapat diketuk untuk ditandai saat menghitung luas. */
export function GridFig({ s, className = "w-full max-w-md", marked: outer, onTap }: { s: Scene; className?: string; marked?: string[]; onTap?: (k: string) => void }) {
  const [own, setOwn] = useState<string[]>([]);
  const marked = outer ?? own;
  const tap = (k: string) => (onTap ? onTap(k) : setOwn(m => (m.includes(k) ? m.filter(x => x !== k) : [...m, k])));
  const pad = s.plain ? Math.max(s.w, s.h) * 0.22 + 1.2 : 0.15, fs = s.plain ? Math.max(0.75, Math.max(s.w, s.h) * 0.085) : 0.42;
  const tappable = s.mark && !s.plain;
  return <div className="w-full space-y-1">
    <svg viewBox={`${-pad} ${-pad} ${s.w + 2 * pad} ${s.h + 2 * pad}`} className={`mx-auto block ${className}`} role="img" aria-label={s.plain ? "Gambar bangun datar" : `Kertas berpetak ${s.w} kali ${s.h}`}>
      {!s.plain && Array.from({ length: s.w * s.h }, (_, i) => { const x = i % s.w, y = Math.floor(i / s.w), k = `${x},${y}`, on = marked.includes(k);
        return <rect key={k} x={x} y={y} width="1" height="1" fill={on ? "#f9c97a" : "#ffffff"} stroke="#9cc3e6" strokeWidth="0.03"
          {...(tappable ? { role: "button", tabIndex: 0, "aria-label": `Petak ${x + 1}, ${y + 1}`, "aria-pressed": on, onClick: () => tap(k), onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(k); } }, className: "cursor-pointer" } : {})} />; })}
      {s.polys.map((p, i) => <polygon key={i} points={p.pts.map(q => q.join(",")).join(" ")} fill={p.fill ?? (s.plain ? "#e8f3fb" : "#f08a6e")} fillOpacity={s.plain || p.fill ? 1 : 0.35} stroke={s.plain ? "#2563a6" : "#d9480f"} strokeWidth={s.plain ? 0.08 * Math.max(1, Math.max(s.w, s.h) / 8) : 0.08} strokeLinejoin="round" pointerEvents="none" />)}
      {s.polys.map((p, i) => p.label ? <text key={`l${i}`} x={p.pts.reduce((a, q) => a + q[0], 0) / p.pts.length} y={p.pts.reduce((a, q) => a + q[1], 0) / p.pts.length + 0.15} fontSize="0.42" textAnchor="middle" fontWeight="700" fill="#1f3b30" pointerEvents="none">{p.label}</text> : null)}
      {s.lines?.map((l, i) => <line key={i} x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke={l.color ?? "#e5484d"} strokeWidth={s.plain ? 0.05 * Math.max(1, Math.max(s.w, s.h) / 8) : 0.07} strokeDasharray={s.plain ? `${0.25 * Math.max(1, Math.max(s.w, s.h) / 8)} ${0.18 * Math.max(1, Math.max(s.w, s.h) / 8)}` : "0.25 0.18"} pointerEvents="none" />)}
      {s.texts?.map((t, i) => <text key={i} x={t.at[0]} y={t.at[1] + (t.size ?? fs) * 0.35} fontSize={t.size ?? fs} textAnchor={t.anchor ?? (t.at[0] >= s.w - 0.01 ? "start" : t.at[0] <= 0.01 ? "end" : t.text.startsWith("tinggi") ? "start" : "middle")} fontWeight="700" fill="#1f3b30" pointerEvents="none">{t.text}</text>)}
    </svg>
    {tappable && !outer && <p className="text-center text-xs text-base-content/60">Ketuk petak untuk menandai yang sudah dihitung. Ditandai {marked.length} petak.{marked.length > 0 && <> <button type="button" className="link" onClick={() => setOwn([])}>Hapus tanda</button></>}</p>}
  </div>;
}
