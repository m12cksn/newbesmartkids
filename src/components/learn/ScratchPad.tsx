"use client";

import { ChevronLeft, ChevronRight, Eraser, FilePlus2, GripHorizontal, Pencil, PenLine, Trash2, Undo2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Kertas coret: kertas petak untuk menghitung dengan jari, stylus, atau mouse.
 * Coretan hanya disimpan di perangkat ini (localStorage, per halaman) dan tidak dinilai.
 */
type Tool = "pencil" | "pen" | "eraser";
type Stroke = { c: "pencil" | "pen"; w: number; p: number[] }; // p = [x0, y0, x1, y1, ...] dalam piksel CSS kertas
type Sheet = Stroke[];

const COLORS = { pencil: "#3b4a44", pen: "#d93a2b" } as const;
const MAX_SHEETS = 10, MAX_STROKES = 600;
const DESKTOP = "(min-width: 900px)";

const keyFor = (path: string) => `bsk-coret:${path}`;
function load(path: string): Sheet[] {
  try { const v = JSON.parse(localStorage.getItem(keyFor(path)) ?? "null"); if (Array.isArray(v) && v.length) return v as Sheet[]; } catch { /* abaikan */ }
  return [[]];
}
function save(path: string, sheets: Sheet[]) {
  try {
    if (sheets.every(s => s.length === 0)) localStorage.removeItem(keyFor(path));
    else localStorage.setItem(keyFor(path), JSON.stringify(sheets));
  } catch { /* penyimpanan penuh atau diblokir: coretan tetap ada selama halaman terbuka */ }
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  const p = s.p;
  ctx.strokeStyle = COLORS[s.c]; ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(p[0], p[1]);
  if (p.length === 2) ctx.lineTo(p[0] + 0.01, p[1]);
  // Kurva halus melalui titik tengah antar-titik.
  for (let i = 2; i < p.length - 2; i += 2) ctx.quadraticCurveTo(p[i], p[i + 1], (p[i] + p[i + 2]) / 2, (p[i + 1] + p[i + 3]) / 2);
  if (p.length > 2) ctx.lineTo(p[p.length - 2], p[p.length - 1]);
  ctx.stroke();
}
const hits = (s: Stroke, x: number, y: number, r: number) => { for (let i = 0; i < s.p.length; i += 2) if (Math.hypot(s.p[i] - x, s.p[i + 1] - y) <= r + s.w) return true; return false; };

export function ScratchPad() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState<Tool>("pencil");
  const [sheets, setSheets] = useState<Sheet[]>([[]]);
  const [page, setPage] = useState(0);
  const [height, setHeight] = useState(55); // tinggi kertas di HP, dalam persen tinggi layar
  const [desktop, setDesktop] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const live = useRef<Stroke | null>(null);
  const penSeen = useRef(0);
  const sheetsRef = useRef(sheets);
  const pageRef = useRef(page);
  useEffect(() => { sheetsRef.current = sheets; pageRef.current = page; }, [sheets, page]);

  // Muat coretan halaman ini.
  useEffect(() => { void Promise.resolve().then(() => { const s = load(pathname); setSheets(s); setPage(s.length - 1); }); }, [pathname]);
  useEffect(() => { const m = matchMedia(DESKTOP); const f = () => setDesktop(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);

  const redraw = useCallback(() => {
    const c = canvasRef.current, box = boxRef.current; if (!c || !box) return;
    const dpr = window.devicePixelRatio || 1, w = box.clientWidth, h = box.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.width = `${w}px`; c.style.height = `${h}px`; }
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    for (const s of sheetsRef.current[pageRef.current] ?? []) drawStroke(ctx, s);
    if (live.current) drawStroke(ctx, live.current);
  }, []);
  useEffect(() => { if (open) redraw(); }, [open, sheets, page, height, desktop, redraw]);
  useEffect(() => {
    if (!open || !boxRef.current) return;
    const ro = new ResizeObserver(() => redraw()); ro.observe(boxRef.current); return () => ro.disconnect();
  }, [open, redraw]);

  // Beri ruang untuk kertas agar soal tetap bisa dilihat dan digulir.
  useEffect(() => {
    const b = document.body.style;
    if (!open) { b.paddingBottom = ""; b.paddingRight = ""; return; }
    if (desktop) { b.paddingRight = "440px"; b.paddingBottom = ""; } else { b.paddingBottom = `${height}vh`; b.paddingRight = ""; }
    return () => { b.paddingBottom = ""; b.paddingRight = ""; };
  }, [open, desktop, height]);

  const commit = useCallback((next: Sheet[]) => { setSheets(next); save(pathname, next); }, [pathname]);
  const undo = useCallback(() => { if (!sheets[page]?.length) return; commit(sheets.map((x, i) => (i === page ? x.slice(0, -1) : x))); }, [commit, sheets, page]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [open, undo]);

  const point = (e: React.PointerEvent) => { const r = canvasRef.current!.getBoundingClientRect(); return [Math.round((e.clientX - r.left) * 10) / 10, Math.round((e.clientY - r.top) * 10) / 10]; };
  function erase(x: number, y: number) {
    const cur = sheetsRef.current, s = cur[pageRef.current], keep = s.filter(st => !hits(st, x, y, 10));
    if (keep.length !== s.length) { const next = cur.map((v, i) => (i === pageRef.current ? keep : v)); sheetsRef.current = next; setSheets(next); }
  }
  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    if (e.pointerType === "pen") penSeen.current = Date.now();
    // Telapak tangan: abaikan sentuhan jari selama stylus baru saja dipakai.
    if (e.pointerType === "touch" && Date.now() - penSeen.current < 1500) return;
    if (e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = point(e);
    if (tool === "eraser") { erase(x, y); live.current = { c: "pencil", w: 0, p: [] }; return; }
    const base = tool === "pen" ? 2.4 : 2;
    const w = e.pointerType === "pen" && e.pressure > 0 ? base * (0.6 + e.pressure) : base;
    live.current = { c: tool, w: Math.round(w * 10) / 10, p: [x, y] };
    redraw();
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    const s = live.current; if (!s) return;
    const [x, y] = point(e);
    if (tool === "eraser") { erase(x, y); return; }
    const lx = s.p[s.p.length - 2], ly = s.p[s.p.length - 1];
    if (Math.hypot(x - lx, y - ly) < 1.2) return;
    s.p.push(x, y); redraw();
  }
  function up() {
    const s = live.current; live.current = null; if (!s) return;
    if (tool === "eraser") { save(pathname, sheetsRef.current); return; }
    const cur = sheetsRef.current;
    const next = cur.map((v, i) => (i === pageRef.current ? [...v, s].slice(-MAX_STROKES) : v));
    commit(next);
  }
  function newSheet() { const cur = sheetsRef.current; if (cur[cur.length - 1].length === 0) { setPage(cur.length - 1); return; } const next = [...cur, []].slice(-MAX_SHEETS); commit(next); setPage(next.length - 1); }
  function clearSheet() {
    if (!sheets[page]?.length || !confirm(`Hapus semua coretan di Kertas ${page + 1}?`)) return;
    let next = sheets.map((v, i) => (i === page ? [] : v));
    if (next.length > 1) { next = next.filter((_, i) => i !== page); setPage(Math.max(0, page - 1)); }
    commit(next);
  }

  // Tarik pegangan untuk mengubah tinggi kertas di HP.
  function drag(e: React.PointerEvent<HTMLButtonElement>) {
    const startY = e.clientY, startH = height; e.currentTarget.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => setHeight(Math.min(88, Math.max(30, startH + ((startY - ev.clientY) / innerHeight) * 100)));
    const onUp = () => { removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); };
    addEventListener("pointermove", onMove); addEventListener("pointerup", onUp);
  }

  const toolBtn = (t: Tool, label: string, Icon: typeof Pencil, color?: string, short = label) =>
    <button type="button" aria-pressed={tool === t} aria-label={label} title={label} onClick={() => setTool(t)}
      className={`flex h-10 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium ${tool === t ? "border-success bg-success/10 text-base-content" : "border-transparent text-base-content/70 hover:bg-base-200"}`}>
      <Icon className="size-[18px]" strokeWidth={1.75} style={color ? { color } : undefined} aria-hidden="true" /><span className="hidden sm:inline">{short}</span></button>;
  const iconBtn = (label: string, Icon: typeof Pencil, onClick: () => void, disabled = false) =>
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className="grid size-10 place-items-center rounded-lg text-base-content/70 hover:bg-base-200 disabled:opacity-30"><Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" /></button>;

  if (!open) return <button type="button" onClick={() => setOpen(true)} data-testid="scratch-open"
    className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2.5 text-sm font-medium text-base-content shadow-[0_4px_14px_-6px_rgb(23_53_42/0.35)] hover:border-success focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40 print:hidden sm:bottom-6 sm:right-6">
    <PenLine className="size-4 text-success" strokeWidth={1.75} aria-hidden="true" />Kertas coret</button>;

  const count = sheets.length, strokes = sheets[page]?.length ?? 0;
  return <section role="dialog" aria-modal="false" aria-label="Kertas coret" data-testid="scratch"
    className={`fixed z-40 flex flex-col border-base-300 bg-base-100 shadow-[0_-8px_24px_-12px_rgb(23_53_42/0.35)] print:hidden ${desktop ? "inset-y-0 right-0 w-[440px] border-l" : "inset-x-0 bottom-0 rounded-t-2xl border-t"}`}
    style={desktop ? undefined : { height: `${height}vh` }}>
    {!desktop && <button type="button" aria-label="Tarik untuk mengubah tinggi kertas" onPointerDown={drag} onKeyDown={e => { if (e.key === "ArrowUp") setHeight(h => Math.min(88, h + 5)); if (e.key === "ArrowDown") setHeight(h => Math.max(30, h - 5)); }}
      className="flex h-6 w-full cursor-ns-resize touch-none items-center justify-center text-base-content/40"><GripHorizontal className="size-5" aria-hidden="true" /></button>}
    <div className={`flex items-center justify-between gap-1 border-b border-base-300 px-2 ${desktop ? "py-2" : "pb-2"}`}>
      <div className="flex items-center gap-0.5" role="group" aria-label="Alat">
        {toolBtn("pencil", "Pensil", Pencil)}
        {toolBtn("pen", "Pulpen merah", PenLine, COLORS.pen, "Pulpen")}
        {toolBtn("eraser", "Penghapus", Eraser)}
        {iconBtn("Urungkan", Undo2, undo, strokes === 0)}
      </div>
      {iconBtn("Tutup kertas coret", X, () => setOpen(false))}
    </div>
    <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden"
      style={{ backgroundColor: "#fff", backgroundImage: "linear-gradient(#dbe7f3 1px, transparent 1px), linear-gradient(90deg, #dbe7f3 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      <canvas ref={canvasRef} data-testid="scratch-canvas" aria-label={`Kertas ${page + 1}, ${strokes} coretan. Gambar dengan jari, stylus, atau mouse.`} role="img"
        className={`absolute inset-0 touch-none select-none ${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-base-300 px-2 py-1.5">
      <div className="flex items-center gap-0.5">
        {iconBtn("Kertas sebelumnya", ChevronLeft, () => setPage(p => Math.max(0, p - 1)), page === 0)}
        <span className="min-w-[4.5rem] text-center text-sm text-base-content/70" aria-live="polite" data-testid="scratch-page">Kertas {page + 1} dari {count}</span>
        {iconBtn("Kertas berikutnya", ChevronRight, () => setPage(p => Math.min(count - 1, p + 1)), page >= count - 1)}
      </div>
      <div className="flex items-center gap-0.5">
        <button type="button" onClick={newSheet} className="flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-base-content/80 hover:bg-base-200"><FilePlus2 className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />Kertas baru</button>
        {iconBtn("Hapus coretan di kertas ini", Trash2, clearSheet, strokes === 0)}
      </div>
    </div>
  </section>;
}
