import type { ReactNode } from "react";

/**
 * Tata letak soal agar muat satu layar tanpa menggulir.
 * - Layar ≥ 640 px: gambar soal dan jawaban berdampingan.
 * - Gambar dibatasi tingginya (SVG paling tinggi 24vh di HP, 42vh di layar lebar), sehingga jawaban tetap terlihat.
 * - Layar pendek (tinggi ≤ 700 px): gambar dan jawaban sedikit diperkecil.
 */
export function QuizFitLayout({ visual, children }: { visual?: ReactNode; children: ReactNode }) {
  if (!visual) return <div className="[@media(max-height:700px)]:[zoom:0.86]">{children}</div>;
  return <div className="space-y-2 sm:grid sm:grid-cols-2 sm:items-start sm:gap-3 sm:space-y-0">
    <div data-testid="quiz-visual" className="flex min-w-0 justify-center overflow-x-auto rounded-xl bg-base-200/60 p-1.5 sm:p-2 [&_td]:py-0.5 [&_th]:py-0.5 [&_svg]:max-h-[24vh] sm:[&_svg]:max-h-[42vh] [@media(max-height:700px)]:[zoom:0.8] [@media(max-height:700px)]:[&_svg]:max-h-[34vh]">{visual}</div>
    <div className="min-w-0 [@media(max-height:700px)]:[zoom:0.86]">{children}</div>
  </div>;
}

/** Pilihan per baris yang ringkas (satu baris tinggi) untuk daftar pilihan panjang. */
export function RowSelect({ label, options, value, set, disabled, className = "" }: { label: string; options: string[]; value: string; set: (v: string) => void; disabled?: boolean; className?: string }) {
  return <select aria-label={label} value={value} disabled={disabled} onChange={e => set(e.target.value)}
    className={`select select-sm h-9 min-h-9 w-full min-w-0 border-2 pe-8 text-xs font-semibold sm:text-sm ${value ? "border-success" : "border-orange-400"} ${className}`}>
    <option value="" disabled>Pilih…</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>;
}
