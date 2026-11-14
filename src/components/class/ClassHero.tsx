import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { cardTones, Drawing, motifs, Pattern } from "@/components/home/ClassCardArt";
import type { MaterialItem } from "@/data/materials";

const ink = "#17352a";

/** Simbol matematika yang melayang pelan di latar bagian atas halaman kelas. */
function Glyphs({ items }: { items: string[] }) {
  const spots: CSSProperties[] = [
    { left: "3%", top: "10%" }, { left: "44%", top: "6%" }, { right: "4%", bottom: "8%" },
    { left: "38%", bottom: "6%" }, { right: "36%", top: "14%" }, { left: "6%", bottom: "12%" },
  ];
  const all = [...items, ...items];
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0">{spots.map((s, i) =>
    <span key={i} className={`bsk-drift absolute select-none font-extrabold ${i % 3 === 0 ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"} ${i > 3 ? "hidden md:block" : ""}`}
      style={{ ...s, color: ink, opacity: i % 2 ? 0.16 : 0.24, "--t": `${9 + i * 1.7}s`, "--d": `${-i * 1.3}s`, "--r": `${i % 2 ? -12 : 9}deg`, "--dy": "-12px" } as CSSProperties}>{all[i]}</span>)}</div>;
}

/** Bagian atas halaman kelas: warna dan gambar sama dengan kartu kelas di beranda. */
export function ClassHero({ id, slug, tag, phase, list, free }: { id: number; slug: string; tag: string; phase: string; list: MaterialItem[]; free: MaterialItem | null }) {
  const tone = cardTones[(id - 1) % cardTones.length];
  const topics = [...new Set(list.map(m => m.topic))];
  const first = list[0];
  return <section aria-labelledby="judul-kelas" className="relative overflow-hidden rounded-md border border-neutral/10" style={{ background: tone.bg }}>
    <Pattern kind={id - 1} color={tone.line} id={`hero-${id}`} />
    <Glyphs items={motifs[(id - 1) % motifs.length]} />
    <div className="relative grid items-center gap-8 px-5 py-9 sm:px-10 sm:py-12 lg:grid-cols-[1.15fr_1fr] lg:px-14 lg:py-14">
      <div style={{ color: ink }}>
        <h1 id="judul-kelas" className="relative inline-block text-6xl font-extrabold leading-none sm:text-7xl lg:text-8xl">Kelas {id}
          <svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true" className="absolute -bottom-3 left-0 h-3 w-full sm:-bottom-4 sm:h-4">
            <path d="M4 12C60 4 110 15 160 9s96 -6 136 1" fill="none" stroke="#e8590c" strokeWidth="5" strokeLinecap="round" className="bsk-draw" style={{ "--len": "320" } as CSSProperties} /></svg></h1>
        <p className="mt-8 max-w-xl text-lg leading-8 sm:text-xl">{tag}. Fase {phase}, materi disusun bab demi bab dengan peraga yang bisa digeser dan diketuk.</p>
        {list.length > 0 ? <>
          <p className="mt-5 text-base"><strong>{list.length} bab</strong> tersedia{free ? <>. Bab {free.chapter} bisa dicoba tanpa akun.</> : "."}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topik di kelas ini">{topics.map(t => <li key={t} className="rounded-full border border-current/25 bg-white/60 px-3 py-1 text-sm font-semibold">{t}</li>)}</ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/kelas/${slug}/materi/${(free ?? first).slug}`} className="btn btn-neutral gap-1.5">Mulai dari Bab {(free ?? first).chapter}<ArrowRight className="size-4" strokeWidth={2} aria-hidden="true" /></Link>
            <Link href="#daftar-bab" className="btn btn-ghost border border-current/20 bg-white/50 hover:bg-white/80">Lihat semua bab</Link>
          </div>
        </> : <p className="mt-5 text-base">Bab untuk kelas ini sedang disiapkan.</p>}
      </div>
      {/* Gambar kelas di atas kertas berpetak yang ditempel selotip. */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
        <div className="relative -rotate-2 rounded-sm bg-white p-4 shadow-[0_14px_30px_-16px_rgb(23_53_42/0.45)] sm:p-6">
          <div className="bsk-graph-paper absolute inset-0 rounded-sm" aria-hidden="true" />
          <span aria-hidden="true" className="absolute -top-3 left-8 h-6 w-20 -rotate-6 bg-[#f7d774]/75" />
          <span aria-hidden="true" className="absolute -top-3 right-8 h-6 w-16 rotate-3 bg-[#f7d774]/75" />
          <svg viewBox="0 0 120 90" role="img" aria-label={`Gambar matematika Kelas ${id}`} className="relative w-full"><Drawing id={id} /></svg>
        </div>
      </div>
    </div>
  </section>;
}

/** Peta urutan bab: nomor bab terhubung garis putus-putus, bisa diklik untuk lompat ke kartunya. */
export function ChapterPath({ list }: { list: MaterialItem[] }) {
  if (list.length < 2) return null;
  return <nav aria-label="Urutan bab" className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
    <ol className="relative flex min-w-max gap-0">
      {list.map((m, i) => <li key={m.id} className="relative w-28 shrink-0 sm:w-36">
        {i < list.length - 1 && <span aria-hidden="true" className="absolute left-1/2 top-5 h-0 w-full border-t-2 border-dashed border-success/40" />}
        <a href={`#bab-${m.chapter}`} aria-label={`Lompat ke kartu bab nomor ${m.chapter}`} title={m.title} className="group relative flex flex-col items-center gap-2 rounded-md px-1 py-1 text-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/40">
          <span className="grid size-10 place-items-center rounded-full border-2 border-success bg-base-100 text-base font-extrabold text-success transition group-hover:bg-success group-hover:text-success-content">{m.chapter}</span>
          <span className="line-clamp-2 text-xs font-semibold leading-snug text-base-content/70 group-hover:text-base-content">{m.title}</span>
        </a>
      </li>)}
    </ol>
  </nav>;
}
