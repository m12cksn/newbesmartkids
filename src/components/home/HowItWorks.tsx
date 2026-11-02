const steps = [
  ["01", "Pilih kelas", "Mulai dari jenjang yang sedang dipelajari anak."],
  ["02", "Pahami konsep", "Tonton materi visual dengan ritme yang nyaman."],
  ["03", "Latihan mandiri", "Coba soal untuk mengasah pemahaman."],
];

export function HowItWorks() {
  return (
    <section
      id="cara-belajar"
      className="border-y border-base-200 bg-base-200/60"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-5  py-7 sm:grid-cols-3 sm:px-8">
        {steps.map(([number, title, text]) => (
          <div key={number}>
            <span className="text-lg md:text-2xl  font-extrabold text-warning">
              {number}
            </span>
            <h2 className="mt-3 text-lg md:text-2xl font-extrabold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-base-content/60">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
