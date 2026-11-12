import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AccountLink } from "@/components/auth/AccountLink";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <>
      <div className="border-b border-base-200 bg-base-100 px-5 py-2 text-center text-xs text-base-content/60 sm:px-8">
        Belajar sedikit demi sedikit, paham lebih lama.{" "}
        <Link href="/#kelas" className="font-bold text-success hover:underline">
          Pilih kelasmu <ArrowRight className="inline size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <header className="sticky top-0 z-40 border-b border-base-200 bg-base-100 px-5 sm:px-8">
        <nav aria-label="Navigasi utama" className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3">
          <Link href="/" className="shrink-0" aria-label="Beranda BeSmartKids"><BrandMark /></Link>
          <ul className="menu menu-horizontal hidden gap-1 text-sm font-semibold text-base-content/60 lg:flex">
            <li><Link href="/#kelas">Kelas</Link></li>
            <li><Link href="/#materi-terbaru">Materi terbaru</Link></li>
            <li><Link href="/#latihan-harian">Latihan harian</Link></li>
            <li><Link href="/#cara-belajar">Cara belajar</Link></li>
          </ul>
          <div className="flex items-center gap-1">
            <AccountLink />
            <Link href="/#kelas" className="btn btn-success btn-sm sm:btn-md" aria-label="Mulai belajar"><span className="max-[379px]:hidden">Mulai belajar</span><span className="min-[380px]:hidden">Mulai</span></Link>
          </div>
        </nav>
      </header>
    </>
  );
}
