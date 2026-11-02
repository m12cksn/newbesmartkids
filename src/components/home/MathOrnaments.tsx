import Image from "next/image";

export function MathOrnaments() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image src="/math-learning-overlay.png" alt="" width={900} height={900} className="absolute -right-24 top-8 w-[min(58vw,620px)] opacity-20 mix-blend-screen sm:-right-10 sm:top-0" sizes="(max-width: 640px) 58vw, 620px" />
      <span className="absolute left-[4%] top-[16%] rotate-[-12deg] text-4xl font-extrabold text-success/10 sm:text-6xl">+</span>
      <span className="absolute right-[5%] top-[11%] rotate-[14deg] text-3xl font-extrabold text-warning/30 sm:text-5xl">&divide;</span>
      <span className="absolute bottom-[12%] left-[6%] rotate-[8deg] text-3xl font-extrabold text-success/10 sm:text-5xl">&times;</span>
      <span className="absolute bottom-[15%] right-[4%] text-2xl font-extrabold text-warning/30 sm:text-4xl">=</span>
      <span className="absolute left-[12%] top-[37%] size-3 rounded-full bg-warning/40 sm:size-4" />
      <span className="absolute bottom-[31%] right-[12%] size-4 rounded-full border-4 border-success/15 sm:size-6" />
      <div className="absolute right-[3%] top-[31%] hidden rotate-6 border border-success/15 bg-white/75 p-3 shadow-sm sm:block">
        <div className="flex gap-1 border-b border-base-200 pb-2"><span className="size-1.5 rounded-full bg-warning" /><span className="size-1.5 rounded-full bg-success/40" /><span className="size-1.5 rounded-full bg-success/20" /></div>
        <div className="mt-3 flex items-end gap-2"><span className="h-7 w-2 bg-success/20" /><span className="h-11 w-2 bg-success/40" /><span className="h-16 w-2 bg-success" /></div>
      </div>
    </div>
  );
}
