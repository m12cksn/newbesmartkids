"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAccess } from "@/components/auth/AccessProvider";
import { freeMaterialSlugs } from "@/lib/access-rules";
import { isProductionHost, META_PIXEL_ID, pixelPage } from "@/lib/meta-pixel";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue: unknown[][]; loaded: boolean; version: string; push: Fbq; disablePushState?: boolean };
declare global { interface Window { fbq?: Fbq; _fbq?: Fbq } }

/** Memuat skrip pixel sekali, tanpa pelacakan otomatis klik dan tanpa PageView otomatis saat pindah halaman. */
function loadPixel(): Fbq {
  if (window.fbq) return window.fbq;
  const f = function (...args: unknown[]) { if (f.callMethod) f.callMethod(...args); else f.queue.push(args); } as Fbq;
  f.push = f; f.loaded = true; f.version = "2.0"; f.queue = []; f.disablePushState = true;
  window.fbq = f; window._fbq = f;
  const s = document.createElement("script");
  s.async = true; s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  f("set", "autoConfig", false, META_PIXEL_ID);
  f("init", META_PIXEL_ID);
  return f;
}

/**
 * Pixel Meta untuk mengukur iklan. Hanya berjalan di situs produksi, di halaman untuk orang tua,
 * dan tidak pernah untuk pengguna yang sudah masuk (siswa atau admin).
 */
export function MetaPixel() {
  const pathname = usePathname();
  const { loading, session } = useAccess();
  useEffect(() => {
    if (loading || session || !isProductionHost(window.location.hostname)) return;
    const page = pixelPage(pathname, slug => freeMaterialSlugs.has(slug));
    if (!page) return;
    const fbq = loadPixel();
    fbq("track", "PageView");
    if (page.kind === "trial") fbq("track", "StartTrial", { content_name: page.slug });
  }, [pathname, loading, session]);
  return null;
}
