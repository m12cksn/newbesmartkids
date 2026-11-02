import { LearningPreview } from "./LearningPreview";
import { MathOrnaments } from "./MathOrnaments";

export function HeroSection() {
  return (
    <section className="hero relative overflow-hidden bg-base-100">
      <MathOrnaments />
      <div className="hero-content relative mx-auto grid w-full max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:py-28">
        <div>
          <div className="badge badge-success badge-outline mb-6 gap-2 px-3 py-3">
            Untuk perjalanan belajar anak
          </div>
          <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.03] sm:text-7xl">
            Matematika yang{" "}
            <span className="text-success">terasa masuk akal.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-base-content/60">
            Video singkat, contoh visual, dan latihan bertahap untuk membantu
            anak memahami konsep—bukan hanya menghafal jawaban.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#kelas"
              className="btn btn-success btn-lg shadow-lg shadow-success/20"
            >
              Lihat semua kelas <span aria-hidden="true">-&gt;</span>
            </a>
            <span className="text-sm font-semibold text-base-content/45">
              Kelas 1—12
            </span>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-base-content/45">
            <span>Video pembelajaran</span>
            <span>Latihan terarah</span>
            <span>Bahasa Indonesia</span>
          </div>
        </div>
        <LearningPreview />
      </div>
    </section>
  );
}
