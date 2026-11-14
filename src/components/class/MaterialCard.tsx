import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import type { MaterialItem } from "@/data/materials";
import { TopicArt, topicKind, topicTone } from "./TopicArt";

/** Kartu bab di halaman kelas: panel gambar sesuai topik, nomor bab besar, judul, dan ringkasan. */
export function MaterialCard({ material, classSlug, free = false }: { material: MaterialItem; classSlug: string; free?: boolean }) {
  const kind = topicKind(material.topic, material.title), tone = topicTone[kind];
  return <Link id={`bab-${material.chapter}`} href={`/kelas/${classSlug}/materi/${material.slug}`}
    className="group relative flex scroll-mt-24 flex-col overflow-hidden rounded-md border border-neutral/10 bg-base-100 shadow-[0_1px_2px_rgb(23_53_42/0.06)] transition duration-300 hover:-translate-y-1 hover:border-neutral/25 hover:shadow-[0_12px_28px_-14px_rgb(23_53_42/0.4)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40">
    <div className="relative h-36 overflow-hidden sm:h-40" style={{ background: tone.bg, backgroundImage: `radial-gradient(${tone.line} 1.2px, transparent 1.3px)`, backgroundSize: "16px 16px" }}>
      <span aria-hidden="true" className="absolute -bottom-5 left-3 select-none text-[6.5rem] font-extrabold leading-none tracking-tight" style={{ color: "transparent", WebkitTextStroke: `2px ${tone.line}` }}>{String(material.chapter).padStart(2, "0")}</span>
      <TopicArt kind={kind} className="absolute right-3 top-1/2 h-[82%] -translate-y-1/2 transition duration-300 group-hover:scale-105 sm:right-5" />
      {free && <span className="absolute left-3 top-3 rounded-sm bg-neutral px-2 py-1 text-xs font-bold text-neutral-content">Gratis dicoba</span>}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <p className="text-sm font-bold text-success">Bab {material.chapter}<span className="font-semibold text-base-content/50">, {material.topic}</span></p>
      <h3 className="mt-1 text-xl font-extrabold leading-snug">{material.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-base-content/65">{material.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
        <span className="inline-flex items-center gap-1.5 text-base-content/50"><PlayCircle className="size-4" strokeWidth={1.75} aria-hidden="true" />{material.videoStatus === "available" ? "Ada video" : "Video menyusul"}</span>
        <span className="inline-flex items-center gap-1 font-bold text-success">Buka bab<ArrowRight className="size-4 transition duration-300 group-hover:translate-x-1" strokeWidth={2} aria-hidden="true" /></span>
      </div>
    </div>
  </Link>;
}
