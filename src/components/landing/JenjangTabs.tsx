"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type ClassGroup = { classId: number; chapters: { title: string; slug: string; chapter: number }[]; slug: string };
export type Level = { id: "sd" | "smp" | "sma"; name: string; classes: ClassGroup[] };

/** Daftar bab sungguhan per jenjang, diambil dari data materi. */
export function JenjangTabs({ levels }: { levels: Level[] }) {
  const [active, setActive] = useState(levels[0].id); const lv = levels.find(l => l.id === active)!;
  return <div>
    <div role="tablist" aria-label="Jenjang" className="flex gap-2">
      {levels.map(l => <button key={l.id} type="button" role="tab" aria-selected={l.id === active} onClick={() => setActive(l.id)}
        className={`btn btn-sm flex-1 rounded-full ${l.id === active ? "btn-success" : "btn-outline btn-success bg-white"}`}>{l.name}</button>)}
    </div>
    <div role="tabpanel" aria-label={`Bab ${lv.name}`} className="mt-3 grid gap-2.5 sm:grid-cols-2">
      {lv.classes.map(c => <div key={c.classId} className="rounded-xl bg-[#f4faf7] p-3">
        <div className="flex items-baseline justify-between gap-2"><h3 className="font-extrabold">Kelas {c.classId}</h3><span className="text-sm text-base-content/60">{c.chapters.length} bab</span></div>
        <ul className="mt-2 space-y-1 text-sm">{c.chapters.slice(0, 5).map(ch => <li key={ch.slug} className="flex gap-2"><BookOpen className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={1.75} aria-hidden="true" /><span>{ch.title}</span></li>)}
          {c.chapters.length > 5 && <li className="ps-6 text-base-content/60">dan {c.chapters.length - 5} bab lainnya</li>}</ul>
        <Link href={`/kelas/${c.slug}`} className="link link-success mt-3 inline-block text-sm font-semibold">Lihat Kelas {c.classId}</Link>
      </div>)}
    </div>
  </div>;
}
