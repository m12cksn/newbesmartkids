import type { ReactNode } from "react";
import { Suspense } from "react";
import { ScratchPad } from "@/components/learn/ScratchPad";

/** Kertas coret tersedia di setiap halaman bab dan latihan harian. */
export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}<Suspense fallback={null}><ScratchPad /></Suspense></>;
}
