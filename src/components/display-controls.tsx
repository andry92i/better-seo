"use client";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Languages, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { isLocale, localeCookie } from "@/i18n/locale";
export function DisplayControls() {
  const locale = useLocale(), router = useRouter(), pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [pending, startTransition] = useTransition();
  const french = locale === "fr";
  return <div className="flex shrink-0 items-center gap-1 rounded-full border bg-card p-1 text-foreground">
    <label className="flex min-h-9 items-center gap-1 pl-2">
      <Languages aria-hidden="true" className="size-4 text-muted-foreground"/>
      <span className="sr-only">{french ? "Langue" : "Language"}</span>
      <select aria-label={french ? "Langue" : "Language"} disabled={pending} value={locale} className="max-w-20 rounded-md bg-card py-2 pr-1 text-xs font-medium outline-offset-2" onChange={e=>{
        const value=e.target.value;if(!isLocale(value))return;
        document.cookie=`${localeCookie}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==="https:"?"; Secure":""}`;
        startTransition(()=>{ if (/^\/(en|fr)\/resources(?:\/|$)/.test(pathname)) router.push(pathname.replace(/^\/(en|fr)/, `/${value}`)); else router.refresh(); });
      }}><option value="en">English</option><option value="fr">Français</option></select>
    </label>
    <Button variant="ghost" size="icon" className="size-9 rounded-full" aria-label={french ? "Changer le thème clair ou sombre" : "Switch light or dark theme"} onClick={()=>setTheme(resolvedTheme==="dark"?"light":"dark")}>
      <Sun className="size-4 dark:hidden"/><Moon className="hidden size-4 dark:block"/>
    </Button>
  </div>;
}
