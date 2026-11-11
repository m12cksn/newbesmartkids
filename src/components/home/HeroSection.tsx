import { materials } from "@/data/materials";
import { HeroPlayground } from "./HeroPlayground";
import { MathOrnaments } from "./MathOrnaments";

const equations = ["½ + ¼ = ¾", "7 × 8 = 56", "¾ = 0,75 = 75%", "36 ÷ 4 = 9", "2 : 3 = 4 : 6"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-base-100">
      <MathOrnaments />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div className="bsk-pop-in min-w-0">
          <div className="badge badge-success badge-outline mb-6 gap-2 px-3 py-3">
            <span className="size-2 rounded-full bg-success bsk-bob" aria-hidden="true" /> Untuk perjalanan belajar anak
          </div>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.05] sm:text-7xl lg:text-6xl">
            Matematika yang{" "}
            <span className="relative inline-block text-success">
              terasa masuk akal.
              <svg aria-hidden="true" viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-warning sm:h-4">
                <path className="bsk-draw" style={{ ["--len" as string]: 320 }} d="M4 14 C 70 2, 150 2, 296 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-base-content/65">
            Video singkat, peraga yang bisa digeser dan diketuk, serta latihan bertahap. Anak memahami konsep, bukan hanya menghafal jawaban.
          </p>
          <div className="mt-6 flex items-center gap-3 text-base font-bold text-base-content/70">
            <span>Hari ini:</span>
            <span className="sr-only">{equations.join(", ")}</span>
            <span aria-hidden="true" className="relative inline-block h-[1.5em] overflow-hidden rounded-lg bg-success/10 px-3 leading-[1.5em] text-success">
              <span className="bsk-ticker block tabular-nums">
                {[...equations, equations[0]].map((eq, i) => <span key={i} className="block h-[1.5em] whitespace-nowrap">{eq}</span>)}
              </span>
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#kelas" className="btn btn-success btn-lg shadow-lg shadow-success/20">
              Lihat semua kelas <span aria-hidden="true" className="bsk-bob-hover">-&gt;</span>
            </a>
            <a href="#latihan-harian" className="btn btn-outline btn-success btn-lg">Latihan harian</a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-3 text-center">
            {[[String(materials.length), "materi interaktif"], ["2", "latihan harian"], ["3", "level per latihan"]].map(([n, label]) => (
              <div key={label} className="rounded-box border border-base-300 bg-base-100 px-2 py-3">
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-extrabold text-success">{n}</dd>
                <dd className="text-[11px] font-semibold leading-tight text-base-content/55">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroPlayground />
      </div>
    </section>
  );
}
