import Link from "next/link";
import type { MaterialItem } from "@/data/materials";

export function MaterialCard({ material, classSlug }: { material: MaterialItem; classSlug: string }) {
  return <Link href={`/kelas/${classSlug}/materi/${material.slug}`} className="group card border border-base-300 bg-base-100 transition hover:-translate-y-1 hover:border-success/50 hover:shadow-lg"><div className="card-body p-5"><div className="flex items-center justify-between gap-3"><span className="badge badge-success badge-outline">Materi {String(material.chapter).padStart(2, "0")}</span><span className="badge badge-ghost">{material.videoStatus === "available" ? "Video tersedia" : "Segera hadir"}</span></div><p className="mt-4 text-xs font-bold uppercase tracking-wider text-success">{material.topic}</p><h3 className="card-title mt-1 text-lg">{material.title}</h3><p className="text-sm leading-6 text-base-content/60">{material.description}</p><div className="card-actions mt-4 justify-end"><span className="text-sm font-bold text-success transition group-hover:translate-x-1">Lihat materi -&gt;</span></div></div></Link>;
}
