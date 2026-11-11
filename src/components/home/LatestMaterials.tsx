import Link from "next/link";
import type { CSSProperties } from "react";
import { materials } from "@/data/materials";
import { classes } from "./home-data";
import { TopicIcon } from "./TopicIcon";

/** Materi terbaru: daftar materi di materials.ts sudah tersusun dari yang terbaru. */
export function LatestMaterials() {
  const latest = materials.slice(0, 6);
  return (
    <section id="materi-terbaru" aria-labelledby="materi-terbaru-title" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-20">
      <div className="bsk-reveal flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-success">Baru ditambahkan</p>
          <h2 id="materi-terbaru-title" className="mt-3 text-4xl font-extrabold sm:text-5xl">Materi terbaru</h2>
          <p className="mt-3 max-w-lg text-base-content/60">Setiap materi berisi peraga interaktif, latihan per subtopik, dan evaluasi dengan pembahasan.</p>
        </div>
        <a href="#kelas" className="link link-success font-bold no-underline hover:underline">Lihat semua kelas →</a>
      </div>
      <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3" aria-label="Daftar materi terbaru, geser ke samping di layar kecil">
        {latest.map((m, i) => {
          const classItem = classes.find((c) => c.id === m.classId);
          if (!classItem) return null;
          return (
            <Link key={m.id} href={`/kelas/${classItem.slug}/materi/${m.slug}`}
              className="group relative flex w-[82%] shrink-0 snap-start flex-col sm:w-auto sm:min-w-0 overflow-hidden rounded-box border border-base-300 bg-base-100 p-6 transition duration-300 hover:-translate-y-1 hover:border-success/50 hover:shadow-xl hover:shadow-success/10"
              style={{ "--d": `${i * 0.06}s` } as CSSProperties}>
              <span aria-hidden="true" className="absolute -right-4 -top-6 text-8xl font-extrabold text-base-content/[0.04] transition duration-500 group-hover:-translate-y-1 group-hover:text-success/10">{m.chapter}</span>
              <div className="flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-2xl bg-success/10 text-success transition duration-300 group-hover:rotate-6 group-hover:scale-105"><TopicIcon topic={m.topic} /></span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-success">Kelas {m.classId} · Bab {m.chapter}</p>
                  <p className="truncate text-xs text-base-content/50">{m.topic}</p>
                </div>
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{m.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-base-content/60">{m.description}</p>
              <span className="mt-auto pt-5 text-sm font-bold text-success">Buka materi <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1">→</span></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
