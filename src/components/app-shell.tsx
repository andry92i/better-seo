"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bot, FileText, Globe2, LayoutDashboard, Link2, Menu, Search, Settings, Sparkles, Target, Plug, Files, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "cn";
const navigation = [
{href:"/dashboard",label:"Vue d’ensemble",icon:LayoutDashboard},
{href:"/dashboard/keywords",label:"Mots-clés",icon:Search},
{href:"/dashboard/competitors",label:"Concurrents",icon:Target},
{href:"/dashboard/audit",label:"Audit technique",icon:BarChart3},
{href:"/dashboard/content",label:"Studio de contenu",icon:FileText},
{href:"/dashboard/backlinks",label:"Backlinks",icon:Link2},
{href:"/dashboard/local",label:"SEO local",icon:Globe2},
{href:"/dashboard/reports",label:"Rapports",icon:Files}];
export function AppShell({children}:{children:React.ReactNode}) {
const pathname=usePathname(); const [open,setOpen]=useState(false);
const website=useAppStore(s=>s.profile.websiteUrl);
const domain=website.replace(/^https?:\/\//,"").split("/")[0]||"Mon projet";
return <div className="min-h-screen bg-background">
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-card focus:p-3">Aller au contenu</a>
{open&&<button className="fixed inset-0 z-30 bg-black/30 lg:hidden" aria-label="Fermer la navigation" onClick={()=>setOpen(false)}/>}
<aside className={cn("fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-card p-3 transition-transform lg:translate-x-0",open?"translate-x-0":"-translate-x-full")}>
<div className="flex items-center justify-between px-2 py-3"><Link href="/"><Brand/></Link><Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setOpen(false)} aria-label="Fermer le menu"><X className="size-4"/></Button></div>
<Link href="/dashboard/settings" onClick={()=>setOpen(false)} className="my-5 flex items-center gap-3 rounded-lg border p-3 text-sm"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent font-semibold text-primary">B</span><span className="min-w-0"><span className="block truncate font-medium" suppressHydrationWarning>{domain}</span><span className="text-[11px] text-muted-foreground">Espace personnel</span></span></Link>
<p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Votre espace SEO</p>
<nav className="space-y-1" aria-label="Navigation principale">{navigation.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} aria-current={pathname===item.href?"page":undefined} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground",pathname===item.href&&"bg-accent font-medium text-accent-foreground")}><item.icon className="size-4"/>{item.label}</Link>)}</nav>
<Link href="/workspace/assistant" onClick={()=>setOpen(false)} className="mt-5 flex items-center gap-3 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground"><Sparkles className="size-4"/>Demander à l’IA<Bot className="ml-auto size-4"/></Link>
<div className="mt-auto space-y-1 pt-6">{[{href:"integrations",label:"Intégrations",icon:Plug},{href:"settings",label:"Paramètres",icon:Settings}].map(item=><Link key={item.href} onClick={()=>setOpen(false)} href={`/dashboard/${item.href}`} className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted"><item.icon className="size-4"/>{item.label}</Link>)}<div className="mt-3 border-t px-3 pt-4 text-xs text-muted-foreground">Better SEO <span className="float-right">Version démo</span></div></div>
</aside><div className="lg:pl-60"><header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="Ouvrir le menu"><Menu className="size-5"/></Button><span className="hidden text-xs text-muted-foreground sm:inline">Espace de travail <span className="mx-3">/</span></span><span className="text-sm font-medium">{navigation.find(i=>i.href===pathname)?.label??"Mon espace"}</span></div><div className="flex items-center gap-4"><span className="rounded-full border border-amber-500/20 bg-amber-500/8 px-2.5 py-1 text-[11px] text-amber-700 dark:text-amber-300">Données de démonstration</span><Link href="/dashboard/settings" aria-label="Mon profil" className="grid size-8 shrink-0 place-items-center rounded-full border bg-secondary text-xs font-semibold">ME</Link></div></header><main id="main-content" className="mx-auto max-w-[1500px] p-4 sm:p-8">{children}</main></div></div>;
}
