import { ArrowRight } from "lucide-react";
const formulas = ["½ + ¼ = ¾", "7 × 8 = 56", "0,25 = 25%", "KPK(4, 6) = 12", "2 : 3 = 6 : 9", "π ≈ 3,14", "V = s × s × s", "36 ÷ 4 = 9", "¾ = 0,75", "FPB(12, 18) = 6"];

export function CallToAction() {
  return <section id="tentang" className="relative overflow-hidden bg-success text-success-content">
    <div aria-hidden="true" className="overflow-hidden border-b border-white/15 py-3">
      <div className="bsk-marquee flex w-max gap-10 whitespace-nowrap text-lg font-extrabold text-white/30">
        {[...formulas, ...formulas].map((f, i) => <span key={i}>{f}</span>)}
      </div>
    </div>
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div>
        <h2 className="text-2xl font-extrabold tracking-normal sm:text-3xl">Belajar matematika dengan lebih tenang.</h2>
        <p className="mt-2 max-w-xl text-sm text-success-content/80">BeSmartKids membantu anak membangun pemahaman satu konsep dalam satu waktu.</p>
      </div>
      <a href="#kelas" className="btn btn-neutral">Mulai dari kelas 1 <ArrowRight className="size-4" aria-hidden="true" /></a>
    </div>
  </section>;
}
