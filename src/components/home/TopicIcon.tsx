/** Ikon SVG kecil per topik materi. Garis tipis, warna brand, tanpa gambar raster. */
export function TopicIcon({ topic, className = "size-12" }: { topic: string; className?: string }) {
  const t = topic.toLowerCase();
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      {t.includes("peluang") ? <g {...common}><rect x="8" y="8" width="22" height="22" rx="5" /><rect x="20" y="20" width="20" height="20" rx="5" className="fill-warning/40" /><circle cx="14" cy="14" r="1.6" fill="currentColor" /><circle cx="24" cy="24" r="1.6" fill="currentColor" /><circle cx="26" cy="34" r="1.6" fill="currentColor" /><circle cx="34" cy="26" r="1.6" fill="currentColor" /></g>
        : t.includes("geometri") ? <g {...common}><path d="M10 16 24 9l14 7v16l-14 7-14-7z" /><path d="M10 16l14 7 14-7M24 23v16" /><path d="M24 23 38 16v16l-14 7z" className="fill-success/20" /></g>
        : t.includes("perbandingan") || t.includes("ratio") ? <g {...common}><rect x="7" y="26" width="8" height="14" rx="2" className="fill-success/25" /><rect x="19" y="18" width="8" height="22" rx="2" /><rect x="31" y="10" width="8" height="30" rx="2" className="fill-warning/40" /><path d="M6 8l36 0" strokeDasharray="3 4" /></g>
        : t.includes("data") ? <g {...common}><path d="M8 40h32M10 40V8" /><rect x="15" y="24" width="6" height="16" className="fill-success/25" /><rect x="25" y="14" width="6" height="26" className="fill-warning/40" /><rect x="35" y="30" width="5" height="10" /></g>
        : t.includes("ukur") ? <g {...common}><rect x="5" y="17" width="38" height="14" rx="3" className="fill-warning/30" /><path d="M11 17v6M17 17v4M23 17v6M29 17v4M35 17v6" /></g>
        : t.includes("pola") ? <g {...common}><circle cx="10" cy="34" r="3" /><circle cx="20" cy="34" r="3" /><circle cx="20" cy="24" r="3" /><circle cx="30" cy="34" r="3" className="fill-success/30" /><circle cx="30" cy="24" r="3" className="fill-success/30" /><circle cx="30" cy="14" r="3" className="fill-success/30" /><path d="M38 12l4 4-4 4" /></g>
        : t.includes("bentuk") || t.includes("diagram") ? <g {...common}><circle cx="15" cy="16" r="8" className="fill-warning/30" /><rect x="26" y="8" width="15" height="15" rx="2" /><path d="M24 40 32 26l8 14z" className="fill-success/25" /></g>
        : t.includes("bilangan") || t.includes("cambridge") ? <g {...common}><circle cx="24" cy="24" r="16" /><path d="M24 24V8a16 16 0 0 1 16 16z" className="fill-success/30" /><path d="M24 24h16" /></g>
        : <g {...common}><path d="M16 10v12M10 16h12" /><path d="M28 30l8 8M36 30l-8 8" /><path d="M28 14h10" /><circle cx="15" cy="34" r="1.6" fill="currentColor" /><path d="M10 34h10" /></g>}
    </svg>
  );
}
