import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: { default: "Better SEO — Votre ingénieur SEO IA", template: "%s · Better SEO" },
  description: "Transformez vos données Search Console et Analytics en stratégie SEO priorisée et actions mesurables.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col"><Providers><NuqsAdapter><NextTopLoader color="#2563eb" height={4} showSpinner={true} />{children}<Toaster /></NuqsAdapter></Providers></body>
    </html>
  );
}
