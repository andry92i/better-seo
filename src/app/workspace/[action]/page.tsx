import type { Metadata } from "next";
import { SeoChat } from "@/components/seo-chat";

export const metadata: Metadata = { title: "Workspace SEO" };

export default async function WorkspacePage({ params, searchParams }: { params: Promise<{ action: string }>; searchParams: Promise<{q?:string}> }) {
  const { action } = await params;
  const { q } = await searchParams;
  const initialPrompt = typeof q === "string" ? q.slice(0, 1000) : "";
  return <SeoChat key={action + initialPrompt} action={action} initialPrompt={initialPrompt} />;
}
