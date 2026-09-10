"use client";
// Adapted from Vercel AI Elements (MIT), packages/elements/src/tool.tsx.
// Native details/summary keeps disclosures keyboard accessible without extra JS.
import type { ComponentProps } from "react";
import type { ToolUIPart } from "ai";
import { CheckCircle2, ChevronDown, Clock3, CircleAlert, BookOpen } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
export function Tool({className,...props}:ComponentProps<"details">){
  return <details className={cn("group/tool my-2 w-full rounded-xl border bg-muted/30",className)} {...props}/>;
}
export function ToolHeader({title,state}:{title:string;state:ToolUIPart["state"]}){
  const fr=useLocale()==="fr";
  const complete=state==="output-available",failed=state==="output-error"||state==="output-denied";
  const label=complete?(fr?"Terminé":"Complete"):failed?(fr?"Indisponible":"Unavailable"):(fr?"En cours":"Running");
  const Icon=complete?CheckCircle2:failed?CircleAlert:Clock3;
  return <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 p-3 text-sm [&::-webkit-details-marker]:hidden">
    <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true"/><span className="min-w-0 flex-1 font-medium">{title}</span>
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5"/>{label}</span><ChevronDown className="size-4 shrink-0 transition-transform group-open/tool:rotate-180" aria-hidden="true"/>
  </summary>;
}
export function ToolContent({className,...props}:ComponentProps<"div">){return <div className={cn("border-t px-4 py-3 text-xs leading-6 text-muted-foreground",className)} {...props}/>;}
