import GradeFourFractions from "@/components/learn/GradeFourFractions";
import GradeFourWholeNumbers from "@/components/learn/GradeFourWholeNumbers";
import GradeOneChapterEight from "@/components/learn/GradeOneChapterEight";
import Link from "next/link";
import KpkFpbExperience from "@/components/learn/KpkFpbExperience";
import GradeOneCounting from "@/components/learn/GradeOneCounting";
import GradeOneChapterFive from "@/components/learn/GradeOneChapterFive";
import GradeOneChapterSix from "@/components/learn/GradeOneChapterSix";
import GradeOneChapterSeven from "@/components/learn/GradeOneChapterSeven";
import GradeOneAddition from "@/components/learn/GradeOneAddition";
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

  if (material.id === "kelas-1-membilang-10") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 1</Link></div><GradeOneCounting/><SiteFooter/></main>;
  }

  if (material.id === "kelas-1-penjumlahan-10") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 1</Link></div><GradeOneAddition/><SiteFooter/></main>;
  }

  if (material.id === "kelas-1-membilang-20") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 1</Link></div><GradeOneChapterFive /><SiteFooter /></main>;
  }

  if (material.id === "kelas-1-operasi-20") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 1</Link></div><GradeOneChapterSix /><SiteFooter /></main>;
  }

  if (material.id === "kelas-1-panjang-benda") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 1</Link></div><GradeOneChapterSeven /><SiteFooter /></main>;
  }

  if (material.id === "kelas-1-mengenal-diagram") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 1</Link></div><GradeOneChapterEight /><SiteFooter /></main>;
  }

  if (material.id === "kelas-4-bilangan-cacah-10000") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 4</Link></div><GradeFourWholeNumbers /><SiteFooter /></main>;
  }

  if (material.id === "kelas-4-pecahan") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 4</Link></div><GradeFourFractions /><SiteFooter /></main>;
  }

  if (material.id === "kelas-5-kpk-fpb") {
    return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href={`/kelas/${classItem.slug}`} className="link link-hover text-sm text-success">← Kembali ke kelas 5</Link></div><KpkFpbExperience/><SiteFooter/></main>;
  }

  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader /><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12"><Link href={`/kelas/${classItem.slug}`} className="btn btn-ghost btn-sm mb-6 px-0 text-base-content/60 hover:bg-transparent hover:text-success">&lt;- Kembali ke materi kelas {classItem.id}</Link><LearnExperience steps={getLearnSteps(material.slug)} materialTitle={material.title} questions={getQuestionsByMaterial(material.id)} /></div><SiteFooter /></main>;
}

export default function MaterialPage({ params }: { params: Promise<{ slug: string; materiSlug: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-base-100" />}><MaterialPageContent params={params} /></Suspense>;
}
