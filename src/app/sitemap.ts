import type { MetadataRoute } from "next";
import { classes } from "@/components/home/home-data";
import { materials } from "@/data/materials";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly" = "monthly") => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("/", 1, "weekly"),
    ...classes.map(c => page(`/kelas/${c.slug}`, 0.8, "weekly")),
    ...materials.flatMap(m => { const c = classes.find(x => x.id === m.classId); return c ? [page(`/kelas/${c.slug}/materi/${m.slug}`, 0.7)] : []; }),
    ...[1, 2, 3].flatMap(l => [page(`/mastering-penjumlahan-pengurangan/level-${l}`, 0.5, "weekly"), page(`/mastering-perkalian-pembagian/level-${l}`, 0.5, "weekly")]),
    page("/kebijakan-privasi", 0.2, "yearly"), page("/syarat-layanan", 0.2, "yearly"),
  ];
}
