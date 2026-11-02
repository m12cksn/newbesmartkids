import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PracticeExperience } from "@/components/practice/PracticeExperience";
import { classes } from "@/components/home/home-data";
import { getMaterialBySlug } from "@/data/materials";
import { getQuestionsByMaterial } from "@/data/questions";

async function PracticePageContent({ params }: { params: Promise<{ slug: string; materiSlug: string }> }) {
  const { slug, materiSlug } = await params;
  const classItem = classes.find((item) => item.slug === slug);
  const material = getMaterialBySlug(materiSlug);
  if (!classItem || !material || material.classId !== classItem.id) notFound();
  const materialQuestions = getQuestionsByMaterial(material.id);

  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10"><Link href={`/kelas/${classItem.slug}/materi/${material.slug}`} className="btn btn-ghost btn-sm mb-6 px-0 text-base-content/60 hover:bg-transparent hover:text-success">&lt;- Kembali ke materi</Link><PracticeExperience questions={materialQuestions} title={material.title} /></div></main>;
}

export default function PracticePage({ params }: { params: Promise<{ slug: string; materiSlug: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-base-100" />}><PracticePageContent params={params} /></Suspense>;
}
