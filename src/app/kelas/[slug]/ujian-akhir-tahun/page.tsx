import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { classes } from "@/components/home/home-data";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SAT_SLUG, satExams } from "@/exams/registry";

export function generateStaticParams() {
  return classes.filter(c => satExams[c.id]).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = classes.find(x => x.slug === slug);
  const exam = c ? satExams[c.id] : undefined;
  if (!c || !exam) return {};
  return { title: exam.title, description: `${exam.questions} soal dari semua bab Kelas ${c.id}, ${exam.minutes} menit, lengkap dengan skor dan pembahasan.`, alternates: { canonical: `/kelas/${c.slug}/${SAT_SLUG}` } };
}

async function Content({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = classes.find(x => x.slug === slug);
  const exam = c ? satExams[c.id] : undefined;
  if (!c || !exam) notFound();
  const { Component } = exam;
  return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader />
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <Link href={`/kelas/${c.slug}`} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-base-content/60 hover:text-success"><ArrowLeft className="size-4" aria-hidden="true" />Kelas {c.id}</Link>
      <h1 className="mb-6 text-3xl font-extrabold sm:text-4xl">{exam.title}</h1>
      <Component classSlug={c.slug} />
    </div><SiteFooter /></main>;
}

export default function SatPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className="min-h-screen bg-base-100" />}><Content params={params} /></Suspense>;
}
