import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: { default: locale === "fr" ? "Better SEO — Votre ingénieur SEO IA" : "Better SEO — Your AI SEO engineer", template: "%s · Better SEO" },
    description: locale === "fr" ? "Transformez vos données Search Console et Analytics en stratégie SEO priorisée et actions mesurables." : "Turn Search Console and Analytics data into a prioritized SEO strategy and measurable actions.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col"><NextIntlClientProvider><Providers><NuqsAdapter><NextTopLoader color="#2563eb" height={4} showSpinner={true} />{children}<Toaster /></NuqsAdapter></Providers></NextIntlClientProvider></body>
    </html>
  );
}

