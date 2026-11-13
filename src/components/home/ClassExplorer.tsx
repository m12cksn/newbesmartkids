"use client";
import { ArrowRight } from "lucide-react";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClassCardArt } from "./ClassCardArt";
import { classes, phases, type Phase } from "./home-data";

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
          const count = counts[id] ?? 0;
          return (
            <Link key={id} href={`/kelas/${slug}`} aria-label={`Kelas ${id}, ${phase}, ${count ? `${count} materi tersedia` : "segera hadir"}`}
              className="bsk-reveal group relative flex flex-col overflow-hidden rounded-md border border-neutral/10 bg-base-100 shadow-[0_1px_2px_rgb(23_53_42/0.06)] transition duration-300 hover:-translate-y-1 hover:border-neutral/25 hover:shadow-[0_10px_24px_-12px_rgb(23_53_42/0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40">
              <ClassCardArt id={id} />
              <div className="flex flex-1 flex-col items-center gap-1 px-3 pb-4 pt-3 text-center sm:px-5 sm:pb-5 sm:pt-4">
                <p className="text-base font-extrabold leading-tight sm:text-lg">Kelas {id}</p>
                <p className="text-xs leading-snug text-base-content/60 sm:text-sm">{tag}</p>
                <p className="text-[11px] text-base-content/45 sm:text-xs">Fase {phase}</p>
                <p className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold sm:text-xs ${count ? "text-success" : "text-base-content/40"}`}>
                  {count ? <>{count} materi<ArrowRight className="size-3.5 transition duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden="true" /></> : "Segera hadir"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
