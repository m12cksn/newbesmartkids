"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { classes, phases, type Phase } from "./home-data";

const motifs = ["1 2 3", "+ −", "× ÷", "½ ¼", "□ △", "% ,", "x y", "∠ °", "√ ²", "f(x)", "Σ", "∫"];

export function ClassExplorer({ counts }: { counts: Record<number, number> }) {
  const [activePhase, setActivePhase] = useState<Phase>("Semua kelas");
  const visibleClasses = useMemo(
    () =>
      activePhase === "Semua kelas"
        ? classes
        : classes.filter((item) => item.phase === activePhase),
    [activePhase],
  );

  return (
    <section
      id="kelas"
      className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-success">
            Ruang belajar
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-normal sm:text-5xl">
            Mulai dari kelasmu
          </h2>
          <p className="mt-4 max-w-lg text-base text-base-content/60">
            Setiap kelas memiliki materi yang disusun sesuai tahap belajar anak.
          </p>
        </div>
        <div
          role="tablist"
          className="tabs tabs-boxed w-fit max-w-full overflow-x-auto bg-base-200"
        >
          {phases.map((phase) => (
            <button
              key={phase}
              type="button"
              role="tab"
              aria-selected={activePhase === phase}
              onClick={() => setActivePhase(phase)}
              className={`tab whitespace-nowrap ${activePhase === phase ? "tab-active" : ""}`}
            >
              {phase}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {visibleClasses.map(({ id, slug, phase, tag, tone }) => (
          <Link
            key={id}
            href={`/kelas/${slug}`}
            className="bsk-reveal group card relative overflow-hidden border border-base-300 bg-base-100 transition duration-300 hover:-translate-y-1 hover:border-success/50 hover:shadow-xl hover:shadow-success/10"
          >
            <span aria-hidden="true" className="bsk-graph-paper pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="card-body relative p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <span className={`badge badge-${tone} badge-outline badge-sm sm:badge-md`}>
                  {phase}
                </span>
                <span className="text-3xl font-extrabold text-base-content/10 sm:text-4xl transition duration-300 group-hover:-translate-y-0.5 group-hover:text-success/40">{id}</span>
              </div>
              <p aria-hidden="true" className="mt-3 font-mono text-sm font-bold tracking-widest text-success/40 transition duration-300 group-hover:tracking-[0.3em] group-hover:text-success/70">{motifs[id - 1]}</p>
              <div className="mt-3">
                <p className="text-xs text-base-content/50 sm:text-sm">{tag}</p>
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="card-title text-lg">Kelas {id}</h3>
                  <span className="text-xl text-success transition group-hover:translate-x-1">
                    -&gt;
                  </span>
                </div>
                <p className={`mt-2 text-xs font-bold ${counts[id] ? "text-success" : "text-base-content/40"}`}>{counts[id] ? `${counts[id]} materi tersedia` : "Segera hadir"}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
