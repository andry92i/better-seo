"use client";
import { DisplayControls } from "./display-controls";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ProjectEditor } from "@/components/project-editor";
export function OnboardingWizard() {
const t = useTranslations("ui");

  return <main className="min-h-screen px-4 py-8"><div className="mx-auto mb-12 flex max-w-5xl flex-wrap gap-4 items-center justify-between"><Link href="/"><Brand/></Link><DisplayControls/><Link href="/dashboard" className="text-sm text-muted-foreground">{t("my_projects_d3d45a")}</Link></div><ProjectEditor onboarding/></main>;
}

