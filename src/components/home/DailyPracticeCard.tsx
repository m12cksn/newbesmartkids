import Link from "next/link";
import type { CSSProperties } from "react";

const practices = [
  { title: "Mastering Penjumlahan & Pengurangan", symbols: ["+", "−"], sample: "48 + ? = 75", href: "/mastering-penjumlahan-pengurangan/level-1", button: "Latihan penjumlahan & pengurangan" },
  { title: "Mastering Perkalian & Pembagian", symbols: ["×", "÷"], sample: "? × 6 = 42", href: "/mastering-perkalian-pembagian/level-1", button: "Mulai latihan harian" },
];

export function DailyPracticeCard() {
  return <section id="latihan-harian" aria-labelledby="daily-practice-title" className="scroll-mt-20 border-y border-base-300 bg-[#faf9f3] px-5 py-14 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-success">Setiap hari pukul 00.00 WIB</p>
      <h2 id="daily-practice-title" className="mb-8 mt-3 text-3xl font-extrabold sm:text-4xl">Mastering Matematika Harian</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {practices.map((practice, i) => <article key={practice.href} className="bsk-reveal group relative flex min-w-0 flex-col items-start gap-4 overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 transition duration-300 hover:border-success/50 hover:shadow-xl hover:shadow-success/10 sm:p-8">
          <span aria-hidden="true" className="pointer-events-none absolute right-6 top-2 flex gap-2 text-7xl font-bold text-success/10 sm:text-8xl">
            {practice.symbols.map((s, k) => <span key={s} className="bsk-drift inline-block" style={{ "--t": `${8 + k * 2 + i}s`, "--d": `${-k * 3}s`, "--r": `${k ? -10 : 12}deg` } as CSSProperties}>{s}</span>)}
          </span>
          <div className="relative">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-success">Latihan harian · 3 level</p>
            <h3 className="text-xl font-extrabold sm:text-2xl">{practice.title}</h3>
            <p className="mt-2 text-sm text-base-content/70">Tujuh soal, satu kebiasaan baik. Temukan angka yang hilang dengan paket baru setiap pukul 00.00 WIB.</p>
          </div>
          <p aria-hidden="true" className="relative rounded-lg border border-dashed border-success/40 bg-success/5 px-3 py-1.5 font-mono text-lg font-bold text-success transition group-hover:scale-105">{practice.sample}</p>
          <Link href={practice.href} className="btn btn-success relative mt-auto h-auto min-h-12 max-w-full whitespace-normal py-3 text-center">{practice.button}</Link>
        </article>)}
      </div>
    </div>
  </section>;
}
