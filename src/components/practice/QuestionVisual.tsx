import {ObjectArt} from "@/components/illustrations/ObjectArt";
type VisualType = "apples" | "number_line" | "groups" | "order" | "pencils";

function Apple({ index }: { index: number }) {
  return <span key={index} className="grid size-12 place-items-center"><ObjectArt name="apple" className="size-12"/></span>;
}

export function QuestionVisual({ type }: { type?: VisualType }) {
  if (type === "apples") return <div className="flex flex-wrap justify-center gap-3" aria-label="Tiga buah apel"><Apple index={1} /><Apple index={2} /><Apple index={3} /></div>;
  if (type === "number_line") return <div className="w-full max-w-md"><div className="relative h-12 border-b-4 border-success"><div className="absolute inset-x-0 bottom-[-8px] flex justify-between">{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((number) => <span key={number} className="flex flex-col items-center text-sm font-bold text-success"><span className="h-4 w-1 bg-success" />{number}</span>)}</div></div></div>;
  if (type === "groups") return <div className="flex flex-wrap items-center justify-center gap-7 text-sm font-bold"><div className="rounded-box border-2 border-info/30 bg-info/10 p-4"><p className="mb-3 text-info">Kelompok A</p><div className="flex gap-2"><i className="size-6 rounded-full bg-info" /><i className="size-6 rounded-full bg-info" /><i className="size-6 rounded-full bg-info" /></div></div><span className="text-xl text-base-content/40">vs</span><div className="rounded-box border-2 border-warning/40 bg-warning/10 p-4"><p className="mb-3 text-warning-content">Kelompok B</p><div className="flex gap-2"><i className="size-6 rounded-full bg-warning" /><i className="size-6 rounded-full bg-warning" /><i className="size-6 rounded-full bg-warning" /><i className="size-6 rounded-full bg-warning" /></div></div></div>;
  if (type === "order") return <div className="flex items-center justify-center gap-3"><span className="grid size-14 place-items-center rounded-box bg-warning/20 text-2xl font-extrabold text-warning-content">5</span><span className="text-xl text-base-content/30">?</span><span className="grid size-14 place-items-center rounded-box bg-info/20 text-2xl font-extrabold text-info">2</span><span className="text-xl text-base-content/30">?</span><span className="grid size-14 place-items-center rounded-box bg-success/20 text-2xl font-extrabold text-success">4</span></div>;
  if (type === "pencils") return <div className="flex items-end justify-center gap-3"><ObjectArt name="pencil" className="size-14"/><ObjectArt name="pencil" className="size-14"/><ObjectArt name="pencil" className="size-14"/><span className="opacity-30"><ObjectArt name="pencil" className="size-14"/></span></div>;
  return null;
}
