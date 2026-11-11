import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { MaterialCard } from "@/components/class/MaterialCard";
import { classes } from "@/components/home/home-data";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { getMaterialsByClass } from "@/data/materials";

export function generateStaticParams() {
  return classes.map(({ slug }) => ({ slug }));
}

async function ClassPageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const legacyClass = Number(slug);
  if (Number.isInteger(legacyClass)) {
    const legacyItem = classes.find((item) => item.id === legacyClass);
    if (legacyItem) redirect(`/kelas/${legacyItem.slug}`);
  }
  const classItem = classes.find((item) => item.slug === slug);
  if (!classItem) notFound();
  const classMaterials = getMaterialsByClass(classItem.id);

  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-14"><Link href="/#kelas" className="btn btn-ghost btn-sm mb-6 gap-1.5 px-0 text-base-content/60 hover:bg-transparent hover:text-success"><ArrowLeft className="size-4" aria-hidden="true" />Kembali ke semua kelas</Link><section className="card relative overflow-hidden border border-success/20 bg-success text-success-content shadow-xl shadow-success/10"><Image src="/math-learning-overlay.png" alt="" width={700} height={700} className="pointer-events-none absolute -right-20 -top-24 hidden w-96 opacity-20 mix-blend-screen lg:block" /><div className="card-body relative p-6 sm:p-10 lg:p-14"><div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-end"><div><h1 className="text-6xl font-extrabold tracking-normal sm:text-8xl">Kelas {classItem.id}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-success-content/80 sm:text-lg">{classItem.tag}. Fase {classItem.phase}: materi disusun bertahap agar anak dapat belajar dengan nyaman.</p></div><div className="hidden text-[9rem] font-extrabold leading-none text-success-content/10 sm:block">{classItem.id}</div></div></div></section><section className="mt-8"><div className="mb-5"><h2 className="text-3xl font-extrabold tracking-normal">Materi kelas {classItem.id}</h2><p className="mt-3 max-w-2xl text-base leading-7 text-base-content/60">Pilih materi, tonton penjelasannya, lalu coba latihan untuk menguatkan pemahaman.</p></div>{classMaterials.length > 0 ? <div className="grid gap-5 md:grid-cols-2">{classMaterials.map((material) => <MaterialCard key={material.id} material={material} classSlug={classItem.slug} />)}</div> : <div className="alert border border-base-300 bg-base-100 text-base-content"><span>Materi untuk kelas ini sedang disiapkan. Coba pilih kelas 1 untuk melihat contoh materi.</span></div>}</section></div><SiteFooter /></main>;
}

export default function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-base-100" />}><ClassPageContent params={params} /></Suspense>;
}
