// Membuat daftar bab otomatis dari folder src/chapters/<id>/ (meta.ts + Chapter.tsx).
// Dijalankan sebelum dev, build, dan setelah npm install. Hasilnya tidak di-commit,
// sehingga sesi paralel yang menambah bab berbeda tidak pernah mengubah file yang sama.
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "chapters");
const ids = existsSync(root) ? readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== "registry" && existsSync(join(root, d.name, "meta.ts"))).map(d => d.name).sort() : [];
for (const id of ids) if (!existsSync(join(root, id, "Chapter.tsx"))) throw new Error(`src/chapters/${id} perlu Chapter.tsx`);
const v = i => `c${i}`;
const out = join(root, "registry");
mkdirSync(out, { recursive: true });
const head = "// File ini dibuat otomatis oleh scripts/gen-chapter-registry.mjs. Jangan diedit.\n";
writeFileSync(join(out, "metas.generated.ts"), `${head}import type { MaterialItem } from "@/data/materials";\n${ids.map((id, i) => `import ${v(i)} from "../${id}/meta";`).join("\n")}\n\nexport const chapterMetas: MaterialItem[] = [${ids.map((_, i) => v(i)).join(", ")}];\n`);
writeFileSync(join(out, "components.generated.ts"), `${head}import type { ComponentType } from "react";\n${ids.map((id, i) => `import ${v(i)} from "../${id}/Chapter";`).join("\n")}\n\nexport const chapterComponents: Record<string, ComponentType> = {${ids.map((id, i) => ` ${JSON.stringify(id)}: ${v(i)}`).join(",")} };\n`);
console.log(`Registri bab: ${ids.length} bab (${ids.join(", ") || "kosong"})`);
