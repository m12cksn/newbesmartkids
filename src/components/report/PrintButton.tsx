"use client";
import type { ReactNode } from "react";

export function PrintButton({ children }: { children: ReactNode }) {
  return <button type="button" onClick={() => window.print()} className="btn btn-outline btn-sm gap-1.5 print:hidden">{children}</button>;
}
