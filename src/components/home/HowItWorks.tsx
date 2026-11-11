const steps = [
  { n: "01", title: "Pilih kelas", text: "Mulai dari jenjang yang sedang dipelajari anak.",
    icon: <g><rect x="8" y="26" width="12" height="12" rx="2" className="fill-success/25" /><rect x="22" y="18" width="12" height="20" rx="2" /><rect x="36" y="10" width="12" height="28" rx="2" className="fill-warning/40" /><text x="28" y="31" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="800">6</text></g> },
  { n: "02", title: "Pahami konsep", text: "Tonton penjelasan, lalu geser dan ketuk peraga sampai konsepnya terlihat.",
    icon: <g><circle cx="22" cy="24" r="14" /><path d="M22 24V10a14 14 0 0 1 14 14z" className="fill-success/30" /><path d="M42 16l8 5-8 5z" className="fill-warning/60" /></g> },
  { n: "03", title: "Latihan dan evaluasi", text: "Coba soal bertahap, lihat skor, dan pelajari pembahasan jawaban yang salah.",
    icon: <g><rect x="10" y="8" width="36" height="32" rx="4" /><path className="bsk-draw" style={{ ["--len" as string]: 40 }} d="M18 24l7 7 14-15" strokeWidth="3.5" /></g> },
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
              <div className="mx-auto grid size-[4.5rem] place-items-center rounded-2xl border border-base-300 bg-base-100 text-success shadow-sm">
                <svg viewBox="0 0 56 48" className="size-12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.icon}</svg>
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
