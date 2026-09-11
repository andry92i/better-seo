"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BarChart3, FileText, Globe2, LayoutDashboard, Link2, Search, Settings, Target, Plug, Files, Plus, ChevronsUpDown, LogOut, UserRound, MessageSquare, Check } from "lucide-react";
import { DisplayControls } from "./display-controls";
import { useAppStore } from "@/lib/store";
import { useProject } from "@/lib/project-client";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// sidebar-07 composition, with the authenticated user's projects and conversations.
export function AppShell({ children }: { children: React.ReactNode }) {
  return <SidebarProvider><WorkspaceShell>{children}</WorkspaceShell></SidebarProvider>;
}
function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("ui");
  const w = useTranslations("workspace");
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const { project, projects } = useProject();
  const { data: session } = authClient.useSession();
  const selectProject = useAppStore(s => s.selectProject);
  const close = () => setOpenMobile(false);
  const navigation = [
    { href: "/dashboard", label: t("overview_de0d96"), icon: LayoutDashboard },
    { href: "/dashboard/keywords", label: t("keywords_712010"), icon: Search },
    { href: "/dashboard/competitors", label: t("competitors_7f6fad"), icon: Target },
    { href: "/dashboard/audit", label: t("technical_audit_084fe6"), icon: BarChart3 },
    { href: "/dashboard/content", label: t("content_studio_8d0595"), icon: FileText },
    { href: "/dashboard/backlinks", label: t("backlinks_4eb5c8"), icon: Link2 },
    { href: "/dashboard/local", label: t("local_seo_70cad4"), icon: Globe2 },
    { href: "/dashboard/reports", label: t("reports_db7d9f"), icon: Files },
  ];
  const settings = [
    { href: "/dashboard/integrations", label: t("integrations_4f90e5"), icon: Plug },
    { href: "/dashboard/settings", label: t("settings_ef8f01"), icon: Settings },
    { href: "/dashboard/profile", label: t("my_profile_faa6d3"), icon: UserRound },
  ];
  const name = session?.user.name || w("account");
  const initials = name.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase();
  const avatar = <Avatar><AvatarImage src={session?.user.image ?? undefined} alt=""/><AvatarFallback>{initials}</AvatarFallback></Avatar>;
  const links = (items: typeof navigation) => <SidebarMenu>{items.map(item => <SidebarMenuItem key={item.href}><SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}><Link href={item.href} onClick={close} aria-current={pathname === item.href ? "page" : undefined}><item.icon/><span>{item.label}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu>;
  return <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-card focus:p-3">{t("skip_to_content_ba1ca9")}</a>
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader><SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger asChild><SidebarMenuButton size="lg" tooltip={t("active_project_9ed9cb")}>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><BarChart3 className="size-4"/></span>
        <span className="grid flex-1 text-left"><span className="truncate font-semibold">{project?.name ?? "Better SEO"}</span><span className="truncate text-xs text-muted-foreground">{t("active_project_9ed9cb")}</span></span><ChevronsUpDown className="ml-auto"/>
      </SidebarMenuButton></DropdownMenuTrigger><DropdownMenuContent side={isMobile ? "bottom" : "right"} align="start" className="w-64"><DropdownMenuLabel>{t("active_project_9ed9cb")}</DropdownMenuLabel><DropdownMenuGroup>{projects.map(p => <DropdownMenuItem key={p.id} onSelect={() => { selectProject(p.id); close(); }}><Globe2/><span className="truncate">{p.name}</span>{p.id === project?.id && <Check className="ml-auto"/>}</DropdownMenuItem>)}</DropdownMenuGroup><DropdownMenuSeparator/><DropdownMenuGroup><DropdownMenuItem asChild><Link href="/onboarding" onClick={close}><Plus/>{w("addProject")}</Link></DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu></SidebarHeader>
      <SidebarContent>
        <SidebarGroup><SidebarGroupLabel>{t("your_seo_workspace_56aca5")}</SidebarGroupLabel>{links(navigation)}</SidebarGroup>
        <SidebarGroup><SidebarGroupLabel>{w("assistant")}</SidebarGroupLabel><SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild tooltip={w("newConversation")} isActive={pathname.startsWith("/workspace")}><Link href="/workspace/assistant" onClick={e => { e.preventDefault(); close(); router.push("/workspace/assistant?fresh=" + Date.now()); }}><Plus/><span>{w("newConversation")}</span></Link></SidebarMenuButton></SidebarMenuItem>{project?.conversations.slice(0, 5).map(c => <SidebarMenuItem key={c.id}><SidebarMenuButton asChild tooltip={c.title}><Link href={`/workspace/${encodeURIComponent(c.workflow)}?conversation=${encodeURIComponent(c.id)}`} onClick={close}><MessageSquare/><span>{c.title}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup>
        <SidebarGroup className="mt-auto">{links(settings)}</SidebarGroup>
      </SidebarContent>
      <SidebarFooter><SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger asChild><SidebarMenuButton size="lg" tooltip={name}>{avatar}<span className="grid flex-1 text-left"><span className="truncate font-semibold">{name}</span><span className="truncate text-xs text-muted-foreground">{session?.user.email}</span></span><ChevronsUpDown className="ml-auto"/></SidebarMenuButton></DropdownMenuTrigger><DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="w-64"><DropdownMenuLabel className="truncate">{session?.user.email}</DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuGroup><DropdownMenuItem asChild><Link href="/dashboard/profile" onClick={close}><UserRound/>{t("my_profile_faa6d3")}</Link></DropdownMenuItem><DropdownMenuItem onSelect={async () => { const result = await authClient.signOut(); if (!result.error) { router.push("/login"); router.refresh(); } }}><LogOut/>{t("sign_out_903dca")}</DropdownMenuItem></DropdownMenuGroup></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu></SidebarFooter>
      <SidebarRail aria-label={w("toggleNavigation")} title={w("toggleNavigation")}/>
    </Sidebar>
    <SidebarInset className="min-w-0"><header className="sticky top-0 z-20 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6"><div className="flex min-w-0 items-center gap-3"><SidebarTrigger aria-label={w("toggleNavigation")}/><Separator orientation="vertical" className="h-4"/><span className="truncate text-sm font-medium">{[...navigation, ...settings].find(i => i.href === pathname)?.label ?? w("assistant")}</span></div><DisplayControls/></header><div id="main-content" className="mx-auto w-full min-w-0 max-w-[1500px] p-4 sm:p-6">{children}</div></SidebarInset>
  </>;
}
