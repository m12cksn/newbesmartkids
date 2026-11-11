"use client";
import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { classes, phases, type Phase } from "./home-data";

/** Simbol khas setiap jenjang, dipakai sebagai pola di panel kartu. */
const motifs = [["1", "2", "3"], ["+", "−", "="], ["×", "÷", "="], ["½", "¼", "¾"], ["□", "△", "○"], ["%", "0,5", "∶"], ["x", "y", "="], ["∠", "°", "△"], ["√", "x²", "π"], ["f(x)", "∞", "≈"], ["Σ", "Δ", "%"], ["∫", "dx", "lim"]];

/** Warna panel per fase, semuanya dari palet BeSmartKids (hijau, hijau gelap, kuning). */
const phaseStyle: Record<Exclude<Phase, "Semua kelas">, { panel: string; ink: string; soft: string; chip: string }> = {
  Fondasi: { panel: "bg-success", ink: "text-white", soft: "text-white/20", chip: "bg-white/15 text-white ring-white/30" },
  Akselerasi: { panel: "bg-neutral", ink: "text-white", soft: "text-success/45", chip: "bg-success/25 text-white ring-success/50" },
  Mahir: { panel: "bg-warning", ink: "text-neutral", soft: "text-neutral/15", chip: "bg-neutral/10 text-neutral ring-neutral/20" },
  Terapan: { panel: "bg-[#14674f]", ink: "text-white", soft: "text-warning/35", chip: "bg-warning/20 text-warning ring-warning/40" },
};

export function ClassExplorer({ counts }: { counts: Record<number, number> }) {
  const [activePhase, setActivePhase] = useState<Phase>("Semua kelas");
  const visibleClasses = useMemo(
    () => activePhase === "Semua kelas" ? classes : classes.filter((item) => item.phase === activePhase),
    [activePhase],
  );

  return (
    <section id="kelas" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-normal sm:text-5xl">Mulai dari kelasmu</h2>
          <p className="mt-4 max-w-lg text-base text-base-content/60">Setiap kelas memiliki materi yang disusun sesuai tahap belajar anak.</p>
        </div>
        <div role="tablist" aria-label="Fase belajar" className="flex w-fit max-w-full flex-wrap gap-1 rounded-2xl bg-base-200 p-1">
          {phases.map((phase) => (
            <button key={phase} type="button" role="tab" aria-selected={activePhase === phase} onClick={() => setActivePhase(phase)}
              className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${activePhase === phase ? "bg-neutral text-white shadow" : "text-base-content/60 hover:text-base-content"}`}>
              {phase}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {visibleClasses.map(({ id, slug, phase, tag }) => {
          const style = phaseStyle[phase];
          const count = counts[id] ?? 0;
          return (
            <Link key={id} href={`/kelas/${slug}`} aria-label={`Kelas ${id}, ${phase}, ${count ? `${count} materi tersedia` : "segera hadir"}`}
              className="bsk-reveal group relative flex flex-col overflow-hidden rounded-3xl border-2 border-neutral/10 bg-base-100 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-neutral hover:shadow-[6px_6px_0_0_#17352a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40">
              {/* Panel berwarna: nomor kelas besar dan pola simbol */}
              <div className={`relative h-32 overflow-hidden sm:h-36 ${style.panel}`}>
                <span aria-hidden="true" className="bsk-graph-paper absolute inset-0 opacity-40 mix-blend-overlay" />
                <span aria-hidden="true" className={`absolute right-2 top-1 flex flex-col items-end gap-0.5 text-lg font-extrabold leading-none sm:right-3 sm:top-2 sm:text-2xl ${style.soft}`}>
                  {motifs[id - 1].map((m, i) => <span key={m} className="bsk-drift" style={{ "--t": `${8 + i * 2}s`, "--d": `${-i * 2 - id}s`, "--r": `${i % 2 ? -8 : 8}deg`, "--dy": "-6px" } as CSSProperties}>{m}</span>)}
                </span>
                <div className={`absolute bottom-2 left-3 sm:bottom-3 sm:left-5 ${style.ink}`}>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] opacity-80 sm:text-xs">Kelas</span>
                  <span className="block origin-bottom-left text-6xl font-extrabold leading-[0.85] tracking-tight transition duration-300 group-hover:scale-105 sm:text-7xl">{id}</span>
                </div>
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 sm:left-5 sm:text-xs ${style.chip}`}>{phase}</span>
              </div>

              {/* Isi kartu */}
              <div className="flex flex-1 flex-col gap-3 p-3 sm:p-5">
                <p className="text-sm font-extrabold leading-snug sm:text-base">{tag}</p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  {count
                    ? <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success sm:text-xs">{count} materi</span>
                    : <span className="rounded-full bg-base-200 px-2.5 py-1 text-[11px] font-bold text-base-content/45 sm:text-xs">Segera hadir</span>}
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-neutral text-neutral transition duration-300 group-hover:bg-neutral group-hover:text-white sm:size-9">
                    <ArrowRight className="size-4 transition duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
