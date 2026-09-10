"use client";
import { DisplayControls } from "./display-controls";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bot, FileText, Globe2, LayoutDashboard, Link2, Menu, Search, Settings, Sparkles, Target, Plug, Files, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useProject } from "@/lib/project-client";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export function AppShell({children}:{children:React.ReactNode}) {
const t = useTranslations("ui");

const navigation = [
{href:"/dashboard",label:t("overview_de0d96"),icon:LayoutDashboard},
{href:"/dashboard/keywords",label:t("keywords_712010"),icon:Search},
{href:"/dashboard/competitors",label:t("competitors_7f6fad"),icon:Target},
{href:"/dashboard/audit",label:t("technical_audit_084fe6"),icon:BarChart3},
{href:"/dashboard/content",label:t("content_studio_8d0595"),icon:FileText},
{href:"/dashboard/backlinks",label:t("backlinks_4eb5c8"),icon:Link2},
{href:"/dashboard/local",label:t("local_seo_70cad4"),icon:Globe2},
{href:"/dashboard/reports",label:t("reports_db7d9f"),icon:Files}];

const pathname=usePathname(); const router=useRouter(); const [open,setOpen]=useState(false);
const { project, projects } = useProject();
const selectProject=useAppStore(s=>s.selectProject);

const website=project?.websiteUrl??"";
const domain=website.replace(/^https?:\/\//,"").split("/")[0]||t("my_project_1cc699");
return <div className="min-h-screen bg-background">
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-card focus:p-3">{t("skip_to_content_ba1ca9")}</a>
{open&&<button className="fixed inset-0 z-30 bg-black/30 lg:hidden" aria-label={t("close_navigation_d462ee")} onClick={()=>setOpen(false)}/>}
<aside className={cn("fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto border-r bg-card p-3 transition-transform lg:translate-x-0",open?"translate-x-0":"-translate-x-full")}>
<div className="flex items-center justify-between px-2 py-3"><Link href="/"><Brand/></Link><Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setOpen(false)} aria-label={t("close_menu_177b10")}><X className="size-4"/></Button></div>
<Link href="/dashboard/settings" onClick={()=>setOpen(false)} className="my-5 flex items-center gap-3 rounded-lg border p-3 text-sm"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent font-semibold text-primary">B</span><span className="min-w-0"><span className="block truncate font-medium" suppressHydrationWarning>{domain}</span><span className="text-[11px] text-muted-foreground">{t("personal_workspace_019b83")}</span></span></Link>
<label className="mb-4 grid gap-2 px-2 text-xs text-muted-foreground">{t("active_project_9ed9cb")}<select className="form-select" value={project?.id??""} onChange={e=>selectProject(e.target.value)}>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><Link href="/onboarding" className="mb-5 px-3 text-xs text-primary">{t("_add_a_project_aa16c8")}</Link><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">{t("your_seo_workspace_56aca5")}</p>
<nav className="space-y-1" aria-label={t("main_navigation_aa3ac5")}>{navigation.map(item=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} aria-current={pathname===item.href?"page":undefined} className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground",pathname===item.href&&"bg-accent font-medium text-accent-foreground")}><item.icon className="size-4"/>{item.label}</Link>)}</nav>
<Link href="/workspace/assistant" onClick={()=>setOpen(false)} className="mt-5 flex items-center gap-3 rounded-lg bg-primary px-3 py-3 text-sm font-medium text-primary-foreground"><Sparkles className="size-4"/>{t("ask_ai_b40f79")}<Bot className="ml-auto size-4"/></Link>
<div className="mt-auto space-y-1 pt-6">{[{href:"integrations",label:t("integrations_4f90e5"),icon:Plug},{href:"settings",label:t("settings_ef8f01"),icon:Settings}].map(item=><Link key={item.href} onClick={()=>setOpen(false)} href={`/dashboard/${item.href}`} className="flex items-center gap-3 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted"><item.icon className="size-4"/>{item.label}</Link>)}<div className="mt-3 border-t px-3 pt-4 text-xs text-muted-foreground">Better SEO <span className="float-right">Claude SEO</span></div></div>
</aside><div className="lg:pl-60"><header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center py-2 justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={t("open_menu_43c7e1")}><Menu className="size-5"/></Button><span className="hidden text-xs text-muted-foreground sm:inline">{t("workspace_24aa02")} <span className="mx-3">/</span></span><span className="hidden text-sm font-medium sm:block">{navigation.find(i=>i.href===pathname)?.label??t("my_workspace_618116")}</span></div><div className="flex shrink-0 items-center gap-2"><DisplayControls/><button className="text-xs text-muted-foreground" onClick={async()=>{await authClient.signOut();router.push("/login");router.refresh();}}>{t("sign_out_903dca")}</button><Link href="/dashboard/settings" aria-label={t("my_profile_faa6d3")} className="grid size-8 shrink-0 place-items-center rounded-full border bg-secondary text-xs font-semibold">ME</Link></div></header><main id="main-content" className="mx-auto min-w-0 max-w-[1500px] p-4 sm:p-8">{children}</main></div></div>;
}

