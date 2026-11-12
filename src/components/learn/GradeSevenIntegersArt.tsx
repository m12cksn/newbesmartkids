import { Cloud, CloudFog, CloudRain, CloudSnow, Sun } from "lucide-react";
import { show, type Weather } from "@/data/grade-seven-integers";

/* ---------- Termometer suhu ruangan ---------- */
export function Thermometer({ temp, min = -30, max = 50 }: { temp: number; min?: number; max?: number }) {
  const top = 14, bottom = 196, y = (t: number) => bottom - ((t - min) / (max - min)) * (bottom - top);
  const ticks: number[] = []; for (let t = min; t <= max; t += 10) ticks.push(t);
  return <svg viewBox="0 0 90 240" className="h-56 w-auto" role="img" aria-label={`Termometer menunjukkan ${show(temp)} derajat Celsius`}>
    <rect x="22" y="2" width="46" height="236" rx="23" fill="#eaf4fb" stroke="#9cc3df" strokeWidth="2" />
    <rect x="40" y={top - 4} width="10" height={bottom - top + 14} rx="5" fill="#ffffff" stroke="#c9d6df" />
    <rect x="42" y={y(temp)} width="6" height={bottom - y(temp) + 12} fill="#e5484d" />
    <circle cx="45" cy="214" r="12" fill="#e5484d" stroke="#b42318" strokeWidth="1.5" />
    {ticks.map(t => <g key={t}><line x1="51" x2="58" y1={y(t)} y2={y(t)} stroke="#33413b" strokeWidth="1.2" /><text x="60" y={y(t) + 3.5} fontSize="9" fontWeight="700" fill={t < 0 ? "#1c64b5" : t > 0 ? "#b42318" : "#33413b"}>{show(t)}</text></g>)}
    {ticks.slice(0, -1).map(t => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => <line key={`${t}-${k}`} x1="51" x2={k === 5 ? 56 : 54} y1={y(t + k)} y2={y(t + k)} stroke="#55625c" strokeWidth="0.6" />))}
    <text x="31" y="20" fontSize="10" fontWeight="800" fill="#33413b">°C</text>
  </svg>;
}

/* ---------- Garis bilangan ---------- */
export type Arrow = { from: number; to: number; color: string; row: number };
export function NumberLine({ min, max, step = 1, labelEvery = 1, marks = [], arrows = [], onTick, selected, label }: {
  min: number; max: number; step?: number; labelEvery?: number; marks?: { v: number; label?: string; color?: string }[]; arrows?: Arrow[];
  onTick?: (v: number) => void; selected?: string; label?: string;
}) {
  const n = Math.round((max - min) / step), W = Math.max(320, n * 34 + 40), L = 22, base = 70, x = (v: number) => L + ((v - min) / (max - min)) * (W - 2 * L);
  const vals = Array.from({ length: n + 1 }, (_, k) => min + k * step);
  const rows = Math.max(0, ...arrows.map(a => a.row + 1));
  // Label titik disusun ke baris berikutnya bila terlalu berdekatan.
  const ends: number[] = [];
  const labelRows = [...marks].filter(m => m.label).sort((a, b) => a.v - b.v).map(m => { const w = (m.label!.length * 7.4) / 2, cx = x(m.v); let row = ends.findIndex(e => e < cx - w - 4); if (row < 0) { row = ends.length; ends.push(0); } ends[row] = cx + w; return { m, row }; });
  const labelH = Math.max(1, ends.length) * 13;
  return <svg viewBox={`0 ${-rows * 14} ${W} ${base + 30 + labelH + rows * 14}`} className="mx-auto w-full" style={{ minWidth: Math.min(W, 640) * 0.85, maxWidth: W * 1.25 }} role="img" aria-label={label ?? `Garis bilangan dari ${show(min)} sampai ${show(max)}`}>
    <defs><marker id="nl-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke" /></marker></defs>
    <line x1="4" x2={W - 4} y1={base} y2={base} stroke="#33413b" strokeWidth="2" markerStart="url(#nl-head)" markerEnd="url(#nl-head)" />
    {arrows.map((a, k) => { const yy = base - 16 - a.row * 14; return <line key={k} x1={x(a.from)} x2={x(a.to)} y1={yy} y2={yy} stroke={a.color} strokeWidth="3" markerEnd="url(#nl-head)" />; })}
    {vals.map((v, k) => <g key={v}>
      <line x1={x(v)} x2={x(v)} y1={base - 7} y2={base + 7} stroke={v === 0 ? "#1f3b30" : "#55625c"} strokeWidth={v === 0 ? 2.2 : 1.4} />
      {k % labelEvery === 0 && <text x={x(v)} y={base + 22} fontSize="12" fontWeight={v === 0 ? 800 : 700} textAnchor="middle" fill={v < 0 ? "#1c64b5" : v > 0 ? "#b42318" : "#1f3b30"}>{show(v)}</text>}
      {onTick && <rect x={x(v) - 15} y={base - 22} width="30" height="54" fill="transparent" className="cursor-pointer" role="button" aria-label={`Letakkan ${selected ?? "titik"} di ${show(v)}`} tabIndex={0}
        onClick={() => onTick(v)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTick(v); } }} />}
    </g>)}
    {marks.map((m, k) => <circle key={`c${k}`} cx={x(m.v)} cy={base} r="6" fill={m.color ?? "#e8590c"} stroke="#ffffff" strokeWidth="1.5" pointerEvents="none" />)}
    {labelRows.map(({ m, row }, k) => <text key={`t${k}`} x={x(m.v)} y={base + 38 + row * 13} fontSize="10.5" fontWeight="800" textAnchor="middle" fill={m.color ?? "#e8590c"} pointerEvents="none">{m.label}</text>)}
  </svg>;
}

