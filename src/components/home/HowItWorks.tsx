import { CirclePlay, LayoutGrid, ListChecks } from "lucide-react";

const steps = [
  { n: "01", title: "Pilih kelas", text: "Mulai dari jenjang yang sedang dipelajari anak.", Icon: LayoutGrid },
  { n: "02", title: "Pahami konsep", text: "Tonton penjelasan, lalu geser dan ketuk peraga sampai konsepnya terlihat.", Icon: CirclePlay },
  { n: "03", title: "Latihan dan evaluasi", text: "Coba soal bertahap, lihat skor, dan pelajari pembahasan jawaban yang salah.", Icon: ListChecks },
];

export function HowItWorks() {
  return (
    <section id="cara-belajar" aria-labelledby="cara-belajar-title" className="relative scroll-mt-20 overflow-hidden border-y border-base-200 bg-base-200/60">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <h2 id="cara-belajar-title" className="text-center text-3xl font-extrabold sm:text-4xl">Tiga langkah belajar</h2>
        <div className="relative mt-10 grid gap-8 sm:grid-cols-3">
          <svg aria-hidden="true" className="absolute left-[16%] right-[16%] top-9 hidden h-2 w-[68%] text-success/40 sm:block" viewBox="0 0 100 2" preserveAspectRatio="none">
            <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" className="bsk-dash-flow" />
          </svg>
          {steps.map((s) => (
            <div key={s.n} className="bsk-reveal relative text-center">
              <div className="mx-auto grid size-[4.5rem] place-items-center rounded-full border border-base-300 bg-base-100 text-success">
                <s.Icon className="size-8" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <span className="mt-4 block text-sm font-extrabold text-warning">{s.n}</span>
              <h3 className="mt-1 text-xl font-extrabold">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-base-content/60">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
