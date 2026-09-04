"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, FileText, Globe2, LayoutDashboard, Link2, Menu, Search, Settings, Sparkles, Target } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/workspace/keyword-research", label: "Mots-clés", icon: Search },
  { href: "/workspace/competitor-gap", label: "Concurrents", icon: Target },
  { href: "/workspace/technical-sprint", label: "Audit technique", icon: BarChart3 },
  { href: "/workspace/rewrite-landing", label: "Studio de contenu", icon: FileText },
  { href: "/workspace/backlinks", label: "Backlinks", icon: Link2 },
  { href: "/workspace/local-seo", label: "SEO local", icon: Globe2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-muted/35">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background px-3 py-5 lg:block">
        <Brand className="px-2" />
        <div className="mt-7 rounded-xl border bg-card p-3"><div className="flex items-center gap-2 text-xs font-medium"><Sparkles className="size-3.5 text-primary" /> Ingénieur SEO IA</div><p className="mt-1.5 text-xs leading-5 text-muted-foreground">15 spécialistes actifs sur votre projet</p></div>
        <nav className="mt-5 space-y-1" aria-label="Navigation principale">{navigation.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground", active && "bg-accent text-accent-foreground font-medium")}><item.icon className="size-4" />{item.label}</Link>; })}</nav>
        <div className="absolute bottom-5 left-3 right-3 space-y-1"><Link href="/workspace/assistant" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"><Bot className="size-4" />Assistant SEO</Link><Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"><Settings className="size-4" />Paramètres</Link></div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/92 px-4 backdrop-blur sm:px-7"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu"><Menu className="size-5" /></Button><div><p className="text-sm font-medium">ViralGrok</p><p className="text-xs text-muted-foreground">viralgrok.com</p></div></div><div className="flex items-center gap-2"><span className="hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" /> Données synchronisées</span><span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold">AD</span></div></header>
        <main className="mx-auto max-w-[1500px] p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
