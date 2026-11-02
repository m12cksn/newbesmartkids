import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { classes } from "@/components/home/home-data";
import { LearnExperience } from "@/components/learn/LearnExperience";
import { getLearnSteps } from "@/data/learn-lessons";
import { getMaterialBySlug, materials } from "@/data/materials";
import { getQuestionsByMaterial } from "@/data/questions";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";

export function generateStaticParams() {
  return materials.flatMap((material) => {
    const classItem = classes.find((item) => item.id === material.classId);
    return classItem ? [{ slug: classItem.slug, materiSlug: material.slug }] : [];
  });
}

async function MaterialPageContent({ params }: { params: Promise<{ slug: string; materiSlug: string }> }) {
  const { slug, materiSlug } = await params;
  const classItem = classes.find((item) => item.slug === slug);
  const material = getMaterialBySlug(materiSlug);
  if (!classItem || !material || material.classId !== classItem.id) notFound();

  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12"><Link href={`/kelas/${classItem.slug}`} className="btn btn-ghost btn-sm mb-6 px-0 text-base-content/60 hover:bg-transparent hover:text-success">&lt;- Kembali ke materi kelas {classItem.id}</Link><LearnExperience steps={getLearnSteps(material.slug)} materialTitle={material.title} questions={getQuestionsByMaterial(material.id)} /></div><SiteFooter /></main>;
}

export default function MaterialPage({ params }: { params: Promise<{ slug: string; materiSlug: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-base-100" />}><MaterialPageContent params={params} /></Suspense>;
}
