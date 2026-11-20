import type { ReactNode } from "react";

/**
 * Tata letak soal agar muat satu layar tanpa menggulir.
 * - Layar ≥ 640 px: gambar soal dan jawaban berdampingan.
 * - Gambar dibatasi tingginya (SVG tidak lebih dari 42vh), sehingga jawaban tetap terlihat.
 * - Layar pendek (tinggi ≤ 700 px): gambar dan jawaban sedikit diperkecil.
 */
export function QuizFitLayout({ visual, children }: { visual?: ReactNode; children: ReactNode }) {
  if (!visual) return <div className="[@media(max-height:700px)]:[zoom:0.86]">{children}</div>;
  return <div className="space-y-3 sm:grid sm:grid-cols-2 sm:items-start sm:gap-3 sm:space-y-0">
    <div data-testid="quiz-visual" className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-2 [&_svg]:max-h-[42vh] [@media(max-height:700px)]:[zoom:0.8] [@media(max-height:700px)]:[&_svg]:max-h-[34vh]">{visual}</div>
    <div className="min-w-0 [@media(max-height:700px)]:[zoom:0.86]">{children}</div>
  </div>;
}
