import type { Metadata } from "next";
import { SeoChat } from "@/components/seo-chat";

export const metadata: Metadata = { title: "Workspace SEO" };

export default async function WorkspacePage({ params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  return <SeoChat action={action} />;
}
