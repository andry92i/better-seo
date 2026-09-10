"use client";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ProjectEditor } from "@/components/project-editor";
export function OnboardingWizard() {
  return <main className="min-h-screen px-4 py-8"><div className="mx-auto mb-12 flex max-w-5xl items-center justify-between"><Link href="/"><Brand/></Link><Link href="/dashboard" className="text-sm text-muted-foreground">Mes projets</Link></div><ProjectEditor onboarding/></main>;
}
