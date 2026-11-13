import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { adminWaLink } from "@/lib/contact";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  const wa = adminWaLink();
  return (
    <footer className="footer border-t border-base-200 bg-base-100 px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandMark />
        </div>
        <nav aria-label="Informasi" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/kebijakan-privasi" className="link link-hover">Kebijakan Privasi</Link>
          <Link href="/syarat-layanan" className="link link-hover">Syarat Layanan</Link>
          {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="link link-hover inline-flex items-center gap-1"><MessageCircle className="size-4" aria-hidden="true" />Hubungi admin</a>}
        </nav>
        <span className="w-full text-xs text-base-content/50 sm:w-auto">
          Belajar sedikit demi sedikit, paham lebih lama.
        </span>
      </div>
    </footer>
  );
}
