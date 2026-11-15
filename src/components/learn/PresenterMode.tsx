"use client";

import { Crosshair, Flashlight, Focus, Highlighter, Minus, Plus, Presentation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccess } from "@/components/auth/AccessProvider";

/**
 * Mode menjelaskan (khusus admin): alat bantu saat menjelaskan atau merekam video.
 * Laser dengan jejak memudar, sorot (layar meredup kecuali sekitar kursor), spidol sementara yang hilang
 * sendiri, dan fokus blok (klik satu bagian, bagian lain meredup). Tidak ada yang disimpan.
 */
type Tool = "laser" | "sorot" | "spidol" | "fokus";
const TOOLS: { id: Tool; label: string; key: string; Icon: typeof Crosshair }[] = [
  { id: "laser", label: "Laser", key: "L", Icon: Crosshair },
  { id: "sorot", label: "Sorot", key: "S", Icon: Flashlight },
  { id: "spidol", label: "Spidol", key: "P", Icon: Highlighter },
  { id: "fokus", label: "Fokus", key: "F", Icon: Focus },
];
const LASER_MS = 650, INK_MS = 3000, INK_FADE = 700;
type Pt = { x: number; y: number; t: number };
type InkStroke = { p: { x: number; y: number }[]; end: number }; // koordinat halaman (sudah ditambah scroll)

const typing = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
/** Blok terdekat yang cukup besar untuk disorot: langkah, paragraf, tabel, gambar, atau kartu. */
function blockOf(el: Element | null): Element | null {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    if ((n as HTMLElement).closest?.("[data-presenter]")) return null;
    const r = n.getBoundingClientRect(), tag = n.tagName.toLowerCase();
    if (r.width >= 120 && r.height >= 24 && ["li", "p", "table", "figure", "svg", "ol", "ul", "output", "section", "div", "h1", "h2"].includes(tag)) return n;
  }
  return null;
}