/* ---------- Kartu cuaca ---------- */
const weatherIcon: Record<Weather, typeof Sun> = { salju: CloudSnow, hujan: CloudRain, berawan: Cloud, cerah: Sun, kabut: CloudFog };
const weatherName: Record<Weather, string> = { salju: "Salju", hujan: "Hujan", berawan: "Berawan", cerah: "Cerah", kabut: "Kabut" };
export function WeatherCard({ city, temp, weather }: { city: string; temp: number; weather: Weather }) {
  const Icon = weatherIcon[weather];
  return <div className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-1.5">
    <Icon className={`size-6 shrink-0 ${weather === "cerah" ? "text-warning" : "text-info"}`} strokeWidth={1.75} aria-hidden="true" />
    <span className="w-16 text-right text-2xl font-extrabold tabular-nums">{show(temp)}</span><span className="text-xs font-bold">°C</span>
    <span className="ms-auto text-right text-xs leading-tight"><span className="block font-bold">{city}</span><span className="text-base-content/60">{weatherName[weather]}</span></span>
  </div>;
}

/* ---------- Mesin pendingin ruang ---------- */
export function AcPanel({ temp, buttons }: { temp: number; buttons: number[] }) {
  const neg = buttons.filter(b => b < 0), pos = buttons.filter(b => b > 0);
  const Btn = ({ b }: { b: number }) => <span className="flex items-center gap-1 text-xs font-bold"><span className="inline-block size-3.5 rounded-full border-2 border-info bg-white" />× ({b > 0 ? "+" : "−"}{Math.abs(b)})</span>;
  return <figure className="w-full max-w-sm rounded-2xl border-2 border-info/40 bg-info/5 p-3">
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <div className="space-y-2">{neg.map(b => <Btn key={b} b={b} />)}</div>
      <div className="rounded-lg bg-[#dfe9d8] px-3 py-2 text-center font-mono text-3xl font-bold text-[#1f3b30]" aria-label={`Suhu ${show(temp)} derajat Celsius`}>{show(temp)}<span className="text-base">°C</span></div>
      <div className="space-y-2">{pos.map(b => <Btn key={b} b={b} />)}</div>
    </div>
    <figcaption className="mt-2 text-center text-xs text-base-content/60">Mesin pendingin ruang: suhu dikalikan dengan angka pada tombol.</figcaption>
  </figure>;
}

/* ---------- Buku tabungan ---------- */
export function BankBook({ owner, rows }: { owner: string; rows: { month: string; debit: number | null; credit: number | null }[] }) {
  return <figure className="w-full max-w-md overflow-hidden rounded-xl border-2 border-[#1c3d6e] bg-white">
    <figcaption className="flex items-center justify-between bg-[#1c3d6e] px-3 py-1.5 text-xs font-bold text-white"><span>Buku Tabungan</span><span>{owner}</span></figcaption>
    <table className="w-full text-center text-sm">
      <thead><tr className="bg-info/10 text-xs"><th className="px-2 py-1 text-left">Tanggal</th><th className="px-2 py-1">Debit (keluar)</th><th className="px-2 py-1">Kredit (masuk)</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.month} className="border-t border-base-300"><td className="px-2 py-1.5 text-left font-semibold">{r.month} 2022</td><td className="px-2 py-1.5 tabular-nums">{r.debit ? show(r.debit) + ",00" : ""}</td><td className="px-2 py-1.5 tabular-nums">{r.credit ? show(r.credit) + ",00" : ""}</td></tr>)}</tbody>
    </table>
  </figure>;
}

/* ---------- Tombol pengatur suhu (dial) ---------- */
export function Dial({ value, min, max, label }: { value: number; min: number; max: number; label: string }) {
  const n = max - min, ang = (v: number) => -135 + ((v - min) / n) * 270;
  return <svg viewBox="0 0 80 80" className="size-20" role="img" aria-label={`${label} menunjuk ${show(value)}`}>
    {Array.from({ length: n + 1 }, (_, k) => { const v = min + k, a = (ang(v) * Math.PI) / 180, r1 = 30, r2 = v === 0 ? 24 : 26;
      return <g key={v}><line x1={40 + Math.sin(a) * r2} y1={44 - Math.cos(a) * r2} x2={40 + Math.sin(a) * r1} y2={44 - Math.cos(a) * r1} stroke="#55625c" strokeWidth="1.2" />
        {(v === min || v === max || v === 0) && <text x={40 + Math.sin(a) * 37} y={47 - Math.cos(a) * 37} fontSize="8" textAnchor="middle" fill="#33413b">{show(v)}</text>}</g>; })}
    <circle cx="40" cy="44" r="18" fill="#dbe7f1" stroke="#5b8db8" strokeWidth="2" />
    <line x1="40" y1="44" x2={40 + Math.sin((ang(value) * Math.PI) / 180) * 15} y2={44 - Math.cos((ang(value) * Math.PI) / 180) * 15} stroke="#1c3d6e" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
