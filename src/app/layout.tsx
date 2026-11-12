import type { Metadata } from "next";
import "./globals.css";
import { AccessProvider } from "@/components/auth/AccessProvider";

export const metadata: Metadata = {
  title: {
    default: "BeSmartKids",
    template: "%s | BeSmartKids",
  },
  description: "Belajar matematika visual untuk kelas 1 sampai 12.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className="h-full antialiased"><body className="min-h-full flex flex-col"><AccessProvider>{children}</AccessProvider></body></html>;
}
