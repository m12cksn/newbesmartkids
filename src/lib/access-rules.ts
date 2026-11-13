import { classes } from "@/components/home/home-data";
import { materials } from "@/data/materials";

/** Data sesi yang aman dikirim ke browser (tanpa token). */
export type SessionInfo = {
  username: string;
  displayName: string;
  role: "student" | "teacher" | "admin";
  all: boolean;
  classes: number[];
  expiresAt: string | null;
};

/** Bab pertama setiap kelas boleh dibuka tanpa login: materi dan latihan, tanpa evaluasi. */
export const freeMaterialSlugs: ReadonlySet<string> = (() => {
  const first = new Map<number, number>();
  for (const m of materials) first.set(m.classId, Math.min(first.get(m.classId) ?? Infinity, m.chapter));
  return new Set(materials.filter(m => m.chapter === first.get(m.classId)).map(m => m.slug));
})();

export const classIdBySlug = (slug: string) => classes.find(c => c.slug === slug)?.id;

export type Requirement =
  | { kind: "public" }
  | { kind: "admin" }
  | { kind: "teacher" }
  | { kind: "any" }
  | { kind: "class"; classId: number; free: boolean };

/** Aturan akses berdasarkan alamat halaman. */
export function requirementFor(pathname: string): Requirement {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "admin") return { kind: "admin" };
  if (parts[0] === "guru") return { kind: "teacher" };
  if (parts[0]?.startsWith("mastering-")) return { kind: "any" };
  if (parts[0] === "kelas" && parts.length >= 3) {
    const classId = classIdBySlug(parts[1]);
    if (!classId) return { kind: "public" };
    const materialSlug = parts[2] === "materi" ? parts[3] : parts[2];
    return { kind: "class", classId, free: Boolean(materialSlug && freeMaterialSlugs.has(materialSlug)) };
  }
  return { kind: "public" };
}

export const hasClass = (s: SessionInfo | null, classId: number) => Boolean(s && (s.all || s.role === "admin" || s.classes.includes(classId)));
export const hasAny = (s: SessionInfo | null) => Boolean(s && (s.all || s.role === "admin" || s.classes.length > 0));

/** Boleh membuka halaman (proxy). Evaluasi di bab gratis diperiksa terpisah di browser. */
export function canOpen(req: Requirement, s: SessionInfo | null) {
  if (req.kind === "public") return true;
  if (req.kind === "admin") return s?.role === "admin";
  if (req.kind === "teacher") return s?.role === "teacher" || s?.role === "admin";
  if (req.kind === "any") return hasAny(s);
  return req.free || hasClass(s, req.classId);
}

/** Boleh mengerjakan evaluasi di halaman ini. */
export function canEvaluate(pathname: string, s: SessionInfo | null) {
  const req = requirementFor(pathname);
  if (req.kind === "class") return hasClass(s, req.classId);
  return canOpen(req, s);
}

export const SESSION_COOKIE = "bsk_sesi";
