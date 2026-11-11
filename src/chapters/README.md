# Bab baru: satu folder per bab

Setiap bab baru dibuat di folder sendiri agar beberapa sesi (Claude, ChatGPT/Codex, atau manusia) bisa bekerja bersamaan tanpa mengedit file yang sama.

```
src/chapters/<material-id>/
  meta.ts       // export default MaterialItem (wajib addedAt: "YYYY-MM-DD")
  Chapter.tsx   // export default komponen bab (boleh re-export dari src/components/learn)
```

- `<material-id>` mengikuti pola `kelas-<n>-<nama>` dan harus unik. Slug juga harus unik; build gagal jika ada id atau slug ganda.
- Jangan menambah entri di `src/data/materials.ts` dan jangan menambah cabang `if` di `src/app/kelas/[slug]/materi/[materiSlug]/page.tsx`. Katalog kelas, beranda (materi terbaru) dan rute halaman membaca folder ini otomatis.
- Daftar otomatis dibuat oleh `scripts/gen-chapter-registry.mjs` ke `src/chapters/registry/` (tidak di-commit). Skrip berjalan otomatis sebelum `npm run dev`, `npm run build` dan setelah `npm install`; jalankan `npm run chapters` setelah menambah folder jika perlu.
- File lain milik bab (data, komponen, skrip verify/smoke, workflow CI, dokumen) juga diberi nama khusus bab tersebut.

Contoh `meta.ts`:

```ts
import type { MaterialItem } from "@/data/materials";
const meta: MaterialItem = { id: "kelas-2-contoh", classId: 2, chapter: 7, slug: "contoh-bab", title: "Contoh Bab", topic: "Bilangan", description: "…", videoStatus: "coming_soon", summary: "…", questionIds: [], addedAt: "2026-11-12" };
export default meta;
```

Contoh `Chapter.tsx`:

```tsx
export { default } from "@/components/learn/GradeTwoContoh";
```
