import Link from "next/link";
import { SiteHeader } from "@/components/home/SiteHeader";
import { SiteFooter } from "@/components/home/SiteFooter";
import KpkFpbExperience from "@/components/learn/KpkFpbExperience";
export default function Page(){return <main data-theme="besmartkids" className="min-h-screen bg-base-200 text-base-content"><SiteHeader/><div className="mx-auto max-w-6xl px-4 pt-5 sm:px-8"><Link href="/kelas/pecahan-dan-pengukuran-kelas-5" className="link link-hover text-sm text-success">← Kembali ke kelas 5</Link></div><KpkFpbExperience/><SiteFooter/></main>}
