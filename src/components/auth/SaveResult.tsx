"use client";

import { CloudCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccess } from "./AccessProvider";

const PATH = /^\/kelas\/[a-z0-9-]+\/materi\/[a-z0-9-]+|^\/mastering-(penjumlahan-pengurangan|perkalian-pembagian)\/level-[1-3]$/;

/**
 * Simpan hasil latihan atau evaluasi ke akun yang sedang masuk (sekali per penyelesaian).
 * `once` mencegah penyimpanan ganda di perangkat ini, misalnya paket latihan harian yang diperiksa berkali-kali.
 */
export function SaveResult({ kind, part, correct, total, title, once }: { kind: "latihan" | "evaluasi" | "harian"; part: string; correct: number; total: number; title?: string; once?: string }) {
  const { session, loading } = useAccess();
  const [state, setState] = useState<"idle" | "saved" | "failed">("idle");
  const sent = useRef(false);
  useEffect(() => {
    if (loading || !session || sent.current) return;
    const path = window.location.pathname;
    if (!PATH.test(path)) return;
    sent.current = true;
    const flag = once ? `bsk-saved:${session.username}:${once}` : "";
    try { if (flag && localStorage.getItem(flag)) { void Promise.resolve().then(() => setState("saved")); return; } } catch { /* penyimpanan lokal tidak tersedia */ }
    const t = title ?? document.querySelector("main h1")?.textContent?.trim() ?? "";
    fetch("/api/hasil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path, title: t, kind, part, correct, total }) })
      .then(r => { setState(r.ok ? "saved" : "failed"); if (r.ok && flag) try { localStorage.setItem(flag, "1"); } catch { /* abaikan */ } })
      .catch(() => setState("failed"));
  }, [loading, session, kind, part, correct, total, title, once]);
  if (!session) return null;
  return <p role="status" className="flex items-center justify-center gap-1.5 text-sm text-base-content/70">
    {state === "saved" ? <><CloudCheck className="size-4 text-success" aria-hidden="true" />Nilai tersimpan di riwayat akunmu.</> : state === "failed" ? "Nilai belum tersimpan. Periksa koneksi internet." : "Menyimpan nilai…"}
  </p>;
}
