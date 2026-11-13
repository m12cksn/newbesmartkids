import type { Metadata } from "next";
import "./globals.css";
import { AccessProvider } from "@/components/auth/AccessProvider";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "BeSmartKids",
    template: "%s | BeSmartKids",
  },
  description: "Belajar matematika visual untuk SD dan SMP: materi Kurikulum Merdeka dengan peraga interaktif, latihan, evaluasi, dan laporan untuk orang tua.",
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "id_ID", images: [{ url: "/math-learning-overlay.png", alt: "BeSmartKids" }] },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className="h-full antialiased"><body className="min-h-full flex flex-col"><AccessProvider>{children}</AccessProvider></body></html>;
}
