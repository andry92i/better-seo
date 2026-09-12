import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { siteUrl } from "@/lib/site";
export const metadata: Metadata = {
  title: { absolute: "SEO audits and content strategy with Google data | Better SEO" },
  description: "Connect Search Console and Analytics, inspect your website and turn observed SEO issues into prioritized actions and reviewable content drafts.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Better SEO", url: "/", title: "Better SEO — Turn search data into action", description: "Analyze your website, prioritize SEO work and draft content using your Search Console and Analytics data." },
  twitter: { card: "summary_large_image", title: "Better SEO", description: "Turn your Google search data into an actionable SEO strategy." },
};
export default function Home() {
  const schema = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Better SEO", url: siteUrl, applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "SEO analysis and content planning using Google Search Console and Analytics data." };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}/><Landing /></>;
}
