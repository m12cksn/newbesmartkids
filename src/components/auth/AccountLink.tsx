"use client";

import { LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { useAccess } from "./AccessProvider";

export function AccountLink() {
  const { loading, enabled, session } = useAccess();
  if (loading || !enabled) return null;
  return session
    ? <Link href="/akun" className="btn btn-ghost btn-sm btn-square gap-1 sm:btn-md sm:w-auto sm:px-3" aria-label={`Akun ${session.username}`}><UserRound className="size-4" strokeWidth={1.75} aria-hidden="true" /><span className="hidden max-w-28 truncate sm:inline">{session.displayName || session.username}</span></Link>
    : <Link href="/masuk" aria-label="Masuk" className="btn btn-ghost btn-sm btn-square gap-1 sm:btn-md sm:w-auto sm:px-3"><LogIn className="size-4" strokeWidth={1.75} aria-hidden="true" /><span className="hidden sm:inline">Masuk</span></Link>;
}
