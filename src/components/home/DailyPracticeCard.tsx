import Link from 'next/link';

const practices = [
  { title: 'Mastering Penjumlahan & Pengurangan', symbols: '+ −', href: '/mastering-penjumlahan-pengurangan/level-1', button: 'Latihan penjumlahan & pengurangan →' },
  { title: 'Mastering Perkalian & Pembagian', symbols: '× ÷', href: '/mastering-perkalian-pembagian/level-1', button: 'Mulai latihan harian →' },
];

export function DailyPracticeCard() {
  return <section aria-labelledby="daily-practice-title" className="border-y border-base-300 bg-[#faf9f3] px-5 py-10 sm:px-8">
    <div className="mx-auto max-w-7xl">
      <h2 id="daily-practice-title" className="mb-5 text-2xl font-extrabold">Mastering Matematika Harian</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        {practices.map(practice => <article key={practice.href} className="relative flex min-w-0 flex-col items-start gap-4 overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-6 sm:p-8">
          <span aria-hidden="true" className="pointer-events-none absolute right-5 top-0 rotate-12 text-8xl font-bold text-success/10">{practice.symbols}</span>
          <div className="relative">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-success">Latihan harian · 3 level</p>
            <h3 className="text-xl font-extrabold sm:text-2xl">{practice.title}</h3>
            <p className="mt-2 text-sm text-base-content/70">Tujuh soal, satu kebiasaan baik. Temukan angka yang hilang dengan paket baru setiap pukul 00.00 WIB.</p>
          </div>
          <Link href={practice.href} className="btn btn-success relative mt-auto h-auto min-h-12 max-w-full whitespace-normal py-3 text-center">{practice.button}</Link>
        </article>)}
      </div>
    </div>
  </section>;
}