export function PresenterMode() {
  const { session } = useAccess();
  const isAdmin = session?.role === "admin";
  const [on, setOn] = useState(false);
  const [tool, setTool] = useState<Tool>("laser");
  const [radius, setRadius] = useState(140);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [focusRect, setFocusRect] = useState<DOMRect | null>(null);
  const focusEl = useRef<Element | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<Pt[]>([]);
  const ink = useRef<InkStroke[]>([]);
  const drawing = useRef<InkStroke | null>(null);
  const raf = useRef(0);
  const [inkCount, setInkCount] = useState(0);

  const close = useCallback(() => { setOn(false); setPos(null); focusEl.current = null; setFocusRect(null); trail.current = []; ink.current = []; drawing.current = null; setInkCount(0); }, []);

  // Pintasan keyboard.
  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if (typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape" && on) { if (focusEl.current) { focusEl.current = null; setFocusRect(null); } else close(); return; }
      const t = TOOLS.find(x => x.key.toLowerCase() === e.key.toLowerCase());
      if (t && on) { setTool(t.id); if (t.id !== "fokus") { focusEl.current = null; setFocusRect(null); } }
      if (on && tool === "sorot" && (e.key === "[" || e.key === "]")) setRadius(r => Math.max(60, Math.min(320, r + (e.key === "]" ? 30 : -30))));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, on, tool, close]);

  // Posisi penunjuk untuk laser dan sorot (overlay tidak menangkap klik, peraga tetap bisa dipakai).
  useEffect(() => {
    if (!on || (tool !== "laser" && tool !== "sorot")) return;
    const move = (e: PointerEvent) => { setPos({ x: e.clientX, y: e.clientY }); if (tool === "laser") trail.current.push({ x: e.clientX, y: e.clientY, t: performance.now() }); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", move); };
  }, [on, tool]);

  // Fokus blok: klik memilih bagian, klik bagian yang sama melepas fokus.
  useEffect(() => {
    if (!on || tool !== "fokus") return;
    const click = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.("[data-presenter]")) return;
      e.preventDefault(); e.stopPropagation();
      const b = blockOf(e.target as Element);
      if (!b || b === focusEl.current) { focusEl.current = null; setFocusRect(null); return; }
      focusEl.current = b; setFocusRect(b.getBoundingClientRect());
    };
    const sync = () => { if (focusEl.current) setFocusRect(focusEl.current.getBoundingClientRect()); };
    window.addEventListener("click", click, true);
    window.addEventListener("scroll", sync, { passive: true }); window.addEventListener("resize", sync);
    return () => { window.removeEventListener("click", click, true); window.removeEventListener("scroll", sync); window.removeEventListener("resize", sync); };
  }, [on, tool]);

  // Kanvas untuk jejak laser dan spidol sementara.
  useEffect(() => {
    if (!on) return;
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const size = () => { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); window.addEventListener("resize", size);
    const frame = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      trail.current = trail.current.filter(p => now - p.t < LASER_MS);
      const tr = trail.current;
      for (let i = 1; i < tr.length; i++) { const a = 1 - (now - tr[i].t) / LASER_MS; ctx.strokeStyle = `rgba(225, 29, 46, ${a * 0.7})`; ctx.lineWidth = 2 + 6 * a; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke(); }
      const before = ink.current.length;
      ink.current = ink.current.filter(s => now - s.end < INK_MS);
      const all = drawing.current ? [...ink.current, drawing.current] : ink.current;
      for (const s of all) {
        const age = s === drawing.current ? 0 : now - s.end, a = age < INK_MS - INK_FADE ? 1 : Math.max(0, (INK_MS - age) / INK_FADE);
        ctx.strokeStyle = `rgba(245, 159, 0, ${0.85 * a})`; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath();
        s.p.forEach((p, i) => (i ? ctx.lineTo(p.x - scrollX, p.y - scrollY) : ctx.moveTo(p.x - scrollX, p.y - scrollY))); if (s.p.length === 1) ctx.lineTo(s.p[0].x - scrollX + 0.1, s.p[0].y - scrollY); ctx.stroke();
      }
      if (before !== ink.current.length) setInkCount(ink.current.length);
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", size); };
  }, [on]);

  if (!isAdmin) return null;
  const pen = on && tool === "spidol";
  const down = (e: React.PointerEvent) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); drawing.current = { p: [{ x: e.clientX + scrollX, y: e.clientY + scrollY }], end: 0 }; };
  const moveInk = (e: React.PointerEvent) => { if (drawing.current) drawing.current.p.push({ x: e.clientX + scrollX, y: e.clientY + scrollY }); };
  const up = () => { if (!drawing.current) return; drawing.current.end = performance.now(); ink.current.push(drawing.current); drawing.current = null; setInkCount(ink.current.length); };

  if (!on) return <button type="button" data-presenter data-testid="presenter-open" onClick={() => setOn(true)}
    className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2.5 sm:px-4 text-sm font-medium shadow-[0_4px_14px_-6px_rgb(23_53_42/0.35)] hover:border-success focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40 print:hidden sm:bottom-6 sm:left-6">
    <Presentation className="size-4 text-success" strokeWidth={1.75} aria-hidden="true" /><span className="sr-only sm:not-sr-only">Mode menjelaskan</span></button>;

  return <>
    {/* Sorot: layar meredup kecuali lingkaran di sekitar penunjuk. */}
    {tool === "sorot" && <div data-testid="presenter-spot" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] transition-[background] duration-75 motion-reduce:transition-none"
      style={{ background: pos ? `radial-gradient(circle ${radius}px at ${pos.x}px ${pos.y}px, transparent 0, transparent ${radius - 2}px, rgb(15 23 20 / 0.62) ${radius}px)` : "rgb(15 23 20 / 0.62)" }} />}
    {/* Fokus blok. */}
    {tool === "fokus" && focusRect && <div data-testid="presenter-focus" aria-hidden="true" className="pointer-events-none fixed z-[45] rounded-lg ring-4 ring-warning"
      style={{ left: focusRect.left - 6, top: focusRect.top - 6, width: focusRect.width + 12, height: focusRect.height + 12, boxShadow: "0 0 0 200vmax rgb(15 23 20 / 0.55)" }} />}
    {/* Jejak laser dan coretan spidol. Kanvas hanya menangkap sentuhan saat spidol aktif. */}
    <canvas ref={canvasRef} data-testid="presenter-canvas" aria-hidden="true" onPointerDown={pen ? down : undefined} onPointerMove={pen ? moveInk : undefined} onPointerUp={pen ? up : undefined} onPointerCancel={pen ? up : undefined}
      className={`fixed inset-0 z-[46] h-screen w-screen touch-none ${pen ? "cursor-crosshair" : "pointer-events-none"}`} data-ink={inkCount} />
    {tool === "laser" && pos && <span aria-hidden="true" className="pointer-events-none fixed z-[47] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e11d2e] shadow-[0_0_12px_4px_rgb(225_29_46/0.55)]" style={{ left: pos.x, top: pos.y }} />}
    <div data-presenter role="toolbar" aria-label="Mode menjelaskan" data-tool={tool}
      className="fixed bottom-20 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-[0_6px_20px_-8px_rgb(23_53_42/0.45)] print:hidden sm:bottom-6 sm:left-6">
      {TOOLS.map(({ id, label, key, Icon }) => <button key={id} type="button" aria-pressed={tool === id} onClick={() => { setTool(id); if (id !== "fokus") { focusEl.current = null; setFocusRect(null); } }}
        title={`${label} (tombol ${key})`} className={`btn btn-sm gap-1.5 ${tool === id ? "btn-success" : "btn-ghost"}`}><Icon className="size-4" strokeWidth={1.75} aria-hidden="true" /><span className="sr-only sm:not-sr-only">{label}</span></button>)}
      {tool === "sorot" && <span className="flex items-center gap-0.5 ps-1">
        <button type="button" aria-label="Perkecil sorot" className="btn btn-xs btn-square btn-ghost" onClick={() => setRadius(r => Math.max(60, r - 30))}><Minus className="size-3.5" aria-hidden="true" /></button>
        <button type="button" aria-label="Perbesar sorot" className="btn btn-xs btn-square btn-ghost" onClick={() => setRadius(r => Math.min(320, r + 30))}><Plus className="size-3.5" aria-hidden="true" /></button></span>}
      <button type="button" aria-label="Tutup mode menjelaskan" title="Tutup (Esc)" className="btn btn-sm btn-square btn-ghost" onClick={close}><X className="size-4" aria-hidden="true" /></button>
      <p className="hidden w-full px-1.5 pb-0.5 text-[11px] text-base-content/60 sm:block">{tool === "laser" ? "Gerakkan kursor; peraga tetap bisa diklik." : tool === "sorot" ? "Hanya sekitar kursor yang terang. Tombol [ dan ] mengubah ukuran." : tool === "spidol" ? "Coret di layar; coretan hilang sendiri setelah 3 detik." : focusRect ? "Klik bagian yang sama atau Esc untuk melepas fokus." : "Klik satu bagian untuk menyorotnya."}</p>
    </div>
  </>;
}
