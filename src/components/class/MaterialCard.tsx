import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TopicIcon } from "@/components/home/TopicIcon";
import type { MaterialItem } from "@/data/materials";

export function MaterialCard({ material, classSlug }: { material: MaterialItem; classSlug: string }) {
  return <Link href={`/kelas/${classSlug}/materi/${material.slug}`} className="group card border border-base-300 bg-base-100 transition hover:-translate-y-1 hover:border-success/50 hover:shadow-lg">
    <div className="card-body p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-success"><TopicIcon topic={material.topic} className="size-5" />Bab {material.chapter}, {material.topic}</span>
        <span className="badge badge-ghost">{material.videoStatus === "available" ? "Video tersedia" : "Video segera hadir"}</span>
      </div>
      <h3 className="card-title mt-3 text-lg">{material.title}</h3>
      <p className="text-sm leading-6 text-base-content/60">{material.description}</p>
      <div className="card-actions mt-4 justify-end"><span className="inline-flex items-center gap-1.5 text-sm font-bold text-success">Lihat materi <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" /></span></div>
    </div>
  </Link>;
}
