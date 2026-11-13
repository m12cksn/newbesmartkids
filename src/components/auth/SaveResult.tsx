"use client";

import { CloudCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAccess } from "./AccessProvider";

/** Simpan hasil latihan atau evaluasi ke akun yang sedang masuk (sekali per penyelesaian). */
export function SaveResult({ kind, part, correct, total }: { kind: "latihan" | "evaluasi"; part: string; correct: number; total: number }) {
  const { session, loading } = useAccess();
  const [state, setState] = useState<"idle" | "saved" | "failed">("idle");
  const sent = useRef(false);
  useEffect(() => {
    if (loading || !session || sent.current) return;
    const path = window.location.pathname;
    if (!/^\/kelas\/[a-z0-9-]+\/materi\/[a-z0-9-]+/.test(path)) return;
    sent.current = true;
    const title = document.querySelector("main h1")?.textContent?.trim() ?? "";
    fetch("/api/hasil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path, title, kind, part, correct, total }) })
      .then(r => setState(r.ok ? "saved" : "failed")).catch(() => setState("failed"));
  }, [loading, session, kind, part, correct, total]);
  if (!session) return null;
  return <p role="status" className="flex items-center gap-1.5 text-sm text-base-content/70">
    {state === "saved" ? <><CloudCheck className="size-4 text-success" aria-hidden="true" />Nilai tersimpan di riwayat akunmu.</> : state === "failed" ? "Nilai belum tersimpan. Periksa koneksi internet." : "Menyimpan nilai…"}
  </p>;
}
