import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ClassHero, ChapterPath } from "@/components/class/ClassHero";
import { MaterialCard } from "@/components/class/MaterialCard";
import { freeMaterialSlugs } from "@/lib/access-rules";
import { classes } from "@/components/home/home-data";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { getMaterialsByClass } from "@/data/materials";

export function generateStaticParams() {
  return classes.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = classes.find(item => item.slug === slug);
  if (!c) return {};
  const list = getMaterialsByClass(c.id).map(m => m.title);
  const title = `Matematika Kelas ${c.id}`;
  const description = `Materi matematika Kelas ${c.id} Kurikulum Merdeka dengan peraga interaktif, latihan, dan evaluasi${list.length ? `: ${list.slice(0, 4).join(", ")}${list.length > 4 ? ", dan lainnya" : ""}` : ""}.`;
  return { title, description, alternates: { canonical: `/kelas/${c.slug}` }, openGraph: { title: `${title} | BeSmartKids`, description, url: `/kelas/${c.slug}` } };
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
  const classMaterials = [...getMaterialsByClass(classItem.id)].sort((a, b) => a.chapter - b.chapter);

  const free = classMaterials.find(m => freeMaterialSlugs.has(m.slug)) ?? null;

  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader />
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
      <Link href="/#kelas" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-base-content/60 hover:text-success"><ArrowLeft className="size-4" aria-hidden="true" />Semua kelas</Link>
      <ClassHero id={classItem.id} slug={classItem.slug} tag={classItem.tag} phase={classItem.phase} list={classMaterials} free={free} />
      <section id="daftar-bab" aria-labelledby="judul-bab" className="mt-12 scroll-mt-20 sm:mt-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="judul-bab" className="text-3xl font-extrabold sm:text-4xl">Bab di Kelas {classItem.id}</h2>
          {classMaterials.length > 0 && <p className="max-w-md text-sm leading-6 text-base-content/60">Kerjakan berurutan. Setiap bab berisi peraga, latihan di tiap subbab, dan evaluasi 24 soal.</p>}
        </div>
        {classMaterials.length > 0 ? <>
          <div className="mt-6"><ChapterPath list={classMaterials} /></div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{classMaterials.map(m => <MaterialCard key={m.id} material={m} classSlug={classItem.slug} free={m.id === free?.id} />)}</div>
        </> : <div className="mt-6 rounded-md border border-dashed border-base-300 bg-base-100 p-6 text-base-content/70">Bab Kelas {classItem.id} sedang disusun. Sementara itu, coba <Link href="/#kelas" className="link text-success">kelas lain</Link> atau <Link href="/mastering-penjumlahan-pengurangan/level-1" className="link text-success">latihan harian</Link>.</div>}
      </section>
    </div><SiteFooter /></main>;
}

export default function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-base-100" />}><ClassPageContent params={params} /></Suspense>;
}
