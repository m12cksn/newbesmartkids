import type { ReactNode } from "react";
import { Suspense } from "react";
import { PresenterMode } from "@/components/learn/PresenterMode";
import { ScratchPad } from "@/components/learn/ScratchPad";

/** Kertas coret tersedia di setiap halaman bab; mode menjelaskan hanya muncul untuk admin. */
export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}<Suspense fallback={null}><ScratchPad /></Suspense><PresenterMode /></>;
}
