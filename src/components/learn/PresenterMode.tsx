"use client";

import { Crosshair, Eraser, Hand, PenTool, Presentation, Trash2, Undo2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccess } from "@/components/auth/AccessProvider";

/**
 * Mode menjelaskan (khusus admin): alat bantu saat menjelaskan atau merekam video.
 * Laser dengan jejak memudar, dan spidol yang coretannya tetap ada (tidak memudar) sampai diurungkan,
 * dihapus dengan penghapus (coretan yang tersentuh hilang), atau dihapus semua. Coretan menempel pada halaman, jadi ikut bergeser saat halaman digulir.
 * Coretan dihapus saat pindah halaman. Tidak ada yang disimpan.
 * Di layar sentuh, selama laser, spidol, atau penghapus aktif halaman dikunci: sentuhan tidak menggulir dan tidak
 * menekan tombol. Alat "Geser" membuka kunci itu untuk menggulir dan memakai peraga.
 */
type Tool = "laser" | "spidol" | "hapus" | "geser";
const TOOLS: { id: Tool; label: string; key: string; Icon: typeof Crosshair }[] = [
  { id: "laser", label: "Laser", key: "L", Icon: Crosshair },
  { id: "spidol", label: "Spidol", key: "P", Icon: PenTool },
  { id: "hapus", label: "Penghapus", key: "E", Icon: Eraser },
  { id: "geser", label: "Geser", key: "G", Icon: Hand },
];
const INKS = [{ id: "merah", label: "Merah", c: "#d92d20" }, { id: "biru", label: "Biru", c: "#1d63c9" }, { id: "hitam", label: "Hitam", c: "#1f2420" }] as const;
const LASER_MS = 650, INK_W = 4, ERASE_R = 14;
/** Coretan tersentuh penghapus bila salah satu titiknya dekat dengan (x, y). */
const touches = (s: InkStroke, x: number, y: number) => { for (let i = 0; i < s.p.length; i += 2) if (Math.hypot(s.p[i] - x, s.p[i + 1] - y) <= ERASE_R + INK_W / 2) return true; return false; };
type Pt = { x: number; y: number; t: number };
type InkStroke = { c: string; p: number[] }; // p = [x0, y0, x1, y1, …] dalam koordinat halaman (sudah ditambah scroll)

const typing = (e: KeyboardEvent) => { const t = e.target as HTMLElement | null; return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable); };
/** Garis halus melalui titik tengah antar-titik (sama untuk coretan yang sedang ditulis dan yang sudah selesai). */
function drawInk(ctx: CanvasRenderingContext2D, s: InkStroke, ox: number, oy: number) {
  const p = s.p; ctx.strokeStyle = s.c; ctx.lineWidth = INK_W; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(p[0] - ox, p[1] - oy);
  if (p.length === 2) ctx.lineTo(p[0] - ox + 0.01, p[1] - oy);
  for (let i = 2; i < p.length - 2; i += 2) ctx.quadraticCurveTo(p[i] - ox, p[i + 1] - oy, (p[i] + p[i + 2]) / 2 - ox, (p[i + 1] + p[i + 3]) / 2 - oy);
  if (p.length > 2) ctx.lineTo(p[p.length - 2] - ox, p[p.length - 1] - oy);
  ctx.stroke();
}

