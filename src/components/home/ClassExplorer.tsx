"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { classes, phases, type Phase } from "./home-data";

export function ClassExplorer() {
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
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
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
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleClasses.map(({ id, slug, phase, tag, tone }) => (
          <Link
            key={id}
            href={`/kelas/${slug}`}
            className="group card border border-base-300 bg-base-100 transition duration-200 hover:-translate-y-1 hover:border-success/50 hover:shadow-xl"
          >
            <div className="card-body p-5">
              <div className="flex items-start justify-between">
                <span className={`badge badge-${tone} badge-outline`}>
                  {phase}
                </span>
                <span className="text-4xl font-extrabold text-base-content/10">{id}</span>
              </div>
              <div className="mt-8">
                <p className="text-sm text-base-content/50">{tag}</p>
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="card-title text-lg">Kelas {id}</h3>
                  <span className="text-xl text-success transition group-hover:translate-x-1">
                    -&gt;
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
