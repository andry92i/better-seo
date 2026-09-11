import type { Metadata } from "next";
import { SeoChat } from "@/components/seo-chat";

export const metadata: Metadata = { title: "Workspace SEO" };

export default async function WorkspacePage({ params, searchParams }: { params: Promise<{ action: string }>; searchParams: Promise<{q?:string;conversation?:string;fresh?:string}> }) {
  const { action } = await params;
  const { q, conversation, fresh } = await searchParams;
  const initialPrompt = typeof q === "string" ? q.slice(0, 1000) : "";
  return <SeoChat key={action + initialPrompt + (typeof fresh === "string" ? fresh.slice(0,30) : "")} action={action} initialPrompt={initialPrompt} conversationId={typeof conversation === "string" ? conversation.slice(0,100) : undefined} />;
}
