import { createElement } from "react";
import { Box, ChartColumn, Dices, Hash, type LucideIcon, Repeat2, Ruler, Scale, Shapes, Sigma } from "lucide-react";

/** Ikon garis per topik materi, dari pustaka Lucide agar konsisten dan rapi. */
export function topicIcon(topic: string): LucideIcon {
  const t = topic.toLowerCase();
  if (t.includes("peluang")) return Dices;
  if (t.includes("geometri") && t.includes("lokasi")) return Box;
  if (t.includes("geometri") || t.includes("bentuk")) return Shapes;
  if (t.includes("perbandingan") || t.includes("ratio")) return Scale;
  if (t.includes("data") || t.includes("diagram")) return ChartColumn;
  if (t.includes("ukur")) return Ruler;
  if (t.includes("pola")) return Repeat2;
  if (t.includes("bilangan") || t.includes("cambridge")) return Hash;
  return Sigma;
}

export function TopicIcon({ topic, className = "size-5" }: { topic: string; className?: string }) {
  return createElement(topicIcon(topic), { className, strokeWidth: 1.75, "aria-hidden": true });
}