export function PresenterMode() {
  const { session } = useAccess();
  const isAdmin = session?.role === "admin";
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const [tool, setTool] = useState<Tool>("laser");
  const [color, setColor] = useState<string>(INKS[0].c);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const laserRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<Pt[]>([]);
  const ink = useRef<InkStroke[]>([]);
  const drawing = useRef<InkStroke | null>(null);
  const erasing = useRef(false);
  const raf = useRef(0), inkFrame = useRef(0);
  const [inkCount, setInkCount] = useState(0);

  // Coretan tetap ada; alat kembali ke laser agar halaman tidak tertutup kanvas spidol saat dibuka lagi.
  const close = useCallback(() => { setOn(false); setTool("laser"); setPos(null); trail.current = []; drawing.current = null; }, []);

  /** Gambar ulang lapisan spidol, paling banyak sekali per frame. */
  const paintInk = useCallback(() => {
    if (inkFrame.current) return;
    inkFrame.current = requestAnimationFrame(() => {
      inkFrame.current = 0;
      const cv = inkRef.current, ctx = cv?.getContext("2d", { desynchronized: true }); if (!cv || !ctx) return;
      const d = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(innerWidth * d) || cv.height !== Math.round(innerHeight * d)) { cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d); }
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const s of ink.current) drawInk(ctx, s, scrollX, scrollY);
      if (drawing.current) drawInk(ctx, drawing.current, scrollX, scrollY);
    });
  }, []);
  const undo = useCallback(() => { ink.current = ink.current.slice(0, -1); setInkCount(ink.current.length); paintInk(); }, [paintInk]);
  const clearInk = useCallback(() => { ink.current = []; drawing.current = null; setInkCount(0); paintInk(); }, [paintInk]);

  // Coretan milik satu halaman: pindah halaman menghapusnya.
  useEffect(() => { ink.current = []; drawing.current = null; void Promise.resolve().then(() => setInkCount(0)); }, [pathname]);

  // Pintasan keyboard.
  useEffect(() => {
    if (!isAdmin) return;
    const onKey = (e: KeyboardEvent) => {
      if (typing(e) || e.altKey) return;
      // Ctrl+Z hanya untuk spidol saat spidol aktif; selain itu milik kertas coret.
      if (on && (tool === "spidol" || tool === "hapus") && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); return; }
      if (e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape" && on) { close(); return; }
      const t = TOOLS.find(x => x.key.toLowerCase() === e.key.toLowerCase());
      if (t && on) setTool(t.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin, on, tool, close, undo]);

  // Posisi penunjuk untuk laser (overlay tidak menangkap klik, peraga tetap bisa dipakai).
  useEffect(() => {
    if (!on || tool !== "laser") return;
    const at = (x: number, y: number) => { setPos({ x, y }); trail.current.push({ x, y, t: performance.now() }); };
    const move = (e: PointerEvent) => { if (e.pointerType === "touch") return; const evs = e.getCoalescedEvents?.() ?? []; for (const ev of evs.length ? evs : [e]) trail.current.push({ x: ev.clientX, y: ev.clientY, t: performance.now() }); setPos({ x: e.clientX, y: e.clientY }); };
    // Di tablet, menggeser jari dianggap menggulir sehingga pointermove berhenti; touchmove tetap mengirim posisi jari.
    const touch = (e: TouchEvent) => { const t = e.touches[0]; if (t && !(e.target as Element)?.closest?.("[data-presenter]")) at(t.clientX, t.clientY); };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("touchstart", touch, { passive: true });
    window.addEventListener("touchmove", touch, { passive: true });
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", move); window.removeEventListener("touchstart", touch); window.removeEventListener("touchmove", touch); };
  }, [on, tool]);

  // Kunci layar sentuh selama laser atau spidol aktif: tidak menggulir, tidak memperbesar, tidak menekan isi halaman.
  useEffect(() => {
    if (!on || tool === "geser") return;
    const block = (e: TouchEvent) => { if (e.cancelable && !(e.target as Element)?.closest?.("[data-presenter]")) e.preventDefault(); };
    window.addEventListener("touchstart", block, { passive: false }); window.addEventListener("touchmove", block, { passive: false });
    const html = document.documentElement, prev = [html.style.overscrollBehavior, html.style.touchAction];
    html.style.overscrollBehavior = "none"; html.style.touchAction = "none"; html.dataset.presenterLock = "";
    return () => { window.removeEventListener("touchstart", block); window.removeEventListener("touchmove", block); [html.style.overscrollBehavior, html.style.touchAction] = prev; delete html.dataset.presenterLock; };
  }, [on, tool]);
  // Tanda untuk kertas coret: selama spidol aktif, Ctrl+Z milik spidol.
  useEffect(() => {
    if (!on || (tool !== "spidol" && tool !== "hapus")) return;
    document.documentElement.dataset.presenterPen = "";
    return () => { delete document.documentElement.dataset.presenterPen; };
  }, [on, tool]);

  // Lapisan spidol mengikuti gulir dan ukuran layar.
  useEffect(() => {
    if (!on) return;
    paintInk();
    window.addEventListener("scroll", paintInk, { passive: true }); window.addEventListener("resize", paintInk);
    return () => { window.removeEventListener("scroll", paintInk); window.removeEventListener("resize", paintInk); };
  }, [on, paintInk]);

  // Jejak laser memudar; hanya berjalan selama laser dipakai.
  useEffect(() => {
    if (!on || tool !== "laser") return;
    const cv = laserRef.current; if (!cv) return;
    const ctx = cv.getContext("2d", { desynchronized: true })!;
    const size = () => { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); window.addEventListener("resize", size);
    const frame = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      trail.current = trail.current.filter(p => now - p.t < LASER_MS);
      const tr = trail.current;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let i = 1; i < tr.length; i++) { const a = 1 - (now - tr[i].t) / LASER_MS; ctx.strokeStyle = `rgba(225, 29, 46, ${a * 0.7})`; ctx.lineWidth = 2 + 6 * a; ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke(); }
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", size); ctx.clearRect(0, 0, innerWidth, innerHeight); };
  }, [on, tool]);

  if (!isAdmin) return null;
  const pen = on && tool === "spidol", rub = on && tool === "hapus";
  const add = (s: InkStroke, e: PointerEvent) => {
    // Pakai semua titik antara dari browser agar coretan cepat tetap mulus.
    const evs = e.getCoalescedEvents?.() ?? [];
    for (const ev of evs.length ? evs : [e]) { const x = ev.clientX + scrollX, y = ev.clientY + scrollY, n = s.p.length; if (n && Math.hypot(x - s.p[n - 2], y - s.p[n - 1]) < 0.8) continue; s.p.push(x, y); }
  };
  const down = (e: React.PointerEvent) => { if (e.button > 0) return; (e.target as HTMLElement).setPointerCapture(e.pointerId); drawing.current = { c: color, p: [e.clientX + scrollX, e.clientY + scrollY] }; paintInk(); };
  const moveInk = (e: React.PointerEvent) => { if (!drawing.current) return; add(drawing.current, e.nativeEvent); paintInk(); };
  const up = () => { if (!drawing.current) return; ink.current.push(drawing.current); drawing.current = null; setInkCount(ink.current.length); paintInk(); };
  // Penghapus: coretan spidol yang tersentuh langsung hilang, seperti penghapus kertas coret.
  const rubAt = (e: PointerEvent) => {
    const evs = e.getCoalescedEvents?.() ?? [], before = ink.current.length;
    for (const ev of evs.length ? evs : [e]) { const x = ev.clientX + scrollX, y = ev.clientY + scrollY; ink.current = ink.current.filter(st => !touches(st, x, y)); }
    if (ink.current.length !== before) { setInkCount(ink.current.length); paintInk(); }
  };
  const rubDown = (e: React.PointerEvent) => { if (e.button > 0) return; (e.target as HTMLElement).setPointerCapture(e.pointerId); erasing.current = true; rubAt(e.nativeEvent); };
  const rubMove = (e: React.PointerEvent) => { if (erasing.current) rubAt(e.nativeEvent); };
  const rubUp = () => { erasing.current = false; };

  if (!on) return <button type="button" data-presenter data-testid="presenter-open" onClick={() => setOn(true)}
    className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2.5 sm:px-4 text-sm font-medium shadow-[0_4px_14px_-6px_rgb(23_53_42/0.35)] hover:border-success focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40 print:hidden sm:bottom-6 sm:left-6">
    <Presentation className="size-4 text-success" strokeWidth={1.75} aria-hidden="true" /><span className="sr-only sm:not-sr-only">Mode menjelaskan</span></button>;

  return <>
    {/* Coretan spidol (tetap ada). Kanvas hanya menangkap sentuhan saat spidol aktif. */}
    <canvas ref={inkRef} data-testid="presenter-ink" aria-hidden="true" onPointerDown={pen ? down : rub ? rubDown : undefined} onPointerMove={pen ? moveInk : rub ? rubMove : undefined} onPointerUp={pen ? up : rub ? rubUp : undefined} onPointerCancel={pen ? up : rub ? rubUp : undefined}
      className={`fixed inset-0 z-[45] h-screen w-screen touch-none ${pen ? "cursor-crosshair" : rub ? "cursor-cell" : "pointer-events-none"}`} data-ink={inkCount} />
    {/* Jejak laser. */}
    <canvas ref={laserRef} data-testid="presenter-canvas" aria-hidden="true" className="pointer-events-none fixed inset-0 z-[46] h-screen w-screen" />
    {tool === "laser" && pos && <span data-testid="presenter-dot" aria-hidden="true" className="pointer-events-none fixed z-[47] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e11d2e] shadow-[0_0_12px_4px_rgb(225_29_46/0.55)]" style={{ left: pos.x, top: pos.y }} />}
    <div data-presenter role="toolbar" aria-label="Mode menjelaskan" data-tool={tool}
      className="fixed bottom-20 left-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1 rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-[0_6px_20px_-8px_rgb(23_53_42/0.45)] print:hidden sm:bottom-6 sm:left-6">
      {TOOLS.map(({ id, label, key, Icon }) => <button key={id} type="button" aria-pressed={tool === id} onClick={() => setTool(id)}
        title={`${label} (tombol ${key})`} className={`btn btn-sm gap-1.5 ${tool === id ? "btn-success" : "btn-ghost"}`}><Icon className="size-4" strokeWidth={1.75} aria-hidden="true" /><span className="sr-only sm:not-sr-only">{label}</span></button>)}
      {tool === "spidol" && <span role="radiogroup" aria-label="Warna spidol" className="flex items-center gap-1 ps-1">{INKS.map(k => <button key={k.id} type="button" role="radio" aria-checked={color === k.c} aria-label={k.label} title={k.label} onClick={() => setColor(k.c)}
        className={`grid size-8 place-items-center rounded-full border-2 ${color === k.c ? "border-base-content" : "border-transparent"}`}><span className="size-5 rounded-full" style={{ background: k.c }} /></button>)}</span>}
      <button type="button" aria-label="Urungkan coretan" title="Urungkan (Ctrl+Z)" className="btn btn-sm btn-square btn-ghost" disabled={inkCount === 0} onClick={undo}><Undo2 className="size-4" strokeWidth={1.75} aria-hidden="true" /></button>
      <button type="button" aria-label="Hapus semua coretan" title="Hapus semua coretan" className="btn btn-sm btn-square btn-ghost" disabled={inkCount === 0} onClick={clearInk}><Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" /></button>
      <button type="button" aria-label="Tutup mode menjelaskan" title="Tutup (Esc)" className="btn btn-sm btn-square btn-ghost" onClick={close}><X className="size-4" aria-hidden="true" /></button>
      <p className="hidden w-full px-1.5 pb-0.5 text-[11px] text-base-content/60 sm:block">{tool === "laser" ? "Gerakkan kursor atau jari. Di layar sentuh halaman tidak bergeser; pilih Geser untuk menggulir." : tool === "spidol" ? "Coret di layar. Coretan tetap ada sampai diurungkan atau dihapus, dan ikut bergeser bersama halaman." : tool === "hapus" ? "Geser di atas coretan spidol untuk menghapus coretan yang tersentuh." : "Layar bisa digulir dan disentuh seperti biasa. Coretan tetap terlihat."}</p>
    </div>
  </>;
}
